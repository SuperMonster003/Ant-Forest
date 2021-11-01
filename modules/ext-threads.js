let {
    isNormalFunction, isArrowFunction,
} = require('./mod-global');
let {a11yx} = require('./ext-a11y');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Runnable = java.lang.Runnable;
let Throwable = java.lang.Throwable;
let AtomicLong = java.util.concurrent.atomic.AtomicLong;
let TimerThread = com.stardust.autojs.core.looper.TimerThread;
let ScriptInterruptedException = com.stardust.autojs.runtime.exception.ScriptInterruptedException;

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
    _start(f) {
        let _uber = threads.start(f);
        return Object.create(_uber, {
            join: {
                value(time) {
                    if (time === Infinity || time === undefined) {
                        time = 0;
                    } else if (time < 1) {
                        time = 1; // 1 ms
                    }
                    _uber.join(time);
                },
            },
        });
    },
    /**
     * @param {Threadsx.Monitor} [monitor]
     * @param {...any[]} [args]
     * @return {com.stardust.autojs.core.looper.TimerThread}
     */
    monitor(monitor, args) {
        let _mon = typeof monitor === 'string' ? this._monitor_preset[monitor] : monitor;
        if (typeof _mon === 'function') {
            return this.start(() => _mon.apply(null, [].slice.call(arguments).slice(1)));
        }
        if (_mon instanceof Runnable) {
            return this.start(_mon);
        }
        throw TypeError('Invalid monitor: ' + monitor);
    },
    /**
     * @param {Threadsx.Monitor} [monitor]
     * @param {...any[]} [args]
     * @return {com.stardust.autojs.core.looper.TimerThread|void}
     */
    monitorIFN(monitor, args) {
        if (monitor !== undefined) {
            return this.monitor.apply(this, arguments);
        }
    },
    /**
     * Prevent script exiting error from showing up (for both
     * console and toast window) if threads were interrupted
     * @param {Threadsx.Start.Func} f
     * @param {Threadsx.Start.Options} [options]
     * @example
     * threadsx.start(() => {
     *     console.log('A');
     *     sleep(2e3);
     *     console.log('C');
     * }).join(1e3);
     * console.log('B');
     * @return {Threadsx.TimerThread}
     */
    start(f, options) {
        let _opt = options || {};
        let _state = true;
        try {
            if (isNormalFunction(f) || f instanceof Runnable) {
                return this._start(f);
            }
            if (isArrowFunction(f)) {
                return this._start(new Runnable({run: () => f()}));
            }
            _state = false;
        } catch (e) {
            if (!ScriptInterruptedException.causedByInterrupted(new Throwable(e))) {
                if (!e.message.match(/script exiting/) && _opt.is_show_error !== false) {
                    throw Error(e + '\n' + e.stack);
                }
            }
        }
        if (!_state) {
            throw TypeError('Unsupported type "' + typeof f + '" for threadsx.start()');
        }
    },
    /**
     * Degradation (zh-CN: 平稳退化) for threads.atomic()
     * @param {number} [x]
     * @return {{
     *     incrementAndGet: function(): number,
     *     compareAndSet: function(number, number): boolean,
     *     get: function(): number
     * }|java.util.concurrent.atomic.AtomicLong}
     */
    atomic(x) {
        let _res = threads.atomic(x);
        if (_res instanceof AtomicLong) {
            return _res;
        }
        // TODO threads.lock() might be worth a try :)
        let _num = x;
        return {
            get() {
                return _num;
            },
            incrementAndGet() {
                return _num += 1;
            },
            /**
             * @param {number} m
             * @param {number} n
             * @return {boolean}
             */
            compareAndSet(m, n) {
                if (_num === m) {
                    _num = n;
                    return true;
                }
                return false;
            },
        };
    },
    /**
     * @param {com.stardust.autojs.core.looper.TimerThread|*} thd
     */
    interrupt(thd) {
        if (thd instanceof TimerThread) {
            thd.isAlive() && thd.interrupt();
        }
    },
};

module.exports = {threadsx: exp};