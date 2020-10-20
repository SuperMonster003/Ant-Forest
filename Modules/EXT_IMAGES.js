global.imagesx = typeof global.imagesx === "object" ? global.imagesx : {};

require("./MODULE_MONSTER_FUNC").load("debugInfo", "timeRecorder");
require("./EXT_GLOBAL_OBJ").load("Math");
require("./EXT_DEVICE").load("getDisplay");

let ext = {
    _initIfNeeded() {
        runtime.getImages().initOpenCvIfNeeded();
    },
    _toPointArray(points) {
        let _arr = [];
        for (let i = 0; i < points.length; i++) {
            _arr[i] = points[i];
        }
        return _arr;
    },
    _buildRegion(region, img) {
        if (region === undefined) {
            region = [];
        }
        let x = region[0] === undefined ? 0 : region[0];
        let y = region[1] === undefined ? 0 : region[1];
        let width = region[2] === undefined ? img.getWidth() - x : region[2];
        let height = region[3] === undefined ? (img.getHeight() - y) : region[3];
        let r = new org.opencv.core.Rect(x, y, width, height);
        if (x < 0 || y < 0 || x + width > img.width || y + height > img.height) {
            throw new Error("out of region: " +
                "region = [" + [x, y, width, height] + "], " +
                "image.size = [" + [img.width, img.height] + "]"
            );
        }
        return r;
    },
    getName(img) {
        let img_str = img.toString().split("@")[1];
        return img_str ? "@" + img_str.match(/\w+/)[0] : "(已提前回收)";
    },
    getMean(capt) {
        /** @type {number[]} */
        let _v = org.opencv.core.Core.mean((capt || ext.capt()).getMat()).val;
        let [R, G, B] = _v;
        let [_R, _G, _B] = [R, G, B].map(x => Number(x.toFixed(2)));
        let _arr = [_R, _G, _B];
        return {
            data: {R: _R, G: _G, B: _B},
            arr: _arr,
            std: Number(Math.std(_arr)),
            string: "[" + _arr.join(", ") + "]",
        };
    },
    isRecycled(img) {
        if (!img) return true;
        try {
            img.getHeight();
        } catch (e) {
            return !!e.message.match(/has been recycled/);
        }
    },
    isImageWrapper: (img) => {
        return img
            && typeof img === "object"
            && img["getClass"]
            && img.toString().match(/ImageWrapper/);
    },
    reclaim: _reclaim,
    capt() {
        let _max = 10;
        while (_max--) {
            try {
                _permitCapt();
                let _img = images.captureScreen();
                // prevent "_img" from being auto-recycled
                let _copy = images.copy(_img);
                _reclaim(_img);
                return _copy;
            } catch (e) {
                sleep(240);
            }
        }
        let _msg = "截取当前屏幕失败";
        console.error(_msg);
        toast(_msg);
        exit();
    },
    capture() {
        return this.capt.apply(this);
    },
    captureScreen() {
        return this.capt.apply(this);
    },
    requestScreenCapture: _requestScreenCapture,
    tryRequestScreenCapture: _permitCapt, // legacy
    permit: _permitCapt,
    permitCapt: _permitCapt,
    matchTpl(capt, tpl, opt) {
        let _capt;
        let _no_capt_fg;
        if (!capt) {
            _capt = this.capt();
            _no_capt_fg = true;
        } else {
            _capt = capt;
        }

        let _opt = opt || {};

        let _name = _opt.name;
        let _path = "";
        let _res_range = [];
        if (_name) {
            let _dir = files.getSdcardPath() + "/.local/Pics/";
            files.createWithDirs(_dir);
            _path = _dir + _name + ".png";
        }

        let _tpl = _bySto(_name) || _byAttempt(tpl);
        if (_tpl) {
            let _par = {};
            let _max = _opt.max;
            let _thrd = _opt.threshold_result;
            if (_max) {
                _par.max = _max;
            }
            if (_thrd) {
                _par.threshold = _thrd;
            }

            let _res = images.matchTemplate(_capt, _tpl, _par);
            if (!_res_range[0]) {
                let _w = _tpl.getWidth() * 720 / W;
                _res_range[0] = +_w.toFixed(2);
            }
            _res.range = _res_range;

            if (_no_capt_fg) {
                _capt.recycle();
                _capt = null;
            }

            return _res;
        }
        return null;

        // tool function(s) //

        function _bySto(name) {
            if (!name || !files.exists(_path)) {
                return;
            }
            let _af = typeof $$af !== "undefined";
            let _key = "img_" + name;
            if (_af && $$af[_key]) {
                return $$af[_key];
            }
            let _img = images.read(_path);
            if (!_af) {
                $$af = {};
            }
            return $$af[_key] = _img;
        }

        function _byAttempt(tpl) {
            if (!tpl) {
                return null;
            }
            let _range = _opt.range || [0, 0];
            let [_min, _max] = _range.map(x => cX(x));
            for (let i = _min; i <= _max; i += 1) {
                let _w = tpl.getWidth();
                let _h = tpl.getHeight();
                let _new_w = i || _w;
                let _new_h = Math.trunc(_h / _w * i);
                for (let j = 0; j <= 1; j += 1) {
                    let _resized = images.resize(
                        tpl, [_new_w, _new_h + j], "LANCZOS4"
                    );
                    let _recycleNow = () => {
                        _resized.recycle();
                        _resized = null;
                    };
                    let _par = {};
                    let _thrd = _opt.threshold_attempt;
                    let _region = _opt.region_attempt;
                    if (_thrd) {
                        _par.threshold = _thrd;
                    }
                    if (_region) {
                        _par.region = _region;
                    }
                    if (images.findImage(_capt, _resized, _par)) {
                        if (_name) {
                            debugInfo("已存储模板: " + _name);
                            images.save(_resized, _path);
                        }
                        _res_range = [+(i * 720 / W).toFixed(2), j];
                        return _resized;
                    }
                    _recycleNow();
                }
            }
        }
    },
    findColorInBounds(img, src, color, threshold) {
        if (!color) {
            throw ("findColorInBounds的color参数无效");
        }

        let _img = img || this.capt();
        let _srcMch = rex => src.toString().match(rex);

        let _bnd;
        if (_srcMch(/^Rect/)) {
            _bnd = src;
        } else if (_srcMch(/^((text|desc|id)(Matches)?)\(/)) {
            let _w = src.findOnce();
            if (!_w) {
                return null;
            }
            _bnd = _w.bounds();
        } else if (_srcMch(/UiObject/)) {
            _bnd = src.bounds();
        } else {
            throw Error("findColorInBounds的src参数类型无效");
        }

        let _x = _bnd.left;
        let _y = _bnd.top;
        let _w = _bnd.right - _x;
        let _h = _bnd.bottom - _y;

        let _mch = col => images.findColorInRegion(
            _img, col, _x, _y, _w, _h, threshold
        );
        if (!Array.isArray(color)) {
            return _mch(color) ? _bnd : null;
        }
        let _len = color.length;
        for (let i = 0; i < _len; i += 1) {
            if (!_mch(color[i])) {
                return null;
            }
        }
        return _bnd;
    },
    bilateralFilter(img, d, sigmaColor, sigmaSpace, borderType) {
        this._initIfNeeded();

        let mat = new com.stardust.autojs.core.opencv.Mat();
        let size = d || 0;
        let sc = sigmaColor || 40;
        let ss = sigmaSpace || 20;
        let type = (org.opencv.core.Core)["BORDER_" + (borderType || "DEFAULT")];

        org.opencv.imgproc.Imgproc.bilateralFilter(img["mat"], mat, size, sc, ss, type);

        return images.matToImage(mat);
    },
    /**
     * @typedef {
     *     EnergyBallsInfoClassified & EnergyBallsDuration & {expand: function(): EnergyBallsInfo[]}
     * } AfHoughBallsResult
     */
    /**
     * @returns AfHoughBallsResult
     */
    findAFBallsByHough(param) {
        timeRecorder("hough_beginning");
        /**
         * @type {{fill_up_pool: number, img_samples_processing: number}}
         */
        let _du = {};
        let _par = param || {};
        let _cfg = Object.assign(_$DEFAULT(), global.$$cfg || {}, _par.config || {});
        let _no_dbg = _par.no_debug_info;
        let _dbg_bak;
        let $_flag = global.$$flag = global.$$flag || {};

        _dbgBackup();

        let _src_img_stg = _cfg.hough_src_img_strategy;
        let _results_stg = _cfg.hough_results_strategy;
        let _min_dist = cX(_cfg.min_balls_distance);
        let _region = _cfg.forest_balls_rect_region
            .map((v, i) => (i % 2
                    ? v < 1 ? cY(v) : v
                    : v < 1 ? cX(v) : v
            ));

        /** @type {EnergyBallsInfo[]} */
        let _balls_data = [];
        /**
         * @typedef {{
         *     ripe?: EnergyBallsInfo[],
         *     orange?: EnergyBallsInfo[],
         *     naught?: EnergyBallsInfo[],
         *     water?: EnergyBallsInfo[]
         * }} EnergyBallsInfoClassified
         */
        /**
         * @type EnergyBallsInfoClassified
         */
        let _balls_data_o = {};
        let _pool = _par.pool || {
            data: [],
            interval: _cfg.forest_balls_pool_itv,
            limit: _cfg.forest_balls_pool_limit,
            get len() {
                return this.data.length;
            },
            get filled_up() {
                return this.len >= this.limit;
            },
            add(capt) {
                capt = capt || ext.capt();
                this.filled_up && this.reclaimLast();
                let _img_name = ext.getName(capt);
                debugInfo("添加森林页面采样: " + _img_name);
                this.data.unshift(capt);
            },
            reclaimLast() {
                let _last = this.data.pop();
                let _img_name = ext.getName(_last);
                debugInfo("森林页面采样已达阈值: " + this.limit);
                debugInfo(">移除并回收最旧样本: " + _img_name);
                ext.reclaim(_last);
                _last = null;
            },
            reclaimAll() {
                if (!this.len) {
                    return;
                }
                debugInfo("回收全部森林页面采样");
                this.data.forEach((capt) => {
                    let _img_name = ext.getName(capt);
                    ext.reclaim(capt);
                    debugInfo(">已回收: " + _img_name);
                    capt = null;
                });
                this.clear();
                debugInfo("森林页面样本已清空");
            },
            clear() {
                this.data.splice(0, this.len);
            },
        };
        let _capt = null;
        let _capture = (t) => {
            _capt = ext.capt();
            sleep(t || 0);
            return _capt;
        };

        _setWballExtFunction();
        _fillUpForestImgPool();
        _analyseEnergyBalls();

        _dbgRestore();

        /**
         * @typedef {{
         *     duration?: {_map: string[][], total: number, showDebugInfo: function(): void}
         *              & {fill_up_pool: number, img_samples_processing: number}
         * }} EnergyBallsDuration
         */
        /**
         * @type EnergyBallsDuration
         */
        let _du_o = _par.duration !== false ? {
            duration: Object.assign({
                _map: [
                    ["gray", "灰度化"],
                    ["adapt_thrd", "自适应阈值"],
                    ["med_blur", "中值滤波"],
                    ["blur", "均值滤波"],
                    ["blt_fltr", "双边滤波"],
                    ["img_samples_processing", "数据处理"],
                    ["total", "全部用时"],
                ],
                total: Number(timeRecorder("hough_beginning", "L")),
                showDebugInfo() {
                    debugInfo("__split_line__dash__");
                    debugInfo("图像填池: " +
                        this.fill_up_pool + "ms" + "  [ " +
                        _cfg.forest_balls_pool_itv + ", " +
                        _cfg.forest_balls_pool_limit + " ]"
                    );
                    this._map.forEach((arr) => {
                        let [_k, _v] = arr;
                        if (_k in this) {
                            if (this.hasOwnProperty(_k)) {
                                debugInfo(_v + ": " + this[_k] + "ms");
                            }
                        }
                    });
                    debugInfo("__split_line__dash__");
                },
            }, _du),
        } : {};

        return Object.assign(_balls_data_o, _du_o, {
            expand() {
                /** @type EnergyBallsInfo[] */
                let _data = [];
                for (let i in this) {
                    if (this.hasOwnProperty(i)) {
                        if (Array.isArray(this[i])) {
                            this[i].forEach(o => _data.push(o));
                        }
                    }
                }
                return _data;
            },
        });

        // tool function(s) //

        function _dbgBackup() {
            if (_no_dbg) {
                _dbg_bak = $_flag.debug_info_avail;
                $_flag.debug_info_avail = false;
            }
        }

        function _dbgRestore() {
            if (_no_dbg) {
                $_flag.debug_info_avail = _dbg_bak;
            }
        }

        function _setWballExtFunction() {
            if (!imagesx.inTreeArea) {
                imagesx.inTreeArea = (o) => {
                    // TODO...
                    let _tree_area = {x: halfW, y: cYx(670), r: cX(182)};
                    if (typeof o !== "object" || !o.r) {
                        throw Error("inTreeArea() invoked with invalid arguments");
                    }
                    let {x: _ox, y: _oy, r: _or} = o;
                    let {x: _zx, y: _zy, r: _zr} = _tree_area;
                    let _ct_dist_min = _or + _zr;
                    let _ct_dist = Math.sqrt(
                        Math.pow(_zy - _oy, 2) + Math.pow(_zx - _ox, 2)
                    );
                    return _ct_dist < _ct_dist_min;
                }
            }
            if (!imagesx.isWaterBall) {
                imagesx.isWaterBall = (o, capt, container) => {
                    let _capt = capt || ext.capt();
                    let _ctx = o.x;
                    let _cty = o.y;
                    let _offset = o.r / Math.SQRT2;
                    let _x_min = _ctx - _offset;
                    let _y_min = _cty - _offset;
                    let _x_max = _ctx + _offset;
                    let _y_max = _cty + _offset;
                    let _step = 2;
                    let _hue_max = _cfg.homepage_water_ball_max_hue_b0;
                    let _cty_max = cYx(626, -2); // TODO...
                    let _result = false;

                    if (_cty > _cty_max) {
                        return _result;
                    }

                    while (_x_min < _x_max && _y_min < _y_max) {
                        let _col = images.pixel(_capt, _x_min, _y_min);
                        let _red = colors.red(_col);
                        let _green = colors.green(_col);
                        // hue value in HSB mode without blue component
                        let _hue = 120 - (_red / _green) * 60;
                        if (isFinite(_hue) && _hue < _hue_max) {
                            if (Array.isArray(container)) {
                                container.push(o);
                            }
                            _result = true;
                            break;
                        }
                        _x_min += _step;
                        _y_min += _step;
                    }

                    if (!capt) {
                        ext.reclaim(_capt);
                        _capt = null;
                    }

                    return _result;
                };
            }
            if (!imagesx.isRipeBall) {
                imagesx.isRipeBall = (o, capt, container) => {
                    if (imagesx.inTreeArea(o)) {
                        return;
                    }
                    let _capt = capt || ext.capt();
                    let _offset = o.r * Math.SQRT1_2;
                    let _d = _offset * 2;
                    let _color = _cfg.ripe_ball_detect_color_val;
                    let _result = images.findColor(_capt, _color, {
                        region: [o.x - _offset, o.y - _offset, _d, _d],
                        threshold: _cfg.ripe_ball_detect_threshold,
                    });

                    if (!capt) {
                        ext.reclaim(_capt);
                        _capt = null;
                    }

                    if (_result) {
                        if (Array.isArray(container)) {
                            container.push(o);
                        }
                        return true;
                    }
                };
            }
            if (!imagesx.isOrangeBall) {
                imagesx.isOrangeBall = (o, capt, container) => {
                    if (imagesx.inTreeArea(o)) {
                        return false;
                    }
                    let _capt = capt || ext.capt();
                    let _w = cX(115);
                    let _dw = _w / 5 - 1;
                    let _h = cYx(30);
                    let _l = o.x + cYx(10) - _w / 2;
                    let _r = _l + _w;
                    let _t = o.y + o.r;
                    let _result = true;
                    let _pct_data = [];

                    while (_r - _l >= _dw) {
                        let _region = [_l, _t, _dw, _h];
                        let _pct = _getColMchPct(_region);
                        if (!_pct) {
                            _result = false;
                            break;
                        }
                        _pct_data.push(_pct);
                        _l += _dw;
                    }

                    if (!capt) {
                        ext.reclaim(_capt);
                        _capt = null;
                    }
                    if (_result) {
                        o.color_matched = {
                            percentage: _pct_data,
                            region: _region,
                        };
                        if (Array.isArray(container)) {
                            container.push(o);
                        }
                        return true;
                    }

                    // tool function(s) //

                    function _getColMchPct(region) {
                        let _thrd = _cfg.help_ball_detect_threshold;
                        let _color = _cfg.help_ball_detect_color_val;

                        let _cnt = ext.findAllPointsForColor(
                            _capt, _color, {threshold: _thrd, region: region}
                        ).length;
                        let _total = _w * _h;

                        return +(_cnt / _total).toFixed(3);
                    }
                };
            }
        }

        function _fillUpForestImgPool() {
            timeRecorder("fill_up_pool");
            let _max = _pool.limit + 1;
            while (_max--) {
                _pool.add(_capture());
                if (!_pool.len || _pool.filled_up) {
                    break;
                }
                sleep(_pool.interval);
            }
            _du.fill_up_pool = timeRecorder("fill_up_pool", "L");
        }

        function _analyseEnergyBalls() {
            debugInfo("分析森林页面样本中的能量球");
            _pool.data.forEach(_parse);
            debugInfo("森林页面样本能量球分析完毕");
            debugInfo("解析的能量球数量: " + _balls_data.length);
            _balls_data.forEach((o) => {
                _balls_data_o[o.type] = _balls_data_o[o.type] || [];
                _balls_data_o[o.type].push(o);
            });
            _par.pool && _par.keep_pool_data || _pool.reclaimAll();

            // tool function(s) //

            function _parse(capt) {
                if (!capt || ext.isRecycled(capt)) {
                    capt = ext.capt();
                }
                let [_l, _t, _r, _b] = _region;
                let [_w, _h] = [_r - _l, _b - _t];

                let _gray = _getImg("gray", true, () => images.grayscale(capt));

                let _adapt_thrd = _getImg("adapt_thrd", _src_img_stg.adapt_thrd,
                    () => images.adaptiveThreshold(
                        _gray, 255, "GAUSSIAN_C", "BINARY_INV", 9, 6
                    )
                );
                let _med_blur = _getImg("med_blur", _src_img_stg.med_blur,
                    () => images.medianBlur(_gray, 9)
                );
                let _blur = _getImg("blur", _src_img_stg.blur,
                    () => images.blur(_gray, 9, [-1, -1], "REPLICATE")
                );
                let _blt_fltr = _getImg("blt_fltr", _src_img_stg.blt_fltr,
                    () => ext.bilateralFilter(_gray, 9, 20, 20, "REPLICATE")
                );

                let _proc_key = "img_samples_processing";
                timeRecorder(_proc_key);

                /** @type {EnergyBallsBasicProp[]} */
                let _wballs = [];

                /** @type {EnergyBallsBasicProp[]} */
                let _balls = []
                    .concat(_getBalls(_src_img_stg.gray && _gray))
                    .concat(_getBalls(_adapt_thrd))
                    .concat(_getBalls(_med_blur))
                    .concat(_getBalls(_blur))
                    .concat(_getBalls(_blt_fltr))
                    .filter(_filterWball)
                    .sort(_sortX);

                _reclaimImages();

                if (_wballs.length + _balls.length) {
                    _antiOverlap();
                    _symmetrical();
                    _linearInterpolate();
                    _addBalls();
                }

                _du[_proc_key] = timeRecorder(_proc_key, "L");

                // tool function(s) //

                function _getImg(name, condition, imgFunc) {
                    if (condition) {
                        timeRecorder(name);
                        let _img = imgFunc();
                        let _et = timeRecorder(name, "L");
                        _du[name] ? _du[name] = _et : _du[name] += _et;
                        return _img;
                    }
                }

                function _reclaimImages() {
                    ext.reclaim(_gray, _adapt_thrd, _med_blur, _blur, _blt_fltr);
                    _gray = _adapt_thrd = _med_blur = _blur = _blt_fltr = null;
                }

                function _antiOverlap() {
                    if (_results_stg.anti_ovl) {
                        _antiX(_balls);
                        _antiX(_wballs);
                        _antiXY(_balls, _wballs);
                    }

                    // tool function(s) //

                    function _antiX(o) {
                        for (let i = 1; i < o.length; i += 1) {
                            if (o[i].x - o[i - 1].x < _min_dist) {
                                o.splice(i--, 1);
                            }
                        }
                    }

                    function _antiXY(sample, ref) {
                        let _chkSample = (smp, ref, i) => {
                            let _cond_x = Math.abs(ref.x - smp.x) < _min_dist;
                            let _cond_y = Math.abs(ref.y - smp.y) < _min_dist;
                            if (_cond_x && _cond_y) {
                                sample.splice(i--, 1);
                            }
                        };

                        if (ref) {
                            return ref.forEach((_ref) => {
                                for (let i = 0; i < sample.length; i += 1) {
                                    _chkSample(sample[i], _ref, i);
                                }
                            });
                        }
                        for (let i = 1; i < sample.length; i += 1) {
                            _chkSample(sample[i - 1], sample[i], i);
                        }
                    }
                }

                function _symmetrical() {
                    if (!_results_stg.symmetrical || !_balls.length) {
                        return;
                    }
                    if (_balls.length === 1) {
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
                        let _dist = _calcDist(_balls[i], _balls[i - 1]);
                        let _cnt = Math.floor(_dist / _step - 0.75) + 1;
                        if (_cnt < 2) {
                            continue;
                        }
                        let _dx = _dist / _cnt;
                        let _dy = (_balls[i].y - _balls[i - 1].y) / _cnt;
                        let _data = [];
                        for (let k = 1; k < _cnt; k += 1) {
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
                                let _diff = _calcDist(a[i], a[i - 1]);
                                if (_diff < _step) {
                                    _step = _diff;
                                }
                            }
                        });
                        return _step;
                    }

                    function _calcDist(p1, p2) {
                        return Math.sqrt(
                            Math.pow(p2.x - p1.x, 2) +
                            Math.pow(p2.y - p1.y, 2)
                        );
                    }
                }

                /**
                 * @typedef {"ripe"|"orange"|"naught"|"water"} EnergyBallsType
                 */
                function _addBalls() {
                    _wballs.map(_extProperties).forEach((o) => {
                        _addBall(o, "water");
                    });
                    _balls.map(_extProperties).forEach((o) => {
                        if (_isOrangeBall(o)) {
                            return _addBall(o, "orange");
                        }
                        if (_isRipeBall(o)) {
                            return _addBall(o, "ripe");
                        }
                        if (!imagesx.inTreeArea(o)) {
                            _addBall(o, "naught");
                        }
                    });

                    // tool function(s) //

                    function _isOrangeBall(o) {
                        if (!_par.no_orange_ball) {
                            return imagesx.isOrangeBall(o, capt);
                        }
                    }

                    function _isRipeBall(o) {
                        return imagesx.isRipeBall(o, capt);
                    }

                    /**
                     * @typedef {EnergyBallsBasicProp & EnergyBallsExtProp} EnergyBallsMixedProp
                     * @typedef {EnergyBallsMixedProp & {type: EnergyBallsType}} EnergyBallsInfo
                     */
                    /**
                     * @param {EnergyBallsMixedProp} o
                     * @param {EnergyBallsType} type
                     */
                    function _addBall(o, type) {
                        let _pri = {orange: 9, ripe: 6, naught: 3};
                        let _data_idx = _getDataIdx(o);
                        if (!~_data_idx) {
                            _balls_data.push(Object.assign({type: type}, o));
                        } else if (_pri[type] > _pri[_balls_data[_data_idx].type]) {
                            // low-priority data will be replaced with the one with higher priority
                            // eg: assumed that there was a ball with "ripe" property of type,
                            // another ball which was taken as the identical ball with the one above
                            // will replace "ripe" with "orange"
                            // however, "orange" won't be replace with "ripe" even "naught"
                            _balls_data[_data_idx] = Object.assign({type: type}, o);
                        }

                        // tool function(s) //

                        function _getDataIdx(o) {
                            let _l = _balls_data.length;
                            for (let i = 0; i < _l; i += 1) {
                                // take as identical balls
                                if (Math.abs(o.x - _balls_data[i].x) < _min_dist / 2) {
                                    return i;
                                }
                            }
                            return -1;
                        }
                    }

                    /**
                     * @typedef {{
                     *     x: number, y: number, r: number,
                     *     left: number, top: number, right: number, bottom: number,
                     *     width: function(): number, height: function(): number
                     * }} EnergyBallsExtProp
                     */
                    /**
                     * @returns EnergyBallsMixedProp
                     */
                    function _extProperties(o) {
                        let {x: _x, y: _y, r: _r} = o;
                        return Object.assign(o, {
                            left: _x - _r,
                            top: _y - _r,
                            right: _x + _r,
                            bottom: _y + _r,
                            // width and height were made functional
                            // just for better compatible with Auto.js
                            width: () => _r * 2,
                            height: () => _r * 2,
                        });
                    }
                }

                /**
                 * @typedef {{
                 *     x: number,
                 *     y: number,
                 *     r: number,
                 *     mean?: {
                 *         arr: [number, number, number],
                 *         std: number,
                 *         data: {R: number, B: number, G: number},
                 *         string: string
                 *     },
                 *     computed?: boolean
                 * }} EnergyBallsBasicProp
                 */
                /**
                 * @returns {EnergyBallsBasicProp[]|[]}
                 */
                function _getBalls(img, par1, par2) {
                    return !img ? [] : images
                        .findCircles(img, {
                            dp: 1,
                            minDist: _min_dist,
                            minRadius: cX(0.06),
                            maxRadius: cX(0.078),
                            param1: par1 || 15,
                            param2: par2 || 15,
                            region: [_l, _t, _w, _h],
                        })
                        .map((o) => {
                            // o.x and o.y are relative,
                            // yet x and y are absolute
                            let _x = Number(o.x + _l);
                            let _y = Number(o.y + _t);
                            let _r = Number(o.radius.toFixed(2));
                            let _d = _r * 2;
                            let _clip = images.clip(capt, _x - _r, _y - _r, _d, _d);
                            let _mean = ext.getMean(_clip);
                            _clip.recycle();
                            _clip = null;
                            return {x: _x, y: _y, r: _r, mean: _mean};
                        })
                        .filter(o => (
                            o.x - o.r >= _l &&
                            o.x + o.r <= _r &&
                            o.y - o.r >= _t &&
                            o.y + o.r <= _b &&
                            // excluding homepage cloud(s)
                            o.mean.std > 20
                        ))
                        .sort(_sortX);
                }

                function _sortX(a, b) {
                    return a.x === b.x ? 0 : a.x > b.x ? 1 : -1;
                }

                function _filterWball(o) {
                    if (o) {
                        if (imagesx.isRipeBall(o, capt)) {
                            return true;
                        }
                        return !imagesx.isWaterBall(o, capt, _wballs);
                    }
                }
            }
        }

        // updated: Oct 20, 2020
        function _$DEFAULT() {
            return {
                help_ball_detect_color_val: "#f99137",
                help_ball_detect_threshold: 91,
                ripe_ball_detect_color_val: "#deff00",
                ripe_ball_detect_threshold: 13,
                forest_balls_rect_region: [
                    cX(0.1), cYx(0.18), cX(0.9), cYx(0.45)
                ],
                hough_src_img_strategy: {
                    gray: true,
                    adapt_thrd: true,
                    med_blur: true,
                    blur: true,
                    blt_fltr: false,
                },
                hough_results_strategy: {
                    anti_ovl: true,
                    symmetrical: true,
                    linear_itp: true,
                },
                min_balls_distance: 0.09,
                forest_balls_pool_limit: 2,
                forest_balls_pool_itv: 240,
                homepage_water_ball_max_hue_b0: 44,
            };
        }
    },
    findAllPointsForColor(img, color, options) {
        this._initIfNeeded();
        let _finder = runtime.getImages().colorFinder;
        let _default_color_threshold = 4;
        let _opt = options || {};

        let _color = typeof color === 'string'
            ? colors.parseColor(color)
            : color;
        let _thrd = _opt.similarity
            ? Math.floor(255 * (1 - _opt.similarity))
            : _opt.threshold || _default_color_threshold;
        let _region = _opt.region
            ? this._buildRegion(_opt.region, img)
            : null;

        // compatible with Auto.js Pro versions
        _finder.__proto__ = Object.assign(_finder.__proto__ || {}, {
            findAllPointsForColor(image, color, threshold, rect) {
                let Core = org.opencv.core.Core;
                let Scalar = org.opencv.core.Scalar;
                let Mat = com.stardust.autojs.core.opencv.Mat;
                let OpenCVHelper = com.stardust.autojs.core.opencv.OpenCVHelper;

                let _screen_metrics = runtime.getScreenMetrics();

                let _mat_of_point = _findColorInner(image, color, threshold, rect);
                if (_mat_of_point === null) {
                    return [];
                }
                let _points = _mat_of_point.toArray();
                OpenCVHelper.release(_mat_of_point);

                if (rect !== null) {
                    for (let i = 0; i < _points.length; i++) {
                        _points[i].x = _screen_metrics.scaleX(_points[i].x + rect.x);
                        _points[i].y = _screen_metrics.scaleX(_points[i].y + rect.y);
                    }
                }
                return _points;

                // tool function(s) //

                function _findColorInner(image, color, threshold, rect) {
                    let _bi = new Mat();
                    let _lower_bound = new Scalar(
                        colors.red(color) - threshold,
                        colors.green(color) - threshold,
                        colors.blue(color) - threshold,
                        255
                    );
                    let _upper_bound = new Scalar(
                        colors.red(color) + threshold,
                        colors.green(color) + threshold,
                        colors.blue(color) + threshold,
                        255
                    );

                    if (rect === null) {
                        Core.inRange(image.getMat(), _lower_bound, _upper_bound, _bi);
                    } else {
                        let _mat = new Mat(image.getMat(), rect);
                        Core.inRange(_mat, _lower_bound, _upper_bound, _bi);
                        OpenCVHelper.release(_mat);
                    }

                    let _non_zero_pos = new Mat();
                    Core.findNonZero(_bi, _non_zero_pos);

                    let _result;
                    if (!_non_zero_pos.rows() || !_non_zero_pos.cols()) {
                        _result = null;
                    } else {
                        _result = OpenCVHelper.newMatOfPoint(_non_zero_pos);
                    }

                    OpenCVHelper.release(_bi);
                    OpenCVHelper.release(_non_zero_pos);

                    return _result;
                }
            },
        });

        return this._toPointArray(
            _finder.findAllPointsForColor(img, _color, _thrd, _region)
        );
    },
};

