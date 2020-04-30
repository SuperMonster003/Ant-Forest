module.exports = {
    dialog_contents: {
        settings_never_launched: // 参数调整提示
            "运行前建议进行一些个性化参数调整\n" +
            "需要现在打开配置页面吗\n" +
            "\n" +
            '点击"跳过"将使用默认配置\n' +
            "以后可随时运行此脚本进行参数调整\n" +
            '-> "Ant_Forest_Settings.js"',
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
        about_account_function: // 关于账户功能
            "主账户:\n\n" +
            "执行蚂蚁森林项目时\n" +
            "用户往往希望只针对自己的账户操作\n" +
            "而非他人的账户或小号账户等\n" +
            "尤其是多账号或频繁切换账号的用户\n" +
            "可能出现非预期账户自动执行了脚本\n\n" +
            "此功能可在脚本执行时检测当前账户\n" +
            "若非主账户或未登录任何账户\n" +
            "则将自动切换或登陆主账户\n" +
            "再执行后续操作\n\n" +
            "* 主账户登录需设置账户名\n" +
            "* 账户名必须设置\n" +
            "-- 否则账户功能将自动关闭\n" +
            "* 密码可不做设置\n" +
            "* 无密码时\n" +
            "-- 脚本将在需要时\n" +
            "-- 提示用户手动输入\n\n" +
            "旧账户回切:\n\n" +
            "若脚本运行时账户非主账户A\n" +
            "记当前账户为账户B\n" +
            "脚本切换或登录至A且任务完成后\n" +
            "此功能可自动将账户回切至B\n" +
            "否则将保持主账户A的登录状态\n\n" +
            "关于连续回切:\n" +
            "每次回切将导致计数器累加一次\n" +
            "且将记录回切时的登录账户B\n" +
            "只要新一次运行的账户不是B\n" +
            "无论是主账户A还是另外的账户C\n" +
            "均将导致连续回切计数器清零\n" +
            "当连续回切达到阈值时\n" +
            "自动回切失效且计数器清零",
        before_use_main_account: // 主账户功能使用提示
            "此功能涉及到用户隐私数据\n" +
            "请用户注意账户和密码安全\n" +
            '建议稍后自行点击"帮助"按钮\n' +
            "查看并了解相关信息及注意事项",
        account_info_hint: // 信息录入提示
            "信息录入方式:\n\n" +
            "A. 支付宝录入\n" +
            "自动打开支付宝应用\n" +
            "获取当前登录的账户名\n" +
            "获取成功后自动填入当前页面\n" +
            "B. 账户库录入\n" +
            "账户库功能暂未开发\n" +
            "C. 手动录入\n" +
            "1. 全部留空\n" +
            "将跳过信息录入\n" +
            "或清除已存储的录入数据\n" +
            "2. 密码留空 只填写账户\n" +
            "脚本将在需要账户密码的时候\n" +
            "通过震动提示用户手动输入密码\n" +
            "60秒内输入完成脚本将自动继续\n" +
            "否则脚本终止\n" +
            "3. 全部填写\n" +
            "脚本将自动完成主账户的切换\n" +
            "或自动登录操作\n\n" +
            "注意:\n\n" +
            "1. 密码非必填项\n" +
            "且因安全等原因不建议填入\n" +
            "关于密码存储方式相关内容\n" +
            '可点击"密码存储方式"按钮查看\n' +
            "2. 自动切换或登录在遇到问题时\n" +
            "脚本将自动终止\n" +
            "包括但不限于密码错误\/网络不稳定\/" +
            "账号录入错误或不存在\/账号状态异常\/" +
            "其他特殊情况\n" +
            "3. 当密码已录入时\n" +
            "密码输入框留空或不做修改\n" +
            "均会保持原密码不变\n" +
            "输入新内容可覆盖旧密码\n" +
            "如若删除本地已存储的密码\n" +
            '可将"账户"内容删除留空\n' +
            '或使用"信息销毁"功能',
        how_password_stores: // 密码存储方式
            "用户输入的密码数据\n" +
            '使用"MODULE_PWMAP"模块进行加密\n' +
            "然后存储在本地相应文件中\n\n" +
            "* 加密的原理是随机字符映射\n" +
            "-- 因此难以避免别有用心之人\n" +
            "-- 对本地数据进行解密\n" +
            "-- 或插入劫持代码语句等\n" +
            "-- 因此需要用户妥善保管设备\n" +
            "-- 避免遗失或随意借予他人\n" +
            "* 解密过程与加密过程类似\n" +
            "-- 依然是多次随机字符映射",
        destroy_main_account_info: // 主账户信息销毁
            "此操作将从本地存储中\n" +
            "移除已记录的主账户信息\n" +
            "包括账户和密码\n\n" +
            "确定要销毁主账户信息吗",
        get_account_name_from_alipay: // 从支付宝录入信息
            "可从支付宝应用获取当前账户名\n" +
            '并自动填入本页"账户"输入框\n\n' +
            "若出现当前未登录任何账户\n" +
            "或脚本运行错误等其他意外情况\n" +
            "将可能导致获取账户名失败\n\n" +
            '点击"开始获取"按钮开始操作',
        login_password_needed: // 需要密码
            "请在支付宝密码输入框中\n" +
            "手动填写密码\n" +
            '然后点击"登录"按钮\n' +
            "登陆成功后脚本将自动继续运行\n\n" +
            "脚本不会记录或存储密码\n" +
            "如有疑问或疑虑\n" +
            "可按音量键强制停止脚本\n" +
            "成功登陆后再重新运行脚本",
        account_log_back_in_max_continuous_times: // 最大连续回切次数
            "计数器达最大次数时将不再回切\n" +
            "且计数器将自动清零\n\n" +
            "* 设置 0 值可不限制回切次数\n" +
            '* 详细情况参阅"帮助与支持"\n' +
            '-- 位于"账户功能"主页',
        about_blacklist: // 关于黑名单管理
            "能量罩黑名单:\n\n" +
            "仅用作显示与查看\n" +
            "当检测到好友能量罩时\n" +
            "脚本自动添加好友到此名单中\n" +
            "获取并计算能量罩到期时间\n" +
            "能量罩到期后好友将自动移除\n\n" +
            "收取/帮收黑名单:\n\n" +
            "用户可自行管理此名单\n" +
            "位于此名单中的好友\n" +
            "脚本将跳过此人的能量球检查\n" +
            "可指定自动解除时间\n\n" +
            "前置应用黑名单:\n\n" +
            "项目自动运行时\n" +
            "如果检测到当前应用在此名单中\n" +
            "例如名单里有数独游戏\n" +
            "而此时用户正在运行此游戏\n" +
            "则脚本将放弃执行定时任务\n" +
            "将任务推迟数分钟再执行\n" +
            "推迟分钟按以下方案逐次增量\n" +
            "[ 1, 1, 2, 3, 5, 8, 10 ]\n" +
            "达到 10 后将一直保持 10 分钟",
        balls_click_interval: // 能量球点击间隔
            "当可点击的能量球数量超过 1 时\n" +
            "此设置值影响能量球之间的点击间隔\n\n" +
            "注意:\n" +
            "此设置值将同时影响以下操作环境:\n" +
            "1. 主页森林能量球\n" +
            "2. 好友森林能量球\n\n" +
            "设置过小值可能遗漏点击能量球\n" +
            "设置过大值将影响快速收取体验",
        max_own_forest_balls_ready_time: // 主页控件最大准备时间
            "森林主页控件准备完毕后\n" +
            "仍需部分时间等待能量球控件被识别\n\n" +
            "设置过小值可能导致能量球识别遗漏\n" +
            "设置过大值将在主页无能量球时牺牲较多等待时间",
        homepage_water_ball_check_limit: // 金色球最大连续检查次数
            "限制连续检查金色球的次数\n" +
            "避免未来一定概率可能出现的\n" +
            "错误识别金色球位置\n" +
            "并无限进行无效点击的问题\n\n" +
            "设置 0 值表示不作限制",
        homepage_water_ball_max_hue_b0: // 金色球最大色相值 (无蓝分量)
            "用以判断能量球是否为浇水能量球\n" +
            "即金色能量球\n" +
            "判断及计算方法:\n" +
            "控件中心横向 40% 线性扫描\n" +
            "每 2 像素判断色值\n" +
            "色值转换为 RGB 色值\n" +
            "计算 120 - (R / G) × 60\n" +
            "得到无蓝分量的色值 (Hue)\n" +
            "Hue 在所有像素值中存在极大值\n" +
            "统计出可同时适配白天及黑夜场景\n" +
            "且数值出现概率合适的极大值\n" +
            "将此值作为参数值即可实现匹配",
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
            '* 此功能不受"循环监测"开关影响\n' +
            '-- 除非"自收功能"关闭\n' +
            "* 返检阈值为 1 min 且不可更改",
        friend_collect_icon_color: // 收取图标颜色色值
            "排行榜识别绿色手形图标的参照色值\n\n" +
            "示例:\n" +
            "rgb(67,160,71)\n" +
            "#aeb0b3",
        friend_collect_icon_threshold: // 收取图标颜色检测阈值
            "排行榜识别绿色手形图标的\n" +
            "参照色值检测阈值\n" +
            "阈值越大 匹配越宽松 反之越严格\n" +
            "0 表示完全相似",
        help_collect_icon_color: // 帮收图标颜色色值
            "排行榜识别橙色爱心图标的参照色值\n\n" +
            "示例:\n" +
            "rgb(67,160,71)\n" +
            "#43a047",
        help_collect_icon_threshold: // 帮收图标颜色检测阈值
            "排行榜识别橙色爱心图标的\n" +
            "参照色值检测阈值\n" +
            "阈值越大 匹配越宽松 反之越严格\n" +
            "0 表示完全相似",
        help_collect_ball_color: // 帮收能量球颜色色值
            "好友森林识别橙色能量球的参照色值\n\n" +
            "示例:\n" +
            "rgb(67,160,71)\n" +
            "#43a047",
        help_collect_ball_threshold: // 帮收能量球颜色检测阈值
            "好友森林识别橙色能量球的\n" +
            "参照色值检测阈值\n" +
            "阈值越大 匹配越宽松 反之越严格",
        help_collect_ball_intensity: // 帮收能量球样本采集密度
            "好友森林橙色能量球图片样本采集密度\n" +
            "密度值间接体现采集样本的时间长度\n" +
            "公式如下:\n" +
            "t = ρ × 160 - 920 (ms)\n" +
            "密度越大 采集时间越长 匹配度可能更佳\n" +
            "反之可能降低匹配度 但会相应提升效率",
        unlock_code: // 设置锁屏解锁密码
            "密码长度不小于 3 位\n" +
            "无密码请留空\n\n" +
            "若采用图案解锁方式\n" +
            "总点阵数大于 9 需使用逗号分隔\n" +
            "图案解锁密码将自动简化\n" +
            '详情点击"查看示例"',
        unlock_code_demo: // 锁屏密码示例
            "滑动即可解锁: (留空)\n\n" +
            "PIN 解锁: 1001\n\n" +
            "密码解锁: 10btv69\n\n" +
            "图案解锁: (点阵序号从 1 开始)\n" +
            "3 × 3 点阵 - 1235789 或 1,2,3,5,7,8,9\n" +
            "4 × 4 点阵 - 1,2,3,4,8,12,16\n" +
            "* 点阵密码将自动简化",
        about_pattern_simplification: // 图案解锁密码简化
            "简化原理:\n" +
            "共线的连续线段组只需保留首末两点\n" +
            "途径点将自动激活\n\n" +
            "3 × 3 - 1,2,3,5,7,8,9 -> 1,3,7,9\n" +
            "4 × 4 - 1,2,3,4,8,12,16 -> 1,4,16\n" +
            "5 × 5 - 1,2,3,4,5,6 -> 1,5,6\n\n" +
            "因此以下一组设置对于图案解锁\n" +
            "可视为相同设置 (3 × 3 点阵):\n" +
            "1,2,3,6,9\n" +
            "1,1,2,2,3,3,3,6,9,9\n" +
            "1,3,9",
        unlock_code_safe_confirm: // 自动解锁风险提示
            "设备遗失或被盗时 自动解锁功能将" +
            "严重降低设备的安全性 " +
            "甚至导致隐私泄露或财产损失 请谨慎使用\n\n" +
            "如欲了解设备遗失对策\n" +
            '请点击"了解详情"\n\n' +
            "确定要继续吗",
        about_lost_device_solution: // 关于设备遗失对策
            "一旦设备遗失或被盗\n" +
            "可通过以下方式\n" +
            "将可能的损失降到最低\n\n" +
            '* 利用"查找我的设备"功能\n\n' +
            "如若遗失安卓手机/平板电脑/手表等\n" +
            "可以寻找/锁定/清空该设备\n" +
            "详情参阅:\n" +
            "https://support.google.com/accounts/answer/6160491?hl=zh-Hans\n\n" +
            "* 及时挂失/冻结卡号/账号\n\n" +
            "优先冻结与财产安全相关的账号\n" +
            "或及时修改登录密码或支付密码\n" +
            "如 微博/微信/支付宝 以及 QQ 等\n" +
            "详情参阅:\n" +
            "https://www.zhihu.com/question/20206696",
        unlock_dismiss_layer_swipe_time: // 提示层页面上滑时长
            "设置整百值可保证匀速滑动\n" +
            "十位小于5可实现不同程度惯性滑动\n\n" +
            "* 通常无需自行设置\n" +
            "* 脚本会自动尝试增量赋值\n" +
            "-- 以获得最佳值",
        unlock_dismiss_layer_bottom: // 提示层页面起点位置
            "设置滑动起点的屏高百分比\n\n" +
            "* 通常无需自行设置\n" +
            "* 设置过大值可能激活非预期控件",
        unlock_dismiss_layer_top: // 提示层页面终点位置
            "设置滑动终点的屏高百分比\n\n" +
            "* 通常无需自行设置\n" +
            "* 此配置值对滑动影响程度较小",
        about_unlock_pattern_strategy: // 关于图案解锁滑动策略
            "叠加路径:\n\n" +
            "采用 gestures() 方法\n" +
            "将每两个点组成直线路径\n" +
            "所有路径利用微小时间差拼接\n" +
            "最终组合形成完整路径\n" +
            "优点:\n" +
            "1. 可实现超高速滑动\n" +
            "2. 滑动拐点定位精确\n" +
            "缺点:\n" +
            "1. 滑动路径可能会断开\n" +
            "2. 滑动总时长=(拐点数+1)×给定参数\n\n" +
            "连续路径:\n\n" +
            "采用 gesture() 方法\n" +
            "将所有坐标作为参数传入\n" +
            "完成一次性不间断滑动\n" +
            "优点:\n" +
            "1. 滑动路径不会断开\n" +
            "2. 滑动总时长=给定参数\n" +
            "缺点:\n" +
            "1. 极易发生拐点偏移现象\n" +
            "2. 拐点数及分布极大影响成功率\n\n" +
            '* 不同策略对应不同"滑动时长"参数\n' +
            '* 推荐优先使用"叠加路径"策略\n' +
            "-- 当出现路径断开现象时\n" +
            '-- 可尝试"连续路径"策略',
        unlock_pattern_swipe_time_segmental: // 设置图案解锁滑动时长 - 叠加路径策略
            "此参数表示两拐点间滑动时长\n" +
            "并非表示滑动总时间\n" +
            "总时间=(拐点数+1)×此参数\n" +
            '如"1379"包含两个拐点\n' +
            "参数给定为120ms\n" +
            "则总时长=(2+1)×120ms\n" +
            "即360ms\n" +
            '如"12369"有一个拐点\n' +
            "因此结果为240ms\n\n" +
            "* 通常无需自行设置\n" +
            "-- 脚本会自动尝试增量赋值\n" +
            "-- 以获得最佳值",
        unlock_pattern_swipe_time_solid: // 设置图案解锁滑动时长 - 连续路径策略
            "此参数表示首末点间滑动时长\n" +
            "亦即表示滑动总时间\n\n" +
            "* 通常无需自行设置\n" +
            "-- 脚本会自动尝试增量赋值\n" +
            "-- 以获得最佳值",
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
            "Toast: 消息浮动框方式\n\n" +
            "* Floaty方式会伴随全屏遮罩层\n" +
            "-- 点击遮罩层可立即结束结果展示",
        timers_prefer_auto_unlock: // 定时任务建议开启自动解锁
            '检测到"自动解锁"功能未开启\n\n' +
            "多数情况下定时任务启动需配合\n" +
            '"自动解锁"功能才能完成\n' +
            "[ 亮屏 - 解锁 - 执行脚本 ]\n" +
            "等一系列操作\n\n" +
            '建议开启并设置"自动解锁"功能',
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
            '并根据"定时任务提前运行"参数\n' +
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
            '此时将激活"延时接力机制"\n\n' +
            "3. 延时接力机制\n" +
            "如上所述\n" +
            "此机制仅在倒计时机制全部关闭" +
            "或倒计时机制未能统计定时时间时被激活\n" +
            "延时接力机制数据格式为:\n" +
            "[ 开始时间, 结束时间, 间隔 ]\n\n" +
            '示例: [ "06:30", "00:00", 60 ]\n' +
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
            '-- 如 [ "19:50", "03:00", 8 ]\n' +
            "* 仅在没有最小倒计时数据时\n" +
            "-- 此机制才有存在意义\n" +
            "-- 若开启了最小倒计时机制\n" +
            "-- 通常无需在能量成熟密集时间\n" +
            "-- 设置延时接力数据\n" +
            '-- 如 [ "07:00", "07:30", 1 ]\n' +
            "-- 这样的设置是没有必要的\n\n" +
            "4. 意外保险机制\n" +
            '假设"保险任务运行间隔"设置值为 5\n' +
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
            '-- 则会出现定时任务"断档"\n' +
            "-- 这正是此机制存在的主要意义\n" +
            "* 若脚本长时间运行还未正常结束\n" +
            "-- 5 分钟的定时任务将被激活\n" +
            "-- 并在任务列表排队等待执行\n" +
            '-- 此时定时任务依然出现"断档"\n' +
            "-- 因此脚本在后台每 10 秒钟\n" +
            "-- 会自动延期保险任务\n" +
            '-- 保证保险任务不会被"消耗"\n' +
            "* 保险任务连续执行次数\n" +
            '-- 受到"最大连续保险次数"约束\n' +
            "-- 达到此限制时将不再设置保险任务\n" +
            "-- 避免保险任务导致脚本无限循环\n\n" +
            "有效时段:\n\n" +
            "可使项目在自动设置定时任务时\n" +
            "仅会落在设置的有效时段内\n" +
            "避免在某些时间对用户的干扰\n" +
            "如设置时段 [ 09:00, 14:00 ]\n" +
            "则脚本运行结束前设置定时任务时\n" +
            "不会超出这个范围\n" +
            "举三种情况的例子\n" +
            "分别表示不同的定时任务运行时间\n" +
            "1. 09:30\n" +
            "正常制定任务\n" +
            "因为 09:30 落在时段范围内\n" +
            "2. 15:20\n" +
            "制定第二天 09:00 的任务\n" +
            "3. 07:10\n" +
            "制定当天 09:00 的任务\n" +
            "如果时段结束值大于等于起始值\n" +
            "同延时接力机制一样\n" +
            "则将结束值视为第二天的时间点\n" +
            "例如设置 [ 21:00, 07:45 ]\n" +
            "则表示晚 9 点到次日 07:45\n" +
            "晚 23 点和早 6 点都在范围内\n" +
            "而上午 11 点则不在上述范围\n" +
            "注意区分 [ 07:45, 21:00 ]\n" +
            "如有多个时段将做并集处理\n" +
            "如果设置了一个 24 小时区间\n" +
            "则时段管理将失去意义\n" +
            "如 [ 05:23, 05:23 ]\n" +
            "等同于\"全天有效\"的效果",
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
        about_kill_when_done: // 关于支付宝应用保留
            "此设置用于决定脚本结束时\n" +
            "保留或关闭支付宝应用\n\n" +
            "关闭总开关后将在脚本结束时\n" +
            "无条件关闭支付宝应用\n\n" +
            "支付宝应用保留:\n" +
            "智能保留:\n" +
            "脚本运行时检测当前前置应用\n" +
            "根据前置应用是否是支付宝\n" +
            "决定保留或关闭操作\n" +
            "总是保留:\n" +
            "无条件保留支付宝应用\n\n" +
            "蚂蚁森林页面保留:\n" +
            "智能剔除:\n" +
            "脚本将自动关闭与蚂蚁森林项目相关的全部页面\n" +
            "如蚂蚁森林主页/排行榜页面等\n" +
            "最终回归到脚本启动前的支付宝页面\n" +
            "全部保留:\n" +
            "无条件保留项目运行中的所有页面\n" +
            "除非支付宝应用被触发关闭\n\n" +
            "* 关闭应用优先使用杀死应用方式\n" +
            "-- 杀死应用需要 Root 权限\n" +
            "-- 无 Root 权限将尝试最小化应用\n" +
            "-- 最小化原理并非模拟 Home 键\n" +
            '* "智能保留"的智能化程度十分有限',
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
        rank_list_capt_pool_diff_check_threshold: // 排行榜截图样本池差异检测阈值
            "排行榜滑动前后截图样本相同时\n" +
            "脚本认为滑动无效 并进行无效次数统计 " +
            "当连续无效次数达到阈值时 将放弃滑动并结束好友能量检查\n\n" +
            '达阈值时 脚本会判断"服务器打瞌睡"页面及"正在加载"按钮 ' +
            '根据实际情况点击"再试一次"或等待"正在加载"按钮消失 (最大等待2分钟)\n\n' +
            "* 此设置主要避免因意外情况导致当前页面不在排行榜页面时的无限滑动\n" +
            "* 截图样本相同指: 相似度极高",
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
            "只要出现了有效点击行为\n" +
            "则触发复查条件\n\n" +
            "3. 最小倒计时阈值:\n" +
            "统计最小成熟倒计时\n" +
            "如果达到设定阈值\n" +
            "则触发复查条件\n\n" +
            "* 有效点击指进入好友森林后\n" +
            "-- 点击过橙色或成熟能量球",
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
        phone_call_state_idle_value: // 通话空闲状态值
            "当设备当前通话状态值\n" +
            "与空闲状态值不一致时\n" +
            "将触发通话状态事件\n" +
            "脚本将持续等待\n" +
            "直到通话状态变为空闲\n\n" +
            "* 事件解除后\n" +
            "-- 脚本将执行一次支付宝前置操作\n" +
            "* 不同设备的通话空闲状态值\n" +
            "-- 可能存在差异",
        phone_call_state_idle_value_warn: // 通话空闲状态值设置警告
            "输入值与当前通话空闲值不一致\n" +
            "此配置将导致脚本无法正常运行\n\n" +
            "确定要使用当前输入值吗",
        rank_list_bottom_template_hint_base: // 排行榜底部控件图片模板基础提示
            '排行榜"没有更多了"控件的图片模板\n' +
            "此模板用于排行榜底部判断\n\n",
        rank_list_bottom_template_hint_exists: // 排行榜底部控件图片模板存在附加提示
            '正常模板应包含"没有更多了"字样\n' +
            "查看模板后若发现图片模板存在异常\n" +
            "可选择删除模板\n" +
            "模板删除后\n" +
            "脚本在下次运行时将自动生成新模板",
        rank_list_bottom_template_hint_not_exists: // 排行榜底部控件图片模板不存在附加提示
            "当前暂未生成图片模板\n" +
            "脚本在下次运行时将自动生成新模板",
        about_auto_enable_a11y_svc: // 关于自动开启无障碍服务
            "通过修改系统无障碍服务的列表参数\n" +
            "实现Auto.js无障碍服务的自动开启\n" +
            "此过程需要授予Auto.js以下权限:\n\n" +
            "WRITE_SECURE_SETTINGS\n\n" +
            "如果设备已经获取Root权限\n" +
            "脚本会自动自我授权\n" +
            "否则需要将手机连接到计算机\n" +
            "然后在计算机使用ADB工具\n" +
            "执行以下指令(无换行):\n\n" +
            "adb shell pm grant org.autojs.autojs " +
            "android.permission.WRITE_SECURE_SETTINGS\n\n" +
            "执行后Auto.js将获取上述权限\n" +
            "如需撤销授权需将上述指令的\n" +
            "grant替换为revoke\n\n" +
            "注: 如果没有权限授权\n" +
            "脚本则会在需要的时候\n" +
            "提示用户手动开启无障碍服务",
        about_app_launch_springboard: // 关于启动跳板
            "某些设备或应用无法直接调用 APP\n" +
            "如 launch() 或 startActivity() 等\n" +
            "需先调用 Auto.js 再调用指定 APP\n" +
            "当脚本运行结束时\n" +
            "可自动关闭调用过的 Auto.js 页面\n" +
            "以实现跳板的无痕特性\n\n" +
            "* 无痕特性以跳板页面暴露为前提",
        about_six_balls_review: // 关于六球复查
            "复查需满足以下全部条件:\n" +
            "1. 进入好友森林时有 6 个能量球\n" +
            "2. 能量球中包含橙色帮收能量球\n" +
            "3. 帮收功能开启\n\n" +
            "帮收完成后再次进入此好友森林\n" +
            "则有可能出现新的可操作能量球\n" +
            "此功能的意义便在于此\n\n" +
            "* 若开启了排行榜样本复查\n" +
            "-- 则复查时亦可间接实现此功能\n" +
            "-- 只不过需要牺牲部分复查时间",
        six_balls_review_max_continuous_times: // 六球最大连续复查次数
            "限制同一个好友连续六球复查次数\n" +
            "仅用于防止可能出现的意外情况\n\n" +
            "* 此设置值通常无需修改",
        about_timed_task_type: // 关于定时任务类型设置
            "一次性任务执行后将自动失效\n" +
            "每日/每周任务将按日/按周循环执行\n\n" +
            "注意:\n" +
            "1. 定时任务自动管理功能往往可以\n" +
            "-- 完成绝大多数定时任务需求\n" +
            "-- 因此不建议设置过多或\n" +
            "-- 过于繁杂的手动定时任务\n" +
            "2. 也可以使用 Auto.js 自带的\n" +
            "-- 定时任务管理功能\n" +
            "-- 但涉及月份设置或修改时很可能\n" +
            "-- 会出现 1 个月的偏差问题",
        delete_min_countdown_task_warn: // 最小倒计时任务删除警告
            "正在删除最小倒计时任务\n\n" +
            "最小倒计时任务是\n" +
            "定时任务自动管理功能的精髓\n" +
            "除非已确定此任务的异常性\n" +
            "否则强烈不建议删除此任务\n\n" +
            "确定要删除最小倒计时任务吗",
    },
    image_base64_data: {
        ic_outlook: _icOutlook(),
        ic_qq: _icQq(),
        ic_github: _icGithub(),
        ic_fetch: _icFetch(),
        ic_oball: _icOball(),
        ic_ripe_ball: _icRipeBall(),
        avt_detective: _avtDetective(),
        qr_alipay_dnt: _qrAlipayDnt(),
        qr_wechat_dnt: _qrWechatDnt(),
    },
};

