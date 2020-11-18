global.$$impeded = (name) => {
    let $_flag = global.$$flag || {};
    if ($_flag.glob_e_trig_counter) {
        if (name) {
            messageAction("检测到全局事件触发信号", 1, 0, 0, "up_dash");
            messageAction(name + "被迫阻塞", 1, 0, 0, "dash");
        }
        while ($_flag.glob_e_trig_counter) {
            sleep(200);
        }
        if (name) {
            messageAction("全局事件触发信号全部解除", 1, 0, 0, "up_dash");
            messageAction(name + "解除阻塞", 1, 0, 0, "dash");
        }
    }
};

let ext = {
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
    swipeAndShow: swipeAndShow,
    swipeAndShowAndClickAction: swipeAndShowAndClickAction,
    messageAction: messageAction,
    showSplitLine: showSplitLine,
    refreshObjects: refreshObjects,
    keycode: keycode,
    debugInfo: debugInfo,
    deepCloneObject: deepCloneObject,
    equalObjects: equalObjects,
    smoothScrollView: smoothScrollView,
    observeToastMessage: observeToastMessage,
    captureErrScreen: captureErrScreen,
    getSelector: getSelector,
    surroundWith: surroundWith,
    timeRecorder: timeRecorder,
    clickActionsPipeline: clickActionsPipeline,
    timedTaskTimeFlagConverter: timedTaskTimeFlagConverter,
    baiduOcr: baiduOcr,
    setIntervalBySetTimeout: setIntervalBySetTimeout,
    classof: classof,
    checkSdkAndAJVer: checkSdkAndAJVer,
    stabilizer: stabilizer,
};
module.exports = ext;
module.exports.load = function () {
    let _args = Array.isArray(arguments[0]) ? arguments[0] : arguments;
    if (_args.length) {
        [].forEach.call(_args, k => global[k] = ext[k]);
    } else {
        let _load_bak;
        if (typeof global.load !== "undefined") {
            _load_bak = global.load;
        }
        Object.assign(global, ext);
        if (typeof _load_bak !== "undefined") {
            global.load = _load_bak;
        } else {
            delete global.load;
        }
    }
};

// tool function(s) //

/**
 * Returns both app name and app package name with either one input
 * @global
 * @param name {string} - app name or app package name
 * @param {object} [params]
 * @param {boolean} [params.hard_refresh=false] - get app information from global cache by default
 * @example
 * parseAppName("Alipay");
 * parseAppName("com.eg.android.AlipayGphone");
 * @return {{app_name: string, package_name: string}}
 */
function parseAppName(name, params) {
    if (!name) {
        return {app_name: "", package_name: ""};
    }

    global["_$_app_name_cache"] = global["_$_app_name_cache"] || {};
    global["_$_app_pkg_name_cache"] = global["_$_app_pkg_name_cache"] || {};

    let _par = params || {};
    let _hr = _par.hard_refresh || false;
    let _checkCache = (cache) => !_hr && name in cache ? cache[name] : null;
    let _app_name = _checkCache(global["_$_app_name_cache"])
        || !name.match(/.+\..+\./) && app.getPackageName(name) && name;
    let _pkg_name = _checkCache(global["_$_app_pkg_name_cache"])
        || app.getAppName(name) && name;

    _app_name = _app_name || _pkg_name && app.getAppName(_pkg_name);
    _pkg_name = _pkg_name || _app_name && app.getPackageName(_app_name);

    return {
        app_name: global["_$_app_name_cache"][_pkg_name] = _app_name,
        package_name: global["_$_app_pkg_name_cache"][_app_name] = _pkg_name,
    };
}

/**
 * Returns a version name string of an app with either app name or app package name input
 * @global
 * @param name {"Auto.js"|"Auto.js Pro"|"Current Auto.js"|"Self"|string} - app name, app package name or some shortcuts
 * <br>
 *     -- %app name% - "Alipay" <br>
 *     -- %app package% - "com.eg.android.AlipayGphone" <br>
 *     -- "Auto.js" <br>
 *     -- "Auto.js Pro" <br>
 *     -- "Current Auto.js" - context.packageName <br>
 *     -- "Self" - currentPackage()
 * @param {object} [params]
 * @param {boolean} [params.debug_info_flag]
 * @example
 * // app name
 * getVerName("Alipay");
 * // shortcut
 * getVerName("Self");
 * // shortcut (also could be taken as app name)
 * getVerName("Auto.js");
 * // shortcut
 * getVerName("Auto.js Pro");
 * // app package name
 * getVerName("org.autojs.autojs");
 * // shortcut
 * getVerName("Current Auto.js");
 * @param name
 * @return {string}
 */