module.exports = ext;
module.exports.load = () => global.imagesx = ext;

// tool function(s) //

function _requestScreenCapture(landscape) {
    let aj_pkg = context.packageName;
    let is_pro = aj_pkg.match(/[Pp]ro/);
    let is_pro_7 = is_pro && app.autojs.versionName.match(/^Pro 7/);
    if (global._$_request_screen_capture) {
        return true;
    }
    global._$_request_screen_capture = threads.atomic(1);

    let javaImages = runtime.getImages();
    let ResultAdapter = require.call(global, "result_adapter");
    let ScreenCapturer = com.stardust.autojs.core.image.capture.ScreenCapturer;

    let orientation = typeof landscape !== "boolean"
        ? ScreenCapturer.ORIENTATION_AUTO
        : landscape
            ? ScreenCapturer.ORIENTATION_LANDSCAPE
            : ScreenCapturer.ORIENTATION_PORTRAIT;
    let adapter = !is_pro
        ? javaImages.requestScreenCapture(orientation)
        : javaImages.requestScreenCapture.apply(javaImages, [
            orientation /* orientation */,
            -1, /* width */
            -1, /* height */
            false /* isAsync */
        ].slice(0, is_pro_7 ? 3 : 4));

    if (ResultAdapter.wait(adapter)) {
        return true;
    }
    delete global._$_request_screen_capture;
}

