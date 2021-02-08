updateMethodRequire();

let {waitForAction, messageAction, keycode} = require('../modules/mod-monster-func');

require('../modules/ext-images').load().permit();
require('../modules/ext-dialogs').load();
require('../modules/ext-device').load().getDisplay(true);

let storage_unlock = require('../modules/mod-storage').create('unlock');
let config_storage = storage_unlock.get('config', {});
let config_default = require('../modules/mod-default-config').unlock;

let path_base = files.getSdcardPath() + '/!lock-screen-layout/';
files.removeDir(path_base);
let path_container_page = path_base + 'container-page.png';
let path_unlock_page = path_base + 'unlock-page.png';
let path_unlock_bounds = path_base + 'unlock-bounds.png';
let path_device_info = path_base + 'device-info.txt';
files.createWithDirs(path_device_info);

let isUnlocked = () => !context.getSystemService(context.KEYGUARD_SERVICE).isKeyguardLocked();
let isScreenOn = () => device.isScreenOn();
let isScreenOff = () => !isScreenOn();

let info = device.brand + ' ' + device.product + ' ' + device.release + '\n' +
    'Display resolution: ' + device.width + ' × ' + device.height + '\n\n';
let device_brand = device.brand;

let keycode_power_bug = [/[Mm]eizu/].some(bug => device_brand.match(bug));

let operation_title = '解锁布局抓取';
let operation_hint = '请按照以下步骤抓取解锁布局\n\n' +
    '1. 屏幕 [自动关闭] 后 [自动亮起]\n' +
    '2. [自动滑动屏幕] 进入图案解锁页面\n' +
    '注: 若手机 [震动两下] 或 [自动滑动失败] 请 [手动滑动]\n' +
    '3. 等待手机 [长震] 后再 [手动解锁]\n' +
    '4. 出现布局后 [按提示操作]';
let operation_hint_manual = operation_hint
    .replace(/屏幕 \[自动关闭]/, '[手动关闭屏幕]')
    .replace(/ \[自动亮起]/, '等待 [自动亮起]');

let diag = dialogsx.builds([
    operation_title, !keycode_power_bug
        ? operation_hint : operation_hint_manual +
        '\n\n* * * * * *\n此设备不支持自动关屏\n' +
        '需点击"开始"按钮后30秒内手动关屏\n* * * * * *',
    0, 'Q', '开始', 1
]);
diag.on('positive', () => {
    diag.dismiss();
    threads.start(function () {
        if (!keycode_power_bug) {
            if (!keycode(26) || !waitForAction(isScreenOff, 2.4e3)) {
                dialogsx
                    .builds([
                        '自动关闭屏幕失败', '请点击 [继续] 按钮后 [手动关屏]\n' +
                        '然后等待屏幕 [自动亮起]\n继续按照 [前述提示] 操作',
                        ['查看前述提示', 'hint'], 'Q', 'N', 1
                    ])
                    .on('neutral', () => {
                        dialogsx.builds([
                            operation_title, operation_hint_manual, 0, 0, 'B', 1
                        ]).on('positive', ds => ds.dismiss()).show();
                    })
                    .on('negative', (d) => {
                        d.dismiss();
                        diag.dismiss();
                        exit();
                    })
                    .on('positive', d => d.dismiss())
                    .show();
            }
        }

        if (!waitForAction(isScreenOff, 30e3)) {
            messageAction('等待屏幕关闭超时', 8, 1);
        }

        sleep(500);
        device.wakeUp();
        let max_try_times_wake_up = 5;
        while (!waitForAction(isScreenOn, 2e3) && max_try_times_wake_up--) {
            device.wakeUp();
        }
        if (max_try_times_wake_up < 0) {
            messageAction('唤起设备失败', 8, 1);
        }
        sleep(1e3);

        device.keepScreenOn();

        info += captSelectorInfo('Container View');
        captureScreen(path_container_page);
        sleep(500);

        dismissLayer();
        sleep(800);

        info += captSelectorInfo('Unlock View');
        app.sendBroadcast('inspect_layout_bounds');
        captureScreen(path_unlock_page);
        device.vibrate(500);

        let device_info_file = files.open(path_device_info);
        files.write(path_device_info, info);
        device_info_file.close();

        if (!waitForAction(() => isUnlocked(), 25e3)) {
            alert('等待手动解锁超时');
            exit();
        }
        sleep(1e3);
        captureScreen(path_unlock_bounds);

        device.cancelKeepingAwake();
        setClip(path_base);

        dialogsx.builds([
            '布局抓取完毕', '请将"' + path_base + '"目录下的' +
            '文件 (通常为3个png和1个txt文件) [全部发送给开发者]\n\n' +
            '发送之前请仔细检查截图或文本中 [是否包含隐私信息]\n' +
            '如有请 [不要提交] 或 [修改后提交]\n\n' +
            '文件路径已复制到剪贴板中\n' +
            '[返回键] 可退出布局分析页面',
            0, 0, 'X', 1
        ]).on('positive', d => d.dismiss()).show();
    });
});
diag.on('negative', () => diag.dismiss());
diag.show();

