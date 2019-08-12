module.exports = {
    parseAppName: parseAppName,
    getVerName: getVerName,
    launchThisApp: launchThisApp,
    killThisApp: killThisApp,
    restartThisApp: restartThisApp,
    restartThisEngine: restartThisEngine,
    runJsFile: runJsFile,
    clickAction: clickAction,
    waitForAction: waitForAction,
    waitForAndClickAction: waitForAndClickAction,
    swipeInArea: swipeInArea,
    swipeInAreaAndClickAction: swipeInAreaAndClickAction,
    messageAction: messageAction,
    showSplitLine: showSplitLine,
    refreshObjects: refreshObjects,
    tryRequestScreenCapture: tryRequestScreenCapture,
    keycode: keycode,
    debugInfo: debugInfo,
    getDisplayParams: getDisplayParams,
    deepCloneObject: deepCloneObject,
    equalObjects: equalObjects,
    smoothScrollView: smoothScrollView,
    alertTitle: alertTitle,
    alertContent: alertContent,
    observeToastMessage: observeToastMessage,
    captureErrScreen: captureErrScreen,
    getSelector: getSelector,
    selExists: selExists,
    surroundWith: surroundWith,
    phoneCallingState: phoneCallingState,
    timeRecorder: timeRecorder,
};

/**
 * @description tool functions (available for independent use)
 * @type {{debugInfo: debugInfo, alertContent: alertContent, alertTitle: alertTitle, equalObjects: equalObjects, parseAppName: (function(string): {app_name: boolean, package_name: (*|string|boolean)}), waitForAction: (function((Object|Object[]|Function|Function[]), *=, *=): boolean), messageAction: messageAction, runJsFile: runJsFile, keycode: keycode, restartThisEngine: restartThisEngine, swipeInArea: swipeInArea, waitForAndClickAction: (function(Object, *=, *=, {intermission?, click_strategy?, condition_success?, check_time_once?, max_check_times?, padding?}=): (boolean|*|number|boolean)), tryRequestScreenCapture: tryRequestScreenCapture, getVerName: getVerName, getDisplayParams: getDisplayParams, refreshObjects: refreshObjects, launchThisApp: (function((Object|string|Function), {package_name?, app_name?, task_name?, condition_launch?, condition_ready?, disturbance?, debug_info_flag?, first_time_run_message_flag?, no_message_flag?, global_retry_times?, launch_retry_times?, ready_retry_times?, screen_orientation?}=): boolean), restartThisApp: (function((Object|string), {shell_acceptable?, shell_max_wait_time?, keycode_back_acceptable?, keycode_back_twice?, condition_success?, package_name?, app_name?, task_name?, condition_launch?, condition_ready?, disturbance?, debug_info_flag?, first_time_run_message_flag?, no_message_flag?, global_retry_times?, launch_retry_times?, ready_retry_times?}=): boolean), showSplitLine: (function(*=, *=, *=): boolean), deepCloneObject: deepCloneObject, killThisApp: killThisApp, swipeInAreaAndClickAction: swipeInAreaAndClickAction, getSelector: (function(*=): *), captureErrScreen: captureErrScreen, smoothScrollView: smoothScrollView, observeToastMessage: observeToastMessage, clickAction: clickAction}}
 * @author {@link https://github.com/SuperMonster003}
 */

__global__ = typeof __global__ === "undefined" ? this : __global__;

// global function(s) //

/**
 * Returns both app name and app package name with either one input
 * @param name {string} - app name or app package name
 * @example
 * parseAppName("Alipay"); <br>
 * parseAppName("com.eg.android.AlipayGphone");
 * @return {{app_name: string, package_name: string}}
 */
function parseAppName(name) {
    let _app_name = !name.match(/.+\..+\./) && app.getPackageName(name) && name;
    let _package_name = app.getAppName(name) && name;
    _app_name = _app_name || _package_name && app.getAppName(_package_name);
    _package_name = _package_name || _app_name && app.getPackageName(_app_name);
    return {
        app_name: _app_name,
        package_name: _package_name,
    };
}

/**
 * Returns a version name string of an app with either app name or app package name input
 * @param name {string} - app name, app package name or some shortcuts
 * <br>
 *     -- app name - "Alipay" <br>
 *     -- app package name - "com.eg.android.AlipayGphone" <br>
 *     -- /^[Aa]uto\.?js/ - "org.autojs.autojs" + (name.match(/[Pp]ro$/) ? "pro" : "") <br>
 *     -- /^[Cc]urrent.*[Aa]uto.*js/ - context.packageName <br>
 *     -- "self" - currentPackage()
 * @param [params] {object}
 * @param [params.debug_info_flag=false] {boolean}
 * @example
 * getVerName("Alipay"); -- app name <br>
 * getVerName("self"); -- shortcut <br>
 * getVerName("autojs"); -- shortcut <br>
 * getVerName("autojs pro"); -- shortcut <br>
 * getVerName("Auto.js"); -- app name <br>
 * getVerName("org.autojs.autojs"); -- app package name <br>
 * getVerName("current autojs"); -- shortcut
 * @param name
 * @return {null|string}
 */
function getVerName(name, params) {
    let _params = params;

    let _parseAppName = typeof parseAppName === "undefined" ? parseAppNameRaw : parseAppName;
    let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _params.debug_info_flag);

    name = _handleName(name);
    let _package_name = _parseAppName(name).package_name;
    if (!_package_name) return null;

    try {
        let _installed_packages = context.getPackageManager().getInstalledPackages(0).toArray();
        for (let i in _installed_packages) {
            if (_installed_packages[i].packageName.toString() === _package_name.toString()) {
                return _installed_packages[i].versionName;
            }
        }
    } catch (e) {
        _debugInfo(e);
    }
    return null;

    // tool function(s) //

    function _handleName(name) {
        if (name.match(/^[Aa]uto\.?js/)) return "org.autojs.autojs" + (name.match(/[Pp]ro$/) ? "pro" : "");
        if (name === "self") return currentPackage();
        if (name.match(/^[Cc]urrent.*[Aa]uto.*js/)) return context.packageName;
        return name;
    }

    // raw function(s) //

    function debugInfoRaw(msg, info_flag) {
        if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }

    function parseAppNameRaw(name) {
        let _app_name = !name.match(/.+\..+\./) && app.getPackageName(name) && name;
        let _package_name = app.getAppName(name) && name;
        _app_name = _app_name || _package_name && app.getAppName(_package_name);
        _package_name = _package_name || _app_name && app.getPackageName(_app_name);
        return {
            app_name: _app_name,
            package_name: _package_name,
        };
    }
}

/**
 * Launch some app with package name or intent
 * And wait for conditions ready if specified
 * @param trigger {object|string|function}
 * <br>
 *     -- intent - activity object like {
 *         action: "VIEW",
 *         packageName: "com.eg.android.AlipayGphone",
 *         className: "...",
 *     } <br>
 *     -- package name - like "com.eg.android.AlipayGphone" <br>
 *     -- app name - like "Alipay"
 *     -- function trigger - () => {}
 * @param [params] {object}
 * @param [params.package_name] {string}
 * @param [params.app_name] {string}
 * @param [params.task_name] {string}
 * @param [params.condition_launch] {function}
 * @param [params.condition_ready] {function}
 * @param [params.disturbance] {function}
 * @param [params.debug_info_flag=false] {boolean}
 * @param [params.first_time_run_message_flag=true] {boolean}
 * @param [params.no_message_flag] {boolean}
 * @param [params.global_retry_times=2] {number}
 * @param [params.launch_retry_times=3] {number}
 * @param [params.ready_retry_times=5] {number}
 * @param [params.screen_orientation] {number} -- if specific screen direction needed to run this app; portrait: 0, landscape: -1
 * @example
 * launchThisApp("com.eg.android.AlipayGphone"); <br>
 * launchThisApp("com.eg.android.AlipayGphone", {
 *    task_name: "\u652F\u4ED8\u5B9D\u6D4B\u8BD5",
 *    // first_time_run_message_flag: true,
 *    // no_message_flag: false,
 *    debug_info_flag: "forcible",
 * }); <br>
 * launchThisApp({
 *     action: "VIEW",
 *     data: "alipays://platformapi/startapp?appId=60000002&appClearTop=false&startMultApp=YES",
 * }, {
 *     package_name: "com.eg.android.AlipayGphone",
 *     task_name: "\u8682\u8681\u68EE\u6797",
 *     debug_info_flag: "forcible",
 *     condition_launch: () => currentPackage().match(/AlipayGphone/),
 *     condition_ready: () => descMatches(/../).find().size() > 6,
 *     launch_retry_times: 4,
 *     screen_orientation: 0,
 * });
 * @return {boolean}
 */
