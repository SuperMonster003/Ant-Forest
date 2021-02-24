/**
 * Module for encrypting/decrypting string according to 'PWMAP' file
 * @example
 * let pwmap = require('./modules/mod-pwmap');
 * let encrypt = pwmap.encrypt;
 * let decrypt = pwmap.decrypt;
 * // input manually
 * encrypt();
 * // with parameter
 * encrypt('12345');
 * // decrypt manually
 * decrypt();
 * // array string
 * decrypt('['xxx', 'yyy']');
 * // string array
 * decrypt(['xxx', 'yyy']);
 * // generate or regenerate 'PWMAP' file
 * // use with caution
 * pwmap.generate();
 * @since Nov 5, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

let _path = '';
let _dic = {};
let _cfg = {
    code_length: 8, // {SCPrMtaB:'A'}
    code_amount: 10, // {1:'A',2:'A', ... 10:'A'}
    separator: '_.|._',
    encrypt_power: 2,
};

module.exports = {
    encrypt: _encrypt,
    decrypt: _decrypt,
    generate: _generate,
};

// main function(s) //

function _encrypt(input) {
    _initDic();
    let _input = arguments.length ? input : _userInput('enc');
    let _pwr = Math.max(Math.min(_cfg.encrypt_power, 2), 1);
    let _rex = /[A-Za-z0-9`~!@#$%^&*()_+=\-[\]}{'\\;:/?.>,<| ]/;

    let _thd_mon = _thdMonitor('enc');
    let _encrypted = _enc(_input);
    while (--_pwr) {
        _input = _encrypted.join(_cfg.separator);
        _encrypted = _enc(_input);
    }
    _thd_mon.interrupt();

    let _res = '[' + _encrypted.map((s) => '"' + s + '"') + ']';
    if (!arguments.length) {
        global['setClip'](_res);
        toast('密文数组已复制剪切板');
    }
    return _res;

    // tool function(s) //

    function _enc(str) {
        let _res = [];
        let _str = str.toString();
        let _len = _str.length;
        for (let i = 0; i < _len; i += 1) {
            let _s = _str[i];
            if (_s.match(_rex)) {
                _res.push(_rand(_s));
            } else {
                let _toHex = s => s.charCodeAt(0).toString(16).toUpperCase();
                let _tmp = '';
                _s.split('').forEach((s, i) => _tmp += (i ? '|' : '') + _toHex(s));
                _res.push(_enc('\\u' + _tmp.split('|').map(s => ('0000' + s).slice(-4)).join('\\u')));
            }
        }
        return _res;
    }

    function _rand(str) {
        let _tmp = [];
        Object.keys(_dic).forEach(k => _dic[k] === str && _tmp.push(k));
        return _tmp[Math.trunc(Math.random() * _cfg.code_amount)];
    }
}

function _decrypt(input) {
    _initDic();
    let _input = arguments.length ? input : _userInput('dec');
    let _thd_mon = _thdMonitor('dec');
    let _decrypted = _dec(_input);
    _thd_mon.interrupt();
    if (!arguments.length) {
        global['setClip'](_decrypted);
        toast('解密字符串已复制剪切板');
    }
    return _decrypted;

    // tool function(s) //

    function _dec(arr) {
        arr = typeof arr === 'string' ? arr : '';

        if (!arr.length) {
            return '';
        }
        if (arr[0] !== '[') {
            toast('输入的加密字符串不合法');
            exit();
        }
        arr = arr.slice(1, -1).split(/, ?/).map(s => s.replace(/^"([^]+)"$/g, '$1'));

        let _shift = 0;
        let _res = '';
        let _sep = _cfg.separator;
        while (1) {
            for (let i = 0; i < arr.length; i += 1) {
                if (_shift) {
                    i += _shift;
                    _shift = 0;
                    continue;
                }
                let _di = _dic[arr[i]];
                let _dj = _dic[arr[i + 1]];
                if (_di === undefined) {
                    return '';
                }
                if (_di === '\\' && _dj === 'u') {
                    let _tmp = '';
                    for (let j = 0; j < 4; j += 1) {
                        _tmp += _dic[arr[i + j + 2]];
                    }
                    _res += String.fromCharCode(parseInt(_tmp, 16));
                    _shift = 4;
                } else {
                    _res += _di;
                }
            }
            if (!~_res.indexOf(_sep)) {
                let _try_dec = _dec([_res]);
                if (_try_dec) {
                    return _try_dec;
                }
                break;
            }
            arr = _res.split(_sep);
            _res = '';
        }
        return _res;
    }
}

function _generate() {
    if (files.exists(_path)) {
        confirm(
            '密文文件已存在\n继续操作将覆盖已有文件\n' +
            '新的密文文件生成后\n涉及密文的全部相关代码\n均需重新设置才能解密\n' +
            '确定要继续吗?'
        ) || exit();
    }

    files.createWithDirs(_path);

    // eg: {SCPrMtaB:'A',doaAisDd:'%'}
    let _res = {};
    let _az = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
    let _all = '~!@#$%^&*`\'-_+=,./ 0123456789:;?()[]<>{}|' + '"\\' + _az;
    let _randAz = () => _az[Math.trunc(Math.random() * _az.length)];
    let _li = _all.length;
    let _lj = _cfg.code_amount;
    let _lk = _cfg.code_length;
    for (let i = 0; i < _li; i += 1) {
        for (let j = 0; j < _lj; j += 1) {
            let _code = '';
            for (let k = 0; k < _lk; k += 1) {
                _code += _randAz();
            }
            _res[_code] = _all[i];
        }
    }
    files.write(_path, JSON.stringify(_res));
    toast('密文文件生成完毕');
}

// tool function(s) //

function _initDic() {
    _path = files.getSdcardPath() + '/.local/PWMAP.txt';
    if (!files.exists(_path)) {
        console.log('-'.repeat(33));
        toastLog('已生成新密文字典');
        console.log('-'.repeat(33));
        _generate();
    }
    _dic = JSON.parse(files.read(_path));
}

function _userInput(opr) {
    let _inp = '';
    let _max = 20;
    let _msg = opr.match(/^dec/) ?
        '请输入要解密的字符串数组' :
        '请输入要加密的字符串';
    while (_max--) {
        _inp = dialogs.rawInput(_msg + '\n点击其他区域放弃输入');
        if (_inp) {
            return _inp;
        }
        _inp === null ? exit() : toast('输入内容无效');
    }
    toast('已达最大尝试次数');
    exit();
}

function _thdMonitor(opr) {
    return threads.start(function () {
        let _ctr = 0;
        sleep(2.4e3);
        while (1) {
            _ctr++ % 5 || toast('正在' + (opr.match(/^dec/) ? '解密' : '加密') + '中 请稍候...');
            sleep(1e3);
        }
    });
}