// given that there are bugs with dialogs modules
// in auto.js versions like 4.1.0 Alpha5 and 4.1.1 Alpha2

// in another way, extended functions like
// dialogs.builds(); dialogs.getContentText();
// could make things easier sometimes

let {myLooper, getMainLooper} = android.os.Looper;
let isUiThread = () => myLooper() === getMainLooper();
let rtDialogs = () => {
    let d = runtime.dialogs;
    return isUiThread() ? d : d.nonUiDialogs;
};

let ext = {
    build: function (properties) {
        var builder = Object.create(runtime.dialogs.newBuilder());
        builder.thread = threads.currentThread();
        for (var name in properties) {
            if (!properties.hasOwnProperty(name)) {
                continue;
            }
            applyDialogProperty(builder, name, properties[name]);
        }
        applyOtherDialogProperties(builder, properties);
        return ui.run(() => builder.buildDialog());

        function applyDialogProperty(builder, name, value) {
            let propertySetters = {
                title: null,
                titleColor: {adapter: parseColor},
                buttonRippleColor: {adapter: parseColor},
                icon: null,
                content: null,
                contentColor: {adapter: parseColor},
                contentLineSpacing: null,
                items: null,
                itemsColor: {adapter: parseColor},
                positive: {method: "positiveText"},
                positiveColor: {adapter: parseColor},
                neutral: {method: "neutralText"},
                neutralColor: {adapter: parseColor},
                negative: {method: "negativeText"},
                negativeColor: {adapter: parseColor},
                cancelable: null,
                canceledOnTouchOutside: null,
                autoDismiss: null
            };

            if (!propertySetters.hasOwnProperty(name)) {
                return;
            }
            var propertySetter = propertySetters[name] || {};
            if (propertySetter.method === undefined) {
                propertySetter.method = name;
            }
            if (propertySetter.adapter) {
                value = propertySetter.adapter(value);
            }
            builder[propertySetter.method].call(builder, value);
        }

        function applyOtherDialogProperties(builder, properties) {
            if (properties.inputHint !== undefined || properties.inputPrefill !== undefined) {
                builder.input(wrapNonNullString(properties.inputHint), wrapNonNullString(properties.inputPrefill),
                    function (dialog, input) {
                        input = input.toString();
                        builder.emit("input_change", builder.dialog, input);
                    })
                    .alwaysCallInputCallback();
            }
            if (properties.items !== undefined) {
                var itemsSelectMode = properties.itemsSelectMode;
                if (itemsSelectMode === undefined || itemsSelectMode === 'select') {
                    builder.itemsCallback(function (dialog, view, position, text) {
                        builder.emit("item_select", position, text.toString(), builder.dialog);
                    });
                } else if (itemsSelectMode === 'single') {
                    builder.itemsCallbackSingleChoice(properties.itemsSelectedIndex === undefined ? -1 : properties.itemsSelectedIndex,
                        function (dialog, view, which, text) {
                            builder.emit("single_choice", which, text.toString(), builder.dialog);
                            return true;
                        });
                } else if (itemsSelectMode === 'multi') {
                    builder.itemsCallbackMultiChoice(properties.itemsSelectedIndex === undefined ? null : properties.itemsSelectedIndex,
                        function (dialog, view, indices, texts) {
                            builder.emit("multi_choice", indices, texts, builder.dialog);
                            return true;
                        });
                } else {
                    throw new Error("unknown itemsSelectMode " + itemsSelectMode);
                }
            }
            if (properties.progress !== undefined) {
                var progress = properties.progress;
                var indeterminate = (progress.max === -1);
                builder.progress(indeterminate, progress.max, !!progress.showMinMax);
                builder.progressIndeterminateStyle(!!progress.horizontal);
            }
            if (properties.checkBoxPrompt !== undefined || properties.checkBoxChecked !== undefined) {
                builder.checkBoxPrompt(wrapNonNullString(properties.checkBoxPrompt), !!properties.checkBoxChecked,
                    function (view, checked) {
                        builder.getDialog().emit("check", checked, builder.getDialog());
                    });
            }
            if (properties.customView !== undefined) {
                let customView = properties.customView;
                if (typeof (customView) === 'xml' || typeof (customView) === 'string') {
                    customView = ui.run(() => ui.inflate(customView));
                }
                let wrapInScrollView = (properties.wrapInScrollView === undefined) ? true : properties.wrapInScrollView;
                builder.customView(customView, wrapInScrollView);
            }

            function wrapNonNullString(str) {
                if (str == null) {
                    return "";
                }
                return str;
            }
        }

        function parseColor(c) {
            if (typeof (c) == 'string') {
                return colors.parseColor(c);
            }
            return c;
        }
    },
    builds: function (common, o) {
        let common_o = {};
        let defs = typeof defs === "undefined" ? require("./MODULE_DEFAULT_CONFIG").settings : defs;
        let dialog_contents = require("./MODULE_TREASURY_VAULT").dialog_contents || {};

        if (typeof common === "string") common = [common];
        let [title_param, content_param, neutral_param, negative_param, positive_param, stay_flag, check_box_param] = common;
        if (typeof title_param === "object") {
            common_o.title = title_param[0];
            common_o.titleColor = title_param[1].match(/_color$/) ? defs[title_param[1]] : title_param[1];
        } else if (title_param) common_o.title = title_param;
        if (typeof content_param === "object") {
            common_o.content = dialog_contents[content_param[0]] || content_param[0];
            common_o.contentColor = content_param[1].match(/_color$/) ? defs[content_param[1]] : content_param[1];
        } else if (content_param) common_o.content = dialog_contents[content_param] || content_param;
        if (typeof neutral_param === "object") {
            common_o.neutral = neutral_param[0];
            common_o.neutralColor = neutral_param[1].match(/_color$/) ? defs[neutral_param[1]] : neutral_param[1];
        } else if (neutral_param) common_o.neutral = neutral_param;
        if (typeof negative_param === "object") {
            common_o.negative = negative_param[0];
            common_o.negativeColor = negative_param[1].match(/_color$/) ? defs[negative_param[1]] : negative_param[1];
        } else if (negative_param) common_o.negative = negative_param;
        if (typeof positive_param === "object") {
            common_o.positive = positive_param[0];
            common_o.positiveColor = positive_param[1].match(/_color$/) ? defs[positive_param[1]] : positive_param[1];
        } else if (positive_param) common_o.positive = positive_param;
        if (stay_flag) {
            common_o.autoDismiss = false;
            common_o.canceledOnTouchOutside = false;
        }
        if (check_box_param) {
            common_o.checkBoxPrompt = typeof check_box_param === "string" ? check_box_param : "不再提示";
        }

        let final_dialog = dialogs.build(Object.assign({}, common_o, o));
        global.dialogs_pool = (global.dialogs_pool || []).concat([final_dialog]);
        return final_dialog;
    },
    rawInput: function (title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve) {
                rtDialogs().rawInput(title, prefill, function () {
                    resolve.apply(null, Array.prototype.slice.call(arguments));
                });
            });
        }
        return rtDialogs().rawInput(title, prefill, callback ? callback : null);
    },
    get prompt() {
        return this.rawInput;
    },
    input: function (title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve) {
                rtDialogs().rawInput(title, prefill, function (str) {
                    resolve(eval(str));
                });
            });
        }
        if (callback) {
            dialogs.rawInput(title, prefill, function (str) {
                callback(eval(str));
            });
            return;
        }
        return eval(dialogs.rawInput(title, prefill), callback ? callback : null);

    },
    alert: function (title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve) {
                rtDialogs().alert(title, prefill, function () {
                    resolve.apply(null, Array.prototype.slice.call(arguments));
                });
            });
        }
        return rtDialogs().alert(title, prefill, callback ? callback : null);
    },
    confirm: function (title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve) {
                rtDialogs().confirm(title, prefill, function () {
                    resolve.apply(null, Array.prototype.slice.call(arguments));
                });
            });
        }
        return rtDialogs().confirm(title, prefill, callback ? callback : null);
    },
    select: function (title, items, callback) {
        if (items instanceof Array) {
            if (isUiThread() && !callback) {
                return new Promise(function (resolve) {
                    rtDialogs().select(title, items, function () {
                        resolve.apply(null, Array.prototype.slice.call(arguments));
                    });
                });
            }
            return rtDialogs().select(title, items, callback ? callback : null);
        }
        return rtDialogs().select(title, [].slice.call(arguments, 1), null);
    },
    singleChoice: function (title, items, index, callback) {
        index = index || 0;
        if (isUiThread() && !callback) {
            return new Promise(function (resolve) {
                rtDialogs().singleChoice(title, index, items, function () {
                    resolve.apply(null, Array.prototype.slice.call(arguments));
                });
            });
        }
        return rtDialogs().singleChoice(title, index, items, callback ? callback : null);
    },
    multiChoice: function (title, items, index, callback) {
        index = index || [];
        if (isUiThread() && !callback) {
            return new Promise(function (resolve) {
                rtDialogs().singleChoice(title, index, items, function (r) {
                    resolve.apply(null, javaArrayToJsArray(r));
                });
            });
        }
        if (callback) {
            return rtDialogs().multiChoice(title, index, items, function (r) {
                callback(javaArrayToJsArray(r));
            });
        }
        return javaArrayToJsArray(rtDialogs().multiChoice(title, index, items, null));

        function javaArrayToJsArray(javaArray) {
            var jsArray = [];
            var len = javaArray.length;
            for (var i = 0; i < len; i++) {
                jsArray.push(javaArray[i]);
            }
            return jsArray;
        }
    },
    dismiss: function () {
        for (let i = 0, len = arguments.length; i < len; i += 1) {
            arguments[i].dismiss();
        }
    },
    disableBack: function (d, f) {
        // to prevent dialog from being dismissed
        // by pressing "back" button (usually by accident)
        d.setOnKeyListener(
            function onKey(diag, key_code, event) {
                typeof f === "function" && f();
                return key_code === android.view.KeyEvent.KEYCODE_BACK;
            }
        );
        return d;
    },
    getContentText: d => d.getContentView().getText().toString(),
};

module.exports = ext;
module.exports.load = () => Object.assign(global["dialogs"], ext);