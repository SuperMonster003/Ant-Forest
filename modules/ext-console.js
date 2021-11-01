let {
    isPlainObject, $$toast,
} = require('./mod-global');

let exp = {
    /** @constructor */
    StateManager: function StateManager$iiFe() {
        /**
         * @constructor
         * @param {boolean} [init_state]
         */
        let StateManager = function (init_state) {
            this.state = init_state;
            this.last_state = init_state;
        };

        StateManager.prototype = {
            switchOn() {
                this.last_state = this.state;
                this.state = true;
            },
            switchOff() {
                this.last_state = this.state;
                this.state = false;
            },
            switchGet() {
                return this.state;
            },
            switchSet(state) {
                this.last_state = this.state;
                this.state = isPlainObject(state) ? state.is_debug : state;
            },
            switchBack() {
                // [this.state, this.last_state] = [this.last_state, this.state];
                // code above will cause java.lang.ClassCastException
                // on '/tools/ant-forest-deployment-tool.min.js'
                let _tmp = this.state;
                this.state = this.last_state;
                this.last_state = _tmp;
            },
            enable() {
                this.switchOn();
            },
            disable() {
                this.switchOff();
            },
            isEnabled() {
                return this.switchGet() === true;
            },
        };

        return StateManager;
    }(),
    DebugConstructor(init_state, depot) {
        let _debug = function (msg, msg_lv, indent_lv, border_line_lv) {
            let $ = {
                parseMsgLevel() {
                    this.message_level = msg_lv === undefined ? 0 : msg_lv;
                    this.is_high_level = msg_lv === 3 || msg_lv === 'w' || msg_lv === 'warn'
                        || msg_lv === 4 || msg_lv === 'e' || msg_lv === 'error'
                        || msg_lv === 8 || msg_lv === 'x' || msg_lv === 9 || msg_lv === 'r';
                },
                trigger() {
                    return _debug.switchGet();
                },
                print() {
                    exp.print(msg, this.message_level, 0, indent_lv, border_line_lv, {
                        msg_prefix: '\xbb', // '»'
                        indent_symbol: '- ',
                        indent_repeat: 'whole',
                        indent_trailing_space: false,
                    });
                },
                getResult() {
                    if (this.trigger()) {
                        this.parseMsgLevel();
                        this.print();
                    }
                    return !this.is_high_level;
                },
            };
            return $.getResult();
        };

        exp.StateManager.call(_debug, init_state);

        Object.assign(_debug, exp.StateManager.prototype, {
            // @Override
            switchGet() {
                let _self_sw = _debug.state;
                if (typeof _self_sw === 'boolean') {
                    return _self_sw;
                }
                if (typeof _debug.depot !== 'undefined') {
                    let _depot_sw = _debug.depot.state;
                    if (typeof _depot_sw === 'boolean') {
                        return _depot_sw;
                    }
                }
                if (typeof exp.debug.state === 'boolean') {
                    return exp.debug.state;
                }
                if (typeof global.consolex === 'object') {
                    return global.consolex.debug.state;
                }
            },
        });

        Object.assign(_debug, {
            depot: depot,
            /**
             * @param {Consolex.Print.IsDebug} [petrol]
             * @return {function(msg: Consolex.Print.Message, msg_lv?: Consolex.Print.MessageLevel, indent_lv?: Consolex.Print.IndentLevel, border_line_lv?: Consolex.Print.BorderLevel)}
             */
            fuel(petrol) {
                let _pet = isPlainObject(petrol) ? petrol.is_debug : petrol;
                return new exp.DebugConstructor(_pet, _debug);
            },
            /**
             * Print a border line in console (33 bytes) for debugging.
             * Restricted by functionality of consolex.debug().
             * @param {'solid'|'dash'|any} [style='solid']
             * @param {number} [border_lv=0]
             * @param {number} [break_lv=0]
             * @see consolex.print.border
             */
            border(style, border_lv, break_lv) {
                if (_debug.isEnabled()) {
                    exp.border(style, border_lv === undefined ? 0 : border_lv, break_lv);
                }
            },
            /**
             * Alias for consolex.debug.border()
             * @param {'solid'|'dash'|any} [style='solid']
             * @param {number} [border_lv=1]
             * @param {number} [break_lv=0]
             * @see consolex.debug.border
             */
            __(style, border_lv, break_lv) {
                this.border.apply(this, arguments);
            },
        });

        return _debug;
    },
    /**
     * @param {Consolex.GlobalLogConfig} config
     * @see console.setGlobalLogConfig
     */
    setGlobalLogConfig(config) {
        if (context.getPackageName().match(/Pro\b/i)) {
            delete config.filePattern;
        }
        console.setGlobalLogConfig(config);
    },
    /**
     * Alias for consolex.border()
     * @param {'solid'|'dash'|any} [style='solid']
     * @param {number} [border_lv=1]
     * @param {number} [break_lv=0]
     * @see consolex.border
     */
    printBorder(style, border_lv, break_lv) {
        this.border.apply(this, arguments);
    },
    /**
     * Alias for consolex.debug.border()
     * @param {'solid'|'dash'|any} [style='solid']
     * @param {number} [border_lv=0]
     * @param {number} [break_lv=0]
     * @see consolex.debug.border
     */
    debugBorder(style, border_lv, break_lv) {
        this.debug.border.apply(this, arguments);
    },
    $print() {
        let _ = {
            last_border: {
                save(style, level) {
                    this.style = style;
                    this.level = level;
                },
                clear() {
                    delete this.style;
                    delete this.level;
                },
                match(style, level) {
                    return style
                        && style === this.style
                        && level === this.level;
                },
            },
        };

        /**
         * Print and toast message(s) in console with indent(s) and border(s)
         * @param {Consolex.Print.Message} msg
         * @param {Consolex.Print.MessageLevel} [msg_lv=1] - message level
         * @param {Consolex.Print.ToastLevel} [toast_lv=0]
         * @param {Consolex.Print.IndentLevel} [indent_lv=0]
         * @param {Consolex.Print.BorderLevel} [border_line_lv=0]
         * @param {Object} [options]
         * @param {'->'|' -'|string} [options.indent_symbol='->']
         * @param {'whole'|'last'|'first'} [options.indent_repeat='first']
         * @param {boolean} [options.indent_trailing_space=true]
         * @param {string} [options.msg_prefix='']
         * @param {string} [options.border_prefix='']
         * @example
         * consolex.print('hello', 0, 0, 0, -2);
         * consolex.print([
         *     '1. open the refrigerator door',
         *     '2. put the elephant in',
         *     '3. shut the door',
         * ], 3, 4, 1, 2);
         * consolex.print('to be continued...', 4, 2, 0, '2n');
         * @return {Consolex.Print.Result}
         **/
        this.$ = this.print = function (msg, msg_lv, toast_lv, indent_lv, border_line_lv, options) {
            // @Overload
            if (msg instanceof Error) {
                return this.print(msg.message + '\n\n' + msg.stack.replace(/\s+.+?\n/g, '->$&'),
                    msg_lv, toast_lv, indent_lv, border_line_lv, options);
            }
            let $ = {
                trigger() {
                    return exp.print.isEnabled();
                },
                parseBorder() {
                    let _lv_num = Number(border_line_lv) || 0;
                    let _lv_str = String(border_line_lv === undefined ? '' : border_line_lv);
                    let _mch_break = _lv_str.match(/[_\d]n(\d*)$/);

                    if (_mch_break !== null) {
                        this.border_line_break = Number(_mch_break[1] || 1);
                    } else {
                        this.border_line_break = 0;
                    }

                    if (_lv_str.match(/dash\/|-0\.5/) || _lv_num === -0.5) {
                        this.border_line_before = 'dash';
                    } else if (_lv_str.match(/^(\/?dash|0\.5)(_?n\d*)?$/) || _lv_num === 0.5) {
                        this.border_line_after = 'dash';
                    } else if (_lv_str.match(/solid\/|-1/) || _lv_num === -1) {
                        this.border_line_before = 'solid';
                    } else if (_lv_str.match(/^(\/?solid|1)(_?n\d*)?$/) || _lv_num === 1) {
                        this.border_line_after = 'solid';
                    } else if (_lv_str.match(/^(solid\/dash|-1\.5)(_?n\d*)?$/) || _lv_num === -1.5) {
                        this.border_line_before = 'solid';
                        this.border_line_after = 'dash';
                    } else if (_lv_str.match(/^(dash\/solid|1\.5)(_?n\d*)?$/) || _lv_num === 1.5) {
                        this.border_line_before = 'dash';
                        this.border_line_after = 'solid';
                    } else if (_lv_str.match(/^(dashes|dash\/dash|-2)(_?n\d*)?$/) || _lv_num === -2) {
                        this.border_line_before = 'dash';
                        this.border_line_after = 'dash';
                    } else if (_lv_str.match(/^(solids|solid\/solid|2)(_?n\d*)?$/) || _lv_num === 2) {
                        this.border_line_before = 'solid';
                        this.border_line_after = 'solid';
                    }
                },
                parseMsgLevel() {
                    switch (msg_lv) {
                        case null :
                            this.no_msg_level = true;
                            break;
                        case 0:
                        case 'v':
                        case 'verbose':
                            this.fn = console.verbose.bind(console);
                            break;
                        case void 0:
                        case 1:
                        case 'l':
                        case 'd':
                        case 'log':
                            this.fn = console.log.bind(console);
                            break;
                        case 2:
                        case 'i':
                        case 'info':
                            this.fn = console.info.bind(console);
                            break;
                        case 3:
                        case 'w':
                        case 'warn':
                            this.fn = console.warn.bind(console);
                            this.is_high_level = true;
                            break;
                        case 4:
                        case 'e':
                        case 'error':
                            this.fn = console.error.bind(console);
                            this.is_high_level = true;
                            break;
                        case 8:
                        case 'x':
                            this.fn = console.error.bind(console);
                            this.should_exit = true;
                            this.is_high_level = true;
                            break;
                        case 9:
                        case 'r':
                            this.fn = console.error.bind(console);
                            this.show_ex_msg = true;
                            this.should_exit = true;
                            this.is_high_level = true;
                            break;
                        default:
                            throw Error('Invalid message level for consolex.print(): ' + msg_lv);
                    }
                },
                parseIndent() {
                    this.indent = {
                        lv: Math.min(Number(indent_lv) || 0, 10),
                        trigger() {
                            return this.lv > 0 && !$.no_msg_level;
                        },
                        getIndent() {
                            let _sym = $.options.indent_symbol || '->';
                            let _rpt = $.options.indent_repeat || 'first';
                            let _tsp = $.options.indent_trailing_space === undefined
                            || Boolean($.options.indent_trailing_space) ? '\x20' : '';
                            switch (_rpt) {
                                case 'first':
                                    return _sym.slice(0, 1).repeat(this.lv) + _sym.slice(1) + _tsp;
                                case 'last':
                                    return _sym.slice(0, -1) + _sym.slice(-1).repeat(this.lv) + _tsp;
                                default:
                                    return _sym.repeat(this.lv) + _tsp;
                            }
                        },
                        getResult() {
                            return this.trigger() ? this.getIndent() : '';
                        },
                    }.getResult();
                },
                /**
                 * @param {Array|Object|any} o
                 * @return {string}
                 */
                stringify(o) {
                    if (Array.isArray(o)) {
                        return o.join(', ').surround('[ ');
                    }
                    if (isPlainObject(o)) {
                        return Object.keys(o).map(k => k + ':\x20' + o[k]).join(', ').surround('{ ');
                    }
                    if (o && typeof o.toString === 'function') {
                        return o.toString();
                    }
                    return o === undefined ? String() : String(o);
                },
                parseArgs() {
                    this.options = options || {};
                    this.parseBorder();
                    this.parseMsgLevel();
                    this.parseIndent();
                    this.msg_body = Array.isArray(msg)
                        ? msg.map(this.stringify.bind(this)) : this.stringify(msg);
                    this.prefix = this.options.msg_prefix === undefined
                        ? '' : String(this.options.msg_prefix || '') + '\x20';
                },
                toastIFN() {
                    let _fn = typeof $$toast === 'function' ? $$toast : toast;
                    let _msg = Array.isArray(this.msg_body) ? this.msg_body.join('\n') : this.msg_body;
                    switch (toast_lv) {
                        case 2:
                        case 'l':
                        case 'long':
                            return _fn(_msg, 'l');
                        case 3:
                        case 's/f':
                        case 'short/forcible':
                            return _fn(_msg, 's', 'f');
                        case 4:
                        case 'l/f':
                        case 'long/forcible':
                            return _fn(_msg, 'l', 'f');
                    }
                    toast_lv && _fn(_msg, 'S');
                },
                showBorderIFN() {
                    let {
                        border_line_before: _style_before,
                        border_line_after: _style_after,
                        border_line_break: _break,
                    } = this;
                    let {border_prefix: _prefix} = this.options;
                    let _border_lv = (msg_lv === undefined ? 1 : Number(msg_lv) || 0).clamp(0, 1);
                    let _border_it = [() => {
                        if (_style_before !== undefined && !this.no_msg_level) {
                            if (!_.last_border.match(_style_before, _border_lv)) {
                                exp.print.border(_style_before, _border_lv, 0, false, _prefix);
                            }
                        }
                    }, () => {
                        if (_style_after !== undefined && !this.no_msg_level) {
                            exp.print.border(_style_after, _border_lv, _break, true, _prefix);
                            _break && _.last_border.clear();
                        }
                    }][Symbol.iterator]();

                    return (this.showBorderIFN = () => _border_it.next().value())();
                },
                showMessageIFN() {
                    if (!this.no_msg_level) {
                        _.last_border.clear();
                        Array.isArray(this.msg_body)
                            ? this.msg_body.forEach(this.showMsg.bind(this))
                            : this.showMsg(this.msg_body);
                    }
                },
                showMsg(msg_body) {
                    this.fn(this.prefix + this.indent + msg_body);
                },
                getResult() {
                    if (this.trigger()) {
                        this.parseArgs();
                        this.toastIFN();
                        this.showBorderIFN();
                        this.showMessageIFN();
                        this.showBorderIFN();
                        this.show_ex_msg && exp.print('Forcibly stopped', 4, 1);
                        this.should_exit && exit();
                    }
                    return !this.is_high_level;
                },
            };

            return $.getResult();
        };

        Object.assign(this.print, new this.StateManager(true), this.StateManager.prototype, {
            /**
             * Print a border line in console (33 bytes)
             * @param {'solid'|'dash'|any} [style='solid']
             * @param {number} [border_lv=1]
             * @param {number} [break_lv=0]
             * @param {boolean} [is_save_state=false]
             * @param {string} [prefix]
             * @example
             * consolex.border(); // solid
             * consolex.border('solid', 0); // solid and verbose
             * consolex.border('dash'); // dash
             * consolex.border('dash', 1, 1); // dash with '\n' ×1
             */
            border(style, border_lv, break_lv, is_save_state, prefix) {
                let $ = {
                    style: String(style || 'solid'),
                    level: (border_lv === undefined ? 1 : Number(border_lv) || 0).clamp(0, 1),
                    break: '\n'.repeat(Math.max(Number(break_lv) || 0, 0)),
                    prefix: prefix === undefined ? '' : String(prefix) + '\x20',
                    trigger() {
                        return exp.print.isEnabled()
                            && !_.last_border.match(this.style, this.level);
                    },
                    saveStateIFN() {
                        if (is_save_state && !this.break) {
                            _.last_border.save(this.style, this.level);
                        }
                    },
                    printIFN() {
                        let _border = this.style.match(/dash/)
                            ? this.prefix + '- '.repeat(17).trim()
                            : this.prefix + '-'.repeat(33);
                        this.level
                            ? console.log(_border + this.break)
                            : console.verbose(_border + this.break);
                    },
                };

                if ($.trigger()) {
                    $.saveStateIFN();
                    $.printIFN();
                }
            },
        });

        /**
         * Print a border line in console (33 bytes).
         * Restricted by functionality of consolex.print().
         * @param {'solid'|'dash'|any} [style='solid']
         * @param {number} [border_lv=1]
         * @param {number} [break_lv=0]
         * @see consolex.print.border
         */
        this.__ = this.border = function (style, border_lv, break_lv) {
            this.print.border(style, border_lv, break_lv, true);
        };

        /**
         * @param {Consolex.Print.Message} msg
         * @param {Consolex.Print.ToastLevel} [toast_lv=0]
         * @param {Consolex.Print.IndentLevel} [indent_lv=0]
         * @param {Consolex.Print.BorderLevel} [border_line_lv=0]
         * @return {Consolex.Print.Result}
         */
        this.v = this.verbose = (msg, toast_lv, indent_lv, border_line_lv) => {
            return this.$(msg, 0, toast_lv, indent_lv, border_line_lv);
        };
        /**
         * @param {Consolex.Print.Message} msg
         * @param {Consolex.Print.ToastLevel} [toast_lv=0]
         * @param {Consolex.Print.IndentLevel} [indent_lv=0]
         * @param {Consolex.Print.BorderLevel} [border_line_lv=0]
         * @return {Consolex.Print.Result}
         */
        this.d = this.log = (msg, toast_lv, indent_lv, border_line_lv) => {
            return this.$(msg, 1, toast_lv, indent_lv, border_line_lv);
        };
        /**
         * @param {Consolex.Print.Message} msg
         * @param {Consolex.Print.ToastLevel} [toast_lv=0]
         * @param {Consolex.Print.IndentLevel} [indent_lv=0]
         * @param {Consolex.Print.BorderLevel} [border_line_lv=0]
         * @return {Consolex.Print.Result}
         */
        this.i = this.info = (msg, toast_lv, indent_lv, border_line_lv) => {
            return this.$(msg, 2, toast_lv, indent_lv, border_line_lv);
        };
        /**
         * @param {Consolex.Print.Message} msg
         * @param {Consolex.Print.ToastLevel} [toast_lv=0]
         * @param {Consolex.Print.IndentLevel} [indent_lv=0]
         * @param {Consolex.Print.BorderLevel} [border_line_lv=0]
         * @return {Consolex.Print.Result}
         */
        this.w = this.warn = (msg, toast_lv, indent_lv, border_line_lv) => {
            return this.$(msg, 3, toast_lv, indent_lv, border_line_lv);
        };
        /**
         * @param {Consolex.Print.Message} msg
         * @param {Consolex.Print.ToastLevel} [toast_lv=0]
         * @param {Consolex.Print.IndentLevel} [indent_lv=0]
         * @param {Consolex.Print.BorderLevel} [border_line_lv=0]
         * @return {Consolex.Print.Result}
         */
        this.e = this.error = (msg, toast_lv, indent_lv, border_line_lv) => {
            return this.$(msg, 4, toast_lv, indent_lv, border_line_lv);
        };

        delete this.$print;
        return this;
    },
    $debug() {
        /**
         * Print a message in console for debugging
         * @param {Consolex.Print.Message} msg - message will be formatted with prefix '»\x20'
         * @param {Consolex.Print.MessageLevel} [msg_lv=1] - message level
         * @param {Consolex.Print.IndentLevel} [indent_lv=0] - indent ('- ') before message
         * @param {Consolex.Print.BorderLevel} [border_line_lv=0] - border line(s) with prefix '»\x20'
         * @return {Consolex.Print.Result}
         */
        this._ = this.debug = new this.DebugConstructor(undefined);

        delete this.$debug;
        return this;
    },
    $bind() {
        this.$print().$debug();
        delete this.$bind;
        return this;
    },
};

exp.$bind();

module.exports = {consolex: exp};