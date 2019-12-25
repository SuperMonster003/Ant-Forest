/**
 * @overview alipay ant forest energy intelligent collection script
 *
 * @last_modified Dec 25, 2019
 * @version 1.9.10 Beta8
 * @author SuperMonster003
 *
 * @tutorial {@link https://github.com/SuperMonster003/Auto.js_Projects/tree/Ant_Forest}
 */

let {
    $sel, $app, $cfg, $sto, $dev, $flag, $acc,
    ui, currentPackage, storages, android, className,
    floaty, colors, toast, files, idMatches, engines,
    events, timers, swipe, sleep, exit, app, threads,
    images, device, auto, dialogs, selector, context,
    id, click, setText,
} = global;

let $init = {
    check: function () {
        checkAlipayPackage();
        checkAccessibility();
        checkModulesMap();
        checkSdkAndAJVer();

        // `return this;` wasn't adopted here
        // considering the location of codes with
        // a chaining source jump for IDE like WebStorm
        return $init;

        // tool function(s) //

        function checkAlipayPackage() {
            $app = $app || {};
            let _pkg = "com.eg.android.AlipayGphone";
            if (!app.getAppName(_pkg)) {
                messageAction('此设备可能未安装"支付宝"应用', 9, 1, 0, "both");
            }
            return $app.pkg_name = _pkg;
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
                "MODULE_MONSTER_FUNC", "MODULE_DEFAULT_CONFIG",
                "MODULE_PWMAP", "MODULE_UNLOCK", "MODULE_STORAGE",
                "EXT_DIALOGS", "EXT_TIMERS", "EXT_DEVICE",
                "EXT_APP", "EXT_IMAGES",
            ];
            let wanted = [];
            for (let i = 0, len = _map.length; i < len; i += 1) {
                let module = _map[i];
                let path = "./Modules/" + module + ".js";
                path = path.replace(/(\.js){2,}/, ".js");
                files.exists(path) || wanted.push(module);
            }
            let wanted_len = wanted.length;
            if (wanted_len) {
                let [line, msg] = [showSplitLineRaw, messageActionRaw];
                let _str = "";

                void function () {
                    _str += "脚本无法继续|以下模块缺失或路径错误:|";
                    _str += "- - - - - - - - - - - - - - - - -|";
                    wanted.forEach(n => _str += '-> "' + n + '.js"|');
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

        function messageActionRaw(msg, msg_level, toast_flag) {
            let _msg = msg || " ";
            if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
            }
            let _msg_level = +msg_level;
            toast_flag && toast(_msg);
            if (_msg_level === 0) return console.verbose(_msg) || true;
            if (_msg_level === 1) return console.log(_msg) || true;
            if (_msg_level === 2) return console.info(_msg) || true;
            if (_msg_level === 3) return console.warn(_msg) || false;
            if (_msg_level >= 4) {
                console.error(_msg);
                _msg_level >= 8 && exit();
            }
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
        setGlobalDollarVars(); // `$xxx`
        getDisplayParams({global_assign: true});

        // waitFor: script will continue running rather than stop
        // when accessibility service switched on by user
        $$func(auto.waitFor) ? auto.waitFor() : auto();

        Object.assign($dev, require("./Modules/MODULE_UNLOCK"));

        let _mod_sto = require("./Modules/MODULE_STORAGE");
        $sto.af = _mod_sto.create("af");
        $sto.af_cfg = _mod_sto.create("af_cfg");

        $sel = getSelector();

        let _default_af = require("./Modules/MODULE_DEFAULT_CONFIG").af || {};
        Object.assign($cfg, _default_af, $sto.af_cfg.get("config", {}));

        $flag.msg_details = $cfg.console_log_details || $cfg.debug_info_switch;
        $flag.debug_info_avail = $cfg.debug_info_switch && $cfg.message_showing_switch;
        $flag.no_msg_act_flag = !$cfg.message_showing_switch;

        appSetter().setEngine().setTask().setParams().setBlist().setTools().init();

        accSetter().setParams().setMain();

        debugInfo("开发者测试日志已启用", "both_dash_Up");
        debugInfo("Auto.js版本: " + $app.autojs_ver);
        debugInfo("项目版本: " + $app.project_ver);
        debugInfo("安卓系统SDK版本: " + $app.sdk_ver);

        return $init;

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
                    return $flag.msg_details
                        ? messageAction.apply({}, Object.values(arguments))
                        : (m, lv) => !~[3, 4].indexOf(lv);
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
            // do not `$a = $b = $c = {};`
            // they shouldn't be assigned
            // the same address pointer
            $sel = $sel || {};
            $app = $app || {};
            $cfg = $cfg || {};
            $sto = $sto || {};
            $dev = $dev || {};
            $flag = $flag || {};
            $acc = $acc || {};
        }

        function appSetter() {
            let setter = {
                setEngine: function () {
                    let _my_engine = engines.myEngine();
                    let _my_engine_argv = _my_engine.execArgv || {};
                    let _getCwp = (e) => {
                        let _cwp = e.source.toString();
                        let _defPath = () => e.cwd() + "/Ant_Forest_Launcher.js";
                        return _cwp.match(/\[remote]/) ? _defPath() : _cwp;
                    };

                    Object.defineProperties($app, {
                        my_engine: {value: _my_engine},
                        my_engine_id: {value: _my_engine.id},
                        my_engine_argv: {value: _my_engine_argv},
                        cwd: {value: _my_engine.cwd()}, // `files.cwd()` also fine
                        init_scr_on: {value: _my_engine_argv.init_scr_on || $dev.is_screen_on},
                        init_fg_pkg: {value: _my_engine_argv.init_fg_pkg || currentPackage()},
                        cwp: {value: _getCwp(_my_engine)},
                        cur_pkg: {get: () => currentPackage()},
                        now: {get: () => new Date()},
                        ts: {get: () => +new Date()},
                        exit: {
                            value: function () {
                                messageAction($app.task_name + "任务结束", 1, 0, 0, "both_n");
                                return ui.post(exit);
                            },
                        },
                    });

                    return setter;
                },
                setTask: function () {
                    Object.defineProperties($app, {
                        setPostponedTask: {
                            value: function (duration, toast_flag) {
                                $flag.task_deploying || threads.starts(function () {
                                    $flag.task_deploying = true;

                                    let _task_str = surroundWith($app.task_name) + "任务";
                                    let _du_str = duration + "分钟";
                                    toast_flag === false || toast(_task_str + "推迟 " + _du_str);
                                    messageAction("推迟" + _task_str, 1, 0, 0, -1);
                                    messageAction("推迟时长: " + _du_str, 1, 0, 0, 1);

                                    let _ts = $app.ts + duration * 60000;
                                    let _task = timers.addDisposableTask({path: $app.cwp, date: _ts});
                                    let _type_suffix = $sto.af.get("fg_blist_hit_accu_times") ? "_auto" : "";
                                    $sto.af.put("next_auto_task", {
                                        task_id: _task.id,
                                        timestamp: _ts,
                                        type: "postponed" + _type_suffix,
                                    });

                                    ui.post(exit);
                                });
                            },
                        },
                    });

                    return setter;
                },
                setParams: function () {
                    // _unESC says, like me if you also enjoy unicode games :)
                    let _unESC = s => unescape(s.replace(/(\w{4})/g, "%u$1"));
                    let _local_pics_path = files.getSdcardPath() + "/.local/Pics/";

                    void files.createWithDirs(_local_pics_path);
                    void Object.assign($app, {
                        task_name: surroundWith(_unESC("8682868168EE6797")),
                        rl_title: _unESC("2615FE0F0020597D53CB6392884C699C"),
                        local_pics_path: _local_pics_path,
                        rex_energy_amt: /^\s*\d+(\.\d+)?(k?g|t)\s*$/,
                    });
                    void Object.assign($app, {
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
                                        defaultTitle: $app.rl_title,
                                        transparentTitle: "none",
                                    },
                                }),
                            },
                            acc_man: {
                                action: "VIEW",
                                className: "com.alipay.mobile" +
                                    ".security.accountmanager" +
                                    ".ui.AccountManagerActivity_",
                                packageName: $app.pkg_name,
                            },
                            acc_login: {
                                action: "VIEW",
                                className: "com.alipay.mobile.security.login" +
                                    ".ui.RecommandAlipayUserLoginActivity",
                                packageName: "com.eg.android.AlipayGphone",
                            },
                        },
                        fri_drop_by: {},
                    });
                    void Object.defineProperties($app.fri_drop_by, {
                        _pool: {value: []},
                        _max: {value: 5},
                        ic: {
                            get: () => function (name) {
                                let _ctr = this._pool[name] || 0;
                                if (_ctr === this._max) {
                                    debugInfo("发送排行榜复查停止信号");
                                    debugInfo(">已达连续好友访问最大阈值");
                                    $flag.rl_review_stop = true;
                                }
                                this._pool[name] = ++_ctr;
                            },
                        },
                        dc: {
                            get: () => function (name) {
                                let _ctr = this._pool[name] || 0;
                                this._pool[name] = _ctr > 1 ? --_ctr : 0;
                            },
                        },
                    });
                    void addSelectors();

                    // TODO refactoring needed here
                    (function prologue() {
                        $app.rank_list_bottom_template_path = $cfg.rank_list_bottom_template_path;
                        $app.rank_list_bottom_template = images.read($app.rank_list_bottom_template_path);
                        $app.rank_list_capt_diff_check_pool = [];
                        $app.rank_list_capt_pool_diff_check_counter = 0;
                    })();

                    return setter;

                    // tool function(s) //

                    function addSelectors() {
                        let _acc_logged_out = new RegExp(".*(" +
                            /在其他设备登录|logged +in +on +another/.source + "|" +
                            /.*账号于.*通过.*登录.*|account +logged +on +to/.source +
                            ").*");
                        let _login_err_msg = (type) => {
                            type = type || "txt";

                            return $sel.pickup(id("com.alipay.mobile.antui:id/message"), type)
                                || $sel.pickup([$sel.get("login_err_ensure"), "p2c0c0c0"], type);
                        };

                        $sel.add("af", "蚂蚁森林")
                            .add("alipay_home", [/首页|Homepage/, {boundsInside: [0, cY(0.7), W, H]}])
                            .add("af_title", [/蚂蚁森林|Ant Forest/, {boundsInside: [0, 0, cX(0.4), cY(0.2)]}])
                            .add("af_home", /合种|背包|通知|攻略|任务|.*大树养成.*/)
                            .add("rl_title", $app.rl_title)
                            .add("rl_ent", /查看更多好友|View more friends/) // rank list entrance
                            .add("rl_end_ident", /.*没有更多.*/) // TODO to replace
                            .add("list", className("ListView"))
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

                        let parseObj = (o) => {
                            let _res = [];
                            Object.keys(o).forEach((key) => {
                                let _val = o[key];
                                _val = $$obj(_val) ? "&" + parseObj(_val) : _val;
                                let _enc_val = $app.rl_title === _val ? _val : encodeURI(_val);
                                _res.push(key + "=" + _enc_val);
                            });
                            return _res.join("&");
                        };

                        return pref + _sep + parseObj(_par);
                    }
                },
                setBlist: function () {
                    $app.blist = {
                        _expired: {
                            trigger: function (ts) {
                                if ($$und(ts) || $$inf(ts)) return false;

                                let _now = this.now = new Date(); // Date{}
                                let _du_ts = this.du_ts = ts - +_now;

                                return _du_ts <= 0;
                            },
                            message: function () {
                                if (!$flag.msg_details) return;

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
                        _showMsg: function (type, nick) {
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

                            let _nick = nick || $af.nick;
                            let _black = $app.blist.data[_nick];
                            let _rsn = _rsn_o[_black.reason];
                            let _str = _getExpiredStr(_black.timestamp);

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
                            let _res = name && this.data[name];
                            _res && this._showMsg("exists", name);
                            return _res || ref;
                        },
                        save: function () {
                            $sto.af.put("blacklist", this.data);
                            return this;
                        },
                        add: function (data) {
                            let _nick;

                            if ($$obj(data)) {
                                _nick = Object.keys(data)[0];
                                Object.assign(this.data, data);
                            } else if ($$len(arguments, 3)) {
                                let _data = {};
                                let _args = arguments;
                                _nick = _args[0];
                                _data[_nick] = {
                                    timestamp: _args[1],
                                    reason: _args[2],
                                };
                                Object.assign(this.data, _data);
                            } else {
                                messageAction("黑名单添加方法参数不合法", 9, 1, 0, "both");
                            }

                            this._showMsg("add", _nick);
                            return this;
                        },
                        data: {},
                        init: function () {
                            let blist_setter = this;
                            blistInitializer().get().clean().message().assign();
                            return blist_setter;

                            // tool function(s) //

                            function blistInitializer() {
                                return {
                                    get: function () {
                                        // {%name%: {timestamp::, reason::}}
                                        this.blist_data = $sto.af.get("blacklist", {});
                                        return this;
                                    },
                                    clean: function () {
                                        this.deleted = [];
                                        Object.keys(this.blist_data).forEach((name) => {
                                            let _ts = this.blist_data[name].timestamp;
                                            let _expired = (ts) => {
                                                if (blist_setter._expired.trigger(ts)) {
                                                    this.deleted.push(name);
                                                    return true;
                                                }
                                            };
                                            if (!_ts || _expired(_ts)) {
                                                delete this.blist_data[name];
                                            }
                                        });
                                        return this;
                                    },
                                    message: function () {
                                        let _len = this.deleted.length;
                                        if (_len && $flag.msg_details) {
                                            let _msg = "移除黑名单记录: " + _len + "项";
                                            messageAct(_msg, 1, 0, 0, "both");
                                            this.deleted.forEach(n => messageAct(n, 1, 0, 1));
                                            showSplitLine();
                                        }
                                        return this;
                                    },
                                    assign: function () {
                                        blist_setter.data = this.blist_data;
                                        return this;
                                    },
                                };
                            }
                        },
                    }.init().save();
                    $app.cover_capt = {
                        pool: [],
                        _limit: 3,
                        get len() {
                            return this.pool.length;
                        },
                        get filled_up() {
                            return this.len >= this._limit;
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
                            debugInfo("能量罩采集样本已达阈值: " + this._limit);
                            debugInfo(">移除并回收最旧样本: " + _img_name);
                            images.reclaim(_last);
                            _last = null;
                        },
                        reclaimAll: function () {
                            if (!this.len) return;

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
                            let _clo = $cfg.protect_cover_ident_color;
                            let _thrd = $cfg.protect_cover_ident_threshold;
                            let _par = {threshold: _thrd};

                            for (let i = 0; i < _len; i += 1) {
                                let _clp = _clip(_pool[i]);
                                if (images.findColor(_clp, _clo, _par)) {
                                    return true;
                                }
                            }
                        },
                    };

                    return setter;
                },
                setTools: function () {
                    $app.page = {
                        _plans: {
                            back: (() => {
                                let text = () => {
                                    return $sel.pickup(["返回", "c0", {clickable: true}])
                                        || $sel.pickup(["返回", {clickable: true}]);
                                };
                                let id = () => $sel.pickup(idMatches(/.*h5.+nav.back|.*back.button/));
                                let bak = [0, 0, cX(100), cY(200, -1)];

                                return [text, id, bak];
                            })(),
                            close: (() => {
                                let text = () => {
                                    return $sel.pickup([/关闭|Close/, "c0", {clickable: true}])
                                        || $sel.pickup([/关闭|Close/, {clickable: true}]);
                                };
                                let id = () => null; // so far
                                let bak = [cX(0.8), 0, -1, cY(200, -1)];

                                return [text, id, bak];
                            })(),
                            launch: {
                                af: {
                                    _launcher: function (trigger, par) {
                                        delete $flag.launch_necessary;
                                        delete $flag.launch_optional;

                                        return launchThisApp(trigger, Object.assign({}, {
                                            task_name: $app.task_name,
                                            package_name: $app.pkg_name,
                                            no_message_flag: true,
                                            condition_launch: () => {
                                                let _cA = () => $app.cur_pkg === $app.pkg_name;
                                                let _cB = function () {
                                                    return $sel.get("rl_ent")
                                                        || $sel.get("af_home")
                                                        || $sel.get("wait_awhile");
                                                };

                                                return _cA() || _cB();
                                            },
                                            condition_ready: () => {
                                                let _nec_sel_key = "af_title";
                                                let _opt_sel_keys = ["af_home", "rl_ent"];

                                                return _necessary() && _optional();

                                                // tool function(s) //

                                                function _necessary() {
                                                    if ($flag.launch_necessary) return true;

                                                    if (!$$bool($flag.launch_necessary)) {
                                                        debugInfo("等待启动必要条件");
                                                    }

                                                    if ($sel.get(_nec_sel_key)) {
                                                        debugInfo(["已满足启动必要条件:", _nec_sel_key]);
                                                        $flag.launch_necessary = true;
                                                        return true;
                                                    }
                                                    $flag.launch_necessary = false;
                                                }

                                                function _optional() {
                                                    if (!$$bool($flag.launch_optional)) {
                                                        debugInfo("等待启动可选条件");
                                                    }
                                                    for (let i = 0, len = _opt_sel_keys.length; i < len; i += 1) {
                                                        let _key_sel = _opt_sel_keys[i];
                                                        if ($sel.get(_key_sel)) {
                                                            debugInfo(["已满足启动可选条件", ">" + _key_sel]);
                                                            delete $flag.launch_necessary;
                                                            delete $flag.launch_optional;
                                                            return true;
                                                        }
                                                    }
                                                    $flag.launch_optional = false;
                                                }
                                            },
                                            disturbance: () => {
                                                clickAction($sel.pickup("打开"), "w");
                                                $app.page.disPermissionDiag();
                                            },
                                        }, par || {}));
                                    },
                                    intent: function () {
                                        let _i = $app.intent.home;
                                        if (app.checkActivity(_i)) {
                                            return this._launcher(_i);
                                        }
                                        this._showActHint();
                                    },
                                    click_btn: function () {
                                        let _this = this;
                                        let _node_af_btn = null;
                                        let _sel_af_btn = () => _node_af_btn = $sel.get("af");

                                        return _alipayHome() && _clickAFBtn();

                                        // tool function(s) //

                                        function _alipayHome() {
                                            let _cA = $app.page.alipay.home;
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
                                            let _cA = $app.page.alipay.home;
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
                                            let _sel_inp_box = () => $sel.pickup(_kw_inp_box);
                                            let _sel_search_aim = () => _node_search_aim = $sel.get("af");

                                            if (!waitForAction(_sel_inp_box, 5000, 80)) return;

                                            setText(_text);
                                            waitForAction(() => $sel.pickup(_text), 3000, 80); // just in case

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
                                                if (_node_search_aim.clickable()) break;
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
                                            package_name: $app.pkg_name,
                                            no_message_flag: true,
                                            condition_launch: () => true,
                                            condition_ready: () => {
                                                return $app.page.rl.isInPage();
                                            },
                                            disturbance: () => {
                                                clickAction($sel.pickup(/再试一次|打开/), "w");
                                            },
                                        }, par || {}));
                                    },
                                    intent: function () {
                                        let _i = $app.intent.rl;
                                        if (app.checkActivity(_i)) {
                                            return this._launcher(_i);
                                        }
                                        this._showActHint();
                                    },
                                    click_btn: function () {
                                        let _node_rl_ent = null;
                                        let _sel_rl_ent = () => _node_rl_ent = $sel.get("rl_ent");

                                        return _locateBtn() && _launch();

                                        // tool function(s) //

                                        function _locateBtn() {
                                            let _max = 8;
                                            while (_max--) {
                                                if (waitForAction(_sel_rl_ent, 1500)) return true;
                                                if ($sel.get("alipay_home")) {
                                                    debugInfo(["检测到支付宝主页页面", "尝试进入蚂蚁森林主页"]);
                                                    $app.page.af.home();
                                                } else if ($sel.get("rl_title")) {
                                                    debugInfo(["检测到好友排行榜页面", "尝试关闭当前页面"]);
                                                    $app.page.back();
                                                } else {
                                                    debugInfo(["未知页面", "尝试关闭当前页面"]);
                                                    keycode(4, "double");
                                                }
                                            }
                                            if (_max >= 0) {
                                                debugInfo("定位到\"查看更多好友\"按钮");
                                                return true;
                                            }
                                            messageAction("定位\"查看更多好友\"超时", 3, 1, 0, 1);
                                        }

                                        function _launch() {
                                            let trigger = () => widgetClick() || swipeClick();

                                            return this._launcher(trigger);

                                            // tool function(s) //

                                            function widgetClick() {
                                                let _cA = () => clickAction(_node_rl_ent, "w");
                                                let _cB = () => waitForAction(() => !_sel_rl_ent(), 800);

                                                return _cA() && _cB();
                                            }

                                            function swipeClick() {
                                                debugInfo("备份方案点击\"查看更多好友\"");

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
                                    if (no_bak) continue;
                                    _checker = () => this._getClickable(fs[i]);
                                }
                                let _node = _checker();
                                if (_node) return clickAction(_node, "w");
                            }
                        },
                        _plansLauncher: function (aim, plans_arr, shared_opt) {
                            let _aim = $app.page._plans.launch[aim];
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

                                if (_func.bind(_aim)(_params)) return true;
                            }
                        },
                        autojs: {
                            _pickupTitle: (rex) => $sel.pickup([rex, {
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
                                return $sel.pickup(idMatches(/.*action_(log|search)/));
                            },
                            get is_fg() {
                                return $sel.pickup(["Navigate up", {className: "ImageButton"}])
                                    || this.is_home || this.is_log || this.is_settings
                                    || $sel.pickup(idMatches(/.*md_\w+/));
                            },
                            spring_board: {
                                on: () => $cfg.app_launch_springboard === "ON",
                                employ: function () {
                                    if (!this.on()) return false;

                                    debugInfo("开始部署启动跳板");

                                    let _aj_name = $app.cur_autojs_name;
                                    let _res = launchThisApp($app.cur_autojs_pkg, {
                                        app_name: _aj_name,
                                        debug_info_flag: false,
                                        no_message_flag: true,
                                        first_time_run_message_flag: false,
                                        condition_ready: $app.page.autojs.is_fg,
                                    });

                                    if (_res) {
                                        debugInfo("跳板启动成功");
                                        return true;
                                    }
                                    debugInfo("跳板启动失败", 3);
                                    debugInfo(">打开" + _aj_name + "应用超时", 3);
                                },
                                remove: function () {
                                    if (!this.on()) return;

                                    if (!$flag.alipay_closed) {
                                        return debugInfo(["跳过启动跳板移除操作", ">支付宝未关闭"]);
                                    }

                                    let _isFg = () => $app.page.autojs.is_fg;
                                    let _isHome = () => $app.page.autojs.is_home;
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
                                        let _aj_name = $app.cur_autojs_name;
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
                                        } = $app.init_autojs_state;

                                        if (!init_fg) return _remove(_isFg, _back2);

                                        if (!init_home) {
                                            if (init_log) return _restore("console");
                                            if (init_settings) return _restore("settings");
                                            return _remove(_isHome, _back2);
                                        }

                                        return debugInfo("无需移除启动跳板");
                                    }
                                },
                            },
                        },
                        alipay: {
                            home: function (par) {
                                return launchThisApp($app.pkg_name, Object.assign({
                                    app_name: "支付宝",
                                    no_message_flag: true,
                                    condition_ready: () => {
                                        let _pg = $app.page;
                                        _pg.disPermissionDiag();
                                        _pg.close("no_bak") || _pg.back();
                                        return _pg.alipay.isInPage();
                                    },
                                }, par || {}));
                            },
                            close: function () {
                                debugInfo("关闭支付宝");

                                let _pkg = $app.pkg_name;
                                let _res = killThisApp(_pkg, {shell_acceptable: true});

                                if (!_res) return debugInfo("支付宝关闭超时", 3);

                                debugInfo("支付宝关闭完毕");
                                return $flag.alipay_closed = true;
                            },
                            isInPage: function () {
                                return $sel.get("alipay_home");
                            },
                        },
                        af: {
                            home: function (plans_arr) {
                                return this.launch(plans_arr);
                            },
                            launch: function (plans_arr, shared_opt) {
                                $app.page.autojs.spring_board.employ();

                                // TODO loadFromConfig
                                let _plans = plans_arr || ["intent", "click_btn", "search_kw"];
                                let _shared_opt = shared_opt || {};
                                let _res = $app.page._plansLauncher("af", _plans, _shared_opt);

                                $app.monitor.mask_layer.start();

                                return _res;
                            },
                            close: function () {
                                debugInfo("关闭全部蚂蚁森林相关页面");

                                timeRecorder("close_af_win");
                                let _cA = () => $sel.get("af_title");
                                let _cB = () => $sel.get("rl_title");
                                let _cC = () => $sel.pickup([/浇水|发消息/, {className: "Button"}]);
                                let _cD = () => $sel.get("login_new_acc");
                                let _tOut = () => timeRecorder("close_af_win", "load") >= 10000;
                                let _cond = () => _cA() || _cB() || _cC() || _cD();

                                while (_cond() && !_tOut()) {
                                    $app.page.keyBack();
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
                            launch: function (plans_arr, shared_opt) {
                                // TODO split from alipay spring board
                                $app.page.autojs.spring_board.employ();

                                // TODO loadFromConfig
                                let _plans = plans_arr || ["intent", "click_btn"];
                                let _shared_opt = shared_opt || {};

                                return $app.page._plansLauncher("rl", _plans, _shared_opt);
                            },
                            backTo: function () {
                                let _rl = $app.page.rl;

                                if (_rl.isInPage()) return true;

                                let _max = 3;
                                while (_max--) {
                                    $app.page.back();
                                    if (waitForAction(_rl.isInPage, 2000)) {
                                        return true;
                                    }
                                    debugInfo("返回排行榜单次超时");
                                }

                                let _str_b1 = "返回排行榜失败";
                                let _str_b2 = "尝试重启支付宝到排行榜页面";
                                debugInfo([_str_b1, _str_b2], 3);
                                $app.page.af.home();
                                $af.fri.launch();
                            },
                            isInPage: function () {
                                let _rl = $app.page.rl;
                                let _ident = _rl.page_ident;
                                return _ident && _checkRlPageIdent() || _checkTitleSel();

                                // tool function(s) //

                                function _checkTitleSel() {
                                    let _node = null;
                                    let _sel = () => _node = $sel.get("rl_title");

                                    return _sel() ? _rl.savePageIdent(_node) : null;
                                }

                                function _checkRlPageIdent() {
                                    let _ident = _rl.page_ident;
                                    if (images.isRecycled(_ident)) {
                                        if (_checkTitleSel()) {
                                            _ident = _rl.savePageIdent(); // re-capture
                                            return true;
                                        }
                                        return false;
                                    }
                                    return images.findImage(_rl.capt(), _ident);
                                }
                            },
                            capt: function () {
                                images.reclaim(this._capt);
                                return this.capt_img = images.capt();
                            },
                            savePageIdent: function (node) {
                                let _cached_coord = this.cached_pg_idt_coord;

                                if (!_cached_coord && !node) {
                                    messageAction("无法采集排行榜页面标识样本", 4, 1, 0, -1);
                                    messageAction("缺少必要的采集参量", 9, 1, 1, 1);
                                }

                                let _scr_capt = this.capt();
                                let _b = node => node.bounds();
                                let _coord = node
                                    ? [0, _b(node).top, W - 3, _b(node).height()]
                                    : _cached_coord;
                                let _par = [_scr_capt].concat(_coord);

                                this.cached_pg_idt_coord = _coord;
                                return this.page_ident = images.clip.apply({}, _par);
                            },
                        },
                        fri: {
                            isInPage: function () {
                                // TODO icon or images match
                                return $sel.pickup(/你收取TA|发消息/);
                            },
                            getReady: function () {
                                $app.monitor.reload_btn.start();

                                let _max = 2 * 60000;
                                let _max_b = _max;
                                let _itv = 200;

                                while (!this.isInPage() && _max > 0) {
                                    let _ratio = $sel.get("wait_awhile") ? 1 : 6;
                                    _max -= _itv * _ratio;
                                    sleep(_itv);
                                }

                                let _sec = (_max_b - _max) / 1000;
                                if (_sec >= 6) {
                                    debugInfo("进入好友森林时间较长: " + _sec.toFixed(2) + "秒");
                                }

                                $app.monitor.reload_btn.interrupt();

                                if (_max <= 0) {
                                    return messageAction("进入好友森林超时", 3, 1);
                                }

                                let _balls_len = 0;
                                let _ballsReady = () => {
                                    return _balls_len = $af.eballs().length;
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
                            let _cA = () => $cfg.kill_when_done_switch;
                            let _cB1 = () => $cfg.kill_when_done_intelligent;
                            let _cB2 = () => $app.init_fg_pkg !== $app.pkg_name;
                            let _cB = () => _cB1() && _cB2();

                            if (_cA() || _cB()) {
                                return this.alipay.close();
                            }

                            if (!$cfg.kill_when_done_keep_af_pages) {
                                return this.af.close();
                            }
                        },
                        disPermissionDiag: function () {
                            let _sel_btn_cfm = () => $sel.pickup(idMatches(/.*btn_confirm/));
                            let _sel_allow = () => $sel.pickup(/[Aa][Ll]{2}[Oo][Ww]|允许/);

                            let _max = 10;
                            let condition = () => _sel_btn_cfm() || _sel_allow();
                            while (condition() && _max--) {
                                clickAction(condition(), "w");
                                sleep(500);
                            }
                        },
                    };
                    $app.tool = {
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

                    return setter;
                },
                init: function () {
                    $app.init_autojs_state = {
                        init_fg: $app.page.autojs.is_fg,
                        init_home: $app.page.autojs.is_home,
                        init_log: $app.page.autojs.is_log,
                        init_settings: $app.page.autojs.is_settings,
                    };

                    return setter;
                }
            };

            return setter;
        }

        function accSetter() {
            return {
                setParams: function () {
                    Object.assign($acc, {
                        switch: $cfg.account_switch,
                        user_list: {
                            _plans: {
                                intent: () => {
                                    return app.startActivity($app.intent.acc_man);
                                },
                                pipeline: () => {
                                    $app.page.alipay.home({debug_info_flag: false});

                                    return clickActionsPipeline([
                                        [["我的", "p1"], "widget"],
                                        [["设置", {clickable: true}], "widget"],
                                        [["换账号登录", null]],
                                    ]);
                                },
                            },
                            launch: function (plans_arr) {
                                debugInfo("打开\"账号切换\"页面");

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
                                return messageAction("进入\"账号切换\"页面失败", 4, 1, 0, "both_dash");
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
                                let _cur_abbr = $sel.pickup([_kw, "s-1c0c0"], "txt");
                                // abbr of param "name_str"
                                let _name_abbr = this.getAbbrFromList(name_str);
                                // let _is_logged_in = $acc.isMatchAbbr(name_str, _cur_abbr);
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
                                let _nodes = $sel.pickup(/.+\*{3,}.+/, "nodes");

                                for (let i = 0, len = _nodes.length; i < len; i += 1) {
                                    let _node = _nodes[i];
                                    let _abbr_name = $sel.pickup(_node, "txt");
                                    if ($acc.isMatchAbbr(name_str, _abbr_name)) {
                                        return _abbr_name;
                                    }
                                }
                            },
                            isInPage: function () {
                                return $acc.isInSwAccPg();
                            },
                            makeInPage: function (force) {
                                if (!force && this.isInPage()) return true;
                                return this.launch();
                            },
                            getAbbrFromList: function (name_str) {
                                return this.isInList(name_str) || "";
                            },
                        },
                        _codec: function (str, opr) {
                            if (!str) return "";
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
                                    if (!$acc.init_logged_in_usr) {
                                        debugInfo("记录初始登录账户缩略名");
                                        $acc.init_logged_in_usr = _abbr;

                                        if ($acc.main.isMain(name_str) && _is_logged_in) {
                                            $flag.init_logged_in_main = true;
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
                            return $sel.get("login_other_acc")
                                || $sel.get("input_lbl_acc")
                                || $sel.get("login_other_mthd_init_pg");
                        },
                        isInSwAccPg: function () {
                            return $sel.get("login_new_acc")
                                || $sel.get("acc_sw_pg_ident");
                        },
                        isMatchAbbr: function (name_str, abbr) {
                            name_str = name_str.toString();
                            abbr = abbr.toString();

                            if (!name_str || !abbr) return false;

                            let [i, j, k] = [0, name_str.length - 1, abbr.length - 1];
                            let _same = (p, q) => name_str[p] === abbr[q];
                            let _isAbbrStar = q => abbr[q] === "*";

                            for (; i <= j; i += 1) {
                                if (_same(i, i)) continue;
                                if (!_isAbbrStar(i)) return false;
                                break;
                            }

                            if (i > j) return true;

                            for (; j > i, k > i; j -= 1, k -= 1) {
                                if (_same(j, k)) continue;
                                if (!_isAbbrStar(k)) return false;
                                break;
                            }

                            return !!abbr.slice(i, k + 1).match(/^\*+$/);
                        },
                        /**
                         * @param usr_inf {object}
                         * @param [usr_inf.abbr] {string} -- abbr username
                         * @param [usr_inf.name] {string} -- full username without encryption
                         * @param [usr_inf.name_raw] {string} -- encrypted username
                         * @param [usr_inf.code_raw] {string} -- encrypted code
                         * @param [usr_inf.direct] {boolean} -- directly login (skipping account list check)
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

                                return direct ? true : $acc.user_list.makeInPage();
                            }

                            function _parse() {
                                this.abbr = usr_inf.abbr;
                                this.name = usr_inf.name;
                                this.code_raw = usr_inf.code_raw;

                                if (!this.name) {
                                    let _raw = usr_inf.name_raw;
                                    if (_raw) this.name = $acc.decode(_raw);
                                }

                                if (!usr_inf.direct) {
                                    if (!this.abbr) {
                                        this.abbr = $acc.user_list.parse(this.name).abbr;
                                    }
                                }

                                return true;
                            }

                            function _login() {
                                let _this = this;
                                let _name_str = _this.abbr || _this.name;
                                let _loggedIn = () => $acc.isLoggedIn(_name_str);

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
                                        if (_loggedIn()) return true;

                                        let _conds = {
                                            name: "列表快捷切换账户",
                                            time: 1, // 1 min
                                            wait: [{
                                                remark: "登录中进度条",
                                                cond: () => $sel.pickup(className("ProgressBar")),
                                            }],
                                            success: [{
                                                remark: "支付宝首页",
                                                cond: () => $sel.get("alipay_home"),
                                            }, {
                                                remark: "H5关闭按钮",
                                                cond: () => $sel.get("close_btn"),
                                            }],
                                            fail: [{
                                                remark: "出现登录页面",
                                                cond: $acc.isInLoginPg,
                                            }],
                                            timeout_review: [{
                                                remark: "强制账号列表检查",
                                                cond: _loggedIn,
                                            }]
                                        };

                                        for (let i = 0; i < 3; i += 1) {
                                            debugInfo((i ? "再次尝试" : "") + "点击列表中的账户");
                                            clickAction($sel.pickup([_this.abbr, "p5"]), "w");

                                            debugInfo("开始监测账户切换结果");
                                            if (!_condChecker(_conds)) return false;
                                            if (_loggedIn()) return true;
                                        }
                                    }
                                }

                                function _byInputText() {
                                    let _err_msg = () => $sel.get("login_err_msg");
                                    let _err_ens = () => $sel.get("login_err_ensure");

                                    return _ready() && _login() && _check();

                                    // tool function(s) //

                                    function _ready() {
                                        if (!$$str(_this.name)) return;

                                        let _cond = () => {
                                            let _ok = $sel.pickup(/好的|OK/);
                                            if ($sel.get("acc_logged_out")) {
                                                clickAction(_ok, "w");
                                            }
                                            return $acc.isInLoginPg() || $acc.isInSwAccPg();
                                        };

                                        if (!waitForAction(_cond, 3000)) {
                                            return messageAction("无法判断当前登录页面状态", 4, 1, 0, "both");
                                        }

                                        if (!$acc.isInLoginPg()) {
                                            let _node = $sel.get("login_new_acc");
                                            if (!clickAction($sel.pickup([_node, "p4"]), "w")) {
                                                app.startActivity($app.intent.acc_login);
                                            }
                                        }

                                        return _clickOtherBtnIFN();

                                        // tool function(s) //

                                        function _clickOtherBtnIFN() {
                                            let _acc, _lbl, _mthd;
                                            let _a = () => _acc = $sel.get("login_other_acc");
                                            let _m = () => _mthd = $sel.get("login_other_mthd_init_pg");
                                            let _lb = () => _lbl = $sel.get("input_lbl_acc");

                                            waitForAction(() => _a() || _m() || _lb(), 3000);

                                            if (_acc) {
                                                debugInfo("点击\"换个账号登录\"按钮");
                                                clickAction(_acc, "w");
                                            } else if (_mthd) {
                                                debugInfo("点击\"其他登录方式\"按钮");
                                                clickAction(_mthd, "w");
                                            }

                                            return waitForAction(_lb, 3000); // just in case
                                        }
                                    }

                                    function _login() {
                                        let _lbl_code = () => $sel.get("input_lbl_code");

                                        return _inputName(_this.name) && _inputCode(_this.code_raw);

                                        // tool function(s) //

                                        function _inputName(name) {
                                            debugInfo("尝试完成账户名输入");

                                            return _input() && _next();

                                            // tool function(s) //

                                            function _input() {
                                                let _inputted = () => $sel.pickup(name);
                                                let _node_lbl_acc = null;
                                                let _sel_lbl_acc = () => _node_lbl_acc = $sel.get("input_lbl_acc");
                                                let _cA = () => waitForAction(_inputted, 1000);
                                                let _cB = () => !waitForAction(() => !_inputted(), 500, 100);
                                                let _max = 3;

                                                while (_max--) {
                                                    if (waitForAction(_sel_lbl_acc, 1500)) {
                                                        debugInfo("找到\"账号\"输入项控件");
                                                        let _node = $sel.pickup([_node_lbl_acc, "p2c1"]);
                                                        let _res = false;
                                                        if (_node) {
                                                            debugInfo("布局树查找可编辑\"账号\"控件成功");
                                                            _res = _node.setText(name);
                                                        } else {
                                                            debugInfo("布局树查找可编辑\"账号\"控件失败", 3);
                                                            debugInfo("尝试使用通用可编辑控件", 3);
                                                            let _edit = className("EditText").findOnce();
                                                            _res = _edit && _edit.setText(name);
                                                        }
                                                        debugInfo("控件输入账户名" + (_res ? "成功" : "失败"), _res ? 0 : 3);
                                                    } else {
                                                        messageAction("布局查找\"账号\"输入项控件失败", 3, 0, 0, "up_dash");
                                                        messageAction("尝试盲输", 3, 0, 0, "dash");
                                                        setText(0, name);
                                                    }
                                                    if (_cA() && _cB()) break;
                                                }

                                                if (_max >= 0) {
                                                    debugInfo("成功输入账户名");
                                                    return true;
                                                }

                                                messageAction("输入账户名后检查输入未通过", 4, 1, 0, "both_dash");
                                            }

                                            function _next() {
                                                return _require() && _click() && _check();

                                                // tool function(s) //

                                                function _require() {
                                                    let _str_a = "无需点击\"下一步\"按钮";

                                                    if (_lbl_code()) {
                                                        let _str_b = ">存在\"密码\"输入项控件";
                                                        return debugInfo([_str_a, _str_b]);
                                                    }

                                                    if ($sel.get("login_btn")) {
                                                        let _str_b = ">存在\"登录\"按钮控件";
                                                        return debugInfo([_str_a, _str_b]);
                                                    }

                                                    return true;
                                                }

                                                function _click() {
                                                    debugInfo("点击\"下一步\"按钮");

                                                    let _sel = () => $sel.get("login_next_step");
                                                    let _sel_p1 = $sel.pickup([_sel(), "p1"]);

                                                    return clickAction(_sel_p1, "w", {
                                                        max_check_times: 3,
                                                        check_time_once: 500,
                                                        condition_success: () => !_sel(),
                                                    });
                                                }

                                                function _check() {
                                                    let _try_agn = () => $sel.pickup(/重新输入|Try again/);
                                                    let _oth_mthd = () => $sel.get("login_other_mthd");
                                                    let _by_code = () => $sel.get("login_by_code");
                                                    let _cond = () => _lbl_code() || _oth_mthd() || _err_ens() || _try_agn();

                                                    if (waitForAction(_cond, 8000)) {
                                                        let _max = 3;
                                                        while (_max--) {
                                                            if (waitForAction(_lbl_code, 1500)) {
                                                                debugInfo("找到\"密码\"输入项控件");
                                                                return true;
                                                            }
                                                            if (_err_ens() || _try_agn()) {
                                                                messageAction("登录失败", 4, 1, 0, -1);
                                                                messageAction("失败提示信息:" + _err_msg(), 8, 0, 1, 1);
                                                            }
                                                            if (_oth_mthd()) {
                                                                debugInfo("点击\"换个方式登录\"按钮");
                                                                clickAction(_oth_mthd(), "w");
                                                                if (!waitForAction(_by_code, 2000)) {
                                                                    let _str = "未找到\"密码登录\"按钮";
                                                                    return messageAction(_str, 4, 1, 0, "both_dash");
                                                                }
                                                                debugInfo("点击\"密码登录\"按钮");
                                                                clickAction(_by_code().parent(), "w");
                                                            }
                                                        }
                                                    }

                                                    return messageAction("查找\"密码\"输入项控件超时", 4, 1, 0, "both_dash");
                                                }
                                            }
                                        }

                                        function _inputCode(code_raw) {
                                            debugInfo("尝试完成密码输入");

                                            return code_raw ? inputAutomatically() : inputManually();

                                            // tool function(s) //

                                            function inputAutomatically() {
                                                debugInfo("尝试自动输入密码");

                                                let decrypt = new (require("./Modules/MODULE_PWMAP"))().pwmapDecrypt;
                                                if ($sel.pickup([_lbl_code(), "p2c1"]).setText(decrypt(code_raw))) {
                                                    debugInfo("布局树查找可编辑\"密码\"控件成功");
                                                } else {
                                                    debugInfo("布局树查找可编辑\"密码\"控件失败", 3);
                                                    debugInfo("尝试使用通用可编辑控件", 3);
                                                    let edit_text_node = className("EditText").findOnce();
                                                    let input_result = edit_text_node && edit_text_node.setText(decrypt(code_raw));
                                                    debugInfo("通用可编辑控件输入" + (input_result ? "成功" : "失败"), input_result ? 0 : 3);
                                                }

                                                debugInfo("点击\"登录\"按钮");
                                                if (!clickAction($sel.get("login_btn"), "w")) {
                                                    return messageAction("输入密码后点击\"登录\"失败", 4, 1, 0, "both_dash");
                                                }
                                            }

                                            function inputManually() {
                                                debugInfo("需要手动输入密码");
                                                vibrateDevice(0, 0.1, 0.3, 0.1, 0.3, 0.2);

                                                let _user_tt = 2; // min
                                                let _btn_tt = 2; // min
                                                let _res = false;

                                                let _max = ~~(_user_tt + _btn_tt) * 60000;
                                                $flag.glob_e_scr_paused = true;
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
                                                                        "等待用户响应\"需要密码\"对话框",
                                                                        ">最大超时时间: " + _user_tt + "分钟"
                                                                    ]);

                                                                    let _cA = () => _d.isCancelled();
                                                                    let _cAN = () => !_d.isCancelled();
                                                                    let _cB = () => !waitForAction(_cAN, 2000);
                                                                    let _cond = () => _cA() && _cB();

                                                                    if (!waitForAction(_cond, _user_tt * 60000)) {
                                                                        device.cancelOn();
                                                                        _d.dismiss();
                                                                        messageAction("脚本无法继续", 4, 0, 0, -1);
                                                                        messageAction("登录失败", 4, 0, 1);
                                                                        messageAction("需要密码时等待用户响应超时", 9, 1, 1, 1);
                                                                    }
                                                                },
                                                                button: () => {
                                                                    debugInfo([
                                                                        "等待用户点击\"登录\"按钮",
                                                                        ">最大超时时间: " + _btn_tt + "分钟"
                                                                    ]);

                                                                    let _cA = () => !$sel.get("login_btn");
                                                                    let _rex = /.*confirmSetting|.*mainTip|.*登录中.*|.*message/;
                                                                    let _cT1 = () => $sel.pickup(_rex);
                                                                    let _cT2 = () => _cT1() || _err_ens();
                                                                    let _cB = () => !waitForAction(_cT2, 500);
                                                                    let _cond = () => _cA() && _cB();

                                                                    if (!waitForAction(_cond, _btn_tt * 60000)) {
                                                                        device.cancelOn();
                                                                        _d.dismiss(); // just in case
                                                                        messageAction("脚本无法继续", 4, 0, 0, -1);
                                                                        messageAction("登录失败", 4, 0, 1);
                                                                        messageAction("等待\"登录\"按钮消失超时", 9, 1, 1, 1);
                                                                    }
                                                                },
                                                                flag: () => _res = true,
                                                            };
                                                        }
                                                    });
                                                });

                                                while (!_res) sleep(500);

                                                let _outer = Math.pow(10, 7);
                                                click(_outer, _outer);
                                                delete $flag.glob_e_scr_paused;
                                                device.cancelOn();

                                                return true;
                                            }
                                        }
                                    }

                                    function _check() {
                                        let conditions = {
                                            name: "登录账户",
                                            time: 0.5, // 30 sec
                                            wait: [{
                                                remark: "登录中进度条",
                                                cond: () => $sel.pickup(/.*登录中.*/),
                                            }],
                                            success: [{
                                                remark: "支付宝首页",
                                                cond: () => $sel.get("alipay_home"),
                                            }, {
                                                remark: "H5关闭按钮",
                                                cond: () => $sel.get("close_btn"),
                                            }, {
                                                remark: "支付宝设置页面",
                                                cond: () => $sel.pickup(/(退出|换账号)登录/),
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
                                                cond: () => $sel.pickup(/.*confirmSetting|.*mainTip/),
                                                feedback: () => {
                                                    device.cancelOn();
                                                    messageAction("脚本无法继续", 4, 0, 0, -1);
                                                    messageAction("登录失败", 4, 1, 1);
                                                    messageAction("失败提示信息:" + $sel.pickup(/.*mainTip/, "txt"), 9, 0, 1, 1);
                                                },
                                            }],
                                            timeout_review: [{
                                                remark: "强制账号列表检查",
                                                cond: () => {
                                                    if ($acc.isLoggedIn(_this.name)) return true;
                                                    messageAction("脚本无法继续", 4, 0, 0, -1);
                                                    messageAction("切换主账户超时", 9, 1, 1, 1);
                                                },
                                            }]
                                        };

                                        return _condChecker(conditions);
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
                                            if (!cond_arr) return;

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
                                    delete $flag.acc_logged_out;

                                    return true;
                                }
                            }
                        },
                    });

                    return this;
                },
                setMain: function () {
                    $acc.main = {
                        _avatar: {
                            _path: $app.local_pics_path + "main_user_mini_avatar_clip.png",
                            check: function (path) {
                                if ($flag.acc_logged_out) {
                                    return debugInfo(["跳过主账户头像检查", ">检测到账户登出状态"]);
                                }

                                let _img = images.read(path || this._path);
                                let _res;

                                timeRecorder("avt_chk");
                                _res = _img && _check.bind(this)(_img);
                                $app.avatar_checked_time = timeRecorder("avt_chk", "load");

                                if (_res) {
                                    debugInfo(["当前账户符合主账户身份", ">本地主账户头像匹配成功"]);
                                    $flag.init_logged_in_main = true;
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

                                waitForAction(() => _b = _getAvtPos(), 3000, 100);

                                if (!_b || $$emptyObj(_b)) {
                                    messageAction("无法获取当前头像样本", 3);
                                    return messageAction("森林主页头像控件定位失败", 3, 1);
                                }

                                let [l, t, w, h] = [_b.left, _b.top, _b.width(), _b.height()];
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
                                    let _stg = {
                                        kw_my_tree_plant_plan: t => $sel.pickup("我的大树养成记录", t),
                                        kw_user_energy: t => $sel.pickup([idMatches(/.*user.+nergy/), "p2c0"], t),
                                        kw_plant_tree_btn: t => $sel.pickup(["种树", {className: "Button"}, "p1c0"], t),
                                        kw_home_panel: t => $sel.pickup([idMatches(/.*home.*panel/), "c0c0c0"], t),
                                    };
                                    let _keys = Object.keys(_stg);
                                    for (let i = 0, len = _keys.length; i < len; i += 1) {
                                        let _node = _stg[_keys[i]]();
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
                            if (!$acc.switch) return debugInfo("账户功能未开启");
                            if (!this.name_raw) return debugInfo("主账户用户名未设置");
                            return true;
                        },
                        name_raw: $cfg.main_account_info.account_name,
                        code_raw: $cfg.main_account_info.account_code,
                        isMain: function (name_str) {
                            return $acc.isMatchAbbr(name_str, $acc.decode(this.name_raw));
                        },
                        login: function (par) {
                            if (!this._avail()) return;
                            if (this._avatar.check()) return true;

                            if (_loginMain.bind(this)()) {
                                $app.page.af.home();
                                this._avatar.save();
                                return true;
                            }

                            messageAction("强制停止脚本", 4, 0, 0, -1);
                            messageAction("主账户登录失败", 9, 1, 1, 1);

                            // tool function(s) //

                            function _loginMain() {
                                return $acc.login(Object.assign({
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
        let {my_engine, my_engine_id} = $app;
        let _excl_tag = "exclusive_task";
        let _ts_tag = "launch_timestamp";
        my_engine.setTag(_excl_tag, "af");
        my_engine.setTag(_ts_tag, $app.ts);

        let bomb = bombSetter();
        bomb.trigger() && bomb.explode();

        let queue = queueSetter();
        queue.trigger() && queue.queue();

        $init.queue = {bomb: bomb, queue: queue};

        return $init;

        // tool function(s) //

        function bombSetter() {
            return {
                trigger: () => {
                    try {
                        return engines.all().filter((e) => {
                            let _gap = $app.ts - e.getTag(_ts_tag);
                            return e.getTag(_excl_tag) === "af"
                                && my_engine_id > e.id
                                && _gap < $cfg.min_bomb_interval_global;
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
                                return e.getTag(_excl_tag) && e.id < my_engine_id;
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
                    timeRecorder("script_queue");
                    timeRecorder("script_queue_total");

                    let _init_que_len = this.excl_tasks_len;
                    let _que_len = _init_que_len;
                    let _sto_max_que_time = $cfg.max_queue_time_global;
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
                            timeRecorder("script_queue", "save"); // refresh
                        }
                        if (timeRecorder("script_queue", "load", 60000) >= _max_queue_time) {
                            this.excl_tasks.forEach(e => e.forceStop());
                            debugInfo(["强制停止队前所有排他性任务", ">" + "已达最大排队等待时间"]);
                        }
                        sleep(Math.rand([500, 1500]));
                    }

                    debugInfo("任务排队用时: " + timeRecorder("script_queue_total", "load", "auto"), "Up");
                },
            };
        }
    },
    delay: function () {
        let fg_app_blist = fgAppBlistSetter();
        fg_app_blist.trigger() ? fg_app_blist.autoDelay() : fg_app_blist.clear();

        return $init;

        // tool function(s) //

        function fgAppBlistSetter() {
            return {
                trigger: function () {
                    return _screenOn() && _inBlist();

                    // tool function(s) //

                    function _screenOn() {
                        if ($dev.is_screen_on) return true;
                        debugInfo(["跳过前置应用黑名单检测", ">屏幕未亮起"]);
                    }

                    function _inBlist() {
                        let fg_app_blist = $cfg.foreground_app_blacklist || [];
                        let init_pkg = $app.init_fg_pkg;
                        for (let i = 0, len = fg_app_blist.length; i < len; i += 1) {
                            let [name, pkg] = fg_app_blist[i].app_combined_name.split("\n");
                            if (init_pkg === pkg) return $app.fg_black_app = name;
                        }
                        debugInfo(["前置应用黑名单检测通过:", $app.init_fg_pkg]);
                    }
                },
                autoDelay: function () {
                    messageAction("前置应用位于黑名单中:", 1, 0, 0, -1);
                    messageAction($app.fg_black_app, 1);

                    let {continuous_times, delay_time, delay_time_sum} = delayInfoSetter();
                    if (continuous_times === 1) {
                        messageAction("本次任务自动推迟运行", 1);
                    } else {
                        messageAction("本次任务自动推迟: " + delay_time + "分钟", 1);
                        messageAction("当前连续推迟次数: " + continuous_times, 1);
                        messageAction("当前连续推迟总计: " + delay_time_sum + "分钟", 1);
                    }

                    $sto.af.put("fg_blist_hit_accu_times", continuous_times);
                    $app.setPostponedTask(delay_time, false); // `exit()` contained
                    exit(); // thoroughly prevent script from going on (main thread)

                    // tool function(s) //

                    function delayInfoSetter(minutes) {
                        minutes = minutes || [1, 1, 2, 3, 5, 8, 10];
                        let accu_hit_times = $sto.af.get("fg_blist_hit_accu_times", 0);
                        let max_minute = minutes[minutes.length - 1];
                        let delay_time = minutes[accu_hit_times] || max_minute;
                        let delay_time_sum = 0;
                        for (let i = 0; i < accu_hit_times; i += 1) {
                            delay_time_sum += minutes[i] || max_minute;
                        }
                        return {
                            continuous_times: accu_hit_times + 1,
                            delay_time: delay_time,
                            delay_time_sum: delay_time_sum,
                        };
                    }
                },
                clear: () => $sto.af.remove("fg_blist_hit_accu_times"),
            }
        }
    },
    prompt: function () {
        let script_config = scriptConfigSetter();
        script_config.trigger() && script_config.prompt();

        let before_running = beforeRunningSetter();
        before_running.trigger() && before_running.prompt();

        return $init;

        // tool function(s) //

        function scriptConfigSetter() {
            return {
                trigger: () => {
                    if (!$sto.af.get("config_prompted")) {
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
                            debugInfo("用户" + (_box ? "已" : "没有") + "勾选\"不再提示\"");
                            debugInfo("用户点击\"" + _btn + "\"按钮");
                            return true;
                        };
                        let _diag_prompt = dialogs.builds([
                            "参数调整提示", "settings_never_launched",
                            0, "跳过", "现在配置", 1, 1
                        ]).on("negative", (d_self) => {
                            _btnMsg("negative") && _action.negBtn(d_self);
                        }).on("positive", (d_self) => {
                            _btnMsg("positive") && _action.posBtn(d_self);
                        });

                        return dialogs.disableBack(_diag_prompt);
                    }

                    function actionSetter() {
                        return {
                            _commonAct: function (d) {
                                let _box_checked = d.isPromptCheckBoxChecked();
                                d.dismiss();
                                $sto.af.put("config_prompted", _box_checked);
                                this._sgn_move_on = true;
                            },
                            posBtn: function (d) {
                                this._sgn_confirm = true;
                                this._commonAct(d);
                            },
                            negBtn: function (d) {
                                this._commonAct(d);
                            },
                            wait: function () {
                                if (!waitForAction(() => this._sgn_move_on, 300000)) {
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

        function beforeRunningSetter() {
            return {
                trigger: () => {
                    let _skip = "跳过\"运行前提示\"";
                    let _instant = ">检测到\"立即运行\"引擎参数";
                    if (!$cfg.prompt_before_running_switch) return debugInfo("\"运行前提示\"未开启");
                    if (!$dev.is_screen_on) return debugInfo([_skip, ">屏幕未亮起"]);
                    if (!$dev.isUnlocked()) return debugInfo([_skip, ">设备未解锁"]);
                    if ($app.my_engine_argv.instant_run_flag) return debugInfo([_skip, _instant]);
                    return true;
                },
                prompt: () => {
                    let _sec = +$cfg.prompt_before_running_countdown_seconds + 1;
                    let _diag = promptDialogSetter();
                    let _action = actionSetter();
                    let _thread_elapse = threads.starts(elapse);

                    _diag.show();
                    _action.wait();

                    // tool function(s) //

                    function promptDialogSetter() {
                        let _btnMsg = (btn_name) => {
                            let _btn = _diag_prompt.getActionButton(btn_name);
                            let _regexp = / *\[ *\d+ *] */;
                            debugInfo("用户点击\"" + _btn.replace(_regexp, "") + "\"按钮");
                            return true;
                        };
                        let _diag_prompt = dialogs.builds([
                            "运行提示", "\n即将在 " + _sec + " 秒内运行" + $app.task_name + "任务\n",
                            ["推迟运行", "warn_btn_color"],
                            ["放弃任务", "caution_btn_color"],
                            ["立即开始  [ " + _sec + " ]", "attraction_btn_color"],
                            1,
                        ]).on("positive", (d) => {
                            _btnMsg("positive") && _action.posBtn(d);
                        }).on("negative", (d) => {
                            _btnMsg("negative") && _action.negBtn(d);
                        }).on("neutral", (d) => {
                            _btnMsg("neutral") && _action.neuBtn(d);
                        });

                        return dialogs.disableBack(_diag_prompt, () => _action.pause(100));
                    }

                    function actionSetter() {
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
                                    messageAction("放弃" + $app.task_name + "任务", 1, 1, 0, "both");
                                    exit();
                                }).show();

                                // tool function(s) //

                                function getBuildsParam() {
                                    let _timed_task_len = timers.queryTimedTasks({path: $app.cwp}).length;
                                    let _title = ["注意", "title_caution_color"];
                                    let _quit_prefix = "当前未设置任何" + $app.task_name + "定时任务\n\n";
                                    let _quit = "确认要放弃本次任务吗";
                                    let _content = [_quit_prefix + _quit, "content_warn_color"];
                                    let _pos_btn = ["确认放弃任务", "caution_btn_color"];
                                    if (_timed_task_len) {
                                        _title = ["提示", "title_default_color"];
                                        _content = [_quit, "content_default_color"];
                                    }
                                    return [_title, _content, 0, "返回", _pos_btn, 1];
                                }
                            },
                            neuBtn: function (d) {
                                this.pause(300);

                                let _cfg = {
                                    get key_prefix() {
                                        return "prompt_before_running_postponed_minutes";
                                    },
                                    get sto_min() {
                                        return $cfg[this.key_prefix].toString();
                                    },
                                    set sto_min(v) {
                                        let _new = {};
                                        _new[this.key_prefix] = +v;
                                        $sto.af_cfg.put("config", _new);
                                        Object.assign($cfg, _new);
                                    },
                                    get def_choices() {
                                        let _src = $cfg[this.key_prefix + "_default_choices"];
                                        let _res = {};
                                        _src.forEach(_num => _res[_num] = _num + " min");
                                        return _res;
                                    },
                                    get user_min() {
                                        return $cfg[this.key_prefix + "_user"].toString();
                                    },
                                    set user_min(v) {
                                        let _new = {};
                                        _new[this.key_prefix + "_user"] = +v;
                                        $sto.af_cfg.put("config", _new);
                                        Object.assign($cfg, _new);
                                    }
                                };

                                if (+_cfg.sto_min) {
                                    d.dismiss();
                                    return $app.setPostponedTask(_cfg.sto_min);
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
                                    $app.setPostponedTask(_cfg.user_min);
                                }).show();
                            },
                            pause: function (interval) {
                                _thread_elapse.interrupt();
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
                                    _thread_elapse = _diag = null;
                                    messageAction("强制结束脚本", 4, 0, 0, -1);
                                    messageAction("等待运行提示对话框操作超时", 9, 1, 0, 1);
                                }
                            },
                        };
                    }

                    // thread function(s) //

                    function elapse() {
                        while (--_sec) {
                            let content_text = dialogs.getContentText(_diag);
                            _diag.setContent(content_text.replace(/\d+/, _sec));
                            let button_text = _diag.getActionButton("positive").replace(/ *\[ *\d+ *]$/, "");
                            _diag.setActionButton("positive", button_text + "  [ " + _sec + " ]");
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

        // monitors put on standby for $app invoking
        $app.monitor = standbyMonSetter();
        $app.monitor.insurance = _isu;

        return $init;

        // monitor function(s) //

        function insuranceMonSetter() {
            let keys = {
                ins_tasks: "insurance_tasks",
                ins_accu: "insurance_tasks_continuous_times",
                ins_accu_max: "timers_insurance_max_continuous_times",
                ins_itv: "timers_insurance_interval",
            };
            let self = {
                trigger: function () {
                    if (!$cfg.timers_switch) {
                        return debugInfo("定时循环功能未开启");
                    }
                    if (!$cfg.timers_self_manage_switch) {
                        return debugInfo("定时任务自动管理未开启");
                    }
                    if (!$cfg.timers_insurance_switch) {
                        return debugInfo("意外保险未开启");
                    }
                    if ($app.my_engine_argv.no_insurance_flag) {
                        return debugInfo(['跳过"意外保险"设置', '>检测到"无需保险"引擎参数']);
                    }
                    let _accu = this._sto_accu = this._sto_accu + 1;
                    let _max = $cfg[keys.ins_accu_max];
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
                    return +$sto.af.get(keys.ins_accu, 0);
                },
                set _sto_accu(v) {
                    $sto.af.put(keys.ins_accu, +v);
                },
                get _sto_ids() {
                    let _all = $sto.af.get(keys.ins_tasks, []);
                    return _all.filter(id => timers.getTimedTask(id));
                },
                get _next_task_time() {
                    return $app.ts + $cfg[keys.ins_itv] * 60000;
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
                    $sto.af.remove(keys.ins_tasks);

                    return self;
                },
                reset: function () {
                    this.clean();
                    this._sto_accu = 0;

                    return self;
                },
                deploy: function () {
                    this.task = timers.addDisposableTask({
                        path: $app.cwp,
                        date: this._next_task_time,
                    });

                    $sto.af.put(keys.ins_tasks, this._sto_ids.concat([this.task.id]));
                    debugInfo(["已设置意外保险定时任务:", "任务ID: " + this.task.id]);

                    return self;
                },
                monitor: function () {
                    this._thread = threads.starts(function () {
                        setInterval(() => {
                            self.task.setMillis(self._next_task_time);
                            timers.updateTimedTask(self.task);
                        }, 10000);
                    });

                    return self;
                },
                interrupt: function () {
                    let _thd = this._thread;
                    _thd && _thd.interrupt();

                    return self;
                }
            };

            return self;
        }

        function instantMonSetter() {
            return {
                maxRun: function () {
                    let max = +$cfg.max_running_time_global;

                    max && threads.starts(function () {
                        setTimeout(function () {
                            ui.post(() => messageAction("超时强制退出", 9, 1, 0, "both_n"));
                        }, max * 60000 + 3000);
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
                            $app.my_engine.forceStop();
                        });
                    });

                    return this;
                },
                globEvt: function () {
                    $flag.glob_e_trig_counter = 0;

                    let _constr = constrParamsSetter();

                    let phone_call_state = new Monitor("通话状态", "2 hr", _constr.phone);
                    phone_call_state.valid() && phone_call_state.monitor();

                    let screen_off = new Monitor("屏幕关闭", "2 min", _constr.screen);
                    screen_off.valid() && screen_off.monitor();

                    return this;

                    // constructor(s) //

                    /**
                     * @param [desc] {string} -- will show in console as the monitor name
                     * @param [limit=Infinity] {string|number} --
                     * @param params {object}
                     * @param [params.switching] {*} -- with string type, monitor may be disabled according to $cfg
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
                            let self = Object.assign({
                                onTriggerMsg: () => {
                                    let countdownMsg = function () {
                                        // keep _limit unchanged
                                        let _lmt = _limit;
                                        let _pref = "等待事件解除";
                                        let _tpl = u => _pref + " (最多" + +_lmt.toFixed(2) + u + ")";

                                        if ($$inf(_lmt)) return _pref;
                                        if (_lmt < 1000) return _tpl("毫秒");
                                        if ((_lmt /= 1000) < 60) return _tpl("秒");
                                        if ((_lmt /= 60) < 60) return _tpl("分钟");
                                        if ((_lmt /= 60) < 24) return _tpl("小时");

                                        return _lmt /= 24 && _tpl("天");
                                    };

                                    timeRecorder("glob_e" + _desc, "save");
                                    messageAction("触发" + _desc + "事件", 1, 1, 0, "up_dash");
                                    messageAction(countdownMsg(), 1, 0, 0, "dash");
                                },
                                onReleaseMsg: () => {
                                    messageAction("解除" + _desc + "事件", 1, 0, 0, "up_dash");
                                    let _str = timeRecorder("glob_e" + _desc, "load", "auto");
                                    messageAction("解除用时: " + _str, 1, 0, 1, "dash");
                                },
                                keepWaiting: function () {
                                    while (_trigger()) {
                                        let _elapsed = timeRecorder("glob_e" + _desc, "load");
                                        if (_elapsed >= _limit) {
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
                                        $flag.glob_e_trig_counter++;
                                        $$func(_onTrigger) && _onTrigger();
                                    };
                                },
                                get onRelease() {
                                    return () => {
                                        $$func(_onRelease) && _onRelease();
                                        $flag.glob_e_trig_counter--;
                                    };
                                },
                            });

                            threads.starts(function () {
                                let _handleTrigger = () => {
                                    self.onTrigger();
                                    self.onTriggerMsg();
                                    self.keepWaiting();
                                    self.onReleaseMsg();
                                    self.onRelease();
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
                            if (lmt.match(/h((ou)?rs?)?/)) return lmt.match(/\d+/)[0] * 3600000;
                            if (lmt.match(/m(in(utes?))?/)) return lmt.match(/\d+/)[0] * 60000;
                            if (lmt.match(/s(ec(conds?))?/)) return lmt.match(/\d+/)[0] * 1000;
                            if (lmt.match(/m(illi)?s(ec(conds?))?/)) return lmt.match(/\d+/)[0] * 1;
                            return Infinity;
                        }

                        function _handleSwitch(sw) {
                            if ($$bool(sw)) return sw;
                            if ($$str(sw)) return $cfg[sw];
                            return true;
                        }
                    }

                    // tool function(s) //

                    function constrParamsSetter() {
                        return {
                            phone: {
                                switch: "phone_call_state_monitor_switch",
                                trigger: function () {
                                    let self = {
                                        state_key: "phone_call_state_idle_value",
                                        get cur_state() {
                                            return $cfg[this.state_key];
                                        },
                                        set cur_state(value) {
                                            let data = {};
                                            data[this.state_key] = value;
                                            $cfg[this.state_key] = value;
                                            $sto.af_cfg.put("config", data);
                                        },
                                    };
                                    return phoneCallingState() !== getCurState();

                                    // tool function(s) //

                                    function getCurState() {
                                        let _cur_state = self.cur_state;
                                        if (!$$und(_cur_state)) return _cur_state;

                                        // won't write into storage
                                        _cur_state = phoneCallingState();

                                        let _sto = _stoSetter();
                                        return $$und(_sto.filled_up) ? _sto.fillIn() : _sto.reap();

                                        // tool function(s) //

                                        function _stoSetter() {
                                            return {
                                                get states() {
                                                    return $sto.af.get("phone_call_states", []);
                                                },
                                                set states(arr) {
                                                    $sto.af.put("phone_call_states", this.states.concat(arr));
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
                                                    $sto.af.remove("phone_call_states");
                                                    // write into storage and $cfg
                                                    return self.cur_state = _cur_state;
                                                },
                                            };
                                        }
                                    }
                                },
                                onRelease: () => {
                                    debugInfo('前置"支付宝"应用');
                                    app.launchPackage($app.pkg_name);
                                },
                            },
                            screen: {
                                trigger: () => {
                                    return $flag.dev_unlocked
                                        && !$flag.glob_e_scr_paused
                                        && !device.isScreenOn();
                                },
                                onTrigger: () => {
                                    if ($flag.glob_e_scr_privilege) {
                                        messageAction("允许脚本提前退出", 3, 1, 0, -1);
                                        messageAction("标识激活且屏幕关闭", 3, 0, 1, 1);
                                        exit();
                                    }
                                },
                                onRelease: () => {
                                    $flag.glob_e_trig_counter++;
                                    $dev.isLocked() && $dev.unlock();
                                    $flag.glob_e_trig_counter--;
                                },
                            },
                        };
                    }
                },
                logOut: function () {
                    threads.starts(function () {
                        debugInfo("已开启账户登出监测线程");

                        delete $flag.acc_logged_out;
                        while (1) {
                            if ($sel.getAndCache("acc_logged_out")) break;
                            if ($acc.isInLoginPg()) break;
                            sleep(500);
                        }
                        $flag.acc_logged_out = true;

                        messageAction("检测到账户登出状态", 1, 0, 0, -1);
                        messageAction($sel.cache.load("acc_logged_out")
                            ? "账户在其他地方登录"
                            : "需要登录账户", 1);
                        messageAction("尝试自动登录主账户", 1, 0, 0, 1);

                        if (!$acc.main.login({direct: true})) {
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
                                return () => $sel.pickup("关闭蒙层");
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

                                if (!_res) return debugInfo("关闭遮罩层失败", 3);

                                let _elapsed = timeRecorder("_mask_layer", "load", "auto");
                                debugInfo(["关闭遮罩层成功", "遮罩层关闭用时: " + _elapsed]);
                            },
                            dismiss: () => debugInfo("遮罩层监测线程结束"),
                        }
                    }
                }),
                // TODO ...
                rl_bottom: new Monitor("排行榜底部", function () {
                    while (sleep(500) || true) {
                        $impeded("排行榜底部监测线程");

                        if (!$sel.get("rl_end_ident")) continue;

                        let sel_str = $sel.get("rl_end_ident", "sel_str");
                        let {left, top, right, bottom} = $sel.get("rl_end_ident", "bounds") || {};
                        if (bottom - top > cX(0.08)) {
                            $flag.rl_bottom_rch = true;
                            debugInfo("列表底部条件满足");
                            debugInfo(">bounds: [" + left + ", " + top + ", " + right + ", " + bottom + "]");
                            debugInfo(">" + sel_str + ": " + $sel.get("rl_end_ident", sel_str));
                            let capt_img = images.capt();
                            let btn_clip = images.clip(capt_img, left, top, right - left - 3, bottom - top - 3);
                            if ($app.rank_list_bottom_template) {
                                images.reclaim($app.rank_list_bottom_template);
                                $app.rank_list_bottom_template = null;
                            }
                            images.save(
                                $app.rank_list_bottom_template = images.copy(btn_clip),
                                $app.rank_list_bottom_template_path
                            );
                            images.reclaim(capt_img, btn_clip);
                            capt_img = btn_clip = null;
                            debugInfo("已存储列表底部控件图片模板");
                            break;
                        }
                    }

                    return debugInfo("排行榜底部监测线程结束");
                }),
                reload_btn: new Monitor('"重新加载"按钮', function () {
                    let _sel = () => $sel.get("reload_fst_page");
                    let _click = () => clickAction(_sel(), "w");

                    while (sleep(1000) || true) {
                        _click() && sleep(2000);
                    }
                }),
            };

            // constructor(s) //

            function Monitor(name, thr_f) {
                let _thd = $app["_threads_" + name];
                this.start = () => {
                    if (_thd && _thd.isAlive()) return _thd;
                    _thd = null;
                    debugInfo("开启" + name + "监测线程");
                    return _thd = threads.starts(thr_f);
                };
                this.interrupt = () => {
                    if (!_thd) return;
                    debugInfo("结束" + name + "监测线程");
                    return _thd.interrupt();
                };
                this.isAlive = () => _thd && _thd.isAlive();
                this.join = t => _thd && _thd.join(t);
            }
        }
    },
    unlock: function () {
        if (!$dev.is_screen_on && !$cfg.auto_unlock_switch) {
            messageAction("脚本无法继续", 4, 0, 0, -1);
            messageAction("屏幕关闭且自动解锁功能未开启", 9, 1, 1, 1);
        }

        $dev.isLocked() ? $dev.unlock() : debugInfo("无需解锁");
        $flag.dev_unlocked = true;

        return $init;
    },
    command: function () {
        let cmd = cmdSetter();
        cmd.trigger() && cmd.exec();

        return $init;

        // tool function(s) //

        function cmdSetter() {
            return {
                cmd: $app.my_engine_argv.cmd,
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

                            return $app.page.rl.launch(null, {
                                task_name: "好友列表数据采集",
                                first_time_run_message_flag: false,
                            });
                        }

                        function _collect() {
                            $app.task_name = surroundWith("好友列表数据采集");
                            messageAction("正在采集好友列表数据", 1, 1, 0, "both");

                            let _thd_swipe = threads.starts(function () {
                                while (!$flag.rl_bottom_rch) {
                                    swipe(halfW, uH - 20, halfW, cY(0.2), 150);
                                }
                            });

                            let _thd_expand_lst = threads.starts(function () {
                                let aim = locatorSetter().locate();

                                aim.waitForStrMatch();
                                aim.waitForPosition();
                                aim.transmitSignal();

                                // tool function(s) //

                                function locatorSetter() {
                                    return {
                                        locate: function () {
                                            debugInfo("开始定位排行榜可滚动控件");
                                            $flag.rl_end_locating = true;

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
                                                $flag.rl_end_str_matching = true;
                                                debugInfo("开始监测列表底部控件描述文本");

                                                while (1) {
                                                    try {
                                                        let _last = cached;
                                                        let _child_cnt;
                                                        while ((_child_cnt = _last.childCount())) {
                                                            _last = _last.child(_child_cnt - 1);
                                                        }
                                                        if ($sel.pickup(_last, "txt").match(/没有更多/)) {
                                                            debugInfo("列表底部控件描述文本匹配");
                                                            delete $flag.rl_end_str_matching;
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
                                                $flag.rl_end_pos_matching = true;
                                                debugInfo("开始监测列表底部控件屏幕高度");

                                                while (1) {
                                                    try {
                                                        let _h = $sel.pickup(cached, "bounds").height();
                                                        if (_h > 20) break;
                                                    } catch (e) {
                                                        // height() of null
                                                    } finally {
                                                        cached.refresh();
                                                        sleep(200);
                                                    }
                                                }

                                                debugInfo("列表底部控件高度满足结束条件");
                                                cached.recycle();
                                                delete $flag.rl_end_pos_matching;
                                            },
                                            transmitSignal: function () {
                                                debugInfo("发送排行榜停检信号");
                                                $flag.rl_bottom_rch = true;
                                            },
                                        };
                                    }
                                }
                            });

                            _thd_expand_lst.join(5 * 60000); // 5 minutes at most
                            _thd_expand_lst.interrupt();
                            _thd_swipe.interrupt();

                            let _ls_data = _getLstData();

                            $sto.af.put("friends_list_data", _ls_data);

                            messageAction("采集完毕", 1, 1, 0, -1);
                            messageAction("用时 " + timeRecorder("get_rl_data", "load", "auto"), 1, 0, 1);
                            messageAction("总计 " + _ls_data.list_length + " 项", 1, 0, 1, 1);

                            return $flag.floaty_fin = 1;

                            // tool function (s) //

                            function _getLstData() {
                                let _data = [];
                                let _nodes = $sel.pickup([$app.rex_energy_amt], "nodes").slice(1);

                                _nodes.forEach((w, i) => {
                                    let _nickname = $sel.pickup([w, "p2c2c0c0"], "txt");
                                    let _rank = i < 3 ? i + 1 : $sel.pickup([w, "p2c0c0"], "txt");
                                    _data.push({
                                        rank_num: _rank.toString(),
                                        nickname: _nickname,
                                    });
                                });

                                let _max_len = _data[_data.length - 1].rank_num.length;
                                let _pad = new Array(_max_len).join("0");
                                _data.map(o => o.rank_num = (_pad + o.rank_num).slice(-_max_len));

                                return {
                                    timestamp: $app.ts,
                                    list_data: _data,
                                    list_length: _data.length,
                                };
                            }
                        }

                        function _quit() {
                            $app.page.alipay.close();
                            $app.exit();
                        }
                    },
                    curAccName: function () {
                        timeRecorder("get_cur_acc_name", "save");

                        collectCurrentAccountName();
                        $app.page.alipay.close();
                        $app.exit();

                        // tool function(s) //

                        function collectCurrentAccountName() {
                            let collected_name = getNameByPipeline();
                            let storage_key_name = "collected_current_account_name";
                            $sto.af.remove(storage_key_name);
                            $sto.af.put(storage_key_name, collected_name);
                            messageAction("采集完毕", 1);
                            messageAction("用时 " + timeRecorder("get_cur_acc_name", "load", "auto"), 1, 0, 1);
                            $flag.floaty_fin = 1;

                            // tool function (s) //

                            function getNameByPipeline() {
                                let account_name = "";
                                let thread_get_account_name = threads.starts(function () {
                                    $app.task_name = surroundWith("采集当前账户名");
                                    $app.page.alipay.home();

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
                                    let getNameTxt = () => $sel.pickup(["支付宝账户", "s+1"], "txt");
                                    let txt = "";
                                    waitForAction(() => txt = getNameTxt(), 2000);
                                    return account_name = txt ? $acc.encode(txt) : "";
                                });
                                let thread_monitor_logged_out = threads.starts(function () {
                                    delete $flag.acc_logged_out;
                                    while (!$acc.isInLoginPg() && !$sel.get("acc_logged_out")) sleep(500);
                                    $flag.acc_logged_out = true;
                                });
                                waitForAction(() => account_name || $flag.acc_logged_out, 12000);
                                thread_get_account_name.interrupt();
                                thread_monitor_logged_out.interrupt();
                                if (account_name) return account_name;
                                if ($flag.acc_logged_out) {
                                    messageAction("账户已登出", 3, 1, 0, "both_dash");
                                    delete $flag.acc_logged_out;
                                }
                                return "";
                            }
                        }
                    }
                },
                trigger: function () {
                    let _cmd = this.cmd;
                    if (!_cmd) return;
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

let $af = {
    launch: () => {
        let _ = launcher();

        _.greet();
        _.assign();
        _.home();
        _.ready();

        return $af;

        // tool function(s) //

        function launcher() {
            return {
                greet: () => {
                    let _msg = "开始" + $app.task_name + "任务";
                    messageAction(_msg, 1, 1, 0, "both");
                },
                assign: () => {
                    Object.assign($af, {
                        emount_t_own: 0, // t: total
                        emount_c_own: 0, // c: collected
                        emount_c_fri: 0,
                        eballs: (type) => {
                            let _type = type || "all";
                            let _nor = "\xa0";
                            let _ripe = "收集能量\\d+克";
                            let _all = _nor + "|" + _ripe;
                            let _rex_s = {nor: _nor, ripe: _ripe, all: _all};
                            let _kw = new RegExp(_rex_s[_type]);
                            let _par = {className: "Button"};
                            let _nodes = $sel.pickup([_kw, _par], "nodes");

                            return _nodes.filter((w) => {
                                let _b = w && w.bounds();
                                let _cL = _b.left >= cX(0.08);
                                let _cR = _b.right <= cX(0.92);
                                return _b && _cL && _cR;
                            })
                        },
                    });
                },
                home: () => {
                    void $app.page.af.home();
                },
                ready: () => {
                    let _ = readySetter();

                    _.displayReady();
                    _.languageReady();
                    _.mainAccReady();

                    // tool function(s) //

                    function readySetter() {
                        return {
                            displayReady: function () {
                                if ($dev.screen_orientation !== 0) {
                                    getDisplayParams({global_assign: true});
                                }
                            },
                            languageReady: function () {
                                let title_str = "";
                                if (!waitForAction(() => title_str = $sel.get("af_title", "txt"), 10000, 100)) {
                                    messageAction("语言检测已跳过", 3);
                                    return messageAction("语言检测超时", 3, 0, 1, 1);
                                }
                                if (title_str.match(/蚂蚁森林/)) debugInfo("当前支付宝语言: 简体中文");
                                else {
                                    debugInfo("当前支付宝语言: 英语");
                                    changeLangToChs();
                                    $app.page.af.home()
                                        ? messageAction("切换支付宝语言: 简体中文", 1, 0, 0, 1)
                                        : messageAction("语言切换失败", 8, 1, 0, 1);
                                }
                                debugInfo("语言检查完毕");

                                // tool function(s) //

                                function changeLangToChs() {
                                    if (!getReady()) return;

                                    messageAction("切换支付宝语言: 简体中文", null, 1);

                                    $app.page.disPermissionDiag();

                                    return clickActionsPipeline([
                                        [["Me", "p1"]],
                                        [["Settings", {clickable: true}]],
                                        [["General", "p4"]],
                                        [["Language", "p4"]],
                                        [["简体中文", "p4"], () => $sel.pickup(["简体中文", "p3"], "children").length > 1],
                                        ["Save"],
                                    ], {
                                        name: "切换简体中文语言",
                                        default_strategy: "widget",
                                    });

                                    // tool function(s) //

                                    function getReady() {
                                        let max_try_times_close_btn = 10;
                                        while ($app.page.close() && max_try_times_close_btn--) {
                                            sleep(500);
                                        }
                                        let kw_homepage = className("TextView").idContains("tab_description");
                                        if (waitForAction(kw_homepage, 2000)) return true;
                                        let max_try_times = 5;
                                        while (max_try_times--) {
                                            let {pkg_name} = $app;
                                            killThisApp(pkg_name);
                                            app.launch(pkg_name);
                                            if (waitForAction(kw_homepage, 15000)) break;
                                        }
                                        if (max_try_times < 0) {
                                            messageAction("Language switched failed", 4, 1);
                                            messageAction("Homepage failed to get ready", 4, 0, 1);
                                            return false;
                                        }
                                        return true;
                                    }
                                }
                            },
                            mainAccReady: function () {
                                return $acc.main.login();
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

        return $af;

        // tool function(s) //

        function collector() {
            return {
                own: {
                    _getEmount: (buf) => {
                        let _amt;
                        let _rex = /\d+g/;
                        let _max = buf ? 10 : 1;
                        while (1) {
                            _amt = $sel.pickup([_rex, {
                                boundsInside: [cX(0.6), 0, W, cY(0.24, -1)],
                            }], "txt").match(/\d+/);
                            _amt = $$arr(_amt) ? +_amt[0] : _amt;
                            if ($$num(_amt) || !--_max) break;
                            sleep(200);
                        }
                        return _max < 0 ? -1 : _amt;
                    },
                    trigger: () => {
                        if ($cfg.self_collect_switch) {
                            $af.own = own;
                            return true;
                        }
                        debugInfo(["跳过自己能量检查", "自收功能未开启"]);
                    },
                    init: () => {
                        debugInfo("开始检查自己能量");

                        let _total = own._getEmount("buf");
                        debugInfo("初始能量: " + ($af.emount_t_own = _total) + "g");

                        let _tt = $cfg.max_own_forest_balls_ready_time;
                        debugInfo(["查找主页能量球控件", ">最大时间参数: " + _tt + "毫秒"]);

                        let _avt = $app.avatar_checked_time;
                        if (_avt) {
                            _tt = Math.max(240, _tt - _avt);
                            let _str_a = "查找时间值削减至: " + _tt + "毫秒";
                            let _str_b = ">主账户检测耗时抵充";
                            debugInfo([_str_a, _str_b]);
                            delete $app.avatar_checked_time;
                        }
                        own.tt = _tt;

                        $af.min_ctd_own = Infinity;
                        $af.thrd_monit_own = $cfg.homepage_monitor_threshold;
                        $af.thrd_bg_monit_own = $cfg.homepage_background_monitor_threshold;

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
                                _balls_nodes = $af.eballs();
                                return _num = _balls_nodes.length;
                            };

                            if (waitForAction(_getBallsNum, own.tt, 60)) {
                                debugInfo("找到主页能量球: " + _num + "个");
                                return $af.balls_nodes = _balls_nodes;
                            }
                            debugInfo("指定时间内未发现主页能量球");
                        }

                        function _check() {
                            _chkRipeBalls();
                            _chkCountdown();

                            // tool function(s) //

                            function _chkRipeBalls() {
                                let _num = 0; // ripe balls length
                                let _nodes = null; // ripe balls nodes
                                let _getNum = () => _num = _getNodes().length;
                                let _getNodes = () => _nodes = $af.eballs("ripe");
                                let _noRipe = () => $$num(_getNum(), 0);

                                if (!_getNum()) return;

                                let _max = 8;
                                let _par = {press_time: $cfg.energy_balls_click_interval};

                                do {
                                    debugInfo("点击自己成熟能量球: " + _num + "个");
                                    _nodes.forEach(w => clickAction(w.bounds(), "p", _par));
                                } while (--_max && !waitForAction(_noRipe, 2400, 100));

                                if (_max >= 0) {
                                    let _t = $af.emount_t_own; // total
                                    let _getEm = own._getEmount; // emount

                                    $af.emount_c_own += $app.tool.stabilizer(_getEm, _t) - _t;
                                    $af.emount_t_own += $af.emount_c_own;

                                    return true;
                                }
                            }

                            function _chkCountdown() {
                                if (!_trigger()) return;

                                while (_check()) _monitor();

                                // tool function(s) //

                                function _trigger() {
                                    // i know it's perfect... [:lying_face:]

                                    let _cA = $cfg.homepage_background_monitor_switch;
                                    let _cB1 = $cfg.timers_switch;
                                    let _cB2a = $cfg.homepage_monitor_switch;
                                    let _cB2b1 = $cfg.timers_self_manage_switch;
                                    let _cB2b2 = $cfg.timers_countdown_check_own_switch;
                                    let _cB2b = _cB2b1 && _cB2b2;
                                    let _cB2 = _cB2a || _cB2b;
                                    let _cB = _cB1 && _cB2;

                                    return _cA || _cB;
                                }

                                function _check() {
                                    debugInfo("开始检测自己能量球最小倒计时");

                                    let _raw_balls = $af.balls_nodes.filter((node) => {
                                        return !!$sel.pickup(node, "txt").match(/\xa0/);
                                    });
                                    let _len = _raw_balls.length;
                                    if (!_len) return debugInfo("未发现未成熟的能量球");

                                    debugInfo("找到自己未成熟能量球: " + _len + "个");

                                    let _t_spot = timeRecorder("ctd_own");
                                    let _min_ctd_own = Math.mini(_getCtdData());

                                    if (!$$posNum(_min_ctd_own) || $$inf(_min_ctd_own)) {
                                        return debugInfo("自己能量最小倒计时数据无效", 3);
                                    }

                                    let _par = ["ctd_own", "L", 60000, 0, "", _min_ctd_own];
                                    let _remain = +timeRecorder.apply({}, _par);
                                    $af.min_ctd_own = _min_ctd_own; // ripe timestamp

                                    debugInfo("自己能量最小倒计时: " + _remain + "分钟");
                                    debugInfo("时间: " + $app.tool.timeStr(_min_ctd_own));
                                    debugInfo("自己能量球最小倒计时检测完毕");

                                    let _cA = $cfg.homepage_monitor_switch;
                                    let _cB = _remain <= $af.thrd_monit_own;

                                    return _cA && _cB; // if _monitor() is needed

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

                                            let [_capt, _stitched] = [null, null];

                                            let _raw_data = baiduOcr([_raw_balls, _stitch()], {
                                                fetch_times: 3,
                                                fetch_interval: 500,
                                                no_toast_msg_flag: true,
                                            }).map((data) => {
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
                                                return debugInfo("OCR识别线程未能获取有效数据");
                                            }
                                            debugInfo("OCR识别线程已获取有效数据");

                                            if (_ctd_data.length) {
                                                return debugInfo(["数据未被采纳", ">倒计时数据非空"]);
                                            }
                                            debugInfo("OCR识别线程数据已采纳");

                                            return _ctd_data = _raw_data;

                                            // tool function(s) //

                                            // to stitch af home balls image
                                            function _stitch() {
                                                _capt = images.capt();
                                                _stitched = _nodeToImg(_raw_balls[0]);

                                                _raw_balls.forEach((w, idx) => {
                                                    if (!idx) return;
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
                                            let _par = [$app.pkg_name, /才能收取/, 480];

                                            _raw_balls.forEach((node) => {
                                                clickAction(node, "p");
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
                                    let _thrd = $af.thrd_monit_own;
                                    let _tt = _thrd * 60000 + 3000;
                                    let _old_em = $af.emount_c_own;

                                    device.keepOn(_tt);
                                    toast("Non-stop checking time");
                                    debugInfo("开始监测自己能量");
                                    timeRecorder("monitor_own");

                                    while (timeRecorder("monitor_own", "load") < _tt) {
                                        if (_chkRipeBalls()) break;
                                        sleep(180);
                                    }

                                    let _em = $af.emount_c_own - _old_em;
                                    let _elapsed = timeRecorder("monitor_own", "L", "auto");
                                    device.cancelOn();
                                    toast("Checking completed");
                                    debugInfo("自己能量监测完毕");
                                    debugInfo("本次监测收取结果: " + _em + "g");
                                    debugInfo("监测用时: " + _elapsed);
                                }
                            }
                        }

                        function _result() {
                            let _em = $af.emount_c_own;
                            let _em_str = "共计收取: " + _em + "g";
                            if (!_em || $$inf(_em)) _em_str = "无能量球可收取";

                            debugInfo([_em_str, "自己能量检查完毕"]);
                        }
                    },
                    awake: () => {
                        let _thrd = $af.thrd_bg_monit_own;
                        if (!_thrd) return;

                        let _ctd_ts = $af.min_ctd_own;
                        let _thrd_ts = _thrd * 60000 + 3000;
                        let _cA = _ctd_ts && $$fin(_ctd_ts);
                        let _cB = $af.min_ctd_own - $app.ts <= _thrd_ts;
                        let _msg = "开始主页能量球返检监控";

                        if (_cA && _cB) {
                            messageAction(_msg, 1, 1, 0, 1);
                            $app.page.af.home();
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
                        let _nodes = $sel.pickup(_rex, "nodes");
                        let _smp = {};
                        let _len = _nodes.length;

                        _parseNodes();
                        _checkExcpt();

                        return fri.rl_samples = _smp;

                        // tool function(s) //

                        function _parseNodes() {
                            debugInfo("捕获好友能量倒计时数据: " + _len + "个");

                            _nodes.forEach((w) => {
                                let _mm = +$sel.pickup(w, "txt").match(/\d+/)[0];
                                let _nick = $sel.pickup([w, "p2c2c0c0"], "txt");
                                if (_mm && _nick) {
                                    _smp[_nick] = $app.ts + _mm * 60000;
                                }
                            });
                        }

                        function _checkExcpt() {
                            let _avail = Object.keys(_smp).length;
                            let _diff = _len - _avail;
                            if (_diff) {
                                let _mA = "好友能量倒计时数据异常: ";
                                let _mB = _diff + "项";
                                let _lv = _avail ? 3 : 4;
                                messageAction(_mA + _mB, _lv, 0, 0, "both");
                            }
                        }
                    },
                    _getMinCtd: () => {
                        let _now = +new Date();
                        let _smp = fri._getSmp("cache");
                        let _nicks = Object.keys(_smp);
                        let _len = _nicks.length;

                        if (!_len) return;

                        let _min_ctd = Math.mini(Object.values(_smp));
                        let _mm = Math.round((_min_ctd - _now) / 60000);

                        if (_mm > 0) {
                            $af.min_ctd_fri = _min_ctd;
                            debugInfo("好友能量最小倒计时: " + _mm + "分钟");
                            debugInfo("时间数据: " + $app.tool.timeStr(_min_ctd));
                            debugInfo("好友能量最小倒计时检测完毕");
                            return _mm <= $cfg.rank_list_review_threshold;
                        }
                        return debugInfo("好友倒计时数据无效: " + _mm, 3);
                    },
                    oballs: {},
                    get oballs_len() {
                        return Object.keys(this.oballs).length;
                    },
                    trigger: () => {
                        let _sw_pick = $cfg.friend_collect_switch;
                        let _sw_help = $cfg.help_collect_switch;

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

                        $af.fri = fri;

                        return true;

                        // tool function(s) //

                        function _chkHelpSect() {
                            let [_s0, _s1] = $cfg.help_collect_section;

                            if (_s1 <= _s0) {
                                _s1 = _s1.replace(/\d{2}(?=:)/, $0 => +$0 + 24);
                            }

                            let _now_str = $app.tool.timeStr($app.now, "hm");
                            let _res = $$str(_s0, "<=", _now_str, "<", _s1);

                            if (!_res && !$flag.help_sect_hinted) {
                                debugInfo("当前时间不在帮收有效时段内");
                                $flag.help_sect_hinted = true;
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
                            let _rev = $flag.rl_review;
                            let _act = _rev ? "复查" : "检查";
                            debugInfo("开始" + _act + "好友能量");
                        }

                        function killH5() {
                            let _trig = () => {
                                return $sel.get("af_title")
                                    || $sel.get("rl_title")
                                    || $app.page.fri.isInPage();
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
                            delete $flag.rl_valid_click;
                            delete $flag.help_sect_hinted;
                            delete $flag.rl_bottom_rch;
                            delete $flag.rl_review;

                            $af.min_ctd_fri = Infinity;
                            $app.user_nickname = _getNickname();

                            // tool function(s) //

                            function _getNickname() {
                                if (!$$und($app.user_nickname)) {
                                    debugInfo("无需重复获取当前账户昵称"); //// TEST ////
                                    return $app.user_nickname;
                                }

                                app.startActivity({
                                    data: "alipays://platformapi/startapp?appId=20000141",
                                });

                                let _kw = className("EditText");
                                let _nick = "";
                                let _sel = () => _nick = $sel.pickup(_kw, "txt");

                                if (!waitForAction(_kw, 4800, 60)) {
                                    messageAction("无法获取当前账户昵称", 3, 0, 0, -1);
                                    messageAction("进入昵称设置页面超时", 3, 1, 0, 1);
                                } else {
                                    waitForAction(_sel, 480, 60);
                                    $app.page.back();
                                }

                                // make it easier for rl to launch
                                sleep(500);

                                if ($$str(_nick, "")) {
                                    let _kw = idMatches(/.*user_name_left/);
                                    let _sel = () => _nick = $sel.pickup(_kw, "txt");

                                    $app.page.alipay.home({debug_info_flag: false});
                                    clickAction($sel.pickup(["我的", "p1"]), "w");
                                    waitForAction(_sel, 2400);
                                    _nick = _nick.slice(-2);
                                }

                                _nick && debugInfo("成功获取当前账户昵称");

                                return _nick;
                            }
                        }
                    },
                    launch: () => {
                        $app.page.rl.launch();
                        $app.monitor.rl_bottom.start();

                        return fri;
                    },
                    collect: () => {
                        let _halt = () => {
                            return own.awake();
                        };
                        let _quit = () => {
                            if ($flag.rl_bottom_rch) {
                                debugInfo("检测到排行榜停检信号");
                                return true;
                            }
                        };
                        let _tar;
                        let _fin = () => {
                            _minCtdFriReady();

                            return debugInfo("好友能量检查完毕");

                            // tool function(s) //

                            // for timed task (self management)
                            function _minCtdFriReady() {
                                let _swA = $cfg.timers_switch;
                                let _swB = $cfg.timers_self_manage_switch;
                                let _swC = $cfg.timers_countdown_check_friends_switch;
                                let _cond = _swA && _swB && _swC;
                                if (!_cond) {
                                    $af.min_ctd_fri = Infinity;
                                } else if ($$inf($af.min_ctd_fri)) {
                                    fri._getMinCtd();
                                }
                            }
                        };
                        let _reboot = fri.reboot;
                        let _review = fri.review;

                        while (1) {
                            if (_scan()) void _deal();
                            if (_halt()) return _reboot();
                            if (_quit()) break;
                            _swipe();
                        }

                        return _review() ? _reboot() : _fin();

                        // tool function(s) //

                        function _scan() {
                            let _col_pick = $cfg.friend_collect_icon_color;
                            let _col_help = $cfg.help_collect_icon_color;
                            let _getTar = ident => _prop[ident].check() || [];
                            let _prop = {
                                pick: {
                                    color: _col_pick,
                                    col_thrd: $cfg.friend_collect_icon_threshold,
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
                                            return _prop._chkByMultCol.bind(this)("chk_h");
                                        }
                                        if (!$flag.dys_pick) {
                                            let _sA = "不再采集收取目标样本";
                                            let _sB = ">收取功能已关闭";
                                            debugInfo([_sA, _sB]);
                                            $flag.dys_pick = true;
                                        }
                                    },
                                },
                                help: {
                                    color: _col_help,
                                    col_thrd: $cfg.help_collect_icon_threshold,
                                    mult_col: [[cX(38), cY(35, -1), _col_help]],
                                    check: function () {
                                        if (fri.trig_help) {
                                            return _prop._chkByMultCol.bind(this)();
                                        }
                                        if (!$flag.dys_help) {
                                            let _sA = "不再采集帮收目标样本";
                                            let _sB = ">帮收功能已关闭";
                                            debugInfo([_sA, _sB]);
                                            $flag.dys_help = true;
                                        }
                                    },
                                },
                                _chkByMultCol: function (chk_h) {
                                    let _l = cX(0.9);
                                    let _t = 0;
                                    let _color = this.color;
                                    let _col_thrd = this.col_thrd || 10;
                                    let _mult_col = this.mult_col;
                                    let _capt = $app.page.rl.capt_img;
                                    let _tar = [];

                                    while (_t < H) {
                                        let _matched = _check();
                                        if (!_matched) break;

                                        let _y = _matched.y;
                                        _t = _y + cY(76, -1);

                                        _chkHeight(_y) && _tar.unshift({
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
                                        if (_matched) return {
                                            x: _matched.x,
                                            y: _matched.y,
                                        };
                                    }

                                    function _chkHeight(y) {
                                        if (!chk_h) return true;

                                        let _x = cX(0.993);
                                        let _y = y + cY(11, -1);
                                        let _ref = images.pixel(_capt, _x, _y);

                                        return colors.isSimilar(_ref, _color, _col_thrd);
                                    }
                                },
                            };

                            _tar = [_getTar("pick"), _getTar("help")];

                            return Math.sum(_tar.map(x => x.length));
                        }

                        function _deal() {
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
                                    _click();
                                    _intro();
                                    _check();
                                    _back();
                                    _coda();
                                }

                                // tool function(s) //

                                function _click() {
                                    clickAction([halfW, _item.list_item_click_y], "p");

                                    if ($flag.six_review) {
                                        debugInfo("复查当前好友", "both");
                                        delete $flag.six_review;
                                    } else {
                                        debugInfo("点击" + idt + "目标");
                                    }

                                    // TODO waitForAction... pool is different
                                    sleep(500); // avoid touching widgets in rank list

                                    return true;
                                }

                                function _intro() {
                                    let _nick = "";
                                    let _sel = () => {
                                        return _nick = $sel.pickup(/.+的蚂蚁森林/, "txt");
                                    };
                                    if (waitForAction(_sel, 20000)) {
                                        _nick = _nick.replace(/的蚂蚁森林$/, "");
                                        $app.fri_drop_by.ic(_nick);
                                        messageAct($af.nick = _nick, "t");
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
                                        let _nick = $af.nick;
                                        if ($app.blist.get(_nick)) {
                                            $app.fri_drop_by.dc(_nick);
                                            return true;
                                        }
                                    }

                                    function _ready() {
                                        let _res = $app.page.fri.getReady();

                                        fri.itballs_len = _res;
                                        fri.oballs = {};

                                        delete $flag.pick_off_duty;
                                        delete $flag.help_off_duty;

                                        return _res;
                                    }

                                    function _monitor() {
                                        _thd_eball_monit = threads.starts(_thdEballMonit);
                                    }

                                    function _thdEballMonit() {
                                        debugInfo("已开启能量球监测线程");
                                        timeRecorder("eball_monit");

                                        let _col = $cfg.help_collect_balls_color;
                                        let _thrd = $cfg.help_collect_balls_threshold;

                                        let _tt_ref = $cfg.help_collect_balls_intensity;
                                        let _tt = _tt_ref * 160 - 920;
                                        debugInfo("能量球监测采集密度: " + _tt + "毫秒");

                                        let _capt = null;
                                        let _capture = () => _capt = images.capt();
                                        let _reclaim = () => {
                                            images.reclaim(_capt);
                                            _capt = null;
                                        };

                                        _fillUpCvrCapt();
                                        _analyseOballs();

                                        // tool function(s) //

                                        function _fillUpCvrCapt() {
                                            let _max = 4;
                                            while (_max--) {
                                                $app.cover_capt.add(_capture());
                                                if ($app.cover_capt.filled_up) {
                                                    return;
                                                }
                                                sleep(120);
                                            }
                                        }

                                        function _analyseOballs() {
                                            while (1) {
                                                _capture();
                                                if (_analyse()) break;
                                                if (_achieve()) break;
                                            }
                                            _reclaim();

                                            // tool function(s) //

                                            function _analyse() {
                                                if (fri.trig_help) {
                                                    let _nballs = null;
                                                    let _sel = () => _nballs = $af.eballs("nor");
                                                    let _selLen = () => _sel().length > 0;
                                                    let _intrp = (str) => {
                                                        debugInfo(["采集中断", ">" + str]);
                                                        return true;
                                                    };

                                                    if (!waitForAction(_selLen, 1500, 100)) {
                                                        return _intrp("指定时间内未发现普通能量球");
                                                    }

                                                    if (_nballs.length === fri.oballs_len) {
                                                        return _intrp("橙色球状态已全部采集完毕");
                                                    }

                                                    _chkInCvr(_nballs) || _chkInScr(_nballs);
                                                }
                                            }

                                            function _achieve() {
                                                let _prog = timeRecorder(
                                                    "eball_monit", "L", _tt / 100, [1], "%"
                                                );
                                                return _prog.slice(0, -1) >= 95;
                                            }

                                            function _chkInCvr(node) {
                                                // lazy function
                                                debugInfo("采集能量罩样本中的橙色球");
                                                _matchColor(node, $app.cover_capt.pool);
                                                debugInfo("能量罩样本橙色球采集完毕");
                                                debugInfo("采集结果数量: " + fri.oballs_len);
                                                return (_chkInCvr = () => !1)();
                                            }

                                            function _chkInScr(node) {
                                                return _matchColor(node, _capt);
                                            }

                                            function _matchColor(node, capt) {
                                                if (!$$arr(capt)) {
                                                    return _matchCol(capt);
                                                }
                                                capt.forEach(_matchCol);

                                                // tool function(s) /

                                                function _matchCol(capt) {
                                                    node.forEach(w => {
                                                        let _b = w.bounds();
                                                        let _t = _b.top;
                                                        if (_t in fri.oballs) {
                                                            return;
                                                        }

                                                        let _w = _b.width();
                                                        let _h = _b.height();
                                                        let _par = {
                                                            region: [_b.left, _t, _w, _h],
                                                            threshold: _thrd,
                                                        };
                                                        if (images.findColor(capt, _col, _par)) {
                                                            let _x = _b.centerX();
                                                            let _y = _b.centerY();
                                                            fri.oballs[_t] = [_x, _y];
                                                            let _c = "(" + _x + ", " + _y + ")";
                                                            debugInfo("记录橙色球坐标: " + _c);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }

                                    function _cover() {
                                        let _covered = false;
                                        let _detect = () => $app.cover_capt.detect();
                                        let _reclaim = () => $app.cover_capt.reclaimAll();
                                        let _dismiss = () => debugInfo("颜色识别无保护罩");

                                        _ready();
                                        _detect() ? _handle() : _dismiss();
                                        _reclaim();

                                        return _covered;

                                        // tool function(s) //

                                        function _ready() {
                                            _eballMonOK();
                                            _fillUpIdent();

                                            // tool function(s) //

                                            function _eballMonOK() {
                                                debugInfo("开始能量保护罩检测准备");

                                                let _max = 10;
                                                while (!$app.cover_capt.len && _max--) {
                                                    if (!_thd_eball_monit.isAlive()) break;
                                                    sleep(100);
                                                }
                                            }

                                            function _fillUpIdent() {
                                                let _len = $app.cover_capt.len;
                                                if (_len) {
                                                    debugInfo("使用能量球监测线程数据");
                                                    debugInfo("能量罩样本数量: " + _len);
                                                }
                                                if (_len < 3) _fillUp();

                                                // tool function(s) //

                                                function _fillUp() {
                                                    debugInfo("能量罩样本数量不足");
                                                    let _max = 10;
                                                    while (1) {
                                                        if (!_thd_eball_monit.isAlive()) {
                                                            debugInfo(["能量球监测线程已停止", "现场采集能量罩样本数据"]);
                                                            $app.cover_capt.add();
                                                            break;
                                                        } else if (--_max < 0) {
                                                            debugInfo(["等待样本采集超时", "现场采集能量罩样本数据"]);
                                                            $app.cover_capt.add();
                                                            break;
                                                        } else if ($app.cover_capt.filled_up) {
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
                                            let _sel_lst = () => _node_lst = $sel.get("list");
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
                                                    let _lst_more = $sel.pickup("点击加载更多");
                                                    let _cA = () => $sel.pickup("没有更多");
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
                                                let _sel_cvr = () => $sel.get("cover_used");
                                                let _max = 8;

                                                while (_max--) {
                                                    let len = _getNodes().length;
                                                    for (let i = 0; i < len; i += 1) {
                                                        let _node = _nodes[i];
                                                        let _txt = $sel.pickup(_node, "txt");
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
                                                let _time_str = $sel.pickup([_node_cvr, "p2c1"], "txt");
                                                debugInfo("捕获动态列表时间字串: " + _time_str);

                                                $app.blist.add($af.nick, _invalidTs(), "protect_cover");

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
                                                    let _txt_cvr = $sel.pickup(_node_cvr, "txt");
                                                    let _date_str = "";
                                                    let _children = _node_lst.children();
                                                    for (let i = 0, l = _children.length; i < l; i += 1) {
                                                        let _child = _children[i];
                                                        if (!_child.childCount()) {
                                                            let _date_txt = $sel.pickup(_child, "txt");
                                                            if (!_date_txt.match(/.天/)) {
                                                                break;
                                                            }
                                                            _date_str = _date_txt;
                                                        } else {
                                                            let _txt_item = $sel.pickup(
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
                                        $app.thd_pick = threads.starts(function () {
                                            debugInfo("已开启能量球收取线程");
                                            let _ripe = $af.eballs("ripe");
                                            if (_ripe.length) {
                                                _clickAndCnt("pick", _ripe);
                                                return true;
                                            }
                                            $flag.pick_off_duty = true;
                                            debugInfo("没有可收取的能量球");
                                        });
                                    }

                                    function _help() {
                                        _ready() && _click() && _sixRev();

                                        $app.thd_pick.join();

                                        // tool function(s) //

                                        function _ready() {
                                            _thd_eball_monit.join();

                                            debugInfo("已开启能量球帮收线程");

                                            if (waitForAction(() => $flag.pick_off_duty, 2000, 80)) {
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
                                            $flag.help_off_duty = true;
                                            debugInfo("没有可帮收的能量球");
                                        }

                                        function _sixRev() {
                                            if (fri.itballs_len === 6) {
                                                if (!$cfg.six_balls_review_switch) {
                                                    return debugInfo("六球复查未开启");
                                                }

                                                if ($$und($flag.six_review)) {
                                                    $flag.six_review = 1;
                                                } else {
                                                    $flag.six_review += 1;
                                                }

                                                let _max = $cfg.six_balls_review_max_continuous_times;
                                                if ($flag.six_review > _max) {
                                                    debugInfo(["清除六球复查标记", ">连续复查次数已达上限"]);
                                                    delete $flag.six_review;
                                                } else {
                                                    debugInfo("设置六球复查标记: " + $flag.six_review);
                                                }
                                            }
                                        }
                                    }

                                    function _clickAndCnt(act, data) {
                                        let _par_p_t = {
                                            press_time: $cfg.energy_balls_click_interval,
                                        };
                                        let _config = {
                                            pick: {
                                                name: "收取",
                                                act: "收取",
                                                click: () => {
                                                    data.forEach((w) => {
                                                        clickAction(w.bounds(), "p", _par_p_t);
                                                    });
                                                    debugInfo("点击成熟能量球: " + data.length + "个");
                                                    $flag.pick_off_duty = true;
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
                                                    });
                                                    debugInfo("点击帮收能量球: " + _pts.length + "个");
                                                    $flag.help_off_duty = true;
                                                },
                                                pk_par: ["你给TA助力", 10],
                                            },
                                        };

                                        let _cfg = _config[act];
                                        let _name = _cfg.name;
                                        let _click = () => _cfg.click();

                                        let _ctr = threads.atomic(0);
                                        let _res = threads.atomic(-1);

                                        let _thds = {
                                            thd: [_thdPk, _thdFeed],
                                            start: function () {
                                                this.thd.forEach((thd, i, arr) => arr[i] = threads.start(thd));
                                            },
                                            isAllDead() {
                                                let _len = this.thd.length;
                                                for (let i = 0; i < _len; i++) {
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
                                            offDuty: () => {
                                                let _fg = () => $flag[act + "_off_duty"];
                                                return waitForAction(_fg, 2000, 50);
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

                                                if (!_thds.offDuty()) {
                                                    return debugInfo(_name + "操作未就绪");
                                                }
                                                return true;
                                            },
                                            stable: (o) => {
                                                let _nm = o.nm;
                                                let _init = o.init;
                                                let _stab;

                                                debugInfo("等待" + _nm + "数据稳定");

                                                _stab = $app.tool.stabilizer(o.get, _init);

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
                                                if (_ctr.get()) {
                                                    let _len = _thds.length;
                                                    let _cond = () => _ctr.get() === _len;
                                                    return waitForAction(_cond, 240, 50);
                                                }
                                                sleep(50);
                                            }
                                        }

                                        function _stat() {
                                            $flag.rl_valid_click = true;
                                            $app.fri_drop_by.dc($af.nick);

                                            let _cond = () => _thds.isAllDead();
                                            waitForAction(_cond, 2400, 80);
                                            _thds.killAll();

                                            let _act = _cfg.act;
                                            let _sum = _res.get();
                                            let _lv = +!!_sum;
                                            let _msg = _act + ": " + _sum + "g";
                                            let _is_pick = act === "pick";

                                            if (_sum < 0) {
                                                let _msg = _act + ": 统计数据无效";
                                                return messageAct(_msg, 0, 0, 1);
                                            }
                                            $af.emount_c_fri += _is_pick ? _sum : 0;
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
                                                    let _txt = $sel.pickup([text, "s+1"], "txt");
                                                    if (_txt.match(/\d+(kg|t)/)) {
                                                        debugInfo("放弃低精度参照值");
                                                        return NaN;
                                                    }
                                                    let _mch = _txt.match(/\d+/);
                                                    if (_mch) return +_mch[0];
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
                                                if (!waitForAction(() => $sel.get("list"), 1500, 50)) {
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
                                                let _lst = $sel.get("list", "cache");

                                                for (let i = 1; i <= _max; i += 1) {
                                                    let _c = "c" + i + "c0c1";
                                                    let _s = $sel.pickup([_lst, _c], "txt");
                                                    let _mch = _s.match(/\d+/);
                                                    if (_mch) _num += +_mch[0];
                                                }

                                                _res.compareAndSet(-1, _num);
                                                debugInfo(_nm + "统计结果: " + _num);
                                            }

                                            function _getFeedItemLen(type) {
                                                let _node_lst = null;
                                                let _sel_lst = () => _node_lst = $sel.get("list");

                                                if (!waitForAction(_sel_lst, 1200, 100)) {
                                                    return NaN;
                                                }

                                                let _sel_str = _getSelStr();
                                                let _str = (n, c) => $sel.pickup([n, c], _sel_str);

                                                if (_str(_node_lst, "c0") !== "今天") {
                                                    return 0;
                                                }
                                                return _getItemsLen();

                                                // tool function(s) //

                                                function _getSelStr() {
                                                    let _rex = /来浇过水.+|(帮忙)?收取\d+g/;
                                                    return $sel.pickup(_rex, "sel_str");
                                                }

                                                function _getRex() {
                                                    let _pref = type === "help" ? "帮忙" : "";
                                                    return new RegExp("^" + _pref + "收取\\d+g$");
                                                }

                                                function _getItemsLen() {
                                                    let _i = 1;
                                                    let _len = _node_lst.childCount();
                                                    let _rex = _getRex();
                                                    let _nick = $app.user_nickname;

                                                    for (; _i < _len; _i += 1) {
                                                        let _c = "c" + _i + "c0";
                                                        let _n = $sel.pickup([_node_lst, _c]);
                                                        if (_n) {
                                                            if (_str(_n, "c0") !== _nick) break;
                                                            if (!_str(_n, "c1").match(_rex)) break;
                                                        }
                                                    }

                                                    return _i - 1;
                                                }
                                            }
                                        }
                                    }
                                }

                                function _back() {
                                    $app.page.rl.backTo();
                                }

                                function _coda() {
                                    // TODO ...
                                    // messageAct("无能量球可操作", 1, 0, 1, 1);
                                    showSplitLine();

                                    delete $af.nick;
                                    $app.cover_capt.clear();
                                    $flag.six_review && _review();

                                    // tool function(s) //

                                    function _review() {
                                        _click();
                                        _intro();
                                        _check();
                                        _back();
                                    }
                                }
                            }
                        }

                        // TODO ...
                        function _swipe() {
                            swipeOnce();

                            sleep($cfg.rank_list_swipe_interval);

                            $app.page.rl.capt();

                            if (!checkRankListCaptDifference()) {
                                let kw_loading = type => $sel.pickup(/正在加载.*/, type, "kw_loading");
                                if (kw_loading()) {
                                    let max_keep_waiting_time = 2 * 60000; // 2 min
                                    debugInfo(["检测到\"正在加载\"按钮", "等待按钮消失 (最多" + max_keep_waiting_time + "分钟)"]);
                                    if (waitForAction(() => !kw_loading(), max_keep_waiting_time, 1000)) {
                                        delete $flag.rl_bottom_rch;
                                        return debugInfo(["排行榜停检信号撤销", ">\"正在加载\"按钮已消失"]);
                                    }
                                    debugInfo("等待\"正在加载\"按钮消失超时", 3);
                                }

                                if ($sel.get("rl_end_ident")) {
                                    let {left, top, right, bottom} = $sel.get("rl_end_ident", "bounds") || {};
                                    if (bottom - top === $app.end_list_ident_height) {
                                        $flag.rl_bottom_rch = true;
                                        debugInfo(["发送排行榜停检信号", ">已匹配列表底部控件"]);
                                        let capt_img = images.capt();
                                        let btn_clip = images.clip(capt_img, left, top, right - left - 3, bottom - top - 3);
                                        if ($app.rank_list_bottom_template) {
                                            images.reclaim($app.rank_list_bottom_template);
                                            $app.rank_list_bottom_template = null;
                                        }
                                        images.save(
                                            $app.rank_list_bottom_template = images.copy(btn_clip),
                                            $app.rank_list_bottom_template_path)
                                        ;
                                        images.reclaim(capt_img, btn_clip);
                                        capt_img = btn_clip = null;
                                        return debugInfo("列表底部控件图片模板已更新");
                                    } else {
                                        $app.end_list_ident_height = bottom - top;
                                        $app.forcible_swipe_check_flag = true;
                                    }
                                }

                                if (waitForAction(() => $sel.pickup(/.*打瞌睡.*/), 2, 1000)) {
                                    waitForAndClickAction($sel.pickup("再试一次"), 15000, 500, {click_strategy: "w"});
                                    delete $flag.rl_bottom_rch;
                                    return debugInfo(["排行榜停检信号撤销", ">检测到\"服务器打瞌睡\"页面"]);
                                }
                            }

                            if (checkRankListBottomTemplate() || checkInvitationBtnColor()) {
                                $flag.rl_bottom_rch = true;
                            }

                            // tool function(s) //

                            function swipeOnce() {
                                $impeded("排行榜滑动流程");

                                let swipe_time = $cfg.rank_list_swipe_time;
                                let swipe_distance_raw = $cfg.rank_list_swipe_distance;
                                let swipe_distance = swipe_distance_raw < 1 ? ~~(swipe_distance_raw * H) : swipe_distance_raw;
                                let swipe_top = ~~((uH - swipe_distance) / 2);
                                if (swipe_top <= 0) {
                                    messageAction("滑动区域超限", 3);
                                    let fixed_rank_list_swipe_distance = ~~(uH * 0.95);
                                    swipe_top = ~~((uH - fixed_rank_list_swipe_distance) / 2);
                                    messageAction("自动修正滑动距离参数:", 3);
                                    messageAction("swipe_top: " + swipe_top, 3);
                                    $sto.af_cfg.put("config", Object.assign({}, $sto.af_cfg.get("config", {}), {
                                        "rank_list_swipe_distance": $cfg.rank_list_swipe_distance = fixed_rank_list_swipe_distance,
                                    }));
                                    messageAction("自动修正配置文件数据:", 3);
                                    messageAction("rank_list_swipe_distance: " + fixed_rank_list_swipe_distance, 3);
                                }
                                let swipe_bottom = uH - swipe_top;
                                let calc_swipe_distance = swipe_bottom - swipe_top;
                                let swipe_functional = false;
                                let swipeAndClickOutside = () => {
                                    if ((swipe_functional = swipe(halfW, swipe_bottom, halfW, swipe_top, swipe_time))) {
                                        // just to prevent screen from turning off;
                                        // maybe this is not a good idea
                                        let _outer = Math.pow(10, 7);
                                        click(_outer, _outer); // not press()
                                        return true;
                                    }
                                };
                                if (calc_swipe_distance >= 0.4 * H
                                    && calc_swipe_distance <= 0.9 * H
                                    && swipeAndClickOutside()) {
                                    return true;
                                }
                                debugInfo("滑动方法返回值: " + swipe_functional);
                            }

                            function checkRankListCaptDifference() {
                                let pool = $app.rank_list_capt_diff_check_pool;

                                for (let i = 0; i < pool.length; i += 1) {
                                    if (images.isRecycled(pool[i])) pool.splice(i--, 1);
                                }

                                if (!poolDiffThresholdReached()) {
                                    pool.push(images.copy($app.page.rl.capt_img));
                                    if ($app.forcible_swipe_check_flag) {
                                        return $app.forcible_swipe_check_flag = false;
                                    }
                                    let counter = $app.rank_list_capt_pool_diff_check_counter;
                                    return counter % 4 || !counter;
                                }

                                // tool function(s) //

                                function poolDiffThresholdReached() {
                                    let pool_len = pool.length;
                                    if (!pool_len) return;

                                    while (pool_len > 1) {
                                        images.reclaim(pool[0]);
                                        pool[0] = null;
                                        pool.splice(0, 1);
                                        pool_len = pool.length;
                                    }

                                    let similar_captures = false;

                                    try {
                                        similar_captures = images.findImage($app.page.rl.capt_img, pool[pool_len - 1]);
                                    } catch (e) {
                                        // debugInfo(["放弃排行榜截图样本差异检测", ">单次检测失败", ">" + e.message], 3);
                                    }

                                    let check_threshold = $cfg.rank_list_capt_pool_diff_check_threshold;
                                    if (similar_captures) {
                                        let counter = $app.rank_list_capt_pool_diff_check_counter += 1;
                                        debugInfo(["排行榜截图样本池差异检测:", "检测未通过: (" + counter + "\/" + check_threshold + ")"]);
                                        if (counter >= check_threshold) {
                                            $flag.rl_bottom_rch = true;
                                            debugInfo(["发送排行榜停检信号", ">已达截图样本池差异检测阈值"]);
                                            return true;
                                        }
                                    } else {
                                        // debugInfo("排行榜截图样本池差异检测通过");
                                        $app.rank_list_capt_pool_diff_check_counter = 0;
                                    }
                                }
                            }

                            function checkRankListBottomTemplate() {
                                let bottom_template = $app.rank_list_bottom_template;
                                if (bottom_template) {
                                    let template_height = bottom_template.height;
                                    if (template_height < cX(0.04) || template_height > cX(0.18)) {
                                        files.remove($app.rank_list_bottom_template_path);
                                        delete $app.rank_list_bottom_template;
                                        debugInfo(["列表底部控件图片模板已清除", ">图片模板高度值异常: " + template_height], 3);
                                        $app.monitor.rl_bottom.start();
                                    } else {
                                        let _mch = images.findImage($app.page.rl.capt_img, bottom_template, {level: 1});
                                        if (_mch) {
                                            $app.monitor.rl_bottom.interrupt();
                                            debugInfo(["列表底部条件满足", ">已匹配列表底部控件图片模板"]);
                                            return true;
                                        }
                                    }
                                }
                            }

                            function checkInvitationBtnColor() {
                                let color = "#30bf6c";
                                let multi_color = $app.check_invitation_btn_multi_colors || getCheckInvitationBtnMultiColors();

                                if (images.findMultiColors(
                                    $app.page.rl.capt_img, color, multi_color,
                                    {region: [cX(0.82), cY(0.62), cX(0.17), cY(0.37)], threshold: 10}
                                )) {
                                    debugInfo(["列表底部条件满足", ">指定区域匹配颜色成功", ">邀请按钮色值: " + color]);
                                    return true;
                                }

                                // tool function(s) //

                                function getCheckInvitationBtnMultiColors() {
                                    return $app.check_invitation_btn_multi_colors = [
                                        // color matrix:
                                        //   c   c c c   w
                                        // [ *   2 _ 4   _ ] -- 0 (cX)
                                        // [ 0   _ 3 _   6 ] -- 45 (cX)
                                        // [ _   2 _ 4   6 ] -- 90 (cX)
                                        // c: color; w: white (-1)
                                        // 2: 18; 4: 36; 6: 54; ... (cY)
                                        [0, cY(18, -1), color],
                                        [0, cY(36, -1), color],
                                        [cX(45), 0, color],
                                        [cX(45), cY(27, -1), color],
                                        [cX(45), cY(54, -1), -1],
                                        [cX(90), cY(18, -1), color],
                                        [cX(90), cY(36, -1), color],
                                        [cX(90), cY(54, -1), -1],
                                    ];
                                }
                            }
                        }
                    },
                    review: () => {
                        let _m_q = "放弃排行榜样本复查:"; // quit

                        if (!$cfg.timers_switch) {
                            return debugInfo([_m_q, "定时循环功能未开启"]);
                        }
                        if (!$cfg.rank_list_review_switch) {
                            return debugInfo([_m_q, "排行榜样本复查功能未开启"]);
                        }
                        if ($flag.rl_review_stop) {
                            return debugInfo([_m_q, "检测到复查停止信号"]);
                        }

                        let _trig = msg => {
                            let _msg = "触发排行榜样本复查条件:";
                            debugInfo([_msg, msg], "both");
                            return $flag.rl_review = true;
                        };

                        if ($cfg.rank_list_review_difference_switch) {
                            let _smp = fri.rl_samples;
                            let _old_keys = _smp && Object.keys(_smp);
                            let _new_keys = Object.keys(fri._getSmp());
                            if (!equalObjects(_old_keys, _new_keys)) {
                                return _trig("列表状态差异");
                            }
                        }
                        if ($cfg.rank_list_review_samples_clicked_switch) {
                            if ($flag.rl_valid_click) {
                                return _trig("样本点击记录");
                            }
                        }
                        if ($cfg.rank_list_review_threshold_switch) {
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
        // TODO ...
        (function setTimers() {
            if (!$cfg.timers_switch) return debugInfo("定时循环功能未开启");
            if (!$cfg.timers_self_manage_switch) return debugInfo("定时任务自动管理未开启");

            let type_info = {
                min_countdown: "最小倒计时",
                uninterrupted: "延时接力",
                insurance: "意外保险",
            };

            let ahead_own = $cfg.timers_countdown_check_own_timed_task_ahead;
            let ahead_friends = $cfg.timers_countdown_check_friends_timed_task_ahead;
            let min_own = ($af.min_ctd_own || Infinity) - ahead_own * 60000;
            let min_friends = ($af.min_ctd_fri || Infinity) - ahead_friends * 60000;

            let next_min_countdown_info = [Math.min(min_own, min_friends), "min_countdown"];
            let next_uninterrupted_info = [getNextUninterruptedTime(), "uninterrupted"];

            let next_launch = [next_min_countdown_info, next_uninterrupted_info].sort((a, b) => a[0] > b[0] ? 1 : -1)[0];
            if (next_launch[0] === Infinity) return debugInfo("无定时任务可设置");

            addOrUpdateAutoTask(next_launch);

            $app.monitor.insurance.interrupt().reset();

            // tool function(s) //

            function getNextUninterruptedTime() {
                if (!$cfg.timers_uninterrupted_check_switch) return ~debugInfo("延时接力机制未开启") && Infinity;

                let sections = $cfg.timers_uninterrupted_check_sections; // [{section: ["06:30", "00:00"], interval: 60}]
                if (!sections || !sections.length) return debugInfo("无延时接力区间数据");

                debugInfo("开始计算最小延时接力时间数据");

                let now = new Date();
                let millis_one_day = 24 * 3600 * 1000; // 86400000
                let next_time_arr = [];

                for (let i = 0, len = sections.length; i < len; i += 1) {
                    let {section, interval} = sections[i];

                    if (!section || !section.length) continue;

                    let today_date = now.toDateString();
                    let min_time = Date.parse(today_date + " " + section[0]); // timestamp
                    let max_time = Date.parse(today_date + " " + section[1]); // timestamp
                    while (max_time <= min_time) max_time += millis_one_day;
                    let delay_time = interval * 60000; // millis

                    let next_time = +now + delay_time;
                    if (+now < min_time) next_time = Math.max(next_time, min_time);
                    if (next_time > max_time) next_time = +now > max_time ? min_time + millis_one_day : max_time;

                    next_time_arr.push(next_time);
                }

                let next_time = next_time_arr.sort((a, b) => a > b ? 1 : -1)[0];
                debugInfo("时间数据: " + $app.tool.timeStr(next_time));

                return next_time;
            }

            function addOrUpdateAutoTask(info_arr) {
                let [next_launch_time, type] = info_arr;

                let task = update() || add();

                messageAction("任务ID: " + task.id, 1, 0, 1);
                messageAction("下次运行: " + $app.tool.timeStr(next_launch_time), 1, 0, 1);
                messageAction("任务类型: " + type_info[type], 1, 0, 1, 1);

                // tool function(s) //

                function update() {
                    let storage_task_id = $sto.af.get("next_auto_task", {}).task_id;
                    if (!storage_task_id) return;

                    let task = timers.getTimedTask(storage_task_id);
                    if (!task) return;

                    task.setMillis(next_launch_time);
                    timers.updateTimedTask(task);
                    messageAction("已更新自动定时任务", 1);
                    return task;
                }

                function add() {
                    let task = timers.addDisposableTask({
                        path: $app.cwp,
                        date: next_launch_time,
                    });
                    $sto.af.put("next_auto_task", {
                        task_id: task.id,
                        timestamp: next_launch_time,
                        type: type,
                    });
                    messageAction("已添加自动定时任务", 1);
                    return task;
                }
            }
        })();

        return $af;
    },
    epilogue: () => {
        // TODO merge into $acc.logBack()
        (function logBackInIfNeeded() {
            let {account_log_back_in_switch, account_log_back_in_max_continuous_times} = $cfg;
            let {init_logged_in_usr} = $acc;
            let sto_key_name = "log_back_in_user";
            let clearLogBackInStorage = () => {
                if ($sto.af.contains(sto_key_name)) {
                    $sto.af.remove(sto_key_name);
                    debugInfo("已清理回切账户存储信息");
                }
            };

            if ($flag.init_logged_in_main) {
                debugInfo(["无需回切账户", ">初始登录账户已是主账户"]);
                return clearLogBackInStorage();
            }

            if (!account_log_back_in_switch) {
                debugInfo(["无需回切账户", ">旧账户回切功能未开启"]);
                return clearLogBackInStorage();
            }

            if (!init_logged_in_usr) {
                debugInfo(["无法回切账户", ">未获取初始登录账户信息"]);
                return clearLogBackInStorage();
            }

            let init_data = {name: init_logged_in_usr, times: 0};
            let sto_data = $sto.af.get(sto_key_name, init_data);
            if (sto_data.name !== init_logged_in_usr) sto_data = init_data;

            if (sto_data.times >= account_log_back_in_max_continuous_times) {
                debugInfo([
                    "禁止回切账户",
                    ">此旧账户回切次数已达上限",
                    ">上限值: " + account_log_back_in_max_continuous_times
                ]);
                return clearLogBackInStorage();
            }

            sto_data.times += 1;
            debugInfo(["开始旧账户回切操作", ">当前连续回切次数: " + sto_data.times]);

            // TODO ...
            if (!$acc.login(init_logged_in_usr)) {
                debugInfo("旧账户回切失败", 3);
                return clearLogBackInStorage();
            }

            debugInfo("旧账户回切成功");
            $sto.af.put(sto_key_name, sto_data);
            debugInfo("已更新回切账户存储信息");
            return true;
        })();

        Promise.all([showResultAsync(), prepareForExitAsync()])
            .then(() => cleanRankListCaptPool())
            .then(() => screenOffIfNeededAsync())
            .then(() => $app.exit())
            .catch((e) => messageAction(e, 4, 1, 0, "both"));

        return $af;

        // promise function(s) //

        function showResultAsync() {
            return new Promise((resolve) => {
                if (!$cfg.message_showing_switch || !$cfg.result_showing_switch) return resolve(true);

                debugInfo("开始展示统计结果");

                let isNoneNegNum = num => !isNaN(+num) && +num >= 0;
                let own = $af.emount_c_own;
                debugInfo("自己能量收取值: " + own);
                let friends = $af.emount_c_fri;
                debugInfo("好友能量收取值: " + friends);
                if (!isNoneNegNum(own) || !isNoneNegNum(friends)) return resolve(showMessage("数据统计失败"));

                return resolve(showMessage(energyStr(friends, own) || "A fruitless attempt"));

                // tool function(s) //

                function energyStr(friends_num, self_num) {
                    let msg = "";
                    if (self_num) msg = "Energy from yourself: " + self_num + "g";
                    if (friends_num) msg += (self_num ? "\n" : "") + "Energy from friends: " + friends_num + "g";
                    return msg;
                }

                function showMessage(msg) {
                    msg.split("\n").forEach(msg => messageAction(msg, 1));
                    if (msg.match(/失败|错误/)) own = -1;
                    if ($cfg.floaty_result_switch) {
                        return showFloatyResultAsync(own, friends, $cfg.floaty_result_countdown);
                    }
                    messageAction(msg, null, 1);
                    debugInfo("统计结果展示完毕");

                    // tool function(s) //

                    function showFloatyResultAsync(you, friends, countdown) {
                        debugInfo("发送Floaty消息等待信号");
                        $flag.floaty_fin = 0;
                        let floaty_failed_flag = true;
                        let timeout = countdown * 1000;
                        debugInfo("时间参数: " + timeout);

                        let hints = [];

                        if (!~you) hints.push("SORRY");
                        else {
                            if (you) hints.push("YOURSELF: " + you);
                            if (friends) hints.push("FRIENDS: " + friends);
                        }
                        let hint_len = hints.length;
                        debugInfo("消息数量参数: " + hint_len);
                        if (hint_len === 2) hints = hints.map(str => str.replace(/(\w{3})\w+(?=:)/, "$1")); // %alias%.slice(0, 3) + ": \d+g"
                        if (hint_len === 1) hints = hints.map(str => str.replace(/(\w+)(?=:).*/, "$1")); // %alias% only
                        if (!hints.length) {
                            let pickUpOneNote = () => {
                                let notes = "NEVER.contains(SAY+DIE)%5cnLIFE+!%3d%3d+ALL+ROSES%5cnIMPOSSIBLE+%3d%3d%3d+undefined%5cnGOD.FAIR()+%3d%3d%3d+true%5cn%2f((%3f!GIVE+(UP%7cIN)).)%2b%2fi%5cnWORKMAN+%3d+new+Work()%5cnLUCK.length+%3d%3d%3d+Infinity%5cnLLIST.next+%3d%3d%3d+LUCKY%5cnBLESSING.discard(DISGUISE)%5cnWATER.drink().drink()".split("%5cn");
                                return decodeURIComponent(notes[~~(Math.rand(notes.length))]).replace(/\+(?!\/)/g, " ");
                            };
                            hints = [pickUpOneNote()];
                            debugInfo("随机挑选提示语");
                            hint_len = hints.length;
                        }

                        debugInfo("开始绘制Floaty");

                        let window_cvr = floaty.rawWindow(<frame id="cover" gravity="center" bg="#7f000000"/>);
                        let human_touched = false;

                        window_cvr["cover"].on("click", () => {
                            if (human_touched) {
                                floaty_failed_flag = false;
                                $flag.floaty_fin = 1;
                                debugInfo(["触发遮罩层触摸事件", "提前结束Floaty结果展示", "发送Floaty消息结束等待信号"]);
                                floaty.closeAll();
                            } else {
                                debugInfo(["模拟一次\"深度返回\"操作", ">检测到非用户点击行为"]);
                                keycode(4, "double");
                            }
                        });

                        window_cvr["cover"].setOnTouchListener(
                            function onTouch(view, event) {
                                if (!human_touched) {
                                    let {ACTION_DOWN, ACTION_UP, ACTION_MOVE} = android.view.MotionEvent;
                                    let ACT = event.getAction();
                                    if (ACT === ACTION_DOWN) human_touched = event.getY() > cY(0.12, -1);
                                    if (ACT === ACTION_MOVE) human_touched = true;
                                    if (ACT === ACTION_UP) human_touched = event.getEventTime() - event.getDownTime() > 200;
                                }
                                return false; // event will not be consumed and will send to onClickListener
                            }
                        );

                        window_cvr.setSize(-1, -1);
                        window_cvr.setTouchable(true); // prevent touch event transferring to the view beneath

                        let base_height = cY(0.66);
                        let message_height = cY(80, -1);
                        let hint_height = message_height * 0.7;
                        let timeout_height = hint_height;
                        let color_stripe_height = message_height * 0.2;

                        let message_layout =
                            <frame gravity="center">
                                <text id="text" bg="#cc000000" size="24" padding="10 2" color="#ccffffff" gravity="center"/>
                            </frame>;

                        let timeout_layout =
                            <frame gravity="center">
                                <text id="text" bg="#cc000000" size="14" color="#ccffffff" gravity="center" text=""/>
                            </frame>;

                        let color_stripe_layout =
                            <frame gravity="center">
                                <text id="text" bg="#ffffffff" size="24" padding="10 2" color="{{colors.toString(-1)}}" gravity="center"/>
                            </frame>;

                        let hint_layout =
                            <frame gravity="center">
                                <text id="text" bg="#cc000000" size="14" color="#ccffffff" gravity="center"/>
                            </frame>;

                        let message_raw_win = floaty.rawWindow(message_layout);

                        ui.run(() => {
                            message_raw_win.text.setText(!~you && "Statistics Failed" || (you + friends).toString() || "0");
                            message_raw_win.setSize(-2, 0);
                            let max_wait_time = 5000;
                            let start_timestamp = timeRecorder("message_raw_win_width");
                            while (timeRecorder("message_raw_win_width", "load") - start_timestamp < max_wait_time) {
                                if (message_raw_win.getWidth() > 0) break;
                            }
                        });

                        let min_width = Math.max(message_raw_win.getWidth(), cX(0.54), cX(0.25) * hint_len);
                        let left_pos = (W - min_width) / 2;

                        ui.run(() => {
                            message_raw_win.setPosition(left_pos, base_height);
                            message_raw_win.setSize(min_width, message_height);
                        });

                        let hint_top_pos = base_height - color_stripe_height - hint_height;
                        let color_stripe_up_top_pos = base_height - color_stripe_height;
                        let color_stripe_down_top_pos = base_height + message_height;
                        let timeout_top_pos = base_height + message_height + color_stripe_height;

                        let avg_width = ~~(min_width / hint_len);

                        let stripe_color_map = {
                            "YOU": "#7dae17",
                            "FRI": "#2ba653",
                            "SOR": "#a3555e", // SORRY
                            "OTHER": "#907aa3",
                        };

                        for (let i = 0; i < hint_len; i += 1) {
                            let current_hint = hints[i];
                            let current_hint_color = "#cc" + (stripe_color_map[current_hint.slice(0, 3)] || stripe_color_map["OTHER"]).slice(1);
                            let color_stripe_bg = colors.parseColor(current_hint_color);
                            let current_left_pos = left_pos + avg_width * i;
                            let current_width = i === hint_len - 1 ? min_width - (hint_len - 1) * avg_width : avg_width;

                            let color_stripe_raw_win_down = floaty.rawWindow(color_stripe_layout);
                            color_stripe_raw_win_down.setSize(1, 0);
                            ui.run(() => color_stripe_raw_win_down.text.setBackgroundColor(color_stripe_bg));
                            color_stripe_raw_win_down.setPosition(current_left_pos, color_stripe_down_top_pos);

                            let color_stripe_raw_win_up = floaty.rawWindow(color_stripe_layout);
                            color_stripe_raw_win_up.setSize(1, 0);
                            ui.run(() => color_stripe_raw_win_up.text.setBackgroundColor(color_stripe_bg));
                            color_stripe_raw_win_up.setPosition(current_left_pos, color_stripe_up_top_pos);

                            let hint_raw_win = floaty.rawWindow(hint_layout);
                            hint_raw_win.setSize(1, 0);
                            ui.run(() => hint_raw_win.text.setText(current_hint));
                            hint_raw_win.setPosition(current_left_pos, hint_top_pos);

                            color_stripe_raw_win_down.setSize(current_width, color_stripe_height);
                            color_stripe_raw_win_up.setSize(current_width, color_stripe_height);
                            hint_raw_win.setSize(current_width, hint_height);
                        }

                        let timeout_raw_win = floaty.rawWindow(timeout_layout);
                        timeout_raw_win.setSize(1, 0);
                        timeout_raw_win.setPosition(left_pos, timeout_top_pos);
                        timeout_raw_win.setSize(min_width, timeout_height);

                        setFloatyTimeoutText(countdown);

                        return new Promise((resolve) => {
                            debugInfo(["Floaty绘制完毕", "开始Floaty倒计时"]);
                            timeRecorder("set_floaty_timeout_text");

                            let condition = () => {
                                if (countdown <= 0 || $flag.floaty_fin) {
                                    if (floaty_failed_flag) {
                                        messageAction("此设备可能无法使用Floaty功能", 3, 1);
                                        messageAction("建议改用Toast方式显示收取结果", 3);
                                    }

                                    let prefix = floaty_failed_flag ? "强制" : "";
                                    debugInfo(prefix + "关闭所有Floaty窗口");
                                    floaty.closeAll();

                                    if ($flag.floaty_fin === 0) {
                                        $flag.floaty_fin = 1;
                                        debugInfo(prefix + "发送Floaty消息结束等待信号");
                                    }

                                    debugInfo(["Floaty倒计时结束", "统计结果展示完毕"]);
                                    return resolve() || true;
                                }
                            };

                            setIntervalBySetTimeout(function () {
                                let remaining_time = timeout - timeRecorder("set_floaty_timeout_text", "load");
                                let remaining_countdown = Math.ceil(remaining_time / 1000);
                                if (remaining_countdown < countdown) {
                                    setFloatyTimeoutText(Math.max(0, countdown = remaining_countdown));
                                }
                            }, 200, condition);
                        });

                        // tool function(s) //

                        function setFloatyTimeoutText(countdown) {
                            ui.run(function () {
                                try {
                                    debugInfo("设置倒计时数据文本: " + countdown);
                                    timeout_raw_win.text.setText(surroundWith(countdown, "(", ")"));
                                    floaty_failed_flag = false;
                                } catch (e) {
                                    $flag.floaty_fin || debugInfo(["Floaty倒计时文本设置单次失败:", e.message]);
                                }
                            });
                        }
                    }
                }
            });
        }

        function prepareForExitAsync() {
            $app.blist.save();
            $app.page.closeIntelligently();
            $app.page.autojs.spring_board.remove();
            $flag.glob_e_scr_privilege = true;

            return new Promise((resolve) => {
                if ($flag.floaty_fin === 1) return resolve();

                timeRecorder("wait_for_floaty_msg_finished");
                let max_wait_duration = (+$cfg.floaty_result_countdown + 3) * 1000;
                let timedOut = () => timeRecorder("wait_for_floaty_msg_finished", "load") > max_wait_duration;

                debugInfo("等待Floaty消息结束等待信号");

                let condition = () => {
                    if ($flag.floaty_fin === 1) {
                        return resolve() || true;
                    }
                };

                setIntervalBySetTimeout(function () {
                    if (timedOut()) {
                        $flag.floaty_fin = 1;
                        debugInfo(["放弃等待Floaty消息结束信号", ">等待结束信号超时"], 3);
                        resolve();
                    }
                }, 200, condition);
            });
        }

        // tool function(s) //

        function screenOffIfNeededAsync() {
            if ($app.init_scr_on) return debugInfo("无需关闭屏幕");

            $flag.glob_e_scr_paused = true;
            debugInfo("尝试关闭屏幕");

            try {
                if (screenOffByKeyCode()) return debugInfo("关闭屏幕成功") || true;
            } catch (e) {
                messageAction(e.message, 4, 1, 0, "both");
            }

            return Promise.resolve()
                .then(screenOffByModifyingAndroidSettingsProviderAsync)
                .catch(e => messageAction(e.message, 4, 0, 1, 1))
                .then(result => result ? debugInfo("关闭屏幕成功") : debugInfo("关闭屏幕失败", 3));

            // tool function (s) //

            function screenOffByKeyCode() {
                let strategy_name = "模拟电源按键";
                debugInfo("尝试策略: " + strategy_name);

                if (!checkBugModel()) return false;

                timeRecorder("SCREEN_OFF_TIMEOUT");
                let keycode_name = "26";
                if (keycode(keycode_name, "no_err_msg")) {
                    debugInfo("策略执行成功");
                    debugInfo("用时: " + timeRecorder("SCREEN_OFF_TIMEOUT", "load", "auto"));
                    return true;
                }
                debugInfo(["策略执行失败", ">按键模拟失败", ">键值: " + keycode_name]);
                return false;

                // tool function(s) //

                function checkBugModel() {
                    let device_brand = device.brand;
                    let keycode_power_bug_versions = [/[Mm]eizu/]; // poor guy, don't cry... [:sweat_smile:]
                    for (let i = 0, len = keycode_power_bug_versions.length; i < len; i += 1) {
                        if (device_brand.match(keycode_power_bug_versions[i])) {
                            return debugInfo(["策略执行失败", ">设备型号不支持KeyCode方法", ">设备型号: " + device_brand]) && false;
                        }
                    }
                    return true;
                }
            }

            function screenOffByModifyingAndroidSettingsProviderAsync() {
                let sto = storages.create("screen_off_by_modifying_android_settings_provider_params");
                let {System, Global, Secure} = android.provider.Settings;
                let {SCREEN_OFF_TIMEOUT} = System;
                let {DEVELOPMENT_SETTINGS_ENABLED} = Secure;
                let {STAY_ON_WHILE_PLUGGED_IN} = Global;
                let context_resolver = context.getContentResolver();
                let setScreenOffTimeout = time => System.putInt(context_resolver, SCREEN_OFF_TIMEOUT, time || 1);
                let setStayOnState = state => Global.putInt(context_resolver, STAY_ON_WHILE_PLUGGED_IN, state || 0);
                let screen_off_result = false;

                let strategy_name = "修改屏幕超时参数";
                debugInfo("尝试策略: " + strategy_name);

                if (!System.canWrite(context)) {
                    debugInfo([
                        "策略执行失败",
                        ">需要\"修改系统设置\"权限",
                        ">可使用以下工具获得帮助支持:",
                        ">" + files.path("./Tools/Auto.js_Write_Settings_Permission_Helper.js")
                    ]);
                    return false;
                }

                return Promise.resolve()
                    .then(() => timeRecorder("settings_provider_params"))
                    .then(() => setScreenOffParams(1))
                    .then(() => monitorScreenStateAsync())
                    .then(() => restoreScreenParams())
                    .then(() => screen_off_result)
                    .catch(e => messageAction(e, 4));

                // tool function(s) //

                function setScreenOffParams(time) {
                    let current_dev_enabled = Secure.getInt(context_resolver, DEVELOPMENT_SETTINGS_ENABLED, 0);
                    let current_stay_on_state = Global.getInt(context_resolver, STAY_ON_WHILE_PLUGGED_IN, 0);
                    if (current_dev_enabled && current_stay_on_state) {
                        sto.put("STAY_ON_WHILE_PLUGGED_IN", current_stay_on_state);
                        setStayOnState(0);
                    }

                    let current_screen_off_timeout = System.getInt(context_resolver, SCREEN_OFF_TIMEOUT, 0);
                    if (current_screen_off_timeout > 2000) sto.put("SCREEN_OFF_TIMEOUT", current_screen_off_timeout);
                    setScreenOffTimeout(time);
                }

                function restoreScreenParams() {
                    debugInfo("恢复修改前的设置参数:");

                    let sto_stay_on_state_value = sto.get("STAY_ON_WHILE_PLUGGED_IN", 0);
                    if (sto_stay_on_state_value) {
                        setStayOnState(sto_stay_on_state_value);
                        debugInfo("STAY_ON_WHILE_PLUGGED_IN: " + sto_stay_on_state_value);
                    }

                    let sto_timeout_value = sto.get("SCREEN_OFF_TIMEOUT", 60000);
                    setScreenOffTimeout(sto_timeout_value);
                    debugInfo("SCREEN_OFF_TIMEOUT: " + sto_timeout_value);

                    storages.remove("screen_off_by_modifying_android_settings_provider_params");
                }

                function monitorScreenStateAsync() {
                    return new Promise((resolve) => {
                        let timedOut = () => timeRecorder("settings_provider_params", "load") > 20000;
                        setIntervalBySetTimeout(function () {
                            if (timedOut()) {
                                debugInfo([
                                    "策略执行失败",
                                    ">等待屏幕关闭时间已达阈值",
                                    ">有关此策略更多详细信息",
                                    ">可使用并参阅以下工具:",
                                    ">" + files.path("./Tools/Auto.js_Write_Settings_Permission_Helper.js")
                                ]);
                                resolve(false);
                            }
                        }, 200, () => {
                            if (!device.isScreenOn()) {
                                debugInfo("策略执行成功");
                                debugInfo("用时: " + timeRecorder("settings_provider_params", "load", "auto"));
                                return resolve(screen_off_result = true) || true;
                            }
                            if (timedOut()) return true;
                        });
                    });
                }
            }
        }

        function cleanRankListCaptPool() {
            try {
                debugInfo("清理排行榜截图样本池");
                let pool = $app.rank_list_capt_diff_check_pool || [];
                while (pool.length) pool.shift().recycle();
            } catch (e) {
                messageAction(e.message, 4, 1, 0, "both");
            }
        }
    }
};

// entrance //
$init.check().global().queue().delay().prompt().monitor().unlock().command();

$af.launch().collect().timers().epilogue();

/**
 * @appendix Code abbreviation dictionary
 * May be helpful for code readers and developers
 * Not all items showed up in this project
 * @abbr acc: account | amt: amount | accu: accumulated | af: ant forest | app: application | args: arguments | argv: argument values | avail: available | avt: avatar | b: bottom; bounds; backup | bak: backup | blist: blacklist | btn: button | cfg: configuration | chk: check | cmd: command | cnsl: console | cnt: count | cond: condition | constr: constructor | ctd: countdown | ctx: context | cur: current | cwd: current working directory | cwp: current working path | d: dialog | dec: decode | def: default | desc: description | dev: device | diag: dialog | dis: dismiss | disp: display | du: duration | e: error; engine; event | enc: encode | ent: entrance | evt: event | excl: exclusive | exec: execution | ext: extension | fg: foreground | flg: flag | forc: force; forcible; forcibly | fri: friend | fs: functions | fst: forest | glob: global | gns: get and set | ident: identification | idt: identification | idx: index | ifn: if needed | inf: information | info: information | inp: input | intrp: interrupt | itv: interval | js: javascript | l: left | lbl: label | lmt: limit | ln: line | lsn: listen; listener | mod: module | msg: message | mthd: method | neg: negative | neu: neutral | num: number | o: object | opr: operation | opt: option; optional | oth: other | par: parameter | param: parameter | pg: page | pkg: package | pos: position | pref: prefix | prv: privilege | que: queue | r: right | rect: rectangle | res: result | rl: rank list | rls: release | sav: save | scr: screen | sec: second | sel: selector | sgn: signal | src: source | stat: statistics | stg: strategy | sto: storage | str: string | succ: success; successful | sw: switch | sym: symbol | t: top; time | tmp: temporary | tpl: template | trig: trigger; triggered | ts: timestamp | tt: title; timeout | u: unit | usr: user | util: utility | v: value | nec: necessary | cfm: confirm | ens: ensure | agn: again | ls: list | thrd: threshold | ele: element | egy: energy | eball(s): energy ball(s) | emount: energy amount | buf: buffer | thd(s): thread(s) | sect: section | grn: green | org: orange | monit: monitor | ic: increase | dc: decrease | ctr: counter | rch: reach; reached | frst: forest | cf: comparision (latin: conferatur) | smp: sample | len: length | c: compass; coordination(s) | n: name; nickname | exc: exception | lv: level | i: intent; increment | col: color | dys: dysfunctional | act: action; activity | dnt: donation | mon: monitor | clp: clip | gt: greater than | cvr: cover | rsn: reason | lch: launch | or: orientation | vert: vertical | horiz: horizontal | cnt: count | nball(s): normal ball(s) | prog: progress | arci: archive(d) | oball(s): orange ball(s) | gdball(s): golden ball(s) | itball(s): initialized ball(s) | rev: review | p: press | mch: matched | nm: name | stab: stable | excpt: exception
 */