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
 * @since Apr 16, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

/**
 * @returns {{
 *   is_screen_on: boolean,
 *   unlock: (function(): boolean),
 *   isLocked: (function(): boolean),
 *   isUnlocked: (function(): boolean),
 * }}
 */
!function () {
    _overrideRequire();
    _makeSureImpeded();
    _addObjectValues();
    _activeDeviceObj();

    let $_und = x => typeof x === "undefined";
    let $_F = x => x === false;
    let $_nul = x => x === null;
    let $_func = x => typeof x === "function";
    let $_num = x => typeof x === "number";
    let $_str = x => typeof x === "string";

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
    if ($_und(global["$$flag"])) {
        global["$$flag"] = {};
    }
    let $_unlk = _unlkSetter();
    let _intro = device.brand + " " + device.product + " " + device.release;
    let _code = _getCode();
    let _clean_code = _code.split(/\D+/).join("").split("");
    let _max_try = _cfg.unlock_max_try_times;
    let _pat_sz = _cfg.unlock_pattern_size;

    module.exports = {
        is_screen_on: $_unlk.init_scr,
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
                            return _req(_p);
                        }
                        if (!files.path(_p).match(/\/Modules\//)) {
                            let _mod_p = files.path(_p)
                                .replace(/\/(.+?\.js$)/, "/Modules/$1");
                            if (files.exists(_mod_p)) {
                                return _req(_mod_p);
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
                        // updated at Nov 14, 2019
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

                // updated at Nov 14, 2019
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

                    // updated at Mar 1, 2020
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

                    // updated at Mar 1, 2020
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

                    // updated at Mar 1, 2020
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

                    // updated at Mar 1, 2020
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

                    // updated at Mar 1, 2020
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

                    // updated at Mar 1, 2020
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

                    // updated at Mar 1, 2020
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

                    // updated at Mar 1, 2020
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
                                                return sel.exists() ? sel : null;
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

                    // updated at Mar 1, 2020
                    function classof(source, check_value) {
                        let class_result = Object.prototype.toString.call(source).slice(8, -1);
                        return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
                    }
                }

                // updated at Jan 8, 2020
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
                            global["setClip"](_res);
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
                                    let _sglStr = s => {
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
                            global["setClip"](_decrypted);
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
                                        _res += unescape("%u" + _tmp);
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
                            global["toastLog"](_s);
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
                            _inp = dialogs.rawInput(
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
                            let _msg = dec ?
                                "正在解密中 请稍候..." :
                                "正在加密中 请稍候...";
                            sleep(2400);
                            let _ctr = 0;
                            while (1) {
                                if (!(_ctr++ % 5)) {
                                    toast(_msg);
                                }
                                sleep(1000);
                            }
                        });
                    }
                }

                // updated at Jan 4, 2020
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

                        function put(key, new_value, forcible_flag) {
                            if (typeof new_value === "undefined") {
                                throw new TypeError('"put" value can\'t be undefined');
                            }
                            let _read = readFile();
                            let _old_data = {};
                            let _tmp_data = {};

                            try {
                                _old_data = JSON.parse(_read, (k, v) => v === "Infinity" ? Infinity : v);
                            } catch (e) {
                                console.warn(e.message);
                            }

                            let _both_type_o = classof(new_value, "Object") && classof(_old_data[key], "Object");
                            if (!forcible_flag && _both_type_o && Object.keys(new_value).length) {
                                _tmp_data[key] = Object.assign(_old_data[key], new_value);
                            } else {
                                _tmp_data[key] = new_value;
                            }
                            Object.assign(_old_data, _tmp_data);
                            files.write(file, JSON.stringify(_old_data, (k, v) => v === Infinity ? "Infinity" : v));
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

                        function classof(source, check_value) {
                            let class_result = Object.prototype.toString.call(source).slice(8, -1);
                            return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
                        }
                    }
                }
            }
        };
    }

    function _addObjectValues() {
        if (!Object["values"]) {
            Object.prototype.values = function (o) {
                if (o !== Object(o))
                    throw new TypeError("Object.values called on a non-object");
                let key;
                let value = [];
                for (key in o) {
                    if (o.hasOwnProperty(key)) {
                        value.push(o[key]);
                    }
                }
                return value;
            };
        }
        if (!Object["valuesArr"]) {
            Object.prototype.valuesArr = function () {
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
            };
        }
    }

    function _makeSureImpeded() {
        if (typeof global["$$impeded"] === "undefined") {
            global["$$impeded"] = () => void 0;
        }
    }

    function _activeDeviceObj() {
        let $_dev = global["device"] || {};
        let _ = $_dev.__proto__;
        if (!_) {
            _ = $_dev.__proto__ = {};
        }
        if (!$_dev.keepOn) {
            _.keepOn = function (duration, params) {
                params = params || {};
                duration = duration || 5;
                if (duration < 100) duration *= 60000;
                $_dev.keepScreenOn(duration);
                if (params.debug_info_flag !== false) {
                    debugInfo("已设置屏幕常亮");
                    debugInfo(">最大超时时间: " + +(duration / 60000).toFixed(2) + "分钟");
                }
            };
        }
        if (!$_dev.cancelOn) {
            _.cancelOn = function (params) {
                // click(Math.pow(10, 7), Math.pow(10, 7));
                params = params || {};
                $_dev.cancelKeepingAwake();
                if (params.debug_info_flag !== false) {
                    debugInfo("屏幕常亮已取消");
                }
            };
        }
        if (!$_dev.getDisplay) {
            _.getDisplay = function (global_assign, params) {
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
            };
        }
        device.getDisplay(true);
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

    function _getCode() {
        let _mod_pwmap = require("./MODULE_PWMAP");
        let $_dec = _mod_pwmap.decrypt;
        return $_dec(_cfg.unlock_code) || "";
    }

    function _err(s) {
        device.cancelOn();
        messageAction("解锁失败", 4, 1, 0, -1);

        ($_str(s) ? [s] : s.slice()).forEach((m) => {
            m && messageAction(m, 4, 0, 1)
        });

        messageAction(_intro, 4, 0, 1, 1);
        captureErrScreen("unlock_failed", 1);

        if ($_unlk.init_scr) {
            let _suffix = keycode(26) ? "" : "失败";
            let _msg = "自动关闭屏幕" + _suffix;
            messageAction(_msg, 1, 0, 0, 1);
        }

        exit();
        sleep(3600);
    }

    function _isScrOn() {
        return device.isScreenOn();
    }

    function _isUnlk() {
        let _kg_man = context.getSystemService(context.KEYGUARD_SERVICE);
        return !_kg_man.isKeyguardLocked();
    }

    function _wakeUpIFN() {
        if (_isScrOn()) {
            return;
        }

        let _max = 4; // 6 sec
        let _ctr = 0;

        while (!_lmt()) {
            let _s = " (" + _ctr + "/" + _max + ")";
            debugInfo(_ctr
                ? "重试唤起设备" + _s
                : "尝试唤起设备"
            );
            device.wakeUpIfNeeded();
            if (waitForAction(_isScrOn, 1500)) {
                // keep screen on for 2 min
                device.keepScreenOn(120 * 1000);
                break;
            }
            _ctr += 1;
        }

        debugInfo("设备唤起成功");

        // tool function(s) //

        function _lmt() {
            if (_ctr > _max) {
                return _err("设备唤起失败");
            }
        }
    }

    function _unlkSetter() {
        let _as = "com\\.android\\.systemui:id/";
        let _ak = "com\\.android\\.keyguard:id/";
        let _sk = "com\\.smartisanos\\.keyguard:id/";

        return {
            init_scr: _isScrOn(),
            prev_cntr: {
                chk: function () {
                    _wakeUpIFN();
                    _disturbance();

                    let _common = idMatches(_as +
                        "preview_container"
                    );
                    let _emui = idMatches(_as +
                        ".*(keyguard|lock)_indication.*"
                    );
                    let _smartisanos = idMatches(_sk +
                        "keyguard_(content|.*view)"
                    );
                    let _miui = idMatches(_ak + "(" +
                        ".*unlock_screen.*" + "|" +
                        ".*notification_.*(container|view).*" + ")"
                    );
                    let _miui10 = idMatches(_as + "(" +
                        ".*lock_screen_container" + "|" +
                        "notification_(container.*|panel.*)" + "|" +
                        "keyguard_.*" + ")"
                    );

                    if (_common.exists()) {
                        debugInfo("匹配到通用解锁提示层控件");
                        return (
                            this.chk = () => _common.exists()
                        )();
                    }

                    if (_emui.exists()) {
                        debugInfo("匹配到EMUI解锁提示层控件");
                        return (
                            this.chk = () => _emui.exists()
                        )();
                    }

                    if (_smartisanos.exists()) {
                        debugInfo('匹配到"锤子科技"解锁提示层控件');
                        return (
                            this.chk = () => _smartisanos.exists()
                        )();
                    }

                    if (_miui.exists()) {
                        debugInfo("匹配到MIUI解锁提示层控件");
                        return (
                            this.chk = () => _miui.exists()
                        )();
                    }

                    if (_miui10.exists()) {
                        debugInfo("匹配到MIUI10解锁提示层控件");
                        return (
                            this.chk = () => _miui10.exists()
                        )();
                    }

                    // tool function(s) //

                    function _disturbance() {
                        _qqMsgBox();

                        // tool function(s) //

                        function _qqMsgBox() {
                            let _text = () => $_sel.pickup("按住录音");
                            let _id = () => $_sel.pickup(idMatches(/com.tencent.mobileqq:id.+/));
                            let _cA = () => _text() || _id();
                            let _cB = () => !_cA();

                            if (!_cA()) {
                                return;
                            }

                            debugInfo("匹配到QQ锁屏消息弹框控件");
                            clickAction($_sel.pickup("关闭"), "w");

                            if (waitForAction(_cB, 3000)) {
                                debugInfo("关闭弹框控件成功");
                            } else {
                                debugInfo("关闭弹框控件超时", 3);
                            }
                        }
                    }
                },
                dis: function () {
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
                        let _this = $_unlk.prev_cntr;
                        let _par = [];
                        _pts.forEach(y => _par.push([halfW, cY(y)]));

                        let _max = 30;
                        let _ctr = 0;
                        device.keepOn(3);
                        while (!_lmt()) {
                            let _s = " (" + _ctr + "/" + _max + ")";
                            debugInfo(_ctr
                                ? "重试消除解锁页面提示层" + _s
                                : "尝试消除解锁页面提示层"
                            );
                            debugInfo("滑动时长: " + _time + "毫秒");
                            debugInfo("参数来源: " + (
                                _from_sto ? "本地存储" : "自动计算"
                            ));

                            global["gesture"].apply({}, [_time].concat(_par));

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
                        device.cancelOn();
                        debugInfo("解锁页面提示层消除成功");

                        // tool function(s) //

                        function _lmt() {
                            if (_ctr > _max) {
                                _t_pool[_time] = 0;
                                _sto.put("config", {
                                    continuous_swipe: _t_pool,
                                });
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
                handle: function () {
                    return this.chk() && this.dis();
                },
                succ: function () {
                    let _this = this;
                    let _cA1 = () => !_this.chk();
                    let _cA = () => waitForAction(_cA1, 1500);
                    let _cB = () => $_unlk.unlk_view.chk();
                    return _cA() || _cB();
                },
            },
            unlk_view: {
                chk: function () {
                    let _this = this;

                    if (!_isScrOn()) {
                        debugInfo("跳过解锁控件检测");
                        debugInfo(">屏幕未亮起");
                        return;
                    }
                    return _pattern()
                        || _password()
                        || _pin()
                        || _specials()
                        || _unmatched();

                    // tool function(s) //

                    function _unmatched() {
                        if (!_isUnlk()) {
                            debugInfo("未匹配到可用的解锁控件");
                        }
                    }

                    function _trigger(sel, stg) {
                        _this.sel = sel;
                        _this.stg = stg;
                        _this.chk = () => sel.exists();
                        return _this.chk();
                    }

                    function _pattern() {
                        let _common = idMatches(_as +
                            "lockPatternView"
                        );
                        let _miui = idMatches(_ak +
                            "lockPattern(View)?"
                        );

                        if (_common.exists()) {
                            debugInfo("匹配到通用图案解锁控件");
                            return _trigger(_common, _stg);
                        }
                        if (_miui.exists()) {
                            debugInfo("匹配到MIUI图案解锁控件");
                            return _trigger(_miui, _stg);
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
                                debugInfo(_ctr
                                    ? "重试图案密码解锁" + _s
                                    : "尝试图案密码解锁"
                                );
                                debugInfo("滑动时长: " + _time + "毫秒");
                                debugInfo("滑动策略: " + _stg_map[_stg]);

                                let _pts = _getPts();
                                let _act = {
                                    segmental: () => {
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
                                        global["gestures"].apply({}, _par);
                                    },
                                    solid: () => {
                                        let _par = [_time].concat(_pts);
                                        global["gesture"].apply({}, _par);
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

                                        waitForAction(_succ, 1200, 120);

                                        return _bnd;
                                    }
                                }

                                function _simpl(code, sz) {
                                    _rmDupe();
                                    _clean();

                                    return code;

                                    // tool function(s) //

                                    function _rmDupe() {
                                        let _coord = _initCoord();
                                        let _k0 = NaN;
                                        let _len = code.length;
                                        for (let n = 0; n < _len - 1; n += 1) {
                                            let _pt1 = code[n];
                                            let _pt2 = code[n + 1];
                                            let _k = _slope(_pt1, _pt2);
                                            if (_k0 !== _k) {
                                                _k0 = _k;
                                            } else {
                                                delete code[n];
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
                                            if (_y1 === _y2) {
                                                return (_x2 - _x1 > 0 ? 1 : -1) * 1e-5;
                                            }
                                            return (_y2 - _y1) / (_x2 - _x1);
                                        }
                                    }

                                    function _clean() {
                                        code = code.filter(x => !$_und(x));
                                        let _len = code.length;
                                        for (let n = _len - 1; n > 0; n -= 1) {
                                            if (code[n] === code[n - 1]) {
                                                code.splice(n, 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    function _password() {
                        let _common = idMatches("" +
                            ".*passwordEntry"
                        );
                        let _miui = idMatches(_ak +
                            "miui_mixed_password_input_field"
                        );
                        let _smartisanos = idMatches(_sk +
                            "passwordEntry(_.+)?"
                        ).className("EditText");

                        if (_misjudge()) {
                            return;
                        }
                        if (_common.exists()) {
                            debugInfo("匹配到通用密码解锁控件");
                            return _trigger(_common, _stg);
                        }
                        if (_miui.exists()) {
                            debugInfo("匹配到MIUI密码解锁控件");
                            return _trigger(_miui, _stg);
                        }
                        if (_smartisanos.exists()) {
                            debugInfo('匹配到"锤子科技"密码解锁控件');
                            return _trigger(_smartisanos, _stg);
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

                                let _cfm_nod = _cfm_btn("node");
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
                        let _common = idMatches(_as +
                            "pinEntry"
                        );
                        let _miui = idMatches(_ak +
                            "numeric_inputview"
                        );
                        let _emui_10 = idMatches(_as + 
                            "fixedPinEntry"
                        );
                        let _emui = descMatches("" +
                            "[Pp][Ii][Nn] ?(码区域|area)"
                        );
                        let _meizu = idMatches(_as +
                            "lockPattern"
                        );
                        let _oppo = idMatches(_as +
                            "(coloros.)?keyguard.pin.(six.)?view"
                        );

                        if (_common.exists()) {
                            debugInfo("匹配到通用PIN解锁控件");
                            return _trigger(_common, _stg);
                        }
                        if (_miui.exists()) {
                            debugInfo("匹配到MIUI/PIN解锁控件");
                            return _trigger(_miui, _stg);
                        }
                        if (_emui_10.exists()) {
                            debugInfo("匹配到EMUI10/PIN解锁控件");
                            return _trigger(_emui_10, _stg);
                        }
                        if (_emui.exists()) {
                            debugInfo("匹配到EMUI/PIN解锁控件");
                            return _trigger(_emui, _stg);
                        }
                        if (_meizu.exists()) {
                            debugInfo("匹配到魅族PIN解锁控件");
                            return _trigger(_meizu, _stg);
                        }
                        if (_oppo.exists()) {
                            debugInfo("匹配到OPPO/PIN解锁控件");
                            return _trigger(_oppo, _stg);
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
                                    kw: function (num) {
                                        return idMatches(_as + "key" + num);
                                    },
                                    node: function (num) {
                                        return this.kw(num).findOnce();
                                    },
                                    test: function () {
                                        let _kw = n => _num_pad.kw(n);
                                        if (_testNumNodes(_kw)) {
                                            debugInfo("匹配到通用PIN/KEY解锁控件");
                                            return true;
                                        }
                                    },
                                    click: function () {
                                        let _node = n => _num_pad.node(n);
                                        return _trig(() => {
                                            _pw.forEach((n) => {
                                                clickAction(_node(n), "w");
                                            });
                                        });
                                    },
                                };
                                let _cntr = {
                                    test: function () {
                                        let _kw = idMatches(_as + "container");
                                        let _node = _kw.findOnce();
                                        if (_node) {
                                            debugInfo("匹配到通用PIN容器解锁控件");
                                            return this.node = _node;
                                        }
                                    },
                                    click: function () {
                                        let _node = this.node;
                                        let _bnd = _node.bounds();
                                        let _len = _node.childCount();
                                        let _b = _node.child(_len - 1).bounds().bottom;
                                        let _t = _node.child(_len - 4).bounds().top;
                                        let _rect = [_bnd.left, _t, _bnd.right, _b];
                                        let _f = () => _clickVirtualKeypad(_pw, _rect);
                                        return _trig(_f);
                                    },
                                };
                                let _inp_view = {
                                    kw: function (num) {
                                        let _num = num.toString();
                                        // miui
                                        return idMatches(_ak + "numeric_inputview").text(_num);
                                    },
                                    node: function (num) {
                                        return this.kw(num).findOnce();
                                    },
                                    test: function () {
                                        let _kw = n => _inp_view.kw(n);
                                        if (_testNumNodes(_kw)) {
                                            debugInfo("匹配到MIUI/PIN解锁控件");
                                            return true;
                                        }
                                    },
                                    click: function () {
                                        let _node = n => _inp_view.node(n);
                                        return _trig(() => {
                                            _pw.forEach((n) => {
                                                clickAction(_node(n), "w");
                                            });
                                        });
                                    },
                                };
                                let _sgl_desc = {
                                    kw: function (num) {
                                        return desc(num);
                                    },
                                    node: function (num) {
                                        let _node = this.kw(num).findOnce();
                                        if (!+num && !_node) {
                                            return _specialZero();
                                        }
                                        return _node;

                                        // tool function(s) //

                                        function _specialZero() {
                                            // center coordination
                                            let _ctc = (num) => {
                                                let _bnd = _sgl_desc.node(num).bounds();
                                                let _ctx = _bnd.centerX();
                                                let _cty = _bnd.centerY();
                                                return {x: _ctx, y: _cty};
                                            };
                                            let [_8, _5, _2] = [_ctc(8), _ctc(5), _ctc(2)];
                                            let _pt = n => _8[n] + (_5[n] - _2[n]);
                                            return [_pt("x"), _pt("y")];
                                        }
                                    },
                                    test: function () {
                                        let _kw = n => _sgl_desc.kw(n);
                                        if (_testNumNodes(_kw)) {
                                            debugInfo("匹配到内容描述PIN解锁控件");
                                            return true;
                                        }
                                    },
                                    click: function () {
                                        let _node = n => _sgl_desc.node(n);
                                        return _trig(() => {
                                            _pw.forEach((n) => {
                                                clickAction(_node(n), "w");
                                            });
                                        });
                                    },
                                };
                                let _msj = {
                                    test: function () {
                                        let _aim = _this.misjudge;
                                        if (_aim) {
                                            debugInfo("匹配到标记匹配PIN解锁控件");
                                            debugInfo(">已匹配的字符串化标记:");
                                            debugInfo(">" + _aim.toString());
                                            return this.aim = _aim;
                                        }
                                    },
                                    click: function () {
                                        return _trig(function () {
                                            let _aim = _msj.aim;
                                            if (!_aim) {
                                                return;
                                            }

                                            let _node = idMatches(_aim).findOnce();
                                            if (!_node) {
                                                return;
                                            }

                                            let _bnd = _node.bounds();
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

                                function _testNumNodes(f) {
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
                            "gxzw": {
                                kw: idMatches(/.*[Gg][Xx][Zz][Ww].*/),
                                rec: [0.0875, 0.47, 0.9125, 0.788],
                            },
                            // "test": {
                            //     kw: idMatches(/test_test/),
                            //     rec: [0, 0, 1, 1],
                            // },
                            // "test2": {
                            //     kw: idMatches(/test_test_2/),
                            //     rec: [0, 0.5, 1, 0.9],
                            // },
                        };
                        let _keys = Object.keys(_map);
                        let _len = _keys.length;
                        for (let i = 0; i < _len; i += 1) {
                            let _smp = _map[_keys[i]];
                            if (_smp.kw.exists()) {
                                let _f = () => _stg(_smp.rec);
                                return _trigger(_smp.kw, _f);
                            }
                        }

                        // tool function(s) //

                        function _stg(rect) {
                            if (!rect) {
                                return;
                            }
                            let _rect = rect.map((n, i) => {
                                return i % 2 ? cY(n) : cX(n);
                            });

                            let _pw = _clean_code;
                            let [_l, _t, _r, _b] = _rect;
                            debugInfo("已构建密码区域边界:");
                            debugInfo("Rect(" +
                                _l + ", " + _t + " - " +
                                _r + ", " + _b + ")"
                            );

                            _clickVirtualKeypad(_pw, _rect);

                            if (_this.succ()) {
                                return true;
                            }
                            return _err("尝试特殊解锁方案失败");
                        }
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
                        _keypads.forEach((pt, idx) => {
                            debugInfo(idx + ": " +
                                "(" + pt.x + ", " + pt.y + ")"
                            );
                        });
                        pw.forEach(_clickKeypad);

                        // tool function(s) //

                        function _clickKeypad(num) {
                            let _num = +num || 11;
                            let _pt = _keypads[_num];
                            click(_pt.x, _pt.y);
                        }
                    }
                },
                dis: function () {
                    if (!_code) {
                        return _err("密码为空");
                    }
                    if (!$_func(this.stg)) {
                        return _err("没有可用的解锁策略");
                    }
                    device.keepOn(5);
                    this.stg();
                    device.cancelOn();
                },
                handle: function () {
                    return this.chk() && this.dis();
                },
                succ: function (t) {
                    let _t = t || 1920;
                    let _flg = true; // for _correct()
                    let _cond = function () {
                        if (!_correct()) {
                            return _flg = false;
                        }
                        _chkTryAgain();
                        _chkOKBtn();

                        return _isUnlk();
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
                        let _cA = () => _txt;
                        let _cB = () => idMatches(_rex_id).exists();
                        if (_cA()) {
                            return _flg && debugInfo(_txt, 3);
                        }
                        if (_cB()) {
                            return _flg && debugInfo("密码错误", 3);
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
                            waitForAction(() => !_chk(), 65000, 500);
                        }
                    }

                    function _chkOKBtn() {
                        let _rex = /OK|确(认|定)|好的?/;
                        let _kw = textMatches(_rex);
                        let _node = _kw.findOnce();
                        if (_node) {
                            let _txt = _node.text();
                            debugInfo('点击"' + _txt + '"按钮');
                            clickAction(_node, "w");
                            sleep(1000);
                        }
                    }
                },
            },
        };
    }

    function _unlock(forc_debug) {
        _backupImpeded();

        let _dash = "__split_line_dash__";
        let _debug = forc_debug || $_F(forc_debug);

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
            if (_debug) {
                $$flag.debug_info_avail_bak = $$flag.debug_info_avail;
                $$flag.debug_info_avail = !!forc_debug;
            }
            debugInfo([_dash, "尝试自动解锁", _dash]);
        }

        function _debugEpilogue() {
            debugInfo([_dash, "自动解锁完毕", _dash]);
            if (_debug) {
                $$flag.debug_info_avail = $$flag.debug_info_avail_bak;
                delete $$flag.debug_info_avail_bak;
            }
        }

        function _lmtRch() {
            let _max = _max_try;
            let _ctr = $_und(_unlock.ctr) ? 0 : _unlock.ctr++;
            if (_ctr > _max) {
                return _err("解锁尝试次数已达上限");
            }
            let _s = " (" + _ctr + "/" + _max + ")";
            debugInfo(_ctr ? "重试解锁" + _s : "尝试解锁");
            sleep(240);
        }

        function _backupImpeded() {
            if (typeof global["$$impeded"] === "function") {
                // copy global.$$impeded
                global["impededBak"] = $$impeded.bind(global);
            }
        }

        function _restoreImpededIFN() {
            if ($_func(global["impededBak"])) {
                global["$$impeded"] = global["impededBak"];
            }
        }
    }
}();