let {
    isNormalFunction, isArrowFunction,
} = require('./mod-global');
let {a11yx} = require('./ext-a11y');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Runnable = java.lang.Runnable;

let exp = {
    /**
     * @type {Threadsx.PresetMonitor}
     */
    _monitor_preset: {
        ensure_open: (tt) => {
            let _tt = tt === undefined ? 4.2e3 : tt || Infinity;
            return a11yx.waitAndClick(/打开/, _tt, 240, {cs$: 'w'});
        },
    },
    /**
     * @param {Threadsx.Monitor} [monitor]
     * @param {...any[]} [args]
     * @return {org.autojs.autojs.core.looper.TimerThread}
     */
    monitor(monitor, args) {
        let _mon = typeof monitor === 'string' ? this._monitor_preset[monitor] : monitor;
        if (typeof _mon === 'function') {
            return threads.start(() => _mon.apply(null, [].slice.call(arguments).slice(1)));
        }
        if (_mon instanceof Runnable) {
            return threads.start(_mon);
        }
        throw TypeError('Invalid monitor: ' + monitor);
    },
    /**
     * @param {Threadsx.Monitor} [monitor]
     * @param {...any[]} [args]
     * @return {org.autojs.autojs.core.looper.TimerThread|void}
     */
    monitorIFN(monitor, args) {
        if (monitor !== undefined) {
            return this.monitor.apply(this, arguments);
        }
    },
};

module.exports = {threadsx: exp};