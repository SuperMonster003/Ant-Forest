require('../modules/mod-global');
require('../modules/ext-ui');
require('../modules/ext-device');
let {dialogsx} = require('../modules/ext-dialogs');
let {storagesx} = require('../modules/ext-storages');

let [_dx, _dy] = [cX(0.35), cY(0.45)];
let _rect = [cX(0.35), cY(0.45), cX(0.65), cY(0.55)];
let [_l, _t, _r, _b] = _rect;
let $_sto = storagesx.create('af_cfg');
let _o = {
    rect: _rect,
    af_rect: $_sto.get('config', {}).eballs_recognition_region
        .map((v, i) => i % 2 ? cYx(v, true) : cX(v, true)),
    seekbar: [
        {title: '左', range: [_l - _dx, _l + _dx, _l]},
        {title: '上', range: [_t - _dy, _t + _dy, _t]},
        {title: '右', range: [_r - _dx, _r + _dx, _r]},
        {title: '下', range: [_b - _dy, _b + _dy, _b]},
    ],
    onConfirm(rect) {
        _clearAll();
        let _res = rect.join(', ');
        setClip(_res);
        alert('\n[' + _res + ']\n\n结果已复制到剪贴板');
    },
};

let _sess_rect = _o.rect.slice();
let _win_ctrl, _win_canvas, _rect_canvas;
let _seekbar_views = [];

_setRect();
_setWinCtrl();
_setKeyDownLsn();
_setWinCanvas();

setInterval(_setRect, 100);

// tool function(s) //

function _setRect() {
    let _args = [null].concat(_sess_rect);
    _rect_canvas = new (Function.prototype.bind.apply(android.graphics.Rect, _args));
}

function _setHint() {
    let [_l, _t, _r, _b] = _sess_rect;
    let _rect_text = [[_l, _t], [_r, _b]]
        .map(a => a.join(' , ')).join('  -  ');
    _win_ctrl.hint.text('Rect  [ ' + _rect_text + '\x20]\x20');
}

function _setWinCtrl() {
    _win_ctrl = floaty.rawWindow(
        <vertical bg="#E4DCEEEC" padding="16" id="ctrl"
                  w="*" h="auto" layout_gravity="bottom">
            <horizontal w="*">
                <x-button id="btn_help" text="帮助" layout_weight="1" backgroundTint="#90CAF9"/>
                <x-button id="btn_restore" text="重置" layout_weight="1" backgroundTint="#FFE0B2"/>
                <x-button id="btn_cancel" text="放弃" layout_weight="1" backgroundTint="#B0BEC5"/>
                <x-button id="btn_confirm" text="保存" layout_weight="1" backgroundTint="#81C784"/>
            </horizontal>
            <vertical w="*" margin="10" gravity="center">
                <x-text id="hint" gravity="center" text="按 '帮助' 按钮获得详细支持"/>
            </vertical>
        </vertical>);
    _win_ctrl.setSize(-1, -1);
    _win_ctrl['btn_cancel'].on('click', () => {
        typeof _o.onCancel === 'function' && _o.onCancel(_sess_rect);
        _clearAll();
        exit();
    });
    _win_ctrl['btn_confirm'].on('click', () => _o.onConfirm(_sess_rect));
    _win_ctrl['btn_confirm'].on('long_click', (e) => {
        e.consumed = true;
        _win_ctrl.setSize(0, 0);
        dialogsx
            .builds([
                '提示', '' +
                '即将将当前的数据保存至\n' +
                '蚂蚁森林项目的配置文件\n' +
                '确定要保存吗\n\n' +
                '* 此操作不可撤销\n' +
                '* 如需恢复配置默认值\n' +
                '-- 可在配置工具找到相应的\n' +
                '-- 设置项点击"使用默认值"按钮',
                0, 'Q', '确定保存',
            ])
            .on('negative', (d) => {
                d.dismiss();
                _win_ctrl.setSize(-1, -1);
            })
            .on('positive', (d) => {
                d.dismiss();

                $_sto.put('config', {
                    eballs_recognition_region: _sess_rect
                        .map((v, i) => i % 2 ? cYx(v, true) : cX(v, true)),
                });

                toast('数据已存入项目配置文件');
                _clearAll();
                exit();
            })
            .show();
    });
    _win_ctrl['btn_restore'].on('click', () => {
        let _rect = _o.rect;
        if (_rect) {
            _sess_rect = _rect.slice();
            _resetSeekbars(_rect);
        }
    });
    _win_ctrl['btn_restore'].on('long_click', (e) => {
        e.consumed = true;
        let _rect = _o.af_rect;
        if (_rect) {
            _sess_rect = _rect.slice();
            _resetSeekbars(_rect);
        }
    });
    _win_ctrl['btn_help'].on('click', () => {
        dialogsx.builds([
            '帮助与提示',
            '"音量减/VOL-"键隐藏/显示控制面板\n\n' +
            '点击"重置"设置会话开始前的数据\n' +
            '长按"重置"设置蚂蚁森林项目' +
            '"森林页面能量球识别区域"配置参数\n\n' +
            '点击"保存"将当前数据复制到剪切板\n' +
            '长按"保存"将当前数据直接保存并应用到' +
            '蚂蚁森林项目"森林页面能量球识别区域"配置参数\n\n' +
            '* 控制面板隐藏时方可操控屏幕\n' +
            '-- 否则只能操作滑动条及控制按钮',
            0, 0, 'B', 1,
        ]).on('positive', d => d.dismiss()).show();
    });

    ui.post(() => {
        _o.seekbar.forEach((o, i) => {
            _win_ctrl.ctrl.addView(_seekbar_views[i] = _setSeekbar(o, i));
        });
    });
}

