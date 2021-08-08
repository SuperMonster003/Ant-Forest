let {showSplitLine} = require('../modules/mod-monster-func');

require('../modules/ext-global').load('Global');

threads.start(function () {
    toast('请在目标页面按"音量减"键');
    events.observeKey();
    events.onKeyDown('volume_down', function () {
        (function showCurrentScreenLayoutInfo$iiFe() {
            showSplitLine();
            _showInfo(['text', 'desc', 'id']) || showSplitLine();

            // tool function(s) //

            function _showInfo(sltr) {
                let _sltr_pref = Array.isArray(sltr) ? sltr.slice() : [sltr];
                let _info_shown = false;
                _sltr_pref.forEach((pref) => {
                    let _wc = selector()[pref + 'Matches'](/.+/).find();
                    if (_wc.length) {
                        console.log('# ' + pref + ' #');
                        showSplitLine();
                        _wc.forEach(w => console.log(w[pref]()));
                        showSplitLine();
                        _info_shown = true;
                    }
                });
                if (_info_shown) {
                    return true;
                }
                console.log('当前页面未捕获到布局信息');
                showSplitLine();
            }
        })();
        $$toast('完成布局信息捕获\n日志中可查看信息', 'Long');
        threads.shutDownAll();
        engines.myEngine().forceStop();
    });
});