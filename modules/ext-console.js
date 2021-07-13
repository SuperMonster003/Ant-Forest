global.consolex = typeof global.consolex === 'object' ? global.consolex : {};

let ext = {
    /**
     * @typedef {Object} GlobalLogConfig
     * @property {string} [file]
     * @property {string} [filePattern="%m%n"] - not supported on Auto.js Pro versions
     * @property {number} [maxFileSize=524288]
     * @property {boolean} [immediateFlush=true]
     * @property {"OFF"|"DEBUG"|"INFO"|"WARN"|"ERROR"|"FATAL"|"ALL"} [rootLevel="ALL"]
     * @property {number} [maxBackupSize=5]
     * @property {boolean} [resetConfiguration=true]
     */
    /**
     * @param {GlobalLogConfig} config
     * @see console.setGlobalLogConfig
     */
    setGlobalLogConfig(config) {
        if (context.getPackageName().match(/Pro\b/i)) {
            delete config.filePattern;
        }
        console.setGlobalLogConfig(config);
    },
};

module.exports = ext;
module.exports.load = () => global.consolex = ext;