module.exports = {
    dialog_contents: {
        restore_all_settings: // 还原初始设置
            '此操作无法撤销\n' +
            '如需保留此次会话内容请先保存\n\n' +
            '以下功能内部配置不会被还原:\n' +
            '1. 自动解锁\n' +
            '2. 黑名单管理\n',
        keep_internal_config: // 保留内部配置
            '包含内部配置的功能\n' +
            '只还原此功能的开闭状态\n' +
            '而不会清空内部保存的数据\n' +
            '如解锁密码/黑名单列表等\n',
        about_account_function: // 关于账户功能
            '主账户:\n\n' +
            '执行蚂蚁森林项目时\n' +
            '用户往往希望只针对自己的账户操作\n' +
            '而非他人的账户或小号账户等\n' +
            '尤其是多账号或频繁切换账号的用户\n' +
            '可能出现非预期账户自动执行了脚本\n\n' +
            '此功能可在脚本执行时检测当前账户\n' +
            '若非主账户或未登录任何账户\n' +
            '则将自动切换或登陆主账户\n' +
            '再执行后续操作\n\n' +
            '* 主账户登录需设置账户名\n' +
            '* 账户名必须设置\n' +
            '-- 否则账户功能将自动关闭\n' +
            '* 密码可不做设置\n' +
            '* 无密码时\n' +
            '-- 脚本将在需要时\n' +
            '-- 提示用户手动输入\n\n' +
            '旧账户回切:\n\n' +
            '若脚本运行时账户非主账户A\n' +
            '记当前账户为账户B\n' +
            '脚本切换或登录至A且任务完成后\n' +
            '此功能可自动将账户回切至B\n' +
            '否则将保持主账户A的登录状态\n\n' +
            '关于连续回切:\n' +
            '每次回切将导致计数器累加一次\n' +
            '且将记录回切时的登录账户B\n' +
            '只要新一次运行的账户不是B\n' +
            '无论是主账户A还是另外的账户C\n' +
            '均将导致连续回切计数器清零\n' +
            '当连续回切达到阈值时\n' +
            '自动回切失效且计数器清零',
        before_use_main_account: // 主账户功能使用提示
            '此功能涉及到用户隐私数据\n' +
            '请用户注意账户和密码安全\n' +
            '建议稍后自行点击"帮助"按钮\n' +
            '查看并了解相关信息及注意事项',
        account_info_hint: // 信息录入提示
            '信息录入方式:\n\n' +
            'A. 支付宝录入\n' +
            '自动打开支付宝应用\n' +
            '获取当前登录的账户名\n' +
            '获取成功后自动填入当前页面\n' +
            'B. 账户库录入\n' +
            '账户库功能暂未开发\n' +
            'C. 手动录入\n' +
            '1. 全部留空\n' +
            '将跳过信息录入\n' +
            '或清除已存储的录入数据\n' +
            '2. 密码留空 只填写账户\n' +
            '脚本将在需要账户密码的时候\n' +
            '通过震动提示用户手动输入密码\n' +
            '60秒内输入完成脚本将自动继续\n' +
            '否则脚本终止\n' +
            '3. 全部填写\n' +
            '脚本将自动完成主账户的切换\n' +
            '或自动登录操作\n\n' +
            '注意:\n\n' +
            '1. 密码非必填项\n' +
            '且因安全等原因不建议填入\n' +
            '关于密码存储方式相关内容\n' +
            '可点击"密码存储方式"按钮查看\n' +
            '2. 自动切换或登录在遇到问题时\n' +
            '脚本将自动终止\n' +
            '包括但不限于密码错误\/网络不稳定\/' +
            '账号录入错误或不存在\/账号状态异常\/' +
            '其他特殊情况\n' +
            '3. 当密码已录入时\n' +
            '密码输入框留空或不做修改\n' +
            '均会保持原密码不变\n' +
            '输入新内容可覆盖旧密码\n' +
            '如若删除本地已存储的密码\n' +
            '可将"账户"内容删除留空\n' +
            '或使用"信息销毁"功能',
        how_password_stores: // 密码存储方式
            '用户输入的密码数据\n' +
            '使用"mod-pwmap"模块进行加密\n' +
            '然后存储在本地相应文件中\n\n' +
            '* 加密的原理是随机字符映射\n' +
            '-- 因此难以避免别有用心之人\n' +
            '-- 对本地数据进行解密\n' +
            '-- 或插入劫持代码语句等\n' +
            '-- 因此需要用户妥善保管设备\n' +
            '-- 避免遗失或随意借予他人\n' +
            '* 解密过程与加密过程类似\n' +
            '-- 依然是多次随机字符映射',
        destroy_main_account_info: // 主账户信息销毁
            '此操作将从本地存储中\n' +
            '移除已记录的主账户信息\n' +
            '包括账户和密码\n\n' +
            '确定要销毁主账户信息吗',
        get_account_name_from_alipay: // 从支付宝录入信息
            '可从支付宝应用获取当前账户名\n' +
            '并自动填入本页"账户"输入框\n\n' +
            '若出现当前未登录任何账户\n' +
            '或脚本运行错误等其他意外情况\n' +
            '将可能导致获取账户名失败\n\n' +
            '点击"开始获取"按钮开始操作',
        login_password_needed: // 需要密码
            '请在支付宝密码输入框中\n' +
            '手动填写密码\n' +
            '然后点击"登录"按钮\n' +
            '登陆成功后脚本将自动继续运行\n\n' +
            '脚本不会记录或存储密码\n' +
            '如有疑问或疑虑\n' +
            '可按音量键强制停止脚本\n' +
            '成功登陆后再重新运行脚本',
        account_log_back_in_max_continuous_times: // 最大连续回切次数
            '计数器达最大次数时将不再回切\n' +
            '且计数器将自动清零\n\n' +
            '* 设置 0 值可不限制回切次数\n' +
            '* 详细情况参阅\'帮助与支持\'\n' +
            '-- 位于"账户功能"主页',
        about_blacklist: // 关于黑名单管理
            '能量罩黑名单:\n\n' +
            '仅用作显示与查看\n' +
            '当检测到好友能量罩时\n' +
            '脚本自动添加好友到此名单中\n' +
            '获取并计算能量罩到期时间\n' +
            '能量罩到期后好友将自动移除\n\n' +
            '自定义黑名单:\n\n' +
            '用户可自行管理此名单\n' +
            '位于此名单中的好友\n' +
            '脚本将跳过此人的能量球检查\n' +
            '可指定自动解除时间\n\n' +
            '前置应用黑名单:\n\n' +
            '项目自动运行时\n' +
            '如果检测到当前应用在此名单中\n' +
            '例如名单里有数独游戏\n' +
            '而此时用户正在运行此游戏\n' +
            '则脚本将放弃执行定时任务\n' +
            '将任务推迟数分钟再执行\n' +
            '推迟分钟按以下方案逐次增量\n' +
            '[ 1, 1, 2, 3, 5, 8, 10 ]\n' +
            '达到 10 后将一直保持 10 分钟',
        forest_balls_click_duration: // 能量球点击时长
            '此设置值影响能量球的点击时间\n' +
            '点击方法采用press()\n\n' +
            '注意:\n' +
            '此设置值将同时影响以下操作环境:\n' +
            '1. 主页森林能量球 (绿/橙/金)\n' +
            '2. 好友森林能量球 (绿/橙/金)\n\n' +
            '设置过小值可能造成点击不被响应\n' +
            '设置过大值将影响快速收取体验',
        forest_balls_click_interval: // 能量球点击间隔
            '当可点击的能量球数量超过 1 时\n' +
            '此设置值影响能量球之间的点击间隔\n\n' +
            '注意:\n' +
            '此设置值将同时影响以下操作环境:\n' +
            '1. 主页森林能量球 (绿/橙/金)\n' +
            '2. 好友森林能量球 (绿/橙/金)\n\n' +
            '设置过小值可能遗漏点击能量球\n' +
            '设置过大值将影响快速收取体验',
        homepage_wball_max_hue_no_blue: // 金色球最大色相值 (无蓝分量)
            '用以判断能量球是否为浇水能量球\n' +
            '即金色能量球\n' +
            '判断及计算方法:\n' +
            '区域中心横向 70% 线性扫描\n' +
            '每 2 像素判断色值\n' +
            '色值转换为 RGB 色值\n' +
            '计算 120 - (R / G) × 60\n' +
            '得到无蓝分量的色值 (Hue)\n' +
            'Hue 在所有像素值中存在极大值\n' +
            '统计出可同时适配白天及黑夜场景\n' +
            '且数值出现概率合适的极大值\n' +
            '将此值作为参数值即可实现匹配',
        homepage_monitor_threshold: // 主页能量球循环监测阈值
            '当进入主页存在未成熟能量球\n' +
            '且最小成熟倒计时达到阈值时\n' +
            '将循环监测直到能量球成熟并收取\n' +
            '收取后\n' +
            '若剩余能量球最小倒计时达到阈值\n' +
            '则继续重复循环监测操作\n' +
            '直到没有未成熟能量球\n' +
            '或最小倒计时未达到设定阈值为止',
        homepage_bg_monitor_threshold: // 主页能量球返检阈值
            '好友排行榜操作期间\n' +
            '若主页能量最小成熟时间达到阈值\n' +
            '则返回森林主页开始监控能量球\n' +
            '收取完毕后\n' +
            '将继续进入好友排行榜完成操作\n\n' +
            '* 此功能不受\'循环监测\'开关影响\n' +
            '-- 除非"自收功能"关闭\n' +
            '* 返检阈值不可大于监测阈值\n' +
            '* 接受非整数数值' +
            '-- 如 1.5, 2.8 等',
        friend_collect_icon_color: // 收取图标颜色色值
            '排行榜识别绿色手形图标的参照色值\n\n' +
            '示例:\n' +
            'rgb(67,160,71)\n' +
            '#aeb0b3',
        friend_collect_icon_threshold: // 收取图标颜色检测阈值
            '排行榜识别绿色手形图标的\n' +
            '参照色值检测阈值\n' +
            '阈值越大 匹配越宽松 反之越严格\n' +
            '0 表示完全相似',
        forest_balls_pool_limit: // 能量球样本采集容量
            '限制用于存放森林页面截图样本的\n' +
            '采集池数量上限\n\n' +
            '数量过多将导致采集时间过长\n' +
            '影响收取体验\n' +
            '数量过少将导致识别率受影响\n' +
            '出现遗漏或误判',
        forest_balls_pool_itv: // 能量球样本采集间隔
            '森林页面样本采集池样本之间的' +
            '存放间隔\n\n' +
            '间隔的意义主要在于保证\n' +
            '相邻两个样本之间的有效差异性\n' +
            '间隔过大将导致采集时间过长\n' +
            '影响收取体验\n' +
            '间隔过小将导致样本差异过小\n' +
            '影响识别率并出现遗漏或误判',
        eballs_recognition_region: // 森林页面能量球识别区域
            '用于限制森林页面能量球的识别区域\n' +
            '识别的能量球必须全部包含在此区域\n' +
            '才被视为有效的能量球样本\n\n' +
            '需填写 4 个参数并以逗号分隔\n' +
            '支持的参数: 百分数/数字/小数\n' +
            '示例 1 :  10%,10%,90%,520\n' +
            '示例 2 :  0.1,120,0.9,53%\n\n' +
            '也可使用可视化工具进行参数设置:\n' +
            'tools/Floaty_Rectangle_Region.js',
        ripe_ball_detect_color_val: // 成熟能量球颜色色值
            '森林页面识别成熟能量球的参照色值\n\n' +
            '示例:\n' +
            'rgb(67,160,71)\n' +
            '#aeb0b3',
        ripe_ball_detect_threshold: // 成熟能量球颜色检测阈值
            '森林页面识别成熟能量球的\n' +
            '参照色值检测阈值\n' +
            '阈值越大 匹配越宽松 反之越严格\n' +
            '0 表示完全相似',
        unlock_code: // 设置锁屏解锁密码
            '密码长度不小于 3 位\n' +
            '无密码请留空\n\n' +
            '若采用图案解锁方式\n' +
            '总点阵数大于 9 需使用逗号分隔\n' +
            '图案解锁密码将自动简化\n' +
            '详情点击"查看示例"',
        unlock_code_demo: // 锁屏密码示例
            '滑动即可解锁: (留空)\n\n' +
            'PIN 解锁: 1001\n\n' +
            '密码解锁: 10btv69\n\n' +
            '图案解锁: (点阵序号从 1 开始)\n' +
            '3 × 3 点阵 - 1235789 或 1,2,3,5,7,8,9\n' +
            '4 × 4 点阵 - 1,2,3,4,8,12,16\n' +
            '* 点阵密码将自动简化',
        about_pattern_simplification: // 图案解锁密码简化
            '简化原理:\n' +
            '共线的连续线段组只需保留首末两点\n' +
            '途径点将自动激活\n\n' +
            '3 × 3 - 1,2,3,5,7,8,9 -> 1,3,7,9\n' +
            '4 × 4 - 1,2,3,4,8,12,16 -> 1,4,16\n' +
            '5 × 5 - 1,2,3,4,5,6 -> 1,5,6\n\n' +
            '因此以下一组设置对于图案解锁\n' +
            '可视为相同设置 (3 × 3 点阵):\n' +
            '1,2,3,6,9\n' +
            '1,1,2,2,3,3,3,6,9,9\n' +
            '1,3,9',
        unlock_code_safe_confirm: // 自动解锁风险提示
            '设备遗失或被盗时 自动解锁功能将' +
            '严重降低设备的安全性 ' +
            '甚至导致隐私泄露或财产损失 请谨慎使用\n\n' +
            '如欲了解设备遗失对策\n' +
            '请点击"了解详情"\n\n' +
            '确定要继续吗',
        about_lost_device_solution: // 关于设备遗失对策
            '一旦设备遗失或被盗\n' +
            '可通过以下方式\n' +
            '将可能的损失降到最低\n\n' +
            '* 利用\'查找我的设备\'功能\n\n' +
            '如若遗失安卓手机/平板电脑/手表等\n' +
            '可以寻找/锁定/清空该设备\n' +
            '详情参阅:\n' +
            'https://support.google.com/accounts/answer/6160491?hl=zh-Hans\n\n' +
            '* 及时挂失/冻结卡号/账号\n\n' +
            '优先冻结与财产安全相关的账号\n' +
            '或及时修改登录密码或支付密码\n' +
            '如 微博/微信/支付宝 以及 QQ 等\n' +
            '详情参阅:\n' +
            'https://www.zhihu.com/question/20206696',
        unlock_dismiss_layer_swipe_time: // 提示层页面上滑时长
            '设置整百值可保证匀速滑动\n' +
            '十位小于5可实现不同程度惯性滑动\n\n' +
            '* 通常无需自行设置\n' +
            '* 脚本会自动尝试增量赋值\n' +
            '-- 以获得最佳值',
        unlock_dismiss_layer_bottom: // 提示层页面起点位置
            '设置滑动起点的屏高百分比\n\n' +
            '* 通常无需自行设置\n' +
            '* 设置过大值可能激活非预期控件',
        unlock_dismiss_layer_top: // 提示层页面终点位置
            '设置滑动终点的屏高百分比\n\n' +
            '* 通常无需自行设置\n' +
            '* 此配置值对滑动影响程度较小',
        about_unlock_pattern_strategy: // 关于图案解锁滑动策略
            '叠加路径:\n\n' +
            '采用 gestures() 方法\n' +
            '将每两个点组成直线路径\n' +
            '所有路径利用微小时间差拼接\n' +
            '最终组合形成完整路径\n' +
            '优点:\n' +
            '1. 可实现超高速滑动\n' +
            '2. 滑动拐点定位精确\n' +
            '缺点:\n' +
            '1. 滑动路径可能会断开\n' +
            '2. 滑动总时长=(拐点数+1)×给定参数\n\n' +
            '连续路径:\n\n' +
            '采用 gesture() 方法\n' +
            '将所有坐标作为参数传入\n' +
            '完成一次性不间断滑动\n' +
            '优点:\n' +
            '1. 滑动路径不会断开\n' +
            '2. 滑动总时长=给定参数\n' +
            '缺点:\n' +
            '1. 极易发生拐点偏移现象\n' +
            '2. 拐点数及分布极大影响成功率\n\n' +
            '* 不同策略对应不同\'滑动时长\'参数\n' +
            '* 推荐优先使用\'叠加路径\'策略\n' +
            '-- 当出现路径断开现象时\n' +
            '-- 可尝试"连续路径"策略',
        about_unlock_dismiss_layer_strategy: // 关于提示层页面检测方式
            '解锁前通常需要上滑提示层页面\n' +
            '然后再输入密码或进行图案解锁\n\n' +
            '解锁模块执行逻辑默认会\n' +
            '先判断并处理提示层页面\n' +
            '再判断并处理解锁页面\n\n' +
            '优先: 上述默认行为\n' +
            '滞后: 先判断解锁页面\n' +
            '禁用: 只判断解锁页面\n\n' +
            '* 通常无需修改此项设置',
        unlock_pattern_swipe_time_segmental: // 设置图案解锁滑动时长 - 叠加路径策略
            '此参数表示两拐点间滑动时长\n' +
            '并非表示滑动总时间\n' +
            '总时间=(拐点数+1)×此参数\n' +
            '如"1379"包含两个拐点\n' +
            '参数给定为120ms\n' +
            '则总时长=(2+1)×120ms\n' +
            '即360ms\n' +
            '如"12369"有一个拐点\n' +
            '因此结果为240ms\n\n' +
            '* 通常无需自行设置\n' +
            '-- 脚本会自动尝试增量赋值\n' +
            '-- 以获得最佳值',
        unlock_pattern_swipe_time_solid: // 设置图案解锁滑动时长 - 连续路径策略
            '此参数表示首末点间滑动时长\n' +
            '亦即表示滑动总时间\n\n' +
            '* 通常无需自行设置\n' +
            '-- 脚本会自动尝试增量赋值\n' +
            '-- 以获得最佳值',
        unlock_pattern_size: // 设置图案解锁边长
            '图案解锁通常为 N × N 的点阵\n' +
            '通常边长 N 为 3\n\n' +
            '若未使用图案解锁方式\n' +
            '请保留默认值',
        about_message_showing_function: // 关于消息提示配置
            '控制台消息\n\n' +
            '简略: 只显示最终收取能量总计数据\n' +
            '详细: 显示每个好友收取数据\n' +
            '开发者测试模式: 详细显示操作信息\n\n' +
            '运行前提示对话框\n\n' +
            '息屏或上锁启动时自动跳过:\n' +
            '如果勾选 当项目启动时\n' +
            '如果设备处于息屏或未解锁状态\n' +
            '则不会显示对话框而直接运行项目\n\n' +
            '运行结果展示\n\n' +
            'Floaty: 彩色悬浮窗方式\n' +
            'Toast: 消息浮动框方式\n\n' +
            '* Floaty方式会伴随全屏遮罩层\n' +
            '-- 点击遮罩层可立即结束结果展示\n' +
            '* 此方式额外支持显示时长参数配置\n' +
            '* 若开启了定时任务信息展示\n' +
            '-- 点击相应区域可全屏展示\n' +
            '* 若开启了版本更新提示展示\n' +
            '-- 点击相应区域可查看更新\n' +
            '* Toast方式仅仅展示信息\n' +
            '-- 不支持额外的操作或中断提示\n' +
            '* 版本更新提示配置参数与\n' +
            '-- 自动检查更新页面的\n' +
            '-- 相关配置参数同步',
        timers_prefer_auto_unlock: // 定时任务建议开启自动解锁
            '检测到"自动解锁"功能未开启\n\n' +
            '多数情况下定时任务启动需配合\n' +
            '"自动解锁"功能才能完成\n' +
            '[ 亮屏 - 解锁 - 执行脚本 ]\n' +
            '等一系列操作\n\n' +
            '建议开启并设置"自动解锁"功能',
        timers_countdown_check_timed_task_ahead: // 定时任务提前运行
            '此设置值用于将下次定时任务\n' +
            '运行时间提前 n 分钟\n\n' +
            '设置 0 可关闭提前运行',
        timers_ahead_prefer_monitor_own: // 定时任务提前建议开启主页能量球监测
            '主页能量球监测未开启\n\n' +
            '此情况下提前运行脚本\n' +
            '主页能量球可能没有成熟\n' +
            '因此可能无法收取\n\n' +
            '* 开启主页能量球监测可在\n' +
            '-- 能量球成熟前不断检测能量球\n' +
            '-- 进而保证能量球及时收取\n\n' +
            '确定要保留当前设置值吗',
        timers_ahead_prefer_rank_list_threshold_review: // 定时任务提前建议开启排行榜最小倒计时复查条件
            '排行榜样本复查未开启\n' +
            '或最小倒计时阈值复查条件未激活\n\n' +
            '此情况下提前运行脚本\n' +
            '排行榜可能没有可收取目标\n' +
            '因此可能无法按时完成收取\n\n' +
            '* 排行榜样本复查能够在\n' +
            '-- 目标可收取前不断检测倒计时\n' +
            '-- 进而保证目标及时收取\n\n' +
            '确定要保留当前设置值吗',
        timers_insurance_interval: // 保险任务运行间隔
            '设置值用于当保险任务保留时\n' +
            '下次定时任务启动的时间间隔\n\n' +
            '* 保险任务在脚本运行时设置\n' +
            '* 脚本运行中每10秒钟自动重置间隔\n' +
            '* 脚本结束前自动移除所有保险任务',
        timers_insurance_max_continuous_times: // 最大连续保险次数
            '设置值用于当保险任务连续激活\n' +
            '次数超过一定值时\n' +
            '不再继续自动设置保险任务\n' +
            '避免无人值守时的无限定时循环',
        about_timers_self_manage: // 关于定时任务自动管理机制
            '自动管理:\n\n' +
            '脚本根据已设置的机制\n' +
            '自动设置一个定时任务\n' +
            '或自动更新已存在的定时任务\n' +
            '以保证在无人值守条件下\n' +
            '实现定期定时的脚本自启功能\n\n' +
            '机制简介:\n\n' +
            '1. 主页最小倒计时机制\n' +
            '脚本计算出能量成熟最小倒计时\n' +
            '并根据"定时任务提前运行"参数\n' +
            '得到一个定时时间\n' +
            '如果排行榜最小倒计时机制开启\n' +
            '将会用同样的方法得到定时时间\n' +
            '取两个定时时间的最小值\n' +
            '作为最终的下次任务运行时间\n\n' +
            '2. 排行榜最小倒计时机制\n' +
            '如上所述\n' +
            '另外若主页没有能量球\n' +
            '而且排行榜也没有倒计时数据\n' +
            '则将无法统计出定时时间\n' +
            '此时将激活"延时接力机制"\n\n' +
            '3. 延时接力机制\n' +
            '如上所述\n' +
            '此机制仅在倒计时机制全部关闭' +
            '或倒计时机制未能统计定时时间时被激活\n' +
            '延时接力机制数据格式为:\n' +
            '[ 开始时间, 结束时间, 间隔 ]\n\n' +
            '示例: [ "06:30", "00:00", 60 ]\n' +
            'a. 现在时刻 14:26\n' +
            '下次运行延时 60 分钟间隔\n' +
            '14:26 + 60 -> 15:26\n' +
            'b. 现在时刻 23:41\n' +
            '下次运行延时至 00:00\n' +
            'c. 现在时刻 02:19\n' +
            '下次运行延时至 06:30\n' +
            'd. 现在时刻 06:11\n' +
            '下次运行延时至 06:30\n\n' +
            '* 延时接力可设置多组数据\n' +
            '-- 最终取所有组数据的最小值\n' +
            '* 脚本将自动处理区间边界数据\n' +
            '-- 设置数据时无需考虑间隔取整\n' +
            '-- 当右边界时间小于左边界时\n' +
            '-- 将视右边界时间为次日时间\n' +
            '-- 如 [ "19:50", "03:00", 8 ]\n' +
            '* 仅在没有最小倒计时数据时\n' +
            '-- 此机制才有存在意义\n' +
            '-- 若开启了最小倒计时机制\n' +
            '-- 通常无需在能量成熟密集时间\n' +
            '-- 设置延时接力数据\n' +
            '-- 如 [ "07:00", "07:30", 1 ]\n' +
            '-- 这样的设置是没有必要的\n\n' +
            '4. 意外保险机制\n' +
            '假设"保险任务运行间隔"设置值为 5\n' +
            '脚本运行开始后\n' +
            '将自动设置一个 5 分钟定时任务\n' +
            '当脚本异常停止或被终止时\n' +
            '(包括音量键停止了脚本)\n' +
            '则初期设定的保险定时任务\n' +
            '将在 5 分钟后定时执行\n' +
            '确保脚本定时任务的连续性\n\n' +
            '* 无论是最小倒计时机制\n' +
            '-- 还是延时接力机制\n' +
            '-- 均在脚本即将结束之前设定\n' +
            '-- 若在此之前脚本异常终止\n' +
            '-- 则会出现定时任务"断档"\n' +
            '-- 这正是此机制存在的主要意义\n' +
            '* 若脚本长时间运行还未正常结束\n' +
            '-- 5 分钟的定时任务将被激活\n' +
            '-- 并在任务列表排队等待执行\n' +
            '-- 此时定时任务依然出现"断档"\n' +
            '-- 因此脚本在后台每 10 秒钟\n' +
            '-- 会自动延期保险任务\n' +
            '-- 保证保险任务不会被"消耗"\n' +
            '* 保险任务连续执行次数\n' +
            '-- 受到"最大连续保险次数"约束\n' +
            '-- 达到此限制时将不再设置保险任务\n' +
            '-- 避免保险任务导致脚本无限循环\n\n' +
            '有效时段:\n\n' +
            '可使项目在自动设置定时任务时\n' +
            '仅会落在设置的有效时段内\n' +
            '避免在某些时间对用户的干扰\n' +
            '如设置时段 [ 09:00, 14:00 ]\n' +
            '则脚本运行结束前设置定时任务时\n' +
            '不会超出这个范围\n' +
            '举三种情况的例子\n' +
            '分别表示不同的定时任务运行时间\n' +
            '1. 09:30\n' +
            '正常制定任务\n' +
            '因为 09:30 落在时段范围内\n' +
            '2. 15:20\n' +
            '制定第二天 09:00 的任务\n' +
            '3. 07:10\n' +
            '制定当天 09:00 的任务\n' +
            '如果时段结束值大于等于起始值\n' +
            '同延时接力机制一样\n' +
            '则将结束值视为第二天的时间点\n' +
            '例如设置 [ 21:00, 07:45 ]\n' +
            '则表示晚 9 点到次日 07:45\n' +
            '晚 23 点和早 6 点都在范围内\n' +
            '而上午 11 点则不在上述范围\n' +
            '注意区分 [ 07:45, 21:00 ]\n' +
            '如有多个时段将做并集处理\n' +
            '如果设置了一个 24 小时区间\n' +
            '则时段管理将失去意义\n' +
            '如 [ 05:23, 05:23 ]\n' +
            '等同于"全天有效"的效果',
        max_running_time_global: // 脚本单次运行最大时间
            '设置值用于脚本单次运行\n' +
            '可消耗的最大时间\n' +
            '避免无人值守时的无响应情况',
        max_queue_time_global: // 排他性任务最大排队时间
            '当旧排他性任务运行或排队时\n' +
            '新排他性任务将继续排队\n' +
            '排队时间与排他性任务总数相关\n\n' +
            '* 当排队时间达到阈值时将强制结束\n' +
            '-- 当前正在运行的排他性任务\n' +
            '* 设置过小的值可能在脚本\n' +
            '-- 正常结束前被意外终止',
        min_bomb_interval_global: // 脚本炸弹预防阈值
            '若当前脚本与最近一个正在运行的蚂蚁森林脚本的运行时间差小于此阈值\n' +
            '则视当前脚本为炸弹脚本\n' +
            '炸弹脚本将自动强制停止\n' +
            '此安全设置通常针对因某些原因短时间内运行大量相同脚本的意外情况',
        about_kill_when_done: // 关于支付宝应用保留
            '此设置用于决定脚本结束时\n' +
            '保留或关闭支付宝应用\n\n' +
            '关闭总开关后将在脚本结束时\n' +
            '无条件关闭支付宝应用\n\n' +
            '支付宝应用保留:\n' +
            '智能保留:\n' +
            '脚本运行时检测当前前置应用\n' +
            '根据前置应用是否是支付宝\n' +
            '决定保留或关闭操作\n' +
            '总是保留:\n' +
            '无条件保留支付宝应用\n\n' +
            '蚂蚁森林页面保留:\n' +
            '智能剔除:\n' +
            '脚本将自动关闭与蚂蚁森林项目相关的全部页面\n' +
            '如蚂蚁森林主页/排行榜页面等\n' +
            '最终回归到脚本启动前的支付宝页面\n' +
            '全部保留:\n' +
            '无条件保留项目运行中的所有页面\n' +
            '除非支付宝应用被触发关闭\n\n' +
            '* 关闭应用优先使用杀死应用方式\n' +
            '-- 杀死应用需要 Root 权限\n' +
            '-- 无 Root 权限将尝试最小化应用\n' +
            '-- 最小化原理并非模拟 Home 键\n' +
            '* \'智能保留\'的智能化程度十分有限',
        backup_to_local: // 备份项目至本地
            '此功能将项目相关文件打包保存在本地\n' +
            '可在还原页面恢复或删除已存在的备份',
        restore_project_confirm: // 确认还原项目
            '确定还原此版本项目吗\n' +
            '本地项目将被覆盖\n' +
            '此操作无法撤销\n\n' +
            '还原后建议重启配置工具',
        v1_6_25_restore_confirm: // v1.6.25版本还原提示
            '此版本过于陈旧\n' +
            '不建议还原此版本\n\n' +
            '还原后将丢失以下全部功能:\n' +
            '1. 项目更新功能\n' +
            '2. 项目备份还原功能\n' +
            '3. 解锁模块的高效稳定性\n' +
            '4. 解锁模块的开发者测试模式\n' +
            '5. 重要的工具函数\n\n' +
            '缺少工具函数将导致项目无法运行',
        rank_list_swipe_time: // 设置排行榜页面滑动时长
            '通常无需自行设置\n' +
            '若出现滑动异常现象\n' +
            '可尝试适当增大此设置值',
        rank_list_swipe_interval: // 设置排行榜页面滑动间隔
            '若出现遗漏目标的情况\n' +
            '可尝试适当增大此设置值',
        rank_list_scroll_interval: // 设置排行榜页面滑动间隔
            '若出现遗漏目标的情况\n' +
            '可尝试适当增大此设置值',
        rank_list_capt_pool_diff_check_threshold: // 排行榜截图样本池差异检测阈值
            '排行榜滑动前后截图样本相同时\n' +
            '脚本认为滑动无效 并进行无效次数统计 ' +
            '当连续无效次数达到阈值时 将放弃滑动并结束好友能量检查\n\n' +
            '达阈值时 脚本会判断"服务器打瞌睡"页面及"正在加载"按钮 ' +
            '根据实际情况点击"再试一次"或等待"正在加载"按钮消失 (最大等待2分钟)\n\n' +
            '* 此参数主要避免因意外情况导致当前页面不在排行榜页面时的无限滑动\n' +
            '* 截图样本相同指: 相似度极高',
        rank_list_max_not_targeted_times: // 最大连续无目标命中次数
            '排行榜每滑动一次\n' +
            '若当前页面没有好友\n' +
            '则记录一次无目标命中次数\n' +
            '当达到最大阈值时则停止排行榜检查\n' +
            '* 此参数主要避免因意外情况导致在某一页面的无限滑动',
        about_rank_list_review: // 关于排行榜样本复查
            '样本复查:\n\n' +
            '排行榜列表到达底部后\n' +
            '由复查条件决定是否重新检查排行榜\n' +
            '进而达到循环监测的目的\n\n' +
            '列表到达底部后\n' +
            '脚本会统计记录列表所有好友数据\n' +
            '包括倒计时数据及对应好友昵称\n\n' +
            '复查条件:\n\n' +
            '1. 列表状态差异:\n' +
            '比较上一次统计的昵称数据\n' +
            '只要昵称数据不一致\n' +
            '则触发复查条件\n' +
            '脚本将复查列表并重新比较数据\n' +
            '直到最近两次昵称数据完全一致\n\n' +
            '* 因至少需要两组比较数据\n' +
            '-- 所以列表至少会复查一次\n' +
            '* 即便这样会导致额外的操作\n' +
            '-- 此条件依然是循环检测的利器\n' +
            '-- 用户可自行斟酌保留与否\n\n' +
            '2. 样本点击记录:\n' +
            '在一次完整的列表滑动过程中\n' +
            '只要出现了有效点击行为\n' +
            '则触发复查条件\n\n' +
            '3. 最小倒计时阈值:\n' +
            '统计最小成熟倒计时\n' +
            '如果达到设定阈值\n' +
            '则触发复查条件\n\n' +
            '* 有效点击指进入好友森林后\n' +
            '-- 点击过可收取的能量球',
        stroll_btn_locate_main_color: // 逛一逛按钮定位主要色值
            '参数用于配置多点取色方式\n' +
            '定位逛一逛按钮时的基准色值',
        stroll_btn_match_threshold: // 逛一逛按钮定位匹配阈值
            '参数用于配置多点取色方式\n' +
            '定位逛一逛按钮时的匹配阈值',
        max_continuous_not_targeted_stroll_cycle: // 逛一逛最大无操作循环次数
            '参数用于防止逛一逛策略\n' +
            '在采集过程中遇到无操作好友\n' +
            '可能引起的无限循环\n\n' +
            '无操作情况举例:\n' +
            '· 好友位于自定义黑名单\n' +
            '· 好友使用能量保护罩\n' +
            '· 好友能量球采集失败\n' +
            '· 好友能量球点击失败\n' +
            '· 好友能量球被他人收取\n' +
            '· 用户关闭了相关功能\n',
        about_collectable_samples: // 关于可收取目标采集
            '排行榜列表 (默认策略):\n' +
            '从排行榜遍历可操作目标\n' +
            '优点:\n' +
            '1. 方案成熟且不易出现目标遗漏\n' +
            '2. 获取倒计时数据无需额外耗时\n' +
            '缺点:\n' +
            '1. 采集效率受好友数量影响较大\n' +
            '2. 差异样本池消耗较多硬件资源\n' +
            '3. 需要频繁进出排行榜页面\n\n' +
            '逛一逛按钮:\n' +
            '直接使用官方提供的快捷按钮\n' +
            '优点:\n' +
            '1. 采集效率高/不受好友数量影响\n' +
            '2. 避开排行榜的所有潜在问题\n' +
            '3. 无需考虑循环遍历条件\n' +
            '缺点:\n' +
            '1. 按钮定位判断条件可信度低\n' +
            '2. 结束页面判断条件可信度低\n' +
            '3. 过程可操控性/可预见性低\n' +
            '4. 获取倒计时数据依赖排行榜\n' +
            '5. 一定概率出现可操作目标遗漏\n\n' +
            '注意:\n' +
            '当逛一逛按钮方案出现异常时\n' +
            '脚本将自动在当前会话过程中\n' +
            '切换至"排行榜列表"采集策略',
        restore_from_local: // 还原本地备份
            '确定还原此备份吗\n' +
            '本地项目将被覆盖\n' +
            '此操作无法撤销\n\n' +
            '还原后建议重启配置工具',
        restore_original_list_data: // 恢复列表数据
            '要恢复本次会话开始前的列表数据吗\n\n' +
            '此操作不可撤销',
        add_friend_nickname_manually: // 手动添加好友昵称
            '手动添加易出错\n' +
            '且难以键入特殊字符\n' +
            '建议使用列表导入功能',
        phone_call_state_idle_value: // 通话空闲状态值
            '当设备当前通话状态值\n' +
            '与空闲状态值不一致时\n' +
            '将触发通话状态事件\n' +
            '脚本将持续等待\n' +
            '直到通话状态变为空闲\n\n' +
            '* 事件解除后\n' +
            '-- 脚本将执行一次支付宝前置操作\n' +
            '* 不同设备的通话空闲状态值\n' +
            '-- 可能存在差异',
        phone_call_state_idle_value_warn: // 通话空闲状态值设置警告
            '输入值与当前通话空闲值不一致\n' +
            '此配置将导致脚本无法正常运行\n\n' +
            '确定要使用当前输入值吗',
        rank_list_bottom_template_hint_base: // 排行榜底部控件图片模板基础提示
            '排行榜"没有更多了"控件的图片模板\n' +
            '此模板用于排行榜底部判断\n\n',
        rank_list_bottom_template_hint_exists: // 排行榜底部控件图片模板存在附加提示
            '正常模板应包含"没有更多了"字样\n' +
            '查看模板后若发现图片模板存在异常\n' +
            '可选择删除模板\n' +
            '模板删除后\n' +
            '脚本在下次运行时将自动生成新模板',
        rank_list_bottom_template_hint_not_exists: // 排行榜底部控件图片模板不存在附加提示
            '当前暂未生成图片模板\n' +
            '脚本在下次运行时将自动生成新模板',
        about_auto_enable_a11y_svc: // 关于自动开启无障碍服务
            '通过修改系统无障碍服务的列表参数\n' +
            '实现Auto.js无障碍服务的自动开启\n' +
            '此过程需要授予Auto.js以下权限:\n\n' +
            'WRITE_SECURE_SETTINGS\n\n' +
            '如果设备已经获取Root权限\n' +
            '脚本会自动自我授权\n' +
            '否则需要将手机连接到计算机\n' +
            '然后在计算机使用ADB工具\n' +
            '执行以下指令(无换行):\n\n' +
            'adb shell pm grant org.autojs.autojs ' +
            'android.permission.WRITE_SECURE_SETTINGS\n\n' +
            '执行后Auto.js将获取上述权限\n' +
            '如需撤销授权需将上述指令的\n' +
            'grant替换为revoke\n\n' +
            '注: 如果没有权限授权\n' +
            '脚本则会在需要的时候\n' +
            '提示用户手动开启无障碍服务',
        about_app_launch_springboard: // 关于启动跳板
            '某些设备或应用无法直接调用 APP\n' +
            '如 launch() 或 startActivity() 等\n' +
            '需先调用 Auto.js 再调用指定 APP\n' +
            '当脚本运行结束时\n' +
            '可自动关闭调用过的 Auto.js 页面\n' +
            '以实现跳板的无痕特性\n\n' +
            '* 无痕特性以跳板页面暴露为前提',
        about_timed_task_type: // 关于定时任务类型设置
            '一次性任务执行后将自动失效\n' +
            '每日/每周任务将按日/按周循环执行\n\n' +
            '注意:\n' +
            '1. 定时任务自动管理功能往往可以\n' +
            '-- 完成绝大多数定时任务需求\n' +
            '-- 因此不建议设置过多或\n' +
            '-- 过于繁杂的手动定时任务\n' +
            '2. 也可以使用 Auto.js 自带的\n' +
            '-- 定时任务管理功能\n' +
            '-- 但涉及月份设置或修改时很可能\n' +
            '-- 会出现 1 个月的偏差问题',
        delete_min_countdown_task_warn: // 最小倒计时任务删除警告
            '正在删除最小倒计时任务\n\n' +
            '最小倒计时任务是\n' +
            '定时任务自动管理功能的精髓\n' +
            '除非已确定此任务的异常性\n' +
            '否则强烈不建议删除此任务\n\n' +
            '确定要删除最小倒计时任务吗',
        prompt_before_running_countdown_seconds: // 提示对话框倒计时时长
            '倒计时结束前\n' +
            '用户可自主点击按钮执行相应操作\n' +
            '否则倒计时超时后脚本将自动执行',
        about_global_log_page: // 关于本地日志功能
            '本地日志功能将Auto.js生成的\n' +
            '所有控制台日志写入文件\n' +
            '包括蚂蚁森林项目及其他所有脚本\n' +
            '同样当关闭此功能时\n' +
            '将停止所有脚本日志的本地写入\n\n' +
            'Auto.js因崩溃等原因重启时\n' +
            '本地日志写入功能将失效\n' +
            '但原有的本地日志依然保留\n' +
            '仅仅是停止继续写入\n' +
            '此时运行蚂蚁森林项目\n' +
            '若本地日志写入功能开关开启\n' +
            '将自动重新激活本地日志的写入功能\n\n' +
            '功能核心代码:\n' +
            'console.setGlobalLogConfig',
        about_eballs_recognition: //
            '能量球的识别基于霍夫变换\n' +
            '关键参数如下:\n' +
            '    image: %img%\n' +
            '    dp: 1\n' +
            '    minDist: cX(0.09) (可配置)\n' +
            '    minRadius: cX(0.054)\n' +
            '    maxRadius: cX(0.078)\n' +
            '    param1: 15\n' +
            '    param2: 15\n' +
            '可参阅 __image__.js 封装模块\n' +
            '内部的 images.findCircles() 方法\n\n' +
            '上述的 %img% 传入参数有以下策略:\n' +
            '1. 灰度化\n' +
            '基本的图像处理策略\n' +
            '霍夫变换必须传入 8 位单通道灰度图像\n' +
            '2. 自适应阈值\n' +
            '根据像素的邻域块的像素值分布\n' +
            '确定该像素位置上的二值化阈值\n' +
            '3. 中值滤波 & 4. 均值滤波\n' +
            '均值滤波和中值滤波都可以平滑图像并虑去噪声\n' +
            '均值滤波采用线性方法对目标像素及周边像素取平均值后再填充目标像素\n' +
            '中值滤波采用非线性方法使用所有像素中值替代中心位置像素值\n' +
            '5. 双边滤波\n' +
            '双边滤波是一种非线性滤波方法\n' +
            '结合图像的空间邻近度和像素值相似度的一种折衷处理\n' +
            '同时考虑空域信息和灰度相似性达到保边去噪的目的\n\n' +
            '由于双边滤波耗时相对较长\n' +
            '且识别结果准确率也未见明显优势\n' +
            '因此不建议开启双边滤波策略\n' +
            '除非对识别率有极高的要求或用于测试' +
            '或关闭了 2,3,4 策略仅保留 1,5 等情况\n' +
            '但依然不建议 1,5 这样的策略组合\n\n' +
            '通过霍夫变换得到页面的圆形样本后\n' +
            '样本会按照横坐标升序排序\n' +
            '排序后可对样本数据做进一步处理:\n' +
            '1. 覆盖检测\n' +
            '如果相邻两个圆形的圆心间距过小\n' +
            '则认为样本重复并将后一个样本去除\n' +
            '2. 对称检测\n' +
            '对于所有样本的最左和最右两个样本\n' +
            '如果做中轴镜像后不满足最小球间距\n' +
            '则认为对方位置能量球缺失 ' +
            '并会做能量球补算填充\n' +
            '3. 线性插值\n' +
            '计算所有球的最小间距作为参考值\n' +
            '如果检测到有相邻两个能量球间距大于' +
            '这个参考值的某个倍数 则会做插值处理 ' +
            '可能插入 1 个或多个能量球\n\n' +
            '数据处理示例:\n' +
            '森林页面最多可展示 6 个能量球\n' +
            '将这些球大概位置记为 1, 2... 6\n' +
            '以下示例仅针对线性插值和对称检测\n' +
            '示例 1:\n' +
            '能量球 1 个 位于 3 号位置偏右\n' +
            '识别到的能量球位置 3\n' +
            '对称检测不生效\n' +
            '线性插值不生效\n' +
            '结果: 3 (正确)\n' +
            '示例 2:\n' +
            '能量球 2 个 位于 3,4\n' +
            '识别到的能量球位置 4\n' +
            '即遗漏了 3 号位置的球\n' +
            '对称检测生效\n' +
            '由 4 做镜像后补充\n' +
            '线性插值不生效\n' +
            '结果: 3,4 (正确)\n' +
            '示例 3:\n' +
            '能量球 6 个 位于 1,2,3,4,5,6\n' +
            '识别到的能量球位置 1,5,6\n' +
            '即遗漏了 2,3,4 位置的球\n' +
            '对称检测不生效\n' +
            '因为 1 和 6 镜像后不需补充\n' +
            '线性插值生效\n' +
            '5 和 6 的间距作为参考\n' +
            '会将 1 与 4 之间插入 2 个球\n' +
            '结果: 1,2,3,4,5,6 (正确)\n' +
            '示例 4:\n' +
            '能量球 5 个 位置如下:\n' +
            '1, 2偏右, 居中, 5偏左, 6\n' +
            '为方便阅读 将位置记为 A,B,C,D,E\n' +
            'A,E 对称  B,D 对称  C 居中\n' +
            '识别到的能量球位置 A,C,E\n' +
            '即遗漏了 B,D 位置的球\n' +
            '对称检测不生效\n' +
            '因为 A 和 E 镜像后不需补充\n' +
            '线性插值不生效\n' +
            'A,C 和 C,E 的间距几乎相同\n' +
            '因此无需插值\n' +
            '结果: A,C,E (错误)\n' +
            '如果上述情况的识别结果为 A,D,E\n' +
            '则与示例 3 类似\n' +
            '最终将识别到正确结果: A,B,C,D,E',
        update_ignore_confirm: // 版本忽略提示
            '确定要忽略当前版本吗\n\n' +
            '* 忽略后脚本将不再提示当前版本更新\n' +
            '* 忽略后可在配置工具中管理已忽略的所有版本',
        about_update_auto_check: // 关于自动检查更新
            '自动检查更新功能可在不同场景\n' +
            '进行版本更新的提示\n\n' +
            '* 注意: 此功能不会自动下载更新\n\n' +
            '更新提示场景:\n\n' +
            '1. 运行结果展示时\n' +
            '当"运行结果展示"功能生效时\n' +
            '可同时展示版本更新提示\n' +
            '包括Floaty或Toast方式\n\n' +
            '2. 配置工具启动时\n' +
            '在配置工具启动后\n' +
            '脚本会在后台检查项目更新\n' +
            '发现更新后以SnackBar方式提示\n\n' +
            '版本忽略管理:\n\n' +
            '对于不希望提示更新的版本\n' +
            '可添加至忽略列表中\n' +
            '例1: 当前版本为v2.0.1\n' +
            '服务器最新版本为v2.0.2\n' +
            '将v2.0.2添加至忽略列表中\n' +
            '则脚本将不会提示项目有更新\n' +
            '例2: 当前版本为v2.0.1\n' +
            '服务器最新版本为v2.0.4\n' +
            '将v2.0.4添加至忽略列表中\n' +
            '则脚本将会提示项目有更新\n' +
            '且最新版本为v2.0.3\n' +
            '此时如果再将v2.0.3添加至列表\n' +
            '则脚本依然会提示项目有更新\n' +
            '且最新版本为v2.0.2\n',
        about_rank_list_scan_strategy: // 关于排行榜页面滑动策略
            '控件滚动:\n' +
            '基于排行榜可滚动控件的\n' +
            '无障碍行为实现列表滚动\n' +
            '优点:\n' +
            '1. 滚动效率非常高\n' +
            '2. 无需关心滚动距离\n' +
            '3. 全平台无惯性滚动\n' +
            '缺点:\n' +
            '1. 依赖控件\n' +
            '2. 定位唯一性可能不够严谨\n\n' +
            '模拟滑动:\n' +
            '基于辅助服务的\n' +
            '无障碍行为实现列表滑动\n' +
            '优点:\n' +
            '1. 可定义滑动距离及时长\n' +
            '2. 不依赖排行榜控件\n' +
            '缺点:\n' +
            '1. 某些平台可能出现惯性滑动',
        about_rank_list_scroll_distance: // 关于排行榜页面滑动距离
            '采用"控件滑动"策略时\n' +
            '无法指定滑动距离\n' +
            '由"无障碍行为"实现基于控件的滚动',
        about_rank_list_scroll_time: // 关于排行榜页面滑动时长
            '采用"控件滑动"策略时\n' +
            '无法指定滑动时长\n' +
            '由"无障碍行为"决定控件的滚动时长',
    },
    image_base64_data: {
        ic_outlook: _icOutlook(),
        ic_qq: _icQq(),
        ic_github: _icGithub(),
        ic_fetch: _icFetch(),
        ic_backpack: _icBackpack(),
        avt_detective: _avtDetective(),
        qr_alipay_dnt: _qrAlipayDnt(),
        qr_wechat_dnt: _qrWechatDnt(),
    },
};