function _setKeyDownLsn() {
    threads.start(function () {
        events.observeKey();
        events.setKeyInterceptionEnabled('volume_down', true);
        events.onKeyDown('volume_down', function () {
            _win_ctrl.getWidth()
                ? _win_ctrl.setSize(0, 0)
                : _win_ctrl.setSize(-1, -1);
        });
    });
}

function _setWinCanvas() {
    _win_canvas = floaty.rawWindow(<canvas id="canvas"/>);
    _win_canvas.setSize(-1, -1);
    _win_canvas.setTouchable(false);

    let _paint = new android.graphics.Paint();
    _paint.setStrokeWidth(2);
    _paint.setStyle(Paint.Style.STROKE);
    _paint.setColor(colors.GREEN);

    _win_canvas.canvas.on('draw', (canvas) => {
        let _color = android.graphics.Color.TRANSPARENT;
        let _mode = android.graphics.PorterDuff.Mode.CLEAR;
        canvas.drawColor(_color, _mode);
        canvas.drawRect(_rect_canvas, _paint);
    });
}

function _clearAll() {
    _win_ctrl.close();
    _win_canvas.close();
    threads.shutDownAll();
}

function _setSeekbar(opt, idx) {
    let {title, unit, config_conj, range} = opt;
    let [min, max, init] = range;
    if (isNaN(+min)) min = 0;
    if (isNaN(+init)) {
        let _init = $_sto['def']['af'][config_conj];
        init = isNaN(+_init) ? min : _init;
    }
    if (isNaN(+max)) max = 100;

    let new_view = ui.inflate(
        <vertical>
            <horizontal margin="6 9" w="*">
                <x-text id="_text" gravity="left" w="54" layout_gravity="left"/>
                <seekbar id="_seekbar" w="*" layout_gravity="center"
                    style="@android:style/Widget.Material.SeekBar"/>
            </horizontal>
        </vertical>);
    new_view['_seekbar'].setMax(max - min);
    new_view['_seekbar'].setProgress(init - min);

    let update = (src) => {
        let _s = (title ? title + ':\x20' : '') + src.toString() + (unit ? '\x20' + unit : '');
        return new_view['_text'].setText(_s);
    };

    update(init);

    let _listener = new android.widget.SeekBar.OnSeekBarChangeListener({
        onProgressChanged(seek_bar, progress) {
            let result = progress + min;
            update(result);
            _sess_rect[idx] = result;
            _setHint();
        },
        onStartTrackingTouch: () => void 0,
        onStopTrackingTouch: () => void 0,
    });
    new_view['_seekbar'].setOnSeekBarChangeListener(_listener);

    return new_view;
}

function _resetSeekbars(rect) {
    _seekbar_views.forEach((view, i) => {
        let _init = rect[i];
        let _min = _o.seekbar[i].range[0];
        view['_seekbar'].setProgress(_init - _min);
    });
}