let {
    showSplitLine,
    classof,
} = require("../Modules/MODULE_MONSTER_FUNC");

require("../Modules/EXT_GLOBAL_OBJ").load("Global");

threads.start(function () {
    toast('请在目标页面按"音量减"键');
    events.observeKey();
    events.onKeyDown("volume_down", function (event) {
        (function showCurrentScreenLayoutInfo() {
            showSplitLine();
            _showInfo(["text", "desc", "id"]) || showSplitLine();

            // tool function(s) //

            function _showInfo(keywords) {
                let _keywords = classof(keywords, "Array") ? keywords.slice() : [keywords];
                let _info_shown_flag = false;
                _keywords.forEach((kw) => {
                    let _wc = selector()[kw + "Matches"](/.+/).find();
                    if (_wc.length) {
                        console.log("# " + kw + " #");
                        showSplitLine();
                        _wc.forEach(w => console.log(w[kw]()));
                        showSplitLine();
                        _info_shown_flag = true;
                    }
                });
                if (_info_shown_flag) {
                    return true;
                }
                console.log("当前页面未捕获到布局信息");
                showSplitLine();
            }
        })();
        toast("完成布局信息捕获\n日志中可查看信息", "Long");
        threads.shutDownAll();
        engines.myEngine().forceStop();
    });
});