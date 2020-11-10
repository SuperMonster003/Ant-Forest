global.uix = typeof global.uix === "object" ? global.uix : {};

let ext = {
    isUiMode() {
        return typeof activity !== "undefined";
    },
    makeSureUiMode() {
        if (this.isUiMode()) {
            return true;
        }
        throw Error("UI mode is required");
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

        global._$_ui_main_id = _opt.main_id || "main";
        ui.layout(
            <vertical id="{{global._$_ui_main_id}}">
                <frame/>
            </vertical>
        );

        ui.statusBarColor(_opt.status_bar_color || "#03a6ef");

        let _req_o = _opt.requested_orientation;
        _req_o && this.setRequestedOrientation(_req_o);
    },
    /**
     * @typedef {
     *     "UNSET"|"UNSPECIFIED"|"LANDSCAPE"|"PORTRAIT"|"USER"|"BEHIND"|"SENSOR"|"NOSENSOR"|
     *     "SENSOR_LANDSCAPE"|"SENSOR_PORTRAIT"|"REVERSE_LANDSCAPE"|"REVERSE_PORTRAIT"|
     *     "FULL_SENSOR"|"USER_LANDSCAPE"|"USER_PORTRAIT"|"FULL_USER"|"LOCKED"|string
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
            android.content.pm.ActivityInfo["SCREEN_ORIENTATION_" + requested_orientation]
        );
    },
};

module.exports = ext;
module.exports.load = () => global.uix = ext;