function getVerName(name, params) {
    let _par = params || {};

    let _parseAppName = (
        typeof parseAppName === "function" ? parseAppName : parseAppNameRaw
    );
    let _debugInfo = (m, fg) => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, fg, _par.debug_info_flag);

    let _name = _handleName(name);
    let _pkg_name = _parseAppName(_name).package_name;
    if (_pkg_name) {
        try {
            let _pkg_mgr = context.getPackageManager();
            let _installed_pkgs = _pkg_mgr.getInstalledPackages(0).toArray();
            for (let i in _installed_pkgs) {
                if (_installed_pkgs.hasOwnProperty(i)) {
                    let _pkg = _installed_pkgs[i].packageName.toString();
                    if (_pkg === _pkg_name.toString()) {
                        return _pkg;
                    }
                }
            }
        } catch (e) {
            _debugInfo(e);
        }
    }
    return "";

    // tool function(s) //

    function _handleName(name) {
        if (name.match(/^[Aa]uto\.?js/)) {
            return "org.autojs.autojs" + (name.match(/[Pp]ro$/) ? "pro" : "");
        }
        if (name.match(/^[Ss]elf$/)) {
            return currentPackage();
        }
        if (name.match(/^[Cc]urrent\s?[Aa]uto\.?js/)) {
            return context.packageName;
        }
        return name;
    }

    // raw function(s) //

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
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
 * Launch some app with package name or intent and wait for conditions ready if specified
 * @global
 * @param {object|string|function|android.content.Intent} trigger - the way of triggering the launcher
 * <br> {object} - activity object -- eg: {action:"VIEW",packageName:"...",className:"..."}
 * <br> {string} - app package name or app name -- eg: _com.eg.android.AlipayGphone" or "Alipay"
 * <br> {(function(): *)} - a function trigger which is callable
 * <br> {android.content.Intent} - an android Intent instance
 * @param {{}} [params] - additional options
 * @param {string} [params.package_name]
 * @param {string} [params.app_name]
 * @param {string} [params.task_name]
 * @param {(function(): *)} [params.condition_launch]
 * @param {(function(): *)|{}} [params.condition_ready]
 * @param {string} [params.condition_ready.necessary_sel_key] - necessary selector key with one condition only
 * @param {array} [params.condition_ready.necessary_sel_keys] - necessary selector keys with more than one condition
 * @param {string} [params.condition_ready.optional_sel_key] - optional selector key with one condition only
 * @param {array} [params.condition_ready.optional_sel_keys] - optional selector keys with more than one condition
 * @param {(function(): *)} [params.disturbance]
 * @param {boolean} [params.debug_info_flag]
 * @param {boolean} [params.first_time_run_message_flag=true]
 * @param {boolean} [params.no_message_flag]
 * @param {number} [params.global_retry_times=2]
 * @param {number} [params.launch_retry_times=3]
 * @param {number} [params.ready_retry_times=5]
 * @param {number} [params.screen_orientation] - if specific screen direction needed to run this app; portrait: 0, landscape: 1
 * @example
 * launchThisApp("com.eg.android.AlipayGphone");
 * launchThisApp("com.eg.android.AlipayGphone", {
 *    task_name: "\u652F\u4ED8\u5B9D\u6D4B\u8BD5",
 *    // first_time_run_message_flag: true,
 *    // no_message_flag: false,
 *    debug_info_flag: "forcible",
 * });
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
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === "function" && $$impeded(launchThisApp.name);

    let $_und = x => typeof x === "undefined";
    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _debugInfo = (m, fg) => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, fg, _par.debug_info_flag);
    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );
    let _killThisApp = (
        typeof killThisApp === "function" ? killThisApp : killThisAppRaw
    );

    let _trig = trigger || 0;
    if (!~["object", "string", "function"].indexOf(typeof _trig)) {
        _messageAction("应用启动目标参数无效", 8, 1, 0, 1);
    }

    let _pkg_name = "";
    let _app_name = "";
    let _task_name = _par.task_name || "";
    let _1st_launch = true;

    _setAppName();

    _pkg_name = _pkg_name || _par.package_name;
    _app_name = _app_name || _par.app_name;

    let _name = (_task_name || _app_name).replace(/^"+|"+$/g, "");

    _debugInfo("启动目标名称: " + _name);
    _debugInfo("启动参数类型: " + typeof _trig);

    let _cond_ready = _par.condition_ready;
    let _cond_launch = _par.condition_launch;
    let _dist = _par.disturbance;
    let _thd_dist;
    let _max_retry = _par.global_retry_times || 2;
    let _max_retry_b = _max_retry;
    let _fg_1st_run_msg = _par.first_time_run_message_flag;

    if (typeof _fg_1st_run_msg === "undefined") {
        _fg_1st_run_msg = true;
    }

    if (!_cond_launch) {
        _cond_launch = () => currentPackage() === _pkg_name;
    }

    if (_dist) {
        _debugInfo("已开启干扰排除线程");
        _thd_dist = threads.start(function () {
            while (sleep(1.2e3) || true) _dist();
        });
    }

    while (_max_retry--) {
        let _max_lch = _par.launch_retry_times || 3;
        let _max_lch_b = _max_lch;

        if (!_par.no_message_flag) {
            let _msg = _task_name
                ? '重新开始"' + _task_name + '"任务'
                : '重新启动"' + _app_name + '"应用';
            if (!_1st_launch) {
                _messageAction(_msg, null, 1);
            } else if (_fg_1st_run_msg) {
                _messageAction(_msg.replace(/重新/g, ""), 1, 1, 0, "both");
            }
        }

        while (_max_lch--) {
            if (typeof _trig === "object") {
                _debugInfo("加载intent参数启动应用");
                (global.appx ? appx : app).startActivity(_trig);
            } else if (typeof _trig === "string") {
                _debugInfo("加载应用包名参数启动应用");
                if (!app.launchPackage(_pkg_name)) {
                    _debugInfo("加载应用名称参数启动应用");
                    app.launchApp(_app_name);
                }
            } else {
                _debugInfo("使用触发器方法启动应用");
                _trig();
            }

            _waitForScrOrReady();

            let _succ = _waitForAction(_cond_launch, 5e3, 800);
            _debugInfo("应用启动" + (
                _succ ? "成功" : "超时 (" + (_max_lch_b - _max_lch) + "/" + _max_lch_b + ")"
            ));
            if (_succ) {
                break;
            }
            _debugInfo(">" + currentPackage());
        }

        if (_max_lch < 0) {
            _messageAction('打开"' + _app_name + '"失败', 8, 1, 0, 1);
        }

        if ($_und(_cond_ready)) {
            _debugInfo("未设置启动完成条件参数");
            break;
        }

        _1st_launch = false;
        _debugInfo("开始监测启动完成条件");

        let _max_ready = _par.ready_retry_times || 3;
        let _max_ready_b = _max_ready;

        while (!_waitForAction(_cond_ready, 8e3) && _max_ready--) {
            let _ctr = "(" + (_max_ready_b - _max_ready) + "/" + _max_ready_b + ")";
            if (typeof _trig === "object") {
                _debugInfo("重新启动Activity " + _ctr);
                (global.appx ? appx : app).startActivity(_trig);
            } else {
                _debugInfo("重新启动应用 " + _ctr);
                app.launchPackage(_trig);
            }
        }

        if (_max_ready >= 0) {
            _debugInfo("启动完成条件监测完毕");
            break;
        }

        _debugInfo('尝试关闭"' + _app_name + '"应用: ' +
            "(" + (_max_retry_b - _max_retry) + "/" + _max_retry_b + ")"
        );
        _killThisApp(_pkg_name);
    }

    if (_thd_dist) {
        _thd_dist.interrupt();
        _debugInfo("干扰排除线程结束");
        _thd_dist = null;
    }

    if (_max_retry < 0) {
        _messageAction('"' + _name + '"初始状态准备失败', 8, 1, 0, 1);
    }
    _debugInfo('"' + _name + '"初始状态准备完毕');

    return true;

    // tool function(s) //

    function _setAppName() {
        if (typeof _trig === "string") {
            _app_name = !_trig.match(/.+\..+\./) && app.getPackageName(_trig) && _trig;
            _pkg_name = app.getAppName(_trig) && _trig.toString();
        } else {
            _app_name = _par.app_name;
            _pkg_name = _par.package_name;
            if (!_pkg_name && typeof _trig === "object") {
                _pkg_name = _trig.packageName || _trig.data && _trig.data.match(/^alipays/i) && "com.eg.android.AlipayGphone";
            }
        }
        _app_name = _app_name || _pkg_name && app.getAppName(_pkg_name);
        _pkg_name = _pkg_name || _app_name && app.getPackageName(_app_name);
        if (!_app_name && !_pkg_name) {
            _messageAction("未找到应用", 4, 1);
            _messageAction(_trig, 8, 0, 1, 1);
        }
    }

    function _waitForScrOrReady() {
        let _isHoriz = () => {
            let _disp = getDisplayRaw();
            return _disp.WIDTH > _disp.HEIGHT;
        };
        let _isVert = () => {
            let _disp = getDisplayRaw();
            return _disp.WIDTH < _disp.HEIGHT;
        };
        let _scr_o_par = _par.screen_orientation;
        if (_scr_o_par === 1 && _isVert()) {
            _debugInfo("需等待屏幕方向为横屏");
            if (_waitForAction(_isHoriz, 8e3, 80)) {
                _debugInfo("屏幕方向已就绪");
                sleep(500);
            } else {
                _messageAction("等待屏幕方向变化超时", 4);
            }
        } else if (_scr_o_par === 0 && _isHoriz()) {
            _debugInfo("需等待屏幕方向为竖屏");
            if (_waitForAction(_isVert, 8e3, 80)) {
                _debugInfo("屏幕方向已就绪");
                sleep(500);
            } else {
                _messageAction("等待屏幕方向变化超时", 4);
            }
        }
    }

    // raw function(s) //

    function getDisplayRaw(params) {
        let $_flag = global.$$flag = global.$$flag || {};
        let _par = params || {};

        let _waitForAction = (
            typeof waitForAction === "function" ? waitForAction : waitForActionRaw
        );
        let _debugInfo = (m, fg) => (
            typeof debugInfo === "function" ? debugInfo : debugInfoRaw
        )(m, fg, _par.debug_info_flag);
        let $_str = x => typeof x === "string";

        let _W, _H;
        let _disp = {};
        let _win_svc = context.getSystemService(context.WINDOW_SERVICE);
        let _win_svc_disp = _win_svc.getDefaultDisplay();

        if (!_waitForAction(() => _disp = _getDisp(), 3e3, 500)) {
            return console.error("getDisplayRaw()返回结果异常");
        }
        _showDisp();
        return Object.assign(_disp, {
            cX: _cX,
            cY: _cY
        });

        // tool function(s) //

        function _cX(num) {
            let _unit = Math.abs(num) >= 1 ? _W / 720 : _W;
            let _x = Math.round(num * _unit);
            return Math.min(_x, _W);
        }

        function _cY(num, aspect_ratio) {
            let _ratio = aspect_ratio;
            if (!~_ratio) _ratio = "16:9"; // -1
            if ($_str(_ratio) && _ratio.match(/^\d+:\d+$/)) {
                let _split = _ratio.split(":");
                _ratio = _split[0] / _split[1];
            }
            _ratio = _ratio || _H / _W;
            _ratio = _ratio < 1 ? 1 / _ratio : _ratio;
            let _h = _W * _ratio;
            let _unit = Math.abs(num) >= 1 ? _h / 1280 : _h;
            let _y = Math.round(num * _unit);
            return Math.min(_y, _H);
        }

        function _showDisp() {
            if (!$_flag.display_params_got) {
                _debugInfo("屏幕宽高: " + _W + " × " + _H);
                _debugInfo("可用屏幕高度: " + _disp.USABLE_HEIGHT);
                $_flag.display_params_got = true;
            }
        }

        function _getDisp() {
            try {
                _W = _win_svc_disp.getWidth();
                _H = _win_svc_disp.getHeight();
                if (!(_W * _H)) {
                    return _raw();
                }

                // left: 1, right: 3, portrait: 0 (or 2 ?)
                let _SCR_O = _win_svc_disp.getOrientation();
                let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                let _MAX = _win_svc_disp.maximumSizeDimension;

                let [_UH, _UW] = [_H, _W];
                let _dimen = (name) => {
                    let resources = context.getResources();
                    let resource_id = resources.getIdentifier(name, "dimen", "android");
                    if (resource_id > 0) {
                        return resources.getDimensionPixelSize(resource_id);
                    }
                    return NaN;
                };

                _is_scr_port ? [_UH, _H] = [_H, _MAX] : [_UW, _W] = [_W, _MAX];

                return {
                    WIDTH: _W,
                    USABLE_WIDTH: _UW,
                    HEIGHT: _H,
                    USABLE_HEIGHT: _UH,
                    screen_orientation: _SCR_O,
                    status_bar_height: _dimen("status_bar_height"),
                    navigation_bar_height: _dimen("navigation_bar_height"),
                    navigation_bar_height_computed: _is_scr_port ? _H - _UH : _W - _UW,
                    action_bar_default_height: _dimen("action_bar_default_height"),
                };
            } catch (e) {
                return _raw();
            }

            // tool function(s) //

            function _raw() {
                _W = device.width;
                _H = device.height;
                return _W && _H && {
                    WIDTH: _W,
                    HEIGHT: _H,
                    USABLE_HEIGHT: Math.trunc(_H * 0.9),
                };
            }
        }

        // raw function(s) //

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }

        function debugInfoRaw(msg, msg_lv) {
            msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function killThisAppRaw(package_name) {
        package_name = package_name || currentPackage();
        if (!package_name.match(/.+\..+\./)) package_name = app.getPackageName(package_name) || package_name;
        if (!shell("am force-stop " + package_name, true).code) return _success(15e3);
        let _max_try_times = 10;
        while (_max_try_times--) {
            ~back() && back();
            if (_success(2.5e3)) break;
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
 * @global
 * @param name=currentPackage() {string}
 * <br>
 *     -- app name - like "Alipay" (not recommended, as long time may cost) <br>
 *     -- package_name - like "com.eg.android.AlipayGphone"
 * @param {object} [params]
 * @param {boolean} [params.shell_acceptable=true]
 * @param {number} [params.shell_max_wait_time=10e3]
 * @param {boolean} [params.keycode_back_acceptable=true]
 * @param {boolean} [params.keycode_back_twice=false]
 * @param {function} [params.condition_success=()=>currentPackage() !== app_package_name]
 * @param {boolean} [params.debug_info_flag]
 * @example
 * killThisApp("Alipay");
 * killThisApp("com.eg.android.AlipayGphone", {
 *    shell_acceptable: false,
 *    debug_info_flag: "forcible",
 * });
 *
 * @return {boolean}
 */
function killThisApp(name, params) {
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === "function" && $$impeded(killThisApp.name);

    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _debugInfo = (m, fg) => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, fg, _par.debug_info_flag);
    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );
    let _clickAction = (
        typeof clickAction === "function" ? clickAction : clickActionRaw
    );
    let _parseAppName = (
        typeof parseAppName === "function" ? parseAppName : parseAppNameRaw
    );

    let _name = name || "";
    if (!_name) {
        _name = currentPackage();
        _messageAction("自动使用currentPackage()返回值", 3);
        _messageAction("killThisApp()未指定name参数", 3, 0, 1);
        _messageAction("注意: 此返回值可能不准确", 3, 0, 1);
    }
    let _parsed_app_name = _parseAppName(_name);
    let _app_name = _parsed_app_name.app_name;
    let _pkg_name = _parsed_app_name.package_name;
    if (!(_app_name && _pkg_name)) {
        _messageAction("解析应用名称及包名失败", 8, 1, 0, 1);
    }

    let _shell_acceptable = (
        _par.shell_acceptable === undefined ? true : _par.shell_acceptable
    );
    let _keycode_back_acceptable = (
        _par.keycode_back_acceptable === undefined ? true : _par.keycode_back_acceptable
    );
    let _keycode_back_twice = _par.keycode_back_twice || false;
    let _cond_success = _par.condition_success || (() => {
        let _cond = () => currentPackage() === _pkg_name;
        return _waitForAction(() => !_cond(), 12e3) && !_waitForAction(_cond, 3, 150);
    });

    let _shell_result = false;
    let _shell_start_ts = Date.now();
    let _shell_max_wait_time = _par.shell_max_wait_time || 10e3;
    if (_shell_acceptable) {
        try {
            _shell_result = !shell("am force-stop " + _pkg_name, true).code;
        } catch (e) {
            _debugInfo('shell()方法强制关闭"' + _app_name + '"失败');
        }
    } else {
        _debugInfo("参数不接受shell()方法");
    }

    if (!_shell_result) {
        if (_keycode_back_acceptable) {
            return _tryMinimizeApp();
        }
        _debugInfo("参数不接受模拟返回方法");
        _messageAction('关闭"' + _app_name + '"失败', 4, 1);
        return _messageAction("无可用的应用关闭方式", 4, 0, 1);
    }

    let _et = Date.now() - _shell_start_ts;
    if (_waitForAction(_cond_success, _shell_max_wait_time)) {
        _debugInfo('shell()方法强制关闭"' + _app_name + '"成功');
        _debugInfo(">关闭用时: " + _et + "毫秒");
        return true;
    }
    _messageAction('关闭"' + _app_name + '"失败', 4, 1);
    _debugInfo(">关闭用时: " + _et + "毫秒");
    return _messageAction("关闭时间已达最大超时", 4, 0, 1);

    // tool function(s) //

    function _tryMinimizeApp() {
        _debugInfo("尝试最小化当前应用");

        let _sltr_avail_btns = [
            idMatches(/.*nav.back|.*back.button/),
            descMatches(/关闭|返回/),
            textMatches(/关闭|返回/),
        ];

        let _max_try_times_minimize = 20;
        let _max_try_times_minimize_bak = _max_try_times_minimize;
        let _back = () => {
            back();
            back();
            if (_keycode_back_twice) {
                sleep(200);
                back();
            }
        };

        while (_max_try_times_minimize--) {
            let _clicked_flag = false;
            for (let i = 0, l = _sltr_avail_btns.length; i < l; i += 1) {
                let _sltr_avail_btn = _sltr_avail_btns[i];
                if (_sltr_avail_btn.exists()) {
                    _clicked_flag = true;
                    _clickAction(_sltr_avail_btn);
                    sleep(300);
                    break;
                }
            }
            if (_clicked_flag) {
                continue;
            }
            _back();
            if (_waitForAction(_cond_success, 2e3)) {
                break;
            }
        }
        if (_max_try_times_minimize < 0) {
            _debugInfo("最小化应用尝试已达: " + _max_try_times_minimize_bak + "次");
            _debugInfo("重新仅模拟返回键尝试最小化");
            _max_try_times_minimize = 8;
            while (_max_try_times_minimize--) {
                _back();
                if (_waitForAction(_cond_success, 2e3)) {
                    break;
                }
            }
            if (_max_try_times_minimize < 0) {
                return _messageAction("最小化当前应用失败", 4, 1);
            }
        }
        _debugInfo("最小化应用成功");
        return true;
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function clickActionRaw(o) {
        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _o = _classof(o) === "Array" ? o[0] : o;
        let _w = _o.toString().match(/UiObject/) ? _o : _o.findOnce();
        if (!_w) {
            return false;
        }
        let _bnd = _w.bounds();
        return click(_bnd.centerX(), _bnd.centerY());
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
 * @global
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
 * @param {object} [params]
 * @param {boolean} [params.shell_acceptable=true] - for killing
 * @param {number} [params.shell_max_wait_time=10e3] - for killing
 * @param {boolean} [params.keycode_back_acceptable=true] - for killing
 * @param {boolean} [params.keycode_back_twice=false] - for killing
 * @param {function} [params.condition_success=()=>currentPackage() !== app_package_name] - for killing
 * @param {string} [params.package_name] - for launching
 * @param {string} [params.app_name] - for launching
 * @param {string} [params.task_name] - for launching
 * @param {function} [params.condition_launch] - for launching
 * @param {function} [params.condition_ready] - for launching
 * @param {function} [params.disturbance] - for launching
 * @param {boolean} [params.debug_info_flag]
 * @param {boolean} [params.first_time_run_message_flag=true] - for launching
 * @param {boolean} [params.no_message_flag] - for launching
 * @param {number} [params.global_retry_times=2] - for launching
 * @param {number} [params.launch_retry_times=3] - for launching
 * @param {number} [params.ready_retry_times=5] - for launching
 * @return {boolean}
 */
function restartThisApp(intent_or_name, params) {
    intent_or_name = intent_or_name || currentPackage();

    let _killThisApp = (
        typeof killThisApp === "function" ? killThisApp : killThisAppRaw
    );
    let _launchThisApp = (
        typeof launchThisApp === "function" ? launchThisApp : launchThisAppRaw
    );

    let _result = true;
    if (!_killThisApp(intent_or_name, params)) {
        _result = false;
    }
    if (!_launchThisApp(intent_or_name, params)) {
        _result = false;
    }
    return _result;

    // raw function(s) //

    function killThisAppRaw(package_name) {
        package_name = package_name || currentPackage();
        if (!package_name.match(/.+\..+\./)) package_name = app.getPackageName(package_name) || package_name;
        if (!shell("am force-stop " + package_name, true).code) return _success(15e3);
        let _max_try_times = 10;
        while (_max_try_times--) {
            ~back() && back();
            if (_success(2.5e3)) break;
        }
        return _max_try_times >= 0;

        function _success(max_wait_time) {
            while (currentPackage() === package_name && max_wait_time > 0) ~sleep(200) && (max_wait_time -= 200);
            return max_wait_time > 0;
        }
    }

    function launchThisAppRaw(intent_or_name) {
        typeof intent_or_name === "object" ? (global.appx ? appx : app).startActivity(intent_or_name) : launch(intent_or_name) || launchApp(intent_or_name);
        return true;
    }
}

/**
 * Run a new task in engine and forcibly stop the old one (restart)
 * @global
 * @param {object} [params]
 * @param {string} [params.new_file] - new engine task name with or without path or file extension name
 * <br>
 *     -- *DEFAULT* - old engine task <br>
 *     -- new file - like "hello.js", "../hello.js" or "hello"
 * @param {boolean|string} [params.debug_info_flag]
 * @param {number} [params.max_restart_engine_times=1] - max restart times for avoiding infinite recursion
 * @param {*} [params.instant_run_flag] - whether to perform an instant run or not
 * @example
 * restartThisEngine({
 *    debug_info_flag: true,
 *    max_restart_engine_times: 3,
 *    instant_run_flag: false,
 * });
 * @return {boolean}
 */
function restartThisEngine(params) {
    let _params = params || {};

    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _debugInfo = (m, fg) => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, fg, _params.debug_info_flag);

    let _my_e = engines.myEngine();
    let _my_e_id = _my_e.id;
    let _e_argv = _my_e.execArgv;

    let _restart_times_a = _e_argv.max_restart_engine_times;
    let _restart_times_p = _params.max_restart_engine_times;
    let _restart_times;
    if (typeof _restart_times_a === "undefined") {
        _restart_times = typeof _restart_times_p === "undefined" ? 1 : +_restart_times_p;
    } else {
        _restart_times = +_restart_times_a;
    }
    if (!_restart_times) {
        _messageAction("引擎重启已拒绝", 3);
        return !~_messageAction("引擎重启次数已超限", 3, 0, 1);
    }

    let _restart_times_bak = +_e_argv.max_restart_engine_times_backup || _restart_times;
    _debugInfo("重启当前引擎任务");
    _debugInfo(">当前次数: " + (_restart_times_bak - _restart_times + 1));
    _debugInfo(">最大次数: " + _restart_times_bak);
    let _file_name = _params.new_file || _my_e.source.toString();
    if (_file_name.match(/^\[remote]/)) {
        _messageAction("远程任务不支持重启引擎", 8, 1, 0, 1);
    }

    let _file_path = files.path(_file_name + (_file_name.match(/\.js$/) ? "" : ".js"));
    _debugInfo("运行新引擎任务:\n" + _file_path);
    engines.execScriptFile(_file_path, {
        arguments: Object.assign({}, _params, {
            max_restart_engine_times: _restart_times - 1,
            max_restart_engine_times_backup: _restart_times_bak,
            instant_run_flag: _params.instant_run_flag,
        }),
    });
    _debugInfo("强制停止旧引擎任务");
    // _my_engine.forceStop();
    engines.all().filter(e => e.id === _my_e_id).forEach(e => e.forceStop());
    return true;

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }
}

/**
 * Run a javascript file via activity by current running Auto.js
 * @global
 * @param file_name {string} - file name with or without path or file extension name
 * @param {object} [e_args] arguments params for engines - js file will run by startActivity without this param
 * @example
 * runJsFile("file");
 * runJsFile("../folder/time.js");
 * runJsFile("Ant_Forest_Launcher", {cmd: "get_current_account_name"});
 */
function runJsFile(file_name, e_args) {
    let _path = files.path(file_name.match(/\.js$/) ? file_name : (file_name + ".js"));
    if (e_args) {
        return engines.execScriptFile(_path, {arguments: e_args});
    }
    return (global.appx ? appx : app).startActivity({
        action: "VIEW",
        packageName: context.packageName,
        className: "org.autojs.autojs.external.open.RunIntentActivity",
        data: "file://" + _path,
    });
}

/**
 * Handle message - toast, console and actions
 * @global
 * @param {string} msg - message
 * @param {number|"verbose"|"v"|"log"|"l"|"info"|"i"|"warn"|"w"|"error"|"e"|"x"|"t"|"title"|string|null} [msg_level=1] - message level
 * <br>
 *      -- 0/v/verbose - console.verbose(msg) <br>
 *      -- 1/l/log (default) - console.log(msg) <br>
 *      -- 2/i/info - console.info(msg) <br>
 *      -- 3/w/warn - console.warn(msg) <br>
 *      -- 4/e/error - console.error(msg) <br>
 *      -- 8/x - console.error(msg), exit <br>
 *      -- 9/t - console.error(msg), show ex message, exit <br>
 *      -- t/title - msg becomes a title like "[ title ]" <br>
 *      -- null - do not show message in console
 *
 * @param {number} [if_toast=0] - if toast the message needed
 * @param {number} [if_arrow=0] - if an arrow before msg needed (not for toast)
 * <br>
 *     -- 1 - "-> I got you now" <br>
 *     -- 2 - "--> I got you now" <br>
 *     -- 3 - "---> I got you now"
 * @param {number|"both"|"both_dash"|"both_n"|"both_dash_n"|"dash"|"up"|"up_dash"|"2_dash"|string} [if_split_line=0] - if split line(s) needed
 * <br>
 *     -- 0 - nothing to show additionally <br>
 *     -- 1 - "------------" - hyphen line (length: 33) <br>
 *     -- 2 - two hyphen lines clamped between message <br>
 *     -- /dash/ - "- - - - - - " - dash line (length: 35) <br>
 *     -- /2_dash/ - two dash lines clamped between message <br>
 *     -- /up|-1/ - show a line before message <br>
 *     -- /both/ - show a line before and another one after message <br>
 *     -- /both_n/ - show a line before and another one after message, then print a blank new line
 * @param {object} [params] reserved
 * @example
 * messageAction("hello", 1);
 * messageAction("hello"); // same as above
 * messageAction("hello", 2);
 * messageAction("hello", 3, 1);
 * messageAction("hello", 4, 1);
 * messageAction("hello", 3, 1, 1);
 * messageAction("hello", 3, 1, 1, 1);
 * messageAction("hello", 3, 1, 1, -1);
 * messageAction("hello", 3, 1, 1, "up");
 * messageAction("hello", 3, 1, 1, "both");
 * messageAction("hello", 3, 1, 1, "dash");
 * messageAction("ERROR", 8, 1, 0, "both_n");
 * messageAction("ERROR", 9, 1, 2, "dash_n");
 * messageAction("only toast", null, 1);
 * @return {boolean} - whether message level is not warn and error
 **/
function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
    let $_flag = global.$$flag = global.$$flag || {};
    if ($_flag.no_msg_act_flag) {
        return !~[3, 4, "warn", "w", "error", "e"].indexOf(msg_level);
    }

    let _msg_lv = msg_level;
    if (typeof _msg_lv === "undefined") {
        _msg_lv = 1;
    }
    if (typeof _msg_lv !== "number" && typeof msg_level !== "string") {
        _msg_lv = -1;
    }

    let _msg = msg || "";
    if (_msg_lv.toString().match(/^t(itle)?$/)) {
        _msg = "[ " + msg + " ]";
        return messageAction.apply(null, [_msg, 1].concat([].slice.call(arguments, 2)));
    }

    if_toast && toast(_msg);

    let _if_arrow = if_arrow || false;
    let _if_spl_ln = if_split_line || false;
    _if_spl_ln = ~if_split_line ? _if_spl_ln === 2 ? "both" : _if_spl_ln : "up";
    let _spl_ln_style = "solid";
    let _saveLnStyle = () => $_flag.last_cnsl_spl_ln_type = _spl_ln_style;
    let _loadLnStyle = () => $_flag.last_cnsl_spl_ln_type;
    let _clearLnStyle = () => delete $_flag.last_cnsl_spl_ln_type;
    let _matchLnStyle = () => _loadLnStyle() === _spl_ln_style;
    let _showSplitLine = (
        typeof showSplitLine === "function" ? showSplitLine : showSplitLineRaw
    );

    if (typeof _if_spl_ln === "string") {
        if (_if_spl_ln.match(/dash/)) {
            _spl_ln_style = "dash";
        }
        if (_if_spl_ln.match(/both|up|^2/)) {
            if (!_matchLnStyle()) {
                _showSplitLine("", _spl_ln_style);
            }
            if (_if_spl_ln.match(/_n|n_/)) {
                _if_spl_ln = "\n";
            } else if (_if_spl_ln.match(/both|^2/)) {
                _if_spl_ln = 1;
            } else if (_if_spl_ln.match(/up/)) {
                _if_spl_ln = 0;
            }
        }
    }

    _clearLnStyle();

    if (_if_arrow) {
        _msg = "-".repeat(Math.min(_if_arrow, 10)) + "> " + _msg;
    }

    let _exit_flag = false;
    let _show_ex_msg_flag = false;

    switch (_msg_lv) {
        case 0:
        case "verbose":
        case "v":
            _msg_lv = 0;
            console.verbose(_msg);
            break;
        case 1:
        case "log":
        case "l":
            _msg_lv = 1;
            console.log(_msg);
            break;
        case 2:
        case "i":
        case "info":
            _msg_lv = 2;
            console.info(_msg);
            break;
        case 3:
        case "warn":
        case "w":
            _msg_lv = 3;
            console.warn(_msg);
            break;
        case 4:
        case "error":
        case "e":
            _msg_lv = 4;
            console.error(_msg);
            break;
        case 8:
        case "x":
            _msg_lv = 4;
            console.error(_msg);
            _exit_flag = true;
            break;
        case 9:
        case "t":
            _msg_lv = 4;
            console.error(_msg);
            _show_ex_msg_flag = true;
    }

    if (_if_spl_ln) {
        let _spl_ln_extra = "";
        if (typeof _if_spl_ln === "string") {
            if (_if_spl_ln.match(/dash/)) {
                _spl_ln_extra = _if_spl_ln.match(/_n|n_/) ? "\n" : ""
            } else {
                _spl_ln_extra = _if_spl_ln;
            }
        }
        if (!_spl_ln_extra.match(/\n/)) {
            _saveLnStyle();
        }
        _showSplitLine(_spl_ln_extra, _spl_ln_style);
    }

    if (_show_ex_msg_flag) {
        let _msg = "forcibly stopped";
        console.error(_msg);
        toast(_msg);
    }
    if (_exit_flag) {
        exit();
    }

    return !~[3, 4].indexOf(_msg_lv);

    // raw function(s) //

    function showSplitLineRaw(extra, style) {
        console.log((
            style === "dash" ? "- ".repeat(18).trim() : "-".repeat(33)
        ) + (extra || ""));
    }
}

/**
 * Show a split line in console (32 bytes)
 * @global
 * @param {string} [extra]
 * <br>
 *     -- "\n" - a new blank line after split line <br>
 *     -- *OTHER* - unusual use
 * @param {"solid"|"dash"|string} [style="solid"]
 * <br>
 *     -- "solid" - "---------..." - length: 33 <br>
 *     -- "dash" - "- - - - - ..." - length: 35
 * @example
 * showSplitLine();
 * showSplitLine("\n");
 * showSplitLine("", "dash");
 * @return {boolean} - always true
 */
function showSplitLine(extra, style) {
    console.log((
        style === "dash" ? "- ".repeat(18).trim() : "-".repeat(33)
    ) + (extra || ""));
}

/**
 * @typedef {";all"|";and"|";one"|";or"} waitForAction$condition$logic_flag
 */
/**
 * Wait a period of time until "condition" is met
 * @global
 * @param condition {
 *     UiSelector$|UiObject$|string|RegExp|AdditionalSelector|function|(
 *         UiSelector$|UiObject$|string|RegExp|AdditionalSelector|function|
 *         waitForAction$condition$logic_flag
 *     )[]
 * } - if condition is not true then waiting
 * @param {number} [timeout_or_times=10e3] - if < 100, takes as times
 * @param {number} [interval=200]
 * @param {object} [options]
 * @param {boolean} [options.no_impeded=false]
 * @example
 * log(waitForAction("文件"));
 * log(waitForAction("文件", 10e3));
 * log(waitForAction("文件", 10e3, 200));
 * @example
 * log(waitForAction("文件"));
 * log(waitForAction(text("文件")));
 * log(waitForAction(() => text("文件").exists()));
 * @example
 * if (waitForAction(() => Date.now() > new Date(2021, 0), 0, 100)) {
 *     toastLog("Welcome to 2021");
 * }
 * @example
 * log(waitForAction([() => text("Settings").exists(), () => text("Exit").exists(), ";or"], 5e3, 80));
 * log(waitForAction([text("Settings"), text("Exit"), ";or"], 5e3, 80)); // same as above
 * log(waitForAction(["Settings", "Exit", ";or"], 5e3, 80)); // same as above
 * // do not invoke like the way as below, unless you know what this exactly means
 * log(waitForAction([text("Settings").findOnce(), text("Exit").findOnce(), ";or"], 5e3, 80));
 * @return {boolean} - whether "condition" is met before timed out or not
 */
function waitForAction(condition, timeout_or_times, interval, options) {
    let _par = options || {};
    _par.no_impeded || typeof $$impeded === "function" && $$impeded(waitForAction.name);

    let $_sel = (typeof getSelector === "function" ? getSelector : getSelectorRaw)();

    if (typeof timeout_or_times !== "number") {
        timeout_or_times = Number(timeout_or_times) || 10e3;
    }

    let _times = timeout_or_times;
    if (_times <= 0 || !isFinite(_times) || isNaN(_times) || _times > 100) {
        _times = Infinity;
    }

    let _timeout = Infinity;
    if (timeout_or_times > 100) {
        _timeout = timeout_or_times;
    }

    let _itv = interval || 200;
    if (_itv >= _timeout) {
        _times = 1;
    }

    let _start_ts = Date.now();
    while (!_check(condition) && --_times) {
        if (Date.now() - _start_ts > _timeout) {
            return false; // timed out
        }
        sleep(_itv);
    }
    return _times > 0;

    // tool function(s) //

    function _check(condition) {
        if (typeof condition === "function") {
            return condition();
        }
        if (!Array.isArray(condition)) {
            return $_sel.pickup(condition);
        }
        if (condition === undefined || condition === null) {
            return false;
        }

        let _rexA = s => typeof s === "string" && s.match(/^;(a(ll|nd))$/);
        let _rexO = s => typeof s === "string" && s.match(/^;(o(r|ne))$/);

        let _arr = condition.slice();

        let _logic = ";all";
        let _last = _arr[_arr.length - 1];
        if (_rexA(_last) || _rexO(_last)) {
            _logic = _arr.pop();
        }

        for (let i = 0, l = _arr.length; i < l; i += 1) {
            if (_rexA(_logic) && !_check(_arr[i])) {
                return false;
            }
            if (_rexO(_logic) && _check(_arr[i])) {
                return true;
            }
        }

        return _rexA(_logic);
    }

    // raw function(s) //

    function getSelectorRaw() {
        let _sel = selector();
        _sel.__proto__ = {
            pickup(sel_body, res_type) {
                if (sel_body === undefined || sel_body === null) {
                    return null;
                }
                if (!(res_type === undefined || res_type === "w" || res_type === "widget")) {
                    throw Error("getSelectorRaw()返回对象的pickup方法不支持结果筛选类型");
                }
                if (arguments.length > 2) {
                    throw Error("getSelectorRaw()返回对象的pickup方法不支持复杂参数传入");
                }
                if (typeof sel_body === "string") {
                    return desc(sel_body).findOnce() || text(sel_body).findOnce();
                }
                if (sel_body instanceof RegExp) {
                    return descMatches(sel_body).findOnce() || textMatches(sel_body).findOnce();
                }
                if (sel_body instanceof com.stardust.automator.UiObject) {
                    return sel_body;
                }
                if (sel_body instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                    return sel_body.findOnce();
                }
                throw Error("getSelectorRaw()返回对象的pickup方法不支持当前传入的选择体");
            },
        };
        return _sel;
    }
}

/**
 * Click UiObject or coordinate by click(), press() or UiObject.click().
 * Accessibility service is needed.
 * @global
 * @param {UiSelector$|UiObject$|number[]|AndroidRect$|{x:number,y:number}|OpencvPoint$} o
 * @param {"c"|"click"|"p"|"press"|"w"|"widget"} [strategy="click"] - decide the way of click
 * @param {object|string} [options]
 * @param {number} [options.press_time=1] - only effective for "press" strategy
 * @param {number} [options.pt$=1] - alias of press_time
 * @param {"disappear"|"disappear_in_place"|function():boolean|null} [options.condition_success=function():true]
 * @param {number} [options.check_time_once=500]
 * @param {number} [options.max_check_times=0] - if condition_success is specified, default will be 3
 * @param {number|number[]|("x"|"y"|number)[]} [options.padding] - eg: ["x",-10]|[-10,0]; ["y",69]|[0,69]|[69]|69
 * @example
 * text("Settings").find().forEach(w => clickAction(w));
 * text("Settings").find().forEach(w => clickAction(w.bounds()));
 * clickAction(text("Settings"), "widget", {
 *     condition_success: "disappear_in_place",
 *     max_check_times: 5,
 * });
 * clickAction(text("Settings"), "press", {
 *     // padding: ["x", +15],
 *     // padding: ["y", -7],
 *     // padding: [+15, -7],
 *     padding: -7,
 * });
 * @return {boolean}
 */
function clickAction(o, strategy, options) {
    let _opt = options || {};
    _opt.no_impeded || typeof $$impeded === "function" && $$impeded(clickAction.name);

    if (o === undefined || o === null) {
        return false;
    }

    let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
    let $_str = o => typeof o === "string";
    let $_num = o => typeof o === "number";
    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _waitForAction = (
        typeof messageAction === "function" ? waitForAction : waitForActionRaw
    );
    let _showSplitLine = (
        typeof showSplitLine === "function" ? showSplitLine : showSplitLineRaw
    );

    /**
     * @type {"Bounds"|"UiObject"|"UiSelector"|"CoordsArray"|"ObjXY"|"Points"}
     */
    let _type = _checkType(o);
    let _padding = _parsePadding(_opt.padding);
    let _stg = strategy || "click";
    let _widget_id = 0;
    let _widget_parent_id = 0;

    let _cond_succ = _opt.condition_success;

    let _chk_t_once = _opt.check_time_once || 500;
    let _max_chk_cnt = _opt.max_check_times || 0;
    if (!_max_chk_cnt && _cond_succ) {
        _max_chk_cnt = 3;
    }

    if (_cond_succ === undefined || _cond_succ === null) {
        _cond_succ = () => true;
    } else if ($_str(_cond_succ) && _cond_succ.match(/disappear/)) {
        _cond_succ = () => _type.match(/^Ui/) ? _checkDisappearance() : true;
    }

    while (~_clickOnce() && _max_chk_cnt--) {
        if (_waitForAction(_cond_succ, _chk_t_once, 50)) {
            return true;
        }
    }

    return _cond_succ();

    // tool function(s) //

    function _clickOnce() {
        let _x = 0 / 0;
        let _y = 0 / 0;

        if (_type === "UiSelector") {
            let _w = o.findOnce();
            if (!_w) {
                return;
            }
            try {
                _widget_id = _w.toString().match(/@\w+/)[0].slice(1);
            } catch (e) {
                _widget_id = 0;
            }
            if (_stg.match(/^w(idget)?$/) && _w.clickable() === true) {
                return _w.click();
            }
            let _bnd = _w.bounds();
            _x = _bnd.centerX();
            _y = _bnd.centerY();
        } else if (_type === "UiObject") {
            try {
                _widget_parent_id = o.parent().toString().match(/@\w+/)[0].slice(1);
            } catch (e) {
                _widget_parent_id = 0;
            }
            if (_stg.match(/^w(idget)?$/) && o.clickable() === true) {
                return o.click();
            }
            let _bnd = o.bounds();
            _x = _bnd.centerX();
            _y = _bnd.centerY();
        } else if (_type === "Bounds") {
            if (_stg.match(/^w(idget)?$/)) {
                _stg = "click";
                _messageAction("clickAction()控件策略已改为click", 3);
                _messageAction("无法对Rect对象应用widget策略", 3, 0, 1);
            }
            _x = o.centerX();
            _y = o.centerY();
        } else {
            if (_stg.match(/^w(idget)?$/)) {
                _stg = "click";
                _messageAction("clickAction()控件策略已改为click", 3);
                _messageAction("无法对坐标组应用widget策略", 3, 0, 1);
            }
            [_x, _y] = Array.isArray(o) ? o : [o.x, o.y];
        }
        if (isNaN(_x) || isNaN(_y)) {
            _messageAction("clickAction()内部坐标值无效", 4, 1);
            _messageAction("(" + _x + ", " + _y + ")", 8, 0, 1, 1);
        }
        _x += _padding.x;
        _y += _padding.y;

        _stg.match(/^p(ress)?$/)
            ? press(_x, _y, _opt.press_time || _opt.pt$ || 1)
            : click(_x, _y);
    }

    function _checkType(f) {
        let _type_f = _chkJavaO(f) || _chkCoords(f) || _chkObjXY(f);
        if (!_type_f) {
            _showSplitLine();
            _messageAction("不支持的clickAction()的目标参数", 4, 1);
            _messageAction("参数类型: " + typeof f, 4, 0, 1);
            _messageAction("参数类值: " + _classof(f), 4, 0, 1);
            _messageAction("参数字串: " + f.toString(), 4, 0, 1);
            _showSplitLine();
            exit();
        }
        return _type_f;

        // tool function(s) //

        function _chkJavaO(o) {
            if (_classof(o) !== "JavaObject") {
                return;
            }
            if (o.getClass().getName().match(/Point$/)) {
                return "Points";
            }
            let string = o.toString();
            if (string.match(/^Rect\(/)) {
                return "Bounds";
            }
            if (string.match(/UiObject/)) {
                return "UiObject";
            }
            return "UiSelector";
        }

        function _chkCoords(arr) {
            if (_classof(f) !== "Array") {
                return;
            }
            if (arr.length !== 2) {
                _messageAction("clickAction()坐标参数非预期值: 2", 8, 1, 0, 1);
            }
            if (typeof arr[0] !== "number" || typeof arr[1] !== "number") {
                _messageAction("clickAction()坐标参数非number", 8, 1, 0, 1);
            }
            return "CoordsArray";
        }

        function _chkObjXY(o) {
            if (_classof(o) === "Object") {
                if ($_num(o.x) && $_num(o.y)) {
                    return "ObjXY";
                }
            }
        }
    }

    function _parsePadding(arr) {
        if (!arr) {
            return {x: 0, y: 0};
        }

        let _coords = [];
        if (typeof arr === "number") {
            _coords = [0, arr];
        } else if (!Array.isArray(arr)) {
            return _messageAction("clickAction()坐标偏移参数类型未知", 8, 1, 0, 1);
        }

        let _arr_len = arr.length;
        if (_arr_len === 1) {
            _coords = [0, arr[0]];
        } else if (_arr_len === 2) {
            let [_ele, _val] = arr;
            if (_ele === "x") {
                _coords = [_val, 0];
            } else if (_ele === "y") {
                _coords = [0, _val];
            } else {
                _coords = [_ele, _val];
            }
        } else {
            return _messageAction("clickAction()坐标偏移参数数组个数不合法", 8, 1, 0, 1);
        }

        let [_x, _y] = _coords.map(n => Number(n));
        if (!isNaN(_x) && !isNaN(_y)) {
            return {x: _x, y: _y};
        }
        _messageAction("clickAction()坐标偏移计算值不合法", 8, 1, 0, 1);
    }

    function _checkDisappearance() {
        try {
            if (_type === "UiSelector") {
                let _w = o.findOnce();
                if (!_w) {
                    return true;
                }
                if (!_opt.condition_success.match(/in.?place/)) {
                    return !_w;
                }
                let _mch = _w.toString().match(/@\w+/);
                return _mch[0].slice(1) !== _widget_id;
            }
            if (_type === "UiObject") {
                let _w_parent = o.parent();
                if (!_w_parent) {
                    return true;
                }
                let _mch = _w_parent.toString().match(/@\w+/);
                return _mch[0].slice(1) !== _widget_parent_id;
            }
        } catch (e) {
        }
        return true;
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function showSplitLineRaw(extra, style) {
        console.log((
            style === "dash" ? "- ".repeat(18).trim() : "-".repeat(33)
        ) + (extra || ""));
    }
}

/**
 * Wait for an UiObject showing up and click it
 * -- This is a combination function which means independent use is not recommended
 * @global
 * @param f {object} - only JavaObject is supported
 * @param {number} [timeout_or_times=10e3]
 * <br>
 *     -- *DEFAULT* - take as timeout (default: 10 sec) <br>
 *     -- less than 100 - take as times
 * @param {number} [interval=300]
 * @param {object} [click_params]
 * @param {number} [click_params.intermission=200]
 * @param {string} [click_params.click_strategy] - decide the way of click
 * <br>
 *     -- "click"|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- "press" - press(coord_A, coord_B, 1); <br>
 *     -- "widget" - text("abc").click();
 * @param {string|function} [click_params.condition_success=()=>true]
 * <br>
 *     -- *DEFAULT* - () => true <br>
 *     -- /disappear(ed)?/ - (f) => !f.exists(); - disappeared from the whole screen <br>
 *     -- /disappear(ed)?.*in.?place/ - (f) => #some widget info changed#; - disappeared in place <br>
 *     -- func - (f) => func(f);
 * @param {number} [click_params.check_time_once=500]
 * @param {number} [click_params.max_check_times=0]
 * <br>
 *     -- if condition_success is specified, then default value of max_check_times will be 3 <br>
 *     --- example: (this is not usage) <br>
 *     -- while (!waitForAction(condition_success, check_time_once) && max_check_times--) ; <br>
 *     -- return max_check_times >= 0;
 * @param {number|array} [click_params.padding]
 * <br>
 *     -- ["x", -10]|[-10, 0] - x=x-10; <br>
 *     -- ["y", 69]|[0, 69]|[69]|69 - y=y+69;
 * @return {boolean} - waitForAction(...) && clickAction(...)
 */
function waitForAndClickAction(f, timeout_or_times, interval, click_params) {
    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );
    let _clickAction = (
        typeof clickAction === "function" ? clickAction : clickActionRaw
    );

    if (Object.prototype.toString.call(f).slice(8, -1) !== "JavaObject") {
        _messageAction("waitForAndClickAction不支持非JavaObject参数", 8, 1);
    }
    let _par = click_params || {};
    let _intermission = _par.intermission || 200;
    let _strategy = _par.click_strategy;
    if (_waitForAction(f, timeout_or_times, interval)) {
        sleep(_intermission);
        return _clickAction(f, _strategy, _par);
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function clickActionRaw(o) {
        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _o = _classof(o) === "Array" ? o[0] : o;
        let _w = _o.toString().match(/UiObject/) ? _o : _o.findOnce();
        if (!_w) {
            return false;
        }
        let _bnd = _w.bounds();
        return click(_bnd.centerX(), _bnd.centerY());
    }
}

/**
 * Refresh screen objects or current package by a certain strategy
 * @global
 * @param {string} [strategy]
 * <br>
 *     -- "object[s]"|"alert" - alert() + text(%ok%).click() - may refresh objects only
 *     -- "page"|"recent[s]"|*DEFAULT*|*OTHER* - recents() + back() - may refresh currentPackage() <br>
 * @param {object} [params]
 * @param {string} [params.custom_alert_text="Alert for refreshing objects"]
 * @param {string} [params.current_package=currentPackage()]
 * @param {boolean} [params.debug_info_flag]
 */
function refreshObjects(strategy, params) {
    let _params = params || {};
    let _stg = strategy || "";

    let _debugInfo = (m, fg) => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, fg, _params.debug_info_flag);
    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );

    if (_stg.match(/objects?|alert/)) {
        descMatches(/.*/).exists(); // useful or useless ?

        let alert_text = _params.custom_alert_text || "Alert for refreshing objects";
        let sltr_alert_text = text(alert_text);
        let refreshing_obj_thread = threads.start(function () {
            sltr_alert_text.findOne(1e3);
            let sltr_ok_btn = textMatches(/OK|确./); // may 确认 or something else
            sltr_ok_btn.findOne(2e3).click();
        });
        let shutdownThread = () => {
            refreshing_obj_thread.isAlive() && refreshing_obj_thread.interrupt();
            if (sltr_alert_text.exists()) back();
        };
        let thread_alert = threads.start(function () {
            alert(alert_text);
            shutdownThread();
        });
        thread_alert.join(1e3);
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
        _waitForAction(() => currentPackage() !== _current_package, 2e3, 500) && sleep(500);
        _debugInfo(currentPackage());
        back();
        if (!_waitForAction(() => currentPackage() === _current_package, 2e3, 80)) {
            app.launchPackage(_current_package);
            _waitForAction(() => currentPackage() === _current_package, 2e3, 80);
        }
        _debugInfo(currentPackage());
    }

    // raw function(s) //

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }
}

