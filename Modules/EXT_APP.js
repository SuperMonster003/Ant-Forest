let _$$und = o => typeof o === "undefined";
let _$$func = f => typeof f === "function";

let Intent = android.content.Intent;
let parseIntentFlag = function (flag) {
    if (typeof (flag) == 'string') {
        return Intent["FLAG_" + flag.toUpperCase()];
    }
    return flag;
};

if (_$$und(app.launch)) {
    app.launch = pkg => app.launchPackage(pkg);
}
if (!_$$func(app.parseUri)) {
    app.parseUri = function (uri) {
        if (uri.startsWith("file://")) {
            return app.getUriForFile(uri);
        }
        return android.net.Uri.parse(uri);
    };
}
if (!_$$func(app.getUriForFile)) {
    app.getUriForFile = function (path) {
        if (path.startsWith("file://")) {
            path = path.substring(7);
        }
        let file = new java.io.File(files.path(path));
        if (app.fileProviderAuthority === null) {
            return android.net.Uri.fromFile(file);
        }
        return Packages["androidx"].core.content.FileProvider.getUriForFile(context,
            app.fileProviderAuthority, file);
    };
}
if (!_$$func(app.intent)) {
    app.intent = function (i) {
        let intent = new Intent();
        if (i.className && i.packageName) {
            intent.setClassName(i.packageName, i.className);
        }
        if (i.extras) {
            for (let key in i.extras) {
                intent.putExtra(key, i.extras[key]);
            }
        }
        if (i.category) {
            if (i.category instanceof Array) {
                for (let j = 0; i < i.category.length; j++) {
                    intent.addCategory(i.category[j]);
                }
            } else {
                intent.addCategory(i.category);
            }
        }
        if (i.action) {
            if (!~i.action.indexOf(".")) {
                i.action = "android.intent.action." + i.action;
            }
            intent.setAction(i.action);
        }
        if (i.flags) {
            let flags = 0;
            if (Array.isArray(i.flags)) {
                for (let j = 0; j < i.flags.length; j++) {
                    flags |= parseIntentFlag(i.flags[j]);
                }
            } else {
                flags = parseIntentFlag(i.flags);
            }
            intent.setFlags(flags);
        }
        if (i.type) {
            if (i.data) {
                intent.setDataAndType(app.parseUri(i.data), i.type);
            } else {
                intent.setType(i.type);
            }
        } else if (i.data) {
            intent.setData(android.net.Uri.parse(i.data));
        }
        return intent;
    };
}
if (!_$$func(app.startActivity)) {
    app.startActivity = function (i) {
        if (typeof (i) == "string") {
            if (runtime.getProperty("class." + i)) {
                context.startActivity(new Intent(context, runtime.getProperty("class." + i))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
                return;
            } else {
                throw new Error("class " + i + " not found");
            }
        }
        if (i instanceof Intent) {
            context.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            return;
        }
        if (i && i.root) {
            shell("am start " + app.intentToShell(i), true);
        } else {
            context.startActivity(app.intent(i).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        }

    };
}
if (!_$$func(app.intentToShell)) {
    app.intentToShell = function (i) {
        let cmd = "";

        function quoteStr(str) {
            return "'" + str.replace("'", "\\'") + "'";
        }

        function isInt(value) {
            return Number.isInteger(value)
                && value <= java.lang.Integer.MAX_VALUE
                && value >= java.lang.Integer.MIN_VALUE;
        }

        function typeChar(value) {
            if (typeof (value) == 'boolean') {
                return 'z';
            }
            if (typeof (value) == 'number') {
                if (Number.isInteger(value)) {
                    if (isInt(value)) {
                        return 'i';
                    } else {
                        return 'l';
                    }
                } else {
                    return 'f';
                }
            }
            throw new TypeError("unknown type: " + value);
        }

        function addOption(option, param, quote) {
            if (quote === undefined || quote === true) {
                param = quoteStr(param);
            }
            cmd += " -" + option + " " + param;
        }

        if (i.className && i.packageName) {
            addOption("n", i.packageName + "/" + i.className);
        }
        if (i.extras) {
            for (let key in i.extras) {
                let value = i.extras[key];
                if (typeof (value) == 'string') {
                    addOption("-es", quoteStr(key) + ' ' + quoteStr(value), false);
                } else if (Array.isArray(value)) {
                    if (!value.length) {
                        throw new Error('Empty array: ' + key);
                    }
                    let e = value[0];
                    if (typeof (e) == 'string') {
                        cmd += ' --esa ' + quoteStr(key) + ' ';
                        for (let str of value) {
                            cmd += quoteStr(str) + ',';
                        }
                        cmd = cmd.substring(0, cmd.length - 1);
                    } else {
                        addOption('-e' + typeChar(e) + 'a', quoteStr(key) + ' ' + value, false);
                    }
                } else {
                    addOption('-e' + typeChar(value), quoteStr(key) + ' ' + value, false);
                }
            }
        }
        if (i.category) {
            if (i.category instanceof Array) {
                for (let j = 0; i < i.category.length; j++) {
                    addOption('c', i.category[j], false);
                }
            } else {
                addOption('c', i.category, false);
            }
        }
        if (i.action) {
            if (!~i.action.indexOf(".")) {
                i.action = "android.intent.action." + i.action;
            }
            addOption('a', i.action);
        }
        if (i.flags) {
            let flags = 0;
            if (Array.isArray(i.flags)) {
                for (let j = 0; j < i.flags.length; j++) {
                    flags |= parseIntentFlag(i.flags[j]);
                }
            } else {
                flags = parseIntentFlag(i.flags);
            }
            addOption('f', flags, false);
        }
        if (i.type) {
            addOption('t', i.type, false);
        }
        if (i.data) {
            addOption('d', i.data, false);
        }
        return cmd;
    };
}

let ext = {
    checkActivity: function (o) {
        let i = app.intent(o);
        let ctx_pkg_man = context.getPackageManager();
        let query_result = ctx_pkg_man.queryIntentActivities(i, 0);

        return !!(query_result && query_result.toArray().length);
    },
    resolveActivity: function (o) {
        let i = app.intent(o);
        let ctx_pkg_man = context.getPackageManager();

        return i.resolveActivity(ctx_pkg_man);
    }
};

module.exports = ext;
module.exports.load = () => Object.assign(global["app"], ext);