module.exports = {
    af: {
        // project description
        project_desc: '蚂蚁森林',
        // i know the trick about the reason you wanna turn this switch off
        self_collect_switch: true,
        // sometimes alipay will not be launched without Auto.js running in the foreground
        app_launch_springboard: 'OFF',
        // when turned 'ON', a11y svc could be auto-enabled with android.permission.WRITE_SECURE_SETTINGS
        auto_enable_a11y_svc: 'OFF',
        // if you are multi-account user, you may turn this on and specify a 'main account' to switch
        account_switch: false,
        // with this switch on, original logged in account will be logged back before exit
        account_log_back_in_switch: false,
        // with this value, logging back in will not happen in any circumstance
        account_log_back_in_max_continuous_times: 3,
        // stores information of the 'main account' user
        main_account_info: {},
        // 1 <= x <= 200; press time for press(); small value like 1 may be not safe in some situations
        forest_balls_click_duration: 54,
        // 10 <= x <= 2000; as the saying goes, 'Haste makes waste'
        forest_balls_click_interval: 108,
        // set true value if you need continuously check your own energy balls
        homepage_monitor_switch: true,
        // 1 <= x <= 3; continuously check your own energy balls if min countdown is within threshold
        homepage_monitor_threshold: 2,
        // return to homepage and monitor if own energy min countdown is less than some threshold
        homepage_background_monitor_switch: false,
        // 1.0 <= x <= 3.0; value should not bigger than homepage_monitor_threshold
        homepage_bg_monitor_threshold: 1,
        // set falsy to disable homepage water ball check
        homepage_wball_switch: true,
        // just in case of infinite loop check
        homepage_wball_check_limit: 120,
        // max hue value in HSB mode without blue component for water wall identification
        homepage_wball_max_hue_no_blue: 47,
        // seriously? i cannot believe it if you turn this switch off
        friend_collect_switch: true,
        // color for collect icon with a hand pattern
        friend_collect_icon_color: '#1DA06D',
        // 0 <= x <= 66; the smaller, the stricter; max limit tested on Sony G8441
        friend_collect_icon_threshold: 10,
        // set truthy value to get targets by stroll button rather than traverse rank list
        get_targets_by_stroll_btn: false,
        // 1 <= x <= 5; to avoid infinite loop targets detection
        max_continuous_not_targeted_stroll_cycle: 3,
        // 1 <= x <= 8; size limitation for forest balls samples pool
        forest_image_pool_limit: 3,
        // 10 <= x <= 500; interval between two samples when saving into forest balls samples pool
        forest_image_pool_itv: 60,
        // rectangle region for energy balls recognition in forest page
        eballs_recognition_region: [0.1 /* cX */, 0.15 /* cYx */, 0.9 /* cX */, 0.45 /* cYx */],
        // strategies for cv::houghCircles image source (8bit, single-channel and grayscale)
        hough_src_img_strategy: {
            gray: true, // images.grayscale(image)
            adapt_thrd: true, // images.adaptiveThreshold(image, 255, 'GAUSSIAN_C', 'BINARY_INV', 9, 6)
            med_blur: true, // images.medianBlur(image, 9)
            blur: true, // images.blur(image, 9, null, 'REPLICATE')
            blt_fltr: false, // imagesx.bilateralFilter(image, 9, 20, 20, 'REPLICATE')
        },
        // strategies for handling cv::houghCircles results
        hough_results_strategy: {
            anti_ovl: true, // anti overlap: remove redundant balls overlapped
            symmetrical: true, // symmetrical: calculated outer absent ball of one side
            linear_itp: true, // linear interpolate: calculated inner absent ball(s)
        },
        // 0 <= x <= 40; the smaller, the stricter;
        ripe_ball_detect_threshold: 13,
        // color for ripe balls in forest page since Oct 16, 2020 around (old value: '#CEFF5F')
        ripe_ball_detect_color_val: '#DEFF00',
        // 0.06 <= x <= 0.15; minimum distance between two energy balls
        min_balls_distance: 0.09,
        // protect cover identifying color from a certain point in countdown area
        protect_cover_detect_color_val: '#BEF658', // TODO...
        // do not set this value too big in case that green balls will be recognized as protect cover
        protect_cover_detect_threshold: 5, // TODO...
        // set true if you wish your dream's coming true when you are making a sweet dream or snoring
        auto_unlock_switch: false,
        // set false value if you need a clean console or hide what you've done to your friends
        message_showing_switch: true,
        // if false was set, message in console will not be printed, but toast or floaty not included
        console_log_switch: true,
        // show debug logs in console to debug this script or to give developer feedback
        debug_info_switch: false,
        // information will show in floaty way with true or toast way with false
        result_showing_switch: true,
        // result will show in floaty way with 'true value' or toast way with 'false value'
        floaty_result_switch: true,
        // 2 <= x <= 9; countdown seconds before floaty window going dismissed
        floaty_result_countdown_sec: 6,
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
        // 'swipe' may be not helpful sometimes (e.g. some Android 11 devices)
        rank_list_scan_strategy: 'scroll',
        // [0.4, 0.9] for percentage, or integer for pixel distance (like 1260)
        rank_list_swipe_distance: 0.75,
        // 100 <= x <= 1200; duration for swiping up each time
        rank_list_swipe_time: 150,
        // 100 <= x <= 2400; interval between swipes
        rank_list_swipe_interval: 300,
        // 100 <= x <= 2400;
        rank_list_scroll_interval: 240,
        // 50 <= x <= 500; just in case of infinite loop check
        rank_list_max_not_targeted_times: 200,
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
        timers_uninterrupted_check_sections: [{section: ['06:30', '00:00'], interval: 60}],
        // set if you were bothered by auto timed task system; like: [['21:00', '07:45'], ['11:30', '13:30']]
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
        // ant forest timed task will be auto-delayed if battery percentage is lower than specified value
        min_battery_percentage: 20,
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
        // dialog won't prompt with truthy value when running with screen off or device locked
        prompt_before_running_auto_skip: true,
        // confirmation won't prompt with truthy value before quit current running task
        prompt_before_running_quit_confirm: true,
        // default choices for a postponed minute
        prompt_before_running_postponed_minutes_choices: [1, 2, 3, 5, 10, 15, 20, 30, 60],
        // 0 for ask every time, other number like 1, 2, 5 for specific postponed minute
        prompt_before_running_postponed_minutes: 0,
        // record user selected value of postponed settings dialog in countdown dialog
        prompt_before_running_postponed_minutes_user: 3,
        // ant forest timed task will be auto-delayed if current foreground app is in this list
        foreground_app_blacklist: [],
        // some others
        update_ignore_list: [],
        update_auto_check_switch: true,
        update_show_on_af_settings: true,
        update_show_on_e_result: true,
        auto_task_show_on_e_result: true,
        stat_list_show_zero: 1, // hide zero
        stat_list_date_range: 2, // today
        aj_global_log_switch: true,
        aj_global_log_cfg_path: './log/',
        aj_global_log_cfg_file_pattern: '%d{yyyy-MM-dd/}%m%n',
        aj_global_log_cfg_max_backup_size: 7,
        aj_global_log_cfg_max_file_size: 320, // KB
        e_dblclick_switch: false,
        e_rain_switch: false,
        stroll_btn_match_threshold: 10,
        stroll_btn_locate_main_color: '#FF7E00',
        root_access_functions: {force_stop: false, screen_off: true},
    },
    unlock: {
        // when we first met, i do not know your name, your age, or, your sexual orientation, wow...
        unlock_code: null,
        // max times for trying unlocking your phone
        unlock_max_try_times: 20,
        // 'segmental' for faster and more accurate swipe and 'solid' for stable swipe without break
        unlock_pattern_strategy: 'segmental',
        // side size of a speed-dial-like pattern for unlocking your phone, and 3 is the most common value
        unlock_pattern_size: 3,
        // swipe time for pattern unlock each two points; may be auto modified
        unlock_pattern_swipe_time_segmental: 120,
        // swipe time for pattern unlock each time; may be auto modified
        unlock_pattern_swipe_time_solid: 200,
        // also, 'delay' or 'disable' dismiss layer check is optional
        unlock_dismiss_layer_strategy: 'preferred',
        // 0.5 <= x <= 0.95; great value (like 0.95) may cause unexpected object activation
        unlock_dismiss_layer_bottom: 0.7,
        // 0.05 <= x <= 0.3; this value may be not that important
        unlock_dismiss_layer_top: 0.2,
        // time for swiping up to dismiss the lock screen layer; will be auto modified initially
        unlock_dismiss_layer_swipe_time: 110,
    },
    settings: {
        item_area_width: 0.78,
    },
};