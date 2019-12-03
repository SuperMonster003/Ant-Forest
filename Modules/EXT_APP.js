let ext = {
    checkActivity: function (i) {
        let query_result = context.getPackageManager().queryIntentActivities(app.intent(i), 0);
        return !!(query_result && query_result.toArray().length);
    },
};

module.exports = Object.assign({
    load: () => Object.assign(global["app"], ext),
}, ext);