/**
 * @description module for unlocking your phone
 * @borrows {@link https://github.com/hyb1996/Auto.js}
 * @author SuperMonster003
 */

let WIDTH = device.width,
    HEIGHT = device.height,
    PWMAP = require("./MODULE_PWMAP.js"),
    storage_unlock = require("./MODULE_STORAGE.js").create("unlock"),
    DEFAULT_UNLOCK = require("./MODULE_DEFAULT_CONFIG").unlock,
    decrypt = new PWMAP().pwmapDecrypt,
    is_screen_on = device.isScreenOn(),
    keyguard_manager = context.getSystemService(context.KEYGUARD_SERVICE),
    lock_type = getLockType();

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

function getLockType() {
    let adv = keyguard_manager.isKeyguardSecure();
    if (adv) return "advanced"; // pattern, code, PIN and so forth
    let locked = keyguard_manager.isKeyguardLocked();
    return !is_screen_on && !locked ? "none" : "swipe";
}

function unlock(password, max_try_times, pattern_size) {

    let safe_max_wakeup_times = 60; // 30 sec
    while (!device.isScreenOn() && safe_max_wakeup_times--) ~device.wakeUp() && sleep(500);
    if (safe_max_wakeup_times < 0) errorMsg("屏幕亮起失败");

    if (!keyguard_manager.isKeyguardLocked()) return true;

    if (lock_type === "none") return true;

    dismissLayer();

    if (lock_type === "swipe") return true;

    advancedUnlock();

    // tool function(s) //

    function dismissLayer() {
        let kw_preview_container = id("com.android.systemui:id/preview_container");

        if (waitForAction(kw_preview_container, 500)) sleep(500);
        else return;

        let half_width = ~~(WIDTH / 2),
            height_d = ~~(HEIGHT * 0.9),
            height_c = ~~(HEIGHT * 0.8),
            height_b = ~~(HEIGHT * 0.6),
            height_a = ~~(HEIGHT * 0.2);

        let max_try_times_dismiss_layer = 5;
        let data_from_storage_flag = false;
        let chances_for_storage_data = 3;
        let gesture_time = storage_unlock.get("dismiss_layer_gesture_time");

        if (gesture_time) data_from_storage_flag = true;
        else gesture_time = DEFAULT_UNLOCK.dismiss_layer_gesture_time;

        while (max_try_times_dismiss_layer--) {
            gesture(gesture_time, [half_width, height_d], [half_width, height_c], [half_width, height_b], [half_width, height_a]);
            if (waitForAction(() => !kw_preview_container.exists(), 1500)) break;
            if (data_from_storage_flag && chances_for_storage_data-- > 0) max_try_times_dismiss_layer += 1;
            else gesture_time += 100;
        }
        if (max_try_times_dismiss_layer < 0) messageAction("消除解锁页面提示层失败", 8, 1, 0, 1);
        storage_unlock.put("dismiss_layer_gesture_time", gesture_time);
    }

    function advancedUnlock() {
        if (!password) errorMsg("密码为空");

        let kw_lock_pattern_view = id("com.android.systemui:id/lockPatternView"),
            kw_password_view = id("com.android.systemui:id/passwordEntry"),
            kw_pin_view = id("com.android.systemui:id/pinEntry"),
            kw_all_unlock_ways = idMatches(/com\.android\.systemui:id\/(lockPatternView|(pin|password)Entry)/);

        waitForAction(() => kw_all_unlock_ways || !keyguard_manager.isKeyguardLocked(), 2000);
        if (!keyguard_manager.isKeyguardLocked()) return;
        if (!kw_all_unlock_ways.exists()) errorMsg("无法确定解锁方式");

        device.keepScreenOn();

        if (kw_lock_pattern_view.exists()) unlockPattern();
        else if (kw_password_view.exists()) unlockPassword();
        else if (kw_pin_view.exists()) unlockPin();

        device.cancelKeepingAwake();

        // tool function(s) //

        function unlockPattern() {
            let bounds = kw_lock_pattern_view.findOnce().bounds();
            let w = ~~(bounds.width() / 3),
                h = ~~(bounds.height() / 3),
                x1 = bounds.left + ~~(w / 2),
                y1 = bounds.top + ~~(h / 2);
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
            if (typeof password === "string") gesture_pts_params = password.match(/\D+/) ? password.split(/\D+/) : password.split("");
            gesture_pts_params = gesture_pts_params.map(value => [points[value].x, points[value].y]);

            let gesture_unlock_swipe_time = storage_unlock.get("gesture_unlock_swipe_time");
            let data_from_storage_flag = false;
            let chances_for_storage_data = 3;

            if (gesture_unlock_swipe_time) data_from_storage_flag = true;
            else gesture_unlock_swipe_time = gesture_pts_params.length * 100;

            while (gesture_unlock_swipe_time <= 8000 && max_try_times-- > 0) {
                gesture(gesture_unlock_swipe_time, gesture_pts_params);
                if (checkUnlockResult()) break;
                if (!(data_from_storage_flag && chances_for_storage_data-- > 0)) gesture_unlock_swipe_time += 200;
            }
            if (gesture_unlock_swipe_time > 8000) errorMsg("图案解锁方案失败");

            storage_unlock.put("gesture_unlock_swipe_time", gesture_unlock_swipe_time);
        }

        function unlockPassword() {
            let pw = Object.prototype.toString.call(password).slice(8, -1) === "Array" ? password.join("") : password;
            let kw_confirm_btn = textMatches(/确.|[Cc]onfirm|[Ee]nter/);

            while(max_try_times--) {
                kw_password_view.setText(pw);
                let shell_code = 0;
                if (kw_confirm_btn.exists()) kw_confirm_btn.click();
                else shell_code = shell("input keyevent 66", true).code;
                if (checkUnlockResult()) break;
                if (shell_code) errorMsg(["密码解锁方案失败", "输入密码后无法模拟回车键"]);
            }
            if (max_try_times < 0) errorMsg(["密码解锁方案失败", "可能是密码错误"]);
        }

        function unlockPin() {
            let pw = password.split(/\D+/).join("").split("");
            let kw_numeric_keypad = num => id("com.android.systemui:id/key" + num);
            let kw_nums_container = id("com.android.systemui:id/container");

            while (max_try_times--) {
                if (kw_numeric_keypad(9).exists()) clickNumsByKeypad();
                else if (kw_nums_container.exists()) clickNumsByContainer();
                else errorMsg("无可用的PIN解锁参考控件");

                let kw_enter_key = id("com.android.systemui:id/key_enter");
                kw_enter_key.exists() && kw_enter_key.click();

                if (checkUnlockResult()) break;
            }
            if (max_try_times < 0) errorMsg(["PIN解锁方案失败", "可能是密码错误"]);

            // tool function(s) //

            function clickNumsByKeypad() {
                pw.forEach(num => {
                    kw_numeric_keypad(num).click();
                });
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
                        }
                    }
                }

                let click_keypad = num => click(keypads[num || 11].x, keypads[num || 11].y);
                pw.forEach(num => click_keypad(+num));
            }
        }
    }
}

