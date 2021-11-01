require('./mod-global');
let {a11yx} = require('./ext-a11y');

let exp = {
    /**
     * Get toast message(s) via events.observeToast()
     * @param {string|RegExp} [msg='']
     * @param {string|RegExp} [pkg='']
     * @param {number} [timeout=3e3]
     * @return {string[]}
     */
    getToasts(msg, pkg, timeout) {
        let $ = {
            timeout: (Number(timeout) || 4.2e3).clamp(1e3, 60e3),
            msg_rex: new RegExp(msg || ''),
            pkg_rex: new RegExp(pkg || ''),
            results: [],
            observe() {
                // CAUTION
                //  ! do not interrupt this thread manually
                //  ! or toasted message won't be received by next getToasts()
                threads.start(new java.lang.Runnable({
                    run: () => {
                        events.observeToast();
                        events.on('toast', (o) => {
                            this.pkg_rex.test(o.getPackageName()) &&
                            this.msg_rex.test(o.getText()) &&
                            this.results.push(o.getText());
                        });
                    },
                }));
                a11yx.waitAndStable(() => this.results.length > 0, this.timeout, 50);
            },
            clean() {
                events.removeAllListeners('toast');
            },
            getResult() {
                this.observe();
                this.clean();
                return this.results;
            },
        };
        return $.getResult();
    },
};

module.exports = {eventsx: exp};