global.threadsx = typeof global.threadsx === "object" ? global.threadsx : {};

let ext = {
    // prevent script exiting error from showing up
    // (both console and toast window) if threads were interrupted
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
};

module.exports = ext;
module.exports.load = () => global.threadsx = ext;