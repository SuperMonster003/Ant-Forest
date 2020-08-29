// given that there are bugs with dialogs modules
// in auto.js versions like 4.1.0 Alpha5 and 4.1.1 Alpha2

// in another way, extended functions like
// dialogsx.builds() and dialogsx.getContentText()
// could make things easier to some extent

global.dialogsx = typeof global.dialogsx === "object" ? global.dialogsx : {};

let myLooper = android.os.Looper.myLooper;
let getMainLooper = android.os.Looper.getMainLooper;
let isUiThread = () => myLooper() === getMainLooper();
let rtDialogs = () => {
    let d = runtime.dialogs;
    return isUiThread() ? d : d.nonUiDialogs;
};

let ext = {
    /**
     * @returns {com.stardust.autojs.core.ui.dialog.JsDialog}
     */
    build(properties) {
        let builder = Object.create(runtime.dialogs.newBuilder());
        builder.thread = threads.currentThread();
        for (let name in properties) {
            if (properties.hasOwnProperty(name)) {
                applyDialogProperty(builder, name, properties[name]);
            }
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
            let propertySetter = propertySetters[name] || {};
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
                let itemsSelectMode = properties.itemsSelectMode;
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
                        function (dialog, indices, texts) {
                            builder.emit("multi_choice",
                                toJsArray(indices, (l, i) => parseInt(l[i])),
                                toJsArray(texts, (l, i) => l[i].toString()),
                                builder.dialog);
                            return true;
                        });
                } else {
                    throw new Error("unknown itemsSelectMode " + itemsSelectMode);
                }
            }
            if (properties.progress !== undefined) {
                let progress = properties.progress;
                let indeterminate = (progress.max === -1);
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

            function toJsArray(object, adapter) {
                let jsArray = [];
                let len = object.length;
                for (let i = 0; i < len; i++) {
                    jsArray.push(adapter(object, i));
                }
                return jsArray;
            }
        }

        function parseColor(c) {
            if (typeof (c) == 'string') {
                return colors.parseColor(c);
            }
            return c;
        }
    },
    /**
     * @returns {com.stardust.autojs.core.ui.dialog.JsDialog}
     */
    builds(common, o) {
        let common_o = {};
        let defs = typeof global.defs === "undefined" ? require("./MODULE_DEFAULT_CONFIG").settings : global.defs;
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

        let final_dialog = this.build(Object.assign({}, common_o, o));
        global.dialogs_pool = (global.dialogs_pool || []).concat([final_dialog]);
        return final_dialog;
    },
    rawInput(title, prefill, callback) {
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
    prompt(title, prefill, callback) {
        return this.rawInput(title, prefill, callback);
    },
    input(title, prefill, callback) {
        prefill = prefill || "";
        if (isUiThread() && !callback) {
            return new Promise(function (resolve) {
                rtDialogs().rawInput(title, prefill, function (str) {
                    resolve(eval(str));
                });
            });
        }
        if (callback) {
            this.rawInput(title, prefill, function (str) {
                callback(eval(str));
            });
            return;
        }
        let input_cont = this.rawInput(title, prefill, callback ? callback : null);
        if (typeof input_cont === "string") {
            return eval(input_cont);
        }
    },
    alert(title, prefill, callback) {
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
    confirm(title, prefill, callback) {
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
    select(title, items, callback) {
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
    singleChoice(title, items, index, callback) {
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
    multiChoice(title, items, index, callback) {
        index = index || [];
        if (isUiThread() && !callback) {
            return new Promise(function (resolve) {
                rtDialogs().multiChoice(title, index, items, function (r) {
                    resolve(javaArrayToJsArray(r));
                });
            });
        }
        if (callback) {
            return javaArrayToJsArray(rtDialogs().multiChoice(title, index, items, function (r) {
                callback(javaArrayToJsArray(r));
            }));
        }
        return javaArrayToJsArray(rtDialogs().multiChoice(title, index, items, null));

        function javaArrayToJsArray(javaArray) {
            let jsArray = [];
            let len = javaArray.length;
            for (let i = 0; i < len; i++) {
                jsArray.push(javaArray[i]);
            }
            return jsArray;
        }
    },
    dismiss() {
        for (let i = 0, len = arguments.length; i < len; i += 1) {
            arguments[i].dismiss();
        }
    },
    disableBack(d, f) {
        // to prevent dialog from being dismissed
        // by pressing "back" button (usually by accident)
        d.setOnKeyListener(
            function onKey(diag, key_code) {
                typeof f === "function" && f();
                return key_code === android.view.KeyEvent.KEYCODE_BACK;
            }
        );
        return d;
    },
    getContentText: (d) => {
        return d.getContentView().getText().toString();
    },
};

module.exports = ext;
module.exports.load = () => global.dialogsx = ext;