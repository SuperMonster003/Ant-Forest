/**
 * @overview alipay ant forest energy intelligent collection script
 *
 * @last_modified Dec 9, 2019
 * @version 1.9.10 Beta7
 * @author SuperMonster003
 *
 * @tutorial {@link https://github.com/SuperMonster003/Auto.js_Projects/tree/Ant_Forest}
 */

let {
    $sel, $app, $cfg, $sto, $dev, $flag, $acc,
    ui, app, sleep, dialogs, storages, android, exit,
    floaty, idMatches, colors, toast, files, engines,
    events, timers, threads, swipe, device, selector,
    auto, className, images, currentPackage,
} = global;

$sel = $app = $cfg = $sto = $dev = $flag = $acc = {};

let $init = {
    check: function () {
        let _modules_map = [
            "MODULE_MONSTER_FUNC", "MODULE_DEFAULT_CONFIG",
            "MODULE_PWMAP", "MODULE_UNLOCK", "MODULE_STORAGE",
            "EXT_DIALOGS", "EXT_TIMERS", "EXT_DEVICE",
            "EXT_APP", "EXT_IMAGES",
        ];
        // do not `require()` before `checkModulesMap()`
        let checkSdkAndAJVer = () => {
            let _mod = require("./Modules/MODULE_MONSTER_FUNC");
            return _mod.checkSdkAndAJVer();
        };

        checkAlipayPackage();
        checkAccessibility();
        checkModulesMap(_modules_map);
        checkSdkAndAJVer();

        // `return this;` wasn't adopted here
        // considering a chaining source jump for IDE like WebStorm
        return $init;

        // tool function(s) //

        function checkAlipayPackage() {
            let _pkg = "com.eg.android.AlipayGphone";
            if (!app.getAppName(_pkg)) {
                messageAction('此设备可能未安装"支付宝"应用', 9, 1, 0, "both");
            }
            return $app.package_name = _pkg;
        }

        function checkAccessibility() {
            let [line, msg] = [showSplitLineRaw, messageActionRaw];
            if (!swipe(10000, 0, 10000, 0, 1)) {
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

        function checkModulesMap(modules) {
            let wanted = [];
            for (let i = 0, len = modules.length; i < len; i += 1) {
                let module = modules[i];
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
                for (let i = 0; i < 16; i += 1) _split_line += "- ";
                _split_line += "-";
            } else {
                for (let i = 0; i < 32; i += 1) _split_line += "-";
            }
            return ~console.log(_split_line + _extra_str);
        }
    },
    global: function () {
        setGlobalTypeChecker(); // `$$xxx()`
        setGlobalExtensions(); // EXT MODULES
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

        appSetter().setEngine().setTask().setParams().setBlist().setPage();

        $acc.main = {
            name: $cfg.main_account_info.account_name,
            code: $cfg.main_account_info.account_code,
        };

        debugInfo("开发者测试日志已启用", "both_dash_Up");
        debugInfo("Auto.js版本: " + $app.autojs_ver);
        debugInfo("项目版本: " + $app.project_ver);
        debugInfo("安卓系统SDK版本: " + $app.sdk_ver);

        return $init;

        // tool function(s) //

        function setGlobalExtensions() {
            require("./Modules/EXT_DEVICE").load();
            require("./Modules/EXT_TIMERS").load();
            require("./Modules/EXT_DIALOGS").load();
            require("./Modules/EXT_APP").load();
            require("./Modules/EXT_IMAGES").load();
            require("./Modules/EXT_THREADS").load();
        }

        function appSetter() {
            return {
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
                    });

                    return this;
                },
                setTask: function () {
                    Object.defineProperties($app, {
                        setPostponedTask: {
                            value: function (duration, toast_flag) {
                                $flag.task_deploying || threads.starts(function () {
                                    $flag.task_deploying = true;

                                    let _task_str = surroundWith("蚂蚁森林") + "任务";
                                    let _du_str = duration + "分钟";
                                    toast_flag === false || toast(_task_str + "推迟 " + _du_str);
                                    messageAction("推迟" + _task_str, 1, 0, 0, "up");
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

                    return this;
                },
                setParams: function () {
                    // _unESC says, like me if you also like unicode games :)
                    let _unESC = s => unescape(s.replace(/(\w{4})/g, "%u$1"));
                    let _local_pics_path = files.getSdcardPath() + "/.local/Pics/";

                    files.createWithDirs(_local_pics_path);

                    Object.defineProperties($app, {
                        task_name: {value: surroundWith(_unESC("8682868168EE6797"))},
                        rl_title: {value: _unESC("2615FE0F0020597D53CB6392884C699C")},
                        local_pics_path: {value: _local_pics_path},
                        rex_energy_amt: {value: /^\s*\d+(\.\d+)?(k?g|t)\s*$/},
                    });

                    // TODO refactoring needed here
                    (function prologue() {
                        $sel.add("alipay_home", [/首页|Homepage/, {boundsInside: [0, cY(0.7), W, H]}])
                            .add("af_title", [/蚂蚁森林|Ant Forest/, {boundsInside: [0, 0, cX(0.4), cY(0.2)]}])
                            .add("af_home", /合种|背包|通知|攻略|任务|.*大树养成.*/)
                            .add("rl_title", $app.rl_title)
                            .add("rl_ent", /查看更多好友|View more friends/) // rank list entrance

                            // TODO to replace
                            .add("rl_end_ident", /.*没有更多.*/)

                            .add("wait_awhile", /.*稍等片刻.*/)
                            .add("reload_fst_page", "重新加载")
                            .add("close_btn", /关闭|Close/)
                            .add("user_nickname", [$app.rex_energy_amt, "p2c2c0c0"])
                        ;

                        $app.kw_rank_list = () => {
                            let ref = [
                                [idMatches(/.*J_rank_list_append/), 0],
                                [idMatches(/.*J_rank_list/), 0]
                            ];
                            for (let i = 0, len = ref.length; i < len; i += 1) {
                                let arr = ref[i];
                                let node = arr[0].findOnce();
                                if (!node) continue;
                                arr[1] = node.childCount();
                                if (arr[1] > 5) {
                                    if (i === 0) return ($app.kw_rank_list = () => idMatches(/.*J_rank_list_append/))();
                                    if (i === 1) return ($app.kw_rank_list = () => idMatches(/.*J_rank_list/))();
                                }
                            }
                            return ref.sort((a, b) => b[1] - a[1])[0][0];
                        };
                        $app.kw_rank_list_more = type => $sel.pickup(idMatches(/.*J_rank_list_more/), type, "kw_rank_list_more");
                        $app.kw_login_btn = type => $sel.pickup(/登录|Log in|.*loginButton/, type, "kw_login_btn");
                        $app.kw_login_by_code_btn = type => $sel.pickup(/密码登录|Log ?in with password/, type, "kw_login_by_code_btn");
                        $app.kw_login_with_other_user = type => $sel.pickup(/换个账号登录|.*switchAccount/, type, "kw_login_with_other_user");
                        $app.kw_login_with_other_method = type => {
                            let memory_keyword = "kw_login_with_other_method";
                            return $sel.pickup(/换个方式登录|Switch login method|.*switchLoginMethod/, type, memory_keyword);
                        };
                        $app.kw_login_with_other_method_in_init_page = type => {
                            let memory_keyword = "kw_login_with_other_method_in_init_page";
                            return $sel.pickup(/其他登录方式|Other accounts/, type, memory_keyword);
                        };
                        $app.kw_login_next_step_btn = type => $sel.pickup(/下一步|Next|.*nextButton/, type, "kw_login_next_step_btn");
                        $app.kw_login_error_ensure_btn = type => $sel.pickup(idMatches(/.*ensure/), type, "kw_login_error_ensure_btn");
                        $app.kw_input_label_account = type => $sel.pickup(/账号|Account/, type, "kw_input_label_account");
                        $app.kw_input_label_code = type => $sel.pickup(/密码|Password/, type, "kw_input_label_code");
                        $app.kw_user_logged_out = type => {
                            let regexp_logged_out = new RegExp(".*(" +
                                /在其他设备登录|logged +in +on +another/.source + "|" +
                                /.*账号于.*通过.*登录.*|account +logged +on +to/.source +
                                ").*");
                            $sel.pickup(regexp_logged_out, type, "kw_user_logged_out");
                        };
                        $app.kw_login_with_new_user = type => $sel.pickup(/换个新账号登录|[Aa]dd [Aa]ccount/, type, "kw_login_with_new_user");
                        $app.kw_switch_account_title = type => $sel.pickup(/账号切换|Accounts/, type, "kw_switch_account_title");
                        $app.getLoginErrorMsg = () => {
                            return $sel.pickup(id("com.alipay.mobile.antui:id/message"), "txt", "alipay_antui_msg")
                                || $sel.pickup([$app.kw_login_error_ensure_btn(), "p2c0c0c0"], "txt");
                        };
                        $app.isInLoginPage = () => {
                            return $app.kw_login_with_other_user()
                                || $app.kw_input_label_account()
                                || $app.kw_login_with_other_method_in_init_page();
                        };
                        $app.isInSwitchAccPage = () => $app.kw_login_with_new_user() || $app.kw_switch_account_title();
                        $app.logged_blist_names = [];
                        $app.homepage_intent = {
                            app_id_rich: {
                                action: "VIEW",
                                data: encodeURIParams("alipays://platformapi/startapp", {
                                    appId: 60000002,
                                    appClearTop: "NO",
                                    startMultApp: "YES",
                                    // enableScrollBar: "NO",
                                    // backBehavior: "auto",
                                    defaultTitle: "",
                                }),
                            },
                            app_id_plain: {
                                action: "VIEW",
                                data: encodeURIParams("alipays://platformapi/startapp", {
                                    appId: 60000002,
                                    // defaultTitle: "",
                                }),
                            },
                            common_browser_rich: {
                                action: "VIEW",
                                data: encodeURIParams("alipays://platformapi/startapp", {
                                    saId: 20000067,
                                    url: "https://60000002.h5app.alipay.com/www/home.html",
                                    __webview_options__: {
                                        showOptionMenu: "YES",
                                        startMultApp: "YES",
                                        enableScrollBar: "NO",
                                    },
                                }),
                            },
                        };
                        $app.rank_list_intent = {
                            action: "VIEW",
                            data: encodeURIParams("alipays://platformapi/startapp", {
                                saId: 20000067,
                                url: "https://60000002.h5app.alipay.com/www/listRank.html",
                                __webview_options__: {
                                    startMultApp: "YES",
                                    showOptionMenu: "YES",
                                    appClearTop: "NO",
                                    enableScrollBar: "NO",
                                    defaultTitle: $app.rl_title,
                                    transparentTitle: "none",
                                },
                            }),
                        };
                        $app.rank_list_icon_collect = $sto.af.get("af_rank_list_icon_collect");
                        $app.rank_list_icon_help = $sto.af.get("af_rank_list_icon_help");
                        $app.rank_list_bottom_template_path = $cfg.rank_list_bottom_template_path;
                        $app.rank_list_bottom_template = images.read($app.rank_list_bottom_template_path);
                        $app.rank_list_capt_img = null;
                        $app.rank_list_capt_diff_check_pool = [];
                        $app.rankListNode = (opr) => {
                            let {rank_list_node} = $app;
                            if (opr === "recycle") {
                                let result = true;
                                if (rank_list_node) result = rank_list_node.recycle();
                                $app.rank_list_node = null;
                                return result;
                            }
                            if (opr === "refresh") {
                                if (rank_list_node) {
                                    rank_list_node.refresh();
                                    return rank_list_node;
                                }
                            }
                            return _getNode();

                            // tool function(s) //

                            function _getNode() {
                                let nodes = $sel.pickup($app.rex_energy_amt, "nodes");
                                let min_list_node_height = cY(256, -1);

                                for (let i = nodes.length - 1; i >= 0; i -= 1) {
                                    let node = nodes[i];
                                    for (let j = 0; i < 6; j += 1) {
                                        let _node = $sel.pickup([node, "p" + j]);
                                        if (!_node) break;
                                        let _bounds = _node.bounds();
                                        if (!_bounds) break;
                                        if (_bounds.height() >= min_list_node_height) {
                                            return $app.rank_list_node = _node;
                                        }
                                    }
                                }
                                return null;
                            }
                        };
                        $app.total_energy_collect_own = 0;
                        $app.total_energy_collect_friends = 0;
                        $app.rank_list_friend_max_invalid_drop_by_times = 5;
                        $app.rank_list_capt_pool_diff_check_counter = 0;
                        $app.kill_when_done_intelligent_kill = $cfg.kill_when_done_intelligent
                            && ($app.init_fg_pkg !== $app.package_name);
                        $app.friend_drop_by_counter = {
                            get increase() {
                                return (name) => {
                                    global[name] = global[name] || 0;
                                    if (global[name] >= $app.rank_list_friend_max_invalid_drop_by_times) {
                                        debugInfo("发送停止排行榜样本停止复查信号");
                                        return $app.rank_list_review_stop_signal = true;
                                    }
                                    if (!global[name]) global[name] = 1;
                                    else global[name] += 1;
                                };
                            },
                            get decrease() {
                                return (name) => {
                                    global[name] = global[name] || 0;
                                    if (global[name] > 1) global[name] -= 1;
                                    else global[name] = 0;
                                };
                            },
                        };
                        $app.isAutojsLogPage = () => checkAutojsTitle(/日志|Log/, "kw_autojs_log_page_title");
                        $app.isAutojsSettingsPage = () => checkAutojsTitle(/设置|Settings?/, "kw_autojs_settings_page_title");
                        $app.isAutojsHomepage = () => $sel.pickup(idMatches(/.*action_(log|search)/));
                        $app.isAutojsForeground = () => $sel.pickup(["Navigate up", {className: "ImageButton"}], "node", "kw_autojs_back_btn")
                            || $app.isAutojsHomepage() || $app.isAutojsLogPage()
                            || $app.isAutojsSettingsPage() || $sel.pickup(idMatches(/.*md_\w+/));
                        $app.init_autojs_state = {
                            init_foreground: $app.isAutojsForeground(),
                            init_homepage: $app.isAutojsHomepage(),
                            init_log_page: $app.isAutojsLogPage(),
                            init_settings_page: $app.isAutojsSettingsPage(),
                        };

                        debugInfo("会话参数赋值完毕");

                        setMaxRunTime();

                        // tool function(s) //

                        function setMaxRunTime() {
                            let max = $cfg.max_running_time_global;

                            if (!max || !+max) return;

                            threads.starts(function () {
                                setTimeout(function () {
                                    ui.post(() => messageAction("超时强制退出", 9, 1, 0, "both_n"));
                                }, +max * 60000 + 3000);
                            });
                            debugInfo("单次运行最大超时设置完毕");
                        }

                        function checkAutojsTitle(regexp, memory_keyword) {
                            $sel.pickup([regexp, {
                                className: "TextView",
                                boundsInside: [cX(0.12), cY(0.03, -1), cX(0.5), cY(0.12, -1)],
                            }], memory_keyword)
                        }
                    })();

                    return this;
                },
                setBlist: function () {
                    $app.blist = {
                        get init() {
                            return () => {
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
                                                if (!_ts || _expired(_ts)) delete this.blist_data[name];
                                            });
                                            return this;
                                        },
                                        message: function () {
                                            let _del_len = this.deleted.length;
                                            if (_del_len && $flag.msg_details) {
                                                messageAction("移除黑名单记录: " + _del_len + "项", 1, 0, 0, "both");
                                                this.deleted.forEach(n => messageAction(n, 1, 0, 1));
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
                            };
                        },
                        _expired: {
                            trigger: function (ts) {
                                if ($$und(ts) || $$inf(ts)) return false;

                                let now = this.now = new Date();
                                let du_ts = this.du_ts = ts - +now;
                                if (du_ts <= 0) return true;
                            },
                            message: function () {
                                if ($flag.msg_details) {
                                    let du_time_o = new Date(Date.parse(this.now.toDateString()) + this.du_ts);
                                    let padZero = num => ("0" + num).slice(-2);
                                    let dd = Math.floor(this.du_ts / 1000 / 3600 / 24);
                                    let hh = du_time_o.getHours();
                                    let mm = du_time_o.getMinutes();
                                    let ss = du_time_o.getSeconds();
                                    let dd_str = dd ? dd + "天" : "";
                                    let hh_str = hh ? padZero(hh) + "时" : "";
                                    let mm_str = hh || mm ? padZero(mm) + "分" : "";
                                    let ss_str = (hh || mm ? padZero(ss) : ss) + "秒";
                                    return dd_str + hh_str + mm_str + ss_str + "后解除";
                                }
                            }
                        },
                        get: function (name, def) {
                            return name && this.data[name] || def;
                        },
                        save: function () {
                            $sto.af.put("blacklist", this.data);
                            return this;
                        },
                        has: function (name) {
                            return !!this.get(name);
                        },
                        add: function (data) {
                            if ($$obj(data)) {
                                Object.assign(this.data, data);
                                return this;
                            }
                            if ($$len(arguments, 3)) {
                                let _data = {};
                                _data[arguments[0]] = {
                                    timestamp: arguments[1],
                                    reason: arguments[2],
                                };
                                Object.assign(this.data, _data);
                                return this;
                            }
                            messageAction("黑名单添加方法参数不合法", 9, 1, 0, "both");
                        },
                        data: {},
                    }.init().save();

                    return this;
                },
                setPage: function () {
                    $app.page = {
                        /**
                         * @param rect {array} -- just an array[], rather than Java Rect
                         * @returns {UiObject}
                         */
                        _getClickable: function (rect) {
                            let _sel = selector();
                            rect = rect.map((x, i) => !~x ? i % 2 ? W : H : x);
                            return _sel.boundsInside.apply(_sel, rect).clickable().findOnce();
                        },
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
                                let text = function () {
                                    return $sel.pickup([/关闭|Close/, "c0", {clickable: true}])
                                        || $sel.pickup([/关闭|Close/, {clickable: true}]);
                                };
                                let id = () => null; // so far
                                let bak = [cX(0.8), 0, -1, cY(200, -1)];

                                return [text, id, bak];
                            })(),
                        },
                        _implement: function (fs) {
                            for (let i = 0, len = fs.length; i < len; i += 1) {
                                let _checker = fs[i];
                                if ($$arr(_checker)) {
                                    _checker = () => this._getClickable(fs[i]);
                                }
                                let _node = _checker();
                                if (_node) return clickAction(_node, "widget");
                            }
                        },
                        back: function (no_bak) {
                            return this._implement(this._plans.back, no_bak);
                        },
                        close: function (no_bak) {
                            return this._implement(this._plans.close, no_bak);
                        },
                        keyBack: n => keycode(4, n),
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
                    messageAction("脚本因安全限制被强制终止", 3, 0, 0, "up");
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
                        sleep(Math.random() * 1000 + 500);
                    }

                    debugInfo("任务排队用时: " + timeRecorder("script_queue_total", "load", "auto"), "Up");
                },
            };
        }
    },
    delay: function () {
        let fg_app_blist = fgAppBlistSetter();
        fg_app_blist.trigger() ? fg_app_blist.autoDelay() : fg_app_blist.clear();

        $init.delay = {fg_app_blist: fg_app_blist};

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
                    messageAction("前置应用位于黑名单中:", 1, 0, 0, "up");
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

        $app.prompt = {
            script_config: script_config,
            before_running: before_running,
        };

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
                                    messageAction("强制结束脚本", 4, 0, 0, "up");
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
                                    messageAction("强制结束脚本", 4, 0, 0, "up");
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
        let insurance = insuranceMonSetter();
        insurance.trigger() && insurance.clean().deploy().monitor();

        // instant and private monitors
        let instant = instantMonSetter();
        instant.volKeys().globEvt();

        // monitors put on standby for $app
        let standby = standbyMonSetter();

        $app.monitor = Object.assign({insurance: insurance}, standby);

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
                    return this;
                },
                reset: function () {
                    this.clean();
                    this._sto_accu = 0;
                    return this;
                },
                deploy: function () {
                    this.task = timers.addDisposableTask({
                        path: $app.cwp,
                        date: this._next_task_time,
                    });

                    $sto.af.put(keys.ins_tasks, this._sto_ids.concat([this.task.id]));
                    debugInfo(["已设置意外保险定时任务:", "任务ID: " + this.task.id]);

                    return this;
                },
                monitor: function () {
                    this._thread = threads.starts(function () {
                        setInterval(() => {
                            self.task.setMillis(self._next_task_time);
                            timers.updateTimedTask(self.task);
                        }, 10000);
                    });

                    return this;
                },
                interrupt: function () {
                    let _thr = this._thread;
                    _thr && _thr.interrupt();

                    return this;
                }
            };

            return self;
        }

        function instantMonSetter() {
            return {volKeys: volKeys, globEvt: globEvt};

            // tool function(s) //

            function volKeys() {
                debugInfo("设置音量键监听器");
                threads.starts(function () {
                    events.removeAllKeyDownListeners("volume_up");
                    events.removeAllKeyDownListeners("volume_down");
                    events.observeKey();
                    events.onKeyDown("volume_up", function (e) {
                        messageAction("强制停止所有脚本", 4, 0, 0, "up");
                        messageAction("用户按下'音量加/VOL+'键", 4, 0, 1, 1);
                        threads.shutDownAll();
                        engines.stopAllAndToast();
                    });
                    events.onKeyDown("volume_down", function (e) {
                        messageAction("强制停止当前脚本", 3, 1, 0, "up");
                        messageAction("用户按下'音量减/VOL-'键", 3, 0, 1, 1);
                        threads.shutDownAll();
                        $app.my_engine.forceStop();
                    });
                });
                return this;
            }

            function globEvt() {
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
                                        messageAction("强制停止脚本", 4, 1, 0, "up");
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
                                app.launchPackage($app.package_name);
                            },
                        },
                        screen: {
                            trigger: () => {
                                return $flag.dev_unlocked
                                    && !$flag.glob_e_scr_paused
                                    && !device.isScreenOn();
                            },
                            onTrigger: () => {
                                if ($flag.glob_e_scr_prv) {
                                    messageAction("允许脚本提前退出", 3, 1, 0, "up");
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
            }
        }

        // TODO ...
        function standbyMonSetter() {
            return {};
        }
    },
    unlock: function () {
        if (!$dev.is_screen_on && !$cfg.auto_unlock_switch) {
            messageAction("脚本无法继续", 4, 0, 0, "up");
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
                        get_fri_list: _commands.friList,
                        get_cur_acc_name: _commands.curAccName,
                    };
                },
                trigger: function () {
                    let _cmd = this.cmd;
                    if (!_cmd) return;
                    if (!(_cmd in this.cmd_list)) {
                        messageAction("脚本无法继续", 4, 0, 0, "up");
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

                // TODO refactoring needed here; dysfunctional so far
                commands: {
                    friList: function () {
                        timeRecorder("get_fri_list", "save");

                        plans("launch_rank_list", {
                            task_name: "好友列表采集",
                            first_time_run_message_flag: false,
                            condition_launch: () => true,
                            condition_ready: () => {
                                // TODO "intent_with_params" only so far
                                let a1 = () => $sel.get("rl_title");
                                let a2 = () => $sel.pickup($app.rex_energy_amt);
                                let b = () => !$sel.pickup("查看更多好友") && $sel.pickup(/.*环保证书/);
                                return a1() && a2() || b();
                            },
                            disturbance: () => {
                                clickAction($sel.pickup("再试一次", "node", "kw_rank_list_try_again"));
                                clickAction($sel.pickup("打开", "node", "kw_confirm_launch_alipay"));
                            },
                        });
                        collectFriendsListData();
                        endAlipay();
                        exitNow();

                        // tool function(s) //

                        function collectFriendsListData() {
                            $app.task_name = surroundWith("好友列表采集");

                            let first_time_collect_flag = true;
                            let thread_keep_toast = threads.starts(function () {
                                while (1) {
                                    messageAction("正在采集好友列表数据", first_time_collect_flag ? 1 : 0, 1, 0, "up");
                                    sleep(first_time_collect_flag ? 4000 : 6000);
                                    first_time_collect_flag = false;
                                }
                            });

                            let thread_swipe = threads.start(function () {
                                while (!$flag.list_end_reached) {
                                    swipe(cX(0.5), uH - 20, cX(0.5), cY(0.2), 150);
                                }
                            });

                            // TODO experimental only
                            let thread_expand_hero_list = threads.starts(function () {
                                let aim = locatorSetter().locate();

                                aim.waitForStrMatch();
                                aim.waitForPosition();
                                aim.transmitSignal();

                                return true;

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
                                }

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
                                            $flag.list_end_reached = true;
                                        },
                                    };
                                }
                            });
                            thread_expand_hero_list.join(5 * 60000); // 5 minutes at most
                            thread_expand_hero_list.interrupt();
                            thread_swipe.interrupt();

                            let friend_list_data = getFriendsListData();
                            $sto.af.put("friends_list_data", friend_list_data);
                            thread_keep_toast.interrupt();
                            messageAction("采集完毕", 1, 1);
                            messageAction("用时 " + timeRecorder("get_fri_list", "load", "auto"), 1, 0, 1);
                            messageAction("总计 " + friend_list_data.list_length + " 项", 1, 0, 1);
                            $app.floaty_msg_finished_flag = 1;

                            // tool function (s) //

                            function getFriendsListData() {
                                let kw_rank_list_node = $sel.pickup(["没有更多了", "p1"]);
                                let rank_list_node_id = kw_rank_list_node.id();
                                debugInfo(["布局层次获取列表控件id:", rank_list_node_id]);
                                if (!rank_list_node_id || kw_rank_list_node.children().size() < 5) {
                                    debugInfo(["布局层次获取列表控件可能无效", "使用会话参数获取列表控件"]);
                                    debugInfo(["会话参数获取列表控件id:", (kw_rank_list_node = $app.kw_rank_list().findOnce()).id()]);
                                }
                                let rank_list = [];
                                kw_rank_list_node.children().forEach((child, idx) => {
                                    try {
                                        let checkChild = num => $sel.pickup([child, "c" + num], "txt");
                                        let rank_num = idx < 3 ? idx + 1 : +(checkChild(0) || checkChild(1));
                                        isNaN(rank_num) || rank_list.push({
                                            rank_num: rank_num,
                                            nickname: checkChild(1) || checkChild(2),
                                        });
                                    } catch (e) {
                                        // nothing to do here
                                    }
                                });
                                let max_rank_num_length = rank_list[rank_list.length - 1].rank_num.toString().length;
                                let fill_zeros = new Array(max_rank_num_length).join("0");
                                rank_list.map(o => o.rank_num = (fill_zeros + o.rank_num).slice(-max_rank_num_length));

                                return {
                                    timestamp: $app.ts,
                                    list_data: rank_list,
                                    list_length: rank_list.length,
                                };
                            }
                        }
                    },
                    curAccName: function () {
                        timeRecorder("get_cur_acc_name", "save");

                        collectCurrentAccountName();
                        endAlipay();
                        exitNow();

                        // tool function(s) //

                        function collectCurrentAccountName() {
                            let collected_name = getNameByPipeline();
                            let storage_key_name = "collected_current_account_name";
                            $sto.af.remove(storage_key_name);
                            $sto.af.put(storage_key_name, collected_name);
                            messageAction("采集完毕", 1);
                            messageAction("用时 " + timeRecorder("get_cur_acc_name", "load", "auto"), 1, 0, 1);
                            $app.floaty_msg_finished_flag = 1;

                            // tool function (s) //

                            function getNameByPipeline() {
                                let account_name = "";
                                let thread_get_account_name = threads.starts(function () {
                                    $app.task_name = surroundWith("采集当前账户名");
                                    launchAlipayHomepage();

                                    messageAction("正在采集当前账户名", 1, 0, 0, "up");

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
                                    return account_name = txt ? accountNameConverter(txt, "encrypt") : "";
                                });
                                let thread_monitor_logged_out = threads.starts(function () {
                                    $app.account_logged_out = false;
                                    let {isInLoginPage, kw_user_logged_out} = $app;
                                    while (!isInLoginPage() && !kw_user_logged_out()) sleep(500);
                                    $app.account_logged_out = true;
                                });
                                waitForAction(() => account_name || $app.account_logged_out, 12000);
                                thread_get_account_name.interrupt();
                                thread_monitor_logged_out.interrupt();
                                if (account_name) return account_name;
                                if ($app.account_logged_out) {
                                    messageAction("账户已登出", 3, 1, 0, "both_dash");
                                    delete $app.account_logged_out;
                                }
                                return "";
                            }
                        }
                    }
                },
            };
        }
    },
};

