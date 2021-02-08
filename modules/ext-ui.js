global.uix = typeof global.uix === 'object' ? global.uix : {};

require('./ext-colors').load();

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
        this.makeSureUiMode();

        let _opt = options || {};

        global._$_ui_main_id = _opt.main_id || 'main';
        ui.layout(
            <vertical id="{{global._$_ui_main_id}}">
                <vertical id="sub_{{global._$_ui_main_id}}"/>
            </vertical>
        );

        ui.statusBarColor(_opt.status_bar_color || this._colors.status_bar);

        let _req_o = _opt.requested_orientation;
        _req_o && this.setRequestedOrientation(_req_o);
    },
    isUiMode() {
        return typeof activity !== 'undefined';
    },
    makeSureUiMode() {
        if (!this.isUiMode()) {
            throw Error('UI mode is required');
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
        this.makeSureUiMode() && activity.setRequestedOrientation(
            android.content.pm.ActivityInfo['SCREEN_ORIENTATION_' + requested_orientation]
        );
    },
    /**
     * @param {android.widget.ImageView|android.widget.ImageView[]} view
     * @param {ColorParam} color
     */
    setImageTint(view, color) {
        let _set = (v) => v.setColorFilter(
            com.stardust.autojs.core.ui.inflater.util.Colors.parse(
                v, colorsx.toStr(color)
            )
        );
        Array.isArray(view) ? view.forEach(_set) : _set(view);
    },
    /**
     *
     * @param {android.widget.TextView|android.widget.TextView[]} view
     * @param color
     * @private
     */
    setTextColor(view, color) {
        let _set = v => v.setTextColor(colorsx.toInt(color));
        Array.isArray(view) ? view.forEach(_set) : _set(view);
    },
};

module.exports = ext;
module.exports.load = () => global.uix = ext;