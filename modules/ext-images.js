let {
    isNullish, isPlainObject, $$sleep,
} = require('./mod-global');
let {project} = require('./mod-project');
let {a11yx, $$sel} = require('./ext-a11y');
let {filesx} = require('./ext-files');
let {devicex} = require('./ext-device');
let {timersx} = require('./ext-timers');
let {cryptox} = require('./ext-crypto');
let {threadsx} = require('./ext-threads');
let {consolex} = require('./ext-console');

global._$_has_scr_capt_perm = global._$_has_scr_capt_perm || threadsx.atomic(0);

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let URL = java.net.URL;
let Build = android.os.Build;
let Scalar = org.opencv.core.Scalar;
let Point = org.opencv.core.Point;
let Core = org.opencv.core.Core;
let Imgproc = org.opencv.imgproc.Imgproc;
let OpenCVRect = org.opencv.core.Rect;
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

let exp = {
    _asset_prefix: '_$_asset_',
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
                cmp.split('-').forEach((direction) => {
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
     * @return {org.opencv.core.Point[]}
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
        let r = new OpenCVRect(x, y, width, height);
        if (x < 0 || y < 0 || x + width > img.width || y + height > img.height) {
            throw new Error('Out of region:\n' +
                'region: ' + [x, y, width, height].join(', ').surround('[ ') + '\n' +
                'region size: ' + [x + width, y + height].join(', ').surround('[ ') + '\n' +
                'image size: ' + [img.width, img.height].join(', ').surround('[ '));
        }
        return r;
    },
    /**
     * @param {string} asset_name
     * @return {ImageWrapper$}
     */
    _readAsset(asset_name) {
        let _path = {
            get asset_path() {
                if (typeof this._a_path !== 'undefined') {
                    return this._a_path;
                }
                let _a_path = project.getAssetPath('images');
                if (!files.exists(_a_path)) {
                    throw Error('Images asset dir of project does not exist');
                }
                return this._a_path = _a_path;
            },
            get local_path() {
                if (typeof this._l_path !== 'undefined') {
                    return this._l_path;
                }
                let _l_path = filesx['.local']('images');
                if (!files.isDir(_l_path)) {
                    files.createWithDirs(_l_path + filesx.sep);
                }
                return this._l_path = _l_path;
            },
            get image() {
                if (typeof this._image !== 'undefined') {
                    return this._image;
                }
                let _p_image = files.join(this.asset_path, asset_name + '.png');
                if (!files.exists(_p_image)) {
                    throw Error('Image asset\x20' + asset_name + '\x20does not exist');
                }
                return this._image = _p_image;
            },
            get json() {
                if (typeof this._json !== 'undefined') {
                    return this._json;
                }
                let _p_json = files.join(this.asset_path, asset_name + '.json');
                if (!files.exists(_p_json)) {
                    files.createWithDirs(_p_json);
                }
                return this._json = _p_json;
            },
            get local_image() {
                if (typeof this._l_img !== 'undefined') {
                    return this._l_img;
                }
                return this._l_img = files.join(this.local_path, asset_name + '_' + W + '.png');
            },
            get local_json() {
                if (typeof this._l_json !== 'undefined') {
                    return this._l_json;
                }
                let _l_json = files.join(this.local_path, asset_name + '.json');
                if (!files.exists(_l_json)) {
                    files.createWithDirs(_l_json);
                }
                return this._l_json = _l_json;
            },
        };

        /** @type {Imagesx.Asset} */
        let _asset_cfg = JSON.parse(filesx.read(_path.json, '{}'));
        let _digest = cryptox.digestFile(_path.image, 'SHA-1');
        if (_asset_cfg['sha-1'] !== _digest) {
            if (typeof _asset_cfg['sha-1'] !== 'undefined') {
                throw Error('Corrupted asset: ' + asset_name);
            }
            if (typeof _digest === 'string') {
                _asset_cfg['sha-1'] = _digest;
                files.write(_path.json, JSON.stringify(_asset_cfg));
            }
        }

        let _asset_img = this.read(_path.image);
        let _resize = () => {
            let _ratio = W / _asset_cfg.src_width;
            if (_ratio === 1) {
                return _asset_img;
            }
            let _resized = images.resize(_asset_img, [
                _asset_img.getWidth() * _ratio,
                _asset_img.getHeight() * _ratio,
            ], 'AREA');
            this.reclaim(_asset_img);
            return this.pool.add(_resized);
        };

        if (!_asset_cfg.flexible) {
            return _asset_cfg.src_width ? _resize() : _asset_img;
        }

        let _local_cfg = JSON.parse(filesx.read(_path.local_json, '{}'));
        if (_local_cfg['sha-1'] !== _digest) {
            files.listDir(_path.local_path, function (n) {
                return new RegExp('^' + asset_name + '_\\d+p?\\.png$').test(n);
            }).forEach(n => files.remove(files.join(_path.local_path, n)));
            _local_cfg['sha-1'] = _digest;
            files.write(_path.local_json, JSON.stringify(_local_cfg));
        }

        if (files.exists(_path.local_image)) {
            this.reclaim(_asset_img);
            return this.read(_path.local_image);
        }
        let _resized = _resize();
        images.save(_resized, _path.local_image);
        return _resized;
    },
    pool: {
        _data: {},
        /**
         * @template {ImageWrapper$} T
         * @param {T} img
         * @param {string} [name]
         * @return {T}
         */
        add(img, name) {
            if (isNullish(img)) {
                return img;
            }
            return this._data[name || exp.getName(img)] = img;
        },
        /**
         * @param {string} name
         * @return {!ImageWrapper$|void}
         */
        get(name) {
            return this._data[name];
        },
        clear() {
            let _target = Object.keys(this._data)
                .filter((k) => {
                    let _img = this._data[k];
                    if (exp.isImageWrapper(_img) && !exp.isRecycled(_img)) {
                        return true;
                    }
                    delete this._data[k];
                })
                .map((k) => {
                    let _img = this._data[k];
                    _img.recycle();
                    return k.match(/@[a-f0-9]{4,}$/) ? k : k + exp.getName(_img);
                });
            if (_target.length) {
                consolex._(['清理扩展图像样本池:'].concat(_target), 0, 0, -2);
            }
        },
        /** @param {ImageWrapper$} i */
        reclaim(i) {
            let _name = exp.getName(i);
            if (exp.isImageWrapper(this._data[_name])) {
                this._data[_name].recycle();
            }
            delete this._data[_name];
        },
    },
    ForestImagePool: (function $iiFe() {
        /**
         * @param {Object} [config]
         * @param {number} [config.interval=120]
         * @param {number} [config.limit=3]
         * @param {boolean} [config.is_debug=undefined]
         */
        function ImagePool(config) {
            let _cfg = config || {};
            let _imagesx = exp;

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
            this.is_debug = _cfg.is_debug;
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
            add(capt, options) {
                // @Overload
                if (!exp.isImageWrapper(capt) && isPlainObject(capt)) {
                    return this.add(null, capt);
                }
                let _imagesx = exp;
                let _opt = options || {};
                if (typeof _opt.is_debug !== 'boolean') {
                    _opt.is_debug = this.is_debug;
                }
                let _capt = capt || _imagesx.capt(Object.assign(_opt, {clone: true}));
                let _debug = consolex.debug.fuel(_opt);

                _debug('添加森林采样: ' + _imagesx.getName(_capt));
                this.data.unshift(_capt);
                if (this.overflow) {
                    _debug('采样样本数量超过阈值: ' + this.limit);
                    while (this.overflow) {
                        let _c = this.data.pop();
                        _debug('移除并回收最旧样本: ' + _imagesx.getName(_c));
                        _imagesx.reclaim(_c);
                    }
                }
            },
            reclaimAll(options) {
                let _imagesx = exp;
                let _opt = options || {};
                if (typeof _opt.is_debug !== 'boolean') {
                    _opt.is_debug = this.is_debug;
                }
                let _debug = consolex.debug.fuel(_opt);

                if (this.len) {
                    _debug('回收全部森林采样');
                    this.data.forEach((c) => {
                        _debug('已回收: ' + _imagesx.getName(c));
                        _imagesx.reclaim(c);
                    });
                    this.clear();
                    _debug('森林样本已清空');
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
        return '@' + java.lang.Integer.toHexString(img.hashCode());
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
        if (!this.isImageWrapper(img)) {
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
    isImageWrapper(img) {
        return img instanceof ImageWrapper;
    },
    reclaim() {
        [].slice.call(arguments).forEach((i) => {
            if (this.isImageWrapper(i)) {
                this.pool.reclaim(i);
                i.recycle();
            }
        });
    },
    clearPool() {
        this.pool.clear();
    },
    /**
     * @param {Imagesx.Capt.Options} [options]
     * @return {ImageWrapper$}
     */
    capt(options) {
        let _opt = options || {};
        let _compress = Number(_opt.compress || 0);
        let _clone = Boolean(_opt.clone);

        let _err = null;
        let _max = 10;
        while (_max--) {
            try {
                this.permit(options);
                let _capt = images.captureScreen();
                if (_clone) {
                    _capt = _capt.clone();
                }
                if (_compress > 1) {
                    _capt = this.compress(_capt, _compress, true);
                }
                if (_capt instanceof ImageWrapper) {
                    return this.pool.add(_capt);
                }
            } catch (e) {
                _err = e;
                sleep(120 + Math.random() * 120);
            }
        }
        let _msg = '截取当前屏幕失败';
        console.error(_msg);
        toast(_msg);
        _err !== null && consolex.w(_err);
        exit();
    },
    /**
     * @param {Imagesx.Capt.Options} [options]
     * @return {ImageWrapper$}
     */
    captureScreen(options) {
        return this.capt(options);
    },
    /**
     * Substitution of images.requestScreenCapture() for avoiding unresponsive running when invoked more than once
     * @param {Imagesx.ScreenCapturerOrientation} [landscape='AUTO']
     * @return {boolean}
     */
    requestScreenCapture(landscape) {
        if (global._$_has_scr_capt_perm.get() > 0) {
            return true;
        }
        global._$_has_scr_capt_perm.incrementAndGet();

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
            ].slice(0, app.autojs.versionName.match(/^Pro 7/) ? 3 : 4));

        if (ResultAdapter.wait(_adapter)) {
            return true;
        }
        global._$_has_scr_capt_perm.decrementAndGet();
    },
    /**
     * Request for screen capture permission (with throttling and dialog auto dismissing)
     * @param {Object} [options={}]
     * @param {boolean} [options.restart_e_flag=true] - try restarting the engine when failed
     * @param {Imagesx.ScreenCapturerOrientation} [options.screen_capturer_orientation='PORTRAIT']
     * @param {boolean} [options.is_debug=undefined]
     * @return {boolean}
     */
    permit(options) {
        if (global._$_has_scr_capt_perm.get() > 0) {
            return true;
        }
        let _debug = consolex.debug.fuel(options);
        let _opt = options || {};

        _debug('开始申请截图权限');

        if (typeof _opt.restart_e_flag === 'undefined') {
            _opt.restart_e_flag = true;
        } else {
            let _self = _opt.restart_e_flag;
            _opt.restart_e_flag = !!_self;
        }

        _debug('已开启弹窗监测线程');

        let _thread_prompt = threadsx.start(function () {
            /** @return {A11yx.Pickup.Results} */
            let _sel_rem = () => $$sel.pickup(id('com.android.systemui:id/remember'));
            /** @return {A11yx.Pickup.Results} */
            let _sel_sure = t => $$sel.pickup(/立即开始|允许|S(tart|TART) [Nn](ow|OW)|A(llow|LLOW)/, t);

            if (a11yx.wait(_sel_sure, 4.8e3, 120)) {
                a11yx.wait(_sel_rem, 600, 120, {
                    then(w) {
                        _debug('勾选"不再提示"复选框');
                        a11yx.click(w, 'w');
                    },
                });
                a11yx.wait(_sel_sure, 2.4e3, 120, {
                    then(w) {
                        _debug('点击"' + $$sel.pickup(w, 'txt') + '"按钮');
                        a11yx.click(w, 'w');
                        a11yx.wait(() => !_sel_sure(), 1e3, {
                            else() {
                                _debug('尝试click()方法再次点击');
                                a11yx.click(w, 'c');
                            },
                        });
                    },
                });
            }
        });

        let _sco = _opt.screen_capturer_orientation;
        _sco = _sco === undefined ? 'PORTRAIT' : _sco;
        let _req_result = exp.requestScreenCapture(_sco);

        return a11yx.wait(() => !!_req_result, 4.8e3, 80, {
            then() {
                _thread_prompt.interrupt();
                _debug('截图权限申请结果: 成功');
            },
            else() {
                if (typeof $$flag !== 'object') {
                    global.$$flag = {};
                }
                if (!consolex.debug.switchGet()) {
                    consolex.debug.switchSet(_opt.is_debug = true);
                    _debug('开发者测试模式已自动开启', 3);
                }
                if (_opt.restart_e_flag) {
                    _debug('截图权限申请结果: 失败', 3);
                    try {
                        Build.MANUFACTURER.toLowerCase().match(/xiaomi/) && _debug([
                            '当前设备制造商: 小米', '可能需赋予Auto.js以下权限:', '后台弹出界面',
                        ], 3, 0, -2);
                    } catch (e) {
                        // nothing to do here
                    }
                }
                consolex.$('截图权限申请失败', 8, 4, 0, 1);
            },
        });
    },
    /**
     * @param {ImageWrapper$} img - should be recycled manually if needed
     * @param {ImageWrapper$|string} template - should be recycled manually if needed
     * @param {Object} [options]
     * @param {number} [options.max_results=5] - max matched results; see {@link images.matchTemplate}
     * @param {number} [options.threshold=0.9] - see {@link images.matchTemplate}
     * @param {boolean} [options.not_null] - null result will be replaced by {points: []}
     * @param {number} [options.compress_level] - see {@link imagesx.compress}
     * @example
     * let clip = imagesx.capt();
     * let icon = imagesx.readAsset('ic-fetch');
     * console.log(imagesx.matchTemplate(capt, icon, {
     *     max_results: 15,
     *     threshold: 0.95,
     *     not_null: true,
     * }).points);
     * @return {?Images.MatchingResult}
     */
    matchTemplate(img, template, options) {
        if (!img) {
            throw Error('Image is required for imagesx.matchTemplate()');
        }
        if (!template) {
            throw Error('Template is required for imagesx.matchTemplate()');
        }
        let _opt = options || {};

        return (function $iiFe() {
            let _lv = Math.floorPow(2, Math.max(Number(_opt.compress_level) || 1, 1));
            let _options = {
                max: _opt.max_results,
                threshold: _opt.threshold,
            };
            if (_lv <= 1) {
                return images.matchTemplate(img, template, _options);
            }
            let _i = this.compress(img, _lv);
            let _t = this.compress(template, _lv);
            devicex.screen_metrics.saveState();
            devicex.screen_metrics.setRatio(1 / _lv);
            let _matched = images.matchTemplate(_i, _t, _options);
            exp.reclaim(_i, _t);
            devicex.screen_metrics.loadState();
            return _matched;
        }).call(this) || (_opt.not_null ? {matches: [], points: []} : null);
    },
    /**
     * Find color(s) by bounds of Rect, UiSelector or UiObject
     * @param {ImageWrapper$} img
     * @param {android.graphics.Rect|UiSelector$|UiObject$} bounds_src
     * @param {Color$|Color$[]} color
     * @param {number} [threshold=4]
     * @return {?android.graphics.Rect}
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
     * @param {Images.BorderTypes} [border_type='DEFAULT'] - border mode used to extrapolate pixels outside of the image
     * @see https://docs.opencv.org/3.4.3/d4/d86/group__imgproc__filter.html#ga9d7064d478c95d60003cf839430737ed
     * @return {IW}
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
     *     is_debug?: boolean,
     *     pool?: object,
     *     duration?: boolean,
     *     region?: number[],
     *     config?: {
     *         forest_image_pool_limit?: number,
     *         forest_image_pool_itv?: number,
     *     },
     * }} [options]
     * @return {Imagesx.EnergyBall.AFResult}
     */
    findAFBallsByHough(options) {
        timersx.rec.save('hough_beginning');

        let _opt = options || {};
        let _debug = consolex.debug.fuel(_opt);

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

        let _stg_name_map = {
            gray: '灰度化',
            adapt_thrd: '自适应阈值',
            med_blur: '中值滤波',
            blur: '均值滤波',
            blt_fltr: '双边滤波',
        };

        /** @type {typeof Imagesx.EnergyBall.Info.Duration.duration} */
        let _du = {};
        /** @type {Imagesx.EnergyBall.Infos} */
        let _balls_data = [];
        /** @type {Imagesx.EnergyBall.Info.Classified} */
        let _balls_data_o = {ripe: [], naught: [], water: []};
        let _pool = _opt.pool || new this.ForestImagePool({
            limit: _cfg.forest_image_pool_limit,
            interval: _cfg.forest_image_pool_itv,
            is_debug: _opt.is_debug,
        });
        _setWballExtFunction();
        _fillUpForestImgPool();
        _analyseEnergyBalls();

        /** @type {Imagesx.EnergyBall.Info.Duration} */
        let _du_o = _opt.duration === false ? {} : {
            duration: {
                _map: [
                    ['gray', _stg_name_map.gray],
                    ['adapt_thrd', _stg_name_map.adapt_thrd],
                    ['med_blur', _stg_name_map.med_blur],
                    ['blur', _stg_name_map.blur],
                    ['blt_fltr', _stg_name_map.blt_fltr],
                    ['img_samples_processing', '数据处理'],
                    ['total', '全部用时'],
                ],
                fill_up_pool: _du.fill_up_pool,
                img_samples_processing: _du.img_samples_processing,
                total: timersx.rec('hough_beginning'),
                debug() {
                    _debug.__();
                    _debug('图像填池: ' + this.fill_up_pool + 'ms\x20\x20' + [
                        _pool.interval, _pool.limit,
                    ].join(', ').surround('[ '));
                    this._map.forEach((a) => {
                        let [key, stg] = a;
                        if (this[key]) {
                            _debug(stg + ':\x20' + this[key] + 'ms');
                        }
                    });
                    _debug.__();
                },
            },
        };

        /** @type {Imagesx.EnergyBall.Info.Extension} */
        let _ext = {
            expand() {
                return Object.values(this)
                    .filter(val => Array.isArray(val))
                    .reduce((a1, a2) => a1.concat(a2), Array())
                    .sort(_sortX);
            },
            digest() {
                let _data = {};
                Object.values(this)
                    .filter(val => Array.isArray(val))
                    .forEach(a => a.forEach((o) => {
                        let _digest = [o.x, o.y];
                        o.computed && _digest.push('computed');
                        if (o.type in _data) {
                            _data[o.type].push(_digest);
                        } else {
                            _data[o.type] = [_digest];
                        }
                    }));
                Object.values(_data).forEach(a => a.sort(_sortX));
                return _data;
            },
        };

        return Object.assign(_balls_data_o, _du_o, _ext);

        // tool function(s) //

        function _setWballExtFunction() {
            if (!exp.inTreeArea) {
                exp.inTreeArea = (o) => {
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
            if (!exp.isWaterBall) {
                exp.isWaterBall = (o, capt, container) => {
                    let {x: _ctx, y: _cty} = o;
                    if (_cty > cYx(386)) {
                        return false;
                    }
                    let _capt = capt || exp.capt(options);
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
            if (!exp.isRipeBall) {
                exp.isRipeBall = (o, capt, container) => {
                    if (exp.inTreeArea(o)) {
                        return;
                    }
                    let _capt = capt || exp.capt(options);
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
            timersx.rec.save('fill_up_pool');
            let _max = _pool.limit + 1;
            while (_max--) {
                timersx.rec.save('forest_pool_add');
                _pool.add(options);
                if (!_pool.len || _pool.filled_up) {
                    break;
                }
                $$sleep(_pool.interval - timersx.rec('forest_pool_add'));
            }
            _du.fill_up_pool = timersx.rec('fill_up_pool');
        }

        function _analyseEnergyBalls() {
            _debug('分析森林页面样本中的能量球');
            _pool.data.filter(i => !exp.isRecycled(i)).forEach(_parse);

            _debug('森林页面样本能量球分析完毕');
            _debug('解析的能量球数量: ' + _balls_data.length);
            _balls_data.forEach(o => _balls_data_o[o.type].push(o));
            _debugBallsAmt(_balls_data_o, {
                ripe: '成熟', naught: '未成熟', water: '浇水',
            });

            _opt.pool || _pool.reclaimAll();

            // tool function(s) //

            function _parse(capt, idx) {
                idx || _debug.__();

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
                    return exp.bilateralFilter(_gray, 9, 20, 20, 'REPLICATE');
                });

                if (!_src_img_stg.gray) {
                    exp.reclaim(_gray);
                    _gray = null;
                }

                let _proc_key = 'img_samples_processing';
                timersx.rec.save(_proc_key);

                /** @type {Imagesx.EnergyBall.BasicProp[]} */
                let _wballs = [];

                /** @type {Imagesx.EnergyBall.BasicProp[]} */
                let _balls = []
                    .concat(_getBalls('gray', _gray))
                    .concat(_getBalls('adapt_thrd', _adapt_thrd))
                    .concat(_getBalls('med_blur', _med_blur))
                    .concat(_getBalls('blur', _blur))
                    .concat(_getBalls('blt_fltr', _blt_fltr));

                let _filtered = {invalid: 0, ripe: 0, water: 0, naught: 0};
                let _len_before_filter = _balls.length;
                _balls = _balls.filter(_filterNonWball);
                _debugBallsLen('筛选能量球', _len_before_filter, _balls.length);
                _debugBallsAmt(_filtered, {
                    invalid: '无效', ripe: '成熟', water: '浇水', naught: '未成熟',
                });

                _balls.sort(_sortX);

                if (_wballs.length + _balls.length) {
                    _antiOverlap();
                    _symmetrical();
                    _linearInterpolate();
                    _addBalls();
                }

                _du[_proc_key] = timersx.rec(_proc_key);

                _debug.__();

                // tool function(s) //

                function _getImg(name, condition, imgGenerator) {
                    if (condition) {
                        timersx.rec.save(name);
                        let _img = imgGenerator();
                        let _et = timersx.rec(name);
                        _du[name] ? _du[name] = _et : _du[name] += _et;
                        _debug(_stg_name_map[name] + ':\x20' + _et + 'ms');
                        return _img;
                    }
                    _debug(_stg_name_map[name] + ': discarded');
                }

                function _antiOverlap() {
                    if (_results_stg.anti_ovl) {
                        _debug('覆盖检测处理...');

                        let _len_w = _wballs.length;
                        let _len_s = _balls.length;

                        _antiX(_balls);
                        _antiX(_wballs);
                        _antiXY(_balls, _wballs);

                        _debugBallsLen('w', _len_w, _wballs.length);
                        _debugBallsLen('s', _len_s, _balls.length);
                    }

                    // tool function(s) //

                    function _antiX(a) {
                        if (a.length < 2) {
                            return;
                        }
                        let _tmp = [[a[0]]];
                        for (let i = 1, l = a.length; i < l; i += 1) {
                            let _last_a = _tmp[_tmp.length - 1];
                            let _last_item = _last_a[_last_a.length - 1];
                            if (a[i].x - _last_item.x < _min_dist) {
                                _last_a.push(a[i]);
                            } else {
                                _tmp.push([a[i]]);
                            }
                        }
                        [].splice.apply(a, [0, a.length].concat(_tmp.map((a) => {
                            a.sort(_sortX);
                            let _med = a[Math.floor(a.length / 2)];
                            let _rebuilt = {
                                x: _getReasonable(a.map(o => o.x)),
                                y: _getReasonable(a.map(o => o.y)),
                                r: _getReasonable(a.map(o => o.r)),
                            };
                            return Object.assign(_med, _rebuilt);
                        })));
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

                    function _getReasonable(a, min_same) {
                        let _min_same = typeof min_same === 'number' ? min_same : cX(9);
                        let _a = [[]];
                        a.slice().sort((a, b) => {
                            let _a = Number(a);
                            let _b = Number(b);
                            return _a === _b ? 0 : _a > _b ? 1 : -1;
                        }).forEach((x) => {
                            let _last_a = _a[_a.length - 1];
                            if (!_last_a.length) {
                                _last_a.push(x);
                            } else {
                                let _last_item = _last_a[_last_a.length - 1];
                                if (x - _last_item < _min_same) {
                                    _last_a.push(x);
                                } else {
                                    _a.push([x]);
                                }
                            }
                        });
                        _a.sort((a1, a2) => {
                            let _a = a1.length;
                            let _b = a2.length;
                            return _a === _b ? 0 : _a < _b ? 1 : -1;
                        });
                        for (let i = 1, l = _a.length; i < l; i += 1) {
                            if (_a[i].length < _a[i - 1].length) {
                                _a.splice(i);
                                break;
                            }
                        }
                        if (_a.length > 1) {
                            _a.sort((o1, o2) => {
                                let _a = Math.std(o1);
                                let _b = Math.std(o2);
                                return _a === _b ? 0 : _a > _b ? 1 : -1;
                            });
                        }
                        return Math.median(_a[0]);
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

                    _debug('对称检测处理...');
                    let _len = _balls.length;

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

                    _debugBallsLen('s', _len, _balls.length);
                }

                function _linearInterpolate() {
                    if (!_results_stg.linear_itp) {
                        return;
                    }

                    _debug('线性插值处理...');
                    let _len = _balls.length;

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

                    _debugBallsLen('s', _len, _balls.length);

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

                function _addBalls() {
                    _debug('收集预处理数据...');

                    let _wballs_total = _wballs.map(_wrapProps).filter(_filterNonActivityBtn);
                    _debugBallsLen('w', _wballs.length, _wballs_total.length);
                    _wballs_total.forEach(o => _addBall(o, 'water'));

                    let _balls_total = _balls.map(_wrapProps).filter(_filterNonActivityBtn);
                    _debugBallsLen('s', _balls.length, _balls_total.length);
                    _balls_total.forEach((o) => {
                        if (_isRipeBall(o)) {
                            _addBall(o, 'ripe');
                        } else if (!exp.inTreeArea(o)) {
                            _addBall(o, 'naught');
                        }
                    });

                    // tool function(s) //

                    function _isRipeBall(o) {
                        return exp.isRipeBall(o, capt);
                    }

                    /**
                     * @param {Imagesx.EnergyBall.Property} o
                     * @param {Imagesx.EnergyBall.Type} type
                     */
                    function _addBall(o, type) {
                        let _pri = {ripe: 6, naught: 3};
                        let _data_idx = _getDataIdx(o);
                        if (_data_idx === -1) {
                            _balls_data.push(Object.assign({type: type}, o));
                        } else if (_pri[type] > _pri[_balls_data[_data_idx].type]) {
                            // low-priority data will be replaced with the one with higher priority
                            _balls_data[_data_idx] = Object.assign({type: type}, o);
                        }

                        // tool function(s) //

                        function _getDataIdx(o) {
                            let _l = _balls_data.length;
                            for (let i = 0; i < _l; i += 1) {
                                // taken as identical balls
                                if (Math.abs(o.x - _balls_data[i].x) < _min_dist / 2) {
                                    return i;
                                }
                            }
                            return -1;
                        }
                    }

                    /** @return {Imagesx.EnergyBall.Property} */
                    function _wrapProps(o) {
                        let _toFixedNum = (x, frac) => {
                            return Number(Number(x).toFixed(typeof frac === 'number' ? frac : 1));
                        };
                        ['x', 'y', 'r'].forEach(k => o[k] = _toFixedNum(o[k]));
                        let {x: _x, y: _y, r: _r} = o;
                        return Object.assign(o, {
                            left: _toFixedNum(_x - _r),
                            top: _toFixedNum(_y - _r),
                            right: _toFixedNum(_x + _r),
                            bottom: _toFixedNum(_y + _r),
                            // width and height were made functional
                            // just for better compatible with Auto.js
                            width: () => _r * 2,
                            height: () => _r * 2,
                        });
                    }

                    function _filterNonActivityBtn(o) {
                        let _x = cX(118), _y = cYx(346);

                        let _inArea = o => o.left > _x || o.top > _y;
                        let _inSymArea = o => o.right < W - _x || o.top > _y;

                        return _inArea(o) && _inSymArea(o);
                    }
                }

                /**
                 * @return {Imagesx.EnergyBall.BasicProp[]}
                 */
                function _getBalls(name, img) {
                    if (!img) {
                        _debug(_stg_name_map[name] + ': discarded');
                        return [];
                    }
                    timersx.rec.save(name + '_cir');
                    let _results = images
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
                            let _r = o.radius.toFixedNum(2);
                            let _d = _r * 2;
                            let _clip = images.clip(capt, _x - _r, _y - _r, _d, _d);
                            let _mean = exp.getMean(_clip);
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
                    exp.reclaim(img);

                    let _et = timersx.rec(name + '_cir');
                    _debug(_stg_name_map[name] + ':\x20' + _results.length + 'cir in\x20' + _et + 'ms');

                    return _results;
                }

                function _filterNonWball(o) {
                    if (typeof o !== 'object' || isNullish(o)) {
                        _filtered.invalid += 1;
                        return false;
                    }
                    if (exp.isRipeBall(o, capt)) {
                        _filtered.ripe += 1;
                        return true;
                    }
                    if (exp.isWaterBall(o, capt, _wballs)) {
                        _filtered.water += 1;
                        return false;
                    }
                    _filtered.naught += 1;
                    return true;
                }
            }
        }

        function _sortX(a, b) {
            return a.x === b.x ? 0 : a.x > b.x ? 1 : -1;
        }

        // updated: Oct 20, 2020
        function _def() {
            return {
                ripe_ball_detect_color_val: '#DEFF00',
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

        /**
         * @param {'s'|'w'|string} name
         * @param {number} old_len
         * @param {number} [new_len]
         */
        function _debugBallsLen(name, old_len, new_len) {
            let _n = name === 's' ? '标准能量球' : name === 'w' ? '浇水回赠球' : name;
            new_len === undefined || old_len === new_len
                ? _debug(_n + ':\x20' + old_len)
                : _debug(_n + ':\x20' + old_len + ' -> ' + new_len);
        }

        /**
         * @param {Object} data
         * @param {Object} [mapper]
         */
        function _debugBallsAmt(data, mapper) {
            let _keys = Object.keys(data);
            let _map = mapper || {};
            let _len = x => Array.isArray(x) ? x.length : x;
            _keys = _keys.filter(k => _len(data[k]) > 0);
            _keys.length && _debug(_keys
                .map(k => (_map[k] || k) + '×\x20' + _len(data[k]))
                .join(' + '));
        }
    },
    /**
     * Substitution of images.findAllPointsForColor() (compatible with Auto.js Pro versions)
     * @param {ImageWrapper$} img
     * @param {Color$} color
     * @param {{
     *     similarity?: number,
     *     threshold?: number,
     *     region?: [X]|[X, Y]|[X, Y, Width]|[X, Y, Width, Height],
     *     is_recycle_img?: boolean,
     * }} [options]
     * @return {org.opencv.core.Point[]}
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
        _opt.is_recycle_img && this.reclaim(img);
        return _pts;
    },
    /**
     * Substitution of images.load(src:string):ImageWrapper$
     * @param {string} src
     * @param {number} [compress_level=1] - android.graphics.BitmapFactory.Options.inSampleSize
     * @example
     * log(imagesx.src('http://example.com/test.png').getHeight());
     * log(imagesx.src('http://example.com/test.png', 4).getHeight()); // 1/16 size of above
     * @return {ImageWrapper$}
     */
    src(src, compress_level /* inSampleSize */) {
        try {
            let _url = new URL(src);
            let _cxn = _url.openConnection();
            _cxn.setDoInput(true);
            _cxn.connect();
            let _input = _cxn.getInputStream();
            let _bo = new BitmapFactory.Options();
            _bo.inSampleSize = Math.max(Number(compress_level) || 1, 1);
            let _bitmap = BitmapFactory.decodeStream(_input, null, _bo);
            return this.pool.add(ImageWrapper.ofBitmap(_bitmap));
        } catch (e) {
            return null;
        }
    },
    /**
     * Substitution of images.load(src:string):ImageWrapper$
     * @param {string} src
     * @param {number} [compress_level=1] - android.graphics.BitmapFactory.Options.inSampleSize
     * @return {ImageWrapper$}
     * @see imagesx.src
     */
    loadSrc(src, compress_level /* inSampleSize */) {
        return this.src(src, compress_level);
    },
    /**
     * Substitution of images.read(path:string):ImageWrapper$
     * @param {string} path
     * @param {number} [compress_level=1] - android.graphics.BitmapFactory.Options.inSampleSize
     * @example
     * log(images.read('./test.png').getHeight());
     * log(imagesx.read('./test.png').getHeight()); // same as above
     * log(imagesx.read('./test.png', 4).getHeight()); // 1/16 size of above
     * @return {ImageWrapper$}
     */
    read(path, compress_level /* inSampleSize */) {
        let _bo = new BitmapFactory.Options();
        _bo.inSampleSize = Math.max(Number(compress_level) || 1, 1);
        let _bitmap = BitmapFactory.decodeFile(files.path(path), _bo);
        return this.pool.add(ImageWrapper.ofBitmap(_bitmap));
    },
    /**
     * Read out the outWidth and outHeight of a local image file (without allocating the memory for its pixels)
     * @param {string} path
     * @return {{width: number, height: number}}
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
     * @param {string} asset_name
     * @return {ImageWrapper$}
     */
    readAsset(asset_name) {
        let _k = this._asset_prefix + asset_name;
        if (this.isImageWrapper(this[_k]) && !this.isRecycled(this[_k])) {
            return this[_k];
        }
        return this[_k] = this._readAsset(asset_name);
    },
    /**
     * @param {...string[]} [asset_names]
     */
    clearAssetCache(asset_names) {
        let _keys = asset_names
            ? [].slice.call(arguments).map(k => this._asset_prefix + k)
            : Object.keys(this).filter(k => k.startsWith(this._asset_prefix));
        _keys.forEach(k => this.reclaim(this[k]));
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
     * @return {IW}
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
        is_recycle_img && this.reclaim(img);
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
     * @return {IW}
     */
    clip(img, x, y, w, h, is_recycle_img) {
        let _clip = images.clip(img, x, y, w, h);
        is_recycle_img && this.reclaim(img);
        return _clip;
    },
    /**
     * Substitution of images.concat()
     * @template {ImageWrapper$} IW
     * @param {IW} img1
     * @param {IW} img2
     * @param {'LEFT'|'RIGHT'|'TOP'|'BOTTOM'} [direction='RIGHT']
     * @param {boolean|number|'ALL'} [is_recycle_img=false] - whether to recycle param img or not
     * @return {IW}
     */
    concat(img1, img2, direction, is_recycle_img) {
        let _concat = images.concat(img1, img2, direction);
        if (is_recycle_img === true || is_recycle_img === 'ALL' || is_recycle_img === 0) {
            this.reclaim(img1);
            this.reclaim(img2);
        } else if (is_recycle_img === 1) {
            this.reclaim(img1);
        } else if (is_recycle_img === 2) {
            this.reclaim(img2);
        }
        return this.pool.add(_concat);
    },
    /**
     * Substitution of images.resize() for better dsize compatibility
     * @template {ImageWrapper$} IW
     * @param {IW} img - input image.
     * @param {Images.Size} dsize - output image size (Side|[Width,Height]).
     * @param {Images.InterpolationFlags} [interpolation='LINEAR'] - interpolation method (without 'INTER_' prefix).
     * @example
     * images.requestScreenCapture(false);
     * let dst = images.resize(images.captureScreen(), [720, 1280]);
     * @return {IW}
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
     *     console.log(point.x +',\x20'+ point.y);
     * }
     */
    findImage(img, template, options) {
        let _opt = options || {};
        let _lv = Math.floorPow(2, Math.max(Number(_opt.compress_level) || 1, 1));
        let _result = (function $iiFe() {
            if (_lv <= 1) {
                return images.findImage(img, template, options);
            }
            let _img = this.compress(img, _lv);
            let _tpl = this.compress(template, _lv);
            devicex.screen_metrics.saveState();
            devicex.screen_metrics.setRatio(1 / _lv);
            let _res = images.findImage(_img, _tpl, options);
            exp.reclaim(_img, _tpl);
            devicex.screen_metrics.loadState();
            return _res && new Point(_res.x * _lv, _res.y * _lv);
        }).call(this);
        if (_opt.is_recycle_all) {
            exp.reclaim(img, template);
        } else {
            _opt.is_recycle_img && this.reclaim(img);
            _opt.is_recycle_template && this.reclaim(template);
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
     * @param {boolean} [options.is_debug=undefined]
     * @param {number} [options.timeout=60e3] -- no less than 5e3
     * @example
     * // [[], [], []] -- 3 groups of data
     * console.log(imagesx.baiduOcr($$sel.pickup(/\xa0/, 'widgets'), {
     *     fetch_times: 3,
     *     timeout: 12e3
     * }));
     * @return {Array|Array[]} -- [] or [[], [], []...]
     */
    baiduOcr(src, options) {
        if (!src) {
            return [];
        }
        let _opt = options || {};
        let _debug = consolex.debug.fuel(_opt);

        let _tt = _opt.timeout || 60e3;
        if (!+_tt || _tt < 5e3) {
            _tt = 5e3;
        }
        let _tt_ts = Date.now() + _tt;

        let _imagesx = this;
        let _capt = _opt.capt_img || this.capt(options);

        let _msg = '使用baiduOcr获取数据';
        _debug(_msg);
        _opt.no_toast_msg_flag || toast(_msg);

        let _token = '';
        let _max_token = 10;
        let _thd_token = threadsx.start(function () {
            while (_max_token--) {
                try {
                    // noinspection SpellCheckingInspection
                    _token = http.get(
                        'https://aip.baidubce.com/oauth/2.0/token' +
                        '?grant_type=client_credentials' +
                        '&client_id=YIKKfQbdpYRRYtqqTPnZ5bCE' +
                        '&client_secret=hBxFiPhOCn6G9GH0sHoL0kTwfrCtndDj')
                        .body.json()['access_token'];
                    _debug('access_token准备完毕');
                    break;
                } catch (e) {
                    sleep(200);
                }
            }
        });
        _thd_token.join(_tt);

        let _err = s => consolex.w(s, Number(!_opt.no_toast_msg_flag), 0, -2);
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
            _thds.push(threadsx.start(function () {
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
                let _suffix = _max_b > 1 ? '[\x20' + _cur + ']\x20' : '';
                _debug('stitched image' + _suffix + '准备完毕');

                try {
                    let _words = JSON.parse(http.post('https://aip.baidubce.com/' +
                        'rest/2.0/ocr/v1/general_basic?access_token=' + _token, {
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        image: images.toBase64(_img),
                        image_type: 'BASE64',
                    }).body.string())['words_result'];
                    if (_words) {
                        _debug('数据' + _suffix + '获取成功');
                        _res.push(_words.map(val => val['words']));
                    }
                } catch (e) {
                    if (!e.message.match(/InterruptedIOException/)) {
                        throw (e);
                    }
                } finally {
                    _imagesx.reclaim(_img);
                }
            }));
            sleep(_itv);
        }

        threadsx.start(function () {
            while (!_allDead()) {
                sleep(420);
                if (Date.now() >= _tt_ts) {
                    _thds.forEach(thd => thd.interrupt());

                    let _msg = ['baiduOcr获取数据超时'];
                    _res.length && _msg.push('已获取的数据可能不完整');
                    consolex.w(_msg, Number(!_opt.no_toast_msg_flag), 0, -2);
                    break;
                }
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

module.exports = {imagesx: exp};