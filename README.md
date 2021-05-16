# Ant Forest

![AF_Banner](https://github.com/SuperMonster002/Hello-Sockpuppet/raw/master/Ant_Forest_Banner_361%C3%97103.png)

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
   \* 浏览器可能需要点击 `另存为` 或 `下载` 至本地  
   [下载最新项目数据包](https://github.com/SuperMonster003/Ant-Forest/archive/master.zip) (`*.zip`)  
   \* 手机可能需要额外的 `文件管理` 或 `解压缩` 工具
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
   \* 项目目录中也可直接点击上方的 `运行项目` 按钮
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

[comment]: <> (Version history only shows last 3 versions)

# v2.1.1
###### 2021/05/16
* `新增` 能量雨收集工具 (简易) (/tools/energy-rain-harvesting.js)
* `修复` 配置工具采集排行榜列表数据功能异常 _[`issue #462`](https://github.com/SuperMonster003/Ant-Forest/issues/462)_
* `修复` 部署工具备份本地项目时无法处理空项目目录的问题 _[`issue #459`](https://github.com/SuperMonster003/Ant-Forest/issues/459)_
* `优化` 完善Auto.js版本异常检测列表及异常提示界面样式
* `优化` 逛一逛按钮采集方案结束页面判断条件 _[`issue #391`](https://github.com/SuperMonster003/Ant-Forest/issues/391#issuecomment-840679845)_

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

##### 更多版本历史可参阅
* [CHANGELOG-2.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/documents/CHANGELOG-2.md)  ( 2.x 版本 )
* [CHANGELOG-1.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/documents/CHANGELOG-1.md)  ( 1.x 版本 )


[comment]: <> (
If you prefer to make a donation, run ant-forest-settings.js with Auto.js, then go to the "About" page and click my name. When the page with a pink "CLOSE" button popped up, you could see the QR Code by long-clicking this button. Blue QR Code for Alipay and green for WeChat. I believe i could make it better with your support.
)