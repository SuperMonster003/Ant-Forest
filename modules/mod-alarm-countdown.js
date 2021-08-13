require('./ext-ui').load();
require('./ext-device').load();
require('./ext-dialogs').load();

uix.registerWidget('alarm-ctd-text', <x-text
    gravity="center" color="#fff3e0" size="16"
    fontFamily="sans-serif-condensed" padding="7"
/>);

let _itv_id = -1;

let _view = ui.inflate(<vertical>
    <alarm-ctd-text id="text"/>
    <alarm-ctd-text id="ctd" visibility="gone" size="13" paddingBottom="6"/>
</vertical>);

let _diag = dialogsx.builds({
    customView: _view,
    canceledOnTouchOutside: false,
    background: colorsx.hrgba('#ac1900dd'),
    animation: 'input_method',
    dim_amount: 75,
    disable_back: () => exit(),
}).show();

let _export = {
    dialog: _diag,
    view: _view,
    /**
     * @param {{
     *     is_async?: boolean,
     * }} [options]
     */
    show(options) {
        let _opt = options || {};
        _opt.is_async ? threads.start($main) : $main();
    },
};

typeof module === 'object' ? (module.exports = _export) : _export.show();

// tool function(s) //

function $main() {
    // noinspection CommaExpressionJS
    events.on('exit', () => (_diag.dismiss(), clearInterval(_itv_id)));

    let _getTimeout = () => Math.ceil(devicex.getNextAlarmClockTriggerGap() / 1e3);
    let _getTimeoutText = t => '闹钟即将在 ' + t + ' 秒内触发';
    let _setTimeoutText = (t) => {
        _view['text'].attr('text', typeof t === 'number' ? _getTimeoutText(t) : t);
    };

    let _t = _getTimeout();

    if (isFinite(_t)) {
        _setTimeoutText(_t);
        _itv_id = setInterval(() => {
            let _new_t = _getTimeout();
            if (_t === 0 || _t < _new_t || !isFinite(_t)) {
                exit();
            }
            if (_t !== _new_t) {
                _t = _new_t;
                _setTimeoutText(_new_t);
            }
        }, 100);
    } else {
        let _setCountdown = t => _view['ctd'].attr('text', '[ ' + t + ' ]');
        let _tt = 3;

        _view['text'].attr('text', '未设置闹钟');
        _view['ctd'].attr('visibility', 'visible');
        _setCountdown(_tt--);
        _itv_id = setInterval(() => _tt > 0 ? _setCountdown(_tt--) : exit(), 1e3);
    }
}