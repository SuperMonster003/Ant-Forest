let {$$toast} = require('../modules/mod-global');
let {threadsx} = require('../modules/ext-threads');
let {consolex} = require('../modules/ext-console');

threadsx.start(() => {
    $$toast('目标页面按"音量减"键捕获布局信息', 'L');
    events.observeKey();
    events.onceKeyDown('volume_down', function () {
        ['text', 'desc', 'id'].slice().forEach((pref) => {
            consolex.d('# ' + pref + ' #', 0, 0, 2);
            consolex.d(selector()[pref + 'Matches'](/.+/).find()
                .map(w => w[pref]()), 0, 0, 2);
        });
        $$toast('完成布局信息捕获\n日志中可查看信息', 'L');
        engines.myEngine().forceStop();
    });
});