/**
 * Alipay ant forest energy rain harvesting script
 * @author SuperMonster003
 * @see https://github.com/SuperMonster003/Ant-Forest
 */

global.$$flag = Object.assign(global.$$flag || {}, {debug_info_avail: false});
global.$$app = Object.assign(global.$$app || {}, {alipay_pkg: 'com.eg.android.AlipayGphone'});

!function () {
    'use strict';

    require('../modules/mod-monster-func').load();
    require('../modules/ext-app').load();
    require('../modules/ext-global').load();
    require('../modules/ext-threads').load();
    require('../modules/ext-images').load().permit();
    require('../modules/ext-device').load().getDisplay(true);

    /** @type {Object<string,UiSelector$pickup$sel_body>} */
    let sels = {
        entrance: '开始拯救绿色能量',
        finish: /本次拯救绿色能量数|.*(机会已用完|明天再来|返回蚂蚁森林).*/,
        bonus: ['再来一次', {clickable: true}],
        manual: /.*送好友机会.*/,
        result: /.*拯救了\d+g绿色能量.*|\d+g/,
    };

    let _w_ent = null;
    let _cond_ent = () => _w_ent = $$sel.pickup(sels.entrance);
    let _w_bonus = null;
    let _cond_bonus = () => _w_bonus = $$sel.pickup(sels.bonus);
    let _w_fin = null;
    let _cond_fin = () => _w_fin = $$sel.pickup(sels.finish);
    let _w_manual = null;
    let _cond_manual = () => _w_manual = $$sel.pickup(sels.manual);

    /** @type {number[]} */
    let results = [];

    if (greet() && launch()) {
        do {
            $$link(monitor).$(collect).$(statistics).$(clean);
        } while (bonus());
        result();
    }

    // tool function(s) //

    function greet() {
        return messageAction('开始"能量雨"任务', 1, 1, 0, 2);
    }

    function launch() {
        appx.startActivity({
            url: {
                src: 'alipays://platformapi/startapp',
                query: {
                    saId: 20000067,
                    url: 'https://68687791.h5app.alipay.com/www/index.html',
                },
            },
            packageName: $$app.alipay_pkg,
        });

        threadsx.start(function monitorOpenDialog() {
            let _w = null;
            if (waitForAction(() => _w = $$sel.pickup('打开'), 4e3, 120)) {
                clickAction(_w, 'w');
            }
        });

        let _cond = () => _cond_bonus() || _cond_manual() || _cond_ent() || _cond_fin();

        if (!waitForAction(_cond, 15e3, 120)) {
            return messageAction('进入"能量雨"主页超时', 3, 1, 0, 2);
        }
        debugInfo('进入"能量雨"主页成功');

        sleep(320);
        // just in case
        _cond();

        if (_w_bonus) {
            let _name = $$sel.pickup(_w_bonus, 'txt').surround('"');
            if (clickAction(_w_bonus, 'w', {condition_success: () => !_cond_bonus()})) {
                debugInfo('点击' + _name + '按钮成功');
                return true;
            }
            return messageAction('点击' + _name + '按钮失败', 3, 1, 0, 2);
        }
        if (_w_manual) {
            return messageAction('可能需用户手动干预并重启此工具', 3, 1, 0, 2);
        }
        if (_w_ent) {
            if (clickAction(_w_ent, 'w', {condition_success: () => !_cond_ent()})) {
                debugInfo('点击"能量雨"开始按钮成功');
                return true;
            }
            return messageAction('点击"能量雨"开始按钮失败', 3, 1, 0, 2);
        }
        return messageAction('可能没有"能量雨"收集机会', 3, 1, 0, 2);
    }

    function monitor() {
        threadsx.start(function monitorContinuousClick() {
            debugInfo('开启"连续点击"监测线程');
            while (!$$flag.e_rain_clicked) {
                sleep(120);
            }
            debugInfo('检测到能量雨滴首次点击');
            while (!$$flag.e_rain_finished) {
                if (!waitForAction(() => $$flag.e_rain_clicked, 2e3, 50)) {
                    debugInfo(['发送全局结束信号', '>指定时间内未检测到点击事件']);
                    return $$flag.e_rain_finished = true;
                }
                delete $$flag.e_rain_clicked;
            }
            debugInfo(['结束"连续点击"监测线程', '>检测到结束信号']);
        });

        threadsx.start(function monitorFinishCondition() {
            let _chkSel = type => $$sel.pickup(sels.finish, type);
            debugInfo('开启"结束条件"监测线程');
            while (!$$flag.e_rain_finished) {
                if (_chkSel('w')) {
                    debugInfo(['发送全局结束信号', '>检测到预置的结束条件']);
                    debugInfo('>' + _chkSel('selstr') + ': ' + _chkSel('txt'));
                    return $$flag.e_rain_finished = true;
                }
                sleep(120);
            }
            debugInfo(['结束"结束条件"监测线程', '>检测到结束信号']);
        });
    }

    function collect() {
        let _press_time = 20;
        let _press_itv = 160;

        while (!$$flag.e_rain_finished) {
            let _pts = imagesx.findAllPointsForColor(imagesx.capt(), '#daff00', {
                threshold: 0,
                region: [0, cY(0.14), W, cYx(0.4)],
                is_recycle_img: true,
            });
            if (_pts.length) {
                let _pt = _pts[_pts.length - 1];
                debugInfo('click: ' + (_pt.x + ', ' + _pt.y).surround('()'));
                clickAction(_pt, 'p', {pt$: _press_time});
                $$flag.e_rain_clicked = true;
                sleep(_press_itv);
            }
        }
    }

    function statistics() {
        if (waitForAction(() => $$sel.pickup(sels.finish), 8e3)) {
            let _mch = $$sel.pickup(sels.result, 'txt').match(/\d+/);
            if (_mch) {
                debugInfo('统计数据池存入新数据: ' + _mch[0]);
                results.push(Number(_mch[0]));
            } else {
                debugInfo('统计数据池存入新数据: NaN', 3);
                results.push(Number(NaN));
            }
        } else {
            debugInfo('统计数据时未能定位结束条件', 3);
            results.push(NaN);
        }
    }

    function clean() {
        debugInfo('结束全部监测线程并清除重要标志');
        threads.shutDownAll();
        delete $$flag.e_rain_clicked;
        delete $$flag.e_rain_finished;
    }

    function result() {
        debugInfo('统计数据池: ' + results.join(', ').surround('[]'));

        // CAUTION: result of `results.indexOf(NaN)` may be unexpected
        if (!results.length || results.findIndex(x => Number.isNaN(x)) > -1) {
            _showResult('游戏结果: 统计失败', 3);
        } else {
            _showResult('游戏结果: ' + _getResult(results));
        }
        messageAction('"能量雨"任务结束', 1, 0, 0, '2_n');

        // tool function(s) //

        /**
         * @param {string} msg
         * @param {number} [lv=1]
         */
        function _showResult(msg, lv) {
            $$toast(msg, 'Long');
            messageAction(msg, lv);
        }

        /**
         * @param {number[]} res
         * @returns {string}
         */
        function _getResult(res) {
            let _sum = res.reduce((x, y) => x + y);
            if (res.length < 2) {
                return _sum + 'g';
            }
            return _sum + 'g ' + res.map(x => x + 'g').join(' + ').surround('()');
        }
    }

    function bonus() {
        if (_cond_bonus()) {
            debugInfo('检测到"额外奖励"条件');
            debugInfo('>' + $$sel.pickup(_w_bonus, 'selstr')
                + ': ' + $$sel.pickup(_w_bonus, 'txt'));
            if (!clickAction(_w_bonus, 'w', {condition_success: () => !_cond_bonus()})) {
                return messageAction('点击"额外奖励"按钮失败', 3);
            }
            debugInfo('点击"额外奖励"按钮成功');
            return true;
        }
        if (_cond_manual()) {
            debugInfo('检测到特殊的"额外奖励"条件');

            let _msg = '等待用户手动干预以便继续';
            debugInfo(_msg);
            $$toast(_msg, 'Long');
            devicex.vibrate([100, 200, 100, 200, 200]);

            let _max = 42e3; // 42 seconds
            if (!waitForAction(_cond_ent, _max)) {
                return messageAction('等待用户手动干预超时', 3);
            }
            debugInfo(['用户手动干预成功', '>检测到"能量雨"开始按钮']);

            if (!clickAction(_w_ent, 'w', {condition_success: () => !_cond_ent()})) {
                return messageAction('点击"能量雨"开始按钮失败', 3);
            }
            debugInfo('点击"能量雨"开始按钮成功');
            return true;
        }
        return debugInfo('未检测到"额外奖励"条件');
    }
}();