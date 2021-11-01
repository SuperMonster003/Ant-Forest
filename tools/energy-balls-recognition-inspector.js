require('../modules/mod-global');
let {imagesx} = require('../modules/ext-images');
let {dialogsx} = require('../modules/ext-dialogs');
let {storagesx} = require('../modules/ext-storages');

dialogsx.builds([
    '能量球识别测试工具',
    '此测试工具用于识别能量球\n' +
    '手动进入森林页面可查看识别情况\n\n' +
    '切勿长时间连续使用\n' +
    '否则可能导致设备发热严重\n\n' +
    '过程中按"音量减"按钮可结束测试\n\n' +
    '结束时Auto.js可能会崩溃\n' +
    '崩溃后会丢失当前的控制台日志\n' +
    '且可能需要重新开启无障碍服务\n' +
    '因此切勿频繁使用此测试工具',
    0, 'Q', '开始', 1,
]).on('negative', d => d.dismiss()).on('positive', (d) => {
    toast('手动进入任意一个森林页面');
    threads.start(_);
    d.dismiss();
}).show();

function _() {
    let $_cfg = {};
    let $_sto = {};
    let _wins = [];
    Object.assign($_sto, {
        cfg: storagesx.create('af_cfg'),
        def: storagesx['@default'],
    });

    Object.assign($_cfg, $_sto.def.af, $_sto.cfg.get('config', {}));

    let _balls_data;

    threads.start(function () {
        events.observeKey();
        events.setKeyInterceptionEnabled('volume_down', true);
        events.onceKeyDown('volume_down', function () {
            toast('停止当前测试脚本');
            _wins.forEach((w) => {
                w.close();
                sleep(100);
            });
            sleep(900);
            exit();
        });
    });

    threads.start(function () {
        while (1) {
            _balls_data = imagesx.findAFBallsByHough().expand();
            sleep(10);
        }
    });

    while (!(_balls_data || []).length) {
        sleep(200);
    }
    for (let i = 0; i < 6; i += 1) {
        _drawBall(i);
    }

    function _drawBall(i) {
        let draw_w = 6;
        let win = floaty.rawWindow(<vertical>
            <canvas id="canvas" layout_weight="1"/>
        </vertical>);
        _wins.push(win);
        win.setTouchable(false);
        let [x, y, r] = [];
        let [_x, _y, _r] = [];
        setInterval(() => {
            let {x: _a, y: _b, r: _c} = _balls_data[i] || {};
            if (_a && _b && _c) {
                [x, y, r] = [_a, _b, _c];
                if (x !== _x || y !== _y || r !== _r) {
                    [_x, _y, _r] = [x, y, r];
                    let _sz = r * 2 + draw_w * 2;
                    if (i < _balls_data.length) {
                        win.setSize(_sz, _sz);
                        win.setPosition(x - r, y - r);
                    }
                }
            }
        }, 50);

        let _itv = setInterval(function () {
            if (x && y && r) {
                _paint();
                clearInterval(_itv);
            }
        }, 50);

        function _paint() {
            let c_map = {
                naught: '#FAFAFA',
                ripe: '#43A047',
                water: '#D09211',
            };

            let paint = new Paint();
            paint.setStyle(Paint.Style.STROKE);

            win['canvas'].on('draw', function (canvas) {
                canvas.drawColor(android.graphics.Color.TRANSPARENT, android.graphics.PorterDuff.Mode.CLEAR);
                if (i < _balls_data.length) {
                    let color = c_map[_balls_data[i].type];
                    paint.setARGB(255, colors.red(color), colors.green(color), colors.blue(color));
                    paint.setStrokeWidth(5);
                    let s = r + draw_w / 2;
                    canvas.drawRect(s - r, s - r, s + r, s + r, paint);
                }
            });
        }
    }
}