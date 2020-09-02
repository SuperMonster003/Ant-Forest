/**
 * @description
 * module for unlocking device by analyzing UI components with Auto.js <br>
 * a graphic config tool (Unlock_Config_Tool.js) is available for customizing
 *
 * @example
 * require("./MODULE_UNLOCK").unlock();
 * // forcibly enable debugInfo() for showing debug logs in console
 * require("./MODULE_UNLOCK").unlock(true);
 * // forcibly disable debugInfo() for not showing debug logs in console
 * require("./MODULE_UNLOCK").unlock(false);
 *
 * @since Jun 23, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

let _init_scr = _isScrOn();
let _init_unlk = _isUnlk();

_overrideRequire();
_makeSureImpeded();
_addObjectValues();
_activeExtension();

let $_und = x => typeof x === "undefined";
let $_F = x => x === false;
let $_nul = x => x === null;
let $_func = x => typeof x === "function";
let $_num = x => typeof x === "number";
let $_str = x => typeof x === "string";
let $_flag = global.$$flag = global.$$flag || {};

let waitForAction = _chkF("waitForAction", 3);
let keycode = _chkF("keycode", 1);
let clickAction = _chkF("clickAction", 2);

let messageAction = _chkF("messageAction");
let debugInfo = _chkF("debugInfo");
let captureErrScreen = _chkF("captureErrScreen");
let getSelector = _chkF("getSelector");
let classof = _chkF("classof");

let _sto = require("./MODULE_STORAGE").create("unlock");
let _def = require("./MODULE_DEFAULT_CONFIG").unlock;
let _cfg = Object.assign({}, _def, _sto.get("config", {}));

let $_rex = x => classof(x, "RegExp");
let $_arr = x => classof(x, "Array");
let $_jvo = x => classof(x, "JavaObject");
let $_sel = getSelector();
let $_unlk = _unlkSetter();
let _intro = device.brand + " " + device.product + " " + device.release;
let _code = require("./MODULE_PWMAP").decrypt(_cfg.unlock_code) || "";
let _clean_code = _code.split(/\D+/).join("").split("");
let _max_try = _cfg.unlock_max_try_times;
let _pat_sz = _cfg.unlock_pattern_size;

module.exports = {
    is_init_screen_on: $_unlk.init_scr,
    is_init_unlocked: $_unlk.init_unlk,
    isUnlocked: () => _isUnlk(),
    isLocked: () => !_isUnlk(),
    unlock: _unlock,
};

// tool function(s) //

function _overrideRequire() {
    // copy global.require
    let _req = require.bind(global);

    // override global.require
    require = function (path) {
        _initPath();
        return _fromModule() || _fromInternal();

        // tool function(s) //

        function _initPath() {
            // return: "./folderA/folderB/module.js"
            path = path.replace(/^([./]*)(?=\w)/, "");
            path = path.replace(/(\.js)*$/, "");
            path = "./" + path + ".js";
        }

        function _fromModule() {
            let _len = path.match(/\//g).length;
            for (let i = 0; i < _len; i += 1) {
                let _p = path;
                for (let j = 0; j < i; j += 1) {
                    _p = _p.replace(/\/\w+?(?=\/)/, "");
                }
                for (let k = 0; k < 3; k += 1) {
                    if (files.exists(_p)) {
                        return _req(files.path(_p));
                    }
                    if (!files.path(_p).match(/\/Modules\//)) {
                        let _mod_p = files.path(_p)
                            .replace(/\/(.+?\.js$)/, "/Modules/$1");
                        if (files.exists(_mod_p)) {
                            return _req(files.path(_mod_p));
                        }
                    }
                    _p = "." + _p;
                }
            }
        }

        function _fromInternal() {
            let _mch = path.match(/[^\/]+(?=\.js)/);
            if (!_mch) {
                throw Error("Specified module doesn't exist");
            }
            let _internal = {
                MODULE_PWMAP: _pwmap,
                MODULE_STORAGE: _storage,
                MODULE_MONSTER_FUNC: _monster,
                MODULE_DEFAULT_CONFIG: {
                    // updated: Nov 14, 2019
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
            let _mod = _internal[_mch[0]];
            return typeof _mod === "function" ? _mod() : _mod;

            // internal modules //

            // updated: Nov 14, 2019
            function _monster() {
                return {
                    messageAction: messageAction,
                    waitForAction: waitForAction,
                    keycode: keycode,
                    clickAction: clickAction,
                    debugInfo: debugInfo,
                    captureErrScreen: captureErrScreen,
                    getSelector: getSelector,
                    classof: classof,
                };

                // some may be used by a certain monster function(s)
                // even though not showing up above
                // monster function(s) //

                // updated: Aug 29, 2020
                function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
                    let $_flag = global.$$flag = global.$$flag || {};
                    if ($_flag.no_msg_act_flag) {
                        return !(msg_level in {3: 1, 4: 1});
                    }

                    let _msg = msg || "";
                    if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                        return messageAction.apply(
                            null, ["[ " + msg + " ]", 1].concat([].slice.call(arguments, 2))
                        );
                    }
                    if_toast && toast(_msg);

                    let _msg_lv = typeof msg_level === "number" ? msg_level : -1;
                    let _if_arrow = if_arrow || false;
                    let _if_spl_ln = if_split_line || false;
                    _if_spl_ln = ~if_split_line ? _if_spl_ln : "up"; // -1 -> "up"
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
                        if (_if_spl_ln.match(/both|up/)) {
                            if (!_matchLnStyle()) {
                                _showSplitLine("", _spl_ln_style);
                            }
                            if (_if_spl_ln.match(/_n|n_/)) {
                                _if_spl_ln = "\n";
                            } else if (_if_spl_ln.match(/both/)) {
                                _if_spl_ln = 1;
                            } else if (_if_spl_ln.match(/up/)) {
                                _if_spl_ln = 0;
                            }
                        }
                    }

                    _clearLnStyle();

                    if (_if_arrow) {
                        _if_arrow = Math.max(0, Math.min(_if_arrow, 10));
                        _msg = "> " + _msg;
                        for (let i = 0; i < _if_arrow; i += 1) {
                            _msg = "-" + _msg;
                        }
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
                        if (!_spl_ln_extra.match(/\n/)) {
                            _saveLnStyle();
                        }
                        _showSplitLine(_spl_ln_extra, _spl_ln_style);
                    }

                    if (_throw_flag) {
                        throw ("forcibly stopped");
                    }
                    if (_exit_flag) {
                        exit();
                    }
                    return !(_msg_lv in {3: 1, 4: 1});
                }

                // updated: Mar 1, 2020
                function showSplitLine(extra_str, style) {
                    let _extra_str = extra_str || "";
                    let _split_line = "";
                    if (style === "dash") {
                        for (let i = 0; i < 17; i += 1) _split_line += "- ";
                        _split_line += "-";
                    } else {
                        for (let i = 0; i < 33; i += 1) _split_line += "-";
                    }
                    console.log(_split_line + _extra_str);
                }

                // updated: Aug 2, 2020
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
                        let _messageAction = (
                            typeof messageAction === "function" ? messageAction : messageActionRaw
                        );

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

                // updated and modified: Aug 29, 2020
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
                    let _messageAction = (
                        typeof messageAction === "function" ? messageAction : messageActionRaw
                    );
                    let _waitForAction = (
                        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
                    );

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
                        _cond_succ = () => _type.match(/^Ui/) ? _checkDisappearance() : true;
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
                }

                // updated: Aug 29, 2020
                // modified: no internal raw
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
                }

                // updated: Mar 29, 2020
                // modified: no internal raw
                function debugInfo(msg, info_flag, forcible_flag) {
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

                    let _info_flag_str = (info_flag || "").toString();
                    let _info_flag_msg_lv = +(_info_flag_str.match(/\d/) || [0])[0];
                    if (_info_flag_str.match(/Up/)) {
                        _showSplitLine();
                    }
                    if (_info_flag_str.match(/both|up/)) {
                        let _dash = _info_flag_str.match(/dash/) ? "dash" : "";
                        debugInfo("__split_line__" + _dash, "", _forc_fg);
                    }

                    if (typeof msg === "string" && msg.match(/^__split_line_/)) {
                        msg = setDebugSplitLine(msg);
                    }
                    if (_classof(msg) === "Array") {
                        msg.forEach(msg => debugInfo(msg, _info_flag_msg_lv, _forc_fg));
                    } else {
                        _messageAction((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "), _info_flag_msg_lv);
                    }

                    if (_info_flag_str.match("both")) {
                        let _dash = _info_flag_str.match(/dash/) ? "dash" : "";
                        debugInfo("__split_line__" + _dash, "", _forc_fg);
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

                // updated: Jun 5, 2020
                function captureErrScreen(key_name, log_level) {
                    if (!files.isFile("./EXT_IMAGES.js")) {
                        return;
                    }
                    require("./EXT_IMAGES").load();
                    imagesx.requestScreenCapture();

                    let _messageAction = (
                        typeof messageAction === "function" ? messageAction : messageActionRaw
                    );

                    let _dir = files.getSdcardPath() + "/.local/Pics/Err/";
                    let _suffix = "_" + _getTimeStr();
                    let _path = _dir + key_name + _suffix + ".png";

                    try {
                        files.createWithDirs(_path);
                        imagesx.captureScreen(_path);
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
                }

                // updated: Sep 1, 2020
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
                        pickup(sel_body, res_type, mem_kw, par) {
                            let _sel_body = _classof(sel_body) === "Array" ? sel_body.slice() : [sel_body];
                            let _params = Object.assign({}, _opt, par);
                            let _res_type = (res_type || "").toString();

                            if (!_res_type || _res_type.match(/^w(idget)?$/)) {
                                _res_type = "widget";
                            } else if (_res_type.match(/^(w(idget)?_?c(ollection)?|widgets)$/)) {
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

                                let _mch = _compass.match(/c-?\d+/g);
                                return _mch ? _childWidget(_mch) : _w;

                                // tool function(s) //

                                function _childWidget(arr) {
                                    let _len = arr.length;
                                    for (let i = 0; i < _len; i += 1) {
                                        try {
                                            let _idx = +arr[i].match(/-?\d+/);
                                            if (_idx < 0) {
                                                _idx += _w.childCount();
                                            }
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
                }

                // updated: Mar 1, 2020
                function classof(source, check_value) {
                    let class_result = Object.prototype.toString.call(source).slice(8, -1);
                    return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
                }
            }

            // updated: Jun 24, 2020
            function _pwmap() {
                let _path = "";
                let _dic = {};
                let _cfg = {
                    // {SCPrMtaB:"A"}
                    code_length: 8,
                    // {1:"A",2:"A", ... 10:"A"}
                    code_amount: 10,
                    separator: "_.|._",
                    encrypt_power: 2,
                };
                let $_nul = x => x === null;
                let $_und = x => typeof x === "undefined";
                let $_str = x => typeof x === "string";

                return {
                    encrypt: _encrypt,
                    decrypt: _decrypt,
                    generate: _generate,
                };

                // main function(s) //

                function _encrypt(input) {
                    _initDic();
                    let _empty = !arguments.length;
                    let _input = _empty && _userInput(0) || input;
                    let _pwr = Math.min(_cfg.encrypt_power, 2) || 1;
                    let _rex = /[A-Za-z0-9`~!@#$%^&*()_+=\-\[\]}{'\\;:\/?.>,<| ]/;

                    let _thd_mon = _thdMonitor(0);
                    let _encrypted = _enc(_input);
                    while (--_pwr) {
                        _input = _encrypted.join(_cfg.separator);
                        _encrypted = _enc(_input);
                    }
                    _thd_mon.interrupt();

                    let _raw = _encrypted.map((s) => '"' + s + '"');
                    let _res = "[" + _raw + "]";
                    if (_empty) {
                        setClip(_res);
                        toast("密文数组已复制剪切板");
                    }
                    return _res;

                    // tool function(s) //

                    function _enc(str) {
                        let _res = [];
                        let _str = str.toString();
                        let _len = _str.length;
                        for (let i = 0; i < _len; i += 1) {
                            let _s = _str[i];
                            if (_s.match(_rex)) {
                                _res.push(_rand(_s));
                            } else {
                                let _sglStr = (s) => {
                                    let _cc = s.charCodeAt(0);
                                    let _cc_hex = _cc.toString(16);
                                    return _cc_hex.toUpperCase();
                                };
                                let _tmp = "";
                                _s.split("").forEach((s, i) => {
                                    _tmp += (i ? "|" : "") + _sglStr(s);
                                });
                                let _raw = "\\u" + _tmp.split("|").map((s) => {
                                    return ("0000" + s).slice(-4);
                                }).join("\\u");
                                _res = _res.concat(_enc(_raw));
                            }
                        }
                        return _res;
                    }

                    function _rand(str) {
                        let _tmp = [];
                        for (let k in _dic) {
                            if (_dic.hasOwnProperty(k)) {
                                _dic[k] === str && _tmp.push(k);
                            }
                        }
                        let _num = Math.random() * _cfg.code_amount;
                        return _tmp[Math.trunc(_num)];
                    }
                }

                function _decrypt(input) {
                    _initDic();
                    let _empty = !arguments.length;
                    let _input = _empty && _userInput(1) || input;
                    let _thd_mon = _thdMonitor(1);
                    let _decrypted = _dec(_input);
                    _thd_mon.interrupt();
                    if (_empty) {
                        setClip(_decrypted);
                        toast("解密字符串已复制剪切板");
                    }
                    return _decrypted;

                    // tool function(s) //

                    function _dec(arr) {
                        if ($_und(arr)) {
                            return "";
                        }
                        if ($_nul(arr)) {
                            return null;
                        }
                        if ($_str(arr)) {
                            if (!arr.length) {
                                return "";
                            }
                            if (arr[0] !== "[") {
                                toast("输入的加密字符串不合法");
                                exit();
                            }
                            let _raw = arr.slice(1, -1).split(/, ?/);
                            arr = _raw.map((s) => {
                                return s.replace(/^"([^]+)"$/g, "$1");
                            });
                        }

                        let _shift = 0;
                        let _res = "";
                        let _sep = _cfg.separator;
                        while (1) {
                            let _len = arr.length;
                            for (let i = 0; i < _len; i += 1) {
                                if (_shift) {
                                    i += _shift;
                                    _shift = 0;
                                    continue;
                                }
                                let _di = _dic[arr[i]];
                                let _dj = _dic[arr[i + 1]];
                                if ($_und(_di)) {
                                    return "";
                                }
                                if (_di === "\\" && _dj === "u") {
                                    let _tmp = "";
                                    for (let j = 0; j < 4; j += 1) {
                                        _tmp += _dic[arr[i + j + 2]];
                                    }
                                    _res += String.fromCharCode(
                                        parseInt(_tmp, 16)
                                    );
                                    _shift = 4;
                                } else {
                                    _res += _di;
                                }
                            }
                            if (!~_res.indexOf(_sep)) {
                                let _try_dec = _dec([_res]);
                                if (_try_dec) {
                                    return _try_dec;
                                }
                                break;
                            }
                            arr = _res.split(_sep);
                            _res = "";
                        }
                        return _res;
                    }
                }

                function _generate() {
                    if (files.exists(_path)) {
                        confirm(
                            "密文文件已存在\n" +
                            "继续操作将覆盖已有文件\n" +
                            "新的密文文件生成后\n" +
                            "涉及密文的全部相关代码\n" +
                            "均需重新设置才能解密\n" +
                            "确定要继续吗?"
                        ) || exit();
                    }

                    files.createWithDirs(_path);
                    files.open(_path);

                    // eg: {SCPrMtaB:"A",doaAisDd:"%"}
                    let _res = {};
                    let _az = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
                    let _all = "~!@#$%^&*`'-_+=,./ 0123456789:;?()[]<>{}|" + "\"\\" + _az;
                    let _randAz = () => _az[Math.trunc(Math.random() * _az.length)];
                    let _li = _all.length;
                    let _lj = _cfg.code_amount;
                    let _lk = _cfg.code_length;
                    for (let i = 0; i < _li; i += 1) {
                        for (let j = 0; j < _lj; j += 1) {
                            let _code = "";
                            for (let k = 0; k < _lk; k += 1) {
                                _code += _randAz();
                            }
                            _res[_code] = _all[i];
                        }
                    }
                    files.write(_path, JSON.stringify(_res));
                    toast("密文文件生成完毕");
                }

                // tool function(s) //

                function _initDic() {
                    let _root = files.getSdcardPath();
                    _path = _root + "/.local/PWMAP.txt";
                    if (!files.exists(_path)) {
                        _showMsg();
                        _generate();
                    }
                    _dic = JSON.parse(files.read(_path));

                    // tool function(s) //

                    function _showMsg() {
                        let _s = "已生成新密文字典";

                        _splitLine();
                        toastLog(_s);
                        _splitLine();

                        // tool function(s) //

                        function _splitLine() {
                            let [_ln, _i] = ["", 33];
                            while (_i--) _ln += "-";
                            console.log(_ln);
                        }
                    }
                }

                function _userInput(dec) {
                    let _inp = "";
                    let _max = 20;
                    let _msg = dec ?
                        "请输入要解密的字符串数组" :
                        "请输入要加密的字符串";
                    while (_max--) {
                        _inp = dialogsx.rawInput(
                            "请输入要" + _msg + "的字符串\n" +
                            "点击其他区域放弃输入"
                        );
                        if (_inp) {
                            break;
                        }
                        if ($_nul(_inp)) {
                            exit();
                        }
                        toast("输入内容无效");
                    }
                    if (_max >= 0) {
                        return _inp;
                    }
                    toast("已达最大尝试次数");
                    exit();
                }

                function _thdMonitor(dec) {
                    return threads.start(function () {
                        let _msg = dec
                            ? "正在解密中 请稍候..."
                            : "正在加密中 请稍候...";
                        sleep(2.4e3);
                        let _ctr = 0;
                        while (1) {
                            _ctr++ % 5 || toast(_msg);
                            sleep(1e3);
                        }
                    });
                }
            }

            // updated: Jun 24, 2020
            function _storage() {
                let storages = {};

                storages.create = function (name) {
                    return new Storage(name);
                };

                storages.remove = function (name) {
                    this.create(name).clear();
                };

                return storages;

                // constructor(s) //

                function Storage(name) {
                    let _dir = files.getSdcardPath() + "/.local/";
                    let _full_path = _dir + name + ".nfe";
                    files.createWithDirs(_full_path);
                    let _readFile = () => files.read(_full_path);

                    this.contains = _contains;
                    this.get = _get;
                    this.put = _put;
                    this.remove = _remove;
                    this.clear = _clear;

                    // tool function(s) //

                    function _replacer(k, v) {
                        if (typeof v === "number") {
                            if (isNaN(v) || !isFinite(v)) {
                                /** Zero Width No-Break Space */
                                let _pad = "\ufeff";
                                return _pad + v.toString() + _pad;
                            }
                        }
                        return v;
                    }

                    function _reviver(k, v) {
                        if (typeof v === "string") {
                            let _rex = /^\ufeff(.+)\ufeff$/;
                            if (v.match(_rex)) {
                                return +v.replace(_rex, "$1");
                            }
                        }
                        return v;
                    }

                    function _contains(key) {
                        return key in _jsonParseFile();
                    }

                    function _put(key, new_val, forc) {
                        if (typeof new_val === "undefined") {
                            let _m = '"put" value can\'t be undefined';
                            throw new TypeError(_m);
                        }

                        let _old_data = {};
                        let _tmp_data = {};

                        try {
                            _old_data = _jsonParseFile(_reviver);
                        } catch (e) {
                            console.warn(e.message);
                        }

                        let _cA = _classof(new_val, "Object");
                        let _cB = _classof(_old_data[key], "Object");
                        let _both_type_o = _cA && _cB;
                        let _keyLen = () => Object.keys(new_val).length;

                        if (!forc && _both_type_o && _keyLen()) {
                            _tmp_data[key] = Object.assign(
                                _old_data[key], new_val
                            );
                        } else {
                            _tmp_data[key] = new_val;
                        }

                        files.write(_full_path, JSON.stringify(
                            Object.assign(_old_data, _tmp_data), _replacer, 2
                        ));
                    }

                    function _get(key, value) {
                        let _o = _jsonParseFile(_reviver);
                        if (_o && key in _o) {
                            return _o[key];
                        }
                        return value;
                    }

                    function _remove(key) {
                        let _o = _jsonParseFile();
                        if (key in _o) {
                            delete _o[key];
                            files.write(_full_path, JSON.stringify(_o, null, 2));
                        }
                    }

                    function _clear() {
                        files.remove(_full_path);
                    }

                    function _classof(src, chk) {
                        let _s = Object.prototype.toString.call(src).slice(8, -1);
                        return chk ? _s.toUpperCase() === chk.toUpperCase() : _s;
                    }

                    function _jsonParseFile(reviver) {
                        let _str = _readFile();
                        try {
                            return _str ? JSON.parse(_str, reviver) : {};
                        } catch (e) {
                            console.warn("JSON.parse()解析配置文件异常");
                            console.warn("尝试查找并修复异常的转义字符");

                            let _backslash_rex = /[ntrfb\\'"0xu]/;
                            let _str_new = "";

                            for (let i in _str) {
                                let _i = +i;
                                let _s = _str[_i];
                                if (_s === "\\") {
                                    let _prev_s = _str[_i - 1];
                                    let _next_s = _str[_i + 1];
                                    if (_prev_s && _next_s) {
                                        if (_prev_s !== "\\") {
                                            if (!_next_s.match(_backslash_rex)) {
                                                _s += "\\";
                                            }
                                        }
                                    }
                                }
                                _str_new += _s;
                            }

                            try {
                                let _res = JSON.parse(_str_new, reviver);
                                console.info("修复成功");
                                files.write(_full_path, _str_new);
                                console.info("已重新写入修复后的数据");
                                return _res;
                            } catch (e) {
                                let _new_file_name = name + ".nfe." + Date.now() + ".bak";

                                files.rename(_full_path, _new_file_name);
                                console.error("修复失败");
                                console.warn("已将损坏的配置文件备份至");
                                console.warn(_dir + _new_file_name);
                                console.warn("以供手动排查配置文件中的问题");

                                throw Error(e);
                            }
                        }
                    }
                }
            }
        }
    };
}

