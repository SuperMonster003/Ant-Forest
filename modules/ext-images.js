require('./mod-global');
let {project} = require('./mod-project');
let {a11yx, $$sel} = require('./ext-a11y');
let {filesx} = require('./ext-files');
let {devicex} = require('./ext-device');
let {cryptox} = require('./ext-crypto');
let {consolex} = require('./ext-console');

global._$_has_scr_capt_perm = global._$_has_scr_capt_perm || threads.atomic(0);

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let URL = java.net.URL;
let Build = android.os.Build;
let Point = org.opencv.core.Point;
let Core = org.opencv.core.Core;
let Rect = android.graphics.Rect;
let Bitmap = android.graphics.Bitmap;
let BitmapFactory = android.graphics.BitmapFactory;
let ScreenCapturer = org.autojs.autojs.core.image.capture.ScreenCapturer;
let ByteArrayOutputStream = java.io.ByteArrayOutputStream;

let exp = {
    _asset_prefix: '_$_asset_',
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
                    throw Error('Image asset ' + asset_name + ' does not exist');
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
            let _ctr = 0;
            Object.keys(this._data).forEach((k) => {
                let _img = this._data[k];
                if (exp.isImageWrapper(_img) && !exp.isRecycled(_img)) {
                    _ctr += 1;
                    _img.recycle();
                }
                delete this._data[k];
            });
            if (_ctr > 0) {
                consolex._('清理扩展图像样本池: ' + _ctr + '项', 0, 0, -2);
            }
        },
        /** @param {ImageWrapper$} i */
        reclaim(i) {
            if (exp.isImageWrapper(i)) {
                let _name = exp.getName(i);
                if (_name in this._data) {
                    if (exp.isImageWrapper(this._data[_name])) {
                        this._data[_name].recycle();
                    }
                    delete this._data[_name];
                }
            }
        },
    },
    /**
     * @param {ImageWrapper$} img
     * @return {string}
     */
    getName(img) {
        return '@' + java.lang.Integer.toHexString(img.hashCode());
    },
    /**
     * @param {ImageWrapper$} img
     * @return {{R: number, G: number, B: number, std: number}}
     */
    getMean(img) {
        let [R, G, B] = Core.mean(img.getMat()).val;
        return {R: R, G: G, B: B, std: Mathx.std([R, G, B])};
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
    /**
     * @param {...ImageWrapper$[]} [imgs]
     */
    reclaim(imgs) {
        [].slice.call(arguments).forEach((i) => {
            if (this.isImageWrapper(i)) {
                i.recycle();
            }
            this.pool.reclaim(i);
        });
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

        let _orientation = landscape === undefined || landscape === 'AUTO'
            ? ScreenCapturer.ORIENTATION_AUTO : typeof landscape === 'boolean'
                ? landscape
                    ? ScreenCapturer.ORIENTATION_LANDSCAPE
                    : ScreenCapturer.ORIENTATION_PORTRAIT
                : landscape === 'LANDSCAPE' ? ScreenCapturer.ORIENTATION_LANDSCAPE
                    : landscape === 'PORTRAIT' ? ScreenCapturer.ORIENTATION_PORTRAIT
                        : ScreenCapturer.ORIENTATION_AUTO;
        let _adapter = javaImages.requestScreenCapture(_orientation);

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
     * @param {boolean} [options.isDebug=undefined]
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

        let _thread_prompt = threads.start(function () {
            let _sel_rem = () => pickup(id('com.android.systemui:id/remember'));
            let _sel_sure = () => pickup(/立即开始|允许|S(tart|TART) [Nn](ow|OW)|A(llow|LLOW)/);

            if (a11yx.wait(_sel_sure, 4.8e3, 120)) {
                a11yx.wait(_sel_rem, 600, 120, {
                    then(w) {
                        _debug('勾选"不再提示"复选框');
                        a11yx.click(w, 'w');
                    },
                });
                a11yx.wait(_sel_sure, 2.4e3, 120, {
                    then(w) {
                        _debug('点击"' + w.content() + '"按钮');
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
        let _req_result = images.requestScreenCapture(_sco);

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
                    consolex.debug.switchSet(_opt.isDebug = true);
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
            let _lv = Mathx.floorPow(2, Math.max(Number(_opt.compress_level) || 1, 1));
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
     * @template {ImageWrapper$} T
     * @param {T} img
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
     * @return {T}
     */
    compress(img, compress_level /* inSampleSize */, is_recycle_img) {
        let _lv = Mathx.floorPow(2, Math.max(Number(compress_level) || 1, 1));
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
     * @template {ImageWrapper$} T
     * @param {T} img
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {boolean} [is_recycle_img=false] - whether to recycle param img or not
     * @return {T}
     */
    clip(img, x, y, w, h, is_recycle_img) {
        let _clip = this.pool.add(images.clip(img, x, y, w, h));
        is_recycle_img && this.reclaim(img);
        return _clip;
    },
    /**
     * Substitution of images.concat()
     * @template {ImageWrapper$} T
     * @param {T} img1
     * @param {T} img2
     * @param {'LEFT'|'RIGHT'|'TOP'|'BOTTOM'} [direction='RIGHT']
     * @param {boolean|number|'ALL'} [is_recycle_img=false] - whether to recycle param img or not
     * @return {T}
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
     * @template {ImageWrapper$} T
     * @param {T} img - input image.
     * @param {Images.Size} dsize - output image size (Side|[Width,Height]).
     * @param {Images.InterpolationFlags} [interpolation='LINEAR'] - interpolation method (without 'INTER_' prefix).
     * @example
     * images.requestScreenCapture(false);
     * let dst = images.resize(images.captureScreen(), [720, 1280]);
     * @return {T}
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
        return this.pool.add(images.resize(img, _size, interpolation));
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
     *     console.log(point.x +', '+ point.y);
     * }
     */
    findImage(img, template, options) {
        let _opt = options || {};
        let _lv = Mathx.floorPow(2, Math.max(Number(_opt.compress_level) || 1, 1));
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
     * @param {ImageWrapper$} [options.srcImage]
     * @param {boolean} [options.isToast=true]
     * @param {number} [options.fetchTimes=1]
     * @param {number} [options.fetchInterval=100]
     * @param {boolean} [options.isDebug=undefined]
     * @param {number} [options.timeout=60e3] -- no less than 5e3
     * @example
     * // [[], [], []] -- 3 groups of data
     * console.log(imagesx.baiduOcr(pickup(/\xa0/, 'widgets'), {
     *     fetchTimes: 3,
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
        let _capt = _opt.srcImage || this.capt(options);

        let _msg = '使用baiduOcr获取数据';
        _debug(_msg);
        if (_opt.isToast) {
            toast(_msg);
        }

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
                    _debug('access_token准备完毕');
                    break;
                } catch (e) {
                    sleep(200);
                }
            }
        });
        _thd_token.join(_tt);

        let _err = s => consolex.w(s, Number(_opt.isToast), 0, -2);
        if (_max_token < 0) {
            _err('baiduOcr获取access_token失败');
            return [];
        }
        if (_thd_token.isAlive()) {
            _err('baiduOcr获取access_token超时');
            return [];
        }

        let _max = _opt.fetchTimes || 1;
        let _max_b = _max;
        let _itv = _opt.fetchInterval || 300;
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
                let _suffix = _max_b > 1 ? '[ ' + _cur + '] ' : '';
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

        threads.start(function () {
            while (!_allDead()) {
                sleep(420);
                if (Date.now() >= _tt_ts) {
                    _thds.forEach(thd => thd.interrupt());

                    let _msg = ['baiduOcr获取数据超时'];
                    _res.length && _msg.push('已获取的数据可能不完整');
                    consolex.w(_msg, Number(_opt.isToast), 0, -2);
                    break;
                }
            }
        });

        while (1) {
            if (_allDead()) {
                if (_opt.isToast && _res.length) {
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
                    return exp.clip(_capt, $1, $2, $3 - $1, $4 - $2);
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
                    return exp.pool.add(imgs);
                }
                if (imgs.length === 1) {
                    return exp.pool.add(imgs[0]);
                }
                let _stitched = exp.pool.add(imgs[0]);
                imgs.forEach((img, idx) => {
                    if (idx) {
                        _stitched = exp.pool.add(images.concat(_stitched, img, 'BOTTOM'));
                    }
                });
                return _stitched;
            }
        }
    },
    /**
     * Substitution of images.findColor
     * @param {ImageWrapper$} img
     * @param {Color$} color
     * @param {{
     *     similarity?: number,
     *     threshold?: number,
     *     region?: [X?, Y?, Width?, Height?] | android.graphics.Rect,
     * }} [options]
     * @return {OpenCV.Point}
     */
    findColor(img, color, options) {
        if (isObjectSpecies(options) && options.region instanceof android.graphics.Rect) {
            let _r = options.region;
            options.region = [_r.left, _r.top, _r.width(), _r.height()];
        }
        return images.findColor(img, color, options);
    },
};

module.exports = {imagesx: exp};