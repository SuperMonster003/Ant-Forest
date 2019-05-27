"ui";
try {
    auto.waitFor();
} catch (e) {
    auto();
}

// given that there are bugs with dialogs modules in old auto.js versions like 4.1.0/5 and 4.1.1/2
let dialogs = require("./Modules/__dialogs__pro_v6.js")(runtime, {});

let DEFAULT_AF = require("./Modules/MODULE_DEFAULT_CONFIG").af;
let DEFAULT_UNLOCK = require("./Modules/MODULE_DEFAULT_CONFIG").unlock;

let WIDTH = device.width;
let HEIGHT = device.height;
let storage_cfg = require("./Modules/MODULE_STORAGE").create("af_cfg");
let storage_af = require("./Modules/MODULE_STORAGE").create("af");
let storage_unlock = require("./Modules/MODULE_STORAGE").create("unlock");
let encrypt = new (require("./Modules/MODULE_PWMAP.js"))().pwmapEncrypt;

let session_params = {
    //~ no need to set values here
    //~ as all params will be set/modified automatically
    save_btn_tint_color: null,
    save_btn_text_color: null,
    info_color: null,
    non_break_check_time_area_diag_confirm_delete: null,
    deleted_items_idx: {},
    deleted_items_idx_count: 0,
};

let storage_config = initStorageConfig();
// let session_config = Object.assign({}, storage_config); // shallow copy
// let session_config = JSON.parse(JSON.stringify(storage_config)); // incomplete deep copy
let session_config = deepCloneObject(storage_config); // deep copy
let saveSession = (key, value) => {
    if (key !== undefined) session_config[key] = value;
    let btn_save = session_params["btn_save"];
    needSave() ? btn_save.switch_on() : btn_save.switch_off();
    updateAllValues();
};
let needSave = () => !equalObjects(session_config, storage_config);
let dynamic_views = [];
let updateAllValues = () => dynamic_views.forEach(view => view.updateOpr(view));
let def = undefined;
let defs = {
    item_area_width: ~~(WIDTH * 0.78) + "px",
    sub_head_color: "#03a6ef",
    info_color: "#78909c",
    title_bg_color: "#03a6ef",
    list_title_bg_color: "#afefff",
    btn_on_color: "#ffffff",
    btn_off_color: "#bbcccc",
    split_line_color: "#bbcccc",
    empty_non_break_check_time_area_hint: "*点击添加按钮添加新时间区间*",
};
let pages = [];
let alert_info = {};

initUI();