function _addObjectValues() {
    if (!Object["values"]) {
        Object.defineProperty(Object.prototype, "values", {
            value(o) {
                if (o !== Object(o)) {
                    throw new TypeError("Object.values called on a non-object");
                }
                let key;
                let value = [];
                for (key in o) {
                    if (o.hasOwnProperty(key)) {
                        value.push(o[key]);
                    }
                }
                return value;
            },
            enumerable: false,
        });
    }
    if (!Object["valuesArr"]) {
        Object.defineProperty(Object.prototype, "valuesArr", {
            value() {
                if (typeof Object.values === "function") {
                    return Object.values(this);
                }
                let values = [];
                for (let key in this) {
                    if (this.hasOwnProperty(key)) {
                        values.push(this[key]);
                    }
                }
                return values;
            },
            enumerable: false,
        });
    }
}

function _makeSureImpeded() {
    if (typeof global.$$impeded === "undefined") {
        global.$$impeded = () => void 0;
    }
}

function _activeExtension() {
    !function _devicex() {
        global.devicex = typeof global.devicex === "object" ? global.devicex : {};
        if (typeof devicex.keepOn !== "function") {
            devicex.keepOn = function (duration, params) {
                let _par = params || {};
                let _du = duration || 5;
                _du *= _du < 100 ? 60e3 : 1;
                device.keepScreenOn(_du);
                if (_par.debug_info_flag !== false) {
                    let _mm = +(_du / 60e3).toFixed(2);
                    debugInfo("已设置屏幕常亮");
                    debugInfo(">最大超时时间: " + _mm + "分钟");
                }
            };
        }
        if (typeof devicex.cancelOn !== "function") {
            devicex.cancelOn = function (params) {
                let _par = params || {};
                device.cancelKeepingAwake();
                if (_par.debug_info_flag !== false) {
                    debugInfo("屏幕常亮已取消");
                }
            };
        }
        if (typeof devicex.getDisplay !== "function") {
            devicex.getDisplay = function (global_assign, params) {
                let $_flag = global.$$flag = global.$$flag || {};
                let _par, _glob_asg;
                if (typeof global_assign === "boolean") {
                    _par = params || {};
                    _glob_asg = global_assign;
                } else {
                    _par = global_assign || {};
                    _glob_asg = _par.global_assign;
                }

                let _waitForAction = (
                    typeof waitForAction === "function" ? waitForAction : waitForActionRaw
                );
                let _debugInfo = (m, fg) => (
                    typeof debugInfo === "function" ? debugInfo : debugInfoRaw
                )(m, fg, _par.debug_info_flag);

                let _W, _H;
                let _disp = {};
                let _metrics = new android.util.DisplayMetrics();
                let _win_svc = context.getSystemService(context.WINDOW_SERVICE);
                let _win_svc_disp = _win_svc.getDefaultDisplay();
                _win_svc_disp.getRealMetrics(_metrics);

                if (!_waitForAction(() => _disp = _getDisp(), 3e3, 500)) {
                    console.error("devicex.getDisplay()返回结果异常");
                    return {cX: cX, cY: cY, cYx: cYx};
                }
                _showDisp();
                _assignGlob();
                return Object.assign(_disp, {cX: cX, cY: cY, cYx: cYx});

                // tool function(s) //

                function cX(num, base) {
                    return _cTrans(1, +num, base);
                }

                function cY(num, base) {
                    return _cTrans(-1, +num, base);
                }

                function cYx(num, base) {
                    num = +num;
                    base = +base;
                    if (num >= 1) {
                        if (!base) {
                            base = 720;
                        } else if (base < 0) {
                            if (!~base) {
                                base = 720;
                            } else if (base === -2) {
                                base = 1080;
                            } else {
                                throw Error(
                                    "can not parse base param for cYx()"
                                );
                            }
                        } else if (base < 5) {
                            throw Error(
                                "base and num params should " +
                                "both be pixels for cYx()"
                            );
                        }
                        return Math.round(num * _W / base);
                    }

                    if (!base || !~base) {
                        base = 16 / 9;
                    } else if (base === -2) {
                        base = 21 / 9;
                    } else if (base < 0) {
                        throw Error(
                            "can not parse base param for cYx()"
                        );
                    } else {
                        base = base < 1 ? 1 / base : base;
                    }
                    return Math.round(num * _W * base);
                }

                function _cTrans(dxn, num, base) {
                    let _full = ~dxn ? _W : _H;
                    if (isNaN(num)) {
                        throw Error("can not parse num param for cTrans()");
                    }
                    if (Math.abs(num) < 1) {
                        return Math.min(Math.round(num * _full), _full);
                    }
                    let _base = base;
                    if (!base || !~base) {
                        _base = ~dxn ? 720 : 1280;
                    } else if (base === -2) {
                        _base = ~dxn ? 1080 : 1920;
                    }
                    let _ct = Math.round(num * _full / _base);
                    return Math.min(_ct, _full);
                }

                function _showDisp() {
                    if ($_flag.debug_info_avail && !$_flag.display_params_got) {
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
                            throw Error();
                        }

                        // if the device is rotated 90 degrees counter-clockwise,
                        // to compensate rendering will be rotated by 90 degrees clockwise
                        // and thus the returned value here will be Surface#ROTATION_90
                        // 0: 0°, device is portrait
                        // 1: 90°, device is rotated 90 degree counter-clockwise
                        // 2: 180°, device is reverse portrait
                        // 3: 270°, device is rotated 90 degree clockwise
                        let _SCR_O = _win_svc_disp.getRotation();
                        let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                        // let _MAX = _win_svc_disp.maximumSizeDimension;
                        let _MAX = Math.max(_metrics.widthPixels, _metrics.heightPixels);

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
                        _W = device.width;
                        _H = device.height;
                        return _W && _H && {
                            WIDTH: _W,
                            HEIGHT: _H,
                            USABLE_HEIGHT: Math.trunc(_H * 0.9),
                        };
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
                            cX: cX, cY: cY, cYx: cYx,
                        });
                    }
                }
            };
        }
        devicex.getDisplay(true);
    }();
    !function _dialogsx() {
        global.dialogsx = typeof global.dialogsx === "object" ? global.dialogsx : {};
        let myLooper = android.os.Looper.myLooper;
        let getMainLooper = android.os.Looper.getMainLooper;
        let isUiThread = () => myLooper() === getMainLooper();
        let rtDialogs = () => {
            let d = runtime.dialogs;
            return isUiThread() ? d : d.nonUiDialogs;
        };
        if (typeof dialogsx.rawInput !== "function") {
            dialogsx.rawInput = function (title, prefill, callback) {
                prefill = prefill || "";
                if (isUiThread() && !callback) {
                    return new Promise(function (resolve) {
                        rtDialogs().rawInput(title, prefill, function () {
                            resolve.apply(null, Array.prototype.slice.call(arguments));
                        });
                    });
                }
                return rtDialogs().rawInput(title, prefill, callback ? callback : null);
            };
        }
    }();
}

