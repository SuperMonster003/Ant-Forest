/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let GZIPInputStream = java.util.zip.GZIPInputStream;
let ByteArrayInputStream = java.io.ByteArrayInputStream;
let ByteArrayOutputStream = java.io.ByteArrayOutputStream;

let _ = {
    /** @type {Object.<Stringx.Comparison,function(any,any):boolean>} */
    compare: {
        '<': (a, b) => a < b,
        '<=': (a, b) => a <= b,
        '>': (a, b) => a > b,
        '>=': (a, b) => a >= b,
        '=': (a, b) => a === b,
    },
};

let ext = {
    string() {
        if (!String.prototype.toTitleCase) {
            Object.defineProperty(String.prototype, 'toTitleCase', {
                value() {
                    return this.replace(/([A-Za-z])([A-Za-z]*)/g, ($0, $1, $2) => {
                        return $1.toUpperCase() + $2.toLowerCase();
                    });
                },
            });
        }
        if (!String.prototype.capitalize) {
            Object.defineProperty(String.prototype, 'capitalize', {
                value() {
                    return this.valueOf().replace(/\b\w+\b/g, ($) => {
                        return $.charAt(0).toUpperCase() + $.slice(1);
                    });
                },
            });
        }
        if (!String.prototype.surround) {
            Object.defineProperty(String.prototype, 'surround', {
                /**
                 * @param {string|*} [pad]
                 * @param {Object} [options={}]
                 * @param {boolean} [options.no_symmetrical=false]
                 * @param {boolean} [options.no_intelli_brackets=false]
                 * @return {string}
                 */
                value(pad, options) {
                    if (isNullish(pad)) {
                        return this.valueOf();
                    }
                    let _opt = options || {};
                    let _is_intelli_brackets = _opt.no_intelli_brackets === undefined
                        || !_opt.no_intelli_brackets;
                    let _is_symmetrical = _opt.no_symmetrical === undefined
                        || !_opt.no_symmetrical;

                    let _brackets = [
                        '()', '[]', '{}', '<>', // half-width char
                        '（）', '［］', '｛｝', '〈〉', '《》', // full-width char
                        '〔〕', '【】', '〖〗', '‘’', '“”', // full-width char
                    ];
                    let _brackets_map = _genBracketsMap(_brackets);

                    let _pad = pad.toString();
                    let _pad_left = _pad.split('');
                    let _pad_right = _pad.split('');

                    if (_is_intelli_brackets) {
                        let _container = [];
                        if (_isValidParentheses(_pad, _brackets, _container)) {
                            [_pad_left, _pad_right] = _container;
                        } else {
                            _pad_left.forEach((s, i) => {
                                if (s in _brackets_map) {
                                    _pad_right[i] = _brackets_map[s];
                                }
                            });
                        }
                    }
                    if (_is_symmetrical) {
                        _pad_right = _pad_right.reverse();
                    }

                    return _pad_left.join('') + this.valueOf() + _pad_right.join('');

                    // tool function(s) //

                    function _genBracketsMap(elements) {
                        let _map = {};
                        elements.forEach((s) => {
                            _map[s[0]] = s[1];
                            _map[s[1]] = s[0];
                        });
                        return _map;
                    }

                    /**
                     * Returns if a string is valid parentheses
                     * @param {string} str
                     * @param {string[]} [brackets] - default: ['()','[]','{}']
                     * @param {string[][]} [container] - intermediate will be kept
                     * @example
                     * isValidParentheses('()'); // true
                     * isValidParentheses('()[]{}'); // true
                     * isValidParentheses('(]'); // false
                     * isValidParentheses('([)]'); // false
                     * isValidParentheses('{[]}'); // true
                     * @return {boolean}
                     * @see https://leetcode.com/problems/valid-parentheses/
                     */
                    function _isValidParentheses(str, brackets, container) {
                        let _brackets = brackets || ['()', '[]', '{}'];
                        let _brackets_map_left = _genBracketsMapLeft(_brackets);
                        let _brackets_map_right = _genBracketsMapRight(_brackets);

                        let _cache = [];
                        container = container || [];
                        container[0] = [];
                        container[1] = [];

                        for (let s of str) {
                            if (s in _brackets_map_left) {
                                _cache.push(s);
                                container[0].push(s);
                            } else if (s in _brackets_map_right) {
                                if (_brackets_map_right[s] !== _cache.pop()) {
                                    return false;
                                }
                                container[1].push(s);
                            } else {
                                return false;
                            }
                        }
                        return !_cache.length;

                        // tool function(s) //

                        function _genBracketsMapLeft(elements) {
                            let _map = {};
                            elements.forEach(s => _map[s[0]] = s[1]);
                            return _map;
                        }

                        function _genBracketsMapRight(elements) {
                            let _map = {};
                            elements.forEach(s => _map[s[1]] = s[0]);
                            return _map;
                        }
                    }
                },
            });
        }
        if (!String.unTap) {
            Object.defineProperty(String, 'unTap', {
                /**
                 * @param {string} s
                 * @return {string}
                 */
                value: (s) => {
                    let _map = [
                        ['A', 'B', 'C', 'D', 'E'],
                        ['F', 'G', 'H', 'I', 'J'],
                        ['L', 'M', 'N', 'O', 'P'],
                        ['Q', 'R', 'S', 'T', 'U'],
                        ['V', 'W', 'X', 'Y', 'Z'],
                    ];
                    let _mch = s.match(/../g);
                    return _mch ? _mch.reduce((a, b) => {
                        let [_row, _col] = b;
                        return a + (+_row ? _map[--_row][--_col] : _col);
                    }, String()) : String();
                },
            });
        }
        if (!String.unEsc) {
            Object.defineProperty(String, 'unEsc', {
                /**
                 * @param {string} s
                 * @return {string}
                 */
                value: (s) => typeof String.fromCharCode === 'function'
                    ? s.replace(/.{4}/g, $ => String.fromCharCode(parseInt($, 16)))
                    : unescape(s.replace(/.{4}/g, '%u$&')),
            });
        }
        if (!String.decodeGzip) {
            Object.defineProperty(String, 'decodeGzip', {
                /**
                 * @param {number[]} [bytes]
                 * @param [format='js_string']
                 */
                value(bytes, format) {
                    let os = new ByteArrayOutputStream();
                    let is = new GZIPInputStream(new ByteArrayInputStream(bytes));
                    let buffer = util.java.array('byte', 1024);
                    let num;
                    while ((num = is.read(buffer)) !== -1) {
                        os.write(buffer, 0, num);
                    }
                    // noinspection JSValidateTypes
                    let _str = new java.lang.String(os.toByteArray()).toString();
                    return format === 'json' ? JSON.parse(_str) : _str;
                },
            });
        }
    },
    object() {
        if (!Object.prototype.__proto__) {
            Object.defineProperty(Object.prototype, '__proto__', {
                /** @type {object|null} */
                get() {
                    return Object.getPrototypeOf(Object(this)) || this.__proto__;
                },
                /** @type {object|null} */
                set(proto) {
                    if (Object(proto) !== proto) {
                        throw TypeError('Proto must be an non-primitive type');
                    }
                    this.__proto__ = proto;
                },
                configurable: true,
            });
        }
        if (!Object.size) {
            Object.defineProperty(Object, 'size', {
                /**
                 * @param {Array|Object|*} o
                 * @param {Object} [options]
                 * @param {string|string[]} [options.exclude=[]]
                 * @param {string|string[]} [options.include=[]]
                 * @return {number}
                 */
                value(o, options) {
                    if (Array.isArray(o)) {
                        return o.length;
                    }
                    if (!isObjectSpecies(o)) {
                        return -1;
                    }
                    let _arrayify = o => Array.isArray(o) ? o : o === undefined ? [] : [o];
                    let _opt = options || {};

                    let _inc = _arrayify(_opt.include);
                    let _exc = _arrayify(_opt.exclude);

                    return Object.keys(o).filter((k) => {
                        return _inc.length ? _inc.includes(k) : !_exc.includes(k);
                    }).length;
                },
            });
        }
        if (!Object.getOwnNonEnumerableNames) {
            Object.defineProperty(Object, 'getOwnNonEnumerableNames', {
                /**
                 * @param {Object} o
                 * @return {string[]}
                 */
                value(o) {
                    return Object.getOwnPropertyNames(o).filter((n) => {
                        // CAUTION
                        //  ! o.propertyIsEnumerable may be undefined
                        //  ! because proto of o may be null
                        return !Object.prototype.propertyIsEnumerable.call(o, n);
                    });
                },
            });
        }
        if (!Object.getNonEnumerableNames) {
            Object.defineProperty(Object, 'getNonEnumerableNames', {
                /**
                 * @param {Object} o
                 * @return {string[]}
                 */
                value(o) {
                    let _o = o;
                    let _res = {};
                    while (_o !== null) {
                        Object.getOwnNonEnumerableNames(_o).forEach((n) => {
                            _res[n] = _res[n] || true;
                        });
                        _o = Object.getPrototypeOf(_o);
                    }
                    return Object.keys(_res);
                },
            });
        }
        if (!Object.getAllPropertyNames) {
            Object.defineProperty(Object, 'getAllPropertyNames', {
                /**
                 * @param {Object} o
                 * @return {string[]}
                 */
                value(o) {
                    let _o = o;
                    let _res = {};
                    while (_o !== null) {
                        Object.getOwnPropertyNames(_o).forEach((n) => {
                            _res[n] = _res[n] || true;
                        });
                        _o = Object.getPrototypeOf(_o);
                    }
                    return Object.keys(_res);
                },
            });
        }
        if (!Object.assignDescriptors) {
            Object.defineProperty(Object, 'assignDescriptors', {
                /**
                 * @param {Object} o
                 * @param {...Object} descriptors
                 */
                value(o, descriptors) {
                    if (descriptors !== undefined) {
                        let _args = [].slice.call(arguments);
                        let _i = _args.length;
                        while (_i-- > 1) {
                            let _descriptors = Object.getOwnPropertyDescriptors(_args[_i]);
                            Object.defineProperties(o, _descriptors);
                        }
                    }
                    return o;
                },
            });
        }
        if (!Object.shallowClone) {
            Object.defineProperty(Object, 'shallowClone', {
                /**
                 * @template T
                 * @param {T} [o]
                 * @return {T}
                 */
                value(o) {
                    return isObjectSpecies(o)
                        ? Object.create(Object.getPrototypeOf(o), Object.getOwnPropertyDescriptors(o))
                        : Array.isArray(o) ? o.slice() : o;
                },
            });
        }
        if (!Object.deepClone) {
            Object.defineProperty(Object, 'deepClone', {
                /**
                 * @template T
                 * @param {T} [o]
                 * @return {T}
                 */
                value: function clone(o) {
                    if (isObjectSpecies(o)) {
                        let _tmp = {};
                        Object.getOwnPropertyNames(o).forEach((k) => {
                            let _des = Object.getOwnPropertyDescriptor(o, k);
                            if (typeof _des.value === 'object') {
                                _des.value = clone(_des.value);
                            }
                            Object.defineProperty(_tmp, k, _des);
                        });
                        return _tmp;
                    }
                    return Array.isArray(o) ? o.map(clone) : o;
                },
            });
        }
        if (!Object.isDeepEqual) {
            Object.defineProperty(Object, 'isDeepEqual', {
                /**
                 * @param {any} a
                 * @param {any} b
                 * @return {boolean}
                 */
                value: function isEqual(a, b) {
                    if (isObjectSpecies(a) && isObjectSpecies(b)) {
                        let _pna = Object.getOwnPropertyNames(a);
                        let _pnb = Object.getOwnPropertyNames(b);
                        return _pna.length === _pnb.length
                            && _pna.every(k => isEqual(a[k], b[k]));
                    }
                    if (Array.isArray(a) && Array.isArray(b)) {
                        return a.length === b.length
                            && a.every((e, i) => isEqual(e, b[i]));
                    }
                    if (Number.isNaN(a)) {
                        return Number.isNaN(b);
                    }
                    return a === b;
                },
            });
        }
        if (!Object.ensureKey) {
            Object.defineProperty(Object, 'ensureKey', {
                /**
                 * @param {Object} o
                 * @param {any|any[]} k
                 * @param {any} [def]
                 */
                value: function ensure(o, k, def) {
                    if (!Array.isArray(k)) {
                        if (!isObjectSpecies(o)) {
                            throw Error('Param "o" must be a plain object');
                        }
                        if (typeof k === 'undefined') {
                            throw Error('Param "k" must be defined');
                        }
                        if (!(k in o)) {
                            o[k] = def;
                        }
                    } else {
                        if (k.length < 2) {
                            ensure(o, k.pop(), def);
                        } else {
                            let _k = k.shift();
                            ensure(o, _k, {});
                            ensure(o[_k], k, def);
                        }
                    }
                },
            });
        }
    },
    function() {
        if (!Function.prototype.toRegular) {
            Object.defineProperty(Function.prototype, 'toRegular', {
                value() {
                    let _this = this;
                    return typeof this.prototype === 'object' ? this : function () {
                        return _this.apply(null, arguments);
                    };
                },
            });
        }
        if (!Function.prototype.toRegularAndCall) {
            Object.defineProperty(Function.prototype, 'toRegularAndCall', {
                value(o) {
                    return this.toRegular().apply(null, arguments);
                },
            });
        }
        if (!Function.prototype.toRegularAndApply) {
            Object.defineProperty(Function.prototype, 'toRegularAndApply', {
                value(args) {
                    if (!Array.isArray(args)) {
                        throw Error('Param args must be an Array');
                    }
                    return this.toRegular().apply(null, args);
                },
            });
        }
    },
};

