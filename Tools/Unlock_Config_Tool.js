"ui";
auto(); // auto.waitFor() was abandoned here, as it may cause problems sometimes

/**
 * @overview graphic configuration tool graphic configuration tool
 * @description to require the unlock module (MODULE_UNLOCK.js) and unlock the device, try the code as @example showed
 *
 * @example require("./MODULE_UNLOCK").unlock();
 *
 * @last_modified Nov 14, 2019
 * @author {@link https://github.com/SuperMonster003}
 */

// set up the device screen in a portrait orientation
activity.setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

// window mostly for browser, global mostly for Node.js, and __global__ for Auto.js
__global__ = typeof __global__ === "undefined" ? this : __global__;

let _require = require.bind(__global__); // copy __global__.require(){}

require = function (path) {
    path = "./" + path.replace(/^([./]*)(?=\w)/, "").replace(/(\.js)*$/, "") + ".js"; // "./folderA/folderB/module.js"
    for (let i = 0, len = path.match(/\//g).length; i < len; i += 1) {
        let _path = path;
        for (let j = 0; j < i; j += 1) _path = _path.replace(/\/\w+?(?=\/)/, "");
        for (let j = 0; j < 3; j += 1) {
            if (files.exists(_path)) return _require(_path);
            if (!files.path(_path).match(/\/Modules\//)) {
                let _module_path = files.path(_path).replace(/\/(.+?\.js$)/, "\/Modules/$1");
                if (files.exists(_module_path)) return _require(_module_path);
            }
            _path = "." + _path;
        }
    }
}; // override __global__.require(){}

// given that there are bugs with dialogs modules in old auto.js versions like 4.1.0/5 and 4.1.1/2
// in another way, dialogs.builds() could make things easier sometimes
let dialogs = (require("../Modules/__dialogs__pro_v6") || loadInternalModuleDialog)(runtime, __global__);

threads.starts = (f, error_msg_consume_flag) => {
    try {
        return threads.start(f);
    } catch (e) {
        if (!e.message.match(/script exiting/) && !error_msg_consume_flag) throw Error(e);
    }
};

let {
    getDisplayParams,
    equalObjects,
    deepCloneObject,
    alertTitle,
    waitForAction,
    classof,
    keycode,
} = require("../Modules/MODULE_MONSTER_FUNC") || loadInternalModuleMonsterFunc();

let session_params = {};
let view_pages = {};
let dynamic_views = [];

let {WIDTH, cX} = getDisplayParams();

let DEFAULT_UNLOCK = (require("../Modules/MODULE_DEFAULT_CONFIG") || {}).unlock
    || (require("../Modules/MODULE_UNLOCK") || {}).DEFAULT
    || {
        unlock_code: null,
        unlock_max_try_times: 20,
        unlock_pattern_strategy: "segmental",
        unlock_pattern_size: 3,
        unlock_pattern_swipe_time_segmental: 120,
        unlock_pattern_swipe_time_solid: 200,
        unlock_dismiss_layer_bottom: 0.8,
        unlock_dismiss_layer_top: 0.2,
        unlock_dismiss_layer_swipe_time: 110,
    }; // updated at Nov 14, 2019

let DEFAULT_SETTINGS = (require("../Modules/MODULE_DEFAULT_CONFIG") || {}).settings
    || {
        item_area_width: 0.78,
        subhead_color: "#03a6ef",
        subhead_highlight_color: "#bf360c",
        info_color: "#78909c",
        title_default_color: "#202020",
        title_caution_color: "#b71c1c",
        title_bg_color: "#03a6ef",
        list_title_bg_color: "#afefff",
        btn_on_color: "#ffffff",
        btn_off_color: "#bbcccc",
        split_line_color: "#bbcccc",
        caution_btn_color: "#ff3d00",
        attraction_btn_color: "#7b1fa2",
        warn_btn_color: "#f57c00",
        content_default_color: "#757575",
        content_dark_color: "#546e7a",
        content_warn_color: "#ad1457",
        hint_btn_dark_color: "#a1887f",
        hint_btn_bright_color: "#26a69a",
    };  // updated at Nov 14, 2019

let encrypt = new (require("../Modules/MODULE_PWMAP") || loadInternalModulePWMAP())().pwmapEncrypt;

let storage_unlock = (require("../Modules/MODULE_STORAGE") || loadInternalModuleStorage()).create("unlock");

let storage_config = initStorageConfig();
let session_config = deepCloneObject(storage_config);

let needSave = () => !equalObjects(session_config, storage_config);
let saveNow = () => storage_unlock.put("config", storage_config = deepCloneObject(session_config));
let saveSession = (key, value, quiet_flag) => {
    if (value !== undefined) {
        if (classof(value, "Object") && classof(session_config[key], "Object")) {
            Object.keys(value).forEach((k) => {
                let v = value[k];
                if (typeof v === "object") {
                    session_config[key][k] = Object.assign({}, session_config[key][k], v);
                } else {
                    session_config[key][k] = v;
                }
            })
        } else session_config[key] = value;
    }
    if (quiet_flag) return;
    updateAllValues();
    threads.starts(function () {
        let btn_save = null;
        waitForAction(() => btn_save = session_params["homepage_btn_save"], 10000, 80);
        ui.post(() => needSave() ? btn_save.switch_on() : btn_save.switch_off());
    });
};
let updateAllValues = (only_new_flag) => {
    let raw_idx = session_params.dynamic_views_raw_idx || 0;
    dynamic_views.slice(only_new_flag ? raw_idx : 0).forEach(view => view.updateOpr(view));
    if (only_new_flag) session_params.dynamic_views_raw_idx = dynamic_views.length;
};

let defs = Object.assign({}, DEFAULT_SETTINGS, {
    homepage_title: "自动解锁配置",
    item_area_width: cX(DEFAULT_SETTINGS.item_area_width) + "px",
    title_bg_color: "#000000",
    dialog_contents: (require("../Modules/MODULE_TREASURY_VAULT") || loadInternalDialogContents()).dialog_contents,
});

initUI("#000000");

setHomePage(defs.homepage_title)
    .add("subhead", new Layout("基本设置"))
    .add("button", new Layout("锁屏密码", {
        config_conj: "unlock_code",
        hint: "加载中...",
        newWindow: function () {
            let diag = dialogs.builds(["设置锁屏解锁密码", this.config_conj, ["查看示例", "hint_btn_bright_color"], "返回", "确认", 1], {
                inputHint: "密码将以密文形式存储在本地",
            });
            diag.on("neutral", () => {
                let diag_demo = dialogs.builds(["锁屏密码示例", "unlock_code_demo", ["了解点阵简化", "hint_btn_bright_color"], 0, "关闭", 1]);
                diag_demo.on("neutral", () => {
                    let diag_simp = dialogs.builds(["图案解锁密码简化", "about_pattern_simplification", 0, 0, "关闭", 1]);
                    diag_simp.on("positive", () => diag_simp.dismiss());
                    diag_simp.show();
                });
                diag_demo.on("positive", () => diag_demo.dismiss());
                diag_demo.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                let input = diag.getInputEditText().getText().toString();
                if (input && input.length < 3) return alertTitle(diag, "密码长度不小于 3 位");
                if (input && !storage_unlock.get("unlock_code_safe_dialog_prompt_prompted")) {
                    let unlock_code_safe_dialog_prompt_prompted = false;
                    let diag_prompt = dialogs.builds([
                        "风险提示", "unlock_code_safe_confirm",
                        ["了解详情", "hint_btn_bright_color"], "放弃", ["继续", "caution_btn_color"], 1, 1
                    ]);
                    diag_prompt.on("check", checked => unlock_code_safe_dialog_prompt_prompted = !!checked);
                    diag_prompt.on("neutral", () => {
                        let diag_about = dialogs.builds([
                            "设备遗失对策", "about_lost_device_solution",
                            0, 0, "关闭", 1
                        ]).on("positive", diag => diag.dismiss()).show();
                        let content_view = diag_about.getContentView();
                        let content_text_ori = content_view.getText().toString();
                        content_view.setAutoLinkMask(android.text.util.Linkify.WEB_URLS);
                        content_view.setText(content_text_ori);
                    });
                    diag_prompt.on("negative", () => diag_prompt.dismiss());
                    diag_prompt.on("positive", () => {
                        if (unlock_code_safe_dialog_prompt_prompted) {
                            storage_unlock.put("unlock_code_safe_dialog_prompt_prompted", true);
                        }
                        saveSession(this.config_conj, input ? encrypt(input) : "");
                        diag.dismiss();
                        diag_prompt.dismiss();
                    });
                    diag_prompt.show();
                } else {
                    saveSession(this.config_conj, input ? encrypt(input) : "");
                    diag.dismiss();
                }
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj] ? "已设置" : "空");
        },
    }))
    .add("split_line")
    .add("subhead", new Layout("高级设置"))
    .add("button", new Layout("最大尝试次数", {
        config_conj: "unlock_max_try_times",
        hint: "加载中...",
        newWindow: function () {
            let diag = dialogs.builds([
                "设置解锁最大尝试次数", "",
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|5<=x<=50,x∈N}"});
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = +input;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 50 || value < 5) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
        },
    }))
    .add("split_line")
    .add("subhead", new Layout("提示层页面设置", {subhead_color: "#bf360c"}))
    .add("button", new Layout("上滑时长", {
        config_conj: "unlock_dismiss_layer_swipe_time",
        hint: "加载中...",
        newWindow: function () {
            let diag = dialogs.builds([
                "提示层页面上滑时长", this.config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|110<=x<=1000,x∈N}"});
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = +input;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 1000 || value < 110) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString() + " ms");
        },
    }))
    .add("button", new Layout("起点位置", {
        config_conj: "unlock_dismiss_layer_bottom",
        hint: "加载中...",
        newWindow: function () {
            let diag = dialogs.builds([
                "提示层页面起点位置", this.config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|0.5<=x<=0.95,x∈R+}"});
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                input = +input;
                if (isNaN(input)) return alertTitle(dialog, "输入值类型不合法");
                let value = +(input.toFixed(2));
                if (value > 0.95 || value < 0.5) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            let value = (session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]) * 100;
            view._hint.text(value.toString() + "% H");
        },
    }))
    .add("button", new Layout("终点位置", {
        config_conj: "unlock_dismiss_layer_top",
        hint: "加载中...",
        newWindow: function () {
            let diag = dialogs.builds([
                "提示层页面终点位置", this.config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|0.05<=x<=0.3,x∈R+}"});
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                input = +input;
                if (isNaN(input)) return alertTitle(dialog, "输入值类型不合法");
                let value = +(input.toFixed(2));
                if (value > 0.3 || value < 0.05) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            let value = (session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]) * 100;
            view._hint.text(value.toString() + "% H");
        },
    }))
    .add("split_line")
    .add("subhead", new Layout("图案解锁设置", {subhead_color: "#bf360c"}))
    .add("button", new Layout("滑动策略", {
        config_conj: "unlock_pattern_strategy",
        hint: "加载中...",
        map: {
            "segmental": "叠加路径", // gestures()
            "solid": "连续路径", // gesture()
        },
        newWindow: function () {
            let map = this.map;
            let map_keys = Object.keys(map);
            let diag = dialogs.builds(["图案解锁滑动策略", "", ["了解详情", "hint_btn_bright_color"], "返回", "确认修改", 1], {
                items: map_keys.slice().map(value => map[value]),
                itemsSelectMode: "single",
                itemsSelectedIndex: map_keys.indexOf((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString()),
            });
            diag.on("neutral", () => {
                let diag_about = dialogs.builds(["关于图案解锁滑动策略", "about_unlock_pattern_strategy", 0, 0, "关闭", 1]);
                diag_about.on("positive", () => diag_about.dismiss());
                diag_about.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                saveSession(this.config_conj, map_keys[diag.selectedIndex]);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text(this.map[(session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString()]);
        },
    }))
    .add("button", new Layout("滑动时长", {
        config_conj: () => "unlock_pattern_swipe_time_"
            + (session_config.unlock_pattern_strategy || DEFAULT_UNLOCK.unlock_pattern_strategy),
        hint: "加载中...",
        newWindow: function () {
            let config_conj = this.config_conj();
            let diag = dialogs.builds([
                "设置图案解锁滑动时长", config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|120<=x<=3000,x∈N}"});
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = +input;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 3000 || value < 120) return alertTitle(dialog, "输入值范围不合法");
                saveSession(config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            let config_conj = this.config_conj();
            view._hint.text((session_config[config_conj] || DEFAULT_UNLOCK[config_conj]).toString() + " ms");
        },
    }))
    .add("button", new Layout("点阵边长", {
        config_conj: "unlock_pattern_size",
        hint: "加载中...",
        newWindow: function () {
            let diag = dialogs.builds([
                "设置图案解锁边长", this.config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|3<=x<=6,x∈N}"});
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = +input;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 6 || value < 3) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
        },
    }))
;

ui.emitter.on("back_pressed", e => {
    if (!needSave()) return;
    e.consumed = true; // make default "back" dysfunctional
    let diag = dialogs.builds([
        "自动解锁配置未保存", "确定要退出吗",
        "返回", ["强制退出", "caution_btn_color"], ["保存并退出", "hint_btn_bright_color"], 1,
    ]);
    let dismissDiag = (save_flag, exit_flag) => {
        if (save_flag) saveNow();
        diag.dismiss();
        if (exit_flag) exit();
    };
    diag.show()
        .on("neutral", () => dismissDiag())
        .on("negative", () => dismissDiag(false, "exit"))
        .on("positive", () => dismissDiag("save", "exit"))
    ;
});
events.on("exit", () => {
    listener.removeAllListeners();
    threads.shutDownAll();
    __global__.dialogs_pool && __global__.dialogs_pool.forEach((diag) => {
        diag.dismiss();
        diag = null;
    });
    ui.setContentView(ui.inflate(<vertical/>));
    ui.main.getParent().removeAllViews();
    ui.main.removeAllViews();
    ui.finish();
});

updateAllValues();

// tool function(s) //

function setHomePage(home_title, title_bg_color) {
    let homepage = setPage(home_title, title_bg_color, parent_view => setButtons(parent_view, "homepage",
        ["save", "SAVE", "OFF", (btn_view) => {
            if (!needSave()) return;
            saveNow();
            btn_view.switch_off();
            toast("已保存");
        }, {
            btn_off_text_color: "#666666",
            btn_off_icon_color: "#666666"
        }]
    ));

    ui.main.getParent().addView(homepage);
    homepage._back_btn_area.setVisibility(8);

    return homepage;
}

function setPage(title_param, title_bg_color, additions, options) {
    let {no_margin_bottom, no_scroll_view, check_page_state} = options || {};
    let title = title_param;
    let view_page_name = "";
    if (classof(title_param, "Array")) [title, view_page_name] = title_param;
    session_params.page_title = title;
    title_bg_color = title_bg_color || defs["title_bg_color"];
    let new_view = ui.inflate(<vertical/>);
    new_view.addView(ui.inflate(
        <linear id="_title_bg" clickable="true">
            <vertical id="_back_btn_area" marginRight="-22" layout_gravity="center">
                <linear>
                    <img src="@drawable/ic_chevron_left_black_48dp" h="31" bg="?selectableItemBackgroundBorderless" tint="#ffffff" layout_gravity="center"/>
                </linear>
            </vertical>
            <text id="_title_text" textColor="#ffffff" textSize="19" margin="16"/>
        </linear>
    ));
    new_view._back_btn_area.on("click", () => keycode(4));
    new_view._title_text.text(title);
    new_view._title_text.getPaint().setFakeBoldText(true);
    let title_bg = typeof title_bg_color === "string" ? colors.parseColor(title_bg_color) : title_bg_color;
    new_view._title_bg.setBackgroundColor(title_bg);

    if (additions) typeof additions === "function" ? additions(new_view) : additions.forEach(f => f(new_view));

    if (!no_scroll_view) {
        new_view.addView(ui.inflate(
            <ScrollView>
                <vertical id="_page_content_view"/>
            </ScrollView>
        ));
    } else {
        new_view.addView(ui.inflate(
            <vertical>
                <vertical id="_page_content_view"/>
            </vertical>
        ));
    }
    if (!no_margin_bottom) {
        new_view._page_content_view.addView(ui.inflate(
            <frame>
                <frame margin="0 0 0 8"/>
            </frame>
        ));
    }
    new_view.add = (type, item_params) => {
        let sub_view = setItem(type, item_params);
        sub_view.view_page_name = view_page_name || null;
        new_view._page_content_view.addView(sub_view);
        if (sub_view.updateOpr) dynamic_views.push(sub_view);
        return new_view;
    };

    if (view_page_name) {
        view_pages[view_page_name] = new_view;
        new_view.setTag(view_page_name);
    }

    return new_view;

    // tool function(s) //

    function setItem(type, item_params) {
        let new_view = type.match(/^split_line/) && setSplitLine(item_params) ||
            type === "subhead" && setSubHead(item_params) ||
            type === "info" && setInfo(item_params) ||
            type === "list" && setList(item_params) ||
            type === "seekbar" && setSeekbar(item_params) ||
            ui.inflate(
                <horizontal id="_item_area" padding="16 8" gravity="left|center">
                    <vertical id="_content" w="{{defs.item_area_width}}" h="40" gravity="left|center">
                        <text id="_title" textColor="#111111" textSize="16"/>
                    </vertical>
                </horizontal>
            );

        if (!item_params) return new_view;

        Object.keys(item_params).forEach((key) => {
            if (key.match(/listeners/)) return;
            let item_data = item_params[key];
            new_view[key] = typeof item_data === "function" ? item_data.bind(new_view) : item_data;
        });

        if (item_params.view_tag) new_view.setTag(item_params.view_tag);

        if (type === "radio") {
            new_view._item_area.removeAllViews();
            let radiogroup_view = ui.inflate(
                <radiogroup id="_radiogroup" orientation="horizontal" padding="-6 0 0 0"/>
            );
            item_params.view = new_view;
            let title = item_params["title"];
            let value = item_params["value"];

            title.forEach(val => {
                let radio_view = ui.inflate(<radio padding="0 0 12 0"/>);
                radio_view.setText(val);
                Object.keys(item_params.listener).forEach(listener => {
                    radio_view.on(listener, item_params.listener[listener].bind(item_params));
                });
                radiogroup_view._radiogroup.addView(radio_view);
            });
            new_view.addView(radiogroup_view);
        }

        let title = item_params["title"];
        if (typeof title === "string" && new_view._title) new_view._title.text(title);

        let hint = item_params["hint"];
        if (hint) {
            let hint_view = ui.inflate(
                <horizontal>
                    <text id="_hint" textColor="#888888" textSize="13sp"/>
                    <text id="_hint_color_indicator" visibility="gone" textColor="#888888" textSize="13sp"/>
                </horizontal>);
            typeof hint === "string" && hint_view._hint.text(hint);
            if (item_params.hint_text_color) hint_view._hint.setTextColor(item_params.hint_text_color);
            new_view._content.addView(hint_view);
        }

        if (type.match(/.*switch$/)) {
            let sw_view;
            if (type === "switch") {
                sw_view = ui.inflate(<Switch id="_switch" checked="true"/>);
                if (item_params.default_state === false) sw_view._switch.setChecked(false);
            }
            if (type === "checkbox_switch") {
                sw_view = ui.inflate(
                    <vertical padding="8 0 0 0">
                        <checkbox id="_checkbox_switch" checked="true"/>
                    </vertical>
                );
                if (item_params.default_state === false) sw_view._checkbox_switch.setChecked(false);
            }
            new_view._item_area.addView(sw_view);
            item_params.view = new_view;

            let listener_ids = item_params["listener"];
            Object.keys(listener_ids).forEach(id => {
                let listeners = listener_ids[id];
                Object.keys(listeners).forEach(listener => {
                    let callback = listeners[listener].bind(item_params);
                    if (id === "ui") ui.emitter.prependListener(listener, callback);
                    else new_view[id].on(listener, callback);
                });
            });
        } else if (type.match(/^options/)) {
            let opt_view = ui.inflate(
                <vertical id="_chevron_btn">
                    <img padding="10 0 0 0" src="@drawable/ic_chevron_right_black_48dp" h="31" bg="?selectableItemBackgroundBorderless" tint="#999999"/>
                </vertical>
            );
            new_view._item_area.addView(opt_view);
            item_params.view = new_view;
        } else if (type === "button") {
            let help_view = ui.inflate(
                <vertical id="_info_icon" visibility="gone">
                    <img src="@drawable/ic_info_outline_black_48dp" h="22" bg="?selectableItemBackgroundBorderless" tint="#888888"/>
                </vertical>
            );
            new_view._item_area.addView(help_view);
            item_params.view = new_view;
            new_view._item_area.on("click", () => typeof item_params.showWindow === "function" && item_params.showWindow());
            if (item_params.infoWindow) {
                new_view._info_icon.setVisibility(0);
                new_view._info_icon.on("click", () => item_params.infoWindow());
            }
        }

        new_view.setNextPage = (page) => item_params.next_page = page;
        new_view.getNextPage = () => item_params.next_page;
        if (item_params.title_text_color) new_view._title.setTextColor(item_params.title_text_color);
        return new_view;

        // tool function(s) //

        function setSplitLine(item) {
            let line_color = item && item["split_line_color"] || defs["split_line_color"];

            let new_view = ui.inflate(
                <vertical>
                    <horizontal id="_line" w="*" h="1sp" margin="16 8">
                    </horizontal>
                </vertical>
            );
            new_view.setTag(type);
            line_color = typeof line_color === "string" ? colors.parseColor(line_color) : line_color;
            new_view._line.setBackgroundColor(line_color);
            new_view._line.setVisibility(type.match(/invisible/) ? 8 : 0);

            return new_view;
        }

        function setSubHead(item) {
            let title = item["title"];
            let subhead_color = item["subhead_color"] || defs["subhead_color"];

            let new_view = ui.inflate(
                <vertical>
                    <text id="_text" textSize="14" margin="16 8"/>
                </vertical>
            );
            new_view._text.text(title);
            let title_color = typeof subhead_color === "string" ? colors.parseColor(subhead_color) : subhead_color;
            new_view._text.setTextColor(title_color);

            return new_view;
        }

        function setInfo(item) {
            let title = item.title;
            let info_color = item.info_color || defs.info_color;
            session_params.info_color = info_color;

            let new_view = ui.inflate(
                <horizontal>
                    <linear padding="15 10 0 0">
                        <img src="@drawable/ic_info_outline_black_48dp" h="17" w="17" margin="0 1 4 0" tint="{{session_params.info_color}}"/>
                        <text id="_info_text" textSize="13"/>
                    </linear>
                </horizontal>
            );
            new_view._info_text.text(title);
            let title_color = typeof info_color === "string" ? colors.parseColor(info_color) : subhead_color;
            new_view._info_text.setTextColor(title_color);

            return new_view;
        }

        function setList(item_params) {
            let list_title_bg_color = item_params["list_title_bg_color"] || defs["list_title_bg_color"];
            let list_head = item_params["list_head"] || [];
            list_head.forEach((o, idx) => {
                let w = o.width;
                if (!idx && !w) return session_params["list_width_0"] = ~~(0.3 * WIDTH) + "px";
                session_params["list_width_" + idx] = w ? ~~(w * WIDTH) + "px" : -2;
            });
            session_params.list_checkbox = item_params["list_checkbox"];
            let data_source_key_name = item_params["data_source_key_name"] || "unknown_key_name"; // just a key name
            let getListItemName = num => list_head[num] && Object.keys(list_head[num])[0] || null;

            // items are expected not more than 4
            for (let i = 0; i < 4; i += 1) session_params["list_item_name_" + i] = getListItemName(i);

            let new_view = ui.inflate(
                <vertical>
                    <horizontal id="_list_title_bg">
                        <horizontal h="50" w="{{session_params['list_width_0']}}" margin="8 0 0 0">
                            <checkbox id="_check_all" layout_gravity="left|center" clickable="false"/>
                        </horizontal>
                    </horizontal>
                    <vertical>
                        <list id="_list_data" fastScrollEnabled="true" focusable="true" scrollbars="none">
                            <horizontal>
                                <horizontal w="{{this.width_0}}">
                                    <checkbox id="_checkbox" checked="{{this.checked}}" h="50" margin="8 0 -16" layout_gravity="left|center" clickable="false"/>
                                    <text text="{{this.list_item_name_0}}" h="50" textSize="15" margin="16 0 0" ellipsize="end" lines="1" layout_gravity="left|center" gravity="left|center"/>
                                </horizontal>
                                <text text="{{this.list_item_name_1}}" w="{{session_params['list_width_1'] || 1}}" visibility="{{session_params['list_item_name_1'] ? 'visible' : 'gone'}}" textSize="15" h="50" margin="8 0 0 0" layout_gravity="left|center" gravity="left|center"/>
                                <text text="{{this.list_item_name_2}}" w="{{session_params['list_width_2'] || 1}}" visibility="{{session_params['list_item_name_2'] ? 'visible' : 'gone'}}" textSize="15" h="50" layout_gravity="left|center" gravity="left|center"/>
                                <text text="{{this.list_item_name_3}}" w="{{session_params['list_width_3'] || 1}}" visibility="{{session_params['list_item_name_3'] ? 'visible' : 'gone'}}" textSize="15" h="50" layout_gravity="left|center" gravity="left|center"/>
                            </horizontal>
                        </list>
                    </vertical>
                </vertical>
            );

            updateDataSource(data_source_key_name, "init", item_params.custom_data_source);
            new_view["_check_all"].setVisibility(android.view.View[item_params["list_checkbox"].toUpperCase()]);
            new_view["_list_data"].setDataSource(session_params[data_source_key_name]);
            new_view["_list_title_bg"].attr("bg", list_title_bg_color);
            new_view.setTag("list_page_view");
            list_head.forEach((title_obj, idx) => {
                let data_key_name = Object.keys(title_obj)[0];
                let list_title_view = idx ? ui.inflate(
                    <text textSize="15"/>
                ) : ui.inflate(
                    <text textSize="15" padding="{{session_params.list_checkbox === 'gone' ? 8 : 0}} 0 0 0"/>
                );

                list_title_view.setText(title_obj[data_key_name]);
                list_title_view.on("click", () => {
                    if (!session_params[data_source_key_name][0]) return;
                    session_params["list_sort_flag_" + data_key_name] = session_params["list_sort_flag_" + data_key_name]
                        || (session_params[data_source_key_name][0] < session_params[data_source_key_name][1] ? 1 : -1);

                    let session_data = session_params[data_source_key_name];
                    session_data = session_data.map((value, idx) => [idx, value]); // to attach indices
                    session_data.sort((a, b) => {
                        if (session_params["list_sort_flag_" + data_key_name] > 0) {
                            return a[1][a[1][data_key_name]] > b[1][b[1][data_key_name]];
                        } else return a[1][a[1][data_key_name]] < b[1][b[1][data_key_name]];
                    });
                    let indices_table = {};
                    session_data = session_data.map((value, idx) => {
                        indices_table[value[0]] = idx;
                        return value[1];
                    });
                    let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                    session_params[deleted_items_idx] = session_params[deleted_items_idx] || {};
                    let tmp_deleted_items_idx = {};
                    Object.keys(session_params[deleted_items_idx]).forEach(ori_idx_key => {
                        tmp_deleted_items_idx[indices_table[ori_idx_key]] = session_params[deleted_items_idx][ori_idx_key];
                    });
                    session_params[deleted_items_idx] = deepCloneObject(tmp_deleted_items_idx);
                    session_params[data_source_key_name].splice(0);
                    session_data.forEach(value => session_params[data_source_key_name].push(value));
                    session_params["list_sort_flag_" + data_key_name] *= -1;
                    // updateDataSource(data_source_key_name, "rewrite");
                });

                if (idx === 0) new_view["_check_all"].getParent().addView(list_title_view);
                else new_view["_list_title_bg"].addView(list_title_view);

                list_title_view.attr("gravity", "left|center");
                list_title_view.attr("layout_gravity", "left|center");
                list_title_view.attr("ellipsize", "end");
                list_title_view.attr("lines", "1");
                idx && list_title_view.attr("width", session_params["list_width_" + idx]);
            });

            item_params.view = new_view;

            let listener_ids = item_params["listener"] || [];
            Object.keys(listener_ids).forEach(id => {
                let listeners = listener_ids[id];
                Object.keys(listeners).forEach(listener => {
                    let callback = listeners[listener].bind(item_params);
                    if (id === "ui") ui.emitter.prependListener(listener, callback);
                    else new_view[id].on(listener, callback);
                });
            });

            if (item_params.updateOpr) new_view.updateOpr = item_params.updateOpr.bind(new_view);

            return new_view;
        }

        function setSeekbar(item_params) {
            let {title, unit, config_conj, nums} = item_params;
            let [min, max, init] = nums;
            if (isNaN(+min)) min = 0;
            if (isNaN(+init)) {
                let _init = session_config[config_conj] || DEFAULT_AF[config_conj];
                init = isNaN(+_init) ? min : _init;
            }
            if (isNaN(+max)) max = 100;

            let new_view = ui.inflate(
                <vertical>
                    <horizontal margin="16 8">
                        <text id="_text" gravity="left" layout_gravity="center"/>
                        <seekbar id="_seekbar" w="*" style="@android:style/Widget.Material.SeekBar" layout_gravity="center"/>
                    </horizontal>
                </vertical>
            );
            new_view._seekbar.setMax(max - min);
            new_view._seekbar.setProgress(init - min);

            let update = (source) => new_view._text.setText((title ? title + ": " : "") + source.toString() + (unit ? " " + unit : ""));

            update(init);
            new_view._seekbar.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({
                onProgressChanged: function (v, progress, fromUser) {
                    let result = progress + min;
                    update(result);
                    saveSession(config_conj, result);
                },
            }));

            return new_view;
        }
    }
}

function initUI(status_bar_color) {
    ui.layout(
        <vertical id="main">
            <frame/>
        </vertical>
    );
    ui.statusBarColor(status_bar_color || "#03a6ef");
}

function setButtons(parent_view, data_source_key_name, button_params_arr) {
    let buttons_view = ui.inflate(<horizontal id="btn"/>);
    let buttons_count = 0;
    for (let i = 2, len = arguments.length; i < len; i += 1) {
        let arg = arguments[i];
        if (typeof arg !== "object") continue; // just in case
        buttons_view.btn.addView(getButtonLayout.apply(null, arg));
        buttons_count += 1;
    }
    parent_view._title_text.setWidth(~~((650 - 100 * buttons_count - (session_params.page_title !== defs.homepage_title ? 52 : 5)) * WIDTH / 720));
    parent_view._title_bg.addView(buttons_view);

    // tool function(s) //

    function getButtonLayout(button_icon_file_name, button_text, switch_state, btn_click_listener, other_params) {
        other_params = other_params || {};
        session_params.button_icon_file_name = button_icon_file_name.replace(/^(ic_)?(.*?)(_black_48dp)?$/, "ic_$2_black_48dp");
        session_params.button_text = button_text;
        let btn_text = button_text.toLowerCase();
        let btn_icon_id = "_icon_" + btn_text;
        session_params.btn_icon_id = btn_icon_id;
        let btn_text_id = "_text_" + btn_text;
        session_params.btn_text_id = btn_text_id;
        let def_on_color = defs.btn_on_color;
        let def_off_color = defs.btn_off_color;
        let view = buttonView();
        let switch_on_color = [other_params["btn_on_icon_color"] || def_on_color, other_params["btn_on_text_color"] || def_on_color];
        let switch_off_color = [other_params["btn_off_icon_color"] || def_off_color, other_params["btn_off_text_color"] || def_off_color];
        view.switch_on = () => {
            view[btn_icon_id].attr("tint", switch_on_color[0]);
            view[btn_text_id].setTextColor(colors.parseColor(switch_on_color[1]));
        };
        view.switch_off = () => {
            view[btn_icon_id].attr("tint", switch_off_color[0]);
            view[btn_text_id].setTextColor(colors.parseColor(switch_off_color[1]));
        };

        switch_state === "OFF" ? view.switch_off() : view.switch_on();

        view[btn_text_id].on("click", () => btn_click_listener && btn_click_listener(view));
        session_params[data_source_key_name + "_btn_" + btn_text] = view;

        return view;

        // tool function(s) //

        function buttonView() {
            return ui.inflate(
                <vertical margin="13 0">
                    <img layout_gravity="center" id="{{session_params.btn_icon_id}}" src="@drawable/{{session_params.button_icon_file_name}}" h="31" bg="?selectableItemBackgroundBorderless" margin="0 7 0 0"/>
                    <text w="50" id="{{session_params.btn_text_id}}" text="{{session_params.button_text}}" gravity="center" textSize="10" textStyle="bold" marginTop="-26" h="40" gravity="bottom|center"/>
                </vertical>
            );
        }
    }
}

// constructor function(s) //

function Layout(title, params) {
    params = params || {};
    if (typeof params === "string") params = {__string_param__: params};
    if (!classof(title, "Array")) this.title = title;
    else {
        this.title = title[0];
        this.title_color = title[1];
    }
    Object.assign(this, params);
    if (params.newWindow) {
        Object.defineProperties(this, {
            showWindow: {
                get: () => params.newWindow.bind(this),
            }
        });
    }
    if (params.infoWindow) {
        Object.defineProperties(this, {
            infoWindow: {
                get: () => params.infoWindow.bind(this),
            }
        });
    }
    if (params.listeners) {
        Object.defineProperties(this, {
            listener: {
                get: function () {
                    return params.listeners;
                },
            },
        });
    }
    if (params.updateOpr) {
        Object.defineProperties(this, {
            updateOpr: {
                get: () => view => params.updateOpr(view),
            },
        });
    }
}

function initStorageConfig() {
    let storage_config = Object.assign({}, DEFAULT_UNLOCK, storage_unlock.get("config", {}));
    storage_unlock.put("config", storage_config); // to refill storage data
    return storage_config;
}

// module function(s) //

function loadInternalModuleDialog(__runtime__, scope) {
    let dialogs = {};

    dialogs.rawInput = function (title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve, reject) {
                rtDialogs().rawInput(title, prefill, function () {
                    resolve.apply(null, Array.prototype.slice.call(arguments));
                });
            });
        }
        return rtDialogs().rawInput(title, prefill, callback ? callback : null);
    };

    dialogs.input = function (title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve, reject) {
                rtDialogs().rawInput(title, prefill, function (str) {
                    resolve(eval(str));
                });
            });
        }
        if (callback) {
            dialogs.rawInput(title, prefill, function (str) {
                callback(eval(str));
            });
            return;
        }
        return eval(dialogs.rawInput(title, prefill), callback ? callback : null);
    }

    dialogs.prompt = dialogs.rawInput;

    dialogs.alert = function (title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve, reject) {
                rtDialogs().alert(title, prefill, function () {
                    resolve.apply(null, Array.prototype.slice.call(arguments));
                });
            });
        }
        return rtDialogs().alert(title, prefill, callback ? callback : null);
    }

    dialogs.confirm = function (title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve, reject) {
                rtDialogs().confirm(title, prefill, function () {
                    resolve.apply(null, Array.prototype.slice.call(arguments));
                });
            });
        }
        return rtDialogs().confirm(title, prefill, callback ? callback : null);
    }

    dialogs.select = function (title, items, callback) {
        if (items instanceof Array) {
            if (isUiThread() && !callback) {
                return new Promise(function (resolve, reject) {
                    rtDialogs().select(title, items, function () {
                        resolve.apply(null, Array.prototype.slice.call(arguments));
                    });
                });
            }
            return rtDialogs().select(title, items, callback ? callback : null);
        }
        return rtDialogs().select(title, [].slice.call(arguments, 1), null);
    }

    dialogs.singleChoice = function (title, items, index, callback) {
        index = index || 0;
        if (isUiThread() && !callback) {
            return new Promise(function (resolve, reject) {
                rtDialogs().singleChoice(title, index, items, function () {
                    resolve.apply(null, Array.prototype.slice.call(arguments));
                });
            });
        }
        return rtDialogs().singleChoice(title, index, items, callback ? callback : null);
    }

    dialogs.multiChoice = function (title, items, index, callback) {
        index = index || [];
        if (isUiThread() && !callback) {
            return new Promise(function (resolve, reject) {
                rtDialogs().singleChoice(title, index, items, function (r) {
                    resolve.apply(null, javaArrayToJsArray(r));
                });
            });
        }
        if (callback) {
            return rtDialogs().multiChoice(title, index, items, function (r) {
                callback(javaArrayToJsArray(r));
            });
        }
        return javaArrayToJsArray(rtDialogs().multiChoice(title, index, items, null));

    }

    var propertySetters = {
        "title": null,
        "titleColor": {adapter: parseColor},
        "buttonRippleColor": {adapter: parseColor},
        "icon": null,
        "content": null,
        "contentColor": {adapter: parseColor},
        "contentLineSpacing": null,
        "items": null,
        "itemsColor": {adapter: parseColor},
        "positive": {method: "positiveText"},
        "positiveColor": {adapter: parseColor},
        "neutral": {method: "neutralText"},
        "neutralColor": {adapter: parseColor},
        "negative": {method: "negativeText"},
        "negativeColor": {adapter: parseColor},
        "cancelable": null,
        "canceledOnTouchOutside": null,
        autoDismiss: null
    };

    dialogs.build = function (properties) {
        var builder = Object.create(__runtime__.dialogs.newBuilder());
        builder.thread = threads.currentThread();
        for (var name in properties) {
            if (!properties.hasOwnProperty(name)) {
                continue;
            }
            applyDialogProperty(builder, name, properties[name]);
        }
        applyOtherDialogProperties(builder, properties);
        return ui.run(() => builder.buildDialog());
    }

    dialogs.builds = function (common, o) {
        let common_o = {};
        let {dialog_contents} = defs;

        if (typeof common === "string") common = [common];
        let [title_param, content_param, neutral_param, negative_param, positive_param, stay_flag, check_box_param] = common;
        if (typeof title_param === "object") {
            common_o.title = title_param[0];
            common_o.titleColor = title_param[1].match(/_color$/) ? defs[title_param[1]] : title_param[1];
        } else if (title_param) common_o.title = title_param;
        if (typeof content_param === "object") {
            common_o.content = dialog_contents[content_param[0]] || content_param[0];
            common_o.contentColor = content_param[1].match(/_color$/) ? defs[content_param[1]] : content_param[1];
        } else if (content_param) common_o.content = dialog_contents[content_param] || content_param;
        if (typeof neutral_param === "object") {
            common_o.neutral = neutral_param[0];
            common_o.neutralColor = neutral_param[1].match(/_color$/) ? defs[neutral_param[1]] : neutral_param[1];
        } else if (neutral_param) common_o.neutral = neutral_param;
        if (typeof negative_param === "object") {
            common_o.negative = negative_param[0];
            common_o.negativeColor = negative_param[1].match(/_color$/) ? defs[negative_param[1]] : negative_param[1];
        } else if (negative_param) common_o.negative = negative_param;
        if (typeof positive_param === "object") {
            common_o.positive = positive_param[0];
            common_o.positiveColor = positive_param[1].match(/_color$/) ? defs[positive_param[1]] : positive_param[1];
        } else if (positive_param) common_o.positive = positive_param;
        if (stay_flag) {
            common_o.autoDismiss = false;
            common_o.canceledOnTouchOutside = false;
        }
        if (check_box_param) {
            common_o.checkBoxPrompt = typeof check_box_param === "string" ? check_box_param : "不再提示";
        }

        let final_dialog = dialogs.build(Object.assign({}, common_o, o));
        __global__.dialogs_pool = (__global__.dialogs_pool || []).concat([final_dialog]);
        return final_dialog;
    };

    function applyDialogProperty(builder, name, value) {
        if (!propertySetters.hasOwnProperty(name)) {
            return;
        }
        var propertySetter = propertySetters[name] || {};
        if (propertySetter.method == undefined) {
            propertySetter.method = name;
        }
        if (propertySetter.adapter) {
            value = propertySetter.adapter(value);
        }
        builder[propertySetter.method].call(builder, value);
    }

    function applyOtherDialogProperties(builder, properties) {
        if (properties.inputHint != undefined || properties.inputPrefill != undefined) {
            builder.input(wrapNonNullString(properties.inputHint), wrapNonNullString(properties.inputPrefill),
                function (dialog, input) {
                    input = input.toString();
                    builder.emit("input_change", builder.dialog, input);
                })
                .alwaysCallInputCallback();
        }
        if (properties.items != undefined) {
            var itemsSelectMode = properties.itemsSelectMode;
            if (itemsSelectMode == undefined || itemsSelectMode == 'select') {
                builder.itemsCallback(function (dialog, view, position, text) {
                    builder.emit("item_select", position, text.toString(), builder.dialog);
                });
            } else if (itemsSelectMode == 'single') {
                builder.itemsCallbackSingleChoice(properties.itemsSelectedIndex == undefined ? -1 : properties.itemsSelectedIndex,
                    function (dialog, view, which, text) {
                        builder.emit("single_choice", which, text.toString(), builder.dialog);
                        return true;
                    });
            } else if (itemsSelectMode == 'multi') {
                builder.itemsCallbackMultiChoice(properties.itemsSelectedIndex == undefined ? null : properties.itemsSelectedIndex,
                    function (dialog, view, indices, texts) {
                        builder.emit("multi_choice", indices, texts, builder.dialog);
                        return true;
                    });
            } else {
                throw new Error("unknown itemsSelectMode " + itemsSelectMode);
            }
        }
        if (properties.progress != undefined) {
            var progress = properties.progress;
            var indeterminate = (progress.max == -1);
            builder.progress(indeterminate, progress.max, !!progress.showMinMax);
            builder.progressIndeterminateStyle(!!progress.horizontal);
        }
        if (properties.checkBoxPrompt != undefined || properties.checkBoxChecked != undefined) {
            builder.checkBoxPrompt(wrapNonNullString(properties.checkBoxPrompt), !!properties.checkBoxChecked,
                function (view, checked) {
                    builder.getDialog().emit("check", checked, builder.getDialog());
                });
        }
        if (properties.customView != undefined) {
            let customView = properties.customView;
            if (typeof (customView) == 'xml' || typeof (customView) == 'string') {
                customView = ui.run(() => ui.inflate(customView));
            }
            let wrapInScrollView = (properties.wrapInScrollView === undefined) ? true : properties.wrapInScrollView;
            builder.customView(customView, wrapInScrollView);
        }
    }

    function wrapNonNullString(str) {
        if (str == null || str == undefined) {
            return "";
        }
        return str;
    }

    function javaArrayToJsArray(javaArray) {
        var jsArray = [];
        var len = javaArray.length;
        for (var i = 0; i < len; i++) {
            jsArray.push(javaArray[i]);
        }
        return jsArray;
    }

    function toJsArray(object, adapter) {
        var jsArray = [];
        var len = javaArray.length;
        for (var i = 0; i < len; i++) {
            jsArray.push(adapter(object, i));
        }
        return jsArray;
    }

    function rtDialogs() {
        var d = __runtime__.dialogs;
        if (!isUiThread()) {
            return d.nonUiDialogs;
        } else {
            return d;
        }
    }

    function isUiThread() {
        return android.os.Looper.myLooper() == android.os.Looper.getMainLooper();
    }

    function parseColor(c) {
        if (typeof (c) == 'string') {
            return colors.parseColor(c);
        }
        return c;
    }

    scope.rawInput = dialogs.rawInput.bind(dialogs);

    scope.alert = dialogs.alert.bind(dialogs);

    scope.confirm = dialogs.confirm.bind(dialogs);

    scope.prompt = dialogs.prompt.bind(dialogs);

    return dialogs;
} // updated at Nov 14, 2019

