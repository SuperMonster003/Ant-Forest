// better compatibility for both free and some Pro versions of Auto.js

global.timersx = typeof global.timersx === "object" ? global.timersx : {};

require("./MODULE_MONSTER_FUNC").load("waitForAction");

let is_pro = context.packageName.match(/[Pp]ro/);
let timing = is_pro ? com.stardust.autojs.core.timing : org.autojs.autojs.timing;
let TimedTask = is_pro ? timing.TimedTask.Companion : timing.TimedTask;
let TimedTaskManager = timing.TimedTaskManager;
let TimedTaskMgr = is_pro ? TimedTaskManager.Companion.getInstance() : TimedTaskManager.getInstance();
let bridges = require.call(global, "__bridges__");
let days_ident = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
    '一', '二', '三', '四', '五', '六', '日',
    1, 2, 3, 4, 5, 6, 0,
    1, 2, 3, 4, 5, 6, 7,
].map(value => value.toString());

let ext = {
    addDailyTask(options, wait_fg) {
        let _opt = options || {};
        let _task = addTask(TimedTask.dailyTask(
            parseDateTime("LocalTime", _opt.time), files.path(_opt.path), parseConfig(_opt)
        ));
        return _task && (!wait_fg || waitForAction(() => _task.id !== 0, 3e3, 120)) ? _task : null;
    },
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
        let _task = addTask(TimedTask.weeklyTask(
            parseDateTime("LocalTime", _opt.time), Number(new java.lang.Long(_time_flag)),
            files.path(_opt.path), parseConfig(_opt)
        ));
        return _task && (!wait_fg || waitForAction(() => _task.id !== 0, 3e3, 120)) ? _task : null;
    },
    addDisposableTask(options, wait_fg) {
        let _opt = options || {};
        let _task = addTask(TimedTask.disposableTask(
            parseDateTime("LocalDateTime", _opt.date), files.path(_opt.path), parseConfig(_opt)
        ));
        return _task && (!wait_fg || waitForAction(() => _task.id !== 0, 3e3, 120)) ? _task : null;
    },
    addIntentTask(options, wait_fg) {
        let _opt = options || {};
        let _task = addTask((() => {
            let _i_task = new timing.IntentTask();
            _i_task.setScriptPath(files.path(_opt.path));
            _opt.action && _i_task.setAction(_opt.action);
            return _i_task;
        })());
        return _task && (!wait_fg || waitForAction(() => _task.id !== 0, 3e3, 120)) ? _task : null;
    },
    getTimedTask(id) {
        return TimedTaskMgr.getTimedTask(id);
    },
    getIntentTask(id) {
        return TimedTaskMgr.getIntentTask(id);
    },
    removeIntentTask(id, wait_fg) {
        let _task = removeTask(this.getIntentTask(id));
        return _task && (!wait_fg || waitForAction(() => !ext.getTimedTask(_task.id), 3e3, 120)) ? _task : null;
    },
    removeTimedTask(id, wait_fg) {
        let _task = removeTask(this.getTimedTask(id));
        return _task && (!wait_fg || waitForAction(() => !ext.getTimedTask(_task.id), 3e3, 120)) ? _task : null;
    },
    updateTimedTask(task) {
        return task && updateTask(task) || null;
    },
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
            return bridges.toArray(TimedTaskMgr.queryTimedTasks(_sql || null, _args));
        }
        let list = TimedTaskMgr.getAllTasksAsList().toArray();
        return _path ? list.filter(task => task.getScriptPath() === _path) : list;
    },
    queryIntentTasks(options) {
        let _opt = options || {};
        let _sql = '';
        let _args = [];
        let _append = str => _sql += _sql.length ? ' AND ' + str : str;
        let {path, action} = _opt;
        if (path) {
            _append('script_path = ?');
            _args.push(path);
        }
        if (action) {
            _append('action = ?');
            _args.push(action);
        }
        if (is_pro) {
            return bridges.toArray(TimedTaskMgr.queryIntentTasks(_sql || null, _args));
        }
        let list = TimedTaskMgr.getAllIntentTasksAsList().toArray();
        return path || action ? list.filter(task => (
            !(path && task.getScriptPath() !== path || action && task.getAction() !== action)
        )) : list;
    },
};

module.exports = ext;
module.exports.load = () => global.timersx = ext;

// tool function(s) //

function parseConfig(c) {
    let _ec = new com.stardust.autojs.execution.ExecutionConfig();
    _ec.delay = c.delay || 0;
    _ec.interval = c.interval || 0;
    _ec.loopTimes = (c.loopTimes === undefined) ? 1 : c.loopTimes;
    return _ec;
}

function parseDateTime(clazz, date_time) {
    let _clz = is_pro ? clazz : org.joda.time[clazz];
    let _dt = date_time;
    let _dts = () => _dt.getTime();
    if (typeof date_time === 'string') {
        return is_pro ? TimedTask.parseDateTime.call(TimedTask, _clz, _dt) : _clz.parse(_dt);
    }
    if (typeof date_time === 'object' && date_time.constructor === Date) {
        return is_pro ? TimedTask.parseDateTime.call(TimedTask, _clz, _dts()) : new _clz(_dts());
    }
    if (typeof date_time === 'number') {
        return is_pro ? TimedTask.parseDateTime.call(TimedTask, _clz, _dt) : new _clz(_dt);
    }
    throw new Error("cannot parse date time: " + date_time);
}

function addTask(task) {
    if (task) {
        TimedTaskMgr[is_pro ? "addTaskSync" : "addTask"](task);
        return task;
    }
}

function removeTask(task) {
    if (task) {
        TimedTaskMgr[is_pro ? "removeTaskSync" : "removeTask"](task);
        return task;
    }
}

function updateTask(task) {
    if (task) {
        task.setScheduled(false);
        TimedTaskMgr.updateTask(task);
        return task;
    }
}