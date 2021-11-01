let {uix} = require('./ext-ui');
let {appx} = require('./ext-app');
let {a11yx} = require('./ext-a11y');
let {consolex} = require('./ext-console');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let exp = {
    /**
     * @return {boolean}
     */
    isPro() {
        return (this.isPro = () => /Pro\b/i.test(this.getPkgName()))();
    },
    /**
     * @example
     * console.log(autojs.getName()); // like: 'Auto.js'
     * @return {string}
     */
    getAppName() {
        return 'Auto.js' + (this.isPro() ? '\x20Pro' : '');
    },
    /**
     * @example
     * console.log(appx.getAutoJsPkg()); // like: 'org.autojs.autojs'
     * @return {string}
     */
    getPkgName() {
        return context.getPackageName();
    },
    /**
     * @example
     * console.log(appx.getAutoJsVer()); // e.g. '4.1.1 Alpha2'
     * @return {?string}
     */
    getVerName() {
        // Pro version(s) (e.g. 8.8.16-0) returns abnormal value like '${xxx.xxx}'
        let _ver = app.autojs.versionName;
        return String(_ver).match(/^\d/) ? _ver : appx.getVerName('Auto.js');
    },
    getVerCode() {
        return app.autojs.versionCode;
    },
    /**
     * @param {string|number} ver
     * @example
     * console.log(autojs.isVerNewer(7)); // e.g. false
     * console.log(autojs.isVerNewer('4.1.0')); // e.g. true
     * console.log(autojs.isVerNewer('4.1.1 alpha')); // e.g. true
     * console.log(autojs.isVerNewer('4.1.1 a2')); // e.g. false
     * console.log(autojs.isVerNewer('8.9.6 beta')); // e.g. false
     * @return {boolean}
     */
    isVerNewer(ver) {
        return appx.version.isNewer(this.getVerName(), ver);
    },
    /**
     * Check if device is running compatible Auto.js version
     */
    ensureVersion() {
        let _ = {
            VERSION_UNKNOWN: -1,
            VERSION_NORMAL: 0,
            VERSION_FREE_FINAL: 'v4.1.1 Alpha2',
            bug_map: {
                ab_cwd: 'cwd()方法功能异常',
                ab_engines_set_arguments: 'engines.setArguments()功能异常',
                ab_find_for_each: 'UiSelector.find().forEach()方法功能异常',
                ab_floaty: 'Floaty模块异常',
                ab_floaty_raw_window: 'floaty.rawWindow()功能异常',
                ab_inflate: 'ui.inflate()方法功能异常',
                ab_login: '无法登陆Auto.js账户',
                ab_relative_path: '相对路径功能异常',
                ab_set_global_log_config: 'console.setGlobalLogConfig()功能异常',
                ab_simp_act_auto: 'SimpleActionAutomator模块异常',
                ab_ui_selector: 'UiSelector模块功能异常',
                ab_ui_layout: 'UI页面布局异常',
                crash_autojs: '脚本运行后导致Auto.js崩溃',
                crash_ui_call_ui: 'ui脚本调用ui脚本会崩溃',
                crash_ui_settings: '图形配置页面崩溃',
                dialogs_event: 'Dialogs模块事件失效',
                dialogs_not_responded: '无法响应对话框点击事件',
                dislocation_floaty: 'Floaty模块绘制存在错位现象',
                forcibly_update: '强制更新',
                not_full_function: '此版本未包含所需全部功能',
                press_block: 'press()方法时间过短时可能出现阻塞现象',
                un_cwd: '不支持cwd()方法及相对路径',
                un_engines: '不支持Engines模块',
                un_exec_argv: '不支持Engines模块的execArgv对象',
                un_inflate: '不支持ui.inflate()方法',
                un_relative_path: '不支持相对路径',
                un_runtime: '不支持runtime参数',
                un_view_bind: '不支持view对象绑定自定义方法',
            },
            /**
             * @param {string} ver
             * @return {string[]|number}
             */
            diagnose(ver) {
                // version ∈ 4.1.1
                // version <= Pro 8.3.16-0
                // version === Pro 7.0.0-(4|6) || version === Pro 7.0.2-4
                // version === Pro 7.0.3-7 || version === Pro 7.0.4-1
                if (ver.match(/^(4\.1\.1.+)$/) ||
                    ver.match(/^Pro 8\.([0-2]\.\d{1,2}-\d|3\.(\d|1[0-6])-0)$/) ||
                    ver.match(/^Pro 7\.0\.(0-[46]|2-4|3-7|4-1)$/)
                ) {
                    return this.VERSION_NORMAL;
                }

                // version > Pro 8.3.16
                if (ver.match(/^Pro ([89]|[1-9]\d)\./)) {
                    a11yx.bridge.resetWindowFilter();
                    return this.VERSION_NORMAL;
                }

                // 4.1.0 Alpha3 <= version <= 4.1.0 Alpha4
                if (ver.match(/^4\.1\.0 Alpha[34]$/)) {
                    return ['ab_simp_act_auto', 'dialogs_not_responded'];
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
                    return ['un_exec_argv', 'ab_inflate', 'not_full_function'];
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
                        return ['ab_find_for_each', 'not_full_function'];
                    case '4.0.4 Alpha12':
                        return ['un_exec_argv', 'not_full_function'];
                    case '4.0.5 Alpha':
                        return ['ab_ui_selector', 'not_full_function'];
                    case 'Pro 7.0.0-0':
                        return ['ab_login'];
                    case 'Pro 7.0.0-3':
                        return ['crash_ui_call_ui'];
                    case 'Pro 7.0.0-5':
                        return ['forcibly_update'];
                    case 'Pro 7.0.3-1':
                        return ['dialogs_event'];
                    case 'Pro 7.0.3-4':
                        return ['ab_set_global_log_config'];
                    case 'Pro 7.0.3-5':
                        return ['ab_floaty_raw_window'];
                    case 'Pro 7.0.3-6':
                        return ['ab_engines_set_arguments', 'press_block'];
                    case 'Pro 7.0.4-0':
                        return ['crash_ui_settings'];
                    default:
                        return this.VERSION_UNKNOWN;
                }
            },
            alert(msg) {
                alert(msg);
                exit();
            },
            dialog(msg) {
                let $ = {
                    message: msg || null,
                    is_continued: false,
                    exitNow() {
                        this.dialog.dismiss();
                        exit();
                    },
                    getView() {
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
                        _view['btn'].on('click', () => {
                            toast('已退出');
                            this.exitNow();
                        });
                        _view['btn'].on('long_click', (e) => {
                            e.consumed = this.is_continued = true;
                            if (uix.isUiMode()) {
                                return this.exitNow();
                            }
                            this.dialog.dismiss();
                            consolex.e('仍然尝试继续', 2, 0, 2);
                        });
                        ui.run(() => {
                            _view['text'].attr('text', this.message);
                            _view['img'].attr('tint_color', '#FF9100');
                        });

                        return _view;
                    },
                    getDialog() {
                        let _diag = dialogs.build({
                            customView: this.view,
                            autoDismiss: false,
                            canceledOnTouchOutside: false,
                        });

                        _diag.setOnKeyListener({
                            onKey(diag, key_code) {
                                if (key_code === KeyEvent.KEYCODE_BACK) {
                                    $.exitNow();
                                    return true;
                                }
                                return false;
                            },
                        });

                        let _win = _diag.getWindow();
                        _win.setBackgroundDrawableResource(android.R.color.transparent);
                        _win.setWindowAnimations(android.R.style.Animation_InputMethod);
                        _win.setDimAmount(0.85);

                        return _diag;
                    },
                    parseArgs() {
                        this.view = this.getView();
                        this.dialog = this.getDialog();
                    },
                    monitor() {
                        if (!uix.isUiMode()) {
                            let _start = Date.now();
                            while (!this.is_continued) {
                                sleep(200);
                                if (Date.now() - _start > 60e3) {
                                    consolex.e('等待用户操作超时', 2, 0, 2);
                                    return this.exitNow();
                                }
                            }
                        }
                    },
                    show() {
                        this.parseArgs();
                        this.dialog.show();
                        this.monitor();
                    },
                };

                $.show();
            },
            alertAndExit(ver, diagnosis) {
                let _msg = '脚本可能无法正常运行\n' + '需更换 Auto.js 版本\n\n' +
                    '软件版本:' + '\n' + ver + '\n\n' +
                    '异常详情:' + diagnosis.map((code) => {
                        return '\n' + (this.bug_map[code] || '无效的Bug描述');
                    }).join('') + '\n\n' +
                    '在项目简介中查看支持版本\n' + '或直接尝试 ' + this.VERSION_FREE_FINAL;

                exp.isVerNewer('v4.1.0') ? this.dialog(_msg) : this.alert(_msg);
            },
        };

        let $ = {
            parseArgs() {
                this.version = exp.getVerName() || '未知版本';
                this.diagnosis = _.diagnose(this.version);
            },
            bugTrigger() {
                if (typeof this.diagnosis !== 'number') {
                    consolex._('Bug版本检查: 确诊', 3);
                    return true;
                }
                if (this.diagnosis === _.VERSION_NORMAL) {
                    consolex._('Bug版本检查: 正常');
                    return false;
                }
                if (this.diagnosis === _.VERSION_UNKNOWN) {
                    consolex._('Bug版本检查: 未知');
                    return false;
                }
            },
            alertAndExit() {
                _.alertAndExit(this.version, this.diagnosis);
            },
            ensure() {
                this.parseArgs();
                this.bugTrigger() && this.alertAndExit();
            },
        };

        $.ensure();
    },
};

module.exports = {autojs: exp};