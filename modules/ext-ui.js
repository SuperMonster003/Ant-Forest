let {isXMLType} = require('./mod-global');
let {project} = require('./mod-project');
let {colorsx} = require('./ext-colors');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Looper = android.os.Looper;
let ActivityInfo = android.content.pm.ActivityInfo;
let Colors = com.stardust.autojs.core.ui.inflater.util.Colors;
let Dimensions = com.stardust.autojs.core.ui.inflater.util.Dimensions;

let exp = {
    colors: {
        info: '#78909C',
        subhead: '#03A6EF',
        subhead_highlight: '#BF360C',
        btn_on: '#FAFAFA',
        btn_off: '#BBCCCC',
        split_line: '#BBCCCC',
        status_bar: '#03A6EF',
        action_bar_bg: '#03A6EF',
        list_title_bg: '#AFEFFF',
        page_title: '#FAFAFA',
        page_back_btn: '#FAFAFA',
        item_title: '#212121',
        item_title_light: '#9E9E9E',
        item_hint: '#757575',
        item_hint_light: '#9E9E9E',
        chevron_icon: '#9E9E9E',
    },
    /**
     * @param {{
     *     status_bar_color?: string,
     *     requested_orientation?: Android.ActivityInfo.ScreenOrientationKeyAbbr,
     * }} [options]
     * @return {JsLinearLayout$}
     */
    init(options) {
        this.ensureUiMode();

        let _opt = options || {};

        ui.layout(
            <vertical id="main">
                <vertical id="sub_main"/>
            </vertical>);

        let _ui_view = {
            /** @type {com.stardust.autojs.core.ui.widget.JsLinearLayout} */
            main: ui['main'],
            /** @type {com.stardust.autojs.core.ui.widget.JsLinearLayout} */
            sub_main: ui['sub_main'],
        };

        ui.statusBarColor(_opt.status_bar_color || this.colors.status_bar);

        let _req_o = _opt.requested_orientation;
        _req_o && this.setRequestedOrientation(_req_o);

        this.sub_main = _ui_view.sub_main;
        return this.main = _ui_view.main;
    },
    /**
     * Script running in ui mode contains code like "'ui';".
     * Different from {@code this.isUiThread}.
     * @return {boolean}
     */
    isUiMode() {
        return typeof activity !== 'undefined';
    },
    /**
     * Returns if current scope running in ui thread.
     * Different from {@code this.isUiMode}.
     * @example
     * let _check = () => console.log(uix.isUiThread());
     * _check(); // false
     * dialogs.build({title: 'Test', positive: 'Exit'})
     *     .on('positive', (d) => {
     *         _check(); // false
     *         ui.post(_check); // false
     *         d.dismiss();
     *     }).show();
     * @return {boolean}
     */
    isUiThread() {
        return Looper.myLooper() === Looper.getMainLooper();
    },
    /**
     * @param {Object} [options]
     * @param {boolean} [options.is_show_hint]
     */
    ensureUiMode(options) {
        let _opt = options || {};
        if (!this.isUiMode()) {
            if (!_opt.is_show_hint) {
                throw Error('UI mode is required');
            }
            dialogs.build({
                title: '提示',
                content: '需要在 ui 模式下运行',
                positive: '退出',
                positiveColor: '#FF3D00',
                negative: null,
                neutral: '查看示例',
                neutralColor: '#0DA798',
                autoDismiss: false,
                canceledOnTouchOutside: false,
            }).on('neutral', () => {
                dialogs.build({
                    title: '代码示例',
                    content: '\'ui\';\n' +
                        'ui.layout(<vertical>\n' +
                        '    <text text="avocado"/>\n' +
                        '</vertical>);',
                    positive: '返回',
                }).show();
            }).on('positive', (d) => {
                d.dismiss();
            }).show().setOnDismissListener({
                onDismiss() {
                    toast('已退出');
                    exit();
                },
            });
            exit();
        }
    },
    ensureWidgetExclusive(name) {
        if (name in ui.__widgets__) {
            throw Error('Extended widget node <' + name + '> already registered and shouldn\'t be overwritten');
        }
    },
    /**
     * @param {string} name
     * @param {Uix.RegisterWidget.Render} render
     * @param {Uix.RegisterWidget.AttrDefiner|Uix.RegisterWidget.AttrDefiner[]} [attr_definers]
     */
    registerWidget(name, render, attr_definers) {
        util.extend(ExtLayout, ui.Widget);

        ExtLayout.prototype.render = renderGetter;

        if (!this._no_register_widget_exclusive_check) {
            this.ensureWidgetExclusive(name);
        }
        ui.registerWidget(name, ExtLayout);

        // constructor(s) //

        /**
         * @constructor
         * @augments Internal.UiWidget
         */
        function ExtLayout() {
            ui.Widget.apply(this, arguments);

            if (typeof attr_definers !== 'undefined') {
                if (Array.isArray(attr_definers)) {
                    attr_definers.forEach(o => defineAttr.call(this, o));
                } else {
                    defineAttr.call(this, attr_definers);
                }
            }
        }

        // tool function(s) //

        function renderGetter() {
            if (isXMLType(render)) {
                return render;
            }
            if (typeof render === 'function') {
                return render();
            }
            if (typeof render === 'string') {
                if (render === '/') {
                    return '<' + name.replace(/^x-/, '') + '/>';
                }
                if (render.match(/^\w+$/)) {
                    return '<' + render + '/>';
                }
                if (render.slice(0, 1) === '<' && render.slice(-1) === '>') {
                    return render;
                }
            }
            throw Error('Argument render cannot be parsed');
        }

        /**
         * @param {Uix.RegisterWidget.AttrDefiner} o
         */
        function defineAttr(o) {
            let _setter = function (view, name, value, default_setter) {
                if (typeof o.setter === 'function') {
                    o.setter(view, name, value, default_setter);
                }
                if (typeof o.getter !== 'function') {
                    this._value = this._value || {};
                    let _v_id = java.lang.Integer.toHexString(view.getId());
                    this._value[_v_id] = this._value[_v_id] || {};
                    if (this._value[_v_id][name] !== value) {
                        this._value[_v_id][name] = value;
                    }
                }
            };
            let _getter = function (view, name, default_getter) {
                if (typeof o.getter === 'function') {
                    return o.getter(view, name, default_getter);
                }
                let _v_id = java.lang.Integer.toHexString(view.getId());
                return ((this._value || {})[_v_id] || {})[name] || '';
            };

            let _def = n => this.defineAttr(n, o.attr_alias || _getter.bind(o), _setter.bind(o));
            Array.isArray(o.attr_name) ? o.attr_name.forEach(_def) : _def(o.attr_name);
        }
    },
    /**
     * Change the desired orientation of this activity.
     * If the activity is currently in the foreground or otherwise impacting the screen orientation,
     * the screen will immediately be changed.
     * @param {Android.ActivityInfo.ScreenOrientationKeyAbbr} requested_orientation
     * @see android.app.Activity.setRequestedOrientation
     * @see https://developer.android.com/reference/android/app/Activity#setRequestedOrientation(int)
     */
    setRequestedOrientation(requested_orientation) {
        this.ensureUiMode();
        let _k = 'SCREEN_ORIENTATION_' + requested_orientation;
        let _activity_info_element = ActivityInfo[_k];
        activity.setRequestedOrientation(_activity_info_element);
    },
    /**
     * @param {android.widget.ImageView|android.widget.ImageView[]} view
     * @param {Color$} color
     */
    setImageTint(view, color) {
        let _set = (v) => this.setColorFilter(v, color);
        Array.isArray(view) ? view.forEach(_set) : _set(view);
    },
    /**
     * @param {android.widget.ImageView} view
     * @param {number} color
     */
    setColorFilter(view, color) {
        view.setColorFilter(Colors.parse(view, colorsx.toStr(color)));
    },
    /**
     * @param {android.widget.TextView|android.widget.TextView[]} view
     * @param {Color$} color
     */
    setTextColor(view, color) {
        let _set = v => v.setTextColor(colorsx.toInt(color));
        Array.isArray(view) ? view.forEach(_set) : _set(view);
    },
    /**
     * @param {UI.View} view
     * @param {string} margin
     */
    setMargin(view, margin) {
        // noinspection JSValidateTypes
        /**
         * @type {android.view.ViewGroup.MarginLayoutParams}
         * @see {%Auto.js-master%\autojs\src\main\java\com\stardust\autojs\core\ui\attribute\ViewAttributes.java#412}
         */
        let _params = view.getLayoutParams();
        let _pixels = Dimensions.parseToIntPixelArray(view, margin);
        _params.setMargins(_pixels[0], _pixels[1], _pixels[2], _pixels[3]);
        _params.setMarginStart(_pixels[0]);
        _params.setMarginEnd(_pixels[2]);
        view.setLayoutParams(_params);
    },
    /**
     * @param {UI.View} view
     * @param {string} padding
     */
    setPadding(view, padding) {
        let _pixels = Dimensions.parseToIntPixelArray(view, padding);
        view.setPadding(_pixels[0], _pixels[1], _pixels[2], _pixels[3]);
    },
    /**
     * Scroll a page smoothly from pages pool
     * @param {'left'|'right'} direction
     * @param {Object} [callback]
     * @param {function():*} [callback.onStart]
     * @param {function():*} [callback.onSuccess]
     * @param {function(e:*):*} [callback.onFailure]
     * @param {Object} options
     * @param {number} [options.duration=180] - scroll duration
     * @param {Array} options.pages_pool - pool for storing pages (parent views)
     * @param {UI.View} [options.base_view=ui.main] - specified view for attaching parent views
     */
    smoothScrollPage(direction, callback, options) {
        let _cbk = callback || {};
        if (typeof _cbk.onStart === 'function') {
            _cbk.onStart();
        }

        let _opt = options || {};
        let _pool = _opt.pages_pool;
        if (_pool.length < 2 || global._$_page_scrolling) {
            return;
        }
        global._$_page_scrolling = true;

        let _du = _opt.duration || 180;
        let _each_move_time = 12;
        let _base_view = _opt.base_view || ui['main'];
        let _pool_len = _pool.length;
        let _main_view = _pool[_pool_len - 2];
        let _sub_view = _pool[_pool_len - 1];
        let _parent = _base_view.getParent();
        let _abs = num => num < 0 ? -num : num;

        let _dx = WIDTH, _dy = 0;
        let _is_left = direction === 'left';
        let _is_right = direction === 'right';
        if (_is_left) {
            _sub_view && _sub_view.scrollBy(-WIDTH, 0);
            _parent.addView(_sub_view);
        } else if (_is_right) {
            _dx *= -1;
        } else {
            throw Error('Cannot parse direction for uix.smoothScrollPage()');
        }

        try {
            let [_neg_x, _neg_y] = [_dx < 0, _dy < 0];
            [_dx, _dy] = [_abs(_dx), _abs(_dy)];
            let _ptx = _dx ? Math.ceil(_each_move_time * _dx / _du) : 0;
            let _pty = _dy ? Math.ceil(_each_move_time * _dy / _du) : 0;

            threads.start(function () {
                while (_dx > 0 || _dy > 0) {
                    let _move_x = _ptx ? Math.min(_dx, _ptx) : 0;
                    let _move_y = _pty ? Math.min(_dy, _pty) : 0;
                    let _scroll_x = _neg_x ? -_move_x : _move_x;
                    let _scroll_y = _neg_y ? -_move_y : _move_y;
                    ui.post(() => {
                        _sub_view && _sub_view.scrollBy(_scroll_x, _scroll_y);
                        _main_view.scrollBy(_scroll_x, _scroll_y);
                    });
                    _dx -= _move_x;
                    _dy -= _move_y;
                    sleep(_each_move_time);
                }
                if (_is_right && _sub_view) {
                    let _last_idx = _parent.getChildCount() - 1;
                    let _last_chd = _parent.getChildAt(_last_idx);
                    ui.post(() => {
                        _sub_view.scrollBy(WIDTH, 0);
                        _parent.removeView(_last_chd);
                    });
                }
                if (typeof _cbk.onSuccess === 'function') {
                    _cbk.onSuccess();
                }
                delete global._$_page_scrolling;
            });
        } catch (e) {
            if (typeof _cbk.onFailure === 'function') {
                return _cbk.onFailure(e);
            }
            toast(e.message);
            console.warn(e.message);
        }
    },
    /**
     * @param {UI.View} view
     * @param {string} string_listener
     */
    setOnClickListenerWithString(view, string_listener) {
        let _f_str = 'let _ =' + string_listener + 'return _.apply(this, arguments)';
        view.setOnClickListener({onClick: new Function(_f_str)});
    },
    /**
     * @example
     * uix.execScript('test', function () {
     *     ui.layout(<frame><x-text id="txt" text="3"/></frame>);
     *     ui.statusBarColor('#880E4F');
     *     ui.txt.attr('gravity', 'center');
     *     ui.txt.attr('size', 99);
     *     ui.txt.attr('color', '#BC477B');
     * });
     * @param {string} name
     * @param {function|string} fn
     * @param {Enginesx.ExecutionConfig} [options]
     */
    execScript(name, fn, options) {
        let _x = function (this_arg) {
            if (!this_arg.uix && files.exists('./ext-ui.js')) {
                // noinspection JSUnusedLocalSymbols
                this_arg.uix = require(files.path('./ext-ui.js'));
            }
        };
        let _script = '"ui";'
            + '!' + _x.toString() + '(this);'
            + '!' + fn.toString() + '(this);';

        engines.execScript(name, _script, Object.assign({
            path: files.join(project.getLocalPath(), 'modules'),
        }, options));
    },
    /**
     * Register extended widget nodes whose name starts with 'x-'
     */
    $node() {
        this._no_register_widget_exclusive_check = true;

        this.registerWidget('x-img', '/', [{
            attr_name: 'tint_color',
            setter: (view, name, value) => exp.setImageTint(view, value),
        }, {
            attr_name: 'on_click',
            setter: (view, name, value) => exp.setOnClickListenerWithString(view, value),
        }]);
        this.registerWidget('x-text', '/', [{
            attr_name: 'text',
            setter: (view, name, value) => view.setText(String(value)),
        }, {
            attr_name: ['size', 'text_size'],
            setter: (view, name, value) => view.setTextSize(Number(value)),
        }, {
            attr_name: ['color', 'text_color'],
            setter: (view, name, value) => view.setTextColor(colorsx.toInt(value)),
        }, {
            attr_name: 'line_spacing',
            setter(view, name, value) {
                let _setLineSpacing = (val) => {
                    let _int = Dimensions.parseToIntPixel(val, view);
                    view.setLineSpacing(_int, view.getLineSpacingMultiplier());
                };
                if (!value.match(/cy|cy?x/i)) {
                    return _setLineSpacing(value);
                }
                let _rex = /(\d+(?:\.\d+)?)?(cy|cy?x)\(?(\d+(?:\.\d+)?)?\)?\s*/i;
                let _val = value.replace(_rex, ($0, $1, $2, $3) => {
                    let _num = $1 || $3;
                    let _func = $2.toLowerCase();
                    return _func === 'cx'
                        ? cX(_num) : _func === 'cy'
                            ? cY(_num) : _func === 'cyx'
                                ? cYx(_num) : _num;
                });
                return _setLineSpacing(_val);
            },
        }]);
        this.registerWidget('x-input', '/');
        this.registerWidget('x-button', '/', [{
            attr_name: 'on_click',
            setter: (view, name, value) => exp.setOnClickListenerWithString(view, value),
        }, {
            attr_name: 'text',
            setter(view, name, value) {
                view.setText(String(value));
            },
        }, {
            attr_name: 'text_size',
            setter(view, name, value) {
                view.setTextSize(Number(value));
            },
        }, {
            attr_name: 'text_color',
            setter(view, name, value) {
                view.setTextColor(colorsx.toInt(value));
            },
        }, {
            attr_name: 'background_tint',
            setter(view, name, value) {
                view.setBackgroundTintList(colorsx.toColorStateList(value));
            },
        }]);
        this.registerWidget('x-img-button', function layout$iiFe() {
            // noinspection SpellCheckingInspection
            return '' +
                '<vertical id="_outer" margin="2 4">\n' +
                '    <vertical id="_img_btn_outer" height="53">\n' +
                '        <frame gravity="center">\n' +
                '            <x-img id="_img" width="53" height="53" switch="off"\n' +
                '                   tint_color="#16FFFFFF" gravity="center"\n' +
                '                   src="@drawable/ic_brightness_1_black_48dp"\n' +
                '                   bg="?selectableItemBackgroundBorderless"\n' +
                '            />\n' +
                '            <x-text id="_text" color="#FFFFFF" gravity="center" size="16"/>\n' +
                '        </frame>\n' +
                '    </vertical>\n' +
                '    <x-text id="_desc" color="#FFFFFF" gravity="center"\n' +
                '            visibility="gone" size="12"\n' +
                '    />\n' +
                '</vertical>';
        }(), [{
            attr_name: 'scale',
            setter(view, name, value) {
                let _val = Number(value);
                view['_img'].attr('width', _val);
                view['_img'].attr('height', _val);
                view['_img_btn_outer'].attr('height', _val);
                view['_text'].attr('size', _val * 0.3);
                // _desc etc...
            },
        }, {
            attr_name: 'switch',
            setter(view, name, value) {
                view['_img'].attr('tint_color', value === 'on'
                    ? colorsx.hrgba('#AC1900BF')
                    : colorsx.hrgba('#FFFFFF22'));
            },
        }, {
            attr_name: 'on_click',
            setter(view, name, value) {
                let _f_str = 'let _ =' + value + 'return _()';
                view.setOnClickListener({onClick: new Function(_f_str)});
            },
        }, {
            attr_name: 'text',
            setter(view, name, value) {
                view['_text'].setText(String(value));
            },
        }, {
            attr_name: 'desc',
            setter(view, name, value) {
                if (view['_desc'].attr('visibility') !== 'visible') {
                    view['_desc'].attr('visibility', 'visible');
                }
                exp.setMargin(view, '6 4');
                view['_desc'].setText(String(value));
            },
        }, {
            attr_name: 'text_color',
            setter(view, name, value) {
                view['_text'].setTextColor(colorsx.toInt(value));
            },
        }, {
            attr_name: 'text_size',
            setter(view, name, value) {
                view['_text'].attr('size', value);
            },
        }, {
            attr_name: 'tint_color',
            setter(view, name, value) {
                view['_img'].attr('tint_color', value);
            },
        }]);

        delete this._no_register_widget_exclusive_check;
        delete this.$node;
        return this;
    },
};

exp.$node();

/**
 * @type {Internal.uix}
 */
module.exports = {uix: exp};