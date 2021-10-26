## 蚂蚁森林 项目手册

- [项目简介](#项目简介)
    - [项目意义](#项目意义)
    - [功能介绍](#功能介绍)
    - [如何工作](#如何工作)
    - [工作原理](#工作原理)
- [准备工作](#准备工作)
    - [系统要求](#系统要求)
    - [Auto.js 准备](#autojs-准备)
        - [软件安装](#软件安装)
        - [开启无障碍服务](#开启无障碍服务)
        - [了解工作目录](#了解工作目录)
    - [项目准备](#项目准备)
        - [下载项目](#下载项目)
        - [直接部署项目](#直接部署项目)
        - [解压项目](#解压项目)
        - [项目目录迁移](#项目目录迁移)
        - [检查项目目录](#检查项目目录)
    - [Auto.js 注意事项](#autojs-注意事项)
        - [无障碍服务](#无障碍服务)
        - [运行脚本文件](#运行脚本文件)
        - [创建快捷方式](#创建快捷方式)
        - [导入脚本文件](#导入脚本文件)
        - [修改工作目录](#修改工作目录)
- [使用项目](#使用项目)
    - [项目启动器](#项目启动器)
    - [项目配置工具](#项目配置工具)
    - [其他辅助工具](#其他辅助工具)
- [其他](#其他)
    - [声明](#声明)
    - [推荐阅读](#推荐阅读)
    - [致谢](#致谢)

## 项目简介

### 项目意义

实现蚂蚁森林能量球的自动采集  
提供智能化且个性化的参数配置

### 功能介绍

收取自己能量 收取好友能量  
自动解锁 定时任务 黑名单机制  
循环监测 任务排队 事件监测  
项目管理 账户功能 统计功能  
图形化配置工具等

### 如何工作

使用 Auto.js 软件运行 JavaScript 语言代码  
通过 Auto.js 封装模块及安卓 API 调用  
实现蚂蚁森林的一系列自动化智能操作  
如自动点击 / 滑动 / 页面跳转等

### 工作原理

Auto.js 使用 Rhino 作为代码解释器  
可直接运行 JavaScript 语言代码  
支持 ES5 与部分 ES6 特性

Auto.js 的自动操作主要基于控件与坐标
> 基于坐标的模拟操作
>> 传统按键精灵/触摸精灵等脚本软件  
> > 采用通过屏幕坐标实现点击/长按等模拟操作  
> > 结合找图找色/坐标放缩等可达到较好兼容性  
> > 这种方式需要安卓 7.0 版本以上或 Root 权限
>
> 基于控件的模拟操作
>> 此方式依赖于无障碍服务选择屏幕上的控件  
> > 获取控件包含的信息或对其进行操作  
> > 结合通知/按键事件监听等可达到更好的使用效果

## 准备工作

### 系统要求

- Android 版本: 7.0+
- Root 权限: 不必要

### Auto.js 准备

##### 软件安装

- 免费版本 [4.1.1 Alpha2](https://github.com/SuperMonster002/Hello-Sockpuppet/raw/master/%5Bauto.js%5D%5B4.1.1_alpha2%5D%5Barm-v7%5D(b69a4e23).apk?raw=true)

- 其他版本详见 [README.md](https://github.com/SuperMonster003/Ant-Forest#autojs%E5%8F%AF%E7%94%A8%E7%89%88%E6%9C%AC)

##### 开启无障碍服务

- 开关位于软件主页左侧抽屉

##### 了解工作目录

- Auto.js 软件运行后显示的目录即为工作目录
- 在工作目录下的项目或脚本才会显示在 Auto.js 软件中
- 工作目录通常包含以下几种可能  
  \- /内部存储/脚本/  
  \- /emulated/storage/0/脚本/  
  \- /internal storage/Scripts/  
  \- /emulated/storage/0/Scripts/

### 项目准备

##### 获取项目

    任选一种方式

- [下载项目部署工具](https://raw.githubusercontent.com/SuperMonster003/Ant-Forest/master/tools/ant-forest-deployment-tool.min.js) (*
  .js) (推荐)
- [下载最新版本数据包](https://github.com/SuperMonster003/Ant-Forest/archive/master.zip) (*.zip)
- [查看其他版本数据包](https://github.com/SuperMonster003/Ant-Forest/releases) (*.zip)

##### 直接部署项目

- 注: 此步骤仅针对项目部署工具 (不适用于项目数据包)
- 注: 浏览器可能会直接浏览文件内容 需另存为或下载得到js格式文件
- 使用 `Auto.js` 直接运行或导入后运行项目部署工具即可

##### 解压项目

- 注: 此步骤仅针对项目数据包 (不适用于项目部署工具)
- 使用文件管理器解压 "zip" 格式的项目包
- 得到 "Ant-Forest-master" 文件夹 (作为项目目录)
- 项目目录可更改目录名 (如 Ant-Forest-003)
- 项目目录内应包含 "modules" 等文件夹
- 项目目录内应包含 "js" 格式的文件

##### 项目目录迁移

- 注: 此步骤仅针对项目数据包 (不适用于项目部署工具)
- 使用文件管理器将项目目录移动到工作目录
- 此步骤不可使用 Auto.js 的导入功能替代

##### 检查项目目录

- Auto.js 主页应出现项目目录 (如 Ant-Forest-003)
- 可能需要下拉刷新或重启 Auto.js 后才会出现项目目录

### Auto.js 注意事项

##### 无障碍服务

- 模拟点击和滑动均需要无障碍服务
- 无障碍服务会因 Auto.js 进程结束等原因而自动关闭
- Root 权限可自动启动无障碍服务 (需在设置中开启)

##### 运行脚本文件

- 点击项目目录顶部的项目运行按钮 (三角形标记)
- 或点击可执行的脚本文件右侧运行按钮 (三角形标记)
- 点击运行按钮时可能因点击位置不准确而进入脚本编辑页面
- 大于 400KB 的脚本文件在编辑时可能导致 Auto.js 崩溃

##### 创建快捷方式

- 脚本文件右侧菜单键可创建桌面快捷方式
- 使用桌面快捷方式可避免运行按钮较小而引起的误触问题

##### 导入脚本文件

- Auto.js 可直接导入 "js" 格式的脚本文件
- 但不支持目录导入 (当前项目的结构即为目录结构)

##### 修改工作目录

- Auto.js 软件设置页面 -> 更改脚本文件夹路径
- 此路径为相对路径 (且前后的 "/" 均可省略)
- 路径更改后需重启 Auto.js 或设备才可生效 (下拉刷新无效)

## 使用项目

### 项目启动器

    项目目录 / ant-forest-launcher.js

- 推荐使用桌面快捷方式运行此脚本

### 项目配置工具

    项目目录 / ant-forest-settings.js

- 此脚本用于配置项目参数
- 运行后在页面全部加载完成前可能出现卡顿及响应延迟
- 功能页面或配置项有 "帮助提示" 或 "了解更多" 供查阅参考
- 推荐使用桌面快捷方式运行此脚本

### 其他辅助工具

    项目目录 / tools /

- ant-forest-deployment-tool.js
    - 项目部署工具
- ant-forest-deployment-tool.min.js
    - 项目部署工具的压缩版本
- auto.js-memory-info-tool.js
    - Auto.js 内存信息工具
- auto.js-write-settings-permission-helper.js
    - 辅助跳转到 Auto.js 的 "修改系统设置" 权限页面
- energy-balls-recognition-inspector.js
    - 能量球识别测试工具
- energy-balls-recognition-region-config.js
    - 能量球识别范围参数配置工具
    - 首次使用点击蓝色 "帮助" 按钮获取使用方法
- energy-rain-harvesting.js
    - 能量雨收集工具
- inspect-lock-screen-layout.js
    - 解锁布局抓取工具
- inspect-specified-screen-layout.js
    - 页面布局捕获工具
- unlock-config-tool.js (已临时移除)
    - 解锁功能配置工具
    - 所有参数与项目配置工具的 "自动解锁" 功能同步
- show-alarm-countdown.js
    - 闹钟倒计时工具
- show-next-auto-task-countdown.js
    - 定时任务倒计时工具

## 其他

### 声明

- 项目完全开源 (即公开所有源代码) 且免费使用
- 项目仅供个人使用 不可用于商业用途或贩卖盈利
- 此文档无法保证时效性 具体以实际项目版本为准

### 推荐阅读

- [Auto.js 官方源码 - https://github.com/hyb1996/Auto.js](https://github.com/hyb1996/Auto.js)
- [Auto.js 官方文档 - http://docs.autojs.org](http://docs.autojs.org/#/?id=%e7%bb%bc%e8%bf%b0)
- [Auto.js 示例典藏 - https://github.com/snailuncle/autojsDemo](https://github.com/snailuncle/autojsDemo)

### 致谢

- [hyb1996](https://github.com/hyb1996)
- [e1399579](https://github.com/e1399579)
- [Nick-Hopps](https://github.com/Nick-Hopps)
- [TonyJiangWJ](https://github.com/TonyJiangWJ)