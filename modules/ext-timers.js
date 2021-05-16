// better compatibility for both free and some Pro versions of Auto.js

global.timersx = typeof global.timersx === 'object' ? global.timersx : {};

require('./mod-monster-func').load('waitForAction');

let is_pro = context.packageName.match(/[Pp]ro/);
let timing = is_pro ? com.stardust.autojs.core.timing : org.autojs.autojs.timing;
let TimedTask = is_pro ? timing.TimedTask.Companion : timing.TimedTask;
let TimedTaskManager = timing.TimedTaskManager;
let TimedTaskMgr = is_pro ? TimedTaskManager.Companion.getInstance() : TimedTaskManager.getInstance();
let bridges = require.call(global, '__bridges__');
let days_ident = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
    '一', '二', '三', '四', '五', '六', '日',
    1, 2, 3, 4, 5, 6, 0,
    1, 2, 3, 4, 5, 6, 7,
].map(value => value.toString());

let ext = {
    /**
     * @param {{
     *     path: string, time: string|Date|number,
     *     delay?: number, interval?: number, loopTimes?: number,
     * }} options
     * @param {boolean|'wait'} [wait_fg=false]
     * @example
     * timersx.addDailyTask({
     *     time: Date.now() + 3.6e6,
     *     path: files.path('./test.js'),
     * });
     * @returns {org.autojs.autojs.timing.TimedTask|null}
     */
    addDailyTask(options, wait_fg) {
        let _opt = options || {};
        let _date_time = parseDateTime('LocalTime', _opt.time);
        let _path = files.path(_opt.path);
        let _cfg = parseConfig(_opt);
        let _task = addTask(TimedTask.dailyTask(_date_time, _path, _cfg));
        return _task && (!wait_fg || waitForAction(() => _task.id !== 0, 3e3, 120)) ? _task : null;
    },
    /**
     * @param {{
     *     path: string, time: string|Date|number,
     *     daysOfWeek: (string|number)[],
     *     delay?: number, interval?: number, loopTimes?: number,
     * }} options
     * @param {boolean|'wait'} [wait_fg=false]
     * @example
     * timersx.addWeeklyTask({
     *     time: Date.now() + 3.6e6,
     *     path: files.path('./test.js'),
     *     daysOfWeek: [1, 3, 6, 7],
     * });
     * @returns {org.autojs.autojs.timing.TimedTask|null}
     */
    addWeeklyTask(options, wait_fg) {
        let _opt = options || {};
        let _time_flag = 0;
        for (let i = 0; i < _opt.daysOfWeek.length; i++) {
            let day_str = _opt.daysOfWeek[i].toString();
            let day_idx = days_ident.indexOf(day_str.toLowerCase()) % 7;
            if (!~day_idx) {
                throw Error('unknown day: ' + day_str);
            }
            _time_flag |= TimedTask.getDayOfWeekTimeFlag(day_idx + 1);
        }
        let _date_time = parseDateTime('LocalTime', _opt.time);
        let _flag_num = Number(new java.lang.Long(_time_flag));
        let _path = files.path(_opt.path);
        let _cfg = parseConfig(_opt);
        let _task = addTask(TimedTask.weeklyTask(_date_time, _flag_num, _path, _cfg));
        return _task && (!wait_fg || waitForAction(() => _task.id !== 0, 3e3, 120)) ? _task : null;
    },
    /**
     * @param {{
     *     path: string, date: string|Date|number,
     *     delay?: number, interval?: number, loopTimes?: number,
     * }} options
     * @param {boolean|'wait'} [wait_fg=false]
     * @example
     * timersx.addDisposableTask({
     *     path: engines.myEngine().source,
     *     date: Date.now() + 3.6e6,
     * });
     * @returns {org.autojs.autojs.timing.TimedTask|null}
     */
    addDisposableTask(options, wait_fg) {
        let _opt = options || {};
        let _date_time = parseDateTime('LocalDateTime', _opt.date);
        let _path = files.path(_opt.path);
        let _cfg = parseConfig(_opt);
        let _task = addTask(TimedTask.disposableTask(_date_time, _path, _cfg)) || null;
        return _task && (!wait_fg || waitForAction(() => _task.id !== 0, 3e3, 120)) ? _task : null;
    },
    /**
     * @param {{path:string,action?:string}} options
     * @param {boolean|'wait'} [wait_fg=false]
     * @example
     * timersx.addIntentTask({
     *     path: files.path('./test.js'),
     *     action: 'android.intent.action.BATTERY_CHANGED',
     * });
     * @returns {org.autojs.autojs.timing.TimedTask|null}
     */
    addIntentTask(options, wait_fg) {
        let _opt = options || {};
        let _task = addTask((() => {
            let _i_task = new timing.IntentTask();
            _i_task.setScriptPath(files.path(_opt.path));
            _opt.action && _i_task.setAction(_opt.action);
            return _i_task;
        })()) || null;
        return _task && (!wait_fg || waitForAction(() => _task.id !== 0, 3e3, 120)) ? _task : null;
    },
    /**
     * @param {number} id
     * @returns {org.autojs.autojs.timing.TimedTask}
     */
    getTimedTask(id) {
        return TimedTaskMgr.getTimedTask(id);
    },
    /**
     * @param {number} id
     * @returns {org.autojs.autojs.timing.IntentTask}
     */
    getIntentTask(id) {
        return TimedTaskMgr.getIntentTask(id);
    },
    /**
     * @param {number} id
     * @param {boolean|'wait'} [wait_fg=false]
     * @returns {org.autojs.autojs.timing.TimedTask|null}
     */
    removeIntentTask(id, wait_fg) {
        let _task = removeTask(this.getIntentTask(id));
        return _task && (!wait_fg || waitForAction(() => !this.getTimedTask(_task.id), 3e3, 120)) ? _task : null;
    },
    /**
     * @param {number} id
     * @param {boolean|'wait'} [wait_fg=false]
     * @returns {org.autojs.autojs.timing.TimedTask|null}
     */
    removeTimedTask(id, wait_fg) {
        let _task = removeTask(this.getTimedTask(id));
        return _task && (!wait_fg || waitForAction(() => !this.getTimedTask(_task.id), 3e3, 120)) ? _task : null;
    },
    /**
     * @param {org.autojs.autojs.timing.TimedTask|*} [task]
     * @returns {*|org.autojs.autojs.timing.TimedTask|null}
     */
    updateTimedTask(task) {
        return task && updateTask(task) || null;
    },
    /**
     * @param {{path?:string}} [options]
     * @returns {org.autojs.autojs.timing.TimedTask[]}
     */
    queryTimedTasks(options) {
        let _opt = options || {};
        let _sql = '';
        let _args = [];
        let _append = str => _sql += _sql.length ? ' AND ' + str : str;
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
     * @returns {org.autojs.autojs.timing.IntentTask[]}
     */
    queryIntentTasks(options) {
        let _opt = options || {};
        let _sql = '';
        let _args = [];
        let _append = str => _sql += _sql.length ? ' AND ' + str : str;
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
};

module.exports = ext;
module.exports.load = () => global.timersx = ext;

// tool function(s) //

/**
 * @param {Object} c
 * @param {number} [c.delay=0]
 * @param {number} [c.interval=0]
 * @param {number} [c.loopTimes=1]
 * @returns {com.stardust.autojs.execution.ExecutionConfig}
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
 * @returns {org.joda.time.DateTime|org.joda.time.LocalDateTime|*}
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

/**
 * @param {org.autojs.autojs.timing.TimedTask|org.autojs.autojs.timing.IntentTask} [task]
 * @returns {org.autojs.autojs.timing.TimedTask|org.autojs.autojs.timing.IntentTask|null}
 */
function addTask(task) {
    if (!task) {
        return null;
    }
    TimedTaskMgr[is_pro ? 'addTaskSync' : 'addTask'](task);
    return task;
}

/**
 * @param {org.autojs.autojs.timing.TimedTask|org.autojs.autojs.timing.IntentTask} [task]
 * @returns {org.autojs.autojs.timing.TimedTask|org.autojs.autojs.timing.IntentTask|null}
 */
function removeTask(task) {
    if (!task) {
        return null;
    }
    TimedTaskMgr[is_pro ? 'removeTaskSync' : 'removeTask'](task);
    return task;
}

/**
 * @param {org.autojs.autojs.timing.TimedTask} [task]
 * @returns {org.autojs.autojs.timing.TimedTask|null}
 */
function updateTask(task) {
    if (!task) {
        return null;
    }
    task.setScheduled(false);
    TimedTaskMgr.updateTask(task);
    return task;
}