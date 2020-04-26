let $_dev = global["device"];
if (!$_dev) {
    $_dev = global["device"] = {};
}
if (!$_dev.__proto__) {
    $_dev.__proto__ = {};
}

let ext = {
    /**
     * device.keepScreenOn()
     * @param [duration] {number} could be minute (less than 100) or second -- 5 and 300000 both for 5 min
     * @param [params] {object}
     * @param [params.debug_info_flag] {boolean}
     */
    keepOn: function (duration, params) {
        params = params || {};
        duration = duration || 5;
        if (duration < 100) duration *= 60000;
        $_dev.keepScreenOn(duration);
        if (params.debug_info_flag !== false) {
            debugInfo("已设置屏幕常亮");
            debugInfo(">最大超时时间: " + +(duration / 60000).toFixed(2) + "分钟");
        }
    },
    /**
     * device.cancelKeepingAwake()
     * @param [params] {object}
     * @param [params.debug_info_flag] {boolean}
     */
    cancelOn: function (params) {
        // click(Math.pow(10, 7), Math.pow(10, 7));
        params = params || {};
        $_dev.cancelKeepingAwake();
        if (params.debug_info_flag !== false) {
            debugInfo("屏幕常亮已取消");
        }
    },
    /**
     * Vibrate the device with pattern and repeat times
     * @param pattern {number|array} -- vibrate pattern
     * <br>
     * -- odd: delay time; <br>
     * -- even: vibrate time; <br>
     * -- nums less than 10 will be multiplied by 1000
     * @param [repeat=1] {number} -- repeat times
     * <br>
     * -- times less than 1 or without number type will be reset to 1
     * @example
     * // a pattern and default repeat times (one time)
     * device.vibrates([0, 0.1, 0.3, 0.1, 0.3, 0.2]);
     * // pattern could be spread with one-time repeat
     * device.vibrates(0, 0.1, 0.3, 0.1, 0.3, 0.2);
     * // repeat twice
     * device.vibrates([0, 0.1, 0.3, 0.1, 0.3, 0.2, 0.9], 2);
     */
    vibrates: function (pattern, repeat) {
        let _repeat;
        let _nums = pattern;
        if (typeof _nums !== "object") {
            _nums = [];
            let _len = arguments.length;
            for (let i = 0; i < _len; i += 1) {
                _nums[i] = arguments[i];
            }
            _repeat = 1;
        } else {
            _repeat = parseInt(repeat);
            if (!_repeat || _repeat < 0) {
                _repeat = 1;
            }
        }
        while (_repeat--) {
            let _len = _nums.length;
            for (let i = 0; i < _len; i += 1) {
                let arg = +_nums[i];
                if (arg < 10) arg *= 1000;
                i % 2 ? $_dev.vibrate(arg) : sleep(arg);
            }
        }
    },
    /**
     * Returns a state number which indicated phone calling state
     * @return {number}
     * <br>
     * -- 0: IDLE; <br>
     * -- 1: RINGING; <br>
     * -- 2: OFF-HOOK; <br>
     * // some device may behave abnormally <br>
     * -- 2: IDLE; <br>
     * -- 1: OFF-HOOK; <br>
     * // even always returns 0
     */
    getCallState: function () {
        let {ITelephony} = com.android.internal.telephony;
        let {ServiceManager} = android.os;

        let _svr_mgr = ITelephony.Stub.asInterface(
            ServiceManager.checkService("phone")
        );
        let _svc_ctx = context.getSystemService(
            context.TELEPHONY_SERVICE
        );

        return +_svr_mgr.getCallState() | +_svc_ctx.getCallState();
    },
    /**
     * Returns display screen width and height data, and converter functions with different aspect ratios
     * -- scaling based on Sony Xperia XZ1 Compact - G8441 (720 × 1280)
     * @param [global_assign=false] -- set true to set the global assignment
     * @param [params] {object}
     * @param [params.global_assign=false] {boolean}
     * <br>
     * -- takes effect only when arguments[0] is not boolean
     * @param [params.debug_info_flag=false] {boolean}
     * @example
     * let {
     *   WIDTH, HEIGHT, cX, cY,
     *   USABLE_WIDTH, USABLE_HEIGHT,
     *   screen_orientation,
     *   status_bar_height,
     *   navigation_bar_height,
     *   navigation_bar_height_computed,
     *   action_bar_default_height,
     * } = device.getDisplay(true);
     * console.log(WIDTH, HEIGHT, cX(80), cY(700), cY(700, 16 / 9);
     * console.log(W, H, cX(0.2), cY(0.45, "21:9"), cY(0.45, -1);
     * @return {*}
     */
    getDisplay: function (global_assign, params) {
        let $$flag = global["$$flag"];
        if (!$$flag) {
            $$flag = global["$$flag"] = {};
        }

        let _par;
        let _glob_asg;
        if (typeof global_assign === "boolean") {
            _par = params || {};
            _glob_asg = global_assign;
        } else {
            _par = global_assign || {};
            _glob_asg = _par.global_assign;
        }

        let _waitForAction = typeof waitForAction === "undefined"
            ? waitForActionRaw
            : waitForAction;
        let _debugInfo = (m, fg) => (typeof debugInfo === "undefined"
            ? debugInfoRaw
            : debugInfo)(m, fg, _par.debug_info_flag);
        let $_str = x => typeof x === "string";

        let _W, _H;
        let _disp = {};
        let _win_svc = context.getSystemService(context.WINDOW_SERVICE);
        let _win_svc_disp = _win_svc.getDefaultDisplay();

        if (!_waitForAction(() => _disp = _getDisp(), 3000, 500)) {
            return console.error("device.getDisplay()返回结果异常");
        }
        _showDisp();
        _assignGlob();
        return Object.assign(_disp, {cX: _cX, cY: _cY});

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

        function _assignGlob() {
            if (_glob_asg) {
                Object.assign(global, {
                    W: _W, WIDTH: _W,
                    halfW: Math.round(_W / 2),
                    uW: _disp.USABLE_WIDTH,
                    H: _H, HEIGHT: _H,
                    uH: _disp.USABLE_HEIGHT,
                    scrO: _disp.screen_orientation,
                    staH: _disp.status_bar_height,
                    navH: _disp.navigation_bar_height,
                    navHC: _disp.navigation_bar_height_computed,
                    actH: _disp.action_bar_default_height,
                    cX: _cX, cY: _cY,
                });
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
    },
    a11y: (() => {
        let {Secure} = android.provider.Settings;
        let {putInt, getString, putString} = Secure;
        let _ENABL_A11Y_SVC = Secure.ENABLED_ACCESSIBILITY_SERVICES;
        let _A11Y_ENABL = Secure.ACCESSIBILITY_ENABLED;
        let _ctx_reso = context.getContentResolver();
        let _aj_pkg = context.packageName;
        let _aj_svc = _aj_pkg + '/com.stardust.autojs' +
            '.core.accessibility.AccessibilityService';

        return {
            // eg: enable(pkg); enable(pkg, true);
            // eg: enable(true); enable(pkg[]);
            _parseArgs: function (args) {
                let _svc = [_aj_svc];
                let _forcible = false;
                let _type0 = typeof args[0];
                if (_type0 !== "undefined") {
                    if (_type0 === "object") {
                        _svc = args[0];
                        _forcible = !!args[1];
                    } else if (_type0 === "string") {
                        _svc = [args[0]];
                        _forcible = !!args[1];
                    } else if (_type0 === "boolean") {
                        _forcible = args[0];
                    }
                }
                return {
                    forcible: _forcible,
                    svc: _svc,
                };
            },
            enable: function () {
                try {
                    let _this = this;
                    let {forcible, svc} = this._parseArgs(arguments);
                    let _svc;
                    if (!this.state(svc)) {
                        _svc = this.enabled_svc.split(":").filter(x => !~svc.indexOf(x)).concat(svc).join(":");
                    } else if (forcible) {
                        _svc = this.enabled_svc;
                    }
                    if (_svc) {
                        putString(_ctx_reso, _ENABL_A11Y_SVC, _svc);
                        putInt(_ctx_reso, _A11Y_ENABL, 1);
                        if (!waitForAction(() => _this.state(svc), 2000)) {
                            throw Error("Result Exception");
                        }
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            },
            disable: function () {
                try {
                    let _args0 = arguments[0];
                    let $_str = x => typeof x === "string";
                    if ($_str(_args0) && _args0.toLowerCase() === "all") {
                        putString(_ctx_reso, _ENABL_A11Y_SVC, "");
                        putInt(_ctx_reso, _A11Y_ENABL, 1);
                        return true;
                    }
                    let {forcible, svc} = this._parseArgs(arguments);
                    let _enabled_svc = getString(_ctx_reso, _ENABL_A11Y_SVC);
                    let _contains = function () {
                        for (let i = 0, l = svc.length; i < l; i += 1) {
                            if (~_enabled_svc.indexOf(svc[i])) {
                                return true;
                            }
                        }
                    };
                    let _svc;
                    if (_contains()) {
                        _svc = _enabled_svc.split(":").filter(x => {
                            return !~svc.indexOf(x);
                        }).join(":");
                    } else if (forcible) {
                        _svc = _enabled_svc;
                    }
                    if (_svc) {
                        putString(_ctx_reso, _ENABL_A11Y_SVC, _svc);
                        putInt(_ctx_reso, _A11Y_ENABL, 1);
                        _enabled_svc = getString(_ctx_reso, _ENABL_A11Y_SVC);
                        if (!waitForAction(() => !_contains(), 2000)) {
                            throw Error("Result Exception");
                        }
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            },
            restart: function () {
                return this.disable.apply(this, arguments) && this.enable.apply(this, arguments);
            },
            state: function (x) {
                let _enabled_svc = this.enabled_svc = getString(_ctx_reso, _ENABL_A11Y_SVC);
                if (typeof x === "undefined") {
                    x = [_aj_svc];
                } else if (typeof x === "string") {
                    x = [x];
                }
                for (let i = 0, l = x.length; i < l; i += 1) {
                    if (!~_enabled_svc.indexOf(x[i])) {
                        return false;
                    }
                }
                return true;
            },
            services: function () {
                return getString(_ctx_reso, _ENABL_A11Y_SVC).split(":").filter(x => !!x);
            },
        };
    })(),
};

module.exports = ext;
module.exports.load = () => Object.assign(global["device"], ext);

// tool function(s) //

// updated: Dec 3, 2019
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

// updated: Apr 25, 2020
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

// updated: Apr 25, 2020
function waitForAction(f, timeout_or_times, interval, params) {
    let _par = params || {};

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