// base64 function(s) //

function _icOutlook() {
    return "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";
}

function _icQq() {
    return "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";
}

function _icGithub() {
    return "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";
}

function _icFetch() {
    return "iVBORw0KGgoAAAANSUhEUgAAAB8AAAAVCAYAAAC+NTVfAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYYAAB2GAV2iE4EAAAP7SURBVEhLrZZLbBtFGMf/6/UjtuNXHT/qPFQnoQ2IIgoigLhwohx5XLiiigsSEvdWlS/cgAOFA+oFKtFLJS4pCFVQASq0gaI0cerETRzHceLYaeza8SOx17tmvmHtxPaGtGl/kuXZmdn5vvmeK5y++HHjGXc/zr7xAdxWB7Qo17bx92oEJ32jrT11RcbkShhjnmBrLry+gIDdy8efXLuISHYNUYMMmc90I+rfGQ8JpTKWskk8338CFmOPurSLUTTAY3Vhaj0Kl9mOHr0ROkEHt8WB2cwiE+j579nqxFohg0GXH8fcAYSTc5CrNeTFhnpSO6Ll7fHQlq4BuVDAwkYcT/uHYe+xqsu7kAIkeDa9CG/vEeh1Ip8TmdBkPg2fzc0VcJptKFYr6Hd4UaiUEEstYdMAaIkXHW+9HJIEgBRQtoqIZpbwbGBUUwG6sUlnwOJmEl7bES6M9pELyGL0TL9sOc+fAw4PbiWmUaxLKAvd4nXqPyps8R7zz+JmCp9dv8QOKKgr7fjsbhy196GwXVJnwM0dYwqREgTdmixDe0/4jsGxj9Nbwom9Cnx940rrsE7o8J16tbVOFtGLes3948HnYFcAS4OZt4M24QQpsGxQcDtxFxMzv6qz3axvbeLOWlR9AkbcA1yJTihDXL122BpdoqALSjocl0TQ/4Aswsk2FQUFaT3w/cwviGVX1a3tPOUZgknPIukAKA33M7145sP3Q6f8Iwgy/9ggwFypwlVTUCcr1WXkSjm8NnyKB9Je6JYU4Q9DcaeMqfjdrqgXGgx1zIvJaj6DqeQ8bi5PI5lNQ1IUnD19Bq8w3x2WRC6Fc1e/xLRSQZ5ZtUmb8L2QIpPLYVyb/5MVnzG89+Kb6sqjQ4F47uoF3NxYRpzFUxNBkusNSov/g14+aM9BXJqcwJWpnzFrZgVNnRMNrwZCVpOFF4T96PT3YegxmvBXIgyDJPNyS+YWja+Phv6JzWDh/gqcVttDB9Gj0scKkc/hRjwdh7EqIccUEGvvvhQqsdKay9/HncQssqU8Rr1Dmjn7uAw5/RjuG0CE1QcqudyeFIHU+ublbUxE/sD5H77CrfgMf+FJYzGa1ZHaWGhAPqDiTw2mWiljjmlHVhjzB3n3ehKsFTbwOesb8WIWSb28K7wJdbgs88cOi/BUJok51kKpP5PPHgfK9U+vf4t4LoMYS7cak9MlvEnTCjvFLf5RYGK3H2BKHCbloiy/v/jtMqIP0lww9Q9iX+EEWYGisiHVsbByD9MpFijbZdjNvZr9XguKnQu/X+ampriiGzcRBr/5SLPCdUIt8agiwsYqhIel5Ih7EC8MjuFk/3HeYrX4KXID393+EeusWsa6vuWAfwG2sLBBZNIRMQAAAABJRU5ErkJggg==";
}

