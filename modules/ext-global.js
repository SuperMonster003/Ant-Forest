/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let Looper = android.os.Looper;
let Runnable = java.lang.Runnable;
let Toast = android.widget.Toast;
let MessageDigest = java.security.MessageDigest;
let GZIPInputStream = java.util.zip.GZIPInputStream;
let ByteArrayInputStream = java.io.ByteArrayInputStream;
let ByteArrayOutputStream = java.io.ByteArrayOutputStream;

let isNullish = o => o === null || o === undefined;

let ext = {
    $polyfill() {
        if (!String.prototype.padStart) {
            /**
             * Pads the current string with a given string to reach a given length (left padding).
             * @function String.prototype.padStart
             * @param {number} target_len
             * @param {string|number} [pad_str=' ']
             * @returns {string}
             */
            Object.defineProperty(String.prototype, 'padStart', {
                value(target_len, pad_str) {
                    return _getPadStr.apply(this, arguments) + this.valueOf();
                },
            });
        }
        if (!String.prototype.padEnd) {
            Object.defineProperty(String.prototype, 'padEnd', {
                /**
                 * Pads the current string with a given string to reach a given length (right padding).
                 * @function String.prototype.padEnd
                 * @param {number} target_len
                 * @param {string|number} [pad_str=' ']
                 * @returns {string}
                 */
                value(target_len, pad_str) {
                    return this.valueOf() + _getPadStr.apply(this, arguments);
                },
            });
        }
        if (!String.prototype.trimStart) {
            Object.defineProperty(String.prototype, 'trimStart', {
                /**
                 * Removes the leading white space and line terminator characters from a string.
                 * @function String.prototype.trimStart
                 * @returns {string}
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
                 * @returns {string}
                 */
                value() {
                    return String.prototype.trimRight.apply(this, arguments);
                },
            });
        }

        if (!Object.values) {
            Object.defineProperty(Object, 'values', {
                /**
                 * @function Object.values
                 * @param {Iterable|Object} o
                 * @returns {*[]}
                 */
                value(o) {
                    if (o[Symbol['iterator']] !== undefined) {
                        let _res = [];
                        for (let v of o) {
                            _res.push(v);
                        }
                        return _res;
                    }
                    return Object.keys(o).map(k => o[k]);
                },
            });
        }
        if (!Object.getOwnPropertyDescriptors) {
            Object.defineProperty(Object, 'getOwnPropertyDescriptors', {
                /**
                 * @function Object.getOwnPropertyDescriptors
                 * @param {Object} o
                 * @returns {Object.<string,PropertyDescriptor>} <!-- or {PropertyDescriptorMap} -->
                 */
                value(o) {
                    let _descriptor = {};
                    Object.getOwnPropertyNames(o).forEach((k) => {
                        _descriptor[k] = Object.getOwnPropertyDescriptor(o, k);
                    });
                    return _descriptor;
                },
            });
        }

        if (!Array.from) {
            // code from polyfill on the web page below
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
            // modified by SuperMonster003 at Sep 21, 2020
            Array.from = function (arrayLike, mapFn, thisArg) {
                let isFunc = f => typeof f === 'function';
                let toInt = v => isNaN(Number(v)) ? 0 : Math.trunc(v);
                let items = Object(arrayLike);
                if (isNullish(arrayLike)) {
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
            /** @returns {IterableIterator<number>} */
            Array.prototype.keys = function () {
                let _it_keys = this.map((v, i) => i)[Symbol.iterator];
                return _it_keys();
            };
        }
        if (!Array.prototype.values) {
            // noinspection JSCheckFunctionSignatures
            /** @returns {IterableIterator<any>} */
            Array.prototype.values = function () {
                return this[Symbol.iterator]();
            };
        }
        if (!Array.prototype.entries) {
            /** @returns {IterableIterator<[number,any]>} */
            Array.prototype.entries = function () {
                let _it_entries = this.map((v, i) => [i, v])[Symbol.iterator];
                return _it_entries();
            };
        }

        delete this.$polyfill;
        return this;

        // tool function(s) //

        function _getPadStr(target_len, pad_str) {
            let _tar_len = Number(target_len);
            let _this_len = this.length;
            if (_tar_len <= _this_len) {
                return '';
            }
            let _pad_str = pad_str === undefined ? ' ' : String(pad_str);
            let _gap = _tar_len - _this_len;
            let _times = Math.ceil(_gap / _pad_str.length);
            return _pad_str.repeat(_times).slice(0, _gap);
        }
    },
    global() {
        let _compare = {
            '<': (a, b) => a < b,
            '<=': (a, b) => a <= b,
            '>': (a, b) => a > b,
            '>=': (a, b) => a >= b,
            '=': (a, b) => a === b,
        };
        Object.assign(global, {
            $$0: x => x === 0,
            $$1: x => x === 1,
            $$2: x => x === 2,
            $$num(x) {
                let _args = arguments;
                let _len = _args.length;
                if (_len === 1) {
                    return typeof x === 'number';
                }
                if (_len === 2) {
                    return x === _args[1];
                }
                for (let i = 1; i < _len; i += 2) {
                    let _opr = _args[i]; // operational symbol
                    if (typeof _opr !== 'string' || !(_opr in _compare)) {
                        return false;
                    }
                    let _b = _args[i + 1];
                    if (typeof _b !== 'number') {
                        return false;
                    }
                    let _a = _args[i - 1];
                    if (!_compare[_opr](_a, _b)) {
                        return false;
                    }
                }
                return true;
            },
            $$str(x) {
                let _args = arguments;
                let _len = _args.length;
                if (_len === 1) {
                    return typeof x === 'string';
                }
                if (_len === 2) {
                    return x === _args[1];
                }

                let _args_arr = [];
                for (let i = 0; i < _len; i += 1) {
                    _args_arr[i] = _args[i].toString();
                }

                for (let i = 1; i < _len; i += 2) {
                    let _opr = _args_arr[i]; // operational symbol
                    if (!(_opr in _compare)) {
                        return false;
                    }
                    let _a = _args_arr[i - 1];
                    let _b = _args_arr[i + 1];
                    if (!_compare[_opr](_a, _b)) {
                        return false;
                    }
                }
                return true;
            },
            $$nul: x => x === null,
            $$und: x => typeof x === 'undefined',
            $$bool: x => typeof x === 'boolean',
            $$symb: x => typeof x === 'symbol',
            $$bigint: x => typeof x === 'bigint',
            $$func: x => typeof x === 'function',
            $$arr: x => Array.isArray(x),
            $$obj: x => Object.prototype.toString.call(x).slice(8, -1) === 'Object',
            $$T: x => x === true,
            $$F: x => x === false,
            isInteger(x) {
                // `Number.isInteger(x)` since ES6
                return this.$$num(x) && (x | 0) === x;
            },
            isNullish(x) {
                // nullish coalescing operator: ??
                return this.$$nul(x) || this.$$und(x);
            },
            isPrimitive(x) {
                // return x !== Object(x);
                // dunno code above is okay or not, but i think it's cooler :)
                return this.$$num(x) || this.$$str(x) || this.$$bool(x)
                    || this.$$nul(x) || this.$$und(x) || this.$$symb(x)
                    || this.$$bigint(x);
            },
            isReference(x) {
                return !this.isPrimitive(x);
            },
        });

        /**
         * Toast a message in current screen
         * @param {string|{toString:function():string}} [msg=''] -
         * string (or object with toString method) to toast
         * @param {boolean|'Short'|'S'|'Long'|'L'|string|number} [is_long=0] -
         * controlling toast duration (falsy for LENGTH_SHORT; truthy for LENGTH_LONG)
         * @param {boolean|'F'|'Forcible'|*} [is_forcible] -
         * controlling whether showing current new toast immediately or not
         * @example
         * // toast 'Hello' for around 2 seconds
         * $$toast('Hello');
         * // toast 'Hello' for around 3.5 seconds
         * $$toast('Hello', 'Long');
         * // toast 'Hello' for around 2 seconds
         * // after then toast 'Hello again' for around 3.5 seconds
         * $$toast('Hello');
         * $$toast('Hello again', 'Long');
         * // only toast 'Hello again' for around 3.5 seconds
         * // because 'Hello' was cancelled by 'Hello again' immediately
         * $$toast('Hello');
         * $$toast('Hello again', 'Long', 'Forcible');
         * // toast 'Hello' for around 1 second
         * // and then toast 'Hello again' for around 3.5 seconds
         * $$toast('Hello');
         * sleep(1000);
         * $$toast('Hello again', 'Long', 'Forcible');
         * // as you imagined, toast 'Hello' for around 3.5 seconds
         * // then toast 'Hello again' for around 3.5 seconds
         * $$toast('Hello', 'Long', 'Forcible');
         * $$toast('Hello again', 'Long');
         * // only toast 'Hello again' for around 2 seconds
         * $$toast('Hello', 'Long', 'Forcible');
         * $$toast('Hello again', 0, 'Forcible');
         */
        global.$$toast = function (msg, is_long, is_forcible) {
            let _msg = isNullish(msg) ? '' : msg.toString();
            let _is_long = (function $iiFe() {
                if (typeof is_long === 'number') {
                    return Number(!!is_long);
                }
                if (typeof is_long === 'string') {
                    return Number(!!(is_long.toUpperCase().match(/^L(ONG)?$/)));
                }
                if (typeof is_long === 'boolean') {
                    return Number(is_long);
                }
                return 0;
            })();
            ui.post(() => {
                new android.os.Handler(Looper.getMainLooper()).post(new Runnable({
                    run() {
                        is_forcible && $$toast.dismiss();
                        // noinspection JSCheckFunctionSignatures
                        global['_toast_'] = Toast.makeText(context, _msg, _is_long);
                        global['_toast_'].show();
                    },
                }));
            });
        };

        $$toast.dismiss = function () {
            if (global['_toast_'] instanceof Toast) {
                global['_toast_'].cancel();
                global['_toast_'] = null;
            }
        };

        /**
         * Invoke some functions (returns undefined or $$link only) one by one
         * @param {function():('__break__'|void|function)} f
         * @param {Object} [this_arg]
         * @example
         * let a = () => console.log('A');
         * let s = () => console.log('S');
         * let d = () => console.log('D');
         * let f = () => console.log('F');
         * a(), s(), d(), f();
         * $$link(a).$(s).$(d).$(f); // same as above
         * $$link(a)(s)(d)(f); // same as above
         * @example
         * let a = () => console.log(1);
         * function b() {return 2};
         * let c = () => 'ok';
         * function d() {void 0};
         * // with two groups of warning messages printed in console
         * $$link(a).$(b).$(c).$(d);
         * @returns {function}
         */
        global.$$link = function (f, this_arg) {
            if (typeof f !== 'function') {
                throw TypeError('$$link invoked with a non-function argument');
            }
            try {
                /** @type {'__break__'|(void|function)} */
                let _res = f.call(this_arg);
                if (typeof _res === 'string' && _res === '__break__') {
                    $$link.$ = () => $$link;
                } else {
                    $$link.$ = (f, this_arg) => $$link(f, this_arg);
                    if (_res !== $$link && typeof _res !== 'undefined') {
                        if (typeof debugInfo === 'function') {
                            debugInfo('fx in $$link returns non-undefined', 3);
                            debugInfo('>name: ' + (f.name || '<anonymous>'), 3);
                            debugInfo('>returns: ' + _res, 3);
                        }
                    }
                }
            } catch (e) {
                if (!e.message.match(/InterruptedException/)) {
                    throw Error(e + '\n' + e.stack);
                }
                if (typeof $$link.$ !== 'function') {
                    $$link.$ = () => $$link;
                }
            }
            return $$link;
        };

        /**
         * Substitution of sleep(millis:number):void
         * @param {number} [millis_min=0] - inclusive
         * @param {number|string|'±n'} [millis_max=millis_min] - inclusive also
         * @example
         * $$sleep(1e3); // same as sleep(1e3);
         * $$sleep(1e3, 2e3); // sleep for 1000 (inclusive) to 2000 (inclusive) milliseconds
         * $$sleep(1e3, '±300'); // sleep for 700 (inclusive) to 1300 (inclusive) milliseconds
         * $$sleep(1e3, '300'); // same as above
         */
        global.$$sleep = function (millis_min, millis_max) {
            if (typeof millis_max === 'string') {
                let _matched = millis_max.match(/\d+(e\d+)?/);
                if (_matched) {
                    let _delta = Number(_matched[0]);
                    millis_max = Math.min(millis_min + _delta, Number.MAX_SAFE_INTEGER);
                    millis_min = Math.max(millis_min - _delta, 0);
                }
            }
            if (typeof millis_max === 'number') {
                return sleep(millis_min + Math.floor(Math.random() * (millis_max - millis_min + 1)));
            }
            return sleep(Math.max(millis_min, 0));
        };

        global.$$cvt = function cvtBuilder$iiFe() {
            /** @typedef {number|string} $$cvt$src */
            /** @typedef {string} $$cvt$init_unit */
            /**
             * @typedef {{
             *     step?: number, potential_step?: number,
             *     space?: string|boolean, fixed?: number,
             *     units?: (number|number[]|string)[], init_unit?: 'string',
             * }} $$cvt$options
             */
            /**
             * @param {$$cvt$src} src
             * @param {$$cvt$options} [options]
             * @example
             * console.log($$cvt(24, {
             *     units: ['entries', 12, 'dozens'], space: true,
             * })); // '2 dozens'
             * @returns {string}
             */
            let $_cvt = function (src, options) {
                let {
                    step: _step, potential_step: _pot_step,
                    units: _units_ori, init_unit: _init_unit,
                    space: _space, fixed: _fixed,
                } = options || {};

                let _src = typeof src === 'string'
                    ? Number(src.split(/,\s*/).join(''))
                    : Number(src);

                let _units = [];
                _units_ori.forEach((o) => {
                    if (typeof o === 'string' && o.match(/\w+\|\w+/)) {
                        o.split('|').reverse().forEach((u, i) => {
                            i ? _units.push(1, u) : _units.push(u);
                        });
                    } else {
                        _units.push(o);
                    }
                });

                let unit_map = {};
                unit_map[_units[0]] = [1, 1];

                let _accu_step = 1;
                let _tmp_pot_val;

                for (let i = 1, l = _units.length; i < l; i += 1) {
                    _tmp_pot_val = _pot_step ? _accu_step : 0;
                    let _unit = _units[i];

                    if (typeof _unit === 'number') {
                        _tmp_pot_val = _accu_step * (_pot_step || _unit);
                        _accu_step *= _unit;
                        _unit = _units[++i];
                    } else if (Array.isArray(_unit)) {
                        let _steps = _unit.sort((a, b) => a < b ? 1 : -1);
                        _tmp_pot_val = _accu_step * _steps[1];
                        _accu_step *= _steps[0];
                        _unit = _units[++i];
                    } else {
                        _tmp_pot_val = _accu_step * (_pot_step || _step);
                        _accu_step *= _step;
                    }
                    _unit.split('|').forEach(u => unit_map[u] = _tmp_pot_val
                        ? [_accu_step, _tmp_pot_val] : [_accu_step, _accu_step]);
                }

                let _init_u = _init_unit || _units[0];
                if (~_units.indexOf(_init_u)) {
                    _src *= unit_map[_init_u][0];
                }

                let _result = '';
                Object.keys(unit_map).reverse().some((u) => {
                    let [_unit_val, _pot_val] = unit_map[u];
                    if (_src >= _pot_val) {
                        let res = Number((_src / _unit_val).toFixed(12));
                        if (typeof _fixed === 'number') {
                            res = ~_fixed ? res.toFixed(_fixed) : res;
                        } else if (res * 1e3 >> 0 !== res * 1e3) {
                            res = res.toFixed(2);
                        }
                        let _space_str = _space ? _space === true ? ' ' : _space : '';
                        return _result = Number(res) + _space_str + u;
                    }
                });
                return _result;
            };

            /**
             * Auto-conversion between different digital storage units (smaller to greater)
             * @param {$$cvt$src} src
             * @param {$$cvt$init_unit|'B'|'KB'|'MB'|'GB'|'TB'|'PB'|'EB'|'ZB'|'YB'} [init_unit='B']
             * @param {$$cvt$options} [options]
             * @example
             * console.log($$cvt.bytes(1024)); // '1KB'
             * console.log($$cvt.bytes(1024, 'B')); // '1KB'
             * console.log($$cvt.bytes(1024, 'MB')); // '1GB'
             * console.log($$cvt.bytes(1047285512)); // '998.77MB'
             * console.log($$cvt.bytes(1067285512)); // '0.99GB'
             * console.log($$cvt.bytes(1516171819)); // '1.41GB'
             * @returns {string}
             */
            $_cvt.bytes = function (src, init_unit, options) {
                return _parse(src, init_unit, options, {
                    step: 1024, potential_step: 1000,
                    units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                });
            };

            /**
             * Auto-conversion between different time units (smaller to greater)
             * @param {$$cvt$src} src
             * @param {$$cvt$init_unit|'ms'|'s'|'m'|'h'|'d'} [init_unit='ms']
             * @param {$$cvt$options} [options]
             * @example
             * console.log($$cvt.time(3.6e6)); // '1h'
             * console.log($$cvt.time(3.6e6, 'ms')); // '1h'
             * console.log($$cvt.time(3.6e3, 's')); // '1h'
             * console.log($$cvt.time(3.6e6, 's')); // '41.67d'
             * console.log($$cvt.time(48, 'h')); // '2d'
             * console.log($$cvt.time(150, 'm')); // '2.5h'
             * @example
             * console.log('About ' + $$cvt.time(Date.now() - new Date(2019, 2, 19), 'ms', {fixed: 0})
             *     + ' since Mar 19, 2019'); // like: 'About 591d since Mar 19, 2019'
             * @returns {string}
             */
            $_cvt.time = function (src, init_unit, options) {
                return _parse(src, init_unit, options, {
                    step: 60,
                    units: ['ms', 1e3, 's', 'm', 'h', 24, 'd'],
                });
            };

            /**
             * Auto-conversion between different linear units (smaller to greater)
             * @param {$$cvt$src} src
             * @param {$$cvt$init_unit|'am'|'fm'|'pm'|'nm'|'μm'|'um'|'mm'|'cm'|'dm'|'m'|'km'} [init_unit='mm']
             * @param {$$cvt$options} [options]
             * @example
             * console.log($$cvt.linear(10)); // '1cm'
             * console.log($$cvt.linear(100)); // '1dm'
             * console.log($$cvt.linear(1000)); // '1m'
             * console.log($$cvt.linear(10000)); // '10m'
             * console.log($$cvt.linear(1e6)); // '1km'
             * console.log($$cvt.linear(2299, 'mm')); // '2.299m'
             * console.log($$cvt.linear(2299, 'cm')); // '22.99m'
             * console.log($$cvt.linear(2299, 'dm')); // '229.9m'
             * console.log($$cvt.linear(2299, 'm')); // '2.299km'
             * @returns {string}
             */
            $_cvt.linear = function (src, init_unit, options) {
                return _parse(src, init_unit, options, {
                    step: 1e3, init_unit: 'mm',
                    units: ['am', 'fm', 'pm', 'nm', 'μm|um', 'mm', 10, 'cm', 10, 'dm', 10, 'm', 'km'],
                });
            };

            /**
             * Auto-conversion between different linear units (smaller to greater)
             * @param {$$cvt$src} src
             * @param {
             *     $$cvt$init_unit|'one'|'hundred'|'thousand'|'million'|'billion'|'trillion'|
             *     'quadrillion'|'quintillion'|'sextillion'|'septillion'|'octillion'|
             *     'nonillion'|'decillion'|'undecillion'|'duodecillion'|'tredecillion'|
             *     'quattuordecillion'|'quindecillion'
             * } [init_unit='one']
             * @param {$$cvt$options} [options]
             * @example
             * console.log($$cvt.number(Math.pow(2, 10))); // '1.024 thousand'
             * console.log($$cvt.number(Math.pow(2, 20))); // '1.05 million'
             * console.log($$cvt.number(Math.pow(2, 30))); // '1.07 billion'
             * console.log($$cvt.number(Math.pow(2, 40))); // '1.1 trillion'
             * @returns {string}
             */
            $_cvt.number = function (src, init_unit, options) {
                return _parse(src, init_unit, options, {
                    step: 1e3, space: true,
                    units: ['one', 100, 'hundred', 10, 'thousand', 'million', 'billion',
                        'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion',
                        'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion',
                        'tredecillion', 'quattuordecillion', 'quindecillion'],
                });
            };

            /**
             * @param {Date|string|number} [src=Date()]
             * @param {'d'|'dd'|'h'|'h:m'|'h:m:s'|'h:m:ss'|'h:mm'|'h:mm:s'|'h:mm:ss'|'hh'|'hh:m'|'hh:m:s'|'hh:m:ss'|'hh:mm'|'hh:mm:s'|'hh:mm:ss'|'M'|'m'|'M/d h:m'|'M/d h:m:s'|'M/d h:m:ss'|'M/d h:mm'|'M/d h:mm:s'|'M/d h:mm:ss'|'M/d hh:m'|'M/d hh:m:s'|'M/d hh:m:ss'|'M/d hh:mm'|'M/d hh:mm:s'|'M/d hh:mm:ss'|'M/d'|'M/dd h:m'|'M/dd h:m:s'|'M/dd h:m:ss'|'M/dd h:mm'|'M/dd h:mm:s'|'M/dd h:mm:ss'|'M/dd hh:m'|'M/dd hh:m:s'|'M/dd hh:m:ss'|'M/dd hh:mm'|'M/dd hh:mm:s'|'M/dd hh:mm:ss'|'M/dd'|'m:s'|'m:ss'|'MM'|'mm'|'MM/d h:m'|'MM/d h:m:s'|'MM/d h:m:ss'|'MM/d h:mm'|'MM/d h:mm:s'|'MM/d h:mm:ss'|'MM/d hh:m'|'MM/d hh:m:s'|'MM/d hh:m:ss'|'MM/d hh:mm'|'MM/d hh:mm:s'|'MM/d hh:mm:ss'|'MM/d'|'MM/dd h:m'|'MM/dd h:m:s'|'MM/dd h:m:ss'|'MM/dd h:mm'|'MM/dd h:mm:s'|'MM/dd h:mm:ss'|'MM/dd hh:m'|'MM/dd hh:m:s'|'MM/dd hh:m:ss'|'MM/dd hh:mm'|'MM/dd hh:mm:s'|'MM/dd hh:mm:ss'|'MM/dd'|'mm:s'|'mm:ss'|'s'|'ss'|'yy'|'yy/M'|'yy/M/d h:m'|'yy/M/d h:m:s'|'yy/M/d h:m:ss'|'yy/M/d h:mm'|'yy/M/d h:mm:s'|'yy/M/d h:mm:ss'|'yy/M/d hh:m'|'yy/M/d hh:m:s'|'yy/M/d hh:m:ss'|'yy/M/d hh:mm'|'yy/M/d hh:mm:s'|'yy/M/d hh:mm:ss'|'yy/M/d'|'yy/M/dd h:m'|'yy/M/dd h:m:s'|'yy/M/dd h:m:ss'|'yy/M/dd h:mm'|'yy/M/dd h:mm:s'|'yy/M/dd h:mm:ss'|'yy/M/dd hh:m'|'yy/M/dd hh:m:s'|'yy/M/dd hh:m:ss'|'yy/M/dd hh:mm'|'yy/M/dd hh:mm:s'|'yy/M/dd hh:mm:ss'|'yy/M/dd'|'yy/MM'|'yy/MM/d h:m'|'yy/MM/d h:m:s'|'yy/MM/d h:m:ss'|'yy/MM/d h:mm'|'yy/MM/d h:mm:s'|'yy/MM/d h:mm:ss'|'yy/MM/d hh:m'|'yy/MM/d hh:m:s'|'yy/MM/d hh:m:ss'|'yy/MM/d hh:mm'|'yy/MM/d hh:mm:s'|'yy/MM/d hh:mm:ss'|'yy/MM/d'|'yy/MM/dd h:m'|'yy/MM/dd h:m:s'|'yy/MM/dd h:m:ss'|'yy/MM/dd h:mm'|'yy/MM/dd h:mm:s'|'yy/MM/dd h:mm:ss'|'yy/MM/dd hh:m'|'yy/MM/dd hh:m:s'|'yy/MM/dd hh:m:ss'|'yy/MM/dd hh:mm'|'yy/MM/dd hh:mm:s'|'yy/MM/dd hh:mm:ss'|'yy/MM/dd'|'yyyy'|'yyyy/M'|'yyyy/M/d h:m'|'yyyy/M/d h:m:s'|'yyyy/M/d h:m:ss'|'yyyy/M/d h:mm'|'yyyy/M/d h:mm:s'|'yyyy/M/d h:mm:ss'|'yyyy/M/d hh:m'|'yyyy/M/d hh:m:s'|'yyyy/M/d hh:m:ss'|'yyyy/M/d hh:mm'|'yyyy/M/d hh:mm:s'|'yyyy/M/d hh:mm:ss'|'yyyy/M/d'|'yyyy/M/dd h:m'|'yyyy/M/dd h:m:s'|'yyyy/M/dd h:m:ss'|'yyyy/M/dd h:mm'|'yyyy/M/dd h:mm:s'|'yyyy/M/dd h:mm:ss'|'yyyy/M/dd hh:m'|'yyyy/M/dd hh:m:s'|'yyyy/M/dd hh:m:ss'|'yyyy/M/dd hh:mm'|'yyyy/M/dd hh:mm:s'|'yyyy/M/dd hh:mm:ss'|'yyyy/M/dd'|'yyyy/MM'|'yyyy/MM/d h:m'|'yyyy/MM/d h:m:s'|'yyyy/MM/d h:m:ss'|'yyyy/MM/d h:mm'|'yyyy/MM/d h:mm:s'|'yyyy/MM/d h:mm:ss'|'yyyy/MM/d hh:m'|'yyyy/MM/d hh:m:s'|'yyyy/MM/d hh:m:ss'|'yyyy/MM/d hh:mm'|'yyyy/MM/d hh:mm:s'|'yyyy/MM/d hh:mm:ss'|'yyyy/MM/d'|'yyyy/MM/dd h:m'|'yyyy/MM/dd h:m:s'|'yyyy/MM/dd h:m:ss'|'yyyy/MM/dd h:mm'|'yyyy/MM/dd h:mm:s'|'yyyy/MM/dd h:mm:ss'|'yyyy/MM/dd hh:m'|'yyyy/MM/dd hh:m:s'|'yyyy/MM/dd hh:m:ss'|'yyyy/MM/dd hh:mm'|'yyyy/MM/dd hh:mm:s'|'yyyy/MM/dd hh:mm:ss'|'yyyy/MM/dd'|'h:m:s.S'|'h:mm:s.S'|'hh:m:s.S'|'hh:mm:s.S'|'M/d h:m:s.S'|'M/d h:mm:s.S'|'M/d hh:m:s.S'|'M/d hh:mm:s.S'|'M/dd h:m:s.S'|'M/dd h:mm:s.S'|'M/dd hh:m:s.S'|'M/dd hh:mm:s.S'|'m:s.S'|'MM/d h:m:s.S'|'MM/d h:mm:s.S'|'MM/d hh:m:s.S'|'MM/d hh:mm:s.S'|'MM/dd h:m:s.S'|'MM/dd h:mm:s.S'|'MM/dd hh:m:s.S'|'MM/dd hh:mm:s.S'|'mm:s.S'|'yy/M/d h:m:s.S'|'yy/M/d h:mm:s.S'|'yy/M/d hh:m:s.S'|'yy/M/d hh:mm:s.S'|'yy/M/dd h:m:s.S'|'yy/M/dd h:mm:s.S'|'yy/M/dd hh:m:s.S'|'yy/M/dd hh:mm:s.S'|'yy/MM/d h:m:s.S'|'yy/MM/d h:mm:s.S'|'yy/MM/d hh:m:s.S'|'yy/MM/d hh:mm:s.S'|'yy/MM/dd h:m:s.S'|'yy/MM/dd h:mm:s.S'|'yy/MM/dd hh:m:s.S'|'yy/MM/dd hh:mm:s.S'|'yyyy/M/d h:m:s.S'|'yyyy/M/d h:mm:s.S'|'yyyy/M/d hh:m:s.S'|'yyyy/M/d hh:mm:s.S'|'yyyy/M/dd h:m:s.S'|'yyyy/M/dd h:mm:s.S'|'yyyy/M/dd hh:m:s.S'|'yyyy/M/dd hh:mm:s.S'|'yyyy/MM/d h:m:s.S'|'yyyy/MM/d h:mm:s.S'|'yyyy/MM/d hh:m:s.S'|'yyyy/MM/d hh:mm:s.S'|'yyyy/MM/dd h:m:s.S'|'yyyy/MM/dd h:mm:s.S'|'yyyy/MM/dd hh:m:s.S'|'yyyy/MM/dd hh:mm:s.S'|'h:m:s.SS'|'h:mm:s.SS'|'hh:m:s.SS'|'hh:mm:s.SS'|'M/d h:m:s.SS'|'M/d h:mm:s.SS'|'M/d hh:m:s.SS'|'M/d hh:mm:s.SS'|'M/dd h:m:s.SS'|'M/dd h:mm:s.SS'|'M/dd hh:m:s.SS'|'M/dd hh:mm:s.SS'|'m:s.SS'|'MM/d h:m:s.SS'|'MM/d h:mm:s.SS'|'MM/d hh:m:s.SS'|'MM/d hh:mm:s.SS'|'MM/dd h:m:s.SS'|'MM/dd h:mm:s.SS'|'MM/dd hh:m:s.SS'|'MM/dd hh:mm:s.SS'|'mm:s.SS'|'yy/M/d h:m:s.SS'|'yy/M/d h:mm:s.SS'|'yy/M/d hh:m:s.SS'|'yy/M/d hh:mm:s.SS'|'yy/M/dd h:m:s.SS'|'yy/M/dd h:mm:s.SS'|'yy/M/dd hh:m:s.SS'|'yy/M/dd hh:mm:s.SS'|'yy/MM/d h:m:s.SS'|'yy/MM/d h:mm:s.SS'|'yy/MM/d hh:m:s.SS'|'yy/MM/d hh:mm:s.SS'|'yy/MM/dd h:m:s.SS'|'yy/MM/dd h:mm:s.SS'|'yy/MM/dd hh:m:s.SS'|'yy/MM/dd hh:mm:s.SS'|'yyyy/M/d h:m:s.SS'|'yyyy/M/d h:mm:s.SS'|'yyyy/M/d hh:m:s.SS'|'yyyy/M/d hh:mm:s.SS'|'yyyy/M/dd h:m:s.SS'|'yyyy/M/dd h:mm:s.SS'|'yyyy/M/dd hh:m:s.SS'|'yyyy/M/dd hh:mm:s.SS'|'yyyy/MM/d h:m:s.SS'|'yyyy/MM/d h:mm:s.SS'|'yyyy/MM/d hh:m:s.SS'|'yyyy/MM/d hh:mm:s.SS'|'yyyy/MM/dd h:m:s.SS'|'yyyy/MM/dd h:mm:s.SS'|'yyyy/MM/dd hh:m:s.SS'|'yyyy/MM/dd hh:mm:s.SS'|'h:m:s.SSS'|'h:mm:s.SSS'|'hh:m:s.SSS'|'hh:mm:s.SSS'|'M/d h:m:s.SSS'|'M/d h:mm:s.SSS'|'M/d hh:m:s.SSS'|'M/d hh:mm:s.SSS'|'M/dd h:m:s.SSS'|'M/dd h:mm:s.SSS'|'M/dd hh:m:s.SSS'|'M/dd hh:mm:s.SSS'|'m:s.SSS'|'MM/d h:m:s.SSS'|'MM/d h:mm:s.SSS'|'MM/d hh:m:s.SSS'|'MM/d hh:mm:s.SSS'|'MM/dd h:m:s.SSS'|'MM/dd h:mm:s.SSS'|'MM/dd hh:m:s.SSS'|'MM/dd hh:mm:s.SSS'|'mm:s.SSS'|'yy/M/d h:m:s.SSS'|'yy/M/d h:mm:s.SSS'|'yy/M/d hh:m:s.SSS'|'yy/M/d hh:mm:s.SSS'|'yy/M/dd h:m:s.SSS'|'yy/M/dd h:mm:s.SSS'|'yy/M/dd hh:m:s.SSS'|'yy/M/dd hh:mm:s.SSS'|'yy/MM/d h:m:s.SSS'|'yy/MM/d h:mm:s.SSS'|'yy/MM/d hh:m:s.SSS'|'yy/MM/d hh:mm:s.SSS'|'yy/MM/dd h:m:s.SSS'|'yy/MM/dd h:mm:s.SSS'|'yy/MM/dd hh:m:s.SSS'|'yy/MM/dd hh:mm:s.SSS'|'yyyy/M/d h:m:s.SSS'|'yyyy/M/d h:mm:s.SSS'|'yyyy/M/d hh:m:s.SSS'|'yyyy/M/d hh:mm:s.SSS'|'yyyy/M/dd h:m:s.SSS'|'yyyy/M/dd h:mm:s.SSS'|'yyyy/M/dd hh:m:s.SSS'|'yyyy/M/dd hh:mm:s.SSS'|'yyyy/MM/d h:m:s.SSS'|'yyyy/MM/d h:mm:s.SSS'|'yyyy/MM/d hh:m:s.SSS'|'yyyy/MM/d hh:mm:s.SSS'|'yyyy/MM/dd h:m:s.SSS'|'yyyy/MM/dd h:mm:s.SSS'|'yyyy/MM/dd hh:m:s.SSS'|'yyyy/MM/dd hh:mm:s.SSS'|'M-d h:m'|'M-d h:m:s'|'M-d h:m:ss'|'M-d h:mm'|'M-d h:mm:s'|'M-d h:mm:ss'|'M-d hh:m'|'M-d hh:m:s'|'M-d hh:m:ss'|'M-d hh:mm'|'M-d hh:mm:s'|'M-d hh:mm:ss'|'M-d'|'M-dd h:m'|'M-dd h:m:s'|'M-dd h:m:ss'|'M-dd h:mm'|'M-dd h:mm:s'|'M-dd h:mm:ss'|'M-dd hh:m'|'M-dd hh:m:s'|'M-dd hh:m:ss'|'M-dd hh:mm'|'M-dd hh:mm:s'|'M-dd hh:mm:ss'|'M-dd'|'MM-d h:m'|'MM-d h:m:s'|'MM-d h:m:ss'|'MM-d h:mm'|'MM-d h:mm:s'|'MM-d h:mm:ss'|'MM-d hh:m'|'MM-d hh:m:s'|'MM-d hh:m:ss'|'MM-d hh:mm'|'MM-d hh:mm:s'|'MM-d hh:mm:ss'|'MM-d'|'MM-dd h:m'|'MM-dd h:m:s'|'MM-dd h:m:ss'|'MM-dd h:mm'|'MM-dd h:mm:s'|'MM-dd h:mm:ss'|'MM-dd hh:m'|'MM-dd hh:m:s'|'MM-dd hh:m:ss'|'MM-dd hh:mm'|'MM-dd hh:mm:s'|'MM-dd hh:mm:ss'|'MM-dd'|'yy-M'|'yy-M-d h:m'|'yy-M-d h:m:s'|'yy-M-d h:m:ss'|'yy-M-d h:mm'|'yy-M-d h:mm:s'|'yy-M-d h:mm:ss'|'yy-M-d hh:m'|'yy-M-d hh:m:s'|'yy-M-d hh:m:ss'|'yy-M-d hh:mm'|'yy-M-d hh:mm:s'|'yy-M-d hh:mm:ss'|'yy-M-d'|'yy-M-dd h:m'|'yy-M-dd h:m:s'|'yy-M-dd h:m:ss'|'yy-M-dd h:mm'|'yy-M-dd h:mm:s'|'yy-M-dd h:mm:ss'|'yy-M-dd hh:m'|'yy-M-dd hh:m:s'|'yy-M-dd hh:m:ss'|'yy-M-dd hh:mm'|'yy-M-dd hh:mm:s'|'yy-M-dd hh:mm:ss'|'yy-M-dd'|'yy-MM'|'yy-MM-d h:m'|'yy-MM-d h:m:s'|'yy-MM-d h:m:ss'|'yy-MM-d h:mm'|'yy-MM-d h:mm:s'|'yy-MM-d h:mm:ss'|'yy-MM-d hh:m'|'yy-MM-d hh:m:s'|'yy-MM-d hh:m:ss'|'yy-MM-d hh:mm'|'yy-MM-d hh:mm:s'|'yy-MM-d hh:mm:ss'|'yy-MM-d'|'yy-MM-dd h:m'|'yy-MM-dd h:m:s'|'yy-MM-dd h:m:ss'|'yy-MM-dd h:mm'|'yy-MM-dd h:mm:s'|'yy-MM-dd h:mm:ss'|'yy-MM-dd hh:m'|'yy-MM-dd hh:m:s'|'yy-MM-dd hh:m:ss'|'yy-MM-dd hh:mm'|'yy-MM-dd hh:mm:s'|'yy-MM-dd hh:mm:ss'|'yy-MM-dd'|'yyyy-M'|'yyyy-M-d h:m'|'yyyy-M-d h:m:s'|'yyyy-M-d h:m:ss'|'yyyy-M-d h:mm'|'yyyy-M-d h:mm:s'|'yyyy-M-d h:mm:ss'|'yyyy-M-d hh:m'|'yyyy-M-d hh:m:s'|'yyyy-M-d hh:m:ss'|'yyyy-M-d hh:mm'|'yyyy-M-d hh:mm:s'|'yyyy-M-d hh:mm:ss'|'yyyy-M-d'|'yyyy-M-dd h:m'|'yyyy-M-dd h:m:s'|'yyyy-M-dd h:m:ss'|'yyyy-M-dd h:mm'|'yyyy-M-dd h:mm:s'|'yyyy-M-dd h:mm:ss'|'yyyy-M-dd hh:m'|'yyyy-M-dd hh:m:s'|'yyyy-M-dd hh:m:ss'|'yyyy-M-dd hh:mm'|'yyyy-M-dd hh:mm:s'|'yyyy-M-dd hh:mm:ss'|'yyyy-M-dd'|'yyyy-MM'|'yyyy-MM-d h:m'|'yyyy-MM-d h:m:s'|'yyyy-MM-d h:m:ss'|'yyyy-MM-d h:mm'|'yyyy-MM-d h:mm:s'|'yyyy-MM-d h:mm:ss'|'yyyy-MM-d hh:m'|'yyyy-MM-d hh:m:s'|'yyyy-MM-d hh:m:ss'|'yyyy-MM-d hh:mm'|'yyyy-MM-d hh:mm:s'|'yyyy-MM-d hh:mm:ss'|'yyyy-MM-d'|'yyyy-MM-dd h:m'|'yyyy-MM-dd h:m:s'|'yyyy-MM-dd h:m:ss'|'yyyy-MM-dd h:mm'|'yyyy-MM-dd h:mm:s'|'yyyy-MM-dd h:mm:ss'|'yyyy-MM-dd hh:m'|'yyyy-MM-dd hh:m:s'|'yyyy-MM-dd hh:m:ss'|'yyyy-MM-dd hh:mm'|'yyyy-MM-dd hh:mm:s'|'yyyy-MM-dd hh:mm:ss'|'yyyy-MM-dd'|'M-d h:m:s.S'|'M-d h:mm:s.S'|'M-d hh:m:s.S'|'M-d hh:mm:s.S'|'M-dd h:m:s.S'|'M-dd h:mm:s.S'|'M-dd hh:m:s.S'|'M-dd hh:mm:s.S'|'MM-d h:m:s.S'|'MM-d h:mm:s.S'|'MM-d hh:m:s.S'|'MM-d hh:mm:s.S'|'MM-dd h:m:s.S'|'MM-dd h:mm:s.S'|'MM-dd hh:m:s.S'|'MM-dd hh:mm:s.S'|'yy-M-d h:m:s.S'|'yy-M-d h:mm:s.S'|'yy-M-d hh:m:s.S'|'yy-M-d hh:mm:s.S'|'yy-M-dd h:m:s.S'|'yy-M-dd h:mm:s.S'|'yy-M-dd hh:m:s.S'|'yy-M-dd hh:mm:s.S'|'yy-MM-d h:m:s.S'|'yy-MM-d h:mm:s.S'|'yy-MM-d hh:m:s.S'|'yy-MM-d hh:mm:s.S'|'yy-MM-dd h:m:s.S'|'yy-MM-dd h:mm:s.S'|'yy-MM-dd hh:m:s.S'|'yy-MM-dd hh:mm:s.S'|'yyyy-M-d h:m:s.S'|'yyyy-M-d h:mm:s.S'|'yyyy-M-d hh:m:s.S'|'yyyy-M-d hh:mm:s.S'|'yyyy-M-dd h:m:s.S'|'yyyy-M-dd h:mm:s.S'|'yyyy-M-dd hh:m:s.S'|'yyyy-M-dd hh:mm:s.S'|'yyyy-MM-d h:m:s.S'|'yyyy-MM-d h:mm:s.S'|'yyyy-MM-d hh:m:s.S'|'yyyy-MM-d hh:mm:s.S'|'yyyy-MM-dd h:m:s.S'|'yyyy-MM-dd h:mm:s.S'|'yyyy-MM-dd hh:m:s.S'|'yyyy-MM-dd hh:mm:s.S'|'M-d h:m:s.SS'|'M-d h:mm:s.SS'|'M-d hh:m:s.SS'|'M-d hh:mm:s.SS'|'M-dd h:m:s.SS'|'M-dd h:mm:s.SS'|'M-dd hh:m:s.SS'|'M-dd hh:mm:s.SS'|'MM-d h:m:s.SS'|'MM-d h:mm:s.SS'|'MM-d hh:m:s.SS'|'MM-d hh:mm:s.SS'|'MM-dd h:m:s.SS'|'MM-dd h:mm:s.SS'|'MM-dd hh:m:s.SS'|'MM-dd hh:mm:s.SS'|'yy-M-d h:m:s.SS'|'yy-M-d h:mm:s.SS'|'yy-M-d hh:m:s.SS'|'yy-M-d hh:mm:s.SS'|'yy-M-dd h:m:s.SS'|'yy-M-dd h:mm:s.SS'|'yy-M-dd hh:m:s.SS'|'yy-M-dd hh:mm:s.SS'|'yy-MM-d h:m:s.SS'|'yy-MM-d h:mm:s.SS'|'yy-MM-d hh:m:s.SS'|'yy-MM-d hh:mm:s.SS'|'yy-MM-dd h:m:s.SS'|'yy-MM-dd h:mm:s.SS'|'yy-MM-dd hh:m:s.SS'|'yy-MM-dd hh:mm:s.SS'|'yyyy-M-d h:m:s.SS'|'yyyy-M-d h:mm:s.SS'|'yyyy-M-d hh:m:s.SS'|'yyyy-M-d hh:mm:s.SS'|'yyyy-M-dd h:m:s.SS'|'yyyy-M-dd h:mm:s.SS'|'yyyy-M-dd hh:m:s.SS'|'yyyy-M-dd hh:mm:s.SS'|'yyyy-MM-d h:m:s.SS'|'yyyy-MM-d h:mm:s.SS'|'yyyy-MM-d hh:m:s.SS'|'yyyy-MM-d hh:mm:s.SS'|'yyyy-MM-dd h:m:s.SS'|'yyyy-MM-dd h:mm:s.SS'|'yyyy-MM-dd hh:m:s.SS'|'yyyy-MM-dd hh:mm:s.SS'|'M-d h:m:s.SSS'|'M-d h:mm:s.SSS'|'M-d hh:m:s.SSS'|'M-d hh:mm:s.SSS'|'M-dd h:m:s.SSS'|'M-dd h:mm:s.SSS'|'M-dd hh:m:s.SSS'|'M-dd hh:mm:s.SSS'|'MM-d h:m:s.SSS'|'MM-d h:mm:s.SSS'|'MM-d hh:m:s.SSS'|'MM-d hh:mm:s.SSS'|'MM-dd h:m:s.SSS'|'MM-dd h:mm:s.SSS'|'MM-dd hh:m:s.SSS'|'MM-dd hh:mm:s.SSS'|'yy-M-d h:m:s.SSS'|'yy-M-d h:mm:s.SSS'|'yy-M-d hh:m:s.SSS'|'yy-M-d hh:mm:s.SSS'|'yy-M-dd h:m:s.SSS'|'yy-M-dd h:mm:s.SSS'|'yy-M-dd hh:m:s.SSS'|'yy-M-dd hh:mm:s.SSS'|'yy-MM-d h:m:s.SSS'|'yy-MM-d h:mm:s.SSS'|'yy-MM-d hh:m:s.SSS'|'yy-MM-d hh:mm:s.SSS'|'yy-MM-dd h:m:s.SSS'|'yy-MM-dd h:mm:s.SSS'|'yy-MM-dd hh:m:s.SSS'|'yy-MM-dd hh:mm:s.SSS'|'yyyy-M-d h:m:s.SSS'|'yyyy-M-d h:mm:s.SSS'|'yyyy-M-d hh:m:s.SSS'|'yyyy-M-d hh:mm:s.SSS'|'yyyy-M-dd h:m:s.SSS'|'yyyy-M-dd h:mm:s.SSS'|'yyyy-M-dd hh:m:s.SSS'|'yyyy-M-dd hh:mm:s.SSS'|'yyyy-MM-d h:m:s.SSS'|'yyyy-MM-d h:mm:s.SSS'|'yyyy-MM-d hh:m:s.SSS'|'yyyy-MM-d hh:mm:s.SSS'|'yyyy-MM-dd h:m:s.SSS'|'yyyy-MM-dd h:mm:s.SSS'|'yyyy-MM-dd hh:m:s.SSS'|'yyyy-MM-dd hh:mm:s.SSS'|'h:m:s:S'|'h:mm:s:S'|'hh:m:s:S'|'hh:mm:s:S'|'M/d h:m:s:S'|'M/d h:mm:s:S'|'M/d hh:m:s:S'|'M/d hh:mm:s:S'|'M/dd h:m:s:S'|'M/dd h:mm:s:S'|'M/dd hh:m:s:S'|'M/dd hh:mm:s:S'|'m:s:S'|'MM/d h:m:s:S'|'MM/d h:mm:s:S'|'MM/d hh:m:s:S'|'MM/d hh:mm:s:S'|'MM/dd h:m:s:S'|'MM/dd h:mm:s:S'|'MM/dd hh:m:s:S'|'MM/dd hh:mm:s:S'|'mm:s:S'|'yy/M/d h:m:s:S'|'yy/M/d h:mm:s:S'|'yy/M/d hh:m:s:S'|'yy/M/d hh:mm:s:S'|'yy/M/dd h:m:s:S'|'yy/M/dd h:mm:s:S'|'yy/M/dd hh:m:s:S'|'yy/M/dd hh:mm:s:S'|'yy/MM/d h:m:s:S'|'yy/MM/d h:mm:s:S'|'yy/MM/d hh:m:s:S'|'yy/MM/d hh:mm:s:S'|'yy/MM/dd h:m:s:S'|'yy/MM/dd h:mm:s:S'|'yy/MM/dd hh:m:s:S'|'yy/MM/dd hh:mm:s:S'|'yyyy/M/d h:m:s:S'|'yyyy/M/d h:mm:s:S'|'yyyy/M/d hh:m:s:S'|'yyyy/M/d hh:mm:s:S'|'yyyy/M/dd h:m:s:S'|'yyyy/M/dd h:mm:s:S'|'yyyy/M/dd hh:m:s:S'|'yyyy/M/dd hh:mm:s:S'|'yyyy/MM/d h:m:s:S'|'yyyy/MM/d h:mm:s:S'|'yyyy/MM/d hh:m:s:S'|'yyyy/MM/d hh:mm:s:S'|'yyyy/MM/dd h:m:s:S'|'yyyy/MM/dd h:mm:s:S'|'yyyy/MM/dd hh:m:s:S'|'yyyy/MM/dd hh:mm:s:S'|'h:m:s:SS'|'h:mm:s:SS'|'hh:m:s:SS'|'hh:mm:s:SS'|'M/d h:m:s:SS'|'M/d h:mm:s:SS'|'M/d hh:m:s:SS'|'M/d hh:mm:s:SS'|'M/dd h:m:s:SS'|'M/dd h:mm:s:SS'|'M/dd hh:m:s:SS'|'M/dd hh:mm:s:SS'|'m:s:SS'|'MM/d h:m:s:SS'|'MM/d h:mm:s:SS'|'MM/d hh:m:s:SS'|'MM/d hh:mm:s:SS'|'MM/dd h:m:s:SS'|'MM/dd h:mm:s:SS'|'MM/dd hh:m:s:SS'|'MM/dd hh:mm:s:SS'|'mm:s:SS'|'yy/M/d h:m:s:SS'|'yy/M/d h:mm:s:SS'|'yy/M/d hh:m:s:SS'|'yy/M/d hh:mm:s:SS'|'yy/M/dd h:m:s:SS'|'yy/M/dd h:mm:s:SS'|'yy/M/dd hh:m:s:SS'|'yy/M/dd hh:mm:s:SS'|'yy/MM/d h:m:s:SS'|'yy/MM/d h:mm:s:SS'|'yy/MM/d hh:m:s:SS'|'yy/MM/d hh:mm:s:SS'|'yy/MM/dd h:m:s:SS'|'yy/MM/dd h:mm:s:SS'|'yy/MM/dd hh:m:s:SS'|'yy/MM/dd hh:mm:s:SS'|'yyyy/M/d h:m:s:SS'|'yyyy/M/d h:mm:s:SS'|'yyyy/M/d hh:m:s:SS'|'yyyy/M/d hh:mm:s:SS'|'yyyy/M/dd h:m:s:SS'|'yyyy/M/dd h:mm:s:SS'|'yyyy/M/dd hh:m:s:SS'|'yyyy/M/dd hh:mm:s:SS'|'yyyy/MM/d h:m:s:SS'|'yyyy/MM/d h:mm:s:SS'|'yyyy/MM/d hh:m:s:SS'|'yyyy/MM/d hh:mm:s:SS'|'yyyy/MM/dd h:m:s:SS'|'yyyy/MM/dd h:mm:s:SS'|'yyyy/MM/dd hh:m:s:SS'|'yyyy/MM/dd hh:mm:s:SS'|'h:m:s:SSS'|'h:mm:s:SSS'|'hh:m:s:SSS'|'hh:mm:s:SSS'|'M/d h:m:s:SSS'|'M/d h:mm:s:SSS'|'M/d hh:m:s:SSS'|'M/d hh:mm:s:SSS'|'M/dd h:m:s:SSS'|'M/dd h:mm:s:SSS'|'M/dd hh:m:s:SSS'|'M/dd hh:mm:s:SSS'|'m:s:SSS'|'MM/d h:m:s:SSS'|'MM/d h:mm:s:SSS'|'MM/d hh:m:s:SSS'|'MM/d hh:mm:s:SSS'|'MM/dd h:m:s:SSS'|'MM/dd h:mm:s:SSS'|'MM/dd hh:m:s:SSS'|'MM/dd hh:mm:s:SSS'|'mm:s:SSS'|'yy/M/d h:m:s:SSS'|'yy/M/d h:mm:s:SSS'|'yy/M/d hh:m:s:SSS'|'yy/M/d hh:mm:s:SSS'|'yy/M/dd h:m:s:SSS'|'yy/M/dd h:mm:s:SSS'|'yy/M/dd hh:m:s:SSS'|'yy/M/dd hh:mm:s:SSS'|'yy/MM/d h:m:s:SSS'|'yy/MM/d h:mm:s:SSS'|'yy/MM/d hh:m:s:SSS'|'yy/MM/d hh:mm:s:SSS'|'yy/MM/dd h:m:s:SSS'|'yy/MM/dd h:mm:s:SSS'|'yy/MM/dd hh:m:s:SSS'|'yy/MM/dd hh:mm:s:SSS'|'yyyy/M/d h:m:s:SSS'|'yyyy/M/d h:mm:s:SSS'|'yyyy/M/d hh:m:s:SSS'|'yyyy/M/d hh:mm:s:SSS'|'yyyy/M/dd h:m:s:SSS'|'yyyy/M/dd h:mm:s:SSS'|'yyyy/M/dd hh:m:s:SSS'|'yyyy/M/dd hh:mm:s:SSS'|'yyyy/MM/d h:m:s:SSS'|'yyyy/MM/d h:mm:s:SSS'|'yyyy/MM/d hh:m:s:SSS'|'yyyy/MM/d hh:mm:s:SSS'|'yyyy/MM/dd h:m:s:SSS'|'yyyy/MM/dd h:mm:s:SSS'|'yyyy/MM/dd hh:m:s:SSS'|'yyyy/MM/dd hh:mm:s:SSS'|'M-d h:m:s:S'|'M-d h:mm:s:S'|'M-d hh:m:s:S'|'M-d hh:mm:s:S'|'M-dd h:m:s:S'|'M-dd h:mm:s:S'|'M-dd hh:m:s:S'|'M-dd hh:mm:s:S'|'MM-d h:m:s:S'|'MM-d h:mm:s:S'|'MM-d hh:m:s:S'|'MM-d hh:mm:s:S'|'MM-dd h:m:s:S'|'MM-dd h:mm:s:S'|'MM-dd hh:m:s:S'|'MM-dd hh:mm:s:S'|'yy-M-d h:m:s:S'|'yy-M-d h:mm:s:S'|'yy-M-d hh:m:s:S'|'yy-M-d hh:mm:s:S'|'yy-M-dd h:m:s:S'|'yy-M-dd h:mm:s:S'|'yy-M-dd hh:m:s:S'|'yy-M-dd hh:mm:s:S'|'yy-MM-d h:m:s:S'|'yy-MM-d h:mm:s:S'|'yy-MM-d hh:m:s:S'|'yy-MM-d hh:mm:s:S'|'yy-MM-dd h:m:s:S'|'yy-MM-dd h:mm:s:S'|'yy-MM-dd hh:m:s:S'|'yy-MM-dd hh:mm:s:S'|'yyyy-M-d h:m:s:S'|'yyyy-M-d h:mm:s:S'|'yyyy-M-d hh:m:s:S'|'yyyy-M-d hh:mm:s:S'|'yyyy-M-dd h:m:s:S'|'yyyy-M-dd h:mm:s:S'|'yyyy-M-dd hh:m:s:S'|'yyyy-M-dd hh:mm:s:S'|'yyyy-MM-d h:m:s:S'|'yyyy-MM-d h:mm:s:S'|'yyyy-MM-d hh:m:s:S'|'yyyy-MM-d hh:mm:s:S'|'yyyy-MM-dd h:m:s:S'|'yyyy-MM-dd h:mm:s:S'|'yyyy-MM-dd hh:m:s:S'|'yyyy-MM-dd hh:mm:s:S'|'M-d h:m:s:SS'|'M-d h:mm:s:SS'|'M-d hh:m:s:SS'|'M-d hh:mm:s:SS'|'M-dd h:m:s:SS'|'M-dd h:mm:s:SS'|'M-dd hh:m:s:SS'|'M-dd hh:mm:s:SS'|'MM-d h:m:s:SS'|'MM-d h:mm:s:SS'|'MM-d hh:m:s:SS'|'MM-d hh:mm:s:SS'|'MM-dd h:m:s:SS'|'MM-dd h:mm:s:SS'|'MM-dd hh:m:s:SS'|'MM-dd hh:mm:s:SS'|'yy-M-d h:m:s:SS'|'yy-M-d h:mm:s:SS'|'yy-M-d hh:m:s:SS'|'yy-M-d hh:mm:s:SS'|'yy-M-dd h:m:s:SS'|'yy-M-dd h:mm:s:SS'|'yy-M-dd hh:m:s:SS'|'yy-M-dd hh:mm:s:SS'|'yy-MM-d h:m:s:SS'|'yy-MM-d h:mm:s:SS'|'yy-MM-d hh:m:s:SS'|'yy-MM-d hh:mm:s:SS'|'yy-MM-dd h:m:s:SS'|'yy-MM-dd h:mm:s:SS'|'yy-MM-dd hh:m:s:SS'|'yy-MM-dd hh:mm:s:SS'|'yyyy-M-d h:m:s:SS'|'yyyy-M-d h:mm:s:SS'|'yyyy-M-d hh:m:s:SS'|'yyyy-M-d hh:mm:s:SS'|'yyyy-M-dd h:m:s:SS'|'yyyy-M-dd h:mm:s:SS'|'yyyy-M-dd hh:m:s:SS'|'yyyy-M-dd hh:mm:s:SS'|'yyyy-MM-d h:m:s:SS'|'yyyy-MM-d h:mm:s:SS'|'yyyy-MM-d hh:m:s:SS'|'yyyy-MM-d hh:mm:s:SS'|'yyyy-MM-dd h:m:s:SS'|'yyyy-MM-dd h:mm:s:SS'|'yyyy-MM-dd hh:m:s:SS'|'yyyy-MM-dd hh:mm:s:SS'|'M-d h:m:s:SSS'|'M-d h:mm:s:SSS'|'M-d hh:m:s:SSS'|'M-d hh:mm:s:SSS'|'M-dd h:m:s:SSS'|'M-dd h:mm:s:SSS'|'M-dd hh:m:s:SSS'|'M-dd hh:mm:s:SSS'|'MM-d h:m:s:SSS'|'MM-d h:mm:s:SSS'|'MM-d hh:m:s:SSS'|'MM-d hh:mm:s:SSS'|'MM-dd h:m:s:SSS'|'MM-dd h:mm:s:SSS'|'MM-dd hh:m:s:SSS'|'MM-dd hh:mm:s:SSS'|'yy-M-d h:m:s:SSS'|'yy-M-d h:mm:s:SSS'|'yy-M-d hh:m:s:SSS'|'yy-M-d hh:mm:s:SSS'|'yy-M-dd h:m:s:SSS'|'yy-M-dd h:mm:s:SSS'|'yy-M-dd hh:m:s:SSS'|'yy-M-dd hh:mm:s:SSS'|'yy-MM-d h:m:s:SSS'|'yy-MM-d h:mm:s:SSS'|'yy-MM-d hh:m:s:SSS'|'yy-MM-d hh:mm:s:SSS'|'yy-MM-dd h:m:s:SSS'|'yy-MM-dd h:mm:s:SSS'|'yy-MM-dd hh:m:s:SSS'|'yy-MM-dd hh:mm:s:SSS'|'yyyy-M-d h:m:s:SSS'|'yyyy-M-d h:mm:s:SSS'|'yyyy-M-d hh:m:s:SSS'|'yyyy-M-d hh:mm:s:SSS'|'yyyy-M-dd h:m:s:SSS'|'yyyy-M-dd h:mm:s:SSS'|'yyyy-M-dd hh:m:s:SSS'|'yyyy-M-dd hh:mm:s:SSS'|'yyyy-MM-d h:m:s:SSS'|'yyyy-MM-d h:mm:s:SSS'|'yyyy-MM-d hh:m:s:SSS'|'yyyy-MM-d hh:mm:s:SSS'|'yyyy-MM-dd h:m:s:SSS'|'yyyy-MM-dd h:mm:s:SSS'|'yyyy-MM-dd hh:m:s:SSS'|'yyyy-MM-dd hh:mm:s:SSS'|'iso'|'ISO'|string} [format='yyyy/MM/dd hh:mm:ss']
             */
            $_cvt.date = function (src, format) {
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
                                // take as date
                                // like '20110523' -> '2011/05/23 00:00:00'
                                t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                    return i > 1 ? '/' + s : s;
                                }).join('');
                            } else if (t.length === 12) {
                                // take as short year and full time
                                // like '110523163208' -> '2011/05/23 16:32:08'
                                t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                    return i === 0
                                        ? new Date().getFullYear().toString().slice(0, 2) + s
                                        : i < 3 ? '/' + s : i === 3 ? ' ' + s : i < 6 ? ':' + s : s;
                                }).join('');
                            } else if (t.length === 14) {
                                // take as full date and full time
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
             * Returns parsed url with a data object
             * @param {string} src
             * @param {Object} [data]
             * @param {string|string[]} [exclude]
             * @example
             * // 'http://abc.com?apple=9&pear=3&others=&buyer=003&message=thx'
             * console.log($$cvt.url('http://abc.com', {
             *     apple: 9,
             *     pear: 3,
             *     others: {
             *         buyer: '003',
             *         message: 'thx',
             *     },
             * }));
             * @returns {string}
             */
            $_cvt.url = function (src, data, exclude) {
                if (!src) {
                    throw Error('Source url is required for $$cvt.url()');
                }
                if (!data) {
                    return src;
                }
                let _sep = src.match(/\?/) ? '&' : '?';
                return src + _sep + _parseObj(data);

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
                        if (!~_exclude.indexOf(key)) {
                            _val = encodeURI(_val);
                        }
                        return key + '=' + _val;
                    }).join('&');
                }
            };

            /**
             * MD5 by both JavaScript and Java.
             * Returns empty string with falsy input.
             */
            $_cvt.md5 = function (string) {
                if (!string) {
                    return '';
                }
                let _a = _md5Java(string);
                let _b = _md5JS(string);
                if (_a !== _b) {
                    throw Error('md5Java() !== md5JS()');
                }
                return _b;
            };
            $_cvt.md5.js = _md5JS;
            $_cvt.md5.java = _md5Java;

            $_cvt.gzip = Object.create(null);
            $_cvt.gzip.decode = _decodeGZip;

            return $_cvt;

            // tool function(s) //

            function _parse(src, init_unit, options, presets) {
                let _init = init_unit === undefined ? {} : {init_unit: init_unit};
                return $_cvt(src, Object.assign(_init, presets, options));
            }

            // noinspection SpellCheckingInspection
            /**
             * JavaScript MD5
             * https://github.com/blueimp/JavaScript-MD5
             *
             * Copyright 2011, Sebastian Tschan
             * https://blueimp.net
             *
             * Licensed under the MIT license:
             * https://opensource.org/licenses/MIT
             *
             * Based on
             * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
             * Digest Algorithm, as defined in RFC 1321.
             * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
             * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
             * Distributed under the BSD License
             * See http://pajhome.org.uk/crypt/md5 for more info.
             */
            function _md5JS(string, key, raw) {
                'use strict';

                return md5(string, key, raw).toUpperCase();

                /**
                 * Add integers, wrapping at 2^32.
                 * This uses 16-bit operations internally to work around bugs in interpreters.
                 *
                 * @param {number} x First integer
                 * @param {number} y Second integer
                 * @returns {number} Sum
                 */
                function safeAdd(x, y) {
                    let lsw = (x & 0xffff) + (y & 0xffff);
                    let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                    return (msw << 16) | (lsw & 0xffff);
                }

                /**
                 * Bitwise rotate a 32-bit number to the left.
                 *
                 * @param {number} num 32-bit number
                 * @param {number} cnt Rotation count
                 * @returns {number} Rotated number
                 */
                function bitRotateLeft(num, cnt) {
                    return (num << cnt) | (num >>> (32 - cnt));
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} q q
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5cmn(q, a, b, x, s, t) {
                    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} c c
                 * @param {number} d d
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5ff(a, b, c, d, x, s, t) {
                    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} c c
                 * @param {number} d d
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5gg(a, b, c, d, x, s, t) {
                    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} c c
                 * @param {number} d d
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5hh(a, b, c, d, x, s, t) {
                    return md5cmn(b ^ c ^ d, a, b, x, s, t);
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} c c
                 * @param {number} d d
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5ii(a, b, c, d, x, s, t) {
                    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
                }

                /**
                 * Calculate the MD5 of an array of little-endian words, and a bit length.
                 *
                 * @param {Array} x Array of little-endian words
                 * @param {number} len Bit length
                 * @returns {Array<number>} MD5 Array
                 */
                function binlMD5(x, len) {
                    /* append padding */
                    x[len >> 5] |= 0x80 << len % 32;
                    x[(((len + 64) >>> 9) << 4) + 14] = len;

                    let i;
                    let old_a;
                    let old_b;
                    let old_c;
                    let old_d;
                    let a = 1732584193;
                    let b = -271733879;
                    let c = -1732584194;
                    let d = 271733878;

                    for (i = 0; i < x.length; i += 16) {
                        old_a = a;
                        old_b = b;
                        old_c = c;
                        old_d = d;

                        a = md5ff(a, b, c, d, x[i], 7, -680876936);
                        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
                        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
                        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
                        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
                        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
                        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
                        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
                        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
                        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
                        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
                        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
                        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
                        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
                        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
                        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

                        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
                        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
                        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
                        b = md5gg(b, c, d, a, x[i], 20, -373897302);
                        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
                        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
                        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
                        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
                        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
                        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
                        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
                        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
                        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
                        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
                        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
                        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

                        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
                        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
                        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
                        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
                        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
                        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
                        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
                        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
                        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
                        d = md5hh(d, a, b, c, x[i], 11, -358537222);
                        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
                        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
                        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
                        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
                        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
                        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

                        a = md5ii(a, b, c, d, x[i], 6, -198630844);
                        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
                        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
                        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
                        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
                        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
                        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
                        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
                        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
                        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
                        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
                        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
                        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
                        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
                        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
                        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

                        a = safeAdd(a, old_a);
                        b = safeAdd(b, old_b);
                        c = safeAdd(c, old_c);
                        d = safeAdd(d, old_d);
                    }
                    return [a, b, c, d];
                }

                /**
                 * Convert an array of little-endian words to a string
                 *
                 * @param {Array<number>} input MD5 Array
                 * @returns {string} MD5 string
                 */
                function binl2rstr(input) {
                    let i;
                    let output = '';
                    let length32 = input.length * 32;
                    for (i = 0; i < length32; i += 8) {
                        output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
                    }
                    return output;
                }

                /**
                 * Convert a raw string to an array of little-endian words
                 * Characters >255 have their high-byte silently ignored.
                 *
                 * @param {string} input Raw input string
                 * @returns {Array<number>} Array of little-endian words
                 */
                function rstr2binl(input) {
                    let i;
                    let output = [];
                    output[(input.length >> 2) - 1] = undefined;
                    for (i = 0; i < output.length; i += 1) {
                        output[i] = 0;
                    }
                    let length8 = input.length * 8;
                    for (i = 0; i < length8; i += 8) {
                        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
                    }
                    return output;
                }

                /**
                 * Calculate the MD5 of a raw string
                 *
                 * @param {string} s Input string
                 * @returns {string} Raw MD5 string
                 */
                function rstrMD5(s) {
                    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
                }

                /**
                 * Calculates the HMAC-MD5 of a key and some data (raw strings)
                 *
                 * @param {string} key HMAC key
                 * @param {string} data Raw input string
                 * @returns {string} Raw MD5 string
                 */
                function rstrHMACMD5(key, data) {
                    let i;
                    let b_key = rstr2binl(key);
                    let i_pad = [];
                    let o_pad = [];
                    let hash;
                    i_pad[15] = o_pad[15] = undefined;
                    if (b_key.length > 16) {
                        b_key = binlMD5(b_key, key.length * 8);
                    }
                    for (i = 0; i < 16; i += 1) {
                        i_pad[i] = b_key[i] ^ 0x36363636;
                        o_pad[i] = b_key[i] ^ 0x5c5c5c5c;
                    }
                    hash = binlMD5(i_pad.concat(rstr2binl(data)), 512 + data.length * 8);
                    return binl2rstr(binlMD5(o_pad.concat(hash), 512 + 128));
                }

                /**
                 * Convert a raw string to a hex string
                 *
                 * @param {string} input Raw input string
                 * @returns {string} Hex encoded string
                 */
                function rstr2hex(input) {
                    // noinspection SpellCheckingInspection
                    let hexTab = '0123456789abcdef';
                    let output = '';
                    let x;
                    let i;
                    for (i = 0; i < input.length; i += 1) {
                        x = input.charCodeAt(i);
                        output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
                    }
                    return output;
                }

                /**
                 * Encode a string as UTF-8
                 *
                 * @param {string} input Input string
                 * @returns {string} UTF8 string
                 */
                function str2rstrUTF8(input) {
                    return unescape(encodeURIComponent(input));
                }

                /**
                 * Encodes input string as raw MD5 string
                 *
                 * @param {string} s Input string
                 * @returns {string} Raw MD5 string
                 */
                function rawMD5(s) {
                    return rstrMD5(str2rstrUTF8(s));
                }

                /**
                 * Encodes input string as Hex encoded string
                 *
                 * @param {string} s Input string
                 * @returns {string} Hex encoded string
                 */
                function hexMD5(s) {
                    return rstr2hex(rawMD5(s));
                }

                /**
                 * Calculates the raw HMAC-MD5 for the given key and data
                 *
                 * @param {string} k HMAC key
                 * @param {string} d Input string
                 * @returns {string} Raw MD5 string
                 */
                function rawHMACMD5(k, d) {
                    return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
                }

                /**
                 * Calculates the Hex encoded HMAC-MD5 for the given key and data
                 *
                 * @param {string} k HMAC key
                 * @param {string} d Input string
                 * @returns {string} Raw MD5 string
                 */
                function hexHMACMD5(k, d) {
                    return rstr2hex(rawHMACMD5(k, d));
                }

                /**
                 * Calculates MD5 value for a given string.
                 * If a key is provided, calculates the HMAC-MD5 value.
                 * Returns a Hex encoded string unless the raw argument is given.
                 *
                 * @param {string} string Input string
                 * @param {string} [key] HMAC key
                 * @param {boolean} [raw] Raw output switch
                 * @returns {string} MD5 output
                 */
                function md5(string, key, raw) {
                    return key
                        ? raw ? rawHMACMD5(key, string) : hexHMACMD5(key, string)
                        : raw ? rawMD5(string) : hexMD5(string);
                }
            }

            /** Java MD5 */
            function _md5Java(string) {
                let MD5Kit = {
                    yT: [
                        '0', '1', '2', '3', '4', '5', '6', '7',
                        '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
                    ],
                    parse(paramArrayOfByte) {
                        let localMessageDigest = MessageDigest.getInstance('MD5');
                        localMessageDigest.update(paramArrayOfByte);
                        return this.toHexString(localMessageDigest.digest());
                    },
                    toHexString(paramArrayOfByte) {
                        let s = '';
                        if (!paramArrayOfByte) {
                            return s;
                        }
                        let i = 0;
                        while (i < paramArrayOfByte.length) {
                            s += this.yT[((paramArrayOfByte[i] & 0xF0) >>> 4)];
                            s += this.yT[(paramArrayOfByte[i] & 0xF)];
                            i += 1;
                        }
                        return s;
                    },
                    toMd5(str) {
                        if (!str) {
                            return '';
                        }
                        try {
                            // noinspection JSVoidFunctionReturnValueUsed,JSValidateTypes,JSDeprecatedSymbols,JSCheckFunctionSignatures
                            return this.parse(new java.lang.String(str).getBytes('UTF-8'));
                        } catch (e) {
                            // nothing to do here
                        }
                        return '';
                    },
                };

                return MD5Kit.toMd5(string).toUpperCase();
            }

            /**
             * @param {number[]} [bytes]
             * @param {'js_string'|'java_string'|'json'} [format='js_string']
             * @returns {string|*}
             */
            function _decodeGZip(bytes, format) {
                let os = new ByteArrayOutputStream();
                let is = new GZIPInputStream(new ByteArrayInputStream(bytes));
                let buffer = util.java.array('byte', 1024);
                let num;
                while ((num = is.read(buffer)) !== -1) {
                    os.write(buffer, 0, num);
                }
                // noinspection JSValidateTypes
                let _java_str = new java.lang.String(os.toByteArray());
                if (format === 'java_string') {
                    return _java_str;
                }
                let _js_str = String(_java_str);
                return format === 'json' ? JSON.parse(_js_str) : _js_str;
            }
        }();

        global.okhttp3 = Packages.okhttp3;
        global.androidx = Packages.androidx;
    },
    string() {
        if (!String.prototype.toTitleCase) {
            Object.defineProperty(String.prototype, 'toTitleCase', {
                /**
                 * Converts all the alphabetic characters in a string to title case.
                 * @function String.prototype.toTitleCase
                 * @param {boolean} [is_first_caps_only=false]
                 * @example
                 * console.log('hello world'.toTitleCase()); // 'Hello World'
                 * console.log('i say: hi! warm-hearted boy'.toTitleCase()); // 'I Say: Hi! Warm-Hearted Boy'
                 * console.log('JavaScript is AMAZING'.toTitleCase()); // 'Javascript Is Amazing'
                 * console.log('JavaScript is AMAZING'.toTitleCase(true)); // 'JavaScript Is AMAZING'
                 * @returns {string}
                 */
                value(is_first_caps_only) {
                    return this.replace(/([A-Za-z])([A-Za-z]*)/g, ($0, $1, $2) => {
                        return $1.toUpperCase() + (is_first_caps_only ? $2 : $2.toLowerCase());
                    });
                },
            });
        }
        if (!String.prototype.surround) {
            Object.defineProperty(String.prototype, 'surround', {
                /**
                 * Returns a new string with a certain mark surrounded
                 * @function String.prototype.surround
                 * @param {string|*} [pad]
                 * @param {Object} [options={}]
                 * @param {boolean} [options.no_symmetrical=false] - 'ABC' + 'CBA'
                 * @param {boolean} [options.no_intelli_brackets=false] - '(' + ')'
                 * @example
                 * console.log('hello'.surround('+')); // '+hello+'
                 * console.log('hello'.surround('^_^')); // '^_^hello^_^'
                 *
                 * console.log('hello'.surround('|-')); // '|-hello-|'
                 * console.log('hello'.surround('|-', {no_symmetrical: true})); // '|-hello|-'
                 * console.log('hello'.surround('135')); // '135hello531'
                 * console.log('hello'.surround('135', {no_symmetrical: true})); // '135hello135'
                 *
                 * console.log('hello'.surround('(')); // '(hello)'
                 * console.log('hello'.surround('(', {no_intelli_brackets: true})); // '(hello('
                 *
                 * console.log('hello'.surround('()')); // '(hello)'
                 * console.log('hello'.surround('()', {no_intelli_brackets: true})); // '()hello)('
                 * console.log('hello'.surround('()', {no_intelli_brackets: true, no_symmetrical: true})); // '()hello()'
                 *
                 * console.log('hello'.surround('(){}')); // '({hello})'
                 * console.log('hello'.surround('({})')); // '({hello)}'
                 * console.log('hello'.surround('({})[]')); // '({[hello])}'
                 * console.log('hello'.surround('(){}', {no_symmetrical: true})); // '({hello)}'
                 * console.log('hello'.surround('(){}[[]]', {no_symmetrical: true})); // '({[[hello)}]]'
                 * @returns {string}
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
                     * @returns {boolean}
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
                 * A simple polyfill which takes current string as template string
                 * @property String.prototype.ts
                 * @example
                 * // `name` must be an global variable
                 * let name = 'John';
                 * // backticks can't be omitted
                 * console.log('`Hello ${name}, time is ${new Date().toLocaleTimeString()}`'.ts);
                 * @example
                 * console.log('`9 × 2 = ${9 * 2}`'.ts); // '9 × 2 = 18'
                 * console.log('`9 ÷ 2 = ${9 / 2}`'.ts); // '9 ÷ 2 = 4.5'
                 * @example
                 * global.SEX = 'M', global.NAME = 'John';
                 * console.log('`Hello ${global.SEX[0] === 'M' ? 'Mr.' : 'Mrs.'} ${global.NAME}`'.ts);
                 * @example
                 * let A = 'a', B = 'b', C = 'c'; // global variables
                 * console.log('`${A} and ${B} or ${C}`'.ts); // 'a and b or c'
                 * console.log('`${A + ` and ${B + ` or ${C}`}`}`'.ts); // 'a and b or c'
                 * @returns {string}
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
                        return str.replace(/\${(.*?)}/g, ($0, $1) => Function('return ' + $1)());
                    }
                },
                configurable: true,
            });
        }
    },
    object() {
        if (!Object.size) {
            Object.defineProperty(Object, 'size', {
                /**
                 * @function Object.size
                 * @param {Array|Object|*} o
                 * @param {Object} [opt] - additional options
                 * @param {string|string[]} [opt.exclude=[]] - exclude specified keys
                 * @param {string|string[]} [opt.include=[]] - include specified keys ONLY, and o.exclude will be invalid
                 * @returns {number} - { x >= -1 and x ∈ Z }
                 */
                value(o, opt) {
                    if (typeof o !== 'object') {
                        return Array.isArray(o) ? o.length : -1;
                    }
                    let _arrayify = o => Array.isArray(o) ? o : o === undefined ? [] : [o];
                    let _opt = opt || {};

                    let _inc = _arrayify(_opt.include);
                    let _exc = _arrayify(_opt.exclude);

                    return Object.keys(o).filter((k) => {
                        return _inc.length ? ~_inc.indexOf(k) : !~_exc.indexOf(k);
                    }).length;
                },
            });
        }
        if (!Object.getOwnNonEnumerableNames) {
            Object.defineProperty(Object, 'getOwnNonEnumerableNames', {
                /**
                 * @function Object.getOwnNonEnumerableNames
                 * @param {Object} o
                 * @returns {string[]}
                 */
                value: o => Object.getOwnPropertyNames(o)
                    .filter(n => !o.propertyIsEnumerable(n)),
            });
        }
        if (!Object.getNonEnumerableNames) {
            Object.defineProperty(Object, 'getNonEnumerableNames', {
                /**
                 * @function Object.getNonEnumerableNames
                 * @param {Object} o
                 * @returns {string[]}
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
                 * @function Object.getAllPropertyNames
                 * @param {Object} o
                 * @returns {string[]}
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
                 * @function Object.assignDescriptors
                 * @param {Object} o
                 * @param {...Object} descriptors
                 * @example
                 * let o = {
                 *     a: 1,
                 *     b: () => null,
                 *     get d() {return Date.now()},
                 * };
                 * let p = Object.create(null, {
                 *     a: {value: () => null},
                 *     b: {value: 2020, enumerable: true},
                 *     c: {get() {return Date.now()}},
                 *     e: {get() {return Number(Math.random().toFixed(2))}},
                 * });
                 * log(Object.assignDescriptors(o, {}, p, {}, Object.defineProperty({}, 'd', {get() {return new Date()}})));
                 * log(o.a, o.b, o.c, o.d, o.e);
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
        if (!Object.prototype.__proto__) {
            Object.defineProperty(Object.prototype, '__proto__', {
                /** @type {object|null} */
                get() {
                    return Object.getPrototypeOf(Object(this));
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
    },
    number() {
        if (!Number.prototype.ICU) {
            Object.defineProperty(Number.prototype, 'ICU', {
                /**
                 * 996.ICU - Developers' lives matter
                 * @name ICU
                 * @memberOf! Number#
                 * @constant 996
                 * @type {number}
                 * @example
                 * (1).ICU; // 996
                 * (80).ICU; // 996
                 * (996).ICU; // 996
                 * Math.random().ICU; // 996
                 */
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
                 * Returns a number clamped to inclusive range of min and max
                 * @function Number.prototype.clamp
                 * @param {...number|*} [args] -
                 * inclusive range indicated by numbers
                 * or values could be converted to numbers
                 * @example
                 * // 'clamp' often used for an alterable or random number
                 * Math.rand([-5, 9]).clamp([0, 10]);
                 * Math.rand([-5, 9]).clamp(0, 10); // also OK but not recommended
                 * // different from Math.rand([0.3, 0.5])
                 * Math.random().clamp([0.3, 0.5]);
                 * // always returns the source number itself
                 * (9).clamp(); // 9
                 * (99).clamp(); // 99
                 * // always returns the numeric value of param
                 * (9).clamp([80]); // 80 -- same as clamp([80, 80])
                 * (99).clamp(['80']); // 80 -- +'80' -> 80
                 * // (10).clamp([false, 'Hi', [-1], '7'])
                 * // -> (10).clamp([+false, +'Hi', +[-1], +'7'])
                 * // -> (10).clamp([0, NaN, -1, 7]) // numeric converted
                 * // -> (10).clamp([0, -1, 7]) // filtered
                 * // -> (10).clamp([-1, 0, 7]) // sorted, range: [-1, 7]
                 * // -> 7
                 * (10).clamp([false, 'Hi', [-1], '7']); // 7
                 * @returns {number}
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
                 * Returns a number value of Number.prototype.toFixed()
                 * @function Number.prototype.toFixedNum
                 * @param {number} [num=0] -
                 * number of digits after the decimal point
                 * @see Number.prototype.toFixed
                 * @example
                 * let num_a = 9;
                 * num_a.toFixed();     // '9'    -- string
                 * num_a.toFixedNum();  //  9     -- number
                 * num_a.toFixed(1);    // '9.0'  -- string
                 * num_a.toFixedNum(1); //  9     -- number
                 * num_a.toFixed(2);    // '9.00' -- string
                 * num_a.toFixedNum(2); //  9     -- number
                 *
                 * let num_b = 9.04;
                 * num_b.toFixed();     // '9'    -- string
                 * num_b.toFixedNum();  //  9     -- number
                 * num_b.toFixed(1);    // '9.0'  -- string
                 * num_b.toFixedNum(1); //  9     -- number
                 * num_b.toFixed(2);    // '9.04' -- string
                 * num_b.toFixedNum(2); //  9.04  -- number
                 *
                 * let num_c = 9.5995;
                 * num_c.toFixed();     // '10'   -- string
                 * num_c.toFixedNum();  //  10    -- number
                 * num_c.toFixed(1);    // '9.6'  -- string
                 * num_c.toFixedNum(1); //  9.6   -- number
                 * num_c.toFixed(2);    // '9.60' -- string
                 * num_c.toFixedNum(2); //  9.6   -- number
                 * @returns {number}
                 */
                value(num) {
                    return Number(this.toFixed(num));
                },
            });
        }
        if (!Number.prototype.padStart) {
            if (String.prototype.padStart) {
                /**
                 * Pads the current number with a given string to reach a given length (right padding).
                 * @function Number.prototype.padStart
                 * @param {number} target_len
                 * @param {string|number} [pad_str=' ']
                 * @example
                 * console.log(Number(9).padStart(4)); // '0009'
                 * console.log(Number(9).padStart(4, ' ')); // '   9'
                 * @returns {string}
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
                 * Pads the current number with a given string to reach a given length (right padding).
                 * @function Number.prototype.padEnd
                 * @param {number} target_len
                 * @param {string|number} [pad_str=' ']
                 * @example
                 * console.log(Number(9).padEnd(4)); // '9000'
                 * console.log(Number(9).padEnd(4, ' ')); // '9   '
                 * @returns {string}
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
            /**
             * Convert percentage string into a number
             * @param {PercentageString|string} percentage
             * @example
             * log(Number.parsePct('100%')); // 1
             * log(Number.parsePct('50%')); // 0.5
             * log(Number.parsePct('99.95%')); // 0.9995
             * log(Number.parsePct('1%')); // 0.01
             * log(Number.parsePct('1%%')); // 0.0001
             * log(Number.parsePct('100%%%')); // 0.0001
             * @returns {number}
             */
            Number.parsePct = function (percentage) {
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
            };
        }
    },
    math() {
        Object.assign(Math, {
            /** @returns {Array} */
            _parseArgs(num_arr, fraction) {
                let _arr, _fraction;
                if (Array.isArray(num_arr)) {
                    _arr = this._spreadArr(num_arr);
                    _fraction = fraction;
                } else {
                    _arr = this._spreadArr(arguments);
                }
                return [_arr, _fraction];
            },
            /** @returns {Array} */
            _spreadArr(arr) {
                let _plain = [];
                let _len = (arr || []).length;
                for (let i = 0; i < _len; i += 1) {
                    let _e = arr[i];
                    Array.isArray(_e)
                        ? _plain = _plain.concat(this._spreadArr(_e))
                        : _plain.push(_e);
                }
                return _plain;
            },
            /**
             * @summary Random Number (zh-CN: 随机数)
             * @description Returns a pseudorandom number between min and max from the 'range' param
             * @function Math.rand
             * @param {*|number[]|number} [range=[0,1]] -
             * range could contains more than 2 numbers
             * or with one number for [0, range]
             * or left empty for [0, 1]
             * @param {number} [fraction] -
             * number of digits after the decimal point and
             * must be in the range [0, 20]
             * @see Math.random
             * @see Number.prototype.toFixed
             * @example
             * // all below are same as Math.random()
             * Math.rand();
             * Math.rand(1);
             * Math.rand([0, 1]);
             * Math.rand([0, 1], -0);
             * // Math.random() with Number.toFixedNum(x): number
             * // 'range' could be any falsy value like 0,null,undefined,''
             * // or with value like example above like 1,[0,1]
             * Math.rand(0, 2); // eg: 0.34; 0.79; 0.3 (won't be '0.30' which must be a number)
             * // returns either 0 or 1 with 50% possibility of each
             * Math.rand(0, 0); // same as Math.rand([0, 1], 0)
             * // returns an integer in range of 100-500 (both inclusive)
             * Math.rand([100, 500], 0);
             * // elements in 'range' with 'Array' type will be sorted
             * Math.rand([500, 100], 0); // same as above
             * // 'range' with 'Array' type with more than 2 elements will be picked up
             * Math.rand([500, 200, -80, 100], 0); // same as above
             * // parseInt() will be applied to each element in 'range' with 'Array' type
             * Math.rand([-8, 'Hello', NaN, '123', 99], 0); // same as Math.rand([-8, 123], 0)
             * // Infinity and -Infinity were accepted (in range of Number.MIN(MAX)_SAFE_INTEGER)
             * Math.rand([-Infinity, Infinity], 2); // eg: 42398472893; -43785571; -851119.3
             * Math.rand(Infinity, 2); // same as Math.rand([0, Infinity], 2)
             * Math.rand(-Infinity, 2); // same as Math.rand([-Infinity, 0], 2)
             * // caution about right-bounded ({@see Number.prototype.toFixed})
             * Math.rand([0, 1]); // 0 <= x < 1  -- left-closed and right-open without toFixed()
             * Math.rand([0, 1], -0); // 0 <= x < 1  -- left-closed and right-open with toFixed()
             * Math.rand([0, 1], 0); // 0 <= x <= 1  -- left-closed and right-closed with toFixed()
             * Math.rand([0, 1], 2); // 0 <= x <= 1  -- left-closed and right-closed with toFixed()
             * @returns {number}
             */
            rand(range, fraction) {
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
            /**
             * @summary Sum (zh-CN: 求和)
             * @description Returns a sum of numbers with (or without) fraction digits
             * @function Math.sum
             * @param {number|number[]} [num_arr] -
             * numbers needed to be summed up
             * @param {?number} [fraction] -
             * number of digits after the decimal point and
             * must be in the range [0, 20]
             * @example
             * Math.sum(); // 0
             * Math.sum(1); // 1
             * Math.sum(1, 2); // 3
             * Math.sum(1, 2, 3); // 6
             * Math.sum(1, '2', [3]); // 6
             * Math.sum(1, [2], [[3, 4], 5]); // 15
             * Math.sum(1.01, 2.02); // 3.0300000000000002
             * Math.sum([1.01, 2.02], 2); // 3.03
             * Math.sum([1.01, 2.02], 1); // 3 (won't be '3.0' which must be a number)
             * Math.sum([1.01, 2.02], 0); // 3
             * Math.sum('ABC', NaN, {a: 1}, 3, '5.2'); // 8.2 (3 and 5.2)
             * Math.sum(['ABC', NaN, {a: 1}, 3, '5.2'], 0); // 8
             * @returns {number}
             */
            sum(num_arr, fraction) {
                let [_arr, _frac] = this._parseArgs.apply(this, arguments);
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
            /**
             * @summary Arithmetic Mean (zh-CN: 算术平均数)
             * @description Returns the average of numbers with (or without) fraction digits
             * @function Math.avg
             * @param {number|number[]} [num_arr] -
             * numbers needed to be averaged
             * @param {?number} [fraction] -
             * number of digits after the decimal point and
             * must be in the range [0, 20]
             * @example
             * Math.avg(); // NaN
             * Math.avg(1); // 1
             * Math.avg(1, 2); // 1.5
             * Math.avg(1, 2, 3); // 2 (6 / 3)
             * Math.avg(1, '2', [3]); // 2 (6 / 3)
             * Math.avg(1, [2], [[3, 4], 5]); // 3 (15 / 5)
             * Math.avg(1.01, 2.02); // 1.5150000000000001
             * Math.avg([1.01, 2.02], 2); // 1.52
             * Math.avg([1.01, 2.02], 1); // 1.5
             * Math.avg([1.01, 2.02], 0); // 2
             * Math.avg('ABC', NaN, {a: 1}, 3, '5.2'); // 4.1 ((3 + 5.2) / 2)
             * Math.avg(['ABC', NaN, {a: 1}, 3, '5.2'], 0); // 4 (4.1).toFixed(0)
             * @returns {number}
             */
            avg(num_arr, fraction) {
                let [_arr, _frac] = this._parseArgs.apply(this, arguments);
                let _filtered = _arr.filter(x => !isNaN(+x));
                if (!_filtered.length) {
                    return NaN;
                }
                let _sum = _filtered.reduce((a, b) => +a + +b);
                let _avg = _sum / _filtered.length;
                let _frac_num = parseInt(_frac);
                return isNaN(_frac_num) ? _avg : +_avg.toFixed(_frac_num);
            },
            /**
             * @summary Median (zh-CN: 中位数)
             * @description Returns the middle number in a sorted list of numbers with (or without) fraction digits
             * @function Math.median
             * @param {number|number[]} [num_arr]
             * @param {?number} [fraction] -
             * number of digits after the decimal point and
             * must be in the range [0, 20]
             * @example
             * Math.median(); // NaN
             * Math.median(1); // 1
             * Math.median(1, 2); // 1.5
             * Math.median(1, 2, 3); // 2
             * Math.median(5, 3, 1, 4); // 3.5
             * @returns {number}
             */
            median(num_arr, fraction) {
                let [_arr, _frac] = this._parseArgs.apply(this, arguments);
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
            /**
             * @summary Variance (zh-CN: 方差)
             * @description Population Variance (zh-CN: 总体方差)
             * @see Math.avg
             * @example
             * Math.var(1,2,3,4,5); // 2
             * Math.var(97,98,98,99,100,101,103,104); // 5.5
             * Math.var([97,98,98,99,100,101,103,104], 0); // 6
             * @returns {number}
             */
            var(num_arr, fraction) {
                let [_arr, _frac] = this._parseArgs.apply(this, arguments);
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
            /**
             * @summary Standard Deviation / Mean-Square Deviation (zh-CN: 标准差/均方差)
             * @description Population Standard Deviation (zh-CN: 总体标准差)
             * @see Math.var
             * @example
             * Math.std(1,2,3,4,5); // 1.4142135623730951
             * Math.std([1,2,3,4,5], 1); // 1.4
             * Math.std(97,98,98,99,100,101,103,104); // 2.345207879911715
             * Math.std([97,98,98,99,100,101,103,104], 3); // 2.345
             * @returns {number}
             */
            std(num_arr, fraction) {
                let [_arr, _frac] = this._parseArgs.apply(this, arguments);
                if (!_arr.length) {
                    return NaN;
                }
                let _filtered = _arr.filter(x => !isNaN(+x));
                let _std = Math.sqrt(Math.var(_filtered));
                let _frac_num = parseInt(_frac);
                return isNaN(_frac_num) ? _std : +_std.toFixed(_frac_num);
            },
            /**
             * @summary Coefficient of Variation (zh-CN: 变异系数/离散系数)
             * @see Math.avg
             * @example
             * Math.cv(1); // NaN
             * Math.cv(1, 1); // 0
             * Math.cv(22, 985, 3654, 98474, 698); // 2.092865807313618
             * Math.cv([22, 985, 3654, 98474, 698], 2); // 2.09
             * @returns {number} -- good reference: 0.5 (even 10, not absolutely)
             */
            cv(num_arr, fraction) {
                let [_arr, _frac] = this._parseArgs.apply(this, arguments);
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
            /**
             * @summary Polyfill and extension for Math.max(...number[])
             * @description Returns the maximum element in a numeric array
             * for JavaScript engines like Rhino (maybe old versions only)
             * which doesn't support spread syntax like Math.max(...number[])
             * @function Math.maxi
             * @param {number|number[]} [num_arr] -
             * numbers needed to be calculated
             * @param {?number} [fraction] -
             * number of digits after the decimal point and
             * must be in the range [0, 20]
             * @example
             * // examples whose results are same as Math.max()
             *
             * Math.maxi(); // -Infinity (negative)
             * Math.maxi(1, 2, 3, 4); // 4
             * // false can be converted to 0
             * // '3' and [2] can be converted to 3 and 2
             * Math.maxi([3], '2', 1, false); // 3
             *
             * // examples available for Math.maxi() but NaN for Math.max()
             *
             * // array cannot be converted to a number
             * // when array was the first parameter of Math.maxi()
             * // elements inside will be spread as arguments for Math.max()
             * Math.maxi([1, 2, 3, 4]); // 4
             * Math.maxi([0.123, 0.234]); // 0.234
             * Math.maxi([0.123, 0.234], 1); // 0.2
             * // 'false' isn't false which cannot be converted to a number
             * Math.maxi(3, '2', [1], 'false'); // 3
             * // the last parameter 2 is the argument for 'fraction'
             * // meaning not participating the calculation
             * Math.maxi([1, {}, [1000 / 3], '4', '55'], 2); // 333.33
             * // as most customized Math functions does,
             * // calculation was supported by nesting array
             * Math.maxi(1, [[[10], 20], 83], 20, [-9], [27, 72]); // 83
             *
             * // examples whose results are not same as Math.max()
             *
             * // Math.maxi([])
             * // -> Math.max.apply(null, [])
             * // -> Math.max() -> -Infinity
             * // Math.max([])
             * // -> Math.max(+[])
             * // -> Math.max(0) -> 0
             * Math.maxi([]); // -Infinity vs 0
             * // Math.maxi([3], 4)
             * // -> +Math.max(3).toFixed(4) -> 3
             * // Math.max([3], 4)
             * // -> Math.max(+[3], 4)
             * // -> Math.max(3, 4) -> 4
             * Math.maxi([3], 4); // 3 vs 4
             * // Math.maxi([3], '5', 1, false)
             * // -> Math.maxi([3], '5') // [3] is num_arr, '5' is fraction
             * // -> Math.maxi([3], 5) -> 3
             * // Math.max([3], '5', 1, false)
             * // -> Math.max(+[3], +'5', 1, +false)
             * // -> Math.max(3, 5, 1, 0) -> 5
             * Math.maxi([3], '5', 1, false); // 3 vs 5
             * @returns {number}
             */
            maxi(num_arr, fraction) {
                let _arr, _fraction;

                if (Array.isArray(num_arr)) {
                    _arr = this._spreadArr(num_arr);
                    _fraction = fraction;
                } else {
                    _arr = this._spreadArr(arguments);
                }

                let _filtered = _arr.filter(x => !isNaN(+x));
                let _max = Math.max.apply(null, _filtered);
                let _frac = parseInt(_fraction);
                return isNaN(_frac) ? _max : +_max.toFixed(_frac);
            },
            /**
             * @summary Polyfill and extension for Math.min(...number[])
             * @description Returns the minimum element in a numeric array
             * for JavaScript engines like Rhino (maybe old versions only)
             * which doesn't support spread syntax like Math.min(...number[])
             * @function Math.mini
             * @param {number|number[]} [num_arr] -
             * numbers needed to be calculated
             * @param {?number} [fraction] -
             * number of digits after the decimal point and
             * must be in the range [0, 20]
             * @example
             * // examples whose results are same as Math.min()
             *
             * Math.mini(); // Infinity (positive)
             * Math.mini(1, 2, 3, 4); // 1
             * // false can be converted to 0
             * // '3' and [2] can be converted to 3 and 2
             * Math.mini('3', [2], 1, false); // 0
             *
             * // examples available for Math.mini() but NaN for Math.min()
             *
             * // array cannot be converted to a number
             * // when array was the first parameter of Math.mini()
             * // elements inside will be spread as arguments for Math.min()
             * Math.mini([1, 2, 3, 4]); // 1
             * Math.mini([0.123, 0.234]); // 0.123
             * Math.mini([0.123, 0.234], 1); // 0.1
             * // 'false' isn't false which cannot be converted to a number
             * Math.mini(3, '2', [1], 'false'); // 1
             * // the last parameter 2 is the argument for 'fraction'
             * // meaning not participating the calculation
             * Math.mini([1, {}, [1000 / 3], '4', '55'], 2); // 1
             * // as most customized Math functions does,
             * // calculation was supported by nesting array
             * Math.mini(1, [[[10], 20], 83], 20, [-9], [27, 72]); // -9
             *
             * // examples whose results are not same as Math.min()
             *
             * // Math.mini([])
             * // -> Math.min.apply(null, [])
             * // -> Math.min() -> Infinity
             * // Math.min([])
             * // -> Math.min(+[])
             * // -> Math.min(0) -> 0
             * Math.mini([]); // Infinity vs 0
             * // Math.mini([3], 2)
             * // -> +Math.min(3).toFixed(2) -> 3
             * // Math.min([3], 2)
             * // -> Math.min(+[3], 2)
             * // -> Math.min(3, 2) -> 2
             * Math.mini([3], 2); // 3 vs 2
             * // Math.mini([3], '2', 1, false)
             * // -> Math.mini([3], '2') // [3] is num_arr, '2' is fraction
             * // -> Math.mini([3], 2) -> 3
             * // Math.min([3], '2', 1, false)
             * // -> Math.min(+[3], +'2', 1, +false)
             * // -> Math.min(3, 2, 1, 0) -> 0
             * Math.mini([3], '2', 1, false); // 3 vs 0
             * @returns {number}
             */
            mini(num_arr, fraction) {
                let _arr, _fraction;

                if (Array.isArray(num_arr)) {
                    _arr = this._spreadArr(num_arr);
                    _fraction = fraction;
                } else {
                    _arr = this._spreadArr(arguments);
                }

                let _filtered = _arr.filter(x => !isNaN(+x));
                let _min = Math.min.apply(null, _filtered);
                let _frac = parseInt(_fraction);
                return isNaN(_frac) ? _min : +_min.toFixed(_frac);
            },
            /**
             * @summary Distance between two points (zh-CN: 两点间距)
             * @description Returns distance value between two points
             * @function Math.dist
             * @param {number[]} arr1 - a number array with two coordinates
             * @param {number[]} arr2 - another number array with two coordinates
             * @example
             * Math.dist(); // NaN
             * Math.dist([0, 0], [3, 4]); // 5
             * Math.dist([6, 7], [12, 15]); // 10
             * @returns {number}
             */
            dist(arr1, arr2) {
                if (!arr1 || !arr2) {
                    return NaN;
                }
                if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
                    return NaN;
                }
                if (arr1.length !== 2 || arr2.length !== 2) {
                    return NaN;
                }
                let _a = Math.pow(arr2[0] - arr1[0], 2);
                let _b = Math.pow(arr2[1] - arr1[1], 2);
                return Math.sqrt(_a + _b);
            },
            /**
             * Returns the logarithm (with both base and antilogarithm) of two numbers.
             * @function Math.logMn
             * @param {number} base - zh-CN: 底数
             * @param {number} antilogarithm - zh-CN: 真数
             * @param {number} [fraction=13] - zh-CN: 尾数
             * @example
             * console.log(Math.logMn(10, 100)); // 2 -- 10 ^ (2) = 100
             * console.log(Math.logMn(2, 1024)); // 10 -- 2 ^ (10) = 1024
             * console.log(Math.logMn(81, 9)); // 0.5 -- 81 ^ (0.5) = 9
             * @example
             * console.log(Math.logMn(3, 2187)); // 7 (with default fraction: 13)
             * console.log(Math.logMn(3, 2187, -1)); // 7.000000000000001
             * console.log(Math.logMn(3, 2187, 18)); // 7.000000000000001
             * console.log(Math.logMn(3, 2187, 5)); // 7
             * console.log(Math.logMn(3, 2187, 0)); // 7
             * @returns {number}
             */
            logMn(base, antilogarithm, fraction) {
                let _frac = typeof fraction === 'number' ? fraction : 13;
                let _result = Math.log(antilogarithm) / Math.log(base);
                if (isNaN(_result) || !isFinite(_result) || ~_frac) {
                    return _result;
                }
                return Number(_result.toFixed(_frac));
            },
            /**
             * @param {number} base
             * @param {number} antilogarithm
             * @example
             * console.log(Math.floorLog(2, 1500)); // 10
             * @returns {number}
             */
            floorLog(base, antilogarithm) {
                return Math.floor(this.logMn(base, antilogarithm));
            },
            /**
             * @param {number} base
             * @param {number} antilogarithm
             * @example
             * console.log(Math.ceilLog(2, 1500)); // 11
             * @returns {number}
             */
            ceilLog(base, antilogarithm) {
                return Math.ceil(this.logMn(base, antilogarithm));
            },
            /**
             * @param {number} base
             * @param {number} antilogarithm
             * @example
             * console.log(Math.roundLog(2, 1500)); // 11
             * @returns {number}
             */
            roundLog(base, antilogarithm) {
                return Math.round(this.logMn(base, antilogarithm));
            },
            /**
             * @param {number} base
             * @param {number} power
             * @example
             * console.log(Math.floorPow(2, 1500)); // 1024
             * @returns {number}
             */
            floorPow(base, power) {
                return Math.pow(base, this.floorLog(base, power));
            },
            /**
             * @param {number} base
             * @param {number} power
             * @example
             * console.log(Math.ceilPow(2, 1500)); // 1024
             * @returns {number}
             */
            ceilPow(base, power) {
                return Math.pow(base, this.ceilLog(base, power));
            },
            /**
             * @param {number} base
             * @param {number} power
             * @example
             * console.log(Math.roundPow(2, 1500)); // 2048
             * @returns {number}
             */
            roundPow(base, power) {
                return Math.pow(base, this.roundLog(base, power));
            },
        });
    },
}.$polyfill();

module.exports.load = function () {
    let _args = Array.isArray(arguments[0]) ? arguments[0] : arguments;
    let _keys = _args.length ? [].slice.call(_args) : Object.keys(ext);
    _keys.map(k => k.toLowerCase()).forEach(k => k in ext && ext[k].call(ext));
    return ext;
};