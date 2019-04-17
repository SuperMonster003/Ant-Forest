/**
 * @overview alipay ant forest auto-collect script
 *
 * @tutorial {@link https://github.com/SuperMonster003/Ant_Forest}
 * @last_modified Apr 17, 2019
 * @version 1.5.9
 * @author SuperMonster003
 *
 * @borrows {@link https://github.com/e1399579/autojs}
 * @borrows {@link https://github.com/hyb1996/Auto.js}
 * @borrows {@link https://github.com/Nick-Hopps/Ant-Forest-autoscript}
 */

auto.waitFor();

engines.myEngine().setTag("exclusive_task", "af");
while (engines.all().filter(e => e.getTag("exclusive_task") && e.id < engines.myEngine().id).length) sleep(500);

let current_autojs_package = context.packageName;
let current_autojs_version = getVerName(current_autojs_package);
checkBugVersions();

let storage_af = require("../Modules/MODULE_STORAGE").create("af");
let storage_cfg = require("../Modules/MODULE_STORAGE").create("af_cfg");
if (!storage_af.get("config_prompted")) promptConfig();

let config = {
    main_user_switch: false, // if you are multi-account user, you may specify a "main account" to switch
    show_console_log_details: true, // whether to show message details of each friend in console
    floaty_msg_switch: true, // important will show in floaty way with "true value" or toast way with "false value"
    list_swipe_time: 100, // unit: millisecond; set this value bigger if errors like "CvException" occurred
    ready_to_collect_color: "#1da06d", // color for collect icon with a hand pattern
    rank_list_icons_color_threshold: 10, // 0 <= x <= 66 is recommended; the smaller, the stricter; max limit tested on Sony G8441
    max_running_time: 5, // 1 <= x <= 30; running timeout each time; unit: minute; leave "false value" if you dislike limitation
};

Object.assign(config, storage_cfg.get("config", require("../Modules/MODULE_DEFAULT_CONFIG").af));

let WIDTH = device.width,
    HEIGHT = device.height,
    cX = num => Math.floor(num * WIDTH / 720),
    cY = num => Math.floor(num * HEIGHT / 1280),
    unlock_module = new (require("../Modules/MODULE_UNLOCK.js")),
    current_app = {};

antForest();

// entrance function //

