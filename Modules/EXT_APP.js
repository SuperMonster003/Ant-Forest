global.appx = typeof global.appx === "object" ? global.appx : {};

let Intent = android.content.Intent;

let ext = {
    checkActivity(o) {
        let i = this.intent(o);
        let ctx_pkg_mgr = context.getPackageManager();
        let query_result = ctx_pkg_mgr.queryIntentActivities(i, 0);

        return !!(query_result && query_result.toArray().length);
    },
    resolveActivity(o) {
        let i = this.intent(o);
        let ctx_pkg_mgr = context.getPackageManager();

        return i.resolveActivity(ctx_pkg_mgr);
    },
    /**
     * a duplicate from Auto.js 4.1.1 Alpha2
     * because which of Auto.js Pro 7.0.0-4 may behave unexpectedly
     * @param {object} o
     * @returns {android.content.Intent}
     */
    intent(o) {
        let _i = new Intent();
        let {
            packageName, className, category,
            action, extras, data, flags, type,
        } = o || {};

        if (packageName) {
            if (className) {
                _i.setClassName(packageName, className);
            } else {
                // the Intent can only match the components
                // in the given application package with setPackage().
                // Otherwise, if there's more than one app that can handle the intent,
                // the system presents the user with a dialog to pick which app to use
                _i.setPackage(packageName);
            }
        }
        if (extras) {
            for (let key in extras) {
                if (extras.hasOwnProperty(key)) {
                    _i.putExtra(key, extras[key]);
                }
            }
        }
        if (category) {
            if (Array.isArray(category)) {
                for (let i = 0; o < category.length; i++) {
                    _i.addCategory(category[i]);
                }
            } else {
                _i.addCategory(category);
            }
        }
        if (action) {
            if (!~action.indexOf(".")) {
                action = "android.intent.action." + action;
            }
            _i.setAction(action);
        }
        if (flags) {
            let flags = 0;
            if (flags instanceof Array) {
                for (let j = 0; j < flags.length; j++) {
                    flags |= parseIntentFlag(flags[j]);
                }
            } else {
                flags = parseIntentFlag(flags);
            }
            _i.setFlags(flags);
        }
        if (type) {
            if (data) {
                _i.setDataAndType(app.parseUri(data), type);
            } else {
                _i.setType(type);
            }
        } else if (data) {
            _i.setData(android.net.Uri.parse(data));
        }

        return _i;

        // tool function(s) //

        function parseIntentFlag(flag) {
            if (typeof flag === "string") {
                return Intent["FLAG_" + flag.toUpperCase()];
            }
            return flag;
        }
    },
    /**
     * a duplicate from Auto.js 4.1.1 Alpha2
     * because which of Auto.js Pro 7.0.0-4 may behave unexpectedly
     * @see app.intent
     * @param {string|android.content.Intent|object} o
     * @returns void
     */
    startActivity(o) {
        if (typeof o === "string") {
            if (runtime.getProperty("class." + o)) {
                context.startActivity(
                    new Intent(
                        context, runtime.getProperty("class." + o)
                    ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                );
                return;
            }
            throw new Error("class " + o + " not found");
        }
        if (o instanceof Intent) {
            context.startActivity(o.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            return;
        }
        if (o && o.root) {
            shell("am start " + app.intentToShell(o), true);
        } else {
            context.startActivity(this.intent(o).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        }
    },
};

module.exports = ext;
module.exports.load = () => global.appx = ext;