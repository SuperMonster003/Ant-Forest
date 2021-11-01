require('../modules/mod-global');
let {uix} = require('../modules/ext-ui');
let {timersx} = require('../modules/ext-timers');

let _ts = _getTsFromArgv() || _getTsFromAutoTask() || _getTsFromDiag();

// noinspection HtmlUnknownTarget,HtmlRequiredAltAttribute
let _view = ui.inflate(
    <vertical gravity="center">
        <x-img id="img" src="@drawable/ic_alarm_on_black_48dp"
               height="70" margin="0 26 0 18" gravity="center"
               bg="?selectableItemBackgroundBorderless"/>
        <vertical>
            <x-text text="Next auto task" gravity="center" color="#DDF3E5F5" padding="5 0 5 20" size="19"/>
            <x-text id="aim" gravity="center" color="#DDF3E5F5" padding="5 0 5 20" size="18"/>
            <x-text id="ctd" gravity="center" color="#DDF3E5F5" padding="5 0 5 24" size="18"/>
        </vertical>
        <horizontal w="auto">
            <x-button id="btn" type="button" text="CLOSE" layout_weight="1" backgroundTint="#DD1B5E20"
                      textColor="#DDE8F5E9" marginBottom="9"/>
        </horizontal>
    </vertical>);
let _diag = dialogs.build({
    customView: _view,
    autoDismiss: false,
    canceledOnTouchOutside: false,
}).show();

ui.run(() => {
    _diag.setOnKeyListener({
        onKey(diag, key_code) {
            if (key_code === android.view.KeyEvent.KEYCODE_BACK) {
                _exitNow();
                return true;
            }
            return false;
        },
    });

    _view['btn'].on('click', _exitNow);
    uix.setImageTint(_view['img'], '#BA68C8');

    let _win = _diag.getWindow();
    _win.setBackgroundDrawableResource(android.R.color.transparent);
    _win.setWindowAnimations(android.R.style.Animation_InputMethod);
    _win.setDimAmount(0.85);

    _setCtdText(_ts);
});

// tool function(s) //

function _getTsFromArgv() {
    let _ts = (engines.myEngine().execArgv || {}).timestamp;
    return _ts instanceof java.lang.Double ? _ts.doubleValue() : _ts;
}

function _getTsFromAutoTask() {
    return timersx.queryTimedTasks({
        path: files.path('../ant-forest-launcher.js'),
    }).map(task => task.getNextTime()).sort()[0];
}

function _getTsFromDiag() {
    while (1) {
        _ts = Number(dialogs.prompt('未检测到"蚂蚁森林"定时任务\n输入用于测试的延迟分钟'));
        if (!isNaN(_ts) && _ts > 0) {
            return _ts * 60e3 + Date.now();
        } else if (!_ts) {
            toast('已退出');
            exit();
        }
        alert('需输入合法的数字');
    }
}

function _setCtdText(t) {
    let _now = new Date();
    let _now_ts = _now.getTime();
    let _now_yy = _now.getFullYear();
    let _now_MM = _now.getMonth();
    let _now_dd = _now.getDate();
    let _now_dates = [_now_yy, _now_MM, _now_dd];
    let _day_ms = 24 * 3.6e6;

    let _aim_str = '';
    let _ctd_str = '';

    let _tsToTime = (ts, is_gap) => {
        if (is_gap) {
            ts += new Date(new Date().toLocaleDateString()).getTime();
        }
        let _d = new Date(ts);
        return _d.getHours().padStart(2, 0) + ':' +
            _d.getMinutes().padStart(2, 0) + ':' +
            _d.getSeconds().padStart(2, 0);
    };

    let _aim = (function $iiFe() {
        if (typeof t === 'number') {
            _aim_str = _tsToTime(t);
            return new Date(t);
        } else if (t instanceof Date) {
            _aim_str = _tsToTime(t.getTime());
            return t;
        } else {
            if (typeof t !== 'string') {
                throw Error('Invalid type of time param');
            }
            if (!t.match(/^\d{2}:\d{2}:\d{2}$/)) {
                throw Error('Invalid format of time param');
            }
            _aim_str = t;
            // noinspection JSCheckFunctionSignatures
            return new (Array.bind.apply(Date, [Date].concat(_now_dates, t.split(':'))));
        }
    })();
    let _aim_ts = _aim.getTime();
    if (typeof t === 'string') {
        while (_aim_ts <= _now_ts) {
            _aim_ts += _day_ms;
        }
    }

    let _getAimStr = () => {
        let _now = new Date();
        let _today_0h_ts = new Date(_now.toLocaleDateString()).getTime();
        let _aim_sign = _aim_ts >= _today_0h_ts + _day_ms ? '+' : '=';
        return _aim_sign + '\x20' + _aim_str + '\x20' + _aim_sign;
    };

    let _getCtdStr = () => {
        let _ctd_sign = '-';
        let _gap_ts = _aim_ts - Date.now();
        _ctd_str = _tsToTime(Math.max(_gap_ts, 0), 'GAP');
        return _ctd_sign + '\x20' + _ctd_str + '\x20' + _ctd_sign;
    };

    try {
        _view['aim'].setText(_getAimStr());
    } catch (e) {
        // eg: java.lang.NullPointerException
    }
    let _setCtdText = () => {
        try {
            _view['ctd'].setText(_getCtdStr());
        } catch (e) {
            // eg: java.lang.NullPointerException
        }
    };

    _setCtdText();
    global._$_itv_set_view = setInterval(_setCtdText, 1e3);

    global._$_tt_timeout = setTimeout(() => {
        _exitNow('自动关闭倒计时悬浮窗');
    }, Math.max(3e3, _aim_ts - Date.now()));
}

function _exitNow(msg) {
    _diag.dismiss();
    if (typeof msg === 'string') {
        toast(msg);
    }
    if (typeof global._$_itv_set_view === 'number') {
        clearInterval(global._$_itv_set_view);
    }
    if (typeof global._$_tt_timeout === 'number') {
        clearTimeout(global._$_tt_timeout);
    }
    ui.post(() => exit());
}