// tool function(s) //

function updateMethod(o, name, f) {
    let _old = o[name];
    o[name] = function () {
        let _isF = f => typeof f === 'function';
        return _isF(_old) ? _old.apply(this, _isF(f) ? f(arguments) : arguments) : _old;
    };
}

function updateMethodRequire() {
    updateMethod(global, 'require', (args) => {
        let _path = args[0] || '';
        _path = './' + _path.replace(/^([./]*)(?=\w)/, '').replace(/(\.js)*$/, '') + '.js';
        for (let i = 0; ; i += 1) {
            if (files.exists(_path)) {
                return [_path];
            }
            if (i === 3) {
                return [args[0]];
            }
            _path = '.' + _path;
        }
    });
}

function captSelectorInfo(title) {
    let split_line = '-'.repeat(23);
    let info = '';
    let addSplitLine = no_cr_flag => info += split_line + (no_cr_flag ? '' : '\n');
    let addText = (text, no_cr_flag, split_lines_count) => {
        split_lines_count = split_lines_count || 0;
        split_lines_count-- > 0 && addSplitLine();
        info += text + (no_cr_flag ? '' : '\n');
        split_lines_count-- > 0 && addSplitLine();
    };
    let addSelector = (w, content_name) => ~addText(w[content_name]()) && addText('-> ' + w.bounds());

    addText('[ ' + title + ']', 0, 1);

    ~addText('_text_', 0, 2) && textMatches(/.+/).find().forEach(w => addSelector(w, 'text'));
    ~addText('_desc_', 0, 2) && descMatches(/.+/).find().forEach(w => addSelector(w, 'desc'));
    ~addText('_id_', 0, 2) && idMatches(/.+/).find().forEach(w => addSelector(w, 'id'));

    return info;
}

