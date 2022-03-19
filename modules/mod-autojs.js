let {uix} = require('./ext-ui');
let {appx} = require('./ext-app');
let {consolex} = require('./ext-console');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let exp = {
    /**
     * @return {boolean}
     */
    isPro() {
        return (this.isPro = () => /Pro\b/i.test(this.getPackageName()))();
    },
    /**
     * @example
     * console.log(autojs.getName()); // like: 'Auto.js'
     * @return {string}
     */
    getAppName() {
        return 'Auto.js' + (this.isPro() ? ' Pro' : '');
    },
    /**
     * @example
     * console.log(appx.getAutoJsPkg()); // like: 'org.autojs.autojs'
     * @return {string}
     */
    getPackageName() {
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
            bug_map: {
                not_aj6: '项目自 v2.3.0 起将仅支持 Auto.js 6.x 版本\n' +
                    '因项目运行依赖于 Rhino 引擎的部分新特性及 AutoJs6 的部分自定义模块',
            },
            /**
             * @param {string} ver
             * @return {string[]|number}
             */
            diagnose(ver) {
                // version ∈ 6.x
                if (ver.match(/^6\.\d+\.\d+.*$/)) {
                    return this.VERSION_NORMAL;
                }
                if (!ver.match(/^(Pro )?\d+\.\d+\.\d+.*$/)) {
                    return this.VERSION_UNKNOWN;
                }
                return ['not_aj6'];
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
                        let view = ui.inflate(
                            <vertical gravity="center">
                                <x-img id="img" src="@drawable/ic_warning_black_48dp"
                                       height="70" margin="0 26 0 18"
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
                        view['btn'].on('click', () => {
                            toast('已退出');
                            this.exitNow();
                        });
                        view['btn'].on('long_click', (e) => {
                            e.consumed = this.is_continued = true;
                            if (uix.isUiMode()) {
                                return this.exitNow();
                            }
                            this.dialog.dismiss();
                            consolex.e('仍然尝试继续', 2, 0, 2);
                        });
                        ui.run(() => {
                            view['text'].attr('text', this.message);
                            view['img'].attr('tint_color', '#FF9100');
                        });

                        return view;
                    },
                    getDialog() {
                        let diag = dialogs.build({
                            customView: this.view,
                            autoDismiss: false,
                            canceledOnTouchOutside: false,
                        });

                        diag.setOnKeyListener({
                            onKey(diag, key_code) {
                                if (key_code === KeyEvent.KEYCODE_BACK) {
                                    $.exitNow();
                                    return true;
                                }
                                return false;
                            },
                        });

                        let win = diag.getWindow();
                        win.setBackgroundDrawableResource(android.R.color.transparent);
                        win.setWindowAnimations(android.R.style.Animation_InputMethod);
                        win.setDimAmount(0.85);

                        return diag;
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
                let msg = ['脚本可能无法正常运行',
                    '需更换 Auto.js 版本', '',
                    '软件版本:', ver, '',
                    '异常详情:' + diagnosis.map(s => '\n' + this.bug_map[s]).join(''), '',
                    '在项目简介中查看支持版本',
                ].join('\n');

                exp.isVerNewer('v4.1.0') ? this.dialog(msg) : this.alert(msg);
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