// TODO refactoring needed here
let $af = {
    homepage: () => {
        let progress = "homepageSetter:launch|ready|check|collect"
            + "checkSetter:language|mainUser";
        return $af;
    },
    rankList: () => {
        let progress = "rankListSetter:launch|ready|collect";
        return $af;
    },
    epilogue: () => {
        let progress = "logBackIn";
        return $af;
    }
};

// entrance //
$init.check();

let {
    equalObjects, getSelector, waitForAndClickAction, runJsFile,
    setGlobalTypeChecker, debugInfo, killThisApp, vibrateDevice,
    clickAction, phoneCallingState, swipeAndShow, showSplitLine,
    launchThisApp, keycode, getDisplayParams, restartThisEngine,
    waitForAction, baiduOcr, surroundWith, clickActionsPipeline,
    messageAction, observeToastMessage, tryRequestScreenCapture,
    classof, timeRecorder, setIntervalBySetTimeout,
} = require("./Modules/MODULE_MONSTER_FUNC");

$init.global().queue().delay().prompt().monitor().unlock().command();

$af.homepage().rankList().epilogue();

// TODO refactoring needed here and below... a lot to do...
antForest();

// main function(s) //

function antForest() {
    let main = [
        monitorLoggedOut,
        launchAFHomepage,
        checkLanguage,
        loginMainUser,
        checkEnergy,
        logBackInIfNeeded,
        epilogue,
    ];

    return main.forEach(f => f());

    function monitorLoggedOut() {
        let {need_login_first} = $app.my_engine_argv;
        if (need_login_first) {
            debugInfo("检测到\"预先登录\"引擎参数");
            loginMainUser("direct_login");
        }
        debugInfo("已开启账户登出监测线程");
        threads.starts(function () {
            $app.account_logged_out = false;
            let is_logged_out = false;
            let is_in_login_page = false;
            let {kw_user_logged_out, isInLoginPage} = $app;
            let loggedOut = () => is_logged_out = kw_user_logged_out();
            let inLoginPage = () => is_in_login_page = isInLoginPage();

            while (!loggedOut() && !inLoginPage()) sleep(500);

            $app.account_logged_out = true;
            messageAction("检测到账户登出状态", 1, 0, 0, "up");
            messageAction(is_logged_out ? "账户在其他地方登录" : "需要登录账户", 1);

            if (!$cfg.account_switch) {
                messageAction("无法登录账户", null, 1);
                messageAction("脚本无法继续", 4, 0, 0, "up");
                messageAction("当前支付宝未登录账户", 4, 0, 1);
                messageAction("且主账户功能未开启", 9, 0, 1, 1);
            }

            messageAction("尝试重启引擎并自动登录账户", 1, 0, 0, 1);
            if (!restartThisEngine({
                max_restart_engine_times: 1,
                need_login_first: true,
                instant_run_flag: true,
                init_scr_on: $app.init_scr_on,
                init_fg_pkg: $app.init_fg_pkg,
            })) {
                messageAction("脚本无法继续", 4, 0, 0, "up");
                messageAction("无法登录主账户", 9, 1, 1, 1);
            }
        });
    }

    function checkLanguage() {
        let title_str = "";
        if (!waitForAction(() => title_str = $sel.get("af_title", "txt"), 10000, 100)) {
            messageAction("语言检测已跳过", 3);
            return messageAction("语言检测超时", 3, 0, 1, 1);
        }
        if (title_str.match(/蚂蚁森林/)) debugInfo("当前支付宝语言: 简体中文");
        else {
            debugInfo("当前支付宝语言: 英语");
            changeLangToChs();
            launchAFHomepage()
                ? messageAction("切换支付宝语言: 简体中文", 1, 0, 0, 1)
                : messageAction("语言切换失败", 8, 1, 0, 1);
        }
        debugInfo("语言检查完毕");

        // tool function(s) //

        function changeLangToChs() {
            if (!getReady()) return;

            messageAction("切换支付宝语言: 简体中文", null, 1);

            dismissPermissionDialogsIfNeeded();

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
                    let {package_name} = $app;
                    killThisApp(package_name);
                    app.launch(package_name);
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
    }

    function checkEnergy() {
        let list_end_signal = 0;
        let kw_energy_balls = (balls_kind) => {
            balls_kind = balls_kind || "all";
            let regexp_type = {
                "normal": /\xa0/,
                "ripe": /收集能量\d+克/,
            };
            regexp_type.all = $app.combined_kw_energy_balls_regexp || (() => {
                let combined_regexp_str = "";
                Object.keys(regexp_type).forEach(key => combined_regexp_str += regexp_type[key].source + "|");
                return $app.combined_kw_energy_balls_regexp = new RegExp(combined_regexp_str.replace(/\|$/, ""));
            })();

            return $sel.pickup([regexp_type[balls_kind], {className: "Button"}], "nodes", "kw_energy_balls_" + balls_kind)
                .filter((node) => {
                    let bounds = node && node.bounds();
                    return bounds && bounds.left >= cX(0.08) && bounds.right <= cX(0.92);
                });
        };

        monitorMaskLayer();
        checkOwnEnergy();
        checkFriendsEnergy();
        setTimers();

        // main function(s) //

        function monitorMaskLayer(timeout) {
            debugInfo("开启遮罩层监测线程");

            threads.starts(function () {
                timeout = timeout || 8000;
                let kw_mask_layer = type => $sel.pickup("关闭蒙层", type, "af_homepage_mask_layer");
                if (!waitForAction(kw_mask_layer, timeout)) return;

                debugInfo("检测到遮罩层");
                timeRecorder("af_homepage_mask_layer_matched");
                return tryCloseMaskLayer()
                    ? debugInfo([
                        "关闭遮罩层成功",
                        "遮罩层关闭用时: " + timeRecorder("af_homepage_mask_layer_matched", "load", "auto")
                    ])
                    : debugInfo("关闭遮罩层失败", 3);

                // tool function(s) //

                function tryCloseMaskLayer() {
                    let success = () => waitForAction(() => !kw_mask_layer(), 2000, 80) && !waitForAction(kw_mask_layer, 800, 80);
                    clickAction(kw_mask_layer(), "widget");
                    if (success()) return true;
                    clickAction(kw_mask_layer(), "click");
                    if (success()) return true;
                }
            });
        }

        function checkOwnEnergy() {
            if (!$cfg.self_collect_switch) return debugInfo(["跳过自己能量检查", "自收功能未开启"]);

            debugInfo("开始检查自己能量");

            $app.total_energy_init = getOwnEnergyAmount("buffer");
            let total_init_data = $app.total_energy_init;
            debugInfo("初始能量: " + total_init_data + "g");

            waitForAction([() => $sel.get("rl_ent"), () => $sel.get("af_home"), "or"], 12000)
                ? debugInfo("蚂蚁森林主页准备完毕")
                : debugInfo("蚂蚁森林主页准备超时", 3);

            let {max_own_forest_balls_ready_time} = $cfg;
            debugInfo(["查找主页能量球控件", ">最大时间参数: " + max_own_forest_balls_ready_time + "毫秒"]);

            let {avatar_checked_time} = $app;
            if (avatar_checked_time) {
                let final_minified_time = Math.max(150, max_own_forest_balls_ready_time - avatar_checked_time);
                max_own_forest_balls_ready_time = final_minified_time;
                debugInfo(["查找时间值削减至: " + final_minified_time + "毫秒", ">主账户检测耗时抵充"]);
                delete $app.avatar_checked_time;
            }

            let homepage_balls_len = 0;
            if (waitForAction(() => homepage_balls_len = kw_energy_balls().length, max_own_forest_balls_ready_time, 50)) {
                debugInfo("找到主页能量球: " + homepage_balls_len + "个");
                checkEnergyBalls();
            } else debugInfo("指定时间内未发现主页能量球");

            let total_collect_data = $app.total_energy_collect_own;
            total_collect_data ? debugInfo("共计收取: " + total_collect_data + "g") : debugInfo("无能量球可收取");

            debugInfo("自己能量检查完毕");

            // tool function(s) //

            function checkEnergyBalls() {
                let initial_af_home_capt = images.captureCurrentScreen();
                checkRipeBalls();

                let condition_a = $cfg.homepage_background_monitor_switch;
                let condition_b1 = $cfg.timers_switch;
                let condition_b2a = $cfg.homepage_monitor_switch;
                let condition_b2b = $cfg.timers_self_manage_switch && $cfg.timers_countdown_check_own_switch;

                if (condition_a || condition_b1 && (condition_b2a || condition_b2b)) {
                    while (getMinCountdownOwn()) checkRemain();
                }

                images.reclaim(initial_af_home_capt);
                initial_af_home_capt = null;

                // tool function(s) //

                function checkRipeBalls() {
                    let ripe_balls_nodes = null;
                    let ripe_balls_len = 0;

                    let getRipeBallsNodes = () => ripe_balls_nodes = kw_energy_balls("ripe");
                    let getRipeBallsSize = () => ripe_balls_len = getRipeBallsNodes().length;

                    if (!getRipeBallsSize()) return;

                    let max_try_times = 8;
                    while (ripe_balls_len && max_try_times--) {
                        debugInfo("点击自己成熟能量球: " + ripe_balls_len + "个");
                        ripe_balls_nodes.forEach((w) => {
                            clickAction(w.bounds(), "press", {press_time: $cfg.energy_balls_click_interval});
                        });
                        if (waitForAction(() => getRipeBallsSize() === 0, 2000, 100)) break;
                    }
                    if (max_try_times < 0) return;

                    $app.total_energy_collect_own += stabilizer(getOwnEnergyAmount, total_init_data) - total_init_data;
                    total_init_data += $app.total_energy_collect_own;
                    return true;
                }

                function getMinCountdownOwn() {
                    debugInfo("开始检测自己能量球最小倒计时");

                    let raw_balls = kw_energy_balls("normal");
                    let raw_balls_len = raw_balls.length;
                    debugInfo("找到自己未成熟能量球: " + raw_balls_len + "个");
                    if (!raw_balls_len) {
                        $app.min_countdown_own = Infinity;
                        return debugInfo("自己能量球最小倒计时检测完毕");
                    } // no countdown, no need to checkRemain

                    let now = timeRecorder("own_energy_balls_check_time");
                    let min_countdown_own = Math.min.apply(null, getCountdownData());
                    let ripe_time = new Date(min_countdown_own);
                    let remain_minutes = +timeRecorder("own_energy_balls_check_time", "load", 60000, 0, null, +ripe_time);

                    if (!remain_minutes || remain_minutes < 0) debugInfo("自己能量最小倒计时数据无效", 3);
                    else {
                        debugInfo("自己能量最小倒计时: " + remain_minutes + "分钟");
                        $app.min_countdown_own = min_countdown_own; // ripe timestamp
                        debugInfo("时间数据: " + getNextTimeStr(min_countdown_own));
                    }

                    debugInfo("自己能量球最小倒计时检测完毕");

                    return $cfg.homepage_monitor_switch && remain_minutes <= $cfg.homepage_monitor_threshold; // if needs to checkRemain

                    // tool function(s) //

                    function getCountdownData() {
                        let isThreadAlive = thr => thr && thr.isAlive();
                        let killThread = (thr) => {
                            thr && thr.interrupt();
                            thr = null;
                        };
                        let timeout_get_countdown_data = 12000;
                        let countdown_data = [];

                        timeRecorder("get_own_countdown_data");

                        let thread_get_by_ocr = threads.starts(function () {
                            debugInfo("已开启倒计时数据OCR识别线程");
                            let stitched_initial_af_home_balls_img = (() => {
                                let nodeToImage = (node) => {
                                    let bounds = node.bounds();
                                    return images.clip(initial_af_home_capt, bounds.left, bounds.top, bounds.width(), bounds.height());
                                };

                                let stitched = nodeToImage(raw_balls[0]);
                                raw_balls.forEach((node, idx) => {
                                    stitched = idx ? images.concat(stitched, nodeToImage(node), "BOTTOM") : stitched;
                                });
                                return stitched;
                            })();

                            let raw_countdown_data = baiduOcr([raw_balls, stitched_initial_af_home_balls_img], {
                                fetch_times: 3,
                                fetch_interval: 500,
                                no_toast_msg_flag: true,
                            }).map(result => result.filter(str => !!str.match(/\d{2}:\d{2}/)))
                                .filter(arr => !!arr.length)
                                .map(arr => arr.sort((a, b) => a > b ? 1 : -1)[0]);

                            if (!raw_countdown_data.length) return debugInfo("OCR识别线程未能获取有效数据");

                            debugInfo("OCR识别线程已获取有效数据");
                            if (countdown_data.length) return debugInfo(["数据未被采纳", ">倒计时数据非空"]);

                            debugInfo("OCR识别线程数据已采纳");
                            return countdown_data = raw_countdown_data;
                        });
                        let thread_get_by_toast = threads.starts(function () {
                            debugInfo("已开启倒计时数据Toast监控线程");
                            raw_balls.forEach((node) => {
                                clickAction(node, "press");
                                let data = observeToastMessage($app.package_name, /才能收取/, 240); // results array, maybe []
                                // data = []; //// TEST ////
                                if (data.length && isThreadAlive(thread_get_by_ocr)) {
                                    killThread(thread_get_by_ocr);
                                    debugInfo(["Toast监控线程已获取有效数据", "强制停止OCR识别线程"]);
                                    return countdown_data = countdown_data.concat(data);
                                }
                            });
                            countdown_data.length || debugInfo("Toast监控线程未能获取有效数据");
                        });

                        let getRemainingTime = () => timeout_get_countdown_data - timeRecorder("get_own_countdown_data", "load");

                        thread_get_by_toast.join(4000);
                        if (isThreadAlive(thread_get_by_toast)) {
                            killThread(thread_get_by_toast);
                            debugInfo(["Toast监控线程获取数据超时", "强制停止Toast监控线程"]);
                            thread_get_by_ocr.join(getRemainingTime());
                        }

                        if (getRemainingTime() < 0) {
                            killThread(thread_get_by_toast);
                            killThread(thread_get_by_ocr);
                            messageAction("获取自己能量倒计时超时", 3);
                            messageAction("最小倒计时数据" + (countdown_data.length ? "可能不准确" : "获取失败"), 3, 0, 0, 1);
                        }

                        return countdown_data.map(str => {
                            let matched_time_arr = str.match(/\d+:\d+/);
                            if (!matched_time_arr) {
                                messageAction("无效字串:", 3);
                                messageAction(str, 3);
                                return Infinity;
                            }
                            let time_str_arr = matched_time_arr[0].split(":").map(value => +value);
                            let [hh, mm] = time_str_arr;
                            return +now + (hh * 60 + mm) * 60000; // timestamp of next ripe time (not scheduled launch time)
                        }).filter(value => value !== Infinity);
                    }
                }

                function checkRemain() {
                    let max_check_time = $cfg.homepage_monitor_threshold * 60000 + 3000; // ms
                    let old_collect_own = $app.total_energy_collect_own;
                    timeRecorder("homepage_monitor", "save");
                    messageAction("Non-stop checking time", null, 1);
                    debugInfo("开始监测自己能量");
                    device.keepOn(max_check_time);
                    try {
                        while (timeRecorder("homepage_monitor", "load") < max_check_time) {
                            if (checkRipeBalls()) break;
                            sleep(180);
                        }
                    } catch (e) {
                        // nothing to do here
                    }
                    messageAction("Checking completed", null, 1);
                    debugInfo("自己能量监测完毕");
                    debugInfo("本次监测收取结果: " + ($app.total_energy_collect_own - old_collect_own) + "g");
                    device.cancelOn();
                    debugInfo("监测用时: " + timeRecorder("homepage_monitor", "load", "auto"));
                }
            }

            function getOwnEnergyAmount(buffer_flag) {
                let rex_energy_amt = /\d+g/;
                if (buffer_flag) {
                    let condition = () => $sel.pickup(rex_energy_amt) && $sel.get("af_home");
                    if (!waitForAction(condition, 8000)) return -1;
                }
                let max_try_times = buffer_flag ? 10 : 1;
                while (max_try_times--) {
                    let amount = +$sel.pickup([rex_energy_amt, {
                        boundsInside: [cX(0.6), cY(0.1, -1), W - 2, cY(0.3, -1)],
                    }], "txt").match(/\d+/);
                    if (!isNaN(amount)) return amount;
                    sleep(200);
                }
                if (max_try_times < 0) return -1;
            }
        }

        function checkFriendsEnergy(review_flag) {
            closeH5PageIfNeeded();
            list_end_signal = 0;

            delete $app.valid_rank_list_icon_clicked;
            delete $app.min_countdown_friends;
            delete $app.help_without_section_flag;

            let blist_ident_captures = setBlistIdentCapturesProto();
            blist_ident_captures.splice(0, blist_ident_captures.length);

            let kw_dynamic_list_info = type => $sel.pickup(/来浇过水.+|(帮忙)?收取\d+g/, type, "kw_dynamic_list_info");

            let {help_collect_switch, friend_collect_switch} = $cfg;
            if (!friend_collect_switch) {
                if (!help_collect_switch) return debugInfo(["跳过好友能量检查", ">收取功能与帮收功能均已关闭"]);
                if (!checkHelpSection()) return debugInfo(["跳过好友能量检查", ">收取功能已关闭", ">且当前时间不在帮收有效时段内"])
            }

            debugInfo("开始" + (review_flag ? "复查" : "检查") + "好友能量");

            if (!rankListReady(review_flag)) return;

            let help_balls_coords = {};
            let init_balls_len = 0;
            let strategy = $cfg.rank_list_samples_collect_strategy;
            let thread_energy_balls_monitor = undefined;
            let thread_list_end = threads.starts(monitorEndOfListByUiObjThread);

            debugInfo("排行榜样本采集策略: " + {image: "图像识别", layout: "布局分析"}[strategy]);

            let max_safe_swipe_times = 1200; // just for avoiding infinite loop
            while (max_safe_swipe_times--) {
                $app.current_friend = {};
                let targets = getCurrentScreenTargets(strategy); // [targets_green[], targets_orange[]]
                let pop_item_0, pop_item_1, pop_item;

                while ((pop_item = (pop_item_0 = targets[0].pop()) || (pop_item_1 = targets[1].pop()))) {
                    init_balls_len = 0;
                    delete $app.rank_list_icon_clicked;

                    let pop_name = pop_item.name;
                    $app.current_friend.name = pop_name;
                    $app.current_friend.console_logged = 0;
                    $app.current_friend.name_logged = 0;
                    let name_title = pop_name; // maybe undefined
                    if ($flag.msg_details && name_title && !$app.current_friend.name_logged) {
                        messageAction(name_title, "title");
                        $app.current_friend.name_logged = 1;
                    }

                    let clickRankListItemFunc = () => {
                        if (strategy === "image") clickAction([cX(0.5), pop_item.list_item_click_y], "press");
                        else if (strategy === "layout") clickAction($sel.pickup(pop_name), "click");

                        if ($app.current_friend.six_balls_review_flag) debugInfo("复查当前好友", "both");
                        else debugInfo("点击" + (pop_item_0 && "收取目标" || pop_item_1 && "帮收目标"));

                        $app.rank_list_icon_clicked = true;
                    };

                    while (1) {
                        if (inBlist(clickRankListItemFunc)) break;

                        forestPageGetReady() && collectBalls();
                        backToHeroList();

                        let {console_logged, six_balls_review_flag} = $app.current_friend;
                        if (!six_balls_review_flag) {
                            if ($flag.msg_details) {
                                if (!console_logged) messageAction("无能量球可操作", 1, 0, 1);
                                showSplitLine();
                            }
                            break;
                        }
                    }
                }

                if (!list_end_signal) swipeUp();
                else break;
            }
            if (max_safe_swipe_times < 0) debugInfo("已达最大排行榜滑动次数限制");

            if (thread_list_end.isAlive()) {
                thread_list_end.interrupt();
                debugInfo("排行榜底部监测线程强制中断");
            }

            if (reviewSamplesIfNeeded()) return checkFriendsEnergy("review");

            debugInfo("好友能量检查完毕");

            checkMinCountdownFriendsIfNeeded();

            checkOwnCountdownDemand($cfg.homepage_monitor_threshold);

            return list_end_signal;

            // tool function(s) //

            function closeH5PageIfNeeded() {
                let condition = () => $sel.get("af_title") || $sel.get("rl_title");
                if (condition()) {
                    debugInfo("检测到需要关闭的H5页面");
                    let max_try_times = 20;
                    let counter = 0;
                    while (max_try_times--) {
                        keycode(4, "double");
                        counter += 1;
                        sleep(500);
                        if (!condition()) return debugInfo("共计关闭H5页面: " + counter + "页");
                    }
                }
            }

            function setBlistIdentCapturesProto() {
                if ($app.blist_ident_captures) return $app.blist_ident_captures;
                let blist_ident_captures = [];
                blist_ident_captures.__proto__.add = function (capture, max_length) {
                    max_length = max_length || 3;
                    if (blist_ident_captures.length >= max_length) {
                        debugInfo("黑名单采集样本已达阈值: " + max_length);
                        let last_capt = blist_ident_captures.pop();
                        debugInfo(">移除并回收最旧样本: " + images.getName(last_capt));
                        images.reclaim(last_capt);
                        last_capt = null;
                    }
                    blist_ident_captures.unshift(capture);
                    debugInfo("添加黑名单采集样本: " + images.getName(capture));
                };
                blist_ident_captures.__proto__.clear = function () {
                    if (!blist_ident_captures.length) return;
                    debugInfo("回收全部黑名单采集样本");
                    blist_ident_captures.forEach(capt => {
                        capt.recycle();
                        debugInfo(">已回收: " + images.getName(capt));
                        capt = null;
                    });
                    blist_ident_captures.splice(0, blist_ident_captures.length);
                    debugInfo("黑名单采集样本已清空");
                };
                return $app.blist_ident_captures = blist_ident_captures;
            }

            function rankListReady(review_flag) {
                if (launchRankList({review_flag: review_flag})) {
                    tryRequestScreenCapture();
                    getRankListRefMaterials();
                    getCurrentUserNickname();
                    return true;
                }

                // tool function(s) //

                function getRankListRefMaterials() {
                    images.reclaim($app.rank_list_capt_img);
                    $app.rank_list_capt_img = null;
                    $app.rank_list_capt_img = images.captureCurrentScreen();
                    debugInfo("生成排行榜截图: " + images.getName($app.rank_list_capt_img));

                    let _rl_tt_node = null;

                    while (!_rl_tt_node) {
                        let _ref_calc = Infinity;
                        $sel.pickup(/.*h5.+title.*/, "nodes").forEach((w) => {
                            let _b = w.bounds();
                            let _w = _b.width();
                            let _h = _b.height();
                            let _calc = (_w + _h / 1.78) / W;
                            if (_calc < _ref_calc) {
                                _ref_calc = _calc;
                                _rl_tt_node = w;
                            }
                        });
                        _rl_tt_node || sleep(100);
                    }

                    getCloseBtnCenterCoord();

                    if (!_rl_tt_node) return debugInfo("排行榜标题控件抓取失败", 3);
                    let bounds = _rl_tt_node.bounds();
                    debugInfo("采集并存储排行榜标题区域样本:");
                    let [l, t, w, h] = [3, bounds.top, W - 6, bounds.height()];
                    debugInfo("(" + l + ", " + t + ", " + (l + w) + ", " + (t + h) + ")");
                    $app.rank_list_title_area_capt_bounds = [l, t, w, h];
                    ($app.setRankListTitleAreaCapt = () => {
                        if (!$app.rank_list_title_area_capt_bounds) return debugInfo("排行榜标题区域边界数据不存在");
                        return $app.rank_list_title_area_capt = images.clip.apply(null,
                            [$app.rank_list_capt_img].concat($app.rank_list_title_area_capt_bounds)
                        );
                    })();
                }

                function getCurrentUserNickname() {
                    if ($app.user_nickname) {
                        return debugInfo("无需重复获取当前账户昵称");
                    }
                    try {
                        let _max = 5;
                        let _gnsNickname = () => {
                            let _get = $sel.get("user_nickname", "txt");
                            return $app.user_nickname = _get;
                        };
                        while (_max-- && !_gnsNickname()) {
                            sleep(120);
                        }
                        let _text = $app.user_nickname
                            ? "已获取当前账户昵称字符串"
                            : "获取到无效的当前账户昵称";
                        debugInfo(_text);
                    } catch (e) {
                        debugInfo("获取当前账户昵称失败", 3);
                    }
                }

                function launchRankList(params) {
                    return plans("launch_rank_list", Object.assign({}, {exclude: "_test_"}, params || {}));
                }
            }

            function getCurrentScreenTargets(strategy) {
                if (strategy === "image") return getTargetsByImage();
                if (strategy === "layout") return getTargetsByLayout();

                // tool function(s) //

                function getTargetsByLayout() {
                    let [targets_green, targets_orange] = [[], []];

                    getScreenSamples().forEach((w) => {
                        let parent_node = $sel.pickup([w, "p1"]);
                        if (!parent_node) return debugInfo("采集到无效的排行榜样本");

                        let state_ident_node = $sel.pickup([w, "s2b"]);
                        if (!state_ident_node) return debugInfo("采集到无效的排行榜样本");

                        // exclude identifies with countdown
                        if ($sel.pickup([state_ident_node, "c0"], "txt").match(new RegExp("\\d+\u2019"))) return;

                        let find_color_options = getFindColorOptions(parent_node);
                        if (!checkRegion(find_color_options.region)) return;

                        // special treatment for first 3 ones
                        let getName = (compass) => {
                            return $sel.pickup([parent_node, compass + "c0c0"], "txt")
                                || $sel.pickup([parent_node, compass + ""], "txt");
                        };
                        let name = getName("c1") || getName("c2");

                        if (friend_collect_switch) {
                            let pt_green = images.findColor(
                                $app.rank_list_capt_img,
                                $cfg.friend_collect_icon_color,
                                Object.assign({}, find_color_options, {threshold: $cfg.friend_collect_icon_threshold})
                            );
                            if (pt_green) return targets_green.unshift({name: name});
                        } else {
                            if (!$app.take_dysfunctional_flag) {
                                debugInfo(["不再采集收取目标样本", ">收取功能已关闭"]);
                                $app.take_dysfunctional_flag = true;
                            }
                        }

                        if (help_collect_switch) {
                            if (checkHelpSection()) {
                                let pt_orange = images.findColor(
                                    $app.rank_list_capt_img,
                                    $cfg.help_collect_icon_color,
                                    Object.assign({}, find_color_options, {threshold: $cfg.help_collect_icon_threshold})
                                );
                                if (pt_orange) return targets_orange.unshift({name: name});
                            }
                        } else {
                            if (!$app.help_dysfunctional_flag) {
                                debugInfo(["不再采集帮收目标样本", ">帮收功能已关闭"]);
                                $app.help_dysfunctional_flag = true;
                            }
                        }
                    });

                    return [targets_green, targets_orange];

                    // tool function(s) //

                    function getScreenSamples() {
                        let {rex_energy_amt} = $app;
                        let max_try_times = 10;
                        while (max_try_times--) {
                            // let screen_samples = $sel.pickup(rex_energy_amt, "nodes");
                            // $sel.pickup() may cost more time than the traditional way
                            let nodes_text = textMatches(rex_energy_amt).find();
                            let nodes_desc = descMatches(rex_energy_amt).find();
                            let screen_samples = nodes_text.length >= nodes_desc.length ? nodes_text : nodes_desc;
                            screen_samples = screen_samples.map((node) => {
                                return $sel.pickup([node, "p1c3"]) ? node : node.parent();
                            });

                            let filtered_samples = [];
                            let meet_min_threshold = (a, b) => Math.abs(a - b) > 5;

                            for (let i = 1, len = screen_samples.length; i < len; i += 1) {
                                let cur_node = screen_samples[i];
                                if (!cur_node) continue;

                                let pre_node = screen_samples[i - 1];
                                if (!pre_node) continue;

                                let cur_bounds = cur_node.bounds();
                                let pre_bounds = pre_node.bounds();

                                try {
                                    if (meet_min_threshold(cur_bounds.bottom, pre_bounds.bottom)
                                        && meet_min_threshold(cur_bounds.top, pre_bounds.top)
                                        && cur_node.parent().bounds().height() > cX(0.08)
                                    ) {
                                        if (i === 1) filtered_samples.push(pre_node);
                                        filtered_samples.push(cur_node);
                                    }
                                } catch (e) {
                                    // nothing to do here
                                }
                            }

                            let filtered_screen_samples_len = filtered_samples.length;
                            if (filtered_screen_samples_len) {
                                debugInfo("获取当前屏幕好友样本数量: " + filtered_screen_samples_len);
                                return filtered_samples;
                            }
                        }
                        debugInfo("未能从样本区域获取样本");
                        return [];
                    }

                    function getFindColorOptions(parent_node) {
                        let region_ref = {
                            l: cX(0.7),
                            t: parent_node.bounds().top - 3,
                        };
                        return {
                            region: [
                                region_ref.l,
                                region_ref.t,
                                W - region_ref.l - 3,
                                parent_node.bounds().centerY() - region_ref.t
                            ]
                        };
                    }

                    function checkRegion(arr) {
                        let [left, top, right, bottom] = [arr[0], arr[1], arr[0] + arr[2], arr[1] + arr[3]];
                        if (left < W / 2) return debugInfo("采集区域left参数异常: " + left);
                        if (top < 10 || top >= uH) return debugInfo("采集区域top参数异常: " + top);
                        if (bottom <= 0 || bottom > uH) return debugInfo("采集区域bottom参数异常: " + bottom);
                        if (right <= left || right > W) return debugInfo("采集区域right参数异常: " + right);
                        return true;
                    }
                }

                function getTargetsByImage() {
                    let [targets_green, targets_orange] = [[], []];

                    if (friend_collect_switch) getTargets("green");
                    else {
                        if (!$app.take_dysfunctional_flag) {
                            debugInfo(["不再采集收取目标样本", ">收取功能已关闭"]);
                            $app.take_dysfunctional_flag = true;
                        }
                    }

                    if (help_collect_switch) {
                        checkHelpSection() && getTargets("orange");
                    } else {
                        if (!$app.help_dysfunctional_flag) {
                            debugInfo(["不再采集帮收目标样本", ">帮收功能已关闭"]);
                            $app.help_dysfunctional_flag = true;
                        }
                    }
                    return [targets_green, targets_orange];

                    // tool function(s) //

                    function getTargets(ident) {
                        let action_str = {green: "friend", orange: "help"}[ident];
                        let color = $cfg[action_str + "_collect_icon_color"];
                        if (!color) return;

                        let multi_colors = [[cX(38), cY(35, -1), color]]; // [cX(38), 0, color] was abandoned
                        if (ident === "green") {
                            multi_colors.push([cX(23), cY(26, -1), -1]);
                            for (let i = 16; i <= 24; i += (4 / 3)) multi_colors.push([cX(i), cY(i - 6, -1), -1]); // from E6683
                            for (let i = 16; i <= 24; i += (8 / 3)) multi_colors.push([cX(i), cY(i / 2 + 16, -1), -1]); // from E6683
                        } // [cX(37), cY(25), -1] was abandoned

                        let icon_check_area_top = 0;
                        let color_threshold = $cfg[action_str + "_collect_icon_threshold"] || 10;
                        let icon_check_area_left = cX(0.9);
                        while (icon_check_area_top < H) {
                            let icon_matched = checkAreaByMultiColors();
                            if (!icon_matched) return;

                            let [icon_matched_x, icon_matched_y] = [icon_matched.x, icon_matched.y];
                            let target_info = {
                                icon_matched_x: icon_matched_x,
                                icon_matched_y: icon_matched_y,
                                list_item_click_y: icon_matched_y + cY(16, -1),
                            };
                            if (ident === "green") {
                                let ref_color = images.pixel($app.rank_list_capt_img, cX(0.993), icon_matched_y + cY(11, -1));
                                colors.isSimilar(ref_color, color, color_threshold) && targets_green.unshift(target_info);
                            }
                            if (ident === "orange") targets_orange.unshift(target_info);

                            icon_check_area_top = icon_matched_y + cY(76, -1);
                        }

                        // tool function(s) //

                        function checkAreaByMultiColors() {
                            let matched = images.findMultiColors($app.rank_list_capt_img, color, multi_colors, {
                                region: [
                                    icon_check_area_left,
                                    icon_check_area_top,
                                    W - icon_check_area_left,
                                    H - icon_check_area_top,
                                ],
                                threshold: color_threshold,
                            });
                            if (matched) return {
                                x: matched.x,
                                y: matched.y,
                            };
                        }
                    }
                }
            }

            function forestPageGetReady() {
                let max_safe_wait_time = 120000; // keep waiting for at most 2 min
                let max_safe_wait_time_backup = max_safe_wait_time;
                let sleep_interval = 200;

                debugInfo("开启\"重新加载\"按钮监测线程");
                let thread_monitor_retry_btn = threads.starts(function () {
                    while (1) sleep(clickAction($sel.get("reload_fst_page")) ? 3000 : 1000);
                });

                while (!$sel.pickup(/你收取TA|发消息/) && !className("ListView").exists() && max_safe_wait_time > 0) {
                    sleep(sleep_interval);
                    max_safe_wait_time -= sleep_interval * ($sel.get("wait_awhile") ? 1 : 6);
                }

                let wait_times_sec = (max_safe_wait_time_backup - max_safe_wait_time) / 1000;
                if (wait_times_sec >= 6) debugInfo("进入好友森林时间较长: " + wait_times_sec.toFixed(2) + "秒");

                debugInfo("结束\"重新加载\"按钮监测线程");
                thread_monitor_retry_btn.interrupt();

                if (max_safe_wait_time <= 0) return messageAction("进入好友森林超时", 3, 1);

                getCloseBtnCenterCoord();

                thread_energy_balls_monitor = threads.starts(energyBallsMonitorThread);

                // minimum time is about 879.83 ms before energy balls ready (Sony G8441)

                if (waitForAction(() => kw_energy_balls().length, 2000, 80)) {
                    debugInfo(["能量球准备完毕", "共计: " + (init_balls_len = kw_energy_balls().length) + "个"]);
                    return true;
                }
                return debugInfo("等待能量球超时") && false;

                // tool function(s) //

                function energyBallsMonitorThread() {
                    debugInfo("已开启能量球监测线程");

                    delete $app.blist_idents_ready;
                    let blist_capts_checked_flag = false;

                    let orange_balls = $cfg.help_collect_balls_color;
                    let orange_balls_threshold = $cfg.help_collect_balls_threshold;
                    let intensity_time = $cfg.help_collect_balls_intensity * 160 - 920;

                    debugInfo("能量球监测采集密度: " + intensity_time + "毫秒");

                    timeRecorder("energy_balls_monitor", "save");

                    let screen_capture = null;

                    fillInBlistIdents();
                    collectAndAnalyseHelpBalls();

                    // tool function(s) //

                    function reCaptureCurrentScreen() {
                        screen_capture = images.captureCurrentScreen();
                        debugInfo("存储屏幕截图: " + images.getName(screen_capture));
                    }

                    function fillInBlistIdents() {
                        let max_add_times = 4;
                        while (max_add_times--) {
                            reCaptureCurrentScreen();
                            blist_ident_captures.add(screen_capture);
                            if (blist_ident_captures.length >= 3) return $app.blist_idents_ready = true;
                            sleep(120);
                        }
                    }

                    function collectAndAnalyseHelpBalls() {
                        while (1) {
                            reCaptureCurrentScreen();

                            let checkHelpBallsInBlistCapts = (node) => {
                                if (!blist_capts_checked_flag) {
                                    debugInfo(["采集黑名单样本中的橙色球", ">样本数量: " + blist_ident_captures.length]);
                                    checkHelpBalls(node, blist_ident_captures);
                                    blist_capts_checked_flag = true;
                                    debugInfo(["黑名单样本橙色球采集完毕", "采集结果数量: " + Object.keys(help_balls_coords).length]);
                                }
                            };
                            let checkHelpBallsInCurrentCapt = node => checkHelpBalls(node, screen_capture);
                            let checkHelpBalls = (node, capts) => {
                                if (!$$arr(capts)) capts = [capts];
                                capts.forEach((capt) => {
                                    node.forEach(w => {
                                        let b = w.bounds();
                                        let {top} = b;
                                        if (top in help_balls_coords) return;

                                        let options = {
                                            region: [b.left, top, b.width(), b.height()],
                                            threshold: orange_balls_threshold,
                                        };
                                        if (!images.findColor(capt, orange_balls, options)) return;

                                        let cx = b.centerX();
                                        let cy = b.centerY();
                                        help_balls_coords[top] = {x: cx, y: cy};
                                        debugInfo("记录橙色球坐标: (" + cx + ", " + cy + ")");
                                    });
                                })
                            };

                            if (help_collect_switch && checkHelpSection()) {
                                if (!waitForAction(() => kw_energy_balls("normal").length, 1500, 100)) {
                                    return debugInfo(["采集中断", ">指定时间内未发现普通能量球"]);
                                }

                                let all_normal_balls = kw_energy_balls("normal");
                                let norm_balls_len = all_normal_balls.length;
                                let help_balls_len = () => Object.keys(help_balls_coords).length;

                                if (!norm_balls_len) return debugInfo(["采集中断", ">没有需要采集状态的能量球"]);
                                if (norm_balls_len === help_balls_len()) return debugInfo(["采集中断", ">橙色球状态已全部采集完毕"]);

                                checkHelpBallsInBlistCapts(all_normal_balls) || checkHelpBallsInCurrentCapt(all_normal_balls);

                                if (!help_balls_len()) debugInfo("未采集到橙色球: " + images.getName(screen_capture));
                            }

                            debugInfo("已回收屏幕截图: " + images.getName(screen_capture));
                            images.reclaim(screen_capture);
                            screen_capture = null;

                            let progress = timeRecorder("energy_balls_monitor", "load", intensity_time / 100, [1], "%");
                            if (+progress.match(/\d+(\.\d+)?/)[0] >= 95) {
                                debugInfo(["当前采集进度: 100%", "采集结果数量: " + Object.keys(help_balls_coords).length]);
                                break;
                            }
                            debugInfo("当前采集进度: " + progress);
                        }
                    }
                }
            }

            function collectBalls() {
                $app.collect_clicked_flag = false;
                $app.help_clicked_flag = false;
                let blist_passed_flag = true;

                debugInfo("已开启黑名单检测线程");
                let thread_blist_check = threads.starts(blistCheckThread);
                thread_blist_check.join();
                debugInfo("黑名单检测完毕");

                let thread_take = null;
                let thread_help = null;

                if (blist_passed_flag) {
                    thread_take = threads.starts(take);
                    thread_help = threads.starts(help);

                    thread_help.join();
                    debugInfo("帮收线程结束");
                    help_balls_coords = {}; // reset
                    thread_take.join();
                    debugInfo("收取线程结束");
                } else {
                    debugInfo(["能量球监测线程中断", ">黑名单检测未通过"]);
                    thread_energy_balls_monitor.interrupt();
                }

                return blist_ident_captures.clear();

                // main function(s) //

                function blistCheckThread() {
                    let max_wait_times = 10;
                    while (!blist_ident_captures.length && max_wait_times--) {
                        if (!thread_energy_balls_monitor.isAlive()) break;
                        sleep(100);
                    }

                    waitForAction(() => $app.blist_idents_ready, 800, 50); // just in case

                    let blist_ident_capts_len = blist_ident_captures.length;

                    if (blist_ident_capts_len) {
                        debugInfo("使用能量球监测线程采集数据");
                        debugInfo("黑名单采集样本数量: " + blist_ident_capts_len);
                        if (blist_ident_capts_len < 3) {
                            debugInfo("黑名单样本数量不足");
                            let max_wait_times_enough_idents = 10;
                            while (max_wait_times_enough_idents-- || true) {
                                if (!thread_energy_balls_monitor.isAlive()) {
                                    debugInfo(["能量球监测线程已停止", "现场采集新黑名单样本数据"]);
                                    captNewBlistIdent();
                                    break;
                                } else if (max_wait_times_enough_idents < 0) {
                                    debugInfo(["等待样本采集超时", "现场采集新黑名单样本数据"]);
                                    captNewBlistIdent();
                                    break;
                                } else if (blist_ident_captures.length >= 3) {
                                    debugInfo("黑名单样本数据充足");
                                    break;
                                } else {
                                    debugInfo("继续等待采集黑名单样本数据");
                                    sleep(100);
                                }
                            }
                        }
                    } else {
                        debugInfo("能量球监测线程未能采集样本数据");
                        captNewBlistIdent();
                    }

                    debugInfo("开始检查黑名单样本颜色特征");

                    let protect_color_match = false;
                    for (let i = 0, len = blist_ident_captures.length; i < len; i += 1) {
                        // let new_capt = images.clip(blist_ident_captures[i], cX(298), cY16h9w(218), cX(120), cY16h9w(22));
                        let new_capt = images.clip(
                            blist_ident_captures[i],
                            cX(288), cY(210, -1), cX(142), cY(44, -1)
                        ); // more flexible condition(s)
                        if (images.findColor(new_capt, $cfg.protect_cover_ident_color, {
                            threshold: $cfg.protect_cover_ident_threshold,
                        })) {
                            protect_color_match = true;
                            break;
                        }
                    }

                    if (protect_color_match) blist_passed_flag = false;
                    else return debugInfo("颜色识别无保护罩");

                    debugInfo("颜色识别检测到保护罩");

                    let kw_list = className("ListView");
                    if (!waitForAction(kw_list, 3000, 80)) return messageAction("未能通过列表获取能量罩信息", 3, 1, 1);

                    debugInfo("已开启动态列表自动展开线程");
                    let thread_list_more = threads.starts(listMoreThread);
                    debugInfo("已开启能量罩信息采集线程");
                    let thread_list_monitor = threads.starts(listMonitorThread);

                    thread_list_monitor.join();
                    debugInfo("能量罩信息采集完毕");

                    // tool function(s) //

                    function listMoreThread() {
                        let kw_list_more = () => $sel.pickup("点击加载更多", "node", "kw_list_more_for_rank_list_page");
                        if (!waitForAction(kw_list_more, 2000, 80)) return;

                        let _max = 50; // 10 sec at most
                        let click_count = 0;
                        while (!$sel.pickup("没有更多") && _max--) {
                            clickAction(kw_list_more(), "widget");
                            click_count++;
                            sleep(200);
                            if (!waitForAction(kw_list_more, 2000, 80)) return;
                        }
                        debugInfo(["动态列表展开完毕", ">点击\"点击加载更多\": " + click_count + "次"]);
                    }

                    function listMonitorThread() {
                        let kw_protect_cover = type => $sel.pickup(/.*使用了保护罩.*/, type, "kw_protect_cover_used");
                        let date_nodes = getDateNodes();
                        if (date_nodes && kw_protect_cover()) addBlist();

                        thread_list_more.interrupt();

                        // tool function(s) //

                        function getDateNodes() {
                            if (!waitForAction(kw_list, 3000, 80)) return debugInfo("好友动态列表准备超时");

                            let safe_max_try_times = 8;
                            while (safe_max_try_times--) {
                                let date_nodes = getDateNodes();
                                for (let i = 0, len = date_nodes.length; i < len; i += 1) {
                                    let days_txt = $sel.pickup(date_nodes[i], "txt");
                                    let over_two_days = days_txt.match(/\d{2}.\d{2}/); // like: "03-22"
                                    if (waitForAction(kw_protect_cover, 1000, 80) || over_two_days) {
                                        thread_list_more.interrupt();
                                        debugInfo(["动态列表展开已停止", "能量罩信息定位在: " + days_txt]);
                                        return len < 3 ? getDateNodes() : date_nodes; // 3 samples at most
                                    }
                                }
                            }

                            // tool function(s) //

                            function getDateNodes() {
                                // 3 arrays at most which can enhance efficiency a little bit
                                return kw_list.findOnce().children().filter((w) => {
                                    return !w.childCount() && w.indexInParent() < w.parent().childCount() - 1;
                                }).slice(0, 3);
                            }
                        }

                        function addBlist() {
                            let cover_node = kw_protect_cover("node");
                            let cover_txt = kw_protect_cover("txt");
                            let list_node = className("ListView").findOnce();
                            let list_children_size = list_node.childCount();
                            let date_str = "";
                            for (let i = 0; i < list_children_size; i += 1) {
                                let child = list_node.child(i);
                                if (!child.childCount()) {
                                    let txt = $sel.pickup(child, "txt");
                                    if (!txt.match(/.天/)) break;
                                    date_str = txt;
                                } else {
                                    if ($sel.pickup([child, "c0c1"], "txt") === cover_txt) break;
                                }
                            }

                            if (!date_str) return messageAction("获取能量罩使用时间失败", 3, 0, 0, "both_dash");

                            debugInfo("捕获动态列表日期字串: " + date_str);
                            let time_str_clip = $sel.pickup([cover_node, "p2c1"], "txt"); // like: "03:19"
                            debugInfo("捕获动态列表时间字串: " + time_str_clip);
                            let time_str = date_str + time_str_clip;

                            let current_name = $app.current_friend.name;
                            if (!(current_name in $app.blist.data)) $app.blist.data[current_name] = {};
                            $app.blist.data[current_name].timestamp = getTimestamp(time_str) + 86400000;
                            $app.blist.data[current_name].reason = "protect_cover";
                            blistMsg("add");

                            // tool function(s) //

                            function getTimestamp(time_str) {
                                let now = new Date();
                                let time = new Date();
                                let time_offset = time_str.match(/昨天/) ? -24 : 0;
                                let hour = time.setHours(now.getHours() + time_offset);
                                let final_time_str = new Date(hour).toDateString() + " " + time_str.slice(2);
                                return +new Date(final_time_str); // timestamp when protect cover took effect
                            }
                        }
                    }

                    function captNewBlistIdent() {
                        let screen_capture_new = images.captureCurrentScreen();
                        debugInfo("生成屏幕截图: " + images.getName(screen_capture_new));
                        blist_ident_captures.add(screen_capture_new);
                        debugInfo("已回收屏幕截图: " + images.getName(screen_capture_new));
                        images.reclaim(screen_capture_new);
                        screen_capture_new = null;
                    }
                }

                function take() {
                    debugInfo("已开启能量球收取线程");

                    if (!waitForAction(() => kw_energy_balls().length, 1000, 80)) return debugInfo("能量球准备超时");

                    let ripe_balls = kw_energy_balls("ripe");
                    if (!ripe_balls.length) return ($app.collect_clicked_flag = true) && debugInfo("没有可收取的能量球");

                    clickAndCount("collect", ripe_balls);
                }

                function help() {
                    debugInfo("已开启能量球帮收线程");

                    if (thread_energy_balls_monitor.isAlive()) {
                        thread_energy_balls_monitor.join();
                        debugInfo("能量球监测完毕");
                    }

                    let coords_arr = Object.keys(help_balls_coords);
                    if (!coords_arr.length) {
                        $app.help_clicked_flag = true;
                        $app.current_friend.six_balls_review_flag = false;
                        return debugInfo("没有可帮收的能量球");
                    }
                    if (!waitForAction(() => $app.collect_clicked_flag || !thread_take.isAlive(), 2000, 80)) {
                        $app.current_friend.six_balls_review_flag = false;
                        return messageAction("等待收取线程信号超时", 3, 0, 1);
                    }
                    debugInfo("收取线程信号返回正常");

                    clickAndCount("help", coords_arr);

                    if (init_balls_len === 6) {
                        if (!$cfg.six_balls_review_switch) return debugInfo("六球复查未开启");

                        let getReviewFlag = () => $app.current_friend.six_balls_review_flag;
                        let init_flag = getReviewFlag();
                        $app.current_friend.six_balls_review_flag = ++init_flag || 1;

                        let max_times = $cfg.six_balls_review_max_continuous_times;
                        if (getReviewFlag() > max_times) {
                            debugInfo(["不再设置六球复查标记", ">连续复查次数已达上限"]);
                            delete $app.current_friend.six_balls_review_flag;
                        } else debugInfo("设置六球复查标记: " + getReviewFlag());
                    }
                }

                function clickAndCount(action_str, balls_nodes) {
                    let default_config = {
                        collect: {
                            name: "收取",
                            action_name: "收取",
                            balls_click_func: () => {
                                balls_nodes.forEach((w) => {
                                    clickAction(w.bounds(), "press", {press_time: $cfg.energy_balls_click_interval});
                                });
                                debugInfo("点击成熟能量球: " + balls_nodes.length + "个");
                                $app.collect_clicked_flag = true;
                            },
                            dashboard_params: ["你收取TA", "kw_collect_data_ident", 10],
                        },
                        help: {
                            name: "帮收",
                            action_name: "助力",
                            balls_click_func: () => {
                                balls_nodes.forEach((coords) => {
                                    let pt = help_balls_coords[coords];
                                    clickAction([pt.x, pt.y], "press", {press_time: $cfg.energy_balls_click_interval});
                                });
                                debugInfo("点击帮收能量球: " + balls_nodes.length + "个");
                                $app.help_clicked_flag = true;
                            },
                            dashboard_params: ["你给TA助力", "kw_help_data_ident", 10],
                        },
                    };
                    let cfg = default_config[action_str];
                    let name = cfg.name;

                    let thread_ready_count = threads.atomic(0);
                    let final_result = threads.atomic(-1);

                    let threads_arr = [threads.starts(byDashboardThread), threads.starts(byDynamicListThread)];

                    init();
                    clickBalls();
                    getCount();

                    // tool function(s) //

                    function init() {
                        let max_try_time = 3000;
                        while (1) {
                            if (max_try_time < 0 || threadAllDead()) return messageAction("统计工具数据初始化失败", 3);
                            if (thread_ready_count.get()) return waitForAction(() => thread_ready_count.get() === threads_arr.length, 500, 50);
                            sleep(50);
                            max_try_time -= 50;
                        }
                    }

                    function clickBalls() {
                        cfg.balls_click_func();
                        return true;
                    }

                    function getCount() {
                        $app.valid_rank_list_icon_clicked = true;
                        $app.friend_drop_by_counter.decrease($app.current_friend.name);

                        thread_ready_count.get() && waitForAction(() => ~final_result.get() || threadAllDead(), 3000, 80);

                        killAllThreads();

                        if ($flag.msg_details) {
                            let action_name = cfg.action_name;
                            let final_result_num = final_result.get();
                            if (final_result_num >= 0) {
                                messageAction(action_name + ": " + final_result_num + "g", +!!final_result_num, 0, 1);
                                if (action_str === "collect") $app.total_energy_collect_friends += final_result_num;
                                // TODO save data to database here
                            } else messageAction(action_name + ": 统计数据无效", 0, 0, 1);
                            $app.current_friend.console_logged = 1;
                        }
                    }

                    function threadAllDead() {
                        for (let i = 0, len = threads_arr.length; i < len; i += 1) {
                            let thr = threads_arr[i];
                            if (thr && thr.isAlive()) return false;
                        }
                        return true;
                    }

                    function killAllThreads() {
                        threads_arr.forEach(thr => {
                            if (!thr || !thr.isAlive()) return;
                            thr.interrupt();
                            waitForAction(() => !thr.isAlive(), 300, 50);
                        });
                    }

                    // threads function(s) //

                    function byDashboardThread() {
                        let ori_dashboard_data = getDashboardData.apply(null, cfg.dashboard_params);
                        debugInfo("初始" + name + "面板数据: " + ori_dashboard_data);

                        thread_ready_count.incrementAndGet();
                        if (isNaN(ori_dashboard_data)) return debugInfo("初始" + name + "面板数据无效");

                        if (!waitForAction(() => $app[action_str + "_clicked_flag"], 2000, 50)) return;

                        debugInfo("等待" + name + "面板数据稳定");
                        let dashboard_data = stabilizer(() => getDashboardData.apply(null, cfg.dashboard_params.slice(0, 2)));
                        if (isNaN(dashboard_data)) return debugInfo(name + "面板稳定数据无效");
                        if (dashboard_data < ori_dashboard_data) return debugInfo(name + "面板稳定数据异常"); // possible condition: "g" to "kg"
                        debugInfo(name + "面板数据已稳定: " + dashboard_data);
                        final_result.compareAndSet(-1, dashboard_data - ori_dashboard_data);
                    }

                    function byDynamicListThread() {
                        if (!waitForAction(className("ListView"), 1500, 50)) {
                            thread_ready_count.incrementAndGet();
                            return debugInfo(name + "动态列表控件准备超时");
                        }
                        let ori_list_item_count = getCountFromDynamicInfoList(action_str);
                        debugInfo("初始" + name + "动态列表数据: " + ori_list_item_count);

                        thread_ready_count.incrementAndGet();
                        if (isNaN(ori_list_item_count)) return debugInfo("初始" + name + "动态列表数据无效");

                        if (!waitForAction(() => $app[action_str + "_clicked_flag"], 2000, 50)) return;

                        debugInfo("等待" + name + "动态列表数据稳定");
                        let list_item_count = stabilizer(() => getCountFromDynamicInfoList(action_str), ori_list_item_count);
                        if (isNaN(list_item_count)) return debugInfo(name + "动态列表稳定数据无效");
                        debugInfo(name + "动态列表数据已稳定: " + list_item_count);
                        let list_node = null;
                        let kw_list = type => $sel.pickup(className("ListView"), type);
                        if (waitForAction(() => list_node = kw_list(), 500, 100)) {
                            let result = 0;
                            for (let i = 1, len = list_item_count - ori_list_item_count; i <= len; i += 1) {
                                let matched = $sel.pickup([list_node, "c" + i + "c0c1"], "txt").match(/\d+/);
                                if (matched) result += +matched[0];
                            }
                            debugInfo(name + "动态列表统计结果: " + result);
                            final_result.compareAndSet(-1, result);
                        } else debugInfo(name + "动态列表结果统计失败", 3);
                    }
                }
            }

            function backToHeroList() {
                if (condition()) return true;

                let max_try_times = 3;
                while (max_try_times--) {
                    $app.page.back();
                    sleep(200);
                    if (waitForAction(condition, 2000)) return true;
                    debugInfo("返回排行榜单次超时");
                }
                debugInfo(["返回排行榜失败", "尝试重启支付宝到排行榜页面"], 3);

                return restartAlipayToHeroList();

                // tool function(s) //

                function condition() {
                    delete $app.rank_list_icon_clicked;
                    let capt_img = images.captureCurrentScreen();
                    let imageOrColorMatched = titleAreaMatch() || closeBtnColorMatch();
                    images.reclaim(capt_img);
                    capt_img = null;
                    if (imageOrColorMatched) return true;

                    // tool function(s) //

                    function titleAreaMatch() {
                        let template = $app.rank_list_title_area_capt;
                        if (images.isRecycled(template)) {
                            $app.rank_list_title_area_capt = null;
                            sleep(800); // for rank list page getting ready
                            if ($app.setRankListTitleAreaCapt) {
                                debugInfo("重新采集排行榜标题区域样本");
                                $app.setRankListTitleAreaCapt();
                            }
                            return;
                        }
                        if (!capt_img || images.isRecycled(capt_img)) capt_img = images.captureCurrentScreen();
                        if (images.findImage(capt_img, template)) {
                            debugInfo(["返回排行榜成功", ">已匹配排行榜标题区域样本"]);
                            return true;
                        }
                    }

                    function closeBtnColorMatch() {
                        let pt = $app.close_btn_coord;
                        if (!pt) return;
                        let {x, y} = $app.close_btn_coord;
                        if (!capt_img || images.isRecycled(capt_img)) capt_img = images.captureCurrentScreen();
                        if (images.detectsColor(capt_img, "#118ee9", x, y)) {
                            debugInfo(["返回排行榜成功", ">已匹配排行榜关闭按钮中心颜色"]);
                            return true;
                        }
                    }
                }

                function restartAlipayToHeroList() {
                    launchAFHomepage();
                    rankListReady();
                }
            }

            function swipeUp() {
                if (checkOwnCountdownDemand(+!!$cfg.homepage_background_monitor_switch)) rankListReady();
                if (list_end_signal) return debugInfo("检测到排行榜停检信号");

                swipeOnce();

                if (strategy === "image") sleep($cfg.rank_list_swipe_interval);

                $app.rank_list_capt_img = null;
                images.reclaim($app.rank_list_capt_img);
                $app.rank_list_capt_img = images.captureCurrentScreen();
                debugInfo("生成排行榜截图: " + images.getName($app.rank_list_capt_img));

                if (!checkRankListCaptDifference()) {
                    let kw_loading = type => $sel.pickup(/正在加载.*/, type, "kw_loading");
                    if (kw_loading()) {
                        let max_keep_waiting_time = 2 * 60000; // 2 min
                        debugInfo(["检测到\"正在加载\"按钮", "等待按钮消失 (最多" + max_keep_waiting_time + "分钟)"]);
                        if (waitForAction(() => !kw_loading(), max_keep_waiting_time, 1000)) {
                            list_end_signal = 0;
                            return debugInfo(["排行榜停检信号撤销", ">\"正在加载\"按钮已消失"]);
                        }
                        debugInfo("等待\"正在加载\"按钮消失超时", 3);
                    }

                    if ($sel.get("rl_end_ident")) {
                        let {left, top, right, bottom} = $sel.get("rl_end_ident", "bounds") || {};
                        if (bottom - top === $app.end_list_ident_height) {
                            list_end_signal = 1;
                            debugInfo(["发送排行榜停检信号", ">已匹配列表底部控件"]);
                            let capt_img = images.captureCurrentScreen();
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
                        waitForAndClickAction($sel.pickup("再试一次"), 15000, 500, {click_strategy: "widget"});
                        list_end_signal = 0;
                        return debugInfo(["排行榜停检信号撤销", ">检测到\"服务器打瞌睡\"页面"]);
                    }
                }

                if (checkRankListBottomTemplate() || checkInvitationBtnColor()) list_end_signal = 1;

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
                    let calcSwipeDistance = () => swipe_bottom - swipe_top;

                    debugInfo("上滑屏幕: " + calcSwipeDistance() + "px");

                    let calc_swipe_distance = calcSwipeDistance();
                    let swipe_functional = false;
                    let swipeAndClickOutside = () => {
                        if ((swipe_functional = swipe(halfW, swipe_bottom, halfW, swipe_top, swipe_time))) {
                            // just to prevent screen from turning off;
                            // maybe this is not a good idea
                            clickAction([Math.pow(10, 7), Math.pow(10, 7)]); // not press()
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
                        pool.push(images.copy($app.rank_list_capt_img));
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
                            debugInfo("回收排行榜截图: " + images.getName(pool[0]));
                            images.reclaim(pool[0]);
                            pool[0] = null;
                            pool.splice(0, 1);
                            pool_len = pool.length;
                        }

                        let similar_captures = false;

                        try {
                            similar_captures = images.findImage($app.rank_list_capt_img, pool[pool_len - 1]);
                        } catch (e) {
                            // debugInfo(["放弃排行榜截图样本差异检测", ">单次检测失败", ">" + e.message], 3);
                        }

                        let check_threshold = $cfg.rank_list_capt_pool_diff_check_threshold;
                        if (similar_captures) {
                            let counter = $app.rank_list_capt_pool_diff_check_counter += 1;
                            debugInfo(["排行榜截图样本池差异检测:", "检测未通过: (" + counter + "\/" + check_threshold + ")"]);
                            if (counter >= check_threshold) {
                                list_end_signal = 1;
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
                            if (!thread_list_end.isAlive()) {
                                thread_list_end = threads.starts(monitorEndOfListByUiObjThread);
                            }
                        } else {
                            let matched = images.findImage($app.rank_list_capt_img, bottom_template, {level: 1});
                            if (matched) return debugInfo(["列表底部条件满足", ">已匹配列表底部控件图片模板"]) || true;
                        }
                    }
                }

                function checkInvitationBtnColor() {
                    let color = "#30bf6c";
                    let multi_color = $app.check_invitation_btn_multi_colors || getCheckInvitationBtnMultiColors();

                    if (images.findMultiColors(
                        $app.rank_list_capt_img, color, multi_color,
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

            function reviewSamplesIfNeeded() {
                if ($app.rank_list_review_stop_signal) return debugInfo("检测到复查停止信号");
                if (!$cfg.rank_list_review_switch) return debugInfo("排行榜样本复查功能未开启");
                if (!$cfg.timers_switch) return debugInfo("定时循环功能未开启");

                if ($cfg.rank_list_review_difference_switch) {
                    if (!equalObjects(
                        $app.last_collected_samples && Object.keys($app.last_collected_samples),
                        Object.keys($app.last_collected_samples = getSamplesInfo())
                    )) return debugInfo(["触发排行榜样本复查条件:", "列表状态差异"], "both") || true;
                }

                if ($cfg.rank_list_review_samples_clicked_switch) {
                    if ($app.valid_rank_list_icon_clicked) {
                        $app.valid_rank_list_icon_clicked = false;
                        return debugInfo(["触发排行榜样本复查条件:", "样本点击记录"], "both") || true;
                    }
                }

                if ($cfg.rank_list_review_threshold_switch) {
                    if (checkMinCountdownFriends($cfg.rank_list_review_threshold)) {
                        return debugInfo(["触发排行榜样本复查条件:", "最小倒计时阈值"], "both") || true;
                    }
                }
            }

            function checkMinCountdownFriendsIfNeeded() {
                if ($cfg.timers_switch && $cfg.timers_self_manage_switch && $cfg.timers_countdown_check_friends_switch) {
                    $app.min_countdown_friends === undefined && checkMinCountdownFriends();
                }
            }

            function checkMinCountdownFriends(threshold_minute) {
                let now = new Date();

                threshold_minute = threshold_minute || $cfg.rank_list_review_threshold;

                debugInfo("开始检测好友能量最小倒计时");

                let names = Object.keys($app.last_collected_samples || {}); // {a: 123, b: 345, c: 123} -> ["a", "b", "c"]
                let names_len = names.length;
                if (!names_len) {
                    $app.min_countdown_friends = Infinity;
                    return debugInfo("好友能量最小倒计时检测完毕");
                } // no countdown, no need to checkRemain

                let countdown_data = [];
                names.forEach(name => countdown_data.push(+$app.last_collected_samples[name]));

                let min_countdown_friends = Math.min.apply(null, countdown_data); // timestamp

                let ripe_time = new Date(min_countdown_friends);
                let remain_minute = Math.round((ripe_time - +now) / 60000);

                if (remain_minute <= 0) return debugInfo("倒计时数据无效: " + remain_minute, 3);

                debugInfo("好友能量最小倒计时: " + remain_minute + "分钟");
                $app.min_countdown_friends = min_countdown_friends; // ripe timestamp
                debugInfo("时间数据: " + getNextTimeStr(min_countdown_friends));

                debugInfo("好友能量最小倒计时检测完毕");

                if (!isNaN(+threshold_minute)) return +remain_minute <= +threshold_minute;
            }

            function getCloseBtnCenterCoord() {
                if ($app.close_btn_coord) return;

                let node = $sel.get("close_btn");
                if (node) {
                    let bounds = node.bounds();
                    let [x, y] = [bounds.centerX(), bounds.centerY()];
                    if (x > cX(0.8) && y < cY(0.2)) {
                        $app.close_btn_coord = {x: x, y: y};
                        debugInfo("关闭按钮中心坐标: (" + x + ", " + y + ")");
                    } else debugInfo("关闭按钮位置异常");
                }
            }

            // TODO replace with "node.refresh()"
            function monitorEndOfListByUiObjThread() {
                if ($app.rank_list_bottom_template) return debugInfo(["无需监测排行榜底部控件", ">存在底部控件图片模板"]);

                debugInfo("已开启排行榜底部控件监测线程");

                let delay_swipe_time = 3000;
                let delay_swipe_time_sec = ~~(delay_swipe_time / 1000);
                delay_swipe_time = delay_swipe_time_sec * 1000;

                while (sleep(500) || true) {
                    $impeded("排行榜底部控件监测线程");

                    if (!$sel.get("rl_end_ident")) continue;

                    let sel_str = $sel.get("rl_end_ident", "sel_str");
                    let {left, top, right, bottom} = $sel.get("rl_end_ident", "bounds") || {};
                    if (bottom - top > cX(0.08)) {
                        list_end_signal = 1;
                        debugInfo("列表底部条件满足");
                        debugInfo(">bounds: [" + left + ", " + top + ", " + right + ", " + bottom + "]");
                        debugInfo(">" + sel_str + ": " + $sel.get("rl_end_ident", sel_str));
                        let capt_img = images.captureCurrentScreen();
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

                return debugInfo("排行榜底部控件监测线程结束");
            }

            function getDashboardData(selector_text, memory_keyword, max_try_times) {
                // let selector_node = $sel.pickup(selector_text, memory_keyword);
                // if (!selector_node) return NaN;

                max_try_times = max_try_times || 1;
                while (max_try_times--) {
                    try {
                        let txt = $sel.pickup([selector_text, "s+1"], "txt", memory_keyword);
                        if (txt.match(/\d+(kg|t)/)) {
                            debugInfo("放弃参照值精度过低的统计方法");
                            return NaN;
                        }
                        let value = txt.match(/\d+/);
                        return value === null ? NaN : +value;
                    } catch (e) {
                        console.error(e); //// TEST ////
                    }
                    if (max_try_times >= 0) sleep(50);
                }
                return NaN;
            }

            function getCountFromDynamicInfoList(type_str) {
                let list_node = null;
                let kw_list = type => $sel.pickup(className("ListView"), type);
                if (!waitForAction(() => list_node = kw_list(), 500, 100)) return NaN;

                let user_nickname = $app.user_nickname;
                let sel_str = kw_dynamic_list_info("sel_str");
                let regexp_activity = new RegExp("^" + (type_str.slice(0, 4) === "help" ? "帮忙" : "") + "收取\\d+g$");
                if ($sel.pickup([list_node, "c0"], sel_str) !== "今天") return 0;
                let i = 1;
                for (let len = list_node.childCount(); i < len; i += 1) {
                    let child_node = $sel.pickup([list_node, "c" + i + "c0"]);
                    if (!child_node) continue;
                    if ($sel.pickup([child_node, "c0"], sel_str) !== user_nickname) break;
                    if (!$sel.pickup([child_node, "c1"], sel_str).match(regexp_activity)) break;
                }
                return i - 1;
            }

            function inBlist(clickRankListItemFunc) {
                if (strategy === "image") {
                    clickRankListItemFunc();
                    sleep(500); // avoid touching widgets in rank list

                    if (checkForestTitle()) {
                        blistMsg("exist", "split_line", "forcible_flag");
                        backToHeroList();
                        return true;
                    }
                } else if (strategy === "layout") {
                    let current_friend_name = $app.current_friend.name;
                    $app.friend_drop_by_counter.increase(current_friend_name);
                    if (current_friend_name in $app.blist.data) {
                        $app.friend_drop_by_counter.decrease(current_friend_name);
                        return blistMsg("exist", "split_line"); // true
                    } else clickRankListItemFunc();
                }

                // tool function(s) //

                function checkForestTitle() {
                    let friend_nickname = "";
                    if (!waitForAction(() => friend_nickname = $sel.pickup(/.+的蚂蚁森林/, "txt"), 20000)) {
                        return messageAction("标题采集好友昵称超时", 3);
                    }
                    friend_nickname = friend_nickname.replace(/的蚂蚁森林$/, "");

                    $app.friend_drop_by_counter.increase(friend_nickname);
                    $app.current_friend.name = friend_nickname;

                    if ($flag.msg_details && !$app.current_friend.name_logged) {
                        messageAction(friend_nickname, "title");
                        $app.current_friend.name_logged = 1;
                    }

                    let is_in_blist = friend_nickname in $app.blist.data;
                    if (is_in_blist) $app.friend_drop_by_counter.decrease(friend_nickname);
                    return is_in_blist;
                }
            }

            function blistMsg(msg_str, split_line_flag, forcible_flag) {
                let messages = {
                    "add": "已加入黑名单",
                    "exist": "黑名单好友",
                };
                let reasons = {
                    "protect_cover": "好友使用能量保护罩",
                    "by_user": "用户自行设置",
                };

                let name = $app.current_friend.name;
                if (!$flag.msg_details || ~$app.logged_blist_names.indexOf(name)) {
                    forcible_flag && messageAction(messages[msg_str], 1, 0, 1, +!!split_line_flag);
                    return true;
                }

                messageAction(messages[msg_str], 1, 0, 1);
                msg_str === "exist" && messageAction("已跳过收取", 1, 0, 2);

                let current_black_friend = $app.blist.data[name];
                let reason_str = current_black_friend.reason;
                messageAction(reasons[reason_str], 1, 0, 2);
                let check_result = checkBlackTimestamp(current_black_friend.timestamp);
                $$str(check_result) && messageAction(check_result, 1, 0, 2);
                split_line_flag && showSplitLine();
                $app.logged_blist_names.push(name);
                return $app.current_friend.console_logged = 1;

                function checkBlackTimestamp(ts) {
                    if ($$und(ts)) return true;
                    if ($$inf(ts)) return true;

                    let now = new Date();
                    let du_ts = ts - +now;
                    if (du_ts <= 0) return;

                    if (!$flag.msg_details) return true;

                    let du_time_o = new Date(Date.parse(now.toDateString()) + du_ts);
                    let padZero = num => ("0" + num).slice(-2);
                    let dd = ~~(du_ts / 1000 / 3600 / 24);
                    let hh = du_time_o.getHours();
                    let mm = du_time_o.getMinutes();
                    let ss = du_time_o.getSeconds();
                    let dd_str = dd ? dd + "天" : "";
                    let hh_str = hh ? padZero(hh) + "时" : "";
                    let mm_str = hh || mm ? padZero(mm) + "分" : "";
                    let ss_str = (hh || mm ? padZero(ss) : ss) + "秒";
                    return dd_str + hh_str + mm_str + ss_str + "后解除";
                }
            }

            function getSamplesInfo() {
                let countdown_nodes_arr = $sel.pickup(new RegExp("\\d+\u2019"), "nodes", "kw_countdown_minute");
                let countdown_nodes_len = countdown_nodes_arr.length;

                debugInfo("捕获好友能量倒计时数据: " + countdown_nodes_len + "个");
                if (!countdown_nodes_len) return {};

                let collected_samples = {};
                countdown_nodes_arr.forEach((countdown_node) => {
                    let getTxt = compass => $sel.pickup([countdown_node, compass], "txt");
                    let mm = +$sel.pickup(countdown_node, "txt").match(/\d+/)[0];
                    collected_samples[getTxt("p2c2c0c0")] = $app.ts + mm * 60000; // next ripe timestamp
                });
                return collected_samples;
            }

            function checkOwnCountdownDemand(minute) {
                if (!minute) return;
                let countdown = $app.min_countdown_own; // timestamp
                if (!countdown || countdown === Infinity) return;
                if ($app.min_countdown_own - $app.ts <= minute * 60000 + 3000) {
                    messageAction("返回蚂蚁森林主页监测自己能量", 1, 1, 0, 1);
                    launchAFHomepage();
                    checkOwnEnergy();
                    return true;
                }
            }

            function checkHelpSection() {
                let section = $cfg.help_collect_section; // ["00:00", "00:00"]
                if (section[0] === section[1]) return true;
                if (section[1] < section[0]) section[1] = section[1].replace(/\d{2}(?=:)/, +section[1].split(":")[0] + 24 + "");
                let now = new Date();
                let padZero = num => ("0" + num).slice(-2);
                let now_hh_mm_str = padZero(now.getHours()) + ":" + padZero(now.getMinutes());
                let result = now_hh_mm_str >= section[0] && now_hh_mm_str < section[1];
                if (!result && !$app.help_without_section_flag) {
                    debugInfo("当前时间不在帮收有效时段内");
                    $app.help_without_section_flag = true;
                }
                return result;
            }
        }

        function setTimers() {
            if (!$cfg.timers_switch) return debugInfo("定时循环功能未开启");
            if (!$cfg.timers_self_manage_switch) return debugInfo("定时任务自动管理未开启");

            let type_info = {
                min_countdown: "最小倒计时",
                uninterrupted: "延时接力",
                insurance: "意外保险",
            };

            if (!$cfg.timers_countdown_check_own_switch) $app.min_countdown_own = Infinity;
            if (!$cfg.timers_countdown_check_friends_switch) $app.min_countdown_friends = Infinity;

            let ahead_own = $cfg.timers_countdown_check_own_timed_task_ahead;
            let ahead_friends = $cfg.timers_countdown_check_friends_timed_task_ahead;
            let min_own = ($app.min_countdown_own || Infinity) - ahead_own * 60000;
            let min_friends = ($app.min_countdown_friends || Infinity) - ahead_friends * 60000;

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
                debugInfo("时间数据: " + getNextTimeStr(next_time));

                return next_time;
            }

            function addOrUpdateAutoTask(info_arr) {
                let [next_launch_time, type] = info_arr;

                let task = update() || add();

                messageAction("任务ID: " + task.id, 1, 0, 1);
                messageAction("下次运行: " + getNextTimeStr(next_launch_time), 1, 0, 1);
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
        }
    }

    function logBackInIfNeeded() {
        let {account_log_back_in_switch, account_log_back_in_max_continuous_times} = $cfg;
        let {init_logged_in_user_abbr_name, init_is_main_user_logged_in} = $app;
        let sto_key_name = "log_back_in_user";
        let clearLogBackInStorage = () => {
            if ($sto.af.contains(sto_key_name)) {
                $sto.af.remove(sto_key_name);
                debugInfo("已清理回切账户存储信息");
            }
        };

        if (init_is_main_user_logged_in) {
            debugInfo(["无需回切账户", ">初始登录账户已是主账户"]);
            return clearLogBackInStorage();
        }

        if (!account_log_back_in_switch) {
            debugInfo(["无需回切账户", ">旧账户回切功能未开启"]);
            return clearLogBackInStorage();
        }

        if (!init_logged_in_user_abbr_name) {
            debugInfo(["无法回切账户", ">未获取初始登录账户信息"]);
            return clearLogBackInStorage();
        }

        let init_data = {name: init_logged_in_user_abbr_name, times: 0};
        let sto_data = $sto.af.get(sto_key_name, init_data);
        if (sto_data.name !== init_logged_in_user_abbr_name) sto_data = init_data;

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

        if (!logBackIn()) {
            debugInfo("旧账户回切失败", 3);
            return clearLogBackInStorage();
        }

        debugInfo("旧账户回切成功");
        $sto.af.put(sto_key_name, sto_data);
        debugInfo("已更新回切账户存储信息");
        return true;

        // tool function(s) //

        function logBackIn() {
            return launchUserList() && clickAbbrNameInUserList(init_logged_in_user_abbr_name);
        }
    }

    function epilogue() {
        Promise.all([showResultAsync(), prepareForExitAsync()])
            .then(() => cleanRankListCaptPool())
            .then(() => screenOffIfNeededAsync())
            .then(() => exitNow())
            .catch((e) => messageAction(e, 4, 1, 0, "both"));

        // promise function(s) //

        function showResultAsync() {
            return new Promise((resolve) => {
                if (!$cfg.message_showing_switch || !$cfg.result_showing_switch) return resolve(true);

                debugInfo("开始展示统计结果");

                let isNoneNegNum = num => !isNaN(+num) && +num >= 0;
                let own = $app.total_energy_collect_own;
                debugInfo("自己能量收取值: " + own);
                let friends = $app.total_energy_collect_friends;
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
                        $app.floaty_msg_finished_flag = 0;
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
                                return decodeURIComponent(notes[~~(Math.random() * notes.length)]).replace(/\+(?!\/)/g, " ");
                            };
                            hints = [pickUpOneNote()];
                            debugInfo("随机挑选提示语");
                            hint_len = hints.length;
                        }

                        debugInfo("开始绘制Floaty");

                        let window_cover = floaty.rawWindow(<frame id="cover" gravity="center" bg="#7f000000"/>);
                        let human_touched = false;

                        window_cover.cover.on("click", () => {
                            if (human_touched) {
                                floaty_failed_flag = false;
                                $app.floaty_msg_finished_flag = 1;
                                debugInfo(["触发遮罩层触摸事件", "提前结束Floaty结果展示", "发送Floaty消息结束等待信号"]);
                                floaty.closeAll();
                            } else {
                                debugInfo(["模拟一次\"深度返回\"操作", ">检测到非用户点击行为"]);
                                keycode(4, "double");
                            }
                        });

                        window_cover.cover.setOnTouchListener(
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

                        window_cover.setSize(-1, -1);
                        window_cover.setTouchable(true); // prevent touch event transferring to the view beneath

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
                                if (countdown <= 0 || $app.floaty_msg_finished_flag) {
                                    if (floaty_failed_flag) {
                                        messageAction("此设备可能无法使用Floaty功能", 3, 1);
                                        messageAction("建议改用Toast方式显示收取结果", 3);
                                    }

                                    let prefix = floaty_failed_flag ? "强制" : "";
                                    debugInfo(prefix + "关闭所有Floaty窗口");
                                    floaty.closeAll();

                                    if ($app.floaty_msg_finished_flag === 0) {
                                        $app.floaty_msg_finished_flag = 1;
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
                                    $app.floaty_msg_finished_flag || debugInfo(["Floaty倒计时文本设置单次失败:", e.message]);
                                }
                            });
                        }
                    }
                }
            });
        }

        function prepareForExitAsync() {
            debugInfo("存储本次会话黑名单数据");
            $app.blist.save();

            if ($cfg.kill_when_done_switch) {
                endAlipay(); // kill (or minimize) alipay immediately
            } else {
                if ($app.kill_when_done_intelligent_kill) endAlipay();
                else $cfg.kill_when_done_keep_af_pages || closeAFWindows();
            }

            removeSpringboardIfNeeded();

            $flag.glob_e_scr_prv = true;

            return new Promise((resolve) => {
                if ($app.floaty_msg_finished_flag === 1) return resolve();

                timeRecorder("wait_for_floaty_msg_finished");
                let max_wait_duration = (+$cfg.floaty_result_countdown + 3) * 1000;
                let timedOut = () => timeRecorder("wait_for_floaty_msg_finished", "load") > max_wait_duration;

                debugInfo("等待Floaty消息结束等待信号");

                let condition = () => {
                    if ($app.floaty_msg_finished_flag === 1) {
                        return resolve() || true;
                    }
                };

                setIntervalBySetTimeout(function () {
                    if (timedOut()) {
                        $app.floaty_msg_finished_flag = 1;
                        debugInfo(["放弃等待Floaty消息结束信号", ">等待结束信号超时"], 3);
                        resolve();
                    }
                }, 200, condition);
            });

            // tool function(s) //

            function closeAFWindows() {
                debugInfo("关闭全部蚂蚁森林相关页面");

                let forestPage = () => $sel.pickup([/浇水|发消息/, {className: "Button"}]);
                let {kw_login_with_new_user} = $app;

                let max_close_time = 10000;
                timeRecorder("close_af_windows");
                while ($sel.get("af_title") || forestPage() || kw_login_with_new_user() || $sel.get("rl_title")) {
                    $app.page.keyBack();
                    sleep(400);
                    if (timeRecorder("close_af_windows", "load") >= max_close_time) break;
                }
                debugInfo(max_close_time > 0 ? ["相关页面关闭完毕", "保留当前支付宝页面"] : "页面关闭可能没有成功");
            }

            function removeSpringboardIfNeeded() {
                if ($cfg.app_launch_springboard === "ON") {
                    if (!$app.alipay_closed_flag) return debugInfo(["跳过启动跳板移除操作", ">支付宝未关闭"]);

                    let {init_autojs_state, cur_autojs_name, isAutojsForeground, isAutojsHomepage} = $app;
                    let {init_foreground, init_homepage, init_log_page, init_settings_page} = init_autojs_state;
                    let doubleBack = () => ~back() && ~back() && sleep(400);
                    let restoreSpringboard = (symbol) => {
                        let message = "恢复跳板" + surroundWith(symbol[0].toUpperCase() + symbol.slice(1), " ") + "页面";
                        debugInfo(message);
                        messageAction(message, null, 1);
                        return app.startActivity(symbol);
                    };

                    if (!waitForAction(isAutojsForeground, 9000, 300)) {
                        return debugInfo("等待返回" + cur_autojs_name + "应用页面超时");
                    }

                    if (!init_foreground) return removeSpringboard(isAutojsForeground, doubleBack);

                    if (!init_homepage) {
                        if (init_log_page) return restoreSpringboard("console");
                        if (init_settings_page) return restoreSpringboard("settings");
                        return removeSpringboard(isAutojsHomepage, doubleBack);
                    }

                    return debugInfo("无需移除启动跳板");
                }

                // tool function(s) //

                function removeSpringboard(conditionFunc, removeFunc) {
                    debugInfo("移除启动跳板");
                    let max_times_back = 5;
                    while (conditionFunc() && max_times_back--) removeFunc();
                    return max_times_back >= 0 ? debugInfo("跳板移除成功") : debugInfo("跳板移除可能失败", 3);
                }
            }
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
                    // let keycode_power_bug_versions = [/[Mm]eizu|Sony/]; //// TEST ////
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
}

function launchAFHomepage(params) {
    params = params || {};
    if ($flag.first_time_run) {
        messageAction("开始" + $app.task_name + "任务", 1, 1, 0, "both");
        $flag.first_time_run = false;
        Object.assign(params, {screen_orientation: 0});
    }
    if ($cfg.app_launch_springboard === "ON") {
        debugInfo("使用启动跳板");
        let {cur_autojs_pkg, cur_autojs_name} = $app;
        launchThisApp(cur_autojs_pkg, {
            app_name: cur_autojs_name,
            debug_info_flag: false,
            no_message_flag: true,
            first_time_run_message_flag: false,
            condition_ready: $app.isAutojsForeground,
        }) ? debugInfo("跳板启动成功") : debugInfo(["跳板启动失败", ">打开" + cur_autojs_name + "应用超时"], 3);
    }
    let launch_result = plans("launch_af_homepage", Object.assign({}, {exclude: "_test_"}, params));
    if ($dev.screen_orientation !== 0) getDisplayParams({global_assign: true});
    return launch_result;
}

function dismissPermissionDialogsIfNeeded() {
    let kw_need_to_dismiss = type => $sel.pickup(idMatches(/.*btn_confirm/), type, "kw_need_to_dismiss_of_permission");
    let kw_allow_btn = type => $sel.pickup(/[Aa][Ll]{2}[Oo][Ww]|允许/, type, "kw_allow_btn");

    let max_try_times = 10;
    let condition = () => kw_need_to_dismiss() || kw_allow_btn();
    while (condition() && max_try_times--) {
        clickAction(condition(), "widget");
        sleep(500);
    }
}

function loginMainUser(direct_login_flag) {
    if (!$cfg.account_switch) return debugInfo("主账户功能未开启");

    let _acc_name = $acc.main.name;
    if (!_acc_name) return debugInfo("主账户用户名未设置");
    let _acc = accountNameConverter(_acc_name, "decrypt");

    if (direct_login_flag) return loginMainUserNow();

    let avatar_local_path = $app.local_pics_path + "main_user_mini_avatar_clip.png";
    let avatar_local_img = images.read(avatar_local_path);

    timeRecorder("avatar_check");
    let avatar_check_result = checkAvatar(avatar_local_img);
    $app.avatar_checked_time = timeRecorder("avatar_check", "load");

    if (avatar_check_result) {
        debugInfo(["当前账户符合主账户身份", ">本地主账户头像匹配成功"]);
        $app.init_is_main_user_logged_in = true;
        return true;
    } else {
        debugInfo(["主账户身份检查未通过", ">本地主账户头像不匹配"])
    }

    if (checkIfUserLoggedIn(_acc) || loginMainUserNow()) {
        launchAFHomepage();
        saveNewAvatar();
        return true;
    }

    messageAction("强制停止脚本", 4, 1, 0, "up");
    return messageAction("主账户登录失败", 8, 1, 1, 1);

    // tool function(s) //

    function checkAvatar(img) {
        if (!img) return;
        let current_avatar = getCurrentAvatar();
        if (!current_avatar) return;
        let matched = images.findImage(current_avatar, img, {level: 1});
        images.reclaim(current_avatar);
        current_avatar = null;
        return matched;
    }

    function getCurrentAvatar() {
        let bounds = null;
        waitForAction(() => bounds = getAvatarPosition("bounds"), 3000, 100);
        if (!bounds) {
            messageAction("无法获取当前头像样本", 3);
            return messageAction("森林主页头像控件定位失败", 3, 1);
        }
        let [l, t, w, h] = [bounds.left, bounds.top, bounds.width(), bounds.height()];
        let [w_chopped, h_chopped] = [w / Math.sqrt(2), h / Math.sqrt(2)];
        let capt_img = images.captureCurrentScreen();
        let avatar_clip = images.clip(
            capt_img,
            // to get the biggest rectangle area inside the circle (or ellipse)
            // remove 1 pixel from each side of the area
            l + (w - w_chopped) / 2 + 1,
            t + (h - h_chopped) / 2 + 1,
            w_chopped - 2,
            h_chopped - 2
        );
        images.reclaim(capt_img);
        capt_img = null;
        return avatar_clip;

        // tool function(s) //

        function getAvatarPosition(specified_type) {
            let _$sel = getSelector({debug_info_flag: false});
            let o = {
                kw_my_tree_plant_plan: type => _$sel.pickup("我的大树养成记录", type),
                kw_user_energy: type => _$sel.pickup([idMatches(/.*user.+nergy/), "p2c0"], type),
                kw_plant_tree_btn: type => _$sel.pickup(["种树", {className: "Button"}, "p1c0"], type),
                kw_home_panel: type => _$sel.pickup([idMatches(/.*home.*panel/), "c0c0c0"], type),
            };
            let o_keys = Object.keys(o);
            for (let i = 0, len = o_keys.length; i < len; i += 1) {
                let kw = o[o_keys[i]];
                let result = kw(specified_type);
                if (result) {
                    debugInfo(["森林主页头像控件定位成功", ">" + kw("selector").toString()]);
                    return result;
                }
            }
            return null;
        }
    }

    function saveNewAvatar() {
        let current_avatar = getCurrentAvatar();
        if (!current_avatar) return;
        images.save(current_avatar, avatar_local_path);
        images.reclaim(current_avatar);
        current_avatar = null;
        return true;
    }

    function loginMainUserNow() {
        let _acc_code = $acc.main.code;
        let _kw_home = $sel.get("alipay_home");
        let {
            kw_login_with_other_user,
            kw_login_with_other_method,
            kw_login_with_other_method_in_init_page,
            kw_login_next_step_btn,
            kw_login_btn,
            kw_login_by_code_btn,
            kw_input_label_account,
            kw_input_label_code,
            kw_login_error_ensure_btn,
            kw_user_logged_out,
            getLoginErrorMsg,
            isInLoginPage,
            isInSwitchAccPage,
        } = $app;

        return clickAbbrNameInUserList() || inputUsernameAndCode();

        // tool function(s) //

        function inputUsernameAndCode() {
            if (!waitForAction(() => {
                if (kw_user_logged_out()) clickAction($sel.pickup(/好的|OK/), "widget");
                return isInLoginPage() || isInSwitchAccPage();
            }, 3000)) return messageAction("无法判断当前登录页面状态", 4, 1, 0, "both_dash");

            if (!isInLoginPage()) {
                if (!clickAction($sel.pickup([$app.kw_login_with_new_user(), "p4"]), "widget")) {
                    app.startActivity({
                        action: "VIEW",
                        className: "com.alipay.mobile.security.login.ui.RecommandAlipayUserLoginActivity",
                        packageName: "com.eg.android.AlipayGphone",
                    });
                }
            }

            clickUseAnotherAccountBtnIfNeeded();
            inputUserAccount() && inputUserCode();

            return checkLoginState();

            // tool function(s) //

            function clickUseAnotherAccountBtnIfNeeded() {
                waitForAction(() => {
                    return kw_login_with_other_user()
                        || kw_input_label_account()
                        || kw_login_with_other_method_in_init_page();
                }, 3000);
                if (kw_login_with_other_user()) {
                    debugInfo("点击\"换个账号登录\"按钮");
                    clickAction(kw_login_with_other_user(), "widget");
                } else if (kw_login_with_other_method_in_init_page()) {
                    debugInfo("点击\"其他登录方式\"按钮");
                    clickAction(kw_login_with_other_method_in_init_page(), "widget");
                }
                waitForAction(kw_input_label_account, 3000); // just in case
            }

            function inputUserAccount() {
                debugInfo("尝试完成账户名输入");

                let inputExists = () => $sel.pickup(_acc);
                let condition_a = () => waitForAction(inputExists, 1000);
                let condition_b = () => !waitForAction(() => !inputExists(), 500, 100);
                let condition_ok = () => condition_a() && condition_b();

                let max_try_input_account = 3;
                while (max_try_input_account--) {
                    if (kw_input_label_account()) {
                        debugInfo("找到\"账号\"输入项控件");
                        let input_node = $sel.pickup([kw_input_label_account(), "p2c1"]);
                        let input_result = false;
                        if (input_node) {
                            debugInfo("布局树查找可编辑\"账号\"控件成功");
                            input_result = input_node.setText(_acc);
                        } else {
                            debugInfo("布局树查找可编辑\"账号\"控件失败", 3);
                            debugInfo("尝试使用通用可编辑控件", 3);
                            let edit_text_node = className("EditText").findOnce();
                            input_result = edit_text_node && edit_text_node.setText(_acc);
                        }
                        debugInfo("控件输入账户名" + (input_result ? "成功" : "失败"), input_result ? 0 : 3);
                    } else {
                        messageAction("布局查找\"账号\"输入项控件失败", 3, 0, 0, "up_dash");
                        messageAction("尝试盲输", 3, 0, 0, "dash");
                        setText(0, _acc);
                    }
                    if (condition_ok()) break;
                }
                if (max_try_input_account < 0) return messageAction("输入账户名后检查输入未通过", 4, 1, 0, "both_dash");
                debugInfo("成功输入账户名");

                if (kw_input_label_code()) return debugInfo(["无需点击\"下一步\"按钮", ">存在\"密码\"输入项控件"]) || true;
                if (kw_login_btn()) return debugInfo(["无需点击\"下一步\"按钮", ">存在\"登录\"按钮控件"]) || true;

                debugInfo("点击\"下一步\"按钮");

                clickAction($sel.pickup([kw_login_next_step_btn(), "p1"]), "widget", {
                    max_check_times: 3,
                    check_time_once: 500,
                    condition_success: () => !kw_login_next_step_btn(),
                });

                let kw_incorrect_code_try_again = type => $sel.pickup(/重新输入|Try again/, type, "kw_incorrect_code_try_again");
                if (waitForAction(() => {
                    return kw_input_label_code() || kw_login_with_other_method()
                        || kw_login_error_ensure_btn() || kw_incorrect_code_try_again();
                }, 8000)) {
                    let wait_times = 3;
                    while (wait_times--) {
                        if (waitForAction(kw_input_label_code, 1500)) return debugInfo("找到\"密码\"输入项控件") || true;
                        if (kw_login_error_ensure_btn() || kw_incorrect_code_try_again()) {
                            messageAction("登录失败", 4, 1, 0, "up");
                            messageAction("失败提示信息:" + getLoginErrorMsg(), 8, 0, 1, 1);
                        }
                        if (kw_login_with_other_method()) {
                            debugInfo("点击\"换个方式登录\"按钮");
                            clickAction(kw_login_with_other_method(), "widget");
                            if (!waitForAction(kw_login_by_code_btn, 2000)) {
                                return messageAction("未找到\"密码登录\"按钮", 4, 1, 0, "both_dash");
                            }
                            debugInfo("点击\"密码登录\"按钮");
                            clickAction($sel.pickup([kw_login_by_code_btn(), "p1"]), "widget");
                        }
                    }
                }

                return messageAction("查找\"密码\"输入项控件超时", 4, 1, 0, "both_dash");
            }

            function inputUserCode() {
                debugInfo("尝试完成密码输入");
                return _acc_code ? inputAutomatically() : inputManually();

                // tool function(s) //

                function inputManually() {
                    debugInfo("需要手动输入密码");
                    vibrateDevice(0, 0.1, 0.3, 0.1, 0.3, 0.2);

                    let timeout_user_response = 2; // min
                    let timeout_login_btn_dismissed = 2; // min
                    let result = false;

                    let max_check_time = ~~(timeout_user_response + timeout_login_btn_dismissed) * 60000;
                    $flag.glob_e_scr_paused = true;
                    device.keepOn(max_check_time);

                    threads.starts(function () {
                        let diag = dialogs.builds(["需要密码", "login_password_needed", 0, 0, "确定", 1]);
                        diag.on("positive", () => diag.dismiss()).show();

                        threads.starts(function () {
                            debugInfo(["等待用户响应\"需要密码\"对话框", ">最大超时时间: " + timeout_user_response + "分钟"]);
                            if (!waitForAction(() => {
                                return diag.isCancelled() && !waitForAction(() => !diag.isCancelled(), 2000);
                            }, timeout_user_response * 60000)) {
                                device.cancelOn();
                                diag.dismiss();
                                messageAction("脚本无法继续", 4, 0, 0, "up");
                                messageAction("登录失败", 4, 0, 1);
                                messageAction("需要密码时等待用户响应超时", 9, 1, 1, 1);
                            }
                            debugInfo(["等待用户点击\"登录\"按钮", ">最大超时时间: " + timeout_login_btn_dismissed + "分钟"]);
                            if (!waitForAction(() => {
                                return !kw_login_btn() && !waitForAction(() => {
                                    return $sel.pickup(/.*confirmSetting|.*mainTip|.*登录中.*|.*message/)
                                        || kw_login_error_ensure_btn();
                                }, 500);
                            }, timeout_login_btn_dismissed * 60000)) {
                                device.cancelOn();
                                diag.dismiss(); // just in case
                                messageAction("脚本无法继续", 4, 0, 0, "up");
                                messageAction("登录失败", 4, 0, 1);
                                messageAction("等待\"登录\"按钮消失超时", 9, 1, 1, 1);
                            }
                            result = true;
                        });
                    });

                    while (!result) sleep(500);

                    click(Math.pow(10, 7), Math.pow(10, 7));
                    delete $flag.glob_e_scr_paused;
                    device.cancelOn();

                    return true;
                }

                function inputAutomatically() {
                    debugInfo("尝试自动输入密码");

                    let decrypt = new (require("./Modules/MODULE_PWMAP"))().pwmapDecrypt;
                    if ($sel.pickup([kw_input_label_code(), "p2c1"]).setText(decrypt(_acc_code))) {
                        debugInfo("布局树查找可编辑\"密码\"控件成功");
                    } else {
                        debugInfo("布局树查找可编辑\"密码\"控件失败", 3);
                        debugInfo("尝试使用通用可编辑控件", 3);
                        let edit_text_node = className("EditText").findOnce();
                        let input_result = edit_text_node && edit_text_node.setText(decrypt(_acc_code));
                        debugInfo("通用可编辑控件输入" + (input_result ? "成功" : "失败"), input_result ? 0 : 3);
                    }

                    debugInfo("点击\"登录\"按钮");
                    if (!clickAction(kw_login_btn(), "widget")) {
                        return messageAction("输入密码后点击\"登录\"失败", 4, 1, 0, "both_dash");
                    }
                }
            }

            function checkLoginState() {
                let conditions = {
                    name: "登录账户",
                    time: 0.5, // 30 sec
                    wait: [{
                        remark: "登录中进度条",
                        cond: () => $sel.pickup(/.*登录中.*/),
                    }],
                    success: [{
                        remark: "支付宝首页",
                        cond: _kw_home,
                    }, {
                        remark: "H5关闭按钮",
                        cond: $sel.get("close_btn"),
                    }],
                    fail: [{
                        remark: "失败提示",
                        cond: kw_login_error_ensure_btn,
                        feedback: () => {
                            device.cancelOn();
                            messageAction("脚本无法继续", 4, 0, 0, "up");
                            messageAction("登录失败", 4, 1, 1);
                            messageAction("失败提示信息:" + getLoginErrorMsg(), 9, 0, 1, 1);
                        },
                    }, {
                        remark: "失败提示",
                        cond: () => $sel.pickup(/.*confirmSetting|.*mainTip/),
                        feedback: () => {
                            device.cancelOn();
                            messageAction("脚本无法继续", 4, 0, 0, "up");
                            messageAction("登录失败", 4, 1, 1);
                            messageAction("失败提示信息:" + $sel.pickup(/.*mainTip/, "txt"), 9, 0, 1, 1);
                        },
                    }],
                    timeout_review: [{
                        remark: "强制账号列表检查",
                        cond: () => {
                            if (checkIfUserLoggedIn(_acc, "forcible")) return true;
                            messageAction("脚本无法继续", 4, 0, 0, "up");
                            messageAction("切换主账户超时", 9, 1, 1, 1);
                        },
                    }]
                };

                return conditionChecker(conditions);
            }
        }
    }
}

// tool function(s) //

function endAlipay() {
    debugInfo("关闭支付宝");
    let alipay_pkg_name = $app.package_name;
    if (!killThisApp(alipay_pkg_name, {shell_acceptable: true})) return debugInfo("支付宝关闭超时", 3);
    debugInfo("支付宝关闭完毕");
    $app.alipay_closed_flag = true;
}

function exitNow() {
    messageAction($app.task_name + "任务结束", 1, 0, 0, "both_n");
    return ui.post(exit);
}

function encodeURIParams(prefix, params) {
    let [_params, _data] = $$comObj(prefix) ? [prefix, ""] : [params, prefix.toString()];
    Object.keys(_params).forEach((key) => {
        let _separator = _data.match(/\?.+=/) ? "&" : "?";
        let _value = $$comObj(_params[key])
            ? encodeURIParams(_params[key])
            : encodeURI(_params[key]);
        _data += _separator + key + "=" + _value;
    });
    return params ? _data : _data.slice(1);
}

function accountNameConverter(str, opr_name) {
    if (!str) return "";
    let arr = str.toString().split("");
    arr.forEach((value, idx, arr) => {
        arr[idx] = unescape(
            "%u" + ("0000" + (
                value.charCodeAt(0) + (996 + idx) * {encrypt: 1, decrypt: -1}[opr_name]
            ).toString(16)).slice(-4)
        );
    });
    return arr.join("");
}

function stabilizer(condition, init, condition_timeout, stable_timeout) {
    condition_timeout = condition_timeout || 3000;
    let init_data = $$und(init) ? NaN : +init;
    let _condition = () => {
        let result = +condition();
        init_data = isNaN(init_data) ? result : init_data;
        return result;
    };
    if (!waitForAction(() => !isNaN(_condition()), condition_timeout)) return NaN;
    if (!waitForAction(() => init_data !== _condition(), condition_timeout)) return NaN;
    stable_timeout = stable_timeout || 300;
    let old_data = init_data;
    let tmp_data = NaN;
    let check = () => tmp_data = condition();
    while (waitForAction(() => old_data !== check(), stable_timeout)) old_data = tmp_data;
    return old_data;
}

function getNextTimeStr(time) {
    let time_o = new Date(+time);
    let padZero = num => ("0" + num).slice(-2);
    return time_o.getFullYear() + "/"
        + padZero(time_o.getMonth() + 1) + "/"
        + padZero(time_o.getDate()) + " "
        + padZero(time_o.getHours()) + ":"
        + padZero(time_o.getMinutes()) + ":"
        + padZero(time_o.getSeconds());
}

function plans(operation_name, params) {
    params = params || {};

    let plans = {
        launch_af_homepage: {
            plans_data: [
                ["intent_with_params", launchAFHomepageByIntent, $app.homepage_intent.common_browser_rich],
                ["click_af_btn_at_homepage", launchAFHomepageByClickAFBtnAtHomepage],
                ["search_by_keyword", launchAFHomepageBySearchKeyword, "蚂蚁森林小程序"],
            ],
            error_level: 4,
        },
        launch_rank_list: {
            plans_data: [
                ["intent_with_params", launchRankListByIntent, $app.rank_list_intent],
                ["click_list_more_btn", launchRankListByClickListMoreBtn],
            ],
            error_level: 3,
        },
    }; // error_level: 0, 1, 3 - verbose, log and warn; 4 - throw Error()

    if (!(operation_name in plans)) return;

    let filtered_plans_data = plans[operation_name].plans_data;
    let exclude_plan_names = params.exclude || [];
    let include_plan_names = params.include || filtered_plans_data.map(plan_data => plan_data[0]);

    if ($$str(exclude_plan_names)) exclude_plan_names = [exclude_plan_names];
    if ($$str(include_plan_names)) include_plan_names = [include_plan_names];

    filtered_plans_data = filtered_plans_data.filter(plan_data => {
        let plan_name = plan_data[0];
        return !~exclude_plan_names.indexOf(plan_name) && ~include_plan_names.indexOf(plan_name);
    });

    for (let i = 0, len = filtered_plans_data.length; i < len; i += 1) {
        let plan_data = filtered_plans_data[i];
        let [plan_name, plan_operation, plan_extra_param_for_opr] = plan_data;
        try {
            debugInfo("操作: " + operation_name);
            debugInfo("计划: " + plan_name);
            if (plan_operation.call(null, plan_extra_param_for_opr)) return true;
        } catch (e) {
            debugInfo(e.message);
        }
        debugInfo("失败: " + plan_name, 3);
    }

    let [error_level] = plans[operation_name];
    let error_msg = "操作计划全部失败";
    if (+error_level === 4) throw Error(error_msg);
    return messageAction(error_msg, +error_level) && false;

    // tool function(s) //

    function launchAFHomepageWithTrigger(trigger) {
        return launchThisApp(trigger, Object.assign({}, {
            task_name: "蚂蚁森林",
            package_name: $app.package_name,
            no_message_flag: true,
            condition_launch: () => {
                let condition_a = () => $app.cur_pkg === $app.package_name;
                let condition_c = () => $sel.get("rl_ent") || $sel.get("af_home") || $sel.get("wait_awhile");

                clickAction($sel.get("reload_fst_page"), "widget");
                clickAction($sel.pickup("打开", "node", "kw_confirm_launch_alipay"), "widget");
                dismissPermissionDialogsIfNeeded();

                // return condition_a() || condition_b() || condition_c();
                return condition_a() || condition_c();
            },
            condition_ready: () => {
                let conditions_necessary = {
                    af_title_or_login: () => $sel.get("af_title") || $app.kw_login_btn(),
                };
                let conditions_optional = {
                    kw_function_buttons: () => $sel.get("af_home"),
                    kw_list_more_friends_btn: () => $sel.get("rl_ent"),
                    kw_login_btn: $app.kw_login_btn,
                };
                let keys_nec = Object.keys(conditions_necessary);
                for (let i = 0, len = keys_nec.length; i < len; i += 1) {
                    let key_nec = keys_nec[i];
                    let condition = conditions_necessary[key_nec];
                    if ($$func(condition) && !condition() ||
                        $$comObj(condition) && !condition.exists()
                    ) return debugInfo(["启动必要条件不满足", ">" + key_nec]);
                }
                debugInfo("已满足全部启动必要条件");

                let keys_opt = Object.keys(conditions_optional);
                for (let i = 0, len = keys_opt.length; i < len; i += 1) {
                    let key_opt = keys_opt[i];
                    let condition = conditions_optional[key_opt];
                    if ($$func(condition) && condition() ||
                        $$comObj(condition) && condition.exists()
                    ) return debugInfo(["已满足启动可选条件", ">" + key_opt]) || true;
                }
                debugInfo("需至少满足一个启动可选条件");
            },
        }, params));
    }

    function launchAFHomepageByIntent(intent) {
        if (app.checkActivity(intent)) return launchAFHomepageWithTrigger(intent);
        debugInfo("Activity在设备系统中不存在", 3);
    }

    function launchAFHomepageByClickAFBtnAtHomepage() {
        if (!launchAlipayHomepage()) return;
        let kw_ant_forest_icon = type => $sel.pickup("蚂蚁森林", type);
        if (!waitForAction(kw_ant_forest_icon, 1500, 80)) return;
        return launchAFHomepageWithTrigger(() => clickAction(kw_ant_forest_icon()));
    }

    function launchAFHomepageBySearchKeyword(input_text) {
        if (!launchAlipayHomepage()) return;

        if (!waitForAndClickAction(idMatches(/.*home.title.search.button/), 5000, 80, {click_strategy: "widget"})) return;

        let node_input_box = null;
        if (!waitForAction(() => node_input_box = $sel.pickup(idMatches(/.*search.input.box/)), 5000, 80)) return;
        node_input_box.setText(input_text);
        waitForAction(() => $sel.pickup(input_text), 3000, 80); // just in case

        let node_af_search_item = null;
        let setAFSearchItemNode = () => node_af_search_item = $sel.pickup("蚂蚁森林");

        if (!clickAction(idMatches(/.*search.confirm/), "widget", {
            condition_success: setAFSearchItemNode,
            max_check_times: 10,
            check_time_once: 300,
        })) return;

        let max_try_times = 8;
        let bounds = node_af_search_item.bounds();
        let [ctx, cty] = [bounds.centerX(), bounds.centerY()];
        while (max_try_times--) {
            if (!node_af_search_item) continue;
            if (node_af_search_item.clickable()) break;
            node_af_search_item = node_af_search_item.parent();
        }
        return launchAFHomepageWithTrigger(() => {
            max_try_times < 0 ? clickAction([ctx, cty]) : clickAction(node_af_search_item, "widget");
        });
    }

    function launchRankListWithTrigger(trigger) {
        return launchThisApp(trigger, Object.assign({}, {
            task_name: "好友排行榜",
            package_name: $app.package_name,
            no_message_flag: true,
            condition_launch: () => true,
            condition_ready: () => {
                // TODO "intent_with_params" only so far
                let a1 = () => $sel.get("rl_title");
                let a2 = () => $sel.pickup($app.rex_energy_amt);
                let b = () => !$sel.pickup("查看更多好友") && $sel.pickup(/.*环保证书/);
                return a1() && a2() || b();
            },
            disturbance: () => {
                clickAction($sel.pickup("再试一次", "node", "kw_rank_list_try_again"));
                clickAction($sel.pickup("打开", "node", "kw_confirm_launch_alipay"));
            },
        }, params));
    }

    function launchRankListByIntent(intent) {
        if (app.checkActivity(intent)) return launchRankListWithTrigger(intent);
        debugInfo("Activity在设备系统中不存在", 3);
    }

    function launchRankListByClickListMoreBtn() {
        let rankListEnt = () => $sel.get("rl_ent");
        let {kw_rank_list} = $app;

        function locateListMoreFriBtn() {
            if (rankListEnt()) return true;
            let max_try_times = 8;
            while (max_try_times--) {
                if ($sel.get("alipay_home")) {
                    debugInfo(["检测到支付宝主页页面", "尝试进入蚂蚁森林主页"]);
                    launchAFHomepage();
                } else if (kw_rank_list()) {
                    debugInfo(["检测到好友排行榜页面", "尝试关闭当前页面"]);
                    $app.page.back();
                } else {
                    debugInfo(["未知页面", "尝试关闭当前页面"]);
                    keycode(4, "double");
                }
                if (waitForAction(rankListEnt, 1000)) return true;
            }
        }

        if (!locateListMoreFriBtn()) return messageAction("定位\"查看更多好友\"超时", 3, 1, 0, 1);
        debugInfo("定位到\"查看更多好友\"按钮");

        let trigger = () => {
            if (!clickAction(rankListEnt(), "widget") || !waitForAction(() => !rankListEnt(), 800)) {
                debugInfo("备份方案点击\"查看更多好友\"");
                swipeAndShow(rankListEnt(), {
                    swipe_time: 200,
                    check_interval: 100,
                    if_click: "click",
                });
            }
        };

        return launchRankListWithTrigger(trigger);
    }
}

function launchAlipayHomepage(params) {
    return launchThisApp($app.package_name, Object.assign({
        app_name: "支付宝",
        no_message_flag: true,
        condition_ready: () => {
            dismissPermissionDialogsIfNeeded();
            $app.page.back();
            return $sel.get("alipay_home");
        },
    }, params));
}

function launchUserList(forcible_flag) {
    let {isInSwitchAccPage} = $app;
    if (!forcible_flag && isInSwitchAccPage()) return true;

    debugInfo("打开\"账号切换\"页面");

    let plans = {
        launch_user_list_by_activity: () => {
            app.startActivity({
                action: "VIEW",
                className: "com.alipay.mobile.security.accountmanager.ui.AccountManagerActivity_",
                packageName: "com.eg.android.AlipayGphone",
            });
        },
        launch_user_list_by_pipeline: () => {
            launchAlipayHomepage({debug_info_flag: false});
            clickActionsPipeline([
                [["我的", "p1"], "widget"],
                [["设置", {clickable: true}], "widget"],
                [["换账号登录", null]],
            ]);
        },
    };
    let plan_keys = Object.keys(plans);
    for (let i = 0, len = plan_keys.length; i < len; i += 1) {
        let plan_name = plan_keys[i]; // maybe useful for debugInfo()
        let plan_func = plans[plan_name];
        try {
            plan_func();
            if (waitForAction(isInSwitchAccPage, 2000)) return debugInfo("计划" + surroundWith(plan_name) + "成功") || true;
        } catch (e) {

        }
        debugInfo("计划" + surroundWith(plan_name) + "失败", 3);
    }
    return messageAction("进入\"账号切换\"页面失败", 4, 1, 0, "both_dash");
}

function checkIfUserLoggedIn(user_name, forcible_flag) {
    if (!launchUserList(forcible_flag)) return;

    let is_main_user_name = user_name === accountNameConverter($acc.main.name, "decrypt");

    let {
        logged_in_user_abbr_name,
        is_logged_in,
        is_in_list,
    } = getCurrentLoggedInUserInfoFromUserList() || {};

    debugInfo("检查账号列表");

    let account_log_ident_str = (is_main_user_name ? "主" : "") + "账户";

    if (logged_in_user_abbr_name) {
        let is_main_user_logged_in = is_main_user_name && is_logged_in;
        if (!$app.init_logged_in_user_abbr_name) {
            $app.init_logged_in_user_abbr_name = logged_in_user_abbr_name;
            debugInfo("记录初始登录账户缩略名");
            $app.init_is_main_user_logged_in = is_main_user_logged_in;
        }
        if (is_logged_in) return debugInfo(account_log_ident_str + "已在登录状态") || true;
    } else {
        debugInfo("当前登录账户缩略名无效", 3);
    }

    debugInfo(account_log_ident_str + (is_in_list ? "在账号列表中但未登录" : "不在账号列表中"));

    // tool function(s) //

    function getCurrentLoggedInUserInfoFromUserList() {
        let kw_list_arrow = idMatches(/.*list_arrow/);
        waitForAction(kw_list_arrow, 2000); // just in case
        sleep(300);

        let current_logged_in_abbr_name = $sel.pickup([kw_list_arrow, "s-1c0c0"], "txt");
        let is_logged_in = checkAbbrName(user_name, current_logged_in_abbr_name);

        if (is_main_user_name && is_logged_in) $app.main_user_abbr_name = current_logged_in_abbr_name;

        return {
            logged_in_user_abbr_name: current_logged_in_abbr_name,
            is_logged_in: is_logged_in,
            is_in_list: checkIfUserInList(),
        };

        // tool function(s) //

        function checkAbbrName(full_name, abbr_name) {
            if (!full_name || !abbr_name) return false;

            full_name = full_name.toString();
            abbr_name = abbr_name.toString();

            let [i, j, k] = [0, full_name.length - 1, abbr_name.length - 1];
            let sameStr = (p, q) => full_name[p] === abbr_name[q];
            let abbrNotStar = q => abbr_name[q] !== "*";
            for (; i <= j; i += 1) {
                if (sameStr(i, i)) continue;
                if (abbrNotStar(i)) return false;
                break;
            }
            if (i > j) return true;
            for (; j > i, k > i; j -= 1, k -= 1) {
                if (sameStr(j, k)) continue;
                if (abbrNotStar(k)) return false;
                break;
            }
            return !!abbr_name.slice(i, k + 1).match(/^\*+$/);
        }

        function checkIfUserInList() {
            if (is_logged_in) return true;

            let kw_abbr_name_with_star_chars = /.+\*{3,}.+/;
            let sel_str = $sel.pickup(kw_abbr_name_with_star_chars, "sel_str");
            let abbr_names = [];
            selector()[sel_str + "Matches"](kw_abbr_name_with_star_chars).find().forEach(w => abbr_names.push(w[sel_str]()));
            if (!$$arr(abbr_names)) abbr_names = [abbr_names];

            for (let u = 0, len = abbr_names.length; u < len; u += 1) {
                let abbr_name = abbr_names[u].toString();
                if (checkAbbrName(user_name, abbr_name)) {
                    if (is_main_user_name) $app.main_user_abbr_name = abbr_name;
                    return true;
                }
            }
        }
    }
}

function clickAbbrNameInUserList(abbr_name) {
    let {
        main_user_abbr_name,
        isInLoginPage,
    } = $app;
    abbr_name = abbr_name || main_user_abbr_name;
    if (!abbr_name) return false;
    let clickAbbrUser = () => clickAction($sel.pickup([abbr_name, "p5"]), "widget");

    for (let i = 0; i < 3; i += 1) {
        debugInfo((i ? "再次尝试" : "") + "点击列表中的账户");
        clickAbbrUser();

        let conditions = {
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
                cond: $sel.get("close_btn"),
            }],
            fail: [{
                remark: "出现登录页面",
                cond: isInLoginPage,
            }],
            timeout_review: [{
                remark: "强制账号列表检查",
                cond: () => {
                    if (checkIfUserLoggedIn(abbr_name, "forcible")) return true;
                    messageAction("脚本无法继续", 4, 0, 0, "up");
                    messageAction("列表快捷切换账户超时", 9, 1, 1, 1);
                },
            }]
        };

        debugInfo("开始监测账户切换结果");
        let condition_check_result = conditionChecker(conditions);
        if (!condition_check_result) return false;
        if (checkIfUserLoggedIn(abbr_name)) return true;
    }
    messageAction("脚本无法继续", 4, 0, 0, "up");
    messageAction("列表快捷切换账户次数已达阈值", 9, 1, 1, 1);
}

function conditionChecker(c) {
    if (!$$obj(c)) return debugInfo(["条件检查器参数不合法", ">" + classof(c)]) && false;

    let {name, time, success, fail, wait, timeout_review} = c;
    debugInfo("开始" + (name || "") + "条件检查");

    name = name || "条件检查";
    time = time || 1;
    if (time < 100) time *= 60000;
    time += 5 * 60000;

    device.keepOn(time);
    let check_result = checker();
    device.cancelOn();
    return check_result;

    // tool function(s) //

    function checker() {
        while (time > 0) {
            if (meetCondition(success, "success")) return debugInfo(name + "成功") || true;
            if (meetCondition(fail, "fail")) return debugInfo(name + "失败", 3) && false;
            if (meetCondition(wait, "wait")) continue;
            sleep(500);
            time -= 500;
        }

        debugInfo("确定性条件检查已超时");
        if (!timeout_review) return debugInfo(name + "失败", 3) && false;

        debugInfo("开始检查超时复检条件");
        let timeout_review_result = meetCondition(timeout_review, "timeout_review");
        if (!timeout_review_result) return debugInfo(["超时复检失败", name + "失败"], 3) && false;
        return debugInfo(name + "成功") || true;

        // tool function(s) //

        function meetCondition(cond_arr, type) {
            if (!cond_arr) return;
            let type_map = {
                "success": "成功",
                "fail": "失败",
                "wait": "持续等待",
                "timeout_review": "超时复检成功",
            };
            for (let i = 0, len = cond_arr.length; i < len; i += 1) {
                let cond = cond_arr[i] || {};
                if (cond.cond && cond.cond()) {
                    debugInfo("满足" + (type_map[type] || "未知") + "条件");
                    cond.remark && debugInfo(">" + cond.remark);
                    if (type === "wait") {
                        while (cond.cond()) sleep(300);
                    }
                    if ($$func(cond.feedback)) {
                        debugInfo("检测到反馈方法");
                        cond.feedback();
                    }
                    return true;
                }
            }
        }
    }
}

/**
 * @appendix Code abbreviation dictionary
 * May be helpful for code readers and developers
 * Not all items showed up in this project
 * @abbr acc: account | accu: accumulated | af: ant forest | app: application | args: arguments | argv: argument values | avail: available | b: bottom; bounds | bak: backup | blist: blacklist | btn: button | cfg: configuration | cmd: command | cnsl: console | cnt: count | cond: condition | constr: constructor | ctd: countdown | ctx: context | cur: current | cwd: current working directory | cwp: current working path | d: dialog | def: default | desc: description | dev: device | diag: dialog | disp: display | du: duration | e: error; engine; event | ent: entrance | evt: event | excl: exclusive | exec: execution | ext: extension | fg: foreground | flg: flag | fri: friend | fs: functions | glob: global | ident: identification | idt: identification | idx: index | itv: interval | js: javascript | l: left | lmt: limit | ln: line | lsn: listen; listener | mod: module | msg: message | neg: negative | neu: neutral | num: number | o: object | opt: option | par: parameter | param: parameter | pkg: package | pos: position | pref: prefix | prv: privilege | que: queue | r: right | rect: rectangle | res: result | rl: rank list | rls: release | sav: save | scr: screen | sec: second | sel: selector | sgn: signal | src: source | stat: statistics | sto: storage | str: string | sw: switch | t: top | tmp: temporary | tpl: template | trig: trigger; triggered | ts: timestamp | tt: title | u: unit | util: utility | v: value | fst: forest | gns: get and set | intrpt: interrupt
 */