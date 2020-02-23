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

        // srv: service; svr: server
        let _srv_svr_mgr = ITelephony.Stub.asInterface(
            ServiceManager.checkService("phone")
        );
        // ctx: context
        let _srv_ctx = context.getSystemService(
            context.TELEPHONY_SERVICE
        );

        return +_srv_svr_mgr.getCallState() | +_srv_ctx.getCallState();
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
        let _win_srv = context.getSystemService(context.WINDOW_SERVICE);
        let _win_srv_disp = _win_srv.getDefaultDisplay();

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
                _W = +_win_srv_disp.getWidth();
                _H = +_win_srv_disp.getHeight();
                if (!(_W * _H)) {
                    throw Error();
                }

                // left: 1, right: 3, portrait: 0 (or 2 ?)
                let _SCR_O = +_win_srv_disp.getOrientation();
                let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                let _MAX = +_win_srv_disp.maximumSizeDimension;

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
};

module.exports = ext;
module.exports.load = () => Object.assign(global["device"].__proto__, ext);

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