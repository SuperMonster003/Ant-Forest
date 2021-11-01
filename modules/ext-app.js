let {
    $$impeded, $$toast, isNullish,
} = require('./mod-global');
let {a11yx} = require('./ext-a11y');
let {devicex} = require('./ext-device');
let {timersx} = require('./ext-timers');
let {consolex} = require('./ext-console');
let {threadsx} = require('./ext-threads');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Uri = android.net.Uri;
let Runtime = java.lang.Runtime;
let Manifest = android.Manifest;
let Process = android.os.Process;
let Intent = android.content.Intent;
let Context = android.content.Context;
let System = android.provider.Settings.System;
let ApplicationInfo = android.content.pm.ApplicationInfo;
let PackageManager = android.content.pm.PackageManager;
let ActivityManager = android.app.ActivityManager;
let ScriptFile = org.autojs.autojs.model.script.ScriptFile;
let ActivityNotFoundException = android.content.ActivityNotFoundException;
let ShortcutCreateActivity = org.autojs.autojs.ui.shortcut.ShortcutCreateActivity;

let _ = {
    alipay_pkg: 'com.eg.android.AlipayGphone',
    autojs_pkg: context.getPackageName(),
    get autojs_ver() {
        // Pro version(s) (e.g. 8.8.16-0) returns abnormal value like '${xxx.xxx}'
        let _ver = app.autojs.versionName;
        return String(_ver).match(/^\d/) ? _ver : exp.getVerName('Auto.js');
    },
    toPct(num, frac, is_keep_trailing_zero) {
        let _frac = typeof frac === 'number' ? frac : isNaN(frac) ? 2 : Number(frac);
        let _fixed = (num * 100).toFixed(_frac);
        return (is_keep_trailing_zero ? _fixed : Number(_fixed)) + '%';
    },
    /**
     * @param {Appx.Intent.Extension|Intent$|string} o
     */
    startActivity(o) {
        let _flag_new_task = Intent.FLAG_ACTIVITY_NEW_TASK;
        if (o instanceof Intent) {
            return context.startActivity(exp.intent(new Intent(o), {flags: _flag_new_task}));
        }
        if (typeof o === 'object') {
            threadsx.monitorIFN(o.monitor);
            return o.root
                ? void shell('am start\x20' + app.intentToShell(o), true)
                : context.startActivity(exp.intent(o, {flags: _flag_new_task}));
        }
        if (typeof o === 'string') {
            let _cls = runtime.getProperty('class.' + o);
            if (!_cls) {
                throw new Error('Class\x20' + o + '\x20not found');
            }
            return context.startActivity(exp.intent(new Intent(context, _cls), {flags: _flag_new_task}));
        }
        throw Error('Unknown param for appx.startActivity()');
    },
};

