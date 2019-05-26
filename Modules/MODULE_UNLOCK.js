/**
 * @description module for unlocking your phone by widget capturing with Auto.js
 * @example
 * let module_unlock = new (require("./Modules/MODULE_UNLOCK.js"))();
 * module_unlock.unlock();
 * @author {@link https://github.com/SuperMonster003}
 */

let {messageAction, waitForAction, keycode, clickAction} = require("./MODULE_MONSTER_FUNC");

let WIDTH, HEIGHT, cX, cY, device_intro;
let PWMAP = require("./MODULE_PWMAP.js");
let decrypt = new PWMAP().pwmapDecrypt;

let storage_unlock = require("./MODULE_STORAGE.js").create("unlock");
let config_storage = storage_unlock.get("config", {});
let config_default = require("./MODULE_DEFAULT_CONFIG").unlock;

let is_screen_on = device.isScreenOn();
let keyguard_manager = context.getSystemService(context.KEYGUARD_SERVICE);
let isUnlocked = () => !keyguard_manager.isKeyguardLocked();

let unlock_code = decrypt(config_storage.unlock_code) || "";
let {unlock_max_try_times, unlock_pattern_size} = Object.assign({}, config_default, config_storage);

// export module //

module.exports = function () {
    this.is_screen_on = is_screen_on;
    this.unlock = function () {

        let safe_max_wakeup_times = 60; // 30 sec
        while (!device.isScreenOn() && safe_max_wakeup_times--) ~device.wakeUp() && sleep(500);
        if (safe_max_wakeup_times < 0) errorMsg("屏幕亮起失败");

        setScreenPixelData();

        let kw_preview_container_common = id("com.android.systemui:id/preview_container");
        let kw_preview_container_miui = idMatches(/com\.android\.keyguard:id\/(.*unlock_screen.*|.*notification_.*(container|view).*)/); // borrowed from e1399579 and modified
        let kw_preview_container_miui10 = idMatches(/com\.android\.systemui:id\/(.*lock_screen_container|notification_(container.*|panel.*)|keyguard_.*)/); // borrowed from e1399579 and modified
        let kw_preview_container_emui = idMatches(/com\.android\.systemui:id\/.*(keyguard|lock)_indication.*/);
        let kw_preview_container = null;
        let cond_preview_container = () => {
            return kw_preview_container = kw_preview_container_common.exists() && kw_preview_container_common ||
                kw_preview_container_miui.exists() && kw_preview_container_miui ||
                kw_preview_container_miui10.exists() && kw_preview_container_miui10 ||
                kw_preview_container_emui.exists() && kw_preview_container_emui ||
                null;
        };

        let kw_lock_pattern_view_common = id("com.android.systemui:id/lockPatternView");
        let kw_lock_pattern_view_miui = idMatches(/com\.android\.keyguard:id\/lockPattern(View)?/); // borrowed from e1399579 and modified
        let kw_lock_pattern_view = null;
        let cond_lock_pattern_view = () =>
            kw_lock_pattern_view_common.exists() && kw_lock_pattern_view_common ||
            kw_lock_pattern_view_miui.exists() && kw_lock_pattern_view_miui ||
            null;

        let kw_password_view_common = idMatches(/.*passwordEntry/);
        let kw_password_view_miui = idMatches(/com\.android\.keyguard:id\/miui_mixed_password_input_field/); // borrowed from e1399579 and modified
        let kw_password_view = null;
        let cond_password_view = () =>
            kw_password_view_common.exists() && kw_password_view_common ||
            kw_password_view_miui.exists() && kw_password_view_miui ||
            null;

        let kw_pin_view_common = id("com.android.systemui:id/pinEntry");
        let kw_pin_view_miui = id("com.android.keyguard:id/numeric_inputview"); // borrowed from e1399579
        let kw_pin_view_emui = descMatches(/[Pp][Ii][Nn] ?码区域/);
        let kw_pin_view_meizu = id("com.android.systemui:id/lockPattern");
        let kw_pin_view = null;
        let cond_pin_view = () =>
            kw_pin_view_common.exists() && kw_pin_view_common ||
            kw_pin_view_miui.exists() && kw_pin_view_miui ||
            kw_pin_view_emui.exists() && kw_pin_view_emui ||
            kw_pin_view_meizu.exists() && kw_pin_view_meizu ||
            null;

        let special_view_bounds = null;
        let special_views = {
            "gxzw": [idMatches(/.*[Gg][Xx][Zz][Ww].*/), [0.0875, 0.47, 0.9125, 0.788]],
            // "test": [idMatches(/test_test/), [0, 0, 1, 1]],
            // "test2": [idMatches(/test_test_2/), [0, 0.5, 1, 0.9]],
        };
        let cond_special_view = () => {
            let special_view_keys = Object.keys(special_views);
            for (let i = 0, len = special_view_keys.length; i < len; i += 1) {
                let value = special_views[special_view_keys[i]];
                if (value[0].exists()) return value[1];
            }
            return null;
        };

        let cond_all_unlock_ways = () => {
            return (kw_lock_pattern_view = cond_lock_pattern_view()) ||
                (kw_password_view = cond_password_view()) ||
                (kw_pin_view = cond_pin_view()) ||
                (special_view_bounds = cond_special_view()) ||
                null;
        };

        let max_try_times_unlock_check = 3;
        while (max_try_times_unlock_check--) {
            if (!waitForAction(() => isUnlocked() || cond_preview_container() || cond_all_unlock_ways(), 2000)) continue;
            if (isUnlocked()) return true;
            if (cond_all_unlock_ways()) advancedUnlock();
            if (cond_preview_container()) dismissLayer();
        }
        if (max_try_times_unlock_check < 0) errorMsg("无法判断当前解锁条件");

        // tool function(s) //

        function setScreenPixelData() {
            WIDTH = device.width;
            HEIGHT = device.height;
            cX = num => ~~(num * WIDTH / (num >= 1 ? 720 : 1));
            cY = num => ~~(num * HEIGHT / (num >= 1 ? 1280 : 1)); // scaled by actual ratio
            device_intro = device.brand + " " + device.product + " " + device.release;
        }

        function dismissLayer() {

            let vertical_pts = [0.95, 0.9, 0.82, 0.67, 0.46, 0.05];

            let max_try_times_dismiss_layer = 20;
            let data_from_storage_flag = false;
            let chances_for_storage_data = 3;
            let gesture_time = config_storage.dismiss_layer_swipe_time;

            if (gesture_time) data_from_storage_flag = true;
            else gesture_time = config_default.dismiss_layer_swipe_time;

            let half_width = cX(0.5);
            let gesture_params = [];
            vertical_pts.forEach(raw_y => gesture_params.push([half_width, cY(raw_y)]));

            while (max_try_times_dismiss_layer--) {
                gesture.apply(null, [gesture_time].concat(gesture_params));

                if (waitForAction(() => !kw_preview_container.exists(), 1500)) break;
                if (cond_all_unlock_ways()) break;
                if (data_from_storage_flag) {
                    if (--chances_for_storage_data < 0) {
                        data_from_storage_flag = false;
                        gesture_time = config_default.dismiss_layer_swipe_time;
                    } else max_try_times_dismiss_layer += 1;
                } else gesture_time += (gesture_time <= 130 ? 10 : 80);
            }
            if (max_try_times_dismiss_layer < 0) errorMsg("消除解锁页面提示层失败");
            config_storage.dismiss_layer_swipe_time = gesture_time;
            storage_unlock.put("config", config_storage);
        }

        function advancedUnlock() {
            if (!unlock_code) errorMsg("密码为空");

            let pin_unlock_identifies = ["com.android.systemui:id/lockPattern"];

            device.keepScreenOn(300000); // 5 min at most

            if (kw_lock_pattern_view && kw_lock_pattern_view.exists()) unlockPattern();
            else if (kw_password_view && kw_password_view.exists()) unlockPassword();
            else if (kw_pin_view && kw_pin_view.exists()) unlockPin();
            else handleSpecials();

            device.cancelKeepingAwake();

            // tool function(s) //

            function unlockPattern() {

                let pattern_unlock_swipe_time = config_storage.pattern_unlock_swipe_time;
                let data_from_storage_flag = false;
                let chances_for_storage_data = 3;

                if (pattern_unlock_swipe_time) data_from_storage_flag = true;
                else pattern_unlock_swipe_time = config_default.pattern_unlock_swipe_time;

                while (pattern_unlock_swipe_time <= 3000 && unlock_max_try_times-- > 0) {

                    let gesture_pts_params = getGesturePtsParams() || errorMsg("图案解锁方案失败", "无法获取点阵布局");
                    let gestures_pts_params = [];
                    for (let i = 0; i < gesture_pts_params.length - 1; i += 1) {
                        let pt1 = gesture_pts_params[i];
                        let pt2 = gesture_pts_params[i + 1];
                        gestures_pts_params.push([(pattern_unlock_swipe_time - 50) * i, pattern_unlock_swipe_time, [pt1["0"], pt1["1"]], [pt2["0"], pt2["1"]]]);
                    }
                    gestures.apply(null, gestures_pts_params);

                    if (checkUnlockResult()) break;
                    if (data_from_storage_flag) {
                        if (--chances_for_storage_data < 0) {
                            data_from_storage_flag = false;
                            pattern_unlock_swipe_time = config_default.pattern_unlock_swipe_time;
                        }
                    } else pattern_unlock_swipe_time += 80;
                }
                if (pattern_unlock_swipe_time > 3000 || unlock_max_try_times < 0) errorMsg("图案解锁方案失败");
                config_storage.pattern_unlock_swipe_time = pattern_unlock_swipe_time;
                storage_unlock.put("config", config_storage);

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

                while (unlock_max_try_times--) {
                    kw_password_view.setText(pw);
                    if (!handleSpecialPwSituations()) return;
                    clickAction(kw_confirm_btn);
                    if (checkUnlockResult()) break;
                    shell("input keyevent 66", true);
                }
                if (unlock_max_try_times < 0) errorMsg(["密码解锁方案失败", "可能是密码错误", "或无法点击密码确认按钮"]);

                // tool function(s) //

                function handleSpecialPwSituations() {
                    return keypadAssist() && misjudge();

                    // tool function(s) //

                    function keypadAssist() {
                        let samples = {
                            "HUAWEI VOG-AL00 9": {
                                // keys_coords: [[864, 1706], [1008, 1706]],
                                first_char_refill: 1, // character to press or input before special treatment if needed
                                keys_coords: [[1008, 1706]], // DEL KEY coordination(s)
                                last_char_refill: null, // last password character to press or input if needed in the end
                            },
                        };
                        if (!(device_intro in samples)) return true;

                        let {first_char_refill, keys_coords, last_char_refill} = samples[device_intro];
                        if (typeof first_char_refill !== "undefined" && first_char_refill !== null) {
                            kw_password_view.setText(pw + first_char_refill.toString());
                        }
                        sleep(300);
                        keys_coords.forEach(coords => ~click(coords[0], coords[1]) && sleep(300));
                        if (!last_char_refill) return true;
                        let classof = Object.prototype.toString.call(last_char_refill).slice(8, -1);
                        if (classof === "JavaObject") clickAction(last_char_refill);
                        else if (classof === "Array") click(last_char_refill[0], last_char_refill[1]);
                        else if (typeof last_char_refill === "number" || typeof last_char_refill === "string") {
                            clickAction(idMatches("(key.?)?" + last_char_refill)) ||
                            clickAction(descMatches("(key.?)?" + last_char_refill)) ||
                            clickAction([textMatches("(key.?)?" + last_char_refill)]);
                        } else errorMsg("解锁失败", "无法判断末位字符类型");

                        return true;
                    }

                    function misjudge() {
                        let disturbances = pin_unlock_identifies;
                        for (let i = 0, len = disturbances.length; i < len; i += 1) {
                            let name = disturbances[i];
                            if (typeof name === "string" && id(name).exists() ||
                                typeof name === "object" && idMatches(name).exists()) return unlockPin();
                        }
                        return true;
                    }
                }
            }

            function unlockPin() {
                let pw = unlock_code.split(/\D+/).join("").split("");
                let getNumericKeypad = num => id("com.android.systemui:id/key" + num);
                let kw_nums_container = id("com.android.systemui:id/container");
                let getNumericInputView = num => id("com.android.keyguard:id/numeric_inputview").text(num + ""); // miui; borrowed from e1399579 and modified
                let getNumsBySingleDesc = num => desc(num);
                let boundsWayIDs = pin_unlock_identifies;
                let kw_bounds_way_id = null;

                while (unlock_max_try_times--) {
                    if (getNumericKeypad(9).exists()) clickNumsByKeypad();
                    else if (kw_nums_container.exists()) clickNumsByContainer();
                    else if (getNumericInputView(9).exists()) clickNumsByInputView();
                    else if (getNumsBySingleDesc(9).exists()) clickNumsBySingleDesc();
                    else if (!!function () {
                        for (let i = 0, len = boundsWayIDs.length; i < len; i += 1) {
                            let name = boundsWayIDs[i];
                            if (typeof name === "string" && id(name).exists()) return kw_bounds_way_id = id(name);
                            if (typeof name === "object" && idMatches(name).exists()) return kw_bounds_way_id = idMatches(name);
                        }
                    }()) clickNumsByBounds(kw_bounds_way_id);
                    else errorMsg("无可用的PIN解锁参考控件");

                    let kw_enter_key = id("com.android.systemui:id/key_enter");
                    clickAction(kw_enter_key);

                    if (checkUnlockResult()) break;
                }
                if (unlock_max_try_times < 0) errorMsg(["PIN解锁方案失败", "可能是密码错误"]);

                // tool function(s) //

                function clickNumsByInputView() {
                    pw.forEach(num => clickAction(getNumericInputView(num)));
                }

                function clickNumsByKeypad() {
                    testNumSelectors(getNumericKeypad);
                    pw.forEach(num => clickAction(getNumericKeypad(num)));
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

                    let click_keypad = num => click(keypads[num || 11].x, keypads[num || 11].y);
                    pw.forEach(num => click_keypad(+num));
                }

                function clickNumsBySingleDesc() {
                    testNumSelectors(getNumsBySingleDesc);
                    pw.forEach(num => clickAction(getNumsBySingleDesc(num)));
                }

                function testNumSelectors(func) {
                    let test_nums = "1234567890";
                    let test_result = true;
                    test_nums.split("").forEach(num => test_result = test_result && func(num).exists());
                    if (!test_result) errorMsg(["PIN解锁方案失败", "未能通过全部控件检测"]);
                    return true;
                }
            }

            function handleSpecials() {
                let pw = unlock_code.split(/\D+/).join("").split("");
                let l = cX(special_view_bounds[0]),
                    t = cY(special_view_bounds[1]),
                    r = cX(special_view_bounds[2]),
                    b = cY(special_view_bounds[3]);
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

                let click_keypad = num => click(keypads[num || 11].x, keypads[num || 11].y);
                pw.forEach(num => click_keypad(+num));

                checkUnlockResult() || errorMsg("尝试特殊解锁方案失败");
            }

            function checkUnlockResult() {
                let cond_incorrect_pw = () =>
                    !~"Common Reference" ||
                    textMatches(/.*(重试|不正确|错误|[Rr]etry|[Ii]ncorrect|[Ww]rong).*/).exists() ||
                    !~"MIUI Reference (from e1399579)" ||
                    id("com.android.keyguard:id/phone_locked_textview").exists();
                let cond_try_again = () => textMatches(/.*([Tt]ry again in|重试).*/).exists();
                let kw_ok_btn = textMatches(/OK|确定|好?/);
                let cond_ok_btn = () => kw_ok_btn.exists();
                let cond_state_ok = () => isUnlocked() || cond_incorrect_pw() || cond_try_again() || cond_ok_btn();
                if (!waitForAction(cond_state_ok, 1000) && !waitForAction(isUnlocked, 1000)) return false;
                clickAction(kw_ok_btn) && sleep(1000);
                if (cond_try_again()) waitForAction(() => !cond_try_again(), 65000);
                return waitForAction(isUnlocked, 1000);
            }
        }

        function errorMsg(msg) {
            if (typeof msg === "string") msg = [msg];
            messageAction("解锁失败", 4, 1);
            msg.forEach(msg => msg && messageAction(msg, 4, 0, 1));
            messageAction(device_intro, 4, 0, 2, 1);
            is_screen_on && messageAction("自动关闭屏幕" + (keycode(26) ? "" : "失败"), 1, 0, 0, 1);
            exit();
        }
    };
};