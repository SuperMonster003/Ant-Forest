global.enginesx = typeof global.enginesx === 'object' ? global.enginesx : {};

let ext = {
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
    isRemote() {
        return !!engines.myEngine().source.name.match(/^\[remote]/);
    },
    isLocal() {
        return !this.isRemote();
    },
    makeSureLocal() {
        if (this.isLocal()) {
            return true;
        }
        throw Error('Script must be running locally rather than remotely');
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