/**
 * Swipe to make a certain specified area, usually fullscreen, contains or overlap the bounds of "f"
 * @global
 * @param {UiSelector$|ImageWrapper$} f
 * @param {object} [params]
 * @param {number} [params.max_swipe_times=12]
 * @param {number|string} [params.swipe_direction="auto"]
 * <br>
 *     -- 0|"l"|"left", 1|"u"|"up", 2|"r"|"right", 3|"d"|"down" - direction to swipe each time <br>
 *     -- "auto" - if "f" exists but not in aim area, direction will be auto-set decided by position of "f", or direction will be "up"
 * @param {number} [params.swipe_time=150] - the time spent for each swiping - set bigger as needed
 * @param {number} [params.swipe_interval=300] - the time spent between every swiping - set bigger as needed
 * @param {number[]} [params.swipe_area=[0.1, 0.1, 0.9, 0.9]] - swipe from a center-point to another
 * @param {number[]} [params.aim_area=[0, 0, -1, -1]] - restrict for smaller aim area
 * <br>
 *     -- area params - x|0<=x<1: x * (height|width), -1: full-height or full-width, -2: set with default value <br>
 *     -- [%left%, %top%, %right%, %bottom%] <br>
 *     -- [1, 50, 700, 1180] - [1, 50, 700, 1180] <br>
 *     -- [1, 50, 700, -1] - [1, 50, 700, device.height] <br>
 *     -- [0.1, 0.2, -1, -1] - [0.1 * device.width, 0.2 * device.height, device.width, device.height]
 * @param {number=1|2} [params.condition_meet_sides=1]
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
function swipeAndShow(f, params) {
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === "function" && $$impeded(swipeAndShow.name);

    let _swp_itv = _par.swipe_interval || 150;
    let _swp_max = _par.max_swipe_times || 12;
    let _swp_time = _par.swipe_time || 150;
    let _cond_meet_sides = parseInt(_par.condition_meet_sides);
    if (_cond_meet_sides !== 1 || _cond_meet_sides !== 2) {
        _cond_meet_sides = 1;
    }

    if (!global.WIDTH || !global.HEIGHT) {
        let _data = getDisplayRaw();
        [global.WIDTH, global.HEIGHT] = [_data.WIDTH, _data.HEIGHT];
    }

    let _swp_area = _setAreaParams(_par.swipe_area, [0.1, 0.1, 0.9, 0.9]);
    let _aim_area = _setAreaParams(_par.aim_area, [0, 0, -1, -1]);
    let _swp_drxn = _setSwipeDirection();
    let _ret = true;

    if (!_swp_drxn || _success()) {
        return _ret;
    }
    while (_swp_max--) {
        if (_swipeAndCheck()) {
            break;
        }
    }
    if (_swp_max >= 0) {
        return _ret;
    }

    // tool function(s) //

    function _isImageType(o) {
        return o instanceof com.stardust.autojs.core.image.ImageWrapper;
    }

    function _setSwipeDirection() {
        let _swp_drxn = _par.swipe_direction;
        if (typeof _swp_drxn === "string" && _swp_drxn !== "auto") {
            if (_swp_drxn.match(/$[Lf](eft)?^/)) {
                return "left";
            }
            if (_swp_drxn.match(/$[Rr](ight)?^/)) {
                return "right";
            }
            if (_swp_drxn.match(/$[Dd](own)?^/)) {
                return "down";
            }
            return "up";
        }
        if (_isImageType(f)) {
            return "up";
        }
        let _widget = f.findOnce();
        if (!_widget) {
            return "up";
        }
        // auto mode
        let _bnd = _widget.bounds();
        let [_bl, _bt] = [_bnd.left, _bnd.top];
        let [_br, _bb] = [_bnd.right, _bnd.bottom];
        if (_bb >= _aim_area.b || _bt >= _aim_area.b) {
            return "up";
        }
        if (_bt <= _aim_area.t || _bb <= _aim_area.t) {
            return "down";
        }
        if (_br >= _aim_area.r || _bl >= _aim_area.r) {
            return "left";
        }
        if (_bl <= _aim_area.l || _br <= _aim_area.l) {
            return "right";
        }
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
        sleep(_swp_itv);
        if (_success()) {
            return true;
        }

        // tool function(s) //

        function _swipe() {
            let {cl, cr, ct, cb} = _swp_area;
            let [_cl, _cr, _ct, _cb] = [cl, cr, ct, cb];
            if (_swp_drxn === "down") {
                return swipe(_ct.x, _ct.y, _cb.x, _cb.y, _swp_time);
            }
            if (_swp_drxn === "left") {
                return swipe(_cr.x, _cr.y, _cl.x, _cl.y, _swp_time);
            }
            if (_swp_drxn === "right") {
                return swipe(_cl.x, _cl.y, _cr.x, _cr.y, _swp_time);
            }
            return swipe(_cb.x, _cb.y, _ct.x, _ct.y, _swp_time);
        }
    }

    function _success() {
        return _isImageType(f) ? _chk_img() : _chk_widget();

        // tool function(s) //

        function _chk_widget() {
            let _max = 5;
            let _widget;
            while (_max--) {
                if ((_widget = f.findOnce())) {
                    break;
                }
            }
            if (!_widget) {
                return;
            }
            let _bnd = _widget.bounds();
            if (_bnd.height() <= 0 || _bnd.width() <= 0) {
                return;
            }
            let [_left, _top] = [_bnd.left, _bnd.top];
            let [_right, _bottom] = [_bnd.right, _bnd.bottom];
            if (_cond_meet_sides < 2) {
                if (_swp_drxn === "up") {
                    return _top < _aim_area.b;
                }
                if (_swp_drxn === "down") {
                    return _bottom > _aim_area.t;
                }
                if (_swp_drxn === "left") {
                    return _left < _aim_area.r;
                }
                if (_swp_drxn === "right") {
                    return _right < _aim_area.l;
                }
            } else {
                if (_swp_drxn === "up") {
                    return _bottom < _aim_area.b;
                }
                if (_swp_drxn === "down") {
                    return _top > _aim_area.t;
                }
                if (_swp_drxn === "left") {
                    return _right < _aim_area.r;
                }
                if (_swp_drxn === "right") {
                    return _left < _aim_area.l;
                }
            }
        }

        function _chk_img() {
            if (typeof imagesx === "object") {
                imagesx.permit();
            } else if (!global._$_request_screen_capture) {
                images.requestScreenCapture();
                global._$_request_screen_capture = true;
            }

            let _mch = images.findImage(images.captureScreen(), f);
            if (_mch) {
                return _ret = [_mch.x + f.width / 2, _mch.y + f.height / 2];
            }
        }
    }

    // raw function(s) //

    function getDisplayRaw(params) {
        let $_flag = global.$$flag = global.$$flag || {};

        let _par = params || {};
        let _waitForAction = (
            typeof waitForAction === "function" ? waitForAction : waitForActionRaw
        );
        let _debugInfo = (m, fg) => (
            typeof debugInfo === "function" ? debugInfo : debugInfoRaw
        )(m, fg, _par.debug_info_flag);
        let $_str = x => typeof x === "string";

        let _W, _H;
        let _disp = {};
        let _win_svc = context.getSystemService(context.WINDOW_SERVICE);
        let _win_svc_disp = _win_svc.getDefaultDisplay();

        if (!_waitForAction(() => _disp = _getDisp(), 3e3, 500)) {
            return console.error("getDisplayRaw()返回结果异常");
        }
        _showDisp();
        return Object.assign(_disp, {
            cX: _cX,
            cY: _cY
        });

        // tool function(s) //

        function _cX(num) {
            let _unit = Math.abs(num) >= 1 ? _W / 720 : _W;
            let _x = Math.round(num * _unit);
            return Math.min(_x, _W);
        }

        function _cY(num, aspect_ratio) {
            let _ratio = aspect_ratio;
            if (!~_ratio) _ratio = "16:9"; // -1
            if ($_str(_ratio) && _ratio.match(/^\d+:\d+$/)) {
                let _split = _ratio.split(":");
                _ratio = _split[0] / _split[1];
            }
            _ratio = _ratio || _H / _W;
            _ratio = _ratio < 1 ? 1 / _ratio : _ratio;
            let _h = _W * _ratio;
            let _unit = Math.abs(num) >= 1 ? _h / 1280 : _h;
            let _y = Math.round(num * _unit);
            return Math.min(_y, _H);
        }

        function _showDisp() {
            if (!$_flag.display_params_got) {
                _debugInfo("屏幕宽高: " + _W + " × " + _H);
                _debugInfo("可用屏幕高度: " + _disp.USABLE_HEIGHT);
                $_flag.display_params_got = true;
            }
        }

        function _getDisp() {
            try {
                _W = _win_svc_disp.getWidth();
                _H = _win_svc_disp.getHeight();
                if (!(_W * _H)) {
                    return _raw();
                }

                // left: 1, right: 3, portrait: 0 (or 2 ?)
                let _SCR_O = _win_svc_disp.getOrientation();
                let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                let _MAX = _win_svc_disp.maximumSizeDimension;

                let [_UH, _UW] = [_H, _W];
                let _dimen = (name) => {
                    let resources = context.getResources();
                    let resource_id = resources.getIdentifier(name, "dimen", "android");
                    if (resource_id > 0) {
                        return resources.getDimensionPixelSize(resource_id);
                    }
                    return NaN;
                };

                _is_scr_port ? [_UH, _H] = [_H, _MAX] : [_UW, _W] = [_W, _MAX];

                return {
                    WIDTH: _W,
                    USABLE_WIDTH: _UW,
                    HEIGHT: _H,
                    USABLE_HEIGHT: _UH,
                    screen_orientation: _SCR_O,
                    status_bar_height: _dimen("status_bar_height"),
                    navigation_bar_height: _dimen("navigation_bar_height"),
                    navigation_bar_height_computed: _is_scr_port ? _H - _UH : _W - _UW,
                    action_bar_default_height: _dimen("action_bar_default_height"),
                };
            } catch (e) {
                return _raw();
            }

            // tool function(s) //

            function _raw() {
                _W = device.width;
                _H = device.height;
                return _W && _H && {
                    WIDTH: _W,
                    HEIGHT: _H,
                    USABLE_HEIGHT: Math.trunc(_H * 0.9),
                };
            }
        }

        // raw function(s) //

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }

        function debugInfoRaw(msg, msg_lv) {
            msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }
}

/**
 * Swipe to make a certain specified area, then click it
 * @global
 * -- This is a combination function which means independent use is not recommended
 * @param f {object} - JavaObject
 * @param {object} [swipe_params]
 * @param {number} [swipe_params.max_swipe_times=12]
 * @param {number|string} [swipe_params.swipe_direction="auto"]
 * <br>
 *     -- 0|"l"|"left", 1|"u"|"up", 2|"r"|"right", 3|"d"|"down" - direction to swipe each time <br>
 *     -- "auto" - if "f" exists but not in aim area, direction will be auto-set decided by position of "f", or direction will be "up"
 * @param {number} [swipe_params.swipe_time=150] - the time spent for each swiping - set bigger as needed
 * @param {number} [swipe_params.swipe_interval=300] - the time spent between every swiping - set bigger as needed
 * @param {number[]} [swipe_params.swipe_area=[0.1, 0.1, 0.9, 0.9]] - swipe from a center-point to another
 * @param {number[]} [swipe_params.aim_area=[0, 0, -1, -1]] - restrict for smaller aim area
 * <br>
 *     -- area params - x|0<=x<1: x * (height|width), -1: full-height or full-width, -2: set with default value <br>
 *     -- [%left%, %top%, %right%, %bottom%] <br>
 *     -- [1, 50, 700, 1180] - [1, 50, 700, 1180] <br>
 *     -- [1, 50, 700, -1] - [1, 50, 700, device.height] <br>
 *     -- [0.1, 0.2, -1, -1] - [0.1 * device.width, 0.2 * device.height, device.width, device.height]
 * @param {number=1|2} [swipe_params.condition_meet_sides=1]
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
 * @param {object} [click_params]
 * @param {number} [click_params.intermission=300]
 * @param {string} [click_params.click_strategy] - decide the way of click
 * <br>
 *     -- "click"|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- "press" - press(coord_A, coord_B, 1); <br>
 *     -- "widget" - text("abc").click();
 * @param {string|function} [click_params.condition_success=()=>true]
 * <br>
 *     -- *DEFAULT* - () => true <br>
 *     -- /disappear(ed)?/ - (f) => !f.exists(); - disappeared from the whole screen <br>
 *     -- /disappear(ed)?.*in.?place/ - (f) => #some widget info changed#; - disappeared in place <br>
 *     -- func - (f) => func(f);
 * @param {number} [click_params.check_time_once=500]
 * @param {number} [click_params.max_check_times=0]
 * <br>
 *     -- if condition_success is specified, then default value of max_check_times will be 3 <br>
 *     --- example: (this is not usage) <br>
 *     -- while (!waitForAction(condition_success, check_time_once) && max_check_times--) ; <br>
 *     -- return max_check_times >= 0;
 * @param {number|array} [click_params.padding]
 * <br>
 *     -- ["x", -10]|[-10, 0] - x=x-10; <br>
 *     -- ["y", 69]|[0, 69]|[69]|69 - y=y+69;
 */
