let {
    $$und, $$func, $$F,
    isPlainObject, isNullish, isXMLType,
} = require('./mod-global');
let {colorsx} = require('./ext-colors');
let {consolex} = require('./ext-console');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let WindowManager = android.view.WindowManager;
let LayoutParams = WindowManager.LayoutParams;
let Looper = android.os.Looper;
let Linkify = android.text.util.Linkify;
let ColorStateList = android.content.res.ColorStateList;
let ColorDrawable = android.graphics.drawable.ColorDrawable;
let JsDialog = com.stardust.autojs.core.ui.dialog.JsDialog;
let DialogAction = com.afollestad.materialdialogs.DialogAction;
let MaterialDialog = com.afollestad.materialdialogs.MaterialDialog;

let _ = {
    contents: require('../assets/data/dialog-contents'),
    /**
     * Same as uix.isUiThread() but not as uix.isUiMode()
     * @return {boolean}
     * @see uix.isUiThread
     */
    isUiThread: () => Looper.myLooper() === Looper.getMainLooper(),
    rtDialogs: () => _.isUiThread() ? runtime.dialogs : runtime.dialogs.nonUiDialogs,
};

let exp = {
    colors: {
        /**
         * @param {
         *     Dialogsx.Title.Color|Dialogsx.Content.Color|
         *     Dialogsx.Progress.Color|Dialogsx.Button.Color
         * } color
         * @param {'title'|'content'|'progress'|'button'} type
         * @return {string}
         */
        wrap(color, type) {
            if (type && this[type]) {
                for (let k in this[type]) {
                    if (this[type].hasOwnProperty(k)) {
                        if (color === k) {
                            let _c = this[type][k];
                            return Array.isArray(_c) ? _c[0] : _c;
                        }
                    }
                }
            }
            return color;
        },
        title: {
            default: '#212121', // Auto.js 4.1.1 Alpha2
            caution: '#880E0E',
            warn: '#880E4F',
            alert: ['#C51162', '#FFEFFE'],
        },
        content: {
            default: '#757575', // Auto.js 4.1.1 Alpha2
            caution: '#AD1414',
            warn: '#AD1457',
            alert: ['#283593', '#E1F5FE'],
        },
        progress: {
            /* [progress_tint, progress_bg_tint, action_button ] */
            download: ['#FF6F00', '#FFECB3', '#C43E00'],
            files: ['#F9A825', '#FFF59D', '#C17900'],
            backup: ['#455A64', '#ECEFF1', '#1C313A'],
            restore: ['#AB47BC', '#F3E5F5', '#790E8B'],
            indeterminate: ['#00897B', '#B2DFDB', '#005B4F'],
            finish: ['#00C853', '#DCEDC8', '#009624'],
            success: ['#00C853', '#DCEDC8', '#009624'],
            error: ['#1565C0', '#BBDEFB', '#003C8F'],
            failure: ['#1565C0', '#BBDEFB', '#003C8F'],
        },
        button: {
            default_aj_4: '#01A9F3', // Auto.js 4.1.1 Alpha2
            default: '#03A9F4', // override
            caution: '#FF3D00',
            warn: '#F57C00',
            attraction: '#7B1FA2',
            hint: '#0DA798',
            reset: '#A1887F',
            unavailable: '#BDBDBD',
            finish: '#009624',
            success: '#009624',
            error: '#003C8F',
            failure: '#003C8F',
        },
    },
    text: {
        btn: {
            F: '完成', B: '返回', Q: '放弃', X: '退出',
            I: '终止', K: '确定', S: '确认',
            C: '关闭', D: '删除', N: '继续',
            M: '确认修改', R: '使用默认值', T: '了解更多',
        },
        no_more_prompt: '不再提示',
        user_interrupted: '用户终止',
    },
    pool: {
        /** @type {Object.<string,JsDialog$>} */
        _data: {},
        /**
         * @template {!JsDialog$} T
         * @param {T} d
         * @param {string} [name_prefix]
         * @return {T}
         */
        add(d, name_prefix) {
            if (isNullish(d)) {
                return d;
            }
            return this._data[(name_prefix || '') + exp.getName(d)] = d;
        },
        /**
         * @param {string} name
         * @return {!JsDialog$|void}
         */
        get(name) {
            return this._data[name];
        },
        clear() {
            let _showing = Object.keys(this._data)
                .filter((k) => {
                    if (this._data[k].isShowing()) {
                        return true;
                    }
                    delete this._data[k];
                })
                .map((k) => {
                    let _diag = this._data[k];
                    _diag.dismiss();
                    return k.match(/@[a-f0-9]{5,}$/) ? k : k + exp.getName(_diag);
                });
            if (_showing.length) {
                consolex._(['清理扩展对话框样本池:'].concat(_showing), 0, 0, -2);
            }
        },
    },
    /**
     * @param {JsDialog$} d
     * @return {string}
     */
    getName(d) {
        return '@' + java.lang.Integer.toHexString(d.hashCode());
    },
    /**
     * Substitution of dialog.build()
     * @return {JsDialog$}
     */
    build(props) {
        let builder = Object.create(runtime.dialogs.newBuilder());
        builder.thread = threads.currentThread();

        Object.keys(props).forEach(n => applyDialogProperty.call(this, builder, n, props[n]));

        applyOtherDialogProperties(builder, props);

        return this.pool.add(ui.run(builder.buildDialog.bind(builder)));

        // tool function(s) //

        function applyDialogProperty(builder, name, value) {
            let propertySetters = {
                title: null,
                titleColor: {adapter: colorsx.toInt},
                buttonRippleColor: {adapter: colorsx.toInt},
                icon: null,
                content: null,
                contentColor: {adapter: colorsx.toInt},
                contentLineSpacing: null,
                items: null,
                itemsColor: {adapter: colorsx.toInt},
                positive: {method: 'positiveText', adapter: text => this.text.btn[text] || text},
                positiveColor: {adapter: colorsx.toInt},
                neutral: {method: 'neutralText', adapter: text => this.text.btn[text] || text},
                neutralColor: {adapter: colorsx.toInt},
                negative: {method: 'negativeText', adapter: text => this.text.btn[text] || text},
                negativeColor: {adapter: colorsx.toInt},
                cancelable: null,
                canceledOnTouchOutside: null,
                autoDismiss: null,
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
                let _ih = wrapNonNullString(properties.inputHint);
                let _ip = wrapNonNullString(properties.inputPrefill);
                let _cbk = function (d, input) {
                    return builder.emit('input_change', builder.dialog, input.toString());
                };
                builder.input(_ih, _ip, _cbk).alwaysCallInputCallback();
            }
            if (properties.items !== undefined) {
                let itemsSelectMode = properties.itemsSelectMode;
                if (itemsSelectMode === undefined || itemsSelectMode === 'select') {
                    builder.itemsCallback(function (dialog, view, position, text) {
                        builder.emit('item_select', position, text.toString(), builder.dialog);
                    });
                } else if (itemsSelectMode === 'single') {
                    builder.itemsCallbackSingleChoice(
                        properties.itemsSelectedIndex === undefined ? -1 : properties.itemsSelectedIndex,
                        function (d, view, which, text) {
                            builder.emit('single_choice', which, text.toString(), builder.dialog);
                            return true;
                        });
                } else if (itemsSelectMode === 'multi') {
                    builder.itemsCallbackMultiChoice(
                        properties.itemsSelectedIndex === undefined ? null : properties.itemsSelectedIndex,
                        function (dialog, indices, texts) {
                            builder.emit('multi_choice',
                                toJsArray(indices, (l, i) => parseInt(l[i])),
                                toJsArray(texts, (l, i) => l[i].toString()),
                                builder.dialog);
                            return true;
                        });
                } else {
                    throw new Error('Unknown itemsSelectMode\x20' + itemsSelectMode);
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
                        return builder.getDialog().emit('check', checked, builder.getDialog());
                    });
            }
            if (properties.customView !== undefined) {
                let customView = properties.customView;
                if (isXMLType(customView) || typeof customView === 'string') {
                    customView = ui.run(() => ui.inflate(customView));
                }
                let wrapInScrollView = properties.wrapInScrollView;
                builder.customView(customView, wrapInScrollView === undefined ? true : wrapInScrollView);
            }

            function wrapNonNullString(str) {
                return str || '';
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
    },
    /**
     * @param {Dialogsx.Builds.Property|Dialogsx.Builds.Extension} props
     * @param {Dialogsx.Builds.Extension} [ext]
     * @return {JsDialog$}
     */
    builds(props, ext) {
        if (isPlainObject(props)) {
            return this.builds('', props);
        }
        let [
            $tt, $cnt, $neu, $neg, $pos, $obstinate, $cbx,
        ] = typeof props === 'string' ? [props] : props;

        let _props = {
            autoDismiss: !$obstinate,
            canceledOnTouchOutside: !$obstinate,
            checkBoxPrompt: $cbx ? typeof $cbx === 'string'
                ? $cbx : this.text.no_more_prompt : undefined,
        };

        let _ext = ext || {};

        void [
            ['title', $tt, this.colors.title],
            ['content', $cnt, this.colors.content],
            ['neutral', $neu, this.colors.button, this.text.btn],
            ['negative', $neg, this.colors.button, this.text.btn],
            ['positive', $pos, this.colors.button, this.text.btn],
        ].map((arr) => {
            let [key, data] = arr;
            if ($$und(data) && !$$und(_ext[key])) {
                arr.splice(1, 1, _ext[key]);
            }
            return arr;
        }).forEach(arr => _parseAndColorUp.apply(this, arr));

        Object.assign(_props, _ext);
        ['title', 'content'].forEach((k) => {
            if (k in _props) {
                _props[k] = String(_props[k]);
            }
        });

        let _diag = this.build(_props);

        if (_ext.linkify) {
            this.linkify(_diag);
        }
        if (_ext.keycode_back !== undefined) {
            let _v = _ext.keycode_back;
            if (_v === 'disabled' || $$func(_v) || $$F(_v)) {
                this.disableBack(_diag, _v);
            }
        }

        ui.post(() => {
            let _win = _diag.getWindow();

            let _dim = _ext.dim_amount;
            if (typeof _dim === 'number') {
                while (_dim > 1) {
                    _dim /= 100;
                }
                _win.setDimAmount(_dim);
            }

            let _bg = _ext.background;
            if (typeof _bg === 'string') {
                _bg.match(/^#/)
                    ? _win.setBackgroundDrawable(new ColorDrawable(colorsx.toInt(_bg)))
                    : _win.setBackgroundDrawableResource(android.R.color[_bg]);
            } else if (typeof _bg === 'number') {
                _win.setBackgroundDrawable(new ColorDrawable(_bg));
            }

            let _anm = _ext.animation;
            if (typeof _anm === 'string') {
                _anm = _anm.split('_').map(s => s.toTitleCase()).join('');
                _anm === 'Default'
                    ? _win.setWindowAnimations(android.R.style.Animation)
                    : _win.setWindowAnimations(android.R.style['Animation_' + _anm]);
            }

            let _is_keep_screen_on = _ext.is_keep_screen_on;
            if (typeof _is_keep_screen_on !== 'undefined') {
                if (_is_keep_screen_on) {
                    _win.addFlags(LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            }
        });

        return _diag;

        // tool function(s) //

        function _parseAndColorUp(key, data, color_lib, text_lib) {
            if (!_ext[key] || Array.isArray(_ext[key])) {
                let [_text, _color] = Array.isArray(data) ? data : [data];
                if (_text) {
                    if (key === 'content' && !text_lib) {
                        text_lib = _.contents;
                    }
                    _ext[key] = text_lib && text_lib[_text] || _text;
                }
                let _k_c = key + 'Color';
                let _c = _ext[_k_c] || color_lib[_color] || _color || color_lib.default;
                _ext[_k_c] = colorsx.toInt(_c);
            }
        }
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {function} [callback]
     * @return {Promise<void>|*}
     */
    rawInput(title, prefill, callback) {
        return _.isUiThread() && !callback ? new Promise((res) => {
            _.rtDialogs().rawInput(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : _.rtDialogs().rawInput(title, prefill || '', callback || null);
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {function} [callback]
     * @return {Promise<*>|*}
     */
    input(title, prefill, callback) {
        if (callback) {
            return this.rawInput(title, prefill || '', str => callback(eval(str)));
        }
        if (_.isUiThread()) {
            return new Promise((res) => {
                _.rtDialogs().rawInput(title, prefill || '', s => res(eval(s)));
            });
        }
        let input = this.rawInput(title, prefill || '', callback || null);
        if (typeof input === 'string') {
            return eval(input);
        }
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {function} [callback]
     * @return {Promise<void>|*}
     */
    alert(title, prefill, callback) {
        return _.isUiThread() && !callback ? new Promise((res) => {
            _.rtDialogs().alert(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : _.rtDialogs().alert(title, prefill || '', callback || null);
    },
    /**
     * Show a message in dialogs title view (as toast message may be covered by dialog view)
     * @param {JsDialog$|MaterialDialog$} d
     * @param {string} msg - message shown in title view
     * @param {number} [duration=3e3] - time duration before message dismissed (0 for non-auto dismiss)
     */
    alertTitle(d, msg, duration) {
        let _titles = global._$_alert_title_info = global._$_alert_title_info || {};
        _titles[d] = _titles[d] || {};
        _titles.message_showing ? ++_titles.message_showing : (_titles.message_showing = 1);

        let _ori_txt = _titles[d].ori_text || '';
        let _ori_color = _titles[d].ori_text_color || '';
        let _ori_bg_color = _titles[d].ori_bg_color || '';

        let _ori_view = d.getTitleView();
        if (!_ori_txt) {
            _titles[d].ori_text = _ori_txt = _ori_view.getText();
        }
        if (!_ori_color) {
            _titles[d].ori_text_color = _ori_color = _ori_view.getTextColors()
                .getColorForState(util.java.array('int', 0), colors.parseColor('#de000000'));
        }
        if (!_ori_bg_color) {
            _titles[d].ori_bg_color = -1;
        }

        _setTitle(d, msg, this.colors.title.alert.map(colorsx.toInt));

        duration === 0 || setTimeout(function () {
            --_titles.message_showing || _setTitle(d, _ori_txt, [_ori_color, _ori_bg_color]);
        }, duration || 3e3);

        // tool function(s) //

        function _setTitle(dialog, text, colors) {
            let _title_view = dialog.getTitleView();
            let [_c_text, _c_bg] = colors;
            ui.run(() => {
                _title_view.setText(text);
                _title_view.setTextColor(_c_text);
                _title_view.setBackgroundColor(_c_bg);
            });
        }
    },
    /**
     * Replace or append a message in dialogs content view
     * @param {JsDialog$|MaterialDialog$} d
     * @param {string} msg - message shown in content view
     * @param {boolean|'append'} [is_append=false] - whether original content is reserved or not
     */
    alertContent(d, msg, is_append) {
        let _ori_view = d.getContentView();
        let _ori_text = _ori_view.getText().toString();
        let _is_append = is_append === 'append' || is_append === true;
        let [_c_text, _c_bg] = this.colors.content.alert.map(s => colorsx.toInt(s));

        ui.post(() => {
            _ori_view.setText((_is_append ? _ori_text + '\n\n' : '') + msg);
            _ori_view.setTextColor(_c_text);
            _ori_view.setBackgroundColor(_c_bg);
        });
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {function} [callback]
     * @return {Promise<*>|*}
     */
    prompt(title, prefill, callback) {
        return this.rawInput(title, prefill, callback);
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {function} [callback]
     * @return {Promise<void>|*}
     */
    confirm(title, prefill, callback) {
        return _.isUiThread() && !callback ? new Promise((res) => {
            _.rtDialogs().confirm(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : _.rtDialogs().confirm(title, prefill || '', callback || null);
    },
    /**
     * @param {string} title
     * @param {string[]|string} items
     * @param {function} [callback]
     * @return {Promise<void>|*}
     */
    select(title, items, callback) {
        if (items instanceof Array) {
            return _.isUiThread() && !callback ? new Promise((res) => {
                _.rtDialogs().select(title, items, function () {
                    res.apply(null, [].slice.call(arguments));
                });
            }) : _.rtDialogs().select(title, items, callback || null);
        }
        return _.rtDialogs().select(title, [].slice.call(arguments, 1), null);
    },
    /**
     * @param {string} title
     * @param {string[]} items
     * @param {number} [index=0]
     * @param {function} [callback]
     * @return {Promise<void>|*}
     */
    singleChoice(title, items, index, callback) {
        return _.isUiThread() && !callback ? new Promise((res) => {
            _.rtDialogs().singleChoice(title, index || 0, items, function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : _.rtDialogs().singleChoice(title, index || 0, items, callback || null);
    },
    /**
     * @param {string} title
     * @param {string[]} items
     * @param {number[]} [indices]
     * @param {function} [callback]
     * @return {Promise<void>|*[]}
     */
    multiChoice(title, items, indices, callback) {
        let arr = (javaArr) => {
            let jsArray = [];
            for (let i = 0, l = javaArr.length; i < l; i++) {
                jsArray.push(javaArr[i]);
            }
            return jsArray;
        };
        return callback
            ? arr(_.rtDialogs().multiChoice(title, indices || [], items, r => callback(arr(r))))
            : _.isUiThread()
                ? new Promise((res) => {
                    _.rtDialogs().multiChoice(title, indices || [], items, r => res(arr(r)));
                })
                : arr(_.rtDialogs().multiChoice(title, indices || [], items, null));
    },
    /**
     * @param {...JsDialog$|JsDialog$[]|MaterialDialog$|MaterialDialog$[]} [d]
     */
    dismiss(d) {
        (Array.isArray(d) ? d : [].slice.call(arguments)).forEach((o) => {
            typeof o === 'object' && o.dismiss && o.dismiss();
        });
    },
    clearPool() {
        this.pool.clear();
    },
    /**
     * @template {JsDialog$|MaterialDialog$} DIALOG
     * @param {DIALOG} d
     * @param {function(DIALOG)|*} [f]
     * @return {DIALOG}
     */
    disableBack(d, f) {
        // to prevent dialog from being dismissed
        // by pressing 'back' button (usually by accident)
        d.setOnKeyListener({
            onKey(diag, key_code, event) {
                if (event.getAction() !== KeyEvent.ACTION_UP) {
                    return false;
                }
                typeof f === 'function' && f(d);
                return key_code === KeyEvent.KEYCODE_BACK;
            },
        });
        return d;
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @return {string}
     */
    getTitleText(d) {
        return d ? d.getTitleView().getText().toString() : '';
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {string} [str='']
     */
    setTitleText(d, str) {
        ui.run(() => {
            d && d.getTitleView().setText(str ? str.toString() : '');
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Dialogsx.Title.Color} color
     */
    setTitleTextColor(d, color) {
        ui.run(() => {
            d && d.getTitleView().setTextColor(colorsx.toInt(this.colors.wrap(color, 'title')));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Dialogsx.Title.Color} color
     */
    setTitleBackgroundColor(d, color) {
        ui.run(() => {
            d && d.getTitleView().setBackgroundColor(colorsx.toInt(this.colors.wrap(color, 'title')));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     */
    getContentText(d) {
        return d ? d.getContentView().getText().toString() : null;
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {string} [str='']
     */
    setContentText(d, str) {
        ui.run(() => {
            d && d.getContentView().setText(str ? str.toString() : '');
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {string} [str='']
     */
    appendContentText(d, str) {
        ui.run(() => {
            d && d.getContentView().setText(this.getContentText(d) + (str ? str.toString() : ''));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Dialogsx.Content.Color} color
     */
    setContentTextColor(d, color) {
        ui.run(() => {
            d && d.getContentView().setTextColor(colorsx.toInt(this.colors.wrap(color, 'content')));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Dialogsx.Content.Color} color
     */
    setContentBackgroundColor(d, color) {
        ui.run(() => {
            d && d.getContentView().setBackgroundColor(colorsx.toInt(this.colors.wrap(color, 'content')));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     */
    getInputText(d) {
        return d ? d.getInputEditText().getText().toString() : '';
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {string|{toString:function():string}} [s='']
     */
    setInputText(d, s) {
        let _s = typeof s === 'string' ? s : typeof s !== 'undefined' ? s.toString() : '';
        ui.run(() => d && d.getInputEditText().setText(_s));
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Color$} color
     */
    setInputTextColor(d, color) {
        ui.run(() => {
            d && d.getInputEditText().setTextColor(colorsx.toInt(color));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Color$} color
     */
    setInputBackgroundColor(d, color) {
        ui.run(() => {
            d && d.getInputEditText().setBackgroundColor(colorsx.toInt(color));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Dialogsx.LinkifyMask} [mask='ALL']
     */
    linkify(d, mask) {
        if (d) {
            let _cnt_vw = d.getContentView();
            ui.run(() => {
                let _cnt_text = _cnt_vw.getText().toString();
                _cnt_vw.setAutoLinkMask(Linkify[mask || 'ALL']);
                _cnt_vw.setText(_cnt_text);
            });
        }
    },
    /**
     * @param {'positive'|'negative'|'neutral'} action
     * @return {?com.afollestad.materialdialogs.DialogAction}
     */
    getDialogAction(action) {
        try {
            switch (action.toLowerCase()) {
                case 'positive':
                    return DialogAction.valueOf('POSITIVE');
                case 'negative':
                    return DialogAction.valueOf('NEGATIVE');
                case 'neutral':
                    return DialogAction.valueOf('NEUTRAL');
            }
        } catch (e) {
            // Java class "com.afollestad.materialdialogs.DialogAction"
            // has no public instance field or method named "%ACTION%"
            return null;
        }
        throw TypeError('unknown action of dialogsx.getDialogAction');
    },
    /**
     * Compatible for MaterialDialog.getActionButton()
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'positive'|'negative'|'neutral'} action
     * @return {string}
     */
    getActionButton(d, action) {
        let _act = action.toLowerCase();
        if (d instanceof MaterialDialog) {
            let _d_act = this.getDialogAction(_act);
            if (_d_act !== null) {
                return d.getActionButton(_d_act).getText().toString();
            }
            if (typeof d[_act + 'Button'] === 'object') {
                return d[_act + 'Button']['getText']();
            }
        }
        return d instanceof JsDialog ? d.getActionButton(_act) : '';
    },
    /**
     * Compatible for MaterialDialog.setActionButton()
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'positive'|'negative'|'neutral'|('positive'|'negative'|'neutral')[]} action
     * @param {?string} title
     * @param {Dialogsx.Button.Color} [color]
     */
    setActionButton(d, action, title, color) {
        let _set = function (action) {
            let _act = action.toLowerCase();
            d instanceof MaterialDialog
                ? ui.run(() => {
                    let _d_act = this.getDialogAction(_act);
                    if (_d_act !== null) {
                        d.setActionButton(_d_act, title);
                    } else if (typeof d[_act + 'Button'] === 'object') {
                        d[_act + 'Button']['setText'](title);
                    }
                })
                : ui.run(() => d.setActionButton(_act, title));
            color && this.setActionButtonColor(d, _act, color);
        }.bind(this);

        Array.isArray(action) ? action.forEach(_set) : _set(action);
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'positive'|'negative'|'neutral'|('positive'|'negative'|'neutral')[]} action
     * @param {Dialogsx.Button.Color} color
     */
    setActionButtonColor(d, action, color) {
        let _set = function (action) {
            let _act = action.toLowerCase();
            let _c_int = colorsx.toInt(this.colors.wrap(color, 'button'));
            let _d_act = this.getDialogAction(_act);
            ui.run(() => {
                if (_d_act !== null) {
                    return d.getActionButton(_d_act).setTextColor(_c_int);
                }
                if (d instanceof MaterialDialog) {
                    if (typeof d[_act + 'Button'] === 'object') {
                        return d[_act + 'Button']['setTextColor'](_c_int);
                    }
                }
            });
        }.bind(this);

        Array.isArray(action) ? action.forEach(_set) : _set(action);
    },
    /**
     * @param {Dialogsx.Builds.Property} props
     * @param {Dialogsx.Builds.Extension | {
     *     timeout?: number,
     *     timeout_button?: Dialogs.ActionButton,
     *     onNeutral?: function(d:Dialogsx.BuildCountdown.Extension),
     *     onNegative?: function(d:Dialogsx.BuildCountdown.Extension),
     *     onPositive?: function(d:Dialogsx.BuildCountdown.Extension),
     *     onTimeout?: function(d:Dialogsx.BuildCountdown.Extension):Dialogs.ActionButton|Dialogs.ActionButton,
     *     onPause?: function(d:Dialogsx.BuildCountdown.Extension)|{
     *         title?: string|[RegExp|string,string],
     *         content?: string|[RegExp|string,string],
     *         neutral?: string|[RegExp|string,string],
     *         negative?: string|[RegExp|string,string],
     *         positive?: string|[RegExp|string,string],
     *         action?: function(d:Dialogsx.BuildCountdown.Extension),
     *     },
     * }} extensions
     * @return {Dialogsx.BuildCountdown.Extension}
     */
    buildCountdown(props, extensions) {
        let _ext = Object.assign({keycode_back: () => _act.pause(100)}, extensions);

        let _onNeutral = _ext.onNeutral || (r => r);
        let _onNegative = _ext.onNegative || (r => r);
        let _onPositive = _ext.onPositive || (r => r);

        let _onTimeout = _ext.onTimeout;
        if (typeof _onTimeout !== 'function' && typeof _onTimeout !== 'string') {
            throw Error('onTimeout for dialogsx.buildCountdown() must be specified');
        }

        let _signal = 0;
        let _sec = _ext.timeout || 5;
        if (_sec > 100) {
            _sec = Math.round(_sec / 1e3);
        }

        let _act = {
            neutral() {
                this.pause(300);
                _onNeutral(_diag);
            },
            negative() {
                this.pause(300);
                _onNegative(_diag);
            },
            positive() {
                _signal = 1;
                this.pause(100);
                _onPositive(_diag);
            },
            pause(interval) {
                _thd_et.interrupt();
                setTimeout(() => {
                    if (typeof _ext.onPause === 'function') {
                        return _ext.onPause(_diag);
                    }
                    if (typeof _ext.onPause === 'object') {
                        let _p = _ext.onPause;
                        if (typeof _p.action === 'function') {
                            _p.action(_diag);
                        }
                        void [{
                            key: 'title',
                            get(d) {
                                return exp.getTitleText(d);
                            },
                            set(d, k, v) {
                                exp.setTitleText(d, v);
                            },
                        }, {
                            key: 'content',
                            get(d) {
                                return exp.getContentText(d);
                            },
                            set(d, k, v) {
                                exp.setContentText(d, v);
                            },
                        }, {
                            key: 'neutral',
                            get(d, k) {
                                return exp.getActionButton(d, k);
                            },
                            set(d, k, v) {
                                exp.setActionButton(d, k, v);
                            },
                        }, {
                            key: 'negative',
                            get(d, k) {
                                return exp.getActionButton(d, k);
                            },
                            set(d, k, v) {
                                exp.setActionButton(d, k, v);
                            },
                        }, {
                            key: 'positive',
                            get(d, k) {
                                return exp.getActionButton(d, k);
                            },
                            set(d, k, v) {
                                exp.setActionButton(d, k, v);
                            },
                        }].forEach((o) => {
                            let _k = o.key;
                            if (_p[_k]) {
                                if (Array.isArray(_p[_k])) {
                                    let [_s, _r] = _p[_k];
                                    o.set(_diag, _k, o.get(_diag, _k).replace(_s, _r));
                                } else {
                                    o.set(_diag, _k, _p[_k]);
                                }
                            } else {
                                if (_ext[_k]) {
                                    o.set(_diag, _k, _ext[_k]);
                                }
                            }
                        });
                    }
                }, interval || 800);
            },
            /** @param {Dialogsx.BuildCountdown.Block} [o] */
            block(o) {
                let _o = o || {};
                let _onStart = _o.onStart || (r => r);
                let _onTimeout = _o.onTimeout || (r => r);
                let _onUnblock = _o.onUnblock || (r => r);
                let _start = Date.now();
                let _timeout = _o.timeout || 1;
                if (_timeout < 100) {
                    _timeout *= 60e3;
                }

                _onStart(_diag);

                while (!_signal) {
                    if (Date.now() - _start > _timeout) {
                        this.pause(100);
                        _onTimeout(_diag);
                    }
                    sleep(120);
                }

                _onUnblock(_diag);
            },
        };

        let _diag = Object.create(exp.builds(props, _ext)
            .on('neutral', () => _act.neutral())
            .on('negative', () => _act.negative())
            .on('positive', () => _act.positive()));

        let _diag_ext = {
            act() {
                _diag.isShowing() || _diag.show();
                return _diag_mixed;
            },
            /**
             * @param {Dialogsx.BuildCountdown.Block} [o]
             * @return {Dialogsx.BuildCountdown.Extension}
             */
            block(o) {
                _act.block(o);
                return _diag_mixed;
            },
        };

        let _diag_mixed = Object.assign(_diag, _diag_ext);

        let _thd_et = threads.start(function () {
            let _cont = exp.getContentText(_diag);
            let _rex = /%timeout%/;
            let _setContent = _cont.match(_rex) ? function (t) {
                _diag.setContent(_cont.replace(_rex, t.toString()));
            } : (r => r);

            let _btn = _ext.timeout_button;
            let _btn_str = _btn && _diag.getActionButton(_btn);
            let _setButton = _btn ? function (t) {
                _diag.setActionButton(_btn, _btn_str + '  [ ' + t + ' ]');
            } : (r => r);

            let _itv = 1e3;
            while (1) {
                _setContent(_sec);
                _setButton(_sec);
                if (_sec <= 0) {
                    break;
                }
                _sec -= _itv / 1e3;
                sleep(_itv);
            }

            let _act_tar = _onTimeout;
            if (typeof _act_tar === 'function') {
                _act_tar = _onTimeout(_diag);
            }
            _act[_act_tar].call(_act);
        });

        return _diag_mixed;
    },
    /**
     * Build a dialog with flow steps
     * @param {Object} [config]
     * @param {string} [config.title]
     * @param {*} [config.initial_value]
     * @param {Dialogsx.Button.Text} [config.on_interrupt_btn_text='B']
     * @param {boolean} [config.show_min_max]
     * @param {{
     *     desc: string,
     *     action: function(value:*,d:Dialogsx.BuildFlow.Extension),
     *     onSuccess?: function(value:*),
     *     onFailure?: function(reason:*),
     * }[]} config.steps
     * @param {string} [config.success_title]
     * @param {string} [config.success_content]
     * @param {function(value:*,d:Dialogsx.BuildFlow.Extension):*} [config.onStart]
     * @param {function(value:*,d:Dialogsx.BuildFlow.Extension):*} [config.onSuccess]
     * @param {function(err:*,d:Dialogsx.BuildFlow.Extension):*} [config.onFailure]
     * @example
     * dialogsx.buildFlow({
     *     title: '正在部署项目最新版本',
     *     success_content: '更新完成',
     *     steps: [{
     *         desc: '下载项目数据包',
     *         action: () => {
     *             return new Promise((resolve) => {
     *                 resolve({num: 1});
     *             });
     *         },
     *     }, {
     *         desc: '解压缩',
     *         action: (res, d) => {
     *             let _n = 0;
     *             while(_n < 100) {
     *                 d.setProgress(++_n);
     *                 sleep(30);
     *             }
     *             res.num = _n;
     *             return res;
     *         },
     *     }, {
     *         desc: '备份本地项目',
     *         action: (res) => {
     *             sleep(200);
     *             res.num /= 25;
     *             return res;
     *         },
     *     }, {
     *         desc: '文件替换',
     *         action: (res) => {
     *             sleep(200);
     *             res.num = Math.max(res.num, 2);
     *             return res;
     *         },
     *     }, {
     *         desc: '清理并完成部署',
     *         action: (res) => {
     *             sleep(200);
     *             console.log(res.num); // 4
     *         },
     *     }],
     * }).act();
     * @return {Dialogsx.BuildFlow.Extension}
     */
    buildFlow(config) {
        let _dialogsx = this;

        let _diag = Object.create(_dialogsx.builds([
            config.title || '', config.steps.map((step, i) => (
                '\u3000\x20' + ++i + '.\x20' + step.desc
            )).join('\n'), 0, 0, 'I', 1], {
            progress: {max: 100, showMinMax: !!config.show_min_max},
        }));

        let _diag_ext = {
            act() {
                let _promise = new Promise((resolve) => {
                    _diag.on('positive', () => {
                        global._$_dialog_flow_interrupted = true;
                    });
                    if (typeof config.onStart === 'function') {
                        config.onStart(config.initial_value, _diag);
                    }
                    resolve(config.initial_value);
                });

                config.steps.forEach((step, idx) => {
                    _promise = _promise.then((value) => {
                        if (global._$_dialog_flow_interrupted) {
                            throw Error(exp.text.user_interrupted);
                        }
                        let _fin = (result) => {
                            _diag.setProgress(100);
                            _setStepsFinished(idx + 1);
                            step.onSuccess && step.onSuccess(value);
                            return result;
                        };
                        _diag.setProgress(0);
                        _setStepOnProgress(idx + 1);
                        let _result = step.action(value, _diag);
                        if (_result instanceof Promise) {
                            _result = _result.then(_fin);
                            return _result;
                        }
                        return _fin(_result);
                    }, step.onFailure);
                });

                _promise = _promise.then((res) => {
                    if (global._$_dialog_flow_interrupted) {
                        throw Error(exp.text.user_interrupted);
                    }
                    _dialogsx.setProgressColorTheme(_diag, 'finish');

                    _setStepsFinished('all');

                    _diag.removeAllListeners('positive');
                    _diag.setActionButton('positive', exp.text.btn.F);
                    _diag.on('positive', d => d.dismiss());

                    let _title = config.success_title;
                    _title && _dialogsx.setTitleText(_diag, _title);

                    let _cont = config.success_content;
                    _cont && _dialogsx.appendContentText(_diag, '\n\n' + _cont);

                    delete global._$_dialog_flow_interrupted;

                    if (typeof config.onSuccess === 'function') {
                        config.onSuccess(res, _diag);
                    }
                });

                _promise.catch((err) => {
                    delete global._$_dialog_flow_interrupted;

                    if (typeof config.onFailure === 'function') {
                        config.onFailure({
                            message: err,
                            btn_text: exp.text.btn[config.on_interrupt_btn_text || 'B'],
                            onPositive() {
                                exp.clearPool();
                                exit();
                            },
                        }, _diag);
                    }
                });

                _diag.isShowing() || _diag.show();

                return _diag_mixed;
            },
            setStepDesc(step_num, desc, is_append) {
                if (step_num < 1) {
                    throw Error('step_num is less than 1');
                }
                if (step_num >= config.steps.length) {
                    throw Error('step_num must be less than steps length');
                }
                let _step_num = step_num.toString();
                let _view = _diag.getContentView();
                let _content = _view.getText().toString();
                let _aim_str = config.steps[_step_num - 1].desc;
                if (_content.match(_aim_str)) {
                    let _text = (is_append ? _aim_str : '') + (desc || '');
                    _view.setText(_content.replace(_aim_str, _text));
                }
                return _diag_mixed;
            },
            setProgressData(data) {
                if (typeof data === 'object') {
                    let _num = data.processed / data.total * 100 || 0;
                    _diag.setProgress(Math.min(Math.max(0, _num), 100));
                }
                return _diag_mixed;
            },
            setFailureData(data) {
                _diag.setActionButton('positive', data.btn_text || exp.text.btn.B);
                _diag.removeAllListeners('positive');
                _diag.on('positive', data.onPositive || (d => d.dismiss()));
                exp.alertContent(_diag, data.message, 'append');
                return _diag_mixed;
            },
        };

        let _diag_mixed = Object.assign(_diag, _diag_ext);

        return _diag_mixed;

        // tool function(s) //

        function _setStepsFinished(ctr) {
            let _ctr = ctr === 'all' || !ctr ? Infinity : ctr;
            let _cont = _dialogsx.getContentText(_diag);
            let _rex = /^(. )(\d)(?=\.)/gm;
            _dialogsx.setContentText(_diag, _cont.replace(_rex, ($0, $1, $2) => (
                ($2 <= _ctr ? '\u2714 ' : $1) + $2
            )));
        }

        function _setStepOnProgress(num) {
            let _num = num.toString();
            let _cont = _dialogsx.getContentText(_diag);
            let _rex = /^(. )(\d)(?=\.)/gm;
            _dialogsx.setContentText(_diag, _cont.replace(_rex, ($0, $1, $2) => (
                ($2 === _num ? '\u25b6 ' : $1) + $2
            )));
        }
    },
    /**
     * Build a dialog with progress view
     * @param {Object} [config]
     * @param {string} [config.title]
     * @param {string} [config.content]
     * @param {string} [config.desc] - alias for config.content
     * @param {Dialogsx.Button.Text} [config.on_interrupt_btn_text='B']
     * @param {boolean} [config.show_min_max]
     * @param {*} [config.initial_value]
     * @param {string} [config.success_title]
     * @param {string} [config.success_content]
     * @param {function(value:*,d:Dialogsx.BuildProgress.Extension):*} [config.onStart]
     * @param {function(value:*,d:Dialogsx.BuildProgress.Extension):*} config.action
     * @param {function(value:*,d:Dialogsx.BuildProgress.Extension):*} [config.onSuccess]
     * @param {function(err:*,d:Dialogsx.BuildProgress.Extension):*} [config.onFailure]
     * @example
     * dialogsx.buildProgress({
     *     title: '正在部署项目最新版本',
     *     success_content: '部署完成',
     *     content: '项目部署中...',
     *     action: (res, d) => {
     *         let _n = 0;
     *         while (_n < 100) {
     *             d.setProgress(++_n);
     *             sleep(20);
     *         }
     *     },
     * }).act();
     * @return {Dialogsx.BuildProgress.Extension}
     */
    buildProgress(config) {
        let _diag = Object.create(exp.builds([
            config.title || '', config.content || config.desc || '', 0, 0, 'I', 1,
        ], {progress: {max: 100, showMinMax: !!config.show_min_max}}));

        let _diag_ext = {
            act() {
                Promise.resolve(config.initial_value)
                    .then((value) => {
                        if (typeof config.onStart === 'function') {
                            config.onStart(config.initial_value, _diag);
                        }
                        return value;
                    })
                    .then((value) => {
                        _diag.on('positive', () => {
                            global._$_dialog_flow_interrupted = true;
                        });
                        if (global._$_dialog_flow_interrupted) {
                            throw Error(exp.text.user_interrupted);
                        }
                        return config.action(value, _diag);
                    })
                    .then((res) => {
                        if (global._$_dialog_flow_interrupted) {
                            throw Error(exp.text.user_interrupted);
                        }
                        exp.setProgressColorTheme(_diag, 'finish');

                        _diag.setProgress(100);
                        _diag.removeAllListeners('positive');
                        _diag.setActionButton('positive', exp.text.btn.F);
                        _diag.on('positive', d => d.dismiss());

                        let _title = config.success_title;
                        _title && exp.setTitleText(_diag, _title);

                        let _cont = config.success_content;
                        _cont && exp.appendContentText(_diag, '\n\n' + _cont);

                        delete global._$_dialog_flow_interrupted;

                        if (typeof config.onSuccess === 'function') {
                            config.onSuccess(res, _diag);
                        }
                    })
                    .catch((err) => {
                        exp.setProgressColorTheme(_diag, 'error');
                        _diag.removeAllListeners('positive');

                        let _btn_el = exp.text.btn[config.on_interrupt_btn_text || 'B'];
                        _diag.setActionButton('positive', _btn_el);

                        _diag.on('positive', d => d.dismiss());

                        exp.alertContent(_diag, err, 'append');

                        delete global._$_dialog_flow_interrupted;

                        if (typeof config.onFailure === 'function') {
                            config.onFailure(err, _diag);
                        }
                    });

                _diag.isShowing() || _diag.show();

                return _diag_mixed;
            },
            setStepDesc(desc, is_append) {
                let _view = _diag.getContentView();
                let _content = _view.getText().toString();
                let _aim_str = config.content || '';
                if (_content.match(_aim_str)) {
                    let _text = (is_append ? _aim_str : '') + (desc || '');
                    _view.setText(_content.replace(_aim_str, _text));
                }
                return _diag_mixed;
            },
            setProgressData(data) {
                _diag.setProgress(data.processed / data.total * 100);
                return _diag_mixed;
            },
        };

        let _diag_mixed = Object.assign(_diag, _diag_ext);

        return _diag_mixed;
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {number|{processed:number,total:number}} progress
     * @param {boolean} [animate=false]
     */
    setProgress(d, progress, animate) {
        let _n = typeof progress === 'object'
            ? progress.processed / progress.total * 100
            : progress;
        ui.run(() => d.getProgressBar().setProgress(_n, !!animate));
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Dialogsx.Progress.Color} color
     */
    setProgressTintList(d, color) {
        let _c_int = colorsx.toInt(this.colors.wrap(color, 'progress'));
        let _csl = ColorStateList.valueOf(_c_int);
        d.getProgressBar().setProgressTintList(_csl);
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Color$[]|Dialogsx.Progress.Color} colors
     */
    setProgressTintLists(d, colors) {
        let _colors = colors;
        if (!Array.isArray(_colors)) {
            if (typeof _colors === 'string') {
                _colors = this.colors.progress[colors] || [_colors];
            } else if (typeof _colors === 'number') {
                _colors = [_colors];
            } else {
                throw Error('Unknown colors type for dialogsx.setProgressTintLists()');
            }
        }
        let [_ftl, _btl] = _colors;
        _ftl && this.setProgressTintList(d, _ftl);
        _btl && this.setProgressBackgroundTintList(d, _btl);
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Color$[]|Dialogsx.Progress.Color} colors
     */
    setProgressColorTheme(d, colors) {
        let _colors = colors;
        if (!Array.isArray(_colors)) {
            if (typeof _colors === 'string') {
                _colors = this.colors.progress[colors] || [_colors];
            } else if (typeof _colors === 'number') {
                _colors = [_colors];
            } else {
                throw Error('Unknown colors type for dialogsx.setProgressColorTheme()');
            }
        }
        let [_ftl, _btl, _abc] = _colors;
        _ftl && this.setProgressTintList(d, _ftl);
        _btl && this.setProgressBackgroundTintList(d, _btl);
        _abc && this.setActionButtonColor(d, 'positive', _abc);
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Color$} color
     */
    setProgressBackgroundTintList(d, color) {
        let _c_int = colorsx.toInt(color);
        let _csl = ColorStateList.valueOf(_c_int);
        d.getProgressBar().setProgressBackgroundTintList(_csl);
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {string} format
     * @param {*[]} [args]
     * @example
     * dialogsx.setProgressNumberFormat(diag, '%.1fKB/%.1fKB', [n, 100]);
     */
    setProgressNumberFormat(d, format, args) {
        ui.run(() => d.setProgressNumberFormat(java.lang.String.format(format, args)));
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     */
    clearProgressNumberFormat(d) {
        ui.run(() => d.setProgressNumberFormat(''));
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Dialogs.ActionButton} action
     */
    performClick(d, action) {
        let _act = String(action).toLowerCase();
        let _d_act = this.getDialogAction(_act);
        if (_d_act !== null) {
            d.getActionButton(_d_act).performClick();
        }
    },
    //// -=-= PENDING =-=- ////
    alerts(text, options) {
        let _opt = options || {};
        let _text = text || '';
        // let _dark_mode = _opt.is_dark_mode || false;
        // let _theme_color = _opt.is_dark_mode || 'green';
        let _text_color = _opt.text_color || '#E5FFFF';
        let _text_font_family = _opt.text_font_family || 'sans-serif-condensed';
        let _text_gravity = _opt.text_gravity || 'center';
        let _text_line_spacing = _opt.text_line_spacing || '5cx';
        let _text_size = _opt.text_size || 18;
        let _button_width = _opt.button_width || 100;
        let _button_text = _opt.button_text || 'OK';
        let _button_text_color = _opt.button_text_color || '#E5FFFF';
        let _button_text_size = _opt.button_text_size || 15;
        let _button_bg_tint_color = _opt.button_bg_tint_color || '#00251A';
        let _button_font_family = _opt.button_font_family || 'sans-serif';
        let _button_layout_gravity = _opt.button_layout_gravity || 'center';
        let _dialog_bg_color = _opt.dialog_bg_color || colorsx.hrgba('#005B4F91');
        let _dialog_dim_amount = _opt.dialog_dim_amount || 90;

        let _view = ui.inflate(<vertical>
            <x-text id="text" padding="1 5" margin="2 12"/>
            <x-button id="btn" marginBottom="4"/>
        </vertical>);

        _view['text'].attr('text', _text);
        _view['text'].attr('text_color', _text_color);
        _view['text'].attr('text_size', _text_size);
        _view['text'].attr('font_family', _text_font_family);
        _view['text'].attr('gravity', _text_gravity);
        _view['text'].attr('line_spacing', _text_line_spacing);

        _view['btn'].attr('width', _button_width);
        _view['btn'].attr('text', _button_text);
        _view['btn'].attr('text_size', _button_text_size);
        _view['btn'].attr('text_color', _button_text_color);
        _view['btn'].attr('layout_gravity', _button_layout_gravity);
        _view['btn'].attr('background_tint', _button_bg_tint_color);
        _view['btn'].attr('font_family', _button_font_family);

        _view['btn'].on('click', () => _diag.dismiss());

        let _diag = this.builds({
            customView: _view,
            canceledOnTouchOutside: false,
            background: _dialog_bg_color,
            animation: 'input_method',
            dim_amount: _dialog_dim_amount,
            keycode_back: d => d.dismiss(),
        }).show();
    },
};

/**
 * @type {Mod.dialogsx}
 */
module.exports = {dialogsx: exp};