let ext = {
    execArgvJs: () => {
        let _e = engines.myEngine();
        let _argv = _e.execArgv || {};
        let _o = {};
        let {Boolean: _Bool, Double: _Dbl} = java.lang;
        for (let i in _argv) {
            if (_argv.hasOwnProperty(i)) {
                let v = _argv[i];
                if (!v["getClass"]) {
                    _o[i] = v;
                } else if (v instanceof _Bool) {
                    _o[i] = v["booleanValue"]();
                } else if (v instanceof _Dbl) {
                    _o[i] = v["doubleValue"]();
                } else {
                    _o[i] = v;
                }
            }
        }
        return _o;
    },
};

module.exports = ext;
module.exports.load = () => Object.assign(global["engines"], ext);