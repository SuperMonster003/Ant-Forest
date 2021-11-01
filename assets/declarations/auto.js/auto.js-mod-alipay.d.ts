// Type definitions for Auto.js external module ext-app.js
//
// Project: https://github.com/SuperMonster003/Ant-Forest
// Definitions by: SuperMonster003 <https://github.com/SuperMonster003>
// Definitions: https://github.com/SuperMonster003/Ant-Forest/assets/declarations
// TypeScript Version: 4.3.5
//
// Last modified: Oct 21, 2021

/// <reference path="./auto.js-declarations.d.ts" />

/**
 * @Source %project%/modules/ext-app.js
 */

declare namespace Mod {
    interface Alipay {
        package_name: string;
        app_name: string;
        app_preset: Record<Alipay.App.PresetId, Alipay.App.Id | Alipay.App.URL | [Alipay.App.URL, Alipay.JSBridge.WebviewOptions]>;
        startApp(app_id: Alipay.App.Id, url?: Alipay.App.URL | null, webview_options?: Alipay.JSBridge.WebviewOptions): boolean;
        startApp(app_id: Alipay.App.Id, webview_options?: Alipay.JSBridge.WebviewOptions): boolean;
        /**
         * Start alipay app with app_id 20000067 (h5 app)
         * @example
         * alipay.startApp(60000002); // ant forest (zh-CN: 蚂蚁森林)
         */
        startApp(url?: Alipay.App.URL | null, webview_options?: Alipay.JSBridge.WebviewOptions): boolean;
    }

    let alipay: { alipay: Alipay };
}

