module.exports = {
    parseAppName: parseAppName,
    killThisApp: killThisApp,
    launchThisApp: launchThisApp,
    messageAction: messageAction,
    showSplitLine: showSplitLine,
    waitForAction: waitForAction,
    clickAction: clickAction,
};

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
 * Close or minimize some app, and wait for at most 15 sec
 * @param [name=current_app.package_name||current_app.app_name] {string}
 * <br>
 *     -- app name - like "Alipay" (not recommended, as long time may cost) <br>
 *     -- package_name - like "com.eg.android.AlipayGphone"
 * @param [params] {object}
 * @param [params.shell_acceptable=true] {boolean}
 * @param [params.keycode_back_acceptable=true] {boolean}
 * @param [params.keycode_back_twice=false] {boolean}
 * @param [params.condition_success=()=>currentPackage() !== app_package_name] {function}
 * @param [params.debug_info_flag] {string}
 * * <br>
 *     -- *DEFAULT* - decided by debugInfo() itself <br>
 *     -- "forcible" - forcibly use debugInfo() <br>
 *     -- "none" - forcibly not use debugInfo()
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

    let _current_app = typeof current_app === "undefined" ? {} : current_app;
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _debugInfo = typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo;
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;
    let _parseAppName = typeof parseAppName === "undefined" ? parseAppNameRaw : parseAppName;
    let _refreshObjects = typeof refreshObjects === "undefined" ? refreshObjectsRaw : refreshObjects;
    params = Object.assign({}, _current_app, params || {});

    name = name || params.package_name || params.app_name;
    if (!name) _messageAction("未能确定应用名称或包名", 8, 1, 0, 1);
    let _parsed_app_name = _parseAppName(name);
    let _app_name = _parsed_app_name.app_name;
    let _package_name = _parsed_app_name.package_name;
    if (!(_app_name && _package_name)) _messageAction("解析应用名称及包名失败", 8, 1, 0, 1);

    let _shell_acceptable = typeof params.shell_acceptable === "undefined" && true || params.shell_acceptable;
    let _keycode_back_acceptable = typeof params.keycode_back_acceptable === "undefined" && true || params.keycode_back_acceptable;
    let _keycode_back_twice = params.keycode_back_twice || false;
    let _condition_success = params.condition_success || function () {
        return currentPackage() !== _package_name;
    };

    let _shell_result = false;
    let _shell_start_timestamp = new Date().getTime();
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

    if (_waitForAction(_condition_success, 15000)) {
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
        ];

        let _max_try_times_minimize = 20;
        let _max_try_times_minimize_backup = _max_try_times_minimize;

        let _tmp_current_pkg = currentPackage();
        if (_tmp_current_pkg !== _package_name) {
            _debugInfo("当前前置应用包名:");
            _debugInfo(">" + _tmp_current_pkg);
            _debugInfo("借用alert()方法刷新前置应用");
            _refreshObjects();
            _debugInfo("当前前置应用包名:");
            _debugInfo(">" + currentPackage());
            if (_condition_success()) {
                _debugInfo("退出完成条件已满足");
                _debugInfo("最小化应用成功");
                return true;
            }
        }

        while (_max_try_times_minimize--) {
            let _kw_clicked_flag = false;
            for (let i = 0, len = _kw_avail_btns.length; i < len; i += 1) {
                let _kw_avail_btn = _kw_avail_btns[i];
                if (_kw_avail_btn.exists()) {
                    _kw_clicked_flag = true;
                    _clickAction(_kw_avail_btns);
                    sleep(300);
                    break;
                }
            }
            if (_kw_clicked_flag) continue;
            back();
            _keycode_back_twice && ~sleep(200) && back();
            if (_waitForAction(_condition_success, 2000)) break;
        }
        if (_max_try_times_minimize < 0) {
            _debugInfo("最小化应用尝试已达: " + _max_try_times_minimize_backup + "次");
            _debugInfo("重新仅模拟返回键尝试最小化");
            _max_try_times_minimize = 8;
            while (_max_try_times_minimize--) {
                back();
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
        toast_flag && toast(msg);
        msg_level && log(msg);
        msg_level >= 8 && exit();
    }

    function debugInfoRaw(msg) {
        if (params.debug_info_flag === "forcible") return msg[0] === ">" ? log(">>> " + msg.slice(1)) : log(">> " + msg);
    }

    function waitForActionRaw(cond_func, time_params) {
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 1000;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!cond_func() && _check_time >= 0) {
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

    function refreshObjectsRaw(custom_text) {
        let _alert_text = custom_text || "Alert for refreshing objects";
        let _kw_alert_text = text(_alert_text);
        threads.start(function () {
            _kw_alert_text.findOne(1000);
            let _kw_ok_btn = textMatches(/OK|确./);
            _kw_ok_btn.findOne(2000) && _kw_ok_btn.click();
        });
        alert(_alert_text);
        sleep(300);
    }
}

/**
 * Launch some app with package name or intent
 * And wait for conditions ready if specified
 * @param intent_or_name {object|string}
 * <br>
 *     -- intent - activity object like {
 *         action: "VIEW",
 *         packageName: "com.eg.android.AlipayGphone",
 *         className: "...",
 *     } <br>
 *     -- package name - like "com.eg.android.AlipayGphone" <br>
 *     -- app name - like "Alipay"
 * @param [params] {object}
 * @param [params.package_name] {string}
 * @param [params.app_name] {string}
 * @param [params.task_name] {string}
 * @param [params.condition_launch] {function}
 * @param [params.condition_ready] {function}
 * @param [params.disturbance] {function}
 * @param [params.debug_info_flag] {string}
 * * <br>
 *     -- *DEFAULT* - decided by debugInfo() itself <br>
 *     -- "forcible" - forcibly use debugInfo() <br>
 *     -- "none" - forcibly not use debugInfo()
 * @param [params.first_time_run_message_flag=true] {boolean}
 * @param [params.no_message_flag] {boolean}
 * @param [params.global_retry_times=3] {number}
 * @param [params.launch_retry_times=3] {number}
 * @param [params.ready_retry_times=5] {number}
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
 * });
 * @return {boolean}
 */
function launchThisApp(intent_or_name, params) {

    if (typeof this.first_time_run === "undefined") this.first_time_run = 1;

    let _current_app = typeof current_app === "undefined" ? {} : current_app;
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _debugInfo = typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo;
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _killThisApp = typeof killThisApp === "undefined" ? killThisAppRaw : killThisApp;
    let _params = Object.assign({}, _current_app, params || {});

    if (!intent_or_name || typeof intent_or_name !== "object" && typeof intent_or_name !== "string") _messageAction("应用启动目标参数无效", 8, 1, 0, 1);

    let _package_name = "";
    let _app_name = "";
    let _task_name = _params.task_name || "";

    _setAppName();

    _debugInfo("启动目标参数类型: " + typeof intent_or_name);

    let _condition_ready = _params.condition_ready;
    let _condition_launch = _params.condition_launch;
    let _disturbance = _params.disturbance;
    let _max_retry_times = _params.global_retry_times || 3;
    let _first_time_run_message_flag = typeof _params.first_time_run_message_flag === "undefined" ? true : _params.first_time_run_message_flag;
    let _max_retry_times_backup = _max_retry_times;
    while (_max_retry_times--) {

        let _max_launch_times = _params.launch_retry_times || 3;
        let _max_launch_times_backup = _max_launch_times;
        if (!_params.no_message_flag) {
            let _msg_launch = _task_name ? "重新开始\"" + _task_name + "\"任务" : "重新启动\"" + _app_name + "\"应用";
            if (!this.first_time_run) _messageAction(_msg_launch, null, 1);
            else _first_time_run_message_flag && _messageAction(_msg_launch.replace(/重新/g, ""), null, 1);
        }
        while (_max_launch_times--) {
            if (typeof intent_or_name === "object") {
                _debugInfo("加载intent参数启动应用");
                app.startActivity(intent_or_name);
            } else {
                _debugInfo("加载包名参数启动应用");
                app.launchPackage(_package_name);
            }

            let _cond_succ = () => currentPackage() === _package_name || _condition_launch && _condition_launch();
            let _cond_succ_flag = _waitForAction(_cond_succ, [5000, 800]);
            _debugInfo("应用启动" + (_cond_succ_flag ? "成功" : "超时 (" + (_max_launch_times_backup - _max_launch_times) + "\/" + _max_launch_times_backup + ")"));
            if (_cond_succ_flag) break;
            else _debugInfo(">" + currentPackage());
        }
        if (_max_launch_times < 0) _messageAction("打开\"" + _app_name + "\"失败", 8, 1, 0, 1);

        this.first_time_run = 0;
        if (_condition_ready === null || _condition_ready === undefined) {
            _debugInfo("未设置启动完成条件参数");
            break;
        }

        _debugInfo("开始监测启动完成条件");
        this.ready_monitor_signal = false; // in case that there is a thread who needs a signal to interrupt

        _disturbance && _disturbance.bind(this)();

        let max_ready_try_times = _params.ready_retry_times || 3;
        let max_ready_try_times_backup = max_ready_try_times;
        while (!_waitForAction(_condition_ready, 8000) && max_ready_try_times--) {
            let try_count_info = "(" + (max_ready_try_times_backup - max_ready_try_times) + "\/" + max_ready_try_times_backup + ")";
            if (typeof intent_or_name === "object") {
                _debugInfo("重新启动Activity " + try_count_info);
                app.startActivity(intent_or_name);
            } else {
                _debugInfo("重新启动应用 " + try_count_info);
                app.launchPackage(intent_or_name);
            }
        }

        this.ready_monitor_signal = true;

        if (max_ready_try_times >= 0) {
            _debugInfo("启动完成条件监测完毕");
            break;
        }
        _debugInfo("尝试关闭\"" + _app_name + "\"应用: (" + (_max_retry_times_backup - _max_retry_times) + "\/" + _max_retry_times_backup + ")");
        _killThisApp(_package_name);
    }
    if (_max_retry_times < 0) _messageAction("\"" + (_task_name || _app_name) + "\"初始状态准备失败", 8, 1, 0, 1);
    _debugInfo(("\"" + _task_name || _app_name) + "\"初始状态准备完毕");
    return true;

    // tool function(s) //

    function _setAppName() {
        if (typeof intent_or_name === "string") {
            _app_name = !intent_or_name.match(/.+\..+\./) && app.getPackageName(intent_or_name) && intent_or_name;
            _package_name = app.getAppName(intent_or_name) && intent_or_name;
        } else {
            _app_name = _params.app_name;
            _package_name = _params.package_name || intent_or_name.packageName;
        }
        _app_name = _app_name || _package_name && app.getAppName(_package_name);
        _package_name = _package_name || _app_name && app.getPackageName(_app_name);
        if (!_app_name && !_package_name) {
            _messageAction("未找到应用", 4, 1);
            _messageAction(intent_or_name, 8, 0, 1, 1);
        }
    }

    // raw function(s) //

    function messageActionRaw(msg, msg_level, toast_flag) {
        toast_flag && toast(msg);
        msg_level && log(msg);
        msg_level >= 8 && exit();
    }

    function debugInfoRaw(msg) {
        if (_params.debug_info_flag === "forcible") return msg[0] === ">" ? log(">>> " + msg.slice(1)) : log(">> " + msg);
    }

    function waitForActionRaw(cond_func, time_params) {
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 1000;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function killThisAppRaw(package_name) {
        if (!shell("am force-stop " + package_name, true).code) return _waitForAction(() => currentPackage() !== package_name, 15000);
        let _max_try_times = 10;
        while (_max_try_times--) {
            back();
            if (_waitForAction(() => currentPackage() !== package_name, 2500)) break;
        }
        return _max_try_times >= 0;
    }
}

/**
 * Handle message - toast, console and actions
 * Record message level in storage - the max "msg_level" value (only when "current_app" exists)
 * @param {string} msg - message
 * @param {number|string|object} [msg_level] - message level
 * <br>
 *      -- 0/v/verbose - console.verbose(msg) <br>
 *      -- 1/l/log - console.log(msg) <br>
 *      -- 2/i/info - console.info(msg) <br>
 *      -- 3/w/warn - console.warn(msg) <br>
 *      -- 4/e/error - console.error(msg) <br>
 *      -- 8/x - console.error(msg) & exit <br>
 *      -- 9/h - console.error(msg) & exit to homepage <br>
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
 * @param params {object} reserved
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

    let _msg = msg || " ";
    let _msg_level = typeof msg_level === "number" ? msg_level : -1;
    let _if_toast = if_toast || false;
    let _if_arrow = if_arrow || false;
    let _if_split_line = if_split_line || false;

    let _current_app = typeof current_app === "undefined" ? {} : current_app;
    let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;
    let _params = Object.assign({}, _current_app, params || {});

    let _message_showing_switch = _params.message_showing_switch;
    let _console_log_switch = _params.console_log_switch;

    if (_if_toast && _message_showing_switch !== false) toast(_msg);
    if (_message_showing_switch === false || _console_log_switch === false) return _msg_level >= 8 ? exit() : true;

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
        msg = "> " + msg;
        for (let i = 0; i < _if_arrow; i += 1) msg = "-" + msg;
    }

    let _exit_flag = false;
    switch (_msg_level) {
        case 0:
        case "verbose":
        case "v":
            _msg_level = 0;
            console.verbose(msg);
            break;
        case 1:
        case "log":
        case "l":
            _msg_level = 1;
            console.log(msg);
            break;
        case 2:
        case "i":
        case "info":
            _msg_level = 2;
            console.info(msg);
            break;
        case 3:
        case "warn":
        case "w":
            _msg_level = 3;
            console.warn(msg);
            break;
        case 4:
        case "error":
        case "e":
            _msg_level = 4;
            console.error(msg);
            break;
        case 8:
        case "x":
            _msg_level = 4;
            console.error(msg);
            _exit_flag = true;
            break;
        case 9:
        case "h":
            _msg_level = 4;
            console.error(msg);
            home();
            _exit_flag = true;
            break; // useless, just for inspection
        case "t":
        case "title":
            _msg_level = 1;
            console.log("[ " + msg + " ]");
            break;
    }
    if (_if_split_line) _showSplitLine(typeof _if_split_line === "string" ? (_if_split_line.match(/dash/) ? (_if_split_line.match(/_n|n_/) ? "\n" : "") : _if_split_line) : "", _split_line_style);
    if (typeof current_app !== "undefined") {
        current_app.msg_level = current_app.msg_level ? Math.max(current_app.msg_level, _msg_level) : _msg_level;
    }
    _exit_flag && exit();
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
        return ~log(_split_line + _extra_str);
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
 * @param params - reserved
 * @example
 * showSplitLine(); <br>
 * showSplitLine("\n"); <br>
 * showSplitLine("", "dash");
 * @return {boolean} - always true
 */
function showSplitLine(extra_str, style, params) {

    let _current_app = typeof current_app === "undefined" ? {} : current_app;
    let _params = Object.assign({}, _current_app, params || {});

    if (_params.message_showing_switch === false && _params.console_log_switch === false) return true;

    let _extra_str = extra_str || "";
    let _split_line = "";
    if (style === "dash") {
        for (let i = 0; i < 16; i += 1) _split_line += "- ";
        _split_line += "-";
    } else {
        for (let i = 0; i < 32; i += 1) _split_line += "-";
    }
    log(_split_line + _extra_str);
    return true;
}

/**
 * Wait some period of time for "f" being TRUE
 * @param {object|object[]|function|function[]} f - if f is not true then waiting
 * <br>
 *     -- function - () => text("abc").exists() - if (!f()) waiting <br>
 *     -- JavaObject - text("abc") - equals to "() => text("abc").exists()" <br>
 *     -- Array - [obj(s), func(s), logic_flag] - a multi-condition array <br>
 *         -- logic_flag <br>
 *         --- "and"|"all"|*DEFAULT* - meet all conditions <br>
 *         --- "or"|"one" - meet any one condition
 * @param {number} [timeout_or_times=10000]
 * <br>
 *     -- *DEFAULT* - take as timeout (default: 10 sec) <br>
 *     -- less than 100 - take as times
 * @param {number} [interval=300]
 * @example
 * waitForAction([() => text("Settings").exists(), () => text("Exit").exists(), "or"], 500, 80); <br>
 * waitForAction([text("Settings"), text("Exit"), () => !text("abc").exists(), "and"], 2000, 50); <br>
 * let kw_settings = text("Settings");
 * let condition = () => kw_settings.exists();
 * // waitForAction(kw_settings, 1000);
 * // waitForAction(condition, 1000);
 * waitForAction(() => condition()), 1000);
 * @return {boolean} - if timed out
 */
function waitForAction(f, timeout_or_times, interval) {
    let _timeout = timeout_or_times || 10000;
    let _interval = interval || 300;
    let _times = _timeout < 100 ? _timeout : ~~(_timeout / _interval) + 1;

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

    while (!_checkF(f) && _times--) sleep(_interval);
    return _times >= 0;

    // tool function(s) //

    function _checkF(f) {
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
        toast_flag && toast(msg);
        msg_level && log(msg);
        msg_level >= 8 && exit();
    }
}

/**
 * @param {object|array} f - JavaObject or RectBounds or coordinates Array
 * <br>
 *     -- text("abc").desc("def") <br>
 *     -- text("abc").desc("def").findOnce()[.parent()] <br>
 *     -- text("abc").desc("def").findOnce()[.parent()].bounds() <br>
 *     -- [106, 39]
 * @param [strategy] - decide the way of clicking
 * <br>
 *     -- "click"|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- "press" - press(coord_A, coord_B, 1); <br>
 *     -- "widget" - text("abc").click(); - only available for examples 1 and 2 mentioned above
 * @param [params] {object|string}
 * @param [params.condition_success=() => true] {string|function}
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
        if (_waitForAction(() => _condition_success(), [_check_time_once, 50])) return true;
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

        _strategy === "press" ? press(_x, _y, 1) : click(_x, _y);
        return "???";
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
        toast_flag && toast(msg);
        msg_level && log(msg);
        msg_level >= 8 && exit();
    }

    function waitForActionRaw(cond_func, time_params) {
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 1000;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }
}


// raw function(s) //