function launchThisApp(trigger, params) {
    __global__ = typeof __global__ === "undefined" ? {} : __global__;

    if (typeof __global__._monster_$_first_time_run === "undefined") __global__._monster_$_first_time_run = 1;

    let _params = params || {};

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _params.debug_info_flag);
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _killThisApp = typeof killThisApp === "undefined" ? killThisAppRaw : killThisApp;

    if (!trigger || !~["object", "string", "function"].indexOf(typeof trigger)) _messageAction("应用启动目标参数无效", 8, 1, 0, 1);

    let _package_name = "";
    let _app_name = "";
    let _task_name = _params.task_name || "";

    _setAppName();

    _debugInfo("启动目标参数类型: " + typeof trigger);

    let _condition_ready = _params.condition_ready;
    let _condition_launch = _params.condition_launch || (() => currentPackage() === _package_name);
    let _disturbance = _params.disturbance;
    let _max_retry_times = _params.global_retry_times || 2;
    let _first_time_run_message_flag = typeof _params.first_time_run_message_flag === "undefined" ? true : _params.first_time_run_message_flag;
    let _max_retry_times_backup = _max_retry_times;
    while (_max_retry_times--) {
        let _max_launch_times = _params.launch_retry_times || 3;
        let _max_launch_times_backup = _max_launch_times;
        if (!_params.no_message_flag) {
            let _msg_launch = _task_name ? "重新开始\"" + _task_name + "\"任务" : "重新启动\"" + _app_name + "\"应用";
            if (!__global__._monster_$_first_time_run) _messageAction(_msg_launch, null, 1);
            else _first_time_run_message_flag && _messageAction(_msg_launch.replace(/重新/g, ""), 1, 1, 0, "both");
        }
        while (_max_launch_times--) {
            if (typeof trigger === "object") {
                _debugInfo("加载intent参数启动应用");
                app.startActivity(trigger);
            } else if (typeof trigger === "string") {
                _debugInfo("加载应用包名参数启动应用");
                if (!app.launchPackage(_package_name)) {
                    _debugInfo("加载应用名称参数启动应用");
                    app.launchApp(_app_name);
                }
            } else {
                _debugInfo("使用触发器方法启动应用");
                trigger();
            }

            if (typeof getDisplayParams !== "undefined") {
                let getCurrentScreenOr = () => getDisplayParams().screen_orientation;
                let isLandscape = () => getCurrentScreenOr() in {1: true, 3: true};
                let isPortrait = () => getCurrentScreenOr() in {0: true, 2: true};
                let _screen_orientation = _params.screen_orientation;
                if (_screen_orientation === -1 && isPortrait()) {
                    _debugInfo("需等待屏幕方向为横屏");
                    _waitForAction(isLandscape, 3000, 80) ? _debugInfo("屏幕方向已就绪") : _messageAction("等待屏幕方向变化超时", 3);
                } else if (_screen_orientation === 0 && isLandscape()) {
                    _debugInfo("需等待屏幕方向为竖屏");
                    _waitForAction(isPortrait, 3000, 80) ? _debugInfo("屏幕方向已就绪") : _messageAction("等待屏幕方向变化超时", 3);
                }
            }

            let _cond_succ_flag = _waitForAction(_condition_launch, 5000, 800);
            _debugInfo("应用启动" + (_cond_succ_flag ? "成功" : "超时 (" + (_max_launch_times_backup - _max_launch_times) + "\/" + _max_launch_times_backup + ")"));
            if (_cond_succ_flag) break;
            else _debugInfo(">" + currentPackage());
        }
        if (_max_launch_times < 0) _messageAction("打开\"" + _app_name + "\"失败", 9, 1, 0, 1);

        __global__._monster_$_first_time_run = 0;
        if (_condition_ready === null || _condition_ready === undefined) {
            _debugInfo("未设置启动完成条件参数");
            break;
        }

        _debugInfo("开始监测启动完成条件");
        __global__._monster_$_launch_ready_monitor_signal = false; // in case that there is a thread who needs a signal to interrupt

        let _thread_disturbance = undefined;
        if (_disturbance) {
            _debugInfo("检测到干扰排除器");
            _thread_disturbance = threads.start(function () {
                return _disturbance();
            }); // maybe a signal is needed here
        }

        let max_ready_try_times = _params.ready_retry_times || 3;
        let max_ready_try_times_backup = max_ready_try_times;
        while (!_waitForAction(_condition_ready, 8000) && max_ready_try_times--) {
            let try_count_info = "(" + (max_ready_try_times_backup - max_ready_try_times) + "\/" + max_ready_try_times_backup + ")";
            if (typeof trigger === "object") {
                _debugInfo("重新启动Activity " + try_count_info);
                app.startActivity(trigger);
            } else {
                _debugInfo("重新启动应用 " + try_count_info);
                app.launchPackage(trigger);
            }
        }

        __global__._monster_$_launch_ready_monitor_signal = true;
        if (_thread_disturbance) {
            if (!_waitForAction(() => !_thread_disturbance.isAlive(), 1000)) {
                _debugInfo("强制解除干扰排除器");
                _thread_disturbance.interrupt();
            } else _debugInfo("干扰排除器已解除");
        }

        if (max_ready_try_times >= 0) {
            _debugInfo("启动完成条件监测完毕");
            break;
        }
        _debugInfo("尝试关闭\"" + _app_name + "\"应用: (" + (_max_retry_times_backup - _max_retry_times) + "\/" + _max_retry_times_backup + ")");
        _killThisApp(_package_name);
    }
    if (_max_retry_times < 0) _messageAction("\"" + (_task_name || _app_name) + "\"初始状态准备失败", 9, 1, 0, 1);
    _debugInfo(("\"" + _task_name || _app_name) + "\"初始状态准备完毕");
    return true;

    // tool function(s) //

    function _setAppName() {
        if (typeof trigger === "string") {
            _app_name = !trigger.match(/.+\..+\./) && app.getPackageName(trigger) && trigger;
            _package_name = app.getAppName(trigger) && trigger;
        } else {
            _app_name = _params.app_name;
            _package_name = _params.package_name;
            if (!_package_name && typeof trigger === "object") {
                _package_name = trigger.packageName || trigger.data && trigger.data.match(/^alipays/i) && "com.eg.android.AlipayGphone";
            }
        }
        _app_name = _app_name || _package_name && app.getAppName(_package_name);
        _package_name = _package_name || _app_name && app.getPackageName(_app_name);
        if (!_app_name && !_package_name) {
            _messageAction("未找到应用", 4, 1);
            _messageAction(trigger, 8, 0, 1, 1);
        }
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

    function killThisAppRaw(package_name) {
        package_name = package_name || curerntPackage();
        if (!package_name.match(/.+\..+\./)) package_name = app.getPackageName(package_name) || package_name;
        if (!shell("am force-stop " + package_name, true).code) return _success(15000);
        let _max_try_times = 10;
        while (_max_try_times--) {
            ~back() && back();
            if (_success(2500)) break;
        }
        return _max_try_times >= 0;

        function _success(max_wait_time) {
            while (currentPackage() === package_name && max_wait_time > 0) ~sleep(200) && (max_wait_time -= 200);
            return max_wait_time > 0;
        }
    }
}

/**
 * Close or minimize a certain app
 * @param name=currentPackage() {string}
 * <br>
 *     -- app name - like "Alipay" (not recommended, as long time may cost) <br>
 *     -- package_name - like "com.eg.android.AlipayGphone"
 * @param [params] {object}
 * @param [params.shell_acceptable=true] {boolean}
 * @param [params.shell_max_wait_time=10000] {number}
 * @param [params.keycode_back_acceptable=true] {boolean}
 * @param [params.keycode_back_twice=false] {boolean}
 * @param [params.condition_success=()=>currentPackage() !== app_package_name] {function}
 * @param [params.debug_info_flag=false] {boolean}
 * @example
 * killThisApp("Alipay"); <br>
 * killThisApp("com.eg.android.AlipayGphone", {
 *    shell_acceptable: false,
 *    debug_info_flag: "forcible",
 * });
 *
 * @return {boolean}
 */
function killThisApp(name, params) {
    let _params = params || {};

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _params.debug_info_flag);
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;
    let _parseAppName = typeof parseAppName === "undefined" ? parseAppNameRaw : parseAppName;

    let _name = name || "";
    if (!_name) {
        _name = currentPackage();
        _messageAction("自动使用currentPackage()返回值", 3);
        _messageAction("killThisApp()未指定name参数", 3, 0, 1);
        _messageAction("注意: 此返回值可能不准确", 3, 0, 1);
    }
    let _parsed_app_name = _parseAppName(_name);
    let _app_name = _parsed_app_name.app_name;
    let _package_name = _parsed_app_name.package_name;
    if (!(_app_name && _package_name)) _messageAction("解析应用名称及包名失败", 8, 1, 0, 1);

    let _shell_acceptable = typeof _params.shell_acceptable === "undefined" && true || _params.shell_acceptable;
    let _keycode_back_acceptable = typeof _params.keycode_back_acceptable === "undefined" && true || _params.keycode_back_acceptable;
    let _keycode_back_twice = _params.keycode_back_twice || false;
    let _condition_success = _params.condition_success || (() => currentPackage() !== _package_name);

    let _shell_result = false;
    let _shell_start_timestamp = new Date().getTime();
    let _shell_max_wait_time = _params.shell_max_wait_time || 10000;
    if (_shell_acceptable) {
        try {
            _shell_result = !shell("am force-stop " + _package_name, true).code;
        } catch (e) {
            _debugInfo("shell()方法强制关闭\"" + _app_name + "\"失败");
        }
    } else _debugInfo("参数不接受shell()方法");

    if (!_shell_result) {
        if (_keycode_back_acceptable) {
            return _tryMinimizeApp();
        } else {
            _debugInfo("参数不接受模拟返回方法");
            _messageAction("关闭\"" + _app_name + "\"失败", 4, 1);
            return _messageAction("无可用的应用关闭方式", 4, 0, 1);
        }
    }

    if (_waitForAction(_condition_success, _shell_max_wait_time)) {
        _debugInfo("shell()方法强制关闭\"" + _app_name + "\"成功");
        return !!~_debugInfo(">关闭用时: " + (new Date().getTime() - _shell_start_timestamp) + "ms");
    } else {
        _messageAction("关闭\"" + _app_name + "\"失败", 4, 1);
        _debugInfo(">关闭用时: " + (new Date().getTime() - _shell_start_timestamp) + "ms");
        return _messageAction("关闭时间已达最大超时", 4, 0, 1);
    }

    // tool function(s) //

    function _tryMinimizeApp() {
        _debugInfo("尝试最小化当前应用");

        let _kw_avail_btns = [
            idMatches(/.*nav.back|.*back.button/),
            descMatches(/关闭|返回/),
            textMatches(/关闭|返回/),
        ];

        let _max_try_times_minimize = 20;
        let _max_try_times_minimize_backup = _max_try_times_minimize;

        while (_max_try_times_minimize--) {
            let _kw_clicked_flag = false;
            for (let i = 0, len = _kw_avail_btns.length; i < len; i += 1) {
                let _kw_avail_btn = _kw_avail_btns[i];
                if (_kw_avail_btn.exists()) {
                    _kw_clicked_flag = true;
                    _clickAction(_kw_avail_btn);
                    sleep(300);
                    break;
                }
            }
            if (_kw_clicked_flag) continue;
            ~back() && back();
            _keycode_back_twice && ~sleep(200) && back();
            if (_waitForAction(_condition_success, 2000)) break;
        }
        if (_max_try_times_minimize < 0) {
            _debugInfo("最小化应用尝试已达: " + _max_try_times_minimize_backup + "次");
            _debugInfo("重新仅模拟返回键尝试最小化");
            _max_try_times_minimize = 8;
            while (_max_try_times_minimize--) {
                ~back() && back();
                _keycode_back_twice && ~sleep(200) && back();
                if (_waitForAction(_condition_success, 2000)) break;
            }
            if (_max_try_times_minimize < 0) return _messageAction("最小化当前应用失败", 4, 1);
        }
        _debugInfo("最小化应用成功");
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
        let _kw = Object.prototype.toString.call(kw).slice(8, -1) === "Array" ? kw[0] : kw;
        let _key_node = _kw.findOnce();
        if (!_key_node) return;
        let _bounds = _key_node.bounds();
        click(_bounds.centerX(), _bounds.centerY());
        return true;
    }

    function parseAppNameRaw(name) {
        let _app_name = !name.match(/.+\..+\./) && app.getPackageName(name) && name;
        let _package_name = app.getAppName(name) && name;
        _app_name = _app_name || _package_name && app.getAppName(_package_name);
        _package_name = _package_name || _app_name && app.getPackageName(_app_name);
        return {
            app_name: _app_name,
            package_name: _package_name,
        };
    }
}

