/**
 * @overview alipay ant forest auto-collect script
 *
 * @tutorial {@link https://github.com/SuperMonster003/Ant_Forest}
 * @last_modified Mar 19, 2019
 * @version 1.0.0
 * @author SuperMonster003
 *
 * @borrows {@link https://github.com/e1399579/autojs}
 * @borrows {@link https://github.com/hyb1996/Auto.js}
 * @borrows {@link https://github.com/Nick-Hopps/Ant-Forest-autoscript}
 */

auto();

engines.myEngine().setTag("exclusive_task", "af");
while (engines.all().filter(e => e.getTag("exclusive_task") && e.id < engines.myEngine().id).length) sleep(500);

let config = {
    non_break_check_time: ["07:28:00", "07:28:47"], // period for non-stop checking your own energy balls; leave [] if you don't need
    auto_js_log_record_path: "/sdcard/Scripts/Log/AutoJsLog.txt", // up to 512KB per file; leave 0 if not needed
    list_swipe_interval: 350, // unit: millisecond; set this value bigger if errors like "CvException" occurred
    show_collection_details: false, // whether to see nicknames with collection amounts in console
    show_help_details: false, // whether to see nicknames with help amounts in console
    color_green: "#1da06d", // color for collect icon with a hand pattern
    color_orange: "#f99137", // color for help icon with a heart pattern
    color_threshold_rank_list: 10, // 0 <= x <= 66 is recommended; the smaller, the stricter; max limit tested on Sony G8441
    color_threshold_help_collect_balls: 60, // 30 ~< x <= 83 is recommended; the smaller, the stricter; max limit tested on Sony G8441
    help_collet_img_intensity: 0, // 0 <= x <= 6, more samples for helping energy balls image matching, at the cost of time however
};