function antForest() {
    init();
    launchThisApp(current_app.intent);
    checkLanguage();
    checkEnergy();
    showResult();
    endProcess();

    // main function(s) //

    function init() {
        let init_operation_logged = null;

        showAppTitle();
        setScreenMetrics(WIDTH, HEIGHT);
        checkSdk();
        unlock();
        setAutoJsLogPath();
        setParams();
        getReady();
        loginSpecificUser(); // init_operation_logged doesn't set, and needs optimization

        if (init_operation_logged) showSplitLine();

        // tool function(s) //

        function showAppTitle() {
            messageAction("开始\"蚂蚁森林\"任务", 1, 0, 0, "both");
        }

        function checkSdk() {
            if (+shell("getprop ro.build.version.sdk").result >= 24) return true;
            messageAction("脚本无法继续", 4);
            messageAction("安卓系统版本低于7.0", 8, 1, 1, 1);
        }

        function unlock() {
            let is_screen_on = unlock_module.is_screen_on;
            current_app.is_screen_on = is_screen_on;
            if (!is_screen_on && !config.auto_unlock_switch) {
                messageAction("脚本无法继续", 4);
                messageAction("屏幕关闭且自动解锁功能未开启", 8, 1, 1, 1);
            }
            unlock_module.unlock();
        }

        function setAutoJsLogPath() {

            let log_path = config.auto_js_log_record_path;

            if (!log_path) return;

            let bug_versions = ["Pro 7.0.0-2", "Pro 7.0.0-3"];

            if (~bug_versions.indexOf(current_autojs_version)) {
                messageAction("日志保存功能已禁用", 1);
                messageAction("此Auto.js版本不兼容", 1, 0, 1);
                messageAction(current_autojs_version, 1, 0, 1);
                return init_operation_logged = 1;
            }

            files.createWithDirs(log_path);

            console.setGlobalLogConfig({
                file: log_path,
            });
        }

        function setParams() {

            current_app = Object.assign(current_app, new App("蚂蚁森林"));
            current_app.ori_app_package = currentPackage();
            current_app.kill_when_done = current_app.ori_app_package !== current_app.package_name;

            checkConfig();
            setMaxRunTime();


            // constructor //

            function App(name) {
                this.name = name;
                this.quote_name = "\"" + name + "\"";
                this.package_name = getAlipayPkgName();
                this.intent = {
                    action: "VIEW",
                    data: "alipays://platformapi/startapp?appId=60000002&appClearTop=false&startMultApp=YES",
                };
                this.first_time_run = 1;
                this.firstTimeRunConditionFun = firstTimeRunCondition;
                this.saveState = saveState;
                this.loadState = loadState;
                this.specific_user = setSpecificUser();
                this.total_energy_init = 0;
                this.total_energy_collect_own = 0;
                this.blacklist = handleFirstTimeRunBlacklist();
                this.current_friend = {};

                // tool function(s) //

                function getAlipayPkgName() {

                    let default_pkg = "com.eg.android.AlipayGphone";

                    if (app.getAppName(default_pkg)) return default_pkg;

                    let result;
                    let pkg_samples = ["Alipay", "支付宝", "支付寶"],
                        joined_pkg_name = "\"" + pkg_samples.join("\/") + "\"";

                    for (let i = 0, len = pkg_samples.length; i < len; i += 1) {
                        if ((result = app.getPackageName(pkg_samples[i]))) {
                            messageAction("已获取新的" + joined_pkg_name + "包名", 3, 1);
                            messageAction(result, 3, 0, 1);
                            init_operation_logged = 1;
                            return result;
                        }
                    }
                    return messageAction("此设备未安装\"" + pkg_samples.join("\/") + "\"软件", 8, 1);
                }

                function setSpecificUser() {
                    return "此功能暂时关闭" && 0;
                }

                function handleFirstTimeRunBlacklist() {
                    let blacklist_title_flag = 0;
                    let blacklist = loadState("blacklist", {}); // {friend_name: {timestamp::, reason::}}
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
                        if (!config.show_console_log_details) return;

                        if (!blacklist_title_flag) {
                            init_operation_logged && showSplitLine();
                            messageAction("已从黑名单中移除:", 1);
                            blacklist_title_flag = 1;
                        }
                        messageAction(name, 1, 0, 1);
                    }
                }

                // function function(s) //

                function firstTimeRunCondition() {
                    let kw_af_title = idMatches(/.*h5_tv_title/).textMatches(/蚂蚁森林|Ant Forest/);
                    let kw_login_or_switch = idMatches(/.*switchAccount|.*loginButton/);
                    return kw_af_title.exists() && desc("合种").exists() || kw_login_or_switch.exists();
                }

                function saveState(key, value) {
                    if (!key) messageAction("无效的\"save_key\"参数", 8, 1);
                    storage_af.put(key, value);
                }

                function loadState(key, default_value) {
                    if (!key) messageAction("无效的\"load_key\"参数", 8, 1);
                    return storage_af.get(key, default_value);
                }
            }

            function checkConfig() {

                let max_running_time = config.max_running_time,
                    parsed_max_time = +max_running_time;
                if (max_running_time && parsed_max_time !== 0 && (!parsed_max_time || max_running_time < 1 || max_running_time > 60)) {
                    config.max_running_time = max_running_time < 1 ? 1 : 60;
                    messageAction("校正\"max_running_time\": " + config.max_running_time, 3);
                    init_operation_logged = 1;
                }

                let boolean_correct = ["main_user_switch", "help_collect_switch", "show_console_log_details"];
                boolean_correct.forEach(value => {
                    if (typeof config[value] !== "boolean") {
                        config[value] = !!config[value]; // set to Boolean by force
                        messageAction("校正\"" + value + "\": " + config[value], 1);
                        init_operation_logged = 1;
                    }
                });
            }

            function setMaxRunTime() {
                let max = config.max_running_time;

                if (!max || !+max) return;

                threads.start(function () {
                    sleep(+max * 60000);
                    let exit_msg = "超时强制退出";
                    messageAction(exit_msg, 4, 1, 0, "both_n");
                    ~threads.shutDownAll() && exit();
                });
            }
        }

        function getReady() {
            let pkg = current_app.package_name;
            if (currentPackage() !== pkg) {
                app.launch(pkg);
                if (currentPackage().match(/^org\.autojs/)) return sleep(1000);
            }

            if (current_app.specific_user) {
                let max_launch_times = 5;
                while (!waitForAction(() => currentPackage() === pkg, 3000) && max_launch_times--) {
                    app.launch(pkg);
                }
            }
        }

        function loginSpecificUser() {

            if (!current_app.specific_user) return true;

            let kw_login_with_new_user = textMatches(/换个新账号登录|[Aa]dd [Aa]ccount/);
            let intent_alipay_acc_manager = {
                action: "VIEW",
                packageName: "com.eg.android.AlipayGphone",
                className: "com.alipay.mobile.security.accountmanager.ui.AccountManagerActivity_",
            };

            app.startActivity(intent_alipay_acc_manager);

            let max_wait_times = 8,
                try_times = 0,
                kw_back_btn = id("com.alipay.mobile.antui:id/back_button");
            while (!waitForAction(kw_login_with_new_user, try_times++ ? 5000 : 1500) && max_wait_times--) {
                kw_back_btn.exists() && kw_back_btn.click() || keycode(4) && sleep(2500);
                app.startActivity(intent_alipay_acc_manager);
            }
            if (max_wait_times < 0) return messageAction("无法进入用户列表页面", 8, 1);

            let specific_user = current_app.specific_user;
            let kw_list_arrow = id("com.alipay.mobile.antui:id/list_arrow"),
                current_logged_in_user_ident = kw_list_arrow.exists() && kw_list_arrow.findOnce().parent().child(0).child(0).child(0).text(),
                specific_user_ident = specific_user.username_ident;
            if (current_logged_in_user_ident === specific_user_ident) return true;

            let kw_specific_user_ident = text(specific_user.username_ident),
                kw_me = textMatches(/我的|Me/).boundsInside(0, 0.7 * HEIGHT, WIDTH, HEIGHT),
                kw_switch_account = idMatches(/.*switchAccount.*/),
                kw_user_acc_input = id("com.ali.user.mobile.security.ui:id/userAccountInput");
            if (clickBounds([kw_specific_user_ident, "try"])) {
                let condition_click_acc = () => kw_me.exists() || kw_switch_account.exists() || kw_user_acc_input.exists();
                if (!waitForAction(condition_click_acc, 30000)) messageAction("切换账号点击已有账户时出现未知情况", 8, 1);
                if (kw_me.exists()) return true;
                clickBounds([kw_switch_account, "try"]);
            } else clickBounds(kw_login_with_new_user);

            let max_try_times_user_acc_input = 3;
            while (!waitForAction(kw_user_acc_input, 10000) && max_try_times_user_acc_input--) {
                clickBounds([kw_login_with_new_user, "try"]) || clickBounds([kw_switch_account, "try"]);
            }
            if (max_try_times_user_acc_input < 0) return messageAction("未找到用户名输入文本框", 8, 1);

            kw_user_acc_input.findOnce().children().forEach(w => {
                if (w.className() === "android.widget.EditText") w.setText(specific_user.login_username);
            });
            let kw_pw_input = idMatches(/.*userPasswordInput.*/),
                kw_next_step = idMatches(/.*nextButton/);
            if (!kw_pw_input.exists()) {
                waitForActionAndClickBounds(kw_next_step, 8000, "输入用户名后未找到下一步按钮", 8, 1);
            }
            let max_wait_times_pw_input = 60;
            while (!waitForAction(idMatches(/.*(switchLoginMethodCenter|userPasswordInput).*/), 1000) && max_wait_times_pw_input--) {
                clickBounds([id("com.ali.user.mobile.security.ui:id/comfirmSetting"), "try"]); // "确定" button
                clickBounds([kw_next_step, "try"]);
            }
            if (max_wait_times_pw_input < 0) return messageAction("输入用户名后下一步操作超时", 8, 1);
            let kw_switch_login_method = idMatches(/.*switchLoginMethodCenter.*/);
            if (clickBounds([kw_switch_login_method, "try"])) {
                let kw_login_by_pw = textMatches(/.*(密码登录|with passw).*/);
                if (!waitForAction(kw_login_by_pw, 8000)) return messageAction("等待切换登录方式页面超时", 8, 1);
                clickBounds(kw_login_by_pw);
            }
            waitForAction(kw_pw_input, 5000, "等待密码输入框超时", 8, 1);
            kw_pw_input.findOnce().children().forEach(w => {
                if (w.className() === "android.widget.EditText") w.setText(specific_user.login_pw);
            });
            clickBounds(idMatches(/.*loginButton/), 1);
            sleep(1000);

            let case_a = textMatches(/Me|我的/),
                case_b = textMatches(/重新输入|Try again/), // wrong password
                case_c = descMatches(/.*(验证码|Verification Code).*/), // sms code is needed
                case_d = textMatches(/.{3,}验证码.{3,}|.{6,}Verification Code.{6,}/), // just a prompt, can be ignored
                case_e = descMatches(/.*(回答|questions|换个方式登录|[Aa]nother).*/), // need answering some questions // 英文的desc没有具体确定
                case_f = kw_list_arrow;
            waitForAction(() => case_a.exists() || case_b.exists() || case_c.exists() || case_d.exists() || case_e.exists() || case_f.exists(), [20000, 1000], "登录后检测登录状态失败", 8, 1, 0, idMatches(/.*btn_confirm/));

            if (case_a.exists()) return true;
            if (case_b.exists()) return messageAction("登录密码错误", 3, 1);
            if (case_c.exists()) return messageAction("需要验证码", 3, 1);
            if (case_d.exists()) {
                clickBounds(textMatches(/进入支付宝|.*[En]ter.*/)); // 英文的text没有具体确定
                return waitForAction(textMatches(/Me|我的/), 10000, "登录账户超时", 8, 1);
            }
            if (case_e.exists()) return messageAction("需要回答问题", 3, 1);
            if (case_f.exists()) {
                let current_logged_in_user_ident = kw_list_arrow.findOnce().parent().child(0).child(0).child(0).text();
                if (current_logged_in_user_ident === specific_user.username_ident) return true;
            }
        }
    }

    /**
     * will be set to configured language or Chinese by default
     */
    function checkLanguage() {
        let kw_h5_title = id("com.alipay.mobile.nebula:id/h5_tv_title");
        waitForAction(kw_h5_title, 5000); // just in case
        if (kw_h5_title.findOnce().text().match(/蚂蚁森林/)) return true;
        changeLangToChs();
        launchThisApp(current_app.intent, "no_msg");

        // tool function(s) //

        function changeLangToChs() {

            getReady() && ~handleTxtPipeline() && showSplitLine();

            function getReady() {
                let kw_close_btn = desc("Close");
                let max_try_times_close_btn = 10;
                while (max_try_times_close_btn--) {
                    try {
                        clickBounds([kw_close_btn, "try"]);
                        break;
                    } catch (e) {
                        sleep(500);
                    }
                }
                let kw_homepage = className("android.widget.TextView").idContains("tab_description");
                if (waitForAction(kw_homepage, 2000)) return true;
                let max_try_times = 5;
                while (max_try_times--) {
                    killCurrentApp(current_app.package_name);
                    app.launch(current_app.package_name);
                    if (waitForAction(kw_homepage, 15000)) break;
                }
                if (max_try_times < 0) {
                    messageAction("Language switched failed", 4, 1);
                    messageAction("Homepage failed to get ready", 4, 0, 1);
                    return false;
                }
                return true;
            }

            function handleTxtPipeline() {
                let txt_pipe_line = {
                    "Me": "_next",
                    "Settings": "_next",
                    "General": "_next",
                    "Language": "_next",
                    "\u7b80\u4f53\u4e2d\u6587": () => text("简体中文").findOnce().parent().parent().parent().children().size() === 2,
                    "Save": () => !text("Save").exists(),
                };

                let ppl_keys = Object.keys(txt_pipe_line);

                for (let i = 0, len = ppl_keys.length; i < len; i += 1) {
                    let key = ppl_keys[i],
                        value = txt_pipe_line[key],
                        next_key = ppl_keys[i + 1],
                        condition = value === "_next" ? text(next_key) : value;

                    clickBounds(text(key));
                    let max_try_times = 5;
                    while (!waitForAction(condition, 2000) && max_try_times--) clickBounds(text(key));
                    if (max_try_times < 0) return handleFailure(next_key);
                }

                return messageAction("Language switched to Chinese (Simplified)", 1, 1);

                // tool function(s) //

                function handleFailure(title) {
                    messageAction("Language switched failed", 4, 1);
                    messageAction(title + " failed to get ready", 4, 0, 1);
                }
            }
        }
    }

    function checkEnergy() {

        tryRequestScreenCapture();

        let kw_more_friends = desc("查看更多好友"),
            kw_cooperation_btn = desc("合种");

        let kw_energy_balls = className("Button").descMatches(/\xa0|收集能量\d+克/),
            kw_energy_balls_normal = className("Button").desc("\xa0"),
            kw_energy_balls_ripe = className("Button").descMatches(/收集能量\d+克/);

        checkOwnEnergy();
        checkFriendsEnergy();
        goBackToAfHome();

        // main function(s) //

        function checkOwnEnergy() {

            current_app.total_energy_init = getCurrentEnergyAmount();

            let check = () => checkOnce() && (current_app.total_energy_collect_own += getEnergyDiff());

            waitForAction(() => kw_more_friends.exists() || kw_cooperation_btn.exists(), 5000); // just in case
            waitForAction(kw_energy_balls, 1000); // make energy balls ready

            if (config.non_break_check_switch) {
                let check_times = config.non_break_check_time_area;
                for (let i = 0, len = check_times.length; i < len; i += 1) {
                    if (!check_times[i] || !check_times[i].length) continue;
                    let check_time = check_times[i];
                    let now = new Date(),
                        today_date = now.toDateString(),
                        min_time = Date.parse(today_date + " " + check_time[0]),
                        max_time = Date.parse(today_date + " " + check_time[1]),
                        in_check_remain_range = min_time < now && now < max_time;
                    if (in_check_remain_range) checkRemain(max_time);
                }
            }

            check();

            // tool function(s) //

            function checkRemain(max_time) {
                toast("Non-stop checking time");
                while (new Date() < max_time) ~sleep(180) && check();
                toast("Checking completed");
            }

            function checkOnce() {
                let selector_buttons = kw_energy_balls_ripe.find(),
                    buttons_size = selector_buttons.size();
                if (!buttons_size) return;
                selector_buttons.forEach(w => clickBounds(w.bounds()));
                if (buttons_size === 6) {
                    current_app.total_energy_collect_own += getEnergyDiff(); // wait for energy balls being stable
                    return checkOnce(); // recursion has not been tested yet since Mar 26, 2019
                }
                return true;
            }

            // tool function(s) //

            function getEnergyDiff() {
                let energy_rec = current_app.total_energy_init,
                    tmp_energy_rec = undefined;
                if (!waitForAction(() => energy_rec !== (tmp_energy_rec = getCurrentEnergyAmount()), 5000)) return 0;
                energy_rec = tmp_energy_rec;
                while (waitForAction(() => energy_rec !== (tmp_energy_rec = getCurrentEnergyAmount()), 1000)) {
                    energy_rec = tmp_energy_rec;
                }
                return (energy_rec - current_app.total_energy_init) || 0;
            }
        }

        function checkFriendsEnergy() {

            let kw_rank_list_self = idMatches(/.*J_rank_list_self/);

            if (!rankListReady()) return;

            let help_switch = config.help_collect_switch,
                help_balls_capts = [],
                help_balls_coords = {},
                thread_list_end = threads.start(endOfListThread),
                thread_help_monitor = undefined,
                list_end_signal = 0;

            let max_safe_swipe_times = 125; // just for avoiding infinite loop
            while (max_safe_swipe_times--) {
                let targets = getCurrentScreenTargets(), // [[targets_green], [targets_orange]]
                    pop_item;

                while ((pop_item = targets[0].pop() || targets[1].pop())) {
                    current_app.current_friend = {
                        name: pop_item.name,
                        console_logged: 0,
                    };
                    config.show_console_log_details && messageAction(current_app.current_friend.name, "title"); // name title
                    if (inBlackList()) continue;
                    click(WIDTH * 0.5, pop_item.y + cY(60));
                    forestPageGetReady() && collectBalls();
                    backToHeroList();
                    current_app.current_friend.console_logged || messageAction("无能量球可操作", 1, 0, 1);
                    showSplitLine();
                }

                if (!list_end_signal) swipeUp();
                else break;
            }

            thread_list_end.interrupt();

            return list_end_signal;

            // key function(s) //

            function rankListReady() {
                let max_try_times_more_friends_btn = 8;
                while (!waitForAction(kw_more_friends, 5000) && max_try_times_more_friends_btn--) {
                    launchThisApp(current_app.intent, "no_msg");
                }
                if (max_try_times_more_friends_btn < 0) return messageAction("定位\"查看更多好友\"按钮失败", 3, 1);

                kw_more_friends.click();

                let max_try_times = 180,
                    condition_rank_list_ready = () => kw_rank_list_self.exists() && kw_rank_list_self.findOnce().childCount(),
                    kw_try_again = desc("再试一次");
                while (!waitForAction(condition_rank_list_ready, 500) && max_try_times--) {
                    kw_try_again.exists() && kw_try_again.click(); // for desc("服务器打瞌睡了").exists()
                }
                if (max_try_times < 0) return messageAction("进入好友排行榜超时", 3, 1);

                threads.start(expandHeroListThread);
                return ~sleep(500); // a small interval for page ready

                // tool function(s) //

                function expandHeroListThread() {
                    let kw_list_more = idMatches(/.*J_rank_list_more/);
                    while (!desc("没有更多了").exists()) {
                        kw_list_more.exists() && kw_list_more.click();
                        sleep(200);
                    }
                }
            }

            function getCurrentScreenTargets() {

                waitForAction(kw_rank_list_self, 8000); // make page ready

                let targets_green = [],
                    targets_orange = [];

                let capt_img;
                let regexp_energy_amount = new RegExp("\\d\+\(\\\.\\d\+\)\?\(k\?g|t\)");
                let screenAreaSamples = getScreenSamples() || [];

                screenAreaSamples.forEach(w => {
                    let state_ident_node = w.parent().child(w.parent().childCount() - 2);
                    if (state_ident_node.childCount()) return; // exclude identifies with countdown

                    capt_img = capt_img || captCurrentScreen();
                    let find_color_options = getFindColorOptions(w);

                    // special treatment for first 3 ones
                    let name = w.parent().child(1).desc() || w.parent().child(2).desc();

                    try {
                        let pt_green = images.findColor(capt_img, config.ready_to_collect_color, find_color_options);
                        if (pt_green) return targets_green.unshift({name: name, y: pt_green.y});

                        // keep on even if "help_switch" is false
                        // sometimes there will be collectible balls in forest after click orange "help collect" icon
                        let pt_orange = images.findColor(capt_img, config.help_collect_color, find_color_options);
                        if (pt_orange) return targets_orange.unshift({name: name, y: pt_orange.y});
                    } catch (e) {
                        log(find_color_options); ////TEST////
                        throw Error(e);
                    }
                });

                return [targets_green, targets_orange];

                // tool function(s) //

                function getScreenSamples() {
                    let max_try_times = 5;
                    while (max_try_times--) {
                        let samples = boundsInside(~~(WIDTH * 0.7), 1, WIDTH, HEIGHT - 1)
                            .descMatches(regexp_energy_amount).filter(function (w) {
                                let bounds = w.bounds();
                                return bounds.bottom > bounds.top;
                            }).find();
                        if (samples.size()) return samples;
                    }
                    return messageAction("刷新样本区域失败", 3, 0, 0, "both"); ////TEST////
                }

                function captCurrentScreen() {
                    let capt_img = captureScreen();
                    let max_try_times_wait_for_capt = 25;
                    while (!textMatches(/.+排行榜/).exists() && max_try_times_wait_for_capt--) sleep(80); // wait for capturing finished
                    if (max_try_times_wait_for_capt < 0) messageAction("截图辅助定位控件可能已失效", 3);
                    return capt_img;
                }

                function getFindColorOptions(w) {
                    let parent_node = w.parent();
                    let region_ref = {
                        l: ~~(WIDTH * 0.7),
                        t: parent_node.bounds().top,
                    };
                    return {
                        region: [region_ref.l, region_ref.t, WIDTH - region_ref.l, parent_node.bounds().centerY() - region_ref.t],
                        threshold: config.rank_list_icons_color_threshold,
                    };
                }
            }

            function forestPageGetReady() {

                let kw_wait_for_awhile = descMatches(/.*稍等片刻.*/);
                waitForAction(kw_wait_for_awhile, 5000);

                let max_safe_wait_times = 1200;
                while (kw_wait_for_awhile.exists() && max_safe_wait_times--) sleep(100); // keep waiting for at most 2 min

                let kw_forest_page = descMatches(/你收取TA|发消息/);
                // if (!waitForAction(kw_forest_page, 8000)) return;

                ////TEST////
                if (!waitForAction(kw_forest_page, 8000)) {
                    messageAction("进入好友森林超时", 3, 1);
                    saveCurrentScreenCapture("Friend_Forest_Page");
                    return false;
                }
                ////TEST END////

                thread_help_monitor = threads.start(helpMonitorThread);

                // minimum time is about 879.83 ms before energy balls ready (Sony G8441)
                // return waitForAction(kw_energy_balls, 5000);

                ////TEST////
                if (!waitForAction(kw_energy_balls, 3000)) {
                    messageAction("等待能量球超时", 3, 1);
                    saveCurrentScreenCapture("No_Energy_Balls");
                    return false;
                }
                return true;
                ////TEST END////

                // tool function(s) //

                function helpMonitorThread() {

                    let orange = config.help_collect_color,
                        orange_threshold = config.help_collect_color_threshold,
                        intensity_time = config.help_collect_intensity * 100;

                    let now = new Date().getTime();

                    while (new Date().getTime() - now < intensity_time) {

                        let capt = captureScreen();
                        help_balls_capts.unshift(images.toBase64(images.clip(capt, cX(298), cY(218), cX(120), cY(22)))); // blacklist identify area

                        if (!waitForAction(kw_energy_balls_normal, intensity_time)) return;

                        let all_normal_balls = kw_energy_balls_normal.find(),
                            norm_balls_size = all_normal_balls.size(),
                            help_balls_size = Object.keys(help_balls_coords).length;

                        if (!norm_balls_size || norm_balls_size === help_balls_size) return;

                        all_normal_balls.forEach(w => {
                            let b = w.bounds(),
                                top = b.top;
                            if (top in help_balls_coords) return;

                            let options = {
                                region: [b.left, top, b.width(), b.height()],
                                threshold: orange_threshold,
                            };
                            if (!images.findColor(capt, orange, options)) return;

                            help_balls_coords[top] = {x: b.centerX(), y: b.centerY()};
                        });
                    }
                }
            }

            function collectBalls() {

                let blacklist_passed_flag = true,
                    take_clicked_flag = false;

                let thread_blacklist_check = threads.start(blacklistCheckThread);
                thread_blacklist_check.join();

                if (!blacklist_passed_flag) return thread_help_monitor.interrupt();

                let thread_take = threads.start(take);
                let thread_help = threads.start(help);

                thread_help.join();
                help_balls_coords = {}; // reset
                thread_take.join();

                // main function(s) //

                function blacklistCheckThread() {

                    let max_wait_times = 10;
                    while (!help_balls_capts.length && max_wait_times--) {
                        if (thread_help_monitor.isAlive()) sleep(100);
                        else {
                            max_wait_times = -1;
                            break;
                        }
                    }

                    let capt;

                    if (max_wait_times >= 0) {
                        let max_try_times = 5;
                        while (max_try_times--) {
                            try {
                                capt = images.fromBase64(help_balls_capts[0]);
                                break;
                            } catch (e) {
                                log(e); ////TEST////
                                sleep(100);
                            }
                        }
                    } else capt = images.clip(captureScreen(), cX(298), cY(218), cX(120), cY(22));

                    let protect_color_match = images.findColor(capt, -4262312, {
                        threshold: 4,
                    });
                    if (protect_color_match) blacklist_passed_flag = false;
                    // else return console.verbose("-> 颜色识别无保护罩"); ////TEST////
                    else return;

                    let kw_list = className("android.widget.ListView");
                    if (!waitForAction(kw_list, 2000)) return; // just in case

                    let thread_list_more = threads.start(listMoreThread);
                    let thread_list_monitor = threads.start(listMonitorThread);

                    thread_list_more.join();
                    thread_list_monitor.join();

                    // tool function(s) //

                    function listMoreThread() {
                        let kw_list_more = desc("点击加载更多");
                        if (!waitForAction(kw_list_more, 2000)) return;

                        let safe_max_try_times = 50; // 10 sec at most
                        while (!desc("没有更多").exists() && safe_max_try_times--) {
                            kw_list_more.exists() && kw_list_more.click();
                            sleep(200);
                        }
                    }

                    function listMonitorThread() {
                        let kw_protect_cover = desc("使用了保护罩");
                        let dates_arr = getDatesArr();
                        if (dates_arr && kw_protect_cover.exists()) addBlacklist();

                        thread_list_more.interrupt();

                        // tool function(s) //

                        function getDatesArr() {
                            if (!waitForAction(kw_list, 2000)) return;
                            let renewDatesArr = () => {
                                // 3 arrays at most which can enhance efficiency a little bit
                                return kw_list.findOnce().children().filter(w => !w.childCount()).slice(0, 3);
                            };
                            let safe_max_try_times = 18;
                            while (safe_max_try_times--) {
                                let dates_arr = renewDatesArr(),
                                    max_i = dates_arr.length;
                                for (let i = 0; i < max_i; i += 1) {
                                    // let over_two_days = dates_arr[i].desc().match(/\d{2}.\d{2}/); // like: "03-22"
                                    let over_two_days = dates_arr[i].desc().length === 5; // like: "03-22"
                                    if (kw_protect_cover.exists() || over_two_days) {
                                        thread_list_more.interrupt();
                                        return max_i < 3 ? renewDatesArr() : dates_arr; // 样本数达到3个则无需重新获取
                                    }
                                }
                                sleep(100); // necessary or not ?
                            }
                        }

                        function addBlacklist() {
                            let cover = kw_protect_cover.findOnce(),
                                cover_top = cover.bounds().top;
                            let i = 1;
                            for (let len = dates_arr.length; i < len; i += 1) {
                                if (cover_top < dates_arr[i].bounds().top) break;
                            }

                            let date_str = dates_arr[i - 1].desc(); // "今天" or "昨天"
                            let time_str_clip = cover.parent().parent().child(1).desc(); // like: "03:19"
                            let time_str = date_str + time_str_clip;

                            current_app.blacklist[current_app.current_friend.name] = {
                                timestamp: getTimestamp(time_str),
                                reason: "protect_cover",
                            };
                            blackListMsg("add");

                            // tool function(s) //

                            function getTimestamp(time_str) {
                                let now = new Date();
                                let time = new Date();
                                let time_offset = time_str.match(/昨天/) && -24;
                                return new Date(new Date(time.setHours(now.getHours() + time_offset)).toDateString() + " " + time_str.slice(2)).getTime(); // timestamp when protect cover took effect
                            }
                        }
                    }
                }

                function take() {
                    if (!waitForAction(kw_energy_balls, 1000)) return;
                    if (!kw_energy_balls_ripe.exists()) return take_clicked_flag = 1;

                    let checkRipeBalls = () => kw_energy_balls_ripe.find(),
                        ripe_balls,
                        ripe_flag,
                        safe_max_try_times = 6;

                    let ori_collected_amount = getOperateData("collect"),
                        collected_amount = ori_collected_amount,
                        tmp_collected_amount = undefined;

                    while ((ripe_balls = checkRipeBalls()).size() && safe_max_try_times--) {
                        ripe_flag = 1;
                        ripe_balls.forEach(w => clickBounds(w.bounds()));
                        take_clicked_flag = 1;

                        if (!waitForAction(() => collected_amount !== (tmp_collected_amount = getOperateData("collect")), 3500)) break;
                        collected_amount = tmp_collected_amount;
                        while (waitForAction(() => collected_amount !== (tmp_collected_amount = getOperateData("collect")), 300)) {
                            collected_amount = tmp_collected_amount;
                        }
                    }

                    if (ripe_flag && config.show_console_log_details) {
                        let harvest = collected_amount - ori_collected_amount;
                        if (isNaN(harvest)) messageAction("收取: 统计数据无效", 0, 0, 1);
                        else messageAction("收取: " + harvest + "g", harvest ? 1 : 0, 0, 1);
                        current_app.current_friend.console_logged = 1;
                    }

                    return true;
                }

                function help() {

                    if (!help_switch) return;

                    thread_help_monitor.join();

                    // let kw_helped = desc("你给TA助力");
                    let ori_helped_amount = getOperateData("help"),
                        helped_amount = ori_helped_amount,
                        tmp_helped_amount = undefined;

                    let coords_arr = Object.keys(help_balls_coords);
                    if (!coords_arr.length) return;
                    if (!waitForAction(() => !!take_clicked_flag || !thread_take.isAlive(), 2000)) {
                        // return;
                        return messageAction("等待take()信号超时", 3, 0, 1); ////TEST////
                    }
                    coords_arr.forEach(coords => {
                        let pt = help_balls_coords[coords];
                        click(pt.x, pt.y);
                    });

                    if (!waitForAction(() => helped_amount !== (tmp_helped_amount = getOperateData("help")), 5000)) return;
                    helped_amount = tmp_helped_amount;
                    while (waitForAction(() => helped_amount !== (tmp_helped_amount = getOperateData("help")), 300)) {
                        helped_amount = tmp_helped_amount;
                    }

                    if (config.show_console_log_details) {
                        messageAction("助力: " + (helped_amount - ori_helped_amount) + "g", 1, 0, 1);
                        current_app.current_friend.console_logged = 1;
                    }
                }
            }

            function backToHeroList() {
                let ident_hero_list = textMatches(/.+排行榜/);
                let kw_back_btn = id("com.alipay.mobile.nebula:id/h5_tv_nav_back");

                if (ident_hero_list.exists()) return;

                let max_try_times = 3;
                while (max_try_times--) {
                    kw_back_btn.exists() ? kw_back_btn.click() : keycode(4);
                    if (waitForAction(ident_hero_list, 3000)) return true;
                }
                if (max_try_times < 0) restartAlipayToHeroList();

                let condition_rank_list_ready = () => kw_rank_list_self.exists() && kw_rank_list_self.findOnce().childCount();
                if (!waitForAction(condition_rank_list_ready, 2000)) restartAlipayToHeroList(); // just in case

                // tool function(s) //

                function restartAlipayToHeroList() {
                    launchThisApp(current_app.intent, "no_msg");
                    rankListReady();
                }
            }

            function swipeUp() {
                if (list_end_signal) return;

                let bottom_data = undefined,
                    tmp_bottom_data = getRankListSelfBottom();

                let half_width = ~~(WIDTH * 0.5);
                gesture(config.list_swipe_time, [half_width, HEIGHT * 0.9], [half_width, HEIGHT * 0.1]);

                while (bottom_data !== tmp_bottom_data) {
                    bottom_data = tmp_bottom_data;
                    sleep(50);
                    tmp_bottom_data = getRankListSelfBottom();
                } // wait for data stable

                // tool function(s) //

                function getRankListSelfBottom() {
                    let max_try_times = 50;
                    while (max_try_times--) {
                        try {
                            return idMatches(/.*J_rank_list_self/).findOnce().bounds().bottom;
                        } catch (e) {
                            // nothing to do here
                            messageAction("R-list self bounds bottom failed once", 3); ////TEST////
                        }
                    }
                    return new Date().getTime() * Math.random();
                }
            }

            // tool function(s) //

            function endOfListThread() {
                let kw_end_ident = descMatches(/没有更多了|邀请/);
                while (1) {
                    try {
                        while (!(kw_end_ident.exists() && kw_end_ident.findOnce().bounds().top < HEIGHT)) sleep(200);
                        return list_end_signal = 1;
                    } catch (e) {
                        sleep(200);
                    }
                }
            }

            function getOperateData(ident) {
                if (ident === "help") return getHelpData();
                if (ident === "collect") return getCollectData();
                return NaN;

                // tool function(s) //

                function getHelpData() {
                    let max_try_times = 4;
                    while (max_try_times--) {
                        try {
                            return idMatches(/.*J_home_panel/).findOnce().child(0).child(0).child(1).desc().match(/\d+/)[0] - 0;
                        } catch (e) {
                            try {
                                return descMatches(/\d+g/).filter(function (w) {
                                    return w.bounds().right > ~~(WIDTH * 0.95);
                                }).findOnce().desc().match(/\d+/)[0] - 0;
                            } catch (e) {
                                // nothing to do here
                            }
                        }
                    }
                    return NaN;
                }

                function getCollectData() {
                    let kw_collected = desc("你收取TA"),
                        idx_collected_node = null,
                        max_try_times = 4;
                    while (max_try_times--) {
                        try {
                            idx_collected_node = idx_collected_node || getCollectedNodeIdx();
                            return kw_collected.findOnce().parent().child(idx_collected_node).desc().match(/\d+/)[0] - 0;
                        } catch (e) {
                            // nothing to do here
                        }
                    }
                    if (max_try_times < 0) return 0 / 0;

                    // tool function(s) //

                    function getCollectedNodeIdx() {
                        for (let i = 0, len = kw_collected.findOnce().parent().children().size(); i < len; i += 1) {
                            let current_node_desc = kw_collected.findOnce().parent().child(i).desc();
                            if (!current_node_desc) continue;
                            if (current_node_desc.match(/\d+g/)) return i;
                        }
                        return 2; // just a backup plan
                    }
                }
            }

            function inBlackList() {
                return current_app.current_friend.name in current_app.blacklist ? blackListMsg("exist", "split_line") : false;
            }

            function blackListMsg(msg_str, split_line_flag) {

                if (!config.show_console_log_details) return true;

                let messages = {
                    "add": "已加入黑名单",
                    "exist": "黑名单好友",
                };
                let reasons = {
                    "protect_cover": "好友使用能量保护罩",
                    "by_user": "用户自行设置",
                };

                messageAction(messages[msg_str], 1, 0, 1);
                msg_str === "exist" && messageAction("已跳过收取", 1, 0, 2);

                let name = current_app.current_friend.name;
                let current_black_friend = current_app.blacklist[name];
                let reason_str = current_black_friend.reason;
                messageAction(reasons[reason_str], 1, 0, 2);
                reason_str === "protect_cover" && messageAction(checkBlackTimestamp(current_black_friend.timestamp), 1, 0, 2);
                split_line_flag && showSplitLine();
                return current_app.current_friend.console_logged = 1;
            }
        }

        function goBackToAfHome() {
            let kw_back_btn = id("com.alipay.mobile.nebula:id/h5_tv_nav_back"),
                ident_af_home = desc("合种");

            let max_try_times = 3;
            while (max_try_times--) {
                kw_back_btn.exists() ? kw_back_btn.click() : keycode(4);
                if (waitForAction(ident_af_home, 3000)) return true;
            }
            if (max_try_times < 0) launchThisApp(current_app.intent, "no_msg");
        }
    }

    function showResult() {
        let init = current_app.total_energy_init,
            own = current_app.total_energy_collect_own || 0,
            friends = (getCurrentEnergyAmount() - init - own) || 0;

        if (!~init) return msgNotice("数据统计失败");

        return msgNotice(energyStr(friends, own) || "A fruitless attempt");

        // tool function(s) //

        function showFloatyResult(you, friends, timeout) {

            current_app.floaty_msg_signal = 1;
            timeout = Math.ceil(timeout / 1000) * 1000;

            let hints = [];

            if (!~you) hints.push("SORRY");
            else {
                if (you) hints.push("YOURSELF: " + you);
                if (friends) hints.push("FRIENDS: " + friends);
            }
            let hint_len = hints.length;
            if (hint_len === 2) hints = hints.map(str => str.replace(/(\w{3})\w+(?=:)/, "$1")); // %alias%.slice(0, 3) + ": \d+g"
            if (hint_len === 1) hints = hints.map(str => str.replace(/(\w+)(?=:).*/, "$1")); // %alias% only
            if (!hints.length) {
                let pickUpOneNote = () => {
                    let notes = "NEVER.contains(SAY+DIE)%5cnLIFE+!%3d%3d+ALL+ROSES%5cnIMPOSSIBLE+%3d%3d%3d+undefined%5cnGOD.FAIR()+%3d%3d%3d+true%5cn%2f((%3f!GIVE+(UP%7cIN)).)%2b%2fi%5cnWORKMAN+%3d+new+Work()%5cnLUCK.length+%3d%3d%3d+Infinity%5cnLLIST.next+%3d%3d%3d+LUCKY%5cnBLESSING.discard(DISGUISE)%5cnWATER.drink().drink()".split("%5cn");
                    return decodeURIComponent(notes[~~(Math.random() * notes.length)]).replace(/\+(?!\/)/g, " ");
                };
                hints = [pickUpOneNote()];
                hint_len = hints.length;
            }

            let timeout_prefix = "(",
                timeout_suffix = ")",
                base_height = HEIGHT * 2 / 3,
                message_height = cY(80),
                hint_height = message_height * 0.7,
                timeout_height = hint_height,
                color_stripe_height = message_height * 0.2;

            let message_layout =
                <frame gravity="center">
                    <text id="text" bg="#cc000000" size="24" padding="10 2" color="#ccffffff" gravity="center">
                    </text>
                </frame>;

            let timeout_layout =
                <frame gravity="center">
                    <text id="text" bg="#cc000000" size="14" color="#ccffffff" gravity="center">
                    </text>
                </frame>;

            let color_stripe_layout =
                <frame gravity="center">
                    <text id="text" bg="#ffffffff" size="24" padding="10 2" color="{{colors.toString(-1)}}" gravity="center">
                    </text>
                </frame>;

            let hint_layout =
                <frame gravity="center">
                    <text id="text" bg="#cc000000" size="14" color="#ccffffff" gravity="center">
                    </text>
                </frame>;

            let message_raw_win = floaty.rawWindow(message_layout);
            message_raw_win.text.setText(!~you && "Statistics Failed" || (you + friends).toString() || "0");
            message_raw_win.setSize(-2, 0);

            waitForAction(() => message_raw_win.getWidth() > 0, 5000);
            let min_width = Math.max(message_raw_win.getWidth(), ~~(WIDTH * 0.54), WIDTH / 4 * hint_len);

            let left_pos = (WIDTH - min_width) / 2;
            message_raw_win.setPosition(left_pos, base_height);
            message_raw_win.setSize(min_width, message_height);

            let hint_top_pos = base_height - color_stripe_height - hint_height,
                color_stripe_up_top_pos = base_height - color_stripe_height,
                color_stripe_down_top_pos = base_height + message_height,
                timeout_top_pos = base_height + message_height + color_stripe_height;

            let avg_width = ~~(min_width / hint_len);

            let stripe_color_map = {
                "YOU": "#7dae17",
                "FRI": "#2ba653",
                "SOR": "#a3555e", // SORRY
                "OTHER": "#907aa3",
            };

            for (let i = 0; i < hint_len; i += 1) {
                let current_hint = hints[i],
                    current_hint_color = "#cc" + (stripe_color_map[current_hint.slice(0, 3)] || stripe_color_map["OTHER"]).slice(1);
                let color_stripe_bg = colors.parseColor(current_hint_color);
                let current_left_pos = left_pos + avg_width * i;
                let current_width = i === hint_len - 1 ? min_width - (hint_len - 1) * avg_width : avg_width;

                let color_stripe_raw_win_down = floaty.rawWindow(color_stripe_layout);
                color_stripe_raw_win_down.setSize(1, 0);
                color_stripe_raw_win_down.text.setBackgroundColor(color_stripe_bg);
                color_stripe_raw_win_down.setPosition(current_left_pos, color_stripe_down_top_pos);

                let color_stripe_raw_win_up = floaty.rawWindow(color_stripe_layout);
                color_stripe_raw_win_up.setSize(1, 0);
                color_stripe_raw_win_up.text.setBackgroundColor(color_stripe_bg);
                color_stripe_raw_win_up.setPosition(current_left_pos, color_stripe_up_top_pos);

                let hint_raw_win = floaty.rawWindow(hint_layout);
                hint_raw_win.setSize(1, 0);
                hint_raw_win.text.setText(current_hint);
                hint_raw_win.setPosition(current_left_pos, hint_top_pos);

                color_stripe_raw_win_down.setSize(current_width, color_stripe_height);
                color_stripe_raw_win_up.setSize(current_width, color_stripe_height);
                hint_raw_win.setSize(current_width, hint_height);
            }

            let timeout_raw_win = floaty.rawWindow(timeout_layout);
            timeout_raw_win.setSize(1, 0);
            timeout_raw_win.setPosition(left_pos, timeout_top_pos);
            timeout_raw_win.setSize(min_width, timeout_height);

            ui.run(() => {
                let tt = timeout / 1000;
                let tt_text = () => timeout_prefix + tt-- + timeout_suffix;
                timeout_raw_win.text.setText(tt_text());
                setInterval(() => {
                    if (tt < 0) return;
                    if (tt < 1) {
                        floaty.closeAll();
                        current_app.floaty_msg_signal = 0;
                        return tt--;
                    }
                    let max_try_times = 3;
                    while (max_try_times--) {
                        try {
                            timeout_raw_win.text.setText(tt_text());
                            break;
                        } catch (e) {
                            // nothing to do here
                        }
                    }
                }, 1000);
            });
        }

        function energyStr(friends_num, self_num) {
            let msg = "";
            if (self_num) msg = "Energy from yourself: " + self_num + "g";
            if (friends_num) msg += (self_num ? "\n" : "") + "Energy from friends: " + friends_num + "g";
            return msg;
        }

        function msgNotice(msg) {
            msg.split("\n").forEach(msg => log(msg));
            if (msg.match(/(失败)|(错误)/)) own = -1;
            config.floaty_msg_switch ? showFloatyResult(own, friends, 3500) : toast(msg);
        }
    }

    function endProcess() {
        current_app.saveState("blacklist", current_app.blacklist);
        current_app.kill_when_done ? endAlipay(closeAfWindows) : closeAfWindows();
        waitForAction(() => !current_app.floaty_msg_signal, 8000);
        threads.shutDownAll(); // kill all threads started by threads.start()
        current_app.is_screen_on || keycode(26);
        messageAction(current_app.quote_name + "任务结束", 1, 0, 0, "both_n");
        exit();

        // tool function(s) //

        function closeAfWindows() {
            let kw_login_with_new_user = textMatches(/换个新账号登录|[Aa]dd [Aa]ccount/),
                kw_back_btn = id("com.alipay.mobile.antui:id/back_button"),
                kw_af_title = text("蚂蚁森林"),
                kw_close = desc("关闭");
            while (!~"condition listed as below" ||
            kw_af_title.exists() && clickBounds([kw_close, "try"]) ||
            kw_login_with_new_user.exists() && clickBounds([kw_back_btn, "try"])) {
                sleep(600);
            }
        }

        function endAlipay(minimizeFunc) {

            let old_pgk = current_app.ori_app_package;
            killCurrentApp(current_app.package_name, null, minimizeFunc);

            return waitForAction(() => currentPackage() === old_pgk, 5000);
        }
    }

    // tool function(s) //

    function getCurrentEnergyAmount() {
        if (!waitForAction(() => descMatches(/\d+g/).exists() && desc("合种").exists(), 8000)) return -1; // just in case
        return descMatches(/\d+g/).findOnce().desc().match(/\d+/)[0] - 0;
    }

    function checkBlackTimestamp(timestamp) {

        if (typeof timestamp === "undefined") return true;

        let now = new Date();
        let duration_ms = timestamp + 86400000 - now.getTime();
        if (duration_ms <= 0) return;

        if (!config.show_console_log_details) return true;

        let duration_date_obj = new Date(Date.parse(now.toDateString()) + duration_ms);
        let fillZero = num => ("0" + num).slice(-2);
        let hh = duration_date_obj.getHours(),
            mm = duration_date_obj.getMinutes(),
            ss = duration_date_obj.getSeconds(),
            hh_str = (!hh ? "" : (fillZero(hh) + "时")),
            mm_str = (!mm && !hh ? "" : (fillZero(mm) + "分")),
            ss_str = (!mm && !hh ? ss : fillZero(ss)) + "秒";
        return hh_str + mm_str + ss_str + "后解除";
    }
}

