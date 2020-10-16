// better compatibility for both free and pro versions

global.timersx = typeof global.timersx === "object" ? global.timersx : {};

require("./MODULE_MONSTER_FUNC").load("waitForAction");

let is_pro = context.packageName.match(/[Pp]ro/);
let timing = is_pro
    ? com.stardust.autojs.core.timing
    : org.autojs.autojs.timing;
let TimedTask = is_pro
    ? timing.TimedTask.Companion
    : timing.TimedTask;
let TimedTaskManager = is_pro
    ? timing.TimedTaskManager.Companion.getInstance()
    : timing.TimedTaskManager.getInstance();
let bridges = require.call(global, "__bridges__");
let days_ident = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
    '一', '二', '三', '四', '五', '六', '日',
    1, 2, 3, 4, 5, 6, 0,
    1, 2, 3, 4, 5, 6, 7,
].map(value => value.toString());

let ext = {
    _diffId(id) {
        try {
            let task = ext.getTimedTask(id);
            if (task) {
                let new_id = task.id;
                return new_id && new_id !== id;
            }
        } catch (e) {
            console.warn(e.message); //// TEST ////
            console.warn(e.stack); //// TEST ////
        }
    },
    addDailyTask(options, wait_fg) {
        let opt = options;
        let task = TimedTask.dailyTask(
            parseDateTime("LocalTime", opt.time),
            files.path(opt.path),
            parseConfig(opt)
        );
        let _task = addTask(task);
        if (!_task || wait_fg && !waitForAction(() => _task.id !== 0, 3e3, 120)) {
            return null;
        }
        return _task;
    },
    addWeeklyTask(options, wait_fg) {
        let opt = options || {};
        let time_flag = 0;
        for (let i = 0; i < opt.daysOfWeek.length; i++) {
            let day_str = opt.daysOfWeek[i].toString();
            let day_idx = days_ident.indexOf(day_str.toLowerCase()) % 7;
            if (!~day_idx) {
                throw Error('unknown day: ' + day_str);
            }
            time_flag |= TimedTask.getDayOfWeekTimeFlag(day_idx + 1);
        }
        let task = TimedTask.weeklyTask(
            parseDateTime("LocalTime", opt.time),
            Number(new java.lang.Long(time_flag)),
            files.path(opt.path),
            parseConfig(opt)
        );
        let _task = addTask(task);
        if (!_task || wait_fg && !waitForAction(() => _task.id !== 0, 3e3, 120)) {
            return null;
        }
        return _task;
    },
    addDisposableTask(options, wait_fg) {
        let opt = options || {};
        let task = TimedTask.disposableTask(
            parseDateTime("LocalDateTime", opt.date),
            files.path(opt.path),
            parseConfig(opt)
        );
        let _task = addTask(task);
        if (wait_fg && !waitForAction(() => _task.id !== 0, 3e3, 120)) {
            return null;
        }
        return _task;
    },
    addIntentTask(options, wait_fg) {
        let opt = options || {};
        let task = new timing.IntentTask();
        task.setScriptPath(files.path(opt.path));
        opt.action && task.setAction(opt.action);
        let _task = addTask(task);
        if (!_task || wait_fg && !waitForAction(() => _task.id !== 0, 3e3, 120)) {
            return null;
        }
        return _task;
    },
    getTimedTask(id) {
        return TimedTaskManager.getTimedTask(id);
    },
    getIntentTask(id) {
        return TimedTaskManager.getIntentTask(id);
    },
    removeIntentTask(id, wait_fg) {
        let task = this.getIntentTask(id);
        if (!task) {
            return null;
        }
        let _task = removeTask(task);
        if (wait_fg && !waitForAction(() => !ext.getTimedTask(_task.id), 3e3, 120)) {
            return null;
        }
        return _task;
    },
    removeTimedTask(id, wait_fg) {
        let task = this.getTimedTask(id);
        if (!task) {
            return null;
        }
        let _task = removeTask(task);
        if (wait_fg && !waitForAction(() => !ext.getTimedTask(_task.id), 3e3, 120)) {
            return null;
        }
        return _task;
    },
    updateTimedTask(task) {
        return updateTask(task) || null;
    },
    queryTimedTasks(options) {
        let opt = options || {};
        let sql = '';
        let args = [];
        let append = str => sql += sql.length ? ' AND ' + str : str;
        let path = opt.path;
        if (path) {
            append('script_path = ?');
            args.push(path);
        }
        if (is_pro) {
            return bridges.toArray(TimedTaskManager.queryTimedTasks(sql || null, args));
        }
        let list = TimedTaskManager.getAllTasksAsList().toArray();
        return path ? list.filter(task => task.getScriptPath() === path) : list;
    },
    queryIntentTasks(options) {
        let opt = options || {};
        let sql = '';
        let args = [];
        let append = str => sql += sql.length ? ' AND ' + str : str;
        let {path, action} = opt;
        if (path) {
            append('script_path = ?');
            args.push(path);
        }
        if (action) {
            append('action = ?');
            args.push(action);
        }
        if (is_pro) {
            return bridges.toArray(TimedTaskManager.queryIntentTasks(sql || null, args));
        }
        let list = TimedTaskManager.getAllIntentTasksAsList().toArray();
        return path || action ? list.filter(task => (
            !(path && task.getScriptPath() !== path || action && task.getAction() !== action)
        )) : list;
    },
};

module.exports = ext;
module.exports.load = () => global.timersx = ext;

// tool function(s) //

function parseConfig(c) {
    let config = new com.stardust.autojs.execution.ExecutionConfig();
    config.delay = c.delay || 0;
    config.interval = c.interval || 0;
    config.loopTimes = (c.loopTimes === undefined) ? 1 : c.loopTimes;
    return config;
}

function parseDateTime(clazz, date_time) {
    clazz = is_pro ? clazz : org.joda.time[clazz];
    if (typeof date_time === 'string') {
        return is_pro
            ? TimedTask.parseDateTime.call(TimedTask, clazz, date_time)
            : clazz.parse(date_time);
    }
    if (typeof date_time === 'object' && date_time.constructor === Date) {
        return is_pro
            ? TimedTask.parseDateTime.call(TimedTask, clazz, date_time.getTime())
            : new clazz(date_time.getTime());
    }
    if (typeof date_time === 'number') {
        return is_pro
            ? TimedTask.parseDateTime.call(TimedTask, clazz, date_time)
            : new clazz(date_time);
    }
    throw new Error("cannot parse date time: " + date_time);
}

function addTask(task) {
    TimedTaskManager[is_pro ? "addTaskSync" : "addTask"](task);
    return task;
}

function removeTask(task) {
    TimedTaskManager[is_pro ? "removeTaskSync" : "removeTask"](task);
    return task;
}

function updateTask(task) {
    if (task) {
        task.setScheduled(false);
        TimedTaskManager.updateTask(task);
        return task;
    }
}