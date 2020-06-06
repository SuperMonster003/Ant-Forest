/**
 * @description alipay ant forest intelligent collection script
 *
 * @since Jun 5, 2020
 * @version 1.9.19
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 *
 * @see {@link https://github.com/SuperMonster003/Ant_Forest}
 */

let $$sel, $$app, $$cfg, $$sto, $$dev, $$flag, $$acc;

let $$init = {
    check() {
        checkAlipayPackage();
        checkModulesMap();
        checkSdkAndAJVer();
        checkRootAccess();
        checkAccessibility();

        return this;

        // tool function(s) //

        function checkAlipayPackage() {
            let _pkg = "com.eg.android.AlipayGphone";
            if (!app.getAppName(_pkg)) {
                messageAction('此设备可能未安装"支付宝"应用', 9, 1, 0, "both");
            }
            $$app = {pkg_name: _pkg};
        }

        function checkModulesMap() {
            let _map = [
                "MODULE_MONSTER_FUNC", "MODULE_STORAGE",
                "MODULE_DEFAULT_CONFIG", "MODULE_PWMAP",
                "MODULE_TREASURY_VAULT", "MODULE_UNLOCK",
                "EXT_DIALOGS", "EXT_TIMERS", "EXT_DEVICE",
                "EXT_APP", "EXT_IMAGES", "EXT_ENGINES"
            ];
            let _wanted = [];
            for (let i = 0, len = _map.length; i < len; i += 1) {
                let _mod = _map[i];
                let _path = "./Modules/" + _mod + ".js";
                _path = _path.replace(/(\.js){2,}/, ".js");
                files.exists(_path) || _wanted.push(_mod);
            }
            let _wanted_len = _wanted.length;
            if (_wanted_len) {
                let [line, msg] = [showSplitLineRaw, messageActionRaw];
                let _str = "";

                void function () {
                    _str += "脚本无法继续|以下模块缺失或路径错误:|";
                    _str += "- - - - - - - - - - - - - - - - -|";
                    _wanted.forEach(n => _str += '-> "' + n + '.js"|');
                    _str += "- - - - - - - - - - - - - - - - -|";
                    _str += "请检查或重新放置模块";
                }();

                line();
                _str.split("|").forEach(s => msg(s, 4));
                line();
                toast("模块缺失或路径错误", "Long");
                exit();
            }
        }

        function checkSdkAndAJVer() {
            // do not `require()` before `checkModulesMap()`
            let _mod = require("./Modules/MODULE_MONSTER_FUNC");
            return _mod.checkSdkAndAJVer();
        }

        function checkRootAccess() {
            try {
                $$flag = {
                    autojs_has_root: !com.stardust.autojs.core.util
                        .ProcessShell.execCommand("date", true).code,
                };
            } catch (e) {
            }
        }

        function checkAccessibility() {
            let _line = showSplitLineRaw;
            let _msg = messageActionRaw;

            _checkSvc();
            _checkFunc();

            // tool function(s) //

            function _checkSvc() {
                // do not `require()` before `checkModulesMap()`
                let _a11y = require("./Modules/EXT_DEVICE").a11y;
                let $_func = x => typeof x === "function";
                let _pkg = context.packageName;
                let _perm = "android.permission.WRITE_SECURE_SETTINGS";

                if (_a11y.state()) {
                    return true;
                }

                let _mod_sto = require("./Modules/MODULE_STORAGE");
                let _mod_mon = require("./Modules/MODULE_MONSTER_FUNC");
                let $_cfg = _mod_sto.create("af_cfg").get("config", {});
                if ($_cfg.auto_enable_a11y_svc === "ON") {
                    let _max = 2;
                    while (_max--) {
                        if (!_max) {
                            if (!$$flag.autojs_has_root) {
                                break;
                            }
                            shell("pm grant " + _pkg + " " + _perm, true);
                        }
                        if (_a11y.enable(true)) {
                            _line();
                            _msg("已自动开启无障碍服务", 1);
                            _msg("尝试一次项目重启操作", 1);
                            _line();
                            _mod_mon.restartThisEngine({
                                debug_info_flag: "forcible",
                                instant_run_flag: false,
                                max_restart_engine_times: 1,
                            });
                            return sleep(1e4);
                        }
                    }
                    _autoHint();
                }

                if ($_func(auto.waitFor)) {
                    let _thd = threads.start(function () {
                        // waitFor: script will continue running rather than stop
                        // when accessibility service switched on by user
                        auto.waitFor();
                    });

                    _thd.join(1e3);

                    if (_thd.isAlive()) {
                        alert("\n" +
                            "自动跳转到无障碍服务设置页面之后\n\n" +
                            "请手动开启Auto.js无障碍服务开关\n\n" +
                            "开启后脚本将自动继续"
                        );
                    }

                    _thd.join(6e4);

                    if (_thd.isAlive()) {
                        _line();
                        _msg("等待用户开启无障碍服务超时", 4, 1);
                        _line();
                        exit();
                    }
                } else {
                    try {
                        auto();
                    } catch (e) {
                        // consume errors msg from auto()
                        alert("\n" +
                            "即将自动跳转到无障碍服务设置页面\n\n" +
                            "跳转页面后请手动开启Auto.js无障碍服务开关\n\n" +
                            "开启后需手动再次运行项目"
                        );
                    }
                    exit();
                }

                // tool function(s) {

                function _autoHint() {
                    let _shell_sc = "adb shell pm grant " + _pkg + " " + _perm;

                    _line();
                    _msg("自动开启无障碍服务失败", 4);
                    _line();
                    _msg("可能是Auto.js缺少以下权限:", 4);
                    _msg("WRITE_SECURE_SETTINGS", 4);
                    _line();
                    _msg("可尝试使用ADB工具连接手机", 3);
                    _msg("并执行以下Shell指令(无换行):\n" +
                        "\n" + _shell_sc + "\n", 3);
                    _msg("Shell指令已复制到剪切板", 3);
                    _msg("重启设备后授权不会失效", 3);

                    setClip(_shell_sc);
                }
            }

            function _checkFunc() {
                let _max = 3;
                while (!swipe(1e4, 0, 1e4, 0, 1) && _max--) {
                    sleep(300);
                }
                if (_max < 0) {
                    _line();
                    void (
                        "脚本无法继续|无障碍服务状态异常|或基于服务的方法无法使用" +
                        "|- - - - - - - - - - - - - - - - -|" +
                        "可尝试以下解决方案:" +
                        "|- - - - - - - - - - - - - - - - -|" +
                        'a. 卸载并重新安装"Auto.js"|b. 安装后重启设备|' +
                        'c. 运行"Auto.js"并拉出侧边栏|d. 开启无障碍服务|' +
                        "e. 再次尝试运行本项目"
                    ).split("|").forEach(s => _msg(s, 4));
                    _line();
                    toast("无障碍服务方法无法使用", "Long");
                    exit();
                }
            }
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
    },
    global() {
        setGlobalFunctions(); // MONSTER MODULE
        setGlobalExtensions(); // EXT MODULES

        $$sel = getSelector();

        let _mod_sto = require("./Modules/MODULE_STORAGE");
        $$sto = Object.assign($$sto || {}, {
            af: _mod_sto.create("af"),
            af_cfg: _mod_sto.create("af_cfg"),
            treas: require("./Modules/MODULE_TREASURY_VAULT"),
        });

        $$cfg = Object.assign($$cfg || {},
            require("./Modules/MODULE_DEFAULT_CONFIG").af || {},
            $$sto.af_cfg.get("config", {})
        );

        setFlags();
        debugInfo("开发者测试日志已启用", "both_dash_Up");
        debugInfo("设备型号: " + device.brand + " " + device.product);

        $$dev = Object.assign(device, require("./Modules/MODULE_UNLOCK"));
        $$dev.getDisplay(true);

        appSetter().setEngine().setTask().setParams().setBlist().setPages().setTools().setDb().init();

        accSetter().setParams().setMain();

        debugInfo("Auto.js版本: " + $$app.autojs_ver);
        debugInfo("项目版本: " + $$app.project_ver);
        debugInfo("安卓系统SDK版本: " + $$app.sdk_ver);
        debugInfo("Root权限: " + ($$app.has_root ? "有效" : "无效"));

        return this;

        // tool function(s) //

        function setGlobalFunctions() {
            // any better ideas ?

            let {
                clickAction, swipeAndShow, setIntervalBySetTimeout, keycode,
                getSelector, equalObjects, waitForAndClickAction, runJsFile,
                messageAction, debugInfo, killThisApp, clickActionsPipeline,
                waitForAction, baiduOcr, launchThisApp, observeToastMessage,
                showSplitLine, classof, timeRecorder, surroundWith,
            } = require("./Modules/MODULE_MONSTER_FUNC");

            Object.assign(global, {
                baiduOcr: baiduOcr,
                classof: classof,
                clickAction: clickAction,
                clickActionsPipeline: clickActionsPipeline,
                debugInfo: debugInfo,
                equalObjects: equalObjects,
                getSelector: getSelector,
                keycode: keycode,
                killThisApp: killThisApp,
                launchThisApp: launchThisApp,
                messageAction: messageAction,
                messageAct() {
                    return $$flag.msg_details
                        ? messageAction.apply({}, Object.values(arguments))
                        : (m, lv) => ![3, 4].includes(lv);
                },
                observeToastMessage: observeToastMessage,
                runJsFile: runJsFile,
                setIntervalBySetTimeout: setIntervalBySetTimeout,
                showSplitLine: showSplitLine,
                surroundWith: surroundWith,
                swipeAndShow: swipeAndShow,
                timeRecorder: timeRecorder,
                waitForAction: waitForAction,
                waitForAndClickAction: waitForAndClickAction,
            });
        }

        function setGlobalExtensions() {
            require("./Modules/EXT_GLOBAL_OBJ").load();
            require("./Modules/EXT_DEVICE").load();
            require("./Modules/EXT_TIMERS").load();
            require("./Modules/EXT_DIALOGS").load();
            require("./Modules/EXT_APP").load();
            require("./Modules/EXT_IMAGES").load();
            require("./Modules/EXT_THREADS").load();
            require("./Modules/EXT_ENGINES").load();
        }

        function setFlags() {
            let _cnsl_detail = $$cfg.console_log_details;
            let _dbg_info_sw = $$cfg.debug_info_switch;
            let _msg_show_sw = $$cfg.message_showing_switch;
            $$flag.msg_details = _cnsl_detail || _dbg_info_sw;
            $$flag.debug_info_avail = _dbg_info_sw && _msg_show_sw;
            $$flag.no_msg_act_flag = !_msg_show_sw;

            let _e_argv = this.e_argv = engines.execArgvJs();
            if (_e_argv.size({exclude: ["intent"]})) {
                if (!$$und(_e_argv.debug_info_flag)) {
                    $$flag.debug_info_avail = !!_e_argv.debug_info_flag;
                }
                if ($$und(_e_argv.instant_run_flag)) {
                    _e_argv.instant_run_flag = true;
                }
                if ($$und(_e_argv.no_insurance_flag)) {
                    _e_argv.no_insurance_flag = true;
                }
            }
        }

        function appSetter() {
            let _this = this;
            return {
                setEngine() {
                    let _e_argv = _this.e_argv;
                    let _my_engine = engines.myEngine();
                    let _getCwp = (e) => {
                        let _cwp = e.source.toString();
                        let _defPath = () => e.cwd() + "/Ant_Forest_Launcher.js";
                        return _cwp.match(/\[remote]/) ? _defPath() : _cwp;
                    };

                    $$app = Object.defineProperties($$app, {
                        cur_pkg: {get: () => currentPackage()},
                        now: {get: () => new Date()},
                        ts: {get: () => Date.now()},
                        ts_sec: {get: () => Date.now() / 1e3 >> 0},
                    });
                    $$app = Object.assign($$app, {
                        my_engine: _my_engine,
                        my_engine_id: _my_engine.id,
                        my_engine_argv: _e_argv,
                        cwd: _my_engine.cwd(), // `files.cwd()` also fine
                        init_scr_on: _e_argv.init_scr_on || $$dev.is_screen_on,
                        init_fg_pkg: _e_argv.init_fg_pkg || currentPackage(),
                        cwp: _getCwp(_my_engine),
                        exit(msg_fg) {
                            if (msg_fg !== false) {
                                let _s = $$app.task_name + "任务结束";
                                messageAction(_s, 1, 0, 0, "both_n");
                            }
                            return ui.post(exit);
                        },
                    });

                    return this;
                },
                setTask() {
                    $$app = Object.assign($$app, {
                        setPostponedTask: (du, if_toast) => {
                            if ($$flag.task_deploying) {
                                return;
                            }
                            threads.starts(function () {
                                $$flag.task_deploying = true;

                                let _task_s = $$app.task_name + "任务";
                                let _du_s = du + "分钟";

                                if (!$$F(if_toast)) {
                                    toast(_task_s + "推迟 " + _du_s);
                                }

                                messageAction("推迟" + _task_s, 1, 0, 0, -1);
                                messageAction("推迟时长: " + _du_s, 1, 0, 0, 1);

                                let _ts = $$app.ts + du * 60e3;
                                let _par = {path: $$app.cwp, date: _ts};
                                let _task = timers.addDisposableTask(_par);

                                let _suff = "";
                                if ($$sto.af.get("fg_blist_ctr")) {
                                    _suff = "_auto";
                                }

                                $$sto.af.put("next_auto_task", {
                                    task_id: _task.id,
                                    timestamp: _ts,
                                    type: "postponed" + _suff,
                                });

                                ui.post(exit);
                            });
                        },
                    });

                    return this;
                },
                setParams() {
                    // unescape() is deprecated (although not strictly)
                    // let _unESC = s => unescape(s.replace(/(\w{4})/g, "%u$1"));
                    let _unESC = (s) => s.replace(/.{4}/g, ($0) => (
                        String.fromCharCode(parseInt($0, 16))
                    ));
                    let _local_pics_path = files.getSdcardPath() + "/.local/Pics/";

                    files.createWithDirs(_local_pics_path);

                    $$app = Object.assign($$app, {
                        task_name: surroundWith(_unESC("8682868168EE6797")),
                        rl_title: _unESC("2615FE0F0020597D53CB6392884C699C"),
                        local_pics_path: _local_pics_path,
                        rex_energy_amt: /^\s*\d+(\.\d+)?(k?g|t)\s*$/,
                        has_root: $$flag.autojs_has_root,
                    });
                    $$app = Object.assign($$app, {
                        intent: {
                            home: {
                                action: "VIEW",
                                data: _encURIPar("alipays://platformapi/startapp", {
                                    saId: 20000067,
                                    url: "https://60000002.h5app.alipay.com/www/home.html",
                                    __webview_options__: {
                                        appClearTop: true,
                                        startMultApp: true,
                                        enableCubeView: false,
                                        enableScrollBar: false,
                                        backgroundColor: "-1",
                                        transparentTitle: "auto",
                                    },
                                }),
                            },
                            rl: {
                                action: "VIEW",
                                data: _encURIPar("alipays://platformapi/startapp", {
                                    saId: 20000067,
                                    url: "https://60000002.h5app.alipay.com/www/listRank.html",
                                    __webview_options__: {
                                        appClearTop: true,
                                        startMultApp: true,
                                        showOptionMenu: true,
                                        gestureBack: true,
                                        backBehavior: "back",
                                        enableCubeView: false,
                                        enableScrollBar: false,
                                        backgroundColor: "-1",
                                        defaultTitle: $$app.rl_title,
                                        transparentTitle: "none",
                                    },
                                }),
                            },
                            acc_man: {
                                action: "VIEW",
                                data: "alipays://platformapi/startapp?appId=20000027",
                            },
                            acc_login: {
                                action: "VIEW",
                                data: "alipays://platformapi/startapp?appId=20000008",
                            },
                        },
                        fri_drop_by: {
                            _pool: [],
                            _max: 5,
                            ic(name) {
                                let _ctr = this._pool[name] || 0;
                                if (_ctr === this._max) {
                                    debugInfo("发送排行榜复查停止信号");
                                    debugInfo(">已达连续好友访问最大阈值");
                                    $$flag.rl_review_stop = true;
                                }
                                this._pool[name] = ++_ctr;
                            },
                            dc(name) {
                                let _ctr = this._pool[name] || 0;
                                this._pool[name] = _ctr > 1 ? --_ctr : 0;
                            },
                        },
                    });

                    return this;

                    // tool function(s) //

                    function _encURIPar(pref, par) {
                        let _par = par || {};
                        let _sep = pref.match(/\?/) ? "&" : "?";

                        let _parseObj = (o) => {
                            let _res = [];
                            Object.keys(o).forEach((key) => {
                                let _val = o[key];
                                if (typeof _val === "object") {
                                    _val = "&" + _parseObj(_val);
                                }
                                let _enc_val = encodeURI(_val);
                                if (global.$$app && $$app.rl_title === _val) {
                                    _enc_val = _val;
                                }
                                _res.push(key + "=" + _enc_val);
                            });
                            return _res.join("&");
                        };

                        return pref + _sep + _parseObj(_par);
                    }
                },
                setBlist() {
                    $$app.blist = {
                        _expired: {
                            trigger(ts) {
                                if ($$und(ts) || $$inf(ts)) {
                                    return false;
                                }

                                let _now = this.now = new Date(); // Date{}
                                let _du_ts = this.du_ts = ts - +_now;

                                return _du_ts <= 0;
                            },
                            message() {
                                if (!$$flag.msg_details) {
                                    return;
                                }

                                let _date_str = this.now.toDateString();
                                let _date_ts = Date.parse(_date_str); // num
                                let _du_o = new Date(_date_ts + this.du_ts);

                                let _d_unit = 24 * 3.6e6;
                                let _d = Math.trunc(this.du_ts / _d_unit);
                                let _h = _du_o.getHours();
                                let _m = _du_o.getMinutes();
                                let _s = _du_o.getSeconds();

                                let _pad = num => ("0" + num).slice(-2);
                                let _d_str = _d ? _d + "天" : "";
                                let _h_str = _h ? _pad(_h) + "时" : "";
                                let _m_str = _h || _m ? _pad(_m) + "分" : "";
                                let _s_str = (_h || _m ? _pad(_s) : _s) + "秒";

                                return _d_str + _h_str + _m_str + _s_str + "后解除";
                            }
                        },
                        _showMsg(type, data) {
                            let _this = this;

                            if (type === "add") {
                                messageAct("已加入黑名单", 1, 0, 1);
                            } else if (type === "exists") {
                                messageAct("黑名单好友", 1, 0, 1);
                                messageAct("已跳过收取", 1, 0, 1);
                            }

                            let _rsn_o = {
                                "protect_cover": "好友使用能量保护罩",
                                "by_user": "用户自行设置",
                            };

                            let _rsn = _rsn_o[data.reason];
                            let _str = _getExpiredStr(data.timestamp);

                            messageAction(_rsn, 1, 0, 2);
                            $$str(_str) && messageAct(_str, 1, 0, 2);

                            // tool function(s) //

                            function _getExpiredStr(ts) {
                                if (_this._expired.trigger(ts)) {
                                    return _this._expired.message();
                                }
                            }
                        },
                        get(name, ref) {
                            if (!name) {
                                return ref;
                            }
                            let _len = this.data.length;
                            let _name = name.trimBoth();
                            for (let i = 0; i < _len; i += 1) {
                                if (_name === this.data[i].name.trimBoth()) {
                                    this._showMsg("exists", this.data[i]);
                                    return true;
                                }
                            }
                            return ref;
                        },
                        save() {
                            $$sto.af.put("blacklist", this.data);
                            return this;
                        },
                        add(data_par) {
                            if ($$len(arguments, 3)) {
                                data_par = {
                                    name: arguments[0],
                                    timestamp: arguments[1],
                                    reason: arguments[2],
                                };
                            }
                            let _nick = data_par.name;
                            let _len = this.data.length;
                            for (let i = 0; i < _len; i += 1) {
                                let _o = this.data[i];
                                let _name = _o.name;
                                let _rsn = _o.reason;
                                if (_nick === _name && _rsn === "protect_cover") {
                                    delete this.data[i];
                                    break;
                                }
                            }
                            this.data.push(data_par);
                            this._showMsg("add", data_par);
                            return this;
                        },
                        data: [],
                        init() {
                            let _blist_setter = this;
                            blistInitializer().get().clean().message().assign();
                            return _blist_setter;

                            // tool function(s) //

                            function blistInitializer() {
                                let _blist_data = [];
                                return {
                                    get() {
                                        // legacy: {name: {timestamp::, reason::}}
                                        // modern: [{name::, reason::, timestamp::}]
                                        _blist_data = $$sto.af.get("blacklist", []);
                                        if ($$obj(_blist_data)) {
                                            let _data = [];
                                            Object.keys(_blist_data).forEach((name) => {
                                                _data.push(Object.assign(
                                                    {name: name}, _blist_data[name]
                                                ));
                                            });
                                            _blist_data = _data;
                                        }
                                        return this;
                                    },
                                    clean() {
                                        this.deleted = [];
                                        let _expired = (ts) => {
                                            return _blist_setter._expired.trigger(ts);
                                        };
                                        for (let i = 0; i < _blist_data.length; i += 1) {
                                            let _o = _blist_data[i];
                                            if (!$$obj(_o)) {
                                                _blist_data.splice(i--, 1);
                                                continue;
                                            }
                                            let _name = _o.name;
                                            let _ts = _o.timestamp;

                                            if (!_ts || _expired(_ts)) {
                                                this.deleted.push(_name);
                                                _blist_data.splice(i--, 1);
                                            }
                                        }
                                        return this;
                                    },
                                    message() {
                                        let _len = this.deleted.length;
                                        if (_len && $$flag.msg_details) {
                                            let _msg = "移除黑名单记录: " + _len + "项";
                                            messageAct(_msg, 1, 0, 0, "both");
                                            this.deleted.forEach(n => messageAct(n, 1, 0, 1));
                                        }
                                        return this;
                                    },
                                    assign() {
                                        _blist_setter.data = _blist_data;
                                        return this;
                                    },
                                };
                            }
                        },
                    }.init().save();

                    return this;
                },
                setPages() {
                    $$app.page = {
                        _plans: {
                            back: (() => {
                                let _text = () => {
                                    return $$sel.pickup(["返回", "c0", {clickable: true}])
                                        || $$sel.pickup(["返回", {clickable: true}]);
                                };
                                let _id = () => {
                                    $$sel.pickup(idMatches(/.*h5.+nav.back|.*back.button/));
                                };
                                let _bak = [0, 0, cX(100), cYx(200)];

                                return [_text, _id, _bak];
                            })(),
                            close: (() => {
                                let _text = () => {
                                    return $$sel.pickup([/关闭|Close/, "c0", {clickable: true}])
                                        || $$sel.pickup([/关闭|Close/, {clickable: true}]);
                                };
                                let _id = () => null; // so far
                                let _bak = [cX(0.8), 0, -1, cYx(200)];

                                return [_text, _id, _bak];
                            })(),
                            launch: {
                                af: {
                                    _launcher(trigger, par) {
                                        return launchThisApp(trigger, Object.assign({}, {
                                            task_name: $$app.task_name,
                                            package_name: $$app.pkg_name,
                                            no_message_flag: true,
                                            condition_launch() {
                                                return $$app.page.af.isInPage();
                                            },
                                            // TODO...
                                            // condition_ready: {
                                            //     necessary_sel_key: "af_title",
                                            //     optional_sel_keys: ["af_home", "rl_ent"],
                                            // },
                                            condition_ready() {
                                                let _nec_sel_key = "af_title";
                                                let _opt_sel_keys = ["af_home", "rl_ent"];

                                                if (_necessary() && _optional()) {
                                                    delete $$flag.launch_necessary;
                                                    delete $$flag.launch_optional;
                                                    return true;
                                                }

                                                // tool function(s) //

                                                function _necessary() {
                                                    if ($$flag.launch_necessary) {
                                                        return true;
                                                    }

                                                    if (!$$bool($$flag.launch_necessary)) {
                                                        debugInfo("等待启动必要条件");
                                                    }

                                                    if ($$sel.get(_nec_sel_key)) {
                                                        debugInfo(["已满足启动必要条件:", _nec_sel_key]);
                                                        $$flag.launch_necessary = true;
                                                        return true;
                                                    }
                                                    $$flag.launch_necessary = false;
                                                }

                                                function _optional() {
                                                    if (!$$bool($$flag.launch_optional)) {
                                                        debugInfo("等待启动可选条件");
                                                    }
                                                    let _len = _opt_sel_keys.length;
                                                    for (let i = 0; i < _len; i += 1) {
                                                        let _key_sel = _opt_sel_keys[i];
                                                        if ($$sel.get(_key_sel)) {
                                                            debugInfo(["已满足启动可选条件", ">" + _key_sel]);
                                                            return true;
                                                        }
                                                    }
                                                    $$flag.launch_optional = false;
                                                }
                                            },
                                            disturbance() {
                                                clickAction($$sel.pickup("打开"), "w");
                                                $$app.page.disPermissionDiag();
                                            },
                                            screen_orientation: 0,
                                        }, par || {}));
                                    },
                                    intent() {
                                        let _i = $$app.intent.home;
                                        if (app.checkActivity(_i)) {
                                            return this._launcher(_i);
                                        }
                                        this._showActHint();
                                    },
                                    click_btn() {
                                        let _this = this;
                                        let _node_af_btn = null;
                                        let _sel_af_btn = () => _node_af_btn = $$sel.get("af");

                                        return _alipayHome() && _clickAFBtn();

                                        // tool function(s) //

                                        function _alipayHome() {
                                            let _cA = $$app.page.alipay.home;
                                            let _cB = () => waitForAction(_sel_af_btn, 1.5e3, 80);

                                            return _cA() && _cB();
                                        }

                                        function _clickAFBtn() {
                                            let _trigger = () => clickAction(_node_af_btn, "w");
                                            return _this._launcher(_trigger);
                                        }
                                    },
                                    search_kw() {
                                        let _this = this;
                                        let _node_search_aim = null;
                                        return _alipayHome() && _search() && _launch();

                                        // tool function(s) //

                                        function _alipayHome() {
                                            let _cA = $$app.page.alipay.home;
                                            let _cB = () => {
                                                let _kw_af_btn = idMatches(/.*home.+search.but.*/);
                                                let _par = {click_strategy: "w"};

                                                return waitForAndClickAction(_kw_af_btn, 1.5e3, 80, _par);
                                            };

                                            return _cA() && _cB();
                                        }

                                        function _search() {
                                            let _text = "蚂蚁森林小程序";
                                            let _kw_inp_box = idMatches(/.*search.input.box/);
                                            let _kw_search_confirm = idMatches(/.*search.confirm/);
                                            let _sel_inp_box = () => $$sel.pickup(_kw_inp_box);
                                            let _sel_search_aim = () => _node_search_aim = $$sel.get("af");

                                            if (!waitForAction(_sel_inp_box, 5e3, 80)) {
                                                return;
                                            }

                                            setText(_text);
                                            waitForAction(() => $$sel.pickup(_text), 3e3, 80);

                                            return clickAction(_kw_search_confirm, "w", {
                                                condition_success: _sel_search_aim,
                                                max_check_times: 10,
                                                check_time_once: 300,
                                            });
                                        }

                                        function _launch() {
                                            let _max = 8;
                                            let _b = _node_search_aim.bounds();

                                            while (_max--) {
                                                if (_node_search_aim.clickable()) {
                                                    break;
                                                }
                                                _node_search_aim = _node_search_aim.parent();
                                            }

                                            let _cx = _b.centerX();
                                            let _cy = _b.centerY();
                                            let _click_o = _max < 0 ? [_cx, _cy] : _node_search_aim;
                                            let _stg = _max < 0 ? "click" : "widget";

                                            return _this._launcher(() => clickAction(_click_o, _stg));
                                        }
                                    },
                                },
                                rl: {
                                    _launcher(trigger, par) {
                                        return launchThisApp(trigger, Object.assign({}, {
                                            task_name: "好友排行榜",
                                            package_name: $$app.pkg_name,
                                            no_message_flag: true,
                                            condition_launch: () => true,
                                            condition_ready() {
                                                let _rl = $$app.page.rl;
                                                let _inPage = () => _rl.isInPage();
                                                let _loading = () => $$sel.pickup(/加载中.*/);
                                                let _cA = () => !_loading();
                                                let _cB = () => !waitForAction(_loading, 360, 120);
                                                let _listLoaded = () => _cA() && _cB();

                                                return _inPage() && _listLoaded();
                                            },
                                            disturbance() {
                                                clickAction($$sel.pickup(/再试一次|打开/), "w");
                                            },
                                            screen_orientation: 0,
                                        }, par || {}));
                                    },
                                    intent() {
                                        let _i = $$app.intent.rl;
                                        if (app.checkActivity(_i)) {
                                            return this._launcher(_i);
                                        }
                                        this._showActHint();
                                    },
                                    click_btn() {
                                        let _node_rl_ent = null;
                                        let _sel_rl_ent = () => _node_rl_ent = $$sel.get("rl_ent");

                                        return _locateBtn() && _launch();

                                        // tool function(s) //

                                        function _locateBtn() {
                                            let _max = 8;
                                            while (_max--) {
                                                if (waitForAction(_sel_rl_ent, 1.5e3)) {
                                                    return true;
                                                }
                                                if ($$sel.get("alipay_home")) {
                                                    debugInfo(["检测到支付宝主页页面", "尝试进入蚂蚁森林主页"]);
                                                    $$app.page.af.home();
                                                } else if ($$sel.get("rl_title")) {
                                                    debugInfo(["检测到好友排行榜页面", "尝试关闭当前页面"]);
                                                    $$app.page.back();
                                                } else {
                                                    debugInfo(["未知页面", "尝试关闭当前页面"]);
                                                    keycode(4, {double: true});
                                                }
                                            }
                                            if (_max >= 0) {
                                                debugInfo('定位到"查看更多好友"按钮');
                                                return true;
                                            }
                                            messageAction('定位"查看更多好友"超时', 3, 1, 0, 1);
                                        }

                                        function _launch() {
                                            let _trig = () => widgetClick() || swipeClick();

                                            return this._launcher(_trig);

                                            // tool function(s) //

                                            function widgetClick() {
                                                let _cA = () => clickAction(_node_rl_ent, "w");
                                                let _cB = () => waitForAction(() => !_sel_rl_ent(), 800);

                                                return _cA() && _cB();
                                            }

                                            function swipeClick() {
                                                debugInfo('备份方案点击"查看更多好友"');

                                                return swipeAndShow(_node_rl_ent, {
                                                    swipe_time: 200,
                                                    check_interval: 100,
                                                    if_click: "click",
                                                });
                                            }
                                        }
                                    },
                                },
                                _showActHint() {
                                    // TODO ...
                                    let _msg = "Activity在设备系统中不存在";
                                    messageAction(_msg, 3, 0, 0, "both");
                                },
                            },
                        },
                        _getClickable(coord) {
                            let _sel = selector();
                            coord = coord.map((x, i) => !~x ? i % 2 ? W : H : x);
                            let _sel_b = _sel.boundsInside.apply(_sel, coord);
                            return _sel_b.clickable().findOnce();
                        },
                        _implement(fs, no_bak) {
                            for (let i = 0, len = fs.length; i < len; i += 1) {
                                let _checker = fs[i];
                                if ($$arr(_checker)) {
                                    if (no_bak) {
                                        continue;
                                    }
                                    _checker = () => this._getClickable(fs[i]);
                                }
                                let _node = _checker();
                                if (_node) {
                                    return clickAction(_node, "w");
                                }
                            }
                        },
                        _plansLauncher(aim, plans_arr, shared_opt) {
                            let _aim = $$app.page._plans.launch[aim];
                            let _share = shared_opt || {};

                            for (let i = 0, len = plans_arr.length; i < len; i += 1) {
                                let _ele = plans_arr[i];
                                let _key = $$str(_ele) ? _ele : Object.keys(_ele)[0];
                                let _func = _aim[_key];

                                if (!$$func(_func)) {
                                    messageAction("启动器计划方案无效", 4, 1, 0, -1);
                                    messageAction("计划: " + aim, 4, 0, 1);
                                    messageAction("方案: " + _key, 9, 0, 1, 1);
                                }

                                let _params = $$str(_ele) ? {} : _ele[_key];
                                Object.assign(_params, _share);

                                if (_func.bind(_aim)(_params)) {
                                    return true;
                                }
                            }
                        },
                        autojs: {
                            _pickupTitle: (rex) => $$sel.pickup([rex, {
                                className: "TextView",
                                boundsInside: [cX(0.12), cYx(0.03), halfW, cYx(0.12)],
                            }]),
                            get is_log() {
                                return this._pickupTitle(/日志|Log/);
                            },
                            get is_settings() {
                                return this._pickupTitle(/设置|Settings?/);
                            },
                            get is_home() {
                                return $$sel.pickup(idMatches(/.*action_(log|search)/));
                            },
                            get is_fg() {
                                return $$sel.pickup(["Navigate up", {className: "ImageButton"}])
                                    || this.is_home || this.is_log || this.is_settings
                                    || $$sel.pickup(idMatches(/.*md_\w+/));
                            },
                            spring_board: {
                                on: () => $$cfg.app_launch_springboard === "ON",
                                employ() {
                                    if (!this.on()) {
                                        return false;
                                    }

                                    debugInfo("开始部署启动跳板");

                                    let _aj_name = $$app.cur_autojs_name;
                                    let _res = launchThisApp($$app.cur_autojs_pkg, {
                                        app_name: _aj_name,
                                        debug_info_flag: false,
                                        no_message_flag: true,
                                        first_time_run_message_flag: false,
                                        condition_ready: () => $$app.page.autojs.is_fg,
                                    });

                                    if (_res) {
                                        debugInfo("跳板启动成功");
                                        return true;
                                    }
                                    debugInfo("跳板启动失败", 3);
                                    debugInfo(">打开" + _aj_name + "应用超时", 3);
                                },
                                remove() {
                                    if (!this.on()) {
                                        return;
                                    }
                                    if (!$$flag.alipay_closed) {
                                        return debugInfo(["跳过启动跳板移除操作", ">支付宝未关闭"]);
                                    }

                                    let _isFg = () => $$app.page.autojs.is_fg;
                                    let _isHome = () => $$app.page.autojs.is_home;
                                    let _back2 = () => {
                                        keycode(4, {double: true});
                                        sleep(400);
                                    };
                                    let _restore = (cmd) => {
                                        let _page = surroundWith(cmd.toTitleCase(), "\x20");
                                        let _msg = "恢复跳板" + _page + "页面";
                                        debugInfo(_msg);
                                        toast(_msg);
                                        return app.startActivity(cmd);
                                    };

                                    if (!waitForAction(_isFg, 9e3, 300)) {
                                        let _aj_name = $$app.cur_autojs_name;
                                        return debugInfo("等待返回" + _aj_name + "应用页面超时");
                                    }

                                    return _checkInitState();

                                    // tool function(s) //

                                    function _remove(condF, removeF) {
                                        debugInfo("移除启动跳板");
                                        let _max = 5;
                                        while (condF() && _max--) removeF();
                                        if (_max > 0) {
                                            debugInfo("跳板移除成功");
                                            return true;
                                        }
                                        debugInfo("跳板移除可能失败", 3);
                                    }

                                    function _checkInitState() {
                                        let {
                                            init_home, init_log,
                                            init_settings, init_fg,
                                        } = $$app.init_autojs_state;

                                        if (!init_fg) {
                                            return _remove(_isFg, _back2);
                                        }
                                        if (!init_home) {
                                            if (init_log) {
                                                return _restore("console");
                                            }
                                            if (init_settings) {
                                                return _restore("settings");
                                            }
                                            return _remove(_isHome, _back2);
                                        }

                                        return debugInfo("无需移除启动跳板");
                                    }
                                },
                            },
                        },
                        alipay: {
                            home(par) {
                                return launchThisApp($$app.pkg_name, Object.assign({
                                    app_name: "支付宝",
                                    no_message_flag: true,
                                    condition_ready() {
                                        let _pg = $$app.page;
                                        _pg.disPermissionDiag();
                                        _pg.close("no_bak") || _pg.back();
                                        return _pg.alipay.isInPage();
                                    },
                                    screen_orientation: 0,
                                }, par || {}));
                            },
                            close() {
                                debugInfo("关闭支付宝");

                                let _pkg = $$app.pkg_name;
                                let _res = killThisApp(_pkg, {shell_acceptable: true});

                                if (!_res) {
                                    return debugInfo("支付宝关闭超时", 3);
                                }

                                debugInfo("支付宝关闭完毕");
                                return $$flag.alipay_closed = true;
                            },
                            isInPage() {
                                return $$sel.get("alipay_home");
                            },
                        },
                        af: {
                            home(plans_arr) {
                                return this.launch(plans_arr);
                            },
                            launch(plans_arr, shared_opt) {
                                $$app.page.autojs.spring_board.employ();

                                // TODO loadFromConfig
                                let _plans = plans_arr || ["intent", "click_btn", "search_kw"];
                                let _shared_opt = shared_opt || {};
                                let _res = $$app.page._plansLauncher("af", _plans, _shared_opt);

                                $$app.monitor.mask_layer.start();

                                return _res;
                            },
                            close() {
                                debugInfo("关闭全部蚂蚁森林相关页面");

                                timeRecorder("close_af_win");
                                let _cA = () => $$sel.get("af_title");
                                let _cB = () => $$sel.get("rl_title");
                                let _cC = () => $$sel.pickup([/浇水|发消息/, {className: "Button"}]);
                                let _cD = () => $$sel.get("login_new_acc");
                                let _tOut = () => timeRecorder("close_af_win", "L") >= 10e3;
                                let _cond = () => _cA() || _cB() || _cC() || _cD();

                                while (_cond() && !_tOut()) {
                                    $$app.page.keyBack();
                                    sleep(700);
                                }

                                let _succ = ["相关页面关闭完毕", "保留当前支付宝页面"];
                                debugInfo(_tOut() ? "页面关闭可能未成功" : _succ);
                            },
                            isInPage() {
                                // noinspection JSIncompatibleTypesComparison
                                let _cA = () => $$app.cur_pkg === $$app.pkg_name;
                                let _cB = function () {
                                    return $$sel.get("rl_ent")
                                        || $$sel.get("af_home")
                                        || $$sel.get("wait_awhile");
                                };
                                return _cA() || _cB();
                            },
                        },
                        rl: {
                            get capt_img() {
                                return this._capt || this.capt();
                            },
                            set capt_img(img) {
                                this._capt = img;
                            },
                            capt() {
                                images.reclaim(this._capt);
                                return this.capt_img = images.capt();
                            },
                            pool: {
                                data: [],
                                add() {
                                    let _rl = $$app.page.rl;
                                    let _pool = this.data;
                                    _pool.unshift(images.copy(_rl.capt()));
                                    return this;
                                },
                                filter() {
                                    let _pool = this.data;
                                    for (let i = 0; i < _pool.length; i += 1) {
                                        if (images.isRecycled(_pool[i])) {
                                            _pool.splice(i--, 1);
                                        }
                                    }
                                    return this;
                                },
                                trim() {
                                    let _pool = this.data;

                                    for (let i = _pool.length; i-- > 2;) {
                                        images.reclaim(_pool[i]);
                                        _pool[i] = null;
                                        _pool.splice(i, 1);
                                    }
                                    return this;
                                },
                                clean() {
                                    debugInfo("清理排行榜截图样本池");
                                    let _pool = this.data;
                                    while (_pool.length) {
                                        _pool.shift().recycle();
                                    }
                                    return this;
                                },
                                isDiff() {
                                    let _pool = this.data;
                                    if (_pool.length !== 2) {
                                        return true;
                                    }
                                    return !images.findImage.apply({}, _pool);
                                }
                            },
                            btm_tpl: {
                                path: $$cfg.rank_list_bottom_template_path,
                                img: images.read($$cfg.rank_list_bottom_template_path),
                            },
                            launch(plans_arr, shared_opt) {
                                // TODO split from alipay spring board
                                $$app.page.autojs.spring_board.employ();

                                // TODO loadFromConfig
                                let _plans = plans_arr || ["intent", "click_btn"];
                                let _shared_opt = shared_opt || {};

                                return $$app.page._plansLauncher("rl", _plans, _shared_opt);
                            },
                            backTo() {
                                let _isIn = () => $$flag.rl_in_page;
                                let _max = 3;
                                let _this = this;
                                while (_max--) {
                                    sleep(240);
                                    keycode(4);
                                    debugInfo("模拟返回键返回排行榜页面");
                                    if (waitForAction(_isIn, 2.4e3, 80)) {
                                        sleep(240);
                                        if (waitForAction(_isIn, 480, 80)) {
                                            debugInfo("返回排行榜成功");
                                            return true;
                                        }
                                        if ($$app.page.fri.isInPage()) {
                                            debugInfo("当前页面为好友森林页面");
                                            continue;
                                        }
                                    }
                                    if ($$app.page.alipay.isInPage()) {
                                        debugInfo("当前页面为支付宝首页");
                                        debugInfo("重新跳转至排行榜页面");
                                        return _this.launch();
                                    }
                                    debugInfo("返回排行榜单次超时");
                                }

                                let _str_b1 = "返回排行榜失败";
                                let _str_b2 = "尝试重启支付宝到排行榜页面";
                                debugInfo([_str_b1, _str_b2], 3);
                                $$app.page.af.home();
                                $$af.fri.launch();
                            },
                            isInPage() {
                                let _fg = $$flag.rl_in_page;
                                if (!$$und(_fg)) {
                                    return _fg;
                                }
                                return $$sel.get("rl_title");
                            },
                        },
                        fri: {
                            in_page_rex: new RegExp(
                                /来浇过水.+|(帮忙)?收取\s?\d+g/.source + "|" +
                                /赠送的\s?\d+g\s?.*能量|点击加载更多/.source
                            ),
                            in_page_rex_spe: /今天|昨天|\d{2}-\d{2}/, // > cY(0.85)
                            isInPage() {
                                let _this = this;
                                return _chkTitle() && _chkPageRex();

                                // tool function(s) //

                                function _chkTitle() {
                                    if (_this._is_title_ready_fg) {
                                        return true;
                                    }
                                    if ($$sel.get("fri_frst_tt")) {
                                        return _this._is_title_ready_fg = true;
                                    }
                                }

                                function _chkPageRex() {
                                    let _rex = _this.in_page_rex;
                                    if ($$sel.pickup(_rex)) {
                                        _this.in_page_rex_sel_str = $$sel.pickup(_rex, "sel_str")
                                        delete _this._is_title_ready_fg;
                                        return true;
                                    }
                                    let _rex_spe = _this.in_page_rex_spe;
                                    let _bnd = $$sel.pickup(_rex_spe, "bounds");
                                    if (_bnd && _bnd.top > cY(0.85)) {
                                        _this.in_page_rex_sel_str = $$sel.pickup(_rex_spe, "sel_str")
                                        delete _this._is_title_ready_fg;
                                        return true;
                                    }
                                }
                            },
                            getReady() {
                                $$app.monitor.reload_btn.start();

                                let _max = 20e3;
                                let _max_b = _max;
                                let _itv = 200;

                                while (!this.isInPage() && _max > 0) {
                                    let _ratio = $$sel.get("wait_awhile") ? 1 / 6 : 1;
                                    _max -= _itv * _ratio;
                                    sleep(_itv);
                                }

                                let _sec = (_max_b - _max) / 1e3;
                                if (_sec >= 6) {
                                    debugInfo("进入好友森林时间较长: " + _sec.toFixedNum(2) + "秒");
                                }

                                $$app.monitor.reload_btn.interrupt();
                                return _max > 0 ? true : messageAction("进入好友森林超时", 3, 1);
                            },
                            pool: {
                                data: [],
                                interval: $$cfg.fri_forest_pool_itv,
                                limit: $$cfg.fri_forest_pool_limit,
                                get len() {
                                    return this.data.length;
                                },
                                get filled_up() {
                                    return this.len >= this.limit;
                                },
                                add(capt) {
                                    capt = capt || images.capt();
                                    this.filled_up && this.reclaimLast();
                                    let _img_name = images.getName(capt);
                                    debugInfo("添加好友森林采样: " + _img_name);
                                    this.data.unshift(capt);
                                },
                                reclaimLast() {
                                    let _last = this.data.pop();
                                    let _img_name = images.getName(_last);
                                    debugInfo("好友森林采样已达阈值: " + this.limit);
                                    debugInfo(">移除并回收最旧样本: " + _img_name);
                                    images.reclaim(_last);
                                    _last = null;
                                },
                                reclaimAll() {
                                    if (!this.len) {
                                        return;
                                    }
                                    debugInfo("回收全部好友森林采样");
                                    this.data.forEach((capt) => {
                                        let _img_name = images.getName(capt);
                                        images.reclaim(capt);
                                        debugInfo(">已回收: " + _img_name);
                                        capt = null;
                                    });
                                    this.clear();
                                    debugInfo("好友森林样本已清空");
                                },
                                clear() {
                                    this.data.splice(0, this.len);
                                },
                                detectCover() {
                                    let [_l, _t] = [cX(288), cYx(210)];
                                    let [_w, _h] = [cX(142), cYx(44)];
                                    let _clip = (img) => {
                                        if (!images.isRecycled(img)) {
                                            return images.clip(img, _l, _t, _w, _h);
                                        }
                                    };
                                    let _len = this.len;
                                    let _data = this.data;
                                    let _clo = $$cfg.protect_cover_ident_color;
                                    let _thrd = $$cfg.protect_cover_ident_threshold;
                                    let _par = {threshold: _thrd};

                                    for (let i = 0; i < _len; i += 1) {
                                        let _clp = _clip(_data[i]);
                                        if (_clp && images.findColor(_clp, _clo, _par)) {
                                            return true;
                                        }
                                    }
                                },
                            },
                        },
                        back(no_bak) {
                            return this._implement(this._plans.back, no_bak);
                        },
                        close(no_bak) {
                            return this._implement(this._plans.close, no_bak);
                        },
                        keyBack: n => keycode(4, n),
                        closeIntelligently() {
                            let _cA = () => $$cfg.kill_when_done_switch;
                            let _cB1 = () => $$cfg.kill_when_done_intelligent;
                            let _cB2 = () => $$app.init_fg_pkg !== $$app.pkg_name;
                            let _cB = () => _cB1() && _cB2();

                            if (_cA() || _cB()) {
                                return this.alipay.close();
                            }

                            if (!$$cfg.kill_when_done_keep_af_pages) {
                                return this.af.close();
                            }
                        },
                        disPermissionDiag() {
                            let _sel_btn_cfm = () => $$sel.pickup(idMatches(/.*btn_confirm/));
                            let _sel_allow = () => $$sel.pickup(/[Aa][Ll]{2}[Oo][Ww]|允许/);

                            let _max = 10;
                            let _cond = () => _sel_btn_cfm() || _sel_allow();
                            while (_cond() && _max--) {
                                clickAction(_cond(), "w");
                                sleep(500);
                            }
                        },
                    };

                    return this;
                },
                setTools() {
                    $$app.tool = {
                        timeStr(time, format) {
                            let _date = _parseDate(time || new Date());
                            let _pad = num => ("0" + num).slice(-2);

                            let _yyyy = _date.getFullYear();
                            let _yy = _yyyy.toString().slice(-2);
                            let _M = _date.getMonth() + 1;
                            let _MM = _pad(_M);
                            let _d = _date.getDate();
                            let _dd = _pad(_d);
                            let _h = _date.getHours();
                            let _hh = _pad(_h);
                            let _m = _date.getMinutes();
                            let _mm = _pad(_m);
                            let _s = _date.getSeconds();
                            let _ss = _pad(_s);

                            let _o = {
                                yyyy: _yyyy, yy: _yy,
                                MM: _MM, M: _M,
                                dd: _dd, d: _d,
                                hh: _hh, h: _h,
                                mm: _mm, m: _m,
                                ss: _ss, s: _s,
                            };

                            return _parseFormat(format || "yyyy/MM/dd hh:mm:ss");

                            // tool function(s) //

                            function _parseDate(time) {
                                if ($$date(time)) {
                                    return time;
                                }
                                if ($$num(time)) {
                                    return new Date(+time);
                                }
                                if ($$str(time)) {
                                    return new Date(time.toString());
                                }
                                return new Date(); // now
                            }

                            function _parseFormat(str) {
                                str = str.toString();
                                let _res = "";

                                while (str.length) {
                                    let _max = 4;
                                    while (_max) {
                                        let a = str.slice(0, _max);
                                        if (a in _o) {
                                            _res += _o[a];
                                            str = str.slice(_max);
                                            break;
                                        }
                                        _max -= 1;
                                    }
                                    if (!_max) {
                                        _res += str[0];
                                        str = str.slice(1);
                                    }
                                }

                                return _res;
                            }
                        },
                        stabilizer(cond, init, tt_cond, tt_stable) {
                            let _init = $$und(init) ? NaN : +init;
                            let _tt_c = tt_cond || 3e3;
                            let _res = () => {
                                let _num = +cond();
                                _init = isNaN(_init) ? _num : _init;
                                return _num;
                            };
                            let _cond_c = () => {
                                let _num = _res();
                                let _cA = () => $$num(_num);
                                let _cB = () => _init !== _num;
                                return _cA() && _cB();
                            };

                            if (!waitForAction(_cond_c, _tt_c)) {
                                return NaN;
                            }

                            let _old = _init;
                            let _tmp = NaN;
                            let _tt_s = tt_stable || 500;
                            let _check = () => _tmp = cond();
                            let _cond_s = () => _old !== _check();

                            while (waitForAction(_cond_s, _tt_s)) {
                                _old = _tmp;
                            }

                            return _old;
                        },
                    };

                    return this;
                },
                setDb() {
                    let _path = files.getSdcardPath() + "/.local/ant_forest.db";
                    let _tbl = "ant_forest";
                    let _SQLiteDatabaseFactory = require("./Modules/MODULE_DATABASE");
                    $$app.db = new _SQLiteDatabaseFactory(_path, _tbl, [
                        {name: "name", not_null: true},
                        {name: "timestamp", type: "integer", primary_key: true},
                        {name: "pick", type: "integer"},
                        {name: "help", type: "integer"}
                    ]);

                    return this;
                },
                init: function () {
                    _setInitAutojsState();
                    _addSelectors();

                    // tool function(s) //

                    function _setInitAutojsState() {
                        let _aj = $$app.page.autojs;
                        if (_aj.spring_board.on()) {
                            $$app.init_autojs_state = {
                                init_fg: _aj.is_fg,
                                init_home: _aj.is_home,
                                init_log: _aj.is_log,
                                init_settings: _aj.is_settings,
                            };
                        }
                    }

                    function _addSelectors() {
                        let _acc_logged_out = new RegExp(".*(" +
                            /在其他设备登录|logged +in +on +another/.source + "|" +
                            /.*账号于.*通过.*登录.*|account +logged +on +to/.source +
                            ").*");
                        let _login_err_msg = (type) => {
                            let _t = type || "txt";
                            return $$sel.pickup(id("com.alipay.mobile.antui:id/message"), _t)
                                || $$sel.pickup([$$sel.get("login_err_ensure"), "p2c0c0c0"], _t);
                        };

                        $$sel.add("af", "蚂蚁森林")
                            .add("alipay_home", [/首页|Homepage/, {
                                boundsInside: [0, cY(0.7), W, H],
                            }])
                            .add("af_title", [/蚂蚁森林|Ant Forest/, {
                                boundsInside: [0, 0, cX(0.4), cY(0.2)],
                            }])
                            .add("af_home", /合种|背包|通知|攻略|任务|.*大树养成.*/)
                            .add("rl_title", $$app.rl_title)
                            .add("rl_ent", /查看更多好友|View more friends/)
                            .add("rl_end_idt", /.*没有更多.*/)
                            .add("list", className("ListView"))
                            .add("fri_frst_tt", [/.+的蚂蚁森林/, {
                                boundsInside: [0, 0, cX(0.95), cY(0.2)],
                            }])
                            .add("cover_used", /.*使用了保护罩.*/)
                            .add("wait_awhile", /.*稍等片刻.*/)
                            .add("reload_fst_page", "重新加载")
                            .add("close_btn", /关闭|Close/)
                            .add("acc_logged_out", _acc_logged_out)
                            .add("acc_sw_pg_ident", /账号切换|Accounts/)
                            .add("login_btn", /登录|Log in|.*loginButton/)
                            .add("login_new_acc", /换个新账号登录|[Aa]dd [Aa]ccount/)
                            .add("login_other_acc", /换个账号登录|.*switchAccount/)
                            .add("login_other_mthd_init_pg", /其他登录方式|Other accounts/)
                            .add("login_other_mthd", /换个方式登录|.*[Ss]w.+[Ll]og.+thod/)
                            .add("login_by_code", /密码登录|Log ?in with password/)
                            .add("login_next_step", /下一步|Next|.*nextButton/)
                            .add("login_err_ensure", idMatches(/.*ensure/))
                            .add("login_err_msg", _login_err_msg)
                            .add("input_lbl_acc", /账号|Account/)
                            .add("input_lbl_code", /密码|Password/)
                        ;
                    }
                }
            };
        }

        function accSetter() {
            return {
                setParams() {
                    $$acc = {
                        switch: $$cfg.account_switch,
                        user_list: {
                            _plans: {
                                intent() {
                                    app.startActivity($$app.intent.acc_man);
                                },
                                pipeline() {
                                    $$app.page.alipay.home({debug_info_flag: false});

                                    return clickActionsPipeline([
                                        [["我的", "p1"]],
                                        [["设置", {clickable: true}]],
                                        [["换账号登录", null]],
                                    ], {
                                        name: "账号切换页面",
                                        default_strategy: "widget",
                                    });
                                },
                            },
                            launch(plans_arr) {
                                debugInfo('打开"账号切换"页面');

                                // TODO if (!plans_arr) loadFromConfig
                                plans_arr = plans_arr || ["intent", "pipeline"];

                                let _len = plans_arr.length;
                                for (let i = 0; i < _len; i += 1) {
                                    let _plan_n = plans_arr[i];
                                    let _task_name = "计划" + surroundWith(_plan_n);
                                    this._plans[_plan_n]();
                                    if (waitForAction(this.isInPage, 2e3)) {
                                        debugInfo(_task_name + "成功");
                                        return true;
                                    }
                                    debugInfo(_task_name + "失败");
                                }
                                let _m = '进入"账号切换"页面失败';
                                return messageAction(_m, 4, 1, 0, "both_dash");
                            },
                            parse(name_str) {
                                if (!this.isInPage()) {
                                    messageAction("解析用户名信息失败", 4, 1, 0, -1);
                                    messageAction("当前非账户切换页面", 9, 0, 1, 1);
                                }

                                let _kw = idMatches(/.*list_arrow/);
                                waitForAction(() => _kw.exists(), 2e3); // just in case
                                sleep(300);

                                // current logged in user abbr (with a list arrow)
                                let _cur_abbr = $$sel.pickup([_kw, "s-1c0c0"], "txt");
                                // abbr of param "name_str"
                                let _name_abbr = this.getAbbrFromList(name_str);
                                // let _is_logged_in = $$acc.isMatchAbbr(name_str, _cur_abbr);
                                let _is_logged_in = _cur_abbr === _name_abbr;
                                let _is_in_list = _is_logged_in || _name_abbr;

                                return {
                                    cur_abbr: _cur_abbr,
                                    abbr: _name_abbr,
                                    is_logged_in: _is_logged_in,
                                    is_in_list: _is_in_list,
                                };
                            },
                            isInList(name_str) {
                                let _nodes = $$sel.pickup(/.+\*{3,}.+/, "nodes");

                                for (let i = 0, len = _nodes.length; i < len; i += 1) {
                                    let _node = _nodes[i];
                                    let _abbr_name = $$sel.pickup(_node, "txt");
                                    if ($$acc.isMatchAbbr(name_str, _abbr_name)) {
                                        return _abbr_name;
                                    }
                                }
                            },
                            isInPage() {
                                return $$acc.isInSwAccPg();
                            },
                            makeInPage(force) {
                                if (!force && this.isInPage()) {
                                    return true;
                                }
                                return this.launch();
                            },
                            getAbbrFromList(name_str) {
                                return this.isInList(name_str) || "";
                            },
                        },
                        _codec(str, opr) {
                            let _str = str || "";
                            let _res = "";
                            let _fct = {e: 1, d: -1}[opr[0]];
                            for (let i in _str) {
                                _res += String.fromCharCode(
                                    _str.charCodeAt(i) + ((996).ICU + +i) * _fct
                                );
                            }
                            return _res;
                        },
                        encode(str) {
                            if (str) {
                                return this._codec(str, "enc");
                            }
                            messageAction("编码参数为空", 9, 1, 0, "both");
                        },
                        decode(str) {
                            if (str) {
                                return this._codec(str, "dec");
                            }
                            messageAction("解码参数为空", 9, 1, 0, "both");
                        },
                        isLoggedIn(name_str) {
                            let _this = this;

                            return _ready() && _check();

                            // tool function(s) //

                            function _ready() {
                                // TODO...
                                return _this.isInSwAccPg() || _this.user_list.launch();
                            }

                            function _check() {
                                debugInfo("检查账号列表登录状态");
                                let _parsed = _this.user_list.parse(name_str);
                                let _abbr = _parsed.abbr;
                                let _is_logged_in = _parsed.is_logged_in;
                                let _is_in_list = _parsed.is_in_list;

                                if (_abbr) {
                                    if (!$$acc.init_logged_in_usr) {
                                        debugInfo("记录初始登录账户缩略名");
                                        $$acc.init_logged_in_usr = _abbr;

                                        if ($$acc.main.isMain(name_str) && _is_logged_in) {
                                            $$flag.init_logged_in_main = true;
                                        }
                                    }
                                } else {
                                    debugInfo("当前登录账户缩略名无效", 3);
                                }

                                if (_is_logged_in) {
                                    debugInfo("目标账户已在登录状态");
                                    return true;
                                }

                                debugInfo(_is_in_list
                                    ? "目标账户在账号列表中但未登录"
                                    : "目标账户不在账号列表中");
                            }
                        },
                        isInLoginPg() {
                            return $$sel.get("login_other_acc")
                                || $$sel.get("input_lbl_acc")
                                || $$sel.get("login_other_mthd_init_pg");
                        },
                        isInSwAccPg() {
                            return $$sel.get("login_new_acc")
                                || $$sel.get("acc_sw_pg_ident");
                        },
                        isMatchAbbr(name_str, abbr) {
                            name_str = name_str.toString();
                            abbr = abbr.toString();

                            if (!name_str || !abbr) {
                                return false;
                            }

                            let [i, j, k] = [0, name_str.length - 1, abbr.length - 1];
                            let _same = (p, q) => name_str[p] === abbr[q];
                            let _isAbbrStar = q => abbr[q] === "*";

                            for (; i <= j; i += 1) {
                                if (!_same(i, i)) {
                                    if (_isAbbrStar(i)) {
                                        break;
                                    }
                                    return false;
                                }
                            }

                            if (i > j) {
                                return true;
                            }

                            for (; j > i, k > i; j -= 1, k -= 1) {
                                if (!_same(j, k)) {
                                    if (_isAbbrStar(k)) {
                                        break;
                                    }
                                    return false;
                                }
                            }

                            return !!abbr.slice(i, k + 1).match(/^\*+$/);
                        },
                        /**
                         * @param usr_inf {object}
                         * @param {string} [usr_inf.abbr]
                         * -- abbr username
                         * @param {string} [usr_inf.name]
                         * -- full username without encryption
                         * @param {string} [usr_inf.name_raw]
                         * -- encrypted username
                         * @param {string} [usr_inf.code_raw]
                         * -- encrypted code
                         * @param {boolean} [usr_inf.direct]
                         * -- directly login (no account list check)
                         */
                        login(usr_inf) {
                            return _ready() && _parse() && _login();

                            // tool function(s) //

                            function _ready() {
                                if (!$$obj(usr_inf)) {
                                    let _type = classof(usr_inf);
                                    let _msg = "登录参数类型不正确: " + _type;
                                    messageAction(_msg, 9, 1, 0, "both");
                                }

                                let {name, abbr, name_raw, direct} = usr_inf;
                                if (!name && !abbr && !name_raw) {
                                    let _msg = "usr_info参数缺少必要属性";
                                    messageAction(_msg, 9, 1, 0, "both");
                                }

                                return direct ? true : $$acc.user_list.makeInPage();
                            }

                            function _parse() {
                                this.abbr = usr_inf.abbr;
                                this.name = usr_inf.name;
                                this.code_raw = usr_inf.code_raw;

                                if (!this.name) {
                                    let _raw = usr_inf.name_raw;
                                    if (_raw) {
                                        this.name = $$acc.decode(_raw);
                                    }
                                }

                                if (!usr_inf.direct) {
                                    if (!this.abbr) {
                                        this.abbr = $$acc.user_list.parse(this.name).abbr;
                                    }
                                }

                                return true;
                            }

                            function _login() {
                                let _this = this;
                                let _name_str = _this.abbr || _this.name;
                                let _loggedIn = () => $$acc.isLoggedIn(_name_str);

                                return _byUsrList() || _byInputText() ? _clearFlag() : false;

                                // tool function(s) //

                                function _byUsrList() {
                                    return _ready() && _loginAndCheck();

                                    // tool function(s) //

                                    function _ready() {
                                        if (!_name_str) {
                                            let _str_a = "无法使用列表快捷切换账户";
                                            let _str_b = ">缺少必要的账户名称信息";
                                            debugInfo([_str_a, _str_b], 3);
                                        }

                                        if (usr_inf.direct) {
                                            let _str_a = "放弃使用列表快捷切换账户";
                                            let _str_b = ">检测到直接登录参数";
                                            return debugInfo([_str_a, _str_b], 3);
                                        }

                                        return true;
                                    }

                                    function _loginAndCheck() {
                                        if (_loggedIn()) {
                                            return true;
                                        }
                                        if (!_this.abbr) {
                                            return;
                                        }

                                        let _conds = {
                                            name: "列表快捷切换账户",
                                            time: 1, // 1 min
                                            wait: [{
                                                remark: "登录中进度条",
                                                cond: () => $$sel.pickup(className("ProgressBar")),
                                            }],
                                            success: [{
                                                remark: "支付宝首页",
                                                cond: () => $$sel.get("alipay_home"),
                                            }, {
                                                remark: "H5关闭按钮",
                                                cond: () => $$sel.get("close_btn"),
                                            }],
                                            fail: [{
                                                remark: "出现登录页面",
                                                cond: $$acc.isInLoginPg,
                                            }],
                                            timeout_review: [{
                                                remark: "强制账号列表检查",
                                                cond: _loggedIn,
                                            }]
                                        };

                                        for (let i = 0; i < 3; i += 1) {
                                            debugInfo((i ? "再次尝试" : "") + "点击列表中的账户");
                                            clickAction($$sel.pickup([_this.abbr, "p5"]), "w");

                                            debugInfo("开始监测账户切换结果");
                                            if (!_condChecker(_conds)) {
                                                return false;
                                            }
                                            if (_loggedIn()) {
                                                return true;
                                            }
                                        }
                                    }
                                }

                                function _byInputText() {
                                    let _err_msg = () => $$sel.get("login_err_msg");
                                    let _err_ens = () => $$sel.get("login_err_ensure");

                                    return _ready() && _login() && _check();

                                    // tool function(s) //

                                    function _ready() {
                                        if (!$$str(_this.name)) {
                                            return;
                                        }

                                        let _cond = () => {
                                            let _ok = $$sel.pickup(/好的|OK/);
                                            if ($$sel.get("acc_logged_out")) {
                                                clickAction(_ok, "w");
                                            }
                                            return $$acc.isInLoginPg() || $$acc.isInSwAccPg();
                                        };

                                        if (!waitForAction(_cond, 3e3)) {
                                            return messageAction("无法判断当前登录页面状态", 4, 1, 0, "both");
                                        }

                                        if (!$$acc.isInLoginPg()) {
                                            let _node = $$sel.get("login_new_acc");
                                            if (!clickAction($$sel.pickup([_node, "p4"]), "w")) {
                                                app.startActivity($$app.intent.acc_login);
                                            }
                                        }

                                        return _clickOtherBtnIFN();

                                        // tool function(s) //

                                        function _clickOtherBtnIFN() {
                                            let _acc, _lbl, _mthd;
                                            let _a = () => _acc = $$sel.get("login_other_acc");
                                            let _m = () => _mthd = $$sel.get("login_other_mthd_init_pg");
                                            let _lb = () => _lbl = $$sel.get("input_lbl_acc");

                                            waitForAction(() => _a() || _m() || _lb(), 3e3);

                                            if (_acc) {
                                                debugInfo('点击"换个账号登录"按钮');
                                                clickAction(_acc, "w");
                                            } else if (_mthd) {
                                                debugInfo('点击"其他登录方式"按钮');
                                                clickAction(_mthd, "w");
                                            }

                                            return waitForAction(_lb, 3e3); // just in case
                                        }
                                    }

                                    function _login() {
                                        let _lbl_code = () => $$sel.get("input_lbl_code");

                                        return _inputName(_this.name) && _inputCode(_this.code_raw);

                                        // tool function(s) //

                                        function _inputName(name) {
                                            debugInfo("尝试完成账户名输入");

                                            return _input() && _next();

                                            // tool function(s) //

                                            function _input() {
                                                let _inputted = () => $$sel.pickup(name);
                                                let _noInputted = () => !_inputted();
                                                let _node_lbl_acc = null;
                                                let _sel_lbl_acc = () => {
                                                    let _key = "input_lbl_acc";
                                                    return _node_lbl_acc = $$sel.get(_key);
                                                };
                                                let _cA = () => waitForAction(_inputted, 1e3);
                                                let _cB = () => !waitForAction(_noInputted, 500);
                                                let _max = 3;

                                                while (_max--) {
                                                    if (waitForAction(_sel_lbl_acc, 1.5e3)) {
                                                        debugInfo('找到"账号"输入项控件');
                                                        let _node = $$sel.pickup([_node_lbl_acc, "p2c1"]);
                                                        let _res = false;
                                                        if (_node) {
                                                            debugInfo('布局树查找可编辑"账号"控件成功');
                                                            _res = _node.setText(name);
                                                        } else {
                                                            debugInfo('布局树查找可编辑"账号"控件失败', 3);
                                                            debugInfo("尝试使用通用可编辑控件", 3);
                                                            let _edit = className("EditText").findOnce();
                                                            _res = _edit && _edit.setText(name);
                                                        }
                                                        let _suffix = _res ? "成功" : "失败";
                                                        let _lv = _res ? 0 : 3;
                                                        debugInfo("控件输入账户名" + _suffix, _lv);
                                                    } else {
                                                        let _s = '布局查找"账号"输入项控件失败';
                                                        messageAction(_s, 3, 0, 0, "up_dash");
                                                        messageAction("尝试盲输", 3, 0, 0, "dash");
                                                        setText(0, name);
                                                    }
                                                    if (_cA() && _cB()) {
                                                        break;
                                                    }
                                                }

                                                if (_max >= 0) {
                                                    debugInfo("成功输入账户名");
                                                    return true;
                                                }

                                                let _s = "输入账户名后检查输入未通过";
                                                messageAction(_s, 4, 1, 0, "both_dash");
                                            }

                                            function _next() {
                                                _require() && _click();
                                                return _check();

                                                // tool function(s) //

                                                function _require() {
                                                    let _str_a = '无需点击"下一步"按钮';

                                                    if (_lbl_code()) {
                                                        let _str_b = '>存在"密码"输入项控件';
                                                        return debugInfo([_str_a, _str_b]);
                                                    }

                                                    if ($$sel.get("login_btn")) {
                                                        let _str_b = '>存在"登录"按钮控件';
                                                        return debugInfo([_str_a, _str_b]);
                                                    }

                                                    return true;
                                                }

                                                function _click() {
                                                    debugInfo('点击"下一步"按钮');

                                                    let _sel = () => $$sel.get("login_next_step");
                                                    let _sel_p1 = $$sel.pickup([_sel(), "p1"]);

                                                    clickAction(_sel_p1, "w", {
                                                        max_check_times: 3,
                                                        check_time_once: 500,
                                                        condition_success: () => !_sel(),
                                                    });
                                                }

                                                function _check() {
                                                    let _try_agn = () => $$sel.pickup(/重新输入|Try again/);
                                                    let _oth_mthd = () => $$sel.get("login_other_mthd");
                                                    let _by_code = () => $$sel.get("login_by_code");
                                                    let _cond = () => {
                                                        return _lbl_code() || _err_ens()
                                                            || _oth_mthd() || _try_agn();
                                                    };

                                                    if (waitForAction(_cond, 8e3)) {
                                                        let _max = 3;
                                                        while (_max--) {
                                                            if (waitForAction(_lbl_code, 1.5e3)) {
                                                                debugInfo('找到"密码"输入项控件');
                                                                return true;
                                                            }
                                                            if (_err_ens() || _try_agn()) {
                                                                let _err = "失败提示信息:" + _err_msg();
                                                                messageAction("登录失败", 4, 1, 0, -1);
                                                                messageAction(_err, 8, 0, 1, 1);
                                                            }
                                                            if (_oth_mthd()) {
                                                                debugInfo('点击"换个方式登录"按钮');
                                                                clickAction(_oth_mthd(), "w");
                                                                if (!waitForAction(_by_code, 2e3)) {
                                                                    let _str = '未找到"密码登录"按钮';
                                                                    return messageAction(
                                                                        _str, 4, 1, 0, "both_dash"
                                                                    );
                                                                }
                                                                debugInfo('点击"密码登录"按钮');
                                                                clickAction(_by_code().parent(), "w");
                                                            }
                                                        }
                                                    }

                                                    let _s = '查找"密码"输入项控件超时';
                                                    return messageAction(_s, 4, 1, 0, "both_dash");
                                                }
                                            }
                                        }

                                        function _inputCode(code_raw) {
                                            debugInfo("尝试完成密码输入");

                                            return code_raw ? _autoIpt() : _manIpt();

                                            // tool function(s) //

                                            function _autoIpt() {
                                                debugInfo("尝试自动输入密码");

                                                let _mod = require("./Modules/MODULE_PWMAP");
                                                let _dec = _mod.decrypt;
                                                let _pref = '布局树查找可编辑"密码"控件';
                                                let _sel = $$sel.pickup([_lbl_code(), "p2c1"]);
                                                if (_sel && _sel.setText(_dec(code_raw))) {
                                                    debugInfo(_pref + "成功");
                                                } else {
                                                    debugInfo(_pref + "失败", 3);
                                                    debugInfo("尝试使用通用可编辑控件", 3);
                                                    let _node = className("EditText").findOnce();
                                                    let _input = _node && _node.setText(_dec(code_raw));
                                                    let _suffix = _input ? "成功" : "失败";
                                                    let _lv = _input ? 0 : 3;
                                                    debugInfo("通用可编辑控件输入" + _suffix, _lv);
                                                }

                                                debugInfo('点击"登录"按钮');
                                                if (clickAction($$sel.get("login_btn"), "w")) {
                                                    return true;
                                                }
                                                let _s = '输入密码后点击"登录"失败';
                                                messageAction(_s, 4, 1, 0, "both_dash");
                                            }

                                            function _manIpt() {
                                                debugInfo("需要手动输入密码");
                                                $$dev.vibrates(0, 0.1, 0.3, 0.1, 0.3, 0.2);

                                                let _user_tt = 2; // min
                                                let _btn_tt = 2; // min
                                                let _res = false;

                                                let _max = ~~(_user_tt + _btn_tt) * 60e3;
                                                $$flag.glob_e_scr_paused = true;
                                                $$dev.keepOn(_max);

                                                threads.starts(function () {
                                                    let _d = dialogs.builds([
                                                        "需要密码", "login_password_needed",
                                                        0, 0, "确定", 1
                                                    ]).on("positive", d => d.dismiss()).show();

                                                    threads.starts(function () {
                                                        let _ = _responder();

                                                        _.dialog();
                                                        _.button();
                                                        _.flag();

                                                        // tool function(s) //

                                                        function _responder() {
                                                            return {
                                                                dialog() {
                                                                    debugInfo([
                                                                        '等待用户响应"需要密码"对话框',
                                                                        '>最大超时时间: ' + _user_tt + '分钟'
                                                                    ]);

                                                                    let _cA = () => _d.isCancelled();
                                                                    let _cAN = () => !_d.isCancelled();
                                                                    let _cB = () => !waitForAction(_cAN, 2e3);
                                                                    let _cond = () => _cA() && _cB();

                                                                    if (!waitForAction(_cond, _user_tt * 60e3)) {
                                                                        $$dev.cancelOn();
                                                                        _d.dismiss();
                                                                        let _s = "需要密码时等待用户响应超时";
                                                                        messageAction("脚本无法继续", 4, 0, 0, -1);
                                                                        messageAction("登录失败", 4, 0, 1);
                                                                        messageAction(_s, 9, 1, 1, 1);
                                                                    }
                                                                },
                                                                button() {
                                                                    debugInfo([
                                                                        '等待用户点击"登录"按钮',
                                                                        ">最大超时时间: " + _btn_tt + "分钟"
                                                                    ]);

                                                                    let _cA = () => !$$sel.get("login_btn");
                                                                    let _rex = ".*confirmSet.*" +
                                                                        "|.*mainTip|.*登录中.*" +
                                                                        "|.*message";
                                                                    let _cT1 = () => $$sel.pickup(_rex);
                                                                    let _cT2 = () => _cT1() || _err_ens();
                                                                    let _cB = () => !waitForAction(_cT2, 500);
                                                                    let _cond = () => _cA() && _cB();

                                                                    if (!waitForAction(_cond, _btn_tt * 60e3)) {
                                                                        $$dev.cancelOn();
                                                                        _d.dismiss(); // just in case
                                                                        let _s = '等待"登录"按钮消失超时';
                                                                        messageAction("脚本无法继续", 4, 0, 0, -1);
                                                                        messageAction("登录失败", 4, 0, 1);
                                                                        messageAction(_s, 9, 1, 1, 1);
                                                                    }
                                                                },
                                                                flag: () => _res = true,
                                                            };
                                                        }
                                                    });
                                                });

                                                while (!_res) {
                                                    sleep(500);
                                                }

                                                // just to prevent screen from
                                                // turning off immediately
                                                click(1e5, 1e5);
                                                delete $$flag.glob_e_scr_paused;
                                                $$dev.cancelOn();

                                                return true;
                                            }
                                        }
                                    }

                                    function _check() {
                                        let _conds = {
                                            name: "登录账户",
                                            time: 0.5, // 30 sec
                                            wait: [{
                                                remark: "登录中进度条",
                                                cond: () => $$sel.pickup(/.*登录中.*/),
                                            }],
                                            success: [{
                                                remark: "支付宝首页",
                                                cond: () => $$sel.get("alipay_home"),
                                            }, {
                                                remark: "H5关闭按钮",
                                                cond: () => $$sel.get("close_btn"),
                                            }, {
                                                remark: "支付宝设置页面",
                                                cond: () => $$sel.pickup(/(退出|换账号)登录/),
                                            }],
                                            fail: [{
                                                remark: "失败提示",
                                                cond: _err_ens,
                                                feedback() {
                                                    $$dev.cancelOn();
                                                    messageAction("脚本无法继续", 4, 0, 0, -1);
                                                    messageAction("登录失败", 4, 1, 1);
                                                    messageAction("失败提示信息:" + _err_msg(), 9, 0, 1, 1);
                                                },
                                            }, {
                                                remark: "失败提示",
                                                cond: () => $$sel.pickup(/.*confirmSetting|.*mainTip/),
                                                feedback() {
                                                    let _fail_pref = "失败提示信息: ";
                                                    let _fail_main = $$sel.pickup(/.*mainTip/, "txt");
                                                    let _fail_msg = _fail_pref + _fail_main;
                                                    $$dev.cancelOn();
                                                    messageAction("脚本无法继续", 4, 0, 0, -1);
                                                    messageAction("登录失败", 4, 1, 1);
                                                    messageAction(_fail_msg, 9, 0, 1, 1);
                                                },
                                            }],
                                            timeout_review: [{
                                                remark: "强制账号列表检查",
                                                cond() {
                                                    if ($$acc.isLoggedIn(_this.name)) {
                                                        return true;
                                                    }
                                                    messageAction("脚本无法继续", 4, 0, 0, -1);
                                                    messageAction("切换主账户超时", 9, 1, 1, 1);
                                                },
                                            }]
                                        };

                                        return _condChecker(_conds);
                                    }
                                }

                                function _condChecker(cond) {
                                    if (!$$obj(cond)) {
                                        debugInfo(["条件检查器参数不合法", ">" + classof(cond)]);
                                        return false;
                                    }

                                    let {name, time, success, fail, wait, timeout_review} = cond;
                                    debugInfo("开始" + (name || "") + "条件检查");

                                    let _name = name || "条件检查";
                                    let _t = time || 1;
                                    if (_t < 100) _t *= 60e3;

                                    $$dev.keepOn(_t + 5 * 60e3);
                                    let _res = _checker();
                                    $$dev.cancelOn();
                                    return _res;

                                    // tool function(s) //

                                    function _checker() {
                                        while (_t > 0) {
                                            if (_meetCond(success, "success")) {
                                                debugInfo(_name + "成功");
                                                return true;
                                            }
                                            if (_meetCond(fail, "fail")) {
                                                return debugInfo(_name + "失败", 3);
                                            }
                                            if (!_meetCond(wait, "wait")) {
                                                _t -= 500;
                                            }
                                            sleep(500);
                                        }

                                        debugInfo("确定性条件检查已超时");
                                        if (!timeout_review) {
                                            return debugInfo(_name + "失败", 3);
                                        }

                                        debugInfo("开始检查超时复检条件");
                                        if (_meetCond(timeout_review, "timeout_review")) {
                                            debugInfo(_name + "成功");
                                            return true;
                                        }
                                        debugInfo(["超时复检失败", _name + "失败"], 3);

                                        // tool function(s) //

                                        function _meetCond(cond_arr, type) {
                                            if (!cond_arr) {
                                                return;
                                            }

                                            let _type_map = {
                                                "success": "成功",
                                                "fail": "失败",
                                                "wait": "持续等待",
                                                "timeout_review": "超时复检成功",
                                            };
                                            for (let i = 0, len = cond_arr.length; i < len; i += 1) {
                                                let _cond = cond_arr[i] || {};
                                                if (_cond.cond && _cond.cond()) {
                                                    debugInfo("满足" + (_type_map[type] || "未知") + "条件");
                                                    _cond.remark && debugInfo(">" + _cond.remark);
                                                    if (type === "wait") {
                                                        while (_cond.cond()) sleep(300);
                                                    }
                                                    if ($$func(_cond.feedback)) {
                                                        debugInfo("检测到反馈方法");
                                                        _cond.feedback();
                                                    }
                                                    return true;
                                                }
                                            }
                                        }
                                    }
                                }

                                function _clearFlag() {
                                    debugInfo("清除账户登出标记");
                                    delete $$flag.acc_logged_out;

                                    return true;
                                }
                            }
                        },
                        logBack() {
                            let _sto_key = "log_back_in_user";
                            let _is_init_main = $$flag.init_logged_in_main;
                            if (_is_init_main) {
                                debugInfo(["无需回切账户", ">初始登录账户已是主账户"]);
                                return _clearSto();
                            }

                            let _sw = $$cfg.account_log_back_in_switch;
                            if (!_sw) {
                                debugInfo(["无需回切账户", ">旧账户回切功能未开启"]);
                                return _clearSto();
                            }

                            let _init_usr = this.init_logged_in_usr;
                            if (!_init_usr) {
                                debugInfo(["无法回切账户", ">未获取初始登录账户信息"]);
                                return _clearSto();
                            }

                            let _init_data = {name: _init_usr, times: 0};
                            let _sto_data = $$sto.af.get(_sto_key, _init_data);
                            if (_sto_data.name !== _init_usr) {
                                _sto_data = _init_data;
                            }

                            let _k = "account_log_back_in_max_continuous_times";
                            let _ctr = $$cfg[_k];
                            if (_sto_data.times >= _ctr) {
                                let _sA = "禁止回切账户";
                                let _sB = ">此旧账户回切次数已达上限";
                                let _sC = ">上限值: " + _ctr;
                                debugInfo([_sA, _sB, _sC]);
                                return _clearSto();
                            }

                            debugInfo([
                                "开始旧账户回切操作",
                                ">当前连续回切次数: " + ++_sto_data.times
                            ]);

                            if (!$$acc.login(_init_usr)) {
                                debugInfo("旧账户回切失败", 3);
                                return _clearSto();
                            }
                            debugInfo("旧账户回切成功");

                            $$sto.af.put(_sto_key, _sto_data);
                            debugInfo("已更新回切账户存储信息");

                            // tool function(s) //

                            function _clearSto() {
                                if ($$sto.af.contains(_sto_key)) {
                                    $$sto.af.remove(_sto_key);
                                    debugInfo("已清理回切账户存储信息");
                                }
                            }
                        },
                    };

                    return this;
                },
                setMain() {
                    $$acc.main = {
                        _avatar: {
                            _path: $$app.local_pics_path + "main_user_mini_avatar_clip.png",
                            check(path) {
                                if ($$flag.acc_logged_out) {
                                    return debugInfo(["跳过主账户头像检查", ">检测到账户登出状态"]);
                                }

                                let _img = images.read(path || this._path);
                                let _res;

                                timeRecorder("avt_chk");
                                _res = _img && _check.bind(this)(_img);
                                $$app.avatar_checked_time = timeRecorder("avt_chk", "L", "auto");

                                if (_res) {
                                    debugInfo(["当前账户符合主账户身份", ">本地主账户头像匹配成功"]);
                                    $$flag.init_logged_in_main = true;
                                    return true;
                                }
                                debugInfo(["主账户身份检查未通过", ">本地主账户头像不匹配"]);

                                // tool function(s) //

                                function _check(img) {
                                    let _capt = this.capt();
                                    if (_capt) {
                                        let _mch = images.findImage(_capt, img, {level: 1});
                                        images.reclaim(_capt);
                                        _capt = null;
                                        if (_mch) {
                                            this._capt_cached = _capt;
                                        }
                                        return _mch;
                                    }
                                }
                            },
                            capt() {
                                let _b = null;

                                waitForAction(() => _b = _getAvtPos(), 8e3, 100);

                                if (!_b || $$emptyObj(_b)) {
                                    messageAction("无法获取当前头像样本", 3);
                                    return messageAction("森林主页头像控件定位失败", 3, 1);
                                }

                                let [l, t, w, h] = [_b.left, _b.top, _b.width(), _b.height()];
                                if (w < 3 || h < 3) {
                                    messageAction("无法继续匹配当前头像样本", 3, 0, 0, "dash_up");
                                    messageAction("森林主页头像控件数据无效", 3, 0, 1, "dash");
                                    return;
                                }
                                // chop: here means chopped
                                let _sqrt2 = Math.SQRT2;
                                let [w_chop, h_chop] = [w / _sqrt2, h / _sqrt2];
                                let _scr_capt = images.capt();
                                let _avt_clip = images.clip(
                                    _scr_capt,
                                    // A. get the biggest rectangle area inside the circle (or ellipse)
                                    // B. one pixel from each side of the area was removed
                                    l + (w - w_chop) / 2 + 1,
                                    t + (h - h_chop) / 2 + 1,
                                    w_chop - 2,
                                    h_chop - 2
                                );

                                images.reclaim(_scr_capt);
                                _scr_capt = null;

                                return _avt_clip;

                                // tool function(s) //

                                function _getAvtPos() {
                                    let _smp = [
                                        "我的大树养成记录",
                                        [idMatches(/.*us.r.+e.+gy/), "p2c0"],
                                        ["种树", {className: "Button"}, "p1c0"],
                                        [idMatches(/.*home.*panel/), "c0c0c0"],
                                    ];
                                    let _len = _smp.length;
                                    for (let i = 0; i < _len; i += 1) {
                                        let _node = $$sel.pickup(_smp[i]);
                                        if (_node) {
                                            debugInfo("森林主页头像控件定位成功");
                                            return _node.bounds();
                                        }
                                    }
                                    return null;
                                }
                            },
                            save(path) {
                                let _capt = this._capt_cached || this.capt();
                                if (_capt) {
                                    images.save(_capt, path || this._path);
                                    images.reclaim(_capt);
                                    _capt = null;
                                    delete this._capt_cached;
                                    return true;
                                }
                            },
                        },
                        _avail() {
                            if (!$$acc.switch) {
                                return debugInfo("账户功能未开启");
                            }
                            if (!this.name_raw) {
                                return debugInfo("主账户用户名未设置");
                            }
                            return true;
                        },
                        name_raw: $$cfg.main_account_info.account_name,
                        code_raw: $$cfg.main_account_info.account_code,
                        isMain(name_str) {
                            return $$acc.isMatchAbbr(name_str, $$acc.decode(this.name_raw));
                        },
                        login(par) {
                            if (!this._avail()) {
                                return;
                            }
                            if (this._avatar.check()) {
                                return true;
                            }

                            if (_loginMain()) {
                                $$app.page.af.home();
                                this._avatar.save();
                                return true;
                            }

                            messageAction("强制停止脚本", 4, 0, 0, -1);
                            messageAction("主账户登录失败", 9, 1, 1, 1);

                            // tool function(s) //

                            function _loginMain() {
                                return $$acc.login(Object.assign({
                                    name_raw: $$acc.main.name_raw,
                                    code_raw: $$acc.main.code_raw,
                                }, par || {}));
                            }
                        },
                    };

                    return this;
                },
            };
        }
    },
    queue() {
        let _my_e = $$app.my_engine;
        let _my_e_id = $$app.my_engine_id;
        let _excl_tag = "exclusive_task";
        let _ts_tag = "launch_timestamp";
        _my_e.setTag(_excl_tag, "af");
        _my_e.setTag(_ts_tag, $$app.ts);

        let _b = bombSetter();
        _b.trigger() && _b.explode();

        let _q = queueSetter();
        _q.trigger() && _q.queue();

        Object.defineProperties(arguments.callee, {
            bomb: {value: _b},
            queue: {value: _q},
        });

        return this;

        // tool function(s) //

        function bombSetter() {
            return {
                trigger() {
                    try {
                        return engines.all().filter((e) => {
                            let _gap = $$app.ts - e.getTag(_ts_tag);
                            return e.getTag(_excl_tag) === "af"
                                && _my_e_id > e.id
                                && _gap < $$cfg.min_bomb_interval_global;
                        }).length;
                    } catch (e) {
                        // Wrapped java.util.ConcurrentModificationException
                        // exception happens with a tiny possibility
                    }
                },
                explode() {
                    messageAction("脚本因安全限制被强制终止", 3, 0, 0, -1);
                    messageAction("连续运行间隔时长过小", 3, 0, 1);
                    messageAction("触发脚本炸弹预防阈值", 3, 0, 1, 1);
                    exit();
                }
            };
        }

        function queueSetter() {
            return {
                get excl_tasks() {
                    while (1) {
                        try {
                            return engines.all().filter((e) => {
                                return e.getTag(_excl_tag) && e.id < _my_e_id;
                            });
                        } catch (e) {
                            // FIXME ConcurrentModificationException
                            // because there is `iterator()` in `bridges.toArray()` ?
                            sleep(500);
                        }
                    }
                },
                get excl_tasks_len() {
                    return this.excl_tasks.length;
                },
                trigger() {
                    return this.excl_tasks_len;
                },
                queue() {
                    timeRecorder("sc_q"); // script queue
                    timeRecorder("sc_q_total");

                    let _init_que_len = this.excl_tasks_len;
                    let _que_len = _init_que_len;
                    let _sto_max_que_t = $$cfg.max_queue_time_global;
                    debugInfo("排他性任务排队中: " + _que_len + "项");

                    let _init_max_que_t = _sto_max_que_t * _que_len;
                    let _max_que_t = _init_max_que_t;
                    debugInfo("已设置最大排队时间: " + _max_que_t + "分钟");

                    while ((_que_len = this.excl_tasks_len)) {
                        if (_que_len !== _init_que_len) {
                            debugInfo("排他性任务队列发生变更", "up");
                            let _amt = _init_que_len + "->" + _que_len;
                            debugInfo("任务数量: " + _amt + "项");
                            _init_que_len = _que_len;
                            _max_que_t = _sto_max_que_t * _que_len;
                            let _t = _init_max_que_t + "->" + _max_que_t;
                            debugInfo("最大排队: " + _t + "分钟");
                            _init_max_que_t = _max_que_t;
                            timeRecorder("sc_q", "save"); // refresh
                        }
                        if (timeRecorder("sc_q", "L", 60e3) >= _max_que_t) {
                            this.excl_tasks.forEach(e => e.forceStop());
                            debugInfo("强制停止队前所有排他性任务");
                            debugInfo(">已达最大排队等待时间");
                        }
                        sleep(Math.rand([500, 1.5e3]));
                    }

                    let _et = timeRecorder("sc_q_total", "L", "auto");
                    debugInfo("任务排队用时: " + _et, "Up");
                },
            };
        }
    },
    delay() {
        let _fg = _fgAppBlistSetter();
        _fg.trigger() ? _fg.autoDelay() : _fg.clear();

        return this;

        // tool function(s) //

        function _fgAppBlistSetter() {
            return {
                trigger() {
                    return _screenOn() && _inBlist();

                    // tool function(s) //

                    function _screenOn() {
                        if ($$dev.is_screen_on) {
                            return true;
                        }
                        debugInfo(["跳过前置应用黑名单检测", ">屏幕未亮起"]);
                    }

                    function _inBlist() {
                        let _fg_app_blist = $$cfg.foreground_app_blacklist || [];
                        let _init_pkg = $$app.init_fg_pkg;
                        for (let i = 0, len = _fg_app_blist.length; i < len; i += 1) {
                            let [name, pkg] = _fg_app_blist[i].app_combined_name.split("\n");
                            if (_init_pkg === pkg) {
                                return $$app.fg_black_app = name;
                            }
                        }
                        debugInfo(["前置应用黑名单检测通过:", $$app.init_fg_pkg]);
                    }
                },
                autoDelay() {
                    messageAction("前置应用位于黑名单中:", 1, 0, 0, -1);
                    messageAction($$app.fg_black_app, 1);

                    let _delay = delayInfoSetter();
                    let _ctr = _delay.continuous_times;
                    let _time = _delay.delay_time;
                    let _sum = _delay.delay_time_sum;
                    if ($$1(_ctr)) {
                        messageAction("本次任务自动推迟运行", 1);
                    } else {
                        messageAction("本次任务自动推迟: " + _time + "分钟", 1);
                        messageAction("当前连续推迟次数: " + _ctr, 1);
                        messageAction("当前连续推迟总计: " + _sum + "分钟", 1);
                    }

                    $$sto.af.put("fg_blist_ctr", _ctr);
                    $$app.setPostponedTask(_time, false); // `exit()` contained
                    sleep(10e3); // in case task isn't set successfully before exit;
                    exit(); // thoroughly prevent script from going on (main thread)

                    // tool function(s) //

                    function delayInfoSetter(minutes) {
                        let _mm = minutes || [1, 1, 2, 3, 5, 8, 10];
                        let _ctr = $$sto.af.get("fg_blist_ctr", 0);
                        let _max_mm = _mm[_mm.length - 1];
                        let _time = _mm[_ctr] || _max_mm;
                        let _sum = 0;
                        for (let i = 0; i < _ctr; i += 1) {
                            _sum += _mm[i] || _max_mm;
                        }
                        return {
                            continuous_times: _ctr + 1,
                            delay_time: _time,
                            delay_time_sum: _sum,
                        };
                    }
                },
                clear: () => $$sto.af.remove("fg_blist_ctr"),
            }
        }
    },
    prompt() {
        let _sc_cfg = _scCfgSetter();
        _sc_cfg.trigger() && _sc_cfg.prompt();

        let _pre_run = _preRunSetter();
        _pre_run.trigger() && _pre_run.prompt();

        return this;

        // tool function(s) //

        function _scCfgSetter() {
            return {
                trigger() {
                    if (!$$sto.af.get("config_prompted")) {
                        debugInfo("显示参数调整提示对话框");
                        return true;
                    }
                },
                prompt() {
                    let _diag = promptDialogSetter();
                    let _action = actionSetter();

                    _diag.show();
                    _action.wait();

                    // tool function(s) //

                    function promptDialogSetter() {
                        let _btnMsg = (btn_name) => {
                            let _btn = _diag_prompt.getActionButton(btn_name);
                            let _box = _diag_prompt.isPromptCheckBoxChecked();
                            debugInfo('用户' + (_box ? '已' : '没有') + '勾选"不再提示"');
                            debugInfo('用户点击"' + _btn + '"按钮');
                        };
                        let _diag_prompt = dialogs.builds([
                            "参数调整提示", "settings_never_launched",
                            0, "跳过", "现在配置", 1, 1
                        ]).on("negative", (d_self) => {
                            _btnMsg("negative");
                            _action.negBtn(d_self);
                        }).on("positive", (d_self) => {
                            _btnMsg("positive");
                            _action.posBtn(d_self);
                        });

                        return dialogs.disableBack(_diag_prompt);
                    }

                    function actionSetter() {
                        return {
                            _commonAct(d, flg) {
                                d.dismiss();
                                let _box = d.isPromptCheckBoxChecked();
                                $$sto.af.put("config_prompted", flg || _box);
                                this._sgn_move_on = true;
                            },
                            posBtn(d) {
                                this._sgn_confirm = true;
                                $$sto.af.put("af_postponed", true);
                                this._commonAct(d, true);
                            },
                            negBtn(d) {
                                this._commonAct(d);
                            },
                            wait() {
                                let _this = this;
                                if (!waitForAction(() => _this._sgn_move_on, 60e3)) {
                                    _diag.dismiss();
                                    messageAction("强制结束脚本", 4, 0, 0, -1);
                                    messageAction("等待参数调整对话框操作超时", 9, 1, 0, 1);
                                }
                                if (this._sgn_confirm) {
                                    runJsFile("Ant_Forest_Settings");
                                    exit();
                                }
                            },
                        };
                    }
                },
            };
        }

        function _preRunSetter() {
            return {
                trigger() {
                    let _skip = '跳过"运行前提示"';
                    let _inst = '>检测到"立即运行"引擎参数';
                    if (!$$cfg.prompt_before_running_switch) {
                        return debugInfo('"运行前提示"未开启');
                    }
                    if (!$$dev.is_screen_on) {
                        return debugInfo([_skip, ">屏幕未亮起"]);
                    }
                    if (!$$dev.isUnlocked()) {
                        return debugInfo([_skip, ">设备未解锁"]);
                    }
                    if ($$app.my_engine_argv.instant_run_flag) {
                        return debugInfo([_skip, _inst]);
                    }
                    return true;
                },
                prompt() {
                    let _sec = +$$cfg.prompt_before_running_countdown_seconds + 1;
                    let _diag = _promptSetter();
                    let _action = _actionSetter();
                    let _thd_et = threads.starts(_thdEt);

                    _diag.show();
                    _action.wait();

                    // tool function(s) //

                    function _promptSetter() {
                        let _btnMsg = (btn_name) => {
                            let _btn = _diag_prompt.getActionButton(btn_name);
                            let _regexp = / *\[ *\d+ *] */;
                            debugInfo('用户点击"' + _btn.replace(_regexp, "") + '"按钮');
                        };
                        let _diag_prompt = dialogs.builds([
                            "运行提示", "\n即将在 " + _sec + " 秒内运行" + $$app.task_name + "任务\n",
                            ["推迟运行", "warn_btn_color"],
                            ["放弃任务", "caution_btn_color"],
                            ["立即开始  [ " + _sec + " ]", "attraction_btn_color"],
                            1,
                        ]).on("positive", (d) => {
                            _btnMsg("positive");
                            _action.posBtn(d);
                        }).on("negative", (d) => {
                            _btnMsg("negative");
                            _action.negBtn(d);
                        }).on("neutral", (d) => {
                            _btnMsg("neutral");
                            _action.neuBtn(d);
                        });

                        return dialogs.disableBack(_diag_prompt, () => _action.pause(100));
                    }

                    function _actionSetter() {
                        return {
                            posBtn(d) {
                                this._sgn_move_on = true;
                                this.pause(100);
                                d.dismiss();
                            },
                            negBtn(d) {
                                let _d = dialogs.builds(getBuildsParam());
                                this.pause(300);

                                _d.on("negative", (d_self) => {
                                    dialogs.dismiss(d_self);
                                }).on("positive", (d_self) => {
                                    dialogs.dismiss(d_self, d);
                                    messageAction("放弃" + $$app.task_name + "任务", 1, 1, 0, "both");
                                    exit();
                                }).show();

                                // tool function(s) //

                                function getBuildsParam() {
                                    let _task_len = timers.queryTimedTasks({
                                        path: $$app.cwp,
                                    }).length;
                                    let _task_str = $$app.task_name + "定时任务";
                                    let _title = ["注意", "title_caution_color"];
                                    let _pref = "当前未设置任何" + _task_str + "\n\n";
                                    let _main = "确认要放弃本次任务吗";
                                    let _cnt = [_pref + _main, "content_warn_color"];
                                    let _pos_btn = ["确认放弃任务", "caution_btn_color"];
                                    if (_task_len) {
                                        _title = ["提示", "title_default_color"];
                                        _cnt = [_main, "content_default_color"];
                                    }
                                    return [_title, _cnt, 0, "返回", _pos_btn, 1];
                                }
                            },
                            neuBtn(d) {
                                this.pause(300);

                                let _cfg = {
                                    get key_prefix() {
                                        return "prompt_before_running_postponed_minutes";
                                    },
                                    get sto_min() {
                                        return $$cfg[this.key_prefix].toString();
                                    },
                                    set sto_min(v) {
                                        let _new = {};
                                        _new[this.key_prefix] = +v;
                                        $$sto.af_cfg.put("config", _new);
                                        Object.assign($$cfg, _new);
                                    },
                                    get def_choices() {
                                        let _src = $$cfg[this.key_prefix + "_default_choices"];
                                        let _res = {};
                                        _src.forEach(_num => _res[_num] = _num + " min");
                                        return _res;
                                    },
                                    get user_min() {
                                        return $$cfg[this.key_prefix + "_user"].toString();
                                    },
                                    set user_min(v) {
                                        let _new = {};
                                        _new[this.key_prefix + "_user"] = +v;
                                        $$sto.af_cfg.put("config", _new);
                                        Object.assign($$cfg, _new);
                                    }
                                };

                                if (+_cfg.sto_min) {
                                    d.dismiss();
                                    return $$app.setPostponedTask(_cfg.sto_min);
                                }

                                let _map = _cfg.def_choices; // ["1 min", "5 min"...]
                                let _map_keys = Object.keys(_map); // [1, 2, 5, 10...]

                                dialogs.builds([
                                    "设置任务推迟时间", "",
                                    0, "返回", ["确定", "warn_btn_color"],
                                    1, "记住设置且不再提示",
                                ], {
                                    items: _map_keys.map(v => _map[v]),
                                    itemsSelectMode: "single",
                                    itemsSelectedIndex: _map_keys.indexOf((_cfg.user_min)),
                                }).on("negative", (d_self) => {
                                    d_self.dismiss();
                                }).on("positive", (d_self) => {
                                    dialogs.dismiss(d_self, d);
                                    _cfg.user_min = _map_keys[d_self.getSelectedIndex()];
                                    if (d_self.promptCheckBoxChecked) _cfg.sto_min = _cfg.user_min;
                                    $$app.setPostponedTask(_cfg.user_min);
                                }).show();
                            },
                            pause(interval) {
                                _thd_et.interrupt();
                                setTimeout(function () {
                                    let _cont = dialogs.getContentText(_diag);
                                    let _cont_txt = _cont.replace(
                                        /.*(".+".*任务).*/, "请选择$1运行选项"
                                    );
                                    _diag.setContent(_cont_txt);
                                    let _pos = _diag.getActionButton("positive");
                                    let _pos_txt = _pos.replace(/ *\[ *\d+ *]$/, "");
                                    _diag.setActionButton("positive", _pos_txt);
                                }, interval || 800);
                            },
                            wait() {
                                if (!waitForAction(() => this._sgn_move_on, 5 * 60e3)) {
                                    _diag.dismiss();
                                    _thd_et = _diag = null;
                                    messageAction("强制结束脚本", 4, 0, 0, -1);
                                    messageAction("等待运行提示对话框操作超时", 9, 1, 0, 1);
                                }
                            },
                        };
                    }

                    // thread function(s) //

                    function _thdEt() {
                        while (--_sec) {
                            let _cont = dialogs.getContentText(_diag);
                            _diag.setContent(_cont.replace(/\d+/, _sec));
                            let _pos = _diag.getActionButton("positive");
                            let _pos_str = _pos.replace(/ *\[ *\d+ *]$/, "");
                            let _pos_txt = _pos_str + "  [ " + _sec + " ]";
                            _diag.setActionButton("positive", _pos_txt);
                            sleep(1e3);
                        }
                        debugInfo(["运行提示计时器超时", "任务自动继续"]);
                        _action.posBtn(_diag);
                    }
                },
            };
        }
    },
    monitor() {
        // instant monitors with trigger
        let _isu = insuranceMonSetter();
        _isu.trigger() && _isu.clean().deploy().monitor();

        // instant and private monitors
        let _isa = instantMonSetter();
        _isa.maxRun().volKeys().globEvt().logOut();

        // monitors put on standby for $$app invoking
        $$app.monitor = standbyMonSetter();
        $$app.monitor.insurance = _isu;

        return this;

        // monitor function(s) //

        function insuranceMonSetter() {
            let _keys = {
                ins_tasks: "insurance_tasks",
                ins_accu: "insurance_tasks_continuous_times",
                ins_accu_max: "timers_insurance_max_continuous_times",
                ins_itv: "timers_insurance_interval",
            };
            let _self = {
                trigger() {
                    if (!$$cfg.timers_switch) {
                        return debugInfo("定时循环功能未开启");
                    }
                    if (!$$cfg.timers_self_manage_switch) {
                        return debugInfo("定时任务自动管理未开启");
                    }
                    if (!$$cfg.timers_insurance_switch) {
                        return debugInfo("意外保险未开启");
                    }
                    if ($$app.my_engine_argv.no_insurance_flag) {
                        return debugInfo('检测到"无需保险"引擎参数');
                    }
                    let _accu = this._sto_accu = this._sto_accu + 1;
                    let _max = $$cfg[_keys.ins_accu_max];
                    if (_accu <= _max) {
                        return true;
                    }
                    debugInfo("本次会话不再设置保险定时任务");
                    debugInfo(">任务已达最大连续次数限制: " + _max);
                    this.reset();
                },
                get _sto_accu() {
                    return +$$sto.af.get(_keys.ins_accu, 0);
                },
                set _sto_accu(v) {
                    $$sto.af.put(_keys.ins_accu, +v);
                },
                get _sto_ids() {
                    let _all = $$sto.af.get(_keys.ins_tasks, []);
                    return _all.filter(id => timers.getTimedTask(id));
                },
                get _next_task_time() {
                    return $$app.ts + $$cfg[_keys.ins_itv] * 60e3;
                },
                clean() {
                    let _ids = this._sto_ids;
                    let _str = "";

                    if (_ids.length) {
                        _ids.forEach(id => timers.removeTimedTask(id));
                        _str += "任务ID: ";
                        _str += _ids.length > 1
                            ? surroundWith(_ids.join(", "), "[ ", " ]")
                            : _ids[0];
                    }
                    _str && debugInfo(["已移除意外保险定时任务:", _str]);
                    $$sto.af.remove(_keys.ins_tasks);

                    return _self;
                },
                reset() {
                    this.clean();
                    this._sto_accu = 0;

                    return _self;
                },
                deploy() {
                    this.task = timers.addDisposableTask({
                        path: $$app.cwp,
                        date: this._next_task_time,
                    });

                    $$sto.af.put(_keys.ins_tasks, this._sto_ids.concat([this.task.id]));
                    debugInfo(["已设置意外保险定时任务:", "任务ID: " + this.task.id]);

                    return _self;
                },
                monitor() {
                    this._thread = threads.starts(function () {
                        setInterval(() => {
                            _self.task.setMillis(_self._next_task_time);
                            timers.updateTimedTask(_self.task);
                        }, 10e3);
                    });

                    return _self;
                },
                interrupt() {
                    let _thd = this._thread;
                    _thd && _thd.interrupt();

                    return _self;
                }
            };

            return _self;
        }

        function instantMonSetter() {
            return {
                maxRun() {
                    let _max = +$$cfg.max_running_time_global;

                    _max && threads.starts(function () {
                        setTimeout(function () {
                            ui.post(() => {
                                let _s = "超时强制退出";
                                messageAction(_s, 9, 1, 0, "both_n");
                            });
                        }, _max * 60e3 + 3e3);
                    });

                    return this;
                },
                volKeys() {
                    debugInfo("设置音量键监听器");

                    let _keyMsg = (e) => {
                        let _keyCodeStr = android.view.KeyEvent.keyCodeToString;
                        let _code = e.getKeyCode();
                        let _name = _keyCodeStr(_code);
                        return _name + " (" + _code + ")";
                    };

                    threads.starts(function () {
                        events.observeKey();
                        events.setKeyInterceptionEnabled("volume_up", true);
                        events.onceKeyDown("volume_up", function (e) {
                            messageAction("强制停止所有脚本", 4, 0, 0, -1);
                            messageAction("触发按键: 音量加/VOL+", 4, 0, 1);
                            messageAction(_keyMsg(e), 4, 0, 1, 1);
                            engines.stopAllAndToast();
                        });
                        events.setKeyInterceptionEnabled("volume_down", true);
                        events.onceKeyDown("volume_down", function (e) {
                            messageAction("强制停止当前脚本", 3, 1, 0, -1);
                            messageAction("触发按键: 音量减/VOL-", 3, 0, 1);
                            messageAction(_keyMsg(e), 3, 0, 1, 1);
                            $$app.my_engine.forceStop();
                        });
                    });

                    return this;
                },
                globEvt() {
                    $$flag.glob_e_trig_counter = 0;

                    let _constr = constrParamsSetter();

                    let _call_stat = new Monitor(
                        "通话状态", "2 hr", _constr.phone
                    );
                    _call_stat.valid() && _call_stat.monitor();

                    let _scr_off = new Monitor(
                        "屏幕关闭", "2 min", _constr.screen
                    );
                    _scr_off.valid() && _scr_off.monitor();

                    return this;

                    // constructor(s) //

                    /**
                     * @param {string} [desc]
                     * -- will show in console as the monitor name
                     * @param {string|number} [limit=Infinity]
                     * @param params {object}
                     * @param {boolean|string} [params.switching]
                     * -- monitor may be disabled according to $$cfg
                     * @param params.trigger {function}
                     * @param {function} [params.onTrigger]
                     * @param params.onRelease {function}
                     * @constructor
                     */
                    function Monitor(desc, limit, params) {
                        let _desc = surroundWith(desc);
                        let _limit = _handleLimitParam(limit);
                        let _sw = _handleSwitch(params.switching);
                        let _trigger = params.trigger;
                        let _onTrigger = params.onTrigger;
                        let _onRelease = params.onRelease;

                        this.valid = function () {
                            let _name = _desc + "事件监测";
                            debugInfo(_sw ? _name + "已开启" : _name + "未开启");
                            return _sw;
                        };
                        this.monitor = function () {
                            let _self = Object.assign({
                                onTriggerMsg() {
                                    let _ctdMsg = function () {
                                        // to keep _limit unchanged
                                        let _lmt = _limit;
                                        let _pref = "等待事件解除";
                                        let _tpl = (unit) => {
                                            let _suffix = +_lmt.toFixed(2) + unit;
                                            return _pref + " (最多" + _suffix + ")";
                                        };

                                        if ($$inf(_lmt)) {
                                            return _pref;
                                        }
                                        if (_lmt < 1e3) {
                                            return _tpl("毫秒");
                                        }
                                        if ((_lmt /= 1e3) < 60) {
                                            return _tpl("秒");
                                        }
                                        if ((_lmt /= 60) < 60) {
                                            return _tpl("分钟");
                                        }
                                        if ((_lmt /= 60) < 24) {
                                            return _tpl("小时");
                                        }
                                        return _lmt /= 24 && _tpl("天");
                                    };

                                    timeRecorder("glob_e" + _desc, "save");
                                    messageAction("触发" + _desc + "事件", 1, 1, 0, "up_dash");
                                    messageAction(_ctdMsg(), 1, 0, 0, "dash");
                                },
                                onReleaseMsg() {
                                    messageAction("解除" + _desc + "事件", 1, 0, 0, "up_dash");
                                    let _str = timeRecorder("glob_e" + _desc, "L", "auto");
                                    messageAction("解除用时: " + _str, 1, 0, 1, "dash");
                                },
                                keepWaiting() {
                                    while (_trigger()) {
                                        let _et = timeRecorder("glob_e" + _desc, "L");
                                        if (_et >= _limit) {
                                            messageAction("强制停止脚本", 4, 1, 0, -1);
                                            messageAction(_desc + "事件解除超时", 9, 1, 1, 1);
                                        }
                                        sleep(300);
                                    }
                                },
                            }, {
                                trigger: _trigger,
                                get onTrigger() {
                                    return () => {
                                        $$flag.glob_e_trig_counter++;
                                        $$func(_onTrigger) && _onTrigger();
                                    };
                                },
                                get onRelease() {
                                    return () => {
                                        $$func(_onRelease) && _onRelease();
                                        $$flag.glob_e_trig_counter--;
                                    };
                                },
                            });

                            threads.starts(function () {
                                let _handleTrigger = () => {
                                    _self.onTrigger();
                                    _self.onTriggerMsg();
                                    _self.keepWaiting();
                                    _self.onReleaseMsg();
                                    _self.onRelease();
                                };
                                while (1) _trigger() ? _handleTrigger() : sleep(200);
                            });
                        };

                        // tool function(s) //

                        function _handleLimitParam(lmt) {
                            if (!$$str(lmt)) {
                                lmt = +lmt;
                                if (lmt < 1e3) lmt *= 1e3; // take as seconds
                                if (!lmt || lmt <= 0) lmt = Infinity; // endless monitoring
                                return lmt;
                            }
                            if (lmt.match(/h((ou)?rs?)?/)) {
                                return lmt.match(/\d+/)[0] * 3.6e6;
                            }
                            if (lmt.match(/m(in(utes?))?/)) {
                                return lmt.match(/\d+/)[0] * 60e3;
                            }
                            if (lmt.match(/s(ec(conds?))?/)) {
                                return lmt.match(/\d+/)[0] * 1e3;
                            }
                            if (lmt.match(/m(illi)?s(ec(conds?))?/)) {
                                return lmt.match(/\d+/)[0] * 1;
                            }
                            return Infinity;
                        }

                        function _handleSwitch(sw) {
                            if ($$bool(sw)) {
                                return sw;
                            }
                            if ($$str(sw)) {
                                return $$cfg[sw];
                            }
                            return true;
                        }
                    }

                    // tool function(s) //

                    function constrParamsSetter() {
                        return {
                            phone: {
                                switching: "phone_call_state_monitor_switch",
                                trigger() {
                                    let _self = {
                                        state_key: "phone_call_state_idle_value",
                                        get cur_state() {
                                            return $$cfg[this.state_key];
                                        },
                                        set cur_state(val) {
                                            let _dat = {};
                                            let _key = this.state_key;
                                            $$cfg[_key] = _dat[_key] = val;
                                            $$sto.af_cfg.put("config", _dat);
                                        },
                                    };
                                    return $$dev.getCallState() !== getCurState();

                                    // tool function(s) //

                                    function getCurState() {
                                        let _cur_state = _self.cur_state;
                                        if (!$$und(_cur_state)) {
                                            return _cur_state;
                                        }

                                        // won't write into storage
                                        _cur_state = $$dev.getCallState();

                                        let _sto = _stoSetter();
                                        return $$und(_sto.filled_up) ? _sto.fillIn() : _sto.reap();

                                        // tool function(s) //

                                        function _stoSetter() {
                                            return {
                                                get states() {
                                                    return $$sto.af.get("phone_call_states", []);
                                                },
                                                set states(arr) {
                                                    $$sto.af.put("phone_call_states", this.states.concat(arr));
                                                },
                                                get filled_up() {
                                                    let _states = this.states;
                                                    let _len = _states.length;
                                                    if (_len >= 5) {
                                                        let _tmp = [];
                                                        for (let i = 0; i < _len; i += 1) {
                                                            let n = _states[i];
                                                            if (!_tmp[n]) {
                                                                _tmp[n] = 1;
                                                            } else {
                                                                if (_tmp[n] >= 4) {
                                                                    return _cur_state = n;
                                                                }
                                                                _tmp[n] += 1;
                                                            }
                                                        }
                                                    }
                                                },
                                                fillIn() {
                                                    if ($$und(_cur_state)) _cur_state = $$dev.getCallState();
                                                    this.states = _cur_state;
                                                    debugInfo([
                                                        "已存储通话状态数据",
                                                        "当前共计数据: " + this.states.length + "组",
                                                    ]);
                                                    return _cur_state;
                                                },
                                                reap() {
                                                    debugInfo([
                                                        "通话状态数据可信",
                                                        "将当前数据应用于配置文件",
                                                        "数据值: " + _cur_state,
                                                    ]);
                                                    $$sto.af.remove("phone_call_states");
                                                    // write into storage and $$cfg
                                                    return _self.cur_state = _cur_state;
                                                },
                                            };
                                        }
                                    }
                                },
                                onRelease() {
                                    debugInfo('前置"支付宝"应用');
                                    app.launchPackage($$app.pkg_name);
                                },
                            },
                            screen: {
                                trigger() {
                                    return $$flag.dev_unlocked
                                        && !$$flag.glob_e_scr_paused
                                        && !$$dev.isScreenOn();
                                },
                                onTrigger() {
                                    if ($$flag.glob_e_scr_privilege) {
                                        messageAction("允许脚本提前退出", 3, 1, 0, -1);
                                        messageAction("标识激活且屏幕关闭", 3, 0, 1, 1);
                                        exit();
                                    }
                                },
                                onRelease() {
                                    $$flag.glob_e_trig_counter++;
                                    $$dev.isLocked() && $$dev.unlock();
                                    $$flag.glob_e_trig_counter--;
                                },
                            },
                        };
                    }
                },
                logOut() {
                    threads.starts(function () {
                        debugInfo("已开启账户登出监测线程");

                        delete $$flag.acc_logged_out;
                        while (1) {
                            if ($$sel.getAndCache("acc_logged_out")) {
                                break;
                            }
                            if ($$acc.isInLoginPg()) {
                                break;
                            }
                            sleep(500);
                        }
                        $$flag.acc_logged_out = true;

                        messageAction("检测到账户登出状态", 1, 0, 0, -1);
                        messageAction($$sel.cache.load("acc_logged_out")
                            ? "账户在其他地方登录"
                            : "需要登录账户", 1);
                        messageAction("尝试自动登录主账户", 1, 0, 0, 1);

                        if (!$$acc.main.login({direct: true})) {
                            messageAction("脚本无法继续", 4, 0, 0, -1);
                            messageAction("无法登录主账户", 9, 1, 1, 1);
                        }
                    });

                    return this;
                },
            };
        }

        function standbyMonSetter() {
            return {
                mask_layer: new Monitor("遮罩层", function () {
                    let _ = maskLayerSetter();

                    while (_.trigger()) {
                        _.enforce();
                    }
                    _.dismiss();

                    // tool function(s) //

                    function maskLayerSetter() {
                        let _smp = [{
                            trig: "关闭蒙层",
                            desc: "蒙层遮罩",
                        }, {
                            trig: ["关闭", {boundsInside: [0, halfW, W, H]}],
                            desc: "关闭按钮遮罩",
                        }, {
                            trig: /.*treedialog.close/,
                            desc: "树对话框遮罩",
                        }].map((o) => {
                            if (!$$func(o.trig)) {
                                let _trig = o.trig;
                                o.trig = () => $$sel.pickup(_trig);
                            }
                            return o;
                        });
                        let _o = {
                            get _cond() {
                                return () => {
                                    let _len = _smp.length;
                                    for (let i = 0; i < _len; i += 1) {
                                        let _cur_smp = _smp[i];
                                        let _cur_trig = _cur_smp.trig();
                                        if (_cur_trig) {
                                            return _o.smp = Object.assign(
                                                {node: _cur_trig}, _cur_smp
                                            );
                                        }
                                    }
                                }
                            },
                            trigger() {
                                delete _o.smp;
                                return waitForAction(this._cond, 8e3);
                            },
                            enforce() {
                                let _desc = _o.smp.desc;
                                debugInfo("检测到" + _desc);
                                timeRecorder("_mask_layer");

                                let _cA = () => clickAction(_o.smp.node, "w");
                                let _cB = () => clickAction(_o.smp.node, "click");
                                let _cC1 = () => waitForAction(() => !_o.smp.trig(), 2e3, 80);
                                let _cC2 = () => !waitForAction(_o.smp.trig, 800, 80);
                                let _cC = () => _cC1() && _cC2();
                                let _res = (_cA() || _cB()) && _cC();

                                if (!_res) {
                                    return debugInfo("关闭" + _desc + "失败", 3);
                                }

                                let _et = timeRecorder("_mask_layer", "L", "auto");
                                debugInfo(["关闭" + _desc + "成功", "遮罩关闭用时: " + _et]);
                            },
                            dismiss: () => debugInfo("遮罩层监测线程结束"),
                        };
                        return _o;
                    }
                }),
                reload_btn: new Monitor('"重新加载"按钮', function () {
                    let _sel = () => $$sel.get("reload_fst_page");
                    let _click = () => clickAction(_sel(), "w");

                    while (sleep(3e3) || true) {
                        _click() && sleep(5e3);
                    }
                }),
                af_home_in_page: new Monitor("森林主页页面", function () {
                    while (sleep(360) || true) {
                        $$flag.af_home_in_page = !!$$app.page.af.isInPage();
                    }
                }),
                rl_in_page: new Monitor("排行榜页面", function () {
                    let _n = "rl_title"; // name
                    let _t = "bounds"; // type
                    while (1) {
                        $$sel.cache.refresh(_n); // contains save()
                        $$flag.rl_in_page = $$sel.cache.load(_n, _t);
                        sleep(120);
                    }
                }),
                rl_bottom: new Monitor("排行榜底部", function () {
                    while (sleep(500) || true) {
                        $$impeded("排行榜底部监测线程");

                        let _key = "rl_end_idt";
                        if (!$$sel.getAndCache(_key)) {
                            continue;
                        }

                        let _sel_str = $$sel.cache.load(_key, "sel_str");
                        let _bd = $$sel.cache.load(_key, "bounds");
                        let _l = _bd.left;
                        let _t = _bd.top;
                        let _r = _bd.right;
                        let _b = _bd.bottom;
                        let _w = _bd.width() - 3;
                        let _h = _bd.height() - 3;

                        if (_b - _t < cX(0.08)) {
                            continue;
                        }

                        let _bd_arr = [_l, _t, _r, _b];
                        let _bd_str = _bd_arr.join(", ");
                        let _sel_body = $$sel.cache.load(_key, _sel_str);
                        debugInfo("列表底部条件满足");
                        debugInfo(">bounds: [" + _bd_str + "]");
                        debugInfo(">" + _sel_str + ": " + _sel_body);
                        $$flag.rl_bottom_rch = true;

                        let _capt = images.capt();
                        let _clip = images.clip(_capt, _l, _t, _w, _h);
                        let _copy = images.copy(_clip);
                        let _path = $$app.page.rl.btm_tpl.path;
                        images.reclaim($$app.page.rl.btm_tpl.img);
                        $$app.page.rl.btm_tpl.img = _copy;
                        images.save(_copy, _path);
                        debugInfo("已存储列表底部控件图片模板");

                        images.reclaim(_capt, _clip);
                        _capt = null;
                        _clip = null;

                        break;
                    }

                    return debugInfo("排行榜底部监测线程结束");
                }),
                tree_rainbow: new Monitor("彩虹对话框", function () {
                    let _kw = idMatches(/.*J.rainbow.close.*/);
                    while (1) {
                        let _node = _kw.findOnce();
                        if (_node && _node.click()) {
                            debugInfo("关闭主页彩虹对话框");
                        }
                        sleep(240);
                    }
                }),
                unregistered: new Monitor("未注册检测", function () {
                    while (1) {
                        if ($$sel.pickup(/.*\u300a.*用户须知.*\u300b,*/)) {
                            messageAction("脚本无法继续", 4, 0, 0, -1);
                            messageAction("用户未注册蚂蚁森林", 8, 1, 1, 1);
                        }
                    }
                }),
            };

            // constructor(s) //

            function Monitor(name, thr_f) {
                let _thd = $$app["_threads_" + name];
                this.start = function () {
                    if (this.disabled) {
                        return;
                    }
                    if (_thd && _thd.isAlive()) {
                        return _thd;
                    }
                    _thd = null;
                    debugInfo("开启" + name + "监测线程");
                    return _thd = threads.starts(thr_f);
                };
                this.interrupt = function () {
                    if (_thd && !this.disabled) {
                        debugInfo("结束" + name + "监测线程");
                        return _thd.interrupt();
                    }
                };
                this.isAlive = () => _thd && _thd.isAlive();
                this.join = t => _thd && _thd.join(t);
                this.disable = function () {
                    this.interrupt();
                    this.disabled = true;
                };
            }
        }
    },
    unlock() {
        if (!$$dev.is_screen_on && !$$cfg.auto_unlock_switch) {
            messageAction("脚本无法继续", 4, 0, 0, -1);
            messageAction("屏幕关闭且自动解锁功能未开启", 9, 1, 1, 1);
        }

        if ($$dev.isUnlocked() && $$dev.is_screen_on) {
            debugInfo("无需解锁");
        } else {
            $$dev.unlock();
        }
        $$flag.dev_unlocked = true;

        return this;
    },
    command() {
        let _ = cmdSetter();
        _.trigger() && _.exec();

        return this;

        // tool function(s) //

        function cmdSetter() {
            return {
                cmd: $$app.my_engine_argv.cmd,
                get cmd_list() {
                    let _cmd = this.commands;
                    return {
                        launch_rank_list: _cmd.lchRl.bind(_cmd),
                        get_rank_list_names: _cmd.friList.bind(_cmd),
                        get_current_account_name: _cmd.curAccName.bind(_cmd),
                    };
                },
                commands: {
                    _quit() {
                        let _aim = [];
                        let _l = arguments.length;
                        if (!_l) {
                            _aim = ["alipay", "app"];
                        } else {
                            for (let i = 0; i < _l; i += 1) {
                                _aim.push(arguments[i].toLowerCase());
                            }
                        }
                        ~_aim.indexOf("alipay") && $$app.page.alipay.close();
                        ~_aim.indexOf("app") && $$app.exit(false);
                    },
                    lchRl() {
                        $$app.page.rl.launch(null, {
                            task_name: "进入好友排行榜",
                            first_time_run_message_flag: false,
                        });
                        this._quit("app");
                    },
                    friList() {
                        _launch() && _collect();
                        this._quit();

                        // tool function(s) //

                        function _launch() {
                            timeRecorder("get_rl_data", "save");

                            return $$app.page.rl.launch(null, {
                                task_name: "好友列表数据采集",
                                first_time_run_message_flag: false,
                            });
                        }

                        function _collect() {
                            $$app.task_name = surroundWith("好友列表数据采集");
                            messageAction("正在采集好友列表数据", 1, 1, 0, "both");

                            let _thd_swipe = threads.starts(_thdSwipe);
                            let _thd_expand_lst = threads.starts(_thdExpandLst);
                            _thd_expand_lst.join(5 * 60e3);
                            _thd_expand_lst.interrupt();
                            _thd_swipe.interrupt();

                            let _ls_data = _getLstData();
                            $$sto.af.put("friends_list_data", _ls_data);

                            let _et = timeRecorder("get_rl_data", "L", "auto");
                            let _sum = _ls_data.list_length + " 项";
                            messageAction("采集完毕", 1, 1, 0, -1);
                            messageAction("用时 " + _et, 1, 0, 1);
                            messageAction("总计 " + _sum, 1, 0, 1, 1);

                            return $$flag.floaty_fin = 1;

                            // tool function(s) //

                            function _getLstData() {
                                let _data = [];
                                let _nodes = $$sel.pickup([$$app.rex_energy_amt], "nodes").slice(1);

                                _nodes.forEach((w, i) => {
                                    let _nickname = $$sel.pickup([w, "p2c2c0c0"], "txt");
                                    let _rank = i < 3 ? i + 1 : $$sel.pickup([w, "p2c0c0"], "txt");
                                    _data.push({
                                        rank_num: _rank.toString(),
                                        nickname: _nickname,
                                    });
                                });

                                let _max_len = _data[_data.length - 1].rank_num.length;
                                let _pad = new Array(_max_len).join("0");
                                _data.map(o => o.rank_num = (_pad + o.rank_num).slice(-_max_len));

                                return {
                                    timestamp: $$app.ts,
                                    list_data: _data,
                                    list_length: _data.length,
                                };
                            }

                            // thread function(s) //

                            function _thdSwipe() {
                                let _dist = $$cfg.rank_list_swipe_distance;
                                if (_dist < 1) {
                                    _dist = Math.trunc(_dist * H);
                                }
                                let _top = Math.trunc((uH - _dist) / 2);
                                let _btm = uH - _top;
                                while (!$$flag.rl_bottom_rch) {
                                    swipe(halfW, _btm, halfW, _top, 150);
                                }
                            }

                            function _thdExpandLst() {
                                let _aim = _locatorSetter().locate();

                                _aim.waitForStrMatch();
                                _aim.waitForPosition();
                                _aim.transmitSignal();

                                // tool function(s) //

                                function _locatorSetter() {
                                    return {
                                        locate() {
                                            debugInfo("开始定位排行榜可滚动控件");
                                            $$flag.rl_end_locating = true;

                                            while (1) {
                                                let _node = selector().scrollable().find()[0];
                                                if (_node) {
                                                    debugInfo("已定位并缓存排行榜可滚动控件");
                                                    return aimSetter(_node);
                                                }
                                                sleep(300);
                                            }
                                        },
                                    };

                                    // tool function(s) //

                                    function aimSetter(cached) {
                                        return {
                                            waitForStrMatch() {
                                                $$flag.rl_end_str_matching = true;
                                                debugInfo("开始监测列表底部控件描述文本");

                                                while (1) {
                                                    try {
                                                        let _last = cached;
                                                        let _child_cnt;
                                                        while ((_child_cnt = _last.childCount())) {
                                                            _last = _last.child(_child_cnt - 1);
                                                        }
                                                        if ($$sel.pickup(_last, "txt").match(/没有更多/)) {
                                                            debugInfo("列表底部控件描述文本匹配");
                                                            delete $$flag.rl_end_str_matching;
                                                            cached = _last;
                                                            return true;
                                                        }
                                                        cached.refresh(); // boolean
                                                    } catch (e) {
                                                        console.warn(e.message);
                                                        sleep(500);
                                                    }
                                                }
                                            },
                                            waitForPosition() {
                                                $$flag.rl_end_pos_matching = true;
                                                debugInfo("开始监测列表底部控件屏幕高度");

                                                while (1) {
                                                    try {
                                                        let _h = $$sel.pickup(cached, "bounds").height();
                                                        if (_h > 20) {
                                                            break;
                                                        }
                                                    } catch (e) {
                                                        // height() of null
                                                    } finally {
                                                        cached.refresh();
                                                        sleep(200);
                                                    }
                                                }

                                                debugInfo("列表底部控件高度满足结束条件");
                                                cached.recycle();
                                                delete $$flag.rl_end_pos_matching;
                                            },
                                            transmitSignal() {
                                                debugInfo("发送排行榜停检信号");
                                                $$flag.rl_bottom_rch = true;
                                            },
                                        };
                                    }
                                }
                            }
                        }
                    },
                    curAccName() {
                        _getCurAccName();
                        this._quit();

                        // tool function(s) //

                        function _getCurAccName() {
                            timeRecorder("cur_acc_nm");

                            let _name = _byPipeline();
                            messageAction("采集完毕", 1);

                            let _sto_key = "collected_current_account_name";
                            $$sto.af.remove(_sto_key);
                            $$sto.af.put(_sto_key, _name);

                            let _et = timeRecorder("cur_acc_nm", "L", "auto");
                            messageAction("用时 " + _et, 1, 0, 1);

                            $$flag.floaty_fin = 1;

                            // tool function(s) //

                            function _byPipeline() {
                                let _name = "";
                                let _thd_get_name = threads.starts(_thdGetName);
                                let _thd_mon_logout = threads.starts(_thdMonLogout);

                                let _cond = () => _name || $$flag.acc_logged_out;
                                waitForAction(_cond, 12e3);

                                _thd_get_name.interrupt();
                                _thd_mon_logout.interrupt();

                                if (_name) {
                                    return _name;
                                }
                                if ($$flag.acc_logged_out) {
                                    let _s = "账户已登出";
                                    messageAction(_s, 3, 1, 0, "both_dash");
                                    delete $$flag.acc_logged_out;
                                }
                                return "";

                                // thread function(s) //

                                function _thdGetName() {
                                    $$app.task_name = surroundWith("采集当前账户名");
                                    $$app.page.alipay.home();

                                    messageAction("正在采集当前账户名", 1, 0, 0, -1);

                                    clickActionsPipeline([
                                        [["我的", "p1"]],
                                        [idMatches(/.*userinfo_view/)],
                                        [["个人主页", "p4"]],
                                        ["支付宝账户", null]
                                    ], {
                                        name: "支付宝个人主页",
                                        default_strategy: "widget",
                                    });

                                    let _txt = "";
                                    let _sel = () => {
                                        let _b = "支付宝账户"; // body
                                        let _c = "s+1"; // compass
                                        let _res = $$sel.pickup([_b, _c], "txt");
                                        return _txt = _res;
                                    };
                                    waitForAction(_sel, 2e3);

                                    return _name = _txt ? $$acc.encode(_txt) : "";
                                }

                                function _thdMonLogout() {
                                    delete $$flag.acc_logged_out;

                                    let _cA = () => $$acc.isInLoginPg();
                                    let _cB = () => $$sel.get("acc_logged_out");
                                    let _cond = () => _cA() || _cB();

                                    while (!_cond()) {
                                        sleep(500);
                                    }

                                    $$flag.acc_logged_out = true;
                                }
                            }
                        }
                    },
                },
                trigger() {
                    let _cmd = this.cmd;
                    if (!_cmd) {
                        return;
                    }
                    if (!(_cmd in this.cmd_list)) {
                        messageAction("脚本无法继续", 4, 0, 0, -1);
                        messageAction("未知的传递指令参数:", 4, 1, 1);
                        messageAction(_cmd, 9, 0, 1, 1);
                    }
                    return true;
                },
                exec() {
                    let _cmd = this.cmd;
                    debugInfo(["执行传递指令:", _cmd]);
                    this.cmd_list[_cmd]();
                    sleep(4e3);
                },
            };
        }
    },
};

let $$af = {
    _launcher: {
        _ready_setter: {
            _changeLangToChs() {
                if (!_getReady()) {
                    return;
                }
                toast("切换支付宝语言: 简体中文");
                $$app.page.disPermissionDiag();

                return clickActionsPipeline([
                    [["Me", "p1"]],
                    [["Settings", {clickable: true}]],
                    [["General", "p4"]],
                    [["Language", "p4"]],
                    [["简体中文", "p4"], () => (
                        $$sel.pickup(
                            ["简体中文", "p3"], "children"
                        ).length > 1)
                    ],
                    ["Save"],
                ], {
                    name: "简体中文语言切换",
                    default_strategy: "widget",
                });

                // tool function(s) //

                function _getReady() {
                    let _max_close = 12;
                    while ($$app.page.close() && _max_close--) {
                        sleep(500);
                    }

                    let _tv = "TextView";
                    let _tab = "tab_description";
                    let _kw_home = className(_tv).idContains(_tab);
                    if (waitForAction(_kw_home, 2e3)) {
                        return true;
                    }

                    let _max = 5;
                    while (_max--) {
                        let _pkg = $$app.pkg_name;
                        killThisApp(_pkg);
                        app.launch(_pkg);
                        if (waitForAction(_kw_home, 15e3)) {
                            break;
                        }
                    }
                    if (_max >= 0) {
                        return true;
                    }
                    messageAction("Language switched failed", 4, 1);
                    messageAction("Homepage failed to get ready", 4, 0, 1);
                }
            },
            captReady() {
                // CAUTION:
                // images.capt() contains images.permitCapt()
                // however, which is not recommended to be used
                // into a Java Thread at the first time
                // as capture permission will be forcibly interrupted
                // with this thread killed in a short time (about 300ms)
                images.permitCapt();
            },
            displayReady() {
                if (!$$0($$dev.screen_orientation)) {
                    $$dev.getDisplay(true);
                }
            },
            languageReady() {
                let _tt = "";
                let _sel = () => _tt = $$sel.get("af_title", "txt");

                if (!waitForAction(_sel, 10e3, 100)) {
                    messageAction("语言检测已跳过", 3);
                    messageAction("语言检测超时", 3, 0, 1, 1);
                    return;
                }

                if (_tt.match(/蚂蚁森林/)) {
                    debugInfo("当前支付宝语言: 简体中文");
                } else {
                    debugInfo("当前支付宝语言: 英语");
                    this._changeLangToChs();

                    let _sA = "切换支付宝语言: 简体中文";
                    let _sB = "语言切换失败";
                    $$app.page.af.home()
                        ? messageAction(_sA, 1, 0, 0, 1)
                        : messageAction(_sB, 8, 1, 0, 1);
                }

                debugInfo("语言检查完毕");
            },
            mainAccReady() {
                return $$acc.main.login();
            },
        },
        greet() {
            let _msg = "开始" + $$app.task_name + "任务";
            messageAction(_msg, 1, 1, 0, "both");
            return this;
        },
        assign() {
            $$af = Object.assign($$af, {
                emount_t_own: 0, // t: total
                emount_c_own: 0, // c: collected
                emount_c_fri: 0,
                home_balls_info: {},
                eballs(type, options) {
                    let _opt = options || {};
                    if (!_opt.cache || !this.home_balls_info.size()) {
                        this.home_balls_info = images.findAFBallsByHough({
                            no_debug_info: _opt.no_debug_info,
                        });
                    }
                    if (!type || type === "all") {
                        return this.home_balls_info.expand();
                    }
                    return this.home_balls_info[type] || [];
                },
                cleaner: {
                    imgWrapper() {
                        $$af && Object.keys($$af).forEach((key) => (
                            images.reclaim($$af[key])
                        ));
                    },
                },
            });
            return this;
        },
        home() {
            $$app.monitor.unregistered.start();
            $$app.page.af.home();
            $$app.monitor.unregistered.disable();
            return this;
        },
        ready() {
            let _ = this._ready_setter;
            _.captReady();
            _.displayReady();
            _.languageReady();
            _.mainAccReady();
            return this;
        },
    },
    _collector: {
        own: {
            _getEmount(buf) {
                let _amt;
                let _rex = /\d+g/;
                let _max = buf ? 10 : 1;
                while (1) {
                    _amt = $$sel.pickup([_rex, {
                        boundsInside: [cX(0.6), 0, W, cYx(0.24)],
                    }], "txt").match(/\d+/);
                    _amt = $$arr(_amt) ? +_amt[0] : _amt;
                    if ($$num(_amt) || !--_max) {
                        break;
                    }
                    sleep(200);
                }
                return _max < 0 ? -1 : _amt;
            },
            trigger() {
                if ($$cfg.self_collect_switch) {
                    $$af.own = this;
                    return true;
                }
                debugInfo(["跳过自己能量检查", "自收功能未开启"]);
            },
            init() {
                debugInfo("开始检查自己能量");

                let _total = this._getEmount("buf");
                debugInfo("初始能量: " + ($$af.emount_t_own = _total) + "g");

                let _avt = $$app.avatar_checked_time;
                if (_avt) {
                    debugInfo("主账户检测耗时: " + _avt);
                    delete $$app.avatar_checked_time;
                }

                let _homepage = $$cfg.homepage_monitor_threshold;
                let _bg = $$cfg.homepage_background_monitor_threshold;
                $$af.min_ctd_own = Infinity;
                $$af.thrd_monit_own = _homepage;
                $$af.thrd_bg_monit_own = _bg;

                return this;
            },
            collect: function () {
                let _own = this;
                _detect() && _check();
                _result();
                return this;

                // tool function(s) //

                function _detect() {
                    let _len = $$af.eballs().length;
                    if (_len) {
                        debugInfo("找到主页能量球: " + _len + "个");
                        return true;
                    }
                    debugInfo("未发现主页能量球");
                }

                function _check() {
                    _prologue();
                    _chkRipeBalls();
                    _chkCountdown();
                    _chkWaterBalls();
                    _epilogue();

                    // tool function(s) //

                    function _prologue() {
                        $$app.monitor.tree_rainbow.start();
                    }

                    function _chkRipeBalls() {
                        _checkRipeBalls({cache: true});
                    }

                    // with "fixed" option, ripe balls recognition
                    // will be performed in some fixed area(s)
                    // without extra houghCircles() actions
                    function _checkRipeBalls(options) {
                        let _balls = _getBallsInfo(options);
                        if (!_balls.length) {
                            return;
                        }

                        let _max = 8;
                        let _itv = $$cfg.balls_click_interval;
                        let _par = {press_time: 80};
                        let _num = _balls.length;
                        let _noRipeBalls = () => !_getBallsInfo({no_debug_info: true}).length;

                        do {
                            debugInfo("点击自己成熟能量球: " + _num + "个");
                            _balls.forEach((o) => {
                                clickAction(o, "p", _par);
                                sleep(_itv);
                            });
                        } while (--_max && !waitForAction(_noRipeBalls, 2.4e3));

                        if (_max >= 0) {
                            return _stableEmount();
                        }

                        // tool function(s) //

                        function _getBallsInfo(options) {
                            let _opt = options || {};
                            let _no_dbg = _opt.no_debug_info;
                            let _stg = {
                                cache: () => $$af.eballs("ripe", {
                                    cache: true, no_debug_info: _no_dbg,
                                }),
                                refresh: () => $$af.eballs("ripe", {
                                    cache: false, no_debug_info: _no_dbg,
                                }),
                                fixed() {
                                    let _cache = $$af.eballs("all", {
                                        cache: true, no_debug_info: _no_dbg,
                                    });
                                    if (!_cache.length) {
                                        this.refresh();
                                        _cache = this.cache();
                                    }
                                    let _result = [];
                                    if (_cache.length) {
                                        let _capt = images.capt();
                                        _cache.forEach((o) => {
                                            images.isRipeBall(o, _capt, _result);
                                        });
                                        _capt.recycle();
                                        _capt = null;
                                    }
                                    return _result;
                                },
                            };
                            if (_opt.cache) {
                                return _balls = _stg.cache();
                            }
                            if (_opt.fixed) {
                                return _balls = _stg.fixed();
                            }
                            return _balls = _stg.refresh();
                        }
                    }

                    function _stableEmount() {
                        let _t = $$af.emount_t_own;
                        let _getEm = _own._getEmount;
                        let _i = $$app.tool.stabilizer(_getEm, _t) - _t;

                        if (_i <= 0 || isNaN(_i)) {
                            sleep(500);
                            $$af.emount_t_own = _getEm("buf");
                            $$af.emount_c_own += $$af.emount_t_own - _t;
                        } else {
                            $$af.emount_t_own += _i;
                            $$af.emount_c_own += _i;
                        }

                        return true;
                    }

                    function _chkCountdown() {
                        if (_trigger()) {
                            while (_check()) {
                                _monitor();
                            }
                        }

                        // tool function(s) //

                        function _trigger() {
                            // i know it's perfect... [:lying_face:]

                            let _cA = $$cfg.homepage_background_monitor_switch;
                            let _cB1 = $$cfg.timers_switch;
                            let _cB2a = $$cfg.homepage_monitor_switch;
                            let _cB2b1 = $$cfg.timers_self_manage_switch;
                            let _cB2b2 = $$cfg.timers_countdown_check_own_switch;
                            let _cB2b = _cB2b1 && _cB2b2;
                            let _cB2 = _cB2a || _cB2b;
                            let _cB = _cB1 && _cB2;

                            return _cA || _cB;
                        }

                        function _check() {
                            debugInfo("开始检测自己能量球最小倒计时");

                            let _nor_balls = $$af.eballs("naught", {cache: true});
                            let _len = _nor_balls.length;
                            if (!_len) {
                                $$af.min_ctd_own = Infinity;
                                return debugInfo("未发现未成熟的能量球");
                            }
                            debugInfo("找到自己未成熟能量球: " + _len + "个");

                            let _t_spot = timeRecorder("ctd_own");
                            let _min_ctd_own = Math.mini(_getCtdData());

                            if (!$$posNum(_min_ctd_own)) {
                                $$af.min_ctd_own = Infinity;
                                return debugInfo("自己能量最小倒计时数据无效", 3);
                            }
                            if ($$inf(_min_ctd_own)) {
                                $$af.min_ctd_own = Infinity;
                                return debugInfo("自己能量倒计时数据为空");
                            }

                            let _par = ["ctd_own", "L", 60e3, 0, "", _min_ctd_own];
                            let _remain = +timeRecorder.apply({}, _par);
                            $$af.min_ctd_own = _min_ctd_own;

                            debugInfo("自己能量最小倒计时: " + _remain + "分钟");
                            debugInfo("时间: " + $$app.tool.timeStr(_min_ctd_own));

                            let _cA = $$cfg.homepage_monitor_switch;
                            let _cB = _remain <= $$af.thrd_monit_own;
                            if (_cA && _cB) {
                                debugInfo("触发成熟能量球监测条件");
                                return true;
                            }
                            debugInfo("自己能量球最小倒计时检测完毕");

                            // tool function(s) //

                            function _getCtdData() {
                                timeRecorder("ctd_data");

                                let _tt = 12e3;
                                let _alive = thd => thd && thd.isAlive();
                                let _kill = (thd) => {
                                    thd && thd.interrupt();
                                    thd = null;
                                };
                                let _remainT = () => _tt - timeRecorder("ctd_data", "L");
                                let _ctd_data = [];
                                let _thd_ocr = threads.starts(_thdOcr);
                                let _thd_toast = threads.starts(_thdToast);

                                _thd_toast.join(1.5e3);

                                if (_alive(_thd_toast)) {
                                    _kill(_thd_toast);
                                    let _str_a = "Toast监控线程获取数据超时";
                                    let _str_b = "强制停止Toast监控线程";
                                    debugInfo([_str_a, _str_b]);
                                }

                                _thd_ocr.join(Math.max(_remainT(), 0));

                                if (_remainT() < 0) {
                                    _kill(_thd_toast);
                                    _kill(_thd_ocr);
                                    let _str_a = "获取自己能量倒计时超时";
                                    let _str_b1 = "最小倒计时数据";
                                    let _str_b2 = _ctd_data.length ? "可能不准确" : "获取失败";
                                    messageAction(_str_a, 3);
                                    messageAction(_str_b1 + _str_b2, 3, 0, 0, 1);
                                }

                                return _ctd_data.map(str => {
                                    let _matched = str.match(/\d+:\d+/);
                                    if (!_matched) {
                                        messageAction("无效字串:", 3);
                                        messageAction(str, 3);
                                        return Infinity;
                                    }
                                    let [_h, _m] = _matched[0].split(":");
                                    return _t_spot + (+_h * 60 + +_m) * 6e4;
                                }).filter($$fin);

                                // thread function(s) //

                                function _thdOcr() {
                                    debugInfo("已开启倒计时数据OCR识别线程");

                                    let _capt = images.capt();
                                    let _stitched = null;

                                    let _raw_data = baiduOcr(
                                        _stitchImg(), {
                                            fetch_times: 3,
                                            fetch_interval: 500,
                                            no_toast_msg_flag: true,
                                            capt_img: _capt,
                                        })
                                        .map((data) => {
                                            // eg: [["11:29"], ["11:25", "07:03", "3"], [""]]
                                            // --> [["11:29"], ["11:25", "07:03"], []]
                                            return data.filter(s => !!s.match(/\d{2}:\d{2}/));
                                        })
                                        .filter((data) => {
                                            // eg: [["11:29"], ["11:25", "07:03"], []]
                                            // --> [["11:29"], ["11:25", "07:03"]]
                                            return data.length > 0;
                                        })
                                        .map((data) => {
                                            // eg: [["11:29"], ["11:25", "07:03"]]
                                            // --> [["11:29"], ["07:03", "11:25"]]
                                            // --> ["11:29", "07:03"]
                                            return data.sort((a, b) => a > b ? 1 : -1)[0];
                                        });

                                    images.reclaim(_capt, _stitched);
                                    _capt = _stitched = null;

                                    if (!_raw_data.length) {
                                        debugInfo("OCR识别线程未能获取有效数据");
                                        return;
                                    }
                                    debugInfo("OCR识别线程已获取有效数据");

                                    if (_ctd_data.length) {
                                        debugInfo(["数据未被采纳", ">倒计时数据非空"]);
                                        return;
                                    }
                                    debugInfo("OCR识别线程数据已采纳");

                                    return _ctd_data = _raw_data;

                                    // tool function(s) //

                                    // to stitch af home balls image
                                    function _stitchImg() {
                                        _stitched = _toImg(_nor_balls[0]);

                                        _nor_balls.forEach((o, idx) => {
                                            if (idx) {
                                                let _par = [_stitched, _toImg(o), "BOTTOM"];
                                                _stitched = images.concat.apply(images, _par);
                                            }
                                        });

                                        return _stitched;

                                        // tool function(s) //

                                        function _toImg(o) {
                                            let [_l, _t] = [o.left, o.top];
                                            let [_w, _h] = [o.width(), o.height()];
                                            return images.clip(_capt, _l, _t, _w, _h);
                                        }
                                    }
                                }

                                function _thdToast() {
                                    debugInfo("已开启倒计时数据Toast监控线程");

                                    let _data = [];
                                    let _par = [$$app.pkg_name, /才能收取/, 480];

                                    _nor_balls.forEach((o) => {
                                        clickAction(o, "p", {press_time: 12});
                                        _data = _data.concat(
                                            observeToastMessage.apply({}, _par)
                                        );
                                    });

                                    if (_data.length) {
                                        debugInfo("Toast监控线程已获取有效数据");
                                        if (_alive(_thd_ocr)) {
                                            _kill(_thd_ocr);
                                            debugInfo("强制停止OCR识别线程");
                                        }
                                        return _ctd_data = _data;
                                    }
                                    debugInfo("Toast监控线程未能获取有效数据");
                                }
                            }
                        }

                        function _monitor() {
                            let _self = arguments.callee;
                            _self.debug_page_state_flip = 1;

                            let _thrd = $$af.thrd_monit_own;
                            let _tt = _thrd * 60e3 + 3e3;
                            let _old_em = $$af.emount_c_own;

                            toast("Non-stop checking time");
                            debugInfo("开始监测自己能量");
                            timeRecorder("monitor_own");
                            $$app.monitor.af_home_in_page.start();

                            $$dev.keepOn(_tt);
                            while (timeRecorder("monitor_own", "L") < _tt) {
                                if ($$flag.af_home_in_page) {
                                    _debugPageState();
                                    if (_checkRipeBalls({fixed: true})) {
                                        break;
                                    }
                                }
                                _debugPageState();
                                sleep(180);
                            }
                            $$dev.cancelOn();
                            $$app.monitor.af_home_in_page.interrupt();
                            delete $$flag.af_home_in_page;

                            let _em = $$af.emount_c_own - _old_em;
                            let _et = timeRecorder("monitor_own", "L", "auto");
                            toast("Checking completed");
                            debugInfo("自己能量监测完毕");
                            debugInfo("本次监测收取结果: " + _em + "g");
                            debugInfo("监测用时: " + _et);

                            // tool function(s) //

                            function _debugPageState() {
                                let _is_in_page = +$$flag.af_home_in_page;
                                if (_is_in_page !== _self.debug_page_state_flip) {
                                    let _mA = ["当前页面满足森林主页条件", "继续监测自己能量"];
                                    let _mB = ["当前页面不满足森林主页条件", "暂停监控自己能量"];
                                    if (timeRecorder("monitor_own", "L") > 1e3) {
                                        debugInfo(_is_in_page ? _mA : _mB);
                                    }
                                    _self.debug_page_state_flip = _is_in_page;
                                }
                            }
                        }
                    }

                    function _chkWaterBalls() {
                        debugInfo("开始检测浇水回赠能量球");

                        let _lmt = $$cfg.homepage_water_ball_check_limit;
                        let _wballs_cache = $$af.eballs("water", {cache: true});
                        let _wballs_info = {
                            lmt: _lmt || Infinity,
                            ctr: 0,
                        };

                        if (_wballs_cache.length) {
                            debugInfo("发现浇水回赠能量球");
                            _wballs_cache.forEach(_fetch);
                            while (_trig()) {
                                _fetch();
                            }
                        }

                        if (_wballs_info.ctr) {
                            let _pref = "收取浇水回赠能量球: ";
                            debugInfo(_pref + _wballs_info.ctr + "个");
                        } else {
                            debugInfo("未发现浇水回赠能量球");
                        }

                        debugInfo("浇水回赠能量球检测完毕");

                        // tool function(s) //

                        function _trig() {
                            delete _wballs_info.coord;
                            if (_wballs_info.lmt--) {
                                let _capt = images.capt();
                                for (let coord of _wballs_cache) {
                                    if (images.isWball(coord, _capt)) {
                                        return _wballs_info.coord = coord;
                                    }
                                }
                                return false;
                            }
                            let _sA = "中断主页浇水回赠能量球检测";
                            let _sB = "已达最大检查次数限制";
                            messageAction(_sA, 3, 0, 0, -1);
                            messageAction(_sB, 3, 0, 1, 1);
                        }

                        function _fetch(cache_o) {
                            let _par = {press_time: 80};
                            if (cache_o) {
                                clickAction(cache_o, "p", _par);
                            } else {
                                clickAction(_wballs_info.coord, "p", _par);
                            }
                            sleep(240);
                            _wballs_info.ctr += 1;
                            _stableEmount();
                        }
                    }

                    function _epilogue() {
                        $$app.monitor.tree_rainbow.interrupt();
                    }
                }

                function _result() {
                    let _em = $$af.emount_c_own;
                    if (_em < 0 || $$inf(_em)) {
                        debugInfo("收取值异常: " + _em, 3);
                    } else if (!_em) {
                        debugInfo("无能量球可收取");
                    } else {
                        debugInfo("共计收取: " + _em + "g");
                        $$app.db.insertInto(["%SELF%", $$app.ts_sec, _em, 0]);
                    }
                    debugInfo("自己能量检查完毕");
                }
            },
            awake(thrd) {
                let _thrd = thrd || $$af.thrd_bg_monit_own;
                if (_thrd) {
                    let _ctd_ts = $$af.min_ctd_own;
                    let _thrd_ts = _thrd * 60e3 + 3e3;
                    let _cA = _ctd_ts && $$fin(_ctd_ts);
                    let _cB = _ctd_ts - $$app.ts <= _thrd_ts;
                    if (_cA && _cB) {
                        messageAction("开始主页能量球返检监控", 1, 1, 0, 1);
                        $$app.page.af.home();
                        this.init().collect();
                        return true;
                    }
                }
            },
        },
        fri: {
            _getSmp(cache_fg) {
                let _this = this;
                if (cache_fg && this.rl_samples) {
                    return this.rl_samples;
                }

                let _rex = new RegExp("\\d+\u2019");
                let _nodes = $$sel.pickup(_rex, "nodes");

                let _len = _nodes.length;
                debugInfo("捕获好友能量倒计时数据: " + _len + "项");

                return _parseNodes();

                // tool function(s) //

                function _parseNodes() {
                    let _smp = {};

                    _nodes.forEach((w) => {
                        let _mm = +$$sel.pickup(w, "txt").match(/\d+/)[0];
                        let _nick = $$sel.pickup([w, "p2c2c0c0"], "txt");
                        if (_mm && _nick) {
                            _smp[_nick] = {
                                ts: $$app.ts + _mm * 60e3,
                                minute: _mm,
                            };
                        }
                    });

                    let _z = _smp.size();
                    _z && debugInfo("解析好友有效倒计时数据: " + _z + "项");

                    return _this.rl_samples = _smp;
                }
            },
            _chkMinCtd(cache_fg) {
                let _smp = this._getSmp(cache_fg);
                let _len = Object.keys(_smp).length;
                if (_len) {
                    let _min_mm = Infinity;
                    let _min_ctd = Infinity;
                    Object.values(_smp).forEach((o) => {
                        if (o.ts < _min_ctd) {
                            _min_ctd = o.ts;
                            _min_mm = o.minute;
                        }
                    });
                    if (_min_mm > 0) {
                        $$af.min_ctd_fri = _min_ctd;
                        debugInfo("好友能量最小倒计时: " + _min_mm + "分钟");
                        debugInfo("时间数据: " + $$app.tool.timeStr(_min_ctd));
                        debugInfo("好友能量最小倒计时检测完毕");
                        return _min_mm <= $$cfg.rank_list_review_threshold;
                    }
                    return debugInfo("好友倒计时数据无效: " + _min_mm, 3);
                }
            },
            eballs: {
                orange: [],
                ripe: [],
                naught: [],
                water: [],
                get length() {
                    return this.orange.length +
                        this.ripe.length +
                        this.naught.length;
                },
                reset() {
                    this.orange.splice(0);
                    this.ripe.splice(0);
                    this.naught.splice(0);
                    this.water.splice(0);
                },
            },
            trigger() {
                let _sw_pick = $$cfg.friend_collect_switch;
                let _sw_help = $$cfg.help_collect_switch;

                if (!_sw_pick) {
                    let _str_a = "跳过好友能量检查";
                    if (!_sw_help) {
                        let _str_b = ">收取功能与帮收功能均已关闭";
                        return debugInfo([_str_a, _str_b]);
                    }
                    if (!_chkHelpSect()) {
                        let _str_b = ">收取功能已关闭";
                        let _str_c = ">且当前时间不在帮收有效时段内";
                        return debugInfo([_str_a, _str_b, _str_c]);
                    }
                }

                Object.defineProperties(this, {
                    trig_pick: {get: () => _sw_pick},
                    trig_help: {get: () => _sw_help && _chkHelpSect()},
                });

                $$af.fri = this;

                return true;

                // tool function(s) //

                function _chkHelpSect() {
                    let [_s0, _s1] = $$cfg.help_collect_section;

                    if (_s1 <= _s0) {
                        _s1 = _s1.replace(/\d{2}(?=:)/, $0 => +$0 + 24);
                    }

                    let _now_str = $$app.tool.timeStr($$app.now, "hh:mm");
                    let _res = $$str(_s0, "<=", _now_str, "<", _s1);

                    if (!_res && !$$flag.help_sect_hinted) {
                        debugInfo("当前时间不在帮收有效时段内");
                        $$flag.help_sect_hinted = true;
                    }

                    return _res;
                }
            },
            init() {
                greet();
                killH5();
                params();

                return this;

                // tool function(s) //

                function greet() {
                    let _rev = $$flag.rl_review;
                    let _act = _rev ? "复查" : "检查";
                    debugInfo("开始" + _act + "好友能量");
                }

                function killH5() {
                    let _trig = () => {
                        return $$sel.get("af_title")
                            || $$sel.get("rl_title")
                            || $$app.page.fri.isInPage();
                    };
                    if (_trig()) {
                        let _max = 20;
                        let _ctr = 0;
                        do {
                            keycode(4, {double: true});
                            _ctr += 1;
                            sleep(500);
                        } while (_max-- && _trig());

                        return debugInfo("关闭相关H5页面: " + _ctr + "页");
                    }
                }

                function params() {
                    delete $$flag.rl_valid_click;
                    delete $$flag.help_sect_hinted;
                    delete $$flag.rl_bottom_rch;
                    delete $$flag.rl_review;

                    $$af.min_ctd_fri = Infinity;
                }
            },
            launch() {
                $$app.page.rl.launch();
                $$app.monitor.rl_in_page.start();
                $$app.monitor.rl_bottom.start();
                $$app.user_nickname = _getNickname();

                // tool function(s) //

                function _getNickname() {
                    if (!$$und($$app.user_nickname)) {
                        return $$app.user_nickname;
                    }

                    return _fromRl() || _fromActivity();

                    // tool function(s) //

                    function _fromRl() {
                        try {
                            let _res = $$sel.pickup([$$app.rex_energy_amt, "p2c2c0c0"], "txt");
                            if (_res) {
                                debugInfo("已从排行榜获取当前账户昵称");
                                return _res;
                            }
                            debugInfo("排行榜获取到无效账户昵称", 3);
                        } catch (e) {
                            debugInfo("排行榜获取账户昵称失败", 3);
                        }
                    }

                    function _fromActivity() {
                        app.startActivity({
                            action: "VIEW",
                            data: "alipays://platformapi/startapp?appId=20000141",
                        });

                        let _kw = className("EditText");
                        let _nick = "";
                        let _sel = () => _nick = $$sel.pickup(_kw, "txt");

                        if (!waitForAction(_kw, 4.8e3, 60)) {
                            messageAction("无法获取当前账户昵称", 3, 0, 0, -1);
                            messageAction("进入昵称设置页面超时", 3, 1, 0, 1);
                        } else {
                            waitForAction(_sel, 480, 60);
                            $$app.page.back();
                        }

                        // make it easier for rl to launch
                        sleep(500);

                        if ($$str(_nick, "")) {
                            let _kw = idMatches(/.*user_name_left/);
                            let _sel = () => _nick = $$sel.pickup(_kw, "txt");

                            $$app.page.alipay.home({debug_info_flag: false});
                            clickAction($$sel.pickup(["我的", "p1"]), "w");
                            waitForAction(_sel, 2.4e3);
                            _nick = _nick.slice(-2);
                        }

                        _nick && debugInfo("已从活动页面get_rank_list_names获取当前账户昵称");

                        return _nick;
                    }
                }

                return this;
            },
            collect() {
                let _own = this.parent.own;
                let _fri = this;
                let _rl = $$app.page.rl;
                let _tar;
                // TODO cfg: max_not_targeted_swipe_times
                let _max = 200;
                let _max_b = _max; // bak
                let _awake = thrd => _own.awake(thrd);
                let _review = () => this.review();
                let _reboot = () => this.reboot();

                _rl.pool.add();

                while (1) {
                    if (_scan()) {
                        void _gather();
                    }
                    if (_awake()) {
                        return _reboot();
                    }
                    if (_quit()) {
                        break;
                    }
                    _swipe();
                }

                return _review() ? _reboot() : _fin();

                // tool function(s) //

                function _scan() {
                    let _col_pick = $$cfg.friend_collect_icon_color;
                    let _col_help = $$cfg.help_collect_icon_color;

                    let _prop = {
                        pick: {
                            color: _col_pick,
                            col_thrd: $$cfg.friend_collect_icon_threshold,
                            mult_col: (() => {
                                let _mult = [
                                    [cX(38), cYx(35), _col_pick],
                                    [cX(23), cYx(26), -1],
                                ];

                                // from E6683
                                for (let i = 16; i <= 24; i += (4 / 3)) {
                                    _mult.push([cX(i), cY(i - 6, -1), -1]);
                                }

                                // from E6683
                                for (let i = 16; i <= 24; i += (8 / 3)) {
                                    _mult.push([cX(i), cY(i / 2 + 16, -1), -1]);
                                }

                                return _mult;
                            })(),
                            check() {
                                if (_fri.trig_pick) {
                                    return _prop._chkByImgTpl.bind(this)();
                                }
                                if (!$$flag.dys_pick) {
                                    let _sA = "不再采集收取目标样本";
                                    let _sB = ">收取功能已关闭";
                                    debugInfo([_sA, _sB]);
                                    $$flag.dys_pick = true;
                                }
                            },
                        },
                        help: {
                            color: _col_help,
                            col_thrd: $$cfg.help_collect_icon_threshold,
                            mult_col: [[cX(38), cYx(35), _col_help]],
                            check() {
                                if (_fri.trig_help) {
                                    return _prop._chkByMultCol.bind(this)();
                                }
                                if (!$$flag.dys_help) {
                                    let _sA = "不再采集帮收目标样本";
                                    let _sB = ">帮收功能已关闭";
                                    debugInfo([_sA, _sB]);
                                    $$flag.dys_help = true;
                                }
                            },
                        },
                        _chkByMultCol: _chkByMultCol,
                        _chkByImgTpl: _chkByImgTpl,
                    };

                    timeRecorder("rl_scan");

                    _tar = [_getTar("pick"), _getTar("help")];

                    return Math.sum(_tar.map(x => x.length));

                    // tool function(s) //

                    function _chkByMultCol() {
                        let _l = cX(0.9);
                        let _t = 0;
                        let _color = this.color;
                        let _col_thrd = this.col_thrd || 10;
                        let _mult_col = this.mult_col;
                        let _capt = $$app.page.rl.capt_img;
                        let _tar = [];

                        while (_t < H) {
                            let _matched = _check();
                            if (!_matched) {
                                break;
                            }

                            let _y = _matched.y;
                            _t = _y + cYx(76);

                            _tar.unshift({
                                icon_matched_x: _matched.x,
                                icon_matched_y: _y,
                                list_item_click_y: _y + cYx(16),
                            });
                        }
                        return _tar;

                        // tool function(s) //

                        function _check() {
                            let _matched = images.findMultiColors(
                                _capt, _color, _mult_col, {
                                    region: [_l, _t, W - _l, H - _t],
                                    threshold: _col_thrd,
                                }
                            );
                            if (_matched) {
                                return {
                                    x: _matched.x,
                                    y: _matched.y,
                                };
                            }
                        }
                    }

                    function _chkByImgTpl() {
                        let _ic_k = "ic_fetch";
                        let _ic_img = _getIcon(_ic_k);
                        let _capt = $$app.page.rl.capt_img;
                        let _x = cX(0.85);
                        let _y = 0;
                        let _w = _capt.getWidth() - _x;
                        let _h = _capt.getHeight() - _y;
                        let _clip = images.clip(_capt, _x, _y, _w, _h);
                        let _res = images.matchTpl(_clip, _ic_img, {
                            name: _ic_k + "_" + W + "p",
                            max: 20,
                            range: [28, 30],
                            threshold_attempt: 0.94,
                            // region_attempt: [cX(0.8), 0, cX(0.2), uH],
                            threshold_result: 0.94,
                        });
                        _clip.recycle();
                        _clip = null;

                        let _tar = [];
                        if (_res) {
                            _res.points.forEach((pt) => {
                                _tar.unshift({
                                    icon_matched_x: pt.x,
                                    icon_matched_y: pt.y,
                                    list_item_click_y: pt.y,
                                });
                            });
                        }
                        return _tar;

                        // tool function(s) //

                        function _getIcon(key) {
                            let _base64 = $$sto.treas.image_base64_data;
                            let _ic = _base64[key];
                            return $$sto[key] = $$sto[key] || images.fromBase64(_ic);
                        }
                    }

                    function _getTar(ident) {
                        let _res = _prop[ident].check() || [];
                        return _res.sort((o_a, o_b) => {
                            let _y_a = o_a.icon_matched_y;
                            let _y_b = o_b.icon_matched_y;
                            return _y_a < _y_b ? 1 : -1;
                        });
                    }
                }

                function _gather() {
                    _lmt("reset");
                    _pick(_tar[0]);
                    _help(_tar[1]);

                    // tool function(s) //

                    function _pick(tar) {
                        _act(tar, "收取");
                    }

                    function _help(tar) {
                        _act(tar, "帮收");
                    }

                    function _act(tar, idt) {
                        let _item = null;
                        let _thd_info_collect = null;
                        let _nextItem = () => _item = tar.pop();

                        while (_nextItem()) {
                            _enter();
                            _intro();
                            _check();
                            _back();
                            _coda();
                        }

                        // tool function(s) //

                        function _enter() {
                            clickAction(
                                [halfW, _item.list_item_click_y], "p",
                                {press_time: 80}
                            );

                            if ($$flag.six_review) {
                                debugInfo("复查当前好友", "both");
                                delete $$flag.six_review;
                            } else {
                                debugInfo("点击" + idt + "目标");
                            }

                            // TODO cond: pool diff
                            // avoid touching widgets in rank list
                            sleep(500);

                            _fri.eballs.reset();

                            return true;
                        }

                        function _intro() {
                            let _nick = "";
                            let _sel = () => _nick = $$sel.get("fri_frst_tt", "txt");
                            if (waitForAction(_sel, 20e3, 80)) {
                                _nick = _nick.replace(/的蚂蚁森林$/, "");
                                $$app.fri_drop_by.ic(_nick);
                                messageAct($$af.nick = _nick, "t");
                            } else {
                                messageAction("标题采集好友昵称超时", 3, 1, 0, "both");
                            }
                        }

                        function _check() {
                            if (!_inBlist() && _ready()) {
                                _monitor();
                                !_cover() && _collect();
                            }

                            // main function(s) //

                            function _inBlist() {
                                let _nick = $$af.nick;
                                if ($$app.blist.get(_nick)) {
                                    $$app.fri_drop_by.dc(_nick);
                                    return true;
                                }
                            }

                            function _ready() {
                                delete $$flag.pick_off_duty;
                                return $$app.page.fri.getReady();
                            }

                            function _monitor() {
                                _thd_info_collect = threads.starts(_thdInfoCollect);
                            }

                            function _thdInfoCollect() {
                                debugInfo("已开启好友森林信息采集线程");
                                let _eballs_o = images.findAFBallsByHough({
                                    pool: $$app.page.fri.pool,
                                    keep_pool_data: true,
                                });

                                for (let k in _eballs_o) {
                                    if (k !== "duration") {
                                        if (_eballs_o.hasOwnProperty(k)) {
                                            _fri.eballs[k] = _eballs_o[k];
                                        }
                                    }
                                }
                                _eballs_o.duration.showDebugInfo();
                            }

                            function _cover() {
                                let _covered = false;
                                let _pool = $$app.page.fri.pool;
                                let _detect = () => _pool.detectCover();
                                let _dismiss = () => debugInfo("颜色识别无保护罩");

                                _ready();
                                _detect() ? _handle() : _dismiss();

                                return _covered;

                                // tool function(s) //

                                function _ready() {
                                    _eballMonOK();
                                    _fillUpIdent();

                                    // tool function(s) //

                                    function _eballMonOK() {
                                        debugInfo("开始能量保护罩检测准备");

                                        let _max = 10;
                                        while (!_pool.len && _max--) {
                                            if (!_thd_info_collect.isAlive()) {
                                                break;
                                            }
                                            sleep(100);
                                        }
                                    }

                                    function _fillUpIdent() {
                                        let _len = _pool.len;
                                        if (_len) {
                                            debugInfo("使用好友森林信息采集线程数据");
                                            debugInfo("可供分析的能量罩样本数量: " + _len);
                                        }
                                        _pool.filled_up || _fillUp();

                                        // tool function(s) //

                                        function _fillUp() {
                                            debugInfo("能量罩样本数量不足");
                                            let _max = 12;
                                            while (1) {
                                                if (!_thd_info_collect.isAlive()) {
                                                    debugInfo(["好友森林信息采集线程已停止", "现场采集能量罩样本数据"]);
                                                    _pool.add();
                                                    break;
                                                } else if (--_max < 0) {
                                                    debugInfo(["等待样本采集超时", "现场采集能量罩样本数据"]);
                                                    _pool.add();
                                                    break;
                                                } else if (_pool.filled_up) {
                                                    debugInfo("能量罩样本数据充足");
                                                    break;
                                                }
                                                sleep(50);
                                            }
                                        }
                                    }
                                }

                                function _handle() {
                                    debugInfo("颜色识别检测到保护罩");
                                    _covered = true;

                                    debugInfo("终止好友森林信息采集线程");
                                    _thd_info_collect.interrupt();

                                    let _node_lst = null;
                                    let _sel_lst = () => _node_lst = $$sel.get("list");
                                    if (!waitForAction(_sel_lst, 3e3, 80)) {
                                        let _msg = "未能通过列表获取能量罩信息";
                                        return messageAction(_msg, 3, 1, 1);
                                    }

                                    let _node_cvr = null;
                                    let _thd_auto_expand = threads.starts(_autoExpand);

                                    _getTs() && _addBlist();

                                    return true;

                                    // tool function(s) //

                                    function _autoExpand() {
                                        debugInfo("已开启动态列表自动展开线程");

                                        let _ctr = 0;
                                        let _par = {click_strategy: "w"};
                                        let _lst_more = $$sel.pickup("点击加载更多");

                                        while (_ctr++ < 50) {
                                            waitForAndClickAction(
                                                _lst_more, 3e3, 120, _par
                                            )
                                            sleep(_ctr < 12 ? 200 : 900);
                                        }
                                    }

                                    function _getTs() {
                                        debugInfo("开始采集能量罩使用时间");

                                        let _kw_lst = className("ListView");
                                        let _noChild = w => !w.childCount();
                                        let _getChild = kw => kw.findOnce().children();
                                        let _lastIdx = w => w.parent().childCount() - 1;
                                        let _notLast = w => w.indexInParent() < _lastIdx(w);
                                        let _filter = w => _noChild(w) && _notLast(w);
                                        let _nodes = null;
                                        let _filtered = () => _getChild(_kw_lst).filter(_filter);
                                        let _getNodes = () => _nodes = _filtered().slice(0, 3);
                                        let _sel_cvr = () => $$sel.get("cover_used");
                                        let _max = 8;

                                        while (_max--) {
                                            let _len = _getNodes().length;
                                            for (let i = 0; i < _len; i += 1) {
                                                let _node = _nodes[i];
                                                let _txt = $$sel.pickup(_node, "txt");
                                                // more than 2 days; like: "03-22"
                                                let _gt2 = _txt.match(/\d{2}.\d{2}/);
                                                if (waitForAction(_sel_cvr, 1e3, 80) || _gt2) {
                                                    debugInfo("能量罩信息定位在: " + _txt);
                                                    return _node_cvr = _sel_cvr();
                                                }
                                            }
                                        }
                                        debugInfo("能量罩使用时间采集失败", 3);
                                    }

                                    function _addBlist() {
                                        _thd_auto_expand.interrupt();
                                        debugInfo("中断态列表自动展开线程");

                                        /* /今天|昨天/ */
                                        let _date_str = _getDateStr();
                                        debugInfo("捕获动态列表日期字串: " + _date_str);

                                        /* like: "03:19" */
                                        let _time_str = $$sel.pickup([_node_cvr, "p2c1"], "txt");
                                        debugInfo("捕获动态列表时间字串: " + _time_str);

                                        $$app.blist.add($$af.nick, _invalidTs(), "protect_cover");

                                        // tool function(s) //

                                        function _invalidTs() {
                                            let _offset = _date_str.match(/昨天/) ? 0 : 24;
                                            let _real_h = new Date().getHours() + _offset;
                                            let _new_d = new Date().setHours(_real_h);
                                            _date_str = new Date(_new_d).toDateString();

                                            // timestamp when protect cover is invalid
                                            return +new Date(_date_str + " " + _time_str);
                                        }

                                        function _getDateStr() {
                                            let _txt_cvr = $$sel.pickup(_node_cvr, "txt");
                                            let _date_str = "";
                                            let _children = _node_lst.children();
                                            for (let i = 0, l = _children.length; i < l; i += 1) {
                                                let _child = _children[i];
                                                if (!_child) {
                                                    // i wonder why this could happen
                                                    debugInfo("舍弃无效的布局子节点", 3);
                                                    continue;
                                                }
                                                if (!_child.childCount()) {
                                                    let _date_txt = $$sel.pickup(_child, "txt");
                                                    if (!_date_txt.match(/.天/)) {
                                                        break;
                                                    }
                                                    _date_str = _date_txt;
                                                } else {
                                                    let _txt_item = $$sel.pickup(
                                                        [_child, "c0c1"], "txt"
                                                    );
                                                    if (_txt_item === _txt_cvr) {
                                                        break;
                                                    }
                                                }
                                            }
                                            return _date_str;
                                        }
                                    }
                                }
                            }

                            function _collect() {
                                _ready();
                                _pick();
                                _help();
                                _db();

                                // tool function(s) //

                                function _ready() {
                                    _thd_info_collect.join();
                                }

                                function _pick() {
                                    if (_fri.trig_pick) {
                                        $$app.thd_pick = threads.starts(function () {
                                            debugInfo("已开启能量球收取线程");
                                            let _ripe = _fri.eballs.ripe;
                                            if (_ripe.length) {
                                                _clickAndCnt("pick", _ripe);
                                                return true;
                                            }
                                            $$flag.pick_off_duty = true;
                                            debugInfo("没有可收取的能量球");
                                        });
                                    } else {
                                        $$flag.pick_off_duty = true;
                                    }
                                }

                                function _help() {
                                    _ready() && _click() && _sixRev();

                                    if ($$app.thd_pick) {
                                        $$app.thd_pick.join();
                                        $$app.thd_pick = null;
                                    }

                                    // tool function(s) //

                                    function _ready() {
                                        if (_fri.trig_help) {
                                            debugInfo("帮收功能正在等待开始信号");
                                            if (waitForAction(() => $$flag.pick_off_duty, 2e3, 80)) {
                                                debugInfo("收取线程信号返回正常");
                                                return true;
                                            }
                                            messageAction("等待收取线程信号超时", 3, 0, 1);
                                        }
                                    }

                                    function _click() {
                                        let _orange = _fri.eballs.orange;
                                        if (_orange.length) {
                                            _clickAndCnt("help", _orange);
                                            return true;
                                        }
                                        debugInfo("没有可帮收的能量球");
                                    }

                                    function _sixRev() {
                                        if (_fri.eballs.length >= 6) {
                                            if (!$$cfg.six_balls_review_switch) {
                                                return debugInfo("六球复查未开启");
                                            }

                                            if ($$und($$flag.six_review)) {
                                                $$flag.six_review = 1;
                                            } else {
                                                $$flag.six_review += 1;
                                            }

                                            let _max = $$cfg.six_balls_review_max_continuous_times;
                                            if ($$flag.six_review > _max) {
                                                debugInfo(["清除六球复查标记", ">连续复查次数已达上限"]);
                                                delete $$flag.six_review;
                                            } else {
                                                debugInfo("设置六球复查标记: " + $$flag.six_review);
                                            }
                                        }
                                    }
                                }

                                function _clickAndCnt(act, data) {
                                    _item.avail_clicked = true;

                                    let _itv = $$cfg.balls_click_interval;
                                    let _par_p_t = {press_time: 80};
                                    let _config = {
                                        pick: {
                                            name: "收取",
                                            act: "收取",
                                            click() {
                                                debugInfo("点击成熟能量球: " + data.length + "个");
                                                data.forEach((o) => {
                                                    clickAction(o, "p", _par_p_t);
                                                    sleep(_itv);
                                                });
                                                $$flag.pick_off_duty = true;
                                            },
                                            pk_par: ["你收取TA", 10],
                                        },
                                        help: {
                                            name: "帮收",
                                            act: "助力",
                                            click() {
                                                data.forEach((o) => {
                                                    clickAction(o, "p", _par_p_t);
                                                    sleep(_itv);
                                                });
                                                debugInfo("点击帮收能量球: " + data.length + "个");
                                            },
                                            pk_par: ["你给TA助力", 10],
                                        },
                                    };

                                    let _cfg = _config[act];
                                    let _name = _cfg.name;

                                    let _ctr = threads.atomic(0);
                                    let _res = threads.atomic(-1);

                                    let _thds = {
                                        // P.K. stratergy has been abandoned
                                        // since May 31, 2020
                                        thd_func: [_thdFeed],
                                        thd_pool: [],
                                        start() {
                                            this.thd_func.forEach((thd) => {
                                                this.thd_pool.push(threads.start(thd));
                                            });
                                        },
                                        isAllDead() {
                                            let _len = this.thd_pool.length;
                                            for (let i = 0; i < _len; i += 1) {
                                                let _thd = this.thd_pool[i];
                                                if (_thd && _thd.isAlive()) {
                                                    return false;
                                                }
                                            }
                                            return true;
                                        },
                                        killAll() {
                                            this.thd_pool.forEach((thd) => {
                                                if (thd && thd.isAlive()) {
                                                    thd.interrupt();
                                                    sleep(200);
                                                }
                                            });
                                        },
                                        ready(o) {
                                            let _nm = o.nm;
                                            let _init = o.get();
                                            debugInfo("初始" + _nm + "数据: " + _init);

                                            _ctr.incrementAndGet();

                                            if (isNaN(_init)) {
                                                return debugInfo("初始" + _nm + "数据无效");
                                            }
                                            o.init = _init;

                                            let _fg = () => $$flag.pick_off_duty;
                                            if (waitForAction(_fg, 2e3, 50)) {
                                                return true;
                                            }
                                            debugInfo(_name + "操作未就绪");
                                        },
                                        stable(o) {
                                            let _nm = o.nm;
                                            let _init = o.init;
                                            let _stab;

                                            debugInfo("等待" + _nm + "数据稳定");

                                            _stab = $$app.tool.stabilizer(o.get, _init);

                                            if (isNaN(_stab)) {
                                                return debugInfo(_nm + "稳定数据无效");
                                            }
                                            o.stab = _stab;
                                            debugInfo(_nm + "数据已稳定: " + _stab);

                                            return true;
                                        }
                                    };

                                    _ready();
                                    _click();
                                    _stat();

                                    // tool function(s) //

                                    function _ready() {
                                        _thds.start();

                                        let _max = 60;
                                        while (1) {
                                            if (!_max-- || _thds.isAllDead()) {
                                                let _msg = "统计工具数据初始化失败";
                                                return messageAction(_msg, 3);
                                            }
                                            let _n = _ctr.get();
                                            let _len = _thds.thd_func.length;
                                            if (_n) {
                                                return _n === _len;
                                            }
                                            sleep(50);
                                        }
                                    }

                                    function _click() {
                                        _cfg.click();
                                    }

                                    function _stat() {
                                        $$flag.rl_valid_click = true;
                                        $$app.fri_drop_by.dc($$af.nick);

                                        let _cond = () => ~_res.get();
                                        waitForAction(_cond, 2.4e3, 80);
                                        _thds.killAll();

                                        let _act = _cfg.act;
                                        let _sum = _res.get();
                                        let _lv = +!!_sum;
                                        let _msg = _act + ": " + _sum + "g";
                                        let _is_pick = act === "pick";

                                        if (!~_sum) {
                                            let _msg = _act + ": 统计数据无效";
                                            return messageAct(_msg, 0, 0, 1);
                                        }
                                        if (_is_pick) {
                                            _collect.cnt_pick = _sum;
                                            $$af.emount_c_fri += _sum;
                                        } else {
                                            _collect.cnt_help = _sum;
                                        }
                                        messageAction(_msg, _lv, 0, 1);
                                    }

                                    // thread function(s) //

                                    function _thdFeed() {
                                        let _nm = _name + "动态列表";
                                        let _basic = {
                                            nm: _nm,
                                            init: NaN,
                                            get: () => _getFeedItemLen(act),
                                            stab: NaN,
                                        };
                                        let _init = NaN;
                                        let _stab = NaN;

                                        _ready() && _stable() && _stat();

                                        // tool function(s) //

                                        function _ready() {
                                            if (!waitForAction(() => $$sel.get("list"), 1.5e3, 50)) {
                                                _ctr.incrementAndGet();
                                                return debugInfo(_nm + "控件准备超时", 3);
                                            }
                                            if (_thds.ready(_basic)) {
                                                _init = _basic.init;
                                                return true;
                                            }
                                        }

                                        function _stable() {
                                            if (_thds.stable(_basic)) {
                                                _stab = _basic.stab;
                                                return true;
                                            }
                                        }

                                        function _stat() {
                                            let _num = 0;
                                            let _max = _stab - _init;
                                            let _lst = $$sel.get("list", "cache");

                                            for (let i = 1; i <= _max; i += 1) {
                                                let _c = "c" + i + "c0c1";
                                                let _s = $$sel.pickup([_lst, _c], "txt");
                                                let _mch = _s.match(/\d+/);
                                                _num += _mch ? +_mch[0] : 0;
                                            }

                                            _res.compareAndSet(-1, _num);
                                            debugInfo(_nm + "统计结果: " + _num);
                                        }

                                        function _getFeedItemLen(type) {
                                            let _node_lst = null;
                                            let _sel_lst = () => _node_lst = $$sel.get("list");

                                            if (!waitForAction(_sel_lst, 1.2e3, 100)) {
                                                return NaN;
                                            }

                                            let _sel_str = $$app.page.fri.in_page_rex_sel_str;
                                            let _str = (n, c) => $$sel.pickup([n, c], _sel_str);

                                            if (_str(_node_lst, "c0") !== "今天") {
                                                return 0;
                                            }
                                            return _getItemsLen();

                                            // tool function(s) //

                                            function _getRex() {
                                                let _pref = type === "help" ? "帮忙" : "";
                                                return new RegExp("^" + _pref + "收取\\d+g$");
                                            }

                                            function _getItemsLen() {
                                                let _i = 1;
                                                let _len = _node_lst.childCount();
                                                let _rex = _getRex();
                                                let _nick = $$app.user_nickname;

                                                for (; _i < _len; _i += 1) {
                                                    let _c = "c" + _i + "c0";
                                                    let _n = $$sel.pickup([_node_lst, _c]);
                                                    if (_n) {
                                                        if (_str(_n, "c0") !== _nick) {
                                                            break;
                                                        }
                                                        if (!_str(_n, "c1").match(_rex)) {
                                                            break;
                                                        }
                                                    }
                                                }

                                                return _i - 1;
                                            }
                                        }
                                    }
                                }

                                function _db() {
                                    let _c = _collect.cnt_pick || 0;
                                    let _h = _collect.cnt_help || 0;
                                    if (_c || _h) {
                                        let _n = $$af.nick || "%NULL%";
                                        let _t = $$app.ts_sec;
                                        $$app.db.insertInto([_n, _t, _c, _h]);
                                    }
                                }
                            }
                        }

                        function _back() {
                            $$app.page.rl.backTo();
                        }

                        function _coda() {
                            if (!_item.avail_clicked) {
                                messageAct("无能量球可操作", 1, 0, 1, 1);
                                delete _item.avail_clicked;
                            } else {
                                showSplitLine();
                            }

                            delete $$af.nick;
                            $$app.page.fri.pool.clear();
                            $$flag.six_review && _review();

                            // tool function(s) //

                            function _review() {
                                _enter();
                                _intro();
                                _check();
                                _back();
                            }
                        }
                    }
                }

                function _quit() {
                    if ($$flag.rl_bottom_rch) {
                        debugInfo("检测到排行榜停检信号");
                        return true;
                    }
                    if (!_lmt()) {
                        debugInfo("无目标滑动次数已达上限");
                        return true;
                    }
                }

                function _lmt(reset) {
                    if (!reset) {
                        return _max--;
                    }
                    _max = _max_b;
                }

                function _fin() {
                    _minCtdFriReady();

                    let _thrd = $$af.thrd_monit_own;
                    let _thrd_bg = $$af.thrd_bg_monit_own;
                    if (_thrd > _thrd_bg && _awake(_thrd)) {
                        return _reboot();
                    }
                    return debugInfo("好友能量检查完毕");

                    // tool function(s) //

                    // for timed task (self management)
                    function _minCtdFriReady() {
                        let _swA = $$cfg.timers_switch;
                        let _swB = $$cfg.timers_self_manage_switch;
                        let _swC = $$cfg.timers_countdown_check_friends_switch;
                        let _cond = _swA && _swB && _swC;

                        if (!_cond) {
                            $$af.min_ctd_fri = Infinity;
                        } else if ($$inf($$af.min_ctd_fri)) {
                            _fri._chkMinCtd("cache");
                        }
                    }
                }

                function _swipe() {
                    _swipeUp();
                    _chkCaptDiff();
                    _chkRlBottom();

                    // tool function(s) //

                    function _swipeUp() {
                        $$impeded("排行榜滑动流程");

                        let _et_scan = timeRecorder("rl_scan", "L") || 0;
                        let _itv = $$cfg.rank_list_swipe_interval.restrict(5, 800);
                        let _du = $$cfg.rank_list_swipe_time.restrict(100, 800);
                        let _dist = $$cfg.rank_list_swipe_distance;
                        if (_dist < 1) {
                            _dist = Math.trunc(_dist * H);
                        }

                        let _top = Math.trunc((uH - _dist) / 2);
                        if (_top <= 0) {
                            _autoAdjust();
                        }
                        let _btm = uH - _top;

                        _swipeOnce();

                        // tool function(s) //

                        function _autoAdjust() {
                            let _dist0 = Math.trunc(uH * 0.95);
                            let _top0 = Math.trunc((uH - _dist0) / 2);
                            let _af_cfg = $$sto.af_cfg.get("config", {});
                            let _data = {rank_list_swipe_distance: _dist0};
                            let _combined = Object.assign({}, _af_cfg, _data);

                            messageAction("滑动区域超限", 3);

                            _top = _top0;
                            messageAction("自动修正滑动距离参数:", 3);
                            messageAction("swipe_top: " + _top0, 3);

                            $$sto.af_cfg.put("config", _combined);
                            $$cfg.rank_list_swipe_distance = _dist0;
                            messageAction("自动修正配置文件数据:", 3);
                            messageAction("rank_list_swipe_distance: " + _dist0, 3);
                        }

                        function _swipeOnce() {
                            let _l = cX(0.75);
                            let _dt = cY(0.025);
                            if (
                                swipe(_l, _btm, _l, _btm + _dt, 50) &&
                                swipe(_l, _btm, _l, _top, _du)
                            ) {
                                // just to prevent screen from turning off
                                // maybe this is not a good idea
                                click(1e5, 1e5);
                            } else {
                                let _msg = "swipe()方法返回false值";
                                messageAction(_msg, 3, 0, 0, "both_dash");
                            }
                            sleep(Math.max(0, _itv - _et_scan));
                        }
                    }

                    function _chkCaptDiff() {
                        if (_diffTrig() || _forcChk()) {
                            _chkRlUnexp();
                        }

                        // tool function(s) //

                        function _diffTrig() {
                            let _pool = _rl.pool;
                            let _ctr = $$flag.rl_capt_pool_ctr || 0;
                            let _ctrTrig = () => _ctr && !(_ctr % 4);

                            _pool.add().filter().trim();

                            return !_diffLmtRch() && _ctrTrig();

                            // tool function(s) //

                            function _diffLmtRch() {
                                if (_pool.isDiff()) {
                                    delete $$flag.rl_capt_pool_ctr;
                                    return;
                                }

                                let _max = $$cfg.rank_list_capt_pool_diff_check_threshold;
                                let _sA = "排行榜截图样本池差异检测:";
                                let _sB1 = "检测未通过: (";
                                let _sB2 = ++_ctr + "/" + _max + ")";
                                debugInfo([_sA, _sB1 + _sB2]);

                                if (_ctr >= _max) {
                                    let _sA = "发送排行榜停检信号";
                                    let _sB = ">已达截图样本池差异检测阈值";
                                    debugInfo([_sA, _sB]);
                                    delete $$flag.rl_capt_pool_ctr;
                                    return $$flag.rl_bottom_rch = true;
                                }
                                $$flag.rl_capt_pool_ctr = _ctr;
                            }
                        }

                        function _forcChk() {
                            if ($$flag.rl_forc_chk) {
                                delete $$flag.rl_forc_chk;
                                return true;
                            }
                        }

                        function _chkRlUnexp() {
                            _chkLoading();
                            _chkBottom();
                            _chkDozing();

                            // tool function(s) //

                            function _chkLoading() {
                                let _sel = () => $$sel.pickup(/正在加载.*/);
                                if (!_sel()) {
                                    return;
                                }

                                let _max = 2; // 2 min
                                let _sA = '检测到"正在加载"按钮';
                                let _sB = "等待按钮消失 (最多" + _max + "分钟)";
                                debugInfo([_sA, _sB]);

                                let _cond = () => () => !_sel();
                                if (waitForAction(_cond, _max * 60e3)) {
                                    delete $$flag.rl_bottom_rch;
                                    let _sA = "排行榜停检信号撤销";
                                    let _sB = '>"正在加载"按钮已消失';
                                    debugInfo([_sA, _sB]);
                                } else {
                                    let _s = '等待"正在加载"按钮消失超时';
                                    debugInfo(_s, 3);
                                }
                            }

                            function _chkBottom() {
                                let _node = $$sel.get("rl_end_idt");
                                if (!_node) {
                                    return;
                                }

                                let _bd = _node.bounds();
                                let _l = _bd.left;
                                let _t = _bd.top;
                                let _w = _bd.width();
                                let _h = _bd.height();

                                if (_h <= 3) {
                                    return;
                                }

                                if (_rl.btm_h !== _h) {
                                    _rl.btm_h = _h;
                                    $$flag.rl_forc_chk = true;
                                    return;
                                }

                                let _sA = "发送排行榜停检信号";
                                let _sB = ">已匹配列表底部控件";
                                debugInfo([_sA, _sB]);
                                $$flag.rl_bottom_rch = true;

                                let _capt = images.capt();
                                let _par = [_capt, _l, _t, _w - 3, _h - 3];
                                let _clip = images.clip.apply({}, _par);
                                let _copy = images.copy(_clip);
                                let _path = $$app.page.rl.btm_tpl.path;

                                images.reclaim($$app.page.rl.btm_tpl.img);
                                $$app.page.rl.btm_tpl.img = _copy;
                                images.save(_copy, _path);

                                images.reclaim(_capt, _clip);
                                _capt = null;
                                _clip = null;

                                debugInfo("列表底部控件图片模板已更新");
                            }

                            function _chkDozing() {
                                let _sel = () => $$sel.pickup(/.*打瞌睡.*/);
                                if (!waitForAction(_sel, 2, 360)) {
                                    return;
                                }

                                let _node = $$sel.pickup("再试一次");
                                let _opt = {click_strategy: "w"};
                                waitForAndClickAction(_node, 12e3, 600, _opt);
                                delete $$flag.rl_bottom_rch;

                                let _sA = "排行榜停检信号撤销";
                                let _sB = '>检测到"服务器打瞌睡"页面';
                                return debugInfo([_sA, _sB]);
                            }
                        }
                    }

                    function _chkRlBottom() {
                        if (_btmTpl() || _invtBtn()) {
                            $$flag.rl_bottom_rch = true;
                        }

                        // tool function(s) //

                        function _btmTpl() {
                            let _tpl = $$app.page.rl.btm_tpl.img;
                            if (!_tpl) {
                                return;
                            }

                            let _h = _tpl.height;
                            let _min = cX(0.04);
                            let _max = cX(0.18);
                            let _hh = $$num(_min, "<=", _h, "<=", _max);

                            return _hh ? _match() : _clear();

                            // tool function(s) //

                            function _match() {
                                let _mch = images.findImage(
                                    _rl.capt_img, _tpl, {level: 1}
                                );
                                if (_mch) {
                                    let _sA = "列表底部条件满足";
                                    let _sB = ">已匹配列表底部控件图片模板";
                                    $$app.monitor.rl_bottom.interrupt();
                                    debugInfo([_sA, _sB]);
                                    return true;
                                }
                            }

                            function _clear() {
                                let _sA = "列表底部控件图片模板已清除";
                                let _sB = ">图片模板高度值异常: " + _h;
                                let _path = $$app.page.rl.btm_tpl.path;
                                files.remove(_path);
                                delete $$app.page.rl.btm_tpl.img;
                                debugInfo([_sA, _sB], 3);
                                $$app.monitor.rl_bottom.start();
                            }
                        }

                        function _invtBtn() {
                            let _col = "#30bf6c";
                            let _colors = _rl.invt_colors || _invtColors();
                            let _r = [cX(0.82), cY(0.62), cX(0.17), cY(0.37)];
                            let _opt = {region: _r, threshold: 10,};
                            let _par = [_rl.capt_img, _col, _colors, _opt];
                            let _mch = images.findMultiColors.apply({}, _par);

                            if (_mch) {
                                let _sA = "列表底部条件满足";
                                let _sB = ">指定区域匹配颜色成功";
                                let _sC = ">邀请按钮色值: " + _col;
                                debugInfo([_sA, _sB, _sC]);
                                return true;
                            }

                            // tool function(s) //

                            function _invtColors() {
                                return _rl.invt_colors = [
                                    // color matrix:
                                    //   c   c c c   w
                                    // [ *   2 _ 4   _ ] -- 0 (cX)
                                    // [ 0   _ 3 _   6 ] -- 45 (cX)
                                    // [ _   2 _ 4   6 ] -- 90 (cX)
                                    // c: color; w: white (-1)
                                    // 2: 18; 4: 36; 6: 54; ... (cY)
                                    [0, cYx(18), _col],
                                    [0, cYx(36), _col],
                                    [cX(45), 0, _col],
                                    [cX(45), cYx(27), _col],
                                    [cX(45), cYx(54), -1],
                                    [cX(90), cYx(18), _col],
                                    [cX(90), cYx(36), _col],
                                    [cX(90), cYx(54), -1],
                                ];
                            }
                        }
                    }
                }
            },
            review() {
                let _m_q = "放弃排行榜样本复查:"; // quit

                if (!$$cfg.timers_switch) {
                    return debugInfo([_m_q, "定时循环功能未开启"]);
                }
                if (!$$cfg.rank_list_review_switch) {
                    return debugInfo([_m_q, "排行榜样本复查功能未开启"]);
                }
                if ($$flag.rl_review_stop) {
                    return debugInfo([_m_q, "检测到复查停止信号"]);
                }

                let _trig = msg => {
                    let _msg = "触发排行榜样本复查条件:";
                    debugInfo([_msg, msg], "both");
                    return $$flag.rl_review = true;
                };

                if ($$cfg.rank_list_review_difference_switch) {
                    let _smp = this.rl_samples;
                    let _old_keys = _smp && Object.keys(_smp);
                    let _new_keys = Object.keys(this._getSmp());
                    if (!equalObjects(_old_keys, _new_keys)) {
                        return _trig("列表状态差异");
                    }
                }
                if ($$cfg.rank_list_review_samples_clicked_switch) {
                    if ($$flag.rl_valid_click) {
                        return _trig("样本点击记录");
                    }
                }
                if ($$cfg.rank_list_review_threshold_switch) {
                    if (this._chkMinCtd(/* cache_fg */
                        $$cfg.rank_list_review_difference_switch
                    )) {
                        return _trig("最小倒计时阈值");
                    }
                }
            },
            reboot() {
                return this.init().launch().collect();
            },
        },
    },
    _timers_setter: {
        trigger() {
            if (!$$cfg.timers_switch) {
                return debugInfo("定时循环功能未开启");
            }
            if (!$$cfg.timers_self_manage_switch) {
                return debugInfo("定时任务自动管理未开启");
            }
            return true;
        },
        autoTask() {
            let _ahd_own = $$cfg.timers_countdown_check_own_timed_task_ahead;
            let _ahd_fri = $$cfg.timers_countdown_check_friends_timed_task_ahead;
            let _min_own = ($$af.min_ctd_own || Infinity) - _ahd_own * 60e3;
            let _min_fri = ($$af.min_ctd_fri || Infinity) - _ahd_fri * 60e3;
            let _nxt_min_ctd = Math.min(_min_own, _min_fri);
            let _nxt_unintrp = _nxtUnintrp() || Infinity;

            let _type = _nxt_min_ctd > _nxt_unintrp
                ? {name: "uninterrupted", desc: "延时接力"}
                : {name: "min_countdown", desc: "最小倒计时"};
            let _next = Math.min(_nxt_min_ctd, _nxt_unintrp);

            if ($$fin(_next)) {
                // both _type and _next may be affected
                _chkAutoTaskSect();
                _setAutoTask();
            } else {
                debugInfo("无定时任务可设置");
            }

            // tool function(s) //

            function _nxtUnintrp() {
                return _trigger() && _getNxt();

                // tool function(s) //

                function _trigger() {
                    if (!$$cfg.timers_uninterrupted_check_switch) {
                        return debugInfo("延时接力机制未开启");
                    }
                    // eg: [{section: ["06:30", "00:00"], interval: 60}]
                    let _sto_sxn = $$cfg.timers_uninterrupted_check_sections;
                    if (!_sto_sxn || !_sto_sxn.length) {
                        return debugInfo("无延时接力区间数据");
                    }
                    return _nxtUnintrp.sto_sxn = _sto_sxn;
                }

                function _getNxt() {
                    let _nxt = [];
                    let _rec_now = $$app.now;
                    let _rec_ts = +_rec_now;
                    let _d_ms = 24 * 3.6e6;
                    let _d_str = _rec_now.toDateString() + " ";
                    let _sto_sxn = _nxtUnintrp.sto_sxn;

                    debugInfo("开始计算最小延时接力时间数据");

                    for (let i = 0, l = _sto_sxn.length; i < l; i += 1) {
                        let _sxn = _sto_sxn[i].section;
                        if (!_sxn || !_sxn.length) {
                            continue;
                        }

                        let _min_ts = Date.parse(_d_str + _sxn[0]);
                        let _max_ts = Date.parse(_d_str + _sxn[1]);
                        while (_max_ts <= _min_ts) {
                            _max_ts += _d_ms;
                        }

                        let _delay = _sto_sxn[i].interval * 60e3;
                        let _next_ts = _rec_ts + _delay;
                        if (_rec_ts < _min_ts) {
                            _next_ts = Math.max(_next_ts, _min_ts);
                        }
                        if (_next_ts > _max_ts) {
                            if (_rec_ts > _max_ts) {
                                _next_ts = _min_ts + _d_ms;
                            } else {
                                _next_ts = _max_ts;
                            }
                        }
                        _nxt.push(_next_ts);
                    }

                    let _res = _nxt.sort()[0];
                    debugInfo("时间数据: " + $$app.tool.timeStr(_res));
                    return _res;
                }
            }

            function _chkAutoTaskSect() {
                return _trigger() && _modifyNxt();

                // tool function(s) //

                function _trigger() {
                    let _sxn = $$cfg.timers_auto_task_sections;
                    if (_sxn && _sxn.length) {
                        return _chkAutoTaskSect.sto_sxn = _sxn;
                    }
                    debugInfo("未设置自动定时任务有效时段");
                }

                function _modifyNxt() {
                    let _sxn_info = [];
                    let _getSxnStr = (sxn) => {
                        let [_l, _r] = sxn;
                        _r += _r <= _l ? " (+1)" : "";
                        return "[ " + _l + " - " + _r + " ]";
                    };
                    let _isInRange = (checker) => {
                        let _len = checker.length;
                        for (let i = 0; i < _len; i += 1) {
                            let _chk = checker[i];
                            if ($$num(_chk[0], "<=", _next, "<=", _chk[1])) {
                                return true;
                            }
                        }
                    }
                    let _rec_now = $$app.now;
                    let _d_ms = 24 * 3.6e6;
                    let _d_str = _rec_now.toDateString() + " ";
                    let _today_min = Date.parse(_d_str);
                    let _today_max = _today_min + _d_ms;
                    let _sto_sxn = _chkAutoTaskSect.sto_sxn;

                    debugInfo("开始分析自动定时任务有效时段");

                    for (let i = 0, l = _sto_sxn.length; i < l; i += 1) {
                        let _sxn_checker = [];
                        let _sxn = _sto_sxn[i];
                        if (!_sxn || !_sxn.length) {
                            continue;
                        }

                        let _sxn_l = Date.parse(_d_str + _sxn[0]);
                        let _sxn_r = Date.parse(_d_str + _sxn[1]);

                        if (_sxn_r <= _sxn_l) {
                            _sxn_checker.push([_today_min, _sxn_r]);
                            _sxn_checker.push([_sxn_l, _today_max]);
                        } else {
                            _sxn_checker.push([_sxn_l, _sxn_r]);
                        }
                        if (_isInRange(_sxn_checker)) {
                            return debugInfo(["匹配到有效时段:", _getSxnStr(_sxn)]);
                        }

                        if (_sxn_l > _next) {
                            _sxn_info.push({left_ts: _sxn_l, sxn: _sxn});
                        } else {
                            _sxn_info.push({left_ts: _sxn_l + _d_ms, sxn: _sxn});
                        }
                    }

                    let _next_avail_range = _sxn_info.sort((a, b) => {
                        let _a = a.left_ts;
                        let _b = b.left_ts;
                        if (_a === _b) {
                            return 0;
                        }
                        return _a > _b ? 1 : -1;
                    })[0];
                    debugInfo("时间数据不在有效时段范围内");
                    $$app.next_avail_sxn_str = _getSxnStr(_next_avail_range.sxn);
                    _next = _next_avail_range.left_ts;
                }
            }

            function _setAutoTask() {
                timeRecorder("set_auto_task");
                let _sxn_str = $$app.next_avail_sxn_str;
                $$app.thd_set_auto_task = threads.starts(function () {
                    let _task = _update() || _add();
                    let _nxt_str = $$app.tool.timeStr(_next);
                    messageAction("任务ID: " + _task.id, 1, 0, 1);
                    messageAction("下次运行: " + _nxt_str, 1, 0, 1);
                    if (_sxn_str) {
                        messageAction("受制区间: " + _sxn_str, 1, 0, 1);
                    }
                    messageAction("任务类型: " + _type.desc, 1, 0, 1, 1);
                });

                // tool function(s) //

                function _update() {
                    let _sto_nxt = $$sto.af.get("next_auto_task", {});
                    let _sto_id = _sto_nxt.task_id;
                    if (!_sto_id) {
                        return;
                    }

                    let _sto_task = timers.getTimedTask(_sto_id);
                    if (!_sto_task) {
                        return;
                    }

                    return _updateTask();

                    // tool function(s) //

                    function _updateTask() {
                        debugInfo("开始更新自动定时任务");
                        _sto_task.setMillis(_next);
                        timers.updateTimedTask(_sto_task);

                        $$sto.af.put("next_auto_task", {
                            task_id: _sto_id,
                            timestamp: _next,
                            type: _type.name,
                        });

                        messageAction(_sxn_str
                            ? "已更新并顺延自动定时任务"
                            : "已更新自动定时任务", 1);
                        return _sto_task;
                    }
                }

                function _add() {
                    let _par = {path: $$app.cwp, date: _next};
                    let _task = timers.addDisposableTask(_par);

                    $$sto.af.put("next_auto_task", {
                        task_id: _task.id,
                        timestamp: _next,
                        type: _type.name,
                    });
                    messageAction(_sxn_str
                        ? "已添加并顺延自动定时任务"
                        : "已添加自动定时任务", 1);

                    return _task;
                }
            }
        },
    },
    _epilogue_setter: {
        logBackIFN: () => $$acc.logBack(),
        showRes() {
            return new Promise((reso) => {
                let _swA = $$cfg.message_showing_switch;
                let _swB = $$cfg.result_showing_switch;
                if (!(_swA && _swB)) {
                    return reso();
                }

                debugInfo("开始展示统计结果");

                let _e_own = $$af.emount_c_own;
                let _e_fri = $$af.emount_c_fri;
                debugInfo("自己能量收取值: " + _e_own);
                debugInfo("好友能量收取值: " + _e_fri);

                if ($$noNegNum(_e_own) && $$noNegNum(_e_fri)) {
                    let _msg = _eStr(_e_fri, _e_own);
                    return reso(_showMsg(_msg));
                }
                return reso(_showMsg("数据统计失败"));

                // tool function(s) //

                function _eStr() {
                    let _str = "";
                    let _pref_own = "Energy from yourself: ";
                    let _pref_fri = "Energy from friends: ";

                    if (_e_own) {
                        _str += _pref_own + _e_own + "g";
                    }
                    if (_e_fri) {
                        _str += _e_own ? "\n" : "";
                        _str += _pref_fri + _e_fri + "g";
                    }

                    return _str || "A fruitless attempt";
                }

                function _showMsg(msg) {
                    let _m_arr = msg.split("\n");
                    let _last = _m_arr.length - 1;
                    _m_arr.forEach((m, i) => {
                        messageAction(m, 1, 0, 0, +(i === _last));
                    });
                    if (msg.match(/失败/)) {
                        _e_own = -1;
                    }
                    if ($$cfg.floaty_result_switch) {
                        return _floatyResAsync();
                    }
                    toast(msg);
                    debugInfo("统计结果展示完毕");

                    // tool function(s) //

                    function _floatyResAsync() {
                        debugInfo("开始绘制Floaty");

                        $$flag.floaty_fin = 0;
                        $$flag.floaty_err = 1;
                        $$flag.floaty_usr_touch = false;

                        let _ctd = $$cfg.floaty_result_countdown;
                        let _tt = _ctd * 1e3;
                        debugInfo("时间参数: " + _tt);

                        let _cvr_win = floaty.rawWindow(
                            <frame id="cover" gravity="center" bg="#7f000000"/>
                        );
                        // prevent touch event from being
                        // transferred to the view beneath
                        _cvr_win.setTouchable(true);
                        _cvr_win.setSize(-1, -1);
                        _cvr_win["cover"].on("click", _onClick);
                        _cvr_win["cover"].setOnTouchListener(_onTouch);

                        let _h = _getHeights();
                        let _lyt = _getLayouts();

                        let _msg_win = floaty.rawWindow(_lyt.msg);

                        ui.run(() => {
                            let _sum = (_e_own + _e_fri).toString();
                            if (!~_e_own) _sum = "Statistics Failed";
                            _sum = _sum || "0";
                            _msg_win.text.setText(_sum);
                            _msg_win.setSize(-2, 0);

                            let _max = 5e3;
                            let _ts = $$app.ts;

                            // TODO seems not good enough
                            while ($$app.ts - _ts < _max) {
                                if (_msg_win.getWidth() > 0) {
                                    break;
                                }
                            }
                        });

                        let _hints = _getHints();
                        let _hint_len = _hints.length;

                        let _wA = _msg_win.getWidth();
                        let _wB = cX(0.54);
                        let _wC = cX(0.25) * _hint_len;
                        let _min_w = Math.max(_wA, _wB, _wC);
                        let _l_pos = (W - _min_w) / 2;

                        _msg_win.setPosition(_l_pos, _h.base);
                        _msg_win.setSize(_min_w, _h.msg);

                        let _hint_t_pos = _h.base - _h.col - _h.hint;
                        let _col_up_t_pos = _h.base - _h.col;
                        let _col_dn_t_pos = _h.base + _h.msg;
                        let _tt_t_pos = _h.base + _h.msg + _h.col;
                        let _avg_w = Math.trunc(_min_w / _hint_len);
                        let _col_o = {
                            "YOU": "#7dae17",
                            "FRI": "#2ba653",
                            "SOR": "#a3555e", // SORRY
                            "OTHER": "#907aa3",
                        };

                        for (let i = 0; i < _hint_len; i += 1) {
                            let _cur_hint = _hints[i];
                            let _col_value = _col_o[_cur_hint.slice(0, 3)];
                            if (!_col_value) _col_value = _col_o["OTHER"];
                            let _cur_hint_col = "#cc" + _col_value.slice(1);
                            let _stripe_bg = colors.parseColor(_cur_hint_col);
                            let _cur_l_pos = _l_pos + _avg_w * i;
                            let _cur_w = _min_w - (_hint_len - 1) * _avg_w;
                            if (i !== _hint_len - 1) _cur_w = _avg_w;

                            let _col_dn_win = floaty.rawWindow(_lyt.col);
                            _col_dn_win.setSize(1, 0);
                            _col_dn_win.text.setBackgroundColor(_stripe_bg);
                            _col_dn_win.setPosition(_cur_l_pos, _col_dn_t_pos);

                            let _col_up_win = floaty.rawWindow(_lyt.col);
                            _col_up_win.setSize(1, 0);
                            _col_up_win.text.setBackgroundColor(_stripe_bg);
                            _col_up_win.setPosition(_cur_l_pos, _col_up_t_pos);

                            let _hint_win = floaty.rawWindow(_lyt.hint);
                            _hint_win.setSize(1, 0);
                            _hint_win.text.setText(_cur_hint);
                            _hint_win.setPosition(_cur_l_pos, _hint_t_pos);

                            _col_dn_win.setSize(_cur_w, _h.col);
                            _col_up_win.setSize(_cur_w, _h.col);
                            _hint_win.setSize(_cur_w, _h.hint);
                        }

                        let _tt_win = floaty.rawWindow(_lyt.tt);
                        _tt_win.setSize(1, 0);
                        _tt_win.setPosition(_l_pos, _tt_t_pos);
                        _tt_win.setSize(_min_w, _h.tt);

                        _setFloTt(_ctd);

                        return new Promise((reso) => {
                            debugInfo(["Floaty绘制完毕", "开始Floaty倒计时"]);
                            timeRecorder("flo_tt");
                            setIntervalBySetTimeout(_setText, 200, _cond);

                            // tool function(s) //

                            function _setText() {
                                let _rmng_t = _tt - timeRecorder("flo_tt", "L");
                                let _rmng_ctd = Math.ceil(_rmng_t / 1e3);
                                if (_ctd > _rmng_ctd) {
                                    _ctd = _rmng_ctd;
                                    _setFloTt(Math.max(0, _ctd));
                                }
                            }

                            function _cond() {
                                if (_ctd <= 0 || $$flag.floaty_fin) {
                                    if ($$flag.floaty_err) {
                                        messageAction("此设备可能无法使用Floaty功能", 3, 1);
                                        messageAction("建议改用Toast方式显示收取结果", 3);
                                    }

                                    let _pref = $$flag.floaty_err ? "强制" : "";
                                    debugInfo(_pref + "关闭所有Floaty窗口");
                                    floaty.closeAll();

                                    if ($$flag.floaty_fin === 0) {
                                        $$flag.floaty_fin = 1;
                                        debugInfo(_pref + "发送Floaty消息结束等待信号");
                                    }

                                    debugInfo(["Floaty倒计时结束", "统计结果展示完毕"]);

                                    return reso() || true;
                                }
                            }
                        });

                        // tool function(s) //

                        function _getHints() {
                            let _res = [];

                            if (!~_e_own) {
                                _res.push("SORRY");
                            } else {
                                _e_own && _res.push("YOURSELF: " + _e_own);
                                _e_fri && _res.push("FRIENDS: " + _e_fri);
                            }

                            let _len = _res.length;
                            debugInfo("消息数量参数: " + _len);
                            if ($$2(_len)) {
                                // @returns %alias%.slice(0, 3) + ": \d+g"
                                _res.forEach((s, i, a) => {
                                    a[i] = s.replace(/(\w{3})\w+(?=:)/, "$1");
                                });
                            } else if ($$1(_len)) {
                                // @returns %alias% only
                                _res.forEach((s, i, a) => {
                                    a[i] = s.replace(/(\w+)(?=:).*/, "$1");
                                });
                            } else if (!_len) {
                                let _notes = ("NEVER.contains(SAY+DIE)%5cn" +
                                    "LIFE+!%3d%3d+ALL+ROSES%5cn" +
                                    "IMPOSSIBLE+%3d%3d%3d+undefined%5cn" +
                                    "GOD.FAIR()+%3d%3d%3d+true%5cn" +
                                    "%2f((%3f!GIVE+(UP%7cIN)).)%2b%2fi%5cn" +
                                    "WORKMAN+%3d+new+Work()%5cn" +
                                    "LUCK.length+%3d%3d%3d+Infinity%5cn" +
                                    "LLIST.next+%3d%3d%3d+LUCKY%5cn" +
                                    "BLESSING.discard(DISGUISE)%5cn" +
                                    "WATER.drink().drink()").split("%5cn");
                                let _len = _notes.length;
                                let _ran = Math.trunc(Math.rand(_len));
                                let _raw = _notes[_ran];
                                let _dec = decodeURIComponent(_raw);
                                let _hint = _dec.replace(/\+(?!\/)/g, " ");
                                debugInfo("随机挑选提示语");
                                _res = [_hint];
                            }

                            return _res;
                        }

                        function _getLayouts() {
                            return {
                                msg: <frame gravity="center">
                                    <text id="text" gravity="center" size="24"
                                          bg="#cc000000" color="#ccffffff" padding="10 2"
                                    />
                                </frame>,
                                tt: <frame gravity="center">
                                    <text id="text" gravity="center" size="14"
                                          bg="#cc000000" color="#ccffffff" text=""
                                    />
                                </frame>,
                                col: <frame gravity="center">
                                    <text id="text" gravity="center" size="24"
                                          bg="#ffffff" color="#ffffff" padding="10 2"
                                    />
                                </frame>,
                                hint: <frame gravity="center">
                                    <text id="text" gravity="center" size="14"
                                          bg="#cc000000" color="#ccffffff"
                                    />
                                </frame>,
                            };
                        }

                        function _getHeights() {
                            let _base_h = cY(2 / 3);
                            let _msg_h = cYx(80);
                            let _hint_h = _msg_h * 0.7;
                            return {
                                base: _base_h,
                                msg: _msg_h,
                                hint: _hint_h,
                                tt: _hint_h,
                                col: _msg_h * 0.2, // color stripe
                            };
                        }

                        function _setFloTt(ctd) {
                            ui.run(function () {
                                try {
                                    debugInfo("设置倒计时数据文本: " + ctd);
                                    _tt_win.text.setText(surroundWith(ctd, "(", ")"));
                                    delete $$flag.floaty_err;
                                } catch (e) {
                                    $$flag.floaty_fin || debugInfo(["Floaty倒计时文本设置单次失败:", e.message]);
                                }
                            });
                        }

                        // listener(s) //

                        function _onClick() {
                            if ($$flag.floaty_usr_touch) {
                                $$flag.floaty_fin = 1;
                                $$flag.floaty_err = 0;
                                let _sA = "触发遮罩层触摸事件";
                                let _sB = "提前结束Floaty结果展示";
                                let _sC = "发送Floaty消息结束等待信号";
                                debugInfo([_sA, _sB, _sC]);
                                floaty.closeAll();
                            } else {
                                let _sA = '模拟一次"深度返回"操作';
                                let _sB = ">检测到非用户点击行为";
                                debugInfo([_sA, _sB]);
                                keycode(4, {double: true});
                            }
                        }

                        function _onTouch(view, e) {
                            if (!$$flag.floaty_usr_touch) {
                                let _me = android.view.MotionEvent;
                                let _act = e.getAction();

                                if (_act === _me.ACTION_DOWN) {
                                    let _thrd = cYx(0.12);
                                    $$flag.floaty_usr_touch = e.getY() > _thrd;
                                }
                                if (_act === _me.ACTION_MOVE) {
                                    $$flag.floaty_usr_touch = true;
                                }
                                if (_act === _me.ACTION_UP) {
                                    let _e_t = e.getEventTime();
                                    let _dn_t = e.getDownTime();
                                    $$flag.floaty_usr_touch = _e_t - _dn_t > 200;
                                }
                            }
                            // event will not be consumed
                            // instead of being involved by onClickListener
                            return false;
                        }
                    }
                }
            });
        },
        readyExit() {
            $$af.cleaner.imgWrapper();
            $$app.blist.save();
            $$app.page.rl.pool.clean();
            $$app.monitor.insurance.interrupt().reset();
            $$app.page.closeIntelligently();
            $$app.page.autojs.spring_board.remove();
            $$flag.glob_e_scr_privilege = true;

            return Promise.resolve()
                .then(_floatyReady)
                .then(_autoTaskReady)
                .catch(this.err);

            // tool function(s) //

            function _floatyReady() {
                return new Promise((reso) => {
                    if ($$1($$flag.floaty_fin)) {
                        return reso();
                    }

                    timeRecorder("flo_msg");
                    debugInfo("等待Floaty消息结束等待信号");
                    setIntervalBySetTimeout(_reso, 200, _cond);

                    // tool function(s) //

                    function _cond() {
                        if ($$1($$flag.floaty_fin)) {
                            return reso() || true;
                        }
                    }

                    function _reso() {
                        let _ctd = $$cfg.floaty_result_countdown;
                        let _max = (+_ctd + 3) * 1e3;
                        if (timeRecorder("flo_msg", "L") > _max) {
                            let _sA = "放弃等待Floaty消息结束信号";
                            let _sB = ">等待结束信号超时";
                            $$flag.floaty_fin = 1;
                            debugInfo([_sA, _sB], 3);
                            reso();
                        }
                    }
                });
            }

            function _autoTaskReady() {
                return new Promise((reso) => {
                    let _thd = $$app.thd_set_auto_task;
                    if (_cond()) {
                        return reso();
                    }

                    debugInfo("等待定时任务设置完成");
                    setIntervalBySetTimeout(_reso, 200, _cond);

                    // tool function(s) //

                    function _cond() {
                        return !_thd || !_thd.isAlive();
                    }

                    function _reso() {
                        let _max = 10e3;
                        if (timeRecorder("set_auto_task", "L") > _max) {
                            messageAction("放弃等待定时任务设置完成", 4);
                            messageAction("等待超时", 4, 0, 1);
                            _thd.interrupt();
                            reso();
                        }
                    }
                });
            }
        },
        scrOffIFN() {
            if ($$app.init_scr_on) {
                return debugInfo("无需关闭屏幕");
            }

            $$flag.glob_e_scr_paused = true;
            debugInfo("尝试关闭屏幕");

            try {
                if (_scrOffByKeyCode()) {
                    debugInfo("关闭屏幕成功");
                    return true;
                }
            } catch (e) {
                messageAction(e.message, 4, 1, 0, "both");
            }

            let _err = e => messageAction(e.message, 4, 0, 1, 1);
            let _res = res => (res
                    ? debugInfo("关闭屏幕成功")
                    : debugInfo("关闭屏幕失败", 3)
            );

            return Promise.resolve()
                .then(_scrOffBySetAsync)
                .catch(_err).then(_res);

            // tool function(s) //

            function _scrOffByKeyCode() {
                debugInfo("尝试策略: 模拟电源按键");

                if (_bugModel()) {
                    return false;
                }

                timeRecorder("scr_off_tt");
                let _code = "26";
                if (keycode(_code, {no_err_msg: true})) {
                    let _et = timeRecorder("scr_off_tt", "L", "auto");
                    debugInfo("策略执行成功");
                    debugInfo("用时: " + _et);
                    return true;
                }
                let _sA = "策略执行失败";
                let _sB = ">按键模拟失败";
                let _sC = ">键值: " + _code;
                debugInfo([_sA, _sB, _sC]);

                // tool function(s) //

                function _bugModel() {
                    // poor guy, don't cry... [:sweat_smile:]
                    let _bug = [/[Mm]eizu/];
                    let _brand = $$dev.brand;
                    let _len = _bug.length;
                    for (let i = 0; i < _len; i += 1) {
                        if (_brand.match(_bug[i])) {
                            let _sA = "策略执行失败";
                            let _sB = ">设备型号不支持KeyCode方法";
                            let _sC = ">设备型号: " + _brand;
                            debugInfo([_sA, _sB, _sC]);
                            return true;
                        }
                    }
                }
            }

            // by modifying android settings provider
            function _scrOffBySetAsync() {
                let _sto = storages.create("scr_off_by_set");
                let {System, Global, Secure} = android.provider.Settings;
                let _scr_off_tt = System.SCREEN_OFF_TIMEOUT;
                let _dev_set_enabl = Secure.DEVELOPMENT_SETTINGS_ENABLED;
                let _stay_on_plug = Global.STAY_ON_WHILE_PLUGGED_IN;
                let _ctx_reso = context.getContentResolver();
                let _tt_k = "SCREEN_OFF_TIMEOUT";
                let _stay_on_k = "STAY_ON_WHILE_PLUGGED_IN";
                let _setScrOffTt = (t) => {
                    let _t = t || 0;
                    debugInfo(_tt_k + ": " + _t);
                    System.putInt(_ctx_reso, _scr_off_tt, _t);
                };
                let _setStayOnStat = (stat) => {
                    let _stat = stat || 0;
                    debugInfo(_stay_on_k + ": " + _stat);
                    Global.putInt(_ctx_reso, _stay_on_plug, _stat);
                };
                let _res = false;

                debugInfo("尝试策略: 修改屏幕超时参数");

                if (!System.canWrite(context)) {
                    let _nm = "Auto.js_Write_Settings_Permission_Helper";
                    let _path = files.path("./Tools/" + _nm + ".js");
                    let _msg = '需要"修改系统设置"权限';
                    messageAction("策略执行失败", 3, 0, 0, -1);
                    messageAction(_msg, 3, 0, 1);
                    messageAction("可使用以下工具获得帮助支持", 3, 0, 1);
                    messageAction(_path, 3, 0, 1, 1);
                    toast("关闭屏幕失败\n" + _msg, "Long");
                    return false;
                }

                return Promise.resolve()
                    .then(() => _setScrOffPar())
                    .then(() => _monScrStatAsync())
                    .then(() => _restoreScrPar())
                    .catch(e => messageAction(e, 4));

                // tool function(s) //

                function _setScrOffPar(time) {
                    timeRecorder("set_provider");
                    _toastProcess();
                    _setPar();
                    _setIntrpLsners();

                    // tool function(s) //

                    function _setPar() {
                        let _cur_tt = System.getInt(_ctx_reso, _scr_off_tt, 0);
                        _sto.remove(_tt_k);
                        _sto.put(_tt_k, _cur_tt);
                        _setScrOffTt(time);

                        let _cur_dev_enabl = Secure.getInt(_ctx_reso, _dev_set_enabl, 0);
                        let _cur_stay_on = Global.getInt(_ctx_reso, _stay_on_plug, 0);
                        let _aim_stay_on = 0;
                        _sto.remove(_stay_on_k);
                        if (_cur_dev_enabl && _cur_stay_on && _cur_stay_on !== _aim_stay_on) {
                            _sto.put(_stay_on_k, _cur_stay_on);
                            _setStayOnStat(_aim_stay_on);
                        }
                    }

                    function _toastProcess() {
                        toast(
                            "正在尝试关闭屏幕...\n" +
                            "请勿操作屏幕或按键...\n" +
                            "此过程可能需要数十秒...", "Long"
                        );
                    }

                    function _setIntrpLsners() {
                        !function _scrTouch() {
                            let _cvr_win = floaty.rawWindow(
                                <frame id="cover" gravity="center"/>
                            );
                            // prevent touch event from being
                            // transferred to the view beneath
                            _cvr_win.setTouchable(true);
                            _cvr_win.setSize(-1, -1);
                            _cvr_win["cover"].setOnTouchListener(function () {
                                $$flag.scr_off_intrp_by_usr = true;

                                let _s = ["中止屏幕关闭", "检测到屏幕触碰"];
                                toast(_s.join("\n"), "Long", "Force");
                                debugInfo("__split_line__");
                                debugInfo(_s);
                                debugInfo("__split_line__");

                                _cvr_win.close();
                                return false;
                            });
                        }();

                        !function _keyPress() {
                            events.observeKey();
                            events.on("key_down", function (key_code) {
                                $$flag.scr_off_intrp_by_usr = true;

                                let _s = [
                                    "中止屏幕关闭",
                                    "检测到按键行为",
                                    "键值: " + key_code
                                ];
                                toast(_s.join("\n"), "Long", "Force");
                                debugInfo("__split_line__");
                                debugInfo(_s);
                                debugInfo("__split_line__");
                            });
                        }();
                    }
                }

                function _restoreScrPar() {
                    debugInfo("恢复修改前的设置参数:");

                    let _tt = _sto.get(_tt_k, 60e3);
                    _setScrOffTt(_tt);

                    let _stay_on = _sto.get(_stay_on_k);
                    if (!$$und(_stay_on)) {
                        _setStayOnStat(_stay_on);
                    }

                    storages.remove("scr_off_by_set");

                    return _res;
                }

                function _monScrStatAsync() {
                    return new Promise((reso) => {
                        let _reso = () => _setReso(reso);
                        let _cond = () => _condition(reso);
                        setIntervalBySetTimeout(_reso, 200, _cond);
                    });

                    // tool function(s) //

                    function _tmo() {
                        let _ts = timeRecorder("set_provider", "L");
                        return _ts > 40e3;
                    }

                    function _usrIntrp() {
                        return $$flag.scr_off_intrp_by_usr;
                    }

                    function _setReso(reso) {
                        if (_tmo()) {
                            let _nm = "Auto.js_Write_Settings_Permission_Helper";
                            let _path = files.path("./Tools/" + _nm + ".js");
                            let _sA = "策略执行失败";
                            let _sB = ">等待屏幕关闭时间已达阈值";
                            let _sC = ">有关此策略更多详细信息";
                            let _sD = ">可使用并参阅以下工具:";
                            let _sE = ">" + _path;
                            debugInfo([_sA, _sB, _sC, _sD, _sE]);
                            reso(false);
                        }
                        if (_usrIntrp()) {
                            reso(false);
                        }
                    }

                    function _condition(reso) {
                        if (!$$dev.isScreenOn()) {
                            let _et = timeRecorder("set_provider", "L", "auto");
                            debugInfo("策略执行成功");
                            debugInfo("用时: " + _et);
                            reso(_res = true);
                            return true;
                        }
                        return _tmo() || _usrIntrp();
                    }
                }
            }
        },
        exitNow: () => $$app.exit(),
        err: e => messageAction(e, 4, 1, 0, -1),
    },
    link() {
        let _c = this._collector;
        _c.parent = this;
        _c.own.parent = _c.fri.parent = _c;
        delete this.link;
        return this;
    },
    launch() {
        this._launcher.greet().assign().home().ready();
        return $$af;
    },
    collect() {
        let {own, fri} = this._collector;
        own.trigger() && own.init().collect();
        fri.trigger() && fri.init().launch().collect();
        return $$af;
    },
    timers() {
        let t = this._timers_setter;
        t.trigger() && t.autoTask();
        return $$af;
    },
    epilogue() {
        let _ = this._epilogue_setter;
        _.logBackIFN();
        Promise.all([_.showRes(), _.readyExit()])
            .then(_.scrOffIFN)
            .then(_.exitNow)
            .catch(_.err);
    },
};

// entrance //
$$init.check().global().queue().delay().prompt().monitor().unlock().command();

$$af.link().launch().collect().timers().epilogue();

/**
 * @appendix Code abbreviation dictionary
 * May be helpful for code readers and developers
 * Not all items showed up in this project
 * @abbr a11y: accessibility | acc: account | accu: accumulated | act: action; activity | add: additional | af: ant forest | agn: again | ahd: ahead | amt: amount | anm: animation | app: application | arci: archive(d) | args: arguments | argv: argument values | asg: assign | asgmt: assignment | async: asynchronous | avail: available | avt: avatar | b: bottom; bounds; backup; bomb | bak: backup | bd: bound(s) | blist: blacklist | blt: bilateral | bnd: bound(s) | btm: bottom | btn: button | buf: buffer | c: compass; coordination(s) | cf: comparision (latin: conferatur) | cfg: configuration | cfm: confirm | chk: check | cln: clean | clp: clip | cmd: command | cnsl: console | cnt: content; count | cntr: container | col: color | compr: compress(ed) | cond: condition | constr: constructor | coord: coordination(s) | ctd: countdown | ctr: counter | ctx: context | cur: current | cvr: cover | cwd: current working directory | cwp: current working path | cxn: connection | d: dialog | dat: data | dbg: debug | dc: decrease | dec: decode; decrypt | def: default | del: delete; deletion | desc: description | dev: device; development | diag: dialog | dic: dictionary | diff: difference | dis: dismiss | disp: display | dist: distance; disturb; disturbance | dn: down | dnt: donation | drctn: direction | ds: data source | du: duration | dupe: duplicate; duplicated; duplication | dys: dysfunctional | e: error; engine; event | eball(s): energy ball(s) | egy: energy | ele: element | emount: energy amount | enabl: enable; enabled | enc: encode; encrypt | ens: ensure | ent: entrance | eq: equal | eql: equal | et: elapsed time | evt: event | exc: exception | excl: exclusive | excpt: exception | exec: execution | exp: expected | ext: extension | fg: foreground; flag | flg: flag | flo: floaty | fltr: filter | forc: force; forcible; forcibly | frac: fraction | fri: friend | frst: forest | fs: functions | fst: forest | gdball(s): golden ball(s) | glob: global | grn: green | gt: greater than | h: height; head(s) | his: history | horiz: horizontal | i: intent; increment | ic: increase | ident: identification | idt: identification | idx: index | ifn: if needed | inf: information | info: information | inp: input | ins: insurance | inst: instant | intrp: interrupt | invt: invitation | ipt: input | itball(s): initialized ball(s) | itp: interpolate | itv: interval | js: javascript | k: key | kg: keyguard | kw: keyword | l: left | lbl: label | lch: launch | len: length | lmt: limit | ln: line | ls: list | lsn(er(s)): listen; listener(s) | lv: level | lyr: layer | lyt: layout | man: manual(ly) | mch: matched | mod: module | mon: monitor | monit: monitor | msg: message | mthd: method | mv: move | n: name; nickname | nball(s): normal ball(s) | nec: necessary | neg: negative | neu: neutral | nm: name | nod: node | num: number | nxt: next | o: object | oball(s): orange ball(s) | opr: operation | opt: option; optional | or: orientation | org: orange | oth: other | ovl: overlap | p: press; parent | par: parameter | param: parameter | pat: pattern | pg: page | pkg: package | pos: position | pref: prefix | prog: progress | prv: privilege | ps: preset | pwr: power | q: queue | qte: quote | que: queue | r: right; region | ran: random | rch: reach; reached | rec: record; recorded; rectangle | rect: rectangle | relbl: reliable | req: require; request | res: result; restore | reso: resolve; resolver | resp: response | ret: return | rev: review | rl: rank list | rls: release | rm: remove | rmng: remaining | rsn: reason | rst: reset | s: second(s); stack | sav: save | sc: script | scr: screen | sec: second | sect: section | sel: selector; select(ed) | sels: selectors | set: settings | sep: separator | sgl: single | sgn: signal | simpl: simplify | smp: sample | spl: special | src: source | stab: stable | stat: statistics | stg: strategy | sto: storage | str: string | succ: success; successful | suff: suffix | svc: service | svr: server | sw: switch | swp: swipe | sxn: section(s) | sym: symbol | sz: size | t: top; time | tar: target | thd(s): thread(s) | thrd: threshold | tmo: timeout | tmp: temporary | tpl: template | treas: treasury; treasuries | trig: trigger; triggered | ts: timestamp | tt: title; timeout | tv: text view | txt: text | u: unit | uncompr: uncompress(ed) | unexp: unexpected | unintrp: uninterrupted | unlk: unlock: unlocked | usr: user | util: utility | v: value | val: value | vert: vertical | w: widget | wball(s): water ball(s) | win: window
 */