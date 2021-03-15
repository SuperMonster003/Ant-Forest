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
    let _readFile = () => {
        let _file = files.open(_full_path, 'r');
        let _content = _file.read();
        _file.close();
        return _content;
    };

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

        let _old = {};
        let _tmp = {};

        try {
            _old = _jsonParseFile(_reviver);
        } catch (e) {
            console.warn(e.message);
        }

        let _cA = _classof(new_val, 'Object');
        let _cB = _classof(_old[key], 'Object');
        let _both_type_o = _cA && _cB;
        let _keyLen = () => Object.keys(new_val).length;

        if (!forc && _both_type_o && _keyLen()) {
            _tmp[key] = Object.assign(
                _old[key], new_val
            );
        } else {
            _tmp[key] = new_val;
        }

        let _file = files.open(_full_path, 'w');
        _file.write(JSON.stringify(Object.assign(_old, _tmp), _replacer));
        _file.close();
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
            let _file = files.open(_full_path, 'w');
            _file.write(JSON.stringify(_o));
            _file.close();
            delete _o[key];
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
        }
        try {
            return _tryRepairEscChar(_str, reviver);
        } catch (e) {
            console.warn('转义字符修复失败');
        }
        try {
            return _tryRepairMojibakeLines(_str, reviver);
        } catch (e) {
            console.warn('乱码行修复失败');
        }
        throw _failAndBackup();
    }

    function _tryRepairEscChar(str, reviver) {
        console.warn('尝试查找并修复异常的转义字符');

        let _rex = /[ntrfb\\'"0xu]/;
        let _str_new = '';

        for (let i in str) {
            let _i = +i;
            let _s = str[_i];
            if (_s === '\\') {
                let _prev = str[_i - 1];
                let _next = str[_i + 1];
                if (_prev && _next) {
                    if (_prev !== '\\' && !_next.match(_rex)) {
                        _s += '\\';
                    }
                }
            }
            _str_new += _s;
        }

        let _res = JSON.parse(_str_new, reviver);
        console.info('修复成功');

        let _file = files.open(_full_path, 'w');
        _file.write(_str_new);
        console.info('已重新写入修复后的数据');

        _file.close();
        return _res;
    }

    function _tryRepairMojibakeLines(str, reviver) {
        console.warn('尝试查找并修复异常的乱码行');

        let _split = str.split('\n');

        let _len = _split.length;
        while (_len-- > 1) {
            try {
                let _a = _split.slice(0, _len - 1);
                let _b = _split.slice(_len + 1);
                let _str_new = _a.concat(_b).join('\n');
                let _res = JSON.parse(_str_new, reviver);
                console.info('修复成功');

                let _file = files.open(_full_path, 'w');
                _file.write(_str_new);
                console.info('已重新写入修复后的数据');

                _file.close();
                return _res;
            } catch (e) {
                // nothing to do here
            }
        }
        throw Error(_tryRepairMojibakeLines.name);
    }

    function _failAndBackup() {
        let _new_file_name = name + '.nfe.' + Date.now() + '.bak';

        files.rename(_full_path, _new_file_name);
        console.error('修复失败');
        console.warn('已将损坏的配置文件备份至');
        console.warn(_dir + _new_file_name);
        console.warn('以供手动排查配置文件中的问题');

        return Error('JSON.parse() failed in mod-storage');
    }
}