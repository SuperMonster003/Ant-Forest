try {
    auto.waitFor();
} catch (e) {
    auto();
}
tryRequestScreenCapture();

let WIDTH = device.width;
let HEIGHT = device.height;
let cX = num => ~~(num * WIDTH / (num >= 1 ? 720 : 1));
let cY = num => ~~(num * HEIGHT / (num >= 1 ? 1280 : 1)); // scaled by actual ratio
let cY16h9w = num => ~~(num * (WIDTH * 16 / 9) / (num >= 1 ? 1280 : 1)); // forcibly scaled by 16:9

let path_base = files.getSdcardPath() + "/!Debug_Info/";
files.removeDir(path_base);
let path_container_page = path_base + "Container_Page.png";
let path_unlock_page = path_base + "Unlock_Page.png";
let path_unlock_bounds = path_base + "Unlock_Bounds.png";
let path_device_info = path_base + "Device_Info.txt";
files.createWithDirs(path_device_info);
let keyguard_manager = context.getSystemService(context.KEYGUARD_SERVICE);
let isUnlocked = () => !keyguard_manager.isKeyguardLocked();
let info = device.brand + " " + device.product + " " + device.release + "\n\n";
let device_brand = device.brand;
let keycode_power_bug_versions = [/[Mm]eizu/];
let keycode_power_bug = checkKeyCodePowerBug();

