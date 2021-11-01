let {isNullish} = require('./mod-global');
let {threadsx} = require('./ext-threads');

let is_pro = context.getPackageName().match(/Pro\b/i);
let timing = is_pro ? com.stardust.autojs.core['timing'] : org.autojs.autojs.timing;
let TimedTask = is_pro ? timing.TimedTask['Companion'] : timing.TimedTask;
let TimedTaskManager = timing.TimedTaskManager;
let TimedTaskMgr = is_pro ? TimedTaskManager['Companion'].getInstance() : TimedTaskManager.getInstance();
let bridges = global.require('__bridges__');
let days_ident = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
    '一', '二', '三', '四', '五', '六', '日',
    1, 2, 3, 4, 5, 6, 0,
    1, 2, 3, 4, 5, 6, 7,
].map(x => typeof x === 'string' ? x : x.toString());

let exp = {
    /**
     * @param {TimedTask$|IntentTask$} task
     * @param {Timersx.TimedTask.Extension} [options]
     * @return {TimedTask$|null|*}
     */
    _taskFulfilled(task, options) {
        if (!task) {
            return null;
        }
        let _o = options || {};
        let _cond = typeof _o.condition === 'function' ? _o.condition : () => task.id > 0;
        let _cbk = typeof _o.callback === 'function' ? _o.callback : null;
        let _timeout = 3e3;
        let _itv = 120;
        let _run = () => {
            while (_timeout > 0) {
                if (_cond()) {
                    return _cbk ? _cbk(task) : task;
                }
                sleep(_itv);
                _timeout -= _itv;
            }
            return null;
        };
        if (!_o.is_async) {
            return _run();
        }
        threadsx.start(_run);
    },
    /**
     * @param {TimedTask$|IntentTask$|null} task
     * @return {TimedTask$|IntentTask$|null}
     */
    addTask(task) {
        if (task) {
            if (is_pro) {
                TimedTaskMgr['addTaskSync'](task);
            } else {
                TimedTaskMgr.addTask(task);
            }
        }
        return task || null;
    },
    /**
     * @param {Timersx.TimedTask.Daily} options
     * @example
     * timersx.addDailyTask({
     *     time: Date.now() + 3.6e6,
     *     path: files.path('./test.js'),
     * });
     * @return {?TimedTask$}
     */
    addDailyTask(options) {
        let _opt = options || {};
        let _date_time = parseDateTime('LocalTime', _opt.time || Date.now());
        let _path = files.path(_opt.path);
        let _cfg = parseConfig(_opt);
        let _task = this.addTask(TimedTask.dailyTask(_date_time, _path, _cfg));
        return this._taskFulfilled(_task, _opt);
    },
    /**
     * @param {Timersx.TimedTask.Weekly} options
     * @example
     * timersx.addWeeklyTask({
     *     time: Date.now() + 3.6e6,
     *     path: files.path('./test.js'),
     *     daysOfWeek: [1, 3, 6, 7],
     * });
     * @return {?TimedTask$}
     */
    addWeeklyTask(options) {
        let _opt = options || {};
        let _time_flag = 0;
        for (let i = 0; i < _opt.daysOfWeek.length; i++) {
            let day_str = _opt.daysOfWeek[i].toString();
            let day_idx = days_ident.indexOf(day_str.toLowerCase()) % 7;
            if (day_idx < 0) {
                throw Error('unknown day: ' + day_str);
            }
            _time_flag |= TimedTask.getDayOfWeekTimeFlag(day_idx + 1);
        }
        let _date_time = parseDateTime('LocalTime', _opt.time || Date.now());
        let _flag_num = Number(new java.lang.Long(_time_flag));
        let _path = files.path(_opt.path);
        let _cfg = parseConfig(_opt);
        let _task = this.addTask(TimedTask.weeklyTask(_date_time, _flag_num, _path, _cfg));
        return this._taskFulfilled(_task, _opt);
    },
    /**
     * @param {Timersx.TimedTask.Disposable} options
     * @example
     * timersx.addDisposableTask({
     *     path: engines.myEngine().source,
     *     date: Date.now() + 3.6e6,
     * });
     * @return {?TimedTask$}
     */
    addDisposableTask(options) {
        let _opt = options || {};
        let _date_time = parseDateTime('LocalDateTime', _opt.date || Date.now());
        let _path = files.path(_opt.path);
        let _cfg = parseConfig(_opt);
        let _task = this.addTask(TimedTask.disposableTask(_date_time, _path, _cfg)) || null;
        return this._taskFulfilled(_task, _opt);
    },
    /**
     * @param {{path:string,action?:string}&Timersx.TimedTask.Extension} options
     * @example
     * timersx.addIntentTask({
     *     path: files.path('./test.js'),
     *     action: 'android.intent.action.BATTERY_CHANGED',
     * });
     * @return {?IntentTask$}
     */
    addIntentTask(options) {
        let _opt = options || {};
        let _task = this.addTask((function $iiFe() {
            let _i_task = new timing.IntentTask();
            _i_task.setScriptPath(files.path(_opt.path));
            _opt.action && _i_task.setAction(_opt.action);
            return _i_task;
        })()) || null;
        return this._taskFulfilled(_task, _opt);
    },
    /**
     * @param {number} id
     * @return {TimedTask$}
     */
    getTimedTask(id) {
        return TimedTaskMgr.getTimedTask(id);
    },
    /**
     * @param {number} id
     * @return {IntentTask$}
     */
    getIntentTask(id) {
        return TimedTaskMgr.getIntentTask(id);
    },
    /**
     * @param {TimedTask$|IntentTask$|null} task
     * @return {TimedTask$|IntentTask$}
     */
    removeTask(task) {
        if (!task) {
            return null;
        }
        if (is_pro) {
            TimedTaskMgr['removeTaskSync'](task);
        } else {
            TimedTaskMgr.removeTask(task);
        }
        return task;
    },
    /**
     * @param {number} id
     * @param {Timersx.TimedTask.Extension} [options]
     * @return {?TimedTask$}
     */
    removeIntentTask(id, options) {
        let _opt = options || {};
        let _task = this.removeTask(this.getIntentTask(id));
        return this._taskFulfilled(_task, Object.assign(_opt, {
            condition: () => !this.getIntentTask(id),
        }));
    },
    /**
     * @param {number} id
     * @param {Timersx.TimedTask.Extension} [options]
     * @return {?TimedTask$}
     */
    removeTimedTask(id, options) {
        let _opt = options || {};
        let _task = this.removeTask(this.getTimedTask(id));
        return this._taskFulfilled(_task, Object.assign(_opt, {
            condition: () => !this.getTimedTask(id),
        }));
    },
    /**
     * @param {TimedTask$|null} task
     * @return {TimedTask$|null}
     */
    updateTask(task) {
        if (!task) {
            return null;
        }
        task.setScheduled(false);
        TimedTaskMgr.updateTask(task);
        return task;
    },
    /**
     * @param {{path?:string}} [options]
     * @return {TimedTask$[]}
     */
    queryTimedTasks(options) {
        let _opt = options || {};
        let _sql = '';
        let _args = [];
        let _append = str => _sql += _sql.length ? '\x20AND\x20' + str : str;
        let _path = _opt.path;
        if (_path) {
            _append('script_path = ?');
            _args.push(_path);
        }
        if (is_pro) {
            let _tasks = TimedTaskMgr.queryTimedTasks.call(TimedTaskMgr, _sql || null, _args);
            return bridges.toArray(_tasks);
        }
        let _list = TimedTaskMgr.getAllTasksAsList().toArray();
        return _path ? _list.filter(task => task.getScriptPath() === _path) : _list;
    },
    /**
     * @param {{path?:string,action?:string}} [options]
     * @return {IntentTask$[]}
     */
    queryIntentTasks(options) {
        let _opt = options || {};
        let _sql = '';
        let _args = [];
        let _append = str => _sql += _sql.length ? '\x20AND\x20' + str : str;
        let {path: _path, action: _act} = _opt;
        if (_path) {
            _append('script_path = ?');
            _args.push(_path);
        }
        if (_act) {
            _append('action = ?');
            _args.push(_act);
        }
        if (is_pro) {
            let _tasks = TimedTaskMgr.queryIntentTasks.call(TimedTaskMgr, _sql || null, _args);
            return bridges.toArray(_tasks);
        }
        let _list = TimedTaskMgr.getAllIntentTasksAsList().toArray();
        return _path || _act ? _list.filter(task => (
            !(_path && task.getScriptPath() !== _path || _act && task.getAction() !== _act)
        )) : _list;
    },
    /**
     * Conversion between time flag and numbers
     * @param src {number|number[]} -- number(s) from 0 to 127
     * @example
     * // [0,1,2,4,5] -- Sun, Mon, Tue, Thu, Fri
     * timersx.timeFlagConverter(55);
     * // 23 -- time flag; Sun, Mon, Tue, Thu
     * timersx.timeFlagConverter([0, 1, 2, 4]);
     * // [0,1,2,3,4,5,6] -- everyday
     * timersx.timeFlagConverter(127);
     * // 127 -- time flag; everyday
     * timersx.timeFlagConverter([0,1,2,3,4,5,6]);
     * // [] -- disposable
     * timersx.timeFlagConverter(0);
     * @return {number|number[]}
     */
    timeFlagConverter(src) {
        if (Array.isArray(src)) {
            return Array(7).fill(0).reduce((a, b, i) => {
                return a + (src.includes(i) ? Math.pow(2, i) : 0);
            }, 0);
        }
        let _res = [];
        let _str = Number(src).toString(2);
        let _num = _str.length - 1;
        for (let i of _str) {
            i > 0 && _res.unshift(_num);
            _num -= 1;
        }
        return _res;
    },
    /**
     * Replacement of setInterval() with functional timeout supported
     * @param {function} func
     * @param {number} [interval=200]
     * @param {number|function():boolean} [timeout=Infinity]
     * @param {function} [callback]
     * @example
     * // print 'hello' every 1 second for 5 (or 4 sometimes) times
     * timersx.setInterval(() => console.log('hello'), 1e3, 5e3);
     * @example
     * timersx.setInterval(() => log('Good luck comes later...'), 100, () => {
     *     let num = Math.random() * 100 + 1;
     *     return num > 90 && Math.floor(num);
     * }, res => log('Your lucky number is\x20' + res));
     * @see https://dev.to/akanksha_9560/why-not-to-use-setinterval--2na9
     */
    setInterval(func, interval, timeout, callback) {
        let $ = {
            init_ts: Date.now(),
            interval: interval > 0 ? interval : 200,
            timeout: timeout > 0 ? timeout : Infinity,
            isTimedOut() {
                if (typeof this._isTimedOut !== 'function') {
                    this._isTimedOut = typeof timeout === 'function'
                        ? timeout.bind(this)
                        : () => Date.now() - this.init_ts > this.timeout;
                }
                this.timeout_result = this._isTimedOut();
                return this.timeout_result !== false && !isNullish(this.timeout_result);
            },
            relayIFN() {
                if (!this.isTimedOut()) {
                    this.setTimeout();
                } else if (typeof callback === 'function') {
                    callback.call(this, this.timeout_result);
                }
            },
            run() {
                func();
                this.relayIFN();
            },
            setTimeout() {
                setTimeout(this.run.bind(this), this.interval);
            },
        };
        $.setTimeout();
    },
    $rec() {
        let _ = {
            keys: {},
            anonymity: [],
            ts(ts) {
                return typeof ts === 'number' ? ts : Date.now();
            },
            has(key) {
                return key in this.keys;
            },
            add(key, ts) {
                key === undefined
                    ? this.anonymity.push(this.ts(ts))
                    : this.keys[key] = this.ts(ts);
                return this.ts(ts);
            },
            get(key) {
                return key === undefined ? this.anonymity.pop() : this.keys[key];
            },
            save(key, ts) {
                return this.add(key, ts);
            },
            load(key, ts) {
                return this.ts(ts) - this.get(key);
            },
            shortcut(key, ts) {
                if (typeof key === 'function') {
                    this.save();
                    key.call(ts);
                    return this.load();
                }
                return typeof key !== 'undefined'
                    ? this.has(key) ? this.load(key, ts) : this.save(key, ts)
                    : this.anonymity.length ? this.load() : this.save();
            },
        };

        /**
         * Record or get the record for a time gap
         * @param {string|function} [key]
         * @param {number|ThisType<any>} [ts]
         * @return {number|void} - timestamp
         */
        this.rec = function (key, ts) {
            return _.shortcut(key, ts);
        };
        /**
         * @param {string} [key]
         * @param {number} [ts=Date.now()]
         */
        this.rec.save = (key, ts) => _.save(key, ts);
        /**
         * @param {string} [key]
         * @param {number} [ts=Date.now()]
         * @return {number}
         */
        this.rec.load = (key, ts) => _.load(key, ts);
        this.rec.lt = (key, compare) => this.rec.load(key) < compare;
        this.rec.gt = (key, compare) => this.rec.load(key) > compare;
        this.rec.clear = () => {
            _.keys = {};
            _.anonymity.splice(0);
        };

        delete this.$rec;
        return this;
    },
    $bind() {
        this.$rec();

        delete this.$bind;
        return this;
    },
};

