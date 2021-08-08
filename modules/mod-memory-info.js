require('./ext-global').load();
require('./ext-dialogs').load();
require('./ext-threads').load();
require('./ext-app').load();
require('./ext-ui').load();
require('./ext-colors').load();

uix.registerWidget('mem-info-text', <x-text
    gravity="center" padding="5 0 5 24" size="18"
    fontFamily="sans-serif-condensed" line_spacing="5cx"
/>);

uix.registerWidget('mem-info-button', <x-button
    layout_weight="1" marginBottom="9" w="83"
/>);

let _getViewConfig = function () {
    let _sys_mi = appx.getMemoryInfo();
    let _proc_mi = appx.getProcessMemoryInfo();
    let _rt_mi = appx.getRuntimeMemoryInfo();

    let _max_heap_usage = Math.max(_proc_mi.heap_usage, _rt_mi.heap_usage);

    let _preset = {
        img: _getConfigFromPreset(_max_heap_usage),
        title: _getConfigFromPreset(_max_heap_usage),
        sys: _getConfigFromPreset(0),
        rt: _getConfigFromPreset(_rt_mi.heap_usage),
        proc: _getConfigFromPreset(_proc_mi.heap_usage),
        uss_n_pss: _getConfigFromPreset(0),
    };

    return {
        title: {color: _preset.title.tint.text},
        img: {
            tint: _preset.img.tint.icon,
            src: '@drawable/ic_sentiment_' + _preset.img.sentiment + '_black_48dp',
        },
        sys: {
            text: _digest('System Memory', _sys_mi.used, _sys_mi.total, _sys_mi.used_pct),
            color: _preset.sys.tint.text,
        },
        rt: {
            text: _digest('Runtime Heap', _rt_mi.heap, _rt_mi.max, _rt_mi.heap_pct),
            color: _preset.rt.tint.text,
        },
        proc: {
            text: _digest('Process Heap', _proc_mi.heap, _rt_mi.max, _proc_mi.heap_pct),
            color: _preset.proc.tint.text,
        },
        uss_n_pss: {
            text: [
                'USS: ' + $$cvt.bytes(_proc_mi.uss),
                'PSS: ' + $$cvt.bytes(_proc_mi.pss),
            ].join('\n'),
            color: _preset.uss_n_pss.tint.text,
        },
        btn_restart_process: {
            on_click() {
                dialogsx.builds([null, [
                    '确定要重启 Auto.js 进程吗\n' +
                    '重启完成后当前工具将自动启动\n' +
                    '重启过程可能需要几秒到数十秒', colorsx.hrgba('#ffebeedd')],
                    ['查看帮助', '#90caf9'], ['B', '#a5d6a7'], ['K', '#ef9a9a'], 1,
                ], {
                    background: colorsx.hrgba('#7f000044'),
                    animation: 'input_method',
                    dim_amount: 85,
                }).on('neutral', (d) => {
                    setTimeout(() => d.dismiss(), 100);
                    dialogsx.builds([['关于进程重启', '#64B5F6'],
                        ['脚本调用如下代码片段\n\n' +
                        'Process.killProcess(Process.myPid());\n\n' +
                        '杀死当前应用活动的进程\n此操作将清理进程内所有资源\n' +
                        '由于ActivityManager时刻监听进程\n' +
                        '一旦发现进程非正常结束\n它将试图重启此进程', '#80D6FF'],
                        0, 0, ['B', '#a5d6a7'], 1,
                    ], {
                        background: colorsx.hrgba('#00005144'),
                        animation: 'input_method',
                        dim_amount: 85,
                    }).on('positive', (ds) => {
                        d.show();
                        setTimeout(() => ds.dismiss(), 100);
                    }).show();
                }).on('negative', (d) => {
                    d.dismiss();
                }).on('positive', (d) => {
                    dialogsx.setContentText(d, '正在重启进程...');
                    dialogsx.setActionButton(d, ['neutral', 'negative', 'positive'], null);
                    threadsx.start(function () {
                        appx.killProcess({pending_task: 'current+2s'});
                    });
                }).show();
            },
            background_tint: colorsx.hrgba('#8e0000dd'),
            text_color: colorsx.hrgba('#ffebeedd'),
        },
        btn_close: {
            on_click: _exitNow,
            background_tint: colorsx.hrgba('#1b5e20dd'),
            text_color: colorsx.hrgba('#e8f5e9dd'),
        },
        btn_help: {
            on_click() {
                dialogsx.builds([['开发未完成', '#63c2ef'],
                    ['将于后续版本完善此处内容...', '#80D6FF'],
                    0, 0, ['B', '#a5d6a7'], 1,
                ], {
                    background: colorsx.hrgba('#00005144'),
                    animation: 'input_method',
                    dim_amount: 85,
                }).on('positive', d => d.dismiss()).show();
            },
            background_tint: colorsx.hrgba('#004c8cdd'),
            text_color: colorsx.hrgba('#e3f2fddd'),
        },
    };
};

