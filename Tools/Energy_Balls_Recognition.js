require("../Modules/EXT_IMAGES").load();
require("../Modules/EXT_GLOBAL_OBJ").load();
require("../Modules/EXT_DEVICE").load().getDisplay(true);
require("../Modules/EXT_DIALOGS").load();

dialogs.builds([
    "能量球识别测试工具",
    "此测试工具用于识别能量球\n" +
    "手动进入森林页面可查看识别情况\n\n" +
    "请勿长时间连续使用\n" +
    "否则可能导致设备发热严重\n\n" +
    "过程中按\"音量减\"按钮可结束测试\n\n" +
    "结束时Auto.js可能会崩溃\n" +
    "崩溃后会丢失当前的控制台日志\n" +
    "且可能需要重新开启无障碍服务\n" +
    "因此请勿频繁使用此测试工具",
    0, "放弃", "开始", 1
]).on("negative", d => d.dismiss()).on("positive", (d) => {
    toast("请手动进入任意一个森林页面");
    threads.start(_);
    d.dismiss();
}).show();

function _() {
    let $$cfg = {};
    let $$sto = {};
    let _mod_sto = require("./Modules/MODULE_STORAGE");
    Object.assign($$sto, {
        cfg: _mod_sto.create("af_cfg"),
        def: require("./Modules/MODULE_DEFAULT_CONFIG"),
    });

    Object.assign($$cfg, $$sto.def.settings, $$sto.cfg.get("config", {}));

    let _orange = {
        col_arr: $$cfg.help_ball_ident_colors,
        thrd: $$cfg.help_ball_threshold,
    };
    let _ripe = {
        col: $$cfg.ripe_ball_ident_color,
        thrd: $$cfg.ripe_ball_threshold,
    };
    let _src_img_stg = $$cfg.hough_src_strategy;
    let _results_stg = $$cfg.hough_results_strategy;
    let _min_dist = cX($$cfg.min_balls_distance);
    let _region = $$cfg.fri_forest_balls_region
        .map((v, i) => i % 2 ? v : cX(v));
    let _balls_data;

    threads.start(function () {
        events.observeKey();
        events.setKeyInterceptionEnabled("volume_down", true);
        events.onceKeyDown("volume_down", function (e) {
            toast("停止当前测试脚本");
            global.windows && global.windows.forEach((w) => {
                w.close();
                sleep(100);
            });
            sleep(900);
            exit();
        });
    });

    threads.start(function () {
        while (~sleep(10)) {
            _balls_data = _parse(images.capt());
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
        if (!global.windows) {
            global.windows = [];
        }
        let win = floaty.rawWindow(<vertical>
            <canvas id="canvas" layout_weight="1"/>
        </vertical>);
        global.windows.push(win);
        win.setTouchable(false);
        let [x, y, r] = [];
        let [_x, _y, _z] = [];
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
                naught: "#fafafa",
                ripe: "#43a047",
                orange: "#ff9100",
            };

            let paint = new Paint();
            paint.setStyle(Paint.Style.STROKE);

            win.canvas.on("draw", function (canvas) {
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

    function _parse(capt) {
        if (!capt || images.isRecycled(capt)) {
            capt = images.capt();
        }
        let _balls_data = [];
        let [_l, _t, _r, _b] = _region;
        let [_w, _h] = [_r - _l, _b - _t];
        let _gray = images.grayscale(capt);
        let _adapt_thrd = _src_img_stg.adapt_thrd && images.adaptiveThreshold(
            _gray, 255, "GAUSSIAN_C", "BINARY_INV", 9, 6
        );
        let _med_blur = _src_img_stg.med_blur && images.medianBlur(
            _gray, 9
        );
        let _blur = _src_img_stg.blur && images.blur(
            _gray, 9, [-1, -1], "REPLICATE"
        );
        let _blt_fltr = _src_img_stg.blt_fltr && images.bilateralFilter(
            _gray, 9, 20, 20, "REPLICATE"
        );

        let _balls = []
            .concat(_getBalls(_src_img_stg.gray && _gray))
            .concat(_getBalls(_adapt_thrd))
            .concat(_getBalls(_med_blur))
            .concat(_getBalls(_blur))
            .concat(_getBalls(_blt_fltr))
            .sort(_sortBallsCoords);

        _reclaimImages();

        if (_balls.length) {
            _antiOverlap();
            _symmetrical();
            _linearInterpolate();
            _addBalls();
        }

        return _balls_data;

        // tool function(s) //

        function _reclaimImages() {
            images.reclaim(
                _gray, _adapt_thrd, _med_blur, _blur, _blt_fltr
            );
            _gray = _adapt_thrd = _med_blur = _blur = _blt_fltr = null;
        }

        function _antiOverlap() {
            if (!_results_stg.anti_ovl) {
                return;
            }
            let _min = _min_dist;
            for (let i = 1; i < _balls.length; i += 1) {
                if (_balls[i].x - _balls[i - 1].x < _min) {
                    _balls.splice(i--, 1);
                }
            }
        }

        function _symmetrical() {
            if (!_results_stg.symmetrical) {
                return;
            }
            if ($$1(_balls.length)) {
                let {x: _x} = _balls[0];
                if (Math.abs(_x - halfW) <= _min_dist) {
                    return;
                }
            }

            let _right_ball = _balls[_balls.length - 1];
            let _left_ball = _balls[0];
            let _max = _right_ball.x;
            let _min = _left_ball.x;
            let _ext = Math.max(_max - halfW, halfW - _min);
            if (_min - (halfW - _ext) > _min_dist) {
                _balls.unshift({
                    x: halfW - _ext,
                    y: _right_ball.y,
                    r: _right_ball.r,
                    computed: true,
                });
            } else if (halfW + _ext - _max > _min_dist) {
                _balls.push({
                    x: halfW + _ext,
                    y: _left_ball.y,
                    r: _left_ball.r,
                    computed: true,
                });
            }
        }

        function _linearInterpolate() {
            if (!_results_stg.linear_itp) {
                return;
            }
            let _step = _getMinStep();

            for (let i = 1; i < _balls.length; i += 1) {
                let _diff = _balls[i].x - _balls[i - 1].x;
                let _dist = Math.round(_diff / _step);
                if (_dist < 2) {
                    continue;
                }
                let _dx = _diff / _dist;
                let _dy = (_balls[i].y - _balls[i - 1].y) / _dist;
                let _data = [];
                for (let k = 1; k < _dist; k += 1) {
                    _data.push({
                        x: _balls[i - 1].x + _dx * k,
                        y: _balls[i - 1].y + _dy * k,
                        r: (_balls[i].r + _balls[i - 1].r) / 2,
                        computed: true,
                    });
                }
                _balls.splice.apply(_balls, [i, 0].concat(_data));
                i += _data.length;
            }

            // tool function(s) //

            function _getMinStep() {
                let _step = Infinity;
                _balls.forEach((v, i, a) => {
                    if (i) {
                        let _diff = a[i].x - a[i - 1].x;
                        if (_diff < _step) {
                            _step = _diff;
                        }
                    }
                });
                return _step;
            }
        }

        function _addBalls() {
            _balls.forEach((o) => {
                if (_isOrangeBall(o)) {
                    return _addBall(o, "orange");
                }
                if (_isRipeBall(o)) {
                    return _addBall(o, "ripe");
                }
                _addBall(o, "naught");
            });

            // tool function(s) //

            function _isOrangeBall(o) {
                let _ctx = o.x + cX(52);
                let _cty = o.y + cYx(57);
                let _d = o.r / 4;
                let _col = _orange.col_arr;
                for (let i = 0, l = _col.length; i < l; i += 1) {
                    let _mch = images.findColor(capt, _col[i], {
                        region: [_ctx - _d, _cty - _d, _d * 2, _d * 2],
                        threshold: _orange.thrd,
                    });
                    if (_mch) {
                        return _mch;
                    }
                }
            }

            function _isRipeBall(o) {
                let _d = o.r / 4;
                return images.findColor(capt, _ripe.col, {
                    region: [o.x - _d, o.y - _d, _d * 2, _d * 2],
                    threshold: _ripe.thrd,
                });
            }

            function _addBall(o, type) {
                let _pri = {
                    orange: 9,
                    ripe: 6,
                    naught: 3
                };
                let _data_idx = _getDataIdx(o);
                if (!~_data_idx) {
                    _balls_data.push(Object.assign({
                        type: type
                    }, o));
                } else if (_pri[type] > _pri[_balls_data[_data_idx].type]) {
                    _balls_data[_data_idx] = Object.assign({
                        type: type
                    }, o);
                }

                // tool function(s) //

                function _getDataIdx(o) {
                    let _l = _balls_data.length;
                    for (let i = 0; i < _l; i += 1) {
                        if (Math.abs(o.x - _balls_data[i].x) < _min_dist / 2) {
                            return i;
                        }
                    }
                    return -1;
                }
            }
        }

        function _getBalls(img, par1, par2) {
            if (!img) {
                return [];
            }
            return images.findCircles(img, {
                dp: 1,
                minDist: _min_dist,
                minRadius: cX(0.06),
                maxRadius: cX(0.078),
                param1: par1 || 15,
                param2: par2 || 15,
                region: [_l, _t, _w, _h],
            }).map((o) => ({
                x: o.x + _l,
                y: o.y + _t,
                r: Math.fix(o["radius"], [2]),
            })).sort(_sortBallsCoords);
        }

        function _sortBallsCoords(a, b) {
            if (a.x === b.x) {
                return 0;
            }
            return a.x > b.x ? 1 : -1;
        }
    }
}