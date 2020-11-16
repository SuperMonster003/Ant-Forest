// noinspection BadExpressionStatementJS
"ui"; // Auto.js UI mode with global object `activity`

/**
 * Configuration tool for unlock module
 * @since Nov 4, 2020
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
    for (let i = 0, l = path.match(/\//g).length; i < l; i += 1) {
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

let dialogsx = loadInternalModuleDialog();

let {
    equalObjects, deepCloneObject, waitForAction, classof
} = require("../Modules/MODULE_MONSTER_FUNC") || loadInternalModuleMonsterFunc();

let sess_par = {};
let view_pages = {};
let dynamic_views = [];

let {WIDTH, cX} = (() => {
    let _mod = require("    /EXT_DEVICE");
    return _mod ? _mod.getDisplay() : {WIDTH: device.width, cX: x => device.width * x};
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
        unlock_dismiss_layer_strategy: "preferred",
        unlock_dismiss_layer_bottom: 0.8,
        unlock_dismiss_layer_top: 0.2,
        unlock_dismiss_layer_swipe_time: 110,
    }; // updated: Nov 11, 2020

let DEFAULT_SETTINGS = (require("../Modules/MODULE_DEFAULT_CONFIG") || {}).settings || {
    item_area_width: 0.78,
    subhead_color: "#03a6ef",
    subhead_highlight_color: "#bf360c",
    info_color: "#78909c",
    title_default_color: "#202020",
    title_caution_color: "#880e4f",
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
};  // updated: Nov 4, 2020

let encrypt = (require("../Modules/MODULE_PWMAP") || loadInternalModulePWMAP()).encrypt;
let storage_unlock = (require("../Modules/MODULE_STORAGE") || loadInternalModuleStorage()).create("unlock");
let storage_config = initStorageConfig();
let sess_cfg = deepCloneObject(storage_config);

let needSave = () => !equalObjects(sess_cfg, storage_config);
let saveNow = () => storage_unlock.put("config", storage_config = deepCloneObject(sess_cfg));
let saveSession = (key, value, quiet_flag) => {
    if (value !== undefined) {
        if (classof(value, "Object") && classof(sess_cfg[key], "Object")) {
            Object.keys(value).forEach((k) => {
                let v = value[k];
                sess_cfg[key][k] = typeof v === "object" ? Object.assign({}, sess_cfg[key][k], v) : v;
            })
        } else {
            sess_cfg[key] = value;
        }
    }
    if (!quiet_flag) {
        updateAllValues();
        threads.start(function () {
            let btn_save = null;
            waitForAction(() => btn_save = sess_par["homepage_btn_save"], 10e3, 80);
            ui.post(() => needSave() ? btn_save.switch_on() : btn_save.switch_off());
        });
    }
};
let updateAllValues = (only_new_flag) => {
    let raw_idx = sess_par.dynamic_views_raw_idx || 0;
    dynamic_views.slice(only_new_flag ? raw_idx : 0).forEach(view => view.updateOpr(view));
    if (only_new_flag) sess_par.dynamic_views_raw_idx = dynamic_views.length;
};

let defs = Object.assign({}, DEFAULT_SETTINGS, {
    homepage_title: "自动解锁配置",
    item_area_width: cX(DEFAULT_SETTINGS.item_area_width) + "px",
    title_bg_color: "#000000",
    dialog_contents: (require("../Modules/MODULE_TREASURY_VAULT") || loadInternalDialogContents()).dialog_contents,
});

ui.layout(<vertical id="main">
    <frame/>
</vertical>);
ui.statusBarColor("#000000");

setHomePage(defs.homepage_title)
    .add("subhead", new Layout("基本设置"))
    .add("button", new Layout("锁屏密码", {
        config_conj: "unlock_code",
        hint: "加载中...",
        newWindow() {
            dialogsx
                .builds([
                    "设置锁屏解锁密码", this.config_conj,
                    ["查看示例", "hint_btn_bright_color"], "返回", "确认", 1
                ], {inputHint: "密码将以密文形式存储在本地"})
                .on("neutral", () => {
                    dialogsx.builds([
                        "锁屏密码示例", "unlock_code_demo",
                        ["了解点阵简化", "hint_btn_bright_color"], 0, "关闭", 1
                    ]).on("neutral", () => {
                        dialogsx.builds([
                            "图案解锁密码简化", "about_pattern_simplification",
                            0, 0, "关闭", 1
                        ]).on("positive", ds => ds.dismiss()).show();
                    }).on("positive", (d) => {
                        d.dismiss();
                    }).show();
                })
                .on("negative", (d) => {
                    d.dismiss();
                })
                .on("positive", (d) => {
                    let input = dialogsx.getInputText(d);
                    if (input && input.length < 3) {
                        return dialogsx.alertTitle(d, "密码长度不小于 3 位");
                    }
                    if (input && !storage_unlock.get("unlock_code_safe_dialog_prompt_prompted")) {
                        let safety_prompted = false;
                        dialogsx
                            .builds([
                                "风险提示", "unlock_code_safe_confirm",
                                ["了解详情", "hint_btn_bright_color"], "放弃",
                                ["继续", "caution_btn_color"], 1, 1
                            ])
                            .on("check", (checked) => {
                                safety_prompted = !!checked;
                            })
                            .on("neutral", () => {
                                let diag_about = dialogsx.builds([
                                    "设备遗失对策", "about_lost_device_solution",
                                    0, 0, "关闭", 1
                                ]).on("positive", ds2 => ds2.dismiss()).show();
                                let cnt_view = diag_about.getContentView();
                                let cnt_text_bak = cnt_view.getText().toString();
                                cnt_view.setAutoLinkMask(android.text.util.Linkify.WEB_URLS);
                                cnt_view.setText(cnt_text_bak);
                            })
                            .on("negative", (ds) => {
                                ds.dismiss();
                            })
                            .on("positive", (ds) => {
                                if (safety_prompted) {
                                    storage_unlock.put("unlock_code_safe_dialog_prompt_prompted", true);
                                }
                                saveSession(this.config_conj, input ? encrypt(input) : "");
                                d.dismiss();
                                ds.dismiss();
                            })
                            .show();
                    } else {
                        saveSession(this.config_conj, input ? encrypt(input) : "");
                        d.dismiss();
                    }
                })
                .show();
        },
        updateOpr(view) {
            view["_hint"].text(sess_cfg[this.config_conj] ? "已设置" : "空");
        },
    }))
    .add("split_line")
    .add("subhead", new Layout("高级设置"))
    .add("button", new Layout("最大尝试次数", {
        config_conj: "unlock_max_try_times",
        hint: "加载中...",
        newWindow() {
            let diag = dialogsx.builds([
                "设置解锁最大尝试次数", "",
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|5<=x<=50,x∈N}"});
            diag.on("neutral", () => dialogsx.setInputText(diag, DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", (dialog) => {
                let input = dialogsx.getInputText(diag);
                if (input === "") return dialog.dismiss();
                let value = +input;
                if (isNaN(value)) return dialogsx.alertTitle(dialog, "输入值类型不合法");
                if (value > 50 || value < 5) return dialogsx.alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr(view) {
            view["_hint"].text((sess_cfg[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
        },
    }))
    .add("split_line")
    .add("subhead", new Layout("提示层页面设置", {subhead_color: "#bf360c"}))
    .add("button", new Layout("上滑时长", {
        config_conj: "unlock_dismiss_layer_swipe_time",
        hint: "加载中...",
        newWindow() {
            let diag = dialogsx.builds([
                "提示层页面上滑时长", this.config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|110<=x<=1000,x∈N}"});
            diag.on("neutral", () => dialogsx.setInputText(diag, DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", (dialog) => {
                let input = dialogsx.getInputText(diag);
                if (input === "") return dialog.dismiss();
                let value = +input;
                if (isNaN(value)) return dialogsx.alertTitle(dialog, "输入值类型不合法");
                if (value > 1000 || value < 110) return dialogsx.alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr(view) {
            view["_hint"].text((sess_cfg[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString() + " ms");
        },
    }))
    .add("button", new Layout("起点位置", {
        config_conj: "unlock_dismiss_layer_bottom",
        hint: "加载中...",
        newWindow() {
            let diag = dialogsx.builds([
                "提示层页面起点位置", this.config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|0.5<=x<=0.95,x∈R+}"});
            diag.on("neutral", () => dialogsx.setInputText(diag, DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", (dialog) => {
                let input = dialogsx.getInputText(diag);
                if (input === "") return dialog.dismiss();
                input = +input;
                if (isNaN(input)) return dialogsx.alertTitle(dialog, "输入值类型不合法");
                let value = +(input.toFixed(2));
                if (value > 0.95 || value < 0.5) return dialogsx.alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr(view) {
            let value = (sess_cfg[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]) * 100;
            view["_hint"].text(value.toString() + "% H");
        },
    }))
    .add("button", new Layout("终点位置", {
        config_conj: "unlock_dismiss_layer_top",
        hint: "加载中...",
        newWindow() {
            let diag = dialogsx.builds([
                "提示层页面终点位置", this.config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|0.05<=x<=0.3,x∈R+}"});
            diag.on("neutral", () => dialogsx.setInputText(diag, DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", (dialog) => {
                let input = dialogsx.getInputText(diag);
                if (input === "") return dialog.dismiss();
                input = +input;
                if (isNaN(input)) return dialogsx.alertTitle(dialog, "输入值类型不合法");
                let value = +(input.toFixed(2));
                if (value > 0.3 || value < 0.05) return dialogsx.alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr(view) {
            let value = (sess_cfg[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]) * 100;
            view["_hint"].text(value.toString() + "% H");
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
            let diag = dialogsx.builds(["图案解锁滑动策略", "", ["了解详情", "hint_btn_bright_color"], "返回", "确认修改", 1], {
                items: map_keys.slice().map(value => map[value]),
                itemsSelectMode: "single",
                itemsSelectedIndex: map_keys.indexOf((sess_cfg[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString()),
            });
            diag.on("neutral", () => {
                let diag_about = dialogsx.builds(["关于图案解锁滑动策略", "about_unlock_pattern_strategy", 0, 0, "关闭", 1]);
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
            view["_hint"].text(this.map[(sess_cfg[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString()]);
        },
    }))
    .add("button", new Layout("滑动时长", {
        config_conj: () => "unlock_pattern_swipe_time_"
            + (sess_cfg.unlock_pattern_strategy || DEFAULT_UNLOCK.unlock_pattern_strategy),
        hint: "加载中...",
        newWindow() {
            let config_conj = this.config_conj();
            let diag = dialogsx.builds([
                "设置图案解锁滑动时长", config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|120<=x<=3000,x∈N}"});
            diag.on("neutral", () => dialogsx.setInputText(diag, DEFAULT_UNLOCK[config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", (dialog) => {
                let input = dialogsx.getInputText(diag);
                if (input === "") return dialog.dismiss();
                let value = +input;
                if (isNaN(value)) return dialogsx.alertTitle(dialog, "输入值类型不合法");
                if (value > 3000 || value < 120) return dialogsx.alertTitle(dialog, "输入值范围不合法");
                saveSession(config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr(view) {
            let config_conj = this.config_conj();
            view["_hint"].text((sess_cfg[config_conj] || DEFAULT_UNLOCK[config_conj]).toString() + " ms");
        },
    }))
    .add("button", new Layout("点阵边长", {
        config_conj: "unlock_pattern_size",
        hint: "加载中...",
        newWindow() {
            let diag = dialogsx.builds([
                "设置图案解锁边长", this.config_conj,
                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
            ], {inputHint: "{x|3<=x<=6,x∈N}"});
            diag.on("neutral", () => dialogsx.setInputText(diag, DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", (dialog) => {
                let input = dialogsx.getInputText(diag);
                if (input === "") return dialog.dismiss();
                let value = +input;
                if (isNaN(value)) return dialogsx.alertTitle(dialog, "输入值类型不合法");
                if (value > 6 || value < 3) return dialogsx.alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr(view) {
            view["_hint"].text((sess_cfg[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
        },
    }));

ui.emitter.on("back_pressed", (e) => {
    if (!needSave()) return;
    e.consumed = true; // make default "back" dysfunctional
    let diag = dialogsx.builds([
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
    threads.shutDownAll();
    dialogsx.clearPool();
    ui.setContentView(ui.inflate(<vertical/>));
    ui.main.getParent().removeAllViews();
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
    homepage["_back_btn_area"].setVisibility(8);

    return homepage;
}

function setPage(title_param, title_bg_color, additions, options) {
    let {no_margin_bottom, no_scroll_view} = options || {};
    let title = title_param;
    let view_page_name = "";
    if (classof(title_param, "Array")) [title, view_page_name] = title_param;
    sess_par.page_title = title;
    title_bg_color = title_bg_color || defs["title_bg_color"];
    let new_view = ui.inflate(<vertical/>);
    // noinspection HtmlUnknownTarget
    new_view.addView(ui.inflate(
        <linear id="_title_bg" clickable="true">
            <vertical id="_back_btn_area" marginRight="-22" layout_gravity="center">
                <linear>
                    <img src="@drawable/ic_chevron_left_black_48dp" h="31"
                         bg="?selectableItemBackgroundBorderless"
                         tint="#ffffff" layout_gravity="center" alt=""/>
                </linear>
            </vertical>
            <text id="_title_text" textColor="#ffffff" textSize="19" margin="16"/>
        </linear>
    ));
    new_view["_back_btn_area"].on("click", () => back());
    new_view["_title_text"].text(title);
    new_view["_title_text"].getPaint().setFakeBoldText(true);
    let title_bg = typeof title_bg_color === "string" ? colors.parseColor(title_bg_color) : title_bg_color;
    new_view["_title_bg"].setBackgroundColor(title_bg);

    if (additions) {
        typeof additions === "function" ? additions(new_view) : additions.forEach(f => f(new_view));
    }

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
        new_view["_page_content_view"].addView(ui.inflate(
            <frame>
                <frame margin="0 0 0 8"/>
            </frame>
        ));
    }
    new_view.add = (type, item_params) => {
        let sub_view = setItem(type, item_params);
        sub_view.view_page_name = view_page_name || null;
        new_view["_page_content_view"].addView(sub_view);
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
            ui.inflate(
                <horizontal id="_item_area" padding="16 8" gravity="left|center">
                    <vertical id="_content" w="{{defs.item_area_width}}" h="40" gravity="left|center">
                        <text id="_title" textColor="#111111" textSize="16"/>
                    </vertical>
                </horizontal>
            );

        if (!item_params) {
            return new_view;
        }

        Object.keys(item_params).forEach((key) => {
            let item_data = item_params[key];
            new_view[key] = typeof item_data === "function" ? item_data.bind(new_view) : item_data;
        });

        typeof item_params["title"] === "string"
        && new_view["_title"]
        && new_view["_title"].text(item_params["title"]);

        let hint = item_params["hint"];
        if (hint) {
            let hint_view = ui.inflate(
                <horizontal>
                    <text id="_hint" textColor="#888888" textSize="13sp"/>
                    <text id="_hint_color_indicator" visibility="gone" textColor="#888888" textSize="13sp"/>
                </horizontal>);
            typeof hint === "string" && hint_view["_hint"].text(hint);
            item_params["hint_text_color"] && hint_view["_hint"].setTextColor(item_params["hint_text_color"]);
            new_view["_content"].addView(hint_view);
        }

        if (type === "button") {
            // noinspection HtmlUnknownTarget
            let help_view = ui.inflate(
                <vertical id="_info_icon" visibility="gone">
                    <img src="@drawable/ic_info_outline_black_48dp" h="22"
                         bg="?selectableItemBackgroundBorderless" tint="#888888" alt=""/>
                </vertical>
            );
            new_view["_item_area"].addView(help_view);
            item_params.view = new_view;
            new_view["_item_area"].on("click", () => {
                typeof item_params.showWindow === "function" && item_params.showWindow()
            });
        }

        return new_view;

        // tool function(s) //

        function setSplitLine(item) {
            let line_color = item && item["split_line_color"] || defs["split_line_color"];
            let new_view = ui.inflate(<vertical>
                <horizontal id="_line" w="*" h="1sp" margin="16 8"/>
            </vertical>);
            new_view.setTag(type);
            line_color = typeof line_color === "string" ? colors.parseColor(line_color) : line_color;
            new_view["_line"].setBackgroundColor(line_color);
            new_view["_line"].setVisibility(type.match(/invisible/) ? 8 : 0);
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
            new_view["_text"].text(title);
            let title_color = typeof subhead_color === "string" ? colors.parseColor(subhead_color) : subhead_color;
            new_view["_text"].setTextColor(title_color);
            return new_view;
        }
    }
}

function setButtons(parent_view, data_source_key_name, button_params_arr) {
    let view = ui.inflate(<horizontal id="btn"/>);
    let cnt = 0;
    for (let i = 2, l = arguments.length; i < l; i += 1) {
        if (typeof arguments[i] === "object") {
            view["btn"].addView(getButtonLayout.apply(null, arguments[i]));
            cnt += 1;
        }
    }
    let width = 650 - 100 * cnt - (sess_par.page_title !== defs.homepage_title ? 52 : 5);
    parent_view["_title_text"].setWidth(Math.floor(width * WIDTH / 720));
    parent_view["_title_bg"].addView(view);

    // tool function(s) //

    function getButtonLayout(button_icon_file_name, button_text, switch_state, btn_click_listener, other_params) {
        other_params = other_params || {};
        sess_par.button_icon_file_name = button_icon_file_name.replace(/^(ic_)?(.*?)(_black_48dp)?$/, "ic_$2_black_48dp");
        sess_par.button_text = button_text;
        let btn_text = button_text.toLowerCase();
        let btn_icon_id = "_icon_" + btn_text;
        sess_par.btn_icon_id = btn_icon_id;
        let btn_text_id = "_text_" + btn_text;
        sess_par.btn_text_id = btn_text_id;
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
        sess_par[data_source_key_name + "_btn_" + btn_text] = view;

        return view;

        // tool function(s) //

        function buttonView() {
            // noinspection HtmlUnknownTarget
            return ui.inflate(
                <vertical margin="13 0">
                    <img layout_gravity="center" id="{{sess_par.btn_icon_id}}"
                         src="@drawable/{{sess_par.button_icon_file_name}}" h="31"
                         bg="?selectableItemBackgroundBorderless" margin="0 7 0 0" alt=""/>
                    <text w="50" id="{{sess_par.btn_text_id}}" text="{{sess_par.button_text}}"
                          textSize="10" textStyle="bold" marginTop="-26" h="40" gravity="bottom|center"/>
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

// updated: Aug 8, 2020
function loadInternalModuleDialog() {
    let isUiThread = () => android.os.Looper.myLooper() === android.os.Looper.getMainLooper();
    let rtDialogs = () => isUiThread() ? runtime.dialogs : runtime.dialogs.nonUiDialogs;

    return {
        build(props) {
            let builder = Object.create(runtime.dialogs.newBuilder());
            builder.thread = threads.currentThread();

            Object.keys(props).forEach(n => applyDialogProperty(builder, n, props[n]));

            applyOtherDialogProperties(builder, props);

            return ui.run(builder.buildDialog);

            // tool function(s) //

            function applyDialogProperty(builder, name, value) {
                let propertySetters = {
                    title: null,
                    titleColor: {adapter: parseColor},
                    buttonRippleColor: {adapter: parseColor},
                    icon: null,
                    content: null,
                    contentColor: {adapter: parseColor},
                    contentLineSpacing: null,
                    items: null,
                    itemsColor: {adapter: parseColor},
                    positive: {method: "positiveText"},
                    positiveColor: {adapter: parseColor},
                    neutral: {method: "neutralText"},
                    neutralColor: {adapter: parseColor},
                    negative: {method: "negativeText"},
                    negativeColor: {adapter: parseColor},
                    cancelable: null,
                    canceledOnTouchOutside: null,
                    autoDismiss: null
                };

                if (propertySetters.hasOwnProperty(name)) {
                    let propertySetter = propertySetters[name] || {};
                    if (propertySetter.method === undefined) {
                        propertySetter.method = name;
                    }
                    if (propertySetter.adapter) {
                        value = propertySetter.adapter(value);
                    }
                    builder[propertySetter.method].call(builder, value);
                }
            }

            function applyOtherDialogProperties(builder, properties) {
                if (properties.inputHint !== undefined || properties.inputPrefill !== undefined) {
                    builder.input(
                        wrapNonNullString(properties.inputHint),
                        wrapNonNullString(properties.inputPrefill),
                        (d, input) => builder.emit("input_change", builder.dialog, input.toString())
                    ).alwaysCallInputCallback();
                }
                if (properties.items !== undefined) {
                    let itemsSelectMode = properties.itemsSelectMode;
                    if (itemsSelectMode === undefined || itemsSelectMode === 'select') {
                        builder.itemsCallback(function (dialog, view, position, text) {
                            builder.emit("item_select", position, text.toString(), builder.dialog);
                        });
                    } else if (itemsSelectMode === 'single') {
                        builder.itemsCallbackSingleChoice(
                            properties.itemsSelectedIndex === undefined ? -1 : properties.itemsSelectedIndex,
                            (d, view, which, text) => {
                                builder.emit("single_choice", which, text.toString(), builder.dialog);
                                return true;
                            });
                    } else if (itemsSelectMode === 'multi') {
                        builder.itemsCallbackMultiChoice(
                            properties.itemsSelectedIndex === undefined ? null : properties.itemsSelectedIndex,
                            (dialog, indices, texts) => {
                                builder.emit("multi_choice",
                                    toJsArray(indices, (l, i) => parseInt(l[i])),
                                    toJsArray(texts, (l, i) => l[i].toString()),
                                    builder.dialog);
                                return true;
                            });
                    } else {
                        throw new Error("Unknown itemsSelectMode " + itemsSelectMode);
                    }
                }
                if (properties.progress !== undefined) {
                    let progress = properties.progress;
                    builder.progress(progress.max === -1, progress.max, !!progress.showMinMax);
                    builder.progressIndeterminateStyle(!!progress.horizontal);
                }
                if (properties.checkBoxPrompt !== undefined || properties.checkBoxChecked !== undefined) {
                    builder.checkBoxPrompt(
                        wrapNonNullString(properties.checkBoxPrompt),
                        !!properties.checkBoxChecked,
                        (view, checked) => builder.getDialog().emit("check", checked, builder.getDialog()));
                }
                if (properties.customView !== undefined) {
                    let customView = properties.customView;
                    // noinspection JSTypeOfValues
                    if (typeof customView === 'xml' || typeof customView === 'string') {
                        customView = ui.run(() => ui.inflate(customView));
                    }
                    let wrapInScrollView = properties.wrapInScrollView;
                    builder.customView(customView, wrapInScrollView === undefined ? true : wrapInScrollView);
                }

                function wrapNonNullString(str) {
                    return str || "";
                }

                function toJsArray(object, adapter) {
                    let jsArray = [];
                    let len = object.length;
                    for (let i = 0; i < len; i++) {
                        jsArray.push(adapter(object, i));
                    }
                    return jsArray;
                }
            }

            function parseColor(c) {
                return typeof c === 'string' ? colors.parseColor(c) : c;
            }
        },
        builds(regular_props, ext_props) {
            let _props = {};
            let _defs = global.$$def || require("./MODULE_DEFAULT_CONFIG").settings;
            let _diag_cnt = require("./MODULE_TREASURY_VAULT").dialog_contents || {};
            let _regular = typeof regular_props === "string" ? [regular_props] : regular_props;

            let [$tt, $cnt, $neu, $neg, $pos, $keep, $cbx] = _regular;

            void [
                ["title", $tt], ["content", $cnt], ["neutral", $neu], ["negative", $neg], ["positive", $pos]
            ].forEach(arr => _parseColorable.apply(null, arr));

            if ($keep) {
                _props.autoDismiss = _props.canceledOnTouchOutside = false;
            }
            if ($cbx) {
                _props.checkBoxPrompt = typeof $cbx === "string" ? $cbx : "不再提示";
            }

            let _diag = this.build(Object.assign(_props, ext_props));

            global._$_dialogs_pool = global._$_dialogs_pool || [];
            global._$_dialogs_pool.push(_diag);

            return _diag;

            // tool function(s) //

            function _parseColorable(key, par) {
                if (Array.isArray(par)) {
                    let [_val, _color] = par;
                    _props[key] = _val;
                    _props[key + "Color"] = _color.match(/_color$/) ? _defs[_color] : _color;
                } else if (par) {
                    _props[key] = key === "content" ? _diag_cnt[par] || par : par;
                }
            }
        },
        rawInput(title, prefill, callback) {
            return isUiThread() && !callback ? new Promise((res) => {
                rtDialogs().rawInput(title, prefill || "", function () {
                    res.apply(null, [].slice.call(arguments));
                });
            }) : rtDialogs().rawInput(title, prefill || "", callback || null);
        },
        alertTitle(d, msg, duration) {
            let _titles = global._$_alert_title_info = global._$_alert_title_info || {};
            _titles[d] = _titles[d] || {};
            _titles.message_showing ? ++_titles.message_showing : (_titles.message_showing = 1);

            let _ori_txt = _titles[d].ori_text || "";
            let _ori_color = _titles[d].ori_text_color || "";
            let _ori_bg_color = _titles[d].ori_bg_color || "";

            let _ori_view = d.getTitleView();
            if (!_ori_txt) {
                _titles[d].ori_text = _ori_txt = _ori_view.getText();
            }
            if (!_ori_color) {
                _titles[d].ori_text_color = _ori_color = _ori_view.getTextColors().colors[0];
            }
            if (!_ori_bg_color) {
                let _ori_view_bg_d = _ori_view.getBackground();
                _ori_bg_color = _ori_view_bg_d && _ori_view_bg_d.getColor() || -1;
                _titles[d].ori_bg_color = _ori_bg_color;
            }

            _setTitle(d, msg, colors.parseColor("#c51162"), colors.parseColor("#ffeffe"));

            duration === 0 || setTimeout(function () {
                --_titles.message_showing || _setTitle(d, _ori_txt, _ori_color, _ori_bg_color);
            }, duration || 3e3);

            // tool function(s) //

            function _setTitle(dialog, text, color, bg) {
                let _title_view = dialog.getTitleView();
                _title_view.setText(text);
                _title_view.setTextColor(color);
                _title_view.setBackgroundColor(bg);
            }
        },
        getInputText: d => d ? d.getInputEditText().getText().toString() : null,
        setInputText: (d, s) => d ? d.getInputEditText().setText(s ? s.toString() : "") : void 0,
        clearPool() {
            (global._$_dialogs_pool || []).map((diag) => {
                diag.dismiss();
                diag = null;
            }).splice(0);
        },
    };
}

// updated: Jan 21, 2020
function loadInternalModuleMonsterFunc() {
    return {
        equalObjects: equalObjects,
        deepCloneObject: deepCloneObject,
        waitForAction: waitForAction,
        classof: classof,
    };

    // some may be used by a certain monster function(s) even though not showing up above
    // monster function(s) //

    // updated: Sep 20, 2020
    function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
        let $_flag = global.$$flag = global.$$flag || {};
        if ($_flag.no_msg_act_flag) {
            return !~[3, 4, "warn", "w", "error", "e"].indexOf(msg_level);
        }

        let _msg_lv = msg_level;
        if (typeof _msg_lv === "undefined") {
            _msg_lv = 1;
        }
        if (typeof _msg_lv !== "number" && typeof msg_level !== "string") {
            _msg_lv = -1;
        }

        let _msg = msg || "";
        if (_msg_lv.toString().match(/^t(itle)?$/)) {
            _msg = "[ " + msg + " ]";
            return messageAction.apply(null, [_msg, 1].concat([].slice.call(arguments, 2)));
        }

        if_toast && toast(_msg);

        let _if_arrow = if_arrow || false;
        let _if_spl_ln = if_split_line || false;
        _if_spl_ln = ~if_split_line ? _if_spl_ln === 2 ? "both" : _if_spl_ln : "up";
        let _spl_ln_style = "solid";
        let _saveLnStyle = () => $_flag.last_cnsl_spl_ln_type = _spl_ln_style;
        let _loadLnStyle = () => $_flag.last_cnsl_spl_ln_type;
        let _clearLnStyle = () => delete $_flag.last_cnsl_spl_ln_type;
        let _matchLnStyle = () => _loadLnStyle() === _spl_ln_style;
        let _showSplitLine = (
            typeof showSplitLine === "function" ? showSplitLine : showSplitLineRaw
        );

        if (typeof _if_spl_ln === "string") {
            if (_if_spl_ln.match(/dash/)) {
                _spl_ln_style = "dash";
            }
            if (_if_spl_ln.match(/both|up|^2/)) {
                if (!_matchLnStyle()) {
                    _showSplitLine("", _spl_ln_style);
                }
                if (_if_spl_ln.match(/_n|n_/)) {
                    _if_spl_ln = "\n";
                } else if (_if_spl_ln.match(/both|^2/)) {
                    _if_spl_ln = 1;
                } else if (_if_spl_ln.match(/up/)) {
                    _if_spl_ln = 0;
                }
            }
        }

        _clearLnStyle();

        if (_if_arrow) {
            _msg = "-".repeat(Math.min(_if_arrow, 10)) + "> " + _msg;
        }

        let _exit_flag = false;
        let _show_ex_msg_flag = false;

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
                _show_ex_msg_flag = true;
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
            if (!_spl_ln_extra.match(/\n/)) {
                _saveLnStyle();
            }
            _showSplitLine(_spl_ln_extra, _spl_ln_style);
        }

        if (_show_ex_msg_flag) {
            let _msg = "forcibly stopped";
            console.error(_msg);
            toast(_msg);
        }
        if (_exit_flag) {
            exit();
        }

        return !~[3, 4].indexOf(_msg_lv);

        // raw function(s) //

        function showSplitLineRaw(extra, style) {
            console.log((
                style === "dash" ? "- ".repeat(18).trim() : "-".repeat(33)
            ) + (extra || ""));
        }
    }

    // updated: Aug 29, 2020
    function waitForAction(f, timeout_or_times, interval, params) {
        let _par = params || {};
        _par.no_impeded || typeof $$impeded === "function" && $$impeded(waitForAction.name);

        if (typeof timeout_or_times !== "number") {
            timeout_or_times = 10e3;
        }
        let _times = timeout_or_times;
        if (_times <= 0 || !isFinite(_times) || isNaN(_times) || _times > 100) {
            _times = Infinity;
        }
        let _timeout = Infinity;
        if (timeout_or_times > 100) {
            _timeout = timeout_or_times;
        }
        let _interval = interval || 200;
        if (_interval >= _timeout) {
            _times = 1;
        }

        let _start_ts = Date.now();
        while (!_checkF(f) && --_times) {
            if (Date.now() - _start_ts > _timeout) {
                return false; // timed out
            }
            sleep(_interval);
        }
        return _times > 0;

        // tool function(s) //

        function _checkF(f) {
            let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
            let _messageAction = (
                typeof messageAction === "function" ? messageAction : messageActionRaw
            );

            if (typeof f === "function") {
                return f();
            }
            if (_classof(f) === "JavaObject") {
                return f.toString().match(/UiObject/) ? f : f.exists();
            }
            if (_classof(f) === "Array") {
                let _arr = f;
                let _len = _arr.length;
                let _logic = "all";
                if (typeof _arr[_len - 1] === "string") {
                    _logic = _arr.pop();
                }
                if (_logic.match(/^(or|one)$/)) {
                    _logic = "one";
                }
                for (let i = 0; i < _len; i += 1) {
                    let _ele = _arr[i];
                    if (!(typeof _ele).match(/function|object/)) {
                        _messageAction("数组参数中含不合法元素", 9, 1, 0, 1);
                    }
                    if (_logic === "all" && !_checkF(_ele)) {
                        return false;
                    }
                    if (_logic === "one" && _checkF(_ele)) {
                        return true;
                    }
                }
                return _logic === "all";
            }
            _messageAction('"waitForAction"传入f参数不合法\n\n' + f.toString() + '\n', 9, 1, 0, 1);
        }

        // raw function(s) //

        function messageActionRaw(msg, lv, if_toast) {
            let _msg = msg || " ";
            if (lv && lv.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, if_toast);
            }
            if_toast && toast(_msg);
            let _lv = typeof lv === "undefined" ? 1 : lv;
            if (_lv >= 4) {
                console.error(_msg);
                _lv >= 8 && exit();
                return false;
            }
            if (_lv >= 3) {
                console.warn(_msg);
                return false;
            }
            if (_lv === 0) {
                console.verbose(_msg);
            } else if (_lv === 1) {
                console.log(_msg);
            } else if (_lv === 2) {
                console.info(_msg);
            }
            return true;
        }
    }

    // updated: Sep 1, 2020
    function equalObjects(obj_a, obj_b) {
        let _classOf = value => Object.prototype.toString.call(value).slice(8, -1);
        let _class_a = _classOf(obj_a);
        let _class_b = _classOf(obj_b);
        let _type_a = typeof obj_a;
        let _type_b = typeof obj_b;

        if (!_isTypeMatch(_type_a, _type_b, "object")) {
            return obj_a === obj_b;
        }
        if (_isTypeMatch(_class_a, _class_b, "Null")) {
            return true;
        }

        if (_class_a === "Array") {
            if (_class_b === "Array") {
                let _len_a = obj_a.length;
                let _len_b = obj_b.length;
                if (_len_a === _len_b) {
                    let _used_b_indices = [];
                    for (let i = 0, l = obj_a.length; i < l; i += 1) {
                        if (!_singleArrCheck(i, _used_b_indices)) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            return false;
        }

        if (_class_a === "Object") {
            if (_class_b === "Object") {
                let _keys_a = Object.keys(obj_a);
                let _keys_b = Object.keys(obj_b);
                let _len_a = _keys_a.length;
                let _len_b = _keys_b.length;
                if (_len_a !== _len_b) {
                    return false;
                }
                if (!equalObjects(_keys_a, _keys_b)) {
                    return false;
                }
                for (let i in obj_a) {
                    if (obj_a.hasOwnProperty(i)) {
                        if (!equalObjects(obj_a[i], obj_b[i])) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }

        // tool function(s) //

        function _isTypeMatch(a, b, feature) {
            return a === feature && b === feature;
        }

        function _singleArrCheck(i, container) {
            let _a = obj_a[i];
            for (let i = 0, l = obj_b.length; i < l; i += 1) {
                if (~container.indexOf(i)) {
                    continue;
                }
                if (equalObjects(_a, obj_b[i])) {
                    container.push(i);
                    return true;
                }
            }
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

    function classof(source, compare) {
        let _s = Object.prototype.toString.call(source).slice(8, -1);
        return compare ? _s.toUpperCase() === compare.toUpperCase() : _s;
    }
}

// updated: Nov 14, 2019
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

// updated: Jun 24, 2020
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
                    let _sglStr = (s) => {
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
            _inp = dialogsx.rawInput(
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

// updated: Jun 24, 2020
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
                    files.write(_full_path, JSON.stringify(_o, null, 2));
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