function swipeAndShowAndClickAction(f, swipe_params, click_params) {
    let _clickAction = (
        typeof clickAction === "undefined" ? clickActionRaw : clickAction
    );
    let _swipeAndShow = (
        typeof swipeAndShow === "undefined" ? swipeAndShowRaw : swipeAndShow
    );

    let _res_swipe = _swipeAndShow(f, swipe_params);
    if (!_res_swipe) {
        return;
    }
    return _clickAction(
        typeof _res_swipe === "boolean" ? f : _res_swipe,
        click_params && click_params.click_strategy, click_params
    );

    // raw function(s) //

    function clickActionRaw(o) {
        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _o = _classof(o) === "Array" ? o[0] : o;
        let _w = _o.toString().match(/UiObject/) ? _o : _o.findOnce();
        if (!_w) {
            return false;
        }
        let _bnd = _w.bounds();
        return click(_bnd.centerX(), _bnd.centerY());
    }

    function swipeAndShowRaw(sltr, params) {
        let _max = 10;
        let _dev_h = device.height;
        let _dev_w = device.width;
        let _time = params.swipe_time || 150;
        let _itv = params.swipe_interval || 300;
        while (_max--) {
            let _w = sltr.findOnce();
            if (_w && _w.bounds().top > 0 && _w.bounds().bottom < device.height) {
                return true;
            }
            swipe(_dev_w * 0.5, _dev_h * 0.8, _dev_w * 0.5, _dev_h * 0.2, _time);
            sleep(_itv);
        }
        return _max >= 0;
    }
}

