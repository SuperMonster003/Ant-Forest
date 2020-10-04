global.threadsx = typeof global.threadsx === "object" ? global.threadsx : {};

let ext = {
    /**
     * prevent script exiting error from showing up (for both
     * console and toast window) if threads were interrupted
     * @param {java.lang.Runnable|function} f
     * @param {boolean} [no_err_msg=false]
     * @returns {com.stardust.autojs.core.looper.TimerThread}
     */
    starts(f, no_err_msg) {
        try {
            return threads.start(f);
        } catch (e) {
            let _regexp = /(Script)?InterruptedEx|script exiting/;
            if (!e.message.match(_regexp) && !no_err_msg) {
                throw Error(e);
            }
        }
    },
    /**
     * degradation for threads.atomic() -- zh-CN: 平稳退化
     * @param {number} [x]
     * @returns {{
     *     incrementAndGet: function(): number,
     *     compareAndSet: function(number, number): boolean,
     *     get: function(): number
     * }|java.util.concurrent.atomic.AtomicLong}
     */
    atomic(x) {
        let _res = threads.atomic(x);
        if (classof(_res, "JavaObject")) {
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
};

module.exports = ext;
module.exports.load = () => global.threadsx = ext;