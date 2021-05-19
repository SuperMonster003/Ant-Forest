global.devicex = typeof global.devicex === 'object' ? global.devicex : {};

require('./mod-monster-func').load([
    'debugInfo', 'waitForAction', 'messageAction', 'keycode', 'clickAction',
]);
require('./ext-storages').load();
require('./ext-a11y').load();

let Intent = android.content.Intent;
let IntentFilter = android.content.IntentFilter;
let BatteryManager = android.os.BatteryManager;

// noinspection JSUnusedGlobalSymbols
let ext = {
    _unlock: _unlockGenerator(),
    /** @type {com.stardust.util.ScreenMetrics} */
    screen_metrics: runtime.getScreenMetrics(),
    /**
     * Substitution of device.wakeUp()
     * @param {number} [timeout=15e3]
     */
    wakeUp(timeout) {
        let _wake_lock = context
            .getSystemService(android.content.Context.POWER_SERVICE)
            .newWakeLock(android.os.PowerManager.FULL_WAKE_LOCK
                | android.os.PowerManager.ACQUIRE_CAUSES_WAKEUP
                | android.os.PowerManager.ON_AFTER_RELEASE, 'bright');
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
    /**
     * Alias for devicex.wakeUp()
     * @param {number} [timeout=15e3]
     * @see this.wakeUp
     */
    screenOn(timeout) {
        return this.wakeUp(timeout);
    },
    /**
     * Substitution of device.isScreenOn()
     * @returns {boolean}
     */
    isScreenOn() {
        /** @type {android.os.PowerManager} */
        let _pow_mgr = context.getSystemService(android.content.Context.POWER_SERVICE);
        return (_pow_mgr.isInteractive || _pow_mgr.isScreenOn).call(_pow_mgr);
    },
    /**
     * device.keepScreenOn()
     * @param {number} [duration=5] -
     * could be minute (less than 100) or second -- 5 and 300000 both for 5 min
     * @param {Object} [params]
     * @param {boolean} [params.debug_info_flag]
     */
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
    /**
     * device.cancelKeepingAwake()
     * @param {Object} [params]
     * @param {boolean} [params.debug_info_flag]
     */
    cancelOn(params) {
        let _par = params || {};
        device.cancelKeepingAwake();
        if (_par.debug_info_flag !== false) {
            debugInfo('屏幕常亮已取消');
        }
    },
    // screenOff() {
    //
    // },
    isScreenOff() {
        return !this.isScreenOn();
    },
    isLocked() {
        return context.getSystemService(context.KEYGUARD_SERVICE).isKeyguardLocked();
    },
    isUnlocked() {
        return !this.isLocked();
    },
    /**
     * @param {boolean} [forcibly_debug]
     * @returns {boolean}
     */
    unlock(forcibly_debug) {
        return this._unlock(forcibly_debug);
    },
    /**
     * Vibrate the device with a certain pattern
     * @param {number|number[]} pattern -
     * an array of longs of times for which to turn the vibrator on or off
     * @param {number} [repeat=1] -
     * total repeat times
     * @param {boolean} [async=true] -
     * vibrator working asynchronously or not
     * @see global.device
     * @see com.stardust.autojs.runtime.api.Device
     * @example
     * // async and repeat once
     * devicex.vibrate(100);
     * devicex.vibrate([100]);
     * devicex.vibrate([100, 300, 100, 300, 200]);
     * // repeat twice
     * devicex.vibrate(100, 2); // devicex.vibrate([100, 1000], 2)
     * devicex.vibrate([100, 300, 100, 300, 200], 2);
     * // sync (not async)
     * devicex.vibrate([100, 300, 100, 300, 200], 2, false);
     * // 'SOS' in Morse -- zh-CN: SOS 的摩斯编码
     * devicex.vibrate([100, 60, 100, 60, 100, 200, 200, 60, 200, 60, 200, 200, 100, 60, 100, 60, 100]);
     */
    vibrate(pattern, repeat, async) {
        let _repeat = repeat || 1;
        let _async = typeof async === 'undefined' ? true : !!async;
        let _pattern = typeof pattern === 'number' ? [pattern] : pattern;
        _async ? threads.start(_vibrate) : _vibrate();

        // tool function(s) //

        function _vibrate() {
            let _getNum = (num) => num < 10 ? num * 1e3 : num;
            while (_repeat--) {
                _pattern.forEach((num, i) => {
                    let _num = _getNum(num);
                    let _prev_num = _getNum(_pattern[i - 1] || 0);
                    i % 2 ? sleep(_num + _prev_num) : device.vibrate(_num);
                });
                if (repeat && _pattern.length % 2) {
                    sleep(1e3); // default off duration
                }
            }
        }
    },
    /**
     * Returns a state number which indicated phone calling state
     * @returns {number}
     * <br>
     * -- 0: IDLE; <br>
     * -- 1: RINGING; <br>
     * -- 2: OFF-HOOK; <br>
     * // some device may behave abnormally <br>
     * -- 2: IDLE; <br>
     * -- 1: OFF-HOOK; <br>
     * // even always returns 0
     */
    getCallState() {
        let ITelephony = com.android.internal.telephony.ITelephony;
        let ServiceManager = android.os.ServiceManager;

        let _svr_mgr = ITelephony.Stub.asInterface(ServiceManager.checkService('phone'));
        let _svc_ctx = context.getSystemService(context.TELEPHONY_SERVICE);

        return +_svr_mgr.getCallState() | +_svc_ctx.getCallState();
    },
    /**
     * Returns display screen width and height data and
     * converter functions with different aspect ratios <br>
     * Scaling based on Sony Xperia XZ1 Compact - G8441 (720 × 1280)
     * @param {boolean} [global_assign=false] -- set true for global assignment
     * @param {Object} [params]
     * @param {boolean} [params.global_assign=false]
     * @param {boolean} [params.debug_info_flag=false]
     * @example
     * require('./modules/ext-device').load();
     * let {
     *   WIDTH, HEIGHT, cX, cY, cYx,
     *   USABLE_WIDTH, USABLE_HEIGHT,
     *   screen_orientation,
     *   status_bar_height,
     *   navigation_bar_height,
     *   navigation_bar_height_computed,
     *   action_bar_default_height,
     * } = devicex.getDisplay();
     * console.log(WIDTH, HEIGHT, cX(80), cY(700), cY(700, 1920));
     * devicex.getDisplay(true); // global assignment
     * console.log(W, H, cX(0.2), cY(0.45), cYx(0.45));
     * console.log(cX(0.2, a)); // a will be ignored
     * console.log(cX(200, 720), cX(200, -1), cX(200)); // all the same
     * console.log(cX(200, 1080), cX(200, -2)); // all the same
     * console.log(cY(300, 1280), cX(300, -1), cY(300)); // all the same
     * console.log(cY(300, 1920), cX(300, -2)); // all the same
     * console.log(cYx(400, 720), cYx(400, -1), cYx(400)); // all the same
     * console.log(cYx(400, 1080), cYx(400, -2)); // all the same
     * console.log(cYx(0.6, 16/9), cYx(0.6, -1), cYx(0.6)); // all the same
     * console.log(cYx(0.6, 21/9), cYx(0.6, -2), cYx(0.6, 9/21)); // all the same
     * @returns {{
           [WIDTH]: number, [USABLE_WIDTH]: number,
           [HEIGHT]: number, [USABLE_HEIGHT]: number,
           [screen_orientation]: ScrOrientation,
           [status_bar_height]: number,
           [navigation_bar_height]: number,
           [navigation_bar_height_computed]: number,
           [action_bar_default_height]: number,
           cYx: (function((number|*), number?): number),
           cX: (function((number|*), number?): number),
           cY: (function((number|*), number?): number)
     }}
     */
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

        let _scale = {cX: cX, cY: cY, cYx: cYx};
        if (waitForAction(() => _disp = _getDisp(), 3e3, 500)) {
            _showDisp();
            _assignGlob();
            return Object.assign(_disp, _scale);
        }
        console.error('devicex.getDisplay()返回结果异常');
        return _scale;

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
         * @returns {number}
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
         * @returns {number}
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
         * @returns {number}
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
         * @param {number} dxn - 1: horizontal; -1: vertical
         * @param {number} num - pixel (x) or percentage num (0.x)
         * @param {number} [base] - pixel (x) or preset negative nums (-1,-2,-3)
         * @param {{
         *     is_ratio?: boolean,
         *     to_ratio?: boolean,
         * }} [options]
         * @returns {number}
         */
        function _cTrans(dxn, num, base, options) {
            let _full = ~dxn ? _W : _H;
            let _num = Number(num);
            if (isNaN(_num)) {
                throw Error('Can not parse num param for cTrans(): ' + num);
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
                debugInfo('屏幕宽高: ' + _W + ' × ' + _H);
                debugInfo('可用屏幕高度: ' + _disp.USABLE_HEIGHT);
                $_flag.display_params_got = true;
            }
        }

        function _getDisp() {
            try {
                // noinspection JSDeprecatedSymbols
                _W = _win_svc_disp.getWidth();
                // noinspection JSDeprecatedSymbols
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
                 * @typedef {number} ScrOrientation
                 */
                /** @type {ScrOrientation} */
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
                     * @type {ScrOrientation}
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
    },
    /**
     * Control whether the accelerometer will be used to change screen orientation.
     * @param {number} mode - 1: auto-rotate; 2: portrait
     * @example
     * devicex.setRotation(1); // auto rotation on
     * @example
     * devicex.setRotation(0); // auto rotation off (stay portrait)
     * @example
     * devicex.setRotation(+!devicex.getRotation()); // toggle
     */
    setRotation(mode) {
        let System = android.provider.Settings.System;
        let _ctx_reso = context.getContentResolver();
        System.putInt(_ctx_reso, System.ACCELEROMETER_ROTATION, +!!mode);
    },
    /**
     * Returns screen orientation state.
     * @returns {number} - 1: auto-rotate; 2: portrait
     */
    getRotation() {
        let System = android.provider.Settings.System;
        let _ctx_reso = context.getContentResolver();
        return System.getInt(_ctx_reso, System.ACCELEROMETER_ROTATION, 0);
    },
    /**
     * @param {string} [pkg_name=context.getPackageName()]
     * @returns {boolean}
     */
    isIgnoringBatteryOptimizations(pkg_name) {
        return context.getSystemService(android.content.Context.POWER_SERVICE)
            .isIgnoringBatteryOptimizations(pkg_name || context.getPackageName());
    },
    /**
     * @param {string} [pkg_name=context.getPackageName()]
     * @param {boolean} [forcible=false]
     * @returns {boolean}
     */
    requestIgnoreBatteryOptimizations(pkg_name, forcible) {
        try {
            if (!forcible && this.isIgnoringBatteryOptimizations()) {
                return true;
            }
            let _intent = new android.content.Intent()
                .setAction(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                .setData(android.net.Uri.parse('package:' + (pkg_name || context.getPackageName())));
            app.startActivity(_intent);
            return this.isIgnoringBatteryOptimizations();
        } catch (e) {
            console.warn(e.message);
            return false;
        }
    },
    getBatteryStatusIntent() {
        return context.registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
    },
    /**
     * @param {'HEALTH'|'ICON_SMALL'|'LEVEL'|'PLUGGED'|'PRESENT'|'SCALE'|'STATUS'|'TECHNOLOGY'|'TEMPERATURE'|'VOLTAGE'} extra_key
     * @returns {number}
     */
    getBatteryStatus(extra_key) {
        return this.getBatteryStatusIntent().getIntExtra(BatteryManager['EXTRA_' + extra_key], -1);
    },
    /** @returns {number} */
    getBatteryPercentage() {
        let _i_battery_status = this.getBatteryStatusIntent();

        let _level = _i_battery_status.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        let _scale = _i_battery_status.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        return _level * 100 / _scale;
    },
    isCharging() {
        return this.getBatteryStatus('STATUS') === BatteryManager.BATTERY_STATUS_CHARGING
            || this.isCharged();
    },
    isCharged() {
        return this.getBatteryStatus('STATUS') === BatteryManager.BATTERY_STATUS_FULL;
    },
    isAcPlugged() {
        return this.getBatteryStatus('PLUGGED') === BatteryManager.BATTERY_PLUGGED_AC;
    },
    isUsbPlugged() {
        return this.getBatteryStatus('PLUGGED') === BatteryManager.BATTERY_PLUGGED_USB;
    },
    isWirelessPlugged() {
        return this.getBatteryStatus('PLUGGED') === BatteryManager.BATTERY_PLUGGED_WIRELESS;
    },
    /** @param {number} ratio */
    setScreenMetricsRatio(ratio) {
        let _r = Number(ratio);
        this.setScreenMetrics(_r * W, _r * H);
    },
    /**
     * @param {number} width
     * @param {number} height
     */
    setScreenMetrics(width, height) {
        let _width = width <= 0 ? W : width < 1 ? W * width : width;
        let _height = height <= 0 ? H : height < 1 ? H * height : height;
        runtime.setScreenMetrics(_width, _height);
    },
    /** @returns {{width: number, height: number}} */
    getScreenMetricsRatio() {
        let _width = this.screen_metrics.rescaleX(W) / W;
        let _height = this.screen_metrics.rescaleY(H) / H;
        return {width: _width, height: _height};
    },
    /** @returns {{width: number, height: number}} */
    getScreenMetrics() {
        let _width = this.screen_metrics.rescaleX(W);
        let _height = this.screen_metrics.rescaleY(H);
        return {width: _width, height: _height};
    },
    resetScreenMetrics() {
        this.setScreenMetricsRatio(0);
    },
    saveCurrentScreenMetrics() {
        this['_screen_metrics_w'] = this.getScreenMetrics().width;
        this['_screen_metrics_h'] = this.getScreenMetrics().height;
    },
    restoreSavedScreenMetrics() {
        let _w = this['_screen_metrics_w'];
        let _h = this['_screen_metrics_h'];
        if (_w !== undefined && _h !== undefined) {
            this.setScreenMetrics(_w, _h);
            delete this['_screen_metrics_w'];
            delete this['_screen_metrics_h'];
        }
    },
    // TODO...
    // saveCurrentAccelerometerRotation() {},
    // restoreSavedAccelerometerRotation() {},
    $bind() {
        Object.assign(this.unlock, this._unlock);
        delete this.$bind;
        return this;
    },
};

if (!global._$_display_params_set) {
    ext.getDisplay(global._$_display_params_set = true);
}

module.exports = Object.assign(ext, ext.$bind(), {
    is_init_screen_on: global._$_is_init_scr_on = global._$_is_init_scr_on || ext.isScreenOn(),
    is_init_unlocked: global._$_is_init_unlk = global._$_is_init_unlk || ext.isUnlocked(),
});
module.exports.load = () => global.devicex = ext;

// tool function(s) //

function _unlockGenerator() {
    let $_und = x => typeof x === 'undefined';
    let $_nul = x => x === null;
    let $_func = x => typeof x === 'function';
    let $_num = x => typeof x === 'number';
    let $_str = x => typeof x === 'string';
    let $_rex = x => x instanceof RegExp;
    let $_arr = x => Array.isArray(x);
    let $_flag = global.$$flag = global.$$flag || {};

    let $_unlk = _unlkSetter();

    let _sto = storagesx.create('unlock');
    let _cfg = Object.assign({
        /* default unlock configs which updated at Mar 1, 2021 */
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
    }, _sto.get('config'));

    let _code = require('./mod-pwmap').decrypt(_cfg.unlock_code) || '';
    let _clean_code = _code.split(/\D+/).join('').split('');
    let _max_try = _cfg.unlock_max_try_times;
    let _pat_sz = _cfg.unlock_pattern_size;

    let _intro = device.brand + ' ' + device.product + ' ' + device.release;

    return Object.assign(_unlock, {
        handlePContainer: () => $_unlk.p_container.handle(),
        handleUnlockView: () => $_unlk.unlock_view.handle(),
    });

    // tool function(s) //

    function _err(s) {
        devicex.cancelOn();
        messageAction('解锁失败', 4, 1, 0, -1);

        ($_str(s) ? [s] : s).forEach(m => messageAction(m, 4, 0, 1));
        messageAction(_intro, 4, 0, 1, 1);

        captureErrScreen('unlock_failed', {log_level: 1});

        if (devicex.is_init_screen_on) {
            messageAction('自动关闭屏幕' + (keycode(26) ? '' : '失败'), 1, 0, 0, 1);
        }

        exit();
        sleep(3.6e3);

        // tool function(s) //

        /**
         * Save current screen capture as a file with a key name and a formatted timestamp
         * @param {string} key_name - a key name as a clip of the file name
         * @param {Object} [options]
         * @param {number|string|null} [options.log_level]
         * @param {number} [options.max_samples=10]
         */
        function captureErrScreen(key_name, options) {
            if (typeof imagesx === 'object') {
                imagesx.permit();
            } else {
                images.requestScreenCapture();
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

    function _wakeUpIFN() {
        if (!devicex.isScreenOn()) {
            let _ctr = 0, _max = 4;
            while (1) {
                _debugAct('唤起设备', _ctr, _max);

                devicex.wakeUp();

                if (waitForAction(devicex.isScreenOn.bind(devicex), 1.5e3)) {
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
            p_container: {
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
                        sel: $$sel.pickup(/上滑.{0,4}解锁/, 'selector'),
                    }].some((smp) => {
                        let {desc: _desc, sel: _sel} = smp;
                        if (_sel instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                            if (_sel.exists()) {
                                if (_desc) {
                                    debugInfo('匹配到' + _desc + '解锁提示层控件');
                                } else {
                                    debugInfo('匹配到解锁提示层文字:');
                                    debugInfo($$sel.pickup(_sel, 'txt'));
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
                                return $$sel.pickup('按住录音')
                                    || $$sel.pickup(idMatches(/com.tencent.mobileqq:id.+/));
                            },
                            handle() {
                                clickAction($$sel.pickup('关闭'), 'w');
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

                    return this.succ_fg;

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
                            let _is_lmt_reached = _ctr > _max;
                            if (_is_lmt_reached) {
                                _t_pool[_time] = 0;
                                _sto.put('config', {continuous_swipe: _t_pool});
                                _err('消除解锁页面提示层失败');
                            }
                            return _is_lmt_reached;
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
                    return this.succ_fg || !this.trigger() || this.dismiss();
                },
                succ() {
                    return waitForAction(function () {
                        return !this.trigger();
                    }.bind(this), 1.5e3) || $_unlk.unlock_view.trigger();
                },
            },
            unlock_view: {
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
                            let _has_root = (() => {
                                try {
                                    return shell('date', true).code === 0;
                                } catch (e) {
                                    return false;
                                }
                            })();
                            if ($_arr(_pw)) {
                                _pw = _pw.join('');
                            }

                            let _cfm_btn = (type) => (
                                $$sel.pickup([/确.|完成|[Cc]onfirm|[Ee]nter/, {
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
                                /** @type {string} */
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
                                        return clickAction($$sel.pickup('(key.?)?' + _suff));
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
                            desc: 'OPPO',
                            sel: idMatches(_as + 'keyguard_security_container'),
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
                                        /** @type {UiObject$} */
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
                        devicex.isUnlocked() || debugInfo('未匹配到可用的解锁控件');
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
                            return devicex.isUnlocked();
                        }
                        _err_shown_fg = true;
                    };

                    return waitForAction(_cond, _t, 240);

                    // tool function(s) //

                    function _correct() {
                        let _w_bad = $$sel.pickup(/.*(重试|不正确|错误|[Ii]ncorrect|[Rr]etry|[Ww]rong).*/);
                        if (_w_bad) {
                            return _err_shown_fg || debugInfo($$sel.pickup(_w_bad, 'txt'), 3);
                        }
                        if (idMatches(new RegExp(_ak + 'phone_locked_textview')).exists()) {
                            return _err_shown_fg || debugInfo('密码错误', 3);
                        }
                        return true;
                    }

                    function _chkTryAgain() {
                        let _chk = () => $$sel.pickup(/.*([Tt]ry again in.+|\d+.*后重试).*/);
                        if (_chk()) {
                            debugInfo('正在等待重试超时');
                            waitForAction(() => !_chk(), 65e3, 500);
                        }
                    }

                    function _chkOKBtn() {
                        let _w_ok = $$sel.pickup(/OK|确([认定])|好的?/);
                        if (_w_ok) {
                            debugInfo('点击"' + $$sel.pickup(_w_ok, 'txt') + '"按钮');
                            clickAction(_w_ok, 'w');
                            sleep(1e3);
                        }
                    }
                },
            },
        };
    }

    function _unlock(forcibly_debug) {
        let _dash = '__split_line_dash__';
        let _debug_notice = forcibly_debug || forcibly_debug === false;

        _sto.put('config', _cfg);

        _debugPrologue();
        _wakeUpIFN();

        while (!devicex.isUnlocked() && !_lmtRch()) {
            $_unlk.p_container.handle();
            $_unlk.unlock_view.handle();
        }

        _debugEpilogue();

        return true;

        // tool function(s) //

        function _debugPrologue() {
            if (_debug_notice) {
                $_flag.debug_info_avail_bak = $_flag.debug_info_avail;
                $_flag.debug_info_avail = !!forcibly_debug;
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

    function _debugAct(act_str, ctr, max) {
        debugInfo(ctr ? '重试' + act_str + ' (' + ctr + '/' + max + ')' : '尝试' + act_str);
    }
}