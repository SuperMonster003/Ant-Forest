let {
    isNullish, isPlainObject,
} = require('./mod-global');
let {filesx} = require('./ext-files');
let {cryptox} = require('./ext-crypto');

let Storage = function StorageConstructor$iiFe() {
    let _ = {
        parseFile(path) {
            let _str = filesx.read(path, '');
            try {
                return _str ? JSON.parse(_str, filesx.json.reviver) : {};
            } catch (e) {
                console.warn('JSON.parse()解析配置文件异常');
            }
            try {
                return this.tryRepairEscChar(path, _str);
            } catch (e) {
                console.warn('转义字符修复失败');
            }
            try {
                return this.tryRepairMojibakeLines(path, _str);
            } catch (e) {
                console.warn('乱码行修复失败');
            }
            this.failAndBackup(path);
        },
        /**
         * @param {string} path
         * @param {string} str
         * @return {any}
         */
        tryRepairEscChar(path, str) {
            console.warn('尝试查找并修复异常的转义字符');

            let _rex = /[ntrfb\\'"0xu]/;
            let _str_new = '';

            for (let i in str) {
                let _i = +i;
                let _s = str[_i];
                if (_s === '\\') {
                    let _prev = str[_i - 1];
                    let _next = str[_i + 1];
                    if (_prev && _next && _prev !== '\\' && !_next.match(_rex)) {
                        _s += '\\';
                    }
                }
                _str_new += _s;
            }

            return this.writeBackFileAndParse(path, _str_new);
        },
        /**
         * @param {string} path
         * @param {string} str
         * @return {any}
         */
        tryRepairMojibakeLines(path, str) {
            console.warn('尝试查找并修复异常的乱码行');

            let _split = str.split('\n');

            while (_split.length > 0) {
                try {
                    _split.pop();
                    return this.writeBackFileAndParse(path, _split.join('\n'));
                } catch (e) {
                    // nothing to do here
                }
            }
            throw Error('Failed to repair mojibake lines');
        },
        /**
         * @param {string} path
         * @param {string} str
         * @return {any}
         */
        writeBackFileAndParse(path, str) {
            let _res = JSON.parse(str, filesx.json.reviver);
            console.info('修复成功');

            filesx.write(path, str);
            console.info('已重新写入修复后的数据');

            return _res;
        },
        failAndBackup(path) {
            let _new_file_name = files.getName(path) + '.' + Date.now() + '.bak';

            files.rename(path, _new_file_name);
            console.error('修复失败');
            console.warn('已将损坏的配置文件备份至');
            console.warn(files.join(filesx['.local'](), _new_file_name));
            console.warn('以供手动排查配置文件中的问题');

            throw Error('JSON.parse() failed in ext-storages');
        },
        getKeyInput() {
            let _path = files.join(filesx['.local'](), 'key.nfex');
            let _input = filesx.readJson(_path, {});
            if (!_input.af) {
                _input.af = cryptox.generateRandomKeyInput();
                filesx.writeJson(_path, _input);
            }
            return _input.af;
        },
        /**
         * @param {any} data
         * @return {string}
         */
        encrypt(data) {
            if (isNullish(data)) {
                throw TypeError('Nullish typed value cannot be encrypted');
            }
            return cryptox.enc(data.toString(), this.getKeyInput());
        },
        /**
         * @param {any} data
         * @return {string}
         */
        decrypt(data) {
            if (isNullish(data)) {
                throw TypeError('Non-string typed value cannot be decrypted');
            }
            return cryptox.dec(data.toString(), this.getKeyInput());
        },
        reEncryptFromLegacyFile(path) {
            let _parsed = this.parseFile(path);
            let _reEncObject = (o) => {
                Object.keys(o).forEach(k => o[k] = _reEnc(o[k]));
                return o;
            };
            let _reEnc = (o) => {
                if (isPlainObject(o)) {
                    return _reEncObject(o);
                }
                if (typeof o === 'string') {
                    if (o.startsWith('[') && o.endsWith(']')) {
                        let _decrypted = cryptox._pwmap.decrypt(o);
                        if (!isNullish(_decrypted)) {
                            return this.encrypt(_decrypted);
                        }
                    }
                }
                return o;
            };
            filesx.writeJson(path, _reEnc(_parsed));
        },
    };

    /**
     * @alias ModuleStoragesx
     * @param {string} name
     * @constructor
     */
    let Storage = function (name) {
        this.name = name;
        this.dir = filesx['.local']();
        this.path_legacy = files.join(this.dir, this.name + '.nfe');
        this.path = this.path_legacy + 'x';

        if (!files.exists(this.path)) {
            if (files.exists(this.path_legacy)) {
                files.copy(this.path_legacy, this.path);
                _.reEncryptFromLegacyFile(this.path);
            } else {
                files.createWithDirs(this.path);
            }
        }
    };

    Storage.prototype = {
        constructor: Storage,
        /**
         * @param {string} key
         * @return {boolean}
         */
        contains(key) {
            return key in _.parseFile(this.path);
        },
        /**
         * @param {string} key
         * @param {any} new_val
         * @param {Object} [options]
         * @param {boolean} [options.is_forcible=false]
         * @param {boolean} [options.is_crypto=false]
         */
        put(key, new_val, options) {
            if (typeof new_val === 'undefined') {
                let _m = '"put" value can\'t be undefined';
                throw new TypeError(_m);
            }

            let _val = {};
            let _tmp = {};
            let _opt = options || {};
            let _enc = v => _.encrypt(JSON.stringify(v, filesx.json.replacer));
            let _encodeIFN = (o) => {
                if (!_opt.is_crypto) {
                    return o;
                }
                if (!isPlainObject(o) || _opt.is_forcible) {
                    return _enc(o);
                }
                let _o = {};
                Object.keys(o).forEach(k => _o[k] = _enc(o[k]));
                return _o;
            };

            try {
                _val = _.parseFile(this.path);
            } catch (e) {
                console.warn(e.message);
            }

            if (!_opt.is_forcible
                && isPlainObject(new_val)
                && isPlainObject(_val[key])
                && Object.keys(new_val).length > 0
            ) {
                _tmp[key] = Object.assign(_val[key], _encodeIFN(new_val));
            } else {
                _tmp[key] = _encodeIFN(new_val);
            }

            Object.assign(_val, _tmp);

            filesx.writeJson(this.path, _val);
        },
        /**
         * @param {string} key
         * @param {any|Storagesx.Get.Options} [def_value]
         * @param {Storagesx.Get.Options} [options]
         * @return {any}
         */
        get(key, def_value, options) {
            if (options === undefined && typeof def_value === 'object') {
                /** @type {(keyof Storagesx.Get.Options)[]} */
                let _smp = ['default', 'prop', 'is_crypto'];
                let _keys = Object.keys(def_value);
                if (_smp.some(k => _keys.indexOf(k) > -1)) {
                    return this.get(key, def_value.default, def_value);
                }
            }
            let _o = _.parseFile(this.path);
            let _opt = options || {};
            if (_o && key in _o) {
                let _res = _o[key];
                if (_opt.prop !== undefined) {
                    if (Array.isArray(_opt.prop)) {
                        _opt.prop.forEach(k => _res = _res[k]);
                    } else {
                        _res = _res[_opt.prop];
                    }
                }
                if (isNullish(_res)) {
                    return _res;
                }
                if (_opt.is_crypto) {
                    let _decrypted = _.decrypt(_res);
                    try {
                        return JSON.parse(_decrypted, filesx.json.reviver);
                    } catch (e /*  SyntaxError: Unexpected token... */) {
                        return _decrypted;
                    }
                }
                return _res;
            }
            return _opt.default !== undefined ? _opt.default : def_value;
        },
        /**
         * @param {string} key
         */
        remove(key) {
            let _o = _.parseFile(this.path);
            if (key in _o) {
                delete _o[key];
                filesx.writeJson(this.path, _o);
            }
        },
        clear() {
            files.remove(this.path);
        },
    };

    return Storage;
}();

let exp = {
    '@default': require('../assets/data/default-config'),
    get af() {
        return this._af = this._af || this.create('af');
    },
    get af_auto() {
        return this._af_auto = this._af_auto || this.create('af_auto');
    },
    get af_bak() {
        return this._af_bak = this._af_bak || this.create('af_bak');
    },
    get af_blist() {
        return this._af_blist = this._af_blist || this.create('af_blist');
    },
    get af_cfg() {
        return this._af_cfg = this._af_cfg || this.create('af_cfg');
    },
    get af_flist() {
        return this._af_flist = this._af_flist || this.create('af_flist');
    },
    get af_ins() {
        return this._af_ins = this._af_ins || this.create('af_ins');
    },
    get unlock() {
        return this._unlock = this._unlock || this.create('unlock');
    },
    /**
     * @param {'af_auto'|'af_bak'|'af_blist'|'af_cfg'|'af_flist'|'af_ins'|'af'|'unlock'|string} name
     * @return {ModuleStoragesx}
     */
    create(name) {
        return new Storage(name);
    },
    /**
     * @param {string} name
     */
    remove(name) {
        this.create(name).clear();
    },
};

module.exports = {storagesx: exp};