let _view = ui.inflate(<vertical gravity="center">
    <x-img id="img" height="70" margin="0 26 0 18" gravity="center"
           bg="?selectableItemBackgroundBorderless"/>
    <vertical>
        <mem-info-text id="title" text="Memory Info" size="19"/>
        <mem-info-text id="sys"/>
        <mem-info-text id="rt"/>
        <mem-info-text id="proc"/>
        <mem-info-text id="uss_n_pss"/>
    </vertical>
    <horizontal w="auto">
        <mem-info-button id="btn_restart_process" text="重启进程"/>
        <mem-info-button id="btn_close" text="关闭"/>
        <mem-info-button id="btn_help" text="帮助"/>
    </horizontal>
</vertical>);

let _diag = global._$_diag_mem_info = dialogsx.builds({
    customView: _view,
    autoDismiss: false,
    canceledOnTouchOutside: false,
    background: 'transparent',
    animation: 'input_method',
    dim_amount: 85,
});

_setListeners();

let _export = {
    dialog: _diag,
    view: _view,
    /**
     * @param {MemInfoMainOptions} [options]
     * @returns {com.stardust.autojs.core.ui.dialog.JsDialog}
     */
    show(options) {
        $main(options);
        return _diag.show();
    },
};

typeof module === 'object' ? (module.exports = _export) : _export.show();

// main function //

/**
 * @typedef {{
 *     parent_view?: AutojsUiWidgetViews,
 *     view_config?: {
 *         img?: AutojsViewAttributes,
 *         title?: AutojsViewAttributes,
 *         sys?: AutojsViewAttributes,
 *         rt?: AutojsViewAttributes,
 *         proc?: AutojsViewAttributes,
 *         uss_n_pss?: AutojsViewAttributes,
 *         btn_close?: AutojsViewAttributes,
 *         btn_restart_process?: AutojsViewAttributes,
 *     },
 * }} MemInfoMainOptions
 */
/**
 * @param {MemInfoMainOptions} [options]
 */
function $main(options) {
    typeof options === 'object' && _applyOptions(options);
    ui.run(() => {
        _setView();
        global._$_itv_set_view = setInterval(_setView, 1e3);
        global._$_tt_timeout = setTimeout(() => _exitNow('悬浮窗超时自动关闭'), 3.6e6);
    });
}

// tool function(s) //

/**
 * @param {number} pct
 * @return {MemInfoConfigPreset}
 */
function _getConfigFromPreset(pct) {
    /**
     * @typedef {{
     *     sentiment: string,
     *     threshold: number,
     *     tint: {icon: ColorParam, text: ColorParam},
     * }} MemInfoConfigPreset
     */
    /**
     * @type {MemInfoConfigPreset[]}
     */
    let preset = [{
        threshold: 0.9,
        sentiment: 'very_dissatisfied',
        tint: {icon: '#8e24aa', text: colorsx.hrgba('#ea80fcdd')},
    }, {
        threshold: 0.8,
        sentiment: 'dissatisfied',
        tint: {icon: '#bf360c', text: colorsx.hrgba('#e57373dd')},
    }, {
        threshold: 0.6,
        sentiment: 'neutral',
        tint: {icon: '#f9a825', text: colorsx.hrgba('#fff176dd')},
    }, {
        threshold: 0.3,
        sentiment: 'satisfied',
        tint: {icon: '#558b2f', text: colorsx.hrgba('#b3e5fcdd')},
    }, {
        threshold: 0,
        sentiment: 'very_satisfied',
        tint: {icon: '#039be5', text: colorsx.hrgba('#b3e5fcdd')},
    }];

    return (_getConfigFromPreset = function (pct) {
        for (let o of preset) {
            if (pct >= o.threshold) {
                return o;
            }
        }
        return preset[preset.length - 1];
    })(pct);
}

/**
 * @param {MemInfoMainOptions} [o]
 */
function _applyOptions(o) {
    if (typeof o === 'object' && typeof o.view_config === 'object') {
        Object.keys(o.view_config).forEach((id) => {
            Object.keys(o.view_config[id]).forEach((cfg_k) => {
                _view[id].attr(cfg_k, o.view_config[id][cfg_k]);
            });
        });
        if (o.parent_view) {
            o.parent_view.addView(_view);
        }
    }
}

function _setListeners() {
    _diag.setOnKeyListener({
        onKey(diag, key_code) {
            if (key_code === android.view.KeyEvent.KEYCODE_BACK) {
                _exitNow();
                return true;
            }
            return false;
        },
    });
}

function _setView() {
    let _view_cfg = _getViewConfig();
    Object.keys(_view_cfg).forEach((view_k) => {
        Object.keys(_view_cfg[view_k]).forEach((attr_k) => {
            _view[view_k].attr(attr_k, _view_cfg[view_k][attr_k]);
        });
    });
}

function _digest(title, used, total, pct) {
    return title + '\n' + [$$cvt.bytes(used), $$cvt.bytes(total), pct].join(' | ');
}

function _exitNow(msg) {
    if (typeof msg === 'string') {
        toast(msg);
    }
    if (typeof global._$_diag_mem_info !== 'undefined') {
        global._$_diag_mem_info.dismiss();
    }
    if (typeof global._$_itv_set_view === 'number') {
        clearInterval(global._$_itv_set_view);
    }
    if (typeof global._$_tt_timeout === 'number') {
        clearTimeout(global._$_tt_timeout);
    }
    ui.post(() => exit());
}