/**
 * Simulates touch, keyboard or key press events (by shell or functions based on accessibility service)
 * @global
 * @param code {string|number} - {@link https://developer.android.com/reference/android/view/KeyEvent}
 * @param {object} [params]
 * @param {boolean} [params.force_shell] - don't use accessibility functions like back(), home() or recents()
 * @param {boolean} [params.no_err_msg] - don't print error message when keycode() failed
 * @param {boolean} [params.double] - simulate keycode twice with tiny interval
 * @example
 * // home key
 * keycode("home");
 * keycode("KEYCODE_HOME");
 * keycode(3);
 * // back key by shell and without error message
 * keycode("back", {no_err_msg: true, force_shell: true});
 * keycode(4, {no_err_msg: true, force_shell: true});
 * // power key
 * keycode(26, {no_err_msg: true});
 * keycode("KEYCODE_POWER", {no_err_msg: true});
 * // recent key
 * keycode("recent_apps");
 * keycode("recent");
 * keycode("KEYCODE_APP_SWITCH");
 * @return {boolean}
 */
function keycode(code, params) {
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === "function" && $$impeded(keycode.name);

    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );

    if (_par.force_shell) {
        return keyEvent(code);
    }
    let _tidy_code = code.toString().toLowerCase()
        .replace(/^keycode_|s$/, "")
        .replace(/_([a-z])/g, ($0, $1) => $1.toUpperCase());
    let _1st_res = simulateKey();
    return _par.double ? simulateKey() : _1st_res;

    // tool function(s) //

    function keyEvent(keycode) {
        let _checker = {"26, power": checkPower};
        for (let _key in _checker) {
            if (_checker.hasOwnProperty(_key)) {
                if (~_key.split(/ *, */).indexOf(_tidy_code)) {
                    return _checker[_key].call(null);
                }
            }
        }
        return shellInputKeyEvent(keycode);

        // tool function(s) //

        function checkPower() {
            let isScreenOn = () => device.isScreenOn();
            let isScreenOff = () => !isScreenOn();
            if (isScreenOff()) {
                let max = 10;
                do {
                    device.wakeUp();
                } while (!_waitForAction(isScreenOn, 500) && max--);
                return max >= 0;
            }
            if (!shellInputKeyEvent(keycode)) {
                return false;
            }
            return _waitForAction(isScreenOff, 2.4e3);
        }

        function shellInputKeyEvent(keycode) {
            try {
                return !shell("input keyevent " + keycode, true).code;
            } catch (e) {
                if (!_par.no_err_msg) {
                    messageAction("按键模拟失败", 0);
                    messageAction("键值: " + keycode, 0, 0, 1);
                }
                return false;
            }
        }
    }

    function simulateKey() {
        switch (_tidy_code) {
            case "3":
            case "home":
                return !!~home();
            case "4":
            case "back":
                return !!~back();
            case "appSwitch":
            case "187":
            case "recent":
            case "recentApp":
                return !!~recents();
            case "powerDialog":
            case "powerMenu":
                return !!~powerDialog();
            case "notification":
                return !!~notifications();
            case "quickSetting":
                return !!~quickSettings();
            case "splitScreen":
                return !!~splitScreen();
            default:
                return keyEvent(code);
        }
    }

    // raw function(s) //

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
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
 * @global
 * @param msg {"__split_line__"|"__split_line__dash__"|string|string[]} - message will be formatted with prefix ">> "
 * <br>
 *     - "sum is much smaller" - ">> sum is much smaller" <br>
 *     - ">sum is much smaller" - ">>> sum is much smaller"
 * @param {"up"|"up_2"|"up_3"|"up_4"|"Up"|"Up_2"|"Up_3"|"Up_4"|"both"|"both_2"|"both_3"|"both_4"|"both_dash"|"both_dash_2"|"both_dash_3"|"both_dash_4"|"up_dash"|"Up_both_dash"|string|number} [msg_level=0] - "Up": black up line; "up": grey up line; "Up_dash": not supported
 * @param {boolean} [forcible_flag=undefined] - forcibly enabled with truthy; forcibly disabled with false (not falsy)
 */
