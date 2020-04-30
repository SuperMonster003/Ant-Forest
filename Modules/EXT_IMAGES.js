if (typeof cX === "undefined") {
    cX = _getDisplay().cX;
}
if (typeof debugInfo === "undefined") {
    debugInfo = _debugInfo;
}
let ext = {
    getName: (img) => {
        let img_str = img.toString().split("@")[1];
        return img_str ? "@" + img_str.match(/\w+/)[0] : "(已提前回收)";
    },
    isRecycled: (img) => {
        if (!img) return true;
        try {
            img.getHeight();
        } catch (e) {
            return !!e.message.match(/has been recycled/);
        }
    },
    isImageWrapper: (img) => (img
        && typeof img === "object"
        && img["getClass"]
        && img.toString().match(/ImageWrapper/)
    ),
    reclaim: _reclaim,
    capt: () => {
        let _max = 10;
        while (_max--) {
            try {
                _permitCapt();
                let _img = images.captureScreen();
                // prevent "_img" from being auto-recycled
                let _copy = images.copy(_img);
                _reclaim(_img);
                return _copy;
            } catch (e) {
                sleep(240);
            }
        }
        let _msg = "截取当前屏幕失败";
        console.error(_msg);
        toast(_msg);
        exit();
    },
    tryRequestScreenCapture: _permitCapt, // legacy
    permitCapt: _permitCapt,
    permit: _permitCapt,
    matchTpl: function (capt, tpl, opt) {
        let _capt;
        let _no_capt_fg;
        if (!capt) {
            _capt = images.capt();
            _no_capt_fg = true;
        } else {
            _capt = capt;
        }

        let _opt = opt || {};

        let _name = _opt.name;
        let _path = "";
        let _res_range = [];
        if (_name) {
            let _dir = files.getSdcardPath() + "/.local/Pics/";
            files.createWithDirs(_dir);
            _path = _dir + _name + ".png";
        }

        let _tpl = _bySto(_name) || _byAttempt(tpl);
        if (_tpl) {
            let _par = {};
            let _max = _opt.max;
            let _thrd = _opt.threshold_result;
            if (_max) {
                _par.max = _max;
            }
            if (_thrd) {
                _par.threshold = _thrd;
            }

            let _res = images.matchTemplate(_capt, _tpl, _par);
            if (!_res_range[0]) {
                let _w = _tpl.getWidth() * 720 / W;
                _res_range[0] = +_w.toFixed(2);
            }
            _res.range = _res_range;

            if (_no_capt_fg) {
                _capt.recycle();
                _capt = null;
            }

            return _res;
        }
        return null;

        // tool function(s) //

        function _bySto(name) {
            if (!name || !files.exists(_path)) {
                return;
            }
            let _af = typeof $$af !== "undefined";
            let _key = "img_" + name;
            if (_af && $$af[_key]) {
                return $$af[_key];
            }
            let _img = images.read(_path);
            if (!_af) {
                $$af = {};
            }
            return $$af[_key] = _img;
        }

        function _byAttempt(tpl) {
            if (!tpl) {
                return null;
            }
            let _range = _opt.range || [0, 0];
            let [_min, _max] = _range.map(x => cX(x));
            for (let i = _min; i <= _max; i += 1) {
                let _w = tpl.getWidth();
                let _h = tpl.getHeight();
                let _new_w = i || _w;
                let _new_h = Math.trunc(_h / _w * i);
                for (let j = 0; j <= 1; j += 1) {
                    let _resized = images.resize(
                        tpl, [_new_w, _new_h + j], "LANCZOS4"
                    );
                    let _recycleNow = () => {
                        _resized.recycle();
                        _resized = null;
                    };
                    let _par = {};
                    let _thrd = _opt.threshold_attempt;
                    let _region = _opt.region_attempt;
                    if (_thrd) {
                        _par.threshold = _thrd;
                    }
                    if (_region) {
                        _par.region = _region;
                    }
                    if (images.findImage(_capt, _resized, _par)) {
                        if (_name) {
                            debugInfo("已存储模板: " + _name);
                            images.save(_resized, _path);
                        }
                        _res_range = [+(i * 720 / W).toFixed(2), j];
                        return _resized;
                    }
                    _recycleNow();
                }
            }
        }
    },
    findColorInBounds: (img, src, color, threshold) => {
        if (!color) {
            throw ("findColorInBounds的color参数无效");
        }

        let _img = img || images.capt();
        let _srcMch = rex => src.toString().match(rex);

        let _bnd;
        if (_srcMch(/^Rect/)) {
            _bnd = src;
        } else if (_srcMch(/^((text|desc|id)(Matches)?)\(/)) {
            let _node = src.findOnce();
            if (!_node) {
                return null;
            }
            _bnd = _node.bounds();
        } else if (_srcMch(/UiObject/)) {
            _bnd = src.bounds();
        } else {
            throw ("findColorInBounds的src参数类型无效");
        }

        let _x = _bnd.left;
        let _y = _bnd.top;
        let _w = _bnd.right - _x;
        let _h = _bnd.bottom - _y;

        let _mch = col => images.findColorInRegion(
            _img, col, _x, _y, _w, _h, threshold
        );
        if (typeof color !== "object") {
            return _mch(color) ? _bnd : null;
        }

        for (let i = 0, len = color.length; i < len; i += 1) {
            if (!_mch(color[i])) {
                return null;
            }
        }
        return _bnd;
    },
};
ext.capture = ext.captureCurrentScreen = () => ext.capt();

module.exports = ext;
module.exports.load = () => Object.assign(global["images"], ext);

// tool function(s) //

/**
 * Just an insurance way of images.requestScreenCapture()
 *  to avoid infinite stuck or stalled without any hint or log
 * During this operation, permission prompt window
 *  will be confirmed (with checkbox checked if possible)
 *  automatically with effort
 * @param [params] {object}
 * @param [params.debug_info_flag] {boolean}
 * @param [params.restart_this_engine_flag=false] {boolean}
 * @param [params.restart_this_engine_params] {object}
 * @param [params.restart_this_engine_params.new_file] {string}
 *  - new engine task name with or without path or file extension name
 * <br>
 *     -- *DEFAULT* - old engine task <br>
 *     -- new file - like "hello.js", "../hello.js" or "hello"
 * @param [params.restart_this_engine_params.debug_info_flag] {boolean}
 * @param [params.restart_this_engine_params.max_restart_engine_times=3] {number}
 *  - max restart times for avoiding infinite recursion
 * @return {boolean}
 */
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

        if (_waitForAction(_sel_sure, 5000)) {
            if (_waitForAction(_sel_remember, 1000)) {
                _debugInfo('勾选"不再提示"复选框');
                _clickAction(_sel_remember(), "w");
            }
            if (_waitForAction(_sel_sure, 2000)) {
                let _node = _sel_sure();
                let _act_msg = '点击"' + _sel_sure("txt") + '"按钮';

                _debugInfo(_act_msg);
                _clickAction(_node, "w");

                if (!_waitForAction(() => !_sel_sure(), 1000)) {
                    _debugInfo("尝试click()方法再次" + _act_msg);
                    _clickAction(_node, "click");
                }
            }
        }
    });

    let _thread_monitor = threads.start(function () {
        if (_waitForAction(() => !!_req_result, 3600, 300)) {
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
}

// FIXME seems like this is not effective to avoid OOM @ Dec 3, 2019
function _reclaim() {
    for (let i = 0, len = arguments.length; i < len; i += 1) {
        let img = arguments[i];
        if (images.isImageWrapper(img)) {
            img.recycle();
        }
        /*
            `img = null;` is not necessary
            as which only modified the point
            of this reference typed argument
         */
    }
}

// updated: Feb 5, 2020
function _getDisplay(global_assign, params) {
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
}

// updated: Jan 13, 2020
function _debugInfo(msg, info_flag, forcible_flag) {
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