let WIDTH = device.width,
    HEIGHT = device.height,
    cX = num => Math.floor(num * WIDTH / 720),
    cY = num => Math.floor(num * HEIGHT / 1280),
    unlock_module = new (require("Unlock.js")),
    storage = storages.create("checkin"),
    storage_permanent = storages.create("permanent"),
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
        setScreenMetrics(WIDTH, HEIGHT);
        unlock_module.unlock();
        setAutoJsLogPath();
        setParams();
        getReady();
        loginSpecificUser();

        // tool function(s) //

        function setAutoJsLogPath() {

            let config_value = config.auto_js_log_record_path;

            if (config_value === 0) return;

            let path_norm = config_value || "/sdcard/Scripts/Log/AutoJsLog.txt";

            files.create(path_norm);

            console.setGlobalLogConfig({
                file: path_norm,
            });

            if (!config_value) {
                messageAction("Auto.js日志记录路径使用默认配置", 0, 0, 0, "up");
                messageAction(path_norm.slice(7), 0, 0, 1);
            }
        }

        function setParams() {

            current_app = new App("蚂蚁森林");
            current_app.is_screen_on = unlock_module.is_screen_on;
            current_app.kill_when_done = currentPackage() !== current_app.package_name;

            checkConfig();

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
                this.loadStateArr = loadStateArr;
                this.specific_user = setSpecificUser();
                this.total_energy_init = 0;
                this.total_energy_collect_own = 0;
                this.blacklist = handleFirstTimeRunBlacklist();

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
                            return result;
                        }
                    }
                    return messageAction("此设备未安装\"" + pkg_samples.join("\/") + "\"软件", 8, 1);
                }

                function setSpecificUser() {
                    if (!files.exists("/sdcard/Scripts/PWMAP.txt")) return;

                    let user_list = {
                        "G8441": {
                            login_username: restoredPasswordArr(["Diivwjzy", "CgaVVupt", "vtnxBort", "rGWLMssi", "yyMrvxwh", "vCgEsYeX", "mhhhKrKs", "aBzpePlf", "vCgEsYeX", "uwZBHJyB", "OJjVLqnK", "vdWfiyqz", "QKoDBAys", "pBeaUBok", "OxHJASdr", "kfZKajeG", "qFrYcVcV", "hUZmqfnS", "jPxvxwVQ", "YdbIBlMN", "GMVeXsWl", "JbJUWeHV", "OwswSgzl", "PiTRlvxt"]).join(""), // full username
                            login_pw: restoredPasswordArr(["FuWRFbsJ", "RWwJVXfl", "XulTOgtx", "vTfXcDkl", "BtscGaPX", "AHeQLExG", "mTFnRPrF", "XwMqWvJJ", "UjYdTkLI", "vtnxBort", "WCpUYQzT", "wKhDcCUB", "UjYdTkLI", "vvtiVtTi", "BhGfDTXT", "cHeTsJfl", "PCYWiRoY"]).join(""), // password for login
                            username_ident: restoredPasswordArr(["lMCZfRUB", "BGwvOQcP", "FuWRFbsJ", "lSKtBkCf", "MDmXclbM", "YYefCmtf", "wMeOXVRO", "arjzZklN", "yOAtBkQl", "pacCzWIV", "SHbobCJv", "ZDVpMeMN", "iZyCfEZv", "jzIkPVRa", "RRFaAIBt", "VxTEcerq", "yOAtBkQl", "uZsQDkYT"]).join(""), // username identify (often with some star symbols like 134***56789 or jo*****@gmail.com)
                        },
                        "E6683": {
                            login_username: restoredPasswordArr(["MnfMetyF", "OwswSgzl", "gXyqbqHi", "uLApPpuR", "WwaXaYkC", "AiOzwQel", "dZEowddf"]).join(""),
                            login_pw: restoredPasswordArr(["kFEAgSGx", "SIwPnlrp", "hUZmqfnS", "itRkikXe", "hpkSUpzq", "SIwPnlrp", "rvnJcnbV", "qGRaclKt", "WwaXaYkC", "vdWfiyqz", "FLefIEgk", "IRmqdqQJ"]).join(""),
                            username_ident: restoredPasswordArr(["pLYIVxOj", "BjdQPLJZ", "xMbEankn", "MDmXclbM", "FizXYqLR", "IsrmIUov", "GvTaKjkJ", "xfsFWydX", "bBwECFqj", "yCBhHtdj", "PlPutcdj", "ueqEhPgJ", "qCQBakfs", "dYFBNaKi", "mhhhKrKs"]).join(""),
                        }
                    };

                    let dev_model = device.model;
                    return dev_model in user_list ? user_list[dev_model] : null;
                }

                function handleFirstTimeRunBlacklist() {
                    let blacklist = loadState("blacklist", {}); // {friend_name: timestamp}
                    Object.keys(blacklist).forEach(name => {
                        if (checkBlackTimeStr(blacklist[name])) return;
                        delete blacklist[name];
                        messageAction("已从黑名单中移除: " + name, 0);
                    });
                    return blacklist;
                }

                // function function(s) //

                function firstTimeRunCondition() {
                    let txt_h5_title_id = "com.alipay.mobile.nebula:id/h5_tv_title",
                        kw_af_title = id(txt_h5_title_id).textMatches(/蚂蚁森林|Ant Forest/),
                        kw_login_or_switch = idMatches(/.*switchAccount|.*loginButton/);
                    return kw_af_title.exists() && desc("合种").exists() || kw_login_or_switch.exists();
                }

                function saveState(zone, state, permanent_flag) {
                    if (!zone) messageAction("无效的\"save_zone\"参数", 8, 1);
                    let zone_info = "af_" + zone.toString(),
                        state_info = state || 1;
                    permanent_flag ? storage_permanent.put(zone_info, state_info) : storage.put(zone_info, state_info);
                }

                function loadState(zone, default_value, permanent_flag) {
                    if (!zone) messageAction("无效的\"load_zone\"参数", 8, 1);
                    let zone_info = "af_" + zone.toString();
                    return permanent_flag ? storage_permanent.get(zone_info, default_value) : storage.get(zone_info, default_value);
                }

                function loadStateArr(arr) {
                    for (let i = 0, len = arr.length; i < len; i += 1) {
                        if (!storage.get("af_" + arr[i].toString())) return false;
                    }
                    return true;
                }
            }

            function checkConfig() {

                let swipe_intv = config.list_swipe_interval;
                if (!swipe_intv || isNaN(swipe_intv) || swipe_intv < 300 || swipe_intv > 1000) {
                    config.list_swipe_interval = swipe_intv < 300 ? 300 : 1000; // min safe value i believe
                    messageAction("配置参数\"list_swipe_interval\"已校正为: " + config.list_swipe_interval, 3);
                }

                if (typeof config.show_collection_details !== "boolean") {
                    config.show_collection_details = !!config.show_collection_details; // set to Boolean forcely
                    messageAction("配置参数\"show_collection_details\"已校正为: " + config.show_collection_details, 1);
                }
            }
        }

        function getReady() {
            let pkg = current_app.package_name;
            if (currentPackage() !== pkg) {
                app.launch(pkg);
                if (currentPackage() === "org.autojs.autojs") return sleep(1000);
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
            let shell_cmd_acc_manager = "am start -n com.eg.android.AlipayGphone/com.alipay.mobile.security.accountmanager.ui.AccountManagerActivity_";

            shell(shell_cmd_acc_manager, true);

            let max_wait_times = 5,
                try_times = 0;
            while (!waitForAction(kw_login_with_new_user, try_times++ ? 5000 : 1500) && max_wait_times--) shell(shell_cmd_acc_manager + " -S", true);
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
            if (max_try_times_user_acc_input < 0) return messageAction("未找到用户名输入文本框", 4, 1, 1);

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

            getReady() && handleTxtPipeline();

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
                    "简体中文": () => text("简体中文").findOnce().parent().parent().parent().children().size() === 2,
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

        requestScreenCapture();

        let kw_more_friends = desc("查看更多好友"),
            kw_cooperation_btn = desc("合种");

        let kw_ripe_energy_balls = className("android.widget.Button").filter(function (w) {
            return !!w.desc().match(/.*克/);
        });

        checkOwnEnergy();
        checkFriendsEnergy();
        goBackToAfHome();

        // main function(s) //

        function checkOwnEnergy() {

            current_app.total_energy_init = getCurrentEnergyAmount();

            waitForAction(() => kw_more_friends.exists() || kw_cooperation_btn.exists(), 5000); // just in case
            sleep(1000); // make energy balls ready

            let check_time = config.non_break_check_time;
            if (!check_time || !check_time.length) return checkOnce();

            let now = new Date(),
                today_date = now.toDateString(),
                min_time = Date.parse(today_date + " " + check_time[0]),
                max_time = Date.parse(today_date + " " + check_time[1]),
                in_check_remain_range = min_time < now && now < max_time;

            if (in_check_remain_range) checkRemain();
            else if (!checkOnce()) return;

            current_app.total_energy_collect_own = getEnergyDiff();

            // tool function(s) //

            function checkRemain() {
                toastLog("Checking remaining time");
                while (new Date() < max_time && (sleep(180) || 1)) checkOnce();
                toastLog("Checking completed");
            }

            function checkOnce() {
                let selector_buttons = kw_ripe_energy_balls.find();
                if (!selector_buttons.size()) return;
                selector_buttons.forEach(w => clickBounds(w.bounds()));
                return true;
            }

            // tool function(s) //

            function getEnergyDiff() {
                let energy_rec = current_app.total_energy_init,
                    tmp_energy_rec;
                if (!waitForAction(() => energy_rec !== (tmp_energy_rec = getCurrentEnergyAmount()), 5000)) return 0;
                energy_rec = tmp_energy_rec;
                while (waitForAction(() => energy_rec !== (tmp_energy_rec = getCurrentEnergyAmount()), 1000)) {
                    energy_rec = tmp_energy_rec;
                }
                return energy_rec - current_app.total_energy_init;
            }
        }

        function checkFriendsEnergy() {

            let kw_rank_list_self = idMatches(/.*J_rank_list_self/);

            if (!init()) return;

            let area; // bounds limited to friends list items inside screen
            let list_end_signal;
            let thread_list_end = threads.start(endOfListThread);
            let max_safe_swipe_times = 125; // just for avoiding infinite loop

            while (max_safe_swipe_times--) {

                let targets = getCurrentScreenTargets(), // [[targets_green], [targets_orange]]
                    pop_pt_y;

                while ((pop_pt_y = targets[0].pop() || targets[1].pop())) {
                    click(WIDTH * 0.5, pop_pt_y + cY(60));
                    forestPageGetReady();
                    collectBalls();
                    helpCollect();
                    backToHeroList();
                }

                if (list_end_signal) break;
                swipeUp();
            }

            return list_end_signal;


            // key function(s) //

            function init() {
                waitForAction(kw_more_friends, 8000); // just in case
                kw_more_friends.click();

                let max_try_times = 180,
                    rankListReady = () => kw_rank_list_self.exists() && kw_rank_list_self.findOnce().childCount(),
                    kw_try_again = desc("再试一次");
                while (!waitForAction(rankListReady, 500) && max_try_times--) {
                    kw_try_again.exists() && kw_try_again.click(); // for desc("服务器打瞌睡了").exists()
                }
                if (max_try_times < 0) return messageAction("进入好友排行榜超时", 3, 1);

                threads.start(expandHeroList);
                return sleep(500) || 1; // a small interval for page ready
            }

            function expandHeroList() {
                let kw_list_more = idMatches(/.*J_rank_list_more/);
                while (!desc("没有更多了").exists()) {
                    kw_list_more.exists() && kw_list_more.click();
                    sleep(200);
                }
            }

            function getCurrentScreenTargets() {

                let kw_title_reference = textMatches(/.+排行榜/);

                waitForAction(kw_rank_list_self, 8000); // make page ready

                let targets_green = [],
                    targets_orange = [];

                area = area || {
                    l: ~~(WIDTH * 0.7),
                    t: kw_title_reference.exists() ? kw_title_reference.findOnce().parent().parent().bounds().bottom + 1 : cY(145),
                };

                let capt_img,
                    regexp_energy_amount = new RegExp("\\d\+\(\\\.\\d\+\)\?\(k\?g|t\)");

                boundsInside(area.l, area.t, WIDTH, HEIGHT - 1).descMatches(regexp_energy_amount).find().forEach(w => {
                    let state_ident_node = w.parent().child(w.parent().childCount() - 2);
                    if (state_ident_node.childCount()) return; // exclude identifies with countdown

                    capt_img = capt_img || captCurrentScreen();
                    let find_color_options = getFindColorOptions(w);

                    try {
                        let pt_green = images.findColor(capt_img, config.color_green, find_color_options);
                        if (pt_green) return checkBlackList(w) && targets_green.unshift(pt_green.y);

                        let pt_orange = images.findColor(capt_img, config.color_orange, find_color_options);
                        if (pt_orange) return checkBlackList(w) && targets_green.unshift(pt_orange.y);
                    } catch (e) {
                        log(find_color_options); ////TEST////
                        log(w.bounds()); ////TEST////
                        log(w.desc()); ////TEST////
                        throw Error(e);
                    }
                });

                return [targets_green, targets_orange];

                // tool function(s) //

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
                        l: area.l,
                        t: parent_node.bounds().top,
                    };
                    return {
                        region: [region_ref.l, region_ref.t, WIDTH - region_ref.l, parent_node.bounds().centerY() - region_ref.t],
                        threshold: config.color_threshold_rank_list,
                    };
                }

                function checkBlackList(w) {

                    // special treatment for first 3 ones
                    let getFriendName = w => w.parent().child(1).desc() || w.parent().child(2).desc();

                    // if not in black list, then return true
                    return !(getFriendName(w) in current_app.blacklist);
                }

                // function timeArea(pt) {
                //     let in_time_area = boundsInside(~~(pt.x - cX(92)), ~~(pt.y - cY(92)), ~~(pt.x + cX(92)), ~~(pt.y + cY(92))).descMatches(/\d+’/);
                //     if (!in_time_area.exists()) return false;
                //     return in_time_area.findOnce().bounds();
                // }
            }

            function forestPageGetReady() {
                let kw_wait_for_awhile = descMatches(/.*稍等片刻.*/);
                waitForAction(kw_wait_for_awhile, 5000);
                let max_safe_wait_times = 600;
                while (kw_wait_for_awhile.exists() && max_safe_wait_times--) sleep(200); // keep waiting for at most 2 min

                let kw_forest_page = descMatches(/你收取TA|发消息/);
                if (!waitForAction(kw_forest_page, 5000)) return;

                sleep(1000); // average time is about 879.83 ms after energy balls ready (Sony G8441)
            }

            function collectBalls() {

                let checkRipeBalls = () => descMatches(/收集能量\d+克/).find(),
                    ripe_balls,
                    ripe_flag,
                    safe_max_try_times = 6;

                let kw_collected = desc("你收取TA"),
                    ori_collected_amount = getOperateData(kw_collected),
                    collected_amount = ori_collected_amount,
                    tmp_collected_amount;

                while ((ripe_balls = checkRipeBalls()).size() && safe_max_try_times--) {
                    ripe_flag = 1;
                    ripe_balls.forEach(w => clickBounds(w.bounds()));

                    if (!waitForAction(() => collected_amount !== (tmp_collected_amount = getOperateData(kw_collected)), 5000)) break;
                    collected_amount = tmp_collected_amount;
                    while (waitForAction(() => collected_amount !== (tmp_collected_amount = getOperateData(kw_collected)), 500)) {
                        collected_amount = tmp_collected_amount;
                    }
                }

                if (ripe_flag && config.show_collection_details) {
                    let friend_name = textMatches(/.*的蚂蚁森林/).findOnce().text().match(/.+(?=的蚂蚁森林)/)[0];
                    log(friend_name + ": " + (collected_amount - ori_collected_amount) + "g (collect)");
                }
            }

            function helpCollect() {
                let kw_energy_ball = className("Button").desc("\xa0"),
                    capt_img_arr = [images.toBytes(captureScreen())],
                    orange = config.color_orange,
                    orange_threshold = config.color_threshold_help_collect_balls,
                    clicked_flag;

                let i = Math.min(parseInt(config.help_collet_img_intensity || 0), 6);
                while (i-- && (sleep(200) || 1)) capt_img_arr.push(images.toBytes(captureScreen())); // for energy balls' flicker

                kw_energy_ball.find().forEach(w => {
                    let b = w.bounds();
                    let options = {
                        region: [b.left, b.top, b.width(), b.height()],
                        threshold: orange_threshold,
                    };

                    let pt;
                    for (let i = 0, len = capt_img_arr.length; i < len; i += 1) {
                        if (pt = images.findColor(images.fromBytes(capt_img_arr[i]), orange, options)) break;
                    }

                    if (!pt) return;
                    click(b.centerX(), b.centerY());
                    clicked_flag = true;
                });

                if (!clicked_flag) return;

                let kw_helped = desc("你给TA助力"),
                    ori_helped_amount = getOperateData(kw_helped),
                    helped_amount = ori_helped_amount,
                    tmp_helped_amount;


                if (!waitForAction(() => helped_amount !== (tmp_helped_amount = getOperateData(kw_helped)), 5000)) return;
                helped_amount = tmp_helped_amount;
                while (waitForAction(() => helped_amount !== (tmp_helped_amount = getOperateData(kw_helped)), 500)) {
                    helped_amount = tmp_helped_amount;
                }

                if (config.show_help_details) {
                    let friend_name = textMatches(/.*的蚂蚁森林/).findOnce().text().match(/.+(?=的蚂蚁森林)/)[0];
                    log(friend_name + ": " + (helped_amount - ori_helped_amount) + "g (help)");
                }
            }

            function backToHeroList() {
                let ident_hero_list = textMatches(/.+排行榜/);
                let kw_back_btn = id("com.alipay.mobile.nebula:id/h5_tv_nav_back");

                let max_try_times = 3;
                while (max_try_times--) {
                    kw_back_btn.exists() ? kw_back_btn.click() : shell("input keyevent KEYCODE_BACK", true);
                    if (waitForAction(ident_hero_list, 3000)) return true;
                }
                if (max_try_times < 0) restartAlipayToHeroList();

                // tool function(s) //

                function restartAlipayToHeroList() {
                    launchThisApp(current_app.intent, "no_msg");
                    init();
                }
            }

            function swipeUp() {
                if (list_end_signal) return;

                let bottom_data = getRankListSelfBottom(),
                    tmp_bottom_data;

                swipe(WIDTH * 0.5, HEIGHT * 0.9, WIDTH * 0.5, HEIGHT * 0.1, 150);

                while (waitForAction(() => bottom_data !== (tmp_bottom_data = getRankListSelfBottom()), 50)) {
                    bottom_data = tmp_bottom_data;
                } // wait for data stable

                // sleep(config.list_swipe_interval);

                // tool function(s) //

                function getRankListSelfBottom() {
                    let max_try_times = 5;
                    while (max_try_times--) {
                        try {
                            return idMatches(/.*J_rank_list_self/).findOnce().bounds().bottom;
                        } catch (e) {
                            sleep(100);
                        }
                    }
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

            function getOperateData(kw) {

                let idx_collected_node = null,
                    max_try_times = 4;
                while (max_try_times--) {
                    try {
                        idx_collected_node = idx_collected_node || getCollectedNodeIdx();
                        return kw.findOnce().parent().child(idx_collected_node).desc().match(/\d+/)[0] - 0;
                    } catch (e) {
                        // nothing to do here
                    }
                }
                if (max_try_times < 0) return 0 / 0;

                // tool function(s) //

                function getCollectedNodeIdx() {
                    for (let i = 0, len = kw.findOnce().parent().children().size(); i < len; i += 1) {
                        let current_node_desc = kw.findOnce().parent().child(i).desc();
                        if (!current_node_desc) continue;
                        if (current_node_desc.match(/\d+g/)) return i;
                    }
                    return 2; // just a backup plan
                }
            }
        }

        function goBackToAfHome() {
            let kw_back_btn = id("com.alipay.mobile.nebula:id/h5_tv_nav_back"),
                ident_af_home = desc("合种");

            let max_try_times = 3;
            while (max_try_times--) {
                kw_back_btn.exists() ? kw_back_btn.click() : shell("input keyevent KEYCODE_BACK", true);
                if (waitForAction(ident_af_home, 3000)) return true;
            }
            if (max_try_times < 0) launchThisApp(current_app.intent, "no_msg");
        }
    }

    function showResult() {
        let init = current_app.total_energy_init,
            own = current_app.total_energy_collect_own,
            friends = getCurrentEnergyAmount() - init - own;

        own && log("Energy from yourself: " + own + "g");
        friends && log("Energy from friends: " + friends + "g");
        if (!own && !friends) log("A fruitless attempt");
    }

    function endProcess() {
        threads.shutDownAll(); // kill all threads started by threads.start()
        current_app.kill_when_done || closeWindows();
        current_app.is_screen_on || KeyCode("KEYCODE_POWER");
        current_app.kill_when_done && killCurrentApp(current_app.package_name)
        messageAction(current_app.quote_name + "任务结束", 1, 0, 0, "both_n");
        exit();

        // tool function(s) //

        function closeWindows() {
            let kw_login_with_new_user = textMatches(/换个新账号登录|[Aa]dd [Aa]ccount/),
                kw_close = desc("关闭"),
                kw_back_btn = id("com.alipay.mobile.antui:id/back_button");
            while (clickBounds([kw_close, "try"]) || kw_login_with_new_user.exists() && clickBounds([kw_back_btn, "try"])) sleep(600);
        }
    }

    // tool function(s) //

    function getCurrentEnergyAmount() {
        if (!waitForAction(() => descMatches(/\d+g/).exists() && desc("合种").exists(), 8000)) return -1; // just in case
        return descMatches(/\d+g/).findOnce().desc().match(/\d+/)[0] - 0;
    }

    function checkBlackTimeStr(time_str) {
        let now = new Date();
        let time = new Date();
        let time_offset = time_str.match(/今天/) && 24;
        let unblacklist_date_obj = new Date(new Date(time.setHours(now.getHours() + time_offset)).toDateString() + " " + time_str.slice(2));

        let duration_ms = unblacklist_date_obj.getTime() - now.getTime();

        if (duration_ms <= 0) return;

        let duration_date_obj = new Date(Date.parse(now.toDateString()) + duration_ms);
        let fillZero = num => ("0" + num).slice(-2);
        let hh = duration_date_obj.getHours(),
            mm = duration_date_obj.getMinutes(),
            ss = duration_date_obj.getSeconds(),
            hh_str = (!hh ? "" : (fillZero(hh) + "时")),
            mm_str = (!mm && !hh ? "" : (fillZero(mm) + "分")),
            ss_str = (!mm && !hh ? ss : fillZero(ss)) + "秒",
            countdown_str = "剩余: " + hh_str + mm_str + ss_str;
        return countdown_str;
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
        if (!no_msg_flag) {
            current_app.first_time_run ? messageAction("开始" + current_app.quote_name + "任务", 1, 0, 0, "both") : toast("ReAF");
        }
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
function killCurrentApp(package_name) {
    let pkg = package_name || current_app.package_name;
    shell("am force-stop " + pkg, true);
    waitForAction(() => currentPackage() !== pkg, 15000, "关闭" + pkg + "失败", 9, 1);
    current_app.first_time_run = 0;
    return true;
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
 * @param {number} [if_needs_split_line] - if needs a split line
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
            exit();
            break;
        case 9:
        case "h":
            msg_level = 4;
            console.error(msg);
            KeyCode("KEYCODE_HOME");
            exit();
            break; // useless, just for inspection
        case "t":
        case "title":
            msg_level = 1;
            console.log("[ " + msg + " ]");
            break;
    }
    if (if_needs_split_line) showSplitLine(typeof if_needs_split_line === "string" ? if_needs_split_line : "");
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
 * @param {object|array} func - an object or object with *.bounds() or [func, additional function]
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
    let func = f,
        additionFunc;
    if (Object.prototype.toString.call(f).slice(8, -1) === "Array") {
        func = f[0];
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

    let max_try_times_posb = 3;
    while (max_try_times_posb--) {
        try {
            posb = func.toString().match(/^Rect\(/) ? func : func.findOnce().bounds();
        } catch (e) {
            sleep(500);
            if (!func.exists()) break;
        }
    }
    if (max_try_times_posb < 0) posb = func.toString().match(/^Rect\(/) ? func : func.findOnce().bounds(); // let console show specific error messages

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
 * @param {number|object|object[]|function|function[]|boolean|function+number[]} f - if "f" then waiting
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
 * decrypt an encrypted array
 * @param arr - encrypted array by another tool
 * @returns {Array} - a decrypted arary
 */
function restoredPasswordArr(arr) {
    let result = [],
        map = JSON.parse(files.read("/sdcard/Scripts/PWMAP.txt")),
        skip_times = 0;
    arr.forEach((value, index) => {
        if (skip_times) return skip_times -= 1;
        if (map[value] === "\\" && map[arr[index + 1]] === "u") {
            let tmp_str = "";
            for (let i = 0; i < 4; i += 1) tmp_str += map[arr[index + i + 2]];
            tmp_str = "%u" + tmp_str;
            result.push(unescape(tmp_str));
            skip_times = 5;
        } else result.push(map[value]);
    });
    return result;
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
 * swipe until "f" is in screen
 * @param {object|object[]|string} f - what you wanna find
 * <br>
 *     - object - text("abc") - object you wanna find"<br>
 *     - string - "butterfly.jpg/png" - picture you wanna find<br>
 *     - array - [num(s), obj(s)] - a multi-condition array (all shown in screen at the same time)
 *
 * @param {number|number[]} [screen_area] - restrict for smaller finding area
 * <br>
 *     - null - default is fullscreen<br>
 *     - 4 nums - [left, top, right, bottom] like [10, 50, 700, 1080] for [10, 50, 700, 1080]<br>
 *     - 2 nums - [default, default, right, bottom] like [700, 1080] for [def, def, 700, 1080]<br>
 *     - 1 num - [default, default, default, bottom] like 1080 or [1080] for [def, def, def, 1080]
 *
 * @param {number} [max=timeout=20000;max_swipe_times=50] - set max finding time or max swipe times
 * <br>
 *     - max>=1000 - set max as timeout<br>
 *     - max<1000 - set max as max_swipe_times
 * @param {number|string} [direction="up"] - swipe direction
 * <br>
 *     - 0|left|l or 1|up|u or 2|right|r or 3|down|d for different direction to swipe
 *
 * @param {number} [swipe_time=300] - the time spent for each swiping
 * @param {number} [check_interval=300] - the time spent between every swiping
 * @param {number|number[]} [swipe_area] - restrict for smaller swiping area
 * <br>
 *     - usage is same as "screen_area"
 *
 * @param {number} [inside_or_contain=0] - object inside screen bounds or screen bounds contains object (not for image)
 * <br>
 *     - 0 - contains - screen bounds contains object - just needs a little little bit object bounds shown in screen<br>
 *     - 1 - inside - object inside screen bounds - the whole object bounds must be inside the screen bounds
 *
 * @param {string} [if_click=0] - click after "f" found - ONLY "click" can be introduced if you need a click
 * @param special_bad_situation {...function|function[]|object|object[]}
 * @returns {boolean} - if timed out or max swipe time reached
 */
function makeInScreen(f, screen_area, max, direction, swipe_time, check_interval, swipe_area, inside_or_contain, if_click, special_bad_situation) {
    let timeout = max && max >= 1000 ? max : 20000,
        max_swipe_times = max && max > 0 && max <= 999 ? max : 50,
        bad_situation_pending = 1000;
    direction = handleDirection(direction);
    check_interval = check_interval || 300;
    swipe_time = swipe_time || 300;
    inside_or_contain = inside_or_contain ? 1 : 0;
    if (if_click !== "click") if_click = 0;

    if (typeof f === "string" && checkImageName(f)) tryRequestScreenCapture();

    let screen_bounds = {
        left: 0,
        top: 0,
        right: WIDTH,
        bottom: HEIGHT
    };
    let swipe_bounds = {
        left: WIDTH * 0.1,
        top: HEIGHT * 0.3,
        right: WIDTH * 0.9,
        bottom: HEIGHT * 0.7
    };

    if (screen_area) adjustBounds(screen_area, screen_bounds);
    if (swipe_area) adjustBounds(swipe_area, swipe_bounds);

    setSwipeBoundsCenter();

    sleep(200);
    return findF();

    // tool function(s) //

    function findF() {
        while (timeout > 0 && max_swipe_times--) {
            if (checkFunc(f)) break;
            if (bad_situation_pending >= 1000) {
                if (current_app.global_bad_situation) checkBadSituation(current_app.global_bad_situation);
                if (special_bad_situation) checkBadSituation(special_bad_situation);
                bad_situation_pending %= 1000;
            }
            swipe();
            sleep(check_interval);
            timeout -= (check_interval + swipe_time);
            bad_situation_pending += check_interval + swipe_time;
        }
        let valid = timeout > 0 && max_swipe_times >= 0;
        if (valid && if_click && typeof f !== "string") {
            sleep(200);
            clickBounds(f);
        }
        return valid;
    }

    function setSwipeBoundsCenter() {
        swipe_bounds.left_center = [swipe_bounds.left, (swipe_bounds.top + swipe_bounds.bottom) / 2];
        swipe_bounds.top_center = [(swipe_bounds.left + swipe_bounds.right) / 2, swipe_bounds.top];
        swipe_bounds.right_center = [swipe_bounds.right, (swipe_bounds.top + swipe_bounds.bottom) / 2];
        swipe_bounds.bottom_center = [(swipe_bounds.left + swipe_bounds.right) / 2, swipe_bounds.bottom];
    }

    function adjustBounds(area, bounds) {
        if (typeof area === "number") {
            bounds.bottom = area;
        } else if (Object.prototype.toString.call(area).slice(8, -1) === "Array") {
            switch (area.length) {
                case 1:
                    bounds.bottom = area[0];
                    break;
                case 2:
                    bounds.right = area[0];
                    bounds.bottom = area[1];
                    break;
                case 4:
                    bounds.left = area[0];
                    bounds.top = area[1];
                    bounds.right = area[2];
                    bounds.bottom = area[3];
                    break;
                default:
                    messageAction("\"makeInScreen\"area参数元素数量不合法", 9, 1, 1);
            }
        } else {
            messageAction("\"makeInScreen\"area参数不合法", 9, 1, 1);
        }
    }

    function checkFunc(f) {
        if (typeof f === "object") {
            let classof = Object.prototype.toString.call(f).slice(8, -1);
            if (classof !== "Array") return inside_or_contain ? f.exists() && inBounds(f.findOnce().bounds()) : f.exists() && containBounds(f.findOnce().bounds());
            return handleArray(f);
        } else if (typeof f === "string") return handleImage(f);
        else messageAction("\"makeInScreen\"f参数不合法", 9, 1, 1);
    }

    function handleArray(arr) {
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (!(typeof arr[i]).match(/object|string/)) messageAction("\"makeInScreen\"数组参数含不合法元素", 9, 1);
            if (!checkFunc(arr[i])) return false;
        }
        return true;
    }

    function handleDirection(direction) {
        if (!direction) return 1;
        if (typeof direction === "number") return direction in {0: 1, 2: 1, 3: 1} ? direction : 1;
        if (direction.match(/^l(eft)?$/)) return 0;
        else if (direction.match(/^r(ight)?$/)) return 2;
        else if (direction.match(/^b(ottom)?$/)) return 3;
        else return 1;
    }

    function checkImageName(path) {
        return path.match(/^\/?(sdcard|emulated)|\.jpg$|\.png$/i);
    }

    function handleImage(path) {
        if (!checkImageName(path)) messageAction("\"makeInScreen\"f作为图片路径输入不合法", 9, 1);
        let img_template = images.read(path);
        if (!img_template) messageAction("未找到\"" + path + "\"文件", 9, 1);
        let found_image = findImage(captureScreen(), img_template);
        let image_bounds;
        if (found_image) image_bounds = {
            left: found_image.x,
            top: found_image.y,
            right: found_image.x + img_template.width,
            bottom: found_image.y + img_template.height
        };
        let valid = inside_or_contain ? found_image && inBounds(image_bounds) : found_image && containBounds(image_bounds);
        if (valid && if_click) {
            sleep(300);
            click((image_bounds.left + image_bounds.right) / 2, (image_bounds.top + image_bounds.bottom) / 2);
        }
        return valid;
    }

    function inBounds(bounds) {
        return bounds.right > bounds.left && bounds.bottom > bounds.top &&
            (direction === 2 ? bounds.left > screen_bounds.left : bounds.left >= screen_bounds.left) &&
            (direction === 3 ? bounds.top > screen_bounds.top : bounds.top >= screen_bounds.top) &&
            (direction === 0 ? bounds.right < screen_bounds.right : bounds.right <= screen_bounds.right) &&
            (direction === 1 ? bounds.bottom < screen_bounds.bottom : bounds.bottom <= screen_bounds.bottom);
    }

    function containBounds(bounds) {
        return bounds.right > bounds.left && bounds.bottom > bounds.top &&
            (
                (
                    (bounds.right >= screen_bounds.left && bounds.right <= screen_bounds.right) ||
                    (bounds.left <= screen_bounds.right && bounds.left >= screen_bounds.left)
                ) &&
                (
                    (bounds.bottom >= screen_bounds.top && bounds.bottom <= screen_bounds.bottom) ||
                    (bounds.top <= screen_bounds.bottom && bounds.top >= screen_bounds.top)
                )
            );
    }

    function swipe() {
        let coordinate_a, coordinate_b;
        switch (direction) {
            case 0:
                coordinate_a = swipe_bounds.right_center;
                coordinate_b = swipe_bounds.left_center;
                break;
            case 1:
                coordinate_a = swipe_bounds.bottom_center;
                coordinate_b = swipe_bounds.top_center;
                break;
            case 2:
                coordinate_a = swipe_bounds.left_center;
                coordinate_b = swipe_bounds.right_center;
                break;
            case 3:
                coordinate_a = swipe_bounds.top_center;
                coordinate_b = swipe_bounds.bottom_center;
                break;
            default:
                messageAction("\"makeInScreen\"direction参数不合法", 9, 1);
        }
        gesture(swipe_time, coordinate_a, coordinate_b);
    }
}

/**
 * swipe until "f" is in screen then click it
 * @param {object|object[]|string} f - what you wanna find
 * <br>
 *     - object - text("abc") - object you wanna find"<br>
 *     - string - "butterfly.jpg/png" - picture you wanna find<br>
 *     - array - [num(s), obj(s)] - a multi-condition array (all shown in screen at the same time)
 *
 * @param {number|number[]} [screen_area] - restrict for smaller finding area
 * <br>
 *     - null - default is fullscreen<br>
 *     - 4 nums - [left, top, right, bottom] like [10, 50, 700, 1080] for [10, 50, 700, 1080]<br>
 *     - 2 nums - [default, default, right, bottom] like [700, 1080] for [def, def, 700, 1080]<br>
 *     - 1 num - [default, default, default, bottom] like 1080 or [1080] for [def, def, def, 1080]
 *
 * @param {number} [max=timeout=20000;max_swipe_times=50] - set max finding time or max swipe times
 * <br>
 *     - max>=1000 - set max as timeout<br>
 *     - max<1000 - set max as max_swipe_times
 * @param {number|string} [direction="up"] - swipe direction
 * <br>
 *     - 0|left|l or 1|up|u or 2|right|r or 3|down|d for different direction to swipe
 *
 * @param {number} [swipe_time=300] - the time spent for each swiping
 * @param {number} [check_interval=300] - the time spent between every swiping
 * @param {number|number[]} [swipe_area] - restrict for smaller swiping area
 * <br>
 *     - usage is same as "screen_area"
 *
 * @param {number} [inside_or_contain=0] - object inside screen bounds or screen bounds contains object (not for image)
 * <br>
 *     - 0 - contains - screen bounds contains object - just needs a little little bit object bounds shown in screen<br>
 *     - 1 - inside - object inside screen bounds - the whole object bounds must be inside the screen bounds
 *
 * @returns {boolean} - if timed out or max swipe time reached
 */
function makeInScreenAndClick(f, screen_area, max, direction, swipe_time, check_interval, swipe_area, inside_or_contain) {
    return makeInScreen(f, screen_area, max, direction, swipe_time, check_interval, swipe_area, inside_or_contain, "click");
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

function refreshObjects() {
    let refreshing_obj_thread = threads.start(function () {
        let kw_ok_btn = textMatches(/OK|确定/); // may 确认 or something else
        waitForActionAndClickBounds(kw_ok_btn, 10000);
    });
    alert("Alert for refreshing objects");
    refreshing_obj_thread.interrupt();
    sleep(700);
}

function calcDuration(time_str, return_unit, no_unit, precision, ingore_negtive, language) {
    let units = unit();
    let now = new Date(),
        time1,
        time2;
    if (typeof time_str === "string") {
        time1 = parsePara(time_str.match(/\d+/g));
        time2 = now;
    } else {
        time1 = parsePara(time_str[0].match(/\d+/g));
        time2 = parsePara(time_str[1].match(/\d+/g));
    }

    let duration_is_neg,
        duration_ms = time1 - time2;
    if (duration_ms < 0) duration_is_neg = true;
    duration_ms = Math.abs(duration_ms);

    let user_defined_ret_unit = !!return_unit;
    return_unit = return_unit || handleAutoReturnUnit(duration_ms);
    language = language || "en";

    return !user_defined_ret_unit ? returnResult().formatted_text : (no_unit ? returnResult().data : returnResult().formatted_text);

    // tool function(s) //

    function parsePara(str_arr) {
        let time = new Date();
        if (str_arr.length === 3) {
            time.setFullYear(str_arr[0], str_arr[1] - 1, str_arr[2]);
        } else if (str_arr.length === 6) {
            time.setFullYear(str_arr[0], str_arr[1] - 1, str_arr[2]);
            time.setHours(str_arr[3], str_arr[4], str_arr[5]);
        } else {
            toastLog("输入的时间字符串不合法");
            exit();
        }
        return time;
    }

    function handleAutoReturnUnit(time) {
        let one_second_ms = 1000,
            one_minute_ms = 60 * one_second_ms,
            one_hour_ms = 60 * one_minute_ms,
            one_day_ms = 24 * one_hour_ms;
        if (time >= one_day_ms) return "d";
        if (time >= one_hour_ms) return "h";
        if (time >= one_minute_ms) return "m";
        if (time >= one_second_ms) return "s";
        if (time < one_second_ms) return "s";
    }

    function unit() {
        return {
            "ms": new Unit(1, "毫秒", "millisecond"),
            "s": new Unit(1000, "秒", "second"),
            "m": new Unit(60000, "分", "minute"),
            "h": new Unit(3600000, "时", "hour"),
            "d": new Unit(3600000 * 24, "天", "day"),
            "M": new Unit(3600000 * 24 * 30, "月", "month"),
            "y": new Unit(3600000 * 24 * 365, "年", "year")
        };

        function Unit(base, text_ch, text_en) {
            this.base = base;
            this.text_ch = text_ch;
            this.text_en = text_en;
        }
    }

    function returnResult() {
        precision = precision === 0 ? 0 : (precision || 2);
        let num = (duration_ms / units[return_unit].base).toFixed(precision) - 0,
            numWithSign = () => duration_is_neg && !ingore_negtive ? -num : num;

        function unitText() {
            if (language === "en") return num > 1 ? " " + units[return_unit].text_en + "s" : " " + units[return_unit].text_en;
            if (language === "ch") return units[return_unit].text_ch;
        }

        return {
            formatted_text: numWithSign() + unitText(),
            data: numWithSign(),
        }
    }
}

function saveCurrentScreenCapture(key_name) {

    tryRequestScreenCapture();

    let path_prefix = "/sdcard/Scripts/Log/Capture/",
        file_name = key_name + "_" + getDateStr() + "_" + getTimeStr() + ".png",
        path = path_prefix + file_name;

    files.create(path_prefix);
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