/**
 * @description alipay ant forest intelligent collection script
 *
 * @since Jan 29, 2020
 * @version 1.9.13
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 *
 * @see {@link https://github.com/SuperMonster003/Ant_Forest}
 */

let {
    $$sel, $$app, $$cfg, $$sto, $$dev, $$flag, $$acc,
    images, device, auto, selector, context, dialogs,
    floaty, colors, toast, files, idMatches, engines,
    events, timers, swipe, sleep, exit, app, threads,
    ui, android, className, currentPackage, storages,
    id, setText, click,
} = global;

let $$init = {
    check: function () {
        checkAlipayPackage();
        checkAccessibility();
        checkModulesMap();
        checkSdkAndAJVer();

        // `return this;` wasn't adopted here
        // considering the location of codes with
        // a chaining source jump for IDE like WebStorm
        return $$init;

        // tool function(s) //

        function checkAlipayPackage() {
            $$app = $$app || {};
            let _pkg = "com.eg.android.AlipayGphone";
            if (!app.getAppName(_pkg)) {
                messageAction('此设备可能未安装"支付宝"应用', 9, 1, 0, "both");
            }
            return $$app.pkg_name = _pkg;
        }

        function checkAccessibility() {
            let [line, msg] = [showSplitLineRaw, messageActionRaw];
            let _max = 3;
            while (!swipe(10000, 0, 10000, 0, 1) && _max--) {
                sleep(300);
            }
            if (_max < 0) {
                line();
                void (
                    "脚本无法继续|无障碍服务状态异常|或基于服务的方法无法使用" +
                    "|- - - - - - - - - - - - - - - - -|" +
                    "可尝试以下解决方案:" +
                    "|- - - - - - - - - - - - - - - - -|" +
                    'a. 卸载并重新安装"Auto.js"|b. 安装后重启设备|' +
                    'c. 运行"Auto.js"并拉出侧边栏|d. 开启无障碍服务|' +
                    "e. 再次尝试运行本项目"
                ).split("|").forEach(s => msg(s, 4));
                line();
                toast("无障碍服务方法无法使用");
                exit();
            }
        }

        function checkModulesMap() {
            let _map = [
                "MODULE_MONSTER_FUNC", "MODULE_STORAGE",
                "MODULE_DEFAULT_CONFIG", "MODULE_PWMAP",
                "MODULE_TREASURY_VAULT", "MODULE_UNLOCK",
                "EXT_DIALOGS", "EXT_TIMERS", "EXT_DEVICE",
                "EXT_APP", "EXT_IMAGES",
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
                toast("模块缺失或路径错误");
                exit();
            }
        }

        function checkSdkAndAJVer() {
            // do not `require()` before `checkModulesMap()`
            let _mod = require("./Modules/MODULE_MONSTER_FUNC");
            return _mod.checkSdkAndAJVer();
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
    global: function () {
        setGlobalFunctions(); // MONSTER MODULE
        setGlobalExtensions(); // EXT MODULES
        setGlobalDollarVars(); // `$$xxx`
        getDisplayParams({global_assign: true});

        // waitFor: script will continue running rather than stop
        // when accessibility service switched on by user
        $$func(auto.waitFor) ? auto.waitFor() : auto();

        Object.assign($$dev, require("./Modules/MODULE_UNLOCK"));

        let _mod_sto = require("./Modules/MODULE_STORAGE");
        $$sto.af = _mod_sto.create("af");
        $$sto.af_cfg = _mod_sto.create("af_cfg");
        $$sto.treas = require("./Modules/MODULE_TREASURY_VAULT");

        $$sel = getSelector();

        let _default_af = require("./Modules/MODULE_DEFAULT_CONFIG").af || {};
        Object.assign($$cfg, _default_af, $$sto.af_cfg.get("config", {}));

        let _cnsl_detail = $$cfg.console_log_details;
        let _dbg_info_sw = $$cfg.debug_info_switch;
        let _msg_show_sw = $$cfg.message_showing_switch;
        $$flag.msg_details = _cnsl_detail || _dbg_info_sw;
        $$flag.debug_info_avail = _dbg_info_sw && _msg_show_sw;
        $$flag.no_msg_act_flag = !_msg_show_sw;

        appSetter().setEngine().setTask().setParams().setBlist().setTools().init();

        accSetter().setParams().setMain();

        debugInfo("开发者测试日志已启用", "both_dash_Up");
        debugInfo("Auto.js版本: " + $$app.autojs_ver);
        debugInfo("项目版本: " + $$app.project_ver);
        debugInfo("安卓系统SDK版本: " + $$app.sdk_ver);

        return $$init;

        // tool function(s) //

        function setGlobalFunctions() {
            // any better ideas ?

            let {
                getDisplayParams, classof, setIntervalBySetTimeout, keycode,
                equalObjects, getSelector, waitForAndClickAction, runJsFile,
                debugInfo, killThisApp, vibrateDevice, clickActionsPipeline,
                clickAction, phoneCallingState, swipeAndShow, showSplitLine,
                waitForAction, baiduOcr, launchThisApp, observeToastMessage,
                messageAction, timeRecorder, surroundWith,
            } = require("./Modules/MODULE_MONSTER_FUNC");

            Object.assign(global, {
                baiduOcr: baiduOcr,
                classof: classof,
                clickAction: clickAction,
                clickActionsPipeline: clickActionsPipeline,
                debugInfo: debugInfo,
                equalObjects: equalObjects,
                getDisplayParams: getDisplayParams,
                getSelector: getSelector,
                keycode: keycode,
                killThisApp: killThisApp,
                launchThisApp: launchThisApp,
                messageAction: messageAction,
                messageAct: function () {
                    return $$flag.msg_details
                        ? messageAction.apply({}, Object.values(arguments))
                        : (m, lv) => ![3, 4].includes(lv);
                },
                observeToastMessage: observeToastMessage,
                phoneCallingState: phoneCallingState,
                runJsFile: runJsFile,
                setIntervalBySetTimeout: setIntervalBySetTimeout,
                showSplitLine: showSplitLine,
                surroundWith: surroundWith,
                swipeAndShow: swipeAndShow,
                timeRecorder: timeRecorder,
                vibrateDevice: vibrateDevice,
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
        }

        function setGlobalDollarVars() {
            // do not `$$a = $$b = $$c = {};`
            // they shouldn't be assigned
            // the same address pointer
            $$sel = $$sel || {};
            $$app = $$app || {};
            $$cfg = $$cfg || {};
            $$sto = $$sto || {};
            $$dev = $$dev || {};
            $$flag = $$flag || {};
            $$acc = $$acc || {};
        }

        function appSetter() {
            let _setter = {
                setEngine: function () {
                    let _my_engine = engines.myEngine();
                    let _my_engine_argv = _my_engine.execArgv || {};
                    let _getCwp = (e) => {
                        let _cwp = e.source.toString();
                        let _defPath = () => e.cwd() + "/Ant_Forest_Launcher.js";
                        return _cwp.match(/\[remote]/) ? _defPath() : _cwp;
                    };

                    void Object.defineProperties($$app, {
                        cur_pkg: {get: () => currentPackage()},
                        now: {get: () => new Date()},
                        ts: {get: () => +new Date()},
                    });
                    void Object.assign($$app, {
                        my_engine: _my_engine,
                        my_engine_id: _my_engine.id,
                        my_engine_argv: _my_engine_argv,
                        cwd: _my_engine.cwd(), // `files.cwd()` also fine
                        init_scr_on: _my_engine_argv.init_scr_on || $$dev.is_screen_on,
                        init_fg_pkg: _my_engine_argv.init_fg_pkg || currentPackage(),
                        cwp: _getCwp(_my_engine),
                        exit: function () {
                            let _s = $$app.task_name + "任务结束";
                            messageAction(_s, 1, 0, 0, "both_n");
                            return ui.post(exit);
                        },
                    });

                    return _setter;
                },
                setTask: function () {
                    $$app.setPostponedTask = (du, if_toast) => {
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

                            let _ts = $$app.ts + du * 60000;
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
                    };

                    return _setter;
                },
                setParams: function () {
                    // _unESC says, like me if you also enjoy unicode games :)
                    let _unESC = s => unescape(s.replace(/(\w{4})/g, "%u$1"));
                    let _local_pics_path = files.getSdcardPath() + "/.local/Pics/";

                    void files.createWithDirs(_local_pics_path);
                    void Object.assign($$app, {
                        task_name: surroundWith(_unESC("8682868168EE6797")),
                        rl_title: _unESC("2615FE0F0020597D53CB6392884C699C"),
                        local_pics_path: _local_pics_path,
                        rex_energy_amt: /^\s*\d+(\.\d+)?(k?g|t)\s*$/,
                    });
                    void Object.assign($$app, {
                        intent: {
                            home: {
                                action: "VIEW",
                                data: encURIPar("alipays://platformapi/startapp", {
                                    saId: 20000067,
                                    url: "https://60000002.h5app.alipay.com/www/home.html",
                                    __webview_options__: {
                                        startMultApp: "YES",
                                        appClearTop: "YES",
                                        enableCubeView: "NO",
                                        enableScrollBar: "NO",
                                        backgroundColor: "-1",
                                    },
                                }),
                                // data: encURIPar("alipays://platformapi/startapp", {
                                //     appId: 60000002,
                                //     startMultApp: "YES",
                                //     ...
                                // }),
                            },
                            rl: {
                                action: "VIEW",
                                data: encURIPar("alipays://platformapi/startapp", {
                                    saId: 20000067,
                                    url: "https://60000002.h5app.alipay.com/www/listRank.html",
                                    __webview_options__: {
                                        appClearTop: "YES",
                                        startMultApp: "YES",
                                        showOptionMenu: "YES",
                                        gestureBack: "YES",
                                        backBehavior: "back",
                                        enableCubeView: "NO",
                                        enableScrollBar: "NO",
                                        backgroundColor: "-1",
                                        defaultTitle: $$app.rl_title,
                                        transparentTitle: "none",
                                    },
                                }),
                            },
                            acc_man: {
                                action: "VIEW",
                                className: "com.alipay.mobile" +
                                    ".security.accountmanager" +
                                    ".ui.AccountManagerActivity_",
                                packageName: $$app.pkg_name,
                            },
                            acc_login: {
                                action: "VIEW",
                                className: "com.alipay.mobile.security.login" +
                                    ".ui.RecommandAlipayUserLoginActivity",
                                packageName: "com.eg.android.AlipayGphone",
                            },
                        },
                        fri_drop_by: {
                            _pool: [],
                            _max: 5,
                            ic: function (name) {
                                let _ctr = this._pool[name] || 0;
                                if (_ctr === this._max) {
                                    debugInfo("发送排行榜复查停止信号");
                                    debugInfo(">已达连续好友访问最大阈值");
                                    $$flag.rl_review_stop = true;
                                }
                                this._pool[name] = ++_ctr;
                            },
                            dc: function (name) {
                                let _ctr = this._pool[name] || 0;
                                this._pool[name] = _ctr > 1 ? --_ctr : 0;
                            },
                        },
                    });
                    void addSelectors();

                    return _setter;

                    // tool function(s) //

                    function addSelectors() {
                        let _acc_logged_out = new RegExp(".*(" +
                            /在其他设备登录|logged +in +on +another/.source + "|" +
                            /.*账号于.*通过.*登录.*|account +logged +on +to/.source +
                            ").*");
                        let _login_err_msg = (type) => {
                            type = type || "txt";

                            return $$sel.pickup(id("com.alipay.mobile.antui:id/message"), type)
                                || $$sel.pickup([$$sel.get("login_err_ensure"), "p2c0c0c0"], type);
                        };

                        $$sel.add("af", "蚂蚁森林")
                            .add("alipay_home", [/首页|Homepage/, {boundsInside: [0, cY(0.7), W, H]}])
                            .add("af_title", [/蚂蚁森林|Ant Forest/, {boundsInside: [0, 0, cX(0.4), cY(0.2)]}])
                            .add("af_home", /合种|背包|通知|攻略|任务|.*大树养成.*/)
                            .add("rl_title", $$app.rl_title)
                            .add("rl_ent", /查看更多好友|View more friends/) // rank list entrance
                            .add("rl_end_idt", /.*没有更多.*/) // TODO to replace
                            .add("list", className("ListView"))
                            .add("fri_frst_tt", /.+的蚂蚁森林/)
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

                    function encURIPar(pref, par) {
                        let _par = par || {};
                        let _sep = pref.match(/\?/) ? "&" : "?";

                        let _parseObj = (o) => {
                            let _res = [];
                            Object.keys(o).forEach((key) => {
                                let _val = o[key];
                                _val = $$obj(_val) ? "&" + _parseObj(_val) : _val;
                                let _enc_val = $$app.rl_title === _val ? _val : encodeURI(_val);
                                _res.push(key + "=" + _enc_val);
                            });
                            return _res.join("&");
                        };

                        return pref + _sep + _parseObj(_par);
                    }
                },
                setBlist: function () {
                    $$app.blist = {
                        _expired: {
                            trigger: function (ts) {
                                if ($$und(ts) || $$inf(ts)) {
                                    return false;
                                }

                                let _now = this.now = new Date(); // Date{}
                                let _du_ts = this.du_ts = ts - +_now;

                                return _du_ts <= 0;
                            },
                            message: function () {
                                if (!$$flag.msg_details) {
                                    return;
                                }

                                let _date_str = this.now.toDateString();
                                let _date_ts = Date.parse(_date_str); // num
                                let _du_o = new Date(_date_ts + this.du_ts);

                                let _d_unit = 24 * 3600 * 1000;
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
                        _showMsg: function (type, data) {
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
                        get: function (name, ref) {
                            if (!name) {
                                return ref;
                            }
                            let _len = this.data.length;
                            for (let i = 0; i < _len; i += 1) {
                                if (name === this.data[i].name) {
                                    this._showMsg("exists", this.data[i]);
                                    return true;
                                }
                            }
                            return ref;
                        },
                        save: function () {
                            $$sto.af.put("blacklist", this.data);
                            return this;
                        },
                        add: function (data_par) {
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
                        init: function () {
                            let _blist_setter = this;
                            blistInitializer().get().clean().message().assign();
                            return _blist_setter;

                            // tool function(s) //

                            function blistInitializer() {
                                let _blist_data = [];
                                return {
                                    get: function () {
                                        // legacy: {%name%: {timestamp::, reason::}}
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
                                    clean: function () {
                                        this.deleted = [];
                                        let _expired = (ts) => {
                                            return _blist_setter._expired.trigger(ts);
                                        };
                                        for (let i = 0; i < _blist_data.length; i += 1) {
                                            let _o = _blist_data[i];
                                            let _name = _o.name;
                                            let _ts = _o.timestamp;

                                            if (!_ts || _expired(_ts)) {
                                                this.deleted.push(_name);
                                                _blist_data.splice(i--, 1);
                                            }
                                        }
                                        return this;
                                    },
                                    message: function () {
                                        let _len = this.deleted.length;
                                        if (_len && $$flag.msg_details) {
                                            let _msg = "移除黑名单记录: " + _len + "项";
                                            messageAct(_msg, 1, 0, 0, "both");
                                            this.deleted.forEach(n => messageAct(n, 1, 0, 1));
                                        }
                                        return this;
                                    },
                                    assign: function () {
                                        _blist_setter.data = _blist_data;
                                        return this;
                                    },
                                };
                            }
                        },
                    }.init().save();
                    $$app.cover_capt = {
                        pool: [],
                        limit: 3,
                        get len() {
                            return this.pool.length;
                        },
                        get filled_up() {
                            return this.len >= this.limit;
                        },
                        add: function (capt) {
                            capt = capt || images.capt();
                            this.filled_up && this.reclaimLast();
                            let _img_name = images.getName(capt);
                            debugInfo("添加能量罩采集样本: " + _img_name);
                            this.pool.unshift(capt);
                        },
                        reclaimLast: function () {
                            let _last = this.pool.pop();
                            let _img_name = images.getName(_last);
                            debugInfo("能量罩采集样本已达阈值: " + this.limit);
                            debugInfo(">移除并回收最旧样本: " + _img_name);
                            images.reclaim(_last);
                            _last = null;
                        },
                        reclaimAll: function () {
                            if (!this.len) {
                                return;
                            }
                            debugInfo("回收全部能量罩采集样本");
                            this.pool.forEach(capt => {
                                let _img_name = images.getName(capt);
                                images.reclaim(capt);
                                debugInfo(">已回收: " + _img_name);
                                capt = null;
                            });
                            this.clear();
                            debugInfo("能量罩采集样本已清空");
                        },
                        clear: function () {
                            this.pool.splice(0, this.len);
                        },
                        detect: function () {
                            let [_l, _t] = [cX(288), cY(210, -1)];
                            let [_w, _h] = [cX(142), cY(44, -1)];
                            let _clip = (img) => {
                                return images.clip(img, _l, _t, _w, _h);
                            };
                            let _len = this.len;
                            let _pool = this.pool;
                            let _clo = $$cfg.protect_cover_ident_color;
                            let _thrd = $$cfg.protect_cover_ident_threshold;
                            let _par = {threshold: _thrd};

                            for (let i = 0; i < _len; i += 1) {
                                let _clp = _clip(_pool[i]);
                                if (images.findColor(_clp, _clo, _par)) {
                                    return true;
                                }
                            }
                        },
                    };

                    return _setter;
                },
                setTools: function () {
                    $$app.page = {
                        _plans: {
                            back: (() => {
                                let _text = () => {
                                    return $$sel.pickup(["返回", "c0", {clickable: true}])
                                        || $$sel.pickup(["返回", {clickable: true}]);
                                };
                                let _id = () => $$sel.pickup(idMatches(/.*h5.+nav.back|.*back.button/));
                                let _bak = [0, 0, cX(100), cY(200, -1)];

                                return [_text, _id, _bak];
                            })(),
                            close: (() => {
                                let _text = () => {
                                    return $$sel.pickup([/关闭|Close/, "c0", {clickable: true}])
                                        || $$sel.pickup([/关闭|Close/, {clickable: true}]);
                                };
                                let _id = () => null; // so far
                                let _bak = [cX(0.8), 0, -1, cY(200, -1)];

                                return [_text, _id, _bak];
                            })(),
                            launch: {
                                af: {
                                    _launcher: function (trigger, par) {
                                        delete $$flag.launch_necessary;
                                        delete $$flag.launch_optional;

                                        return launchThisApp(trigger, Object.assign({}, {
                                            task_name: $$app.task_name,
                                            package_name: $$app.pkg_name,
                                            no_message_flag: true,
                                            condition_launch: () => {
                                                let _cA = () => $$app.cur_pkg === $$app.pkg_name;
                                                let _cB = function () {
                                                    return $$sel.get("rl_ent")
                                                        || $$sel.get("af_home")
                                                        || $$sel.get("wait_awhile");
                                                };

                                                return _cA() || _cB();
                                            },
                                            condition_ready: () => {
                                                let _nec_sel_key = "af_title";
                                                let _opt_sel_keys = ["af_home", "rl_ent"];

                                                return _necessary() && _optional();

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
                                                    for (let i = 0, len = _opt_sel_keys.length; i < len; i += 1) {
                                                        let _key_sel = _opt_sel_keys[i];
                                                        if ($$sel.get(_key_sel)) {
                                                            debugInfo(["已满足启动可选条件", ">" + _key_sel]);
                                                            delete $$flag.launch_necessary;
                                                            delete $$flag.launch_optional;
                                                            return true;
                                                        }
                                                    }
                                                    $$flag.launch_optional = false;
                                                }
                                            },
                                            disturbance: () => {
                                                clickAction($$sel.pickup("打开"), "w");
                                                $$app.page.disPermissionDiag();
                                            },
                                        }, par || {}));
                                    },
                                    intent: function () {
                                        let _i = $$app.intent.home;
                                        if (app.checkActivity(_i)) {
                                            return this._launcher(_i);
                                        }
                                        this._showActHint();
                                    },
                                    click_btn: function () {
                                        let _this = this;
                                        let _node_af_btn = null;
                                        let _sel_af_btn = () => _node_af_btn = $$sel.get("af");

                                        return _alipayHome() && _clickAFBtn();

                                        // tool function(s) //

                                        function _alipayHome() {
                                            let _cA = $$app.page.alipay.home;
                                            let _cB = () => waitForAction(_sel_af_btn, 1500, 80);

                                            return _cA() && _cB();
                                        }

                                        function _clickAFBtn() {
                                            let _trigger = () => clickAction(_node_af_btn, "w");
                                            return _this._launcher(_trigger);
                                        }
                                    },
                                    search_kw: function () {
                                        let _this = this;
                                        let _node_search_aim = null;
                                        return _alipayHome() && _search() && _launch();

                                        // tool function(s) //

                                        function _alipayHome() {
                                            let _cA = $$app.page.alipay.home;
                                            let _cB = () => {
                                                let _kw_af_btn = idMatches(/.*home.+search.but.*/);
                                                let _par = {click_strategy: "w"};

                                                return waitForAndClickAction(_kw_af_btn, 1500, 80, _par);
                                            };

                                            return _cA() && _cB();
                                        }

                                        function _search() {
                                            let _text = "蚂蚁森林小程序";
                                            let _kw_inp_box = idMatches(/.*search.input.box/);
                                            let _kw_search_confirm = idMatches(/.*search.confirm/);
                                            let _sel_inp_box = () => $$sel.pickup(_kw_inp_box);
                                            let _sel_search_aim = () => _node_search_aim = $$sel.get("af");

                                            if (!waitForAction(_sel_inp_box, 5000, 80)) {
                                                return;
                                            }

                                            setText(_text);
                                            waitForAction(() => $$sel.pickup(_text), 3000, 80); // just in case

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
                                    _launcher: function (trigger, par) {
                                        return launchThisApp(trigger, Object.assign({}, {
                                            task_name: "好友排行榜",
                                            package_name: $$app.pkg_name,
                                            no_message_flag: true,
                                            condition_launch: () => true,
                                            condition_ready: () => {
                                                let _rl = $$app.page.rl;
                                                let _inPage = () => _rl.isInPage();
                                                let _loading = () => $$sel.pickup(/加载中.*/);
                                                let _cA = () => !_loading();
                                                let _cB = () => !waitForAction(_loading, 360, 120);
                                                let _listLoaded = () => _cA() && _cB();

                                                return _inPage() && _listLoaded();
                                            },
                                            disturbance: () => {
                                                clickAction($$sel.pickup(/再试一次|打开/), "w");
                                            },
                                        }, par || {}));
                                    },
                                    intent: function () {
                                        let _i = $$app.intent.rl;
                                        if (app.checkActivity(_i)) {
                                            return this._launcher(_i);
                                        }
                                        this._showActHint();
                                    },
                                    click_btn: function () {
                                        let _node_rl_ent = null;
                                        let _sel_rl_ent = () => _node_rl_ent = $$sel.get("rl_ent");

                                        return _locateBtn() && _launch();

                                        // tool function(s) //

                                        function _locateBtn() {
                                            let _max = 8;
                                            while (_max--) {
                                                if (waitForAction(_sel_rl_ent, 1500)) {
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
                                                    keycode(4, "double");
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
                        _getClickable: function (coord) {
                            let _sel = selector();
                            coord = coord.map((x, i) => !~x ? i % 2 ? W : H : x);
                            let _sel_b = _sel.boundsInside.apply(_sel, coord);
                            return _sel_b.clickable().findOnce();
                        },
                        _implement: function (fs, no_bak) {
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
                        _plansLauncher: function (aim, plans_arr, shared_opt) {
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
                                boundsInside: [cX(0.12), cY(0.03, -1), halfW, cY(0.12, -1)],
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
                                employ: function () {
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
                                        condition_ready: $$app.page.autojs.is_fg,
                                    });

                                    if (_res) {
                                        debugInfo("跳板启动成功");
                                        return true;
                                    }
                                    debugInfo("跳板启动失败", 3);
                                    debugInfo(">打开" + _aj_name + "应用超时", 3);
                                },
                                remove: function () {
                                    if (!this.on()) {
                                        return;
                                    }
                                    if (!$$flag.alipay_closed) {
                                        return debugInfo(["跳过启动跳板移除操作", ">支付宝未关闭"]);
                                    }

                                    let _isFg = () => $$app.page.autojs.is_fg;
                                    let _isHome = () => $$app.page.autojs.is_home;
                                    let _back2 = () => {
                                        keycode(4, "double");
                                        sleep(400);
                                    };
                                    let _restore = (cmd) => {
                                        let _page = surroundWith(cmd.toTitleCase(), "\x20");
                                        let _msg = "恢复跳板" + _page + "页面";
                                        debugInfo(_msg);
                                        toast(_msg);
                                        return app.startActivity(cmd);
                                    };

                                    if (!waitForAction(_isFg, 9000, 300)) {
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
                            home: function (par) {
                                return launchThisApp($$app.pkg_name, Object.assign({
                                    app_name: "支付宝",
                                    no_message_flag: true,
                                    condition_ready: () => {
                                        let _pg = $$app.page;
                                        _pg.disPermissionDiag();
                                        _pg.close("no_bak") || _pg.back();
                                        return _pg.alipay.isInPage();
                                    },
                                }, par || {}));
                            },
                            close: function () {
                                debugInfo("关闭支付宝");

                                let _pkg = $$app.pkg_name;
                                let _res = killThisApp(_pkg, {shell_acceptable: true});

                                if (!_res) {
                                    return debugInfo("支付宝关闭超时", 3);
                                }

                                debugInfo("支付宝关闭完毕");
                                return $$flag.alipay_closed = true;
                            },
                            isInPage: function () {
                                return $$sel.get("alipay_home");
                            },
                        },
                        af: {
                            home: function (plans_arr) {
                                return this.launch(plans_arr);
                            },
                            launch: function (plans_arr, shared_opt) {
                                $$app.page.autojs.spring_board.employ();

                                // TODO loadFromConfig
                                let _plans = plans_arr || ["intent", "click_btn", "search_kw"];
                                let _shared_opt = shared_opt || {};
                                let _res = $$app.page._plansLauncher("af", _plans, _shared_opt);

                                $$app.monitor.mask_layer.start();

                                return _res;
                            },
                            close: function () {
                                debugInfo("关闭全部蚂蚁森林相关页面");

                                timeRecorder("close_af_win");
                                let _cA = () => $$sel.get("af_title");
                                let _cB = () => $$sel.get("rl_title");
                                let _cC = () => $$sel.pickup([/浇水|发消息/, {className: "Button"}]);
                                let _cD = () => $$sel.get("login_new_acc");
                                let _tOut = () => timeRecorder("close_af_win", "L") >= 10000;
                                let _cond = () => _cA() || _cB() || _cC() || _cD();

                                while (_cond() && !_tOut()) {
                                    $$app.page.keyBack();
                                    sleep(700);
                                }

                                let _succ = ["相关页面关闭完毕", "保留当前支付宝页面"];
                                debugInfo(_tOut() ? "页面关闭可能未成功" : _succ);
                            },
                        },
                        rl: {
                            get capt_img() {
                                return this._capt || this.capt();
                            },
                            set capt_img(img) {
                                this._capt = img;
                            },
                            capt: function () {
                                images.reclaim(this._capt);
                                return this.capt_img = images.capt();
                            },
                            pool: {
                                data: [],
                                add: function () {
                                    let _rl = $$app.page.rl;
                                    let _pool = this.data;
                                    _pool.unshift(images.copy(_rl.capt()));
                                    return this;
                                },
                                filter: function () {
                                    let _pool = this.data;
                                    for (let i = 0; i < _pool.length; i += 1) {
                                        if (images.isRecycled(_pool[i])) {
                                            _pool.splice(i--, 1);
                                        }
                                    }
                                    return this;
                                },
                                trim: function () {
                                    let _pool = this.data;

                                    for (let i = _pool.length; i-- > 2;) {
                                        images.reclaim(_pool[i]);
                                        _pool[i] = null;
                                        _pool.splice(i, 1);
                                    }
                                    return this;
                                },
                                clean: function () {
                                    debugInfo("清理排行榜截图样本池");
                                    let _pool = this.data;
                                    while (_pool.length) {
                                        _pool.shift().recycle();
                                    }
                                    return this;
                                },
                                isDiff: function () {
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
                            launch: function (plans_arr, shared_opt) {
                                // TODO split from alipay spring board
                                $$app.page.autojs.spring_board.employ();

                                // TODO loadFromConfig
                                let _plans = plans_arr || ["intent", "click_btn"];
                                let _shared_opt = shared_opt || {};

                                return $$app.page._plansLauncher("rl", _plans, _shared_opt);
                            },
                            backTo: function () {
                                let _isIn = () => $$flag.rl_in_page;
                                let _max = 3;
                                let _this = this;
                                while (_max--) {
                                    sleep(240);
                                    keycode(4);
                                    debugInfo("模拟返回键返回排行榜页面");
                                    if (waitForAction(_isIn, 2400, 80)) {
                                        if (!waitForAction(() => !_isIn(), 240, 80)) {
                                            debugInfo("返回排行榜成功");
                                            return true;
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
                            isInPage: function () {
                                let _fg = $$flag.rl_in_page;
                                if (!$$und(_fg)) {
                                    return _fg;
                                }
                                return $$sel.get("rl_title");
                            },
                        },
                        fri: {
                            isInPage: function () {
                                // TODO icon or images match
                                return $$sel.pickup(/你收取TA|发消息/);
                            },
                            getReady: function () {
                                $$app.monitor.reload_btn.start();

                                let _max = 2 * 60000;
                                let _max_b = _max;
                                let _itv = 200;

                                while (!this.isInPage() && _max > 0) {
                                    let _ratio = $$sel.get("wait_awhile") ? 1 : 6;
                                    _max -= _itv * _ratio;
                                    sleep(_itv);
                                }

                                let _sec = (_max_b - _max) / 1000;
                                if (_sec >= 6) {
                                    debugInfo("进入好友森林时间较长: " + _sec.toFixed(2) + "秒");
                                }

                                $$app.monitor.reload_btn.interrupt();

                                if (_max <= 0) {
                                    return messageAction("进入好友森林超时", 3, 1);
                                }

                                let _balls_len = 0;
                                let _ballsReady = () => {
                                    return _balls_len = $$af.eballs(
                                        "all", false
                                    ).length;
                                };
                                if (waitForAction(_ballsReady, 1897.83, 80)) {
                                    debugInfo(["能量球准备完毕", "共计: " + _balls_len + "个"]);
                                    return _balls_len;
                                }
                                return debugInfo("等待能量球超时");
                            },
                        },
                        back: function (no_bak) {
                            return this._implement(this._plans.back, no_bak);
                        },
                        close: function (no_bak) {
                            return this._implement(this._plans.close, no_bak);
                        },
                        keyBack: n => keycode(4, n),
                        closeIntelligently: function () {
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
                        disPermissionDiag: function () {
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
                    $$app.tool = {
                        timeStr: function (time, format) {
                            let _date = _parseDate(time || new Date());
                            let _pad = num => ("0" + num).slice(-2);

                            let _Y = _date.getFullYear();
                            let _y = _Y.toString().slice(-2);
                            let _M = _pad(_date.getMonth() + 1);
                            let _d = _pad(_date.getDate());
                            let _h = _pad(_date.getHours());
                            let _m = _pad(_date.getMinutes());
                            let _s = _pad(_date.getSeconds());

                            let _o = {
                                Y: _Y, M: _M, d: _d, y: _y,
                                s: _s, m: _m, h: _h,
                            };

                            let _hm = _h + ":" + _m;
                            let _ms = _m + ":" + _s;
                            let _hms = _hm + ":" + _s;

                            let _YM = _Y + "/" + _M;
                            let _yM = _y + "/" + _M;
                            let _Md = _M + _d;
                            let _YMd = _YM + "/" + _d;
                            let _yMd = _yM + "/" + _d;

                            Object.assign(_o, {
                                hm: _hm, ms: _ms, hms: _hms,
                                YM: _YM, Md: _Md, YMd: _YMd,
                                yM: _yM, yMd: _yMd,
                            });

                            return _parseFormat(format || "YMd hms");

                            // tool function(s) //

                            function _parseDate(time) {
                                if ($$date(time)) {
                                    return time;
                                }
                                if ($$num(time)) {
                                    return new Date(+time);
                                }
                                if ($$str(time)) {
                                    return new Date(time);
                                }
                                return new Date(); // now
                            }

                            function _parseFormat(str) {
                                str = str.toString();
                                let _res = "";

                                while (str.length) {
                                    let _key = "";
                                    while ((_key + str[0]) in _o) {
                                        _key += str[0];
                                        str = str.slice(1);
                                    }
                                    if (_key) {
                                        _res += _o[_key];
                                    } else {
                                        _res += str[0];
                                        str = str.slice(1);
                                    }
                                }

                                return _res;
                            }
                        },
                        stabilizer: function (cond, init, tt_cond, tt_stable) {
                            let _init = $$und(init) ? NaN : +init;
                            let _tt_c = tt_cond || 3000;
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
                            let _tt_s = tt_stable || 300;
                            let _check = () => _tmp = cond();
                            let _cond_s = () => _old !== _check();

                            while (waitForAction(_cond_s, _tt_s)) {
                                _old = _tmp;
                            }

                            return _old;
                        },
                    };

                    return _setter;
                },
                init: function () {
                    let _aj = $$app.page.autojs;
                    if (_aj.spring_board.on()) {
                        $$app.init_autojs_state = {
                            init_fg: _aj.is_fg,
                            init_home: _aj.is_home,
                            init_log: _aj.is_log,
                            init_settings: _aj.is_settings,
                        };
                    }

                    return _setter;
                }
            };

            return _setter;
        }

        function accSetter() {
            return {
                setParams: function () {
                    Object.assign($$acc, {
                        switch: $$cfg.account_switch,
                        user_list: {
                            _plans: {
                                intent: () => {
                                    return app.startActivity($$app.intent.acc_man);
                                },
                                pipeline: () => {
                                    $$app.page.alipay.home({debug_info_flag: false});

                                    return clickActionsPipeline([
                                        [["我的", "p1"], "widget"],
                                        [["设置", {clickable: true}], "widget"],
                                        [["换账号登录", null]],
                                    ]);
                                },
                            },
                            launch: function (plans_arr) {
                                debugInfo('打开"账号切换"页面');

                                // TODO if (!plans_arr) loadFromConfig
                                plans_arr = plans_arr || ["intent", "pipeline"];

                                for (let i = 0, len = plans_arr.length; i < len; i += 1) {
                                    let _plan_name = plans_arr[i];
                                    let _plan = this._plans[_plan_name];
                                    let _task_name = "计划" + surroundWith(_plan_name);
                                    _plan();
                                    if (waitForAction(this.isInPage, 2000)) {
                                        debugInfo(_task_name + "成功");
                                        return true;
                                    }
                                    debugInfo(_task_name + "失败");
                                }
                                return messageAction('进入"账号切换"页面失败', 4, 1, 0, "both_dash");
                            },
                            parse: function (name_str) {
                                if (!this.isInPage()) {
                                    messageAction("解析用户名信息失败", 4, 1, 0, -1);
                                    messageAction("当前非账户切换页面", 9, 0, 1, 1);
                                }

                                let _kw = idMatches(/.*list_arrow/);
                                waitForAction(() => _kw.exists(), 2000); // just in case
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
                            isInList: function (name_str) {
                                let _nodes = $$sel.pickup(/.+\*{3,}.+/, "nodes");

                                for (let i = 0, len = _nodes.length; i < len; i += 1) {
                                    let _node = _nodes[i];
                                    let _abbr_name = $$sel.pickup(_node, "txt");
                                    if ($$acc.isMatchAbbr(name_str, _abbr_name)) {
                                        return _abbr_name;
                                    }
                                }
                            },
                            isInPage: function () {
                                return $$acc.isInSwAccPg();
                            },
                            makeInPage: function (force) {
                                if (!force && this.isInPage()) {
                                    return true;
                                }
                                return this.launch();
                            },
                            getAbbrFromList: function (name_str) {
                                return this.isInList(name_str) || "";
                            },
                        },
                        _codec: function (str, opr) {
                            if (!str) {
                                return "";
                            }
                            opr = opr || "dec";
                            let _arr = str.toString().split("");
                            _arr.forEach((value, idx) => {
                                let _str = value.charCodeAt(0) + (996 + idx) * {e: 1, d: -1}[opr[0]];
                                _arr[idx] = unescape("%u" + ("0000" + _str.toString(16)).slice(-4));
                            });
                            return _arr.join("");
                        },
                        encode: function (str) {
                            if (!str) messageAction("编码参数为空", 9, 1, 0, "both");
                            return this._codec(str, "enc");
                        },
                        decode: function (str) {
                            if (!str) messageAction("解码参数为空", 9, 1, 0, "both");
                            return this._codec(str, "dec");
                        },
                        isLoggedIn: function (name_str) {
                            let _this = this;

                            return _ready() && _check();

                            // tool function(s) //

                            function _ready() {
                                return _this.isInSwAccPg() || _this.user_list.launch(); //// PENDING ////
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

                                debugInfo(_is_in_list ? "在账号列表中但未登录" : "不在账号列表中");
                            }
                        },
                        isInLoginPg: function () {
                            return $$sel.get("login_other_acc")
                                || $$sel.get("input_lbl_acc")
                                || $$sel.get("login_other_mthd_init_pg");
                        },
                        isInSwAccPg: function () {
                            return $$sel.get("login_new_acc")
                                || $$sel.get("acc_sw_pg_ident");
                        },
                        isMatchAbbr: function (name_str, abbr) {
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
                         * @param [usr_inf.abbr] {string}
                         * -- abbr username
                         * @param [usr_inf.name] {string}
                         * -- full username without encryption
                         * @param [usr_inf.name_raw] {string}
                         * -- encrypted username
                         * @param [usr_inf.code_raw] {string}
                         * -- encrypted code
                         * @param [usr_inf.direct] {boolean}
                         * -- directly login (no account list check)
                         */
                        login: function (usr_inf) {
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
                                    if (_raw) this.name = $$acc.decode(_raw);
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

                                        if (!waitForAction(_cond, 3000)) {
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

                                            waitForAction(() => _a() || _m() || _lb(), 3000);

                                            if (_acc) {
                                                debugInfo('点击"换个账号登录"按钮');
                                                clickAction(_acc, "w");
                                            } else if (_mthd) {
                                                debugInfo('点击"其他登录方式"按钮');
                                                clickAction(_mthd, "w");
                                            }

                                            return waitForAction(_lb, 3000); // just in case
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
                                                let _cA = () => waitForAction(_inputted, 1000);
                                                let _cB = () => !waitForAction(_noInputted, 500);
                                                let _max = 3;

                                                while (_max--) {
                                                    if (waitForAction(_sel_lbl_acc, 1500)) {
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
                                                return _require() && _click() && _check();

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

                                                    return clickAction(_sel_p1, "w", {
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

                                                    if (waitForAction(_cond, 8000)) {
                                                        let _max = 3;
                                                        while (_max--) {
                                                            if (waitForAction(_lbl_code, 1500)) {
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
                                                                if (!waitForAction(_by_code, 2000)) {
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
                                                if (!clickAction($$sel.get("login_btn"), "w")) {
                                                    let _s = '输入密码后点击"登录"失败';
                                                    return messageAction(_s, 4, 1, 0, "both_dash");
                                                }
                                            }

                                            function _manIpt() {
                                                debugInfo("需要手动输入密码");
                                                vibrateDevice(0, 0.1, 0.3, 0.1, 0.3, 0.2);

                                                let _user_tt = 2; // min
                                                let _btn_tt = 2; // min
                                                let _res = false;

                                                let _max = ~~(_user_tt + _btn_tt) * 60000;
                                                $$flag.glob_e_scr_paused = true;
                                                device.keepOn(_max);

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
                                                                dialog: () => {
                                                                    debugInfo([
                                                                        '等待用户响应"需要密码"对话框',
                                                                        '>最大超时时间: ' + _user_tt + '分钟'
                                                                    ]);

                                                                    let _cA = () => _d.isCancelled();
                                                                    let _cAN = () => !_d.isCancelled();
                                                                    let _cB = () => !waitForAction(_cAN, 2000);
                                                                    let _cond = () => _cA() && _cB();

                                                                    if (!waitForAction(_cond, _user_tt * 60000)) {
                                                                        device.cancelOn();
                                                                        _d.dismiss();
                                                                        let _s = "需要密码时等待用户响应超时";
                                                                        messageAction("脚本无法继续", 4, 0, 0, -1);
                                                                        messageAction("登录失败", 4, 0, 1);
                                                                        messageAction(_s, 9, 1, 1, 1);
                                                                    }
                                                                },
                                                                button: () => {
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

                                                                    if (!waitForAction(_cond, _btn_tt * 60000)) {
                                                                        device.cancelOn();
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

                                                while (!_res) sleep(500);

                                                // just to prevent screen from
                                                // turning off immediately
                                                click(99999, 99999);
                                                delete $$flag.glob_e_scr_paused;
                                                device.cancelOn();

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
                                                feedback: () => {
                                                    device.cancelOn();
                                                    messageAction("脚本无法继续", 4, 0, 0, -1);
                                                    messageAction("登录失败", 4, 1, 1);
                                                    messageAction("失败提示信息:" + _err_msg(), 9, 0, 1, 1);
                                                },
                                            }, {
                                                remark: "失败提示",
                                                cond: () => $$sel.pickup(/.*confirmSetting|.*mainTip/),
                                                feedback: () => {
                                                    device.cancelOn();
                                                    messageAction("脚本无法继续", 4, 0, 0, -1);
                                                    messageAction("登录失败", 4, 1, 1);
                                                    messageAction("失败提示信息:" + $$sel.pickup(/.*mainTip/, "txt"), 9, 0, 1, 1);
                                                },
                                            }],
                                            timeout_review: [{
                                                remark: "强制账号列表检查",
                                                cond: () => {
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
                                    if (_t < 100) _t *= 60000;

                                    device.keepOn(_t + 5 * 60000);
                                    let _res = _checker();
                                    device.cancelOn();
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
                        logBack: function () {
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
                    });

                    return this;
                },
                setMain: function () {
                    $$acc.main = {
                        _avatar: {
                            _path: $$app.local_pics_path + "main_user_mini_avatar_clip.png",
                            check: function (path) {
                                if ($$flag.acc_logged_out) {
                                    return debugInfo(["跳过主账户头像检查", ">检测到账户登出状态"]);
                                }

                                let _img = images.read(path || this._path);
                                let _res;

                                timeRecorder("avt_chk");
                                _res = _img && _check.bind(this)(_img);
                                $$app.avatar_checked_time = timeRecorder("avt_chk", "L");

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
                                        let _matched = images.findImage(_capt, img, {level: 1});
                                        images.reclaim(_capt);
                                        _capt = null;
                                        if (_matched) this._capt_cached = _capt;
                                        return _matched;
                                    }
                                }
                            },
                            capt: function () {
                                let _b = null;

                                waitForAction(() => _b = _getAvtPos(), 8000, 100);

                                if (!_b || $$emptyObj(_b)) {
                                    messageAction("无法获取当前头像样本", 3);
                                    return messageAction("森林主页头像控件定位失败", 3, 1);
                                }

                                let [l, t, w, h] = [_b.left, _b.top, _b.width(), _b.height()];
                                if (!w || !h) {
                                    messageAction("无法继续匹配当前头像样本", 3);
                                    return messageAction("森林主页头像控件数据无效", 3, 1);
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
                            save: function (path) {
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
                        _avail: function () {
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
                        isMain: function (name_str) {
                            return $$acc.isMatchAbbr(name_str, $$acc.decode(this.name_raw));
                        },
                        login: function (par) {
                            if (!this._avail()) {
                                return;
                            }
                            if (this._avatar.check()) {
                                return true;
                            }

                            if (_loginMain.bind(this)()) {
                                $$app.page.af.home();
                                this._avatar.save();
                                return true;
                            }

                            messageAction("强制停止脚本", 4, 0, 0, -1);
                            messageAction("主账户登录失败", 9, 1, 1, 1);

                            // tool function(s) //

                            function _loginMain() {
                                return $$acc.login(Object.assign({
                                    name_raw: this.name_raw,
                                    code_raw: this.code_raw,
                                }, par || {}));
                            }
                        },
                    };

                    return this;
                },
            };
        }
    },
    queue: function () {
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

        $$init.queue = {bomb: _b, queue: _q};

        return $$init;

        // tool function(s) //

        function bombSetter() {
            return {
                trigger: () => {
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
                explode: function () {
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
                trigger: function () {
                    return this.excl_tasks_len;
                },
                queue: function () {
                    timeRecorder("sc_q"); // script queue
                    timeRecorder("sc_q_total");

                    let _init_que_len = this.excl_tasks_len;
                    let _que_len = _init_que_len;
                    let _sto_max_que_time = $$cfg.max_queue_time_global;
                    debugInfo("排他性任务排队中: " + _que_len + "项");

                    let _init_max_que_time = _sto_max_que_time * _que_len;
                    let _max_queue_time = _init_max_que_time;
                    debugInfo("已设置最大排队时间: " + _max_queue_time + "分钟");

                    while ((_que_len = this.excl_tasks_len)) {
                        if (_que_len !== _init_que_len) {
                            debugInfo("排他性任务队列发生变更", "up");
                            debugInfo("任务数量: " + _init_que_len + "->" + _que_len + "项");
                            _init_que_len = _que_len;
                            _max_queue_time = _sto_max_que_time * _que_len;
                            debugInfo("最大排队: " + _init_max_que_time + "->" + _max_queue_time + "分钟");
                            _init_max_que_time = _max_queue_time;
                            timeRecorder("sc_q", "save"); // refresh
                        }
                        if (timeRecorder("sc_q", "L", 60000) >= _max_queue_time) {
                            this.excl_tasks.forEach(e => e.forceStop());
                            debugInfo(["强制停止队前所有排他性任务", ">" + "已达最大排队等待时间"]);
                        }
                        sleep(Math.rand([500, 1500]));
                    }

                    let _et = timeRecorder("sc_q_total", "L", "auto");
                    debugInfo("任务排队用时: " + _et, "Up");
                },
            };
        }
    },
    delay: function () {
        let _fg = _fgAppBlistSetter();
        _fg.trigger() ? _fg.autoDelay() : _fg.clear();

        return $$init;

        // tool function(s) //

        function _fgAppBlistSetter() {
            return {
                trigger: function () {
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
                autoDelay: function () {
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
    prompt: function () {
        let _sc_cfg = _scCfgSetter();
        _sc_cfg.trigger() && _sc_cfg.prompt();

        let _pre_run = _preRunSetter();
        _pre_run.trigger() && _pre_run.prompt();

        return $$init;

        // tool function(s) //

        function _scCfgSetter() {
            return {
                trigger: () => {
                    if (!$$sto.af.get("config_prompted")) {
                        debugInfo("显示参数调整提示对话框");
                        return true;
                    }
                },
                prompt: () => {
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
                            _commonAct: function (d, flg) {
                                d.dismiss();
                                let _box = d.isPromptCheckBoxChecked();
                                $$sto.af.put("config_prompted", flg || _box);
                                this._sgn_move_on = true;
                            },
                            posBtn: function (d) {
                                this._sgn_confirm = true;
                                this._commonAct(d, true);
                            },
                            negBtn: function (d) {
                                this._commonAct(d);
                            },
                            wait: function () {
                                let _this = this;
                                if (!waitForAction(() => _this._sgn_move_on, 300000)) {
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
                trigger: () => {
                    let _skip = '跳过"运行前提示"';
                    let _instant = '>检测到"立即运行"引擎参数';
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
                        return debugInfo([_skip, _instant]);
                    }
                    return true;
                },
                prompt: () => {
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
                            posBtn: function (d) {
                                this._sgn_move_on = true;
                                this.pause(100);
                                d.dismiss();
                            },
                            negBtn: function (d) {
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
                                    let _timed_task_len = timers.queryTimedTasks({path: $$app.cwp}).length;
                                    let _title = ["注意", "title_caution_color"];
                                    let _quit_prefix = "当前未设置任何" + $$app.task_name + "定时任务\n\n";
                                    let _quit = "确认要放弃本次任务吗";
                                    let _cnt = [_quit_prefix + _quit, "content_warn_color"];
                                    let _pos_btn = ["确认放弃任务", "caution_btn_color"];
                                    if (_timed_task_len) {
                                        _title = ["提示", "title_default_color"];
                                        _cnt = [_quit, "content_default_color"];
                                    }
                                    return [_title, _cnt, 0, "返回", _pos_btn, 1];
                                }
                            },
                            neuBtn: function (d) {
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
                            pause: function (interval) {
                                _thd_et.interrupt();
                                setTimeout(function () {
                                    let _cont = dialogs.getContentText(_diag);
                                    let _pos = _diag.getActionButton("positive").replace(/ *\[ *\d+ *]$/, "");
                                    _diag.setContent(_cont.replace(/.*(".+".*任务).*/, "请选择$1运行选项"));
                                    _diag.setActionButton("positive", _pos);
                                }, interval || 800);
                            },
                            wait: function () {
                                if (!waitForAction(() => this._sgn_move_on, 3000000)) {
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
                            let _cnt = dialogs.getContentText(_diag);
                            _diag.setContent(_cnt.replace(/\d+/, _sec));
                            let _btn = _diag.getActionButton("positive").replace(/ *\[ *\d+ *]$/, "");
                            _diag.setActionButton("positive", _btn + "  [ " + _sec + " ]");
                            sleep(1000);
                        }
                        debugInfo(["运行提示计时器超时", "任务自动继续"]);
                        _action.posBtn(_diag);
                    }
                },
            };
        }
    },
    monitor: function () {
        // instant monitors with trigger
        let _isu = insuranceMonSetter();
        _isu.trigger() && _isu.clean().deploy().monitor();

        // instant and private monitors
        let _isa = instantMonSetter();
        _isa.maxRun().volKeys().globEvt().logOut();

        // monitors put on standby for $$app invoking
        $$app.monitor = standbyMonSetter();
        $$app.monitor.insurance = _isu;

        return $$init;

        // monitor function(s) //

        function insuranceMonSetter() {
            let _keys = {
                ins_tasks: "insurance_tasks",
                ins_accu: "insurance_tasks_continuous_times",
                ins_accu_max: "timers_insurance_max_continuous_times",
                ins_itv: "timers_insurance_interval",
            };
            let _self = {
                trigger: function () {
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
                        return debugInfo(['跳过"意外保险"设置', '>检测到"无需保险"引擎参数']);
                    }
                    let _accu = this._sto_accu = this._sto_accu + 1;
                    let _max = $$cfg[_keys.ins_accu_max];
                    if (_accu > _max) {
                        debugInfo([
                            "本次会话不再设置保险定时任务",
                            ">任务已达最大连续次数限制: " + _max
                        ]);
                        this.reset();
                        return false; // don't trigger
                    }
                    return true;
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
                    return $$app.ts + $$cfg[_keys.ins_itv] * 60000;
                },
                clean: function () {
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
                reset: function () {
                    this.clean();
                    this._sto_accu = 0;

                    return _self;
                },
                deploy: function () {
                    this.task = timers.addDisposableTask({
                        path: $$app.cwp,
                        date: this._next_task_time,
                    });

                    $$sto.af.put(_keys.ins_tasks, this._sto_ids.concat([this.task.id]));
                    debugInfo(["已设置意外保险定时任务:", "任务ID: " + this.task.id]);

                    return _self;
                },
                monitor: function () {
                    this._thread = threads.starts(function () {
                        setInterval(() => {
                            _self.task.setMillis(_self._next_task_time);
                            timers.updateTimedTask(_self.task);
                        }, 10000);
                    });

                    return _self;
                },
                interrupt: function () {
                    let _thd = this._thread;
                    _thd && _thd.interrupt();

                    return _self;
                }
            };

            return _self;
        }

        function instantMonSetter() {
            return {
                maxRun: function () {
                    let _max = +$$cfg.max_running_time_global;

                    _max && threads.starts(function () {
                        setTimeout(function () {
                            ui.post(() => {
                                let _s = "超时强制退出";
                                messageAction(_s, 9, 1, 0, "both_n");
                            });
                        }, _max * 60000 + 3000);
                    });

                    return this;
                },
                volKeys: function () {
                    debugInfo("设置音量键监听器");

                    threads.starts(function () {
                        events.observeKey();
                        events.onceKeyDown("volume_up", function (e) {
                            messageAction("强制停止所有脚本", 4, 0, 0, -1);
                            messageAction("用户按下'音量加/VOL+'键", 4, 0, 1, 1);
                            engines.stopAllAndToast();
                        });
                        events.onceKeyDown("volume_down", function (e) {
                            messageAction("强制停止当前脚本", 3, 1, 0, -1);
                            messageAction("用户按下'音量减/VOL-'键", 3, 0, 1, 1);
                            $$app.my_engine.forceStop();
                        });
                    });

                    return this;
                },
                globEvt: function () {
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
                     * @param [desc] {string}
                     * -- will show in console as the monitor name
                     * @param [limit=Infinity] {string|number}
                     * @param params {object}
                     * @param [params.switching] {boolean|string}
                     * -- monitor may be disabled according to $$cfg
                     * @param params.trigger {function}
                     * @param [params.onTrigger] {function}
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
                            debugInfo(_sw ? "开启" + _name : _name + "未开启");
                            return _sw;
                        };
                        this.monitor = function () {
                            let _self = Object.assign({
                                onTriggerMsg: () => {
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
                                        if (_lmt < 1000) {
                                            return _tpl("毫秒");
                                        }
                                        if ((_lmt /= 1000) < 60) {
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
                                onReleaseMsg: () => {
                                    messageAction("解除" + _desc + "事件", 1, 0, 0, "up_dash");
                                    let _str = timeRecorder("glob_e" + _desc, "L", "auto");
                                    messageAction("解除用时: " + _str, 1, 0, 1, "dash");
                                },
                                keepWaiting: function () {
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
                                if (lmt < 1000) lmt *= 1000; // take as seconds
                                if (!lmt || lmt <= 0) lmt = Infinity; // endless monitoring
                                return lmt;
                            }
                            if (lmt.match(/h((ou)?rs?)?/)) {
                                return lmt.match(/\d+/)[0] * 3600000;
                            }
                            if (lmt.match(/m(in(utes?))?/)) {
                                return lmt.match(/\d+/)[0] * 60000;
                            }
                            if (lmt.match(/s(ec(conds?))?/)) {
                                return lmt.match(/\d+/)[0] * 1000;
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
                                switch: "phone_call_state_monitor_switch",
                                trigger: function () {
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
                                    return phoneCallingState() !== getCurState();

                                    // tool function(s) //

                                    function getCurState() {
                                        let _cur_state = _self.cur_state;
                                        if (!$$und(_cur_state)) {
                                            return _cur_state;
                                        }

                                        // won't write into storage
                                        _cur_state = phoneCallingState();

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
                                                fillIn: function () {
                                                    if ($$und(_cur_state)) _cur_state = phoneCallingState();
                                                    this.states = _cur_state;
                                                    debugInfo([
                                                        "已存储通话状态数据",
                                                        "当前共计数据: " + this.states.length + "组",
                                                    ]);
                                                    return _cur_state;
                                                },
                                                reap: function () {
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
                                onRelease: () => {
                                    debugInfo('前置"支付宝"应用');
                                    app.launchPackage($$app.pkg_name);
                                },
                            },
                            screen: {
                                trigger: () => {
                                    return $$flag.dev_unlocked
                                        && !$$flag.glob_e_scr_paused
                                        && !device.isScreenOn();
                                },
                                onTrigger: () => {
                                    if ($$flag.glob_e_scr_privilege) {
                                        messageAction("允许脚本提前退出", 3, 1, 0, -1);
                                        messageAction("标识激活且屏幕关闭", 3, 0, 1, 1);
                                        exit();
                                    }
                                },
                                onRelease: () => {
                                    $$flag.glob_e_trig_counter++;
                                    $$dev.isLocked() && $$dev.unlock();
                                    $$flag.glob_e_trig_counter--;
                                },
                            },
                        };
                    }
                },
                logOut: function () {
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
                    _.trigger() ? _.enforce() : _.dismiss();

                    // tool function(s) //

                    function maskLayerSetter() {
                        return {
                            get _cond() {
                                return () => $$sel.pickup("关闭蒙层");
                            },
                            get _N_cond() {
                                return () => !this._cond();
                            },
                            trigger: function () {
                                return waitForAction(this._cond, 5000);
                            },
                            enforce: function () {
                                debugInfo("检测到遮罩层");
                                timeRecorder("_mask_layer");

                                let _cA = () => clickAction(this._cond(), "w");
                                let _cB = () => clickAction(this._cond(), "click");
                                let _cC1 = () => waitForAction(this._N_cond, 2000, 80);
                                let _cC2 = () => !waitForAction(this._cond, 800, 80);
                                let _cC = () => _cC1() && _cC2();
                                let _res = _cA() && _cC() || _cB() && _cC();

                                if (!_res) {
                                    return debugInfo("关闭遮罩层失败", 3);
                                }

                                let _et = timeRecorder("_mask_layer", "L", "auto");
                                debugInfo(["关闭遮罩层成功", "遮罩层关闭用时: " + _et]);
                            },
                            dismiss: () => debugInfo("遮罩层监测线程结束"),
                        }
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
                reload_btn: new Monitor('"重新加载"按钮', function () {
                    let _sel = () => $$sel.get("reload_fst_page");
                    let _click = () => clickAction(_sel(), "w");

                    while (sleep(1000) || true) {
                        _click() && sleep(2000);
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
                })
            };

            // constructor(s) //

            function Monitor(name, thr_f) {
                let _thd = $$app["_threads_" + name];
                this.start = () => {
                    if (_thd && _thd.isAlive()) {
                        return _thd;
                    }
                    _thd = null;
                    debugInfo("开启" + name + "监测线程");
                    return _thd = threads.starts(thr_f);
                };
                this.interrupt = () => {
                    if (_thd) {
                        debugInfo("结束" + name + "监测线程");
                        return _thd.interrupt();
                    }
                };
                this.isAlive = () => _thd && _thd.isAlive();
                this.join = t => _thd && _thd.join(t);
            }
        }
    },
    unlock: function () {
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

        return $$init;
    },
    command: function () {
        let _ = cmdSetter();
        _.trigger() && _.exec();

        return $$init;

        // tool function(s) //

        function cmdSetter() {
            return {
                cmd: $$app.my_engine_argv.cmd,
                get cmd_list() {
                    let _commands = this.commands;
                    return {
                        get_rank_list_names: _commands.friList,
                        get_current_account_name: _commands.curAccName,
                    };
                },
                commands: {
                    friList: function () {
                        return _launch() && _collect() && _quit();

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

                            let _thd_swipe = threads.starts(function () {
                                while (!$$flag.rl_bottom_rch) {
                                    swipe(halfW, uH - 20, halfW, cY(0.2), 150);
                                }
                            });

                            let _thd_expand_lst = threads.starts(function () {
                                let _aim = locatorSetter().locate();

                                _aim.waitForStrMatch();
                                _aim.waitForPosition();
                                _aim.transmitSignal();

                                // tool function(s) //

                                function locatorSetter() {
                                    return {
                                        locate: function () {
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
                                            waitForStrMatch: function () {
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
                                            waitForPosition: function () {
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
                                            transmitSignal: function () {
                                                debugInfo("发送排行榜停检信号");
                                                $$flag.rl_bottom_rch = true;
                                            },
                                        };
                                    }
                                }
                            });

                            _thd_expand_lst.join(5 * 60000); // 5 minutes at most
                            _thd_expand_lst.interrupt();
                            _thd_swipe.interrupt();

                            let _ls_data = _getLstData();

                            $$sto.af.put("friends_list_data", _ls_data);

                            messageAction("采集完毕", 1, 1, 0, -1);
                            messageAction("用时 " + timeRecorder("get_rl_data", "L", "auto"), 1, 0, 1);
                            messageAction("总计 " + _ls_data.list_length + " 项", 1, 0, 1, 1);

                            return $$flag.floaty_fin = 1;

                            // tool function (s) //

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
                        }

                        function _quit() {
                            $$app.page.alipay.close();
                            $$app.exit();
                        }
                    },
                    curAccName: function () {
                        _getCurAccName();
                        $$app.page.alipay.close();
                        $$app.exit();

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

                            // tool function (s) //

                            function _byPipeline() {
                                let _name = "";
                                let _thd_get_name = threads.starts(_thdGetName);
                                let _thd_mon_logout = threads.starts(_thdMonLogout);

                                let _cond = () => _name || $$flag.acc_logged_out;
                                waitForAction(_cond, 12000);

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

                                // threads function(s) //

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
                                    waitForAction(_sel, 2000);

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
                    }
                },
                trigger: function () {
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
                exec: function () {
                    let _cmd = this.cmd;
                    debugInfo(["执行传递指令:", _cmd]);
                    this.cmd_list[_cmd]();
                    sleep(4000);
                },
            };
        }
    },
};

let $$af = {
    launch: () => {
        let _ = launcher();

        _.greet();
        _.assign();
        _.home();
        _.ready();

        return $$af;

        // tool function(s) //

        function launcher() {
            return {
                greet: () => {
                    let _msg = "开始" + $$app.task_name + "任务";
                    messageAction(_msg, 1, 1, 0, "both");
                },
                assign: () => {
                    Object.assign($$af, {
                        emount_t_own: 0, // t: total
                        emount_c_own: 0, // c: collected
                        emount_c_fri: 0,
                        eballs: (type, if_wball, nodes) => {
                            let _type = type || "all";
                            let _nodes = nodes ? nodes : _pickup();
                            let _only_wb = _type === "water";
                            let _need_wb = false;
                            if (_type !== "ripe") {
                                _need_wb = $$und(if_wball) ? true : !!if_wball;
                            }

                            return _nodes.filter(_bndArea).filter(_wball);

                            // tool function(s) //

                            function _pickup() {
                                let _nor = "\xa0";
                                let _ripe = "收集能量\\d+克";
                                let _all = _nor + "|" + _ripe;
                                let _rex_s = {
                                    nor: _nor, water: _nor,
                                    ripe: _ripe, all: _all,
                                };
                                _rex_s.normal = _nor;
                                let _kw = new RegExp(_rex_s[_type]);
                                let _par = {className: "Button"};
                                return $$sel.pickup([_kw, _par], "nodes");
                            }

                            // filter(s) //

                            function _bndArea(w) {
                                let _bnd = w && w.bounds();
                                let _cL = _bnd.left >= cX(0.08);
                                let _cR = _bnd.right <= cX(0.92);

                                return _bnd && _cL && _cR;
                            }

                            function _wball(w) {
                                if (_need_wb && !_only_wb) {
                                    return true;
                                }

                                let _is_wb = _chkWball();
                                return _only_wb ? _is_wb : !_is_wb;

                                // tool function(s) //

                                function _chkWball() {
                                    let _bnd = w && w.bounds();
                                    if (!_bnd) {
                                        return false;
                                    }
                                    let _capt = images.capt();
                                    let _w = _bnd.width();
                                    let _h = _bnd.height();
                                    let _ctx = _bnd.left + _w / 2;
                                    let _cty = _bnd.top + _h / 2;
                                    let _ref = Math.trunc(_w / 5);
                                    let _x_min = _ctx - _ref;
                                    let _x_max = _ctx + _ref;
                                    let _x_step = 2;
                                    let _hue_max = $$cfg.homepage_water_ball_max_hue_b0;
                                    let _res = false;

                                    for (let x = _x_min; x < _x_max; x += _x_step) {
                                        let _col = images.pixel(_capt, x, _cty);
                                        let _red = colors.red(_col);
                                        let _green = colors.green(_col);
                                        let _hue = 120 - (_red / _green) * 60;
                                        // hue value in HSB mode without blue component
                                        if ($$fin(_hue) && _hue < _hue_max) {
                                            // let _ref = +_val.toFixed(2) + "";
                                            // let _pt = "(" + _x + ", " + _y + ")";
                                            // debugInfo("排除好友森林浇水回赠能量球");
                                            // debugInfo(">参照值: " + _ref);
                                            // debugInfo(">中心点: " + _pt);
                                            _res = true;
                                            break;
                                        }
                                    }

                                    images.reclaim(_capt);
                                    _capt = null;

                                    return _res;
                                }
                            }
                        },
                    });
                },
                home: () => {
                    void $$app.page.af.home();
                },
                ready: () => {
                    let _ = readySetter();

                    _.captReady();
                    _.displayReady();
                    _.languageReady();
                    _.mainAccReady();

                    // tool function(s) //

                    function readySetter() {
                        return {
                            captReady: function () {
                                // CAUTION:
                                // images.capt() contains images.permitCapt()
                                // however, which is not recommended to be used
                                // into a Java Thread at the first time
                                // as capture permission will be forcibly interrupted
                                // with this thread killed in a short time (about 300ms)
                                images.permitCapt();
                            },
                            displayReady: function () {
                                if ($$dev.screen_orientation !== 0) {
                                    getDisplayParams({global_assign: true});
                                }
                            },
                            languageReady: function () {
                                let _tt = "";
                                let _sel = () => _tt = $$sel.get("af_title", "txt");

                                if (!waitForAction(_sel, 10000, 100)) {
                                    messageAction("语言检测已跳过", 3);
                                    messageAction("语言检测超时", 3, 0, 1, 1);
                                    return;
                                }

                                if (_tt.match(/蚂蚁森林/)) {
                                    debugInfo("当前支付宝语言: 简体中文");
                                } else {
                                    debugInfo("当前支付宝语言: 英语");
                                    changeLangToChs();

                                    let _sA = "切换支付宝语言: 简体中文";
                                    let _sB = "语言切换失败";
                                    $$app.page.af.home()
                                        ? messageAction(_sA, 1, 0, 0, 1)
                                        : messageAction(_sB, 8, 1, 0, 1);
                                }

                                debugInfo("语言检查完毕");

                                // tool function(s) //

                                function changeLangToChs() {
                                    if (!getReady()) {
                                        return;
                                    }
                                    toast("切换支付宝语言: 简体中文");
                                    $$app.page.disPermissionDiag();

                                    let _cond = () => {
                                        return $$sel.pickup(
                                            ["简体中文", "p3"], "children"
                                        ).length > 1;
                                    };

                                    return clickActionsPipeline([
                                        [["Me", "p1"]],
                                        [["Settings", {clickable: true}]],
                                        [["General", "p4"]],
                                        [["Language", "p4"]],
                                        [["简体中文", "p4"], _cond],
                                        ["Save"],
                                    ], {
                                        name: "切换简体中文语言",
                                        default_strategy: "widget",
                                    });

                                    // tool function(s) //

                                    function getReady() {
                                        let _max_close = 12;
                                        while ($$app.page.close() && _max_close--) {
                                            sleep(500);
                                        }

                                        let _tv = "TextView";
                                        let _tab = "tab_description";
                                        let _kw_home = className(_tv).idContains(_tab);
                                        if (waitForAction(_kw_home, 2000)) {
                                            return true;
                                        }

                                        let _max = 5;
                                        while (_max--) {
                                            let _pkg = $$app.pkg_name;
                                            killThisApp(_pkg);
                                            app.launch(_pkg);
                                            if (waitForAction(_kw_home, 15000)) {
                                                break;
                                            }
                                        }
                                        if (_max >= 0) {
                                            return true;
                                        }
                                        messageAction("Language switched failed", 4, 1);
                                        messageAction("Homepage failed to get ready", 4, 0, 1);
                                    }
                                }
                            },
                            mainAccReady: function () {
                                return $$acc.main.login();
                            },
                        };
                    }
                },
            };
        }
    },
    collect: () => {
        let {own, fri} = collector();

        own.trigger() && own.init().collect();
        fri.trigger() && fri.init().launch().collect();

        return $$af;

        // tool function(s) //

        function collector() {
            return {
                own: {
                    _getEmount: (buf) => {
                        let _amt;
                        let _rex = /\d+g/;
                        let _max = buf ? 10 : 1;
                        while (1) {
                            _amt = $$sel.pickup([_rex, {
                                boundsInside: [cX(0.6), 0, W, cY(0.24, -1)],
                            }], "txt").match(/\d+/);
                            _amt = $$arr(_amt) ? +_amt[0] : _amt;
                            if ($$num(_amt) || !--_max) {
                                break;
                            }
                            sleep(200);
                        }
                        return _max < 0 ? -1 : _amt;
                    },
                    trigger: () => {
                        if ($$cfg.self_collect_switch) {
                            $$af.own = own;
                            return true;
                        }
                        debugInfo(["跳过自己能量检查", "自收功能未开启"]);
                    },
                    init: () => {
                        debugInfo("开始检查自己能量");

                        let _total = own._getEmount("buf");
                        debugInfo("初始能量: " + ($$af.emount_t_own = _total) + "g");

                        let _tt = $$cfg.max_own_forest_balls_ready_time;
                        debugInfo(["查找主页能量球控件", ">最大时间参数: " + _tt + "毫秒"]);

                        let _avt = $$app.avatar_checked_time;
                        if (_avt) {
                            _tt = Math.max(240, _tt - _avt);
                            let _str_a = "查找时间值削减至: " + _tt + "毫秒";
                            let _str_b = ">主账户检测耗时抵充";
                            debugInfo([_str_a, _str_b]);
                            delete $$app.avatar_checked_time;
                        }
                        own.tt = _tt;

                        $$af.min_ctd_own = Infinity;
                        $$af.thrd_monit_own = $$cfg.homepage_monitor_threshold;
                        $$af.thrd_bg_monit_own = $$cfg.homepage_background_monitor_threshold;

                        return own;
                    },
                    collect: () => {
                        _detect() && _check();
                        _result();

                        return own;

                        // tool function(s) //

                        function _detect() {
                            let _num = 0; // balls length
                            let _balls_nodes = null;
                            let _getBallsNum = () => {
                                _balls_nodes = $$af.eballs();
                                return _num = _balls_nodes.length;
                            };

                            if (waitForAction(_getBallsNum, own.tt, 60)) {
                                debugInfo("找到主页能量球: " + _num + "个");
                                return $$af.balls_nodes = _balls_nodes;
                            }
                            debugInfo("指定时间内未发现主页能量球");
                        }

                        function _check() {
                            _chkRipeBalls();
                            _chkCountdown();
                            _chkWaterBalls();

                            // tool function(s) //

                            function _chkRipeBalls() {
                                let _num = 0; // ripe balls length
                                let _nodes = null; // ripe balls nodes
                                let _getNum = () => _num = _getNodes().length;
                                let _getNodes = () => _nodes = $$af.eballs("ripe");
                                let _noRipe = () => $$0(_getNum());

                                if (!_getNum()) {
                                    return;
                                }

                                let _max = 8;
                                let _itv = $$cfg.balls_click_interval;
                                let _par = {press_time: 80};

                                do {
                                    debugInfo("点击自己成熟能量球: " + _num + "个");
                                    _nodes.forEach((w) => {
                                        clickAction(w.bounds(), "p", _par);
                                        sleep(_itv);
                                    });
                                } while (--_max && !waitForAction(_noRipe, 2400, 100));

                                if (_max >= 0) {
                                    return _stableEmount();
                                }
                            }

                            function _stableEmount() {
                                let _t = $$af.emount_t_own;
                                let _getEm = own._getEmount;
                                let _i = $$app.tool.stabilizer(_getEm, _t) - _t;

                                $$af.emount_c_own += _i;
                                $$af.emount_t_own += _i;

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

                                    let _nor_balls = $$af.eballs(
                                        "nor", false, $$af.balls_nodes
                                    );
                                    let _len = _nor_balls.length;
                                    if (!_len) {
                                        return debugInfo("未发现未成熟的能量球");
                                    }
                                    debugInfo("找到自己未成熟能量球: " + _len + "个");

                                    let _t_spot = timeRecorder("ctd_own");
                                    let _min_ctd_own = Math.mini(_getCtdData());

                                    if (!$$posNum(_min_ctd_own) || $$inf(_min_ctd_own)) {
                                        $$af.min_ctd_own = Infinity;
                                        return debugInfo("自己能量最小倒计时数据无效", 3);
                                    }

                                    let _par = ["ctd_own", "L", 60000, 0, "", _min_ctd_own];
                                    let _remain = +timeRecorder.apply({}, _par);
                                    $$af.min_ctd_own = _min_ctd_own;

                                    debugInfo("自己能量最小倒计时: " + _remain + "分钟");
                                    debugInfo("时间: " + $$app.tool.timeStr(_min_ctd_own));

                                    let _cA = $$cfg.homepage_monitor_switch;
                                    let _cB = _remain <= $$af.thrd_monit_own;
                                    if (_cA && _cB) {
                                        debugInfo("触发成熟能量球监测条件");
                                        $$af.balls_nodes = $$af.eballs();
                                        return true;
                                    }
                                    debugInfo("自己能量球最小倒计时检测完毕");
                                    delete $$af.balls_nodes;

                                    // tool function(s) //

                                    function _getCtdData() {
                                        timeRecorder("ctd_data");

                                        let _tt = 12000;
                                        let _alive = thd => thd && thd.isAlive();
                                        let _kill = (thd) => {
                                            thd && thd.interrupt();
                                            thd = null;
                                        };
                                        let _remainT = () => _tt - timeRecorder("ctd_data", "L");
                                        let _ctd_data = [];
                                        let _thd_ocr = threads.starts(_thdOcr);
                                        let _thd_toast = threads.starts(_thdToast);

                                        _thd_toast.join(3600);

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
                                            return _t_spot + (+_h * 60 + +_m) * 60000;
                                        }).filter($$fin);

                                        // threads function(s) //

                                        function _thdOcr() {
                                            debugInfo("已开启倒计时数据OCR识别线程");

                                            let _capt = null;
                                            let _stitched = null;

                                            let _raw_data = baiduOcr(
                                                [_nor_balls, _stitch()], {
                                                    fetch_times: 3,
                                                    fetch_interval: 500,
                                                    no_toast_msg_flag: true,
                                                }
                                            ).map((data) => {
                                                // eg: [["11:29"], ["11:25", "07:03", "3"], [""]]
                                                // --> [["11:29"], ["11:25", "07:03"], []]
                                                return data.filter(s => !!s.match(/\d{2}:\d{2}/));
                                            }).filter((data) => {
                                                // eg: [["11:29"], ["11:25", "07:03"], []]
                                                // --> [["11:29"], ["11:25", "07:03"]]
                                                return data.length > 0;
                                            }).map((data) => {
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
                                            function _stitch() {
                                                _capt = images.capt();
                                                _stitched = _nodeToImg(_nor_balls[0]);

                                                _nor_balls.forEach((w, idx) => {
                                                    if (!idx) {
                                                        return;
                                                    }
                                                    let _par = [_stitched, _nodeToImg(w), "BOTTOM"];
                                                    _stitched = images.concat.apply(images, _par);
                                                });

                                                return _stitched;

                                                // tool function(s) //

                                                function _nodeToImg(w) {
                                                    let _b = w.bounds();
                                                    let [_l, _t] = [_b.left, _b.top];
                                                    let [_w, _h] = [_b.width(), _b.height()];
                                                    return images.clip(_capt, _l, _t, _w, _h);
                                                }
                                            }
                                        }

                                        function _thdToast() {
                                            debugInfo("已开启倒计时数据Toast监控线程");

                                            let _data = [];
                                            let _par = [$$app.pkg_name, /才能收取/, 480];

                                            _nor_balls.forEach((nod) => {
                                                clickAction(nod, "p", {press_time: 12});
                                                let _d = observeToastMessage.apply({}, _par);
                                                _data = _data.concat(_d);
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
                                    let _thrd = $$af.thrd_monit_own;
                                    let _tt = _thrd * 60000 + 3000;
                                    let _old_em = $$af.emount_c_own;

                                    toast("Non-stop checking time");
                                    debugInfo("开始监测自己能量");
                                    timeRecorder("monitor_own");

                                    device.keepOn(_tt);
                                    while (timeRecorder("monitor_own", "L") < _tt) {
                                        if (_chkRipeBalls()) {
                                            break;
                                        }
                                        sleep(180);
                                    }
                                    device.cancelOn();

                                    let _em = $$af.emount_c_own - _old_em;
                                    let _et = timeRecorder("monitor_own", "L", "auto");
                                    toast("Checking completed");
                                    debugInfo("自己能量监测完毕");
                                    debugInfo("本次监测收取结果: " + _em + "g");
                                    debugInfo("监测用时: " + _et);
                                }
                            }

                            function _chkWaterBalls() {
                                debugInfo("开始检测浇水回赠能量球");

                                let _lmt = $$cfg.homepage_water_ball_check_limit;
                                let _o = {lmt: _lmt || Infinity};

                                while (_trig()) {
                                    _fetch();
                                }

                                if (_o.ctr) {
                                    let _pref = "收取浇水回赠能量球: ";
                                    debugInfo(_pref + _o.ctr + "个");
                                } else {
                                    debugInfo("未发现浇水回赠能量球");
                                }

                                debugInfo("浇水回赠能量球检测完毕");

                                // tool function(s) //

                                function _trig() {
                                    if (_o.lmt--) {
                                        _o.nodes = $$af.eballs("water");
                                        return _o.nodes.length;
                                    }
                                    let _sA = "中断主页浇水回赠能量球检测";
                                    let _sB = "已达最大检查次数限制";
                                    messageAction(_sA, 3, 0, 0, -1);
                                    messageAction(_sB, 3, 0, 1, 1);
                                }

                                function _fetch() {
                                    let _nodes = _o.nodes;
                                    let _itv = $$cfg.balls_click_interval;
                                    let _par = {press_time: 80};
                                    let _ctr = _o.ctr || 0;
                                    _nodes.forEach((w) => {
                                        clickAction(w.bounds(), "p", _par);
                                        _ctr += 1;
                                        sleep(_itv);
                                    });
                                    _o.ctr = _ctr;
                                    _stableEmount();
                                }
                            }
                        }

                        function _result() {
                            let _em = $$af.emount_c_own;
                            let _em_str = "共计收取: " + _em + "g";
                            if (!_em || $$inf(_em)) _em_str = "无能量球可收取";

                            debugInfo([_em_str, "自己能量检查完毕"]);
                        }
                    },
                    awake: (thrd) => {
                        let _thrd = thrd || $$af.thrd_bg_monit_own;
                        if (!_thrd) {
                            return;
                        }

                        let _ctd_ts = $$af.min_ctd_own;
                        let _thrd_ts = _thrd * 60000 + 3000;
                        let _cA = _ctd_ts && $$fin(_ctd_ts);
                        let _cB = $$af.min_ctd_own - $$app.ts <= _thrd_ts;
                        let _msg = "开始主页能量球返检监控";

                        if (_cA && _cB) {
                            messageAction(_msg, 1, 1, 0, 1);
                            $$app.page.af.home();
                            own.init().collect();
                            return true;
                        }
                    },
                },
                fri: {
                    _getSmp: (cache_fg) => {
                        if (cache_fg && fri.rl_samples) {
                            return fri.rl_samples;
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
                                    _smp[_nick] = $$app.ts + _mm * 60000;
                                }
                            });

                            let _avail = Object.keys(_smp).length;
                            debugInfo("解析好友有效倒计时数据: " + _avail + "项");

                            return fri.rl_samples = _smp;
                        }
                    },
                    _getMinCtd: () => {
                        let _now = +new Date();
                        let _smp = fri._getSmp("cache");
                        let _nicks = Object.keys(_smp);
                        let _len = _nicks.length;

                        if (!_len) {
                            return;
                        }

                        let _min_ctd = Math.mini(Object.values(_smp));
                        let _mm = Math.round((_min_ctd - _now) / 60000);

                        if (_mm > 0) {
                            $$af.min_ctd_fri = _min_ctd;
                            debugInfo("好友能量最小倒计时: " + _mm + "分钟");
                            debugInfo("时间数据: " + $$app.tool.timeStr(_min_ctd));
                            debugInfo("好友能量最小倒计时检测完毕");
                            return _mm <= $$cfg.rank_list_review_threshold;
                        }
                        return debugInfo("好友倒计时数据无效: " + _mm, 3);
                    },
                    oballs: {},
                    get oballs_len() {
                        return Object.keys(this.oballs).length;
                    },
                    trigger: () => {
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

                        Object.defineProperties(fri, {
                            trig_pick: {get: () => _sw_pick},
                            trig_help: {get: () => _sw_help && _chkHelpSect()},
                        });

                        $$af.fri = fri;

                        return true;

                        // tool function(s) //

                        function _chkHelpSect() {
                            let [_s0, _s1] = $$cfg.help_collect_section;

                            if (_s1 <= _s0) {
                                _s1 = _s1.replace(/\d{2}(?=:)/, $0 => +$0 + 24);
                            }

                            let _now_str = $$app.tool.timeStr($$app.now, "hm");
                            let _res = $$str(_s0, "<=", _now_str, "<", _s1);

                            if (!_res && !$$flag.help_sect_hinted) {
                                debugInfo("当前时间不在帮收有效时段内");
                                $$flag.help_sect_hinted = true;
                            }

                            return _res;
                        }
                    },
                    init: () => {
                        greet();
                        killH5();
                        params();

                        return fri;

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
                                    keycode(4, "double");
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
                            $$app.user_nickname = _getNickname();

                            // tool function(s) //

                            function _getNickname() {
                                if (!$$und($$app.user_nickname)) {
                                    return $$app.user_nickname;
                                }

                                app.startActivity({
                                    data: "alipays://platformapi/startapp?appId=20000141",
                                });

                                let _kw = className("EditText");
                                let _nick = "";
                                let _sel = () => _nick = $$sel.pickup(_kw, "txt");

                                if (!waitForAction(_kw, 4800, 60)) {
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
                                    waitForAction(_sel, 2400);
                                    _nick = _nick.slice(-2);
                                }

                                _nick && debugInfo("成功获取当前账户昵称");

                                return _nick;
                            }
                        }
                    },
                    launch: () => {
                        $$app.page.rl.launch();
                        $$app.monitor.rl_in_page.start();
                        $$app.monitor.rl_bottom.start();

                        /* // make rl ready in case that the list */
                        /* // doesn't respond to the click action */
                        /* // or misses aims available to operate */
                        // sleep(360);

                        return fri;
                    },
                    collect: () => {
                        let _rl = $$app.page.rl;
                        let _tar;
                        // TODO loadFromConfig
                        // TODO max_not_targeted_swipe_times
                        let _max = 200;
                        let _max_b = _max; // bak
                        let _awake = thrd => own.awake(thrd);
                        let _review = () => fri.review();
                        let _reboot = () => fri.reboot();

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
                                            [cX(38), cY(35, -1), _col_pick],
                                            [cX(23), cY(26, -1), -1],
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
                                    check: function () {
                                        if (fri.trig_pick) {
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
                                    mult_col: [[cX(38), cY(35, -1), _col_help]],
                                    check: function () {
                                        if (fri.trig_help) {
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

                            timeRecorder("rl_swipe");

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
                                    _t = _y + cY(76, -1);

                                    _tar.unshift({
                                        icon_matched_x: _matched.x,
                                        icon_matched_y: _y,
                                        list_item_click_y: _y + cY(16, -1),
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
                                let _ic = _getIcon();
                                let _capt = $$app.page.rl.capt_img;
                                let _res = images.matchTpl(_capt, _ic, {
                                    name: "ic_fetch",
                                    max: 20,
                                    range: [28, 30],
                                    threshold_attempt: 0.94,
                                    region_attempt: [cX(0.8), 0, cX(0.2) - 1, uH - 1],
                                    threshold_result: 0.94,
                                });
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

                                function _getIcon() {
                                    if ($$sto.ic_fetch) {
                                        return $$sto.ic_fetch;
                                    }
                                    let _base64 = $$sto.treas.image_base64_data;
                                    let _ic = _base64.ic_fetch;
                                    return $$sto.ic_fetch = images.fromBase64(_ic);
                                }
                            }

                            function _getTar(ident) {
                                let _res = _prop[ident].check() || [];
                                return _res.sort((o_a, o_b) => {
                                    let _y_a = o_a.icon_matched_y;
                                    let _y_b = o_b.icon_matched_y;
                                    return _y_b < _y_a ? -1 : 1;
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
                                let _thd_eball_monit = null;
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

                                    return true;
                                }

                                function _intro() {
                                    let _nick = "";
                                    let _sel = () => {
                                        return _nick = $$sel.get("fri_frst_tt", "txt");
                                    };
                                    if (waitForAction(_sel, 20000, 80)) {
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
                                        let _balls_len = $$app.page.fri.getReady();

                                        fri.init_balls_len = _balls_len;
                                        fri.oballs = {};

                                        delete $$flag.pick_off_duty;

                                        return _balls_len;
                                    }

                                    function _monitor() {
                                        _thd_eball_monit = threads.starts(_thdEballMonit);
                                    }

                                    function _thdEballMonit() {
                                        debugInfo("已开启能量球监测线程");
                                        timeRecorder("eball_monit");

                                        let _col_arr = $$cfg.help_collect_ball_color;
                                        let _thrd = $$cfg.help_collect_ball_threshold;

                                        let _tt_ref = $$cfg.help_collect_ball_intensity;
                                        let _tt = _tt_ref * 160 - 920;
                                        debugInfo("能量球监测采集密度: " + _tt + "毫秒");

                                        let _capt = null;
                                        let _capture = (t) => {
                                            _capt = images.capt();
                                            sleep(t || 0);
                                            return _capt;
                                        };
                                        let _reclaim = () => {
                                            images.reclaim(_capt);
                                            _capt = null;
                                        };

                                        _fillUpCvrCapt();
                                        _analyseOballs();

                                        // tool function(s) //

                                        function _fillUpCvrCapt() {
                                            let _cc = $$app.cover_capt;
                                            let _max = _cc.limit + 1;
                                            while (_max--) {
                                                _cc.add(_capture());
                                                sleep(120);
                                                if (!_cc.len || _cc.filled_up) {
                                                    return;
                                                }
                                            }
                                        }

                                        function _analyseOballs() {
                                            if (!fri.trig_help) {
                                                return;
                                            }
                                            while (1) {
                                                if (_analyse()) {
                                                    break;
                                                }
                                                if (_achieve()) {
                                                    break;
                                                }
                                            }
                                            _reclaim();

                                            // tool function(s) //

                                            function _analyse() {
                                                let _nodes = $$af.eballs("nor", false);
                                                let _len = _nodes.length;
                                                let _intrp = (str) => {
                                                    debugInfo(["采集中断", ">" + str]);
                                                    return true;
                                                };

                                                if (!_len) {
                                                    return _intrp("未发现普通能量球");
                                                }

                                                if (_len === fri.oballs_len) {
                                                    return _intrp("橙色球状态已全部采集完毕");
                                                }

                                                _chkInCvr();
                                                _chkInScr();

                                                // tool function(s) //

                                                function _chkInCvr() {
                                                    let _cvr_fg = _analyseOballs.chk_in_cvr;
                                                    if (!_cvr_fg) {
                                                        debugInfo("采集能量罩样本中的橙色球");
                                                        _parseTpl($$app.cover_capt.pool);
                                                        debugInfo("能量罩样本橙色球采集完毕");
                                                        debugInfo("采集结果数量: " + fri.oballs_len);
                                                        $$app.cover_capt.reclaimAll();
                                                        _analyseOballs.chk_in_cvr = true;
                                                    }
                                                }

                                                function _chkInScr() {
                                                    let _capt = images.capt();
                                                    _parseTpl(_capt);
                                                    images.reclaim(_capt);
                                                    _capt = null;
                                                }

                                                function _parseTpl(capt) {
                                                    if (!$$arr(capt)) {
                                                        return _match(capt);
                                                    }
                                                    let _len = capt.length;
                                                    if (_len <= 1) {
                                                        return _match(capt[0]);
                                                    }
                                                    _match(capt[0]);
                                                    _match(capt[_len - 1]);

                                                    // tool function(s) //

                                                    function _match(capt) {
                                                        _nodes.forEach((nod) => {
                                                            let _bnd = _getBndByColArr(nod);
                                                            if (!_bnd) {
                                                                return;
                                                            }

                                                            let _x = _bnd.centerX();
                                                            if (_x in fri.oballs) {
                                                                return;
                                                            }

                                                            let _y = _bnd.centerY();
                                                            fri.oballs[_x] = [_x, _y];
                                                            let _c = "(" + _x + ", " + _y + ")";
                                                            debugInfo("记录橙色球坐标: " + _c);
                                                        });

                                                        // tool function(s) //

                                                        function _getBndByColArr(nod) {
                                                            let _bnd = null;
                                                            let _find = (nod, col) => {
                                                                return _bnd = images.findColorInBounds(
                                                                    capt, nod, col, _thrd
                                                                );
                                                            };
                                                            let _len = _col_arr.length;
                                                            for (let i = 0; i < _len; i += 1) {
                                                                if (_find(nod, _col_arr[i])) {
                                                                    return _bnd;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            function _achieve() {
                                                let _prog = timeRecorder(
                                                    "eball_monit", "L", _tt / 100, [1], "%"
                                                );
                                                return _prog.slice(0, -1) >= 95;
                                            }
                                        }
                                    }

                                    function _cover() {
                                        let _covered = false;
                                        let _detect = () => $$app.cover_capt.detect();
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
                                                while (!$$app.cover_capt.len && _max--) {
                                                    if (!_thd_eball_monit.isAlive()) {
                                                        break;
                                                    }
                                                    sleep(100);
                                                }
                                            }

                                            function _fillUpIdent() {
                                                let _len = $$app.cover_capt.len;
                                                if (_len) {
                                                    debugInfo("使用能量球监测线程数据");
                                                    debugInfo("能量罩样本数量: " + _len);
                                                }
                                                $$app.cover_capt.filled_up || _fillUp();

                                                // tool function(s) //

                                                function _fillUp() {
                                                    debugInfo("能量罩样本数量不足");
                                                    let _max = 12;
                                                    while (1) {
                                                        if (!_thd_eball_monit.isAlive()) {
                                                            debugInfo(["能量球监测线程已停止", "现场采集能量罩样本数据"]);
                                                            $$app.cover_capt.add();
                                                            break;
                                                        } else if (--_max < 0) {
                                                            debugInfo(["等待样本采集超时", "现场采集能量罩样本数据"]);
                                                            $$app.cover_capt.add();
                                                            break;
                                                        } else if ($$app.cover_capt.filled_up) {
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

                                            debugInfo("终止能量球监测线程");
                                            _thd_eball_monit.interrupt();

                                            let _node_lst = null;
                                            let _sel_lst = () => _node_lst = $$sel.get("list");
                                            if (!waitForAction(_sel_lst, 3000, 80)) {
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
                                                let _max = 50; // 10 sec at most
                                                let _cond_quit = () => {
                                                    let _par = {click_strategy: "w"};
                                                    let _lst_more = $$sel.pickup("点击加载更多");
                                                    let _cA = () => $$sel.pickup("没有更多");
                                                    let _cB = () => !waitForAndClickAction(
                                                        _lst_more, 3000, 120, _par
                                                    );
                                                    sleep(200);
                                                    return _cA() || _cB();
                                                };

                                                while (!_cond_quit() && _max--) {
                                                    _ctr++;
                                                }

                                                debugInfo([
                                                    "动态列表展开完毕",
                                                    '>点击"点击加载更多": ' + _ctr + "次",
                                                ]);
                                            }

                                            function _getTs() {
                                                debugInfo("开启采集能量罩使用时间");

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
                                                        if (waitForAction(_sel_cvr, 1000, 80) || _gt2) {
                                                            debugInfo("能量罩信息定位在: " + _txt);
                                                            return _node_cvr = _sel_cvr();
                                                        }
                                                    }
                                                }
                                            }

                                            function _addBlist() {
                                                _thd_auto_expand.interrupt();

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
                                        _pick();
                                        _help();
                                    }

                                    function _pick() {
                                        $$app.thd_pick = threads.starts(function () {
                                            debugInfo("已开启能量球收取线程");
                                            let _ripe = $$af.eballs("ripe");
                                            if (_ripe.length) {
                                                _clickAndCnt("pick", _ripe);
                                                return true;
                                            }
                                            $$flag.pick_off_duty = true;
                                            debugInfo("没有可收取的能量球");
                                        });
                                    }

                                    function _help() {
                                        _ready() && _click() && _sixRev();

                                        $$app.thd_pick.join();

                                        // tool function(s) //

                                        function _ready() {
                                            _thd_eball_monit.join();

                                            debugInfo("已开启能量球帮收线程");

                                            if (waitForAction(() => $$flag.pick_off_duty, 2000, 80)) {
                                                debugInfo("收取线程信号返回正常");
                                                return true;
                                            }
                                            messageAction("等待收取线程信号超时", 3, 0, 1);
                                        }

                                        function _click() {
                                            if (fri.oballs_len) {
                                                _clickAndCnt("help", fri.oballs);
                                                return true;
                                            }
                                            debugInfo("没有可帮收的能量球");
                                        }

                                        function _sixRev() {
                                            if (fri.init_balls_len >= 6) {
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
                                                click: () => {
                                                    data.forEach((w) => {
                                                        clickAction(w.bounds(), "p", _par_p_t);
                                                        sleep(_itv);
                                                    });
                                                    debugInfo("点击成熟能量球: " + data.length + "个");
                                                    $$flag.pick_off_duty = true;
                                                },
                                                pk_par: ["你收取TA", 10],
                                            },
                                            help: {
                                                name: "帮收",
                                                act: "助力",
                                                click: () => {
                                                    let _pts = Object.values(data);
                                                    _pts.forEach((pt) => {
                                                        clickAction(pt, "p", _par_p_t);
                                                        sleep(_itv);
                                                    });
                                                    debugInfo("点击帮收能量球: " + _pts.length + "个");
                                                },
                                                pk_par: ["你给TA助力", 10],
                                            },
                                        };

                                        let _cfg = _config[act];
                                        let _name = _cfg.name;

                                        let _ctr = threads.atomic(0);
                                        let _res = threads.atomic(-1);

                                        let _thds = {
                                            thd: [_thdPk, _thdFeed],
                                            start: function () {
                                                this.thd.forEach((thd, i, arr) => {
                                                    arr[i] = threads.start(thd);
                                                });
                                            },
                                            isAllDead() {
                                                let _len = this.thd.length;
                                                for (let i = 0; i < _len; i += 1) {
                                                    let _thd = this.thd[i];
                                                    if (_thd && _thd.isAlive()) {
                                                        return false;
                                                    }
                                                }
                                                return true;
                                            },
                                            killAll: function () {
                                                this.thd.forEach(thd => {
                                                    if (thd && thd.isAlive()) {
                                                        thd.interrupt();
                                                        sleep(200);
                                                    }
                                                });
                                            },
                                            ready: (o) => {
                                                let _nm = o.nm;
                                                let _init = o.get();
                                                debugInfo("初始" + _nm + "数据: " + _init);

                                                _ctr.incrementAndGet();

                                                if (isNaN(_init)) {
                                                    return debugInfo("初始" + _nm + "数据无效");
                                                }
                                                o.init = _init;

                                                let _fg = () => $$flag.pick_off_duty;
                                                if (waitForAction(_fg, 2000, 50)) {
                                                    return true;
                                                }
                                                debugInfo(_name + "操作未就绪");
                                            },
                                            stable: (o) => {
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
                                                let _len = _thds.thd.length;
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
                                            waitForAction(_cond, 2400, 80);
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
                                            $$af.emount_c_fri += _is_pick ? _sum : 0;
                                            messageAction(_msg, _lv, 0, 1);
                                        }

                                        // threads function(s) //

                                        function _thdPk() {
                                            let _nm = _name + "面板";
                                            let _basic = {
                                                nm: _nm,
                                                init: NaN,
                                                get: () => _getPkData.apply(null, _cfg.pk_par),
                                                stab: NaN,
                                            };
                                            let _init = NaN;
                                            let _stab = NaN;

                                            _ready() && _stable() && _stat();

                                            // tool function(s) //

                                            function _ready() {
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
                                                let _num = _stab - _init;
                                                _res.compareAndSet(-1, _stab - _init);
                                                debugInfo(_nm + "统计结果: " + _num);
                                            }

                                            function _getPkData(text, max) {
                                                max = max || 1;
                                                while (max--) {
                                                    let _txt = $$sel.pickup([text, "s+1"], "txt");
                                                    if (_txt.match(/\d+(kg|t)/)) {
                                                        debugInfo("放弃低精度参照值");
                                                        return NaN;
                                                    }
                                                    let _mch = _txt.match(/\d+/);
                                                    if (_mch) {
                                                        return +_mch[0];
                                                    }
                                                }
                                                return NaN;
                                            }
                                        }

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
                                                if (!waitForAction(() => $$sel.get("list"), 1500, 50)) {
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
                                                    if (_mch) _num += +_mch[0];
                                                }

                                                _res.compareAndSet(-1, _num);
                                                debugInfo(_nm + "统计结果: " + _num);
                                            }

                                            function _getFeedItemLen(type) {
                                                let _node_lst = null;
                                                let _sel_lst = () => _node_lst = $$sel.get("list");

                                                if (!waitForAction(_sel_lst, 1200, 100)) {
                                                    return NaN;
                                                }

                                                let _sel_str = _getSelStr();
                                                let _str = (n, c) => $$sel.pickup([n, c], _sel_str);

                                                if (_str(_node_lst, "c0") !== "今天") {
                                                    return 0;
                                                }
                                                return _getItemsLen();

                                                // tool function(s) //

                                                function _getSelStr() {
                                                    let _rex = /来浇过水.+|(帮忙)?收取\d+g/;
                                                    return $$sel.pickup(_rex, "sel_str");
                                                }

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
                                    $$app.cover_capt.clear();
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
                                    fri._getMinCtd();
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

                                let _et = timeRecorder("rl_swipe", "L") || 0;
                                let _itv = $$cfg.rank_list_swipe_interval;

                                let _du = $$cfg.rank_list_swipe_time;
                                if (_du < 100) {
                                    _du = 100;
                                } else if (_du > 800) {
                                    _du = 800;
                                }

                                let _dist = $$cfg.rank_list_swipe_distance;
                                if (_dist < 1) {
                                    _dist = Math.trunc(_dist * H);
                                }

                                let _t = Math.trunc((uH - _dist) / 2);
                                if (_t <= 0) {
                                    _autoAdjust();
                                }
                                let _b = uH - _t;

                                _swipe();

                                // tool function(s) //

                                function _autoAdjust() {
                                    let _dist = Math.trunc(uH * 0.95);
                                    let _top = Math.trunc((uH - _dist) / 2);
                                    let _af_cfg = $$sto.af_cfg.get("config", {});
                                    let _data = {rank_list_swipe_distance: _dist};
                                    let _combined = Object.assign({}, _af_cfg, _data);

                                    messageAction("滑动区域超限", 3);

                                    _t = _top;
                                    messageAction("自动修正滑动距离参数:", 3);
                                    messageAction("swipe_top: " + _top, 3);

                                    $$sto.af_cfg.put("config", _combined);
                                    $$cfg.rank_list_swipe_distance = _dist;
                                    messageAction("自动修正配置文件数据:", 3);
                                    messageAction("rank_list_swipe_distance: " + _dist, 3);
                                }

                                function _swipe() {
                                    if (swipe(cX(0.7), _b, cX(0.3), _t, _du)) {
                                        // just to prevent screen from turning off
                                        // maybe this is not a good idea
                                        click(99999, 99999);
                                    } else {
                                        let _msg = "swipe()方法返回false值";
                                        messageAction(_msg, 3, 0, 0, "both_dash");
                                    }
                                    sleep(Math.max(0, _itv - _et));
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
                                        if (waitForAction(_cond, _max * 60000)) {
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
                                        waitForAndClickAction(_node, 12000, 600, _opt);
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
                                            [0, cY(18, -1), _col],
                                            [0, cY(36, -1), _col],
                                            [cX(45), 0, _col],
                                            [cX(45), cY(27, -1), _col],
                                            [cX(45), cY(54, -1), -1],
                                            [cX(90), cY(18, -1), _col],
                                            [cX(90), cY(36, -1), _col],
                                            [cX(90), cY(54, -1), -1],
                                        ];
                                    }
                                }
                            }
                        }
                    },
                    review: () => {
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
                            let _smp = fri.rl_samples;
                            let _old_keys = _smp && Object.keys(_smp);
                            let _new_keys = Object.keys(fri._getSmp());
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
                            if (fri._getMinCtd()) {
                                return _trig("最小倒计时阈值");
                            }
                        }
                    },
                    reboot: () => {
                        return fri.init().launch().collect();
                    },
                },
            };
        }
    },
    timers: () => {
        _trigger() && _autoTask();

        return $$af;

        // tool function(s) //

        function _trigger() {
            if (!$$cfg.timers_switch) {
                return debugInfo("定时循环功能未开启");
            }
            if (!$$cfg.timers_self_manage_switch) {
                return debugInfo("定时任务自动管理未开启");
            }
            return true;
        }

        function _autoTask() {
            let _ahd_own = $$cfg.timers_countdown_check_own_timed_task_ahead;
            let _ahd_fri = $$cfg.timers_countdown_check_friends_timed_task_ahead;
            let _min_own = ($$af.min_ctd_own || Infinity) - _ahd_own * 60000;
            let _min_fri = ($$af.min_ctd_fri || Infinity) - _ahd_fri * 60000;
            let _nxt_min_ctd = Math.min(_min_own, _min_fri);
            let _nxt_unintrp = _nxtUnintrp() || Infinity;
            let _type = _nxt_min_ctd > _nxt_unintrp ? "延时接力" : "最小倒计时";
            let _next = Math.min(_nxt_min_ctd, _nxt_unintrp);

            $$inf(_next) ? debugInfo("无定时任务可设置") : _setAutoTask();

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
                    let _d_ms = 24 * 3600 * 1000; // 86400000
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

                        let _delay = _sto_sxn[i].interval * 60000;
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

            function _setAutoTask() {
                let _thd = threads.starts(function () {
                    let _task = _update() || _add();
                    let _nxt_str = $$app.tool.timeStr(_next);
                    messageAction("任务ID: " + _task.id, 1, 0, 1);
                    messageAction("下次运行: " + _nxt_str, 1, 0, 1);
                    messageAction("任务类型: " + _type, 1, 0, 1, 1);
                });
                _thd.join(5000);
                if (_thd.isAlive()) {
                    // just in case
                    // still got a chance happening, however
                    _thd.interrupt();
                    messageAction("强制停止自动任务管理方法", 3, 0, 0, -1);
                    messageAction("方法执行时间超出预期", 3, 0, 1, 1);
                }

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
                        _sto_task.setMillis(_next);
                        timers.updateTimedTask(_sto_task);
                        messageAction("已更新自动定时任务", 1);
                        return _sto_task;
                    }
                }

                function _add() {
                    let _par = {path: $$app.cwp, date: _next};
                    let _task = timers.addDisposableTask(_par);

                    $$sto.af.put("next_auto_task", {
                        task_id: _task.id,
                        timestamp: _next,
                        type: _type,
                    });
                    messageAction("已添加自动定时任务", 1);

                    return _task;
                }
            }
        }
    },
    epilogue: () => {
        let _logBackIFN = () => $$acc.logBack();
        let _exitNow = () => $$app.exit();
        let _err = e => messageAction(e, 4, 1, 0, -1);

        _logBackIFN();

        Promise.all([_showRes(), _readyExit()])
            .then(_scrOffIFN)
            .then(_exitNow)
            .catch(_err);

        // promise function(s) //

        function _showRes() {
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
                    msg.split("\n").forEach((m) => {
                        messageAction(m, 1);
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
                        let _tt = _ctd * 1000;
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

                            let _max = 5000;
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
                                let _rmng_ctd = Math.ceil(_rmng_t / 1000);
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
                                    <text id="text" gravity="center"
                                          bg="#cc000000" color="#ccffffff"
                                          size="24" padding="10 2"
                                    />
                                </frame>,
                                tt: <frame gravity="center">
                                    <text id="text" gravity="center"
                                          bg="#cc000000" color="#ccffffff"
                                          size="14" text=""
                                    />
                                </frame>,
                                col: <frame gravity="center">
                                    <text id="text" gravity="center"
                                          bg="#ffffff" color="#ffffff"
                                          size="24" padding="10 2"
                                    />
                                </frame>,
                                hint: <frame gravity="center">
                                    <text id="text" gravity="center"
                                          bg="#cc000000" color="#ccffffff"
                                          size="14"
                                    />
                                </frame>,
                            };
                        }

                        function _getHeights() {
                            let _base_h = cY(0.66);
                            let _msg_h = cY(80, -1);
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
                                keycode(4, "double");
                            }
                        }

                        function _onTouch(view, e) {
                            if (!$$flag.floaty_usr_touch) {
                                let _ME = android.view.MotionEvent;
                                let _DN = _ME.ACTION_DOWN;
                                let _UP = _ME.ACTION_UP;
                                let _MV = _ME.ACTION_MOVE;
                                let _ACT = e.getAction();

                                if (_ACT === _DN) {
                                    let _thrd = cY(0.12, -1);
                                    $$flag.floaty_usr_touch = e.getY() > _thrd;
                                }
                                if (_ACT === _MV) {
                                    $$flag.floaty_usr_touch = true;
                                }
                                if (_ACT === _UP) {
                                    let _e_t = e.getEventTime();
                                    let _dn_t = e.getDownTime();
                                    $$flag.floaty_usr_touch = _e_t - _dn_t > 200;
                                }
                            }
                            // event will not be consumed
                            // then be involved by onClickListener
                            return false;
                        }
                    }
                }
            });
        }

        function _readyExit() {
            $$app.blist.save();
            $$app.page.rl.pool.clean();
            $$app.monitor.insurance.interrupt().reset();
            $$app.page.closeIntelligently();
            $$app.page.autojs.spring_board.remove();
            $$flag.glob_e_scr_privilege = true;

            return new Promise((reso) => {
                if ($$1($$flag.floaty_fin)) {
                    return reso();
                }

                timeRecorder("flo_msg");
                debugInfo("等待Floaty消息结束等待信号");
                setIntervalBySetTimeout(_reso, 200, _cond);

                // tool function(s) //

                function _tmo() {
                    let _ctd = $$cfg.floaty_result_countdown;
                    let _max = (+_ctd + 3) * 1000;
                    return timeRecorder("flo_msg", "L") > _max;
                }

                function _cond() {
                    if ($$1($$flag.floaty_fin)) {
                        return reso() || true;
                    }
                }

                function _reso() {
                    if (_tmo()) {
                        let _sA = "放弃等待Floaty消息结束信号";
                        let _sB = ">等待结束信号超时";
                        $$flag.floaty_fin = 1;
                        debugInfo([_sA, _sB], 3);
                        reso();
                    }
                }
            });
        }

        function _scrOffIFN() {
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
            let _res = res => res
                ? debugInfo("关闭屏幕成功")
                : debugInfo("关闭屏幕失败", 3);

            return Promise.resolve()
                .then(_scrOffBySetAsync)
                .catch(_err).then(_res);

            // tool function (s) //

            function _scrOffByKeyCode() {
                debugInfo("尝试策略: 模拟电源按键");

                if (_bugModel()) {
                    return false;
                }

                timeRecorder("scr_off_tt");
                let _code = "26";
                if (keycode(_code, "no_err_msg")) {
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
                    let _brand = device.brand;
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
                let _SCR_OFF_TT = System.SCREEN_OFF_TIMEOUT;
                let _DEV_SET_ENABL = Secure.DEVELOPMENT_SETTINGS_ENABLED;
                let _STAY_ON_PLUG = Global.STAY_ON_WHILE_PLUGGED_IN;
                let _ctx_reso = context.getContentResolver();
                let _setScrOffTt = (t) => {
                    System.putInt(_ctx_reso, _SCR_OFF_TT, t || 1);
                };
                let _setStayOnStat = (stat) => {
                    Global.putInt(_ctx_reso, _STAY_ON_PLUG, stat || 0);
                };
                let _res = false;

                debugInfo("尝试策略: 修改屏幕超时参数");

                if (!System.canWrite(context)) {
                    let _nm = "Auto.js_Write_Settings_Permission_Helper";
                    let _path = files.path("./Tools/" + _nm + ".js");
                    let _sA = "策略执行失败";
                    let _sB = '>需要"修改系统设置"权限';
                    let _sC = ">可使用以下工具获得帮助支持:";
                    let _sD = ">" + _path;
                    debugInfo([_sA, _sB, _sC, _sD]);
                    return false;
                }

                return Promise.resolve()
                    .then(() => _setScrOffPar(1))
                    .then(() => _monScrStatAsync())
                    .then(() => _restoreScrPar())
                    .catch(e => messageAction(e, 4));

                // tool function(s) //

                function _setScrOffPar(time) {
                    let _stay_on_k = "STAY_ON_WHILE_PLUGGED_IN";
                    let _tt_k = "SCREEN_OFF_TIMEOUT";

                    timeRecorder("set_provider");

                    let _cur_dev_enabl = Secure.getInt(_ctx_reso, _DEV_SET_ENABL, 0);
                    let _cur_stay_on = Global.getInt(_ctx_reso, _STAY_ON_PLUG, 0);
                    if (_cur_dev_enabl && _cur_stay_on) {
                        _sto.put(_stay_on_k, _cur_stay_on);
                        _setStayOnStat(0);
                    }

                    let _cur_tt = System.getInt(_ctx_reso, _SCR_OFF_TT, 0);
                    if (_cur_tt > 2000) {
                        _sto.put(_tt_k, _cur_tt);
                    }

                    _setScrOffTt(time);
                }

                function _restoreScrPar() {
                    debugInfo("恢复修改前的设置参数:");

                    let _stay_on_k = "STAY_ON_WHILE_PLUGGED_IN";
                    let _stay_on = _sto.get(_stay_on_k, 0);
                    if (_stay_on) {
                        _setStayOnStat(_stay_on);
                        debugInfo(_stay_on_k + ": " + _stay_on);
                    }

                    let _tt_k = "SCREEN_OFF_TIMEOUT";
                    let _tt = _sto.get(_tt_k, 60000);
                    _setScrOffTt(_tt);
                    debugInfo(_tt_k + ": " + _tt);

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
                        return _ts > 20000;
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
                    }

                    function _condition(reso) {
                        if (!device.isScreenOn()) {
                            let _et = timeRecorder("set_provider", "L", "auto");
                            debugInfo("策略执行成功");
                            debugInfo("用时: " + _et);
                            reso(_res = true);
                            return true;
                        }
                        return !!_tmo();
                    }
                }
            }
        }
    }
};

// entrance //
$$init.check().global().queue().delay().prompt().monitor().unlock().command();

$$af.launch().collect().timers().epilogue();

/**
 * @appendix Code abbreviation dictionary
 * May be helpful for code readers and developers
 * Not all items showed up in this project
 * @abbr acc: account | accu: accumulated | act: action; activity | add: additional | af: ant forest | agn: again | ahd: ahead | amt: amount | anm: animation | app: application | arci: archive(d) | args: arguments | argv: argument values | asg: assign | asgmt: assignment | async: asynchronous | avail: available | avt: avatar | b: bottom; bounds; backup; bomb | bak: backup | bd: bound(s) | blist: blacklist | bnd: bound(s) | btm: bottom | btn: button | buf: buffer | c: compass; coordination(s) | cf: comparision (latin: conferatur) | cfg: configuration | cfm: confirm | chk: check | cln: clean | clp: clip | cmd: command | cnsl: console | cnt: content; count | cntr: container | col: color | cond: condition | constr: constructor | coord: coordination(s) | ctd: countdown | ctr: counter | ctx: context | cur: current | cvr: cover | cwd: current working directory | cwp: current working path | cxn: connection | d: dialog | dat: data | dbg: debug | dc: decrease | dec: decode; decrypt | def: default | del: delete; deletion | desc: description | dev: device; development | diag: dialog | dic: dictionary | diff: difference | dis: dismiss | disp: display | dist: distance; disturb; disturbance | dn: down | dnt: donation | ds: data source | du: duration | dupe: duplicate; duplicated; duplication | dys: dysfunctional | e: error; engine; event | eball(s): energy ball(s) | egy: energy | ele: element | emount: energy amount | enabl: enable; enabled | enc: encode; encrypt | ens: ensure | ent: entrance | eq: equal | eql: equal | et: elapsed time | evt: event | exc: exception | excl: exclusive | excpt: exception | exec: execution | exp: expected | ext: extension | fg: foreground; flag | flg: flag | flo: floaty | forc: force; forcible; forcibly | fri: friend | frst: forest | fs: functions | fst: forest | gdball(s): golden ball(s) | glob: global | grn: green | gt: greater than | h: height; head(s) | his: history | horiz: horizontal | i: intent; increment | ic: increase | ident: identification | idt: identification | idx: index | ifn: if needed | inf: information | info: information | inp: input | ins: insurance | intrp: interrupt | invt: invitation | ipt: input | itball(s): initialized ball(s) | itv: interval | js: javascript | k: key | kg: keyguard | kw: keyword | l: left | lbl: label | lch: launch | len: length | lmt: limit | ln: line | ls: list | lsn: listen; listener | lv: level | lyr: layer | lyt: layout | man: manual(ly) | mch: matched | mod: module | mon: monitor | monit: monitor | msg: message | mthd: method | mv: move | n: name; nickname | nball(s): normal ball(s) | nec: necessary | neg: negative | neu: neutral | nm: name | nod: node | num: number | nxt: next | o: object | oball(s): orange ball(s) | opr: operation | opt: option; optional | or: orientation | org: orange | oth: other | p: press; parent | par: parameter | param: parameter | pat: pattern | pg: page | pkg: package | pos: position | pref: prefix | prog: progress | prv: privilege | ps: preset | pwr: power | q: queue | que: queue | r: right; region | ran: random | rch: reach; reached | rec: record; recorded; rectangle | rect: rectangle | relbl: reliable | req: require; request | res: result; restore | reso: resolve; resolver | resp: response | ret: return | rev: review | rl: rank list | rls: release | rm: remove | rmng: remaining | rsn: reason | rst: reset | s: second(s); stack | sav: save | sc: script | scr: screen | sec: second | sect: section | sel: selector; select(ed) | sels: selectors | set: settings | sep: separator | sgl: single | sgn: signal | simpl: simplify | smp: sample | spl: special | src: source | stab: stable | stat: statistics | stg: strategy | sto: storage | str: string | succ: success; successful | suff: suffix | svr: server | sw: switch | swp: swipe | sxn: section(s) | sym: symbol | sz: size | t: top; time | thd(s): thread(s) | thrd: threshold | tmo: timeout | tmp: temporary | tpl: template | treas: treasury; treasuries | trig: trigger; triggered | ts: timestamp | tt: title; timeout | tv: text view | txt: text | u: unit | unexp: unexpected | unintrp: uninterrupted | unlk: unlock: unlocked | usr: user | util: utility | v: value | val: value | vert: vertical | w: widget | wball(s): water ball(s) | win: window
 */