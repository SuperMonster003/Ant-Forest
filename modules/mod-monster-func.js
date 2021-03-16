global.$$impeded = (name) => {
    let $_flag = global.$$flag || {};
    if ($_flag.glob_e_trig_counter) {
        if (name) {
            messageAction('检测到全局事件触发信号', 1, 0, 0, 'up_dash');
            messageAction(name + '被迫阻塞', 1, 0, 0, 'dash');
        }
        while ($_flag.glob_e_trig_counter) {
            sleep(200);
        }
        if (name) {
            messageAction('全局事件触发信号全部解除', 1, 0, 0, 'up_dash');
            messageAction(name + '解除阻塞', 1, 0, 0, 'dash');
        }
    }
};

let ext = {
    clickAction: clickAction,
    waitForAction: waitForAction,
    waitForAndClickAction: waitForAndClickAction,
    swipeAndShow: swipeAndShow,
    swipeAndShowAndClickAction: swipeAndShowAndClickAction,
    messageAction: messageAction,
    showSplitLine: showSplitLine,
    keycode: keycode,
    debugInfo: debugInfo,
    deepCloneObject: deepCloneObject,
    equalObjects: equalObjects,
    observeToastMessage: observeToastMessage,
    getSelector: getSelector,
    surroundWith: surroundWith,
    timeRecorder: timeRecorder,
    clickActionsPipeline: clickActionsPipeline,
    timedTaskTimeFlagConverter: timedTaskTimeFlagConverter,
    baiduOcr: baiduOcr,
    setIntervalBySetTimeout: setIntervalBySetTimeout,
    classof: classof,
    stabilizer: stabilizer,
};
module.exports = ext;
module.exports.load = function () {
    let _args = Array.isArray(arguments[0]) ? arguments[0] : arguments;
    if (_args.length) {
        [].forEach.call(_args, k => global[k] = ext[k]);
    } else {
        let _load_bak;
        if (typeof global.load !== 'undefined') {
            _load_bak = global.load;
        }
        Object.assign(global, ext);
        if (typeof _load_bak !== 'undefined') {
            global.load = _load_bak;
        } else {
            delete global.load;
        }
    }
};

// tool function(s) //

/**
 * Handle message - toast, console and actions
 * @global
 * @param {string} msg - message
 * @param {number|'verbose'|'v'|'log'|'l'|'info'|'i'|'warn'|'w'|'error'|'e'|'x'|'t'|'title'|string|null} [msg_level=1] - message level
 * <br>
 *      -- 0/v/verbose - console.verbose(msg) <br>
 *      -- 1/l/log (default) - console.log(msg) <br>
 *      -- 2/i/info - console.info(msg) <br>
 *      -- 3/w/warn - console.warn(msg) <br>
 *      -- 4/e/error - console.error(msg) <br>
 *      -- 8/x - console.error(msg), exit <br>
 *      -- 9/t - console.error(msg), show ex message, exit <br>
 *      -- t/title - msg becomes a title like '[ title ]' <br>
 *      -- null - do not show message in console
 *
 * @param {number} [if_toast=0] - if toast the message needed
 * @param {number} [if_arrow=0] - if an arrow before msg needed (not for toast)
 * <br>
 *     -- 1 - '-> I got you now' <br>
 *     -- 2 - '--> I got you now' <br>
 *     -- 3 - '---> I got you now'
 * @param {number|'both'|'both_dash'|'both_n'|'both_dash_n'|'dash'|'up'|'up_dash'|'2_dash'|string} [if_split_line=0] - if split line(s) needed
 * <br>
 *     -- 0 - nothing to show additionally <br>
 *     -- 1 - '------------' - hyphen line (length: 33) <br>
 *     -- 2 - two hyphen lines clamped between message <br>
 *     -- /dash/ - '- - - - - - ' - dash line (length: 35) <br>
 *     -- /2_dash/ - two dash lines clamped between message <br>
 *     -- /up|-1/ - show a line before message <br>
 *     -- /both/ - show a line before and another one after message <br>
 *     -- /both_n/ - show a line before and another one after message, then print a blank new line
 * @param {object} [params] reserved
 * @example
 * messageAction('hello', 1);
 * messageAction('hello'); // same as above
 * messageAction('hello', 2);
 * messageAction('hello', 3, 1);
 * messageAction('hello', 4, 1);
 * messageAction('hello', 3, 1, 1);
 * messageAction('hello', 3, 1, 1, 1);
 * messageAction('hello', 3, 1, 1, -1);
 * messageAction('hello', 3, 1, 1, 'up');
 * messageAction('hello', 3, 1, 1, 'both');
 * messageAction('hello', 3, 1, 1, 'dash');
 * messageAction('ERROR', 8, 1, 0, 'both_n');
 * messageAction('ERROR', 9, 1, 2, 'dash_n');
 * messageAction('only toast', null, 1);
 * @return {boolean} - whether message level is not warn and error
 **/
function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
    let $_flag = global.$$flag = global.$$flag || {};
    if ($_flag.no_msg_action) {
        return !~[3, 4, 'warn', 'w', 'error', 'e'].indexOf(msg_level);
    }

    let _msg_lv = msg_level;
    if (typeof _msg_lv === 'undefined') {
        _msg_lv = 1;
    }
    if (typeof _msg_lv !== 'number' && typeof msg_level !== 'string') {
        _msg_lv = -1;
    }

    let _msg = msg || '';
    if (_msg_lv.toString().match(/^t(itle)?$/)) {
        _msg = '[ ' + msg + ' ]';
        return messageAction.apply(null, [_msg, 1].concat([].slice.call(arguments, 2)));
    }

    if_toast && toast(_msg);

    let _if_arrow = if_arrow || 0;
    let _if_spl_ln = if_split_line || 0;
    _if_spl_ln = ~if_split_line ? _if_spl_ln === 2 ? 'both' : _if_spl_ln : 'up';
    let _spl_ln_style = 'solid';
    let _saveLnStyle = () => $_flag.last_cnsl_spl_ln_type = _spl_ln_style;
    let _loadLnStyle = () => $_flag.last_cnsl_spl_ln_type;
    let _clearLnStyle = () => delete $_flag.last_cnsl_spl_ln_type;
    let _matchLnStyle = () => _loadLnStyle() === _spl_ln_style;

    if (typeof _if_spl_ln === 'string') {
        if (_if_spl_ln.match(/dash/)) {
            _spl_ln_style = 'dash';
        }
        if (_if_spl_ln.match(/both|up|^2/)) {
            if (!_matchLnStyle()) {
                showSplitLine('', _spl_ln_style);
            }
            if (_if_spl_ln.match(/_n|n_/)) {
                _if_spl_ln = '\n';
            } else if (_if_spl_ln.match(/both|^2/)) {
                _if_spl_ln = 1;
            } else if (_if_spl_ln.match(/up/)) {
                _if_spl_ln = 0;
            }
        }
    }

    _clearLnStyle();

    if (_if_arrow) {
        _msg = '-'.repeat(Math.min(_if_arrow, 10)) + '> ' + _msg;
    }

    let _exit_flag = false;
    let _show_ex_msg_flag = false;

    switch (_msg_lv) {
        case 0:
        case 'verbose':
        case 'v':
            _msg_lv = 0;
            console.verbose(_msg);
            break;
        case 1:
        case 'log':
        case 'l':
            _msg_lv = 1;
            console.log(_msg);
            break;
        case 2:
        case 'i':
        case 'info':
            _msg_lv = 2;
            console.info(_msg);
            break;
        case 3:
        case 'warn':
        case 'w':
            _msg_lv = 3;
            console.warn(_msg);
            break;
        case 4:
        case 'error':
        case 'e':
            _msg_lv = 4;
            console.error(_msg);
            break;
        case 8:
        case 'x':
            _msg_lv = 4;
            console.error(_msg);
            _exit_flag = true;
            break;
        case 9:
        case 't':
            _msg_lv = 4;
            console.error(_msg);
            _show_ex_msg_flag = true;
    }

    if (_if_spl_ln) {
        let _spl_ln_extra = '';
        if (typeof _if_spl_ln === 'string') {
            if (_if_spl_ln.match(/dash/)) {
                _spl_ln_extra = _if_spl_ln.match(/_n|n_/) ? '\n' : '';
            } else {
                _spl_ln_extra = _if_spl_ln;
            }
        }
        if (!_spl_ln_extra.match(/\n/)) {
            _saveLnStyle();
        }
        showSplitLine(_spl_ln_extra, _spl_ln_style);
    }

    if (_show_ex_msg_flag) {
        let _msg = 'forcibly stopped';
        console.error(_msg);
        toast(_msg);
    }
    if (_exit_flag) {
        exit();
    }

    return !~[3, 4].indexOf(_msg_lv);
}

