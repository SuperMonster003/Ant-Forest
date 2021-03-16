/**
 * Module for unlocking device automatically
 * @example
 * require('./mod-unlock').unlock();
 * // forcibly enable debugInfo() for showing debug logs in console
 * require('./mod-unlock').unlock(true);
 * // forcibly disable debugInfo() for not showing debug logs in console
 * require('./mod-unlock').unlock(false);
 * @since Mar 1, 2021
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

require('./ext-app').load();
require('./ext-device').load();
require('./mod-monster-func').load();

!function () {
    let _init_scr = devicex.isScreenOn();
    let _init_unlk = _isUnlk();

    let $_und = x => typeof x === 'undefined';
    let $_nul = x => x === null;
    let $_func = x => typeof x === 'function';
    let $_num = x => typeof x === 'number';
    let $_str = x => typeof x === 'string';
    let $_rex = x => x instanceof RegExp;
    let $_arr = x => Array.isArray(x);
    let $_flag = global.$$flag = global.$$flag || {};

    let $_sel = getSelector();
    let $_unlk = _unlkSetter();

    let _def = {
        // updated: Mar 1, 2021
        unlock_code: null,
        unlock_max_try_times: 20,
        unlock_pattern_strategy: 'segmental',
        unlock_pattern_size: 3,
        unlock_pattern_swipe_time_segmental: 120,
        unlock_pattern_swipe_time_solid: 200,
        unlock_dismiss_layer_strategy: 'preferred',
        unlock_dismiss_layer_bottom: 0.8,
        unlock_dismiss_layer_top: 0.2,
        unlock_dismiss_layer_swipe_time: 110,
    };
    let _sto = require('./mod-storage').create('unlock');
    let _cfg = Object.assign({}, _def, _sto.get('config'));
    let _pwmap = (() => {
        let _path = '';
        let _dic = {};
        let _cfg = {
            // {SCPrMtaB:'A'}
            code_length: 8,
            // {1:'A',2:'A', ... 10:'A'}
            code_amount: 10,
            separator: '_.|._',
            encrypt_power: 2,
        };

        return {
            decrypt: _decrypt,
            generate: _generate,
        };

        // main function(s) //

        function _decrypt(input) {
            _initDic();
            let _empty = !arguments.length;
            let _input = _empty && _userInput(1) || input;
            let _thd_mon = _thdMonitor(1);
            let _decrypted = _dec(_input);
            _thd_mon.interrupt();
            if (_empty) {
                setClip(_decrypted);
                toast('解密字符串已复制剪切板');
            }
            return _decrypted;

            // tool function(s) //

            function _dec(arr) {
                if ($_und(arr)) {
                    return '';
                }
                if ($_nul(arr)) {
                    return null;
                }
                if ($_str(arr)) {
                    if (!arr.length) {
                        return '';
                    }
                    if (arr[0] !== '[') {
                        toast('输入的加密字符串不合法');
                        exit();
                    }
                    let _raw = arr.slice(1, -1).split(/, ?/);
                    arr = _raw.map((s) => {
                        return s.replace(/^"([^]+)"$/g, '$1');
                    });
                }

                let _shift = 0;
                let _res = '';
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
                            return '';
                        }
                        if (_di === '\\' && _dj === 'u') {
                            let _tmp = '';
                            for (let j = 0; j < 4; j += 1) {
                                _tmp += _dic[arr[i + j + 2]];
                            }
                            _res += String.fromCharCode(
                                parseInt(_tmp, 16)
                            );
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
                    '密文文件已存在\n' +
                    '继续操作将覆盖已有文件\n' +
                    '新的密文文件生成后\n' +
                    '涉及密文的全部相关代码\n' +
                    '均需重新设置才能解密\n' +
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
            let _file = files.open(_path, 'w');
            _file.write(JSON.stringify(_res));
            _file.close();
            toast('密文文件生成完毕');
        }

        // tool function(s) //

        function _initDic() {
            let _root = files.getSdcardPath();
            _path = _root + '/.local/PWMAP.txt';
            if (!files.exists(_path)) {
                _showMsg();
                _generate();
            }
            let _file = files.open(_path, 'r');
            _dic = JSON.parse(_file.read());
            _file.close();

            // tool function(s) //

            function _showMsg() {
                let _s = '已生成新密文字典';

                _splitLine();
                toastLog(_s);
                _splitLine();

                // tool function(s) //

                function _splitLine() {
                    let [_ln, _i] = ['', 33];
                    while (_i--) _ln += '-';
                    console.log(_ln);
                }
            }
        }

        function _userInput(dec) {
            let _inp = '';
            let _max = 20;
            let _msg = dec ?
                '请输入要解密的字符串数组' :
                '请输入要加密的字符串';
            while (_max--) {
                _inp = dialogs.rawInput(
                    '请输入要' + _msg + '的字符串\n' +
                    '点击其他区域放弃输入'
                );
                if (_inp) {
                    break;
                }
                if ($_nul(_inp)) {
                    exit();
                }
                toast('输入内容无效');
            }
            if (_max >= 0) {
                return _inp;
            }
            toast('已达最大尝试次数');
            exit();
        }

        function _thdMonitor(dec) {
            return threads.start(function () {
                let _msg = dec
                    ? '正在解密中 请稍候...'
                    : '正在加密中 请稍候...';
                sleep(2.4e3);
                let _ctr = 0;
                while (1) {
                    _ctr++ % 5 || toast(_msg);
                    sleep(1e3);
                }
            });
        }
    })();

    let _intro = device.brand + ' ' + device.product + ' ' + device.release;
    let _code = _pwmap.decrypt(_cfg.unlock_code) || '';
    let _clean_code = _code.split(/\D+/).join('').split('');
    let _max_try = _cfg.unlock_max_try_times;
    let _pat_sz = _cfg.unlock_pattern_size;
    let _has_root = appx.hasRoot();

    typeof module === 'undefined' ? _execute() : _export();

    // tool function(s) //

    function _err(s) {
        devicex.cancelOn();
        messageAction('解锁失败', 4, 1, 0, -1);

        ($_str(s) ? [s] : s).forEach(m => messageAction(m, 4, 0, 1));
        messageAction(_intro, 4, 0, 1, 1);

        captureErrScreen('unlock_failed', {log_level: 1});

        if ($_unlk.init_scr) {
            messageAction('自动关闭屏幕' + (keycode(26) ? '' : '失败'), 1, 0, 0, 1);
        }

        exit();
        sleep(3.6e3);

        // tool function(s) //

        /**
         * Save current screen capture as a file with a key name and a formatted timestamp
         * @param {string} key_name - a key name as a clip of the file name
         * @param {{}} [options]
         * @param {number|string|null} [options.log_level]
         * @param {number} [options.max_samples=10]
         */
        function captureErrScreen(key_name, options) {
            if (typeof imagesx === 'object') {
                imagesx.permit();
            } else if (!global._$_request_screen_capture) {
                images.requestScreenCapture();
                global._$_request_screen_capture = true;
            }

            let _opt = options || {};
            let _log_lv = _opt.log_level;
            let _max_smp = _opt.max_samples || 10;

            let _dir = files.getSdcardPath() + '/.local/pics/err/';
            let _path = _dir + key_name + '_' + _getTimeStr() + '.png';

            try {
                files.createWithDirs(_path);
                images.captureScreen(_path);
                if (_log_lv !== null && _log_lv !== undefined) {
                    messageAction('已存储屏幕截图文件:', _log_lv);
                    messageAction(_path, _log_lv);
                }
                _removeRedundant();
            } catch (e) {
                messageAction(e.message, 3);
            }

            // tool function(s) //

            function _getTimeStr() {
                let _now = new Date();
                let _pad = n => (n < 10 ? '0' : '') + n;
                return _now.getFullYear() +
                    _pad(_now.getMonth() + 1) +
                    _pad(_now.getDate()) +
                    _pad(_now.getHours()) +
                    _pad(_now.getMinutes()) +
                    _pad(_now.getSeconds());
            }

            function _removeRedundant() {
                files.listDir(_dir, function (name) {
                    return !!~name.indexOf(key_name);
                }).sort((a, b) => {
                    return a === b ? 0 : a > b ? -1 : 1;
                }).slice(_max_smp).forEach((name) => {
                    files.remove(_dir + name);
                });
            }
        }
    }

    function _isUnlk() {
        return !context.getSystemService(context.KEYGUARD_SERVICE).isKeyguardLocked();
    }

    function _wakeUpIFN() {
        if (!devicex.isScreenOn()) {
            let _ctr = 0, _max = 4;
            while (1) {
                _debugAct('唤起设备', _ctr, _max);

                devicex.wakeUp();

                if (waitForAction(devicex.isScreenOn, 1.5e3)) {
                    device.keepScreenOn(2 * 60e3);
                    break;
                }
                if (++_ctr > _max) {
                    return _err('设备唤起失败');
                }
            }
            debugInfo('设备唤起成功');
        }
    }

    function _unlkSetter() {
        let _as = 'com\\.android\\.systemui:id/';
        let _ak = 'com\\.android\\.keyguard:id/';
        let _sk = 'com\\.smartisanos\\.keyguard:id/';

        return {
            init_scr: _init_scr,
            init_unlk: _init_unlk,
            prev_cntr: {
                trigger() {
                    _wakeUpIFN();
                    _disturbance();

                    return _checkStrategy() && [{
                        desc: '通用',
                        sel: idMatches(_as + 'preview_container'),
                    }, {
                        desc: 'EMUI',
                        sel: idMatches(_as + '.*(keyguard|lock)_indication.*'),
                    }, {
                        desc: '锤子科技',
                        sel: idMatches(_sk + 'keyguard_(content|.*view)'),
                    }, {
                        desc: 'MIUI',
                        sel: idMatches(_ak + '(.*unlock_screen.*|.*notification_.*(container|view).*|dot_digital)'),
                    }, {
                        desc: 'MIUI10',
                        sel: idMatches(_as + '(.*lock_screen_container|notification_(container|panel).*|keyguard_.*)'),
                    }, {
                        sel: $_sel.pickup(/上滑.{0,4}解锁/, 'selector'),
                    }].some((smp) => {
                        let {desc: _desc, sel: _sel} = smp;
                        if (_sel instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                            if (_sel.exists()) {
                                if (_desc) {
                                    debugInfo('匹配到' + _desc + '解锁提示层控件');
                                } else {
                                    debugInfo('匹配到解锁提示层文字:');
                                    debugInfo($_sel.pickup(_sel, 'txt'));
                                }
                                return (this.trigger = _sel.exists.bind(_sel))();
                            }
                        }
                    });

                    // tool function(s) //

                    function _disturbance() {
                        [{
                            desc: 'QQ锁屏消息弹框控件',
                            trigger() {
                                return $_sel.pickup('按住录音')
                                    || $_sel.pickup(idMatches(/com.tencent.mobileqq:id.+/));
                            },
                            handle() {
                                clickAction($_sel.pickup('关闭'), 'w');
                                let _cond = this.trigger.bind(this);
                                waitForAction(_cond, 3e3)
                                    ? debugInfo('关闭弹框控件成功')
                                    : debugInfo('关闭弹框控件超时', 3);
                            },
                        }].forEach((o) => {
                            if (o.trigger()) {
                                debugInfo(['检测到提示层页面干扰:', o.desc]);
                                o.handle();
                            }
                        });
                    }

                    function _checkStrategy() {
                        let _stg = _cfg.unlock_dismiss_layer_strategy;
                        if (_stg === 'preferred') {
                            return true;
                        }
                        if (_stg === 'disabled') {
                            if (!$_flag.unlock_dismiss_layer_disabled_hinted) {
                                debugInfo('解锁页面提示层检测已禁用');
                                $_flag.unlock_dismiss_layer_disabled_hinted = true;
                            }
                            return false;
                        }
                        if (_stg === 'deferred') {
                            if (!$_flag.unlock_dismiss_layer_deferred) {
                                debugInfo('解锁页面提示层检测延迟一次');
                                $_flag.unlock_dismiss_layer_deferred = true;
                                return false;
                            }
                            return true;
                        }
                        throw Error('Unknown unlock dismiss layer strategy: ' + _stg);
                    }
                },
                dismiss() {
                    let _this = this;
                    let _btm = _cfg.unlock_dismiss_layer_bottom;
                    let _top = _cfg.unlock_dismiss_layer_top;
                    let _time_sto = _cfg.unlock_dismiss_layer_swipe_time;
                    let _from_sto = !!_time_sto;
                    let _pts = [_btm, _top];
                    let _time = _time_sto; // copy
                    /** @type {number[]} */
                    let _reliable = _cfg.swipe_time_reliable || [];
                    let _chances = 3;
                    let _t_pool = _cfg.continuous_swipe || {};

                    _init();
                    _dismiss();
                    _storage();

                    // tool function(s) //

                    function _init() {
                        if (~_reliable.indexOf(_time)) {
                            _chances = Infinity;
                            debugInfo('当前滑动时长参数可信');
                        }

                        if (!(_time in _t_pool)) {
                            debugInfo('连续成功滑动累积器清零');
                            _t_pool = {};
                            _t_pool[_time] = 0;
                        }
                    }

                    function _dismiss() {
                        // noinspection JSCheckFunctionSignatures
                        let _gesture_par = [_time].concat(_pts.map(y => [halfW, cY(y)]));

                        let _max = 30, _ctr = 0;
                        devicex.keepOn(3);
                        while (!_lmt()) {
                            _debugAct('消除解锁页面提示层', _ctr, _max);
                            debugInfo('滑动时长: ' + _time + '毫秒');
                            debugInfo('参数来源: ' + (_from_sto ? '本地存储' : '自动计算'));

                            gesture.apply(null, _gesture_par);

                            if (_this.succ()) {
                                break;
                            }

                            debugInfo('单次消除解锁页面提示层超时');
                            _ctr += 1;

                            if (_from_sto) {
                                if (--_chances < 0) {
                                    _from_sto = false;
                                    _time = _cfg.unlock_dismiss_layer_swipe_time;
                                    debugInfo('放弃本地存储数据');
                                    debugInfo('从默认值模块获取默认值: ' + _time);
                                } else {
                                    debugInfo('继续使用本地存储数据');
                                }
                            } else {
                                // h110, 115, 120, 170, 220, 270, 320...
                                let _increment = _time < 120 ? 5 : 50;
                                _time += _increment;
                                debugInfo('参数增量: ' + _increment);
                            }
                        }
                        devicex.cancelOn();

                        debugInfo('解锁页面提示层消除成功');
                        _this.succ_fg = true;

                        // tool function(s) //

                        function _lmt() {
                            if (_ctr > _max) {
                                _t_pool[_time] = 0;
                                _sto.put('config', {continuous_swipe: _t_pool});
                                return _err('消除解锁页面提示层失败');
                            }
                        }
                    }

                    function _storage() {
                        if (_time !== _time_sto) {
                            _sto.put('config', {unlock_dismiss_layer_swipe_time: _time});
                            debugInfo('存储滑动时长参数: ' + _time);
                        }

                        if (!(_time in _t_pool)) {
                            _t_pool[_time] = 0;
                        }
                        let _new_ctr = ++_t_pool[_time];
                        _sto.put('config', {continuous_swipe: _t_pool});
                        debugInfo('存储连续成功滑动次数: ' + _new_ctr);

                        if (_new_ctr >= 6 && !~_reliable.indexOf(_time)) {
                            debugInfo('当前滑动时长可信度已达标');
                            debugInfo('存储可信滑动时长数据: ' + _time);
                            _sto.put('config', {swipe_time_reliable: _reliable.concat(_time)});
                        }
                    }
                },
                handle() {
                    return !this.succ_fg && this.trigger() && this.dismiss();
                },
                succ() {
                    return waitForAction(function () {
                        return !this.trigger();
                    }.bind(this), 1.5e3) || $_unlk.unlk_view.trigger();
                },
            },
            unlk_view: {
                trigger() {
                    let _this = this;

                    if (!devicex.isScreenOn()) {
                        return debugInfo(['跳过解锁控件检测', '>屏幕未亮起']);
                    }
                    return _pattern() || _password() || _pin() || _specials() || _unmatched();

                    // tool function(s) //

                    function _pattern() {
                        return [{
                            desc: '通用',
                            sel: idMatches(_as + 'lockPatternView'),
                        }, {
                            desc: 'MIUI',
                            sel: idMatches(_ak + 'lockPattern(View)?'),
                        }].some((smp) => {
                            if (smp.sel.exists()) {
                                debugInfo('匹配到' + smp.desc + '图案解锁控件');
                                return _trigger(smp.sel, _stg);
                            }
                        });

                        // strategy(ies) //

                        function _stg() {
                            let _stg = _cfg.unlock_pattern_strategy;
                            let _stg_map = {
                                segmental: '叠加路径',
                                solid: '连续路径',
                            };
                            let _key = 'unlock_pattern_swipe_time_' + _stg;
                            let _time = _cfg[_key]; // swipe time

                            let _from_sto = !!_time;
                            let _chances = 3;
                            let _ctr = 0;
                            let _max = Math.ceil(_max_try * 0.6);
                            while (!_lmt()) {
                                _debugAct('图案密码解锁', _ctr, _max);
                                debugInfo('滑动时长: ' + _time + '毫秒');
                                debugInfo('滑动策略: ' + _stg_map[_stg]);

                                let _pts = _getPts();
                                let _act = {
                                    segmental() {
                                        let _par = [];
                                        let _len = _pts.length;
                                        for (let i = 0; i < _len - 1; i += 1) {
                                            let _t1 = (_time - 50) * i;
                                            let _t2 = _time;
                                            let _pt1 = _pts[i];
                                            let _pt2 = _pts[i + 1];
                                            let _pts1 = [_pt1[0], _pt1[1]];
                                            let _pts2 = [_pt2[0], _pt2[1]];
                                            _par.push([_t1, _t2, _pts1, _pts2]);
                                        }
                                        gestures.apply(null, _par);
                                    },
                                    solid() {
                                        gesture.apply(null, [_time].concat(_pts));
                                    },
                                };

                                try {
                                    _act[_stg]();
                                } catch (e) {
                                    messageAction(e.message, 4, 0, 0, -1);
                                    messageAction(e.stack, 4, 0, 0, 2);
                                }

                                if (_this.succ()) {
                                    break;
                                }

                                debugInfo('图案解锁未成功', 3);
                                _ctr += 1;
                                sleep(200);

                                if (_from_sto) {
                                    if (--_chances < 0) {
                                        _from_sto = false;
                                        _time = _cfg[_key];
                                    }
                                } else {
                                    _time += 80;
                                }
                            }
                            debugInfo('图案解锁成功');

                            if (_time !== _cfg[_key]) {
                                _cfg[_key] = _time;
                                _sto.put('config', _cfg);
                                debugInfo('存储滑动时长参数: ' + _time);
                            }

                            return true;

                            // tool function(s) //

                            function _lmt() {
                                return _ctr > _max && _err('图案解锁方案失败');
                            }

                            function _getPts() {
                                if ($_unlk.unlock_pattern_bounds) {
                                    return $_unlk.unlock_pattern_bounds;
                                }

                                let _bnd = _stable(_this.sel);
                                if (!_bnd) {
                                    return _err(['图案解锁方案失败', '无法获取点阵布局']);
                                }

                                let _sz = _pat_sz;
                                let _w = Math.trunc(_bnd.width() / _sz);
                                let _h = Math.trunc(_bnd.height() / _sz);
                                let _x1 = _bnd.left + Math.trunc(_w / 2);
                                let _y1 = _bnd.top + Math.trunc(_h / 2);
                                let _pts = [];
                                for (let j = 1; j <= _sz; j += 1) {
                                    for (let i = 1; i <= _sz; i += 1) {
                                        _pts[(j - 1) * _sz + i] = {
                                            x: _x1 + (i - 1) * _w,
                                            y: _y1 + (j - 1) * _h,
                                        };
                                    }
                                }

                                if ($_str(_code)) {
                                    _code = _code.match(/[^1-9]+/)
                                        ? _code.split(/[^1-9]+/).join('|').split('|')
                                        : _code.split('');
                                }

                                return $_unlk.unlock_pattern_bounds = _simpl(_code, _sz)
                                    .filter(n => +n && _pts[n])
                                    .map(n => [_pts[n].x, _pts[n].y]);

                                // tool function(s) //

                                function _stable(sel) {
                                    let _res;
                                    let _max = 8;
                                    while (_max--) {
                                        try {
                                            _res = _stableBnd();
                                            break;
                                        } catch (e) {
                                            sleep(120);
                                        }
                                    }
                                    return _res;

                                    // tool function(s) //

                                    function _stableBnd() {
                                        let _bnd = null;
                                        let _l, _t, _r, _b;
                                        let _raw = () => {
                                            return $_und(_l) || $_und(_t)
                                                || $_und(_r) || $_und(_b);
                                        };
                                        let _parse = (bnd) => {
                                            let {left, top, right, bottom} = bnd;
                                            return [left, top, right, bottom];
                                        };
                                        let _asg = (bnd) => {
                                            [_l, _t, _r, _b] = _parse(bnd);
                                        };
                                        let _eql = (bnd) => {
                                            let [l, t, r, b] = _parse(bnd);
                                            return _l === l && _t === t
                                                && _r === r && _b === b;
                                        };
                                        let _succ = () => {
                                            let _nod = sel.findOnce();
                                            if (!_nod) {
                                                return;
                                            }
                                            _bnd = _nod.bounds();
                                            if (_raw()) {
                                                return _asg(_bnd);
                                            }
                                            if (_eql(_bnd)) {
                                                return true;
                                            }
                                            _asg(_bnd);
                                        };

                                        waitForAction(_succ, 1.2e3, 120);

                                        return _bnd;
                                    }
                                }

                                function _simpl(code, sz) {
                                    let _code = code.slice();
                                    let _code_bak = [];
                                    _standardize();

                                    while (_code_bak.length !== _code.length) {
                                        _code_bak = _code.slice();
                                        _rmDupe();
                                        _clean();
                                    }

                                    return _code;

                                    // tool function(s) //

                                    function _standardize() {
                                        _code = _code.filter((n) => (
                                            +n > 0 && +n <= sz * sz
                                        ));
                                    }

                                    function _rmDupe() {
                                        let _coord = _initCoord();
                                        let _k0 = NaN;
                                        let _len = _code.length;
                                        for (let n = 0; n < _len - 1; n += 1) {
                                            let _pt1 = _code[n];
                                            let _pt2 = _code[n + 1];
                                            let _k = _slope(_pt1, _pt2);
                                            // explicitly distinguishes between -0 and +0
                                            if (Object.is(_k0, _k)) {
                                                delete _code[n];
                                            } else {
                                                _k0 = _k;
                                            }
                                        }

                                        // tool function(s) //

                                        function _initCoord() {
                                            let _o = {};
                                            let _num = 1;
                                            for (let i = 1; i <= sz; i += 1) {
                                                for (let j = 1; j <= sz; j += 1) {
                                                    _o[_num++] = [i, j];
                                                }
                                            }
                                            return _o;
                                        }

                                        // returns a slope ('斜率') of 2 pts
                                        function _slope(n1, n2) {
                                            let _p1 = _coord[n1];
                                            let _p2 = _coord[n2];
                                            if (!_p1 || !_p2) {
                                                return NaN;
                                            }
                                            let [_x1, _y1] = _p1;
                                            let [_x2, _y2] = _p2;
                                            return (_y2 - _y1) / (_x2 - _x1);
                                        }
                                    }

                                    function _clean() {
                                        let _code_tmp = [];
                                        let _cache = {};
                                        _code.forEach((n) => {
                                            if (!$_und(n) && !(n in _cache)) {
                                                _cache[n] = true;
                                                _code_tmp.push(n);
                                            }
                                        });
                                        _code = _code_tmp;
                                    }
                                }
                            }
                        }
                    }

                    function _password() {
                        return !_misjudge() && [{
                            desc: '通用',
                            selector: idMatches('.*passwordEntry'),
                        }, {
                            desc: 'MIUI',
                            selector: idMatches(_ak + 'miui_mixed_password_input_field'),
                        }, {
                            desc: '锤子科技',
                            selector: idMatches(_sk + 'passwordEntry(_.+)?').className('EditText'),
                        }].some((smp) => {
                            if (smp.selector.exists()) {
                                debugInfo('匹配到' + smp.desc + '密码解锁控件');
                                return _trigger(smp.selector, _stg);
                            }
                        });

                        // strategy(ies) //

                        function _stg() {
                            let _pw = _code;
                            if ($_arr(_pw)) {
                                _pw = _pw.join('');
                            }

                            let _cfm_btn = (type) => (
                                $_sel.pickup([/确.|完成|[Cc]onfirm|[Ee]nter/, {
                                    className: 'Button', clickable: true,
                                }], type)
                            );

                            let _ctr = 0;
                            let _max = Math.ceil(_max_try * 0.6);
                            while (!_lmt()) {
                                _debugAct('密码解锁', _ctr, _max);
                                _this.sel.setText(_pw);
                                _keypadAssistIFN();

                                let _w_cfm = _cfm_btn('widget');
                                if (_w_cfm) {
                                    debugInfo('点击"' + _cfm_btn('txt') + '"按钮');
                                    try {
                                        clickAction(_w_cfm, 'w');
                                    } catch (e) {
                                        debugInfo('按钮点击可能未成功', 3);
                                    }
                                }
                                if (_this.succ(2)) {
                                    break;
                                }
                                if (_has_root && !shell('input keyevent 66', true).code) {
                                    debugInfo('使用Root权限模拟回车键');
                                    sleep(480);
                                    if (_this.succ()) {
                                        break;
                                    }
                                }
                                _ctr += 1;
                                sleep(200);
                            }
                            debugInfo('密码解锁成功');

                            return true;

                            // tool function(s) //

                            function _lmt() {
                                return _ctr > _max && _err([
                                    '密码解锁方案失败', '可能是密码错误', '或无法点击密码确认按钮',
                                ]);
                            }

                            function _keypadAssistIFN() {
                                /** @type string */
                                let _pw_last = _pw[_pw.length - 1];
                                /**
                                 * @example
                                 * let _smp_o = {
                                 *     $_DEVICE: {
                                 *         // string before keys
                                 *         // number for the length of last pw string
                                 *         prefix: 1,
                                 *         // assistant keys coordination
                                 *         // like: [[x1, y1], [x2, y2], ...],
                                 *         keys: [[100, 200]],
                                 *         // action after keys
                                 *         // UiObject: desc('5') -- widget of a key
                                 *         // Point: [x, y] -- point of a key
                                 *         // String: '5' -- numpad key 5
                                 *         // Number: 5 -- numpad key 5
                                 *         suffix: null,
                                 *     },
                                 * };
                                 * @type {Object.<string,{
                                 *     prefix?: number|{toString:function():string},
                                 *     keys?: string[]|Tuple2<number>,
                                 *     keys_map?: Object.<number|string,Tuple2<number>>,
                                 *     suffix?: UiSelector$|UiObject$|Tuple2<number>|number|string|RegExp,
                                 * }>}
                                 */
                                let _smp_o = {
                                    'HUAWEI VOG-AL00 9': {prefix: 1, keys: [[1008, 1706]]},
                                    'HUAWEI ELE-AL00 10': {
                                        keys: ['DEL'],
                                        keys_map: (() => {
                                            let y = [1188, 1350, 1511, 1674, 1835];
                                            let x = [56, 163, 271, 378, 487, 595, 703, 810, 918, 1027];
                                            let xs = [109.5, 217, 324.5, 432.5, 541, 649, 756.5, 864, 972.5];
                                            let [y0, y1, y2, y3, y4] = y;
                                            let [x0, x1, x2, x3, x4, x5, x6, x7, x8, x9] = x;
                                            let [xs0, xs1, xs2, xs3, xs4, xs5, xs6, xs7, xs8] = xs;
                                            return {
                                                1: [x0, y0],
                                                2: [x1, y0],
                                                3: [x2, y0],
                                                4: [x3, y0],
                                                5: [x4, y0],
                                                6: [x5, y0],
                                                7: [x6, y0],
                                                8: [x7, y0],
                                                9: [x8, y0],
                                                0: [x9, y0],
                                                q: [x0, y1],
                                                w: [x1, y1],
                                                e: [x2, y1],
                                                r: [x3, y1],
                                                t: [x4, y1],
                                                y: [x5, y1],
                                                u: [x6, y1],
                                                i: [x7, y1],
                                                o: [x8, y1],
                                                p: [x9, y1],
                                                a: [xs0, y2],
                                                s: [xs1, y2],
                                                d: [xs2, y2],
                                                f: [xs3, y2],
                                                g: [xs4, y2],
                                                h: [xs5, y2],
                                                j: [xs6, y2],
                                                k: [xs7, y2],
                                                l: [xs8, y2],
                                                z: [xs1, y3],
                                                x: [xs2, y3],
                                                c: [xs3, y3],
                                                v: [xs4, y3],
                                                b: [xs5, y3],
                                                n: [xs6, y3],
                                                m: [xs7, y3],
                                                ',': [xs1, y4],
                                                ' ': [xs4, y4],
                                                '.': [xs7, y4],
                                                del: [x9, y3],
                                            };
                                        })(),
                                        get suffix() {
                                            return this.keys_map[_pw_last];
                                        },
                                    },
                                };
                                if (!(_intro in _smp_o)) {
                                    return;
                                }
                                debugInfo('此设备机型需要按键辅助');

                                let _smp = _smp_o[_intro];
                                let _coords = _smp.keys;
                                let _k_map = _smp.keys_map;
                                let _pref = _smp.prefix;
                                let _suff = _smp.suffix;
                                if (!$_und(_pref) && !$_nul(_pref)) {
                                    let _s = '';
                                    if ($_num(_pref)) {
                                        _s += _pw_last.repeat(_pref);
                                    } else {
                                        _s = _pref.toString();
                                    }
                                    _this.sel.setText(_pw + _s);
                                    debugInfo('辅助按键前置填充: ' + _s.length + '项');
                                }

                                _coords.forEach((c, i) => {
                                    i || sleep(300);
                                    clickAction($_str(c) ? _k_map[c] : c);
                                    sleep(300);
                                });

                                if (_suff) {
                                    if (_suff instanceof com.stardust.automator.UiObject) {
                                        debugInfo('辅助按键后置填充类型: 控件');
                                        return clickAction(_suff);
                                    }
                                    if (_suff instanceof com.stardust.autojs.core.accessibility.UiSelector) {
                                        debugInfo('辅助按键后置填充类型: 选择器');
                                        return clickAction(_suff);
                                    }
                                    if ($_arr(_suff)) {
                                        debugInfo('辅助按键后置填充类型: 坐标');
                                        return clickAction(_suff);
                                    }
                                    if ($_num(_suff) || $_str(_suff) || $_rex(_suff)) {
                                        debugInfo('辅助按键后置填充类型: 文本');
                                        return clickAction($_sel.pickup('(key.?)?' + _suff));
                                    }
                                    return _err(['密码解锁失败', '无法判断末位字符类型']);
                                }
                            }
                        }

                        function _misjudge() {
                            let _triStr = sel => $_str(sel) && id(sel).exists();
                            let _triRex = sel => $_rex(sel) && idMatches(sel).exists();

                            return [
                                'com.android.systemui:id/lockPattern',
                            ].some((sel) => {
                                if (_triStr(sel) || _triRex(sel)) {
                                    _this.misjudge = sel;
                                    debugInfo(['匹配到误判干扰', '转移至PIN解锁方案']);
                                    return true;
                                }
                            });
                        }
                    }

                    function _pin() {
                        return [{
                            desc: '通用',
                            sel: idMatches(_as + 'pinEntry'),
                        }, {
                            desc: 'MIUI',
                            sel: idMatches(_ak + 'numeric_inputview'),
                        }, {
                            desc: 'EMUI10',
                            sel: idMatches(_as + 'fixedPinEntry'),
                        }, {
                            desc: 'EMUI',
                            sel: descMatches('[Pp][Ii][Nn] ?(码区域|area)'),
                        }, {
                            desc: '魅族',
                            sel: idMatches(_as + 'lockPattern'),
                        }, {
                            desc: 'OPPO',
                            sel: idMatches(_as + '(coloros.)?keyguard.pin.(six.)?view'),
                        }, {
                            desc: 'VIVO',
                            sel: idMatches(_as + 'vivo_pin_view'),
                        }].some((smp) => {
                            let _desc = smp.desc;
                            if (smp.sel.exists()) {
                                if (_desc.match(/\w$/)) {
                                    _desc += '/';
                                }
                                debugInfo('匹配到' + _desc + 'PIN解锁控件');
                                return _trigger(smp.sel, _stg);
                            }
                        });

                        // tool function(s) //

                        function _stg() {
                            let _pw = _clean_code;

                            let _ctr = 0;
                            let _max = Math.ceil(_max_try * 0.6);
                            while (!_lmt()) {
                                _debugAct('PIN解锁', _ctr, _max);

                                $_func(_this.unlockPin) ? _this.unlockPin() : _unlockPin();

                                if (_this.succ() || _clickKeyEnter()) {
                                    break;
                                }
                                _ctr += 1;
                                sleep(200);
                            }
                            debugInfo('PIN解锁成功');
                            return true;

                            // tool function(s) //

                            function _lmt() {
                                return _ctr > _max && _err(['PIN解锁方案失败', '尝试次数已达上限']);
                            }

                            function _clickKeyEnter() {
                                let _sltr = idMatches(_as + 'key_enter');
                                if (_sltr.exists()) {
                                    debugInfo('点击"key_enter"控件');
                                    clickAction(_sltr, 'w');
                                    return _this.succ();
                                }
                            }

                            function _unlockPin() {
                                let _samples = [{
                                    desc: '通用PIN/KEY',
                                    test() {
                                        let _sel = n => idMatches(_as + 'key' + n);
                                        if (_testNums(_sel)) {
                                            _dbg.call(this);
                                            return this.sel = _sel;
                                        }
                                    },
                                    click() {
                                        let _sel = this.sel;
                                        return _trig(() => _pw.forEach(n => clickAction(_sel(n), 'w')));
                                    },
                                }, {
                                    desc: '通用PIN容器',
                                    test() {
                                        let _w = idMatches(_as + 'container').findOnce();
                                        if (_w) {
                                            _dbg.call(this);
                                            return this.widget = _w;
                                        }
                                    },
                                    click() {
                                        /** @type UiObject$ */
                                        let _w = this.widget;
                                        let _bnd = _w.bounds();
                                        let _len = _w.childCount();
                                        let _b = _w.child(_len - 1).bounds().bottom;
                                        let _t = _w.child(_len - 4).bounds().top;
                                        let _rect = [_bnd.left, _t, _bnd.right, _b];
                                        return _trig(() => _clickVirtualKeypad(_pw, _rect));
                                    },
                                }, {
                                    desc: 'MIUI/PIN',
                                    test() {
                                        let _sel = n => idMatches(_ak + 'numeric_inputview').text(n);
                                        if (_testNums(_sel)) {
                                            _dbg.call(this);
                                            return this.sel = _sel;
                                        }
                                    },
                                    click() {
                                        let _sel = this.sel;
                                        return _trig(() => _pw.forEach(n => clickAction(_sel(n), 'w')));
                                    },
                                }, {
                                    desc: '内容描述PIN',
                                    test() {
                                        let _sel = n => desc(n);
                                        if (_testNums(_sel)) {
                                            _dbg.call(this);
                                            return this.sel = _sel;
                                        }
                                    },
                                    click() {
                                        /** @type {function(s:string):UiSelector$} */
                                        let _this_sel = this.sel;
                                        let _sel = (num) => {
                                            let _w = _this_sel(num).findOnce();
                                            if (num > 0 || _w) {
                                                return _w;
                                            }
                                            // center coordination
                                            let _ctc = (num) => {
                                                let _bnd = _sel(num).bounds();
                                                return {x: _bnd.centerX(), y: _bnd.centerY()};
                                            };
                                            // point of button '0'
                                            let _pt = n => _ctc(8)[n] + _ctc(5)[n] - _ctc(2)[n];
                                            return [_pt('x'), _pt('y')];
                                        };

                                        return _trig(() => _pw.forEach(n => clickAction(_sel(n), 'w')));
                                    },
                                }, {
                                    desc: '标记匹配PIN',
                                    test() {
                                        if (_this.misjudge) {
                                            _dbg.call(this);
                                            debugInfo('>已匹配的字符串化标记:');
                                            debugInfo('>' + _this.misjudge);
                                            return true;
                                        }
                                    },
                                    click() {
                                        return _trig(() => {
                                            let _w = idMatches(_this.misjudge).findOnce();
                                            if (_w) {
                                                _clickVirtualKeypad(_pw, _w.bounds());
                                            }
                                        });
                                    },
                                }];
                                let _max = 8;
                                while (_max--) {
                                    for (let o of _samples) {
                                        if (o.test()) {
                                            return o.click();
                                        }
                                    }
                                }
                                return _err('预置的PIN解锁方案全部无效');

                                // tool function(s) //

                                function _dbg() {
                                    debugInfo('匹配到' + this.desc + '解锁控件');
                                }

                                function _trig(f) {
                                    return (_this.unlockPin = f.bind(null))();
                                }

                                function _testNums(f) {
                                    // there is no need to check '0'
                                    // as a special treatment will be
                                    // given in getNumsBySingleDesc()
                                    let _ctr = 0;
                                    for (let n of '123456789') {
                                        _ctr += Number(f(n).exists());
                                    }
                                    return _ctr > 6;
                                }
                            }
                        }
                    }

                    function _specials() {
                        return [{
                            desc: '"Gxzw"屏下指纹设备',
                            sel: idMatches(/.*[Gg][Xx][Zz][Ww].*/),
                            pw_rect: [0.0875, 0.47, 0.9125, 0.788], // [cX, cY, cX, cY]
                        }].some((smp) => {
                            if (smp.sel.exists()) {
                                debugInfo(['匹配到特殊设备解锁方案:', smp.desc]);
                                return _trigger(smp.sel, _stg.bind(null, smp.pw_rect));
                            }
                        });

                        // tool function(s) //

                        function _stg(pw_rect) {
                            let _rect = pw_rect.map((n, i) => i % 2 ? cY(n) : cX(n));
                            let [_l, _t, _r, _b] = _rect;
                            debugInfo('已构建密码区域边界:');
                            debugInfo('Rect(' + _l + ', ' + _t + ' - ' + _r + ', ' + _b + ')');

                            _clickVirtualKeypad(_clean_code, _rect);

                            if (_this.succ()) {
                                return true;
                            }
                            _err('尝试特殊解锁方案失败');
                        }
                    }

                    function _unmatched() {
                        _isUnlk() || debugInfo('未匹配到可用的解锁控件');
                    }

                    function _trigger(sel, stg) {
                        _this.sel = sel;
                        _this.stg = stg;
                        return (_this.trigger = sel.exists.bind(sel))();
                    }

                    function _clickVirtualKeypad(pw, rect) {
                        let _r_l, _r_t, _r_w, _r_h;

                        if ($_arr(rect)) {
                            let [_l, _t, _r, _b] = rect;
                            _r_l = _l;
                            _r_t = _t;
                            _r_w = _r - _l;
                            _r_h = _b - _t;
                        } else {
                            _r_l = rect.left;
                            _r_t = rect.top;
                            _r_w = rect.width();
                            _r_h = rect.height();
                        }

                        let _w = Math.trunc(_r_w / 3);
                        let _h = Math.trunc(_r_h / 4);
                        let _x1 = _r_l + Math.trunc(_w / 2);
                        let _y1 = _r_t + Math.trunc(_h / 2);

                        let _keypads = [];
                        for (let j = 1; j <= 4; j += 1) {
                            for (let i = 1; i <= 3; i += 1) {
                                _keypads[(j - 1) * 3 + i] = {
                                    x: _x1 + _w * (i - 1),
                                    y: _y1 + _h * (j - 1),
                                };
                            }
                        }
                        debugInfo('已构建拨号盘数字坐标');
                        pw.forEach(v => clickAction(_keypads[Number(v) || 11]));
                    }
                },
                dismiss() {
                    if (!_code) {
                        return _err('密码为空');
                    }
                    if (!$_func(this.stg)) {
                        return _err('没有可用的解锁策略');
                    }
                    devicex.keepOn(5);
                    this.stg();
                    devicex.cancelOn();
                },
                handle() {
                    return this.trigger() && this.dismiss();
                },
                succ(t) {
                    let _t = t || 1920;
                    let _err_shown_fg;
                    let _cond = () => {
                        if (_correct()) {
                            _chkTryAgain();
                            _chkOKBtn();
                            return _isUnlk();
                        }
                        _err_shown_fg = true;
                    };

                    return waitForAction(_cond, _t, 240);

                    // tool function(s) //

                    function _correct() {
                        let _w_bad = $_sel.pickup(/.*(重试|不正确|错误|[Ii]ncorrect|[Rr]etry|[Ww]rong).*/);
                        if (_w_bad) {
                            return _err_shown_fg || debugInfo($_sel.pickup(_w_bad, 'txt'), 3);
                        }
                        if (idMatches(new RegExp(_ak + 'phone_locked_textview')).exists()) {
                            return _err_shown_fg || debugInfo('密码错误', 3);
                        }
                        return true;
                    }

                    function _chkTryAgain() {
                        let _chk = () => $_sel.pickup(/.*([Tt]ry again in.+|\d+.*后重试).*/);
                        if (_chk()) {
                            debugInfo('正在等待重试超时');
                            waitForAction(() => !_chk(), 65e3, 500);
                        }
                    }

                    function _chkOKBtn() {
                        let _w_ok = $_sel.pickup(/OK|确([认定])|好的?/);
                        if (_w_ok) {
                            debugInfo('点击"' + $_sel.pickup(_w_ok, 'txt') + '"按钮');
                            clickAction(_w_ok, 'w');
                            sleep(1e3);
                        }
                    }
                },
            },
        };
    }

    function _unlock(forc_debug) {
        let _dash = '__split_line_dash__';
        let _debug_notice = forc_debug || forc_debug === false;

        _sto.put('config', _cfg);

        _debugPrologue();
        _wakeUpIFN();

        devicex.getDisplay(true);

        while (!_isUnlk() && !_lmtRch()) {
            $_unlk.prev_cntr.handle();
            $_unlk.unlk_view.handle();
        }

        _debugEpilogue();

        return true;

        // tool function(s) //

        function _debugPrologue() {
            if (_debug_notice) {
                $_flag.debug_info_avail_bak = $_flag.debug_info_avail;
                $_flag.debug_info_avail = !!forc_debug;
            }
            debugInfo([_dash, '尝试自动解锁', _dash]);
        }

        function _debugEpilogue() {
            debugInfo([_dash, '自动解锁完毕', _dash]);
            if (_debug_notice) {
                $_flag.debug_info_avail = $_flag.debug_info_avail_bak;
                delete $_flag.debug_info_avail_bak;
            }
        }

        function _lmtRch() {
            let _max = _max_try;
            let _ctr = $_und(_unlock.ctr) ? _unlock.ctr = 0 : ++_unlock.ctr;
            _ctr > _max ? _err('解锁尝试次数已达上限') : _debugAct('解锁', _ctr, _max);
            sleep(240);
        }
    }

    function _export() {
        module.exports = {
            is_init_screen_on: $_unlk.init_scr,
            is_init_unlocked: $_unlk.init_unlk,
            isUnlocked: () => _isUnlk(),
            isLocked: () => !_isUnlk(),
            unlock: _unlock,
        };
    }

    function _execute() {
        // TODO dialogsx.builds() -- 1. functional test  2. configuration  3. module usage
    }

    function _debugAct(act_str, ctr, max) {
        debugInfo(ctr ? '重试' + act_str + ' (' + ctr + '/' + max + ')' : '尝试' + act_str);
    }
}();