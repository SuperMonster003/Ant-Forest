global.$$impeded = (name) => {
    let _$$flag = global.$$flag;
    if (_$$flag && _$$flag.glob_e_trig_counter) {
        if (name) {
            messageAction("检测到全局事件触发信号", 1, 0, 0, "up_dash");
            messageAction(name + "被迫阻塞", 1, 0, 0, "dash");
        }
        while (_$$flag.glob_e_trig_counter) sleep(200);
        if (name) {
            messageAction("全局事件触发信号全部解除", 1, 0, 0, "up_dash");
            messageAction(name + "解除阻塞", 1, 0, 0, "dash");
        }
    }
    return true;
};

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
    alertTitle: alertTitle,
    alertContent: alertContent,
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
};

// tool function(s) //

/**
 * Returns both app name and app package name with either one input
 * @param name {string} - app name or app package name
 * @param {object} [params]
 * @param {boolean} [params.hard_refresh=false] - get app information from global cache by default
 * @example
 * parseAppName("Alipay");
 * parseAppName("com.eg.android.AlipayGphone");
 * @return {{app_name: string, package_name: string}}
 */
function parseAppName(name, params) {
    if (!name) return {app_name: "", package_name: ""};

    global["_$_app_name_cache"] = global["_$_app_name_cache"] || {};
    global["_$_app_pkg_name_cache"] = global["_$_app_pkg_name_cache"] || {};

    params = params || {};
    let hard_refresh = params.hard_refresh || false;

    let checkCache = (cacheObj) => !hard_refresh && name in cacheObj ? cacheObj[name] : null;

    let _app_name = checkCache(global["_$_app_name_cache"]) || !name.match(/.+\..+\./) && app.getPackageName(name) && name;
    let _package_name = checkCache(global["_$_app_pkg_name_cache"]) || app.getAppName(name) && name;

    _app_name = _app_name || _package_name && app.getAppName(_package_name);
    _package_name = _package_name || _app_name && app.getPackageName(_app_name);

    return {
        app_name: global["_$_app_name_cache"][_package_name] = _app_name,
        package_name: global["_$_app_pkg_name_cache"][_app_name] = _package_name,
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
 * @param {object} [params]
 * @param {boolean} [params.debug_info_flag]
 * @example
 * // app name
 * getVerName("Alipay");
 * // shortcut
 * getVerName("self");
 * // shortcut
 * getVerName("autojs");
 * // shortcut
 * getVerName("autojs pro");
 * // app name
 * getVerName("Auto.js");
 * // app package name
 * getVerName("org.autojs.autojs");
 * // shortcut
 * getVerName("current autojs");
 * @param name
 * @return {null|string}
 */
function getVerName(name, params) {
    let _par = params || {};

    let _parseAppName = typeof parseAppName === "undefined"
        ? parseAppNameRaw
        : parseAppName;
    let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined"
        ? debugInfoRaw
        : debugInfo)(_msg, _info_flag, _par.debug_info_flag);

    let _name = _handleName(name);
    let _pkg_name = _parseAppName(_name).package_name;
    if (_pkg_name) {
        try {
            let _installed_pkgs = context.getPackageManager()
                .getInstalledPackages(0).toArray();
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
    return null;

    // tool function(s) //

    function _handleName(name) {
        if (name.match(/^[Aa]uto\.?js/)) return "org.autojs.autojs" + (name.match(/[Pp]ro$/) ? "pro" : "");
        if (name === "self") return currentPackage();
        if (name.match(/^[Cc]urrent.*[Aa]uto.*js/)) return context.packageName;
        return name;
    }

    // raw function(s) //

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
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
    let _messageAction = typeof messageAction === "undefined"
        ? messageActionRaw
        : messageAction;
    let _debugInfo = (m, fg) => (typeof debugInfo === "undefined"
        ? debugInfoRaw
        : debugInfo)(m, fg, _par.debug_info_flag);
    let _waitForAction = typeof waitForAction === "undefined"
        ? waitForActionRaw
        : waitForAction;
    let _killThisApp = typeof killThisApp === "undefined"
        ? killThisAppRaw
        : killThisApp;

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
            _messageAction('打开"' + _app_name + '"失败', 9, 1, 0, 1);
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
        _messageAction('"' + _name + '"初始状态准备失败', 9, 1, 0, 1);
    }
    _debugInfo('"' + _name + '"初始状态准备完毕');

    return true;

    // tool function(s) //

    function _setAppName() {
        if (typeof _trig === "string") {
            _app_name = !_trig.match(/.+\..+\./) && app.getPackageName(_trig) && _trig;
            _pkg_name = app.getAppName(_trig) && _trig;
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
        let _waitForAction = typeof waitForAction === "undefined" ?
            waitForActionRaw :
            waitForAction;
        let _debugInfo = (m, fg) => (typeof debugInfo === "undefined" ?
            debugInfoRaw :
            debugInfo)(m, fg, _par.debug_info_flag);
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
                _W = +_win_svc_disp.getWidth();
                _H = +_win_svc_disp.getHeight();
                if (!(_W * _H)) {
                    throw Error();
                }

                // left: 1, right: 3, portrait: 0 (or 2 ?)
                let _SCR_O = +_win_svc_disp.getOrientation();
                let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                let _MAX = +_win_svc_disp.maximumSizeDimension;

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
                try {
                    _W = +device.width;
                    _H = +device.height;
                    return _W && _H && {
                        WIDTH: _W,
                        HEIGHT: _H,
                        USABLE_HEIGHT: Math.trunc(_H * 0.9),
                    };
                } catch (e) {
                }
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

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
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
        package_name = package_name || curerntPackage();
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

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _info_flag, _par.debug_info_flag);
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

    let _shell_acceptable = typeof _par.shell_acceptable === "undefined" && true || _par.shell_acceptable;
    let _keycode_back_acceptable = typeof _par.keycode_back_acceptable === "undefined" && true || _par.keycode_back_acceptable;
    let _keycode_back_twice = _par.keycode_back_twice || false;
    let _condition_success = _par.condition_success || (() => {
        let samePkgName = () => currentPackage() === _package_name;
        return _waitForAction(() => !samePkgName(), 12e3) && !_waitForAction(samePkgName, 3, 150);
    });

    let _shell_result = false;
    let _shell_start_timestamp = new Date().getTime();
    let _shell_max_wait_time = _par.shell_max_wait_time || 10e3;
    if (_shell_acceptable) {
        try {
            _shell_result = !shell("am force-stop " + _package_name, true).code;
        } catch (e) {
            _debugInfo('shell()方法强制关闭"' + _app_name + '"失败');
        }
    } else _debugInfo("参数不接受shell()方法");

    if (!_shell_result) {
        if (_keycode_back_acceptable) {
            return _tryMinimizeApp();
        } else {
            _debugInfo("参数不接受模拟返回方法");
            _messageAction('关闭"' + _app_name + '"失败', 4, 1);
            return _messageAction("无可用的应用关闭方式", 4, 0, 1);
        }
    }

    if (_waitForAction(_condition_success, _shell_max_wait_time)) {
        _debugInfo('shell()方法强制关闭"' + _app_name + '"成功');
        return _debugInfo(">关闭用时: " + (new Date().getTime() - _shell_start_timestamp) + "毫秒") || true;
    } else {
        _messageAction('关闭"' + _app_name + '"失败', 4, 1);
        _debugInfo(">关闭用时: " + (new Date().getTime() - _shell_start_timestamp) + "毫秒");
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
            if (_waitForAction(_condition_success, 2e3)) break;
        }
        if (_max_try_times_minimize < 0) {
            _debugInfo("最小化应用尝试已达: " + _max_try_times_minimize_backup + "次");
            _debugInfo("重新仅模拟返回键尝试最小化");
            _max_try_times_minimize = 8;
            while (_max_try_times_minimize--) {
                ~back() && back();
                _keycode_back_twice && ~sleep(200) && back();
                if (_waitForAction(_condition_success, 2e3)) break;
            }
            if (_max_try_times_minimize < 0) return _messageAction("最小化当前应用失败", 4, 1);
        }
        _debugInfo("最小化应用成功");
        return true;
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
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

    function clickActionRaw(kw) {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _kw = classof(kw) === "Array" ? kw[0] : kw;
        let _key_w = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
        if (_key_w) {
            let _bounds = _key_w.bounds();
            click(_bounds.centerX(), _bounds.centerY());
            return true;
        }
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

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _info_flag, _params.debug_info_flag);

    let _my_engine = engines.myEngine();
    let _my_engine_id = _my_engine.id;

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
        arguments: Object.assign({}, _params, {
            max_restart_engine_times: _max_restart_engine_times - 1,
            max_restart_engine_times_backup: _max_restart_engine_times_backup,
            instant_run_flag: _params.instant_run_flag,
        }),
    });
    _debugInfo("强制停止旧引擎任务");
    // _my_engine.forceStop();
    engines.all().filter(e => e.id === _my_engine_id).forEach(e => e.forceStop());
    return true;

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
    }
}

