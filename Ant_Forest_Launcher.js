/**
 * @overview alipay ant forest energy intelligent collection script
 *
 * @last_modified Sep 24, 2019
 * @version 1.9.1
 * @author SuperMonster003
 *
 * @tutorial {@link https://github.com/SuperMonster003/Auto.js_Projects/tree/Ant_Forest}
 */

// window mostly for browser, global mostly for Node.js, and __global__ for Auto.js
__global__ = typeof __global__ === "undefined" ? this : __global__;

// given that there are bugs with dialogs modules in old auto.js versions like 4.1.0/5 and 4.1.1/2
// in another way, dialogs.builds() could make things easier sometimes
let dialogs = require("./Modules/__dialogs__pro_v6")(runtime, __global__);

// better compatibility for both free version and pro version
let timers = require("./Modules/__timers__pro_v37")(runtime, __global__);

// more functions offered by Stardust and some others by me
let app = require("./Modules/__app__pro_v41")(runtime, __global__);

let classof = o => Object.prototype.toString.call(o).slice(8, -1);

let {
    launchThisApp,
    killThisApp,
    restartThisEngine,
    runJsFile,
    clickAction,
    clickActionsPipeline,
    waitForAction,
    waitForAndClickAction,
    messageAction,
    showSplitLine,
    debugInfo,
    surroundWith,
    observeToastMessage,
    tryRequestScreenCapture,
    keycode,
    timeRecorder,
    getSelector,
    getVerName,
    getDisplayParams,
    setDeviceProto,
    vibrateDevice,
    phoneCallingState,
    refreshObjects,
    equalObjects,
    swipeInArea,
} = require("./Modules/MODULE_MONSTER_FUNC");

try {
    auto.waitFor();
} catch (e) {
    messageAction("auto.waitFor()不可用", 0, 0, 0, "up");
    auto();
}

let current_app = {};
let config = {};
let {storage_af, storage_af_cfg, unlock_module, sel, my_engine} = {};
let {WIDTH, HEIGHT, USABLE_HEIGHT, screen_orientation, cX, cY} = {};

checkModules();
checkTasksQueue();
showRunningCountdownIfNeeded();
setInsuranceTaskIfNeeded();
checkVersions();
checkEngines();
setVolKeysListener();
setGlobalWaitingMonitors();

antForest();

// entrance function //

function antForest() {
    let main = () => {
        prologue();
        monitorLoggedOut();
        launchAFHomepage();
        checkLanguage();
        loginMainUser();
        checkEnergy();
        logBackInIfNeeded();
        epilogue();
    };

    let {max_retry_times_global} = config;
    let max_retry_times_global_backup = max_retry_times_global;
    while (1) {
        try {
            return main();
        } catch (e) {
            let {message} = e;
            let throwErrorToMainThread = () => {
                ui.post(() => {
                    showSplitLine();
                    throw (e);
                }); // throw Error to main thread for an easy location and ignore max_retry_times_global param as needed
                sleep(2000); // to prevent continuous running of the remaining code
            };
            let current_retry_times = max_retry_times_global_backup - --max_retry_times_global;

            if (message) {
                if (message.match("ScriptInterruptedException")) return sleep(2000); // exit signal
                if (message.match(/RuntimeException|IllegalArgument|FORCE_STOP/)) throwErrorToMainThread();
                else if (max_retry_times_global >= 0) messageAction(message, 4, 1, 0, "both_dash");
            }

            if (max_retry_times_global >= 0) {
                messageAction("任务失败重试 (" + current_retry_times + "\/" + max_retry_times_global_backup + ")", 1, 0, 0, "both");
                killThisApp("com.eg.android.AlipayGphone");
            } else throwErrorToMainThread();
        }
    }
}

// main function(s) //

function prologue() {
    let init_operation_logged = null;

    debugInfo("准备初始化");
    unlock();
    setScreenPixelData();
    setSelectorProto();
    setDeviceProto();
    setParams();
    debugInfo("初始化完毕");

    if (init_operation_logged) showSplitLine();

    // tool function(s) //

    function setSelectorProto() {
        // for not missing debugInfo() inside
        sel = getSelector();
    }

    function setParams() {
        files.createWithDirs(current_app.local_pics_path = files.getSdcardPath() + "/.local/Pics/");

        images.getName = (img) => {
            let img_str = img.toString().split("@")[1];
            return img_str ? "@" + img_str.match(/\w+/)[0] : "(已提前回收)";
        };
        images.isRecycled = (img) => {
            if (!img) return true;
            try {
                img.getHeight();
                return false;
            } catch (e) {
                return !!e.message.match(/has been recycled/);
            }
        };
        images.reclaim = function () {
            for (let i = 0, len = arguments.length; i < len; i += 1) {
                let img = arguments[i];
                if (!img) continue;
                img.recycle();
                img = null;
            }
        };
        images.captureCurrentScreen = () => {
            let max_try_times = 10;
            while (max_try_times--) {
                try {
                    tryRequestScreenCapture();
                    let img = captureScreen();
                    let img_copy = images.copy(img);
                    images.reclaim(img);
                    return img_copy;
                } catch (e) {
                    sleep(240);
                }
            }
            messageAction("截取当前屏幕失败", 9, 1, 0, 1);
        };

        let main_account_info = config.main_account_info || {};

        current_app = Object.assign({}, current_app, new App("蚂蚁森林"));
        current_app.first_time_run = true;
        current_app.init_screen_on_state = typeof my_engine.execArgv.init_screen_on_state === "undefined"
            ? __global__.is_init_screen_on
            : my_engine.execArgv.init_screen_on_state;
        current_app.init_running_app_package = typeof my_engine.execArgv.init_running_app_package === "undefined"
            ? currentPackage()
            : my_engine.execArgv.init_running_app_package;
        current_app.kw_alipay_homepage = type => sel.pickup([/首页|Homepage/, {
            boundsInside: [0, cY(0.7, 16 / 9), WIDTH, HEIGHT],
        }], "kw_alipay_homepage", type);
        current_app.kw_af_title = type => sel.pickup([/蚂蚁森林|Ant Forest/, {
            boundsInside: [0, 0, cX(0.8), cY(0.2, 16 / 9)],
        }], "kw_af_title", type);
        current_app.kw_af_home = type => sel.pickup(/合种|背包|通知|攻略|任务|我的大树养成记录/, "kw_af_home", type);
        current_app.kw_list_more_friends = type => sel.pickup("查看更多好友", "kw_list_more_friends", type);
        current_app.kw_rank_list_title = type => sel.pickup(/好友排行榜|Green heroes/, "kw_rank_list_title", type);
        current_app.kw_end_list_ident = type => sel.pickup(/.*没有更多了.*/, "kw_end_list_ident", type);
        current_app.kw_wait_for_awhile = type => sel.pickup(/.*稍等片刻.*/, "kw_wait_for_awhile", type);
        current_app.kw_reload_forest_page_btn = type => sel.pickup("重新加载", "kw_reload_forest_page_btn", type);
        current_app.kw_close_btn = type => sel.pickup(/关闭|Close/, "kw_close_btn", type);
        current_app.kw_back_btn = type => sel.pickup(["返回", "c0"], null, type) || sel.pickup("返回", null, type);
        current_app.kw_rank_list = () => {
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
                    if (i === 0) return (current_app.kw_rank_list = () => idMatches(/.*J_rank_list_append/))();
                    if (i === 1) return (current_app.kw_rank_list = () => idMatches(/.*J_rank_list/))();
                }
            }
            return ref.sort((a, b) => b[1] - a[1])[0][0];
        };
        current_app.kw_rank_list_more = type => sel.pickup(idMatches(/.*J_rank_list_more/), "kw_rank_list_more", type);
        current_app.kw_rank_list_self = type => sel.pickup(idMatches(/.*J_rank_list_self/), "kw_rank_list_self", type);
        current_app.kw_login_btn = type => sel.pickup(/登录|Log in|.*loginButton/, "kw_login_btn", type);
        current_app.kw_login_by_code_btn = type => sel.pickup(/密码登录|Log ?in with password/, "kw_login_by_code_btn", type);
        current_app.kw_login_with_other_user = type => sel.pickup(/换个账号登录|.*switchAccount/, "kw_login_with_other_user", type);
        current_app.kw_login_with_other_method = type => {
            let memory_keyword = "kw_login_with_other_method";
            return sel.pickup(/换个方式登录|Switch login method|.*switchLoginMethod/, memory_keyword, type);
        };
        current_app.kw_login_with_other_method_in_init_page = type => {
            let memory_keyword = "kw_login_with_other_method_in_init_page";
            return sel.pickup(/其他登录方式|Other accounts/, memory_keyword, type);
        };
        current_app.kw_login_next_step_btn = type => sel.pickup(/下一步|Next|.*nextButton/, "kw_login_next_step_btn", type);
        current_app.kw_login_error_ensure_btn = type => sel.pickup(idMatches(/.*ensure/), "kw_login_error_ensure_btn", type);
        current_app.kw_input_label_account = type => sel.pickup(/账号|Account/, "kw_input_label_account", type);
        current_app.kw_input_label_code = type => sel.pickup(/密码|Password/, "kw_input_label_code", type);
        current_app.kw_user_logged_out = type => {
            let regexp_logged_out = new RegExp(".*(" +
                /在其他设备登录|logged +in +on +another/.source + "|" +
                /.*账号于.*通过.*登录.*|account +logged +on +to/.source +
                ").*");
            sel.pickup(regexp_logged_out, "kw_user_logged_out", type);
        };
        current_app.kw_login_with_new_user = type => sel.pickup(/换个新账号登录|[Aa]dd [Aa]ccount/, "kw_login_with_new_user", type);
        current_app.kw_switch_account_title = type => sel.pickup(/账号切换|Accounts/, "kw_switch_account_title", type);
        current_app.getLoginErrorMsg = () => {
            return sel.pickup(id("com.alipay.mobile.antui:id/message"), "alipay_antui_msg", "txt")
                || sel.pickup([current_app.kw_login_error_ensure_btn(), "p2c0c0c0"], "", "txt");
        };
        current_app.isInLoginPage = () => {
            return current_app.kw_login_with_other_user()
                || current_app.kw_input_label_account()
                || current_app.kw_login_with_other_method_in_init_page();
        };
        current_app.isInSwitchAccPage = () => current_app.kw_login_with_new_user() || current_app.kw_switch_account_title();
        current_app.user_account_name = main_account_info.account_name;
        current_app.user_account_code = main_account_info.account_code;
        current_app.logged_blacklist_names = [];
        current_app.homepage_intent = {
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
        current_app.rank_list_intent = {
            action: "VIEW",
            data: encodeURIParams("alipays://platformapi/startapp", {
                saId: 20000067,
                url: "https://60000002.h5app.alipay.com/www/listRank.html",
                __webview_options__: {
                    startMultApp: "YES",
                    showOptionMenu: "YES",
                    appClearTop: "NO",
                    enableScrollBar: "NO",
                    defaultTitle: "",
                    transparentTitle: "none",
                },
            }),
        };
        current_app.rank_list_icon_collect = storage_af.get("af_rank_list_icon_collect");
        current_app.rank_list_icon_help = storage_af.get("af_rank_list_icon_help");
        current_app.rank_list_bottom_template_path = config.rank_list_bottom_template_path;
        current_app.rank_list_bottom_template = images.read(current_app.rank_list_bottom_template_path);
        current_app.current_file_path = files.path("./Ant_Forest_Launcher.js");
        current_app.total_energy_collect_own = 0;
        current_app.total_energy_collect_friends = 0;
        current_app.rank_list_friend_max_invalid_drop_by_times = 5;
        current_app.rank_list_capt_pool_diff_check_counter = 0;
        current_app.kill_when_done_intelligent_kill = config.kill_when_done_intelligent
            && (current_app.init_running_app_package !== current_app.package_name);
        current_app.friend_drop_by_counter = {
            get increase() {
                return (name) => {
                    __global__[name] = __global__[name] || 0;
                    if (__global__[name] >= current_app.rank_list_friend_max_invalid_drop_by_times) {
                        debugInfo("发送停止排行榜样本停止复查信号");
                        return current_app.rank_list_review_stop_signal = true;
                    }
                    if (!__global__[name]) __global__[name] = 1;
                    else __global__[name] += 1;
                };
            },
            get decrease() {
                return (name) => {
                    __global__[name] = __global__[name] || 0;
                    if (__global__[name] > 1) __global__[name] -= 1;
                    else __global__[name] = 0;
                };
            },
        };
        current_app.isAutojsLogPage = () => checkAutojsTitle(/日志|Log/, "kw_autojs_log_page_title");
        current_app.isAutojsSettingsPage = () => checkAutojsTitle(/设置|Settings?/, "kw_autojs_settings_page_title");
        current_app.isAutojsHomepage = () => sel.pickup(idMatches(/.*action_(log|search)/), "", "exists");
        current_app.isAutojsForeground = () => sel.pickup(["Navigate up", {className: "ImageButton"}], "kw_autojs_back_btn")
            || current_app.isAutojsHomepage() || current_app.isAutojsLogPage()
            || current_app.isAutojsSettingsPage() || sel.pickup(idMatches(/.*md_\w+/));
        current_app.init_autojs_state = {
            init_foreground: current_app.isAutojsForeground(),
            init_homepage: current_app.isAutojsHomepage(),
            init_log_page: current_app.isAutojsLogPage(),
            init_settings_page: current_app.isAutojsSettingsPage(),
        };

        debugInfo("会话参数赋值完毕");
        debugInfo(["初始前置应用包名:", current_app.init_running_app_package]);

        checkAlipayVer();
        setMaxRunTime();

        // constructor //

        function App(name) {
            this.name = name;
            this.quote_name = surroundWith(name);
            this.package_name = getAlipayPkgName();
            this.blacklist = handleFirstTimeRunBlacklist();

            // tool function(s) //

            function getAlipayPkgName() {
                let default_pkg = "com.eg.android.AlipayGphone";

                if (app.getAppName(default_pkg)) return default_pkg;

                let result;
                let pkg_samples = ["Alipay", "支付宝", "支付寶"];
                let joined_pkg_name = "\"" + pkg_samples.join("\/") + "\"";

                for (let i = 0, len = pkg_samples.length; i < len; i += 1) {
                    if ((result = app.getPackageName(pkg_samples[i]))) {
                        messageAction("已获取新的" + joined_pkg_name + "包名", 3, 1);
                        messageAction(result, 3, 0, 1);
                        init_operation_logged = 1;
                        return result;
                    }
                }
                return messageAction("此设备未安装\"" + pkg_samples.join("\/") + "\"软件", 9, 1);
            }

            function handleFirstTimeRunBlacklist() {
                let blacklist_title_flag = 0;
                let blacklist = storage_af.get("blacklist", {}); // {friend_name: {timestamp::, reason::}}
                Object.keys(blacklist).forEach(name => {
                    if (!checkBlackTimestamp(blacklist[name].timestamp)) {
                        delete blacklist[name];
                        blacklistTitle(name);
                    }
                });
                blacklist_title_flag && showSplitLine();
                return blacklist;

                // tool function(s) //

                function blacklistTitle(name) {
                    if (!config.console_log_details && !config.debug_info_switch) return;

                    if (!blacklist_title_flag) {
                        init_operation_logged && showSplitLine();
                        messageAction("已从黑名单中移除:", 1);
                        blacklist_title_flag = 1;
                    }
                    messageAction(name, 1, 0, 1);
                }
            }
        }

        // tool function(s) //

        function checkAlipayVer() {
            let bug_vers = ["i have been free so far"];
            let alipay_ver = getVerName(current_app.package_name);
            debugInfo("支付宝版本: " + alipay_ver);
            if (~bug_vers.indexOf(alipay_ver)) {
                messageAction("脚本无法继续", 4, 0, 0, "up");
                messageAction("当前支付宝版本存在已知问题", 4);
                messageAction("请更换支付宝版本", 9, 1, 1, 1);
            }
        }

        function setMaxRunTime() {
            let max = config.max_running_time_global;

            if (!max || !+max) return;

            threads.start(function () {
                setTimeout(function () {
                    ui.post(() => messageAction("超时强制退出", 9, 1, 0, "both_n"));
                }, +max * 60000 + 3000);
            });
            debugInfo("单次运行最大超时设置完毕");
        }

        function checkAutojsTitle(regexp, memory_keyword) {
            sel.pickup([regexp, {
                className: "TextView",
                boundsInside: [cX(0.12), cY(0.03, 16 / 9), cX(0.5), cY(0.12, 16 / 9)],
            }], memory_keyword, "exists")
        }
    }
}

function monitorLoggedOut() {
    let {need_login_first} = my_engine.execArgv;
    if (need_login_first) {
        debugInfo("检测到\"预先登录\"引擎参数");
        loginMainUser("direct_login");
    }
    debugInfo("已开启账户登出监测线程");
    threads.start(function () {
        current_app.account_logged_out = false;
        let is_logged_out = false;
        let is_in_login_page = false;
        let {kw_user_logged_out, isInLoginPage} = current_app;
        let loggedOut = () => is_logged_out = kw_user_logged_out();
        let inLoginPage = () => is_in_login_page = isInLoginPage();

        while (!loggedOut() && !inLoginPage()) sleep(500);

        current_app.account_logged_out = true;
        messageAction("检测到账户登出状态", 1, 0, 0, "up");
        messageAction(is_logged_out ? "账户在其他地方登录" : "需要登录账户", 1);

        if (!config.account_switch) {
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
            init_screen_on_state: current_app.init_screen_on_state,
            init_running_app_package: current_app.init_running_app_package,
        })) {
            messageAction("脚本无法继续", 4, 0, 0, "up");
            messageAction("无法登录主账户", 9, 1, 1, 1);
        }
    });
}

function launchAFHomepage(params) {
    params = params || {};
    if (current_app.first_time_run) {
        messageAction("开始" + current_app.quote_name + "任务", 1, 1, 0, "both");
        current_app.first_time_run = false;
        Object.assign(params, {screen_orientation: 0});
    }
    if (config.app_launch_springboard === "ON") {
        debugInfo("使用启动跳板");
        let {current_autojs_package, current_autojs_app_name} = current_app;
        launchThisApp(current_autojs_package, {
            app_name: current_autojs_app_name,
            debug_info_flag: false,
            no_message_flag: true,
            first_time_run_message_flag: false,
            condition_ready: current_app.isAutojsForeground,
        }) ? debugInfo("跳板启动成功") : debugInfo(["跳板启动失败", ">打开" + current_autojs_app_name + "应用超时"], 3);
    }
    let launch_result = plans("launch_af_homepage", Object.assign({}, {exclude: "_test_"}, params));
    if (screen_orientation !== 0) setScreenPixelData("refresh");
    return launch_result;
}

function launchRankList(params) {
    return plans("launch_rank_list", Object.assign({}, {exclude: "_test_"}, params || {}));
}