/**
 * Kill or minimize a certain app and launch it with or without conditions (restart)
 * -- This is a combination function which means independent use is not recommended
 * @param intent_or_name {object|string}
 * * <br>
 *     -- intent - activity object like {
 *         action: "VIEW",
 *         packageName: "com.eg.android.AlipayGphone",
 *         className: "...",
 *     } <br>
 *     -- app name - like "Alipay" (not recommended, as long time may cost) <br>
 *     -- package_name - like "com.eg.android.AlipayGphone"
 * @param [params] {object}
 * @param [params.shell_acceptable=true] {boolean} - for killing
 * @param [params.shell_max_wait_time=10000] {number} - for killing
 * @param [params.keycode_back_acceptable=true] {boolean} - for killing
 * @param [params.keycode_back_twice=false] {boolean} - for killing
 * @param [params.condition_success=()=>currentPackage() !== app_package_name] {function} - for killing
 * @param [params.package_name] {string} - for launching
 * @param [params.app_name] {string} - for launching
 * @param [params.task_name] {string} - for launching
 * @param [params.condition_launch] {function} - for launching
 * @param [params.condition_ready] {function} - for launching
 * @param [params.disturbance] {function} - for launching
 * @param [params.debug_info_flag=false] {boolean}
 * @param [params.first_time_run_message_flag=true] {boolean} - for launching
 * @param [params.no_message_flag] {boolean} - for launching
 * @param [params.global_retry_times=2] {number} - for launching
 * @param [params.launch_retry_times=3] {number} - for launching
 * @param [params.ready_retry_times=5] {number} - for launching
 * @example
 *
 * @return {boolean}
 */
function restartThisApp(intent_or_name, params) {
    intent_or_name = intent_or_name || currentPackage();

    let _killThisApp = typeof killThisApp === "undefined" ? killThisAppRaw : killThisApp;
    let _launchThisApp = typeof launchThisApp === "undefined" ? launchThisAppRaw : launchThisApp;

    let _result = true;
    if (!_killThisApp(intent_or_name, params)) _result = false;
    if (!_launchThisApp(intent_or_name, params)) _result = false;
    return _result;

    // raw function(s) //

    function killThisAppRaw(package_name) {
        package_name = package_name || curerntPackage();
        if (!package_name.match(/.+\..+\./)) package_name = app.getPackageName(package_name) || package_name;
        if (!shell("am force-stop " + package_name, true).code) return _success(15000);
        let _max_try_times = 10;
        while (_max_try_times--) {
            ~back() && back();
            if (_success(2500)) break;
        }
        return _max_try_times >= 0;

        function _success(max_wait_time) {
            while (currentPackage() === package_name && max_wait_time > 0) ~sleep(200) && (max_wait_time -= 200);
            return max_wait_time > 0;
        }
    }

    function launchThisAppRaw(intent_or_name) {
        typeof intent_or_name === "object" ? app.startActivity(intent_or_name) : launch(intent_or_name) || launchApp(intent_or_name);
        return true;
    }
}

/**
 * Run a new task in engine and forcibly stop the old one (restart)
 * @param [params] {object}
 * @param [params.new_file] {string} - new engine task name with or without path or file extension name
 * <br>
 *     -- *DEFAULT* - old engine task <br>
 *     -- new file - like "hello.js", "../hello.js" or "hello"
 * @param [params.debug_info_flag=false] {boolean}
 * @param [params.max_restart_engine_times=1] {number} - max restart times for avoiding infinite recursion
 * @example
 * restartThisEngine({
 *    debug_info_flag: "forcible",
 *    max_restart_engine_times: 3,
 * });
 * @return {boolean}
 */
function restartThisEngine(params) {
    let _params = params || {};

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _params.debug_info_flag);

    let _my_engine = engines.myEngine();

    let _max_restart_engine_times_argv = _my_engine.execArgv.max_restart_engine_times;
    let _max_restart_engine_times_params = _params.max_restart_engine_times;
    let _max_restart_engine_times;
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
        arguments: {
            max_restart_engine_times: _max_restart_engine_times - 1,
            max_restart_engine_times_backup: _max_restart_engine_times_backup,
        },
    });
    _debugInfo("强制停止旧引擎任务");
    _my_engine.forceStop();
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

/**
 * Run a javascript file via activity by current running Auto.js
 * @param file_name {string} - file name with or without path or file extension name
 * @example
 * runJsFile("file"); <br>
 * runJsFile("../folder/time.js");
 */
function runJsFile(file_name) {
    app.startActivity({
        action: "VIEW",
        packageName: context.packageName,
        className: "org.autojs.autojs.external.open.RunIntentActivity",
        data: "file://" + files.path(file_name.match(/\.js$/) ? file_name : (file_name + ".js")),
    });
}