/**
 * Just an insurance way of images.requestScreenCapture()
 *  to avoid infinite stuck or stalled without any hint or log
 * During this operation, permission prompt window
 *  will be confirmed (with checkbox checked if possible)
 *  automatically with effort
 * @param {object} [params]
 * @param {boolean} [params.debug_info_flag]
 * @param {boolean} [params.restart_this_engine_flag=true]
 * @param {object} [params.restart_this_engine_params]
 * @param {string} [params.restart_this_engine_params.new_file]
 *  - new engine task name with or without path or file extension name
 * <br>
 *     -- *DEFAULT* - old engine task <br>
 *     -- new file - like "hello.js", "../hello.js" or "hello"
 * @param {boolean} [params.restart_this_engine_params.debug_info_flag]
 * @param {number} [params.restart_this_engine_params.max_restart_engine_times=3]
 *  - max restart times for avoiding infinite recursion
 * @return {boolean}
 */
function _permitCapt(params) {
    if (global._$_request_screen_capture) {
        return true;
    }
    let $_und = x => typeof x === "undefined";
    let _par = params || {};
    let _debugInfo = (m, fg) => (
        typeof debugInfo === "function" ? debugInfo : debugInfoRaw
    )(m, fg, _par.debug_info_flag);

    _debugInfo("开始申请截图权限");

    let _waitForAction = (
        typeof waitForAction === "function" ? waitForAction : waitForActionRaw
    );
    let _messageAction = (
        typeof messageAction === "function" ? messageAction : messageActionRaw
    );
    let _clickAction = (
        typeof clickAction === "function" ? clickAction : clickActionRaw
    );
    let _getSelector = (
        typeof getSelector === "function" ? getSelector : getSelectorRaw
    );
    let _$$sel = _getSelector();

    if ($_und(_par.restart_this_engine_flag)) {
        _par.restart_this_engine_flag = true;
    } else {
        let _self = _par.restart_this_engine_flag;
        _par.restart_this_engine_flag = !!_self;
    }
    if (!_par.restart_this_engine_params) {
        _par.restart_this_engine_params = {};
    }
    if (!_par.restart_this_engine_params.max_restart_engine_times) {
        _par.restart_this_engine_params.max_restart_engine_times = 3;
    }

    _debugInfo("已开启弹窗监测线程");
    let _thread_prompt = threads.start(function () {
        let _sltr_remember = id("com.android.systemui:id/remember");
        let _sel_remember = () => _$$sel.pickup(_sltr_remember);
        let _rex_sure = /S(tart|TART) [Nn][Oo][Ww]|立即开始|允许/;
        let _sel_sure = type => _$$sel.pickup(_rex_sure, type);

        if (_waitForAction(_sel_sure, 5e3)) {
            if (_waitForAction(_sel_remember, 1e3)) {
                _debugInfo('勾选"不再提示"复选框');
                _clickAction(_sel_remember(), "w");
            }
            if (_waitForAction(_sel_sure, 2e3)) {
                let _w = _sel_sure();
                let _act_msg = '点击"' + _sel_sure("txt") + '"按钮';

                _debugInfo(_act_msg);
                _clickAction(_w, "w");

                if (!_waitForAction(() => !_sel_sure(), 1e3)) {
                    _debugInfo("尝试click()方法再次" + _act_msg);
                    _clickAction(_w, "click");
                }
            }
        }
    });

    let _thread_monitor = threads.start(function () {
        if (_waitForAction(() => !!_req_result, 3.6e3, 300)) {
            _thread_prompt.interrupt();
            return _debugInfo("截图权限申请结果: 成功");
        }
        if (typeof $$flag !== "undefined") {
            if (!$$flag.debug_info_avail) {
                $$flag.debug_info_avail = true;
                _debugInfo("开发者测试模式已自动开启", 3);
            }
        }
        if (_par.restart_this_engine_flag) {
            _debugInfo("截图权限申请结果: 失败", 3);
            try {
                let _m = android.os.Build.MANUFACTURER.toLowerCase();
                if (_m.match(/xiaomi/)) {
                    _debugInfo("__split_line__dash__");
                    _debugInfo("检测到当前设备制造商为小米", 3);
                    _debugInfo("可能需要给Auto.js以下权限:", 3);
                    _debugInfo('>"后台弹出界面"', 3);
                    _debugInfo("__split_line__dash__");
                }
            } catch (e) {
                // nothing to do here
            }
            if (restartThisEngine(_par.restart_this_engine_params)) {
                return;
            }
        }
        _messageAction("截图权限申请失败", 8, 1, 0, 1);
    });

    let _req_result = _requestScreenCapture(false);
    _thread_monitor.join();
    return _req_result;

    // raw function(s) //

    function getSelectorRaw() {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let sel = selector();
        sel.__proto__ = sel.__proto__ || {};
        if (typeof sel.__proto__.pickup !== "function") {
            sel.__proto__.pickup = filter => classof(filter) === "JavaObject"
                ? filter.toString().match(/UiObject/)
                    ? filter
                    : filter.findOnce()
                : typeof filter === "string"
                    ? desc(filter).findOnce() || text(filter).findOnce()
                    : classof(filter) === "RegExp"
                        ? descMatches(filter).findOnce() || textMatches(filter).findOnce()
                        : null;
        }
        return sel;
    }

    function debugInfoRaw(msg, msg_lv) {
        msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10e3;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function clickActionRaw(o) {
        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _o = _classof(o) === "Array" ? o[0] : o;
        let _w = _o.toString().match(/UiObject/) ? _o : _o.findOnce();
        if (!_w) {
            return false;
        }
        let _bnd = _w.bounds();
        return click(_bnd.centerX(), _bnd.centerY());
    }

    function messageActionRaw(msg, lv, if_toast) {
        let _msg = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, if_toast);
        }
        if_toast && toast(_msg);
        let _lv = typeof lv === "undefined" ? 1 : lv;
        if (_lv >= 4) {
            console.error(_msg);
            _lv >= 8 && exit();
            return false;
        }
        if (_lv >= 3) {
            console.warn(_msg);
            return false;
        }
        if (_lv === 0) {
            console.verbose(_msg);
        } else if (_lv === 1) {
            console.log(_msg);
        } else if (_lv === 2) {
            console.info(_msg);
        }
        return true;
    }

    // tool function(s) //

    // updated: Aug 29, 2019
    function restartThisEngine(params) {
        let _params = params || {};

        let _messageAction = (
            typeof messageAction === "function" ? messageAction : messageActionRaw
        );
        let _debugInfo = (m, fg) => (
            typeof debugInfo === "function" ? debugInfo : debugInfoRaw
        )(m, fg, _params.debug_info_flag);

        let _my_e = engines.myEngine();
        let _my_e_id = _my_e.id;
        let _e_argv = _my_e.execArgv;

        let _restart_times_a = _e_argv.max_restart_engine_times;
        let _restart_times_p = _params.max_restart_engine_times;
        let _restart_times;
        if (typeof _restart_times_a === "undefined") {
            _restart_times = typeof _restart_times_p === "undefined" ? 1 : +_restart_times_p;
        } else {
            _restart_times = +_restart_times_a;
        }
        if (!_restart_times) {
            _messageAction("引擎重启已拒绝", 3);
            return !~_messageAction("引擎重启次数已超限", 3, 0, 1);
        }

        let _restart_times_bak = +_e_argv.max_restart_engine_times_backup || _restart_times;
        _debugInfo("重启当前引擎任务");
        _debugInfo(">当前次数: " + (_restart_times_bak - _restart_times + 1));
        _debugInfo(">最大次数: " + _restart_times_bak);
        let _file_name = _params.new_file || _my_e.source.toString();
        if (_file_name.match(/^\[remote]/)) {
            _messageAction("远程任务不支持重启引擎", 8, 1, 0, 1);
        }

        let _file_path = files.path(_file_name + (_file_name.match(/\.js$/) ? "" : ".js"));
        _debugInfo("运行新引擎任务:\n" + _file_path);
        engines.execScriptFile(_file_path, {
            arguments: Object.assign({}, _params, {
                max_restart_engine_times: _restart_times - 1,
                max_restart_engine_times_backup: _restart_times_bak,
                instant_run_flag: _params.instant_run_flag,
            }),
        });
        _debugInfo("强制停止旧引擎任务");
        // _my_engine.forceStop();
        engines.all().filter(e => e.id === _my_e_id).forEach(e => e.forceStop());
        return true;

        // raw function(s) //

        function messageActionRaw(msg, lv, if_toast) {
            let _msg = msg || " ";
            if (lv && lv.toString().match(/^t(itle)?$/)) {
                return messageActionRaw("[ " + msg + " ]", 1, if_toast);
            }
            if_toast && toast(_msg);
            let _lv = typeof lv === "undefined" ? 1 : lv;
            if (_lv >= 4) {
                console.error(_msg);
                _lv >= 8 && exit();
                return false;
            }
            if (_lv >= 3) {
                console.warn(_msg);
                return false;
            }
            if (_lv === 0) {
                console.verbose(_msg);
            } else if (_lv === 1) {
                console.log(_msg);
            } else if (_lv === 2) {
                console.info(_msg);
            }
            return true;
        }

        function debugInfoRaw(msg, msg_lv) {
            msg_lv && console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
        }
    }
}

// FIXME seems like this is not effective to avoid OOM @ Dec 3, 2019
function _reclaim() {
    for (let i = 0, l = arguments.length; i < l; i += 1) {
        let img = arguments[i];
        if (ext.isImageWrapper(img)) {
            img.recycle();
        }
        /*
            `img = null;` is not necessary
            as which only modified the point
            of this reference typed argument
         */
    }
}