function debugInfo(msg, msg_level, forcible_flag) {
    let $_flag = global.$$flag = global.$$flag || {};

    let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
    let _showSplitLine = (
        typeof showSplitLine === "function" ? showSplitLine : showSplitLineRaw
    );
    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );

    let _glob_fg = $_flag.debug_info_avail;
    let _forc_fg = forcible_flag;
    if (!_glob_fg && !_forc_fg) {
        return;
    }
    if (_glob_fg === false || _forc_fg === false) {
        return;
    }

    let _msg_lv_str = (msg_level || "").toString();
    let _msg_lv_num = +(_msg_lv_str.match(/\d/) || [0])[0];
    if (_msg_lv_str.match(/Up/)) {
        _showSplitLine();
    }
    if (_msg_lv_str.match(/both|up/)) {
        let _dash = _msg_lv_str.match(/dash/) ? "dash" : "";
        debugInfo("__split_line__" + _dash, "", _forc_fg);
    }

    if (typeof msg === "string" && msg.match(/^__split_line_/)) {
        msg = _getLineStr(msg);
    }
    if (_classof(msg) === "Array") {
        msg.forEach(m => debugInfo(m, _msg_lv_num, _forc_fg));
    } else {
        _messageAction((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "), _msg_lv_num);
    }

    if (_msg_lv_str.match("both")) {
        let _dash = _msg_lv_str.match(/dash/) ? "dash" : "";
        debugInfo("__split_line__" + _dash, "", _forc_fg);
    }

    // raw function(s) //

    function showSplitLineRaw(extra, style) {
        console.log((
            style === "dash" ? "- ".repeat(18).trim() : "-".repeat(33)
        ) + (extra || ""));
    }

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    // tool function(s) //

    function _getLineStr(msg) {
        return msg.match(/dash/) ? "- ".repeat(18).trim() : "-".repeat(33);
    }
}

/**
 * Returns equivalency of two objects (generalized) or two basic-data-type variables
 * @global
 * @param {*} obj_a
 * @param {*} obj_b
 * @return {boolean}
 */
function equalObjects(obj_a, obj_b) {
    let _classOf = value => Object.prototype.toString.call(value).slice(8, -1);
    let _class_a = _classOf(obj_a);
    let _class_b = _classOf(obj_b);
    let _type_a = typeof obj_a;
    let _type_b = typeof obj_b;

    if (!_isTypeMatch(_type_a, _type_b, "object")) {
        return obj_a === obj_b;
    }
    if (_isTypeMatch(_class_a, _class_b, "Null")) {
        return true;
    }

    if (_class_a === "Array") {
        if (_class_b === "Array") {
            let _len_a = obj_a.length;
            let _len_b = obj_b.length;
            if (_len_a === _len_b) {
                let _used_b_indices = [];
                for (let i = 0, l = obj_a.length; i < l; i += 1) {
                    if (!_singleArrCheck(i, _used_b_indices)) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    if (_class_a === "Object") {
        if (_class_b === "Object") {
            let _keys_a = Object.keys(obj_a);
            let _keys_b = Object.keys(obj_b);
            let _len_a = _keys_a.length;
            let _len_b = _keys_b.length;
            if (_len_a !== _len_b) {
                return false;
            }
            if (!equalObjects(_keys_a, _keys_b)) {
                return false;
            }
            for (let i in obj_a) {
                if (obj_a.hasOwnProperty(i)) {
                    if (!equalObjects(obj_a[i], obj_b[i])) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    // tool function(s) //

    function _isTypeMatch(a, b, feature) {
        return a === feature && b === feature;
    }

    function _singleArrCheck(i, container) {
        let _a = obj_a[i];
        for (let i = 0, l = obj_b.length; i < l; i += 1) {
            if (~container.indexOf(i)) {
                continue;
            }
            if (equalObjects(_a, obj_b[i])) {
                container.push(i);
                return true;
            }
        }
    }
}

/**
 * Deep clone a certain object (generalized)
 * @global
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
 * @global
 * @param shifting {number[]|string} - page shifting -- positive for shifting left and negative for right
 * <br>
 *     - "full_left" - "[WIDTH, 0]" <br>
 *     - "full_right" - "[-WIDTH, 0]" <br>
 *     - [-90, 0] - 90 px right shifting
 * @param {number} [duration=180] - scroll duration
 * @param {array} pages_pool - pool for storing pages (parent views)
 * @param {android.view.View} [base_view=ui.main] - specified view for attaching parent views
 */
function smoothScrollView(shifting, duration, pages_pool, base_view) {
    if (pages_pool.length < 2 || global._$_page_scrolling) {
        return;
    }
    global._$_page_scrolling = true;

    let _is_scrolling = true;
    let _du = duration || 180;
    let _each_move_time = 10;
    let _base_view = base_view || ui.main;
    let _pool_len = pages_pool.length;
    let _main_view = pages_pool[_pool_len - 2];
    let _sub_view = pages_pool[_pool_len - 1];
    let _parent = _base_view.getParent();
    let _abs = num => num < 0 ? -num : num;

    if (!global.WIDTH || !global.HEIGHT) {
        let _data = getDisplayRaw();
        [global.WIDTH, global.HEIGHT] = [_data.WIDTH, _data.HEIGHT];
    }

    try {
        if (shifting === "full_left") {
            shifting = [WIDTH, 0];
            _sub_view && _sub_view.scrollBy(-WIDTH, 0);
            _parent.addView(_sub_view);
        } else if (shifting === "full_right") {
            shifting = [-WIDTH, 0];
        }

        let [_dx, _dy] = shifting;
        let [_neg_x, _neg_y] = [_dx < 0, _dy < 0];
        [_dx, _dy] = [_abs(_dx), _abs(_dy)];
        let _ptx = _dx ? Math.ceil(_each_move_time * _dx / _du) : 0;
        let _pty = _dy ? Math.ceil(_each_move_time * _dy / _du) : 0;

        threads.start(function () {
            let _itv = setInterval(function () {
                try {
                    if (_dx <= 0 && _dy <= 0) {
                        clearInterval(_itv);
                        if ((shifting[0] === -WIDTH && _sub_view) && _is_scrolling) {
                            ui.post(() => {
                                let _last_idx = _parent.getChildCount() - 1;
                                let _last_chd = _parent.getChildAt(_last_idx);
                                _sub_view.scrollBy(WIDTH, 0);
                                _parent.removeView(_last_chd);
                            });
                        }
                        return _is_scrolling = false;
                    }
                    let _move_x = _ptx ? Math.min(_dx, _ptx) : 0;
                    let _move_y = _pty ? Math.min(_dy, _pty) : 0;
                    let _scroll_x = _neg_x ? -_move_x : _move_x;
                    let _scroll_y = _neg_y ? -_move_y : _move_y;
                    ui.post(() => {
                        _sub_view && _sub_view.scrollBy(_scroll_x, _scroll_y);
                        _main_view.scrollBy(_scroll_x, _scroll_y);
                    });
                    _dx -= _move_x;
                    _dy -= _move_y;
                } catch (e) {
                    // setInterval will throw Error even if it's in a try() body
                }
            }, _each_move_time);
        });

        threads.start(function () {
            waitForAction(() => !_is_scrolling, 10e3);
            delete global._$_page_scrolling;
        });
    } catch (e) {
        _is_scrolling = false;
        console.warn(e.message); //// TEST ////
    }

    // raw function(s) //

    function getDisplayRaw(params) {
        let $_flag = global.$$flag = global.$$flag || {};

        let _par = params || {};
        let _waitForAction = (
            typeof waitForAction === "function" ? waitForAction : waitForActionRaw
        );
        let _debugInfo = (m, fg) => (
            typeof debugInfo === "function" ? debugInfo : debugInfoRaw
        )(m, fg, _par.debug_info_flag);
        let $_str = x => typeof x === "string";

        let _W, _H;
        let _disp = {};
        let _win_svc = context.getSystemService(context.WINDOW_SERVICE);
        let _win_svc_disp = _win_svc.getDefaultDisplay();

        if (!_waitForAction(() => _disp = _getDisp(), 3e3, 500)) {
            return console.error("getDisplayRaw()返回结果异常");
        }
        _showDisp();
        return Object.assign(_disp, {
            cX: _cX,
            cY: _cY
        });

        // tool function(s) //

        function _cX(num) {
            let _unit = Math.abs(num) >= 1 ? _W / 720 : _W;
            let _x = Math.round(num * _unit);
            return Math.min(_x, _W);
        }

        function _cY(num, aspect_ratio) {
            let _ratio = aspect_ratio;
            if (!~_ratio) _ratio = "16:9"; // -1
            if ($_str(_ratio) && _ratio.match(/^\d+:\d+$/)) {
                let _split = _ratio.split(":");
                _ratio = _split[0] / _split[1];
            }
            _ratio = _ratio || _H / _W;
            _ratio = _ratio < 1 ? 1 / _ratio : _ratio;
            let _h = _W * _ratio;
            let _unit = Math.abs(num) >= 1 ? _h / 1280 : _h;
            let _y = Math.round(num * _unit);
            return Math.min(_y, _H);
        }

        function _showDisp() {
            if (!$_flag.display_params_got) {
                _debugInfo("屏幕宽高: " + _W + " × " + _H);
                _debugInfo("可用屏幕高度: " + _disp.USABLE_HEIGHT);
                $_flag.display_params_got = true;
            }
        }

        function _getDisp() {
            try {
                _W = _win_svc_disp.getWidth();
                _H = _win_svc_disp.getHeight();
                if (!(_W * _H)) {
                    return _raw();
                }

                // left: 1, right: 3, portrait: 0 (or 2 ?)
                let _SCR_O = _win_svc_disp.getOrientation();
                let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                let _MAX = _win_svc_disp.maximumSizeDimension;

                let [_UH, _UW] = [_H, _W];
                let _dimen = (name) => {
                    let resources = context.getResources();
                    let resource_id = resources.getIdentifier(name, "dimen", "android");
                    if (resource_id > 0) {
                        return resources.getDimensionPixelSize(resource_id);
                    }
                    return NaN;
                };

                _is_scr_port ? [_UH, _H] = [_H, _MAX] : [_UW, _W] = [_W, _MAX];

                return {
                    WIDTH: _W,
                    USABLE_WIDTH: _UW,
                    HEIGHT: _H,
                    USABLE_HEIGHT: _UH,
                    screen_orientation: _SCR_O,
                    status_bar_height: _dimen("status_bar_height"),
                    navigation_bar_height: _dimen("navigation_bar_height"),
                    navigation_bar_height_computed: _is_scr_port ? _H - _UH : _W - _UW,
                    action_bar_default_height: _dimen("action_bar_default_height"),
                };
            } catch (e) {
                return _raw();
            }

            // tool function(s) //

            function _raw() {
                _W = device.width;
                _H = device.height;
                return _W && _H && {
                    WIDTH: _W,
                    HEIGHT: _H,
                    USABLE_HEIGHT: Math.trunc(_H * 0.9),
                };
            }
        }

        // raw function(s) //

        function waitForActionRaw(cond_func, time_params) {
            let _cond_func = cond_func;
            if (!cond_func) return true;
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
            let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
            let _check_interval = typeof time_params === "object" && time_params[1] || 200;
            while (!_cond_func() && _check_time >= 0) {
                sleep(_check_interval);
                _check_time -= _check_interval;
            }
            return _check_time >= 0;
        }

        function debugInfoRaw(msg, msg_lv) {
            msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }
}

/**
 * Observe message(s) from Toast by events.observeToast()
 * @global
 * @param aim_app_pkg {string}
 * @param aim_msg {RegExp|string} - regular expression or a certain specific string
 * @param {number} [timeout=8e3]
 * @param {number} [aim_amount=1] - events will be cleared if aim_amount messages have been got
 * @return {string[]}
 */
function observeToastMessage(aim_app_pkg, aim_msg, timeout, aim_amount) {
    let _tt = +timeout || 8e3;
    let _aim_msg = aim_msg || ".*";
    let _aim_pkg = aim_app_pkg || currentPackage();
    let _amt = aim_amount || 1;
    let _got_msg = [];

    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );

    threads.start(function () {
        events.observeToast();
        events.onToast((o) => {
            return o.getPackageName() === _aim_pkg
                && o.getText().match(_aim_msg)
                && _got_msg.push(o.getText());
        });
    });

    _waitForAction(() => _got_msg.length >= _amt, _tt, 50);

    // events.recycle() will make listeners (like key listeners) invalid
    // events.recycle();

    // remove toast listeners to make it available for next-time invocation
    // otherwise, events will exceed the max listeners limit with default 10
    events.removeAllListeners("toast");

    return _got_msg;

    // raw function(s) //

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }
}

/**
 * Save current screen capture as a file with a key name and a formatted timestamp
 * @global
 * @param {string} key_name - a key name as a clip of the file name
 * @param {{}} [options]
 * @param {number|string|null} [options.log_level]
 * @param {number} [options.max_samples=10]
 * @see messageAction
 */
function captureErrScreen(key_name, options) {
    if (typeof imagesx === "object") {
        imagesx.permit();
    } else if (!global._$_request_screen_capture) {
        images.requestScreenCapture();
        global._$_request_screen_capture = true;
    }

    let _opt = options || {};
    let _log_lv = _opt.log_level;
    let _max_smp = _opt.max_samples || 10;
    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );

    let _dir = files.getSdcardPath() + "/.local/Pics/Err/";
    let _suffix = "_" + _getTimeStr();
    let _path = _dir + key_name + _suffix + ".png";

    try {
        files.createWithDirs(_path);
        images.captureScreen(_path);
        if (_log_lv !== null && _log_lv !== undefined) {
            _messageAction("已存储屏幕截图文件:", _log_lv);
            _messageAction(_path, _log_lv);
        }
        _removeRedundant();
    } catch (e) {
        _messageAction(e.message, 3);
    }

    // tool function(s) //

    function _getTimeStr() {
        let _now = new Date();
        let _pad = n => (n < 10 ? "0" : "") + n;
        return _now.getFullYear() +
            _pad(_now.getMonth() + 1) +
            _pad(_now.getDate()) +
            _pad(_now.getHours()) +
            _pad(_now.getMinutes()) +
            _pad(_now.getSeconds());
    }

    function _removeRedundant() {
        files.listDir(_dir, function (name) {
            return !!~name.indexOf(key_name);
        }).sort((a, b) => {
            return a === b ? 0 : a > b ? -1 : 1;
        }).slice(_max_smp).forEach((name) => {
            files.remove(_dir + name);
        });
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }
}

/**
 * Returns a UiSelector with additional function(s) bound to its __proto__
 * @global
 * @param {object} [options]
 * @param {boolean} [options.debug_info_flag]
 */
function getSelector(options) {
    let _opt = options || {};
    let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
    let _debugInfo = (m, lv) => (
        typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo
    )(m, lv, _opt.debug_info_flag);
    let _sel = selector();
    /**
     * @typedef {{_cache_pool: {}, add(*, *=, *=): this, cache: {load(*, *=): (null|*), save: (function(*=): *), recycle(*): void, refresh(*=): void, reset(*=): *}, get(*, *=): (null|*), pickup((UiSelector$|UiObject$|string|RegExp|AdditionalSelector|(UiSelector$|UiObject$|string|RegExp|AdditionalSelector)[]), ("w"|"widget"|"w_collection"|"widget_collection"|"wcollection"|"widgetcollection"|"w_c"|"widget_c"|"wc"|"widgetc"|"widgets"|"wids"|"s"|"sel"|"selector"|"e"|"exist"|"exists"|"t"|"txt"|"ss"|"sels"|"selectors"|"s_s"|"sel_s"|"selector_s"|"sstr"|"selstr"|"selectorstr"|"s_str"|"sel_str"|"selector_str"|"sstring"|"selstring"|"selectorstring"|"s_string"|"sel_string"|"selector_string"|UiObjectProperties|string)=, string=, {selector_prefer?: ("desc"|"text"), debug_info_flag?: boolean}=): (UiObject$|UiObjectCollection$|UiSelector$|AndroidRect$|string|boolean), _sel_body_pool: {}, getAndCache(*=): *}} ExtendedSelector
     */
    _sel.__proto__ = {
        _sel_body_pool: {},
        _cache_pool: {},
        /**
         * @typedef {
         *     UiSelector$|UiObject$|string|RegExp|AdditionalSelector|
         *     (UiSelector$|UiObject$|string|RegExp|AdditionalSelector)[]
         * } UiSelector$pickup$sel_body
         * @typedef {
         *     UiObject$|UiObjectCollection$|UiSelector$|AndroidRect$|string|boolean
         * } UiSelector$pickup$return_value
         * @typedef {
         *     "w"|"widget"|"w_collection"|"widget_collection"|"wcollection"|"widgetcollection"|"w_c"|"widget_c"|"wc"|"widgetc"|"widgets"|"wids"|"s"|"sel"|"selector"|"e"|"exist"|"exists"|"t"|"txt"|"ss"|"sels"|"selectors"|"s_s"|"sel_s"|"selector_s"|"sstr"|"selstr"|"selectorstr"|"s_str"|"sel_str"|"selector_str"|"sstring"|"selstring"|"selectorstring"|"s_string"|"sel_string"|"selector_string"|UiObjectProperties|string
         * } UiSelector$pickup$res_type
         */
        /**
         * Returns a selector (UiSelector) or widget (UiObject) or some attribute values
         * If no widgets (UiObject) were found, returns null or "" or false
         * If memory keyword was found in this session memory, use a memorized selector directly
         * @function UiSelector$.prototype.pickup
         * @param {UiSelector$pickup$sel_body} sel_body
         * <br>
         *     -- array mode 1: [selector_body: any, compass: string]
         *     -- array mode 2: [selector_body: any, additional_sel: array|object, compass: string]
         * @param {string} [mem_sltr_kw] - memory keyword
         * @param {UiSelector$pickup$res_type} [res_type="widget"] -
         * <br>
         *     -- "txt": available text()/desc() value or empty string
         *     -- "clickable": boolean value of widget.clickable()
         *     -- "wc": widget collection which is traversable
         * @param {object} [par]
         * @param {"desc"|"text"} [par.selector_prefer="desc"] - unique selector you prefer to check first
         * @param {boolean} [par.debug_info_flag]
         * @example
         * // text/desc/id("abc").findOnce();
         * pickup("abc"); // UiObject
         * pickup("abc", "w"); // same as above
         * pickup("abc", "w", "my_alphabet"); // with memory keyword
         *
         * // text/desc/id("abc");
         * pickup("abc", "sel", "my_alphabet"); // UiSelector
         *
         * // text("abc").findOnce()
         * pickup(text("abc"), "w", "my_alphabet"); // with UiObject selector body
         *
         * // get the string of selector
         * pickup(/^abc.+z/, "sel_str"); // returns "id"|"text"|"desc"...
         *
         * // text/desc/id("morning").exists()
         * pickup("morning", "exists"); // boolean
         *
         * // text/desc/id("morning").findOnce().parent().parent().child(3).id()
         * pickup(["morning", "p2c3"], "id");
         *
         * // text/desc/id("hello").findOnce().parent().child(%childCount% - 3)["text"|"desc"]
         * pickup(["hello", "s-3"], "txt");
         *
         * // text/desc/id("hello").findOnce().parent().child(%indexInParent% + 2)["text"|"desc"]
         * pickup(["hello", "s>2"], "txt");
         *
         * // desc("a").className(...).boundsInside(...).findOnce().parent().child(%indexInParent% + 1).clickable()
         * pickup([desc("a").className("Button"), {boundsInside: [0, 0, 720, 1000]}, "s>1"], "clickable", "back_btn");
         *
         * // className("Button").findOnce()
         * pickup({className: "Button"});
         *
         * // w = className("Button").findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
         * // w.parent().child(0);
         * pickup([{className: "Button"}, "p5c1>0>0>0>1s0"]);
         *
         * // w = className("Button").findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
         * // w.parent(w.indexInParent() - 1);
         * pickup([{className: "Button"}, "p5c1>0>0>0>1s<1"]);
         *
         * // w = className("Button").findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
         * // w.parent().child(w.parent().childCount() - 1);
         * pickup([{className: "Button"}, "p5c1>0>0>0>1s-1"]);
         * @returns {UiSelector$pickup$return_value}
         */
        pickup(sel_body, res_type, mem_sltr_kw, par) {
            let _sel_body = _classof(sel_body) === "Array" ? sel_body.slice() : [sel_body];
            let _params = Object.assign({}, _opt, par);
            let _res_type = (res_type || "").toString();

            if (!_res_type || _res_type.match(/^w(idget)?$/)) {
                _res_type = "widget";
            } else if (_res_type.match(/^(w(idget)?_?c(ollection)?|wid(get)?s)$/)) {
                _res_type = "widgets";
            } else if (_res_type.match(/^s(el(ector)?)?$/)) {
                _res_type = "selector";
            } else if (_res_type.match(/^e(xist(s)?)?$/)) {
                _res_type = "exists";
            } else if (_res_type.match(/^t(xt)?$/)) {
                _res_type = "txt";
            } else if (_res_type.match(/^s(el(ector)?)?(_?s)(tr(ing)?)?$/)) {
                _res_type = "selector_string";
            }

            if (typeof _sel_body[1] === "string") {
                // take it as "compass" variety
                _sel_body.splice(1, 0, "");
            }

            let [_body, _addi_sel, _compass] = _sel_body;

            let _sltr = _getSelector(_addi_sel);
            /** @type {UiObject$|null} */
            let _w = null;
            let _wc = [];
            if (_sltr && _sltr.toString().match(/UiObject/)) {
                _w = _sltr;
                if (_res_type === "widgets") {
                    _wc = [_sltr];
                }
                _sltr = null;
            } else {
                _w = _sltr ? _sltr.findOnce() : null;
                if (_res_type === "widgets") {
                    _wc = _sltr ? _sltr.find() : [];
                }
            }

            if (_compass) {
                _w = _relativeWidget([_sltr || _w, _compass]);
            }

            let _res = {
                selector: _sltr,
                widget: _w,
                widgets: _wc,
                exists: !!_w,
                get selector_string() {
                    return _sltr ? _sltr.toString().match(/[a-z]+/)[0] : "";
                },
                get txt() {
                    let _text = _w && _w.text() || "";
                    let _desc = _w && _w.desc() || "";
                    return _desc.length > _text.length ? _desc : _text;
                }
            };

            if (_res_type in _res) {
                return _res[_res_type];
            }

            try {
                return _w ? _w[_res_type]() : null;
            } catch (e) {
                try {
                    return _w[_res_type];
                } catch (e) {
                    debugInfo(e.message, 3);
                    return null;
                }
            }

            // tool function(s)//

            function _getSelector(addition) {
                let _mem_key = "_$_mem_sltr_" + mem_sltr_kw;
                if (mem_sltr_kw) {
                    let _mem_sltr = global[_mem_key];
                    if (_mem_sltr) {
                        return _mem_sltr;
                    }
                }
                let _sltr = _selGenerator();
                if (mem_sltr_kw && _sltr) {
                    // _debugInfo(["选择器已记录", ">" + mem_sltr_kw, ">" + _sltr]);
                    global[_mem_key] = _sltr;
                }
                return _sltr;

                // tool function(s) //

                function _selGenerator() {
                    let _prefer = _params.selector_prefer;
                    let _body_class = _classof(_body);
                    let _sel_keys_abbr = {
                        bi$: "boundsInside",
                        c$: "clickable",
                        cn$: "className",
                    };

                    if (_body_class === "JavaObject") {
                        if (_body.toString().match(/UiObject/)) {
                            addition && _debugInfo("UiObject无法使用额外选择器", 3);
                            return _body;
                        }
                        return _chkSels(_body);
                    }

                    if (typeof _body === "string") {
                        return _prefer === "text"
                            ? _chkSels(text(_body), desc(_body), id(_body))
                            : _chkSels(desc(_body), text(_body), id(_body));
                    }

                    if (_body_class === "RegExp") {
                        return _prefer === "text"
                            ? _chkSels(textMatches(_body), descMatches(_body), idMatches(_body))
                            : _chkSels(descMatches(_body), textMatches(_body), idMatches(_body));
                    }

                    if (_body_class === "Object") {
                        let _s = selector();
                        Object.keys(_body).forEach((k) => {
                            let _arg = _body[k];
                            let _k = k in _sel_keys_abbr ? _sel_keys_abbr[k] : k;
                            _s = _s[_k].apply(_s, Array.isArray(_arg) ? _arg : [_arg]);
                        });
                        return _s;
                    }

                    // tool function(s) //

                    function _chkSels(sels) {
                        let _sels = Array.isArray(sels) ? sels : [].slice.call(arguments);
                        for (let i = 0, l = _sels.length; i < l; i += 1) {
                            let _res = _chkSel(_sels[i]);
                            if (_res) {
                                return _res;
                            }
                        }
                        return null;

                        // tool function(s) //

                        function _chkSel(sel) {
                            if (_classof(addition) === "Array") {
                                let _o = {};
                                _o[addition[0]] = addition[1];
                                addition = _o;
                            }
                            if (_classof(addition) === "Object") {
                                let _keys = Object.keys(addition);
                                for (let i = 0, l = _keys.length; i < l; i += 1) {
                                    let _k = _keys[i];
                                    let _sel_k = _k in _sel_keys_abbr ? _sel_keys_abbr[_k] : _k;
                                    if (!sel[_sel_k]) {
                                        _debugInfo(["无效的additional_selector属性值:", _sel_k], 3);
                                        return null;
                                    }
                                    let _arg = addition[_k];
                                    _arg = Array.isArray(_arg) ? _arg : [_arg];
                                    try {
                                        sel = sel[_sel_k].apply(sel, _arg);
                                    } catch (e) {
                                        _debugInfo(["无效的additional_selector选择器:", _sel_k], 3);
                                        return null;
                                    }
                                }
                            }
                            try {
                                return sel && sel.exists() ? sel : null;
                            } catch (e) {
                                return null;
                            }
                        }
                    }
                }
            }

            /**
             * Returns a relative widget (UiObject) by compass string
             * @returns {UiObject|null}
             */
            function _relativeWidget(w_info) {
                let _w_o = _classof(w_info) === "Array" ? w_info.slice() : [w_info];
                let _w = _w_o[0];
                let _w_class = _classof(_w);
                let _w_str = (_w || "").toString();

                if (typeof _w === "undefined") {
                    _debugInfo("relativeWidget的widget参数为Undefined");
                    return null;
                }
                if (_w === null) {
                    // _debugInfo("relativeWidget的widget参数为Null");
                    return null;
                }
                if (_w_str.match(/^Rect\(/)) {
                    // _debugInfo("relativeWidget的widget参数为Rect()");
                    return null;
                }
                if (_w_class === "JavaObject") {
                    if (_w_str.match(/UiObject/)) {
                        // _debugInfo("relativeWidget的widget参数为UiObject");
                    } else {
                        // _debugInfo("relativeWidget的widget参数为UiSelector");
                        _w = _w.findOnce();
                        if (!_w) {
                            // _debugInfo("UiSelector查找后返回Null");
                            return null;
                        }
                    }
                } else {
                    _debugInfo("未知的relativeWidget的widget参数", 3);
                    return null;
                }

                let _compass = _w_o[1];
                if (!_compass) {
                    // _debugInfo("relativeWidget的罗盘参数为空");
                    return _w;
                }
                _compass = _compass.toString();

                while (_compass.length) {
                    let _mch_p, _mch_c, _mch_s;
                    // p2 ( .parent().parent() )
                    // pppp  ( p4 )
                    // p  ( p1 )
                    // p4pppp12p  ( p4 ppp p12 p -> 4 + 3 + 12 + 1 -> p20 )
                    if ((_mch_p = /^p[p\d]*/.exec(_compass))) {
                        let _len = _compass.match(/p\d+|p+(?!\d)/g).reduce((a, b) => (
                            a + (/\d/.test(b) ? +b.slice(1) : b.length)
                        ), 0);
                        while (_len--) {
                            if (!(_w = _w.parent())) {
                                return null;
                            }
                        }
                        _compass = _compass.slice(_mch_p[0].length);
                        continue;
                    }
                    // c0c2c0c1  ( .child(0).child(2).child(0).child(1) )
                    // c0>2>0>1  ( .child(0).child(2).child(0).child(1) )
                    // c-3  ( .child(childCount()-3) )
                    // c-3c2c-1  ( .child(childCount()-3).child(2).child(childCount()-1) )
                    // c1>2>3>0>-1>1  ( c1 c2 c3 c0 c-1 c1 )
                    if ((_mch_c = /^c-?\d+([>c]?-?\d+)*/.exec(_compass))) {
                        let _nums = _mch_c[0].split(/[>c]/);
                        for (let s of _nums) {
                            if (s.length) {
                                let _i = +s;
                                let _cc = _w.childCount();
                                if (_i < 0) {
                                    _i += _cc;
                                }
                                if (_i < 0 || _i >= _cc) {
                                    return null;
                                }
                                _w = _w.child(_i);
                            }
                        }
                        _compass = _compass.slice(_mch_c[0].length);
                        continue;
                    }
                    // s2  ( .parent().child(2) )
                    // s-2  ( .parent().child(childCount()-2) )
                    // s>2  ( .parent().child(idxInParent()+2) )
                    // s<2  ( .parent().child(idxInParent()-2) )
                    if ((_mch_s = /^s[<>]?-?\d+/.exec(_compass))) {
                        let _parent = _w.parent();
                        if (!_parent) {
                            return null;
                        }
                        let _idx = _w.indexInParent();
                        if (!~_idx) {
                            return null;
                        }
                        let _cc = _parent.childCount();
                        let _str = _mch_s[0];
                        let _offset = +_str.match(/-?\d+/)[0];
                        if (~String.prototype.search.call(_str, ">")) {
                            _idx += _offset;
                        } else if (~String.prototype.search.call(_str, "<")) {
                            _idx -= _offset;
                        } else {
                            _idx = _offset < 0 ? _offset + _cc : _offset;
                        }
                        if (_idx < 0 || _idx >= _cc) {
                            return null;
                        }
                        _w = _parent.child(_idx);
                        _compass = _compass.slice(_mch_s[0].length);
                        continue;
                    }

                    throw Error("无法解析剩余罗盘参数: " + _compass);
                }

                return _w || null;
            }
        },
        /**
         * @function UiSelector$.prototype.add
         * @param {string} key
         * @param {UiSelector$pickup$sel_body|(function(string): UiSelector$pickup$return_value)} sel_body
         * @param {string} [mem]
         * @example
         * $$sel.add("list", className("ListView"));
         *  // recommended
         * console.log($$sel.get("list", "bounds"));
         * // NullPointerException may occur
         * console.log($$sel.get("list").bounds());
         * // traditional way, and NullPointerException may occur
         * console.log(className("ListView").findOnce().bounds());
         * @returns {UiSelector$}
         */
        add(key, sel_body, mem) {
            this._sel_body_pool[key] = typeof sel_body === "function"
                ? type => sel_body(type)
                : type => this.pickup(sel_body, type, mem || key);
            return _sel; // to make method chaining possible
        },
        /**
         * @function UiSelector$.prototype.get
         * @param {string} key
         * @param {UiSelector$pickup$res_type|"cache"} [type]
         * @example
         *
         * @throws {Error} `sel key '${key}' not set in pool`
         * @returns {UiSelector$pickup$return_value|null}
         */
        get(key, type) {
            if (!(key in this._sel_body_pool)) {
                throw Error("Sel key '" + key + "' not set in pool");
            }
            let _picker = this._sel_body_pool[key];
            return !_picker ? null : type === "cache"
                ? (this._cache_pool[key] = _picker("w"))
                : _picker(type);
        },
        /** @function UiSelector$.prototype.getAndCache */
        getAndCache(key) {
            // only "widget" type can be returned
            return this.get(key, "cache");
        },
        /** @member UiSelector$.prototype.cache */
        cache: {
            save: (key) => _sel.getAndCache(key),
            /** @returns {UiObject$|UiObjectCollection$|UiSelector$|AndroidRect$|string|boolean|null} */
            load(key, type) {
                let _cache = _sel._cache_pool[key];
                return _cache ? _sel.pickup(_cache, type) : null;
            },
            refresh(key) {
                let _cache = _sel._cache_pool[key];
                _cache && _cache.refresh();
                this.save(key);
            },
            reset(key) {
                delete _sel._cache_pool[key];
                return _sel.getAndCache(key);
            },
            recycle(key) {
                let _cache = _sel._cache_pool[key];
                _cache && _cache.recycle();
            },
        },
    };
    return _sel;

    // raw function(s) //

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }
}

/**
 * Returns a new string with a certain mark surrounded
 * @global
 * @param target {*} - will be converted to String format
 * @param {*} [mark_left='"'] - will be converted to String format
 * @param {*} [mark_right=mark_left] - will be converted to String format
 * @example
 * surroundedBy("ABC") // "ABC"
 * surroundedBy("ABC", "#") // "#ABC#"
 * surroundedBy([1, 2].join("+"), "{", "}") // {1+2}
 * @returns {string}
 */
function surroundWith(target, mark_left, mark_right) {
    if (typeof target === "undefined" || target === null) return "";
    target = target.toString();
    mark_left = (mark_left || '"').toString();
    mark_right = (mark_right || mark_left).toString();
    return mark_left + target.toString() + mark_right;
}

/**
 * Record a timestamp then get the time gap by a certain keyword
 * @global
 * @param keyword {string}
 * @param {boolean|number|string} [operation]
 * <br>
 * put a timestamp: "put"; "save"; false value <br>
 * load time gap: "load", "get", any other true value <br>
 * @param {number|"auto"} [divisor=1] - "auto" for picking up a result intelligently
 * @param {array|number} [fixed] - array: max decimal places (last place won't be 0)
 * @param {string} [suffix=""|"$$ch"] - "$$en" or "$$ch" is available when %divisor% is set "auto"
 * @param {number|Date} [override_timestamp]
 * @returns {number|string} - timestamp or time gap with/without a certain format or suffix string
 * @example
 * // result eg: 1565080123796
 * timeRecorder("running", "put");
 * timeRecorder("running", "get");
 * //
 * // result eg: "12.40s"
 * timeRecorder("collect", "save");
 * timeRecorder("collect", "load", 1e3, 2, "s");
 * //
 * // result eg: 18 hours"
 * timeRecorder("waiting", 0);
 * timeRecorder("waiting", 1, 3.6 * Math.pow(10, 6), 0, " hours");
 * //
 * // result eg: 10.331 (not "10.3310000")
 * timeRecorder("try_peeking");
 * timeRecorder("try_peeking", "time_gap", 1e3, [7]);
 * //
 * // result eg: "7h 8.16m"
 * timeRecorder("go_to_bed");
 * timeRecorder("go_to_bed", "L", "auto", null, "$$en");
 * //
 * // result eg: "7分钟8.16秒" (meaning 7m 8.16s)
 * timeRecorder("study");
 * timeRecorder("study", "L", "auto");
 */
function timeRecorder(keyword, operation, divisor, fixed, suffix, override_timestamp) {
    global["_$_ts_rec"] = global["_$_ts_rec"] || {};
    let records = global["_$_ts_rec"];
    if (!operation || operation.toString().match(/^(S|save|put)$/)) {
        return records[keyword] = Date.now();
    }

    divisor = divisor || 1;

    let forcible_fixed_num_flag = false;
    if (typeof fixed === "object" /* array */) forcible_fixed_num_flag = true;

    let prefix = "";
    let result = +(override_timestamp || new Date()) - records[keyword]; // number

    if (divisor !== "auto") {
        suffix = suffix || "";
        result = result / divisor;
    } else {
        suffix = suffix || "$$ch";
        fixed = fixed || [2];
        forcible_fixed_num_flag = true;

        let getSuffix = (unit_str) => ({
            ms$$ch: "毫秒", ms$$en: "ms ",
            sec$$ch: "秒", sec$$en: "s ",
            min$$ch: "分钟", min$$en: "m ",
            hour$$ch: "小时", hour$$en: "h ",
            day$$ch: "天", day$$en: "d ",
        })[unit_str + suffix];

        let base_unit = {
            ms: 1,
            get sec() {
                return 1e3 * this.ms;
            },
            get min() {
                return 60 * this.sec;
            },
            get hour() {
                return 60 * this.min;
            },
            get day() {
                return 24 * this.hour;
            }
        };

        if (result >= base_unit.day) {
            let _d = ~~(result / base_unit.day);
            prefix += _d + getSuffix("day");
            result %= base_unit.day;
            let _h = ~~(result / base_unit.hour);
            if (_h) prefix += _h + getSuffix("hour");
            result %= base_unit.hour;
            let _min = ~~(result / base_unit.min);
            if (_min) {
                result /= base_unit.min;
                suffix = getSuffix("min");
            } else {
                result %= base_unit.min;
                result /= base_unit.sec;
                suffix = getSuffix("sec");
            }
        } else if (result >= base_unit.hour) {
            let _hr = ~~(result / base_unit.hour);
            prefix += _hr + getSuffix("hour");
            result %= base_unit.hour;
            let _min = ~~(result / base_unit.min);
            if (_min) {
                result /= base_unit.min;
                suffix = getSuffix("min");
            } else {
                result %= base_unit.min;
                result /= base_unit.sec;
                suffix = getSuffix("sec");
            }
        } else if (result >= base_unit.min) {
            let _min = ~~(result / base_unit.min);
            prefix += _min + getSuffix("min");
            result %= base_unit.min;
            result /= base_unit.sec;
            suffix = getSuffix("sec");
        } else if (result >= base_unit.sec) {
            result /= base_unit.sec;
            suffix = getSuffix("sec");
        } else {
            result /= base_unit.ms; // yes, i have OCD [:wink:]
            suffix = getSuffix("ms");
        }
    }

    if (typeof fixed !== "undefined" && fixed !== null) {
        result = result.toFixed(+fixed);  // string
    }

    if (forcible_fixed_num_flag) result = +result;
    suffix = suffix.toString().replace(/ *$/g, "");

    let _res;
    if (!prefix) {
        _res = result + suffix;
    } else {
        _res = prefix + (result ? result + suffix : "");
    }
    return _res === "NaN" ? NaN : _res;
}

/**
 * Function for a series of ordered click actions
 * @global
 * @param pipeline {array} - object is disordered; use array instead - last item condition: null for self exists; undefined for self disappeared
 * @param {object} [options={}]
 * @param {string} [options.name] - pipeline name
 * @param {number} [options.interval=0]
 * @param {number} [options.max_try_times=5]
 * @param {string} [options.default_strategy="click"]
 * @param {boolean} [options.debug_info_flag]
 * @returns {boolean}
 */
function clickActionsPipeline(pipeline, options) {
    let _opt = options || {};
    let _def_stg = _opt.default_strategy || "click";
    let _itv = +_opt.interval || 0;
    let _max_times = +_opt.max_try_times;
    _max_times = isNaN(_max_times) ? 5 : _max_times;
    let _max_times_bak = _max_times;

    let _getSelector = (
        typeof getSelector === "function" ? getSelector : getSelectorRaw
    );
    let _clickAction = (
        typeof clickAction === "function" ? clickAction : clickActionRaw
    );
    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );
    let _surroundWith = (
        typeof surroundWith === "function" ? surroundWith : surroundWithRaw
    );
    let _debugInfo = m => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, "", _opt.debug_info_flag);
    let $_sel = _getSelector();

    let _ppl_name = _opt.name ? _surroundWith(_opt.name) : "";
    let _pipe = pipeline.filter(value => typeof value !== "undefined").map((value) => {
        let _v = Object.prototype.toString.call(value).slice(8, -1) === "Array" ? value : [value];
        if (typeof _v[1] === "function" || _v[1] === null) {
            _v.splice(1, 0, null);
        }
        _v[1] = _v[1] || _def_stg;
        return _v;
    });
    _pipe.forEach((value, idx, arr) => {
        if (arr[idx][2] === undefined) {
            arr[idx][2] = function () {
                let _idx = arr[idx + 1] ? idx + 1 : idx;
                return $_sel.pickup(arr[_idx][0]);
            };
        }
        if (typeof arr[idx][2] === "function") {
            let f = arr[idx][2];
            arr[idx][2] = () => f(arr[idx][0]);
        }
    });

    for (let i = 0, l = _pipe.length; i < l; i += 1) {
        _max_times = _max_times_bak;
        let _p = _pipe[i];
        let _sel_body = _p[0];
        let _stg = _p[1];
        let _cond = _p[2];
        let _w = $_sel.pickup(_sel_body);
        let _clickOnce = () => _cond !== null && _clickAction(_w, _stg);

        do {
            _clickOnce();
            sleep(_itv);
        } while (_max_times-- > 0 && !_waitForAction(_cond === null ? _w : _cond, 1.5e3));

        if (_max_times < 0) {
            _messageAction(_ppl_name + "管道破裂", 3, 1, 0, "up_dash");
            return _messageAction(_surroundWith(_sel_body), 3, 0, 1, "dash");
        }
    }

    _debugInfo(_ppl_name + "管道完工");
    return true;

    // raw function(s) //

    function getSelectorRaw() {
        let _sel = selector();
        _sel.__proto__ = {
            pickup(sel_body, res_type) {
                if (sel_body === undefined || sel_body === null) {
                    return null;
                }
                if (!(res_type === undefined || res_type === "w" || res_type === "widget")) {
                    throw Error("getSelectorRaw()返回对象的pickup方法不支持结果筛选类型");
                }
                if (arguments.length > 2) {
                    throw Error("getSelectorRaw()返回对象的pickup方法不支持复杂参数传入");
                }
                if (typeof sel_body === "string") {
                    return desc(sel_body).findOnce() || text(sel_body).findOnce();
                }
                if (sel_body instanceof RegExp) {
                    return descMatches(sel_body).findOnce() || textMatches(sel_body).findOnce();
                }
                if (sel_body instanceof com.stardust.automator.UiObject) {
                    return sel_body;
                }
                if (sel_body instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                    return sel_body.findOnce();
                }
                throw Error("getSelectorRaw()返回对象的pickup方法不支持当前传入的选择体");
            },
        };
        return _sel;
    }

    function clickActionRaw(o) {
        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _o = _classof(o) === "Array" ? o[0] : o;
        let _w = _o.toString().match(/UiObject/) ? _o : _o.findOnce();
        if (!_w) {
            return false;
        }
        let _bnd = _w.bounds();
        return click(_bnd.centerX(), _bnd.centerY());
    }

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function surroundWithRaw(target, str) {
        if (!target) return "";
        str = str || '"';
        return str + target + str;
    }

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }
}

/**
 * Convert a timeFlag into a number array
 * @global
 * @param timeFlag {number|string} -- often a number (or number string) from 0 - 127
 * @returns {number[]|number}
 * @example
 * // [0,1,2,4,5] -- Sun, Mon, Tue, Thu, Fri
 * timedTaskTimeFlagConverter(59);
 * // [0,1,2,3,4,5,6] -- everyday
 * timedTaskTimeFlagConverter(127);
 * // 127 -- timeFlag {number}
 * timedTaskTimeFlagConverter([0,1,2,3,4,5,6]);
 * // [] -- disposable
 * timedTaskTimeFlagConverter(0);
 */
function timedTaskTimeFlagConverter(timeFlag) {
    if (typeof timeFlag === "object") {
        return parseInt(Array(7).join(" ").split(" ")
            .map((value, idx) => ~timeFlag.indexOf(idx.toString()) ? 1 : 0)
            .reverse().join(""), 2) || 0;
    } else if (!isNaN(+timeFlag)) {
        let info = (+timeFlag).toString(2).split("").reverse().join("");
        return Array(7).join(" ").split(" ")
            .map((value, idx) => +info[idx] ? idx : null)
            .filter(value => value !== null);
    }
}

/**
 * Fetching data by calling OCR API from Baidu
 * @global
 * @param {[]|ImageWrapper$|UiObject$|UiObjectCollection$} src -- will be converted into Image
 * @param {object} [par]
 * @param {boolean} [par.no_toast_msg_flag=false]
 * @param {number} [par.fetch_times=1]
 * @param {number} [par.fetch_interval=100]
 * @param {boolean} [par.debug_info_flag=false]
 * @param {number} [par.timeout=60e3] -- no less than 5e3
 * @returns {Array|Array[]} -- [] or [[], [], []...]
 * @example
 * // @see "MODULE_MONSTER_FUNC.js"
 * let sel = getSelector();
 * // [[], [], []] -- 3 groups of data
 * console.log(baiduOcr(sel.pickup(/\xa0/, "widgets"), {
 *     fetch_times: 3,
 *     timeout: 12e3
 * }));
 */
function baiduOcr(src, par) {
    if (!src) {
        return [];
    }
    let _par = par || {};
    let _tt = _par.timeout || 60e3;
    if (!+_tt || _tt < 5e3) {
        _tt = 5e3;
    }
    let _tt_ts = Date.now() + _tt;

    if (typeof imagesx === "object") {
        imagesx.permit();
    } else if (!global._$_request_screen_capture) {
        images.requestScreenCapture();
        global._$_request_screen_capture = true;
    }

    let _capt = _par.capt_img || images.captureScreen();

    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _showSplitLine = (
        typeof showSplitLine === "function" ? showSplitLine : showSplitLineRaw
    );
    let _debugInfo = (m, fg) => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, fg, _par.debug_info_flag);

    let _msg = "使用baiduOcr获取数据";
    _debugInfo(_msg);
    _par.no_toast_msg_flag || toast(_msg);

    let _token = "";
    let _max_token = 10;
    let _thd_token = threads.start(function () {
        while (_max_token--) {
            try {
                _token = http.get(
                    "https://aip.baidubce.com/oauth/2.0/token" +
                    "?grant_type=client_credentials" +
                    "&client_id=YIKKfQbdpYRRYtqqTPnZ5bCE" +
                    "&client_secret=hBxFiPhOCn6G9GH0sHoL0kTwfrCtndDj"
                ).body.json()["access_token"];
                _debugInfo("access_token准备完毕");
                break;
            } catch (e) {
                sleep(200);
            }
        }
    });
    _thd_token.join(_tt);

    let _lv = +!_par.no_toast_msg_flag;
    let _e = s => _messageAction(s, 3, _lv, 0, "both_dash");
    if (_max_token < 0) {
        _e("baiduOcr获取access_token失败");
        return [];
    }
    if (_thd_token.isAlive()) {
        _e("baiduOcr获取access_token超时");
        return [];
    }

    let _max = _par.fetch_times || 1;
    let _max_b = _max;
    let _itv = _par.fetch_interval || 300;
    let _res = [];
    let _thds = [];
    let _allDead = () => _thds.every(thd => !thd.isAlive());

    while (_max--) {
        _thds.push(threads.start(function () {
            let _max_img = 10;
            let _img = _stitchImgs(src);
            while (_max_img--) {
                if (!_img || !_max_img) {
                    return [];
                }
                if (!_isRecycled(_img)) {
                    break;
                }
                _img = _stitchImgs(src);
            }
            let _cur = _max_b - _max;
            let _suffix = _max_b > 1 ? " [" + _cur + "] " : "";
            _debugInfo("stitched image" + _suffix + "准备完毕");

            try {
                let _words = JSON.parse(http.post("https://aip.baidubce.com/" +
                    "rest/2.0/ocr/v1/general_basic?access_token=" + _token, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    image: images.toBase64(_img),
                    image_type: "BASE64",
                }).body.string())["words_result"];
                if (_words) {
                    _debugInfo("数据" + _suffix + "获取成功");
                    _res.push(_words.map(val => val["words"]));
                }
            } catch (e) {
                if (!e.message.match(/InterruptedIOException/)) {
                    throw (e);
                }
            } finally {
                _img.recycle();
                _img = null;
            }
        }));
        sleep(_itv);
    }

    threads.start(function () {
        while (!_allDead()) {
            if (Date.now() >= _tt_ts) {
                _thds.forEach(thd => thd.interrupt());

                let _msg = "baiduOcr获取数据超时";
                let _toast = +!_par.no_toast_msg_flag;
                _messageAction(_msg, 3, _toast, 0, "up_dash");

                if (_res.length) {
                    _messageAction("已获取的数据可能不完整", 3);
                }
                return _showSplitLine("", "dash");
            }
            sleep(500);
        }
    });

    while (1) {
        if (_allDead()) {
            if (!_par.no_toast_msg_flag && _res.length) {
                toast("baiduOcr获取数据完毕");
            }
            return _max_b === 1 ? _res[0] : _res;
        }
        sleep(500);
    }

    // tool function(s) //

    function _stitchImgs(imgs) {
        if (!Array.isArray(imgs)) {
            imgs = [imgs].slice();
        }

        imgs = imgs.map((img) => {
            let type = _getType(img);
            if (type === "UiObject") {
                return _widgetToImage(img);
            }
            if (type === "UiObjectCollection") {
                return _widgetsToImage(img);
            }
            return img;
        }).filter(img => !!img);

        return _stitchImg(imgs);

        // tool function(s) //

        function _getType(o) {
            let matched = o.toString().match(/\w+(?=@)/);
            return matched ? matched[0] : "";
        }

        function _widgetToImage(widget) {
            try {
                // FIXME Nov 11, 2019
                // there is a strong possibility that `widget.bounds()` would throw an exception
                // like "Cannot find function bounds in object xxx.xxx.xxx.UiObject@abcde"
                let [$1, $2, $3, $4] = widget.toString()
                    .match(/.*boundsInScreen:.*\((\d+), (\d+) - (\d+), (\d+)\).*/)
                    .map(x => Number(x)).slice(1);
                return images.clip(_capt, $1, $2, $3 - $1, $4 - $2);
            } catch (e) {
                // Wrapped java.lang.IllegalArgumentException: x + width must be <= bitmap.width()
            }
        }

        function _widgetsToImage(widgets) {
            let imgs = [];
            widgets.forEach((widget) => {
                let img = _widgetToImage(widget);
                img && imgs.push(img);
            });
            return _stitchImg(imgs);
        }

        function _stitchImg(imgs) {
            let _isImgWrap = o => _getType(o) === "ImageWrapper";
            if (_isImgWrap(imgs) && !Array.isArray(imgs)) {
                return imgs;
            }
            if (imgs.length === 1) {
                return imgs[0];
            }
            let _stitched = imgs[0];
            imgs.forEach((img, idx) => {
                if (idx) {
                    _stitched = images.concat(_stitched, img, "BOTTOM");
                }
            });
            return _stitched;
        }
    }

    function _isRecycled(img) {
        if (!img) {
            return true;
        }
        try {
            img.getHeight();
            return false;
        } catch (e) {
            return !!e.message.match(/has been recycled/);
        }
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }

    function showSplitLineRaw(extra, style) {
        console.log((
            style === "dash" ? "- ".repeat(18).trim() : "-".repeat(33)
        ) + (extra || ""));
    }
}

/**
 * Replacement of setInterval() for avoiding its "flaws"
 * @global
 * @param {function(): void} func
 * @param {number} [interval=200]
 * @param {number|function(): boolean} [timeout] -
 * undefined: no timeout limitation;
 * number: stop when timed out;
 * function: stop when function() returns true
 * @example
 * // print "hello" every 1 second for 5 (or 4 sometimes) times
 * setIntervalBySetTimeout(() => {
 *     console.log("hello");
 * }, 1e3, 5e3);
 * @see https://dev.to/akanksha_9560/why-not-to-use-setinterval--2na9
 */
function setIntervalBySetTimeout(func, interval, timeout) {
    let _itv = interval || 200;
    let _init_ts = Date.now();
    let _in_case_ts = _init_ts + 10 * 60e3; // 10 minutes at most
    let _inCase = () => Date.now() < _in_case_ts;
    let _timeoutReached = typeof timeout === "function"
        ? () => _inCase() && timeout()
        : () => _inCase() && Date.now() - _init_ts >= timeout;
    setTimeout(function fn() {
        func();
        _timeoutReached() || setTimeout(fn, _itv);
    }, _itv);
}

/**
 * Returns the class name of an object or any type of param, or, returns if the result is the same as specified
 * @global
 * @param {*} source - any type
 * @param {"Undefined"|"Null"|"Number"|"String"|"Boolean"|"Symbol"|"Object"|"Array"|"Function"|"RegExp"|"Date"|"Promise"|"JavaObject"|"Error"|"JSON"|"Math"|string} [compare] - note that "JSON"|"Promise" may be "Object" as they're internal modules for environments like Node.js, browsers (maybe not for all) and so forth, but external modules for Rhino-based environments like Auto.js.
 * @returns {boolean|string}
 */
function classof(source, compare) {
    let _s = Object.prototype.toString.call(source).slice(8, -1);
    return compare ? _s.toUpperCase() === compare.toUpperCase() : _s;
}

/**
 * Check if device is running compatible (relatively) Auto.js version and android sdk version
 * @global
 * @param {object} [params]
 * @param {boolean} [params.debug_info_flag]
 * @returns {{cur_autojs_name: string, cur_autojs_pkg: string, project_ver: string|number|void, autojs_ver: string|void, sdk_ver: number}}
 */
function checkSdkAndAJVer(params) {
    let $_app = {};
    let _par = params || {};

    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _debugInfo = (m, fg) => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, fg, _par.debug_info_flag);

    let _aj_pkg = $_app.cur_autojs_pkg = context.packageName;
    let _aj_ver = _getVerName(_aj_pkg) || "0";
    let _aj_pro_suff = _aj_pkg.match(/pro/) ? " Pro" : "";
    $_app.cur_autojs_name = "Auto.js" + _aj_pro_suff;
    $_app.autojs_ver = _aj_ver;
    $_app.project_ver = _getProjectVer();

    _chkSdk();
    _chkVer();

    return $_app;

    // tool function(s) //

    function _getVerName(pkg) {
        try {
            let _pkg_mgr = context.getPackageManager();
            let _pkgs = _pkg_mgr.getInstalledPackages(0).toArray();
            for (let i in _pkgs) {
                if (_pkgs.hasOwnProperty(i)) {
                    let _pkg = _pkgs[i];
                    if (_pkg.packageName.toString() === pkg) {
                        return _pkg["versionName"];
                    }
                }
            }
        } catch (e) {
            console.warn(e);
        }
    }

    function _getProjectVer() {
        try {
            return "v" + files.read(
                "./Ant_Forest_Launcher.js"
            ).match(
                /version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/
            )[0].slice(8);
        } catch (e) {
            return 0;
        }
    }

    function _chkSdk() {
        // let sdk_ver = +shell("getprop ro.build.version.sdk").result;
        let sdk_ver = android.os.Build.VERSION.SDK_INT;
        $_app.sdk_ver = sdk_ver;
        if (sdk_ver < 24) {
            _messageAction("脚本无法继续", 4, 0, 0, "up");
            _messageAction("安卓系统版本低于7.0", 8, 1, 1, 1);
        }
    }

    function _chkVer() {
        let _bugs_map = {
            failed: "版本信息获取失败",
            ab_cwd: "cwd()方法功能异常",
            ab_engines_setArguments: "engines.setArguments()功能异常",
            ab_find_forEach: "UiSelector.find().forEach()方法功能异常",
            ab_floaty: "Floaty模块异常",
            ab_floaty_rawWindow: "floaty.rawWindow()功能异常",
            ab_relative_path: "相对路径功能异常",
            ab_setGlobalLogConfig: "console.setGlobalLogConfig()功能异常",
            ab_SimpActAuto: "SimpleActionAutomator模块异常",
            ab_inflate: "ui.inflate()方法功能异常",
            ab_uiSelector: "UiSelector模块功能异常",
            ab_ui_layout: "UI页面布局异常",
            crash_autojs: "脚本运行后导致Auto.js崩溃",
            crash_ui_call_ui: "ui脚本调用ui脚本会崩溃",
            crash_ui_settings: "图形配置页面崩溃",
            dislocation_floaty: "Floaty模块绘制存在错位现象",
            dialogs_event: "Dialogs模块事件失效",
            dialogs_not_responded: "无法响应对话框点击事件",
            forcibly_update: "强制更新",
            na_login: "无法登陆Auto.js账户",
            press_block: "press()方法时间过短时可能出现阻塞现象",
            un_cwd: "不支持cwd()方法及相对路径",
            un_engines: "不支持Engines模块",
            un_execArgv: "不支持Engines模块的execArgv对象",
            un_inflate: "不支持ui.inflate()方法",
            un_relative_path: "不支持相对路径",
            un_runtime: "不支持runtime参数",
            un_view_bind: "不支持view对象绑定自定义方法",
            not_full_function: "此版本未包含所需全部功能",
        };

        let _bug_chk_res = _chkBugs(_aj_ver);
        if (_bug_chk_res === 0) {
            return _debugInfo("Bug版本检查: 正常");
        }
        if (_bug_chk_res === "") {
            return _debugInfo("Bug版本检查: 未知");
        }
        let _bug_chk_cnt = _bug_chk_res.map(bug_code => (
            "\n-> " + (_bugs_map[bug_code] || "/* 无效的Bug描述 */"))
        );

        _debugInfo("Bug版本检查: 确诊");

        alert("\n" +
            "此项目无法正常运行\n" +
            "请更换Auto.js版本\n\n" +
            "当前版本:\n" +
            "-> " + (_aj_ver || "/* 版本检测失败 */") + "\n\n" +
            "异常详情:" + _bug_chk_cnt.join("") + "\n\n" +
            "在项目简介中查看支持版本\n" +
            "或直接尝试 v4.1.1 Alpha2"
        );
        exit();

        // tool function(s) //

        /**
         * @param {string} ver
         * @return {string[]|number|string} -- strings[]: bug codes; 0: normal; "": unrecorded
         */
        function _chkBugs(ver) {
            // version ∈ 4.1.1
            // version === Pro 8.+
            // version === Pro 7.0.0-(4|6) || version === Pro 7.0.2-4
            // version === Pro 7.0.3-7 || version === Pro 7.0.4-1
            if (ver.match(/^(4\.1\.1.+)$/) ||
                ver.match(/^Pro 8\.\d.+$/) ||
                ver.match(/^Pro 7\.0\.((0-[46])|(2-4)|(3-7)|(4-1))$/)
            ) {
                return 0; // known normal
            }

            // 4.1.0 Alpha3 <= version <= 4.1.0 Alpha4
            if (ver.match(/^4\.1\.0 Alpha[34]$/)) {
                return ["ab_SimpActAuto", "dialogs_not_responded"];
            }

            // version === 4.1.0 Alpha(2|5)?
            if (ver.match(/^4\.1\.0 Alpha[25]$/)) {
                return ["dialogs_not_responded"];
            }

            // 4.0.x versions
            if (ver.match(/^4\.0\./)) {
                return ["dialogs_not_responded", "not_full_function"];
            }

            // version === Pro 7.0.0-(1|2)
            if (ver.match(/^Pro 7\.0\.0-[12]$/)) {
                return ["ab_relative_path"];
            }

            // version === Pro 7.0.0-7 || version === Pro 7.0.1-0 || version === Pro 7.0.2-(0|3)
            if (ver.match(/^Pro 7\.0\.((0-7)|(1-0)|(2-[03]))$/)) {
                return ["crash_autojs"];
            }

            // version >= 4.0.2 Alpha7 || version === 4.0.3 Alpha([1-5]|7)?
            if (ver.match(/^((4\.0\.2 Alpha([7-9]|\d{2}))|(4\.0\.3 Alpha([1-5]|7)?))$/)) {
                return ["dislocation_floaty", "ab_inflate", "not_full_function"];
            }

            // version >= 3.1.1 Alpha5 || version -> 4.0.0/4.0.1 || version <= 4.0.2 Alpha6
            if (ver.match(/^((3\.1\.1 Alpha[5-9])|(4\.0\.[01].+)|(4\.0\.2 Alpha[1-6]?))$/)) {
                return ["un_execArgv", "ab_inflate", "not_full_function"];
            }

            // 3.1.1 Alpha3 <= version <= 3.1.1 Alpha4:
            if (ver.match(/^3\.1\.1 Alpha[34]$/)) {
                return ["ab_inflate", "un_engines", "not_full_function"];
            }

            // version >= 3.1.0 Alpha6 || version <= 3.1.1 Alpha2
            if (ver.match(/^((3\.1\.0 (Alpha[6-9]|Beta))|(3\.1\.1 Alpha[1-2]?))$/)) {
                return ["un_inflate", "un_engines", "not_full_function"];
            }

            // version >= 3.0.0 Alpha42 || version ∈ 3.0.0 Beta[s] || version <= 3.1.0 Alpha5
            if (ver.match(/^((3\.0\.0 ((Alpha(4[2-9]|[5-9]\d))|(Beta\d?)))|(3\.1\.0 Alpha[1-5]?))$/)) {
                return ["un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // 3.0.0 Alpha37 <= version <= 3.0.0 Alpha41
            if (ver.match(/^3\.0\.0 Alpha(3[7-9]|4[0-1])$/)) {
                return ["ab_cwd", "un_relative_path", "un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // 3.0.0 Alpha21 <= version <= 3.0.0 Alpha36
            if (ver.match(/^3\.0\.0 Alpha(2[1-9]|3[0-6])$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // version <= 3.0.0 Alpha20
            if (ver.match(/^3\.0\.0 Alpha([1-9]|1\d|20)?$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "crash_ui_settings", "not_full_function"];
            }

            switch (ver) {
                case "0":
                    return ["failed"];
                case "4.0.3 Alpha6":
                    return ["ab_floaty", "ab_inflate", "not_full_function"];
                case "4.0.4 Alpha":
                    return ["dislocation_floaty", "un_view_bind", "not_full_function"];
                case "4.0.4 Alpha3":
                    return ["dislocation_floaty", "ab_ui_layout", "not_full_function"];
                case "4.0.4 Alpha4":
                    return ["ab_find_forEach", "not_full_function"];
                case "4.0.4 Alpha12":
                    return ["un_execArgv", "not_full_function"];
                case "4.0.5 Alpha":
                    return ["ab_uiSelector", "not_full_function"];
                case "Pro 7.0.0-0":
                    return ["na_login"];
                case "Pro 7.0.0-3":
                    return ["crash_ui_call_ui"];
                case "Pro 7.0.0-5":
                    return ["forcibly_update"];
                case "Pro 7.0.3-1":
                    return ["dialogs_event"];
                case "Pro 7.0.3-4":
                    return ["ab_setGlobalLogConfig"];
                case "Pro 7.0.3-5":
                    return ["ab_floaty_rawWindow"];
                case "Pro 7.0.3-6":
                    return ["ab_engines_setArguments", "press_block"];
                case "Pro 7.0.4-0":
                    return ["crash_ui_settings"];
                default:
                    return ""; // unrecorded version
            }
        }
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }
}

/**
 * Wait until a generater, which generates variable values, is stable.
 * And returns the final stable value.
 * 1. Wait until generator returns different values (not longer than generator_timeout)
 * 2. Wait until changing value is stable (not longer than stable_threshold each time)
 * @param {function} num_generator
 * @param {*} [init_value=NaN]
 * @param {number} [generator_timeout=3000]
 * @param {number} [stable_threshold=500]
 * @example
 * let a = ["John", "Zach", "Cole", "Eric"];
 * toastLog("Rolling the dice...");
 * toastLog(a[stabilizer(() => Math.floor(Math.random() * a.length))] + " is the lucky one");
 * @returns {number}
 */
function stabilizer(num_generator, init_value, generator_timeout, stable_threshold) {
    let _init = init_value === undefined ? NaN : Number(init_value);
    let _cond_generator = () => {
        let _num = Number(num_generator());
        _init = isNaN(_init) ? _num : _init;
        return _init !== _num;
    };
    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );

    if (!_waitForAction(_cond_generator, generator_timeout || 3e3)) {
        return NaN;
    }

    let _old = _init, _tmp = NaN;
    let _cond_stable = () => _old !== (_tmp = num_generator());
    let _limit = 60e3; // 1 min
    let _start_ts = Date.now();

    while (_waitForAction(_cond_stable, stable_threshold || 500)) {
        _old = _tmp;
        if (Date.now() - _start_ts > _limit) {
            throw Error("stabilizer() has reached max limitation: " + _limit + "ms");
        }
    }

    return _old;

    // raw function(s) //

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }
}