// tool function(s) //

function checkBugVersions() {
    let thread_bug_dialogs = threads.start(function () {
        let bug_versions = {
            // "4.1.0 Alpha5": "无法使用蚂蚁森林图形配置界面\n-> dialogs模块items属性异常", // solved since v1.5.2
            // "4.1.1 Alpha2": "无法使用蚂蚁森林图形配置界面\n-> dialogs模块inputHint\/inputPrefill属性异常", solved since v1.5.2
            "Pro 7.0.0-7": "脚本运行后可能导致Auto.js崩溃",
        };
        if (!(current_autojs_version in bug_versions)) return;
        let diag_bug = dialogs.build({
            title: "Auto.js版本异常提示",
            content: "脚本可能无法正常运行\n建议更换Auto.js版本\n或等待脚本后续更新\n\nAuto.js版本:\n-> " + current_autojs_version +
                "\n\n异常详情:\n-> " + bug_versions[current_autojs_version],
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
            diag_bug.dismiss();
        });
        diag_bug.show();
    });
    thread_bug_dialogs.join("");
}

function promptConfig() {
    let no_longer_prompt_flag = false,
        config_now_flag = 0;
    let prompt_config_thread = threads.start(function () {
        let diag = dialogs.build({
            title: "参数调整提示",
            content: "运行前建议进行一些个性化参数调整\n需要现在打开配置页面吗\n\n点击\"跳过\"将使用默认配置\n以后可随时运行此脚本进行参数调整\n-> \"Ant_Forest_Settings.js\"",
            negative: "跳过",
            positive: "现在配置",
            checkBoxPrompt: "不再提示",
            autoDismiss: false,
            canceledOnTouchOutside: false,
        });
        diag.on("check", checked => no_longer_prompt_flag = !!checked);
        diag.on("negative", () => diag.dismiss());
        diag.on("positive", () => ++config_now_flag && diag.dismiss());
        diag.show();
    });
    prompt_config_thread.join();
    no_longer_prompt_flag && storage_af.put("config_prompted", 1);
    if (config_now_flag) {
        //engines.execScriptFile("./!Ant_Forest_Settings.js");
        runJsFile("!Ant_Forest_Settings", current_autojs_package);
        storage_af.put("af_postponed", true);
        exit();
    }
}

