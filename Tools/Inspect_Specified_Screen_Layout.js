threads.start(function () {
    toast("请在目标页面按\"音量减\"键");
    events.observeKey();
    events.onKeyDown("volume_down", function (event) {
        showCurrentScreenLayoutInfo();
        toast("完成布局信息捕获\n日志中可查看信息");
        threads.shutDownAll();
        engines.myEngine().forceStop();
    });
});

function showCurrentScreenLayoutInfo() {
    showSplitLine();
    showInfo(["text", "desc", "id"]) || showSplitLine();

    // tool function(s) //

    function showInfo(key_word) {
        let key_w = Object.prototype.toString.call(key_word).slice(8, -1) === "Array" ? key_word.slice() : [key_word];
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
}

function showSplitLine(extra_str, style, params) {
    let _extra_str = extra_str || "";
    let _split_line = "";
    if (style === "dash") {
        for (let i = 0; i < 16; i += 1) _split_line += "- ";
        _split_line += "-";
    } else {
        for (let i = 0; i < 32; i += 1) _split_line += "-";
    }
    return !!~console.log(_split_line + _extra_str);
}