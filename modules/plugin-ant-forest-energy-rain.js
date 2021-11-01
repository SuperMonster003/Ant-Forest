let {$$toast} = require('./mod-global');
let {uix} = require('./ext-ui');
let {appx} = require('./ext-app');
let {alipay} = require('./mod-alipay');
let {autojs} = require('./mod-autojs');
let {imagesx} = require('./ext-images');
let {enginesx} = require('./ext-engines');
let {threadsx} = require('./ext-threads');
let {consolex} = require('./ext-console');
let {a11yx, $$sel} = require('./ext-a11y');
let {devicex, $$disp} = require('./ext-device');

let _ = {
    cfg: {
        //// -=-= TEST =-=- ////
        is_debug: true,
        press_time: 20,
        press_itv: 0,
    },
    sel: {
        // @LegacyBackup as of Oct 22, 2021
        // entrance: [/开始拯救绿色能量|开启能量拯救之旅/, 'k2', {isCenterX: true}],
        // manual: [/.*送好友机会.*/, {isCenterX: true}],
        // result: [/.*拯救了\d+g绿色能量.*|\d+g/, {isCenterX: true}],
        // finish: [/.*(本次拯救.*能量|机会已用完|明天再来).*|今日已拯救能量雨/, {isCenterX: true}],
        // return: [/\s*返回蚂蚁森林\s*/, {isCenterX: true}],

        entrance: [/.*开[始启].*/, 'k2', {isCenterX: true}],
        bonus: ['再来一次', {c$: true, isCenterX: true}],
        manual: [/送TA机会|更多好友/, 'k2', {c$: true}],
        result: [/恭喜获得|今日累计获取/, {isCenterX: true}],
        finish: [/恭喜获得|今日累计获取/, {isCenterX: true}],
        retry: ['立即重试', {c$: true}],
    },
    w: {
        cache: {},
        ent: () => _.w.cache.ent = $$sel.pickup(_.sel.entrance),
        bonus: () => _.w.cache.bonus = $$sel.pickup(_.sel.bonus),
        finish: () => _.w.cache.finish = $$sel.pickup(_.sel.finish),
        manual: () => _.w.cache.manual = $$sel.pickup(_.sel.manual),
        result: () => _.w.cache.result = $$sel.pickup(_.sel.result),
    },
    cond: {
        ent: () => _.w.ent() && !_.w.finish(),
        bonus: () => _.w.bonus() && !_.w.ent(),
        finish: () => _.w.finish() && !_.w.ent() && !_.w.bonus(),
        manual: () => _.w.manual() && !_.w.ent() && !_.w.bonus(),
        result: () => _.w.result(),
        launch: () => _.w.bonus() || _.w.manual() || _.w.ent() || _.w.finish(),
    },
    flag: {},
    /** @type {number[]} */
    results: [],
    ensureCaptPermission() {
        try {
            if (imagesx.permit()) {
                return true;
            }
        } catch (e) {
            consolex.e(e, 0, 0, 2);
        }
        consolex.e('退出"能量雨"页面并强制结束脚本', 2, 0, 2);
        devicex.keycode('back', {rush: true});
        exit();
    },
    capt() {
        this.img = imagesx.capt();
    },
    findPoints() {
        this.pts = imagesx.findAllPointsForColor(this.img, '#DAFF00', {
            threshold: 0,
            region: [cX(0.15), cYx(0.16), cX(0.85), cYx(0.36)],
        });
    },
    isSamePoint(a, b) {
        return typeof a === 'object' && typeof b === 'object'
            && a !== null && b !== null
            && Math.abs(a.x - b.x) < 5
            && Math.abs(a.y - b.y) < 5;
    },
    clickPoint() {
        let _len = this.pts.length;
        if (_len > 0) {
            let _pt = this.pts[_len - 1];
            a11yx.click(_pt, 'p', {
                pt$: this.cfg.press_time,
                bt$: this.cfg.press_itv,
            });
            if (this.last_point) {
                this.flag.e_rain_clicked = !this.isSamePoint(this.last_point, _pt);
            }
            this.last_point = _pt;
        }
    },
    /**
     * @param {Object} options
     * @param {UiObject$} [options.widget]
     * @param {string} [options.name]
     * @param {A11yx.Click.Options['condition']} [options.cond]
     * @return {boolean}
     */
    clickBtn(options) {
        let {widget, name, cond} = options || {};
        if (a11yx.click([widget, 'k2'], 'w', {condition: cond})) {
            consolex._('点击' + name + '按钮成功');
            return true;
        }
        return consolex.w('点击' + name + '按钮失败', 1, 0, 2);
    },
};

