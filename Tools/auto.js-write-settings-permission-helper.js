!function () {
    try {
        auto.waitFor();
    } catch (e) {
        auto();
    }

    _updateRequire();
    require('../modules/ext-dialogs').load();
    _showDiag();

    // tool function(s) //

    function _updateRequire() {
        _updateMethod(global, 'require', (args) => {
            let path = args[0] || '';
            path = './' + path.replace(/^([./]*)(?=\w)/, '').replace(/(\.js)*$/, '') + '.js';
            for (let i = 0; ; i += 1) {
                if (files.exists(path)) return [path];
                if (i === 3) return [args[0]];
                path = '.' + path;
            }
        });

        // tool function(s) //

        function _updateMethod(o, name, f) {
            let old = o[name];
            o[name] = function () {
                let isFunction = f => typeof f === 'function';
                if (!isFunction(old)) return old;
                return old.apply(this, isFunction(f) ? f(arguments) : arguments);
            };
        }
    }

    function _showDiag() {
        let _cont = {
            about: '当Auto.js拥有该权限时\n' +
                '可以通过代码修改系统设置的参数值\n' +
                '如亮度设置/音量设置/屏幕超时等\n\n' +
                '如"蚂蚁森林"项目的关屏策略之一\n' +
                '就是利用此权限实现关屏的\n' +
                '详情可点击"适用场景"\n\n' +
                '点击"跳转设置页面"\n' +
                '可跳转到权限设置页面\n' +
                '用户可自行决定打开或关闭\n' +
                'Auto.js的"修改系统设置"权限\n' +
                '页面跳转后此对话框将自动关闭',
            situation: '1. 利用修改屏幕超时实现关屏\n\n' +
                '通常在"屏幕"或"显示"设置中\n' +
                '包含"屏幕超时时间"的设置\n' +
                '如"1分钟"表示在设备没有接收到\n' +
                '屏幕触碰事件或按键响应事件后\n' +
                '屏幕将自动关闭\n' +
                '使用代码将此值修改为最小值后\n' +
                '屏幕将在几秒钟内自动关闭\n' +
                '进而实现非Root设备无法实现\n' +
                '的代码关屏功能\n\n' +
                '注意:\n' +
                '1. 在等待屏幕关闭期间\n' +
                '要避免触碰屏幕或按键\n' +
                '否则屏幕超时时间将被重置\n' +
                '由此可能导致在指定时间内\n' +
                '屏幕无法按时关闭\n' +
                '进而导致屏幕关闭失败\n' +
                '2. 此功能在无人值守时\n' +
                '可能才会有较高的使用价值\n' +
                '3. 部分用户可能开启了\n' +
                '充电保持屏幕唤醒的功能\n' +
                '代码中已考虑并适用此情形\n' +
                '4. 代码会在屏幕关闭的瞬间\n' +
                '立即恢复修改之前的设置值\n' +
                '因此用户无需手动改回',
        };

        dialogsx.builds(['关于"修改系统设置"权限', _cont.about,
            '适用场景', 'X', '跳转设置页面', 1])
            .on('neutral', (d) => {
                dialogsx.builds(['权限在Auto.js的使用场景',
                    _cont.situation, 0, 0, 'B', 1])
                    .on('positive', ds => ds.dismiss())
                    .show();
            })
            .on('negative', (d) => {
                d.dismiss();
            })
            .on('positive', (d) => {
                d.dismiss();
                _activity();
            })
            .show();

        // tool function(s) //

        function _activity() {
            (global.appx ? appx : app).startActivity(
                new android.content.Intent(android.provider.Settings.ACTION_MANAGE_WRITE_SETTINGS)
                    .setData(android.net.Uri.parse('package:' + context.packageName))
                    .addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            );
        }
    }
}();