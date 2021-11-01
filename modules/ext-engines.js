require('./mod-global');
let {consolex} = require('./ext-console');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let ScriptConfig = com.stardust.autojs.project.ScriptConfig;
let ExecutionConfig = com.stardust.autojs.execution.ExecutionConfig;

let exp = {
    get my_engine() {
        return engines.myEngine();
    },
    get my_engine_id() {
        return this.my_engine.getId();
    },
    get my_engine_exec_argv() {
        let _argv = this.my_engine.getExecArgv();
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
    get my_engine_src_name() {
        if (typeof this.my_engine.source.getName === 'function') {
            return this.my_engine.source.getName();
        }
        return this.my_engine.source.toString().replace(/(.+?)(.(js|auto))?$/, '$1');
    },
    /**
     * @return {com.stardust.autojs.engine.ScriptEngine[]}
     */
    get all_engines() {
        return engines.all();
    },
    /**
     * @example
     * // eg: '/storage/emulated/0/Scripts/Ant-Forest-003'
     * console.log(enginesx.cwd);
     */
    get cwd() {
        return this.my_engine.cwd();
    },
    /**
     * @example
     * // eg: '/storage/emulated/0/Scripts/Ant-Forest-003/test.js'
     * console.log(enginesx.cwp);
     * @return {string}
     */
    get cwp() {
        if (this.isLocal()) {
            return this.my_engine.source.toString();
        }
        return '';
    },
    isLocal() {
        return !this.isRemote();
    },
    isRemote() {
        return /^\[remote]/.test(this.my_engine_src_name);
    },
    ensureLocal() {
        if (!this.isLocal()) {
            throw Error('Script must be running locally rather than remotely');
        }
    },
    execScript: (name, script, config) => {
        return runtime.engines.execScript(name, script, _fillConfig(config));
    },
    execScriptFile: (path, config) => {
        try {
            return runtime.engines.execScriptFile(path, _fillConfig(config));
        } catch (e) {
            // Auto.js Pro version
            return engines.execScriptFile(path, config);
        }
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
        this.my_engine.setTag('execute_path', path);
    },
    /**
     * Run a new task in engine and forcibly stop the old one (restart)
     * @param {Object} [options]
     * @param {string} [options.new_file] - new engine task name with or without path or file extension name
     * <br>
     *     -- *DEFAULT* - old engine task <br>
     *     -- new file - like 'hello.js', '../hello.js' or 'hello'
     * @param {boolean} [options.is_debug=undefined]
     * @param {number} [options.max_restart_e_times=1] - max restart times for avoiding infinite recursion
     * @param {boolean} [options.is_instant_running] - whether to perform an instant run or not
     * @example
     * enginesx.restart({
     *    is_debug: true,
     *    max_restart_e_times: 3,
     *    is_instant_running: false,
     * });
     * @return {boolean}
     */
    restart(options) {
        let _opt = options || {};
        let _debug = consolex.debug.fuel(_opt);

        let _e_argv = this.my_engine_exec_argv;

        let _r_times = typeof _e_argv.max_restart_e_times !== 'undefined'
            ? Number(_e_argv.max_restart_e_times)
            : typeof _opt.max_restart_e_times !== 'undefined'
                ? Number(_opt.max_restart_e_times) : 1;
        if (!_r_times) {
            return consolex.$('引擎重启次数已超限', 3);
        }

        let _r_times_bak = Number(_e_argv.max_restart_e_times_bak) || _r_times;
        _debug('重启当前引擎任务');
        _debug('当前次数: ' + (_r_times_bak - _r_times + 1), 0, 1);
        _debug('最大次数: ' + _r_times_bak, 0, 1);

        if (this.isRemote()) {
            return consolex.$('远程任务不支持重启引擎', 8, 4, 0, 1);
        }

        let _file_name = _opt.new_file || this.my_engine_src_name;
        let _file_path = files.path(_file_name + (_file_name.match(/\.js$/) ? '' : '.js'));

        _debug('运行新引擎任务:\n' + _file_path);
        this.execScriptFile(_file_path, {
            arguments: Object.assign({}, _opt, {
                max_restart_e_times: _r_times - 1,
                max_restart_e_times_bak: _r_times_bak,
                is_instant_running: _opt.is_instant_running,
            }),
        });

        _debug('强制停止旧引擎任务');
        let _my_e_id = this.my_engine_id;
        this.all_engines.filter(e => e.getId() === _my_e_id).forEach(e => e.forceStop());

        return true;
    },
};

module.exports = {enginesx: exp};

// tool function(s) //

/**
 * @param {Enginesx.ExecutionConfig} c
 * @return {com.stardust.autojs.execution.ExecutionConfig}
 */
function _fillConfig(c) {
    let _cfg = new ExecutionConfig();
    let _c = c || {};
    _cfg.workingDirectory = _c.path || files.cwd();
    _cfg.delay = _c.delay || 0;
    _cfg.interval = _c.interval || 0;
    _cfg.loopTimes = _c.loopTimes === undefined ? 1 : _c.loopTimes;
    Object.keys(_c.arguments || {}).forEach(k => _cfg.setArgument(k, _c.arguments[k]));
    if (typeof _c.scriptConfig === 'object') {
        let _features = _c.scriptConfig.useFeatures || [];
        let _ui_mode = _c.scriptConfig.uiMode === undefined ? false : _c.scriptConfig.uiMode;
        _cfg.scriptConfig = new ScriptConfig(_features, _ui_mode);
    }
    return _cfg;
}