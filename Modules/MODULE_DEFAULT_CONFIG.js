module.exports = {
    af: {
        self_collect_switch: true, // i know the trick about the reason you wanna turn this switch off
        app_launch_springboard: "ON", // sometimes alipay will not be launched without Auto.js running in the foreground
        account_switch: false, // if you are multi-account user, you may turn this on and specify a "main account" to switch
        account_log_back_in_switch: false, // if you are multi-account user, you may turn this on and specify a "main account" to switch
        account_log_back_in_max_continuous_times: 3, // with this value, switching back will not always happen infinitely
        main_account_info: {}, // stores information of the "main account" user
        max_own_forest_balls_ready_time: 800, // 200 <= x <= 2000, safe: 500; max check time for ant forest homepage balls being ready
        energy_balls_click_interval: 30, // 10 <= x <= 150; as the saying goes, "Haste makes waste"
        homepage_monitor_switch: true, // set true value if you need continuously check your own energy balls
        homepage_monitor_threshold: 2, // 1 <= x <= 3; continuously check your own energy balls if min countdown is within threshold
        homepage_background_monitor_switch: false, // return to homepage and monitor if own energy min countdown is less than some threshold
        homepage_background_monitor_threshold: 1, // so far, only 1 is allowed; you can change it into 0.9 or 1.2, just maybe in the future
        friend_collect_switch: true, // seriously? i cannot believe it if you turn this switch off
        friend_collect_icon_color: "#1da06d", // color for collect icon with a hand pattern
        friend_collect_icon_threshold: 10, // 0 <= x <= 66; the smaller, the stricter; max limit tested on Sony G8441
        help_collect_switch: true, // set false if you do not wanna give a hand; leave it true if you like "surprise"
        help_collect_section: ["00:00", "00:00"], // a valid time section of help collect function; default: the whole day
        six_balls_review_switch: true, // review current friend's forest if help balls have been collected successfully when 6 balls exist
        six_balls_review_max_continuous_times: 3, // 1 <= x <= 8; max continuous review times for a certain friend
        help_collect_icon_color: "#f99137", // color for help icon with a heart pattern
        help_collect_icon_threshold: 10, // 0 <= x <= 66; the smaller, the stricter; max limit tested on Sony G8441
        help_collect_balls_color: "#f99137", // color for fade-in-and-out help balls in a friend's forest
        help_collect_balls_threshold: 60, // 30 ~< x <= 83; the smaller, the stricter; max limit tested on Sony G8441
        help_collect_balls_intensity: 12, // 10 <= x <= 20; more samples for image matching, at the cost of time however
        protect_cover_ident_color: "#bef658", // protect cover identifying color from a certain point in countdown area
        protect_cover_ident_threshold: 5, // do not set this value too big in case that green balls will be recognized as protect cover
        auto_unlock_switch: false, // set true if you wish your dream's coming true when you are making a sweet dream or snoring
        message_showing_switch: true, // set false value if you need a clean console or hide what you've done to your friends
        console_log_switch: true, // if false was set, message in console will not be printed, but toast or floaty not included
        console_log_details: true, // whether to show message details of each friend in console
        debug_info_switch: false, // show debug logs in console to debug this script or to give developer feedback
        result_showing_switch: true, // information will show in floaty way with true or toast way with false
        floaty_result_switch: true, // result will show in floaty way with "true value" or toast way with "false value"
        floaty_result_countdown: 4, // 2 <= x <= 10; countdown seconds before floaty window going dismissed
        rank_list_samples_collect_strategy: "layout", // "image" for image recolonization or "layout" for layout inspection
        rank_list_auto_expand_switch: true, // rank list auto expanded by monitoring and clicking "list more" button
        rank_list_auto_expand_length: 200, // 100 <= x <= 500; auto expanded thread interrupted if list items amount reached this limit
        rank_list_review_switch: true, // review rank list samples if one or more of conditions met
        rank_list_review_threshold_switch: true, // rank list review condition: min countdown threshold
        rank_list_review_threshold: 1, // 1 <= x <= 5; check if rank list min countdown is less than threshold
        rank_list_review_samples_clicked_switch: true, // rank list review condition: samples clicked flag
        rank_list_review_difference_switch: true, // rank list review condition: samples difference between last two samples nickname data
        rank_list_swipe_distance: 0.75, // [0.4, 0.9] for percentage, or integer for pixel distance (like 1260)
        rank_list_swipe_time: 150, // 50 <= x <= 500; duration for swiping up each time
        rank_list_swipe_interval: 300, // 100 <= x <= 800; interval between swipes
        rank_list_capt_pool_diff_check_threshold: 20, // 5 <= x <= 800; to prevent infinity swipe up at rank list page
        timers_switch: false, // fantastic function which almost everybody wants it, however, i still need to switch it off initially
        timers_self_manage_switch: true, // set false value if you prefer a manual timer management
        timers_countdown_check_own_switch: true, // whether to auto-calc next running timestamp and set a timed task
        timers_countdown_check_own_timed_task_ahead: 2, // 0 <= x <= 3; if you prefer an earlier timed task before own balls ripe
        timers_countdown_check_friends_switch: true, // whether to auto-calc next running timestamp and set a timed task
        timers_countdown_check_friends_timed_task_ahead: 1, // 0 <= x <= 5; if you prefer an earlier timed task before friends' balls ripe
        // timers_countdown_check_screening: true, // if true was set, unnecessary tasks will not be executed
        timers_uninterrupted_check_switch: true, // whether to set a timed task in the future when there are no other tasks set
        timers_uninterrupted_check_sections: [{section: ["06:30", "00:00"], interval: 60}], // 1 <= x <= 600; multi sections available
        timers_insurance_switch: true, // just in case, as you know; timed task will be set on running and removed when script finished
        timers_insurance_interval: 5, // 1 <= x <= 10; timed task will be extended every 10 sec to avoid interval's consumption
        timers_insurance_max_continuous_times: 3, // 1 <= x <= 5; auto-insurance task will be dysfunctional with to many continuous attempts
        max_retry_times_global: 2, // 0 <= x <= 5; max retry times when the script crushed; set 0 if you do not need to retry even once
        max_running_time_global: 45, // 5 <= x <= 90; max running time for a single script
        max_queue_time_global: 60, // 1 <= x <= 120; max queue time for every exclusive task if exclusive tasks ahead is running or queueing
        min_bomb_interval_global: 300, // 100 <= x <= 800; exclusive tasks with too small intervals will be taken as bomb tasks
        kill_when_done_switch: false, // decide whether to kill alipay app before script ended
        kill_when_done_intelligent: true, // true value for an intelligent check before killing alipay
        kill_when_done_keep_af_pages: false, // set true value if you prefer to keep ant forest pages before script ended
        phone_call_state_monitor_switch: true, // when switched on, script will be paused if phone call state is not idle
        phone_call_state_idle_value: undefined, // dynamic; will be initialized when script running (often among 0, 1 and 2)
        prompt_before_running_switch: true, // set false value if you do not need a countdown dialog before running script
        prompt_before_running_countdown_seconds: 5, // 3 <= x <= 30; countdown seconds before dialog dismissed automatically
        prompt_before_running_postponed_minutes_default_choices: [1, 2, 3, 5, 10, 15, 20, 30], // default choices for a postponed minute
        prompt_before_running_postponed_minutes: 0, // 0 for ask every time, other number like 1, 2, 5 for specific postponed minute
        prompt_before_running_postponed_minutes_user: 3, // record user selected value of postponed settings dialog in countdown dialog
        rank_list_bottom_template_path: files.getSdcardPath() + "/.local/Pics/rank_list_bottom_template.png",
    },
    unlock: {
        unlock_code: null, // when we first met, i do not know your name, your age, or, your sexual orientation, wow...
        unlock_max_try_times: 20, // max times for trying unlocking your phone
        unlock_pattern_strategy: "segmental", // of "solid"; seg for faster and more accurate swipe and solid for stable swipe without break
        unlock_pattern_size: 3, // side size of a speed-dial-like pattern for unlocking your phone, and 3 is the most common value
        unlock_pattern_swipe_time_segmental: 120, // swipe time for pattern unlock each two points; may be auto modified
        unlock_pattern_swipe_time_solid: 200, // swipe time for pattern unlock each time; may be auto modified
        unlock_dismiss_layer_bottom: 0.8, // 0.5 <= x <= 0.95; great value (like 0.95) may cause unexpected object activation
        unlock_dismiss_layer_top: 0.2, // 0.05 <= x <= 0.3; this value may be not that important
        unlock_dismiss_layer_swipe_time: 110, // time for swiping up to dismiss the lock screen layer; will be auto modified initially
    },
    settings: {
        item_area_width: 0.78,
        sub_head_color: "#03a6ef",
        sub_head_highlight_color: "#bf360c",
        info_color: "#78909c",
        title_default_color: "#202020",
        title_caution_color: "#b71c1c",
        title_bg_color: "#03a6ef",
        list_title_bg_color: "#afefff",
        btn_on_color: "#ffffff",
        btn_off_color: "#bbcccc",
        split_line_color: "#bbcccc",
        caution_btn_color: "#ff3d00",
        attraction_btn_color: "#7b1fa2",
        warn_btn_color: "#f57c00",
        content_default_color: "#757575",
        content_dark_color: "#546e7a",
        content_warn_color: "#ad1457",
        hint_btn_dark_color: "#a1887f",
        hint_btn_bright_color: "#26a69a",
    },
    checkin: {
        config: {
            auto_unlock_switch: false,
        },
        checkin_items: {
            alipay: {name: "支付宝", package_name: "com.eg.android.AlipayGphone"},
            jd: {name: "京东", package_name: "com.jingdong.app.mall22222"},
            tieba: {name: "百度贴吧", package_name: "com.baidu.tieba"},
            unionpay: {name: "云闪付", package_name: "com.unionpay22222"},
            cmblife: {name: "掌上生活", package_name: "com.cmbchina.ccd.pluto.cmbActivity"}, // depend on WeChat partially
            gbanker: {name: "黄金钱包", package_name: "com.gbanker.gbankerandroid22222"},
            ole: {name: "Olé lifestyle", package_name: "com.crv.ole"},
            youcoffee: {
                name: "友咖啡",
                depend: {
                    name: "微信",
                    package_name: "com.tencent.mm",
                }, // depend on WeChat totally
            },
        },
    }
};