// global tool function(s) //
// MODIFIED to adapt this app //

// modified for this app optimization //
/**
 * Launch app, and wait for condition(s) ready for at most 5 times
 */
function launchThisApp(intent, no_msg_flag) {
    intent = intent || null;
    if (typeof intent !== "object") messageAction("\"launchThisApp\"的intent参数类型不正确", 8, 1, 0, 1);
    let max_retry_times = 7;
    while (max_retry_times--) {
        let max_launch_times = 3;
        if (!no_msg_flag && !current_app.first_time_run) toast("重新开始" + current_app.quote_name + "任务");
        while (max_launch_times--) {
            app.startActivity(intent);
            if (waitForAction(() => currentPackage() === current_app.package_name, 5000)) break;
        }
        if (max_launch_times < 0) messageAction("打开" + current_app.quote_name + "失败", 8, 1, 0, 1);
        current_app.first_time_run = 0;
        if (current_app.firstTimeRunConditionFun === null || current_app.firstTimeRunConditionFun === undefined) break;
        let max_wait_times = 20,
            max_click_reload_times = 80;
        while (!waitForAction(current_app.firstTimeRunConditionFun, 3000) && max_wait_times-- && max_click_reload_times) {
            if (desc("重新加载").exists()) {
                try {
                    clickBounds(desc("重新加载"));
                } catch (e) {
                    // nothing to do here
                }
                max_wait_times = 20;
                max_click_reload_times--;
            }
        }
        if (max_launch_times >= 0 && max_click_reload_times > 0) break;
        killCurrentApp();
    }
    if (max_retry_times < 0) messageAction(current_app.quote_name + "首页状态准备失败", 8, 1, 0, 1);
}