/**
 * Handle message - toast, console and actions
 * @param {string} msg - message
 * @param {number|string|object} [msg_level] - message level
 * <br>
 *      -- 0/v/verbose - console.verbose(msg) <br>
 *      -- 1/l/log - console.log(msg) <br>
 *      -- 2/i/info - console.info(msg) <br>
 *      -- 3/w/warn - console.warn(msg) <br>
 *      -- 4/e/error - console.error(msg) <br>
 *      -- 8/x - console.error(msg), exit <br>
 *      -- 9/t - console.error(msg), throw Error(), exit <br>
 *      -- t/title - msg becomes a title like "[ title ]" <br>
 *      -- *OTHER|DEFAULT* - do not print msg in console
 *
 * @param {number} [if_toast] - if needs toast the message
 * @param {number} [if_arrow] - if needs an arrow (length not more than 10) before msg (not for toast)
 * <br>
 *     -- 1 - "-> I got you now" <br>
 *     -- 2 - "--> I got you now" <br>
 *     -- 3 - "---> I got you now"
 * @param {number|string} [if_split_line] - if needs a split line
 * <br>
 *     -- 0|*DEFAULT* - nothing to show additionally <br>
 *     -- 1 - "------------" - 32-bit hyphen line <br>
 *     -- /dash/ - "- - - - - - " - 32-bit dash line <br>
 *     -- /up/ - show a line before message <br>
 *     -- /both/ - show a line before and another one after message <br>
 *     -- /both_n/ - show a line before and another one after message, then print a blank new line
 * @param [params] {object} reserved
 * @example
 * messageAction("hello"); // nothing will be printed in console <br>
 * messageAction("hello", 1); <br>
 * messageAction("hello", 2); <br>
 * messageAction("hello", 3, 1); <br>
 * messageAction("hello", 4, 1); <br>
 * messageAction("hello", 3, 1, 1); <br>
 * messageAction("hello", 3, 1, 1, 1); <br>
 * messageAction("hello", 3, 1, 1, "up"); <br>
 * messageAction("hello", 3, 1, 1, "both"); <br>
 * messageAction("hello", 3, 1, 1, "dash"); <br>
 * messageAction("ERROR", 8, 1, 0, "both_n"); <br>
 * messageAction("ERROR", 9, 1, 2, "dash_n"); <br>
 * messageAction("only toast", null, 1);
 * @return {boolean} - if msg_level including 3 or 4, then return false; anything else, including undefined, return true
 **/
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

    let _split_line_style = "";
    if (typeof _if_split_line === "string") {
        if (_if_split_line.match(/dash/)) _split_line_style = "dash";
        if (_if_split_line.match(/both|up/)) {
            _showSplitLine("", _split_line_style);
            if (_if_split_line.match(/_n|n_/)) _if_split_line = "\n";
            else if (_if_split_line.match(/both/)) _if_split_line = 1;
            else if (_if_split_line.match(/up/)) _if_split_line = 0;
        }
    }

    if (_if_arrow) {
        if (_if_arrow > 10) {
            console.error("\"if_arrow\"参数不可大于10");
            toast("\"if_arrow\"参数不可大于10");
            _showSplitLine();
            exit();
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
    if (_if_split_line) _showSplitLine(typeof _if_split_line === "string" ? (_if_split_line.match(/dash/) ? (_if_split_line.match(/_n|n_/) ? "\n" : "") : _if_split_line) : "", _split_line_style);
    if (_throw_error_flag) throw Error("Error thrown on purpose");
    else if (_exit_flag) exit();
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

/**
 * Show a split line in console (32 bytes)
 * @param [extra_str] {string}
 * <br>
 *     -- "\n" - a new blank line after split line <br>
 *     -- *OTHER* - unusual use
 * @param [style] {string}
 * <br>
 *     -- *DEFAULT* - "--------" - 32 bytes <br>
 *     -- "dash" - "- - - - - " - 32 bytes
 * @param [params] {object} - reserved
 * @example
 * showSplitLine(); <br>
 * showSplitLine("\n"); <br>
 * showSplitLine("", "dash");
 * @return {boolean} - always true
 */
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

/**
 * Wait some period of time for "f" being TRUE
 * @param f {object|object[]|function|function[]} - if condition of f is not true then waiting
 * <br>
 *     -- function - () => text("abc").exists() - if (!f()) waiting <br>
 *     -- JavaObject - text("abc") - equals to "() => text("abc").exists()" <br>
 *     -- Array - [obj(s), func(s), logic_flag] - a multi-condition array <br>
 *         -- logic_flag <br>
 *         --- "and"|"all"|*DEFAULT* - meet all conditions <br>
 *         --- "or"|"one" - meet any one condition
 * @param [timeout_or_times=10000] {number}
 * <br>
 *     -- *DEFAULT* - take as timeout (default: 10 sec) <br>
 *     -- 0|Infinity - always wait until f is true <br>
 *     -- less than 100 - take as times
 * @param [interval=200] {number}
 * @example
 * waitForAction([() => text("Settings").exists(), () => text("Exit").exists(), "or"], 500, 80); <br>
 * waitForAction([text("Settings"), text("Exit"), () => !text("abc").exists(), "and"], 2000, 50); <br>
 * let kw_settings = text("Settings");
 * let condition = () => kw_settings.exists();
 * // waitForAction(kw_settings, 1000);
 * // waitForAction(condition, 1000);
 * waitForAction(() => condition()), 1000);
 * @return {boolean} - if not timed out
 */
function waitForAction(f, timeout_or_times, interval) {
    let _timeout = timeout_or_times || 10000;
    let _interval = interval || 200;
    let _times = timeout_or_times !== 0 && timeout_or_times !== Infinity
        ? (_timeout >= 100 ? ~~(_timeout / _interval) + 1 : _timeout)
        : Infinity;

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

    while (!_checkF(f) && _times--) sleep(_interval);
    return _times >= 0;

    // tool function(s) //

    function _checkF(f) {
        while (__global__._monster_$_global_waiting_signal) sleep(200);

        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (_classof(f) === "JavaObject") return _checkF(() => f.exists());
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
        } else if (typeof f === "function") return f();
        else _messageAction("\"waitForAction\"传入f参数不合法\n\n" + f.toString() + "\n", 8, 1, 1, 1);
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

/**
 * Click a certain uiobject or coordinate by click(), press() or uiobject.click()
 * @param {object|array} f - JavaObject or RectBounds or coordinates Array
 * <br>
 *     -- text("abc").desc("def") <br>
 *     -- text("abc").desc("def").findOnce()[.parent()] <br>
 *     -- text("abc").desc("def").findOnce()[.parent()].bounds() <br>
 *     -- [106, 39]
 * @param [strategy] - decide the way of click
 * <br>
 *     -- "click"|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- "press" - press(coord_A, coord_B, press_time); <br>
 *     -- "widget" - text("abc").click(); - not available for Bounds or CoordsArray
 * @param [params] {object|string}
 * @param [params.press_time] {number=1} - only effective for "press" strategy
 * @param [params.condition_success=()=>true] {string|function}
 * <br>
 *     -- *DEFAULT* - () => true <br>
 *     -- /disappear(ed)?/ - (f) => !f.exists(); - disappeared from the whole screen <br>
 *     -- /disappear(ed)?.*in.?place/ - (f) => #some node info changed#; - disappeared in place <br>
 *     -- func - (f) => func(f);
 * @param [params.check_time_once=500] {number}
 * @param [params.max_check_times=0] {number}
 * <br>
 *     -- if condition_success is specified, then default value of max_check_times will be 3 <br>
 *     --- example: (this is not usage) <br>
 *     -- while (!waitForAction(condition_success, check_time_once) && max_check_times--) ; <br>
 *     -- return max_check_times >= 0;
 * @param [params.padding] {number|array}
 * <br>
 *     -- ["x", -10]|[-10, 0] - x=x-10; <br>
 *     -- ["y", 69]|[0, 69]|[69]|69 - y=y+69;
 * @see waitForAction
 * @example
 * text("Settings").find().forEach(w => clickAction(w)); <br>
 * text("Settings").find().forEach(w => clickAction(w.bounds())); <br>
 * clickAction(text("Settings"), "widget", {
 *     condition_success: "disappeared in place",
 *     max_check_times: 5,
 * }); <br>
 * clickAction(text("Settings"), "press", {
 *     // padding: ["x", +15],
 *     // padding: ["y", -7],
 *     // padding: [+15, -7],
 *     padding: -7,
 * });
 * @return {boolean} if reached max check time;
 */
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
    let _padding = _checkPadding(_params.padding);
    if (!((typeof strategy).match(/string|undefined/))) _messageAction("clickAction()的策略参数无效", 8, 1, 0, 1);
    let _strategy = strategy || "click";
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
            if (_strategy === "widget" && _node.clickable() === true) return _node.click();
            let _bounds = _node.bounds();
            _x = _bounds.centerX();
            _y = _bounds.centerY();
        } else if (_type === "UiObject") {
            try {
                _widget_parent_id = f.parent().toString().match(/@\w+/)[0].slice(1);
            } catch (e) {
                _widget_parent_id = 0;
            }
            if (_strategy === "widget" && f.clickable() === true) return f.click();
            let _bounds = f.bounds();
            _x = _bounds.centerX();
            _y = _bounds.centerY();
        } else if (_type === "Bounds") {
            if (_strategy === "widget") {
                _strategy = "click";
                _messageAction("clickAction()控件策略已改为click", 3);
                _messageAction("无法对Rect对象应用widget策略", 3, 0, 1);
            }
            _x = f.centerX();
            _y = f.centerY();
        } else {
            if (_strategy === "widget") {
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

        _strategy === "press" ? press(_x, _y, _params.press_time || 1) : click(_x, _y);
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

/**
 * Wait for an UiObject showing up and click it
 * -- This is a combination function which means independent use is not recommended
 * @param f {object} - only JavaObject is supported
 * @param [timeout_or_times=10000] {number}
 * <br>
 *     -- *DEFAULT* - take as timeout (default: 10 sec) <br>
 *     -- less than 100 - take as times
 * @param [interval=300] {number}
 * @param [click_params] {object}
 * @param [click_params.intermission=300] {number}
 * @param [click_params.click_strategy] {string} - decide the way of click
 * <br>
 *     -- "click"|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- "press" - press(coord_A, coord_B, 1); <br>
 *     -- "widget" - text("abc").click();
 * @param [click_params.condition_success=()=>true] {string|function}
 * <br>
 *     -- *DEFAULT* - () => true <br>
 *     -- /disappear(ed)?/ - (f) => !f.exists(); - disappeared from the whole screen <br>
 *     -- /disappear(ed)?.*in.?place/ - (f) => #some node info changed#; - disappeared in place <br>
 *     -- func - (f) => func(f);
 * @param [click_params.check_time_once=500] {number}
 * @param [click_params.max_check_times=0] {number}
 * <br>
 *     -- if condition_success is specified, then default value of max_check_times will be 3 <br>
 *     --- example: (this is not usage) <br>
 *     -- while (!waitForAction(condition_success, check_time_once) && max_check_times--) ; <br>
 *     -- return max_check_times >= 0;
 * @param [click_params.padding] {number|array}
 * <br>
 *     -- ["x", -10]|[-10, 0] - x=x-10; <br>
 *     -- ["y", 69]|[0, 69]|[69]|69 - y=y+69;
 * @return {boolean} - waitForAction(...) && clickAction(...)
 */
function waitForAndClickAction(f, timeout_or_times, interval, click_params) {
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;

    if (Object.prototype.toString.call(f).slice(8, -1) !== "JavaObject") {
        _messageAction("waitForAndClickAction不支持非JavaObject参数", 8, 1);
    }
    click_params = click_params || {};
    let _intermission = click_params.intermission || 200;
    let _strategy = click_params.click_strategy;
    return _waitForAction(f, timeout_or_times, interval) && ~sleep(_intermission) && _clickAction(f, _strategy, click_params);

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

    function clickActionRaw(kw) {
        let _kw = Object.prototype.toString.call(kw).slice(8, -1) === "Array" ? kw[0] : kw;
        let _key_node = _kw.findOnce();
        if (!_key_node) return;
        let _bounds = _key_node.bounds();
        click(_bounds.centerX(), _bounds.centerY());
        return true;
    }
}

/**
 * Refresh screen objects or current package by a certain strategy
 * @param [strategy] {string}
 * <br>
 *     -- "object[s]"|"alert" - alert() + text(%ok%).click() - may refresh objects only
 *     -- "page"|"recent[s]"|*DEFAULT*|*OTHER* - recents() + back() - may refresh currentPackage() <br>
 * @param [params] {object}
 * @param [params.custom_alert_text="Alert for refreshing objects"] {string}
 * @param [params.current_package=currentPackage()] {string}
 * @param [params.debug_info_flag=false] {boolean}
 */
function refreshObjects(strategy, params) {
    let _params = params || {};

    let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _params.debug_info_flag);
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _strategy = strategy || "";

    if (_strategy.match(/objects?|alert/)) {
        descMatches(/.*/).exists(); // useful or useless ?

        let alert_text = _params.custom_alert_text || "Alert for refreshing objects";
        let kw_alert_text = text(alert_text);
        let refreshing_obj_thread = threads.start(function () {
            kw_alert_text.findOne(1000);
            let kw_ok_btn = textMatches(/OK|确./); // may 确认 or something else
            kw_ok_btn.findOne(2000).click();
        });
        let shutdownThread = () => {
            refreshing_obj_thread.isAlive() && refreshing_obj_thread.interrupt();
            if (kw_alert_text.exists()) back();
        };
        let thread_alert = threads.start(function () {
            alert(alert_text);
            shutdownThread();
        });
        thread_alert.join(1000);
        if (thread_alert.isAlive()) {
            shutdownThread();
            thread_alert.interrupt();
        }
        sleep(300);
    } else {
        let _param_package = _params.current_package;
        let _current_package = _param_package || currentPackage();
        _debugInfo(_current_package);
        recents();
        _waitForAction(() => currentPackage() !== _current_package, 2000, 500) && sleep(500);
        _debugInfo(currentPackage());
        back();
        if (!_waitForAction(() => currentPackage() === _current_package, 2000, 80)) {
            app.launchPackage(_current_package);
            _waitForAction(() => currentPackage() === _current_package, 2000, 80);
        }
        _debugInfo(currentPackage());
    }

    // raw function(s) //

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
}

/**
 * Just an insurance way of images.requestScreenCapture() to avoid infinite stuck or stalled without any hint or log
 * @param [params] {object}
 * @param [params.debug_info_flag=false] {boolean}
 * @param [params.restart_this_engine_flag=false] {boolean}
 * @param [params.restart_this_engine_params] {object}
 * @param [params.restart_this_engine_params.new_file] {string} - new engine task name with or without path or file extension name
 * <br>
 *     -- *DEFAULT* - old engine task <br>
 *     -- new file - like "hello.js", "../hello.js" or "hello"
 * @param [params.restart_this_engine_params.debug_info_flag=false] {boolean}
 * @param [params.restart_this_engine_params.max_restart_engine_times=3] {number} - max restart times for avoiding infinite recursion
 * @return {boolean}
 */
function tryRequestScreenCapture(params) {
    __global__ = typeof __global__ === "undefined" ? {} : __global__;

    sleep(200); // why are you always a naughty boy... how can i get along well with you...

    let _params = params || {};

    let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _params.debug_info_flag);
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;
    let _restartThisEngine = typeof restartThisEngine === "undefined" ? restartThisEngineRaw : restartThisEngine;

    _params.restart_this_engine_flag = !!_params.restart_this_engine_flag;
    _params.restart_this_engine_params = _params.restart_this_engine_params || {};
    _params.restart_this_engine_params.max_restart_engine_times = _params.restart_this_engine_params.max_restart_engine_times || 3;

    if (__global__._monster_$_request_screen_capture_flag) return !!~_debugInfo("无需重复申请截图权限");
    _debugInfo("开始申请截图权限");

    __global__._monster_$_request_screen_capture_flag = true;
    _debugInfo("已存储截图权限申请标记");

    _debugInfo("已开启弹窗监测线程");
    let _thread_prompt = threads.start(function () {

        // maybe not common enough
        let _kw_no_longer_prompt = id("com.android.systemui:id/remember");
        let _kw_start_now_btn = className("Button").textMatches(/START NOW|立即开始/);

        if (!_waitForAction(_kw_no_longer_prompt, 5000)) return;
        _debugInfo("勾选\"不再提示\"复选框");
        _clickAction(_kw_no_longer_prompt, "widget");

        if (!_waitForAction(_kw_start_now_btn, 2000)) return;
        _debugInfo("点击\"立即开始\"按钮");
        _clickAction(_kw_start_now_btn, "widget");
    });

    let _thread_monitor = threads.start(function () {
        if (_waitForAction(() => !!_req_result, 2000, 500)) {
            _thread_prompt.interrupt();
            return _debugInfo("截图权限申请结果: " + _req_result);
        }
        if (!__global__._monster_$_debug_info_flag) {
            __global__._monster_$_debug_info_flag = true;
            _debugInfo("开发者测试模式已自动开启", 3);
        }
        if (_params.restart_this_engine_flag) {
            _debugInfo("截图权限申请结果: 失败", 3);
            if (_restartThisEngine(_params.restart_this_engine_params)) return;
        }
        _messageAction("截图权限申请失败", 9, 1, 0, 1);
    });

    let _req_result = images.requestScreenCapture(false);
    sleep(200);

    _thread_monitor.join(2400);
    _thread_monitor.isAlive() && _thread_monitor.interrupt();
    return _req_result;

    // raw function(s) //

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
        let _kw = Object.prototype.toString.call(kw).slice(8, -1) === "Array" ? kw[0] : kw;
        let _key_node = _kw.findOnce();
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
            },
        });
        _my_engine.forceStop();
    }
}

