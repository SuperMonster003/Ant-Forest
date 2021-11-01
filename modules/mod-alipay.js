let {
    $$num, $$str, isPlainObject,
} = require('./mod-global');
let {appx} = require('./ext-app');

let exp = {
    package_name: 'com.eg.android.AlipayGphone',
    app_name: String.unEsc('652F4ED85B9D'),
    /**
     * @type {Mod.Alipay['app_preset']}
     */
    app_preset: {
        af_homepage: ['https://60000002.h5app.alipay.com/www/home.html', {
            transparentTitle: 'auto',
            backgroundColor: -1,
        }],
        af_rank_list: [['https://60000002.h5app.alipay.com/www/listRank.html', {
            conf: '["totalRank"]',
        }], {
            transparentTitle: 'none',
            backgroundColor: -1,
            canPullDown: 'NO',
            backBehavior: 'back',
            showOptionMenu: 'YES',
            readTitle: 'NO',
            defaultTitle: String.unEsc('2615FE0F0020597D53CB6392884C699C'),
        }],
        af_energy_rain: 68687791,
        settings_general: 20000724,
        account_manager: 20000027,
        account_login: 20000008,
        account_nickname: 20000141,
    },
    /**
     * @param {Alipay.App.Id|[string,object]} app_id
     * @param {?Alipay.App.URL|Alipay.JSBridge.WebviewOptions} [url]
     * @param {Alipay.JSBridge.WebviewOptions} [webview_options]
     * @return {boolean}
     */
    startApp(app_id, url, webview_options) {
        let _preset_args = this.app_preset[app_id];
        if (typeof _preset_args !== 'undefined') {
            return Array.isArray(_preset_args)
                ? this.startApp.apply(this, _preset_args)
                : this.startApp.call(this, _preset_args);
        }
        // @Overload
        if (!($$num(app_id) || $$str(app_id) && app_id.match(/^\d+$/))) {
            return this.startApp(20000067, app_id, url);
        }
        // @Overload
        if (isPlainObject(url)) {
            return this.startApp(app_id, null, url);
        }
        return appx.startActivity({
            url: {
                src: 'alipays://platformapi/startapp',
                query: function $iiFe() {
                    let _o = {appId: app_id};
                    if (typeof url === 'string') {
                        _o.url = url;
                    } else if (Array.isArray(url)) {
                        _o.url = {src: url[0], query: url[1]};
                    }
                    /**
                     * @type {Alipay.JSBridge.WebviewOptions}
                     */
                    _o.__webview_options__ = Object.assign({
                        appClearTop: 'YES',
                        startMultApp: 'YES',
                        enableCubeView: 'NO',
                        enableScrollBar: 'NO',
                        closeCurrentWindow: 'YES',
                    }, webview_options);
                    return _o;
                }(),
                exclude: 'defaultTitle',
            },
            package: 'alipay',
            monitor: 'ensure_open',
        });
    },
};

/**
 * @type {Mod.alipay}
 */
module.exports = {alipay: exp};