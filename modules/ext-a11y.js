global.$$a11y = typeof global.$$a11y === 'object' ? global.$$a11y : {};

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Rect = android.graphics.Rect;
let Point = org.opencv.core.Point;
let Intent = android.content.Intent;
let UiObject = com.stardust.automator.UiObject;

let Settings = android.provider.Settings;
let Secure = Settings.Secure;

let UiSelector = com.stardust.autojs.core.accessibility.UiSelector;
let AccessibilityService = com.stardust.autojs.core.accessibility.AccessibilityService;

let ctx_reso = context.getContentResolver();
let autojs_a11y_svc_name = context.getPackageName() + '/' +
    new AccessibilityService().getClass().getName();

let isNullish = o => o === null || o === undefined;

let ext = {
    /**
     * @param {IArguments} args
     * @returns {{svc: [string], forcible: boolean}}
     */
    _parseArgs(args) {
        let _svc = [autojs_a11y_svc_name];
        let _forcible = false;
        let _type0 = typeof args[0];
        if (_type0 !== 'undefined') {
            if (_type0 === 'object') {
                _svc = args[0];
                _forcible = !!args[1];
            } else if (_type0 === 'string') {
                _svc = [args[0]];
                _forcible = !!args[1];
            } else if (_type0 === 'boolean') {
                _forcible = args[0];
            }
        }
        return {
            forcible: _forcible,
            svc: _svc,
        };
    },
    /** @returns {string} */
    _getString() {
        // getString() may be null on some Android OS
        return Secure.getString(ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES) || '';
    },
    bridge: {
        /**
         * @param {android.view.accessibility.AccessibilityWindowInfo} wi
         * @returns {boolean}
         */
        _isLatestPackage(wi) {
            return wi.getRoot().getPackageName() === runtime.info.getLatestPackage();
        },
        /**
         * @param {
         *     function(info:android.view.accessibility.AccessibilityWindowInfo):boolean
         * } filter
         */
        setWindowFilter(filter) {
            auto.setWindowFilter(function (wi) {
                try {
                    return filter(wi);
                } catch (e) {
                    // eg: TypeError: Cannot call method "getPackageName" of null
                    return false;
                }
            });
        },
        /** @param {string[]} blacklist */
        setWindowBlacklist(blacklist) {
            this.setWindowFilter(wi => this._isLatestPackage(wi)
                && !~blacklist.indexOf(wi.getRoot().getPackageName()));
        },
        /** @param {string[]} whitelist */
        setWindowWhitelist(whitelist) {
            this.setWindowFilter(wi => this._isLatestPackage(wi)
                && !!~whitelist.indexOf(wi.getRoot().getPackageName()));
        },
        setWindowAllowAll() {
            this.setWindowFilter(() => true);
        },
        resetWindowFilter() {
            this.setWindowFilter(wi => {
                return devicex.isLocked() || this._isLatestPackage(wi);
            });
        },
    },
    service: {
        refreshServiceInfo() {
            auto.service.setServiceInfo(auto.service.getServiceInfo());
        },
    },
    /**
     * @param {...boolean|string|string[]} [arguments]
     * @example
     * require('./modules/ext-a11y').load();
     * // enable Auto.js itself
     * $$a11y.enable();
     * $$a11y.enable('org.autojs.autojs/com.stardust.autojs.core.accessibility.AccessibilityService');
     * $$a11y.enable('org.autojs.autojs/com.stardust... , true); // enable forcibly
     * $$a11y.enable(true); // enable forcibly
     * // enable other specified service(s)
     * $$a11y.enable('com.ext.star.wars/com.dahuo.sunflower.assistant.services.AssistantServicesGestures');
     * $$a11y.enable('com.ext.star.wars/com.dahuo.sunflower... , true); // enable forcibly
     * // enable multi services
     * $$a11y.enable([
     *     'org.autojs.autojs/com.stardust.autojs.core.accessibility.AccessibilityService',
     *     'com.sp.protector.free/com.sp.protector.free.engine.AppChangeDetectingAccessibilityService',
     * ]);
     * $$a11y.enable([...], true); // enable forcibly
     * @returns {boolean} - !!(all_services_started_successfully)
     */
    enable() {
        try {
            let _this = this;
            let {forcible, svc} = this._parseArgs(arguments);
            let _svc;
            if (!this.state(svc)) {
                _svc = this.enabled_svc.split(':')
                    .filter(x => !~svc.indexOf(x))
                    .concat(svc).join(':');
            } else if (forcible) {
                _svc = this.enabled_svc;
            }
            if (_svc) {
                Secure.putString(ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, _svc);
                Secure.putInt(ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                let _start = Date.now();
                while (Date.now() - _start < 2e3) {
                    if (_this.state(svc)) {
                        return true;
                    }
                    sleep(180);
                }
                let _m = 'Operation timed out';
                toast(_m);
                console.error(_m);
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    /**
     * @param {...boolean|string|string[]} [arguments]
     * @see this.enable
     * @example
     * require('./modules/ext-a11y').load();
     * // disable all services (clear current a11y svc list)
     * $$a11y.disable('all'); // doesn't matter whether with true param or not
     * // disable Auto.js itself
     * $$a11y.disable();
     * $$a11y.disable('org.autojs.autojs/com.stardust.autojs.core.accessibility.AccessibilityService');
     * $$a11y.disable('org.autojs.autojs/com.stardust... , true); // disable forcibly
     * $$a11y.disable(true); // disable forcibly
     * // disable other specified service(s)
     * $$a11y.disable('com.ext.star.wars/com.dahuo.sunflower.assistant.services.AssistantServicesGestures');
     * $$a11y.disable('com.ext.star.wars/com.dahuo.sunflower... , true); // disable forcibly
     * // disable multi services
     * $$a11y.disable([...]);
     * $$a11y.disable([...], true); // disable forcibly
     * @returns {boolean} - !!(all_services_stopped_successfully)
     */
    disable() {
        try {
            let _args0 = arguments[0];
            let $_str = x => typeof x === 'string';
            if ($_str(_args0) && _args0.toLowerCase() === 'all') {
                Secure.putString(ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, '');
                Secure.putInt(ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                return true;
            }
            let {forcible, svc} = this._parseArgs(arguments);
            let _enabled_svc = this._getString();
            let _contains = function () {
                for (let i = 0, l = svc.length; i < l; i += 1) {
                    if (~_enabled_svc.indexOf(svc[i])) {
                        return true;
                    }
                }
            };
            let _svc;
            if (_contains()) {
                _svc = _enabled_svc.split(':').filter(x => !~svc.indexOf(x)).join(':');
            } else if (forcible) {
                _svc = _enabled_svc;
            }
            if (_svc) {
                Secure.putString(ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, _svc);
                Secure.putInt(ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
                _enabled_svc = this._getString();
                let _start = Date.now();
                while (Date.now() - _start < 2e3) {
                    if (!_contains()) {
                        return true;
                    }
                    sleep(180);
                }
                let _m = 'Operation timed out';
                toast(_m);
                console.error(_m);
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    /**
     * @param {...boolean|string|string[]} [arguments]
     * @see this.enable
     * @see this.disable
     * @returns {boolean}
     */
    restart() {
        return this.disable.apply(this, arguments) && this.enable.apply(this, arguments);
    },
    /**
     * @param {string|string[]} [services]
     * @returns {boolean} - all services enabled or not
     */
    state(services) {
        let _enabled_svc = this.enabled_svc = this._getString();
        let _services = [];
        if (Array.isArray(services)) {
            _services = services.slice();
        } else if (typeof services === 'undefined') {
            _services = [autojs_a11y_svc_name];
        } else if (typeof services === 'string') {
            _services = [services];
        } else {
            throw TypeError('Unknown a11y state type');
        }
        return _services.every(svc => ~_enabled_svc.indexOf(svc));
    },
    /**
     * Returns all enabled a11y services
     * @returns {string[]} - [] for empty data (rather than falsy)
     */
    services() {
        return this._getString().split(':').filter(x => !!x);
    },
    /**
     * Returns the availability of a11y
     * @returns {boolean}
     */
    test() {
        let _rand = '%rand%' + Date.now() + Math.random().toFixed(9);
        this.enable(_rand, true);
        return this.disable(_rand, true);
    },
    /**
     * Returns a UiSelector with additional function(s)
     */
    selector() {
        let $_sel = Object.create(global.selector());
        let $_sel_ext = {
            _sel_body_pool: {},
            _cache_pool: {},
            /**
             * Returns a selector (UiSelector) or widget (UiObject) or some attribute values
             * If no widgets (UiObject) were found, returns null or '' or false
             * If memory keyword was found in this session memory, use a memorized selector directly
             * @function UiSelector$.prototype.pickup
             * @param {BaseSelectorParam} selector
             * <br>
             *     -- array mode 1: [base_selector: any, compass: string]
             *     -- array mode 2: [base_selector: any, additional_sel: array|object, compass: string]
             * @param {SelectorResultType} [result_type='widget']
             * <br>
             *     -- 'txt': available text()/desc() value or empty string
             *     -- 'clickable': boolean value of widget.clickable()
             *     -- 'wc': widget collection which is traversable
             * @param {Object} [options]
             * @param {*} [options.default]
             * @param {boolean} [options.refresh=false]
             * @example
             * // text/desc/id('abc').findOnce();
             * pickup('abc'); // UiObject
             * pickup('abc', 'w'); // same as above
             * pickup('abc', 'w', 'my_alphabet'); // with memory keyword
             *
             * // text/desc/id('abc');
             * pickup('abc', 'sel', 'my_alphabet'); // UiSelector
             *
             * // text('abc').findOnce()
             * pickup(text('abc'), 'w', 'my_alphabet'); // with UiObject selector body
             *
             * // get the string of selector
             * pickup(/^abc.+z/, 'sel_str'); // returns 'id'|'text'|'desc'...
             *
             * // text/desc/id('morning').exists()
             * pickup('morning', 'exists'); // boolean
             *
             * // text/desc/id('morning').findOnce().parent().parent().child(3).id()
             * pickup(['morning', 'p2c3'], 'id');
             *
             * // text/desc/id('hello').findOnce().parent().child(%childCount% - 3)['text'|'desc']
             * pickup(['hello', 's-3'], 'txt');
             *
             * // text/desc/id('hello').findOnce().parent().child(%indexInParent% + 2)['text'|'desc']
             * pickup(['hello', 's>2'], 'txt');
             *
             * // desc('a').className(...).boundsInside(...).findOnce().parent().child(%indexInParent% + 1).clickable()
             * pickup([desc('a').className('Button'), {boundsInside: [0, 0, 720, 1000]}, 's>1'], 'clickable', 'back_btn');
             *
             * // className('Button').findOnce()
             * pickup({className: 'Button'});
             *
             * // w = className('Button').findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
             * // w.parent().child(0);
             * pickup([{className: 'Button'}, 'p5c1>0>0>0>1s0']);
             *
             * // w = className('Button').findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
             * // w.parent(w.indexInParent() - 1);
             * pickup([{className: 'Button'}, 'p5c1>0>0>0>1s<1']);
             *
             * // w = className('Button').findOnce().parent().parent().parent().parent().parent().child(1).child(0).child(0).child(0).child(1);
             * // w.parent().child(w.parent().childCount() - 1);
             * pickup([{className: 'Button'}, 'p5c1>0>0>0>1s-1']);
             * @returns {SelectorPickupResult}
             */
            pickup(selector, result_type, options) {
                let _opt = options || {};

                _opt.refresh && ext.service.refreshServiceInfo();

                let _sel_data = _getSelectorData(selector);
                /** @type {BaseSelector} */
                let _base = _sel_data.base;
                /** @type {AdditionalSelectorParam} */
                let _addi = _sel_data.addi;
                /** @type {string} */
                let _compass = _sel_data.compass;

                let _res_type = _getResultType(result_type);
                let _selector = _getAssembledSelector(_base, _addi);
                let {w: _w, wc: _wc, sel: _sel} = _getWidgetInfo(_selector);
                let _res = _getResult();

                return !isNullish(_res) ? _res : 'default' in _opt ? _opt.default : null;

                // tool function(s)//

                function _getSelectorData(o) {
                    let _a = Array.isArray(o) ? o.slice() : [o];
                    if (typeof _a[1] === 'string') {
                        // take it as 'compass' variable
                        // _a: [base_sel, addi_sel: null, compass]
                        _a.splice(1, 0, null);
                    }
                    let [_base_sel, _addi_sel, _compass] = _a;
                    if (typeof _base_sel === 'boolean'
                        || _base_sel instanceof Array
                        || _base_sel instanceof Rect
                    ) (_base_sel = null);
                    return {base: _base_sel, addi: _addi_sel, compass: _compass};
                }

                /**
                 * @param {SelectorResultType} t
                 * @returns {'widgets'|'selector'|'exists'|'txt'|'selector_name'|'widget'|'point'|'points'|*}
                 */
                function _getResultType(t) {
                    let _type = t ? t.toString() : null;
                    if (_type === null || _type.match(/^w(idget)?$/)) {
                        return 'widget';
                    }
                    if (_type.match(/^(w(idget)?_?c(ollection)?|wid(get)?s)$/)) {
                        return 'widgets';
                    }
                    if (_type.match(/^t(xt)?$/)) {
                        return 'txt';
                    }
                    if (_type.match(/^s(el(ector)?)?$/)) {
                        return 'selector';
                    }
                    if (_type.match(/^e(xist(s)?)?$/)) {
                        return 'exists';
                    }
                    if (_type.match(/^s(el(ector)?)?(_?s)(tr(ing)?)?$/)) {
                        return 'selector_name';
                    }
                    if (_type.match(/^p(oin)?ts?$/)) {
                        return _type.indexOf('s') !== -1 ? 'points' : 'point';
                    }
                    return _type;
                }

                /**
                 * @param {string} type
                 * @returns {boolean}
                 */
                function _isArrResType(type) {
                    return !!type.match(/^(widgets|points)$/);
                }

                /**
                 * @param {BaseSelectorParam} base
                 * @param {AdditionalSelectorParam} addi
                 * @returns {UiObject$|UiSelector$|null}
                 */
                function _getAssembledSelector(base, addi) {
                    /** @see {AdditionalSelectorAbbr} */
                    let _keys_abbr = {
                        bi$: 'boundsInside',
                        c$: 'clickable',
                        cn$: 'className',
                    };

                    if (isNullish(base)) {
                        return null;
                    }

                    if (base instanceof UiObject) {
                        addi && console.warn('UiObject无法使用额外选择器');
                        return base;
                    }

                    if (base instanceof UiSelector) {
                        return _checkSelectors(base);
                    }

                    if (typeof base === 'string' || typeof base === 'number') {
                        return _checkSelectors(desc(base), text(base), id(base));
                    }

                    if (base instanceof RegExp) {
                        return _checkSelectors(descMatches(base), textMatches(base), idMatches(base));
                    }

                    if (typeof base === 'object') {
                        let _s = global.selector();
                        Object.keys(base).forEach((k) => {
                            let _arg = base[k];
                            let _k = k in _keys_abbr ? _keys_abbr[k] : k;
                            _s = _s[_k].apply(_s, Array.isArray(_arg) ? _arg : [_arg]);
                        });
                        return _s;
                    }

                    // tool function(s) //

                    /**
                     * @param {...UiSelector$} sels
                     * @returns {UiObject$|null}
                     */
                    function _checkSelectors(sels) {
                        let _res = [].slice.call(arguments)
                            .map(sel => _getValidSel(sel))
                            .filter(o => o !== null);
                        if (_res.length === 0) {
                            return null;
                        }
                        if (_res.length === 1) {
                            return _res[0];
                        }
                        let _sels = {};
                        _res.forEach((o) => {
                            if (/^desc(Matches)?\(/.test(o.toString())) {
                                return _sels.desc = o;
                            }
                            if (/^text(Matches)?\(/.test(o.toString())) {
                                return _sels.text = o;
                            }
                            if (/^id(Matches)?\(/.test(o.toString())) {
                                return _sels.id = o;
                            }
                        });
                        return _sels.desc || _sels.text
                            ? _getTxtLen(_sels.desc) > _getTxtLen(_sels.text)
                                ? _sels.desc : _sels.text
                            : _sels.id || null;

                        // tool function(s) //

                        /**
                         * @param {UiSelector$} sel
                         * @returns {UiSelector$|null}
                         */
                        function _getValidSel(sel) {
                            if (typeof addi === 'object' && addi !== null) {
                                let _keys = Object.keys(addi);
                                for (let i = 0, l = _keys.length; i < l; i += 1) {
                                    let _k = _keys[i];
                                    let _sel_k = _k in _keys_abbr ? _keys_abbr[_k] : _k;
                                    if (!sel[_sel_k]) {
                                        console.warn('无效的additional_selector属性值:');
                                        console.warn(_sel_k);
                                        return null;
                                    }
                                    try {
                                        let _arg = addi[_k];
                                        _arg = Array.isArray(_arg) ? _arg : [_arg];
                                        sel = sel[_sel_k].apply(sel, _arg);
                                    } catch (e) {
                                        console.warn('无效的additional_selector选择器:');
                                        console.warn(_sel_k);
                                        return null;
                                    }
                                }
                            }
                            try {
                                return sel || null;
                            } catch (e) {
                                return null;
                            }
                        }

                        /**
                         * @param {UiSelector$} w
                         * @returns {number}
                         */
                        function _getTxtLen(w) {
                            let _text = w && w.findOnce();
                            _text = _text === null ? '' : _text.text() || '';
                            let _desc = w && w.findOnce();
                            _desc = _desc === null ? '' : _desc.desc() || '';
                            return Math.max(_desc.length, _text.length);
                        }
                    }
                }

                /**
                 * @param {UiObject$|UiSelector$|null} sel
                 * @returns {{w: (UiObject$|null), sel: (UiObject$|UiSelector$|null), wc: UiObject$[]}}
                 */
                function _getWidgetInfo(sel) {
                    /** @type {UiObject$|null} */
                    let _w = null;
                    /** @type {UiObject$[]} */
                    let _wc = [];
                    /** @type { UiObject$|UiSelector$|null} */
                    let _sel = sel;

                    if (_sel instanceof UiSelector) {
                        _w = _sel.findOnce();
                        if (_isArrResType(_res_type)) {
                            _wc = _sel.find().toArray();
                        }
                    } else {
                        if (_sel instanceof UiObject) {
                            _w = _sel;
                            if (_isArrResType(_res_type)) {
                                _wc = [_sel];
                            }
                            _sel = null;
                        }
                    }

                    if (_compass) {
                        _w = _relativeWidget([_sel || _w, _compass]);
                    }
                    return {w: _w, wc: _wc, sel: _sel};
                }

                /**
                 * Returns a relative widget (UiObject) by compass string
                 * @returns {UiObject$|null}
                 */
                function _relativeWidget(w_info) {
                    let _w_o = Array.isArray(w_info) ? w_info.slice() : [w_info];
                    let _w = _w_o[0];

                    if (typeof _w === 'undefined') {
                        console.warn('relativeWidget的widget参数为Undefined');
                        return null;
                    }
                    if (_w === null || _w instanceof Rect) {
                        return null;
                    }
                    if (_w instanceof UiSelector) {
                        if (!(_w = _w.findOnce())) {
                            return null;
                        }
                    }
                    if (!(_w instanceof UiObject)) {
                        console.warn('未知的relativeWidget的widget参数');
                        return null;
                    }

                    let _compass = _w_o[1];
                    if (!_compass) {
                        return _w;
                    }
                    _compass = _compass.toString();

                    // noinspection SpellCheckingInspection
                    while (_compass.length) {
                        let _mch_p, _mch_c, _mch_s;
                        // p2 ( .parent().parent() )
                        // pppp  ( p4 )
                        // p  ( p1 )
                        // p4pppp12p  ( p4 ppp p12 p -> 4 + 3 + 12 + 1 -> p20 )
                        if ((_mch_p = /^p[p\d]*/.exec(_compass))) {
                            let _len = _compass.match(/p\d+|p+(?!\d)/g).reduce((a, b) => (
                                a + (/\d/.test(b) ? +b.slice(1) : b.length)
                            ), 0);
                            while (_len--) {
                                if (!(_w = _w.parent())) {
                                    return null;
                                }
                            }
                            _compass = _compass.slice(_mch_p[0].length);
                            continue;
                        }
                        // c0c2c0c1  ( .child(0).child(2).child(0).child(1) )
                        // c0>2>0>1  ( .child(0).child(2).child(0).child(1) )
                        // c-3  ( .child(childCount()-3) )
                        // c-3c2c-1  ( .child(childCount()-3).child(2).child(childCount()-1) )
                        // c1>2>3>0>-1>1  ( c1 c2 c3 c0 c-1 c1 )
                        if ((_mch_c = /^c-?\d+([>c]?-?\d+)*/.exec(_compass))) {
                            let _nums = _mch_c[0].split(/[>c]/);
                            for (let s of _nums) {
                                if (s.length) {
                                    let _i = +s;
                                    if (!_w) {
                                        return null;
                                    }
                                    let _cc = _w.childCount();
                                    if (_i < 0) {
                                        _i += _cc;
                                    }
                                    if (_i < 0 || _i >= _cc) {
                                        return null;
                                    }
                                    _w = _w.child(_i);
                                }
                            }
                            _compass = _compass.slice(_mch_c[0].length);
                            continue;
                        }
                        // s2  ( .parent().child(2) )
                        // s-2  ( .parent().child(childCount()-2) )
                        // s>2  ( .parent().child(idxInParent()+2) )
                        // s<2  ( .parent().child(idxInParent()-2) )
                        if ((_mch_s = /^s[<>]?-?\d+/.exec(_compass))) {
                            let _parent = _w.parent();
                            if (!_parent) {
                                return null;
                            }
                            let _idx = _w.indexInParent();
                            if (!~_idx) {
                                return null;
                            }
                            let _cc = _parent.childCount();
                            let _str = _mch_s[0];
                            let _offset = +_str.match(/-?\d+/)[0];
                            if (~String.prototype.search.call(_str, '>')) {
                                _idx += _offset;
                            } else if (~String.prototype.search.call(_str, '<')) {
                                _idx -= _offset;
                            } else {
                                _idx = _offset < 0 ? _offset + _cc : _offset;
                            }
                            if (_idx < 0 || _idx >= _cc) {
                                return null;
                            }
                            _w = _parent.child(_idx);
                            _compass = _compass.slice(_mch_s[0].length);
                            continue;
                        }

                        throw Error('无法解析剩余罗盘参数: ' + _compass);
                    }

                    return _w || null;
                }

                /**
                 * @returns {UiSelector$|UiObject$|UiObject$[]|OpencvPoint$|OpencvPoints$|string|null|void}
                 */
                function _getPresetResult() {
                    let _presets = {
                        selector: _sel,
                        widget: _w,
                        widgets: _wc,
                        exists: !!_w,
                        get selector_name() {
                            return !_sel ? '' : _sel.toString().match(/[a-z]+/)[0];
                        },
                        get txt() {
                            let _text = _w && _w.text() || '';
                            let _desc = _w && _w.desc() || '';
                            return _desc.length > _text.length ? _desc : _text;
                        },
                        get point() {
                            if (_w && _w.bounds()) {
                                return new Point(_w.bounds().centerX(), _w.bounds().centerY());
                            }
                            return null;
                        },
                        get points() {
                            return _wc.map((w) => {
                                return new Point(w.bounds().centerX(), w.bounds().centerY());
                            });
                        },
                    };
                    if (_res_type in _presets) {
                        return _presets[_res_type];
                    }
                }

                /**
                 * @returns {UiSelector$|UiObject$|UiObject$[]|OpencvPoint$|OpencvPoints$|string|null|*}
                 */
                function _getResult() {
                    let _preset_res = _getPresetResult();
                    if (typeof _preset_res !== 'undefined') {
                        return _preset_res;
                    }
                    if (_w === null) {
                        return null;
                    }
                    if (typeof _w[_res_type] === 'function') {
                        return _w[_res_type]();
                    }
                    return _w[_res_type];
                }
            },
            /**
             * @param {string} key
             * @param {BaseSelectorParam|(function(string):SelectorPickupResult)} sel
             * @example
             * $$sel.add('list', className('ListView'));
             *  // recommended
             * console.log($$sel.get('list', 'bounds'));
             * // NullPointerException may occur
             * console.log($$sel.get('list').bounds());
             * // traditional way, and NullPointerException may occur
             * console.log(className('ListView').findOnce().bounds());
             */
            add(key, sel) {
                if (typeof sel === 'function') {
                    this._sel_body_pool[key] = type => sel(type);
                } else {
                    this._sel_body_pool[key] = type => this.pickup(sel, type);
                }
                return $_sel; // to make method chaining possible
            },
            /**
             * @param {string} key
             * @param {SelectorResultType|'cache'} [type]
             * @example
             * $$sel.add('list', className('ListView'));
             *  // recommended
             * console.log($$sel.get('list', 'bounds'));
             * // NullPointerException may occur
             * console.log($$sel.get('list').bounds());
             * // traditional way, and NullPointerException may occur
             * console.log(className('ListView').findOnce().bounds());
             * @throws {Error} `sel key '${key}' not set in pool`
             * @returns {SelectorPickupResult}
             */
            get(key, type) {
                if (!(key in this._sel_body_pool)) {
                    throw Error('Key \'' + key + '\' not set in pool');
                }
                let _picker = this._sel_body_pool[key];
                return !_picker ? null : type === 'cache'
                    ? (this._cache_pool[key] = _picker('w'))
                    : _picker(type);
            },
            /**
             * @param {string} key
             * @returns {SelectorPickupResult}
             */
            getAndCache(key) {
                // only 'widget' type can be returned
                return this.get(key, 'cache');
            },
            cache: {
                save: (key) => $_sel.getAndCache(key),
                /** @returns {SelectorPickupResult} */
                load(key, type) {
                    let _cache = $_sel._cache_pool[key];
                    return _cache ? $_sel.pickup(_cache, type) : null;
                },
                refresh(key) {
                    let _cache = $_sel._cache_pool[key];
                    _cache && _cache.refresh();
                    this.save(key);
                },
                reset(key) {
                    delete $_sel._cache_pool[key];
                    return $_sel.getAndCache(key);
                },
                recycle(key) {
                    let _cache = $_sel._cache_pool[key];
                    _cache && _cache.recycle();
                },
            },
        };
        return Object.assign($_sel, $_sel_ext);
    },
    enableByRoot() {
        try {
            let _cmd = ['enabled=$(settings get secure enabled_accessibility_services)',
                'pkg=' + autojs_a11y_svc_name, 'if [[ $enabled == *$pkg* ]]',
                'then', 'echo already_enabled', 'else', 'enabled=$pkg:$enabled',
                'settings put secure enabled_accessibility_services $enabled',
                'fi', 'settings put secure accessibility_enabled 1'].join('\n');
            return shell(_cmd, true).code === 0;
        } catch (e) {
            return false;
        }
    },
    enableByRootAndWaitFor(timeout) {
        let _tt = timeout || 1e3;
        return this.enableByRoot() && AccessibilityService.Companion.waitForEnabled(_tt);
    },
    goToAccessibilitySetting() {
        let _intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(_intent);
    },
};

module.exports = ext;
module.exports.load = () => {
    global.$$a11y = ext;
    global.$$sel = global.$$sel || ext.selector();
};