/**
 * Close current app, and wait for at most 15s
 * Property "first_time_run" will be 0
 */
function killCurrentApp(package_name, keycode_back_unacceptable_flag, minimizeFunc) {
    let pkg = package_name || current_app.package_name;
    let shell_error = shell("am force-stop " + pkg, true).error;
    if (!!shell_error) {
        // messageAction(shell_error.split(/\n/)[0], 4, 1);
        return keycode_back_unacceptable_flag ? false : tryMinimizeApp();
    }
    waitForAction(() => currentPackage() !== pkg, 15000, "关闭" + pkg + "失败", 9, 1);
    current_app.first_time_run = 0;
    return true;

    // tool function(s) //

    function tryMinimizeApp() {
        minimizeFunc && minimizeFunc();
        let max_try_times = 20;
        while (max_try_times--) {
            keycode(4);
            if (waitForAction(() => currentPackage() !== pkg, 2000)) break;
        }
        if (max_try_times < 0) return messageAction("最小化当前应用失败", 4, 1);
        return true;
    }
}

/**
 * Handle message - toast, console and actions
 * Record message level in storage - the max "msg_level" value
 * @param {string} msg - message
 * @param {number|string} [msg_level] - message level
 * <br>
 *      - 0/v/verbose - console.verbose(msg)<br>
 *      - 1/l/log - console.log(msg)<br>
 *      - 2/i/info - console.info(msg)<br>
 *      - 3/w/warn - console.warn(msg)<br>
 *      - 4/e/error - console.error(msg)<br>
 *      - 8/x - console.error(msg) & exit<br>
 *      - 9/h - console.error(msg) & exit to homepage<br>
 *      - t/title - msg becomes a title like "[ Sackler ]"
 *
 * @param {number} [if_needs_toast] - if needs toast
 * @param {number} [if_needs_arrow] - if needs an arrow (whose length at most 10) before msg (not for toast)
 * <br>
 *     - 1 - "-> I got you now"<br>
 *     - 3 - "---> I got you now"
 *
 * @param {number|string} [if_needs_split_line] - if needs a split line
 * <br>
 *     - 32-bit hyphen line - "------------" (length: 32)
 * @return {boolean} - if msg_level including 3 or 4, then return false; anything else, including undefined, return true
 **/