// constructor(s) //

/**
 * @constructor
 * @param {string} name
 * @param {string} base64
 * @param {number} [src_dev_width]
 */
function _Base64Image(name, base64, src_dev_width) {
    let _key = '_$_base64_img_' + name;
    this.name = name;
    this.base64 = base64;
    this.src_dev_width = src_dev_width;
    this.getImage = function () {
        return global[_key] || (global[_key] = images.fromBase64(this.base64));
    };
}

// base64 function(s) //

function _icOutlook() {
    // noinspection SpellCheckingInspection
    return new _Base64Image('ic_outlook', 'data:image/png;base64,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');
}

function _icQq() {
    // noinspection SpellCheckingInspection
    return new _Base64Image('ic_qq', 'data:image/png;base64,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');
}

function _icGithub() {
    // noinspection SpellCheckingInspection
    return new _Base64Image('ic_github', 'data:image/png;base64,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');
}

function _icFetch() {
    // device width: 1644px; quality: 90; format: jpg; source: Auto.js
    // noinspection SpellCheckingInspection
    return new _Base64Image('ic_fetch', 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAA8ADwDASIAAhEBAxEB/8QAHQAAAQMFAQAAAAAAAAAAAAAACAQHCQACAwUGAf/EAC4QAAEDAwIFAwQBBQAAAAAAAAIDBAUAARIGBwgREyIyFEJSITFBYlEWIzNysf/EABsBAAICAwEAAAAAAAAAAAAAAAQFAwYAAQIH/8QAJBEAAgEEAQQCAwAAAAAAAAAAAAIDAQQFEhMRFCIyITEjQWL/2gAMAwEAAhEDEQA/ACGLhNljhxdJKAShDljlSPTPDI+lhWTcqCgsJYiJFjRQ7U6xb6w0o2WTOxKCOJDW/lYJN5/cRv0VrfYxobiX2EC4y2ZVdVAf1pw8T2lFO1Hrp/JPurlX21k8ya9b0aqo/qOVH4i9ES9DJIifxIh8qRyUCLA+skimuzLySxrjiUHkw8DeSkcrhks1LFVMki/Yaw0eGrNltP6tb+satQSU8iEaHvc7YJ1p5upIMMl24+Q4+NRtEyiW5xMkPkoydVVyiRJEQmOJDVtDlfZNfgc7Z3d15oCWTElCJmXaQ0cWjtZx+sotN0zVsWQ8yG3tqM+nU2V3aeaFnEUzUImahYkNERS6+JacZkWjbik9Q8JOMTkEbgVrZe0q1sa9JBQmLzu+JfKl0FMoT0Yg8blYk1Ryr2WbJ9H1Fx5kn3UaXP8ApTX+nKHkMkxybqe2r5GEbuBIjESRUHuEqUsnQzDAriN8h7e75UsaIEDcU1e6tma7fYDnENtl/R84Tpqni1WLtpmaPfiJ0kOodFrLWDmTccqAtZMklLgX3tQEy6sUHLW/BNuv7DFLhHjCZ42e36mPljTc6s4U5qG6i0cobwR7vGu7224p2z7ptJkLip49TKiBh5+P1C0FZm4BdMvjep1SN/Us0dvaXK/jGO4bp2YYEtAyyJiSJYp5UQVwsQ3tf7VgRjmzdTqAiAqfKw8qU+2p1XVdRtDHxJqY0GqbUbikOPOs1VVV2Tmq1LHBLQjxrccuone3Ko7NdadUjNWSTfArYrF/29SSENi52/mh93G2KUndUuHrbHpqiN79v5/NQyJsJsjbc9FrQDQTISyGnC273kmNCuk8HCirfL/GRdtN5y5ZWrylytqeew3L2zdUJCds954nXjMBssKTr3CXbTjWvYx52+tRiwM++g3qKzJckDt+Ros9nty52URTB04Ba37BR8clW+y+2OQ7hejUCLqqQxzs3QczsNv9bcqXUQPjHcrAN737bfzeuA1HvDCQUoozUchcwtbnyrXb56qkIDTjj0SgpFcfPH60CUrOPpGQWXXcEapF9SqF5NRLeX3b1otFP//Z', 1644);
}

function _icBackpack() {
    // device width: 1644px; quality: 79; format: jpg; source: XnShell
    // noinspection SpellCheckingInspection
    return new _Base64Image('ic_backpack', 'data:image/jpg;base64,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', 1644);
}

function _avtDetective() {
    // noinspection SpellCheckingInspection
    return new _Base64Image('avt_detective', 'data:image/png;base64,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');
}

function _qrAlipayDnt() {
    // noinspection SpellCheckingInspection
    return new _Base64Image('qr_alipay_dnt', 'data:image/png;base64,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');
}

function _qrWechatDnt() {
    // noinspection SpellCheckingInspection
    return new _Base64Image('qr_wechat_dnt', 'data:image/png;base64,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');
}