function _icOball() {
    // return "iVBORw0KGgoAAAANSUhEUgAAAB4AAAANCAYAAAC+ct6XAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAHYYAAB2GAV2iE4EAAAHsSURBVDhPlZQ9SBxBGIbfmT2vMCJyV8gVCrnkChELI2gTQRObqyImpWkCdiFIChuvuEIbKwXtJCDaWCimic2ZICjkCg0Y0qjxhxRJQOUgghy7O5P9ZmfvZ13P2weWnW+G+Z75Z+bSKykKvxBJT4OnnuM+7P0V2Dvz4IlOFYvfP2A8fQvjyaiKayGOtmBtToK3tAHFuT5pH+ZkGKyDNUn96KNyGMhF/Zj5aVJG0lN6TC40MnH8BfLyJ1j8ESJDL4GGbt3qYn9fV3+ja0T9S5jfYOXWSn3548FbK2ltZsDEvz+SNbXqKrdSHOV0VMa/nDQ4f0JvG/zw1JCzleXJyeu/4JVSNdMAKUEJKTERRkpQTurjQU6uywpa3lpQYmt3IZTUw5+7SlwPYm+5NHOiHmkQ1eLmhC6U4T2vEX33FQ1vPoLFHqo6b9lDSX25GR1xXVabbn54oSMXknpQu7UxDnl1qmvqRw284jxx/6bTQ1KFcz08VPvwbGnm9UI5/YeY2/lFHbrQwTEGJ3TkeFdn1Ew9wsqDXkRyGpmBB1lpFcHbe3W1I2/tUInF8WfgpgB5ngdP9oNFm1Q7/SnG9YWz7CeqLoggKd0KebINI/t+LCsOnJfGJ2fxJNAYgzzbvVueeuaIzwLld0npVhgdafwHjN9RMXzRZ5sAAAAASUVORK5CYII=";
    return "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";
}

