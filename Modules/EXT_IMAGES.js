let ext = {
    getName: (img) => {
        let img_str = img.toString().split("@")[1];
        return img_str ? "@" + img_str.match(/\w+/)[0] : "(已提前回收)";
    },
    isRecycled: (img) => {
        if (!img) return true;
        try {
            img.getHeight();
        } catch (e) {
            return !!e.message.match(/has been recycled/);
        }
    },
    reclaim: reclaim,
    capt: () => {
        let _max = 10;
        while (_max--) {
            try {
                tryRequestScreenCapture();
                let _img = images.captureScreen();
                // prevent "_img" from being auto-recycled
                let _copy = images.copy(_img);
                reclaim(_img);
                return _copy;
            } catch (e) {
                sleep(240);
            }
        }
        let _msg = "截取当前屏幕失败";
        console.error(_msg);
        toast(_msg);
        exit();
    },
};
ext.capture = ext.captureCurrentScreen = () => ext.capt();

module.exports = Object.assign({
    load: () => Object.assign(global["images"], ext),
}, ext);

// FIXME seems like this is not effective to avoid OOM @ Dec 3, 2019
function reclaim() {
    for (let i = 0, len = arguments.length; i < len; i += 1) {
        let img = arguments[i];
        if (!img) continue;
        img.recycle();
        /*
            `img = null;` is not necessary
            as which only modified the point
            of this reference typed argument
         */
    }
}