/**
 * Swipe to make a certain specified area, usually fullscreen, contains or overlap the bounds of "f"
 * @param f {object} - JavaObject
 * @param [params] {object}
 * @param [params.max_swipe_times=12] {number}
 * @param [params.swipe_direction="auto"] {number|string}
 * <br>
 *     -- 0|"l"|"left", 1|"u"|"up", 2|"r"|"right", 3|"d"|"down" - direction to swipe each time <br>
 *     -- "auto" - if "f" exists but not in aim area, direction will be auto-set decided by position of "f", or direction will be "up"
 * @param [params.swipe_time=100] {number} - the time spent for each swiping - set bigger as needed
 * @param [params.swipe_interval=300] {number} - the time spent between every swiping - set bigger as needed
 * @param [params.swipe_area=[0.1, 0.1, 0.9, 0.9]] {number[]} - swipe from a center-point to another
 * @param [params.aim_area=[0, 0, -1, -1]] {number[]} - restrict for smaller aim area
 * <br>
 *     -- area params - x|0<=x<1: x * (height|width), -1: full-height or full-width, -2: set with default value <br>
 *     -- [%left%, %top%, %right%, %bottom%] <br>
 *     -- [1, 50, 700, 1180] - [1, 50, 700, 1180] <br>
 *     -- [1, 50, 700, -1] - [1, 50, 700, device.height] <br>
 *     -- [0.1, 0.2, -1, -1] - [0.1 * device.width, 0.2 * device.height, device.width, device.height]
 * @param [params.condition_meet_sides=1] {number=1|2}
 * <br>
 *     -- example A: condition_meet_sides = 1 <br>
 *     -- aim: [0, 0, 720, 1004], direction: "up", swipe distance: 200 <br>
 *     -- swipe once - bounds: [0, 1100, 720, 1350] - top is not less than 1004 - continue swiping <br>
 *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004 - swipe will stop <br>
 *     -- example B: condition_meet_sides = 2 <br>
 *     -- aim: [0, 0, 720, 1004], direction: "up", swipe distance: 200 <br>
 *     -- swipe once - bounds: [0, 1100, 720, 1350] - neither top nor bottom < 1004 - continue swiping <br>
 *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004, but not bottom - swipe will not stop <br>
 *     -- swipe once - bounds: [0, 700, 720, 950] - top < 1004, and so is bottom - swipe will stop
 * @returns {boolean} - if timed out or max swipe times reached
 */
