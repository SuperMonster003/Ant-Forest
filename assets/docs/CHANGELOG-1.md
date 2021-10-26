******

### 版本历史 - 1.x

******

# v1.9.25

###### 2020/11/18

* `修复` 配置工具还原初始设置时的空指针问题
* `修复` 配置工具控制台消息开关功能无效的问题
* `修复` 配置工具的开关依赖提示存在的部分异常
* `修复` 配置工具解锁功能无法设置图案解锁滑动时长的问题
* `优化` 配置工具增加解锁功能提示层检测方式配置选项
* `优化` 配置工具增加主页浇水回赠能量球检测开关选项
* `优化` 调整图片转换格式及压缩率减少内存占用
* `优化` 增加自动登录主账户的兼容性

# v1.9.24

###### 2020/11/10 - 不兼容旧版 谨慎升级

* `新增` 本地日志功能 (默认关闭) _[`issue #310`](https://github.com/SuperMonster003/Ant-Forest/issues/310#issuecomment-648965539)_
* `新增` 支持能量双击卡的识别及处理 _[`issue #403`](https://github.com/SuperMonster003/Ant-Forest/issues/403)_
* `修复` 蚂蚁森林改版后无法识别能量球的问题 (不兼容旧版) _[`issue #401`](https://github.com/SuperMonster003/Ant-Forest/issues/401)_
* `修复` 修改屏幕超时参数关屏策略执行时触碰屏幕导致参数恢复失败的问题
* `修复` 修改屏幕超时参数关屏策略按下音量键导致参数恢复提前终止的问题 _[`issue #407`](https://github.com/SuperMonster003/Ant-Forest/issues/407)_
* `修复` 主账户头像本地图片路径错误导致匹配失效的问题
* `修复` 消息提示功能与运行前提示对话框开关联动失效的问题
* `优化` 能量球识别过滤主页活动按钮区域 (近似区域)
* `优化` 六球复查采用同页面复查方式并摒弃相关配置 _[`issue #395`](https://github.com/SuperMonster003/Ant-Forest/issues/395)_
* `优化` 解锁模块适配部分MIUI设备 (解锁提示层方案)
* `优化` 缓存解锁模块图案解锁点阵布局信息以提升执行效率
* `优化` 项目启动时检查并自动修正异常的设备屏幕超时参数
* `优化` 配置工具统计功能支持长按删除单个统计条目功能
* `优化` 配置工具拖动条控件支持长按标题文字恢复默认值功能

# v1.9.23

###### 2020/10/16 - 代码重构 谨慎升级

* `修复` 从服务器恢复项目页面最多只显示近30个版本的问题
* `修复` 统计功能日期统计范围的全部天数数值计算错误的问题
* `修复` 主账户头像本地图片可能为纯绿色且会导致匹配及自动替换无效的问题
* `修复` 配置工具黑名单解除时间为"下次运行"时无法修改时间参数的问题
* `修复` 手动或自动延迟项目任务时旧自动定时任务依然留存的问题
* `修复` 屏幕关闭事件触发并超时后可能导致后续任务无限等待的问题
* `修复` 无障碍服务方法检测时可能导致界面元素受到影响的问题
* `修复` 连续两天使用能量罩的好友解析能量罩解除时间不准确的问题
* `修复` 扩展模块的load方法覆盖模块原有方法的问题
* `修复` TIMERS扩展模块queryIntentTasks方法对于免费版无效的问题
* `修复` DIALOGS扩展模块multiChoice方法内部的原生代码问题
* `修复` GLOBAL扩展模块检测原型属性时部分判断条件的引用错误
* `修复` getDisplay的cYx内部方法对负值坐标转换的结果错误
* `优化` 恢复好友森林页面的"PK面板"辅助统计功能
* `优化` 当能量罩有效时间大于一天时使用24小时解除间隔的兼容方式
* `优化` 连续运行时通过广播传递初始屏幕开关状态避免不必要的中途关屏 _[`issue #310`](https://github.com/SuperMonster003/Ant-Forest/issues/310#issue-613568483)_
* `优化` IMAGES模块重写原生requestScreenCapture防止多次调用导致阻塞
* `优化` 扩展模块全局对象名称追加字母"x"以区别于原生模块对象名称
* `优化` $$sel.pickup()方法重构并增加罗盘参数功能性
* `优化` TIMERS模块增加同步等待控制参数增强部分方法可用性
* `优化` Floaty倒计时去除不必要的Promise相关代码
* `优化` 分离列表类型数据以减轻数据存取时的文件读写压力
* `优化` 利用项目初始化时的Root权限状态避免不必要的功能试探
* `优化` 限制解锁失败时屏幕截图文件数量防止占用过多存储空间
* `优化` 缓解统计功能页面及项目备份还原页面可能的长时间阻塞
* `优化` 配置工具可自动扫描并补充显示有效的本地项目备份

# v1.9.22

###### 2020/06/25

* `修复` 配置工具无法修改延时接力任务区间的问题 _[`issue #364`](https://github.com/SuperMonster003/Ant-Forest/issues/364#issuecomment-649203097)_
* `修复` 排行榜列表底部的邀请按钮判断条件失效的问题
* `修复` 运行前提示对话框判断初始解锁状态时的逻辑错误
* `修复` 运行前提示对话框与保险任务功能之间的执行逻辑错误
* `修复` 复查后样本池未清理影响紧邻好友能量球识别效率的问题
* `优化` 因受制而顺延的任务在日志与配置工具中增加顺延标注 _[`issue #364`](https://github.com/SuperMonster003/Ant-Forest/issues/364#issuecomment-649471695)_
* `优化` Intent匹配组件优先级相同时使用包名过滤兼容双开应用 _[`issue #319`](https://github.com/SuperMonster003/Ant-Forest/issues/319)_ _[`#320`](https://github.com/SuperMonster003/Ant-Forest/issues/320)_
* `优化` 迁移部分功能方法至APP扩展模块中  
  · intent()  
  · startActivity()

# v1.9.21

###### 2020/06/24 - 代码重构 谨慎升级

* `修复` 森林主页可能将漂浮云朵误识别为能量球的问题 _[`issue #349`](https://github.com/SuperMonster003/Ant-Forest/issues/349)_
* `修复` 控件变更导致黑名单功能及统计功能出现异常的问题 _[`issue #355`](https://github.com/SuperMonster003/Ant-Forest/issues/355)_ _[`#356`](https://github.com/SuperMonster003/Ant-Forest/issues/356)_ _[`#357`](https://github.com/SuperMonster003/Ant-Forest/issues/357)_
* `修复` 主页能量球监测收取后可能出现无法停止监测的问题
* `修复` 解锁功能关闭后当设备亮屏但上锁时依然可解锁的问题
* `修复` Toast监控线程在出现能量球误识别情况时功能失效的问题
* `修复` 检测支付宝是否安装的方法内部引用错误 _[`issue #359`](https://github.com/SuperMonster003/Ant-Forest/issues/359)_ _[`#363`](https://github.com/SuperMonster003/Ant-Forest/issues/363)_
* `优化` 增加息屏或上锁启动时自动跳过选项以增强运行前提示对话框功能性 _[`issue #302`](https://github.com/SuperMonster003/Ant-Forest/issues/302)_
* `优化` 自动在需要时尝试修复配置文件中缺失的转义字符
* `优化` 能量球识别数据处理的线性插值方案的方法内部逻辑
* `优化` 解锁模块适配部分VIVO设备 (PIN方案) _[`issue #331`](https://github.com/SuperMonster003/Ant-Forest/issues/331)_
* `优化` 开放主页能量球返检监控配置选项
* `优化` 重新调整配置工具的功能页面及部分配置选项
* `优化` 重构$$sel.pickup()方法更正部分语义
* `优化` 移除主页橙色能量球降级时不必要的资源及时间占用
* `优化` 调整运行前提示对话框方法激活位置

# v1.9.20

###### 2020/06/09

* `修复` 使用Toast方式展示结果时脚本无法正常结束的问题
* `修复` 使用Floaty方式展示结果过程可能出现无响应的问题
* `修复` README.md使用插件格式化后可能的非预期显示问题
* `修复` 主页成熟能量球收取完毕后未更新样本缓存的问题
* `修复` 排行榜样本池差异检测时可能造成内存不足的问题 (试修) _[`issue #346`](https://github.com/SuperMonster003/Ant-Forest/issues/346)_
* `修复` 浇水能量球误匹配时出现无限循环等待的问题 _[`issue #341`](https://github.com/SuperMonster003/Ant-Forest/issues/341)_
* `修复` 主页成熟能量球可能误升级为橙色球的问题 _[`issue #344`](https://github.com/SuperMonster003/Ant-Forest/issues/344)_
* `优化` 通过限制识别范围降低能量球识别的误判率
* `优化` 放宽baiduOCR()的原始数据筛选条件 _[`issue #343`](https://github.com/SuperMonster003/Ant-Forest/issues/343)_

# v1.9.19

###### 2020/06/05 - 代码重构 谨慎升级

* `新增` 能量球识别测试工具 (简易) (/tools/energy-balls-recognition-inspector.js)
* `修复` 主页能量球控件出现延时导致检测异常的问题 _[`issue #312`](https://github.com/SuperMonster003/Ant-Forest/issues/312)_ _[`#321`](https://github.com/SuperMonster003/Ant-Forest/issues/321)_
* `修复` 潜在的进入好友森林页面超时的问题 _[`issue #315`](https://github.com/SuperMonster003/Ant-Forest/issues/315)_ _[`#324`](https://github.com/SuperMonster003/Ant-Forest/issues/324)_ _[`#329`](https://github.com/SuperMonster003/Ant-Forest/issues/329)_
* `修复` 解锁模块解锁计数器失效的问题 _[`issue #305`](https://github.com/SuperMonster003/Ant-Forest/issues/305)_
* `修复` 森林主页无法自动关闭森林树对话框的问题
* `修复` 增加engines扩展解决execArgs对象无法解析JavaObject的问题
* `修复` 收取/帮收功能开关配置在好友森林页面无效的问题 _[`issue #311`](https://github.com/SuperMonster003/Ant-Forest/issues/311)_
* `修复` 无障碍服务方法无法处理非字串类型列表结果的问题 _[`issue #308`](https://github.com/SuperMonster003/Ant-Forest/issues/308)_
* `修复` 解锁模块引用其他模块时可能出现路径无效的问题
* `修复` ext-global模块污染对象枚举数据的问题
* `修复` 参数调整提示对话框配置后未能自动运行项目的问题
* `修复` 配置工具采集排行榜列表数据时可能触发HOME键的问题 _[`issue #334`](https://github.com/SuperMonster003/Ant-Forest/issues/334)_
* `修复` 登录时若主账户不在快捷列表中可能出现无限等待的问题
* `修复` 关闭列表状态差异复查条件时可能导致排行榜无限复查的问题
* `修复` 启动器自动开启无障碍成功后不显示运行提示对话框的问题
* `修复` Beta版本存在的新生问题  
  · 时间范围选择器设置较大日期值可能导致时间戳值异常的问题  
  · 时间范围选择器点击返回按钮可能出现上级对话框消失的问题  
  · 能量球捕获区域坐标值变换异常甚至越界的问题 _[`issue #303`](https://github.com/SuperMonster003/Ant-Forest/issues/303#issuecomment-634446386)_ _[`#315`](https://github.com/SuperMonster003/Ant-Forest/issues/315)_ _[`#316`](https://github.com/SuperMonster003/Ant-Forest/issues/316)_ _[`#321`](https://github.com/SuperMonster003/Ant-Forest/issues/321)_ _[`#338`](https://github.com/SuperMonster003/Ant-Forest/issues/338)_  
  · 开发者消息提示开关异常问题  
  · 解锁功能无法配置的问题 _[`issue #323`](https://github.com/SuperMonster003/Ant-Forest/issues/323)_ _[`#336`](https://github.com/SuperMonster003/Ant-Forest/issues/336)_  
  · 能量球识别测试工具无法运行的问题  
  · 帮收功能有效时段设置功能失效的问题
* `优化` Auto.js版本检测提示逻辑及兼容性 _[`issue #322`](https://github.com/SuperMonster003/Ant-Forest/issues/322)_
* `优化` 无障碍服务相关的提示对话框显示逻辑
* `优化` 提升从服务器下载/还原项目时的文件读写速度
* `优化` 重构DEVICE模块的getDisplay方法
* `优化` 图案解锁的密码简化方法内部逻辑
* `优化` 去除森林主页控件最大准备时间配置选项
* `优化` 去除好友森林页面的"PK面板"判断条件 _[`issue #315`](https://github.com/SuperMonster003/Ant-Forest/issues/315)_ _[`#324`](https://github.com/SuperMonster003/Ant-Forest/issues/324)_ _[`#329`](https://github.com/SuperMonster003/Ant-Forest/issues/329)_
* `优化` 迁移部分功能方法至FILES扩展模块中  
  · zip()  
  · unzip()  
  · copyFolder()

# v1.9.18

###### 2020/05/01

* `修复` 好友森林主页控件变更导致能量球识别失败的问题 (粗修) _[`issue #119`](https://github.com/SuperMonster003/Ant-Forest/issues/119)_ _[`#292`](https://github.com/SuperMonster003/Ant-Forest/issues/292)_ _[`#301`](https://github.com/SuperMonster003/Ant-Forest/issues/301)_ _[`#303`](https://github.com/SuperMonster003/Ant-Forest/issues/303)_
* `修复` 判断能量罩时可能出现的图像被回收问题 _[`issue #299`](https://github.com/SuperMonster003/Ant-Forest/issues/299)_
* `修复` 解锁模块"确定"按钮可能匹配到非预期控件的问题
* `修复` 简化图案解锁密码时可能导致关键点丢失的问题
* `修复` 设备切换分辨率时导致排行榜无法识别图标的问题

# v1.9.17

###### 2020/04/26

* `新增` 自动开启无障碍服务功能及配置 (默认禁用) _[`issue #262`](https://github.com/SuperMonster003/Ant-Forest/issues/262)_
* `修复` 账户登录成功判断逻辑错误
* `修复` 账户列表跳转触发安全限制的问题 _[`issue #296`](https://github.com/SuperMonster003/Ant-Forest/issues/296)_
* `修复` 安卓7.x不支持java.time包的问题
* `修复` 排行榜倒计时数据可能出现的统计偏差问题 _[`issue #293`](https://github.com/SuperMonster003/Ant-Forest/issues/293)_
* `修复` 定时任务自动更新时未更新任务类型的问题
* `修复` ext-global模块污染对象枚举数据的问题
* `修复` 排行榜滑动遇到20整倍可能无法滑动的问题 (试修) _[`issue #149`](https://github.com/SuperMonster003/Ant-Forest/issues/149)_ _[`#236`](https://github.com/SuperMonster003/Ant-Forest/issues/236)_
* `优化` 无障碍服务关闭时使用功能提示替代报错终止
* `优化` 为auto.waitFor()增加超时检测

# v1.9.16

###### 2020/04/21 - 代码重构 谨慎升级

* `新增` 数据统计功能及配置 (基于SQLite) _[`issue #91`](https://github.com/SuperMonster003/Ant-Forest/issues/91#issue-486773073)_
* `新增` 定时任务自动管理功能的有效时段配置 _[`issue #265`](https://github.com/SuperMonster003/Ant-Forest/issues/265)_
* `修复` 定时任务控制面板任务类型的引用异常 _[`issue #269`](https://github.com/SuperMonster003/Ant-Forest/issues/269)_
* `修复` 黑名单中存在异常数据时导致项目无法运行的问题
* `修复` 动态列表项目过多可能出现的采集能量罩信息失败问题 _[`issue #288`](https://github.com/SuperMonster003/Ant-Forest/issues/288#issuecomment-616518748)_
* `修复` 前置应用黑名单触发后可能丢失自动推迟任务的问题
* `修复` 重构造成的解锁模块缓冲丢失导致解锁易失败的问题 _[`issue #265`](https://github.com/SuperMonster003/Ant-Forest/issues/265)_
* `修复` Bug版本检测方法缺失阻塞导致流程失控的问题
* `修复` 图形配置工具退出前清理对话框数据的代码错误 _[`issue #274`](https://github.com/SuperMonster003/Ant-Forest/issues/274)_
* `修复` 部分机型系统语言为英文时不能自动解锁的问题 _[`pr #290`](https://github.com/SuperMonster003/Ant-Forest/pull/290)_
* `修复` 屏幕关闭后阻塞事件无法自动解除的问题
* `优化` launchThisApp()中判断屏幕方向方法内部逻辑 _[`issue #264`](https://github.com/SuperMonster003/Ant-Forest/issues/264)_
* `优化` 尽可能减少比较屏幕截图时的内存占用并及时回收
* `优化` 获取统计数据所需的用户昵称优先使用排行榜方案 _[`issue #228`](https://github.com/SuperMonster003/Ant-Forest/issues/228)_
* `优化` 自动定时任务移除等待结果阻塞并增加结果超时检测
* `优化` 配置页面更新内容中残余换行符的处理
* `优化` 主页遮罩层监测方法的兼容性
* `优化` 主页能量球收取异常值检测

# v1.9.15

###### 2020/02/23 - 代码重构 谨慎升级

* `修复` 通话状态监测开关失效的问题
* `优化` 迁移部分功能方法至DEVICE扩展模块中  
  · getDisplayParams()  
  · phoneCallingState()  
  · setDeviceProto()  
  · vibrateDevice()
* `优化` 森林主页彩虹对话框出现时可自动关闭
* `优化` 修改屏幕超时参数关屏策略的内部逻辑
* `优化` 修改屏幕超时参数关屏策略增加屏幕/按键事件处理
* `优化` 重写全局toast方法实现长时显示与插队显示功能
* `优化` 修正启动器的timeStr方法内部逻辑以方便复用
* `优化` 调整滑动方法内部滑动时长默认值避免非预期的惯性滑动
* `优化` 音量键按下停止脚本时拦截原有音量调节功能

# v1.9.14

###### 2020/02/02

* `修复` 主账户头像匹配失败后脚本无法继续的问题
* `修复` 图形配置工具开关初始化状态为关闭时未能隐藏子控件的问题
* `修复` 解锁模块密码布局控件逻辑错误导致流程提前终止的问题 _[`issue #252`](https://github.com/SuperMonster003/Ant-Forest/issues/252)_
* `优化` 好友森林页面返回排行榜判断逻辑
* `优化` 黑名单检测采用先trim后匹配的方式 _[`issue #250`](https://github.com/SuperMonster003/Ant-Forest/issues/250)_
* `优化` 解锁模块适配部分OPPO设备 (ColorOS系统/PIN方案) _[`issue #251`](https://github.com/SuperMonster003/Ant-Forest/issues/251#issuecomment-580312460)_

# v1.9.13

###### 2020/01/29

* `修复` 黑名单功能内部逻辑错误与配置关联错误 _[`issue #250`](https://github.com/SuperMonster003/Ant-Forest/issues/250)_
* `修复` 图形配置工具黑名单数据加载越界的问题 _[`issue #250`](https://github.com/SuperMonster003/Ant-Forest/issues/250)_
* `修复` 图形配置工具黑名单列表数据排序异常
* `修复` Array.prototype.includes对NaN类型的判断错误
* `修复` 解锁模块的强制debugInfo标志参数无效的问题
* `修复` 解锁模块缺失全局阻塞方法导致解锁中断的问题 _[`issue #251`](https://github.com/SuperMonster003/Ant-Forest/issues/251)_ _[`#252`](https://github.com/SuperMonster003/Ant-Forest/issues/252)_
* `优化` 解锁模块唤醒屏幕功能去除兼容性较差的keycode方法 _[`issue #251`](https://github.com/SuperMonster003/Ant-Forest/issues/251)_

# v1.9.12

###### 2020/01/24 - 代码重构 谨慎升级

* `新增` 主页浇水回赠能量球(金色球)自动收取功能 _[`issue #193`](https://github.com/SuperMonster003/Ant-Forest/issues/193)_ _[`#239`](https://github.com/SuperMonster003/Ant-Forest/issues/239)_
* `修复` 好友森林金色球干扰收取/复查/统计等操作的问题 _[`issue #193`](https://github.com/SuperMonster003/Ant-Forest/issues/193)_
* `修复` 主页能量球返检监控可能失效的问题
* `修复` 主页能量球连续监测时数据统计错误的问题
* `修复` 主页能量球返检时可能因数据无效而重复检查的问题
* `修复` 排行榜初始化后未进行首页样本采集的问题
* `修复` 潜在的能量球监测线程样本提前被收回的问题
* `修复` 排行榜样本池可能出现的视觉库传参异常问题 (试修) _[`issue #240`](https://github.com/SuperMonster003/Ant-Forest/issues/240)_
* `修复` 排行榜样本池对于服务器打瞌睡页面的误判问题
* `修复` 排行榜模拟滑动可能无法被控件响应的问题 (试修) _[`issue #236`](https://github.com/SuperMonster003/Ant-Forest/issues/236)_
* `修复` 图形配置工具列表页面初始化排序可能失效的问题
* `修复` 参数调整提示对话框配置后下次运行依然提示的问题
* `修复` 设备未加密情况下解锁模块无法正常工作的问题
* `修复` 密文字典模块处理16/32位Unicode字符的问题
* `修复` 能量罩样本提前回收导致橙色球识别效率低的问题
* `修复` 密文字典模块处理单字节字符串的问题
* `优化` 解锁模块代码重构
* `优化` 密文字典模块代码重构
* `优化` 提升能量球操作数据统计效率
* `优化` 更新帮收能量球识别方案并提高识别率 _[`issue #204`](https://github.com/SuperMonster003/Ant-Forest/issues/204#issuecomment-570038197)_ _[`#232`](https://github.com/SuperMonster003/Ant-Forest/issues/232)_
* `优化` 使用模板匹配方案匹配排行榜可收取图标 _[`issue #152`](https://github.com/SuperMonster003/Ant-Forest/issues/152)_ _[`#156`](https://github.com/SuperMonster003/Ant-Forest/issues/156)_ _[`#200`](https://github.com/SuperMonster003/Ant-Forest/issues/200)_ _[`#224`](https://github.com/SuperMonster003/Ant-Forest/issues/224)_
* `优化` 增强截图权限申请自动点击按钮的兼容性 _[`issue #246`](https://github.com/SuperMonster003/Ant-Forest/issues/246)_
* `优化` 增加排行榜列表底部模板的高度值异常检测 _[`issue #248`](https://github.com/SuperMonster003/Ant-Forest/issues/248)_
* `优化` 启动跳板关闭时跳过跳板状态记录以提升运行效率
* `优化` 配置工具的项目创建时间统一修改为本地发布时间
* `优化` 图形配置工具增强检查更新的稳定性和效率  
  · java.net.HttpURLConnection替代Auto.js的http全局方法  
  · blob数据格式替代GitHub的raw数据格式

# v1.9.11

###### 2020/01/02

* `修复` 潜在的截图方向受设备屏幕旋转设置影响的问题
* `修复` 排行榜底部监测线程的控件有效性判断失误问题
* `修复` 排行榜初始化后容易错过第一页好友采集的问题
* `修复` 图形配置工具能量球点击间隔范围限定异常问题 _[`issue #204`](https://github.com/SuperMonster003/Ant-Forest/issues/204#issuecomment-570038197)_
* `修复` 图形配置工具列表数据排序导致数组越界的问题 _[`issue #181`](https://github.com/SuperMonster003/Ant-Forest/issues/181)_ _[`#182`](https://github.com/SuperMonster003/Ant-Forest/issues/182)_ _[`#184`](https://github.com/SuperMonster003/Ant-Forest/issues/184)_ _[`#205`](https://github.com/SuperMonster003/Ant-Forest/issues/205)_ _[`#207`](https://github.com/SuperMonster003/Ant-Forest/issues/207)_ _[`#212`](https://github.com/SuperMonster003/Ant-Forest/issues/212)_
* `修复` 图形配置工具列表页面全选按钮关联错误的问题
* `修复` 图形配置工具检查更新经常出现的检查失败问题

# v1.9.10

###### 2020/01/01

* `修复` clickAction()的press策略无效的问题
* `修复` messageAction()同类分割线去重可能的异常
* `修复` observeToastMessage()导致按键监听器失效的问题 _[`issue #189`](https://github.com/SuperMonster003/Ant-Forest/issues/189)_
* `修复` Schema方式启动App时对象类子参数首项无效的问题
* `修复` THREADS模块可能阻塞UI线程的问题
* `修复` waitForAction() 传入错误参数类型导致的异常 _[`issue #173`](https://github.com/SuperMonster003/Ant-Forest/issues/173)_ _[`#176`](https://github.com/SuperMonster003/Ant-Forest/issues/176)_
* `修复` waitForAndClickAction()控件参数为空时的异常
* `修复` Dollar符号全局变量污染Pro7和Pro8版本的问题
* `修复` 保险任务逻辑错误导致连续性任务丢失或堆积问题 _[`issue #172`](https://github.com/SuperMonster003/Ant-Forest/issues/172)_ _[`#175`](https://github.com/SuperMonster003/Ant-Forest/issues/175)_ _[`#203`](https://github.com/SuperMonster003/Ant-Forest/issues/203)_
* `修复` 单次滑动异常导致脚本无法继续的问题
* `修复` 图形配置工具findViewByTag()的内部逻辑错误
* `修复` 图形配置工具列表页面排序功能失效的问题
* `修复` 图形配置工具刷新排行榜好友列表功能失效的问题 _[`issue #168`](https://github.com/SuperMonster003/Ant-Forest/issues/168)_
* `修复` 意外保险定时任务计数器未能及时清除的问题
* `修复` 排行榜初始化后容易错过第一页好友采集的问题
* `修复` 排行榜最小倒计时数据统计失效的问题 _[`issue #153`](https://github.com/SuperMonster003/Ant-Forest/issues/153)_
* `修复` 检测主页能量球倒计时可能出现控件复检遗漏的问题 _[`issue #191`](https://github.com/SuperMonster003/Ant-Forest/issues/191)_ _[`#203`](https://github.com/SuperMonster003/Ant-Forest/issues/203)_
* `修复` 能量球点击间隔配置与功能的映射错误问题
* `修复` 返回好友排行榜失败且无限在好友森林页面滑动的问题 _[`issue #208`](https://github.com/SuperMonster003/Ant-Forest/issues/208)_
* `修复` 获取能量罩使用时间时可能出现无效布局节点的问题 _[`issue #225`](https://github.com/SuperMonster003/Ant-Forest/issues/225)_
* `修复` Beta版本存在的截图权限申请频繁失败的问题 _[`issue #206`](https://github.com/SuperMonster003/Ant-Forest/issues/206)_ _[`#213`](https://github.com/SuperMonster003/Ant-Forest/issues/213)_ _[`#218`](https://github.com/SuperMonster003/Ant-Forest/issues/218)_ _[`#220`](https://github.com/SuperMonster003/Ant-Forest/issues/220)_ _[`#223`](https://github.com/SuperMonster003/Ant-Forest/issues/223)_
* `优化` getDisplayParams()增加全局变量控制参数
* `优化` 监测并自动尝试关闭蚂蚁森林主页遮罩层 _[`issue #161`](https://github.com/SuperMonster003/Ant-Forest/issues/161)_
* `优化` 全局事件监听触发与恢复逻辑
* `优化` 提升Pro7版本的项目初始化速度
* `优化` 好友排行榜初始状态准备条件设定 _[`issue #158`](https://github.com/SuperMonster003/Ant-Forest/issues/158)_ _[`#164`](https://github.com/SuperMonster003/Ant-Forest/issues/164)_ _[`#165`](https://github.com/SuperMonster003/Ant-Forest/issues/165)_ _[`#166`](https://github.com/SuperMonster003/Ant-Forest/issues/166)_ _[`#179`](https://github.com/SuperMonster003/Ant-Forest/issues/179)_ _[`#180`](https://github.com/SuperMonster003/Ant-Forest/issues/180)_ _[`#186`](https://github.com/SuperMonster003/Ant-Forest/issues/186)_ _[`#197`](https://github.com/SuperMonster003/Ant-Forest/issues/197)_ _[`#199`](https://github.com/SuperMonster003/Ant-Forest/issues/199)_ _[`#201`](https://github.com/SuperMonster003/Ant-Forest/issues/201)_ _[`#204`](https://github.com/SuperMonster003/Ant-Forest/issues/204)_ _[`#215`](https://github.com/SuperMonster003/Ant-Forest/issues/215)_
* `优化` 排行榜页面前置判断逻辑 _[`issue #148`](https://github.com/SuperMonster003/Ant-Forest/issues/148)_ _[`#150`](https://github.com/SuperMonster003/Ant-Forest/issues/150)_ _[`#155`](https://github.com/SuperMonster003/Ant-Forest/issues/155)_ _[`#157`](https://github.com/SuperMonster003/Ant-Forest/issues/157)_ _[`#160`](https://github.com/SuperMonster003/Ant-Forest/issues/160)_ _[`#161`](https://github.com/SuperMonster003/Ant-Forest/issues/161)_ _[`#163`](https://github.com/SuperMonster003/Ant-Forest/issues/163)_ _[`#210`](https://github.com/SuperMonster003/Ant-Forest/issues/210)_
* `优化` 捕获可能的线程集合并发修改异常 (仅捕获) _[`issue #183`](https://github.com/SuperMonster003/Ant-Forest/issues/183)_
* `优化` 摒弃"排行榜自动展开"功能 _[`issue #209`](https://github.com/SuperMonster003/Ant-Forest/issues/209)_
* `优化` 摒弃"运行失败自动重试"功能
* `优化` 摒弃排行榜样本采集策略配置 (统一策略)
* `优化` 调整"启动跳板"功能默认为关闭状态
* `优化` 整合tryRequestScreenCapture()到IMAGES扩展模块中
* `优化` 排行榜页面跳转逻辑 _[`issue #194`](https://github.com/SuperMonster003/Ant-Forest/issues/194)_
* `优化` 启动工具深度代码重构

# v1.9.9

###### 2019/11/28 - 代码重构 谨慎升级

* `修复` 好友排行榜变更"周/总排行榜"后无法适配新控件的问题 (试修) _[`issue #143`](https://github.com/SuperMonster003/Ant-Forest/issues/143)_ _[`#144`](https://github.com/SuperMonster003/Ant-Forest/issues/144)_ _[`#145`](https://github.com/SuperMonster003/Ant-Forest/issues/145)_ _[`#146`](https://github.com/SuperMonster003/Ant-Forest/issues/146)_
* `修复` 图形配置工具下载项目进度可能无法显示的问题
* `修复` 图形配置工具主页能量球返检监控子页面丢失的问题
* `修复` 图形配置工具主账户信息弹出页面丢失的问题
* `优化` 解锁模块PIN解锁方案增加Realme X机型适配 _[`issue #135`](https://github.com/SuperMonster003/Ant-Forest/issues/135)_
* `优化` 图形配置工具部分代码重构

# v1.9.8

###### 2019/11/24

* `修复` 好友森林数据面板可能返回错误统计结果的问题
* `修复` 图形配置工具可能出现页面加载不完全的问题 _[`issue #137`](https://github.com/SuperMonster003/Ant-Forest/issues/137)_
* `修复` 图形配置工具部分机型按钮控件没有右对齐显示的问题
* `修复` 工具函数模块的debugInfo()可能出现传入参数无效的问题
* `优化` 图形配置工具下载项目进度增加正常显示概率并显示文件大小
* `优化` 图形配置工具主页面控件加载逻辑及显示速度 _[`issue #137`](https://github.com/SuperMonster003/Ant-Forest/issues/137#issuecomment-555830567)_
* `优化` timeRecorder()增加智能结果参数

# v1.9.7

###### 2019/11/21

* `修复` 图形配置工具检索输入无法区分正则表达式的问题 (输入"#REGEXP#"激活)
* `修复` 森林主页样本过早回收导致OCR方案重新获取倒计时数据失败的问题 _[`issue #134`](https://github.com/SuperMonster003/Ant-Forest/issues/134#issuecomment-556751787)_ _[`#138`](https://github.com/SuperMonster003/Ant-Forest/issues/138)_
* `优化` 解锁模块可使用单独的开关用于控制解锁过程的日志显示
* `优化` 使用字节缓冲流极大提升压缩与解压缩时的数据读写效率

# v1.9.6

###### 2019/11/19

* `新增` 前置应用黑名单功能及配置 _[`issue #124`](https://github.com/SuperMonster003/Ant-Forest/issues/124)_
* `修复` 解锁模块"完成"按钮可能匹配到非预期控件的问题 _[`issue #122`](https://github.com/SuperMonster003/Ant-Forest/issues/122#issuecomment-554196110)_
* `修复` debugInfo()的"虚线"参数解析异常的问题
* `修复` checkSdkAndAJVer()可能导致图形配置工具无法连续运行的问题
* `修复` 采集自己能量倒计时的多方案协同可能无效的问题 _[`issue #134`](https://github.com/SuperMonster003/Ant-Forest/issues/134#issuecomment-554689593)_
* `修复` 排行榜底部特例可能导致布局分析策略点击失效的问题 _[`issue #134`](https://github.com/SuperMonster003/Ant-Forest/issues/134#issuecomment-554689593)_
* `修复` 部分机型无法动态获取准确的设备通话状态值的问题
* `优化` 替换图形配置工具中自定义黑名单的手动输入方式为检索选择方式
* `优化` 使用安卓系统API替代shell()方式获取SDK版本
* `优化` parseAppName()使用缓存机制增加重复查询效率

# v1.9.5

###### 2019/11/14

* `新增` 项目启动前的模块文件检查并提供缺失的模块提示
* `新增` 独立的解锁参数配置工具 (./tools/unlock-config-tool.js)
* `修复` UiObject对象可能出现的bounds属性丢失问题 _[`issue #117`](https://github.com/SuperMonster003/Ant-Forest/issues/117#issuecomment-552169450)_
* `修复` 主线程出现致命错误时未能在日志中显示详细的代码定位信息问题
* `修复` 解锁模块出现屏幕外部的干扰按钮控件时可能导致脚本无法继续的问题 _[`issue #122`](https://github.com/SuperMonster003/Ant-Forest/issues/122)_
* `修复` OpenCV内存泄露导致Auto.js崩溃或项目无法运行的问题 (试修) _[`issue #81`](https://github.com/SuperMonster003/Ant-Forest/issues/81)_ _[`#118`](https://github.com/SuperMonster003/Ant-Forest/issues/118)_ _[`#123`](https://github.com/SuperMonster003/Ant-Forest/issues/123)_
* `修复` 布局分析策略循环进入同一个好友森林的问题 (试修) _[`issue #72`](https://github.com/SuperMonster003/Ant-Forest/issues/72)_ _[`#97`](https://github.com/SuperMonster003/Ant-Forest/issues/97)_ _[`#100`](https://github.com/SuperMonster003/Ant-Forest/issues/100)_
* `修复` 布局分析策略中途无法继续滑动的问题 (试修) _[`issue #74`](https://github.com/SuperMonster003/Ant-Forest/issues/74)_ _[`#107`](https://github.com/SuperMonster003/Ant-Forest/issues/107)_ _[`#109`](https://github.com/SuperMonster003/Ant-Forest/issues/109)_
* `优化` 独立解锁模块 (./modules/mod-unlock.js) _[`issue #3`](https://github.com/SuperMonster003/Ant-Forest/issues/3)_ _[`#28`](https://github.com/SuperMonster003/Ant-Forest/issues/28)_

# v1.9.4

###### 2019/11/07

* `修复` 蚂蚁森林主页活动入口按钮误判为能量球的问题 _[`issue #117`](https://github.com/SuperMonster003/Ant-Forest/issues/117)_
* `修复` 自己能量倒计时数据无效时可能依然进行能量球监测的问题 _[`issue #117`](https://github.com/SuperMonster003/Ant-Forest/issues/117)_
* `修复` 解析nfe文件内容异常时将导致脚本无法继续的问题 (试修) _[`issue #114`](https://github.com/SuperMonster003/Ant-Forest/issues/114)_
* `优化` 监测并自动尝试关闭蚂蚁森林主页遮罩层
* `优化` 解锁模块密码输入后的确认按钮匹配样本 _[`issue #105`](https://github.com/SuperMonster003/Ant-Forest/issues/105#issuecomment-536854045)_
* `优化` 增大通话状态监测功能的有效范围
* `优化` messageAction()同类分割线去重逻辑
* `优化` Auto.js及安卓SDK版本检查逻辑 _[`issue #115`](https://github.com/SuperMonster003/Ant-Forest/issues/115#issue-511850173)_
* `优化` 部分工具函数模块化  
  · classof()  
  · checkSdkAndAJVer()

# v1.9.3

###### 2019/09/30

* `修复` Floaty展示统计结果时可能卡住的问题
* `优化` 解锁模块密码解锁方案增加部分机型适配 _[`issue #105`](https://github.com/SuperMonster003/Ant-Forest/issues/105#issuecomment-536193297)_

# v1.9.2

###### 2019/09/28

* `新增` 蚂蚁森林主页能量倒计时数据获取失败时的备用方案 (OCR) _[`issue #90`](https://github.com/SuperMonster003/Ant-Forest/issues/90#event-2596229852)_ _[`#94`](https://github.com/SuperMonster003/Ant-Forest/issues/94#issuecomment-529812615)_
* `修复` tryRequestScreenCapture()可能无法自动点击按钮的问题 _[`issue #93`](https://github.com/SuperMonster003/Ant-Forest/issues/93)_
* `修复` 控制台日志中自己能量最小倒计时分钟数据统计错误的问题
* `修复` 图形配置工具切换页面时可能出现页面丢失的问题 _[`issue #102`](https://github.com/SuperMonster003/Ant-Forest/issues/102)_
* `修复` launch_rank_list计划click_list_more_btn方案可能无法定位按钮的问题 _[`issue #101`](https://github.com/SuperMonster003/Ant-Forest/issues/101#issuecomment-534826468)_
* `优化` Floaty悬浮窗结果展示倒计时方法内部逻辑
* `优化` 利用setTimeout()超时调用方法实现间歇调用方法
* `优化` 部分工具函数模块化  
  · baiduOcr()  
  · setIntervalBySetTimeout()

# v1.9.1

###### 2019/09/24

* `修复` 支付宝 `v10.1.75.7000` 进入及返回好友排行榜失败的问题 _[`issue #98`](https://github.com/SuperMonster003/Ant-Forest/issues/98#issue-496619668)_ _[`#99`](https://github.com/SuperMonster003/Ant-Forest/issues/99#issue-497458889)_
* `修复` 英文语言环境可能无法完成自动登录或语言切换的问题
* `修复` 打开账户切换页面的备用方案可能无法生效的问题
* `修复` 安卓 8.0 以下 (sdk < 26) 无法正常使用日期控件监听器的问题

# v1.9.0

###### 2019/09/23

* `新增` 账户功能  
  · 主账户设置  
  · 旧账户回切
* `新增` 图案解锁滑动策略配置
* `新增` 六球复查功能及配置
* `新增` 定时任务控制面板配置 _[`issue #94`](https://github.com/SuperMonster003/Ant-Forest/issues/94#issue-491200331)_
* `新增` 通过修改Provider数据实现的备用关屏策略 _[`issue #91`](https://github.com/SuperMonster003/Ant-Forest/issues/91#issuecomment-526104939)_ _[`#96`](https://github.com/SuperMonster003/Ant-Forest/issues/96#issue-495593070)_
* `修复` 获取好友能量罩剩余时间值无效或长时间停顿的问题 _[`issue #92`](https://github.com/SuperMonster003/Ant-Forest/issues/92#issue-488893465)_
* `修复` 提示层页面上滑时长默认值不在有效范围内的问题
* `修复` 提示层页面上滑时QQ消息弹框导致上滑失败的问题
* `修复` 图形配置工具保存后可能导致解锁模块配置丢失的问题
* `修复` Floaty悬浮窗结果展示倒计时可能卡住的问题
* `修复` 图形配置工具存在依赖关系的子页面可能失去页面关联的问题
* `修复` 图形配置工具连续快速点击可能导致页面切换异常的问题
* `修复` restartThisEngine()强制停止旧任务可能误杀当前任务的问题
* `修复` smoothScrollPage()内部的setInterval()无法停止的问题
* `修复` 提示层上滑失败导致设置值丢失的问题 (使用可信度机制)
* `修复` launchAFHomepage计划search_by_kw方案无法找到关键词的问题
* `修复` 获取好友列表数据后容易出现的自动展示列表失败的问题
* `修复` 布局分析策略从好友森林返回排行榜可能出现误判的问题
* `修复` 获取好友列表数据后"resume"监听器依然工作且可能叠加调用的问题
* `修复` timers模块涉及阻塞方法时可能导致UI线程异常退出的问题
* `优化` 增加images对象的回收率 (试优化)
* `优化` 增强模拟返回建返回上一页方法的兼容性
* `优化` 引擎参数加入no_insurance_flag防止不必要的自动保险任务
* `优化` 完善图形配置工具版本历史更新内容正则匹配的"pattern"参数
* `优化` 部分工具函数模块化  
  · setDeviceProto()  
  · vibrateDevice()  
  · clickActionsPipeline()  
  · timeFlagToDaysOfWeek()
* `优化` $$sel.pickup()代码重构并摒弃$$sel.selStr()
* `优化` 自动简化图案解锁密码 (如"1235789"简化为"1379")
* `优化` 增强tryRequestScreenCapture()兼容性
* `优化` 增强debugInfo()功能并优化内部逻辑
* `优化` 图形配置工具Activity结束时的内存回收方法
* `优化` 图形配置工具初始化期间切换页面的响应速度
* `优化` 图形配置工具强制竖屏防止布局错乱及页面切换异常
* `优化` 增强截图权限申请自动点击按钮的兼容性 _[`issue #93`](https://github.com/SuperMonster003/Ant-Forest/issues/93#issue-490827208)_
* `优化` 使用Promise方法优化部分异步操作

# v1.8.4

###### 2019/08/16

* `新增` 捐赠二维码 (开发者个人页面长按 `CLOSE` 按钮) _[`issue #78`](https://github.com/SuperMonster003/Ant-Forest/issues/78#issue-479526561)_
* `新增` 排行榜列表底部控件图片模板配置 (查看/删除) _[`issue #82`](https://github.com/SuperMonster003/Ant-Forest/issues/82#issue-480555099)_
* `新增` 支付宝应用启动跳板功能及配置 _[`issue #80`](https://github.com/SuperMonster003/Ant-Forest/issues/80#issue-479543940)_
* `新增` Floaty悬浮窗结果展示遮罩层 (点击可立即结束悬浮窗结果展示)
* `修复` 列表选择好友的上次刷新时间数值无效的问题
* `修复` waitForAction()潜在的超时参数值被拉伸的问题 _[`issue #82`](https://github.com/SuperMonster003/Ant-Forest/issues/82#issuecomment-521696124)_
* `优化` 将Base64数据及Dialog文本数据移至独立的模块中
* `优化` 使用"立即运行"引擎参数以在某些情况下跳过运行前提示对话框
* `优化` 自动检测并替换高度值异常的排行榜列表底部控件图片模板 _[`issue #82`](https://github.com/SuperMonster003/Ant-Forest/issues/82#issue-480555099)_
* `优化` 关于脚本及开发者页面本地版本与服务器版本增加版本对比逻辑
* `优化` Floaty悬浮窗结果展示逻辑以避免主线程阻塞
* `管理` 增加 `GPLv3` 通用公共许可证文件

# v1.8.3

###### 2019/08/12

* `新增` 帮收功能有效时段功能及配置
* `新增` 排行榜截图样本池差异检测功能及阈值配置 _[`issue #72`](https://github.com/SuperMonster003/Ant-Forest/issues/72#issue-476406309)_ _[`#74`](https://github.com/SuperMonster003/Ant-Forest/issues/74#issue-476641502)_
* `新增` 全局事件监测机制 (屏幕关闭/通话状态)
* `新增` 通话状态监测配置
* `新增` Floaty悬浮窗结果展示时长配置
* `新增` 解锁提示层页面滑动起止点位置配置
* `新增` 支付宝应用保留配置
* `修复` 部分机型无法识别解锁提示层页面的问题 _[`issue #57`](https://github.com/SuperMonster003/Ant-Forest/issues/57#issuecomment-514873636)_
* `修复` 进入排行榜列表时可能出现的Activity加载失败问题
* `修复` 排行榜滑动时无法识别"服务器打瞌睡了"页面的问题
* `修复` 自己能量球数量等于6时可能无法退出监测的问题
* `修复` 排行榜"邀请"按钮识别条件过于苛刻导致识别异常的问题
* `修复` 连续快速点击推迟按钮可能出现多个定时任务的问题
* `优化` 部分工具函数模块化  
  · getSelector()  
  · selExists()  
  · surroundWith()  
  · phoneCallingState()  
  · timeRecorder()
* `优化` 通过点击屏幕外部坐标实现阻止屏幕超时关闭
* `优化` 自动更新排行榜列表底部控件图片模板避免无限滑动问题
* `优化` debugInfo()内部逻辑
* `优化` Floaty结果展示内部逻辑及稳定性
* `优化` setTimePickerView()模块化
* `优化` setTimePickerView()自动设置初始值并使用24小时制
* `优化` 全局变量明确声明以避免this关键字指向对象被污染
* `优化` 解锁提示层页面上滑时长自动设置逻辑 (硬初始化) _[`issue #70`](https://github.com/SuperMonster003/Ant-Forest/issues/70#issuecomment-518939573)_

# v1.8.2

###### 2019/07/26

* `修复` 全屏View页面返回键双响应及页面点击穿透问题
* `修复` 返回键导致运行前提示对话框消失并无法选择的问题
* `修复` 计算多组延时接力时间区间最小值结果错误的问题
* `修复` cX与cY坐标变化方法传入负值时结果异常的问题
* `修复` threads.starts()方法丢失返回值的问题
* `修复` 图形配置工具叹号图标与文字粘连问题
* `优化` messageAction()消息等级参数为9时主动抛出异常
* `优化` 主页能量球监测稳定性
* `优化` 增加排行榜"邀请"按钮识别准确性

# v1.8.1

###### 2019/07/25

* `修复` 意外保险机制开关与上级开关的关联失效问题 _[`issue #52`](https://github.com/SuperMonster003/Ant-Forest/issues/52#issuecomment-514493225)_
* `修复` 意外保险机制内存数据关联异常及任务冗余问题
* `修复` 排行榜好友访问计数器传入参数无效的问题
* `修复` 黑名单样本采集的等待阈值过低可能导致的能量罩遗漏识别问题
* `优化` 运行前提示对话框默认开启

# v1.8.0

###### 2019/07/24

* `新增` 定时循环功能 _[`issue #10`](https://github.com/SuperMonster003/Ant-Forest/issues/10)_ _[`#24`](https://github.com/SuperMonster003/Ant-Forest/issues/24#issue-442635694)_ _[`#50`](https://github.com/SuperMonster003/Ant-Forest/issues/50#issue-451816401)_ _[`#50`](https://github.com/SuperMonster003/Ant-Forest/issues/50#issuecomment-506215234)_ _[`#54`](https://github.com/SuperMonster003/Ant-Forest/issues/54#issue-455544556)_ _[`#56`](https://github.com/SuperMonster003/Ant-Forest/issues/56#issue-458658596)_ _[`#57`](https://github.com/SuperMonster003/Ant-Forest/issues/57#issue-458978058)_  
  · 定时任务自动管理  
  · 好友排行榜样本复查  
  · 主页能量球循环监测
* `新增` 脚本运行安全  
  · 运行失败自动重试  
  · 单次运行最大时间限制 _[`issue #50`](https://github.com/SuperMonster003/Ant-Forest/issues/50#issuecomment-498550053)_  
  · 排他性任务最大排队时间限制  
  · 脚本炸弹预防
* `新增` 能量球点击间隔配置
* `新增` 运行前提示对话框及相关图形页面配置
* `新增` 主页能量球控件最大准备时间配置 _[`issue #57`](https://github.com/SuperMonster003/Ant-Forest/issues/57#issue-458978058)_
* `新增` 排行榜滑动距离超限时距离参数自动修正机制 _[`issue #59`](https://github.com/SuperMonster003/Ant-Forest/issues/59#issue-463517330)_
* `新增` 根据需要自动适时返回森林首页监测自己能量的返检机制 _[`issue #63`](https://github.com/SuperMonster003/Ant-Forest/issues/63#issue-468138717)_
* `新增` 好友数量多于200时图像识别策略滑动间隔自增机制
* `新增` 图形配置工具增加排行榜滑动距离安全值建议及安全值检测
* `新增` 进入森林主页/好友排行榜页面增加多计划方案 _[`issue #61`](https://github.com/SuperMonster003/Ant-Forest/issues/61#issue-466608872)_
* `修复` 本地项目备份的还原功能失效问题
* `修复` 能量球点击间隔过短可能导致的能量球点击遗漏问题 _[`issue #11`](https://github.com/SuperMonster003/Ant-Forest/issues/11#issuecomment-490311928)_
* `修复` 获取初始收取/帮收数据时迭代无效的问题
* `修复` 解锁后schema启动方式可能无效的问题 (试修)
* `修复` 部分debugInfo()信息关联错误的问题
* `修复` launchThisApp()干扰排除器未运作的问题
* `修复` messageAction()箭头参数失效的问题
* `修复` getDisplayParams()横屏状态的数据错误问题
* `修复` 采集黑名单数据时可能出现无法匹配日期/时间字串的问题
* `修复` 好友列表数据可能因选择器id属性变化导致获取失败的问题
* `修复` 排行榜列表容器控件id变更导致列表内容获取失败的问题
* `修复` 统计收取/帮收数据时控件文本转移导致正则匹配失效的问题 _[`issue #60`](https://github.com/SuperMonster003/Ant-Forest/issues/60#issue-463610448)_
* `修复` 统计收取/帮收数据初始统计值单位精度较低时统计异常的问题
* `修复` 部分机型图像识别策略因坐标变换失效无法识别图标的问题
* `修复` 潜在的黑名单数组原型方法可能因覆盖而丢失且导致无谓延时的问题 _[`issue #50`](https://github.com/SuperMonster003/Ant-Forest/issues/50#issuecomment-506926016)_ _[`#55`](https://github.com/SuperMonster003/Ant-Forest/issues/55#issue-456752151)_ _[`#70`](https://github.com/SuperMonster003/Ant-Forest/issues/70#issue-475448212)_
* `修复` equalObjects()参数为错序对象的数组时结果错误的问题
* `修复` equalObjects()内部错误导致引用类型参数被破坏的问题
* `修复` swipeInArea()计算滑动区域时屏幕宽高数据分配错误的问题 _[`issue #52`](https://github.com/SuperMonster003/Ant-Forest/issues/52#issuecomment-507184420)_
* `修复` messageActionRaw()无法显示verbose日志的问题
* `修复` Storage模块put及get方法无法处理Infinity的问题
* `修复` 图形配置工具列表滚动时导致标题栏连带滚动的问题
* `修复` 图形配置工具部分总开关开启时可能出现的子开关闪烁问题
* `修复` 图形配置工具暴露的可能阻塞主线程的方法
* `修复` 脚本运行时屏幕方向为横屏可能导致的脚本运行异常问题
* `优化` 更新Bug版本检测列表
* `优化` 去除初始能量数据无效时其他数据额外的耗时统计
* `优化` 增加动态列表备用方案以增强收取/帮收数据有效性 _[`issue #60`](https://github.com/SuperMonster003/Ant-Forest/issues/60#issue-463610448)_
* `优化` 使用动态列表/数据面板协同统计的方式增加数据有效性 _[`issue #60`](https://github.com/SuperMonster003/Ant-Forest/issues/60#issue-463610448)_
* `优化` 提升图像识别策略列表底部条件判断检测效率
* `优化` 去除图像识别策略列表滑动稳定条件判断以提升滑动效率
* `优化` 图形配置工具使用异步加载方式提升启动速度
* `优化` 图形配置工具使用防抖机制增强滑动稳定性
* `优化` 去除好友排行榜滚动条以避免图标遮挡
* `优化` 去除好友数量不足10人时的关键控件超时检测 (因计划而异)
* `优化` 统计结果摒弃始末差值使用中间值以提升统计效率
* `优化` swipe()方法异常时使用备用方案滑动排行榜列表
* `优化` 自动解锁失败时自动保存当前屏幕截图以供调试

# v1.7.1

###### 2019/06/16

* `修复` 解锁模块成功解锁后可能出现的假死问题 _[`issue #50`](https://github.com/SuperMonster003/Ant-Forest/issues/50#issuecomment-502027195)_ _[`#51`](https://github.com/SuperMonster003/Ant-Forest/issues/51#issue-452787314)_
* `修复` 解锁模块唤醒无密码设备可能失败的问题 _[`issue #62`](https://github.com/SuperMonster003/Ant-Forest/issues/62#issue-468132874)_
* `修复` getDisplayParams()容易丢失精度的问题 _[`issue #52`](https://github.com/SuperMonster003/Ant-Forest/issues/52#issuecomment-502029869)_
* `优化` 解锁模块增加开发者测试模式日志
* `优化` 解锁模块使用惰性函数优化频繁使用的函数
* `优化` 图形配置工具使用exit监听实现部分资源手动释放
* `优化` 增加并修正图像识别策略样本采样点
* `优化` 排行榜列表滑动方法失效时自动使用临时安全值

# v1.7.0

###### 2019/06/14

* `新增` 项目更新功能 _[`issue #21`](https://github.com/SuperMonster003/Ant-Forest/issues/21#issue-442191593)_
* `新增` 项目备份还原功能 (本地/服务器) _[`issue #48`](https://github.com/SuperMonster003/Ant-Forest/issues/48#issue-450576630)_
* `修复` 布局分析策略可能出现的点击错位的问题 (试修) _[`issue #52`](https://github.com/SuperMonster003/Ant-Forest/issues/52#issuecomment-502029869)_
* `修复` 部分机型获取屏幕宽高数据异常的问题 (试修)
* `修复` 获取好友列表数据时Toast消息或提示框遮挡问题
* `修复` equalObjects()错序判断失误的问题
* `修复` 自定义黑名单列表排序后勾选项关联错误的问题
* `优化` 部分工具函数模块化  
  · equalObjects()  
  · deepCloneObject()  
  · smoothScrollPage()  
  · alertTitle()  
  · alertContent()
* `优化` 获取好友数据自动点击"打开"按钮而后自动展示列表
* `优化` 帮收数据统计采用与收取数据统计方案统一化

# v1.6.25

###### 2019/05/31

* `新增` 排行榜样本采集新增图像识别策略
* `新增` 图形配置工具: 排行榜样本采集
* `新增` 图形配置工具: 收取功能
* `修复` 图像识别策略存储排行榜图片样本功能失效的问题
* `修复` 图像识别策略排行榜图标可能点击无效的问题
* `修复` 图像识别策略返回排行榜后匹配样本异常的问题
* `修复` 图像识别策略采集可操作样本时可能出现的区域越界问题
* `修复` 图像识别策略可能导致的黑名单空引用问题 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-495919070)_
* `修复` 截图权限申请工具重试次数超限时消息提示功能失效的问题
* `修复` `Pro v7.0.3-1` 获取图像示例标识字符可能为空的问题
* `修复` 关闭全部蚂蚁森林相关页面时可能出现的无限循环问题
* `修复` 图形配置工具偶尔出现滑动不完全现象
* `修复` 图形配置工具可能出现的页面滑动不完全问题
* `修复` 好友列表进行颜色匹配时引用无效颜色值的问题 _[`issue #42`](https://github.com/SuperMonster003/Ant-Forest/issues/42#issue-448552266)_
* `修复` 好友数量小于10时脚本无法继续运行的问题
* `修复` 屏幕宽高数据获取失败的问题 (试修)
* `修复` 屏幕宽高纵向拉伸方法的逻辑错误 _[`issue #43`](https://github.com/SuperMonster003/Ant-Forest/issues/43#issue-448579445)_ _[`#44`](https://github.com/SuperMonster003/Ant-Forest/issues/44#issue-448626129)_
* `修复` 工具函数模块使用服务获取屏幕高度像素时方法错误的问题 _[`issue #43`](https://github.com/SuperMonster003/Ant-Forest/issues/43#issuecomment-496122170)_
* `修复` 排行榜图标识别时区域跨界问题
* `修复` 排行榜页面样本匹配时图片回收机制可能导致脚本无法运行问题
* `修复` 添加新的图像识别策略返回列表时的条件检测以避免假死问题 _[`issue #15`](https://github.com/SuperMonster003/Ant-Forest/issues/15#issue-440288350)_
* `修复` 能量罩黑名单好友存储图片样本时高度参照点无效的问题 _[`issue #40`](https://github.com/SuperMonster003/Ant-Forest/issues/40#issue-448416344)_
* `修复` 能量罩黑名单采集时间参数假死问题
* `修复` 默认配置模块在运行图形配置工具之前可能出现不被加载的问题
* `优化` 图像识别策略增加滑动检测
* `优化` 增加排行榜滑动结束信号检测样本
* `优化` 增加能量罩时间信息采集稳定性
* `优化` 屏幕宽高数据方法模块化且优先采用服务方式获取数据
* `优化` 废弃排行榜图标图像采集及识别方法 _[`issue #53`](https://github.com/SuperMonster003/Ant-Forest/issues/53#issue-453903442)_
* `优化` 废弃排行榜黑名单样本图像采集及识别方法
* `优化` 排行榜图像识别策略手形图标识别准确性和高效性
* `优化` 排行榜图标识别采用自动存储自动调用机制增加图标识别率
* `优化` 提示好友列表信息采集效率
* `优化` 更新Bug版本检测列表
* `优化` 移除采用排行榜图像识别策略返回列表时的条件检测

# v1.6.24

###### 2019/05/22 - 代码重构 谨慎升级

* `修复` 截图权限申请工具缺失参数的问题 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-494584430)_
* `修复` 启动完成条件检测失效的问题
* `修复` 关闭蚂蚁森林相关页面时clickAction()传参类型错误 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-494430622)_ _[`#35`](https://github.com/SuperMonster003/Ant-Forest/issues/35#issue-446883975)_ _[`#36`](https://github.com/SuperMonster003/Ant-Forest/issues/36#issue-446884085)_
* `修复` 关闭蚂蚁森林相关页面时参考控件无限监测的问题
* `修复` 帮收数据可能无效的问题 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-494628908)_
* `修复` 能量球操作统计数据失效的问题 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-494600867)_ _[`#36`](https://github.com/SuperMonster003/Ant-Forest/issues/36#issuecomment-494636100)_
* `优化` 摒除排行榜样本筛选方案 - "标题列表bottom"
* `优化` 监测自己能量时设置屏幕常亮防止息屏 _[`issue #29`](https://github.com/SuperMonster003/Ant-Forest/issues/29#issue-445008791)_
* `优化` 移除遗留的saveCurrentScreenCapture()工具调用
* `优化` 获取屏幕宽高数据加入缓冲方案 _[`issue #32`](https://github.com/SuperMonster003/Ant-Forest/issues/32#issuecomment-493808327)_
* `优化` 深度代码重构 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-493279213)_ _[`#28`](https://github.com/SuperMonster003/Ant-Forest/issues/28#issuecomment-493378861)_

# v1.6.23

###### 2019/05/20

* `修复` OpenCV视觉库断言异常 (试修)
* `修复` 工具函数killThisApp()部分逻辑错误
* `修复` 工具函数killThisAppRaw()的依赖性
* `修复` 工具函数messageAction()部分打印格式错误
* `修复` 标题控件bottom数据获取异常 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-492933699)_
* `修复` 能量罩使用信息采集异常 _[`issue #25`](https://github.com/SuperMonster003/Ant-Forest/issues/25#issuecomment-493874078)_ _[`#34`](https://github.com/SuperMonster003/Ant-Forest/issues/34#issue-446366256)_
* `优化` 工具函数模块方法增加JSDoc使用示例
* `优化` 部分工具函数模块化  
  · waitForAction()  
  · clickAction() _[`issue #19`](https://github.com/SuperMonster003/Ant-Forest/issues/19#issue-441649578)_  
  · waitForAndClickAction()  
  · debugInfo()  
  · getVerName()  
  · keycode()  
  · killThisApp()  
  · launchThisApp()  
  · messageAction()  
  · parseAppName()  
  · refreshObjects()  
  · restartThisApp()  
  · restartThisEngine()  
  · runJsFile()  
  · showSplitLine()  
  · swipeInArea()  
  · swipeInAreaAndClickAction()  
  · tryRequestScreenCapture()
* `优化` 去除全部current_app参数关联
* `优化` 工具函数parseAppName()搜索效率
* `优化` 工具函数中剔除部分无用Raw工具函数
* `优化` 排队机制加入排队等待最大超时
* `优化` 提升收取/帮收统计数据获取稳定性
* `优化` 放宽黑名单颜色识别条件 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-492633236)_
* `优化` 简化工具内部debugInfo()参数传递方式

# v1.6.22

###### 2019/05/15

* `修复` clickBounds()携带press参数时运行异常 _[`issue #27`](https://github.com/SuperMonster003/Ant-Forest/issues/27#issue-444244698)_
* `修复` 图形配置工具返回按钮失效的问题
* `修复` 好友昵称获取失败的问题 _[`issue #25`](https://github.com/SuperMonster003/Ant-Forest/issues/25#issuecomment-492461297)_
* `修复` 帮收统计数据无效的问题
* `修复`排行榜列表底部判断异常 _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-492166284)_ _[`#26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#)_
* `修复` 标题控件bottom数据获取异常 _[`issue #26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issuecomment-492480162)_
* `修复` 统计好友能量收取值容易失败的问题
* `修复` 自定义黑名单采集好友列表失败的问题 _[`issue #16`](https://github.com/SuperMonster003/Ant-Forest/issues/16#issuecomment-492240214)_
* `优化` 优化最小化支付宝工具函数逻辑
* `优化` 摒弃收取完毕返回主页时的无用判断
* `优化` 撤回截图权限申请函数的监测解放
* `优化` 支付宝为非简体中文语言时的检测准确性
* `优化` 通过记忆pickup()返回结果提升控件搜索效率

# v1.6.21

###### 2019/05/14

* `修复` pickup()方法遗漏样本的问题 _[`issue #25`](https://github.com/SuperMonster003/Ant-Forest/issues/25#issuecomment-492231958)_ _[`#26`](https://github.com/SuperMonster003/Ant-Forest/issues/26#issue-443906535)_

# v1.6.20

###### 2019/05/14

* `优化` 使用自定义pickup()方法获取部分控件 _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-491829812)_ _[`#16`](https://github.com/SuperMonster003/Ant-Forest/issues/16#issue-441330852)_ _[`#17`](https://github.com/SuperMonster003/Ant-Forest/issues/17#issuecomment-491859631)_ _[`#25`](https://github.com/SuperMonster003/Ant-Forest/issues/25#issue-443768683)_
* `优化` 提升黑名单检测准确率

# v1.6.19

###### 2019/05/13

* `修复` 弃用导致控件抓取缓慢的"useUsageStats"参数 `添加于 v1.6.18` _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-491655175)_
* `修复` 图形配置工具在部分机型显示错位问题

# v1.6.18

###### 2019/05/13

* `修复` 排行榜误触虚拟按键的问题
* `优化` ~~使用"使用统计权限"提升currentPackage()准确性~~ `去除于 v1.6.19`

# v1.6.17

###### 2019/05/10

* `修复`进入好友列表后可能导致参考控件获取失败的问题 _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-491238327)_ _[`#16`](https://github.com/SuperMonster003/Ant-Forest/issues/16#issue-441330852)_
* `修复` 特殊密码解锁方案修复 _[`issue #23`](https://github.com/SuperMonster003/Ant-Forest/issues/23#issue-442326458)_

# v1.6.16

###### 2019/05/10

* `修复` 密码解锁误判转移失效的问题 _[`issue #18`](https://github.com/SuperMonster003/Ant-Forest/issues/18#issuecomment-490752826)_
* `优化` 排行榜好友样本采集效率

# v1.6.15

###### 2019/05/10

* `修复` 部分机型PIN码解锁误判为密码解锁的问题

# v1.6.14

###### 2019/05/10

* `修复` 启动完成条件检查必备/可选条件的逻辑错误
* `修复` 账户未登录状态时脚本运行超长耗时问题
* `优化` 重写启动完成条件判断逻辑 _[`issue #20`](https://github.com/SuperMonster003/Ant-Forest/issues/20#issue-441989541)_
* `优化` 还原部分click()方法以避免屏幕容易超时关闭

# v1.6.13

###### 2019/05/09

* `修复` "首页状态准备"失败及定位"查看更多好友"失败的问题 _[`issue #20`](https://github.com/SuperMonster003/Ant-Forest/issues/20#issue-441989541)_
* `优化` 解锁模块适配部分魅族设备 (当前仅限数字PIN码方案)

# v1.6.12

###### 2019/05/09

* `修复` "首页状态准备"易失败的问题 (试修) _[`issue #18`](https://github.com/SuperMonster003/Ant-Forest/issues/18#issuecomment-490748304)_ _[`#20`](https://github.com/SuperMonster003/Ant-Forest/issues/20#issue-441989541)_
* `优化` 适配图案解锁动态控件

# v1.6.11

###### 2019/05/08

* `修复` clickBounds()工具函数可能出现的空指针问题 _[`issue #11`](https://github.com/SuperMonster003/Ant-Forest/issues/11#issuecomment-490043246)_ _[`#19`](https://github.com/SuperMonster003/Ant-Forest/issues/19#issue-441649578)_
* `优化` 图案解锁布局判断逻辑

# v1.6.10

###### 2019/05/08

* `新增`截图权限申请失败后自动重启任务 _[`issue #17`](https://github.com/SuperMonster003/Ant-Forest/issues/17#issue-441600611)_ _[`#18`](https://github.com/SuperMonster003/Ant-Forest/issues/18#issue-441609058)_

# v1.6.9

###### 2019/05/08

* `优化` 提升锁屏布局工具使用稳定性 增加更多用户操作提示 _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-490387036)_
* `优化` 使用shell()方法完全替代可能导致任务卡死的KeyCode()方法

# v1.6.8

###### 2019/05/08

* `优化` 增加启动条件检测样本
* `优化` 本地数据尝试解锁失败后从默认值 (非当前值) 开始尝试

# v1.6.7

###### 2019/05/07

* `修复` debugInfo()方法引用无效的问题
* `优化` 控件刷新工具函数只在必要时触发

# v1.6.6

###### 2019/05/07

* `修复` keycode(26)导致任务残留的问题 _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-489871930)_
* `修复` 魅族设备使用自动关屏功能时卡死的问题
* `修复` 最小化支付宝功能异常问题
* `修复` 截图权限申请容易失败的问题 _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-489636082)_
* `修复` 锁屏布局工具无法使用关屏功能时自动退出的问题

# v1.6.5

###### 2019/05/06

* `修复` 音量键重复监听问题
* `修复` 点击"查看更多好友"备用方案无效的问题
* `修复` 排行榜首页好友可能丢失采集的问题
* `修复` 支付宝关闭异常时最小化功能无效的问题
* `优化` 图案解锁滑动效率及精确性 _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-489437428)_
* `优化` 进入好友森林超时检测的稳定性
* `优化` 优化keycode()工具函数以避免假死

# v1.6.4

###### 2019/05/05

* `新增` 版本查看与检查更新功能 (仅检查版本号)
* `修复` 解锁模块可能因click()方法无限等待的问题
* `修复` 某些设备Floaty消息一闪即逝的问题 (试修)
* `修复` 图案解锁坐标点在某些设备偏移的问题 (试修)
* `修复` 锁屏布局工具对话框点击后无效且直接退出的问题 (试修)
* `修复` 因修复纵向伸缩而引发的纵向坐标异常的问题
* `修复` 翻页时可能遗漏屏幕底部排行榜好友的问题
* `优化` 增加支付宝启动检测条件及启动完成检测条件判断样本
* `优化` 关闭某些clickObject()方法无用的debug消息

# v1.6.3

###### 2019/05/03

* `修复` 点击能量球后可能导致统计收取数据无限循环的问题

# v1.6.2

###### 2019/05/02

* `修复` 屏幕比例非16:
  9的设备纵向伸缩失调问题 _[`issue #14`](https://github.com/SuperMonster003/Ant-Forest/issues/14#issuecomment-488562316)_

# v1.6.1

###### 2019/05/01

* `修复` 新版支付宝返回上一级页面失败的问题 _[`issue #12`](https://github.com/SuperMonster003/Ant-Forest/issues/12#issue-436983883)_

# v1.6.0

###### 2019/04/30

* `新增` 图形页面配置功能: 黑名单管理
* `修复` 自定义黑名单检测失效问题
* `修复` 从列表添加好友功能失效问题

# v1.5.21

###### 2019/04/29

* `新增` 图形配置工具自定义黑名单页面骨架

# v1.5.20

###### 2019/04/28

* `新增` 按键监听 VOL+: 停止所有脚本 VOL-: 停止当前脚本
* `修复` 控件点击偶尔出现假死现象
* `修复` 排行榜点击目标时误点击虚拟按键的问题
* `优化` 使用Git命令真正精简仓库体积 _[`issue #5`](https://github.com/SuperMonster003/Ant-Forest/issues/5)_
* `优化` 点击"查看更多好友"增加备用方案

# v1.5.19

###### 2019/04/27

* `新增` 自收功能配置开关
* `新增` 启动器的Bug版本检测提示
* `新增` 图形配置工具启动器"加载中"页面
* `修复` 某些版本基础功能异常导致Bug版本检测失效的问题
* `修复` 某些版本在Bug提示过程中依然继续运行的问题
* `修复` 排行榜点击目标时误点击虚拟按键的问题

# v1.5.18

###### 2019/04/26

* `新增` Bug版本检测提示 (当前所有版本) _[`issue #12`](https://github.com/SuperMonster003/Ant-Forest/issues/12#issuecomment-486498208)_
* `优化` 完善开发者测试模式
* `优化` 及时回收新生成的images对象
* `优化` 用press()方法模拟点击
* `优化` 用swipe()方法模拟滑动 增加可用性检测 _[`issue #11`](https://github.com/SuperMonster003/Ant-Forest/issues/11#issue-436002977)_

# v1.5.17

###### 2019/04/25

* `优化` 完善开发者测试模式
* `优化` 截图申请工具函数判断逻辑
* `优化` auto.waitFor()不被支持时自动使用auto() _[`issue #12`](https://github.com/SuperMonster003/Ant-Forest/issues/12#issue-436983883)_
* `优化` getVerName()工具函数兼容性
* `修复` 解锁模块读取存储数据时的常规错误

# v1.5.16

###### 2019/04/24

* `新增` 图形配置工具返回按钮
* `新增` 开发者测试模式 (暂不完全)
* `新增` 图形页面配置功能: 消息提示

# v1.5.15

###### 2019/04/23

* `新增` 适配部分EMUI机型的自动解锁方案 _[`issue #8`](https://github.com/SuperMonster003/Ant-Forest/issues/8#issuecomment-485403816)_
* `修复` 帮收功能关闭后依然进入可帮收好友森林的问题
* `修复` 锁屏布局工具滑动失败导致脚本异常退出的问题
* `修复` 引入的dialogs模块中多选对话框功能异常 (临时解决方案)
* `优化` 增加截图区域检测 防止OpenCV组件异常
* `优化` messageAction工具实用性 (增加dash显示方式)
* `优化` 去除容易导致死循环的失焦拉回功能 `添加于 v1.5.12`

# v1.5.14

###### 2019/04/22

* `修复` 首次运行可能导致支付宝拉起失败且脚本长时间无响应的问题
* `修复` 语言检测控件查找超时导致脚本运行失败的问题
* `修复` 自动解锁可能出现的解锁图层检测异常 _[`issue #6`](https://github.com/SuperMonster003/Ant-Forest/issues/6#issuecomment-484788911)_
* `修复` 深拷贝工具函数克隆数组失效的问题

# v1.5.13

###### 2019/04/21

* `优化` keycode()工具函数内部逻辑

# v1.5.12

###### 2019/04/20

* `新增` ~~支付宝失焦后在指定时间内自动拉回功能 (可设置开关及白名单)~~ `去除于 v1.5.15`
* `修复` 解锁模块可能导致屏幕无法超时自动关闭的问题

# v1.5.11

###### 2019/04/19

* `修复` 自动解锁可能出现的异常重复上滑现象 _[`issue #6`](https://github.com/SuperMonster003/Ant-Forest/issues/6#issuecomment-484503159)_

# v1.5.10

###### 2019/04/18

* `新增` 适配采用"Gxzw"屏下指纹设备的自动解锁方案 _[`issue #6`](https://github.com/SuperMonster003/Ant-Forest/issues/6#issuecomment-484361198)_
* `优化` 锁屏布局工具控件信息采集方式

# v1.5.9

###### 2019/04/17

* `修复` Shell模块返回代码137导致按键模拟无效的问题
* `优化` 排行榜样本采集稳定性 _[`issue #4`](https://github.com/SuperMonster003/Ant-Forest/issues/4#issuecomment-483967078)_

# v1.5.8

###### 2019/04/17

* `新增` 锁屏布局工具 方便用户发送锁屏布局信息给开发者
* `修复`判断初始准备条件时可能出现无法匹配ViewId的问题 _[`issue #4`](https://github.com/SuperMonster003/Ant-Forest/issues/4#issuecomment-483958381)_
* `优化` 解锁模块稳定性

# v1.5.7

###### 2019/04/17

* `优化` 排行榜样本采集稳定性 _[`issue #4`](https://github.com/SuperMonster003/Ant-Forest/issues/4)_
* `管理` 删除无关文件以缩小仓库体积 _[`issue #5`](https://github.com/SuperMonster003/Ant-Forest/issues/5)_

# v1.5.6

###### 2019/04/16

* `新增` 解锁模块加入MIUI支持
* `修复` 关屏功能异常
* `优化` 帮收功能关闭时的收取逻辑
* `优化` 简化智能返回逻辑

# v1.5.5

###### 2019/04/15

* `新增` 重写解锁模块 (暂未加入MIUI支持)
* `新增` 解锁功能开关检测提示及SDK版本检测提示
* `修复` 循环监测自己能量逻辑错误导致的效率低下问题
* `修复` 获取排行榜参考范围因控件出现延迟导致的异常

# v1.5.4

###### 2019/04/14

* `修复` 循环监测自己能量的统计数据错误

# v1.5.3

###### 2019/04/13

* `新增` 图形配置工具黑名单管理骨架
* `修复` dialogs模块缺失 _[`issue #2`](https://github.com/SuperMonster003/Ant-Forest/issues/2)_

# v1.5.2

###### 2019/04/12

* `修复` dialogs模块在某些版本不兼容的问题
* `修复` 图形配置工具返回保存时数据存放错误的问题
* `修复` 图形配置工具某些关闭按钮无效的问题

# v1.5.1

###### 2019/04/12

* `新增` Auto.js版本异常提示
* `修复` 版本异常检测与运行配置检测逻辑顺序
* `优化` 独立解锁配置向导 整合到图形配置工具中
* `优化` 调用UI执行脚本去Root化
* `优化` 调用支付宝登录页面去Root化

# v1.5.0

###### 2019/04/11

* `新增` 图形配置工具正式上线
* `修复` 已Root设备无法调起图形设置页面问题

# v1.4.11

###### 2019/04/11

* `新增` 图形配置工具与执行脚本数据项建立关联

# v1.4.10

###### 2019/04/10

* `修复` 图形配置工具对象相等判定工具的逻辑错误
* `修复` 部分函数内部变量覆盖函数定义的问题 _[`issue #1`](https://github.com/SuperMonster003/Ant-Forest/issues/1)_
* `优化` 完善图形配置工具自己能量时间区间管理工具

# v1.4.9

###### 2019/04/09

* `新增` 图形配置工具颜色设置对话框文字跟随输入值变色功能
* `新增` 图形配置工具颜色相关hint区域的色彩指示图标
* `修复` 图形配置工具还原后保存按钮无效
* `修复` 图形配置工具还原后无法再次还原
* `修复` 图形配置工具帮收功能总开关联动性
* `修复` 图形配置工具初始化状态为关闭的开关子项隐藏失败问题
* `优化` "标题警示"工具兼容性

# v1.4.8

###### 2019/04/08

* `修复` 图形配置工具对象深拷贝不完全问题

# v1.4.7

###### 2019/04/07

* `修复` 图形配置工具监测自己能量开关数据关联错误
* `修复` 图形配置工具判断对象相等的逻辑错误
* `修复` 图形配置工具会话存储/本次存储二层以上对象变量互相影响的错误

# v1.4.6

###### 2019/04/06

* `优化` 图形配置工具数据与控件关联性
* `优化` 图形配置工具本地数据存取逻辑

# v1.4.5

###### 2019/04/05

* `新增` 图形配置工具重置功能
* `新增` 图形配置工具数据实时更新
* `优化` 图形配置工具列表项功能增强模块化
* `优化` 图形配置工具退出/保存逻辑

# v1.4.4

###### 2019/04/04

* `新增` 图形配置工具保存按钮功能联动
* `新增` 数据样本不足导致统计结果异常的错误提示
* `修复` KeyCode()不可用问题

# v1.4.3

###### 2019/04/03

* `优化` 图形配置工具列表项功能模块化

# v1.4.2

###### 2019/04/03

* `修复` 图形配置工具滑动效果闪烁问题

# v1.4.1

###### 2019/04/02

* `新增` 图形配置工具主页View框架
* `新增` 图形配置工具子页面进出滑动效果
* `新增` 图形配置工具退出保存提示

# v1.4.0

###### 2019/04/02

* `新增` 图形配置工具 (骨架)

# v1.3.8

###### 2019/04/01

* `修复` 本地文件创建失败的问题

# v1.3.7

###### 2019/04/01

* `新增` `Auto.js Pro` 版本兼容
* `修复` 解锁配置向导在 `4.1.1 alpha2` 的兼容问题

# v1.3.6

###### 2019/03/30

* `修复` floaty结果显示hint区域溢出问题

# v1.3.5

###### 2019/03/29

* `新增` floaty方式显示收取结果 (可与toast方式切换选择)
* `修复` floaty显示问题及其他异常处理
* `修复` 截图权限申请容易高失败率问题
* `优化` 帮收能量球检测准确性

# v1.3.4

###### 2019/03/28

* `修复` 收取能量统计失败的错误消息处理

# v1.3.3

###### 2019/03/27

* `新增` 自己能量球数等于6时的收取处理
* `修复` 帮收球和收取球同时存在时可能出现收取失效的问题
* `修复` 帮收能量球遗留数据清空滞缓问题
* `优化` 智能返回功能的APP退出逻辑

# v1.3.2

###### 2019/03/26

* `新增` 自己能量球数等于6时的收取处理
* `优化` 语言切换控制台信息显示
* `优化` 截图权限申请的异常处理

# v1.3.1

###### 2019/03/25

* `新增` 截图权限申请工具函数
* `修复` 保护罩颜色识别区域分辨率适配问题
* `灵感` 可设置低亮度运行并在运行结束后恢复状态

# v1.3.0

###### 2019/03/25

* `新增` 脚本运行超时配置项 (单次最大运行时间)
* `修复` 解锁功能配置向导toast消息遮挡问题 (替换为content显示方式)
* `修复` 黑名单自动管理功能的时间标记滞留问题
* `修复` 帮收能量单位为"kg"时的数据统计异常
* `优化` 解锁功能配置向导增加密码示例
* `优化` 密文字典模块的方法参数调整
* `优化` 新的能量收取逻辑下提升帮收效率
* `优化` 智能返回机制 (前台拉起优先于强制关闭)
* `优化` 增加进入好友森林后没有能量球可收取/帮收时的控制台消息

# v1.2.1

###### 2019/03/24

* `优化` 优化保护罩检测/能量收取逻辑
* `修复` 解锁功能配置向导第一步返回键失效

# v1.2.0

###### 2019/03/24

* `新增` 能量罩好友黑名单自动管理功能
* `新增` 解锁配置向导
* `新增` 使用自定义本地存储模块模拟Storage模块 (不受卸载APP/清除数据影响)
* `修复` 解锁模块通用化
* `优化` 整合控制台详细信息开关
* `优化` 能量罩检测效率

# v1.1.2

###### 2019/03/21

* `优化` 优化帮收好友能量逻辑 提升收取效率/准确率/稳定性
* `优化` 提升定位"查找更多好友"按钮稳定性并增加异常处理
* `灵感` 使用 [JSEncrypt](https://github.com/travist/jsencrypt) 结合或替代原有加密方式
* `灵感` 个人能量球总数为6时 收取后可能出现新的能量球 [v1.3.2](#v132)
* `灵感` 好友能量球总数为6时 帮收后再次进入好友森林 可能有新的能量球 [v1.9.0](#v190)
* `灵感` ~~功能模块分离~~ [v1.6.23](#v1623)

# v1.1.1

###### 2019/03/20

* `修复` 模块/脚本文件的依赖关系
* `修复` 密文工具功能失效
* `优化` 全面调整代码结构

# v1.1.0

###### 2019/03/19 - 脚本可用性暂未测试

* `新增` 自动检测/生成/引用本地"密文映射"文件
* `移除` 指定账户智能切换功能 (暂时关闭)
* `修复` 收取完毕返回好友列表时 当前屏幕信息没有及时处理即开始滑屏
* `灵感` ~~账户智能切换 (账户录入 已录入账户的选择/信息更新)~~ [v1.9.0](#v190)
* `灵感` ~~使用密文解析工具时若发现"密文映射"文件异常 及时报错~~ [v1.3.0](#v130)

# v1.0.0

###### 2019/03/19 - 此版本依赖设备本地密文映射文件 因此暂不可用

* `新增` 自动收取好友能量 (基于Auto.js控件/颜色识别)
* `新增` 自动帮收好友能量
* `新增` 可在指定时间范围内不间断检测自己的能量 (感谢 [e1399579](https://github.com/e1399579/autojs))
* `新增` 自动解锁屏幕 (感谢 [e1399579](https://github.com/e1399579/autojs))
* `新增` 脚本排队机制 (感谢 [e1399579](https://github.com/e1399579/autojs))
* `新增` 脚本运行结束后智能关屏 (感谢 [e1399579](https://github.com/e1399579/autojs))
* `新增` 脚本运行结束后智能保留/结束APP进程
* `新增` 自动切换APP语言 (目前暂时统一切换为简体中文)
* `新增` 若当前用户不是指定账户 (主账户) 则自动切换为主账户 (需录入账户信息)
* `新增` 可显示/关闭能量罩的剩余时间 (因黑名单系统未完成 暂未投入使用)
* `新增` 可显示/关闭收取/帮收好友能量的详细信息
* `新增` 可分别显示收取自己能量的总数与收取好友能量的总数
* `新增` 将Auto.js的日志保存在指定的文件中 (Auto.js v4.1.0版本以上)
* `优化` 精简部分无用的方法
* `优化` 脚本部分参数可供用户自行配置 (目前只可在脚本文件中配置)
* `优化` 部分参数值可以自动修正/修复
* `优化` 恶劣条件下 (不稳定的互联网连接等) 的脚本稳定性
* `优化` 收取能量时 先保证能量收取成功 然后立即返回 (稳定性/高效率)
* `优化` 帮收能量时 若能量帮收成功 立即返回 (高效率)
* `优化` 线程循环展开列表 节约滑动好友列表时"加载中"的时间 (高效率)
* `优化` 线程监视好友列表底部 一旦进入屏幕 立即停止列表滑动 (高效率)
* `优化` 优化好友列表滑动的稳定性
* `灵感` ~~能量罩用户黑名单功能实现 (目前只是空壳)~~ [v1.2.0](#v120)
* `灵感` 脚本使用说明文档 (包含使用细节和注意事项)
* `灵感` ~~自动生成并引用本地"密文映射"字典~~ [v1.1.0](#v110)
* `灵感` ~~本地"密文映射"加解密工具~~ [v1.1.0](#v110)
* `灵感` ~~主要方法的JSDoc注释~~ [v1.6.23](#v1623)
* `灵感` ~~可用于配置脚本的UI界面 (高交互性)~~ [v1.5.0](#v150)
* `灵感` ~~帮收好友能量增加精准性及效率~~ [v1.1.2](#v112)
* `灵感` ~~登录主账户之前记录当前用户信息 脚本结束后恢复登录 (需录入账户信息)~~ [v1.9.0](#v190)
* `灵感` ~~额外文件的生成/存取不受机型限制~~ [v1.2.0](#v120)
* `灵感` 语言智能切换且可供用户配置
* `灵感` ~~使用Floaty方式替代Toast消息显示~~ [v1.3.5](#v135)
* `灵感` ~~好友数量小于10的异常处理~~ [v1.8.0](#v180)
* `灵感` ~~shell强制结束APP的替代方案 (避免经常出现的几秒钟黑屏)~~ [v1.5.1](#v151)