function dismissLayer() {
    let kw_preview_container_common = id('com.android.systemui:id/preview_container');
    let kw_preview_container_miui = idMatches(/com\.android\.keyguard:id\/(.*unlock_screen.*|.*notification_.*(container|view).*)/); // borrowed from e1399579 and modified
    let kw_preview_container_miui10 = idMatches(/com\.android\.systemui:id\/(.*lock_screen_container|notification_(container.*|panel.*)|keyguard_.*)/); // borrowed from e1399579 and modified
    let kw_preview_container_emui = idMatches(/com\.android\.systemui:id\/.*(keyguard|lock)_indication.*/);
    let kw_preview_container = null;
    let cond_preview_container = () => {
        return kw_preview_container = kw_preview_container_common.exists() && kw_preview_container_common ||
            kw_preview_container_miui.exists() && kw_preview_container_miui ||
            kw_preview_container_miui10.exists() && kw_preview_container_miui10 ||
            kw_preview_container_emui.exists() && kw_preview_container_emui ||
            null;
    };

    if (!waitForAction(() => kw_preview_container = cond_preview_container(), 2.5e3)) {
        device.vibrate(200);
        sleep(500);
        device.vibrate(200);
        return;
    }

    let vertical_pts = [0.95, 0.9, 0.82, 0.67, 0.46, 0.05];

    let max_try_times_dismiss_layer = 20;
    let data_from_storage_flag = false;
    let chances_for_storage_data = 3;
    let gesture_time = config_storage.unlock_dismiss_layer_swipe_time;

    if (gesture_time) {
        data_from_storage_flag = true;
    } else {
        gesture_time = config_default.unlock_dismiss_layer_swipe_time;
    }

    let half_width = cX(0.5);
    let gesture_params = [];
    vertical_pts.forEach(raw_y => gesture_params.push([half_width, cY(raw_y)]));

    while (max_try_times_dismiss_layer--) {
        gesture.apply(null, [gesture_time].concat(gesture_params));

        if (waitForAction(() => !kw_preview_container.exists(), 1.5e3)) {
            break;
        }
        if (cond_all_unlock_ways()) break;
        if (data_from_storage_flag) {
            if (--chances_for_storage_data < 0) {
                data_from_storage_flag = false;
                gesture_time = config_default.unlock_dismiss_layer_swipe_time;
            } else {
                max_try_times_dismiss_layer += 1;
            }
        } else {
            gesture_time += (gesture_time <= 130 ? 10 : 80);
        }
    }

    if (max_try_times_dismiss_layer < 0 && !waitForAction(() => !kw_preview_container.exists(), 25e3)) {
        alert('消除解锁页面提示层失败');
        exit();
    }
    return true;

    // tool function(s) //

    function cond_all_unlock_ways() {
        let kw_lock_pattern_view_common = id('com.android.systemui:id/lockPatternView');
        let kw_lock_pattern_view_miui = idMatches(/com\.android\.keyguard:id\/lockPattern(View)?/); // borrowed from e1399579 and modified
        let cond_lock_pattern_view = () =>
            kw_lock_pattern_view_common.exists() && kw_lock_pattern_view_common ||
            kw_lock_pattern_view_miui.exists() && kw_lock_pattern_view_miui ||
            null;

        let kw_password_view_common = idMatches(/.*passwordEntry/);
        let kw_password_view_miui = idMatches(/com\.android\.keyguard:id\/miui_mixed_password_input_field/); // borrowed from e1399579 and modified
        let cond_password_view = () =>
            kw_password_view_common.exists() && kw_password_view_common ||
            kw_password_view_miui.exists() && kw_password_view_miui ||
            null;

        let kw_pin_view_common = id('com.android.systemui:id/pinEntry');
        let kw_pin_view_miui = id('com.android.keyguard:id/numeric_inputview'); // borrowed from e1399579
        let kw_pin_view_emui_10 = id('com.android.systemui:id/fixedPinEntry');
        let kw_pin_view_emui = descMatches(/[Pp][Ii][Nn] ?(码区域|area)/);
        let cond_pin_view = () =>
            kw_pin_view_common.exists() && kw_pin_view_common ||
            kw_pin_view_miui.exists() && kw_pin_view_miui ||
            kw_pin_view_emui_10.exists() && kw_pin_view_emui_10 ||
            kw_pin_view_emui.exists() && kw_pin_view_emui ||
            null;

        let special_views = {
            'gxzw': [idMatches(/.*[Gg][Xx][Zz][Ww].*/), [0.0875, 0.47, 0.9125, 0.788]],
        };
        let cond_special_view = () => {
            let special_view_keys = Object.keys(special_views);
            for (let i = 0, l = special_view_keys.length; i < l; i += 1) {
                let value = special_views[special_view_keys[i]];
                if (value[0].exists()) return value[1];
            }
            return null;
        };

        return cond_lock_pattern_view() || cond_password_view() || cond_pin_view() || cond_special_view();
    }
}