/**
 * Run a javascript file via activity by current running Auto.js
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
 *     -- /up|-1/ - show a line before message <br>
 *     -- /both/ - show a line before and another one after message <br>
 *     -- /both_n/ - show a line before and another one after message, then print a blank new line
 * @param {object} [params] reserved
 * @example
 * messageAction("hello"); // nothing will be printed in console
 * messageAction("hello", 1);
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
 * @return {boolean} - if msg_level including 3 or 4, then return false; anything else, including undefined, return true
 **/
function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
    let $_flag = global.$$flag = global.$$flag || {};

    if ($_flag.no_msg_act_flag) return !(msg_level in {3: 1, 4: 1});

    let _msg = msg || "";
    if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
        return messageAction("[ " + msg + " ]", 1, if_toast, if_arrow, if_split_line, params);
    }

    let _msg_lv = typeof msg_level === "number" ? msg_level : -1;
    let _if_toast = if_toast || false;
    let _if_arrow = if_arrow || false;
    let _if_spl_ln = if_split_line || false;
    _if_spl_ln = ~if_split_line ? _if_spl_ln : "up"; // -1 -> "up"

    let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;

    if (_if_toast) toast(_msg);

    let _spl_ln_style = "solid";
    let _saveLnStyle = () => $_flag.last_cnsl_spl_ln_type = _spl_ln_style;
    let _loadLnStyle = () => $_flag.last_cnsl_spl_ln_type;
    let _clearLnStyle = () => delete $_flag.last_cnsl_spl_ln_type;
    let _matchLnStyle = () => _loadLnStyle() === _spl_ln_style;

    if (typeof _if_spl_ln === "string") {
        if (_if_spl_ln.match(/dash/)) _spl_ln_style = "dash";
        if (_if_spl_ln.match(/both|up/)) {
            if (!_matchLnStyle()) _showSplitLine("", _spl_ln_style);
            if (_if_spl_ln.match(/_n|n_/)) _if_spl_ln = "\n";
            else if (_if_spl_ln.match(/both/)) _if_spl_ln = 1;
            else if (_if_spl_ln.match(/up/)) _if_spl_ln = 0;
        }
    }

    _clearLnStyle();

    if (_if_arrow) {
        if (_if_arrow > 10) {
            console.warn('-> "if_arrow"参数大于10');
            _if_arrow = 10;
        }
        _msg = "> " + _msg;
        for (let i = 0; i < _if_arrow; i += 1) _msg = "-" + _msg;
    }

    let _exit_flag = false;
    let _throw_flag = false;
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
            _throw_flag = true;
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
        if (!_spl_ln_extra.match(/\n/)) _saveLnStyle();
        _showSplitLine(_spl_ln_extra, _spl_ln_style);
    }

    if (_throw_flag) {
        ui.post(function () {
            throw ("FORCE_STOP");
        });
    }

    if (_exit_flag || _throw_flag) {
        exit();
        sleep(3e3);
    }

    return !(_msg_lv in {3: 1, 4: 1});

    // raw function(s) //

    function showSplitLineRaw(extra_str, style) {
        let _extra_str = extra_str || "";
        let _split_line = "";
        if (style === "dash") {
            for (let i = 0; i < 17; i += 1) _split_line += "- ";
            _split_line += "-";
        } else {
            for (let i = 0; i < 33; i += 1) _split_line += "-";
        }
        return ~console.log(_split_line + _extra_str);
    }
}

/**
 * Show a split line in console (32 bytes)
 * @param {string} [extra_str]
 * <br>
 *     -- "\n" - a new blank line after split line <br>
 *     -- *OTHER* - unusual use
 * @param {string} [style]
 * <br>
 *     -- *DEFAULT* - "--------" - 32 bytes <br>
 *     -- "dash" - "- - - - - " - 32 bytes
 * @param {object} [params] - reserved
 * @example
 * showSplitLine();
 * showSplitLine("\n");
 * showSplitLine("", "dash");
 * @return {boolean} - always true
 */