function _chkF(s, override_par_num) {
    let _f = (() => {
        let _mon = require("./MODULE_MONSTER_FUNC");
        if (typeof global[s] === "function") {
            return global[s];
        }
        return _mon[s];
    })();

    if ($_und(override_par_num)) {
        return _f;
    }

    return function () {
        let _args = Object.values(arguments);
        let _aim_par = _args[override_par_num];
        if ($_und(_aim_par)) {
            _aim_par = {no_impeded: true};
        } else {
            _aim_par = Object.assign(_aim_par, {no_impeded: true});
        }
        _args[override_par_num] = _aim_par;
        return _f.apply({}, _args);
    }
}

function _err(s) {
    devicex.cancelOn();
    messageAction("解锁失败", 4, 1, 0, -1);

    let _s = $_str(s) ? [s] : s;
    _s.forEach(m => messageAction(m, 4, 0, 1));
    messageAction(_intro, 4, 0, 1, 1);

    captureErrScreen("unlock_failed", {
        log_level: 1,
        max_samples: 8,
    });

    if ($_unlk.init_scr) {
        let _suffix = keycode(26) ? "" : "失败";
        let _msg = "自动关闭屏幕" + _suffix;
        messageAction(_msg, 1, 0, 0, 1);
    }

    exit();
    sleep(3.6e3);
}

