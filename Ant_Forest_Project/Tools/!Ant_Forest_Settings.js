"ui";
auto.waitFor();

// given that there are bugs with dialogs modules in old auto.js versions like 4.1.0/5 and 4.1.1/2
let dialogs = require("../Modules/__dialogs__pro_v6.js")(runtime, {});

let DEFAULT = require("../Modules/MODULE_DEFAULT_CONFIG").af,
    DEFAULT_UNLOCK = require("../Modules/MODULE_DEFAULT_CONFIG").unlock;

let WIDTH = device.width;
let HEIGHT = device.height;
let storage_cfg = require("../Modules/MODULE_STORAGE").create("af_cfg");
let storage_af = require("../Modules/MODULE_STORAGE").create("af");
let storage_unlock = require("../Modules/MODULE_STORAGE").create("unlock");
let encrypt = new (require("../Modules/MODULE_PWMAP.js"))().pwmapEncrypt;
let storage_config = initStorageConfig();
// let session_config = Object.assign({}, storage_config); // shallow copy
// let session_config = JSON.parse(JSON.stringify(storage_config)); // incomplete deep copy
let session_config = deepCloneObject(storage_config); // deep copy
let saveSession = () => null;
let needSave = () => !equalObjects(session_config, storage_config);
let dynamic_views = [];
let updateAllValues = () => dynamic_views.forEach(view => view.updateOpr(view));
let session_params = {
    //~ no need to set values here
    //~ as all params will be set/modified automatically
    "save_btn_tint_color": null,
    "save_btn_text_color": null,
    "info_color": null,
    "non_break_check_time_area_diag_confirm_delete": null,
};
let def = undefined;
let defs = {
    "item_area_width": ~~(WIDTH * 0.78) + "px",
    "sub_head_color": "#03a6ef",
    "info_color": "#78909c",
    "title_bg_color": "#03a6ef",
    "save_btn_on_color": "#ffffff",
    "save_btn_off_color": "#bbcccc",
    "empty_non_break_check_time_area_hint": "*点击添加按钮添加新时间区间*",
};
let pages = [];
let alert_info = {};

initUI();

let homepage = setHomePage("Ant_Forest");
let help_collect_page = setPage("帮收功能");
let non_break_check_page = setPage("监测自己能量");
let auto_unlock_page = setPage("自动解锁");
let blacklist_page = setPage("黑名单管理");
let cover_blacklist_page = setPage("能量罩黑名单");
let self_def_blacklist_page = setPage("自定义黑名单");

homepage.add("sub_head", new Layout("基本功能"));
homepage.add("options", new Layout("帮收功能", {
    "config_conj": "help_collect_switch",
    "hint": {
        "0": "已关闭",
        "1": "已开启",
    },
    "next_page": help_collect_page,
    "updateOpr": function (view) {
        view._hint.text(this.hint[+!!session_config[this.config_conj]]);
    },
}));
homepage.add("options", new Layout("监测自己能量", {
    "config_conj": "non_break_check_switch",
    "hint": {
        "0": "已关闭",
        "1": "已开启",
    },
    "next_page": non_break_check_page,
    "updateOpr": function (view) {
        view._hint.text(this.hint[+!!session_config[this.config_conj]]);
    },
}));
homepage.add("sub_head", new Layout("高级功能"));
homepage.add("options", new Layout("自动解锁", {
    "config_conj": "auto_unlock_switch",
    "hint": {
        "0": "已关闭",
        "1": "已开启",
    },
    "next_page": auto_unlock_page,
    "updateOpr": function (view) {
        view._hint.text(this.hint[+!!session_config[this.config_conj]]);
    },
}));
homepage.add("options", new Layout("黑名单管理", {
    "next_page": blacklist_page,
}));

