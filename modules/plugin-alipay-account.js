let {dialogsx} = require('./ext-dialogs');

/** @type {Plugin$Exportation} */
let _export = {
    dialog: null,
    view: null,
    run() {
        /* login directly ? */
        /* config if no main user configured ? */

        if (this.dialog) {
            return this.dialog.show();
        }
        dialogsx.alerts('Executable script for current plugin hasn\'t been accomplished');
    },
    config() {
        dialogsx.alerts('CUI (Configuration User Interface) for current plugin hasn\'t been accomplished');
    },
    getView() {
        return this.view;
    },
    getDialog() {
        return this.dialog;
    },
};

typeof module === 'object' ? module.exports = _export : _export.run();