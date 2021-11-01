require('./mod-global');
let {uix} = require('./ext-ui');
let {colorsx} = require('./ext-colors');
let {devicex} = require('./ext-device');
let {dialogsx} = require('./ext-dialogs');
let {threadsx} = require('./ext-threads');

uix.registerWidget('alarm-ctd-text', <x-text
    gravity="center" color="#FFF3E0" size="17"
    fontFamily="sans-serif-condensed" padding="7"
/>);

let _exit_signal = false;

let _view = ui.inflate(<vertical>
    <alarm-ctd-text id="text" line_spacing="5cx"/>
</vertical>);

let _diag = dialogsx.builds({
    customView: _view,
    canceledOnTouchOutside: false,
    background: colorsx.hrgba('#005B4F91'),
    animation: 'input_method',
    dim_amount: 75,
    keycode_back: () => $exit(),
});

/** @type {Plugin$Exportation} */
let _export = {
    dialog: _diag,
    view: _view,
    /**
     * @param {{
     *     is_async?: boolean,
     *     title?: string,
     * }} [options]
     */
    run(options) {
        let _opt = options || {};
        _opt.is_async ? threadsx.start($main.bind(null, _opt)) : $main(_opt);
    },
    config() {
        uix.execScript('test', function () {
            ui.layout(<frame>
                <x-text id="txt"/>
            </frame>);
            ui.statusBarColor('#880E4F');
            ui['txt'].attr('gravity', 'center');
            ui['txt'].attr('size', 24);
            ui['txt'].attr('color', '#BC477B');
            ui['txt'].attr('text', 'CUI\n(Configuration User Interface)\n' +
                'for current plugin\nhasn\'t been accomplished');
        });
    },
};

typeof module === 'object' ? module.exports = _export : _export.run();

// tool function(s) //

/**
 * @param {{
 *     title?: string,
 * }} [options]
 */
function $main(options) {
    let _opt = options || {};

    _diag.isShowing() || _diag.show();

    let _getTimeout = () => Math.ceil(devicex.getNextAlarmClockTriggerGap() / 1e3) * 1e3;
    let _getTimeoutText = ts => (_opt.title || '下次闹钟触发') + '\n' + _tsToTime(ts, 'GAP');
    let _setTimeoutText = ts => _view['text'].attr('text', _getTimeoutText(ts));
    let _tsToTime = (ts, is_gap) => {
        let _d = 0;
        if (is_gap) {
            _d += Math.floor(ts / (24 * 3.6e6));
            ts += new Date(new Date().toLocaleDateString()).getTime();
        }
        let _date = new Date(ts);
        return (_d ? '< +' + _d + ' >\n' : '') +
            _date.getHours().padStart(2, 0) + ':' +
            _date.getMinutes().padStart(2, 0) + ':' +
            _date.getSeconds().padStart(2, 0);
    };

    let _ts = _getTimeout();

    if (isFinite(_ts)) {
        _setTimeoutText(_ts);
        let _itv_id = setInterval(() => {
            if (_exit_signal) {
                return clearInterval(_itv_id);
            }
            let _new_ts = _getTimeout();
            if (_ts === 0 || _ts < _new_ts || !isFinite(_ts)) {
                return $exit();
            }
            if (_ts !== _new_ts) {
                _ts = _new_ts;
                _setTimeoutText(_new_ts);
            }
        }, 100);
    } else {
        let _setCountdown = t => _view['text'].attr('text', '未设置闹钟\n[ ' + t + ' ]');
        let _t_aim = 3.99e3 + Date.now();
        let _tt = () => Math.floor((_t_aim - Date.now()) / 1e3);
        _setCountdown(_tt());
        let _itv_id = setInterval(() => {
            if (_exit_signal) {
                return clearInterval(_itv_id);
            }
            let _t = _tt();
            _t > 0 ? _setCountdown(_t) : $exit();
        }, 100);
    }
}

function $exit() {
    _diag.dismiss();
    _exit_signal = true;
}