function swipeInArea(f, params) {
    let _params = params || {};
    let _swipe_interval = _params.swipe_interval || 150;
    let _max_swipe_times = _params.max_swipe_times || 12;
    let _swipe_time = _params.swipe_time || 120;
    let _condition_meet_sides = parseInt(_params.condition_meet_sides);
    if (_condition_meet_sides !== 1 || _condition_meet_sides !== 2) _condition_meet_sides = 1;
    let _getDisplayParams = typeof getDisplayParams === "undefined" ? getDisplayParamsRaw : getDisplayParams;

    let {HEIGHT, WIDTH} = _getDisplayParams();

    let _swipe_area = _setAreaParams(_params.swipe_area, [0.1, 0.1, 0.9, 0.9]);
    let _aim_area = _setAreaParams(_params.aim_area, [0, 0, -1, -1]);
    let _swipe_direction = _setSwipeDirection();

    if (!_swipe_direction || _success()) return true;
    while (_max_swipe_times--) {
        if (_swipeAndCheck()) break;
    }
    return _max_swipe_times >= 0;

    // tool function(s) //

    function _setSwipeDirection() {
        let _swipe_direction = _params.swipe_direction;
        if (typeof _swipe_direction === "string" && _swipe_direction !== "auto") {
            if (_swipe_direction.match(/$[Lf](eft)?^/)) return "left";
            if (_swipe_direction.match(/$[Uu](p)?^/)) return "up";
            if (_swipe_direction.match(/$[Rr](ight)?^/)) return "right";
            if (_swipe_direction.match(/$[Dd](own)?^/)) return "down";
        }
        let _node = f.findOnce();
        if (!_node) return "up";
        // auto mode
        let _bounds = _node.bounds();
        let [_bl, _bt, _br, _bb] = [_bounds.left, _bounds.top, _bounds.right, _bounds.bottom];
        if (_bb >= _aim_area.b || _bt >= _aim_area.b) return "up";
        if (_bt <= _aim_area.t || _bb <= _aim_area.t) return "down";
        if (_br >= _aim_area.r || _bl >= _aim_area.r) return "left";
        if (_bl <= _aim_area.l || _br <= _aim_area.l) return "right";
    }

    function _setAreaParams(specified, backup_plan) {
        let _area = _checkArea(specified) || backup_plan;
        _area = _area.map((_num, _idx) => _num !== -2 ? _num : backup_plan[_idx]);
        _area = _area.map((_num, _idx) => _num >= 1 ? _num : ((!~_num ? 1 : _num) * (_idx % 2 ? HEIGHT : WIDTH)));
        let [_l, _t, _r, _b] = _area;
        if (_r < _l) [_r, _l] = [_l, _r];
        if (_b < _t) [_b, _t] = [_t, _b];
        let [_h, _w] = [_b - _t, _r - _l];
        let [_cl, _ct, _cr, _cb] = [
            {x: _l, y: _t + _h / 2},
            {x: _l + _w / 2, y: _t},
            {x: _r, y: _t + _h / 2},
            {x: _l + _w / 2, y: _b},
        ];
        return {
            l: _l, t: _t, r: _r, b: _b,
            cl: _cl, ct: _ct, cr: _cr, cb: _cb,
        };

        // tool function(s) //

        function _checkArea(area) {
            if (Object.prototype.toString.call(area).slice(8, -1) !== "Array") return;
            let _len = area.length;
            if (_len !== 4) return;
            for (let _i = 0; _i < _len; _i += 1) {
                let _num = +area[_i];
                if (isNaN(_num) || (_num < 0 && (_num !== -1 && _num !== -2))) return;
                if (_i % 2 && _num > device.height) return;
                if (!(_i % 2) && _num > device.width) return;
            }
            return area;
        }
    }

    function _swipeAndCheck() {
        _swipe();
        sleep(_swipe_interval);
        if (_success()) return true;

        // tool function(s) //

        function _swipe() {
            let {cl, cr, ct, cb} = _swipe_area;
            let [_cl, _cr, _ct, _cb] = [cl, cr, ct, cb];
            if (_swipe_direction === "down") return swipe(_ct.x, _ct.y, _cb.x, _cb.y, _swipe_time);
            if (_swipe_direction === "left") return swipe(_cr.x, _cr.y, _cl.x, _cl.y, _swipe_time);
            if (_swipe_direction === "right") return swipe(_cl.x, _cl.y, _cr.x, _cr.y, _swipe_time);
            return swipe(_cb.x, _cb.y, _ct.x, _ct.y, _swipe_time);
        }
    }

    function _success() {
        let max_try_find_times = 5;
        let _node;
        while (max_try_find_times--) {
            if ((_node = f.findOnce())) break;
        }
        if (!_node) return false;
        let _bounds = _node.bounds();
        if (_bounds.height() <= 0 || _bounds.width() <= 0) return false;
        let [_left, _top, _right, _bottom] = [_bounds.left, _bounds.top, _bounds.right, _bounds.bottom];
        if (_condition_meet_sides < 2) {
            if (_swipe_direction === "up") return _top < _aim_area.b;
            if (_swipe_direction === "down") return _bottom > _aim_area.t;
            if (_swipe_direction === "left") return _left < _aim_area.r;
            if (_swipe_direction === "right") return _right < _aim_area.l;
        } else {
            if (_swipe_direction === "up") return _bottom < _aim_area.b;
            if (_swipe_direction === "down") return _top > _aim_area.t;
            if (_swipe_direction === "left") return _right < _aim_area.r;
            if (_swipe_direction === "right") return _left < _aim_area.l;
        }
    }

    // raw function(s) //

    function getDisplayParamsRaw() {
        let _window_service_display = context.getSystemService(context.WINDOW_SERVICE).getDefaultDisplay();
        let [WIDTH, HEIGHT] = [
            device.width || +_window_service_display.getWidth(),
            device.height || +_window_service_display.maximumSizeDimension
        ];
        return {
            WIDTH: WIDTH,
            HEIGHT: HEIGHT,
            cX: (num) => Math.min(Math.round(+num * WIDTH / (+num >= 1 ? 720 : 1)), WIDTH),
            cY: (num, aspect_ratio) => Math.min(Math.round(+num * (WIDTH * ((aspect_ratio > 1 ? aspect_ratio : (1 / aspect_ratio)) || (HEIGHT / WIDTH))) / (+num >= 1 ? 1280 : 1)), HEIGHT),
        };
    }
}

/**
 * Swipe to make a certain specified area, then click it
 * -- This is a combination function which means independent use is not recommended
 * @param f {object} - JavaObject
 * @param [swipe_params] {object}
 * @param [swipe_params.max_swipe_times=12] {number}
 * @param [swipe_params.swipe_direction="auto"] {number|string}
 * <br>
 *     -- 0|"l"|"left", 1|"u"|"up", 2|"r"|"right", 3|"d"|"down" - direction to swipe each time <br>
 *     -- "auto" - if "f" exists but not in aim area, direction will be auto-set decided by position of "f", or direction will be "up"
 * @param [swipe_params.swipe_time=100] {number} - the time spent for each swiping - set bigger as needed
 * @param [swipe_params.swipe_interval=300] {number} - the time spent between every swiping - set bigger as needed
 * @param [swipe_params.swipe_area=[0.1, 0.1, 0.9, 0.9]] {number[]} - swipe from a center-point to another
 * @param [swipe_params.aim_area=[0, 0, -1, -1]] {number[]} - restrict for smaller aim area
 * <br>
 *     -- area params - x|0<=x<1: x * (height|width), -1: full-height or full-width, -2: set with default value <br>
 *     -- [%left%, %top%, %right%, %bottom%] <br>
 *     -- [1, 50, 700, 1180] - [1, 50, 700, 1180] <br>
 *     -- [1, 50, 700, -1] - [1, 50, 700, device.height] <br>
 *     -- [0.1, 0.2, -1, -1] - [0.1 * device.width, 0.2 * device.height, device.width, device.height]
 * @param [swipe_params.condition_meet_sides=1] {number=1|2}
 * <br>
 *     -- example A: condition_meet_sides = 1 <br>
 *     -- aim: [0, 0, 720, 1004], direction: "up", swipe distance: 200 <br>
 *     -- swipe once - bounds: [0, 1100, 720, 1350] - top is not less than 1004 - continue swiping <br>
 *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004 - swipe will stop <br>
 *     -- example B: condition_meet_sides = 2 <br>
 *     -- aim: [0, 0, 720, 1004], direction: "up", swipe distance: 200 <br>
 *     -- swipe once - bounds: [0, 1100, 720, 1350] - neither top nor bottom < 1004 - continue swiping <br>
 *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004, but not bottom - swipe will not stop <br>
 *     -- swipe once - bounds: [0, 700, 720, 950] - top < 1004, and so is bottom - swipe will stop
 * @param [click_params] {object}
 * @param [click_params.intermission=300] {number}
 * @param [click_params.click_strategy] {string} - decide the way of click
 * <br>
 *     -- "click"|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- "press" - press(coord_A, coord_B, 1); <br>
 *     -- "widget" - text("abc").click();
 * @param [click_params.condition_success=()=>true] {string|function}
 * <br>
 *     -- *DEFAULT* - () => true <br>
 *     -- /disappear(ed)?/ - (f) => !f.exists(); - disappeared from the whole screen <br>
 *     -- /disappear(ed)?.*in.?place/ - (f) => #some node info changed#; - disappeared in place <br>
 *     -- func - (f) => func(f);
 * @param [click_params.check_time_once=500] {number}
 * @param [click_params.max_check_times=0] {number}
 * <br>
 *     -- if condition_success is specified, then default value of max_check_times will be 3 <br>
 *     --- example: (this is not usage) <br>
 *     -- while (!waitForAction(condition_success, check_time_once) && max_check_times--) ; <br>
 *     -- return max_check_times >= 0;
 * @param [click_params.padding] {number|array}
 * <br>
 *     -- ["x", -10]|[-10, 0] - x=x-10; <br>
 *     -- ["y", 69]|[0, 69]|[69]|69 - y=y+69;
 */
function swipeInAreaAndClickAction(f, swipe_params, click_params) {
    let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;
    let _swipeInArea = typeof swipeInArea === "undefined" ? swipeInAreaRaw : swipeInArea;

    if (_swipeInArea(f, swipe_params)) return _clickAction(f, click_params && click_params.click_strategy, click_params);

    // raw function(s) //

    function clickActionRaw(kw) {
        let _kw = Object.prototype.toString.call(kw).slice(8, -1) === "Array" ? kw[0] : kw;
        let _key_node = _kw.findOnce();
        if (!_key_node) return;
        let _bounds = _key_node.bounds();
        click(_bounds.centerX(), _bounds.centerY());
        return true;
    }

    function swipeInAreaRaw(kw, params) {
        let _max_try_times = 10;
        while (_max_try_times--) {
            let _node = kw.findOnce();
            if (_node && _node.bounds().top > 0 && _node.bounds().bottom < device.height) return true;
            let _dev_h = device.height;
            let _dev_w = device.width;
            swipe(_dev_w * 0.5, _dev_h * 0.8, _dev_w * 0.5, _dev_h * 0.2, params.swipe_time || 100);
            sleep(params.swipe_interval || 300);
        }
        return _max_try_times >= 0;
    }
}

/**
 * Simulates touch, keyboard or key press events (by shell or functions based on accessibility service)
 * @param keycode_name {string|number} - {@link https://developer.android.com/reference/android/view/KeyEvent}
 * @param [params_str] {string}
 * <br>
 *     - /force_shell/ - don't use accessibility functions like back(), home() or recents() <br>
 *     - /no_err(or)?_(message|msg)/ - don't print error message or not when keycode() failed
 * @example
 * keycode(3); // keycode("home"); // keycode("KEYCODE_HOME"); <br>
 * keycode(4, "force_shell|no_err_msg"); // keycode("back", "force_shell|no_err_msg"); <br>
 * keycode("KEYCODE_POWER", "no_error_message"); // keycode(26, "no_err_msg"); <br>
 * keycode("recent"); // keycode("recent_apps"); // keycode("KEYCODE_APP_SWITCH");
 * @return {boolean}
 */
