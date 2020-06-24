"ui";

/**
 * @description graphic configuration tool for unlock module
 *
 * @example
 * require("./MODULE_UNLOCK").unlock();
 *
 * @since Jan 9, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

// set up the device screen in a portrait orientation
let _ActInfo = android.content.pm.ActivityInfo;
let _SCR_OR_VERT = _ActInfo.SCREEN_ORIENTATION_PORTRAIT;
activity.setRequestedOrientation(_SCR_OR_VERT);

// script will not go on without a normal state of accessibility service
// auto.waitFor() was abandoned here, as it may cause problems sometimes
auto();

let _require = require.bind(global); // copy global.require(){}

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
}; // override global.require(){}

let dialogs = loadInternalModuleDialog(runtime, global);

let {
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

let {WIDTH, cX} = (() => {
    let _mod = require("../Modules/EXT_DEVICE");
    return _mod ? _mod.getDisplay() : _getDisplay();
})();

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

let encrypt = (require("../Modules/MODULE_PWMAP") || loadInternalModulePWMAP()).encrypt;

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
    threads.start(function () {
        let btn_save = null;
        waitForAction(() => btn_save = session_params["homepage_btn_save"], 10e3, 80);
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
        newWindow() {
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
        updateOpr(view) {
            view._hint.text(session_config[this.config_conj] ? "已设置" : "空");
        },
    }))
    .add("split_line")
    .add("subhead", new Layout("高级设置"))
    .add("button", new Layout("最大尝试次数", {
        config_conj: "unlock_max_try_times",
        hint: "加载中...",
        newWindow() {
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
        updateOpr(view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
        },
    }))
    .add("split_line")
    .add("subhead", new Layout("提示层页面设置", {subhead_color: "#bf360c"}))
    .add("button", new Layout("上滑时长", {
        config_conj: "unlock_dismiss_layer_swipe_time",
        hint: "加载中...",
        newWindow() {
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
        updateOpr(view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString() + " ms");
        },
    }))
    .add("button", new Layout("起点位置", {
        config_conj: "unlock_dismiss_layer_bottom",
        hint: "加载中...",
        newWindow() {
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
        updateOpr(view) {
            let value = (session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]) * 100;
            view._hint.text(value.toString() + "% H");
        },
    }))
    .add("button", new Layout("终点位置", {
        config_conj: "unlock_dismiss_layer_top",
        hint: "加载中...",
        newWindow() {
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
        updateOpr(view) {
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
        newWindow() {
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
        updateOpr(view) {
            view._hint.text(this.map[(session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString()]);
        },
    }))
    .add("button", new Layout("滑动时长", {
        config_conj: () => "unlock_pattern_swipe_time_"
            + (session_config.unlock_pattern_strategy || DEFAULT_UNLOCK.unlock_pattern_strategy),
        hint: "加载中...",
        newWindow() {
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
        updateOpr(view) {
            let config_conj = this.config_conj();
            view._hint.text((session_config[config_conj] || DEFAULT_UNLOCK[config_conj]).toString() + " ms");
        },
    }))
    .add("button", new Layout("点阵边长", {
        config_conj: "unlock_pattern_size",
        hint: "加载中...",
        newWindow() {
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
        updateOpr(view) {
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
    global.dialogs_pool.forEach((diag) => {
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
            new_view._seekbar.setOnSeekBarChangeListener(
                new android.widget.SeekBar.OnSeekBarChangeListener({
                    onProgressChanged(seek_bar, progress, from_user) {
                        let result = progress + min;
                        update(result);
                        $$save.session(config_conj, result);
                    },
                    onStartTrackingTouch: (seek_bar) => void 0,
                    onStopTrackingTouch: (seek_bar) => void 0,
                })
            );

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

// constructor(s) //

function Layout(title, params) {
    params = params || {};
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
                get() {
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

// updated at Nov 14, 2019
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
    };

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
    };

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
    };

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
    };

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
    };

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

    };

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
        global.dialogs_pool = (global.dialogs_pool || []).concat([final_dialog]);
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
        if (str == null) {
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
}

// updated at Jan 21, 2020
function loadInternalModuleMonsterFunc() {
    return {
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
        global["_$_alert_title_info"] = global["_$_alert_title_info"] || {};
        let alert_title_info = global["_$_alert_title_info"];
        alert_title_info[dialog] = alert_title_info[dialog] || {};
        alert_title_info["message_showing"] ? alert_title_info["message_showing"]++ : (alert_title_info["message_showing"] = 1);

        let ori_text = alert_title_info[dialog].ori_text || "";
        let ori_text_color = alert_title_info[dialog].ori_text_color || "";
        let ori_bg_color = alert_title_info[dialog].ori_bg_color || "";

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
        }, duration || 3e3);

        // tool function(s) //

        function setTitleInfo(dialog, text, color, bg) {
            let title_view = dialog.getTitleView();
            title_view.setText(text);
            title_view.setTextColor(color);
            title_view.setBackgroundColor(bg);
        }
    }

    function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
        let $_flag = global.$$flag = global.$$flag || {};

        if ($_flag.no_msg_act_flag) return !(msg_level in {3: 1, 4: 1});

        let _msg = msg || "";
        if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
            return messageAction("[ " + msg + " ]", 1, if_toast, if_arrow, if_split_line, params);
        }

        let _msg_lv = typeof msg_level === "number" ? msg_level : -1;
        let _if_toast = if_toast || false;
        let _if_arrow = if_arrow || false;
        let _if_spl_ln = if_split_line || false;
        _if_spl_ln = ~if_split_line ? _if_spl_ln : "up"; // -1 -> "up"

        let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;

        if (_if_toast) toast(_msg);

        let _spl_ln_style = "solid";
        let _saveLnStyle = () => $_flag.last_cnsl_spl_ln_type = _spl_ln_style;
        let _loadLnStyle = () => $_flag.last_cnsl_spl_ln_type;
        let _clearLnStyle = () => delete $_flag.last_cnsl_spl_ln_type;
        let _matchLnStyle = () => _loadLnStyle() === _spl_ln_style;

        if (typeof _if_spl_ln === "string") {
            if (_if_spl_ln.match(/dash/)) _spl_ln_style = "dash";
            if (_if_spl_ln.match(/both|up/)) {
                if (!_matchLnStyle()) _showSplitLine("", _spl_ln_style);
                if (_if_spl_ln.match(/_n|n_/)) _if_spl_ln = "\n";
                else if (_if_spl_ln.match(/both/)) _if_spl_ln = 1;
                else if (_if_spl_ln.match(/up/)) _if_spl_ln = 0;
            }
        }

        _clearLnStyle();

        if (_if_arrow) {
            if (_if_arrow > 10) {
                console.warn('-> "if_arrow"参数大于10');
                _if_arrow = 10;
            }
            _msg = "> " + _msg;
            for (let i = 0; i < _if_arrow; i += 1) _msg = "-" + _msg;
        }

        let _exit_flag = false;
        let _throw_flag = false;
        switch (_msg_lv) {
            case 0:
            case "verbose":
            case "v":
                _msg_lv = 0;
                console.verbose(_msg);
                break;
            case 1:
            case "log":
            case "l":
                _msg_lv = 1;
                console.log(_msg);
                break;
            case 2:
            case "i":
            case "info":
                _msg_lv = 2;
                console.info(_msg);
                break;
            case 3:
            case "warn":
            case "w":
                _msg_lv = 3;
                console.warn(_msg);
                break;
            case 4:
            case "error":
            case "e":
                _msg_lv = 4;
                console.error(_msg);
                break;
            case 8:
            case "x":
                _msg_lv = 4;
                console.error(_msg);
                _exit_flag = true;
                break;
            case 9:
            case "t":
                _msg_lv = 4;
                console.error(_msg);
                _throw_flag = true;
        }

        if (_if_spl_ln) {
            let _spl_ln_extra = "";
            if (typeof _if_spl_ln === "string") {
                if (_if_spl_ln.match(/dash/)) {
                    _spl_ln_extra = _if_spl_ln.match(/_n|n_/) ? "\n" : ""
                } else {
                    _spl_ln_extra = _if_spl_ln;
                }
            }
            if (!_spl_ln_extra.match(/\n/)) _saveLnStyle();
            _showSplitLine(_spl_ln_extra, _spl_ln_style);
        }

        if (_throw_flag) {
            ui.post(function () {
                throw ("FORCE_STOP");
            });
            exit();
        }

        if (_exit_flag) exit();

        return !(_msg_lv in {3: 1, 4: 1});

        // raw function(s) //

        function showSplitLineRaw(extra_str, style) {
            let _extra_str = extra_str || "";
            let _split_line = "";
            if (style === "dash") {
                for (let i = 0; i < 17; i += 1) _split_line += "- ";
                _split_line += "-";
            } else {
                for (let i = 0; i < 33; i += 1) _split_line += "-";
            }
            return ~console.log(_split_line + _extra_str);
        }
    }

    function showSplitLine(extra_str, style, params) {
        let _extra_str = extra_str || "";
        let _split_line = "";
        if (style === "dash") {
            for (let i = 0; i < 17; i += 1) _split_line += "- ";
            _split_line += "-";
        } else {
            for (let i = 0; i < 33; i += 1) _split_line += "-";
        }
        return !!~console.log(_split_line + _extra_str);
    }

    function waitForAction(f, timeout_or_times, interval) {
        if (typeof timeout_or_times !== "number") timeout_or_times = 10e3;

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

            _messageAction('"waitForAction"传入f参数不合法\n\n' + f.toString() + '\n', 8, 1, 1, 1);
        }

        // raw function(s) //

        function messageActionRaw(msg, lv, if_toast) {
            let _s = msg || " ";
            if (lv && lv.toString().match(/^t(itle)?$/)) {
                let _par = ["[ " + msg + " ]", 1, if_toast];
                return messageActionRaw.apply({}, _par);
            }
            let _lv = +lv;
            if (if_toast) {
                toast(_s);
            }
            if (_lv >= 3) {
                if (_lv >= 4) {
                    console.error(_s);
                    if (_lv >= 8) {
                        exit();
                    }
                } else {
                    console.warn(_s);
                }
                return;
            }
            if (_lv === 0) {
                console.verbose(_s);
            } else if (_lv === 1) {
                console.log(_s);
            } else if (_lv === 2) {
                console.info(_s);
            }
            return true;
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
                return shellInputKeyEvent(keycode_name) ? _waitForAction(isScreenOff, 2.4e3) : false;
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
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
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

    function classof(source, check_value) {
        let class_result = Object.prototype.toString.call(source).slice(8, -1);
        return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
    }
}

// updated at Nov 14, 2019
function loadInternalDialogContents() {
    return {
        dialog_contents: {
            unlock_code: // 设置锁屏解锁密码
                "密码长度不小于 3 位\n" +
                "无密码请留空\n\n" +
                "若采用图案解锁方式\n" +
                "总点阵数大于 9 需使用逗号分隔\n" +
                "图案解锁密码将自动简化\n" +
                '详情点击"查看示例"',
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
                '请点击"了解详情"\n\n' +
                "确定要继续吗",
            about_lost_device_solution: // 关于设备遗失对策
                "一旦设备遗失或被盗\n" +
                "可通过以下方式\n" +
                "将可能的损失降到最低\n\n" +
                '* 利用"查找我的设备"功能\n\n' +
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
                "将所有坐标作为参数传入\n" +
                "完成一次性不间断滑动\n" +
                "优点:\n" +
                "1. 滑动路径不会断开\n" +
                "2. 滑动总时长=给定参数\n" +
                "缺点:\n" +
                "1. 极易发生拐点偏移现象\n" +
                "2. 拐点数及分布极大影响成功率\n\n" +
                '* 不同策略对应不同"滑动时长"参数\n' +
                '* 推荐优先使用"叠加路径"策略\n' +
                "-- 当出现路径断开现象时\n" +
                '-- 可尝试"连续路径"策略',
            unlock_pattern_swipe_time_segmental: // 设置图案解锁滑动时长 - 叠加路径策略
                "此参数表示两拐点间滑动时长\n" +
                "并非表示滑动总时间\n" +
                "总时间=(拐点数+1)×此参数\n" +
                '如"1379"包含两个拐点\n' +
                "参数给定为120ms\n" +
                "则总时长=(2+1)×120ms\n" +
                "即360ms\n" +
                '如"12369"有一个拐点\n' +
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
}

// updated at Jun 24, 2020
function loadInternalModulePWMAP() {
    let _path = "";
    let _dic = {};
    let _cfg = {
        // {SCPrMtaB:"A"}
        code_length: 8,
        // {1:"A",2:"A", ... 10:"A"}
        code_amount: 10,
        separator: "_.|._",
        encrypt_power: 2,
    };
    let $_nul = x => x === null;
    let $_und = x => typeof x === "undefined";
    let $_str = x => typeof x === "string";

    return {
        encrypt: _encrypt,
        decrypt: _decrypt,
        generate: _generate,
    };

    // main function(s) //

    function _encrypt(input) {
        _initDic();
        let _empty = !arguments.length;
        let _input = _empty && _userInput(0) || input;
        let _pwr = Math.min(_cfg.encrypt_power, 2) || 1;
        let _rex = /[A-Za-z0-9`~!@#$%^&*()_+=\-\[\]}{'\\;:\/?.>,<| ]/;

        let _thd_mon = _thdMonitor(0);
        let _encrypted = _enc(_input);
        while (--_pwr) {
            _input = _encrypted.join(_cfg.separator);
            _encrypted = _enc(_input);
        }
        _thd_mon.interrupt();

        let _raw = _encrypted.map((s) => '"' + s + '"');
        let _res = "[" + _raw + "]";
        if (_empty) {
            setClip(_res);
            toast("密文数组已复制剪切板");
        }
        return _res;

        // tool function(s) //

        function _enc(str) {
            let _res = [];
            let _str = str.toString();
            let _len = _str.length;
            for (let i = 0; i < _len; i += 1) {
                let _s = _str[i];
                if (_s.match(_rex)) {
                    _res.push(_rand(_s));
                } else {
                    let _sglStr = s => {
                        let _cc = s.charCodeAt(0);
                        let _cc_hex = _cc.toString(16);
                        return _cc_hex.toUpperCase();
                    };
                    let _tmp = "";
                    _s.split("").forEach((s, i) => {
                        _tmp += (i ? "|" : "") + _sglStr(s);
                    });
                    let _raw = "\\u" + _tmp.split("|").map((s) => {
                        return ("0000" + s).slice(-4);
                    }).join("\\u");
                    _res = _res.concat(_enc(_raw));
                }
            }
            return _res;
        }

        function _rand(str) {
            let _tmp = [];
            for (let k in _dic) {
                if (_dic.hasOwnProperty(k)) {
                    _dic[k] === str && _tmp.push(k);
                }
            }
            let _num = Math.random() * _cfg.code_amount;
            return _tmp[Math.trunc(_num)];
        }
    }

    function _decrypt(input) {
        _initDic();
        let _empty = !arguments.length;
        let _input = _empty && _userInput(1) || input;
        let _thd_mon = _thdMonitor(1);
        let _decrypted = _dec(_input);
        _thd_mon.interrupt();
        if (_empty) {
            setClip(_decrypted);
            toast("解密字符串已复制剪切板");
        }
        return _decrypted;

        // tool function(s) //

        function _dec(arr) {
            if ($_und(arr)) {
                return "";
            }
            if ($_nul(arr)) {
                return null;
            }
            if ($_str(arr)) {
                if (!arr.length) {
                    return "";
                }
                if (arr[0] !== "[") {
                    toast("输入的加密字符串不合法");
                    exit();
                }
                let _raw = arr.slice(1, -1).split(/, ?/);
                arr = _raw.map((s) => {
                    return s.replace(/^"([^]+)"$/g, "$1");
                });
            }

            let _shift = 0;
            let _res = "";
            let _sep = _cfg.separator;
            while (1) {
                let _len = arr.length;
                for (let i = 0; i < _len; i += 1) {
                    if (_shift) {
                        i += _shift;
                        _shift = 0;
                        continue;
                    }
                    let _di = _dic[arr[i]];
                    let _dj = _dic[arr[i + 1]];
                    if ($_und(_di)) {
                        return "";
                    }
                    if (_di === "\\" && _dj === "u") {
                        let _tmp = "";
                        for (let j = 0; j < 4; j += 1) {
                            _tmp += _dic[arr[i + j + 2]];
                        }
                        _res += String.fromCharCode(
                            parseInt(_tmp, 16)
                        );
                        _shift = 4;
                    } else {
                        _res += _di;
                    }
                }
                if (!~_res.indexOf(_sep)) {
                    let _try_dec = _dec([_res]);
                    if (_try_dec) {
                        return _try_dec;
                    }
                    break;
                }
                arr = _res.split(_sep);
                _res = "";
            }
            return _res;
        }
    }

    function _generate() {
        if (files.exists(_path)) {
            confirm(
                "密文文件已存在\n" +
                "继续操作将覆盖已有文件\n" +
                "新的密文文件生成后\n" +
                "涉及密文的全部相关代码\n" +
                "均需重新设置才能解密\n" +
                "确定要继续吗?"
            ) || exit();
        }

        files.createWithDirs(_path);
        files.open(_path);

        // eg: {SCPrMtaB:"A",doaAisDd:"%"}
        let _res = {};
        let _az = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
        let _all = "~!@#$%^&*`'-_+=,./ 0123456789:;?()[]<>{}|" + "\"\\" + _az;
        let _randAz = () => _az[Math.trunc(Math.random() * _az.length)];
        let _li = _all.length;
        let _lj = _cfg.code_amount;
        let _lk = _cfg.code_length;
        for (let i = 0; i < _li; i += 1) {
            for (let j = 0; j < _lj; j += 1) {
                let _code = "";
                for (let k = 0; k < _lk; k += 1) {
                    _code += _randAz();
                }
                _res[_code] = _all[i];
            }
        }
        files.write(_path, JSON.stringify(_res));
        toast("密文文件生成完毕");
    }

    // tool function(s) //

    function _initDic() {
        let _root = files.getSdcardPath();
        _path = _root + "/.local/PWMAP.txt";
        if (!files.exists(_path)) {
            _showMsg();
            _generate();
        }
        _dic = JSON.parse(files.read(_path));

        // tool function(s) //

        function _showMsg() {
            let _s = "已生成新密文字典";

            _splitLine();
            toastLog(_s);
            _splitLine();

            // tool function(s) //

            function _splitLine() {
                let [_ln, _i] = ["", 33];
                while (_i--) _ln += "-";
                console.log(_ln);
            }
        }
    }

    function _userInput(dec) {
        let _inp = "";
        let _max = 20;
        let _msg = dec ?
            "请输入要解密的字符串数组" :
            "请输入要加密的字符串";
        while (_max--) {
            _inp = dialogs.rawInput(
                "请输入要" + _msg + "的字符串\n" +
                "点击其他区域放弃输入"
            );
            if (_inp) {
                break;
            }
            if ($_nul(_inp)) {
                exit();
            }
            toast("输入内容无效");
        }
        if (_max >= 0) {
            return _inp;
        }
        toast("已达最大尝试次数");
        exit();
    }

    function _thdMonitor(dec) {
        return threads.start(function () {
            let _msg = dec
                ? "正在解密中 请稍候..."
                : "正在加密中 请稍候...";
            sleep(2.4e3);
            let _ctr = 0;
            while (1) {
                _ctr++ % 5 || toast(_msg);
                sleep(1e3);
            }
        });
    }
}

// updated at Jun 24, 2020
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

        // constructor(s) //

        function Storage(name) {
            let _dir = files.getSdcardPath() + "/.local/";
            let _full_path = _dir + name + ".nfe";
            files.createWithDirs(_full_path);
            let _opened = files.open(_full_path);
            let _readFile = () => files.read(_full_path);

            this.contains = _contains;
            this.get = _get;
            this.put = _put;
            this.remove = _remove;
            this.clear = _clear;

            // tool function(s) //

            function _replacer(k, v) {
                if (typeof v === "number") {
                    if (isNaN(v) || !isFinite(v)) {
                        /** Zero Width No-Break Space */
                        let _pad = "\ufeff";
                        return _pad + v.toString() + _pad;
                    }
                }
                return v;
            }

            function _reviver(k, v) {
                if (typeof v === "string") {
                    let _rex = /^\ufeff(.+)\ufeff$/;
                    if (v.match(_rex)) {
                        return +v.replace(_rex, "$1");
                    }
                }
                return v;
            }

            function _contains(key) {
                return key in _jsonParseFile();
            }

            function _put(key, new_val, forc) {
                if (typeof new_val === "undefined") {
                    let _m = '"put" value can\'t be undefined';
                    throw new TypeError(_m);
                }

                let _old_data = {};
                let _tmp_data = {};

                try {
                    _old_data = _jsonParseFile(_reviver);
                } catch (e) {
                    console.warn(e.message);
                }

                let _cA = _classof(new_val, "Object");
                let _cB = _classof(_old_data[key], "Object");
                let _both_type_o = _cA && _cB;
                let _keyLen = () => Object.keys(new_val).length;

                if (!forc && _both_type_o && _keyLen()) {
                    _tmp_data[key] = Object.assign(
                        _old_data[key], new_val
                    );
                } else {
                    _tmp_data[key] = new_val;
                }

                files.write(_full_path, JSON.stringify(
                    Object.assign(_old_data, _tmp_data), _replacer, 2
                ));
                _opened.close();
            }

            function _get(key, value) {
                let _o = _jsonParseFile(_reviver);
                if (_o && key in _o) {
                    return _o[key];
                }
                return value;
            }

            function _remove(key) {
                let _o = _jsonParseFile();
                if (key in _o) {
                    delete _o[key];
                    files.write(_full_path, JSON.stringify(_o));
                    _opened.close();
                }
            }

            function _clear() {
                files.remove(_full_path);
            }

            function _classof(src, chk) {
                let _s = Object.prototype.toString.call(src).slice(8, -1);
                return chk ? _s.toUpperCase() === chk.toUpperCase() : _s;
            }

            function _jsonParseFile(reviver) {
                let _str = _readFile();
                try {
                    return _str ? JSON.parse(_str, reviver) : {};
                } catch (e) {
                    console.warn("JSON.parse()解析配置文件异常");
                    console.warn("尝试查找并修复异常的转义字符");

                    let _backslash_rex = /[ntrfb\\'"0xu]/;
                    let _str_new = "";

                    for (let i in _str) {
                        let _i = +i;
                        let _s = _str[_i];
                        if (_s === "\\") {
                            let _prev_s = _str[_i - 1];
                            let _next_s = _str[_i + 1];
                            if (_prev_s && _next_s) {
                                if (_prev_s !== "\\") {
                                    if (!_next_s.match(_backslash_rex)) {
                                        _s += "\\";
                                    }
                                }
                            }
                        }
                        _str_new += _s;
                    }

                    try {
                        let _res = JSON.parse(_str_new, reviver);
                        console.info("修复成功");
                        files.write(_full_path, _str_new);
                        console.info("已重新写入修复后的数据");
                        return _res;
                    } catch (e) {
                        let _new_file_name = name + ".nfe." + Date.now() + ".bak";

                        files.rename(_full_path, _new_file_name);
                        console.error("修复失败");
                        console.warn("已将损坏的配置文件备份至");
                        console.warn(_dir + _new_file_name);
                        console.warn("以供手动排查配置文件中的问题");

                        throw Error(e);
                    }
                }
            }
        }
    })();
}