/**
 * @type {Mod.Global}
 */
module.exports = {
    $$0: x => x === 0,
    $$nul: o => o === null,
    $$und: o => typeof o === 'undefined',
    $$bool: o => typeof o === 'boolean',
    $$symb: o => typeof o === 'symbol',
    $$bigint: x => typeof x === 'bigint',
    $$func: f => typeof f === 'function',
    $$arr: o => Array.isArray(o),
    $$obj: o => isObjectSpecies(o),
    $$rex: o => o instanceof RegExp,
    $$xml: o => /^xml$/.test(typeof o),
    $$T: o => o === true,
    $$F: o => o === false,
    $$num(x) {
        let _args = arguments;
        let _len = _args.length;
        if (_len === 0) {
            return false;
        }
        if (_len === 1) {
            return typeof x === 'number';
        }
        if (_len === 2) {
            return x === _args[1];
        }
        for (let i = 1; i < _len; i += 2) {
            let _opr = _args[i]; // operational symbol
            if (typeof _opr !== 'string' || !(_opr in _.compare)) {
                return false;
            }
            let _b = _args[i + 1];
            if (typeof _b !== 'number') {
                return false;
            }
            let _a = _args[i - 1];
            if (!_.compare[_opr](_a, _b)) {
                return false;
            }
        }
        return true;
    },
    $$str(s) {
        let _args = arguments;
        let _len = _args.length;
        if (_len === 0) {
            return false;
        }
        if (_len === 1) {
            return typeof s === 'string';
        }
        if (_len === 2) {
            return s === _args[1];
        }

        let _args_arr = [];
        for (let i = 0; i < _len; i += 1) {
            _args_arr[i] = _args[i].toString();
        }

        for (let i = 1; i < _len; i += 2) {
            let _opr = _args_arr[i]; // operational symbol
            if (!(_opr in _.compare)) {
                return false;
            }
            let _a = _args_arr[i - 1];
            let _b = _args_arr[i + 1];
            if (!_.compare[_opr](_a, _b)) {
                return false;
            }
        }
        return true;
    },
    isEmptyObject(o) {
        return isObjectSpecies(o)
            && Object.keys(Object.getOwnPropertyDescriptors(o)).length === 0;
    },
    isNonEmptyObject(o) {
        return isObjectSpecies(o)
            && Object.keys(Object.getOwnPropertyDescriptors(o)).length > 0;
    },
    isNormalFunction(f) {
        return typeof f === 'function' && isObjectSpecies(f.prototype);
    },
    isArrowFunction(f) {
        return typeof f === 'function' && !isObjectSpecies(f.prototype);
    },
    isXMLType(o) {
        return /^xml$/.test(typeof o);
    },
    requirex(file_name) {
        let _ = p => files.exists(p) && global.require(files.path(p));
        let _p = file_name;
        if (!_p.match(/\.js$/)) {
            _p += '.js';
        }
        let _mod = _('modules/' + _p) || _(_p) || _('../modules/' + _p);
        if (typeof _mod === 'object') {
            return _mod;
        }
        throw Error('Cannot locate module "' + file_name + '" for global.requirex()');
    },
    $$link: function $$link$iiFe() {
        let _ = {
            init() {
                delete this.is_break;
                return this;
            },
            invoke(f) {
                if (typeof f !== 'function') {
                    throw TypeError('$$link invoked with a non-function argument');
                }
                try {
                    this.is_break = f() === '__BREAK__';
                } catch (e) {
                    this.is_break = true;
                    if (!e.message.match(/InterruptedException/)) {
                        throw Error(e + '\n' + e.stack);
                    }
                    // Prevent next function to link from being invoked immediately
                    sleep(420);
                }
            },
        };

        // @Lazy
        return function $$link(f) {
            _.init().invoke(f);

            // @Overwrite
            $$link = function (f) {
                _.is_break || _.invoke(f);
                return $$link.$ = $$link;
            };

            return $$link.$ = $$link;
        };
    }(),
    $$cvt: function $$cvt$iiFe() {
        let $ = {
            parse(src, init_unit, options, presets) {
                let _init = isNullish(init_unit) ? {} : {init_unit: init_unit};
                return $$cvt(src, Object.assign(presets, _init, options));
            },
        };

        let $$cvt = function (src, options) {
            let $ = {
                options: options || {},
                parseArgs() {
                    this.step = this.options.step;
                    this.pot_step = this.options.potential_step;
                    this.ori_units = this.options.units;
                    this.init_unit = this.options.init_unit;
                    this.fixed = this.options.fixed;

                    this.parseSrc();
                    this.parseSpace();
                    this.parseUnits();
                },
                parseSrc() {
                    this.src = typeof src === 'string'
                        ? Number(src.split(/,\s*/).join(''))
                        : Number(src);
                },
                parseSpace() {
                    this.space = this.options.space;

                    if (isNullish(this.space)) {
                        this.space = String();
                    }
                    if (this.space === true) {
                        this.space = ' ';
                    }
                },
                parseUnits() {
                    this.units = [];
                    this.ori_units.forEach((o) => {
                        if (typeof o === 'string' && o.match(/\w+\|\w+/)) {
                            o.split('|').reverse().forEach((u, i) => {
                                i ? this.units.push(1, u) : this.units.push(u);
                            });
                        } else {
                            this.units.push(o);
                        }
                    });
                    this.init_unit = this.init_unit || this.units[0];
                },
                generateUnitMap() {
                    this.unit_map = {};
                    this.unit_map[this.units[0]] = [1, 1];

                    let _accu_step = 1;
                    let _max = this.units.length;

                    for (let i = 1; i < _max; i += 1) {
                        let _unit = this.units[i];
                        let _tmp_pot_val;

                        if (typeof _unit === 'number') {
                            _tmp_pot_val = _accu_step * (this.pot_step || _unit);
                            _accu_step *= _unit;
                            _unit = this.units[++i];
                        } else if (Array.isArray(_unit)) {
                            let _steps = _unit.sort((a, b) => a < b ? 1 : -1);
                            _tmp_pot_val = _accu_step * _steps[1];
                            _accu_step *= _steps[0];
                            _unit = this.units[++i];
                        } else {
                            _tmp_pot_val = _accu_step * (this.pot_step || this.step);
                            _accu_step *= this.step;
                        }
                        this.unit_map[_unit] = [_accu_step, _tmp_pot_val || _accu_step];
                    }
                },
                calc(value) {
                    let _res = Number((this.src / value).toFixed(12));
                    if (typeof this.fixed === 'number') {
                        if (this.fixed !== -1) {
                            return Number(_res.toFixed(this.fixed));
                        }
                    } else {
                        if (_res * 1e3 >> 0 !== _res * 1e3) {
                            return Number(_res.toFixed(2));
                        }
                    }
                    return _res;
                },
                getResult() {
                    this.parseArgs();
                    this.generateUnitMap();

                    if (this.units.includes(this.init_unit)) {
                        this.src *= this.unit_map[this.init_unit][0];
                    }
                    return this.units.filter(u => u in this.unit_map).reverse()
                        .some((u, idx, arr) => {
                            let [_unit_val, _pot_val] = this.unit_map[u];
                            if (this.src >= _pot_val || idx === arr.length - 1) {
                                return this.result = this.calc(_unit_val) + this.space + u;
                            }
                        }) ? this.result : String();
                },
            };

            return $.getResult();
        };

        /**
         * @return {string}
         */
        $$cvt.bytes = function (src, init_unit, options) {
            return $.parse(src, init_unit, options, {
                step: 1024, potential_step: 1000,
                /** @type {$$Cvt.Bytes.InitUnit[]} */
                units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            });
        };

        /**
         * @param {$$Cvt.Source} src
         * @param {?$$Cvt.Time.InitUnit|$$Cvt.Time.Language|$$Cvt.Options} [init_unit='ms']
         * @param {$$Cvt.Time.Language|$$Cvt.Options} [language='$en']
         * @param {$$Cvt.Options} [options]
         * @return {string}
         */
        $$cvt.time = function (src, init_unit, language, options) {
            // @Overload
            if (typeof init_unit === 'object') {
                return this.time(src, '', '$en', init_unit);
            }

            // @Overload
            if (typeof init_unit === 'string' && init_unit.startsWith('$')) {
                return this.time(src, '', init_unit, language);
            }

            // @Overload
            if (typeof language === 'object') {
                return this.time(src, init_unit, '$en', language);
            }

            return $.parse(src, init_unit, options, {
                step: 60,
                /** @type {$$Cvt.Time.InitUnits} */
                units: language === '$zh'
                    ? ['毫秒', 1e3, '秒', '分钟', '小时', 24, '天']
                    : ['ms', 1e3, 's', 'm', 'h', 24, 'd'],
            });
        };

        /**
         * @param {$$Cvt.Source} src
         * @param {$$Cvt.Linear.InitUnit} [init_unit='mm']
         * @param {$$Cvt.Options} [options]
         * @return {string}
         */
        $$cvt.linear = function (src, init_unit, options) {
            return $.parse(src, init_unit, options, {
                step: 1e3, init_unit: 'mm',
                /** @type {$$Cvt.Linear.InitUnits} */
                units: ['am', 'fm', 'pm', 'nm', 'μm|um', 'mm', 10, 'cm', 10, 'dm', 10, 'm', 'km'],
            });
        };

        /**
         * @param {$$Cvt.Source} src
         * @param {$$Cvt.Number.InitUnit} [init_unit='one']
         * @param {$$Cvt.Options} [options]
         * @return {string}
         */
        $$cvt.number = function (src, init_unit, options) {
            return $.parse(src, init_unit, options, {
                step: 1e3, space: true,
                /** @type {$$Cvt.Number.InitUnits} */
                units: ['one', 100, 'hundred', 10, 'thousand', 'million', 'billion',
                    'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion',
                    'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion',
                    'tredecillion', 'quattuordecillion', 'quindecillion'],
            });
        };

        /**
         * @param {$$Cvt.Date.Source} [src=Date()]
         * @param {$$Cvt.Date.Format} [format='yyyy/MM/dd hh:mm:ss']
         */
        $$cvt.date = function (src, format) {
            let _date = _parseDate(src || new Date());
            let _fmt = (format || 'yyyy/MM/dd hh:mm:ss').toString();
            if (_fmt.toUpperCase() === 'ISO') {
                let _d = new Date(_date);
                let _ts = _d.getTime() + _d.getTimezoneOffset() * 60e3;
                let _format = 'yyyy-MM-dd' + 'T' + 'hh:mm:ss.SSS' + 'Z';
                return this.date(_ts, _format);
            }

            let _yyyy = _date.getFullYear();
            let _yy = _yyyy.toString().slice(-2);
            let _M = _date.getMonth() + 1;
            let _MM = _M.toString().padStart(2, '0');
            let _d = _date.getDate();
            let _dd = _d.toString().padStart(2, '0');
            let _h = _date.getHours();
            let _hh = _h.toString().padStart(2, '0');
            let _m = _date.getMinutes();
            let _mm = _m.toString().padStart(2, '0');
            let _s = _date.getSeconds();
            let _ss = _s.toString().padStart(2, '0');
            let _milli = (_date.getMilliseconds() % 1e3);
            let _S = _milli.toString().padEnd(3, '0').slice(0, 1);
            let _SS = _milli.toString().padEnd(3, '0').slice(0, 2);
            let _SSS = _milli.toString().padEnd(3, '0').slice(0, 3);

            let _units = {
                yyyy: _yyyy, yy: _yy,
                MM: _MM, M: _M,
                dd: _dd, d: _d,
                hh: _hh, h: _h,
                mm: _mm, m: _m,
                ss: _ss, s: _s,
            };
            let _descriptor = function (ret_val) {
                let _this = this;
                return {
                    get() {
                        delete _this.S;
                        delete _this.SS;
                        delete _this.SSS;
                        return ret_val;
                    },
                    configurable: true,
                };
            };
            Object.defineProperties(_units, {
                S: _descriptor.call(_units, _S),
                SS: _descriptor.call(_units, _SS),
                SSS: _descriptor.call(_units, _SSS),
            });

            return _parseFormat(_fmt);

            // tool function(s) //

            function _parseDate(t) {
                if (t instanceof Date) {
                    return t;
                }
                if (typeof t === 'number') {
                    return new Date(t);
                }
                if (typeof t === 'string') {
                    if (t.match(/^\d+$/)) {
                        if (t.length === 8) {
                            // taken as date
                            // like '20110523' -> '2011/05/23 00:00:00'
                            t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                return i > 1 ? '/' + s : s;
                            }).join('');
                        } else if (t.length === 12) {
                            // taken as short year and full time
                            // like '110523163208' -> '2011/05/23 16:32:08'
                            t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                return i === 0
                                    ? new Date().getFullYear().toString().slice(0, 2) + s
                                    : i < 3 ? '/' + s : i === 3 ? ' ' + s : i < 6 ? ':' + s : s;
                            }).join('');
                        } else if (t.length === 14) {
                            // taken as full date and full time
                            // like '20110523163208' -> '2011/05/23 16:32:08'
                            t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                return i > 1 && i < 4
                                    ? '/' + s : i === 4
                                        ? ' ' + s : i > 4 && i < 7
                                            ? ':' + s : s;
                            }).join('');
                        }
                    }
                    let _date = new Date(t);
                    if (_date.toString() === 'Invalid Date') {
                        throw Error('Invalid Date');
                    }
                    return _date;
                }
                return new Date();
            }

            function _parseFormat(str) {
                let _res = '';

                while (str.length) {
                    let _max = 4;
                    while (_max) {
                        let _unit = str.slice(0, _max);
                        if (_unit in _units) {
                            _res += _units[_unit];
                            str = str.slice(_max);
                            break;
                        }
                        _max -= 1;
                    }
                    if (!_max) {
                        _res += str[0];
                        str = str.slice(1);
                    }
                }

                return _res;
            }
        };

        /**
         * @param {string} src
         * @param {Object} [query]
         * @param {string|string[]} [exclude]
         * @return {string}
         */
        $$cvt.url = function (src, query, exclude) {
            if (!src) {
                throw Error('Source url is required for $$cvt.url()');
            }
            if (!query) {
                return src;
            }
            let _sep = src.match(/\?/) ? '&' : '?';
            return src + _sep + _parseObj(query);

            // tool function(s) //

            function _parseObj(o) {
                let _exclude = exclude || [];
                if (!Array.isArray(_exclude)) {
                    _exclude = [_exclude];
                }
                return Object.keys(o).map((key) => {
                    let _val = o[key];
                    if (typeof _val === 'object') {
                        _val = '&' + _parseObj(_val);
                    }
                    if (!_exclude.includes(key)) {
                        _val = encodeURI(_val);
                    }
                    return key + '=' + _val;
                }).join('&');
            }
        };

        return $$cvt;
    }(),
    $$impeded: function $$impeded$iiFe() {
        let _ = {
            events_counter: 0,
            border() {
                console.log('- '.repeat(17).trim());
            },
            msg(m) {
                this.border();
                [].slice.call(arguments).forEach(m => console.log(m));
                this.border();
            },
            trigger() {
                return this.events_counter > 0;
            },
            increase() {
                this.events_counter += 1;
            },
            decrease() {
                this.events_counter -= 1;
            },
            reset() {
                this.events_counter = 0;
            },
            onTrigger(name) {
                this.msg('检测到全局事件触发信号', name + '被迫阻塞');
            },
            onRelease(name) {
                this.msg('全局事件触发信号全部解除', name + '解除阻塞');
            },
        };

        let $$impeded = function (name) {
            let _name = name || '%method%';
            if (_.trigger()) {
                _.onTrigger(_name);
                while (_.trigger()) {
                    sleep(200);
                }
                _.onRelease(_name);
            }
        };

        Object.assign($$impeded, {
            increase: () => _.increase(),
            decrease: () => _.decrease(),
            reset: () => _.reset(),
            detach(fn, options_idx) {
                if (typeof fn !== 'function') {
                    throw TypeError('Param "fn" for $$impeded.detach ' +
                        'must be defined as a function');
                }
                if (typeof options_idx !== 'number') {
                    throw TypeError('Param "options_idx" for $$impeded.detach ' +
                        'must be defined as a number');
                }
                return function () {
                    let _args = [].slice.call(arguments);
                    _args[options_idx] = typeof _args[options_idx] === 'object'
                        ? Object.assign(_args[options_idx], {no_impeded: true})
                        : {no_impeded: true};
                    return fn.apply(null, _args);
                };
            },
        });

        return $$impeded;
    }(),
    $bind() {
        Object.keys(ext).forEach(k => ext[k]());

        delete this.$bind;
        return this;
    },
};
module.exports.$bind();