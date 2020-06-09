require("../Modules/EXT_GLOBAL_OBJ").load();
require("../Modules/EXT_DEVICE").load().getDisplay(true);

// let {execArgv: e_argv} = engines.myEngine();
let o = {};
// let cfg_conj;
// let sess_par = global.sess_par || {};
let sess_cfg = global.sess_cfg || {};
let $_sto = global.$$sto || {};
// let sto_cfg = global.sto_cfg || {};

/*
if (e_argv && e_argv.config_conj) {
    cfg_conj = e_argv.config_conj;
    o = sess_par[cfg_conj] || sess_cfg[cfg_conj];
} else {
    o = {
        l: cX(0.05), t: cY(0.05),
        r: cX(0.95), b: cY(0.95),
    };
}
*/

// o = {
//     l: cX(0.12),
//     t: cYx(0.25),
//     r: cX(0.88),
//     b: cY(0.45),
// };
let _region = require("../Modules/MODULE_STORAGE").create("af_cfg").get("config", {}).forest_balls_rect_region
    || require("../Modules/MODULE_DEFAULT_CONFIG").af.forest_balls_rect_region;
["l", "t", "r", "b"].forEach((k, i) => {
    o[k] = _region[i];
});

!function () {
    let rect, setRect;
    (setRect = () => rect = new android.graphics.Rect(o.l, o.t, o.r, o.b))();

    let win_ctrl = floaty.rawWindow(
        <vertical
            bg="#eeffffff" padding="16" id="ctrl"
            w="*" h="auto" layout_gravity="bottom"
        >
            <horizontal w="*">
                <button text="重置" layout_weight="1"/>
                <button id="btn_cancel" text="放弃" layout_weight="1"/>
                <button text="保存" layout_weight="1"/>
            </horizontal>
            <vertical w="*" margin="10" gravity="center">
                <text id="valueHex" gravity="center">此工具暂未开发完成</text>
            </vertical>
        </vertical>
    );
    win_ctrl.setSize(-1, -1);

    win_ctrl.btn_cancel.on("click", function () {
        clear();
    });

    let _dx = cX(0.1);
    let _dy = cYx(0.08);
    ui.post(() => {
        win_ctrl.ctrl.addView(setSeekbar({
            title: "左", nums: [o.l - _dx, o.l + _dx, o.l], key: "l",
        }));
        win_ctrl.ctrl.addView(setSeekbar({
            title: "上", nums: [o.t - _dy, o.t + _dy, o.t], key: "t",
        }));
        win_ctrl.ctrl.addView(setSeekbar({
            title: "右", nums: [o.r - _dx, o.r + _dx, o.r], key: "r",
        }));
        win_ctrl.ctrl.addView(setSeekbar({
            title: "下", nums: [o.b - _dy, o.b + _dy, o.b], key: "b",
        }));
    });

    threads.start(function () {
        events.observeKey();
        events.setKeyInterceptionEnabled("volume_down", true);
        events.onKeyDown("volume_down", function (e) {
            win_ctrl.getWidth()
                ? win_ctrl.setSize(0, 0)
                : win_ctrl.setSize(-1, -1);
        });
    });

    let win_canvas = floaty.rawWindow(
        <canvas id="canvas"
        />);
    win_canvas.setSize(-1, -1);
    win_canvas.setTouchable(false);

    let paint = new android.graphics.Paint();
    paint.setStrokeWidth(2);
    paint.setStyle(Paint.Style.STROKE);
    paint.setColor(colors.GREEN);

    win_canvas.canvas.on("draw", (canvas) => {
        canvas.drawColor(
            android.graphics.Color.TRANSPARENT,
            android.graphics.PorterDuff.Mode.CLEAR
        );
        canvas.drawRect(rect, paint);
    });

    setInterval(setRect, 100);

    // tool function(s) //

    function clear() {
        win_ctrl.close();
        win_canvas.close();
        threads.shutDownAll();
        exit();
    }

    function setSeekbar(opt) {
        let {title, unit, config_conj, nums, key} = opt;
        let [min, max, init] = nums;
        if (isNaN(+min)) min = 0;
        if (isNaN(+init)) {
            let _init = sess_cfg[config_conj] || $_sto.def.af[config_conj];
            init = isNaN(+_init) ? min : _init;
        }
        if (isNaN(+max)) max = 100;

        let new_view = ui.inflate(
            <vertical>
                <horizontal margin="6 9" w="*">
                    <text
                        id="_text" gravity="left" w="54"
                        layout_gravity="left"
                    />
                    <seekbar
                        id="_seekbar" w="*"
                        style="@android:style/Widget.Material.SeekBar"
                        layout_gravity="center"
                    />
                </horizontal>
            </vertical>
        );
        new_view._seekbar.setMax(max - min);
        new_view._seekbar.setProgress(init - min);

        let update = (src) => {
            return new_view._text.setText(
                (title ? title + ": " : "") + src.toString() +
                (unit ? " " + unit : "")
            );
        }

        update(init);
        new_view._seekbar.setOnSeekBarChangeListener(
            new android.widget.SeekBar.OnSeekBarChangeListener({
                onProgressChanged(seek_bar, progress, from_user) {
                    let result = progress + min;
                    update(result);
                    $$save.session(config_conj, result);
                },
                onStartTrackingTouch: (seek_bar) => void 0,
                onStopTrackingTouch: (seek_bar) => void 0,
            })
        );
        return new_view;
    }
}();