/**
 * Show a split line in console (32 bytes)
 * @global
 * @param {string} [extra]
 * <br>
 *     -- '\n' - a new blank line after split line <br>
 *     -- *OTHER* - unusual use
 * @param {'solid'|'dash'|string} [style='solid']
 * <br>
 *     -- 'solid' - '---------...' - length: 33 <br>
 *     -- 'dash' - '- - - - - ...' - length: 35
 * @example
 * showSplitLine();
 * showSplitLine('\n');
 * showSplitLine('', 'dash');
 * @return {boolean} - always true
 */
function showSplitLine(extra, style) {
    console.log((
        style === 'dash' ? '- '.repeat(18).trim() : '-'.repeat(33)
    ) + (extra || ''));
}

/**
 * @typedef {';all'|';and'|';one'|';or'} waitForAction$condition$logic_flag
 */
/**
 * Wait a period of time until 'condition' is met
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
 * log(waitForAction('文件'));
 * log(waitForAction('文件', 10e3));
 * log(waitForAction('文件', 10e3, 200));
 * @example
 * log(waitForAction('文件'));
 * log(waitForAction(text('文件')));
 * log(waitForAction(() => text('文件').exists()));
 * @example
 * if (waitForAction(() => Date.now() > new Date(2021, 0), 0, 100)) {
 *     toastLog('Welcome to 2021');
 * }
 * @example
 * log(waitForAction([() => text('Settings').exists(), () => text('Exit').exists(), ';or'], 5e3, 80));
 * log(waitForAction([text('Settings'), text('Exit'), ';or'], 5e3, 80)); // same as above
 * log(waitForAction(['Settings', 'Exit', ';or'], 5e3, 80)); // same as above
 * // do not invoke like the way as below, unless you know what this exactly means
 * log(waitForAction([text('Settings').findOnce(), text('Exit').findOnce(), ';or'], 5e3, 80));
 * @return {boolean} - whether 'condition' is met before timed out or not
 */
