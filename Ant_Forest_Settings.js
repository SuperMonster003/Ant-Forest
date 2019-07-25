"ui";
try {
    auto.waitFor();
} catch (e) {
    auto();
}

// given that there are bugs with dialogs modules in old auto.js versions like 4.1.0/5 and 4.1.1/2
// in another way, maybe sometimes dialogs.builds() could make things easier
let dialogs = require("./Modules/__dialogs__pro_v6.js")(runtime, this);

threads.starts = (f, error_msg_consume_flag) => {
    try {
        threads.start(f);
    } catch (e) {
        if (!e.message.match(/script exiting/) && !error_msg_consume_flag) throw Error(e);
    }
};

let {
    getDisplayParams,
    equalObjects,
    deepCloneObject,
    smoothScrollView,
    alertTitle,
    alertContent,
    clickAction,
    waitForAction,
    waitForAndClickAction,
} = require("./Modules/MODULE_MONSTER_FUNC");

let [
    session_params,
    view_pages,
    dynamic_views,
    rolling_pages,
    sub_page_views,
    def,
] = [{}, {}, [], [], [], undefined];

let {WIDTH, HEIGHT, USABLE_HEIGHT, status_bar_height, action_bar_default_height, navigation_bar_height, cX, cY} = getDisplayParams();

let DEFAULT_CONFIG = require("./Modules/MODULE_DEFAULT_CONFIG");
let STORAGE = require("./Modules/MODULE_STORAGE");
let PWMAP = require("./Modules/MODULE_PWMAP.js");

let DEFAULT_AF = DEFAULT_CONFIG.af;
let DEFAULT_UNLOCK = DEFAULT_CONFIG.unlock;
let DEFAULT_SETTINGS = DEFAULT_CONFIG.settings;

let storage_cfg = STORAGE.create("af_cfg");
let storage_af = STORAGE.create("af");
let storage_unlock = STORAGE.create("unlock");
let encrypt = new PWMAP().pwmapEncrypt;

let storage_config = initStorageConfig();
let session_config = deepCloneObject(storage_config);

let listener = events.emitter()
    .addListener("sub_page_views_add", () => {
        if (!session_params.sub_page_view_idx) session_params.sub_page_view_idx = 0;
        if (session_params.sub_page_view_idx >= sub_page_views.length) return;
        setTimeout(sub_page_views[session_params.sub_page_view_idx++], 10);
    })
;

