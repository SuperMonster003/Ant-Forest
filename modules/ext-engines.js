global.enginesx = typeof global.enginesx === 'object' ? global.enginesx : {};

let ext = {
    isLocal() {
        return !this.isRemote();
    },
    isRemote() {
        return !!engines.myEngine().source.name.match(/^\[remote]/);
    },
    makeSureLocal() {
        if (this.isLocal()) {
            return true;
        }
        throw Error('Script must be running locally rather than remotely');
    },
    execArgvJs() {
        let _e = engines.myEngine();
        let _argv = _e.execArgv || {};
        let _o = {};
        for (let i in _argv) {
            if (_argv.hasOwnProperty(i)) {
                let _v = _argv[i];
                if (_v instanceof java.lang.Boolean) {
                    _o[i] = _v.booleanValue();
                } else if (_v instanceof java.lang.Double) {
                    _o[i] = _v.doubleValue();
                } else {
                    _o[i] = _v;
                }
            }
        }
        return _o;
    },
    execScript: (name, script, config) => {
        return runtime.engines.execScript(name, script, _fillConfig(config));
    },
    execScriptFile: (path, config) => {
        return runtime.engines.execScriptFile(path, _fillConfig(config));
    },
    execAutoFile: (path, config) => {
        return runtime.engines.execAutoFile(path, _fillConfig(config));
    },
    setExecutePath(path) {
        if (typeof path !== 'string') {
            throw TypeError('path of enginesx.setExecutePath() must be string type');
        }
        if (!files.isDir(path)) {
            throw Error('path of enginesx.setExecutePath() must be a directory');
        }
        engines.myEngine().setTag('execute_path', path);
    },
    /**
     * Run a new task in engine and forcibly stop the old one (restart)
     * @param {Object} [params]
     * @param {string} [params.new_file] - new engine task name with or without path or file extension name
     * <br>
     *     -- *DEFAULT* - old engine task <br>
     *     -- new file - like 'hello.js', '../hello.js' or 'hello'
     * @param {boolean|string} [params.debug_info_flag]
     * @param {number} [params.max_restart_e_times=1] - max restart times for avoiding infinite recursion
     * @param {*} [params.instant_run_flag] - whether to perform an instant run or not
     * @example
     * enginesx.restart({
     *    debug_info_flag: true,
     *    max_restart_e_times: 3,
     *    instant_run_flag: false,
     * });
     * @return {boolean}
     */
    restart(params) {
        let _params = params || {};

        let _messageAction = (
            typeof messageAction === 'function' ? messageAction : messageActionRaw
        );
        let _debugInfo = (m, fg) => (
            typeof debugInfo === 'function' ? debugInfo : debugInfoRaw
        )(m, fg, _params.debug_info_flag);

        let _my_e = engines.myEngine();
        let _my_e_id = _my_e.id;
        let _e_argv = _my_e.execArgv;

        let _r_times = typeof _e_argv.max_restart_e_times !== 'undefined'
            ? Number(_e_argv.max_restart_e_times)
            : typeof _params.max_restart_e_times !== 'undefined'
                ? Number(_params.max_restart_e_times) : 1;
        if (!_r_times) {
            _messageAction('引擎重启已拒绝', 3);
            return !~_messageAction('引擎重启次数已超限', 3, 0, 1);
        }

        let _r_times_bak = +_e_argv.max_restart_e_times_bak || _r_times;
        _debugInfo('重启当前引擎任务');
        _debugInfo('>当前次数: ' + (_r_times_bak - _r_times + 1));
        _debugInfo('>最大次数: ' + _r_times_bak);

        if (this.isRemote()) {
            return _messageAction('远程任务不支持重启引擎', 8, 1, 0, 1);
        }

        let _file_name = _params.new_file || _my_e.source.toString();
        let _file_path = files.path(_file_name + (_file_name.match(/\.js$/) ? '' : '.js'));

        _debugInfo('运行新引擎任务:\n' + _file_path);
        engines.execScriptFile(_file_path, {
            arguments: Object.assign({}, _params, {
                max_restart_e_times: _r_times - 1,
                max_restart_e_times_bak: _r_times_bak,
                instant_run_flag: _params.instant_run_flag,
            }),
        });

        _debugInfo('强制停止旧引擎任务');
        engines.all().filter(e => e.id === _my_e_id).forEach(e => e.forceStop());

        return true;

        // raw function(s) //

        function messageActionRaw(msg, lv, if_toast) {
            let _msg = msg || ' ';
            if (lv && lv.toString().match(/^t(itle)?$/)) {
                return messageActionRaw('[ ' + msg + ' ]', 1, if_toast);
            }
            if_toast && toast(_msg);
            let _lv = typeof lv === 'undefined' ? 1 : lv;
            if (_lv >= 4) {
                console.error(_msg);
                _lv >= 8 && exit();
                return false;
            }
            if (_lv >= 3) {
                console.warn(_msg);
                return false;
            }
            if (_lv === 0) {
                console.verbose(_msg);
            } else if (_lv === 1) {
                console.log(_msg);
            } else if (_lv === 2) {
                console.info(_msg);
            }
            return true;
        }

        function debugInfoRaw(msg, msg_lv) {
            msg_lv && console.verbose((msg || '').replace(/^(>*)( *)/, '>>' + '$1 '));
        }
    },
};

module.exports = ext;
module.exports.load = () => global.enginesx = ext;

// tool function(s) //

function _fillConfig(c) {
    let _cfg = new com.stardust.autojs.execution.ExecutionConfig();
    let _c = c || {};
    _cfg.workingDirectory = _c.path || files.cwd();
    _cfg.delay = _c.delay || 0;
    _cfg.interval = _c.interval || 0;
    _cfg.loopTimes = _c.loopTimes === undefined ? 1 : _c.loopTimes;
    Object.keys(_c.arguments || {}).forEach(k => _cfg.setArgument(k, _c.arguments[k]));
    if (typeof _c.scriptConfig === 'object') {
        _cfg.scriptConfig = new com.stardust.autojs.project.ScriptConfig(
            _c.scriptConfig.useFeatures || [],
            _c.scriptConfig.uiMode === undefined ? false : _c.scriptConfig.uiMode
        );
    }
    return _cfg;
}