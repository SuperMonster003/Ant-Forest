******

### 版本历史 - 2.x

******

# v2.2.2

###### 2021/11/01

* `新增` 运行前提示对话框的推迟任务列表增加"息屏时"选项
* `修复` 解锁密码为空时无法解锁设备的问题
* `修复` 逛一逛方案无法识别能量雨页面判断条件的问题
* `修复` 配置工具输入忽略版本内容时可能导致脚本崩溃的问题
* `修复` 设备屏幕水平方向启动项目后刷新屏显参数失败的问题 _[`issue #534`](https://github.com/SuperMonster003/Ant-Forest/issues/534)_
* `修复` 配置工具定时任务控制面板定时任务及任务类型识别异常的问题
* `管理` 项目图片资源文件夹移除打赏二维码并迁移至README.md中
* `管理` 项目图片资源文件夹内增加.nomedia防止媒体库中出现无关资源

# v2.2.1

###### 2021/10/27

* `修复` 能量雨工具运行时旧窗口实例没有按预期移除的问题
* `修复` 能量雨工具增加近似区域点击检测避免错误的结束条件检测 _[`issue #527`](https://github.com/SuperMonster003/Ant-Forest/issues/527#issuecomment-952476244)_ _[`#530`](https://github.com/SuperMonster003/Ant-Forest/issues/530)_
* `修复` imagesx.concat()潜在的内存泄漏问题 _[`issue #527`](https://github.com/SuperMonster003/Ant-Forest/issues/527#issuecomment-952084434)_
* `修复` a11yx扩展模块无阻塞方法内部arguments的语法错误 _[`issue #527`](https://github.com/SuperMonster003/Ant-Forest/issues/527)_ _[`#530`](https://github.com/SuperMonster003/Ant-Forest/issues/530)_
* `修复` Pro版本Auto.js内存管理工具重启进程后的任务残余 (试修) _[`issue #528`](https://github.com/SuperMonster003/Ant-Forest/issues/528)_

# v2.2.0

###### 2021/10/26 - 代码重构 API变更 项目结构变更 谨慎升级

* `修复` 账户功能开启时自动登录可能失败的问题 _[`issue #524`](https://github.com/SuperMonster003/Ant-Forest/issues/524)_
* `修复` 能量雨组件更新导致相关工具运行异常的问题 _[`issue #525`](https://github.com/SuperMonster003/Ant-Forest/issues/525)_
* `修复` 主页浇水能量球误识别导致假死的问题 _[`issue #518`](https://github.com/SuperMonster003/Ant-Forest/issues/518)_
* `修复` 对话框返回键监听器触发时连续执行两次的问题
* `修复` 获取能量罩信息时可能无法正确获取日期的问题
* `修复` 能量罩好友在同一会话中重复加入黑名单的问题
* `修复` 蚂蚁森林备用启动方案不支持新版支付宝的问题
* `修复` 进入好友森林后自动展开好友动态可能不成功的问题
* `修复` 配置工具开发者页面点击图标时可能报错退出的问题
* `修复` 运行提示对话框推迟任务时可能导致脚本假死的问题
* `修复` 音量键监听器线程可能被提前终止致使功能失效的问题
* `修复` 音量键停止脚本后部分图片资源可能未及时回收的问题
* `修复` 主页能量球监控到达成熟时间后可能未及时停止的问题 _[`issue #508`](https://github.com/SuperMonster003/Ant-Forest/issues/508)_ _[`#521`](https://github.com/SuperMonster003/Ant-Forest/issues/521)_
* `修复` IMAGES扩展模块多次加载导致截图权限申请失败的问题
* `修复` 排行榜截图样本池差异检测失效导致可能的停检迟缓问题 _[`issue #519`](https://github.com/SuperMonster003/Ant-Forest/issues/519)_ _[`#526`](https://github.com/SuperMonster003/Ant-Forest/issues/526)_
* `修复` 部分Pro版本无法获取DialogAction静态变量的问题 _[`issue #520`](https://github.com/SuperMonster003/Ant-Forest/issues/520)_
* `修复` $$sel.pickup()罗盘p标记跨标记定位时的定位错误问题
* `修复` 部分Pro版本无障碍服务未开启时运行配置工具无响应的问题
* `优化` 增加$$sel.pickup()箭头函数回调并优化错误提示
* `优化` 增加$$sel.pickup()罗盘k标记可向上遍历clickable控件
* `优化` 增加$$sel.traverse()/traverseAll()可遍历并筛选子控件
* `优化` 脚本结束前及时关闭数据库实例以释放部分资源 _[`issue #497`](https://github.com/SuperMonster003/Ant-Forest/issues/497#issuecomment-913081139)_
* `优化` 使用Webpack替代UglifyJS避免项目部署工具代码冗余
* `优化` 整合mod-monster-func所有方法到相关子扩展模块中
* `优化` waitForAction()增加回调可直接使用条件源的返回值
* `优化` 简化imagesx.getName()实现并摒弃不必要的备用方案
* `优化` 图标资源整合至本地文件提升读取效率并增加哈希校验
* `优化` 图标资源匹配优化分辨率自适应并提升无缓存匹配效率
* `优化` 图标资源可根据哈希信息实现缓存自销毁及缓存自更新
* `优化` 提升配置工具查看历史更新获取速度及成功率
* `优化` 提升能量雨条件识别及统计结果的效率及准确率
* `优化` 使用基于Pro版本的crypto模块替代pwmap模块提升可用性
* `提示` crypto模块可读取pwmap模块的数据文件但不支持反向读取

# v2.1.10

###### 2021/08/22

* `修复` 获取能量罩信息时可能出现空指针的问题
* `修复` 闹钟间隔事件监测代码异常导致脚本终止的问题
* `修复` $$cvt对0到1之间的输入数据返回值为空的问题
* `优化` threadsx.start()支持箭头函数及绑定函数
* `优化` Pro版本增加对话框按钮自定义颜色设置的支持
* `优化` Pro版本移除获取控件信息对currentPackage()的依赖

# v2.1.9

###### 2021/08/20

* `修复` 配置工具无法设置排行榜滑动距离等相关配置项的问题
* `修复` 获取能量球数据缓存时逻辑错误导致效率提升无效的问题
* `修复` OCR方案获取倒计时耗时过久未能按预期及时停止的问题
* `优化` 霍夫变换覆盖检测方法优化以提高成熟能量球识别率 _[`issue #508`](https://github.com/SuperMonster003/Ant-Forest/issues/508#issuecomment-900102913)_

# v2.1.8

###### 2021/08/13

* `修复` 配置工具对话框监听器this指针绑定失效的问题 _[`issue #513`](https://github.com/SuperMonster003/Ant-Forest/issues/513)_ _[`#511`](https://github.com/SuperMonster003/Ant-Forest/issues/511#issuecomment-896448713)_
* `修复` 森林主页监控成熟能量球时可能引起设备关屏的问题 (试修) _[`issue #508`](https://github.com/SuperMonster003/Ant-Forest/issues/508)_
* `优化` 完善内存信息工具内的提示信息
* `优化` 去除控制台消息在简略模式下的部分无关内容

# v2.1.7

###### 2021/08/08

* `新增` 内存信息工具 (简易) (/tools/auto.js-memory-info-tool.js)
* `修复` 由项目自动管理的定时任务排他特性失效的问题
* `修复` Pro版本控件刷新滞缓造成部分条件判断失效的问题
* `修复` swipeAndShow方法内部逻辑错误导致功能失效的问题
* `修复` debugInfo方法强制标记参数可能不生效的问题
* `优化` 增加闹钟事件监测避免执行期间可能的闹钟误触 _[`issue #505`](https://github.com/SuperMonster003/Ant-Forest/issues/505)_
* `优化` 模块化与排行榜数据样本池相关的实例
* `优化` 及时回收图片资源避免可能的内存泄漏 _[`issue #497`](https://github.com/SuperMonster003/Ant-Forest/issues/497)_
* `优化` 能量雨收集工具条件判断完善及网络异常适配

# v2.1.6

###### 2021/07/19

* `新增` Root权限功能配置
* `修复` 模块交叉引用导致部分模块独立引用失败的问题
* `修复` 版本忽略管理匹配输入时结果可能出现错误的问题
* `修复` 配置工具设备通话状态值无法直接填入空闲值的问题
* `修复` 排行榜自定义标题无效导致初始状态准备失败的问题 _[`issue #498`](https://github.com/SuperMonster003/Ant-Forest/issues/498)_
* `修复` 排行榜页面更新导致的好友信息获取异常的问题 _[`issue #499`](https://github.com/SuperMonster003/Ant-Forest/issues/499)_
* `修复` 逛一逛方案获取排行榜倒计时可能出现空指针引用的问题
* `优化` 默认关闭Root权限结束应用防止Floaty结果显示异常
* `优化` 替换设备通话状态值获取方法的代码方案 (试优化)
* `优化` 逛一逛方案获取倒计时排行榜页面滚动速度
* `优化` 排行榜页面底部监测线程的内部检测逻辑

# v2.1.5

###### 2021/07/01

* `修复` 部分机型SettingNotFoundException异常并尝试自动修复 (试修) _[`issue #487`](https://github.com/SuperMonster003/Ant-Forest/issues/487)_ _[`#483`](https://github.com/SuperMonster003/Ant-Forest/issues/483)_
* `修复` imagesx.capt()可能返回falsy值的问题 (试修) _[`issue #488`](https://github.com/SuperMonster003/Ant-Forest/issues/488)_
* `修复` 前置应用横屏状态启动项目时屏幕数据异常的问题 _[`issue #489`](https://github.com/SuperMonster003/Ant-Forest/issues/489)_
* `修复` 部分Pro版本无法在锁屏页面获取布局信息的问题 _[`issue #486`](https://github.com/SuperMonster003/Ant-Forest/issues/486)_
* `修复` 部分Pro版本无法支持Floaty布局中fontFamily属性的问题
* `修复` 部分Pro版本进入排行榜后准备条件判断随机失效的问题
* `修复` $$sel.pickup()获取控件集合数量可能不准确的问题
* `修复` storagesx扩展模块remove方法功能失效的问题
* `优化` 解锁模块增加拨号盘阵列PIN解锁方案 (试验性)
* `优化` 重构$$sel.pickup()并摒除低概率功能及参数变量
* `优化` 静默脚本强制中止时"方法链"方法产生的错误日志
* `优化` 静默部分Pro版本对控制台日志文件模式参数产生的报警日志

# v2.1.4

###### 2021/06/25

* `修复` 部分Pro版本无法使用项目部署工具的问题 _[`issue #480`](https://github.com/SuperMonster003/Ant-Forest/issues/480)_
* `修复` 部分Pro版本运行项目时无法获取引擎名称的问题 _[`issue #481`](https://github.com/SuperMonster003/Ant-Forest/issues/481)_
* `修复` 部分Pro版本无法获取脚本文件路径配置信息的问题

# v2.1.3

###### 2021/06/21

* `修复` 森林主页出现复活能量球时无法自动收取的问题
* `修复` 项目部署工具下载项目数据包后可能出现的假死问题 (试修)
* `修复` 解锁功能在屏幕关闭事件触发后受到阻塞的问题
* `修复` 解锁功能在闹钟应用前置于锁屏页面时无法工作的问题
* `修复` 解锁功能在单次项目运行中连续使用出现的高失败率问题
* `修复` 屏幕关闭事件触发后排行榜底部监测线程未能阻塞的问题
* `优化` 提取devicex.screenOff()方法并优化内部逻辑
* `优化` 解锁功能"通用PIN容器"方案优化内部执行逻辑 _[`issue #463`](https://github.com/SuperMonster003/Ant-Forest/issues/463)_
* `优化` 截图权限申请方法的允许按钮自动点击增加兼容性 _[`issue #475`](https://github.com/SuperMonster003/Ant-Forest/issues/475)_
* `优化` 增加屏幕方向状态管理避免横屏启动时部分截图方法异常 _[`issue #477`](https://github.com/SuperMonster003/Ant-Forest/issues/477)_ _[`#471`](https://github.com/SuperMonster003/Ant-Forest/issues/471)_ _[`#468`](https://github.com/SuperMonster003/Ant-Forest/issues/468)_
* `优化` 能量雨收集工具优化识别条件并增加额外机会的自动处理

# v2.1.2

###### 2021/05/19

* `修复` 能量雨收集工具高概率出现截图权限申请失败的问题 _[`issue #467`](https://github.com/SuperMonster003/Ant-Forest/issues/467)_
* `修复` 支付宝应用控件变更导致主账户登录失败的问题
* `优化` 独立无障碍服务模块(a11y)及本地存储扩展模块(storage)
* `优化` 截图权限申请扩展方法在多线程等极端条件下的适应性

# v2.1.1

###### 2021/05/17

* `新增` 能量雨收集工具 (简易) (/tools/energy-rain-harvesting.js)
* `修复` 配置工具采集排行榜列表数据功能异常 _[`issue #462`](https://github.com/SuperMonster003/Ant-Forest/issues/462)_
* `修复` 部署工具备份本地项目时无法处理空项目目录的问题 _[`issue #459`](https://github.com/SuperMonster003/Ant-Forest/issues/459)_
* `优化` 完善Auto.js版本异常检测列表及异常提示界面样式
* `优化` 逛一逛按钮采集方案结束页面判断条件 _[`issue #391`](https://github.com/SuperMonster003/Ant-Forest/issues/391#issuecomment-840679845)_
* `优化` 去除"修改系统设置权限"辅助工具的模块依赖 _[`issue #465`](https://github.com/SuperMonster003/Ant-Forest/issues/465)_

# v2.1.0

###### 2021/04/15

* `新增` 增加"逛一逛按钮"采集策略 (默认为"排行榜列表"采集策略) _[`issue #449`](https://github.com/SuperMonster003/Ant-Forest/issues/449)_ _[`#446`](https://github.com/SuperMonster003/Ant-Forest/issues/446)_ _[`#391`](https://github.com/SuperMonster003/Ant-Forest/issues/391)_
* `修复` 解锁模块适配部分OPPO设备 (PIN方案)
* `修复` appx.checkAccessibility()无法在UI模式下使用的问题
* `修复` 森林页面暗色主题时浇水回赠能量球可能无法连续收取的问题
* `修复` 自定义黑名单好友数量较多时删除操作可能导致报错的问题
* `优化` 项目代码中所有尾逗号的处理 (Add when multiline)
* `优化` 清除好友森林页面统计能量数据时对于用户昵称的依赖 _[`issue #228`](https://github.com/SuperMonster003/Ant-Forest/issues/228)_  _[`#223`](https://github.com/SuperMonster003/Ant-Forest/issues/223)_  _[`#218`](https://github.com/SuperMonster003/Ant-Forest/issues/218)_
* `优化` 增加支付宝手势锁监听器并在触发后适时结束脚本 _[`issue #452`](https://github.com/SuperMonster003/Ant-Forest/issues/452)_

# v2.0.5

###### 2021/03/16

* `修复` 解锁功能配置参数无法获取默认值的问题 _[`issue #444`](https://github.com/SuperMonster003/Ant-Forest/issues/444)_
* `修复` 排行榜可点击样本位于屏幕底部区域时可能出现的点击偏移问题 _[`issue #443`](https://github.com/SuperMonster003/Ant-Forest/issues/443)_
* `优化` 运行提示对话框放弃任务时增加不再提示选项 _[`issue #445`](https://github.com/SuperMonster003/Ant-Forest/issues/445)_
* `优化` 清除配置工具参数文件中混入的非必要参数数据

# v2.0.4

###### 2021/03/15

* `修复` 好友森林动态列表首次展开后无法继续展开的问题 _[`issue #436`](https://github.com/SuperMonster003/Ant-Forest/issues/436)_
* `修复` 配置工具采集排行榜列表数据时可能会出现假死的问题
* `修复` 配置工具数据统计初始化时与日期范围默认值未联动的问题
* `优化` 分离高频读写参数到独立配置文件中降低配置文件损坏概率

# v2.0.3

###### 2021/03/10

* `修复` 切换支付宝语言时的代码逻辑错误及可能出现的管道破裂
* `修复` 主账户登录时弹出立即登录对话框可能导致登录失败的问题
* `修复` 统计排行榜列表最小倒计时数据时可能出现早于当前时刻的问题 _[`issue #439`](https://github.com/SuperMonster003/Ant-Forest/issues/439)_
* `修复` 意外保险机制次数累加器丢失累加判断条件的问题
* `修复` 排行榜复查关闭列表状态差异时会出现样本遗漏的问题 _[`issue #435`](https://github.com/SuperMonster003/Ant-Forest/issues/435)_
* `修复` 项目配置参数文件存取过程可能导致的乱码问题 (试修)
* `修复` 森林能量球识别区域采用动态比例值以兼容多分辨率机型 (试修) _[`issue #429`](https://github.com/SuperMonster003/Ant-Forest/issues/429)_
* `优化` 版本异常检测功能加入对Pro8不可用版本的检测
* `优化` 好友森林动态列表增加展开结果判断以增加展开成功率 _[`issue #436`](https://github.com/SuperMonster003/Ant-Forest/issues/436)_
* `优化` storage模块在高版本系统解析JSON时可自动修复乱码行

# v2.0.2

###### 2021/02/11

* `修复` 配置工具及Floaty结果的自动更新功能无效的问题
* `修复` 排行榜页面列表结尾的好友可能被跳过检查的问题
* `修复` 配置工具从列表选择应用时的数据筛选错误
* `修复` 高版本安卓设备可能无法判断系统应用的问题
* `优化` 增加主账户头像本地样本尺寸检测以防止尺寸越界

# v2.0.1

###### 2021/02/08 - 项目结构变更 谨慎升级

* `提示` 需要留意v2.0.1的项目更新功能可用性  
  · tools文件夹的项目部署工具 (可用)  
  · 配置工具的"从服务器还原" (可用)  
  · 配置工具的"关于"或"Snackbar" (故障)  
  · 项目运行结果展示时的更新悬浮窗 (故障)
* `提示` 解锁功能配置工具暂时被移除 (将在后续版本恢复)
* `新增` 自动检查更新功能/版本忽略功能及相关配置
* `新增` 排行榜页面的控件滑动策略及相关配置
* `新增` 运行结果展示支持版本更新提示及定时任务信息展示
* `修复` 好友森林动态列表未就绪导致页面判断失效的问题 _[`issue #423`](https://github.com/SuperMonster003/Ant-Forest/issues/423)_ _[`#420`](https://github.com/SuperMonster003/Ant-Forest/issues/420)_ _[`#418`](https://github.com/SuperMonster003/Ant-Forest/issues/418)_ _[`#416`](https://github.com/SuperMonster003/Ant-Forest/issues/416)_
* `修复` 好友森林动态列表未就绪导致能量罩信息获取失败的问题 _[`issue #425`](https://github.com/SuperMonster003/Ant-Forest/issues/425)_
* `修复` 解锁模块覆盖全局require方法后可能导致的功能异常
* `修复` 解锁模块加载外部模块方法的路径匹配错误
* `修复` 找能量向导遮罩导致主页能量球识别失效的问题
* `修复` 执行过程中能量罩倒计时失效后依然触发黑名单的问题
* `修复` 本地备份完成后可能导致本地备份配置信息丢失的问题
* `优化` 移除帮收功能相关的全部功能及配置选项
* `优化` 移除排行榜底部控件图片相关方法以提升兼容性
* `优化` 移除参数调整提示避免自动定时任务无法正常运行的情况
* `优化` 部分imagesx方法提供压缩等级参数以降低OOM出现概率