function keycode(keycode_name, params_str) {
    params_str = params_str || "";

    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;

    if (params_str.match(/force.*shell/i)) return keyEvent(keycode_name);
    let _tidy_keycode_name = keycode_name.toString().toLowerCase().replace(/^keycode_|s$/, "").replace(/_([a-z])/g, ($0, $1) => $1.toUpperCase());
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

/**
 * Print a message in console with verbose mode for debugging
 * @param msg {string|string[]} - message will be formatted with prefix ">> "
 * <br>
 *     - "sum is much smaller" - ">> sum is much smaller" <br>
 *     - ">sum is much smaller" - ">>> sum is much smaller"
 * @param [info_flag] {boolean|string|number} - like: true; "up"; 3; "up_3"
 * @param [params] {object} - reserved
 */
function debugInfo(msg, info_flag, params) {
    __global__ = typeof __global__ === "undefined" ? {} : __global__;

    let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

    if (typeof msg === "string" && msg.match(/^__split_line__?/)) {
        let _msg = "";
        if (msg.match(/dash/)) {
            for (let i = 0; i < 16; i += 1) _msg += "- ";
            _msg += "-";
        } else {
            for (let i = 0; i < 32; i += 1) _msg += "-";
        }
        msg = _msg;
    }
    if (Object.prototype.toString.call(msg).slice(8, -1) === "Array") return !~msg.forEach(msg => debugInfo(msg, info_flag, params));
    if (!!info_flag === true && !info_flag.toString().match(/up|\d/) || __global__._monster_$_debug_info_flag) {
        let info_flag_str = (info_flag || "").toString();
        info_flag_str.match(/up[^A-Za-z0-9]/) && _showSplitLine();
        let msg_level = +info_flag_str.match(/\d/) || 0;
        _messageAction((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "), msg_level);
    }

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
        let _msg_level = typeof + msg_level === "number" ? +msg_level : -1;
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

/**
 * Returns display screen width and height data, and converter functions with different aspect ratios
 * -- scaling based on Sony Xperia XZ1 Compact - G8441 (720 × 1280)
 * @example
 * let {WIDTH, HEIGHT, cX, cY, USABLE_WIDTH, USABLE_HEIGHT, screen_orientation, status_bar_height, navigation_bar_height, navigation_bar_height_computed, action_bar_default_height} = getDisplayParams();
 * console.log(WIDTH, HEIGHT, cX(80), cY(700), cY(700, 16/9);
 * @return {*}
 */
function getDisplayParams() {
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _window_service_display = context.getSystemService(context.WINDOW_SERVICE).getDefaultDisplay();
    let [WIDTH, HEIGHT] = [];
    let display_info = {};
    if (_waitForAction(checkData, 3000, 500)) {
        display_info.cX = (num) => Math.min(Math.round(num * WIDTH / (Math.abs(num) >= 1 ? 720 : 1)), WIDTH);
        display_info.cY = (num, aspect_ratio) => Math.min(Math.round(num * WIDTH * (Math.pow(aspect_ratio, aspect_ratio > 1 ? 1 : -1) || (HEIGHT / WIDTH)) / (Math.abs(num) >= 1 ? 1280 : 1)), HEIGHT);
        return display_info;
    }

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
}

/**
 * Returns equivalency of two objects (generalized) or two basic-data-type variables
 * @param obj_a {*}
 * @param obj_b {*}
 * @return {boolean}
 */
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

/**
 * Deep clone a certain object (generalized)
 * @param obj {*}
 * @return {*}
 */
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

/**
 * Scroll a page smoothly from pages pool
 * @param shifting {number[]|string} - page shifting -- positive for shifting left and negative for right
 * <br>
 *     - "full_left" - "[WIDTH, 0]" <br>
 *     - "full_right" - "[-WIDTH, 0]" <br>
 *     - [-90, 0] - 90 px right shifting
 * @param [duration=180] {number} - scroll duration
 * @param pages_pool {array} - pool for storing pages (parent views)
 * @param [base_view=ui.main] {View} - specified view for attaching parent views
 */
function smoothScrollView(shifting, duration, pages_pool, base_view) {
    __global__ = typeof __global__ === "undefined" ? {} : __global__;

    if (pages_pool.length < 2) return;
    if (__global__._monster_$_page_scrolling_flag) return;

    __global__._monster_$_page_scrolling_flag = true;
    let page_scrolling_flag = true;

    duration = duration || 180;
    let each_move_time = 10;
    base_view = base_view || ui.main;

    let len = pages_pool.length;
    let [main_view, sub_view] = [pages_pool[len - 2], pages_pool[len - 1]];
    let parent = base_view.getParent();

    let _getDisplayParams = typeof getDisplayParams === "undefined" ? getDisplayParamsRaw : getDisplayParams;
    let {WIDTH} = _getDisplayParams();

    let abs = num => num < 0 && -num || num;
    let scroll_interval = null;

    try {
        if (shifting === "full_left") {
            shifting = [WIDTH, 0];
            sub_view && sub_view.scrollBy(-WIDTH, 0);
            parent.addView(sub_view);
        } else if (shifting === "full_right") {
            shifting = [-WIDTH, 0];
        }

        let [dx, dy] = [shifting[0], shifting[1]];
        let [neg_x, neg_y] = [dx < 0, dy < 0];

        dx = abs(dx);
        dy = abs(dy);

        let ptx = dx && Math.ceil(each_move_time * dx / duration) || 0;
        let pty = dy && Math.ceil(each_move_time * dy / duration) || 0;

        scroll_interval = setInterval(function () {
            try {
                if (!dx && !dy) {
                    if ((shifting[0] === -WIDTH && sub_view) && page_scrolling_flag) {
                        sub_view.scrollBy(WIDTH, 0);
                        let child_count = parent.getChildCount();
                        parent.removeView(parent.getChildAt(--child_count));
                    }
                    page_scrolling_flag = false;
                    return __global__._monster_$_page_scrolling_flag = false;
                }
                let move_x = ptx && (dx > ptx ? ptx : (ptx - (dx % ptx))),
                    move_y = pty && (dy > pty ? pty : (pty - (dy % pty)));
                let scroll_x = neg_x && -move_x || move_x,
                    scroll_y = neg_y && -move_y || move_y;
                sub_view && sub_view.scrollBy(scroll_x, scroll_y);
                main_view.scrollBy(scroll_x, scroll_y);
                dx -= ptx;
                dy -= pty;
            } catch (e) {
                // setInterval will throw Error even if it's in a try() body
            }
        }, each_move_time);

        threads.start(function () {
            waitForAction(() => !page_scrolling_flag, 10000);
            scroll_interval && clearInterval(scroll_interval);
        });
    } catch (e) {
        scroll_interval && clearInterval(scroll_interval);
        page_scrolling_flag = false;
        __global__._monster_$_page_scrolling_flag = false;
    }

    // raw function(s) //

    function getDisplayParamsRaw() {
        let _window_service_display = context.getSystemService(context.WINDOW_SERVICE).getDefaultDisplay();
        let [WIDTH, HEIGHT] = [
            device.width || +_window_service_display.getWidth(),
            device.height || +_window_service_display.maximumSizeDimension
        ];
        return {
            WIDTH: WIDTH,
            HEIGHT: HEIGHT,
            cX: (num) => Math.min(Math.round(+num * WIDTH / (+num >= 1 ? 720 : 1)), WIDTH),
            cY: (num, aspect_ratio) => Math.min(Math.round(+num * (WIDTH * ((aspect_ratio > 1 ? aspect_ratio : (1 / aspect_ratio)) || (HEIGHT / WIDTH))) / (+num >= 1 ? 1280 : 1)), HEIGHT),
        };
    }
}

/**
 * Show a message in dialogs title view (an alternative strategy for TOAST message which may be covered by dialogs box)
 * @param dialog {Dialogs} - wrapped "dialogs" object
 * @param message {string} - message shown in title view
 * @param [duration=3000] {number} - time duration before message dismissed (0 for non-auto dismiss)
 */
function alertTitle(dialog, message, duration) {
    __global__ = typeof __global__ === "undefined" ? {} : __global__;

    __global__._monster_$_alert_title_info = __global__._monster_$_alert_title_info || {};
    let alert_title_info = __global__._monster_$_alert_title_info;
    alert_title_info[dialog] = alert_title_info[dialog] || {};
    alert_title_info["message_showing"] ? alert_title_info["message_showing"]++ : (alert_title_info["message_showing"] = 1);

    let ori_text = alert_title_info[dialog].ori_text || "",
        ori_text_color = alert_title_info[dialog].ori_text_color || "",
        ori_bg_color = alert_title_info[dialog].ori_bg_color || "";

    let ori_title_view = dialog.getTitleView();
    if (!ori_text) {
        ori_text = ori_title_view.getText();
        alert_title_info[dialog].ori_text = ori_text;
    }
    if (!ori_text_color) {
        ori_text_color = ori_title_view.getTextColors().colors[0];
        alert_title_info[dialog].ori_text_color = ori_text_color;
    }

    if (!ori_bg_color) {
        let bg_color_obj = ori_title_view.getBackground();
        ori_bg_color = bg_color_obj && bg_color_obj.getColor() || -1;
        alert_title_info[dialog].ori_bg_color = ori_bg_color;
    }

    setTitleInfo(dialog, message, colors.parseColor("#c51162"), colors.parseColor("#ffeffe"));

    if (duration === 0) return;

    setTimeout(() => {
        alert_title_info["message_showing"]--;
        if (alert_title_info["message_showing"]) return;
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

/**
 * Replace or append a message in dialogs content view
 * @param dialog {Dialogs} - wrapped "dialogs" object
 * @param message {string} - message shown in content view
 * @param [mode="replace"] {string}
 * <br>
 *     -- "replace" - original content will be replaced <br>
 *     -- "append" - original content will be reserved
 */
function alertContent(dialog, message, mode) {
    let ori_content_view = dialog.getContentView();
    let ori_text = ori_content_view.getText().toString();
    mode = mode || "replace";

    let text = (mode === "append" ? ori_text + "\n\n" : "") + message;

    ui.post(() => {
        ori_content_view.setText(text);
        ori_content_view.setTextColor(colors.parseColor("#283593"));
        ori_content_view.setBackgroundColor(colors.parseColor("#e1f5fe"));
    });
}

/**
 * Observe message(s) from Toast by events.observeToast()
 * @param observed_app_pkg_name {string}
 * @param observed_msg {RegExp|string} - regular expression or a certain specific string
 * @param [timeout=20000] {number}
 * @param [aim_amount=1] {number} - events will be cleared if aim_amount messages have been got
 * @return {string[]}
 */
function observeToastMessage(observed_app_pkg_name, observed_msg, timeout, aim_amount) {
    if (aim_amount === 0) return [];

    timeout = +timeout;
    if (timeout < 3000) timeout = 3000;

    let _timeout = timeout || 20000;
    let _observed_msg = observed_msg || "";
    let _pkg_name = observed_app_pkg_name || currentPackage();
    let _amount = aim_amount || 1;
    let _got_msg = [];

    threads.start(function () {
        events.observeToast();
        events.onToast(msg => msg.getPackageName() === _pkg_name && msg.getText().match(_observed_msg) && _got_msg.push(msg.getText()));
    });

    waitForAction(() => _got_msg.length >= _amount, _timeout, 50);

    events.recycle(); // to remove toast listener from "events" to make it available for next-time invoke
    events.removeAllListeners("toast"); // or, events will exceed the max listeners limit with default 10

    return _got_msg;
}

/**
 * Save current screen capture as a file with a key name and a formatted timestamp
 * @param key_name {string} - a key name as a clip of the file name
 * @param log_level - #see messageAction -- leave false value (not including 0) if not needing console logs
 * @see messageAction
 */
function captureErrScreen(key_name, log_level) {
    __global__ = typeof __global__ === "undefined" ? {} : __global__;

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
        if (!__global__._monster_$_request_screen_capture_flag) {
            images.requestScreenCapture();
            sleep(300);
        }
    }
}

/**
 * Returns a selector() with additional functions bound to its __proto__
 * @param [params]
 * @param [params.debug_info_flag=false] {boolean} - to control the usability of debugInfo()
 * @proto pickup {function}
 * @returns {*}
 */
function getSelector(params) {
    __global__ = typeof __global__ === "undefined" ? {} : __global__;

    let _params = params || {};
    let classof = o => Object.prototype.toString.call(o).slice(8, -1);
    let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _params.debug_info_flag);
    let sel = selector();
    sel.__proto__ = {
        /**
         * Returns a selector node (JavaObject) with 4 selectors /(text|desc)(Matches)?/;
         * If no JavaObjects were found, returns a selector node according to "prefer" param ("text(Matches)" or "desc(Matches)")
         * If memory_keyword was found in this session memory, returns a memorized selector node directly
         * @memberOf getSelector
         * @param filter_condition {string|RegExp} - filter condition for this selector
         * @param memory_keyword {string} - to mark this selector node; better use a keyword without conflict
         * @param [prefer="desc"] {string} - unique selector you prefer to check first; "text" or "desc"
         * @returns {JavaObject}
         */
        pickup: (filter_condition, memory_keyword, prefer) => {
            let _mem_kw_prefix = "_MEM_KW_PREFIX_";
            if (memory_keyword) {
                let memory_kn = __global__[_mem_kw_prefix + memory_keyword];
                if (memory_kn) return memory_kn;
            }
            let kn = getSelector();
            if (memory_keyword && kn.exists()) {
                _debugInfo(["选择器已记录", ">" + memory_keyword, ">" + kn]);
                __global__[_mem_kw_prefix + memory_keyword] = kn;
            }
            return kn;

            // tool function(s)//

            function getSelector() {
                let classof = Object.prototype.toString.call(filter_condition).slice(8, -1);
                if (typeof filter_condition === "string") {
                    if (prefer === "text") return text(filter_condition).exists() ? text(filter_condition) : desc(filter_condition);
                    return desc(filter_condition).exists() ? desc(filter_condition) : text(filter_condition);
                }
                if (classof === "RegExp") {
                    if (prefer === "text") return textMatches(filter_condition).exists() ? textMatches(filter_condition) : descMatches(filter_condition);
                    return descMatches(filter_condition).exists() ? descMatches(filter_condition) : textMatches(filter_condition);
                }
            }
        },
        /**
         * Returns the name of this selector ("text" or "desc" without "Matches")
         * If no JavaObjects were found, returns a selector name according to "prefer" param
         * @memberOf getSelector
         * @param filter_condition {string|RegExp} - filter condition for this selector
         * @param memory_keyword {string} - to mark this selector node; better use a keyword without conflict
         * @param [prefer="desc"] {string} - unique selector you prefer to check first; "text" or "desc"
         * @returns {string} - "desc" or "text"
         */
        selStr: (filter_condition, memory_keyword, prefer) => {
            if (classof(filter_condition) === "JavaObject") return filter_condition.toString().slice(0, 4);
            return sel.pickup(filter_condition, memory_keyword, prefer).toString().slice(0, 4);
        },
    };
    _debugInfo("选择器加入新方法");
    Object.keys(sel.__proto__).forEach(key => _debugInfo(">" + key + "()"));
    return sel;

    // raw function(s) //

    function debugInfoRaw(msg, info_flag) {
        if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }
}

/**
 * Returns if all (or one) of selectors exist(s) (or functions return(s) a true value)
 * @param conditions... {JavaObject|function|string}
 * @example
 * selExists(
 *     textMatches(/.+abc.*$/), // RegExp selector
 *     desc("123"), // unique selector
 *     () => id("my_id").find().size() >= 3, // function with condition(s) (usually is(are) related to selector(s))
 *     "or" // logic restriction string: "or" or "one"
 * );
 * selExists(
 *     textMatches(/.+abc.*$/),
 *     desc("123"),
 *     () => id("my_id").find().size() >= 3,
 *     "and" // logic restriction string: "and" or "all", and can be omitted as default
 * );
 * @returns {boolean}
 */
function selExists(conditions) {
    let args = arguments;
    let i = 0;
    let len = args.length;
    if (!len) return false;
    let logic = "and";
    let last_arg = args[len - 1];
    if (typeof last_arg === "string") {
        len -= 1;
        if (!len) return false;
        if (last_arg.match(/^(or|one)$/)) logic = "or";
        else if (last_arg.match(/^(and|all)$/)) logic = "and";
    }

    let classof = o => Object.prototype.toString.call(o).slice(8, -1);
    for (; i < len; i += 1) {
        let arg = args[i];
        let cond = () => null;
        if (classof(arg) === "JavaObject") cond = () => arg.exists();
        else if (typeof arg === "function") cond = arg;
        let result = cond();
        if (logic === "or" && result) return true;
        if (logic === "and" && !result) return false;
    }
    // return logic === "or" && false || logic === "and" && true;
    return logic === "and";
}

/**
 * Returns a new string with a certain mark surrounded
 * @param target {*} - will be converted to String format
 * @param [mark_left='"'] {*} - will be converted to String format
 * @param [mark_right=mark_left] {*} - will be converted to String format
 * @example
 * surroundedBy("ABC") - "ABC"
 * surroundedBy("ABC", "#") - #ABC#
 * surroundedBy([1, 2].join("+"), "{", "}") - {1+2}
 * @returns {string}
 */
function surroundWith(target, mark_left, mark_right) {
    mark_left = (mark_left || '"').toString();
    mark_right = (mark_right || mark_left).toString();
    return mark_left + target.toString() + mark_right;
}

/**
 * Returns a state number which indicated phone calling state
 * @returns {number} - 0: IDLE; 1: RINGING; 2: OFF-HOOK // some device may behave abnormally - 2: IDLE; 1: OFF-HOOK
 */
function phoneCallingState() {
    let phone_service = com.android.internal.telephony.ITelephony.Stub.asInterface(
        android.os.ServiceManager.checkService("phone")
    );
    return +phone_service.getCallState();
}

/**
 * Record a timestamp then get the time gap by a certain keyword
 * @param keyword {string}
 * @param [operation] {boolean|number|string}
 * <br>
 * put a timestamp: "put"; "save"; false value <br>
 * load time gap: "load", "get", any other true value <br>
 * @param [divisor=1] {number}
 * @param [fixed] {array|number} - array: max decimal places (last place won't be 0)
 * @param [suffix] {string}
 * @returns {number|string} - timestamp or time gap with/without a certain format or suffix string
 * @example
 * timeRecorder("running", "put"); timeRecorder("running", "get") - eg: 1565080123796
 * timeRecorder("collect", "save"); timeRecorder("collect", "load", 1000, 2, "s") - eg: "12.40s"
 * timeRecorder("waiting", 0); timeRecorder("waiting", 1, 3.6 * Math.pow(10, 6), 0, " hours") - eg: "18 hours"
 * timeRecorder("try_peeking"); timeRecorder("try_peeking", "time_gap", 1000, [7]) - eg: 10.331 (not "10.3310000")
 */
function timeRecorder(keyword, operation, divisor, fixed, suffix) {
    __global__ = typeof __global__ === "undefined" ? {} : __global__;

    let records = __global__._monster_$_timestamp_records;
    if (!__global__._monster_$_timestamp_records) records = __global__._monster_$_timestamp_records = {};
    if (!operation || operation.toString().match(/save|put/)) return records[keyword] = +new Date();
    let forcible_fixed_num_flag = false;
    if (typeof fixed === "object" /* array */) forcible_fixed_num_flag = true;
    let result = (+new Date() - records[keyword]) / (divisor || 1); // number
    if (typeof fixed !== "undefined" && fixed !== null) result = result.toFixed(+fixed); // string
    if (forcible_fixed_num_flag) result = +result;
    if (suffix) result += suffix.toString();
    return result;
}