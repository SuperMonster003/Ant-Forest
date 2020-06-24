let ext = {
    checkActivity(o) {
        let i = app.intent(o);
        let ctx_pkg_mgr = context.getPackageManager();
        let query_result = ctx_pkg_mgr.queryIntentActivities(i, 0);

        return !!(query_result && query_result.toArray().length);
    },
    resolveActivity(o) {
        let i = app.intent(o);
        let ctx_pkg_mgr = context.getPackageManager();

        return i.resolveActivity(ctx_pkg_mgr);
    },
};

module.exports = ext;
module.exports.load = () => Object.assign(global.app, ext);