declare namespace Alipay {
    namespace App {
        type PresetId = 'af_homepage' | 'af_rank_list' | 'af_energy_rain' | 'settings_general' | 'account_manager' | 'account_login' | 'account_nickname';
        type URL = string | [string, { [p: string]: any }];
        type Id = PresetId | keyof JSBridge.AppIdInfo | number | string;
    }
    namespace URI {
        type StartApp = 'alipays://platformapi/startapp';
    }
    namespace JSBridge {
        // noinspection SpellCheckingInspection
        interface AppIdInfo {
            /** native */
            '09999988': '转账';
            /** native */
            '09999999': '信用卡还款';
            /** native */
            '10000007': '扫一扫';
            /** H5 */
            '10000009': '爱心捐赠';
            /** HCF */
            '10000033': '话费卡转让';
            /** native */
            '10000110': '关于';
            /** H5 */
            '20000000': '天猫';
            /** native */
            '20000003': '账单';
            /** native */
            '20000004': '我的Tab';
            /** native */
            '20000014': '银行卡';
            /** native */
            '20000019': '账户详情';
            /** native */
            '20000024': '支付设置';
            /** native */
            '20000032': '余额宝';
            /** native */
            '20000038': '实名认证';
            /** native */
            '20000049': '反馈';
            /** H5 */
            '20000067': 'H5通用容器';
            /** native */
            '20000070': '安全设置';
            /** native */
            '20000077': '娱乐宝';
            /** H5 */
            '20000078': '上银汇款';
            /** native */
            '20000085': '我的二维码';
            /** native */
            '20000088': '城市一卡通';
            /** native */
            '20000101': '生活号';
            /** H5 */
            '20000107': '出境';
            /** native */
            '20000118': '芝麻信用';
            /** H5 */
            '20000120': '饿了么外卖';
            /** native */
            '20000123': '收款';
            /** H5 */
            '20000130': '快的打车';
            /** native */
            '20000131': '淘票票电影';
            /** H5 */
            '20000132': '亲情号';
            /** native */
            '20000134': '股票';
            /** H5 */
            '20000135': '火车票机票';
            /** H5 */
            '20000139': '飞猪酒店';
            /** H5 */
            '20000142': '娱乐宝';
            /** H5 */
            '20000143': '火车票';
            /** H5 */
            '20000150': '汇率换算';
            /** H5 */
            '20000152': '海外交通卡';
            /** H5 */
            '20000153': '游戏中心';
            /** H5 */
            '20000157': '国际机票';
            /** H5 */
            '20000160': '支付宝会员';
            /** native */
            '20000161': '理财小工具';
            /** H5 */
            '20000162': '羊城通充值';
            /** H5 */
            '20000165': '定期';
            /** native */
            '20000166': '我的朋友';
            /** native */
            '20000168': '记账本';
            /** H5 */
            '20000178': '城市服务';
            /** H5 */
            '20000180': '蚂蚁借呗';
            /** native */
            '20000184': '手势';
            /** native */
            '20000186': '个人主页';
            /** H5 */
            '20000193': '生活缴费';
            /** H5 */
            '20000196': 'H5公共资源';
            /** H5 */
            '20000199': '花呗';
            /** H5 */
            '20000202': 'H5运营活动资源包';
            /** native */
            '20000205': '亲情圈';
            /** H5 */
            '20000218': '黄金';
            /** native */
            '20000219': '图片';
            /** native */
            '20000221': '转账';
            /** native */
            '20000226': '位置';
            /** native */
            '20000227': '卡券';
            /** native */
            '20000228': '个人名片';
            /** H5 */
            '20000241': '蚂蚁乐驾';
            /** H5 */
            '20000243': '总资产';
            /** native */
            '20000245': '收藏';
            /** native */
            '20000259': '活动收款';
            /** H5 */
            '20000266': '信用卡账单';
            /** native */
            '20000298': '数字证书';
            /** native */
            '20000307': '暗号';
            /** native */
            '20000308': '支付宝账号';
            /** H5 */
            '20000522': '1688好货源';
            /** native */
            '20000672': '活动群';
            /** native */
            '20000674': '收款';
            /** native */
            '20000688': '红包';
            /** H5 */
            '20000691': '我的客服';
            /** native */
            '20000710': '淘宝会员名';
            /** H5 */
            '20000714': '我的收货地址';
            /** native */
            '20000723': '隐私';
            /** native */
            '20000724': '通用';
            /** H5 */
            '20000735': '蚂蚁微客';
            /** H5 */
            '20000750': '在线理赔';
            /** native */
            '20000752': '悄悄话';
            /** H5 */
            '20000754': '我的快递';
            /** native */
            '20000774': '通知栏';
            /** H5 */
            '20000778': '滴滴出行';
            /** native */
            '20000780': '小视频';
            /** H5 */
            '20000791': '圈存机';
            /** H5 */
            '20000793': '基金';
            /** H5 */
            '20000796': '地铁票购票';
            /** H5 */
            '20000811': '蚂蚁财富';
            /** native */
            '20000820': '新的朋友';
            /** H5 */
            '20000827': '云客服';
            /** H5 */
            '20000834': '淘票票H5票券';
            /** native */
            '20000835': '智能助理';
            /** H5 */
            '20000859': '大学生活';
            /** H5 */
            '20000869': '运动';
            /** H5 */
            '20000877': '国内机票逆向';
            /** H5 */
            '20000895': '境外上网';
            /** H5 */
            '20000899': '网商贷';
            /** H5 */
            '20000905': '充值助手';
            /** H5 */
            '20000909': '生活号';
            /** H5 */
            '20000913': '网商银行';
            /** H5 */
            '20000917': '支付宝';
            /** H5 */
            '20000919': '车主服务';
            /** H5 */
            '20000920': '发票管家';
            /** H5 */
            '20000922': '汽车票';
            /** H5 */
            '20000923': '口碑卡券';
            /** H5 */
            '20000936': '蚂蚁保险';
            /** H5 */
            '20000939': '支付结果页口碑推荐';
            /** native */
            '20000943': '生活圈';
            /** native */
            '20000951': '群聊';
            /** H5 */
            '20000971': '有财教练';
            /** H5 */
            '20000975': '口碑我的订单';
            /** H5 */
            '20000981': '心愿储蓄-余额宝';
            /** H5 */
            '20000987': '充值中心';
            /** H5 */
            '20000988': '体育服务';
            /** H5 */
            '20000989': 'H5在线买单';
            /** H5 */
            '20000991': '商家动态';
            /** H5 */
            '20001010': '安全课堂';
            /** H5 */
            '20001045': '财富交易组件';
            /** H5 */
            '20001091': '大学充值缴费';
            /** native */
            '20001116': '安全备忘';
            /** native */
            '20001121': '一字千金';
            /** native */
            '200011235': '乘车码';
            /** H5 */
            '2013062600000474': '校园一卡通';
            /** independent */
            '2013082800000932': '淘宝';
            /** H5 */
            '2014021200003129': '教育缴费';
            /** H5 */
            '2017041206668232': 'ofo小黄车';
            /** H5 */
            '2017050407110255': '哈啰出行';
            /** H5 */
            '2018030502317859': '每日必抢';
            /** H5 */
            '2018070960585195': '高德打车';
            /** H5 */
            '2018072560844004': '小程序收藏';
            /** H5 */
            '60000002': '蚂蚁森林';
            /** H5 */
            '60000006': '专属优惠频道';
            /** H5 */
            '60000007': '国内机票React正向';
            /** H5 */
            '60000008': '手艺人';
            /** H5 */
            '60000010': '加载中';
            /** H5 */
            '60000011': '安全设备';
            /** H5 */
            '60000012': '中小学';
            /** H5 */
            '60000014': '口碑在线购买H5';
            /** H5 */
            '60000016': '账单关联业务-h5';
            /** H5 */
            '60000018': '基金组合';
            /** H5 */
            '60000023': '蚂蚁公益保险';
            /** H5 */
            '60000026': '商圈';
            /** H5 */
            '60000029': '月度榜单';
            /** H5 */
            '60000032': '电子证件';
            /** H5 */
            '60000033': 'in定制印品';
            /** H5 */
            '60000039': '大牌抢购';
            /** H5 */
            '60000040': '未来酒店';
            /** H5 */
            '60000044': '支付成功页权益区';
            /** H5 */
            '60000050': '社交聚合H5';
            /** H5 */
            '60000057': '蚂蚁宝卡';
            /** H5 */
            '60000070': '地铁购票';
            /** H5 */
            '60000071': '天天有料';
            /** H5 */
            '60000076': 'VIP预约服务';
            /** H5 */
            '60000081': '商家服务';
            /** H5 */
            '60000091': 'Mini花呗';
            /** H5 */
            '60000098': '电子公交卡';
            /** H5 */
            '60000103': '奖励金';
            /** H5 */
            '60000105': '银行卡';
            /** H5 */
            '60000119': '定期+';
            /** H5 */
            '60000120': '福员外';
            /** H5 */
            '60000121': '投票';
            /** H5 */
            '60000125': '租房';
            /** H5 */
            '60000126': '余额宝';
            /** H5 */
            '60000130': '淘票票H5购票';
            /** H5 */
            '60000132': '质押资产';
            /** H5 */
            '60000134': '预约兑换';
            /** H5 */
            '60000135': '飞猪汽车票新版';
            /** H5 */
            '60000138': '飞猪国内机票';
            /** H5 */
            '60000141': '医疗健康';
            /** H5 */
            '60000142': '财富运营承接中间页';
            /** H5 */
            '60000145': '冻结金额';
            /** H5 */
            '60000146': '我的快递-寄件平台';
            /** H5 */
            '60000147': 'h5券详情页面';
            /** H5 */
            '60000148': '财富号';
            /** H5 */
            '60000150': '我的口碑';
            /** H5 */
            '60000151': '快消优惠';
            /** H5 */
            '60000154': 'AA收款';
            /** H5 */
            '60000155': '交通出行';
            /** H5 */
            '60000156': '红包相关H5产品';
            /** H5 */
            '60000157': '支付签约中心';
            /** H5 */
            '60000158': '借呗任务平台';
            /** H5 */
            '60000161': '周周乐';
            /** native */
            '60000164': '红包';
            /** H5 */
            '66666666': '小程序';
            /** H5 */
            '66666667': '会员卡';
            /** H5 */
            '66666669': '口碑资源加速二';
            /** H5 */
            '66666670': '国际资源加速一';
            /** H5 */
            '66666672': '新消息通知';
            /** H5 */
            '66666673': '风险评测';
            /** H5 */
            '66666674': '蚂蚁庄园';
            /** H5 */
            '66666675': '口碑生活圈问答';
            /** H5 */
            '66666676': '账单详情';
            /** H5 */
            '66666677': '亚博游戏';
            /** H5 */
            '66666678': 'AR';
            /** H5 */
            '66666679': '新人气榜单';
            /** H5 */
            '66666682': '福卡回忆';
            /** H5 */
            '66666683': '集分宝';
            /** H5 */
            '66666684': '信用借还';
            /** H5 */
            '66666685': '网银大额充值';
            /** H5 */
            '66666686': '泛行业频道';
            /** H5 */
            '66666687': 'jet离线加速一';
            /** H5 */
            '66666688': '我的发票抬头';
            /** H5 */
            '66666689': '附近人气榜';
            /** H5 */
            '66666691': '店铺弹窗领券';
            /** H5 */
            '66666692': '小程序资源包';
            /** native */
            '66666696': 'AA收款';
            /** H5 */
            '66666698': '标签系统';
            /** H5 */
            '66666699': '境外当面付店铺码';
            /** H5 */
            '66666700': '实物黄金';
            /** H5 */
            '66666702': 'appraise';
            /** H5 */
            '66666706': '打开支付宝';
            /** H5 */
            '66666707': 'mallcoupon';
            /** H5 */
            '66666708': '余利宝';
            /** H5 */
            '66666710': '商圈聚合页';
            /** H5 */
            '66666711': '天猫资源加速';
            /** H5 */
            '66666713': '芝麻信用【了解分】';
            /** H5 */
            '66666714': '收钱码服务';
            /** H5 */
            '66666715': '信用卡还款H5';
            /** H5 */
            '66666718': '小程序关于页面';
            /** H5 */
            '66666719': '功能管理';
            /** H5 */
            '66666721': '钱包股票-社区资讯';
            /** H5 */
            '66666722': '钱包股票-行情和提醒';
            /** H5 */
            '66666724': '统一授权管理';
            /** H5 */
            '66666725': '人气眼饭点红包';
            /** H5 */
            '66666728': '区块链';
            /** H5 */
            '66666729': '口碑红人';
            /** H5 */
            '66666733': '花呗挖哦';
            /** H5 */
            '66666735': '基金组合';
            /** H5 */
            '66666741': '财富社区';
            /** H5 */
            '66666742': '口碑平台弹层';
            /** H5 */
            '66666743': '定时转账提醒';
            /** H5 */
            '66666746': '小程序领券应用';
            /** tiny */
            '66666748': '小程序示例升级';
            /** H5 */
            '66666749': '店铺详情页报错';
            /** H5 */
            '66666750': '保险号';
            /** H5 */
            '66666753': '大麦演出票';
            /** H5 */
            '66666754': '商圈券包';
            /** H5 */
            '66666755': '我的健康';
            /** H5 */
            '66666757': '国际支付成功页';
            /** H5 */
            '66666759': '流量钱包';
            /** H5 */
            '66666761': '消费捐';
            /** H5 */
            '66666762': '车金融';
            /** H5 */
            '66666773': '阿里智能';
            /** H5 */
            '66666774': '商家说';
            /** H5 */
            '66666776': '口碑签到';
            /** H5 */
            '66666777': '境外收款';
            /** H5 */
            '66666779': '懒人一键理财';
            /** H5 */
            '66666781': '支付宝刷脸付';
            /** H5 */
            '66666782': '蚂蚁庄园星星球';
            /** H5 */
            '66666783': '爱攒油加油站';
            /** H5 */
            '66666786': '信用生活';
            /** H5 */
            '66666787': '飞猪酒店订单';
            /** H5 */
            '66666788': '火车票正向主流程';
            /** H5 */
            '66666791': '商家经营分析';
            /** H5 */
            '66666793': '国庆红包弹层';
            /** H5 */
            '66666794': '星巴克红包活动';
            /** H5 */
            '66666796': '人传人转账拉新';
            /** H5 */
            '66666798': '支付宝月账单';
            /** H5 */
            '66666807': '飞猪国际机票WEEX';
            /** H5 */
            '66666808': '芝麻认证小程序';
            /** H5 */
            '66666809': '支付宝扫码红包';
            /** H5 */
            '66666810': '财富通用工具';
            /** H5 */
            '66666813': '黄金红包';
            /** H5 */
            '66666816': '小钱袋';
            /** H5 */
            '66666817': 'Tinyjs资源';
            /** H5 */
            '66666819': '还贷管家';
            /** H5 */
            '66666820': '天猫购物';
            /** H5 */
            '66666824': '绿色城市';
            /** H5 */
            '66666825': '财富标签页';
            /** H5 */
            '66666827': '泛行业会场';
            /** H5 */
            '66666829': '小富婆';
            /** H5 */
            '66666831': '一字千金';
            /** H5 */
            '66666860': '招牌来了';
            /** H5 */
            '66666861': '直播频道';
            /** H5 */
            '66666865': '口碑快消频道页';
            /** H5 */
            '66666867': '支付宝公益';
            /** H5 */
            '66666881': '淘票票H5资讯';
            /** H5 */
            '66666884': '口碑资源加速包一';
            /** H5 */
            '66666888': '国际机票交易';
            /** H5 */
            '66666897': '工资理财';
            /** H5 */
            '68686988': '银行卡';
            /** H5 */
            '68687023': '专享红包弹层';
            /** H5 */
            '68687028': '2018新春红包';
            /** H5 */
            '68687032': '信用租承接';
            /** H5 */
            '68687049': '蚂蚁星愿';
            /** H5 */
            '68687081': 'DIY主题红包';
            /** H5 */
            '68687093': '淘票票';
            /** H5 */
            '68687095': '淘票票H5票券';
            /** H5 */
            '68687096': '淘票票H5购票';
            /** H5 */
            '68687110': '亲子账户';
            /** H5 */
            '68687131': '养老金';
            /** H5 */
            '68687133': '邀请有礼';
            /** H5 */
            '68687140': '生物识别';
            /** H5 */
            '68687141': '安全设置';
            /** H5 */
            '68687142': '支付宝授权';
            /** H5 */
            '68687145': '股票发现-支付宝';
            /** H5 */
            '68687167': '信用受理台';
            /** H5 */
            '68687197': '支付成功－小程序推荐';
            /** H5 */
            '68687204': '支付成功－取餐号';
            /** H5 */
            '68687221': 'community-life';
            /** H5 */
            '68687251': '蚂蚁森林-福气林';
            /** H5 */
            '68687255': '发现好生活';
            /** H5 */
            '68687266': '集五福';
            /** H5 */
            '68687287': '加载中...';
            /** H5 */
            '68687293': '奖品查询中';
            /** H5 */
            '68687328': '股票2019';
            /** H5 */
            '68687842': '保护地巡护';
            /** H5 */
            '68687886': '神奇物种';
            /** tiny */
            '77700096': '星巴克用星说';
            /** H5 */
            '77700109': '小程序分享二维码';
            /** tiny */
            '77700124': '余额宝';
            /** H5 */
            '77700152': '信用卡还款';
            /** H5 */
            '77700189': '答答星球';
            /** H5 */
            '77700243': '支付宝汇生活';
            /** H5 */
            '80000002': '服务窗';
            /** native */
            '88886666': '红包';
            /** H5 */
            '9000258': 'AA收款';
        }

