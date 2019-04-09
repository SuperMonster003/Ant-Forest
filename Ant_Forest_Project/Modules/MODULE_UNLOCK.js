/**
 @description module for unlocking your phone
 @author e1399579 (lead author)
 @author SuperMonster003 (corresponding author)
 */

auto();

/**
 * bug versions not able to use dialogs.build({inputHint: xxx}) function
 * @type {string[]}
 */
let bug_dialogs_inputHint_Versions = ["4.1.1 Alpha2", "Pro 7.0.0-1", "Pro 7.0.0-2"];

function Unlock() {
    let PWMAP = require("./MODULE_PWMAP.js"),
        storage = require("./MODULE_STORAGE.js").create("unlock"),
        encrypt = new PWMAP().pwmapEncrypt,
        decrypt = new PWMAP().pwmapDecrypt;

    let storage_config = storage.get("config", {});
    let password = decrypt(storage_config.password) || "",
        pattern_size = storage_config.pattern_size, // could be undefined
        max_try_times = storage_config.max_try_times; // could be undefined

    if (!storage_config.no_longer_prompt) unlockConfigWizard();

    this.is_screen_on = device.isScreenOn();

    this.getVerName = getVerName;

    this.unlock = function () {

        let safe_max_wakeup_times = 60; // 30 sec
        while (!device.isScreenOn() && safe_max_wakeup_times--) ~device.wakeUp() && sleep(500);
        if (safe_max_wakeup_times < 0) ~console.error("屏幕亮起失败") && exit();

        let Robot = require("./Robot_e1399579.js"),
            Secure = require("./Secure_e1399579.js");
        new Secure(new Robot(max_try_times), max_try_times).openLock(password, pattern_size);
    };

    function unlockConfigWizard() {
        let ver_autojs = getVerName("org.autojs.autojs");
        let ver_autojs_pro = getVerName("org.autojs.autojspro");

        let inputHintBugCheck = ver_name => ver_autojs && ~bug_dialogs_inputHint_Versions.indexOf(ver_name);
        let bug_inputHint = inputHintBugCheck(ver_autojs) || inputHintBugCheck(ver_autojs_pro) || undefined;

        let config = {},
            config_now_flag = true,
            no_longer_prompt = storage_config.no_longer_prompt;

        let alert_info = {};

        let thread_step00 = threads.start(function () {

            let step_00 = dialogs.build({
                title: "自动解锁功能未配置",
                content: "此功能用于锁屏状态下的自动解锁\n需要现在配置吗\n\n当前使用: 默认配置",
                positive: "立即配置",
                negative: "放弃",
                neutral: "查看默认配置",
                autoDismiss: false,
                canceledOnTouchOutside: false,
                checkBoxPrompt: "不再提示",
            }).on("check", checked => {
                config_now_flag = !checked;
                no_longer_prompt = !!checked;
            }).on("neutral", () => {
                dialogs.build({
                    title: "自动解锁功能默认配置",
                    content: "1. 锁屏密码: (空)\n2. 最大尝试次数: 10\n3. 图案解锁点阵边长: 3",
                    positive: "关闭",
                }).show();
            }).on("negative", () => {
                config_now_flag = false;
                storage_config.no_longer_prompt = no_longer_prompt;
                step_00.cancel();
            }).on("positive", () => {
                if (!config_now_flag) return alertTitle(step_00, "请取消勾选\"不再提示\"选项");
                step_00.cancel();
            });

            step_00.show();
        });

        thread_step00.join();

        let thread_sub_steps = threads.start(function () {

            let common_steps_params = {
                positive: "下一步",
                positiveColor: "#0099ee",
                negative: "上一步",
                negativeColor: "#777799",
                neutral: "放弃配置",
                neutralColor: "#777799",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            };

            let step_01_prop = {
                title: "输入锁屏解锁密码",
                negative: "查看示例",
                negativeColor: "#88bb88",
                content: "--  Step  1 / 3  --\n\n密码长度不小于4位\n无密码直接点击下一步\n\n若采用图案解锁方式\n点数大于9需使用逗号分隔",
                inputHint: "密码将以密文形式存储在本地",
            };
            if (bug_inputHint) {
                step_01_prop.content += "\n\n点击扑克牌花色设置密码\n密码将以密文形式存储在本地";
                step_01_prop.items = ["\u2665\u2660\u2666\u2663"];
            }
            let step_01 = dialogs.build(Object.assign({}, common_steps_params, step_01_prop));
            step_01.on("neutral", () => step_01.cancel());
            step_01.on("negative", () => {
                dialogs.build({
                    title: "锁屏密码示例",
                    content: "滑动即可解锁: (留空)\n\nPIN解锁: 1001\n\n密码解锁: 10btv69\n\n图案解锁: (点阵序号从1开始)\n3×3点阵 - 1235789 或 1,2,3,5,7,8,9\n4×4点阵 - 1,2,3,4,8,12,16\n注: 点阵密码可简化",
                    positive: "关闭",
                    neutral: "了解点阵简化",
                    neutralColor: "#88bb88",
                }).on("neutral", () => {
                    dialogs.build({
                        title: "图案解锁密码简化",
                        content: "共线的连续线段组只需保留首末两点\n\n3×3 - 1,2,3,5,7,8,9 -> 1,3,7,9\n4×4 - 1,2,3,4,8,12,16 -> 1,4,16\n5×5 - 1,2,3,4,5,6 -> 1,5,6\n\n*此功能暂未实现\nsince Mar 25, 2019",
                        positive: "关闭",
                    }).show();
                }).show();
            });
            step_01.on("positive", () => {
                password = bug_inputHint ? password : step_01.getInputEditText().getText().toString();
                if (password && password.length < 4) return alertTitle(step_01, "密码长度不小于4位");
                config["password"] = encrypt(password);
                step_02.show();
                step_01.cancel();
            });
            if (bug_inputHint) {
                let ori_items_text = step_01.getItems().toArray()[0];
                step_01.on("item_select", () => {
                    dialogs.rawInput("输入锁屏解锁密码", "", input => {
                        password = input;
                        step_01.setItems([password ? Array(9).join("*") : ori_items_text + " (将使用空密码)"]);
                    });
                });
            }

            let step_02_default_value = max_try_times || 10;
            let step_02_prop = {
                title: "设置解锁最大尝试次数",
                content: "--  Step  2 / 3  --\n\n当前值: " + step_02_default_value,
                inputHint: "设置新值或跳过此步配置",
                positive: "跳过",
            };
            let try_times_range = [3, 30];
            if (bug_inputHint) {
                let items = [];
                for (let i = 0, j = try_times_range[0]; j <= try_times_range[1]; i += 1, j += 1) {
                    items[i] = j + "";
                }
                step_02_prop.positive = "下一步";
                step_02_prop.items = items;
                step_02_prop.itemsSelectMode = "single";
                step_02_prop.itemsSelectedIndex = items.indexOf(step_02_default_value);
            }
            let step_02 = dialogs.build(Object.assign({}, common_steps_params, step_02_prop));
            step_02.on("neutral", () => {
                step_02.cancel();
            });
            step_02.on("negative", () => {
                step_01.show();
                step_02.cancel();
            });
            step_02.on("positive", () => {
                config["max_try_times"] = max_try_times;
                step_03.show();
                step_02.cancel();
            });
            if (bug_inputHint) {
                step_02.on("single_choice", (idx, item) => {
                    max_try_times = item - 0;
                });
            } else {
                let ori_content = step_02.getContentView().getText().toString().replace(/(.+)(?= ->).*/g, "$1");
                step_02.on("input_change", (dialog, input) => {
                    if (input) {
                        step_02.setActionButton("positive", "下一步");
                        let parsed = parseInt(input - 0);
                        if (!parsed && parsed !== 0) input = "[输入不合法]";
                        else input = parsed;
                        let overflow = "",
                            max = try_times_range[1],
                            min = try_times_range[0];
                        if (input > max) {
                            input = max;
                            overflow = " (最大值)";
                        } else if (input < min) {
                            input = min;
                            overflow = " (最小值)";
                        }
                        let new_content = " -> " + input;
                        step_02.setContent(ori_content + new_content + overflow);
                    } else {
                        step_02.setActionButton("positive", "跳过");
                        step_02.setContent(ori_content);
                    }
                    max_try_times = input;
                });
            }

            let step_03_default_value = pattern_size || 3;
            let step_03_prop = {
                title: "设置图案解锁边长",
                content: "--  Step  3 / 3  --\n\n当前值: " + step_03_default_value,
                inputHint: "设置新值或跳过此步配置",
                positive: "完成",
            };
            let pattern_size_range = [3, 6];
            if (bug_inputHint) {
                let items = [];
                for (let i = 0, j = pattern_size_range[0]; j <= pattern_size_range[1]; i += 1, j += 1) {
                    items[i] = j + "";
                }
                step_03_prop.items = items;
                step_03_prop.itemsSelectMode = "single";
                step_03_prop.itemsSelectedIndex = items.indexOf(step_03_default_value);
            }
            let step_03 = dialogs.build(Object.assign({}, common_steps_params, step_03_prop));
            step_03.on("neutral", () => {
                step_03.cancel();
            });
            step_03.on("negative", () => {
                step_02.show();
                step_03.cancel();
            });
            step_03.on("positive", () => {
                config["pattern_size"] = pattern_size;
                config.no_longer_prompt = true; // config configured by this wizard will be saved
                step_03.cancel();
            });
            if (bug_inputHint) {
                step_03.on("single_choice", (idx, item) => {
                    pattern_size = item - 0;
                });
            } else {
                step_03.on("input_change", (dialog, input) => {
                    let ori_content = step_03.getContentView().getText().toString().replace(/(.+)(?= ->).*/g, "$1");
                    if (input) {
                        let parsed = parseInt(input - 0);
                        if (!parsed && parsed !== 0) input = "[输入不合法]";
                        else input = parsed;
                        let overflow = "",
                            max = pattern_size_range[1],
                            min = pattern_size_range[0];
                        if (input > max) {
                            input = max;
                            overflow = " (最大值)";
                        } else if (input < min) {
                            input = min;
                            overflow = " (最小值)";
                        }
                        let new_content = " -> " + input;
                        step_03.setContent(ori_content + new_content + overflow);
                    } else {
                        step_03.setContent(ori_content);
                    }
                    pattern_size = input;
                });
            }

            config_now_flag && step_01.show();
        });

        thread_sub_steps.join();

        storage.put("config", Object.assign(storage_config, config));

        // tool function(s) //

        function alertTitle(dialog, message, duration) {
            alert_info[dialog] = alert_info[dialog] || {};
            alert_info["message_showing"] ? alert_info["message_showing"]++ : (alert_info["message_showing"] = 1);

            let ori_text = alert_info[dialog].ori_text || "",
                ori_color = alert_info[dialog].ori_color || "";

            if (!ori_text) {
                ori_text = dialog.getTitleView().getText();
                alert_info[dialog].ori_text = ori_text;
            }
            if (!ori_color) {
                ori_color = dialog.getTitleView().getTextColors().colors[0];
                alert_info[dialog].ori_color = ori_color;
            }

            setTitleInfo(dialog, message, colors.parseColor("#cc5588"));

            setTimeout(() => {
                alert_info["message_showing"]--;
                if (alert_info["message_showing"]) return;
                setTitleInfo(dialog, ori_text, ori_color);
            }, duration || 3000);

            // tool function(s) //

            function setTitleInfo(dialog, text, color) {
                dialog.getTitleView().setText(text);
                dialog.getTitleView().setTextColor(color);
            }
        }
    }

    function getVerName(package_name) {
        let pkgs = context.getPackageManager().getInstalledPackages(0).toArray();
        for (let i in pkgs) {
            if (pkgs[i].packageName.toString() === package_name) return pkgs[i].versionName
        }
    }
}

module.exports = Unlock;