let homepage = setHomePage("蚂蚁森林");
let self_collect_page = setPage("自收功能");
let friend_collect_page = setPage("收取功能");
let help_collect_page = setPage("帮收功能");
let non_break_check_page = setPage("监测自己能量");
let rank_list_samples_collect_page = setPage("排行榜样本采集");
let auto_unlock_page = setPage("自动解锁");
let blacklist_page = setPage("黑名单管理");
let cover_blacklist_page = setPage("能量罩黑名单", def, def, "no_margin_bottom");
let self_def_blacklist_page = setPage("自定义黑名单", def, parent_view => setButtons(parent_view,
    ["restore", "RESTORE", "OFF", btn_view => {
        let blacklist_backup = session_params.blacklist_by_user;
        let data_source = session_params.data_source;
        if (equalObjects(session_config[data_source], blacklist_backup)) return;
        let diag = dialogs.build({
            title: "恢复列表数据",
            content: "要恢复本次会话开始前的列表数据吗\n\n此操作不可撤销",
            neutral: "查看恢复列表",
            neutralColor: "#88bb88",
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
                    blacklist_backup.forEach(o => items.push("好友昵称: " + o.name, "解除时间: " + convertTimestamp(o.timestamp).time_str, split_line));
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
            session_config[data_source].splice(0, session_config[data_source].length);
            session_params.deleted_items_idx = {};
            session_params.deleted_items_idx_count = 0;
            let remove_btn = parent_view._text_remove.getParent();
            remove_btn.switch_off();
            btn_view.switch_off();
            list_page_view._check_all.setChecked(false);
            blacklist_backup.forEach(value => session_config[data_source].push(Object.assign(value, {checked: false})));
            saveSession("blacklist_by_user", session_config[data_source]);
        });
        diag.show();
    }],
    ["delete_forever", "REMOVE", "OFF", btn_view => {
        if (!session_params.deleted_items_idx_count) return;
        let data_source = session_params.data_source;

        let thread_items_stable = threads.start(function () {
            let old_count = undefined;
            while (session_params.deleted_items_idx_count !== old_count) {
                old_count = session_params.deleted_items_idx_count;
                sleep(50);
            }
        });
        thread_items_stable.join(800);

        let deleted_items_idx_keys = Object.keys(session_params.deleted_items_idx);
        deleted_items_idx_keys.sort((a, b) => +a < +b).forEach(idx => session_params.deleted_items_idx[idx] && session_config[data_source].splice(idx, 1));
        saveSession("blacklist_by_user", session_config[data_source]);
        session_params.deleted_items_idx = {};
        session_params.deleted_items_idx_count = 0;

        let list_page_view = findViewByTag(parent_view, "list_page_view");
        let restore_btn = parent_view._text_restore.getParent();
        if (!equalObjects(session_config[data_source], session_params.blacklist_by_user)) restore_btn.switch_on();
        else restore_btn.switch_off();
        list_page_view._check_all.setChecked(false);
        btn_view.switch_off();
    }],
    ["add_circle", "NEW", "ON", btn_view => {
        let tmp_selected_friends = [];
        let blacklist_selected_friends = [];
        let data_source = session_params.data_source;
        let list_page_view = findViewByTag(parent_view, "list_page_view");

        session_config[data_source].forEach(o => blacklist_selected_friends.push(o.name));

        let diag = dialogs.build({
            title: "添加新数据",
            content: "从好友列表中选择并添加好友\n或手动输入好友昵称",
            items: [" "],
            neutral: "从列表中选择",
            neutralColor: "#88bb88",
            negative: "手动添加",
            negativeColor: "#88bb88",
            positive: "确认添加",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
        diag.on("neutral", () => {
            let diag_add_from_list = dialogs.build({
                title: "列表选择好友",
                content: "",
                neutral: "刷新列表",
                neutralColor: "#26a69a",
                positive: "确认选择",
                items: ["列表为空"],
                itemsSelectMode: "multi",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag_add_from_list.on("neutral", () => {
                engines.execScriptFile("./Ant_Forest_Launcher.js", {
                    arguments: {
                        special_exec_command: "collect_friends_list",
                    },
                });
                diag_add_from_list.dismiss();
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
                let content_info = (friends_list.timestamp ? ("上次刷新: " + convertTimestamp(friends_list.timestamp, "force_return").time_str + "\n") : "") +
                    "当前可添加的好友总数: " + items_len;
                diag_add_from_list.setContent(content_info);
            }
        });
        diag.on("negative", () => {
            let input_ok_flag = true;
            let diag_add_manually = dialogs.build({
                title: "手动添加好友",
                content: "手动添加易出错\n且无法输入特殊字符\n强烈建议使用列表导入功能",
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
            tmp_selected_friends.forEach(name => session_config[data_source].push({
                name: name,
                timestamp: Infinity,
            }));
            if (tmp_selected_friends.length) setTimeout(() => parent_view._list_data.smoothScrollBy(0, Math.pow(10, 5)), 200);
            let restore_btn = list_page_view.getParent()._text_restore.getParent();
            equalObjects(session_config[data_source], session_params.blacklist_by_user) ? restore_btn.switch_off() : restore_btn.switch_on();
            saveSession("blacklist_by_user", session_config[data_source]);
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
    }]),
    "no_margin_bottom");
let message_showing_page = setPage("消息提示");

homepage
    .add("sub_head", new Layout("基本功能"))
    .add("options", new Layout("自收功能", {
        "config_conj": "self_collect_switch",
        "hint": {
            "0": "已关闭",
            "1": "已开启",
        },
        "next_page": self_collect_page,
        "updateOpr": function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("options", new Layout("收取功能", {
        "config_conj": "friend_collect_switch",
        "hint": {
            "0": "已关闭",
            "1": "已开启",
        },
        "next_page": friend_collect_page,
        "updateOpr": function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("options", new Layout("帮收功能", {
        "config_conj": "help_collect_switch",
        "hint": {
            "0": "已关闭",
            "1": "已开启",
        },
        "next_page": help_collect_page,
        "updateOpr": function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("sub_head", new Layout("高级功能"))
    .add("options", new Layout("自动解锁", {
        "config_conj": "auto_unlock_switch",
        "hint": {
            "0": "已关闭",
            "1": "已开启",
        },
        "next_page": auto_unlock_page,
        "updateOpr": function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("options", new Layout("消息提示", {
        "config_conj": "message_showing_switch",
        "hint": {
            "0": "已关闭",
            "1": "已开启",
        },
        "next_page": message_showing_page,
        "updateOpr": function (view) {
            view._hint.text(this.hint[+!!session_config[this.config_conj]]);
        },
    }))
    .add("options", new Layout("黑名单管理", {
        "next_page": blacklist_page,
    }))
    .add("sub_head", new Layout("重置"))
    .add("button", new Layout("还原设置", {
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
                        diag_sub_sub.cancel();
                        diag_sub.cancel();
                        diag.cancel();
                    });
                    diag_sub_sub.show();

                    // tool function(s) //

                    function reset() {
                        let def_DEFAULT = Object.assign({info_icons_sanctuary: []}, DEFAULT_AF, storage_unlock.get("config", {}), isolateBlacklistStorage());
                        session_config = deepCloneObject(def_DEFAULT);
                        storage_config = deepCloneObject(def_DEFAULT);
                        storage_cfg.put("config", DEFAULT_AF);
                        updateAllValues();
                    }
                });
                diag_sub.on("negative", () => diag_sub.cancel());
                diag_sub.show();
            });
            diag.show();
        },
    }))
    .add("sub_head", new Layout("关于"))
    .add("button", new Layout("关于脚本及开发者", {
        hint: "正在读取中...",
        newWindow: function () {
            let local_version = this.view._hint.getText();
            let diag = dialogs.build({
                title: "关于",
                content: "当前本地版本: " + local_version + "\n" +
                    "服务器端版本: ",
                items: ["开发者: " + "SuperMonster003"],
                neutral: "检查更新",
                positive: "返回",
                canceledOnTouchOutside: false,
                autoDismiss: false,
            });
            let checking_update_flag = false;
            diag.on("positive", () => diag.dismiss());
            diag.on("neutral", () => {
                if (checking_update_flag) return;
                checkUpdate();
                alertTitle(diag, "检查更新中 请稍候...", 1500);
            });
            diag.on("item_select", (idx, item, dialog) => app.openUrl("https://github.com/SuperMonster003"));
            diag.show();
            checkUpdate();

            // tool function(s) //

            function checkUpdate() {
                checking_update_flag = true;
                let url_readme = "https://raw.githubusercontent.com/SuperMonster003/Auto.js_Projects/Ant_Forest/README.md";
                let newest_server_version_name = "检查中...";
                let ori_content = diag.getContentView().getText().toString().replace(/([^]+服务器端版本: ).*/, "$1");
                diag.setContent(ori_content + newest_server_version_name);
                threads.start(function () {
                    try {
                        newest_server_version_name = "v" + http.get(url_readme).body.string().match(/版本历史[^]+?v(\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/)[0].split("v")[1];
                    } catch (e) {
                        newest_server_version_name = "检查超时";
                    } finally {
                        diag.setContent(ori_content + newest_server_version_name);
                        checking_update_flag = false;
                    }
                });
            }
        },
        updateOpr: function (view) {
            let current_local_version_name = "";
            try {
                current_local_version_name = "v" + files.read("./Ant_Forest_Launcher.js").match(/version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/)[0].slice(8);
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
        "config_conj": "non_break_check_switch",
        "hint": {
            "0": "已关闭",
            "1": "已开启",
        },
        "next_page": non_break_check_page,
        "updateOpr": function (view) {
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
        "next_page": rank_list_samples_collect_page,
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
        "next_page": rank_list_samples_collect_page,
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
                    contentColor: "#546e7a",
                    inputPrefill: content,
                    neutral: "删除",
                    neutralColor: "#ff3300",
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
                    "示例: 0.6 | 1260  60%\n\n" +
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
                    "3. 本地可能需要保存大量图像数据\n\n" +
                    "建议:\n" +
                    "好友数量大于200使用图像处理\n" +
                    "排行榜滑动卡顿时使用图像处理\n" +
                    "黑名单好友较多时使用图像处理\n" +
                    "布局信息获取失效时用图像处理\n" +
                    "其他情况使用布局分析\n",
                positive: "返回",
                positiveColor: "#4db6ac",
                neutral: "隐藏此提示图标",
                neutralColor: "#a1887f",
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
                neutralColor: "#88bb88",
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
                    neutralColor: "#88bb88",
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
        list_head: [{title: "支付宝好友昵称", width: 0.58}, {title: "黑名单自动解除"}],
        data_source: "blacklist_protect_cover",
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
        list_head: [{title: "支付宝好友昵称", width: 0.58}, {title: "黑名单自动解除"}],
        data_source: "blacklist_by_user",
        list_checkbox: "visible",
        listeners: {
            "_list_data": {
                "item_long_click": function (e, item, idx, item_view, list_view) {
                    item_view._checkbox.checked && item_view._checkbox.click();
                    e.consumed = true;
                    let data_source = session_params.data_source;
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
                        session_config[data_source].splice(idx, 1, new_item);
                        session_params["btn_restore"].switch_on();
                        saveSession("blacklist_by_user", session_config[data_source]);
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
                                    refreshItems(list_item_prefix, convertTimestamp(return_value).time_str);
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
                            value_obj[key_map[0]] = item.name;
                            value_obj[key_map[1]] = convertTimestamp(item.timestamp).time_str;
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
                        session_params.deleted_items_idx[idx] = aim_checked;
                        aim_checked ? session_params.deleted_items_idx_count++ : session_params.deleted_items_idx_count--;
                        session_params.deleted_items_idx_count ? remove_btn_view.switch_on() : remove_btn_view.switch_off();
                        this.view._check_all.setChecked(session_params.deleted_items_idx_count === session_config[session_params.data_source].length);
                    });
                },
            },
            "_check_all": {
                "click": function (view) {
                    let aim_checked = view.checked;
                    let blacklist_len = session_config[session_params.data_source].length;
                    if (!blacklist_len) return view.checked = !aim_checked;

                    session_config[session_params.data_source].forEach((o, idx) => {
                        let o_new = deepCloneObject(o);
                        o_new.checked = aim_checked;
                        session_config[session_params.data_source].splice(idx, 1, o_new);
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
    .add("info", new Layout("长按列表项可编辑项目"))
    .add("info", new Layout("点击标题可排序"))
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
ui.emitter.on("back_pressed", e => {
    let len = pages.length,
        need_save = needSave();
    if (!checkSpecialPagesBeforeJumpBack()) return e.consumed = true;
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
        diag.on("neutral", () => diag.cancel());
        diag.on("negative", () => quitNow());
        diag.on("positive", () => saveNow() && quitNow());

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
    this.title = title;
    this.values = params.values;
    this.sub_head_color = params.sub_head_color;
    this.info_color = params.info_color;
    this.config_conj = params.config_conj;
    this.next_page = params.next_page;
    this.data_source = params.data_source;
    this.list_head = params.list_head;
    this.list_checkbox = params.list_checkbox;
    this.hint = params.hint;
    this.map = params.map;
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

// tool function(s) //

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

function initStorageConfig() {
    let storage_config = Object.assign({info_icons_sanctuary: []}, DEFAULT_AF, storage_cfg.get("config", {}));
    storage_cfg.put("config", storage_config); // to refill storage data
    storage_config = Object.assign({}, storage_config, storage_unlock.get("config", {}), isolateBlacklistStorage());
    return storage_config;
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
    new_view._back_btn_area.on("click", () => checkSpecialPagesBeforeJumpBack() && pageJump("back"));
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

        if (type === "split_line") return setSplitLine(item_params);
        if (type === "sub_head") return setSubHead(item_params);
        if (type === "info") return setInfo(item_params);
        if (type === "list") return setList(item_params);

        let new_view = ui.inflate(
            <horizontal id="_item_area" padding="16 8" gravity="left|center">
                <vertical id="_content" w="{{defs.item_area_width}}" h="40" gravity="left|center">
                    <text id="_title" textColor="#111111" textSize="16"/>
                </vertical>
            </horizontal>);

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
        if (typeof title === "string") new_view._title.text(title);

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
                <vertical>
                    <img padding="10 0 0 0" src="@drawable/ic_chevron_right_black_48dp" height="31" bg="?selectableItemBackgroundBorderless" tint="#999999"/>
                </vertical>
            );
            new_view._item_area.addView(opt_view);
            item_params.view = new_view;
            new_view._item_area.on("click", () => item_params.next_page && pageJump("next", item_params.next_page));
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

        if (item_params.updateOpr) new_view.updateOpr = item_params.updateOpr.bind(new_view);

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
            let title = item["title"];
            let info_color = item["info_color"] || defs["info_color"];
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
            session_params.first_list_width = ~~((list_head[0].width || 0.3) * WIDTH) + "px";
            session_params.list_checkbox = item_params["list_checkbox"];
            let data_source = item_params["data_source"] || "unknown_key_name"; // just a key name
            session_params.data_source = data_source;

            let new_view = ui.inflate(
                <vertical>
                    <horizontal id="_list_title_bg">
                        <horizontal h="50" w="{{session_params.first_list_width}}" margin="8 0 0 0">
                            <checkbox id="_check_all" visibility="{{session_params.list_checkbox}}" layout_gravity="left|center" clickable="false"/>
                        </horizontal>
                    </horizontal>
                    <vertical>
                        <list id="_list_data" fastScrollEnabled="true" focusable="true" stackFromBottom="true" scrollbars="none">
                            <horizontal>
                                <horizontal w="{{session_params.first_list_width}}">
                                    <checkbox id="_checkbox" checked="{{this.checked}}" h="50" margin="8 0 -16" layout_gravity="left|center" clickable="false"/>
                                    <text text="{{this.name}}" h="50" textSize="15" margin="16 0 0" ellipsize="end" lines="1" layout_gravity="left|center" gravity="left|center"/>
                                </horizontal>
                                <text text="{{convertTimestamp(+this.timestamp).time_str}}" textSize="15" h="50" margin="8 0 0 0" layout_gravity="left|center" gravity="left|center"/>
                            </horizontal>
                        </list>
                    </vertical>
                </vertical>
            );

            new_view._list_data.setDataSource(session_config[data_source]);
            new_view._list_title_bg.attr("bg", list_title_bg_color);
            new_view.setTag("list_page_view");
            list_head.forEach((title_obj, idx) => {
                let list_title_view = idx ? ui.inflate(
                    <text textSize="15"/>
                ) : ui.inflate(
                    <text textSize="15" padding="{{session_params.list_checkbox === 'gone' ? 8 : 0}} 0 0 0"/>
                );
                list_title_view.setText(title_obj.title);
                list_title_view.on("click", () => {
                    if (!session_config[data_source][0]) return;
                    let key_name = Object.keys(session_config[data_source][0])[idx];
                    session_params["list_sort_flag_" + key_name] = session_params["list_sort_flag_" + key_name] || 1;
                    let ascend_data = session_config[data_source].sort((a, b) => b[key_name] < a[key_name]);
                    session_config[data_source] = session_params["list_sort_flag_" + key_name] < 0 ? ascend_data.sort(() => 1) : ascend_data;
                    session_params["list_sort_flag_" + key_name] *= -1;
                });

                if (idx === 0) new_view["_check_all"].getParent().addView(list_title_view);
                else new_view["_list_title_bg"].addView(list_title_view);

                list_title_view.attr("gravity", "left|center");
                list_title_view.attr("layout_gravity", "left|center");
                list_title_view.attr("ellipsize", "end");
                list_title_view.attr("lines", "1");
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
        smoothScrollMenu("full_right");
        return pages.pop();
    }
    pages.push(next_page);
    smoothScrollMenu("full_left");
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
        for (let i = 0, len = obj_a.length; i < len; i += 1) {
            if (!equalObjects(obj_a[i], obj_b[i])) return false;
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

function smoothScrollMenu(shifting, duration) {

    if (pages.length < 2) return;

    let len = pages.length;

    let main_view = pages[len - 2],
        sub_view = pages[len - 1];

    let parent = ui.main.getParent();

    duration = duration || 120;

    try {

        if (shifting === "full_left") {
            shifting = [WIDTH, 0];
            parent.addView(sub_view);
            sub_view && sub_view.scrollBy(-WIDTH, 0);
        } else if (shifting === "full_right") {
            shifting = [-WIDTH, 0];
        }

        let dx = shifting[0],
            dy = shifting[1];

        let each_move_time = 10;

        let neg_x = dx < 0,
            neg_y = dy < 0;

        let abs = num => num < 0 && -num || num;
        dx = abs(dx);
        dy = abs(dy);

        let ptx = dx && Math.ceil(each_move_time * dx / duration) || 0,
            pty = dy && Math.ceil(each_move_time * dy / duration) || 0;

        let scroll_interval = setInterval(function () {
            if (!dx && !dy) return;
            let move_x = ptx && (dx > ptx ? ptx : (ptx - (dx % ptx))),
                move_y = pty && (dy > pty ? pty : (pty - (dy % pty)));
            let scroll_x = neg_x && -move_x || move_x,
                scroll_y = neg_y && -move_y || move_y;
            sub_view && sub_view.scrollBy(scroll_x, scroll_y);
            main_view.scrollBy(scroll_x, scroll_y);
            dx -= ptx;
            dy -= pty;
        }, each_move_time);
        setTimeout(() => {
            if (shifting[0] === -WIDTH && sub_view) {
                sub_view.scrollBy(WIDTH, 0);
                let child_count = parent.getChildCount();
                parent.removeView(parent.getChildAt(--child_count));
            }
            clearInterval(scroll_interval);
        }, duration + 300); // 300: a safe interval just in case
    } catch (e) {
    }
}

function saveNow() {
    let session_config_mixed = deepCloneObject(session_config);
    writeUnlockStorage();
    writeBlacklist();
    storage_cfg.put("config", session_config_mixed); // only "cfg" reserved now (without unlock, blacklist, etc)
    storage_config = deepCloneObject(session_config);
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
}

function alertTitle(dialog, message, duration) {
    alert_info[dialog] = alert_info[dialog] || {};
    alert_info["message_showing"] ? alert_info["message_showing"]++ : (alert_info["message_showing"] = 1);

    let ori_text = alert_info[dialog].ori_text || "",
        ori_text_color = alert_info[dialog].ori_text_color || "",
        ori_bg_color = alert_info[dialog].ori_bg_color || "";

    let ori_title_view = dialog.getTitleView();
    if (!ori_text) {
        ori_text = ori_title_view.getText();
        alert_info[dialog].ori_text = ori_text;
    }
    if (!ori_text_color) {
        ori_text_color = ori_title_view.getTextColors().colors[0];
        alert_info[dialog].ori_text_color = ori_text_color;
    }

    if (!ori_bg_color) {
        let bg_color_obj = ori_title_view.getBackground();
        ori_bg_color = bg_color_obj && bg_color_obj.getColor() || -1;
        alert_info[dialog].ori_bg_color = ori_bg_color;
    }

    setTitleInfo(dialog, message, colors.parseColor("#c51162"), colors.parseColor("#ffeffe"));

    setTimeout(() => {
        alert_info["message_showing"]--;
        if (alert_info["message_showing"]) return;
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

function checkSpecialPagesBeforeJumpBack() {
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

// temporarily placed here //
function convertTimestamp(time_param, force_return_flag) {
    let timestamp = +time_param;
    let time_str = "";
    let time = new Date();
    if (!force_return_flag) {
        if (timestamp === Infinity || timestamp === 0) time_str = "永不";
        else if (!timestamp) time_str = "时间戳无效";
        else if (timestamp <= time.getTime()) time_str = "下次运行";
    }
    if (!time_str) {
        time.setTime(timestamp);
        let fillZero = num => ("0" + num).slice(-2);
        let yy = time.getFullYear();
        let MM = fillZero(time.getMonth() + 1);
        let dd = fillZero(time.getDate());
        let hh = fillZero(time.getHours());
        let mm = fillZero(time.getMinutes());
        time_str = yy + "\/" + MM + "\/" + dd + " " + hh + ":" + mm;
    }

    return {
        time_str: time_str,
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