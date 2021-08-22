# Ant Forest

![AF_Banner](https://github.com/SuperMonster002/Hello-Sockpuppet/raw/master/Ant_Forest_Banner_361%C3%97103.png)

###### 基于 Auto.js 的蚂蚁森林能量自动收取脚本

###### Auto.js\-based ant forest energy auto-collect script

******

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/SuperMonster003/Ant-Forest)](https://github.com/SuperMonster003/Ant-Forest/releases/latest)
[![GitHub closed issues](https://img.shields.io/github/issues/SuperMonster003/Ant-Forest?color=009688)](https://github.com/SuperMonster003/Ant-Forest/issues)
[![Auto.js](https://img.shields.io/badge/auto.js-%3E%3D%204.1.1%20alpha2-67a91b)](https://github.com/hyb1996/Auto.js)
[![GitHub top language](https://img.shields.io/github/languages/top/SuperMonster003/Ant-Forest?color=eb8031)](https://github.com/topics/javascript)
[![CodeFactor Grade](https://www.codefactor.io/repository/github/supermonster003/ant-forest/badge?s=61cf94a3f5266c39dd9c4873d2413a9cf365a3eb)](https://www.codefactor.io/repository/github/supermonster003/ant-forest)
[![Created](https://img.shields.io/date/1552924800?color=2e7d32&label=created)](https://github.com/SuperMonster003/Ant-Forest/commit/d43a0119b214a17062501ea8a938b13bd97d2028)
[![Lines](https://img.shields.io/github/languages/code-size/SuperMonster003/Ant-Forest?color=795548)](https://github.com/SuperMonster003/Ant-Forest/find/master)
[![JetBrains](https://img.shields.io/badge/supporter-JetBrains-%23ee4677)](https://www.jetbrains.com/?from=Ant-Forest)

******
### 使用说明
******

1. 检查设备环境

- 操作系统: Android 7.0+

2. 下载并安装 Auto.js

- [4.1.1 Alpha2](https://github.com/SuperMonster002/Hello-Sockpuppet/raw/master/%5Bauto.js%5D%5B4.1.1_alpha2%5D%5Barm-v7%5D(b69a4e23).apk?raw=true) (`免费版本`)
- [Pro 7.0.4-1](https://github.com/SuperMonster002/Hello-Sockpuppet/blob/master/%5Bauto.js%5D%5Bpro_7.0.4-1%5D(31b16c93).apk?raw=true) (`付费版本`)
- [Pro 8.3.16-0](https://github.com/SuperMonster002/Hello-Sockpuppet/blob/master/%5Bauto.js%5D%5Bpro_8.3.16-0%5D(9a414abf).apk?raw=true) (`付费版本`)

3. 下载并部署项目 (任意一种方式)

- [下载项目部署工具](https://raw.githubusercontent.com/SuperMonster003/Ant-Forest/master/tools/ant-forest-deployment-tool.min.js) (`*.js`)
    1. 将部署工具 (脚本文件) `保存` 或 `另存为` 至本地存储
    2. 用 `Auto.js` 直接运行 (或导入后运行) 脚本文件完成部署
    3. 部署后可能需要关闭并重启 `Auto.js` 才能看到项目目录
- [下载最新项目数据包](https://github.com/SuperMonster003/Ant-Forest/archive/master.zip) (`*.zip`)
    1. 将项目数据包解压到本地存储
    2. 定位到设备的内部存储目录 如:  
       `/内部存储/` `/Internal Storage/` `/sdcard/` `/storage/emulated/0/` 等
    3. 在此目录下找到 `Auto.js` 默认工作目录  
       · 中文系统默认目录 `./脚本/`  
       · 英文系统默认目录 `./Scripts/`
    4. 若不存在则需手动建立工作目录  
       或在 `Auto.js` 软件中设置工作目录
    5. 将解压后的项目文件夹放置在工作目录中

4. 使用 Auto.js 运行项目

- 运行 `ant-forest-launcher.js` 启动项目
- 运行 `ant-forest-settings.js` 配置项目
- 项目 `tools` 文件夹包含小工具 (详见[项目文档](https://github.com/SuperMonster003/Ant-Forest/blob/master/documents/MANNUAL.md#%E5%85%B6%E4%BB%96%E8%BE%85%E5%8A%A9%E5%B7%A5%E5%85%B7))

******
### 使用指南
******

* [快速手册](https://www.bilibili.com/video/av91979276/) (`视频`)
* [项目文档](https://github.com/SuperMonster003/Ant-Forest/wiki/%E8%9A%82%E8%9A%81%E6%A3%AE%E6%9E%97-(Ant-Forest)) (`文字`)

******
### 功能简介
******

* 自动收取好友能量
* 自动收取/监测自己能量
* 收取结果统计/展示/数据筛查
* 控制台消息提示  
  · 详细/简略  
  · 开发者测试日志 (默认关闭)
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
* 多语言支持 (简体中文/英语)  
  · 自动切换简体中文语言
* 黑名单机制  
  · 能量保护罩黑名单自动管理  
  · 用户自定义黑名单管理 (列表选择/检索选择)
* 项目管理  
  · 在线更新项目  
  · 本地备份项目  
  · 本地或服务器还原项目  
  · 项目更新提示/版本忽略
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

##### 更多版本历史可参阅

* [CHANGELOG-2.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/documents/CHANGELOG-2.md)  ( 2.x 版本 )
* [CHANGELOG-1.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/documents/CHANGELOG-1.md)  ( 1.x 版本 )

[comment]: <> (
If you prefer to make a donation, run ant-forest-settings.js with Auto.js, then go to the "About" page and click my name. When the page with a pink "CLOSE" button popped up, you could see the QR Code by long-clicking this button. Blue QR Code for Alipay and green for WeChat. I believe i could make it better with your support.
)