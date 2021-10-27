let {
    $$impeded, $$toast, isNullish,
} = require('./ext-global');

let {a11yx} = require('./ext-a11y');
let {devicex} = require('./ext-device');
let {timersx} = require('./ext-timers');
let {consolex} = require('./ext-console');
let {threadsx} = require('./ext-threads');
let {projectx} = require('./ext-project');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let R = android.R;
let Uri = android.net.Uri;
let Runtime = java.lang.Runtime;
let Manifest = android.Manifest;
let Process = android.os.Process;
let Intent = android.content.Intent;
let Context = android.content.Context;
let KeyEvent = android.view.KeyEvent;
let System = android.provider.Settings.System;
let ApplicationInfo = android.content.pm.ApplicationInfo;
let PackageManager = android.content.pm.PackageManager;
let ActivityManager = android.app.ActivityManager;
let ScriptFile = org.autojs.autojs.model.script.ScriptFile;
let Colors = com.stardust.autojs.core.ui.inflater.util.Colors;
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
        if (source) {
            if (source.match(/.+\..+\./)) {
                return app.getAppName(source);
            }
            if (app.getPackageName(source)) {
                return source;
            }
        }
        return null;
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
        if (source) {
            if (!source.match(/.+\..+\./)) {
                return app.getPackageName(source);
            }
            if (app.getAppName(source)) {
                return source;
            }
        }
        return null;
    },
    /**
     * Returns the version name of an app with app name or package name
     * @param {'current'|'Auto.js'|string} source - app name or app package name
     * @return {?string}
     */
    getVerName(source) {
        let _res = null;
        let _pkg_name = (() => {
            if (typeof source === 'string') {
                if (source.toLowerCase().match(/^auto\.?js$/)) {
                    return _.autojs_pkg;
                }
                if (source.toLowerCase().match(/^current$/)) {
                    return currentPackage();
                }
                return this.getPkgName(source);
            }
        })();
        if (_pkg_name) {
            try {
                /** @type {android.content.pm.PackageInfo[]} */
                let _i_pkgs = context.getPackageManager().getInstalledPackages(0).toArray();
                _i_pkgs.some((i_pkg) => {
                    if (_pkg_name === i_pkg.packageName) {
                        return _res = i_pkg.versionName;
                    }
                });
            } catch (e) {
                // nothing to do here
            }
        }
        return _res;
    },
    /**
     * @param {number} [minimum=24]
     */
    ensureSdkInt(minimum) {
        let _sdk = {
            1: {version: '1.0', release: 'September 23, 2008'},
            2: {version: '1.1', release: 'February 9, 2009'},
            3: {version: '1.5', release: 'April 27, 2009'},
            4: {version: '1.6', release: 'September 15, 2009'},
            5: {version: '2.0', release: 'October 27, 2009'},
            6: {version: '2.0.1', release: 'December 3, 2009'},
            7: {version: '2.1', release: 'January 11, 2010'},
            8: {version: ['2.2', '2.2.3'], release: 'May 20, 2010'},
            9: {version: ['2.3', '2.3.2'], release: 'December 6, 2010'},
            10: {version: ['2.3.3', '2.3.7'], release: 'February 9, 2011'},
            11: {version: '3.0', release: 'February 22, 2011'},
            12: {version: '3.1', release: 'May 10, 2011'},
            13: {version: ['3.2', '3.2.6'], release: 'July 15, 2011'},
            14: {version: ['4.0', '4.0.2'], release: 'October 18, 2011'},
            15: {version: ['4.0.3', '4.0.4'], release: 'December 16, 2011'},
            16: {version: ['4.1', '4.1.2'], release: 'July 9, 2012'},
            17: {version: ['4.2', '4.2.2'], release: 'November 13, 2012'},
            18: {version: ['4.3', '4.3.1'], release: 'July 24, 2013'},
            19: {version: ['4.4', '4.4.4'], release: 'October 31, 2013'},
            20: {version: ['4.4W', '4.4W.2'], release: 'June 25, 2014'},
            21: {version: ['5.0', '5.0.2'], release: 'November 4, 2014'},
            22: {version: ['5.1', '5.1.1'], release: 'March 2, 2015'},
            23: {version: ['6.0', '6.0.1'], release: 'October 2, 2015'},
            24: {version: '7.0', release: 'August 22, 2016'},
            25: {version: ['7.1', '7.1.2'], release: 'October 4, 2016'},
            26: {version: '8.0', release: 'August 21, 2017'},
            27: {version: '8.1', release: 'December 5, 2017'},
            28: {version: '9', release: 'August 6, 2018'},
            29: {version: '10', release: 'September 7, 2019'},
            30: {version: '11', release: 'September 8, 2020'},
            31: {version: '12', release: ''},
            /**
             * @return {{
             *     version: {min: string, max: string},
             *     release: ?Date,
             * }}
             */
            $bind() {
                let _o = {};
                let _this = this;
                let _month_map = {
                    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
                };
                let _parseDate = (s) => {
                    return !s ? null : new (Function.prototype.bind.apply(Date, [
                        Date, s.replace(/([A-Z]..)\D+?\s(\d\d?), (\d{4})/, ($0, $1, $2, $3) => {
                            return [$3, _month_map[$1], $2].join(',');
                        }).split(','),
                    ]));
                };
                Object.keys(this).forEach((k) => {
                    if (Number(k).toString() === k) {
                        let _ver = _this[k].version;
                        if (!Array.isArray(_ver)) {
                            _ver = [_ver, _ver];
                        }
                        _o[k] = {
                            version: {min: _ver[0], max: _ver[1]},
                            release: _parseDate(_this[k].release),
                        };
                    }
                });
                return _o;
            },
        }.$bind();
        let _min = minimum || 24;
        if (device.sdkInt < _min) {
            consolex.$(['脚本无法继续', _min in _sdk
                ? '安卓系统版本低于' + _sdk[_min].version.min
                : '安卓系统SDK低于' + _min], 8, 4, 0, 2);
        }
    },
    /**
     * Check if device is running compatible (relatively) Auto.js version and android sdk version
     */
    checkSdkAndAJVer() {
        this.ensureSdkInt();

        let _aj_ver = _.autojs_ver;
        let _bug_chk_res = _checkBugs(_aj_ver);
        if (_bug_chk_res === 0) {
            consolex._('Bug版本检查: 正常');
            return;
        }
        if (_bug_chk_res === '') {
            consolex._('Bug版本检查: 未知');
            return;
        }
        let _bug_chk_content = _bug_chk_res.map((code) => {
            return '\n' + _getBugDescription(code);
        });

        consolex._('Bug版本检查: 确诊');

        let _alert_msg = '此项目无法正常运行\n' + '需更换 Auto.js 版本\n\n' +
            '软件版本:' + '\n' + (_aj_ver || '/* 版本检测失败 */') + '\n\n' +
            '异常详情:' + _bug_chk_content.join('') + '\n\n' +
            '在项目简介中查看支持版本\n' + '或直接尝试 v4.1.1 Alpha2';

        projectx.version.isNewer(_aj_ver, '7.0.0') ? _showDialog() : _alertAndExit();

        // tool function(s) //

        /**
         * @param {string} ver
         * @return {string[]|number|string} -- strings[]: bug codes; 0: normal; '': unrecorded
         */
        function _checkBugs(ver) {
            // version ∈ 4.1.1
            // version <= Pro 8.3.16-0
            // version === Pro 7.0.0-(4|6) || version === Pro 7.0.2-4
            // version === Pro 7.0.3-7 || version === Pro 7.0.4-1
            if (ver.match(/^(4\.1\.1.+)$/) ||
                ver.match(/^Pro 8\.([0-2]\.\d{1,2}-\d|3\.(\d|1[0-6])-0)$/) ||
                ver.match(/^Pro 7\.0\.(0-[46]|2-4|3-7|4-1)$/)
            ) {
                return 0; // known normal
            }

            // version > Pro 8.3.16
            if (ver.match(/^Pro ([89]|[1-9]\d)\./)) {
                a11yx.bridge.resetWindowFilter();
                return 0;
            }

            // 4.1.0 Alpha3 <= version <= 4.1.0 Alpha4
            if (ver.match(/^4\.1\.0 Alpha[34]$/)) {
                return ['ab_SimpActAuto', 'dialogs_not_responded'];
            }

            // version === 4.1.0 Alpha(2|5)?
            if (ver.match(/^4\.1\.0 Alpha[25]$/)) {
                return ['dialogs_not_responded'];
            }

            // 4.0.x versions
            if (ver.match(/^4\.0\./)) {
                return ['dialogs_not_responded', 'not_full_function'];
            }

            // version === Pro 7.0.0-(1|2)
            if (ver.match(/^Pro 7\.0\.0-[12]$/)) {
                return ['ab_relative_path'];
            }

            // version === Pro 7.0.0-7 || version === Pro 7.0.1-0 || version === Pro 7.0.2-(0|3)
            if (ver.match(/^Pro 7\.0\.((0-7)|(1-0)|(2-[03]))$/)) {
                return ['crash_autojs'];
            }

            // version >= 4.0.2 Alpha7 || version === 4.0.3 Alpha([1-5]|7)?
            if (ver.match(/^((4\.0\.2 Alpha([7-9]|\d{2}))|(4\.0\.3 Alpha([1-5]|7)?))$/)) {
                return ['dislocation_floaty', 'ab_inflate', 'not_full_function'];
            }

            // version >= 3.1.1 Alpha5 || version -> 4.0.0/4.0.1 || version <= 4.0.2 Alpha6
            if (ver.match(/^((3\.1\.1 Alpha[5-9])|(4\.0\.[01].+)|(4\.0\.2 Alpha[1-6]?))$/)) {
                return ['un_execArgv', 'ab_inflate', 'not_full_function'];
            }

            // 3.1.1 Alpha3 <= version <= 3.1.1 Alpha4:
            if (ver.match(/^3\.1\.1 Alpha[34]$/)) {
                return ['ab_inflate', 'un_engines', 'not_full_function'];
            }

            // version >= 3.1.0 Alpha6 || version <= 3.1.1 Alpha2
            if (ver.match(/^((3\.1\.0 (Alpha[6-9]|Beta))|(3\.1\.1 Alpha[1-2]?))$/)) {
                return ['un_inflate', 'un_engines', 'not_full_function'];
            }

            // version >= 3.0.0 Alpha42 || version ∈ 3.0.0 Beta[s] || version <= 3.1.0 Alpha5
            if (ver.match(/^((3\.0\.0 ((Alpha(4[2-9]|[5-9]\d))|(Beta\d?)))|(3\.1\.0 Alpha[1-5]?))$/)) {
                return ['un_inflate', 'un_runtime', 'un_engines', 'not_full_function'];
            }

            // 3.0.0 Alpha37 <= version <= 3.0.0 Alpha41
            if (ver.match(/^3\.0\.0 Alpha(3[7-9]|4[0-1])$/)) {
                return ['ab_cwd', 'un_relative_path', 'un_inflate', 'un_runtime', 'un_engines', 'not_full_function'];
            }

            // 3.0.0 Alpha21 <= version <= 3.0.0 Alpha36
            if (ver.match(/^3\.0\.0 Alpha(2[1-9]|3[0-6])$/)) {
                return ['un_cwd', 'un_inflate', 'un_runtime', 'un_engines', 'not_full_function'];
            }

            // version <= 3.0.0 Alpha20
            if (ver.match(/^3\.0\.0 Alpha([1-9]|1\d|20)?$/)) {
                return ['un_cwd', 'un_inflate', 'un_runtime', 'un_engines', 'crash_ui_settings', 'not_full_function'];
            }

            switch (ver) {
                case '4.0.3 Alpha6':
                    return ['ab_floaty', 'ab_inflate', 'not_full_function'];
                case '4.0.4 Alpha':
                    return ['dislocation_floaty', 'un_view_bind', 'not_full_function'];
                case '4.0.4 Alpha3':
                    return ['dislocation_floaty', 'ab_ui_layout', 'not_full_function'];
                case '4.0.4 Alpha4':
                    return ['ab_find_forEach', 'not_full_function'];
                case '4.0.4 Alpha12':
                    return ['un_execArgv', 'not_full_function'];
                case '4.0.5 Alpha':
                    return ['ab_uiSelector', 'not_full_function'];
                case 'Pro 7.0.0-0':
                    return ['na_login'];
                case 'Pro 7.0.0-3':
                    return ['crash_ui_call_ui'];
                case 'Pro 7.0.0-5':
                    return ['forcibly_update'];
                case 'Pro 7.0.3-1':
                    return ['dialogs_event'];
                case 'Pro 7.0.3-4':
                    return ['ab_setGlobalLogConfig'];
                case 'Pro 7.0.3-5':
                    return ['ab_floaty_rawWindow'];
                case 'Pro 7.0.3-6':
                    return ['ab_engines_setArguments', 'press_block'];
                case 'Pro 7.0.4-0':
                    return ['crash_ui_settings'];
                default:
                    return ''; // unrecorded version
            }
        }

        function _getBugDescription(key) {
            let _bugs_map = {
                failed: '版本信息获取失败',
                ab_cwd: 'cwd()方法功能异常',
                ab_engines_setArguments: 'engines.setArguments()功能异常',
                ab_find_forEach: 'UiSelector.find().forEach()方法功能异常',
                ab_floaty: 'Floaty模块异常',
                ab_floaty_rawWindow: 'floaty.rawWindow()功能异常',
                ab_relative_path: '相对路径功能异常',
                ab_setGlobalLogConfig: 'console.setGlobalLogConfig()功能异常',
                ab_SimpActAuto: 'SimpleActionAutomator模块异常',
                ab_inflate: 'ui.inflate()方法功能异常',
                ab_uiSelector: 'UiSelector模块功能异常',
                ab_ui_layout: 'UI页面布局异常',
                crash_autojs: '脚本运行后导致Auto.js崩溃',
                crash_ui_call_ui: 'ui脚本调用ui脚本会崩溃',
                crash_ui_settings: '图形配置页面崩溃',
                dislocation_floaty: 'Floaty模块绘制存在错位现象',
                dialogs_event: 'Dialogs模块事件失效',
                dialogs_not_responded: '无法响应对话框点击事件',
                forcibly_update: '强制更新',
                na_login: '无法登陆Auto.js账户',
                press_block: 'press()方法时间过短时可能出现阻塞现象',
                un_cwd: '不支持cwd()方法及相对路径',
                un_engines: '不支持Engines模块',
                un_execArgv: '不支持Engines模块的execArgv对象',
                un_inflate: '不支持ui.inflate()方法',
                un_relative_path: '不支持相对路径',
                un_runtime: '不支持runtime参数',
                un_view_bind: '不支持view对象绑定自定义方法',
                not_full_function: '此版本未包含所需全部功能',
                alipay_a11y_blocked: '支付宝无障碍功能被屏蔽',
            };
            return _bugs_map[key] || '无效的Bug描述';
        }

        function _showDialog() {
            let _view = ui.inflate(
                <vertical gravity="center">
                    <x-img id="img" src="@drawable/ic_warning_black_48dp"
                           height="70" margin="0 26 0 18" gravity="center"
                           bg="?selectableItemBackgroundBorderless"/>
                    <vertical>
                        <x-text id="text" gravity="center" color="#DDF3E5F5"
                                padding="5 0 5 20" size="19"/>
                    </vertical>
                    <horizontal w="auto">
                        <x-button id="btn" type="button" layout_weight="1"
                                  text="EXIT" backgroundTint="#DDAD1457"
                                  textColor="#DDFFFFFF" marginBottom="9"/>
                    </horizontal>
                </vertical>);
            let _diag = dialogs.build({
                customView: _view,
                autoDismiss: false,
                canceledOnTouchOutside: false,
            }).show();

            let _is_continued = false;

            ui.run(() => {
                _diag.setOnKeyListener({
                    onKey(diag, key_code) {
                        if (key_code === KeyEvent.KEYCODE_BACK) {
                            _exitNow();
                            return true;
                        }
                        return false;
                    },
                });

                _view['btn'].on('click', _exitNow);
                _view['btn'].on('long_click', (e) => {
                    e.consumed = _is_continued = true;
                    if (typeof activity !== 'undefined') {
                        return _exitNow();
                    }
                    _diag.dismiss();
                    let _msg = '仍然尝试运行项目';
                    toast(_msg);
                    console.error(_msg);
                });
                _view['text'].setText(_alert_msg);
                _setTint(_view['img'], '#FF9100');

                let _win = _diag.getWindow();
                _win.setBackgroundDrawableResource(R.color.transparent);
                _win.setWindowAnimations(R.style.Animation_InputMethod);
                _win.setDimAmount(0.85);
            });

            if (typeof activity !== 'undefined') {
                return setTimeout(() => exit(), 1e3);
            }

            let _start = Date.now();
            while (!_is_continued) {
                sleep(200);
                if (Date.now() - _start > 120e3) {
                    let _msg = '等待用户操作超时';
                    console.error(_msg);
                    return _exitNow(_msg);
                }
            }

            // tool function(s) //

            function _setTint(view, color) {
                if (typeof color === 'number') {
                    color = colors.toString(color);
                }
                view.setColorFilter(Colors.parse(view, color));
            }

            function _exitNow(msg) {
                _diag.dismiss();
                typeof msg === 'string' && toast(msg);
                exit();
            }
        }

        function _alertAndExit() {
            alert('\n' + _alert_msg);
            exit();
        }
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
     * @param {string} [pkg=autojsx.getPkgName()]
     */
    launchAndClearTop(pkg) {
        this.startActivity(this.intent(this.getLaunchIntentForPackage(pkg), {
            flags: Intent.FLAG_ACTIVITY_CLEAR_TOP,
        }));
    },
    /**
     * @param {string} [pkg=autojsx.getPkgName()]
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
                    if (task.match(/^(launcher|current)(.*\d+s)?$/i)) {
                        let _mch_min = task.match(/\d+/);
                        return {
                            path: task.match(/launcher/i)
                                ? projectx.getLocal().main.path
                                : engines.myEngine().getSource(),
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
                        callback: $.killNow.bind($),
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
 * @type {External.appx}
 */
module.exports = {appx: exp};