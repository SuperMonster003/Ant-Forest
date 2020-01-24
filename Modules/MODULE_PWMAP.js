/**
 * @description
 * Module for encrypting/decrypting string
 * according to "PWMAP" file
 *
 * @example
 * let pwmap = require("./Modules/MODULE_PWMAP");
 * let encrypt = pwmap.encrypt;
 * let decrypt = pwmap.decrypt;
 * // input manually
 * encrypt();
 * // with parameter
 * encrypt("12345");
 * // decrypt manually
 * decrypt();
 * // array string
 * decrypt("['xxx', 'yyy']");
 * // string array
 * decrypt(['xxx', 'yyy']);
 * // generate or regenerate "PWMAP" file
 * // use with caution
 * pwmap.generate();
 *
 * @functions generate|encrypt|decrypt
 *
 * @since Jan 21, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

module.exports = _exports();

/**
 * @returns {{
 *   encrypt: (function([string]): string),
 *   decrypt: (function([string|array]): string),
 *   generate: (function(): void),
 * }}
 */
function _exports() {
    let _path = "";
    let _dic = {};
    let _cfg = {
        // {SCPrMtaB:"A"}
        code_length: 8,
        // {1:"A",2:"A", ... 10:"A"}
        code_amount: 10,
        separator: "_.|._",
        encrypt_power: 2,
    };
    let $_nul = x => x === null;
    let $_und = x => typeof x === "undefined";
    let $_str = x => typeof x === "string";

    return {
        encrypt: _encrypt,
        decrypt: _decrypt,
        generate: _generate,
    };

    // main function(s) //

    function _encrypt(input) {
        _initDic();
        let _empty = !arguments.length;
        let _input = _empty && _userInput(0) || input;
        let _pwr = Math.min(_cfg.encrypt_power, 2) || 1;
        let _rex = /[A-Za-z0-9`~!@#$%^&*()_+=\-\[\]}{'\\;:\/?.>,<| ]/;

        let _thd_mon = _thdMonitor(0);
        let _encrypted = _enc(_input);
        while (--_pwr) {
            _input = _encrypted.join(_cfg.separator);
            _encrypted = _enc(_input);
        }
        _thd_mon.interrupt();

        let _raw = _encrypted.map((s) => '"' + s + '"');
        let _res = "[" + _raw + "]";
        if (_empty) {
            global["setClip"](_res);
            toast("密文数组已复制剪切板");
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
                    let _sglStr = s => {
                        let _cc = s.charCodeAt(0);
                        let _cc_hex = _cc.toString(16);
                        return _cc_hex.toUpperCase();
                    };
                    let _tmp = "";
                    _s.split("").forEach((s, i) => {
                        _tmp += (i ? "|" : "") + _sglStr(s);
                    });
                    let _raw = "\\u" + _tmp.split("|").map((s) => {
                        return ("0000" + s).slice(-4);
                    }).join("\\u");
                    _res = _res.concat(_enc(_raw));
                }
            }
            return _res;
        }

        function _rand(str) {
            let _tmp = [];
            for (let k in _dic) {
                if (_dic.hasOwnProperty(k)) {
                    _dic[k] === str && _tmp.push(k);
                }
            }
            let _num = Math.random() * _cfg.code_amount;
            return _tmp[Math.trunc(_num)];
        }
    }

    function _decrypt(input) {
        _initDic();
        let _empty = !arguments.length;
        let _input = _empty && _userInput(1) || input;
        let _thd_mon = _thdMonitor(1);
        let _decrypted = _dec(_input);
        _thd_mon.interrupt();
        if (_empty) {
            global["setClip"](_decrypted);
            toast("解密字符串已复制剪切板");
        }
        return _decrypted;

        // tool function(s) //

        function _dec(arr) {
            if ($_und(arr)) {
                return "";
            }
            if ($_nul(arr)) {
                return null;
            }
            if ($_str(arr)) {
                if (!arr.length) {
                    return "";
                }
                if (arr[0] !== "[") {
                    toast("输入的加密字符串不合法");
                    exit();
                }
                let _raw = arr.slice(1, -1).split(/, ?/);
                arr = _raw.map((s) => {
                    return s.replace(/^"([^]+)"$/g, "$1");
                });
            }

            let _shift = 0;
            let _res = "";
            let _sep = _cfg.separator;
            while (1) {
                let _len = arr.length;
                for (let i = 0; i < _len; i += 1) {
                    if (_shift) {
                        i += _shift;
                        _shift = 0;
                        continue;
                    }
                    let _di = _dic[arr[i]];
                    let _dj = _dic[arr[i + 1]];
                    if ($_und(_di)) {
                        return "";
                    }
                    if (_di === "\\" && _dj === "u") {
                        let _tmp = "";
                        for (let j = 0; j < 4; j += 1) {
                            _tmp += _dic[arr[i + j + 2]];
                        }
                        _res += unescape("%u" + _tmp);
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
                _res = "";
            }
            return _res;
        }
    }

    function _generate() {
        if (files.exists(_path)) {
            confirm(
                "密文文件已存在\n" +
                "继续操作将覆盖已有文件\n" +
                "新的密文文件生成后\n" +
                "涉及密文的全部相关代码\n" +
                "均需重新设置才能解密\n" +
                "确定要继续吗?"
            ) || exit();
        }

        files.createWithDirs(_path);
        files.open(_path);

        // eg: {SCPrMtaB:"A",doaAisDd:"%"}
        let _res = {};
        let _az = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
        let _all = "~!@#$%^&*`'-_+=,./ 0123456789:;?()[]<>{}|" + "\"\\" + _az;
        let _randAz = () => _az[Math.trunc(Math.random() * _az.length)];
        let _li = _all.length;
        let _lj = _cfg.code_amount;
        let _lk = _cfg.code_length;
        for (let i = 0; i < _li; i += 1) {
            for (let j = 0; j < _lj; j += 1) {
                let _code = "";
                for (let k = 0; k < _lk; k += 1) {
                    _code += _randAz();
                }
                _res[_code] = _all[i];
            }
        }
        files.write(_path, JSON.stringify(_res));
        toast("密文文件生成完毕");
    }

    // tool function(s) //

    function _initDic() {
        let _root = files.getSdcardPath();
        _path = _root + "/.local/PWMAP.txt";
        if (!files.exists(_path)) {
            _showMsg();
            _generate();
        }
        _dic = JSON.parse(files.read(_path));

        // tool function(s) //

        function _showMsg() {
            let _s = "已生成新密文字典";

            _splitLine();
            global["toastLog"](_s);
            _splitLine();

            // tool function(s) //

            function _splitLine() {
                let [_ln, _i] = ["", 33];
                while (_i--) _ln += "-";
                console.log(_ln);
            }
        }
    }

    function _userInput(dec) {
        let _inp = "";
        let _max = 20;
        let _msg = dec ?
            "请输入要解密的字符串数组" :
            "请输入要加密的字符串";
        while (_max--) {
            _inp = dialogs.rawInput(
                "请输入要" + _msg + "的字符串\n" +
                "点击其他区域放弃输入"
            );
            if (_inp) {
                break;
            }
            if ($_nul(_inp)) {
                exit();
            }
            toast("输入内容无效");
        }
        if (_max >= 0) {
            return _inp;
        }
        toast("已达最大尝试次数");
        exit();
    }

    function _thdMonitor(dec) {
        return threads.start(function () {
            let _msg = dec ?
                "正在解密中 请稍候..." :
                "正在加密中 请稍候...";
            sleep(2400);
            let _ctr = 0;
            while (1) {
                if (!(_ctr++ % 5)) {
                    toast(_msg);
                }
                sleep(1000);
            }
        });
    }
}