function _icRipeBall() {
    return "iVBORw0KGgoAAAANSUhEUgAAADwAAAAQCAYAAABKkhw/AAAAA3NCSVQICAjb4U/gAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYYAAB2GAV2iE4EAAAScSURBVFhHzZfNdiQ1DIXl6u78zhDghFmQw8xhxYI1T8IDs4AFrwDsgFkAZ5gZ8kOS7rK5n265qwILFhwgctxly7KsK8mqSvl693krUQIqZYihHERrYwzDSpwhar3XgvhqpcB7fFTbVr/GAIFDIGKsd9HUoLEi02IAHAOotaqF2wTYpKBqAyBTFUoeIc1g6cIhOwG6E44O1vgAe6A+TR9SS7DDcJBj1mvd5fixEFbJSo0ITlpovuxsiu6SbHuJw/KuI1zVvdkEj8jWSvTlOSkYSokx5VDW+/9Isgk7sbtnoC16aBdZi1PW8U4clRdTSqsb9LSFsbowJnEnWOeuV90FxvT/nrAQoFW/dC4eJLDw1G1XxwGvJdgTgV3HmSRzm7xAGixSAWEuem27BIzUoGeOtYbsn1Pn3yVZKTBN9iRY2VASqO13kOZrl1zJrOJpHJeP4iieZQB1h3t0eVpZ35TbtDZSqRln00HszO75pD6fc/8ntDTamZdOTuJNochOQYB6RnbCFsSH9jQO20Ucxnk02ctdVkqTFppoQ43dHnRXBlmh0kUb7FUf3vn7dXTkPE3ct5Tdj7uRHcBDHjKpg5a6KEKeW2Z2AOO0V08TfPUE+0SRvYij4XzKSlVzgVaEac57hFFAsbJnu1EmXgH03CNZacg+mZK/+RS7G5R6cSD6srMXAEvePO7ymuS8lLV1wkUGWzXtjvAaZL0KZWzi/TgdngvwucKzEp+1Ftv6lnAZnDdysBUvCxmtk40jmgKeMtxxgOeqOmj5QyfyHDaPvUxWkZIeL5uEsifoJKRwtsH5bLJwsTttks620avnWRaoQ4EG+iShN8xNXI/fkdICle+u+QDfZzyOMns+ty1k6BycjlFG2BDk3DtheMl7J6xyTBqmZr4/ZvqXHqRSmU+fJSkVzhyr23ELoLQKP1SBKU4XcRLPBfOpZNCtBe3b1TdxNX4Tv9cffIdTQSpUT892pb7TBj+BVvOaiZFT3XeJ7gzhMLplbCy6OcOFMJ0jGbcJYEaPs3okp2zKdRPSXXdR/T2IDwT0hUYXgnksCRyIrm3ctV/jcvxWYL+XVhUtIjRH0pHu3vV4AsG36F7Ohj8k4kQEF3u68ZMzKHpel6Wivt6jyHyp46/f7pyvXpE6FtD39PuhUpioOoVNFOF7gf05wd7Ulwm2oP+Lq8+kYpPKqWZ8saTpSj8XDCtgraggaKi/tdeZ5DIjUsieNSEofgYC3synLSPG2XYirxvG/UrM+uwEnVxOdNITgT2T1acaH0kKoJMtgrZtV3Ez/iLAL+O+vpKGbYJdK7XLl7990nbDmZiAmEAn6eat+M+J9y7/QFBkbJCYE8+HpDPSUZR/A5n1/D0BqZvLjCiy344S1ZWAnqoSnGRU+ZgYykan4ZzckftruxXIV4roj3Hf3qhQXWudyG5jU1/HML6N8tXrj1vTv4IJuhwaiCKDCd3oBDnNe6FJExeRzR17kNN+T8QnohhlTgJpPV01TrZ+unMVyRWRbLJHoAZFcqOIrlR7M7sAyr7MEkZVUb2MO6Xubf1J8bwUeF+TQdV5XS+jjNexK5/GHx4xKCE+tsRnAAAAAElFTkSuQmCC";
}

function _avtDetective() {
    return "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";
}

function _qrAlipayDnt() {
    return "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";
}

function _qrWechatDnt() {
    return "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";
}