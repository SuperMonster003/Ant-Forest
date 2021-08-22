global.threadsx = typeof global.threadsx === 'object' ? global.threadsx : {};

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Runnable = java.lang.Runnable;
let Throwable = java.lang.Throwable;
let AtomicLong = java.util.concurrent.atomic.AtomicLong;
let TimerThread = com.stardust.autojs.core.looper.TimerThread;
let ScriptInterruptedException = com.stardust.autojs.runtime.exception.ScriptInterruptedException;

let ext = {
    /**
     * Prevent script exiting error from showing up (for both
     * console and toast window) if threads were interrupted
     * @param {java.lang.Runnable|function} f
     * @param {boolean} [no_err_msg=false]
     * @returns {com.stardust.autojs.core.looper.TimerThread}
     */
    start(f, no_err_msg) {
        try {
            if (f instanceof Runnable) {
                return threads.start(f);
            }
            if (typeof f === 'function') {
                return threads.start(new Runnable({run: () => f()}));
            }
        } catch (e) {
            if (!ScriptInterruptedException.causedByInterrupted(new Throwable(e))) {
                if (!e.message.match(/script exiting/) && !no_err_msg) {
                    toast(e.message);
                    throw Error(e + '\n' + e.stack);
                }
            }
        }
        throw TypeError('Unknown type of f for threadsx.start()');
    },
    /**
     * Degradation (zh-CN: 平稳退化) for threads.atomic()
     * @param {number} [x]
     * @returns {{
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
             * @returns {boolean}
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

module.exports = ext;
module.exports.load = () => global.threadsx = ext;