let {$$cvt} = require('./mod-global');
let {appx} = require('./ext-app');
let {uix} = require('./ext-ui');
let {colorsx} = require('./ext-colors');
let {dialogsx} = require('./ext-dialogs');

uix.registerWidget('mem-info-text', <x-text
    gravity="center" padding="5 0 5 24" size="18"
    fontFamily="sans-serif-condensed" line_spacing="5cx"
/>);

uix.registerWidget('mem-info-button', <x-button
    width="0" margin="2 10" text_size="14"
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
            background_tint: colorsx.hrgba('#8E0000DD'),
            text_color: colorsx.hrgba('#FFEBEEDD'),
        },
        btn_close: {
            on_click: $exit,
            background_tint: colorsx.hrgba('#1B5E20DD'),
            text_color: colorsx.hrgba('#E8F5E9DD'),
        },
        btn_help: {
            background_tint: colorsx.hrgba('#004C8CDD'),
            text_color: colorsx.hrgba('#E3F2FDDD'),
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
        <mem-info-button layout_weight="1" id="btn_restart_process" text="重启进程"/>
        <mem-info-button layout_weight="1" id="btn_close" text="关闭"/>
        <mem-info-button layout_weight="1" id="btn_help" text="帮助"/>
    </horizontal>
</vertical>);

_view['btn_restart_process'].on('click', function () {
    dialogsx.builds([null,
        ['确定要重启 Auto.js 进程吗\n' +
        '重启完成后当前工具将自动启动\n' +
        '重启过程可能需要几秒到数十秒', colorsx.hrgba('#FFEBEEDD')],
        ['查看帮助', '#90CAF9'], ['B', '#A5D6A7'], ['K', '#EF9A9A'], 1,
    ], {
        background: colorsx.hrgba('#7F000044'),
        animation: 'input_method',
        dim_amount: 85,
    }).on('neutral', (d) => {
        setTimeout(() => d.dismiss(), 100);
        dialogsx.builds([['关于进程重启', '#B3E5FC'],
            ['about_process_restart', '#E1F5FE'],
            0, 0, ['B', '#A5D6A7'], 1,
        ], {
            background: colorsx.hrgba('#00005139'),
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
        appx.killProcess({pending_task: 'current+2s', is_async: true});
    }).show();
});

_view['btn_help'].on('click', function () {
    dialogsx.builds([['关于内存信息', '#B3E5FC'],
        ['about_memory_info', '#E1F5FE'],
        0, 0, ['B', '#A5D6A7'], 1,
    ], {
        background: colorsx.hrgba('#00005139'),
        animation: 'input_method',
        dim_amount: 85,
    }).on('positive', d => d.dismiss()).show();
});

let _diag = global._$_diag_mem_info = dialogsx.builds({
    customView: _view,
    autoDismiss: false,
    canceledOnTouchOutside: false,
    background: 'transparent',
    animation: 'input_method',
    dim_amount: 85,
});

_setListeners();

/** @type {Plugin$Exportation} */
let _export = {
    dialog: _diag,
    view: _view,
    /**
     * @param {Plugin$MemoryInfo.Options} [options]
     */
    run(options) {
        $main(options);
        _diag.show();
    },
    config() {
        dialogsx.alerts('CUI (Configuration User Interface) for current plugin hasn\'t been accomplished');
    },
};

typeof module === 'object' ? module.exports = _export : _export.run();

// key function(s) //

/**
 * @param {Plugin$MemoryInfo.Options} [options]
 */
function $main(options) {
    typeof options === 'object' && _applyOptions(options);
    ui.run(() => {
        _setView();
        global._$_itv_set_view = setInterval(_setView, 1e3);
        global._$_tt_timeout = setTimeout(() => $exit('悬浮窗超时自动关闭'), 3.6e6);
    });
}

function $exit(msg) {
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

// tool function(s) //

/**
 * @param {number} pct
 * @return {Plugin$MemoryInfo.ConfigPreset}
 */
function _getConfigFromPreset(pct) {
    /**
     * @type {Plugin$MemoryInfo.ConfigPreset[]}
     */
    let preset = [{
        threshold: 0.9,
        sentiment: 'very_dissatisfied',
        tint: {icon: '#8E24AA', text: colorsx.hrgba('#EA80FCDD')},
    }, {
        threshold: 0.8,
        sentiment: 'dissatisfied',
        tint: {icon: '#BF360C', text: colorsx.hrgba('#E57373DD')},
    }, {
        threshold: 0.6,
        sentiment: 'neutral',
        tint: {icon: '#F9A825', text: colorsx.hrgba('#FFF176DD')},
    }, {
        threshold: 0.3,
        sentiment: 'satisfied',
        tint: {icon: '#558B2F', text: colorsx.hrgba('#B3E5FCDD')},
    }, {
        threshold: 0,
        sentiment: 'very_satisfied',
        tint: {icon: '#039BE5', text: colorsx.hrgba('#B3E5FCDD')},
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
 * @param {Plugin$MemoryInfo.Options} [o]
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
            let _is_back = key_code === KeyEvent.KEYCODE_BACK;
            _is_back && $exit();
            return _is_back;
        },
    });
}

function _setView() {
    let _cfg = _getViewConfig();
    Object.keys(_cfg).forEach((view_k) => {
        let _vw = _view[view_k];
        Object.keys(_cfg[view_k]).forEach((attr_k) => {
            let _val = _cfg[view_k][attr_k];
            if (typeof _val === 'function') {
                let _act = 'set' + attr_k.replace(/_(.)/g, ($0, $1) => {
                    return $1.toUpperCase();
                }).toTitleCase() + 'Listener';
                if (typeof _vw[_act] === 'function') {
                    return _vw[_act](_val);
                }
            }
            _vw.attr(attr_k, _val);
        });
    });
}

function _digest(title, used, total, pct) {
    return title + '\n' + [$$cvt.bytes(used), $$cvt.bytes(total), pct].join(' | ');
}