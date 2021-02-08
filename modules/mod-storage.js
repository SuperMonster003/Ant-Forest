/**
 * Implement of 'storages' with 'files' api.
 * @since Jun 19, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

module.exports = {
    create(name) {
        return new Storage(name);
    },
    remove(name) {
        this.create(name).clear();
    },
};

// constructor(s) //

function Storage(name) {
    let _dir = files.getSdcardPath() + '/.local/';
    let _full_path = _dir + name + '.nfe';
    files.createWithDirs(_full_path);
    let _readFile = () => files.read(_full_path);

    this.contains = _contains;
    this.get = _get;
    this.put = _put;
    this.remove = _remove;
    this.clear = _clear;

    // tool function(s) //

    function _replacer(k, v) {
        if (typeof v === 'number') {
            if (isNaN(v) || !isFinite(v)) {
                /** Zero Width No-Break Space */
                let _pad = '\ufeff';
                return _pad + v.toString() + _pad;
            }
        }
        return v;
    }

    function _reviver(k, v) {
        if (typeof v === 'string') {
            let _rex = /^\ufeff(.+)\ufeff$/;
            if (v.match(_rex)) {
                return +v.replace(_rex, '$1');
            }
        }
        return v;
    }

    function _contains(key) {
        return key in _jsonParseFile();
    }

    function _put(key, new_val, forc) {
        if (typeof new_val === 'undefined') {
            let _m = '"put" value can\'t be undefined';
            throw new TypeError(_m);
        }

        let _old_data = {};
        let _tmp_data = {};

        try {
            _old_data = _jsonParseFile(_reviver);
        } catch (e) {
            console.warn(e.message);
        }

        let _cA = _classof(new_val, 'Object');
        let _cB = _classof(_old_data[key], 'Object');
        let _both_type_o = _cA && _cB;
        let _keyLen = () => Object.keys(new_val).length;

        if (!forc && _both_type_o && _keyLen()) {
            _tmp_data[key] = Object.assign(
                _old_data[key], new_val
            );
        } else {
            _tmp_data[key] = new_val;
        }

        files.write(_full_path, JSON.stringify(
            Object.assign(_old_data, _tmp_data), _replacer, 2
        ));
    }

    function _get(key, value) {
        let _o = _jsonParseFile(_reviver);
        if (_o && key in _o) {
            return _o[key];
        }
        return value;
    }

    function _remove(key) {
        let _o = _jsonParseFile();
        if (key in _o) {
            delete _o[key];
            files.write(_full_path, JSON.stringify(_o, null, 2));
        }
    }

    function _clear() {
        files.remove(_full_path);
    }

    function _classof(src, chk) {
        let _s = Object.prototype.toString.call(src).slice(8, -1);
        return chk ? _s.toUpperCase() === chk.toUpperCase() : _s;
    }

    function _jsonParseFile(reviver) {
        let _str = _readFile();
        try {
            return _str ? JSON.parse(_str, reviver) : {};
        } catch (e) {
            console.warn('JSON.parse()解析配置文件异常');
            console.warn('尝试查找并修复异常的转义字符');

            let _backslash_rex = /[ntrfb\\'"0xu]/;
            let _str_new = '';

            for (let i in _str) {
                let _i = +i;
                let _s = _str[_i];
                if (_s === '\\') {
                    let _prev_s = _str[_i - 1];
                    let _next_s = _str[_i + 1];
                    if (_prev_s && _next_s) {
                        if (_prev_s !== '\\') {
                            if (!_next_s.match(_backslash_rex)) {
                                _s += '\\';
                            }
                        }
                    }
                }
                _str_new += _s;
            }

            try {
                let _res = JSON.parse(_str_new, reviver);
                console.info('修复成功');
                files.write(_full_path, _str_new);
                console.info('已重新写入修复后的数据');
                return _res;
            } catch (e) {
                let _new_file_name = name + '.nfe.' + Date.now() + '.bak';

                files.rename(_full_path, _new_file_name);
                console.error('修复失败');
                console.warn('已将损坏的配置文件备份至');
                console.warn(_dir + _new_file_name);
                console.warn('以供手动排查配置文件中的问题');

                throw Error(e);
            }
        }
    }
}