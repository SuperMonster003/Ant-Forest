global.$$a11y = typeof global.$$a11y === 'object' ? global.$$a11y : {};

let Secure = android.provider.Settings.Secure;

let _ctx_reso = context.getContentResolver();
let _aj_svc = context.packageName + '/com.stardust.autojs' +
    '.core.accessibility.AccessibilityService';

let ext = {
    /**
     * @param {IArguments} args
     * @returns {{svc: [string], forcible: boolean}}
     */
    _parseArgs(args) {
        let _svc = [_aj_svc];
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
        return Secure.getString(_ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES) || '';
    },
    bridge: {
        /**
         * @param {android.view.accessibility.AccessibilityWindowInfo} wi
         * @returns {boolean}
         * @private
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
            this.setWindowFilter(wi => this._isLatestPackage(wi));
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
                Secure.putString(_ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, _svc);
                Secure.putInt(_ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
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
                Secure.putString(_ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, '');
                Secure.putInt(_ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
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
                Secure.putString(_ctx_reso, Secure.ENABLED_ACCESSIBILITY_SERVICES, _svc);
                Secure.putInt(_ctx_reso, Secure.ACCESSIBILITY_ENABLED, 1);
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
            _services = [_aj_svc];
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
     * @param {Object} [options]
     * @param {boolean} [options.debug_info_flag]
     */
    selector(options) {
        let _opt = options || {};
        let _sel = Object.create(selector());

        let _sel_ext = {
            _sel_body_pool: {},
            _cache_pool: {},
            /**
             * @typedef {
             *     UiObject$|UiSelector$|string|RegExp|AdditionalSelector|
             *     (UiObject$|UiSelector$|string|RegExp|AdditionalSelector)[]
             * } UiSelector$pickup$sel_body
             */
            /**
             * @typedef {
             *     UiObjectCollection$|UiObject$|UiSelector$|AndroidRect$|string|boolean
             * } UiSelector$pickup$return_value
             */
            /**
             * @typedef {
             *     'w'|'widget'|'w_collection'|'widget_collection'|'w_c'|'widget_c'|'wc'|'widgets'|'s'|'sel'|'selector'|'e'|'exist'|'exists'|'t'|'txt'|'ss'|'sels'|'selectors'|'s_s'|'sel_s'|'selector_s'|'selstr'|'s_str'|'sel_str'|'selector_str'|'s_string'|'sel_string'|'selector_string'|UiObjectProperties|string
             * } UiSelector$pickup$res_type
             */
            /**
             * Returns a selector (UiSelector) or widget (UiObject) or some attribute values
             * If no widgets (UiObject) were found, returns null or '' or false
             * If memory keyword was found in this session memory, use a memorized selector directly
             * @function UiSelector$.prototype.pickup
             * @param {UiSelector$pickup$sel_body} sel_body
             * <br>
             *     -- array mode 1: [selector_body: any, compass: string]
             *     -- array mode 2: [selector_body: any, additional_sel: array|object, compass: string]
             * @param {string} [mem_sltr_kw] - memory keyword
             * @param {UiSelector$pickup$res_type} [res_type='widget'] -
             * <br>
             *     -- 'txt': available text()/desc() value or empty string
             *     -- 'clickable': boolean value of widget.clickable()
             *     -- 'wc': widget collection which is traversable
             * @param {Object} [options]
             * @param {'desc'|'text'} [options.selector_prefer='desc'] - unique selector you prefer to check first
             * @param {boolean} [options.debug_info_flag]
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
             * @returns {UiSelector$pickup$return_value}
             */
            pickup(sel_body, res_type, mem_sltr_kw, options) {
                let _sel_body = Array.isArray(sel_body) ? sel_body.slice() : [sel_body];
                let _options = Object.assign({}, _opt, options);
                let _res_type = (res_type || '').toString();

                if (!_res_type || _res_type.match(/^w(idget)?$/)) {
                    _res_type = 'widget';
                } else if (_res_type.match(/^(w(idget)?_?c(ollection)?|wid(get)?s)$/)) {
                    _res_type = 'widgets';
                } else if (_res_type.match(/^s(el(ector)?)?$/)) {
                    _res_type = 'selector';
                } else if (_res_type.match(/^e(xist(s)?)?$/)) {
                    _res_type = 'exists';
                } else if (_res_type.match(/^t(xt)?$/)) {
                    _res_type = 'txt';
                } else if (_res_type.match(/^s(el(ector)?)?(_?s)(tr(ing)?)?$/)) {
                    _res_type = 'selector_string';
                }

                if (typeof _sel_body[1] === 'string') {
                    // take it as 'compass' variety
                    _sel_body.splice(1, 0, '');
                }

                let [_body, _addi_sel, _compass] = _sel_body;

                let _sltr = _getSelector(_addi_sel);
                /** @type {UiObject$|null} */
                let _w = null;
                let _wc = [];
                if (_sltr && _sltr.toString().match(/UiObject/)) {
                    _w = _sltr;
                    if (_res_type === 'widgets') {
                        _wc = [_sltr];
                    }
                    _sltr = null;
                } else {
                    _w = _sltr ? _sltr.findOnce() : null;
                    if (_res_type === 'widgets') {
                        _wc = _sltr ? _sltr.find() : [];
                    }
                }

                if (_compass) {
                    _w = _relativeWidget([_sltr || _w, _compass]);
                }

                let _res = {
                    selector: _sltr,
                    widget: _w,
                    widgets: _wc,
                    exists: !!_w,
                    get selector_string() {
                        return _sltr ? _sltr.toString().match(/[a-z]+/)[0] : '';
                    },
                    get txt() {
                        let _text = _w && _w.text() || '';
                        let _desc = _w && _w.desc() || '';
                        return _desc.length > _text.length ? _desc : _text;
                    },
                };

                if (_res_type in _res) {
                    return _res[_res_type];
                }

                try {
                    return _w ? _w[_res_type]() : null;
                } catch (e) {
                    try {
                        return _w[_res_type];
                    } catch (e) {
                        console.warn(e.message);
                        return null;
                    }
                }

                // tool function(s)//

                function _getSelector(addition) {
                    let _mem_key = '_$_mem_sltr_' + mem_sltr_kw;
                    if (mem_sltr_kw) {
                        let _mem_sltr = global[_mem_key];
                        if (_mem_sltr) {
                            return _mem_sltr;
                        }
                    }
                    let _sltr = _selGenerator();
                    if (mem_sltr_kw && _sltr) {
                        global[_mem_key] = _sltr;
                    }
                    return _sltr;

                    // tool function(s) //

                    function _selGenerator() {
                        let _prefer = _options.selector_prefer;
                        let _sel_keys_abbr = {
                            bi$: 'boundsInside',
                            c$: 'clickable',
                            cn$: 'className',
                        };

                        if (_body instanceof com.stardust.automator.UiObject) {
                            addition && console.warn('UiObject无法使用额外选择器');
                            return _body;
                        }

                        if (_body instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                            return _chkSels(_body);
                        }

                        if (typeof _body === 'string') {
                            return _prefer === 'text'
                                ? _chkSels(text(_body), desc(_body), id(_body))
                                : _chkSels(desc(_body), text(_body), id(_body));
                        }

                        if (_body instanceof RegExp) {
                            return _prefer === 'text'
                                ? _chkSels(textMatches(_body), descMatches(_body), idMatches(_body))
                                : _chkSels(descMatches(_body), textMatches(_body), idMatches(_body));
                        }

                        if (_body && typeof _body === 'object') {
                            let _s = selector();
                            Object.keys(_body).forEach((k) => {
                                let _arg = _body[k];
                                let _k = k in _sel_keys_abbr ? _sel_keys_abbr[k] : k;
                                _s = _s[_k].apply(_s, Array.isArray(_arg) ? _arg : [_arg]);
                            });
                            return _s;
                        }

                        // tool function(s) //

                        function _chkSels(sels) {
                            let _sels = Array.isArray(sels) ? sels : [].slice.call(arguments);
                            for (let i = 0, l = _sels.length; i < l; i += 1) {
                                let _res = _chkSel(_sels[i]);
                                if (_res) {
                                    return _res;
                                }
                            }
                            return null;

                            // tool function(s) //

                            function _chkSel(sel) {
                                if (Array.isArray(addition)) {
                                    let _o = {};
                                    _o[addition[0]] = addition[1];
                                    addition = _o;
                                }
                                if (addition && typeof addition === 'object') {
                                    let _keys = Object.keys(addition);
                                    for (let i = 0, l = _keys.length; i < l; i += 1) {
                                        let _k = _keys[i];
                                        let _sel_k = _k in _sel_keys_abbr ? _sel_keys_abbr[_k] : _k;
                                        if (!sel[_sel_k]) {
                                            console.warn('无效的additional_selector属性值:');
                                            console.warn(_sel_k);
                                            return null;
                                        }
                                        let _arg = addition[_k];
                                        _arg = Array.isArray(_arg) ? _arg : [_arg];
                                        try {
                                            sel = sel[_sel_k].apply(sel, _arg);
                                        } catch (e) {
                                            console.warn('无效的additional_selector选择器:');
                                            console.warn(_sel_k);
                                            return null;
                                        }
                                    }
                                }
                                try {
                                    return sel && sel.exists() ? sel : null;
                                } catch (e) {
                                    return null;
                                }
                            }
                        }
                    }
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
                    if (_w === null || _w instanceof android.graphics.Rect) {
                        return null;
                    }
                    if (_w instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                        if (!(_w = _w.findOnce())) {
                            return null;
                        }
                    }
                    if (!(_w instanceof com.stardust.automator.UiObject)) {
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
            },
            /**
             * @param {string} key
             * @param {UiSelector$pickup$sel_body|(function(string):UiSelector$pickup$return_value)} sel_body
             * @param {string} [mem]
             * @example
             * $$sel.add('list', className('ListView'));
             *  // recommended
             * console.log($$sel.get('list', 'bounds'));
             * // NullPointerException may occur
             * console.log($$sel.get('list').bounds());
             * // traditional way, and NullPointerException may occur
             * console.log(className('ListView').findOnce().bounds());
             */
            add(key, sel_body, mem) {
                this._sel_body_pool[key] = typeof sel_body === 'function'
                    ? type => sel_body(type)
                    : type => this.pickup(sel_body, type, mem || key);
                return _sel; // to make method chaining possible
            },
            /**
             * @param {string} key
             * @param {UiSelector$pickup$res_type|'cache'} [type]
             * @example
             * $$sel.add('list', className('ListView'));
             *  // recommended
             * console.log($$sel.get('list', 'bounds'));
             * // NullPointerException may occur
             * console.log($$sel.get('list').bounds());
             * // traditional way, and NullPointerException may occur
             * console.log(className('ListView').findOnce().bounds());
             * @throws {Error} `sel key '${key}' not set in pool`
             * @returns {UiSelector$pickup$return_value|null}
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
            getAndCache(key) {
                // only 'widget' type can be returned
                return this.get(key, 'cache');
            },
            cache: {
                save: (key) => _sel.getAndCache(key),
                /** @returns {UiObject$|UiObjectCollection$|UiSelector$|AndroidRect$|string|boolean|null} */
                load(key, type) {
                    let _cache = _sel._cache_pool[key];
                    return _cache ? _sel.pickup(_cache, type) : null;
                },
                refresh(key) {
                    let _cache = _sel._cache_pool[key];
                    _cache && _cache.refresh();
                    this.save(key);
                },
                reset(key) {
                    delete _sel._cache_pool[key];
                    return _sel.getAndCache(key);
                },
                recycle(key) {
                    let _cache = _sel._cache_pool[key];
                    _cache && _cache.recycle();
                },
            },
        };

        return Object.assign(_sel, _sel_ext);
    },
};

module.exports = ext;
module.exports.load = () => {
    global.$$a11y = ext;
    global.$$sel = ext.selector();
};