let $ = {
    check() {
        devicex.ensureSdkInt();
        autojs.ensureVersion();
        appx.checkAccessibility();
    },
    greet() {
        consolex.d('开始"能量雨"任务', 1, 0, 2);
        consolex.debug.switchSet(_.cfg.is_debug);
    },
    launch() {
        alipay.startApp('af_energy_rain');

        if (a11yx.wait(_.cond.launch.bind(_.cond), 20e3, 80)) {
            consolex._('进入"能量雨"主页成功');
            return true;
        }
        return consolex.w('进入"能量雨"主页超时', 4, 0, 2);
    },
    ready() {
        if ($$disp.is_display_rotation_landscape) {
            consolex._('重新获取当前设备屏幕显示信息');
            $$disp.refresh();
        }
        if (_.cond.bonus()) {
            consolex._('已匹配"额外奖励"准备条件');
            return _.clickBtn({
                widget: _.w.cache.bonus,
                name: $$sel.pickup(_.w.cache.bonus, 'txt').surround('"'),
                cond: () => !_.cond.bonus(),
            }) && _.ensureCaptPermission();
        }
        if (_.cond.manual()) {
            consolex._('已匹配"手动干预"准备条件');
            return consolex.w('可能需用户手动干预并重启此工具', 4, 0, 2);
        }
        if (_.cond.ent()) {
            consolex._('已匹配"游戏入口"准备条件');
            return _.clickBtn({
                widget: _.w.cache.ent,
                name: '"能量雨"开始',
                cond: () => !_.cond.ent(),
            }) && _.ensureCaptPermission();
        }
        return consolex.w('可能没有"能量雨"收集机会', 4, 0, 2);
    },
    monitor() {
        let $ = {
            click: {
                firstTime() {
                    let _max = 9e3;
                    let _itv = 180;
                    while (!_.flag.e_rain_clicked) {
                        sleep(_itv);
                        if ((_max -= _itv) < 0) {
                            consolex._(['发送全局结束信号', '等待能量雨滴首次点击超时']);
                            _.flag.e_rain_finished = true;
                            return false;
                        }
                    }
                    consolex._('检测到能量雨滴首次点击');
                    return true;
                },
                continuous() {
                    consolex._('开启"连续点击"监测线程');
                    while (!_.flag.e_rain_finished) {
                        if (!a11yx.wait(() => _.flag.e_rain_clicked, 2e3, 80)) {
                            consolex._(['发送全局结束信号', '指定时间内未检测到点击事件']);
                            return _.flag.e_rain_finished = true;
                        }
                        delete _.flag.e_rain_clicked;
                    }
                    consolex._(['结束"连续点击"监测线程', '检测到结束信号']);
                },
            },
            finish() {
                consolex._('开启"结束条件"监测线程');
                while (!_.flag.e_rain_finished) {
                    if (_.cond.finish() || _.cond.bonus()) {
                        consolex._(['发送全局结束信号', '检测到预置的结束条件']);
                        return _.flag.e_rain_finished = true;
                    }
                    let _w_retry = $$sel.pickup(_.sel.retry);
                    if (_w_retry) {
                        a11yx.click(_w_retry, 'w');
                        devicex.keycode('back', {rush: true});

                        let _ctd = 3, _retry = 5;
                        $$toast('即将在 ' + _ctd + ' 秒内重启能量雨工具', 'L', 'F');
                        sleep(_ctd * 1e3);
                        enginesx.restart({max_restart_e_times: _retry});
                    }
                    sleep(120);
                }
                consolex._(['结束"结束条件"监测线程', '检测到结束信号']);
            },
            start() {
                threadsx.start(() => {
                    if (this.click.firstTime()) {
                        threadsx.start(() => this.click.continuous());
                        threadsx.start(() => this.finish());
                    }
                });
            },
        };

        $.start();
    },
    collect() {
        while (1) {
            for (let act of [_.capt, _.findPoints, _.clickPoint]) {
                if (_.flag.e_rain_finished) {
                    return;
                }
                act.call(_);
            }
        }
    },
    clean() {
        consolex._('结束全部监测线程并清除相关标识');
        threads.shutDownAll();
        delete _.flag.e_rain_clicked;
        delete _.flag.e_rain_finished;
    },
    statistics() {
        a11yx.wait(() => _.cond.result(), 5e3, 80, {
            then(res) {
                // @LegacyBackup as of Oct 22, 2021
                // let _mch = $$sel.pickup(res, 'txt').match(/\d+/);

                let _mch = $$sel.traverse([res, 'p2'], (w) => {
                    return $$sel.pickup(w, 'txt').match(/\s*\+?\d+g\s*/);
                }, 'txt').match(/\d+/);
                if (_mch) {
                    consolex._('统计数据池存入新数据: ' + _mch);
                    _.results.push(Number(_mch));
                } else {
                    consolex._('统计数据池存入新数据: NaN', 3);
                    _.results.push(NaN);
                }
            },
            else() {
                consolex._('统计数据时未能定位数据控件', 3);
                _.results.push(NaN);
            },
        });
    },
    bonus() {
        let _name_extra_bonus = '额外奖励';
        let _bonus_triggerred = '检测到' + _name_extra_bonus + '条件';
        let _bonus_not_triggerred = '未' + _bonus_triggerred;
        if (_.cond.bonus()) {
            let _w = _.w.cache.bonus;
            consolex._(_bonus_triggerred + ':');
            consolex._($$sel.pickup(_w, 'txt'));
            return _.clickBtn({
                widget: _w,
                name: _name_extra_bonus,
            });
        }
        if (_.cond.manual()) {
            let _act = '用户手动干预';
            let _name_start_btn = '"能量雨"开始';

            consolex._(_bonus_triggerred);

            !function remind$iiFe() {
                let _msg = '等待' + _act + '以便继续';
                consolex._(_msg);
                $$toast(_msg, 'long');
                devicex.vibrate([100, 200, 100, 200, 200]);
            }();

            return a11yx.wait(() => _.cond.ent(), 42e3, 80, {
                then() {
                    consolex._(_act + '成功');
                    consolex._('检测到' + _name_start_btn + '按钮');
                    return _.clickBtn({
                        widget: _.w.cache.ent,
                        name: _name_start_btn,
                        cond: () => !_.cond.ent(),
                    });
                },
                else() {
                    consolex.w('等待' + _act + '超时', 4);
                },
            });
        }
        consolex._(_bonus_not_triggerred);
    },
    result() {
        if (_.results.length) {
            consolex._('统计数据池: ' + _.results);
            if (!_.results.includes(NaN)) {
                consolex.d('游戏结果: ' + _getResult(_.results), 4);
            } else {
                consolex.w('游戏结果: 统计失败', 4);
            }
        }
        consolex.debug.switchBack();
        consolex.d('"能量雨"任务结束', 0, 0, '2n');

        // tool function(s) //

        /**
         * @param {number[]} res
         * @return {string}
         */
        function _getResult(res) {
            let _sum = res.reduce((x, y) => x + y);
            if (res.length < 2) {
                return _sum + 'g';
            }
            return _sum + 'g\x20' + res.map(x => x + 'g').join(' + ').surround('()');
        }
    },
    start() {
        this.check();
        this.greet();
        if (this.launch() && this.ready()) {
            do {
                this.monitor();
                this.collect();
                this.statistics();
                this.clean();
            } while (this.bonus());
        }
        this.result();
    },
};

/** @type {Plugin$Exportation} */
let exp = {
    dialog: null,
    view: null,
    run() {
        $.start();
    },
    config() {
        uix.ensureUiMode({is_show_hint: true});

        //// -=-= PENDING =-=- ////
        ui.layout(<vertical>
            <frame>
                <x-text text="123" size="99"/>
            </frame>
        </vertical>);
    },
    isInPage() {
        return _.cond.launch();
    },
};

typeof module === 'object' ? module.exports = exp : exp.run();