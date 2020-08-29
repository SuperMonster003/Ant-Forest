// better compatibility for both free and pro versions

global.timersx = typeof global.timersx === "object" ? global.timersx : {};

let is_pro = getVerName("current_autojs").match(/[Pp]ro/);
let timing = is_pro
    ? com.stardust.autojs.core.timing
    : org.autojs.autojs.timing;
let TimedTask = is_pro
    ? timing.TimedTask.Companion
    : timing.TimedTask;
let timed_task_mgr = is_pro
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
    addDailyTask(task) {
        let timedTask = TimedTask.dailyTask(
            parseDateTime("LocalTime", task.time),
            files.path(task.path),
            parseConfig(task)
        );
        addTask(timedTask);
        return timedTask;
    },
    addWeeklyTask(task) {
        let time_flag = 0;
        for (let i = 0; i < task.daysOfWeek.length; i++) {
            let day_str = task.daysOfWeek[i].toString();
            let day_idx = days_ident.indexOf(day_str.toLowerCase()) % 7;
            if (!~day_idx) {
                throw new Error('unknown day: ' + day_str);
            }
            time_flag |= TimedTask.getDayOfWeekTimeFlag(day_idx + 1);
        }
        let timedTask = TimedTask.weeklyTask(
            parseDateTime("LocalTime", task.time),
            Number(new java.lang.Long(time_flag)),
            files.path(task.path),
            parseConfig(task)
        );
        addTask(timedTask);
        return timedTask;
    },
    addDisposableTask(task) {
        let timedTask = TimedTask.disposableTask(
            parseDateTime("LocalDateTime", task.date),
            files.path(task.path),
            parseConfig(task)
        );
        addTask(timedTask);
        return timedTask;
    },
    addIntentTask(task) {
        let intent_task = new timing.IntentTask();
        intent_task.setScriptPath(files.path(task.path));
        task.action && intent_task.setAction(task.action);
        addTask(intent_task);
        return intent_task;
    },
    getTimedTask(id) {
        return timed_task_mgr.getTimedTask(id);
    },
    getIntentTask(id) {
        return timed_task_mgr.getIntentTask(id);
    },
    removeIntentTask(id) {
        let task = this.getIntentTask(id);
        return task && removeTask(task);
    },
    removeTimedTask(id) {
        let task = this.getTimedTask(id);
        return task && removeTask(task);
    },
    updateTimedTask: updateTask,
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
            return bridges.toArray(timed_task_mgr.queryTimedTasks(sql || null, args));
        }
        let list = timed_task_mgr.getAllTasksAsList().toArray();
        if (path) {
            list = list.filter(task => task.getScriptPath() === path);
        }
        return list;
    },
    queryIntentTasks(options) {
        let opt = options || {};
        let sql = '';
        let args = [];
        let append = str => sql += sql.length ? ' AND ' + str : str;
        if (opt.path) {
            append('script_path = ?');
            args.push(options.path);
        }
        if (opt.action) {
            append('action = ?');
            args.push(options.action);
        }
        return bridges.toArray(timed_task_mgr.queryIntentTasks(sql ? sql : null, args));
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
    timed_task_mgr[is_pro ? "addTaskSync" : "addTask"](task);
    waitForAction(() => task.id !== 0, 1e3, 200);
}

function removeTask(task) {
    timed_task_mgr[is_pro ? "removeTaskSync" : "removeTask"](task);
    return waitForAction(() => !ext.getTimedTask(task.id), 1e3, 200);
}

function updateTask(task) {
    if (task) {
        let id = task.id;
        task.setScheduled(false);
        timed_task_mgr.updateTask(task);
        if (waitForAction(diffId.bind(null, id), 1e3, 200)) {
            return task;
        }
    }

    // tool function(s) //

    function diffId(id) {
        try {
            let new_id = ext.getTimedTask(id).id;
            return new_id && new_id !== id;
        } catch (e) {
            console.warn(e.message); //// TEST ////
            console.warn(e.stack); //// TEST ////
        }
    }
}

// monster function(s) //

// updated: Aug 2, 2020
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
        let _messageAction = typeof messageAction === "undefined"
            ? messageActionRaw
            : messageAction;

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

// updated: Jan 21, 2020
function getVerName(name, params) {
    let _par = params || {};

    let _parseAppName = typeof global.parseAppName === "undefined" ? parseAppNameRaw : global.parseAppName;
    let _debugInfo = (_msg, _info_flag) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(_msg, _info_flag, _par.debug_info_flag);

    name = _handleName(name);
    let _package_name = _parseAppName(name).package_name;
    if (!_package_name) return null;

    try {
        let _installed_packages = context.getPackageManager().getInstalledPackages(0).toArray();
        for (let i in _installed_packages) {
            if (_installed_packages.hasOwnProperty(i)) {
                if (_installed_packages[i].packageName.toString() === _package_name.toString()) {
                    return _installed_packages[i].versionName;
                }
            }
        }
    } catch (e) {
        _debugInfo(e);
    }
    return null;

    // tool function(s) //

    function _handleName(name) {
        if (name.match(/^[Aa]uto\.?js/)) return "org.autojs.autojs" + (name.match(/[Pp]ro$/) ? "pro" : "");
        if (name === "self") return currentPackage();
        if (name.match(/^[Cc]urrent.*[Aa]uto.*js/)) return context.packageName;
        return name;
    }

    // raw function(s) //

    function debugInfoRaw(msg, info_flg) {
        if (info_flg) {
            let _s = msg || "";
            _s = _s.replace(/^(>*)( *)/, ">>" + "$1 ");
            console.verbose(_s);
        }
    }

    function parseAppNameRaw(name) {
        let _app_name = !name.match(/.+\..+\./) && app.getPackageName(name) && name;
        let _package_name = app.getAppName(name) && name;
        _app_name = _app_name || _package_name && app.getAppName(_package_name);
        _package_name = _package_name || _app_name && app.getPackageName(_app_name);
        return {
            app_name: _app_name,
            package_name: _package_name,
        };
    }
}