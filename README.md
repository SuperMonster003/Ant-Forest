<!--suppress HtmlDeprecatedAttribute -->

<div align="center">
  <p>
    <img alt="AF_Banner" src="https://raw.githubusercontent.com/SuperMonster002/Hello-Sockpuppet/master/ant-forest-banner_374%C3%97106.png"/>
  </p>

  <p>基于 Auto.js 的蚂蚁森林能量自动收取脚本</p>
  <p>Auto.js-based ant forest energy auto-collect script</p>

  <p>
    <a href="https://github.com/SuperMonster003/Ant-Forest/releases/latest"><img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/SuperMonster003/Ant-Forest"/></a>
    <a href="https://github.com/SuperMonster003/Ant-Forest/issues"><img alt="GitHub closed issues" src="https://img.shields.io/github/issues/SuperMonster003/Ant-Forest?color=009688"/></a>
    <a href="https://github.com/SuperMonster003/AutoJs6"><img alt="GitHub AutoJs6 repository" src="https://img.shields.io/badge/auto.js->= 6.2.0-67a91b"/></a>
    <a href="https://github.com/topics/javascript"><img alt="GitHub top language" src="https://img.shields.io/github/languages/top/SuperMonster003/Ant-Forest?color=eb8031"/></a>
    <a href="https://www.codefactor.io/repository/github/SuperMonster003/Ant-Forest"><img alt="CodeFactor Grade" src="https://www.codefactor.io/repository/github/SuperMonster003/Ant-Forest/badge"/></a>
    <br>
    <a href="https://github.com/SuperMonster003/Ant-Forest/commit/d43a0119b214a17062501ea8a938b13bd97d2028"><img alt="Created" src="https://img.shields.io/date/1552924800?color=2e7d32&label=created"/></a>
    <a href="https://github.com/SuperMonster003/Ant-Forest/find/master"><img alt="GitHub Code Size" src="https://img.shields.io/github/languages/code-size/SuperMonster003/Ant-Forest?color=795548"/></a>
    <a href="https://github.com/SuperMonster003/Ant-Forest/find/master"><img alt="GitHub Code Lines" src="https://img.shields.io/tokei/lines/github/SuperMonster003/Ant-Forest?color=37474F"/></a>
    <a href="https://github.com/SuperMonster003/Ant-Forest/blob/master/LICENSE"><img alt="GitHub License" src="https://img.shields.io/github/license/SuperMonster003/Ant-Forest?color=534BAE"/></a>
    <a href="https://www.jetbrains.com/?from=Ant-Forest"><img alt="JetBrains supporter" src="https://img.shields.io/badge/supporter-JetBrains-ee4677"/></a>
    <a href="https://github.com/SuperMonster003/Ant-Forest/blob/master/assets/docs/TODO.md"><img alt="Todo list" src="https://img.shields.io/badge/todo-56-C63F17"/></a>
  </p>
</div>

******

### 待办事项

******

