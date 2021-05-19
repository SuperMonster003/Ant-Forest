/**
 * Alipay ant forest energy rain harvesting script
 * @author SuperMonster003
 * @see https://github.com/SuperMonster003/Ant-Forest
 */

global.$$flag = Object.assign(global.$$flag || {}, {debug_info_avail: false});
global.$$app = Object.assign(global.$$app || {}, {alipay_pkg: 'com.eg.android.AlipayGphone'});

!function () {
    'use strict';

    let requireMod = s => require(files.path('../modules/' + s));

    requireMod('mod-monster-func').load();
    requireMod('ext-app').load();
    requireMod('ext-global').load();
    requireMod('ext-images').load().permit();
    requireMod('ext-threads').load();
    requireMod('ext-device').load().getDisplay(true);

    let sels = {
        entrance: '开始拯救绿色能量',
        finish: /本次拯救绿色能量数|返回蚂蚁森林/,
        result: /\d+g/,
    };

    greet() && launch() && $$link(monitor).$(collect).$(result);

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

        let _w_ent = null;
        let _cond_ent = () => _w_ent = $$sel.pickup(sels.entrance);
        let _w_fin = null;
        let _cond_fin = () => _w_fin = $$sel.pickup(sels.finish);
        let _cond = () => _cond_ent() || _cond_fin();

        if (!waitForAction(_cond, 8e3, 120)) {
            return messageAction('进入"能量雨"主页超时', 3, 1, 0, 2);
        }
        if (_w_fin) {
            return messageAction('没有"能量雨"收集机会', 3, 1, 0, 2);
        }

        let _max = 5;
        sleep(320);
        while (_max--) {
            clickAction(_w_ent, 'w');
            if (waitForAction(() => !_cond_ent(), 2e3, 80)) {
                break;
            }
        }
        if (_max < 0) {
            return messageAction('点击"能量雨"开始按钮失败', 3, 1, 0, 2);
        }
        return true;
    }

    function monitor() {
        threadsx.start(function monitorContinuousClick() {
            while (!$$flag.e_rain_clicked) {
                sleep(120);
            }
            while (!$$flag.e_rain_finished) {
                if (!waitForAction(() => $$flag.e_rain_clicked, 1.2e3, 50)) {
                    return $$flag.e_rain_finished = true;
                }
                delete $$flag.e_rain_clicked;
            }
        });

        threadsx.start(function monitorFinishCondition() {
            while (!$$flag.e_rain_finished) {
                if ($$sel.pickup(sels.finish)) {
                    return $$flag.e_rain_finished = true;
                }
                sleep(120);
            }
        });
    }

    function collect() {
        // let _press_time = 100;
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
                clickAction(_pt, 'p', {pt$: _press_time});
                $$flag.e_rain_clicked = true;
                sleep(_press_itv);
            }
        }
    }

    function result() {
        !function () {
            if ($$sel.pickup(sels.finish)) {
                let _mch = $$sel.pickup(sels.result, 'txt').match(/\d+/);
                if (_mch) {
                    return messageAction('游戏结果: ' + _mch[0] + 'g', 1, 1);
                }
            }
            messageAction('游戏结果: 统计失败', 3, 1);
        }();
        messageAction('"能量雨"任务结束', 1, 0, 0, '2_n');
    }
}();