exp.$bind();

module.exports = {timersx: exp};

// tool function(s) //

/**
 * @param {Object} c
 * @param {number} [c.delay=0]
 * @param {number} [c.interval=0]
 * @param {number} [c.loopTimes=1]
 * @return {com.stardust.autojs.execution.ExecutionConfig}
 */
function parseConfig(c) {
    let _ec = new com.stardust.autojs.execution.ExecutionConfig();
    _ec.delay = c.delay || 0;
    _ec.interval = c.interval || 0;
    _ec.loopTimes = (c.loopTimes === undefined) ? 1 : c.loopTimes;
    return _ec;
}

/**
 * @param {'LocalTime'|'LocalDateTime'|string} clazz
 * @param {string|Date|number} date_time
 * @return {org.joda.time.DateTime|org.joda.time.LocalDateTime|*}
 */
function parseDateTime(clazz, date_time) {
    let _clz = is_pro ? clazz : org.joda.time[clazz];
    let _dt = date_time;
    let _dts = () => _dt.getTime();
    if (typeof date_time === 'string') {
        return is_pro ? TimedTask.parseDateTime.call(TimedTask, _clz, _dt) : _clz.parse(_dt);
    }
    if (date_time instanceof Date) {
        return is_pro ? TimedTask.parseDateTime.call(TimedTask, _clz, _dts()) : new _clz(_dts());
    }
    if (typeof date_time === 'number') {
        return is_pro ? TimedTask.parseDateTime.call(TimedTask, _clz, _dt) : new _clz(_dt);
    }
    throw new Error('Cannot parse date time: ' + date_time);
}