/** @type {Plugin$Exportation} */
let exp = {
    dialog: null,
    view: null,
    run() {},
    config() {},
    deploy() {},
};

if (typeof module === 'object') {
    module.exports = exp;
} else {
    exp.run();
}