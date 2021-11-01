/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Looper = android.os.Looper;
let Toast = android.widget.Toast;
let Runnable = java.lang.Runnable;
let GZIPInputStream = java.util.zip.GZIPInputStream;
let ByteArrayInputStream = java.io.ByteArrayInputStream;
let ByteArrayOutputStream = java.io.ByteArrayOutputStream;

global.de = Packages.de;
global.okhttp3 = Packages.okhttp3;
global.androidx = Packages.androidx;

let _ = {
    /** @type {Object.<Stringx.Comparison,function(any,any):boolean>} */
    compare: {
        '<': (a, b) => a < b,
        '<=': (a, b) => a <= b,
        '>': (a, b) => a > b,
        '>=': (a, b) => a >= b,
        '=': (a, b) => a === b,
    },
    isNullish: o => o === null || o === undefined,
    isPlainObject: o => Object.prototype.toString.call(o).slice(8, -1) === 'Object',
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
                    if (_.isNullish(pad)) {
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
        if (!String.prototype.ts) {
            Object.defineProperty(String.prototype, 'ts', {
                /**
                 * @return {string}
                 */
                get() {
                    let _s = String(this);
                    let _bt = '`'; // backtick
                    if (_s.length < 2 || _s[0] !== _bt || _s[_s.length - 1] !== _bt) {
                        return _s;
                    }
                    let _backticks, _is_internal;
                    while ((_backticks = _getBackticks(_s))) {
                        let [_l, _r] = _backticks; // left/right index
                        let _q = _is_internal ? '"' : ''; // quotation mark
                        _s = _s.slice(0, _l++) + _q + _parse(_s.slice(_l, _r++)) + _q + _s.slice(_r);
                    }
                    return _s;

                    // tool function(s) //

                    function _getBackticks(str) {
                        let _bts = [];
                        Object.values(str).forEach((s, i) => s === _bt && _bts.push(i));
                        let _half_len = _bts.length / 2;
                        if (_half_len >> 0 !== _half_len) {
                            throw Error('Backticks must come in pairs');
                        }
                        _is_internal = _half_len > 1;
                        return _half_len ? _bts.slice(_half_len - 1, _half_len + 1) : null;
                    }

                    function _parse(str) {
                        return str.replace(/\${(.*?)}/g, ($0, $1) => Function('return\x20' + $1)());
                    }
                },
                configurable: true,
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
                    if (!_.isPlainObject(o)) {
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
            /**
             * @template T
             * @param {T} [o]
             * @return {T}
             */
            Object.shallowClone = (o) => _.isPlainObject(o)
                ? Object.create(Object.getPrototypeOf(o), Object.getOwnPropertyDescriptors(o))
                : Array.isArray(o) ? o.slice() : o;
        }
        if (!Object.deepClone) {
            Object.defineProperty(Object, 'deepClone', {
                /**
                 * @template T
                 * @param {T} [o]
                 * @return {T}
                 */
                value: function clone(o) {
                    if (_.isPlainObject(o)) {
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
                    if (_.isPlainObject(a) && _.isPlainObject(b)) {
                        let _pna = Object.getOwnPropertyNames(a);
                        let _pnb = Object.getOwnPropertyNames(b);
                        return _pna.length === _pnb.length
                            && _pna.every(k => isEqual(a[k], b[k]));
                    }
                    if (Array.isArray(a) && Array.isArray(b)) {
                        return a.length === b.length
                            && a.every((e, i) => isEqual(e, b[i]));
                    }
                    return a === b;
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
    number() {
        if (!Number.prototype.ICU) {
            Object.defineProperty(Number.prototype, 'ICU', {
                value: (function $iiFe() {
                    let _workdays = 5;
                    let _weekends = 2;
                    let _health = '[your health]';
                    let _evil = 'Hard working only'
                        .split(new RegExp(_health))
                        .map(x => x ? x.charCodeAt(0) : 996 / _workdays / _weekends - _weekends)
                        .reduce((x, y) => x + y);
                    return Math.round(_evil);
                })(),
            });
        }
        if (!Number.prototype.clamp) {
            Object.defineProperty(Number.prototype, 'clamp', {
                /**
                 * @param {...number|*} [args]
                 * @return {number}
                 */
                value(args) {
                    let _num = this.valueOf();
                    let _args = (!Array.isArray(args) ? [].slice.call(arguments) : args)
                        .map(x => Number(x)).filter(x => !isNaN(x))
                        .sort((x, y) => x === y ? 0 : x > y ? 1 : -1);
                    let _len = _args.length;
                    if (_len) {
                        let _min = _args[0];
                        let _max = _args[_len - 1];
                        if (_num < _min) {
                            return _min;
                        }
                        if (_num > _max) {
                            return _max;
                        }
                    }
                    return _num;
                },
            });
        }
        if (!Number.prototype.toFixedNum) {
            Object.defineProperty(Number.prototype, 'toFixedNum', {
                /**
                 * @param {number} [fraction=0]
                 * @return {number}
                 */
                value(fraction) {
                    return Number(this.toFixed(fraction));
                },
            });
        }
        if (!Number.prototype.padStart) {
            if (String.prototype.padStart) {
                /**
                 * @param {number} target_len
                 * @param {string|number} [pad_str='\x20']
                 * @return {string}
                 */
                Object.defineProperty(Number.prototype, 'padStart', {
                    value(target_len, pad_str) {
                        let _this = this.toString();
                        return _this.padStart.call(_this, target_len, pad_str || 0);
                    },
                });
            }
        }
        if (!Number.prototype.padEnd) {
            if (String.prototype.padEnd) {
                /**
                 * @param {number} target_len
                 * @param {string|number} [pad_str='\x20']
                 * @return {string}
                 */
                Object.defineProperty(Number.prototype, 'padEnd', {
                    value(target_len, pad_str) {
                        let _this = this.toString();
                        return _this.padEnd.call(_this, target_len, pad_str || 0);
                    },
                });
            }
        }
        if (!Number.parsePct) {
            Object.defineProperty(Number, 'parsePct', {
                /**
                 * @param {Percentage$} percentage
                 * @return {number}
                 */
                value(percentage) {
                    if (typeof percentage === 'string') {
                        let _mch = percentage.replace(/\s*/g, '').match(/^(\d+(?:\.\d+)?)(%+)$/);
                        if (_mch) {
                            let _res = Number(_mch[1]);
                            for (let i = 0, max = _mch[2].length; i < max; i += 1) {
                                _res /= 100;
                            }
                            return _res;
                        }
                    }
                    return NaN;
                },
            });
        }
    },
    math() {
        let $ = {
            parseArgs(num_arr, fraction) {
                let _arr, _fraction;
                if (Array.isArray(num_arr)) {
                    _arr = this.spreadArr(num_arr);
                    _fraction = fraction;
                } else {
                    _arr = this.spreadArr(arguments);
                }
                return [_arr, _fraction];
            },
            spreadArr(arr) {
                let _plain = [];
                let _len = (arr || []).length;
                for (let i = 0; i < _len; i += 1) {
                    let _e = arr[i];
                    Array.isArray(_e)
                        ? _plain = _plain.concat(this.spreadArr(_e))
                        : _plain.push(_e);
                }
                return _plain;
            },
        };

        if (!Math.rand) {
            Object.defineProperty(Math, 'rand', {
                /**
                 * @param {number[]|number} [range=[0,1]]
                 * @param {number} [fraction]
                 * @return {number}
                 */
                value(range, fraction) {
                    let _min, _max;
                    let _gap = () => _max - _min;

                    if (!Array.isArray(range)) {
                        range = [0, range || 1];
                    }
                    range = range
                        .map(x => typeof x === 'number' && !isFinite(x) && !isNaN(x)
                            ? Object.is(0 / x, 0)
                                ? Number.MAX_SAFE_INTEGER
                                : Number.MIN_SAFE_INTEGER
                            : +x)
                        .filter(x => !isNaN(x))
                        .sort((a, b) => a === b ? 0 : a > b ? 1 : -1);
                    _min = range[0];
                    _max = range[range.length - 1];

                    let _rand = Math.random() * _gap() + _min;
                    if (typeof fraction === 'undefined') {
                        return _rand;
                    }
                    if (Object.is(fraction, -0)) {
                        return Math.floor(_rand);
                    }
                    return +_rand.toFixed(+fraction || 0);
                },
            });
        }
        if (!Math.sum) {
            Object.defineProperty(Math, 'sum', {
                /**
                 * @param {number|number[]} [num]
                 * @param {?number} [fraction]
                 * @return {number}
                 */
                value(num, fraction) {
                    let [_arr, _frac] = $.parseArgs.apply($, arguments);
                    if (!_arr.length) {
                        return 0;
                    }
                    let _sum = _arr.reduce((a, b) => {
                        let [_a, _b] = [+a, +b].map(x => isNaN(x) ? 0 : x);
                        return _a + _b;
                    });
                    let _frac_num = parseInt(_frac);
                    return isNaN(_frac_num) ? _sum : +_sum.toFixed(_frac_num);
                },
            });
        }
        if (!Math.avg) {
            Object.defineProperty(Math, 'avg', {
                /**
                 * @param {number|number[]} [num]
                 * @param {?number} [fraction]
                 * @return {number}
                 */
                value(num, fraction) {
                    let [_arr, _frac] = $.parseArgs.apply($, arguments);
                    let _filtered = _arr.filter(x => !isNaN(+x));
                    if (!_filtered.length) {
                        return NaN;
                    }
                    let _sum = _filtered.reduce((a, b) => +a + +b);
                    let _avg = _sum / _filtered.length;
                    let _frac_num = parseInt(_frac);
                    return isNaN(_frac_num) ? _avg : +_avg.toFixed(_frac_num);
                },
            });
        }
        if (!Math.median) {
            Object.defineProperty(Math, 'median', {
                /**
                 * @param {number|number[]} [num]
                 * @param {?number} [fraction]
                 * @return {number}
                 */
                value(num, fraction) {
                    let [_arr, _frac] = $.parseArgs.apply($, arguments);
                    let _filtered = _arr.filter(x => !isNaN(+x));
                    if (!_filtered.length) {
                        return NaN;
                    }
                    _filtered.sort((a, b) => {
                        let _a = Number(a);
                        let _b = Number(b);
                        return _a === _b ? 0 : _a > b ? 1 : -1;
                    });
                    let _len = _filtered.length;
                    let _med = _len % 2
                        ? _filtered[Math.floor(_len / 2)]
                        : (_filtered[_len / 2 - 1] + _filtered[_len / 2]) / 2;
                    let _frac_num = parseInt(_frac);
                    return isNaN(_frac_num) ? _med : +_med.toFixed(_frac_num);
                },
            });
        }
        if (!Math.var) {
            Object.defineProperty(Math, 'var', {
                /**
                 * @param {number|number[]} [num]
                 * @param {?number} [fraction]
                 * @return {number}
                 */
                value(num, fraction) {
                    let [_arr, _frac] = $.parseArgs.apply($, arguments);
                    if (!_arr.length) {
                        return NaN;
                    }
                    let _filtered = _arr.filter(x => !isNaN(+x));
                    let _avg = Math.avg(_filtered);
                    let _len = _filtered.length;

                    let _acc = 0;
                    for (let i = 0; i < _len; i += 1) {
                        _acc += Math.pow((_filtered[i] - _avg), 2);
                    }
                    let _var = _acc / _len;
                    let _frac_num = parseInt(_frac);
                    return isNaN(_frac_num) ? _var : +_var.toFixed(_frac_num);
                },
            });
        }
        if (!Math.std) {
            Object.defineProperty(Math, 'std', {
                /**
                 * @param {number|number[]} [num]
                 * @param {?number} [fraction]
                 * @return {number}
                 */
                value(num, fraction) {
                    let [_arr, _frac] = $.parseArgs.apply($, arguments);
                    if (!_arr.length) {
                        return NaN;
                    }
                    let _filtered = _arr.filter(x => !isNaN(+x));
                    let _std = Math.sqrt(Math.var(_filtered));
                    let _frac_num = parseInt(_frac);
                    return isNaN(_frac_num) ? _std : +_std.toFixed(_frac_num);
                },
            });
        }
        if (!Math.cv) {
            Object.defineProperty(Math, 'cv', {
                /**
                 * @param {number|number[]} [num]
                 * @param {?number} [fraction]
                 * @return {number}
                 */
                value(num, fraction) {
                    let [_arr, _frac] = $.parseArgs.apply($, arguments);
                    let _filtered = _arr.filter(x => !isNaN(+x));
                    let _len = _filtered.length;
                    if (_len < 2) {
                        return NaN;
                    }

                    let _avg = Math.avg(_filtered);
                    let _acc = 0;
                    for (let i = 0; i < _len; i += 1) {
                        _acc += Math.pow((_filtered[i] - _avg), 2);
                    }
                    /**
                     * Sample Standard Deviation (zh-CN: 样本标准差)
                     * @type {number}
                     */
                    let _std_smp = Math.pow(_acc / (_len - 1), 0.5);
                    let _cv = _std_smp / _avg;
                    let _frac_num = parseInt(_frac);
                    return isNaN(_frac_num) ? _cv : +_cv.toFixed(_frac_num);
                },
            });
        }
        if (!Math.maxi) {
            Object.defineProperty(Math, 'maxi', {
                /**
                 * @param {number|number[]} [num]
                 * @param {?number} [fraction]
                 * @return {number}
                 */
                value(num, fraction) {
                    let _arr, _fraction;

                    if (Array.isArray(num)) {
                        _arr = $.spreadArr(num);
                        _fraction = fraction;
                    } else {
                        _arr = $.spreadArr(arguments);
                    }

                    let _filtered = _arr.filter(x => !isNaN(+x));
                    let _max = Math.max.apply(null, _filtered);
                    let _frac = parseInt(_fraction);
                    return isNaN(_frac) ? _max : +_max.toFixed(_frac);
                },
            });
        }
        if (!Math.mini) {
            Object.defineProperty(Math, 'mini', {
                /**
                 * @param {number|number[]} [num]
                 * @param {?number} [fraction]
                 * @return {number}
                 */
                value(num, fraction) {
                    let _arr, _fraction;

                    if (Array.isArray(num)) {
                        _arr = $.spreadArr(num);
                        _fraction = fraction;
                    } else {
                        _arr = $.spreadArr(arguments);
                    }

                    let _filtered = _arr.filter(x => !isNaN(+x));
                    let _min = Math.min.apply(null, _filtered);
                    let _frac = parseInt(_fraction);
                    return isNaN(_frac) ? _min : +_min.toFixed(_frac);
                },
            });
        }
        if (!Math.dist) {
            Object.defineProperty(Math, 'dist', {
                /**
                 * @param {number[]|{x:number,y:number}} point1
                 * @param {number[]|{x:number,y:number}} point2
                 * @return {number}
                 */
                value(point1, point2) {
                    if (Array.isArray(point1) && Array.isArray(point2)) {
                        let _a = Math.pow(point2[0] - point1[0], 2);
                        let _b = Math.pow(point2[1] - point1[1], 2);
                        return Math.sqrt(_a + _b);
                    }
                    if (_.isPlainObject(point1) && _.isPlainObject(point2)) {
                        let _a = Math.pow(point2.x - point1.x, 2);
                        let _b = Math.pow(point2.y - point1.y, 2);
                        return Math.sqrt(_a + _b);
                    }
                    return NaN;
                },
            });
        }
        if (!Math.logMn) {
            Object.defineProperty(Math, 'logMn', {
                /**
                 * @param {number} base
                 * @param {number} antilogarithm
                 * @param {number} [fraction=13]
                 * @return {number}
                 */
                value(base, antilogarithm, fraction) {
                    let _frac = typeof fraction === 'number' ? fraction : 13;
                    let _result = Math.log(antilogarithm) / Math.log(base);
                    if (isNaN(_result) || !isFinite(_result) || _frac !== -1) {
                        return _result;
                    }
                    return Number(_result.toFixed(_frac));
                },
            });
        }
        if (!Math.floorLog) {
            Object.defineProperty(Math, 'floorLog', {
                /**
                 * @param {number} base
                 * @param {number} antilogarithm
                 * @return {number}
                 */
                value(base, antilogarithm) {
                    return Math.floor(this.logMn(base, antilogarithm));
                },
            });
        }
        if (!Math.ceilLog) {
            Object.defineProperty(Math, 'ceilLog', {
                /**
                 * @param {number} base
                 * @param {number} antilogarithm
                 * @return {number}
                 */
                value(base, antilogarithm) {
                    return Math.ceil(this.logMn(base, antilogarithm));
                },
            });
        }
        if (!Math.roundLog) {
            Object.defineProperty(Math, 'roundLog', {
                /**
                 * @param {number} base
                 * @param {number} antilogarithm
                 * @return {number}
                 */
                value(base, antilogarithm) {
                    return Math.round(this.logMn(base, antilogarithm));
                },
            });
        }
        if (!Math.floorPow) {
            Object.defineProperty(Math, 'floorPow', {
                /**
                 * @param {number} base
                 * @param {number} power
                 * @return {number}
                 */
                value(base, power) {
                    return Math.pow(base, this.floorLog(base, power));
                },
            });
        }
        if (!Math.ceilPow) {
            Object.defineProperty(Math, 'ceilPow', {
                /**
                 * @param {number} base
                 * @param {number} power
                 * @return {number}
                 */
                value(base, power) {
                    return Math.pow(base, this.ceilLog(base, power));
                },
            });
        }
        if (!Math.roundPow) {
            Object.defineProperty(Math, 'roundPow', {
                /**
                 * @param {number} base
                 * @param {number} power
                 * @return {number}
                 */
                value(base, power) {
                    return Math.pow(base, this.roundLog(base, power));
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
    $$obj: o => _.isPlainObject(o),
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
    isInteger(o) {
        // `Number.isInteger(o)` since ES6, and polyfill otherwise
        return Number.isInteger(o);
    },
    isNullish(o) {
        // nullish coalescing operator: ??
        return o === null || o === undefined;
    },
    isPrimitive(o) {
        return o !== Object(o);
    },
    isReference(o) {
        return o === Object(o);
    },
    isPlainObject(o) {
        return _.isPlainObject(o);
    },
    isEmptyObject(o) {
        return _.isPlainObject(o)
            && Object.keys(Object.getOwnPropertyDescriptors(o)).length === 0;
    },
    isNonEmptyObject(o) {
        return _.isPlainObject(o)
            && Object.keys(Object.getOwnPropertyDescriptors(o)).length > 0;
    },
    isNormalFunction(f) {
        return typeof f === 'function' && _.isPlainObject(f.prototype);
    },
    isArrowFunction(f) {
        return typeof f === 'function' && !_.isPlainObject(f.prototype);
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
    /**
     * @param {number} [millis_min]
     * @param {number|string} [millis_max]
     */
    $$sleep(millis_min, millis_max) {
        if (typeof millis_max === 'string') {
            let _matched = millis_max.match(/[+-]?(\d+(\.\d+)?(e\d+)?)/);
            if (_matched) {
                let _delta = Number(_matched[0]);
                millis_max = Math.min(millis_min + _delta, Number.MAX_SAFE_INTEGER);
                millis_min = Math.max(millis_min - _delta, 0);
            }
        }
        if (typeof millis_max === 'number') {
            return sleep(millis_min + Math.floor(Math.random() * (millis_max - millis_min + 1)));
        }
        return sleep(Math.max(millis_min, 0) || 0);
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
                let _init = _.isNullish(init_unit) ? {} : {init_unit: init_unit};
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

                    if (_.isNullish(this.space)) {
                        this.space = String();
                    }
                    if (this.space === true) {
                        this.space = '\x20';
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
                                    : i < 3 ? '/' + s : i === 3 ? '\x20' + s : i < 6 ? ':' + s : s;
                            }).join('');
                        } else if (t.length === 14) {
                            // taken as full date and full time
                            // like '20110523163208' -> '2011/05/23 16:32:08'
                            t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                return i > 1 && i < 4
                                    ? '/' + s : i === 4
                                        ? '\x20' + s : i > 4 && i < 7
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
    $$toast: function $$toast$iiFe() {
        let $ = {
            toast: null,
            parseIsLong(is_long) {
                if (typeof is_long === 'number') {
                    return Number(!!is_long);
                }
                if (typeof is_long === 'string') {
                    return Number(/^l(ong)?$/i.test(is_long));
                }
                if (typeof is_long === 'boolean') {
                    return Number(is_long);
                }
                return 0;
            },
            /** @param {IArguments} args */
            init(args) {
                let [msg, is_long, is_forcible] = args;
                this.message = _.isNullish(msg) ? '' : msg.toString();
                this.is_long = this.parseIsLong(is_long);
                this.is_forcible = is_forcible;
            },
            post() {
                ui.post(() => {
                    new android.os.Handler(Looper.getMainLooper()).post(new Runnable({
                        run: () => {
                            this.is_forcible && this.dismiss();
                            this.toast = Toast.makeText(context, this.message, this.is_long);
                            this.show();
                        },
                    }));
                });
            },
            dismiss() {
                if (this.toast instanceof Toast) {
                    this.toast.cancel();
                    this.toast = null;
                }
            },
            show() {
                this.toast.show();
            },
        };

        /**
         * @param {$$Toast.Message} [msg='']
         * @param {$$Toast.IsLong} [is_long=false]
         * @param {$$Toast.IsForcible} [is_forcible=false]
         */
        let $$toast = function (msg, is_long, is_forcible) {
            $.init(arguments);
            $.post();
        };

        $$toast.dismiss = () => $.dismiss();

        return $$toast;
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
    $polyfill() {
        let $ = {
            // @ThisPended
            getPadStr(target_len, pad_str) {
                let $ = {
                    tar_len: Number(target_len),
                    str_len: this.length,
                    trigger() {
                        return this.tar_len > this.str_len;
                    },
                    getPad() {
                        let _pad_str = pad_str === undefined ? '\x20' : String(pad_str);
                        let _gap = this.tar_len - this.str_len;
                        let _times = Math.ceil(_gap / _pad_str.length);
                        return _pad_str.repeat(_times).slice(0, _gap);
                    },
                    getResult() {
                        return this.trigger() ? this.getPad() : String();
                    },
                };
                return $.getResult();
            },
        };

        if (!String.prototype.padStart) {
            /**
             * Pads the current string with a given string to reach a given length (left padding).
             * @function String.prototype.padStart
             * @param {number} target_len
             * @param {string|number} [pad_str='\x20']
             * @return {string}
             */
            Object.defineProperty(String.prototype, 'padStart', {
                value(target_len, pad_str) {
                    return $.getPadStr.apply(this, arguments) + this.valueOf();
                },
            });
        }
        if (!String.prototype.padEnd) {
            Object.defineProperty(String.prototype, 'padEnd', {
                /**
                 * Pads the current string with a given string to reach a given length (right padding).
                 * @function String.prototype.padEnd
                 * @param {number} target_len
                 * @param {string|number} [pad_str='\x20']
                 * @return {string}
                 */
                value(target_len, pad_str) {
                    return this.valueOf() + $.getPadStr.apply(this, arguments);
                },
            });
        }
        if (!String.prototype.trimStart) {
            Object.defineProperty(String.prototype, 'trimStart', {
                /**
                 * Removes the leading white space and line terminator characters from a string.
                 * @function String.prototype.trimStart
                 * @return {string}
                 */
                value() {
                    return String.prototype.trimLeft.apply(this, arguments);
                },
            });
        }
        if (!String.prototype.trimEnd) {
            Object.defineProperty(String.prototype, 'trimEnd', {
                /**
                 * Removes the trailing white space and line terminator characters from a string.
                 * @function String.prototype.trimEnd
                 * @return {string}
                 */
                value() {
                    return String.prototype.trimRight.apply(this, arguments);
                },
            });
        }

        if (!Object.values) {
            /**
             * @param {Iterable|Object} o
             * @return {*[]}
             */
            Object.values = function (o) {
                if (o[Symbol['iterator']] !== undefined) {
                    let _res = [];
                    for (let v of o) {
                        _res.push(v);
                    }
                    return _res;
                }
                return Object.keys(o).map(k => o[k]);
            };
        }
        if (!Object.getOwnPropertyDescriptors) {
            /**
             * @param {Object} o
             * @return {Object.<string,PropertyDescriptor>} <!-- or {PropertyDescriptorMap} -->
             */
            Object.getOwnPropertyDescriptors = function (o) {
                let _descriptor = {};
                Object.getOwnPropertyNames(o).forEach((k) => {
                    _descriptor[k] = Object.getOwnPropertyDescriptor(o, k);
                });
                return _descriptor;
            };
        }

        if (!Array.from) {
            // code from polyfill on the web page below
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
            // modified by SuperMonster003 at Sep 21, 2020
            Array.from = function (arrayLike, mapFn, thisArg) {
                let isFunc = f => typeof f === 'function';
                let toInt = v => isNaN(Number(v)) ? 0 : Math.trunc(v);
                let items = Object(arrayLike);
                if (_.isNullish(arrayLike)) {
                    throw TypeError('arrayLike of Array.from must be an array-like object');
                }
                if (mapFn !== undefined && !isFunc(mapFn)) {
                    throw TypeError('mapFn of Array.from must be a function or undefined');
                }
                let len = Math.min(Math.max(toInt(items.length), 0), Number.MAX_SAFE_INTEGER);
                let arr = isFunc(this) ? Object(new this(len)) : new Array(len);
                let self = thisArg === undefined ? this : thisArg;
                for (let i = 0; i < len; i += 1) {
                    arr[i] = mapFn ? mapFn.call(self, items[i], i) : items[i];
                }
                arr.length = len;
                return arr;
            };
        }
        if (!Array.prototype.includes) {
            Object.defineProperty(Array.prototype, 'includes', {
                value(x, i) {
                    return this.slice(i).some((v) => {
                        if (typeof x !== 'undefined') {
                            return Number.isNaN(x) ? Number.isNaN(v) : x === v;
                        }
                    });
                },
            });
        }
        if (!Array.prototype.fill) {
            Object.defineProperty(Array.prototype, 'fill', {
                value(v, start, end) {
                    let _len = this.length;
                    let _a = start >> 0;
                    _a = _a < 0 ? _a + _len : _a > _len ? _len : _a;
                    let _b = end === undefined ? _len : end >> 0;
                    _b = _b < 0 ? _b + _len : _b > _len ? _len : _b;
                    for (let i = _a; i < _b; i += 1) {
                        this[i] = v;
                    }
                    return this;
                },
            });
        }
        if (!Array.prototype.flat) {
            Object.defineProperty(Array.prototype, 'flat', {
                value(depth) {
                    return (function _flat(arr, d) {
                        return d <= 0 ? arr : arr.reduce((a, b) => {
                            return a.concat(Array.isArray(b) ? _flat(b, d - 1) : b);
                        }, []);
                    })(this.slice(), depth || 1);
                },
            });
        }
        if (!Array.prototype.keys) {
            /** @return {IterableIterator<number>} */
            Array.prototype.keys = function () {
                let _it_keys = this.map((v, i) => i)[Symbol.iterator];
                return _it_keys();
            };
        }
        if (!Array.prototype.values) {
            // noinspection JSCheckFunctionSignatures
            /** @return {IterableIterator<any>} */
            Array.prototype.values = function () {
                return this[Symbol.iterator]();
            };
        }
        if (!Array.prototype.entries) {
            /** @return {IterableIterator<[number,any]>} */
            Array.prototype.entries = function () {
                let _it_entries = this.map((v, i) => [i, v])[Symbol.iterator];
                return _it_entries();
            };
        }

        if (!Number.isInteger) {
            /**
             * @param {any} o
             * @return {boolean}
             */
            Number.isInteger = function (o) {
                return typeof o === 'number' && isFinite(o) && (o | 0) === o;
            };
        }
        if (!Number.EPSILON) {
            Number.EPSILON = Math.pow(2, -52);
        }

        delete this.$polyfill;
        return this;
    },
    $bind() {
        this.$polyfill();
        Object.keys(ext).forEach(k => ext[k]());

        delete this.$bind;
        return this;
    },
};
module.exports.$bind();