// updated: May 29, 2020
function _getDisplay(global_assign, params) {
    let $_flag = global.$$flag = global.$$flag || {};
    let _par, _glob_asg;
    if (typeof global_assign === "boolean") {
        _par = params || {};
        _glob_asg = global_assign;
    } else {
        _par = global_assign || {};
        _glob_asg = _par.global_assign;
    }

    let _waitForAction = typeof waitForAction === "undefined"
        ? waitForActionRaw
        : waitForAction;
    let _debugInfo = (m, fg) => (typeof debugInfo === "undefined"
        ? debugInfoRaw
        : debugInfo)(m, fg, _par.debug_info_flag);

    let _W, _H;
    let _disp = {};
    let _metrics = new android.util.DisplayMetrics();
    let _win_svc = context.getSystemService(context.WINDOW_SERVICE);
    let _win_svc_disp = _win_svc.getDefaultDisplay();
    _win_svc_disp.getRealMetrics(_metrics);

    if (!_waitForAction(() => _disp = _getDisp(), 3e3, 500)) {
        console.error("device.getDisplay()返回结果异常");
        return {cX: cX, cY: cY, cYx: cYx};
    }
    _showDisp();
    _assignGlob();
    return Object.assign(_disp, {cX: cX, cY: cY, cYx: cYx});

    // tool function(s) //

    function cX(num, base) {
        return _cTrans(1, +num, base);
    }

    function cY(num, base) {
        return _cTrans(-1, +num, base);
    }

    function cYx(num, base) {
        num = +num;
        base = +base;
        if (num >= 1) {
            if (!base) {
                base = 720;
            } else if (base < 0) {
                if (!~base) {
                    base = 720;
                } else if (base === -2) {
                    base = 1080;
                } else {
                    throw Error(
                        "can not parse base param for cYx()"
                    );
                }
            } else if (base < 5) {
                throw Error(
                    "base and num params should " +
                    "both be pixels for cYx()"
                );
            }
            return Math.round(num * _W / base);
        }

        if (!base || !~base) {
            base = 16 / 9;
        } else if (base === -2) {
            base = 21 / 9;
        } else if (base < 0) {
            throw Error(
                "can not parse base param for cYx()"
            );
        } else {
            base = base < 1 ? 1 / base : base;
        }
        return Math.round(num * _W * base);
    }

    function _cTrans(dxn, num, base) {
        let _full = ~dxn ? _W : _H;
        if (isNaN(num)) {
            throw Error("can not parse num param for cTrans()");
        }
        if (Math.abs(num) < 1) {
            return Math.min(Math.round(num * _full), _full);
        }
        let _base = base;
        if (!base || !~base) {
            _base = ~dxn ? 720 : 1280;
        } else if (base === -2) {
            _base = ~dxn ? 1080 : 1920;
        }
        let _ct = Math.round(num * _full / _base);
        return Math.min(_ct, _full);
    }

    function _showDisp() {
        if ($_flag.debug_info_avail && !$_flag.display_params_got) {
            _debugInfo("屏幕宽高: " + _W + " × " + _H);
            _debugInfo("可用屏幕高度: " + _disp.USABLE_HEIGHT);
            $_flag.display_params_got = true;
        }
    }

    function _getDisp() {
        try {
            _W = _win_svc_disp.getWidth();
            _H = _win_svc_disp.getHeight();
            if (!(_W * _H)) {
                throw Error();
            }

            // if the device is rotated 90 degrees counter-clockwise,
            // to compensate rendering will be rotated by 90 degrees clockwise
            // and thus the returned value here will be Surface#ROTATION_90
            // 0: 0°, device is portrait
            // 1: 90°, device is rotated 90 degree counter-clockwise
            // 2: 180°, device is reverse portrait
            // 3: 270°, device is rotated 90 degree clockwise
            let _SCR_O = _win_svc_disp.getRotation();
            let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
            // let _MAX = +_win_svc_disp.maximumSizeDimension;
            let _MAX = Math.max(_metrics.widthPixels, _metrics.heightPixels);

            let [_UH, _UW] = [_H, _W];
            let _dimen = (name) => {
                let resources = context.getResources();
                let resource_id = resources.getIdentifier(name, "dimen", "android");
                if (resource_id > 0) {
                    return resources.getDimensionPixelSize(resource_id);
                }
                return NaN;
            };

            _is_scr_port ? [_UH, _H] = [_H, _MAX] : [_UW, _W] = [_W, _MAX];

            return {
                WIDTH: _W,
                USABLE_WIDTH: _UW,
                HEIGHT: _H,
                USABLE_HEIGHT: _UH,
                screen_orientation: _SCR_O,
                status_bar_height: _dimen("status_bar_height"),
                navigation_bar_height: _dimen("navigation_bar_height"),
                navigation_bar_height_computed: _is_scr_port ? _H - _UH : _W - _UW,
                action_bar_default_height: _dimen("action_bar_default_height"),
            };
        } catch (e) {
            try {
                _W = +device.width;
                _H = +device.height;
                return _W && _H && {
                    WIDTH: _W,
                    HEIGHT: _H,
                    USABLE_HEIGHT: Math.trunc(_H * 0.9),
                };
            } catch (e) {
            }
        }
    }

    function _assignGlob() {
        if (_glob_asg) {
            Object.assign(global, {
                W: _W, WIDTH: _W,
                halfW: Math.round(_W / 2),
                uW: _disp.USABLE_WIDTH,
                H: _H, HEIGHT: _H,
                uH: _disp.USABLE_HEIGHT,
                scrO: _disp.screen_orientation,
                staH: _disp.status_bar_height,
                navH: _disp.navigation_bar_height,
                navHC: _disp.navigation_bar_height_computed,
                actH: _disp.action_bar_default_height,
                cX: cX, cY: cY, cYx: cYx,
            });
        }
    }

    // raw function(s) //

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function debugInfoRaw(msg, info_flag) {
        if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }
}