function _isScrOn() {
    return device.isScreenOn();
}

function _isUnlk() {
    return !context.getSystemService(context.KEYGUARD_SERVICE).isKeyguardLocked();
}

function _wakeUpIFN() {
    if (!_isScrOn()) {
        let [_ctr, _max] = [0, 4];
        while (1) {
            let _s = " (" + _ctr + "/" + _max + ")";
            debugInfo(!_ctr ? "尝试唤起设备" : "重试唤起设备" + _s);

            device.wakeUpIfNeeded();

            if (waitForAction(_isScrOn, 1.5e3)) {
                device.keepScreenOn(2 * 60e3);
                break;
            }
            if (++_ctr > _max) {
                return _err("设备唤起失败");
            }
        }
        debugInfo("设备唤起成功");
    }
}

function _unlkSetter() {
    let _as = "com\\.android\\.systemui:id/";
    let _ak = "com\\.android\\.keyguard:id/";
    let _sk = "com\\.smartisanos\\.keyguard:id/";

    return {
        init_scr: _init_scr,
        init_unlk: _init_unlk,
        prev_cntr: {
            trigger() {
                _wakeUpIFN();
                _disturbance();

                let _map = {
                    common: {
                        desc: "通用",
                        selector: idMatches(_as + "preview_container")
                    },
                    emui: {
                        desc: "EMUI",
                        selector: idMatches(_as + ".*(keyguard|lock)_indication.*")
                    },
                    smartisanos: {
                        desc: "锤子科技",
                        selector: idMatches(_sk + "keyguard_(content|.*view)")
                    },
                    miui: {
                        desc: "MIUI",
                        selector: idMatches(_ak + "(.*unlock_screen.*|.*notification_.*(container|view).*)")
                    },
                    miui10: {
                        desc: "MIUI10",
                        selector: idMatches(_as + "((.*lock_screen|notification)_(container.*|panel.*)|keyguard_.*)")
                    },
                };

                for (let key in _map) {
                    if (_map.hasOwnProperty(key)) {
                        let {desc: _desc, selector: _sel} = _map[key];
                        if (_sel.exists()) {
                            debugInfo("匹配到" + _desc + "解锁提示层控件");
                            return (this.trigger = _sel.exists.bind(_sel))();
                        }
                    }
                }

                // tool function(s) //

                function _disturbance() {
                    let _map = {
                        qq_msg_box: {
                            trigger() {
                                let _cA = () => $_sel.pickup("按住录音");
                                let _cB = () => idMatches(/com.tencent.mobileqq:id.+/).exists();
                                return _cA() || _cB();
                            },
                            handle() {
                                let _this = this;
                                debugInfo("匹配到QQ锁屏消息弹框控件");

                                clickAction($_sel.pickup("关闭"), "w");

                                waitForAction(() => !_this.trigger(), 3e3)
                                    ? debugInfo("关闭弹框控件成功")
                                    : debugInfo("关闭弹框控件超时", 3);
                            },
                        },
                    };

                    for (let key in _map) {
                        if (_map.hasOwnProperty(key)) {
                            let _o = _map[key];
                            _o.trigger() && _o.handle();
                        }
                    }
                }
            },
            dismiss() {
                let _this = this;
                let _btm = _cfg.unlock_dismiss_layer_bottom;
                let _top = _cfg.unlock_dismiss_layer_top;
                let _time_sto = _cfg.unlock_dismiss_layer_swipe_time;
                let _from_sto = !!_time_sto;
                let _pts = [_btm, _top];
                let _time = _time_sto; // copy
                let _relbl = _cfg.swipe_time_reliable || [];
                let _chances = 3;
                let _t_pool = _cfg.continuous_swipe || {};

                _init();
                _dismiss();
                _storage();

                // tool function(s) //

                function _init() {
                    if (~_relbl.indexOf(_time)) {
                        _chances = Infinity;
                        debugInfo("当前滑动时长参数可信");
                    }

                    if (!(_time in _t_pool)) {
                        debugInfo("连续成功滑动累积器清零");
                        _t_pool = {};
                        _t_pool[_time] = 0;
                    }
                }

                function _dismiss() {
                    let _par = [];
                    _pts.forEach(y => _par.push([halfW, cY(y)]));

                    let _max = 30;
                    let _ctr = 0;
                    devicex.keepOn(3);
                    while (!_lmt()) {
                        let _s = " (" + _ctr + "/" + _max + ")";
                        _ctr
                            ? debugInfo("重试消除解锁页面提示层" + _s)
                            : debugInfo("尝试消除解锁页面提示层");
                        debugInfo("滑动时长: " + _time + "毫秒");
                        debugInfo("参数来源: " + (_from_sto ? "本地存储" : "自动计算"));

                        gesture.apply({}, [_time].concat(_par));

                        if (_this.succ()) {
                            break;
                        }

                        debugInfo("单次消除解锁页面提示层超时");
                        _ctr += 1;

                        if (_from_sto) {
                            if (--_chances < 0) {
                                _from_sto = false;
                                _time = _cfg.unlock_dismiss_layer_swipe_time;
                                debugInfo("放弃本地存储数据");
                                debugInfo("从默认值模块获取默认值: " + _time);
                            } else {
                                debugInfo("继续使用本地存储数据");
                            }
                        } else {
                            // h110, 115, 120, 170, 220, 270, 320...
                            let _increment = _time < 120 ? 5 : 50;
                            _time += _increment;
                            debugInfo("参数增量: " + _increment);
                        }
                    }
                    devicex.cancelOn();
                    debugInfo("解锁页面提示层消除成功");
                    _this.succ_fg = true;

                    // tool function(s) //

                    function _lmt() {
                        if (_ctr > _max) {
                            _t_pool[_time] = 0;
                            _sto.put("config", {continuous_swipe: _t_pool});
                            return _err("消除解锁页面提示层失败");
                        }
                    }
                }

                function _storage() {
                    if (_time !== _time_sto) {
                        let _o = {unlock_dismiss_layer_swipe_time: _time};
                        _sto.put("config", _o);
                        debugInfo("存储滑动时长参数: " + _time);
                    }

                    if (!(_time in _t_pool)) {
                        _t_pool[_time] = 0;
                    }
                    let _new_ctr = ++_t_pool[_time];
                    _sto.put("config", {continuous_swipe: _t_pool});
                    debugInfo("存储连续成功滑动次数: " + _new_ctr);

                    if (_new_ctr >= 6 && !~_relbl.indexOf(_time)) {
                        debugInfo("当前滑动时长可信度已达标");
                        debugInfo("存储可信滑动时长数据: " + _time);
                        let _o = {swipe_time_reliable: _relbl.concat(_time)};
                        _sto.put("config", _o);
                    }
                }
            },
            handle() {
                return !this.succ_fg && this.trigger() && this.dismiss();
            },
            succ() {
                let _this = this;
                let _cA1 = () => !_this.trigger();
                let _cA = () => waitForAction(_cA1, 1.5e3);
                let _cB = () => $_unlk.unlk_view.trigger();
                return _cA() || _cB();
            },
        },
        unlk_view: {
            trigger() {
                let _this = this;

                if (_isScrOn()) {
                    return _pattern()
                        || _password()
                        || _pin()
                        || _specials()
                        || _unmatched();
                }
                debugInfo("跳过解锁控件检测");
                debugInfo(">屏幕未亮起");

                // tool function(s) //

                function _pattern() {
                    let _map = {
                        common: {
                            desc: "通用",
                            selector: idMatches(_as + "lockPatternView"),
                        },
                        miui: {
                            desc: "MIUI",
                            selector: idMatches(_ak + "lockPattern(View)?"),
                        },
                    };

                    for (let key in _map) {
                        if (_map.hasOwnProperty(key)) {
                            let {desc: _desc, selector: _sel} = _map[key];
                            if (_sel.exists()) {
                                debugInfo("匹配到" + _desc + "图案解锁控件");
                                return _trigger(_sel, _stg);
                            }
                        }
                    }

                    // strategy(ies) //

                    function _stg() {
                        let _stg = _cfg.unlock_pattern_strategy;
                        let _stg_map = {
                            segmental: "叠加路径",
                            solid: "连续路径",
                        };
                        let _key = "unlock_pattern_swipe_time_" + _stg;
                        let _time = _cfg[_key]; // swipe time

                        let _from_sto = !!_time;
                        let _chances = 3;
                        let _ctr = 0;
                        let _max = Math.ceil(_max_try * 0.6);
                        while (!_lmt()) {
                            let _s = " (" + _ctr + "/" + _max + ")";
                            _ctr
                                ? debugInfo("重试图案密码解锁" + _s)
                                : debugInfo("尝试图案密码解锁");
                            debugInfo("滑动时长: " + _time + "毫秒");
                            debugInfo("滑动策略: " + _stg_map[_stg]);

                            let _pts = _getPts();
                            let _act = {
                                segmental() {
                                    let _par = [];
                                    let _len = _pts.length;
                                    for (let i = 0; i < _len - 1; i += 1) {
                                        let _t1 = (_time - 50) * i;
                                        let _t2 = _time;
                                        let _pt1 = _pts[i];
                                        let _pt2 = _pts[i + 1];
                                        let _pts1 = [_pt1[0], _pt1[1]];
                                        let _pts2 = [_pt2[0], _pt2[1]];
                                        _par.push([_t1, _t2, _pts1, _pts2]);
                                    }
                                    gestures.apply({}, _par);
                                },
                                solid() {
                                    let _par = [_time].concat(_pts);
                                    gesture.apply({}, _par);
                                },
                            };

                            try {
                                _act[_stg]();
                            } catch (e) {
                                messageAction(e.message, 4, 0, 0, -1);
                                messageAction(e.stack, 4, 0, 0, "both");
                            }

                            if (_this.succ()) {
                                break;
                            }

                            debugInfo("图案解锁未成功", 3);
                            _ctr += 1;
                            sleep(200);

                            if (_from_sto) {
                                if (--_chances < 0) {
                                    _from_sto = false;
                                    _time = _cfg[_key];
                                }
                            } else {
                                _time += 80;
                            }
                        }
                        debugInfo("图案解锁成功");

                        if (_time !== _cfg[_key]) {
                            _cfg[_key] = _time;
                            _sto.put("config", _cfg);
                            debugInfo("存储滑动时长参数: " + _time);
                        }

                        return true;

                        // tool function(s) //

                        function _lmt() {
                            if (_ctr > _max) {
                                return _err("图案解锁方案失败");
                            }
                        }

                        function _getPts() {
                            let _bnd = _stable(_this.sel);
                            if (!_bnd) {
                                return _err(
                                    "图案解锁方案失败",
                                    "无法获取点阵布局"
                                );
                            }

                            let _sz = _pat_sz;
                            let _w = Math.trunc(_bnd.width() / _sz);
                            let _h = Math.trunc(_bnd.height() / _sz);
                            let _x1 = _bnd.left + Math.trunc(_w / 2);
                            let _y1 = _bnd.top + Math.trunc(_h / 2);
                            let _pts = [];
                            for (let j = 1; j <= _sz; j += 1) {
                                for (let i = 1; i <= _sz; i += 1) {
                                    _pts[(j - 1) * _sz + i] = {
                                        x: _x1 + (i - 1) * _w,
                                        y: _y1 + (j - 1) * _h,
                                    };
                                }
                            }

                            if ($_str(_code)) {
                                let _rex = /[^1-9]+/;
                                _code = _code.match(_rex)
                                    ? _code.split(_rex).join("|").split("|")
                                    : _code.split("");
                            }

                            return _simpl(_code, _sz)
                                .filter(n => +n && _pts[n])
                                .map(n => [_pts[n].x, _pts[n].y]);

                            // tool function(s) //

                            function _stable(sel) {
                                let _res;
                                let _max = 5;
                                while (_max--) {
                                    try {
                                        _res = _stableBnd();
                                        break;
                                    } catch (e) {
                                        sleep(120);
                                    }
                                }
                                return _res;

                                // tool function(s) //

                                function _stableBnd() {
                                    let _bnd = null;
                                    let _l, _t, _r, _b;
                                    let _raw = () => {
                                        return $_und(_l) || $_und(_t)
                                            || $_und(_r) || $_und(_b);
                                    };
                                    let _parse = (bnd) => {
                                        let {left, top, right, bottom} = bnd;
                                        return [left, top, right, bottom];
                                    };
                                    let _asg = (bnd) => {
                                        [_l, _t, _r, _b] = _parse(bnd);
                                    };
                                    let _eql = (bnd) => {
                                        let [l, t, r, b] = _parse(bnd);
                                        return _l === l && _t === t
                                            && _r === r && _b === b;
                                    };
                                    let _succ = () => {
                                        let _nod = sel.findOnce();
                                        if (!_nod) {
                                            return;
                                        }
                                        _bnd = _nod.bounds();
                                        if (_raw()) {
                                            return _asg(_bnd);
                                        }
                                        if (_eql(_bnd)) {
                                            return true;
                                        }
                                        _asg(_bnd);
                                    };

                                    waitForAction(_succ, 1.2e3, 120);

                                    return _bnd;
                                }
                            }

                            function _simpl(code, sz) {
                                let _code = code.slice();
                                let _code_bak = [];
                                _standardize();

                                while (_code_bak.length !== _code.length) {
                                    _code_bak = _code.slice();
                                    _rmDupe();
                                    _clean();
                                }

                                return _code;

                                // tool function(s) //

                                function _standardize() {
                                    _code = _code.filter((n) => (
                                        +n > 0 && +n <= sz * sz
                                    ));
                                }

                                function _rmDupe() {
                                    let _coord = _initCoord();
                                    let _k0 = NaN;
                                    let _len = _code.length;
                                    for (let n = 0; n < _len - 1; n += 1) {
                                        let _pt1 = _code[n];
                                        let _pt2 = _code[n + 1];
                                        let _k = _slope(_pt1, _pt2);
                                        // explicitly distinguishes between -0 and +0
                                        if (Object.is(_k0, _k)) {
                                            delete _code[n];
                                        } else {
                                            _k0 = _k;
                                        }
                                    }

                                    // tool function(s) //

                                    function _initCoord() {
                                        let _o = {};
                                        let _num = 1;
                                        for (let i = 1; i <= sz; i += 1) {
                                            for (let j = 1; j <= sz; j += 1) {
                                                _o[_num++] = [i, j];
                                            }
                                        }
                                        return _o;
                                    }

                                    // returns a slope ("斜率") of 2 pts
                                    function _slope(n1, n2) {
                                        let _p1 = _coord[n1];
                                        let _p2 = _coord[n2];
                                        if (!_p1 || !_p2) {
                                            return NaN;
                                        }
                                        let [_x1, _y1] = _p1;
                                        let [_x2, _y2] = _p2;
                                        return (_y2 - _y1) / (_x2 - _x1);
                                    }
                                }

                                function _clean() {
                                    let _code_tmp = [];
                                    let _cache = {};
                                    _code.forEach((n) => {
                                        if (!$_und(n) && !(n in _cache)) {
                                            _cache[n] = true;
                                            _code_tmp.push(n);
                                        }
                                    });
                                    _code = _code_tmp;
                                }
                            }
                        }
                    }
                }

                function _password() {
                    if (_misjudge()) {
                        return;
                    }

                    let _map = {
                        common: {
                            desc: "通用",
                            selector: idMatches(".*passwordEntry"),
                        },
                        miui: {
                            desc: "MIUI",
                            selector: idMatches(_ak + "miui_mixed_password_input_field"),
                        },
                        smartisanos: {
                            desc: "锤子科技",
                            selector: idMatches(_sk + "passwordEntry(_.+)?").className("EditText"),
                        },
                    };

                    for (let key in _map) {
                        if (_map.hasOwnProperty(key)) {
                            let {desc: _desc, selector: _sel} = _map[key];
                            if (_sel.exists()) {
                                debugInfo("匹配到" + _desc + "密码解锁控件");
                                return _trigger(_sel, _stg);
                            }
                        }
                    }

                    // strategy(ies) //

                    function _stg() {
                        let _pw = _code;
                        if ($_arr(_pw)) {
                            _pw = _pw.join("");
                        }

                        let _rex = /确.|完成|[Cc]onfirm|[Ee]nter/;
                        let _cfm_btn = type => $_sel.pickup([_rex, {
                            className: "Button",
                            clickable: true,
                        }], type);

                        let _ctr = 0;
                        let _max = Math.ceil(_max_try * 0.6);
                        while (!_lmt()) {
                            let _s = " (" + _ctr + "/" + _max + ")";
                            debugInfo(_ctr
                                ? "重试密码解锁" + _s
                                : "尝试密码解锁"
                            );

                            _this.sel.setText(_pw);

                            _keypadAssistIFN();

                            let _cfm_nod = _cfm_btn("widget");
                            if (_cfm_nod) {
                                let _txt = _cfm_btn("txt");
                                let _s = '点击"' + _txt + '"按钮';
                                debugInfo(_s);
                                try {
                                    clickAction(_cfm_nod, "w");
                                } catch (e) {
                                    debugInfo("按钮点击可能未成功", 3);
                                }
                            }
                            if (_this.succ(2)) {
                                break;
                            }
                            if (!shell("input keyevent 66", true).code) {
                                debugInfo("使用Root权限模拟回车键");
                                sleep(480);
                                if (_this.succ()) {
                                    break;
                                }
                            }
                            _ctr += 1;
                            sleep(200);
                        }
                        debugInfo("密码解锁成功");
                        return true;

                        // tool function(s) //

                        function _lmt() {
                            if (_ctr > _max) {
                                return _err([
                                    "密码解锁方案失败",
                                    "可能是密码错误",
                                    "或无法点击密码确认按钮"
                                ]);
                            }
                        }

                        function _keypadAssistIFN() {
                            // brand + product + release
                            let _smp_o = {
                                "HUAWEI VOG-AL00 9": {
                                    // character to press or input before
                                    // special treatment if needed
                                    pre_char_refill: 1,
                                    // keys_coords: [[864, 1706], [1008, 1706]],
                                    // DEL KEY coordination(s)
                                    keys_coords: [[1008, 1706]],
                                    // last password character to
                                    // press or input if needed in the end
                                    suf_char_refill: null,
                                },
                            };
                            if (!(_intro in _smp_o)) {
                                return;
                            }
                            debugInfo("此设备机型需要按键辅助");

                            let _smp = _smp_o[_intro];
                            let _coords = _smp.keys_coords;
                            let _keys_len = _coords.length;
                            if (_keys_len) {
                                debugInfo("辅助按键共计: " + _keys_len + "项");
                                _coords.forEach((coord) => {
                                    let [_x, _y] = coord;
                                    debugInfo(">(" + _x + ", " + _y + ")");
                                });
                            }

                            let _pref = _smp.pre_char_refill;
                            let _suff = _smp.suf_char_refill;
                            if (!$_und(_pref) && !$_nul(_pref)) {
                                let _s = _pref.toString();
                                _this.sel.setText(_pw + _s);
                                debugInfo("辅助前置填充: " + _s.length + "项");
                            }

                            sleep(300);
                            _coords.forEach((coord) => {
                                clickAction(coord);
                                sleep(300);
                            });

                            if (!_suff) {
                                return;
                            }
                            if ($_jvo(_suff)) {
                                debugInfo("辅助后置填充类型: 控件");
                                return clickAction(_suff);
                            }
                            if ($_arr(_suff)) {
                                debugInfo("辅助后置填充类型: 坐标");
                                return click(_suff[0], _suff[1]);
                            }
                            if ($_num(_suff) || $_str(_suff)) {
                                let _kw = "(key.?)?" + _suff;
                                debugInfo("辅助后置填充类型: 文本");
                                return clickAction(idMatches(_kw))
                                    || clickAction(descMatches(_kw))
                                    || clickAction(textMatches(_kw));
                            }
                            return _err("密码解锁失败", "无法判断末位字符类型");
                        }
                    }

                    function _misjudge() {
                        let _dist = [
                            "com.android.systemui:id/lockPattern",
                        ];
                        let _len = _dist.length;
                        for (let i = 0; i < _len; i += 1) {
                            let _kw = _dist[i];
                            let _cA1 = () => $_str(_kw);
                            let _cA2 = () => id(_kw).exists();
                            let _cA = () => _cA1() && _cA2();
                            let _cB1 = () => $_rex(_kw);
                            let _cB2 = () => idMatches(_kw).exists();
                            let _cB = () => _cB1() && _cB2();
                            if (_cA() || _cB()) {
                                _this.misjudge = _kw;
                                debugInfo("匹配到误判干扰");
                                debugInfo("转移至PIN解锁方案");
                                return true;
                            }
                        }
                    }
                }

                function _pin() {
                    let _map = {
                        common: {
                            desc: "通用",
                            selector: idMatches(_as + "pinEntry"),
                        },
                        miui: {
                            desc: "MIUI",
                            selector: idMatches(_ak + "numeric_inputview"),
                        },
                        emui_10: {
                            desc: "EMUI10",
                            selector: idMatches(_as + "fixedPinEntry"),
                        },
                        emui: {
                            desc: "EMUI",
                            selector: descMatches("[Pp][Ii][Nn] ?(码区域|area)"),
                        },
                        meizu: {
                            desc: "魅族",
                            selector: idMatches(_as + "lockPattern"),
                        },
                        oppo: {
                            desc: "OPPO",
                            selector: idMatches(_as + "(coloros.)?keyguard.pin.(six.)?view"),
                        },
                        vivo: {
                            desc: "VIVO",
                            selector: idMatches(_as + "vivo_pin_view"),
                        },
                    };

                    for (let key in _map) {
                        if (_map.hasOwnProperty(key)) {
                            let {desc: _desc, selector: _sel} = _map[key];
                            if (_sel.exists()) {
                                if (_desc.match(/\w$/)) {
                                    _desc += "/";
                                }
                                debugInfo("匹配到" + _desc + "PIN解锁控件");
                                return _trigger(_sel, _stg);
                            }
                        }
                    }

                    // tool function(s) //

                    function _stg() {
                        let _pw = _clean_code;

                        let _ctr = 0;
                        let _max = Math.ceil(_max_try * 0.6);
                        while (!_lmt()) {
                            let _s = " (" + _ctr + "/" + _max + ")";
                            debugInfo(_ctr
                                ? "重试PIN解锁" + _s
                                : "尝试PIN解锁"
                            );

                            if ($_func(_this.unlockPin)) {
                                _this.unlockPin();
                            } else {
                                _unlockPin();
                            }

                            if (_this.succ()) {
                                break;
                            }
                            if (_clickKeyEnter()) {
                                break;
                            }
                            _ctr += 1;
                            sleep(200);
                        }
                        debugInfo("PIN解锁成功");
                        return true;

                        // tool function(s) //

                        function _lmt() {
                            if (_ctr > _max) {
                                return _err([
                                    "PIN解锁方案失败",
                                    "尝试次数已达上限"
                                ]);
                            }
                        }

                        function _clickKeyEnter() {
                            let _kw = idMatches(_as + "key_enter");
                            if (_kw.exists()) {
                                debugInfo('点击"key_enter"控件');
                                clickAction(_kw, "w");
                                return _this.succ();
                            }
                        }

                        function _unlockPin() {
                            let _num_pad = {
                                kw(num) {
                                    return idMatches(_as + "key" + num);
                                },
                                widget(num) {
                                    return this.kw(num).findOnce();
                                },
                                test() {
                                    let _kw = n => _num_pad.kw(n);
                                    if (_testNumWidgets(_kw)) {
                                        debugInfo("匹配到通用PIN/KEY解锁控件");
                                        return true;
                                    }
                                },
                                click() {
                                    let _widget = n => _num_pad.widget(n);
                                    return _trig(() => {
                                        _pw.forEach((n) => {
                                            clickAction(_widget(n), "w");
                                        });
                                    });
                                },
                            };
                            let _cntr = {
                                test() {
                                    let _kw = idMatches(_as + "container");
                                    let _w = _kw.findOnce();
                                    if (_w) {
                                        debugInfo("匹配到通用PIN容器解锁控件");
                                        return this.widget = _w;
                                    }
                                },
                                click() {
                                    let _widget = this.widget;
                                    let _bnd = _widget.bounds();
                                    let _len = _widget.childCount();
                                    let _b = _widget.child(_len - 1).bounds().bottom;
                                    let _t = _widget.child(_len - 4).bounds().top;
                                    let _rect = [_bnd.left, _t, _bnd.right, _b];
                                    let _f = () => _clickVirtualKeypad(_pw, _rect);
                                    return _trig(_f);
                                },
                            };
                            let _inp_view = {
                                kw(num) {
                                    let _num = num.toString();
                                    // miui
                                    return idMatches(_ak + "numeric_inputview").text(_num);
                                },
                                widget(num) {
                                    return this.kw(num).findOnce();
                                },
                                test() {
                                    let _kw = n => _inp_view.kw(n);
                                    if (_testNumWidgets(_kw)) {
                                        debugInfo("匹配到MIUI/PIN解锁控件");
                                        return true;
                                    }
                                },
                                click() {
                                    let _widget = n => _inp_view.widget(n);
                                    return _trig(() => {
                                        _pw.forEach((n) => {
                                            clickAction(_widget(n), "w");
                                        });
                                    });
                                },
                            };
                            let _sgl_desc = {
                                kw(num) {
                                    return desc(num);
                                },
                                widget(num) {
                                    let _widget = this.kw(num).findOnce();
                                    if (!+num && !_widget) {
                                        return _specialZero();
                                    }
                                    return _widget;

                                    // tool function(s) //

                                    function _specialZero() {
                                        // center coordination
                                        let _ctc = (num) => {
                                            let _bnd = _sgl_desc.widget(num).bounds();
                                            let _ctx = _bnd.centerX();
                                            let _cty = _bnd.centerY();
                                            return {x: _ctx, y: _cty};
                                        };
                                        let [_8, _5, _2] = [_ctc(8), _ctc(5), _ctc(2)];
                                        let _pt = n => _8[n] + (_5[n] - _2[n]);
                                        return [_pt("x"), _pt("y")];
                                    }
                                },
                                test() {
                                    let _kw = n => _sgl_desc.kw(n);
                                    if (_testNumWidgets(_kw)) {
                                        debugInfo("匹配到内容描述PIN解锁控件");
                                        return true;
                                    }
                                },
                                click() {
                                    let _widget = n => _sgl_desc.widget(n);
                                    return _trig(() => {
                                        _pw.forEach((n) => {
                                            clickAction(_widget(n), "w");
                                        });
                                    });
                                },
                            };
                            let _msj = {
                                test() {
                                    let _aim = _this.misjudge;
                                    if (_aim) {
                                        debugInfo("匹配到标记匹配PIN解锁控件");
                                        debugInfo(">已匹配的字符串化标记:");
                                        debugInfo(">" + _aim.toString());
                                        return this.aim = _aim;
                                    }
                                },
                                click() {
                                    return _trig(function () {
                                        let _aim = _msj.aim;
                                        if (!_aim) {
                                            return;
                                        }

                                        let _widget = idMatches(_aim).findOnce();
                                        if (!_widget) {
                                            return;
                                        }

                                        let _bnd = _widget.bounds();
                                        _clickVirtualKeypad(_pw, _bnd);
                                    });
                                }
                            };

                            let _max = 8;
                            while (_max--) {
                                if (_num_pad.test()) {
                                    return _num_pad.click();
                                }
                                if (_cntr.test()) {
                                    return _cntr.click();
                                }
                                if (_inp_view.test()) {
                                    return _inp_view.click();
                                }
                                if (_sgl_desc.test()) {
                                    return _sgl_desc.click();
                                }
                                if (_msj.test()) {
                                    return _msj.click();
                                }
                                sleep(240);
                            }
                            return _err("预置的PIN解锁方案全部无效");

                            // tool function(s) //

                            function _trig(f) {
                                _this.unlockPin = () => f();
                                return f();
                            }

                            function _testNumWidgets(f) {
                                // there is no need to check "0"
                                // as a special treatment will be
                                // given in getNumsBySingleDesc()
                                let _nums = "123456789".split("");
                                let _len = _nums.length;
                                let _ctr = 9;
                                for (let i = 0; i < _len; i += 1) {
                                    let _kw = f(_nums[i]);
                                    if (!_kw.exists()) {
                                        _ctr -= 1;
                                    }
                                }
                                return _ctr > 6;
                            }
                        }
                    }
                }

                function _specials() {
                    let _map = {
                        gxzw: {
                            desc: '"Gxzw"屏下指纹设备',
                            selector: idMatches(/.*[Gg][Xx][Zz][Ww].*/),
                            pw_rect: [0.0875, 0.47, 0.9125, 0.788],
                        },
                        // testA: {
                        //     selector: idMatches(/test_test/),
                        //     pw_rect: [0, 0, 1, 1],
                        // },
                        // testB: {
                        //     selector: idMatches(/test_test_2/),
                        //     pw_rect: [0, 0.5, 1, 0.9],
                        // },
                    };

                    for (let key in _map) {
                        if (_map.hasOwnProperty(key)) {
                            let {desc: _desc, selector: _sel, pw_rect: _rect} = _map[key];
                            if (_sel.exists()) {
                                debugInfo(["匹配到特殊设备解锁方案:", _desc]);
                                return _trigger(_sel, _stg.bind(null, _rect));
                            }
                        }
                    }

                    // tool function(s) //

                    function _stg(pw_rect) {
                        let _rect = pw_rect.map((n, i) => {
                            return i % 2 ? cY(n) : cX(n);
                        });
                        let [_l, _t, _r, _b] = _rect;
                        debugInfo("已构建密码区域边界:");
                        debugInfo("Rect(" + _l + ", " + _t + " - " + _r + ", " + _b + ")");

                        _clickVirtualKeypad(_clean_code, _rect);

                        if (_this.succ()) {
                            return true;
                        }
                        _err("尝试特殊解锁方案失败");
                    }
                }

                function _unmatched() {
                    if (!_isUnlk()) {
                        debugInfo("未匹配到可用的解锁控件");
                    }
                }

                function _trigger(sel, stg) {
                    _this.sel = sel;
                    _this.stg = stg;
                    return (_this.trigger = sel.exists.bind(sel))();
                }

                function _clickVirtualKeypad(pw, rect) {
                    let _r_l, _r_t, _r_w, _r_h;

                    if ($_arr(rect)) {
                        let [_l, _t, _r, _b] = rect;
                        _r_l = _l;
                        _r_t = _t;
                        _r_w = _r - _l;
                        _r_h = _b - _t;
                    } else {
                        let _bnd = rect;
                        _r_l = _bnd.left;
                        _r_t = _bnd.top;
                        _r_w = _bnd.width();
                        _r_h = _bnd.height();
                    }

                    let _w = Math.trunc(_r_w / 3);
                    let _h = Math.trunc(_r_h / 4);
                    let _x1 = _r_l + Math.trunc(_w / 2);
                    let _y1 = _r_t + Math.trunc(_h / 2);

                    let _keypads = [];
                    for (let j = 1; j <= 4; j += 1) {
                        for (let i = 1; i <= 3; i += 1) {
                            _keypads[(j - 1) * 3 + i] = {
                                x: _x1 + _w * (i - 1),
                                y: _y1 + _h * (j - 1),
                            };
                        }
                    }
                    debugInfo("已构建拨号盘数字坐标");
                    _keypads.forEach((pt, i) => {
                        debugInfo(i + ": (" + pt.x + ", " + pt.y + ")");
                    });

                    pw.forEach((v) => {
                        let _pt = _keypads[+v || 11];
                        click(_pt.x, _pt.y);
                    });
                }
            },
            dismiss() {
                if (!_code) {
                    return _err("密码为空");
                }
                if (!$_func(this.stg)) {
                    return _err("没有可用的解锁策略");
                }
                devicex.keepOn(5);
                this.stg();
                devicex.cancelOn();
            },
            handle() {
                return this.trigger() && this.dismiss();
            },
            succ(t) {
                let _t = t || 1920;
                let _err_shown_fg;
                let _cond = () => {
                    if (_correct()) {
                        _chkTryAgain();
                        _chkOKBtn();
                        return _isUnlk();
                    }
                    _err_shown_fg = true;
                };

                return waitForAction(_cond, _t, 240);

                // tool function(s) //

                function _correct() {
                    // just for typo avoidance
                    let _rex_text = new RegExp(
                        ".*(" +
                        "重试|不正确|错误|" +
                        "Incorrect|incorrect|" +
                        "Retry|retry|" +
                        "Wrong|wrong" +
                        ").*"
                    );
                    let _txt = $_sel.pickup(_rex_text, "txt");
                    let _rex_id = new RegExp(
                        _ak + "phone_locked_textview"
                    );
                    if (_txt) {
                        return _err_shown_fg || debugInfo(_txt, 3);
                    }
                    if (idMatches(_rex_id).exists()) {
                        return _err_shown_fg || debugInfo("密码错误", 3);
                    }
                    return true;
                }

                function _chkTryAgain() {
                    let _rex = new RegExp(".*(" +
                        "[Tt]ry again in.+|\\d+.*后重试" +
                        ").*");
                    let _kw = textMatches(_rex);
                    let _chk = () => _kw.exists();
                    if (_chk()) {
                        debugInfo("正在等待重试超时");
                        waitForAction(() => !_chk(), 65e3, 500);
                    }
                }

                function _chkOKBtn() {
                    let _rex = /OK|确([认定])|好的?/;
                    let _kw = textMatches(_rex);
                    let _widget = _kw.findOnce();
                    if (_widget) {
                        let _txt = _widget.text();
                        debugInfo('点击"' + _txt + '"按钮');
                        clickAction(_widget, "w");
                        sleep(1e3);
                    }
                }
            },
        },
    };
}