function waitForAction(condition, timeout_or_times, interval, options) {
    let _par = options || {};
    _par.no_impeded || typeof $$impeded === 'function' && $$impeded(waitForAction.name);

    let $_sel = getSelector();

    if (typeof timeout_or_times !== 'number') {
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
        if (typeof condition === 'function') {
            return condition();
        }
        if (!Array.isArray(condition)) {
            return $_sel.pickup(condition);
        }
        if (condition === undefined || condition === null) {
            return false;
        }

        let _rexA = s => typeof s === 'string' && s.match(/^;(a(ll|nd))$/);
        let _rexO = s => typeof s === 'string' && s.match(/^;(o(r|ne))$/);

        let _arr = condition.slice();

        let _logic = ';all';
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
}

/**
 * Click UiObject or coordinate by click(), press() or UiObject.click().
 * Accessibility service is needed.
 * @global
 * @param {UiSelector$|UiObject$|number[]|AndroidRect$|{x:number,y:number}|OpencvPoint$} o
 * @param {'c'|'click'|'p'|'press'|'w'|'widget'} [strategy='click'] - decide the way of click
 * @param {object|string} [options]
 * @param {number} [options.press_time=1] - only effective for 'press' strategy
 * @param {number} [options.pt$=1] - alias of press_time
 * @param {'disappear'|'disappear_in_place'|function():boolean|null} [options.condition_success=function():true]
 * @param {number} [options.check_time_once=500]
 * @param {number} [options.max_check_times=0] - if condition_success is specified, default will be 3
 * @param {number|number[]|('x'|'y'|number)[]} [options.padding] - eg: ['x',-10]|[-10,0]; ['y',69]|[0,69]|[69]|69
 * @example
 * text('Settings').find().forEach(w => clickAction(w));
 * text('Settings').find().forEach(w => clickAction(w.bounds()));
 * clickAction(text('Settings'), 'widget', {
 *     condition_success: 'disappear_in_place',
 *     max_check_times: 5,
 * });
 * clickAction(text('Settings'), 'press', {
 *     // padding: ['x', +15],
 *     // padding: ['y', -7],
 *     // padding: [+15, -7],
 *     padding: -7,
 * });
 * @return {boolean}
 */
function clickAction(o, strategy, options) {
    let _opt = options || {};
    _opt.no_impeded || typeof $$impeded === 'function' && $$impeded(clickAction.name);

    if (o === undefined || o === null) {
        return false;
    }

    let $_str = o => typeof o === 'string';
    let $_num = o => typeof o === 'number';

    /**
     * @type {'Bounds'|'UiObject'|'UiSelector'|'CoordsArray'|'ObjXY'|'Points'}
     */
    let _type = _checkType(o);
    let _padding = _parsePadding(_opt.padding);
    let _stg = strategy || 'click';
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
        if (waitForAction(_cond_succ, _chk_t_once, 50)) {
            return true;
        }
    }

    return _cond_succ();

    // tool function(s) //

    function _clickOnce() {
        let _x = 0 / 0;
        let _y = 0 / 0;

        if (_type === 'UiSelector') {
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
        } else if (_type === 'UiObject') {
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
        } else if (_type === 'Bounds') {
            if (_stg.match(/^w(idget)?$/)) {
                _stg = 'click';
                messageAction('clickAction()控件策略已改为click', 3);
                messageAction('无法对Rect对象应用widget策略', 3, 0, 1);
            }
            _x = o.centerX();
            _y = o.centerY();
        } else {
            if (_stg.match(/^w(idget)?$/)) {
                _stg = 'click';
                messageAction('clickAction()控件策略已改为click', 3);
                messageAction('无法对坐标组应用widget策略', 3, 0, 1);
            }
            [_x, _y] = Array.isArray(o) ? o : [o.x, o.y];
        }
        if (isNaN(_x) || isNaN(_y)) {
            messageAction('clickAction()内部坐标值无效', 4, 1);
            messageAction('(' + _x + ', ' + _y + ')', 8, 0, 1, 1);
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
            showSplitLine();
            messageAction('不支持的clickAction()的目标参数', 4, 1);
            messageAction('参数类型: ' + typeof f, 4, 0, 1);
            messageAction('参数类值: ' + classof(f), 4, 0, 1);
            messageAction('参数字串: ' + f.toString(), 4, 0, 1);
            showSplitLine();
            exit();
        }
        return _type_f;

        // tool function(s) //

        function _chkJavaO(o) {
            if (classof(o) !== 'JavaObject') {
                return;
            }
            if (o.getClass().getName().match(/Point$/)) {
                return 'Points';
            }
            let string = o.toString();
            if (string.match(/^Rect\(/)) {
                return 'Bounds';
            }
            if (string.match(/UiObject/)) {
                return 'UiObject';
            }
            return 'UiSelector';
        }

        function _chkCoords(arr) {
            if (classof(f) !== 'Array') {
                return;
            }
            if (arr.length !== 2) {
                messageAction('clickAction()坐标参数非预期值: 2', 8, 1, 0, 1);
            }
            if (typeof arr[0] !== 'number' || typeof arr[1] !== 'number') {
                messageAction('clickAction()坐标参数非number', 8, 1, 0, 1);
            }
            return 'CoordsArray';
        }

        function _chkObjXY(o) {
            if (classof(o) === 'Object') {
                if ($_num(o.x) && $_num(o.y)) {
                    return 'ObjXY';
                }
            }
        }
    }

    function _parsePadding(arr) {
        if (!arr) {
            return {x: 0, y: 0};
        }

        let _coords = [];
        if (typeof arr === 'number') {
            _coords = [0, arr];
        } else if (!Array.isArray(arr)) {
            return messageAction('clickAction()坐标偏移参数类型未知', 8, 1, 0, 1);
        }

        let _arr_len = arr.length;
        if (_arr_len === 1) {
            _coords = [0, arr[0]];
        } else if (_arr_len === 2) {
            let [_ele, _val] = arr;
            if (_ele === 'x') {
                _coords = [_val, 0];
            } else if (_ele === 'y') {
                _coords = [0, _val];
            } else {
                _coords = [_ele, _val];
            }
        } else {
            return messageAction('clickAction()坐标偏移参数数组个数不合法', 8, 1, 0, 1);
        }

        let [_x, _y] = _coords.map(n => Number(n));
        if (!isNaN(_x) && !isNaN(_y)) {
            return {x: _x, y: _y};
        }
        messageAction('clickAction()坐标偏移计算值不合法', 8, 1, 0, 1);
    }

    function _checkDisappearance() {
        try {
            if (_type === 'UiSelector') {
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
            if (_type === 'UiObject') {
                let _w_parent = o.parent();
                if (!_w_parent) {
                    return true;
                }
                let _mch = _w_parent.toString().match(/@\w+/);
                return _mch[0].slice(1) !== _widget_parent_id;
            }
        } catch (e) {
            // nothing to do here
        }
        return true;
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
 *     -- 'click'|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- 'press' - press(coord_A, coord_B, 1); <br>
 *     -- 'widget' - text('abc').click();
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
 *     -- ['x', -10]|[-10, 0] - x=x-10; <br>
 *     -- ['y', 69]|[0, 69]|[69]|69 - y=y+69;
 * @return {boolean} - waitForAction(...) && clickAction(...)
 */
function waitForAndClickAction(f, timeout_or_times, interval, click_params) {
    if (classof(f) !== 'JavaObject') {
        messageAction('waitForAndClickAction不支持非JavaObject参数', 8, 1);
    }
    let _par = click_params || {};
    let _intermission = _par.intermission || 200;
    let _strategy = _par.click_strategy;
    if (waitForAction(f, timeout_or_times, interval)) {
        sleep(_intermission);
        return clickAction(f, _strategy, _par);
    }
}

/**
 * Swipe to make a certain specified area, usually fullscreen, contains or overlap the bounds of 'f'
 * @global
 * @param {UiSelector$|ImageWrapper$} f
 * @param {object} [params]
 * @param {number} [params.max_swipe_times=12]
 * @param {number|string} [params.swipe_direction='auto']
 * <br>
 *     -- 0|'l'|'left', 1|'u'|'up', 2|'r'|'right', 3|'d'|'down' - direction to swipe each time <br>
 *     -- 'auto' - if 'f' exists but not in aim area, direction will be auto-set decided by position of 'f', or direction will be 'up'
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
 *     -- aim: [0, 0, 720, 1004], direction: 'up', swipe distance: 200 <br>
 *     -- swipe once - bounds: [0, 1100, 720, 1350] - top is not less than 1004 - continue swiping <br>
 *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004 - swipe will stop <br>
 *     -- example B: condition_meet_sides = 2 <br>
 *     -- aim: [0, 0, 720, 1004], direction: 'up', swipe distance: 200 <br>
 *     -- swipe once - bounds: [0, 1100, 720, 1350] - neither top nor bottom < 1004 - continue swiping <br>
 *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004, but not bottom - swipe will not stop <br>
 *     -- swipe once - bounds: [0, 700, 720, 950] - top < 1004, and so is bottom - swipe will stop
 * @returns {boolean} - if timed out or max swipe times reached
 */
function swipeAndShow(f, params) {
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === 'function' && $$impeded(swipeAndShow.name);

    let _swp_itv = _par.swipe_interval || 150;
    let _swp_max = _par.max_swipe_times || 12;
    let _swp_time = _par.swipe_time || 150;
    let _cond_meet_sides = parseInt(_par.condition_meet_sides);
    if (_cond_meet_sides !== 1 || _cond_meet_sides !== 2) {
        _cond_meet_sides = 1;
    }

    if (!global.WIDTH || !global.HEIGHT) {
        let _data = require('./ext-device').getDisplay();
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
        if (typeof _swp_drxn === 'string' && _swp_drxn !== 'auto') {
            if (_swp_drxn.match(/$[Lf](eft)?^/)) {
                return 'left';
            }
            if (_swp_drxn.match(/$[Rr](ight)?^/)) {
                return 'right';
            }
            if (_swp_drxn.match(/$[Dd](own)?^/)) {
                return 'down';
            }
            return 'up';
        }
        if (_isImageType(f)) {
            return 'up';
        }
        let _widget = f.findOnce();
        if (!_widget) {
            return 'up';
        }
        // auto mode
        let _bnd = _widget.bounds();
        let [_bl, _bt] = [_bnd.left, _bnd.top];
        let [_br, _bb] = [_bnd.right, _bnd.bottom];
        if (_bb >= _aim_area.b || _bt >= _aim_area.b) {
            return 'up';
        }
        if (_bt <= _aim_area.t || _bb <= _aim_area.t) {
            return 'down';
        }
        if (_br >= _aim_area.r || _bl >= _aim_area.r) {
            return 'left';
        }
        if (_bl <= _aim_area.l || _br <= _aim_area.l) {
            return 'right';
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
            if (Object.prototype.toString.call(area).slice(8, -1) !== 'Array') return;
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
            if (_swp_drxn === 'down') {
                return swipe(_ct.x, _ct.y, _cb.x, _cb.y, _swp_time);
            }
            if (_swp_drxn === 'left') {
                return swipe(_cr.x, _cr.y, _cl.x, _cl.y, _swp_time);
            }
            if (_swp_drxn === 'right') {
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
                if (_swp_drxn === 'up') {
                    return _top < _aim_area.b;
                }
                if (_swp_drxn === 'down') {
                    return _bottom > _aim_area.t;
                }
                if (_swp_drxn === 'left') {
                    return _left < _aim_area.r;
                }
                if (_swp_drxn === 'right') {
                    return _right < _aim_area.l;
                }
            } else {
                if (_swp_drxn === 'up') {
                    return _bottom < _aim_area.b;
                }
                if (_swp_drxn === 'down') {
                    return _top > _aim_area.t;
                }
                if (_swp_drxn === 'left') {
                    return _right < _aim_area.r;
                }
                if (_swp_drxn === 'right') {
                    return _left < _aim_area.l;
                }
            }
        }

        function _chk_img() {
            if (typeof imagesx === 'object') {
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
}

/**
 * Swipe to make a certain specified area, then click it
 * @global
 * -- This is a combination function which means independent use is not recommended
 * @param {UiSelector$|ImageWrapper$} f
 * @param {object} [swipe_params]
 * @param {number} [swipe_params.max_swipe_times=12]
 * @param {number|string} [swipe_params.swipe_direction='auto']
 * <br>
 *     -- 0|'l'|'left', 1|'u'|'up', 2|'r'|'right', 3|'d'|'down' - direction to swipe each time <br>
 *     -- 'auto' - if 'f' exists but not in aim area, direction will be auto-set decided by position of 'f', or direction will be 'up'
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
 *     -- aim: [0, 0, 720, 1004], direction: 'up', swipe distance: 200 <br>
 *     -- swipe once - bounds: [0, 1100, 720, 1350] - top is not less than 1004 - continue swiping <br>
 *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004 - swipe will stop <br>
 *     -- example B: condition_meet_sides = 2 <br>
 *     -- aim: [0, 0, 720, 1004], direction: 'up', swipe distance: 200 <br>
 *     -- swipe once - bounds: [0, 1100, 720, 1350] - neither top nor bottom < 1004 - continue swiping <br>
 *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004, but not bottom - swipe will not stop <br>
 *     -- swipe once - bounds: [0, 700, 720, 950] - top < 1004, and so is bottom - swipe will stop
 * @param {object} [click_params]
 * @param {number} [click_params.intermission=300]
 * @param {string} [click_params.click_strategy] - decide the way of click
 * <br>
 *     -- 'click'|*DEFAULT* - click(coord_A, coord_B); <br>
 *     -- 'press' - press(coord_A, coord_B, 1); <br>
 *     -- 'widget' - text('abc').click();
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
 *     -- ['x', -10]|[-10, 0] - x=x-10; <br>
 *     -- ['y', 69]|[0, 69]|[69]|69 - y=y+69;
 */
function swipeAndShowAndClickAction(f, swipe_params, click_params) {
    let _res_swipe = swipeAndShow(f, swipe_params);
    if (_res_swipe) {
        return clickAction(
            typeof _res_swipe === 'boolean' ? f : _res_swipe,
            click_params && click_params.click_strategy, click_params
        );
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
 * keycode('home');
 * keycode('KEYCODE_HOME');
 * keycode(3);
 * // back key by shell and without error message
 * keycode('back', {no_err_msg: true, force_shell: true});
 * keycode(4, {no_err_msg: true, force_shell: true});
 * // power key
 * keycode(26, {no_err_msg: true});
 * keycode('KEYCODE_POWER', {no_err_msg: true});
 * // recent key
 * keycode('recent_apps');
 * keycode('recent');
 * keycode('KEYCODE_APP_SWITCH');
 * @return {boolean}
 */
function keycode(code, params) {
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === 'function' && $$impeded(keycode.name);

    if (_par.force_shell) {
        return keyEvent(code);
    }
    let _tidy_code = code.toString().toLowerCase()
        .replace(/^keycode_|s$/, '')
        .replace(/_([a-z])/g, ($0, $1) => $1.toUpperCase());
    let _1st_res = simulateKey();
    return _par.double ? simulateKey() : _1st_res;

    // tool function(s) //

    function keyEvent(keycode) {
        let _checker = {'26, power': checkPower};
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
            let isScreenOn = () => {
                /** @type {android.os.PowerManager} */
                let _pow_mgr = context.getSystemService(
                    android.content.Context.POWER_SERVICE
                );
                return (_pow_mgr.isInteractive || _pow_mgr.isScreenOn).call(_pow_mgr);
            };
            let isScreenOff = () => !isScreenOn();
            if (isScreenOff()) {
                let max = 10;

                do device.wakeUp();
                while (!waitForAction(isScreenOn, 500) && max--);

                return max >= 0;
            }
            if (!shellInputKeyEvent(keycode)) {
                return false;
            }
            return waitForAction(isScreenOff, 2.4e3);
        }

        function shellInputKeyEvent(keycode) {
            try {
                return !shell('input keyevent ' + keycode, true).code;
            } catch (e) {
                if (!_par.no_err_msg) {
                    messageAction('按键模拟失败', 0);
                    messageAction('键值: ' + keycode, 0, 0, 1);
                }
                return false;
            }
        }
    }

    function simulateKey() {
        switch (_tidy_code) {
            case '3':
            case 'home':
                return !!~home();
            case '4':
            case 'back':
                return !!~back();
            case 'appSwitch':
            case '187':
            case 'recent':
            case 'recentApp':
                return !!~recents();
            case 'powerDialog':
            case 'powerMenu':
                return !!~powerDialog();
            case 'notification':
                return !!~notifications();
            case 'quickSetting':
                return !!~quickSettings();
            case 'splitScreen':
                return !!~splitScreen();
            default:
                return keyEvent(code);
        }
    }
}

/**
 * Print a message in console with verbose mode for debugging
 * @global
 * @param msg {'__split_line__'|'__split_line__dash__'|string|string[]} - message will be formatted with prefix '>> '
 * <br>
 *     - 'sum is much smaller' - '>> sum is much smaller' <br>
 *     - '>sum is much smaller' - '>>> sum is much smaller'
 * @param {'up'|'up_2'|'up_3'|'up_4'|'Up'|'Up_2'|'Up_3'|'Up_4'|'both'|'both_2'|'both_3'|'both_4'|'both_dash'|'both_dash_2'|'both_dash_3'|'both_dash_4'|'up_dash'|'Up_both_dash'|string|number} [msg_level=0] - 'Up': black up line; 'up': grey up line; 'Up_dash': not supported
 * @param {boolean} [forcible_flag=undefined] - forcibly enabled with truthy; forcibly disabled with false (not falsy)
 */
function debugInfo(msg, msg_level, forcible_flag) {
    let $_flag = global.$$flag = global.$$flag || {};

    let _glob_fg = $_flag.debug_info_avail;
    let _forc_fg = forcible_flag;
    if (!_glob_fg && !_forc_fg) {
        return;
    }
    if (_glob_fg === false || _forc_fg === false) {
        return;
    }

    let _msg_lv_str = (msg_level || '').toString();
    let _msg_lv_num = +(_msg_lv_str.match(/\d/) || [0])[0];
    if (_msg_lv_str.match(/Up/)) {
        showSplitLine();
    }
    if (_msg_lv_str.match(/both|up/)) {
        let _dash = _msg_lv_str.match(/dash/) ? 'dash' : '';
        debugInfo('__split_line__' + _dash, '', _forc_fg);
    }

    if (typeof msg === 'string' && msg.match(/^__split_line_/)) {
        msg = _getLineStr(msg);
    }
    if (classof(msg) === 'Array') {
        msg.forEach(m => debugInfo(m, _msg_lv_num, _forc_fg));
    } else {
        messageAction((msg || '').replace(/^(>*)( *)/, '>>' + '$1 '), _msg_lv_num);
    }

    if (_msg_lv_str.match('both')) {
        let _dash = _msg_lv_str.match(/dash/) ? 'dash' : '';
        debugInfo('__split_line__' + _dash, '', _forc_fg);
    }

    // tool function(s) //

    function _getLineStr(msg) {
        return msg.match(/dash/) ? '- '.repeat(18).trim() : '-'.repeat(33);
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

    if (!_isTypeMatch(_type_a, _type_b, 'object')) {
        return obj_a === obj_b;
    }
    if (_isTypeMatch(_class_a, _class_b, 'Null')) {
        return true;
    }

    if (_class_a === 'Array') {
        if (_class_b === 'Array') {
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

    if (_class_a === 'Object') {
        if (_class_b === 'Object') {
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
    if (classOfObj === 'Null' || classOfObj !== 'Object' && classOfObj !== 'Array') return obj;
    let new_obj = classOfObj === 'Array' ? [] : {};
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            new_obj[i] = classOfObj === 'Array' ? obj[i] : deepCloneObject(obj[i]);
        }
    }
    return new_obj;
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
    let _aim_msg = aim_msg || '.*';
    let _aim_pkg = aim_app_pkg || currentPackage();
    let _amt = aim_amount || 1;
    let _got_msg = [];

    threads.start(function () {
        events.observeToast();
        events.onToast((o) => {
            return o.getPackageName() === _aim_pkg
                && o.getText().match(_aim_msg)
                && _got_msg.push(o.getText());
        });
    });

    waitForAction(() => _got_msg.length >= _amt, _tt, 50);

    // events.recycle() will make listeners (like key listeners) invalid
    // events.recycle();

    // remove toast listeners to make it available for next-time invocation
    // otherwise, events will exceed the max listeners limit with default 10
    events.removeAllListeners('toast');

    return _got_msg;
}

/**
 * Returns a UiSelector with additional function(s)
 * @global
 * @param {object} [options]
 * @param {boolean} [options.debug_info_flag]
 */
function getSelector(options) {
    let _opt = options || {};
    let _sel = Object.create(selector());

    let _sel_ext = {
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
         *     'w'|'widget'|'w_collection'|'widget_collection'|'wcollection'|'widgetcollection'|'w_c'|'widget_c'|'wc'|'widgetc'|'widgets'|'wids'|'s'|'sel'|'selector'|'e'|'exist'|'exists'|'t'|'txt'|'ss'|'sels'|'selectors'|'s_s'|'sel_s'|'selector_s'|'sstr'|'selstr'|'selectorstr'|'s_str'|'sel_str'|'selector_str'|'sstring'|'selstring'|'selectorstring'|'s_string'|'sel_string'|'selector_string'|UiObjectProperties|string
         * } UiSelector$pickup$res_type
         */
        /**
         * Returns a selector (UiSelector) or widget (UiObject) or some attribute values
         * If no widgets (UiObject) were found, returns null or '' or false
         * If memory keyword was found in this session memory, use a memorized selector directly
         * @function UiSelector$.prototype.pickup
         * @param {UiSelector$pickup$sel_body} sel_body
         * <br>
         *     -- array mode 1: [selector_body: any, compass: string]
         *     -- array mode 2: [selector_body: any, additional_sel: array|object, compass: string]
         * @param {string} [mem_sltr_kw] - memory keyword
         * @param {UiSelector$pickup$res_type} [res_type='widget'] -
         * <br>
         *     -- 'txt': available text()/desc() value or empty string
         *     -- 'clickable': boolean value of widget.clickable()
         *     -- 'wc': widget collection which is traversable
         * @param {object} [par]
         * @param {'desc'|'text'} [par.selector_prefer='desc'] - unique selector you prefer to check first
         * @param {boolean} [par.debug_info_flag]
         * @example
         * // text/desc/id('abc').findOnce();
         * pickup('abc'); // UiObject
         * pickup('abc', 'w'); // same as above
         * pickup('abc', 'w', 'my_alphabet'); // with memory keyword
         *
         * // text/desc/id('abc');
         * pickup('abc', 'sel', 'my_alphabet'); // UiSelector
         *
         * // text('abc').findOnce()
         * pickup(text('abc'), 'w', 'my_alphabet'); // with UiObject selector body
         *
         * // get the string of selector
         * pickup(/^abc.+z/, 'sel_str'); // returns 'id'|'text'|'desc'...
         *
         * // text/desc/id('morning').exists()
         * pickup('morning', 'exists'); // boolean
         *
         * // text/desc/id('morning').findOnce().parent().parent().child(3).id()
         * pickup(['morning', 'p2c3'], 'id');
         *
         * // text/desc/id('hello').findOnce().parent().child(%childCount% - 3)['text'|'desc']
         * pickup(['hello', 's-3'], 'txt');
         *
         * // text/desc/id('hello').findOnce().parent().child(%indexInParent% + 2)['text'|'desc']
         * pickup(['hello', 's>2'], 'txt');
         *
         * // desc('a').className(...).boundsInside(...).findOnce().parent().child(%indexInParent% + 1).clickable()
         * pickup([desc('a').className('Button'), {boundsInside: [0, 0, 720, 1000]}, 's>1'], 'clickable', 'back_btn');
         *
         * // className('Button').findOnce()
         * pickup({className: 'Button'});
         *
         * // w = className('Button').findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
         * // w.parent().child(0);
         * pickup([{className: 'Button'}, 'p5c1>0>0>0>1s0']);
         *
         * // w = className('Button').findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
         * // w.parent(w.indexInParent() - 1);
         * pickup([{className: 'Button'}, 'p5c1>0>0>0>1s<1']);
         *
         * // w = className('Button').findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
         * // w.parent().child(w.parent().childCount() - 1);
         * pickup([{className: 'Button'}, 'p5c1>0>0>0>1s-1']);
         * @returns {UiSelector$pickup$return_value}
         */
        pickup(sel_body, res_type, mem_sltr_kw, par) {
            let _sel_body = classof(sel_body) === 'Array' ? sel_body.slice() : [sel_body];
            let _params = Object.assign({}, _opt, par);
            let _res_type = (res_type || '').toString();

            if (!_res_type || _res_type.match(/^w(idget)?$/)) {
                _res_type = 'widget';
            } else if (_res_type.match(/^(w(idget)?_?c(ollection)?|wid(get)?s)$/)) {
                _res_type = 'widgets';
            } else if (_res_type.match(/^s(el(ector)?)?$/)) {
                _res_type = 'selector';
            } else if (_res_type.match(/^e(xist(s)?)?$/)) {
                _res_type = 'exists';
            } else if (_res_type.match(/^t(xt)?$/)) {
                _res_type = 'txt';
            } else if (_res_type.match(/^s(el(ector)?)?(_?s)(tr(ing)?)?$/)) {
                _res_type = 'selector_string';
            }

            if (typeof _sel_body[1] === 'string') {
                // take it as 'compass' variety
                _sel_body.splice(1, 0, '');
            }

            let [_body, _addi_sel, _compass] = _sel_body;

            let _sltr = _getSelector(_addi_sel);
            /** @type {UiObject$|null} */
            let _w = null;
            let _wc = [];
            if (_sltr && _sltr.toString().match(/UiObject/)) {
                _w = _sltr;
                if (_res_type === 'widgets') {
                    _wc = [_sltr];
                }
                _sltr = null;
            } else {
                _w = _sltr ? _sltr.findOnce() : null;
                if (_res_type === 'widgets') {
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
                    return _sltr ? _sltr.toString().match(/[a-z]+/)[0] : '';
                },
                get txt() {
                    let _text = _w && _w.text() || '';
                    let _desc = _w && _w.desc() || '';
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
                let _mem_key = '_$_mem_sltr_' + mem_sltr_kw;
                if (mem_sltr_kw) {
                    let _mem_sltr = global[_mem_key];
                    if (_mem_sltr) {
                        return _mem_sltr;
                    }
                }
                let _sltr = _selGenerator();
                if (mem_sltr_kw && _sltr) {
                    global[_mem_key] = _sltr;
                }
                return _sltr;

                // tool function(s) //

                function _selGenerator() {
                    let _prefer = _params.selector_prefer;
                    let _body_class = classof(_body);
                    let _sel_keys_abbr = {
                        bi$: 'boundsInside',
                        c$: 'clickable',
                        cn$: 'className',
                    };

                    if (_body_class === 'JavaObject') {
                        if (_body.toString().match(/UiObject/)) {
                            addition && debugInfo('UiObject无法使用额外选择器', 3);
                            return _body;
                        }
                        return _chkSels(_body);
                    }

                    if (typeof _body === 'string') {
                        return _prefer === 'text'
                            ? _chkSels(text(_body), desc(_body), id(_body))
                            : _chkSels(desc(_body), text(_body), id(_body));
                    }

                    if (_body_class === 'RegExp') {
                        return _prefer === 'text'
                            ? _chkSels(textMatches(_body), descMatches(_body), idMatches(_body))
                            : _chkSels(descMatches(_body), textMatches(_body), idMatches(_body));
                    }

                    if (_body_class === 'Object') {
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
                            if (classof(addition) === 'Array') {
                                let _o = {};
                                _o[addition[0]] = addition[1];
                                addition = _o;
                            }
                            if (classof(addition) === 'Object') {
                                let _keys = Object.keys(addition);
                                for (let i = 0, l = _keys.length; i < l; i += 1) {
                                    let _k = _keys[i];
                                    let _sel_k = _k in _sel_keys_abbr ? _sel_keys_abbr[_k] : _k;
                                    if (!sel[_sel_k]) {
                                        debugInfo(['无效的additional_selector属性值:', _sel_k], 3);
                                        return null;
                                    }
                                    let _arg = addition[_k];
                                    _arg = Array.isArray(_arg) ? _arg : [_arg];
                                    try {
                                        sel = sel[_sel_k].apply(sel, _arg);
                                    } catch (e) {
                                        debugInfo(['无效的additional_selector选择器:', _sel_k], 3);
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
                let _w_o = classof(w_info) === 'Array' ? w_info.slice() : [w_info];
                let _w = _w_o[0];
                let _w_class = classof(_w);
                let _w_str = (_w || '').toString();

                if (typeof _w === 'undefined') {
                    debugInfo('relativeWidget的widget参数为Undefined');
                    return null;
                }
                if (_w === null) {
                    return null;
                }
                if (_w_str.match(/^Rect\(/)) {
                    return null;
                }
                if (_w_class === 'JavaObject') {
                    if (!_w_str.match(/UiObject/)) {
                        _w = _w.findOnce();
                        if (!_w) {
                            return null;
                        }
                    }
                } else {
                    debugInfo('未知的relativeWidget的widget参数', 3);
                    return null;
                }

                let _compass = _w_o[1];
                if (!_compass) {
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
                                if (!_w) {
                                    return null;
                                }
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
                        if (~String.prototype.search.call(_str, '>')) {
                            _idx += _offset;
                        } else if (~String.prototype.search.call(_str, '<')) {
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

                    throw Error('无法解析剩余罗盘参数: ' + _compass);
                }

                return _w || null;
            }
        },
        /**
         * @param {string} key
         * @param {UiSelector$pickup$sel_body|(function(string):UiSelector$pickup$return_value)} sel_body
         * @param {string} [mem]
         * @example
         * $$sel.add('list', className('ListView'));
         *  // recommended
         * console.log($$sel.get('list', 'bounds'));
         * // NullPointerException may occur
         * console.log($$sel.get('list').bounds());
         * // traditional way, and NullPointerException may occur
         * console.log(className('ListView').findOnce().bounds());
         * @returns {UiSelector$}
         */
        add(key, sel_body, mem) {
            this._sel_body_pool[key] = typeof sel_body === 'function'
                ? type => sel_body(type)
                : type => this.pickup(sel_body, type, mem || key);
            return _sel; // to make method chaining possible
        },
        /**
         * @param {string} key
         * @param {UiSelector$pickup$res_type|'cache'} [type]
         * @example
         * $$sel.add('list', className('ListView'));
         *  // recommended
         * console.log($$sel.get('list', 'bounds'));
         * // NullPointerException may occur
         * console.log($$sel.get('list').bounds());
         * // traditional way, and NullPointerException may occur
         * console.log(className('ListView').findOnce().bounds());
         * @throws {Error} `sel key '${key}' not set in pool`
         * @returns {UiSelector$pickup$return_value|null}
         */
        get(key, type) {
            if (!(key in this._sel_body_pool)) {
                throw Error('Sel key \'' + key + '\' not set in pool');
            }
            let _picker = this._sel_body_pool[key];
            return !_picker ? null : type === 'cache'
                ? (this._cache_pool[key] = _picker('w'))
                : _picker(type);
        },
        getAndCache(key) {
            // only 'widget' type can be returned
            return this.get(key, 'cache');
        },
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

    return Object.assign(_sel, _sel_ext);
}

/**
 * Returns a new string with a certain mark surrounded
 * @global
 * @param target {*} - will be converted to String format
 * @param {*} [mark_left='''] - will be converted to String format
 * @param {*} [mark_right=mark_left] - will be converted to String format
 * @example
 * surroundedBy('ABC') // 'ABC'
 * surroundedBy('ABC', '#') // '#ABC#'
 * surroundedBy([1, 2].join('+'), '{', '}') // {1+2}
 * @returns {string}
 */
function surroundWith(target, mark_left, mark_right) {
    if (typeof target === 'undefined' || target === null) return '';
    target = target.toString();
    mark_left = (mark_left || '"').toString();
    mark_right = (mark_right || mark_left).toString();
    return mark_left + target.toString() + mark_right;
}

/**
 * Record a timestamp then get the time gap by a certain keyword
 * @global
 * @param keyword {string}
 * @param {'L'|'l'|'Load'|'load'|'S'|'s'|'Save'|'save'} [operation]
 * @param {number|'auto'} [divisor=1] - 'auto' for picking up a result intelligently
 * @param {array|number} [fixed] - array: max decimal places (last place won't be 0)
 * @param {string} [suffix=''|'$$ch'] - '$$en' or '$$ch' is available when %divisor% is set 'auto'
 * @param {number|Date} [override_timestamp]
 * @returns {number|string} - timestamp or time gap with/without a certain format or suffix string
 * @example
 * // result eg: 1565080123796
 * timeRecorder('running', 'save');
 * timeRecorder('running', 'load');
 * //
 * // result eg: '12.40s'
 * timeRecorder('collect', 'save');
 * timeRecorder('collect', 'load', 1e3, 2, 's');
 * //
 * // result eg: 18 hours'
 * timeRecorder('waiting', 'save');
 * timeRecorder('waiting', 'load', 3.6 * Math.pow(10, 6), 0, ' hours');
 * //
 * // result eg: 10.331 (not '10.3310000')
 * timeRecorder('try_peeking');
 * timeRecorder('try_peeking', 'time_gap', 1e3, [7]);
 * //
 * // result eg: '7h 8.16m'
 * timeRecorder('go_to_bed');
 * timeRecorder('go_to_bed', 'L', 'auto', null, '$$en');
 * //
 * // result eg: '7分钟8.16秒' (meaning 7m 8.16s)
 * timeRecorder('study');
 * timeRecorder('study', 'L', 'auto');
 */
function timeRecorder(keyword, operation, divisor, fixed, suffix, override_timestamp) {
    global['_$_ts_rec'] = global['_$_ts_rec'] || {};
    let records = global['_$_ts_rec'];
    if (!operation || operation.toString().match(/^[Ss](ave)?$/)) {
        return records[keyword] = Date.now();
    }

    divisor = divisor || 1;

    let forcible_fixed_num_flag = false;
    if (typeof fixed === 'object' /* array */) forcible_fixed_num_flag = true;

    let prefix = '';
    let result = +(override_timestamp || new Date()) - records[keyword]; // number

    if (divisor !== 'auto') {
        suffix = suffix || '';
        result = result / divisor;
    } else {
        suffix = suffix || '$$ch';
        fixed = fixed || [2];
        forcible_fixed_num_flag = true;

        let getSuffix = (unit_str) => ({
            ms$$ch: '毫秒', ms$$en: 'ms ',
            sec$$ch: '秒', sec$$en: 's ',
            min$$ch: '分钟', min$$en: 'm ',
            hour$$ch: '小时', hour$$en: 'h ',
            day$$ch: '天', day$$en: 'd ',
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
            prefix += _d + getSuffix('day');
            result %= base_unit.day;
            let _h = ~~(result / base_unit.hour);
            if (_h) prefix += _h + getSuffix('hour');
            result %= base_unit.hour;
            let _min = ~~(result / base_unit.min);
            if (_min) {
                result /= base_unit.min;
                suffix = getSuffix('min');
            } else {
                result %= base_unit.min;
                result /= base_unit.sec;
                suffix = getSuffix('sec');
            }
        } else if (result >= base_unit.hour) {
            let _hr = ~~(result / base_unit.hour);
            prefix += _hr + getSuffix('hour');
            result %= base_unit.hour;
            let _min = ~~(result / base_unit.min);
            if (_min) {
                result /= base_unit.min;
                suffix = getSuffix('min');
            } else {
                result %= base_unit.min;
                result /= base_unit.sec;
                suffix = getSuffix('sec');
            }
        } else if (result >= base_unit.min) {
            let _min = ~~(result / base_unit.min);
            prefix += _min + getSuffix('min');
            result %= base_unit.min;
            result /= base_unit.sec;
            suffix = getSuffix('sec');
        } else if (result >= base_unit.sec) {
            result /= base_unit.sec;
            suffix = getSuffix('sec');
        } else {
            result /= base_unit.ms; // yes, i have OCD [:wink:]
            suffix = getSuffix('ms');
        }
    }

    if (typeof fixed !== 'undefined' && fixed !== null) {
        result = result.toFixed(+fixed);  // string
    }

    if (forcible_fixed_num_flag) result = +result;
    suffix = suffix.toString().replace(/ *$/g, '');

    let _res;
    if (!prefix) {
        _res = result + suffix;
    } else {
        _res = prefix + (result ? result + suffix : '');
    }
    return _res === 'NaN' ? NaN : _res;
}

/**
 * Function for a series of ordered click actions
 * @global
 * @param {Array} pipeline - last item condition: null for self-existence; undefined for self-disappearance
 * @param {Object} [options]
 * @param {string} [options.name] - pipeline name
 * @param {number} [options.interval=0]
 * @param {number} [options.max_try_times=5]
 * @param {string} [options.default_strategy='click']
 * @param {boolean} [options.debug_info_flag]
 * @returns {boolean}
 */
function clickActionsPipeline(pipeline, options) {
    let _opt = options || {};
    let _def_stg = _opt.default_strategy || 'click';
    let _itv = +_opt.interval || 0;
    let _max = +_opt.max_try_times;
    _max = isNaN(_max) ? 5 : _max;
    let _max_bak = _max;

    let $_sel = getSelector();

    let _ppl_name = _opt.name ? surroundWith(_opt.name) : '';

    let _res = pipeline
        .filter(value => typeof value !== 'undefined')
        .map((value) => {
            let _v = Array.isArray(value) ? value : [value];
            if (typeof _v[1] === 'function' || _v[1] === null) {
                _v.splice(1, 0, null);
            }
            _v[1] = _v[1] || _def_stg;
            return _v;
        })
        .map((value, idx, arr) => {
            if (value[2] === undefined) {
                value[2] = function () {
                    let _idx = arr[idx + 1] ? idx + 1 : idx;
                    return $_sel.pickup(arr[_idx][0]);
                };
            }
            if (typeof value[2] === 'function') {
                let _fx = value[2].bind(null);
                value[2] = () => _fx(value[0]);
            }
            return value;
        })
        .every((pipe) => {
            _max = _max_bak;
            let [_sel_body, _stg, _cond] = pipe;
            let _w = $_sel.pickup(_sel_body);
            do {
                _cond !== null && clickAction(_w, _stg);
                sleep(_itv);
            } while (_max-- > 0 && !waitForAction(_cond === null ? _w : _cond, 1.5e3));

            if (_max >= 0) {
                return true;
            }
            messageAction(_ppl_name + '管道破裂', 3, 1, 0, 'up_dash');
            messageAction(surroundWith(_sel_body), 3, 0, 1, 'dash');
        });

    _res && debugInfo(_ppl_name + '管道完工');
    return _res;
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
    if (typeof timeFlag === 'object') {
        return parseInt(Array(7).join(' ').split(' ')
            .map((value, idx) => ~timeFlag.indexOf(idx.toString()) ? 1 : 0)
            .reverse().join(''), 2) || 0;
    } else if (!isNaN(+timeFlag)) {
        let info = (+timeFlag).toString(2).split('').reverse().join('');
        return Array(7).join(' ').split(' ')
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
 * // @see 'mod-monster-func.js'
 * let sel = getSelector();
 * // [[], [], []] -- 3 groups of data
 * console.log(baiduOcr(sel.pickup(/\xa0/, 'widgets'), {
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

    if (typeof imagesx === 'object') {
        imagesx.permit();
    } else if (!global._$_request_screen_capture) {
        images.requestScreenCapture();
        global._$_request_screen_capture = true;
    }

    let _capt = _par.capt_img || images.captureScreen();

    let _msg = '使用baiduOcr获取数据';
    debugInfo(_msg);
    _par.no_toast_msg_flag || toast(_msg);

    let _token = '';
    let _max_token = 10;
    let _thd_token = threads.start(function () {
        while (_max_token--) {
            try {
                _token = http.get(
                    'https://aip.baidubce.com/oauth/2.0/token' +
                    '?grant_type=client_credentials' +
                    '&client_id=YIKKfQbdpYRRYtqqTPnZ5bCE' +
                    '&client_secret=hBxFiPhOCn6G9GH0sHoL0kTwfrCtndDj'
                ).body.json()['access_token'];
                debugInfo('access_token准备完毕');
                break;
            } catch (e) {
                sleep(200);
            }
        }
    });
    _thd_token.join(_tt);

    let _lv = +!_par.no_toast_msg_flag;
    let _e = s => messageAction(s, 3, _lv, 0, 'both_dash');
    if (_max_token < 0) {
        _e('baiduOcr获取access_token失败');
        return [];
    }
    if (_thd_token.isAlive()) {
        _e('baiduOcr获取access_token超时');
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
            let _suffix = _max_b > 1 ? ' [' + _cur + '] ' : '';
            debugInfo('stitched image' + _suffix + '准备完毕');

            try {
                let _words = JSON.parse(http.post('https://aip.baidubce.com/' +
                    'rest/2.0/ocr/v1/general_basic?access_token=' + _token, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    image: images.toBase64(_img),
                    image_type: 'BASE64',
                }).body.string())['words_result'];
                if (_words) {
                    debugInfo('数据' + _suffix + '获取成功');
                    _res.push(_words.map(val => val['words']));
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

                let _msg = 'baiduOcr获取数据超时';
                let _toast = +!_par.no_toast_msg_flag;
                messageAction(_msg, 3, _toast, 0, 'up_dash');

                if (_res.length) {
                    messageAction('已获取的数据可能不完整', 3);
                }
                return showSplitLine('', 'dash');
            }
            sleep(500);
        }
    });

    while (1) {
        if (_allDead()) {
            if (!_par.no_toast_msg_flag && _res.length) {
                toast('baiduOcr获取数据完毕');
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
            if (type === 'UiObject') {
                return _widgetToImage(img);
            }
            if (type === 'UiObjectCollection') {
                return _widgetsToImage(img);
            }
            return img;
        }).filter(img => !!img);

        return _stitchImg(imgs);

        // tool function(s) //

        function _getType(o) {
            let matched = o.toString().match(/\w+(?=@)/);
            return matched ? matched[0] : '';
        }

        function _widgetToImage(widget) {
            try {
                // FIXME Nov 11, 2019
                // there is a strong possibility that `widget.bounds()` would throw an exception
                // like 'Cannot find function bounds in object xxx.xxx.xxx.UiObject@abcde'
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
            let _isImgWrap = o => _getType(o) === 'ImageWrapper';
            if (_isImgWrap(imgs) && !Array.isArray(imgs)) {
                return imgs;
            }
            if (imgs.length === 1) {
                return imgs[0];
            }
            let _stitched = imgs[0];
            imgs.forEach((img, idx) => {
                if (idx) {
                    _stitched = images.concat(_stitched, img, 'BOTTOM');
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
}

/**
 * Replacement of setInterval() for avoiding its 'flaws'
 * @global
 * @param {function():void} func
 * @param {number} [interval=200]
 * @param {number|function():boolean} [timeout] -
 * undefined: no timeout limitation;
 * number: stop when timed out;
 * function: stop when function() returns true
 * @example
 * // print 'hello' every 1 second for 5 (or 4 sometimes) times
 * setIntervalBySetTimeout(() => {
 *     console.log('hello');
 * }, 1e3, 5e3);
 * @see https://dev.to/akanksha_9560/why-not-to-use-setinterval--2na9
 */
function setIntervalBySetTimeout(func, interval, timeout) {
    let _itv = interval || 200;
    let _init_ts = Date.now();
    let _in_case_ts = _init_ts + 10 * 60e3; // 10 minutes at most
    let _inCase = () => Date.now() < _in_case_ts;
    let _timeoutReached = typeof timeout === 'function'
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
 * @param {'Undefined'|'Null'|'Number'|'String'|'Boolean'|'Symbol'|'Object'|'Array'|'Function'|'RegExp'|'Date'|'Promise'|'JavaObject'|'Error'|'JSON'|'Math'|string} [compare] - note that 'JSON'|'Promise' may be 'Object' as they're internal modules for environments like Node.js, browsers (maybe not for all) and so forth, but external modules for Rhino-based environments like Auto.js.
 * @returns {boolean|string}
 */
function classof(source, compare) {
    let _s = Object.prototype.toString.call(source).slice(8, -1);
    return compare ? _s.toUpperCase() === compare.toUpperCase() : _s;
}

/**
 * Wait until a generator, which generates variable values, is stable.
 * And returns the final stable value.
 * 1. Wait until generator returns different values (not longer than generator_timeout)
 * 2. Wait until changing value is stable (not longer than stable_threshold each time)
 * @param {function} num_generator
 * @param {*} [init_value=NaN]
 * @param {number} [generator_timeout=3000]
 * @param {number} [stable_threshold=500]
 * @example
 * let a = ['John', 'Zach', 'Cole', 'Eric'];
 * toastLog('Rolling the dice...');
 * toastLog(a[stabilizer(() => Math.floor(Math.random() * a.length))] + ' is the lucky one');
 * @returns {number}
 */
function stabilizer(num_generator, init_value, generator_timeout, stable_threshold) {
    let _init = init_value === undefined ? NaN : Number(init_value);
    let _cond_generator = () => {
        let _num = Number(num_generator());
        _init = isNaN(_init) ? _num : _init;
        return _init !== _num;
    };

    if (!waitForAction(_cond_generator, generator_timeout || 3e3)) {
        return NaN;
    }

    let _old = _init, _tmp = NaN;
    let _cond_stable = () => _old !== (_tmp = num_generator());
    let _limit = 60e3; // 1 min
    let _start_ts = Date.now();

    while (waitForAction(_cond_stable, stable_threshold || 500)) {
        _old = _tmp;
        if (Date.now() - _start_ts > _limit) {
            throw Error('stabilizer() has reached max limitation: ' + _limit + 'ms');
        }
    }

    return _old;
}