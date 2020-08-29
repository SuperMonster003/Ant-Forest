global.enginesx = typeof global.enginesx === "object" ? global.enginesx : {};

let ext = {
    execArgvJs() {
        let _e = engines.myEngine();
        let _argv = _e.execArgv || {};
        let _o = {};
        for (let i in _argv) {
            if (_argv.hasOwnProperty(i)) {
                let _v = _argv[i];
                if (!_v.getClass) {
                    _o[i] = _v;
                } else if (_v instanceof java.lang.Boolean) {
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
        return runtime.engines.execScript(name, script, fillConfig(config));
    },
    execScriptFile: (path, config) => {
        return runtime.engines.execScriptFile(path, fillConfig(config));
    },
    execAutoFile: (path, config) => {
        return runtime.engines.execAutoFile(path, fillConfig(config));
    },
};

module.exports = ext;
module.exports.load = () => global.enginesx = ext;

// tool function(s) //

function fillConfig(c) {
    let config = new com.stardust.autojs.execution.ExecutionConfig();
    c = c || {};
    c.path = c.path || files.cwd();
    if (c.path) {
        config.workingDirectory = c.path;
    }
    config.delay = c.delay || 0;
    config.interval = c.interval || 0;
    config.loopTimes = (c.loopTimes === undefined) ? 1 : c.loopTimes;
    if (c.arguments) {
        let args = c.arguments;
        for (let key in args) {
            if (args.hasOwnProperty(key)) {
                config.setArgument(key, args[key]);
            }
        }
    }
    if (typeof c.scriptConfig === "object") {
        let features = c.scriptConfig.useFeatures || [];
        let uiModeParam = c.scriptConfig.uiMode;
        let uiMode = typeof uiModeParam === "undefined" ? false : uiModeParam;
        config.scriptConfig = new com.stardust.autojs.project.ScriptConfig(features, uiMode);
    }
    return config;
}