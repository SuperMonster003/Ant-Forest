let {
    showSplitLine,
    classof,
} = require("../Modules/MODULE_MONSTER_FUNC");

threads.start(function () {
    toast('请在目标页面按"音量减"键');
    events.observeKey();
    events.onKeyDown("volume_down", function (event) {
        (function showCurrentScreenLayoutInfo() {
            showSplitLine();
            showInfo(["text", "desc", "id"]) || showSplitLine();

            // tool function(s) //

            function showInfo(key_word) {
                let key_w = classof(key_word, "Array") ? key_word.slice() : [key_word];
                let info_shown_flag = false;
                key_w.forEach(kw => {
                    let nodes = selector()[kw + "Matches"](/.+/).find();
                    if (!nodes.length) return;
                    console.log("# " + kw + " #");
                    showSplitLine();
                    nodes.forEach(node => console.log(node[kw]()));
                    showSplitLine();
                    info_shown_flag = true;
                });
                if (info_shown_flag) return true;
                console.log("当前页面未捕获到布局信息");
                showSplitLine();
            }
        })();
        toast("完成布局信息捕获\n日志中可查看信息");
        threads.shutDownAll();
        engines.myEngine().forceStop();
    });
});