let exp = {
    version: {
        /**
         * @param {string|number|{version_name:string}} ver
         * @param {Object} [options]
         * @param {'number'|'string'|'string_with_prefix'} [options.type='string']
         * @example
         * console.log(appx.version.getHex('v2.0.4 Alpha4')); // '02000404'
         * console.log(appx.version.getHex('v13.120.14 Beta3')); // '0d780e83'
         * console.log(appx.version.getHex('v10.2.0')); // '0a0200ff'
         * console.log(appx.version.getHex('v10.2.0', {type: 'number'})); // 167903487
         * @return {string|number}
         */
        getHex(ver, options) {
            if (typeof ver === 'object') {
                ver = ver.version_name;
            }
            if (!ver) {
                throw Error('A "version" must be defined for appx.version.getHex()');
            }
            let _opt = options || {};
            let _hexStr = s => ('00' + Number(s || 0).toString(16)).slice(-2);
            let _max_a = 0x80;
            let _max_b = 0xFF - _max_a;
            let _rex = /^[a-z\s]*(\d+)(?:\.(\d+)(?:\.(\d+)(?:-\d+)?\s*(b(?:eta)?|a(?:lpha)?)?\s*(\d*))?)?$/i;
            let _str = ver.toString().trim().replace(_rex, ($0, $1, $2, $3, $4, $5) => {
                let _$a = [$1, $2, $3].map(s => _hexStr(s)).reduce((a, b) => a + b);
                let _$5 = $5 ? Number($5) : 1;
                let _$4 = 0xFF;
                if ($4) {
                    if ($4.match(/b(eta)?/i)) {
                        if (_$5 >= _max_b) {
                            throw Error('Beta version code must be smaller than\x20' + _max_b);
                        }
                        _$4 = _max_a;
                    } else if ($4.match(/a(lpha)?/i)) {
                        if (_$5 > _max_a) {
                            throw Error('Alpha version code cannot be greater than\x20' + _max_a);
                        }
                        _$4 = 0;
                    }
                }
                let _$b = _hexStr(Math.min(_$4 + _$5, 0xFF));
                return _$a + _$b;
            });
            let _hex = '0x' + _str;
            return _opt.type === 'number' ? Number(_hex) : _opt.type === 'string_with_prefix' ? _hex : _str;
        },
        /**
         * @param {number|string} ver
         * @param {?string} [prefix='v']
         * @example
         * console.log(appx.version.parseHex('02000404')); // 'v2.0.4 Alpha4'
         * console.log(appx.version.parseHex('0d780e83')); // 'v13.120.14 Beta3'
         * console.log(appx.version.parseHex('0a0200ff')); // 'v10.2.0'
         * console.log(appx.version.parseHex(167903487)); // 'v10.2.0'
         * @return {string}
         */
        parseHex(ver, prefix) {
            if (typeof ver === 'number') {
                ver = ('0'.repeat(7) + ver.toString(16)).slice(-8);
            }
            if (!ver) {
                throw Error('A "version" must be defined for appx.version.parseHex()');
            }
            let _max_alpha = 0x80;
            return ver.replace(/^0x/, '').replace(/(..)(..)(..)(..)/g, ($0, $1, $2, $3, $4) => {
                let _$a = [$1, $2, $3].map(s => Number('0x' + s)).join('.');
                let _$4 = Number('0x' + $4);
                let _$b = '';
                if (_$4 <= _max_alpha) {
                    _$b = '\x20Alpha' + (_$4 === 1 ? '' : _$4);
                } else if (_$4 < 0xFF) {
                    _$4 -= _max_alpha;
                    _$b = '\x20Beta' + (_$4 === 1 ? '' : _$4);
                }
                return (prefix === null ? '' : prefix || 'v') + _$a + _$b;
            });
        },
        /**
         * @param {string|number} ver
         * @example
         * console.log(appx.version.parseName(2)); // "v2.0.0"
         * console.log(appx.version.parseName('2')); // "v2.0.0"
         * console.log(appx.version.parseName(2.1)); // "v2.1.0"
         * console.log(appx.version.parseName('2.1')); // "v2.1.0"
         * console.log(appx.version.parseName('2.0.4')); // "v2.0.4"
         * console.log(appx.version.parseName('v2.0.4')); // "v2.0.4"
         * console.log(appx.version.parseName('v2.0.4a7')); // "v2.0.4 Alpha7"
         * console.log(appx.version.parseName('v2.0.4 a7')); // "v2.0.4 Alpha7"
         * console.log(appx.version.parseName('v2.0.4 alpha7')); // "v2.0.4 Alpha7"
         * console.log(appx.version.parseName('2.0.4 alpha 7')); // "v2.0.4 Alpha7"
         * @return {string}
         */
        parseName(ver) {
            let _rex = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?\s*((a(lpha)?|b(eta)?)\s*\d*)?$/i;
            let _v = String(ver);
            return _v.match(_rex) ? this.parseHex(this.getHex(_v.replace(_rex, ($0, $1, $2, $3, $4) => {
                return $1 + '.' + ($2 || 0) + '.' + ($3 || 0) + ($4 ? '\x20' + $4 : '');
            }))) : String();
        },
        /**
         * Returns if 1st version is newer than 2nd version
         * @example
         * console.log(appx.version.isNewer('v2.0.4', 'v2.0.1')); // true
         * console.log(appx.version.isNewer('v2.0.4 Alpha7', 'v2.0.4')); // false
         * console.log(appx.version.isNewer('v2.0.4 Beta2', 'v2.0.4 Alpha3')); // true
         * @param {string|{version_name:string}|number} a
         * @param {string|{version_name:string}|number} b
         * @return {boolean}
         */
        isNewer(a, b) {
            return this.getHex(a) > this.getHex(b);
        },
    },
    /**
     * @param {string} source
     * @example
     * let _pkg = 'com.eg.android.AlipayGphone';
     * let _app = 'Alipay';
     * console.log(appx.getPkgName(_app)); // "com.eg.android.AlipayGphone"
     * console.log(appx.getAppName(_pkg)); // "Alipay"
     * console.log(appx.getPkgName(_pkg)); // "com.eg.android.AlipayGphone"
     * console.log(appx.getAppName(_app)); // "Alipay"
     * @return {?string}
     */
    getAppName(source) {
        if (!source) {
            return null;
        }
        return app.getAppName(source) || app.getPackageName(source) && source;
    },
    /**
     * @param {string} source
     * @example
     * let _pkg = 'com.eg.android.AlipayGphone';
     * let _app = 'Alipay';
     * console.log(appx.getPkgName(_app)); // "com.eg.android.AlipayGphone"
     * console.log(appx.getAppName(_pkg)); // "Alipay"
     * console.log(appx.getPkgName(_pkg)); // "com.eg.android.AlipayGphone"
     * console.log(appx.getAppName(_app)); // "Alipay"
     * @return {?string}
     */
    getPkgName(source) {
        if (!source) {
            return null;
        }
        return !String(source).includes('.') && app.getPackageName(source) || app.getAppName(source) && source;
    },
    /**
     * Returns the version name of an app with app name or package name
     * @param {'current'|'Auto.js'|string} source - app name or app package name
     * @return {?string}
     */
    getVerName(source) {
        let $ = {
            parsePkgName() {
                if (typeof source === 'string') {
                    if (source.match(/^auto\.?js$/i)) {
                        return _.autojs_pkg;
                    }
                    if (source.match(/^current$/i)) {
                        return currentPackage();
                    }
                    return exp.getPkgName(source);
                }
            },
            getResult() {
                let _pkg = this.parsePkgName();
                if (_pkg) {
                    try {
                        /**
                         * Java Array is not iterable
                         * @type {android.content.pm.PackageInfo[]}
                         */
                        let _i_pkgs = context.getPackageManager().getInstalledPackages(0).toArray();
                        for (let i in _i_pkgs) {
                            if (_pkg === _i_pkgs[i].packageName) {
                                return _i_pkgs[i].versionName;
                            }
                        }
                    } catch (e) {
                        // nothing to do here
                    }
                }
                return null;
            },
        };

        return $.getResult();
    },
    /**
     * Make sure a11y is on service and try turning it on when necessary
     */
    checkAccessibility() {
        a11yx.ensureSvcAndFunc();
    },
    /**
     * @param {string[]} modules
     */
    checkModules(modules) {
        let _line = () => '-'.repeat(33);
        let _dash = () => ' -'.repeat(17).slice(1);

        modules.filter((mod) => {
            let _path = './' + mod + '.js';
            try {
                require(_path);
            } catch (e) {
                console.log(_line());
                console.warn(_path);
                console.log(_dash());
                console.warn(e.message);
                console.warn(e.stack);
                return true;
            }
        }).some((mod, idx, arr) => {
            let _str = '';
            _str += '脚本无法继续|以下模块缺失或加载失败:';
            _str += _dash().surround('|');
            arr.forEach(n => _str += '-> ' + n.surround('"'));
            _str += _dash().surround('|');
            _str += '需正确放置模块文件';
            console.log(_line());
            _str.split('|').forEach(s => console.error(s));
            console.log(_line());
            toast('模块缺失或加载失败');
            exit();
        });
    },
    /**
     * Make sure that Alipay is installed on device
     */
    checkAlipayPackage() {
        let _pkg_mgr = context.getPackageManager();
        let _app_name, _app_info;
        try {
            _app_info = _pkg_mgr.getApplicationInfo(_.alipay_pkg, 0);
            _app_name = _pkg_mgr.getApplicationLabel(_app_info);
        } catch (e) {
            consolex.w(e, 0, 0, 2);
        }
        if (!_app_name) {
            consolex.$(['脚本无法继续', '此设备可能未安装"支付宝"应用'], 8, 4, 0, 2);
        }
    },
    /**
     * Make sure System.SCREEN_OFF_TIMEOUT greater than min_timeout.
     * Abnormal value might be auto-corrected to default_timeout determined by is_auto_correction.
     * @param {Object} [options]
     * @property {number} [min_timeout=15000]
     * @property {number} [default_timeout=120000]
     * @property {boolean} [is_auto_correction=true]
     */
    checkScreenOffTimeout(options) {
        // checker for legacy bug (before v1.9.24 Beta)
        // which may cause a tiny value for `System.SCREEN_OFF_TIMEOUT`

        let _opt = options || {};
        let _scr_off_tt_val = devicex.screen_off_timeout.get();
        let _min_timeout = _opt.min_timeout || 15 * 1e3; // 15 seconds
        if (_scr_off_tt_val < _min_timeout) {
            if (_opt.is_auto_correction !== undefined && !_opt.is_auto_correction) {
                throw Error('Abnormal screen off timeout: ' + _scr_off_tt_val);
            }
            let _def_tt = _opt.default_timeout || 2 * 60e3; // 2 minutes
            let _def_mm = (_def_tt / 60e3).toFixedNum(2);
            consolex.d([
                '修正异常的设备屏幕超时参数',
                '修正值: ' + _def_tt + '(\x20' + _def_mm + '分钟)',
            ], 0, 0, -2);
            try {
                devicex.screen_off_timeout.put(_def_tt);
            } catch (e) {
                consolex.e(['修正失败', e], 2, 0, -2);
            }
        }
    },
    /**
     * Check if an activity intent is available to start
     * @param {Appx.Intent.Extension|Intent$} o
     * @return {boolean}
     */
    checkActivity(o) {
        let _pkg_mgr = context.getPackageManager();
        let _query_res = _pkg_mgr.queryIntentActivities(this.intent(o), 0);
        return _query_res && _query_res.toArray().length !== 0;
    },
    /**
     * @param {Appx.Intent.Extension|Intent$} o
     * @return {android.content.ComponentName}
     */
    resolveActivity(o) {
        return this.intent(o).resolveActivity(context.getPackageManager());
    },
    /**
     * Substitution of app.startActivity()
     * @param {Appx.Intent.Extension|Intent$|string} o
     * @param {Appx.StartActivity.Options} [options]
     * @example
     * appx.startActivity({
     *     url: {
     *         src: 'alipays://platformapi/startapp',
     *         query: {
     *             appId: 20000067,
     *             url: 'https://60000002.h5app.alipay.com/www/home.html',
     *             __webview_options__: {
     *                 transparentTitle: 'auto',
     *                 backgroundColor: -1,
     *                 startMultApp: 'YES',
     *                 enableScrollBar: 'NO',
     *             },
     *         },
     *     },
     *     package: 'alipay',
     *     monitor: 'ensure_open',
     * });
     * @see app.intent
     * @return {boolean}
     */
    startActivity(o, options) {
        try {
            if (typeof o === 'string' || this.checkActivity(o)) {
                _.startActivity(o);
                return true;
            }
        } catch (e) {
            let _opt = options || {};
            if (typeof _opt.onActivityNotFoundException === 'function') {
                if (e['javaException'] instanceof ActivityNotFoundException) {
                    _opt.onActivityNotFoundException.call(o);
                }
            } else if (_opt.onActivityNotFoundException !== 'suppress') {
                consolex.$(e, 8, 2, 0, 2);
            }
        }
        return false;
    },
    /**
     * Substitution of app.intent()
     * @param {Appx.Intent.Extension|Intent$} o
     * @param {{flags?: number, category?: string}} [addition]
     * @return {Intent$}
     */
    intent(o, addition) {
        let _intent = o instanceof Intent ? o : _getIntentWithOptions(o);

        let _addi = addition || {};
        if (_addi.flags !== undefined) {
            _intent = _intent.addFlags(_addi.flags);
        }
        if (_addi.category !== undefined) {
            _intent = _intent.addCategory(_addi.category);
        }

        return _intent;

        // tool function(s) //

        function _getIntentWithOptions(o) {
            let _i = new Intent();

            if (o.url) {
                o.data = _parseIntentUrl(o);
            }
            if (o.package) {
                o.packageName = o.packageName || o.package;
                delete o.package;
            }
            if (o.packageName) {
                if (o.packageName.toString().toLowerCase() === 'alipay') {
                    o.packageName = _.alipay_pkg;
                }
                if (o.className) {
                    _i.setClassName(o.packageName, o.className);
                } else {
                    // the Intent can only match the components
                    // in the given application package with setPackage().
                    // Otherwise, if there's more than one app that can handle the intent,
                    // the system presents the user with a dialog to pick which app to use
                    _i.setPackage(o.packageName);
                }
            }
            if (o.extras) {
                Object.keys(o.extras).forEach((key) => {
                    _i.putExtra(key, o.extras[key]);
                });
            }
            if (o.category) {
                if (Array.isArray(o.category)) {
                    for (let i = 0; o < o.category.length; i++) {
                        _i.addCategory(o.category[i]);
                    }
                } else {
                    _i.addCategory(o.category);
                }
            }
            if (o.action) {
                if (o.action.indexOf('.') < 0) {
                    _i.setAction('android.intent.action.' + o.action);
                } else {
                    _i.setAction(o.action);
                }
            }
            if (o.flags) {
                let flags = 0;
                if (o.flags instanceof Array) {
                    for (let i = 0; i < o.flags.length; i++) {
                        flags |= _parseIntentFlag(o.flags[i]);
                    }
                } else {
                    flags |= _parseIntentFlag(o.flags);
                }
                _i.setFlags(flags);
            }
            if (o.type) {
                if (o.data) {
                    _i.setDataAndType(app.parseUri(o.data), o.type);
                } else {
                    _i.setType(o.type);
                }
            } else if (o.data) {
                _i.setData(Uri.parse(o.data));
            }

            return _i;
        }

        function _parseIntentFlag(flags) {
            if (typeof flags === 'string') {
                return Intent['FLAG_' + flags.toUpperCase()];
            }
            return flags;
        }

        function _parseIntentUrl(o) {
            let _url = o.url;
            if (typeof _url === 'object') {
                _url = _parseUrl(_url);
            }
            return _url;

            // tool function(s) //

            /**
             * @param {Appx.Intent.URI} o
             * @return {string}
             */
            function _parseUrl(o) {
                let {src, query, exclude} = o;
                if (!src || !query) {
                    return src;
                }
                let _sep = src.match(/\?/) ? '&' : '?';
                return src + _sep + (function _parse(query) {
                    let _exclude = exclude || [];
                    if (!Array.isArray(_exclude)) {
                        _exclude = [_exclude];
                    }
                    return Object.keys(query).map((key) => {
                        let _val = query[key];
                        if (Object.prototype.toString.call(_val).slice(8, -1) === 'Object') {
                            _val = key === 'url' ? _parseUrl(_val) : _parse(_val);
                            _val = (key === '__webview_options__' ? '&' : '') + _val;
                        }
                        if (!_exclude.includes(key)) {
                            _val = encodeURI(_val);
                        }
                        return key + '=' + _val;
                    }).join('&');
                })(query);
            }
        }
    },
    /**
     * Launch some app with package name or intent and wait for conditions ready if specified
     * @param {App.Intent.CommonWithRoot|string|function|Intent$} trigger
     * @param {Appx.Launch.Options} [options]
     * @example
     * appx.launch('com.eg.android.AlipayGphone');
     * appx.launch('com.eg.android.AlipayGphone', {
     *    task_name: '\u652F\u4ED8\u5B9D\u6D4B\u8BD5',
     *    // is_show_toast: true,
     * });
     * appx.launch({
     *     action: 'VIEW',
     *     data: 'alipays://platformapi/startapp?appId=60000002&appClearTop=false&startMultApp=YES',
     * }, {
     *     package_name: 'com.eg.android.AlipayGphone',
     *     task_name: '\u8682\u8681\u68EE\u6797',
     *     condition_launch: () => currentPackage().match(/AlipayGphone/),
     *     condition_ready: () => descMatches(/../).find().size() > 6,
     *     launch_retry_times: 4,
     *     screen_orientation: 0,
     * });
     * @return {boolean}
     */
    launch(trigger, options) {
        let _opt = options || {};
        _opt.no_impeded || typeof $$impeded === 'function' && $$impeded(this.launch.name);

        if (typeof _opt.package !== 'undefined') {
            if (typeof _opt.package_name === 'undefined') {
                _opt.package_name = _opt.package;
                delete _opt.package;
            }
        }
        if (typeof _opt.package_name === 'string') {
            if (_opt.package_name.toLowerCase() === 'alipay') {
                _opt.package_name = _.alipay_pkg;
            }
        }

        let _debug = consolex.debug.fuel(_opt);

        let _trig = trigger || _.autojs_pkg;
        if (!['object', 'string', 'function'].includes(typeof _trig)) {
            consolex.$('应用启动目标参数无效', 8, 4, 0, 2);
        }

        let _pkg_name = '';
        let _app_name = '';
        let _task_name = _opt.task_name || '';
        let _1st_launch = true;

        _setAppName();

        _app_name = _app_name || _opt.app_name;
        _pkg_name = _pkg_name || _opt.package_name;

        let _name = (_task_name || _app_name).replace(/^["']+|["']+$/g, '');

        _debug('启动目标名称: ' + _name);
        _debug('启动参数类型: ' + typeof _trig);

        let _cond_ready = typeof _opt.condition_ready !== 'function'
            ? null : () => {
                a11yx.service.refreshServiceInfo();
                return _opt.condition_ready();
            };

        let _cond_launch = typeof _opt.condition_launch !== 'function'
            ? () => currentPackage() === _pkg_name : () => {
                a11yx.service.refreshServiceInfo();
                return _opt.condition_launch();
            };

        let _thd_dist;
        let _dist = _opt.disturbance;
        if (_dist) {
            _debug('已开启干扰排除线程');
            _thd_dist = threadsx.start(function () {
                while (1) {
                    sleep(1.2e3);
                    _dist();
                }
            });
        }

        let _max_retry = _opt.global_retry_times || 2;
        let _max_retry_b = _max_retry;
        while (_max_retry--) {
            let _max_lch = _opt.launch_retry_times || 3;
            let _max_lch_b = _max_lch;

            let _toast = _opt.is_show_toast;
            if (_toast && _toast !== 'none') {
                let _msg = _task_name
                    ? '重新开始' + _task_name.surround('"') + '任务'
                    : '重新启动' + _app_name.surround('"') + '应用';
                if (_1st_launch) {
                    if (_toast === true || String(_toast).match(/^(all|greeting(_only)?)$/)) {
                        consolex.d(_msg.replace(/重新/g, ''), 1, 0, 2);
                    }
                } else {
                    if (!String(_toast).match(/^(greeting(_only)?)$/)) {
                        $$toast(_msg);
                    }
                }
            }

            while (_max_lch--) {
                if (typeof _trig === 'object') {
                    _debug('加载intent参数启动应用');
                    this.startActivity(_trig);
                } else if (typeof _trig === 'string') {
                    _debug('加载应用包名参数启动应用');
                    if (!app.launchPackage(_pkg_name)) {
                        _debug('加载应用名称参数启动应用');
                        app.launchApp(_app_name);
                    }
                } else {
                    _debug('使用触发器方法启动应用');
                    _trig();
                }

                let _succ = a11yx.wait(_cond_launch, 5e3, 800);
                let _suff = '(\x20' + (_max_lch_b - _max_lch) + '/' + _max_lch_b + ')';
                if (_succ) {
                    _debug('应用启动成功');
                    break;
                }
                _debug('应用启动超时' + _suff);
                _debug(currentPackage(), 0, 1);
            }

            if (_max_lch < 0) {
                consolex.$('打开' + _app_name.surround('"') + '失败', 8, 4, 0, 2);
            }

            if (isNullish(_cond_ready)) {
                _debug('未设置启动完成条件参数');
                break;
            }

            _1st_launch = false;
            _debug('开始监测启动完成条件');

            let _max_ready = _opt.ready_retry_times || 3;
            let _max_ready_b = _max_ready;

            while (!a11yx.wait(_cond_ready, 8e3) && _max_ready--) {
                let _ctr = (_max_ready_b - _max_ready + '/' + _max_ready_b).surround('()');
                if (typeof _trig === 'object') {
                    _debug('重新启动Activity ' + _ctr);
                    this.startActivity(_trig);
                } else {
                    _debug('重新启动应用 ' + _ctr);
                    app.launchPackage(_trig);
                }
            }

            if (_max_ready >= 0) {
                _debug('启动完成条件监测完毕');
                break;
            }

            _debug('尝试关闭' + _app_name.surround('"') + '应用:');
            _debug((_max_retry_b - _max_retry + '/' + _max_retry_b).surround('()'));
            this.kill(_pkg_name);
        }

        if (_thd_dist) {
            _thd_dist.interrupt();
            _debug('干扰排除线程结束');
            _thd_dist = null;
        }

        if (_max_retry < 0) {
            consolex.$(_name.surround('"') + '初始状态准备失败', 8, 4, 0, 2);
        }
        _debug(_name.surround('"') + '初始状态准备完毕');

        return true;

        // tool function(s) //

        function _setAppName() {
            if (typeof _trig === 'string') {
                _app_name = !_trig.match(/.+\..+\./) && app.getPackageName(_trig) && _trig;
                _pkg_name = app.getAppName(_trig) && _trig.toString();
            } else {
                _app_name = _opt.app_name;
                _pkg_name = _opt.package_name;
                if (!_pkg_name && typeof _trig === 'object') {
                    _pkg_name = _trig.packageName || _trig.data && _trig.data.match(/^alipays/i) && _.alipay_pkg;
                }
            }
            _app_name = _app_name || _pkg_name && app.getAppName(_pkg_name);
            _pkg_name = _pkg_name || _app_name && app.getPackageName(_app_name);
            if (!_app_name && !_pkg_name) {
                consolex.$(['未找到应用:', _trig], 8, 0, 0, 2);
            }
        }
    },
    /**
     * @param {string} [pkg=autojs.getPkgName()]
     */
    launchAndClearTop(pkg) {
        this.startActivity(this.intent(this.getLaunchIntentForPackage(pkg), {
            flags: Intent.FLAG_ACTIVITY_CLEAR_TOP,
        }));
    },
    /**
     * @param {string} [pkg=autojs.getPkgName()]
     * @return {Intent$}
     */
    getLaunchIntentForPackage(pkg) {
        return context.getPackageManager().getLaunchIntentForPackage(pkg || _.autojs_pkg);
    },
    /**
     * Close or minimize a certain app
     * @param {string} [source]
     * @param {Appx.Kill.Options} [options]
     * @example
     * appx.kill('Alipay');
     * appx.kill('com.eg.android.AlipayGphone', {
     *    shell_acceptable: false,
     * });
     * @return {boolean}
     */
    kill(source, options) {
        let _opt = options || {};
        _opt.no_impeded || typeof $$impeded === 'function' && $$impeded(this.kill.name);

        let _src = source || '';
        if (!_src) {
            _src = currentPackage();
            consolex.w([
                '自动使用currentPackage()返回值',
                'appx.kill()未指定name参数',
            ]);
        }
        let _app_name = this.getAppName(_src);
        let _pkg_name = this.getPkgName(_src);
        if (!_app_name || !_pkg_name) {
            consolex.$('解析应用名称及包名失败', 8, 4, 0, 2);
        }

        let _shell_acceptable = (
            _opt.shell_acceptable === undefined ? true : _opt.shell_acceptable
        );
        let _keycode_back_acceptable = (
            _opt.keycode_back_acceptable === undefined ? true : _opt.keycode_back_acceptable
        );
        let _keycode_back_twice = _opt.keycode_back_twice || false;
        let _cond_success = _opt.condition || (() => {
            let _cond = () => currentPackage() === _pkg_name;
            return a11yx.wait(() => !_cond(), 12e3) && !a11yx.wait(_cond, 3, 150);
        });

        let _shell_result = false;
        let _shell_start_ts = Date.now();
        let _shell_max_wait_time = _opt.shell_max_wait_time || 10e3;
        if (_shell_acceptable) {
            try {
                _shell_result = !shell('am force-stop ' + _pkg_name, true).code;
            } catch (e) {
                consolex._('shell()方法强制关闭' + _app_name.surround('"') + '失败');
            }
        } else {
            consolex._('参数不接受shell()方法');
        }

        if (!_shell_result) {
            if (_keycode_back_acceptable) {
                return _tryMinimizeApp();
            }
            consolex._('参数不接受模拟返回方法');
            return consolex.e([
                '关闭' + _app_name.surround('"') + '失败',
                '无可用的应用关闭方式',
            ], 1);
        }

        let _et = Date.now() - _shell_start_ts;
        return a11yx.wait(_cond_success, _shell_max_wait_time, {
            then: () => consolex._([
                'shell()关闭' + _app_name.surround('"') + '成功',
                '关闭用时: ' + _et + '毫秒',
            ]),
            else: () => consolex.e([
                '关闭' + _app_name.surround('"') + '失败',
                '关闭时间已达最大超时',
            ], 1),
        });

        // tool function(s) //

        function _tryMinimizeApp() {
            consolex._('尝试最小化当前应用');

            let _sltr_avail_btns = [
                idMatches(/.*nav.back|.*back.button/),
                descMatches(/关闭|返回/),
                textMatches(/关闭|返回/),
            ];

            let _max_try_times_minimize = 20;
            let _max_try_times_minimize_bak = _max_try_times_minimize;
            let _back = () => {
                back();
                back();
                if (_keycode_back_twice) {
                    sleep(200);
                    back();
                }
            };

            while (_max_try_times_minimize--) {
                let _clicked_flag = false;
                for (let i = 0, l = _sltr_avail_btns.length; i < l; i += 1) {
                    let _sltr_avail_btn = _sltr_avail_btns[i];
                    if (_sltr_avail_btn.exists()) {
                        _clicked_flag = true;
                        a11yx.click(_sltr_avail_btn);
                        sleep(300);
                        break;
                    }
                }
                if (_clicked_flag) {
                    continue;
                }
                _back();
                if (a11yx.wait(_cond_success, 2e3)) {
                    break;
                }
            }
            if (_max_try_times_minimize < 0) {
                consolex._('最小化应用尝试已达: ' + _max_try_times_minimize_bak + '次');
                consolex._('重新仅模拟返回键尝试最小化');
                _max_try_times_minimize = 8;
                while (_max_try_times_minimize--) {
                    _back();
                    if (a11yx.wait(_cond_success, 2e3)) {
                        break;
                    }
                }
                if (_max_try_times_minimize < 0) {
                    return consolex.e('最小化当前应用失败', 1);
                }
            }
            consolex._('最小化应用成功');
            return true;
        }
    },
    /**
     * Main process of Auto.js will be killed
     * @param {{
     *     pid?: number,
     *     is_async?: boolean,
     *     pending_task?: Timersx.TimedTask.Disposable|'launcher'|'launcher+3s'|'current'|'current+3s'|string,
     * }} [options]
     */
    killProcess(options) {
        let $ = {
            parseArgs() {
                this.options = options || {};
                this.pid = this.options.pid > 0 ? this.options.pid : Process.myPid();
            },
            parseTask() {
                let task = this.pending_task;
                if (typeof task === 'object') {
                    return task;
                }
                if (typeof task === 'string') {
                    if (task.match(/^current(.*\d+s)?$/i)) {
                        let _mch_min = task.match(/\d+/);
                        return {
                            path: engines.myEngine().getSource(),
                            date: Date.now() + (_mch_min ? _mch_min[0] : 5) * 1e3,
                            is_async: $.options.is_async,
                        };
                    }
                }
                throw Error('Cannot parse pending_task for appx.killProcess()');
            },
            addTask() {
                if ((this.pending_task = this.options.pending_task)) {
                    timersx.addDisposableTask(Object.assign(this.parseTask(), {
                        callback() {
                            $.killNow();
                        },
                    }));
                    return true;
                }
            },
            killNow() {
                Process.killProcess(this.pid);
            },
            kill() {
                this.parseArgs();
                this.addTask() || this.killNow();
            },
        };
        $.kill();
    },
    /**
     * Kill or minimize an app and launch it with options
     * @param {string} [source]
     * @param {{
     *     kill?: Appx.Kill.Options,
     *     launch?: Appx.Launch.Options,
     * }} [options]
     * @return {boolean}
     */
    restart(source, options) {
        let _src = source || currentPackage();
        let _opt = options || {};
        return this.kill(_src, _opt.kill) && this.launch(_src, _opt.launch);
    },
    /**
     * Returns if Auto.js has attained root access by running a shell command
     * @see devicex.hasRoot
     * @return {boolean}
     */
    hasRoot() {
        try {
            // 1. com.stardust.autojs.core.util.ProcessShell
            //    .execCommand('date', true).code === 0;
            //    code above doesn't work on Auto.js Pro
            // 2. some devices may stop the script without
            //    any info or hint in a sudden way without
            //    this try/catch code block
            return shell('date', true).code === 0;
        } catch (e) {
            return false;
        }
    },
    /**
     * Returns if Auto.js has WRITE_SECURE_SETTINGS permission
     * @return {boolean}
     */
    hasSecure() {
        return this.checkPermission('WRITE_SECURE_SETTINGS');
    },
    /**
     * Returns if Auto.js has a certain permission
     * @param {Android.Manifest.Permission|Android.Manifest.PermissionAbbr} permission
     * @return {boolean}
     */
    checkPermission(permission) {
        if (typeof permission === 'undefined') {
            throw Error('Argument permission must be specified');
        }
        if (typeof permission !== 'string') {
            throw Error('Argument permission must be string type');
        }
        let _perm = Manifest.permission[permission.replace(/[^A-Z_]+/g, '')];
        let _chk_perm = context.checkCallingOrSelfPermission(_perm);
        return _chk_perm === PackageManager.PERMISSION_GRANTED;
    },
    /**
     * Checks if the specified app can modify system settings.
     * @return {boolean}
     * @see https://developer.android.com/reference/android/provider/Settings.System#canWrite(android.content.Context)
     */
    canWriteSystem() {
        return System.canWrite(context);
    },
    /**
     * Easy-to-use encapsulation for android.content.pm.PackageManager.getInstalledApplications
     * @param {{
     *     include?: string|string[],
     *     exclude?: string|string[],
     *     is_enabled?: boolean,
     *     is_system?: boolean,
     *     force_refresh?: boolean,
     * }} [options]
     * @example
     * log(appx.getInstalledApplications().length);
     * log(appx.getInstalledApplications({is_system: true}).length);
     * log(appx.getInstalledApplications({is_system: false}).length);
     * log(appx.getInstalledApplications({
     *     is_enabled: true,
     *     include: [
     *         'com.eg.android.AlipayGphone', 'com.tencent.mm',
     *         'com.android.chrome', 'com.android.vending',
     *         'com.coolapk.market', 'com.sonyericsson.android.camera',
     *         'org.autojs.autojs', 'org.autojs.autojspro',
     *     ],
     * }).getAppNames());
     * log(appx.getInstalledApplications({
     *     is_system: true,
     *     exclude: [
     *         'Alipay', 'WeChat', 'Chrome', 'Google Play Store',
     *         'CoolApk', 'Camera', 'Auto.js',
     *     ],
     * }).getPkgNames());
     * log(appx.getInstalledApplications({include: 'Alipay'}).getPkgNames());
     * @return {{
     *     app_name: string,
     *     pkg_name: string,
     *     is_enabled: boolean,
     *     is_system: boolean,
     * }[] & {
     *     getAppNames: function(): string[],
     *     getPkgNames: function(): string[],
     *     getJointStrArr: function(string?, boolean?): string[],
     * }}
     */
    getInstalledApplications(options) {
        let _opt = options || {};
        let _include = (o) => {
            let _w = x => typeof x === 'string' ? [x] : x || [];
            let _i = _w(_opt.include);
            let _e = _w(_opt.exclude);
            return (_include = _i.length
                ? o => (_i.includes(o.pkg_name) || _i.includes(o.app_name))
                    && !_e.includes(o.pkg_name) && !_e.includes(o.app_name)
                : o => !_e.includes(o.pkg_name) && !_e.includes(o.app_name))(o);
        };
        let _getState = k => typeof _opt[k] === 'function' ? _opt[k]() : _opt[k];

        let _pkg_mgr = context.getPackageManager();
        let _items = _pkg_mgr.getInstalledApplications(0).toArray().map((o) => ({
            app_name: o.loadLabel(_pkg_mgr),
            pkg_name: o.packageName,
            is_enabled: o.enabled,
            is_system: this.isSystemApp(o),
        })).filter(_include);

        let _is_system = _getState('is_system');
        if (typeof _is_system === 'boolean') {
            _items = _items.filter(o => o.is_system === _is_system);
        }

        let _is_enabled = _getState('is_enabled');
        if (typeof _is_enabled === 'boolean') {
            _items = _items.filter(o => o.is_enabled === _is_enabled);
        }

        // noinspection JSUnusedGlobalSymbols
        return Object.assign(_items, {
            getAppNames() {
                return this.map(o => o.app_name);
            },
            getPkgNames() {
                return this.map(o => o.pkg_name);
            },
            getJointStrArr(separator, is_reverse) {
                return this.map(o => is_reverse
                    ? o.pkg_name + (separator || '\n') + o.app_name
                    : o.app_name + (separator || '\n') + o.pkg_name).sort();
            },
        });
    },
    /**
     * Create a android launcher shortcut with Auto.js dialogs
     * @param {string} file
     * @example
     * appx.createShortcut('./Ant-Forest-003/ant-forest-launcher.js');
     * @see org.autojs.autojs.ui.shortcut.ShortcutCreateActivity
     */
    createShortcut(file) {
        if (!file) {
            throw Error('File is required for appx.createShortcut()');
        }

        let _file = files.path(file);

        if (!files.isFile(_file)) {
            throw Error('File argument must be a file');
        }
        if (!files.exists(_file)) {
            throw Error('File is not existed');
        }

        let _cls = new ShortcutCreateActivity().getClass();
        let _ef = ShortcutCreateActivity.EXTRA_FILE;
        let _sf = new ScriptFile(_file);
        let _intent = new Intent(context, _cls).putExtra(_ef, _sf);
        this.startActivity(_intent);
    },
    /**
     * @param {android.content.pm.ApplicationInfo} source
     * @return {boolean}
     */
    isSystemApp(source) {
        if (!(source instanceof ApplicationInfo)) {
            throw Error('Source must be the instance of ApplicationInfo');
        }
        return (source.flags & ApplicationInfo.FLAG_SYSTEM) !== 0;
    },
    /**
     * @return {{
     *     $memory_info: android.app.ActivityManager.MemoryInfo,
     *     is_low: boolean,
     *     total: number,
     *     avail: number, avail_usage: number, avail_pct: string,
     *     used: number, used_usage: number, used_pct: string,
     * }}
     */
    getMemoryInfo() {
        let _activity_man = context.getSystemService(Context.ACTIVITY_SERVICE);
        let _mem_info = new ActivityManager.MemoryInfo();
        _activity_man.getMemoryInfo(_mem_info);

        let {totalMem: _total, availMem: _avail, lowMemory: _is_low} = _mem_info;
        let _used = _total - _avail;
        let _used_usage = _used / _total;
        let _avail_usage = _avail / _total;

        return {
            $memory_info: _mem_info, total: _total, is_low: _is_low,
            avail: _avail, avail_usage: _avail_usage, avail_pct: _.toPct(_avail_usage),
            used: _used, used_usage: _used_usage, used_pct: _.toPct(_used_usage),
        };
    },
    /**
     * @param {number} [pid=android.os.Process.myPid()]
     * @return {{
     *     $process_memory_info,
     *     uss: number, pss: number,
     *     heap: string, heap_usage: number, heap_pct: string,
     * }}
     */
    getProcessMemoryInfo(pid) {
        let _rt_max = Runtime.getRuntime().maxMemory();

        let _pid = typeof pid === 'number' ? pid : Process.myPid();
        let _pmi = context.getSystemService(Context.ACTIVITY_SERVICE)
            .getProcessMemoryInfo([_pid])[0];

        let _uss = _pmi.getTotalPrivateDirty() << 10;
        let _pss = _pmi.getTotalPss() << 10;

        // allocated java heap size
        let _heap = _pmi.getMemoryStat('summary.java-heap') << 10;
        let _heap_usage = _heap / _rt_max;

        return {
            $process_memory_info: _pmi, uss: _uss, pss: _pss,
            heap: _heap, heap_usage: _heap_usage, heap_pct: _.toPct(_heap_usage),
        };
    },
    /**
     * @return {{
     *     total: number,
     *     max: number,
     *     heap: number, heap_usage: number, heap_pct: string,
     * }}
     */
    getRuntimeMemoryInfo() {
        let _rt = Runtime.getRuntime();

        let _max = _rt.maxMemory();
        let _total = _rt.totalMemory();
        let _free = _rt.freeMemory();

        let _heap = _total - _free;
        let _heap_usage = _heap / _max;

        return {
            total: _total, max: _max,
            heap: _heap, heap_usage: _heap_usage, heap_pct: _.toPct(_heap_usage),
        };
    },
};

/**
 * @type {Mod.appx}
 */
module.exports = {appx: exp};