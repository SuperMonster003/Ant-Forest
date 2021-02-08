global.devicex = typeof global.devicex === 'object' ? global.devicex : {};

require('./mod-monster-func').load('messageAction', 'waitForAction', 'debugInfo');

let ext = {
    /**
     * @type {{
     *     _parseArgs: function(args: IArguments): {svc: string[], forcible: boolean},
     *     _getString: function: string,
     *     enable: function(...boolean|string|string[]): boolean,
     *     restart: function(...boolean|string|string[]): boolean,
     *     disable: function(...boolean|string|string[]): boolean,
     *     state: function(services: (string | string[])=): boolean,
     *     services: function: string[],
     * }}
     */
    a11y: (() => {
        let Secure = android.provider.Settings.Secure;
        let _ctx_reso = context.getContentResolver();
        let _aj_svc = context.packageName + '/com.stardust.autojs' +
            '.core.accessibility.AccessibilityService';

        return {
            /**
             * @param args {IArguments}
             * @return {{svc: [string], forcible: boolean}}
             */
            _parseArgs(args) {
                let _svc = [_aj_svc];
                let _forcible = false;
                let _type0 = typeof args[0];
                if (_type0 !== 'undefined') {
                    if (_type0 === 'object') {
                        _svc = args[0];
                        _forcible = !!args[1];
                    } else if (_type0 === 'string') {
                        _svc = [args[0]];
                        _forcible = !!args[1];
                    } else if (_type0 === 'boolean') {
                        _forcible = args[0];
                    }
                }
                return {
                    forcible: _forcible,
                    svc: _svc,
                };
            },
            /** @return {string} */
            _getString() {
                // getString() may be null on some Android OS
                return Secure.getString(_ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES) || '';
            },
            /**
             * @param {...boolean|string|string[]} [arguments]
             * @example
             * // import module with a new instance
             * let {a11y} = require('./modules/ext-device');
             * // enable Auto.js itself
             * a11y.enable();
             * a11y.enable('org.autojs.autojs/com.stardust.autojs.core.accessibility.AccessibilityService');
             * a11y.enable('org.autojs.autojs/com.stardust... , true); // enable forcibly
             * a11y.enable(true); // enable forcibly
             * // enable other specified service(s)
             * a11y.enable('com.ext.star.wars/com.dahuo.sunflower.assistant.services.AssistantServicesGestures');
             * a11y.enable('com.ext.star.wars/com.dahuo.sunflower... , true); // enable forcibly
             * // enable multi services
             * a11y.enable([
             *     'org.autojs.autojs/com.stardust.autojs.core.accessibility.AccessibilityService',
             *     'com.ext.star.wars/com.dahuo.sunflower.assistant.services.AssistantServicesGestures',
             *     'com.MoniKet.notificationsaver/com.example.monika.notificationsaver.USSDService',
             *     'com.sp.protector.free/com.sp.protector.free.engine.AppChangeDetectingAccessibilityService',
             *     'com.wokee.qpay/com.wokee.qpay.systemwindows.DesktopAccessibilityService',
             *     'eu.thedarken.sdm/eu.thedarken.sdm.accessibility.core.ACCService',
             *     'me.zhanghai.android.wechatnotificationtweaks2/me.zhanghai.android.wechatnotificationtweaks.app.AccessibilityService',
             *     'pl.revanmj.toastsource/pl.revanmj.toastsource.ToastAccessibilityService',
             * ]);
             * a11y.enable([...], true); // enable forcibly
             * @return {boolean} - !!(all_services_started_successfully)
             */
            enable() {
                try {
                    let _this = this;
                    let {forcible, svc} = this._parseArgs(arguments);
                    let _svc;
                    if (!this.state(svc)) {
                        _svc = this.enabled_svc.split(':')
                            .filter(x => !~svc.indexOf(x))
                            .concat(svc).join(':');
                    } else if (forcible) {
                        _svc = this.enabled_svc;
                    }
                    if (_svc) {
                        Secure.putString(_ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, _svc);
                        Secure.putInt(_ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                        if (!waitForAction(() => _this.state(svc), 2e3)) {
                            let _m = 'Operation timed out';
                            toast(_m);
                            console.error(_m);
                        }
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            },
            /**
             * @param {...boolean|string|string[]} [arguments]
             * @see this.enable
             * @example
             * // import module with a new instance
             * let {a11y} = require('./modules/ext-device');
             * // disable all services (clear current a11y svc list)
             * a11y.disable('all'); // doesn't matter whether with true param or not
             * // disable Auto.js itself
             * a11y.disable();
             * a11y.disable('org.autojs.autojs/com.stardust.autojs.core.accessibility.AccessibilityService');
             * a11y.disable('org.autojs.autojs/com.stardust... , true); // disable forcibly
             * a11y.disable(true); // disable forcibly
             * // disable other specified service(s)
             * a11y.disable('com.ext.star.wars/com.dahuo.sunflower.assistant.services.AssistantServicesGestures');
             * a11y.disable('com.ext.star.wars/com.dahuo.sunflower... , true); // disable forcibly
             * // disable multi services
             * a11y.disable([...]);
             * a11y.disable([...], true); // disable forcibly
             * @return {boolean} - !!(all_services_stopped_successfully)
             */
            disable() {
                try {
                    let _args0 = arguments[0];
                    let $_str = x => typeof x === 'string';
                    if ($_str(_args0) && _args0.toLowerCase() === 'all') {
                        Secure.putString(_ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, '');
                        Secure.putInt(_ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                        return true;
                    }
                    let {forcible, svc} = this._parseArgs(arguments);
                    let _enabled_svc = this._getString();
                    let _contains = function () {
                        for (let i = 0, l = svc.length; i < l; i += 1) {
                            if (~_enabled_svc.indexOf(svc[i])) {
                                return true;
                            }
                        }
                    };
                    let _svc;
                    if (_contains()) {
                        _svc = _enabled_svc.split(':').filter(x => !~svc.indexOf(x)).join(':');
                    } else if (forcible) {
                        _svc = _enabled_svc;
                    }
                    if (_svc) {
                        Secure.putString(_ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, _svc);
                        Secure.putInt(_ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                        _enabled_svc = this._getString();
                        if (!waitForAction(() => !_contains(), 2e3)) {
                            let _m = 'Operation timed out';
                            toast(_m);
                            console.error(_m);
                        }
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            },
            /**
             * @param {...boolean|string|string[]} [arguments]
             * @see this.enable
             * @see this.disable
             * @return {boolean}
             */
            restart() {
                return this.disable.apply(this, arguments) && this.enable.apply(this, arguments);
            },
            /**
             * @param {string|string[]} [services]
             * @return {boolean} - all services enabled or not
             */
            state(services) {
                let _enabled_svc = this.enabled_svc = this._getString();
                let _services = [];
                if (Array.isArray(services)) {
                    _services = services.slice();
                } else if (typeof services === 'undefined') {
                    _services = [_aj_svc];
                } else if (typeof services === 'string') {
                    _services = [services];
                } else {
                    throw TypeError('Unknown a11y state type');
                }
                return _services.every(svc => ~_enabled_svc.indexOf(svc));
            },
            /**
             * Returns all enabled a11y services
             * @return {string[]} - [] for empty data (rather than falsy)
             */
            services() {
                return this._getString().split(':').filter(x => !!x);
            },
        };
    })(),
    /** @type com.stardust.util.ScreenMetrics */
    screen_metrics: runtime.getScreenMetrics(),
    /**
     * device.keepScreenOn()
     * @param {number} [duration=5] -
     * could be minute (less than 100) or second -- 5 and 300000 both for 5 min
     * @param {object} [params]
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
     * @param {object} [params]
     * @param {boolean} [params.debug_info_flag]
     */
    cancelOn(params) {
        let _par = params || {};
        device.cancelKeepingAwake();
        if (_par.debug_info_flag !== false) {
            debugInfo('屏幕常亮已取消');
        }
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
    getCallState() {
        let ITelephony = com.android.internal.telephony.ITelephony;
        let ServiceManager = android.os.ServiceManager;

        let _svr_mgr = ITelephony.Stub.asInterface(
            ServiceManager.checkService('phone')
        );
        let _svc_ctx = context.getSystemService(
            context.TELEPHONY_SERVICE
        );

        return +_svr_mgr.getCallState() | +_svc_ctx.getCallState();
    },
    /**
     * Returns display screen width and height data and
     * converter functions with different aspect ratios <br>
     * Scaling based on Sony Xperia XZ1 Compact - G8441 (720 × 1280)
     * @param {?boolean} [global_assign=false] -- set true for global assignment
     * @param {object} [params]
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
     * @return {{
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
         * @param {number|*} num - pixel num (x) or percentage num (0.x)
         * @param {number} [base] - pixel num (x) or preset neg-num (-1,-2)
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
         * @public
         */
        function cX(num, base) {
            return _cTrans(1, +num, base);
        }

        /**
         * adaptive coordinate transform for y axis
         * @param {number|*} num - pixel num (x) or percentage num (0.x)
         * @param {number} [base] - pixel num (x) or preset neg-num (-1,-2)
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
         * @public
         */
        function cY(num, base) {
            return _cTrans(-1, +num, base);
        }

        /**
         * adaptive coordinate transform for y axis based (and only based) on x axis
         * @param {number|*} num - pixel num (x) or percentage num (0.x)
         * @param {number} [base] - pixel num (x) or preset neg-num (-1,-2)
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
         * let y3 = cYx(0.5, 5040/2160); // or cYx(0.5, 21/9); or cYx(0.5, 2160/5040); or xYc(0.5, -2) -- GOOD!
         * let y4 = cYx(2020); // or cYx(2020, 720); or cYx(2020, -1); -- even if unreasonable
         * let y5 = cYx(2020, 5040/2160); // or cYx(2020, 16/9); -- Error
         * let y6 = cYx(2020, 2160); // GOOD!
         *
         * // on 1080*1920 device: (ignore height: 1920)
         * // y1: 0.5 * 16/9 * 1080 = 960
         * // y3: 0.5 * 21/9 * 1080 = 1260 -- which is the proper way of usage
         * // y4: 2020 / 720 * 1080 = ... -- no one will set 2020 on a device with only 720px available
         * // y6: 2020 / 2160 * 1080 = 1010 -- which is another proper way of usage
         *
         * // on 720*1280 device: (ignore height: 1280)
         * // just replacing 1080 in calculations each with 720
         *
         * // on 1440*1920 device: (ignore height: 1920)
         * // likewise (replace 1080 with 1440)
         * console.log(y1, y3, y4, y6);
         * @return {number}
         * @public
         */
        function cYx(num, base) {
            num = +num;
            base = +base;
            if (Math.abs(num) >= 1) {
                if (!base) {
                    base = 720;
                } else if (base < 0) {
                    if (!~base) {
                        base = 720;
                    } else if (base === -2) {
                        base = 1080;
                    } else if (base === -3) {
                        base = 1096;
                    } else {
                        throw Error('Can not parse base param for cYx()');
                    }
                } else if (base < 5) {
                    throw Error('Base and num params should be both pixels for cYx()');
                }
                return Math.round(num * _W / base);
            }

            if (!base || !~base || base === -2) {
                base = 16 / 9;
            } else if (base === -3) {
                base = 2560 / 1096;
            } else if (base < 0) {
                throw Error('Can not parse base param for cYx()');
            } else {
                base = base < 1 ? 1 / base : base;
            }
            return Math.round(num * _W * base);
        }

        /**
         * adaptive coordinate transform function
         * @see cX
         * @see cY
         * @param dxn {number} - direction -- 1: x; -1: y
         * @param num {number} - pixel num (x) or percentage num (0.x)
         * @param {number} [base] - pixel num (x) or preset neg-num (-1,-2)
         * @return {number}
         * @private
         */
        function _cTrans(dxn, num, base) {
            let _full = ~dxn ? _W : _H;
            if (isNaN(num)) {
                throw Error('Can not parse num param for cTrans()');
            }
            if (Math.abs(num) < 1) {
                return Math.min(Math.round(num * _full), _full);
            }
            let _base = base;
            if (!base || !~base) {
                _base = ~dxn ? 720 : 1280; // e.g. Sony Xperia XZ1 Compact
            } else if (base === -2) {
                _base = ~dxn ? 1080 : 1920; // e.g. Sony Xperia Z5
            } else if (base === -3) {
                _base = ~dxn ? 1096 : 2560; // e.g. Sony Xperia 1 II
            }
            let _ct = Math.round(num * _full / _base);
            return Math.min(_ct, _full);
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
     * @returns number - 1: auto-rotate; 2: portrait
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
            app.startActivity(
                new android.content.Intent()
                    .setAction(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                    .setData(android.net.Uri.parse('package:' + (pkg_name || context.getPackageName())))
            );
            return this.isIgnoringBatteryOptimizations();
        } catch (e) {
            console.warn(e.message);
            return false;
        }
    },
    /** @returns {boolean} */
    isCharging() {
        let {IntentFilter, Intent} = android.content;
        let {BatteryManager} = android.os;

        let _i_filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        let _battery_status = context.registerReceiver(null, _i_filter);

        let _status = _battery_status.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
        return _status === BatteryManager.BATTERY_STATUS_CHARGING
            || _status === BatteryManager.BATTERY_STATUS_FULL;
    },
    /** @returns {number} */
    getBatteryPercentage() {
        let {IntentFilter, Intent} = android.content;
        let {BatteryManager} = android.os;

        let _i_filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        let _battery_status = context.registerReceiver(null, _i_filter);

        let _level = _battery_status.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        let _scale = _battery_status.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        return _level * 100 / _scale;
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
        runtime.setScreenMetrics(
            width <= 0 ? W : width < 1 ? W * width : width,
            height <= 0 ? H : height < 1 ? H * height : height
        );
    },
    /** @returns {{width: number, height: number}} */
    getScreenMetricsRatio() {
        return {
            width: this.screen_metrics.rescaleX(W) / W,
            height: this.screen_metrics.rescaleY(H) / H,
        };
    },
    /** @returns {{width: number, height: number}} */
    getScreenMetrics() {
        return {
            width: this.screen_metrics.rescaleX(W),
            height: this.screen_metrics.rescaleY(H),
        };
    },
    resetScreenMetrics() {
        this.setScreenMetricsRatio(0);
    },
    saveCurrentScreenMetrics() {
        this._screen_metrics_w = this.getScreenMetrics().width;
        this._screen_metrics_h = this.getScreenMetrics().height;
    },
    restoreSavedScreenMetrics() {
        let _w = this._screen_metrics_w;
        let _h = this._screen_metrics_h;
        if (_w !== undefined && _h !== undefined) {
            this.setScreenMetrics(_w, _h);
            delete this._screen_metrics_w;
            delete this._screen_metrics_h;
        }
    },
};

if (typeof global.W !== 'number' || typeof global.H !== 'number') {
    let _disp = ext.getDisplay();
    global.W = _disp.WIDTH;
    global.H = _disp.HEIGHT;
}

module.exports = ext;
module.exports.load = () => global.devicex = ext;