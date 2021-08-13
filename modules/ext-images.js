global.imagesx = typeof global.imagesx === 'object' ? global.imagesx : {};

require('./mod-monster-func').load();
require('./ext-global').load();

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Build = android.os.Build;
let Scalar = org.opencv.core.Scalar;
let Point = org.opencv.core.Point;
let Core = org.opencv.core.Core;
let Imgproc = org.opencv.imgproc.Imgproc;
let OpencvRect = org.opencv.core.Rect;
let Rect = android.graphics.Rect;
let Bitmap = android.graphics.Bitmap;
let BitmapFactory = android.graphics.BitmapFactory;
let Mat = com.stardust.autojs.core.opencv.Mat;
let OpenCVHelper = com.stardust.autojs.core.opencv.OpenCVHelper;
let ImageWrapper = com.stardust.autojs.core.image.ImageWrapper;
let ScreenCapturer = com.stardust.autojs.core.image.capture.ScreenCapturer;
let UiSelector = com.stardust.autojs.core.accessibility.UiSelector;
let UiObject = com.stardust.automator.UiObject;
let ByteArrayOutputStream = java.io.ByteArrayOutputStream;

let ext = {
    _has_scr_capt_permission: threads.atomic(0),
    /**
     * Copied from Auto.js 4.1.1 alpha2 source code by SuperMonster003 at Jan 10, 2021
     */
    _MatchingResult: (function $iiFe() {
        let _comparators = {
            'left': (l, r) => l.point.x - r.point.x,
            'top': (l, r) => l.point.y - r.point.y,
            'right': (l, r) => r.point.x - l.point.x,
            'bottom': (l, r) => r.point.y - l.point.y,
        };

        function _Result(list) {
            if (Array.isArray(list)) {
                this.matches = list;
            } else {
                this.matches = runtime.bridges.getBridges().toArray(list);
            }
            this['__defineGetter__']('points', () => {
                if (typeof (this.__points__) == 'undefined') {
                    this.__points__ = this.matches.map(m => m.point);
                }
                return this.__points__;
            });
        }

        _Result.prototype.first = function () {
            return this.matches.length ? this.matches[0] : null;
        };
        _Result.prototype.last = function () {
            return this.matches.length ? this.matches[this.matches.length - 1] : null;
        };
        _Result.prototype.findMax = function (cmp) {
            if (!this.matches.length) {
                return null;
            }
            let target = this.matches[0];
            this.matches.forEach(m => target = cmp(target, m) > 0 ? m : target);
            return target;
        };
        _Result.prototype.leftmost = function () {
            return this.findMax(_comparators.left);
        };
        _Result.prototype.topmost = function () {
            return this.findMax(_comparators.top);
        };
        _Result.prototype.rightmost = function () {
            return this.findMax(_comparators.right);
        };
        _Result.prototype.bottommost = function () {
            return this.findMax(_comparators.bottom);
        };
        _Result.prototype.worst = function () {
            return this.findMax((l, r) => l.similarity - r.similarity);
        };
        _Result.prototype.best = function () {
            return this.findMax((l, r) => r.similarity - l.similarity);
        };
        _Result.prototype.sortBy = function (cmp) {
            let comparatorFn = null;
            if (typeof cmp == 'string') {
                cmp.split('-').forEach(direction => {
                    let buildInFn = _comparators[direction];
                    if (!buildInFn) {
                        throw new Error('unknown direction \'' + direction + '\' in \'' + cmp + '\'');
                    }
                    (function (fn) {
                        if (comparatorFn == null) {
                            comparatorFn = fn;
                        } else {
                            comparatorFn = (function (comparatorFn, fn) {
                                return function (l, r) {
                                    let cmpValue = comparatorFn(l, r);
                                    return cmpValue === 0 ? fn(l, r) : cmpValue;
                                };
                            })(comparatorFn, fn);
                        }
                    })(buildInFn);
                });
            } else {
                comparatorFn = cmp;
            }
            let clone = this.matches.slice();
            clone.sort(comparatorFn);
            return new _Result(clone);
        };

        return _Result;
    })(),
    _initIfNeeded() {
        runtime.getImages().initOpenCvIfNeeded();
    },
    /**
     * @param {org.opencv.core.Point[]} points
     * @returns {org.opencv.core.Point[]}
     */
    _toPointArray(points) {
        let _arr = [], _len = points.length;
        for (let i = 0; i < _len; i++) {
            _arr[i] = points[i];
        }
        return _arr;
    },
    _buildRegion(region, img) {
        if (!img) {
            throw Error('img is required for imagesx._buildRegion()');
        }
        if (region === undefined) {
            region = [];
        }
        let x = region[0] === undefined ? 0 : region[0];
        let y = region[1] === undefined ? 0 : region[1];
        let width = region[2] === undefined ? img.getWidth() - x : region[2];
        let height = region[3] === undefined ? (img.getHeight() - y) : region[3];
        let r = new OpencvRect(x, y, width, height);
        if (x < 0 || y < 0 || x + width > img.width || y + height > img.height) {
            throw new Error('Out of region:\n' +
                'region: ' + [x, y, width, height].join(', ').surround('[ ') + '\n' +
                'region size: ' + [x + width, y + height].join(', ').surround('[ ') + '\n' +
                'image size: ' + [img.width, img.height].join(', ').surround('[ '));
        }
        return r;
    },
    ForestImagePool: (function $iiFe() {
        /**
         * @param {Object} [config]
         * @param {number} [config.interval=120]
         * @param {number} [config.limit=3]
         */
        function ImagePool(config) {
            let _cfg = config || {};
            let _imagesx = ext;
            Object.defineProperty(this, '_data', {
                value: [],
            });
            Object.defineProperty(this, 'data', {
                get() {
                    for (let i = 0; i < this._data.length; i += 1) {
                        let _img = this._data[i];
                        if (!_imagesx.isImageWrapper(_img) || _imagesx.isRecycled(_img)) {
                            this._data.splice(i--, 1);
                        }
                    }
                    return this._data;
                },
                enumerable: true,
            });
            this.interval = _cfg.interval || 120;
            this.limit = _cfg.limit || 3;
        }

        ImagePool.prototype = {
            get len() {
                return this.data.length;
            },
            get filled_up() {
                return this.len >= this.limit;
            },
            get overflow() {
                return this.len > this.limit;
            },
            add(capt) {
                let _imagesx = ext;
                let _capt = capt || _imagesx.capt({clone: true});
                debugInfo('添加森林采样: ' + _imagesx.getName(_capt));
                this.data.unshift(_capt);
                if (this.overflow) {
                    debugInfo('采样样本数量超过阈值: ' + this.limit);
                    while (this.overflow) {
                        let _c = this.data.pop();
                        debugInfo('>移除并回收最旧样本: ' + _imagesx.getName(_c));
                        _imagesx.reclaim(_c);
                    }
                }
            },
            reclaimAll() {
                let _imagesx = ext;
                if (this.len) {
                    debugInfo('回收全部森林采样');
                    this.data.forEach((c) => {
                        debugInfo('>已回收: ' + _imagesx.getName(c));
                        _imagesx.reclaim(c);
                    });
                    this.clear();
                    debugInfo('森林样本已清空');
                }
            },
            clear() {
                this.data.splice(0);
            },
        };

        return ImagePool;
    })(),
    /**
     * @param {ImageWrapper$} img
     * @return {string}
     */
    getName(img) {
        try {
            return '@' + img.toString().split('@')[1].match(/\w+/)[0];
        } catch (e /* Null pointer */) {
            try {
                return img.getMat().toString().replace(/^.+nativeObj=0x\w+?(\w{7})\W.*$/, '$1');
            } catch (e /* No implementation found for long org.opencv.core.Mat.n_Mat()... */) {
                return '@unknown';
            }
        }
    },
    /**
     * @param {ImageWrapper$} img
     * @return {{arr: number[], std: number, data: {R: number, B: number, G: number}, string: string}}
     */
    getMean(img) {
        /** @type {number[]} */
        let _v = Core.mean(img.getMat()).val;
        let [R, G, B] = _v;
        let [_R, _G, _B] = [R, G, B].map(x => Number(x.toFixed(2)));
        let _arr = [_R, _G, _B];
        return {
            data: {R: _R, G: _G, B: _B},
            arr: _arr,
            std: Number(Math.std(_arr)),
            string: _arr.join(', ').surround('[]'),
        };
    },
    isRecycled(img, is_strict) {
        if (!(img instanceof ImageWrapper)) {
            if (is_strict) {
                throw Error('img is required for imagesx.isRecycled()');
            }
            return true;
        }
        try {
            img.ensureNotRecycled();
        } catch (e) {
            return true;
        }
        return false;
    },
    recycleGlobal() {
        let $_af = global.$$af = global.$$af || {};
        Object.keys($_af).forEach((k) => {
            if (this.isImageWrapper($_af[k])) {
                $_af[k].recycle();
                $_af[k] = null;
            }
        });
        // Recycle all images generated by './modules/mod-treasury-vault'
        Object.keys(global).forEach((k) => {
            k.match(/^_\$_base64_img_/) && global[k].recycle();
        });
    },
    isImageWrapper(img) {
        return img instanceof ImageWrapper;
    },
    reclaim() {
        [].slice.call(arguments).forEach(i => this.isImageWrapper(i) && i.recycle());
    },
    /**
     * @typedef {Object} Imagesx$Capt$Options
     * @property {number} [compress=0] - android.graphics.BitmapFactory.Options.inSampleSize
     * @property {boolean} [clone=false] - if capture cloning needed or not
     */
    /**
     * @param {Imagesx$Capt$Options} [options]
     * @returns {ImageWrapper$}
     */
    capt(options) {
        let _opt = options || {};
        let _compress = Number(_opt.compress || 0);
        let _clone = Boolean(_opt.clone);

        let _err = null;
        let _max = 10;
        while (_max--) {
            try {
                this.permit();
                let _capt = images.captureScreen();
                if (_clone) {
                    _capt = _capt.clone();
                }
                if (_compress > 1) {
                    _capt = this.compress(_capt, _compress, true);
                }
                if (_capt instanceof ImageWrapper) {
                    return _capt;
                }
            } catch (e) {
                _err = e;
                sleep(120 + Math.random() * 120);
            }
        }
        let _msg = '截取当前屏幕失败';
        console.error(_msg);
        toast(_msg);
        _err !== null && console.warn(_err.message);
        exit();
    },
    /**
     * @param {Imagesx$Capt$Options} [options]
     * @returns {ImageWrapper$}
     */
    captureScreen(options) {
        return this.capt(options);
    },
    /**
     * @typedef {
     *     boolean|'AUTO'|'LANDSCAPE'|'PORTRAIT'|*
     * } ScreenCapturerOrientation - true for 'LANDSCAPE'; false for 'PORTRAIT'; default for 'AUTO'
     */
    /**
     * Substitution of images.requestScreenCapture() for avoiding unresponsive running when invoked more than once
     * @param {ScreenCapturerOrientation} [landscape='AUTO']
     * @returns {boolean}
     */
    requestScreenCapture(landscape) {
        if (this._has_scr_capt_permission.get() > 0) {
            return true;
        }
        this._has_scr_capt_permission.incrementAndGet();

        let javaImages = runtime.getImages();
        let ResultAdapter = require.call(global, 'result_adapter');

        let _is_pro = context.getPackageName().match(/Pro\b/i);
        let _orientation = landscape === undefined || landscape === 'AUTO'
            ? ScreenCapturer.ORIENTATION_AUTO : typeof landscape === 'boolean'
                ? landscape
                    ? ScreenCapturer.ORIENTATION_LANDSCAPE
                    : ScreenCapturer.ORIENTATION_PORTRAIT
                : landscape === 'LANDSCAPE' ? ScreenCapturer.ORIENTATION_LANDSCAPE
                    : landscape === 'PORTRAIT' ? ScreenCapturer.ORIENTATION_PORTRAIT
                        : ScreenCapturer.ORIENTATION_AUTO;
        let _adapter = !_is_pro
            ? javaImages.requestScreenCapture(_orientation)
            : javaImages.requestScreenCapture.apply(javaImages, [
                _orientation, /* width: */ -1, /* height: */ -1, /* isAsync: */ false,
            ].slice(0, _is_pro && app.autojs.versionName.match(/^Pro 7/) ? 3 : 4));

        if (ResultAdapter.wait(_adapter)) {
            return true;
        }
        this._has_scr_capt_permission.decrementAndGet();
    },
    /**
     * Request for screen capture permission (with throttling and dialog auto dismissing)
     * @param {Object} [options={}]
     * @param {boolean} [options.restart_e_flag=true] - try restarting the engine when failed
     * @param {ScreenCapturerOrientation} [options.screen_capturer_orientation='PORTRAIT']
     * @param {Object} [options.restart_e_params={}]
     * @param {number} [options.restart_e_params.max_restart_e_times=3]
     * @param {boolean} [options.is_debug_info=undefined]
     * @returns {boolean}
     */
    permit(options) {
        if (this._has_scr_capt_permission.get() > 0) {
            return true;
        }
        let _opt = options || {};
        let debugInfo$ = (m, lv) => debugInfo(m, lv, _opt.is_debug_info);

        debugInfo$('开始申请截图权限');

        if (typeof _opt.restart_e_flag === 'undefined') {
            _opt.restart_e_flag = true;
        } else {
            let _self = _opt.restart_e_flag;
            _opt.restart_e_flag = !!_self;
        }
        if (!_opt.restart_e_params) {
            _opt.restart_e_params = {};
        }
        if (!_opt.restart_e_params.max_restart_e_times) {
            _opt.restart_e_params.max_restart_e_times = 3;
        }

        debugInfo$('已开启弹窗监测线程');

        let _thread_prompt = threads.start(function () {
            require('./ext-a11y').load();
            /** @returns {SelectorPickupResult} */
            let _sel_rem = () => $$sel.pickup(id('com.android.systemui:id/remember'));
            /** @returns {SelectorPickupResult} */
            let _sel_sure = t => $$sel.pickup(/立即开始|允许|S(tart|TART) [Nn](ow|OW)|A(llow|LLOW)/, t);

            if (waitForAction(_sel_sure, 4.8e3)) {
                if (waitForAction(_sel_rem, 600)) {
                    debugInfo$('勾选"不再提示"复选框');
                    clickAction(_sel_rem(), 'w');
                }
                if (waitForAction(_sel_sure, 2.4e3)) {
                    let _w = _sel_sure();
                    let _act_msg = '点击' + _sel_sure('txt').surround('"') + '按钮';

                    debugInfo$(_act_msg);
                    clickAction(_w, 'w');

                    if (!waitForAction(() => !_sel_sure(), 1e3)) {
                        debugInfo$('尝试click()方法再次' + _act_msg);
                        clickAction(_w, 'click');
                    }
                }
            }
        });

        let _thread_monitor = threads.start(function () {
            if (waitForAction(() => !!_req_result, 4.8e3, 80)) {
                _thread_prompt.interrupt();
                return debugInfo$('截图权限申请结果: 成功');
            }
            _opt.is_debug_info = true;
            if (typeof $$flag !== 'object') {
                global.$$flag = {};
            }
            if (!$$flag.debug_info_avail) {
                $$flag.debug_info_avail = true;
                debugInfo$('开发者测试模式已自动开启', 3);
            }
            if (_opt.restart_e_flag) {
                debugInfo$('截图权限申请结果: 失败', 3);
                try {
                    let _m = Build.MANUFACTURER.toLowerCase();
                    if (_m.match(/xiaomi/)) {
                        debugInfo$('__split_line__dash__');
                        debugInfo$('检测到当前设备制造商为小米', 3);
                        debugInfo$('可能需要给Auto.js以下权限:', 3);
                        debugInfo$('"后台弹出界面"', 3);
                        debugInfo$('__split_line__dash__');
                    }
                } catch (e) {
                    // nothing to do here
                }
                if (files.exists('./ext-engines')) {
                    return require('./ext-engines').restart(_opt.restart_e_params);
                }
            }
            messageAction('截图权限申请失败', 8, 4, 0, 1);
        });

        let _sco = _opt.screen_capturer_orientation;
        _sco = _sco === undefined ? 'PORTRAIT' : _sco;
        let _req_result = this.requestScreenCapture(_sco);

        _thread_monitor.join();

        return _req_result;
    },
    /**
     * @param {ImageWrapper$} img - should be recycled manually if needed
     * @param {ImageWrapper$|string} template - should be recycled manually if needed
     * @param {Object} [options]
     * @param {string} [options.local_cache_name] - when cache name is given (like 'abc'), the file named 'abc.jpg' in the path files.getSdcardPath() + '/.local/pics/' will be: a, directly as template image -- 'abc.jpg' exists already; b, generated when matched -- 'abc.jpg' not exists; when not given, new matching will be made each time, regardless of the existence of storage file with the same name
     * @param {number} [options.template_device_width=W] - screen display width of the template; see {@link getDisplay} -> {@link cX}
     * @param {number} [options.max_results=5] - max matched results; see {@link images.matchTemplate}
     * @param {number} [options.threshold_find=0.9] - see {@link images.findImage}
     * @param {number[]} [options.region_find=[0, 0, W, H]] - see {@link images.findImage}
     * @param {number} [options.threshold_match=0.9] - see {@link images.matchTemplate}
     * @param {boolean} [options.not_null] - null result will be replaced by {points: []}
     * @param {boolean} [options.local_cache_access] - truthy for cache image file saving and loading
     * @param {number} [options.compress_level] - see {@link imagesx.compress}
     * @example
     * let _clip = imagesx.capt();
     * let _ic_img = images.read('./Test/test.jpg');
     * console.log(imagesx.matchTemplate(_clip, _ic_img, {
     *     template_device_width: 1080,
     * }));
     * console.log(imagesx.matchTemplate(_clip, 'ic_fetch', {
     *     max_results: 15,
     *     threshold_find: 0.95,
     *     threshold_match: 0.95,
     *     not_null: true,
     * }).points);
     * @returns {Autojs.MatchingResult|{points: []}|null}
     */
    matchTemplate(img, template, options) {
        if (!img) {
            throw Error('Image is required for imagesx.matchTemplate()');
        }
        if (!template) {
            throw Error('Template is required for imagesx.matchTemplate()');
        }
        let _opt = options || {};
        let _tpl = _byLocal() || _byBase64() || _byTemplate();
        return _tpl && (function $iiFe() {
            require('./ext-device').load();
            let _lv = Math.floorPow(2, Math.max(Number(_opt.compress_level) || 1, 1));
            let _options = {
                max: _opt.max_results,
                threshold: _opt.threshold_match,
            };
            if (_lv <= 1) {
                return images.matchTemplate(img, _tpl, _options);
            }
            let _i = this.compress(img, _lv);
            let _t = this.compress(_tpl, _lv);
            devicex.screen_metrics.saveState();
            devicex.screen_metrics.setRatio(1 / _lv);
            let _matched = images.matchTemplate(_i, _t, _options);
            ext.reclaim(_i, _t);
            devicex.screen_metrics.loadState();
            return _matched;
        }).call(this) || (_opt.not_null ? {points: []} : null);

        // tool function(s) //

        function _byLocal() {
            if (typeof template === 'string' && _opt.local_cache_access) {
                let _dir = files.getSdcardPath() + '/.local/pics/';
                files.createWithDirs(_dir);

                let _name = template + '_' + W + 'p';
                let _ext = (function $iiFe() {
                    let _mch = _name.match(/\.(jpe?g|png|webp)$/);
                    return _mch ? _mch[1] : 'jpg';
                })();
                let _path = _dir + _name + '.' + _ext;
                _byLocal.info = {name: _name, path: _path, ext: _ext};

                let _key = '_$_img_cache_' + _name;
                return global[_key] = global[_key] || images.read(_path);
            }
        }

        function _byBase64() {
            if (typeof template === 'string') {
                try {
                    /** @type {_Base64Image} */
                    let _img = require('./mod-treasury-vault').image_base64_data[template];
                    return _microResize(_img.getImage(), _img.src_dev_width);
                } catch (e) {
                    // nothing to do here
                }
            }
        }

        function _byTemplate() {
            if (template instanceof ImageWrapper) {
                return _microResize(template, _opt.template_device_width);
            }
        }

        function _microResize(tpl, src_w) {
            let [_w, _h] = [tpl.getWidth(), tpl.getHeight()];
            let _w_mid = cX(_w, src_w || W);
            let [_w_min, _w_max] = [_w_mid - 1, _w_mid + 1];
            for (let i = _w_min; i <= _w_max; i += 1) {
                for (let j = 0; j <= 1; j += 1) {
                    let _resized = images.resize(tpl, [i, i * _h / _w + j], 'LANCZOS4');
                    let _matched = ext.findImage(img, _resized, {
                        threshold: _opt.threshold_find,
                        region: _opt.region_find,
                        compress_level: _opt.compress_level,
                    });
                    if (!_matched) {
                        _resized.recycle();
                        _resized = null;
                        continue;
                    }
                    if (_opt.local_cache_access) {
                        debugInfo('已存储缓存模板: ' + _byLocal.info.name);
                        images.save(_resized, _byLocal.info.path, _byLocal.info.ext, 100);
                    }
                    return _resized;
                }
            }
        }
    },
    /**
     * Find color(s) by bounds of Rect, UiSelector or UiObject
     * @param {ImageWrapper$} img
     * @param {android.graphics.Rect|UiSelector$|UiObject$} bounds_src
     * @param {ColorParam|ColorParam[]} color
     * @param {number} [threshold=4]
     * @returns {android.graphics.Rect|null}
     */
    findColorInBounds(img, bounds_src, color, threshold) {
        let _bounds;
        if (bounds_src instanceof Rect) {
            _bounds = bounds_src;
        } else if (bounds_src instanceof UiSelector) {
            let _w = bounds_src.findOnce();
            if (!_w) {
                return null;
            }
            _bounds = _w.bounds();
        } else if (bounds_src instanceof UiObject) {
            _bounds = bounds_src.bounds();
        } else {
            throw Error('findColorInBounds()的bounds_src参数类型无效');
        }

        let {left: _x, top: _y} = _bounds;
        let _w = _bounds.right - _x;
        let _h = _bounds.bottom - _y;

        let _mch = col => images.findColorInRegion(img, col, _x, _y, _w, _h, threshold);
        if (!Array.isArray(color)) {
            return _mch(color) ? _bounds : null;
        }
        return color.every(c => _mch(c)) ? _bounds : null;
    },
    /**
     * Applies the bilateral filter to an image
     * @template {ImageWrapper$} IW
     * @param {IW} img - Source 8-bit or floating-point, 1-channel or 3-channel image
     * @param {number} [d=0] - Diameter of each pixel neighborhood that is used during filtering. If it is non-positive, it is computed from sigmaSpace
     * @param {number} [sigma_color=40] - Filter sigma in the color space. A larger value of the parameter means that farther colors within the pixel neighborhood (see sigmaSpace) will be mixed together, resulting in larger areas of semi-equal color
     * @param {number} [sigma_space=20] - Filter sigma in the coordinate space. A larger value of the parameter means that farther pixels will influence each other as long as their colors are close enough (see sigmaColor ). When d>0, it specifies the neighborhood size regardless of sigmaSpace. Otherwise, d is proportional to sigmaSpace
     * @param {BorderTypes} [border_type='DEFAULT'] - border mode used to extrapolate pixels outside of the image
     * @see https://docs.opencv.org/3.4.3/d4/d86/group__imgproc__filter.html#ga9d7064d478c95d60003cf839430737ed
     * @returns {IW}
     */
    bilateralFilter(img, d, sigma_color, sigma_space, border_type) {
        this._initIfNeeded();
        let _mat = new Mat();
        Imgproc.bilateralFilter(
            img.mat, _mat,
            d || 0, sigma_color || 40, sigma_space || 20,
            Core['BORDER_' + (border_type || 'DEFAULT')]);
        return images.matToImage(_mat);
    },
    /**
     * @param {{
     *     is_debug_info?: boolean,
     *     pool?: object,
     *     duration?: boolean,
     *     region?: number[],
     *     config?: {
     *         forest_image_pool_limit?: number,
     *         forest_image_pool_itv?: number,
     *     },
     * }} [options]
     * @returns {AfHoughBallsResult}
     */
    findAFBallsByHough(options) {
        require('./ext-device').getDisplay(true, {is_debug_info: false});
        timeRecorder('hough_beginning');

        let _opt = options || {};
        let debugInfo$ = (m, lv) => debugInfo(m, lv, _opt.is_debug_info);

        let _opt_cfg = _opt.config || {};
        let _cfg = Object.assign(_def(), global.$$cfg, {
            forest_image_pool_limit: _opt_cfg.forest_image_pool_limit,
            forest_image_pool_itv: _opt_cfg.forest_image_pool_itv,
        });

        let _src_img_stg = _cfg.hough_src_img_strategy;
        let _results_stg = _cfg.hough_results_strategy;
        let _min_dist = cX(_cfg.min_balls_distance);
        let _region = _opt.region || _cfg.eballs_recognition_region
            .map((v, i) => i % 2 ? cYx(v, true) : cX(v, true));

        /** @type {{fill_up_pool: number, img_samples_processing: number}} */
        let _du = {};
        /** @type {EnergyBallsInfo[]} */
        let _balls_data = [];
        /**
         * @typedef {{
         *     ripe?: EnergyBallsInfo[],
         *     naught?: EnergyBallsInfo[],
         *     water?: EnergyBallsInfo[]
         * }} EnergyBallsInfoClassified
         */
        /** @type {EnergyBallsInfoClassified} */
        let _balls_data_o = {ripe: [], naught: [], water: []};
        let _pool = _opt.pool || new this.ForestImagePool({
            limit: _cfg.forest_image_pool_limit,
            interval: _cfg.forest_image_pool_itv,
        });
        _setWballExtFunction();
        _fillUpForestImgPool();
        _analyseEnergyBalls();

        /** @typedef {{
         *     duration?: {
         *         _map: string[][],
         *         total: number,
         *         showDebugInfo: function(): void,
         *         fill_up_pool: number,
         *         img_samples_processing: number,
         *     },
         * }} EnergyBallsDuration */
        /** @type {EnergyBallsDuration} */
        let _du_o = _opt.duration !== false ? {
            duration: Object.assign({
                _map: [
                    ['gray', '灰度化'],
                    ['adapt_thrd', '自适应阈值'],
                    ['med_blur', '中值滤波'],
                    ['blur', '均值滤波'],
                    ['blt_fltr', '双边滤波'],
                    ['img_samples_processing', '数据处理'],
                    ['total', '全部用时'],
                ],
                total: Number(timeRecorder('hough_beginning', 'L')),
                showDebugInfo() {
                    debugInfo$('__split_line__dash__');
                    debugInfo$('图像填池: ' + this.fill_up_pool + 'ms  ' + [
                        _pool.interval, _pool.limit,
                    ].join(', ').surround('[ '));
                    this._map.filter(a => this[a[0]]).forEach((a) => {
                        debugInfo$(a[1] + ': ' + this[a[0]] + 'ms');
                    });
                    debugInfo$('__split_line__dash__');
                },
            }, _du),
        } : {};

        /**
         * @typedef {
         *     EnergyBallsInfoClassified | EnergyBallsDuration | {expand: function(): EnergyBallsInfo[]}
         * } AfHoughBallsResult
         */
        return Object.assign(_balls_data_o, _du_o, {
            expand() {
                /** @type {EnergyBallsInfo[]} */
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

        function _setWballExtFunction() {
            if (!ext.inTreeArea) {
                ext.inTreeArea = (o) => {
                    // TODO...
                    let _tree_area = {x: halfW, y: cYx(670), r: cX(182)};
                    if (typeof o !== 'object' || !o.r) {
                        throw Error('inTreeArea() invoked with invalid arguments');
                    }
                    let {x: _ox, y: _oy, r: _or} = o;
                    let {x: _zx, y: _zy, r: _zr} = _tree_area;
                    let _ct_dist_min = _or + _zr;
                    let _ct_dist = Math.sqrt(Math.pow(_zy - _oy, 2) + Math.pow(_zx - _ox, 2));
                    return _ct_dist < _ct_dist_min;
                };
            }
            if (!ext.isWaterBall) {
                ext.isWaterBall = (o, capt, container) => {
                    let {x: _ctx, y: _cty} = o;
                    if (_cty > cYx(386)) {
                        return false;
                    }
                    let _capt = capt || ext.capt();
                    let _hue_max = _cfg.homepage_wball_max_hue_no_blue;
                    let _offset_x = o.r * Math.sin(30 * Math.PI / 180);
                    let _offset_y = o.r * Math.cos(30 * Math.PI / 180);
                    let _x_min = _ctx - _offset_x;
                    let _y_min = _cty - _offset_y;
                    let _x_max = _ctx + _offset_x;
                    let _y_max = _cty + _offset_y;
                    let _step = 2;
                    return _progress(_x_min, _step, _y_min, _step);

                    // tool function(s) //

                    function _progress(x_min, x_step, y_min, y_step) {
                        while (x_min <= _x_max && y_min <= _y_max) {
                            if (_hit(x_min, y_min)) {
                                if (Array.isArray(container)) {
                                    container.push(o);
                                }
                                return true;
                            }
                            x_min += x_step;
                            y_min += y_step;
                        }
                    }

                    function _hit(x, y) {
                        let _col = images.pixel(_capt, x, y);
                        let _red = colors.red(_col);
                        let _green = colors.green(_col);
                        // hue value in HSB mode without blue component
                        let _hue = 120 - (_red / _green) * 60;
                        if (isFinite(_hue) && _hue < _hue_max) {
                            return true;
                        }
                    }
                };
            }
            if (!ext.isRipeBall) {
                ext.isRipeBall = (o, capt, container) => {
                    if (ext.inTreeArea(o)) {
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

                    if (_result) {
                        if (Array.isArray(container)) {
                            container.push(o);
                        }
                        return true;
                    }
                };
            }
        }

        function _fillUpForestImgPool() {
            timeRecorder('fill_up_pool');
            let _max = _pool.limit + 1;
            while (_max--) {
                timeRecorder('forest_pool_add');
                _pool.add();
                if (!_pool.len || _pool.filled_up) {
                    break;
                }
                let _et = timeRecorder('forest_pool_add', 'L');
                let _itv = Math.max(0, _pool.interval - _et);
                _itv && sleep(_itv);
            }
            _du.fill_up_pool = timeRecorder('fill_up_pool', 'L');
        }

        function _analyseEnergyBalls() {
            debugInfo$('分析森林页面样本中的能量球');
            _pool.data.forEach(_parse);
            debugInfo$('森林页面样本能量球分析完毕');
            debugInfo$('解析的能量球数量: ' + _balls_data.length);
            _balls_data.forEach(o => _balls_data_o[o.type].push(o));
            _opt.pool || _pool.reclaimAll();

            // tool function(s) //

            function _parse(capt) {
                if (!capt || ext.isRecycled(capt)) {
                    return;
                }
                let [_l, _t, _r, _b] = _region;
                let [_w, _h] = [_r - _l, _b - _t];

                let _gray = _getImg('gray', true, () => {
                    return images.grayscale(capt);
                });
                let _adapt_thrd = _getImg('adapt_thrd', _src_img_stg.adapt_thrd, () => {
                    return images.adaptiveThreshold(_gray, 255, 'GAUSSIAN_C', 'BINARY_INV', 9, 6);
                });
                let _med_blur = _getImg('med_blur', _src_img_stg.med_blur, () => {
                    return images.medianBlur(_gray, 9);
                });
                let _blur = _getImg('blur', _src_img_stg.blur, () => {
                    return images.blur(_gray, 9, [-1, -1], 'REPLICATE');
                });
                let _blt_fltr = _getImg('blt_fltr', _src_img_stg.blt_fltr, () => {
                    return ext.bilateralFilter(_gray, 9, 20, 20, 'REPLICATE');
                });

                let _proc_key = 'img_samples_processing';
                timeRecorder(_proc_key);

                /** @type {EnergyBallsBasicProp[]} */
                let _wballs = [];

                /** @type {EnergyBallsBasicProp[]} */
                let _balls = []
                    .concat(_getBalls(_src_img_stg.gray && _gray, true))
                    .concat(_getBalls(_adapt_thrd, true))
                    .concat(_getBalls(_med_blur, true))
                    .concat(_getBalls(_blur, true))
                    .concat(_getBalls(_blt_fltr, true))
                    .filter(_filterWball)
                    .sort(_sortX);

                if (_wballs.length + _balls.length) {
                    _antiOverlap();
                    _symmetrical();
                    _linearInterpolate();
                    _addBalls();
                }

                _du[_proc_key] = timeRecorder(_proc_key, 'L');

                // tool function(s) //

                function _getImg(name, condition, imgFunc) {
                    if (condition) {
                        timeRecorder(name);
                        let _img = imgFunc();
                        let _et = timeRecorder(name, 'L');
                        _du[name] ? _du[name] = _et : _du[name] += _et;
                        return _img;
                    }
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
                        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                    }
                }

                /**
                 * @typedef {'ripe'|'naught'|'water'} EnergyBallsType
                 */
                function _addBalls() {
                    _wballs.map(_extProps).filter(_filterActBtn).forEach((o) => {
                        _addBall(o, 'water');
                    });
                    _balls.map(_extProps).filter(_filterActBtn).forEach((o) => {
                        if (_isRipeBall(o)) {
                            _addBall(o, 'ripe');
                        } else if (!ext.inTreeArea(o)) {
                            _addBall(o, 'naught');
                        }
                    });

                    // tool function(s) //

                    function _isRipeBall(o) {
                        return ext.isRipeBall(o, capt);
                    }

                    /**
                     * @typedef {EnergyBallsBasicProp | EnergyBallsExtProp} EnergyBallsMixedProp
                     * @typedef {EnergyBallsMixedProp | {type: EnergyBallsType}} EnergyBallsInfo
                     */
                    /**
                     * @param {EnergyBallsMixedProp} o
                     * @param {EnergyBallsType} type
                     */
                    function _addBall(o, type) {
                        let _pri = {ripe: 6, naught: 3};
                        let _data_idx = _getDataIdx(o);
                        if (!~_data_idx) {
                            _balls_data.push(Object.assign({type: type}, o));
                        } else if (_pri[type] > _pri[_balls_data[_data_idx].type]) {
                            // low-priority data will be replaced with the one with higher priority
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
                    /** @returns {EnergyBallsMixedProp} */
                    function _extProps(o) {
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

                    function _filterActBtn(o) {
                        let _x = cX(118), _y = cYx(346);

                        let _inArea = o => o.left < _x && o.top < _y;
                        let _inSymArea = o => o.right > W - _x && o.top < _y;

                        return !_inArea(o) && !_inSymArea(o);
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
                function _getBalls(img, is_recycle_img) {
                    if (!img) {
                        return [];
                    }
                    let _img = images
                        .findCircles(img, {
                            dp: 1,
                            minDist: _min_dist,
                            minRadius: cX(0.054),
                            maxRadius: cX(0.078),
                            param1: 15,
                            param2: 15,
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
                        .filter((o) => {
                            return o.x - o.r >= _l
                                && o.x + o.r <= _r
                                && o.y - o.r >= _t
                                && o.y + o.r <= _b
                                // excluding homepage cloud(s)
                                && o.mean.std > 20;
                        })
                        .sort(_sortX);
                    if (is_recycle_img) {
                        ext.reclaim(img);
                    }
                    return _img;
                }

                function _sortX(a, b) {
                    return a.x === b.x ? 0 : a.x > b.x ? 1 : -1;
                }

                function _filterWball(o) {
                    if (o) {
                        if (ext.isRipeBall(o, capt)) {
                            return true;
                        }
                        return !ext.isWaterBall(o, capt, _wballs);
                    }
                }
            }
        }

        // updated: Oct 20, 2020
        function _def() {
            return {
                ripe_ball_detect_color_val: '#deff00',
                ripe_ball_detect_threshold: 13,
                eballs_recognition_region: [0.1, 0.15, 0.9, 0.45],
                hough_src_img_strategy: {
                    gray: true, adapt_thrd: true, med_blur: true, blur: true,
                    blt_fltr: false,
                },
                hough_results_strategy: {
                    anti_ovl: true, symmetrical: true, linear_itp: true,
                },
                min_balls_distance: 0.09,
                forest_image_pool_limit: 3,
                forest_image_pool_itv: 60,
                homepage_wball_max_hue_no_blue: 47,
            };
        }
    },
    /**
     * Substitution of images.findAllPointsForColor() (compatible with Auto.js Pro versions)
     * @param {ImageWrapper$} img
     * @param {ColorParam} color
     * @param {{
     *     similarity?: number,
     *     threshold?: number,
     *     region?: [X]|[X, Y]|[X, Y, Width]|[X, Y, Width, Height],
     *     is_recycle_img?: boolean,
     * }} [options]
     * @returns {org.opencv.core.Point[]}
     */
    findAllPointsForColor(img, color, options) {
        this._initIfNeeded();
        let _finder = Object.create(runtime.getImages().colorFinder);
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

        let _finder_ext = {
            // compatible with Auto.js Pro versions
            findAllPointsForColor(image, color, threshold, rect) {
                let _mat_of_point = _findColorInner(image, color, threshold, rect);
                if (_mat_of_point === null) {
                    return [];
                }
                let _points = _mat_of_point.toArray();
                OpenCVHelper.release(_mat_of_point);

                let _screen_metrics = runtime.getScreenMetrics();
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
                        255);
                    let _upper_bound = new Scalar(
                        colors.red(color) + threshold,
                        colors.green(color) + threshold,
                        colors.blue(color) + threshold,
                        255);

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
        };

        Object.assign(_finder, _finder_ext);

        let _pts = this._toPointArray(_finder.findAllPointsForColor(img, _color, _thrd, _region));
        _opt.is_recycle_img && img.recycle();
        return _pts;
    },
    /**
     * Substitution of images.read(path:string):ImageWrapper$
     * @param {string} path
     * @param {number} [compress_level=1] - android.graphics.BitmapFactory.Options.inSampleSize
     * @example
     * log(images.read('./test.png').getHeight());
     * log(imagesx.read('./test.png').getHeight()); // same as above
     * log(imagesx.read('./test.png', 4).getHeight()); // 1/16 size of above
     * @returns {ImageWrapper$}
     */
    read(path, compress_level /* inSampleSize */) {
        let _bo = new BitmapFactory.Options();
        _bo.inSampleSize = Math.max(Number(compress_level) || 1, 1);
        let _bitmap = BitmapFactory.decodeFile(files.path(path), _bo);
        return ImageWrapper.ofBitmap(_bitmap);
    },
    /**
     * Read out the outWidth and outHeight of a local image file (without allocating the memory for its pixels)
     * @param {string} path
     * @returns {{width: number, height: number}}
     */
    readBounds(path) {
        let _bo = new BitmapFactory.Options();
        _bo.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(files.path(path), _bo); // returns null
        return {
            width: _bo.outWidth,
            height: _bo.outHeight,
        };
    },
    /**
     * Compress ImageWrapper by passing a compress_level (inSampleSize) parameter
     * @function imagesx.compress
     * @template {ImageWrapper$} IW
     * @param {IW} img
     * @param {number} [compress_level=1] - android.graphics.BitmapFactory.Options.inSampleSize
     * @param {boolean} [is_recycle_img=false] - whether to recycle param img or not
     * @example
     * let capt = imagesx.capt();
     * let c1 = capt.getBitmap().getByteCount();
     * let c2 = compress(capt, 2).getBitmap().getByteCount();
     * let c3 = compress(capt, 4).getBitmap().getByteCount();
     * console.log(c2 / c1); // 0.25 （1/4)
     * console.log(c3 / c1); // 0.0625 (1/16)
     * @example
     * images.save(compress(capt, 2), files.path('./capt2.png'));
     * images.save(compress(capt, 4), files.path('./capt4.png'));
     * images.save(compress(capt, 8), files.path('./capt8.png'));
     * @see https://developer.android.com/reference/android/graphics/BitmapFactory.Options#inSampleSize
     * @returns {IW}
     */
    compress(img, compress_level /* inSampleSize */, is_recycle_img) {
        let _lv = Math.floorPow(2, Math.max(Number(compress_level) || 1, 1));
        let _new_wrapper = img;
        if (_lv > 1) {
            let _os = new ByteArrayOutputStream();
            img.getBitmap().compress(Bitmap.CompressFormat.JPEG, 100, _os);
            let _bytes = _os.toByteArray();
            let _bo = new BitmapFactory.Options();
            _bo.inSampleSize = _lv;
            let _new_bitmap = BitmapFactory.decodeByteArray(_bytes, 0, _bytes.length, _bo);
            _new_wrapper = ImageWrapper.ofBitmap(_new_bitmap);
        }
        is_recycle_img && img.recycle();
        return _new_wrapper;
    },
    /**
     * Substitution of images.clip(image:ImageWrapper$,x:number,y:number,w:number,h:number):ImageWrapper$
     * @template {ImageWrapper$} IW
     * @param {IW} img
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {boolean} [is_recycle_img=false] - whether to recycle param img or not
     * @returns {IW}
     */
    clip(img, x, y, w, h, is_recycle_img) {
        let _clip = images.clip(img, x, y, w, h);
        is_recycle_img && img.recycle();
        return _clip;
    },
    /**
     * Substitution of images.concat()
     * @template {ImageWrapper$} IW
     * @param {IW} img1
     * @param {IW} img2
     * @param {'LEFT'|'RIGHT'|'TOP'|'BOTTOM'} [direction='RIGHT']
     * @param {boolean|number|'ALL'} [is_recycle_img=false] - whether to recycle param img or not
     * @returns {IW}
     */
    concat(img1, img2, direction, is_recycle_img) {
        let _concat = images.concat(img1, img2, direction);
        if (is_recycle_img === true || is_recycle_img === 'ALL' || is_recycle_img === 0) {
            img1.recycle();
            img2.recycle();
        } else if (is_recycle_img === 1) {
            img1.recycle();
        } else if (is_recycle_img === 2) {
            img2.recycle();
        }
        return _concat;
    },
    /**
     * Substitution of images.resize() for better dsize compatibility
     * @template {ImageWrapper$} IW
     * @param {IW} img - input image.
     * @param {ImageSize} dsize - output image size (Side|[Width,Height]).
     * @param {InterpolationFlags} [interpolation='LINEAR'] - interpolation method (without 'INTER_' prefix).
     * @example
     * images.requestScreenCapture(false);
     * let dst = images.resize(images.captureScreen(), [720, 1280]);
     * @returns {IW}
     */
    resize(img, dsize, interpolation) {
        let _size = Array.isArray(dsize) ? dsize : [dsize, dsize];
        _size = _size.map((n, i) => {
            if (typeof n === 'string') {
                n = n.replace(/[^\d.%]+/g, '').match(/^(\d+(?:\.\d+)?)(%*)$/);
                if (n) {
                    n = (i ? n[1] * H : n[1] * W) / Math.pow(100, n[2].length);
                } else {
                    throw Error('Cannot parse dsize of imagesx.resize()');
                }
            }
            return n >= 1 ? n : i ? n * H : n * W;
        });
        return images.resize(img, _size, interpolation);
    },
    /**
     * @param {ImageWrapper$} img
     * @param {ImageWrapper$} template
     * @param {Object} [options]
     * @param {number} [options.threshold=0.9]
     * @param {number} [options.weakThreshold=0.6]
     * @param {number} [options.level=-1]
     * @param {number} [options.compress_level=1]
     * @param {number[]} [options.region]
     * @param {boolean} [options.is_recycle_all]
     * @param {boolean} [options.is_recycle_img]
     * @param {boolean} [options.is_recycle_template]
     * @example
     * images.requestScreenCapture(false);
     * let capt = images.captureScreen();
     * let img = images.read('/sdcard/capture.png');
     * let templ = images.read('/sdcard/template.png');
     * let point = images.findImage(img, templ, {compress_level: 4});
     * if (point) {
     *     console.log(point.x + ', ' + point.y);
     * }
     */
    findImage(img, template, options) {
        let _opt = options || {};
        let _lv = Math.floorPow(2, Math.max(Number(_opt.compress_level) || 1, 1));
        let _result = (function $iiFe() {
            if (_lv <= 1) {
                return images.findImage(img, template, options);
            }
            require('./ext-device').load();
            let _img = this.compress(img, _lv);
            let _tpl = this.compress(template, _lv);
            devicex.screen_metrics.saveState();
            devicex.screen_metrics.setRatio(1 / _lv);
            let _res = images.findImage(_img, _tpl, options);
            ext.reclaim(_img, _tpl);
            devicex.screen_metrics.loadState();
            return _res && new Point(_res.x * _lv, _res.y * _lv);
        }).call(this);
        if (_opt.is_recycle_all) {
            ext.reclaim(img, template);
        } else {
            _opt.is_recycle_img && img.recycle();
            _opt.is_recycle_template && template.recycle();
        }
        return _result;
    },
    /**
     * Fetching data by calling OCR API from Baidu
     * @param {Array|ImageWrapper$|UiObject$|UiObjectCollection$} src -- will be converted into ImageWrapper$
     * @param {Object} [options]
     * @param {ImageWrapper$} [options.capt_img]
     * @param {boolean} [options.no_toast_msg_flag=false]
     * @param {number} [options.fetch_times=1]
     * @param {number} [options.fetch_interval=100]
     * @param {boolean} [options.is_debug_info=undefined]
     * @param {number} [options.timeout=60e3] -- no less than 5e3
     * @example
     * require('ext-a11y').load();
     * // [[], [], []] -- 3 groups of data
     * console.log(imagesx.baiduOcr($$sel.pickup(/\xa0/, 'widgets'), {
     *     fetch_times: 3,
     *     timeout: 12e3
     * }));
     * @returns {Array|Array[]} -- [] or [[], [], []...]
     */
    baiduOcr(src, options) {
        if (!src) {
            return [];
        }
        let _opt = options || {};
        let debugInfo$ = (m, lv) => debugInfo(m, lv, _opt.is_debug_info);

        let _tt = _opt.timeout || 60e3;
        if (!+_tt || _tt < 5e3) {
            _tt = 5e3;
        }
        let _tt_ts = Date.now() + _tt;

        let _imagesx = this;
        let _capt = _opt.capt_img || this.capt();

        let _msg = '使用baiduOcr获取数据';
        debugInfo$(_msg);
        _opt.no_toast_msg_flag || toast(_msg);

        let _token = '';
        let _max_token = 10;
        let _thd_token = threads.start(function () {
            while (_max_token--) {
                try {
                    // noinspection SpellCheckingInspection
                    _token = http.get(
                        'https://aip.baidubce.com/oauth/2.0/token' +
                        '?grant_type=client_credentials' +
                        '&client_id=YIKKfQbdpYRRYtqqTPnZ5bCE' +
                        '&client_secret=hBxFiPhOCn6G9GH0sHoL0kTwfrCtndDj')
                        .body.json()['access_token'];
                    debugInfo$('access_token准备完毕');
                    break;
                } catch (e) {
                    sleep(200);
                }
            }
        });
        _thd_token.join(_tt);

        let _lv = Number(!_opt.no_toast_msg_flag);
        let _err = s => messageAction(s, 3, _lv, 0, 'both_dash');
        if (_max_token < 0) {
            _err('baiduOcr获取access_token失败');
            return [];
        }
        if (_thd_token.isAlive()) {
            _err('baiduOcr获取access_token超时');
            return [];
        }

        let _max = _opt.fetch_times || 1;
        let _max_b = _max;
        let _itv = _opt.fetch_interval || 300;
        let _res = [];
        let _thds = [];
        let _allDead = () => _thds.every(thd => !thd.isAlive());

        while (_max--) {
            _thds.push(threads.start(function () {
                let _max_img = 10;
                let _img = _stitchImgs(src);
                while (_max_img--) {
                    if (!_img || !_max_img) {
                        return [];
                    }
                    if (!_imagesx.isRecycled(_img)) {
                        break;
                    }
                    _img = _stitchImgs(src);
                }
                let _cur = _max_b - _max;
                let _suffix = _max_b > 1 ? ' [' + _cur + '] ' : '';
                debugInfo$('stitched image' + _suffix + '准备完毕');

                try {
                    let _words = JSON.parse(http.post('https://aip.baidubce.com/' +
                        'rest/2.0/ocr/v1/general_basic?access_token=' + _token, {
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        image: images.toBase64(_img),
                        image_type: 'BASE64',
                    }).body.string())['words_result'];
                    if (_words) {
                        debugInfo$('数据' + _suffix + '获取成功');
                        _res.push(_words.map(val => val['words']));
                    }
                } catch (e) {
                    if (!e.message.match(/InterruptedIOException/)) {
                        throw (e);
                    }
                } finally {
                    _img.recycle();
                    _img = null;
                }
            }));
            sleep(_itv);
        }

        threads.start(function () {
            while (!_allDead()) {
                if (Date.now() >= _tt_ts) {
                    _thds.forEach(thd => thd.interrupt());

                    let _msg = 'baiduOcr获取数据超时';
                    let _toast = Number(!_opt.no_toast_msg_flag);
                    messageAction(_msg, 3, _toast, 0, 'up_dash');

                    if (_res.length) {
                        messageAction('已获取的数据可能不完整', 3);
                    }
                    return showSplitLine('', 'dash');
                }
                sleep(500);
            }
        });

        while (1) {
            if (_allDead()) {
                if (!_opt.no_toast_msg_flag && _res.length) {
                    toast('baiduOcr获取数据完毕');
                }
                return _max_b === 1 ? _res[0] : _res;
            }
            sleep(500);
        }

        // tool function(s) //

        function _stitchImgs(imgs) {
            if (!Array.isArray(imgs)) {
                imgs = [imgs].slice();
            }

            imgs = imgs.map((img) => {
                let type = _getType(img);
                if (type === 'UiObject') {
                    return _widgetToImage(img);
                }
                if (type === 'UiObjectCollection') {
                    return _widgetsToImage(img);
                }
                return img;
            }).filter(img => !!img);

            return _stitchImg(imgs);

            // tool function(s) //

            function _getType(o) {
                let matched = o.toString().match(/\w+(?=@)/);
                return matched ? matched[0] : '';
            }

            function _widgetToImage(widget) {
                try {
                    // FIXME Nov 11, 2019
                    // there is a strong possibility that `widget.bounds()` would throw an exception
                    // like 'Cannot find function bounds in object xxx.xxx.xxx.UiObject@abcde'
                    let [$1, $2, $3, $4] = widget.toString()
                        .match(/.*boundsInScreen:.*\((\d+), (\d+) - (\d+), (\d+)\).*/)
                        .map(x => Number(x)).slice(1);
                    return images.clip(_capt, $1, $2, $3 - $1, $4 - $2);
                } catch (e) {
                    // Wrapped java.lang.IllegalArgumentException: x + width must be <= bitmap.width()
                }
            }

            function _widgetsToImage(widgets) {
                let imgs = [];
                widgets.forEach((widget) => {
                    let img = _widgetToImage(widget);
                    img && imgs.push(img);
                });
                return _stitchImg(imgs);
            }

            function _stitchImg(imgs) {
                let _isImgWrap = o => _getType(o) === 'ImageWrapper';
                if (_isImgWrap(imgs) && !Array.isArray(imgs)) {
                    return imgs;
                }
                if (imgs.length === 1) {
                    return imgs[0];
                }
                let _stitched = imgs[0];
                imgs.forEach((img, idx) => {
                    if (idx) {
                        _stitched = images.concat(_stitched, img, 'BOTTOM');
                    }
                });
                return _stitched;
            }
        }
    },
};

module.exports = ext;
module.exports.load = () => global.imagesx = ext;