global.uix = typeof global.uix === 'object' ? global.uix : {};

require('./ext-colors').load();

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let ActivityInfo = android.content.pm.ActivityInfo;
let Colors = com.stardust.autojs.core.ui.inflater.util.Colors;
let Dimensions = com.stardust.autojs.core.ui.inflater.util.Dimensions;

let ext = {
    _colors: {
        info: '#78909c',
        subhead: '#03a6ef',
        subhead_highlight: '#bf360c',
        btn_on: '#fafafa',
        btn_off: '#bbcccc',
        split_line: '#bbcccc',
        status_bar: '#03a6ef',
        action_bar_bg: '#03a6ef',
        list_title_bg: '#afefff',
        page_title: '#fafafa',
        page_back_btn: '#fafafa',
        item_title: '#212121',
        item_title_light: '#9e9e9e',
        item_hint: '#757575',
        item_hint_light: '#9e9e9e',
        chevron_icon: '#9e9e9e',
    },
    /**
     * @param {{
     *     main_id?: string,
     *     status_bar_color?: string,
     *     requested_orientation?: UI$requested_orientation,
     * }} [options]
     */
    init(options) {
        this.ensureUiMode();

        let _opt = options || {};

        global._$_ui_main_id = _opt.main_id || 'main';
        ui.layout(
            <vertical id="{{global._$_ui_main_id}}">
                <vertical id="sub_{{global._$_ui_main_id}}"/>
            </vertical>);

        ui.statusBarColor(_opt.status_bar_color || this._colors.status_bar);

        let _req_o = _opt.requested_orientation;
        _req_o && this.setRequestedOrientation(_req_o);
    },
    isUiMode() {
        return typeof activity !== 'undefined';
    },
    ensureUiMode() {
        if (!this.isUiMode()) {
            throw Error('UI mode is required');
        }
    },
    ensureWidgetExclusive(name) {
        if (name in ui.__widgets__) {
            throw Error('Extended widget node <' + name + '> has' +
                ' already registered and should not be overwritten');
        }
    },
    /**
     * @typedef {{
     *     attr_name: string,
     *     getter?: function(view:AutojsUiWidgetViews, name:string, default_getter:Function):*,
     *     setter?: function(view:AutojsUiWidgetViews, name:string, value:*, default_setter:Function),
     * }|{
     *     attr_name: string,
     *     attr_alias?: string,
     *     setter?: function(view:AutojsUiWidgetViews, name:string, value:*, default_setter:Function),
     * }} UiRegisterWidgetAttrDefiner
     */
    /**
     *
     * @param {string} name
     * @param {'/'|string|Xml|Function} render
     * @param {UiRegisterWidgetAttrDefiner|UiRegisterWidgetAttrDefiner[]} [attr_definers]
     */
    registerWidget(name, render, attr_definers) {
        util.extend(ExtLayout, ui.Widget);

        ExtLayout.prototype.render = renderGetter;

        this.ensureWidgetExclusive(name);
        ui.registerWidget(name, ExtLayout);

        // constructor(s) //

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
            // noinspection JSTypeOfValues
            if (typeof render === 'xml') {
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
                if (render.slice(0, 1) === '<') {
                    if (render.slice(-1) === '>') {
                        return render;
                    }
                }
            }
            throw Error('Argument render cannot be parsed');
        }

        /**
         * @param {UiRegisterWidgetAttrDefiner} o
         */
        function defineAttr(o) {
            let _setter = function (view, name, value, default_setter) {
                if (typeof o.setter === 'function') {
                    o.setter(view, name, value, default_setter);
                }
                if (typeof this._value === 'undefined') {
                    this._value = value;
                }
            };
            let _getter = function (view, name, default_getter) {
                if (typeof o.getter === 'function') {
                    return o.getter(view, name, default_getter);
                }
                return this._value || '';
            };

            if (o.attr_alias) {
                this.defineAttr(o.attr_name, o.attr_alias, _setter.bind(o));
            } else {
                this.defineAttr(o.attr_name, _getter.bind(o), _setter.bind(o));
            }
        }
    },
    /**
     * @typedef {
     *     'UNSET'|'UNSPECIFIED'|'LANDSCAPE'|'PORTRAIT'|'USER'|'BEHIND'|'SENSOR'|'NOSENSOR'|
     *     'SENSOR_LANDSCAPE'|'SENSOR_PORTRAIT'|'REVERSE_LANDSCAPE'|'REVERSE_PORTRAIT'|
     *     'FULL_SENSOR'|'USER_LANDSCAPE'|'USER_PORTRAIT'|'FULL_USER'|'LOCKED'|string
     * } UI$requested_orientation
     */
    /**
     * Change the desired orientation of this activity.
     * If the activity is currently in the foreground or otherwise impacting the screen orientation,
     * the screen will immediately be changed.
     * @param {UI$requested_orientation} requested_orientation
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
     * @param {ColorParam} color
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
     * @param {ColorParam} color
     */
    setTextColor(view, color) {
        let _set = v => v.setTextColor(colorsx.toInt(color));
        Array.isArray(view) ? view.forEach(_set) : _set(view);
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
     * @param {AutojsUiWidgetViews} [options.base_view=ui.main] - specified view for attaching parent views
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
        let _base_view = _opt.base_view || ui.main;
        let _pool_len = _pool.length;
        let _main_view = _pool[_pool_len - 2];
        let _sub_view = _pool[_pool_len - 1];
        let _parent = _base_view.getParent();
        let _abs = num => num < 0 ? -num : num;

        if (!global.WIDTH || !global.HEIGHT) {
            require('ext-device').load();
            let _data = devicex.getDisplay();
            [global.WIDTH, global.HEIGHT] = [_data.WIDTH, _data.HEIGHT];
        }

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
     * Register extended widget nodes whose name starts with 'x-'
     */
    $node() {
        this.registerWidget('x-img', '/', {
            attr_name: 'tint_color',
            setter: (view, name, value) => ext.setImageTint(view, value),
        });
        this.registerWidget('x-text', '/', [{
            attr_name: 'text',
            setter: (view, name, value) => view.setText(value),
        }, {
            attr_name: 'color',
            setter: (view, name, value) => view.setTextColor(colorsx.toInt(value)),
        }, {
            attr_name: 'line_spacing',
            setter: (view, name, value) => {
                let _setLineSpacing = (val) => {
                    let _int = Dimensions.parseToIntPixel(val, view);
                    view.setLineSpacing(_int, view.getLineSpacingMultiplier());
                };
                if (!value.match(/cy|cy?x/i)) {
                    return _setLineSpacing(value);
                }
                if (typeof cX !== 'function' || typeof cY !== 'function') {
                    if (files.exists('./ext-device.js')) {
                        require('./ext-device').getDisplay(true);
                    } else {
                        return _setLineSpacing(value);
                    }
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

        delete this.$node;
        return this;
    },
};

ext.$node();

module.exports = ext;
module.exports.load = () => global.uix = ext;