function checkUnlockResult() {
    let kw_incorrect_pw = textMatches(/.*(重试|不正确|错误|[Rr]etry|[Ii]ncorrect|[Ww]rong).*/);
    let kw_try_again = textMatches(/.*([Tt]ry again in|重试).*/);
    let kw_ok_btn = textMatches(/OK|确定|好?/);
    if (!waitForAction(() => !keyguard_manager.isKeyguardLocked() || kw_incorrect_pw.exists() || kw_try_again || kw_ok_btn, 1500)) return false;
    kw_ok_btn.exists() && ~kw_ok_btn.click() && sleep(500);
    if (kw_try_again.exists()) waitForAction(() => !kw_try_again.exists(), 65000);
    return waitForAction(() => !keyguard_manager.isKeyguardLocked(), 500);
}

function errorMsg(msg) {
    if (typeof msg === "string") msg = [msg];
    messageAction("解锁失败", 4, 1);
    msg.forEach(msg => msg && messageAction(msg, 4, 0, 1));
    messageAction(device.brand + " " + device.product + " " + device.release, 8, 0, 2, 1);
    shell("input keyevent 26");
    exit();
}

// global function(s) //

function messageAction(msg, msg_level, if_needs_toast, if_needs_arrow, if_needs_split_line) {
    if (if_needs_toast) toast(msg);
    if (typeof if_needs_split_line === "string" && if_needs_split_line.match(/^both(_n)?$|up/)) {
        showSplitLine();
        if (if_needs_split_line === "both") if_needs_split_line = 1;
        else if (if_needs_split_line === "both_n") if_needs_split_line = "\n";
        else if (if_needs_split_line === "up") if_needs_split_line = 0;
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
    if (if_needs_split_line) showSplitLine(typeof if_needs_split_line === "string" ? if_needs_split_line : "");
    exit_flag && exit();
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

function showSplitLine(extra_str) {
    extra_str = extra_str || "";
    let split_line = "";
    for (let i = 0; i < 32; i += 1) split_line += "-";
    log(split_line + extra_str);
    return true;
}

// export module //

module.exports = Unlock;