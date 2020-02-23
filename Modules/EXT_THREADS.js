let ext = {
    // prevent script exiting error from showing up
    // (both console and toast window) if threads were interrupted
    starts: (f, no_err_msg) => {
        try {
            return global["threads"].start(f);
        } catch (e) {
            let _regexp = /(Script)?InterruptedEx|script exiting/;
            if (!e.message.match(_regexp) && !no_err_msg) {
                throw Error(e);
            }
        }
    },
};

module.exports = ext;
module.exports.load = () => Object.assign(global["threads"], ext);