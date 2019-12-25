let ext = {
    Math: () => Object.assign(Math.__proto__, {
        rand: (range, fix) => {
            if (!range) {
                return Math.fix(Math.random(), fix);
            }

            let _min, _max;
            let _diff = () => _max - _min;

            if (range instanceof Array) {
                [_min, _max] = range.sort();
            } else {
                [_min, _max] = [0, range];
            }

            let _rand = Math.random() * _diff() + _min;
            return Math.fix(_rand, fix);
        },
        /**
         * @returns {string|number}
         */
        fix: (num, fix) => {
            if (typeof fix === "undefined") return num;
            let _fixed = num.toFixed(fix);
            if (typeof fix === "number") return _fixed;
            return +_fixed;
        },
        sum: function (arr, fix) {
            let _arr = [];
            let _fix;

            if (Array.isArray(arr)) {
                _arr = _parseArr(arr);
                _fix = fix;
            } else {
                _arr = _parseArr(arguments);
            }

            let _len = arr.length;
            let _sum = _len && _arr.reduce((a, b) => +a + +b);

            return Math.fix(_sum, _fix);

            // tool function(s) //

            function _parseArr(arr) {
                let _plain = [];
                let _len = (arr || []).length;

                for (let i = 0; i < _len; i += 1) {
                    let _e = arr[i];
                    if (Array.isArray(_e)) {
                        let _parsed = _parseArr(_e);
                        _plain = _plain.concat(_parsed);
                    } else {
                        _plain.push(_e);
                    }
                }

                return _plain;
            }
        },
        avg: (arr, fix) => {
            let _avg = Math.sum(arr) / arr.length;
            return Math.fix(_avg, fix);
        },
        /**
         * @desc variance
         */
        var: (arr, fix) => {
            let _len = arr.length;
            let _avg = Math.avg(arr);
            let _tmp = 0;
            for (let i = 0; i < _len; i += 1) {
                _tmp += Math.pow((arr[i] - _avg), 2);
            }
            return Math.fix(_tmp / _len, fix);
        },
        /**
         * @desc Standard Deviation
         */
        std: (arr, fix) => Math.sqrt(Math.var(arr, fix)),
        /**
         * @fix {string|number|array} str: confer (comparison)
         * @desc Coefficient of Variation
         */
        cv: (arr, fix) => {
            let cf = null;
            if (typeof fix === "string") {
                cf = fix;
                fix = undefined;
            }
            let _cv = Math.std(arr, fix) / Math.avg(arr, fix);
            if (cf) return _cv <= +cf;
            return Math.fix(_cv, fix);
        },
        maxi: (arr, fix) => {
            let _max = Math.max.apply({}, arr);
            return Math.fix(_max, fix);
        },
        mini: (arr, fix) => {
            let _min = Math.min.apply({}, arr);
            return Math.fix(_min, fix);
        },
    }),
    String: () => {
        if (!String["toTitleCase"]) {
            String.prototype.toTitleCase = function () {
                let _str = this.toString();
                if (!_str) return "";
                return _str[0].toUpperCase() + _str.slice(1).toLowerCase();
            }
        }
    },
    /**
     * Assign some checkers to global object (all started with "$$)
     * @example
     * $$bool(0.5 === "0.5"); // false
     * $$str("1991"); // true
     * $$und(coffee); // true -- means undefined
     * $$num(0); // true
     * $$num(20, "<", 28, "<=", Infinity); // true
     * $$num(20, "<", 28, ">=", 1, ">", -Infinity, "<=", -0, "=", +0); // true -- weird and i know
     * @return void
     */
    Dollars: function () {
        let classof = function (source, check_value) {
            let class_result = Object.prototype.toString.call(source).slice(8, -1);
            return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
        };
        let keysLen = (o, n) => Object.keys(o).length === n;
        let compare = {
            "<": (a, b) => a < b,
            "<=": (a, b) => a <= b,
            ">": (a, b) => a > b,
            ">=": (a, b) => a >= b,
            "=": (a, b) => a === b,
        };

        Object.assign(global, {
            $$num: function (x) {
                // do not use arrow function here
                let _isNum = a => classof(a, "Number");
                let _isStr = a => classof(a, "String");
                let _args = arguments;
                let _len = _args.length;

                if (_len === 1) return _isNum(x);
                if (_len === 2) return x === _args[1];

                for (let i = 1; i < _len; i += 2) {
                    let _a = _args[i - 1];
                    let _opr = _args[i]; // operational symbol
                    let _b = _args[i + 1];
                    if (!_isStr(_opr) || !_isNum(_b)) return;
                    if (!(_opr in compare)) return;
                    if (!compare[_opr](_a, _b)) return false;
                }

                return true;
            },
            $$str: function (x) {
                let _isStr = a => classof(a, "String");
                let _args = arguments;
                let _len = _args.length;
                let _args_arr = [];

                if (_len === 1) return _isStr(x);
                if (_len === 2) return x === _args[1];

                for (let i = 0; i < _len; i += 1) {
                    _args_arr[i] = _args[i].toString();
                }

                for (let i = 1; i < _len; i += 2) {
                    let _a = _args_arr[i - 1];
                    let _opr = _args_arr[i]; // operational symbol
                    let _b = _args_arr[i + 1];
                    if (!(_opr in compare)) return;
                    if (!compare[_opr](_a, _b)) return false;
                }

                return true;
            },
            $$bool: x => classof(x, "Boolean"),
            // `classof(x, "Undefined")` also fine
            $$und: x => x === void 0,
            $$nul: x => classof(x, "Null"),
            // introduced since ES6
            $$sym: x => classof(x, "Symbol"),
            // primitive (contains 6 types with Symbol)
            get $$prim() {
                return (x) => {
                    return this.$$num(x) || this.$$str(x) || this.$$bool(x)
                        || this.$$nul(x) || this.$$und(x) || this.$$sym(x);
                };
            },
            $$func: x => classof(x, "Function"),
            // `Array.isArray(x);` fine or not ?
            // i guess it will be fine as long as
            // the global object is not Window (for a browser)
            $$arr: x => classof(x, "Array"),
            // Object only
            $$obj: x => classof(x, "Object"),
            $$emptyObj: x => classof(x, "Object") && keysLen(x, 0),
            $$noEmptyObj: x => classof(x, "Object") && !keysLen(x, 0),
            // Null; Array; Object
            $$comObj: x => typeof x === "object",
            $$date: x => classof(x, "Date"),
            $$regexp: x => classof(x, "RegExp"),
            $$rex: x => classof(x, "RegExp"),
            get $$nulOrUnd() {
                return function (x) {
                    this.$$nul(x) || this.$$und(x)
                }.bind(this);
            },
            $$fin: x => isFinite(x),
            $$inf: x => !isFinite(x),
            $$nan: x => isNaN(x),
            get $$posNum() {
                return x => this.$$num(x) && x > 0;
            },
            get $$natNum() {
                return x => this.$$zehNum(x) && x >= 0;
            },
            get $$negNum() {
                return x => this.$$num(x) && x < 0;
            },
            // `Number.isInteger(x)` since ES6
            get $$zehNum() {
                return x => this.$$num(x) && (x | 0) === x;
            },
            $$0: x => x === 0,
            // `!~x` is also cool
            $$neg1: x => x === -1,
            $$T: x => x === true,
            $$F: x => x === false,
            $$len: (x, n) => {
                if (!classof(x, "Arguments") && !classof(x, "Array")) {
                    throw TypeError("Expected Array or Arguments rather than " + classof(x));
                }
                if (classof(n, "Number")) return x.length === n;
                return x.length;
            },
            // `classof(x, "JavaObject");` also fine
            __isJvo__: x => !!x["getClass"],
            get _checkJvoType() {
                return (x, rex) => this.__isJvo__(x) && !!x.toString().match(rex);
            },
            get _checkJvoClass() {
                let _classMatch = (x, rex) => x.getClass().toString().match(rex);
                return (x, rex) => this.__isJvo__(x) && _classMatch(x, rex);
            },
            get $$jvo() {
                return {
                    isJvo: x => this.__isJvo__(x),
                    ScriptEngine: x => this._checkJvoType(x, /^ScriptEngine/),
                    Thread: x => this._checkJvoType(x, /^Thread/),
                    UiObject: x => this._checkJvoType(x, /UiObject/),
                    UiObjects: x => this._checkJvoType(x, /UiObjectCollection/),
                    UiGlobSel: x => this._checkJvoType(x, /UiGlobalSelector/),
                    JsRawWin: x => this._checkJvoType(x, /JsRawWindow/),
                    ImageWrapper: x => this._checkJvoType(x, /ImageWrapper/),
                    Point: x => this._checkJvoType(x, /^{.+}$/),
                    AtomicLong: x => this._checkJvoClass(x, /AtomicLong/),
                };
            },
        });
    },
    Object: () => {
        if (!Object["values"]) {
            Object.prototype.values = function (o) {
                if (o !== Object(o))
                    throw new TypeError("Object.values called on a non-object");
                let key;
                let value = [];
                for (key in o) {
                    if (o.hasOwnProperty(key)) {
                        value.push(o[key]);
                    }
                }
                return value;
            }
        }
    },
};

module.exports = {
    load: function () {
        let _args_len = arguments.length;
        let _keys = [];

        if (!_args_len) {
            _keys = Object.keys(ext);
        } else {
            for (let i = 0; i < _args_len; i += 1) {
                _keys.push(arguments[i]);
            }
        }

        let _keys_len = _keys.length;
        let _toTitleCase = str => {
            let _head = str[0].toUpperCase();
            let _body = str.slice(1).toLowerCase();
            return _head + _body;
        };

        for (let i = 0; i < _keys_len; i += 1) {
            let _key = _toTitleCase(_keys[i]);
            if (_key in ext) ext[_key]();
        }
    },
};