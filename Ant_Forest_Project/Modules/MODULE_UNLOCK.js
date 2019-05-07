/**
 * @description module for unlocking your phone
 * @author SuperMonster003
 */

let WIDTH = device.width;
let HEIGHT = device.height;
let cX = num => ~~(num * WIDTH / (num >= 1 ? 720 : 1));
let cY = num => ~~(num * HEIGHT / (num >= 1 ? 1280 : 1)); // scaled by actual ratio
let cY16h9w = num => ~~(num * (WIDTH * 16 / 9) / (num >= 1 ? 1280 : 1)); // forcibly scaled by 16:9

let PWMAP = require("./MODULE_PWMAP.js"),
    storage_unlock = require("./MODULE_STORAGE.js").create("unlock"),
    DEFAULT_UNLOCK = require("./MODULE_DEFAULT_CONFIG").unlock,
    decrypt = new PWMAP().pwmapDecrypt,
    is_screen_on = device.isScreenOn(),
    keyguard_manager = context.getSystemService(context.KEYGUARD_SERVICE),
    isUnlocked = () => !keyguard_manager.isKeyguardLocked();

let storage_unlock_config = storage_unlock.get("config", {});
let password = decrypt(storage_unlock_config.unlock_code) || "",
    max_try_times = storage_unlock_config.unlock_max_try_times || DEFAULT_UNLOCK.unlock_max_try_times,
    pattern_size = storage_unlock_config.unlock_pattern_size || DEFAULT_UNLOCK.unlock_pattern_size;

// constructor //

function Unlock() {
    this.is_screen_on = is_screen_on;
    this.unlock = () => unlock(password, max_try_times, pattern_size);
}

// tool function(s) //