let diag = dialogs.build({
    title: "解锁布局抓取",
    content: "请按照以下步骤抓取解锁布局\n\n" +
        "1. 屏幕 [自动关闭] 后 [自动亮起]\n" +
        "2. [自动滑动屏幕] 进入图案解锁页面\n" +
        "注: 若手机 [震动两下] 或 [自动滑动失败] 请 [手动滑动]\n" +
        "3. 等待手机 [长震] 后再 [手动解锁]\n" +
        "4. 出现布局后 [按提示操作]",
    positive: "开始",
    negative: "放弃",
});
if (keycode_power_bug) {
    let ori_content = diag.getContentView().getText().toString().replace(/屏幕 \[自动关闭]/, "[手动关闭屏幕]").replace(/ \[自动亮起]/, "等待 [自动亮起]");
    diag.setContent(ori_content + "\n\n* * * * * *\n此设备不支持自动关屏\n需点击\"开始\"按钮后30秒内手动关屏\n* * * * * *");
}
diag.on("positive", () => {
    threads.start(function () {
        if (!keycode_power_bug) {
            let max_try_times_key_power = 2;
            keycode(26);
            while (!waitForAction(() => !device.isScreenOn(), 3000) && max_try_times_key_power--) keycode(26);
            if (max_try_times_key_power < 0) messageAction("关闭屏幕失败", 8, 1);
        } else if (!waitForAction(() => !device.isScreenOn(), 30000)) messageAction("等待手动关闭屏幕超时", 8, 1);

        sleep(500);
        device.wakeUp();
        let max_try_times_wake_up = 5;
        while (!waitForAction(() => device.isScreenOn(), 2000) && max_try_times_wake_up--) device.wakeUp();
        if (max_try_times_wake_up < 0) messageAction("唤起设备失败", 8, 1);
        sleep(1000);

        device.keepScreenOn();

        info += captSelectorInfo("Container View");
        captureScreen(path_container_page);
        sleep(500);

        dismissLayer();
        sleep(800);

        info += captSelectorInfo("Unlock View");
        app.sendBroadcast("inspect_layout_bounds");
        captureScreen(path_unlock_page);
        device.vibrate(500);

        let device_info_file = files.open(path_device_info);
        files.write(path_device_info, info);
        device_info_file.close();

        if (!waitForAction(() => isUnlocked(), 25000)) ~alert("等待手动解锁超时") && exit();
        sleep(1000);
        captureScreen(path_unlock_bounds);

        device.cancelKeepingAwake();
        setClip(path_base);

        let diag_ok = dialogs.build({
            title: "布局抓取完毕",
            content: "请将\"" + path_base + "\"目录下的文件 (通常为3个png和1个txt文件) [全部发送给开发者]\n\n" +
                "发送之前请仔细检查截图或文本中 [是否包含隐私信息]\n" +
                "如有请 [不要提交] 或 [修改后提交]\n\n" +
                "文件路径已复制到剪贴板中\n" +
                "[返回键] 可退出布局分析页面",
            positive: "好的",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
        diag_ok.on("positive", () => diag_ok.dismiss());
        diag_ok.show();
    });
});
diag.show();

// tool function(s) //

function checkKeyCodePowerBug() {
    for (let i = 0, len = keycode_power_bug_versions.length; i < len; i += 1) {
        if (device_brand.match(keycode_power_bug_versions[i])) return true;
    }
}

function captSelectorInfo(title) {
    let split_line = "-----------------------";
    let info = "";
    let addSplitLine = no_cr_flag => info += split_line + (no_cr_flag ? "" : "\n");
    let addText = (text, no_cr_flag, split_lines_count) => {
        split_lines_count = split_lines_count || 0;
        split_lines_count-- > 0 && addSplitLine();
        info += text + (no_cr_flag ? "" : "\n");
        split_lines_count-- > 0 && addSplitLine();
    };
    let addSelector = (w, content_name) => ~addText(w[content_name]()) && addText("-> " + w.bounds());

    addText("[ " + title + "]", 0, 1);

    ~addText("_text_", 0, 2) && textMatches(/.+/).find().forEach(w => addSelector(w, "text"));
    ~addText("_desc_", 0, 2) && descMatches(/.+/).find().forEach(w => addSelector(w, "desc"));
    ~addText("_id_", 0, 2) && idMatches(/.+/).find().forEach(w => addSelector(w, "id"));

    return info;
}

function dismissLayer() {
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

    if (!waitForAction(() => kw_preview_container = cond_preview_container(), 1500)) {
        device.vibrate(200);
        sleep(500);
        device.vibrate(200);
        return;
    }

    let vertical_pts = [0.95, 0.9, 0.82, 0.67, 0.46, 0.05];

    let max_try_times_dismiss_layer = 20;
    let gesture_time = 120;

    let half_width = cX(0.5);
    let gesture_params = [];
    vertical_pts.forEach(raw_y => gesture_params.push([half_width, cY(raw_y)]));

    while (max_try_times_dismiss_layer--) {
        gesture.apply(null, [gesture_time].concat(gesture_params));
        if (waitForAction(() => !kw_preview_container.exists(), 1200)) break;
        gesture_time += 80;
    }

    if (max_try_times_dismiss_layer < 0 && !waitForAction(() => !kw_preview_container.exists(), 25000)) ~alert("消除解锁页面提示层失败") && exit();
    return true;
}

// global function(s) //

function tryRequestScreenCapture() {

    let thread_prompt = threads.start(function () {
        let kw_no_longer_prompt = id("com.android.systemui:id/remember");
        if (!waitForAction(kw_no_longer_prompt, 5000)) return;
        clickObject(kw_no_longer_prompt) || clickBounds(kw_no_longer_prompt);

        let kw_start_now_btn = className("Button").textMatches(/START NOW|立即开始/);
        if (!waitForAction(kw_start_now_btn, 2000)) return;
        clickObject(kw_start_now_btn) || clickBounds(kw_start_now_btn);
    });

    let thread_req;
    let max_try_times = 3;
    let try_count = 0;
    while (++try_count && max_try_times--) {
        let req_result = false;
        thread_req = threads.start(function () {
            try {
                req_result = requestScreenCapture();

                if (req_result) thread_req.interrupt();
            } catch (e) {
            }
        });
        thread_req.join(1000);
        if (!thread_req.isAlive() && req_result) {
            thread_prompt.interrupt();
            break;
        }
        thread_req.interrupt();
    }

    if (max_try_times < 0) messageAction("截图权限申请失败", 8, 1);
}

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
            messageAction("Shell方法模拟按键失败", 0);
            messageAction("键值: " + keycode_name, 0, 0, 1);
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
                    messageAction("KeyCode方式模拟按键失败", 0);
                    messageAction("键值: " + keycode_name, 0, 0, 1);
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
    while (max_try_times--) {
        if (!obj_kw) return;
        if (buffering_time && !waitForAction(obj_kw, buffering_time) || !obj_kw.exists()) return;

        let thread_click = threads.start(function () {
            obj_kw.click();
        });
        thread_click.join(1000);
        if (!thread_click.isAlive()) break;
        thread_click.interrupt();
    }
    if (max_try_times < 0) return messageAction("click()方法超时", 3);
    return true;
}

function clickBounds(f, if_continuous, max_check_times, check_interval, padding) {

    let classof = param => Object.prototype.toString.call(param).slice(8, -1);

    if (!f) return messageAction("clickBounds的f参数无效", 0, 0, 0) && 0;

    let func = f,
        additionFunc;
    if (classof(f) === "Array") {
        func = f[0];
        if (!func) return messageAction("clickBounds的f[0]参数无效", 0, 0, 0) && 0;
        additionFunc = f[1];
    }

    if (func.toString().match(/^Rect\(/) && if_continuous) messageAction("连续点击时 f参数不能是bounds():\n" + func.toString(), 8, 1);
    if (!!additionFunc && additionFunc !== "try" && typeof additionFunc !== "function") messageAction("additionFunc参数类型不是\"function\":\n" + additionFunc.toString(), 8, 1);

    if (typeof additionFunc !== "undefined") {
        if (additionFunc === "try" && (!func || !func.exists())) return false;
        if (typeof additionFunc === "function" && !additionFunc()) return false;
    }

    max_check_times = max_check_times || (if_continuous ? 3 : 1);
    check_interval = check_interval || (if_continuous ? 1000 : 0);
    if_continuous = if_continuous || [];
    if (if_continuous === 1) if_continuous = [1];
    else if (typeof if_continuous === "object" && Object.prototype.toString.call(if_continuous).slice(8, -1) !== "Array") {
        let tmp_arr = [];
        tmp_arr.push(if_continuous);
        if_continuous = tmp_arr;
    }

    let parsed_padding = padding ? parsePadding(padding) : null;
    let posb;

    let max_try_times_posb = 3,
        getPosb = () => func.toString().match(/^Rect\(/) ? func : func.findOnce().bounds();
    while (max_try_times_posb--) {
        try {
            posb = getPosb();
        } catch (e) {
            sleep(500);
            if (!func.exists()) break; // may be a better idea to use BoundsInside()
        }
    }
    if (max_try_times_posb < 0) posb = getPosb(); // let console show specific error messages

    if (if_continuous.length) {
        while (max_check_times--) {
            if (!checkArray()) break;
            try {
                // click(posb.centerX() + (parsed_padding ? parsed_padding.x : 0), posb.centerY() + (parsed_padding ? parsed_padding.y : 0));
                press(posb.centerX() + (parsed_padding ? parsed_padding.x : 0), posb.centerY() + (parsed_padding ? parsed_padding.y : 0), 1);
            } catch (e) {
                // nothing to do here
            }
            sleep(check_interval);
        }
    } else {
        if ((func.toString().match(/^Rect\(/) || func.exists())) {
            try {
                // click(posb.centerX() + (parsed_padding ? parsed_padding.x : 0), posb.centerY() + (parsed_padding ? parsed_padding.y : 0));
                press(posb.centerX() + (parsed_padding ? parsed_padding.x : 0), posb.centerY() + (parsed_padding ? parsed_padding.y : 0), 1);
            } catch (e) {
                max_check_times = -1;
            }
        }
    }

    return max_check_times >= 0;

    // tool function(s) //

    function parsePadding(padding) {
        let obj = {"x": 0, "y": 0};
        if (Object.prototype.toString.call(padding).slice(8, -1) === "Array") {
            if ((padding[0] !== "x" && padding[0] !== "y") || typeof padding[1] !== "number") messageAction("输入的padding参数不合法", 9, 1);
            obj[padding[0]] = padding[1];
        } else if (typeof padding === "number") {
            obj["y"] += padding;
        } else {
            messageAction("输入的padding类型不合法", 9, 1);
        }
        return obj;
    }

    function checkArray() {
        for (let i = 0, len = if_continuous.length; i < len; i += 1) {
            if (if_continuous[i] === 1) {
                if (!func.exists()) return;
            } else {
                if (!if_continuous[i].exists()) return;
            }
        }
        return true;
    }
}