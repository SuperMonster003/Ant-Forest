module.exports = {
    af: {
        // i know the trick about the reason you wanna turn this switch off
        self_collect_switch: true,
        // sometimes alipay will not be launched without Auto.js running in the foreground
        app_launch_springboard: "OFF",
        // when turned "ON", a11y svc could be auto-enabled with android.permission.WRITE_SECURE_SETTINGS
        auto_enable_a11y_svc: "OFF",
        // if you are multi-account user, you may turn this on and specify a "main account" to switch
        account_switch: false,
        // if you are multi-account user, you may turn this on and specify a "main account" to switch
        account_log_back_in_switch: false,
        // with this value, switching back will not always happen infinitely
        account_log_back_in_max_continuous_times: 3,
        // stores information of the "main account" user
        main_account_info: {},
        // 200 <= x <= 2000, safe: 500; max check time for ant forest homepage balls being ready
        max_own_forest_balls_ready_time: 800,
        // 10 <= x <= 500; as the saying goes, "Haste makes waste"
        balls_click_interval: 120,
        // set true value if you need continuously check your own energy balls
        homepage_monitor_switch: true,
        // 1 <= x <= 3; continuously check your own energy balls if min countdown is within threshold
        homepage_monitor_threshold: 2,
        // return to homepage and monitor if own energy min countdown is less than some threshold
        homepage_background_monitor_switch: false,
        // so far, only 1 is allowed; you can change it into 0.9 or 1.2, just maybe in the future
        homepage_background_monitor_threshold: 1,
        // 0 <= x <= 300; just in case; set 0 to impose limit
        homepage_water_ball_check_limit: 0,
        // max hue value in HSB mode without blue component for water wall identification
        homepage_water_ball_max_hue_b0: 44,
        // seriously? i cannot believe it if you turn this switch off
        friend_collect_switch: true,
        // color for collect icon with a hand pattern
        friend_collect_icon_color: "#1da06d",
        // 0 <= x <= 66; the smaller, the stricter; max limit tested on Sony G8441
        friend_collect_icon_threshold: 10,
        // set false if you do not wanna give a hand; leave it true if you like "surprise"
        help_collect_switch: true,
        // a valid time section of help collect function; default: the whole day
        help_collect_section: ["00:00", "00:00"],
        // review current friend's forest if help balls have been collected successfully when 6 balls exist
        six_balls_review_switch: true,
        // 1 <= x <= 8; max continuous review times for a certain friend
        six_balls_review_max_continuous_times: 3,
        // color for help icon with a heart pattern
        help_collect_icon_color: "#f99137",
        // 0 <= x <= 66; the smaller, the stricter; max limit tested on Sony G8441
        help_collect_icon_threshold: 10,
        // color for fade-in-and-out help balls in a friend's forest
        help_collect_ball_color: [
            ["#f99137", "#25876f"],
            ["#f9933a", "#17a422"],
        ],
        // 30 ~< x <= 83; the smaller, the stricter; max limit tested on Sony G8441
        help_collect_ball_threshold: 40,
        // 10 <= x <= 20; more samples for image matching, at the cost of time however
        help_collect_ball_intensity: 12,
        // protect cover identifying color from a certain point in countdown area
        protect_cover_ident_color: "#bef658",
        // do not set this value too big in case that green balls will be recognized as protect cover
        protect_cover_ident_threshold: 5,
        // set true if you wish your dream's coming true when you are making a sweet dream or snoring
        auto_unlock_switch: false,
        // set false value if you need a clean console or hide what you've done to your friends
        message_showing_switch: true,
        // if false was set, message in console will not be printed, but toast or floaty not included
        console_log_switch: true,
        // whether to show message details of each friend in console
        console_log_details: true,
        // show debug logs in console to debug this script or to give developer feedback
        debug_info_switch: false,
        // information will show in floaty way with true or toast way with false
        result_showing_switch: true,
        // result will show in floaty way with "true value" or toast way with "false value"
        floaty_result_switch: true,
        // 2 <= x <= 10; countdown seconds before floaty window going dismissed
        floaty_result_countdown: 4,
        // review rank list samples if one or more of conditions met
        rank_list_review_switch: true,
        // rank list review condition: min countdown threshold
        rank_list_review_threshold_switch: true,
        // 1 <= x <= 5; check if rank list min countdown is less than threshold
        rank_list_review_threshold: 1,
        // rank list review condition: samples clicked flag
        rank_list_review_samples_clicked_switch: true,
        // rank list review condition: samples difference between last two samples nickname data
        rank_list_review_difference_switch: true,
        // [0.4, 0.9] for percentage, or integer for pixel distance (like 1260)
        rank_list_swipe_distance: 0.75,
        // 100 <= x <= 800; duration for swiping up each time
        rank_list_swipe_time: 150,
        // 100 <= x <= 800; interval between swipes
        rank_list_swipe_interval: 300,
        // 5 <= x <= 800; to prevent infinity swipe up at rank list page
        rank_list_capt_pool_diff_check_threshold: 20,
        // fantastic function which almost everybody wants it, however, i still need to switch it off initially
        timers_switch: false,
        // set false value if you prefer a manual timer management
        timers_self_manage_switch: true,
        // whether to auto-calc next running timestamp and set a timed task
        timers_countdown_check_own_switch: true,
        // 0 <= x <= 3; if you prefer an earlier timed task before own balls ripe
        timers_countdown_check_own_timed_task_ahead: 2,
        // whether to auto-calc next running timestamp and set a timed task
        timers_countdown_check_friends_switch: true,
        // 0 <= x <= 5; if you prefer an earlier timed task before friends' balls ripe
        timers_countdown_check_friends_timed_task_ahead: 1,
        // whether to set a timed task in the future when there are no other tasks set
        timers_uninterrupted_check_switch: true,
        // 1 <= x <= 600; multi sections available
        timers_uninterrupted_check_sections: [{section: ["06:30", "00:00"], interval: 60}],
        // set if you were bothered by auto timed task system; like: [["21:00", "07:45"], ["11:30", "13:30"]]
        timers_auto_task_sections: [],
        // just in case, as you know; timed task will be set on running and removed when script finished
        timers_insurance_switch: true,
        // 1 <= x <= 10; timed task will be extended every 10 sec to avoid interval's consumption
        timers_insurance_interval: 5,
        // 1 <= x <= 5; auto-insurance task will be dysfunctional with to many continuous attempts
        timers_insurance_max_continuous_times: 3,
        // 5 <= x <= 90; max running time for a single script
        max_running_time_global: 45,
        // 1 <= x <= 120; max queue time for every exclusive task if exclusive tasks ahead is running or queueing
        max_queue_time_global: 60,
        // 100 <= x <= 800; exclusive tasks with too small intervals will be taken as bomb tasks
        min_bomb_interval_global: 300,
        // decide whether to kill alipay app before script ended
        kill_when_done_switch: false,
        // true value for an intelligent check before killing alipay
        kill_when_done_intelligent: true,
        // set true value if you prefer to keep ant forest pages before script ended
        kill_when_done_keep_af_pages: false,
        // when switched on, script will be paused if phone call state is not idle
        phone_call_state_monitor_switch: true,
        // dynamic; will be initialized when script running (often among 0, 1 and 2)
        phone_call_state_idle_value: undefined,
        // set false value if you do not need a countdown dialog before running script
        prompt_before_running_switch: true,
        // 3 <= x <= 30; countdown seconds before dialog dismissed automatically
        prompt_before_running_countdown_seconds: 5,
        // default choices for a postponed minute
        prompt_before_running_postponed_minutes_default_choices: [1, 2, 3, 5, 10, 15, 20, 30],
        // 0 for ask every time, other number like 1, 2, 5 for specific postponed minute
        prompt_before_running_postponed_minutes: 0,
        // record user selected value of postponed settings dialog in countdown dialog
        prompt_before_running_postponed_minutes_user: 3,
        // specify a path for rank list bottom template locating (*.png)
        rank_list_bottom_template_path: files.getSdcardPath() + "/.local/Pics/rank_list_bottom_template.png",
        // ant forest timed task will be auto-delayed for 5 min if current foreground app is in this list
        foreground_app_blacklist: [],
        // some others
        stat_list_show_zero: 1, // hide zero
        stat_list_date_range: 2, // today
    },
    unlock: {
        // when we first met, i do not know your name, your age, or, your sexual orientation, wow...
        unlock_code: null,
        // max times for trying unlocking your phone
        unlock_max_try_times: 20,
        // "segmental" for faster and more accurate swipe and "solid" for stable swipe without break
        unlock_pattern_strategy: "segmental",
        // side size of a speed-dial-like pattern for unlocking your phone, and 3 is the most common value
        unlock_pattern_size: 3,
        // swipe time for pattern unlock each two points; may be auto modified
        unlock_pattern_swipe_time_segmental: 120,
        // swipe time for pattern unlock each time; may be auto modified
        unlock_pattern_swipe_time_solid: 200,
        // 0.5 <= x <= 0.95; great value (like 0.95) may cause unexpected object activation
        unlock_dismiss_layer_bottom: 0.8,
        // 0.05 <= x <= 0.3; this value may be not that important
        unlock_dismiss_layer_top: 0.2,
        // time for swiping up to dismiss the lock screen layer; will be auto modified initially
        unlock_dismiss_layer_swipe_time: 110,
    },
    settings: {
        item_area_width: 0.78,
        subhead_color: "#03a6ef",
        subhead_highlight_color: "#bf360c",
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
};