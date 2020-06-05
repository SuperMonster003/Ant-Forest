let ext = {
    checkActivity(o) {
        let i = app.intent(o);
        let ctx_pkg_man = context.getPackageManager();
        let query_result = ctx_pkg_man.queryIntentActivities(i, 0);

        return !!(query_result && query_result.toArray().length);
    },
    resolveActivity(o) {
        let i = app.intent(o);
        let ctx_pkg_man = context.getPackageManager();

        return i.resolveActivity(ctx_pkg_man);
    }
};

module.exports = ext;
module.exports.load = () => Object.assign(global.app, ext);