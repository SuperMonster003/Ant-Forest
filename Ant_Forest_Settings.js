"ui";
try {
    auto.waitFor();
} catch (e) {
    auto();
}

// given that there are bugs with dialogs modules in old auto.js versions like 4.1.0/5 and 4.1.1/2
let dialogs = require("./Modules/__dialogs__pro_v6.js")(runtime, {});
let DEFAULT_CONFIG = require("./Modules/MODULE_DEFAULT_CONFIG");
let STORAGE = require("./Modules/MODULE_STORAGE");
let PWMAP = require("./Modules/MODULE_PWMAP.js");

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

let {WIDTH, HEIGHT, cX, cY} = getDisplayParams();

let DEFAULT_AF = DEFAULT_CONFIG.af;
let DEFAULT_UNLOCK = DEFAULT_CONFIG.unlock;

let storage_cfg = STORAGE.create("af_cfg");
let storage_af = STORAGE.create("af");
let storage_unlock = STORAGE.create("unlock");
let encrypt = new PWMAP().pwmapEncrypt;

let [session_params, dynamic_views, pages, def] = [{}, [], []];
let storage_config = initStorageConfig();
let session_config = deepCloneObject(storage_config);

let listener = events.emitter();
listener.addListener("update_all_values", () => dynamic_views.forEach(view => view.updateOpr(view)));
listener.addListener("switch_save_btn", () => {
    let btn_save = session_params["btn_save"];
    needSave() ? btn_save.switch_on() : btn_save.switch_off();
});

let saveSession = (key, value, quiet_flag) => {
    if (key !== undefined) session_config[key] = value;
    if (quiet_flag) return;
    listener.emit("switch_save_btn");
    updateAllValues();
};
let needSave = () => !equalObjects(session_config, storage_config);
let updateAllValues = () => listener.emit("update_all_values");
let getLocalProjectVerName = () => "v" + files.read("./Ant_Forest_Launcher.js").match(/version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/)[0].slice(8);

let defs = {
    local_backup_path: files.cwd() + "/BAK/Ant_Forest/",
    item_area_width: ~~(WIDTH * 0.78) + "px",
    sub_head_color: "#03a6ef",
    info_color: "#78909c",
    title_bg_color: "#03a6ef",
    list_title_bg_color: "#afefff",
    btn_on_color: "#ffffff",
    btn_off_color: "#bbcccc",
    split_line_color: "#bbcccc",
    caution_btn_color: "#ff3d00",
    attraction_btn_color: "#7b1fa2",
    warn_btn_color: "#f57c00",
    content_dark_color: "#546e7a",
    hint_btn_dark_color: "#a1887f",
    hint_btn_bright_color: "#26a69a",
    empty_non_break_check_time_area_hint: "*点击添加按钮添加新时间区间*",
};

let list_heads = {
    project_backup_info: [{version_name: "项目版本", width: 0.5}, {timestamp: "项目备份时间"}],
    server_releases_info: [{tag_name: "项目标签", width: 0.5}, {created_at: "创建时间 (UTC格式)"}],
    blacklist_by_user: [{name: "支付宝好友昵称", width: 0.58}, {timestamp: "黑名单自动解除", mode: "remove"}],
    blacklist_protect_cover: [{name: "支付宝好友昵称", width: 0.58}, {timestamp: "黑名单自动解除", mode: "remove"}],
};

initUI();

let homepage = setHomePage("蚂蚁森林");
let self_collect_page = setPage("自收功能");
let friend_collect_page = setPage("收取功能");
let help_collect_page = setPage("帮收功能");
let non_break_check_page = setPage("监测自己能量");
let rank_list_samples_collect_page = setPage("排行榜样本采集");
let auto_unlock_page = setPage("自动解锁");
let blacklist_page = setPage("黑名单管理");
let local_project_backup_restore_page = setPage("项目备份还原");
let restore_projects_from_local = setPage("从本地还原项目", def, def, "no_margin_bottom");
let restore_projects_from_server = setPage("从服务器还原项目", def, def, "no_margin_bottom");
let cover_blacklist_page = setPage("能量罩黑名单", def, def, "no_margin_bottom");
let self_def_blacklist_page = setPage("自定义黑名单", def, setBlacklistPageButtons, "no_margin_bottom");
let message_showing_page = setPage("消息提示");

