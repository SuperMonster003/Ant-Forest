global.dialogsx = typeof global.dialogsx === 'object' ? global.dialogsx : {};

require('./ext-colors').load();

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Looper = android.os.Looper;
let Linkify = android.text.util.Linkify;
let KeyEvent = android.view.KeyEvent;
let ColorStateList = android.content.res.ColorStateList;
let ColorDrawable = android.graphics.drawable.ColorDrawable;
let DialogAction = com.afollestad.materialdialogs.DialogAction;
let MaterialDialog = com.afollestad.materialdialogs.MaterialDialog;

let ext = {
    _colors: {
        /**
         * @param {
         *     ColorParam|DialogsxColorTitle|DialogsxColorContent|
         *     DialogsxColorProgress|DialogsxColorButton
         * } color
         * @param {'title'|'content'|'progress'|'button'} type
         * @returns {string}
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
        /** @typedef {'default'|'caution'|'alert'} DialogsxColorTitle */
        title: {
            default: '#212121', // Auto.js 4.1.1 Alpha2
            caution: '#880e0e',
            warn: '#880e4f',
            alert: ['#c51162', '#ffeffe'],
        },
        /** @typedef {'default'|'warn'|'alert'} DialogsxColorContent */
        content: {
            default: '#757575', // Auto.js 4.1.1 Alpha2
            caution: '#ad1414',
            warn: '#ad1457',
            alert: ['#283593', '#e1f5fe'],
        },
        /**
         * @typedef {
         *     'alert'|'files'|'backup'|'restore'|'indeterminate'|
         *     'finish'|'success'|'error'|'failure'
         * } DialogsxColorProgress
         */
        progress: {
            /* [progress_tint, progress_bg_tint, action_button ] */
            download: ['#ff6f00', '#ffecb3', '#c43e00'],
            files: ['#f9a825', '#fff59d', '#c17900'],
            backup: ['#455a64', '#eceff1', '#1c313a'],
            restore: ['#ab47bc', '#f3e5f5', '#790e8b'],
            indeterminate: ['#00897b', '#b2dfdb', '#005b4f'],
            finish: ['#00c853', '#dcedc8', '#009624'],
            success: ['#00c853', '#dcedc8', '#009624'],
            error: ['#1565c0', '#bbdefb', '#003c8f'],
            failure: ['#1565c0', '#bbdefb', '#003c8f'],
        },
        /**
         * @typedef {
         *     'default_aj_4'|'default'|'caution'|'warn'|'attraction'|'hint'|
         *     'reset'|'unavailable'|'finish'|'success'|'error'|'failure'
         * } DialogsxColorButton
         */
        button: {
            default_aj_4: '#01a9f3', // Auto.js 4.1.1 Alpha2
            default: '#03a9f4', // override
            caution: '#ff3d00',
            warn: '#f57c00',
            attraction: '#7b1fa2',
            hint: '#0da798',
            reset: '#a1887f',
            unavailable: '#bdbdbd',
            finish: '#009624',
            success: '#009624',
            error: '#003c8f',
            failure: '#003c8f',
        },
    },
    _text: {
        /**
         * @description F: finish (zh-CN: 完成)
         * @description B: back (zh-CN: 返回)
         * @description Q: quit (zh-CN: 放弃)
         * @description X: exit (zh-CN: 退出)
         * @description I: interrupt (zh-CN: 终止)
         * @description K: ok (zh-CN: 确定)
         * @description S: sure (zh-CN: 确认)
         * @description C: close (zh-CN: 关闭)
         * @description D: delete (zh-CN: 删除)
         * @description N: continue (zh-CN: 继续)
         * @description M: sure to modify (zh-CN: 确认修改)
         * @description R: reset to default (zh-CN: 使用默认值)
         * @description T: show details (zh-CN: 了解更多)
         * @typedef {'F'|'B'|'Q'|'X'|'I'|'K'|'S'|'C'|'D'|'N'|'M'|'R'|'T'} DialogsxButtonText
         */
        _btn: {
            F: '完成', B: '返回', Q: '放弃', X: '退出',
            I: '终止', K: '确定', S: '确认',
            C: '关闭', D: '删除', N: '继续',
            M: '确认修改', R: '使用默认值', T: '了解更多',
        },
        no_more_prompt: '不再提示',
        user_interrupted: '用户终止',
    },
    _rtDialogs() {
        return this.isUiThread() ? runtime.dialogs : runtime.dialogs.nonUiDialogs;
    },
    /**
     * Substitution of dialog.build()
     * @returns {JsDialog$}
     */
    build(props) {
        let _dialogsx = this;
        let builder = Object.create(runtime.dialogs.newBuilder());
        builder.thread = threads.currentThread();

        Object.keys(props).forEach(n => applyDialogProperty(builder, n, props[n]));

        applyOtherDialogProperties(builder, props);

        return ui.run(builder.buildDialog.bind(builder));

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
                positive: {method: 'positiveText', adapter: _parseBtnText},
                positiveColor: {adapter: colorsx.toInt},
                neutral: {method: 'neutralText', adapter: _parseBtnText},
                neutralColor: {adapter: colorsx.toInt},
                negative: {method: 'negativeText', adapter: _parseBtnText},
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
                    throw new Error('Unknown itemsSelectMode ' + itemsSelectMode);
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
                // noinspection JSTypeOfValues
                if (typeof customView === 'xml' || typeof customView === 'string') {
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

        function _parseBtnText(text) {
            return _dialogsx._text._btn[text] || text;
        }
    },
    /** @typedef {string|*|[string, DialogsxColorTitle]} Builds$title */
    /** @typedef {string|*|[string, DialogsxColorContent]} Builds$content */
    /** @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$neutral */
    /** @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$negative */
    /** @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$positive */
    /** @typedef {number|boolean} Builds$keep */
    /** @typedef {number|boolean|string} Builds$checkbox */
    /** @typedef {
     *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive, Builds$keep, Builds$checkbox]|
     *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive, Builds$keep]|
     *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive]|
     *     [Builds$title, Builds$content, Builds$neutral, Builds$negative]|
     *     [Builds$title, Builds$content, Builds$neutral]|
     *     [Builds$title, Builds$content]|
     *     [Builds$title]|string
     * } Builds$Properties
     */
    /**
     * @typedef {DialogsBuildProperties | {
     *     disable_back?: boolean|function(JsDialog$),
     *     linkify?: Dialogsx$Linkify$Mask,
     *     background?: 'background_dark'|'background_light'|'black'|'darker_gray'|'holo_blue_bright'|'holo_blue_dark'|'holo_blue_light'|'holo_green_dark'|'holo_green_light'|'holo_orange_dark'|'holo_orange_light'|'holo_purple'|'holo_red_dark'|'holo_red_light'|'primary_text_dark'|'primary_text_dark_nodisable'|'primary_text_light'|'primary_text_light_nodisable'|'secondary_text_dark'|'secondary_text_dark_nodisable'|'secondary_text_light'|'secondary_text_light_nodisable'|'tab_indicator_text'|'tertiary_text_dark'|'tertiary_text_light'|'transparent'|'white'|'widget_edittext_dark'|'#RRGGBB'|'#AARRGGBB'|string|number,
     *     animation?: 'default'|'activity'|'dialog'|'input_method'|'toast'|'translucent'|string,
     *     dim_amount?: number,
     * } | {title: [], content: [], neutral: [], negative: [], positive: []}} Builds$Extensions
     */
    /**
     * @param {Builds$Properties|Builds$Extensions} props
     * @param {Builds$Extensions} [ext]
     * @returns {JsDialog$}
     */
    builds(props, ext) {
        if (Object.prototype.toString.call(props).slice(8, -1) === 'Object') {
            return this.builds('', props);
        }
        let [
            $tt, $cnt, $neu, $neg, $pos, $keep, $cbx,
        ] = typeof props === 'string' ? [props] : props;

        let _props = {
            autoDismiss: !$keep,
            canceledOnTouchOutside: !$keep,
            checkBoxPrompt: $cbx ? typeof $cbx === 'string'
                ? $cbx : this._text.no_more_prompt : undefined,
        };

        let _ext = ext || {};

        void [
            ['title', $tt, this._colors.title],
            ['content', $cnt, this._colors.content,
                require('./mod-treasury-vault').dialog_contents || {},
            ],
            ['neutral', $neu, this._colors.button, this._text._btn],
            ['negative', $neg, this._colors.button, this._text._btn],
            ['positive', $pos, this._colors.button, this._text._btn],
        ].map((arr) => {
            let [key, data] = arr;
            if (data === undefined && _ext[key] !== undefined) {
                log(arr[0], arr[1]);
                arr.splice(1, 1, _ext[key]);
                log(arr[0], arr[1]);
            }
            return arr;
        }).forEach(arr => _parseAndColorUp.apply(null, arr));

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
        if (_ext.disable_back) {
            this.disableBack(_diag, _ext.disable_back);
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
                if (_bg.match(/^#/)) {
                    _win.setBackgroundDrawable(new ColorDrawable(colorsx.toInt(_bg)));
                } else {
                    _win.setBackgroundDrawableResource(android.R.color[_bg]);
                }
            } else if (typeof _bg === 'number') {
                _win.setBackgroundDrawable(new ColorDrawable(_bg));
            }

            let _anm = _ext.animation;
            if (typeof _anm === 'string') {
                _anm = _anm.split('_').map((s) => {
                    return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
                }).join('');
                if (_anm === 'Default') {
                    _win.setWindowAnimations(android.R.style.Animation);
                } else {
                    _win.setWindowAnimations(android.R.style['Animation_' + _anm]);
                }
            }
        });

        return _diag;

        // tool function(s) //

        function _parseAndColorUp(key, data, color_lib, text_lib) {
            if (!_ext[key] || Array.isArray(_ext[key])) {
                let [_text, _color] = Array.isArray(data) ? data : [data];
                if (_text) {
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
     * @returns {Promise<void>|*}
     */
    rawInput(title, prefill, callback) {
        return this.isUiThread() && !callback ? new Promise((res) => {
            this._rtDialogs().rawInput(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : this._rtDialogs().rawInput(title, prefill || '', callback || null);
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {function} [callback]
     * @returns {Promise<*>|*}
     */
    input(title, prefill, callback) {
        if (callback) {
            return this.rawInput(title, prefill || '', str => callback(eval(str)));
        }
        if (this.isUiThread()) {
            return new Promise((res) => {
                this._rtDialogs().rawInput(title, prefill || '', s => res(eval(s)));
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
     * @returns {Promise<void>|*}
     */
    alert(title, prefill, callback) {
        return this.isUiThread() && !callback ? new Promise((res) => {
            this._rtDialogs().alert(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : this._rtDialogs().alert(title, prefill || '', callback || null);
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
            _titles[d].ori_text_color = _ori_color = _ori_view.getTextColors().getColors()[0];
        }
        if (!_ori_bg_color) {
            let _ori_view_bg_d = _ori_view.getBackground();
            _ori_bg_color = _ori_view_bg_d && _ori_view_bg_d.getColor() || -1;
            _titles[d].ori_bg_color = _ori_bg_color;
        }

        _setTitle(d, msg, this._colors.title.alert.map(colorsx.toInt));

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
     * @param {boolean|'append'} [is_append=false]
     * - whether original content is reserved or not
     */
    alertContent(d, msg, is_append) {
        let _ori_view = d.getContentView();
        let _ori_text = _ori_view.getText().toString();
        let _is_append = is_append === 'append' || is_append === true;
        let [_c_text, _c_bg] = this._colors.content.alert.map(colorsx.toInt);

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
     * @returns {Promise<*>|*}
     */
    prompt(title, prefill, callback) {
        return this.rawInput(title, prefill, callback);
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {function} [callback]
     * @returns {Promise<void>|*}
     */
    confirm(title, prefill, callback) {
        return this.isUiThread() && !callback ? new Promise((res) => {
            this._rtDialogs().confirm(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : this._rtDialogs().confirm(title, prefill || '', callback || null);
    },
    /**
     * @param {string} title
     * @param {string[]|string} items
     * @param {function} [callback]
     * @returns {Promise<void>|*}
     */
    select(title, items, callback) {
        if (items instanceof Array) {
            return this.isUiThread() && !callback ? new Promise((res) => {
                this._rtDialogs().select(title, items, function () {
                    res.apply(null, [].slice.call(arguments));
                });
            }) : this._rtDialogs().select(title, items, callback || null);
        }
        return this._rtDialogs().select(title, [].slice.call(arguments, 1), null);
    },
    /**
     * @param {string} title
     * @param {string[]} items
     * @param {number} [index=0]
     * @param {function} [callback]
     * @returns {Promise<void>|*}
     */
    singleChoice(title, items, index, callback) {
        return this.isUiThread() && !callback ? new Promise((res) => {
            this._rtDialogs().singleChoice(title, index || 0, items, function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : this._rtDialogs().singleChoice(title, index || 0, items, callback || null);
    },
    /**
     * @param {string} title
     * @param {string[]} items
     * @param {number[]} [indices]
     * @param {function} [callback]
     * @returns {Promise<void>|*[]}
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
            ? arr(this._rtDialogs().multiChoice(title, indices || [], items, r => callback(arr(r))))
            : this.isUiThread()
                ? new Promise((res) => {
                    this._rtDialogs().multiChoice(title, indices || [], items, r => res(arr(r)));
                })
                : arr(this._rtDialogs().multiChoice(title, indices || [], items, null));
    },
    /**
     * @param {...JsDialog$|JsDialog$[]|MaterialDialog$|MaterialDialog$[]} [d]
     */
    dismiss(d) {
        (Array.isArray(d) ? d : [].slice.call(arguments)).forEach((o) => {
            typeof o === 'object' && o.dismiss && o.dismiss();
        });
    },
    /**
     * @template {JsDialog$|MaterialDialog$} DIALOG
     * @param {DIALOG} d
     * @param {function(DIALOG)|*} [f]
     * @returns {DIALOG}
     */
    disableBack(d, f) {
        // to prevent dialog from being dismissed
        // by pressing 'back' button (usually by accident)
        d.setOnKeyListener({
            onKey(diag, key_code) {
                typeof f === 'function' && f(d);
                return key_code === KeyEvent.KEYCODE_BACK;
            },
        });
        return d;
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @returns {string}
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
     * @param {ColorParam|DialogsxColorTitle} color
     */
    setTitleTextColor(d, color) {
        ui.run(() => {
            d && d.getTitleView().setTextColor(colorsx.toInt(this._colors.wrap(color, 'title')));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {ColorParam|DialogsxColorTitle} color
     */
    setTitleBackgroundColor(d, color) {
        ui.run(() => {
            d && d.getTitleView().setBackgroundColor(colorsx.toInt(this._colors.wrap(color, 'title')));
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
     * @param {ColorParam|DialogsxColorContent} color
     */
    setContentTextColor(d, color) {
        ui.run(() => {
            d && d.getContentView().setTextColor(colorsx.toInt(this._colors.wrap(color, 'content')));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {ColorParam|DialogsxColorContent} color
     */
    setContentBackgroundColor(d, color) {
        ui.run(() => {
            d && d.getContentView().setBackgroundColor(colorsx.toInt(this._colors.wrap(color, 'content')));
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
     * @param {ColorParam} color
     */
    setInputTextColor(d, color) {
        ui.run(() => {
            d && d.getInputEditText().setTextColor(colorsx.toInt(color));
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {ColorParam} color
     */
    setInputBackgroundColor(d, color) {
        ui.run(() => {
            d && d.getInputEditText().setBackgroundColor(colorsx.toInt(color));
        });
    },
    /**
     * @typedef {'ALL'|'EMAIL_ADDRESSES'|'MAP_ADDRESSES'|'PHONE_NUMBERS'|'WEB_URLS'} Dialogsx$Linkify$Mask
     */
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {Dialogsx$Linkify$Mask} [mask='ALL']
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
     * @returns {com.afollestad.materialdialogs.DialogAction|null}
     */
    getDialogAction(action) {
        try {
            switch (action) {
                case 'positive':
                    return DialogAction.POSITIVE;
                case 'negative':
                    return DialogAction.NEGATIVE;
                case 'neutral':
                    return DialogAction.NEUTRAL;
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
     * @returns {string}
     */
    getActionButton(d, action) {
        return d instanceof MaterialDialog
            ? d.getActionButton(this.getDialogAction(action)).getText().toString()
            : d.getActionButton(action);
    },
    /**
     * Compatible for MaterialDialog.setActionButton()
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'positive'|'negative'|'neutral'|('positive'|'negative'|'neutral')[]} action
     * @param {ColorParam|DialogsxColorButton} [color]
     * @param {string|null} title
     */
    setActionButton(d, action, title, color) {
        let _set = function (action) {
            d instanceof MaterialDialog
                ? ui.run(() => {
                    d.setActionButton(this.getDialogAction(action), title);
                    color && this.setActionButtonColor(d, action, color);
                })
                : ui.run(() => {
                    d.setActionButton(action, title);
                    color && this.setActionButtonColor(d, action, color);
                });
        }.bind(this);

        Array.isArray(action) ? action.forEach(_set) : _set(action);
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'positive'|'negative'|'neutral'} action
     * @param {ColorParam|DialogsxColorButton} color
     */
    setActionButtonColor(d, action, color) {
        let _action = this.getDialogAction(action.toLowerCase());
        if (_action !== null) {
            let _c_int = colorsx.toInt(this._colors.wrap(color, 'button'));
            d.getActionButton(_action).setTextColor(_c_int);
        }
    },
    /**
     * @param {Builds$Properties} props
     * @param {Builds$Extensions & {
     *     timeout?: number,
     *     timeout_button?: DialogActionButton,
     *     onNeutral?: function(d:BuildCountdownExtendedJsDialog),
     *     onNegative?: function(d:BuildCountdownExtendedJsDialog),
     *     onPositive?: function(d:BuildCountdownExtendedJsDialog),
     *     onTimeout?: function(d:BuildCountdownExtendedJsDialog):DialogActionButton|DialogActionButton,
     *     onPause?: function(d:BuildCountdownExtendedJsDialog)|{
     *         title?: string|[RegExp|string,string],
     *         content?: string|[RegExp|string,string],
     *         neutral?: string|[RegExp|string,string],
     *         negative?: string|[RegExp|string,string],
     *         positive?: string|[RegExp|string,string],
     *         action?: function(d:BuildCountdownExtendedJsDialog),
     *     },
     * }} extensions
     * @returns {BuildCountdownExtendedJsDialog}
     */
    buildCountdown(props, extensions) {
        let _ext = Object.assign({
            disable_back: () => _act.pause(100),
        }, extensions);

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
                                return ext.getTitleText(d);
                            },
                            set(d, k, v) {
                                ext.setTitleText(d, v);
                            },
                        }, {
                            key: 'content',
                            get(d) {
                                return ext.getContentText(d);
                            },
                            set(d, k, v) {
                                ext.setContentText(d, v);
                            },
                        }, {
                            key: 'neutral',
                            get(d, k) {
                                return ext.getActionButton(d, k);
                            },
                            set(d, k, v) {
                                ext.setActionButton(d, k, v);
                            },
                        }, {
                            key: 'negative',
                            get(d, k) {
                                return ext.getActionButton(d, k);
                            },
                            set(d, k, v) {
                                ext.setActionButton(d, k, v);
                            },
                        }, {
                            key: 'positive',
                            get(d, k) {
                                return ext.getActionButton(d, k);
                            },
                            set(d, k, v) {
                                ext.setActionButton(d, k, v);
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
            /** @param {BuildCountdownExtendedBlockOptions} [o] */
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

        let _diag = Object.create(ext.builds(props, _ext)
            .on('neutral', () => _act.neutral())
            .on('negative', () => _act.negative())
            .on('positive', () => _act.positive()));

        /**
         * @typedef {{
         *     timeout?: number,
         *     onStart?: function(d:BuildCountdownExtendedJsDialog),
         *     onTimeout?: function(d:BuildCountdownExtendedJsDialog),
         *     onUnblock?: function(d:BuildCountdownExtendedJsDialog),
         * }} BuildCountdownExtendedBlockOptions
         */
        /**
         * @typedef {{
         *     act: function(): BuildCountdownExtendedJsDialog,
         *     block: function(o:BuildCountdownExtendedBlockOptions): BuildCountdownExtendedJsDialog,
         * }} BuildCountdownExtended
         */
        /** @typedef {JsDialog$ | BuildCountdownExtended} BuildCountdownExtendedJsDialog */
        let _diag_ext = {
            act() {
                _diag.isShowing() || _diag.show();
                return _diag_mixed;
            },
            /**
             * @param {BuildCountdownExtendedBlockOptions} [o]
             * @returns {BuildCountdownExtendedJsDialog}
             */
            block(o) {
                _act.block(o);
                return _diag_mixed;
            },
        };

        let _diag_mixed = Object.assign(_diag, _diag_ext);

        let _thd_et = threads.start(function () {
            let _cont = ext.getContentText(_diag);
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
     * @param {DialogsxButtonText} [config.on_interrupt_btn_text='B']
     * @param {boolean} [config.show_min_max]
     * @param {{
     *     desc: string,
     *     action: function(value:*,d:BuildFlowExtendedJsDialog),
     *     onSuccess?: function(value:*),
     *     onFailure?: function(reason:*),
     * }[]} config.steps
     * @param {string} [config.success_title]
     * @param {string} [config.success_content]
     * @param {function(value:*,d:BuildFlowExtendedJsDialog):*} [config.onStart]
     * @param {function(value:*,d:BuildFlowExtendedJsDialog):*} [config.onSuccess]
     * @param {function(err:*,d:BuildFlowExtendedJsDialog):*} [config.onFailure]
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
     * @returns {BuildFlowExtendedJsDialog}
     */
    buildFlow(config) {
        let _dialogsx = this;

        let _diag = Object.create(_dialogsx.builds([
            config.title || '', config.steps.map((step, i) => (
                '\u3000 ' + ++i + '. ' + step.desc
            )).join('\n'), 0, 0, 'I', 1], {
            progress: {max: 100, showMinMax: !!config.show_min_max},
        }));

        /**
         * @typedef {{
         *     act:function():BuildFlowExtendedJsDialog,
         *     setStepDesc:function(step_num:number,desc:string,is_append:boolean=false):BuildFlowExtendedJsDialog,
         *     setProgressData:function({processed:number,total:number}):BuildFlowExtendedJsDialog,
         *     setFailureData:function(error:string|Error):BuildFlowExtendedJsDialog,
         * }} BuildFlowExtended
         */
        /** @typedef {JsDialog$ | BuildFlowExtended} BuildFlowExtendedJsDialog */
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
                            throw Error(_dialogsx._text.user_interrupted);
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
                        throw Error(_dialogsx._text.user_interrupted);
                    }
                    _dialogsx.setProgressColorTheme(_diag, 'finish');

                    _setStepsFinished('all');

                    _diag.removeAllListeners('positive');
                    _diag.setActionButton('positive', _dialogsx._text._btn.F);
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
                    _dialogsx.setProgressColorTheme(_diag, 'error');

                    _diag.removeAllListeners('positive');

                    let _btn_el = _dialogsx._text._btn[config.on_interrupt_btn_text || 'B'];
                    _diag.setActionButton('positive', _btn_el);

                    _diag.on('positive', d => d.dismiss());

                    _dialogsx.alertContent(_diag, err, 'append');

                    delete global._$_dialog_flow_interrupted;

                    if (typeof config.onFailure === 'function') {
                        config.onFailure(err, _diag);
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
            setFailureData(error) {
                _diag.setActionButton('positive', _dialogsx._text._btn.B);
                _diag.removeAllListeners('positive');
                _diag.on('positive', d => d.dismiss());
                _dialogsx.alertContent(_diag, error, 'append');
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
     * @param {DialogsxButtonText} [config.on_interrupt_btn_text='B']
     * @param {boolean} [config.show_min_max]
     * @param {*} [config.initial_value]
     * @param {string} [config.success_title]
     * @param {string} [config.success_content]
     * @param {function(value:*,d:BuildProgressExtendedJsDialog):*} [config.onStart]
     * @param {function(value:*,d:BuildProgressExtendedJsDialog):*} config.action
     * @param {function(value:*,d:BuildProgressExtendedJsDialog):*} [config.onSuccess]
     * @param {function(err:*,d:BuildProgressExtendedJsDialog):*} [config.onFailure]
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
     * @returns {BuildProgressExtendedJsDialog}
     */
    buildProgress(config) {
        let _dialogsx = this;
        let _diag = Object.create(_dialogsx.builds([
            config.title || '', config.content || config.desc || '', 0, 0, 'I', 1,
        ], {progress: {max: 100, showMinMax: !!config.show_min_max}}));

        /**
         * @typedef {{
         *     act:function():BuildProgressExtendedJsDialog,
         *     setStepDesc:function(desc:string,is_append:boolean=false):BuildProgressExtendedJsDialog,
         *     setProgressData:function({processed:number,total:number}):BuildProgressExtendedJsDialog,
         *     setFailureData:function(error:string|Error):BuildProgressExtendedJsDialog,
         * }} BuildProgressExtended
         */
        /** @typedef {JsDialog$ | BuildProgressExtended} BuildProgressExtendedJsDialog */
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
                            throw Error(_dialogsx._text.user_interrupted);
                        }
                        return config.action(value, _diag);
                    })
                    .then((res) => {
                        if (global._$_dialog_flow_interrupted) {
                            throw Error(_dialogsx._text.user_interrupted);
                        }
                        _dialogsx.setProgressColorTheme(_diag, 'finish');

                        _diag.setProgress(100);
                        _diag.removeAllListeners('positive');
                        _diag.setActionButton('positive', _dialogsx._text._btn.F);
                        _diag.on('positive', d => d.dismiss());

                        let _title = config.success_title;
                        _title && _dialogsx.setTitleText(_diag, _title);

                        let _cont = config.success_content;
                        _cont && _dialogsx.appendContentText(_diag, '\n\n' + _cont);

                        delete global._$_dialog_flow_interrupted;

                        if (typeof config.onSuccess === 'function') {
                            config.onSuccess(res, _diag);
                        }
                    })
                    .catch((err) => {
                        _dialogsx.setProgressColorTheme(_diag, 'error');
                        _diag.removeAllListeners('positive');

                        let _btn_el = _dialogsx._text._btn[config.on_interrupt_btn_text || 'B'];
                        _diag.setActionButton('positive', _btn_el);

                        _diag.on('positive', d => d.dismiss());

                        _dialogsx.alertContent(_diag, err, 'append');

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
            setFailureData(error) {
                _diag.setActionButton('positive', _dialogsx._text._btn.B);
                _diag.on('positive', d => d.dismiss());
                _dialogsx.alertContent(_diag, error, 'append');
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
     * @param {ColorParam|DialogsxColorProgress} color
     */
    setProgressTintList(d, color) {
        let _c_int = colorsx.toInt(this._colors.wrap(color, 'progress'));
        let _csl = ColorStateList.valueOf(_c_int);
        d.getProgressBar().setProgressTintList(_csl);
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {ColorParam|ColorParam[]|DialogsxColorProgress} colors
     */
    setProgressTintLists(d, colors) {
        let _colors = colors;
        if (!Array.isArray(_colors)) {
            if (typeof _colors === 'string') {
                _colors = this._colors.progress[colors] || [_colors];
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
     * @param {ColorParam|ColorParam[]|DialogsxColorProgress} colors
     */
    setProgressColorTheme(d, colors) {
        let _colors = colors;
        if (!Array.isArray(_colors)) {
            if (typeof _colors === 'string') {
                _colors = this._colors.progress[colors] || [_colors];
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
     * @param {ColorParam} color
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
     * Same as uix.isUiThread() but not as uix.isUiMode()
     * @returns {boolean}
     * @see uix.isUiThread
     */
    isUiThread() {
        return Looper.myLooper() === Looper.getMainLooper();
    },
};

module.exports = ext;
module.exports.load = () => global.dialogsx = ext;