// updated: Dec 15, 2019
function tryRequestScreenCapture(params) {
    let _mon_path = "./MODULE_MONSTER_FUNC";
    if (files.exists(_mon_path)) {
        return require(_mon_path).tryRequestScreenCapture(params);
    }

    if (global["_$_request_screen_capture"]) {
        return true;
    }

    let _par = params || {};
    let _debugInfo = (m, fg) => (typeof debugInfo === "undefined" ? debugInfoRaw : debugInfo)(m, fg, _par.debug_info_flag);
    let _waitForAction = typeof waitForAction === "undefined" ? waitForActionRaw : waitForAction;
    let _messageAction = typeof messageAction === "undefined" ? messageActionRaw : messageAction;
    let _clickAction = typeof clickAction === "undefined" ? clickActionRaw : clickAction;
    let _restartThisEngine = typeof restartThisEngine === "undefined" ? restartThisEngineRaw : restartThisEngine;
    let _getSelector = typeof getSelector === "undefined" ? getSelectorRaw : getSelector;
    let _$sel = _getSelector();
    let _$und = o => typeof o === "undefined";

    if (_$und(_par.restart_this_engine_flag)) {
        _par.restart_this_engine_flag = true;
    } else {
        let _self = _par.restart_this_engine_flag;
        _par.restart_this_engine_flag = !!_self;
    }
    if (!_par.restart_this_engine_params) {
        _par.restart_this_engine_params = {};
    }
    if (!_par.restart_this_engine_params.max_restart_engine_times) {
        _par.restart_this_engine_params.max_restart_engine_times = 3;
    }

    _debugInfo("开始申请截图权限");

    global["_$_request_screen_capture"] = true;
    _debugInfo("已存储截图权限申请标记");

    _debugInfo("已开启弹窗监测线程");
    let _thread_prompt = threads.start(function () {
        let _kw_remember = id("com.android.systemui:id/remember");
        let _sel_remember = () => _$sel.pickup(_kw_remember);
        let _rex_sure = /START NOW|立即开始|允许/;
        let _sel_sure = type => _$sel.pickup(_rex_sure, type);

        if (_waitForAction(_sel_sure, 5000)) {
            if (_waitForAction(_sel_remember, 1000)) {
                _debugInfo("勾选\"不再提示\"复选框");
                _clickAction(_sel_remember(), "w");
            }
            if (_waitForAction(_sel_sure, 2000)) {
                let _node = _sel_sure();
                let _act_msg = "点击\"" + _sel_sure("txt") + "\"按钮";

                _debugInfo(_act_msg);
                _clickAction(_node, "w");

                if (!_waitForAction(() => !_sel_sure(), 1000)) {
                    _debugInfo("尝试click()方法再次" + _act_msg);
                    _clickAction(_node, "click");
                }
            }
        }
    });

    let _thread_monitor = threads.start(function () {
        if (_waitForAction(() => !!_req_result, 3600, 300)) {
            _thread_prompt.interrupt();
            return _debugInfo("截图权限申请结果: " + _req_result);
        }
        if (!$flag.debug_info_avail) {
            $flag.debug_info_avail = true;
            _debugInfo("开发者测试模式已自动开启", 3);
        }
        if (_par.restart_this_engine_flag) {
            _debugInfo("截图权限申请结果: 失败", 3);
            try {
                let _m = android.os.Build.MANUFACTURER.toLowerCase();
                if (_m.match(/xiaomi/)) {
                    _debugInfo("__split_line__dash_");
                    _debugInfo("检测到当前设备制造商为小米", 3);
                    _debugInfo("可能需要给Auto.js以下权限:", 3);
                    _debugInfo(">\"后台弹出界面\"", 3);
                    _debugInfo("__split_line__dash_");
                }
            } catch (e) {
                // nothing to do here
            }
            if (_restartThisEngine(_par.restart_this_engine_params)) {
                return;
            }
        }
        _messageAction("截图权限申请失败", 9, 1, 0, 1);
    });

    // just in case
    sleep(360);

    let _req_result = images.requestScreenCapture(false);

    // usually, images.captureScreen() needs some time
    // to be effective, and 300 is not absolutely
    sleep(360);

    _thread_monitor.join();
    return _req_result;

    // raw function(s) //

    function getSelectorRaw() {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let sel = selector();
        sel.__proto__ = {
            pickup: (filter) => {
                if (classof(filter) === "JavaObject") {
                    if (filter.toString().match(/UiObject/)) return filter;
                    return filter.findOnce() || null;
                }
                if (typeof filter === "string") return desc(filter).findOnce() || text(filter).findOnce() || null;
                if (classof(filter) === "RegExp") return descMatches(filter).findOnce() || textMatches(filter).findOnce() || null;
                return null;
            },
        };
        return sel;
    }

    function debugInfoRaw(msg, info_flag) {
        if (info_flag) console.verbose((msg || "").replace(/^(>*)( *)/, ">>" + "$1 "));
    }

    function waitForActionRaw(cond_func, time_params) {
        let _cond_func = cond_func;
        if (!cond_func) return true;
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        if (classof(cond_func) === "JavaObject") _cond_func = () => cond_func.exists();
        let _check_time = typeof time_params === "object" && time_params[0] || time_params || 10000;
        let _check_interval = typeof time_params === "object" && time_params[1] || 200;
        while (!_cond_func() && _check_time >= 0) {
            sleep(_check_interval);
            _check_time -= _check_interval;
        }
        return _check_time >= 0;
    }

    function clickActionRaw(kw) {
        let classof = o => Object.prototype.toString.call(o).slice(8, -1);
        let _kw = classof(_kw) === "Array" ? kw[0] : kw;
        let _key_node = classof(_kw) === "JavaObject" && _kw.toString().match(/UiObject/) ? _kw : _kw.findOnce();
        if (!_key_node) return;
        let _bounds = _key_node.bounds();
        click(_bounds.centerX(), _bounds.centerY());
        return true;
    }

    function messageActionRaw(msg, msg_level, toast_flag) {
        let _msg = msg || " ";
        if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
            return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
        }
        let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
        toast_flag && toast(_msg);
        if (_msg_level === 0) return console.verbose(_msg) || true;
        if (_msg_level === 1) return console.log(_msg) || true;
        if (_msg_level === 2) return console.info(_msg) || true;
        if (_msg_level === 3) return console.warn(_msg) || false;
        if (_msg_level >= 4) {
            console.error(_msg);
            _msg_level >= 8 && exit();
        }
    }

    function restartThisEngineRaw(params) {
        let _params = params || {};
        let _my_engine = engines.myEngine();

        let _max_restart_engine_times_argv = _my_engine.execArgv.max_restart_engine_times;
        let _max_restart_engine_times_params = _params.max_restart_engine_times;
        let _max_restart_engine_times;
        let _instant_run_flag = !!_params.instant_run_flag;
        if (typeof _max_restart_engine_times_argv === "undefined") {
            if (typeof _max_restart_engine_times_params === "undefined") _max_restart_engine_times = 1;
            else _max_restart_engine_times = +_max_restart_engine_times_params;
        } else _max_restart_engine_times = +_max_restart_engine_times_argv;

        if (!_max_restart_engine_times) return;

        let _file_name = _params.new_file || _my_engine.source.toString();
        if (_file_name.match(/^\[remote]/)) return ~console.error("远程任务不支持重启引擎") && exit();
        let _file_path = files.path(_file_name.match(/\.js$/) ? _file_name : (_file_name + ".js"));
        engines.execScriptFile(_file_path, {
            arguments: {
                max_restart_engine_times: _max_restart_engine_times - 1,
                instant_run_flag: _instant_run_flag,
            },
        });
        _my_engine.forceStop();
    }


}