function checkLanguage() {
    let title_str = "";
    if (!waitForAction(() => title_str = current_app.kw_af_title("txt"), 10000, 100)) {
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
            [["简体中文", "p4"], () => sel.pickup(["简体中文", "p3"], "", "children").length > 1],
            ["Save"],
        ], {
            name: "切换简体中文语言",
            default_strategy: "widget",
        });

        // tool function(s) //

        function getReady() {
            let max_try_times_close_btn = 10;
            while (max_try_times_close_btn--) {
                if (clickAction(current_app.kw_close_btn())) break;
                sleep(500);
            }
            let kw_homepage = className("TextView").idContains("tab_description");
            if (waitForAction(kw_homepage, 2000)) return true;
            let max_try_times = 5;
            while (max_try_times--) {
                let {package_name} = current_app;
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

function dismissPermissionDialogsIfNeeded() {
    let kw_need_to_dismiss = type => sel.pickup(idMatches(/.*btn_confirm/), "kw_need_to_dismiss_of_permission", type);
    let kw_allow_btn = type => sel.pickup(/[Aa][Ll]{2}[Oo][Ww]|允许/, "kw_allow_btn", type);

    let max_try_times = 10;
    let condition = () => kw_need_to_dismiss() || kw_allow_btn();
    while (condition() && max_try_times--) {
        clickAction(condition(), "widget");
        sleep(500);
    }
}

function loginMainUser(direct_login_flag) {
    if (!config.account_switch) return debugInfo("主账户功能未开启");

    let {user_account_name} = current_app;
    if (!user_account_name) return debugInfo("主账户用户名未设置");
    let _acc = accountNameConverter(user_account_name, "decrypt");

    if (direct_login_flag) return loginMainUserNow();

    let avatar_local_path = current_app.local_pics_path + "main_user_mini_avatar_clip.png";
    let avatar_local_img = images.read(avatar_local_path);

    timeRecorder("avatar_check");
    let avatar_check_result = checkAvatar(avatar_local_img);
    current_app.avatar_checked_time = timeRecorder("avatar_check", "load");

    if (avatar_check_result) {
        debugInfo(["当前账户符合主账户身份", ">本地主账户头像匹配成功"]);
        current_app.init_is_main_user_logged_in = true;
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
        return avatar_clip;

        // tool function(s) //

        function getAvatarPosition(specified_type) {
            let sel = getSelector({debug_info_flag: false});
            let o = {
                kw_my_tree_plant_plan: type => sel.pickup("我的大树养成记录", "", type),
                kw_user_energy: type => sel.pickup([idMatches(/.*user.+nergy/), "p2c0"], "", type),
                kw_plant_tree_btn: type => sel.pickup(["种树", {
                    className: "Button"
                }, "p1c0"], "", type),
                kw_home_panel: type => sel.pickup([idMatches(/.*home.*panel/), "c0c0c0"], "", type),
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
        return true;
    }

    function loginMainUserNow() {
        let {
            user_account_code,
            kw_alipay_homepage,
            kw_close_btn,
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
        } = current_app;

        return clickAbbrNameInUserList() || inputUsernameAndCode();

        // tool function(s) //

        function inputUsernameAndCode() {
            if (!waitForAction(() => {
                if (kw_user_logged_out()) clickAction(sel.pickup(/好的|OK/), "widget");
                return isInLoginPage() || isInSwitchAccPage();
            }, 3000)) return messageAction("无法判断当前登录页面状态", 4, 1, 0, "both_dash");

            if (!isInLoginPage()) {
                if (!clickAction(sel.pickup([current_app.kw_login_with_new_user(), "p4"]), "widget")) {
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

                let inputExists = () => sel.pickup(_acc);
                let condition_a = () => waitForAction(inputExists, 1000);
                let condition_b = () => !waitForAction(() => !inputExists(), 500, 100);
                let condition_ok = () => condition_a() && condition_b();

                let max_try_input_account = 3;
                while (max_try_input_account--) {
                    if (kw_input_label_account()) {
                        debugInfo("找到\"账号\"输入项控件");
                        let input_node = sel.pickup([kw_input_label_account(), "p2c1"]);
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

                clickAction(sel.pickup([kw_login_next_step_btn(), "p1"]), "widget", {
                    max_check_times: 3,
                    check_time_once: 500,
                    condition_success: () => !kw_login_next_step_btn(),
                });

                let kw_incorrect_code_try_again = type => sel.pickup(/重新输入|Try again/, "kw_incorrect_code_try_again", type);
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
                            clickAction(sel.pickup([kw_login_by_code_btn(), "p1"]), "widget");
                        }
                    }
                }

                return messageAction("查找\"密码\"输入项控件超时", 4, 1, 0, "both_dash");
            }

            function inputUserCode() {
                debugInfo("尝试完成密码输入");
                return user_account_code ? inputAutomatically() : inputManually();

                // tool function(s) //

                function inputManually() {
                    debugInfo("需要手动输入密码");
                    vibrateDevice(0, 0.1, 0.3, 0.1, 0.3, 0.2);

                    let timeout_user_response = 2; // min
                    let timeout_login_btn_dismissed = 2; // min
                    let result = false;

                    let max_check_time = ~~(timeout_user_response + timeout_login_btn_dismissed) * 60000;
                    __global__.pause_screen_off_state_monitor = true;
                    device.keepOn(max_check_time);

                    threads.start(function () {
                        let diag = dialogs.builds(["需要密码", "login_password_needed", 0, 0, "确定", 1]);
                        diag.on("positive", () => diag.dismiss()).show();

                        threads.start(function () {
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
                                    return sel.pickup(/.*confirmSetting|.*mainTip|.*登录中.*|.*message/)
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
                    delete __global__.pause_screen_off_state_monitor;
                    device.cancelOn();

                    return true;
                }

                function inputAutomatically() {
                    debugInfo("尝试自动输入密码");

                    let decrypt = new (require("./Modules/MODULE_PWMAP"))().pwmapDecrypt;
                    if (sel.pickup([kw_input_label_code(), "p2c1"]).setText(decrypt(user_account_code))) {
                        debugInfo("布局树查找可编辑\"密码\"控件成功");
                    } else {
                        debugInfo("布局树查找可编辑\"密码\"控件失败", 3);
                        debugInfo("尝试使用通用可编辑控件", 3);
                        let edit_text_node = className("EditText").findOnce();
                        let input_result = edit_text_node && edit_text_node.setText(decrypt(user_account_code));
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
                        cond: () => sel.pickup(/.*登录中.*/),
                    }],
                    success: [{
                        remark: "支付宝首页",
                        cond: kw_alipay_homepage,
                    }, {
                        remark: "H5关闭按钮",
                        cond: kw_close_btn,
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
                        cond: () => sel.pickup(/.*confirmSetting|.*mainTip/),
                        feedback: () => {
                            device.cancelOn();
                            messageAction("脚本无法继续", 4, 0, 0, "up");
                            messageAction("登录失败", 4, 1, 1);
                            messageAction("失败提示信息:" + sel.pickup(/.*mainTip/, "", "txt"), 9, 0, 1, 1);
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

function checkEnergy() {
    let list_end_signal = 0;
    let kw_energy_balls = (balls_kind, type) => {
        balls_kind = balls_kind || "all";
        type = type || "nodes";
        let regexp_type = {
            "normal": /\xa0/,
            "ripe": /收集能量\d+克/,
        };
        regexp_type.all = current_app.combined_kw_energy_balls_regexp || (() => {
            let combined_regexp_str = "";
            Object.keys(regexp_type).forEach(key => combined_regexp_str += regexp_type[key].source + "|");
            return current_app.combined_kw_energy_balls_regexp = new RegExp(combined_regexp_str.replace(/\|$/, ""));
        })();

        return sel.pickup([regexp_type[balls_kind], {className: "Button"}], "kw_energy_balls_" + balls_kind, type);
    };

    checkOwnEnergy();
    checkFriendsEnergy();
    setTimers();

    // main function(s) //

    function checkOwnEnergy() {
        if (!config.self_collect_switch) return debugInfo(["跳过自己能量检查", "自收功能未开启"]);

        debugInfo("开始检查自己能量");

        current_app.total_energy_init = getOwnEnergyAmount("buffer");
        let total_init_data = current_app.total_energy_init;
        debugInfo("初始能量: " + total_init_data + "g");

        waitForAction([current_app.kw_list_more_friends, current_app.kw_af_home, "or"], 12000)
            ? debugInfo("蚂蚁森林主页准备完毕")
            : debugInfo("蚂蚁森林主页准备超时", 3);

        let {max_own_forest_balls_ready_time} = config;
        debugInfo(["查找主页能量球控件", ">最大时间参数: " + max_own_forest_balls_ready_time + "ms"]);

        let {avatar_checked_time} = current_app;
        if (avatar_checked_time) {
            let final_minified_time = Math.max(150, max_own_forest_balls_ready_time - avatar_checked_time);
            max_own_forest_balls_ready_time = final_minified_time;
            debugInfo(["查找时间值削减至: " + final_minified_time + "ms", ">主账户检测耗时抵充"]);
            delete current_app.avatar_checked_time;
        }

        let homepage_balls_len = 0;
        if (waitForAction(() => homepage_balls_len = kw_energy_balls().length, max_own_forest_balls_ready_time, 50)) {
            debugInfo("找到主页能量球: " + homepage_balls_len + "个");
            checkEnergyBalls();
        } else debugInfo("指定时间内未发现主页能量球");

        let total_collect_data = current_app.total_energy_collect_own;
        total_collect_data ? debugInfo("共计收取: " + total_collect_data + "g") : debugInfo("无能量球可收取");

        debugInfo("自己能量检查完毕");

        // tool function(s) //

        function checkEnergyBalls() {
            checkRipeBalls();

            let condition_a = config.homepage_background_monitor_switch;
            let condition_b1 = config.timers_switch;
            let condition_b2a = config.homepage_monitor_switch;
            let condition_b2b = config.timers_self_manage_switch && config.timers_countdown_check_own_switch;

            if (condition_a || condition_b1 && (condition_b2a || condition_b2b)) {
                while (getMinCountdownOwn()) checkRemain();
            }

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
                        clickAction(w.bounds(), "press", {press_time: config.energy_balls_click_interval});
                    });
                    if (waitForAction(() => getRipeBallsSize() === 0, 2000, 100)) break;
                }
                if (max_try_times < 0) return;

                current_app.total_energy_collect_own += stabilizer(getOwnEnergyAmount, total_init_data) - total_init_data;
                total_init_data += current_app.total_energy_collect_own;
                return true;
            }

            function getMinCountdownOwn() {
                debugInfo("开始检测自己能量球最小倒计时");

                let raw_balls = kw_energy_balls("normal");
                let raw_balls_len = raw_balls.length;
                debugInfo("找到自己未成熟能量球: " + raw_balls_len + "个");
                if (!raw_balls_len) {
                    current_app.min_countdown_own = Infinity;
                    return debugInfo("自己能量球最小倒计时检测完毕");
                } // no countdown, no need to checkRemain

                let now = new Date();
                let min_countdown_own = Math.min.apply(null, getCountdownData());
                let ripe_time = new Date(min_countdown_own);
                let padZero = num => ("0" + num).slice(-2);
                let hh = +padZero(ripe_time.getHours() - now.getHours());
                let mm = +padZero(ripe_time.getMinutes() - now.getMinutes());
                let remain_minute = hh * 60 + mm;

                debugInfo("自己能量最小倒计时: " + remain_minute + "min");
                current_app.min_countdown_own = min_countdown_own; // ripe timestamp
                debugInfo("时间数据: " + getNextTimeStr(min_countdown_own));

                debugInfo("自己能量球最小倒计时检测完毕");

                return config.homepage_monitor_switch && remain_minute <= config.homepage_monitor_threshold; // if needs to checkRemain

                // tool function(s) //

                function getCountdownData() {
                    let countdown_data = [];

                    let thread_get_countdown_data = threads.start(function () {
                        raw_balls.forEach((node) => {
                            let max_try_times = 3;
                            while (max_try_times--) {
                                clickAction(node, "press");
                                let data = observeToastMessage(current_app.package_name, /才能收取/, 300); // results array, maybe []
                                if (data.length) return countdown_data = countdown_data.concat(data);
                            }
                        });
                    });
                    thread_get_countdown_data.join(6000);
                    if (thread_get_countdown_data.isAlive()) {
                        thread_get_countdown_data.interrupt();
                        messageAction("获取自己能量倒计时超时", 3);
                        messageAction("最小倒计时数据可能不准确", 3, 0, 1, 1);
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
                let max_check_time = config.homepage_monitor_threshold * 60000 + 3000; // ms
                let old_collect_own = current_app.total_energy_collect_own;
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
                debugInfo("本次监测收取结果: " + (current_app.total_energy_collect_own - old_collect_own) + "g");
                device.cancelOn();
                debugInfo("监测用时: " + timeRecorder("homepage_monitor", "load", 1000, [1], "秒"));
            }
        }

        function getOwnEnergyAmount(buffer_flag) {
            let regexp_energy_amount = /\d+g/;
            if (buffer_flag) {
                let condition = () => sel.pickup(regexp_energy_amount) && current_app.kw_af_home();
                if (!waitForAction(condition, 8000)) {
                    debugInfo("尝试刷新总能量值参考控件");
                    refreshObjects();
                    if (!condition()) {
                        debugInfo("刷新无效");
                        return -1;
                    }
                    debugInfo("刷新成功");
                }
            }
            let max_try_times = buffer_flag ? 10 : 1;
            while (max_try_times--) {
                let amount = +sel.pickup([regexp_energy_amount, {
                    boundsInside: [cX(0.6), cY(0.1, 16 / 9), WIDTH - 2, cY(0.3, 16 / 9)],
                }], "", "txt").match(/\d+/);
                if (!isNaN(amount)) return amount;
                sleep(200);
            }
            if (max_try_times < 0) return -1;
        }
    }

    function checkFriendsEnergy(review_flag) {
        closeH5PageIfNeeded();
        list_end_signal = 0;

        delete current_app.valid_rank_list_icon_clicked;
        delete current_app.swipe_by_scroll_down_flag;
        delete current_app.min_countdown_friends;
        delete current_app.help_without_section_flag;

        let blacklist_ident_captures = setBlacklistIdentCapturesProto();
        blacklist_ident_captures.splice(0, blacklist_ident_captures.length);

        let kw_dynamic_list_info = type => sel.pickup(/来浇过水.+|(帮忙)?收取\d+g/, "kw_dynamic_list_info", type);

        let {help_collect_switch, friend_collect_switch} = config;
        if (!friend_collect_switch) {
            if (!help_collect_switch) return debugInfo(["跳过好友能量检查", ">收取功能与帮收功能均已关闭"]);
            if (!checkHelpSection()) return debugInfo(["跳过好友能量检查", ">收取功能已关闭", ">且当前时间不在帮收有效时段内"])
        }

        debugInfo("开始" + (review_flag ? "复查" : "检查") + "好友能量");

        if (!rankListReady(review_flag)) return;

        let help_balls_coords = {};
        let init_balls_len = 0;
        let strategy = config.rank_list_samples_collect_strategy;
        let thread_energy_balls_monitor = undefined;
        let thread_list_end = threads.start(monitorEndOfListByUiObjThread);

        debugInfo("排行榜样本采集策略: " + {image: "图像识别", layout: "布局分析"}[strategy]);

        let max_safe_swipe_times = 1200; // just for avoiding infinite loop
        while (max_safe_swipe_times--) {
            current_app.current_friend = {};
            let targets = getCurrentScreenTargets(strategy); // [targets_green[], targets_orange[]]
            let pop_item_0, pop_item_1, pop_item;

            while ((pop_item = (pop_item_0 = targets[0].pop()) || (pop_item_1 = targets[1].pop()))) {
                init_balls_len = 0;
                delete current_app.rank_list_icon_clicked;

                let pop_name = pop_item.name;
                current_app.current_friend.name = pop_name;
                current_app.current_friend.console_logged = 0;
                current_app.current_friend.name_logged = 0;
                let name_title = pop_name; // maybe undefined
                let message_switch_on = config.console_log_details || config.debug_info_switch;
                if (message_switch_on && name_title && !current_app.current_friend.name_logged) {
                    messageAction(name_title, "title");
                    current_app.current_friend.name_logged = 1;
                }

                let clickRankListItemFunc = () => {
                    if (strategy === "image") clickAction([cX(0.5), pop_item.list_item_click_y], "press");
                    else if (strategy === "layout") clickAction(sel.pickup(pop_name), "click");

                    if (current_app.current_friend.six_balls_review_flag) debugInfo("复查当前好友", "both");
                    else debugInfo("点击" + (pop_item_0 && "收取目标" || pop_item_1 && "帮收目标"));

                    current_app.rank_list_icon_clicked = true;
                };

                while (1) {
                    if (inBlackList(clickRankListItemFunc)) break;

                    forestPageGetReady() && collectBalls();
                    backToHeroList();

                    let {console_logged, six_balls_review_flag} = current_app.current_friend;
                    if (!six_balls_review_flag) {
                        if (message_switch_on) {
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

        checkOwnCountdownDemand(config.homepage_monitor_threshold);

        return list_end_signal;

        // tool function(s) //

        function closeH5PageIfNeeded() {
            let condition = () => current_app.kw_af_title() || current_app.kw_rank_list_title();
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

        function setBlacklistIdentCapturesProto() {
            if (current_app.blacklist_ident_captures) return current_app.blacklist_ident_captures;
            let blacklist_ident_captures = [];
            blacklist_ident_captures.__proto__.add = function (capture, max_length) {
                max_length = max_length || 3;
                if (blacklist_ident_captures.length >= max_length) {
                    debugInfo("黑名单采集样本已达阈值: " + max_length);
                    let last_capt = blacklist_ident_captures.pop();
                    debugInfo(">移除并回收最旧样本: " + images.getName(last_capt));
                    images.reclaim(last_capt);
                }
                blacklist_ident_captures.unshift(capture);
                debugInfo("添加黑名单采集样本: " + images.getName(capture));
            };
            blacklist_ident_captures.__proto__.clear = function () {
                if (!blacklist_ident_captures.length) return;
                debugInfo("回收全部黑名单采集样本");
                blacklist_ident_captures.forEach(capt => {
                    capt.recycle();
                    debugInfo(">已回收: " + images.getName(capt));
                    capt = null;
                });
                blacklist_ident_captures.splice(0, blacklist_ident_captures.length);
                debugInfo("黑名单采集样本已清空");
            };
            return current_app.blacklist_ident_captures = blacklist_ident_captures;
        }

        function rankListReady(review_flag) {
            if (!launchRankList({review_flag: review_flag})) return;

            tryRequestScreenCapture();

            getRankListRefMaterials();

            getCurrentUserNickname();

            if (!(current_app.thread_expand_hero_list && current_app.thread_expand_hero_list.isAlive())) {
                current_app.thread_expand_hero_list = threads.start(expandHeroListThread);
            }

            return true;

            // tool function(s) //

            function getRankListRefMaterials() {
                current_app.rank_list_capt_img = images.captureCurrentScreen();
                debugInfo("生成排行榜截图: " + images.getName(current_app.rank_list_capt_img));
                sleep(100);

                let key_node = null;
                waitForAction(() => key_node = current_app.kw_rank_list_title(), 2500, 80); // just in case

                getCloseBtnCenterCoord();

                if (!key_node) return debugInfo("排行榜标题控件抓取失败", 3);
                let bounds = key_node.bounds();
                debugInfo("采集并存储排行榜标题区域样本:");
                let [l, t, w, h] = [3, bounds.top, WIDTH - 6, bounds.height()];
                debugInfo("(" + l + ", " + t + ", " + (l + w) + ", " + (t + h) + ")");
                current_app.rank_list_title_area_capt_bounds = [l, t, w, h];
                (current_app.setRankListTitleAreaCapt = () => {
                    if (!current_app.rank_list_title_area_capt_bounds) return debugInfo("排行榜标题区域边界数据不存在");
                    return current_app.rank_list_title_area_capt = images.clip.apply(null,
                        [current_app.rank_list_capt_img].concat(current_app.rank_list_title_area_capt_bounds)
                    );
                })();
            }

            function getCurrentUserNickname() {
                if (current_app.user_nickname) return debugInfo("无需重复获取当前账户昵称");
                try {
                    if (current_app.kw_rank_list_self("exists")) {
                        current_app.user_nickname = sel.pickup([current_app.kw_rank_list_self("sel"), "c0c2"], "", "txt");
                        current_app.user_nickname ? debugInfo("已获取当前账户昵称字符串") : debugInfo("获取到无效的当前账户昵称");
                    }
                } catch (e) {
                    debugInfo("获取当前账户昵称失败", 3);
                }
            }

            function expandHeroListThread() {
                if (!config.rank_list_auto_expand_switch) return debugInfo("排行榜自动展开功能未开启");
                debugInfo("已开启排行榜自动展开线程");
                let kw_list_more = current_app.kw_rank_list_more;
                let click_count = 0;
                while (!desc("没有更多了").exists() && !text("没有更多了").exists()) {
                    if (kw_list_more()) {
                        clickAction(kw_list_more(), "widget");
                        click_count++;
                    }
                    sleep(200);
                    let rank_list_node = current_app.kw_rank_list().findOnce();
                    if (!rank_list_node) continue;
                    let rank_list_items_size = rank_list_node.childCount() - 1;
                    if (rank_list_items_size >= config.rank_list_auto_expand_length) {
                        debugInfo("排行榜自动展开已被终止");
                        debugInfo("列表项已达阈值: " + config.rank_list_auto_expand_length);
                        debugInfo("当前列表项数值: " + rank_list_items_size);
                        debugInfo("发送列表底部控件慢速检测信号");
                        return current_app.slow_check_kw_end_list_ident_flag = true;
                    }
                }
                debugInfo(["排行榜展开完毕", ">点击\"查看更多\": " + click_count + "次"]);
            }
        }

        function getCurrentScreenTargets(strategy) {
            if (strategy === "image") return getTargetsByImage();
            if (strategy === "layout") return getTargetsByLayout();

            // tool function(s) //

            function getTargetsByLayout() {
                let [targets_green, targets_orange] = [[], []];
                let screenAreaSamples = getScreenSamples() || [];

                screenAreaSamples.forEach(w => {
                    let parent_node = sel.pickup([w, "p1"]);
                    if (!parent_node) return debugInfo("采集到无效的排行榜样本");

                    let state_ident_node = sel.pickup([w, "s2b"]);
                    if (state_ident_node.childCount()) return; // exclude identifies with countdown

                    let find_color_options = getFindColorOptions(parent_node);
                    if (!checkRegion(find_color_options.region)) return;

                    // special treatment for first 3 ones
                    let getName = compass => sel.pickup([parent_node, compass], "", "txt");
                    let name = getName("c1") || getName("c2");

                    if (friend_collect_switch) {
                        let pt_green = images.findColor(
                            current_app.rank_list_capt_img,
                            config.friend_collect_icon_color,
                            Object.assign({}, find_color_options, {threshold: config.friend_collect_icon_threshold})
                        );
                        if (pt_green) return targets_green.unshift({name: name});
                    } else {
                        if (!current_app.take_dysfunctional_flag) {
                            debugInfo(["不再采集收取目标样本", ">收取功能已关闭"]);
                            current_app.take_dysfunctional_flag = true;
                        }
                    }

                    if (help_collect_switch) {
                        if (checkHelpSection()) {
                            let pt_orange = images.findColor(
                                current_app.rank_list_capt_img,
                                config.help_collect_icon_color,
                                Object.assign({}, find_color_options, {threshold: config.help_collect_icon_threshold})
                            );
                            if (pt_orange) return targets_orange.unshift({name: name});
                        }
                    } else {
                        if (!current_app.help_dysfunctional_flag) {
                            debugInfo(["不再采集帮收目标样本", ">帮收功能已关闭"]);
                            current_app.help_dysfunctional_flag = true;
                        }
                    }
                });

                return [targets_green, targets_orange];

                // tool function(s) //

                function getScreenSamples() {
                    let regexp_energy_amount = /\d+(\.\d+)?(k?g|t)/;
                    let max_try_times = 10;
                    while (max_try_times--) {
                        let screen_samples = sel.pickup([boundsInside(cX(0.7), 0, WIDTH, USABLE_HEIGHT - 1), {
                            visibleToUser: true,
                            filter: function (w) {
                                let {bottom, top} = w.bounds();
                                return !!(bottom - top > 2 && sel.pickup(w, "", "txt").match(regexp_energy_amount));
                            }
                        }], "", "nodes");
                        let screen_samples_len = screen_samples.length;
                        debugInfo("获取当前屏幕好友样本数量: " + screen_samples_len);
                        if (screen_samples_len) return screen_samples;
                        sleep(100);
                    }
                    return debugInfo("刷新样本区域失败", 3);
                }

                function getFindColorOptions(parent_node) {
                    let region_ref = {
                        l: cX(0.7),
                        t: parent_node.bounds().top,
                    };
                    let region = [region_ref.l, region_ref.t, WIDTH - region_ref.l - 3, parent_node.bounds().centerY() - region_ref.t];
                    debugInfo("排行榜图标取色区域:");
                    debugInfo("[" + region[0] + ", " + region[1] + ", " + (region[0] + region[2]) + ", " + (region[1] + region[3]) + "]");
                    return {region: region};
                }

                function checkRegion(arr) {
                    let [left, top, right, bottom] = [arr[0], arr[1], arr[0] + arr[2], arr[1] + arr[3]];
                    if (left < WIDTH / 2) return debugInfo("采集区域left参数异常: " + left);
                    if (top < 10 || top >= USABLE_HEIGHT) return debugInfo("采集区域top参数异常: " + top);
                    if (bottom <= 0 || bottom > USABLE_HEIGHT) return debugInfo("采集区域bottom参数异常: " + bottom);
                    if (right <= left || right > WIDTH) return debugInfo("采集区域right参数异常: " + right);
                    return true;
                }
            }

            function getTargetsByImage() {
                let [targets_green, targets_orange] = [[], []];

                if (friend_collect_switch) getTargets("green");
                else {
                    if (!current_app.take_dysfunctional_flag) {
                        debugInfo(["不再采集收取目标样本", ">收取功能已关闭"]);
                        current_app.take_dysfunctional_flag = true;
                    }
                }

                if (help_collect_switch) {
                    checkHelpSection() && getTargets("orange");
                } else {
                    if (!current_app.help_dysfunctional_flag) {
                        debugInfo(["不再采集帮收目标样本", ">帮收功能已关闭"]);
                        current_app.help_dysfunctional_flag = true;
                    }
                }
                return [targets_green, targets_orange];

                // tool function(s) //

                function getTargets(ident) {
                    let action_str = {green: "friend", orange: "help"}[ident];
                    let color = config[action_str + "_collect_icon_color"];
                    if (!color) return;

                    let multi_colors = [[cX(38), cY(35, 16 / 9), color]]; // [cX(38), 0, color] was abandoned
                    if (ident === "green") {
                        multi_colors.push([cX(23), cY(26, 16 / 9), -1]);
                        for (let i = 16; i <= 24; i += (4 / 3)) multi_colors.push([cX(i), cY(i - 6, 16 / 9), -1]); // from E6683
                        for (let i = 16; i <= 24; i += (8 / 3)) multi_colors.push([cX(i), cY(i / 2 + 16, 16 / 9), -1]); // from E6683
                    } // [cX(37), cY(25), -1] was abandoned

                    let icon_check_area_top = 0;
                    let color_threshold = config[action_str + "_collect_icon_threshold"] || 10;
                    let icon_check_area_left = cX(0.9);
                    while (icon_check_area_top < HEIGHT) {
                        let icon_matched = checkAreaByMultiColors();
                        if (!icon_matched) return;

                        let [icon_matched_x, icon_matched_y] = [icon_matched.x, icon_matched.y];
                        let target_info = {
                            icon_matched_x: icon_matched_x,
                            icon_matched_y: icon_matched_y,
                            list_item_click_y: icon_matched_y + cY(16, 16 / 9),
                        };
                        if (ident === "green") {
                            let ref_color = images.pixel(current_app.rank_list_capt_img, cX(0.993), icon_matched_y + cY(11, 16 / 9));
                            colors.isSimilar(ref_color, color, color_threshold) && targets_green.unshift(target_info);
                        }
                        if (ident === "orange") targets_orange.unshift(target_info);

                        icon_check_area_top = icon_matched_y + cY(76, 16 / 9);
                    }

                    // tool function(s) //

                    function checkAreaByMultiColors() {
                        let matched = images.findMultiColors(current_app.rank_list_capt_img, color, multi_colors, {
                            region: [
                                icon_check_area_left,
                                icon_check_area_top,
                                WIDTH - icon_check_area_left,
                                HEIGHT - icon_check_area_top,
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
            let thread_monitor_retry_btn = threads.start(function () {
                while (1) sleep(clickAction(current_app.kw_reload_forest_page_btn()) ? 3000 : 1000);
            });

            while (!sel.pickup(/你收取TA|发消息/) && !className("ListView").exists() && max_safe_wait_time > 0) {
                sleep(sleep_interval);
                max_safe_wait_time -= sleep_interval * (current_app.kw_wait_for_awhile() ? 1 : 6);
            }

            let wait_times_sec = (max_safe_wait_time_backup - max_safe_wait_time) / 1000;
            if (wait_times_sec >= 6) debugInfo("进入好友森林时间较长: " + wait_times_sec.toFixed(2) + "秒");

            debugInfo("结束\"重新加载\"按钮监测线程");
            thread_monitor_retry_btn.interrupt();

            if (max_safe_wait_time <= 0) return messageAction("进入好友森林超时", 3, 1);

            getCloseBtnCenterCoord();

            thread_energy_balls_monitor = threads.start(energyBallsMonitorThread);

            // minimum time is about 879.83 ms before energy balls ready (Sony G8441)

            if (waitForAction(() => kw_energy_balls().length, 2000, 80)) {
                debugInfo(["能量球准备完毕", "共计: " + (init_balls_len = kw_energy_balls().length) + "个"]);
                return true;
            }
            return debugInfo("等待能量球超时") && false;

            // tool function(s) //

            function energyBallsMonitorThread() {
                debugInfo("已开启能量球监测线程");

                delete current_app.blacklist_idents_ready;
                let blacklist_capts_checked_flag = false;

                let orange_balls = config.help_collect_balls_color;
                let orange_balls_threshold = config.help_collect_balls_threshold;
                let intensity_time = config.help_collect_balls_intensity * 160 - 1200;

                debugInfo("能量球监测采集密度: " + intensity_time + "ms");

                timeRecorder("energy_balls_monitor", "save");

                let screen_capture = null;

                fillInBlacklistIdents();
                collectAndAnalyseHelpBalls();

                // tool function(s) //

                function captureCurrentScreen() {
                    screen_capture = images.captureCurrentScreen();
                    debugInfo("存储屏幕截图: " + images.getName(screen_capture));
                    return screen_capture;
                }

                function fillInBlacklistIdents() {
                    let max_add_times = 4;
                    while (max_add_times--) {
                        blacklist_ident_captures.add(captureCurrentScreen());
                        if (blacklist_ident_captures.length >= 3) return current_app.blacklist_idents_ready = true;
                        sleep(120);
                    }
                }

                function collectAndAnalyseHelpBalls() {
                    while (1) {
                        screen_capture = captureCurrentScreen();

                        let checkHelpBallsInBlacklistCapts = (node) => {
                            if (!blacklist_capts_checked_flag) {
                                debugInfo(["采集黑名单样本中的橙色球", ">样本数量: " + blacklist_ident_captures.length]);
                                checkHelpBalls(node, blacklist_ident_captures);
                                blacklist_capts_checked_flag = true;
                                debugInfo(["黑名单样本橙色球采集完毕", "采集结果数量: " + Object.keys(help_balls_coords).length]);
                            }
                        };
                        let checkHelpBallsInCurrentCapt = node => checkHelpBalls(node, screen_capture);
                        let checkHelpBalls = (node, capts) => {
                            if (classof(capts) !== "Array") capts = [capts];
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

                            checkHelpBallsInBlacklistCapts(all_normal_balls) || checkHelpBallsInCurrentCapt(all_normal_balls);

                            if (!help_balls_len()) debugInfo("未采集到橙色球: " + images.getName(screen_capture));
                        }

                        debugInfo("已回收屏幕截图: " + images.getName(screen_capture));
                        images.reclaim(screen_capture);

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
            current_app.collect_clicked_flag = false;
            current_app.help_clicked_flag = false;
            let blacklist_passed_flag = true;

            debugInfo("已开启黑名单检测线程");
            let thread_blacklist_check = threads.start(blacklistCheckThread);
            thread_blacklist_check.join();
            debugInfo("黑名单检测完毕");

            let thread_take = null;
            let thread_help = null;

            if (blacklist_passed_flag) {
                thread_take = threads.start(take);
                thread_help = threads.start(help);

                thread_help.join();
                debugInfo("帮收线程结束");
                help_balls_coords = {}; // reset
                thread_take.join();
                debugInfo("收取线程结束");
            } else {
                debugInfo(["能量球监测线程中断", ">黑名单检测未通过"]);
                thread_energy_balls_monitor.interrupt();
            }

            return blacklist_ident_captures.clear();

            // main function(s) //

            function blacklistCheckThread() {
                let max_wait_times = 10;
                while (!blacklist_ident_captures.length && max_wait_times--) {
                    if (!thread_energy_balls_monitor.isAlive()) break;
                    sleep(100);
                }

                waitForAction(() => current_app.blacklist_idents_ready, 800, 50); // just in case

                let blacklist_ident_capts_len = blacklist_ident_captures.length;

                if (blacklist_ident_capts_len) {
                    debugInfo("使用能量球监测线程采集数据");
                    debugInfo("黑名单采集样本数量: " + blacklist_ident_capts_len);
                    if (blacklist_ident_capts_len < 3) {
                        debugInfo("黑名单样本数量不足");
                        let max_wait_times_enough_idents = 10;
                        while (max_wait_times_enough_idents-- || true) {
                            if (!thread_energy_balls_monitor.isAlive()) {
                                debugInfo(["能量球监测线程已停止", "现场采集新黑名单样本数据"]);
                                captNewBlackListIdent();
                                break;
                            } else if (max_wait_times_enough_idents < 0) {
                                debugInfo(["等待样本采集超时", "现场采集新黑名单样本数据"]);
                                captNewBlackListIdent();
                                break;
                            } else if (blacklist_ident_captures.length >= 3) {
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
                    captNewBlackListIdent();
                }

                debugInfo("开始检查黑名单样本颜色特征");

                let protect_color_match = false;
                for (let i = 0, len = blacklist_ident_captures.length; i < len; i += 1) {
                    // let new_capt = images.clip(blacklist_ident_captures[i], cX(298), cY16h9w(218), cX(120), cY16h9w(22));
                    let new_capt = images.clip(
                        blacklist_ident_captures[i],
                        cX(288), cY(210, 16 / 9), cX(142), cY(44, 16 / 9)
                    ); // more flexible condition(s)
                    if (images.findColor(new_capt, config.protect_cover_ident_color, {
                        threshold: config.protect_cover_ident_threshold,
                    })) {
                        protect_color_match = true;
                        break;
                    }
                }

                if (protect_color_match) blacklist_passed_flag = false;
                else return debugInfo("颜色识别无保护罩");

                debugInfo("颜色识别检测到保护罩");

                let kw_list = className("ListView");
                if (!waitForAction(kw_list, 3000, 80)) return messageAction("未能通过列表获取能量罩信息", 3, 1, 1);

                debugInfo("已开启动态列表自动展开线程");
                let thread_list_more = threads.start(listMoreThread);
                debugInfo("已开启能量罩信息采集线程");
                let thread_list_monitor = threads.start(listMonitorThread);

                thread_list_monitor.join();
                debugInfo("能量罩信息采集完毕");

                // tool function(s) //

                function listMoreThread() {
                    let kw_list_more = () => sel.pickup("点击加载更多", "kw_list_more_for_rank_list_page");
                    if (!waitForAction(kw_list_more, 2000, 80)) return;

                    let safe_max_try_times = 50; // 10 sec at most
                    let click_count = 0;
                    while (!desc("没有更多").exists() && !text("没有更多").exists() && safe_max_try_times--) {
                        clickAction(kw_list_more(), "widget");
                        click_count++;
                        sleep(200);
                        if (!waitForAction(kw_list_more, 2000, 80)) return;
                    }
                    debugInfo(["动态列表展开完毕", ">点击\"点击加载更多\": " + click_count + "次"]);
                }

                function listMonitorThread() {
                    let kw_protect_cover = type => sel.pickup(/.*使用了保护罩.*/, "kw_protect_cover_used", type);
                    let date_nodes = getDateNodes();
                    if (date_nodes && kw_protect_cover()) addBlacklist();

                    thread_list_more.interrupt();

                    // tool function(s) //

                    function getDateNodes() {
                        if (!waitForAction(kw_list, 3000, 80)) return debugInfo("好友动态列表准备超时");

                        let safe_max_try_times = 8;
                        while (safe_max_try_times--) {
                            let date_nodes = getDateNodes();
                            for (let i = 0, len = date_nodes.length; i < len; i += 1) {
                                let days_txt = sel.pickup(date_nodes[i], "", "txt");
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

                    function addBlacklist() {
                        let cover_node = kw_protect_cover("node");
                        let cover_txt = kw_protect_cover("txt");
                        let list_node = className("ListView").findOnce();
                        let list_children_size = list_node.childCount();
                        let date_str = "";
                        for (let i = 0; i < list_children_size; i += 1) {
                            let child = list_node.child(i);
                            if (!child.childCount()) {
                                let txt = sel.pickup(child, "", "txt");
                                if (!txt.match(/.天/)) break;
                                date_str = txt;
                            } else {
                                if (sel.pickup([child, "c0c1"], "", "txt") === cover_txt) break;
                            }
                        }

                        if (!date_str) return messageAction("获取能量罩使用时间失败", 3, 0, 0, "both_dash");

                        debugInfo("捕获动态列表日期字串: " + date_str);
                        let time_str_clip = sel.pickup([cover_node, "p2c1"], "", "txt"); // like: "03:19"
                        debugInfo("捕获动态列表时间字串: " + time_str_clip);
                        let time_str = date_str + time_str_clip;

                        let current_name = current_app.current_friend.name;
                        if (!(current_name in current_app.blacklist)) current_app.blacklist[current_name] = {};
                        current_app.blacklist[current_name].timestamp = getTimestamp(time_str) + 86400000;
                        current_app.blacklist[current_name].reason = "protect_cover";
                        blackListMsg("add");

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

                function captNewBlackListIdent() {
                    let screen_capture_new = images.captureCurrentScreen();
                    debugInfo("生成屏幕截图: " + images.getName(screen_capture_new));
                    sleep(100);
                    blacklist_ident_captures.add(screen_capture_new);
                    screen_capture_new.recycle();
                    debugInfo("已回收屏幕截图: " + images.getName(screen_capture_new));
                    screen_capture_new = null;
                }
            }

            function take() {
                debugInfo("已开启能量球收取线程");

                if (!waitForAction(() => kw_energy_balls().length, 1000, 80)) return debugInfo("能量球准备超时");

                let ripe_balls = kw_energy_balls("ripe");
                if (!ripe_balls.length) return (current_app.collect_clicked_flag = true) && debugInfo("没有可收取的能量球");

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
                    current_app.help_clicked_flag = true;
                    current_app.current_friend.six_balls_review_flag = false;
                    return debugInfo("没有可帮收的能量球");
                }
                if (!waitForAction(() => current_app.collect_clicked_flag || !thread_take.isAlive(), 2000, 80)) {
                    current_app.current_friend.six_balls_review_flag = false;
                    return messageAction("等待收取线程信号超时", 3, 0, 1);
                }
                debugInfo("收取线程信号返回正常");

                clickAndCount("help", coords_arr);

                if (init_balls_len === 6) {
                    if (!config.six_balls_review_switch) return debugInfo("六球复查未开启");

                    let getReviewFlag = () => current_app.current_friend.six_balls_review_flag;
                    let init_flag = getReviewFlag();
                    current_app.current_friend.six_balls_review_flag = ++init_flag || 1;

                    let max_times = config.six_balls_review_max_continuous_times;
                    if (getReviewFlag() > max_times) {
                        debugInfo(["不再设置六球复查标记", ">连续复查次数已达上限"]);
                        delete current_app.current_friend.six_balls_review_flag;
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
                                clickAction(w.bounds(), "press", {press_time: config.energy_balls_click_interval});
                            });
                            debugInfo("点击成熟能量球: " + balls_nodes.length + "个");
                            current_app.collect_clicked_flag = true;
                        },
                        dashboard_params: ["你收取TA", "kw_collect_data_ident", 10],
                    },
                    help: {
                        name: "帮收",
                        action_name: "助力",
                        balls_click_func: () => {
                            balls_nodes.forEach((coords) => {
                                let pt = help_balls_coords[coords];
                                clickAction([pt.x, pt.y], "press", {press_time: config.energy_balls_click_interval});
                            });
                            debugInfo("点击帮收能量球: " + balls_nodes.length + "个");
                            current_app.help_clicked_flag = true;
                        },
                        dashboard_params: ["你给TA助力", "kw_help_data_ident", 10],
                    },
                };
                let cfg = default_config[action_str];
                let name = cfg.name;

                let thread_ready_count = threads.atomic(0);
                let final_result = threads.atomic(-1);

                let [thread_by_dashboard, thread_by_dynamic_list] = [threads.start(byDashboardThread), threads.start(byDynamicListThread)];
                let threads_arr = [thread_by_dashboard, thread_by_dynamic_list];

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
                    current_app.valid_rank_list_icon_clicked = true;
                    current_app.friend_drop_by_counter.decrease(current_app.current_friend.name);

                    thread_ready_count.get() && waitForAction(() => ~final_result.get() || threadAllDead(), 3000, 80);

                    killAllThreads();

                    if (config.console_log_details || config.debug_info_switch) {
                        let action_name = cfg.action_name;
                        let final_result_num = final_result.get();
                        if (final_result_num >= 0) {
                            messageAction(action_name + ": " + final_result_num + "g", +!!final_result_num, 0, 1);
                            if (action_str === "collect") current_app.total_energy_collect_friends += final_result_num;
                        } else messageAction(action_name + ": 统计数据无效", 0, 0, 1);
                        current_app.current_friend.console_logged = 1;
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

                    if (!waitForAction(() => current_app[action_str + "_clicked_flag"], 2000, 50)) return;

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

                    if (!waitForAction(() => current_app[action_str + "_clicked_flag"], 2000, 50)) return;

                    debugInfo("等待" + name + "动态列表数据稳定");
                    let list_item_count = stabilizer(() => getCountFromDynamicInfoList(action_str), ori_list_item_count);
                    if (isNaN(list_item_count)) return debugInfo(name + "动态列表稳定数据无效");
                    debugInfo(name + "动态列表数据已稳定: " + list_item_count);
                    let list_node = null;
                    let kw_list = type => sel.pickup(className("ListView"), "", type);
                    if (waitForAction(() => list_node = kw_list(), 500, 100)) {
                        let result = 0;
                        for (let i = 1, len = list_item_count - ori_list_item_count; i <= len; i += 1) {
                            let matched = sel.pickup([list_node, "c" + i + "c0c1"], "", "txt").match(/\d+/);
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
                jumpBackOnce("forcibly_back");
                sleep(200);
                if (waitForAction(condition, 2000)) return true;
                debugInfo("返回排行榜单次超时");
            }
            debugInfo(["返回排行榜失败", "尝试重启支付宝到排行榜页面", 3]);
            restartAlipayToHeroList();

            let {kw_rank_list_self} = current_app;
            let condition_rank_list_ready = () => kw_rank_list_self() && kw_rank_list_self().childCount();
            if (!waitForAction(condition_rank_list_ready, 2000)) restartAlipayToHeroList(); // just in case

            // tool function(s) //

            function condition() {
                if (current_app.rank_list_icon_clicked) {
                    delete current_app.rank_list_icon_clicked;
                    return current_app.kw_rank_list_title();
                }
                let capt_img = images.captureCurrentScreen();
                let imageOrColorMatched = titleAreaMatch() || closeBtnColorMatch();
                images.reclaim(capt_img);
                if (imageOrColorMatched) return true;
                if (strategy === "layout") return current_app.kw_rank_list_title();

                // tool function(s) //

                function titleAreaMatch() {
                    let template = current_app.rank_list_title_area_capt;
                    if (images.isRecycled(template)) {
                        current_app.rank_list_title_area_capt = null;
                        sleep(800); // for rank list page getting ready
                        if (current_app.setRankListTitleAreaCapt) {
                            debugInfo("重新采集排行榜标题区域样本");
                            current_app.setRankListTitleAreaCapt();
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
                    let pt = current_app.close_btn_coord;
                    if (!pt) return;
                    let {x, y} = current_app.close_btn_coord;
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
            if (checkOwnCountdownDemand(+!!config.homepage_background_monitor_switch)) rankListReady();
            if (list_end_signal) return debugInfo("检测到排行榜停检信号");
            while (__global__._monster_$_global_monitor_waiting_signal || current_app.swipe_up_waiting_signal) sleep(200);

            swipeOnce();

            if (strategy === "image") sleep(config.rank_list_swipe_interval);
            else if (strategy === "layout") {
                debugInfo("等待排行榜列表稳定");
                timeRecorder("rank_list_swipe_beginning", "save");
                let bottom_data = undefined;
                let tmp_bottom_data = getRankListSelfBottom();
                debugInfo("参照值: " + tmp_bottom_data);
                let invalid_rank_list_ref_data = 0;
                while (bottom_data !== tmp_bottom_data) {
                    bottom_data = tmp_bottom_data;
                    sleep(50);
                    tmp_bottom_data = getRankListSelfBottom();
                    if (isNaN(tmp_bottom_data)) {
                        debugInfo("参照值: NaN");
                        invalid_rank_list_ref_data++;
                        if (invalid_rank_list_ref_data > 10) {
                            messageAction("脚本无法继续", 4, 0, 0, "up");
                            messageAction("排行榜列表参照值异常", 9, 1, 1, 1);
                        }
                    } else debugInfo("参照值: " + tmp_bottom_data);
                }
                debugInfo("排行榜列表已稳定: " + timeRecorder("rank_list_swipe_beginning", "load", null, null, "ms"));
            }

            current_app.rank_list_capt_img = images.captureCurrentScreen();
            debugInfo("生成排行榜截图: " + images.getName(current_app.rank_list_capt_img));

            if (!checkRankListCaptDifference()) {
                let kw_loading = type => sel.pickup(/正在加载.*/, "kw_loading", type);
                if (kw_loading()) {
                    let max_keep_waiting_time = 2 * 60000; // 2 min
                    debugInfo(["检测到\"正在加载\"按钮", "等待按钮消失 (最多" + max_keep_waiting_time + "分钟)"]);
                    if (waitForAction(() => !kw_loading(), max_keep_waiting_time, 1000)) {
                        list_end_signal = 0;
                        return debugInfo(["排行榜停检信号撤销", ">\"正在加载\"按钮已消失"]);
                    }
                    debugInfo("等待\"正在加载\"按钮消失超时", 3);
                }

                let {kw_end_list_ident} = current_app;
                if (kw_end_list_ident()) {
                    let {left, top, right, bottom} = kw_end_list_ident("bounds");
                    if (bottom - top > cX(0.08)) {
                        list_end_signal = 1;
                        debugInfo(["发送排行榜停检信号", ">已匹配列表底部控件"]);
                        let capt_img = images.captureCurrentScreen();
                        let btn_clip = images.clip(capt_img, left, top, right - left - 3, bottom - top - 3);
                        images.save(
                            current_app.rank_list_bottom_template = images.copy(btn_clip),
                            current_app.rank_list_bottom_template_path)
                        ;
                        images.reclaim(capt_img, btn_clip);
                        return debugInfo("列表底部控件图片模板已更新");
                    }
                }

                if (waitForAction(() => sel.pickup(/.*打瞌睡.*/), 2, 1000)) {
                    waitForAndClickAction(sel.pickup("再试一次"), 15000, 500, {click_strategy: "widget"});
                    list_end_signal = 0;
                    return debugInfo(["排行榜停检信号撤销", ">检测到\"服务器打瞌睡\"页面"]);
                }
            }

            if (checkRankListBottomTemplate() || checkInvitationBtnColor()) list_end_signal = 1;

            // tool function(s) //

            function swipeOnce() {
                if (current_app.swipe_by_scroll_down_flag) return scrollDown(0);

                if (current_app.slow_check_kw_end_list_ident_flag && config.rank_list_swipe_interval <= 600) {
                    config.rank_list_swipe_interval += 6;
                    debugInfo("滑动间隔递增至: " + config.rank_list_swipe_interval + "ms");
                }

                let half_width = cX(0.5);
                let swipe_time = config.rank_list_swipe_time;
                let swipe_distance_raw = config.rank_list_swipe_distance;
                let swipe_distance = swipe_distance_raw < 1 ? ~~(swipe_distance_raw * HEIGHT) : swipe_distance_raw;
                let swipe_top = ~~((USABLE_HEIGHT - swipe_distance) / 2);
                if (swipe_top <= 0) {
                    messageAction("滑动区域超限", 3);
                    let fixed_rank_list_swipe_distance = ~~(USABLE_HEIGHT * 0.95);
                    swipe_top = ~~((USABLE_HEIGHT - fixed_rank_list_swipe_distance) / 2);
                    messageAction("自动修正滑动距离参数:", 3);
                    messageAction("swipe_top: " + swipe_top, 3);
                    storage_af_cfg.put("config", Object.assign({}, storage_af_cfg.get("config", {}), {
                        "rank_list_swipe_distance": config.rank_list_swipe_distance = fixed_rank_list_swipe_distance,
                    }));
                    messageAction("自动修正配置文件数据:", 3);
                    messageAction("rank_list_swipe_distance: " + fixed_rank_list_swipe_distance, 3);
                }
                let swipe_bottom = USABLE_HEIGHT - swipe_top;
                let calcSwipeDistance = () => swipe_bottom - swipe_top;

                debugInfo("上滑屏幕: " + calcSwipeDistance() + "px");

                let calc_swipe_distance = calcSwipeDistance();
                if (calc_swipe_distance >= 0.4 * HEIGHT && calc_swipe_distance <= 0.9 * HEIGHT && swipe(half_width, swipe_bottom, half_width, swipe_top, swipe_time)) return;
                debugInfo("滑动参数或功能异常");
                debugInfo("滑动距离参数: " + calc_swipe_distance);
                debugInfo("滑动时长参数: " + swipe_time);
                [swipe_bottom, swipe_top, swipe_time] = [cY(0.75), cY(0.25), 500]; // safe values
                debugInfo("尝试使用安全值:");
                debugInfo("[" + swipe_bottom + ", " + swipe_top + ", " + swipe_time + "]");
                if (swipe(half_width, swipe_bottom, half_width, swipe_top, swipe_time)) {
                    // just to prevent screen from turning off;
                    // maybe this is not a good idea
                    click(Math.pow(10, 7), Math.pow(10, 7)); // not press()
                    return sleep(100);
                }
                debugInfo(calcSwipeDistance() > 0 ? "swipe()方法异常" : "滑动距离数据无效");
                debugInfo(">替代使用scrollDown()方法");
                strategy === "image" && debugInfo(">列表滑动效率可能受到影响");

                current_app.swipe_by_scroll_down_flag = true;
                return scrollDown(0);
            }

            function getRankListSelfBottom() {
                let max_try_times = 50;
                while (max_try_times--) {
                    try {
                        return current_app.kw_rank_list_self("bounds").bottom;
                    } catch (e) {
                        sleep(50);
                    }
                }
                return 0 / 0;
            }

            function checkRankListCaptDifference() {
                let img = current_app.rank_list_capt_img;
                let pool = current_app.rank_list_capt_diff_check_pool;
                if (!pool) pool = current_app.rank_list_capt_diff_check_pool = [];
                let pool_len = pool.length;
                if (!pool_len) {
                    // debugInfo("添加截图到排行榜截图样本池");
                    return pool[0] = img;
                }
                if (pool_len > 1) {
                    let img_to_recycle = pool.shift();
                    pool_len -= 1;
                    debugInfo("回收排行榜截图: " + images.getName(img_to_recycle));
                    images.reclaim(img_to_recycle);
                }

                let similar_captures = false;
                let thread_find_image = threads.start(function () {
                    similar_captures = !!images.findImage(img, pool[pool_len - 1]);
                });
                thread_find_image.join(150);
                if (thread_find_image.isAlive()) {
                    thread_find_image.interrupt();
                    debugInfo(["放弃排行榜截图样本差异检测", ">单次检测超时"]);
                    return true;
                }

                let check_threshold = config.rank_list_capt_pool_diff_check_threshold;
                if (similar_captures) {
                    let counter = current_app.rank_list_capt_pool_diff_check_counter += 1;
                    debugInfo(["排行榜截图样本池差异检测:", "检测未通过: (" + counter + "\/" + check_threshold + ")"]);
                    if (counter >= check_threshold) {
                        list_end_signal = 1;
                        return debugInfo(["发送排行榜停检信号", ">已达截图样本池差异检测阈值"]);
                    }
                } else {
                    // debugInfo("排行榜截图样本池差异检测通过");
                    current_app.rank_list_capt_pool_diff_check_counter = 0;
                }
                pool.push(img);
                return true;
            }

            function checkRankListBottomTemplate() {
                let bottom_template = current_app.rank_list_bottom_template;
                if (bottom_template) {
                    let template_height = bottom_template.height;
                    if (template_height < cX(0.08) - 3 || template_height > cX(0.18)) {
                        files.remove(current_app.rank_list_bottom_template_path);
                        delete current_app.rank_list_bottom_template;
                        debugInfo(["列表底部控件图片模板已清除", ">图片模板高度值异常: " + template_height], 3);
                        if (!thread_list_end.isAlive()) {
                            thread_list_end = threads.start(monitorEndOfListByUiObjThread);
                        }
                    } else {
                        let matched = images.findImage(current_app.rank_list_capt_img, bottom_template, {level: 1});
                        if (matched) return debugInfo(["列表底部条件满足", ">已匹配列表底部控件图片模板"]) || true;
                    }
                }
            }

            function checkInvitationBtnColor() {
                let color = "#30bf6c";
                let multi_color = current_app.check_invitation_btn_multi_colors || getCheckInvitationBtnMultiColors();

                if (images.findMultiColors(
                    current_app.rank_list_capt_img, color, multi_color,
                    {region: [cX(0.82), cY(0.62), cX(0.17), cY(0.37)], threshold: 10}
                )) {
                    debugInfo(["列表底部条件满足", ">指定区域匹配颜色成功", ">邀请按钮色值: " + color]);
                    return true;
                }

                // tool function(s) //

                function getCheckInvitationBtnMultiColors() {
                    return current_app.check_invitation_btn_multi_colors = [
                        // color matrix:
                        //   c   c c c   w
                        // [ *   2 _ 4   _ ] -- 0 (cX)
                        // [ 0   _ 3 _   6 ] -- 45 (cX)
                        // [ _   2 _ 4   6 ] -- 90 (cX)
                        // c: color; w: white (-1)
                        // 2: 18; 4: 36; 6: 54; ... (cY)
                        [0, cY(18, 16 / 9), color],
                        [0, cY(36, 16 / 9), color],
                        [cX(45), 0, color],
                        [cX(45), cY(27, 16 / 9), color],
                        [cX(45), cY(54, 16 / 9), -1],
                        [cX(90), cY(18, 16 / 9), color],
                        [cX(90), cY(36, 16 / 9), color],
                        [cX(90), cY(54, 16 / 9), -1],
                    ];
                }
            }
        }

        function reviewSamplesIfNeeded() {
            if (current_app.rank_list_review_stop_signal) return debugInfo("检测到复查停止信号");
            if (!config.rank_list_review_switch) return debugInfo("排行榜样本复查功能未开启");
            if (!config.timers_switch) return debugInfo("定时循环功能未开启");

            if (config.rank_list_review_difference_switch) {
                if (!equalObjects(
                    current_app.last_collected_samples && Object.keys(current_app.last_collected_samples),
                    Object.keys(current_app.last_collected_samples = getSamplesInfo())
                )) return debugInfo(["触发排行榜样本复查条件:", "列表状态差异"], "both") || true;
            }

            if (config.rank_list_review_samples_clicked_switch) {
                if (current_app.valid_rank_list_icon_clicked) {
                    current_app.valid_rank_list_icon_clicked = false;
                    return debugInfo(["触发排行榜样本复查条件:", "样本点击记录"], "both") || true;
                }
            }

            if (config.rank_list_review_threshold_switch) {
                if (checkMinCountdownFriends(config.rank_list_review_threshold)) {
                    return debugInfo(["触发排行榜样本复查条件:", "最小倒计时阈值"], "both") || true;
                }
            }
        }

        function checkMinCountdownFriendsIfNeeded() {
            if (config.timers_switch && config.timers_self_manage_switch && config.timers_countdown_check_friends_switch) {
                current_app.min_countdown_friends === undefined && checkMinCountdownFriends();
            }
        }

        function checkMinCountdownFriends(threshold_minute) {
            let now = new Date();

            threshold_minute = threshold_minute || config.rank_list_review_threshold;

            debugInfo("开始检测好友能量最小倒计时");

            let names = Object.keys(current_app.last_collected_samples || {}); // {a: 123, b: 345, c: 123} -> ["a", "b", "c"]
            let names_len = names.length;
            if (!names_len) {
                current_app.min_countdown_friends = Infinity;
                return debugInfo("好友能量最小倒计时检测完毕");
            } // no countdown, no need to checkRemain

            let countdown_data = [];
            names.forEach(name => countdown_data.push(+current_app.last_collected_samples[name]));

            let min_countdown_friends = Math.min.apply(null, countdown_data); // timestamp

            let ripe_time = new Date(min_countdown_friends);
            let remain_minute = Math.round((ripe_time - +now) / 60000);

            debugInfo("好友能量最小倒计时: " + remain_minute + "min");
            current_app.min_countdown_friends = min_countdown_friends; // ripe timestamp
            debugInfo("时间数据: " + getNextTimeStr(min_countdown_friends));

            debugInfo("好友能量最小倒计时检测完毕");

            if (!isNaN(+threshold_minute)) return +remain_minute <= +threshold_minute;
        }

        function getCloseBtnCenterCoord() {
            if (current_app.close_btn_coord) return;

            let node = current_app.kw_close_btn();
            if (node) {
                let bounds = node.bounds();
                let [x, y] = [bounds.centerX(), bounds.centerY()];
                if (x > cX(0.8) && y < cY(0.2)) {
                    current_app.close_btn_coord = {x: x, y: y};
                    debugInfo("关闭按钮中心坐标: (" + x + ", " + y + ")");
                } else debugInfo("关闭按钮位置异常");
            }
        }

        function monitorEndOfListByUiObjThread() {
            if (current_app.rank_list_bottom_template) return debugInfo(["无需监测排行榜底部控件", ">存在底部控件图片模板"]);

            debugInfo("已开启排行榜底部控件监测线程");

            let delay_swipe_time = 3000;
            let delay_swipe_time_sec = ~~(delay_swipe_time / 1000);
            delay_swipe_time = delay_swipe_time_sec * 1000;
            let {kw_end_list_ident} = current_app;

            while (sleep(500) || true) {
                if (current_app.slow_check_kw_end_list_ident_flag) {
                    debugInfo("延迟列表底部条件检测: " + delay_swipe_time_sec + "s");
                    sleep(delay_swipe_time);
                }

                while (__global__._monster_$_global_monitor_waiting_signal) sleep(200);

                if (!kw_end_list_ident()) continue;

                let sel_str = kw_end_list_ident("sel_str");
                let {left, top, right, bottom} = kw_end_list_ident("bounds");
                if (bottom - top > cX(0.08)) {
                    list_end_signal = 1;
                    debugInfo("列表底部条件满足");
                    debugInfo(">bounds: [" + left + ", " + top + ", " + right + ", " + bottom + "]");
                    debugInfo(">" + sel_str + ": " + kw_end_list_ident(sel_str));
                    let capt_img = images.captureCurrentScreen();
                    let btn_clip = images.clip(capt_img, left, top, right - left - 3, bottom - top - 3);
                    images.save(
                        current_app.rank_list_bottom_template = images.copy(btn_clip),
                        current_app.rank_list_bottom_template_path
                    );
                    images.reclaim(capt_img, btn_clip);
                    debugInfo("已存储列表底部控件图片模板");
                    break;
                }
            }

            return debugInfo("排行榜底部控件监测线程结束");
        }

        function getDashboardData(selector_text, memory_keyword, max_try_times) {
            // let selector_node = sel.pickup(selector_text, memory_keyword);
            // if (!selector_node) return NaN;

            max_try_times = max_try_times || 1;
            while (max_try_times--) {
                try {
                    let txt = sel.pickup([selector_text, "s+1"], memory_keyword, "txt");
                    if (txt.match(/\d+(kg|t)/)) {
                        debugInfo("放弃参照值精度过低的统计方法");
                        return NaN;
                    }
                    let value = +txt.match(/\d+/);
                    if (!isNaN(value)) return value;
                } catch (e) {
                    console.error(e); //// TEST ////
                }
                if (max_try_times >= 0) sleep(50);
            }
            return NaN;
        }

        function getCountFromDynamicInfoList(type_str) {
            let list_node = null;
            let kw_list = type => sel.pickup(className("ListView"), "", type);
            if (!waitForAction(() => list_node = kw_list(), 500, 100)) return NaN;

            let user_nickname = current_app.user_nickname;
            let sel_str = kw_dynamic_list_info("sel_str");
            let regexp_activity = new RegExp("^" + (type_str.slice(0, 4) === "help" ? "帮忙" : "") + "收取\\d+g$");
            if (sel.pickup([list_node, "c0"], "", sel_str) !== "今天") return 0;
            let i = 1;
            for (let len = list_node.childCount(); i < len; i += 1) {
                let child_node = sel.pickup([list_node, "c" + i + "c0"]);
                if (!child_node) continue;
                if (sel.pickup([child_node, "c0"], "", sel_str) !== user_nickname) break;
                if (!sel.pickup([child_node, "c1"], "", sel_str).match(regexp_activity)) break;
            }
            return i - 1;
        }

        function inBlackList(clickRankListItemFunc) {
            if (strategy === "image") {
                clickRankListItemFunc();
                sleep(500); // avoid touching widgets in rank list

                if (checkForestTitle()) {
                    blackListMsg("exist", "split_line", "forcible_flag");
                    backToHeroList();
                    return true;
                }
            } else if (strategy === "layout") {
                let current_friend_name = current_app.current_friend.name;
                current_app.friend_drop_by_counter.increase(current_friend_name);
                if (current_friend_name in current_app.blacklist) {
                    current_app.friend_drop_by_counter.decrease(current_friend_name);
                    return blackListMsg("exist", "split_line"); // true
                } else clickRankListItemFunc();
            }

            // tool function(s) //

            function checkForestTitle() {
                let friend_nickname = "";
                if (!waitForAction(() => friend_nickname = sel.pickup(/.+的蚂蚁森林/, "", "txt"), 20000)) {
                    return messageAction("标题采集好友昵称超时", 3);
                }
                friend_nickname = friend_nickname.replace(/的蚂蚁森林$/, "");

                current_app.friend_drop_by_counter.increase(friend_nickname);
                current_app.current_friend.name = friend_nickname;

                if ((config.console_log_details || config.debug_info_switch) && !current_app.current_friend.name_logged) {
                    messageAction(friend_nickname, "title");
                    current_app.current_friend.name_logged = 1;
                }

                let is_in_blacklist = friend_nickname in current_app.blacklist;
                if (is_in_blacklist) current_app.friend_drop_by_counter.decrease(friend_nickname);
                return is_in_blacklist;
            }
        }

        function blackListMsg(msg_str, split_line_flag, forcible_flag) {
            let messages = {
                "add": "已加入黑名单",
                "exist": "黑名单好友",
            };
            let reasons = {
                "protect_cover": "好友使用能量保护罩",
                "by_user": "用户自行设置",
            };

            let name = current_app.current_friend.name;
            if (!config.console_log_details && !config.debug_info_switch || ~current_app.logged_blacklist_names.indexOf(name)) {
                forcible_flag && messageAction(messages[msg_str], 1, 0, 1, +!!split_line_flag);
                return true;
            }

            messageAction(messages[msg_str], 1, 0, 1);
            msg_str === "exist" && messageAction("已跳过收取", 1, 0, 2);

            let current_black_friend = current_app.blacklist[name];
            let reason_str = current_black_friend.reason;
            messageAction(reasons[reason_str], 1, 0, 2);
            let check_result = checkBlackTimestamp(current_black_friend.timestamp);
            if (typeof check_result === "string") messageAction(check_result, 1, 0, 2);
            split_line_flag && showSplitLine();
            current_app.logged_blacklist_names.push(name);
            return current_app.current_friend.console_logged = 1;
        }

        function getSamplesInfo() {
            let countdown_nodes_arr = sel.pickup(new RegExp("\\d+\u2019"), "kw_countdown_minute", "nodes");
            let countdown_nodes_len = countdown_nodes_arr.length;

            debugInfo("捕获好友能量倒计时数据: " + countdown_nodes_len + "个");
            if (!countdown_nodes_len) return {};

            let collected_samples = {};
            countdown_nodes_arr.forEach((countdown_node) => {
                let getTxt = compass => sel.pickup([countdown_node, compass], "", "txt");
                let mm = +sel.pickup(countdown_node, "", "txt").match(/\d+/)[0];
                collected_samples[getTxt("p2c1") || getTxt("p2c2")] = +new Date() + mm * 60000; // next ripe timestamp
            });
            return collected_samples;
        }

        function checkOwnCountdownDemand(minute) {
            if (!minute) return;
            let countdown = current_app.min_countdown_own; // timestamp
            if (!countdown || countdown === Infinity) return;
            if (current_app.min_countdown_own - +new Date() <= minute * 60000 + 3000) {
                messageAction("返回蚂蚁森林主页监测自己能量", 1, 1, 0, 1);
                launchAFHomepage();
                checkOwnEnergy();
                return true;
            }
        }

        function checkHelpSection() {
            let section = config.help_collect_section; // ["00:00", "00:00"]
            if (section[0] === section[1]) return true;
            if (section[1] < section[0]) section[1] = section[1].replace(/\d{2}(?=:)/, +section[1].split(":")[0] + 24 + "");
            let now = new Date();
            let padZero = num => ("0" + num).slice(-2);
            let now_hh_mm_str = padZero(now.getHours()) + ":" + padZero(now.getMinutes());
            let result = now_hh_mm_str >= section[0] && now_hh_mm_str < section[1];
            if (!result && !current_app.help_without_section_flag) {
                debugInfo("当前时间不在帮收有效时段内");
                current_app.help_without_section_flag = true;
            }
            return result;
        }
    }

    function setTimers() {
        if (!config.timers_switch) return debugInfo("定时循环功能未开启");
        if (!config.timers_self_manage_switch) return debugInfo("定时任务自动管理未开启");

        let type_info = {
            min_countdown: "最小倒计时",
            uninterrupted: "延时接力",
            insurance: "意外保险",
        };

        if (!config.timers_countdown_check_own_switch) current_app.min_countdown_own = Infinity;
        if (!config.timers_countdown_check_friends_switch) current_app.min_countdown_friends = Infinity;

        let ahead_own = config.timers_countdown_check_own_timed_task_ahead;
        let ahead_friends = config.timers_countdown_check_friends_timed_task_ahead;
        let min_own = (current_app.min_countdown_own || Infinity) - ahead_own * 60000;
        let min_friends = (current_app.min_countdown_friends || Infinity) - ahead_friends * 60000;

        let next_min_countdown_info = [Math.min(min_own, min_friends), "min_countdown"];
        let next_uninterrupted_info = [getNextUninterruptedTime(), "uninterrupted"];

        let next_launch = [next_min_countdown_info, next_uninterrupted_info].sort((a, b) => a[0] > b[0] ? 1 : -1)[0];
        if (next_launch[0] === Infinity) return debugInfo("无定时任务可设置");

        addOrUpdateAutoTask(next_launch);
        clearInsuranceTasks();

        // tool function(s) //

        function getNextUninterruptedTime() {
            if (!config.timers_uninterrupted_check_switch) return ~debugInfo("延时接力机制未开启") && Infinity;

            let sections = config.timers_uninterrupted_check_sections; // [{section: ["06:30", "00:00"], interval: 60}]
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
                let storage_task_id = storage_af.get("next_auto_task", {}).task_id;
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
                    path: current_app.current_file_path,
                    date: next_launch_time,
                });
                storage_af.put("next_auto_task", {
                    task_id: task.id,
                    timestamp: next_launch_time,
                    type: type,
                });
                messageAction("已添加自动定时任务", 1);
                return task;
            }
        }

        function clearInsuranceTasks() {
            let auto_delay_thread = current_app.thread_auto_delay_insurance_task;
            if (auto_delay_thread && auto_delay_thread.isAlive()) auto_delay_thread.interrupt();

            cleanAllInsuranceTasks();
        }
    }
}

function logBackInIfNeeded() {
    let {account_log_back_in_switch, account_log_back_in_max_continuous_times} = config;
    let {init_logged_in_user_abbr_name, init_is_main_user_logged_in} = current_app;
    let sto_key_name = "log_back_in_user";
    let clearLogBackInStorage = () => {
        if (storage_af.contains(sto_key_name)) {
            storage_af.remove(sto_key_name);
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
    let sto_data = storage_af.get(sto_key_name, init_data);
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
    storage_af.put(sto_key_name, sto_data);
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
            if (!config.message_showing_switch || !config.result_showing_switch) return resolve(true);

            debugInfo("开始展示统计结果");

            let isNoneNegNum = num => !isNaN(+num) && +num >= 0;
            let own = current_app.total_energy_collect_own;
            debugInfo("自己能量收取值: " + own);
            let friends = current_app.total_energy_collect_friends;
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
                if (config.floaty_result_switch) {
                    return showFloatyResultAsync(own, friends, config.floaty_result_countdown);
                }
                messageAction(msg, null, 1);
                debugInfo("统计结果展示完毕");

                // tool function(s) //

                function showFloatyResultAsync(you, friends, countdown) {
                    debugInfo("发送Floaty消息等待信号");
                    current_app.floaty_msg_finished_flag = 0;
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
                            current_app.floaty_msg_finished_flag = 1;
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
                                if (ACT === ACTION_DOWN) human_touched = event.getY() > cY(0.12, 16 / 9);
                                if (ACT === ACTION_MOVE) human_touched = true;
                                if (ACT === ACTION_UP) human_touched = event.getEventTime() - event.getDownTime() > 200;
                            }
                            return false; // event will not be consumed and will send to onClickListener
                        }
                    );

                    window_cover.setSize(-1, -1);
                    window_cover.setTouchable(true); // prevent touch event transferring to the view beneath

                    let base_height = cY(0.66);
                    let message_height = cY(80, 16 / 9);
                    let hint_height = message_height * 0.7;
                    let timeout_height = hint_height;
                    let color_stripe_height = message_height * 0.2;

                    let message_layout =
                        <frame gravity="center">
                            <text id="text" bg="#cc000000" size="24" padding="10 2" color="#ccffffff" gravity="center"/>
                        </frame>;

                    let timeout_layout =
                        <frame gravity="center">
                            <text id="text" bg="#cc000000" size="14" color="#ccffffff" gravity="center" text="0"/>
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
                    let left_pos = (WIDTH - min_width) / 2;

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

                    let countdown_interval = null;

                    let p1 = new Promise((resolve => {
                        debugInfo(["Floaty绘制完毕", "开始Floaty倒计时"]);
                        setFloatyTimeoutText(countdown);
                        countdown_interval = setInterval(function () {
                            if (--countdown <= 0) return resolve(clearInterval(countdown_interval));
                            if (current_app.floaty_msg_finished_flag) return resolve(clearInterval(countdown_interval));
                            setFloatyTimeoutText(countdown);
                        }, 1000);
                    }));

                    let p2 = new Promise((resolve => {
                        setTimeout(function () {
                            clearInterval(countdown_interval);

                            if (floaty_failed_flag) {
                                messageAction("此设备可能无法使用Floaty功能", 3, 1);
                                messageAction("建议改用Toast方式显示收取结果", 3);
                            }

                            let prefix = floaty_failed_flag ? "强制" : "";
                            debugInfo(prefix + "关闭所有Floaty窗口");
                            floaty.closeAll();

                            if (current_app.floaty_msg_finished_flag === 0) {
                                current_app.floaty_msg_finished_flag = 1;
                                debugInfo(prefix + "发送Floaty消息结束等待信号");
                            }

                            debugInfo(["Floaty倒计时结束", "统计结果展示完毕"]);
                            resolve();
                        }, timeout);
                    }));

                    return Promise.race([p1, p2])
                        .then(() => true)
                        .catch(e => messageAction(e, 4, 1, 0, "both"));

                    // tool function(s) //

                    function setFloatyTimeoutText(countdown) {
                        ui.run(function () {
                            try {
                                debugInfo("设置倒计时数据文本: " + countdown);
                                timeout_raw_win.text.setText(surroundWith(countdown, "(", ")"));
                                floaty_failed_flag = false;
                            } catch (e) {
                                debugInfo(["Floaty倒计时文本设置单次失败:", e.message]);
                            }
                        });
                    }
                }
            }
        });
    }

    function prepareForExitAsync() {
        if (current_app.blacklist) {
            debugInfo("存储本次会话黑名单数据");
            storage_af.put("blacklist", current_app.blacklist);
        }

        if (config.kill_when_done_switch) {
            endAlipay(); // kill (or minimize) alipay immediately
        } else {
            if (current_app.kill_when_done_intelligent_kill) endAlipay();
            else config.kill_when_done_keep_af_pages || closeAFWindows();
        }

        removeSpringboardIfNeeded();

        current_app.may_exit_when_screen_off_flag = true;

        return new Promise((resolve => {
            if (current_app.floaty_msg_finished_flag === 1) return resolve();

            timeRecorder("wait_for_floaty_msg_finished");
            let max_wait_duration = (+config.floaty_result_countdown + 3) * 1000;
            let timedOut = () => timeRecorder("wait_for_floaty_msg_finished", "load") > max_wait_duration;

            debugInfo("等待Floaty消息结束等待信号");
            let interval = setInterval(function () {
                if (current_app.floaty_msg_finished_flag === 1) {
                    resolve();
                    return clearInterval(interval);
                }
                if (timedOut()) {
                    current_app.floaty_msg_finished_flag = 1;
                    debugInfo(["放弃等待Floaty消息结束信号", ">等待结束信号超时"], 3);
                    resolve();
                    return clearInterval(interval);
                }
                // debugInfo("继续等待Floaty消息结束等待信号"); //// TEST ////
            }, 200);
        }));

        // tool function(s) //

        function closeAFWindows() {
            debugInfo("关闭全部蚂蚁森林相关页面");

            let afTitle = current_app.kw_af_title;
            let rankListTitle = current_app.kw_rank_list_title;
            let forestPage = () => sel.pickup([/浇水|发消息/, {className: "Button"}]);
            let {kw_login_with_new_user} = current_app;

            let max_close_time = 10000;
            timeRecorder("close_af_windows");
            while (afTitle() || rankListTitle() || forestPage() || kw_login_with_new_user()) {
                jumpBackOnce("forcibly_back");
                sleep(400);
                if (timeRecorder("close_af_windows", "load") >= max_close_time) break;
            }
            debugInfo(max_close_time > 0 ? ["相关页面关闭完毕", "保留当前支付宝页面"] : "页面关闭可能没有成功");
        }

        function removeSpringboardIfNeeded() {
            if (config.app_launch_springboard === "ON") {
                if (!current_app.alipay_closed_flag) return debugInfo(["跳过启动跳板移除操作", ">支付宝未关闭"]);

                let {init_autojs_state, current_autojs_app_name, isAutojsForeground, isAutojsHomepage} = current_app;
                let {init_foreground, init_homepage, init_log_page, init_settings_page} = init_autojs_state;
                let doubleBack = () => ~back() && ~back() && sleep(400);
                let restoreSpringboard = (symbol) => {
                    let message = "恢复跳板" + surroundWith(symbol[0].toUpperCase() + symbol.slice(1), " ") + "页面";
                    debugInfo(message);
                    messageAction(message, null, 1);
                    return app.startActivity(symbol);
                };

                if (!waitForAction(isAutojsForeground, 9000, 300)) {
                    return debugInfo("等待返回" + current_autojs_app_name + "应用页面超时");
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
        if (current_app.init_screen_on_state) return debugInfo("无需关闭屏幕");

        __global__.pause_screen_off_state_monitor = true;
        debugInfo("尝试关闭屏幕");

        try {
            if (screenOffByKeyCode()) return debugInfo("关闭屏幕成功") || true;
        } catch (e) {
            messageAction(e.message, 4, 1, 0, "both");
        }

        return Promise.resolve()
            .then(screenOffByModifyingAndroidSettingsProviderAsync)
            .catch((e) => messageAction(e.message, 4, 0, 1, 1))
            .then((result) => result ? debugInfo("关闭屏幕成功") : debugInfo("关闭屏幕失败", 3));

        // tool function (s) //

        function screenOffByKeyCode() {
            let strategy_name = "模拟电源按键";
            debugInfo("尝试策略: " + strategy_name);

            if (!checkBugModel()) return false;

            timeRecorder("SCREEN_OFF_TIMEOUT");
            let keycode_name = "26";
            if (keycode(keycode_name, "no_err_msg")) {
                debugInfo("策略执行成功");
                debugInfo("用时: " + timeRecorder("SCREEN_OFF_TIMEOUT", "load", 1000, [1], "秒"));
                return true;
            }
            debugInfo(["策略执行失败", ">按键模拟失败", ">键值: " + keycode_name]);
            return false;

            // tool function(s) //

            function checkBugModel() {
                let device_brand = device.brand;
                let keycode_power_bug_versions = [/[Mm]eizu/]; // poor guy, don't cry... :sweat_smile:
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
                    let interval = setInterval(function () {
                        if (!device.isScreenOn()) {
                            debugInfo("策略执行成功");
                            debugInfo("用时: " + timeRecorder("settings_provider_params", "load", 1000, [1], "秒"));
                            resolve(screen_off_result = true);
                            return clearInterval(interval);
                        }
                        if (timedOut()) {
                            debugInfo([
                                "策略执行失败",
                                ">等待屏幕关闭时间已达阈值",
                                ">有关此策略更多详细信息",
                                ">可使用并参阅以下工具:",
                                ">" + files.path("./Tools/Auto.js_Write_Settings_Permission_Helper.js")
                            ]);
                            resolve(false);
                            return clearInterval(interval);
                        }
                        // debugInfo("继续等待策略执行结果"); //// TEST ////
                    }, 200);
                });
            }
        }
    }

    function cleanRankListCaptPool() {
        try {
            debugInfo("清理排行榜截图样本池");
            let pool = current_app.rank_list_capt_diff_check_pool || [];
            while (pool.length) pool.shift().recycle();
        } catch (e) {
            messageAction(e.message, 4, 1, 0, "both");
        }
    }
}

// tool function(s) //

function endAlipay() {
    debugInfo("关闭支付宝");
    let alipay_pkg_name = current_app.package_name;
    if (!killThisApp(alipay_pkg_name, {shell_acceptable: true})) return debugInfo("支付宝关闭超时", 3);
    debugInfo("支付宝关闭完毕");
    current_app.alipay_closed_flag = true;
}

function exitNow() {
    messageAction(current_app.quote_name + "任务结束", 1, 0, 0, "both_n");
    return ui.post(exit);
}

function unlock() {
    unlockMain();
    current_app.device_ever_unlocked_flag = true;

    // main function(s) //

    function unlockMain() {
        if (!unlock_module) {
            messageAction("自动解锁功能无法使用", 3);
            return messageAction("解锁模块未导入", 3, 0, 1);
        }
        if (!__global__.is_init_screen_on && !config.auto_unlock_switch) {
            messageAction("脚本无法继续", 4, 0, 0, "up");
            messageAction("屏幕关闭且自动解锁功能未开启", 9, 1, 1, 1);
        }
        if (unlock_module.isUnlocked()) {
            __global__._monster_$_no_need_unlock_flag = true;
            return debugInfo("无需解锁");
        }
        unlock_module.unlock();
    }
}

function setVolKeysListener() {
    debugInfo("设置音量键监听器");
    threads.start(function () {
        events.removeAllKeyDownListeners("volume_up");
        events.removeAllKeyDownListeners("volume_down");
        events.observeKey();
        events.onKeyDown("volume_up", function (event) {
            messageAction("强制停止所有脚本", 4, 0, 0, "up");
            messageAction("用户按下'音量加/VOL+'键", 4, 0, 1, 1);
            threads.shutDownAll();
            engines.stopAllAndToast();
        });
        events.onKeyDown("volume_down", function (event) {
            messageAction("强制停止当前脚本", 3, 1, 0, "up");
            messageAction("用户按下'音量减/VOL-'键", 3, 0, 1, 1);
            threads.shutDownAll();
            my_engine.forceStop();
        });
    });
}

function setGlobalWaitingMonitors() {
    __global__._monster_$_global_monitor_waiting_signal = 0; // counter

    let monitors = [{
        switch: "phone_call_state_monitor_switch",
        condition: () => !__global__.pause_phone_call_state_monitor && phoneCallingState() !== currentPhoneCallState(),
        onRelease: () => {
            debugInfo("前置\"支付宝\"应用");
            app.launchPackage(current_app.package_name || "com.eg.android.AlipayGphone");
        },
        description: "通话状态",
        timeout_or_times: "2 hr",
    }, {
        condition: () => !__global__.pause_screen_off_state_monitor && current_app.device_ever_unlocked_flag && !device.isScreenOn(),
        onRelease: () => {
            current_app.swipe_up_waiting_signal = true;
            __global__._monster_$_global_monitor_waiting_signal--;
            unlock();
            current_app.swipe_up_waiting_signal = false;
            __global__._monster_$_global_monitor_waiting_signal++;
        },
        onTrigger: () => {
            if (current_app.may_exit_when_screen_off_flag) {
                messageAction("允许脚本提前退出", 4, 1, 0, "up");
                messageAction("相关标识已激活且屏幕已关闭", 8, 0, 1, 1);
            }
        },
        description: "屏幕关闭",
        timeout_or_times: "2 min",
    }];

    monitors.forEach((o) => {
        let {condition, description, timeout_or_times, onTrigger, onRelease} = o;
        description = surroundWith(description);
        if (typeof timeout_or_times === "string") {
            if (timeout_or_times.match(/h((ou)?rs?)?/)) timeout_or_times = timeout_or_times.match(/\d+/)[0] * 3600000;
            else if (timeout_or_times.match(/m(in(utes?))?/)) timeout_or_times = timeout_or_times.match(/\d+/)[0] * 60000;
            else if (timeout_or_times.match(/s(ec(conds?))?/)) timeout_or_times = timeout_or_times.match(/\d+/)[0] * 1000;
            else if (timeout_or_times.match(/m(illi)?s(ec(conds?))?/)) timeout_or_times = timeout_or_times.match(/\d+/)[0] * 1;
        } else {
            timeout_or_times = +timeout_or_times;
            if (timeout_or_times < 1000) timeout_or_times *= 1000; // take as seconds
            if (!timeout_or_times) timeout_or_times = Infinity; // endless monitoring
        }

        if (o.switch && !config[o.switch]) return debugInfo(description + "事件监测未开启");
        debugInfo("开启" + description + "事件监测");

        threads.start(function () {
            let triggered_flag = false;
            let timed_out_flag = false;
            while (sleep(200) || true) {
                while (condition()) {
                    if (!triggered_flag) {
                        timeRecorder("global_monitor_" + description, "save");
                        messageAction("触发" + description + "事件", 1, 1, 0, "up_dash");
                        triggered_flag = true;
                        __global__._monster_$_global_monitor_waiting_signal++;
                        messageAction("等待事件解除" + (
                            timeout_or_times !== Infinity ? " (最多" + millisecondToStr(timeout_or_times, [2]) + ")" : ""
                        ), 1, 0, 0, "dash");
                        onTrigger && onTrigger();
                    }
                    sleep(200);
                    if (timeRecorder("global_monitor_" + description, "load") >= timeout_or_times) {
                        timed_out_flag = true;
                        break;
                    }
                }
                if (triggered_flag) {
                    if (timed_out_flag) {
                        messageAction("强制停止脚本", 4, 1, 0, "up");
                        messageAction(description + "事件解除超时", 9, 1, 1, 1);
                    } else {
                        messageAction("解除" + description + "事件", 1, 0, 0, "up_dash");
                        messageAction("解除用时: " + timeRecorder(
                            "global_monitor_" + description, "load", 1000, [1], "秒"), 1, 0, 1, "dash"
                        );
                        onRelease && onRelease();
                    }
                    triggered_flag = false;
                    __global__._monster_$_global_monitor_waiting_signal--;
                }
            }
        });
    });

    // tool function(s) //

    function millisecondToStr(num, fixed) {
        let fixNum = (num) => {
            if (typeof fixed !== "undefined" && fixed !== null) num = num.toFixed(+fixed);
            return typeof fixed === "object" ? +num : num;
        };
        if (num / 1000 < 1) return fixNum(num) + "毫秒";
        num /= 1000;
        if (num / 60 < 1) return fixNum(num) + "秒";
        num /= 60;
        if (num / 60 < 1) return fixNum(num) + "分钟";
        num /= 60;
        if (num / 24 < 1) return fixNum(num) + "小时";
        num /= 24;
        return fixNum(num) + "天";
    }

    function currentPhoneCallState() {
        let call_state = storage_af_cfg.get("config", {}).phone_call_state_idle_value;

        if (typeof call_state === "undefined") {
            call_state = phoneCallingState();
            let storage_call_state = storage_af_cfg.get("phone_call_state_data", []);
            let storage_data_enough = checkStorageDataEnough(storage_call_state);
            if (storage_data_enough !== undefined) {
                call_state = storage_data_enough;
                debugInfo(["通话状态数据可信", "将当前数据应用于配置文件", "数据值: " + call_state]);
                storage_af_cfg.remove("phone_call_state_data");
                storage_af_cfg.put("config", Object.assign(
                    {},
                    storage_af_cfg.get("config", {}),
                    {phone_call_state_idle_value: call_state}
                ));
            } else {
                storage_af_cfg.put("phone_call_state_data", storage_call_state.concat([call_state]));
                debugInfo(["已存储通话状态数据", "当前共计数据: " + storage_af_cfg.get("phone_call_state_data", []).length + "组"]);
            }
        }

        return call_state;

        // tool function(s) //

        function checkStorageDataEnough(arr) {
            let threshold = 5;
            let len = arr.length;
            if (len < threshold) return;

            let tmp = [];
            // arr~: [0, 0, 0, 2, 0, 0]
            for (let i = 0; i < len; i += 1) {
                let state = arr[i];
                if (tmp[state]) tmp[state]++;
                else tmp[state] = 1;
                if (tmp[state] >= threshold) return state;
            }
        }
    }
}

function showRunningCountdownIfNeeded() {
    if (!__global__.is_init_screen_on) return debugInfo(["跳过\"运行前提示\"", ">屏幕未亮起"]);
    if (!unlock_module.isUnlocked()) return debugInfo(["跳过\"运行前提示\"", ">设备未解锁"]);
    if (!config.prompt_before_running_switch) return debugInfo("\"运行前提示\"未开启");
    if (my_engine.execArgv.instant_run_flag) return debugInfo(["跳过\"运行前提示\"", ">检测到\"立即运行\"引擎参数"]);

    let move_on_signal = false;
    let thread_running_countdown = threads.start(function () {
        let count_down_second = +config.prompt_before_running_countdown_seconds + 1;

        let thread_set_countdown = null;
        let countdown_stop_signal = false;

        let diag = dialogs.builds([
            "运行提示", "\n即将在 " + count_down_second + " 秒内运行" + surroundWith("蚂蚁森林") + "任务\n",
            ["推迟运行", "warn_btn_color"],
            ["放弃任务", "caution_btn_color"],
            ["立即开始  [ " + count_down_second + " ]", "attraction_btn_color"],
            1,
        ]);
        diag.setOnKeyListener(
            function onKey(diag, keyCode, event) {
                countdown_stop_signal = true;
                thread_set_countdown && thread_set_countdown.interrupt();
                pauseCountdownDialog(100);
                return keyCode === android.view.KeyEvent.KEYCODE_BACK;
            }
        ); // to prevent dialog from being dismissed by pressing "back" button (usually by accident)
        diag.on("positive", () => {
            diag.dismiss();
            debugInfo("点击\"" + diag.getActionButton("positive").replace(/ *\[ *\d+ *] */, "") + "\"按钮");
            actionPositive();
        });
        diag.on("negative", () => {
            debugInfo("点击\"" + diag.getActionButton("negative") + "\"按钮");
            actionNegative();
        });
        diag.on("neutral", () => {
            debugInfo("点击\"" + diag.getActionButton("neutral") + "\"按钮");
            actionNeutral();
        });
        diag.show();

        thread_set_countdown = threads.start(function () {
            while (--count_down_second) {
                if (countdown_stop_signal) return debugInfo("检测到计时器停止监测信号");
                let content_text = diag.getContentView().getText().toString();
                diag.setContent(content_text.replace(/\d+/, count_down_second));
                let button_text = diag.getActionButton("positive").replace(/ *\[ *\d+ *]$/, "");
                diag.setActionButton("positive", button_text + "  [ " + count_down_second + " ]");
                sleep(1000);
            }
            diag.dismiss();
            debugInfo(["计时器已超时", "自动启动任务"]);
            actionPositive();
        });

        // tool function(s) //

        function actionPositive() {
            return countdown_stop_signal = move_on_signal = true;
        }

        function actionNegative() {
            countdown_stop_signal = true;
            thread_set_countdown && thread_set_countdown.interrupt();

            let no_tasks_scheduled_flag = !timers.queryTimedTasks({
                path: current_app.current_file_path || files.path("./Ant_Forest_Launcher.js"),
            }).length;
            let diag_cancel = dialogs.builds([
                no_tasks_scheduled_flag ? ["注意", "title_caution_color"] : ["提示", "title_default_color"],
                no_tasks_scheduled_flag
                    ? ["当前未设置任何" + surroundWith("蚂蚁森林") + "定时任务\n\n确认要放弃本次任务吗", "content_warn_color"]
                    : ["确认要放弃本次任务吗", "content_default_color"],
                0, "返回", ["确认放弃任务", "caution_btn_color"], 1,
            ]);
            diag_cancel.on("negative", () => diag_cancel.dismiss());
            diag_cancel.on("positive", () => {
                messageAction("放弃" + surroundWith("蚂蚁森林") + "任务", 1, 1, 0, "both");
                threads.shutDownAll();
                diag_cancel.dismiss();
                diag.dismiss();
                exit();
            });
            diag_cancel.show();

            pauseCountdownDialog();
        }

        function actionNeutral() {
            countdown_stop_signal = true;
            thread_set_countdown && thread_set_countdown.interrupt();

            let working_flag = false;

            if (config.prompt_before_running_postponed_minutes !== 0) {
                return setPostponedTaskNow(config.prompt_before_running_postponed_minutes);
            }

            let map = (() => {
                let o = {};
                config.prompt_before_running_postponed_minutes_default_choices.forEach(num => o[num] = num + " min");
                return o;
            })();
            let map_keys = Object.keys(map);

            let selected_index = null;
            let checkbox_checked_flag = false;

            let diag_postponed = dialogs.builds([
                "设置任务推迟时间", "",
                0, "返回", ["确定", "warn_btn_color"],
                1, "记住设置且不再提示",
            ], {
                items: map_keys.slice().map(value => map[value]),
                itemsSelectMode: "single",
                itemsSelectedIndex: map_keys.indexOf((config.prompt_before_running_postponed_minutes_user).toString()),
            });
            diag_postponed.on("check", checked => checkbox_checked_flag = !!checked);
            diag_postponed.on("single_choice", (index, value, dialog) => {
                selected_index = +index;
                let user_value = +map_keys[selected_index];
                storage_af_cfg.put("config", Object.assign(
                    {},
                    storage_af_cfg.get("config", {}),
                    {prompt_before_running_postponed_minutes_user: user_value}
                ));
                config.prompt_before_running_postponed_minutes_user = user_value;
            });
            diag_postponed.on("negative", () => diag_postponed.dismiss());
            diag_postponed.on("positive", () => {
                if (checkbox_checked_flag) {
                    let put_value = config.prompt_before_running_postponed_minutes_user;
                    storage_af_cfg.put("config", Object.assign(
                        {},
                        storage_af_cfg.get("config", {}),
                        {prompt_before_running_postponed_minutes: put_value}
                    ));
                    config.prompt_before_running_postponed_minutes = put_value;
                }

                setPostponedTaskNow(+map_keys[selected_index], diag_postponed);
            });
            diag_postponed.show();

            pauseCountdownDialog();

            // tool function(s) //

            function setPostponedTaskNow(postponed_minute, diag_postponed) {
                working_flag || threads.start(function () {
                    working_flag = true;

                    diag_postponed && diag_postponed.dismiss();
                    diag.dismiss();

                    let task_msg = surroundWith("蚂蚁森林") + "任务";
                    messageAction("推迟" + task_msg, 1, 0, 0, "up");
                    messageAction("推迟时长: " + postponed_minute + "min", 1, 0, 0, 1);
                    let toast_msg = task_msg + "推迟 " + postponed_minute + " 分钟";
                    messageAction(toast_msg, null, 1);

                    let next_launch_time = +new Date() + postponed_minute * 60000;

                    let task = timers.addDisposableTask({
                        path: current_app.current_file_path || files.path("./Ant_Forest_Launcher.js"),
                        date: next_launch_time,
                    });
                    storage_af.put("next_auto_task", {
                        task_id: task.id,
                        timestamp: next_launch_time,
                        type: "postponed",
                    });
                    exit();
                });
            }
        }

        function pauseCountdownDialog(interval) {
            interval = typeof interval === "undefined" ? 800 : interval;
            setTimeout(function () {
                let content_text = diag.getContentView().getText().toString();
                diag.setContent(content_text.replace(/.*(".+".*任务).*/, "请选择$1运行选项"));
                let button_text = diag.getActionButton("positive").replace(/ *\[ *\d+ *]$/, "");
                diag.setActionButton("positive", button_text);
            }, interval);
        }
    });

    if (!waitForAction(() => move_on_signal, 5 * 60000)) {
        thread_running_countdown.interrupt();
        messageAction("强制结束脚本", 4, 1);
        messageAction("等待运行前对话框操作超时", 9, 1, 0, 1);
    }
}

function setInsuranceTaskIfNeeded() {
    if (!config.timers_switch) return debugInfo("定时循环功能未开启");
    if (!config.timers_self_manage_switch) return debugInfo("定时任务自动管理未开启");
    if (!config.timers_insurance_switch) return debugInfo("意外保险未开启");
    if (my_engine.execArgv.no_insurance_flag) return debugInfo(["跳过\"意外保险\"设置", ">检测到\"无需保险\"引擎参数"]);

    let storage_task_ids = storage_af.get("insurance_tasks", []).filter(id => timers.getTimedTask(id));
    let continuous_times = +storage_af.get("insurance_tasks_continuous_times", 0) + 1;
    storage_af.put("insurance_tasks_continuous_times", continuous_times);

    let limit = config.timers_insurance_max_continuous_times;
    if (continuous_times > limit) {
        debugInfo(["本次会话不再设置保险定时任务", ">任务已达最大连续次数限制: " + limit]);
        return cleanAllInsuranceTasks();
    }

    let getNextLaunchTime = () => +new Date() + config.timers_insurance_interval * 60000;
    let task = timers.addDisposableTask({
        path: current_app.current_file_path || files.path("./Ant_Forest_Launcher.js"),
        date: getNextLaunchTime(),
    });

    storage_af.put("insurance_tasks", storage_task_ids.concat([task.id]));
    debugInfo(["已设置意外保险定时任务:", "任务ID: " + task.id]);

    if (storage_task_ids.length) {
        debugInfo("已移除旧意外保险定时任务:");
        storage_task_ids.forEach(id => timers.removeTimedTask(id));
        debugInfo("任务ID: " + (storage_task_ids.length > 1 ? "[ " + storage_task_ids.join(", ") + " ]" : storage_task_ids[0]));
    }

    current_app.thread_auto_delay_insurance_task = threads.start(function () {
        setInterval(function () {
            task.setMillis(getNextLaunchTime());
            timers.updateTimedTask(task);
        }, 10000);
    });
}

function checkBlackTimestamp(timestamp) {
    if (typeof timestamp === "undefined") return true;
    if (timestamp === Infinity) return true;

    let now = new Date();
    let duration_ms = timestamp - +now;
    if (duration_ms <= 0) return;

    if (!config.console_log_details && !config.debug_info_switch) return true;

    let duration_date_obj = new Date(Date.parse(now.toDateString()) + duration_ms);
    let padZero = num => ("0" + num).slice(-2);
    let dd = ~~(duration_ms / 1000 / 3600 / 24);
    let hh = duration_date_obj.getHours();
    let mm = duration_date_obj.getMinutes();
    let ss = duration_date_obj.getSeconds();
    let dd_str = dd ? dd + "天" : "";
    let hh_str = hh ? padZero(hh) + "时" : "";
    let mm_str = hh || mm ? padZero(mm) + "分" : "";
    let ss_str = (hh || mm ? padZero(ss) : ss) + "秒";
    return dd_str + hh_str + mm_str + ss_str + "后解除";
}

function setScreenPixelData(refresh_flag) {
    [WIDTH, HEIGHT, USABLE_HEIGHT, cX, cY, screen_orientation] = (function () {
        let {WIDTH, HEIGHT, USABLE_HEIGHT, cX, cY, screen_orientation} = getDisplayParams();
        if (refresh_flag) debugInfo("重新获取屏幕宽高数据");
        if (!WIDTH || !HEIGHT) messageAction("获取屏幕宽高数据失败", 9, 1, 0, 1);
        if (__global__._monster_$_no_need_unlock_flag) debugInfo(["屏幕宽高: " + WIDTH + " × " + HEIGHT, "可用屏幕高度: " + USABLE_HEIGHT]);
        return [WIDTH, HEIGHT, USABLE_HEIGHT, cX, cY, screen_orientation];
    }());
}

function checkModules() {
    try {
        storage_af_cfg = require("./Modules/MODULE_STORAGE").create("af_cfg");
        Object.assign(
            config,
            require("./Modules/MODULE_DEFAULT_CONFIG").af || {},
            storage_af_cfg.get("config", {})
        );
        __global__._monster_$_debug_info_flag = config.debug_info_switch && config.message_showing_switch;
        unlock_module = new (require("./Modules/MODULE_UNLOCK"));
        __global__.is_init_screen_on = unlock_module.is_screen_on;
        debugInfo("接入\"af_cfg\"存储", "Up");
        debugInfo("整合代码配置与本地配置");
        debugInfo("成功导入解锁模块");

        storage_af = require("./Modules/MODULE_STORAGE").create("af");
        debugInfo("接入\"af\"存储");
        if (!storage_af.get("config_prompted")) promptConfig();
    } catch (e) {
        config.message_showing_switch = config.debug_info_switch = true;
        if (!__global__._monster_$_debug_info_flag) {
            __global__._monster_$_debug_info_flag = true;
            debugInfo("开发者测试模式已自动开启", 3);
        }
        debugInfo(e.message);
        messageAction("模块导入功能异常", 3, 0, 0, "up");
    }
}

function checkTasksQueue() {
    let queue_flag = false;
    timeRecorder("queue_beginning", "save");
    my_engine = (engines || {}).myEngine() || {};
    if (typeof my_engine.execArgv === "undefined") my_engine.execArgv = {};
    let my_engine_id = my_engine.id;
    let bomb_flag = false;
    let checkExclusiveTasks = () => {
        let filtered_tasks = engines.all()
            .filter(e => e.getTag("exclusive_task") && e.id < my_engine_id)
            .sort((a, b) => a.id > b.id);
        if (filtered_tasks.length) return filtered_tasks;
    };
    let checkBomb = () => {
        return engines.all().filter((e) => {
            return e.getTag("exclusive_task") === "af"
                && my_engine_id > e.id
                && +new Date() - e.getTag("launch_timestamp") < config.min_bomb_interval_global;
        }).length;
    };
    try {
        my_engine.setTag("exclusive_task", "af");
        my_engine.setTag("launch_timestamp", +new Date());
        if (typeof my_engine.execArgv === "undefined") throw Error("抛出本地异常: Engines模块功能无效");
        if (checkBomb()) {
            bomb_flag = true;
            messageAction("脚本因安全限制被强制终止", 3, 0, 0, "both");
            exit();
        }
        let queuing_ex_tasks_check = checkExclusiveTasks();
        if (queuing_ex_tasks_check) {
            let queue_length = queuing_ex_tasks_check.length;
            debugInfo("排他性任务排队中: " + queue_length + "项");
            let max_queue_time = config.max_queue_time_global * queue_length;
            let queue_force_stop_timestamp = +new Date() + max_queue_time * 60000;
            debugInfo("已设置最大排队时间: " + max_queue_time + "分钟");
            while (1) {
                let filtered_tasks = checkExclusiveTasks();
                if (!filtered_tasks) break;
                queue_flag = true;
                sleep(1000);
                if (queue_force_stop_timestamp <= +new Date()) {
                    filtered_tasks[0].forceStop();
                    debugInfo(["强制停止最早一项任务", ">" + "已达最大排队等待时间"]);
                }
            }
        }
    } catch (e) {
        if (queue_flag) return;
        if (bomb_flag) {
            return sleep(10000);
        }
        let error_msg = "此版本Engines模块功能异常";
        messageAction(error_msg, 3);
        debugInfo(e.message);
        __global__.engines_not_supported_flag = true;
        debugInfo("Engines支持性标记: false")
    }
    queue_flag && debugInfo("任务排队用时: " + timeRecorder("queue_beginning", "load", 1000, [1], " 秒"), "Up");
}

function checkVersions() {
    let current_autojs_package = "";
    try {
        current_autojs_package = current_app.current_autojs_package = context.packageName;
        current_app.current_autojs_app_name = "Auto.js" + (current_autojs_package.match(/pro/) ? " Pro" : "")
    } catch (e) {
        messageAction("无法获取当前Auto.js包名", 3);
        messageAction("Context对象无效", 3, 0, 1);
    }
    let current_autojs_version = getVerName(current_autojs_package) || 0;
    debugInfo("Auto.js版本: " + (current_autojs_version || "未知版本"));
    debugInfo("项目版本: " + (() => {
        try {
            return "v" + files.read("./Ant_Forest_Launcher.js").match(/version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/)[0].slice(8);
        } catch (e) {
            return "未知版本";
        }
    })());

    checkSdk();

    let threads_functional_flag = typeof threads !== "undefined";

    if (threads_functional_flag) {
        let thread_check_bug_vers = threads.start(checkBugVersions);
        thread_check_bug_vers.join();
    } else checkBugVersions();

    // tool function(s) //

    function checkSdk() {
        let current_sdk_ver = +shell("getprop ro.build.version.sdk").result;
        debugInfo("安卓系统SDK版本: " + current_sdk_ver);
        if (current_sdk_ver >= 24) return true;
        messageAction("脚本无法继续", 4, 0, 0, "up");
        messageAction("安卓系统版本低于7.0", 9, 1, 1, 1);
    }

    function checkBugVersions() {
        let bug_code_map = {
            failed: "版本信息获取失败\n不建议使用此版本运行项目",
            ab_cwd: "cwd()方法功能异常",
            ab_engines_setArguments: "engines.setArguments()功能异常",
            ab_find_forEach: "UiSelector.find().forEach()方法功能异常",
            ab_floaty: "Floaty模块异常",
            ab_floaty_rawWindow: "floaty.rawWindow()功能异常",
            ab_relative_path: "相对路径功能异常",
            ab_setGlobalLogConfig: "console.setGlobalLogConfig()功能异常",
            ab_SimpActAuto: "SimpleActionAutomator模块异常",
            ab_inflate: "ui.inflate()方法功能异常",
            ab_uiSelector: "UiSelector模块功能异常",
            ab_ui_layout: "图形配置页面布局异常",
            crash_autojs: "脚本运行后导致Auto.js崩溃",
            crash_ui_call_ui: "ui脚本调用ui脚本会崩溃",
            crash_ui_settings: "图形配置页面崩溃",
            dislocation_floaty: "Floaty模块绘制存在错位现象",
            dialogs_event: "Dialogs模块事件失效",
            forcibly_update: "强制更新",
            na_login: "无法登陆Auto.js账户",
            press_block: "press()方法时间过短时可能出现阻塞现象",
            un_cwd: "不支持cwd()方法及相对路径",
            un_engines: "不支持Engines模块",
            un_execArgv: "不支持Engines模块的execArgv对象",
            un_inflate: "不支持ui.inflate()方法",
            un_relative_path: "不支持相对路径",
            un_runtime: "不支持runtime参数",
            un_view_bind: "不支持view对象绑定自定义方法",
            not_full_function: "此版本可能未包含所需全部功能",
        };

        let bugs_check_result = checkBugs(current_autojs_version);
        if (bugs_check_result === 0) return debugInfo("Bug版本检查: 正常");
        if (bugs_check_result === "") return debugInfo("Bug版本检查: 未知");
        bugs_check_result = bugs_check_result.map(bug_code => "\n-> " + (bug_code_map[bug_code] || "\/*无效的Bug描述*\/"));
        debugInfo("Bug版本检查: 确诊");
        let bug_content = "脚本可能无法正常运行\n建议更换Auto.js版本\n\n当前版本:\n-> " + (current_autojs_version || "/* 版本检测失败 */") +
            "\n\n异常详情:" + bugs_check_result.join();

        try {
            let known_dialogs_bug_versions = ["Pro 7.0.3-1"];
            if (~known_dialogs_bug_versions.indexOf(current_autojs_version)) throw Error();

            let diag_bug = dialogs.build({
                title: "Auto.js版本异常提示",
                content: bug_content,
                neutral: "为何出现此提示",
                neutralColor: "#03a6ef",
                negative: "退出",
                negativeColor: "#33bb33",
                positive: "尝试继续",
                positiveColor: "#ee3300",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag_bug.on("neutral", () => {
                let diag_bug_reason = dialogs.build({
                    title: "什么是版本异常",
                    content: "开发者提供的脚本无法保证所有Auto.js版本均正常运行\n\n" +
                        "您看到的异常提示源于开发者提供的测试结果",
                    positive: "我知道了",
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                });
                diag_bug_reason.on("positive", () => diag_bug_reason.dismiss());
                diag_bug_reason.show();
            });
            diag_bug.on("negative", () => ~diag_bug.dismiss() && exit());
            diag_bug.on("positive", () => {
                debugInfo("用户选择了尝试运行Bug版本");
                diag_bug.dismiss();
            });
            diag_bug.show();
        } catch (e) {
            if (threads_functional_flag) {
                threads.start(function () {
                    events.removeAllKeyDownListeners("volume_up");
                    events.removeAllKeyDownListeners("volume_down");
                    events.observeKey();
                    events.onKeyDown("volume_down", function (event) {
                        debugInfo("用户按下音量减键");
                        debugInfo("尝试点击确定按钮");
                        clickAction(textMatches(/OK|确定/), "widget");
                        messageAction("脚本已停止", 4, 1);
                        messageAction("用户终止运行", 4, 0, 1);
                        exit();
                    });
                });
            }
            debugInfo(["Dialogs模块功能异常", "使用Alert()方法替代"]);
            if (threads_functional_flag) {
                alert(bug_content + "\n\n" +
                    "按'确定/OK'键尝试继续执行\n" +
                    "按'音量减/VOL-'键停止执行"
                );
                events.removeAllKeyDownListeners("volume_up");
                events.removeAllKeyDownListeners("volume_down");
            } else {
                alert(bug_content + "\n\n" +
                    "按'确定/OK'键停止执行"
                );
                exit();
            }
        }

        // tool function(s) //

        /**
         * @return {string[]|number|string} -- strings[]: bug codes; 0: normal; "": unrecorded
         */
        function checkBugs(ver_name) {
            ver_name = ver_name || "0";

            // version <= 3.0.0 Alpha20
            if (ver_name.match(/^3\.0\.0 Alpha([1-9]|1\d|20)?$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "crash_ui_settings", "not_full_function"];
            }

            // 3.0.0 Alpha21 <= version <= 3.0.0 Alpha36
            if (ver_name.match(/^3\.0\.0 Alpha(2[1-9]|3[0-6])$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // 3.0.0 Alpha37 <= version <= 3.0.0 Alpha41
            if (ver_name.match(/^3\.0\.0 Alpha(3[7-9]|4[0-1])$/)) {
                return ["ab_cwd", "un_relative_path", "un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // version >= 3.0.0 Alpha42 || version ∈ 3.0.0 Beta[s] || version <= 3.1.0 Alpha5
            if (ver_name.match(/^((3\.0\.0 ((Alpha(4[2-9]|[5-9]\d))|(Beta\d?)))|(3\.1\.0 Alpha[1-5]?))$/)) {
                return ["un_inflate", "un_runtime", "un_engines", "not_full_function"];
            }

            // version >= 3.1.0 Alpha6 || version <= 3.1.1 Alpha2
            if (ver_name.match(/^((3\.1\.0 (Alpha[6-9]|Beta))|(3\.1\.1 Alpha[1-2]?))$/)) {
                return ["un_inflate", "un_engines", "not_full_function"];
            }

            // 3.1.1 Alpha3 <= version <= 3.1.1 Alpha4:
            if (ver_name.match(/^3\.1\.1 Alpha[34]$/)) {
                return ["ab_inflate", "un_engines", "not_full_function"];
            }

            // version >= 3.1.1 Alpha5 || version -> 4.0.0/4.0.1 || version <= 4.0.2 Alpha6
            if (ver_name.match(/^((3\.1\.1 Alpha[5-9])|(4\.0\.[01].+)|(4\.0\.2 Alpha[1-6]?))$/)) {
                return ["un_execArgv", "ab_inflate", "not_full_function"];
            }

            // version >= 4.0.2 Alpha7 || version === 4.0.3 Alpha([1-5]|7)?
            if (ver_name.match(/^((4\.0\.2 Alpha([7-9]|\d{2}))|(4\.0\.3 Alpha([1-5]|7)?))$/)) {
                return ["dislocation_floaty", "ab_inflate", "not_full_function"];
            }

            // 4.1.0 Alpha3 <= version <= 4.1.0 Alpha4
            if (ver_name.match(/^4\.1\.0 Alpha[34]$/)) {
                return ["ab_SimpActAuto"];
            }

            // version === Pro 7.0.0-(1|2)
            if (ver_name.match(/^Pro 7\.0\.0-[12]$/)) {
                return ["ab_relative_path"];
            }

            // version === Pro 7.0.0-7 || version === Pro 7.0.1-0 || version === Pro 7.0.2-(0|3)
            if (ver_name.match(/^Pro 7\.0\.((0-7)|(1-0)|(2-[03]))$/)) {
                return ["crash_autojs"];
            }

            // other 4.0.x versions
            if (ver_name.match(/^4\.0\./)) {
                return ["not_full_function"];
            }

            // version === 4.1.0 Alpha(2|5)? || version ∈ 4.1.1
            // version === Pro 7.0.0-(4|6) || version === Pro 7.0.2-4
            // version === Pro 7.0.3-7 || version === Pro 7.0.4-1
            if (ver_name.match(/^((4\.1\.0 Alpha[25]?)|(4\.1\.1.+))$/) ||
                ver_name.match(/^Pro 7\.0\.((0-[46])|(2-4))$/) ||
                ver_name === "Pro 7.0.3-7" ||
                ver_name === "Pro 7.0.4-1"
            ) {
                return 0; // known normal
            }

            switch (ver_name) {
                case "0":
                    return ["failed"];
                case "4.0.3 Alpha6":
                    return ["ab_floaty", "ab_inflate", "not_full_function"];
                case "4.0.4 Alpha":
                    return ["dislocation_floaty", "un_view_bind", "not_full_function"];
                case "4.0.4 Alpha3":
                    return ["dislocation_floaty", "ab_ui_layout", "not_full_function"];
                case "4.0.4 Alpha4":
                    return ["ab_find_forEach", "not_full_function"];
                case "4.0.4 Alpha12":
                    return ["un_execArgv", "not_full_function"];
                case "4.0.5 Alpha":
                    return ["ab_uiSelector", "not_full_function"];
                case "Pro 7.0.0-0":
                    return ["na_login"];
                case "Pro 7.0.0-3":
                    return ["crash_ui_call_ui"];
                case "Pro 7.0.0-5":
                    return ["forcibly_update"];
                case "Pro 7.0.3-1":
                    return ["dialogs_event"];
                case "Pro 7.0.3-4":
                    return ["ab_setGlobalLogConfig"];
                case "Pro 7.0.3-5":
                    return ["ab_floaty_rawWindow"];
                case "Pro 7.0.3-6":
                    return ["ab_engines_setArguments", "press_block"];
                case "Pro 7.0.4-0":
                    return ["crash_ui_settings"];
                default:
                    return ""; // unrecorded version
            }
        }
    }
}

function checkEngines() {
    typeof device === "undefined" && messageAction("此版本Device模块功能无效", 3);

    let special_exec_list = {
        "collect_friends_list": speExecCollectFriendsList,
        "collect_current_account_name": speExecCollectCurrentAccountName,
    };

    if (__global__.engines_not_supported_flag) {
        messageAction("跳过\"执行特殊指令\"检查", 3);
        messageAction("Engines模块功能异常", 3, 0, 1);
    } else {
        let {special_exec_command} = my_engine.execArgv;
        if (special_exec_command) {
            if (!(special_exec_command in special_exec_list)) {
                messageAction("未知的执行命令参数:\n" + special_exec_command, null, 1);
                messageAction("脚本无法继续", 4, 0, 0, "up");
                messageAction("未知的执行命令参数", 4, 0, 1);
                messageAction(special_exec_command, 9, 0, 2, 1);
            }
            debugInfo("执行特殊指令: " + special_exec_command);
            special_exec_list[special_exec_command]();
            sleep(2000);
        }
    }
}

function promptConfig() {
    debugInfo("显示参数调整提示对话框");
    let no_longer_prompt_flag = false;
    let config_now_flag = 0;
    let prompt_config_thread = threads.start(function () {
        let diag = dialogs.builds(["参数调整提示", "settings_never_launched", 0, "跳过", "现在配置", 1, 1]);
        diag.on("check", checked => no_longer_prompt_flag = !!checked);
        diag.on("negative", () => {
            debugInfo("用户放弃配置");
            diag.dismiss();
        });
        diag.on("positive", () => {
            debugInfo("用户" + (no_longer_prompt_flag ? "已" : "没有") + "勾选\"不再提示\"");
            debugInfo("用户选择了\"现在配置\"");
            ++config_now_flag && diag.dismiss();
        });
        diag.show();
    });
    prompt_config_thread.join();
    no_longer_prompt_flag && storage_af.put("config_prompted", 1);
    if (config_now_flag) {
        //engines.execScriptFile("./Ant_Forest_Settings.js");
        runJsFile("Ant_Forest_Settings");
        storage_af.put("af_postponed", true);
        exit();
    }
}

function jumpBackOnce(forcibly_back_flag) {
    let kw_back_btn_common = current_app.kw_back_btn;
    let kw_back_btn_antui_id = type => sel.pickup(idMatches(/.*back.button/), "kw_back_btn_antui_id", type);
    let kw_back_btn_h5_id = type => sel.pickup(idMatches(/.*h5.(tv.)?nav.back/), "kw_back_btn_h5_id", type);
    let back_node = () => kw_back_btn_common() || kw_back_btn_antui_id() || kw_back_btn_h5_id();

    if (forcibly_back_flag || !back_node() || !clickAction(back_node(), "widget")) {
        debugInfo("模拟返回按键返回上一页");
        keycode(4, "double");
    }
}

function encodeURIParams(prefix, params) {
    let [_params, _data] = typeof prefix === "object" ? [prefix, ""] : [params, prefix.toString()];
    Object.keys(_params).forEach(key => {
        _data += (_data.match(/\?.+=/) ? "&" : "?") + key + "=" + (typeof _params[key] === "object" ? encodeURIParams(_params[key]) : encodeURI(_params[key]));
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
    let init_data = typeof init === "undefined" ? NaN : +init;
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

function cleanAllInsuranceTasks() {
    let old_id = storage_af.get("insurance_tasks", []);

    if (old_id.length) {
        debugInfo("已移除意外保险定时任务:");
        old_id.forEach(id => timers.removeTimedTask(id));
        debugInfo("任务ID: " + (old_id.length > 1 ? "[ " + old_id.join(", ") + " ]" : old_id[0]));
    }

    storage_af.remove("insurance_tasks");
    storage_af.put("insurance_tasks_continuous_times", 0);
}

function plans(operation_name, params) {
    params = params || {};

    let plans = {
        launch_af_homepage: {
            plans_data: [
                ["intent_with_params", launchAFHomepageByIntent, current_app.homepage_intent.common_browser_rich],
                ["click_af_btn_at_homepage", launchAFHomepageByClickAFBtnAtHomepage],
                ["search_by_keyword", launchAFHomepageBySearchKeyword, "蚂蚁森林小程序"],
            ],
            error_level: 4,
        },
        launch_rank_list: {
            plans_data: [
                ["intent_with_params", launchRankListByIntent, current_app.rank_list_intent],
                ["click_list_more_btn", launchRankListByClickListMoreBtn],
            ],
            error_level: 3,
        },
    }; // error_level: 0, 1, 3 - verbose, log and warn; 4 - throw Error()

    if (!(operation_name in plans)) return;

    let filtered_plans_data = plans[operation_name].plans_data;
    let exclude_plan_names = params.exclude || [];
    let include_plan_names = params.include || filtered_plans_data.map(plan_data => plan_data[0]);

    if (typeof exclude_plan_names === "string") exclude_plan_names = [exclude_plan_names];
    if (typeof include_plan_names === "string") include_plan_names = [include_plan_names];

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
            package_name: current_app.package_name,
            no_message_flag: true,
            condition_launch: () => {
                let condition_a = () => currentPackage() === current_app.package_name;
                let condition_c = () => current_app.kw_list_more_friends() || current_app.kw_af_home() || current_app.kw_wait_for_awhile();

                // return condition_a() || condition_b() || condition_c();
                return condition_a() || condition_c();
            },
            condition_ready: () => {
                let conditions_necessary = {
                    af_title_or_login: () => current_app.kw_af_title() || current_app.kw_login_btn(),
                };
                let conditions_optional = {
                    kw_function_buttons: current_app.kw_af_home,
                    kw_list_more_friends_btn: current_app.kw_list_more_friends,
                    kw_login_btn: current_app.kw_login_btn,
                };
                let keys_nec = Object.keys(conditions_necessary);
                for (let i = 0, len = keys_nec.length; i < len; i += 1) {
                    let key_nec = keys_nec[i];
                    let condition = conditions_necessary[key_nec];
                    if (typeof condition === "function" && !condition() ||
                        typeof condition === "object" && !condition.exists()
                    ) return debugInfo(["启动必要条件不满足", ">" + key_nec]);
                }
                debugInfo("已满足全部启动必要条件");

                let keys_opt = Object.keys(conditions_optional);
                for (let i = 0, len = keys_opt.length; i < len; i += 1) {
                    let key_opt = keys_opt[i];
                    let condition = conditions_optional[key_opt];
                    if (typeof condition === "function" && condition() ||
                        typeof condition === "object" && condition.exists()
                    ) return debugInfo(["已满足启动可选条件", ">" + key_opt]) || true;
                }
                debugInfo("需至少满足一个启动可选条件");
            },
            disturbance: () => {
                while (!waitForAction(() => __global__._monster_$_launch_ready_monitor_signal, 1000, 80)) {
                    clickAction(current_app.kw_reload_forest_page_btn());
                    clickAction(sel.pickup("打开", "kw_confirm_launch_alipay"));
                    dismissPermissionDialogsIfNeeded();
                }
            },
        }, params));
    }

    function launchAFHomepageByIntent(intent) {
        if (app.checkActivity(intent)) return launchAFHomepageWithTrigger(intent);
        debugInfo("Activity在设备系统中不存在", 3);
    }

    function launchAFHomepageByClickAFBtnAtHomepage() {
        if (!launchAlipayHomepage()) return;
        let kw_ant_forest_icon = type => sel.pickup("蚂蚁森林", "", type);
        if (!waitForAction(kw_ant_forest_icon, 1500, 80)) return;
        return launchAFHomepageWithTrigger(() => clickAction(kw_ant_forest_icon()));
    }

    function launchAFHomepageBySearchKeyword(input_text) {
        if (!launchAlipayHomepage()) return;

        if (!waitForAndClickAction(idMatches(/.*home.title.search.button/), 5000, 80, {click_strategy: "widget"})) return;

        let node_input_box = null;
        if (!waitForAction(() => node_input_box = sel.pickup(idMatches(/.*search.input.box/)), 5000, 80)) return;
        node_input_box.setText(input_text);
        waitForAction(() => sel.pickup(input_text), 3000, 80); // just in case

        let node_af_search_item = null;
        let setAFSearchItemNode = () => node_af_search_item = sel.pickup("蚂蚁森林");

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
            package_name: current_app.package_name,
            no_message_flag: true,
            condition_launch: () => true,
            condition_ready: () => {
                try {
                    let condition = () => {
                        let node_rank_list = current_app.kw_rank_list().findOnce();
                        return node_rank_list && node_rank_list.childCount() > 5;
                    };
                    return condition() && !waitForAction(() => !condition(), 500, 80);
                } catch (e) {
                    // nothing to do here
                }
            },
            disturbance: () => {
                while (!waitForAction(() => __global__._monster_$_launch_ready_monitor_signal, 1000, 80)) {
                    clickAction(sel.pickup("再试一次", "kw_rank_list_try_again"));
                    clickAction(sel.pickup("打开", "kw_confirm_launch_alipay"));
                }
            },
        }, params));
    }

    function launchRankListByIntent(intent) {
        if (app.checkActivity(intent)) return launchRankListWithTrigger(intent);
        debugInfo("Activity在设备系统中不存在", 3);
    }

    function launchRankListByClickListMoreBtn() {
        let kw_more_friends = current_app.kw_list_more_friends;
        let rank_list_review_flag = params.review_flag;

        if (rank_list_review_flag) {
            current_app.kw_back_btn() ? clickAction(current_app.kw_back_btn(), "widget") : keycode(4, "double");
        }

        if (!waitForAction(kw_more_friends, 3000)) return messageAction("定位\"查看更多好友\"超时", 3, 1, 0, 1);

        debugInfo("定位到\"查看更多好友\"按钮");

        let trigger = () => {
            if (!clickAction(kw_more_friends(), "widget") || !waitForAction(() => !kw_more_friends(), 800)) {
                debugInfo("备份方案点击\"查看更多好友\"");
                swipeInArea(kw_more_friends(), {
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
    let {kw_alipay_homepage, kw_back_btn, kw_close_btn} = current_app;

    return launchThisApp(current_app.package_name, Object.assign({
        app_name: "支付宝",
        no_message_flag: true,
        condition_ready: kw_alipay_homepage,
        disturbance: () => {
            while (!kw_alipay_homepage()) {
                dismissPermissionDialogsIfNeeded();
                let valid_node = kw_back_btn() || kw_close_btn();
                if (valid_node) clickAction(valid_node);
                sleep(valid_node ? 500 : 100);
            }
        },
    }, params));
}

function launchUserList(forcible_flag) {
    let {isInSwitchAccPage} = current_app;
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

    let is_main_user_name = user_name === accountNameConverter(current_app.user_account_name, "decrypt");

    let {
        logged_in_user_abbr_name,
        is_logged_in,
        is_in_list,
    } = getCurrentLoggedInUserInfoFromUserList() || {};

    debugInfo("检查账号列表");

    let account_log_ident_str = (is_main_user_name ? "主" : "") + "账户";

    if (logged_in_user_abbr_name) {
        let is_main_user_logged_in = is_main_user_name && is_logged_in;
        if (!current_app.init_logged_in_user_abbr_name) {
            current_app.init_logged_in_user_abbr_name = logged_in_user_abbr_name;
            debugInfo("记录初始登录账户缩略名");
            current_app.init_is_main_user_logged_in = is_main_user_logged_in;
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

        let current_logged_in_abbr_name = sel.pickup([kw_list_arrow, "s-1c0c0"], "", "txt");
        let is_logged_in = checkAbbrName(user_name, current_logged_in_abbr_name);

        if (is_main_user_name && is_logged_in) current_app.main_user_abbr_name = current_logged_in_abbr_name;

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
            let sel_str = sel.pickup(kw_abbr_name_with_star_chars, "", "sel_str");
            let abbr_names = [];
            selector()[sel_str + "Matches"](kw_abbr_name_with_star_chars).find().forEach(w => abbr_names.push(w[sel_str]()));
            if (classof(abbr_names) !== "Array") abbr_names = [abbr_names];

            for (let u = 0, len = abbr_names.length; u < len; u += 1) {
                let abbr_name = abbr_names[u].toString();
                if (checkAbbrName(user_name, abbr_name)) {
                    if (is_main_user_name) current_app.main_user_abbr_name = abbr_name;
                    return true;
                }
            }
        }
    }
}

function clickAbbrNameInUserList(abbr_name) {
    let {
        main_user_abbr_name,
        kw_alipay_homepage,
        kw_close_btn,
        isInLoginPage,
    } = current_app;
    abbr_name = abbr_name || main_user_abbr_name;
    if (!abbr_name) return false;
    let clickAbbrUser = () => clickAction(sel.pickup([abbr_name, "p5"]), "widget");

    for (let i = 0; i < 3; i += 1) {
        debugInfo((i ? "再次尝试" : "") + "点击列表中的账户");
        clickAbbrUser();

        let conditions = {
            name: "列表快捷切换账户",
            time: 1, // 1 min
            wait: [{
                remark: "登录中进度条",
                cond: () => sel.pickup(className("ProgressBar")),
            }],
            success: [{
                remark: "支付宝首页",
                cond: kw_alipay_homepage,
            }, {
                remark: "H5关闭按钮",
                cond: kw_close_btn,
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
    let classof_c = classof(c);
    if (classof_c !== "Object") return debugInfo(["条件检查器参数不合法", ">" + classof_c]) && false;

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
                    if (typeof cond.feedback === "function") {
                        debugInfo("检测到反馈方法");
                        cond.feedback();
                    }
                    return true;
                }
            }
        }
    }
}

// special exec comm function(s) //

function speExecCollectFriendsList() {
    timeRecorder("collect_friends_list_data", "save");

    prologue();
    plans("launch_rank_list", {
        task_name: "好友列表采集",
        first_time_run_message_flag: false,
        condition_ready: () => {
            let kw_rank_list = current_app.kw_rank_list();
            try {
                return kw_rank_list.exists() && kw_rank_list.findOnce().childCount();
            } catch (e) {
                // nothing to do here
            }
        },
        disturbance: () => {
            while (!waitForAction(() => __global__._monster_$_launch_ready_monitor_signal, 1000)) {
                clickAction(sel.pickup("再试一次", "kw_rank_list_try_again"));
                clickAction(sel.pickup("打开", "kw_confirm_launch_alipay"));
            }
        },
    });
    collectFriendsListData();
    endAlipay();
    exitNow();

    // tool function(s) //

    function collectFriendsListData() {
        current_app.quote_name = surroundWith("好友列表采集");

        let first_time_collect_flag = true;
        let thread_keep_toast = threads.start(function () {
            while (1) {
                messageAction("正在采集好友列表数据", first_time_collect_flag ? 1 : 0, 1, 0, "up");
                sleep(first_time_collect_flag ? 4000 : 6000);
                first_time_collect_flag = false;
            }
        });

        let thread_expand_hero_list = threads.start(function expandHeroListThread() {
            let kw_list_more = current_app.kw_rank_list_more;
            let click_count = 0;
            while (!sel.pickup("没有更多了")) {
                clickAction(kw_list_more(), "widget");
                click_count++;
                sleep(200);
            }
            debugInfo(["排行榜展开完毕", ">点击\"查看更多\": " + click_count + "次"]);
        });
        thread_expand_hero_list.join(5 * 60000); // 5 minutes at most
        thread_expand_hero_list.interrupt();

        let friend_list_data = getFriendsListData();
        storage_af.put("friends_list_data", friend_list_data);
        thread_keep_toast.interrupt();
        messageAction("采集完毕", 1, 1);
        messageAction("用时 " + timeRecorder("collect_friends_list_data", "load", 1000, [1], " 秒"), 1, 0, 1);
        messageAction("总计 " + friend_list_data.list_length + " 项", 1, 0, 1);
        current_app.floaty_msg_finished_flag = 1;

        // tool function (s) //

        function getFriendsListData() {
            let kw_rank_list_node = sel.pickup(["没有更多了", "p1"]);
            let rank_list_node_id = kw_rank_list_node.id();
            debugInfo(["布局层次获取列表控件id:", rank_list_node_id]);
            if (!rank_list_node_id || kw_rank_list_node.children().size() < 5) {
                debugInfo(["布局层次获取列表控件可能无效", "使用会话参数获取列表控件"]);
                debugInfo(["会话参数获取列表控件id:", (kw_rank_list_node = current_app.kw_rank_list().findOnce()).id()]);
            }
            let rank_list = [];
            kw_rank_list_node.children().forEach((child, idx) => {
                try {
                    let checkChild = num => sel.pickup([child, "c" + num], "", "txt");
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
                timestamp: +new Date(),
                list_data: rank_list,
                list_length: rank_list.length,
            };
        }
    }
}

function speExecCollectCurrentAccountName() {
    timeRecorder("collect_current_account_name", "save");

    prologue();
    collectCurrentAccountName();
    endAlipay();
    exitNow();

    // tool function(s) //

    function collectCurrentAccountName() {
        let collected_name = getNameByPipeline();
        let storage_key_name = "collected_current_account_name";
        storage_af.remove(storage_key_name);
        storage_af.put(storage_key_name, collected_name);
        messageAction("采集完毕", 1);
        messageAction("用时 " + timeRecorder("collect_current_account_name", "load", 1000, [1], " 秒"), 1, 0, 1);
        current_app.floaty_msg_finished_flag = 1;

        // tool function (s) //

        function getNameByPipeline() {
            let account_name = "";
            let thread_get_account_name = threads.start(function () {
                current_app.quote_name = surroundWith("采集当前账户名");
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
                let getNameTxt = () => sel.pickup(["支付宝账户", "s+1"], "", "txt");
                let txt = "";
                waitForAction(() => txt = getNameTxt(), 2000);
                return account_name = txt ? accountNameConverter(txt, "encrypt") : "";
            });
            let thread_monitor_logged_out = threads.start(function () {
                current_app.account_logged_out = false;
                let {isInLoginPage, kw_user_logged_out} = current_app;
                while (!isInLoginPage() && !kw_user_logged_out()) sleep(500);
                current_app.account_logged_out = true;
            });
            waitForAction(() => account_name || current_app.account_logged_out, 12000);
            thread_get_account_name.interrupt();
            thread_monitor_logged_out.interrupt();
            if (account_name) return account_name;
            if (current_app.account_logged_out) {
                messageAction("账户已登出", 3, 1, 0, "both_dash");
                delete current_app.account_logged_out;
            }
            return "";
        }
    }
}