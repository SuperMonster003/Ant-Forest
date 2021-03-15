/**
 * Module for unlocking device automatically
 * @example
 * require('./mod-unlock').unlock();
 * // forcibly enable debugInfo() for showing debug logs in console
 * require('./mod-unlock').unlock(true);
 * // forcibly disable debugInfo() for not showing debug logs in console
 * require('./mod-unlock').unlock(false);
 * @since Mar 1, 2021
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

!function () {
    let devicex = {
        isScreenOn() {
            /** @type {android.os.PowerManager} */
            let _pow_mgr = context.getSystemService(
                android.content.Context.POWER_SERVICE
            );
            return (_pow_mgr.isInteractive || _pow_mgr.isScreenOn).call(_pow_mgr);
        },
        wakeUp(timeout) {
            let _wake_lock = context.getSystemService(
                android.content.Context.POWER_SERVICE
            ).newWakeLock(
                android.os.PowerManager.FULL_WAKE_LOCK |
                android.os.PowerManager.ACQUIRE_CAUSES_WAKEUP |
                android.os.PowerManager.ON_AFTER_RELEASE, 'bright'
            );
            let _tt = timeout || 15e3;
            _wake_lock.acquire(_tt);

            let _start = Date.now();
            let _itv = setInterval(() => {
                if (this.isScreenOn() || Date.now() - _start - 240 > _tt) {
                    clearInterval(_itv);
                    if (_wake_lock !== null && _wake_lock.isHeld()) {
                        _wake_lock.release();
                    }
                }
            }, 200);
        },
        keepOn(duration, params) {
            let _par = params || {};
            let _du = duration || 5;
            _du *= _du < 100 ? 60e3 : 1;
            device.keepScreenOn(_du);
            if (_par.debug_info_flag !== false) {
                let _mm = +(_du / 60e3).toFixed(2);
                debugInfo('已设置屏幕常亮');
                debugInfo('>最大超时时间: ' + _mm + '分钟');
            }
        },
        cancelOn(params) {
            let _par = params || {};
            device.cancelKeepingAwake();
            if (_par.debug_info_flag !== false) {
                debugInfo('屏幕常亮已取消');
            }
        },
        getDisplay(global_assign, params) {
            let $_flag = global.$$flag = global.$$flag || {};
            let _par, _glob_asg;
            if (typeof global_assign === 'boolean') {
                _par = params || {};
                _glob_asg = global_assign;
            } else {
                _par = global_assign || {};
                _glob_asg = _par.global_assign;
            }

            let _waitForAction = (
                typeof waitForAction === 'function' ? waitForAction : waitForActionRaw
            );
            let _debugInfo = (m, fg) => (
                typeof debugInfo === 'function' ? debugInfo : debugInfoRaw
            )(m, fg, _par.debug_info_flag);

            /** @type {number} */
            let _W, _H;
            /**
             * @type {{
             *     WIDTH: number,
             *     HEIGHT: number
             *     USABLE_WIDTH: number,
             *     USABLE_HEIGHT: number,
             *     screen_orientation: ScrOrientation,
             *     navigation_bar_height: number,
             *     navigation_bar_height_computed: number,
             *     action_bar_default_height: number,
             *     status_bar_height: number,
             * }|{USABLE_HEIGHT: number, WIDTH: number, HEIGHT: number}|null}
             */
            let _disp = null;
            let _metrics = new android.util.DisplayMetrics();
            let _win_svc = context.getSystemService(context.WINDOW_SERVICE);
            let _win_svc_disp = _win_svc.getDefaultDisplay();
            _win_svc_disp.getRealMetrics(_metrics);

            if (!_waitForAction(() => _disp = _getDisp(), 3e3, 500)) {
                console.error('devicex.getDisplay()返回结果异常');
                return {cX: cX, cY: cY, cYx: cYx};
            }
            _showDisp();
            _assignGlob();
            return Object.assign(_disp, {cX: cX, cY: cY, cYx: cYx});

            // tool function(s) //

            /**
             * adaptive coordinate transform for x axis
             * @param {number|*} num - pixel (x) or percentage num (0.x)
             * @param {number|boolean} [base] - pixel (x) or preset negative nums (-1,-2,-3)
             * @param {{
             *     is_ratio?: boolean,
             *     to_ratio?: boolean,
             * }} [options]
             * @example
             * //-- local device with 720px display width --//
             *
             * // on 720px device: 300
             * // on 1080px device: 450 (300 * 1080 / 720)
             * // on 1080*1920 device: 450 (same as above)
             * // on 1080*2520 device: 450 (same as above)
             * console.log(cX(300, 720));
             * console.log(cX(300, -1)); // same as above
             * console.log(cX(300)); // same as above
             *
             * //-- local device with 1080px display width --//
             *
             * // on 1080px device: 300
             * // on 720px device: 200 (300 * 720 / 1080)
             * // on 720*1680 device: 200 (same as above)
             * console.log(cX(300, 1080));
             * console.log(cX(300, -2)); // same as above
             *
             * //-- local device with 1080px display width --//
             *
             * let x1 = cX(0.5);
             * let x2 = cX(0.5, -1);
             * let x3 = cX(0.5, -2);
             * let x4 = cX(0.5, 720);
             * let x5 = cX(0.5, 1080);
             * let x6 = cX(0.5, 9999);
             * console.log(x1, x2, x3, x4, x5, x6);
             * // on 1080px device: all 540 (1080 * 0.5) -- base params will be ignored
             * // on 720px device: all 360 (720 * 0.5) -- base params will be ignored
             * @return {number}
             */
            function cX(num, base, options) {
                return typeof base === 'boolean'
                    ? _cTrans(1, num, -1, Object.assign({is_ratio: base}, options))
                    : _cTrans(1, num, base, options);
            }

            /**
             * adaptive coordinate transform for y axis
             * @param {number|*} num - pixel (x) or percentage num (0.x)
             * @param {number|boolean} [base] - pixel (x) or preset negative nums (-1,-2,-3)
             * @param {{
             *     is_ratio?: boolean,
             *     to_ratio?: boolean,
             * }} [options]
             * @example
             * //-- local device with 1280px display height --//
             *
             * // on 720*1280 device: 300 (same as source device)
             * // on 1080*1920 device: 450 (300 * 1920 / 1280)
             * // on 1080*2520 device: 590 (300 * 2520 / 1280) (remarkable)
             * console.log(cY(300, 1280));
             * console.log(cY(300, -1)); // same as above
             * console.log(cY(300)); // same as above
             *
             * //-- local device with 1920px display height --//
             *
             * // on 720*1280 device: 200 (300 * 1280 / 1920)
             * // on 720*1680 device: 262 (300 * 1680 / 1920) (remarkable)
             * console.log(cY(300, 1080));
             * console.log(cY(300, -2)); // same as above
             *
             * //-- local device with 1920px display height --//
             *
             * let y1 = cY(0.5);
             * let y2 = cY(0.5, -1);
             * let y3 = cY(0.5, -2);
             * let y4 = cY(0.5, 1280);
             * let y5 = cY(0.5, 1920);
             * let y6 = cY(0.5, 9999);
             * // on 1080*1920 device: all 960 (1920 * 0.5) -- base params will be ignored
             * // on 720*1280 device: all 640 (1280 * 0.5) -- base params will be ignored
             * console.log(y1, y2, y3, y4, y5, y6);
             * @return {number}
             */
            function cY(num, base, options) {
                return typeof base === 'boolean'
                    ? _cTrans(-1, num, -1, Object.assign({is_ratio: base}, options))
                    : _cTrans(-1, num, base, options);
            }

            /**
             * adaptive coordinate transform for y axis based (and only based) on x axis
             * @param {number|*} num - pixel (x) or percentage num (0.x)
             * @param {number|boolean} [base] - pixel (x) or preset negative nums (-1,-2,-3)
             * @param {{
             *     is_ratio?: boolean,
             *     to_ratio?: boolean,
             * }} [options]
             * @example
             * //-- local device with 720*1280 display (try ignoring the height: 1280) --//
             *
             * // on 720*1280 device: 300 (same as source device)
             * // on 1080*1920 device: 450 (300 * 1080 / 720) (same as above)
             * // on 1080*2520 device: 450 (300 * 1080 / 720) (still same as above)
             * // on 1080*9999 device: 450 (300 * 1080 / 720) (still same as above)
             * // all results only affected by width
             * console.log(cYx(300, 720));
             * console.log(cYx(300, -1)); // same as above
             * console.log(cYx(300)); // same as above
             *
             * //-- local device with 1080*1920 display --//
             *
             * // on 720*1280 device: 200 (300 * 720 / 1080)
             * // on 720*1680 device: 200 (300 * 720 / 1080) (same as above)
             * console.log(cYx(300, 1080));
             * console.log(cYx(300, -2)); // same as above
             *
             * //-- local device with 2160*5040 display --//
             *
             * let y1 = cYx(0.5); // or cYx(0.5, -1); or cYx(0.5, 16/9);
             * let y2 = cYx(0.5, 1280); // or cYx(0.5, 1920); or cYx(0.5, 9999); -- Error
             * let y3 = cYx(0.5, 5040/2160); // or cYx(0.5, 21/9); or cYx(0.5, 2160/5040); or cYx(0.5, -2) -- GOOD!
             * let y4 = cYx(2020); // or cYx(2020, 720); or cYx(2020, -1); -- even if unreasonable
             * let y5 = cYx(2020, 5040/2160); // or cYx(2020, 16/9); -- Error
             * let y6 = cYx(2020, 2160); // GOOD!
             *
             * // on 1080*1920 device: (height will be ignored)
             * // y1: 0.5 * 16/9 * 1080 = 960
             * // y3: 0.5 * 21/9 * 1080 = 1260 -- which is the proper way of usage
             * // y4: 2020 / 720 * 1080 = ... -- no one will set 2020 on a device with only 720px available
             * // y6: 2020 / 2160 * 1080 = 1010 -- which is another proper way of usage
             *
             * // on 720*1280 device: (height will be ignored)
             * // just replacing 1080 in calculations each with 720
             *
             * // on 1440*1920 device: (height will be ignored)
             * // likewise (replace 1080 with 1440)
             * console.log(y1, y3, y4, y6);
             * @return {number}
             */
            function cYx(num, base, options) {
                let _opt = options || {};
                let _is_ratio = _opt.is_ratio;
                if (typeof base === 'boolean') {
                    _is_ratio = _is_ratio === undefined ? base : _is_ratio;
                    base = -1;
                }

                let _num = Number(num);
                let _is_ratio_num = Math.abs(_num) < 1 || _is_ratio;
                let _base = Number(base);

                if (!_base || !~_base) {
                    _base = 720;
                    _num *= _is_ratio_num ? 1280 : 1;
                } else if (_base === -2) {
                    _base = 1080;
                    _num *= _is_ratio_num ? 1920 : 1;
                } else if (_base === -3) {
                    _base = 1096;
                    _num *= _is_ratio_num ? 2560 : 1;
                } else if (_base < 0) {
                    throw Error('Can not parse base param for cYx()');
                } else {
                    if (_is_ratio_num) {
                        _num *= _H;
                    } else if (_base < 5) {
                        throw Error('Base and num params should be both pixels for cYx()');
                    }
                    _base = (_base > 1 ? 1 / _base : _base) * _H;
                }

                return _opt.to_ratio
                    ? Number((_num * 9 / 16 / _base).toFixed(3))
                    : Math.round(_num * _W / _base);
            }

            /**
             * adaptive coordinate transform function
             * @param dxn {number} - 1: horizontal; -1: vertical
             * @param num {number} - pixel (x) or percentage num (0.x)
             * @param {number} [base] - pixel (x) or preset negative nums (-1,-2,-3)
             * @param {{
             *     is_ratio?: boolean,
             *     to_ratio?: boolean,
             * }} [options]
             * @return {number}
             */
            function _cTrans(dxn, num, base, options) {
                let _full = ~dxn ? _W : _H;
                let _num = Number(num);
                if (isNaN(_num)) {
                    throw Error('Can not parse num param for cTrans()');
                }
                let _base = Number(base);
                if (!base || !~base) {
                    _base = ~dxn ? 720 : 1280; // e.g. Sony Xperia XZ1 Compact
                } else if (base === -2) {
                    _base = ~dxn ? 1080 : 1920; // e.g. Sony Xperia Z5
                } else if (base === -3) {
                    _base = ~dxn ? 1096 : 2560; // e.g. Sony Xperia 1 II
                }
                let _opt = options || {};
                if (Math.abs(_num) < 1 || _opt.is_ratio) {
                    _num *= _base;
                }
                return _opt.to_ratio
                    ? Number((_num / _base).toFixed(3))
                    : Math.min(Math.round(_num * _full / _base), _full);
            }

            function _showDisp() {
                if ($_flag.debug_info_avail && !$_flag.display_params_got) {
                    _debugInfo('屏幕宽高: ' + _W + ' × ' + _H);
                    _debugInfo('可用屏幕高度: ' + _disp.USABLE_HEIGHT);
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

                    /**
                     * if the device is rotated 90 degrees counter-clockwise,
                     * to compensate rendering will be rotated by 90 degrees clockwise
                     * and thus the returned value here will be Surface#ROTATION_90
                     * 0: 0°, device is portrait
                     * 1: 90°, device is rotated 90 degree counter-clockwise
                     * 2: 180°, device is reverse portrait
                     * 3: 270°, device is rotated 90 degree clockwise
                     * @typedef ScrOrientation
                     * @type {number}
                     */
                    /** @type ScrOrientation */
                    let _SCR_O = _win_svc_disp.getRotation();
                    let _is_scr_port = ~[0, 2].indexOf(_SCR_O);
                    // let _MAX = _win_svc_disp.maximumSizeDimension;
                    let _MAX = Math.max(_metrics.widthPixels, _metrics.heightPixels);

                    let [_UH, _UW] = [_H, _W];
                    let _dimen = (name) => {
                        let resources = context.getResources();
                        let resource_id = resources.getIdentifier(name, 'dimen', 'android');
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
                        status_bar_height: _dimen('status_bar_height'),
                        navigation_bar_height: _dimen('navigation_bar_height'),
                        navigation_bar_height_computed: _is_scr_port ? _H - _UH : _W - _UW,
                        action_bar_default_height: _dimen('action_bar_default_height'),
                    };
                } catch (e) {
                    return _raw();
                }

                // tool function(s) //

                /**
                 * @returns {{USABLE_HEIGHT: number, WIDTH: number, HEIGHT: number}|null}
                 */
                function _raw() {
                    _W = device.width;
                    _H = device.height;
                    return _W && _H ? {
                        WIDTH: _W,
                        HEIGHT: _H,
                        USABLE_HEIGHT: Math.trunc(_H * 0.9),
                    } : null;
                }
            }

            function _assignGlob() {
                if (_glob_asg) {
                    Object.assign(global, {
                        /** Screen width */
                        W: _W, WIDTH: _W,
                        /** Half of screen width */
                        halfW: Math.round(_W / 2),
                        /** Usable screen width */
                        uW: Number(_disp.USABLE_WIDTH),
                        /** Screen height */
                        H: _H, HEIGHT: _H,
                        /** Usable screen height */
                        uH: Number(_disp.USABLE_HEIGHT),
                        /**
                         * Screen orientation
                         * @type ScrOrientation
                         */
                        scrO: Number(_disp.screen_orientation),
                        /** Status bar height */
                        staH: Number(_disp.status_bar_height),
                        /** Navigation bar height */
                        navH: Number(_disp.navigation_bar_height),
                        /** Computed navigation bar height */
                        navHC: Number(_disp.navigation_bar_height_computed),
                        /** Action bar default height */
                        actH: Number(_disp.action_bar_default_height),
                        cX: cX, cY: cY, cYx: cYx,
                    });
                }
            }

            // raw function(s) //

            function waitForActionRaw(cond_func, time_params) {
                let _cond_func = cond_func;
                if (!cond_func) return true;
                let classof = o => Object.prototype.toString.call(o).slice(8, -1);
                if (classof(cond_func) === 'JavaObject') _cond_func = () => cond_func.exists();
                let _check_time = typeof time_params === 'object' && time_params[0] || time_params || 10e3;
                let _check_interval = typeof time_params === 'object' && time_params[1] || 200;
                while (!_cond_func() && _check_time >= 0) {
                    sleep(_check_interval);
                    _check_time -= _check_interval;
                }
                return _check_time >= 0;
            }

            function debugInfoRaw(msg, msg_lv) {
                msg_lv && console.verbose((msg || '').replace(/^(>*)( *)/, '>>' + '$1 '));
            }
        },
    };

    let _init_scr = devicex.isScreenOn();
    let _init_unlk = _isUnlk();

    let $_und = x => typeof x === 'undefined';
    let $_nul = x => x === null;
    let $_func = x => typeof x === 'function';
    let $_num = x => typeof x === 'number';
    let $_str = x => typeof x === 'string';
    let $_rex = x => x instanceof RegExp;
    let $_arr = x => Array.isArray(x);
    let $_flag = global.$$flag = global.$$flag || {};

    let $_sel = getSelector();
    let $_unlk = _unlkSetter();

    let _def = {
        // updated: Mar 1, 2021
        unlock: {
            unlock_code: null,
            unlock_max_try_times: 20,
            unlock_pattern_strategy: 'segmental',
            unlock_pattern_size: 3,
            unlock_pattern_swipe_time_segmental: 120,
            unlock_pattern_swipe_time_solid: 200,
            unlock_dismiss_layer_strategy: 'preferred',
            unlock_dismiss_layer_bottom: 0.8,
            unlock_dismiss_layer_top: 0.2,
            unlock_dismiss_layer_swipe_time: 110,
        },
    };
    let _sto = {
        // do not convert into shorthand method like "_Storage(name) {...}",
        // which would be accepted by Rhino engine but not recommended
        _Storage: function (name) {
            let _dir = files.getSdcardPath() + '/.local/';
            let _full_path = _dir + name + '.nfe';
            files.createWithDirs(_full_path);
            let _readFile = () => {
                let _file = files.open(_full_path, 'r');
                let _content = _file.read();
                _file.close();
                return _content;
            };

            this.contains = _contains;
            this.get = _get;
            this.put = _put;
            this.remove = _remove;
            this.clear = _clear;

            // tool function(s) //

            function _replacer(k, v) {
                if (typeof v === 'number') {
                    if (isNaN(v) || !isFinite(v)) {
                        /** Zero Width No-Break Space */
                        let _pad = '\ufeff';
                        return _pad + v.toString() + _pad;
                    }
                }
                return v;
            }

            function _reviver(k, v) {
                if (typeof v === 'string') {
                    let _rex = /^\ufeff(.+)\ufeff$/;
                    if (v.match(_rex)) {
                        return +v.replace(_rex, '$1');
                    }
                }
                return v;
            }

            function _contains(key) {
                return key in _jsonParseFile();
            }

            function _put(key, new_val, forc) {
                if (typeof new_val === 'undefined') {
                    let _m = '"put" value can\'t be undefined';
                    throw new TypeError(_m);
                }

                let _old = {};
                let _tmp = {};

                try {
                    _old = _jsonParseFile(_reviver);
                } catch (e) {
                    console.warn(e.message);
                }

                let _cA = _classof(new_val, 'Object');
                let _cB = _classof(_old[key], 'Object');
                let _both_type_o = _cA && _cB;
                let _keyLen = () => Object.keys(new_val).length;

                if (!forc && _both_type_o && _keyLen()) {
                    _tmp[key] = Object.assign(
                        _old[key], new_val
                    );
                } else {
                    _tmp[key] = new_val;
                }

                let _file = files.open(_full_path, 'w');
                _file.write(JSON.stringify(Object.assign(_old, _tmp), _replacer));
                _file.close();
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
                    let _file = files.open(_full_path, 'w');
                    _file.write(JSON.stringify(_o));
                    _file.close();
                    delete _o[key];
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
                    console.warn('JSON.parse()解析配置文件异常');
                }
                try {
                    return _tryRepairEscChar(_str, reviver);
                } catch (e) {
                    console.warn('转义字符修复失败');
                }
                try {
                    return _tryRepairMojibakeLines(_str, reviver);
                } catch (e) {
                    console.warn('乱码行修复失败');
                }
                throw _failAndBackup();
            }

            function _tryRepairEscChar(str, reviver) {
                console.warn('尝试查找并修复异常的转义字符');

                let _rex = /[ntrfb\\'"0xu]/;
                let _str_new = '';

                for (let i in str) {
                    let _i = +i;
                    let _s = str[_i];
                    if (_s === '\\') {
                        let _prev = str[_i - 1];
                        let _next = str[_i + 1];
                        if (_prev && _next) {
                            if (_prev !== '\\' && !_next.match(_rex)) {
                                _s += '\\';
                            }
                        }
                    }
                    _str_new += _s;
                }

                let _res = JSON.parse(_str_new, reviver);
                console.info('修复成功');

                let _file = files.open(_full_path, 'w');
                _file.write(_str_new);
                console.info('已重新写入修复后的数据');

                _file.close();
                return _res;
            }

            function _tryRepairMojibakeLines(str, reviver) {
                console.warn('尝试查找并修复异常的乱码行');

                let _split = str.split('\n');

                let _len = _split.length;
                while (_len-- > 1) {
                    try {
                        let _a = _split.slice(0, _len - 1);
                        let _b = _split.slice(_len + 1);
                        let _str_new = _a.concat(_b).join('\n');
                        let _res = JSON.parse(_str_new, reviver);
                        console.info('修复成功');

                        let _file = files.open(_full_path, 'w');
                        _file.write(_str_new);
                        console.info('已重新写入修复后的数据');

                        _file.close();
                        return _res;
                    } catch (e) {
                        // nothing to do here
                    }
                }
                throw Error(_tryRepairMojibakeLines.name);
            }

            function _failAndBackup() {
                let _new_file_name = name + '.nfe.' + Date.now() + '.bak';

                files.rename(_full_path, _new_file_name);
                console.error('修复失败');
                console.warn('已将损坏的配置文件备份至');
                console.warn(_dir + _new_file_name);
                console.warn('以供手动排查配置文件中的问题');

                return Error('JSON.parse() failed in mod-storage');
            }
        },
        create(name) {
            return new this._Storage(name);
        },
        remove(name) {
            this.create(name).clear();
        },
    }.create('unlock');
    let _cfg = Object.assign({}, _def, _sto.get('config'));
    let _pwmap = (() => {
        let _path = '';
        let _dic = {};
        let _cfg = {
            // {SCPrMtaB:'A'}
            code_length: 8,
            // {1:'A',2:'A', ... 10:'A'}
            code_amount: 10,
            separator: '_.|._',
            encrypt_power: 2,
        };

        return {
            decrypt: _decrypt,
            generate: _generate,
        };

        // main function(s) //

        function _decrypt(input) {
            _initDic();
            let _empty = !arguments.length;
            let _input = _empty && _userInput(1) || input;
            let _thd_mon = _thdMonitor(1);
            let _decrypted = _dec(_input);
            _thd_mon.interrupt();
            if (_empty) {
                setClip(_decrypted);
                toast('解密字符串已复制剪切板');
            }
            return _decrypted;

            // tool function(s) //

            function _dec(arr) {
                if ($_und(arr)) {
                    return '';
                }
                if ($_nul(arr)) {
                    return null;
                }
                if ($_str(arr)) {
                    if (!arr.length) {
                        return '';
                    }
                    if (arr[0] !== '[') {
                        toast('输入的加密字符串不合法');
                        exit();
                    }
                    let _raw = arr.slice(1, -1).split(/, ?/);
                    arr = _raw.map((s) => {
                        return s.replace(/^"([^]+)"$/g, '$1');
                    });
                }

                let _shift = 0;
                let _res = '';
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
                            return '';
                        }
                        if (_di === '\\' && _dj === 'u') {
                            let _tmp = '';
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
                    _res = '';
                }
                return _res;
            }
        }

        function _generate() {
            if (files.exists(_path)) {
                confirm(
                    '密文文件已存在\n' +
                    '继续操作将覆盖已有文件\n' +
                    '新的密文文件生成后\n' +
                    '涉及密文的全部相关代码\n' +
                    '均需重新设置才能解密\n' +
                    '确定要继续吗?'
                ) || exit();
            }

            files.createWithDirs(_path);

            // eg: {SCPrMtaB:'A',doaAisDd:'%'}
            let _res = {};
            let _az = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
            let _all = '~!@#$%^&*`\'-_+=,./ 0123456789:;?()[]<>{}|' + '"\\' + _az;
            let _randAz = () => _az[Math.trunc(Math.random() * _az.length)];
            let _li = _all.length;
            let _lj = _cfg.code_amount;
            let _lk = _cfg.code_length;
            for (let i = 0; i < _li; i += 1) {
                for (let j = 0; j < _lj; j += 1) {
                    let _code = '';
                    for (let k = 0; k < _lk; k += 1) {
                        _code += _randAz();
                    }
                    _res[_code] = _all[i];
                }
            }
            let _file = files.open(_path, 'w');
            _file.write(JSON.stringify(_res));
            _file.close();
            toast('密文文件生成完毕');
        }

        // tool function(s) //

        function _initDic() {
            let _root = files.getSdcardPath();
            _path = _root + '/.local/PWMAP.txt';
            if (!files.exists(_path)) {
                _showMsg();
                _generate();
            }
            let _file = files.open(_path, 'r');
            _dic = JSON.parse(_file.read());
            _file.close();

            // tool function(s) //

            function _showMsg() {
                let _s = '已生成新密文字典';

                _splitLine();
                toastLog(_s);
                _splitLine();

                // tool function(s) //

                function _splitLine() {
                    let [_ln, _i] = ['', 33];
                    while (_i--) _ln += '-';
                    console.log(_ln);
                }
            }
        }

        function _userInput(dec) {
            let _inp = '';
            let _max = 20;
            let _msg = dec ?
                '请输入要解密的字符串数组' :
                '请输入要加密的字符串';
            while (_max--) {
                _inp = dialogs.rawInput(
                    '请输入要' + _msg + '的字符串\n' +
                    '点击其他区域放弃输入'
                );
                if (_inp) {
                    break;
                }
                if ($_nul(_inp)) {
                    exit();
                }
                toast('输入内容无效');
            }
            if (_max >= 0) {
                return _inp;
            }
            toast('已达最大尝试次数');
            exit();
        }

        function _thdMonitor(dec) {
            return threads.start(function () {
                let _msg = dec
                    ? '正在解密中 请稍候...'
                    : '正在加密中 请稍候...';
                sleep(2.4e3);
                let _ctr = 0;
                while (1) {
                    _ctr++ % 5 || toast(_msg);
                    sleep(1e3);
                }
            });
        }
    })();

    let _intro = device.brand + ' ' + device.product + ' ' + device.release;
    let _code = _pwmap.decrypt(_cfg.unlock_code) || '';
    let _clean_code = _code.split(/\D+/).join('').split('');
    let _max_try = _cfg.unlock_max_try_times;
    let _pat_sz = _cfg.unlock_pattern_size;
    let _has_root = _checkRootAccess();

    typeof module === 'undefined' ? _execute() : _export();

    // tool function(s) //

    function _err(s) {
        devicex.cancelOn();
        messageAction('解锁失败', 4, 1, 0, -1);

        ($_str(s) ? [s] : s).forEach(m => messageAction(m, 4, 0, 1));
        messageAction(_intro, 4, 0, 1, 1);

        captureErrScreen('unlock_failed', {log_level: 1});

        if ($_unlk.init_scr) {
            messageAction('自动关闭屏幕' + (keycode(26) ? '' : '失败'), 1, 0, 0, 1);
        }

        exit();
        sleep(3.6e3);

        // tool function(s) //

        /**
         * Save current screen capture as a file with a key name and a formatted timestamp
         * @param {string} key_name - a key name as a clip of the file name
         * @param {{}} [options]
         * @param {number|string|null} [options.log_level]
         * @param {number} [options.max_samples=10]
         */
        function captureErrScreen(key_name, options) {
            if (typeof imagesx === 'object') {
                imagesx.permit();
            } else if (!global._$_request_screen_capture) {
                images.requestScreenCapture();
                global._$_request_screen_capture = true;
            }

            let _opt = options || {};
            let _log_lv = _opt.log_level;
            let _max_smp = _opt.max_samples || 10;

            let _dir = files.getSdcardPath() + '/.local/pics/err/';
            let _path = _dir + key_name + '_' + _getTimeStr() + '.png';

            try {
                files.createWithDirs(_path);
                images.captureScreen(_path);
                if (_log_lv !== null && _log_lv !== undefined) {
                    messageAction('已存储屏幕截图文件:', _log_lv);
                    messageAction(_path, _log_lv);
                }
                _removeRedundant();
            } catch (e) {
                messageAction(e.message, 3);
            }

            // tool function(s) //

            function _getTimeStr() {
                let _now = new Date();
                let _pad = n => (n < 10 ? '0' : '') + n;
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
        }
    }

    function _isUnlk() {
        return !context.getSystemService(context.KEYGUARD_SERVICE).isKeyguardLocked();
    }

    function _wakeUpIFN() {
        if (!devicex.isScreenOn()) {
            let _ctr = 0, _max = 4;
            while (1) {
                _debugAct('唤起设备', _ctr, _max);

                devicex.wakeUp();

                if (waitForAction(devicex.isScreenOn, 1.5e3)) {
                    device.keepScreenOn(2 * 60e3);
                    break;
                }
                if (++_ctr > _max) {
                    return _err('设备唤起失败');
                }
            }
            debugInfo('设备唤起成功');
        }
    }

    function _unlkSetter() {
        let _as = 'com\\.android\\.systemui:id/';
        let _ak = 'com\\.android\\.keyguard:id/';
        let _sk = 'com\\.smartisanos\\.keyguard:id/';

        return {
            init_scr: _init_scr,
            init_unlk: _init_unlk,
            prev_cntr: {
                trigger() {
                    _wakeUpIFN();
                    _disturbance();

                    return _checkStrategy() && [{
                        desc: '通用',
                        sel: idMatches(_as + 'preview_container'),
                    }, {
                        desc: 'EMUI',
                        sel: idMatches(_as + '.*(keyguard|lock)_indication.*'),
                    }, {
                        desc: '锤子科技',
                        sel: idMatches(_sk + 'keyguard_(content|.*view)'),
                    }, {
                        desc: 'MIUI',
                        sel: idMatches(_ak + '(.*unlock_screen.*|.*notification_.*(container|view).*|dot_digital)'),
                    }, {
                        desc: 'MIUI10',
                        sel: idMatches(_as + '(.*lock_screen_container|notification_(container|panel).*|keyguard_.*)'),
                    }, {
                        sel: $_sel.pickup(/上滑.{0,4}解锁/, 'selector'),
                    }].some((smp) => {
                        let {desc: _desc, sel: _sel} = smp;
                        if (_sel instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                            if (_sel.exists()) {
                                if (_desc) {
                                    debugInfo('匹配到' + _desc + '解锁提示层控件');
                                } else {
                                    debugInfo('匹配到解锁提示层文字:');
                                    debugInfo($_sel.pickup(_sel, 'txt'));
                                }
                                return (this.trigger = _sel.exists.bind(_sel))();
                            }
                        }
                    });

                    // tool function(s) //

                    function _disturbance() {
                        [{
                            desc: 'QQ锁屏消息弹框控件',
                            trigger() {
                                return $_sel.pickup('按住录音')
                                    || $_sel.pickup(idMatches(/com.tencent.mobileqq:id.+/));
                            },
                            handle() {
                                clickAction($_sel.pickup('关闭'), 'w');
                                let _cond = this.trigger.bind(this);
                                waitForAction(_cond, 3e3)
                                    ? debugInfo('关闭弹框控件成功')
                                    : debugInfo('关闭弹框控件超时', 3);
                            },
                        }].forEach((o) => {
                            if (o.trigger()) {
                                debugInfo(['检测到提示层页面干扰:', o.desc]);
                                o.handle();
                            }
                        });
                    }

                    function _checkStrategy() {
                        let _stg = _cfg.unlock_dismiss_layer_strategy;
                        if (_stg === 'preferred') {
                            return true;
                        }
                        if (_stg === 'disabled') {
                            if (!$_flag.unlock_dismiss_layer_disabled_hinted) {
                                debugInfo('解锁页面提示层检测已禁用');
                                $_flag.unlock_dismiss_layer_disabled_hinted = true;
                            }
                            return false;
                        }
                        if (_stg === 'deferred') {
                            if (!$_flag.unlock_dismiss_layer_deferred) {
                                debugInfo('解锁页面提示层检测延迟一次');
                                $_flag.unlock_dismiss_layer_deferred = true;
                                return false;
                            }
                            return true;
                        }
                        throw Error('Unknown unlock dismiss layer strategy: ' + _stg);
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
                    /** @type {number[]} */
                    let _reliable = _cfg.swipe_time_reliable || [];
                    let _chances = 3;
                    let _t_pool = _cfg.continuous_swipe || {};

                    _init();
                    _dismiss();
                    _storage();

                    // tool function(s) //

                    function _init() {
                        if (~_reliable.indexOf(_time)) {
                            _chances = Infinity;
                            debugInfo('当前滑动时长参数可信');
                        }

                        if (!(_time in _t_pool)) {
                            debugInfo('连续成功滑动累积器清零');
                            _t_pool = {};
                            _t_pool[_time] = 0;
                        }
                    }

                    function _dismiss() {
                        // noinspection JSCheckFunctionSignatures
                        let _gesture_par = [_time].concat(_pts.map(y => [halfW, cY(y)]));

                        let _max = 30, _ctr = 0;
                        devicex.keepOn(3);
                        while (!_lmt()) {
                            _debugAct('消除解锁页面提示层', _ctr, _max);
                            debugInfo('滑动时长: ' + _time + '毫秒');
                            debugInfo('参数来源: ' + (_from_sto ? '本地存储' : '自动计算'));

                            gesture.apply(null, _gesture_par);

                            if (_this.succ()) {
                                break;
                            }

                            debugInfo('单次消除解锁页面提示层超时');
                            _ctr += 1;

                            if (_from_sto) {
                                if (--_chances < 0) {
                                    _from_sto = false;
                                    _time = _cfg.unlock_dismiss_layer_swipe_time;
                                    debugInfo('放弃本地存储数据');
                                    debugInfo('从默认值模块获取默认值: ' + _time);
                                } else {
                                    debugInfo('继续使用本地存储数据');
                                }
                            } else {
                                // h110, 115, 120, 170, 220, 270, 320...
                                let _increment = _time < 120 ? 5 : 50;
                                _time += _increment;
                                debugInfo('参数增量: ' + _increment);
                            }
                        }
                        devicex.cancelOn();

                        debugInfo('解锁页面提示层消除成功');
                        _this.succ_fg = true;

                        // tool function(s) //

                        function _lmt() {
                            if (_ctr > _max) {
                                _t_pool[_time] = 0;
                                _sto.put('config', {continuous_swipe: _t_pool});
                                return _err('消除解锁页面提示层失败');
                            }
                        }
                    }

                    function _storage() {
                        if (_time !== _time_sto) {
                            _sto.put('config', {unlock_dismiss_layer_swipe_time: _time});
                            debugInfo('存储滑动时长参数: ' + _time);
                        }

                        if (!(_time in _t_pool)) {
                            _t_pool[_time] = 0;
                        }
                        let _new_ctr = ++_t_pool[_time];
                        _sto.put('config', {continuous_swipe: _t_pool});
                        debugInfo('存储连续成功滑动次数: ' + _new_ctr);

                        if (_new_ctr >= 6 && !~_reliable.indexOf(_time)) {
                            debugInfo('当前滑动时长可信度已达标');
                            debugInfo('存储可信滑动时长数据: ' + _time);
                            _sto.put('config', {swipe_time_reliable: _reliable.concat(_time)});
                        }
                    }
                },
                handle() {
                    return !this.succ_fg && this.trigger() && this.dismiss();
                },
                succ() {
                    return waitForAction(function () {
                        return !this.trigger();
                    }.bind(this), 1.5e3) || $_unlk.unlk_view.trigger();
                },
            },
            unlk_view: {
                trigger() {
                    let _this = this;

                    if (!devicex.isScreenOn()) {
                        return debugInfo(['跳过解锁控件检测', '>屏幕未亮起']);
                    }
                    return _pattern() || _password() || _pin() || _specials() || _unmatched();

                    // tool function(s) //

                    function _pattern() {
                        return [{
                            desc: '通用',
                            sel: idMatches(_as + 'lockPatternView'),
                        }, {
                            desc: 'MIUI',
                            sel: idMatches(_ak + 'lockPattern(View)?'),
                        }].some((smp) => {
                            if (smp.sel.exists()) {
                                debugInfo('匹配到' + smp.desc + '图案解锁控件');
                                return _trigger(smp.sel, _stg);
                            }
                        });

                        // strategy(ies) //

                        function _stg() {
                            let _stg = _cfg.unlock_pattern_strategy;
                            let _stg_map = {
                                segmental: '叠加路径',
                                solid: '连续路径',
                            };
                            let _key = 'unlock_pattern_swipe_time_' + _stg;
                            let _time = _cfg[_key]; // swipe time

                            let _from_sto = !!_time;
                            let _chances = 3;
                            let _ctr = 0;
                            let _max = Math.ceil(_max_try * 0.6);
                            while (!_lmt()) {
                                _debugAct('图案密码解锁', _ctr, _max);
                                debugInfo('滑动时长: ' + _time + '毫秒');
                                debugInfo('滑动策略: ' + _stg_map[_stg]);

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
                                        gestures.apply(null, _par);
                                    },
                                    solid() {
                                        gesture.apply(null, [_time].concat(_pts));
                                    },
                                };

                                try {
                                    _act[_stg]();
                                } catch (e) {
                                    messageAction(e.message, 4, 0, 0, -1);
                                    messageAction(e.stack, 4, 0, 0, 2);
                                }

                                if (_this.succ()) {
                                    break;
                                }

                                debugInfo('图案解锁未成功', 3);
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
                            debugInfo('图案解锁成功');

                            if (_time !== _cfg[_key]) {
                                _cfg[_key] = _time;
                                _sto.put('config', _cfg);
                                debugInfo('存储滑动时长参数: ' + _time);
                            }

                            return true;

                            // tool function(s) //

                            function _lmt() {
                                return _ctr > _max && _err('图案解锁方案失败');
                            }

                            function _getPts() {
                                if ($_unlk.unlock_pattern_bounds) {
                                    return $_unlk.unlock_pattern_bounds;
                                }

                                let _bnd = _stable(_this.sel);
                                if (!_bnd) {
                                    return _err(['图案解锁方案失败', '无法获取点阵布局']);
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
                                    _code = _code.match(/[^1-9]+/)
                                        ? _code.split(/[^1-9]+/).join('|').split('|')
                                        : _code.split('');
                                }

                                return $_unlk.unlock_pattern_bounds = _simpl(_code, _sz)
                                    .filter(n => +n && _pts[n])
                                    .map(n => [_pts[n].x, _pts[n].y]);

                                // tool function(s) //

                                function _stable(sel) {
                                    let _res;
                                    let _max = 8;
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

                                        // returns a slope ('斜率') of 2 pts
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
                        return !_misjudge() && [{
                            desc: '通用',
                            selector: idMatches('.*passwordEntry'),
                        }, {
                            desc: 'MIUI',
                            selector: idMatches(_ak + 'miui_mixed_password_input_field'),
                        }, {
                            desc: '锤子科技',
                            selector: idMatches(_sk + 'passwordEntry(_.+)?').className('EditText'),
                        }].some((smp) => {
                            if (smp.selector.exists()) {
                                debugInfo('匹配到' + smp.desc + '密码解锁控件');
                                return _trigger(smp.selector, _stg);
                            }
                        });

                        // strategy(ies) //

                        function _stg() {
                            let _pw = _code;
                            if ($_arr(_pw)) {
                                _pw = _pw.join('');
                            }

                            let _cfm_btn = (type) => (
                                $_sel.pickup([/确.|完成|[Cc]onfirm|[Ee]nter/, {
                                    className: 'Button', clickable: true,
                                }], type)
                            );

                            let _ctr = 0;
                            let _max = Math.ceil(_max_try * 0.6);
                            while (!_lmt()) {
                                _debugAct('密码解锁', _ctr, _max);
                                _this.sel.setText(_pw);
                                _keypadAssistIFN();

                                let _w_cfm = _cfm_btn('widget');
                                if (_w_cfm) {
                                    debugInfo('点击"' + _cfm_btn('txt') + '"按钮');
                                    try {
                                        clickAction(_w_cfm, 'w');
                                    } catch (e) {
                                        debugInfo('按钮点击可能未成功', 3);
                                    }
                                }
                                if (_this.succ(2)) {
                                    break;
                                }
                                if (_has_root && !shell('input keyevent 66', true).code) {
                                    debugInfo('使用Root权限模拟回车键');
                                    sleep(480);
                                    if (_this.succ()) {
                                        break;
                                    }
                                }
                                _ctr += 1;
                                sleep(200);
                            }
                            debugInfo('密码解锁成功');

                            return true;

                            // tool function(s) //

                            function _lmt() {
                                return _ctr > _max && _err([
                                    '密码解锁方案失败', '可能是密码错误', '或无法点击密码确认按钮',
                                ]);
                            }

                            function _keypadAssistIFN() {
                                /** @type string */
                                let _pw_last = _pw[_pw.length - 1];
                                /**
                                 * @example
                                 * let _smp_o = {
                                 *     $_DEVICE: {
                                 *         // string before keys
                                 *         // number for the length of last pw string
                                 *         prefix: 1,
                                 *         // assistant keys coordination
                                 *         // like: [[x1, y1], [x2, y2], ...],
                                 *         keys: [[100, 200]],
                                 *         // action after keys
                                 *         // UiObject: desc('5') -- widget of a key
                                 *         // Point: [x, y] -- point of a key
                                 *         // String: '5' -- numpad key 5
                                 *         // Number: 5 -- numpad key 5
                                 *         suffix: null,
                                 *     },
                                 * };
                                 * @type {Object.<string,{
                                 *     prefix?: number|{toString:function():string},
                                 *     keys?: string[]|Tuple2<number>,
                                 *     keys_map?: Object.<number|string,Tuple2<number>>,
                                 *     suffix?: UiSelector$|UiObject$|Tuple2<number>|number|string|RegExp,
                                 * }>}
                                 */
                                let _smp_o = {
                                    'HUAWEI VOG-AL00 9': {prefix: 1, keys: [[1008, 1706]]},
                                    'HUAWEI ELE-AL00 10': {
                                        keys: ['DEL'],
                                        keys_map: (() => {
                                            let y = [1188, 1350, 1511, 1674, 1835];
                                            let x = [56, 163, 271, 378, 487, 595, 703, 810, 918, 1027];
                                            let xs = [109.5, 217, 324.5, 432.5, 541, 649, 756.5, 864, 972.5];
                                            let [y0, y1, y2, y3, y4] = y;
                                            let [x0, x1, x2, x3, x4, x5, x6, x7, x8, x9] = x;
                                            let [xs0, xs1, xs2, xs3, xs4, xs5, xs6, xs7, xs8] = xs;
                                            return {
                                                1: [x0, y0],
                                                2: [x1, y0],
                                                3: [x2, y0],
                                                4: [x3, y0],
                                                5: [x4, y0],
                                                6: [x5, y0],
                                                7: [x6, y0],
                                                8: [x7, y0],
                                                9: [x8, y0],
                                                0: [x9, y0],
                                                q: [x0, y1],
                                                w: [x1, y1],
                                                e: [x2, y1],
                                                r: [x3, y1],
                                                t: [x4, y1],
                                                y: [x5, y1],
                                                u: [x6, y1],
                                                i: [x7, y1],
                                                o: [x8, y1],
                                                p: [x9, y1],
                                                a: [xs0, y2],
                                                s: [xs1, y2],
                                                d: [xs2, y2],
                                                f: [xs3, y2],
                                                g: [xs4, y2],
                                                h: [xs5, y2],
                                                j: [xs6, y2],
                                                k: [xs7, y2],
                                                l: [xs8, y2],
                                                z: [xs1, y3],
                                                x: [xs2, y3],
                                                c: [xs3, y3],
                                                v: [xs4, y3],
                                                b: [xs5, y3],
                                                n: [xs6, y3],
                                                m: [xs7, y3],
                                                ',': [xs1, y4],
                                                ' ': [xs4, y4],
                                                '.': [xs7, y4],
                                                del: [x9, y3],
                                            };
                                        })(),
                                        get suffix() {
                                            return this.keys_map[_pw_last];
                                        },
                                    },
                                };
                                if (!(_intro in _smp_o)) {
                                    return;
                                }
                                debugInfo('此设备机型需要按键辅助');

                                let _smp = _smp_o[_intro];
                                let _coords = _smp.keys;
                                let _k_map = _smp.keys_map;
                                let _pref = _smp.prefix;
                                let _suff = _smp.suffix;
                                if (!$_und(_pref) && !$_nul(_pref)) {
                                    let _s = '';
                                    if ($_num(_pref)) {
                                        _s += _pw_last.repeat(_pref);
                                    } else {
                                        _s = _pref.toString();
                                    }
                                    _this.sel.setText(_pw + _s);
                                    debugInfo('辅助按键前置填充: ' + _s.length + '项');
                                }

                                _coords.forEach((c, i) => {
                                    i || sleep(300);
                                    clickAction($_str(c) ? _k_map[c] : c);
                                    sleep(300);
                                });

                                if (_suff) {
                                    if (_suff instanceof com.stardust.automator.UiObject) {
                                        debugInfo('辅助按键后置填充类型: 控件');
                                        return clickAction(_suff);
                                    }
                                    if (_suff instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                                        debugInfo('辅助按键后置填充类型: 选择器');
                                        return clickAction(_suff);
                                    }
                                    if ($_arr(_suff)) {
                                        debugInfo('辅助按键后置填充类型: 坐标');
                                        return clickAction(_suff);
                                    }
                                    if ($_num(_suff) || $_str(_suff) || $_rex(_suff)) {
                                        debugInfo('辅助按键后置填充类型: 文本');
                                        return clickAction($_sel.pickup('(key.?)?' + _suff));
                                    }
                                    return _err(['密码解锁失败', '无法判断末位字符类型']);
                                }
                            }
                        }

                        function _misjudge() {
                            let _triStr = sel => $_str(sel) && id(sel).exists();
                            let _triRex = sel => $_rex(sel) && idMatches(sel).exists();

                            return [
                                'com.android.systemui:id/lockPattern',
                            ].some((sel) => {
                                if (_triStr(sel) || _triRex(sel)) {
                                    _this.misjudge = sel;
                                    debugInfo(['匹配到误判干扰', '转移至PIN解锁方案']);
                                    return true;
                                }
                            });
                        }
                    }

                    function _pin() {
                        return [{
                            desc: '通用',
                            sel: idMatches(_as + 'pinEntry'),
                        }, {
                            desc: 'MIUI',
                            sel: idMatches(_ak + 'numeric_inputview'),
                        }, {
                            desc: 'EMUI10',
                            sel: idMatches(_as + 'fixedPinEntry'),
                        }, {
                            desc: 'EMUI',
                            sel: descMatches('[Pp][Ii][Nn] ?(码区域|area)'),
                        }, {
                            desc: '魅族',
                            sel: idMatches(_as + 'lockPattern'),
                        }, {
                            desc: 'OPPO',
                            sel: idMatches(_as + '(coloros.)?keyguard.pin.(six.)?view'),
                        }, {
                            desc: 'VIVO',
                            sel: idMatches(_as + 'vivo_pin_view'),
                        }].some((smp) => {
                            let _desc = smp.desc;
                            if (smp.sel.exists()) {
                                if (_desc.match(/\w$/)) {
                                    _desc += '/';
                                }
                                debugInfo('匹配到' + _desc + 'PIN解锁控件');
                                return _trigger(smp.sel, _stg);
                            }
                        });

                        // tool function(s) //

                        function _stg() {
                            let _pw = _clean_code;

                            let _ctr = 0;
                            let _max = Math.ceil(_max_try * 0.6);
                            while (!_lmt()) {
                                _debugAct('PIN解锁', _ctr, _max);

                                $_func(_this.unlockPin) ? _this.unlockPin() : _unlockPin();

                                if (_this.succ() || _clickKeyEnter()) {
                                    break;
                                }
                                _ctr += 1;
                                sleep(200);
                            }
                            debugInfo('PIN解锁成功');
                            return true;

                            // tool function(s) //

                            function _lmt() {
                                return _ctr > _max && _err(['PIN解锁方案失败', '尝试次数已达上限']);
                            }

                            function _clickKeyEnter() {
                                let _sltr = idMatches(_as + 'key_enter');
                                if (_sltr.exists()) {
                                    debugInfo('点击"key_enter"控件');
                                    clickAction(_sltr, 'w');
                                    return _this.succ();
                                }
                            }

                            function _unlockPin() {
                                let _samples = [{
                                    desc: '通用PIN/KEY',
                                    test() {
                                        let _sel = n => idMatches(_as + 'key' + n);
                                        if (_testNums(_sel)) {
                                            _dbg.call(this);
                                            return this.sel = _sel;
                                        }
                                    },
                                    click() {
                                        let _sel = this.sel;
                                        return _trig(() => _pw.forEach(n => clickAction(_sel(n), 'w')));
                                    },
                                }, {
                                    desc: '通用PIN容器',
                                    test() {
                                        let _w = idMatches(_as + 'container').findOnce();
                                        if (_w) {
                                            _dbg.call(this);
                                            return this.widget = _w;
                                        }
                                    },
                                    click() {
                                        /** @type UiObject$ */
                                        let _w = this.widget;
                                        let _bnd = _w.bounds();
                                        let _len = _w.childCount();
                                        let _b = _w.child(_len - 1).bounds().bottom;
                                        let _t = _w.child(_len - 4).bounds().top;
                                        let _rect = [_bnd.left, _t, _bnd.right, _b];
                                        return _trig(() => _clickVirtualKeypad(_pw, _rect));
                                    },
                                }, {
                                    desc: 'MIUI/PIN',
                                    test() {
                                        let _sel = n => idMatches(_ak + 'numeric_inputview').text(n);
                                        if (_testNums(_sel)) {
                                            _dbg.call(this);
                                            return this.sel = _sel;
                                        }
                                    },
                                    click() {
                                        let _sel = this.sel;
                                        return _trig(() => _pw.forEach(n => clickAction(_sel(n), 'w')));
                                    },
                                }, {
                                    desc: '内容描述PIN',
                                    test() {
                                        let _sel = n => desc(n);
                                        if (_testNums(_sel)) {
                                            _dbg.call(this);
                                            return this.sel = _sel;
                                        }
                                    },
                                    click() {
                                        /** @type {function(s:string):UiSelector$} */
                                        let _this_sel = this.sel;
                                        let _sel = (num) => {
                                            let _w = _this_sel(num).findOnce();
                                            if (num > 0 || _w) {
                                                return _w;
                                            }
                                            // center coordination
                                            let _ctc = (num) => {
                                                let _bnd = _sel(num).bounds();
                                                return {x: _bnd.centerX(), y: _bnd.centerY()};
                                            };
                                            // point of button '0'
                                            let _pt = n => _ctc(8)[n] + _ctc(5)[n] - _ctc(2)[n];
                                            return [_pt('x'), _pt('y')];
                                        };

                                        return _trig(() => _pw.forEach(n => clickAction(_sel(n), 'w')));
                                    },
                                }, {
                                    desc: '标记匹配PIN',
                                    test() {
                                        if (_this.misjudge) {
                                            _dbg.call(this);
                                            debugInfo('>已匹配的字符串化标记:');
                                            debugInfo('>' + _this.misjudge);
                                            return true;
                                        }
                                    },
                                    click() {
                                        return _trig(() => {
                                            let _w = idMatches(_this.misjudge).findOnce();
                                            if (_w) {
                                                _clickVirtualKeypad(_pw, _w.bounds());
                                            }
                                        });
                                    },
                                }];
                                let _max = 8;
                                while (_max--) {
                                    for (let o of _samples) {
                                        if (o.test()) {
                                            return o.click();
                                        }
                                    }
                                }
                                return _err('预置的PIN解锁方案全部无效');

                                // tool function(s) //

                                function _dbg() {
                                    debugInfo('匹配到' + this.desc + '解锁控件');
                                }

                                function _trig(f) {
                                    return (_this.unlockPin = f.bind(null))();
                                }

                                function _testNums(f) {
                                    // there is no need to check '0'
                                    // as a special treatment will be
                                    // given in getNumsBySingleDesc()
                                    let _ctr = 0;
                                    for (let n of '123456789') {
                                        _ctr += Number(f(n).exists());
                                    }
                                    return _ctr > 6;
                                }
                            }
                        }
                    }

                    function _specials() {
                        return [{
                            desc: '"Gxzw"屏下指纹设备',
                            sel: idMatches(/.*[Gg][Xx][Zz][Ww].*/),
                            pw_rect: [0.0875, 0.47, 0.9125, 0.788], // [cX, cY, cX, cY]
                        }].some((smp) => {
                            if (smp.sel.exists()) {
                                debugInfo(['匹配到特殊设备解锁方案:', smp.desc]);
                                return _trigger(smp.sel, _stg.bind(null, smp.pw_rect));
                            }
                        });

                        // tool function(s) //

                        function _stg(pw_rect) {
                            let _rect = pw_rect.map((n, i) => i % 2 ? cY(n) : cX(n));
                            let [_l, _t, _r, _b] = _rect;
                            debugInfo('已构建密码区域边界:');
                            debugInfo('Rect(' + _l + ', ' + _t + ' - ' + _r + ', ' + _b + ')');

                            _clickVirtualKeypad(_clean_code, _rect);

                            if (_this.succ()) {
                                return true;
                            }
                            _err('尝试特殊解锁方案失败');
                        }
                    }

                    function _unmatched() {
                        _isUnlk() || debugInfo('未匹配到可用的解锁控件');
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
                            _r_l = rect.left;
                            _r_t = rect.top;
                            _r_w = rect.width();
                            _r_h = rect.height();
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
                        debugInfo('已构建拨号盘数字坐标');
                        pw.forEach(v => clickAction(_keypads[Number(v) || 11]));
                    }
                },
                dismiss() {
                    if (!_code) {
                        return _err('密码为空');
                    }
                    if (!$_func(this.stg)) {
                        return _err('没有可用的解锁策略');
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
                        let _w_bad = $_sel.pickup(/.*(重试|不正确|错误|[Ii]ncorrect|[Rr]etry|[Ww]rong).*/);
                        if (_w_bad) {
                            return _err_shown_fg || debugInfo($_sel.pickup(_w_bad, 'txt'), 3);
                        }
                        if (idMatches(new RegExp(_ak + 'phone_locked_textview')).exists()) {
                            return _err_shown_fg || debugInfo('密码错误', 3);
                        }
                        return true;
                    }

                    function _chkTryAgain() {
                        let _chk = () => $_sel.pickup(/.*([Tt]ry again in.+|\d+.*后重试).*/);
                        if (_chk()) {
                            debugInfo('正在等待重试超时');
                            waitForAction(() => !_chk(), 65e3, 500);
                        }
                    }

                    function _chkOKBtn() {
                        let _w_ok = $_sel.pickup(/OK|确([认定])|好的?/);
                        if (_w_ok) {
                            debugInfo('点击"' + $_sel.pickup(_w_ok, 'txt') + '"按钮');
                            clickAction(_w_ok, 'w');
                            sleep(1e3);
                        }
                    }
                },
            },
        };
    }

    function _unlock(forc_debug) {
        let _dash = '__split_line_dash__';
        let _debug_notice = forc_debug || forc_debug === false;

        _sto.put('config', _cfg);

        _debugPrologue();
        _wakeUpIFN();

        devicex.getDisplay(true);

        while (!_isUnlk() && !_lmtRch()) {
            $_unlk.prev_cntr.handle();
            $_unlk.unlk_view.handle();
        }

        _debugEpilogue();

        return true;

        // tool function(s) //

        function _debugPrologue() {
            if (_debug_notice) {
                $_flag.debug_info_avail_bak = $_flag.debug_info_avail;
                $_flag.debug_info_avail = !!forc_debug;
            }
            debugInfo([_dash, '尝试自动解锁', _dash]);
        }

        function _debugEpilogue() {
            debugInfo([_dash, '自动解锁完毕', _dash]);
            if (_debug_notice) {
                $_flag.debug_info_avail = $_flag.debug_info_avail_bak;
                delete $_flag.debug_info_avail_bak;
            }
        }

        function _lmtRch() {
            let _max = _max_try;
            let _ctr = $_und(_unlock.ctr) ? _unlock.ctr = 0 : ++_unlock.ctr;
            _ctr > _max ? _err('解锁尝试次数已达上限') : _debugAct('解锁', _ctr, _max);
            sleep(240);
        }
    }

    function _checkRootAccess() {
        try {
            // com.stardust.autojs.core.util.ProcessShell
            // .execCommand('date', true).code === 0;
            // code above doesn't work on Auto.js Pro
            return shell('date', true).code === 0;
        } catch (e) {
            return false;
        }
    }

    function _export() {
        module.exports = {
            is_init_screen_on: $_unlk.init_scr,
            is_init_unlocked: $_unlk.init_unlk,
            isUnlocked: () => _isUnlk(),
            isLocked: () => !_isUnlk(),
            unlock: _unlock,
        };
    }

    function _execute() {
        // TODO dialogsx.builds() -- 1. functional test  2. configuration  3. module usage
    }

    function _debugAct(act_str, ctr, max) {
        debugInfo(ctr ? '重试' + act_str + ' (' + ctr + '/' + max + ')' : '尝试' + act_str);
    }

    // monster function(s) //

    // updated: Mar 1, 2021
    // modified: no impeded-related code
    // modified: no internal raw function(s)
    function keycode(code, params) {
        let _par = params || {};
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
                if (!devicex.isScreenOn()) {
                    let max = 10;

                    do devicex.wakeUp();
                    while (!waitForAction(devicex.isScreenOn, 500) && max--);

                    return max >= 0;
                }
                if (!shellInputKeyEvent(keycode)) {
                    return false;
                }
                return waitForAction(() => !devicex.isScreenOn(), 2.4e3);
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

    // updated: Mar 1, 2021
    // modified: no internal raw function(s)
    function debugInfo(msg, msg_level, forcible_flag) {
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

    // updated: Mar 1, 2021
    function classof(source, compare) {
        let _s = Object.prototype.toString.call(source).slice(8, -1);
        return compare ? _s.toUpperCase() === compare.toUpperCase() : _s;
    }

    // updated: Mar 1, 2021
    // modified: no impeded-related code
    // modified: no internal raw function(s)
    function clickAction(o, strategy, options) {
        if (o === undefined || o === null) {
            return false;
        }
        let _opt = options || {};
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

    // updated: Mar 1, 2021
    // modified: no impeded-related code
    // modified: no internal raw function(s)
    function messageAction(msg, msg_level, if_toast, if_arrow, if_split_line, params) {
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

    // updated: Mar 1, 2021
    function showSplitLine(extra, style) {
        console.log((
            style === 'dash' ? '- '.repeat(18).trim() : '-'.repeat(33)
        ) + (extra || ''));
    }

    // updated: Mar 1, 2021
    // modified: no impeded-related code
    // modified: no internal raw function(s)
    function waitForAction(condition, timeout_or_times, interval) {
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

    // updated: Mar 9, 2021
    // modified: remove all monster function(s)
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
}();