/**
 * @description module for unlocking your phone by widget capturing with Auto.js
 * @example
 * let module_unlock = new (require("./Modules/MODULE_UNLOCK.js"))();
 * module_unlock.unlock();
 * @author {@link https://github.com/SuperMonster003}
 */

let {
    messageAction,
    waitForAction,
    keycode,
    clickAction,
    getDisplayParams,
    debugInfo,
    captureErrScreen,
} = require("./MODULE_MONSTER_FUNC");

let {WIDTH, HEIGHT, USABLE_HEIGHT, cX, cY} = {};
let device_intro = device.brand + " " + device.product + " " + device.release;

let PWMAP = require("./MODULE_PWMAP.js");
let decrypt = new PWMAP().pwmapDecrypt;

let storage_unlock = require("./MODULE_STORAGE.js").create("unlock");
let config_storage = storage_unlock.get("config", {});
let config_default = require("./MODULE_DEFAULT_CONFIG").unlock;

let keyguard_manager = context.getSystemService(context.KEYGUARD_SERVICE);
let isUnlocked = () => !keyguard_manager.isKeyguardLocked();
let isScreenOn = () => device.isScreenOn();
let wakeUpDevice = () => device.keepScreenOn(2000);

let init_screen_state = isScreenOn();

let unlock_code = decrypt(config_storage.unlock_code) || "";
let {unlock_max_try_times, unlock_pattern_size} = Object.assign({}, config_default, config_storage);

// export module //

