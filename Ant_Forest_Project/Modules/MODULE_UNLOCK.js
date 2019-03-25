/**
 @description module for unlocking your phone
 @author e1399579 (lead author)
 @author SuperMonster003 (corresponding author)
 */

auto();

function Unlock() {
    let PWMAP = require("./MODULE_PWMAP.js"),
        storage = require("./MODULE_STORAGE.js").create("unlock"),
        encrypt = new PWMAP().pwmapEncrypt,
        decrypt = new PWMAP().pwmapDecrypt;

    let storage_config = storage.get("config", {});
    if (!storage_config.no_longer_prompt) unlockConfigWizard();

    let password = decrypt(storage_config.password, "no_clip") || "",
        pattern_size = storage_config.pattern_size, // could be undefined
        max_try_times = storage_config.max_try_times; // could be undefined

    this.is_screen_on = device.isScreenOn();

    this.unlock = function () {

        let safe_max_wakeup_times = 60; // 30 sec
        while (!device.isScreenOn() && safe_max_wakeup_times--) ~device.wakeUp() && sleep(500);
        if (safe_max_wakeup_times < 0) ~console.error("屏幕亮起失败") && exit();

        let Robot = require("./Robot_e1399579.js"),
            Secure = require("./Secure_e1399579.js");
        new Secure(new Robot(max_try_times), max_try_times).openLock(password, pattern_size);
    };

    function unlockConfigWizard() {

        let config = {},
            config_now_flag = true,
            no_longer_prompt = storage_config.no_longer_prompt;

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
                if (!config_now_flag) return toast("请取消勾选\"不再提示\"选项");
                step_00.cancel();
            });

            step_00.show();
        });

        thread_step00.join();

        let thread_sub_steps = threads.start(function () {
            let password = "",
                max_try_times = "",
                pattern_size = "";

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

            let step_01 = dialogs.build(Object.assign({}, common_steps_params, {
                title: "输入锁屏解锁密码",
                negative: "查看示例",
                negativeColor: "#88bb88",
                content: "--  Step  1 / 3  --\n\n密码长度不少于4位\n无密码请留空\n图案解锁点数大于9使用逗号分隔",
                inputHint: "密码将以密文形式存储在本地",
            })).on("neutral", () => {
                step_01.cancel();
            }).on("negative", () => {
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
            }).on("positive", () => {
                password = step_01.getInputEditText().getText().toString();
                if (password && password.length < 4) return toast("密码长度不小于4位");
                config["password"] = encrypt(password, "no_clip");
                step_02.show();
                step_01.cancel();
            }).on("input_change", (dialog, input) => {
                //
            });

            let step_02 = dialogs.build(Object.assign({}, common_steps_params, {
                title: "设置解锁最大尝试次数",
                content: "--  Step  2 / 3  --\n\n当前值: 10",
                inputHint: "设置新值或跳过此步配置",
                positive: "跳过",
            })).on("input_change", (dialog, input) => {
                let try_times_range = [3, 30];
                let ori_content = step_02.getContentView().getText().toString().replace(/(.+)(?= ->).*/g, "$1");
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
            }).on("neutral", () => {
                step_02.cancel();
            }).on("negative", () => {
                step_01.show();
                step_02.cancel();
            }).on("positive", () => {
                config["max_try_times"] = max_try_times;
                step_03.show();
                step_02.cancel();
            });

            let step_03 = dialogs.build(Object.assign({}, common_steps_params, {
                title: "设置图案解锁边长",
                content: "--  Step  3 / 3  --\n\n当前值: 3",
                inputHint: "设置新值或跳过此步配置",
                positive: "完成",
            })).on("input_change", (dialog, input) => {
                let pattern_size_range = [3, 6];
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
            }).on("neutral", () => {
                step_03.cancel();
            }).on("negative", () => {
                step_02.show();
                step_03.cancel();
            }).on("positive", () => {
                config["pattern_size"] = pattern_size;
                config.no_longer_prompt = true; // config configured by this wizard will be saved
                step_03.cancel();
            });

            config_now_flag && step_01.show();
        });

        thread_sub_steps.join();

        storage.put("config", Object.assign(storage_config, config));
    }
}

module.exports = Unlock;