homepage.add("sub_head", new Layout("重置"));
homepage.add("button", new Layout("还原设置", {
    new_window: () => {
        let diag = dialogs.build({
            title: "还原初始设置",
            content: "此操作无法撤销\n\n以下功能内部设置不会被还原:\n1. 自动解锁",
            neutral: "了解内部配置",
            negative: "放弃",
            positive: "全部还原",
            canceledOnTouchOutside: false,
            autoDismiss: false,
        });
        diag.on("neutral", () => {
            let diag_keep_internals = dialogs.build({
                title: "还原时保留内部设置",
                content: "有些功能属于共享功能\n-> 如自动解锁功能\n\n还原时只还原此功能的总开关状态\n而不会改变内部的配置\n-> 如自动解锁功能的解锁密码",
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
                    let def_DEFAULT = Object.assign({}, DEFAULT, storage_unlock.get("config", {}));
                    session_config = deepCloneObject(def_DEFAULT);
                    storage_config = deepCloneObject(def_DEFAULT);
                    storage_cfg.put("config", DEFAULT);
                    updateAllValues();
                }
            });
            diag_sub.on("negative", () => diag_sub.cancel());
            diag_sub.show();
        });
        diag.show();
    },
}));

help_collect_page.add("switch", new Layout("总开关", {
    config_conj: "help_collect_switch",
    listeners: {
        "_switch": {
            "check": function (state) {
                saveSession(this.config_conj, !!state);
                let parent = this.view.getParent();
                let child_count = parent.getChildCount();
                while (child_count-- > 2) {
                    parent.getChildAt(child_count).setVisibility(state ? 0 : 5);
                }
            },
        },
    },
    updateOpr: function (view) {
        let session_conf = !!session_config[this.config_conj];
        view["_switch"].setChecked(session_conf);
    },
}));
help_collect_page.add("sub_head", new Layout("高级设置"));
help_collect_page.add("button", new Layout("检测密度", {
    config_conj: "help_collect_intensity",
    hint: "hint",
    new_window: function () {
        let diag = dialogs.build({
            title: "帮收功能检测密度",
            content: "好友森林橙色能量球图片样本采集密度",
            inputHint: "{x|10<=x<=20,x∈N*}",
            neutral: "使用默认值",
            negative: "返回",
            positive: "确认修改",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
        diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT[this.config_conj].toString()));
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
}));
help_collect_page.add("button", new Layout("颜色色值", {
    config_conj: "help_collect_color",
    hint: "hint",
    new_window: function () {
        let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/,
            _lim255 = regexp_num_0_to_255.source;
        let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
        let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
        let current_color = undefined;
        let diag = dialogs.build({
            title: "帮收功能颜色色值",
            content: "好友森林识别橙色能量球的参照色值\n\n示例:\nrgb(67,160,71)\n#43a047",
            inputHint: "rgb(RR,GG,BB) | #RRGGBB",
            neutral: "使用默认值",
            negative: "返回",
            positive: "确认修改",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
        diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT[this.config_conj].toString()));
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
}));
help_collect_page.add("button", new Layout("颜色检测阈值", {
    config_conj: "help_collect_color_threshold",
    hint: "hint",
    new_window: function () {
        let diag = dialogs.build({
            title: "帮收功能颜色检测阈值",
            content: "好友森林识别橙色能量球的参照色值阈值",
            inputHint: "{x|28<=x<=83,x∈N*}",
            neutral: "使用默认值",
            negative: "返回",
            positive: "确认修改",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
        diag.on("neutral", () => diag.getInputEditText().setText(DEFAULT[this.config_conj].toString()));
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
}));
non_break_check_page.add("switch", new Layout("总开关", {
    config_conj: "non_break_check_switch",
    listeners: {
        "_switch": {
            "check": function (state) {
                saveSession(this.config_conj, !!state);
                let parent = this.view.getParent();
                let child_count = parent.getChildCount();
                while (child_count-- > 2) {
                    parent.getChildAt(child_count).setVisibility(state ? 0 : 5);
                }
            },
        },
    },
    updateOpr: function (view) {
        let session_conf = !!session_config[this.config_conj];
        view["_switch"].setChecked(session_conf);
    },
}));
non_break_check_page.add("sub_head", new Layout("基本设置"));
non_break_check_page.add("button", new Layout("管理时间区间", {
    config_conj: "non_break_check_time_area",
    hint: "hint",
    new_window: function () {
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
}));
auto_unlock_page.add("switch", new Layout("总开关", {
    config_conj: "auto_unlock_switch",
    listeners: {
        "_switch": {
            "check": function (state) {
                saveSession(this.config_conj, !!state);
                let parent = this.view.getParent();
                let child_count = parent.getChildCount();
                while (child_count-- > 2) {
                    parent.getChildAt(child_count).setVisibility(state ? 0 : 5);
                }
            },
        },
    },
    updateOpr: function (view) {
        let session_conf = !!session_config[this.config_conj];
        view["_switch"].setChecked(session_conf);
    },
}));
auto_unlock_page.add("sub_head", new Layout("基本设置"));
auto_unlock_page.add("button", new Layout("锁屏密码", {
    config_conj: "unlock_code",
    hint: "hint",
    new_window: function () {
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
                    content: "共线的连续线段组只需保留首末两点\n\n3×3 - 1,2,3,5,7,8,9 -> 1,3,7,9\n4×4 - 1,2,3,4,8,12,16 -> 1,4,16\n5×5 - 1,2,3,4,5,6 -> 1,5,6\n\n*此功能暂未实现\nsince Mar 25, 2019",
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
}));
auto_unlock_page.add("sub_head", new Layout("高级设置"));
auto_unlock_page.add("button", new Layout("最大尝试次数", {
    config_conj: "unlock_max_try_times",
    hint: "hint",
    new_window: function () {
        let diag = dialogs.build({
            title: "设置解锁最大尝试次数",
            inputHint: "{x|3<=x<=15,x∈N*}",
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
            if (value > 15 || value < 3) return alertTitle(dialog, "输入值范围不合法");
            saveSession(this.config_conj, value);
            diag.dismiss();
        });
        diag.show();
    },
    updateOpr: function (view) {
        view._hint.text((session_config[this.config_conj] || DEFAULT_UNLOCK[this.config_conj]).toString());
    },
}));
auto_unlock_page.add("button", new Layout("图案解锁点阵边长", {
    config_conj: "unlock_pattern_size",
    hint: "hint",
    new_window: function () {
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
}));
blacklist_page.add("options", new Layout("能量罩黑名单", {
    hint: "hint",
    next_page: cover_blacklist_page,
    updateOpr: function (view) {
        let amount = 0;
        let blacklist = storage_af.get("blacklist", {});
        for (let name in blacklist) {
            if (blacklist.hasOwnProperty(name)) {
                if (blacklist[name].reason === "protect_cover") amount += 1;
            }
        }
        view._hint.text(amount ? "包含成员: " + amount + "人" : "空名单");
    },
}));
blacklist_page.add("options", new Layout("自定义黑名单", {
    hint: "hint",
    next_page: self_def_blacklist_page,
    updateOpr: function (view) {
        let amount = 0;
        let blacklist = storage_af.get("blacklist", {});
        for (let name in blacklist) {
            if (blacklist.hasOwnProperty(name)) {
                if (blacklist[name].reason === "by_user") amount += 1;
            }
        }
        view._hint.text(amount ? "包含成员: " + amount + "人" : "空名单");
    },
}));
// cover_blacklist_page.add("list", new Layout("能量罩黑名单成员", {
//     list_head: ["支付宝好友昵称", "黑名单自动解除"],
//     data_source: (function () {
//         let blacklist = storage_af.get("blacklist", {});
//         let cover_blacklist = [];
//         for (let name in blacklist) {
//             if (blacklist.hasOwnProperty(name)) {
//                 if (blacklist[name].reason === "protect_cover") cover_blacklist.push({
//                     name: name,
//                     timestamp: blacklist[name].timestamp,
//                 });
//             }
//         }
//         return cover_blacklist;
//     })(),
// }));



ui.emitter.on("back_pressed", e => {
    let len = pages.length,
        need_save = needSave();
    if (!checkSpecialPages()) return e.consumed = true;
    if (len === 1 && !need_save) return quitNow(); // "back" function
    e.consumed = true; // make default "back" dysfunctional
    len === 1 && need_save ? showDialog() : pageJump("back");

    // tool function(s) //

    function showDialog() {
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
        diag.on("positive", () => ~clickSaveBtn() && quitNow());

        // let ori_content = diag.getContentView().getText().toString();
        // diag.setContent(ori_content + "\n\n您还可以:");

        diag.show();
    }

    function checkSpecialPages() {
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

    function quitNow() {
        if (storage_af.get("af_postponed")) {
            toast("配置结束\n即将运行蚂蚁森林");
            engines.execScriptFile("./!Ant_Forest.js");
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
    this.sub_head_color = params.sub_head_color;
    this.info_color = params.info_color;
    this.config_conj = params.config_conj;
    this.next_page = params.next_page;
    this.hint = params.hint;
    if (params.new_window) {
        Object.defineProperties(this, {
            showWindow: {
                get: () => params.new_window.bind(this),
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
    if (classOfObj === "Null" || classOfObj !== "Object") return obj;
    let new_obj = classOfObj === "Array" ? [] : {};
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            new_obj[i] = classOfObj === "Array" ? obj[i] : deepCloneObject(obj[i]);
        }
    }
    return new_obj;
}

function initStorageConfig() {
    let storage_config = Object.assign({}, storage_cfg.get("config", {}), storage_unlock.get("config", {}));
    if (!equalObjects(storage_config, DEFAULT)) {
        storage_config = Object.assign({}, DEFAULT, storage_config);
        storage_cfg.put("config", storage_config); // to fill storage data
    }
    return storage_config;
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
    let homepage = setPage(home_title, def, setSaveBtn);
    saveSession = _saveSession;
    ui.main.getParent().addView(homepage);
    pages[0] = homepage;
    return homepage;

    // tool function(s) //

    function setSaveBtn(new_view) {
        let save_btn = getLayoutSaveBtn("OFF");
        new_view._title_text.setWidth(~~(552 * WIDTH / 720));
        new_view._title_bg.addView(save_btn);
    }

    function _saveSession(key, value) {
        if (key !== undefined) session_config[key] = value;
        let need_save_flag = needSave();
        reDrawSaveBtn(need_save_flag ? "ON" : "OFF");
        updateAllValues();
    }

    function reDrawSaveBtn(switch_state) {
        let parent = homepage.icon_save_img.getParent();
        parent.removeAllViews();
        parent.addView(getLayoutSaveBtn(switch_state));
    }

    function getLayoutSaveBtn(switch_state) {
        let view,
            on_view = saveBtnView(defs.save_btn_on_color, "#ffffff"),
            off_view = saveBtnView(defs.save_btn_off_color, "#bbcccc");

        view = switch_state === "ON" ? on_view : off_view;

        view.icon_save_text.on("click", () => {
            if (!needSave()) return;
            clickSaveBtn();
            reDrawSaveBtn("OFF");
            toast("已保存");
        });

        return view;

        // tool function(s) //

        function saveBtnView(icon_tint_color, save_text_color) {
            session_params.save_btn_tint_color = icon_tint_color;
            session_params.save_btn_text_color = save_text_color;
            return ui.inflate(
                <vertical margin="13 0">
                    <img id="icon_save_img" src="@drawable/ic_save_black_48dp" width="31" bg="?selectableItemBackgroundBorderless" tint="{{session_params.save_btn_tint_color}}"/>
                    <text id="icon_save_text" text="SAVE" gravity="center" textSize="10" textColor="{{session_params.save_btn_text_color}}" textStyle="bold" marginTop="-35" h="40" gravity="bottom|center"/>
                </vertical>
            );
        }
    }
}

function setPage(title, title_bg_color, additions) {
    title_bg_color = title_bg_color || defs["title_bg_color"];
    let new_view = ui.inflate(<vertical></vertical>);
    new_view.addView(ui.inflate(
        <linear id="_title_bg">
            <vertical id="back_btn_area" margin="8 6 -10 -10" visibility="gone">
                <img src="@drawable/ic_chevron_left_black_48dp" width="31" bg="?selectableItemBackgroundBorderless" tint="#ffffff"/>
                <text id="back_btn_text" text=" " gravity="center" textSize="10" textStyle="bold" marginTop="-45" h="45" gravity="bottom|center"/>
            </vertical>
            <text id="_title_text" textColor="#ffffff" textSize="19" textStyle="bold" margin="16"/>
        </linear>
    ));
    new_view._title_text.text(title);
    let title_bg = typeof title_bg_color === "string" ? colors.parseColor(title_bg_color) : title_bg_color;
    new_view._title_bg.setBackgroundColor(title_bg);

    if (additions) typeof additions === "function" ? additions(new_view) : additions.forEach(f => f(new_view));

    new_view.addView(ui.inflate(<ScrollView>
        <vertical id="scroll_view"></vertical>
    </ScrollView>));
    new_view.scroll_view.addView(ui.inflate(<frame>
        <frame margin="0 0 0 8"></frame>
    </frame>));

    new_view.add = (type, item_params) => {
        let sub_view = setItem(type, item_params);
        new_view.scroll_view.addView(sub_view);
        if (sub_view.updateOpr) dynamic_views.push(sub_view);
    };
    return new_view;

    // tool function(s) //

    function setItem(type, item_params) {

        if (type === "sub_head") return setSubHead(item_params);
        if (type === "info") return setInfo(item_params);
        if (type === "list") return setList(item_params);

        let new_view = ui.inflate(
            <horizontal id="_item_area" padding="16 8" gravity="left|center">
                <vertical id="_content" w="{{defs.item_area_width}}" h="40" gravity="left|center">
                    <text id="_title" textColor="#111111" textSize="16"/>
                </vertical>
            </horizontal>);

        let title = item_params["title"];
        new_view._title.text(title);

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

        if (type === "switch") {
            let sw_view = ui.inflate(<Switch id="_switch" checked="true"/>);
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
                    <img margin="19 0" src="@drawable/ic_chevron_right_black_48dp" width="31" bg="?selectableItemBackgroundBorderless" tint="#999999"/>
                </vertical>
            );
            new_view._item_area.addView(opt_view);
            item_params.view = new_view;
            new_view._item_area.on("click", () => item_params.next_page && pageJump("next", item_params.next_page));
        } else if (type === "button") {
            new_view._item_area.on("click", () => item_params.showWindow());
        }

        if (item_params.updateOpr) new_view.updateOpr = item_params.updateOpr.bind(new_view);

        return new_view;

        // tool function(s) //

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
            let title = item["title"],
                info_color = item["info_color"] || defs["info_color"];
            session_params.info_color = info_color;

            let new_view = ui.inflate(
                <linear>
                    <img src="@drawable/ic_info_outline_black_48dp" width="17" margin="16 1 -12 0" tint="{{session_params.info_color}}"></img>
                    <text id="_info_text" textSize="13" margin="16"/>
                </linear>
            );
            new_view._info_text.text(title);
            let title_color = typeof info_color === "string" ? colors.parseColor(info_color) : sub_head_color;
            new_view._info_text.setTextColor(title_color);

            return new_view;
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

    duration = duration || 180;

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
        }, duration + 200); // 200: a safe interval just in case
    } catch (e) {
    }
}

function clickSaveBtn() {
    let session_config_without_unlock = deepCloneObject(session_config);
    writeUnlockStorage();
    storage_cfg.put("config", session_config_without_unlock);
    storage_config = deepCloneObject(session_config);

    // tool function(s) //

    function writeUnlockStorage() {
        let ori_config = deepCloneObject(DEFAULT_UNLOCK),
            tmp_config = {};
        for (let i in ori_config) {
            if (ori_config.hasOwnProperty(i)) {
                tmp_config[i] = session_config[i];
                delete session_config_without_unlock[i];
            }
        }
        storage_unlock.put("config", tmp_config);
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

    setTitleInfo(dialog, message, colors.parseColor("#c51162"), colors.parseColor("#ffcdd2"));

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