function messageAction(msg, msg_level, if_needs_toast, if_needs_arrow, if_needs_split_line) {
    if (if_needs_toast) toast(msg);
    if (typeof if_needs_split_line === "string" && if_needs_split_line.match(/^both(_n)?$|up/)) {
        showSplitLine();
        if (if_needs_split_line === "both") if_needs_split_line = 1;
        else if (if_needs_split_line === "both_n") if_needs_split_line = "\n";
        else if (if_needs_split_line === "up") if_needs_split_line = 0;
    }
    if (if_needs_arrow) {
        if (if_needs_arrow > 10) messageAction("\"if_needs_arrow\"参数不可大于10", 8, 1, 0, 1);
        msg = "> " + msg;
        for (let i = 0; i < if_needs_arrow; i += 1) msg = "-" + msg;
    }
    let exit_flag = false;
    switch (msg_level) {
        case 0:
        case "verbose":
        case "v":
            msg_level = 0;
            console.verbose(msg);
            break;
        case 1:
        case "log":
        case "l":
            msg_level = 1;
            console.log(msg);
            break;
        case 2:
        case "i":
        case "info":
            msg_level = 2;
            console.info(msg);
            break;
        case 3:
        case "warn":
        case "w":
            msg_level = 3;
            console.warn(msg);
            break;
        case 4:
        case "error":
        case "e":
            msg_level = 4;
            console.error(msg);
            break;
        case 8:
        case "x":
            msg_level = 4;
            console.error(msg);
            exit_flag = true;
            break;
        case 9:
        case "h":
            msg_level = 4;
            console.error(msg);
            keycode(3);
            exit_flag = true;
            break; // useless, just for inspection
        case "t":
        case "title":
            msg_level = 1;
            console.log("[ " + msg + " ]");
            break;
    }
    if (if_needs_split_line) showSplitLine(typeof if_needs_split_line === "string" ? if_needs_split_line : "");
    exit_flag && exit();
    current_app.msg_level = current_app.msg_level ? Math.max(current_app.msg_level, msg_level) : msg_level;
    return !(msg_level in {3: 1, 4: 1});
}

