# Ant Forest

![AF_Pic](https://github.com/SuperMonster002/Hello-Sockpuppet/raw/master/Ant_Forest_Banner_361%C3%97103.png)

###### 蚂蚁森林能量智能收取脚本 (基于Auto.js)

###### Auto.js\-based alipay ant forest energy intelligent collection script

******

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/SuperMonster003/Ant-Forest)](https://github.com/SuperMonster003/Ant-Forest/releases/latest)
[![GitHub closed issues](https://img.shields.io/github/issues/SuperMonster003/Ant-Forest?color=009688)](https://github.com/SuperMonster003/Ant-Forest/issues)
[![Auto.js](https://img.shields.io/badge/auto.js-%3E%3D%204.1.1%20alpha2-67a91b)](https://github.com/hyb1996/Auto.js)
[![GitHub top language](https://img.shields.io/github/languages/top/SuperMonster003/Ant-Forest?color=eb8031)](https://github.com/topics/javascript)
[![CodeFactor Grade](https://www.codefactor.io/repository/github/supermonster003/ant-forest/badge?s=61cf94a3f5266c39dd9c4873d2413a9cf365a3eb)](https://www.codefactor.io/repository/github/supermonster003/ant-forest)
[![JetBrains](https://img.shields.io/badge/supporter-JetBrains-%23ee4677)](https://www.jetbrains.com/?from=Ant-Forest)

******
### 使用说明
******

1. 下载项目 (任意一种方式)  
   [下载项目部署工具](https://raw.githubusercontent.com/SuperMonster003/Ant-Forest/master/tools/ant-forest-deployment-tool.min.js) (`*.js`)  
   \* 浏览器可能需要点击 `"另存为"` 或 `"下载"` 至本地  
   [下载最新项目数据包](https://github.com/SuperMonster003/Ant-Forest/archive/master.zip) (`*.zip`)  
   \* 手机可能需要额外的 `"文件管理"` 或 `"解压缩"` 工具
2. 部署项目  
   如果下载了部署工具 (单个 `.js` 格式文件)  
   则只需用 `Auto.js` 直接运行 (或导入后运行) 此文件即可  
   如果下载了项目数据包  
   则需将项目解压缩并放置到 `Auto.js` 工作目录下  
   定位到设备的内部存储目录 如:  
   `/内部存储/` `/Internal Storage/` `/sdcard/` `/storage/emulated/0/` 等  
   在此目录下找到 `Auto.js` 默认工作目录  
   \* 中文系统默认目录 `./脚本/`  
   \* 英文系统默认目录 `./Scripts/`  
   若不存在则需手动建立 或在 `Auto.js` 软件中设置一个工作目录  
   将项目文件夹保留结构放置在工作目录中
3. 使用 `Auto.js` 运行项目  
   运行 `ant-forest-launcher.js` 启动项目  
   运行 `ant-forest-settings.js` 进行项目配置  
   \* 项目目录中也可直接点击上方的 `"运行项目"` 按钮
4. 欢迎使用并反馈

> ###### 使用指南
>
> > [快速手册](https://www.bilibili.com/video/av91979276/) (视频)  
> > [项目文档](https://github.com/SuperMonster003/Ant-Forest/wiki/%E8%9A%82%E8%9A%81%E6%A3%AE%E6%9E%97-(Ant-Forest)) (文字)
>
> ###### 系统需求
>
> > Android 版本: `7.0+`  
> > Root 权限: `不必要`
>
> ###### "Auto.js"可用版本
>
> > `-- 免费版本 --`  
> > [`4.1.1 Alpha2`](https://github.com/SuperMonster002/Hello-Sockpuppet/raw/master/%5Bauto.js%5D%5B4.1.1_alpha2%5D%5Barm-v7%5D(b69a4e23).apk?raw=true)  
> > `-- 付费版本 --`  
> > [`Pro 7.0.4-1`](https://github.com/SuperMonster002/Hello-Sockpuppet/blob/master/%5Bauto.js%5D%5Bpro_7.0.4-1%5D(31b16c93).apk?raw=true)  
> > [`Pro 8.3.16-0`](https://github.com/SuperMonster002/Hello-Sockpuppet/blob/master/%5Bauto.js%5D%5Bpro_8.3.16-0%5D(9a414abf).apk?raw=true)  
> > `-- 不适用版本 --`  
> > [`查看不适用版本的已知问题`](https://github.com/SuperMonster002/Hello-Sockpuppet/blob/master/README.md)

******
### 功能简介
******

* 自动收取好友能量
* 自动收取/监测自己能量
* 收取结果统计/展示 (floaty/toast方式)
* 控制台消息提示  
  · 详细/简略  
  · 开发者测试模式 (默认关闭)
* 自动解锁屏幕  
  · 提供解锁密码录入等配置
* 定时任务与循环监测  
  · 好友排行榜样本复查  
  · 主页能量球循环监测  
  · 定时任务自动管理
* 多任务自动排队
* 脚本运行安全  
  · 运行失败自动重试  
  · 单次运行最大时间限制  
  · 排他性任务最大排队时间限制  
  · 脚本炸弹预防
* 事件监测与处理  
  · 账户登出  
  · 屏幕意外关闭  
  · 来电响铃或通话
* 多语言支持 (简体中文 ~~繁体中文~~ ~~英语~~)  
  · ~~根据系统语言自动切换语言 (可开关)~~
* 黑名单机制  
  · 能量保护罩黑名单自动管理  
  · 用户自定义黑名单管理 (列表选择/检索选择)
* 项目管理  
  · 在线更新项目  
  · 本地备份项目  
  · 本地或服务器还原项目
* 信息加密存储  
  · 自动生成密文字典文件  
  · 使用密文存储账户信息/解锁密码等敏感信息
* 账户功能  
  · 防止其他账户意外收取 (需录入主账户信息)  
  · 主账户操作完毕可自动回切之前登录的账户
* 统计功能
* 适应恶劣条件  
  · 脚本在网络条件较差时仍可正常运行或识别异常
* 图形化配置工具  
  · 基于UI的配置工具 可详细配置项目参数

******
### 版本历史
******
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

##### 更多版本历史可参阅
* [CHANGELOG-2.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/documents/CHANGELOG-2.md)  ( 2.x 版本 )
* [CHANGELOG-1.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/documents/CHANGELOG-1.md)  ( 1.x 版本 )


[//]: # (
If you prefer to make a donation, run ant-forest-settings.js with Auto.js, then go to the "About" page and click my name. When the page with a pink "CLOSE" button popped up, you could see the QR Code by long-clicking this button. Blue QR Code for Alipay and green for WeChat. I believe i could make it better with your support.
)