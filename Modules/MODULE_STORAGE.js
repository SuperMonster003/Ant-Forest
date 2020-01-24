/**
 * @description
 * set values into or get values from
 * files in "/sdcard/.local" folder
 *
 * @since Jan 21, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

module.exports = {
    create: function (name) {
        return new Storage(name);
    },
    remove: function (name) {
        this.create(name).clear();
    },
};

// constructor(s) //

function Storage(name) {
    let _path = files.getSdcardPath() + "/.local/";
    let _file = _create(_path);
    let _opened = files.open(_file);
    let _readFile = () => files.read(_file);

    this.contains = _contains;
    this.get = _get;
    this.put = _put;
    this.remove = _remove;
    this.clear = _clear;

    // tool function(s) //

    function _create(dir) {
        let _f = dir + name + ".nfe";
        files.createWithDirs(_f);
        return _f;
    }

    function _contains(key) {
        let _f = _readFile();
        if (!_f) {
            return false;
        }
        return key in JSON.parse(_f);
    }

    function _put(key, new_val, forc) {
        if (typeof new_val === "undefined") {
            let _m = '"put" value can\'t be undefined';
            throw new TypeError(_m);
        }
        let _read = _readFile();
        let _old_data = {};
        let _tmp_data = {};

        try {
            _old_data = JSON.parse(_read, (k, v) => {
                return v === Infinity ? "Infinity" : v;
            });
        } catch (e) {
            console.warn(e.message);
        }

        let _cA = _classof(new_val, "Object");
        let _cB = _classof(_old_data[key], "Object");
        let _both_type_o = _cA && _cB;
        let _keyLen = () => Object.keys(new_val).length;

        if (!forc && _both_type_o && _keyLen()) {
            _tmp_data[key] = Object.assign(
                _old_data[key], new_val
            );
        } else {
            _tmp_data[key] = new_val;
        }

        Object.assign(_old_data, _tmp_data);
        files.write(_file, JSON.stringify(
            _old_data, (k, v) => {
                return v === Infinity ? "Infinity" : v;
            })
        );
        _opened.close();
    }

    function _get(key, value) {
        let _f = _readFile();
        if (!_f) {
            return value;
        }
        try {
            let _o = JSON.parse(_f, (k, v) => {
                return v === Infinity ? "Infinity" : v;
            });
            if (_o && key in _o) {
                return _o[key];
            }
        } catch (e) {
            console.warn(e.message);
        }
        return value;
    }

    function _remove(key) {
        let _f = _readFile();
        if (!_f) {
            return;
        }
        let _o = JSON.parse(_f);
        if (!(key in _o)) {
            return;
        }
        delete _o[key];
        files.write(_file, JSON.stringify(_o));
        _opened.close();
    }

    function _clear() {
        files.remove(_file);
    }

    function _classof(src, chk) {
        let _s = Object.prototype.toString.call(src).slice(8, -1);
        return chk ? _s.toUpperCase() === chk.toUpperCase() : _s;
    }
}