module.exports = function () {
    this.is_screen_on = init_screen_state;
    this.unlock = function () {

        wakeupDeviceIfNeeded();
        setDisplayParams();

        let {kw_lock_pattern_view, kw_password_view, kw_pin_view, special_view_bounds} = {};
        let checkLockViews = () => checkLockPatternView() || checkPasswordView() || checkPinView() || checkSpecialView();

        let max_try_times_unlock = 5;
        let max_try_times_unlock_backup = max_try_times_unlock;
        while (!isUnlocked() && max_try_times_unlock--) {
            let current_try_unlock_time = max_try_times_unlock_backup - max_try_times_unlock;
            debugInfo("尝试解锁 (" + current_try_unlock_time + "\/" + max_try_times_unlock_backup + ")");
            checkPreviewContainer() && dismissLayer();
            checkLockViews() && unlockLockView();
        }
        if (max_try_times_unlock < 0) errorMsg("无法判断当前解锁条件");

        // key function(s) //

        function checkPreviewContainer() {
            let samples = {
                kw_preview_container_common: id("com.android.systemui:id/preview_container"),
                // borrowed from e1399579 and modified
                kw_preview_container_miui: idMatches(/com\.android\.keyguard:id\/(.*unlock_screen.*|.*notification_.*(container|view).*)/),
                // borrowed from e1399579 and modified
                kw_preview_container_miui10: idMatches(/com\.android\.systemui:id\/(.*lock_screen_container|notification_(container.*|panel.*)|keyguard_.*)/),
                kw_preview_container_emui: idMatches(/com\.android\.systemui:id\/.*(keyguard|lock)_indication.*/),
            };

            let {
                kw_preview_container_common,
                kw_preview_container_miui,
                kw_preview_container_miui10,
                kw_preview_container_emui,
            } = samples;

            // will only be effective when no samples were matched
            waitForAction(() => {
                let keys = Object.keys(samples);
                for (let i = 0, len = keys.length; i < len; i += 1) {
                    if (samples[keys[i]].exists()) return true;
                }
            }, 1000);

            if (kw_preview_container_common.exists()) {
                debugInfo("匹配到通用解锁页面提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_common.exists())();
            }

            if (kw_preview_container_miui.exists()) {
                debugInfo("匹配到MIUI解锁页面提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_miui.exists())();
            }

            if (kw_preview_container_miui10.exists()) {
                debugInfo("匹配到MIUI10解锁页面提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_miui10.exists())();
            }

            if (kw_preview_container_emui.exists()) {
                debugInfo("匹配到EMUI解锁页面提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_emui.exists())();
            }
        }

        function checkLockPatternView() {
            let kw_lock_pattern_view_common = id("com.android.systemui:id/lockPatternView");
            let kw_lock_pattern_view_miui = idMatches(/com\.android\.keyguard:id\/lockPattern(View)?/); // borrowed from e1399579 and modified
            if (kw_lock_pattern_view_common.exists()) {
                debugInfo("匹配到通用图案解锁控件");
                kw_lock_pattern_view = kw_lock_pattern_view_common;
                return (checkLockPatternView = () => kw_lock_pattern_view.exists())();
            }
            if (kw_lock_pattern_view_miui.exists()) {
                debugInfo("匹配到MIUI图案解锁控件");
                kw_lock_pattern_view = kw_lock_pattern_view_miui;
                return (checkLockPatternView = () => kw_lock_pattern_view.exists())();
            }
        }

        function checkPasswordView() {
            let kw_password_view_common = idMatches(/.*passwordEntry/);
            let kw_password_view_miui = idMatches(/com\.android\.keyguard:id\/miui_mixed_password_input_field/); // borrowed from e1399579 and modified

            if (kw_password_view_common.exists()) {
                debugInfo("匹配到通用密码解锁控件");
                kw_password_view = kw_password_view_common;
                return (checkPasswordView = () => kw_password_view.exists())();
            }
            if (kw_password_view_miui.exists()) {
                debugInfo("匹配到MIUI密码解锁控件");
                kw_password_view = kw_password_view_miui;
                return (checkPasswordView = () => kw_password_view.exists())();
            }
        }

        function checkPinView() {
            let kw_pin_view_common = id("com.android.systemui:id/pinEntry");
            let kw_pin_view_miui = id("com.android.keyguard:id/numeric_inputview"); // borrowed from e1399579
            let kw_pin_view_emui = descMatches(/[Pp][Ii][Nn] ?码区域/);
            let kw_pin_view_meizu = id("com.android.systemui:id/lockPattern");

            if (kw_pin_view_common.exists()) {
                debugInfo("匹配到通用PIN解锁控件");
                kw_pin_view = kw_pin_view_common;
                return (checkPinView = () => kw_pin_view.exists())();
            }
            if (kw_pin_view_miui.exists()) {
                debugInfo("匹配到MIUI/PIN解锁控件");
                kw_pin_view = kw_pin_view_miui;
                return (checkPinView = () => kw_pin_view.exists())();
            }
            if (kw_pin_view_emui.exists()) {
                debugInfo("匹配到EMUI/PIN解锁控件");
                kw_pin_view = kw_pin_view_emui;
                return (checkPinView = () => kw_pin_view.exists())();
            }
            if (kw_pin_view_meizu.exists()) {
                debugInfo("匹配到魅族PIN解锁控件");
                kw_pin_view = kw_pin_view_meizu;
                return (checkPinView = () => kw_pin_view.exists())();
            }
        }

        function checkSpecialView() {
            if (special_view_bounds) return true;

            let special_views = {
                "gxzw": [idMatches(/.*[Gg][Xx][Zz][Ww].*/), [0.0875, 0.47, 0.9125, 0.788]],
                // "test": [idMatches(/test_test/), [0, 0, 1, 1]],
                // "test2": [idMatches(/test_test_2/), [0, 0.5, 1, 0.9]],
            };
            let special_view_keys = Object.keys(special_views);
            for (let i = 0, len = special_view_keys.length; i < len; i += 1) {
                let value = special_views[special_view_keys[i]];
                if (value[0].exists()) return special_view_bounds = value[1];
            }
        }

        function dismissLayer() {
            let vertical_pts = [0.95, 0.9, 0.82, 0.67, 0.46, 0.05];

            let max_try_times_dismiss_layer = 20;
            let max_try_times_dismiss_layer_backup = max_try_times_dismiss_layer;
            let data_from_storage_flag = false;
            let chances_for_storage_data = 3;
            let gesture_time = config_storage.dismiss_layer_swipe_time;

            if (gesture_time) data_from_storage_flag = true;
            else gesture_time = config_default.dismiss_layer_swipe_time;

            let half_width = cX(0.5);
            let gesture_params = [];
            vertical_pts.forEach(raw_y => gesture_params.push([half_width, cY(raw_y)]));

            while (max_try_times_dismiss_layer--) {
                let current_try_dismiss_layer_time = max_try_times_dismiss_layer_backup - max_try_times_dismiss_layer;
                debugInfo("尝试消除解锁页面提示层 (" + current_try_dismiss_layer_time + "\/" + max_try_times_dismiss_layer_backup + ")");
                debugInfo("使用滑动时间参数: " + gesture_time);
                debugInfo(">来源: " + (data_from_storage_flag ? "本地存储" : "自动计算"));
                gesture.apply(null, [gesture_time].concat(gesture_params));

                if (waitForAction(() => !checkPreviewContainer(), 1500) || checkLockViews()) break;
                debugInfo("单次消除解锁页面提示层超时");

                if (data_from_storage_flag) {
                    if (--chances_for_storage_data < 0) {
                        data_from_storage_flag = false;
                        gesture_time = config_default.dismiss_layer_swipe_time;
                        debugInfo("放弃本地存储数据");
                        debugInfo("从默认值模块获取默认值: " + gesture_time);
                    } else {
                        debugInfo("继续使用本地存储数据");
                        max_try_times_dismiss_layer += 1;
                    }
                } else {
                    let increment = gesture_time <= 130 ? 10 : 80;
                    gesture_time += increment;
                    debugInfo("参数增量: " + increment);
                }
            }
            if (max_try_times_dismiss_layer < 0) errorMsg("消除解锁页面提示层失败");

            debugInfo("解锁页面提示层消除成功");
            if (gesture_time !== config_storage.dismiss_layer_swipe_time) {
                config_storage.dismiss_layer_swipe_time = gesture_time;
                storage_unlock.put("config", config_storage);
                debugInfo("存储滑动时长参数: " + gesture_time);
            }
        }

        function unlockLockView() {
            if (!unlock_code) errorMsg("密码为空");

            let pin_unlock_identifies = ["com.android.systemui:id/lockPattern"];

            device.keepScreenOn(300000); // 5 min at most

            checkLockPatternView() && unlockPattern()
            || checkPasswordView() && unlockPassword()
            || checkPinView() && unlockPin()
            || handleSpecials();

            device.cancelKeepingAwake();

            // tool function(s) //

            function unlockPattern() {
                let pattern_unlock_swipe_time = config_storage.pattern_unlock_swipe_time;
                let unlock_max_try_times_backup = unlock_max_try_times;
                let data_from_storage_flag = false;
                let chances_for_storage_data = 3;

                if (pattern_unlock_swipe_time) data_from_storage_flag = true;
                else pattern_unlock_swipe_time = config_default.pattern_unlock_swipe_time;

                while (pattern_unlock_swipe_time <= 3000 && unlock_max_try_times-- > 0) {

                    let current_try_unlock_time = unlock_max_try_times_backup - unlock_max_try_times;
                    debugInfo("尝试图案密码解锁 (" + current_try_unlock_time + "\/" + unlock_max_try_times_backup + ")");
                    debugInfo("滑动时长参数: " + pattern_unlock_swipe_time);

                    let gesture_pts_params = getGesturePtsParams() || errorMsg("图案解锁方案失败", "无法获取点阵布局");
                    let gestures_pts_params = [];
                    for (let i = 0; i < gesture_pts_params.length - 1; i += 1) {
                        let pt1 = gesture_pts_params[i];
                        let pt2 = gesture_pts_params[i + 1];
                        gestures_pts_params.push([(pattern_unlock_swipe_time - 50) * i, pattern_unlock_swipe_time, [pt1["0"], pt1["1"]], [pt2["0"], pt2["1"]]]);
                    }
                    gestures.apply(null, gestures_pts_params);

                    if (checkUnlockResult()) break;
                    debugInfo("图案解锁未成功");
                    if (data_from_storage_flag) {
                        if (--chances_for_storage_data < 0) {
                            data_from_storage_flag = false;
                            pattern_unlock_swipe_time = config_default.pattern_unlock_swipe_time;
                        }
                    } else pattern_unlock_swipe_time += 80;
                }
                if (pattern_unlock_swipe_time > 3000 || unlock_max_try_times < 0) errorMsg("图案解锁方案失败");
                debugInfo("图案解锁成功");
                if (pattern_unlock_swipe_time !== config_storage.pattern_unlock_swipe_time) {
                    config_storage.pattern_unlock_swipe_time = pattern_unlock_swipe_time;
                    storage_unlock.put("config", config_storage);
                    debugInfo("存储滑动时长参数: " + pattern_unlock_swipe_time);
                }
                return true;

                // tool function(s) //

                function getGesturePtsParams() {
                    let bounds = null;

                    let max_try_times_get_bounds = 5;
                    while (max_try_times_get_bounds--) {
                        try {
                            bounds = waitForBoundsStable(kw_lock_pattern_view);
                            break;
                        } catch (e) {
                            sleep(100);
                        }
                    }
                    if (!bounds) return;

                    let w = ~~(bounds.width() / unlock_pattern_size);
                    let h = ~~(bounds.height() / unlock_pattern_size);
                    let x1 = bounds.left + ~~(w / 2);
                    let y1 = bounds.top + ~~(h / 2);
                    let points = [];
                    for (let j = 1; j <= unlock_pattern_size; j += 1) {
                        for (let i = 1; i <= unlock_pattern_size; i += 1) {
                            points[(j - 1) * unlock_pattern_size + i] = {
                                x: x1 + (i - 1) * w,
                                y: y1 + (j - 1) * h,
                            };
                        }
                    }
                    let gesture_pts_params = unlock_code;
                    if (typeof unlock_code === "string") gesture_pts_params = unlock_code.match(/[^1-9]+/) ? unlock_code.split(/[^1-9]+/).join("").split("") : unlock_code.split("");
                    return gesture_pts_params.filter(value => +value && points[value]).map(value => [points[value].x, points[value].y]);

                    // tool function(s) //

                    function waitForBoundsStable(view) {
                        let bounds = null;
                        let thread_bounds_stable = threads.start(function () {
                            let [l, t, r, b] = Array(4).join("1").split("1").map(value => null);
                            waitForAction(() => {
                                let key_node = view.findOnce();
                                if (!key_node) return;
                                bounds = key_node.bounds();
                                let {left, top, right, bottom} = bounds;
                                if (l === null || t === null || r === null || b === null) {
                                    [l, t, r, b] = [left, top, right, bottom];
                                    return;
                                }
                                if (l === left && t === top && r === right && b === bottom) return true;
                                else {
                                    l = left;
                                    t = top;
                                    r = right;
                                    b = bottom;
                                }
                            }, [1400, 80]);
                        });
                        thread_bounds_stable.join(1500);
                        thread_bounds_stable.isAlive() && ~thread_bounds_stable.interrupt();
                        return bounds;
                    }
                }
            }

            function unlockPassword() {
                let pw = Object.prototype.toString.call(unlock_code).slice(8, -1) === "Array" ? unlock_code.join("") : unlock_code;
                let kw_confirm_btn = textMatches(/确.|[Cc]onfirm|[Ee]nter/);
                let unlock_max_try_times_backup = unlock_max_try_times;

                while (unlock_max_try_times--) {
                    let current_try_unlock_time = unlock_max_try_times_backup - unlock_max_try_times;
                    debugInfo("尝试密码解锁 (" + current_try_unlock_time + "\/" + unlock_max_try_times_backup + ")");
                    kw_password_view.setText(pw);
                    if (!handleSpecialPwSituations()) return;
                    if (clickAction(kw_confirm_btn, "widget")) debugInfo("点击确认按钮");
                    if (checkUnlockResult()) break;
                    if (!shell("input keyevent 66", true.code)) debugInfo("使用Root权限模拟回车键");
                }
                if (unlock_max_try_times < 0) errorMsg(["密码解锁方案失败", "可能是密码错误", "或无法点击密码确认按钮"]);
                debugInfo("密码解锁成功");
                return true;

                // tool function(s) //

                function handleSpecialPwSituations() {
                    return keypadAssist() && misjudge();

                    // tool function(s) //

                    function keypadAssist() {
                        let samples = {
                            "HUAWEI VOG-AL00 9": {
                                // keys_coords: [[864, 1706], [1008, 1706]],
                                pre_char_refill: 1, // character to press or input before special treatment if needed
                                keys_coords: [[1008, 1706]], // DEL KEY coordination(s)
                                suf_char_refill: null, // last password character to press or input if needed in the end
                            },
                        };
                        if (!(device_intro in samples)) return true;
                        debugInfo("此设备机型需要按键辅助");
                        let samp = samples[device_intro];
                        let assist_keys_len = samp.keys_coords.length;
                        if (assist_keys_len) {
                            debugInfo("辅助按键共计: " + assist_keys_len + "项");
                            samp.keys_coords.forEach(coord => debugInfo(">(" + coord[0] + ", " + coord[1] + ")"));
                        }

                        let {pre_char_refill, keys_coords, suf_char_refill} = samp;
                        if (typeof pre_char_refill !== "undefined" && pre_char_refill !== null) {
                            let pre_char_refill_str = pre_char_refill.toString();
                            kw_password_view.setText(pw + pre_char_refill_str);
                            debugInfo("辅助前置填充: " + pre_char_refill_str.length + "项");
                        }
                        sleep(300);
                        keys_coords.forEach(coords => ~click(coords[0], coords[1]) && sleep(300));
                        if (!suf_char_refill) return true;
                        let classof = Object.prototype.toString.call(suf_char_refill).slice(8, -1);
                        if (classof === "JavaObject") {
                            debugInfo("辅助后置填充类型: 控件");
                            clickAction(suf_char_refill);
                        } else if (classof === "Array") {
                            debugInfo("辅助后置填充类型: 坐标");
                            click(suf_char_refill[0], suf_char_refill[1]);
                        } else if (typeof suf_char_refill === "number" || typeof suf_char_refill === "string") {
                            debugInfo("辅助后置填充类型: 文本");
                            clickAction(idMatches("(key.?)?" + suf_char_refill)) ||
                            clickAction(descMatches("(key.?)?" + suf_char_refill)) ||
                            clickAction([textMatches("(key.?)?" + suf_char_refill)]);
                        } else errorMsg("解锁失败", "无法判断末位字符类型");

                        return true;
                    }

                    function misjudge() {
                        let disturbances = pin_unlock_identifies;
                        for (let i = 0, len = disturbances.length; i < len; i += 1) {
                            let name = disturbances[i];
                            if (typeof name === "string" && id(name).exists()
                                || typeof name === "object" && idMatches(name).exists()
                            ) {
                                debugInfo("匹配到误判干扰");
                                debugInfo("转移至PIN解锁方案");
                                return unlockPin();
                            }
                        }
                        return true;
                    }
                }
            }

            function unlockPin() {
                let pw = unlock_code.split(/\D+/).join("").split("");
                let kw_bounds_way_id = null;

                let getNumericKeypad = num => id("com.android.systemui:id/key" + num);
                let kw_nums_container = id("com.android.systemui:id/container");
                let getNumericInputView = num => id("com.android.keyguard:id/numeric_inputview").text(num + ""); // miui; borrowed from e1399579 and modified
                let getNumsBySingleDesc = num => desc(num);

                while (unlock_max_try_times--) {
                    unlockPinNow();
                    if (checkUnlockResult()) break;
                    if (clickAction(id("com.android.systemui:id/key_enter"), "widget")) debugInfo("点击key_enter控件");
                    if (checkUnlockResult()) break;
                }
                if (unlock_max_try_times < 0) errorMsg(["PIN解锁方案失败", "可能是密码错误"]);
                debugInfo("PIN解锁成功");
                return true;

                // tool function(s) //

                function unlockPinNow() {
                    let max_try_times = 5;
                    while (max_try_times--) {
                        if (getNumericKeypad(9).exists()) {
                            debugInfo("匹配到通用PIN/KEY解锁控件");
                            return (unlockPinNow = clickNumsByKeypad)();
                        }
                        if (kw_nums_container.exists()) {
                            debugInfo("匹配到通用PIN容器解锁控件");
                            return (unlockPinNow = clickNumsByContainer)();
                        }
                        if (getNumericInputView(9).exists()) {
                            debugInfo("匹配到MIUI/PIN解锁控件");
                            return (unlockPinNow = clickNumsByInputView)();
                        }
                        if (getNumsBySingleDesc(9).exists()) {
                            debugInfo("匹配到内容描述PIN解锁控件");
                            return (unlockPinNow = clickNumsBySingleDesc)();
                        }
                        if (checkBoundsWayIds()) {
                            debugInfo("匹配到标记匹配PIN解锁控件");
                            debugInfo(">已匹配的字符串化标记:");
                            debugInfo(">" + kw_bounds_way_id.toString());
                            return (unlockPinNow = () => clickNumsByBounds(kw_bounds_way_id))();
                        }
                        sleep(400);
                    }
                    errorMsg("无可用的PIN解锁参考控件");

                    // tool function(s) //

                    function clickNumsByInputView() {
                        pw.forEach(num => clickAction(getNumericInputView(num), "widget"));
                    }

                    function clickNumsByKeypad() {
                        testNumSelectors(getNumericKeypad);
                        pw.forEach(num => clickAction(getNumericKeypad(num), "widget"));
                    }

                    function clickNumsByContainer() {
                        let key_node = kw_nums_container.findOnce();
                        let b = key_node.bounds();
                        let children_size = key_node.childCount();
                        let bottom = key_node.child(children_size - 1).bounds().bottom;
                        let top = key_node.child(children_size - 4).bounds().top;
                        let w = ~~(b.width() / 3),
                            h = ~~((bottom - top) / 4),
                            x1 = b.left + ~~(w / 2),
                            y1 = top + ~~(h / 2);
                        let keypads = [];
                        for (let j = 1; j <= 4; j += 1) {
                            for (let i = 1; i <= 3; i += 1) {
                                keypads[(j - 1) * 3 + i] = {
                                    x: x1 + w * (i - 1),
                                    y: y1 + h * (j - 1),
                                };
                            }
                        }
                        debugInfo("已构建拨号盘数字坐标");
                        keypads.forEach((coord, idx) => debugInfo(idx + ": (" + coord.x + ", " + coord.y + ")"));

                        let click_keypad = num => click(keypads[num || 11].x, keypads[num || 11].y);
                        pw.forEach(num => click_keypad(+num));
                    }

                    function clickNumsByBounds(kw) {
                        if (!kw || !kw.exists()) return;
                        let b = kw.findOnce().bounds();
                        let w = ~~(b.width() / 3),
                            h = ~~(b.height() / 4),
                            x1 = b.left + ~~(w / 2),
                            y1 = b.top + ~~(h / 2);
                        let keypads = [];
                        for (let j = 1; j <= 4; j += 1) {
                            for (let i = 1; i <= 3; i += 1) {
                                keypads[(j - 1) * 3 + i] = {
                                    x: x1 + w * (i - 1),
                                    y: y1 + h * (j - 1),
                                };
                            }
                        }
                        debugInfo("已构建拨号盘数字坐标");
                        keypads.forEach((coord, idx) => debugInfo(idx + ": (" + coord.x + ", " + coord.y + ")"));

                        let click_keypad = num => click(keypads[num || 11].x, keypads[num || 11].y);
                        pw.forEach(num => click_keypad(+num));
                    }

                    function clickNumsBySingleDesc() {
                        testNumSelectors(getNumsBySingleDesc);
                        pw.forEach(num => clickAction(getNumsBySingleDesc(num), "widget"));
                    }

                    function checkBoundsWayIds() {
                        if (kw_bounds_way_id) return kw_bounds_way_id;

                        let bounds_way_ids = pin_unlock_identifies;
                        for (let i = 0, len = bounds_way_ids.length; i < len; i += 1) {
                            let name = bounds_way_ids[i];
                            if (typeof name === "string" && id(name).exists()) return kw_bounds_way_id = id(name);
                            if (typeof name === "object" && idMatches(name).exists()) return kw_bounds_way_id = idMatches(name);
                        }
                    }

                    function testNumSelectors(func) {
                        let test_nums = "1234567890";
                        let test_result = true;
                        test_nums.split("").forEach(num => test_result = test_result && func(num).exists());
                        if (!test_result) errorMsg(["PIN解锁方案失败", "未能通过全部控件检测"]);
                        return true;
                    }
                }
            }

            function handleSpecials() {
                if (!special_view_bounds) return;

                let pw = unlock_code.split(/\D+/).join("").split("");
                let l = cX(special_view_bounds[0]),
                    t = cY(special_view_bounds[1]),
                    r = cX(special_view_bounds[2]),
                    b = cY(special_view_bounds[3]);
                debugInfo("已构建密码区域边界:");
                debugInfo("Rect(" + l + ", " + t + " - " + r + ", " + b + ")");
                let w = ~~((r - l) / 3),
                    h = ~~((b - t) / 4),
                    x1 = l + ~~(w / 2),
                    y1 = t + ~~(h / 2);
                let keypads = [];
                for (let j = 1; j <= 4; j += 1) {
                    for (let i = 1; i <= 3; i += 1) {
                        keypads[(j - 1) * 3 + i] = {
                            x: x1 + w * (i - 1),
                            y: y1 + h * (j - 1),
                        };
                    }
                }
                debugInfo("已构建拨号盘数字坐标");
                keypads.forEach((coord, idx) => debugInfo(idx + ": (" + coord.x + ", " + coord.y + ")"));

                let click_keypad = num => click(keypads[num || 11].x, keypads[num || 11].y);
                pw.forEach(num => click_keypad(+num));

                return checkUnlockResult() || errorMsg("尝试特殊解锁方案失败");
            }

            function checkUnlockResult() {
                let cond_incorrect_pw = () =>
                    !~"Common Reference" ||
                    textMatches(/.*(重试|不正确|错误|[Rr]etry|[Ii]ncorrect|[Ww]rong).*/).exists() ||
                    !~"MIUI Reference (from e1399579)" ||
                    id("com.android.keyguard:id/phone_locked_textview").exists();
                let cond_try_again = () => textMatches(/.*([Tt]ry again in|\d+.*后重试).*/).exists();
                let kw_ok_btn = textMatches(/OK|确定|好?/);
                let cond_ok_btn = () => kw_ok_btn.exists();
                let cond_state_ok = () => isUnlocked() || cond_incorrect_pw() && ~debugInfo("密码错误") || cond_try_again() || cond_ok_btn();
                if (!waitForAction(cond_state_ok, 1000) && !waitForAction(isUnlocked, 1000)) return false;
                clickAction(kw_ok_btn, "widget") && sleep(1000);
                if (cond_try_again()) {
                    debugInfo("正在等待重试超时");
                    waitForAction(() => !cond_try_again(), 65000);
                }
                return waitForAction(isUnlocked, 1000);
            }
        }

        // tool function(s) //

        function errorMsg(msg) {
            if (typeof msg === "string") msg = [msg];
            messageAction("解锁失败", 4, 1);
            msg.forEach(msg => msg && messageAction(msg, 4, 0, 1));
            messageAction(device_intro, 4, 0, 2, 1);
            captureErrScreen("unlock_failed", 1);
            init_screen_state && messageAction("自动关闭屏幕" + (keycode(26) ? "" : "失败"), 1, 0, 0, 1);
            exit();
        }

        function wakeupDeviceIfNeeded() {
            if (isScreenOn()) return;
            let safe_max_wakeup_times = 6; // 3 sec
            let safe_max_wakeup_times_backup = safe_max_wakeup_times;
            while (safe_max_wakeup_times--) {
                let current_wakeup_time = safe_max_wakeup_times_backup - safe_max_wakeup_times;
                debugInfo("尝试唤起设备 (" + current_wakeup_time + "\/" + safe_max_wakeup_times_backup + ")");
                wakeUpDevice();
                if (waitForAction(isScreenOn, 500, 100)) break;
            }
            safe_max_wakeup_times < 0 ? errorMsg("设备唤起失败") : debugInfo("设备唤起成功");
        }

        function setDisplayParams() {
            [WIDTH, HEIGHT, USABLE_HEIGHT, cX, cY] = (() => {
                let {WIDTH, HEIGHT, USABLE_HEIGHT, cX, cY} = getDisplayParams();
                return [WIDTH, HEIGHT, USABLE_HEIGHT, cX, cY];
            })();
            if (!WIDTH || !HEIGHT) errorMsg("获取屏幕宽高数据失败");
            debugInfo("屏幕宽高: " + WIDTH + " × " + HEIGHT);
            debugInfo("可用屏幕高度: " + USABLE_HEIGHT);
            if (typeof cX !== "function" || typeof cY !== "function") errorMsg("屏幕像素伸缩方法无效");
        }
    };
};