function showSplitLine(extra_str, style, params) {
    let _extra_str = extra_str || "";
    let _split_line = "";
    if (style === "dash") {
        for (let i = 0; i < 17; i += 1) _split_line += "- ";
        _split_line += "-";
    } else {
        for (let i = 0; i < 33; i += 1) _split_line += "-";
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
 * @param {number} [timeout_or_times=10e3]
 * <br>
 *     -- *DEFAULT* - take as timeout (default: 10 sec) <br>
 *     -- 0|Infinity - always wait until f is true <br>
 *     -- less than 100 - take as times
 * @param {number} [interval=200]
 * @param {object} [params]
 * @param {boolean} [params.no_impeded]
 * @example
 * waitForAction([() => text("Settings").exists(), () => text("Exit").exists(), "or"], 500, 80);
 * waitForAction([text("Settings"), text("Exit"), () => !text("abc").exists(), "and"], 2e3, 50);
 * let kw_settings = text("Settings");
 * let condition = () => kw_settings.exists();
 * // waitForAction(kw_settings, 1e3);
 * // waitForAction(condition, 1e3);
 * waitForAction(() => condition()), 1e3);
 * @return {boolean} - if not timed out
 */
function waitForAction(f, timeout_or_times, interval, params) {
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === "function" && $$impeded(waitForAction.name);

    if (typeof timeout_or_times !== "number") {
        timeout_or_times = 10e3;
    }
    let _times = timeout_or_times;
    if (_times <= 0 || !isFinite(_times) || isNaN(_times) || _times > 100) {
        _times = Infinity;
    }
    let _timeout = Infinity;
    if (timeout_or_times > 100) {
        _timeout = timeout_or_times;
    }
    let _interval = interval || 200;
    if (_interval >= _timeout) {
        _times = 1;
    }

    let _start_ts = Date.now();
    while (!_checkF(f) && --_times) {
        if (Date.now() - _start_ts > _timeout) {
            return false; // timed out
        }
        sleep(_interval);
    }
    return _times > 0;

    // tool function(s) //

    function _checkF(f) {
        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _messageAction = typeof messageAction === "undefined"
            ? messageActionRaw
            : messageAction;

        if (typeof f === "function") {
            return f();
        }
        if (_classof(f) === "JavaObject") {
            return f.toString().match(/UiObject/) ? f : f.exists();
        }
        if (_classof(f) === "Array") {
            let _arr = f;
            let _len = _arr.length;
            let _logic = "all";
            if (typeof _arr[_len - 1] === "string") {
                _logic = _arr.pop();
            }
            if (_logic.match(/^(or|one)$/)) {
                _logic = "one";
            }
            for (let i = 0; i < _len; i += 1) {
                let _ele = _arr[i];
                if (!(typeof _ele).match(/function|object/)) {
                    _messageAction("数组参数中含不合法元素", 9, 1, 0, 1);
                }
                if (_logic === "all" && !_checkF(_ele)) {
                    return false;
                }
                if (_logic === "one" && _checkF(_ele)) {
                    return true;
                }
            }
            return _logic === "all";
        }
        _messageAction('"waitForAction"传入f参数不合法\n\n' + f.toString() + '\n', 9, 1, 0, 1);
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }
}

/**
 * Click a certain UiObject or coordinate by click(), press() or UiObject.click()
 * @param {object|array} f - JavaObject or RectBounds or coordinates Array
 * <br>
 *     -- text("abc").desc("def") <br>
 *     -- text("abc").desc("def").findOnce()[.parent()] <br>
 *     -- text("abc").desc("def").findOnce()[.parent()].bounds() <br>
 *     -- [106, 39]
 * @param {?string} [strategy] - decide the way of click
 * <br>
 *     -- "click"|c|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- "press|p" - press(coord_A, coord_B, press_time); <br>
 *     -- "widget|w" - text("abc").click(); - not available for Bounds or CoordsArray
 * @param {object|string} [params]
 * @param {number=1} [params.press_time] - only effective for "press" strategy
 * @param {string|function} [params.condition_success=()=>true]
 * <br>
 *     -- *DEFAULT* - () => true <br>
 *     -- /disappear(ed)?/ - (f) => !f.exists(); - disappeared from the whole screen <br>
 *     -- /disappear(ed)?.*in.?place/ - (f) => #some widget info changed#; - disappeared in place <br>
 *     -- func - (f) => func(f);
 * @param {number} [params.check_time_once=500]
 * @param {number} [params.max_check_times=0]
 * <br>
 *     -- if condition_success is specified, then default value of max_check_times will be 3 <br>
 *     --- example: (this is not usage) <br>
 *     -- while (!waitForAction(condition_success, check_time_once) && max_check_times--) ; <br>
 *     -- return max_check_times >= 0;
 * @param {number|array} [params.padding]
 * <br>
 *     -- ["x", -10]|[-10, 0] - x=x-10; <br>
 *     -- ["y", 69]|[0, 69]|[69]|69 - y=y+69;
 * @see waitForAction
 * @example
 * text("Settings").find().forEach(w => clickAction(w));
 * text("Settings").find().forEach(w => clickAction(w.bounds()));
 * clickAction(text("Settings"), "widget", {
 *     condition_success: "disappeared in place",
 *     max_check_times: 5,
 * });
 * clickAction(text("Settings"), "press", {
 *     // padding: ["x", +15],
 *     // padding: ["y", -7],
 *     // padding: [+15, -7],
 *     padding: -7,
 * });
 * @return {boolean} if reached max check time;
 */
function clickAction(f, strategy, params) {
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === "function" && $$impeded(clickAction.name);

    if (typeof f === "undefined" || f === null) {
        return false;
    }

    let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
    let $_str = o => typeof o === "string";
    let $_und = o => typeof o === "undefined";
    let $_num = o => typeof o === "number";
    let _messageAction = typeof messageAction === "undefined"
        ? messageActionRaw
        : messageAction;
    let _waitForAction = typeof waitForAction === "undefined"
        ? waitForActionRaw
        : waitForAction;

    /**
     * @type {string} - "Bounds"|"UiObject"|"UiSelector"|"CoordsArray"|"ObjXY"|"Points"
     */
    let _type = _checkType(f);
    let _padding = _checkPadding(_par.padding);
    if (!(typeof strategy).match(/string|undefined/)) {
        _messageAction("clickAction()的策略参数无效", 8, 1, 0, 1);
    }
    let _strategy = (strategy || "click").toString();
    let _widget_id = 0;
    let _widget_parent_id = 0;

    let _cond_succ = _par.condition_success;

    let _chk_t_once = _par.check_time_once || 500;
    let _max_chk_cnt = _par.max_check_times || 0;
    if (!_max_chk_cnt && _cond_succ) {
        _max_chk_cnt = 3;
    }

    if ($_str(_cond_succ) && _cond_succ.match(/disappear/)) {
        _cond_succ = () => (
            _type.match(/^Ui/) ? _checkDisappearance() : true
        );
    } else if ($_und(_cond_succ)) {
        _cond_succ = () => true;
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
            let _w = f.findOnce();
            if (!_w) {
                return;
            }
            try {
                _widget_id = _w.toString().match(/@\w+/)[0].slice(1);
            } catch (e) {
                _widget_id = 0;
            }
            if (_strategy.match(/^w(idget)?$/) && _w.clickable() === true) {
                return _w.click();
            }
            let _bnd = _w.bounds();
            _x = _bnd.centerX();
            _y = _bnd.centerY();
        } else if (_type === "UiObject") {
            try {
                _widget_parent_id = f.parent().toString().match(/@\w+/)[0].slice(1);
            } catch (e) {
                _widget_parent_id = 0;
            }
            if (_strategy.match(/^w(idget)?$/) && f.clickable() === true) {
                return f.click();
            }
            let _bnd = f.bounds();
            _x = _bnd.centerX();
            _y = _bnd.centerY();
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
            if (Array.isArray(f)) {
                [_x, _y] = f;
            } else {
                [_x, _y] = [f.x, f.y];
            }
        }
        if (isNaN(_x) || isNaN(_y)) {
            _messageAction("clickAction()内部坐标值无效", 4, 1);
            _messageAction("(" + _x + ", " + _y + ")", 8, 0, 1, 1);
        }
        _x += _padding.x;
        _y += _padding.y;

        _strategy.match(/^p(ress)?$/)
            ? press(_x, _y, _par.press_time || 1)
            : click(_x, _y);
    }

    function _checkType(f) {
        let _type_f = _chkJavaO(f) || _chkCoords(f) || _chkObjXY(f);
        if (!_type_f) {
            _messageAction("不支持的clickAction()f参数类型: " + _classof(f), 8, 1, 0, 1);
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

    function _checkPadding(arr) {
        if (!arr) {
            return {x: 0, y: 0};
        }

        let _coords = [];
        if ($_num(arr)) {
            _coords = [0, arr];
        } else if (_classof(arr) !== "Array") {
            return _messageAction(
                "clickAction()坐标偏移参数类型未知", 8, 1, 0, 1
            );
        }

        let _arr_len = arr.length;
        if (_arr_len === 1) {
            _coords = [0, arr[0]];
        } else if (_arr_len === 2) {
            let _par0 = arr[0];
            if (_par0 === "x") {
                _coords = [arr[1], 0];
            } else if (_par0 === "y") {
                _coords = [0, arr[1]];
            } else {
                _coords = arr;
            }
        } else {
            return _messageAction(
                "clickAction()坐标偏移参数数组个数不合法", 8, 1, 0, 1
            );
        }

        let [_x, _y] = [+_coords[0], +_coords[1]];
        if (!isNaN(_x) && !isNaN(_y)) {
            return {x: _x, y: _y};
        }
        _messageAction("clickAction()坐标偏移计算值不合法", 8, 1, 0, 1);
    }

    function _checkDisappearance() {
        try {
            if (_type === "UiSelector") {
                let _w = f.findOnce();
                if (!_w) {
                    return true;
                }
                if (!_par.condition_success.match(/in.?place/)) {
                    return !_w;
                }
                let _mch = _w.toString().match(/@\w+/);
                return _mch[0].slice(1) !== _widget_id;
            }
            if (_type === "UiObject") {
                let _w_parent = f.parent();
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
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
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
}

/**
 * Wait for an UiObject showing up and click it
 * -- This is a combination function which means independent use is not recommended
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
    if (!f) return false;

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

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
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

    function clickActionRaw(kw) {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _kw = classof(kw) === "Array" ? kw[0] : kw;
        let _key_w = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
        if (_key_w) {
            let _bounds = _key_w.bounds();
            click(_bounds.centerX(), _bounds.centerY());
            return true;
        }
    }
}

/**
 * Refresh screen objects or current package by a certain strategy
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

    let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _info_flag, _params.debug_info_flag);
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _strategy = strategy || "";

    if (_strategy.match(/objects?|alert/)) {
        descMatches(/.*/).exists(); // useful or useless ?

        let alert_text = _params.custom_alert_text || "Alert for refreshing objects";
        let kw_alert_text = text(alert_text);
        let refreshing_obj_thread = threads.start(function () {
            kw_alert_text.findOne(1e3);
            let kw_ok_btn = textMatches(/OK|确./); // may 确认 or something else
            kw_ok_btn.findOne(2e3).click();
        });
        let shutdownThread = () => {
            refreshing_obj_thread.isAlive() && refreshing_obj_thread.interrupt();
            if (kw_alert_text.exists()) back();
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

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
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
 * @param f {object} - JavaObject
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

    let _swipe_interval = _par.swipe_interval || 150;
    let _max_swipe_times = _par.max_swipe_times || 12;
    let _swipe_time = _par.swipe_time || 150;
    let _condition_meet_sides = parseInt(_par.condition_meet_sides);
    if (_condition_meet_sides !== 1 || _condition_meet_sides !== 2) _condition_meet_sides = 1;

    if (!global.WIDTH || !global.HEIGHT) {
        let _data = getDisplayRaw();
        global.WIDTH = _data.WIDTH;
        global.HEIGHT = _data.HEIGHT;
    }

    let _swipe_area = _setAreaParams(_par.swipe_area, [0.1, 0.1, 0.9, 0.9]);
    let _aim_area = _setAreaParams(_par.aim_area, [0, 0, -1, -1]);
    let _swipe_direction = _setSwipeDirection();
    let _ret = true;

    if (!_swipe_direction || _success()) {
        return _ret;
    }
    while (_max_swipe_times--) {
        if (_swipeAndCheck()) {
            break;
        }
    }
    if (_max_swipe_times >= 0) {
        return _ret;
    }

    // tool function(s) //

    function isImageType(x) {
        return typeof x === "object"
            && x["getClass"]
            && !!x.toString().match(/ImageWrapper/);
    }

    function _setSwipeDirection() {
        let _swp_drctn = _par.swipe_direction;
        if (typeof _swp_drctn === "string" && _swp_drctn !== "auto") {
            if (_swp_drctn.match(/$[Lf](eft)?^/)) {
                return "left";
            }
            if (_swp_drctn.match(/$[Rr](ight)?^/)) {
                return "right";
            }
            if (_swp_drctn.match(/$[Dd](own)?^/)) {
                return "down";
            }
            return "up";
        }
        if (isImageType(f)) {
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
        sleep(_swipe_interval);
        if (_success()) {
            return true;
        }

        // tool function(s) //

        function _swipe() {
            let {cl, cr, ct, cb} = _swipe_area;
            let [_cl, _cr, _ct, _cb] = [cl, cr, ct, cb];
            if (_swipe_direction === "down") {
                return swipe(_ct.x, _ct.y, _cb.x, _cb.y, _swipe_time);
            }
            if (_swipe_direction === "left") {
                return swipe(_cr.x, _cr.y, _cl.x, _cl.y, _swipe_time);
            }
            if (_swipe_direction === "right") {
                return swipe(_cl.x, _cl.y, _cr.x, _cr.y, _swipe_time);
            }
            return swipe(_cb.x, _cb.y, _ct.x, _ct.y, _swipe_time);
        }
    }

    function _success() {
        return isImageType(f) ? _chk_img() : _chk_widget();

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
            if (_condition_meet_sides < 2) {
                if (_swipe_direction === "up") {
                    return _top < _aim_area.b;
                }
                if (_swipe_direction === "down") {
                    return _bottom > _aim_area.t;
                }
                if (_swipe_direction === "left") {
                    return _left < _aim_area.r;
                }
                if (_swipe_direction === "right") {
                    return _right < _aim_area.l;
                }
            } else {
                if (_swipe_direction === "up") {
                    return _bottom < _aim_area.b;
                }
                if (_swipe_direction === "down") {
                    return _top > _aim_area.t;
                }
                if (_swipe_direction === "left") {
                    return _right < _aim_area.r;
                }
                if (_swipe_direction === "right") {
                    return _left < _aim_area.l;
                }
            }
        }

        function _chk_img() {
            let _capt = (() => {
                try {
                    return images.captureScreen();
                } catch (e) {
                    images.requestScreenCapture();
                    sleep(300);
                    return images.captureScreen();
                }
            })();
            let _mch = images.findImage(_capt, f);
            if (_mch) {
                return _ret = [_mch.x + f.width / 2, _mch.y + f.height / 2];
            }
        }
    }

    // raw function(s) //

    function getDisplayRaw(params) {
        let $_flag = global.$$flag = global.$$flag || {};

        let _par = params || {};
        let _waitForAction = typeof waitForAction === "undefined" ?
            waitForActionRaw :
            waitForAction;
        let _debugInfo = (m, fg) => (typeof debugInfo === "undefined" ?
            debugInfoRaw :
            debugInfo)(m, fg, _par.debug_info_flag);
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
                _W = +_win_svc_disp.getWidth();
                _H = +_win_svc_disp.getHeight();
                if (!(_W * _H)) {
                    throw Error();
                }

                // left: 1, right: 3, portrait: 0 (or 2 ?)
                let _SCR_O = +_win_svc_disp.getOrientation();
                let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                let _MAX = +_win_svc_disp.maximumSizeDimension;

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
                try {
                    _W = +device.width;
                    _H = +device.height;
                    return _W && _H && {
                        WIDTH: _W,
                        HEIGHT: _H,
                        USABLE_HEIGHT: Math.trunc(_H * 0.9),
                    };
                } catch (e) {
                }
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

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }
}

/**
 * Swipe to make a certain specified area, then click it
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
    let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;
    let _swipeAndShow = typeof swipeAndShow === "undefined" ? swipeAndShowRaw : swipeAndShow;

    let _res_swipe = _swipeAndShow(f, swipe_params);
    if (!_res_swipe) {
        return;
    }
    return _clickAction(
        typeof _res_swipe === "boolean" ? f : _res_swipe,
        click_params && click_params.click_strategy, click_params
    );

    // raw function(s) //

    function clickActionRaw(kw) {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _kw = classof(kw) === "Array" ? kw[0] : kw;
        let _key_w = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
        if (_key_w) {
            let _bounds = _key_w.bounds();
            click(_bounds.centerX(), _bounds.centerY());
            return true;
        }
    }

    function swipeAndShowRaw(kw, params) {
        let _max_try_times = 10;
        while (_max_try_times--) {
            let _widget = kw.findOnce();
            if (_widget && _widget.bounds().top > 0 && _widget.bounds().bottom < device.height) return true;
            let _dev_h = device.height;
            let _dev_w = device.width;
            swipe(_dev_w * 0.5, _dev_h * 0.8, _dev_w * 0.5, _dev_h * 0.2, params.swipe_time || 150);
            sleep(params.swipe_interval || 300);
        }
        return _max_try_times >= 0;
    }
}

/**
 * Simulates touch, keyboard or key press events (by shell or functions based on accessibility service)
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

    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;

    if (_par.force_shell) {
        return keyEvent(code);
    }
    let _tidy_code = code.toString().toLowerCase()
        .replace(/^keycode_|s$/, "")
        .replace(/_([a-z])/g, ($0, $1) => $1.toUpperCase());
    let _1st_res = simulateKey();
    return _par.double ? simulateKey() : _1st_res;

    // tool function(s) //

    function keyEvent(keycode_name) {
        let _key_check = {
            "26, power": checkPower,
        };
        for (let _key in _key_check) {
            if (_key_check.hasOwnProperty(_key)) {
                if (~_key.split(/ *, */).indexOf(_tidy_code)) {
                    return _key_check[_key]();
                }
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
            if (shell_result) {
                return true;
            }
            _par.no_err_msg || keyEventFailedMsg();

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
            return shellInputKeyEvent(keycode_name) ? _waitForAction(isScreenOff, 2.4e3) : false;
        }
    }

    function simulateKey() {
        switch (_tidy_code) {
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
 * @param msg {string|string[]} - message will be formatted with prefix ">> "
 * <br>
 *     - "sum is much smaller" - ">> sum is much smaller" <br>
 *     - ">sum is much smaller" - ">>> sum is much smaller"
 * @param {string|number} [info_flag] - like: "up"; "Up"; 3; "up_3"; "both_4" -- "Up": black "up line"; "up": grey "up line"
 * @param {boolean} [forcible_flag] - forcibly enable with true value
 */
function debugInfo(msg, info_flag, forcible_flag) {
    let $_flag = global.$$flag = global.$$flag || {};

    let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

    let global_flag = $_flag.debug_info_avail;
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
            for (let i = 0; i < 17; i += 1) _split_line += "- ";
            _split_line += "-";
        } else {
            for (let i = 0; i < 33; i += 1) _split_line += "-";
        }
        return ~console.log(_split_line + _extra_str);
    }

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }

    // tool function(s) //

    function setDebugSplitLine(msg) {
        let _msg = "";
        if (msg.match(/dash/)) {
            for (let i = 0; i < 17; i += 1) _msg += "- ";
            _msg += "-";
        } else {
            for (let i = 0; i < 33; i += 1) _msg += "-";
        }
        return _msg;
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
 * @param {number} [duration=180] - scroll duration
 * @param pages_pool {array} - pool for storing pages (parent views)
 * @param {View} [base_view=ui.main] - specified view for attaching parent views
 */
function smoothScrollView(shifting, duration, pages_pool, base_view) {
    if (pages_pool.length < 2) return;
    if (global["_$_page_scrolling"]) return;

    global["_$_page_scrolling"] = true;
    let page_scrolling_flag = true;

    duration = duration || 180;
    let each_move_time = 10;
    base_view = base_view || ui.main;

    let len = pages_pool.length;
    let [main_view, sub_view] = [pages_pool[len - 2], pages_pool[len - 1]];
    let parent = base_view.getParent();

    if (!WIDTH || !HEIGHT) {
        let _data = getDisplayRaw();
        [WIDTH, HEIGHT] = [_data.WIDTH, _data.HEIGHT];
    }

    let abs = num => num < 0 ? -num : num;

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

        let ptx = dx ? Math.ceil(each_move_time * dx / duration) : 0;
        let pty = dy ? Math.ceil(each_move_time * dy / duration) : 0;

        threads.start(function () {
            let scroll_interval = setInterval(function () {
                try {
                    if (dx <= 0 && dy <= 0) {
                        clearInterval(scroll_interval);
                        if ((shifting[0] === -WIDTH && sub_view) && page_scrolling_flag) {
                            ui.post(() => {
                                sub_view.scrollBy(WIDTH, 0);
                                parent.removeView(parent.getChildAt(parent.getChildCount() - 1));
                            });
                        }
                        return page_scrolling_flag = false;
                    }
                    let move_x = ptx ? Math.min(dx, ptx) : 0;
                    let move_y = pty ? Math.min(dy, pty) : 0;
                    let scroll_x = neg_x ? -move_x : move_x;
                    let scroll_y = neg_y ? -move_y : move_y;
                    ui.post(() => {
                        sub_view && sub_view.scrollBy(scroll_x, scroll_y);
                        main_view.scrollBy(scroll_x, scroll_y);
                    });
                    dx -= move_x;
                    dy -= move_y;
                } catch (e) {
                    // setInterval will throw Error even if it's in a try() body
                }
            }, each_move_time);
        });

        threads.start(function () {
            waitForAction(() => !page_scrolling_flag, 10e3);
            global["_$_page_scrolling"] = false;
        });
    } catch (e) {
        page_scrolling_flag = false;
        console.warn(e.message); //// TEST ////
    }

    // raw function(s) //

    function getDisplayRaw(params) {
        let $_flag = global.$$flag = global.$$flag || {};

        let _par = params || {};
        let _waitForAction = typeof waitForAction === "undefined" ?
            waitForActionRaw :
            waitForAction;
        let _debugInfo = (m, fg) => (typeof debugInfo === "undefined" ?
            debugInfoRaw :
            debugInfo)(m, fg, _par.debug_info_flag);
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
                _W = +_win_svc_disp.getWidth();
                _H = +_win_svc_disp.getHeight();
                if (!(_W * _H)) {
                    throw Error();
                }

                // left: 1, right: 3, portrait: 0 (or 2 ?)
                let _SCR_O = +_win_svc_disp.getOrientation();
                let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                let _MAX = +_win_svc_disp.maximumSizeDimension;

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
                try {
                    _W = +device.width;
                    _H = +device.height;
                    return _W && _H && {
                        WIDTH: _W,
                        HEIGHT: _H,
                        USABLE_HEIGHT: Math.trunc(_H * 0.9),
                    };
                } catch (e) {
                }
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

        function debugInfoRaw(msg, info_flag) {
            if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }
}

/**
 * Show a message in dialogs title view (an alternative strategy for TOAST message which may be covered by dialogs box)
 * @param dialog {Dialogs} - wrapped "dialogs" object
 * @param message {string} - message shown in title view
 * @param {number} [duration=3e3] - time duration before message dismissed (0 for non-auto dismiss)
 */
function alertTitle(dialog, message, duration) {
    global["_$_alert_title_info"] = global["_$_alert_title_info"] || {};
    let alert_title_info = global["_$_alert_title_info"];
    alert_title_info[dialog] = alert_title_info[dialog] || {};
    alert_title_info["message_showing"] ? alert_title_info["message_showing"]++ : (alert_title_info["message_showing"] = 1);

    let ori_text = alert_title_info[dialog].ori_text || "";
    let ori_text_color = alert_title_info[dialog].ori_text_color || "";
    let ori_bg_color = alert_title_info[dialog].ori_bg_color || "";

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

    setTimeout(function () {
        alert_title_info["message_showing"]--;
        if (alert_title_info["message_showing"]) return;
        setTitleInfo(dialog, ori_text, ori_text_color, ori_bg_color);
    }, duration || 3e3);

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
 * @param {string} [mode="replace"]
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

    let _waitForAction = typeof waitForAction === "undefined"
        ? waitForActionRaw
        : waitForAction;

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
 * @param {string} key_name - a key name as a clip of the file name
 * @param {number|string|object} log_level - any falsy but 0 for not needing console logs
 * @see messageAction
 */
function captureErrScreen(key_name, log_level) {
    images.requestScreenCapture();

    let _messageAction = typeof messageAction === "undefined"
        ? messageActionRaw
        : messageAction;

    let _dir = files.getSdcardPath() + "/.local/Pics/Err/";
    let _suffix = "_" + _getTimeStr();
    let _path = _dir + key_name + _suffix + ".png";

    try {
        files.createWithDirs(_path);
        images.captureScreen(_path);
        _messageAction("已存储屏幕截图文件:", log_level);
        _messageAction(_path, log_level);
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

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }
}

/**
 * Returns a UiSelector with additional function(s) bound to its __proto__
 * @param {object} [options]
 * @param {boolean} [options.debug_info_flag]
 * @returns {UiSelector} - with additional function(s)
 */
function getSelector(options) {
    let _opt = options || {};
    let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
    let _debugInfo = _msg => (
        typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo
    )(_msg, "", _opt.debug_info_flag);
    let _sel = selector();
    _sel.__proto__ = _sel.__proto__ || {};
    Object.assign(_sel.__proto__, {
        kw_pool: {},
        cache_pool: {},
        /**
         * Returns a selector (UiSelector) or widget (UiObject) or some attribute
         * If no widgets (UiObjects) were found, returns null or "" or false
         * If memory_keyword was found in this session memory, use a memorized selector directly without selecting
         * @memberOf getSelector
         * @param sel_body {string|RegExp|array} - selector body will be converted into array type
         * <br>
         *     -- array: [ [selector_body] {*}, <[additional_selectors] {array|object}>, [compass] {string} ]
         *     -- additional_selectors can be treated as compass by checking its type (whether object or string)
         * @param {?string} [mem_kw] - to mark this selector widget; better use a keyword without conflict
         * @param {string} [res_type="widget"] -
         * "widget" ("w"), "widget_collection" ("wc"), "txt", "text", "desc", "id", "bounds", "exist(s)" and so forth
         * <br>
         *     -- "txt": available text()/desc() value or empty string
         * @param {object} [par]
         * @param {string} [par.selector_prefer="desc"] - unique selector you prefer to check first; "text" or "desc"
         * @param {boolean} [par.debug_info_flag]
         * @returns {UiObject|UiSelector|string|boolean|Rect|*} - default: UiObject
         * @example
         * // text/desc/id("abc").findOnce();
         * // UiObject
         * pickup("abc");
         * // same as above
         * pickup("abc", "w", "my_alphabet");
         * // text/desc/id("abc");
         * // UiSelector
         * pickup("abc", "sel", "my_alphabet");
         * // text("abc").findOnce()
         * pickup(text("abc"), "w", "my_alphabet");
         * // id/text/desc and so forth -- string
         * pickup(/^abc.+z/, "sel_str", "AtoZ")
         * // text/desc/id("morning").exists() -- boolean
         * pickup("morning", "exists");
         * // text/desc/id("morning").findOnce().parent().parent().child(3).id()
         * pickup(["morning", "p2c3"], "id");
         * // text/desc/id("hello").findOnce().parent().child(%childCount% - 3)["txt"]
         * pickup(["hello", "s3b"], "txt");
         * // text/desc/id("hello").findOnce().parent().child(%%indexInParent% + 2)["txt"]
         * pickup(["hello", "s+2"], "txt");
         * // text/desc/id("hello").className("Button").findOnce()
         * pickup(["hello", {className: "Button"}]);
         * // desc("a").className(...).boundsInside(...).findOnce().parent().child(%indexInParent% + 1).clickable()
         * pickup([desc("a").className("Button"), {boundsInside: [0, 0, 720, 1000]}, "s+1"], "clickable", "back_btn");
         */
        pickup(sel_body, res_type, mem_kw, par) {
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
            } else if (_res_type.match(/^s(el(ector)?)?(_?s|S)(tr(ing)?)?$/)) {
                _res_type = "selector_string";
            }

            if (typeof _sel_body[1] === "string") {
                _sel_body.splice(1, 0, "");
            }

            let _body = _sel_body[0];
            let _additional_sel = _sel_body[1];
            let _compass = _sel_body[2];

            let _kw = _getSelector(_additional_sel);
            let _widget = null;
            let _w_collection = [];
            if (_kw && _kw.toString().match(/UiObject/)) {
                _widget = _kw;
                if (_res_type === "widgets") {
                    _w_collection = [_kw];
                }
                _kw = null;
            } else {
                _widget = _kw ? _kw.findOnce() : null;
                if (_res_type === "widgets") {
                    _w_collection = _kw ? _kw.find() : [];
                }
            }

            if (_compass) {
                _widget = _relativeWidget([_kw || _widget, _compass]);
            }

            let _res = {
                selector: _kw,
                widget: _widget,
                widgets: _w_collection,
                exists: !!_widget,
                get selector_string() {
                    return _kw ? _kw.toString().match(/[a-z]+/)[0] : "";
                },
                get txt() {
                    let _text = _widget && _widget.text() || "";
                    let _desc = _widget && _widget.desc() || "";
                    return _desc.length > _text.length ? _desc : _text;
                }
            };

            if (_res_type in _res) {
                return _res[_res_type];
            }

            try {
                if (!_widget) {
                    return null;
                }
                return _widget[_res_type]();
            } catch (e) {
                try {
                    return _widget[_res_type];
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
                    if (_mem_sel) {
                        return _mem_sel;
                    }
                }
                let _kw_sel = _getSelFromLayout(addition);
                if (mem_kw && _kw_sel) {
                    // _debugInfo(["选择器已记录", ">" + mem_kw, ">" + _kw_sel]);
                    global[_mem_kw_prefix + mem_kw] = _kw_sel;
                }
                return _kw_sel;

                // tool function(s) //

                function _getSelFromLayout(addition) {
                    let _prefer = _params.selector_prefer;
                    let _body_class = _classof(_body);

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
                        let sel = selector();
                        Object.keys(_body).forEach((key) => {
                            let _par = _body[key];
                            if (classof(_par, "Array")) {
                                sel = sel[key].apply(sel, _par);
                            } else {
                                sel = sel[key](_par);
                            }
                        });
                        return sel;
                    }

                    // tool function(s) //

                    function _chkSels(selectors) {
                        let _sels = selectors;
                        let _arg_len = arguments.length;
                        if (_classof(_sels) !== "Array") {
                            _sels = [];
                            for (let i = 0; i < _arg_len; i += 1) {
                                _sels[i] = arguments[i];
                            }
                        }
                        let _sels_len = _sels.length;
                        for (let i = 0; i < _sels_len; i += 1) {
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
                                let _k_len = _keys.length;
                                for (let i = 0; i < _k_len; i += 1) {
                                    let _k = _keys[i];
                                    if (!sel[_k]) {
                                        let _m = "无效的additional_selector属性值:";
                                        _debugInfo([_m, _k], 3);
                                        return null;
                                    }
                                    let _val = addition[_k];
                                    try {
                                        let _arg = _classof(_val) === "Array" ? _val : [_val];
                                        sel = sel[_k].apply(sel, _arg);
                                    } catch (e) {
                                        let _m = "无效的additional_selector选择器:";
                                        _debugInfo([_m, _k], 3);
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
             * @param w_info {array|*} - [widget, compass]
             * @returns {null|UiObject}
             * @example
             * // text("Alipay").findOnce().parent().parent();
             * relativeWidget([text("Alipay"), "pp"]);
             * // text("Alipay").findOnce().parent().parent();
             * relativeWidget([text("Alipay").findOnce(), "p2"]);
             * // id("abc").findOnce().parent().parent().parent().child(2);
             * relativeWidget([id("abc"), "p3c2"]);
             * // id("abc").findOnce().parent().child(5);
             * // returns an absolute sibling
             * relativeWidget([id("abc"), "s5"/"s5p"]);
             * // id("abc").findOnce().parent().child(%childCount% - 5);
             * // abs sibling
             * relativeWidget([id("abc"), "s5n"]);
             * // id("abc").findOnce().parent().child(%indexInParent()% + 3);
             * // rel sibling
             * relativeWidget([id("abc"), "s+3"]);
             * // id("abc").findOnce().parent().child(%indexInParent()% - 2);
             * // rel sibling
             * relativeWidget([id("abc"), "s-2"]);
             */
            function _relativeWidget(w_info) {
                let classof = o => Object.prototype.toString.call(o).slice(8, -1);

                let _w_info = classof(w_info) === "Array"
                    ? w_info.slice()
                    : [w_info];

                let _w = _w_info[0];
                let _w_class = classof(_w);
                let _w_str = (_w || "").toString();

                if (typeof _w === "undefined") {
                    _debugInfo("relativeWidget的widget参数为Undefined");
                    return null;
                }
                if (classof(_w) === "Null") {
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

                let _compass = _w_info[1];

                if (!_compass) {
                    // _debugInfo("relativeWidget的罗盘参数为空");
                    return _w;
                }

                _compass = _compass.toString();

                try {
                    if (_compass.match(/s[+\-]?\d+([fbpn](?!\d+))?/)) {
                        // backwards|negative
                        let _rel_mch = _compass.match(/s[+\-]\d+|s\d+[bn](?!\d+)/);
                        // forwards|positive
                        let _abs_mch = _compass.match(/s\d+([fp](?!\d+))?/);
                        if (_rel_mch) {
                            let _rel_amt = parseInt(_rel_mch[0].match(/[+\-]?\d+/)[0]);
                            let _child_cnt = _w.parent().childCount();
                            let _cur_idx = _w.indexInParent();
                            _w = _rel_mch[0].match(/\d+[bn]/)
                                ? _w.parent().child(_child_cnt - Math.abs(_rel_amt))
                                : _w.parent().child(_cur_idx + _rel_amt);
                        } else if (_abs_mch) {
                            _w = _w.parent().child(
                                parseInt(_abs_mch[0].match(/\d+/)[0])
                            );
                        }
                        _compass = _compass.replace(/s[+\-]?\d+([fbpn](?!\d+))?/, "");
                        if (!_compass) {
                            return _w;
                        }
                    }
                } catch (e) {
                    return null;
                }

                let _parents = _compass.replace(
                    /([Pp])(\d+)/g, ($0, $1, $2) => {
                        let _str = "";
                        let _max = parseInt($2);
                        for (let i = 0; i < _max; i += 1) {
                            _str += "p";
                        }
                        return _str;
                    }
                ).match(/p*/)[0]; // may be ""

                if (_parents) {
                    let _len = _parents.length;
                    for (let i = 0; i < _len; i += 1) {
                        if (!(_w = _w.parent())) {
                            return null;
                        }
                    }
                }

                let _mch = _compass.match(/c\d+/g);
                return _mch ? _childWidget(_mch) : _w;

                // tool function(s) //

                function _childWidget(arr) {
                    let _len = arr.length;
                    for (let i = 0; i < _len; i += 1) {
                        try {
                            let _idx = +arr[i].match(/\d+/);
                            _w = _w.child(_idx);
                        } catch (e) {
                            return null;
                        }
                    }
                    return _w || null;
                }
            }
        },
        add(key, sel_body, kw) {
            let _kw = typeof kw === "string" ? kw : key;
            this.kw_pool[key] = typeof sel_body === "function"
                ? type => sel_body(type)
                : type => this.pickup(sel_body, type, _kw);
            return this;
        },
        get(key, type) {
            let _picker = this.kw_pool[key];
            if (!_picker) {
                return null;
            }
            if (type && type.toString().match(/cache/)) {
                return this.cache_pool[key] = _picker("widget");
            }
            return _picker(type);
        },
        getAndCache(key) {
            // only "widget" type can be returned
            return this.get(key, "save_cache");
        },
        cache: {
            save: (key) => _sel.getAndCache(key),
            load(key, type) {
                let _widget = _sel.cache_pool[key];
                if (!_widget) {
                    return null;
                }
                return _sel.pickup(_sel.cache_pool[key], type);
            },
            refresh(key) {
                let _cache = _sel.cache_pool[key];
                _cache && _cache.refresh();
                this.save(key);
            },
            reset(key) {
                delete _sel.cache_pool[key];
                return _sel.getAndCache(key);
            },
            recycle(key) {
                let _cache = _sel.cache_pool[key];
                _cache && _cache.recycle();
            },
        },
    });
    return _sel;

    // raw function(s) //

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
    }
}

/**
 * Returns a new string with a certain mark surrounded
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
        return records[keyword] = +new Date();
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
    options = options || {};
    let default_strategy = options.default_strategy || "click";
    let interval = +options.interval || 0;
    let max_try_times = +options.max_try_times;
    if (isNaN(max_try_times)) max_try_times = 5;
    let max_try_times_backup = max_try_times;

    let _getSelector = typeof getSelector === "undefined" ? getSelectorRaw : getSelector;
    let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _surroundWith = typeof surroundWith === "undefined" ? surroundWithRaw : surroundWith;
    let _debugInfo = _msg => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, "", options.debug_info_flag);
    let sel = _getSelector();

    let pipeline_name = options.name ? _surroundWith(options.name) : "";

    let pipe = pipeline.filter(value => typeof value !== "undefined").map((value) => {
        let val = Object.prototype.toString.call(value).slice(8, -1) === "Array" ? value : [value];
        if (typeof val[1] === "function" || val[1] === null) val.splice(1, 0, null);
        val[1] = val[1] || default_strategy;
        return val;
    });
    pipe.forEach((value, idx, arr) => {
        if (arr[idx][2] === undefined) arr[idx][2] = function () {
            if (arr[idx + 1]) return sel.pickup(arr[idx + 1][0]);
            return !sel.pickup(arr[idx][0]);
        };
        if (typeof arr[idx][2] === "function") {
            let f = arr[idx][2];
            arr[idx][2] = () => f(arr[idx][0]);
        }
    });

    for (let i = 0, len = pipe.length; i < len; i += 1) {
        max_try_times = max_try_times_backup;
        let p = pipe[i];
        let keyword = p[0];
        let strategy = p[1];
        let condition = p[2];
        let kw_keyword = sel.pickup(keyword);
        let clickOnce = () => condition !== null && _clickAction(kw_keyword, strategy);

        clickOnce();
        while (max_try_times-- > 0 && !_waitForAction(condition === null ? kw_keyword : condition, 1.5e3)) {
            clickOnce();
            sleep(interval);
        }

        if (max_try_times < 0) {
            _messageAction(pipeline_name + "管道破裂", 3, 1, 0, "up_dash");
            return _messageAction(_surroundWith(keyword), 3, 0, 1, "dash");
        }
    }

    return _debugInfo(pipeline_name + "管道完工") || true;

    // raw function(s) //

    function getSelectorRaw() {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let sel = selector();
        sel.__proto__ = {
            pickup(filter) {
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

    function clickActionRaw(kw) {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _kw = classof(kw) === "Array" ? kw[0] : kw;
        let _key_w = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
        if (_key_w) {
            let _bounds = _key_w.bounds();
            click(_bounds.centerX(), _bounds.centerY());
            return true;
        }
    }

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
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

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
    }
}

/**
 * Convert a timeFlag into a number array
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
 * @typedef {com.stardust.autojs.core.image.ImageWrapper} Image
 * @param src {Array|Image|UiObject|UiObjectCollection} -- will be converted into Image
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
 * baiduOcr(sel.pickup(/\xa0/, "widgets"), {
 *     fetch_times: 3,
 *     timeout: 12e3
 * });
 */
function baiduOcr(src, par) {
    let _isRecycled = (img) => {
        if (!img) return true;
        try {
            img.getHeight();
        } catch (e) {
            return !!e.message.match(/has been recycled/);
        }
    };
    if (!src) {
        return [];
    }
    let _par = par || {};
    let _tt = _par.timeout || 60e3;
    if (!+_tt || _tt < 5e3) {
        _tt = 5e3;
    }
    let _tt_ts = Date.now() + _tt;

    _permitCapt();
    let _capt = _par.capt_img || images.captureScreen();

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;
    let _debugInfo = (_msg) => {
        if (!_par.debug_info_flag) return null;
        return (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, "", true);
    };

    let _msg = "使用baiduOcr获取数据";
    _debugInfo(_msg);
    _par.no_toast_msg_flag || toast(_msg);

    let _token = "";
    let _max_token = 10;
    let _thd_token = threads.start(function () {
        while (_max_token--) {
            try {
                let _url = "https://aip.baidubce.com/oauth/2.0/token" +
                    "?grant_type=client_credentials" +
                    "&client_id=YIKKfQbdpYRRYtqqTPnZ5bCE" +
                    "&client_secret=hBxFiPhOCn6G9GH0sHoL0kTwfrCtndDj";
                _token = http.get(_url).body.json()["access_token"];
                _debugInfo("access_token准备完毕");
                break;
            } catch (e) {
                sleep(200);
            }
        }
    });
    _thd_token.join(_tt);
    if (_max_token < 0) {
        let _msg = "baiduOcr获取access_token失败";
        let _lv = +!_par.no_toast_msg_flag;
        _messageAction(_msg, 3, _lv, 0, "both_dash");
        return [];
    }
    if (_thd_token.isAlive()) {
        let _msg = "baiduOcr获取access_token超时";
        let _toast = +!_par.no_toast_msg_flag;
        _messageAction(_msg, 3, _toast, 0, "both_dash");
        return [];
    }

    let _max = _par.fetch_times || 1;
    let _max_b = _max;
    let _itv = _par.fetch_interval || 300;
    let _res = [];
    let _thds = [];
    let _allDead = () => {
        for (let i = 0, len = _thds.length; i < len; i += 1) {
            if (_thds[i].isAlive()) return;
        }
        return true;
    };

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
            let _img_str = "stitched_image";
            let _suffix = _max_b > 1 ? "[" + _cur + "]" : "";
            _debugInfo(_img_str + _suffix + "准备完毕");

            try {
                let _url = "https://aip.baidubce.com" +
                    "/rest/2.0/ocr/v1/general_basic" +
                    "?access_token=" + _token;
                let _opt = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    // images.read(img_file) for local file
                    image: images.toBase64(_img),
                    image_type: "BASE64",
                };
                let _response = http.post(_url, _opt).body.string();
                let _words = JSON.parse(_response)["words_result"];
                if (_words) {
                    let _words_res = _words.map(val => val["words"]);
                    let _suffix = _max_b > 1 ? "[" + _cur + "]" : "";
                    _debugInfo("数据" + _suffix + "获取成功");
                    _res.push(_words_res);
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
        while (sleep(500) || true) {
            if (_allDead()) break;
            if (+new Date() >= _tt_ts) {
                _thds.forEach(thd => thd.interrupt());

                let _msg = "baiduOcr获取数据超时";
                let _toast = +!_par.no_toast_msg_flag;
                _messageAction(_msg, 3, _toast, 0, "up_dash");

                if (_res.length) {
                    _messageAction("已获取的数据可能不完整", 3);
                }
                _showSplitLine("", "dash");
            }
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
        });

        return _stitchImg(imgs);

        // tool function(s) //

        function _getType(o) {
            let matched = o.toString().match(/\w+(?=@)/);
            return matched ? matched[0] : "";
        }

        function _widgetToImage(widget) {
            let clipImg = bnd => images.clip(_capt,
                bnd.left, bnd.top, bnd.width(), bnd.height()
            );
            try {
                // FIXME Nov 11, 2019
                // there is a strong possibility that `widget.bounds()` would throw an exception
                // like "Cannot find function bounds in object xxx.xxx.xxx.UiObject@abcde"
                let bounds = {};
                let regexp = /.*boundsInScreen:.*\((\d+), (\d+) - (\d+), (\d+)\).*/;
                widget.toString().replace(regexp, ($0, $1, $2, $3, $4) => {
                    bounds = {
                        left: +$1, top: +$2, right: +$3, bottom: +$4,
                        width: () => $3 - $1, height: () => $4 - $2,
                    };
                });
                return clipImg(bounds);
            } catch (e) {
                // just in case
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

    // monster function(s) //

    // updated: Jun 4, 2020
    function _permitCapt(params) {
        let _$$und = x => typeof x === "undefined";
        let _$$isJvo = x => x && !!x["getClass"];
        let _key = "_$_request_screen_capture";
        let _fg = global[_key];

        if (_$$isJvo(_fg)) {
            if (_fg) return true;
            _fg.incrementAndGet();
        } else {
            global[_key] = threads.atomic(1);
        }

        let _par = params || {};
        let _debugInfo = (m, fg) => (
            typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo
        )(m, fg, _par.debug_info_flag);

        _debugInfo("开始申请截图权限");

        let _waitForAction = (
            typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction
        );
        let _messageAction = (
            typeof messageAction === "undefined" ? messageActionRaw : messageAction
        );
        let _clickAction = (
            typeof clickAction === "undefined" ? clickActionRaw : clickAction
        );
        let _getSelector = (
            typeof getSelector === "undefined" ? getSelectorRaw : getSelector
        );
        let _$$sel = _getSelector();

        if (_$$und(_par.restart_this_engine_flag)) {
            _par.restart_this_engine_flag = true;
        } else {
            let _self = _par.restart_this_engine_flag;
            _par.restart_this_engine_flag = !!_self;
        }
        if (!_par.restart_this_engine_params) {
            _par.restart_this_engine_params = {};
        }
        if (!_par.restart_this_engine_params.max_restart_engine_times) {
            _par.restart_this_engine_params.max_restart_engine_times = 3;
        }

        _debugInfo("已开启弹窗监测线程");
        let _thread_prompt = threads.start(function () {
            let _kw_remember = id("com.android.systemui:id/remember");
            let _sel_remember = () => _$$sel.pickup(_kw_remember);
            let _rex_sure = /S(tart|TART) [Nn][Oo][Ww]|立即开始|允许/;
            let _sel_sure = type => _$$sel.pickup(_rex_sure, type);

            if (_waitForAction(_sel_sure, 5e3)) {
                if (_waitForAction(_sel_remember, 1e3)) {
                    _debugInfo('勾选"不再提示"复选框');
                    _clickAction(_sel_remember(), "w");
                }
                if (_waitForAction(_sel_sure, 2e3)) {
                    let _widget = _sel_sure();
                    let _act_msg = '点击"' + _sel_sure("txt") + '"按钮';

                    _debugInfo(_act_msg);
                    _clickAction(_widget, "w");

                    if (!_waitForAction(() => !_sel_sure(), 1e3)) {
                        _debugInfo("尝试click()方法再次" + _act_msg);
                        _clickAction(_widget, "click");
                    }
                }
            }
        });

        let _thread_monitor = threads.start(function () {
            if (_waitForAction(() => !!_req_result, 3.6e3, 300)) {
                _thread_prompt.interrupt();
                return _debugInfo("截图权限申请结果: " + _req_result);
            }
            if (typeof $$flag !== "undefined") {
                if (!$$flag.debug_info_avail) {
                    $$flag.debug_info_avail = true;
                    _debugInfo("开发者测试模式已自动开启", 3);
                }
            }
            if (_par.restart_this_engine_flag) {
                _debugInfo("截图权限申请结果: 失败", 3);
                try {
                    let _m = android.os.Build.MANUFACTURER.toLowerCase();
                    if (_m.match(/xiaomi/)) {
                        _debugInfo("__split_line__dash__");
                        _debugInfo("检测到当前设备制造商为小米", 3);
                        _debugInfo("可能需要给Auto.js以下权限:", 3);
                        _debugInfo('>"后台弹出界面"', 3);
                        _debugInfo("__split_line__dash__");
                    }
                } catch (e) {
                    // nothing to do here
                }
                if (restartThisEngine(_par.restart_this_engine_params)) {
                    return;
                }
            }
            _messageAction("截图权限申请失败", 9, 1, 0, 1);
        });

        let _req_result = images.requestScreenCapture(false);
        _thread_monitor.join();

        if (_req_result) {
            return true;
        }
        _fg.decrementAndGet();

        // raw function(s) //

        function getSelectorRaw() {
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            let sel = selector();
            sel.__proto__ = {
                pickup(filter) {
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

        function clickActionRaw(kw) {
            let classof = o => Object.prototype.toString.call(o).slice(8, -1);
            let _kw = classof(kw) === "Array" ? kw[0] : kw;
            let _key_w = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
            if (_key_w) {
                let _bounds = _key_w.bounds();
                click(_bounds.centerX(), _bounds.centerY());
                return true;
            }
        }

        // tool function(s) //

        // updated: Dec 27, 2019
        function restartThisEngine(params) {
            let _params = params || {};

            let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
            let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _info_flag, _params.debug_info_flag);

            let _my_engine = engines.myEngine();
            let _my_engine_id = _my_engine.id;

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
            _runJsFile(_file_path, Object.assign({}, _params, {
                max_restart_engine_times: _max_restart_engine_times - 1,
                max_restart_engine_times_backup: _max_restart_engine_times_backup,
                instant_run_flag: _params.instant_run_flag,
            }));
            _debugInfo("强制停止旧引擎任务");
            // _my_engine.forceStop();
            engines.all().filter(e => e.id === _my_engine_id).forEach(e => e.forceStop());
            return true;

            // raw function(s) //

            function messageActionRaw(msg, lv, if_toast) {
                let _s = msg || " ";
                if (lv && lv.toString().match(/^t(itle)?$/)) {
                    let _par = ["[ " + msg + " ]", 1, if_toast];
                    return messageActionRaw.apply({}, _par);
                }
                let _lv = +lv;
                if (if_toast) {
                    toast(_s);
                }
                if (_lv >= 3) {
                    if (_lv >= 4) {
                        console.error(_s);
                        if (_lv >= 8) {
                            exit();
                        }
                    } else {
                        console.warn(_s);
                    }
                    return;
                }
                if (_lv === 0) {
                    console.verbose(_s);
                } else if (_lv === 1) {
                    console.log(_s);
                } else if (_lv === 2) {
                    console.info(_s);
                }
                return true;
            }

            function debugInfoRaw(msg, info_flg) {
                if (info_flg) {
                    let _s = msg || "";
                    _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
                    console.verbose(_s);
                }
            }
        }
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
    }

    function showSplitLineRaw(extra_str, style) {
        let _extra_str = extra_str || "";
        let _split_line = "";
        if (style === "dash") {
            for (let i = 0; i < 17; i += 1) _split_line += "- ";
            _split_line += "-";
        } else {
            for (let i = 0; i < 33; i += 1) _split_line += "-";
        }
        return ~console.log(_split_line + _extra_str);
    }
}

/**
 * Function for replacing setInterval() and avoiding its "flaws"
 * {@link https://dev.to/akanksha_9560/why-not-to-use-setinterval--2na9}
 * @param func {function}
 * @param {number} [interval=200]
 * @param {number|function} [timeout] -- undefined: no timeout limitation; number|function: stop when timeout|timeout() reached
 * @example
 * // print "hello" every 1 second for 5 (or 4 sometimes) times
 * setIntervalBySetTimeout(() => {
 *     console.log("hello");
 * }, 1e3, 5e3);
 */
function setIntervalBySetTimeout(func, interval, timeout) {
    let _itv = interval || 200;
    let _init_ts = Date.now();
    let _in_case_ts = _init_ts + 10 * 60e3; // 10 minutes at most
    let _inCase = () => Date.now() < _in_case_ts;
    let _timeoutReached;
    if (typeof timeout === "function") {
        _timeoutReached = () => {
            return _inCase() && timeout();
        }
    } else {
        _timeoutReached = () => {
            return _inCase() && Date.now() - _init_ts >= timeout;
        }
    }
    setTimeout(function fn() {
        func();
        _timeoutReached() || setTimeout(fn, _itv);
    }, _itv);
}

/**
 * Returns the class name of an object or any type of param, or, returns if the result is the same as specified
 * @param source {*} - any type of param
 * @param {string} [check_value]
 * @returns {boolean|string}
 */
function classof(source, check_value) {
    let class_result = Object.prototype.toString.call(source).slice(8, -1);
    return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
}

/**
 * Check if device is running compatible (relatively) Auto.js version and android sdk version
 * @param {object} [params]
 * @param {boolean} [params.debug_info_flag]
 * @returns {{cur_autojs_name: string, cur_autojs_pkg: string, project_ver: string| number|void, autojs_ver: string|void, sdk_ver: number}}
 */
function checkSdkAndAJVer(params) {
    let $_app = {};

    let _par = params || {};

    let _messageAction = typeof messageAction === "undefined"
        ? messageActionRaw
        : messageAction;
    let _debugInfo = (m, fg) => (typeof debugInfo === "undefined"
        ? debugInfoRaw
        : debugInfo)(m, fg, _par.debug_info_flag);

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
            let _pkgs = context.getPackageManager()
                .getInstalledPackages(0).toArray();
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
         * @return {string[]|number|string} -- strings[]: bug codes; 0: normal; "": unrecorded
         */
        function _chkBugs(ver_name) {
            let _ver = ver_name || "0";

            // version ∈ 4.1.1
            // version === Pro 8.+
            // version === Pro 7.0.0-(4|6) || version === Pro 7.0.2-4
            // version === Pro 7.0.3-7 || version === Pro 7.0.4-1
            if (_ver.match(/^(4\.1\.1.+)$/) ||
                _ver.match(/^Pro 8\.\d.+$/) ||
                _ver.match(/^Pro 7\.0\.((0-[46])|(2-4)|(3-7)|(4-1))$/)
            ) {
                return 0; // known normal
            }

            // 4.1.0 Alpha3 <= version <= 4.1.0 Alpha4
            if (_ver.match(/^4\.1\.0 Alpha[34]$/)) {
                return ["ab_SimpActAuto", "dialogs_not_responded"];
            }

            // version === 4.1.0 Alpha(2|5)?
            if (_ver.match(/^4\.1\.0 Alpha[25]$/)) {
                return ["dialogs_not_responded"];
            }

            // 4.0.x versions
            if (_ver.match(/^4\.0\./)) {
                return ["dialogs_not_responded", "not_full_function"];
            }

            // version === Pro 7.0.0-(1|2)
            if (_ver.match(/^Pro 7\.0\.0-[12]$/)) {
                return ["ab_relative_path"];
            }

            // version === Pro 7.0.0-7 || version === Pro 7.0.1-0 || version === Pro 7.0.2-(0|3)
            if (_ver.match(/^Pro 7\.0\.((0-7)|(1-0)|(2-[03]))$/)) {
                return ["crash_autojs"];
            }

            // version >= 4.0.2 Alpha7 || version === 4.0.3 Alpha([1-5]|7)?
            if (_ver.match(/^((4\.0\.2 Alpha([7-9]|\d{2}))|(4\.0\.3 Alpha([1-5]|7)?))$/)) {
                return ["dislocation_floaty", "ab_inflate", "not_full_function"];
            }

            // version >= 3.1.1 Alpha5 || version -> 4.0.0/4.0.1 || version <= 4.0.2 Alpha6
            if (_ver.match(/^((3\.1\.1 Alpha[5-9])|(4\.0\.[01].+)|(4\.0\.2 Alpha[1-6]?))$/)) {
                return ["un_execArgv", "ab_inflate", "not_full_function"];
            }

            // 3.1.1 Alpha3 <= version <= 3.1.1 Alpha4:
            if (_ver.match(/^3\.1\.1 Alpha[34]$/)) {
                return ["ab_inflate", "un_engines", "not_full_function"];
            }

            // version >= 3.1.0 Alpha6 || version <= 3.1.1 Alpha2
            if (_ver.match(/^((3\.1\.0 (Alpha[6-9]|Beta))|(3\.1\.1 Alpha[1-2]?))$/)) {
                return ["un_inflate", "un_engines", "not_full_function"];
            }

            // version >= 3.0.0 Alpha42 || version ∈ 3.0.0 Beta[s] || version <= 3.1.0 Alpha5
            if (_ver.match(/^((3\.0\.0 ((Alpha(4[2-9]|[5-9]\d))|(Beta\d?)))|(3\.1\.0 Alpha[1-5]?))$/)) {
                return ["un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // 3.0.0 Alpha37 <= version <= 3.0.0 Alpha41
            if (_ver.match(/^3\.0\.0 Alpha(3[7-9]|4[0-1])$/)) {
                return ["ab_cwd", "un_relative_path", "un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // 3.0.0 Alpha21 <= version <= 3.0.0 Alpha36
            if (_ver.match(/^3\.0\.0 Alpha(2[1-9]|3[0-6])$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // version <= 3.0.0 Alpha20
            if (_ver.match(/^3\.0\.0 Alpha([1-9]|1\d|20)?$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "crash_ui_settings", "not_full_function"];
            }

            switch (_ver) {
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
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
    }
}