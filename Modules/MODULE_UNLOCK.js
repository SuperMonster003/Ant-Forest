/**
 * @overview individual module for unlocking your phone by widget capturing with Auto.js
 * @description a graphic configuration tool (Unlock_Config_Tool.js) is available for customise the unlock behaviour of the device
 *
 * @example
 * require("./MODULE_UNLOCK").unlock(); <br>
 * require("./MODULE_UNLOCK").unlock(true); // forcibly enable debugInfo() for showing debug logs in console <br>
 * require("./MODULE_UNLOCK").unlock(false); // forcibly disable debugInfo() for not showing debug logs in console
 *
 * @last_modified Nov 14, 2019
 * @author {@link https://github.com/SuperMonster003}
 */

let _require = require.bind(this); // copy global.require(){}

require = function (path) {
    path = "./" + path.replace(/^([./]*)(?=\w)/, "").replace(/(\.js)*$/, "") + ".js"; // "./folderA/folderB/module.js"
    for (let i = 0, len = path.match(/\//g).length; i < len; i += 1) {
        let _path = path;
        for (let j = 0; j < i; j += 1) _path = _path.replace(/\/\w+?(?=\/)/, "");
        for (let j = 0; j < 3; j += 1) {
            if (files.exists(_path)) return _require(_path);
            if (!files.path(_path).match(/\/Modules\//)) {
                let _module_path = files.path(_path).replace(/\/(.+?\.js$)/, "\/Modules/$1");
                if (files.exists(_module_path)) return _require(_module_path);
            }
            _path = "." + _path;
        }
    }
    let matched = path.match(/[^\/]+(?=\.js)/)[0];
    if (matched) {
        let internal_modules = {
            MODULE_PWMAP: loadInternalModulePWMAP,
            MODULE_STORAGE: loadInternalModuleStorage,
            MODULE_DEFAULT_CONFIG: {
                unlock: {
                    unlock_code: null,
                    unlock_max_try_times: 20,
                    unlock_pattern_strategy: "segmental",
                    unlock_pattern_size: 3,
                    unlock_pattern_swipe_time_segmental: 120,
                    unlock_pattern_swipe_time_solid: 200,
                    unlock_dismiss_layer_bottom: 0.8,
                    unlock_dismiss_layer_top: 0.2,
                    unlock_dismiss_layer_swipe_time: 110,
                }
            }
        };
        let module = internal_modules[matched];
        return typeof module === "function" ? module() : module;
    }
}; // override global.require(){}

let DEFAULT = require("./MODULE_DEFAULT_CONFIG").unlock; // updated at Nov 14, 2019

let {
    messageAction,
    waitForAction,
    keycode,
    clickAction,
    getDisplayParams,
    debugInfo,
    captureErrScreen,
    equalObjects,
    deepCloneObject,
    setDeviceProto,
    getSelector,
    classof,
} = loadInternalModuleMonsterFunc();

setDeviceProto();

let sel = getSelector();

let {cX, cY} = getDisplayParams();
let device_intro = device.brand + " " + device.product + " " + device.release;

let decrypt = new (require("./MODULE_PWMAP"))().pwmapDecrypt;

let storage_unlock = require("./MODULE_STORAGE").create("unlock");
let config_unlock = Object.assign({}, DEFAULT, storage_unlock.get("config", {}));
storage_unlock.put("config", config_unlock);

let keyguard_manager = context.getSystemService(context.KEYGUARD_SERVICE);
let isUnlocked = () => !keyguard_manager.isKeyguardLocked();
let isScreenOn = () => device.isScreenOn();
let wakeUpDevice = () => device.keepScreenOn(120 * 1000); // 2 min

let init_screen_state = isScreenOn();

let unlock_code = decrypt(config_unlock.unlock_code) || "";
let {unlock_max_try_times, unlock_pattern_size} = config_unlock;

// export module //

module.exports = {
    DEFAULT: DEFAULT,
    is_screen_on: init_screen_state,
    isUnlocked: isUnlocked,
    isLocked: () => !isUnlocked(),
    unlock: function (force_debug_info_flag) {
        global["$flag"] = global["$flag"] || {};
        let $flag = global["$flag"];

        if (force_debug_info_flag || force_debug_info_flag === false) {
            $flag.debug_info_avail_bak = $flag.debug_info_avail;
            $flag.debug_info_avail = !!force_debug_info_flag;
        }
        let dash_line = "__split_line_dash__";
        debugInfo([dash_line, "尝试自动解锁", dash_line]);

        wakeupDeviceIfNeeded();

        let {kw_lock_pattern_view, kw_password_view, kw_pin_view, special_view_bounds} = {};
        let checkLockViews = () => checkLockPatternView() || checkPasswordView() || checkPinView() || checkSpecialView();

        let max_try_times_unlock = 5;
        let current_try_unlock = 0;
        let maxTryTimesReached = () => current_try_unlock > max_try_times_unlock;

        while (!isUnlocked() && !maxTryTimesReached()) {
            let retry_info = " (" + current_try_unlock + "\/" + max_try_times_unlock + ")";
            debugInfo(current_try_unlock++ ? "重试解锁" + retry_info : "尝试解锁");
            checkAndDismissQQLockScreenMsgBox();
            checkPreviewContainer() && dismissLayer();
            checkLockViews() && unlockLockView();
        }

        if (maxTryTimesReached() < 0) return errorMsg("无法判断当前解锁条件");

        debugInfo([dash_line, "自动解锁完毕", dash_line]);

        if (force_debug_info_flag || force_debug_info_flag === false) {
            $flag.debug_info_avail = $flag.debug_info_avail_bak;
            delete $flag.debug_info_avail_bak;
        }

        return true;

        // key function(s) //

        function checkAndDismissQQLockScreenMsgBox() {
            let kw_qq_msg_box_txt_ident = () => sel.pickup("按住录音");
            let kw_qq_msg_box_id_ident = () => sel.pickup(idMatches(/com.tencent.mobileqq:id.+/));

            let ident = () => kw_qq_msg_box_txt_ident() || kw_qq_msg_box_id_ident();
            if (ident()) {
                debugInfo("匹配到QQ锁屏消息弹框控件");
                clickAction(sel.pickup("关闭"), "widget");
                waitForAction(() => !ident(), 3000) ? debugInfo("关闭弹框控件成功") : debugInfo("关闭弹框控件超时", 3);
            }
        }

        function checkPreviewContainer() {
            let samples = {
                kw_preview_container_common: id("com.android.systemui:id/preview_container"),
                kw_preview_container_emui: idMatches(/com\.android\.systemui:id\/.*(keyguard|lock)_indication.*/),
                kw_preview_container_smartisanos: idMatches(/com\.smartisanos\.keyguard:id\/keyguard_(content|.*view)/),
                // borrowed from e1399579 and modified
                kw_preview_container_miui: idMatches(/com\.android\.keyguard:id\/(.*unlock_screen.*|.*notification_.*(container|view).*)/),
                // borrowed from e1399579 and modified
                kw_preview_container_miui10: idMatches(/com\.android\.systemui:id\/(.*lock_screen_container|notification_(container.*|panel.*)|keyguard_.*)/),
            };

            let {
                kw_preview_container_common,
                kw_preview_container_emui,
                kw_preview_container_smartisanos,
                kw_preview_container_miui,
                kw_preview_container_miui10,
            } = samples;

            // will only be effective when no samples were matched
            waitForAction(() => {
                let keys = Object.keys(samples);
                for (let i = 0, len = keys.length; i < len; i += 1) {
                    if (samples[keys[i]].exists()) return true;
                }
            }, 1000);

            if (kw_preview_container_common.exists()) {
                debugInfo("匹配到通用解锁提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_common.exists())();
            }

            if (kw_preview_container_emui.exists()) {
                debugInfo("匹配到EMUI解锁提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_emui.exists())();
            }

            if (kw_preview_container_smartisanos.exists()) {
                debugInfo("匹配到\"锤子科技\"解锁提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_smartisanos.exists())();
            }

            if (kw_preview_container_miui.exists()) {
                debugInfo("匹配到MIUI解锁提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_miui.exists())();
            }

            if (kw_preview_container_miui10.exists()) {
                debugInfo("匹配到MIUI10解锁提示层控件");
                return (checkPreviewContainer = () => kw_preview_container_miui10.exists())();
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
            let kw_password_view_smartisanos = idMatches(/com\.smartisanos\.keyguard:id\/passwordEntry(_.+)?/).className("EditText");
            let kw_password_view_miui = idMatches(/com\.android\.keyguard:id\/miui_mixed_password_input_field/); // borrowed from e1399579 and modified

            if (kw_password_view_common.exists()) {
                debugInfo("匹配到通用密码解锁控件");
                kw_password_view = kw_password_view_common;
                return (checkPasswordView = () => kw_password_view.exists())();
            }
            if (kw_password_view_smartisanos.exists()) {
                debugInfo("匹配到\"锤子科技\"密码解锁控件");
                kw_password_view = kw_password_view_smartisanos;
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
            let kw_pin_view_oppo = id("com.android.systemui:id/keyguard_pin_view");

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
            if (kw_pin_view_oppo.exists()) {
                debugInfo("匹配到OPPO/PIN解锁控件");
                kw_pin_view = kw_pin_view_oppo;
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
            let {
                unlock_dismiss_layer_bottom,
                unlock_dismiss_layer_top,
                unlock_dismiss_layer_swipe_time,
            } = config_unlock;

            let vertical_pts = [unlock_dismiss_layer_bottom, unlock_dismiss_layer_top];

            let storage_swipe_time = unlock_dismiss_layer_swipe_time;
            let data_from_storage_flag = !!storage_swipe_time;
            let swipe_time = storage_swipe_time;

            let storage_swipe_time_reliable = config_unlock.swipe_time_reliable || [];
            let swipe_time_reliable = deepCloneObject(storage_swipe_time_reliable);
            let chances_for_storage_data = ~swipe_time_reliable.indexOf(swipe_time) ? Infinity : 3;
            if (!isFinite(chances_for_storage_data)) debugInfo("当前滑动时长参数可信");

            let continuous_swipe = config_unlock.continuous_swipe || {};
            if (!(swipe_time in continuous_swipe)) {
                debugInfo("连续成功滑动累积器清零");
                continuous_swipe = {};
                continuous_swipe[swipe_time] = 0;
            }

            let max_retry_times_dismiss = 30;
            let current_retry_dismiss = 0;
            let maxTryTimesReached = () => current_retry_dismiss > max_retry_times_dismiss;

            let half_width = cX(0.5);
            let gesture_params = [];
            vertical_pts.forEach(raw_y => gesture_params.push([half_width, cY(raw_y)]));

            device.keepOn(3);

            while (!maxTryTimesReached()) {
                let retry_info = " (" + current_retry_dismiss + "\/" + max_retry_times_dismiss + ")";
                debugInfo(current_retry_dismiss ? "重试消除解锁页面提示层" + retry_info : "尝试消除解锁页面提示层");
                debugInfo("使用滑动时间参数: " + swipe_time);
                debugInfo(">来源: " + (data_from_storage_flag ? "本地存储" : "自动计算"));
                gesture.apply(null, [swipe_time].concat(gesture_params));

                if (waitForAction(() => !checkPreviewContainer(), 1500) || checkLockViews()) break;
                debugInfo("单次消除解锁页面提示层超时");
                current_retry_dismiss += 1;

                if (data_from_storage_flag) {
                    if (--chances_for_storage_data < 0) {
                        data_from_storage_flag = false;
                        swipe_time = config_unlock.unlock_dismiss_layer_swipe_time;
                        debugInfo("放弃本地存储数据");
                        debugInfo("从默认值模块获取默认值: " + swipe_time);
                    } else {
                        debugInfo("继续使用本地存储数据");
                    }
                } else {
                    let increment = swipe_time < 120 ? 5 : 50; // h110, 115, 120, 170, 220, 270, 320...
                    swipe_time += increment;
                    debugInfo("参数增量: " + increment);
                }
            }
            if (maxTryTimesReached()) {
                continuous_swipe[swipe_time] = 0;
                storage_unlock.put("config", Object.assign(
                    {},
                    storage_unlock.get("config", {}),
                    {continuous_swipe: continuous_swipe}
                ));
                return errorMsg("消除解锁页面提示层失败");
            }

            device.cancelOn();

            debugInfo("解锁页面提示层消除成功");

            if (swipe_time !== storage_swipe_time) {
                storage_unlock.put("config", Object.assign(
                    {},
                    storage_unlock.get("config", {}),
                    {unlock_dismiss_layer_swipe_time: swipe_time}
                ));
                debugInfo("存储滑动时长参数: " + swipe_time);
            }

            let new_continuous_swipe_times = continuous_swipe[swipe_time] + 1;
            continuous_swipe[swipe_time] = new_continuous_swipe_times;
            storage_unlock.put("config", Object.assign(
                {},
                storage_unlock.get("config", {}),
                {continuous_swipe: continuous_swipe}
            ));
            debugInfo("存储连续成功滑动次数: " + new_continuous_swipe_times);
            if (new_continuous_swipe_times >= 6 && !~swipe_time_reliable.indexOf(swipe_time)) {
                debugInfo("当前滑动时长可信度已达标");
                swipe_time_reliable.unshift(swipe_time);
            }

            if (!equalObjects(swipe_time_reliable, storage_swipe_time_reliable)) {
                let new_value = swipe_time_reliable[0];
                if (!~storage_swipe_time_reliable.indexOf(new_value)) {
                    debugInfo("存储可信滑动时长数据: " + new_value);
                }
                storage_unlock.put("config", Object.assign(
                    {},
                    storage_unlock.get("config", {}),
                    {swipe_time_reliable: swipe_time_reliable}
                ));
            }
        }

        function unlockLockView() {
            if (!unlock_code) return errorMsg("密码为空");

            let pin_unlock_identifies = ["com.android.systemui:id/lockPattern"];

            device.keepOn(5);

            checkLockPatternView() && unlockPattern()
            || checkPasswordView() && unlockPassword()
            || checkPinView() && unlockPin()
            || handleSpecials();

            device.cancelOn();

            // tool function(s) //

            function unlockPattern() {
                let max_try_times_unlock_pattern = unlock_max_try_times;
                let current_try_unlock_pattern = 0;
                let maxTryTimesReached = () => current_try_unlock_pattern > max_try_times_unlock_pattern;
                let unlock_pattern_strategy = config_unlock.unlock_pattern_strategy;
                let unlock_pattern_swipe_time_name = "unlock_pattern_swipe_time_" + unlock_pattern_strategy;
                let unlock_pattern_swipe_time = config_unlock[unlock_pattern_swipe_time_name];

                let data_from_storage_flag = !!unlock_pattern_swipe_time;
                let chances_for_storage_data = 3;

                while (!maxTryTimesReached()) {
                    let retry_info = " (" + current_try_unlock_pattern + "\/" + max_try_times_unlock_pattern + ")";
                    debugInfo(current_try_unlock_pattern++ ? "重试图案密码解锁" + retry_info : "尝试图案密码解锁");
                    debugInfo("滑动时长参数: " + unlock_pattern_swipe_time);

                    let gesture_pts_params = getGesturePtsParams() || errorMsg("图案解锁方案失败", "无法获取点阵布局");
                    let gesture_actions = {
                        segmental: () => {
                            let gestures_pts_params = [];
                            for (let i = 0; i < gesture_pts_params.length - 1; i += 1) {
                                let pt1 = gesture_pts_params[i];
                                let pt2 = gesture_pts_params[i + 1];
                                gestures_pts_params.push([
                                    (unlock_pattern_swipe_time - 50) * i,
                                    unlock_pattern_swipe_time,
                                    [pt1["0"], pt1["1"]],
                                    [pt2["0"], pt2["1"]]
                                ]);
                            }
                            gestures.apply(null, gestures_pts_params);
                        },
                        solid: () => gesture.apply(null, [unlock_pattern_swipe_time].concat(gesture_pts_params)),
                    };

                    try {
                        gesture_actions[unlock_pattern_strategy]();
                    } catch (e) {
                        messageAction(e.message, 4, 0, 0, "both");
                    }

                    if (checkUnlockResult()) break;
                    debugInfo("图案解锁未成功");
                    if (data_from_storage_flag) {
                        if (--chances_for_storage_data < 0) {
                            data_from_storage_flag = false;
                            unlock_pattern_swipe_time = config_unlock[unlock_pattern_swipe_time_name];
                        }
                    } else unlock_pattern_swipe_time += 80;
                }

                if (maxTryTimesReached()) return errorMsg("图案解锁方案失败");

                debugInfo("图案解锁成功");
                if (unlock_pattern_swipe_time !== config_unlock[unlock_pattern_swipe_time_name]) {
                    config_unlock[unlock_pattern_swipe_time_name] = unlock_pattern_swipe_time;
                    storage_unlock.put("config", config_unlock);
                    debugInfo("存储滑动时长参数: " + unlock_pattern_swipe_time);
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
                    if (typeof unlock_code === "string") {
                        gesture_pts_params = unlock_code.match(/[^1-9]+/)
                            ? unlock_code.split(/[^1-9]+/).join(" ").split(" ")
                            : unlock_code.split("");
                    }
                    gesture_pts_params = simplifyCode(gesture_pts_params, unlock_pattern_size);

                    return gesture_pts_params
                        .filter(value => +value && points[value])
                        .map(value => [points[value].x, points[value].y]);

                    // tool function(s) //

                    function waitForBoundsStable(view) {
                        let bounds = null;
                        let thread_bounds_stable = threads.start(function () {
                            let [l, t, r, b] = Array(4).join("1").split("1").map(() => null);
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

                    function simplifyCode(arr, side) {
                        let coords = {};
                        let p = 1;
                        for (let i = 1; i <= side; i += 1) {
                            for (let j = 1; j <= side; j += 1) {
                                coords[p++] = [i, j];
                            }
                        }

                        let k = (u1, u2) => {
                            let p1 = coords[u1];
                            let p2 = coords[u2];
                            if (!p1 || !p2) return NaN;
                            return (p2[1] - p1[1]) / (p2[0] - p1[0]);
                        };
                        let tmp_k = NaN;
                        for (let u = 0, len = arr.length; u < len - 1; u += 1) {
                            let current_k = k(arr[u + 1], arr[u]);
                            if (current_k !== tmp_k) tmp_k = current_k;
                            else delete arr[u];
                        }
                        arr = arr.filter(x => typeof x !== "undefined");
                        for (z = arr.length - 1; z > 0; z -= 1) {
                            if (arr[z] === arr[z - 1]) arr.splice(z, 1);
                        }
                        return arr;
                    }
                }
            }

            function unlockPassword() {
                let pw = classof(unlock_code, "Array") ? unlock_code.join("") : unlock_code;
                let kw_confirm_btn = type => sel.pickup([/确.|完成|[Cc]onfirm|[Ee]nter/, {
                    className: "Button",
                    clickable: true,
                }], "", type);

                let max_try_unlock_pw = unlock_max_try_times;
                let current_try_pw = 0;
                let maxTryTimesReached = () => current_try_pw > max_try_unlock_pw;

                while (!maxTryTimesReached()) {
                    let retry_info = " (" + current_try_pw + "\/" + max_try_unlock_pw + ")";
                    debugInfo(current_try_pw++ ? "重试密码解锁" + retry_info : "尝试密码解锁");
                    kw_password_view.setText(pw);
                    if (!handleSpecialPwSituations()) return;
                    let confirm_btn_node = kw_confirm_btn("node");
                    if (confirm_btn_node) {
                        debugInfo("点击\"" + kw_confirm_btn("txt") + "\"按钮");
                        try {
                            clickAction(confirm_btn_node, "widget");
                        } catch (e) {
                            debugInfo("按钮点击可能未成功");
                        }
                    }
                    if (checkUnlockResult()) break;
                    if (!shell("input keyevent 66", true).code) debugInfo("使用Root权限模拟回车键");
                }

                if (maxTryTimesReached()) return errorMsg(["密码解锁方案失败", "可能是密码错误", "或无法点击密码确认按钮"]);

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
                        if (classof(suf_char_refill, "JavaObject")) {
                            debugInfo("辅助后置填充类型: 控件");
                            clickAction(suf_char_refill);
                        } else if (classof(suf_char_refill, "Array")) {
                            debugInfo("辅助后置填充类型: 坐标");
                            click(suf_char_refill[0], suf_char_refill[1]);
                        } else if (typeof suf_char_refill === "number" || typeof suf_char_refill === "string") {
                            debugInfo("辅助后置填充类型: 文本");
                            clickAction(idMatches("(key.?)?" + suf_char_refill)) ||
                            clickAction(descMatches("(key.?)?" + suf_char_refill)) ||
                            clickAction([textMatches("(key.?)?" + suf_char_refill)]);
                        } else {
                            return errorMsg("解锁失败", "无法判断末位字符类型");
                        }

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
                let getNumsBySingleDesc = (num) => {
                    let node = desc(num).findOnce();
                    if (+num === 0 && !node) {
                        let getCenterCoords = (num) => {
                            let bounds = desc(num).findOnce().bounds();
                            return {x: bounds.centerX(), y: bounds.centerY()};
                        };
                        let viii = getCenterCoords(8);
                        let v = getCenterCoords(5);
                        let ii = getCenterCoords(2);

                        let getZeroCoord = n => viii[n] + (v[n] - ii[n]); // $8 + ( $5 - $2 )
                        return [getZeroCoord("x"), getZeroCoord("y")]; // [ x, y ] -- coords array
                    }
                    return desc(num);
                };

                while (unlock_max_try_times--) {
                    unlockPinNow();
                    if (checkUnlockResult()) break;
                    if (clickAction(id("com.android.systemui:id/key_enter"), "widget")) debugInfo("点击key_enter控件");
                    if (checkUnlockResult()) break;
                }

                if (unlock_max_try_times < 0) return errorMsg(["PIN解锁方案失败", "可能是密码错误"]);

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
                    return errorMsg("无可用的PIN解锁参考控件");

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
                        // there is no need to check "0"
                        // as a special treatment will be given in getNumsBySingleDesc()
                        let test_nums = "123456789";
                        let splits = test_nums.split("");
                        for (let i = 0, len = splits.length; i < len; i += 1) {
                            if (!func(splits[i]).exists()) errorMsg(["PIN解锁方案失败", "未能通过全部控件检测"]);
                        }
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
                try {
                    clickAction(kw_ok_btn, "widget") && sleep(1000);
                } catch (e) {
                    // nothing to do here
                }
                if (cond_try_again()) {
                    debugInfo("正在等待重试超时");
                    waitForAction(() => !cond_try_again(), 65000);
                }
                return waitForAction(isUnlocked, 1000);
            }
        }

        // tool function(s) //

        function errorMsg(message) {
            device.cancelOn();
            let msg = typeof message === "string" ? [message] : message.slice(); // may be dangerous
            messageAction("解锁失败", 4, 1, 0, "up");
            msg.forEach(msg => msg && messageAction(msg, 4, 0, 1));
            messageAction(device_intro, 4, 0, 1, 1);
            captureErrScreen("unlock_failed", 1);
            init_screen_state && messageAction("自动关闭屏幕" + (keycode(26) ? "" : "失败"), 1, 0, 0, 1);
            exit();
        }

        function wakeupDeviceIfNeeded() {
            if (isScreenOn()) return;

            let max_try_times_wakeup = 6; // 3 sec
            let current_try_wakeup = 0;
            let maxTryTimesReached = () => current_try_wakeup > max_try_times_wakeup;

            while (!maxTryTimesReached()) {
                let retry_info = " (" + current_try_wakeup + "\/" + max_try_times_wakeup + ")";
                debugInfo(current_try_wakeup++ ? "重试唤起设备" + retry_info : "尝试唤起设备");
                wakeUpDevice();
                if (waitForAction(isScreenOn, 500, 100)) break;
            }

            return maxTryTimesReached() ? errorMsg("设备唤起失败") : debugInfo("设备唤起成功");
        }
    },
};

// internal modules //

function loadInternalModuleMonsterFunc() {
    return {
        messageAction: messageAction,
        waitForAction: waitForAction,
        keycode: keycode,
        clickAction: clickAction,
        getDisplayParams: getDisplayParams,
        debugInfo: debugInfo,
        captureErrScreen: captureErrScreen,
        equalObjects: equalObjects,
        deepCloneObject: deepCloneObject,
        setDeviceProto: setDeviceProto,
        getSelector: getSelector,
        classof: classof,
    };

    // some may be used by a certain monster function(s) even though not showing up above
    // monster function(s) //

    function restartThisEngine(params) {
        let _params = params || {};

        let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
        let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, "", _params.debug_info_flag);

        let _my_engine = engines.myEngine();
        let _my_engine_id = _my_engine.id;

        let _max_restart_engine_times_argv = _my_engine.execArgv.max_restart_engine_times;
        let _max_restart_engine_times_params = _params.max_restart_engine_times;
        let _max_restart_engine_times;
        let _instant_run_flag = !!_params.instant_run_flag;
        if (typeof _max_restart_engine_times_argv === "undefined") {
            if (typeof _max_restart_engine_times_params === "undefined") _max_restart_engine_times = 1;
            else _max_restart_engine_times = _max_restart_engine_times_params;
        } else _max_restart_engine_times = _max_restart_engine_times_argv;

        _max_restart_engine_times = +_max_restart_engine_times;
        let _max_restart_engine_times_backup = +_my_engine.execArgv.max_restart_engine_times_backup || _max_restart_engine_times;

        if (!_max_restart_engine_times) {
            _messageAction("引擎重启已拒绝", 3);
            return !~_messageAction("引擎重启次数已超限", 3, 0, 1);
        }

        _debugInfo("重启当前引擎任务");
        _debugInfo(">当前次数: " + (_max_restart_engine_times_backup - _max_restart_engine_times + 1));
        _debugInfo(">最大次数: " + _max_restart_engine_times_backup);
        let _file_name = _params.new_file || _my_engine.source.toString();
        if (_file_name.match(/^\[remote]/)) _messageAction("远程任务不支持重启引擎", 8, 1, 0, 1);

        let _file_path = files.path(_file_name.match(/\.js$/) ? _file_name : (_file_name + ".js"));
        _debugInfo("运行新引擎任务:\n" + _file_path);
        engines.execScriptFile(_file_path, {
            arguments: Object.assign({}, _params, {
                max_restart_engine_times: _max_restart_engine_times - 1,
                max_restart_engine_times_backup: _max_restart_engine_times_backup,
                instant_run_flag: _instant_run_flag,
            }),
        });
        _debugInfo("强制停止旧引擎任务");
        // _my_engine.forceStop();
        engines.all().filter(e => e.id === _my_engine_id).forEach(e => e.forceStop());
        return true;

        // raw function(s) //

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
        }

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }

    function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
        let _msg = msg || "";
        if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
            return messageAction("[ " + msg + " ]", 1, if_toast, if_arrow, if_split_line, params);
        }

        let _msg_level = typeof msg_level === "number" ? msg_level : -1;
        let _if_toast = if_toast || false;
        let _if_arrow = if_arrow || false;
        let _if_split_line = if_split_line || false;

        let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;

        if (_if_toast) toast(_msg);

        let _split_line_style = "solid";
        if (typeof _if_split_line === "string") {
            if (_if_split_line.match(/dash/)) _split_line_style = "dash";
            if (_if_split_line.match(/both|up/)) {
                if (_split_line_style !== global["_$_last_cnsl_split_ln_type"]) {
                    _showSplitLine("", _split_line_style);
                }
                delete global["_$_last_cnsl_split_ln_type"];
                if (_if_split_line.match(/_n|n_/)) _if_split_line = "\n";
                else if (_if_split_line.match(/both/)) _if_split_line = 1;
                else if (_if_split_line.match(/up/)) _if_split_line = 0;
            }
        }

        if (_if_arrow) {
            if (_if_arrow > 10) {
                console.warn("-> \"if_arrow\"参数大于10");
                _if_arrow = 10;
            }
            _msg = "> " + _msg;
            for (let i = 0; i < _if_arrow; i += 1) _msg = "-" + _msg;
        }

        let _exit_flag = false;
        let _throw_error_flag = false;
        switch (_msg_level) {
            case 0:
            case "verbose":
            case "v":
                _msg_level = 0;
                console.verbose(_msg);
                break;
            case 1:
            case "log":
            case "l":
                _msg_level = 1;
                console.log(_msg);
                break;
            case 2:
            case "i":
            case "info":
                _msg_level = 2;
                console.info(_msg);
                break;
            case 3:
            case "warn":
            case "w":
                _msg_level = 3;
                console.warn(_msg);
                break;
            case 4:
            case "error":
            case "e":
                _msg_level = 4;
                console.error(_msg);
                break;
            case 8:
            case "x":
                _msg_level = 4;
                console.error(_msg);
                _exit_flag = true;
                break;
            case 9:
            case "t":
                _msg_level = 4;
                console.error(_msg);
                _throw_error_flag = true;
        }
        if (_if_split_line) {
            let show_split_line_extra_str = "";
            if (typeof _if_split_line === "string") {
                if (_if_split_line.match(/dash/)) {
                    show_split_line_extra_str = _if_split_line.match(/_n|n_/) ? "\n" : ""
                } else {
                    show_split_line_extra_str = _if_split_line;
                }
            }
            if (!show_split_line_extra_str.match(/\n/)) {
                global["_$_last_cnsl_split_ln_type"] = _split_line_style || "solid";
            }
            _showSplitLine(show_split_line_extra_str, _split_line_style);
        } else {
            delete global["_$_last_cnsl_split_ln_type"];
        }
        if (_throw_error_flag) {
            ui.post(function () {
                throw ("FORCE_STOP");
            });
            exit();
        } else if (_exit_flag) exit();
        return !(_msg_level in {3: 1, 4: 1});

        // raw function(s) //

        function showSplitLineRaw(extra_str, style) {
            let _extra_str = extra_str || "";
            let _split_line = "";
            if (style === "dash") {
                for (let i = 0; i < 16; i += 1) _split_line += "- ";
                _split_line += "-";
            } else {
                for (let i = 0; i < 32; i += 1) _split_line += "-";
            }
            return ~console.log(_split_line + _extra_str);
        }
    }

    function showSplitLine(extra_str, style, params) {
        let _extra_str = extra_str || "";
        let _split_line = "";
        if (style === "dash") {
            for (let i = 0; i < 16; i += 1) _split_line += "- ";
            _split_line += "-";
        } else {
            for (let i = 0; i < 32; i += 1) _split_line += "-";
        }
        return !!~console.log(_split_line + _extra_str);
    }

    function waitForAction(f, timeout_or_times, interval) {
        if (typeof timeout_or_times !== "number") timeout_or_times = 10000;

        let _timeout = Infinity;
        let _interval = interval || 200;
        let _times = timeout_or_times;

        if (_times <= 0 || !isFinite(_times) || isNaN(_times) || _times > 100) _times = Infinity;
        if (timeout_or_times > 100) _timeout = timeout_or_times;
        if (interval >= _timeout) _times = 1;

        let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

        let _start_timestamp = +new Date();
        while (!_checkF(f) && --_times) {
            if (+new Date() - _start_timestamp > _timeout) return false; // timed out
            sleep(_interval);
        }
        return _times > 0;

        // tool function(s) //

        function _checkF(f) {
            let _classof = o => Object.prototype.toString.call(o).slice(8, -1);

            if (typeof f === "function") return f();
            if (_classof(f) === "JavaObject") return f.toString().match(/UiObject/) ? !!f : f.exists();
            if (_classof(f) === "Array") {
                let _arr = f;
                let _logic_flag = "all";
                if (typeof _arr[_arr.length - 1] === "string") _logic_flag = _arr.pop();
                if (_logic_flag.match(/^(or|one)$/)) _logic_flag = "one";
                for (let i = 0, len = _arr.length; i < len; i += 1) {
                    if (!(typeof _arr[i]).match(/function|object/)) _messageAction("数组参数中含不合法元素", 8, 1, 0, 1);
                    if (_logic_flag === "all" && !_checkF(_arr[i])) return false;
                    if (_logic_flag === "one" && _checkF(_arr[i])) return true;
                }
                return _logic_flag === "all";
            }

            _messageAction("\"waitForAction\"传入f参数不合法\n\n" + f.toString() + "\n", 8, 1, 1, 1);
        }

        // raw function(s) //

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
        }
    }

    function clickAction(f, strategy, params) {
        if (typeof f === "undefined" || f === null) return false;

        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _params = params || {};

        let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
        let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;

        /**
         * @type {string} - "Bounds"|"UiObject"|"UiSelector"|"CoordsArray"
         */
        let _type = _checkType(f);
        f
        let _padding = _checkPadding(_params.padding);
        if (!((typeof strategy).match(/string|undefined/))) _messageAction("clickAction()的策略参数无效", 8, 1, 0, 1);
        let _strategy = (strategy || "click").toString();
        let _widget_id = 0;
        let _widget_parent_id = 0;

        let _condition_success = _params.condition_success;

        let _check_time_once = _params.check_time_once || 500;
        let _max_check_times = _params.max_check_times || 0;
        if (!_max_check_times && _condition_success) _max_check_times = 3;

        if (typeof _condition_success === "string" && _condition_success.match(/disappear/)) {
            _condition_success = () => _type.match(/^Ui/) ? _checkDisappearance() : true;
        } else if (typeof _condition_success === "undefined") _condition_success = () => true;

        while (~_clickOnce() && _max_check_times--) {
            if (_waitForAction(() => _condition_success(), _check_time_once, 50)) return true;
        }
        return _condition_success();

        // tool function(s) //

        function _clickOnce() {
            let _x = 0 / 0;
            let _y = 0 / 0;

            if (_type === "UiSelector") {
                let _node = f.findOnce();
                if (!_node) return;
                try {
                    _widget_id = _node.toString().match(/@\w+/)[0].slice(1);
                } catch (e) {
                    _widget_id = 0;
                }
                if (_strategy.match(/^w(idget)?$/) && _node.clickable() === true) return _node.click();
                let _bounds = _node.bounds();
                _x = _bounds.centerX();
                _y = _bounds.centerY();
            } else if (_type === "UiObject") {
                try {
                    _widget_parent_id = f.parent().toString().match(/@\w+/)[0].slice(1);
                } catch (e) {
                    _widget_parent_id = 0;
                }
                if (_strategy.match(/^w(idget)?$/) && f.clickable() === true) return f.click();
                let _bounds = f.bounds();
                _x = _bounds.centerX();
                _y = _bounds.centerY();
            } else if (_type === "Bounds") {
                if (_strategy.match(/^w(idget)?$/)) {
                    _strategy = "click";
                    _messageAction("clickAction()控件策略已改为click", 3);
                    _messageAction("无法对Rect对象应用widget策略", 3, 0, 1);
                }
                _x = f.centerX();
                _y = f.centerY();
            } else {
                if (_strategy.match(/^w(idget)?$/)) {
                    _strategy = "click";
                    _messageAction("clickAction()控件策略已改为click", 3);
                    _messageAction("无法对坐标组应用widget策略", 3, 0, 1);
                }
                _x = f[0];
                _y = f[1];
            }
            if (isNaN(_x) || isNaN(_y)) {
                _messageAction("clickAction()内部坐标值无效", 4, 1);
                _messageAction("(" + _x + ", " + _y + ")", 8, 0, 1, 1);
            }
            _x += _padding.x;
            _y += _padding.y;

            _strategy.match(/^m(atch)?$/) ? press(_x, _y, _params.press_time || 1) : click(_x, _y);
        }

        function _checkType(f) {
            let _checkJavaObject = o => {
                if (_classof(o) !== "JavaObject") return;
                let string = o.toString();
                if (string.match(/^Rect\(/)) return "Bounds";
                if (string.match(/UiObject/)) return "UiObject";
                return "UiSelector";
            };
            let _checkCoordsArray = arr => {
                if (_classof(f) !== "Array") return;
                if (arr.length !== 2) _messageAction("clickAction()坐标参数非预期值: 2", 8, 1, 0, 1);
                if (typeof arr[0] !== "number" || typeof arr[1] !== "number") _messageAction("clickAction()坐标参数非number", 8, 1, 0, 1);
                return "CoordsArray";
            };
            let _type_f = _checkJavaObject(f) || _checkCoordsArray(f);
            if (!_type_f) _messageAction("clickAction()f参数类型未知", 8, 1, 0, 1);
            return _type_f;
        }

        function _checkPadding(arr) {
            if (!arr) return {x: 0, y: 0};

            let _coords = [];
            if (typeof arr === "number") _coords = [0, arr];
            else if (_classof(arr) !== "Array") _messageAction("clickAction()坐标偏移参数类型未知", 8, 1, 0, 1);
            else {
                let _arr_len = arr.length;
                if (_arr_len === 1) _coords = [0, arr[0]];
                else if (_arr_len === 2) {
                    let _arr_param_0 = arr[0];
                    if (_arr_param_0 === "x") _coords = [arr[1], 0];
                    else if (_arr_param_0 === "y") _coords = [0, arr[1]];
                    else _coords = arr;
                } else _messageAction("clickAction()坐标偏移参数数组个数不合法", 8, 1, 0, 1);
            }
            let _x = +_coords[0];
            let _y = +_coords[1];
            if (isNaN(_x) || isNaN(_y)) _messageAction("clickAction()坐标偏移计算值不合法", 8, 1, 0, 1);
            return {
                x: _x,
                y: _y,
            };
        }

        function _checkDisappearance() {
            try {
                if (_type === "UiSelector") {
                    let _node = f.findOnce();
                    if (!_node) return true;
                    return _params.condition_success.match(/in.?place/) ? _node.toString().match(/@\w+/)[0].slice(1) !== _widget_id : !_node;
                } else if (_type === "UiObject") {
                    let _node_parent = f.parent();
                    if (!_node_parent) return true;
                    return _node_parent.toString().match(/@\w+/)[0].slice(1) !== _widget_parent_id;
                }
            } catch (e) {
                return true
            }
            return true;
        }

        // raw function(s) //

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
        }

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10000;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }
    }

    function tryRequestScreenCapture(params) {
        global["$flag"] = global["$flag"] || {};
        let $flag = global["$flag"];

        if ($flag.request_screen_capture) return true;

        sleep(200); // why are you always a naughty boy... how can i get along well with you...

        let _params = params || {};

        let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _info_flag, _params.debug_info_flag);
        let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
        let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
        let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;
        let _restartThisEngine = typeof restartThisEngine === "undefined" ? restartThisEngineRaw : restartThisEngine;
        let _getSelector = typeof getSelector === "undefined" ? getSelectorRaw : getSelector;

        let sel = _getSelector();

        _params.restart_this_engine_flag = typeof _params.restart_this_engine_flag === "undefined" ? true : !!_params.restart_this_engine_flag;
        _params.restart_this_engine_params = _params.restart_this_engine_params || {};
        _params.restart_this_engine_params.max_restart_engine_times = _params.restart_this_engine_params.max_restart_engine_times || 3;

        _debugInfo("开始申请截图权限");

        $flag.request_screen_capture = true;
        _debugInfo("已存储截图权限申请标记");

        _debugInfo("已开启弹窗监测线程");
        let _thread_prompt = threads.start(function () {
            let _kw_no_longer_prompt = type => sel.pickup(id("com.android.systemui:id/remember"), type, "kw_req_capt_no_longer_prompt");
            let _kw_sure_btn = type => sel.pickup(/START NOW|立即开始|允许/, type);

            if (_waitForAction(_kw_sure_btn, 5000)) {
                if (_waitForAction(_kw_no_longer_prompt, 1000)) {
                    _debugInfo("勾选\"不再提示\"复选框");
                    _clickAction(_kw_no_longer_prompt(), "widget");
                }
                if (_waitForAction(_kw_sure_btn, 2000)) {
                    let _node = _kw_sure_btn();
                    let _btn_click_action_str = "点击\"" + _kw_sure_btn("txt") + "\"按钮";

                    _debugInfo(_btn_click_action_str);
                    _clickAction(_node, "widget");

                    if (!_waitForAction(() => !_kw_sure_btn(), 1000)) {
                        _debugInfo("尝试click()方法再次" + _btn_click_action_str);
                        _clickAction(_node, "click");
                    }
                }
            }
        });

        let _thread_monitor = threads.start(function () {
            if (_waitForAction(() => !!_req_result, 2000, 500)) {
                _thread_prompt.interrupt();
                return _debugInfo("截图权限申请结果: " + _req_result);
            }
            if (!$flag.debug_info_avail) {
                $flag.debug_info_avail = true;
                _debugInfo("开发者测试模式已自动开启", 3);
            }
            if (_params.restart_this_engine_flag) {
                _debugInfo("截图权限申请结果: 失败", 3);
                try {
                    if (android.os.Build.MANUFACTURER.toLowerCase().match(/xiaomi/)) {
                        _debugInfo("__split_line__dash_");
                        _debugInfo("检测到当前设备制造商为小米", 3);
                        _debugInfo("可能需要给Auto.js以下权限:", 3);
                        _debugInfo(">\"后台弹出界面\"", 3);
                        _debugInfo("__split_line__dash_");
                    }
                } catch (e) {
                    // nothing to do here
                }
                if (_restartThisEngine(_params.restart_this_engine_params)) return;
            }
            _messageAction("截图权限申请失败", 9, 1, 0, 1);
        });

        let _req_result = images.requestScreenCapture(false);
        sleep(300);

        _thread_monitor.join(2400);
        _thread_monitor.interrupt();
        return _req_result;

        // raw function(s) //

        function getSelectorRaw() {
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            let sel = selector();
            sel.__proto__ = {
                pickup: (filter) => {
                    if (classof(filter) === "JavaObject") {
                        if (filter.toString().match(/UiObject/)) return filter;
                        return filter.findOnce() || null;
                    }
                    if (typeof filter === "string") return desc(filter).findOnce() || text(filter).findOnce() || null;
                    if (classof(filter) === "RegExp") return descMatches(filter).findOnce() || textMatches(filter).findOnce() || null;
                    return null;
                },
            };
            return sel;
        }

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10000;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }

        function clickActionRaw(kw) {
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            let _kw = classof(_kw) === "Array" ? kw[0] : kw;
            let _key_node = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
            if (!_key_node) return;
            let _bounds = _key_node.bounds();
            click(_bounds.centerX(), _bounds.centerY());
            return true;
        }

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
        }

        function restartThisEngineRaw(params) {
            let _params = params || {};
            let _my_engine = engines.myEngine();

            let _max_restart_engine_times_argv = _my_engine.execArgv.max_restart_engine_times;
            let _max_restart_engine_times_params = _params.max_restart_engine_times;
            let _max_restart_engine_times;
            let _instant_run_flag = !!_params.instant_run_flag;
            if (typeof _max_restart_engine_times_argv === "undefined") {
                if (typeof _max_restart_engine_times_params === "undefined") _max_restart_engine_times = 1;
                else _max_restart_engine_times = +_max_restart_engine_times_params;
            } else _max_restart_engine_times = +_max_restart_engine_times_argv;

            if (!_max_restart_engine_times) return;

            let _file_name = _params.new_file || _my_engine.source.toString();
            if (_file_name.match(/^\[remote]/)) return ~console.error("远程任务不支持重启引擎") && exit();
            let _file_path = files.path(_file_name.match(/\.js$/) ? _file_name : (_file_name + ".js"));
            engines.execScriptFile(_file_path, {
                arguments: {
                    max_restart_engine_times: _max_restart_engine_times - 1,
                    instant_run_flag: _instant_run_flag,
                },
            });
            _my_engine.forceStop();
        }
    }

    function keycode(keycode_name, params_str) {
        params_str = params_str || "";

        let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;

        if (params_str.match(/force.*shell/i)) return keyEvent(keycode_name);
        let _tidy_keycode_name = keycode_name.toString().toLowerCase().replace(/^keycode_|s$/, "").replace(/_([a-z])/g, ($0, $1) => $1.toUpperCase());
        let first_result = simulateKey();
        return params_str.match(/double/) ? simulateKey() : first_result;

        // tool function(s) //

        function keyEvent(keycode_name) {
            let _key_check = {
                "26, power": checkPower,
            };
            for (let _key in _key_check) {
                if (_key_check.hasOwnProperty(_key)) {
                    if (~_key.split(/ *, */).indexOf(_tidy_keycode_name)) return _key_check[_key]();
                }
            }
            return shellInputKeyEvent(keycode_name);

            // tool function(s) //

            function shellInputKeyEvent(keycode_name) {
                let shell_result = false;
                try {
                    shell_result = !shell("input keyevent " + keycode_name, true).code;
                } catch (e) {
                    // nothing to do here
                }
                return shell_result ? true : (!params_str.match(/no.*err(or)?.*(message|msg)/) && !!keyEventFailedMsg());

                // tool function(s) //

                function keyEventFailedMsg() {
                    messageAction("按键模拟失败", 0);
                    messageAction("键值: " + keycode_name, 0, 0, 1);
                }
            }

            function checkPower() {
                let isScreenOn = () => device.isScreenOn();
                let isScreenOff = () => !isScreenOn();
                if (isScreenOff()) {
                    device.wakeUp();
                    let max_try_times_wake_up = 10;
                    while (!_waitForAction(isScreenOn, 500) && max_try_times_wake_up--) device.wakeUp();
                    return max_try_times_wake_up >= 0;
                }
                return shellInputKeyEvent(keycode_name) ? _waitForAction(isScreenOff, 2400) : false;
            }
        }

        function simulateKey() {
            switch (_tidy_keycode_name) {
                case "3":
                case "home":
                    return ~home();
                case "4":
                case "back":
                    return ~back();
                case "appSwitch":
                case "187":
                case "recent":
                case "recentApp":
                    return ~recents();
                case "powerDialog":
                case "powerMenu":
                    return ~powerDialog();
                case "notification":
                    return ~notifications();
                case "quickSetting":
                    return ~quickSettings();
                case "splitScreen":
                    return ~splitScreen();
                default:
                    return keyEvent(keycode_name);
            }
        }

        // raw function(s) //

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10000;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }
    }

    function debugInfo(msg, info_flag, forcible_flag) {
        global["$flag"] = global["$flag"] || {};
        let $flag = global["$flag"];

        let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;
        let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

        let global_flag = $flag.debug_info_avail;
        if (!global_flag && !forcible_flag) return;
        if (global_flag === false || forcible_flag === false) return;

        let classof = o => Object.prototype.toString.call(o).slice(8, -1);

        if (typeof msg === "string" && msg.match(/^__split_line_/)) msg = setDebugSplitLine(msg);

        let info_flag_str = (info_flag || "").toString();
        let info_flag_msg_level = +(info_flag_str.match(/\d/) || [0])[0];

        if (info_flag_str.match(/Up/)) _showSplitLine();
        if (info_flag_str.match(/both|up/)) debugInfo("__split_line__" + (info_flag_str.match(/dash/) ? "dash" : ""), "", forcible_flag);

        if (classof(msg) === "Array") msg.forEach(msg => debugInfo(msg, info_flag_msg_level, forcible_flag));
        else _messageAction((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "), info_flag_msg_level);

        if (info_flag_str.match("both")) debugInfo("__split_line__" + (info_flag_str.match(/dash/) ? "dash" : ""), "", forcible_flag);

        // raw function(s) //

        function showSplitLineRaw(extra_str, style) {
            let _extra_str = extra_str || "";
            let _split_line = "";
            if (style === "dash") {
                for (let i = 0; i < 16; i += 1) _split_line += "- ";
                _split_line += "-";
            } else {
                for (let i = 0; i < 32; i += 1) _split_line += "-";
            }
            return ~console.log(_split_line + _extra_str);
        }

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
        }

        // tool function(s) //

        function setDebugSplitLine(msg) {
            let _msg = "";
            if (msg.match(/dash/)) {
                for (let i = 0; i < 16; i += 1) _msg += "- ";
                _msg += "-";
            } else {
                for (let i = 0; i < 32; i += 1) _msg += "-";
            }
            return _msg;
        }
    }

    function getDisplayParams(params) {
        global["$flag"] = global["$flag"] || {};
        let $flag = global["$flag"];

        let _params = params || {};

        let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
        let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _info_flag, _params.debug_info_flag);
        let _window_service_display = context.getSystemService(context.WINDOW_SERVICE).getDefaultDisplay();
        let [WIDTH, HEIGHT] = [];
        let display_info = {};
        if (_waitForAction(checkData, 3000, 500)) {
            display_info.cX = (num) => Math.min(Math.round(num * WIDTH / (Math.abs(num) >= 1 ? 720 : 1)), WIDTH);
            display_info.cY = (num, aspect_ratio) => Math.min(Math.round(num * WIDTH * (Math.pow(aspect_ratio, aspect_ratio > 1 ? 1 : -1) || (HEIGHT / WIDTH)) / (Math.abs(num) >= 1 ? 1280 : 1)), HEIGHT);

            if (!$flag.display_params_got) {
                _debugInfo("屏幕宽高: " + WIDTH + " × " + HEIGHT);
                _debugInfo("可用屏幕高度: " + display_info.USABLE_HEIGHT);
                $flag.display_params_got = true;
            }

            return display_info;
        }
        console.error("getDisplayParams()返回结果异常");

        // tool function(s) //

        function checkData() {
            try {
                WIDTH = +_window_service_display.getWidth();
                HEIGHT = +_window_service_display.getHeight();
                if (!(WIDTH * HEIGHT)) throw Error();

                let ORIENTATION = +_window_service_display.getOrientation(); // left: 1, right: 3, portrait: 0 (or 2 ?)
                let MAX = +_window_service_display.maximumSizeDimension;

                let [USABLE_HEIGHT, USABLE_WIDTH] = [HEIGHT, WIDTH];

                ORIENTATION in {0: true, 2: true} ? [USABLE_HEIGHT, HEIGHT] = [HEIGHT, MAX] : [USABLE_WIDTH, WIDTH] = [WIDTH, MAX];

                return display_info = {
                    WIDTH: WIDTH,
                    USABLE_WIDTH: USABLE_WIDTH,
                    HEIGHT: HEIGHT,
                    USABLE_HEIGHT: USABLE_HEIGHT,
                    screen_orientation: ORIENTATION,
                    status_bar_height: getDataByDimenName("status_bar_height"),
                    navigation_bar_height: getDataByDimenName("navigation_bar_height"),
                    navigation_bar_height_computed: ORIENTATION in {0: true, 2: true} ? HEIGHT - USABLE_HEIGHT : WIDTH - USABLE_WIDTH,
                    action_bar_default_height: getDataByDimenName("action_bar_default_height"),
                };
            } catch (e) {
                try {
                    WIDTH = +device.width;
                    HEIGHT = +device.height;
                    if (!(WIDTH * HEIGHT)) throw Error();
                    return display_info = {
                        WIDTH: WIDTH,
                        HEIGHT: HEIGHT,
                        USABLE_HEIGHT: ~~(HEIGHT * 0.9), // evaluated value
                    };
                } catch (e) {

                }
            }

            // tool function(s) //

            function getDataByDimenName(name) {
                let resources = context.getResources();
                let resource_id = resources.getIdentifier(name, "dimen", "android");
                return resource_id > 0 ? resources.getDimensionPixelSize(resource_id) : NaN;
            }
        }

        // raw function(s) //

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10000;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
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
            let used_obj_b_indices = [];
            for (let i = 0, len = obj_a.length; i < len; i += 1) {
                if (!function () {
                    let a = obj_a[i];
                    for (let j = 0, len_j = obj_b.length; j < len_j; j += 1) {
                        if (~used_obj_b_indices.indexOf(j)) continue;
                        if (equalObjects(a, obj_b[j])) {
                            used_obj_b_indices.push(j);
                            return true;
                        }
                    }
                }()) return false;
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

    function captureErrScreen(key_name, log_level) {
        let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
        let _tryRequestScreenCapture = typeof tryRequestScreenCapture === "undefined" ? tryRequestScreenCaptureRaw : tryRequestScreenCapture;

        _tryRequestScreenCapture();

        let path = files.getSdcardPath() + "/.local/Pics/Err/" + key_name + "_" + getTimeStr() + ".png";

        files.createWithDirs(path);
        captureScreen(path);
        _messageAction("已存储屏幕截图文件:", log_level);
        _messageAction(path, log_level);

        // tool function(s) //

        function getTimeStr() {
            let now = new Date();
            let padZero = num => (num < 10 ? "0" : "") + num;
            return now.getFullYear() + padZero(now.getMonth() + 1) + padZero(now.getDate())
                + padZero(now.getHours()) + padZero(now.getMinutes()) + padZero(now.getSeconds());
        }

        // raw function(s) //

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
        }

        function tryRequestScreenCaptureRaw() {
            global["$flag"] = global["$flag"] || {};
            let $flag = global["$flag"];
            if (!$flag.request_screen_capture) {
                images.requestScreenCapture();
                sleep(300);
                $flag.request_screen_capture = true;
            }
        }
    }

    function getSelector(params) {
        let parent_params = params || {};
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, "", parent_params.debug_info_flag);
        let sel = global["selector"]();
        sel.__proto__ = sel.__proto__ || {};
        Object.assign(sel.__proto__, {
            kw_pool: {},
            cache_pool: {},
            /**
             * Returns a selector (UiSelector) or node (UiObject) or some attribute
             * If no nodes (UiObjects) were found, returns null or "" or false
             * If memory_keyword was found in this session memory, use a memorized selector directly without selecting
             * @memberOf getSelector
             * @param selector_body {string|RegExp|array} - selector body will be converted into array type
             * <br>
             *     -- array: [ [selector_body] {*}, <[additional_selectors] {array|object}>, [compass] {string} ]
             *     -- additional_selectors can be treated as compass by checking its type (whether object or string)
             * @param [mem_kw {string|null}] - to mark this selector node; better use a keyword without conflict
             * @param [result_type="node"] {string} - "node", "txt", "text", "desc", "id", "bounds", "exist(s)" and so forth
             * <br>
             *     -- "txt": available text()/desc() value or empty string
             * @param [params] {object}
             * @param [params.selector_prefer="desc"] {string} - unique selector you prefer to check first; "text" or "desc"
             * @param [params.debug_info_flag] {boolean}
             * @returns {UiObject|UiSelector|string|boolean|Rect|*} - default: UiObject
             * @example
             * pickup("abc"); -- text/desc/id("abc").findOnce() or null; <br>
             * pickup("abc", "node", "my_alphabet"); -- same as above; <br>
             * pickup("abc", "sel", "my_alphabet"); -- text/desc/id("abc") or null -- selector <br>
             * pickup(text("abc"), "node", "my_alphabet"); -- text("abc").findOnce() or null <br>
             * pickup(/^abc.+z/, "sel_str", "AtoZ") -- id/text/desc or "" -- string <br>
             * pickup("morning", "exists"); -- text/desc/id("morning").exists() -- boolean <br>
             * pickup(["morning", "p2c3"], "id"); -- text/desc/id("morning").findOnce().parent().parent().child(3).id() <br>
             * pickup(["hello", "s3b"], "txt"); -- text/desc/id("hello").findOnce().parent().child(%childCount% - 3) -- ["txt"] <br>
             * pickup(["hello", {className: "Button"}]); -- text/desc/id("hello").className("Button").findOnce() <br>
             * pickup([desc("a").className("Button"), {boundsInside: [0, 0, 720, 1000]}, "s+1"], "clickable", "back_btn"); -- desc("a").className("Button").boundsInside(0, 0, 720, 1000).findOnce().parent().child(%indexInParent% + 1).clickable() -- boolean <br>
             */
            pickup: (selector_body, result_type, mem_kw, params) => {
                let sel_body = classof(selector_body) === "Array" ? selector_body.slice() : [selector_body];
                let _params = Object.assign({}, parent_params, params);
                result_type = (result_type || "").toString();
                let _result_type = result_type;

                if (!result_type || result_type.match(/^n(ode)?$/)) _result_type = "node";
                else if (result_type.match(/^s(el(ector)?)?$/)) _result_type = "selector";
                else if (result_type.match(/^e(xist(s)?)?$/)) _result_type = "exists";
                else if (result_type.match(/^t(xt)?$/)) _result_type = "txt";
                else if (result_type.match(/^s(el(ector)?)?(_?s|S)(tr(ing)?)?$/)) _result_type = "selector_string";

                if (typeof sel_body[1] === "string") sel_body.splice(1, 0, "");

                let _body = sel_body[0];
                let _additional_sel = sel_body[1];
                let _compass = sel_body[2];

                let _kw = _getSelector(_additional_sel);
                let _node = null;
                let _nodes = [];
                if (_kw && _kw.toString().match(/UiObject/)) {
                    _node = _kw;
                    if (_result_type === "nodes") _nodes = [_kw];
                    _kw = null;
                } else {
                    _node = _kw ? _kw.findOnce() : null;
                    if (_result_type === "nodes") _nodes = _kw ? _kw.find() : [];
                }

                if (_compass) _node = _relativeNode([_kw || _node, _compass]);

                let _result = {
                    selector: _kw,
                    node: _node,
                    nodes: _nodes,
                    exists: !!_node,
                    get selector_string() {
                        return _kw ? _kw.toString().match(/[a-z]+/)[0] : "";
                    },
                    get txt() {
                        let _text = _node && _node.text() || "";
                        let _desc = _node && _node.desc() || "";
                        return _desc.length > _text.length ? _desc : _text;
                    }
                };

                if (_result_type in _result) return _result[_result_type];

                try {
                    if (!_node) return null;
                    return _node[_result_type]();
                } catch (e) {
                    try {
                        return _node[_result_type];
                    } catch (e) {
                        debugInfo(e, 3);
                        return null;
                    }
                }

                // tool function(s)//

                function _getSelector(addition) {
                    let _mem_kw_prefix = "_MEM_KW_PREFIX_";
                    if (mem_kw) {
                        let _mem_sel = global[_mem_kw_prefix + mem_kw];
                        if (_mem_sel) return _mem_sel;
                    }
                    let _kw_sel = _getSelectorFromLayout(addition);
                    if (mem_kw && _kw_sel) {
                        // _debugInfo(["选择器已记录", ">" + mem_kw, ">" + _kw_sel]);
                        global[_mem_kw_prefix + mem_kw] = _kw_sel;
                    }
                    return _kw_sel;

                    // tool function(s) //

                    function _getSelectorFromLayout(addition) {
                        let _prefer = _params.selector_prefer;
                        let _body_class = classof(_body);

                        if (_body_class === "JavaObject") {
                            if (_body.toString().match(/UiObject/)) {
                                addition && _debugInfo("UiObject无法使用额外选择器", 3);
                                return _body;
                            }
                            return checkSelectors(_body);
                        }

                        if (typeof _body === "string") {
                            return _prefer === "text"
                                ? checkSelectors(text(_body), desc(_body), id(_body))
                                : checkSelectors(desc(_body), text(_body), id(_body));
                        }

                        if (_body_class === "RegExp") {
                            return _prefer === "text"
                                ? checkSelectors(textMatches(_body), descMatches(_body), idMatches(_body))
                                : checkSelectors(descMatches(_body), textMatches(_body), idMatches(_body));
                        }

                        // tool function(s) //

                        function checkSelectors(selectors) {
                            let sel_multi = selectors;
                            if (classof(sel_multi) !== "Array") {
                                sel_multi = [];
                                for (let i = 0, len = arguments.length; i < len; i += 1) sel_multi[i] = arguments[i];
                            }
                            for (let i = 0, len = sel_multi.length; i < len; i += 1) {
                                let result = checkSelector(sel_multi[i]);
                                if (result) return result;
                            }
                            return null;

                            // tool function(s) //

                            function checkSelector(single_sel) {
                                if (classof(addition) === "Array") {
                                    let o = {};
                                    o[addition[0]] = addition[1];
                                    addition = o;
                                }
                                if (classof(addition) === "Object") {
                                    let keys = Object.keys(addition);
                                    for (let i = 0, len = keys.length; i < len; i += 1) {
                                        let key = keys[i];
                                        if (!single_sel[key]) {
                                            _debugInfo(["无效的additional_selector属性值:", key], 3);
                                            return null;
                                        }
                                        let value = addition[key];
                                        try {
                                            single_sel = single_sel[key].apply(single_sel, classof(value) === "Array" ? value : [value]);
                                        } catch (e) {
                                            _debugInfo(["无效的additional_selector选择器:", key], 3);
                                            return null;
                                        }
                                    }
                                }
                                return single_sel.exists() ? single_sel : null;
                            }
                        }
                    }
                }

                /**
                 * Returns a relative node (UiObject) by compass string
                 * @param node_information {array|*} - [node, compass]
                 * @returns {null|UiObject}
                 * @example
                 * relativeNode([text("Alipay"), "pp"]); -- text("Alipay").findOnce().parent().parent(); <br>
                 * relativeNode([text("Alipay").findOnce(), "p2"]); -- text("Alipay").findOnce().parent().parent(); -- same as above <br>
                 * relativeNode([id("abc"), "p3c2"]); -- id("abc").findOnce().parent().parent().parent().child(2); <br>
                 * relativeNode([id("abc"), "s5"/"s5p"]); -- id("abc").findOnce().parent().child(5); -- returns an absolute sibling <br>
                 * relativeNode([id("abc"), "s5n"]); -- id("abc").findOnce().parent().child(%childCount% - 5); -- abs sibling <br>
                 * relativeNode([id("abc"), "s+3"]); -- id("abc").findOnce().parent().child(%indexInParent()% + 3); -- rel sibling <br>
                 * relativeNode([id("abc"), "s-2"]); -- id("abc").findOnce().parent().child(%indexInParent()% - 2); -- rel sibling <br>
                 */
                function _relativeNode(node_information) {
                    let classof = o => Object.prototype.toString.call(o).slice(8, -1);

                    let node_info = classof(node_information) === "Array" ? node_information.slice() : [node_information];

                    let node = node_info[0];
                    let node_class = classof(node);
                    let node_str = (node || "").toString();

                    if (typeof node === "undefined") {
                        _debugInfo("relativeNode的node参数为Undefined");
                        return null;
                    }
                    if (classof(node) === "Null") {
                        _debugInfo("relativeNode的node参数为Null");
                        return null;
                    }
                    if (node_str.match(/^Rect\(/)) {
                        // _debugInfo("relativeNode的node参数为Rect()");
                        return null;
                    }
                    if (node_class === "JavaObject") {
                        if (node_str.match(/UiObject/)) {
                            // _debugInfo("relativeNode的node参数为UiObject");
                        } else {
                            // _debugInfo("relativeNode的node参数为UiSelector");
                            node = node.findOnce();
                            if (!node) {
                                // _debugInfo("UiSelector查找后返回Null");
                                return null;
                            }
                        }
                    } else {
                        _debugInfo("未知的relativeNode的node参数", 3);
                        return null;
                    }

                    let compass = node_info[1];

                    if (!compass) {
                        // _debugInfo("relativeNode的罗盘参数为空");
                        return node;
                    }

                    compass = compass.toString();

                    try {
                        if (compass.match(/s[+\-]?\d+([fbpn](?!\d+))?/)) {
                            let relative_matched = compass.match(/s[+\-]\d+|s\d+[bn](?!\d+)/); // backwards / negative
                            let absolute_matched = compass.match(/s\d+([fp](?!\d+))?/); // forwards / positive
                            if (relative_matched) {
                                let rel_amount = parseInt(relative_matched[0].match(/[+\-]?\d+/)[0]);
                                let child_count = node.parent().childCount();
                                let current_idx = node.indexInParent();
                                node = relative_matched[0].match(/\d+[bn]/)
                                    ? node.parent().child(child_count - Math.abs(rel_amount))
                                    : node.parent().child(current_idx + rel_amount);
                            } else if (absolute_matched) {
                                node = node.parent().child(parseInt(absolute_matched[0].match(/\d+/)[0]));
                            }
                            compass = compass.replace(/s[+\-]?\d+([fbpn](?!\d+))?/, "");
                            if (!compass) return node;
                        }
                    } catch (e) {
                        return null;
                    }

                    let parents = compass.replace(/([Pp])(\d+)/g, ($0, $1, $2) => {
                        let str = "";
                        $2 = parseInt($2);
                        for (let i = 0; i < $2; i += 1) str += "p";
                        return str;
                    }).match(/p*/)[0]; // may be ""

                    let child_idx_matched = compass.match(/c\d+/g);

                    if (!parents) return child_idx_matched ? getChildNode(child_idx_matched) : node;

                    let parents_len = parents.length;
                    for (let i = 0; i < parents_len; i += 1) {
                        if (!(node = node.parent())) return null;
                    }
                    return child_idx_matched ? getChildNode(child_idx_matched) : node;

                    // tool function(s) //

                    function getChildNode(arr) {
                        if (!arr || classof(arr) !== "Array") return null;
                        for (let i = 0, len = arr.length; i < len; i += 1) {
                            if (!node.childCount()) return null;
                            try {
                                node = node.child(+arr[i].match(/\d+/));
                                if (!node) return null;
                            } catch (e) {
                                return null;
                            }
                        }
                        return node;
                    }
                }
            },
            add: function (key_name, sel_body, keyword) {
                let _kw = typeof keyword === "string" ? keyword : key_name;
                this.kw_pool[key_name] = typeof sel_body === "function"
                    ? type => sel_body(type)
                    : type => this.pickup(sel_body, type, _kw);
                return this;
            },
            get: function (key_name, type) {
                let _picker = this.kw_pool[key_name];
                if (!_picker) return null;
                if (type && type.toString().match(/cache/)) {
                    return this.cache_pool[key_name] = _picker("node");
                }
                return _picker(type);
            },
            getAndCache: function (key_name) {
                // only "node" type can be returned
                return this.get(key_name, "save_cache");
            },
            cache: {
                save: (key_name) => sel.getAndCache(key_name),
                load: (key_name, type) => {
                    let _node = sel.cache_pool[key_name];
                    if (!_node) return null;
                    return sel.pickup(sel.cache_pool[key_name], type);
                },
                refresh: (key_name) => {
                    let _cache = sel.cache_pool[key_name];
                    _cache && _cache.refresh();
                },
                reset: (key_name) => {
                    delete sel.cache_pool[key_name];
                    return sel.getAndCache(key_name);
                },
                recycle: (key_name) => {
                    let _cache = sel.cache_pool[key_name];
                    _cache && _cache.recycle();
                },
            },
        });
        // _debugInfo("选择器加入新方法");
        // Object.keys(sel.__proto__).forEach(key => _debugInfo(">" + key + "()"));
        return sel;

        // raw function(s) //

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }

    function setDeviceProto(params) {
        let _params = params || {};
        let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, "", _params.debug_info_flag);

        if (typeof global.device === "undefined") global.device = {};

        global.device.__proto__ = Object.assign((global.device.__proto__ || {}), {
            /**
             * device.keepScreenOn()
             * @memberOf setDeviceProto
             * @param [duration] {number} could be minute (less than 100) or second -- 5 and 300000 both for 5 min
             * @param [params] {object}
             * @param [params.debug_info_flag] {boolean}
             */
            keepOn: function (duration, params) {
                params = params || {};
                duration = duration || 5;
                if (duration < 100) duration *= 60000;
                device.keepScreenOn(duration);
                if (params.debug_info_flag !== false) {
                    _debugInfo("已设置屏幕常亮");
                    _debugInfo(">最大超时时间: " + +(duration / 60000).toFixed(2) + "分钟");
                }
            },
            /**
             * device.cancelKeepingAwake()
             * @memberOf setDeviceProto
             * @param [params] {object}
             * @param [params.debug_info_flag] {boolean}
             */
            cancelOn: function (params) {
                // click(Math.pow(10, 7), Math.pow(10, 7));
                params = params || {};
                device.cancelKeepingAwake();
                if (params.debug_info_flag !== false) {
                    _debugInfo("屏幕常亮已取消");
                }
            },
        });

        // raw function(s) //

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }

    function classof(source, check_value) {
        let class_result = Object.prototype.toString.call(source).slice(8, -1);
        return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
    }
} // updated at Nov 14, 2019

function loadInternalModulePWMAP() {
    return function () {
        let pwmap_path = files.getSdcardPath() + "/.local/PWMAP.txt";
        let pwmap_map = {};
        let config = {
            "code_length": 8, // 密文字串长度 - eg, 8 - "SCPrMtaB": "A"
            "code_amount": 10, // 密文映射数量 - eg, 3 - "......": "A", "......": "A", "......": "A"
            "separator": "_.|._",
            "encrypt_power": 2,
        };

        this.pwmapEncrypt = pwmapEncrypt;
        this.pwmapDecrypt = pwmapDecrypt;
        this.pwmapGenerate = pwmapGenerate;

        // main function(s) //

        function pwmapEncrypt(input) {
            checkPWMAPFile();
            let is_empty_input = !arguments.length;
            input = is_empty_input && userInput("请输入要加密的字符串") || input;
            let thread_monitor = monitorRunningTime("正在加密中 请稍候...");

            let encrypt_power = Math.min(parseInt(config.encrypt_power), 2) || 1;
            input = encrypt(input);
            encrypt_power--;
            while (encrypt_power--) input = encrypt(input.join(config.separator));

            thread_monitor.interrupt();

            let regexp = new RegExp(/[A-Za-z0-9`~!@#$%^&*()_+=\-\[\]}{'\\;:\/?.>,<| ]/);
            let encrypted = "[" + input.map(value => "\"" + value + "\"") + "]";
            is_empty_input && ~setClip(encrypted) && toast("密文数组已复制剪切板");
            return encrypted;

            // tool function(s) //

            function encrypt(str) {
                let result = [];
                for (let i = 0, len = str.length; i < len; i += 1) {
                    if (str[i].match(regexp)) result.push(pickARandResult(str[i]));
                    else encrypt("\\u" + str[i].charCodeAt(0).toString(16).toUpperCase());
                }
                return result;
            }

            function pickARandResult(str) {
                let tempArr = [];
                for (let name in pwmap_map) {
                    if (pwmap_map.hasOwnProperty(name)) {
                        pwmap_map[name] === str && tempArr.push(name);
                    }
                }
                return tempArr[~~(Math.random() * config.code_amount)];
            }
        }

        function pwmapDecrypt(input) {
            checkPWMAPFile();
            let is_empty_input = !arguments.length;
            input = is_empty_input && userInput("请输入要解密的字符串数组") || input;
            let thread_monitor = monitorRunningTime("正在解密中 请稍候...");

            let decrypted = decrypt(input);
            thread_monitor.interrupt();
            is_empty_input && ~setClip(decrypted) && toast("解密字符串已复制剪切板");
            return decrypted;

            // tool function(s) //

            function decrypt(encrypted_arr) {
                if (typeof encrypted_arr === "undefined") return undefined;
                if (encrypted_arr === null) return encrypted_arr;

                let arr = encrypted_arr,
                    skip_times = 0,
                    result = "";
                if (typeof arr === "string") {
                    if (!arr.length) return "";
                    if (arr[0] !== "[") ~toast("输入的加密字符串不合法") && exit();
                    arr = arr.slice(1, -1).split(/, ?/).map(value => value.replace(/^"([^]+)"$/g, "$1"));
                }

                while (1) {
                    for (let i = 0, len = arr.length; i < len; i += 1) {
                        if (skip_times) {
                            skip_times--;
                            continue;
                        }
                        let decrypted_str = pwmap_map[arr[i]];
                        if (decrypted_str === undefined) return undefined;
                        if (decrypted_str === "\\" && pwmap_map[arr[i + 1]] === "u") {
                            let tmp_str = "";
                            for (let j = 0; j < 4; j += 1) tmp_str += pwmap_map[arr[i + j + 2]];
                            tmp_str = "%u" + tmp_str;
                            result += unescape(tmp_str);
                            skip_times = 5;
                        } else result += decrypted_str;
                    }
                    if (!result.match(new RegExp(config.separator))) break;
                    arr = result.split(config.separator);
                    result = "";
                }
                return result;
            }
        }

        function pwmapGenerate() {
            if (files.exists(pwmap_path)) if (!confirm("密文文件已存在\n继续操作将覆盖已有文件\n新的密文文件生成后\n涉及密文的全部相关代码\n均需重新设置才能解密\n确定要继续吗?")) exit();
            files.createWithDirs(pwmap_path);
            files.open(pwmap_path);

            let str_map = "~!@#$%^&*`'-_+=,./\\ 0123456789:;?AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz()[]<>{}|\"";
            let az_map = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";

            //// SAMPLE - "SCPrMtaB": "A" ////
            //// SAMPLE - "doaAisDd": "%" ////

            let result = {};

            for (let i = 0, len_i = str_map.length; i < len_i; i += 1) {
                for (let j = 0, len_j = config.code_amount; j < len_j; j += 1) {
                    let code_str = "";
                    for (let k = 0, len_k = config.code_length, len_map = az_map.length; k < len_k; k += 1) {
                        code_str += az_map[~~(Math.random() * len_map)];
                    }
                    result[code_str] = str_map[i];
                }
            }

            files.write(pwmap_path, JSON.stringify(result));
            toast("密文文件生成完毕");
        }

        // tool function(s) //

        function checkPWMAPFile() {
            if (!files.exists(pwmap_path)) {
                messageAction("已生成新的密文文件", 1, 1, 0, "both");
                pwmapGenerate();
            }
            pwmap_map = JSON.parse(files.read(pwmap_path));
        }

        function userInput(msg) {
            let input = "",
                safe_max_try_times = 20;
            while (safe_max_try_times--) {
                input = dialogs.rawInput(msg + "\n点击其他区域放弃输入");
                if (input === null) {
                    exit();
                } else if (!input) {
                    toast("输入内容无效");
                    continue;
                }
                break;
            }
            if (safe_max_try_times < 0) ~toast("已达最大尝试次数") && exit();

            return input;
        }

        function monitorRunningTime(msg) {
            return threads.start(function () {
                msg = msg || "运行中 请稍候...";
                sleep(1200);
                toast(msg);
                let count = 0;
                while (~sleep(1000) && ~count++) {
                    if (count % 5) continue;
                    toast(msg);
                }
            });
        }
    };
} // updated at Nov 14, 2019

function loadInternalModuleStorage() {
    return (function () {
        let storages = {};

        storages.create = function (name) {
            return new Storage(name);
        };

        storages.remove = function (name) {
            this.create(name).clear();
        };

        return storages;

        // constructor //

        function Storage(name) {
            let storage_dir = files.getSdcardPath() + "/.local/";
            let file = createFile(storage_dir);
            let opened = files.open(file);
            let readFile = () => files.read(file);

            this.contains = contains;
            this.get = get;
            this.put = put;
            this.remove = remove;
            this.clear = clear;

            function createFile(dir) {
                let file = dir + name + ".nfe";
                files.createWithDirs(file);
                return file;
            }

            function contains(key) {
                let read = readFile();
                if (!read) return false;
                return key in JSON.parse(read);
            }

            function put(key, value) {
                if (typeof value === "undefined") throw new TypeError("\"put\" value can't be undefined");
                let read = readFile();
                let obj = read && JSON.parse(read, (key, value) => value === "Infinity" ? Infinity : value) || {};
                let new_obj = {};
                new_obj[key] = value;
                Object.assign(obj, new_obj);
                files.write(file, JSON.stringify(obj, (key, value) => value === Infinity ? "Infinity" : value));
                opened.close();
            }

            function get(key, value) {
                let read = readFile();
                if (!read) return value;
                try {
                    let obj = JSON.parse(read, (key, value) => value === "Infinity" ? Infinity : value) || {};
                    return key in obj ? obj[key] : value;
                } catch (e) {
                    console.warn(e.message);
                    return value;
                }
            }

            function remove(key) {
                let read = readFile();
                if (!read) return;
                let obj = JSON.parse(read);
                if (!(key in obj)) return;
                delete obj[key];
                files.write(file, JSON.stringify(obj));
                opened.close();
            }

            function clear() {
                files.remove(file);
            }
        }
    })();
} // updated at Nov 14, 2019