function _unlock(forc_debug) {
    _backupImpeded();

    let _dash = "__split_line_dash__";
    let _debug_notice = forc_debug || $_F(forc_debug);

    _sto.put("config", _cfg);

    _debugPrologue();
    _wakeUpIFN();

    while (!_isUnlk() && !_lmtRch()) {
        $_unlk.prev_cntr.handle();
        $_unlk.unlk_view.handle();
    }

    _debugEpilogue();
    _restoreImpededIFN();

    return true;

    // tool function(s) //

    function _debugPrologue() {
        if (_debug_notice) {
            $_flag.debug_info_avail_bak = $_flag.debug_info_avail;
            $_flag.debug_info_avail = !!forc_debug;
        }
        debugInfo([_dash, "尝试自动解锁", _dash]);
    }

    function _debugEpilogue() {
        debugInfo([_dash, "自动解锁完毕", _dash]);
        if (_debug_notice) {
            $_flag.debug_info_avail = $_flag.debug_info_avail_bak;
            delete $_flag.debug_info_avail_bak;
        }
    }

    function _lmtRch() {
        let _max = _max_try;
        let _ctr = $_und(_unlock.ctr) ? _unlock.ctr = 0 : ++_unlock.ctr;
        if (_ctr > _max) {
            return _err("解锁尝试次数已达上限");
        }
        let _s = " (" + _ctr + "/" + _max + ")";
        debugInfo(_ctr ? "重试解锁" + _s : "尝试解锁");
        sleep(240);
    }

    function _backupImpeded() {
        if (typeof global.$$impeded === "function") {
            // copy global.$$impeded
            global.impededBak = $$impeded.bind(global);
        }
    }

    function _restoreImpededIFN() {
        if ($_func(global.impededBak)) {
            global.$$impeded = global.impededBak;
        }
    }
}

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
    console.log(_split_line + _extra_str);
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

function debugInfoRaw(msg, info_flg) {
    if (info_flg) {
        let _s = msg || "";
        _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
        console.verbose(_s);
    }
}