function loadInternalModuleMonsterFunc() {
    return {
        getDisplayParams: getDisplayParams,
        equalObjects: equalObjects,
        deepCloneObject: deepCloneObject,
        alertTitle: alertTitle,
        waitForAction: waitForAction,
        classof: classof,
        keycode: keycode,
    };

    // some may be used by a certain monster function(s) even though not showing up above
    // monster function(s) //

    function alertTitle(dialog, message, duration) {
        __global__ = typeof __global__ === "undefined" ? this : __global__;

        __global__._monster_$_alert_title_info = __global__._monster_$_alert_title_info || {};
        let alert_title_info = __global__._monster_$_alert_title_info;
        alert_title_info[dialog] = alert_title_info[dialog] || {};
        alert_title_info["message_showing"] ? alert_title_info["message_showing"]++ : (alert_title_info["message_showing"] = 1);

        let ori_text = alert_title_info[dialog].ori_text || "",
            ori_text_color = alert_title_info[dialog].ori_text_color || "",
            ori_bg_color = alert_title_info[dialog].ori_bg_color || "";

        let ori_title_view = dialog.getTitleView();
        if (!ori_text) {
            ori_text = ori_title_view.getText();
            alert_title_info[dialog].ori_text = ori_text;
        }
        if (!ori_text_color) {
            ori_text_color = ori_title_view.getTextColors().colors[0];
            alert_title_info[dialog].ori_text_color = ori_text_color;
        }

        if (!ori_bg_color) {
            let bg_color_obj = ori_title_view.getBackground();
            ori_bg_color = bg_color_obj && bg_color_obj.getColor() || -1;
            alert_title_info[dialog].ori_bg_color = ori_bg_color;
        }

        setTitleInfo(dialog, message, colors.parseColor("#c51162"), colors.parseColor("#ffeffe"));

        if (duration === 0) return;

        setTimeout(function () {
            alert_title_info["message_showing"]--;
            if (alert_title_info["message_showing"]) return;
            setTitleInfo(dialog, ori_text, ori_text_color, ori_bg_color);
        }, duration || 3000);

        // tool function(s) //

        function setTitleInfo(dialog, text, color, bg) {
            let title_view = dialog.getTitleView();
            title_view.setText(text);
            title_view.setTextColor(color);
            title_view.setBackgroundColor(bg);
        }
    }

    function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
        __global__ = typeof __global__ === "undefined" ? this : __global__;

        let _msg = msg || "";
        if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
            return messageAction("[ " + msg + " ]", 1, if_toast, if_arrow, if_split_line, params);
        }

        let _msg_level = typeof msg_level === "number" ? msg_level : -1;
        let _if_toast = if_toast || false;
        let _if_arrow = if_arrow || false;
        let _if_split_line = if_split_line || false;

        let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;

        if (_if_toast) toast(_msg);

        let _split_line_style = "solid";
        if (typeof _if_split_line === "string") {
            if (_if_split_line.match(/dash/)) _split_line_style = "dash";
            if (_if_split_line.match(/both|up/)) {
                if (_split_line_style !== __global__._monster_$_last_console_split_line_type) {
                    _showSplitLine("", _split_line_style);
                }
                delete __global__._monster_$_last_console_split_line_type;
                if (_if_split_line.match(/_n|n_/)) _if_split_line = "\n";
                else if (_if_split_line.match(/both/)) _if_split_line = 1;
                else if (_if_split_line.match(/up/)) _if_split_line = 0;
            }
        }

        if (_if_arrow) {
            if (_if_arrow > 10) {
                console.warn("-> \"if_arrow\"参数大于10");
                _if_arrow = 10;
            }
            _msg = "> " + _msg;
            for (let i = 0; i < _if_arrow; i += 1) _msg = "-" + _msg;
        }

        let _exit_flag = false;
        let _throw_error_flag = false;
        switch (_msg_level) {
            case 0:
            case "verbose":
            case "v":
                _msg_level = 0;
                console.verbose(_msg);
                break;
            case 1:
            case "log":
            case "l":
                _msg_level = 1;
                console.log(_msg);
                break;
            case 2:
            case "i":
            case "info":
                _msg_level = 2;
                console.info(_msg);
                break;
            case 3:
            case "warn":
            case "w":
                _msg_level = 3;
                console.warn(_msg);
                break;
            case 4:
            case "error":
            case "e":
                _msg_level = 4;
                console.error(_msg);
                break;
            case 8:
            case "x":
                _msg_level = 4;
                console.error(_msg);
                _exit_flag = true;
                break;
            case 9:
            case "t":
                _msg_level = 4;
                console.error(_msg);
                _throw_error_flag = true;
        }
        if (_if_split_line) {
            let show_split_line_extra_str = "";
            if (typeof _if_split_line === "string") {
                if (_if_split_line.match(/dash/)) {
                    show_split_line_extra_str = _if_split_line.match(/_n|n_/) ? "\n" : ""
                } else {
                    show_split_line_extra_str = _if_split_line;
                }
            }
            if (!show_split_line_extra_str.match(/\n/)) {
                __global__._monster_$_last_console_split_line_type = _split_line_style || "solid";
            }
            _showSplitLine(show_split_line_extra_str, _split_line_style);
        } else {
            delete __global__._monster_$_last_console_split_line_type;
        }
        if (_throw_error_flag) {
            ui.post(function () {
                throw ("FORCE_STOP");
            });
            exit();
        } else if (_exit_flag) exit();
        return !(_msg_level in {3: 1, 4: 1});

        // raw function(s) //

        function showSplitLineRaw(extra_str, style) {
            let _extra_str = extra_str || "";
            let _split_line = "";
            if (style === "dash") {
                for (let i = 0; i < 16; i += 1) _split_line += "- ";
                _split_line += "-";
            } else {
                for (let i = 0; i < 32; i += 1) _split_line += "-";
            }
            return ~console.log(_split_line + _extra_str);
        }
    }

    function showSplitLine(extra_str, style, params) {
        let _extra_str = extra_str || "";
        let _split_line = "";
        if (style === "dash") {
            for (let i = 0; i < 16; i += 1) _split_line += "- ";
            _split_line += "-";
        } else {
            for (let i = 0; i < 32; i += 1) _split_line += "-";
        }
        return !!~console.log(_split_line + _extra_str);
    }

    function waitForAction(f, timeout_or_times, interval) {
        __global__ = typeof __global__ === "undefined" ? this : __global__;
        if (typeof timeout_or_times !== "number") timeout_or_times = 10000;

        let _timeout = Infinity;
        let _interval = interval || 200;
        let _times = timeout_or_times;

        if (_times <= 0 || !isFinite(_times) || isNaN(_times) || _times > 100) _times = Infinity;
        if (timeout_or_times > 100) _timeout = timeout_or_times;
        if (interval >= _timeout) _times = 1;

        let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

        let _start_timestamp = +new Date();
        while (!_checkF(f) && --_times) {
            if (+new Date() - _start_timestamp > _timeout) return false; // timed out
            sleep(_interval);
        }
        return _times > 0;

        // tool function(s) //

        function _checkF(f) {
            while (__global__._monster_$_global_waiting_signal) sleep(200);

            let _classof = o => Object.prototype.toString.call(o).slice(8, -1);

            if (typeof f === "function") return f();
            if (_classof(f) === "JavaObject") return f.toString().match(/UiObject/) ? !!f : f.exists();
            if (_classof(f) === "Array") {
                let _arr = f;
                let _logic_flag = "all";
                if (typeof _arr[_arr.length - 1] === "string") _logic_flag = _arr.pop();
                if (_logic_flag.match(/^(or|one)$/)) _logic_flag = "one";
                for (let i = 0, len = _arr.length; i < len; i += 1) {
                    if (!(typeof _arr[i]).match(/function|object/)) _messageAction("数组参数中含不合法元素", 8, 1, 0, 1);
                    if (_logic_flag === "all" && !_checkF(_arr[i])) return false;
                    if (_logic_flag === "one" && _checkF(_arr[i])) return true;
                }
                return _logic_flag === "all";
            }

            _messageAction("\"waitForAction\"传入f参数不合法\n\n" + f.toString() + "\n", 8, 1, 1, 1);
        }

        // raw function(s) //

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
        }
    }

    function keycode(keycode_name, params_str) {
        params_str = params_str || "";

        let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;

        if (params_str.match(/force.*shell/i)) return keyEvent(keycode_name);
        let _tidy_keycode_name = keycode_name.toString().toLowerCase().replace(/^keycode_|s$/, "").replace(/_([a-z])/g, ($0, $1) => $1.toUpperCase());
        let first_result = simulateKey();
        return params_str.match(/double/) ? simulateKey() : first_result;

        // tool function(s) //

        function keyEvent(keycode_name) {
            let _key_check = {
                "26, power": checkPower,
            };
            for (let _key in _key_check) {
                if (_key_check.hasOwnProperty(_key)) {
                    if (~_key.split(/ *, */).indexOf(_tidy_keycode_name)) return _key_check[_key]();
                }
            }
            return shellInputKeyEvent(keycode_name);

            // tool function(s) //

            function shellInputKeyEvent(keycode_name) {
                let shell_result = false;
                try {
                    shell_result = !shell("input keyevent " + keycode_name, true).code;
                } catch (e) {
                    // nothing to do here
                }
                return shell_result ? true : (!params_str.match(/no.*err(or)?.*(message|msg)/) && !!keyEventFailedMsg());

                // tool function(s) //

                function keyEventFailedMsg() {
                    messageAction("按键模拟失败", 0);
                    messageAction("键值: " + keycode_name, 0, 0, 1);
                }
            }

            function checkPower() {
                let isScreenOn = () => device.isScreenOn();
                let isScreenOff = () => !isScreenOn();
                if (isScreenOff()) {
                    device.wakeUp();
                    let max_try_times_wake_up = 10;
                    while (!_waitForAction(isScreenOn, 500) && max_try_times_wake_up--) device.wakeUp();
                    return max_try_times_wake_up >= 0;
                }
                return shellInputKeyEvent(keycode_name) ? _waitForAction(isScreenOff, 2400) : false;
            }
        }

        function simulateKey() {
            switch (_tidy_keycode_name) {
                case "3":
                case "home":
                    return ~home();
                case "4":
                case "back":
                    return ~back();
                case "appSwitch":
                case "187":
                case "recent":
                case "recentApp":
                    return ~recents();
                case "powerDialog":
                case "powerMenu":
                    return ~powerDialog();
                case "notification":
                    return ~notifications();
                case "quickSetting":
                    return ~quickSettings();
                case "splitScreen":
                    return ~splitScreen();
                default:
                    return keyEvent(keycode_name);
            }
        }

        // raw function(s) //

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10000;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }
    }

    function debugInfo(msg, info_flag, forcible_flag) {
        __global__ = typeof __global__ === "undefined" ? this : __global__;
        let global_flag = __global__._monster_$_debug_info_flag;
        if (!global_flag && !forcible_flag) return;
        if (global_flag === false || forcible_flag === false) return;

        let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;
        let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);

        if (msg === "__split_line__") showDebugSplitLine();

        let info_flag_str = (info_flag || "").toString();
        let info_flag_line = (info_flag_str.match(/[Uu]p|both/) || [""])[0];
        let info_flag_msg_level = +(info_flag_str.match(/\d/) || [0])[0];

        if (info_flag_line === "Up") _showSplitLine();
        if (info_flag_line.match(/both|up/)) debugInfo("__split_line__", "", forcible_flag);

        if (classof(msg) === "Array") msg.forEach(msg => debugInfo(msg, info_flag_msg_level, forcible_flag));
        else _messageAction((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "), info_flag_msg_level);

        if (info_flag_line === "both") debugInfo("__split_line__", "", forcible_flag);

        // raw function(s) //

        function showSplitLineRaw(extra_str, style) {
            let _extra_str = extra_str || "";
            let _split_line = "";
            if (style === "dash") {
                for (let i = 0; i < 16; i += 1) _split_line += "- ";
                _split_line += "-";
            } else {
                for (let i = 0; i < 32; i += 1) _split_line += "-";
            }
            return ~console.log(_split_line + _extra_str);
        }

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
        }

        // tool function(s) //

        function showDebugSplitLine() {
            let _msg = "";
            if (msg.match(/dash/)) {
                for (let i = 0; i < 16; i += 1) _msg += "- ";
                _msg += "-";
            } else {
                for (let i = 0; i < 32; i += 1) _msg += "-";
            }
            msg = _msg;
        }
    }

    function getDisplayParams() {
        let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
        let _window_service_display = context.getSystemService(context.WINDOW_SERVICE).getDefaultDisplay();
        let [WIDTH, HEIGHT] = [];
        let display_info = {};
        if (_waitForAction(checkData, 3000, 500)) {
            display_info.cX = (num) => Math.min(Math.round(num * WIDTH / (Math.abs(num) >= 1 ? 720 : 1)), WIDTH);
            display_info.cY = (num, aspect_ratio) => Math.min(Math.round(num * WIDTH * (Math.pow(aspect_ratio, aspect_ratio > 1 ? 1 : -1) || (HEIGHT / WIDTH)) / (Math.abs(num) >= 1 ? 1280 : 1)), HEIGHT);
            return display_info;
        }

        // tool function(s) //

        function checkData() {
            try {
                WIDTH = +_window_service_display.getWidth();
                HEIGHT = +_window_service_display.getHeight();
                if (!(WIDTH * HEIGHT)) throw Error();

                let ORIENTATION = +_window_service_display.getOrientation(); // left: 1, right: 3, portrait: 0 (or 2 ?)
                let MAX = +_window_service_display.maximumSizeDimension;

                let [USABLE_HEIGHT, USABLE_WIDTH] = [HEIGHT, WIDTH];

                ORIENTATION in {0: true, 2: true} ? [USABLE_HEIGHT, HEIGHT] = [HEIGHT, MAX] : [USABLE_WIDTH, WIDTH] = [WIDTH, MAX];

                return display_info = {
                    WIDTH: WIDTH,
                    USABLE_WIDTH: USABLE_WIDTH,
                    HEIGHT: HEIGHT,
                    USABLE_HEIGHT: USABLE_HEIGHT,
                    screen_orientation: ORIENTATION,
                    status_bar_height: getDataByDimenName("status_bar_height"),
                    navigation_bar_height: getDataByDimenName("navigation_bar_height"),
                    navigation_bar_height_computed: ORIENTATION in {0: true, 2: true} ? HEIGHT - USABLE_HEIGHT : WIDTH - USABLE_WIDTH,
                    action_bar_default_height: getDataByDimenName("action_bar_default_height"),
                };
            } catch (e) {
                try {
                    WIDTH = +device.width;
                    HEIGHT = +device.height;
                    if (!(WIDTH * HEIGHT)) throw Error();
                    return display_info = {
                        WIDTH: WIDTH,
                        HEIGHT: HEIGHT,
                        USABLE_HEIGHT: ~~(HEIGHT * 0.9), // evaluated value
                    };
                } catch (e) {

                }
            }

            // tool function(s) //

            function getDataByDimenName(name) {
                let resources = context.getResources();
                let resource_id = resources.getIdentifier(name, "dimen", "android");
                return resource_id > 0 ? resources.getDimensionPixelSize(resource_id) : NaN;
            }
        }

        // raw function(s) //

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10000;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }
    }

    function equalObjects(obj_a, obj_b) {
        let classOf = value => Object.prototype.toString.call(value).slice(8, -1);
        let class_of_a = classOf(obj_a),
            class_of_b = classOf(obj_b),
            type_of_a = typeof obj_a,
            type_of_b = typeof obj_b;
        let matchFeature = (a, b, feature) => a === feature && b === feature;
        if (!matchFeature(type_of_a, type_of_b, "object")) return obj_a === obj_b;
        if (matchFeature(class_of_a, class_of_b, "Null")) return true;

        if (class_of_a === "Array") {
            if (class_of_b !== "Array") return false;
            let len_a = obj_a.length,
                len_b = obj_b.length;
            if (len_a !== len_b) return false;
            let used_obj_b_indices = [];
            for (let i = 0, len = obj_a.length; i < len; i += 1) {
                if (!function () {
                    let a = obj_a[i];
                    for (let j = 0, len_j = obj_b.length; j < len_j; j += 1) {
                        if (~used_obj_b_indices.indexOf(j)) continue;
                        if (equalObjects(a, obj_b[j])) {
                            used_obj_b_indices.push(j);
                            return true;
                        }
                    }
                }()) return false;
            }
            return true;
        }

        if (class_of_a === "Object") {
            if (class_of_b !== "Object") return false;
            let keys_a = Object.keys(obj_a),
                keys_b = Object.keys(obj_b),
                len_a = keys_a.length,
                len_b = keys_b.length;
            if (len_a !== len_b) return false;
            if (!equalObjects(keys_a, keys_b)) return false;
            for (let i in obj_a) {
                if (obj_a.hasOwnProperty(i)) {
                    if (!equalObjects(obj_a[i], obj_b[i])) return false;
                }
            }
            return true;
        }
    }

    function deepCloneObject(obj) {
        let classOfObj = Object.prototype.toString.call(obj).slice(8, -1);
        if (classOfObj === "Null" || classOfObj !== "Object" && classOfObj !== "Array") return obj;
        let new_obj = classOfObj === "Array" ? [] : {};
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                new_obj[i] = classOfObj === "Array" ? obj[i] : deepCloneObject(obj[i]);
            }
        }
        return new_obj;
    }

    function getSelector(params) {
        __global__ = typeof __global__ === "undefined" ? this : __global__;

        let parent_params = params || {};
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, "", parent_params.debug_info_flag);
        let sel = selector();
        sel.__proto__ = {
            /**
             * Returns a selector (UiSelector) or node (UiObject) or some attribute
             * If no nodes (UiObjects) were found, returns null or "" or false
             * If memory_keyword was found in this session memory, use a memorized selector directly without selecting
             * @memberOf getSelector
             * @param selector_body {string|RegExp|array} - selector body will be converted into array type
             * <br>
             *     -- array: [ [selector_body] {*}, <[additional_selectors] {array|object}>, [compass] {string} ]
             *     -- additional_selectors can be treated as compass by checking its type (whether object or string)
             * @param [memory_keyword {string|null}] - to mark this selector node; better use a keyword without conflict
             * @param [result_type="node"] {string} - "node", "txt", "text", "desc", "id", "bounds", "exist(s)" and so forth
             * <br>
             *     -- "txt": available text()/desc() value or empty string
             * @param [params] {object}
             * @param [params.selector_prefer="desc"] {string} - unique selector you prefer to check first; "text" or "desc"
             * @param [params.debug_info_flag] {boolean}
             * @returns {UiObject|UiSelector|string|boolean|Rect|*} - default: UiObject
             * @example
             * pickup("abc"); -- text/desc/id("abc").findOnce() or null; <br>
             * pickup("abc", "my_alphabet", "node"); -- same as above; <br>
             * pickup("abc", "my_alphabet", "sel"); -- text/desc/id("abc") or null -- selector <br>
             * pickup(text("abc"), "my_alphabet"); -- text("abc").findOnce() or null <br>
             * pickup(/^abc.+z/, "AtoZ", "sel_str"); -- id/text/desc or "" -- string <br>
             * pickup("morning", "", "exists"); -- text/desc/id("morning").exists() -- boolean <br>
             * pickup(["morning", "p2c3"], "", "id"); -- text/desc/id("morning").findOnce().parent().parent().child(3).id() <br>
             * pickup(["hello", "s3b"], "", "txt"); -- text/desc/id("hello").findOnce().parent().child(%childCount% - 3) -- ["txt"] <br>
             * pickup(["hello", {className: "Button"}]); -- text/desc/id("hello").className("Button").findOnce() <br>
             * pickup([desc("a").className("Button"), {boundsInside: [0, 0, 720, 1000]}, "s+1"], "back_btn", "clickable"); -- desc("a").className("Button").boundsInside(0, 0, 720, 1000).findOnce().parent().child(%indexInParent% + 1).clickable() -- boolean <br>
             */
            pickup: (selector_body, memory_keyword, result_type, params) => {
                let sel_body = classof(selector_body) === "Array" ? selector_body.slice() : [selector_body];
                let _params = Object.assign({}, parent_params, params);
                result_type = (result_type || "").toString();
                let _result_type = result_type;

                if (!result_type || result_type.match(/^n(ode)?$/)) _result_type = "node";
                else if (result_type.match(/^s(el(ector)?)?$/)) _result_type = "selector";
                else if (result_type.match(/^e(xist(s)?)?$/)) _result_type = "exists";
                else if (result_type.match(/^t(xt)?$/)) _result_type = "txt";
                else if (result_type.match(/^s(el(ector)?)?(_?s|S)(tr(ing)?)?$/)) _result_type = "selector_string";

                if (typeof sel_body[1] === "string") sel_body.splice(1, 0, "");

                let _body = sel_body[0];
                let _additional_sel = sel_body[1];
                let _compass = sel_body[2];

                let _kw = _getSelector(_additional_sel);
                let _node = null;
                let _nodes = [];
                if (_kw && _kw.toString().match(/UiObject/)) {
                    _node = _kw;
                    if (_result_type === "nodes") _nodes = [_kw];
                    _kw = null;
                } else {
                    _node = _kw ? _kw.findOnce() : null;
                    if (_result_type === "nodes") _nodes = _kw ? _kw.find() : [];
                }

                if (_compass) _node = _relativeNode([_kw || _node, _compass]);

                let _result = {
                    selector: _kw,
                    node: _node,
                    nodes: _nodes,
                    exists: !!_node,
                    get selector_string() {
                        return _kw ? _kw.toString().match(/[a-z]+/)[0] : "";
                    },
                    get txt() {
                        let _text = _node && _node.text() || "";
                        let _desc = _node && _node.desc() || "";
                        return _desc.length > _text.length ? _desc : _text;
                    }
                };

                if (_result_type in _result) return _result[_result_type];

                try {
                    if (!_node) return null;
                    return _node[_result_type]();
                } catch (e) {
                    try {
                        return _node[_result_type];
                    } catch (e) {
                        debugInfo(e, 3);
                        return null;
                    }
                }

                // tool function(s)//

                function _getSelector(addition) {
                    let _mem_kw_prefix = "_MEM_KW_PREFIX_";
                    if (memory_keyword) {
                        let _memory_selector = __global__[_mem_kw_prefix + memory_keyword];
                        if (_memory_selector) return _memory_selector;
                    }
                    let _kw_selector = _getSelectorFromLayout(addition);
                    if (memory_keyword && _kw_selector) {
                        _debugInfo(["选择器已记录", ">" + memory_keyword, ">" + _kw_selector]);
                        __global__[_mem_kw_prefix + memory_keyword] = _kw_selector;
                    }
                    return _kw_selector;

                    // tool function(s) //

                    function _getSelectorFromLayout(addition) {
                        let _prefer = _params.selector_prefer;
                        let _body_class = classof(_body);

                        if (_body_class === "JavaObject") {
                            if (_body.toString().match(/UiObject/)) {
                                addition && _debugInfo("UiObject无法使用额外选择器", 3);
                                return _body;
                            }
                            return checkSelectors(_body);
                        }

                        if (typeof _body === "string") {
                            return _prefer === "text"
                                ? checkSelectors(text(_body), desc(_body), id(_body))
                                : checkSelectors(desc(_body), text(_body), id(_body));
                        }

                        if (_body_class === "RegExp") {
                            return _prefer === "text"
                                ? checkSelectors(textMatches(_body), descMatches(_body), idMatches(_body))
                                : checkSelectors(descMatches(_body), textMatches(_body), idMatches(_body));
                        }

                        // tool function(s) //

                        function checkSelectors(selectors) {
                            let sel_multi = selectors;
                            if (classof(sel_multi) !== "Array") {
                                sel_multi = [];
                                for (let i = 0, len = arguments.length; i < len; i += 1) sel_multi[i] = arguments[i];
                            }
                            for (let i = 0, len = sel_multi.length; i < len; i += 1) {
                                let result = checkSelector(sel_multi[i]);
                                if (result) return result;
                            }
                            return null;

                            // tool function(s) //

                            function checkSelector(single_sel) {
                                if (classof(addition) === "Array") {
                                    let o = {};
                                    o[addition[0]] = addition[1];
                                    addition = o;
                                }
                                if (classof(addition) === "Object") {
                                    let keys = Object.keys(addition);
                                    for (let i = 0, len = keys.length; i < len; i += 1) {
                                        let key = keys[i];
                                        if (!single_sel[key]) {
                                            _debugInfo(["无效的additional_selector属性值:", key], 3);
                                            return null;
                                        }
                                        let value = addition[key];
                                        try {
                                            single_sel = single_sel[key].apply(single_sel, classof(value) === "Array" ? value : [value]);
                                        } catch (e) {
                                            _debugInfo(["无效的additional_selector选择器:", key], 3);
                                            return null;
                                        }
                                    }
                                }
                                return single_sel.exists() ? single_sel : null;
                            }
                        }
                    }
                }

                /**
                 * Returns a relative node (UiObject) by compass string
                 * @param node_information {array|*} - [node, compass]
                 * @returns {null|UiObject}
                 * @example
                 * relativeNode([text("Alipay"), "pp"]); -- text("Alipay").findOnce().parent().parent(); <br>
                 * relativeNode([text("Alipay").findOnce(), "p2"]); -- text("Alipay").findOnce().parent().parent(); -- same as above <br>
                 * relativeNode([id("abc"), "p3c2"]); -- id("abc").findOnce().parent().parent().parent().child(2); <br>
                 * relativeNode([id("abc"), "s5"/"s5p"]); -- id("abc").findOnce().parent().child(5); -- returns an absolute sibling <br>
                 * relativeNode([id("abc"), "s5n"]); -- id("abc").findOnce().parent().child(%childCount% - 5); -- abs sibling <br>
                 * relativeNode([id("abc"), "s+3"]); -- id("abc").findOnce().parent().child(%indexInParent()% + 3); -- rel sibling <br>
                 * relativeNode([id("abc"), "s-2"]); -- id("abc").findOnce().parent().child(%indexInParent()% - 2); -- rel sibling <br>
                 */
                function _relativeNode(node_information) {
                    let classof = o => Object.prototype.toString.call(o).slice(8, -1);

                    let node_info = classof(node_information) === "Array" ? node_information.slice() : [node_information];

                    let node = node_info[0];
                    let node_class = classof(node);
                    let node_str = (node || "").toString();

                    if (typeof node === "undefined") {
                        _debugInfo("relativeNode的node参数为Undefined");
                        return null;
                    }
                    if (classof(node) === "Null") {
                        _debugInfo("relativeNode的node参数为Null");
                        return null;
                    }
                    if (node_str.match(/^Rect\(/)) {
                        // _debugInfo("relativeNode的node参数为Rect()");
                        return null;
                    }
                    if (node_class === "JavaObject") {
                        if (node_str.match(/UiObject/)) {
                            // _debugInfo("relativeNode的node参数为UiObject");
                        } else {
                            // _debugInfo("relativeNode的node参数为UiSelector");
                            node = node.findOnce();
                            if (!node) {
                                // _debugInfo("UiSelector查找后返回Null");
                                return null;
                            }
                        }
                    } else {
                        _debugInfo("未知的relativeNode的node参数", 3);
                        return null;
                    }

                    let compass = node_info[1];

                    if (!compass) {
                        // _debugInfo("relativeNode的罗盘参数为空");
                        return node;
                    }

                    compass = compass.toString();

                    try {
                        if (compass.match(/s[+\-]?\d+([fbpn](?!\d+))?/)) {
                            let relative_matched = compass.match(/s[+\-]\d+|s\d+[bn](?!\d+)/); // backwards / negative
                            let absolute_matched = compass.match(/s\d+([fp](?!\d+))?/); // forwards / positive
                            if (relative_matched) {
                                let rel_amount = parseInt(relative_matched[0].match(/[+\-]?\d+/)[0]);
                                let child_count = node.parent().childCount();
                                let current_idx = node.indexInParent();
                                node = relative_matched[0].match(/\d+[bn]/)
                                    ? node.parent().child(child_count - Math.abs(rel_amount))
                                    : node.parent().child(current_idx + rel_amount);
                            } else if (absolute_matched) {
                                node = node.parent().child(parseInt(absolute_matched[0].match(/\d+/)[0]));
                            }
                            compass = compass.replace(/s[+\-]?\d+([fbpn](?!\d+))?/, "");
                            if (!compass) return node;
                        }
                    } catch (e) {
                        return null;
                    }

                    let parents = compass.replace(/([Pp])(\d+)/g, ($0, $1, $2) => {
                        let str = "";
                        $2 = parseInt($2);
                        for (let i = 0; i < $2; i += 1) str += "p";
                        return str;
                    }).match(/p*/)[0]; // may be ""

                    let child_idx_matched = compass.match(/c\d+/g);

                    if (!parents) return child_idx_matched ? getChildNode(child_idx_matched) : null;

                    let parents_len = parents.length;
                    for (let i = 0; i < parents_len; i += 1) {
                        if (!(node = node.parent())) return null;
                    }
                    return child_idx_matched ? getChildNode(child_idx_matched) : node;

                    // tool function(s) //

                    function getChildNode(arr) {
                        if (!arr || classof(arr) !== "Array") return null;
                        for (let i = 0, len = arr.length; i < len; i += 1) {
                            if (!node.childCount()) return null;
                            try {
                                node = node.child(+arr[i].match(/\d+/));
                                if (!node) return null;
                            } catch (e) {
                                return null;
                            }
                        }
                        return node;
                    }
                }
            },
        };
        // _debugInfo("选择器加入新方法");
        // Object.keys(sel.__proto__).forEach(key => _debugInfo(">" + key + "()"));
        return sel;

        // raw function(s) //

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }

    function setDeviceProto(params) {
        let _params = params || {};
        let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, "", _params.debug_info_flag);

        __global__ = typeof __global__ === "undefined" ? this : __global__;
        if (typeof __global__.device === "undefined") __global__.device = {};


        __global__.device.__proto__ = Object.assign((__global__.device.__proto__ || {}), {
            /**
             * device.keepScreenOn()
             * @memberOf setDeviceProto
             * @param [duration] {number} could be minute (less than 100) or second -- 5 and 300000 both for 5 min
             * @param [params] {object}
             * @param [params.debug_info_flag] {boolean}
             */
            keepOn: function (duration, params) {
                params = params || {};
                duration = duration || 5;
                if (duration < 100) duration *= 60000;
                device.keepScreenOn(duration);
                if (params.debug_info_flag !== false) {
                    _debugInfo("已设置屏幕常亮");
                    _debugInfo(">最大超时时间: " + +(duration / 60000).toFixed(2) + "分钟");
                }
            },
            /**
             * device.cancelKeepingAwake()
             * @memberOf setDeviceProto
             * @param [params] {object}
             * @param [params.debug_info_flag] {boolean}
             */
            cancelOn: function (params) {
                // click(Math.pow(10, 7), Math.pow(10, 7));
                params = params || {};
                device.cancelKeepingAwake();
                if (params.debug_info_flag !== false) {
                    _debugInfo("屏幕常亮已取消");
                }
            },
        });

        // raw function(s) //

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }

    function classof(source, check_value) {
        let class_result = Object.prototype.toString.call(source).slice(8, -1);
        return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
    }
} // update at Nov 14, 2019

