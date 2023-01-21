let {project} = require('./mod-project');
let {consolex} = require('./ext-console');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let cfg = {
    action: 'android.intent.action.SCREEN_OFF',
    path: project.getLocal().main.path,
    delay: 0, // milliseconds
};

let $ = {
    file_name: 'plugin-ant-forest-on-screen-off-launcher.js',
    /**
     * @param {(typeof cfg) & any} [config]
     */
    addIntentTask(config) {
        Object.assign(cfg, config);

        tasks.addIntentTask({
            action: cfg.action,
            path: files.join(project.getLocalPath(), 'modules', this.file_name),
            isAsync: true,
            callback(task) {
                consolex._([
                    'Intent task added successfully',
                    'action: ' + task.getAction(),
                    'path: ' + task.getScriptPath(),
                ], 0, 0, -2);

                if (typeof config.callback === 'function') {
                    config.callback(task);
                }
            },
        });
    },
    removeAllTasks() {
        let _tasks = tasks.queryIntentTasks({
            action: cfg.action,
        });
        _tasks.forEach(task => tasks.removeTask(task));

        consolex._([
            'All intent tasks removed',
            'length: ' + _tasks.length,
            'action: ' + cfg.action,
        ], 0, 0, -2);
    },
    unregisterAllDynamicBroadcastReceivers() {
        try {
            org.autojs.autojs.App.Companion.getApp().getDynamicBroadcastReceivers().unregisterAll();
        } catch (e) {
            // Wrapped java.lang.IllegalArgumentException: Receiver not registered...
            // Error above could be ignored as the functionality

            // App.Companion.getApp().getDynamicBroadcastReceivers().unregister(action: string)
            // Code above does not work as expected, unfortunately.
        }
    },
    addDisposableTask() {
        tasks.addDisposableTask({
            date: Date.now() + cfg.delay,
            path: cfg.path,
        });
    },
};

let exp = {
    dialog: null,
    view: null,
    run() {
        $.removeAllTasks();
        $.unregisterAllDynamicBroadcastReceivers();
        $.addDisposableTask();
    },
    config() {
        // Maybe... Select an action like Auto.js 4.1.1 Alpha2 ?
    },
    /**
     * @param {typeof cfg} [config]
     */
    deploy(config) {
        $.removeAllTasks();
        $.unregisterAllDynamicBroadcastReceivers();
        $.addIntentTask(config);
    },
};

if (typeof module === 'object') {
    module.exports = exp;
} else {
    exp.run();
}