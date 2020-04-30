global["$$impeded"] = (name) => {
    let _$$flag = global["$$flag"];
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

let {
    ui, currentPackage, android, id, click, selector,
    floaty, colors, toast, files, idMatches, engines,
    events, timers, swipe, sleep, exit, app, threads,
    images, device, auto, dialogs, context, http,
} = global;

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
 * @param [params] {object}
 * @param [params.hard_refresh=false] {boolean} - get app information from global cache by default
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
 * @param [params] {object}
 * @param [params.debug_info_flag] {boolean}
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

    let _parseAppName = typeof parseAppName === "undefined" ? parseAppNameRaw : parseAppName;
    let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _info_flag, _par.debug_info_flag);

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
 * @param [params.debug_info_flag] {boolean}
 * @param [params.first_time_run_message_flag=true] {boolean}
 * @param [params.no_message_flag] {boolean}
 * @param [params.global_retry_times=2] {number}
 * @param [params.launch_retry_times=3] {number}
 * @param [params.ready_retry_times=5] {number}
 * @param [params.screen_orientation] {number}
 *  -- if specific screen direction needed to run this app; portrait: 0, landscape: 1
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
    _par.no_impeded || $$impeded(arguments.callee.name);

    let $$und = x => typeof x === "undefined";
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
            while (sleep(1200) || true) _dist();
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
                app.startActivity(_trig);
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

            let _succ = _waitForAction(_cond_launch, 5000, 800);
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

        if (_cond_ready === null || $$und(_cond_ready)) {
            _debugInfo("未设置启动完成条件参数");
            break;
        }

        _1st_launch = false;
        _debugInfo("开始监测启动完成条件");

        let _max_ready = _par.ready_retry_times || 3;
        let _max_ready_b = _max_ready;

        while (!_waitForAction(_cond_ready, 8000) && _max_ready--) {
            let _ctr = "(" + (_max_ready_b - _max_ready) + "/" + _max_ready_b + ")";
            if (typeof _trig === "object") {
                _debugInfo("重新启动Activity " + _ctr);
                app.startActivity(_trig);
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
        }
        let _isVert = () => {
            let _disp = getDisplayRaw();
            return _disp.WIDTH < _disp.HEIGHT;
        }
        let _scr_o_par = _par.screen_orientation;
        if (_scr_o_par === 1 && _isVert()) {
            _debugInfo("需等待屏幕方向为横屏");
            return _waitForAction(_isHoriz, 8000, 80)
                ? (_debugInfo("屏幕方向已就绪"), sleep(500))
                : _messageAction("等待屏幕方向变化超时", 4);
        }
        if (_scr_o_par === 0 && _isHoriz()) {
            _debugInfo("需等待屏幕方向为竖屏");
            return _waitForAction(_isVert, 8000, 80)
                ? (_debugInfo("屏幕方向已就绪"), sleep(500))
                : _messageAction("等待屏幕方向变化超时", 4);
        }
    }

    // raw function(s) //

    function getDisplayRaw(params) {
        let $$flag = global["$$flag"];
        if (!$$flag) {
            $$flag = global["$$flag"] = {};
        }

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

        if (!_waitForAction(() => _disp = _getDisp(), 3000, 500)) {
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
            if (!$$flag.display_params_got) {
                _debugInfo("屏幕宽高: " + _W + " × " + _H);
                _debugInfo("可用屏幕高度: " + _disp.USABLE_HEIGHT);
                $$flag.display_params_got = true;
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
 * @param [params.debug_info_flag] {boolean}
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
    _par.no_impeded || $$impeded(arguments.callee.name);

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
        return _waitForAction(() => !samePkgName(), 12000) && !_waitForAction(samePkgName, 3, 150);
    });

    let _shell_result = false;
    let _shell_start_timestamp = new Date().getTime();
    let _shell_max_wait_time = _par.shell_max_wait_time || 10000;
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
        let _kw = classof(kw) === "Array" ? kw[0] : kw;
        let _key_node = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
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
 * @param [params.debug_info_flag] {boolean}
 * @param [params.first_time_run_message_flag=true] {boolean} - for launching
 * @param [params.no_message_flag] {boolean} - for launching
 * @param [params.global_retry_times=2] {number} - for launching
 * @param [params.launch_retry_times=3] {number} - for launching
 * @param [params.ready_retry_times=5] {number} - for launching
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
 * @param [params.debug_info_flag] {boolean}
 * @param [params.max_restart_engine_times=1] {number} - max restart times for avoiding infinite recursion
 * @param [params.instant_run_flag=false] {boolean} - whether to perform an instant run or not
 * @example
 * restartThisEngine({
 *    debug_info_flag: "forcible",
 *    max_restart_engine_times: 3,
 *    instant_run_flag: true,
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
 * @example
 * runJsFile("file");
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
 *     -- /up|-1/ - show a line before message <br>
 *     -- /both/ - show a line before and another one after message <br>
 *     -- /both_n/ - show a line before and another one after message, then print a blank new line
 * @param [params] {object} reserved
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
    global["$$flag"] = global["$$flag"] || {};
    let $$flag = global["$$flag"];

    if ($$flag.no_msg_act_flag) return !(msg_level in {3: 1, 4: 1});

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
    let _saveLnStyle = () => $$flag.last_cnsl_spl_ln_type = _spl_ln_style;
    let _loadLnStyle = () => $$flag.last_cnsl_spl_ln_type;
    let _clearLnStyle = () => delete $$flag.last_cnsl_spl_ln_type;
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
        exit();
    }

    if (_exit_flag) exit();

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
 * @param [timeout_or_times=10000] {number}
 * <br>
 *     -- *DEFAULT* - take as timeout (default: 10 sec) <br>
 *     -- 0|Infinity - always wait until f is true <br>
 *     -- less than 100 - take as times
 * @param [interval=200] {number}
 * @param [params] {object}
 * @param [params.no_impeded] {boolean}
 * @example
 * waitForAction([() => text("Settings").exists(), () => text("Exit").exists(), "or"], 500, 80);
 * waitForAction([text("Settings"), text("Exit"), () => !text("abc").exists(), "and"], 2000, 50);
 * let kw_settings = text("Settings");
 * let condition = () => kw_settings.exists();
 * // waitForAction(kw_settings, 1000);
 * // waitForAction(condition, 1000);
 * waitForAction(() => condition()), 1000);
 * @return {boolean} - if not timed out
 */
function waitForAction(f, timeout_or_times, interval, params) {
    let _par = params || {};
    _par.no_impeded || $$impeded(arguments.callee.name);

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

        _messageAction('"waitForAction"传入f参数不合法\n\n' + f.toString() + '\n', 8, 1, 1, 1);
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
 * @param [strategy] - decide the way of click
 * <br>
 *     -- "click"|c|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- "press|p" - press(coord_A, coord_B, press_time); <br>
 *     -- "widget|w" - text("abc").click(); - not available for Bounds or CoordsArray
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
    _par.no_impeded || $$impeded(arguments.callee.name);

    if (typeof f === "undefined" || f === null) return false;

    let _classof = o => Object.prototype.toString.call(o).slice(8, -1);

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;

    /**
     * @type {string} - "Bounds"|"UiObject"|"UiSelector"|"CoordsArray"
     */
    let _type = _checkType(f);
    let _padding = _checkPadding(_par.padding);
    if (!((typeof strategy).match(/string|undefined/))) _messageAction("clickAction()的策略参数无效", 8, 1, 0, 1);
    let _strategy = (strategy || "click").toString();
    let _widget_id = 0;
    let _widget_parent_id = 0;

    let _condition_success = _par.condition_success;

    let _check_time_once = _par.check_time_once || 500;
    let _max_check_times = _par.max_check_times || 0;
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

        _strategy.match(/^p(ress)?$/) ? press(_x, _y, _par.press_time || 1) : click(_x, _y);
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
                return _par.condition_success.match(/in.?place/) ? _node.toString().match(/@\w+/)[0].slice(1) !== _widget_id : !_node;
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
 * @param [click_params.intermission=200] {number}
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
        let _kw = classof(kw) === "Array" ? kw[0] : kw;
        let _key_node = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
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
 * @param [params.debug_info_flag] {boolean}
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
 * Swipe to make a certain specified area, usually fullscreen, contains or overlap the bounds of "f"
 * @param f {object} - JavaObject
 * @param [params] {object}
 * @param [params.max_swipe_times=12] {number}
 * @param [params.swipe_direction="auto"] {number|string}
 * <br>
 *     -- 0|"l"|"left", 1|"u"|"up", 2|"r"|"right", 3|"d"|"down" - direction to swipe each time <br>
 *     -- "auto" - if "f" exists but not in aim area, direction will be auto-set decided by position of "f", or direction will be "up"
 * @param [params.swipe_time=150] {number} - the time spent for each swiping - set bigger as needed
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
function swipeAndShow(f, params) {
    let _par = params || {};
    _par.no_impeded || $$impeded(arguments.callee.name);

    let _swipe_interval = _par.swipe_interval || 150;
    let _max_swipe_times = _par.max_swipe_times || 12;
    let _swipe_time = _par.swipe_time || 150;
    let _condition_meet_sides = parseInt(_par.condition_meet_sides);
    if (_condition_meet_sides !== 1 || _condition_meet_sides !== 2) _condition_meet_sides = 1;

    if (!global["WIDTH"] || !global["HEIGHT"]) {
        let _data = getDisplayRaw();
        global["WIDTH"] = _data.WIDTH;
        global["HEIGHT"] = _data.HEIGHT;
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
        let _node = f.findOnce();
        if (!_node) {
            return "up";
        }
        // auto mode
        let _bnd = _node.bounds();
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
        return isImageType(f) ? _chk_img() : _chk_node();

        // tool function(s) //

        function _chk_node() {
            let _max = 5;
            let _node;
            while (_max--) {
                if ((_node = f.findOnce())) {
                    break;
                }
            }
            if (!_node) {
                return;
            }
            let _bnd = _node.bounds();
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
        let $$flag = global["$$flag"];
        if (!$$flag) {
            $$flag = global["$$flag"] = {};
        }

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

        if (!_waitForAction(() => _disp = _getDisp(), 3000, 500)) {
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
            if (!$$flag.display_params_got) {
                _debugInfo("屏幕宽高: " + _W + " × " + _H);
                _debugInfo("可用屏幕高度: " + _disp.USABLE_HEIGHT);
                $$flag.display_params_got = true;
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
 * @param [swipe_params.swipe_time=150] {number} - the time spent for each swiping - set bigger as needed
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
        let _key_node = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
        if (!_key_node) return;
        let _bounds = _key_node.bounds();
        click(_bounds.centerX(), _bounds.centerY());
        return true;
    }

    function swipeAndShowRaw(kw, params) {
        let _max_try_times = 10;
        while (_max_try_times--) {
            let _node = kw.findOnce();
            if (_node && _node.bounds().top > 0 && _node.bounds().bottom < device.height) return true;
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
 * @param [params] {object}
 * @param [params.force_shell] {boolean} - don't use accessibility functions like back(), home() or recents()
 * @param [params.no_err_msg] {boolean} - don't print error message when keycode() failed
 * @param [params.double] {boolean} - simulate keycode twice with tiny interval
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
    _par.no_impeded || $$impeded(arguments.callee.name);

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
            return shellInputKeyEvent(keycode_name) ? _waitForAction(isScreenOff, 2400) : false;
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
 * @param [info_flag] {string|number} - like: "up"; "Up"; 3; "up_3"; "both_4" -- "Up": black "up line"; "up": grey "up line"
 * @param [forcible_flag] {boolean} - forcibly enable with true value
 */
function debugInfo(msg, info_flag, forcible_flag) {
    global["$$flag"] = global["$$flag"] || {};
    let $$flag = global["$$flag"];

    let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

    let global_flag = $$flag.debug_info_avail;
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
 * @param [duration=180] {number} - scroll duration
 * @param pages_pool {array} - pool for storing pages (parent views)
 * @param [base_view=ui.main] {View} - specified view for attaching parent views
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
            waitForAction(() => !page_scrolling_flag, 10000);
            global["_$_page_scrolling"] = false;
        });
    } catch (e) {
        page_scrolling_flag = false;
        console.warn(e.message); //// TEST ////
    }

    // raw function(s) //

    function getDisplayRaw(params) {
        let $$flag = global["$$flag"];
        if (!$$flag) {
            $$flag = global["$$flag"] = {};
        }

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

        if (!_waitForAction(() => _disp = _getDisp(), 3000, 500)) {
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
            if (!$$flag.display_params_got) {
                _debugInfo("屏幕宽高: " + _W + " × " + _H);
                _debugInfo("可用屏幕高度: " + _disp.USABLE_HEIGHT);
                $$flag.display_params_got = true;
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
}

/**
 * Show a message in dialogs title view (an alternative strategy for TOAST message which may be covered by dialogs box)
 * @param dialog {Dialogs} - wrapped "dialogs" object
 * @param message {string} - message shown in title view
 * @param [duration=3000] {number} - time duration before message dismissed (0 for non-auto dismiss)
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

    // FIXME this will make listeners (like key listeners) invalid
    // FIXME and maybe recycle() is unnecessary to remove toast listener
    // events.recycle(); // to remove toast listener from "events" to make it available for next-time invoke
    events.removeAllListeners("toast"); // otherwise, events will exceed the max listeners limit with default 10

    return _got_msg;
}

/**
 * Save current screen capture as a file with a key name and a formatted timestamp
 * @param key_name {string} - a key name as a clip of the file name
 * @param log_level - #see messageAction -- leave false value (not including 0) if not needing console logs
 * @see messageAction
 */
function captureErrScreen(key_name, log_level) {
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;

    let _$$und = o => typeof o === "undefined";
    let _capt = _$$und(images.permit) ? permitCapt : images.permit;
    _capt();

    let path = files.getSdcardPath() + "/.local/Pics/Err/" + key_name + "_" + getTimeStr() + ".png";

    files.createWithDirs(path);
    images.captureScreen(path);
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

    function permitCapt() {
        let _$$isJvo = x => x && !!x["getClass"];
        let _key = "_$_request_screen_capture";
        let _fg = global[_key];
        let _cwd = engines.myEngine().cwd();
        let _path = _cwd + "/Modules/EXT_IMAGES.js";

        if (files.exists(_path)) {
            return require(_path).permit();
        }

        if (_$$isJvo(_fg)) {
            if (_fg) return true;
            _fg.incrementAndGet();
        } else {
            global[_key] = threads.atomic(1);
        }

        images.requestScreenCapture(false);
        sleep(300);
        return true;
    }
}

/**
 * Returns a UiSelector with additional function(s) bound to its __proto__
 * @param [options]
 * @param [options.debug_info_flag] {boolean}
 * @returns {UiSelector} - with additional function(s)
 */
function getSelector(options) {
    let _opt = options || {};
    let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
    let _debugInfo = _msg => (
        typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo
    )(_msg, "", _opt.debug_info_flag);
    let _sel = global["selector"]();
    _sel.__proto__ = _sel.__proto__ || {};
    Object.assign(_sel.__proto__, {
        kw_pool: {},
        cache_pool: {},
        /**
         * Returns a selector (UiSelector) or node (UiObject) or some attribute
         * If no nodes (UiObjects) were found, returns null or "" or false
         * If memory_keyword was found in this session memory, use a memorized selector directly without selecting
         * @memberOf getSelector
         * @param sel_body {string|RegExp|array} - selector body will be converted into array type
         * <br>
         *     -- array: [ [selector_body] {*}, <[additional_selectors] {array|object}>, [compass] {string} ]
         *     -- additional_selectors can be treated as compass by checking its type (whether object or string)
         * @param [mem_kw {string|null}] - to mark this selector node; better use a keyword without conflict
         * @param [res_type="node"] {string} - "node", "txt", "text", "desc", "id", "bounds", "exist(s)" and so forth
         * <br>
         *     -- "txt": available text()/desc() value or empty string
         * @param [par] {object}
         * @param [par.selector_prefer="desc"] {string} - unique selector you prefer to check first; "text" or "desc"
         * @param [par.debug_info_flag] {boolean}
         * @returns {UiObject|UiSelector|string|boolean|Rect|*} - default: UiObject
         * @example
         * // text/desc/id("abc").findOnce();
         * // UiObject
         * pickup("abc");
         * // same as above
         * pickup("abc", "node", "my_alphabet");
         * // text/desc/id("abc");
         * // UiSelector
         * pickup("abc", "sel", "my_alphabet");
         * // text("abc").findOnce()
         * pickup(text("abc"), "node", "my_alphabet");
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
        pickup: (sel_body, res_type, mem_kw, par) => {
            let _sel_body = _classof(sel_body) === "Array" ? sel_body.slice() : [sel_body];
            let _params = Object.assign({}, _opt, par);
            let _res_type = (res_type || "").toString();

            if (!_res_type || _res_type.match(/^n(ode)?$/)) {
                _res_type = "node";
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
            let _node = null;
            let _nodes = [];
            if (_kw && _kw.toString().match(/UiObject/)) {
                _node = _kw;
                if (_res_type === "nodes") {
                    _nodes = [_kw];
                }
                _kw = null;
            } else {
                _node = _kw ? _kw.findOnce() : null;
                if (_res_type === "nodes") {
                    _nodes = _kw ? _kw.find() : [];
                }
            }

            if (_compass) {
                _node = _relativeNode([_kw || _node, _compass]);
            }

            let _res = {
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

            if (_res_type in _res) {
                return _res[_res_type];
            }

            try {
                if (!_node) {
                    return null;
                }
                return _node[_res_type]();
            } catch (e) {
                try {
                    return _node[_res_type];
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
             * Returns a relative node (UiObject) by compass string
             * @param nod_info {array|*} - [node, compass]
             * @returns {null|UiObject}
             * @example
             * // text("Alipay").findOnce().parent().parent();
             * relativeNode([text("Alipay"), "pp"]);
             * // text("Alipay").findOnce().parent().parent();
             * relativeNode([text("Alipay").findOnce(), "p2"]);
             * // id("abc").findOnce().parent().parent().parent().child(2);
             * relativeNode([id("abc"), "p3c2"]);
             * // id("abc").findOnce().parent().child(5);
             * // returns an absolute sibling
             * relativeNode([id("abc"), "s5"/"s5p"]);
             * // id("abc").findOnce().parent().child(%childCount% - 5);
             * // abs sibling
             * relativeNode([id("abc"), "s5n"]);
             * // id("abc").findOnce().parent().child(%indexInParent()% + 3);
             * // rel sibling
             * relativeNode([id("abc"), "s+3"]);
             * // id("abc").findOnce().parent().child(%indexInParent()% - 2);
             * // rel sibling
             * relativeNode([id("abc"), "s-2"]);
             */
            function _relativeNode(nod_info) {
                let classof = o => Object.prototype.toString.call(o).slice(8, -1);

                let _nod_inf = classof(nod_info) === "Array"
                    ? nod_info.slice()
                    : [nod_info];

                let _nod = _nod_inf[0];
                let _node_class = classof(_nod);
                let _node_str = (_nod || "").toString();

                if (typeof _nod === "undefined") {
                    _debugInfo("relativeNode的node参数为Undefined");
                    return null;
                }
                if (classof(_nod) === "Null") {
                    // _debugInfo("relativeNode的node参数为Null");
                    return null;
                }
                if (_node_str.match(/^Rect\(/)) {
                    // _debugInfo("relativeNode的node参数为Rect()");
                    return null;
                }
                if (_node_class === "JavaObject") {
                    if (_node_str.match(/UiObject/)) {
                        // _debugInfo("relativeNode的node参数为UiObject");
                    } else {
                        // _debugInfo("relativeNode的node参数为UiSelector");
                        _nod = _nod.findOnce();
                        if (!_nod) {
                            // _debugInfo("UiSelector查找后返回Null");
                            return null;
                        }
                    }
                } else {
                    _debugInfo("未知的relativeNode的node参数", 3);
                    return null;
                }

                let _compass = _nod_inf[1];

                if (!_compass) {
                    // _debugInfo("relativeNode的罗盘参数为空");
                    return _nod;
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
                            let _child_cnt = _nod.parent().childCount();
                            let _cur_idx = _nod.indexInParent();
                            _nod = _rel_mch[0].match(/\d+[bn]/)
                                ? _nod.parent().child(_child_cnt - Math.abs(_rel_amt))
                                : _nod.parent().child(_cur_idx + _rel_amt);
                        } else if (_abs_mch) {
                            _nod = _nod.parent().child(
                                parseInt(_abs_mch[0].match(/\d+/)[0])
                            );
                        }
                        _compass = _compass.replace(/s[+\-]?\d+([fbpn](?!\d+))?/, "");
                        if (!_compass) {
                            return _nod;
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
                        if (!(_nod = _nod.parent())) {
                            return null;
                        }
                    }
                }

                let _mch = _compass.match(/c\d+/g);
                return _mch ? _childNode(_mch) : _nod;

                // tool function(s) //

                function _childNode(arr) {
                    let _len = arr.length;
                    for (let i = 0; i < _len; i += 1) {
                        try {
                            let _idx = +arr[i].match(/\d+/);
                            _nod = _nod.child(_idx);
                        } catch (e) {
                            return null;
                        }
                    }
                    return _nod || null;
                }
            }
        },
        add: function (key, sel_body, kw) {
            let _kw = typeof kw === "string" ? kw : key;
            this.kw_pool[key] = typeof sel_body === "function"
                ? type => sel_body(type)
                : type => this.pickup(sel_body, type, _kw);
            return this;
        },
        get: function (key, type) {
            let _picker = this.kw_pool[key];
            if (!_picker) {
                return null;
            }
            if (type && type.toString().match(/cache/)) {
                return this.cache_pool[key] = _picker("node");
            }
            return _picker(type);
        },
        getAndCache: function (key) {
            // only "node" type can be returned
            return this.get(key, "save_cache");
        },
        cache: {
            save: (key) => _sel.getAndCache(key),
            load: (key, type) => {
                let _node = _sel.cache_pool[key];
                if (!_node) {
                    return null;
                }
                return _sel.pickup(_sel.cache_pool[key], type);
            },
            refresh: function (key) {
                let _cache = _sel.cache_pool[key];
                _cache && _cache.refresh();
                this.save(key);
            },
            reset: (key) => {
                delete _sel.cache_pool[key];
                return _sel.getAndCache(key);
            },
            recycle: (key) => {
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
 * @param [mark_left='"'] {*} - will be converted to String format
 * @param [mark_right=mark_left] {*} - will be converted to String format
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
 * @param [operation] {boolean|number|string}
 * <br>
 * put a timestamp: "put"; "save"; false value <br>
 * load time gap: "load", "get", any other true value <br>
 * @param [divisor=1] {number|"auto"} - "auto" for picking up a result intelligently
 * @param [fixed] {array|number} - array: max decimal places (last place won't be 0)
 * @param [suffix=""|"$$ch"] {string} - "$$en" or "$$ch" is available when %divisor% is set "auto"
 * @param [override_timestamp] {number|Date}
 * @returns {number|string} - timestamp or time gap with/without a certain format or suffix string
 * @example
 * // result eg: 1565080123796
 * timeRecorder("running", "put");
 * timeRecorder("running", "get");
 * //
 * // result eg: "12.40s"
 * timeRecorder("collect", "save");
 * timeRecorder("collect", "load", 1000, 2, "s");
 * //
 * // result eg: 18 hours"
 * timeRecorder("waiting", 0);
 * timeRecorder("waiting", 1, 3.6 * Math.pow(10, 6), 0, " hours");
 * //
 * // result eg: 10.331 (not "10.3310000")
 * timeRecorder("try_peeking");
 * timeRecorder("try_peeking", "time_gap", 1000, [7]);
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
                return 1000 * this.ms;
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
 * @param [options={}] {object}
 * @param [options.name] {string} - pipeline name
 * @param [options.interval=0] {number}
 * @param [options.max_try_times=5] {number}
 * @param [options.default_strategy="click"] {string}
 * @param [options.debug_info_flag] {boolean}
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

    let pipe = pipeline.filter(value => typeof value !== "undefined").map(value => {
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
        while (max_try_times-- > 0 && !_waitForAction(condition === null ? kw_keyword : condition, 1500)) {
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

    function clickActionRaw(kw) {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _kw = classof(kw) === "Array" ? kw[0] : kw;
        let _key_node = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
        if (!_key_node) return;
        let _bounds = _key_node.bounds();
        click(_bounds.centerX(), _bounds.centerY());
        return true;
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
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10000;
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
 * @param src {Array|ImageWrapper|UiObject|UiObjectCollection} -- will be converted into ImageWrapper(s)
 * @param [par] {object}
 * @param [par.no_toast_msg_flag=false] {boolean}
 * @param [par.fetch_times=1] {boolean}
 * @param [par.fetch_interval=100] {number}
 * @param [par.debug_info_flag=false] {boolean}
 * @param [par.timeout=60000] {number} -- no less than 5000
 * @returns {Array|Array[]} -- [] or [[], [], []...]
 * @example
 * // @see "MODULE_MONSTER_FUNC.js"
 * let sel = getSelector();
 * // [[], [], []] -- 3 groups of data
 * baiduOcr(sel.pickup(/\xa0/, "nodes"), {
 *     fetch_times: 3,
 *     timeout: 12000
 * });
 */
function baiduOcr(src, par) {
    if (!src) return [];

    par = par || {};

    let _tt = par.timeout || 60000;
    if (!+_tt || _tt < 5000) _tt = 5000;
    let _tt_ts = +new Date() + _tt;

    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _showSplitLine = typeof showSplitLine === "undefined" ? showSplitLineRaw : showSplitLine;
    let _debugInfo = (_msg) => {
        if (!par.debug_info_flag) return null;
        return (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, "", true);
    };

    let _msg = "使用baiduOcr获取数据";
    _debugInfo(_msg);
    if (!par.no_toast_msg_flag) toast(_msg);

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
        _messageAction("baiduOcr获取access_token失败", 3, +!par.no_toast_msg_flag, 0, "both_dash");
        return [];
    }
    if (_thd_token.isAlive()) {
        let _msg = "baiduOcr获取access_token超时";
        let _toast = +!par.no_toast_msg_flag;
        _messageAction(_msg, 3, _toast, 0, "both_dash");
        return [];
    }

    let _$$und = o => typeof o === "undefined";
    let _capt = _$$und(images.permit) ? permitCapt : images.permit;
    _capt();

    let _max = par.fetch_times || 1;
    let _max_b = _max;
    let _itv = par.fetch_interval || 300;
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
            let img = stitchImages(src);
            if (!img) return [];

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
                    image: images.toBase64(img), // images.read(img_file) for local file
                    image_type: "BASE64",
                };
                let _response = http.post(_url, _opt).body.string();
                let _words = JSON.parse(_response)["words_result"];
                let _words_res = _words.map(val => val["words"]);
                let _suffix = _max_b > 1 ? "[" + _cur + "]" : "";
                _debugInfo("数据" + _suffix + "获取成功");

                img.recycle();
                img = null;

                _res.push(_words_res);
            } catch (e) {
                if (!e.message.match(/InterruptedIOException/)) {
                    throw (e);
                }
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
                let _toast = +!par.no_toast_msg_flag;
                _messageAction(_msg, 3, _toast, 0, "up_dash");

                if (_res.length) {
                    _messageAction("已获取的数据可能不完整", 3);
                }
                _showSplitLine("", "dash");
            }
        }
    });

    while (sleep(500) || true) {
        if (_allDead()) {
            if (!par.no_toast_msg_flag && _res.length) {
                toast("baiduOcr获取数据完毕");
            }
            return _max_b === 1 ? _res[0] : _res;
        }
    }

    // tool function(s) //

    function stitchImages(imgs) {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let getType = (o) => {
            let matched = o.toString().match(/\w+(?=@)/);
            return matched ? matched[0] : "";
        };
        let nodeToImage = (node) => {
            let clipImg = bounds => images.clip(images.captureScreen(), bounds.left, bounds.top, bounds.width(), bounds.height());
            try {
                // XXX: Nov 11, 2019 by SuperMonster003
                // there is a strong possibility that `node.bounds()` would throw an exception
                // like "Cannot find function bounds in object xxx.xxx.xxx.UiObject@abcde"
                let bounds = {};
                let regexp = /.*boundsInScreen:.*\((\d+), (\d+) - (\d+), (\d+)\).*/;
                node.toString().replace(regexp, ($0, $1, $2, $3, $4) => {
                    bounds = {
                        left: +$1, top: +$2, right: +$3, bottom: +$4,
                        width: () => $3 - $1, height: () => $4 - $2,
                    };
                });
                return clipImg(bounds);
            } catch (e) {
                // just in case
            }
        };
        let nodesToImage = (nodes) => {
            let imgs = [];
            nodes.forEach((node) => {
                let img = nodeToImage(node);
                img && imgs.push(img);
            });
            return stitchImg(imgs);
        };
        let stitchImg = (imgs) => {
            if (getType(imgs) === "ImageWrapper" && classof(imgs) !== "Array") return imgs;
            if (imgs.length === 1) return imgs[0];
            let stitched = imgs[0];
            imgs.forEach((img, idx) => stitched = idx ? images.concat(stitched, img, "BOTTOM") : stitched);
            return stitched;
        };
        if (classof(imgs) !== "Array") imgs = [imgs].slice();
        imgs = imgs.map(img => {
            let type = getType(img);
            if (type === "UiObject") return nodeToImage(img);
            if (type === "UiObjectCollection") return nodesToImage(img);
            return img;
        });
        return stitchImg(imgs);
    }

    function permitCapt() {
        let _$$isJvo = x => x && !!x["getClass"];
        let _key = "_$_request_screen_capture";
        let _fg = global[_key];
        let _cwd = engines.myEngine().cwd();
        let _path = _cwd + "/Modules/EXT_IMAGES.js";

        if (files.exists(_path)) {
            return require(_path).permit();
        }

        if (_$$isJvo(_fg)) {
            if (_fg) return true;
            _fg.incrementAndGet();
        } else {
            global[_key] = threads.atomic(1);
        }

        images.requestScreenCapture(false);
        sleep(300);
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
 * @param [interval=200] {number}
 * @param [timeout] {number|function} -- undefined: no timeout limitation; number|function: stop when timeout|timeout() reached
 * @example
 * // print "hello" every 1 second for 5 (or 4 sometimes) times
 * setIntervalBySetTimeout(() => {
 *     console.log("hello");
 * }, 1000, 5000);
 */
function setIntervalBySetTimeout(func, interval, timeout) {
    interval = interval || 200;
    let init_timestamp = +new Date();
    let timeoutReached = typeof timeout === "function" ? timeout : () => {
        return +new Date() - init_timestamp >= timeout;
    };
    setTimeout(function fn() {
        func();
        timeoutReached() || setTimeout(fn, interval);
    }, interval);
}

/**
 * Returns the class name of an object or any type of param, or, returns if the result is the same as specified
 * @param source {*} - any type of param
 * @param [check_value] {string}
 * @returns {boolean|string}
 */
function classof(source, check_value) {
    let class_result = Object.prototype.toString.call(source).slice(8, -1);
    return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
}

/**
 * Check if device is running compatible (relatively) Auto.js version and android sdk version
 * @param [params] {object}
 * @param [params.debug_info_flag] {boolean}
 */
function checkSdkAndAJVer(params) {
    global["$$app"] = global["$$app"] || {};
    let $$app = global["$$app"];

    let _par = params || {};

    let _waitForAction = typeof waitForAction === "undefined"
        ? waitForActionRaw
        : waitForAction;
    let _messageAction = typeof messageAction === "undefined"
        ? messageActionRaw
        : messageAction;
    let _clickAction = typeof clickAction === "undefined"
        ? clickActionRaw
        : clickAction;
    let _debugInfo = (m, fg) => (typeof debugInfo === "undefined"
        ? debugInfoRaw
        : debugInfo)(m, fg, _par.debug_info_flag);

    let _aj_pkg = $$app.cur_autojs_pkg = context.packageName;
    let _aj_ver = _getVerName(_aj_pkg) || "0";
    let _aj_pro_suff = _aj_pkg.match(/pro/) ? " Pro" : "";
    $$app.cur_autojs_name = "Auto.js" + _aj_pro_suff;
    $$app.autojs_ver = _aj_ver;
    $$app.project_ver = _getProjectVer();

    _chkSdk();
    _chkVer();

    // tool function(s) //

    function _getVerName(pkg) {
        try {
            let _pkgs = context.getPackageManager().getInstalledPackages(0).toArray();
            for (let i in _pkgs) {
                let _pkg = _pkgs[i];
                if (_pkg.packageName.toString() === pkg) {
                    return _pkg["versionName"];
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
        $$app.sdk_ver = sdk_ver;
        if (sdk_ver >= 24) return true;
        _messageAction("脚本无法继续", 4, 0, 0, "up");
        _messageAction("安卓系统版本低于7.0", 8, 1, 1, "\n");
    }

    function _chkVer() {
        let _bugs_map = {
            failed: "版本信息获取失败\n不建议使用此版本运行项目",
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
            ab_ui_layout: "图形配置页面布局异常",
            crash_autojs: "脚本运行后导致Auto.js崩溃",
            crash_ui_call_ui: "ui脚本调用ui脚本会崩溃",
            crash_ui_settings: "图形配置页面崩溃",
            dislocation_floaty: "Floaty模块绘制存在错位现象",
            dialogs_event: "Dialogs模块事件失效",
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
            not_full_function: "此版本可能未包含所需全部功能",
        };

        let _bug_chk_res = _chkBugs(_aj_ver);
        if (_bug_chk_res === 0) {
            return _debugInfo("Bug版本检查: 正常");
        }
        if (_bug_chk_res === "") {
            return _debugInfo("Bug版本检查: 未知");
        }
        _bug_chk_res = _bug_chk_res.map((bug_code) => (
            "\n-> " + (_bugs_map[bug_code] || "/* 无效的Bug描述 */"))
        );

        _debugInfo("Bug版本检查: 确诊");

        let _bug_cont = "脚本可能无法正常运行\n建议更换Auto.js版本\n\n" +
            "当前版本:\n-> " + (_aj_ver || "/* 版本检测失败 */") +
            "\n\n异常详情:" + _bug_chk_res.join();

        let _continue_sgn = false;
        let _known_diag_bug_ver = ["Pro 7.0.3-1"];
        let _diag;
        if (!~_known_diag_bug_ver.indexOf(_aj_ver)) {
            _diag = dialogs
                .build({
                    title: "Auto.js版本异常提示",
                    content: _bug_cont,
                    neutral: "为何出现此提示",
                    neutralColor: "#03a6ef",
                    negative: "退出",
                    negativeColor: "#33bb33",
                    positive: "尝试继续",
                    positiveColor: "#ee3300",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                })
                .on("neutral", () => {
                    dialogs
                        .build({
                            title: "什么是版本异常",
                            content: "此项目无法保证所有的\n" +
                                "Auto.js版本均正常运行\n\n" +
                                "此异常结果由开发者测试并提供",
                            positive: "OK",
                            autoDismiss: false,
                            canceledOnTouchOutside: false,
                        })
                        .on("positive", d => d.dismiss())
                        .show();
                })
                .on("negative", (d) => {
                    d.dismiss();
                    exit();
                })
                .on("positive", (d) => {
                    _messageAction("用户选择了尝试运行Bug版本", 3, 0, 0, -1);
                    _continue_sgn = true;
                    d.dismiss();
                })
                .show();
        } else {
            _debugInfo(["dialogs模块功能异常", "使用alert()方法替代"], 3);

            if (typeof threads === "undefined") {
                alert(
                    _bug_cont + "\n\n" +
                    "按'确定/OK'键停止执行"
                );
                exit();
            }
            threads.start(function () {
                events.removeAllKeyDownListeners("volume_up");
                events.removeAllKeyDownListeners("volume_down");
                events.observeKey();
                events.onKeyDown("volume_down", function (e) {
                    _debugInfo("用户按下音量减键");
                    _debugInfo("尝试点击确定按钮");
                    _clickAction(textMatches(/OK|确定/), "w");
                    _messageAction("脚本已停止", 4, 1);
                    _messageAction("用户终止运行", 4, 0, 1);
                    exit();
                });
            });
            alert(
                _bug_cont + "\n\n" +
                "按'确定/OK'键尝试继续执行\n" +
                "按'音量减/VOL-'键停止执行"
            );
        }
        if (!_waitForAction(() => _continue_sgn, 60000, 300)) {
            _diag && _diag.dismiss();
            let _m = "等待用户操作超时";
            _messageAction(_m, 9, 1, 0, "both");
        }

        // tool function(s) //

        /**
         * @return {string[]|number|string} -- strings[]: bug codes; 0: normal; "": unrecorded
         */
        function _chkBugs(ver_name) {
            let _ver = ver_name || "0";

            // version <= 3.0.0 Alpha20
            if (_ver.match(/^3\.0\.0 Alpha([1-9]|1\d|20)?$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "crash_ui_settings", "not_full_function"];
            }

            // 3.0.0 Alpha21 <= version <= 3.0.0 Alpha36
            if (_ver.match(/^3\.0\.0 Alpha(2[1-9]|3[0-6])$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // 3.0.0 Alpha37 <= version <= 3.0.0 Alpha41
            if (_ver.match(/^3\.0\.0 Alpha(3[7-9]|4[0-1])$/)) {
                return ["ab_cwd", "un_relative_path", "un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // version >= 3.0.0 Alpha42 || version ∈ 3.0.0 Beta[s] || version <= 3.1.0 Alpha5
            if (_ver.match(/^((3\.0\.0 ((Alpha(4[2-9]|[5-9]\d))|(Beta\d?)))|(3\.1\.0 Alpha[1-5]?))$/)) {
                return ["un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // version >= 3.1.0 Alpha6 || version <= 3.1.1 Alpha2
            if (_ver.match(/^((3\.1\.0 (Alpha[6-9]|Beta))|(3\.1\.1 Alpha[1-2]?))$/)) {
                return ["un_inflate", "un_engines", "not_full_function"];
            }

            // 3.1.1 Alpha3 <= version <= 3.1.1 Alpha4:
            if (_ver.match(/^3\.1\.1 Alpha[34]$/)) {
                return ["ab_inflate", "un_engines", "not_full_function"];
            }

            // version >= 3.1.1 Alpha5 || version -> 4.0.0/4.0.1 || version <= 4.0.2 Alpha6
            if (_ver.match(/^((3\.1\.1 Alpha[5-9])|(4\.0\.[01].+)|(4\.0\.2 Alpha[1-6]?))$/)) {
                return ["un_execArgv", "ab_inflate", "not_full_function"];
            }

            // version >= 4.0.2 Alpha7 || version === 4.0.3 Alpha([1-5]|7)?
            if (_ver.match(/^((4\.0\.2 Alpha([7-9]|\d{2}))|(4\.0\.3 Alpha([1-5]|7)?))$/)) {
                return ["dislocation_floaty", "ab_inflate", "not_full_function"];
            }

            // 4.1.0 Alpha3 <= version <= 4.1.0 Alpha4
            if (_ver.match(/^4\.1\.0 Alpha[34]$/)) {
                return ["ab_SimpActAuto"];
            }

            // version === Pro 7.0.0-(1|2)
            if (_ver.match(/^Pro 7\.0\.0-[12]$/)) {
                return ["ab_relative_path"];
            }

            // version === Pro 7.0.0-7 || version === Pro 7.0.1-0 || version === Pro 7.0.2-(0|3)
            if (_ver.match(/^Pro 7\.0\.((0-7)|(1-0)|(2-[03]))$/)) {
                return ["crash_autojs"];
            }

            // other 4.0.x versions
            if (_ver.match(/^4\.0\./)) {
                return ["not_full_function"];
            }

            // version === 4.1.0 Alpha(2|5)? || version ∈ 4.1.1
            // version === Pro 7.0.0-(4|6) || version === Pro 7.0.2-4
            // version === Pro 7.0.3-7 || version === Pro 7.0.4-1
            if (_ver.match(/^((4\.1\.0 Alpha[25]?)|(4\.1\.1.+))$/) ||
                _ver.match(/^Pro 7\.0\.((0-[46])|(2-4))$/) ||
                _ver === "Pro 7.0.3-7" ||
                _ver === "Pro 7.0.4-1"
            ) {
                return 0; // known normal
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

    function clickActionRaw(kw) {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _kw = classof(kw) === "Array" ? kw[0] : kw;
        let _key_node = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
        if (!_key_node) return;
        let _bounds = _key_node.bounds();
        click(_bounds.centerX(), _bounds.centerY());
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
 * Just for dismissing warning hints by IDE like WebStorm
 * May be helpful for developer who runs codes at Auto.js
 * Do not invoke this function in case of overriding exceptions
 */
function __dismissIDEWarnings__() {
    // love me, but do not invoke me

    if (typeof $$sel === "undefined") $$sel = {};
    let {Integer} = java.lang; // TODO java.__proto__

    Object.assign(dialogs, {
        setItems: arr => $$und,
        getItems: () => $$arr,
        getContentView: () => new View(),
        getTitleView: () => new View(),
        getActionButton: btn_name => $$str(btn_name),
        setContent: str => $$und(str),
        setActionButton: (btn_name, str) => $$und(btn_name, str),
        promptCheckBoxChecked: Boolean(),
        isPromptCheckBoxChecked: () => Boolean(),
        selectedIndex: Integer(),
        getSelectedIndex: () => $$num,
        selectedIndices: [],
        getSelectedIndices: () => $$arr,
        items: [],
        isCancelled: () => Boolean(),
        getInputEditText: () => String(),
    });
    Object.assign(engines, {
        myEngine: () => ({
            source: {
                toString: () => String(),
            },
            forceStop: () => void 0,
            setTag: (str, obj) => void 0,
            getTag: str => $$obj,
            cwd: () => String(),
            id: $$num,
            execArgv: $$obj,
        }),
        all: () => $$arr,
        stopAllAndToast: () => void 0,
    });
    Object.assign(events, {
        removeAllKeyDownListeners: str => this,
        observeKey: () => void 0,
        onKeyDown: (str, obj) => this,
        onKeyUp: (str, obj) => this,
        onceKeyDown: (str, obj) => this,
        onceKeyUp: (str, obj) => this,
        setKeyInterceptionEnabled: (str_$_bool, bool) => {
            return void 0;
        },
        getAction: () => $$num,
        getX: () => $$num,
        getY: () => $$num,
        getEventTime: () => $$num,
        getDownTime: () => $$num,
    });
    Object.assign(threads, {
        start: runnable => $$jvo.Thread,
        interrupt: () => void 0,
        isAlive: () => Boolean(),
        shutDownAll: () => void 0,
        join: num => void 0,
        atomic: num => $$jvo.AtomicLong,
        AtomicLong: {
            incrementAndGet: () => $$num,
            decrementAndGet: () => $$num,
            compareAndSet: (long1, long2) => Boolean(),
        },
        getKeyCode: () => $$num,
    });
    Object.assign($$sel, {
        findOnce: UiObject => $$jvo.UiObject,
        childCount: () => $$num,
        children: () => $$jvo.UiObjects,
        setText: str => Boolean(),
        parent: () => $$jvo.UiObject,
        clickable: () => Boolean(),
        scrollable: bool => $$jvo.UiGlobSel,
        idContains: bool => $$jvo.UiGlobSel,
        indexInParent: () => $$jvo.UiObject,
        bounds: () => ({
            width: () => $$num,
            height: () => $$num,
            centerX: () => $$num,
            centerY: () => $$num,
        }),
    });
    Object.assign(floaty, {
        rawWindow: xml => $$jvo.JsRawWin,
        setBackgroundColor: num => void 0,
        setSize: (num1, num2) => void 0,
        closeAll: () => void 0,
        getWidth: () => $$num,
        setTouchable: bool => void 0,
        setOnTouchListener: func => void 0,
    });
    Object.assign(images, {
        read: str => $$jvo.ImageWrapper,
        load: str => $$jvo.ImageWrapper,
        copy: image => $$jvo.ImageWrapper,
        save: (image, path, format, quality) => Boolean(),
        fromBase64: str => $$jvo.ImageWrapper,
        toBase64: (img, format, quality) => String(),
        fromBytes: str => $$jvo.ImageWrapper,
        toBytes: (img, format, quality) => [],
        clip: (img, x, y, w, h) => $$jvo.ImageWrapper,
        resize: (img, size, interpolation) => $$jvo.ImageWrapper,
        scale: (img, fx, fy, interpolation) => $$jvo.ImageWrapper,
        rotate: (img, degree, x, y) => $$jvo.ImageWrapper,
        concat: (img1, img2, direction) => $$jvo.ImageWrapper,
        requestScreenCapture: bool => Boolean(),
        captureScreen: path => $$jvo.ImageWrapper,
        recycle: () => void 0,
        findImage: (img, tpl, opt) => $$jvo.ImageWrapper,
        findColor: (img, color, opt) => $$jvo.Point,
        pixel: (img, x, y) => $$num,
        findMultiColors: (img, first_color, paths, opt) => $$jvo.Point,
        findColorInRegion: (img, color, x, y, w, h, thrd) => $$jvo.Point,
        findColorEquals: (img, color, x, y, w, h) => $$jvo.Point,
        detectsColor: (img, color, x, y, threshold, algorithm) => Boolean(),
        matchTemplate: (img, tpl, opt) => {/* "MatchingResult" */
        },
        getWidth: () => $$num, // TODO this doesn't belong to images
        getHeight: () => $$num, // TODO this doesn't belong to images
    });
    Object.assign(colors, {
        isSimilar: (c1, c2, threshold, algorithm) => Boolean(),
        parseColor: str => $$num,
        red: (str_$_num) => $$num,
        green: (str_$_num) => $$num,
        blue: (str_$_num) => $$num,
        toString: (num) => $$str,
        rgb: (num1, num2, num3) => $$num,
    });
    Object.assign(files, {
        getSdcardPath: () => String(),
        cwd: () => String(),
        createWithDirs: str => Boolean(),
        remove: str => Boolean(),
        path: str => String(),
        exists: str => Boolean(),
        removeDir: str => Boolean(),
    });
    Object.assign(auto, {
        waitFor: () => void 0,
    });
    Object.assign(app, {
        launchPackage: str => Boolean(),
        launchApp: str => Boolean(),
        getAppName: str => String(),
        startActivity: obj$str => void 0,
        viewFile: str => void 0,
    });
    Object.assign(device, {
        isScreenOn: () => Boolean(),
        keepScreenOn: num => void 0,
        cancelKeepingAwake: () => void 0,
        brand: String(),
        wakeUp: () => void 0,
        wakeUpIfNeeded: () => void 0,
        vibrate: num => void 0,
    });
    Object.assign(console, {
        verbose: str => void 0,
    });
    Object.assign(android, {
        provider: {
            Settings: {
                System: {
                    SCREEN_OFF_TIMEOUT: String(),
                    getInt: (context_resolver, str, num) => Integer(),
                    putInt: (context_resolver, str, num) => Boolean(),
                    canWrite: () => null,
                },
                Global: {
                    STAY_ON_WHILE_PLUGGED_IN: String(),
                    getInt: (context_resolver, str, num) => Integer(),
                    putInt: (context_resolver, str, num) => Boolean(),
                },
                Secure: {
                    DEVELOPMENT_SETTINGS_ENABLED: String(),
                    getInt: (context_resolver, svc, num) => Integer(),
                    putInt: (context_resolver, svc, num) => Boolean(),
                    getString: (context_resolver, svc, str) => String(),
                    putString: (context_resolver, svc, str) => Boolean(),
                },
            },
        },
        view: {
            MotionEvent: {
                ACTION_DOWN: Integer(),
                ACTION_UP: Integer(),
                ACTION_MOVE: Integer(),
            },
            ViewParent: function (Layout) {

            },
            KeyEvent: {
                ACTION_DOWN: Integer(),
                ACTION_UP: Integer(),
                ACTION_MOVE: Integer(),
                keyCodeToString: num => $$str,
            },
        },
        content: {
            Intent: function () {
                this.FLAG_ACTIVITY_NEW_TASK = "$$num";
                this.setClassName = (pkg_nm, class_nm) => android.content.Intent;
                this.putExtra = (str, arr) => android.content.Intent;
                this.addCategory = str => android.content.Intent;
                this.setAction = str => android.content.Intent;
                this.setFlags = num => android.content.Intent;
                this.setDataAndType = (Uri, str) => android.content.Intent;
                this.setType = str => android.content.Intent;
                this.addFlags = num => android.content.Intent;
                this.extras = [];
                this.category = [];
            },
        },
        widget: {
            LinearLayout: function (ctx) {
                this.addView = View => void 0;
                this.getParent = () => android.view.ViewParent;
            },
            CheckBox: function (ctx) {
                this.setChecked = bool => void 0;
            }
        },
    });
    Object.assign(context, {
        getContentResolver: () => "ContentResolver",
        getPackageName: () => String(),
        getPackageManager: function () {
            return {
                queryIntentActivities: (Intent, num) => "queryIntentActivities",
            };
        },
    });
    Object.assign(timers, {
        setMillis: num => void 0,
    });
    Object.assign(http, {
        post: function (url, data, options, callback) {
            return {
                statusCode: Integer(),
                statusMessage: String(),
                headers: {},
                body: {
                    bytes: () => [],
                    string: () => String(),
                    json: () => {
                    },
                    contentType: String(),
                },
            };
        },
        __okhttp__: {
            client: () => "okhttp3.OkHttpClient",
        },
        client: function () {
            return this.__okhttp__.client();
        }
    });
    Object.assign(ui, {
        finish: () => void 0,
    });

    // constructor(s) //

    function View() {
        this.getText = () => $$obj;
        this.setTextColor = (num) => $$und;
        this.setVisibility = (num) => $$und;
        this.removeAllViews = () => $$und;
        this.setClickable = (bool) => $$und;
        this.getChildCount = () => $$num;
        this.getChildAt = (num) => this;
        this.indexOfChild = (View) => $$num;
        this.findViewWithTag = (str) => this;
    }
}