function loadInternalDialogContents() {
    return {
        dialog_contents: {
            unlock_code: // 设置锁屏解锁密码
                "密码长度不小于 3 位\n" +
                "无密码请留空\n\n" +
                "若采用图案解锁方式\n" +
                "总点阵数大于 9 需使用逗号分隔\n" +
                "图案解锁密码将自动简化\n" +
                "详情点击\"查看示例\"",
            unlock_code_demo: // 锁屏密码示例
                "滑动即可解锁: (留空)\n\n" +
                "PIN 解锁: 1001\n\n" +
                "密码解锁: 10btv69\n\n" +
                "图案解锁: (点阵序号从 1 开始)\n" +
                "3 × 3 点阵 - 1235789 或 1,2,3,5,7,8,9\n" +
                "4 × 4点阵 - 1,2,3,4,8,12,16\n" +
                "* 点阵密码将自动简化",
            about_pattern_simplification: // 图案解锁密码简化
                "简化原理:\n" +
                "共线的连续线段组只需保留首末两点\n" +
                "途径点将自动激活\n\n" +
                "3 × 3 - 1,2,3,5,7,8,9 -> 1,3,7,9\n" +
                "4 × 4 - 1,2,3,4,8,12,16 -> 1,4,16\n" +
                "5 × 5 - 1,2,3,4,5,6 -> 1,5,6\n\n" +
                "因此以下一组设置对于图案解锁\n" +
                "可视为相同设置 (3 × 3 点阵):\n" +
                "1,2,3,6,9\n" +
                "1,1,2,2,3,3,3,6,9,9\n" +
                "1,3,9",
            unlock_code_safe_confirm: // 自动解锁风险提示
                "设备遗失或被盗时 自动解锁功能将" +
                "严重降低设备的安全性 " +
                "甚至导致隐私泄露或财产损失 请谨慎使用\n\n" +
                "如欲了解设备遗失对策\n" +
                "请点击\"了解详情\"\n\n" +
                "确定要继续吗",
            about_lost_device_solution: // 关于设备遗失对策
                "一旦设备遗失或被盗\n" +
                "可通过以下方式\n" +
                "将可能的损失降到最低\n\n" +
                "* 利用\"查找我的设备\"功能\n\n" +
                "如若遗失安卓手机/平板电脑/手表等\n" +
                "可以寻找/锁定/清空该设备\n" +
                "详情参阅:\n" +
                "https://support.google.com/accounts/answer/6160491?hl=zh-Hans\n\n" +
                "* 及时挂失/冻结卡号/账号\n\n" +
                "优先冻结与财产安全相关的账号\n" +
                "或及时修改登录密码或支付密码\n" +
                "如 微博/微信/支付宝 以及 QQ 等\n" +
                "详情参阅:\n" +
                "https://www.zhihu.com/question/20206696",
            unlock_dismiss_layer_swipe_time: // 提示层页面上滑时长
                "设置整百值可保证匀速滑动\n" +
                "十位小于5可实现不同程度惯性滑动\n\n" +
                "* 通常无需自行设置\n" +
                "* 脚本会自动尝试增量赋值\n" +
                "-- 以获得最佳值",
            unlock_dismiss_layer_bottom: // 提示层页面起点位置
                "设置滑动起点的屏高百分比\n\n" +
                "* 通常无需自行设置\n" +
                "* 设置过大值可能激活非预期控件",
            unlock_dismiss_layer_top: // 提示层页面终点位置
                "设置滑动终点的屏高百分比\n\n" +
                "* 通常无需自行设置\n" +
                "* 此配置值对滑动影响程度较小",
            about_unlock_pattern_strategy: // 关于图案解锁滑动策略
                "叠加路径:\n\n" +
                "采用 gestures() 方法\n" +
                "将每两个点组成直线路径\n" +
                "所有路径利用微小时间差拼接\n" +
                "最终组合形成完整路径\n" +
                "优点:\n" +
                "1. 可实现超高速滑动\n" +
                "2. 滑动拐点定位精确\n" +
                "缺点:\n" +
                "1. 滑动路径可能会断开\n" +
                "2. 滑动总时长=(拐点数+1)×给定参数\n\n" +
                "连续路径:\n\n" +
                "采用 gesture() 方法\n" +
                "将所有坐标作为参数出入\n" +
                "完成一次性不间断滑动\n" +
                "优点:\n" +
                "1. 滑动路径不会断开\n" +
                "2. 滑动总时长=给定参数\n" +
                "缺点:\n" +
                "1. 极易发生拐点偏移现象\n" +
                "2. 拐点数及分布极大影响成功率\n\n" +
                "* 不同策略对应不同\"滑动时长\"参数\n" +
                "* 推荐优先使用\"叠加路径\"策略\n" +
                "-- 当出现路径断开现象时\n" +
                "-- 可尝试\"连续路径\"策略",
            unlock_pattern_swipe_time_segmental: // 设置图案解锁滑动时长 - 叠加路径策略
                "此参数表示两拐点间滑动时长\n" +
                "并非表示滑动总时间\n" +
                "总时间=(拐点数+1)×此参数\n" +
                "如\"1379\"包含两个拐点\n" +
                "参数给定为120ms\n" +
                "则总时长=(2+1)×120ms\n" +
                "即360ms\n" +
                "如\"12369\"有一个拐点\n" +
                "因此结果为240ms\n\n" +
                "* 通常无需自行设置\n" +
                "-- 脚本会自动尝试增量赋值\n" +
                "-- 以获得最佳值",
            unlock_pattern_swipe_time_solid: // 设置图案解锁滑动时长 - 连续路径策略
                "此参数表示首末点间滑动时长\n" +
                "亦即表示滑动总时间\n\n" +
                "* 通常无需自行设置\n" +
                "-- 脚本会自动尝试增量赋值\n" +
                "-- 以获得最佳值",
            unlock_pattern_size: // 设置图案解锁边长
                "图案解锁通常为 N × N 的点阵\n" +
                "通常边长 N 为 3\n\n" +
                "若未使用图案解锁方式\n" +
                "请保留默认值",
        },
    };
} // update at Nov 14, 2019

