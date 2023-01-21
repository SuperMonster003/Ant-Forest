let {
    $$impeded, $$str, $$num, $$rex, isNonEmptyObject, requirex,
} = require('./mod-global');
let { consolex } = require('./ext-console');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Settings = android.provider.Settings;
let Secure = Settings.Secure;
let Rect = android.graphics.Rect;
let Point = org.opencv.core.Point;
let AccessibilityService = org.autojs.autojs.core.accessibility.AccessibilityService;
let AccessibilityWindowInfo = android.view.accessibility.AccessibilityWindowInfo;

let _ = {
    ctx_reso: context.getContentResolver(),
    autojs_a11y_svc_name: context.getPackageName() + '/' +
        new AccessibilityService().getClass().getName(),
    get sel() {
        return this.selector = this.selector || exp.selector();
    },
    /**
     * @param {IArguments} args
     * @return {{svc: string[], forcible: boolean}}
     */
    parseArgs(args) {
        let _svc = [ this.autojs_a11y_svc_name ];
        let _forcible = false;
        let _type0 = typeof args[0];
        if (_type0 !== 'undefined') {
            if (Array.isArray(_type0)) {
                _svc = args[0];
                _forcible = !!args[1];
            } else if (_type0 === 'string') {
                _svc = [ args[0] ];
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
    getString() {
        // getString() may be null on some Android OS
        return Secure.getString(this.ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES) || '';
    },
    tryEnableAndRestart() {
        if (exp.enable(true)) {
            let { enginesx } = requirex('ext-engines');
            consolex.$([ '已自动开启无障碍服务', '尝试一次项目重启操作' ], 1, 0, 0, 2);
            enginesx.restart({
                isDebug: true,
                is_instant_running: false,
                max_restart_e_times: 1,
            });
            sleep(4.2e3);
            exit();
        }
    },
};

let exp = {
    bridge: {
        /**
         * @param {function(info:android.view.accessibility.AccessibilityWindowInfo):boolean} filter
         */
        setWindowFilter(filter) {
            auto.setWindowFilter(function (wi) {
                try {
                    return filter(wi);
                } catch (e) {
                    return false;
                }
            });
        },
        /**
         * @param {string[]} pkg_blist
         */
        setWindowBlacklist(pkg_blist) {
            this.setWindowFilter(wi => !pkg_blist.includes(wi.getRoot().getPackageName()));
        },
        /**
         * @param {string[]} pkg_wlist
         */
        setWindowWhitelist(pkg_wlist) {
            this.setWindowFilter(wi => pkg_wlist.includes(wi.getRoot().getPackageName()));
        },
        setWindowAllowAll() {
            this.setWindowFilter(() => true);
        },
        resetWindowFilter() {
            this.setWindowFilter((wi) => {
                return this.isWindowType(wi, 'APPLICATION')
                    || this.isWindowType(wi, 'SYSTEM') && wi.isActive();
            });
        },
        /**
         * @param {android.view.accessibility.AccessibilityWindowInfo} wi
         * @param {string|number} type
         * @return {boolean}
         */
        isWindowType(wi, type) {
            if (typeof type === 'number') {
                return type === wi.getType();
            }
            let _types = {
                APPLICATION: 0x1,
                INPUT_METHOD: 0x2,
                SYSTEM: 0x3,
                ACCESSIBILITY_OVERLAY: 0x4,
                SPLIT_SCREEN_DIVIDER: 0x5,
            };
            let _type = String(type).toUpperCase();
            if (!(_type in _types)) {
                throw TypeError('Unknown type of "type" for isWindowType()');
            }
            return AccessibilityWindowInfo['TYPE_' + _type] === wi.getType();
        },
    },
    service: {
        refreshServiceInfo() {
            automator.waitForService(3e3);
            auto.service.setServiceInfo(auto.service.getServiceInfo());
        },
    },
    click$() {
        return (this._click$ = this._click$ || $$impeded.detach(this.click, 2)).apply(this, arguments);
    },
    wait$() {
        return (this._wait$ = this._wait$ || $$impeded.detach(this.wait, 3)).apply(this, arguments);
    },
    swipe$() {
        return (this._swipe$ = this._swipe$ || $$impeded.detach(this.swipe, 3)).apply(this, arguments);
    },
    /**
     * @param {...boolean|string|string[]} [arguments]
     * @return {boolean}
     */
    enable() {
        try {
            let { forcible, svc } = _.parseArgs(arguments);
            let _svc;
            if (!this.state(svc)) {
                _svc = this.enabled_svc.split(':')
                    .filter(x => !svc.includes(x))
                    .concat(svc).join(':');
            } else if (forcible) {
                _svc = this.enabled_svc;
            }
            if (_svc) {
                Secure.putString(_.ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, _svc);
                Secure.putInt(_.ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                let _start = Date.now();
                while (Date.now() - _start < 2e3) {
                    if (this.state(svc)) {
                        return true;
                    }
                    sleep(180);
                }
                consolex.$('Operation timed out', 4, 1);
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    /**
     * @param {...boolean|string|string[]} [arguments]
     * @return {boolean}
     */
    disable() {
        try {
            let _args0 = arguments[0];
            if ($$str(_args0) && _args0.toLowerCase() === 'all') {
                Secure.putString(_.ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, '');
                Secure.putInt(_.ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                return true;
            }
            let { forcible, svc } = _.parseArgs(arguments);
            let _enabled_svc = _.getString();
            let _contains = function () {
                for (let i = 0, l = svc.length; i < l; i += 1) {
                    if (_enabled_svc.includes(svc[i])) {
                        return true;
                    }
                }
            };
            let _svc;
            if (_contains()) {
                _svc = _enabled_svc.split(':').filter(x => !svc.includes(x)).join(':');
            } else if (forcible) {
                _svc = _enabled_svc;
            }
            if (_svc) {
                Secure.putString(_.ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, _svc);
                Secure.putInt(_.ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                _enabled_svc = _.getString();
                let _start = Date.now();
                while (Date.now() - _start < 2e3) {
                    if (!_contains()) {
                        return true;
                    }
                    sleep(180);
                }
                consolex.$('Operation timed out', 4, 1);
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    /**
     * @param {...boolean|string|string[]} [arguments]
     * @return {boolean}
     */
    restart() {
        return this.disable.apply(this, arguments) && this.enable.apply(this, arguments);
    },
    /**
     * @param {string|string[]} [services]
     * @return {boolean}
     */
    state(services) {
        let _enabled_svc = this.enabled_svc = _.getString();
        let _services = [];
        if (Array.isArray(services)) {
            _services = services.slice();
        } else if (typeof services === 'undefined') {
            _services = [ _.autojs_a11y_svc_name ];
        } else if (typeof services === 'string') {
            _services = [ services ];
        } else {
            throw TypeError('Unknown a11y state type');
        }
        return _services.every(svc => _enabled_svc.includes(svc));
    },
    /**
     * @return {string[]}
     */
    services() {
        return _.getString().split(':').filter(x => !!x);
    },
    /**
     * @return {boolean}
     */
    test() {
        let _rand = '%rand%' + Date.now() + Math.random().toFixed(9);
        this.enable(_rand, true);
        return this.disable(_rand, true);
    },
    /**
     * @return {A11yx.Selector}
     */
    selector() {
        let _ = {
            sel_body_pool: {},
            cache_pool: {},
        };
        let _ext = {
            /**
             * @param {string} key
             * @param {A11yx.Pickup.Locators|(function(A11yx.Pickup.Result.Type):A11yx.Pickup.Results)} sel
             * @return {this}
             */
            add(key, sel) {
                if (typeof sel === 'function') {
                    _.sel_body_pool[key] = sel;
                } else {
                    _.sel_body_pool[key] = () => pickup(sel);
                }
                return this; // to make method chaining possible
            },
            /**
             * @param {string} key
             * @throws {Error} `sel key '${key}' not set in pool`
             * @return {A11yx.Pickup.Results}
             */
            get(key) {
                let _picker = _.sel_body_pool[key];
                if (typeof _picker !== 'undefined') {
                    return typeof _picker === 'function' ? _picker() : null;
                }
                throw Error('Key "' + key + '" is not in the pool');
            },
            /**
             * @param {string} key
             * @return {?UiObject$}
             */
            getAndCache(key) {
                let result = this.get(key);
                if (result) {
                    _.cache_pool[key] = result; // UiObject only
                }
                return result;
            },
            cache: {
                save(key) {
                    _ext.getAndCache(key);
                },
                /** @return {?A11yx.Pickup.Results} */
                load(key) {
                    let _cache = _.cache_pool[key];
                    return _cache || null;
                },
                refresh(key) {
                    let _cache = _.cache_pool[key];
                    _cache && _cache.refresh();
                    this.save(key);
                },
                recycle(key) {
                    let _cache = _.cache_pool[key];
                    _cache && _cache.recycle();
                },
            },
        };
        // noinspection JSValidateTypes
        return Object.assign(Object.create(global.selector()), _ext);
    },
    enableByRoot() {
        try {
            let _cmd = 'enabled=$(settings get secure enabled_accessibility_services)' + '\n' +
                'pkg=' + _.autojs_a11y_svc_name + '\n' +
                'if [[ $enabled != *$pkg* ]]' + '\n' +
                'then' + '\n' +
                'enabled=$pkg:$enabled' + '\n' +
                'settings put secure enabled_accessibility_services $enabled' + '\n' +
                'fi' + '\n' +
                'settings put secure accessibility_enabled 1';
            return shell(_cmd, true).code === 0;
        } catch (e) {
            return false;
        }
    },
    enableByRootAndWaitFor(timeout) {
        return this.enableByRoot()
            && AccessibilityService.Companion.waitForEnabled(timeout || 1e3);
    },
    goToAccessibilitySetting() {
        context.startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
    },
    /**
     * @param {number} [timeout=60e3]
     * @throws org.autojs.autojs.runtime.exception.ScriptInterruptedException
     * @return {boolean}
     */
    waitForEnabled(timeout) {
        // script will continue running rather than stop
        // when accessibility service enabled by user
        threads.start(function () {
            auto.waitFor();
        });

        return this.wait(() => this.state(), timeout || 60e3, {
            else() {
                consolex.$('等待用户开启无障碍服务超时', 8, 2, 0, 2);
            },
        });
    },
    /**
     * @param {A11yx.Functional.AutoEnable.Options} [options]
     * @returns {boolean}
     */
    autoEnable(options) {
        if (this.state()) {
            return true;
        }
        let _opt = options || {};
        let _is_ess = _opt.is_essential;
        let _no_man = _opt.is_manual_disallowed;

        if (!_is_ess) {
            return false;
        }

        let _perm = 'android.permission.WRITE_SECURE_SETTINGS';
        let _pkg_n_perm = context.getPackageName() + ' ' + _perm;

        if (typeof activity !== 'undefined') {
            if (this.enable(true)) {
                toast('已自动启用无障碍服务\n需要重新运行当前脚本', 'long');
            } else if (_is_ess) {
                consolex.$('自动启用无障碍服务失败', 4, 2, 0, 2);
            }
            exit();
            // prevent code below from running
            return false;
        }

        _.tryEnableAndRestart();

        if (_hasRoot()) {
            shell('pm grant ' + _pkg_n_perm, true);
            _.tryEnableAndRestart();
        }
        _failedHint();

        if (_is_ess && _no_man) {
            exit();
        }
        return this.waitForEnabled();

        // tool function(s) {

        function _hasRoot() {
            try {
                return shell('date', true).code === 0;
            } catch (e) {
                return false;
            }
        }

        function _failedHint() {
            consolex.$('自动启用无障碍服务失败', 4, 2, 0, -1);

            let _hasSecure = () => context.checkCallingOrSelfPermission(
                    android.Manifest.permission.WRITE_SECURE_SETTINGS) ===
                android.content.pm.PackageManager.PERMISSION_GRANTED;
            if (!_hasSecure()) {
                let _shell_sc = 'adb shell pm grant ' + _pkg_n_perm;
                consolex.$('Auto.js缺少以下权限:', 4, 0, 0, -1);
                consolex.$('WRITE_SECURE_SETTINGS', 4, 0, 0, 1);
                consolex.$('可尝试使用ADB工具连接手机', 3);
                consolex.$('并执行以下Shell指令(无换行):\n' +
                    '\n' + _shell_sc + '\n', 3);
                consolex.$('Shell指令已复制到剪切板', 3);
                consolex.$('重启设备后授权不会失效', 3);

                setClip(_shell_sc);
            }
            consolex.__();
        }
    },
    ensureService() {
        this.autoEnable({ is_essential: true });
    },
    ensureFunctionality() {
        if (typeof activity === 'undefined') {
            let _max = 24;
            while (!press(1e8, 0, 1) && _max--) {
                sleep(50);
            }
            if (_max < 0) {
                consolex.$('无障碍服务状态异常', 4, 0, 0, -1);
                consolex.$('或基于服务的方法无法使用', 4, 0, 0, 1);

                consolex.$('可尝试以下解决方案', 3);
                consolex.$('卸载并重新安装"Auto.js"', 3, 0, 1);
                consolex.$('安装后重启设备', 3, 0, 1);
                consolex.$('运行"Auto.js"并拉出侧边栏', 3, 0, 1);
                consolex.$('开启无障碍服务', 3, 0, 1);
                consolex.$('再次尝试运行本项目', 3, 0, 1);

                consolex.$('无障碍服务功能异常', 8, 2, 0, 2);
            }
        }
    },
    /**
     * Make sure a11y is on service and try turning it on when necessary
     */
    ensureSvcAndFunc() {
        this.ensureService();
        this.ensureFunctionality();
    },
    /**
     * @param {A11yx.Click.Source} o
     * @param {A11yx.Click.Strategy|A11yx.Click.Options} [strategy='widget']
     * @param {A11yx.Click.Options} [options]
     * @return {boolean}
     */
    click(o, strategy, options) {
        // @Overload
        if (isObjectSpecies(strategy)) {
            return this.click(o, 'widget', strategy);
        }

        if (isNullish(o)) {
            return false;
        }

        let $ = {
            /**
             * Container holding widget hash codes
             * @type {number[]}
             */
            container: [],
            options: options || {},
            wait: exp.wait.bind(exp),
            impededIFN() {
                this.options.no_impeded || typeof $$impeded === 'function' && $$impeded('a11yx.click');
            },
            parsePadding() {
                let _pad = this.options.padding;
                if (!_pad) {
                    return this.padding = { x: 0, y: 0 };
                }
                if (typeof _pad === 'number') {
                    _pad = [ 0, _pad ];
                } else if (!Array.isArray(_pad)) {
                    throw Error('Invalid paddings for a11yx.click()');
                }

                let _coords = function $iiFe() {
                    if (_pad.length === 1) {
                        return [ 0, _pad[0] ];
                    }
                    if (_pad.length === 2) {
                        let [ _k, _v ] = _pad;
                        return _k === 'x' ? [ _v, 0 ] : _k === 'y' ? [ 0, _v ] : [ _k, _v ];
                    }
                    throw Error('Invalid paddings amount for a11yx.click()');
                }();

                let [ _x, _y ] = _coords.map(n => Number(n));
                if (!(!isNaN(_x) && !isNaN(_y))) {
                    throw Error('Invalid paddings calc results for a11yx.click()');
                }
                this.padding = { x: _x, y: _y };
            },
            parseStrategy() {
                let _stg = this.options.strategy || this.options.click_strategy
                    || this.options.cs$ || strategy || 'widget';
                this.strategy = typeof _stg === 'string' ? _stg : String(this.strategy);
            },
            parseCondition() {
                this.condition = (function $iiFe() {
                    let _cond = this.options.condition;
                    if (typeof _cond === 'function') {
                        return _cond;
                    }
                    if (_cond === 'disappear') {
                        return () => this.checkDisappearance(o);
                    }
                    if (isNullish(_cond)) {
                        return () => true;
                    }
                    throw Error('Invalid condition for a11yx.click(): ' + _cond);
                }).call(this);
            },
            parseArgs() {
                this.parsePadding();
                this.parseStrategy();
                this.parseCondition();
                this.times = this.options.max_check_times || 3;
                this.timeout = this.options.check_time_once || 500;
                this.press_time = this.options.press_time || this.options.pt$ || 1;
                this.buffer_time = this.options.buffer_time || this.options.bt$ || 0;
            },
            /**
             * @param {UiSelector$|UiObject$} [o]
             * @return {boolean}
             */
            checkDisappearance(o) {
                if (isNullish(o)) {
                    return true;
                }
                if (o instanceof UiObject) {
                    let _w = o.parent();
                    return !_w || !this.container.includes(_w.hashCode());
                }
                if (o instanceof UiSelector) {
                    let _w = o.findOnce();
                    return !_w || !this.container.includes(_w.hashCode());
                }
                return this.checkDisappearance(pickup(o));
            },
            /**
             * @param {UiSelector$|UiObject$|Android.Rect|number[]|{x:number,y:number}} o
             * @return {boolean}
             */
            clickOnce(o) {
                let _click = (x, y) => this.strategy.match(/^p(ress)?$/)
                    ? press(x + this.padding.x, y + this.padding.y, this.press_time)
                    : click(x + this.padding.x, y + this.padding.y);

                if (o instanceof UiSelector) {
                    let _w = o.findOnce();
                    if (!_w) {
                        return false;
                    }
                    this.container.push(_w.hashCode());
                    if (this.strategy.match(/^w(idget)?$/) && _w.clickable()) {
                        return _w.click();
                    }
                    let _bnd = _w.bounds();
                    return _click(_bnd.centerX(), _bnd.centerY());
                }
                if (o instanceof UiObject) {
                    let _p = o.parent();
                    if (_p !== null) {
                        this.container.push(_p.hashCode());
                    }
                    if (this.strategy.match(/^w(idget)?$/) && o.clickable()) {
                        return o.click();
                    }
                    let _bnd = o.bounds();
                    return _click(_bnd.centerX(), _bnd.centerY());
                }
                if (o instanceof Rect) {
                    return _click(o.centerX(), o.centerY());
                }
                if (o instanceof Point) {
                    return _click(o.x, o.y);
                }
                if (isObjectSpecies(o)) {
                    if (typeof o.x === 'number' && typeof o.y === 'number') {
                        return _click(o.x, o.y);
                    }
                }
                if (Array.isArray(o) && o.length === 2) {
                    if (o.every(x => typeof x === 'number')) {
                        return _click.apply(null, o);
                    }
                }

                let _w = o.findOnce();
                return _w ? this.clickOnce(_w) : false;
            },
            getResult() {
                this.impededIFN();
                this.parseArgs();

                do {
                    if (!this.clickOnce(o)) {
                        sleep(this.timeout);
                        continue;
                    }
                    if (this.wait(this.condition, this.timeout, 80)) {
                        sleep(this.buffer_time);
                        return true;
                    }
                } while (this.times--);

                return false;
            },
        };

        return $.getResult();
    },
    /**
     * Function for a series of ordered click actions
     * @param {string|A11yx.Pipeline.Actions} name
     * @param {A11yx.Pipeline.Actions|A11yx.Pipeline.Options} [actions]
     * @param {A11yx.Pipeline.Options} [options]
     * @return {boolean}
     */
    pipeline(name, actions, options) {
        // @Overload
        if (typeof name !== 'string') {
            return this.pipeline(String(), name, actions);
        }

        let $ = {
            options: options || {},
            get name() {
                return this._name = this._name || String(this.options.name || 'pipeline').surround('"');
            },
            waitAndClick: exp.waitAndClick.bind(exp),
            parseActions() {
                return this.actions = actions.map(o => isObjectSpecies(o) ? o : { locator: o });
            },
            getResult() {
                return this.parseActions().every((pipe, idx) => {
                    return this.waitAndClick(pipe.locator, Object.assign({}, this.options, {
                        condition: function $iiFe() {
                            if (pipe.condition) {
                                return pipe.condition;
                            }
                            if (idx < this.actions.length - 1) {
                                return () => pickup(this.actions[idx + 1].locator);
                            }
                        }.call(this),
                        strategy: pipe.strategy,
                    })) || consolex.w([ this.name + '管道破裂', pipe.locator ], 2, 0, -2);
                });
            },
        };

        return $.getResult();
    },
    /**
     * @param {A11yx.Wait.Condition} condition
     * @param {?number|A11yx.Wait.Options} [limit=10e3]
     * @param {?number|A11yx.Wait.Options} [interval=200]
     * @param {A11yx.Wait.Options} [options]
     * @return {any}
     */
    wait(condition, limit, interval, options) {
        // @Overload
        if (isObjectSpecies(limit)) {
            return this.wait(condition, null, null, limit);
        }

        // @Overload
        if (isObjectSpecies(interval)) {
            return this.wait(condition, limit, null, interval);
        }

        let $ = {
            result: false,
            start: Date.now(),
            options: options || {},
            impededIFN() {
                this.options.no_impeded || typeof $$impeded === 'function' && $$impeded('a11yx.wait');
            },
            parseArgs() {
                let _lmt = typeof limit === 'number' ? limit : Number(limit) || 10e3;
                this.times = _lmt <= 0 || !isFinite(_lmt) || isNaN(_lmt) || _lmt >= 100 ? Infinity : _lmt;
                this.timeout = _lmt >= 100 ? _lmt : Infinity;
                this.interval = interval || 200;
                if (this.interval >= this.timeout) {
                    this.times = 1;
                }
            },
            /**
             * @return {A11yx.Pickup.Results|any}
             */
            check() {
                if (isNullish(condition)) {
                    return condition;
                }
                if (typeof condition === 'function') {
                    return condition();
                }
                if (condition instanceof UiObject) {
                    return condition;
                }
                return pickup(condition);
            },
            wait() {
                while (this.times--) {
                    if ((this.result = this.check())) {
                        break;
                    }
                    if (Date.now() - this.start > this.timeout) {
                        break;
                    }
                    sleep(this.interval);
                }
            },
            callbackIFN() {
                let _fn = this.result ? this.options.then : this.options.else;
                if (typeof _fn === 'function') {
                    let _res = _fn.call(this.options.this || this.options, this.result);
                    if (typeof _res !== 'undefined') {
                        this.result = _res;
                    }
                }
            },
            getResult() {
                this.impededIFN();
                this.parseArgs();
                this.wait();
                this.callbackIFN();

                return this.result;
            },
        };

        return $.getResult();
    },
    waitEvery(conditions, timeout, interval, options) {
        //// -=-= PENDING =-=- ////
    },
    waitSome(conditions, timeout, interval, options) {
        //// -=-= PENDING =-=- ////
    },
    /**
     * Wait for a certain object (such as UiObject) showing up then click it
     * @param {A11yx.Wait.Condition} condition - if condition is not true then waiting
     * @param {?number|A11yx.WaitAndClick.Options} [limit=10e3] - if < 100, taken as times
     * @param {?number|A11yx.WaitAndClick.Options} [interval=200]
     * @param {A11yx.WaitAndClick.Options} [click_options]
     * @return {boolean} - a11yx.wait(...) && a11yx.click(...)
     */
    waitAndClick(condition, limit, interval, click_options) {
        // @Overload
        if (isObjectSpecies(limit)) {
            return this.waitAndClick(condition, null, null, limit);
        }

        // @Overload
        if (isObjectSpecies(interval)) {
            return this.waitAndClick(condition, limit, null, interval);
        }

        let _res_click = true;
        let _res_wait = wait(condition, limit, interval, {
            then: (res) => {
                let _opt = click_options || {};
                sleep(_opt.intermission || 240);
                _res_click = this.click(res, _opt) && _res_click;
            },
        });
        return _res_wait && _res_click;
    },
    /**
     * Wait until a generator, which generates variable values, is stable.
     * And returns the final stable value.
     * 1. Wait until generator returns different values (not longer than generator_timeout)
     * 2. Wait until changing value is stable (not longer than stable_threshold each time)
     * @param {function} condition - if condition (dynamic output) is not true then waiting
     * @param {?number|A11yx.WaitAndStable.Options} [limit=10e3] - if < 100, taken as times
     * @param {?number|A11yx.WaitAndStable.Options} [interval=200]
     * @param {A11yx.WaitAndStable.Options} [stable_options]
     * @example
     * let members = ['John', 'Zach', 'Cole', 'Eric'];
     * toastLog('Rolling the dice...');
     * let idx = a11yx.waitAndStable(() => Math.floor(Math.random() * members.length));
     * toastLog(members[idx] + ' is the lucky one');
     * @return {any}
     */
    waitAndStable(condition, limit, interval, stable_options) {
        // @Overload
        if (isObjectSpecies(limit)) {
            return this.waitAndStable(condition, null, null, limit);
        }

        // @Overload
        if (isObjectSpecies(interval)) {
            return this.waitAndStable(condition, limit, null, interval);
        }

        let $ = {
            parseArgs() {
                let _opt = stable_options || {};
                this.reference = _opt.reference;
                this.timeout = _opt.timeout || 24e3;
                this.threshold = _opt.threshold || 420;
            },
            isTimedOut() {
                return Date.now() - this.condition_start > this.timeout;
            },
            condition() {
                return this.last_condition = condition();
            },
            checkInitCondition() {
                let _cond = this.reference !== undefined
                    ? () => this.condition() !== this.reference
                    : () => this.condition();
                return exp.wait(_cond, limit, interval, {
                    then: res => $.last_stable = res,
                });
            },
            checkStableCondition() {
                this.condition_start = Date.now();
                while (exp.wait(() => $.last_stable !== this.condition(), this.threshold)) {
                    $.last_stable = $.last_condition;
                    if (this.isTimedOut()) {
                        throw Error('a11yx.waitAndStable() timed out waiting for stable condition');
                    }
                }
                return $.last_stable;
            },
            getResult() {
                this.parseArgs();
                return this.checkInitCondition()
                    && this.checkStableCondition();
            },
        };

        return $.getResult();
    },
    /**
     * Substitution of swipe()
     * @param {A11yx.Swipe.Point} start
     * @param {A11yx.Swipe.Point} end
     * @param {number} [duration=Math.max((start-end)/5,200)]
     * @param {Object} [options]
     * @param {boolean} [options.no_impeded]
     * @example
     * let start = 800, end = 200;
     * swipe(halfW, start, halfW, end, Math.max((start - end) / 5, 200));
     * a11yx.swipe([halfW, start], [halfW, end], Math.max((start - end) / 5, 200)); // same as above
     * a11yx.swipe(start, end, Math.max((start - end) / 5, 200)); // same as above
     * a11yx.swipe(start, end); // same as above
     * @example
     * a11yx.swipe(0.7, 0.3);
     * a11yx.swipe(cY(0.7), cY(0.3)); // same as above
     * a11yx.swipe([cX(0.5), cY(0.7)], [cX(0.5), cY(0.3)]); // same as above
     * a11yx.swipe([cX(0.5), cY(0.7)], [cX(0.5), cY(0.3)], 200); // same as above
     * swipe(cX(0.5), cY(0.7), cX(0.5), cY(0.3), 200); // same as above
     * @return {boolean}
     */
    swipe(start, end, duration, options) {
        let $ = {
            impededIFN() {
                this.options.no_impeded || typeof $$impeded === 'function' && $$impeded('a11yx.swipe');
            },
            /**
             * @param {A11yx.Swipe.Point} o
             * @return {{x: number, y: number}}
             */
            parsePoint(o) {
                if (typeof o === 'number') {
                    return { x: halfW, y: this.scale(o, 'y') };
                }
                if (Array.isArray(o)) {
                    if (o.length !== 2 || !o.every(x => $$num(x))) {
                        throw Error('Invalid array point: ' + o.join(', '));
                    }
                    return {
                        x: this.scale(o[0], 'x'),
                        y: this.scale(o[1], 'y'),
                    };
                }
                if (isObjectSpecies(o)) {
                    if (typeof o.x !== 'number' || typeof o.y !== 'number') {
                        throw Error('Invalid object point: ' + o.x + ', ' + o.y);
                    }
                    return {
                        x: this.scale(o.x, 'x'),
                        y: this.scale(o.y, 'y'),
                    };
                }
                if (o instanceof Point) {
                    return {
                        x: this.scale(o.x, 'x'),
                        y: this.scale(o.y, 'y'),
                    };
                }
                throw TypeError('Unknown type of point for a11yx.swipe()');
            },
            parseDuration() {
                this.duration = duration >= 200
                    ? duration : Math.max(Mathx.dist(this.start, this.end) / 5, 200);
            },
            parseArgs() {
                this.options = options || {};
                this.start = this.parsePoint(start);
                this.end = this.parsePoint(end);
                this.parseDuration();
            },
            /**
             * @param num
             * @param {'x'|'y'} [direction='x']
             * @private
             */
            scale(num, direction) {
                let _d = direction === undefined ? 'x' : direction;
                if (num === -1) {
                    return _d === 'x' ? W : H;
                }
                if (num < 1) {
                    return _d === 'x' ? cX(num) : cY(num);
                }
                return num;
            },
            swipe() {
                return swipe(this.start.x, this.start.y, this.end.x, this.end.y, this.duration);
            },
            getResult() {
                this.parseArgs();
                this.impededIFN();
                return this.swipe();
            },
        };

        return $.getResult();
    },
    swipeInBounds() {
        //// -=-= PENDING =-=- ////

        // relation: 'intersection'|'subset'|'overpass'|number

        // /** @type {function():UiObject$|ImageWrapper$} */
        // let _fn;
        // if (typeof target === 'function') {
        //     _fn = target;
        // } else {
        //     _fn = () => target instanceof UiSelector ? target.findOnce() : target;
        // }
        //
        // let _swp_itv = _opt.swipe_interval || 150;
        // let _swp_max = _opt.max_swipe_times || 12;
        // let _swp_time = _opt.swipe_time || 150;
        // let _cond_meet_sides = parseInt((_opt.condition_meet_sides || 1).toString());
        // if (_cond_meet_sides !== 1 || _cond_meet_sides !== 2) {
        //     _cond_meet_sides = 1;
        // }
        // let _swp_area = _setAreaParams(_opt.swipe_area, [0.1, 0.1, 0.9, 0.9]);
        // let _aim_area = _setAreaParams(_opt.aim_area, [0, 0, -1, -1]);
        // let _swp_drxn = _setSwipeDirection();
        //
        // if (_success()) {
        //     return true;
        // }
        //
        // let _ret = true;
        // while (_swp_max--) {
        //     if (_swipeAndCheck()) {
        //         break;
        //     }
        // }
        // if (_swp_max >= 0) {
        //     return _ret;
        // }
        //
        // // tool function(s) //
        //
        // function _isImageType(o) {
        //     return o instanceof ImageWrapper;
        // }
        //
        // function _setSwipeDirection() {
        //     let _swp_drxn = _opt.swipe_direction;
        //     if (typeof _swp_drxn === 'string' && _swp_drxn !== 'auto') {
        //         if (_swp_drxn.match(/$[Lf](eft)?^/)) {
        //             return 'left';
        //         }
        //         if (_swp_drxn.match(/$[Rr](ight)?^/)) {
        //             return 'right';
        //         }
        //         if (_swp_drxn.match(/$[Dd](own)?^/)) {
        //             return 'down';
        //         }
        //         return 'up';
        //     }
        //     if (_isImageType(_fn())) {
        //         return 'up';
        //     }
        //     let _widget = _fn();
        //     if (!_widget) {
        //         return 'up';
        //     }
        //     // auto mode
        //     let _bnd = _widget.bounds();
        //     let [_bl, _bt] = [_bnd.left, _bnd.top];
        //     let [_br, _bb] = [_bnd.right, _bnd.bottom];
        //     if (_bt <= _aim_area.t || _bb <= _aim_area.t) {
        //         return 'down';
        //     }
        //     if (_br >= _aim_area.r || _bl >= _aim_area.r) {
        //         return 'left';
        //     }
        //     if (_bl <= _aim_area.l || _br <= _aim_area.l) {
        //         return 'right';
        //     }
        //     return 'up';
        // }
        //
        // function _setAreaParams(specified, backup_plan) {
        //     let _area = (_checkArea(specified) || backup_plan)
        //         .map((num, idx) => {
        //             let _num = num !== -2 ? num : backup_plan[idx];
        //             if (_num >= 1) {
        //                 return _num;
        //             }
        //             let _l = idx % 2 ? global.H || device.height : global.W || device.width;
        //             let _factor = _num !== -1 ? _num : 1;
        //             return _l * _factor;
        //         });
        //     let [_l, _t, _r, _b] = _area;
        //     if (_r < _l) [_r, _l] = [_l, _r];
        //     if (_b < _t) [_b, _t] = [_t, _b];
        //     let [_h, _w] = [_b - _t, _r - _l];
        //     let [_cl, _ct, _cr, _cb] = [
        //         {x: _l, y: _t + _h / 2},
        //         {x: _l + _w / 2, y: _t},
        //         {x: _r, y: _t + _h / 2},
        //         {x: _l + _w / 2, y: _b},
        //     ];
        //     return {
        //         l: _l, t: _t, r: _r, b: _b,
        //         cl: _cl, ct: _ct, cr: _cr, cb: _cb,
        //     };
        //
        //     // tool function(s) //
        //
        //     function _checkArea(area) {
        //         if (Object.prototype.toString.call(area).slice(8, -1) === 'Array') {
        //             let _len = area.length;
        //             if (_len === 4) {
        //                 for (let _i = 0; _i < _len; _i += 1) {
        //                     let _num = +area[_i];
        //                     if (isNaN(_num) || (_num < 0 && (_num !== -1 && _num !== -2))) {
        //                         return;
        //                     }
        //                     if (_i % 2 && _num > device.height || !(_i % 2) && _num > device.width) {
        //                         return;
        //                     }
        //                 }
        //                 return area;
        //             }
        //         }
        //     }
        // }
        //
        // function _swipeAndCheck() {
        //     _swipe();
        //     sleep(_swp_itv);
        //     if (_success()) {
        //         return true;
        //     }
        //
        //     // tool function(s) //
        //
        //     function _swipe() {
        //         let {cl, cr, ct, cb} = _swp_area;
        //         let [_cl, _cr, _ct, _cb] = [cl, cr, ct, cb];
        //         if (_swp_drxn === 'down') {
        //             return swipe(_ct.x, _ct.y, _cb.x, _cb.y, _swp_time);
        //         }
        //         if (_swp_drxn === 'left') {
        //             return swipe(_cr.x, _cr.y, _cl.x, _cl.y, _swp_time);
        //         }
        //         if (_swp_drxn === 'right') {
        //             return swipe(_cl.x, _cl.y, _cr.x, _cr.y, _swp_time);
        //         }
        //         return swipe(_cb.x, _cb.y, _ct.x, _ct.y, _swp_time);
        //     }
        // }
        //
        // function _success() {
        //     return _isImageType(_fn()) ? _chk_img() : _chk_widget();
        //
        //     // tool function(s) //
        //
        //     function _chk_widget() {
        //         let _max = 5;
        //         let _widget;
        //         while (_max--) {
        //             if ((_widget = _fn())) {
        //                 break;
        //             }
        //         }
        //         if (!_widget) {
        //             return;
        //         }
        //         let _bnd = _widget.bounds();
        //         if (_bnd.height() <= 0 || _bnd.width() <= 0) {
        //             return;
        //         }
        //         let [_left, _top] = [_bnd.left, _bnd.top];
        //         let [_right, _bottom] = [_bnd.right, _bnd.bottom];
        //         if (Math.abs(_bottom - _top) < 2 || Math.abs(_right - _left) < 2) {
        //             return false;
        //         }
        //         if (_cond_meet_sides < 2) {
        //             if (_swp_drxn === 'up') {
        //                 return _top < _aim_area.b;
        //             }
        //             if (_swp_drxn === 'down') {
        //                 return _bottom > _aim_area.t;
        //             }
        //             if (_swp_drxn === 'left') {
        //                 return _left < _aim_area.r;
        //             }
        //             if (_swp_drxn === 'right') {
        //                 return _right < _aim_area.l;
        //             }
        //         } else {
        //             if (_swp_drxn === 'up') {
        //                 return _bottom < _aim_area.b;
        //             }
        //             if (_swp_drxn === 'down') {
        //                 return _top > _aim_area.t;
        //             }
        //             if (_swp_drxn === 'left') {
        //                 return _right < _aim_area.r;
        //             }
        //             if (_swp_drxn === 'right') {
        //                 return _left < _aim_area.l;
        //             }
        //         }
        //     }
        //
        //     function _chk_img() {
        //         if (typeof imagesx === 'object') {
        //             imagesx.permit();
        //         } else {
        //             images.requestScreenCapture();
        //         }
        //
        //         let _img = _fn();
        //         let _mch = images.findImage(images.captureScreen(), _img);
        //         if (_mch) {
        //             return _ret = [_mch.x + _img.width / 2, _mch.y + _img.height / 2];
        //         }
        //     }
        // }
    },
    swipeInScreen() {
        //// -=-= PENDING =-=- ////
    },
    swipeAndClick() {
        //// -=-= PENDING =-=- ////

        // /**
        //  * Swipe to make a certain specified area, then click it
        //  * @param {UiSelector$|ImageWrapper$|function():UiObject$} f
        //  * @param {Object} [swipe_params]
        //  * @param {number} [swipe_params.max_swipe_times=12]
        //  * @param {number|string} [swipe_params.swipe_direction='auto']
        //  * <br>
        //  *     -- 0|'l'|'left', 1|'u'|'up', 2|'r'|'right', 3|'d'|'down' - direction to swipe each time <br>
        //  *     -- 'auto' - if 'f' exists but not in aim area, direction will be auto-set decided by position of 'f', or direction will be 'up'
        //  * @param {number} [swipe_params.swipe_time=150] - the time spent for each swiping - set bigger as needed
        //  * @param {number} [swipe_params.swipe_interval=300] - the time spent between every swiping - set bigger as needed
        //  * @param {number[]} [swipe_params.swipe_area=[0.1, 0.1, 0.9, 0.9]] - swipe from a center-point to another
        //  * @param {number[]} [swipe_params.aim_area=[0, 0, -1, -1]] - restrict for smaller aim area
        //  * <br>
        //  *     -- area params - x|0<=x<1: x * (height|width), -1: full-height or full-width, -2: set with default value <br>
        //  *     -- [%left%, %top%, %right%, %bottom%] <br>
        //  *     -- [1, 50, 700, 1180] - [1, 50, 700, 1180] <br>
        //  *     -- [1, 50, 700, -1] - [1, 50, 700, device.height] <br>
        //  *     -- [0.1, 0.2, -1, -1] - [0.1 * device.width, 0.2 * device.height, device.width, device.height]
        //  * @param {number=1|2} [swipe_params.condition_meet_sides=1]
        //  * <br>
        //  *     -- example A: condition_meet_sides = 1 <br>
        //  *     -- aim: [0, 0, 720, 1004], direction: 'up', swipe distance: 200 <br>
        //  *     -- swipe once - bounds: [0, 1100, 720, 1350] - top is not less than 1004 - continue swiping <br>
        //  *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004 - swipe will stop <br>
        //  *     -- example B: condition_meet_sides = 2 <br>
        //  *     -- aim: [0, 0, 720, 1004], direction: 'up', swipe distance: 200 <br>
        //  *     -- swipe once - bounds: [0, 1100, 720, 1350] - neither top nor bottom < 1004 - continue swiping <br>
        //  *     -- swipe once - bounds: [0, 900, 720, 1150] - top < 1004, but not bottom - swipe will not stop <br>
        //  *     -- swipe once - bounds: [0, 700, 720, 950] - top < 1004, and so is bottom - swipe will stop
        //  * @param {Object} [click_params]
        //  * @param {number} [click_params.intermission=300]
        //  * @param {string} [click_params.click_strategy] - decide the way of click
        //  * <br>
        //  *     -- 'click' - click(coord_A, coord_B); <br>
        //  *     -- 'press' - press(coord_A, coord_B, 1); <br>
        //  *     -- 'widget' - text('abc').click();
        //  * @param {string|function} [click_params.condition=()=>true]
        //  * <br>
        //  *     -- *DEFAULT* - () => true <br>
        //  *     -- /disappear(ed)?/ - (f) => !f.exists(); - disappeared from the whole screen <br>
        //  *     -- /disappear(ed)?.*in.?place/ - (f) => #some widget info changed#; - disappeared in place <br>
        //  *     -- func - (f) => func(f);
        //  * @param {number} [click_params.check_time_once=500]
        //  * @param {number} [click_params.max_check_times=0]
        //  * <br>
        //  *     -- if condition is specified, then default value of max_check_times will be 3 <br>
        //  *     --- example: (this is not usage) <br>
        //  *     -- while (!waitForAction(condition, check_time_once) && max_check_times--) ; <br>
        //  *     -- return max_check_times >= 0;
        //  * @param {number|array} [click_params.padding]
        //  * <br>
        //  *     -- ['x', -10]|[-10, 0] - x=x-10; <br>
        //  *     -- ['y', 69]|[0, 69]|[69]|69 - y=y+69;
        //  */
        // function swipeAndShowAndClickAction(f, swipe_params, click_params) {
        //     let _res_swipe = swipeAndShow(f, swipe_params);
        //     if (_res_swipe) {
        //         let _o = typeof _res_swipe === 'boolean' ? f : _res_swipe;
        //         let _stg = click_params && click_params.click_strategy;
        //         return this.clickAction(typeof _o === 'function' ? _o() : _o, _stg, click_params);
        //     }
        // }
    },
};

/**
 * @type {Mod.a11yx}
 */
module.exports = { a11yx: exp, $$sel: exp.selector() };