/**
 * wait some period of time for "f" being FALSE
 * @param {number|object|object[]|function|function[]} f - if "f" then waiting
 * <br>
 *     - number - 5000 - equals to "sleep(5000)"<br>
 *     - object - text("abc") - equals to "() => text("abc").exists()"<br>
 *     - function - () => text("abc").exists() - if (!f()) waiting<br>
 *     - array - [obj(s), func(s), booleans(s)] - a multi-condition array (meet all (not one of) conditions)
 *
 * @param {number|number[]} [timeout_or_with_interval] - a period of time, or, with a certain interval in a same array like [5000, 1000]
 * @param {string} [msg] - a message if timed out - see "messageAction"
 * @param {number|string} [msg_level] - see "messageAction"
 * @param {number} [if_needs_toast] - see "messageAction"
 * @param {number} [if_needs_arrow] - see "messageAction"
 * @param special_bad_situation {...function|function[]|object|object[]}
 * @returns {boolean} - if timed out
 */
function waitForAction(f, timeout_or_with_interval, msg, msg_level, if_needs_toast, if_needs_arrow, special_bad_situation) {
    timeout_or_with_interval = timeout_or_with_interval || [10000, 300];
    if (typeof timeout_or_with_interval === "number") timeout_or_with_interval = [timeout_or_with_interval, 300];
    let timeout = timeout_or_with_interval[0],
        check_interval = timeout_or_with_interval[1];
    msg_level = msg_level || (msg_level === 0 ? 0 : 1);
    let bad_situation_pending = 1000;

    return checkFunc(f);

    function checkFunc(f) {
        if (typeof f === "object") {
            let classof = Object.prototype.toString.call(f).slice(8, -1);
            if (classof !== "Array") return check(() => f.exists());
            for (let i = 0, len = f.length; i < len; i += 1) {
                if (!(typeof f[i]).match(/function|object/)) messageAction("数组参数中含不合法元素", 9, 1);
                if (!checkFunc(f[i])) return false;
            }
            return true;
        } else if (typeof f === "function") return check(f);
        else if (typeof f === "number") return sleep(f);
        else messageAction("\"waitForAction\"传入f参数不合法\n\n" + f.toString() + "\n", 9, 1, 1);

        function check(f) {
            while (!f() && timeout > 0) {
                sleep(check_interval);
                timeout -= check_interval;
                if (bad_situation_pending >= 1000) {
                    if (current_app.global_bad_situation) checkBadSituation(current_app.global_bad_situation);
                    if (special_bad_situation) checkBadSituation(special_bad_situation);
                    bad_situation_pending %= 1000;
                }
                bad_situation_pending += check_interval;
            }
            timeout <= 0 && msg ? messageAction(msg, msg_level, if_needs_toast, if_needs_arrow) : false;
            return timeout > 0;
        }
    }
}

/**
 * @param {object|array} f - an object or object with *.bounds() or [func, additional function]
 * <br>
 *     - text("abc").desc("def")<br>
 *     - text("abc").desc("def").bounds()
 *     - [text("abc"), "try"]  -- means: if (text("abc").exists()) clickBounds("text("abc"))
 *     - [text("abc").bounds(), () => text("def").findOnce().bounds() > 0]
 *
 * @param {number|object[]} [if_continuous] - continuously click an object with condition(s)
 * <br>
 *     - **CAUTION** - if needs continuously click, f must be an object (not with*.bounds())
 *     - 1 - continuously click "f" if "f" is in screen<br>
 *     - [id("rst"), text("opq")] - continuously click "f" if id("rst") AND text("opq") in screen<br>
 *     - [1, text("opq")] - continuously click "f" if "f" AND text("opq") in screen
 * @param {number} [max_check_times=3] - max times for checking
 * @param {number} [check_interval=1000] - interval time for every checking
 * @param {number|["x", number]|["y", number]} [padding] - padding for clicking coordinate
 * <br>
 *     - 12 | ["y", 12] - (333, 666) -> (333, 666 + 12)<br>
 *     - -4 | ["y", 4] - (333, 666) -> (333, 666 - 4)<br>
 *     - ["x", -3] - (333, 666) -> (333 - 3, 666)
 *
 * @param special_bad_situation {...function|function[]|object|object[]}
 * @return {boolean} if reached max check time;
 */
