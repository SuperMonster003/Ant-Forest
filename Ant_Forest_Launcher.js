/**
 * @overview alipay ant forest energy intelligent collection script
 *
 * @last_modified May 29, 2019
 * @version 1.6.25 Alpha11
 * @author SuperMonster003
 *
 * @tutorial {@link https://github.com/SuperMonster003/Auto.js_Projects/tree/Ant_Forest}
 */

let {
    launchThisApp,
    killThisApp,
    waitForAction,
    clickAction,
    waitForAndClickAction,
    messageAction,
    showSplitLine,
    getVerName,
    runJsFile,
    debugInfo,
    swipeInArea,
    refreshObjects,
    tryRequestScreenCapture,
    keycode,
    getDisplayParams,
} = require("./Modules/MODULE_MONSTER_FUNC");

try {
    auto.waitFor();
} catch (e) {
    messageAction("auto.waitFor()不可用", 0, 0, 0, "up");
    auto();
}

let config = {
    main_user_switch: false, // if you are multi-account user, you may specify a "main account" to switch
    max_running_time: 5, // 1 <= x <= 30; running timeout each time; unit: minute; leave "false value" if you dislike limitation
};

let storage_af, storage_af_cfg, unlock_module;
let WIDTH, HEIGHT, cX, cY;
let engines_support_flag = true;
let current_app = {};
let sel = selector();
checkModules.bind(this)();
checkTasksQueue();
checkVersion();
checkEngines();

antForest();

// entrance function //

function antForest() {
    init();
    launch();
    checkLanguage();
    checkEnergy();
    showResult();
    endProcess();
}

// main function(s) //

