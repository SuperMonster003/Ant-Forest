// better compatibility for both free and pro versions

global.timersx = typeof global.timersx === "object" ? global.timersx : {};

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
        if (!_task) {
            return null;
        }
        if (wait_fg) {
            if (!waitForAction(() => _task.id !== 0, 3e3, 120)) {
                return null;
            }
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
        if (!_task) {
            return null;
        }
        if (wait_fg) {
            if (!waitForAction(() => _task.id !== 0, 3e3, 120)) {
                return null;
            }
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
        if (wait_fg) {
            if (!waitForAction(() => _task.id !== 0, 3e3, 120)) {
                return null;
            }
        }
        return _task;
    },
    addIntentTask(options, wait_fg) {
        let opt = options || {};
        let task = new timing.IntentTask();
        task.setScriptPath(files.path(opt.path));
        opt.action && task.setAction(opt.action);
        let _task = addTask(task);
        if (!_task) {
            return null;
        }
        if (wait_fg) {
            if (!waitForAction(() => _task.id !== 0, 3e3, 120)) {
                return null;
            }
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
        if (wait_fg) {
            if (!waitForAction(() => !ext.getTimedTask(_task.id), 3e3, 120)) {
                return null;
            }
        }
        return _task;
    },
    removeTimedTask(id, wait_fg) {
        let task = this.getTimedTask(id);
        if (!task) {
            return null;
        }
        let _task = removeTask(task);
        if (wait_fg) {
            if (!waitForAction(() => !ext.getTimedTask(_task.id), 3e3, 120)) {
                return null;
            }
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
        if (opt.path) {
            append('script_path = ?');
            args.push(opt.path);
        }
        if (opt.action) {
            append('action = ?');
            args.push(opt.action);
        }
        return bridges.toArray(TimedTaskManager.queryIntentTasks(sql || null, args));
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

// monster function(s) //

// updated: Aug 29, 2020
function waitForAction(f, timeout_or_times, interval, params) {
    let _par = params || {};
    _par.no_impeded || typeof $$impeded === "function" && $$impeded(waitForAction.name);

    if (typeof timeout_or_times !== "number") {
        timeout_or_times = 10e3;
    }
    let _times = timeout_or_times;
    if (_times <= 0 || !isFinite(_times) || isNaN(_times) || _times > 100) {
        _times = Infinity;
    }
    let _timeout = Infinity;
    if (timeout_or_times > 100) {
        _timeout = timeout_or_times;
    }
    let _interval = interval || 200;
    if (_interval >= _timeout) {
        _times = 1;
    }

    let _start_ts = Date.now();
    while (!_checkF(f) && --_times) {
        if (Date.now() - _start_ts > _timeout) {
            return false; // timed out
        }
        sleep(_interval);
    }
    return _times > 0;

    // tool function(s) //

    function _checkF(f) {
        let _classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _messageAction = (
            typeof messageAction === "function" ? messageAction : messageActionRaw
        );

        if (typeof f === "function") {
            return f();
        }
        if (_classof(f) === "JavaObject") {
            return f.toString().match(/UiObject/) ? f : f.exists();
        }
        if (_classof(f) === "Array") {
            let _arr = f;
            let _len = _arr.length;
            let _logic = "all";
            if (typeof _arr[_len - 1] === "string") {
                _logic = _arr.pop();
            }
            if (_logic.match(/^(or|one)$/)) {
                _logic = "one";
            }
            for (let i = 0; i < _len; i += 1) {
                let _ele = _arr[i];
                if (!(typeof _ele).match(/function|object/)) {
                    _messageAction("数组参数中含不合法元素", 9, 1, 0, 1);
                }
                if (_logic === "all" && !_checkF(_ele)) {
                    return false;
                }
                if (_logic === "one" && _checkF(_ele)) {
                    return true;
                }
            }
            return _logic === "all";
        }
        _messageAction('"waitForAction"传入f参数不合法\n\n' + f.toString() + '\n', 9, 1, 0, 1);
    }

    // raw function(s) //

    function messageActionRaw(msg, lv, if_toast) {
        let _s = msg || " ";
        if (lv && lv.toString().match(/^t(itle)?$/)) {
            let _par = ["[ " + msg + " ]", 1, if_toast];
            return messageActionRaw.apply({}, _par);
        }
        let _lv = +lv;
        if (if_toast) {
            toast(_s);
        }
        if (_lv >= 3) {
            if (_lv >= 4) {
                console.error(_s);
                if (_lv >= 8) {
                    exit();
                }
            } else {
                console.warn(_s);
            }
            return;
        }
        if (_lv === 0) {
            console.verbose(_s);
        } else if (_lv === 1) {
            console.log(_s);
        } else if (_lv === 2) {
            console.info(_s);
        }
        return true;
    }
}