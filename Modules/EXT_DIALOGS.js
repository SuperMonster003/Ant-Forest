// given that there are bugs with dialogs modules
// in auto.js versions like 4.1.0 Alpha5 and 4.1.1 Alpha2

// in another way, extended functions like
// dialogsx.builds() and dialogsx.getContentText()
// could make things easier to some extent

global.dialogsx = typeof global.dialogsx === "object" ? global.dialogsx : {};

let isUiThread = () => android.os.Looper.myLooper() === android.os.Looper.getMainLooper();
let rtDialogs = () => isUiThread() ? runtime.dialogs : runtime.dialogs.nonUiDialogs;

let ext = {
    /**
     * Formatted from dialog.build()
     * @returns {com.stardust.autojs.core.ui.dialog.JsDialog}
     */
    build(props) {
        let builder = Object.create(runtime.dialogs.newBuilder());
        builder.thread = threads.currentThread();

        Object.keys(props).forEach(n => applyDialogProperty(builder, n, props[n]));

        applyOtherDialogProperties(builder, props);

        return ui.run(builder.buildDialog.bind(builder));

        // tool function(s) //

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

            if (propertySetters.hasOwnProperty(name)) {
                let propertySetter = propertySetters[name] || {};
                if (propertySetter.method === undefined) {
                    propertySetter.method = name;
                }
                if (propertySetter.adapter) {
                    value = propertySetter.adapter(value);
                }
                builder[propertySetter.method].call(builder, value);
            }
        }

        function applyOtherDialogProperties(builder, properties) {
            if (properties.inputHint !== undefined || properties.inputPrefill !== undefined) {
                builder.input(
                    wrapNonNullString(properties.inputHint),
                    wrapNonNullString(properties.inputPrefill),
                    function (d, input) {
                        return builder.emit("input_change", builder.dialog, input.toString());
                    }
                ).alwaysCallInputCallback();
            }
            if (properties.items !== undefined) {
                let itemsSelectMode = properties.itemsSelectMode;
                if (itemsSelectMode === undefined || itemsSelectMode === 'select') {
                    builder.itemsCallback(function (dialog, view, position, text) {
                        builder.emit("item_select", position, text.toString(), builder.dialog);
                    });
                } else if (itemsSelectMode === 'single') {
                    builder.itemsCallbackSingleChoice(
                        properties.itemsSelectedIndex === undefined ? -1 : properties.itemsSelectedIndex,
                        function (d, view, which, text) {
                            builder.emit("single_choice", which, text.toString(), builder.dialog);
                            return true;
                        });
                } else if (itemsSelectMode === 'multi') {
                    builder.itemsCallbackMultiChoice(
                        properties.itemsSelectedIndex === undefined ? null : properties.itemsSelectedIndex,
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
                builder.progress(progress.max === -1, progress.max, !!progress.showMinMax);
                builder.progressIndeterminateStyle(!!progress.horizontal);
            }
            if (properties.checkBoxPrompt !== undefined || properties.checkBoxChecked !== undefined) {
                builder.checkBoxPrompt(
                    wrapNonNullString(properties.checkBoxPrompt),
                    !!properties.checkBoxChecked,
                    function (view, checked) {
                        return builder.getDialog().emit("check", checked, builder.getDialog());
                    });
            }
            if (properties.customView !== undefined) {
                let customView = properties.customView;
                // noinspection JSTypeOfValues
                if (typeof customView === 'xml' || typeof customView === 'string') {
                    customView = ui.run(() => ui.inflate(customView));
                }
                let wrapInScrollView = properties.wrapInScrollView;
                builder.customView(customView, wrapInScrollView === undefined ? true : wrapInScrollView);
            }

            function wrapNonNullString(str) {
                return str || "";
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
            return typeof c === 'string' ? colors.parseColor(c) : c;
        }
    },
    /**
     * @typedef {string|[string, Builds$title_color]} Builds$title
     * @typedef {string|[string, Builds$content_color]} Builds$content
     * @typedef {string|[string, Builds$btn_color]|number} Builds$neutral
     * @typedef {string|[string, Builds$btn_color]|number} Builds$negative
     * @typedef {string|[string, Builds$btn_color]|number} Builds$positive
     * @typedef {number|boolean} Builds$keep
     * @typedef {number|boolean|string} Builds$checkbox
     * @typedef {"title_default_color"|"title_caution_color"|string} Builds$title_color
     * @typedef {"content_default_color"|"content_dark_color"|"content_warn_color"|string} Builds$content_color
     * @typedef {
     *     "caution_btn_color"|"attraction_btn_color"|"warn_btn_color"|
     *     "hint_btn_dark_color"|"hint_btn_bright_color"|string
     * } Builds$btn_color
     */
    /**
     * @param {
     *     Tuple7<Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive, Builds$keep, Builds$checkbox>|
     *     Tuple6<Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive, Builds$keep>|
     *     Tuple5<Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive>|
     *     Tuple4<Builds$title, Builds$content, Builds$neutral, Builds$negative>|
     *     Tuple3<Builds$title, Builds$content, Builds$neutral>|
     *     Tuple2<Builds$title, Builds$content>|
     *     Tuple1<Builds$title>|string
     * } regular_props
     * @param {DialogsBuildProperties} [ext_props]
     * @returns {com.stardust.autojs.core.ui.dialog.JsDialog}
     */
    builds(regular_props, ext_props) {
        let _props = {};
        let _defs = global.$$def || require("./MODULE_DEFAULT_CONFIG").settings;
        let _diag_cnt = require("./MODULE_TREASURY_VAULT").dialog_contents || {};
        let _regular = typeof regular_props === "string" ? [regular_props] : regular_props;

        let [$tt, $cnt, $neu, $neg, $pos, $keep, $cbx] = _regular;

        void [
            ["title", $tt], ["content", $cnt], ["neutral", $neu], ["negative", $neg], ["positive", $pos]
        ].forEach(arr => _parseColorable.apply(null, arr));

        if ($keep) {
            _props.autoDismiss = _props.canceledOnTouchOutside = false;
        }
        if ($cbx) {
            _props.checkBoxPrompt = typeof $cbx === "string" ? $cbx : "不再提示";
        }

        let _diag = this.build(Object.assign(_props, ext_props));

        global._$_dialogs_pool = global._$_dialogs_pool || [];
        global._$_dialogs_pool.push(_diag);

        return _diag;

        // tool function(s) //

        function _parseColorable(key, par) {
            if (Array.isArray(par)) {
                let [_val, _color] = par;
                _props[key] = _val;
                _props[key + "Color"] = _color.match(/_color$/) ? _defs[_color] : _color;
            } else if (par) {
                _props[key] = key === "content" ? _diag_cnt[par] || par : par;
            }
        }
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {*} [callback]
     * @returns {Promise<unknown>|any}
     */
    rawInput(title, prefill, callback) {
        return isUiThread() && !callback ? new Promise((res) => {
            rtDialogs().rawInput(title, prefill || "", function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : rtDialogs().rawInput(title, prefill || "", callback || null);
    },
    input(title, prefill, callback) {
        if (callback) {
            return this.rawInput(title, prefill || "", str => callback(eval(str)));
        }
        if (isUiThread()) {
            return new Promise(res => rtDialogs().rawInput(title, prefill || "", s => res(eval(s))));
        }
        let input = this.rawInput(title, prefill || "", callback || null);
        if (typeof input === "string") {
            return eval(input);
        }
    },
    alert(title, prefill, callback) {
        return isUiThread() && !callback ? new Promise((res) => {
            rtDialogs().alert(title, prefill || "", function () {
                res.apply(null, Array.prototype.slice.call(arguments));
            });
        }) : rtDialogs().alert(title, prefill || "", callback || null);
    },
    /**
     * Show a message in dialogs title view (as toast message may be covered by dialog view)
     * @param {com.stardust.autojs.core.ui.dialog.JsDialog} d
     * @param {string} msg - message shown in title view
     * @param {number} [duration=3e3] - time duration before message dismissed (0 for non-auto dismiss)
     */
    alertTitle(d, msg, duration) {
        let _titles = global._$_alert_title_info = global._$_alert_title_info || {};
        _titles[d] = _titles[d] || {};
        _titles.message_showing ? ++_titles.message_showing : (_titles.message_showing = 1);

        let _ori_txt = _titles[d].ori_text || "";
        let _ori_color = _titles[d].ori_text_color || "";
        let _ori_bg_color = _titles[d].ori_bg_color || "";

        let _ori_view = d.getTitleView();
        if (!_ori_txt) {
            _titles[d].ori_text = _ori_txt = _ori_view.getText();
        }
        if (!_ori_color) {
            _titles[d].ori_text_color = _ori_color = _ori_view.getTextColors().colors[0];
        }
        if (!_ori_bg_color) {
            let _ori_view_bg_d = _ori_view.getBackground();
            _ori_bg_color = _ori_view_bg_d && _ori_view_bg_d.getColor() || -1;
            _titles[d].ori_bg_color = _ori_bg_color;
        }

        _setTitle(d, msg, colors.parseColor("#c51162"), colors.parseColor("#ffeffe"));

        duration === 0 || setTimeout(function () {
            --_titles.message_showing || _setTitle(d, _ori_txt, _ori_color, _ori_bg_color);
        }, duration || 3e3);

        // tool function(s) //

        function _setTitle(dialog, text, color, bg) {
            let _title_view = dialog.getTitleView();
            _title_view.setText(text);
            _title_view.setTextColor(color);
            _title_view.setBackgroundColor(bg);
        }
    },
    /**
     * Replace or append a message in dialogs content view
     * @param {com.stardust.autojs.core.ui.dialog.JsDialog} d
     * @param msg {string} - message shown in content view
     * @param {boolean|"append"} [is_append=false]
     * - whether original content is reserved or not
     */
    alertContent(d, msg, is_append) {
        let _ori_view = d.getContentView();
        let _ori_text = _ori_view.getText().toString();
        let _is_append = is_append === "append" || is_append === true;

        ui.post(() => {
            _ori_view.setText((_is_append ? _ori_text + "\n\n" : "") + msg);
            _ori_view.setTextColor(colors.parseColor("#283593"));
            _ori_view.setBackgroundColor(colors.parseColor("#e1f5fe"));
        });
    },
    prompt(title, prefill, callback) {
        return this.rawInput(title, prefill, callback);
    },
    confirm(title, prefill, callback) {
        return isUiThread() && !callback ? new Promise((res) => {
            rtDialogs().confirm(title, prefill || "", function () {
                res.apply(null, Array.prototype.slice.call(arguments));
            });
        }) : rtDialogs().confirm(title, prefill || "", callback || null);
    },
    select(title, items, callback) {
        if (items instanceof Array) {
            return isUiThread() && !callback ? new Promise((res) => {
                rtDialogs().select(title, items, function () {
                    res.apply(null, Array.prototype.slice.call(arguments));
                });
            }) : rtDialogs().select(title, items, callback || null);
        }
        return rtDialogs().select(title, [].slice.call(arguments, 1), null);
    },
    singleChoice(title, items, index, callback) {
        return isUiThread() && !callback ? new Promise((res) => {
            rtDialogs().singleChoice(title, index || 0, items, function () {
                res.apply(null, Array.prototype.slice.call(arguments));
            });
        }) : rtDialogs().singleChoice(title, index || 0, items, callback || null);
    },
    multiChoice(title, items, indices, callback) {
        let arr = (javaArr) => {
            let jsArray = [];
            for (let i = 0, l = javaArr.length; i < l; i++) {
                jsArray.push(javaArr[i]);
            }
            return jsArray;
        };
        return !callback ? isUiThread()
            ? new Promise(res => rtDialogs().multiChoice(title, indices || [], items, r => res(arr(r))))
            : arr(rtDialogs().multiChoice(title, indices || [], items, null))
            : arr(rtDialogs().multiChoice(title, indices || [], items, r => callback(arr(r))));
    },
    dismiss() {
        [].slice.call(arguments).forEach(d => d.dismiss());
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
    getTitleText(d) {
        return d ? d.getTitleView().getText().toString() : null;
    },
    setTitleText(d, str) {
        d && d.getTitleView().setText(str ? str.toString() : "");
    },
    setTitleTextColor(d, color) {
        d && d.getTitleView().setTextColor(parseColor.apply(null, [].slice.call(arguments, 1)));
    },
    setTitleBackgroundColor(d, color) {
        d && d.getTitleView().setBackgroundColor(parseColor.apply(null, [].slice.call(arguments, 1)));
    },
    getContentText(d) {
        return d ? d.getContentView().getText().toString() : null;
    },
    setContentText(d, str) {
        d && d.getContentView().setText(str ? str.toString() : "");
    },
    setContentTextColor(d, color) {
        d && d.getContentView().setTextColor(parseColor.apply(null, [].slice.call(arguments, 1)));
    },
    setContentBackgroundColor(d, color) {
        d && d.getContentView().setBackgroundColor(parseColor.apply(null, [].slice.call(arguments, 1)));
    },
    getInputText(d) {
        return d ? d.getInputEditText().getText().toString() : null;
    },
    setInputText(d, str) {
        d && d.getInputEditText().setText(str ? str.toString() : "");
    },
    setInputTextColor(d, color) {
        d && d.getInputEditText().setTextColor(parseColor.apply(null, [].slice.call(arguments, 1)));
    },
    setInputBackgroundColor(d, color) {
        d && d.getInputEditText().setBackgroundColor(parseColor.apply(null, [].slice.call(arguments, 1)));
    },
    clearPool() {
        (global._$_dialogs_pool || []).map((diag) => {
            diag.dismiss();
            diag = null;
        }).splice(0);
    },
    /**
     * @param {com.stardust.autojs.core.ui.dialog.JsDialog} d
     * @param {"ALL"|"EMAIL_ADDRESSES"|"MAP_ADDRESSES"|"PHONE_NUMBERS"|"WEB_URLS"} [mask="ALL"]
     */
    linkify(d, mask) {
        if (d) {
            let _cnt_vw = d.getContentView();
            let _cnt_text = _cnt_vw.getText().toString();
            _cnt_vw.setAutoLinkMask(android.text.util.Linkify[mask || "ALL"]);
            _cnt_vw.setText(_cnt_text);
        }
    },
};

module.exports = ext;
module.exports.load = () => global.dialogsx = ext;

// tool function(s) //

function parseColor(color) {
    if (arguments.length === 4) {
        return colors.argb.apply(colors, arguments);
    }
    if (arguments.length === 3) {
        return colors.rgb.apply(colors, arguments);
    }
    if (arguments.length === 1) {
        if (typeof color === "number") {
            return color;
        }
        if (typeof color === "string") {
            return colors.parseColor(color);
        }
    }
    return -1; // white as default
}