function init() {
    let init_operation_logged = null;

    debugInfo("准备初始化");
    setVolKeysListener();
    checkSdk();
    unlock();
    setScreenPixelData();
    setSelectorProto();
    setAutoJsLogPath();
    setParams();
    loginSpecificUser(); // init_operation_logged doesn't set, and needs optimization
    debugInfo("初始化完毕");

    if (init_operation_logged) showSplitLine();

    // tool function(s) //

    function setVolKeysListener() {
        debugInfo("设置音量键监听器");
        threads.start(function () {
            events.observeKey();
            events.onKeyDown("volume_up", function (event) {
                messageAction("强制停止所有脚本", 4, 0, 0, "up");
                messageAction("用户按下'音量加/VOL+'键", 4, 0, 1, 1);
                engines.stopAllAndToast();
            });
            events.onKeyDown("volume_down", function (event) {
                messageAction("强制停止当前脚本", 3, 0, 0, "up");
                messageAction("用户按下'音量减/VOL-'键", 3, 0, 1, 1);
                engines.myEngine().forceStop();
            });
        });
    }

    function checkSdk() {
        let current_sdk_ver = +shell("getprop ro.build.version.sdk").result;
        debugInfo("安卓系统SDK版本: " + current_sdk_ver);
        if (current_sdk_ver >= 24) return true;
        messageAction("脚本无法继续", 4);
        messageAction("安卓系统版本低于7.0", 8, 1, 1, 1);
    }

    function unlock() {
        if (!unlock_module) {
            messageAction("自动解锁功能无法使用", 3);
            return messageAction("解锁模块未导入", 3, 0, 1);
        }
        let is_screen_on = unlock_module.is_screen_on;
        current_app.is_screen_on = is_screen_on;
        if (!is_screen_on && !config.auto_unlock_switch) {
            messageAction("脚本无法继续", 4);
            messageAction("屏幕关闭且自动解锁功能未开启", 8, 1, 1, 1);
        }
        if (!context.getSystemService(context.KEYGUARD_SERVICE).isKeyguardLocked()) return debugInfo("无需解锁");
        debugInfo("尝试自动解锁");
        unlock_module.unlock();
        debugInfo("自动解锁完毕");
    }

    function setSelectorProto() {
        sel.__proto__ = {
            pickup: (condition, memory_keyword, prefer) => {
                let _mem_kw_prefix = "_MEM_KW_PREFIX_";
                if (memory_keyword) {
                    let memory_kn = this[_mem_kw_prefix + memory_keyword];
                    if (memory_kn) return memory_kn;
                }
                let kn = getSelector();
                if (memory_keyword && kn.exists()) {
                    debugInfo("选择器已记录");
                    debugInfo(">" + memory_keyword);
                    debugInfo(">" + kn);
                    this[_mem_kw_prefix + memory_keyword] = kn;
                }
                return kn;

                // tool function(s)//

                function getSelector() {
                    let classof = Object.prototype.toString.call(condition).slice(8, -1);
                    if (typeof condition === "string") {
                        if (prefer === "text") return text(condition).exists() ? text(condition) : desc(condition);
                        return desc(condition).exists() ? desc(condition) : text(condition);
                    }
                    if (classof === "RegExp") {
                        if (prefer === "text") return textMatches(condition).exists() ? textMatches(condition) : descMatches(condition);
                        return descMatches(condition).exists() ? descMatches(condition) : textMatches(condition);
                    }
                }
            },
        };
        debugInfo("选择器加入新方法");
        Object.keys(sel.__proto__).forEach(key => debugInfo(">" + key + "()"));
    }

    function setAutoJsLogPath() {
        // need more actions here
        let log_path = config.auto_js_log_record_path;

        if (!log_path) return debugInfo("日志存储功能关闭");

        files.createWithDirs(log_path);

        console.setGlobalLogConfig({
            file: log_path,
        });

        debugInfo("日志存储功能开启");
    }

    function setParams() {

        images.getName = img => {
            let img_str = img.toString().split("@")[1];
            return img_str ? "@" + img_str.match(/\w+/)[0] : "(已提前回收)";
        };
        current_app = Object.assign(current_app, new App("蚂蚁森林"));
        current_app.kw_af_title = () => sel.pickup(/蚂蚁森林|Ant Forest/);
        current_app.kw_af_home = () => sel.pickup(/合种|背包|通知|攻略|任务|我的大树养成记录/, "kw_af_home");
        current_app.kw_list_more_friends = () => sel.pickup("查看更多好友", "kw_list_more_friends");
        current_app.kw_rank_list_title = () => sel.pickup(/好友排行榜|Green heroes/, "kw_rank_list_title");
        current_app.kw_wait_for_awhile = () => sel.pickup(/.*稍等片刻.*/, "kw_wait_for_awhile");
        current_app.kw_reload_forest_page_btn = () => sel.pickup("重新加载", "kw_reload_forest_page_btn");
        current_app.kw_close_btn = () => sel.pickup(/关闭|Close/, "kw_close_btn");
        current_app.kw_login_or_switch = idMatches(/.*switchAccount|.*loginButton/);
        current_app.ori_app_package = currentPackage();
        current_app.kill_when_done = current_app.ori_app_package !== current_app.package_name;
        current_app.logged_blacklist_names = [];
        current_app.rank_list_icon_collect = storage_af.get("af_rank_list_icon_collect");
        current_app.rank_list_icon_help = storage_af.get("af_rank_list_icon_help");
        debugInfo("会话参数赋值完毕");

        checkAlipayVer();
        setMaxRunTime();

        // constructor //

        function App(name) {
            this.name = name;
            this.quote_name = "\"" + name + "\"";
            this.package_name = getAlipayPkgName();
            this.intent = {
                action: "VIEW",
                // data: "alipays://platformapi/startapp?saId=20000067" +
                //     "&url=" + encodeURIComponent("https://60000002.h5app.alipay.com/www/home.html") +
                //     "&__webview_options__=" + encodeURIComponent('showOptionMenu=YES&startMultApp=YES'),
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
                    if (!config.console_log_details && !config.debug_info_switch) return;

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
                let conditions_necessary = {
                    af_title_or_login: () => current_app.kw_af_title().exists() || current_app.kw_login_or_switch.exists(),
                };
                let conditions_optional = {
                    kw_function_buttons: () => current_app.kw_af_home(),
                    kw_list_more_friends_btn: () => current_app.kw_list_more_friends(),
                    kw_login_or_switch: current_app.kw_login_or_switch,
                };
                let keys_nec = Object.keys(conditions_necessary);
                for (let i = 0, len = keys_nec.length; i < len; i += 1) {
                    let key_nec = keys_nec[i];
                    let condition = conditions_necessary[key_nec];
                    if (typeof condition === "function" && !condition() ||
                        typeof condition === "object" && !condition.exists()) {
                        debugInfo("启动必要条件不满足");
                        return debugInfo(">" + key_nec);
                    }
                }
                debugInfo("已满足全部启动必要条件");
                current_app.kw_af_title = () => sel.pickup(/蚂蚁森林|Ant Forest/, "kw_af_title");

                let keys_opt = Object.keys(conditions_optional);
                for (let i = 0, len = keys_opt.length; i < len; i += 1) {
                    let key_opt = keys_opt[i];
                    let condition = conditions_optional[key_opt];
                    if (typeof condition === "function" && condition() ||
                        typeof condition === "object" && condition.exists()) {
                        debugInfo("已满足启动可选条件");
                        debugInfo(">" + key_opt);
                        return true;
                    }
                }
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

        // tool function(s) //

        function checkAlipayVer() {
            let bug_vers = ["i have been free so far"];
            let alipay_ver = getVerName(current_app.package_name);
            debugInfo("支付宝版本: " + alipay_ver);
            if (~bug_vers.indexOf(alipay_ver)) {
                messageAction("脚本无法继续", 4);
                messageAction("当前支付宝版本存在已知问题", 4);
                messageAction("请更换支付宝版本", 8, 1, 1, 1);
            }
        }

        function setMaxRunTime() {
            let max = config.max_running_time;

            if (!max || !+max) return;

            threads.start(function () {
                setTimeout(() => messageAction("超时强制退出", 8, 1, 0, "both_n"), +max * 60000);
            });
            debugInfo("单次运行最大超时设置完毕");
        }
    }
}

function checkLanguage() {
    let title_node = null;
    if (!waitForAction(() => title_node = current_app.kw_af_title().findOnce(), 10000)) {
        messageAction("语言检测已跳过", 3);
        return messageAction("语言控件信息查找超时", 3, 0, 1, 1);
    }
    if (!title_node) {
        messageAction("语言检测已跳过", 3);
        return messageAction("语言控件信息无效", 3, 0, 1, 1);
    }
    if (!waitForAction(() => {
        let title_node = current_app.kw_af_title().findOnce();
        let title_desc = title_node && title_node.desc();
        let title_text = title_node && title_node.text();
        return title_desc && !title_desc.match(/蚂蚁森林/) || title_text && !title_text.match(/蚂蚁森林/);
    }, 500)) {
        debugInfo("当前支付宝语言: 简体中文");
    } else {
        debugInfo("当前支付宝语言: 英语");
        changeLangToChs();
        launch({no_message_flag: true});
    }
    debugInfo("语言检查完毕");

    // tool function(s) //

    function changeLangToChs() {

        getReady() && ~handleTxtPipeline() && showSplitLine();

        function getReady() {
            let max_try_times_close_btn = 10;
            while (max_try_times_close_btn--) {
                if (clickAction(current_app.kw_close_btn())) break;
                sleep(500);
            }
            let kw_homepage = className("android.widget.TextView").idContains("tab_description");
            if (waitForAction(kw_homepage, 2000)) return true;
            let max_try_times = 5;
            while (max_try_times--) {
                killThisApp(current_app.package_name);
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
                "\u7b80\u4f53\u4e2d\u6587": () => sel.pickup("简体中文").findOnce().parent().parent().parent().children().size() === 2,
                "Save": () => !text("Save").exists() && !desc("Save").exists(),
            };

            let ppl_keys = Object.keys(txt_pipe_line);

            for (let i = 0, len = ppl_keys.length; i < len; i += 1) {
                let key = ppl_keys[i],
                    value = txt_pipe_line[key],
                    next_key = ppl_keys[i + 1],
                    condition = value === "_next" ? sel.pickup(next_key) : value;

                let kw_key = sel.pickup(key);
                clickAction(kw_key);
                let max_try_times = 5;
                while (!waitForAction(condition, 2000) && max_try_times--) clickAction(kw_key);
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

    let kw_more_friends = () => current_app.kw_list_more_friends();
    let kw_energy_balls = () => {
        let desc_sel = className("Button").descMatches(/\xa0|收集能量\d+克/);
        let text_sel = className("Button").textMatches(/\xa0|收集能量\d+克/);
        return desc_sel.exists() && desc_sel || text_sel;
    };
    let kw_energy_balls_normal = () => {
        let desc_sel = className("Button").desc("\xa0");
        let text_sel = className("Button").text("\xa0");
        return desc_sel.exists() && desc_sel || text_sel;
    };
    let kw_energy_balls_ripe = () => {
        let desc_sel = className("Button").descMatches(/收集能量\d+克/);
        let text_sel = className("Button").textMatches(/收集能量\d+克/);
        return desc_sel.exists() && desc_sel || text_sel;
    };

    checkOwnEnergy();
    checkFriendsEnergy();
    goBackToAfHome();

    // main function(s) //

    function checkOwnEnergy() {

        current_app.total_energy_init = getCurrentEnergyAmount("buffer");
        debugInfo("初始能量: " + current_app.total_energy_init + "g");

        if (!config.self_collect_switch) return debugInfo("收取自己能量功能开关未开启");

        debugInfo("开始检查自己能量");

        let check = () => checkOnce() && (current_app.total_energy_collect_own += getEnergyDiff());

        if (!waitForAction(() => kw_more_friends().exists() || current_app.kw_af_home().exists(), 12000)) debugInfo("蚂蚁森林主页准备超时");
        waitForAction(() => kw_energy_balls().exists(), 1000); // make energy balls ready

        let remain_checked_flag = false;

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
                if (in_check_remain_range) checkRemain(min_time, max_time);
            }
            if (!remain_checked_flag) debugInfo("当前时间不在监测时间范围内");
        }

        check();
        current_app.total_energy_collect_own ? debugInfo("共计收取: " + current_app.total_energy_collect_own + "g") : debugInfo("无能量球可收取");
        debugInfo("自己能量检查完毕");

        // tool function(s) //

        function checkRemain(min_time, max_time) {
            remain_checked_flag = true;
            let start_timestamp = new Date().getTime();
            messageAction("Non-stop checking time", null, 1);
            debugInfo("开始监测自己能量");
            let time_keep_screen_on = max_time - min_time + 5000;
            device.keepScreenOn(time_keep_screen_on);
            debugInfo("已设置屏幕常亮");
            debugInfo(">最大超时时间: " + time_keep_screen_on + "ms");
            try {
                while (new Date() < max_time) ~sleep(180) && check();
            } catch (e) {
                // nothing to do here
            }
            messageAction("Checking completed", null, 1);
            debugInfo("自己能量监测完毕");
            device.cancelKeepingAwake();
            debugInfo("屏幕常亮已取消");
            debugInfo("监测用时: " + (new Date().getTime() - start_timestamp) / 1000 + "秒");
        }

        function checkOnce() {
            let selector_buttons = kw_energy_balls_ripe().find(),
                buttons_size = selector_buttons.size();
            if (!buttons_size) return;
            selector_buttons.forEach(w => clickAction(w.bounds(), "press"));
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
            if (!waitForAction(() => energy_rec !== (tmp_energy_rec = getCurrentEnergyAmount()), 3000)) return 0;
            energy_rec = tmp_energy_rec;
            while (waitForAction(() => energy_rec !== (tmp_energy_rec = getCurrentEnergyAmount()), 1000)) {
                energy_rec = tmp_energy_rec;
            }
            return (energy_rec - current_app.total_energy_init) || 0;
        }
    }

    function checkFriendsEnergy() {

        let help_collect_switch = config.help_collect_switch;
        let friend_collect_switch = config.friend_collect_switch;
        if (!help_collect_switch && !friend_collect_switch) return ~debugInfo("跳过好友能量检查") && debugInfo(">收取功能与帮收功能均已关闭");

        debugInfo("开始检查好友能量");

        if (!rankListReady()) return;

        let blacklist_ident_capts = [];
        let help_balls_coords = {};
        let thread_energy_balls_monitor = undefined;
        let list_end_signal = 0;

        blacklist_ident_capts.__proto__.add = function (capture, max_length) {
            max_length = max_length || 3;
            if (this.length >= max_length) {
                debugInfo("黑名单采集样本已达阈值: " + max_length);
                let last_capt = this.pop();
                debugInfo(">移除并回收最旧样本: " + images.getName(last_capt));
                last_capt.recycle();
            }
            // let new_capt = images.clip(capture, cX(298), cY16h9w(218), cX(120), cY16h9w(22));
            let new_capt = images.clip(capture, cX(288), cY(210, 16 / 9), cX(142), cY(44, 16 / 9)); // more flexible condition(s)
            blacklist_ident_capts.unshift(new_capt);
            debugInfo("添加黑名单采集样本: " + images.getName(new_capt));
        };
        blacklist_ident_capts.__proto__.clear = function () {
            debugInfo("回收全部黑名单采集样本");
            this.forEach(capt => {
                capt.recycle();
                debugInfo(">已回收: " + images.getName(capt));
            });
            this.splice(0, this.length);
            debugInfo("黑名单采集样本已清空");
        };

        debugInfo("已开启排行榜底部监测线程");
        let thread_list_end = threads.start(endOfListThread);

        let strategy = config.rank_list_samples_collect_strategy;
        debugInfo("排行榜样本采集策略: " + (
            (strategy === "image" && "图像识别") || (strategy === "layout" && "布局分析")
        ));

        let max_safe_swipe_times = 1200; // just for avoiding infinite loop
        while (max_safe_swipe_times--) {
            current_app.current_friend = {};
            let targets = getCurrentScreenTargets(); // [[targets_green], [targets_orange]]
            let pop_item_0, pop_item_1, pop_item;

            while ((pop_item = (pop_item_0 = targets[0].pop()) || (pop_item_1 = targets[1].pop()))) {
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
                    if (strategy === "image") {
                        let clip_side = WIDTH - pop_item.icon_matched_x;
                        let [clip_l, clip_t] = [pop_item.icon_matched_x, pop_item.icon_matched_y];
                        debugInfo("采集并存储排行榜图标样本");
                        debugInfo("(" + clip_l + ", " + clip_t + ", " + clip_side + ", " + clip_side + ")");
                        let clip = images.copy(images.clip(captureScreen(), clip_l, clip_t, clip_side, clip_side));
                        let clickPt = () => clickAction([cX(0.5), pop_item.list_item_click_y]);
                        debugInfo("尝试点击" + (pop_item_0 && "收取图标" || pop_item_1 && "帮收图标"));
                        clickPt();
                        let max_retry_times = 1;
                        let new_clip = null;
                        let getNewClip = () => images.clip(captureScreen(), clip_l, clip_t, clip_side, clip_side);
                        while (!waitForAction(() => !images.findImage(new_clip = getNewClip(), clip), 2000) && max_retry_times--) {
                            debugInfo("再次尝试点击" + (pop_item_0 && "收取图标" || pop_item_1 && "帮收图标"));
                            clickPt();
                            new_clip && new_clip.recycle();
                        }
                        clip.recycle();
                        new_clip && new_clip.recycle();
                        return max_retry_times >= 0 ? ~debugInfo("图标点击成功") : debugInfo("图标点击失败");
                    } else {
                        clickAction([cX(0.5), pop_item.list_item_click_y]);
                        debugInfo("点击" + (pop_item_0 && "收取图标" || pop_item_1 && "帮收图标"));
                    }
                };

                if (inBlackList(clickRankListItemFunc)) continue;

                forestPageGetReady() && collectBalls();
                backToHeroList();

                if (message_switch_on) {
                    !current_app.current_friend.console_logged && messageAction("无能量球可操作", 1, 0, 1);
                    showSplitLine();
                }
            }

            if (!list_end_signal) swipeUp();
            else break;
        }
        if (max_safe_swipe_times < 0) debugInfo("已达最大排行榜滑动次数限制");

        if (thread_list_end.isAlive()) {
            thread_list_end.interrupt();
            debugInfo("排行榜底部监测线程中断");
        }

        debugInfo("好友能量检查完毕");
        return list_end_signal;

        // key function(s) //

        function rankListReady() {
            if (!waitForAction(() => kw_more_friends().exists(), 5000)) return messageAction("定位\"查看更多好友\"超时", 3, 1, 0, 1);

            debugInfo("定位到\"查看更多好友\"按钮");

            this._monster_$_request_screen_capture_flag || tryRequestScreenCapture({restart_this_engine_flag: true});

            let max_try_times = 180;
            let kw_try_again = () => sel.pickup("再试一次", "kw_rank_list_try_again");
            while (max_try_times--) {
                if (kw_more_friends().exists()) {
                    if (!clickAction(kw_more_friends(), "widget") || !waitForAction(() => !kw_more_friends().exists(), 800)) {
                        debugInfo("备份方案点击\"查看更多好友\"");
                        swipeInArea(kw_more_friends(), {
                            swipe_time: 200,
                            check_interval: 100,
                            if_click: "click",
                        });
                    }
                }
                clickAction(kw_try_again()); // as "服务器打瞌睡了" may exist
                if (waitForAction(() => {
                    let kw_rank_list = idMatches(/.*J_rank_list/);
                    try {
                        return kw_rank_list.exists() && kw_rank_list.findOnce().childCount() && getRankListTitleAreaCapt();
                    } catch (e) {
                        // nothing to do here
                    }
                }, 1500)) break;
            }
            if (max_try_times < 0) return messageAction("进入好友排行榜超时", 3, 1);
            debugInfo("排行榜状态准备完毕");

            debugInfo("已开启排行榜自动展开线程");
            threads.start(expandHeroListThread);
            sleep(500);
            return true;

            // tool function(s) //

            function expandHeroListThread() {
                let kw_list_more = idMatches(/.*J_rank_list_more/);
                let click_count = 0;
                while (!desc("没有更多了").exists() && !text("没有更多了").exists()) {
                    clickAction(kw_list_more, "widget");
                    click_count++;
                    sleep(200);
                }
                debugInfo("排行榜展开完毕");
                debugInfo(">点击\"查看更多\": " + click_count + "次");
            }

            function getRankListTitleAreaCapt() {
                try {
                    let rank_list_title_area_capt = current_app.rank_list_title_area_capt;
                    if (rank_list_title_area_capt && rank_list_title_area_capt.getHeight()) return true;
                } catch (e) {

                }
                let key_node = current_app.kw_rank_list_title().findOnce();
                if (!key_node) return;
                let bounds = key_node.bounds();
                debugInfo("采集并存储排行榜标题区域样本");
                let [l, t, w, h] = [3, bounds.top, WIDTH - 6, bounds.height()];
                debugInfo("(" + l + ", " + t + ", " + (l + w) + ", " + (t + h) + ")");
                try {
                    let rank_list_title_area_capt = images.copy(images.clip(captureScreen(), l, t, w, h));
                    if (rank_list_title_area_capt && rank_list_title_area_capt.getHeight()) {
                        return current_app.rank_list_title_area_capt = rank_list_title_area_capt;
                    }
                } catch (e) {

                }
            }
        }

        function getCurrentScreenTargets() {

            let [targets_green, targets_orange] = [[], []];

            config.rank_list_samples_collect_strategy === "image" ? getTargetsByImage() : getTargetsByLayout();

            return [targets_green, targets_orange];

            // tool function(s) //

            function getTargetsByLayout() {
                let rank_list_capt_img;
                let screenAreaSamples = getScreenSamples() || [];

                screenAreaSamples.forEach(w => {
                    let parent_node = w.parent();
                    if (!parent_node) return debugInfo("采集到无效的排行榜好友样本");

                    let state_ident_node = parent_node.child(parent_node.childCount() - 2);
                    if (state_ident_node.childCount()) return; // exclude identifies with countdown

                    rank_list_capt_img = rank_list_capt_img || getRankListScreenCapture();
                    let find_color_options = getFindColorOptions(w);

                    // special treatment for first 3 ones
                    let name_node = parent_node.child(1);
                    let name = name_node.desc() || name_node.text();
                    if (!name) {
                        name_node = parent_node.child(2);
                        name = name_node.desc() || name_node.text();
                    }
                    let name_node_cy = name_node.bounds().centerY();

                    try {
                        if (!checkRegion(find_color_options.region)) return;

                        if (friend_collect_switch) {
                            let pt_green = images.findColor(rank_list_capt_img, config.friend_collect_icon_color, Object.assign({}, find_color_options, {threshold: config.friend_collect_icon_threshold}));
                            if (pt_green) return targets_green.unshift({name: name, list_item_click_y: name_node_cy});
                        }

                        if (help_collect_switch) {
                            let pt_orange = images.findColor(rank_list_capt_img, config.help_collect_icon_color, Object.assign({}, find_color_options, {threshold: config.help_collect_icon_threshold}));
                            if (pt_orange) return targets_orange.unshift({name: name, list_item_click_y: name_node_cy});
                        }
                    } catch (e) {
                        throw Error(e);
                    }
                });

                if (rank_list_capt_img) {
                    rank_list_capt_img.recycle();
                    debugInfo("已回收排行榜截图: " + images.getName(rank_list_capt_img));
                }

                // tool function(s) //

                function getScreenSamples() {
                    let regexp_energy_amount = new RegExp("\\d\+\(\\\.\\d\+\)\?\(k\?g|t\)");
                    let max_try_times = 10;
                    while (max_try_times--) {
                        let screen_samples = boundsInside(cX(0.7), 0, WIDTH, HEIGHT - 1).filter(function (w) {
                            let bounds = w.bounds();
                            if (bounds.bottom > bounds.top) {
                                let _desc_w = w.desc();
                                if (_desc_w && _desc_w.match(regexp_energy_amount)) return true;
                                let _text_w = w.text();
                                if (_text_w && _text_w.match(regexp_energy_amount)) return true;
                            }
                            return false;
                        }).find();
                        let screen_samples_size = screen_samples.size();
                        debugInfo("获取当前屏幕好友样本数量: " + screen_samples_size);
                        if (screen_samples_size) return screen_samples;
                    }
                    return !~debugInfo("刷新样本区域失败");
                }

                /**
                 * to make sure the capture source is from the rank list
                 */
                function getRankListScreenCapture() {
                    let rank_list_screen_capt = images.copy(captureScreen());
                    debugInfo("生成排行榜截图: " + images.getName(rank_list_screen_capt));
                    let max_try_times_wait_for_capt = 25;
                    while (!current_app.kw_rank_list_title().exists() && max_try_times_wait_for_capt--) sleep(80); // wait for capturing finished
                    if (max_try_times_wait_for_capt < 0) messageAction("截图辅助定位控件可能已失效", 3);
                    return rank_list_screen_capt;
                }

                function getFindColorOptions(w) {
                    let parent_node = w.parent();
                    let region_ref = {
                        l: cX(0.7),
                        t: parent_node.bounds().top,
                    };
                    return {
                        region: [region_ref.l, region_ref.t, WIDTH - region_ref.l, parent_node.bounds().centerY() - region_ref.t],
                    };
                }

                function checkRegion(arr) {
                    let [left, top, right, bottom] = [arr[0], arr[1], arr[0] + arr[2], arr[1] + arr[3]];
                    if (left < WIDTH / 2) return debugInfo("采集区域left参数异常: " + left);
                    if (top < 10 || top >= HEIGHT) return debugInfo("采集区域top参数异常: " + top);
                    if (bottom <= 0 || bottom > HEIGHT) return debugInfo("采集区域bottom参数异常: " + bottom);
                    if (right <= left || right > WIDTH + 3) return debugInfo("采集区域right参数异常: " + right);
                    return true;
                }
            }

            function getTargetsByImage() {

                let rank_list_capt_img = images.copy(captureScreen());
                debugInfo("生成排行榜截图: " + images.getName(rank_list_capt_img));

                targets_green = friend_collect_switch && getTargets("green") || targets_green;
                targets_orange = help_collect_switch && getTargets("orange") || targets_orange;

                checkInvitationBtn();

                if (rank_list_capt_img) {
                    rank_list_capt_img.recycle();
                    debugInfo("已回收排行榜截图: " + images.getName(rank_list_capt_img));
                }

                // tool function(s) //

                function getTargets(ident) {
                    let color = ident === "green" && config.friend_collect_icon_color
                        || ident === "orange" && config.help_collect_icon_color || null;
                    if (!color) return;

                    let multi_colors = [[cX(38), 0, color], [cX(38), cY(35, 16 / 9), color]];
                    if (ident === "green") {
                        for (let i = 18; i <= 24; i += 1) multi_colors.push([cX(i), cY(i - 7, 16 / 9), -1]); // 18-25
                    } // [cX(37), cY(25), -1] was abandoned

                    let icon_check_area_top = 0;
                    let color_threshold = ident === "green" && config.friend_collect_icon_threshold ||
                        ident === "orange" && config.help_collect_icon_threshold || 10;
                    let icon_check_area_left = cX(0.9);
                    while (icon_check_area_top < HEIGHT) {
                        let icon_matched = checkAreaByMultiColors();
                        if (!icon_matched) return;
                        let [icon_matched_x, icon_matched_y] = [icon_matched.x, icon_matched.y];
                        let list_item_click_y = icon_matched_y + cY(16, 16 / 9);
                        let target_info = {
                            icon_matched_x: icon_matched_x,
                            icon_matched_y: icon_matched_y,
                            list_item_click_y: list_item_click_y,
                        };
                        ident === "green" && targets_green.unshift(target_info);
                        ident === "orange" && targets_orange.unshift(target_info);
                        icon_check_area_top = icon_matched_y + cY(76, 16 / 9);
                    }

                    // tool function(s) //

                    function checkAreaByMultiColors() {
                        let matched = images.findMultiColors(rank_list_capt_img, color, multi_colors, {
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

                function checkInvitationBtn() {
                    let color_invitation = "#30bf6c";
                    let multi_colors = [
                        [cX(122), 0, color_invitation],
                        [cX(122), cY(48, 16 / 9), color_invitation],
                        [0, cY(48, 16 / 9), color_invitation],
                    ];
                    let matched = images.findMultiColors(rank_list_capt_img, color_invitation, multi_colors, {
                        threshold: 10,
                    });
                    if (matched) {
                        debugInfo("检测到\"邀请\"按钮");
                        list_end_signal = 1;
                    }
                }
            }
        }

        function forestPageGetReady() {

            let kw_forest_page_ident = () => sel.pickup(/你收取TA|发消息/, "kw_forest_page_ident");

            let max_safe_wait_time = 120000; // keep waiting for at most 2 min
            let max_safe_wait_time_backup = max_safe_wait_time;
            let sleep_interval = 200;

            debugInfo("开启\"重新加载\"按钮监测线程");
            let thread_monitor_retry_btn = threads.start(function () {
                while (1) sleep(clickAction(current_app.kw_reload_forest_page_btn()) ? 3000 : 1000);
            });

            while (!kw_forest_page_ident().exists() && max_safe_wait_time > 0) {
                sleep(sleep_interval);
                max_safe_wait_time -= sleep_interval * (current_app.kw_wait_for_awhile().exists() ? 1 : 6);
            }

            let wait_times_sec = (max_safe_wait_time_backup - max_safe_wait_time) / 1000;
            if (wait_times_sec >= 6) debugInfo("进入好友森林时间较长: " + wait_times_sec.toFixed(2) + "秒");

            debugInfo("结束\"重新加载\"按钮监测线程");
            thread_monitor_retry_btn.interrupt();

            if (max_safe_wait_time <= 0) return messageAction("进入好友森林超时", 3, 1);

            current_app.blacklist_need_capture_flag = true;
            debugInfo("已开启能量球监测线程");
            thread_energy_balls_monitor = threads.start(energyBallsMonitorThread);

            // minimum time is about 879.83 ms before energy balls ready (Sony G8441)
            // return waitForAction(kw_energy_balls, 5000);

            if (waitForAction(() => kw_energy_balls().exists(), 2000)) return true;
            return debugInfo("等待能量球超时");

            // debugInfo("尝试刷新控件");
            // refreshObjects();
            // let retry_result = waitForAction(() => kw_energy_balls().exists(), 1000);
            // debugInfo(retry_result ? "刷新成功" : "刷新无效");
            // return retry_result;

            // tool function(s) //

            function energyBallsMonitorThread() {

                let orange_balls = config.help_collect_balls_color;
                let orange_balls_threshold = config.help_collect_balls_threshold;
                let intensity_time = config.help_collect_balls_intensity * 100;

                let now = new Date().getTime();

                while (new Date().getTime() - now < intensity_time) {

                    let screen_capture = images.copy(captureScreen());
                    debugInfo("存储屏幕截图: " + images.getName(screen_capture));
                    if (current_app.blacklist_need_capture_flag) blacklist_ident_capts.add(screen_capture);

                    if (!waitForAction(() => kw_energy_balls_normal().exists(), intensity_time)) return debugInfo("指定时间内未发现普通能量球");

                    let all_normal_balls = kw_energy_balls_normal().find(),
                        norm_balls_size = all_normal_balls.size(),
                        help_balls_size = () => Object.keys(help_balls_coords).length;

                    if (!norm_balls_size) return debugInfo("没有需要采集状态的能量球");
                    if (norm_balls_size === help_balls_size()) return debugInfo("橙色球状态全部采集完毕");

                    all_normal_balls.forEach(w => {
                        let b = w.bounds(),
                            top = b.top;
                        if (top in help_balls_coords) return;

                        let options = {
                            region: [b.left, top, b.width(), b.height()],
                            threshold: orange_balls_threshold,
                        };
                        if (!images.findColor(screen_capture, orange_balls, options)) return;

                        let cx = b.centerX();
                        let cy = b.centerY();
                        help_balls_coords[top] = {x: cx, y: cy};
                        debugInfo("记录橙色球坐标: (" + cx + ", " + cy + ")");
                    });
                    if (!help_balls_size()) debugInfo("未采集到橙色球: " + images.getName(screen_capture));
                    screen_capture.recycle();
                    debugInfo("已回收屏幕截图: " + images.getName(screen_capture));
                }
            }
        }

        function collectBalls() {

            let blacklist_passed_flag = true,
                take_clicked_flag = false;

            debugInfo("已开启黑名单检测线程");
            let thread_blacklist_check = threads.start(blacklistCheckThread);
            thread_blacklist_check.join();
            debugInfo("黑名单检测完毕");

            if (!blacklist_passed_flag) {
                debugInfo("能量球监测线程中断");
                debugInfo(">黑名单检测未通过");
                return thread_energy_balls_monitor.interrupt();
            }

            let thread_take = threads.start(take);
            let thread_help = threads.start(help);

            thread_help.join();
            debugInfo("收取线程结束");
            help_balls_coords = {}; // reset
            thread_take.join();
            debugInfo("帮收线程结束");

            // main function(s) //

            function blacklistCheckThread() {

                let max_wait_times = 10;
                while (!blacklist_ident_capts.length && max_wait_times--) {
                    if (!thread_energy_balls_monitor.isAlive()) break;
                    sleep(100);
                }
                let blacklist_ident_capts_len = blacklist_ident_capts.length;

                if (blacklist_ident_capts_len) {
                    debugInfo("使用能量球监测线程采集数据");
                    debugInfo("黑名单采集样本数量: " + blacklist_ident_capts_len);
                    if (blacklist_ident_capts_len < 3) {
                        debugInfo("黑名单样本数量不足");
                        let max_wait_times_enough_idents = 1;
                        while (max_wait_times_enough_idents--) {
                            if (!thread_energy_balls_monitor.isAlive()) {
                                debugInfo("能量球监测线程已停止");
                                debugInfo("现场采集新黑名单样本数据");
                                captNewBlackListIdent();
                                break;
                            } else if (max_wait_times_enough_idents < 0) {
                                debugInfo("等待样本采集超时");
                                debugInfo("现场采集新黑名单样本数据");
                                captNewBlackListIdent();
                                break;
                            } else if (blacklist_ident_capts.length === 3) {
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

                current_app.blacklist_need_capture_flag = false;
                debugInfo("发送黑名单停止采集信号");

                let protect_color_match = false;
                for (let i = 0, len = blacklist_ident_capts.length; i < len; i += 1) {
                    if (images.findColor(blacklist_ident_capts[i], config.protect_cover_ident_color, {
                        threshold: config.protect_cover_ident_threshold,
                    })) {
                        protect_color_match = true;
                        break;
                    }
                }

                blacklist_ident_capts.clear();

                if (protect_color_match) blacklist_passed_flag = false;
                else return debugInfo("颜色识别无保护罩");

                debugInfo("颜色识别检测到保护罩");

                let kw_list = className("android.widget.ListView");
                if (!waitForAction(kw_list, 3000)) return messageAction("未能通过列表获取能量罩信息", 3, 1, 1);

                debugInfo("已开启动态列表自动展开线程");
                let thread_list_more = threads.start(listMoreThread);
                debugInfo("已开启能量罩信息采集线程");
                let thread_list_monitor = threads.start(listMonitorThread);

                thread_list_monitor.join();
                debugInfo("能量罩信息采集完毕");

                // tool function(s) //

                function listMoreThread() {
                    let kw_list_more = () => sel.pickup("点击加载更多", "kw_list_more_for_rank_list_page");
                    if (!waitForAction(() => kw_list_more().exists(), 2000)) return;

                    let safe_max_try_times = 50; // 10 sec at most
                    let click_count = 0;
                    while (!desc("没有更多").exists() && !text("没有更多").exists() && safe_max_try_times--) {
                        clickAction(kw_list_more(), "widget");
                        click_count++;
                        sleep(200);
                        if (!waitForAction(() => kw_list_more().exists(), 2000)) return;
                    }
                    debugInfo("动态列表展开完毕");
                    debugInfo(">点击\"点击加载更多\": " + click_count + "次");
                }

                function listMonitorThread() {
                    let kw_protect_cover = () => sel.pickup(/.*使用了保护罩.*/, "kw_protect_cover_used");
                    let dates_arr = getDatesArr();
                    if (dates_arr && kw_protect_cover().exists()) addBlacklist();

                    thread_list_more.interrupt();

                    // tool function(s) //

                    function getDatesArr() {
                        if (!waitForAction(kw_list, 3000)) return debugInfo("好友动态列表准备超时");
                        let renewDatesArr = () => {
                            // 3 arrays at most which can enhance efficiency a little bit
                            return kw_list.findOnce().children().filter(w => !w.childCount()).slice(0, 3);
                        };
                        let safe_max_try_times = 8;
                        while (safe_max_try_times--) {
                            let dates_arr = renewDatesArr(),
                                max_i = dates_arr.length;
                            for (let i = 0; i < max_i; i += 1) {
                                let _desc = dates_arr[i].desc();
                                let _text = dates_arr[i].text();
                                let regexp_over_two_days = /\d{2}.\d{2}/;
                                let over_two_days = _desc && _desc.match(regexp_over_two_days) ||
                                    _text && _text.match(regexp_over_two_days); // like: "03-22"
                                if (waitForAction(() => kw_protect_cover().exists(), 1000) || over_two_days) {
                                    thread_list_more.isAlive() && thread_list_more.interrupt();
                                    debugInfo("动态列表展开已停止");
                                    debugInfo("能量罩信息定位在: " + _desc || _text);
                                    return max_i < 3 ? renewDatesArr() : dates_arr; // 3 samples at most
                                }
                            }
                        }
                    }

                    function addBlacklist() {
                        let cover = kw_protect_cover().findOnce(),
                            cover_top = cover.bounds().top;
                        let i = 1;
                        for (let len = dates_arr.length; i < len; i += 1) {
                            if (cover_top < dates_arr[i].bounds().top) break;
                        }

                        let date_str = dates_arr[i - 1].desc(); // "今天" or "昨天"
                        let time_str_clip = cover.parent().parent().child(1).desc(); // like: "03:19"
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
                            let time_offset = time_str.match(/昨天/) && -24;
                            return new Date(new Date(time.setHours(now.getHours() + time_offset)).toDateString() + " " + time_str.slice(2)).getTime(); // timestamp when protect cover took effect
                        }
                    }
                }

                function captNewBlackListIdent() {
                    let screen_capture_new = images.copy(captureScreen());
                    debugInfo("生成屏幕截图: " + images.getName(screen_capture_new));
                    blacklist_ident_capts.add(screen_capture_new);
                    debugInfo("已回收屏幕截图: " + images.getName(screen_capture_new));
                    screen_capture_new.recycle();
                }
            }

            function take() {

                debugInfo("已开启能量球收取线程");
                if (!friend_collect_switch) return debugInfo("收取功能开关未开启");

                if (!waitForAction(() => kw_energy_balls().exists(), 1000)) return debugInfo("收取能量球准备超时");
                if (!kw_energy_balls_ripe().exists()) return (take_clicked_flag = 1) && debugInfo("没有可收取的能量球");

                let ori_collected_amount = getDataCollectedEnergy();
                debugInfo("初始收取数据: " + ori_collected_amount);
                let collected_amount = ori_collected_amount;

                let ripe_balls = kw_energy_balls_ripe().find();
                let ripe_flag = false;

                if (ripe_balls.size()) {
                    current_app.current_friend.console_logged = 1;

                    ripe_flag = 1;
                    ripe_balls.forEach(w => clickAction(w.bounds(), "press"));
                    debugInfo("点击成熟能量球: " + ripe_balls.length + "个");
                    take_clicked_flag = 1;

                    if (isNaN(ori_collected_amount)) return messageAction("初始收取数据无效", 3, 0, 1);

                    debugInfo("等待收取数据稳定");
                    collected_amount = stabilizer(getDataCollectedEnergy);
                    !isNaN(collected_amount) && debugInfo("收取数据已稳定: " + collected_amount);
                }

                if (ripe_flag && (config.console_log_details || config.debug_info_switch)) {
                    let harvest = collected_amount - ori_collected_amount;
                    if (harvest >= 0) messageAction("收取: " + harvest + "g", harvest ? 1 : 0, 0, 1);
                    else messageAction("收取: 统计数据无效", 0, 0, 1);
                    current_app.current_friend.console_logged = 1;
                }

                return true;
            }

            function help() {

                debugInfo("已开启能量球帮收线程");
                if (!help_collect_switch) return debugInfo("帮收功能开关未开启");

                if (thread_energy_balls_monitor.isAlive()) {
                    thread_energy_balls_monitor.join();
                    debugInfo("能量球监测完毕");
                }

                // let kw_helped = desc("你给TA助力");
                let ori_helped_amount = getDataFriendEnergy();
                debugInfo("初始好友能量数据: " + ori_helped_amount);

                let coords_arr = Object.keys(help_balls_coords);
                if (!coords_arr.length) return debugInfo("没有可帮收的能量球");
                if (!waitForAction(() => !!take_clicked_flag || !thread_take.isAlive(), 2000)) {
                    // return;
                    return messageAction("等待收取线程信号超时", 3, 0, 1); ////TEST////
                } else debugInfo("收取线程信号返回正常");
                coords_arr.forEach(coords => {
                    let pt = help_balls_coords[coords];
                    // click(pt.x, pt.y);
                    press(pt.x, pt.y, 1);
                });
                debugInfo("点击帮收能量球: " + coords_arr.length + "个");

                if (isNaN(ori_helped_amount)) return messageAction("获取初始好友能量数据超时", 3, 0, 1);

                debugInfo("等待好友能量数据稳定");
                let helped_amount = stabilizer(getDataFriendEnergy);
                !isNaN(helped_amount) && debugInfo("好友能量数据已稳定: " + helped_amount);

                if (config.console_log_details || config.debug_info_switch) {
                    let helped_result = helped_amount - ori_helped_amount;
                    if (helped_result >= 0) messageAction("助力: " + helped_result + "g", helped_result ? 1 : 0, 0, 1);
                    else messageAction("助力: 统计数据无效", 0, 0, 1);
                    current_app.current_friend.console_logged = 1;
                }
            }
        }

        function backToHeroList() {
            let condition = () => {
                let title_area_match = () => {
                    try {
                        let template = current_app.rank_list_title_area_capt;
                        let current_capt = images.copy(captureScreen());
                        return images.findImage(current_capt, template);
                    } catch (e) {
                        console.warn(e);
                    }
                }; // for the same image formats
                if (strategy === "image") return title_area_match();
                return title_area_match() || current_app.kw_rank_list_title().exists();
            };

            if (condition()) return;

            let max_try_times = 3;
            while (max_try_times--) {
                jumpBackOnce();
                sleep(180);
                if (waitForAction(condition, 1800, 180)) {
                    debugInfo("返回排行榜成功");
                    return true;
                }
                debugInfo("返回排行榜单次超时");
            }
            debugInfo("返回排行榜失败");
            debugInfo("尝试重启支付宝到排行榜页面");
            restartAlipayToHeroList();

            let kw_rank_list_self = idMatches(/.*J_rank_list_self/);
            let condition_rank_list_ready = () => kw_rank_list_self.exists() && kw_rank_list_self.findOnce().childCount();
            if (!waitForAction(condition_rank_list_ready, 2000)) restartAlipayToHeroList(); // just in case

            // tool function(s) //

            function restartAlipayToHeroList() {
                launch({no_message_flag: true});
                rankListReady();
            }
        }

        function swipeUp() {
            if (list_end_signal) return debugInfo("检测到排行榜底部监测线程信号");
            let invalid_rank_list_ref_data = 0;

            let half_width = cX(0.5);
            let swipe_time = config.rank_list_swipe_time;
            let swipe_distance_raw = config.rank_list_swipe_distance;
            let swipe_distance = swipe_distance_raw < 1 ? ~~(swipe_distance_raw * HEIGHT) : swipe_distance_raw;
            let swipe_top = ~~((HEIGHT - swipe_distance) / 2);
            let swipe_bottom = HEIGHT - swipe_top;

            let sample_before_swipe = null;
            if (strategy === "image") {
                debugInfo("采集并存储滑动前图像样本");
                sample_before_swipe = images.copy(images.clip(captureScreen(), 0, swipe_top, WIDTH, swipe_distance));
            }

            debugInfo("上滑屏幕: " + (swipe_bottom - swipe_top) + "px");

            let max_try_times_swipe = 3;
            let max_try_times_swipe_backup = max_try_times_swipe;
            while (max_try_times_swipe--) {
                if (swipe_bottom - swipe_top > 0 && swipe(half_width, swipe_bottom, half_width, swipe_top, swipe_time)) break;
                let swipe_count = max_try_times_swipe_backup - max_try_times_swipe;
                debugInfo("滑动功能失效: (" + swipe_count + "\/" + max_try_times_swipe_backup + ")");
                swipe_bottom = cY(0.9);
                swipe_top = cY(0.1);
                sleep(200);
            }
            if (max_try_times_swipe < 0) {
                messageAction("脚本无法继续", 4);
                messageAction(swipe_bottom - swipe_top > 0 ? "SimpleActionAutomator模块异常" : "滑动距离数据无效", 8, 1, 1, 1);
            }

            let debug_start_timestamp = new Date().getTime();

            debugInfo("等待排行榜列表稳定");

            if (strategy === "image") {
                let getNewClip = () => images.copy(images.clip(captureScreen(), 0, swipe_top, WIDTH, swipe_distance));
                let new_clip = images.copy(sample_before_swipe);
                let max_try_times = 18;
                while (images.findImage(new_clip, sample_before_swipe) && max_try_times--) {
                    if (list_end_signal) return;
                    new_clip.recycle();
                    new_clip = getNewClip();
                    sleep(90);
                }
                if (max_try_times < 0) return;
                debugInfo("检测到模拟滑动");
                new_clip.recycle();
                sleep(config.rank_list_swipe_time);
            } else {
                let bottom_data = undefined;
                let tmp_bottom_data = getRankListSelfBottom();
                debugInfo("参照值: " + tmp_bottom_data);
                while (bottom_data !== tmp_bottom_data) {
                    bottom_data = tmp_bottom_data;
                    sleep(50);
                    tmp_bottom_data = getRankListSelfBottom();
                    if (isNaN(tmp_bottom_data)) {
                        debugInfo("参照值: NaN");
                        invalid_rank_list_ref_data++;
                        if (invalid_rank_list_ref_data > 10) {
                            messageAction("脚本无法继续", 4);
                            messageAction("排行榜列表参照值异常", 8, 1, 1, 1);
                        }
                    } else debugInfo("参照值: " + tmp_bottom_data);
                } // wait for data stable
            }
            debugInfo("排行榜列表已稳定: " + (new Date().getTime() - debug_start_timestamp) + "ms");

            // tool function(s) //

            function getRankListSelfBottom() {
                let max_try_times = 50;
                while (max_try_times--) {
                    try {
                        return idMatches(/.*J_rank_list_self/).findOnce().bounds().bottom;
                    } catch (e) {
                        // nothing to do here
                    }
                }
                return 0 / 0;
            }
        }

        // tool function(s) //

        function endOfListThread() {
            let regexp_end_ident = /邀请|没有更多了/;
            let kw_end_ident_desc = descMatches(regexp_end_ident);
            let kw_end_ident_text = textMatches(regexp_end_ident);
            while (1) {
                try {
                    while (1) {
                        let kn_end_ident_desc = kw_end_ident_desc && kw_end_ident_desc.findOnce();
                        if (kn_end_ident_desc) {
                            kw_end_ident_text = null;
                            let bounds = kn_end_ident_desc.bounds();
                            let top = bounds.top;
                            let bottom = bounds.bottom;
                            let desc = kn_end_ident_desc.desc();
                            if (top < HEIGHT && bottom - top > cX(0.025)) {
                                debugInfo("列表底部条件满足");
                                debugInfo(">bounds: [" + bounds.left + ", " + top + ", " + bounds.right + ", " + bottom + "]");
                                debugInfo(">desc: " + desc);
                                break;
                            }
                        }
                        let kn_end_ident_text = kw_end_ident_text && kw_end_ident_text.findOnce();
                        if (kn_end_ident_text) {
                            kw_end_ident_desc = null;
                            let bounds = kn_end_ident_text.bounds();
                            let top = bounds.top;
                            let bottom = bounds.bottom;
                            let text = kn_end_ident_text.text();
                            if (top < HEIGHT && bottom - top > cX(0.025)) {
                                debugInfo("列表底部条件满足");
                                debugInfo(">bounds: [" + bounds.left + ", " + top + ", " + bounds.right + ", " + bottom + "]");
                                debugInfo(">text: " + text);
                                break;
                            }
                        }
                        sleep(200);
                    }
                    debugInfo("列表底部已到达");
                    return list_end_signal = 1;
                } catch (e) {
                    sleep(200);
                }
            }
        }

        function getDataCollectedEnergy() {
            try {
                let key_node = sel.pickup("你收取TA", "kw_collected_ident").findOnce().parent();
                key_node = key_node.child(key_node.childCount() - 1);
                return +(key_node.desc().match(/\d+/) || key_node.text().match(/\d+/))[0];
            } catch (e) {
                return NaN;
            }
        }

        function getDataFriendEnergy() {
            try {
                let kw_home_panel = idMatches(/.*J_home_panel/);
                let key_node = kw_home_panel.findOnce().child(0).child(0).child(1);
                return +(key_node.desc().match(/\d+/) || key_node.text().match(/\d+/))[0];
            } catch (e) {
                return NaN;
            }
        }

        function stabilizer(condition, condition_timeout, stable_timeout) {
            condition_timeout = condition_timeout || 3000;
            let init_data = NaN;
            let _condition = () => {
                let result = +condition();
                init_data = init_data || result;
                return result;
            };
            if (!waitForAction(() => !isNaN(_condition()), condition_timeout)) return false;
            if (!waitForAction(() => init_data !== _condition(), condition_timeout)) return false;
            stable_timeout = stable_timeout || 300;
            let old_data = init_data;
            let tmp_data = NaN;
            let check = () => tmp_data = condition();
            while (waitForAction(() => old_data !== check(), stable_timeout)) old_data = tmp_data;
            return old_data;
        }

        function inBlackList(clickRankListItemFunc) {
            let strategy = config.rank_list_samples_collect_strategy;

            if (strategy === "image") {
                if (!clickRankListItemFunc()) return true; // skip
                if (checkForestTitle()) {
                    blackListMsg("exist", "split_line");
                    backToHeroList();
                    return true;
                }
            } else {
                if (current_app.current_friend.name in current_app.blacklist) return blackListMsg("exist", "split_line"); // true
                else clickRankListItemFunc();
            }

            // tool function(s) //

            function checkForestTitle() {
                let key_node = null;
                if (!waitForAction(() => key_node = sel.pickup(/.+的蚂蚁森林/).findOnce(), 20000)) return messageAction("标题采集好友昵称超时", 3);
                let getNameStr = string => string.match(/.+(?=的蚂蚁森林$)/);
                let friend_nickname = (getNameStr(key_node.text()) || getNameStr(key_node.desc()) || [])[0];
                if (!friend_nickname) return messageAction("好友昵称无效", 3);
                current_app.current_friend.name = friend_nickname;
                if ((config.console_log_details || config.debug_info_switch) && !current_app.current_friend.name_logged) {
                    messageAction(friend_nickname, "title");
                    current_app.current_friend.name_logged = 1;
                }
                return friend_nickname in current_app.blacklist;
            }
        }

        function blackListMsg(msg_str, split_line_flag) {

            let name = current_app.current_friend.name;
            if (!config.console_log_details && !config.debug_info_switch || ~current_app.logged_blacklist_names.indexOf(name)) return true;

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

            let current_black_friend = current_app.blacklist[name];
            let reason_str = current_black_friend.reason;
            messageAction(reasons[reason_str], 1, 0, 2);
            let check_result = checkBlackTimestamp(current_black_friend.timestamp);
            if (typeof check_result === "string") messageAction(check_result, 1, 0, 2);
            split_line_flag && showSplitLine();
            current_app.logged_blacklist_names.push(name);
            return current_app.current_friend.console_logged = 1;
        }
    }

    function goBackToAfHome() {
        let max_try_times = 5;
        while (max_try_times--) {
            // if (currentPackage() !== current_app.package_name) {
            //     debugInfo("返回蚂蚁森林主页时包名异常");
            //     debugInfo(">" + currentPackage());
            //     break;
            // }
            jumpBackOnce();
            if (waitForAction(() => current_app.kw_af_home().exists(), 1000)) {
                debugInfo("返回蚂蚁森林主页成功");
                return true;
            }
        }
        debugInfo("返回蚂蚁森林主页失败");
        debugInfo("尝试重启支付宝到蚂蚁森林主页");
        killThisApp(current_app.package_name);
        launch({no_message_flag: true});
    }
}

function showResult() {
    debugInfo("开始展示统计结果");
    if (!config.message_showing_switch || !config.result_showing_switch) return true;

    let init = current_app.total_energy_init;
    debugInfo("初始值: " + init);
    let own = current_app.total_energy_collect_own || 0;
    debugInfo("自己能量收取值: " + own);
    let friends = (getCurrentEnergyAmount("buffer") - init - own) || 0;
    debugInfo("好友能量收取值: " + friends);

    if (init < 0 || own < 0 || friends < 0) return msgNotice("数据统计失败");

    return ~msgNotice(energyStr(friends, own) || "A fruitless attempt") && debugInfo("统计结果展示完毕");

    // tool function(s) //

    function showFloatyResult(you, friends, timeout) {

        debugInfo("发送Floaty消息等待信号");
        current_app.floaty_msg_signal = 1;
        timeout = Math.ceil(timeout / 1000) * 1000;
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

        let timeout_prefix = "(",
            timeout_suffix = ")",
            base_height = cY(0.66),
            message_height = cY(80, 16 / 9),
            hint_height = message_height * 0.7,
            timeout_height = hint_height,
            color_stripe_height = message_height * 0.2;

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
        message_raw_win.text.setText(!~you && "Statistics Failed" || (you + friends).toString() || "0");
        message_raw_win.setSize(-2, 0);

        waitForAction(() => message_raw_win.getWidth() > 0, 5000);
        let min_width = Math.max(message_raw_win.getWidth(), cX(0.54), cX(0.25) * hint_len);

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

        debugInfo("Floaty绘制完毕");

        ui.run(() => {
            let floaty_failed_flag = true;
            let tt = timeout / 1000;
            let tt_text = () => timeout_prefix + tt-- + timeout_suffix;
            let setTimeoutText = text => {
                try {
                    timeout_raw_win.text.setText(text);
                    floaty_failed_flag = false;
                } catch (e) {
                    debugInfo("Floaty超时文本设置单次失败");
                    debugInfo(e);
                }
            };
            setTimeoutText(tt_text());
            let interval_timeout = setInterval(() => {
                if (tt < 0) return;
                if (tt < 1) {
                    floaty.closeAll();
                    debugInfo("关闭所有Floaty窗口");
                    current_app.floaty_msg_signal = 0;
                    debugInfo("发送Floaty消息结束等待信号");
                    return tt--;
                }
                setTimeoutText(tt_text());
            }, 1000);
            setTimeout(() => {
                clearInterval(interval_timeout);
                if (!current_app.floaty_msg_signal) return;
                if (floaty_failed_flag) {
                    messageAction("此设备可能无法使用Floaty功能", 3, 1);
                    messageAction("建议改用Toast方式显示收取结果", 3);
                }
                debugInfo("Floaty消息绘制已大最大超时");
                floaty.closeAll();
                debugInfo("强制关闭所有Floaty窗口");
                current_app.floaty_msg_signal = 0;
                debugInfo("强制发送Floaty消息结束等待信号");
            }, timeout + 2000);
        });
    }

    function energyStr(friends_num, self_num) {
        let msg = "";
        if (self_num) msg = "Energy from yourself: " + self_num + "g";
        if (friends_num) msg += (self_num ? "\n" : "") + "Energy from friends: " + friends_num + "g";
        return msg;
    }

    function msgNotice(msg) {
        msg.split("\n").forEach(msg => messageAction(msg, 1));
        if (msg.match(/(失败)|(错误)/)) own = -1;
        config.floaty_result_switch ? showFloatyResult(own, friends, 3500) : messageAction(msg, null, 1);
    }
}

function endProcess() {
    if (current_app.blacklist) {
        debugInfo("存储本次会话黑名单数据");
        current_app.saveState("blacklist", current_app.blacklist);
    }

    current_app.kill_when_done ? endAlipay() : closeAfWindows();

    if (current_app.floaty_msg_signal) {
        debugInfo("等待Floaty消息结束等待信号");
        waitForAction(() => !current_app.floaty_msg_signal, 8000) || debugInfo("等待信号超时 放弃等待");
    }

    debugInfo("关闭所有线程");
    threads.shutDownAll(); // kill all threads started by threads.start()

    screenOff();
    current_app.quote_name && messageAction(current_app.quote_name + "任务结束", 1, 0, 0, "both_n");
    exit();

    // tool function(s) //

    function closeAfWindows() {
        debugInfo("关闭全部蚂蚁森林相关页面");
        let kw_login_with_new_user = () => sel.pickup(/换个新账号登录|[Aa]dd [Aa]ccount/, "kw_login_with_new_user");
        let max_close_time = 10000;
        while ((current_app.kw_af_title().boundsInside(0, 0, cX(0.8), cY(0.2, 16 / 9)).exists() || current_app.kw_rank_list_title().exists() || sel.pickup("浇水").exists()) && clickAction(current_app.kw_close_btn()) || kw_login_with_new_user().exists() && ~jumpBackOnce()) {
            ~sleep(400);
            max_close_time -= 400;
            if (max_close_time <= 0) break;
        }
        if (max_close_time <= 0) {
            debugInfo("页面关闭可能没有成功");
        } else {
            debugInfo("相关页面关闭完毕");
            debugInfo("保留当前支付宝页面");
        }
    }

    function endAlipay() {
        debugInfo("关闭支付宝");
        let alipay_pkg_name = current_app.package_name;
        killThisApp(alipay_pkg_name);
        waitForAction(() => currentPackage() !== alipay_pkg_name, 5000) ? debugInfo("支付宝关闭完毕") : debugInfo("支付宝关闭超时");
    }

    function screenOff() {
        if (current_app.is_screen_on) debugInfo("无需关闭屏幕");
        else {
            let device_brand = device.brand;
            let keycode_power_bug_versions = [/[Mm]eizu/];
            let keycode_power_bug = !!function () {
                for (let i = 0, len = keycode_power_bug_versions.length; i < len; i += 1) {
                    if (device_brand.match(keycode_power_bug_versions[i])) return true;
                }
            }();
            if (!keycode_power_bug) ~debugInfo("关闭屏幕") && keycode(26) || debugInfo("关闭屏幕失败");
            else {
                messageAction("关闭屏幕失败", 3);
                messageAction("设备型号不支持自动关屏", 3, 0, 1);
                messageAction("型号: " + device_brand, 3, 0, 1);
            }
        }
    }
}

// tool function(s) //

function getCurrentEnergyAmount(buffer_flag) {
    if (buffer_flag) {
        let condition = () => sel.pickup(/\d+g/, "kw_energy_amount_single_user").exists() && current_app.kw_af_home().exists();
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
        try {
            return descMatches(/\d+g/).findOnce().desc().match(/\d+/)[0] - 0;
        } catch (e) {
            try {
                return textMatches(/\d+g/).findOnce().text().match(/\d+/)[0] - 0;
            } catch (e) {
                max_try_times && sleep(200);
            }
        }
    }
    if (max_try_times < 0) return -1;
}

function checkBlackTimestamp(timestamp) {

    if (typeof timestamp === "undefined") return true;
    if (timestamp === 0) return true;

    let now = new Date();
    let duration_ms = timestamp - now.getTime();
    if (duration_ms <= 0) return;

    if (!config.console_log_details && !config.debug_info_switch) return true;

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

function launch(params) {
    return launchThisApp.bind(this)(current_app.intent, Object.assign({
        task_name: "蚂蚁森林",
        first_time_run_message_flag: true,
        condition_launch: () => {
            let condition_a = () => currentPackage() === current_app.package_name;
            // let condition_b = () => engines.myEngine().execArgv.special_exec_command === "collect_friends_list" && currentPackage().match(/^org\.autojs\.autojs(pro)?$|.+AlipayGphone$/);
            let condition_c = () => current_app.kw_list_more_friends().exists() || current_app.kw_af_home().exists() || current_app.kw_wait_for_awhile().exists();

            // return condition_a() || condition_b() || condition_c();
            return condition_a() || condition_c();
        },
        condition_ready: () => {
            let conditions_necessary = {
                af_title_or_login: () => current_app.kw_af_title().exists() || current_app.kw_login_or_switch.exists(),
            };
            let conditions_optional = {
                kw_function_buttons: () => current_app.kw_af_home().exists(),
                kw_list_more_friends_btn: () => current_app.kw_list_more_friends().exists(),
                kw_login_or_switch: current_app.kw_login_or_switch,
            };
            let keys_nec = Object.keys(conditions_necessary);
            for (let i = 0, len = keys_nec.length; i < len; i += 1) {
                let key_nec = keys_nec[i];
                let condition = conditions_necessary[key_nec];
                if (typeof condition === "function" && !condition() ||
                    typeof condition === "object" && !condition.exists()) {
                    debugInfo("启动必要条件不满足");
                    return debugInfo(">" + key_nec);
                }
            }
            debugInfo("已满足全部启动必要条件");
            current_app.kw_af_title = () => sel.pickup(/蚂蚁森林|Ant Forest/, "kw_af_title");

            let keys_opt = Object.keys(conditions_optional);
            for (let i = 0, len = keys_opt.length; i < len; i += 1) {
                let key_opt = keys_opt[i];
                let condition = conditions_optional[key_opt];
                if (typeof condition === "function" && condition() ||
                    typeof condition === "object" && condition.exists()) {
                    debugInfo("已满足启动可选条件");
                    debugInfo(">" + key_opt);
                    return true;
                }
            }
            debugInfo("需至少满足一个启动可选条件");
        },
        disturbance: () => {
            while (!waitForAction(() => this._monster_$_launch_ready_monitor_signal, 2000)) clickAction(current_app.kw_reload_forest_page_btn());
        },
    }, params || {}));
}

function setScreenPixelData() {
    [WIDTH, HEIGHT, cX, cY] = (function () {
        let {WIDTH, HEIGHT, cX, cY} = getDisplayParams();
        if (!WIDTH || !HEIGHT) messageAction("获取屏幕宽高数据失败", 8, 1, 0, 1);
        debugInfo("屏幕宽高: " + WIDTH + " × " + HEIGHT);
        return [WIDTH, HEIGHT, cX, cY];
    }());
}

function checkModules() {
    try {
        storage_af_cfg = require("./Modules/MODULE_STORAGE").create("af_cfg");
        Object.assign(config, require("./Modules/MODULE_DEFAULT_CONFIG").af || {}, storage_af_cfg.get("config", {}));
        unlock_module = new (require("./Modules/MODULE_UNLOCK.js"));
        this._monster_$_debug_info_flag = config.debug_info_switch && config.message_showing_switch;
        debugInfo("接入\"af_cfg\"存储", "up");
        debugInfo("整合代码配置与本地配置");
        debugInfo("成功导入解锁模块");

        storage_af = require("./Modules/MODULE_STORAGE").create("af");
        debugInfo("接入\"af\"存储");
        if (!storage_af.get("config_prompted")) promptConfig();
    } catch (e) {
        debugInfo(e);
        messageAction("模块导入功能异常", 3, 0, 0, "up");
        messageAction("开发者测试模式已自动开启", 3);
        config.message_showing_switch = true;
        config.debug_info_switch = true;
    }
}

function checkTasksQueue() {
    let queue_flag = false;
    let queue_start_timestamp = new Date().getTime();
    let checkExclusiveTasks = () => {
        let filtered_tasks = engines.all()
            .filter(e => e.getTag("exclusive_task") && e.id < engines.myEngine().id)
            .sort((a, b) => a.id > b.id);
        if (filtered_tasks.length) return filtered_tasks;
    };
    try {
        engines.myEngine().setTag("exclusive_task", "af");
        if (typeof engines.myEngine().execArgv === "undefined") throw Error("抛出本地异常: Engines模块功能无效");
        let init_ex_tasks_check = checkExclusiveTasks();
        if (init_ex_tasks_check) {
            let queue_length = init_ex_tasks_check.length;
            debugInfo("排他性任务排队中: " + queue_length + "项");
            let max_queue_time = (config.max_running_time + 1) * queue_length;
            let queue_force_stop_timestamp = new Date().getTime() + max_queue_time * 60000;
            debugInfo("已设置最大排队时间: " + max_queue_time + "分钟");
            while (1) {
                let filtered_tasks = checkExclusiveTasks();
                if (!filtered_tasks) break;
                queue_flag = true;
                sleep(1000);
                if (queue_force_stop_timestamp <= new Date().getTime()) {
                    filtered_tasks[0].forceStop();
                    debugInfo("强制停止最早一项任务");
                    debugInfo(">" + "已达最大排队等待时间");
                }
            }
        }
    } catch (e) {
        if (queue_flag) return;
        let error_msg = "此版本Engines模块功能异常";
        messageAction(error_msg, 3);
        debugInfo(e);
        engines_support_flag = false;
        debugInfo("Engines支持性标记: false")
    }
    queue_flag && debugInfo("任务排队用时: " + (new Date().getTime() - queue_start_timestamp) / 1000 + "秒", "up");
}

function checkVersion() {
    let current_autojs_package = "";
    try {
        current_autojs_package = context.packageName;
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

    let threads_functional_flag = typeof threads !== "undefined";

    if (threads_functional_flag) {
        let thread_check_bug_vers = threads.start(checkBugVersions);
        thread_check_bug_vers.join();
    } else checkBugVersions();

    // tool function(s) //

    function checkBugVersions() {
        let bug_code_map = {
            "failed": "版本信息获取失败\n不建议使用此版本运行项目",
            "ab_cwd": "cwd()方法功能异常",
            "ab_relative_path": "相对路径功能异常",
            "ab_find_forEach": "UiSelector.find().forEach()方法功能异常",
            "ab_floaty": "Floaty模块异常",
            "ab_SimpActAuto": "SimpleActionAutomator模块异常",
            "ab_inflate": "ui.inflate()方法功能异常",
            "ab_uiSelector": "UiSelector模块功能异常",
            "ab_ui_layout": "图形配置页面布局异常",
            "crash_autojs": "脚本运行后导致Auto.js崩溃",
            "crash_ui_call_ui": "ui脚本调用ui脚本会崩溃",
            "crash_ui_settings": "图形配置页面崩溃",
            "dislocation_floaty": "Floaty模块绘制存在错位现象",
            "forcibly_update": "强制更新",
            "na_login": "无法登陆Auto.js账户",
            "un_cwd": "不支持cwd()方法及相对路径",
            "un_engines": "不支持Engines模块",
            "un_execArgv": "不支持Engines模块的execArgv对象",
            "un_inflate": "不支持ui.inflate()方法",
            "un_relative_path": "不支持相对路径",
            "un_runtime": "不支持runtime参数",
            "un_view_bind": "不支持view对象绑定自定义方法",
        };

        let bugs_check_result = checkBugs(current_autojs_version);
        if (bugs_check_result === 0) return debugInfo("Bug版本检查: 正常");
        if (bugs_check_result === "") return debugInfo("Bug版本检查: 未知");
        bugs_check_result = bugs_check_result.map(bug_code => "\n-> " + (bug_code_map[bug_code] || "\/*无效的Bug描述*\/"));
        debugInfo("Bug版本检查: 确诊");
        let bug_content = "脚本可能无法正常运行\n建议更换Auto.js版本\n\n当前版本:\n-> " + (current_autojs_version || "/* 版本检测失败 */") +
            "\n\n异常详情:" + bugs_check_result.join();

        try {
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
                    events.observeKey();
                    events.onKeyDown("volume_up", function (event) {
                        debugInfo("用户按下音量加键");
                        debugInfo("尝试点击确定按钮");
                        clickAction(textMatches(/OK|确定/), "widget");
                        messageAction("脚本已停止", 4, 1);
                        messageAction("用户终止运行", 4, 0, 1);
                        exit();
                    });
                });
            }
            debugInfo("此版本Dialogs模块功能异常");
            debugInfo("使用Alert()方法替代");
            if (threads_functional_flag) {
                alert(bug_content + "\n\n" +
                    "按'确定/OK'键尝试继续执行\n" +
                    "按'音量加/VOL+'键停止执行");
            } else {
                alert(bug_content + "\n\n" +
                    "按'确定/OK'键停止执行");
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
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines", "crash_ui_settings"];
            }

            // 3.0.0 Alpha21 <= version <= 3.0.0 Alpha36
            if (ver_name.match(/^3\.0\.0 Alpha(2[1-9]|3[0-6])$/)) {
                return ["un_cwd", "un_inflate", "un_runtime", "un_engines"];
            }

            // 3.0.0 Alpha37 <= version <= 3.0.0 Alpha41
            if (ver_name.match(/^3\.0\.0 Alpha(3[7-9]|4[0-1])$/)) {
                return ["ab_cwd", "un_relative_path", "un_inflate", "un_runtime", "un_engines"];
            }

            // version >= 3.0.0 Alpha42 || version ∈ 3.0.0 Beta[s] || version <= 3.1.0 Alpha5
            if (ver_name.match(/^((3\.0\.0 ((Alpha(4[2-9]|[5-9]\d))|(Beta\d?)))|(3\.1\.0 Alpha[1-5]?))$/)) {
                return ["un_inflate", "un_runtime", "un_engines"];
            }

            // version >= 3.1.0 Alpha6 || version <= 3.1.1 Alpha2
            if (ver_name.match(/^((3\.1\.0 (Alpha[6-9]|Beta))|(3\.1\.1 Alpha[1-2]?))$/)) {
                return ["un_inflate", "un_engines"];
            }

            // 3.1.1 Alpha3 <= version <= 3.1.1 Alpha4:
            if (ver_name.match(/^3\.1\.1 Alpha[34]$/)) {
                return ["ab_inflate", "un_engines"];
            }

            // version >= 3.1.1 Alpha5 || version -> 4.0.0/4.0.1 || version <= 4.0.2 Alpha6
            if (ver_name.match(/^((3\.1\.1 Alpha[5-9])|(4\.0\.[01].+)|(4\.0\.2 Alpha[1-6]?))$/)) {
                return ["un_execArgv", "ab_inflate"];
            }

            // version >= 4.0.2 Alpha7 || version === 4.0.3 Alpha([1-5]|7)?
            if (ver_name.match(/^((4\.0\.2 Alpha([7-9]|\d{2}))|(4\.0\.3 Alpha([1-5]|7)?))$/)) {
                return ["dislocation_floaty", "ab_inflate"];
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

            // version >= 4.0.4 Alpha5 || version === 4.1.0 Alpha(2|5)? || version ∈ 4.1.1
            // version === Pro 7.0.0-(4|6) || version === Pro 7.0.2-4
            if (ver_name.match(/^(4\.0\.4 Alpha([5-9]|1[01])|(4\.1\.0 Alpha[25]?)|(4\.1\.1.+))$/) ||
                ver_name.match(/^Pro 7\.0\.((0-[46])|(2-4))$/)) {
                return 0; // known normal
            }

            switch (ver_name) {
                case "0":
                    return ["failed"];
                case "4.0.3 Alpha6":
                    return ["ab_floaty", "ab_inflate"];
                case "4.0.4 Alpha":
                    return ["dislocation_floaty", "un_view_bind"];
                case "4.0.4 Alpha3":
                    return ["dislocation_floaty", "ab_ui_layout"];
                case "4.0.4 Alpha4":
                    return ["ab_find_forEach"];
                case "4.0.4 Alpha12":
                    return ["un_execArgv"];
                case "4.0.5 Alpha":
                    return ["ab_uiSelector"];
                case "Pro 7.0.0-0":
                    return ["na_login"];
                case "Pro 7.0.0-3":
                    return ["crash_ui_call_ui"];
                case "Pro 7.0.0-5":
                    return ["forcibly_update"];
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
    };

    if (engines_support_flag) {
        let special_exec_command = engines.myEngine().execArgv.special_exec_command;
        if (special_exec_command) {
            if (!(special_exec_command in special_exec_list)) {
                messageAction("未知的执行命令参数:\n" + special_exec_command, null, 1);
                messageAction("脚本无法继续", 4, 0, 0, "up");
                messageAction("未知的执行命令参数", 4, 0, 1);
                messageAction(special_exec_command, 8, 0, 2, 1);
            }
            debugInfo("执行特殊指令: " + special_exec_command);
            special_exec_list[special_exec_command]();
        }
    } else {
        messageAction("跳过\"执行特殊指令\"检查", 3);
        messageAction("Engines模块功能异常", 3, 0, 1);
    }
}

function promptConfig() {
    debugInfo("显示参数调整提示对话框");
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

function jumpBackOnce(specific_kw) {
    let kw_back_btn_common = () => sel.pickup("返回", "kw_back_btn_common");
    let kw_back_btn_atnui_id = idMatches(/.*back.button/);
    let kw_back_btn_h5_id = idMatches(/.*h5.(tv.)?nav.back/);
    let click_result = specific_kw ?
        clickAction(specific_kw, "widget") :
        clickAction(kw_back_btn_common(), "widget") ||
        clickAction(kw_back_btn_atnui_id, "widget") ||
        clickAction(kw_back_btn_h5_id, "widget");
    click_result || keycode(4) && ~debugInfo("模拟返回按键返回上一页") && sleep(1000);
}

function loginSpecificUser() {

    if (!current_app.specific_user) return debugInfo("主账户未设置");

    let kw_login_with_new_user = textMatches(/换个新账号登录|[Aa]dd [Aa]ccount/);
    let intent_alipay_acc_manager = {
        action: "VIEW",
        packageName: "com.eg.android.AlipayGphone",
        className: "com.alipay.mobile.security.accountmanager.ui.AccountManagerActivity_",
    };

    app.startActivity(intent_alipay_acc_manager);

    let max_wait_times = 8;
    let try_times = 0;
    while (!waitForAction(kw_login_with_new_user, try_times++ ? 5000 : 1500) && max_wait_times--) {
        jumpBackOnce();
        app.startActivity(intent_alipay_acc_manager);
    }
    if (max_wait_times < 0) return messageAction("无法进入用户列表页面", 8, 1);

    let specific_user = current_app.specific_user;
    let kw_list_arrow = id("com.alipay.mobile.antui:id/list_arrow"),
        current_logged_in_user_ident = kw_list_arrow.exists() && kw_list_arrow.findOnce().parent().child(0).child(0).child(0).text(),
        specific_user_ident = specific_user.username_ident;
    if (current_logged_in_user_ident === specific_user_ident) return true;

    let kw_specific_user_ident = text(specific_user.username_ident),
        kw_me = textMatches(/我的|Me/).boundsInside(0, cY(0.7), WIDTH, HEIGHT),
        kw_switch_account = idMatches(/.*switchAccount.*/),
        kw_user_acc_input = id("com.ali.user.mobile.security.ui:id/userAccountInput");
    if (clickAction(kw_specific_user_ident)) {
        let condition_click_acc = () => kw_me.exists() || kw_switch_account.exists() || kw_user_acc_input.exists();
        if (!waitForAction(condition_click_acc, 30000)) messageAction("切换账号点击已有账户时出现未知情况", 8, 1);
        if (kw_me.exists()) return true;
        clickAction(kw_switch_account);
    } else clickAction(kw_login_with_new_user);

    let max_try_times_user_acc_input = 3;
    while (!waitForAction(kw_user_acc_input, 10000) && max_try_times_user_acc_input--) {
        clickAction(kw_login_with_new_user) || clickAction(kw_switch_account);
    }
    if (max_try_times_user_acc_input < 0) return messageAction("未找到用户名输入文本框", 8, 1);

    kw_user_acc_input.findOnce().children().forEach(w => {
        if (w.className() === "android.widget.EditText") w.setText(specific_user.login_username);
    });
    let kw_pw_input = idMatches(/.*userPasswordInput.*/),
        kw_next_step = idMatches(/.*nextButton/);
    if (!kw_pw_input.exists()) {
        if (!waitForAndClickAction(kw_next_step, 8000)) messageAction("输入用户名后未找到下一步按钮", 8, 1);
    }
    let max_wait_times_pw_input = 60;
    while (!waitForAction(idMatches(/.*(switchLoginMethodCenter|userPasswordInput).*/), 1000) && max_wait_times_pw_input--) {
        clickAction(id("com.ali.user.mobile.security.ui:id/comfirmSetting")); // "确定" button
        clickAction(kw_next_step);
    }
    if (max_wait_times_pw_input < 0) return messageAction("输入用户名后下一步操作超时", 8, 1);
    let kw_switch_login_method = idMatches(/.*switchLoginMethodCenter.*/);
    if (clickAction(kw_switch_login_method)) {
        let kw_login_by_pw = textMatches(/.*(密码登录|with passw).*/);
        if (!waitForAction(kw_login_by_pw, 8000)) return messageAction("等待切换登录方式页面超时", 8, 1);
        clickAction(kw_login_by_pw);
    }
    if (!waitForAction(kw_pw_input, 5000)) messageAction("等待密码输入框超时", 8, 1);
    kw_pw_input.findOnce().children().forEach(w => {
        if (w.className() === "android.widget.EditText") w.setText(specific_user.login_pw);
    });
    clickAction(idMatches(/.*loginButton/), 1);
    sleep(1000);

    let case_a = textMatches(/Me|我的/),
        case_b = textMatches(/重新输入|Try again/), // wrong password
        case_c = descMatches(/.*(验证码|Verification Code).*/), // sms code is needed
        case_d = textMatches(/.{3,}验证码.{3,}|.{6,}Verification Code.{6,}/), // just a prompt, can be ignored
        case_e = descMatches(/.*(回答|questions|换个方式登录|[Aa]nother).*/), // need answering some questions // 英文的desc没有具体确定
        case_f = kw_list_arrow;
    if (!waitForAction(() => {
        clickAction(idMatches(/.*btn_confirm/));
        return case_a.exists() || case_b.exists() || case_c.exists() || case_d.exists() || case_e.exists() || case_f.exists();
    }, 20000, 1000)) messageAction("登录后检测登录状态失败", 8, 1);

    if (case_a.exists()) return true;
    if (case_b.exists()) return messageAction("登录密码错误", 3, 1);
    if (case_c.exists()) return messageAction("需要验证码", 3, 1);
    if (case_d.exists()) {
        clickAction(textMatches(/进入支付宝|.*[En]ter.*/)); // 英文的text没有具体确定
        return waitForAction(textMatches(/Me|我的/), 10000) || messageAction("登录账户超时", 8, 1);
    }
    if (case_e.exists()) return messageAction("需要回答问题", 3, 1);
    if (case_f.exists()) {
        let current_logged_in_user_ident = kw_list_arrow.findOnce().parent().child(0).child(0).child(0).text();
        if (current_logged_in_user_ident === specific_user.username_ident) return true;
    }
}

// special exec comm function(s) //

function speExecCollectFriendsList() {
    let intent = {
        action: "VIEW",
        data: "alipays://platformapi/startapp?saId=20000067" +
            "&url=" + encodeURIComponent("https://60000002.h5app.alipay.com/www/listRank.html") +
            "&__webview_options__=" + encodeURIComponent('showOptionMenu=YES&startMultApp=YES'),
    };

    init();
    launchThisApp(intent, {
        task_name: "好友列表采集",
        first_time_run_message_flag: false,
        condition_ready: () => {
            let kw_rank_list = idMatches(/.*J_rank_list/);
            try {
                return kw_rank_list.exists() && kw_rank_list.findOnce().childCount();
            } catch (e) {
                // nothing to do here
            }
        },
        disturbance: () => {
            while (!waitForAction(() => this._monster_$_launch_ready_monitor_signal, 2000)) clickAction(sel.pickup("再试一次", "kw_rank_list_try_again"));
        },
    });
    collectFriendsListData();
    endProcess();

    // tool function(s) //

    function collectFriendsListData() {

        current_app.quote_name = "\"" + "好友列表采集" + "\"";

        let start_timestamp = new Date().getTime();
        let first_time_collect_flag = true;
        let thread_keep_toast = threads.start(function () {
            while (1) {
                messageAction("正在采集好友列表数据", first_time_collect_flag ? 1 : 0, 1, 0, "up");
                sleep(first_time_collect_flag ? 4000 : 6000);
                first_time_collect_flag = false;
            }
        });

        let thread_expand_hero_list = threads.start(function expandHeroListThread() {
            let kw_list_more = idMatches(/.*J_rank_list_more/);
            let click_count = 0;
            while (!desc("没有更多了").exists() && !text("没有更多了").exists()) {
                clickAction(kw_list_more, "widget");
                click_count++;
                sleep(200);
            }
            debugInfo("排行榜展开完毕");
            debugInfo(">点击\"查看更多\": " + click_count + "次");
        });
        thread_expand_hero_list.join(300000); // 5 min at most
        thread_expand_hero_list.isAlive() && thread_expand_hero_list.interrupt();

        let friend_list_data = getFriendsListData();
        storage_af.put("friends_list_data", friend_list_data);
        thread_keep_toast.interrupt();
        messageAction("采集完毕", 1, 1);
        messageAction("用时 " + (new Date().getTime() - start_timestamp) + " 毫秒", 1, 0, 1);
        messageAction("总计 " + friend_list_data.list_length + " 项", 1, 0, 1);
        current_app.floaty_msg_signal = 0;

        // tool function (s) //

        function getFriendsListData() {
            let kw_rank_list = idMatches(/.*J_rank_list/);
            let rank_list = [];
            kw_rank_list.findOnce().children().forEach((child, idx) => {
                try {
                    let rank_num = getRankNum(child, idx);
                    let nickname = getNickname(child, idx);
                    if (+rank_num) {
                        rank_list.push({
                            rank_num: +rank_num,
                            nickname: nickname,
                        });
                    }
                } catch (e) {
                    // nothing to do here
                }
            });
            let max_rank_num_length = rank_list[rank_list.length - 1].rank_num.toString().length;
            let fill_zeros = new Array(max_rank_num_length).join("0");
            rank_list.map(o => {
                o.rank_num = (fill_zeros + o.rank_num).slice(-max_rank_num_length);
            });

            return {
                timestamp: new Date().getTime(),
                list_data: rank_list,
                list_length: rank_list.length,
            };

            // tool function(s) //

            function getRankNum(child, idx) {
                if (idx < 3) return idx + 1;
                return checkChild(0) || checkChild(1);

                // tool function(s) //

                function checkChild(num) {
                    let key_node = child.child(num);
                    if (!key_node) return;
                    let desc = child.child(num).desc();
                    if (desc && desc.match(/\d+/)) return desc;
                    let text = child.child(num).text();
                    if (text && text.match(/\d+/)) return text;
                }
            }

            function getNickname(child, idx) {
                return checkChild(1) || checkChild(2);

                // tool function(s) //

                function checkChild(num) {
                    let key_node = child.child(num);
                    if (!key_node) return;
                    let desc = child.child(num).desc();
                    if (desc) return desc;
                    let text = child.child(num).text();
                    if (text) return text;
                }
            }
        }
    }
}