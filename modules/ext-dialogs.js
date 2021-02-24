// given that there are bugs with dialogs modules
// in auto.js versions like 4.1.0 Alpha5 and 4.1.1 Alpha2

// in another way, extended functions like
// dialogsx.builds() and dialogsx.getContentText()
// could make things easier to some extent

global.dialogsx = typeof global.dialogsx === 'object' ? global.dialogsx : {};

require('./ext-colors').load();

let isUiThread = () => android.os.Looper.myLooper() === android.os.Looper.getMainLooper();
let rtDialogs = () => isUiThread() ? runtime.dialogs : runtime.dialogs.nonUiDialogs;

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
            caution: '#880e4f',
            alert: ['#c51162', '#ffeffe'],
        },
        /** @typedef {'default'|'warn'|'alert'} DialogsxColorContent */
        content: {
            default: '#757575', // Auto.js 4.1.1 Alpha2
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
         * @description F: finish
         * @description B: back
         * @description Q: quit
         * @description X: exit
         * @description I: interrupt
         * @description K: ok
         * @description S: sure
         * @description C: close
         * @description D: delete
         * @description N: continue
         * @description M: sure to modify
         * @description R: reset to default
         * @typedef {'F'|'B'|'Q'|'X'|'I'|'K'|'S'|'C'|'D'|'N'|'M'|'R'} DialogsxButtonText
         */
        _btn: {
            F: '完成', B: '返回', Q: '放弃', X: '退出',
            I: '终止', K: '确定', S: '确认',
            C: '关闭', D: '删除', N: '继续',
            M: '确认修改', R: '设为默认值',
        },
        no_more_prompt: '不再提示',
        user_interrupted: '用户终止',
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
                builder.input(
                    wrapNonNullString(properties.inputHint),
                    wrapNonNullString(properties.inputPrefill),
                    function (d, input) {
                        return builder.emit('input_change', builder.dialog, input.toString());
                    }
                ).alwaysCallInputCallback();
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
    /**
     * @typedef {string|[string, DialogsxColorTitle]} Builds$title
     * @typedef {string|[string, DialogsxColorContent]} Builds$content
     * @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$neutral
     * @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$negative
     * @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$positive
     * @typedef {number|boolean} Builds$keep
     * @typedef {number|boolean|string} Builds$checkbox
     */
    /**
     * @param {
     *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive, Builds$keep, Builds$checkbox]|
     *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive, Builds$keep]|
     *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive]|
     *     [Builds$title, Builds$content, Builds$neutral, Builds$negative]|
     *     [Builds$title, Builds$content, Builds$neutral]|
     *     [Builds$title, Builds$content]|
     *     [Builds$title]|string
     * } props
     * @param {DialogsBuildProperties} [ext]
     * @returns {JsDialog$}
     */
    builds(props, ext) {
        let [
            $tt, $cnt, $neu, $neg, $pos, $keep, $cbx,
        ] = typeof props === 'string' ? [props] : props;

        let _props = {
            autoDismiss: !$keep,
            canceledOnTouchOutside: !$keep,
            checkBoxPrompt: $cbx ? typeof $cbx === 'string'
                ? $cbx : this._text.no_more_prompt : undefined,
        };

        void [
            ['title', $tt, this._colors.title],
            ['content', $cnt, this._colors.content,
                require('./mod-treasury-vault').dialog_contents || {},
            ],
            ['neutral', $neu, this._colors.button, this._text._btn],
            ['negative', $neg, this._colors.button, this._text._btn],
            ['positive', $pos, this._colors.button, this._text._btn],
        ].forEach(arr => _parseAndColorUp.apply(null, arr));

        return this.build(Object.assign(_props, ext));

        // tool function(s) //

        function _parseAndColorUp(key, data, color_lib, text_lib) {
            let [_text, _color] = Array.isArray(data) ? data : [data];
            if (_text) {
                _props[key] = text_lib && text_lib[_text] || _text;
            }
            _props[key + 'Color'] = color_lib[_color] || _color || color_lib.default;
        }
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {*} [callback]
     * @returns {Promise<unknown>|*}
     */
    rawInput(title, prefill, callback) {
        return isUiThread() && !callback ? new Promise((res) => {
            rtDialogs().rawInput(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : rtDialogs().rawInput(title, prefill || '', callback || null);
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {*} [callback]
     * @returns {Promise<unknown>|*}
     */
    input(title, prefill, callback) {
        if (callback) {
            return this.rawInput(title, prefill || '', str => callback(eval(str)));
        }
        if (isUiThread()) {
            return new Promise(res => rtDialogs().rawInput(title, prefill || '', s => res(eval(s))));
        }
        let input = this.rawInput(title, prefill || '', callback || null);
        if (typeof input === 'string') {
            return eval(input);
        }
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {*} [callback]
     * @returns {Promise<unknown>|*}
     */
    alert(title, prefill, callback) {
        return isUiThread() && !callback ? new Promise((res) => {
            rtDialogs().alert(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : rtDialogs().alert(title, prefill || '', callback || null);
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
            _titles[d].ori_text_color = _ori_color = _ori_view.getTextColors().colors[0];
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
     * @param msg {string} - message shown in content view
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
     * @param {*} [callback]
     * @returns {Promise<unknown>|*}
     */
    prompt(title, prefill, callback) {
        return this.rawInput(title, prefill, callback);
    },
    /**
     * @param {string} title
     * @param {string} [prefill]
     * @param {*} [callback]
     * @returns {Promise<unknown>|*}
     */
    confirm(title, prefill, callback) {
        return isUiThread() && !callback ? new Promise((res) => {
            rtDialogs().confirm(title, prefill || '', function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : rtDialogs().confirm(title, prefill || '', callback || null);
    },
    /**
     * @param {string} title
     * @param {string[]|string} items
     * @param {*|string} [callback]
     * @returns {Promise<unknown>|*}
     */
    select(title, items, callback) {
        if (items instanceof Array) {
            return isUiThread() && !callback ? new Promise((res) => {
                rtDialogs().select(title, items, function () {
                    res.apply(null, [].slice.call(arguments));
                });
            }) : rtDialogs().select(title, items, callback || null);
        }
        return rtDialogs().select(title, [].slice.call(arguments, 1), null);
    },
    /**
     * @param {string} title
     * @param {string[]} items
     * @param {number} [index=0]
     * @param {*} [callback]
     * @returns {Promise<unknown>|*}
     */
    singleChoice(title, items, index, callback) {
        return isUiThread() && !callback ? new Promise((res) => {
            rtDialogs().singleChoice(title, index || 0, items, function () {
                res.apply(null, [].slice.call(arguments));
            });
        }) : rtDialogs().singleChoice(title, index || 0, items, callback || null);
    },
    /**
     * @param {string} title
     * @param {string[]} items
     * @param {number[]} [indices]
     * @param {*} [callback]
     * @returns {Promise<unknown>|*[]}
     */
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
    /**
     * @param {...(JsDialog$|MaterialDialog$)} [d]
     */
    dismiss(d) {
        (Array.isArray(d) ? d : [].slice.call(arguments)).forEach((o) => {
            typeof o === 'object' && o.dismiss && o.dismiss();
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {function} [f]
     * @returns {JsDialog$|MaterialDialog$}
     */
    disableBack(d, f) {
        // to prevent dialog from being dismissed
        // by pressing 'back' button (usually by accident)
        d.setOnKeyListener({
            onKey(diag, key_code) {
                typeof f === 'function' && f();
                return key_code === android.view.KeyEvent.KEYCODE_BACK;
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
            d && d.getTitleView().setTextColor(
                colorsx.toInt(this._colors.wrap(color, 'title'))
            );
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {ColorParam|DialogsxColorTitle} color
     */
    setTitleBackgroundColor(d, color) {
        ui.run(() => {
            d && d.getTitleView().setBackgroundColor(
                colorsx.toInt(this._colors.wrap(color, 'title'))
            );
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
            d && d.getContentView().setText(
                this.getContentText(d) + (str ? str.toString() : '')
            );
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {ColorParam|DialogsxColorContent} color
     */
    setContentTextColor(d, color) {
        ui.run(() => {
            d && d.getContentView().setTextColor(
                colorsx.toInt(this._colors.wrap(color, 'content'))
            );
        });
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {ColorParam|DialogsxColorContent} color
     */
    setContentBackgroundColor(d, color) {
        ui.run(() => {
            d && d.getContentView().setBackgroundColor(
                colorsx.toInt(this._colors.wrap(color, 'content'))
            );
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
     * @param {string|{toString:function():string}} [str='']
     */
    setInputText(d, str) {
        ui.run(() => {
            d && d.getInputEditText().setText(str ? str.toString() : '');
        });
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
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'ALL'|'EMAIL_ADDRESSES'|'MAP_ADDRESSES'|'PHONE_NUMBERS'|'WEB_URLS'} [mask='ALL']
     */
    linkify(d, mask) {
        if (d) {
            let _cnt_vw = d.getContentView();
            ui.run(() => {
                let _cnt_text = _cnt_vw.getText().toString();
                _cnt_vw.setAutoLinkMask(android.text.util.Linkify[mask || 'ALL']);
                _cnt_vw.setText(_cnt_text);
            });
        }
    },
    /**
     * @param {'positive'|'negative'|'neutral'} action
     * @returns {com.afollestad.materialdialogs.DialogAction}
     */
    getDialogAction(action) {
        switch (action) {
            case 'positive':
                return com.afollestad.materialdialogs.DialogAction.POSITIVE;
            case 'negative':
                return com.afollestad.materialdialogs.DialogAction.NEGATIVE;
            case 'neutral':
                return com.afollestad.materialdialogs.DialogAction.NEUTRAL;
            default:
                throw TypeError('unknown action of dialogsx.getDialogAction');
        }
    },
    /**
     * Compatible for MaterialDialog.getActionButton()
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'positive'|'negative'|'neutral'} action
     * @returns {string}
     */
    getActionButton(d, action) {
        if (d instanceof com.stardust.autojs.core.ui.dialog.JsDialog) {
            return d.getActionButton(action);
        }
        if (d instanceof com.afollestad.materialdialogs.MaterialDialog) {
            return d.getActionButton(this.getDialogAction(action)).getText().toString();
        }
        throw TypeError('Unknown d of dialogsx.getActionButton');
    },
    /**
     * Compatible for MaterialDialog.setActionButton()
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'positive'|'negative'|'neutral'} action
     * @param {ColorParam|DialogsxColorButton} [color]
     * @param {string|null} title
     */
    setActionButton(d, action, title, color) {
        if (d instanceof com.stardust.autojs.core.ui.dialog.JsDialog) {
            return ui.run(() => {
                d.setActionButton(action, title);
                color && this.setActionButtonColor(d, action, color);
            });
        }
        if (d instanceof com.afollestad.materialdialogs.MaterialDialog) {
            return ui.run(() => {
                d.setActionButton(this.getDialogAction(action), title);
                color && this.setActionButtonColor(d, action, color);
            });
        }
        throw TypeError('Unknown d of dialogsx.setActionButton');
    },
    /**
     * @param {JsDialog$|MaterialDialog$} d
     * @param {'positive'|'negative'|'neutral'} action
     * @param {ColorParam|DialogsxColorButton} color
     */
    setActionButtonColor(d, action, color) {
        let _action = com.afollestad.materialdialogs.DialogAction[action.toUpperCase()];
        let _csl = android.content.res.ColorStateList.valueOf(
            colorsx.toInt(this._colors.wrap(color, 'button'))
        );
        d.getActionButton(_action).setTextColor(_csl);
    },
    /**
     * Build a dialog with flow steps
     * @param {{}} [config]
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
     *             return new Promise(resolve => {
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

        return Object.create(this.builds([
                config.title || '', config.steps.map((step, i) => (
                    '\u3000 ' + ++i + '. ' + step.desc
                )).join('\n'), 0, 0, 'I', 1], {
                progress: {max: 100, showMinMax: !!config.show_min_max},
            }),
            /**
             * @typedef {{
             *     act:function():BuildFlowExtendedJsDialog,
             *     setStepDesc:function(step_num:string|number,desc:string,is_append:boolean=false):BuildFlowExtendedJsDialog,
             *     setProgressData:function({processed:number,total:number}):BuildFlowExtendedJsDialog,
             *     setFailureData:function(error:string|Error):BuildFlowExtendedJsDialog,
             * }} BuildFlowExtended
             */
            /** @typedef {JsDialog$ & BuildFlowExtended} BuildFlowExtendedJsDialog */
            {
                act: {
                    value() {
                        let _promise = new Promise((resolve) => {
                            this.on('positive', () => {
                                global._$_dialog_flow_interrupted = true;
                            });
                            if (typeof config.onStart === 'function') {
                                config.onStart(config.initial_value, this);
                            }
                            resolve(config.initial_value);
                        });

                        config.steps.forEach((step, idx) => {
                            _promise = _promise.then((value) => {
                                if (global._$_dialog_flow_interrupted) {
                                    throw Error(_dialogsx._text.user_interrupted);
                                }
                                let _fin = (result) => {
                                    this.setProgress(100);
                                    _setStepsFinished.call(this, idx + 1);
                                    step.onSuccess && step.onSuccess(value);
                                    return result;
                                };
                                this.setProgress(0);
                                _setStepOnProgress.call(this, idx + 1);
                                let _result = step.action(value, this);
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
                            _dialogsx.setProgressColorTheme(this, 'finish');

                            _setStepsFinished.call(this, 'all');

                            this.removeAllListeners('positive');
                            this.setActionButton('positive', _dialogsx._text._btn.F);
                            this.on('positive', d => d.dismiss());

                            let _title = config.success_title;
                            _title && _dialogsx.setTitleText(this, _title);

                            let _cont = config.success_content;
                            _cont && _dialogsx.appendContentText(this, '\n\n' + _cont);

                            delete global._$_dialog_flow_interrupted;

                            if (typeof config.onSuccess === 'function') {
                                config.onSuccess(res, this);
                            }
                        });

                        _promise.catch((err) => {
                            _dialogsx.setProgressColorTheme(this, 'error');

                            this.removeAllListeners('positive');
                            this.setActionButton('positive', _dialogsx
                                ._text._btn[config.on_interrupt_btn_text || 'B']
                            );
                            this.on('positive', d => d.dismiss());

                            _dialogsx.alertContent(this, err, 'append');

                            delete global._$_dialog_flow_interrupted;

                            if (typeof config.onFailure === 'function') {
                                config.onFailure(err, this);
                            }
                        });

                        this.isShowing() || this.show();

                        return this;
                    },
                    enumerable: true,
                },
                setStepDesc: {
                    value(step_num, desc, is_append) {
                        if (step_num < 1) {
                            throw Error('step_num is less than 1');
                        }
                        if (step_num >= config.steps.length) {
                            throw Error('step_num must be less than steps length');
                        }
                        let _step_num = step_num.toString();
                        let _view = this.getContentView();
                        let _content = _view.getText().toString();
                        let _aim_str = config.steps[_step_num - 1].desc;
                        if (_content.match(_aim_str)) {
                            let _text = (is_append ? _aim_str : '') + (desc || '');
                            _view.setText(_content.replace(_aim_str, _text));
                        }
                        return this;
                    },
                    enumerable: true,
                },
                setProgressData: {
                    value(data) {
                        if (typeof data === 'object') {
                            let _num = data.processed / data.total * 100 || 0;
                            this.setProgress(Math.min(Math.max(0, _num), 100));
                        }
                        return this;
                    },
                    enumerable: true,
                },
                setFailureData: {
                    value(error) {
                        this.setActionButton('positive', _dialogsx._text._btn.B);
                        this.removeAllListeners('positive');
                        this.on('positive', d => d.dismiss());
                        _dialogsx.alertContent(this, error, 'append');
                        return this;
                    },
                    enumerable: true,
                },
            });

        // tool function(s) //

        function _setStepsFinished(ctr) {
            let _ctr = ctr === 'all' || !ctr ? Infinity : ctr;
            let _cont = _dialogsx.getContentText(this);
            let _rex = /^(. )(\d)(?=\.)/gm;
            _dialogsx.setContentText(this, _cont.replace(_rex, ($0, $1, $2) => (
                ($2 <= _ctr ? '\u2714 ' : $1) + $2
            )));
        }

        function _setStepOnProgress(num) {
            let _num = num.toString();
            let _cont = _dialogsx.getContentText(this);
            let _rex = /^(. )(\d)(?=\.)/gm;
            _dialogsx.setContentText(this, _cont.replace(_rex, ($0, $1, $2) => (
                ($2 === _num ? '\u25b6 ' : $1) + $2
            )));
        }
    },
    /**
     * Build a dialog with progress view
     * @param {{}} [config]
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
        return Object.create(this.builds([
                config.title || '', config.content || config.desc || '', 0, 0, 'I', 1,
            ], {progress: {max: 100, showMinMax: !!config.show_min_max}}),
            /**
             * @typedef {{
             *     act:function():BuildProgressExtendedJsDialog,
             *     setStepDesc:function(desc:string,is_append:boolean=false):BuildProgressExtendedJsDialog,
             *     setProgressData:function({processed:number,total:number}):BuildProgressExtendedJsDialog,
             *     setFailureData:function(error:string|Error):BuildProgressExtendedJsDialog,
             * }} BuildProgressExtended
             */
            /** @typedef {JsDialog$ & BuildProgressExtended} BuildProgressExtendedJsDialog */
            {
                act: {
                    value() {
                        Promise.resolve(config.initial_value)
                            .then((value) => {
                                if (typeof config.onStart === 'function') {
                                    config.onStart(config.initial_value, this);
                                }
                                return value;
                            })
                            .then((value) => {
                                this.on('positive', () => {
                                    global._$_dialog_flow_interrupted = true;
                                });
                                if (global._$_dialog_flow_interrupted) {
                                    throw Error(_dialogsx._text.user_interrupted);
                                }
                                return config.action(value, this);
                            })
                            .then((res) => {
                                if (global._$_dialog_flow_interrupted) {
                                    throw Error(_dialogsx._text.user_interrupted);
                                }
                                _dialogsx.setProgressColorTheme(this, 'finish');

                                this.setProgress(100);
                                this.removeAllListeners('positive');
                                this.setActionButton('positive', _dialogsx._text._btn.F);
                                this.on('positive', d => d.dismiss());

                                let _title = config.success_title;
                                _title && _dialogsx.setTitleText(this, _title);

                                let _cont = config.success_content;
                                _cont && _dialogsx.appendContentText(this, '\n\n' + _cont);

                                delete global._$_dialog_flow_interrupted;

                                if (typeof config.onSuccess === 'function') {
                                    config.onSuccess(res, this);
                                }
                            })
                            .catch((err) => {
                                _dialogsx.setProgressColorTheme(this, 'error');
                                this.removeAllListeners('positive');
                                this.setActionButton('positive', _dialogsx
                                    ._text._btn[config.on_interrupt_btn_text || 'B']
                                );
                                this.on('positive', d => d.dismiss());

                                _dialogsx.alertContent(this, err, 'append');

                                delete global._$_dialog_flow_interrupted;

                                if (typeof config.onFailure === 'function') {
                                    config.onFailure(err, this);
                                }
                            });

                        this.isShowing() || this.show();

                        return this;
                    },
                    enumerable: true,
                },
                setStepDesc: {
                    value(desc, is_append) {
                        let _view = this.getContentView();
                        let _content = _view.getText().toString();
                        let _aim_str = config.content || '';
                        if (_content.match(_aim_str)) {
                            let _text = (is_append ? _aim_str : '') + (desc || '');
                            _view.setText(_content.replace(_aim_str, _text));
                        }
                        return this;
                    },
                    enumerable: true,
                },
                setProgressData: {
                    value(data) {
                        this.setProgress(data.processed / data.total * 100);
                        return this;
                    },
                    enumerable: true,
                },
                setFailureData: {
                    value(error) {
                        this.setActionButton('positive', _dialogsx._text._btn.B);
                        this.on('positive', d => d.dismiss());
                        _dialogsx.alertContent(this, error, 'append');
                        return this;
                    },
                    enumerable: true,
                },
            });
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
        d.getProgressBar().setProgressTintList(
            android.content.res.ColorStateList.valueOf(
                colorsx.toInt(this._colors.wrap(color, 'progress'))
            )
        );
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
        d.getProgressBar().setProgressBackgroundTintList(
            android.content.res.ColorStateList.valueOf(colorsx.toInt(color))
        );
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
};

module.exports = ext;
module.exports.load = () => global.dialogsx = ext;