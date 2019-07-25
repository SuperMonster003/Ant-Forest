module.exports = {
    "af": {
        self_collect_switch: true, // i know the trick about the reason you wanna turn this switch off
        // main_user_switch: false, // if you are multi-account user, you may specify a "main account" to switch
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
        timers_insurance_max_continuous_times: 3, // 1 <= x <= 5; "ins" auto timed task will be dysfunctional with to many continuous attempts
        max_retry_times_global: 2, // 0 <= x <= 5; max retry times when the script crushed; set 0 if you do not need to retry even once
        max_running_time_global: 45, // 5 <= x <= 90; max running time for a single script
        max_queue_time_global: 60, // 1 <= x <= 120; max queue time for every exclusive task if exclusive tasks ahead is running or queueing
        min_bomb_interval_global: 300, // 100 <= x <= 800; exclusive tasks with too small intervals will be taken as bomb tasks
        prompt_before_running_switch: true, // set false value if you do not need a countdown dialog before running script
        prompt_before_running_countdown_seconds: 5, // 3 <= x <= 30; countdown seconds before dialog dismissed automatically
        prompt_before_running_postponed_minutes_default_choices: [1, 2, 3, 5, 10, 15, 20, 30], // default choices for a postponed minute
        prompt_before_running_postponed_minutes: 0, // 0 for ask every time, other number like 1, 2, 5 for specific postponed minute
        prompt_before_running_postponed_minutes_user: 3, // record user selected value of postponed settings dialog in countdown dialog
    },
    "unlock": {
        unlock_code: null, // when we first met, i do not know your name, your age, or, your sexual orientation, wow...
        unlock_pattern_size: 3, // side size of a speed-dial-like pattern for unlocking your phone, and 3 is the most common value
        unlock_max_try_times: 20, // max times for trying unlocking your phone
        dismiss_layer_swipe_time: 110, // time for swiping up to dismiss the lock screen layer
        pattern_unlock_swipe_time: 120, // gesture time for pattern unlock each time, and usually won't change with correct unlock code
    },
    "settings": {
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
        dialog_contents: {
            settings_never_launched: // 参数调整提示
                "运行前建议进行一些个性化参数调整\n" +
                "需要现在打开配置页面吗\n" +
                "\n" +
                "点击\"跳过\"将使用默认配置\n" +
                "以后可随时运行此脚本进行参数调整\n" +
                "-> \"Ant_Forest_Settings.js\"",
            restore_all_settings: // 还原初始设置
                "此操作无法撤销\n" +
                "如需保留此次会话内容请先保存\n\n" +
                "以下功能内部配置不会被还原:\n" +
                "1. 自动解锁\n" +
                "2. 黑名单管理\n",
            keep_internal_config: // 保留内部配置
                "包含内部配置的功能\n" +
                "只还原此功能的开闭状态\n" +
                "而不会清空内部保存的数据\n" +
                "如解锁密码/黑名单列表等\n",
            energy_balls_click_interval: // 能量球点击间隔
                "当可点击的能量球数量超过 1 时\n" +
                "此设置值影响能量球之间的点击间隔\n\n" +
                "注意:\n" +
                "此设置值将同时影响以下操作环境:\n" +
                "1. 主页森林能量球\n" +
                "2. 好友森林能量球\n\n" +
                "设置过小值可能遗漏点击能量球\n" +
                "设置过大值将影响快速收取体验",
            max_own_forest_balls_ready_time: // 主页能量球最大准备时间
                "森林主页控件准备完毕后\n" +
                "仍需部分时间等待能量球控件被识别\n\n" +
                "设置过小值可能导致能量球识别遗漏\n" +
                "设置过大值将在主页无能量球时牺牲较多等待时间",
            homepage_monitor_threshold: // 主页能量球循环监测阈值
                "当进入主页存在未成熟能量球\n" +
                "且最小成熟倒计时达到阈值时\n" +
                "将循环监测直到能量球成熟并收取\n" +
                "收取后\n" +
                "若剩余能量球最小倒计时达到阈值\n" +
                "则继续重复循环监测操作\n" +
                "直到没有未成熟能量球\n" +
                "或最小倒计时未达到设定阈值为止",
            homepage_background_monitor_threshold: // 主页能量球返检阈值
                "好友排行榜操作期间\n" +
                "若主页能量最小成熟时间达到阈值\n" +
                "则返回森林主页开始监控能量球\n" +
                "收取完毕后\n" +
                "将继续进入好友排行榜完成操作\n\n" +
                "* 此功能不受\"循环监测\"开关影响\n" +
                "-- 除非\"自收功能\"关闭\n" +
                "* 返检阈值为 1 min 且不可更改",
            friend_collect_icon_color: // 收取图标颜色色值
                "排行榜识别绿色手形图标的参照色值\n\n" +
                "示例:\n" +
                "rgb(67,160,71)\n" +
                "#43a047",
            friend_collect_icon_threshold: // 收取图标颜色检测阈值
                "排行榜识别绿色手形图标的参照色值检测阈值",
            help_collect_icon_color: // 帮收图标颜色色值
                "排行榜识别橙色爱心图标的参照色值\n\n" +
                "示例:\n" +
                "rgb(67,160,71)\n" +
                "#43a047",
            help_collect_icon_threshold: // 帮收图标颜色检测阈值
                "排行榜识别橙色爱心图标的参照色值检测阈值",
            help_collect_balls_color: // 帮收能量球颜色色值
                "好友森林识别橙色能量球的参照色值\n\n" +
                "示例:\n" +
                "rgb(67,160,71)\n" +
                "#43a047",
            help_collect_balls_threshold: // 帮收能量球颜色检测阈值
                "好友森林识别橙色能量球的参照色值检测阈值",
            help_collect_balls_intensity: // 帮收能量球样本采集密度
                "好友森林橙色能量球图片样本采集密度",
            unlock_code: // 设置锁屏解锁密码
                "密码长度不小于 4 位\n" +
                "无密码请留空\n\n" +
                "若采用图案解锁方式\n" +
                "总点阵数大于 9 需使用逗号分隔",
            unlock_code_demo: // 锁屏密码示例
                "滑动即可解锁: (留空)\n\n" +
                "PIN 解锁: 1001\n\n" +
                "密码解锁: 10btv69\n\n" +
                "图案解锁: (点阵序号从 1 开始)\n" +
                "3 × 3 点阵 - 1235789 或 1,2,3,5,7,8,9\n" +
                "4 × 4点阵 - 1,2,3,4,8,12,16\n" +
                "* 点阵密码可简化\n",
            about_pattern_simplification: // 图案解锁密码简化
                "共线的连续线段组只需保留首末两点\n\n" +
                "3 × 3 - 1,2,3,5,7,8,9 -> 1,3,7,9\n" +
                "4 × 4 - 1,2,3,4,8,12,16 -> 1,4,16\n" +
                "5 × 5 - 1,2,3,4,5,6 -> 1,5,6\n",
            dismiss_layer_swipe_time: // 设置锁屏页面上滑时长
                "通常无需自行设置\n" +
                "脚本会自动尝试增量赋值获得最佳值",
            pattern_unlock_swipe_time: // 设置图案解锁滑动时长
                "通常无需自行设置\n" +
                "脚本会自动尝试增量赋值获得最佳值",
            unlock_pattern_size: // 设置图案解锁边长
                "图案解锁通常为 N × N 的点阵\n" +
                "通常边长 N 为 3\n\n" +
                "若未使用图案解锁方式\n" +
                "请保留默认值",
            about_message_showing_function: // 关于消息提示配置
                "控制台消息\n\n" +
                "简略: 只显示最终收取能量总计数据\n" +
                "详细: 显示每个好友收取/帮收数据\n" +
                "开发者测试模式: 详细显示操作信息\n\n" +
                "运行结果展示\n\n" +
                "Floaty: 彩色悬浮窗方式\n" +
                "Toast: 消息浮动框方式\n",
            timers_prefer_auto_unlock: // 定时任务建议开启自动解锁
                "检测到\"自动解锁\"功能未开启\n\n" +
                "多数情况下定时任务启动需配合\n" +
                "\"自动解锁\"功能才能完成\n" +
                "[ 亮屏 - 解锁 - 执行脚本 ]\n" +
                "等一系列操作\n\n" +
                "建议开启并设置\"自动解锁\"功能",
            timers_countdown_check_timed_task_ahead: // 定时任务提前运行
                "此设置值用于将下次定时任务\n" +
                "运行时间提前 n 分钟\n\n" +
                "设置 0 可关闭提前运行",
            timers_ahead_prefer_monitor_own: // 定时任务提前建议开启主页能量球监测
                "主页能量球监测未开启\n\n" +
                "此情况下提前运行脚本\n" +
                "主页能量球可能没有成熟\n" +
                "因此可能无法收取\n\n" +
                "* 开启主页能量球监测可在\n" +
                "-- 能量球成熟前不断检测能量球\n" +
                "-- 进而保证能量球及时收取\n\n" +
                "确定要保留当前设置值吗",
            timers_ahead_prefer_rank_list_threshold_review: // 定时任务提前建议开启排行榜最小倒计时复查条件
                "排行榜样本复查未开启\n" +
                "或最小倒计时阈值复查条件未激活\n\n" +
                "此情况下提前运行脚本\n" +
                "排行榜可能没有可收取目标\n" +
                "因此可能无法按时完成收取\n\n" +
                "* 排行榜样本复查能够在\n" +
                "-- 目标可收取前不断检测倒计时\n" +
                "-- 进而保证目标及时收取\n\n" +
                "确定要保留当前设置值吗",
            timers_insurance_interval: // 保险任务运行间隔
                "设置值用于当保险任务保留时\n" +
                "下次定时任务启动的时间间隔\n\n" +
                "* 保险任务在脚本运行时设置\n" +
                "* 脚本运行中每10秒钟自动重置间隔\n" +
                "* 脚本结束前自动移除所有保险任务",
            timers_insurance_max_continuous_times: // 最大连续保险次数
                "设置值用于当保险任务连续激活\n" +
                "次数超过一定值时\n" +
                "不再继续自动设置保险任务\n" +
                "避免无人值守时的无限定时循环",
            about_timers_self_manage: // 关于定时任务自动管理机制
                "自动管理:\n\n" +
                "脚本根据已设置的机制\n" +
                "自动设置一个定时任务\n" +
                "或自动更新已存在的定时任务\n" +
                "以保证在无人值守条件下\n" +
                "实现定期定时的脚本自启功能\n\n" +
                "机制简介:\n\n" +
                "1. 主页最小倒计时机制\n" +
                "脚本计算出能量成熟最小倒计时\n" +
                "并根据\"定时任务提前运行\"参数\n" +
                "得到一个定时时间\n" +
                "如果排行榜最小倒计时机制开启\n" +
                "将会用同样的方法得到定时时间\n" +
                "取两个定时时间的最小值\n" +
                "作为最终的下次任务运行时间\n\n" +
                "2. 排行榜最小倒计时机制\n" +
                "如上所述\n" +
                "另外若主页没有能量球\n" +
                "而且排行榜也没有倒计时数据\n" +
                "则将无法统计出定时时间\n" +
                "此时将激活\"延时接力机制\"\n\n" +
                "3. 延时接力机制\n" +
                "如上所述\n" +
                "此机制仅在倒计时机制全部关闭" +
                "或倒计时机制未能统计定时时间时被激活\n" +
                "延时接力机制数据格式为:\n" +
                "[ 开始时间, 结束时间, 间隔 ]\n\n" +
                "示例: [ \"06:30\", \"00:00\", 60 ]\n" +
                "a. 现在时刻 14:26\n" +
                "下次运行延时 60 分钟间隔\n" +
                "14:26 + 60 -> 15:26\n" +
                "b. 现在时刻 23:41\n" +
                "下次运行延时至 00:00\n" +
                "c. 现在时刻 02:19\n" +
                "下次运行延时至 06:30\n" +
                "d. 现在时刻 06:11\n" +
                "下次运行延时至 06:30\n\n" +
                "* 延时接力可设置多组数据\n" +
                "-- 最终取所有组数据的最小值\n" +
                "* 脚本将自动处理区间边界数据\n" +
                "-- 设置数据时无需考虑间隔取整\n" +
                "-- 当右边界时间小于左边界时\n" +
                "-- 将视右边界时间为次日时间\n" +
                "-- 如 [ \"19:50\", \"03:00\", 8 ]\n" +
                "* 仅在没有最小倒计时数据时\n" +
                "-- 此机制才有存在意义\n" +
                "-- 若开启了最小倒计时机制\n" +
                "-- 通常无需在能量成熟密集时间\n" +
                "-- 设置延时接力数据\n" +
                "-- 如 [ \"07:00\", \"07:30\", 1 ]\n" +
                "-- 这样的设置是没有必要的\n\n" +
                "4. 意外保险机制\n" +
                "假设\"保险任务运行间隔\"设置值为 5\n" +
                "脚本运行开始后\n" +
                "将自动设置一个 5 分钟定时任务\n" +
                "当脚本异常停止或被终止时\n" +
                "(包括音量键停止了脚本)\n" +
                "则初期设定的保险定时任务\n" +
                "将在 5 分钟后定时执行\n" +
                "确保脚本定时任务的连续性\n\n" +
                "* 无论是最小倒计时机制\n" +
                "-- 还是延时接力机制\n" +
                "-- 均在脚本即将结束之前设定\n" +
                "-- 若在此之前脚本异常终止\n" +
                "-- 则会出现定时任务\"断档\"\n" +
                "-- 这正是此机制存在的主要意义\n" +
                "* 若脚本长时间运行还未正常结束\n" +
                "-- 5 分钟的定时任务将被激活\n" +
                "-- 并在任务列表排队等待执行\n" +
                "-- 此时定时任务依然出现\"断档\"\n" +
                "-- 因此脚本在后台每 10 秒钟\n" +
                "-- 会自动延期保险任务\n" +
                "-- 保证保险任务不会被\"消耗\"\n" +
                "* 保险任务连续执行次数\n" +
                "-- 受到\"最大连续保险次数\"约束\n" +
                "-- 达到此限制时将不再设置保险任务\n" +
                "-- 避免保险任务导致脚本无限循环\n",
            max_retry_times_global: // 脚本运行失败自动重试
                "此设置值用于脚本运行失败时\n" +
                "自动重新运行的最大次数\n\n" +
                "设置 0 可关闭自动重试",
            max_running_time_global: // 脚本单次运行最大时间
                "设置值用于脚本单次运行\n" +
                "可消耗的最大时间\n" +
                "避免无人值守时的无响应情况",
            max_queue_time_global: // 排他性任务最大排队时间
                "当旧排他性任务运行或排队时\n" +
                "新排他性任务将继续排队\n" +
                "排队时间与排他性任务总数相关\n\n" +
                "* 当排队时间达到阈值时将强制结束\n" +
                "-- 当前正在运行的排他性任务\n" +
                "* 设置过小的值可能在脚本\n" +
                "-- 正常结束前被意外终止",
            min_bomb_interval_global: // 脚本炸弹预防阈值
                "若当前脚本与最近一个正在运行的蚂蚁森林脚本的运行时间差小于此阈值\n" +
                "则视当前脚本为炸弹脚本\n" +
                "炸弹脚本将自动强制停止\n" +
                "此安全设置通常针对因某些原因短时间内运行大量相同脚本的意外情况",
            backup_to_local: // 备份项目至本地
                "此功能将项目相关文件打包保存在本地\n" +
                "可在还原页面恢复或删除已存在的备份",
            restore_project_confirm: // 确认还原项目
                "确定还原此版本项目吗\n" +
                "本地项目将被覆盖\n" +
                "此操作无法撤销",
            v1_6_25_restore_confirm: // v1.6.25版本还原提示
                "此版本过于陈旧\n" +
                "不建议还原此版本\n\n" +
                "还原后将丢失以下全部功能:\n" +
                "1. 项目更新功能\n" +
                "2. 项目备份还原功能\n" +
                "3. 解锁模块的高效稳定性\n" +
                "4. 解锁模块的开发者测试模式\n" +
                "5. 重要的工具函数 (共计5项)\n\n" +
                "缺少工具函数将导致项目无法运行",
            rank_list_swipe_time: // 设置排行榜页面滑动时长
                "通常无需自行设置\n" +
                "若出现滑动异常现象\n" +
                "可尝试适当增大此设置值",
            rank_list_swipe_interval: // 设置排行榜页面滑动间隔
                "若出现遗漏目标的情况\n" +
                "可尝试适当增大此设置值",
            about_rank_list_samples_collect_strategy: // 关于采集策略
                "布局分析 (默认)\n\n" +
                "使用布局信息定位好友/获取昵称\n" +
                "可快速确认好友是否名列黑名单\n\n" +
                "优点:\n" +
                "1. 精准快速识别黑名单情况\n" +
                "2. 好友数量较少时滑动列表速度快\n" +
                "缺点:\n" +
                "1. 好友数量多于 200 时卡顿明显\n" +
                "2. 好友数量更多时卡顿愈发严重\n\n" +
                "图像处理\n\n" +
                "使用多点颜色匹配判断图标类型\n" +
                "使用本地以保存的图片匹配好友\n" +
                "进而获取黑名单情况\n" +
                "每页排行榜信息采集均无需控件信息\n\n" +
                "优点:\n" +
                "1. 采集信息时滑动速度不受控件影响\n" +
                "2. 摆脱控件依赖\n" +
                "缺点:\n" +
                "1. 首次确认黑名单情况时必须进入好友森林\n" +
                "2. 确认好友是否名列黑名单精确性低\n" +
                "3. 本地可能需要保存大量图像数据\n" +
                "4. 排行榜底部判断条件受限且可能滞留许久\n\n" +
                "建议:\n" +
                "好友数量大于 200 使用图像处理\n" +
                "排行榜滑动卡顿时使用图像处理\n" +
                "黑名单好友较多时使用图像处理\n" +
                "布局信息获取失效时用图像处理\n" +
                "其他情况使用布局分析\n",
            rank_list_auto_expand_length: // 设置列表自动展开最大值
                "通过持续检测并点击\"查看更多\"按钮\n" +
                "实现列表自动展开\n" +
                "从而节省部分滑动时间\n\n" +
                "当展开的列表项数量达到此最大值时\n" +
                "脚本将停止自动展开列表\n" +
                "避免列表项过多导致的卡顿问题",
            about_rank_list_review: // 关于排行榜样本复查
                "样本复查:\n\n" +
                "排行榜列表到达底部后\n" +
                "由复查条件决定是否重新检查排行榜\n" +
                "进而达到循环监测的目的\n\n" +
                "列表到达底部后\n" +
                "脚本会统计记录列表所有好友数据\n" +
                "包括倒计时数据及对应好友昵称\n\n" +
                "复查条件:\n\n" +
                "1. 列表状态诧异:\n" +
                "比较上一次统计的昵称数据\n" +
                "只要昵称数据不一致\n" +
                "则触发复查条件\n" +
                "脚本将复查列表并重新比较数据\n" +
                "直到最近两次昵称数据完全一致\n\n" +
                "* 因至少需要两组比较数据\n" +
                "-- 所以列表至少会复查一次\n" +
                "* 即便这样会导致额外的操作\n" +
                "-- 此条件依然是循环检测的利器\n" +
                "-- 用户可自行斟酌保留与否\n\n" +
                "2. 样本点击记录:\n" +
                "在一次完整的列表滑动过程中\n" +
                "只要出现了点击行为\n" +
                "则触发复查条件\n\n" +
                "3. 最小倒计时阈值:\n" +
                "统计最小成熟倒计时\n" +
                "如果达到设定阈值\n" +
                "则触发复查条件\n",
            restore_from_local: // 还原本地备份
                "确定还原此备份吗\n" +
                "本地项目将被覆盖\n" +
                "此操作无法撤销",
            restore_original_list_data: // 恢复列表数据
                "要恢复本次会话开始前的列表数据吗\n\n" +
                "此操作不可撤销",
            add_friend_nickname_manually: // 手动添加好友昵称
                "手动添加易出错\n" +
                "且难以键入特殊字符\n" +
                "建议使用列表导入功能",
        },
    },
};