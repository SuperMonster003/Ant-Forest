let {appx} = require('./ext-app');

let exp = {
    /**
     * @return {boolean}
     */
    isPro() {
        return (this.isPro = () => /Pro\b/i.test(this.getPkgName()))();
    },
    /**
     * @example
     * console.log(autojsx.getName()); // like: 'Auto.js'
     * @return {string}
     */
    getAppName() {
        return 'Auto.js' + (this.isPro() ? '\x20Pro' : '');
    },
    /**
     * @example
     * console.log(appx.getAutoJsPkg()); // like: 'org.autojs.autojs'
     * @return {string}
     */
    getPkgName() {
        return context.getPackageName();
    },
    /**
     * @example
     * console.log(appx.getAutoJsVer()); // e.g. '4.1.1 Alpha2'
     * @return {?string}
     */
    getVerName() {
        // Pro version(s) (e.g. 8.8.16-0) returns abnormal value like '${xxx.xxx}'
        let _ver = app.autojs.versionName;
        return String(_ver).match(/^\d/) ? _ver : appx.getVerName('Auto.js');
    },
    getVerCode() {
        return app.autojs.versionCode;
    },
};

module.exports = {autojsx: exp};