homepage
    .add("sub_head", new Layout("基本功能"))
    .add("options", new Layout("自收功能", {
        config_conj: "self_collect_switch",
        hint: {
            "0": "已关闭",
            "1": "已开启",
        },
        next_page: self_collect_page,
        updateOpr: function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("options", new Layout("收取功能", {
        config_conj: "friend_collect_switch",
        hint: {
            "0": "已关闭",
            "1": "已开启",
        },
        next_page: friend_collect_page,
        updateOpr: function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("options", new Layout("帮收功能", {
        config_conj: "help_collect_switch",
        hint: {
            "0": "已关闭",
            "1": "已开启",
        },
        next_page: help_collect_page,
        updateOpr: function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("sub_head", new Layout("高级功能"))
    .add("options", new Layout("自动解锁", {
        config_conj: "auto_unlock_switch",
        hint: {
            "0": "已关闭",
            "1": "已开启",
        },
        next_page: auto_unlock_page,
        updateOpr: function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("options", new Layout("消息提示", {
        config_conj: "message_showing_switch",
        hint: {
            "0": "已关闭",
            "1": "已开启",
        },
        next_page: message_showing_page,
        updateOpr: function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("options", new Layout("黑名单管理", {
        next_page: blacklist_page,
    }))
    .add("sub_head", new Layout("备份与还原"))
    .add("button", new Layout("还原初始设置", {
        newWindow: () => {
            let diag = dialogs.build({
                title: "还原初始设置",
                content: "此操作无法撤销\n如需保留此次会话内容请先保存\n\n以下功能内部配置不会被还原:\n1. 自动解锁\n2. 黑名单管理",
                neutral: "了解内部配置",
                negative: "放弃",
                positive: "全部还原",
                canceledOnTouchOutside: false,
                autoDismiss: false,
            });
            diag.on("neutral", () => {
                let diag_keep_internals = dialogs.build({
                    title: "保留内部配置",
                    content: "包含内部配置的功能\n只还原此功能的开闭状态\n而不会清空内部保存的数据\n-> 如解锁密码/黑名单列表等",
                    positive: "关闭",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
                diag_keep_internals.on("positive", () => diag_keep_internals.dismiss());
                diag_keep_internals.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                let diag_sub = dialogs.build({
                    title: "全部还原",
                    content: "确定要还原全部设置吗",
                    negative: "放弃",
                    positive: "确定",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
                diag_sub.on("positive", () => {
                    reset();
                    let diag_sub_sub = dialogs.build({
                        title: "还原完毕",
                        positive: "确定",
                    });
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
    .add("options", new Layout("项目备份还原", {
        next_page: local_project_backup_restore_page,
    }))
    .add("sub_head", new Layout("关于"))
    .add("button", new Layout("关于脚本及开发者", {
        hint: "正在读取中...",
        view_label: "about",
        newWindow: function () {
            let local_version = this.view._hint.getText();
            let newest_server_version_name = "";
            let server_md_file_content = "";
            let diag = dialogs.build({
                title: "关于",
                content: "当前本地版本: " + local_version + "\n" +
                    "服务器端版本: ",
                items: ["开发者: " + "SuperMonster003"],
                neutral: "检查更新",
                negative: null,
                negativeColor: defs.attraction_btn_color,
                positive: "返回",
                canceledOnTouchOutside: false,
                autoDismiss: false,
            });
            let checking_update_flag = false;
            diag.on("positive", () => diag.dismiss());
            diag.on("negative", () => {
                diag.dismiss();
                handleNewVersion(diag, server_md_file_content, newest_server_version_name);
            });
            diag.on("neutral", () => {
                if (checking_update_flag) return;
                session_params.update_info = {};
                diag.setActionButton("negative", null);
                checkUpdate();
                // alertTitle(diag, "检查更新中 请稍候...", 1500);
            });
            diag.on("item_select", (idx, item, dialog) => app.openUrl("https://github.com/SuperMonster003"));
            diag.show();
            checkUpdate();

            // tool function(s) //

            function checkUpdate() {
                checking_update_flag = true;
                let url_readme = "https://raw.githubusercontent.com/SuperMonster003/Auto.js_Projects/Ant_Forest/README.md";
                newest_server_version_name = "检查中...";
                let ori_content = diag.getContentView().getText().toString().replace(/([^]+服务器端版本: ).*/, "$1");
                diag.setContent(ori_content + newest_server_version_name);
                threads.start(function () {
                    try {
                        let regexp_version_name = /版本历史[^]+?v(\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/;
                        server_md_file_content = http.get(url_readme).body.string();
                        newest_server_version_name = "v" + server_md_file_content.match(regexp_version_name)[0].split("v")[1];
                    } catch (e) {
                        newest_server_version_name = "检查超时";
                    } finally {
                        diag.setContent(ori_content + newest_server_version_name);
                        if (newest_server_version_name.match(/v/) && newest_server_version_name !== local_version) {
                            diag.setActionButton("negative", "查看当前更新");
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
self_collect_page
    .add("switch", new Layout("总开关", {
        config_conj: "self_collect_switch",
        listeners: {
            "_switch": {
                "check": function (state) {
                    saveSession(this.config_conj, !!state);
                    let parent = this.view.getParent();
                    let child_count = parent.getChildCount();
                    while (child_count-- > 2) {
                        parent.getChildAt(child_count).setVisibility(state ? 0 : 4);
                    }
                },
            },
        },
        updateOpr: function (view) {
            let session_conf = !!session_config[this.config_conj];
            view["_switch"].setChecked(session_conf);
        },
    }))
    .add("sub_head", new Layout("高级设置"))
    .add("options", new Layout("监测自己能量", {
        config_conj: "non_break_check_switch",
        hint: {
            "0": "已关闭",
            "1": "已开启",
        },
        next_page: non_break_check_page,
        updateOpr: function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("info", new Layout("关闭自收功能将不再收取自己能量"))
;
friend_collect_page
    .add("switch", new Layout("总开关", {
        config_conj: "friend_collect_switch",
        listeners: {
            "_switch": {
                "check": function (state) {
                    saveSession(this.config_conj, !!state);
                    let parent = this.view.getParent();
                    let child_count = parent.getChildCount();
                    while (child_count-- > 2) {
                        parent.getChildAt(child_count).setVisibility(state ? 0 : 4);
                    }
                },
            },
        },
        updateOpr: function (view) {
            let session_conf = !!session_config[this.config_conj];
            view["_switch"].setChecked(session_conf);
        },
    }))
    .add("sub_head", new Layout("基本设置"))
    .add("options", new Layout("排行榜样本采集", {
        next_page: rank_list_samples_collect_page,
    }))
    .add("sub_head", new Layout("高级设置"))
    .add("button", new Layout("收取图标颜色色值", {
        config_conj: "friend_collect_icon_color",
        hint: "hint",
        newWindow: function () {
            let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/,
                _lim255 = regexp_num_0_to_255.source;
            let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
            let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
            let current_color = undefined;
            let diag = dialogs.build({
                title: "收取图标颜色色值",
                content: "排行榜识别绿色手形图标的参照色值\n\n示例:\nrgb(67,160,71)\n#43a047",
                inputHint: "rgb(RR,GG,BB) | #RRGGBB",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
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
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "收取图标颜色检测阈值",
                content: "排行榜识别绿色手形图标的参照色值检测阈值",
                inputHint: "{x|0<=x<=66,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 66 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj].toString());
        },
    }))
;
help_collect_page
    .add("switch", new Layout("总开关", {
        config_conj: "help_collect_switch",
        listeners: {
            "_switch": {
                "check": function (state) {
                    saveSession(this.config_conj, !!state);
                    let parent = this.view.getParent();
                    let child_count = parent.getChildCount();
                    while (child_count-- > 2) {
                        parent.getChildAt(child_count).setVisibility(state ? 0 : 4);
                    }
                },
            },
        },
        updateOpr: function (view) {
            let session_conf = !!session_config[this.config_conj];
            view["_switch"].setChecked(session_conf);
        },
    }))
    .add("sub_head", new Layout("基本设置"))
    .add("options", new Layout("排行榜样本采集", {
        next_page: rank_list_samples_collect_page,
    }))
    .add("sub_head", new Layout("高级设置"))
    .add("button", new Layout("帮收图标颜色色值", {
        config_conj: "help_collect_icon_color",
        hint: "hint",
        newWindow: function () {
            let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/,
                _lim255 = regexp_num_0_to_255.source;
            let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
            let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
            let current_color = undefined;
            let diag = dialogs.build({
                title: "帮收图标颜色色值",
                content: "排行榜识别橙色爱心图标的参照色值\n\n示例:\nrgb(67,160,71)\n#43a047",
                inputHint: "rgb(RR,GG,BB) | #RRGGBB",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
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
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "帮收图标颜色检测阈值",
                content: "排行榜识别橙色爱心图标的参照色值检测阈值",
                inputHint: "{x|0<=x<=66,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 66 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
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
        hint: "hint",
        newWindow: function () {
            let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/,
                _lim255 = regexp_num_0_to_255.source;
            let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
            let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
            let current_color = undefined;
            let diag = dialogs.build({
                title: "帮收能量球颜色色值",
                content: "好友森林识别橙色能量球的参照色值\n\n示例:\nrgb(67,160,71)\n#43a047",
                inputHint: "rgb(RR,GG,BB) | #RRGGBB",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
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
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "帮收能量球颜色检测阈值",
                content: "好友森林识别橙色能量球的参照色值检测阈值",
                inputHint: "{x|28<=x<=83,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 83 || value < 28) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
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
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "帮收能量球样本采集密度",
                content: "好友森林橙色能量球图片样本采集密度",
                inputHint: "{x|10<=x<=20,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 20 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text(session_config[this.config_conj].toString());
        },
    }))
;
non_break_check_page
    .add("switch", new Layout("总开关", {
        config_conj: "non_break_check_switch",
        listeners: {
            "_switch": {
                "check": function (state) {
                    saveSession(this.config_conj, !!state);
                    let parent = this.view.getParent();
                    let child_count = parent.getChildCount();
                    while (child_count-- > 2) {
                        parent.getChildAt(child_count).setVisibility(state ? 0 : 4);
                    }
                },
            },
        },
        updateOpr: function (view) {
            let session_conf = !!session_config[this.config_conj];
            view["_switch"].setChecked(session_conf);
        },
    }))
    .add("sub_head", new Layout("基本设置"))
    .add("button", new Layout("管理时间区间", {
        config_conj: "non_break_check_time_area",
        hint: "hint",
        newWindow: function () {
            let updateTimeAreaAmount = diag => {
                let items = [];
                diag.getItems().toArray().forEach((value, index) => items[index] = value);
                let items_len = items.length;
                let area_amount = items_len;
                if (items_len === 1 && items[0] === defs.empty_non_break_check_time_area_hint) area_amount = 0;
                updateContentData(/(当前区间总数: )\d*/, "$1" + area_amount);
            };
            let diag = dialogs.build({
                title: "能量监测时间区间",
                content: "指定时间区间内不断监测自己可收取的能量球\n\n当前区间总数: ",
                items: function () {
                    let session_value = session_config[this.config_conj];
                    if (session_value.length) return session_value.map(value => timeRangeArrayToStr(value));
                    return [defs.empty_non_break_check_time_area_hint];
                }.bind(this)(),
                neutral: "添加",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            updateTimeAreaAmount(diag);
            diag.on("item_select", (index, content) => {
                if (content === defs.empty_non_break_check_time_area_hint) return;
                let diag_one_item = dialogs.build({
                    title: "编辑时间区间",
                    content: "示例:\n07:20:00 - 07:22:28\n7:20:00-7:22:28\n7 20 0 7 22 28",
                    contentColor: defs.content_dark_color,
                    inputPrefill: content,
                    neutral: "删除",
                    neutralColor: defs.caution_btn_color,
                    negative: "返回",
                    positive: "确认修改",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
                diag_one_item.on("neutral", () => {
                    if (session_params.non_break_check_time_area_diag_confirm_delete) return deleteCurrentItem();
                    let diag_confirm_delete = dialogs.build({
                        title: "确认删除吗",
                        checkBoxPrompt: "本次会话不再提示",
                        negative: "返回",
                        positive: "确认",
                    });
                    diag_confirm_delete.on("check", chk => chk && (session_params.non_break_check_time_area_diag_confirm_delete = 1));
                    diag_confirm_delete.on("negative", () => diag_confirm_delete.dismiss());
                    diag_confirm_delete.on("positive", () => {
                        deleteCurrentItem();
                        diag_confirm_delete.dismiss();
                    });
                    diag_confirm_delete.show();

                    // tool function(s) //

                    function deleteCurrentItem() {
                        manageItems(diag, "delete", "", index);
                        updateTimeAreaAmount(diag);
                        diag_one_item.dismiss();
                    }
                });
                diag_one_item.on("negative", () => diag_one_item.dismiss());
                diag_one_item.on("positive", () => {
                    let successFunc = item_str => {
                        manageItems(diag, "modify", item_str, index);
                        return diag_one_item.dismiss();
                    };

                    return checkInputTimeArea(diag_one_item, successFunc);
                });
                diag_one_item.show();
            });
            diag.on("neutral", diag => {
                let diag_add_area = dialogs.build({
                    title: "添加时间区间",
                    content: "示例:\n07:20:00 - 07:22:28\n7:20:00-7:22:28\n7 20 0 7 22 28",
                    inputHint: "hh1:mm1:ss1 - hh2:mm2:ss2",
                    // neutral: "了解定时任务",
                    negative: "返回",
                    positive: "确定",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                    // checkBoxPrompt: "添加到Auto.js定时任务",
                });
                diag_add_area.on("check", checked => {
                    // // // //
                });
                diag_add_area.on("neutral", () => {
                    let diag_about_timed_task = dialogs.build({
                        title: "Auto.js定时任务",
                        content: "对于已设置的时间区间 需满足:\n1. 脚本在运行中\n2. 当前支付宝页面为蚂蚁森林主页\n3. 当前时间在时间区间内\n才能循环监测自己的能量球\n\n定时任务可实现第1步的自动运行 从而保证后续步骤的预期执行\n\n添加Auto.js定时任务可选方式\n- 添加时间区间时勾选\"添加到Auto.js定时任务\"\n- Auto.js脚本面板中设置某个脚本定时执行\n- 使用本设置工具的\"管理定时任务\"功能添加定时任务 (仅限蚂蚁森林相关任务)\n\n管理Auto.js定时任务可选方式\n- Auto.js管理面板查看并管理全部定时任务\n- 使用本设置工具的\"管理定时任务\"功能 (仅限蚂蚁森林相关任务)\n\n除了Auto.js自带的定时任务功能 还可以配合Tasker及Xposed Edge Pro等工具实现定时任务功能",
                        positive: "返回",
                        autoDismiss: false,
                        canceledOnTouchOutside: false,
                    });
                    diag_about_timed_task.on("positive", () => diag_about_timed_task.dismiss());
                    diag_about_timed_task.show();
                });
                diag_add_area.on("negative", () => diag_add_area.dismiss());
                diag_add_area.on("positive", () => {
                    let successFunc = item_str => {
                        manageItems(diag, "add", item_str);
                        updateTimeAreaAmount(diag);
                        return diag_add_area.dismiss();
                    };

                    return checkInputTimeArea(diag_add_area, successFunc);
                });
                diag_add_area.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                let items = [];
                diag.getItems().toArray().forEach((value, index) => items[index] = value);
                if (items.length === 1 && items[0] === defs.empty_non_break_check_time_area_hint) saveSession(this.config_conj, []);
                else saveSession(this.config_conj, items.map(value => timeRangeStrToArray(value)));
                diag.dismiss();
            });
            diag.show();

            // tool function(s) //

            function timeRangeStrToArray(str) {
                // "07:28:00 - 07:28:47" -> ["07:28:00", "07:28:47"]
                return str ? str.split(" - ") : [];
            }

            function timeRangeArrayToStr(arr) {
                // ["07:28:00", "07:28:47"] -> "07:28:00 - 07:28:47"
                return arr.join(" - ");
            }

            function checkInputTimeArea(dialog, successFunc) {
                let regs_hh = /([01]?\d|2[0-3])/.source,
                    regs_mm_ss = /([0-5]?\d)/.source;
                let regexp_time_area = new RegExp("^" + regs_hh + "\\D+(" + regs_mm_ss + "\\D+){2}" + regs_hh + "(\\D+" + regs_mm_ss + "){2}" + "$");
                let input = dialog.getInputEditText().getText().toString();
                if (input === "") return ~dialog.dismiss();
                if (!input.match(regexp_time_area)) return alertTitle(dialog, "时间区间格式不合法");
                let splits = input.split(/\D+/).map(value => ("0" + value).slice(-2));
                let time_str_a = splits[0] + ":" + splits[1] + ":" + splits[2],
                    time_str_b = splits[3] + ":" + splits[4] + ":" + splits[5];
                let time_diff = calcTimeDiff(time_str_a, time_str_b);
                if (time_diff <= 0) return alertTitle(dialog, "结束时间需晚于开始时间");
                if (time_diff > 600000) return alertTitle(dialog, "区间不可大于10分钟");
                if (time_diff < 30000) return alertTitle(dialog, "区间不可小于30秒钟");

                let item_str = time_str_a + " - " + time_str_b;
                if (time_diff < 300000) return successFunc(item_str);

                let diag_big_area = dialogs.build({
                    title: "提示",
                    content: "时间区间大于5分钟\n确定要保存这个区间吗\n\n通常情况下\n检测区间只需1-3分钟即可保证自己能量球的收取",
                    negative: "返回",
                    positive: "确定",
                });
                diag_big_area.on("negative", () => diag_big_area.dismiss());
                diag_big_area.on("positive", () => {
                    diag_big_area.dismiss();
                    return successFunc(item_str);
                });
                diag_big_area.show();

                // tool function(s) //

                function calcTimeDiff(str_a, str_b) {
                    let now = new Date();
                    let time_a = now.setHours.apply(now, str_a.split(":")),
                        time_b = now.setHours.apply(now, str_b.split(":"));
                    return time_b - time_a;
                }
            }

            function updateContentData(regexp, value) {
                let ori_content = diag.getContentView().getText().toString();
                diag.setContent(ori_content.replace(regexp, value));
            }
        },
        updateOpr: function (view) {
            let time_areas = session_config[this.config_conj];
            let time_area_amount = time_areas ? time_areas.length : 0;
            view._hint.text(time_area_amount ? (time_area_amount > 1 ? ("已配置时间区间数量: " + time_area_amount) : ("当前时间区间: " + time_areas[0][0] + " - " + time_areas[0][1])) : "未设置");
        },
    }))
;
rank_list_samples_collect_page
    .add("sub_head", new Layout("基本设置"))
    .add("button", new Layout("滑动距离", {
        config_conj: "rank_list_swipe_distance",
        hint: "hint",
        newWindow: function () {
            let avail_top = Math.ceil(HEIGHT * 0.4);
            let avail_bottom = Math.floor(HEIGHT * 0.8);
            let diag = dialogs.build({
                title: "设置排行榜页面滑动距离",
                content: "距离参数可设置具体像素数量\n" +
                    "如1260表示每次滑动1260像素\n" +
                    "也可设置0-1之间的小数\n如0.6表示每次滑动60%屏幕的距离\n\n" +
                    "示例: 0.6 | 60% | 1260\n\n" +
                    "当前屏幕高度像素值: " + HEIGHT + "\n" +
                    "可设置的像素值范围: " + avail_top + " - " + avail_bottom,
                inputHint: "{x|0.4(*HEIGHT)<=x<=0.8(*HEIGHT),x∈R}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                if (input.match(/^\d+%$/)) input = input.replace("%", "") / 100;
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 0 && value < 1) value *= HEIGHT;
                if (value > avail_bottom || value < avail_top) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, ~~value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            let value = session_config[this.config_conj] || DEFAULT_AF[this.config_conj];
            if (value < 1) value = ~~(value * HEIGHT);
            view._hint.text(value.toString() + " (" + Math.round(value / HEIGHT * 100) + "%)");
        },
    }))
    .add("button", new Layout("滑动时长", {
        config_conj: "rank_list_swipe_time",
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "设置排行榜页面滑动时长",
                content: "通常无需自行设置\n若出现无法滑动的现象\n可尝试适当增大此设置值",
                inputHint: "{x|50<=x<=500,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 500 || value < 50) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString());
        },
    }))
    .add("button", new Layout("滑动间隔", {
        config_conj: "rank_list_swipe_interval",
        hint: "hint",
        newWindow: function () {
            let diag_strategy_image = dialogs.build({
                title: "设置排行榜页面滑动间隔",
                content: "若出现遗漏目标的情况\n可尝试适当增大此设置值",
                inputHint: "{x|100<=x<=1000,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag_strategy_image.on("neutral", () => diag_strategy_image.getInputEditText().setText(DEFAULT_AF[this.config_conj].toString()));
            diag_strategy_image.on("negative", () => diag_strategy_image.dismiss());
            diag_strategy_image.on("positive", dialog => {
                let input = diag_strategy_image.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 1000 || value < 100) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag_strategy_image.dismiss();
            });
            let diag_strategy_layout = dialogs.build({
                title: "设置排行榜页面滑动间隔",
                content: "采用\"布局分析\"策略时\n滑动间隔将由脚本自动获取动态最优值",
                positive: "返回",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag_strategy_layout.on("positive", () => diag_strategy_layout.dismiss());
            session_config.rank_list_samples_collect_strategy === "image" && diag_strategy_image.show() || diag_strategy_layout.show();
        },
        updateOpr: function (view) {
            if (session_config.rank_list_samples_collect_strategy === "image") view._hint.text((session_config[this.config_conj] || DEFAULT_AF[this.config_conj]).toString());
            else view._hint.text("自动设置");
        },
    }))
    .add("sub_head", new Layout("高级设置"))
    .add("button", new Layout("采集策略", {
        config_conj: "rank_list_samples_collect_strategy",
        hint: "hint",
        map: {
            "layout": "布局分析",
            "image": "图像处理",
        },
        newWindow: function () {
            let map = this.map;
            let map_keys = Object.keys(map);
            let diag = dialogs.build({
                title: "排行榜样本采集策略",
                items: ["layout", "image"].map(value => map[value]),
                itemsSelectMode: "single",
                itemsSelectedIndex: map_keys.indexOf(session_config[this.config_conj]),
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认修改",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.setSelectedIndex(map_keys.indexOf(DEFAULT_AF[this.config_conj])));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                saveSession(this.config_conj, map_keys[diag.selectedIndex]);
                diag.dismiss();
            });
            diag.show();
        },
        infoWindow: function () {
            let diag = dialogs.build({
                title: "关于采集策略",
                content: "布局分析 (默认)\n\n" +
                    "使用布局信息定位好友/获取昵称\n" +
                    "可快速确认好友是否名列黑名单\n\n" +
                    "优点:\n" +
                    "1. 精准快速识别黑名单情况\n" +
                    "2. 好友数量较少时滑动列表速度快\n" +
                    "缺点:\n" +
                    "1. 好友数量多于200时卡顿明显\n" +
                    "2. 好友数量更多时卡顿愈发严重\n\n" +
                    "图像处理\n\n" +
                    "使用多点颜色匹配判断图标类型\n" +
                    "使用本地以保存的图片匹配好友\n" +
                    "进而获取黑名单情况\n" +
                    "每页排行榜信息采集均无需控件信息\n\n" +
                    "优点:\n" +
                    "1. 采集信息时滑动速度不受控件影响\n" +
                    "2. 摆脱控件依赖\n" +
                    "缺点:\n" +
                    "1. 首次确认黑名单情况时必须进入好友森林\n" +
                    "2. 确认好友是否名列黑名单精确性低\n" +
                    "3. 本地可能需要保存大量图像数据\n" +
                    "4. 排行榜底部判断条件受限且可能滞留许久\n\n" +
                    "建议:\n" +
                    "好友数量大于200使用图像处理\n" +
                    "排行榜滑动卡顿时使用图像处理\n" +
                    "黑名单好友较多时使用图像处理\n" +
                    "布局信息获取失效时用图像处理\n" +
                    "其他情况使用布局分析\n",
                positive: "返回",
                // positiveColor: "#4db6ac",
                neutral: "隐藏此提示图标",
                neutralColor: defs.hint_btn_dark_color,
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("positive", () => diag.dismiss());
            diag.on("neutral", () => {
                saveSession("info_icons_sanctuary", session_config.info_icons_sanctuary.concat([this.config_conj]));
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text(this.map[session_config[this.config_conj].toString()]);
            view._info_icon.setVisibility(~session_config.info_icons_sanctuary.indexOf(this.config_conj) ? 8 : 0);
        },
    }))
;
auto_unlock_page
    .add("switch", new Layout("总开关", {
        config_conj: "auto_unlock_switch",
        listeners: {
            "_switch": {
                "check": function (state) {
                    saveSession(this.config_conj, !!state);
                    let parent = this.view.getParent();
                    let child_count = parent.getChildCount();
                    while (child_count-- > 2) {
                        parent.getChildAt(child_count).setVisibility(state ? 0 : 4);
                    }
                },
            },
        },
        updateOpr: function (view) {
            let session_conf = !!session_config[this.config_conj];
            view["_switch"].setChecked(session_conf);
        },
    }))
    .add("sub_head", new Layout("基本设置"))
    .add("button", new Layout("锁屏密码", {
        config_conj: "unlock_code",
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "设置锁屏解锁密码",
                neutral: "查看示例",
                neutralColor: defs.hint_btn_bright_color,
                negative: "返回",
                positive: "确认",
                content: "密码长度不小于4位\n无密码请留空\n\n若采用图案解锁方式\n总点阵数大于9需使用逗号分隔",
                inputHint: "密码将以密文形式存储在本地",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => {
                let diag_demo = dialogs.build({
                    title: "锁屏密码示例",
                    content: "滑动即可解锁: (留空)\n\nPIN解锁: 1001\n\n密码解锁: 10btv69\n\n图案解锁: (点阵序号从1开始)\n3×3点阵 - 1235789 或 1,2,3,5,7,8,9\n4×4点阵 - 1,2,3,4,8,12,16\n注: 点阵密码可简化",
                    positive: "关闭",
                    neutral: "了解点阵简化",
                    neutralColor: defs.hint_btn_bright_color,
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
                diag_demo.on("neutral", () => {
                    let diag_simplified_pattern = dialogs.build({
                        title: "图案解锁密码简化",
                        content: "共线的连续线段组只需保留首末两点\n\n3×3 - 1,2,3,5,7,8,9 -> 1,3,7,9\n4×4 - 1,2,3,4,8,12,16 -> 1,4,16\n5×5 - 1,2,3,4,5,6 -> 1,5,6",
                        positive: "关闭",
                        autoDismiss: false,
                        canceledOnTouchOutside: false,
                    });
                    diag_simplified_pattern.on("positive", () => diag_simplified_pattern.dismiss());
                    diag_simplified_pattern.show();
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
    .add("sub_head", new Layout("高级设置"))
    .add("button", new Layout("锁屏页面上滑时长", {
        config_conj: "dismiss_layer_swipe_time",
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "设置锁屏页面上滑时长",
                content: "通常无需自行设置\n脚本会自动尝试增量赋值获得最佳值",
                inputHint: "{x|110<=x<=1000,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 1000 || value < 110) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
        },
    }))
    .add("button", new Layout("图案解锁滑动时长", {
        config_conj: "pattern_unlock_swipe_time",
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "设置图案解锁滑动时长",
                content: "通常无需自行设置\n脚本会自动尝试增量赋值获得最佳值",
                inputHint: "{x|120<=x<=3000,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 3000 || value < 120) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
        },
    }))
    .add("button", new Layout("图案解锁点阵边长", {
        config_conj: "unlock_pattern_size",
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "设置图案解锁边长",
                content: "图案解锁通常为N×N的点阵\n通常边长N为3\n\n若未使用图案解锁方式\n请保留默认值",
                inputHint: "{x|3<=x<=6,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 6 || value < 3) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
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
        hint: "hint",
        newWindow: function () {
            let diag = dialogs.build({
                title: "设置解锁最大尝试次数",
                inputHint: "{x|5<=x<=50,x∈N*}",
                neutral: "使用默认值",
                negative: "返回",
                positive: "确认",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT_UNLOCK[this.config_conj].toString()));
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", dialog => {
                let input = diag.getInputEditText().getText().toString();
                if (input === "") return dialog.dismiss();
                let value = input - 0;
                if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                if (value > 50 || value < 5) return alertTitle(dialog, "输入值范围不合法");
                saveSession(this.config_conj, value);
                diag.dismiss();
            });
            diag.show();
        },
        updateOpr: function (view) {
            view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
        },
    }))
;
blacklist_page
    .add("options", new Layout("能量罩黑名单", {
        hint: "hint",
        next_page: cover_blacklist_page,
        updateOpr: function (view) {
            let amount = session_config.blacklist_protect_cover.length;
            view._hint.text(amount ? "包含成员: " + amount + "人" : "空名单");
        },
    }))
    .add("options", new Layout("自定义黑名单", {
        hint: "hint",
        next_page: self_def_blacklist_page,
        updateOpr: function (view) {
            let amount = session_config.blacklist_by_user.length;
            view._hint.text(amount ? "包含成员: " + amount + "人" : "空名单");
        },
    }))
;
cover_blacklist_page
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
;
self_def_blacklist_page
    .add("list", new Layout("/*自定义黑名单成员*/", {
        list_head: list_heads.blacklist_by_user,
        data_source_key_name: "blacklist_by_user",
        list_checkbox: "visible",
        listeners: {
            "_list_data": {
                "item_long_click": function (e, item, idx, item_view, list_view) {
                    item_view._checkbox.checked && item_view._checkbox.click();
                    e.consumed = true;
                    let data_source_key_name = this.data_source_key_name;
                    let edit_item_diag = dialogs.build({
                        title: "编辑列表项",
                        content: "点击需要编辑的项",
                        positive: "确认",
                        negative: "返回",
                        items: ["\xa0"],
                        autoDismiss: false,
                        canceledOnTouchOutside: false,
                    });

                    refreshItems();

                    edit_item_diag.on("positive", () => {
                        let new_item = {};
                        new_item.name = edit_item_diag.getItems().toArray()[0].split(": ")[1];
                        let input = edit_item_diag.getItems().toArray()[1].split(": ")[1];
                        if (input === "永不") new_item.timestamp = Infinity;
                        else {
                            let time_nums = input.split(/\D+/);
                            new_item.timestamp = new Date(+time_nums[0], time_nums[1] - 1, +time_nums[2], +time_nums[3], +time_nums[4]).getTime();
                        }
                        updateDataSource(data_source_key_name, "splice", [idx, 1, new_item]);
                        session_params["btn_restore"].switch_on();
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
                            time_picker_view.zero_btn.on("click", () => closeTimePickerPage(0));
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
                                    refreshItems(list_item_prefix, convertTimestamp(return_value).time_str_remove);
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
                        let remove_btn_view = session_params["btn_remove"];
                        let item = item_holder.item;
                        let aim_checked = !item.checked;
                        item.checked = aim_checked;
                        let idx = item_holder.position;
                        session_params.deleted_items_idx = session_params.deleted_items_idx || {};
                        session_params.deleted_items_idx_count = session_params.deleted_items_idx_count || 0;
                        session_params.deleted_items_idx[idx] = aim_checked;
                        aim_checked ? session_params.deleted_items_idx_count++ : session_params.deleted_items_idx_count--;
                        session_params.deleted_items_idx_count ? remove_btn_view.switch_on() : remove_btn_view.switch_off();
                        this.view._check_all.setChecked(session_params.deleted_items_idx_count === session_config[this.data_source_key_name].length);
                    });
                },
            },
            "_check_all": {
                "click": function (view) {
                    let data_source_key_name = this.data_source_key_name;
                    let aim_checked = view.checked;
                    let blacklist_len = session_params[data_source_key_name].length;
                    if (!blacklist_len) return view.checked = !aim_checked;

                    session_params[data_source_key_name].forEach((o, idx) => {
                        let o_new = deepCloneObject(o);
                        o_new.checked = aim_checked;
                        updateDataSource(data_source_key_name, "splice", [idx, 1, o_new]);
                    });

                    session_params.deleted_items_idx_count = aim_checked ? blacklist_len : 0;
                    session_params.deleted_items_idx = session_params.deleted_items_idx || {};
                    for (let i = 0; i < blacklist_len; i += 1) {
                        session_params.deleted_items_idx[i] = aim_checked;
                    }

                    let remove_btn = session_params["btn_remove"];
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
;
message_showing_page
    .add("switch", new Layout("总开关", {
        config_conj: "message_showing_switch",
        listeners: {
            "_switch": {
                "check": function (state) {
                    saveSession(this.config_conj, !!state);
                    let parent = this.view.getParent();
                    let child_count = parent.getChildCount();
                    while (child_count-- > 2) {
                        let child_view = parent.getChildAt(child_count);
                        let switch_view = child_view._switch;
                        if (state && switch_view) {
                            let ori_state = switch_view.checked;
                            switch_view.checked = true;
                            !ori_state && (switch_view.checked = false);
                        }
                        child_view.setVisibility(state ? 0 : 4);
                    }
                },
            },
        },
        updateOpr: function (view) {
            let session_conf = !!session_config[this.config_conj];
            view["_switch"].setChecked(session_conf);
        },
    }))
    .add("split_line")
    .add("switch", new Layout("控制台消息", {
        config_conj: "console_log_switch",
        listeners: {
            "_switch": {
                "check": function (state) {
                    saveSession(this.config_conj, !!state);
                    let parent = this.view.getParent();
                    let child_count = parent.getChildCount();
                    let current_child_index = parent.indexOfChild(this.view);
                    while (++current_child_index < child_count) {
                        let child_view = parent.getChildAt(current_child_index);
                        if (child_view.findViewWithTag("split_line")) break;
                        child_view.setVisibility(state ? 0 : 8);
                    }
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
        config_conj: "debug_info_switch",
        listeners: {
            "_checkbox_switch": {
                "check": function (state) {
                    let parent = this.view.getParent();
                    let current_child_index = parent.indexOfChild(this.view);
                    let radio_group_view = parent.getChildAt(current_child_index - 1).getChildAt(0);
                    for (let i = 0, len = radio_group_view.getChildCount(); i < len; i += 1) {
                        let radio_view = radio_group_view.getChildAt(i);
                        radio_view.setClickable(!state);
                        radio_view.setTextColor(colors.parseColor(state ? "#b0bec5" : "#000000"));
                        //state && radio_view.setChecked(false);
                    }
                    saveSession(this.config_conj, !!state);
                },
            },
        },
        updateOpr: function (view) {
            let session_conf = !!session_config[this.config_conj];
            view["_checkbox_switch"].setChecked(session_conf);
        },
    }))
    .add("split_line")
    .add("switch", new Layout("运行结果展示", {
        config_conj: "result_showing_switch",
        listeners: {
            "_switch": {
                "check": function (state) {
                    saveSession(this.config_conj, !!state);
                    let parent = this.view.getParent();
                    let child_count = parent.getChildCount();
                    let current_child_index = parent.indexOfChild(this.view);
                    while (++current_child_index < child_count) {
                        let child_view = parent.getChildAt(current_child_index);
                        if (child_view.findViewWithTag("split_line")) break;
                        child_view.setVisibility(state ? 0 : 8);
                    }
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
    .add("button", new Layout("了解详情", {
        newWindow: function () {
            let diag = dialogs.build({
                title: "关于消息提示配置",
                content: "控制台消息\n\n" +
                    "简略: 只显示最终收取能量总计数据\n" +
                    "详细: 显示每个好友收取/帮收数据\n" +
                    "开发者测试模式: 详细显示操作信息\n\n" +
                    "运行结果展示\n\n" +
                    "Floaty: 彩色悬浮窗方式\n" +
                    "Toast: 消息浮动框方式",
                positive: "关闭",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("positive", () => diag.dismiss());
            diag.show();
        },
    }))
    .add("split_line")
;
local_project_backup_restore_page
    .add("sub_head", new Layout("备份"))
    .add("button", new Layout("备份至本地", {
        newWindow: function () {
            let diag = dialogs.build({
                title: "备份项目至本地",
                content: "此功能将项目相关文件打包保存在本地\n可在还原页面恢复或删除已存在的备份",
                positive: "开始备份",
                negative: "放弃",
                neutral: "添加备注",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("neutral", () => {
                diag.dismiss();
                let diag_remark = dialogs.build({
                    title: "为备份添加备注",
                    inputHint: "",
                    positive: "确定",
                    negative: "放弃",
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
                let diag_backup = dialogs.build({
                    title: "正在备份",
                    content: "此过程可能需要一些时间",
                    positive: "终止",
                    progress: {
                        max: 100,
                        showMinMax: false,
                    },
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
                diag_backup.on("positive", () => {
                    signal_interrupt_update = true;
                    diag_backup.dismiss();
                });
                diag_backup.show();
                threads.start(function () {
                    backupProjectFiles(null, null, diag_backup);
                });
            });
            diag.show();
        },
    }))
    .add("sub_head", new Layout("还原"))
    .add("options", new Layout("从本地还原", {
        hint: "hint",
        view_label: "restore_projects_from_local",
        next_page: restore_projects_from_local,
        updateOpr: function (view) {
            let amount = session_config.project_backup_info.length;
            view._hint.text(amount ? "共计备份: " + amount + "项" : "无备份");
        },
    }))
    .add("options", new Layout("从服务器还原", {
        hint: "hint",
        next_page: null,
        view_label: "restore_projects_from_server",
        updateOpr: function (view) {
            let self = this;
            if (session_params.restore_projects_from_server_updated_flag) return;
            view._chevron_btn.setVisibility(8);
            view._hint.text("正在从服务器获取数据...");
            view.setClickListener(() => null);
            session_params.restore_projects_from_server_updated_flag = true;
            threads.start(function () {
                let max_try_times = 5;
                let setViewText = text => ui.post(() => view._hint.text(text));
                while (max_try_times--) {
                    try {
                        let res = http.get("https://api.github.com/repos/SuperMonster003/Auto.js_Projects/releases");
                        session_params.server_releases_info = res.body.json(); // array
                        let amount = session_params.server_releases_info.length;
                        if (!amount) {
                            view.setClickListener(() => updateViewByLabel(self.view_label));
                            return setViewText("无备份 (点击可重新检查)");
                        }
                        view.setNextPage(restore_projects_from_server);
                        ui.post(() => view._chevron_btn.setVisibility(0));
                        view.restoreClickListener();
                        setViewText("共计备份: " + amount + "项");

                        ui.post(() => {
                            restore_projects_from_server
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
                                                let diag = dialogs.build({
                                                    title: "版本详情",
                                                    content: release_details,
                                                    positive: "还原此项目",
                                                    positiveColor: defs.warn_btn_color,
                                                    negative: "返回",
                                                    neutral: "浏览器查看",
                                                    neutralColor: defs.hint_btn_bright_color,
                                                    autoDismiss: false,
                                                    canceledOnTouchOutside: false,
                                                });
                                                diag.on("negative", () => diag.dismiss());
                                                diag.on("neutral", () => app.openUrl(single_session_data.html_url));
                                                diag.on("positive", () => {
                                                    diag.dismiss();
                                                    let diag_confirm = dialogs.build({
                                                        title: "还原项目",
                                                        content: "确定还原此版本项目吗\n" +
                                                            "本地项目将被覆盖\n" +
                                                            "此操作无法撤销",
                                                        positive: "确定",
                                                        negative: "放弃",
                                                    });
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
                        return;
                    } catch (e) {
                        sleep(200);
                    }
                }
                view.setClickListener(() => updateViewByLabel(self.view_label));
                session_params.restore_projects_from_server_updated_flag = false;
                return setViewText("服务器数据获取失败 (点击重试)");
            });
        },
    }))
;
restore_projects_from_local
    .add("list", new Layout("/*本地项目还原*/", {
        list_head: list_heads.project_backup_info,
        data_source_key_name: "project_backup_info",
        list_checkbox: "gone",
        tool_box: {
            deleteItem: (parent_dialog, idx) => {
                parent_dialog && parent_dialog.dismiss();

                let diag_delete_confirm = dialogs.build({
                    title: "删除备份",
                    content: "确定删除此备份吗\n" +
                        "此操作无法撤销",
                    positive: "确定",
                    negative: "放弃",
                });
                diag_delete_confirm.on("negative", () => {
                    diag_delete_confirm.dismiss();
                    parent_dialog && parent_dialog.show();
                });
                diag_delete_confirm.on("positive", () => {
                    diag_delete_confirm.dismiss();

                    let data_source_key_name = "project_backup_info";
                    updateDataSource(data_source_key_name, "splice", [idx, 1], "quiet");
                    updateViewByLabel("restore_projects_from_local");

                    // write to storage right away
                    storage_af.put(data_source_key_name, storage_config[data_source_key_name] = deepCloneObject(session_config[data_source_key_name]));
                });
                diag_delete_confirm.show();
            },
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
                        if (key === "timestamp") value = convertTimestamp(value).time_str;
                        value && backup_details.push(label_name + ": " + value);
                    });
                    backup_details = backup_details.join("\n\n");
                    let diag = dialogs.build({
                        title: "备份详情",
                        content: backup_details,
                        positive: "还原此备份",
                        positiveColor: defs.warn_btn_color,
                        negative: "返回",
                        neutral: "删除此备份",
                        neutralColor: defs.caution_btn_color,
                        autoDismiss: false,
                        canceledOnTouchOutside: false,
                    });
                    diag.on("positive", () => {
                        diag.dismiss();
                        let diag_confirm = dialogs.build({
                            title: "还原备份",
                            content: "确定还原此备份吗\n" +
                                "本地项目将被覆盖\n" +
                                "此操作无法撤销",
                            positive: "确定",
                            negative: "放弃",
                        });
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
;

ui.emitter.on("back_pressed", e => {
    let len = pages.length,
        need_save = needSave();
    if (!checkSpePagesBeforeJumpBack()) return e.consumed = true;
    if (len === 1 && !need_save) return quitNow(); // "back" function
    e.consumed = true; // make default "back" dysfunctional
    len === 1 && need_save ? showQuitConfirmDialog() : pageJump("back");

    // tool function(s) //

    function showQuitConfirmDialog() {
        let diag = dialogs.build({
            "title": "设置未保存",
            "content": "确定要退出吗",
            //"items": ["1. 查看本次更改的设置", "2. 撤销本次更改的设置", "3. 还原部分或全部设置"],
            "neutral": "返回",
            "negative": "强制退出",
            "positive": "保存并退出",
            "autoDismiss": false,
            "canceledOnTouchOutside": false,
        });
        diag.on("neutral", () => diag.dismiss());
        diag.on("negative", () => ~diag.dismiss() && quitNow());
        diag.on("positive", () => saveNow() && ~diag.dismiss() && quitNow());

        // let ori_content = diag.getContentView().getText().toString();
        // diag.setContent(ori_content + "\n\n您还可以:");

        diag.show();
    }

    function quitNow() {
        if (storage_af.get("af_postponed")) {
            toast("配置结束\n即将运行蚂蚁森林");
            engines.execScriptFile("./Ant_Forest_Launcher.js");
            storage_af.remove("af_postponed");
            storage_af.put("config_prompted", true);
        }
        ui.finish();
    }
});

updateAllValues();

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
}

// layout function(s) //

function setBlacklistPageButtons(parent_view) {
    return setButtons(parent_view,
        ["restore", "RESTORE", "OFF", btn_view => {
            let blacklist_backup = storage_config.blacklist_by_user;
            let data_source_key_name = "blacklist_by_user";
            if (equalObjects(session_config[data_source_key_name], blacklist_backup)) return;
            let diag = dialogs.build({
                title: "恢复列表数据",
                content: "要恢复本次会话开始前的列表数据吗\n\n此操作不可撤销",
                neutral: "查看恢复列表",
                neutralColor: defs.hint_btn_bright_color,
                negative: "返回",
                positive: "确定",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => {
                let diag_restore_list = dialogs.build({
                    title: "查看恢复列表",
                    content: "共计" + blacklist_backup.length + "项",
                    positive: "返回",
                    items: (function () {
                        let split_line = "";
                        for (let i = 0; i < 18; i += 1) split_line += "- ";
                        let items = [split_line];
                        blacklist_backup.forEach(o => items.push("好友昵称: " + o.name, "解除时间: " + convertTimestamp(o.timestamp).time_str_remove, split_line));
                        return items.length > 1 ? items : ["列表为空"];
                    })(),
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
                diag_restore_list.on("positive", () => diag_restore_list.dismiss());
                diag_restore_list.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                let list_page_view = findViewByTag(parent_view, "list_page_view");
                diag.dismiss();
                updateDataSource(data_source_key_name, "splice", [0, session_params[data_source_key_name].length]);
                session_params.deleted_items_idx = {};
                session_params.deleted_items_idx_count = 0;
                let remove_btn = parent_view._text_remove.getParent();
                remove_btn.switch_off();
                btn_view.switch_off();
                blacklist_backup.forEach(value => updateDataSource(data_source_key_name, "update", value));
                list_page_view._check_all.setChecked(true);
                list_page_view._check_all.setChecked(false);
            });
            diag.show();
        }],
        ["delete_forever", "REMOVE", "OFF", btn_view => {
            if (!session_params.deleted_items_idx_count) return;
            let data_source_key_name = "blacklist_by_user";

            let thread_items_stable = threads.start(function () {
                let old_count = undefined;
                while (session_params.deleted_items_idx_count !== old_count) {
                    old_count = session_params.deleted_items_idx_count;
                    sleep(50);
                }
            });
            thread_items_stable.join(800);

            let deleted_items_idx_keys = Object.keys(session_params.deleted_items_idx);
            deleted_items_idx_keys.sort((a, b) => +a < +b).forEach(idx => session_params.deleted_items_idx[idx] && session_params[data_source_key_name].splice(idx, 1));
            updateDataSource(data_source_key_name, "rewrite");
            session_params.deleted_items_idx = {};
            session_params.deleted_items_idx_count = 0;

            let list_page_view = findViewByTag(parent_view, "list_page_view");
            let restore_btn = parent_view._text_restore.getParent();
            if (!equalObjects(session_config[data_source_key_name], storage_config[data_source_key_name])) restore_btn.switch_on();
            else restore_btn.switch_off();
            list_page_view._check_all.setChecked(true);
            list_page_view._check_all.setChecked(false);
            btn_view.switch_off();
        }],
        ["add_circle", "NEW", "ON", btn_view => {
            let tmp_selected_friends = [];
            let blacklist_selected_friends = [];
            let data_source_key_name = "blacklist_by_user";
            let list_page_view = findViewByTag(parent_view, "list_page_view");

            session_config[data_source_key_name].forEach(o => blacklist_selected_friends.push(o.name));

            let diag = dialogs.build({
                title: "添加新数据",
                content: "从好友列表中选择并添加好友\n或手动输入好友昵称",
                items: [" "],
                neutral: "从列表中选择",
                neutralColor: defs.hint_btn_bright_color,
                negative: "手动添加",
                negativeColor: defs.hint_btn_bright_color,
                positive: "确认添加",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag.on("neutral", () => {
                let diag_add_from_list = dialogs.build({
                    title: "列表选择好友",
                    content: "",
                    neutral: "刷新列表",
                    neutralColor: defs.hint_btn_bright_color,
                    positive: "确认选择",
                    items: ["列表为空"],
                    itemsSelectMode: "multi",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
                diag_add_from_list.on("neutral", () => {
                    diag_add_from_list.dismiss();
                    diag.dismiss();
                    engines.execScriptFile("./Ant_Forest_Launcher.js", {
                        arguments: {
                            special_exec_command: "collect_friends_list",
                        },
                    });
                    threads.start(function () {
                        if (waitForAction(text("打开"), 3500)) clickAction(text("打开"), "widget");
                    });
                    ui.emitter.on("resume", () => {
                        diag.show();
                        threads.start(function () {
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
                    session_params.last_friend_list_refresh_timestamp = friends_list.timestamp || -1;
                    let content_info = (friends_list.timestamp ? ("上次刷新: " + convertTimestamp(friends_list.timestamp).time_str + "\n") : "") +
                        "当前可添加的好友总数: " + items_len;
                    diag_add_from_list.setContent(content_info);
                }
            });
            diag.on("negative", () => {
                let input_ok_flag = true;
                let diag_add_manually = dialogs.build({
                    title: "手动添加好友",
                    content: "手动添加易出错\n且难以键入特殊字符\n建议使用列表导入功能",
                    inputHint: "输入好友备注昵称 (非账户名)",
                    positive: "添加到选择区",
                    negative: "返回",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
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
                tmp_selected_friends.forEach(name => updateDataSource(data_source_key_name, "update", {
                    name: name,
                    timestamp: Infinity,
                }));
                if (tmp_selected_friends.length) setTimeout(() => parent_view._list_data.smoothScrollBy(0, Math.pow(10, 5)), 200);
                let restore_btn = list_page_view.getParent()._text_restore.getParent();
                equalObjects(session_config[data_source_key_name], storage_config[data_source_key_name]) ? restore_btn.switch_off() : restore_btn.switch_on();
                saveSession(data_source_key_name, session_config[data_source_key_name]);
                diag.dismiss();
            });
            diag.on("item_select", (idx, item, dialog) => {
                let diag_items = diag.getItems().toArray();
                if (diag_items.length === 1 && diag_items[0] === "\xa0") return;
                let delete_confirm_diag = dialogs.build({
                    title: "确认移除此项吗",
                    positive: "确认",
                    negative: "返回",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
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
            <text/>
        </vertical>
    );
    ui.statusBarColor(status_bar_color || "#03a6ef");
}

function setHomePage(home_title) {
    let homepage = setPage(home_title, def, parent_view => setButtons(parent_view,
        ["save", "SAVE", "OFF", btn_view => {
            if (!needSave()) return;
            saveNow();
            btn_view.switch_off();
            toast("已保存");
        }]
    ));

    ui.main.getParent().addView(homepage);
    homepage._back_btn_area.setVisibility(8);
    pages[0] = homepage;
    return homepage;
}

function setPage(title, title_bg_color, additions, no_margin_bottom_flag) {
    session_params.page_title = title;
    title_bg_color = title_bg_color || defs["title_bg_color"];
    let new_view = ui.inflate(<vertical></vertical>);
    new_view.addView(ui.inflate(
        <linear id="_title_bg" clickable="true">
            <vertical id="_back_btn_area" marginRight="-22" layout_gravity="center">
                <linear>
                    <img src="@drawable/ic_chevron_left_black_48dp" height="31" bg="?selectableItemBackgroundBorderless" tint="#ffffff" layout_gravity="center"/>
                    <text id="back_btn_text" text=" " gravity="center" textSize="10" textStyle="bold" h="45" gravity="bottom|center"/>
                </linear>
            </vertical>
            <text id="_title_text" textColor="#ffffff" textSize="19" textStyle="bold" margin="16"/>
        </linear>
    ));
    new_view._back_btn_area.on("click", () => checkSpePagesBeforeJumpBack() && pageJump("back"));
    new_view._title_text.text(title);
    let title_bg = typeof title_bg_color === "string" ? colors.parseColor(title_bg_color) : title_bg_color;
    new_view._title_bg.setBackgroundColor(title_bg);

    if (additions) typeof additions === "function" ? additions(new_view) : additions.forEach(f => f(new_view));

    new_view.addView(ui.inflate(
        <ScrollView>
            <vertical id="_scroll_view"></vertical>
        </ScrollView>
    ));
    if (!no_margin_bottom_flag) {
        new_view._scroll_view.addView(ui.inflate(
            <frame>
                <frame margin="0 0 0 8"></frame>
            </frame>
        ));
    }
    new_view.add = (type, item_params) => {
        let sub_view = setItem(type, item_params);
        new_view._scroll_view.addView(sub_view);
        if (sub_view.updateOpr) dynamic_views.push(sub_view);
        return new_view;
    };
    return new_view;

    // tool function(s) //

    function setItem(type, item_params) {

        let new_view = type === "split_line" && setSplitLine(item_params) ||
            type === "sub_head" && setSubHead(item_params) ||
            type === "info" && setInfo(item_params) ||
            type === "list" && setList(item_params) ||
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
            if (type === "switch") sw_view = ui.inflate(<Switch id="_switch" checked="true"/>);
            if (type === "checkbox_switch") sw_view = ui.inflate(<vertical padding="8 0 0 0">
                <checkbox id="_checkbox_switch" checked="false"/>
            </vertical>);
            new_view._item_area.addView(sw_view);
            item_params.view = new_view;

            let listener_ids = item_params["listener"];
            Object.keys(listener_ids).forEach(id => {
                let listeners = listener_ids[id];
                Object.keys(listeners).forEach(listener => {
                    new_view[id].on(listener, listeners[listener].bind(item_params));
                });
            });
        } else if (type === "options") {
            let opt_view = ui.inflate(
                <vertical id="_chevron_btn">
                    <img padding="10 0 0 0" src="@drawable/ic_chevron_right_black_48dp" height="31" bg="?selectableItemBackgroundBorderless" tint="#999999"/>
                </vertical>
            );
            new_view._item_area.addView(opt_view);
            item_params.view = new_view;
            new_view.setClickListener = (listener) => {
                new_view._item_area.removeAllListeners("click");
                new_view._item_area.on("click", listener);
            };
            new_view.restoreClickListener = () => new_view.setClickListener(() => item_params.next_page && pageJump("next", item_params.next_page));
            new_view.restoreClickListener();
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
            new_view.setTag("split_line");
            line_color = typeof line_color === "string" ? colors.parseColor(line_color) : line_color;
            new_view._line.setBackgroundColor(line_color);

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
                        <list id="_list_data" fastScrollEnabled="true" focusable="true" stackFromBottom="true" scrollbars="none">
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
                    session_params["list_sort_flag_" + data_key_name] = session_params["list_sort_flag_" + data_key_name] || 1;

                    let session_data = session_params[data_source_key_name];
                    session_data = session_data.map((value, idx) => [idx, value]); // to attach indices
                    session_data.sort((a, b) => {
                        if (session_params["list_sort_flag_" + data_key_name] > 0) return a[1][a[1][data_key_name]] > b[1][b[1][data_key_name]];
                        return a[1][a[1][data_key_name]] < b[1][b[1][data_key_name]];
                    });
                    let indices_table = {};
                    session_data = session_data.map((value, idx) => {
                        indices_table[value[0]] = idx;
                        return value[1];
                    });
                    session_params.deleted_items_idx = session_params.deleted_items_idx || {};
                    let tmp_deleted_items_idx = {};
                    Object.keys(session_params.deleted_items_idx).forEach(ori_idx_key => {
                        tmp_deleted_items_idx[indices_table[ori_idx_key]] = session_params.deleted_items_idx[ori_idx_key];
                    });
                    session_params.deleted_items_idx = deepCloneObject(tmp_deleted_items_idx);
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
    }
}

function setButtons(parent_view, button_params_arr) {
    let buttons_view = ui.inflate(<horizontal id="btn"></horizontal>);
    let buttons_count = 0;
    for (let i = 1, len = arguments.length; i < len; i += 1) {
        let arg = arguments[i];
        if (typeof arg !== "object") continue; // just in case
        buttons_view.btn.addView(getButtonLayout.apply(null, arg));
        buttons_count += 1;
    }
    parent_view._title_text.setWidth(~~((650 - 100 * buttons_count - (session_params.page_title !== "蚂蚁森林" ? 52 : 5)) * WIDTH / 720));
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
        let view = buttonView(); ///
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
        session_params["btn_" + btn_text] = view;

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
    if (direction.match(/back|previous|last/)) {
        smoothScrollView("full_right", null, pages);
        return pages.pop();
    }
    pages.push(next_page);
    smoothScrollView("full_left", null, pages);
}

function saveNow() {
    let session_config_mixed = deepCloneObject(session_config);
    writeUnlockStorage();
    writeBlacklist();
    writeProjectBackupInfo();
    storage_cfg.put("config", session_config_mixed); // only "cfg" reserved now (without unlock, blacklist, etc)
    storage_config = deepCloneObject(session_config);
    session_params = {};
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
                timestamp: o.timestamp === Infinity ? 0 : o.timestamp,
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

function manageItems(dialog, operation, item_content, item_index) {
    let ori_items = [];
    dialog.getItems() ? dialog.getItems().toArray().forEach((value, index) => ori_items[index] = value) : [];
    if (operation === "add") {
        if (ori_items.length === 1 && ori_items[0] === defs.empty_non_break_check_time_area_hint) ori_items = [];
        if (!item_index && item_index !== 0) return dialog.setItems(ori_items.concat(item_content));
        return dialog.setItems(ori_items.slice(0, item_index).concat(item_content).concat(ori_items.slice(item_index)));
    } else if (operation === "delete") {
        if (ori_items.length === 1) return dialog.setItems([defs.empty_non_break_check_time_area_hint]);
        if (!item_index && item_index !== 0) return dialog.setItems(ori_items.slice(0, -1));
        ori_items.splice(item_index, 1);
        return dialog.setItems(ori_items);
    } else if (operation === "modify") {
        ori_items.splice(!item_index && item_index !== 0 ? ori_items.length - 1 : item_index, 1, item_content);
        return dialog.setItems(ori_items);
    }
}

function checkSpePagesBeforeJumpBack() {
    return checkEmptyNonBreakArea();

    // tool function(s) //

    function checkEmptyNonBreakArea() {
        let pages_len = pages.length,
            last_page = pages[pages_len - 1];
        if (!last_page || !last_page._title_text) return true;
        if (last_page._title_text.getText() !== "监测自己能量") return true;
        if (session_config.non_break_check_time_area[0] !== undefined) return true;
        if (last_page._switch.checked === false) return true;
        let diag_alert = dialogs.build({
            title: "提示",
            content: "未设置任何时间区间\n\n继续返回将关闭\"监测自己能量\"功能",
            negative: "放弃返回",
            positive: "继续返回",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
        diag_alert.on("negative", () => diag_alert.dismiss());
        diag_alert.on("positive", () => {
            last_page._switch.setChecked(false);
            pageJump("back");
            diag_alert.dismiss();
        });
        diag_alert.show();
    }
}

function convertTimestamp(time_param) {
    let timestamp = +time_param;
    let time_str = "";
    let time_str_remove = "";
    let time = new Date();
    if (!timestamp) time_str = time_str_remove = "时间戳无效";
    if (timestamp === Infinity || timestamp === 0) time_str_remove = "永不";
    else if (timestamp <= time.getTime()) time_str_remove = "下次运行";
    if (!time_str) {
        time.setTime(timestamp);
        let zeroPadding = num => ("0" + num).slice(-2);
        let yy = time.getFullYear();
        let MM = zeroPadding(time.getMonth() + 1);
        let dd = zeroPadding(time.getDate());
        let hh = zeroPadding(time.getHours());
        let mm = zeroPadding(time.getMinutes());
        time_str = yy + "\/" + MM + "\/" + dd + " " + hh + ":" + mm;
    }

    return {
        time_str: time_str,
        time_str_remove: time_str_remove || time_str,
        timestamp: timestamp,
    };
}

function findViewByTag(parent_view, tag_name) {
    if (!tag_name) return;
    let len = parent_view.getChildCount();
    for (let i = 0; i < len; i += 1) {
        let aim_view = parent_view.getChildAt(i);
        if (aim_view.findViewWithTag(tag_name)) return aim_view;
    }
}

/**
 * Update project from github and backup current local version to an archive file
 * @Thank NickHopps
 * @Thank 白酒煮饭
 */
function handleNewVersion(parent_dialog, file_content, newest_version_name) {
    let url_server = "https://github.com/SuperMonster003/Auto.js_Projects/archive/Ant_Forest.zip";
    let fetched_file_path = getFetchedFile(defs.local_backup_path, url_server);
    let update_histories_str = "";
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

    let diag_update_details = dialogs.build({
        title: newest_version_name,
        content: "正在获取版本更新信息...",
        neutral: null,
        negative: "返回",
        positive: storage_af.get("update_dialog_prompt_prompted") ? "立即更新" : "开始更新",
        positiveColor: defs.attraction_btn_color,
        autoDismiss: false,
        canceledOnTouchOutside: false,
    });
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

        diag_download = dialogs.build({
            title: "正在部署项目最新版本",
            positive: "终止",
            progress: {
                max: 100,
                showMinMax: false,
            },
            autoDismiss: false,
            canceledOnTouchOutside: false,
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

        let diag_update_prompt = dialogs.build({
            title: "更新提示",
            content: "1. 更新过程中 本地项目将会被备份 可用于更新撤回/用户自行恢复数据/自定义代码的复原等操作\n" +
                "2. 整个更新过程将按照以下步骤执行: " + steps_str,
            positive: "立即更新",
            positiveColor: defs.attraction_btn_color,
            negative: "返回",
            neutralColor: defs.hint_btn_bright_color,
            checkBoxPrompt: "不再提示",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
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
            ui.post(() => {
                diag_update_details.getContentView().setText(session_params.update_info[newest_version_name]);
                diag_update_details.setActionButton("neutral", "查看历史更新");
            });
        };
        if (Object.keys(session_params.update_info || {}).length) return updateDialogUpdateDetails();

        threads.start(function () {
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

        let diag_update_histories = dialogs.build({
            title: "历史更新",
            content: getUpdateHistoriesStr(),
            positive: "返回",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
        diag_update_histories.on("positive", () => diag_update_histories.dismiss());
        diag_update_histories.show();

        // tool function(s) //

        function getUpdateHistoriesStr() {
            if (update_histories_str) return update_histories_str;
            threads.start(function () {
                let str = "";
                let update_info_ver_names_arr = Object.keys(session_params.update_info);
                update_info_ver_names_arr.forEach((ver_name) => {
                    str += ver_name + "\n" + session_params.update_info[ver_name] + "\n";
                });
                update_histories_str = str.slice(0, -2);
                ui.post(() => diag_update_histories.getContentView().setText(update_histories_str));
            });
            return "正在处理中...";
        }
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
    updateDataSource(data_source_key_name, "update", {
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

    let mode = "local";
    if (source.toString().match(/^http/)) mode = "server";

    let diag_restoring = dialogs.build({
        title: "恢复中",
        positive: "终止",
        progress: {
            max: 100,
            showMinMax: false,
        },
        autoDismiss: false,
        canceledOnTouchOutside: false,
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
    } else if (!files.exists(source)) {
        alertContent(diag_restoring, "恢复失败:\n文件不存在", "append");
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
 * @param [params.dialog] {DialogsObject}
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

    if (operation === "init") return session_params[data_source_key_name] = (session_config[data_source_key_name] || session_params[data_source_key_name]).map(magicData);

    if (operation === "rewrite") return rewriteToSessionConfig();

    if (operation.match(/delete|splice/)) {
        if (data_params.length > 2 && !data_params[2]["list_item_name_0"]) data_params[2] = magicData(data_params[2]);
        Array.prototype.splice.apply(session_params[data_source_key_name], data_params);
        return rewriteToSessionConfig();
    }

    if (operation === "update") {
        if (data_params && Object.prototype.toString.call(data_params).slice(8, -1) !== "Array") data_params = [data_params];

        if (!session_params[data_source_key_name]) session_params[data_source_key_name] = [];
        data_params.map(magicData).forEach(value => {
            // {name: 1, age: 2};
            let arr = session_params[data_source_key_name];
            arr.push(value);
        });

        return rewriteToSessionConfig();
    }

    // tool function(s) //

    function magicData(obj) {
        let return_obj = {};
        list_heads[data_source_key_name].forEach((o, i) => {
            let list_item_name = Object.keys(o)[0];
            let list_item_value = obj[list_item_name];
            if (list_item_name === "timestamp") list_item_value = convertTimestamp(list_item_value)[o.mode === "remove" ? "time_str_remove" : "time_str"];
            return_obj["list_item_name_" + i] = list_item_value;
            return_obj[list_item_name] = "list_item_name_" + i; // backup
            return_obj["width_" + i] = o.width ? ~~(o.width * WIDTH) + "px" : -2;
        });
        Object.keys(obj).forEach(key => {
            if (!(key in return_obj)) return_obj[key] = obj[key];
        });
        return return_obj;
    }

    function rewriteToSessionConfig() {
        session_config[data_source_key_name] = [];

        let session_data = session_params[data_source_key_name];
        if (!session_data.length) return saveSession(data_source_key_name, [], quiet_flag);

        let new_data = [];
        session_data.forEach(obj => {
            let o = deepCloneObject(obj);
            Object.keys(o).forEach(key => {
                if (o[key] in o) {
                    let useless_name = o[key];
                    o[key] = o[o[key]];
                    delete o[useless_name];
                }
                if (key.match(/^width_\d$/)) o[key] = undefined;
                if (key === "timestamp") {
                    if (o[key] === "永不") o.timestamp = 0;
                    else if (o[key].match(/^\d{13}$/)) o.timestamp = +o[key];
                    else {
                        let time_nums = o[key].split(/\D+/);
                        o.timestamp = new Date(+time_nums[0], time_nums[1] - 1, +time_nums[2], +time_nums[3], +time_nums[4]).getTime();
                    }
                }
            });
            new_data.push(Object.assign({}, o)); // to remove undefined items
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