function unlock(password, max_try_times, pattern_size) {

    let safe_max_wakeup_times = 60; // 30 sec
    while (!device.isScreenOn() && safe_max_wakeup_times--) ~device.wakeUp() && sleep(500);
    if (safe_max_wakeup_times < 0) errorMsg("屏幕亮起失败");

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
    let kw_pin_view = null;
    let cond_pin_view = () =>
        kw_pin_view_common.exists() && kw_pin_view_common ||
        kw_pin_view_miui.exists() && kw_pin_view_miui ||
        kw_pin_view_emui.exists() && kw_pin_view_emui ||
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
        if (!waitForAction(() => isUnlocked() || cond_preview_container() || cond_all_unlock_ways(), 3000)) errorMsg("无法判断当前解锁条件");
        if (isUnlocked()) return true;
        if (cond_all_unlock_ways()) advancedUnlock();
        if (cond_preview_container()) dismissLayer();
    }

    // tool function(s) //

    function dismissLayer() {

        let vertical_pts = [0.95, 0.9, 0.82, 0.67, 0.46, 0.05];

        let max_try_times_dismiss_layer = 20;
        let data_from_storage_flag = false;
        let chances_for_storage_data = 3;
        let gesture_time = storage_unlock_config.dismiss_layer_swipe_time;

        if (gesture_time) data_from_storage_flag = true;
        else gesture_time = DEFAULT_UNLOCK.dismiss_layer_swipe_time;

        let half_width = cX(0.5);
        let gesture_params = [];
        vertical_pts.forEach(raw_y => gesture_params.push([half_width, cY(raw_y)]));

        while (max_try_times_dismiss_layer--) {
            gesture.apply(null, [gesture_time].concat(gesture_params));

            if (waitForAction(() => !kw_preview_container.exists(), 1500)) break;
            if (cond_all_unlock_ways()) break;
            if (data_from_storage_flag && chances_for_storage_data-- > 0) max_try_times_dismiss_layer += 1;
            else gesture_time += (gesture_time <= 130 ? 10 : 80);
        }
        if (max_try_times_dismiss_layer < 0) errorMsg("消除解锁页面提示层失败");
        storage_unlock_config.dismiss_layer_swipe_time = gesture_time;
        storage_unlock.put("config", storage_unlock_config);
    }

    function advancedUnlock() {
        if (!password) errorMsg("密码为空");

        device.keepScreenOn(300000); // 5 min at most

        if (kw_lock_pattern_view && kw_lock_pattern_view.exists()) unlockPattern();
        else if (kw_password_view && kw_password_view.exists()) unlockPassword();
        else if (kw_pin_view && kw_pin_view.exists()) unlockPin();
        else handleSpecials();

        device.cancelKeepingAwake();

        // tool function(s) //

        function unlockPattern() {
            let bounds = kw_lock_pattern_view.findOnce().bounds();
            let w = ~~(bounds.width() / 3);
            let h = ~~(bounds.height() / 3);
            let x1 = bounds.left + ~~(w / 2);
            let y1 = bounds.top + ~~(h / 2);
            let points = ["Handsome Points"];
            for (let j = 1; j <= pattern_size; j += 1) {
                for (let i = 1; i <= pattern_size; i += 1) {
                    points[(j - 1) * pattern_size + i] = {
                        x: x1 + (i - 1) * w,
                        y: y1 + (j - 1) * h,
                    };
                }
            }
            let gesture_pts_params = password;
            if (typeof password === "string") gesture_pts_params = password.match(/[^1-9]+/) ? password.split(/[^1-9]+/).join("").split("") : password.split("");
            gesture_pts_params = gesture_pts_params.map(value => [points[value].x, points[value].y]);

            let pattern_unlock_swipe_time = storage_unlock_config.pattern_unlock_swipe_time;
            let data_from_storage_flag = false;
            let chances_for_storage_data = 3;

            if (pattern_unlock_swipe_time) data_from_storage_flag = true;
            else pattern_unlock_swipe_time = DEFAULT_UNLOCK.pattern_unlock_swipe_time;

            while (pattern_unlock_swipe_time <= 3000 && max_try_times-- > 0) {
                // gesture(pattern_unlock_swipe_time, gesture_pts_params);

                let gestures_pts_params = [];
                for (let i = 0; i < gesture_pts_params.length - 1; i += 1) {
                    let pt1 = gesture_pts_params[i];
                    let pt2 = gesture_pts_params[i + 1];
                    gestures_pts_params.push([(pattern_unlock_swipe_time - 50) * i, pattern_unlock_swipe_time, [pt1["0"], pt1["1"]], [pt2["0"], pt2["1"]]]);
                }
                gestures.apply(null, gestures_pts_params);

                if (checkUnlockResult()) break;
                if (!(data_from_storage_flag && chances_for_storage_data-- > 0)) pattern_unlock_swipe_time += 80;
            }
            if (pattern_unlock_swipe_time > 3000) errorMsg("图案解锁方案失败");
            storage_unlock_config.pattern_unlock_swipe_time = pattern_unlock_swipe_time;
            storage_unlock.put("config", storage_unlock_config);
        }

        function unlockPassword() {
            let pw = Object.prototype.toString.call(password).slice(8, -1) === "Array" ? password.join("") : password;
            let kw_confirm_btn = textMatches(/确.|[Cc]onfirm|[Ee]nter/);

            while (max_try_times--) {
                kw_password_view.setText(pw);
                clickObject(kw_confirm_btn);
                if (checkUnlockResult()) break;
                shell("input keyevent 66", true);
            }
            if (max_try_times < 0) errorMsg(["密码解锁方案失败", "可能是密码错误", "或无法点击密码确认按钮"]);
        }

        function unlockPin() {
            let pw = password.split(/\D+/).join("").split("");
            let getNumericKeypad = num => id("com.android.systemui:id/key" + num);
            let kw_nums_container = id("com.android.systemui:id/container");
            let getNumericInputView = num => id("com.android.keyguard:id/numeric_inputview").text(num + ""); // miui; borrowed from e1399579 and modified
            let getNumsBySingleDesc = num => desc(num);

            while (max_try_times--) {
                if (getNumericKeypad(9).exists()) clickNumsByKeypad();
                else if (kw_nums_container.exists()) clickNumsByContainer();
                else if (getNumericInputView(9).exists()) clickNumsByInputView();
                else if (getNumsBySingleDesc(9).exists()) clickNumsBySingleDesc();
                else errorMsg("无可用的PIN解锁参考控件");

                let kw_enter_key = id("com.android.systemui:id/key_enter");
                clickObject(kw_enter_key);

                if (checkUnlockResult()) break;
            }
            if (max_try_times < 0) errorMsg(["PIN解锁方案失败", "可能是密码错误"]);

            // tool function(s) //

            function clickNumsByInputView() {
                pw.forEach(num => clickObject(getNumericInputView(num)));
            }

            function clickNumsByKeypad() {
                testNumSelectors(getNumericKeypad);
                pw.forEach(num => clickObject(getNumericKeypad(num)));
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
                let keypads = ["Handsome Keypads"];
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
                pw.forEach(num => clickObject(getNumsBySingleDesc(num)));
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
            let pw = password.split(/\D+/).join("").split("");
            let l = cX(special_view_bounds[0]),
                t = cY(special_view_bounds[1]),
                r = cX(special_view_bounds[2]),
                b = cY(special_view_bounds[3]);
            let w = ~~((r - l) / 3),
                h = ~~((b - t) / 4),
                x1 = l + ~~(w / 2),
                y1 = t + ~~(h / 2);
            let keypads = ["Trembling Keypads"];
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
    }
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
    clickObject(kw_ok_btn) && sleep(1000);
    if (cond_try_again()) waitForAction(() => !cond_try_again(), 65000);
    return waitForAction(isUnlocked, 1000);
}

function errorMsg(msg) {
    if (typeof msg === "string") msg = [msg];
    messageAction("解锁失败", 4, 1);
    msg.forEach(msg => msg && messageAction(msg, 4, 0, 1));
    messageAction(device.brand + " " + device.product + " " + device.release, 4, 0, 2, 1);
    keycode(26);
    exit();
}

// global function(s) //

function messageAction(msg, msg_level, if_needs_toast, if_needs_arrow, if_needs_split_line) {
    if (if_needs_toast) toast(msg);
    let split_line_style = "";
    if (typeof if_needs_split_line === "string") {
        if (if_needs_split_line.match(/dash/)) split_line_style = "dash";
        if (if_needs_split_line.match(/^both(_n)?|up/)) {
            showSplitLine("", split_line_style);
            if (if_needs_split_line.match(/both_n/)) if_needs_split_line = "\n";
            else if (if_needs_split_line.match(/both/)) if_needs_split_line = 1;
            else if (if_needs_split_line.match(/up/)) if_needs_split_line = 0;
        }
    }
    if (if_needs_arrow) {
        if (if_needs_arrow > 10) messageAction("\"if_needs_arrow\"参数不可大于10", 8, 1, 0, 1);
        msg = "> " + msg;
        for (let i = 0; i < if_needs_arrow; i += 1) msg = "-" + msg;
    }
    let exit_flag = false;
    switch (msg_level) {
        case 0:
        case "verbose":
        case "v":
            msg_level = 0;
            console.verbose(msg);
            break;
        case 1:
        case "log":
        case "l":
            msg_level = 1;
            console.log(msg);
            break;
        case 2:
        case "i":
        case "info":
            msg_level = 2;
            console.info(msg);
            break;
        case 3:
        case "warn":
        case "w":
            msg_level = 3;
            console.warn(msg);
            break;
        case 4:
        case "error":
        case "e":
            msg_level = 4;
            console.error(msg);
            break;
        case 8:
        case "x":
            msg_level = 4;
            console.error(msg);
            exit_flag = true;
            break;
        case 9:
        case "h":
            msg_level = 4;
            console.error(msg);
            keycode(3);
            exit_flag = true;
            break; // useless, just for inspection
        case "t":
        case "title":
            msg_level = 1;
            console.log("[ " + msg + " ]");
            break;
    }
    if (if_needs_split_line) showSplitLine(typeof if_needs_split_line === "string" ? (if_needs_split_line === "dash" ? "" : if_needs_split_line) : "", split_line_style);
    exit_flag && exit();
    if (typeof current_app !== "undefined") current_app.msg_level = current_app.msg_level ? Math.max(current_app.msg_level, msg_level) : msg_level;
    return !(msg_level in {3: 1, 4: 1});
}

function waitForAction(f, timeout_or_with_interval, msg, msg_level, if_needs_toast, if_needs_arrow) {
    timeout_or_with_interval = timeout_or_with_interval || [10000, 300];
    if (typeof timeout_or_with_interval === "number") timeout_or_with_interval = [timeout_or_with_interval, 300];
    let timeout = timeout_or_with_interval[0],
        check_interval = timeout_or_with_interval[1];
    msg_level = msg_level || (msg_level === 0 ? 0 : 1);

    return checkFunc(f);

    function checkFunc(f) {
        if (typeof f === "object") {
            let classof = Object.prototype.toString.call(f).slice(8, -1);
            if (classof !== "Array") return check(() => f.exists());
            for (let i = 0, len = f.length; i < len; i += 1) {
                if (!(typeof f[i]).match(/function|object/)) messageAction("数组参数中含不合法元素", 9, 1);
                if (!checkFunc(f[i])) return false;
            }
            return true;
        } else if (typeof f === "function") return check(f);
        else if (typeof f === "number") return sleep(f);
        else messageAction("\"waitForAction\"传入f参数不合法\n\n" + f.toString() + "\n", 9, 1, 1);

        function check(f) {
            while (!f() && timeout > 0) {
                sleep(check_interval);
                timeout -= check_interval;
            }
            timeout <= 0 && msg ? messageAction(msg, msg_level, if_needs_toast, if_needs_arrow) : false;
            return timeout > 0;
        }
    }
}

function showSplitLine(extra_str, style) {
    extra_str = extra_str || "";
    let split_line = "";
    if (style === "dash") {
        for (let i = 0; i < 16; i += 1) split_line += "- ";
        split_line += "-";
    } else {
        for (let i = 0; i < 32; i += 1) split_line += "-";
    }
    log(split_line + extra_str);
    return true;
}

function keycode(keycode_name) {
    let keyEvent = keycode_name => shellWay(keycode_name) || autojsKeyCodeWay(keycode_name) || messageAction("按键模拟失败", 3) || messageAction("键值: " + keycode_name, 3, 0, 1);
    switch (keycode_name.toString()) {
        case "KEYCODE_HOME":
        case "3":
        case "home":
            return ~home();
        case "KEYCODE_BACK":
        case "4":
        case "back":
            return ~back();
        case "KEYCODE_APP_SWITCH":
        case "187":
        case "recents":
        case "recent":
        case "recent_apps":
            return ~recents();
        case "powerDialog":
        case "power_dialog":
        case "powerMenu":
        case "power_menu":
            return ~powerDialog();
        case "notifications":
        case "notification":
            return ~notifications();
        case "quickSettings":
        case "quickSetting":
        case "quick_settings":
        case "quick_setting":
            return ~quickSettings();
        case "splitScreen":
        case "split_screen":
            return ~splitScreen();
        default:
            return keyEvent(keycode_name);
    }

    // tool function(s) //

    function shellWay(keycode_name) {
        let shell_result = false;
        try {
            shell_result = !shell("input keyevent " + keycode_name, true).code;
        } catch (e) {
            debugInfo("Shell方法模拟按键失败");
            debugInfo(">键值: " + keycode_name);
        }
        return shell_result;
    }

    function autojsKeyCodeWay(keycode_name) {
        let current_screen_state = device.isScreenOn();
        current_screen_state ? KeyCode(keycode_name) : device.wakeUp();
        let key_check = {
            "26, KEYCODE_POWER, POWER": checkPower,
        };
        for (let key in key_check) {
            if (key_check.hasOwnProperty(key)) {
                if (~key.split(/ *, */).indexOf(keycode_name.toString()) && !key_check[key]()) {
                    debugInfo("KeyCode方式模拟按键失败");
                    debugInfo(">键值: " + keycode_name);
                }
            }
        }
        return true;

        // tool function (s) //

        function checkPower() {
            if (current_screen_state) return waitForAction(() => !device.isScreenOn(), 2400);
            let max_try_times_wake_up = 10;
            while (!waitForAction(() => device.isScreenOn(), 500) && max_try_times_wake_up--) device.wakeUp();
            return max_try_times_wake_up >= 0;
        }
    }
}

function clickObject(obj_keyword, buffering_time) {
    let obj_kw = obj_keyword && obj_keyword.clickable(true) || null;
    let max_try_times = 3;
    let max_try_times_backup = max_try_times;
    while (max_try_times--) {
        if (!obj_kw) return;
        if (buffering_time && !waitForAction(obj_kw, buffering_time) || !obj_kw.exists()) return;

        let thread_click = threads.start(function () {
            obj_kw.click();
        });
        thread_click.join(1000);
        if (!thread_click.isAlive()) break;
        let current_run_count = max_try_times_backup - max_try_times;
        debugInfo("强制中断click()线程: (" + current_run_count + "\/" + max_try_times_backup + ")");
        thread_click.interrupt();
    }
    if (max_try_times < 0) return messageAction("click()方法超时", 3);
    return true;
}

// export module //

module.exports = Unlock;