function clickBounds(f, if_continuous, max_check_times, check_interval, padding, special_bad_situation) {

    let classof = param => Object.prototype.toString.call(param).slice(8, -1);

    if (!f) return messageAction("clickBounds的f参数无效", 0, 0, 0) && 0;

    let func = f,
        additionFunc;
    if (classof(f) === "Array") {
        func = f[0];
        if (!func) return messageAction("clickBounds的f[0]参数无效", 0, 0, 0) && 0;
        additionFunc = f[1];
    }

    if (func.toString().match(/^Rect\(/) && if_continuous) messageAction("连续点击时 f参数不能是bounds():\n" + func.toString(), 8, 1);
    if (!!additionFunc && additionFunc !== "try" && typeof additionFunc !== "function") messageAction("additionFunc参数类型不是\"function\":\n" + additionFunc.toString(), 8, 1);

    if (typeof additionFunc !== "undefined") {
        if (additionFunc === "try" && (!func || !func.exists())) return false;
        if (typeof additionFunc === "function" && !additionFunc()) return false;
    }

    max_check_times = max_check_times || (if_continuous ? 3 : 1);
    check_interval = check_interval || (if_continuous ? 1000 : 0);
    if_continuous = if_continuous || [];
    if (if_continuous === 1) if_continuous = [1];
    else if (typeof if_continuous === "object" && Object.prototype.toString.call(if_continuous).slice(8, -1) !== "Array") {
        let tmp_arr = [];
        tmp_arr.push(if_continuous);
        if_continuous = tmp_arr;
    }

    let parsed_padding = padding ? parsePadding(padding) : null;
    let posb;
    let bad_situation_pending = 1000;

    let max_try_times_posb = 3,
        getPosb = () => func.toString().match(/^Rect\(/) ? func : func.findOnce().bounds();
    while (max_try_times_posb--) {
        try {
            posb = getPosb();
        } catch (e) {
            sleep(500);
            if (!func.exists()) break; // may be a better idea to use BoundsInside()
        }
    }
    if (max_try_times_posb < 0) posb = getPosb(); // let console show specific error messages

    if (if_continuous.length) {
        while (max_check_times--) {
            if (!checkArray()) break;
            if (bad_situation_pending >= 1000) {
                if (current_app.global_bad_situation) checkBadSituation(current_app.global_bad_situation);
                if (special_bad_situation) checkBadSituation(special_bad_situation);
                bad_situation_pending %= 1000;
            }
            click(posb.centerX() + (parsed_padding ? parsed_padding.x : 0), posb.centerY() + (parsed_padding ? parsed_padding.y : 0));
            sleep(check_interval);
            bad_situation_pending += check_interval;
        }
    } else {
        if ((func.toString().match(/^Rect\(/) || func.exists())) {
            if (current_app.global_bad_situation) checkBadSituation(current_app.global_bad_situation);
            if (special_bad_situation) checkBadSituation(special_bad_situation);
            click(posb.centerX() + (parsed_padding ? parsed_padding.x : 0), posb.centerY() + (parsed_padding ? parsed_padding.y : 0));
        }
    }

    return max_check_times >= 0;

    // tool function(s) //

    function parsePadding(padding) {
        let obj = {"x": 0, "y": 0};
        if (Object.prototype.toString.call(padding).slice(8, -1) === "Array") {
            if ((padding[0] !== "x" && padding[0] !== "y") || typeof padding[1] !== "number") messageAction("输入的padding参数不合法", 9, 1);
            obj[padding[0]] = padding[1];
        } else if (typeof padding === "number") {
            obj["y"] += padding;
        } else {
            messageAction("输入的padding类型不合法", 9, 1);
        }
        return obj;
    }

    function checkArray() {
        for (let i = 0, len = if_continuous.length; i < len; i += 1) {
            if (if_continuous[i] === 1) {
                if (!func.exists()) return;
            } else {
                if (!if_continuous[i].exists()) return;
            }
        }
        return true;
    }
}

/**
 * wait some period of time and do clicking if "f" was found
 * @param {number|object|object[]|function|function[]|boolean|function,number[]} f_or_with_click_interval - if "f" then waiting
 * <br>
 *     - number - 5000 - equals to "sleep(5000)"<br>
 *     - object - text("abc") - equals to "() => text("abc").exists()"<br>
 *     - function - () => text("abc").exists() - if (!f()) waiting<br>
 *     - boolean - text("abc").exists() - converted to "() => text("abc").exists()" then check<br>
 *     - array - [obj(s), func(s), booleans(s)] - a multi-condition array
 *     - array - [f, click_interval] - default value of click_interval is 100 (ms)
 *
 * @param {number} [timeout_or_with_interval] - a period of time, or, with a certain interval in a same array like [5000, 1000]
 * @param {string} [msg] - a message if timed out - see "messageAction"
 * @param {number|string} [msg_level] - see "messageAction"
 * @param {number} [if_needs_toast] - see "messageAction"
 * @param {number} [if_needs_arrow] - see "messageAction"
 * @param special_bad_situation {...function|function[]|object|object[]}
 * @returns {boolean} - if timed out
 */
function waitForActionAndClickBounds(f_or_with_click_interval, timeout_or_with_interval, msg, msg_level, if_needs_toast, if_needs_arrow, special_bad_situation) {

    let func = f_or_with_click_interval,
        click_interval = 100;

    let classof = Object.prototype.toString.call(f_or_with_click_interval).slice(8, -1);
    if (classof === "Array") {
        func = f_or_with_click_interval[0];
        click_interval = f_or_with_click_interval[1];
    }
    if (!waitForAction(func, timeout_or_with_interval, msg, msg_level, if_needs_toast, if_needs_arrow, special_bad_situation)) return false;
    sleep(click_interval);
    return clickBounds(func);
}

/**
 * @param {string} [extra_str=""] string you wanna append after the split line
 * console.log({a 32-bit hyphen split line});
 **/
function showSplitLine(extra_str) {
    extra_str = extra_str || "";
    let split_line = "";
    for (let i = 0; i < 32; i += 1) split_line += "-";
    log(split_line + extra_str);
    return true;
}

/**
 * check any situations may block the process while clicking, waiting or swiping
 * @param bad_situations {...function|function[]|object|object[]}
 */
function checkBadSituation(bad_situations) {
    for (let i = 0, len = arguments.length; i < len; i += 1) {
        if (!arguments[i]) continue;
        if (typeof arguments[i] === "function") {
            if (arguments[i]()) sleep(1500);
        } else {
            let classof = Object.prototype.toString.call(arguments[i]).slice(8, -1);
            if (classof === "Array") arguments[i].forEach(value => checkBadSituation(value));
            if (classof === "JavaObject" && arguments[i].exists()) {
                let posb = arguments[i].findOnce().bounds();
                click(posb.centerX(), posb.centerY());
                sleep(1500);
            }
        }
    }
}

function tryRequestScreenCapture() {
    if (current_app.request_screen_capture_flag) return;

    current_app.request_screen_capture_flag = 1;

    let thread_prompt = threads.start(function () {
        let kw_no_longer_prompt = id("com.android.systemui:id/remember");
        if (!waitForAction(kw_no_longer_prompt, 5000)) return;
        kw_no_longer_prompt.click();

        let kw_start_now_btn = className("Button").textMatches(/START NOW|立即开始/);
        if (!waitForAction(kw_start_now_btn, 2000)) return;
        kw_start_now_btn.click();
    });

    let thread_req;
    let max_try_times = 6;
    while (max_try_times--) {
        thread_req = threads.start(function () {
            try {
                return requestScreenCapture();
            } catch (e) {
                if (!max_try_times) throw Error(e);
            }
        });
        thread_req.join(1500);
        if (!thread_req.isAlive()) break;
        thread_req.interrupt();
    }

    if (max_try_times < 0) messageAction("截图权限申请失败", 8, 1);

    threads.start(function () {
        let max_try_times = 50;
        while (thread_req.isAlive() && max_try_times--) sleep(200);
        if (max_try_times < 0) {
            thread_req.interrupt();
            thread_prompt.interrupt();
            messageAction("截图权限申请超时", 8, 1);
        }
    }); // thread_req_timeout
}

function getVerName(package_name) {
    let pkgs = context.getPackageManager().getInstalledPackages(0).toArray();
    for (let i in pkgs) {
        if (pkgs[i].packageName.toString() === package_name) return pkgs[i].versionName
    }
}

// only for development test
function saveCurrentScreenCapture(key_name) {

    tryRequestScreenCapture();

    let path_prefix = "/sdcard/Scripts/Log/Capture/",
        file_name = key_name + "_" + getDateStr() + "_" + getTimeStr() + ".png",
        path = path_prefix + file_name;

    files.createWithDirs(path_prefix);
    captureScreen(path);
    messageAction("已存储屏幕截图文件: ", 0);
    messageAction(file_name, 0);

    // tool function(s) //

    function getDateStr(interval_days) {
        interval_days = interval_days || 0;
        let calc_date = new Date(new Date().getTime() + interval_days * 24 * 3600000),
            year = calc_date.getFullYear(),
            month_ori = calc_date.getMonth() + 1,
            month = month_ori < 10 ? "0" + month_ori : month_ori,
            day_ori = calc_date.getDate(),
            day = day_ori < 10 ? "0" + day_ori : day_ori;
        return year + month + day;
    }

    function getTimeStr() {
        let now = new Date(),
            norm_str = time => (time < 10 ? "0" : "") + time,
            hour = norm_str(now.getHours()),
            minute = norm_str(now.getMinutes()),
            second = norm_str(now.getSeconds());
        return hour + minute + second;
    }
}

function keycode(keycode_name) {
    // "KEYCODE_BACK" <=> "4"
    // "KEYCODE_HOME" <=> "3",
    // "KEYCODE_POWER" <=> "26",
    return shell("input keyevent " + keycode_name).code && KeyCode(keycode_name);
}

function runJsFile(js_path, autojs_pkg_name) {
    autojs_pkg_name = autojs_pkg_name || "org.autojs.autojs";
    if (autojs_pkg_name === "pro") autojs_pkg_name = "org.autojs.autojspro";
    js_path = "\/" + js_path.replace(/^\//, "").replace(/\.js$/, "") + ".js";
    app.startActivity({
        action: "VIEW",
        packageName: autojs_pkg_name,
        className: "org.autojs.autojs.external.open.RunIntentActivity",
        data: "file://" + files.cwd() + js_path,
    });
}