function loadInternalModulePWMAP() {
    return function () {
        let pwmap_path = files.getSdcardPath() + "/.local/PWMAP.txt";
        let pwmap_map = {};
        let config = {
            "code_length": 8, // 密文字串长度 - eg, 8 - "SCPrMtaB": "A"
            "code_amount": 10, // 密文映射数量 - eg, 3 - "......": "A", "......": "A", "......": "A"
            "separator": "_.|._",
            "encrypt_power": 2,
        };

        this.pwmapEncrypt = pwmapEncrypt;
        this.pwmapDecrypt = pwmapDecrypt;
        this.pwmapGenerate = pwmapGenerate;

        // main function(s) //

        function pwmapEncrypt(input) {
            checkPWMAPFile();
            let is_empty_input = !arguments.length;
            input = is_empty_input && userInput("请输入要加密的字符串") || input;
            let thread_monitor = monitorRunningTime("正在加密中 请稍候...");

            let encrypt_power = Math.min(parseInt(config.encrypt_power), 2) || 1;
            input = encrypt(input);
            encrypt_power--;
            while (encrypt_power--) input = encrypt(input.join(config.separator));

            thread_monitor.interrupt();

            let regexp = new RegExp(/[A-Za-z0-9`~!@#$%^&*()_+=\-\[\]}{'\\;:\/?.>,<| ]/);
            let encrypted = "[" + input.map(value => "\"" + value + "\"") + "]";
            is_empty_input && ~setClip(encrypted) && toast("密文数组已复制剪切板");
            return encrypted;

            // tool function(s) //

            function encrypt(str) {
                let result = [];
                for (let i = 0, len = str.length; i < len; i += 1) {
                    if (str[i].match(regexp)) result.push(pickARandResult(str[i]));
                    else encrypt("\\u" + str[i].charCodeAt(0).toString(16).toUpperCase());
                }
                return result;
            }

            function pickARandResult(str) {
                let tempArr = [];
                for (let name in pwmap_map) {
                    if (pwmap_map.hasOwnProperty(name)) {
                        pwmap_map[name] === str && tempArr.push(name);
                    }
                }
                return tempArr[~~(Math.random() * config.code_amount)];
            }
        }

        function pwmapDecrypt(input) {
            checkPWMAPFile();
            let is_empty_input = !arguments.length;
            input = is_empty_input && userInput("请输入要解密的字符串数组") || input;
            let thread_monitor = monitorRunningTime("正在解密中 请稍候...");

            let decrypted = decrypt(input);
            thread_monitor.interrupt();
            is_empty_input && ~setClip(decrypted) && toast("解密字符串已复制剪切板");
            return decrypted;

            // tool function(s) //

            function decrypt(encrypted_arr) {
                if (typeof encrypted_arr === "undefined") return undefined;
                if (encrypted_arr === null) return encrypted_arr;

                let arr = encrypted_arr,
                    skip_times = 0,
                    result = "";
                if (typeof arr === "string") {
                    if (!arr.length) return "";
                    if (arr[0] !== "[") ~toast("输入的加密字符串不合法") && exit();
                    arr = arr.slice(1, -1).split(/, ?/).map(value => value.replace(/^"([^]+)"$/g, "$1"));
                }

                while (1) {
                    for (let i = 0, len = arr.length; i < len; i += 1) {
                        if (skip_times) {
                            skip_times--;
                            continue;
                        }
                        let decrypted_str = pwmap_map[arr[i]];
                        if (decrypted_str === undefined) return undefined;
                        if (decrypted_str === "\\" && pwmap_map[arr[i + 1]] === "u") {
                            let tmp_str = "";
                            for (let j = 0; j < 4; j += 1) tmp_str += pwmap_map[arr[i + j + 2]];
                            tmp_str = "%u" + tmp_str;
                            result += unescape(tmp_str);
                            skip_times = 5;
                        } else result += decrypted_str;
                    }
                    if (!result.match(new RegExp(config.separator))) break;
                    arr = result.split(config.separator);
                    result = "";
                }
                return result;
            }
        }

        function pwmapGenerate() {
            if (files.exists(pwmap_path)) if (!confirm("密文文件已存在\n继续操作将覆盖已有文件\n新的密文文件生成后\n涉及密文的全部相关代码\n均需重新设置才能解密\n确定要继续吗?")) exit();
            files.createWithDirs(pwmap_path);
            files.open(pwmap_path);

            let str_map = "~!@#$%^&*`'-_+=,./\\ 0123456789:;?AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz()[]<>{}|\"";
            let az_map = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";

            //// SAMPLE - "SCPrMtaB": "A" ////
            //// SAMPLE - "doaAisDd": "%" ////

            let result = {};

            for (let i = 0, len_i = str_map.length; i < len_i; i += 1) {
                for (let j = 0, len_j = config.code_amount; j < len_j; j += 1) {
                    let code_str = "";
                    for (let k = 0, len_k = config.code_length, len_map = az_map.length; k < len_k; k += 1) {
                        code_str += az_map[~~(Math.random() * len_map)];
                    }
                    result[code_str] = str_map[i];
                }
            }

            files.write(pwmap_path, JSON.stringify(result));
            toast("密文文件生成完毕");
        }

        // tool function(s) //

        function checkPWMAPFile() {
            if (!files.exists(pwmap_path)) {
                messageAction("已生成新的密文文件", 1, 1, 0, "both");
                pwmapGenerate();
            }
            pwmap_map = JSON.parse(files.read(pwmap_path));
        }

        function userInput(msg) {
            let input = "",
                safe_max_try_times = 20;
            while (safe_max_try_times--) {
                input = dialogs.rawInput(msg + "\n点击其他区域放弃输入");
                if (input === null) {
                    exit();
                } else if (!input) {
                    toast("输入内容无效");
                    continue;
                }
                break;
            }
            if (safe_max_try_times < 0) ~toast("已达最大尝试次数") && exit();

            return input;
        }

        function monitorRunningTime(msg) {
            return threads.start(function () {
                msg = msg || "运行中 请稍候...";
                sleep(1200);
                toast(msg);
                let count = 0;
                while (~sleep(1000) && ~count++) {
                    if (count % 5) continue;
                    toast(msg);
                }
            });
        }
    };
} // updated at Nov 14, 2019

function loadInternalModuleStorage() {
    return (function () {
        let storages = {};

        storages.create = function (name) {
            return new Storage(name);
        };

        storages.remove = function (name) {
            this.create(name).clear();
        };

        return storages;

        // constructor //

        function Storage(name) {
            let storage_dir = files.getSdcardPath() + "/.local/";
            let file = createFile(storage_dir);
            let opened = files.open(file);
            let readFile = () => files.read(file);

            this.contains = contains;
            this.get = get;
            this.put = put;
            this.remove = remove;
            this.clear = clear;

            function createFile(dir) {
                let file = dir + name + ".nfe";
                files.createWithDirs(file);
                return file;
            }

            function contains(key) {
                let read = readFile();
                if (!read) return false;
                return key in JSON.parse(read);
            }

            function put(key, value) {
                if (typeof value === "undefined") throw new TypeError("\"put\" value can't be undefined");
                let read = readFile();
                let obj = read && JSON.parse(read, (key, value) => value === "Infinity" ? Infinity : value) || {};
                let new_obj = {};
                new_obj[key] = value;
                Object.assign(obj, new_obj);
                files.write(file, JSON.stringify(obj, (key, value) => value === Infinity ? "Infinity" : value));
                opened.close();
            }

            function get(key, value) {
                let read = readFile();
                if (!read) return value;
                try {
                    let obj = JSON.parse(read, (key, value) => value === "Infinity" ? Infinity : value) || {};
                    return key in obj ? obj[key] : value;
                } catch (e) {
                    console.warn(e.message);
                    return value;
                }
            }

            function remove(key) {
                let read = readFile();
                if (!read) return;
                let obj = JSON.parse(read);
                if (!(key in obj)) return;
                delete obj[key];
                files.write(file, JSON.stringify(obj));
                opened.close();
            }

            function clear() {
                files.remove(file);
            }
        }
    })();
} // updated at Nov 14, 2019