        // noinspection SpellCheckingInspection
        interface PushWindowOptions {
            appId?: keyof AppIdInfo | number | string;
            saId?: keyof AppIdInfo | number | string;
            __webview_options__?: WebviewOptions;
        }

        // noinspection SpellCheckingInspection
        interface WebviewOptions {
            [prop: string]: any;

            /**
             * Default title, displayed when page is being loaded.
             * zh-CN: 默认标题, 在页面第一次加载之前显示在标题栏上.
             * @default ''
             */
            defaultTitle?: string;
            /**
             * @see defaultTitle
             * @default ''
             */
            dt?: string;
            /**
             * Whether or not to display global loading spinner.
             * zh-CN: 是否在页面加载前显示全局菊花.
             * @default false
             */
            showLoading?: JSBridge.Boolean;
            /**
             * @see showLoading
             * @default false
             */
            sl?: JSBridge.Boolean;
            /**
             * Whether or not to use webpage title in title bar.
             * zh-CN: 是否读取网页标题显示在titleBar上.
             * @default true
             */
            readTitle?: JSBridge.Boolean;
            /**
             * @see readTitle
             * @default true
             */
            rt?: JSBridge.Boolean;
            /**
             * 业务场景来源, 这个值会记录到每一个埋点中, 可以用来区分不同来源.
             * @example 'search'
             * @default ''
             */
            bizScenario?: string;
            /**
             * @see bizScenario
             * @default ''
             */
            bz?: string;
            /**
             * Whether or not to support pull to refresh.
             * zh-CN: 是否支持下拉刷新; 只有集团域/本地文件允许设置为true. (since 8.2)
             * @default false
             */
            pullRefresh?: JSBridge.Boolean;
            /**
             * @see pullRefresh
             * @default false
             */
            pr?: JSBridge.Boolean;
            /**
             * An JSON string that specifies additional menu items.
             * E.g., {'menus':[{'name':'Foo','icon':'H5Service.bundle/h5_popovermenu_share','action':'hello'},{'name':'Bar','icon':'H5Service.bundle/h5_popovermenu_abuse','action':'world'}]}.
             * zh-CN: JSON字符串, 更多的菜单项列表 (放在分享/字号/复制链接后面).
             * 例: {'menus':[{'name':'恭喜','icon':'H5Service.bundle/h5_popovermenu_share','action':'hello'},{'name':'发财','icon':'H5Service.bundle/h5_popovermenu_abuse','action':'world'}]}. (since 8.2)
             * @default ''
             */
            toolbarMenu?: string;
            /**
             * @see toolbarMenu
             * @default ''
             */
            tm?: string;
            /**
             * Whether or not to support pull down. Obsoleted since 9.9.5, and use 'allowsBounceVertical' instead.
             * zh-CN: 页面是否支持下拉, 即显示出黑色背景或者域名; 只有.alipay.com/.alipay.net/本地文件允许设置为false; 9.9.5废弃, 使用"allowsBounceVertical"替代. (since 8.3, Android; 8.4, iOS)
             * @default true
             */
            canPullDown?: JSBridge.Boolean;
            /**
             * @see canPullDown
             * @default true
             */
            pd?: JSBridge.Boolean;
            /**
             * Whether or not allow vertical bounce.
             * zh-CN: 页面是否支持纵向拽拉超出实际内容; android只支持下拉, 即显示出背景或者域名; 只有.alipay.com/.alipay.net/本地文件允许设置为false. (since 9.9.3)
             * @default true
             */
            allowsBounceVertical?: JSBridge.Boolean;
            /**
             * The edge color of bounce top.
             * zh-CN: 下拉超出时的顶部间缝颜色. (eg: 16775138) (since 9.9.3)
             */
            bounceTopColor?: number | string;
            /**
             * The edge color of bounce bottom.
             * zh-CN: 上拉超出时的底部间缝颜色. (eg: 16775138) (since 9.9.3, iOS only)
             */
            bounceBottomColor?: number | string;
            /**
             * Whether or not to show the title loading spinner.
             * zh-CN: 是否在TitleBar的标题左边显示小菊花. (since 8.6)
             * @default false
             */
            showTitleLoading?: JSBridge.Boolean;
            /**
             * @see showTitleLoading
             * @default false
             */
            tl?: JSBridge.Boolean;
            /**
             * The Start-up parameter for RPC request (in utf-8 encoding), please refer to the RPC API for more details.
             * zh-CN: 在页面启动参数里配置rpc请求的参数preRpc (需要使用utf-8编码), 在打开页面的同时请求rpc (详细使用参考RPC接口介绍). (since 9.3)
             */
            preRpc?: string;
            /**
             * Whether or not to delay rendering. Note: this parameter is only effective if this feature is enabled in remote configuration.
             * zh-CN: 是否启动延迟渲染功能; 本功能目前由线上开关控制, 若线上开关打开, 且指定启动参数为YES或TRUE则生效. (since 9.3.1, Android only)
             * @default false
             */
            delayRender?: JSBridge.Boolean;
            /**
             * Mutually exclusive with titleBarColor.
             * always/auto: If set to always, the title bar is always transparent no matter whether the page is being scrolled up or down. If set to auto, transparency is increased when page is being scrolled down until full transparent when scrollTop == 80pt. Transparency is decreased when page is being scrolled up until full opaque. If transparency transition is not required, please set transparentTitle to none.
             * zh-CN: always/auto: 如果transparentTitle为字符串always, 则当前页面上下滚动时, titleBar一直全透明; 当transparentTitle值为auto, 当页面往下滚动时, 透明度不断增加, 直到scrollTop等于80pt时变成完全不透明, 此时页面再往上滚动则反之, 透明度不断减小直到回到顶部时变成完全不透明. 如果个页面不需要透明效果, 则需要用pushWindow的param参数重新指定transparentTitle为"none". 使用注意: 1. titleBar透明时, 页面内容从屏幕最顶部开始布局, 页面需要预留titleBar的高度防止title遮挡页面内容; 2. Android 5.0以下由于不支持沉浸式状态栏, 所以页面会从状态栏下开始布局; 3. 可以通过 getTitleAndStatusbarHeight JSAPI 获取状态栏和titleBar的高度, 用于页面调整预留高度; 4. 不能与titleBarColor同时使用. (since 9.5.1)
             * @default 'none'
             */
            transparentTitle?: 'always' | 'auto' | 'none' | string;
            /**
             * @see transparentTitle
             * @default 'none'
             */
            ttb?: 'always' | 'auto' | 'none' | string;
            /**
             * Mutually exclusive with transparentTitle.
             * zh-CN: 自定义titleBar的背景色 (9.9版本以下不能与transparentTitle同时使用). (eg: 16775138)
             */
            titleBarColor?: number | string;
            /**
             * Only effective if transparentTitle is set to auto. The distance to scroll in order to reach transparency == 0.96.
             * zh-CN: 在transparentTitle="auto"的情况下, 滑动到透明度为0.96的距离. (since 9.9)
             */
            scrollDistance?: number | string;
            /**
             * Whether or not to start application with the same appID.
             * zh-CN: 是否使用相同的appID启动应用. (since 9.9)
             * @default false
             */
            startMultApp?: JSBridge.Boolean;
            /**
             * The URL to title image.
             * Please use a 3x PNG image, only effective in the current ViewController, please put the image in the global offline package for better user experience.
             * zh-CN: 所要使用的title图片地址, 需 3x PNG 图片; 只影响当前的VC, pushWindow不会自动传递此参数; 为了更好的体验可以把图放在全局运营资源包中 (since 9.9.5)
             * @default ''
             */
            titleImage?: string;
            /**
             * Close the current window when opening up new page.
             * zh-CN: 打开窗口的同时, 关闭当前window. (since 9.9.2)
             * @default false
             */
            closeCurrentWindow?: JSBridge.Boolean;
            /**
             * zh-CN: 打开窗口的同时, 关闭当前App的所有window. (since 10.0.20)
             * @default false
             */
            closeAllWindow?: JSBridge.Boolean;
            /**
             * Type of animation, available options are none and push. Note: Not available in Android.
             * zh-CN: 动画类型, 默认为"push", 可用枚举"none"/"push". android未实现, 均无动画. (since 10.0.20)
             * @default 'push'
             */
            animationType?: 'push' | 'none' | string;
            /**
             * zh-CN: 指定后退按钮行为.
             * back: history.length > 0 ? history.back() : closeWebview(); pop: popWindow(); auto: 在iOS上相当于pop; 在android上, toolbar可见时相当于back, toolbar不可见时相当于pop (8.4及以后不再支持"auto"). back: 点击返回按钮会先判断history.length, 如果为0, 自动退出当前窗口, 效果等同JSAPI:popWindow. 如果history.length>0, 先执行history.back(), 返回当前窗口的历史记录上一页, 同时在导航栏返回按钮的右侧显示出一个"关闭"按钮; pop: 点击返回按钮会直接退出当前窗口, 效果等同JSAPI:popWindow. (若当时appId为通用浏览器模式, 即20000067, 则默认值为"back"; 其它拥有自身appId的H5App默认值均为"pop"). (since 8.1)
             */
            backBehavior?: 'back' | 'pop' | 'auto' | string;
            /** @see backBehavior */
            bb?: 'back' | 'pop' | 'auto' | string;
            /**
             * zh-CN: 是否显示加载的进度条. (since 8.2)
             * @default false
             */
            showProgress?: JSBridge.Boolean;
            /**
             * @see showProgress
             * @default false
             */
            sp?: JSBridge.Boolean;
            /** zh-CN: (暂无描述) */
            defaultSubtitle?: any;
            /** zh-CN: 设置背景颜色. (eg: 16775138) (since 8.4) */
            backgroundColor?: number | string;
            /** @see backgroundColor */
            bc?: number | string;
            /** zh-CN: 是否显示右上角"汉堡"按钮 ("三个点"按钮). 默认值: 对于H5App为"NO", 对于非H5App为"YES". (since 8.4) */
            showOptionMenu?: JSBridge.Boolean;
            /** @see showOptionMenu */
            so?: JSBridge.Boolean;
            /**
             * zh-CN: 页面下拉时是否显示域名.
             * 只有*.alipay.com/*.alipay.net/本地文件允许设置为"NO", 离线包强制设置为false, 不容许显示. (since 9.0.1, Android; 9.0, iOS)
             * @default true
             */
            showDomain?: JSBridge.Boolean;
            /**
             * @see showDomain
             * @default true
             */
            sd?: JSBridge.Boolean;
            /**
             * zh-CN: 是否使用webview的滚动条, 包括垂直和水平. 只对Android有效. (since 9.2)
             * @default true
             */
            enableScrollBar?: JSBridge.Boolean;
            /**
             * @see enableScrollBar
             * @default true
             */
            es?: JSBridge.Boolean;
            /**
             * zh-CN: 是否允许导航栏点击穿透. (since 10.1.52)
             * @default 'NO'
             */
            titlePenetrate?: JSBridge.Boolean;
            appClearTop?: JSBridge.Boolean;
            abv?: JSBridge.Boolean;
            /** @example 'index.bundle.js' */
            bundlePath?: string;
            ca?: JSBridge.Boolean;
            canDestroy?: JSBridge.Boolean;
            closeAfterPay?: JSBridge.Boolean;
            closeAfterPayFinish?: JSBridge.Boolean;
            /** @example '93' */
            cubeRuntimeRequired?: number | string;
            enableCube?: JSBridge.Boolean;
            enableDSL?: JSBridge.Boolean;
            enableInPageRender?: JSBridge.Boolean;
            enableJSC?: JSBridge.Boolean;
            enableKeepAlive?: JSBridge.Boolean;
            enableTabBar?: JSBridge.Boolean;
            enableWK?: JSBridge.Boolean;
            enableCubeView?: JSBridge.Boolean;
            forceEnableWK?: JSBridge.Boolean;
            hideCloseButton?: JSBridge.Boolean;
            hideOptionMenu?: JSBridge.Boolean;
            isInternalApp?: JSBridge.Boolean;
            /** @example 'page/component/index' */
            launchParamsTag?: string;
            /** @example 'https://zos.alipayobjects.com/rmsportal/hfmXQhcgtVXdohdwMAmf.png' */
            loading_icon?: string;
            loading_title?: string;
            /** @example '1.86.1809071354.2' */
            minSDKVersion?: string;
            /** @example 'res' */
            nbapptype?: string;
            /** @example 'sync' */
            nboffline?: string;
            /** @example 'try' */
            nboffmode?: string;
            networkIndicator?: JSBridge.Boolean;
            offlineH5SsoLoginFirst?: JSBridge.Boolean;
            /** @example 'pages/index/index' */
            page?: string;
            prefetchLocation?: JSBridge.Boolean;
            preSSOLogin?: JSBridge.Boolean;
            preSSOLoginBindingPage?: JSBridge.Boolean;
            preSSOLoginUrl?: string;
            safePayEnabled?: JSBridge.Boolean;
            /** @example 'cash' */
            shareType?: string;
            showFavorites?: JSBridge.Boolean;
            showTitlebar?: JSBridge.Boolean;
            smartToolBar?: JSBridge.Boolean;
            /** @example '[]' */
            sub_url?: string;
            /** @example '{}' */
            third_platform?: string;
            /** @example ['63300002', '66666817', '68687209'] */
            nbpkgres?: string[];
            tinyPubRes?: JSBridge.Boolean;
            titleColor?: number | string;
            transparentTitleTextAuto?: JSBridge.Boolean;
            /** @example '12zfb0xxxxxx' */
            ttid?: string;
            /** @example '/www/home.html' */
            url?: string;
            useSW?: JSBridge.Boolean;
            /** @example '300' */
            waitRender?: number | string;
            fullscreen?: JSBridge.Boolean;
            cAppName?: string;
            /** @example 'antforesthome' */
            cAppId?: string;
            /** @example 'home' */
            cBizId?: string;
            /** @example 1 */
            autoShowTask?: any;
            /** @example 1 */
            autoShowProps?: any;
            /** @example 1 */
            autoShowFanghua?: any;
            /** @example 1 */
            autoShowHongbao?: any;
            /** @example '20000153' */
            _appId?: number | string;
        }

        type Boolean = boolean | 'YES' | 'NO';
    }
}