let needSave = () => !equalObjects(session_config, storage_config);
let saveSession = (key, value, quiet_flag) => {
    if (key !== undefined) session_config[key] = value;
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
let getLocalProjectVerName = () => "v" + files.read("./Ant_Forest_Launcher.js").match(/version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/)[0].slice(8);

let defs = Object.assign({}, DEFAULT_SETTINGS, {
    item_area_width: cX(DEFAULT_SETTINGS.item_area_width) + "px",
    homepage_title: "蚂蚁森林",
    empty_non_break_check_time_area_hint: "*点击添加按钮添加新时间区间*",
    local_backup_path: files.cwd() + "/BAK/Ant_Forest/",
});

let list_heads = {
    project_backup_info: [
        {version_name: "项目版本", width: 0.5},
        {
            timestamp: "项目备份时间", sort: -1, stringTransform: {
                forward: data => getTimestamp(data, "time_str"),
                backward: restoreFromTimestamp,
            }
        },
    ],
    server_releases_info: [
        {tag_name: "项目标签", width: 0.5},
        {created_at: "创建时间 (UTC格式)", sort: -1},
    ],
    blacklist_by_user: [
        {name: "支付宝好友昵称", width: 0.58},
        {
            timestamp: "黑名单自动解除", sort: 1, stringTransform: {
                forward: data => getTimestamp(data, "time_str_remove"),
                backward: restoreFromTimestamp,
            }
        },
    ],
    blacklist_protect_cover: [
        {name: "支付宝好友昵称", width: 0.58},
        {
            timestamp: "黑名单自动解除", sort: 1, stringTransform: {
                forward: data => getTimestamp(data, "time_str_remove"),
                backward: restoreFromTimestamp,
            }
        },
    ],
    timers_uninterrupted_check_sections: [
        {
            section: "时间区间", width: 0.58, sort: 1, stringTransform: {
                forward: data => data.join(" - ") + (data[1] <= data[0] ? " (+1)" : ""),
                backward: str => str.replace(/ \(\+1\)/g, "").split(" - "),
            }
        },
        {interval: "间隔 (分)"},
    ],
};

// entrance //

initUI();

let homepage = setHomePage(defs.homepage_title)
    .add("sub_head", new Layout("基本功能"))
    .add("options_lazy", new Layout("自收功能", {
        config_conj: "self_collect_switch",
        hint: "加载中...",
        next_page: "self_collect_page",
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("options_lazy", new Layout("收取功能", {
        config_conj: "friend_collect_switch",
        hint: "加载中...",
        next_page: "friend_collect_page",
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("options_lazy", new Layout("帮收功能", {
        config_conj: "help_collect_switch",
        hint: "加载中...",
        next_page: "help_collect_page",
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("sub_head", new Layout("高级功能"))
    .add("options_lazy", new Layout("自动解锁", {
        config_conj: "auto_unlock_switch",
        hint: "加载中...",
        next_page: "auto_unlock_page",
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("options_lazy", new Layout("消息提示", {
        config_conj: "message_showing_switch",
        hint: "加载中...",
        next_page: "message_showing_page",
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("options_lazy", new Layout("定时循环", {
        config_conj: "timers_switch",
        hint: "加载中...",
        next_page: "timers_page",
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("options_lazy", new Layout("黑名单管理", {
        next_page: "blacklist_page",
    }))
    .add("options_lazy", new Layout("脚本运行安全", {
        next_page: "script_security_page",
    }))
    .add("sub_head", new Layout("备份与还原"))
    .add("button", new Layout("还原初始设置", {
        newWindow: () => {
            let diag = dialogs.builds(["还原初始设置", "restore_all_settings", ["了解内部配置", "hint_btn_bright_color"], "放弃", ["全部还原", "warn_btn_color"], 1]);
            diag.on("neutral", () => {
                let diag_keep_internals = dialogs.builds(["保留内部配置", "keep_internal_config", 0, 0, "关闭", 1]);
                diag_keep_internals.on("positive", () => diag_keep_internals.dismiss());
                diag_keep_internals.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                let diag_sub = dialogs.builds(["全部还原", "确定要还原全部设置吗", 0, "放弃", ["全部还原", "caution_btn_color"], 1]);
                diag_sub.on("positive", () => {
                    reset();
                    let diag_sub_sub = dialogs.builds(["还原完毕", "", 0, 0, "确定"]);
                    diag_sub_sub.on("positive", () => {
                        diag_sub_sub.dismiss();
                        diag_sub.dismiss();
                        diag.dismiss();
                    });
                    diag_sub_sub.show();

                    // tool function(s) //

                    function reset() {
                        let def_DEFAULT = Object.assign({info_icons_sanctuary: []}, DEFAULT_AF, storage_unlock.get("config", {}), isolateBlacklistStorage(), filterProjectBackups());
                        session_config = deepCloneObject(def_DEFAULT);
                        storage_config = deepCloneObject(def_DEFAULT);
                        storage_cfg.put("config", DEFAULT_AF);
                        updateAllValues();
                    }
                });
                diag_sub.on("negative", () => diag_sub.dismiss());
                diag_sub.show();
            });
            diag.show();
        },
    }))
    .add("options_lazy", new Layout("项目备份还原", {
        next_page: "local_project_backup_restore_page",
    }))
    .add("sub_head", new Layout("关于"))
    .add("button", new Layout("关于脚本及开发者", {
        hint: "正在读取中...",
        view_label: "about",
        newWindow: function () {
            let local_version = this.view._hint.getText();
            let newest_server_version_name = "";
            let server_md_file_content = "";
            let diag = dialogs.builds(["关于", "", [0, "attraction_btn_color"], "返回", "检查更新", 1], {
                content: "当前本地版本: " + local_version + "\n" + "服务器端版本: ",
                items: ["开发者: " + "SuperMonster003"],
            });
            let checking_update_flag = false;
            let only_show_history_flag = false;
            diag.on("negative", () => diag.dismiss());
            diag.on("neutral", () => {
                diag.getActionButton("neutral") === "查看当前更新" && diag.dismiss();
                handleNewVersion(diag, server_md_file_content, newest_server_version_name, only_show_history_flag);
            });
            diag.on("positive", () => {
                if (checking_update_flag) return;
                session_params.update_info = {};
                diag.setActionButton("neutral", null);
                checkUpdate();
                // alertTitle(diag, "检查更新中 请稍候...", 1500);
            });
            diag.on("item_select", (idx, item, dialog) => {
                //diag.dismiss();
                app.openUrl("https://github.com/SuperMonster003");
            });
            diag.show();
            checkUpdate();

            // tool function(s) //

            function checkUpdate() {
                checking_update_flag = true;
                only_show_history_flag = false;
                let url_readme = "https://raw.githubusercontent.com/SuperMonster003/Auto.js_Projects/Ant_Forest/README.md";
                newest_server_version_name = "检查中...";
                let ori_content = diag.getContentView().getText().toString().replace(/([^]+服务器端版本: ).*/, "$1");
                diag.setContent(ori_content + newest_server_version_name);
                threads.starts(function () {
                    try {
                        let regexp_version_name = /版本历史[^]+?v(\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/;
                        server_md_file_content = http.get(url_readme).body.string();
                        newest_server_version_name = "v" + server_md_file_content.match(regexp_version_name)[0].split("v")[1];
                    } catch (e) {
                        newest_server_version_name = "检查超时";
                    } finally {
                        diag.setContent(ori_content + newest_server_version_name);
                        if (newest_server_version_name.match(/v/) && newest_server_version_name !== local_version) {
                            diag.setActionButton("neutral", "查看当前更新");
                        } else {
                            only_show_history_flag = true;
                            diag.setActionButton("neutral", "查看历史更新");
                        }
                        checking_update_flag = false;
                    }
                });
            }
        },
        updateOpr: function (view) {
            let current_local_version_name = "";
            try {
                current_local_version_name = getLocalProjectVerName();
            } catch (e) {
                current_local_version_name = "读取失败";
            }
            view._hint.text(current_local_version_name);
        },
    }))
;

let addPage = (addFunc) => sub_page_views.push(addFunc);

addPage(() => {
    setPage(["自收功能", "self_collect_page"])
        .add("switch", new Layout("总开关", {
            config_conj: "self_collect_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("主页能量球设置", {sub_head_color: "#bf360c"}))
        .add("options", new Layout("循环监测", {
            config_conj: "homepage_monitor_switch",
            hint: "加载中...",
            next_page: "homepage_monitor_page",
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
                checkDependency(view, "timers_switch");
            },
        }))
        .add("options", new Layout("返检监控", {
            config_conj: "homepage_background_monitor_switch",
            hint: "加载中...",
            next_page: "homepage_background_monitor_page",
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("button", new Layout("能量球点击间隔", {
            config_conj: "energy_balls_click_interval",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "能量球点击间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|10<=x<=150,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 150 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString() + " ms");
            },
        }))
        .add("button", new Layout("控件最大准备时间", {
            config_conj: "max_own_forest_balls_ready_time",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "主页能量球最大准备时间", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|200<=x<=2000,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let safe_value = 500;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 2000 || value < 200) return alertTitle(dialog, "输入值范围不合法");
                    if (value < safe_value) {
                        let diag_confirm = dialogs.builds([["请注意", "caution_btn_color"], "", 0, "放弃", ["确定", "warn_btn_color"], 1], {
                            content: "当前值: " + value + "安全值: " + safe_value + "\n\n" +
                                "当前设置值小于安全值\n设置过小的时间值可能会导致能量球识别遗漏的情况\n\n" +
                                "确定要保留当前设置值吗",
                        });
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            saveSession(this.config_conj, ~~value);
                            diag_confirm.dismiss();
                            diag.dismiss();
                        });
                        diag_confirm.show();
                    } else {
                        saveSession(this.config_conj, ~~value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString() + " ms");
            },
        }))
        .ready();
}); // self_collect_page
addPage(() => {
    setPage(["主页能量球循环监测", "homepage_monitor_page"])
        .add("switch", new Layout("总开关", {
            config_conj: "homepage_monitor_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("基本设置"))
        .add("button", new Layout("监测阈值", {
            config_conj: "homepage_monitor_threshold",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "主页能量球循环监测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=3,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 3 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString() + " min");
            },
        }))
        .add("split_line")
        .add("info", new Layout("\"自收功能\"与\"定时循环\"共用此页面配置"))
        .ready();
}); // homepage_monitor_page
addPage(() => {
    setPage(["主页能量球返检监控", "homepage_background_monitor_page"])
        .add("switch", new Layout("总开关", {
            config_conj: "homepage_background_monitor_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("基本设置"))
        .add("button", new Layout("返检阈值", {
            config_conj: "homepage_background_monitor_threshold",
            hint: "加载中...",
            newWindow: function () {
                dialogs.builds(["主页能量球返检阈值", this.config_conj, 0, "返回", 0]).show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString() + " min");
            },
        }))
        .ready();
}); // homepage_background_monitor_page
addPage(() => {
    setPage(["收取功能", "friend_collect_page"])
        .add("switch", new Layout("总开关", {
            config_conj: "friend_collect_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("基本设置"))
        .add("button", new Layout("能量球点击间隔", {
            config_conj: "energy_balls_click_interval",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "能量球点击间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|10<=x<=150,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 150 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString() + " ms");
            },
        }))
        .add("options", new Layout("排行榜样本采集", {
            next_page: "rank_list_samples_collect_page",
        }))
        .add("split_line")
        .add("sub_head", new Layout("高级设置"))
        .add("button", new Layout("收取图标颜色色值", {
            config_conj: "friend_collect_icon_color",
            hint: "加载中...",
            newWindow: function () {
                let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/,
                    _lim255 = regexp_num_0_to_255.source;
                let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
                let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
                let current_color = undefined;
                let diag = dialogs.builds([
                    "收取图标颜色色值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "rgb(RR,GG,BB) | #RRGGBB"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    if (diag.getInputEditText().getText().toString() !== "") {
                        if (!current_color) return alertTitle(dialog, "输入的颜色值无法识别");
                        saveSession(this.config_conj, "#" + colors.toString(current_color).toLowerCase().slice(3));
                    }
                    diag.dismiss();
                });
                diag.on("input_change", (dialog, input) => {
                    let color = "";
                    try {
                        if (input.match(regexp_hex_color)) {
                            color = colors.parseColor("#" + input.slice(-6));
                        } else if (input.match(regexp_rgb_color)) {
                            let nums = input.match(/\d+.+\d+.+\d+/)[0].split(/\D+/);
                            color = colors.rgb(+nums[0], +nums[1], +nums[2]);
                        }
                        dialog.getTitleView().setTextColor(color || -570425344);
                        dialog.getContentView().setTextColor(color || -1979711488);
                        dialog.getTitleView().setBackgroundColor(color ? -570425344 : -1);
                    } catch (e) {
                    }
                    current_color = color;
                });
                diag.show();
            },
            updateOpr: function (view) {
                let color_str = session_config[this.config_conj].toString();
                view._hint.text(color_str);
                view._hint_color_indicator.text(" \u25D1");
                view._hint_color_indicator.setTextColor(colors.parseColor(color_str));
                view._hint_color_indicator.setVisibility(0);
            },
        }))
        .add("button", new Layout("收取图标颜色阈值", {
            config_conj: "friend_collect_icon_threshold",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "收取图标颜色检测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=66,x∈N*}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 66 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString());
            },
        }))
        .ready();
}); // friend_collect_page
addPage(() => {
    setPage(["帮收功能", "help_collect_page"])
        .add("switch", new Layout("总开关", {
            config_conj: "help_collect_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("基本设置"))
        .add("button", new Layout("能量球点击间隔", {
            config_conj: "energy_balls_click_interval",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "能量球点击间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|10<=x<=150,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 150 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString() + " ms");
            },
        }))
        .add("options", new Layout("排行榜样本采集", {
            next_page: "rank_list_samples_collect_page",
        }))
        .add("split_line")
        .add("sub_head", new Layout("高级设置"))
        .add("button", new Layout("帮收图标颜色色值", {
            config_conj: "help_collect_icon_color",
            hint: "加载中...",
            newWindow: function () {
                let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/,
                    _lim255 = regexp_num_0_to_255.source;
                let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
                let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
                let current_color = undefined;
                let diag = dialogs.builds([
                    "帮收图标颜色色值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "rgb(RR,GG,BB) | #RRGGBB"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    if (diag.getInputEditText().getText().toString() !== "") {
                        if (!current_color) return alertTitle(dialog, "输入的颜色值无法识别");
                        saveSession(this.config_conj, "#" + colors.toString(current_color).toLowerCase().slice(3));
                    }
                    diag.dismiss();
                });
                diag.on("input_change", (dialog, input) => {
                    let color = "";
                    try {
                        if (input.match(regexp_hex_color)) {
                            color = colors.parseColor("#" + input.slice(-6));
                        } else if (input.match(regexp_rgb_color)) {
                            let nums = input.match(/\d+.+\d+.+\d+/)[0].split(/\D+/);
                            color = colors.rgb(+nums[0], +nums[1], +nums[2]);
                        }
                        dialog.getTitleView().setTextColor(color || -570425344);
                        dialog.getContentView().setTextColor(color || -1979711488);
                        dialog.getTitleView().setBackgroundColor(color ? -570425344 : -1);
                    } catch (e) {
                    }
                    current_color = color;
                });
                diag.show();
            },
            updateOpr: function (view) {
                let color_str = session_config[this.config_conj].toString();
                view._hint.text(color_str);
                view._hint_color_indicator.text(" \u25D1");
                view._hint_color_indicator.setTextColor(colors.parseColor(color_str));
                view._hint_color_indicator.setVisibility(0);
            },
        }))
        .add("button", new Layout("帮收图标颜色阈值", {
            config_conj: "help_collect_icon_threshold",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "帮收图标颜色检测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=66,x∈N*}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 66 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString());
            },
        }))
        .add("button", new Layout("帮收能量球颜色色值", {
            config_conj: "help_collect_balls_color",
            hint: "加载中...",
            newWindow: function () {
                let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/,
                    _lim255 = regexp_num_0_to_255.source;
                let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
                let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
                let current_color = undefined;
                let diag = dialogs.builds([
                    "帮收能量球颜色色值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "rgb(RR,GG,BB) | #RRGGBB"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    if (diag.getInputEditText().getText().toString() !== "") {
                        if (!current_color) return alertTitle(dialog, "输入的颜色值无法识别");
                        saveSession(this.config_conj, "#" + colors.toString(current_color).toLowerCase().slice(3));
                    }
                    diag.dismiss();
                });
                diag.on("input_change", (dialog, input) => {
                    let color = "";
                    try {
                        if (input.match(regexp_hex_color)) {
                            color = colors.parseColor("#" + input.slice(-6));
                        } else if (input.match(regexp_rgb_color)) {
                            let nums = input.match(/\d+.+\d+.+\d+/)[0].split(/\D+/);
                            color = colors.rgb(+nums[0], +nums[1], +nums[2]);
                        }
                        dialog.getTitleView().setTextColor(color || -570425344);
                        dialog.getContentView().setTextColor(color || -1979711488);
                        dialog.getTitleView().setBackgroundColor(color ? -570425344 : -1);
                    } catch (e) {
                    }
                    current_color = color;
                });
                diag.show();
            },
            updateOpr: function (view) {
                let color_str = session_config[this.config_conj].toString();
                view._hint.text(color_str);
                view._hint_color_indicator.text(" \u25D1");
                view._hint_color_indicator.setTextColor(colors.parseColor(color_str));
                view._hint_color_indicator.setVisibility(0);
            },
        }))
        .add("button", new Layout("帮收能量球颜色阈值", {
            config_conj: "help_collect_balls_threshold",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "帮收能量球颜色检测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|28<=x<=83,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 83 || value < 28) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString());
            },
        }))
        .add("button", new Layout("帮收能量球样本采集密度", {
            config_conj: "help_collect_balls_intensity",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "帮收能量球样本采集密度", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|10<=x<=20,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 20 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj].toString());
            },
        }))
        .ready();
}); // help_collect_page
addPage(() => {
    setPage(["自动解锁", "auto_unlock_page"])
        .add("switch", new Layout("总开关", {
            config_conj: "auto_unlock_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("基本设置"))
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
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input && input.length < 4) return alertTitle(diag, "密码长度不小于4位");
                    saveSession(this.config_conj, input ? encrypt(input) : "");
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj] ? "已设置" : "空");
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("高级设置"))
        .add("button", new Layout("锁屏页面上滑时长", {
            config_conj: "dismiss_layer_swipe_time",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置锁屏页面上滑时长", this.config_conj,
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
        .add("button", new Layout("图案解锁滑动时长", {
            config_conj: "pattern_unlock_swipe_time",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置图案解锁滑动时长", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|120<=x<=3000,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 3000 || value < 120) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("图案解锁点阵边长", {
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
        .ready();
}); // auto_unlock_page
addPage(() => {
    setPage(["消息提示", "message_showing_page"])
        .add("switch", new Layout("总开关", {
            config_conj: "message_showing_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("基本设置"))
        .add("switch", new Layout("控制台消息", {
            config_conj: "console_log_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("radio", new Layout(["详细", "简略"], {
            values: [true, false],
            config_conj: "console_log_details",
            listeners: {
                "check": function (checked, view) {
                    checked && saveSession(this.config_conj, this.values[this.title.indexOf(view.text)]);
                },
            },
            updateOpr: function (view) {
                let session_conf = session_config[this.config_conj];
                let child_idx = this.values.indexOf(session_conf);
                if (!~child_idx) return;
                let child_view = view._radiogroup.getChildAt(child_idx);
                !child_view.checked && child_view.setChecked(true);
            },
        }))
        .add("checkbox_switch", new Layout("开发者测试模式", {
            default_state: false,
            config_conj: "debug_info_switch",
            listeners: {
                "_checkbox_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        weakOrStrongBySwitch(this, !state, -1);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_checkbox_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("switch", new Layout("运行前提示", {
            config_conj: "prompt_before_running_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("button", new Layout("对话框倒计时时长", {
            config_conj: "prompt_before_running_countdown_seconds",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "提示对话框倒计时时长", "倒计时结束前\n用户可自主点击按钮执行相应操作\n\n否则倒计时超时后脚本将自动执行",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|3<=x<=30,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 30 || value < 3) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString() + " s");
            },
        }))
        .add("button", new Layout("推迟运行间隔时长", {
            config_conj: "prompt_before_running_postponed_minutes",
            hint: "加载中...",
            map: Object.assign({
                0: "每次都询问",
            }, (() => {
                let o = {};
                DEFAULT_AF["prompt_before_running_postponed_minutes_default_choices"].forEach(num => o[num] = num + " min");
                return o;
            })()),
            newWindow: function () {
                let map = this.map;
                let map_keys = Object.keys(map);
                let diag = dialogs.builds([
                    "推迟运行间隔时长", "",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {
                    items: map_keys.slice().map(value => map[value]),
                    itemsSelectMode: "single",
                    itemsSelectedIndex: map_keys.indexOf((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString()),
                });
                diag.on("neutral", () => {
                    diag.setSelectedIndex(DEFAULT_AF[this.config_conj]);
                });
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", () => {
                    saveSession(this.config_conj, +map_keys[diag.selectedIndex]);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(this.map[(session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString()]);
            },
        }))
        .add("split_line")
        .add("switch", new Layout("运行结果展示", {
            config_conj: "result_showing_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("radio", new Layout(["Floaty", "Toast"], {
            values: [true, false],
            config_conj: "floaty_result_switch",
            listeners: {
                "check": function (checked, view) {
                    checked && saveSession(this.config_conj, this.values[this.title.indexOf(view.text)]);
                },
            },
            updateOpr: function (view) {
                let session_conf = session_config[this.config_conj];
                let child_idx = this.values.indexOf(session_conf);
                if (!~child_idx) return;
                let child_view = view._radiogroup.getChildAt(child_idx);
                !child_view.checked && child_view.setChecked(true);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow: function () {
                let diag = dialogs.builds(["关于消息提示配置", "about_message_showing_function", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
}); // message_showing_page
addPage(() => {
    setPage(["定时循环", "timers_page"], def, def, {
        check_page_state: (view) => {
            // this is just a simple check
            let switches = [
                "homepage_monitor_switch",
                "rank_list_review_switch",
                "timers_self_manage_switch",
            ];
            for (let i = 0, len = switches.length; i < len; i += 1) {
                if (session_config[switches[i]]) return true;
            }
            dialogs.builds(["提示", "定时循环子功能需至少选择一个", 0, 0, "返回"]).show();
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "timers_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("循环监测", {sub_head_color: defs.sub_head_highlight_color}))
        .add("options", new Layout("主页能量球循环监测", {
            config_conj: "homepage_monitor_switch",
            hint: "加载中...",
            next_page: "homepage_monitor_page",
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
                checkDependency(view, "self_collect_switch");
            },
        }))
        .add("options", new Layout("好友排行榜样本复查", {
            config_conj: "rank_list_review_switch",
            hint: "加载中...",
            next_page: "rank_list_review_page",
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
                checkDependency(view, ["friend_collect_switch", "help_collect_switch"])
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("定时任务", {sub_head_color: defs.sub_head_highlight_color}))
        .add("options", new Layout("定时任务自动管理", {
            config_conj: "timers_self_manage_switch",
            hint: "加载中...",
            next_page: "timers_self_manage_page",
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("button", new Layout("定时任务控制面板", {
            newWindow: function () {
                dialogs.builds(["开发未完成", "此功能暂未完成开发", 0, 0, "返回"]).show();
            },
        }))
        .ready();
}); // timers_page
addPage(() => {
    setPage(["定时任务自动管理", "timers_self_manage_page"], def, def, {
        check_page_state: (view) => {
            return checkCurrentPageSwitches() && checkAutoUnlockSwitch();

            // tool function(s) //

            function checkCurrentPageSwitches() {
                let samples = [
                    "timers_countdown_check_own_switch",
                    "timers_countdown_check_friends_switch",
                    "timers_uninterrupted_check_switch",
                    "timers_insurance_switch",
                ];
                if (!session_config.timers_self_manage_switch) return true;
                let chk = tag_name => findViewByTag(view, tag_name, 3)._checkbox_switch.checked;
                for (let i = 0, len = samples.length; i < len; i += 1) {
                    if (chk(samples[i])) return true;
                }
                dialogs.builds(["提示", "自动管理机制需至少选择一个", 0, 0, "返回"]).show();
            }

            function checkAutoUnlockSwitch() {
                if (session_config.auto_unlock_switch || storage_af.get("timers_prefer_auto_unlock_dialog_prompt_prompted")) return true;
                let timers_prefer_auto_unlock_dialog_prompt_prompted = false;
                let diag = dialogs.builds([["请注意", "caution_btn_color"], "timers_prefer_auto_unlock", 0, 0, " OK ", 1, 1]);
                diag.on("check", checked => timers_prefer_auto_unlock_dialog_prompt_prompted = !!checked);
                diag.on("positive", () => {
                    if (timers_prefer_auto_unlock_dialog_prompt_prompted) {
                        storage_af.put("timers_prefer_auto_unlock_dialog_prompt_prompted", true);
                    }
                    diag.dismiss();
                    pageJump("back");
                });
                diag.show();
            }
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "timers_self_manage_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("自动管理机制", {sub_head_color: defs.sub_head_highlight_color}))
        .add("checkbox_switch", new Layout("主页最小倒计时机制", {
            config_conj: "timers_countdown_check_own_switch",
            tag_name: "timers_countdown_check_own_switch",
            listeners: {
                "_checkbox_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_checkbox_switch"].setChecked(session_conf);
            },
        }))
        .add("button", new Layout("定时任务提前运行", {
            config_conj: "timers_countdown_check_own_timed_task_ahead",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "定时任务提前运行", "timers_countdown_check_timed_task_ahead",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=3,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 3 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    if (value === 0) saveThisSession();
                    else if (!session_config.homepage_monitor_switch) {
                        let diag_confirm = dialogs.builds([["请注意", "caution_btn_color"], "timers_ahead_prefer_monitor_own", 0, "放弃", ["确定", "warn_btn_color"], 1]);
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            saveThisSession();
                        });
                        diag_confirm.show();
                    } else if (session_config.homepage_monitor_switch && value > session_config.homepage_monitor_threshold) {
                        let diag_confirm = dialogs.builds([["请注意", "caution_btn_color"], "", 0, "放弃", ["确定", "warn_btn_color"], 1], {
                            content: "当前设置值: " + value + "\n" +
                                "主页能量球监测阈值: " + session_config.homepage_monitor_threshold + "\n\n" +
                                "设置值大于主页能量球监测阈值\n\n" +
                                "此情况下提前运行脚本\n主页能量球最小倒计时可能未达到监测阈值\n因此可能无法监测收取\n\n" +
                                "确定要保留当前设置值吗",
                        });
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            saveThisSession();
                        });
                        diag_confirm.show();
                    } else saveThisSession();

                    // tool function(s) //

                    function saveThisSession() {
                        saveSession(config_conj, ~~value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                let session_value = +session_config[this.config_conj];
                let value = isNaN(session_value) ? DEFAULT_AF[this.config_conj] : session_value;
                view._hint.text(value === 0 ? "已关闭" : (value.toString() + " min"));
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("排行榜最小倒计时机制", {
            config_conj: "timers_countdown_check_friends_switch",
            tag_name: "timers_countdown_check_friends_switch",
            listeners: {
                "_checkbox_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_checkbox_switch"].setChecked(session_conf);
            },
        }))
        .add("button", new Layout("定时任务提前运行", {
            config_conj: "timers_countdown_check_friends_timed_task_ahead",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "定时任务提前运行", "timers_countdown_check_timed_task_ahead",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=5,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 5 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    if (value === 0) saveThisSession();
                    else if (!session_config.rank_list_review_switch || !session_config.rank_list_review_threshold_switch) {
                        let diag_confirm = dialogs.builds([["请注意", "caution_btn_color"], "timers_ahead_prefer_rank_list_threshold_review", 0, "放弃", ["确定", "warn_btn_color"], 1]);
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            saveThisSession();
                        });
                        diag_confirm.show();
                    } else if (session_config.rank_list_review_switch
                        && session_config.rank_list_review_threshold_switch
                        && value > session_config.rank_list_review_threshold
                    ) {
                        let diag_confirm = dialogs.builds([["请注意", "caution_btn_color"], "", 0, "放弃", ["确定", "warn_btn_color"], 1], {
                            content: "当前设置值: " + value + "\n" +
                                "排行榜样本复查最小倒计时阈值: " + session_config.rank_list_review_threshold + "\n\n" +
                                "设置值大于样本复查最小倒计时阈值\n\n" +
                                "此情况下提前运行脚本\n排行榜样本最小倒计时可能未达到监测阈值\n因此可能无法完成倒计时监测\n\n" +
                                "确定要保留当前设置值吗",
                        });
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            saveThisSession();
                        });
                        diag_confirm.show();
                    } else saveThisSession();

                    // tool function(s) //

                    function saveThisSession() {
                        saveSession(config_conj, ~~value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                let session_value = +session_config[this.config_conj];
                let value = isNaN(session_value) ? DEFAULT_AF[this.config_conj] : session_value;
                view._hint.text(value === 0 ? "已关闭" : (value.toString() + " min"));
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("延时接力机制", {
            config_conj: "timers_uninterrupted_check_switch",
            view_tag: "timers_uninterrupted_check_switch",
            listeners: {
                "_checkbox_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_checkbox_switch"].setChecked(session_conf);
            },
        }))
        .add("options", new Layout("管理时间区间", {
            config_conj: "timers_uninterrupted_check_sections",
            hint: "加载中...",
            next_page: "timers_uninterrupted_check_sections_page",
            updateOpr: function (view) {
                let areas = session_config[this.config_conj];
                let areas_len = areas ? areas.length : 0;
                view._hint.text(areas_len ? "包含区间: " + areas_len + " 组" : "未设置");
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("意外保险机制", {
            config_conj: "timers_insurance_switch",
            view_tag: "timers_insurance_switch",
            listeners: {
                "_checkbox_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_checkbox_switch"].setChecked(session_conf);
            },
        }))
        .add("button", new Layout("保险任务运行间隔", {
            config_conj: "timers_insurance_interval",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "保险任务运行间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=10,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 10 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString() + " min");
            },
        }))
        .add("button", new Layout("最大连续保险次数", {
            config_conj: "timers_insurance_max_continuous_times",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "最大连续保险次数", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=5,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 5 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString());
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow: function () {
                let diag = dialogs.builds(["关于定时任务自动管理机制", "about_timers_self_manage", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
}); // timers_self_manage_page
addPage(() => {
    setPage(["黑名单管理", "blacklist_page"])
        .add("sub_head", new Layout("名单簿", {sub_head_color: defs.sub_head_highlight_color}))
        .add("options", new Layout("能量罩黑名单", {
            hint: "加载中...",
            next_page: "cover_blacklist_page",
            updateOpr: function (view) {
                let amount = session_config.blacklist_protect_cover.length;
                view._hint.text(amount ? "包含成员:  " + amount + " 人" : "空名单");
            },
        }))
        .add("options", new Layout("自定义黑名单", {
            hint: "加载中...",
            next_page: "self_def_blacklist_page",
            updateOpr: function (view) {
                let amount = session_config.blacklist_by_user.length;
                view._hint.text(amount ? "包含成员:  " + amount + " 人" : "空名单");
            },
        }))
        .ready();
}); // blacklist_page
addPage(() => {
    setPage(["脚本运行安全", "script_security_page"])
        .add("sub_head", new Layout("基本设置"))
        .add("button", new Layout("运行失败自动重试", {
            config_conj: "max_retry_times_global",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "脚本运行失败自动重试", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=5,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 5 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                let session_value = +session_config[this.config_conj];
                let value = isNaN(session_value) ? DEFAULT_AF[this.config_conj] : session_value;
                view._hint.text(value === 0 ? "已关闭" : value.toString());
            },
        }))
        .add("button", new Layout("单次运行最大时间", {
            config_conj: "max_running_time_global",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "脚本单次运行最大时间", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|5<=x<=90,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 90 || value < 5) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString() + " min");
            },
        }))
        .add("button", new Layout("排他性任务最大排队时间", {
            config_conj: "max_queue_time_global",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "排他性任务最大排队时间", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=120,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 120 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString() + " min");
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("高级设置"))
        .add("button", new Layout("脚本炸弹预防阈值", {
            config_conj: "min_bomb_interval_global",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "脚本炸弹预防阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|100<=x<=800,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 800 || value < 100) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString() + " ms");
            },
        }))
        .ready();
}); // script_security_page
addPage(() => {
    setPage(["项目备份还原", "local_project_backup_restore_page"])
        .add("sub_head", new Layout("备份", {sub_head_color: defs.sub_head_highlight_color}))
        .add("button", new Layout("备份至本地", {
            newWindow: function () {
                let diag = dialogs.builds(["备份项目至本地", "backup_to_local", ["添加备注", "hint_btn_bright_color"], "放弃", "开始备份", 1]);
                diag.on("negative", () => diag.dismiss());
                diag.on("neutral", () => {
                    diag.dismiss();
                    let diag_remark = dialogs.builds(["为备份添加备注", "", 0, "放弃", "确定", 1], {
                        inputHint: "",
                    });
                    diag_remark.on("negative", () => {
                        diag_remark.dismiss();
                        diag.show();
                    });
                    diag_remark.on("positive", () => {
                        session_params["project_backup_info_remark"] = diag_remark.getInputEditText().getText().toString();
                        diag_remark.dismiss();
                        diag.show();
                    });
                    diag_remark.show();
                });
                diag.on("positive", () => {
                    diag.dismiss();
                    let signal_interrupt_update = false;
                    let diag_backup = dialogs.builds(["正在备份", "此过程可能需要一些时间", 0, 0, "终止", 1], {
                        progress: {
                            max: 100,
                            showMinMax: false,
                        },
                    });
                    diag_backup.on("positive", () => {
                        signal_interrupt_update = true;
                        diag_backup.dismiss();
                    });
                    diag_backup.show();
                    threads.starts(function () {
                        backupProjectFiles(def, def, diag_backup);
                    });
                });
                diag.show();
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("还原", {sub_head_color: defs.sub_head_highlight_color}))
        .add("options", new Layout("从本地还原", {
            hint: "加载中...",
            view_label: "restore_projects_from_local",
            next_page: "restore_projects_from_local",
            updateOpr: function (view) {
                let amount = session_config.project_backup_info.length;
                view._hint.text(amount ? "共计备份:  " + amount + " 项" : "无备份");
            },
        }))
        .add("options", new Layout("从服务器还原", {
            hint: "加载中...",
            next_page: null,
            view_label: "restore_projects_from_server",
            updateOpr: function (view) {
                let view_label = this.view_label;
                let clearClickListener = () => view.setClickListener(() => null);
                let restoreClickListener = () => {
                    session_params.restore_projects_from_server_updated_flag = false;
                    view.setClickListener(() => updateViewByLabel(view_label));
                };
                if (session_params.restore_projects_from_server_updated_flag) return;
                view._chevron_btn.setVisibility(8);
                view._hint.text("正在从服务器获取数据...");
                clearClickListener();
                session_params.restore_projects_from_server_updated_flag = true;
                threads.starts(function () {
                    let setViewText = text => ui.post(() => view._hint.text(text));
                    let max_try_times = 5;
                    while (max_try_times--) {
                        try {
                            let res = http.get("https://api.github.com/repos/SuperMonster003/Auto.js_Projects/releases");
                            session_params.server_releases_info = res.body.json(); // array
                            let amount = session_params.server_releases_info.length;
                            if (!amount) {
                                restoreClickListener();
                                return setViewText("无备份 (点击可重新检查)");
                            }
                            view.setNextPage("restore_projects_from_server");
                            ui.post(() => view._chevron_btn.setVisibility(0));
                            view.restoreClickListener();
                            setViewText("共计备份:  " + amount + " 项");

                            if (waitForAction(() => view_pages[view_label], 5000)) {
                                return ui.post(() => {
                                    view_pages[view_label]
                                        .add("list", new Layout("/*服务器项目还原*/", {
                                            list_head: list_heads.server_releases_info,
                                            data_source_key_name: "server_releases_info",
                                            list_checkbox: "gone",
                                            listeners: {
                                                "_list_data": {
                                                    "item_click": function (item, idx, item_view, list_view) {
                                                        let release_details = [];
                                                        let single_session_data = session_params.server_releases_info[idx] || {};
                                                        let map = {
                                                            name: "标题",
                                                            tag_name: "标签",
                                                            created_at: "创建",
                                                            body: "版本更新内容描述",
                                                        };
                                                        Object.keys(map).forEach(key => {
                                                            if (!(key in single_session_data)) return;
                                                            let label_name = map[key];
                                                            let value = single_session_data[key];
                                                            if (value.match(/^list_item_name_\d+$/)) value = single_session_data[value];
                                                            if (key === "body") value = "\n" + value;
                                                            value && release_details.push(label_name + ": " + value);
                                                        });
                                                        release_details = release_details.join("\n\n");
                                                        let diag = dialogs.builds([
                                                            "版本详情", release_details,
                                                            ["浏览器查看", "hint_btn_bright_color"], "返回",
                                                            ["还原此项目", "warn_btn_color"], 1,
                                                        ]);
                                                        diag.on("negative", () => diag.dismiss());
                                                        diag.on("neutral", () => {
                                                            diag.dismiss();
                                                            app.openUrl(single_session_data.html_url);
                                                        });
                                                        diag.on("positive", () => {
                                                            diag.dismiss();
                                                            let diag_confirm = dialogs.builds([
                                                                "还原项目", "restore_project_confirm",
                                                                0, "放弃", ["还原", "caution_btn_color"], 1,
                                                            ]);
                                                            if (single_session_data[single_session_data.tag_name].match(/^v1\.6\.25/)) {
                                                                diag_confirm.setContent(
                                                                    defs.dialog_contents["v1_6_25_restore_confirm"] + "\n\n" +
                                                                    defs.dialog_contents["restore_project_confirm"]
                                                                );
                                                                diag_confirm.getContentView().setTextColor(colors.parseColor("#ad1457"));
                                                                diag_confirm.getTitleView().setTextColor(colors.parseColor("#880e4f"));
                                                            }
                                                            diag_confirm.on("negative", () => {
                                                                diag_confirm.dismiss();
                                                                diag.show();
                                                            });
                                                            diag_confirm.on("positive", () => {
                                                                diag_confirm.dismiss();
                                                                restoreProjectFiles(single_session_data.zipball_url);
                                                            });
                                                            diag_confirm.show();
                                                        });
                                                        diag.show();
                                                    },
                                                    "item_bind": function (item_view, item_holder) {
                                                        item_view._checkbox.setVisibility(8);
                                                    },
                                                },
                                            },
                                        }))
                                        .add("info", new Layout("点击列表项可查看并还原项目"))
                                    ;
                                });
                            }
                        } catch (e) {
                            sleep(200);
                        }
                    }
                    restoreClickListener();
                    return setViewText("服务器数据获取失败 (点击重试)");
                });
            },
        }))
        .ready();
}); // local_project_backup_restore_page
addPage(() => {
    setPage(["排行榜样本采集", "rank_list_samples_collect_page"])
        .add("sub_head", new Layout("基本设置"))
        .add("button", new Layout("滑动距离", {
            config_conj: "rank_list_swipe_distance",
            hint: "加载中...",
            newWindow: function () {
                let avail_top = Math.ceil(HEIGHT * 0.4);
                let avail_bottom = Math.floor(HEIGHT * 0.9);
                let collect_icon_height = cY(46, 16 / 9);
                let safe_value = (USABLE_HEIGHT - status_bar_height - action_bar_default_height - collect_icon_height);
                let default_value = DEFAULT_AF[this.config_conj].toString();
                let getScaleStr = value => " [ " + ~~(value * 100 / HEIGHT) / 100 + " ]";
                let diag = dialogs.builds(["设置排行榜页面滑动距离", "", ["使用安全值", "hint_btn_bright_color"], "返回", "确认修改", 1], {
                    content: "参数示例:\n1260: 每次滑动 1260 像素\n0.6: 每次滑动 60% 屏幕距离\n\n" +
                        "有效值: " + avail_top + " [ " + (avail_top / HEIGHT) + " ] " +
                        " -  " + avail_bottom + " [ " + (avail_bottom / HEIGHT) + " ]\n" +
                        "默认值: " + ~~(default_value * HEIGHT) + " [ " + default_value + " ]\n" +
                        "安全值: " + safe_value + getScaleStr(safe_value),
                    inputHint: "{x|0.4(*HEIGHT)<=x<=0.9(*HEIGHT),x∈R}",
                });
                diag.on("neutral", () => diag.getInputEditText().setText(safe_value.toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") input = (session_config[this.config_conj] || default_value).toString();
                    if (input.match(/^\d+%$/)) input = input.replace("%", "") / 100;
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 0 && value < 1) value *= HEIGHT;
                    if (value > avail_bottom || value < avail_top) return alertTitle(dialog, "输入值范围不合法");
                    if (value > safe_value) {
                        let diag_confirm = dialogs.builds([
                            ["请注意", "caution_btn_color"], "",
                            ["什么是安全值", "hint_btn_bright_color"], "放弃", ["确定", "warn_btn_color"], 1,
                        ], {
                            content: "当前值: " + value + "\n安全值: " + safe_value + "\n\n" +
                                "当前设置值大于安全值\n滑动时可能出现遗漏采集目标的问题\n\n" +
                                "确定要保留当前设置值吗",
                        });
                        diag_confirm.on("neutral", () => {
                            dialogs.builds(["滑动距离安全值", "", 0, 0, "返回"], {
                                content: "安全值指排行榜滑动时可避免采集目标遗漏的理论最大值\n\n" +
                                    "计算方法:\n屏幕高度 [ " + HEIGHT + " ]\n" +
                                    "减去 导航栏高度 [ " + navigation_bar_height + " ]\n" +
                                    "减去 状态栏高度 [ " + status_bar_height + " ]\n" +
                                    "减去 ActionBar默认高度 [ " + action_bar_default_height + " ]\n" +
                                    "减去 帮收图标缩放高度 [ " + collect_icon_height + " ]\n" +
                                    "得到 安全值 [ " + safe_value + " ]\n\n" +
                                    "* 括号中的数据均源自当前设备\n" +
                                    "* 安全值为理论值\n-- 不代表真实可操作的最佳值",
                            }).show();
                        });
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            saveSession(this.config_conj, ~~value);
                            diag_confirm.dismiss();
                            diag.dismiss();
                        });
                        diag_confirm.show();
                    } else {
                        saveSession(this.config_conj, ~~value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                let value = session_config[this.config_conj] || DEFAULT_AF[this.config_conj];
                if (value < 1) value = ~~(value * HEIGHT);
                view._hint.text(value.toString() + " px  [ " + Math.round(value / HEIGHT * 100) + "% H ]");
            },
        }))
        .add("button", new Layout("滑动时长", {
            config_conj: "rank_list_swipe_time",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置排行榜页面滑动时长", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|50<=x<=500,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 500 || value < 50) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("滑动间隔", {
            config_conj: "rank_list_swipe_interval",
            hint: "加载中...",
            newWindow: function () {
                let diag_strategy_image = dialogs.builds([
                    "设置排行榜页面滑动间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|100<=x<=800,x∈N}"});
                diag_strategy_image.on("neutral", () => diag_strategy_image.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag_strategy_image.on("negative", () => diag_strategy_image.dismiss());
                diag_strategy_image.on("positive", dialog => {
                    let input = diag_strategy_image.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 800 || value < 100) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag_strategy_image.dismiss();
                });
                let diag_strategy_layout = dialogs.builds([
                    "设置排行榜页面滑动间隔", "采用\"布局分析\"策略时\n滑动间隔将由脚本自动获取动态最优值",
                    0, 0, "返回", 1,
                ]);
                diag_strategy_layout.on("positive", () => diag_strategy_layout.dismiss());
                session_config.rank_list_samples_collect_strategy === "image" && diag_strategy_image.show() || diag_strategy_layout.show();
            },
            updateOpr: function (view) {
                if (session_config.rank_list_samples_collect_strategy === "image") view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString() + " ms");
                else view._hint.text("自动设置");
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("高级设置"))
        .add("options", new Layout("列表自动展开", {
            config_conj: "rank_list_auto_expand_switch",
            hint: "加载中...",
            next_page: "rank_list_auto_expand_page",
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("options", new Layout("样本复查", {
            config_conj: "rank_list_review_switch",
            hint: "加载中...",
            next_page: "rank_list_review_page",
            updateOpr: function (view) {
                view._hint.text(session_config[this.config_conj] ? "已开启" : "已关闭");
                checkDependency(view, "timers_switch");
            },
        }))
        .add("button", new Layout("采集策略", {
            config_conj: "rank_list_samples_collect_strategy",
            hint: "加载中...",
            map: {
                "layout": "布局分析",
                "image": "图像处理",
            },
            newWindow: function () {
                let map = this.map;
                let map_keys = Object.keys(map);
                let diag = dialogs.builds(["排行榜样本采集策略", "", ["了解详情", "hint_btn_bright_color"], "返回", "确认修改", 1], {
                    items: map_keys.slice().map(value => map[value]),
                    itemsSelectMode: "single",
                    itemsSelectedIndex: map_keys.indexOf((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString()),
                });
                diag.on("neutral", () => {
                    let diag_about = dialogs.builds(["关于采集策略", "about_rank_list_samples_collect_strategy", 0, 0, "关闭", 1])
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
                view._hint.text(this.map[(session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString()]);
            },
        }))
        .ready();
}); // rank_list_samples_collect_page
addPage(() => {
    setPage(["排行榜列表自动展开", "rank_list_auto_expand_page"])
        .add("switch", new Layout("总开关", {
            config_conj: "rank_list_auto_expand_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("基本设置"))
        .add("button", new Layout("列表自动展开最大值", {
            config_conj: "rank_list_auto_expand_length",
            hint: "加载中...",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置列表自动展开最大值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|100<=x<=500,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 500 || value < 100) return alertTitle(dialog, "输入值范围不合法");
                    saveSession(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString());
            },
        }))
        .ready();
}); // rank_list_auto_expand_page
addPage(() => {
    setPage(["排行榜样本复查", "rank_list_review_page"], def, def, {
        check_page_state: (view) => {
            let samples = [
                "rank_list_review_threshold_switch",
                "rank_list_review_samples_clicked_switch",
                "rank_list_review_difference_switch"
            ];
            if (!session_config.rank_list_review_switch) return true;
            let chk = tag_name => findViewByTag(view, tag_name, 3)._checkbox_switch.checked;
            for (let i = 0, len = samples.length; i < len; i += 1) {
                if (chk(samples[i])) return true;
            }
            dialogs.builds(["提示", "样本复查条件需至少选择一个", 0, 0, "返回"]).show();
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "rank_list_review_switch",
            listeners: {
                "_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("sub_head", new Layout("复查条件", {sub_head_color: defs.sub_head_highlight_color}))
        .add("checkbox_switch", new Layout("列表状态差异", {
            config_conj: "rank_list_review_difference_switch",
            view_tag: "rank_list_review_difference_switch",
            listeners: {
                "_checkbox_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_checkbox_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("样本点击记录", {
            config_conj: "rank_list_review_samples_clicked_switch",
            view_tag: "rank_list_review_samples_clicked_switch",
            listeners: {
                "_checkbox_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_checkbox_switch"].setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("最小倒计时阈值", {
            config_conj: "rank_list_review_threshold_switch",
            view_tag: "rank_list_review_threshold_switch",
            listeners: {
                "_checkbox_switch": {
                    "check": function (state) {
                        saveSession(this.config_conj, !!state);
                        showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!session_config[this.config_conj];
                view["_checkbox_switch"].setChecked(session_conf);
            },
        }))
        .add("seekbar", new Layout("阈值", {
            config_conj: "rank_list_review_threshold",
            nums: [1, 5],
            unit: "min",
        }))
        .add("split_line")
        .add("sub_head", new Layout("帮助与支持"))
        .add("button", new Layout("了解更多", {
            newWindow: function () {
                let diag = dialogs.builds(["关于排行榜样本复查", "about_rank_list_review", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .add("split_line")
        .add("info", new Layout("\"收取\/帮收功能\"与\"定时循环\"共用此页面配置"))
        .ready();
}); // rank_list_review_page
addPage(() => {
    setPage(["能量罩黑名单", "cover_blacklist_page"], def, def, {no_margin_bottom: true, no_scroll_view: true})
        .add("list", new Layout("/*能量罩黑名单成员*/", {
            list_head: list_heads.blacklist_protect_cover,
            data_source_key_name: "blacklist_protect_cover",
            list_checkbox: "gone",
            listeners: {
                "_list_data": {
                    "item_bind": function (item_view, item_holder) {
                        item_view._checkbox.setVisibility(8);
                    }
                },
            }
        }))
        .add("info", new Layout("能量罩黑名单由脚本自动管理"))
        .ready();
}); // cover_blacklist_page
addPage(() => {
    setPage(["自定义黑名单", "self_def_blacklist_page"], def, parent_view => setBlacklistPageButtons(parent_view, "blacklist_by_user"), {no_margin_bottom: true, no_scroll_view: true})
        .add("list", new Layout("/*自定义黑名单成员*/", {
            list_head: list_heads.blacklist_by_user,
            data_source_key_name: "blacklist_by_user",
            list_checkbox: "visible",
            listeners: {
                "_list_data": {
                    "item_long_click": function (e, item, idx, item_view, list_view) {
                        item_view._checkbox.checked && item_view._checkbox.click();
                        e.consumed = true;
                        let {data_source_key_name} = this;
                        let edit_item_diag = dialogs.builds(["编辑列表项", "点击需要编辑的项", 0, "返回", "确认", 1], {
                            items: ["\xa0"],
                        });

                        refreshItems();

                        edit_item_diag.on("positive", () => {
                            let new_item = {};
                            new_item.name = edit_item_diag.getItems().toArray()[0].split(": ")[1];
                            let input = edit_item_diag.getItems().toArray()[1].split(": ")[1];
                            new_item.timestamp = restoreFromTimestamp(input);
                            updateDataSource(data_source_key_name, "splice", [idx, 1, new_item]);
                            if (!equalObjects(session_config[data_source_key_name], storage_config[data_source_key_name])) {
                                session_params[data_source_key_name + "_btn_restore"].switch_on();
                            }
                            edit_item_diag.dismiss();
                        });
                        edit_item_diag.on("negative", () => edit_item_diag.dismiss());
                        edit_item_diag.on("item_select", (idx, list_item, dialog) => {
                            let list_item_prefix = list_item.split(": ")[0];
                            let list_item_content = list_item.split(": ")[1];

                            if (list_item_prefix === "好友昵称") {
                                dialogs.rawInput("修改" + list_item_prefix, list_item_content, input => {
                                    if (input) refreshItems(list_item_prefix, input);
                                });
                            }

                            if (list_item_prefix === "解除时间") {
                                edit_item_diag.dismiss();
                                ui.main.getParent().addView(setTimePickerView());
                            }

                            // tool function(s) //

                            function setTimePickerView() {
                                let time_picker_view = ui.inflate(
                                    <frame bg="#ffffff">
                                        <scroll>
                                            <vertical padding="16">
                                                <frame h="1" bg="#acacac" w="*"/>
                                                <frame w="auto" layout_gravity="center" marginTop="15">
                                                    <text text="设置日期" textColor="#01579b" textSize="16sp"/>
                                                </frame>
                                                <datepicker h="160" id="datepicker" datePickerMode="spinner" marginTop="-10"/>
                                                <frame h="1" bg="#acacac" w="*"/>
                                                <frame w="auto" layout_gravity="center" marginTop="15">
                                                    <text text="设置时间" textColor="#01579b" textSize="16sp"/>
                                                </frame>
                                                <timepicker h="160" id="timepicker" timePickerMode="spinner" marginTop="-10"/>
                                                <frame h="1" bg="#acacac" w="*"/>
                                                <frame w="auto" layout_gravity="center" margin="0 30 0 25">
                                                    <text id="time_str" text="" textColor="#bf360c" textSize="15sp"/>
                                                </frame>
                                                <horizontal w="auto" layout_gravity="center">
                                                    <button id="back_btn" text="返回" margin="10 0" backgroundTint="#eeeeee"/>
                                                    <button id="zero_btn" text="设置 '永不'" margin="10 0" backgroundTint="#fff9c4"/>
                                                    <button id="confirm_btn" text="确认选择" margin="10 0" backgroundTint="#dcedc8"/>
                                                    <button id="add_btn" text="增加" margin="10 0" visibility="gone"/>
                                                </horizontal>
                                            </vertical>
                                        </scroll>
                                    </frame>
                                );

                                setTimeStr();
                                time_picker_view.setTag("time_picker");

                                time_picker_view.datepicker.setOnDateChangedListener(setTimeStr);
                                time_picker_view.timepicker.setOnTimeChangedListener(setTimeStr);
                                time_picker_view.back_btn.on("click", () => closeTimePickerPage());
                                time_picker_view.zero_btn.on("click", () => closeTimePickerPage(Infinity));
                                time_picker_view.confirm_btn.on("click", () => {
                                    let datepicker = time_picker_view.datepicker;
                                    let timepicker = time_picker_view.timepicker;
                                    let set_time = new Date(datepicker.getYear(), datepicker.getMonth(), datepicker.getDayOfMonth(), timepicker.getCurrentHour(), timepicker.getCurrentMinute()).getTime();
                                    if (set_time <= new Date().getTime()) return alert("设置时间需大于当前时间");
                                    closeTimePickerPage(set_time);
                                });

                                return time_picker_view;

                                // tool function(s) //

                                function setTimeStr() {
                                    let datepicker = time_picker_view.datepicker;
                                    let timepicker = time_picker_view.timepicker;
                                    let fillZero = num => ("0" + num).slice(-2);
                                    let time_str = "已选择:  " +
                                        datepicker.getYear() + "年" +
                                        fillZero(datepicker.getMonth() + 1) + "月" +
                                        fillZero(datepicker.getDayOfMonth()) + "日 " +
                                        fillZero(timepicker.getCurrentHour()) + ":" +
                                        fillZero(timepicker.getCurrentMinute());
                                    time_picker_view.time_str.setText(time_str);
                                }

                                function closeTimePickerPage(return_value) {
                                    edit_item_diag.show();
                                    let parent = ui.main.getParent();
                                    let child_count = parent.getChildCount();
                                    for (let i = 0; i < child_count; i += 1) {
                                        let child_view = parent.getChildAt(i);
                                        if (child_view.findViewWithTag("time_picker")) parent.removeView(child_view);
                                    }
                                    if (typeof return_value !== "undefined") {
                                        refreshItems(list_item_prefix, getTimestamp(return_value, "time_str_remove"));
                                    }
                                }
                            }
                        });
                        edit_item_diag.show();

                        // tool function(s) //

                        function refreshItems(prefix, value) {
                            let value_obj = {};
                            let key_map = {
                                0: "好友昵称",
                                1: "解除时间",
                            };
                            if (!prefix && !value) {
                                value_obj = {};
                                value_obj[key_map[0]] = item[item.name];
                                value_obj[key_map[1]] = item[item.timestamp];
                            } else {
                                edit_item_diag.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                            }
                            if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                            let items = [];
                            Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                            edit_item_diag.setItems(items);
                        }
                    },
                    "item_click": function (item, idx, item_view, list_view) {
                        item_view._checkbox.click();
                    },
                    "item_bind": function (item_view, item_holder) {
                        item_view._checkbox.on("click", checkbox_view => {
                            let {data_source_key_name} = this;
                            let remove_btn_view = session_params[data_source_key_name + "_btn_remove"];
                            let item = item_holder.item;
                            let aim_checked = !item.checked;
                            item.checked = aim_checked;
                            let idx = item_holder.position;
                            let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                            let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                            session_params[deleted_items_idx] = session_params[deleted_items_idx] || {};
                            session_params[deleted_items_idx_count] = session_params[deleted_items_idx_count] || 0;
                            session_params[deleted_items_idx][idx] = aim_checked;
                            aim_checked ? session_params[deleted_items_idx_count]++ : session_params[deleted_items_idx_count]--;
                            session_params[deleted_items_idx_count] ? remove_btn_view.switch_on() : remove_btn_view.switch_off();
                            this.view._check_all.setChecked(session_params[deleted_items_idx_count] === session_config[this.data_source_key_name].length);
                        });
                    },
                },
                "_check_all": {
                    "click": function (view) {
                        let {data_source_key_name} = this;
                        let aim_checked = view.checked;
                        let blacklist_len = session_params[data_source_key_name].length;
                        if (!blacklist_len) return view.checked = !aim_checked;

                        session_params[data_source_key_name].forEach((o, idx) => {
                            let o_new = deepCloneObject(o);
                            o_new.checked = aim_checked;
                            updateDataSource(data_source_key_name, "splice", [idx, 1, o_new]);
                        });

                        let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                        let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                        session_params[deleted_items_idx_count] = aim_checked ? blacklist_len : 0;
                        session_params[deleted_items_idx] = session_params[deleted_items_idx] || {};
                        for (let i = 0; i < blacklist_len; i += 1) {
                            session_params[deleted_items_idx][i] = aim_checked;
                        }

                        let remove_btn = session_params[this.data_source_key_name + "_btn_remove"];
                        aim_checked ? blacklist_len && remove_btn.switch_on() : remove_btn.switch_off();
                    },
                },
            },
        }))
        .add("info", new Layout("/*dynamic_info*/", {
            updateOpr: function (view) {
                let amount = session_config.blacklist_by_user.length;
                view._info_text.setText(amount ? "长按列表项可编辑项目" : "点击添加按钮可添加人员");
            },
        }))
        .add("info", new Layout("点击标题可排序", {
            updateOpr: function (view) {
                let amount = session_config.blacklist_by_user.length;
                view.setVisibility(amount ? 0 : 8);
            },
        }))
        .ready();
}); // self_def_blacklist_page
addPage(() => {
    setPage(["延时接力管理", "timers_uninterrupted_check_sections_page"], def, parent_view => setTimersUninterruptedCheckAreasPageButtons(parent_view, "timers_uninterrupted_check_sections"), {no_margin_bottom: true, no_scroll_view: true})
        .add("list", new Layout("/*延时接力时间区间*/", {
            list_head: list_heads.timers_uninterrupted_check_sections,
            data_source_key_name: "timers_uninterrupted_check_sections",
            list_checkbox: "visible",
            listeners: {
                "_list_data": {
                    "item_long_click": function (e, item, idx, item_view, list_view) {
                        item_view._checkbox.checked && item_view._checkbox.click();
                        e.consumed = true;
                        let {data_source_key_name} = this;
                        let edit_item_diag = dialogs.builds(["编辑列表项", "点击需要编辑的项", 0, "返回", "确认", 1], {
                            items: ["\xa0"],
                        });

                        refreshItems();

                        edit_item_diag.on("positive", () => {
                            let sectionStringTransform = () => {
                                let arr = list_heads[data_source_key_name];
                                for (let i = 0, len = arr.length; i < len; i += 1) {
                                    let o = arr[i];
                                    if ("section" in o) return o.stringTransform;
                                }
                            };
                            updateDataSource(data_source_key_name, "splice", [idx, 1, {
                                section: sectionStringTransform()["backward"](edit_item_diag.getItems().toArray()[0].split(": ")[1]),
                                interval: +edit_item_diag.getItems().toArray()[1].split(": ")[1],
                            }]);
                            if (!equalObjects(session_config[data_source_key_name], storage_config[data_source_key_name])) {
                                session_params[data_source_key_name + "_btn_restore"].switch_on();
                            }
                            edit_item_diag.dismiss();
                        });
                        edit_item_diag.on("negative", () => edit_item_diag.dismiss());
                        edit_item_diag.on("item_select", (idx, list_item, dialog) => {
                            let list_item_prefix = list_item.split(": ")[0];
                            let list_item_content = list_item.split(": ")[1];

                            if (list_item_prefix === "区间") {
                                edit_item_diag.dismiss();
                                ui.main.getParent().addView(setTimePickerView());
                            }

                            if (list_item_prefix === "间隔") {
                                let diag = dialogs.builds(["修改" + list_item_prefix, "", 0, "返回", "确认修改", 1], {
                                    inputHint: "{x|1<=x<=600,x∈N}",
                                    inputPrefill: list_item_content.toString(),
                                });
                                diag.on("negative", () => diag.dismiss());
                                diag.on("positive", dialog => {
                                    let input = diag.getInputEditText().getText().toString();
                                    if (input === "") return dialog.dismiss();
                                    let value = +input;
                                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                                    if (value > 600 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                                    refreshItems(list_item_prefix, ~~value);
                                    diag.dismiss();
                                });
                                diag.show();
                            }

                            // tool function(s) //

                            function setTimePickerView() {
                                let time_picker_view = ui.inflate(
                                    <frame bg="#ffffff">
                                        <scroll>
                                            <vertical padding="16">
                                                <frame h="1" bg="#acacac" w="*"/>
                                                <frame w="auto" layout_gravity="center" marginTop="15">
                                                    <text text="设置开始时间" textColor="#01579b" textSize="16sp"/>
                                                </frame>
                                                <timepicker h="160" id="timepicker_start" timePickerMode="spinner" marginTop="-10"/>
                                                <frame h="1" bg="#acacac" w="*"/>
                                                <frame w="auto" layout_gravity="center" marginTop="15">
                                                    <text text="设置结束时间" textColor="#01579b" textSize="16sp"/>
                                                </frame>
                                                <timepicker h="160" id="timepicker_end" timePickerMode="spinner" marginTop="-10"/>
                                                <frame h="1" bg="#acacac" w="*"/>
                                                <frame w="auto" layout_gravity="center" margin="0 30 0 25">
                                                    <text id="time_str" text="" textColor="#bf360c" textSize="15sp" gravity="center"/>
                                                </frame>
                                                <horizontal w="auto" layout_gravity="center">
                                                    <button id="back_btn" text="返回" margin="20 0" backgroundTint="#eeeeee"/>
                                                    <button id="confirm_btn" text="确认选择" margin="20 0" backgroundTint="#dcedc8"/>
                                                </horizontal>
                                            </vertical>
                                        </scroll>
                                    </frame>
                                );

                                setTimeStr();
                                time_picker_view.setTag("time_picker");

                                time_picker_view.timepicker_start.setOnTimeChangedListener(setTimeStr);
                                time_picker_view.timepicker_end.setOnTimeChangedListener(setTimeStr);
                                time_picker_view.back_btn.on("click", () => closeTimePickerPage());
                                time_picker_view.confirm_btn.on("click", () => closeTimePickerPage(time_picker_view.time_str.getText()));

                                return time_picker_view;

                                // tool function(s) //

                                function setTimeStr() {
                                    let timepicker_start = time_picker_view.timepicker_start;
                                    let timepicker_end = time_picker_view.timepicker_end;
                                    let fillZero = num => ("0" + num).slice(-2);
                                    let time_str_start = fillZero(timepicker_start.getCurrentHour()) +
                                        ":" + fillZero(timepicker_start.getCurrentMinute());
                                    let time_str_end = fillZero(timepicker_end.getCurrentHour()) +
                                        ":" + fillZero(timepicker_end.getCurrentMinute());
                                    let time_str = time_str_start + " - " + time_str_end;
                                    if (time_str_end <= time_str_start) time_str += " (+1)";
                                    time_picker_view.time_str.setText(time_str);
                                }

                                function closeTimePickerPage(return_value) {
                                    edit_item_diag.show();
                                    let parent = ui.main.getParent();
                                    let child_count = parent.getChildCount();
                                    for (let i = 0; i < child_count; i += 1) {
                                        let child_view = parent.getChildAt(i);
                                        if (child_view.findViewWithTag("time_picker")) parent.removeView(child_view);
                                    }
                                    if (typeof return_value !== "undefined") {
                                        refreshItems(list_item_prefix, return_value);
                                    }
                                }
                            }
                        });
                        edit_item_diag.show();

                        // tool function(s) //

                        function refreshItems(prefix, value) {
                            let value_obj = {};
                            let key_map = {
                                0: "区间",
                                1: "间隔",
                            };
                            if (!prefix && !value) {
                                value_obj = {};
                                value_obj[key_map[0]] = item[item.section];
                                value_obj[key_map[1]] = item[item.interval];
                            } else {
                                edit_item_diag.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                            }
                            if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                            let items = [];
                            Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                            edit_item_diag.setItems(items);
                        }
                    },
                    "item_click": function (item, idx, item_view, list_view) {
                        item_view._checkbox.click();
                    },
                    "item_bind": function (item_view, item_holder) {
                        item_view._checkbox.on("click", checkbox_view => {
                            let {data_source_key_name} = this;
                            let remove_btn_view = session_params[data_source_key_name + "_btn_remove"];
                            let item = item_holder.item;
                            let aim_checked = !item.checked;
                            item.checked = aim_checked;
                            let idx = item_holder.position;
                            let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                            let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                            session_params[deleted_items_idx] = session_params[deleted_items_idx] || {};
                            session_params[deleted_items_idx_count] = session_params[deleted_items_idx_count] || 0;
                            session_params[deleted_items_idx][idx] = aim_checked;
                            aim_checked ? session_params[deleted_items_idx_count]++ : session_params[deleted_items_idx_count]--;
                            session_params[deleted_items_idx_count] ? remove_btn_view.switch_on() : remove_btn_view.switch_off();
                            this.view._check_all.setChecked(session_params[deleted_items_idx_count] === session_config[data_source_key_name].length);
                        });
                    },
                },
                "_check_all": {
                    "click": function (view) {
                        let {data_source_key_name} = this;
                        let aim_checked = view.checked;
                        let blacklist_len = session_params[data_source_key_name].length;
                        if (!blacklist_len) return view.checked = !aim_checked;

                        session_params[data_source_key_name].forEach((o, idx) => {
                            let o_new = deepCloneObject(o);
                            o_new.checked = aim_checked;
                            updateDataSource(data_source_key_name, "splice", [idx, 1, o_new]);
                        });

                        let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                        let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                        session_params[deleted_items_idx_count] = aim_checked ? blacklist_len : 0;
                        session_params[deleted_items_idx] = session_params[deleted_items_idx] || {};
                        for (let i = 0; i < blacklist_len; i += 1) {
                            session_params[deleted_items_idx][i] = aim_checked;
                        }

                        let remove_btn = session_params[data_source_key_name + "_btn_remove"];
                        aim_checked ? blacklist_len && remove_btn.switch_on() : remove_btn.switch_off();
                    },
                },
            },
        }))
        .add("info", new Layout("/*dynamic_info*/", {
            updateOpr: function (view) {
                let amount = session_config.timers_uninterrupted_check_sections.length;
                view._info_text.setText(amount ? "时间区间的\"+1\"表示次日时间" : "点击添加按钮可添加区间");
            },
        }))
        .add("info", new Layout("长按列表项可编辑项目 点击标题可排序", {
            updateOpr: function (view) {
                let amount = session_config.timers_uninterrupted_check_sections.length;
                view.setVisibility(amount ? 0 : 8);
            },
        }))
        .ready();
}); // timers_uninterrupted_check_sections_page
addPage(() => {
    setPage(["从本地还原项目", "restore_projects_from_local"], def, def, {no_margin_bottom: true, no_scroll_view: true})
        .add("list", new Layout("/*本地项目还原*/", {
            list_head: list_heads.project_backup_info,
            data_source_key_name: "project_backup_info",
            list_checkbox: "gone",
            get tool_box() {
                return {
                    deleteItem: (parent_dialog, idx) => {
                        parent_dialog && parent_dialog.dismiss();

                        let diag_delete_confirm = dialogs.builds([
                            "删除备份", "确定删除此备份吗\n此操作无法撤销",
                            0, "放弃", ["删除", "caution_btn_color"], 1,
                        ]);
                        diag_delete_confirm.on("negative", () => {
                            diag_delete_confirm.dismiss();
                            parent_dialog && parent_dialog.show();
                        });
                        diag_delete_confirm.on("positive", () => {
                            diag_delete_confirm.dismiss();

                            let {data_source_key_name} = this;
                            updateDataSource(data_source_key_name, "splice", [idx, 1], "quiet");
                            updateViewByLabel("restore_projects_from_local");

                            // write to storage right away
                            storage_af.put(data_source_key_name, storage_config[data_source_key_name] = deepCloneObject(session_config[data_source_key_name]));
                        });
                        diag_delete_confirm.show();
                    }
                };
            },
            listeners: {
                "_list_data": {
                    "item_long_click": function (e, item, idx, item_view, list_view) {
                        e.consumed = true;
                        this.tool_box.deleteItem(null, idx);
                    },
                    "item_click": function (item, idx, item_view, list_view) {
                        let backup_details = [];
                        let single_session_data = session_config[this.data_source_key_name][idx] || {};
                        let map = {
                            version_name: "版本",
                            timestamp: "时间",
                            file_path: "路径",
                            remark: "备注",
                        };
                        Object.keys(map).forEach(key => {
                            if (!(key in single_session_data)) return;
                            let label_name = map[key];
                            let value = single_session_data[key];
                            if (key === "timestamp") value = getTimestamp(value, "time_str");
                            value && backup_details.push(label_name + ": " + value);
                        });
                        backup_details = backup_details.join("\n\n");
                        let diag = dialogs.builds([
                            "备份详情", backup_details,
                            ["删除此备份", "caution_btn_color"], "返回", ["还原此备份", "warn_btn_color"], 1,
                        ]);
                        diag.on("positive", () => {
                            diag.dismiss();
                            let diag_confirm = dialogs.builds([
                                "还原本地备份", "restore_from_local",
                                0, "放弃", ["还原", "caution_btn_color"], 1,
                            ]);
                            diag_confirm.on("negative", () => {
                                diag_confirm.dismiss();
                                diag.show();
                            });
                            diag_confirm.on("positive", () => {
                                diag_confirm.dismiss();
                                restoreProjectFiles(single_session_data.file_path);
                            });
                            diag_confirm.show();
                        });
                        diag.on("negative", () => diag.dismiss());
                        diag.on("neutral", () => this.tool_box.deleteItem(diag, idx));
                        diag.show();
                    },
                    "item_bind": function (item_view, item_holder) {
                        item_view._checkbox.setVisibility(8);
                    },
                },
            },
        }))
        .add("info", new Layout("dynamic_info", {
            view_label: "restore_projects_from_local",
            updateOpr: function (view) {
                view._info_text.setText(session_config.project_backup_info.length ? "点击列表项可还原项目或删除备份项目" : "暂无备份项目");
            },
        }))
        .add("info", new Layout("长按列表项可删除备份项目", {
            view_label: "restore_projects_from_local",
            updateOpr: function (view) {
                view.setVisibility(session_config.project_backup_info.length ? 0 : 8);
            },
        }))
        .ready();
}); // restore_projects_from_local
addPage(() => {
    setPage(["从服务器还原项目", "restore_projects_from_server"], def, def, {no_margin_bottom: true, no_scroll_view: true})
        .ready();
}); // restore_projects_from_server

ui.emitter.on("back_pressed", e => {
    let len = rolling_pages.length,
        need_save = needSave();
    if (!checkPageState()) return e.consumed = true;
    if (len === 1 && !need_save) return quitNow(); // "back" function
    e.consumed = true; // make default "back" dysfunctional
    len === 1 && need_save ? showQuitConfirmDialog() : pageJump("back");

    // tool function(s) //

    function showQuitConfirmDialog() {
        let diag = dialogs.builds([
            "设置未保存", "确定要退出吗",
            "返回", ["强制退出", "caution_btn_color"], ["保存并退出", "hint_btn_bright_color"], 1,
        ]);
        diag.on("neutral", () => diag.dismiss());
        diag.on("negative", () => ~diag.dismiss() && quitNow());
        diag.on("positive", () => saveNow() && ~diag.dismiss() && quitNow());
        diag.show();
    }

    function quitNow() {
        if (storage_af.get("af_postponed")) {
            toast("配置结束\n即将运行蚂蚁森林");
            engines.execScriptFile("./Ant_Forest_Launcher.js");
            storage_af.remove("af_postponed");
            storage_af.put("config_prompted", true);
        }
        exit();
    }
});
events.on("exit", () => {
    initUI();
    // thread_sub_page_views.isAlive() && thread_sub_page_views.interrupt();
    threads.shutDownAll();
    listener.removeAllListeners();
    // dialogs_pool.forEach(diag => diag = null);
    ui.finish();
});
listener.emit("sub_page_views_add");

// layout function(s) //

function setBlacklistPageButtons(parent_view, data_source_key_name) {
    return setButtons(parent_view, data_source_key_name,
        ["restore", "RESTORE", "OFF", (btn_view) => {
            let blacklist_backup = storage_config[data_source_key_name];
            if (equalObjects(session_config[data_source_key_name], blacklist_backup)) return;
            let diag = dialogs.builds([
                "恢复列表数据", "restore_original_list_data",
                ["查看恢复列表", "hint_btn_bright_color"], "返回", "确定", 1,
            ]);
            diag.on("neutral", () => {
                let diag_restore_list = dialogs.builds(["查看恢复列表", "", 0, 0, "返回", 1], {
                    content: "共计 " + blacklist_backup.length + " 项",
                    items: (function () {
                        let split_line = "";
                        for (let i = 0; i < 18; i += 1) split_line += "- ";
                        let items = [split_line];
                        blacklist_backup.forEach(o => items.push("好友昵称: " + o.name, "解除时间: " + getTimestamp(o.timestamp, "time_str_remove"), split_line));
                        return items.length > 1 ? items : ["列表为空"];
                    })(),
                });
                diag_restore_list.on("positive", () => diag_restore_list.dismiss());
                diag_restore_list.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                let list_page_view = findViewByTag(parent_view, "list_page_view");
                diag.dismiss();
                updateDataSource(data_source_key_name, "splice", [0, session_params[data_source_key_name].length]);

                let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                session_params[deleted_items_idx] = {};
                session_params[deleted_items_idx_count] = 0;
                let remove_btn = parent_view._text_remove.getParent();
                remove_btn.switch_off();
                btn_view.switch_off();
                blacklist_backup.forEach(value => updateDataSource(data_source_key_name, "update", value));
                list_page_view._check_all.setChecked(true);
                list_page_view._check_all.setChecked(false);
            });
            diag.show();
        }],
        ["delete_forever", "REMOVE", "OFF", (btn_view) => {

            let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
            let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
            if (!session_params[deleted_items_idx_count]) return;

            let thread_items_stable = threads.starts(function () {
                let old_count = undefined;
                while (session_params[deleted_items_idx_count] !== old_count) {
                    old_count = session_params[deleted_items_idx_count];
                    sleep(50);
                }
            });
            thread_items_stable.join(800);

            let deleted_items_idx_keys = Object.keys(session_params[deleted_items_idx]);
            deleted_items_idx_keys.sort((a, b) => +a < +b).forEach(idx => session_params[deleted_items_idx][idx] && session_params[data_source_key_name].splice(idx, 1));
            updateDataSource(data_source_key_name, "rewrite");
            session_params[deleted_items_idx] = {};
            session_params[deleted_items_idx_count] = 0;

            let list_page_view = findViewByTag(parent_view, "list_page_view");
            let restore_btn = parent_view._text_restore.getParent();
            if (!equalObjects(session_config[data_source_key_name], storage_config[data_source_key_name])) restore_btn.switch_on();
            else restore_btn.switch_off();
            list_page_view._check_all.setChecked(true);
            list_page_view._check_all.setChecked(false);
            btn_view.switch_off();
        }],
        ["add_circle", "NEW", "ON", (btn_view) => {
            let tmp_selected_friends = [];
            let blacklist_selected_friends = [];
            let list_page_view = findViewByTag(parent_view, "list_page_view");

            session_config[data_source_key_name].forEach(o => blacklist_selected_friends.push(o.name));

            let diag = dialogs.builds([
                "添加新数据", "从好友列表中选择并添加好友\n或手动输入好友昵称",
                ["从列表中选择", "hint_btn_bright_color"], ["手动添加", "hint_btn_bright_color"], "确认添加", 1,
            ], {items: [" "]});
            diag.on("neutral", () => {
                let diag_add_from_list = dialogs.builds([
                    "列表选择好友", "",
                    ["刷新列表", "hint_btn_bright_color"], 0, "确认选择", 1,
                ], {
                    items: ["列表为空"],
                    itemsSelectMode: "multi",
                });
                diag_add_from_list.on("neutral", () => {
                    diag_add_from_list.dismiss();
                    diag.dismiss();
                    engines.execScriptFile("./Ant_Forest_Launcher.js", {
                        arguments: {
                            special_exec_command: "collect_friends_list",
                        },
                    });
                    threads.starts(function () {
                        if (waitForAction(text("打开"), 3500)) clickAction(text("打开"), "widget");
                    });
                    ui.emitter.on("resume", () => {
                        diag.show();
                        threads.starts(function () {
                            let aim_btn_text = diag.getActionButton("neutral");
                            waitForAndClickAction(text(aim_btn_text), 3500);
                        });
                    });
                    setTimeout(() => toast("即将打开\"支付宝\"刷新好友列表"), 500);
                });
                diag_add_from_list.on("positive", () => {
                    refreshDiag();
                    diag_add_from_list.dismiss();
                });
                diag_add_from_list.on("multi_choice", (items, indices_damaged_, dialog) => {
                    if (items.length === 1 && items[0] === "列表为空") return;
                    if (items) items.forEach(name => tmp_selected_friends.push(name.split(". ")[1]));
                });
                diag_add_from_list.show();

                refreshAddFromListDiag();

                // tool function(s) //

                function refreshAddFromListDiag() {
                    let items = [];
                    let friends_list = storage_af.get("friends_list_data", {});
                    if (friends_list.list_data) {
                        friends_list.list_data.forEach(o => {
                            let nickname = o.nickname;
                            if (!~blacklist_selected_friends.indexOf(nickname) && !~tmp_selected_friends.indexOf(nickname)) {
                                items.push(o.rank_num + ". " + nickname);
                            }
                        });
                    }
                    let items_len = items.length;
                    items = items_len ? items : ["列表为空"];
                    diag_add_from_list.setItems(items);
                    session_params.last_friend_list_refresh_timestamp = friends_list.timestamp === Infinity ? -1 : friends_list.timestamp;
                    let content_info = (friends_list.timestamp !== Infinity ? ("上次刷新: " + getTimestamp(friends_list, "timestamp").time_str + "\n") : "") + "当前可添加的好友总数: " + items_len;
                    diag_add_from_list.setContent(content_info);
                }
            });
            diag.on("negative", () => {
                let input_ok_flag = true;
                let diag_add_manually = dialogs.builds([
                    "手动添加好友昵称", "add_friend_nickname_manually",
                    0, "返回", "添加到选择区", 1,
                ], {inputHint: "输入好友备注昵称 (非账户名)"});
                diag_add_manually.on("negative", () => diag_add_manually.dismiss());
                diag_add_manually.on("positive", () => {
                    if (!input_ok_flag) return;
                    refreshDiag();
                    diag_add_manually.dismiss();
                });
                diag_add_manually.on("input", input => {
                    if (!input) return;
                    if (~blacklist_selected_friends.indexOf(input)) {
                        input_ok_flag = false;
                        return alert(input + "\n在黑名单列表中已存在\n不可重复添加");
                    }
                    if (~tmp_selected_friends.indexOf(input)) {
                        input_ok_flag = false;
                        return ~alert(input + "\n在选择区中已存在\n不可重复添加");
                    }
                    tmp_selected_friends.push(input);
                });
                diag_add_manually.show();
            });
            diag.on("positive", () => {
                tmp_selected_friends.forEach(name => updateDataSource(data_source_key_name, "update_unshift", {
                    name: name,
                    timestamp: Infinity,
                }));
                if (tmp_selected_friends.length) setTimeout(() => parent_view._list_data.smoothScrollBy(0, -Math.pow(10, 5)), 200);
                let restore_btn = list_page_view.getParent()._text_restore.getParent();
                equalObjects(session_config[data_source_key_name], storage_config[data_source_key_name]) ? restore_btn.switch_off() : restore_btn.switch_on();
                saveSession(data_source_key_name, session_config[data_source_key_name]);
                diag.dismiss();
            });
            diag.on("item_select", (idx, item, dialog) => {
                let diag_items = diag.getItems().toArray();
                if (diag_items.length === 1 && diag_items[0] === "\xa0") return;
                let delete_confirm_diag = dialogs.builds(["确认移除此项吗", "", 0, "返回", "确认", 1]);
                delete_confirm_diag.on("negative", () => delete_confirm_diag.dismiss());
                delete_confirm_diag.on("positive", () => {
                    tmp_selected_friends.splice(idx, 1);
                    refreshDiag();
                    delete_confirm_diag.dismiss();
                });
                delete_confirm_diag.show();
            });
            diag.show();

            refreshDiag();

            // tool function(s) //

            function refreshDiag() {
                let tmp_items_len = tmp_selected_friends.length;
                let tmp_items = tmp_items_len ? tmp_selected_friends : ["\xa0"];
                diag.setItems(tmp_items);
                let content_info = tmp_items_len ? ("当前选择区好友总数: " + tmp_items_len) : "从好友列表中选择并添加好友\n或手动输入好友昵称";
                diag.setContent(content_info);
            }
        }])
}

function setTimersUninterruptedCheckAreasPageButtons(parent_view, data_source_key_name) {
    return setButtons(parent_view, data_source_key_name,
        ["restore", "RESTORE", "OFF", (btn_view) => {
            let list_data_backup = storage_config[data_source_key_name];
            if (equalObjects(session_config[data_source_key_name], list_data_backup)) return;
            let diag = dialogs.builds([
                "恢复列表数据", "restore_original_list_data",
                ["查看恢复列表", "hint_btn_bright_color"], "返回", "确定", 1,
            ]);
            diag.on("neutral", () => {
                let diag_restore_list = dialogs.builds(["查看恢复列表", "", 0, 0, "返回", 1], {
                    content: "共计 " + list_data_backup.length + " 项",
                    items: (function () {
                        let split_line = "";
                        for (let i = 0; i < 18; i += 1) split_line += "- ";
                        let items = [split_line];
                        list_data_backup.forEach(o => {
                            let section = o.section;
                            items.push("区间: " + (section.join(" - ") + (section[1] <= section[0] ? " (+1)" : "")));
                            items.push("间隔: " + o.interval + "分钟");
                            items.push(split_line);
                        });
                        return items.length > 1 ? items : ["列表为空"];
                    })(),
                });
                diag_restore_list.on("positive", () => diag_restore_list.dismiss());
                diag_restore_list.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                let list_page_view = findViewByTag(parent_view, "list_page_view");
                diag.dismiss();
                updateDataSource(data_source_key_name, "splice", [0, session_params[data_source_key_name].length]);

                let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                session_params[deleted_items_idx] = {};
                session_params[deleted_items_idx_count] = 0;
                let remove_btn = parent_view._text_remove.getParent();
                remove_btn.switch_off();
                btn_view.switch_off();
                list_data_backup.forEach(value => updateDataSource(data_source_key_name, "update", value));
                list_page_view._check_all.setChecked(true);
                list_page_view._check_all.setChecked(false);
            });
            diag.show();
        }],
        ["delete_forever", "REMOVE", "OFF", (btn_view) => {
            let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
            let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";

            if (!session_params[deleted_items_idx_count]) return;

            let thread_items_stable = threads.starts(function () {
                let old_count = undefined;
                while (session_params[deleted_items_idx_count] !== old_count) {
                    old_count = session_params[deleted_items_idx_count];
                    sleep(50);
                }
            });
            thread_items_stable.join(800);

            let deleted_items_idx_keys = Object.keys(session_params[deleted_items_idx]);
            deleted_items_idx_keys.sort((a, b) => +a < +b).forEach(idx => session_params[deleted_items_idx][idx] && session_params[data_source_key_name].splice(idx, 1));
            updateDataSource(data_source_key_name, "rewrite");
            session_params[deleted_items_idx] = {};
            session_params[deleted_items_idx_count] = 0;

            let list_page_view = findViewByTag(parent_view, "list_page_view");
            let restore_btn = parent_view._text_restore.getParent();
            if (!equalObjects(session_config[data_source_key_name], storage_config[data_source_key_name])) restore_btn.switch_on();
            else restore_btn.switch_off();
            list_page_view._check_all.setChecked(true);
            list_page_view._check_all.setChecked(false);
            btn_view.switch_off();
        }],
        ["add_circle", "NEW", "ON", (btn_view) => {
            let diag_new_item = dialogs.builds([
                "添加延时接力数据", "设置新的时间区间及间隔\n点击可编辑对应项数据",
                0, "放弃添加", "确认添加", 1,
            ], {items: ["\xa0"]});

            refreshItems();

            diag_new_item.on("positive", () => {
                let sectionStringTransform = () => {
                    let arr = list_heads[data_source_key_name];
                    for (let i = 0, len = arr.length; i < len; i += 1) {
                        let o = arr[i];
                        if ("section" in o) return o.stringTransform;
                    }
                };
                log(sectionStringTransform()["backward"](diag_new_item.getItems().toArray()[0].split(": ")[1]))
                updateDataSource(data_source_key_name, "update", {
                    section: sectionStringTransform()["backward"](diag_new_item.getItems().toArray()[0].split(": ")[1]),
                    interval: +diag_new_item.getItems().toArray()[1].split(": ")[1],
                });
                setTimeout(() => parent_view._list_data.smoothScrollBy(0, Math.pow(10, 5)), 200);
                let restore_btn = session_params[data_source_key_name + "_btn_restore"];
                equalObjects(session_config[data_source_key_name], storage_config[data_source_key_name]) ? restore_btn.switch_off() : restore_btn.switch_on();
                saveSession(data_source_key_name, session_config[data_source_key_name]);
                diag_new_item.dismiss();
            });
            diag_new_item.on("negative", () => diag_new_item.dismiss());
            diag_new_item.on("item_select", (idx, list_item, dialog) => {
                let list_item_prefix = list_item.split(": ")[0];
                let list_item_content = list_item.split(": ")[1];

                if (list_item_prefix === "区间") {
                    diag_new_item.dismiss();
                    ui.main.getParent().addView(setTimePickerView());
                }

                if (list_item_prefix === "间隔") {
                    let diag = dialogs.builds(["修改" + list_item_prefix, "", 0, "返回", "确认修改", 1], {
                        inputHint: "{x|1<=x<=600,x∈N}",
                        inputPrefill: list_item_content.toString(),
                    });
                    diag.on("negative", () => diag.dismiss());
                    diag.on("positive", dialog => {
                        let input = diag.getInputEditText().getText().toString();
                        if (input === "") return dialog.dismiss();
                        let value = +input;
                        if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                        if (value > 600 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                        refreshItems(list_item_prefix, ~~value);
                        diag.dismiss();
                    });
                    diag.show();
                }

                // tool function(s) //

                function setTimePickerView() {
                    let time_picker_view = ui.inflate(
                        <frame bg="#ffffff">
                            <scroll>
                                <vertical padding="16">
                                    <frame h="1" bg="#acacac" w="*"/>
                                    <frame w="auto" layout_gravity="center" marginTop="15">
                                        <text text="设置开始时间" textColor="#01579b" textSize="16sp"/>
                                    </frame>
                                    <timepicker h="160" id="timepicker_start" timePickerMode="spinner" marginTop="-10"/>
                                    <frame h="1" bg="#acacac" w="*"/>
                                    <frame w="auto" layout_gravity="center" marginTop="15">
                                        <text text="设置结束时间" textColor="#01579b" textSize="16sp"/>
                                    </frame>
                                    <timepicker h="160" id="timepicker_end" timePickerMode="spinner" marginTop="-10"/>
                                    <frame h="1" bg="#acacac" w="*"/>
                                    <frame w="auto" layout_gravity="center" margin="0 30 0 25">
                                        <text id="time_str" text="" textColor="#bf360c" textSize="15sp" gravity="center"/>
                                    </frame>
                                    <horizontal w="auto" layout_gravity="center">
                                        <button id="back_btn" text="返回" margin="20 0" backgroundTint="#eeeeee"/>
                                        <button id="confirm_btn" text="确认选择" margin="20 0" backgroundTint="#dcedc8"/>
                                    </horizontal>
                                </vertical>
                            </scroll>
                        </frame>
                    );

                    setTimeStr();
                    time_picker_view.setTag("time_picker");

                    time_picker_view.timepicker_start.setOnTimeChangedListener(setTimeStr);
                    time_picker_view.timepicker_end.setOnTimeChangedListener(setTimeStr);
                    time_picker_view.back_btn.on("click", () => closeTimePickerPage());
                    time_picker_view.confirm_btn.on("click", () => closeTimePickerPage(time_picker_view.time_str.getText()));

                    return time_picker_view;

                    // tool function(s) //

                    function setTimeStr() {
                        let timepicker_start = time_picker_view.timepicker_start;
                        let timepicker_end = time_picker_view.timepicker_end;
                        let fillZero = num => ("0" + num).slice(-2);
                        let time_str_start = fillZero(timepicker_start.getCurrentHour()) +
                            ":" + fillZero(timepicker_start.getCurrentMinute());
                        let time_str_end = fillZero(timepicker_end.getCurrentHour()) +
                            ":" + fillZero(timepicker_end.getCurrentMinute());
                        let time_str = time_str_start + " - " + time_str_end;
                        if (time_str_end <= time_str_start) time_str += " (+1)";
                        time_picker_view.time_str.setText(time_str);
                    }

                    function closeTimePickerPage(return_value) {
                        diag_new_item.show();
                        let parent = ui.main.getParent();
                        let child_count = parent.getChildCount();
                        for (let i = 0; i < child_count; i += 1) {
                            let child_view = parent.getChildAt(i);
                            if (child_view.findViewWithTag("time_picker")) parent.removeView(child_view);
                        }
                        if (typeof return_value !== "undefined") {
                            refreshItems(list_item_prefix, return_value);
                        }
                    }
                }
            });
            diag_new_item.show();

            // tool function(s) //

            function refreshItems(prefix, value) {
                let value_obj = {};
                let key_map = {
                    0: "区间",
                    1: "间隔",
                };
                if (!prefix && !value) {
                    value_obj = {};
                    value_obj[key_map[0]] = "06:30 - 00:00 (+1)";
                    value_obj[key_map[1]] = 60;
                } else {
                    diag_new_item.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                }
                if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                let items = [];
                Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                diag_new_item.setItems(items);
            }
        }]
    );
}

// constructor //

function Layout(title, params) {
    params = params || {};
    if (typeof params === "string") params = {__string_param__: params};
    this.title = title;
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
    if (params.config_conj) {
        if (!session_params.title) session_params.title = {};
        session_params.title[params.config_conj] = session_params.title[params.config_conj] || title;
    }
}

// tool function(s) //

function initStorageConfig() {
    let storage_config = Object.assign({info_icons_sanctuary: []}, DEFAULT_AF, storage_cfg.get("config", {}));
    storage_cfg.put("config", storage_config); // to refill storage data
    storage_config = Object.assign({}, storage_config, storage_unlock.get("config", {}), isolateBlacklistStorage(), filterProjectBackups());
    return storage_config;
}

function filterProjectBackups() {
    let sto_backups = storage_af.get("project_backup_info", []);
    return {project_backup_info: sto_backups.filter((o) => o.file_path && files.exists(o.file_path))};
}

function isolateBlacklistStorage() {
    let blacklist = storage_af.get("blacklist", {});
    let blacklist_protect_cover = [];
    let blacklist_by_user = [];
    for (let name in blacklist) {
        if (blacklist.hasOwnProperty(name)) {
            if (blacklist[name].reason === "protect_cover") blacklist_protect_cover.push({name: name, timestamp: blacklist[name].timestamp});
            if (blacklist[name].reason === "by_user") blacklist_by_user.push({name: name, timestamp: blacklist[name].timestamp});
        }
    }
    session_params.blacklist_protect_cover = blacklist_protect_cover;
    session_params.blacklist_by_user = blacklist_by_user;
    return {
        blacklist_protect_cover: blacklist_protect_cover,
        blacklist_by_user: blacklist_by_user,
    };
}

function initUI(status_bar_color) {
    ui.layout(
        <vertical id="main">
            <horizontal/>
        </vertical>
    );
    ui.statusBarColor(status_bar_color || "#03a6ef");
}

function setHomePage(home_title) {
    let homepage = setPage(home_title, def, parent_view => setButtons(parent_view, "homepage",
        ["save", "SAVE", "OFF", (btn_view) => {
            if (!needSave()) return;
            saveNow();
            btn_view.switch_off();
            toast("已保存");
        }]
    ));

    ui.main.getParent().addView(homepage);
    homepage._back_btn_area.setVisibility(8);
    rolling_pages[0] = homepage;
    return homepage;
}

function setPage(title_param, title_bg_color, additions, options) {
    let {no_margin_bottom, no_scroll_view, check_page_state} = options || {};
    let title = title_param;
    let view_page_name = "";
    if (Object.prototype.toString.call(title_param).slice(8, -1) === "Array") [title, view_page_name] = title_param;
    session_params.page_title = title;
    title_bg_color = title_bg_color || defs["title_bg_color"];
    let new_view = ui.inflate(<vertical/>);
    new_view.addView(ui.inflate(
        <linear id="_title_bg" clickable="true">
            <vertical id="_back_btn_area" marginRight="-22" layout_gravity="center">
                <linear>
                    <img src="@drawable/ic_chevron_left_black_48dp" height="31" bg="?selectableItemBackgroundBorderless" tint="#ffffff" layout_gravity="center"/>
                </linear>
            </vertical>
            <text id="_title_text" textColor="#ffffff" textSize="19" margin="16"/>
        </linear>
    ));
    new_view._back_btn_area.on("click", () => checkPageState() && pageJump("back"));
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
        new_view._page_content_view.addView(sub_view);
        if (sub_view.updateOpr) dynamic_views.push(sub_view);
        return new_view;
    };

    if (view_page_name) {
        view_pages[view_page_name] = new_view;
        new_view.setTag(view_page_name);
    }

    new_view.ready = () => {
        session_params["ready_signal_" + view_page_name] = true;
        listener.emit("sub_page_views_add");
        updateAllValues("only_new");
    };

    new_view.checkPageState = () => {
        if (typeof check_page_state === "boolean") return check_page_state;
        if (typeof check_page_state === "function") return check_page_state(new_view);
        return true;
    };

    return new_view;

    // tool function(s) //

    function setItem(type, item_params) {
        let new_view = type.match(/^split_line/) && setSplitLine(item_params) ||
            type === "sub_head" && setSubHead(item_params) ||
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
                    new_view[id].on(listener, listeners[listener].bind(item_params));
                });
            });
        } else if (type.match(/^options/)) {
            let is_lazy = type.match(/lazy/);
            let opt_view = ui.inflate(
                <vertical id="_chevron_btn">
                    <img padding="10 0 0 0" src="@drawable/ic_chevron_right_black_48dp" height="31" bg="?selectableItemBackgroundBorderless" tint="#999999"/>
                </vertical>
            );
            new_view._item_area.addView(opt_view);
            item_params.view = new_view;
            new_view.setClickListener = (listener) => {
                if (!listener) listener = () => null;
                new_view._item_area.removeAllListeners("click");
                new_view._item_area.on("click", listener);
            };
            new_view.restoreClickListener = () => new_view.setClickListener(() => {
                let next_page = item_params.next_page;
                if (next_page && view_pages[next_page]) pageJump("next", next_page);
            });
            is_lazy ? (new_view.setClickListener(), new_view._chevron_btn.setVisibility(8)) : new_view.restoreClickListener();
            threads.starts(function () {
                if (waitForAction(() => session_params["ready_signal_" + item_params.next_page], 8000)) {
                    ui.post(() => {
                        new_view.restoreClickListener();
                        new_view._chevron_btn.setVisibility(0);
                    });
                }
            });
        } else if (type === "button") {
            let help_view = ui.inflate(
                <vertical id="_info_icon" visibility="gone">
                    <img src="@drawable/ic_info_outline_black_48dp" height="22" bg="?selectableItemBackgroundBorderless" tint="#888888"/>
                </vertical>
            );
            new_view._item_area.addView(help_view);
            item_params.view = new_view;
            new_view._item_area.on("click", () => item_params.showWindow());
            if (item_params.infoWindow) {
                new_view._info_icon.setVisibility(0);
                new_view._info_icon.on("click", () => item_params.infoWindow());
            }
        }

        new_view.setNextPage = (page) => item_params.next_page = page;
        new_view.getNextPage = () => item_params.next_page;
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
            let title = item["title"],
                sub_head_color = item["sub_head_color"] || defs["sub_head_color"];

            let new_view = ui.inflate(
                <vertical>
                    <text id="_text" textSize="14" margin="16 8"/>
                </vertical>
            );
            new_view._text.text(title);
            let title_color = typeof sub_head_color === "string" ? colors.parseColor(sub_head_color) : sub_head_color;
            new_view._text.setTextColor(title_color);

            return new_view;
        }

        function setInfo(item) {
            let title = item.title;
            let info_color = item.info_color || defs.info_color;
            session_params.info_color = info_color;

            let new_view = ui.inflate(
                <horizontal>
                    <linear padding="0 10 0 0">
                        <img src="@drawable/ic_info_outline_black_48dp" height="17" margin="0 1 -12 0" tint="{{session_params.info_color}}"></img>
                        <text id="_info_text" textSize="13"/>
                    </linear>
                </horizontal>
            );
            new_view._info_text.text(title);
            let title_color = typeof info_color === "string" ? colors.parseColor(info_color) : sub_head_color;
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

            updateDataSource(data_source_key_name, "init");
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
                    session_params[data_source_key_name].splice(0, session_params[data_source_key_name].length);
                    session_data.forEach(value => session_params[data_source_key_name].push(value));
                    session_params["list_sort_flag_" + data_key_name] *= -1;
                    updateDataSource(data_source_key_name, "rewrite");
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
                    new_view[id].on(listener, listeners[listener].bind(item_params));
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
                    <img layout_gravity="center" id="{{session_params.btn_icon_id}}" src="@drawable/{{session_params.button_icon_file_name}}" height="31" bg="?selectableItemBackgroundBorderless" margin="0 7 0 0"/>
                    <text w="50" id="{{session_params.btn_text_id}}" text="{{session_params.button_text}}" gravity="center" textSize="10" textStyle="bold" marginTop="-26" h="40" gravity="bottom|center"/>
                </vertical>
            );
        }
    }
}

function pageJump(direction, next_page) {
    if (this._monster_$_page_scrolling_flag) return;
    if (direction.match(/back|previous|last/)) {
        smoothScrollView("full_right", null, rolling_pages);
        return rolling_pages.pop();
    }
    rolling_pages.push(view_pages[next_page]);
    smoothScrollView("full_left", null, rolling_pages);
}

function saveNow() {
    let session_config_mixed = deepCloneObject(session_config);
    writeUnlockStorage();
    writeBlacklist();
    writeProjectBackupInfo();
    storage_cfg.put("config", session_config_mixed); // only "cfg" reserved now (without unlock, blacklist, etc)
    storage_config = deepCloneObject(session_config);
    // session_params = {};
    return true;

    // tool function(s) //

    function writeUnlockStorage() {
        let ori_config = deepCloneObject(DEFAULT_UNLOCK),
            tmp_config = {};
        for (let i in ori_config) {
            if (ori_config.hasOwnProperty(i)) {
                tmp_config[i] = session_config[i];
                delete session_config_mixed[i];
            }
        }
        storage_unlock.put("config", tmp_config);
    }

    function writeBlacklist() {
        let blacklist = {};
        let blacklist_by_user = session_config_mixed.blacklist_by_user;
        blacklist_by_user.forEach(o => {
            blacklist[o.name] = {
                reason: "by_user",
                timestamp: o.timestamp,
            }
        });
        let blacklist_protect_cover = session_config_mixed.blacklist_protect_cover;
        blacklist_protect_cover.forEach(o => {
            let name = o.name;
            blacklist[name] = blacklist[name] || {
                reason: "protect_cover",
                timestamp: o.timestamp,
            }
        });
        storage_af.put("blacklist", blacklist);
        delete session_config_mixed.blacklist_protect_cover;
        delete session_config_mixed.blacklist_by_user;
    }

    function writeProjectBackupInfo() {
        storage_af.put("project_backup_info", session_config_mixed.project_backup_info);
        delete session_config_mixed.project_backup_info;
    }
}

function checkPageState() {
    return rolling_pages[rolling_pages.length - 1].checkPageState();
}

function getTimestamp(time_param, format_str) {
    let timestamp = +time_param;
    let time_str = "";
    let time_str_remove = "";
    let time = new Date();
    if (!timestamp) time_str = time_str_remove = "时间戳无效";
    if (timestamp === Infinity) time_str_remove = "永不";
    else if (timestamp <= time.getTime()) time_str_remove = "下次运行";
    if (!time_str) {
        time.setTime(timestamp);
        let padZero = num => ("0" + num).slice(-2);
        let yy = time.getFullYear();
        let MM = padZero(time.getMonth() + 1);
        let dd = padZero(time.getDate());
        let hh = padZero(time.getHours());
        let mm = padZero(time.getMinutes());
        time_str = yy + "\/" + MM + "\/" + dd + " " + hh + ":" + mm;
    }

    return {
        time_str: time_str,
        time_str_remove: time_str_remove || time_str,
        timestamp: timestamp,
    }[format_str];
}

function restoreFromTimestamp(timestamp) {
    if (timestamp.match(/^\d{13}$/)) return +timestamp;
    if (timestamp === "永不") return Infinity;
    let time_nums = timestamp.split(/\D+/);
    return new Date(+time_nums[0], time_nums[1] - 1, +time_nums[2], +time_nums[3], +time_nums[4]).getTime();
}

function findViewByTag(parent_view, tag_name, level) {
    level = level || 0;
    if (!tag_name) return;
    let len = parent_view.getChildCount();
    for (let i = 0; i < len; i += 1) {
        let aim_view = parent_view.getChildAt(i);
        if (aim_view.findViewWithTag(tag_name)) {
            if (level-- > 0) return findViewByTag(aim_view, tag_name, level);
            return aim_view;
        }
    }
    return parent_view;
}

/**
 * Update project from github and backup current local version to an archive file
 * @Thank NickHopps
 * @Thank 白酒煮饭
 */
function handleNewVersion(parent_dialog, file_content, newest_version_name, only_show_history_flag) {
    let url_server = "https://github.com/SuperMonster003/Auto.js_Projects/archive/Ant_Forest.zip";
    let fetched_file_path = getFetchedFile(defs.local_backup_path, url_server);
    handleFileContent(file_content);

    let diag_download = null;
    let steps = [
        "　 1. 下载项目数据包",
        "　 2. 解压缩",
        "　 3. 备份本地项目",
        "　 4. 文件替换",
        "　 5. 清理并完成部署",
    ];
    let setProgress = function (num, dialog) {
        dialog = dialog || diag_download;
        dialog.setProgress(num > 100 ? 100 : (num < 0 ? 0 : num));
    };
    let setStep = function (step_num) {
        step_num = step_num || 1;
        typeof step_num === "number" && step_num--;
        let content = "";
        if (step_num === "finished") {
            steps.forEach((str, idx) => content += (idx ? "\n" : "") + "\u2714" + str.slice(1));
            content += "\n\n更新完成";
            diag_download.setActionButton("positive", "返回");
        } else {
            steps.forEach((str, idx) => content += (idx ? "\n" : "") + (step_num === idx ? "\u25b6" + str.slice(1) : str));
            setProgress(0);
        }
        diag_download.setContent(content);
    };

    let ant_forest_files_blacklist = [
        /\/Documents\//,
        /\.gitignore/,
        /\/README\.md/,
    ];

    if (only_show_history_flag) return showUpdateHistories();

    let diag_update_positive_btn_text = storage_af.get("update_dialog_prompt_prompted") ? "立即更新" : "开始更新";
    let diag_update_details = dialogs.builds([
        newest_version_name, "正在获取版本更新信息...",
        0, "返回", [diag_update_positive_btn_text, "attraction_btn_color"], 1,
    ]);
    diag_update_details.on("neutral", showUpdateHistories);
    diag_update_details.on("negative", () => {
        diag_update_details.dismiss();
        parent_dialog.show();
    });
    diag_update_details.on("positive", () => {
        diag_update_details.dismiss();
        showUpdateDialogPrompt(diag_update_details);
    });
    diag_update_details.show();

    // steps function(s) //

    function downloadArchive() {
        parent_dialog && parent_dialog.dismiss();

        diag_download = dialogs.builds(["正在部署项目最新版本", "", 0, 0, "终止", 1], {
            progress: {
                max: 100,
                showMinMax: false,
            },
        });
        setStep(1);
        diag_download.on("positive", () => {
            session_params.__signal_interrupt_update__ = true;
            diag_download.dismiss();
        });
        diag_download.show();

        downloader(url_server, fetched_file_path, {
            onDownloadSuccess: unzipArchive,
            onDownloading: setProgress,
            onDownloadFailed: operation => operation(),
        }, diag_download);
    }

    function unzipArchive() {
        setStep(2);
        if (!unzip(defs.local_backup_path + ".Ant_Forest.zip", defs.local_backup_path, {
            blacklist_regexp: ant_forest_files_blacklist,
            dialog: diag_download,
        })) return;
        setStep(3);
        return backupProject();
    }

    function backupProject() {
        return backupProjectFiles(defs.local_backup_path, null, diag_download, "auto") && replaceWithNewFiles();
    }

    function replaceWithNewFiles() {
        setStep(4);
        if (!copyFolder(session_params.project_name_path, files.cwd() + "/", "inside")) return;
        setProgress(100);
        return cleanAndFinish();
    }

    function cleanAndFinish() {
        setStep(5);
        files.removeDir(session_params.project_name_path);
        delete session_params.project_name_path;
        files.remove(fetched_file_path);
        setProgress(100);
        setStep("finished");
        updateViewByLabel("about");
        return true;
    }

    // tool function(s) //

    function showUpdateDialogPrompt(parent_dialog) {
        let steps_str = steps.map(str => str.replace(/.+\d+\. ?/, "")).join(" -> ");
        let update_prompt_no_prompt_flag = storage_af.get("update_dialog_prompt_prompted", false);
        if (update_prompt_no_prompt_flag) return downloadArchive();

        let diag_update_prompt = dialogs.builds([
            "更新提示", "1. 更新过程中 本地项目将会被备份 可用于更新撤回/用户自行恢复数据/自定义代码的复原等操作\n" +
            "2. 整个更新过程将按照以下步骤执行: " + steps_str,
            [0, "hint_btn_bright_color"], "返回", ["立即更新", "attraction_btn_color"], 1, 1,
        ]);
        diag_update_prompt.on("check", checked => update_prompt_no_prompt_flag = !!checked);
        diag_update_prompt.on("negative", () => {
            diag_update_prompt.dismiss();
            parent_dialog.show();
        });
        diag_update_prompt.on("positive", () => {
            if (update_prompt_no_prompt_flag) storage_af.put("update_dialog_prompt_prompted", true);
            diag_update_prompt.dismiss();
            downloadArchive();
        });
        diag_update_prompt.show();
    }

    function handleFileContent(file_content) {
        if (!file_content) return;
        let updateDialogUpdateDetails = () => {
            if (only_show_history_flag) return;
            ui.post(() => {
                diag_update_details.getContentView().setText(session_params.update_info[newest_version_name]);
                diag_update_details.setActionButton("neutral", "查看历史更新");
            });
        };
        if (Object.keys(session_params.update_info || {}).length) return updateDialogUpdateDetails();

        threads.starts(function () {
            let info = {};
            let regexp_version_name = /# v\d+\.\d+\.\d+.*/g;
            let regexp_remove_info = /(^\n)|((# *){3,})|( +(?=\s+))|(.*~~.*)|(.*`灵感`.*)|(\(http.+?\))/g;
            let version_names = file_content.match(regexp_version_name);
            let version_infos = file_content.split(regexp_version_name);
            version_names.forEach((name, idx) => {
                info["v" + name.split("v")[1]] = version_infos[idx + 1].replace(regexp_remove_info, "").replace(/\n{2,}/g, "\n");
            });
            session_params.update_info = info;
            updateDialogUpdateDetails();
        });
    }

    function showUpdateHistories() {
        let diag_update_histories = dialogs.builds(["历史更新", "正在处理中...", 0, 0, "返回", 1]);
        diag_update_histories.on("positive", () => diag_update_histories.dismiss());
        diag_update_histories.show();

        threads.starts(function () {
            let str = "";
            let update_info_keys = null;
            if (waitForAction(() => (update_info_keys = Object.keys(session_params.update_info || {})).length, 5000)) {
                update_info_keys.forEach((ver_name) => str += ver_name + "\n" + session_params.update_info[ver_name] + "\n");
            } else str = "获取历史更新信息失败..";
            ui.post(() => diag_update_histories.getContentView().setText(str.slice(0, -2)));
        });
    }
}

function backupProjectFiles(local_backup_path, version_name, dialog, auto_flag) {
    local_backup_path = local_backup_path || defs.local_backup_path;
    version_name = version_name || getLocalProjectVerName();
    let bak = {
        Modules: "folder",
        Tools: "folder",
        "Ant_Forest_Launcher.js": "file",
        "Ant_Forest_Settings.js": "file",
    };
    let now = new Date();
    let time_str = getTimeStr(now);
    let bak_dir = local_backup_path + "." + time_str + "/";
    for (let name in bak) {
        if (bak.hasOwnProperty(name)) {
            copyFolder(files.path("./") + name + (bak[name] === "folder" ? "/" : ""), bak_dir);
        }
    }
    let zip_output_name = bak_dir.replace(/\/\.(.+?)\/$/, ($0, $1) => "/Ant_Forest_" + $1 + ".zip");
    if (!zipFolder(bak_dir, zip_output_name, dialog)) return;
    let data_source_key_name = "project_backup_info";
    updateDataSource(data_source_key_name, "update_unshift", {
        file_name: files.getName(zip_output_name).replace(/\.zip$/, ""),
        file_path: zip_output_name,
        version_name: version_name,
        timestamp: now.getTime(),
        remark: auto_flag ? "自动备份" : (session_params["project_backup_info_remark"] || "手动备份"),
    }, "quiet");
    updateViewByLabel("restore_projects_from_local");

    // write to storage right away
    storage_af.put(data_source_key_name, storage_config[data_source_key_name] = deepCloneObject(session_config[data_source_key_name]));

    delete session_params["project_backup_info_remark"];
    files.removeDir(bak_dir);
    if (!auto_flag) {
        dialog.setContent("备份完成");
        dialog.setActionButton("positive", "返回");
    }
    return true;

    // tool function(s) //

    function getTimeStr(time) {
        let now = time || new Date();
        let zeroPadding = num => ("0" + num).slice(-2);
        return now.getFullYear() + zeroPadding(now.getMonth() + 1) + zeroPadding(now.getDate()) + "_" +
            zeroPadding(now.getHours()) + zeroPadding(now.getMinutes()) + zeroPadding(now.getSeconds());
    }

    function zipFolder(src_dir, output_name, dialog) {
        output_name = output_name || src_dir.replace(/\/$/, ".zip");
        let zip_path = new java.io.FileOutputStream(new java.io.File(output_name));
        let path = new java.io.File(src_dir);
        let src_dir_parent = path.getParent();
        let output_stream = null;
        try {
            output_stream = new java.util.zip.ZipOutputStream(zip_path);
            let source_file = new java.io.File(src_dir);
            return compress(source_file, output_stream);
        } catch (e) {
            dialog && alertContent(dialog, "压缩失败:\n" + e, "append");
        } finally {
            output_stream && output_stream.close();
        }

        // tool function(s) //

        function compress(src, output_stream) {
            let file_list = getListFilePath(src);
            let total_file_size = file_list.map(value => value.size).reduce((acc, cur) => acc + cur);
            let compressed_size = 0;
            for (let i = 0, len = file_list.length; i < len; i += 1) {
                let info = file_list[i];
                let list_file_name = info.name;
                let list_file_size = info.size;
                let file_name = new java.io.File(list_file_name);
                output_stream.putNextEntry(
                    new java.util.zip.ZipEntry(file_name.getParent().split(src_dir_parent)[1] + "/" + file_name.getName())
                );
                let input_stream = new java.io.FileInputStream(list_file_name);
                let input_stream_len;
                while ((input_stream_len = input_stream.read()) !== -1) {
                    if (session_params.__signal_interrupt_update__) return session_params.__signal_interrupt_update__ = false;
                    output_stream.write(input_stream_len);
                }
                output_stream.closeEntry();
                input_stream.close();
                compressed_size += list_file_size;
                dialog.setProgress(compressed_size / total_file_size * 100);
            }
            dialog.setProgress(100);
            return true;

            // tool function(s) //

            function getListFilePath(path) {
                let file_info = [];
                handleFolder(path);
                return file_info;

                // tool function(s) //

                function handleFolder(path) {
                    path = path.toString();
                    let abs_path_prefix = path + (path.match(/\/$/) ? "" : "/");
                    files.listDir(path).forEach(list_file_name => {
                        let abs_path = abs_path_prefix + list_file_name;
                        files.isDir(abs_path) ? handleFolder(abs_path) : file_info.push({
                            name: abs_path,
                            size: java.io.File(abs_path).length(),
                        });
                    });
                }
            }
        }
    }
}

function restoreProjectFiles(source) {
    session_params.__signal_interrupt_update__ = false;
    let mode = "local";
    if (source.toString().match(/^http/)) mode = "server";

    let diag_restoring = dialogs.builds(["恢复中", "", 0, 0, "终止", 1], {
        progress: {
            max: 100,
            showMinMax: false,
        },
    });
    diag_restoring.on("positive", () => {
        session_params.__signal_interrupt_update__ = true;
        diag_restoring.dismiss();
    });
    diag_restoring.show();

    let steps = [
        "　 1. " + (mode === "server" ? "下载项目数据包" : "检查文件"),
        "　 2. 解压缩",
        "　 3. 文件替换",
        "　 4. 清理并完成项目恢复",
    ];
    let setProgress = num => diag_restoring.setProgress(num > 100 ? 100 : (num < 0 ? 0 : num));
    let setStep = function (step_num) {
        step_num = step_num || 1;
        typeof step_num === "number" && step_num--;
        let content = "";
        if (step_num === "finished") {
            steps.forEach((str, idx) => content += (idx ? "\n" : "") + "\u2714" + str.slice(1));
            content += "\n\n恢复完成";
            diag_restoring.setActionButton("positive", "返回");
        } else {
            steps.forEach((str, idx) => content += (idx ? "\n" : "") + (step_num === idx ? "\u25b6" + str.slice(1) : str));
            setProgress(0);
        }
        diag_restoring.setContent(content);
    };

    setStep(1);
    if (mode === "server") {
        let fetched_file_path = getFetchedFile(defs.local_backup_path, source, ".zip");
        downloader(source, fetched_file_path, {
            onDownloadSuccess: () => {
                source = fetched_file_path;
                remainingSteps();
            },
            onDownloading: setProgress,
            onDownloadFailed: () => operation => operation(),
        }, diag_restoring);
    } else {
        files.exists(source) ? threads.starts(function () {
            remainingSteps();
        }) : alertContent(diag_restoring, "恢复失败:\n文件不存在", "append");
    }

    // tool function(s) //

    function remainingSteps() {
        setStep(2);
        if (!unzip(source, null, {dialog: diag_restoring})) return;
        setStep(3);
        if (!copyFolder(session_params.project_name_path, files.cwd() + "/", "inside")) return;
        setProgress(100);
        setStep(4);
        files.removeDir(session_params.project_name_path);
        delete session_params.project_name_path;
        setProgress(100);
        setStep("finished");
        updateViewByLabel("about");
    }
}

/**
 * Unzip a certain archive
 * @param zip_path
 * @param out_zip_path
 * @param [params] {object}
 * @param [params.blacklist_regexp=[]] {array}
 * @param [params.dialog] {dialogs{}}
 */
function unzip(zip_path, out_zip_path, params) {
    params = params || {};
    out_zip_path = out_zip_path || zip_path.match(/.+\//)[0];
    let blacklist_regexp = params.blacklist_regexp || [];
    let dialog = params.dialog || null;
    try {
        let file = new java.io.File(zip_path);
        let file_size = file.length();
        let handled_size = 0;
        let zip_file = new java.util.zip.ZipFile(file); // zip_file.size() - files count in this zip archive
        let zip_input = new java.util.zip.ZipInputStream(new java.io.FileInputStream(file));
        let [input, output, out_file, entry] = [null, null, null, null];
        let setDialogProgress = num => dialog && dialog.setProgress(num || (handled_size / file_size * 100));
        let compressed_size_map = getCompressedSizeMap(zip_path);
        let getFileCompressedSize = file_name => compressed_size_map[file_name] || 0;

        while ((entry = zip_input.getNextEntry()) !== null) {
            let file_name = entry.getName();
            if (!session_params.project_name_path) {
                let _project_folder_name = file_name.match(/.+?\//) ? file_name.match(/.+?\//)[0] : file_name;
                session_params.project_name_path = (out_zip_path + "\/" + _project_folder_name).replace(/\/\//g, "\/");
            }
            let file_skip_flag = false;
            for (let i = 0, len = blacklist_regexp.length; i < len; i += 1) {
                if (file_name.match(blacklist_regexp[i])) {
                    file_skip_flag = true;
                    break;
                }
            }
            if (file_skip_flag) {
                handled_size += getFileCompressedSize(file_name);
                setDialogProgress();
                continue;
            }
            out_file = new java.io.File(out_zip_path + java.io.File.separator + entry.getName());
            if (entry.isDirectory()) {
                out_file.mkdirs();
                continue;
            }
            if (!out_file.getParentFile().exists()) out_file.getParentFile().mkdirs();
            if (!out_file.exists()) files.createWithDirs(out_file);
            input = zip_file.getInputStream(entry);
            output = new java.io.FileOutputStream(out_file);
            let temp = 0;
            while ((temp = input.read()) !== -1) {
                if (session_params.__signal_interrupt_update__) {
                    session_params.__signal_interrupt_update__ = false;
                    throw("用户终止");
                }
                output.write(temp);
            }
            handled_size += getFileCompressedSize(file_name);
            setDialogProgress();
            input.close();
            output.close();
        }
        return true;
    } catch (e) {
        alertContent(dialog, "解压失败:\n" + e, "append");
    }

    // tool function(s) //

    function getCompressedSizeMap(zip_path) {
        let compressed_size_map = {};
        let zip_enum = new java.util.zip.ZipFile(zip_path).entries();
        while (zip_enum.hasMoreElements()) {
            let zip_element = zip_enum.nextElement();
            if (!zip_element.isDirectory()) compressed_size_map[zip_element.getName()] = zip_element.getCompressedSize();
        }
        return compressed_size_map;
    }
}

function copyFolder(src, target, inside_flag) {
    files.create(target);
    if (files.isDir(src)) files.listDir(src).forEach(item => copyFolder(src + item + (files.isDir(item) ? "/" : ""), target + (inside_flag ? "" : (files.getName(src) + "/"))));
    else files.copy(src, target + files.getName(src));
    return true;
}

function updateDataSource(data_source_key_name, operation, data_params, quiet_flag) {
    if (operation === "init") {
        let ori_data_source = session_config[data_source_key_name] || session_params[data_source_key_name];
        for (let i = 0, len = list_heads[data_source_key_name].length; i < len; i += 1) {
            let sort_prop = list_heads[data_source_key_name][i].sort;
            if (sort_prop) {
                let need_sorted_list_head_name = Object.keys(list_heads[data_source_key_name][i])[0];
                ori_data_source.sort((a, b) => sort_prop > 0 ? (a[need_sorted_list_head_name] > b[need_sorted_list_head_name]) : (a[need_sorted_list_head_name] < b[need_sorted_list_head_name]));
                break;
            }
        }
        session_params[data_source_key_name] = ori_data_source.map(magicData);
        return;
    }

    if (operation === "rewrite") return rewriteToSessionConfig();

    if (operation.match(/delete|splice/)) {
        if (data_params.length > 2 && !data_params[2]["list_item_name_0"]) data_params[2] = magicData(data_params[2]);
        Array.prototype.splice.apply(session_params[data_source_key_name], data_params);
        return rewriteToSessionConfig();
    }

    if (operation.match(/update/)) {
        if (data_params && Object.prototype.toString.call(data_params).slice(8, -1) !== "Array") data_params = [data_params];
        let arr_unshift_flag = operation.match(/unshift|beginning/);

        if (!session_params[data_source_key_name]) session_params[data_source_key_name] = [];
        data_params.map(magicData).forEach(value => {
            // {name: 1, age: 2};
            let arr = session_params[data_source_key_name];
            arr_unshift_flag ? arr.unshift(value) : arr.push(value);
        });

        return rewriteToSessionConfig();
    }

    // tool function(s) //

    function magicData(obj) {
        let final_o = {};
        list_heads[data_source_key_name].forEach((o, i) => {
            let list_item_name = Object.keys(o).filter(key => typeof o[key] === "string")[0];
            let list_item_value = obj[list_item_name];
            final_o["list_item_name_" + i] = o.stringTransform ? o.stringTransform.forward(list_item_value) : list_item_value;
            final_o[list_item_name] = "list_item_name_" + i; // backup
            final_o["width_" + i] = o.width ? ~~(o.width * WIDTH) + "px" : -2;
        });
        Object.keys(obj).forEach(key => {
            if (!(key in final_o)) final_o[key] = obj[key];
        });
        return final_o;
    }

    function rewriteToSessionConfig() {
        session_config[data_source_key_name] = [];

        let session_data = session_params[data_source_key_name];
        if (!session_data.length) return saveSession(data_source_key_name, [], quiet_flag);

        let new_data = [];
        session_data.forEach((obj) => {
            let final_o = deepCloneObject(obj);
            Object.keys(final_o).forEach((key) => {
                if (final_o[key] in final_o) {
                    let useless_name = final_o[key];
                    final_o[key] = final_o[final_o[key]];
                    delete final_o[useless_name];
                }
                if (key.match(/^width_\d$/)) final_o[key] = undefined;
            });

            let list_head_objs = list_heads[data_source_key_name] || [];
            list_head_objs.forEach((o) => {
                if ("stringTransform" in o) {
                    let aim_key = Object.keys(o).filter((key => typeof o[key] === "string"))[0];
                    final_o[aim_key] = o.stringTransform.backward(final_o[aim_key]);
                }
            });

            new_data.push(Object.assign({}, final_o)); // to remove undefined items
        });
        saveSession(data_source_key_name, new_data, quiet_flag);
    }
}

function updateViewByLabel(view_label) {
    ui.post(() => {
        let aims = dynamic_views.filter(view => view.view_label === view_label);
        aims.forEach(view => view.updateOpr(view));
    });
}

function downloader(url, path, listener, dialog) {
    ui.post(() => {
        let [len, total_bytes, input_stream, output_stream, file_temp] = [];
        let input_stream_len = 0;
        // let buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 2048);
        let buffer = util.java.array('byte', 2048);
        let client = new OkHttpClient();
        let request = new Packages.okhttp3.Request.Builder().url(url).get().build();
        let callback = new Packages.okhttp3.Callback({
            onFailure: (call, err) => {
                dialog.setActionButton("positive", "返回");
                alertContent(dialog, "请求失败: \n" + err, "append");
            },
            onResponse: (call, res) => {
                try {
                    if (res.code() !== 200) throw res.code() + " " + res.message();
                    total_bytes = res.body().contentLength();
                    input_stream = res.body().byteStream();
                    file_temp = new java.io.File(path);
                    output_stream = new java.io.FileOutputStream(file_temp);
                    while ((len = input_stream.read(buffer)) !== -1) {
                        if (session_params.__signal_interrupt_update__) {
                            session_params.__signal_interrupt_update__ = false;
                            files.remove(path);
                            input_stream.close();
                            throw("用户终止");
                        }
                        output_stream.write(buffer, 0, len);
                        input_stream_len += len;
                        listener.onDownloading((input_stream_len / total_bytes) * 100);
                    }
                    output_stream.flush();
                    listener.onDownloadSuccess();
                } catch (err) {
                    listener.onDownloadFailed(() => alertContent(dialog, err.toString().replace(/^Error: ?/, ""), "append"));
                } finally {
                    try {
                        if (input_stream !== null) input_stream.close();
                    } catch (err) {
                        alertContent(dialog, "文件流处理失败:\n" + err, "append");
                    }
                }
            },
        });
        client.newCall(request).enqueue(callback);
    });
}

function getFetchedFile(backup_path, url, file_ext_name) {
    if (!url) return "";
    let fetched_file_name = "." + url.split("/").pop() + (file_ext_name || "");
    let fetched_file_path = backup_path + fetched_file_name;
    files.createWithDirs(fetched_file_path);
    return fetched_file_path;
}

function showOrHideBySwitch(view, state, hide_when_checked, nearest_end_view_tag_name) {
    hide_when_checked = !!hide_when_checked; // boolean
    state = !!state; // boolean

    let switch_state_key_name = view.config_conj + "_switch_states";
    if (!session_params[switch_state_key_name]) session_params[switch_state_key_name] = [];

    let myself = view.view;
    let parent = myself.getParent();
    let myself_index = parent.indexOfChild(myself);
    let child_count = parent.getChildCount();

    while (++myself_index < child_count) {
        let child_view = parent.getChildAt(myself_index);
        if (nearest_end_view_tag_name && child_view.findViewWithTag(nearest_end_view_tag_name)) break;
        state === hide_when_checked ? hide(child_view) : reveal(child_view);
    }

    // tool function(s) //

    function hide(view) {
        session_params[switch_state_key_name].push(view.visibility);
        view.setVisibility(8);
    }

    function reveal(view) {
        if (!session_params[switch_state_key_name].length) return;
        view.setVisibility(session_params[switch_state_key_name].shift());
    }
}

function weakOrStrongBySwitch(view, state, view_index_padding) {
    if (Object.prototype.toString.call(view_index_padding).slice(8, -1) !== "Array") {
        view_index_padding = [view_index_padding || 1];
    }
    let myself = view.view;
    let parent = myself.getParent();
    let current_child_index = parent.indexOfChild(myself);
    view_index_padding.forEach(padding => {
        let radio_group_view = parent.getChildAt(current_child_index + padding).getChildAt(0);
        for (let i = 0, len = radio_group_view.getChildCount(); i < len; i += 1) {
            let radio_view = radio_group_view.getChildAt(i);
            radio_view.setClickable(state);
            radio_view.setTextColor(colors.parseColor(state ? "#000000" : "#b0bec5"));
        }
    });
}

function checkDependency(view, dependencies) {
    let classof = o => Object.prototype.toString.call(o).slice(8, -1);
    let deps = dependencies;
    if (classof(dependencies) !== "Array") deps = [deps];
    checkAllDependencies(deps) ? setViewEnabled(view, deps) : setViewDisabled(view, deps);

    // tool function(s) //

    function checkAllDependencies(arr) {
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (session_config[arr[i]]) return true;
        }
    }

    function setViewDisabled(view, arr) {
        let arr_info = "";
        arr.forEach(conj_text => arr_info += session_params.title[conj_text] + " ");
        if (arr.length > 1) arr_info += "均";
        view._hint.text("已失效  [ " + arr_info + "未开启 ]");
        view._chevron_btn.setVisibility(8);
        view._title.setTextColor(colors.parseColor("#919191"));
        view._hint.setTextColor(colors.parseColor("#b0b0b0"));
        view.next_page_backup = view.getNextPage();
        view.setNextPage(null);
    }

    function setViewEnabled(view) {
        view._chevron_btn.setVisibility(0);
        view._title.setTextColor(colors.parseColor("#111111"));
        view._hint.setTextColor(colors.parseColor("#888888"));
        view.next_page_backup && view.setNextPage(view.next_page_backup);
    }
}