| Status | Task                             |        Date         | Cost |            Progress            |
|:------:|----------------------------------|:-------------------:|:----:|:------------------------------:|
|   ✔️   | 推迟任务加入下次关屏选项                     | 2021-11-01 18:16:56 |  5   |               1                |
|   ✔️   | 能量雨加入近似区域点击检测                    | 2021-10-27 14:48:18 |  3   |               1                |
|   ✔️   | v2.2.0 发布后检查 documents 相关的链接     | 2021-10-26 23:07:16 |  1   |               1                |
|   ✒️   | 扩展模块及插件重构                        | 2021-10-26 14:37:07 | ! 8  |     0.39 <!-- 13 / 33 -->      |
|   ✒️   | 排行榜策略加入黑名单检测方案配置 (#529)          | 2021-10-31 18:57:17 | ! 5  |              0.00              |
|   ✒️   | 事件监测配置 (#533) <!-- REM#1 -->     | 2021-10-26 10:50:40 | ! 6  |      0.00 <!-- 0 / 3 -->       |
|   ✒️   | 自动关闭屏幕配置 (#476) <!-- REM#4 -->   | 2021-10-26 11:15:11 | ! 6  |              0.00              |
|   ✒️   | 提取 JSDoc@typedef 到 TS 声明文件       | 2021-10-25 22:25:18 |  10  |    0.94 <!-- 1 - 5 / 86 -->    |
|   ✒️   | 保护地巡护工具                          | 2021-10-26 10:34:25 |  9   |       0.20 <!-- est -->        |
|   ✒️   | 将 tool functions 转换为 OOP         | 2021-10-25 22:24:13 |  10  |  0.18 <!-- 1 - 208 / 256 -->   |
|   ✒️   | 分离 appx 模块 (autojs / alipay ...) | 2021-10-25 22:24:13 |  6   |   0.17 <!-- 1 - 24 / 29 -->    |
|   ✒️   | 启动器模块化                           | 2021-10-26 08:25:42 |  10  | 0.00 <!-- 1 -  6947 / 6998 --> |
|   ✒️   | 配置工具模块化                          | 2021-10-26 08:24:34 |  10  | 0.00 <!-- 1 - 8152 / 8138 -->  |

> 全部待办事项可参阅 [TODO.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/assets/docs/TODO.md) (共计 56 项)

******

### 使用说明

******

1. 检查设备环境

- 操作系统: [Android 7.0](https://zh.wikipedia.org/wiki/Android_Nougat) (`API 24`) 及以上

2. 下载并安装 Auto.js

- [AutoJs6](https://github.com/SuperMonster003/AutoJs6/releases/latest) (`开源免费`)

> 自 v2.3.0 起将仅支持使用 AutoJs6 运行当前项目  
> 因项目运行依赖于 [Rhino 引擎](https://github.com/mozilla/rhino) 的部分 [新特性](https://github.com/SuperMonster003/AutoJs6/blob/master/app/src/main/assets/doc/RHINO.md) 及 AutoJs6 的部分新 API 及内置模块

3. 下载并部署项目 (任意一种方式)

- [下载项目部署工具](https://raw.githubusercontent.com/SuperMonster003/Ant-Forest/master/tools/ant-forest-deployment-tool.min.js) (`*.js`)
    1. 将部署工具 (脚本文件) `保存` 或 `另存为` 至本地存储
    2. 用 `AutoJs6` 直接运行 (或导入后运行) 脚本文件完成部署
    3. 部署后可能需要关闭并重启 `AutoJs6` 才能看到项目目录
- [下载最新项目数据包](https://github.com/SuperMonster003/Ant-Forest/archive/master.zip) (`*.zip`)
    1. 将项目数据包解压到本地存储
    2. 定位到设备的内部存储目录 如:  
       `/内部存储/` `/Internal Storage/` `/sdcard/` `/storage/emulated/0/` 等
    3. 在此目录下找到 `AutoJs6` 默认工作目录  
       · 中文系统默认目录 `./脚本/`  
       · 英文系统默认目录 `./Scripts/`
    4. 若不存在则需手动建立工作目录  
       或在 `AutoJs6` 软件中设置工作目录
    5. 将解压后的项目文件夹放置在工作目录中

> 项目支持更新版本的自动检查/提示/下载/版本忽略等相关功能

4. 使用 Auto.js 运行项目

- 运行 `ant-forest-launcher.js` 启动项目
- 运行 `ant-forest-settings.js` 配置项目

> 项目 `tools` 文件夹包含 [小工具](https://github.com/SuperMonster003/Ant-Forest/blob/master/assets/docs/MANUAL.md#%E5%85%B6%E4%BB%96%E8%BE%85%E5%8A%A9%E5%B7%A5%E5%85%B7)

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
* 收取结果统计/展示

<details><summary>查看更多功能</summary><br>

* 控制台消息提示  
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
  · 使用密文存储账户信息/解锁密码等敏感信息
* 账户功能  
  · 防止其他账户意外收取 (需录入主账户信息)  
  · 主账户操作完毕可自动回切之前登录的账户
* 统计功能
* 适应恶劣条件  
  · 脚本在网络条件较差时仍可正常运行或识别异常
* 图形化配置工具  
  · 基于UI的配置工具 可详细配置项目参数

</details>

******

### 版本历史

******

[comment]: <> (Version history only shows last 3 versions)

# v2.3.1

###### 2023/01/21

* `修复` 蚂蚁森林页面更新后无法收取自己及好友能量的问题

# v2.3.0

###### 2022/03/20 - 代码重构 谨慎升级

* `优化` 重构部分模块以适配 AutoJs6

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

##### 更多版本历史可参阅

* [CHANGELOG-2.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/assets/docs/CHANGELOG-2.md)  ( 2.x 版本 )
* [CHANGELOG-1.md](https://github.com/SuperMonster003/Ant-Forest/blob/master/assets/docs/CHANGELOG-1.md)  ( 1.x 版本 )

******

### 相关项目

******

* [Auto.js](https://github.com/hyb1996/Auto.js) { author: [hyb1996](https://github.com/hyb1996) }
    - `安卓平台 JavaScript 自动化工具`
* [Auto.js-TypeScript-Declarations](https://github.com/SuperMonster003/Auto.js-TypeScript-Declarations) { author: [SuperMonster003](https://github.com/SuperMonster003) }
    - `Auto.js 声明文件 (d.ts)`

******

### 打赏 (Tip)

******

<details><summary>查看详情 (Click to show details)</summary><br>
<div align="center">
To tip online, scan the QR code below <br>
扫描对应二维码可打赏 <br><br>
I believe I could make it better with your support :) <br>
感谢每一份支持和鼓励 <br><br>

<a href="https://raw.githubusercontent.com/SuperMonster002/Hello-Sockpuppet/master/qr-alipay-sponsor_521%C3%97648.png"><img alt="Alipay sponsor" src="https://raw.githubusercontent.com/SuperMonster002/Hello-Sockpuppet/master/qr-alipay-sponsor_521%C3%97648.png" height="224"/></a>
<a href="https://raw.githubusercontent.com/SuperMonster002/Hello-Sockpuppet/master/qr-wechat-sponsor_521%C3%97648.png"><img alt="WeChat sponsor" src="https://raw.githubusercontent.com/SuperMonster002/Hello-Sockpuppet/master/qr-wechat-sponsor_521%C3%97648.png" height="224"/></a>
</div>
</details>