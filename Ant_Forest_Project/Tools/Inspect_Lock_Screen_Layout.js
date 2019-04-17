auto.waitFor();
tryRequestScreenCapture();

let WIDTH = device.width;
let HEIGHT = device.height;

let path_base = files.getSdcardPath() + "/!Debug_Info/";
files.removeDir(path_base);
let path_container_page = path_base + "Container_Page.png";
let path_unlock_page = path_base + "Unlock_Page.png";
let path_unlock_bounds = path_base + "Unlock_Bounds.png";
let path_device_info = path_base + "Device_Info.txt";
files.createWithDirs(path_device_info);
let device_info_file = files.open(path_device_info);
files.write(path_device_info, device.brand + " " + device.product + " " + device.release);
device_info_file.close();

let keyguard_manager = context.getSystemService(context.KEYGUARD_SERVICE);
let isUnlocked = () => !keyguard_manager.isKeyguardLocked();

let diag = dialogs.build({
    title: "解锁布局抓取",
    content: "请按照以下步骤抓取解锁布局\n\n" +
        "1. 屏幕自动关闭后自动亮起\n" +
        "2. 自动滑动屏幕进入图案解锁页面\n" +
        "注: 若自动滑动失败请手动滑动\n" +
        "3. 等待手机震动后再手动解锁\n" +
        "4. 出现布局后按提示操作",
    positive: "开始",
    negative: "放弃",
});
diag.on("positive", () => {
    threads.start(function () {
        shell("input keyevent 26");
        waitForAction(() => !device.isScreenOn(), 8000);
        sleep(500);
        device.wakeUp();
        waitForAction(() => device.isScreenOn(), 8000);
        device.keepScreenOn();
        sleep(1000);
        captureScreen(path_container_page);
        sleep(500);
        dismissLayer();
        sleep(800);
        app.sendBroadcast("inspect_layout_bounds");
        captureScreen(path_unlock_page);
        device.vibrate(500);
        if (!waitForAction(() => isUnlocked(), 25000)) ~alert("等待手动解锁超时") && exit();
        sleep(1000);
        captureScreen(path_unlock_bounds);
        device.cancelKeepingAwake();
        alert("布局抓取完毕\n\n请将\"" + path_base + "\"目录下的文件 (通常为3个png和1个txt文件) 全部发送给开发者\n\n发送之前请仔细检查截图或文本中是否包含隐私信息\n如有请不要提交\n\n返回键可退出布局分析页面");
    });
});
diag.show();

// tool function(s) //

function dismissLayer() {
    let kw_preview_container_common = id("com.android.systemui:id/preview_container");
    let kw_preview_container_miui = idMatches(/com.android.keyguard:id\/(.*unlock_screen.*|.*notification_.*(container|view).*)/); // borrowed from e1399579 and modified
    let kw_preview_container_miui10 = idMatches(/com.android.systemui:id\/(.*lock_screen_container|notification_(container.*|panel.*)|keyguard_.*)/); // borrowed from e1399579 and modified
    let kw_preview_container = null;
    let cond_preview_container = () =>
        kw_preview_container_common.exists() && kw_preview_container_common ||
        kw_preview_container_miui.exists() && kw_preview_container_miui ||
        kw_preview_container_miui10.exists() && kw_preview_container_miui10 ||
        null;

    if (waitForAction(() => kw_preview_container = cond_preview_container(), 500)) sleep(500);

    let half_width = ~~(WIDTH / 2),
        height_a = ~~(HEIGHT * 0.95),
        height_b = ~~(HEIGHT * 0.9),
        height_c = ~~(HEIGHT * 0.82),
        height_d = ~~(HEIGHT * 0.67),
        height_e = ~~(HEIGHT * 0.46),
        height_f = ~~(HEIGHT * 0.05);

    let max_try_times_dismiss_layer = 20;
    let gesture_time = 80;

    while (max_try_times_dismiss_layer--) {
        gesture(gesture_time, [half_width, height_a], [half_width, height_b], [half_width, height_c], [half_width, height_d], [half_width, height_e], [half_width, height_f]);
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
        kw_no_longer_prompt.click();

        let kw_start_now_btn = className("Button").textMatches(/START NOW|立即开始/);
        if (!waitForAction(kw_start_now_btn, 2000)) return;
        kw_start_now_btn.click();
    });

    let thread_req;
    let max_try_times = 6;
    while (max_try_times--) {
        thread_req = threads.start(function () {
            try {
                return requestScreenCapture();
            } catch (e) {
                if (!max_try_times) throw Error(e);
            }
        });
        thread_req.join(1500);
        if (!thread_req.isAlive()) break;
        thread_req.interrupt();
    }

    if (max_try_times < 0) messageAction("截图权限申请失败", 8, 1);

    threads.start(function () {
        let max_try_times = 50;
        while (thread_req.isAlive() && max_try_times--) sleep(200);
        if (max_try_times < 0) {
            thread_req.interrupt();
            thread_prompt.interrupt();
            messageAction("截图权限申请超时", 8, 1);
        }
    }); // thread_req_timeout
}

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

function keycode(keycode_name) {
    // "KEYCODE_BACK" <=> "4"
    // "KEYCODE_HOME" <=> "3",
    // "KEYCODE_POWER" <=> "26",
    return ~shell("input keyevent " + keycode_name);
}