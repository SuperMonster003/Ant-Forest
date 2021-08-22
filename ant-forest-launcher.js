/**
 * Alipay ant forest intelligent collection script launcher
 * @since Aug 22, 2021
 * @version 2.1.10
 * @author SuperMonster003
 * @see https://github.com/SuperMonster003/Ant-Forest
 */

'use strict';

let $$init = {
    appx() {
        try {
            return require('./modules/ext-app');
        } catch (e) {
            if (!files.exists('./modules/ext-app.js')) {
                console.error('ext-app模块不存在');
                console.error('请检查项目目录结构');
            }
            throw Error(e + '\n' + e.stack);
        }
    },
    check() {
        this.appx().load();
        appx.checkModules([
            'mod-treasury-vault', 'mod-database', 'mod-pwmap',
            'mod-default-config', 'mod-monster-func', 'ext-storages',
            'ext-engines', 'ext-images', 'ext-timers', 'ext-dialogs', 'ext-ui',
            'ext-threads', 'ext-global', 'ext-device', 'ext-console', 'ext-app',
        ], {is_load: true});
        appx.checkAlipayPackage();
        appx.checkSdkAndAJVer();
        appx.checkScreenOffTimeout();
        appx.checkAccessibility();

        return $$init;
    },
    global() {
        setGlobalFunctions();
        setGlobalObjects();
        setGlobalFlags();
        setGlobalLog();

        debugInfo('开发者测试日志已启用', 'Up_both_dash');
        debugInfo('设备型号: ' + device.brand + ' ' + device.product);

        setDisplay();

        appSetter().setTask().setBlist().setPages().setLayout().setIntent();
        accSetter().setParams().setMain();

        debugInfo('Auto.js版本: ' + $$app.autojs_ver_name);
        debugInfo('项目版本: ' + $$app.project_ver_name);
        debugInfo('安卓SDK版本: ' + device.sdkInt);
        debugInfo('安卓系统版本: ' + device.release);
        debugInfo('Root权限: ' + ($$app.has_root ? '已获取' : '未获取'));

        return $$init;

        // tool function(s) //

        function setGlobalFunctions() {
            require('./modules/mod-monster-func').load();
            Object.defineProperty(global, 'messageAction$', {
                get: () => $$flag.msg_details ? messageAction : (m, lv) => ![3, 4].includes(lv),
            });
            Object.defineProperty(global, 'showSplitLine$', {
                get: () => $$flag.msg_details ? showSplitLine : () => void 0,
            });
        }

        function setGlobalObjects() {
            global.$$flag = {
                autojs_has_root: appx.hasRoot(),
                autojs_has_secure: appx.hasSecure(),
            };

            global.$$sto = {
                af: storagesx.create('af'),
                af_next: storagesx.create('af_auto'),
                af_ins: storagesx.create('af_ins'),
                af_cfg: storagesx.create('af_cfg'),
                af_blist: storagesx.create('af_blist'),
                af_flist: storagesx.create('af_flist'),
            };

            global.$$cfg = Object.assign({},
                require('./modules/mod-default-config').af,
                $$sto.af_cfg.get('config'));

            global.$$db = require('./modules/mod-database').create([
                {name: 'name', not_null: true},
                {name: 'timestamp', type: 'integer', primary_key: true},
                {name: 'pick', type: 'integer'},
                // TODO...
                // {name: 'e_dblclick', type: 'integer'},
            ], {alter: 'union'});

            global.$$app = {
                developer: _unTap('434535154232343343441542000003'),
                rl_title: _unEsc('2615FE0F0020597D53CB6392884C699C'),
                task_name: _unEsc('8682868168EE6797').surround('"'),
                autojs_name: appx.getAutoJsName(),
                autojs_pkg: appx.getAutoJsPkgName(),
                alipay_pkg: global._$_alipay_pkg,
                autojs_ver_name: appx.getAutoJsVerName(),
                project_ver_name: appx.getProjectLocalVerName(),
                init_scr_on: devicex.is_init_screen_on,
                init_fg_pkg: currentPackage(),
                engines_exec_argv: enginesx.my_engine_exec_argv,
                cwd: enginesx.cwd,
                cwp: enginesx.cwp,
                local_pics_path: _getLocalPicsPath(),
                has_root: $$flag.autojs_has_root,
                root_fxs: $$cfg.root_access_functions,
                fri_drop_by: {
                    _pool: [],
                    _max: 5,
                    ic(name) {
                        let _ctr = this._pool[name] || 0;
                        if (_ctr === this._max) {
                            debugInfo('发送排行榜复查停止信号');
                            debugInfo('>已达连续好友访问最大阈值');
                            $$flag.rl_review_stop = true;
                        }
                        this._pool[name] = ++_ctr;
                    },
                    dc(name) {
                        let _ctr = this._pool[name] || 0;
                        this._pool[name] = _ctr > 1 ? --_ctr : 0;
                    },
                },
                get now() {
                    return new Date();
                },
                get ts() {
                    return Date.now();
                },
                get ts_sec() {
                    return Date.now() / 1e3 >> 0;
                },
                exit() {
                    this.layout.closeAll();
                    floaty.closeAll(); // just in case
                    debugInfo('关闭所有floaty悬浮窗');
                    if (this.queue.excl_tasks_all_len > 1) {
                        debugInfo('移除当前脚本广播监听器');
                        events.broadcast.removeAllListeners();
                        debugInfo('发送初始屏幕开关状态广播');
                        events.broadcast.emit('init_scr_on_state_change', this.init_scr_on);
                    }
                    messageAction(this.task_name + '任务结束', 1, 0, 0, '2_n');
                    // exit() might cause ScriptInterruptedException
                    // as $$app.exit might invoked within Promise
                    ui.post(exit);
                },
            };

            global.$$sel.add('af', '蚂蚁森林')
                .add('alipay_home', [/首页|Homepage/, {bi$: [0, cY(0.7), W, H]}])
                .add('af_title', [/蚂蚁森林|Ant Forest/, {bi$: [0, 0, cX(0.4), cY(0.2)]}])
                .add('af_home', /合种|背包|通知|攻略|任务|.*大树养成.*/)
                .add('energy_amt', /^\s*\d+(\.\d+)?(k?g|t)\s*$/)
                .add('rl_title', $$app.rl_title)
                .add('rl_ent', /查看更多好友|View more friends/)
                .add('rl_end_idt', /.*没有更多.*/)
                .add('list', className('ListView'))
                .add('fri_tt', [/.+的蚂蚁森林/, {bi$: [0, 0, cX(0.95), cY(0.2)]}])
                .add('cover_used', /.*使用了保护罩.*/)
                .add('wait_awhile', /.*稍等片刻.*/)
                .add('reload_frst_page', '重新加载')
                .add('close_btn', /关闭|Close/)
                .add('login_btn', /登录|Log in|.*loginButton/)
                .add('login_new_acc', /换个新账号登录|[Aa]dd [Aa]ccount/)
                .add('login_other_acc', /换个账号登录|.*switchAccount/)
                .add('login_other_mthd_init_pg', /其他登录方式|Other accounts/)
                .add('login_other_mthd', /换个方式登录|.*[Ss]w.+[Ll]og.+thod/)
                .add('login_by_code', /密码登录|Log ?in with password/)
                .add('login_next_step', /下一步|Next|.*nextButton/)
                .add('input_lbl_acc', /账号|Account/)
                .add('input_lbl_code', /密码|Password/)
                .add('switch_to_other_acc', idMatches(/.+_item_account/))
                .add('login_err_ensure', idMatches(/.*ensure/))
                .add('login_err_msg', (type) => {
                    let _t = type || 'txt';
                    return $$sel.pickup(id('com.alipay.mobile.antui:id/message'), _t)
                        || $$sel.pickup([$$sel.get('login_err_ensure'), 'p2c0>0>0'], _t);
                })
                .add('acc_logged_out', new RegExp('.*('
                    + /在其他设备登录|logged +in +on +another/.source + '|'
                    + /.*账号于.*通过.*登录.*|account +logged +on +to/.source + ').*'));

            // tool function(s) //

            function _unEsc(s) {
                return typeof String.fromCharCode === 'function'
                    ? s.replace(/.{4}/g, $ => String.fromCharCode(parseInt($, 16)))
                    : unescape(s.replace(/.{4}/g, '%u$&'));
            }

            function _unTap(s) {
                // Person of Interest Season 2 Episode 2 at 00:39:03
                // Tap code in this episode was '4442112433434433'
                let _map = [
                    ['A', 'B', 'C', 'D', 'E'],
                    ['F', 'G', 'H', 'I', 'J'],
                    ['L', 'M', 'N', 'O', 'P'],
                    ['Q', 'R', 'S', 'T', 'U'],
                    ['V', 'W', 'X', 'Y', 'Z'],
                ];
                return s.match(/../g).reduce((a, b) => {
                    let [_row, _col] = b;
                    return a + (+_row ? _map[--_row][--_col] : _col);
                }, String());
            }

            function _getLocalPicsPath() {
                let _path = files.getSdcardPath() + '/.local/pics/';
                files.createWithDirs(_path);
                return _path;
            }
        }

        function setGlobalFlags() {
            let _cnsl_detail = $$cfg.console_log_details;
            let _dbg_info_sw = $$cfg.debug_info_switch;
            let _msg_sw = $$cfg.message_showing_switch;
            let _console_msg_sw = _msg_sw && $$cfg.console_log_switch;
            $$flag.msg_details = _cnsl_detail || _dbg_info_sw;
            $$flag.no_msg_action = !_console_msg_sw;
            $$flag.debug_info_avail = _dbg_info_sw && _console_msg_sw;
            $$flag.show_energy_result = _msg_sw && $$cfg.result_showing_switch;
            $$flag.show_floaty_result = $$cfg.floaty_result_switch;

            let _e_argv = $$app.engines_exec_argv;
            if (Object.size(_e_argv, {exclude: 'intent'}) > 0) {
                if (!$$und(_e_argv.is_debug_info)) {
                    $$flag.debug_info_avail = !!_e_argv.is_debug_info;
                }
                if ($$und(_e_argv.instant_run_flag)) {
                    _e_argv.instant_run_flag = true;
                }
                if ($$und(_e_argv.no_insurance_flag)) {
                    _e_argv.no_insurance_flag = true;
                }
            }
        }

        function setGlobalLog() {
            $$cfg.global_log_switch && consolex.setGlobalLogConfig({
                file: $$cfg.global_log_cfg_path + 'auto.js-log.log',
                filePattern: $$cfg.global_log_cfg_file_pattern,
                maxBackupSize: $$cfg.global_log_cfg_max_backup_size,
                maxFileSize: $$cfg.global_log_cfg_max_file_size << 10,
            });
        }

        function setDisplay() {
            if (devicex.getDisplay(true).is_display_rotation_landscape) {
                if ($$flag.show_energy_result) {
                    messageAction$('当前设备屏幕为水平显示方向', 3, 0, 0, 'up_dash');
                    messageAction$('悬浮窗结果展示方式已被禁用', 3, 0, 0, 'dash');
                    $$flag.show_floaty_result = false;
                }
            }
        }

        function appSetter() {
            return {
                setTask() {
                    /**
                     * @param {number} du_minute
                     * @param {{is_toast?: boolean, is_async?: boolean}} [options]
                     */
                    $$app.setPostponedTask = function (du_minute, options) {
                        if ($$flag.postponed_task_deploying) {
                            return;
                        }
                        $$flag.postponed_task_deploying = true;

                        let _opt = options || {};
                        let _is_async = _opt.is_async === undefined || _opt.is_async === true;
                        let _is_toast = _opt.is_toast === undefined || _opt.is_toast === true;

                        let _task_s = this.task_name + '任务';
                        let _du_str = du_minute + '分钟';
                        _is_toast && toast(_task_s + '推迟 ' + _du_str);
                        messageAction('推迟' + _task_s, 1, 0, 0, -1);
                        messageAction('推迟时长: ' + _du_str, 1, 0, 0, 1);

                        let _this = this;
                        let _ts = this.ts + du_minute * 60e3;
                        let _suff = $$sto.af.get('fg_blist_ctr') ? '_auto' : '';

                        timersx.addDisposableTask({
                            path: _this.cwp,
                            date: _ts,
                            is_async: _is_async,
                            callback: (task) => _this.setStoAutoTask({
                                task: task,
                                next_ts: _ts,
                                next_type: 'postponed' + _suff,
                            }, () => _this.exit(true)),
                        });
                    };
                    /**
                     * @param {Object} auto_task
                     * @param {org.autojs.autojs.timing.TimedTask} auto_task.task
                     * @param {number} auto_task.next_ts
                     * @param {NextAutoTaskType} auto_task.next_type
                     * @param {function(task:org.autojs.autojs.timing.TimedTask)} [callback]
                     * @returns {org.autojs.autojs.timing.TimedTask}
                     */
                    $$app.setStoAutoTask = function (auto_task, callback) {
                        /**
                         * @typedef {
                         *     'uninterrupted'|'min_countdown'|'postponed'|'postponed_auto'
                         * } NextAutoTaskType
                         * @typedef {{
                         *     task_id?: number,
                         *     timestamp?: number,
                         *     type?: NextAutoTaskType,
                         * }} NextAutoTaskInfo
                         */
                        let _info = {
                            task_id: auto_task.task.id,
                            timestamp: auto_task.next_ts,
                            type: auto_task.next_type,
                        };
                        this.removeStoAutoTaskIFN(_info);
                        $$sto.af_next.put('next_auto_task', _info);

                        if (typeof callback === 'function') {
                            callback(auto_task.task);
                        }

                        return auto_task.task;
                    };
                    /**
                     * @param {NextAutoTaskInfo} [def]
                     * @returns {NextAutoTaskInfo}
                     */
                    $$app.getStoAutoTask = function (def) {
                        return $$sto.af_next.get('next_auto_task', def || {});
                    };
                    /**
                     * @param {NextAutoTaskInfo} task
                     * @returns {boolean}
                     */
                    $$app.removeStoAutoTaskIFN = function (task) {
                        let _sto_id = this.getStoAutoTask().task_id;
                        if (_sto_id > 0 && _sto_id !== task.task_id) {
                            debugInfo(['移除旧的自动定时任务', '任务ID: ' + _sto_id]);
                            timersx.removeTimedTask(_sto_id, {is_async: true});
                        }
                    };

                    return this;
                },
                setBlist() {
                    $$app.blist = {
                        _expired: {
                            trigger(o) {
                                return o.timestamp < $$app.ts;
                            },
                            showMsg(o) {
                                let _du_ts = o.timestamp - $$app.ts;
                                let _0h_ts = Date.parse(new Date().toDateString());
                                let _du_date = new Date(_0h_ts + _du_ts);

                                let _d_unit = 24 * 3.6e6;
                                let _d = Math.trunc(_du_ts / _d_unit);
                                let _d_str = _d ? _d + '天' : '';
                                let _h = _du_date.getHours();
                                let _h_str = _h ? _h.padStart(2, 0) + '时' : '';
                                let _m = _du_date.getMinutes();
                                let _m_str = _h || _m ? _m.padStart(2, 0) + '分' : '';
                                let _s = _du_date.getSeconds();
                                let _s_str = (_h || _m ? _s.padStart(2, 0) : _s) + '秒';

                                messageAction$(_d_str + _h_str + _m_str + _s_str + '后解除', 1, 0, 1);
                            },
                        },
                        _showMsg: {
                            msg(m) {
                                messageAction$(m, 1, 0, 1);
                            },
                            add(o) {
                                this.msg('已加入黑名单');
                                this.reason(o);
                                this.expired(o);
                            },
                            exists(o) {
                                this.msg('黑名单好友');
                                this.msg('已跳过收取');
                                this.reason(o);
                                this.expired(o);
                            },
                            reason(o) {
                                let _map = {};
                                let {cover: _c, user: _u} = $$app.blist.reason;
                                _map[_c] = '好友使用能量保护罩';
                                _map[_u] = '用户自行设置';
                                this.msg(_map[o.reason]);
                            },
                            expired(o) {
                                if (Number.isFinite(o.timestamp)) {
                                    $$app.blist._expired.showMsg(o);
                                }
                            },
                        },
                        _blistInitializer() {
                            let _blist = this;
                            if (_blist._blist_setter) {
                                return _blist._blist_setter;
                            }
                            return _blist._blist_setter = {
                                _deleted: [],
                                get() {
                                    if (!this._blist_data || _blist._is_modified) {
                                        this._blist_data = $$sto.af_blist.get('blacklist', []);
                                    }
                                    _legacyCompatibility.call(this);
                                    return this;

                                    // tool function(s) //

                                    function _legacyCompatibility() {
                                        if (!$$flag.blist_legacy_compatibility_handled) {
                                            let _old = $$sto.af.get('blacklist');
                                            if (!$$und(_old)) {
                                                // legacy: {name: {timestamp::, reason::}}
                                                // modern: [{name::, reason::, timestamp::}]
                                                if ($$obj(_old)) {
                                                    debugInfo('转换传统黑名单数据格式');
                                                    _old = Object.keys(_old).map((n) => (
                                                        Object.assign({name: n}, _old[n])
                                                    ));
                                                }
                                                if ($$arr(_old)) {
                                                    debugInfo('转移传统黑名单存储数据');
                                                    this._blist_data = _old;
                                                }
                                                $$sto.af.remove('blacklist');
                                            }
                                            $$flag.blist_legacy_compatibility_handled = true;
                                        }
                                    }
                                },
                                clean() {
                                    this._deleted = [];
                                    this._blist_data = this._blist_data || [];
                                    for (let i = 0; i < this._blist_data.length; i += 1) {
                                        let _o = this._blist_data[i];
                                        if (!$$obj(_o)) {
                                            this._blist_data.splice(i--, 1);
                                            _blist._is_modified = true;
                                            continue;
                                        }
                                        if (!_o.timestamp || _blist._expired.trigger(_o)) {
                                            this._deleted.push(_o.name);
                                            this._blist_data.splice(i--, 1);
                                            _blist._is_modified = true;
                                        }
                                    }
                                    return this;
                                },
                                message() {
                                    let _len = this._deleted.length;
                                    if (_len) {
                                        messageAction$('移除黑名单记录: ' + _len + '项', 1, 0, 0, 2);
                                        this._deleted.forEach(n => messageAction$(n, 1, 0, 1));
                                        debugInfo('__split_line__');
                                    }
                                    return this;
                                },
                                assign() {
                                    _blist.data = this._blist_data || [];
                                    return this;
                                },
                            };
                        },
                        data: [],
                        reason: {
                            cover: 'protect_cover',
                            user: 'by_user',
                        },
                        get(name, ref) {
                            return !name ? ref : this.data.some((o) => {
                                if (name.trim() === o.name.trim()) {
                                    this._showMsg.exists(o);
                                    return true;
                                }
                            });
                        },
                        save() {
                            if (this._is_modified) {
                                $$sto.af_blist.put('blacklist', this.data, 'forcible');
                                delete this._is_modified;
                            }
                            return this;
                        },
                        add(n, t, r) {
                            let _add_o = n;
                            if (arguments.length === 3) {
                                _add_o = {name: n, timestamp: t, reason: r};
                            }

                            let _data = this.data;
                            for (let i = 0; i < _data.length; i += 1) {
                                let {name: _n, reason: _r} = _data[i];
                                if (_n === _add_o.name && _r === $$app.blist.reason.cover) {
                                    _data.splice(i--, 1);
                                }
                            }
                            _data.push(_add_o);

                            this._is_modified = true;
                            this._showMsg.add(_add_o);

                            return this;
                        },
                        init() {
                            this._blistInitializer().get().clean().message().assign();
                            return this;
                        },
                    };

                    $$app.blist.init().save();

                    return this;
                },
                setPages() {
                    $$app.page = {
                        _plans: {
                            back: (function $iiFe() {
                                let _text = () => {
                                    return $$sel.pickup(['返回', {c$: true}, 'c0'])
                                        || $$sel.pickup(['返回', {c$: true}]);
                                };
                                let _id = () => {
                                    return $$sel.pickup(idMatches(/.*h5.+nav.back|.*back.button/));
                                };
                                let _bak = [0, 0, cX(100), cYx(200)]; // backup plan

                                return [_text, _id, _bak];
                            })(),
                            close: (function $iiFe() {
                                let _text = () => {
                                    return $$sel.pickup([/关闭|Close/, {c$: true}, 'c0'])
                                        || $$sel.pickup([/关闭|Close/, {c$: true}]);
                                };
                                let _id = () => null; // so far
                                let _bak = [cX(0.8), 0, -1, cYx(200)]; // backup plan

                                return [_text, _id, _bak];
                            })(),
                            launch: {
                                af: {
                                    _launcher(trigger, shared_opt) {
                                        $$app.monitor.launch_confirm.start(0);
                                        $$app.monitor.permission_allow.start(0);
                                        let _res = appx.launch(trigger, Object.assign({
                                            task_name: $$app.task_name,
                                            package_name: $$app.alipay_pkg,
                                            screen_orientation: 0,
                                            condition_launch() {
                                                return $$app.page.af.isInPage();
                                            },
                                            condition_ready() {
                                                let _nec_sel_key = 'af_title';
                                                let _opt_sel_keys = ['af_home', 'rl_ent'];

                                                if (_necessary() && _orientation() && _optional()) {
                                                    delete $$flag.launch_necessary;
                                                    delete $$flag.launch_optional;
                                                    return true;
                                                }

                                                // tool function(s) //

                                                function _necessary() {
                                                    if ($$flag.launch_necessary) {
                                                        return true;
                                                    }
                                                    if (!$$bool($$flag.launch_necessary)) {
                                                        debugInfo('等待启动必要条件');
                                                    }
                                                    if ($$sel.get(_nec_sel_key)) {
                                                        debugInfo(['已满足启动必要条件:', _nec_sel_key]);
                                                        return $$flag.launch_necessary = true;
                                                    }
                                                    return $$flag.launch_necessary = false;
                                                }

                                                function _orientation() {
                                                    if ($$disp.is_display_rotation_landscape) {
                                                        debugInfo('重新获取当前设备屏幕显示信息');
                                                        devicex.getDisplay(true);
                                                    }
                                                    return $$disp.is_display_rotation_portrait;
                                                }

                                                function _optional() {
                                                    if (!$$bool($$flag.launch_optional)) {
                                                        debugInfo('等待启动可选条件');
                                                    }
                                                    return _opt_sel_keys.some((key) => {
                                                        if ($$sel.get(key)) {
                                                            debugInfo(['已满足启动可选条件:', key]);
                                                            return true;
                                                        }
                                                    }) || ($$flag.launch_optional = false);
                                                }
                                            },
                                        }, shared_opt || {}));
                                        $$app.monitor.launch_confirm.interrupt();
                                        $$app.monitor.permission_allow.interrupt();
                                        return _res;
                                    },
                                    intent(shared_opt) {
                                        return appx.checkActivity($$app.intent.home)
                                            ? this._launcher($$app.intent.home, shared_opt)
                                            : this._showActHint();
                                    },
                                    click_btn(shared_opt) {
                                        let _w = null;
                                        return $$app.page.alipay.home()
                                            && waitForAction(() => _w = $$sel.get('af'), 1.5e3, 80)
                                            && this._launcher(() => clickAction(_w, 'w'), shared_opt);
                                    },
                                    search_kw(shared_opt) {
                                        let _this = this;
                                        let _w_item = null;
                                        return _alipayHome() && _search() && _launch();

                                        // tool function(s) //

                                        function _alipayHome() {
                                            if ($$app.page.alipay.home()) {
                                                let _selector = idMatches(/.*home.+search.but.*/);
                                                let _options = {click_strategy: 'w'};
                                                return waitForAndClickAction(_selector, 1.5e3, 80, _options);
                                            }
                                        }

                                        function _search() {
                                            if (waitForAction(idMatches(/.*search.input.box/), 5e3, 80)) {
                                                let _text = '蚂蚁森林小程序';
                                                setText(_text);
                                                waitForAction(() => $$sel.pickup(_text), 3e3, 80);
                                                return clickAction(idMatches(/.*search.confirm/), 'w', {
                                                    condition_success: () => _w_item = $$sel.get('af'),
                                                    max_check_times: 10,
                                                    check_time_once: 300,
                                                });
                                            }
                                        }

                                        function _launch() {
                                            let _bnd = _w_item.bounds();

                                            let _max = 8;
                                            while (_max-- && !_w_item.clickable()) {
                                                _w_item = _w_item.parent();
                                            }

                                            let _o = _max < 0 ? _bnd : _w_item;
                                            let _stg = _max < 0 ? 'click' : 'widget';

                                            return _this._launcher(() => {
                                                return clickAction(_o, _stg);
                                            }, shared_opt);
                                        }
                                    },
                                },
                                rl: {
                                    _launcher(trigger, shared_opt) {
                                        return appx.launch(trigger, Object.assign({}, {
                                            task_name: '好友排行榜',
                                            package_name: $$app.alipay_pkg,
                                            screen_orientation: 0,
                                            condition_launch: () => true,
                                            condition_ready() {
                                                let _loading = () => $$sel.pickup(/加载中.*/);
                                                let _cA = () => !_loading();
                                                let _cB = () => !waitForAction(_loading, 360, 120);
                                                let _listLoaded = () => _cA() && _cB();

                                                return $$app.page.rl.isInPage() && _listLoaded();
                                            },
                                            disturbance() {
                                                clickAction($$sel.pickup(/再试一次|打开/), 'w');
                                            },
                                        }, shared_opt || {}));
                                    },
                                    intent(shared_opt) {
                                        return appx.checkActivity($$app.intent.rl)
                                            ? this._launcher($$app.intent.rl, shared_opt)
                                            : this._showActHint();
                                    },
                                    click_btn(shared_opt) {
                                        let _w_rl_ent = null;
                                        let _sel_rl_ent = () => _w_rl_ent = $$sel.get('rl_ent');

                                        return _locateBtn() && _launch();

                                        // tool function(s) //

                                        function _locateBtn() {
                                            let _max = 8;
                                            while (_max--) {
                                                if (waitForAction(_sel_rl_ent, 1.5e3)) {
                                                    return true;
                                                }
                                                if ($$sel.get('alipay_home')) {
                                                    debugInfo(['检测到支付宝主页页面', '尝试进入蚂蚁森林主页']);
                                                    $$app.page.af.launch();
                                                } else if ($$sel.get('rl_title')) {
                                                    debugInfo(['检测到好友排行榜页面', '尝试关闭当前页面']);
                                                    $$app.page.back();
                                                } else {
                                                    debugInfo(['未知页面', '尝试关闭当前页面']);
                                                    keycode(4, {double: true});
                                                }
                                            }
                                            if (_max >= 0) {
                                                debugInfo('定位到"查看更多好友"按钮');
                                                return true;
                                            }
                                            messageAction('定位"查看更多好友"超时', 3, 1, 0, 1);
                                        }

                                        function _launch() {
                                            return this._launcher(() => _widget() || _swipe(), shared_opt);

                                            // tool function(s) //

                                            function _widget() {
                                                return clickAction(_w_rl_ent, 'w')
                                                    && waitForAction(() => !_sel_rl_ent(), 800);
                                            }

                                            function _swipe() {
                                                debugInfo('备份方案点击"查看更多好友"');
                                                return swipeAndShowAndClickAction(_sel_rl_ent);
                                            }
                                        }
                                    },
                                },
                                _showActHint() {
                                    messageAction('Activity在设备系统中不存在', 3, 0, 0, 2);
                                },
                            },
                        },
                        _getClickable(coord) {
                            let _sel = selector();
                            let _par = coord.map((x, i) => ~x ? x : i % 2 ? W : H);
                            return _sel.boundsInside.apply(_sel, _par).clickable().findOnce();
                        },
                        _carry(fxs, no_bak) {
                            for (let i = 0, l = fxs.length; i < l; i += 1) {
                                let _checker = fxs[i];
                                if ($$arr(_checker)) {
                                    if (no_bak) {
                                        continue;
                                    }
                                    _checker = () => this._getClickable(fxs[i]);
                                }
                                let _w = _checker();
                                if (_w) {
                                    return clickAction(_w, 'w');
                                }
                            }
                        },
                        _plansLauncher(aim, plans_arr, shared_opt) {
                            let _fxo = $$app.page._plans.launch[aim];
                            return plans_arr.some((stg) => {
                                let _f = _fxo[stg];
                                if (!$$func(_f)) {
                                    messageAction('启动器计划方案无效', 4, 1, 0, -1);
                                    messageAction('计划: ' + aim, 4, 0, 1);
                                    messageAction('方案: ' + stg, 8, 0, 1, 1);
                                }
                                if (_f.call(_fxo, shared_opt)) {
                                    return true;
                                }
                            });
                        },
                        autojs: {
                            /** @param {RegExp} rex */
                            _pickupTitle: rex => $$sel.pickup([rex, {
                                cn$: 'TextView',
                                bi$: [cX(0.12), cYx(0.03), halfW, cYx(0.12)],
                            }]),
                            get is_log() {
                                return this._pickupTitle(/日志|Log/);
                            },
                            get is_settings() {
                                return this._pickupTitle(/设置|Settings?/);
                            },
                            get is_home() {
                                return $$sel.pickup(idMatches(/.*action_(log|search)/));
                            },
                            get is_fg() {
                                return $$sel.pickup(['Navigate up', {cn$: 'ImageButton'}])
                                    || this.is_home || this.is_log || this.is_settings
                                    || $$sel.pickup(idMatches(/.*md_\w+/));
                            },
                            spring_board: {
                                on: () => $$cfg.app_launch_springboard === 'ON',
                                employ() {
                                    if (!this.on()) {
                                        return false;
                                    }
                                    debugInfo('开始部署启动跳板');

                                    let _aj_name = $$app.autojs_name;
                                    let _res = appx.launch($$app.autojs_pkg, {
                                        app_name: _aj_name,
                                        is_debug_info: false,
                                        condition_ready() {
                                            return $$app.page.autojs.is_fg;
                                        },
                                    });

                                    if (_res) {
                                        debugInfo('跳板启动成功');
                                        return true;
                                    }
                                    debugInfo('跳板启动失败', 3);
                                    debugInfo('>打开' + _aj_name + '应用超时', 3);
                                },
                                remove() {
                                    if (!this.on()) {
                                        return;
                                    }
                                    if (!$$flag.alipay_closed) {
                                        return debugInfo(['跳过启动跳板移除操作', '>支付宝未关闭']);
                                    }
                                    if (waitForAction(_isFg, 9e3, 300)) {
                                        return _checkInitState();
                                    }
                                    // language=JS
                                    debugInfo('`等待返回${$$app.autojs_name}应用页面超时`'.ts);

                                    // tool function(s) //

                                    function _isFg() {
                                        return $$app.page.autojs.is_fg;
                                    }

                                    function _checkInitState() {
                                        if (!$$app.init_autojs_state.init_fg) {
                                            return _remove(_isFg, _back2);
                                        }
                                        if ($$app.init_autojs_state.init_home) {
                                            return debugInfo('无需移除启动跳板');
                                        }
                                        if ($$app.init_autojs_state.init_log) {
                                            return _restore('console');
                                        }
                                        if ($$app.init_autojs_state.init_settings) {
                                            return _restore('settings');
                                        }
                                        return _remove(_isHome, _back2);

                                        // tool function(s) //

                                        function _back2() {
                                            keycode(4, {double: true});
                                            sleep(400);
                                        }

                                        function _remove(condF, removeF) {
                                            debugInfo('移除启动跳板');
                                            let _max = 5;
                                            while (condF() && _max--) {
                                                removeF();
                                            }
                                            if (_max > 0) {
                                                debugInfo('跳板移除成功');
                                                return true;
                                            }
                                            debugInfo('跳板移除可能未成功', 3);
                                        }

                                        function _restore(cmd) {
                                            let _m = '恢复跳板 ' + cmd.toTitleCase() + ' 页面';
                                            toast(_m);
                                            debugInfo(_m);
                                            return appx.startActivity(cmd);
                                        }

                                        function _isHome() {
                                            return $$app.page.autojs.is_home;
                                        }
                                    }
                                },
                            },
                        },
                        alipay: {
                            home(par) {
                                $$app.monitor.launch_confirm.start(0);
                                $$app.monitor.permission_allow.start(0);
                                let _res = appx.launch($$app.alipay_pkg, Object.assign({
                                    app_name: '支付宝',
                                    screen_orientation: 0,
                                    condition_ready() {
                                        $$app.page.close('no_bak') || $$app.page.back();
                                        return $$app.page.alipay.isInPage();
                                    },
                                }, par || {}));
                                $$app.monitor.launch_confirm.interrupt();
                                $$app.monitor.permission_allow.interrupt();
                                return _res;
                            },
                            close() {
                                debugInfo('关闭支付宝');
                                if (appx.kill($$app.alipay_pkg, {
                                    shell_acceptable: $$app.has_root && $$app.root_fxs.force_stop,
                                })) {
                                    debugInfo('支付宝关闭完毕');
                                    return $$flag.alipay_closed = true;
                                }
                                return debugInfo('支付宝关闭超时', 3);
                            },
                            isInPage() {
                                return $$sel.get('alipay_home');
                            },
                        },
                        af: {
                            launch(shared_opt) {
                                $$app.page.autojs.spring_board.employ();

                                // TODO loadFromConfig
                                let _plans = ['intent', 'click_btn', 'search_kw'];
                                let _res = $$app.page._plansLauncher('af', _plans, shared_opt);

                                $$app.monitor.mask_layer.start();

                                if (waitForAction(() => $$flag.mask_layer_monitoring, 800, 50)) {
                                    debugInfo('检测到遮罩层监测器等待信号');
                                    if (waitForAction(() => !$$flag.mask_layer_monitoring, 3e3, 50)) {
                                        debugInfo('放弃等待监测器结束信号', 3);
                                    } else {
                                        debugInfo('监测器信号返回正常');
                                    }
                                }

                                return _res;
                            },
                            close() {
                                let _tOut = () => timeRecorder('close_af_win', 'L') >= 10e3;
                                let _cond = () => {
                                    return $$sel.get('af_title')
                                        || $$sel.get('rl_title')
                                        || $$sel.pickup([/浇水|发消息/, {cn$: 'Button'}])
                                        || $$sel.get('login_new_acc');
                                };
                                debugInfo('关闭全部蚂蚁森林相关页面');
                                timeRecorder('close_af_win');
                                while (_cond() && !_tOut()) {
                                    keycode(4);
                                    sleep(700);
                                }
                                let _succ = ['相关页面关闭完毕', '保留当前支付宝页面'];
                                debugInfo(_tOut() ? '页面关闭可能未成功' : _succ);
                            },
                            isInPage() {
                                return !!($$app.alipay_pkg === currentPackage()
                                    || $$sel.get('rl_ent')
                                    || $$sel.get('af_home')
                                    || $$sel.get('wait_awhile'));
                            },
                        },
                        rl: {
                            /** load rl capt cache if needed */
                            get capt_img() {
                                if (this._capt && !imagesx.isRecycled(this._capt)) {
                                    return this._capt;
                                }
                                return this.capt();
                            },
                            capt() {
                                return this._capt = imagesx.capt({clone: true});
                            },
                            reclaimAll() {
                                imagesx.reclaim(this._capt);
                                this.pool.clean();
                            },
                            pool: {
                                data: [],
                                add() {
                                    this.data.unshift($$app.page.rl.capt());
                                    return this;
                                },
                                filter() {
                                    let _pool = this.data;
                                    for (let i = 0; i < _pool.length; i += 1) {
                                        if (!_pool[i] || imagesx.isRecycled(_pool[i])) {
                                            _pool.splice(i--, 1);
                                        }
                                    }
                                    return this;
                                },
                                trim(kept) {
                                    let _pool = this.data;
                                    let _idx = _pool.length;
                                    while (_idx-- > kept) {
                                        _pool[_idx].recycle();
                                        _pool.splice(_idx, 1);
                                    }
                                    return this;
                                },
                                clean() {
                                    if (this.data.length) {
                                        debugInfo('清理排行榜截图样本池');
                                        this.trim(0);
                                    }
                                    return this;
                                },
                                isDiff() {
                                    let _pool = this.data;
                                    if (_pool.length !== 2) {
                                        return true;
                                    }
                                    let [_img, _tpl] = _pool;
                                    return !imagesx.findImage(_img, _tpl, {
                                        compress_level: 4,
                                    });
                                },
                            },
                            launch(shared_opt) {
                                // TODO split from alipay spring board
                                $$app.page.autojs.spring_board.employ();

                                // TODO loadFromConfig
                                let _plans = ['intent', 'click_btn'];

                                return $$app.page._plansLauncher('rl', _plans, shared_opt);
                            },
                            backTo() {
                                let _isIn = () => $$flag.rl_in_page;
                                let _max = 3;
                                while (_max--) {
                                    sleep(240);
                                    keycode(4);
                                    debugInfo('模拟返回键返回排行榜页面');
                                    if (waitForAction(_isIn, 2.4e3, 80)) {
                                        sleep(240);
                                        if (waitForAction(_isIn, 480, 80)) {
                                            debugInfo('返回排行榜成功');
                                            return true;
                                        }
                                        if ($$app.page.fri.isInPage()) {
                                            debugInfo('当前页面为好友森林页面');
                                            continue;
                                        }
                                    }
                                    if ($$app.page.alipay.isInPage()) {
                                        debugInfo(['当前页面为支付宝首页', '重新跳转至排行榜页面']);
                                        return this.launch();
                                    }
                                    debugInfo('返回排行榜单次超时');
                                }
                                debugInfo(['返回排行榜失败', '尝试重启支付宝到排行榜页面'], 3);
                                $$app.page.af.launch();
                                $$app.page.rl.launch();
                                $$app.monitor.rl_in_page.start();
                            },
                            isInPage() {
                                let _fg = $$flag.rl_in_page;
                                return $$und(_fg) ? $$sel.get('rl_title') : _fg;
                            },
                        },
                        fri: {
                            in_page_rex: new RegExp([
                                /来浇过水.+/, /收取\s?\d+g/,
                                /赠送的\s?\d+g\s?.*能量/,
                                /点击加载更多/, /.*暂无最新动态.*/,
                            ].map(rex => rex.source).join('|')),
                            in_page_rex_spe: new RegExp([
                                /今天/, /昨天/, /\d{2}-\d{2}/,
                                /((TA|你)(收取)?){2}/,
                            ].map(rex => rex.source).join('|')),
                            isInPage() {
                                let _this = this;
                                $$a11y.service.refreshServiceInfo();
                                return _chkTitle() && _chkPageRex();

                                // tool function(s) //

                                function _chkTitle() {
                                    if (_this._is_title_ready_fg) {
                                        return true;
                                    }
                                    if ($$sel.get('fri_tt')) {
                                        return _this._is_title_ready_fg = true;
                                    }
                                }

                                function _chkPageRex() {
                                    let _cA = () => $$sel.pickup(_this.in_page_rex);
                                    let _cB = () => {
                                        let _bnd = $$sel.pickup(_this.in_page_rex_spe, 'bounds');
                                        return _bnd && _bnd.top > cYx(0.85);
                                    };
                                    if (_cA() || _cB()) {
                                        delete _this._is_title_ready_fg;
                                        return true;
                                    }
                                }
                            },
                            getReady() {
                                $$app.monitor.reload_btn.start();

                                let _max = 20e3;
                                let _max_bak = _max;
                                let _itv = 200;

                                while (!this.isInPage() && _max > 0) {
                                    let _ratio = $$sel.get('wait_awhile') ? 1 / 6 : 1;
                                    _max -= _itv * _ratio;
                                    sleep(_itv);
                                }

                                let _sec = (_max_bak - _max) / 1e3;
                                if (_sec >= 6) {
                                    debugInfo('进入好友森林时间较长: ' + _sec.toFixedNum(2) + '秒');
                                }

                                $$app.monitor.reload_btn.interrupt();
                                return _max > 0 || messageAction('进入好友森林超时', 3, 1);
                            },
                            pool: new imagesx.ForestImagePool({
                                interval: $$cfg.forest_image_pool_itv,
                                limit: $$cfg.forest_image_pool_limit,
                            }),
                            cover: {
                                ready() {
                                    debugInfo('开始能量保护罩检测准备');

                                    let _pool = $$app.page.fri.pool;
                                    let _fri = $$af._collector.fri;
                                    let _max_pool_chk = 10;
                                    while (!_pool.len && _max_pool_chk--) {
                                        if (!_fri.thd_info_collect.isAlive()) {
                                            break;
                                        }
                                        sleep(100);
                                    }

                                    if (_pool.len) {
                                        debugInfo('使用好友森林信息采集线程数据');
                                        debugInfo('可供分析的能量罩样本数量: ' + _pool.len);
                                    }

                                    if (!_pool.filled_up) {
                                        debugInfo('能量罩样本数量不足');
                                        let _max_fill = 12;
                                        while (1) {
                                            if (!_fri.thd_info_collect.isAlive()) {
                                                debugInfo('好友森林信息采集线程已停止');
                                                debugInfo('现场采集能量罩样本数据');
                                                return _pool.add();
                                            }
                                            if (!_max_fill--) {
                                                debugInfo('等待样本采集超时');
                                                debugInfo('现场采集能量罩样本数据');
                                                return _pool.add();
                                            }
                                            if (_pool.filled_up) {
                                                debugInfo('能量罩样本数据充足');
                                                return;
                                            }
                                            sleep(50);
                                        }
                                    }
                                },
                                detect() {
                                    let _pool = $$app.page.fri.pool;
                                    let _color = $$cfg.protect_cover_detect_color_val;
                                    let _par = {threshold: $$cfg.protect_cover_detect_threshold};
                                    let _clip = (img) => images.clip(img,
                                        cX(288), cYx(210), cX(142), cYx(44));
                                    return _pool.data.some((img) => {
                                        let _c = !imagesx.isRecycled(img) && _clip(img);
                                        if (_c) {
                                            let _pts = images.findColor(_c, _color, _par);
                                            _c.recycle();
                                            return _pts;
                                        }
                                    }) || debugInfo('颜色识别无保护罩');
                                },
                            },
                        },
                        back(no_bak) {
                            return this._carry(this._plans.back, no_bak);
                        },
                        close(no_bak) {
                            return this._carry(this._plans.close, no_bak);
                        },
                        closeIntelligently() {
                            let _cA = () => $$cfg.kill_when_done_switch;
                            let _cB1 = () => $$cfg.kill_when_done_intelligent;
                            let _cB2 = () => $$app.init_fg_pkg !== $$app.alipay_pkg;
                            let _cB = () => _cB1() && _cB2();

                            if (_cA() || _cB()) {
                                return this.alipay.close();
                            }

                            if (!$$cfg.kill_when_done_keep_af_pages) {
                                return this.af.close();
                            }
                        },
                        closeAllRelated() {
                            let _trig = () => {
                                return $$sel.get('af_title')
                                    || $$sel.get('rl_title')
                                    || $$app.page.fri.isInPage();
                            };
                            if (_trig()) {
                                let _max = 20;
                                let _ctr = 0;
                                do {
                                    keycode(4, {double: true});
                                    _ctr += 1;
                                    sleep(500);
                                } while (_max-- && _trig());

                                debugInfo('关闭相关H5页面: ' + _ctr + '页');
                            }
                        },
                    };

                    if ($$app.page.autojs.spring_board.on()) {
                        $$app.init_autojs_state = {
                            init_fg: $$app.page.autojs.is_fg,
                            init_home: $$app.page.autojs.is_home,
                            init_log: $$app.page.autojs.is_log,
                            init_settings: $$app.page.autojs.is_settings,
                        };
                    }

                    return this;
                },
                setLayout() {
                    // noinspection HtmlUnknownTarget,HtmlRequiredAltAttribute
                    $$app.layout = {
                        fullscreen_cover: {
                            is_cover: true,
                            xml: <frame id="cover" bg="#dd000000"/>,
                            deploy() {
                                let _win = this.window = floaty.rawWindow(this.xml);
                                // prevent touch event being transferred to the view beneath
                                _win.setTouchable(true);
                                _win.setSize(-1, -1);
                            },
                            close() {
                                _closeWindow.call(this);
                            },
                            setOnTouchListener(onTouchFx) {
                                let _this = this;
                                this.window || this.deploy();
                                this.window['cover'].setOnTouchListener({
                                    onTouch(view, e) {
                                        return onTouchFx.call(_this, view, e);
                                    },
                                });
                            },
                            setOnClickListener(onClickFx) {
                                let _this = this;
                                this.window || this.deploy();
                                this.window['cover'].setOnClickListener({
                                    onClick(view, e) {
                                        return onClickFx.call(_this, view, e);
                                    },
                                });
                            },
                        },
                        next_auto_task: {
                            cfg: {
                                layout_width: cX(0.44),
                                position_y: cY(0.26),
                                colors: {
                                    img: '#ccff90',
                                    text: '#dcedc8',
                                },
                            },
                            xml: <vertical id="view">
                                <x-img id="img" src="@drawable/ic_alarm_on_black_48dp"
                                       bg="?selectableItemBackgroundBorderless"
                                       marginBottom="5" height="66" gravity="center"/>
                                <x-text id="text" size="17" marginBottom="8" gravity="center"
                                        fontFamily="sans-serif-condensed" line_spacing="5cx"/>
                            </vertical>,
                            close() {
                                _closeWindow.call(this);
                            },
                            deploy() {
                                _initCfgColors.call(this);
                                let _w = this.cfg.layout_width;
                                let _y = this.cfg.position_y;
                                let _win = this.window = floaty.rawWindow(this.xml);
                                _win.setSize(_w, -2);
                                _win.setPosition(halfW - _w / 2, _y);
                                _win['view'].on('click', this._onClick.bind(this));
                                _win['img'].attr('tint_color', this.cfg.colors.img);
                                _win['text'].attr('color', this.cfg.colors.text);

                                this._countdown($$app.next_auto_task_ts);
                            },
                            _countdown(t) {
                                let _now = new Date();
                                let _now_ts = _now.getTime();
                                let _now_yy = _now.getFullYear();
                                let _now_MM = _now.getMonth();
                                let _now_dd = _now.getDate();
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
                                    }
                                    if (t instanceof Date) {
                                        _aim_str = _tsToTime(t.getTime());
                                        return t;
                                    }
                                    if (typeof t !== 'string') {
                                        throw Error('Invalid type of time param');
                                    }
                                    if (!t.match(/^\d{2}:\d{2}:\d{2}$/)) {
                                        throw Error('Invalid format of time param');
                                    }
                                    _aim_str = t;
                                    // noinspection JSCheckFunctionSignatures
                                    let _args = [Date].concat([_now_yy, _now_MM, _now_dd], t.split(':'));
                                    return new (Array.bind.apply(Date, _args));
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
                                    return _aim_sign + ' ' + _aim_str + ' ' + _aim_sign;
                                };

                                let _getCtdStr = () => {
                                    let _ctd_sign = '-';
                                    let _gap_ts = _aim_ts - Date.now();
                                    _ctd_str = _tsToTime(Math.max(_gap_ts, 0), 'GAP');
                                    return _ctd_sign + ' ' + _ctd_str + ' ' + _ctd_sign;
                                };

                                let _setText = () => {
                                    try {
                                        this.window['text'].setText([
                                            'Next auto task', _getAimStr(), _getCtdStr(),
                                        ].join('\n'));
                                    } catch (e) {
                                        // eg: java.lang.NullPointerException
                                    }
                                };

                                _setText();
                                this.itv_id = setInterval(_setText, 1e3);
                            },
                            _onClick() {
                                debugInfo(['终止结果展示', '>检测到定时任务布局点击']);
                                debugInfo('发送Floaty结束等待信号');
                                $$flag.floaty_result_fin = true;
                                $$flag.cover_user_touched = true;
                                $$app.layout.closeAll();

                                if ($$app.next_auto_task_ts) {
                                    filesx.run('./tools/show-next-auto-task-countdown', {
                                        timestamp: $$app.next_auto_task_ts,
                                    });
                                }
                            },
                        },
                        eballs_pick_result: {
                            cfg: {
                                layout_width: cX(0.59),
                                position_y: cY(0.57),
                                colors: {
                                    own: '#aed581',
                                    fri: '#4caf50',
                                    failed: '#ec407a',
                                    vain: '#a1887f',
                                    text: '#ffffff',
                                },
                            },
                            uni: {
                                xml: <vertical>
                                    <frame id="hint" h="{{cX(0.078)}}px">
                                        <x-text id="text" gravity="center" size="14"/>
                                    </frame>
                                    <frame id="stp_up" h="{{cX(0.0156)}}px"/>
                                    <frame id="sum" h="{{cX(0.111)}}px">
                                        <x-text id="text" gravity="center" size="24"/>
                                    </frame>
                                    <frame id="stp_dn" h="{{cX(0.0156)}}px"/>
                                    <frame id="ctd" h="{{cX(0.078)}}px">
                                        <x-text id="text" gravity="center" size="14"/>
                                    </frame>
                                </vertical>,
                                deploy(data) {
                                    let _win = this.window;
                                    let _stp = {up: _win['stp_up'], dn: _win['stp_dn']};
                                    let _e_own = data.own, _e_fri = data.fri;
                                    let _c = this.cfg.colors;
                                    let _w = this.cfg.layout_width;
                                    let _y = this.cfg.position_y;

                                    let _w_hint_t = _win['hint']['text'];
                                    let _w_sum_t = _win['sum']['text'];
                                    let _w_ctd_t = _win['ctd']['text'];

                                    _win.setSize(_w, -2);
                                    _win.setPosition(halfW - _w / 2, _y);

                                    if (!_e_own && !_e_fri) {
                                        this._setBg([_stp.up, _stp.dn], _c.vain);
                                        _w_hint_t.setText(this._getHints());
                                        _w_sum_t.setText('0');
                                    } else if (_e_own > 0) {
                                        this._setBg([_stp.up, _stp.dn], _c.own);
                                        _w_hint_t.setText('Yourself');
                                        _w_sum_t.setText(_e_own.toString());
                                    } else if (_e_fri > 0) {
                                        this._setBg([_stp.up, _stp.dn], _c.fri);
                                        _w_hint_t.setText('Friends');
                                        _w_sum_t.setText(_e_fri.toString());
                                    } else {
                                        this._setBg([_stp.up, _stp.dn], _c.failed);
                                        _w_hint_t.setText('Failed');
                                        _w_sum_t.setText('Statistics failed');
                                    }

                                    uix.setTextColor([_w_hint_t, _w_sum_t, _w_ctd_t], _c.text);
                                },
                            },
                            du: {
                                xml: <vertical>
                                    <horizontal id="hint" h="{{cX(0.078)}}px">
                                        <x-text id="own" gravity="center" size="14" layout_weight="1"/>
                                        <x-text id="fri" gravity="center" size="14" layout_weight="1"/>
                                    </horizontal>
                                    <horizontal id="stp_up" h="{{cX(0.0156)}}px">
                                        <frame id="own" layout_weight="1" h="*"/>
                                        <frame id="fri" layout_weight="1" h="*"/>
                                    </horizontal>
                                    <frame id="sum" h="{{cX(0.111)}}px">
                                        <x-text id="text" gravity="center" size="24"/>
                                    </frame>
                                    <horizontal id="stp_dn" h="{{cX(0.0156)}}px">
                                        <frame id="own" layout_weight="1" h="*"/>
                                        <frame id="fri" layout_weight="1" h="*"/>
                                    </horizontal>
                                    <frame id="ctd" h="{{cX(0.078)}}px">
                                        <x-text id="text" gravity="center" size="14"/>
                                    </frame>
                                </vertical>,
                                deploy(data) {
                                    let _win = this.window;
                                    let _stp = {up: _win['stp_up'], dn: _win['stp_dn']};
                                    let _e_own = data.own, _e_fri = data.fri;
                                    let _c = this.cfg.colors;
                                    let _w = this.cfg.layout_width;
                                    let _y = this.cfg.position_y;

                                    let _w_hint_o = _win['hint']['own'];
                                    let _w_hint_f = _win['hint']['fri'];
                                    let _w_sum_t = _win['sum']['text'];
                                    let _w_ctd_t = _win['ctd']['text'];

                                    _win.setSize(_w, -2);
                                    _win.setPosition(halfW - _w / 2, _y);

                                    _w_hint_o.setText('Yourself: ' + _e_own);
                                    _w_hint_f.setText('Friends: ' + _e_fri);
                                    _w_sum_t.setText((_e_own + _e_fri).toString());

                                    this._setBg([_stp.up['own'], _stp.dn['own']], _c.own);
                                    this._setBg([_stp.up['fri'], _stp.dn['fri']], _c.fri);
                                    uix.setTextColor([_w_hint_o, _w_hint_f, _w_sum_t, _w_ctd_t], _c.text);
                                },
                            },
                            /**
                             * @param {{countdown:number,own:number,fri:number}} data
                             */
                            deploy(data) {
                                let _this = this;
                                threadsx.start(function () {
                                    _this._deploy(data);
                                });
                            },
                            close() {
                                _closeWindow.call(this);
                            },
                            _deploy(data) {
                                _initCfgColors.call(this);
                                let _this = data.own > 0 && data.fri > 0 ? this.du : this.uni;
                                this.window = floaty.rawWindow(_this.xml);
                                _this.deploy.call(this, data);
                                this._countdown(data.countdown);
                            },
                            _setBg(views, color) {
                                views.forEach(v => v.setBackgroundColor(color));
                            },
                            _getHints() {
                                let _notes = [
                                    // Never say die (永不言弃)
                                    'NEVER.contains(SAY_DIE)',
                                    // Life isn't all roses (生活并非事事如意)
                                    'LIFE != ALL ROSES',
                                    // Nothing is impossible (一切皆有可能)
                                    'IMPOSSIBLE === undefined',
                                    // Believe that god is fair (相信上帝公平)
                                    'GOD.isFair() === true',
                                    // Don't give up and don't give in (不言弃 不言败)
                                    '/((?!GIVE+(UP|IN)).)+/i',
                                    // Zero in your target, and go for it (从零开始 勇往直前)
                                    'for (i=0; i<Infinity; i++)',
                                    // Infinite luck (好运无限)
                                    'LUCK.length === Infinity',
                                    // Be more lucky next time (再接再厉)
                                    'LLIST.next === LUCKY',
                                    // A blessing in disguise (塞翁失马 焉知非福)
                                    'for (BLESSING in DISGUISE)',
                                    // Maintain good eyesight (保护视力)
                                    '!~HEALTH.indexOf(EYESIGHT)',
                                    // Stay hydrated (多喝水)
                                    'WATER.drink().drink()',
                                    // Enjoy your life (享受生活)
                                    '!~LIFE.search(ENJOYABLE)',
                                ];

                                debugInfo('随机挑选提示语');
                                return _notes[Math.rand(_notes.length, -0)];
                            },
                            _countdown(n) {
                                let _n = parseInt(n);
                                let _w = this.window['ctd']['text'];
                                let _err_ctr = 0;
                                let _fin = (fx) => {
                                    fx && fx.call(null);
                                    debugInfo('发送Floaty结束等待信号');
                                    $$flag.floaty_result_fin = true;
                                    clearInterval(_itv_id);
                                };
                                let _setText = function () {
                                    _err_ctr < 3 || _fin(() => {
                                        messageAction('此设备无法正常使用Floaty功能', 3, 1);
                                        messageAction('建议改用Toast方式显示收取结果', 3);
                                    });
                                    try {
                                        _w.setText('- ' + _n + ' -');
                                        _n-- || _fin(() => {
                                            debugInfo('Floaty倒计时结束');
                                            debugInfo('统计结果展示完毕');
                                        });
                                    } catch (e) {
                                        _err_ctr += 1;
                                    }
                                };
                                _setText();
                                let _itv_id = this.itv_id = setInterval(_setText, 1e3);
                            },
                        },
                        update_avail: {
                            cfg: {
                                layout_width: W,
                                position_y: cY(0.78),
                                colors: {
                                    img: '#69f0ae',
                                    text: '#e8f5e9',
                                },
                            },
                            xml: <vertical id="view">
                                <horizontal gravity="center" height="45">
                                    <x-img id="img" src="@drawable/ic_fiber_new_black_48dp"
                                           height="29" paddingRight="5" adjustViewBounds="true"
                                           bg="?selectableItemBackgroundBorderless"/>
                                    <x-text id="text_title" size="16" gravity="center"
                                            fontFamily="sans-serif-condensed"/>
                                </horizontal>
                                <x-text id="text_ver" gravity="center" paddingBottom="11"
                                        fontFamily="sans-serif-condensed" size="16"/>
                            </vertical>,
                            deploy() {
                                let _this = this;
                                let _ver = '';
                                let _getVer = () => _ver = $$app.newest_release_ver_name;
                                threadsx.start(function () {
                                    if (waitForAction(_getVer, 0, 120)) {
                                        if (appx.isNewerVersion(_ver, $$app.project_ver_name)) {
                                            _this._deploy();
                                        }
                                    }
                                });
                            },
                            close() {
                                _closeWindow.call(this);
                            },
                            _deploy() {
                                let _ver_local = $$app.project_ver_name;
                                let _ver_newest = $$app.newest_release_ver_name;
                                if (appx.isNewerVersion(_ver_newest, _ver_local)) {
                                    _initCfgColors.call(this);
                                    let _w = this.cfg.layout_width;
                                    let _y = this.cfg.position_y;
                                    let _c = this.cfg.colors;
                                    let _win = this.window = floaty.rawWindow(this.xml);
                                    _win.setSize(_w, -2);
                                    _win.setPosition(halfW - _w / 2, _y);
                                    _win['view'].on('click', this._onClick.bind(this));
                                    _win['text_title'].attr('text', 'Update available');
                                    _win['text_title'].attr('color', _c.text);
                                    _win['text_ver'].attr('text', _ver_local + '  ->  ' + _ver_newest);
                                    _win['text_ver'].attr('color', _c.text);
                                    _win['img'].attr('tint_color', _c.img);
                                }
                            },
                            _onClick() {
                                debugInfo(['终止结果展示', '>检测到更新提示布局点击']);
                                debugInfo('发送Floaty结束等待信号');
                                $$flag.floaty_result_fin = true;
                                $$flag.cover_user_touched = true;
                                $$flag.update_dialog_uphold = true;
                                $$app.layout.closeAll();

                                let _newest = $$app.newest_release;
                                let _newest_ver = _newest.version_name;

                                dialogsx.builds(['项目更新',
                                    '本地版本: ' + $$app.project_ver_name + '\n' +
                                    '最新版本: ' + _newest_ver,
                                    ['忽略此版本', 'warn'], 'X',
                                    ['查看更新', 'attraction'], 1,
                                ], {
                                    disable_back: true,
                                }).on('neutral', (d) => {
                                    d.dismiss();
                                    timeRecorder('update_dialog_uphold');
                                    dialogsx.builds([
                                        '版本忽略提示', 'update_ignore_confirm',
                                        0, 'Q', ['确定忽略', 'caution'], 1,
                                    ], {
                                        disable_back: true,
                                    }).on('negative', (ds) => {
                                        d.show();
                                        ds.dismiss();
                                        timeRecorder('update_dialog_uphold');
                                    }).on('positive', (ds) => {
                                        ds.dismiss();
                                        let _k = 'update_ignore_list';
                                        let _new = {};
                                        _new[_k] = $$cfg[_k].concat([_newest_ver]);
                                        $$sto.af_cfg.put('config', _new);
                                        $$toast('已忽略当前版本', 'Long');
                                        delete $$flag.update_dialog_uphold;
                                    }).show();
                                }).on('negative', (d) => {
                                    d.dismiss();
                                    delete $$flag.update_dialog_uphold;
                                }).on('positive', (d) => {
                                    d.dismiss();
                                    timeRecorder('update_dialog_uphold');
                                    dialogsx.builds([
                                        '版本详情', _newest.brief_info_str,
                                        ['浏览器查看', 'hint'], 'B',
                                        ['立即更新', 'attraction'], 1,
                                    ], {
                                        disable_back: true,
                                    }).on('neutral', (ds) => {
                                        ds.dismiss();
                                        app.openUrl(_newest.html_url);
                                        timeRecorder('update_dialog_uphold');
                                    }).on('negative', (ds) => {
                                        d.show();
                                        ds.dismiss();
                                        timeRecorder('update_dialog_uphold');
                                    }).on('positive', (ds) => {
                                        let _clearFlags = () => {
                                            delete $$flag.update_dialog_deploying;
                                            delete $$flag.update_dialog_uphold;
                                        };
                                        appx.deployProject(_newest, {
                                            onDeployStart() {
                                                ds.dismiss();
                                                $$flag.update_dialog_deploying = true;
                                            },
                                            onDeploySuccess: () => _clearFlags(),
                                            onDeployFailure: () => _clearFlags(),
                                        });
                                    }).show();
                                }).show();
                            },
                        },
                        screen_turning_off: {
                            xml: <vertical id="view">
                                <x-img id="img" src="@drawable/ic_hourglass_empty_black_48dp"
                                       bg="?selectableItemBackgroundBorderless"
                                       height="55" gravity="center" margin="0 12 0 15"/>
                                <x-text id="title" gravity="center" line_spacing="8cx"
                                        size="19" fontFamily="sans-serif-condensed"/>
                                <x-text id="hint_duration" gravity="center" line_spacing="7cx"
                                        size="16" fontFamily="sans-serif-condensed" marginTop="80"/>
                                <x-text id="hint_interrupt" gravity="center" line_spacing="7cx"
                                        size="16" fontFamily="sans-serif-condensed" marginTop="30"/>
                            </vertical>,
                            cfg: {
                                layout_width: W,
                                position_y: cY(0.25),
                                colors: {
                                    img: '#e1bee7',
                                    text: '#f3e5f5',
                                },
                            },
                            deploy() {
                                let _this = this;
                                threadsx.start(function () {
                                    _this._deploy();
                                });
                            },
                            close() {
                                _closeWindow.call(this);
                            },
                            _deploy() {
                                _initCfgColors.call(this);
                                let _w = this.cfg.layout_width;
                                let _y = this.cfg.position_y;
                                let _c = this.cfg.colors;
                                let _win = this.window = floaty.rawWindow(this.xml);
                                _win.setTouchable(false);
                                _win.setSize(_w, -1);
                                _win.setPosition(halfW - _w / 2, _y);

                                let _w_img = _win['img'];
                                let _w_title = _win['title'];
                                let _w_duration = _win['hint_duration'];
                                let _w_interrupt = _win['hint_interrupt'];

                                this.itv_id = setInterval(() => {
                                    android.animation.ObjectAnimator
                                        .ofFloat(_w_img, 'rotation', [0, 180])
                                        .setDuration(1.6e3)
                                        .start();
                                }, 2.4e3);

                                let _msg = {
                                    title: {
                                        eng: 'Please wait while turning off screen\n' +
                                            'is in progress...',
                                        chs: '正在尝试关闭屏幕...',
                                    },
                                    duration: {
                                        eng: 'This may take a few seconds',
                                        chs: '此过程可能需要几秒钟',
                                    },
                                    interrupt: {
                                        eng: 'Touch anywhere or press any key to interrupt',
                                        chs: '触摸屏幕或按下任意按键可终止关屏',
                                    },
                                    $bind() {
                                        Object.keys(this).forEach((k) => {
                                            this[k].toString = () => {
                                                return this[k].eng + '\n' + this[k].chs;
                                            };
                                        });
                                        delete this.$bind;
                                        return this;
                                    },
                                }.$bind();

                                _w_title.attr('text', _msg.title);
                                _w_title.attr('color', _c.text);
                                _w_duration.attr('text', _msg.duration);
                                _w_duration.attr('color', _c.text);
                                _w_interrupt.attr('text', _msg.interrupt);
                                _w_interrupt.attr('color', _c.text);
                                _w_img.attr('tint_color', _c.img);
                            },
                        },
                    };

                    Object.defineProperty($$app.layout, 'closeAll', {
                        value(without_cover) {
                            Object.keys($$app.layout).forEach((k) => {
                                let _o = $$app.layout[k];
                                if (!(without_cover && _o.is_cover)) {
                                    _o.close.call(_o);
                                }
                            });
                        },
                        enumerable: false, // default
                    });

                    return this;

                    // tool function(s) //

                    function _closeWindow() {
                        this.itv_id && clearInterval(this.itv_id);
                        this.window && this.window.close();
                    }

                    function _initCfgColors() {
                        let _alpha = this.cfg['color_alpha'] || 0xff;
                        Object.keys(this.cfg.colors).forEach((k) => {
                            let _c = this.cfg.colors[k];
                            this.cfg.colors[k] = colors.argb(_alpha,
                                colors.red(_c),
                                colors.green(_c),
                                colors.blue(_c));
                        });
                    }
                },
                setIntent() {
                    /**
                     * @type {{
                     *     home: Appx$StartActivity$Param,
                     *     rl: Appx$StartActivity$Param,
                     *     acc_man: Appx$StartActivity$Param,
                     *     acc_login: Appx$StartActivity$Param,
                     * }}
                     */
                    $$app.intent = {
                        home: {
                            url: {
                                src: 'alipays://platformapi/startapp',
                                query: {
                                    saId: 20000067,
                                    url: 'https://60000002.h5app.alipay.com/www/home.html',
                                    __webview_options__: {
                                        transparentTitle: 'auto',
                                        backgroundColor: -1,
                                        startMultApp: 'YES',
                                        enableCubeView: 'NO',
                                        enableScrollBar: 'NO',
                                    },
                                },
                            },
                            packageName: $$app.alipay_pkg,
                        },
                        rl: {
                            url: {
                                src: 'alipays://platformapi/startapp',
                                query: {
                                    saId: 20000067,
                                    url: {
                                        src: 'https://60000002.h5app.alipay.com/www/listRank.html',
                                        query: {conf: '["totalRank"]'},
                                    },
                                    __webview_options__: {
                                        transparentTitle: 'none',
                                        backgroundColor: -1,
                                        canPullDown: 'NO',
                                        backBehavior: 'back',
                                        enableCubeView: 'NO',
                                        startMultApp: 'YES',
                                        showOptionMenu: 'YES',
                                        enableScrollBar: 'NO',
                                        closeCurrentWindow: 'YES',
                                        readTitle: 'NO',
                                        defaultTitle: $$app.rl_title,
                                    },
                                },
                                exclude: 'defaultTitle',
                            },
                            packageName: $$app.alipay_pkg,
                        },
                        acc_man: {
                            data: 'alipays://platformapi/startapp?appId=20000027',
                            packageName: $$app.alipay_pkg,
                        },
                        acc_login: {
                            data: 'alipays://platformapi/startapp?appId=20000008',
                            packageName: $$app.alipay_pkg,
                        },
                    };

                    return this;
                },
            };
        }

        function accSetter() {
            return {
                setParams() {
                    global.$$acc = {
                        switch: $$cfg.account_switch,
                        user_list: {
                            _plans: {
                                intent() {
                                    appx.startActivity($$app.intent.acc_man);
                                },
                                pipeline() {
                                    $$app.page.alipay.home({is_debug_info: false});

                                    return clickActionsPipeline([
                                        [['我的', 'p1']],
                                        [['设置', {boundsInside: [cX(0.8), 0, W, cYx(0.2)]}]],
                                        [['换账号登录', null]],
                                    ], {name: '账号切换页面', default_strategy: 'widget'});
                                },
                            },
                            launch(plans_arr) {
                                debugInfo('打开"账号切换"页面');

                                // TODO if (!plans_arr) loadFromConfig
                                return (plans_arr || ['intent', 'pipeline']).some((plan) => {
                                    let _task_nm = '计划' + plan.surround('"');
                                    this._plans[plan]();
                                    if (waitForAction(this.isInPage, 2e3)) {
                                        debugInfo(_task_nm + '成功');
                                        return true;
                                    }
                                    debugInfo(_task_nm + '失败');
                                }) || messageAction('进入"账号切换"页面失败', 4, 1, 0, '2_dash');
                            },
                            parse(name_str) {
                                if (!this.isInPage()) {
                                    messageAction('解析用户名信息失败', 4, 1, 0, -1);
                                    messageAction('当前非账户切换页面', 8, 0, 1, 1);
                                }

                                let _sltr = idMatches(/.+_item_current/);
                                waitForAction(_sltr, 2e3, 80); // just in case
                                sleep(240);

                                // current logged in user abbr (with a list arrow)
                                let _cur_abbr = $$sel.pickup([_sltr, 's-1'], 'txt');
                                // abbr of param 'name_str'
                                let _name_abbr = this.getAbbrFromList(name_str);
                                // let _is_logged_in = $$acc.isMatchAbbr(name_str, _cur_abbr);
                                let _is_logged_in = _cur_abbr === _name_abbr;
                                let _is_in_list = _is_logged_in || _name_abbr;

                                return {
                                    cur_abbr: _cur_abbr,
                                    abbr: _name_abbr,
                                    is_logged_in: _is_logged_in,
                                    is_in_list: _is_in_list,
                                };
                            },
                            isInList(name_str) {
                                return $$sel.pickup([/.+\*{3,}.+/, {cn$: 'TextView'}], 'wc')
                                    .some((w) => {
                                        let _abbr_name = $$sel.pickup(w, 'txt');
                                        if ($$acc.isMatchAbbr(name_str, _abbr_name)) {
                                            return this.abbr_name_in_list = _abbr_name;
                                        }
                                    });
                            },
                            isInPage() {
                                return $$acc.isInSwAccPg();
                            },
                            makeInPage(force) {
                                return !force && this.isInPage() || this.launch();
                            },
                            getAbbrFromList(name_str) {
                                return this.isInList(name_str) ? this.abbr_name_in_list : '';
                            },
                        },
                        _codec(str, opr) {
                            let _str = str || '';
                            let _res = '';
                            let _factor = {e: 1, d: -1}[opr[0]];
                            for (let i in _str) {
                                let _char_code = _str.charCodeAt(+i);
                                let _shifting = ((996).ICU + +i) * _factor;
                                _res += String.fromCharCode(_char_code + _shifting);
                            }
                            return _res;
                        },
                        encode(str) {
                            if (str) {
                                return this._codec(str, 'enc');
                            }
                            messageAction('编码参数为空', 8, 4, 0, 2);
                        },
                        decode(str) {
                            if (str) {
                                return this._codec(str, 'dec');
                            }
                            messageAction('解码参数为空', 8, 4, 0, 2);
                        },
                        isLoggedIn(name_str) {
                            let _this = this;

                            return _ready() && _check();

                            // tool function(s) //

                            function _ready() {
                                // TODO...
                                return _this.isInSwAccPg() || _this.user_list.launch();
                            }

                            function _check() {
                                debugInfo('检查账号列表登录状态');

                                let _parsed = _this.user_list.parse(name_str);

                                if (!_parsed.abbr) {
                                    debugInfo('当前登录账户缩略名无效', 3);
                                } else if (!$$acc.init_logged_in_usr) {
                                    debugInfo('记录初始登录账户缩略名');
                                    $$acc.init_logged_in_usr = _parsed.abbr;
                                    if ($$acc.main.isMain(name_str) && _parsed.is_logged_in) {
                                        $$flag.init_logged_in_main = true;
                                    }
                                }

                                if (_parsed.is_logged_in) {
                                    debugInfo('目标账户已在登录状态');
                                    return true;
                                }

                                if (_parsed.is_in_list) {
                                    debugInfo('目标账户在账号列表中但未登录');
                                } else {
                                    debugInfo('目标账户不在账号列表中');
                                }
                            }
                        },
                        isInLoginPg() {
                            return $$sel.get('login_other_acc')
                                || $$sel.get('input_lbl_acc')
                                || $$sel.get('login_other_mthd_init_pg');
                        },
                        isInSwAccPg() {
                            return $$sel.get('login_new_acc')
                                || $$sel.get('switch_to_other_acc');
                        },
                        isMatchAbbr(name_str, abbr) {
                            name_str = name_str.toString();
                            abbr = abbr.toString();

                            if (!name_str || !abbr) {
                                return false;
                            }

                            let [i, j, k] = [0, name_str.length - 1, abbr.length - 1];
                            let _same = (p, q) => name_str[p] === abbr[q];
                            let _isAbbrStar = q => abbr[q] === '*';

                            for (; i <= j; i += 1) {
                                if (!_same(i, i)) {
                                    if (_isAbbrStar(i)) {
                                        break;
                                    }
                                    return false;
                                }
                            }

                            if (i > j) {
                                return true;
                            }

                            for (; j > i, k > i; j -= 1, k -= 1) {
                                if (!_same(j, k)) {
                                    if (_isAbbrStar(k)) {
                                        break;
                                    }
                                    return false;
                                }
                            }

                            return abbr.slice(i, k + 1).match(/^\*+$/);
                        },
                        /**
                         * @param {Object} user
                         * @param {string} [user.abbr] - abbr username
                         * @param {string} [user.name] - full username without encryption
                         * @param {string} [user.name_raw] - encrypted username
                         * @param {string} [user.code_raw] - encrypted code
                         * @param {boolean} [user.direct] - login without acc list check
                         */
                        login(user) {
                            return _ready() && _parse() && _login();

                            // tool function(s) //

                            function _ready() {
                                if (!$$obj(user)) {
                                    messageAction('登录参数类型无效: ' + user, 8, 4, 0, 2);
                                }
                                if (!user.name && !user.abbr && !user.name_raw) {
                                    messageAction('usr_info参数缺少必要属性', 8, 4, 0, 2);
                                }
                                return user.direct || $$acc.user_list.makeInPage();
                            }

                            function _parse() {
                                this.abbr = user.abbr;
                                this.name = user.name;
                                this.code_raw = user.code_raw;
                                if (!user.name && user.name_raw) {
                                    this.name = $$acc.decode(user.name_raw);
                                }
                                if (!user.direct && !user.abbr) {
                                    this.abbr = $$acc.user_list.parse(this.name).abbr;
                                }
                                return true;
                            }

                            function _login() {
                                let _this = this;
                                let _name_str = _this.abbr || _this.name;
                                let _isLoggedIn = () => $$acc.isLoggedIn(_name_str);

                                return (_byUsrList() || _byInputText()) && _clearFlag();

                                // tool function(s) //

                                function _byUsrList() {
                                    return _ready() && _loginAndCheck();

                                    // tool function(s) //

                                    function _ready() {
                                        if (!_name_str) {
                                            debugInfo('无法使用列表快捷切换账户', 3);
                                            debugInfo('>缺少必要的账户名称信息', 3);
                                            return false;
                                        }
                                        if (user.direct) {
                                            debugInfo('放弃使用列表快捷切换账户', 3);
                                            debugInfo('>检测到直接登录参数', 3);
                                            return false;
                                        }
                                        return true;
                                    }

                                    function _loginAndCheck() {
                                        if (_isLoggedIn()) {
                                            return true;
                                        }
                                        if (!_this.abbr) {
                                            return false;
                                        }

                                        let _conds = {
                                            name: '列表快捷切换账户',
                                            time: 1, // 1 min
                                            wait: [{
                                                remark: '登录中进度条',
                                                cond: () => $$sel.pickup(className('ProgressBar')),
                                            }],
                                            success: [{
                                                remark: '支付宝首页',
                                                cond: () => $$sel.get('alipay_home'),
                                            }, {
                                                remark: 'H5关闭按钮',
                                                cond: () => $$sel.get('close_btn'),
                                            }],
                                            fail: [{
                                                remark: '出现登录页面',
                                                cond: () => $$acc.isInLoginPg(),
                                            }],
                                            timeout_review: [{
                                                remark: '强制账号列表检查',
                                                cond: () => _isLoggedIn(),
                                            }],
                                        };

                                        for (let i = 0; i < 3; i += 1) {
                                            debugInfo((i ? '再次尝试' : '') + '点击列表中的账户');
                                            clickAction($$sel.pickup([_this.abbr, 'p5']), 'w');

                                            debugInfo('开始监测账户切换结果');
                                            if (!_condChecker(_conds)) {
                                                return false;
                                            }
                                            if (_isLoggedIn()) {
                                                return true;
                                            }
                                        }
                                    }
                                }

                                function _byInputText() {
                                    let _err_msg = () => $$sel.get('login_err_msg');
                                    let _err_ens = () => $$sel.get('login_err_ensure');

                                    return _ready() && _login() && _check();

                                    // tool function(s) //

                                    function _ready() {
                                        /** @type {{trigger:function():*,exec:function():boolean}[]} */
                                        let _monitors = [{
                                            trigger() {
                                                return $$sel.get('acc_logged_out');
                                            },
                                            exec() {
                                                return clickAction($$sel.pickup(/好的|OK/), 'w');
                                            },
                                        }, {
                                            trigger() {
                                                return this.w = $$sel.pickup(/.+img_dialog_close/);
                                            },
                                            exec() {
                                                return clickAction(this.w, 'w');
                                            },
                                        }, {
                                            trigger() {
                                                return $$sel.pickup(/android:id\/autofill_dataset.*/);
                                            },
                                            exec() {
                                                return back();
                                            },
                                        }];
                                        let _thd_monitor = threadsx.start(function () {
                                            timeRecorder('acc_login_by_input_text');
                                            while (timeRecorder('acc_login_by_input_text', 'L') < 30e3) {
                                                _monitors.some(o => o.trigger() && o.exec()) && sleep(500);
                                                sleep(240);
                                            }
                                        });

                                        let _in = () => $$acc.isInLoginPg() || $$acc.isInSwAccPg();
                                        let _cond = () => _in() && !waitForAction(() => !_in(), 3, 240);
                                        let _cond_state = waitForAction(_cond, 15e3, 240);

                                        _thd_monitor.interrupt();

                                        if (!_cond_state) {
                                            return messageAction('无法判断当前登录页面状态', 4, 1, 0, 2);
                                        }
                                        if (!$$acc.isInLoginPg()) {
                                            let _w = $$sel.get('login_new_acc');
                                            if (!clickAction($$sel.pickup([_w, 'p4']), 'w')) {
                                                appx.startActivity($$app.intent.acc_login);
                                            }
                                        }
                                        return $$sel.get('input_lbl_code') || _clickOtherBtnIFN();

                                        // tool function(s) //

                                        function _clickOtherBtnIFN() {
                                            let _acc, _lbl, _mthd1, _mthd2;
                                            let _a = () => _acc = $$sel.get('login_other_acc');
                                            let _m1 = () => _mthd1 = $$sel.get('login_other_mthd_init_pg');
                                            let _m2 = () => _mthd2 = $$sel.get('login_other_mthd');
                                            let _lb = () => _lbl = $$sel.get('input_lbl_acc');

                                            waitForAction(() => _a() || _m1() || _m2() || _lb(), 3e3);

                                            if (_acc) {
                                                debugInfo('点击"换个账号登录"按钮');
                                                clickAction(_acc, 'w');
                                            } else if (_mthd1) {
                                                debugInfo('点击"其他登录方式"按钮');
                                                clickAction(_mthd1, 'w');
                                            } else if (_mthd2) {
                                                debugInfo('点击"换个方式登录"按钮');
                                                clickAction(_mthd2, 'w');
                                                sleep(240);
                                                if (clickAction($$sel.pickup('密码登录'), 'w')) {
                                                    debugInfo('点击"密码登录"选项');
                                                }
                                            }

                                            return waitForAction(_lb, 3e3); // just in case
                                        }
                                    }

                                    function _login() {
                                        let _lbl_code = () => $$sel.get('input_lbl_code');

                                        return _inputName(_this.name) && _inputCode(_this.code_raw);

                                        // tool function(s) //

                                        function _inputName(name) {
                                            debugInfo('尝试完成账户名输入');

                                            return _input() && _next();

                                            // tool function(s) //

                                            function _input() {
                                                let _w_acc = null;
                                                let _sel_acc = () => _w_acc = $$sel.get('input_lbl_acc');

                                                let _inputted = () => $$sel.pickup(name);
                                                let _noInputted = () => !_inputted();
                                                let _cA = () => waitForAction(_inputted, 1e3);
                                                let _cB = () => !waitForAction(_noInputted, 500);

                                                let _max = 3;
                                                while (_max--) {
                                                    if (waitForAction(_sel_acc, 1.5e3)) {
                                                        debugInfo('找到"账号"输入项控件');
                                                        let _w = $$sel.pickup([_w_acc, 'p2c1']);
                                                        let _res = false;
                                                        if (_w) {
                                                            debugInfo('布局树查找可编辑"账号"控件成功');
                                                            _w.setText(''); // just in case
                                                            _res = _w.setText(name);
                                                        } else {
                                                            debugInfo('布局树查找可编辑"账号"控件失败', 3);
                                                            debugInfo('尝试使用通用可编辑控件', 3);
                                                            let _edit = className('EditText').findOnce();
                                                            _res = _edit && _edit.setText(name);
                                                        }
                                                        if (_res) {
                                                            debugInfo('控件输入账户名成功');
                                                        } else {
                                                            debugInfo('控件输入账户名失败', 3);
                                                        }
                                                    } else {
                                                        messageAction('布局查找"账号"输入项控件失败', 3);
                                                        messageAction('尝试盲输', 3);
                                                        setText(0, name);
                                                    }

                                                    if (_cA() && _cB()) {
                                                        break;
                                                    }
                                                }

                                                if (_max >= 0) {
                                                    debugInfo('成功输入账户名');
                                                    return true;
                                                }
                                                messageAction('输入账户名后检查输入未通过', 4, 1, 0, '2_dash');
                                            }

                                            function _next() {
                                                _require() && _click();
                                                return _check();

                                                // tool function(s) //

                                                function _require() {
                                                    let _s = '无需点击"下一步"按钮';
                                                    if (_lbl_code()) {
                                                        return debugInfo([_s, '>存在"密码"输入项控件']);
                                                    }
                                                    if ($$sel.get('login_btn')) {
                                                        return debugInfo([_s, '>存在"登录"按钮控件']);
                                                    }
                                                    return true;
                                                }

                                                function _click() {
                                                    debugInfo('点击"下一步"按钮');
                                                    let _sel = () => $$sel.get('login_next_step');
                                                    clickAction($$sel.pickup([_sel(), 'p1']), 'w', {
                                                        max_check_times: 3,
                                                        check_time_once: 500,
                                                        condition_success: () => !_sel(),
                                                    });
                                                }

                                                function _check() {
                                                    let _again = () => $$sel.pickup(/重新输入|Try again/);
                                                    let _other = () => $$sel.get('login_other_mthd');
                                                    let _by_code = () => $$sel.get('login_by_code');
                                                    let _cond = () => (
                                                        _lbl_code() || _err_ens() || _other() || _again()
                                                    );
                                                    if (!waitForAction(_cond, 8e3)) {
                                                        let _s = '查找"密码"输入项控件超时';
                                                        return messageAction(_s, 4, 1, 0, '2_dash');
                                                    }
                                                    let _max = 3;
                                                    while (_max--) {
                                                        if (waitForAction(_lbl_code, 1.5e3)) {
                                                            debugInfo('找到"密码"输入项控件');
                                                            return true;
                                                        }
                                                        if (_err_ens() || _again()) {
                                                            let _err = '失败提示信息:' + _err_msg();
                                                            messageAction('登录失败', 4, 1, 0, -1);
                                                            messageAction(_err, 8, 0, 1, 1);
                                                        }
                                                        if (_other()) {
                                                            debugInfo('点击"换个方式登录"按钮');
                                                            clickAction(_other(), 'w');
                                                            if (!waitForAction(_by_code, 2e3)) {
                                                                let _m = '未找到"密码登录"按钮';
                                                                return messageAction(_m, 4, 1, 0, '2_dash');
                                                            }
                                                            debugInfo('点击"密码登录"按钮');
                                                            clickAction(_by_code().parent(), 'w');
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        function _inputCode(code_raw) {
                                            debugInfo('尝试完成密码输入');

                                            return code_raw ? _autoIpt() : _manIpt();

                                            // tool function(s) //

                                            function _autoIpt() {
                                                debugInfo('尝试自动输入密码');

                                                let _dec = require('./modules/mod-pwmap').decrypt;
                                                let _pref = '布局树查找可编辑"密码"控件';
                                                let _sel = $$sel.pickup([_lbl_code(), 'p2c1']);
                                                if (_sel && _sel.setText(_dec(code_raw))) {
                                                    debugInfo(_pref + '成功');
                                                } else {
                                                    debugInfo([_pref + '失败', '尝试使用通用可编辑控件'], 3);
                                                    let _w = className('EditText').findOnce();
                                                    let _input = _w && _w.setText(_dec(code_raw));
                                                    let _suff = _input ? '成功' : '失败';
                                                    debugInfo('通用可编辑控件输入' + _suff, _input ? 0 : 3);
                                                }

                                                debugInfo('点击"登录"按钮');
                                                if (clickAction($$sel.get('login_btn'), 'w')) {
                                                    return true;
                                                }
                                                messageAction('输入密码后点击"登录"失败', 4, 1, 0, '2_dash');
                                            }

                                            function _manIpt() {
                                                debugInfo('需要手动输入密码');
                                                devicex.vibrate([100, 200, 100, 200, 200]);

                                                let _user_tt = 2; // min
                                                let _btn_tt = 2; // min
                                                $$flag.glob_e_scr_paused = true;
                                                devicex.keepOn(Math.floor(_user_tt + _btn_tt) * 60e3);

                                                let _flag = false;
                                                threadsx.start(_thdUserAct);

                                                while (!_flag) {
                                                    sleep(500);
                                                }

                                                // prevent screen from turning off immediately
                                                click(1e5, 1e5);
                                                delete $$flag.glob_e_scr_paused;
                                                devicex.cancelOn();

                                                return true;

                                                // tool function(s) //

                                                function _thdUserAct() {
                                                    let _d = dialogsx.builds([
                                                        '需要密码', 'login_password_needed',
                                                        0, 0, 'K', 1,
                                                    ]).on('positive', d => d.dismiss()).show();

                                                    _flag = _waitForCode() && _waitForBtn();

                                                    // tool function(s) //

                                                    function _waitForCode() {
                                                        debugInfo('等待用户响应"需要密码"对话框');
                                                        debugInfo('>最大超时时间: ' + _user_tt + '分钟');

                                                        let _cond = () => _d.isCancelled()
                                                            && !waitForAction(() => !_d.isCancelled(), 2e3);
                                                        if (waitForAction(_cond, _user_tt * 60e3)) {
                                                            return true;
                                                        }
                                                        devicex.cancelOn();
                                                        _d.dismiss();
                                                        messageAction('脚本无法继续', 4, 0, 0, -1);
                                                        messageAction('登录失败', 4, 0, 1);
                                                        messageAction('需要密码时等待用户响应超时', 8, 4, 1, 1);
                                                    }

                                                    function _waitForBtn() {
                                                        debugInfo('等待用户点击"登录"按钮');
                                                        debugInfo('>最大超时时间: ' + _btn_tt + '分钟');

                                                        let _rex = '.*(confirmSet.*|mainTip|登录中.*|message)';
                                                        let _cond = () => !$$sel.get('login_btn')
                                                            && !waitForAction(() => (
                                                                $$sel.pickup(_rex) || _err_ens()
                                                            ), 500);
                                                        if (!waitForAction(_cond, _btn_tt * 60e3)) {
                                                            devicex.cancelOn();
                                                            _d.dismiss(); // just in case
                                                            messageAction('脚本无法继续', 4, 0, 0, -1);
                                                            messageAction('登录失败', 4, 0, 1);
                                                            messageAction('等待"登录"按钮消失超时', 8, 4, 1, 1);
                                                        }
                                                        return true;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    function _check() {
                                        let _conds = {
                                            name: '登录账户',
                                            time: 0.5, // 30 sec
                                            wait: [{
                                                remark: '登录中进度条',
                                                cond: () => $$sel.pickup(/.*登录中.*/),
                                            }],
                                            success: [{
                                                remark: '支付宝首页',
                                                cond: () => $$sel.get('alipay_home'),
                                            }, {
                                                remark: 'H5关闭按钮',
                                                cond: () => $$sel.get('close_btn'),
                                            }, {
                                                remark: '支付宝设置页面',
                                                cond: () => $$sel.pickup(/(退出|换账号)登录/),
                                            }],
                                            fail: [{
                                                remark: '失败提示',
                                                cond: () => _err_ens(),
                                                feedback() {
                                                    devicex.cancelOn();
                                                    messageAction('脚本无法继续', 4, 0, 0, -1);
                                                    messageAction('登录失败', 4, 1, 1);
                                                    messageAction('失败提示信息:' + _err_msg(), 8, 0, 1, 1);
                                                },
                                            }, {
                                                remark: '失败提示',
                                                cond: () => $$sel.pickup(/.*confirmSetting|.*mainTip/),
                                                feedback() {
                                                    let _fail_pref = '失败提示信息: ';
                                                    let _fail_main = $$sel.pickup(/.*mainTip/, 'txt');
                                                    let _fail_msg = _fail_pref + _fail_main;
                                                    devicex.cancelOn();
                                                    messageAction('脚本无法继续', 4, 0, 0, -1);
                                                    messageAction('登录失败', 4, 1, 1);
                                                    messageAction(_fail_msg, 8, 0, 1, 1);
                                                },
                                            }],
                                            timeout_review: [{
                                                remark: '强制账号列表检查',
                                                cond() {
                                                    if ($$acc.isLoggedIn(_this.name)) {
                                                        return true;
                                                    }
                                                    messageAction('脚本无法继续', 4, 0, 0, -1);
                                                    messageAction('切换主账户超时', 8, 4, 1, 1);
                                                },
                                            }],
                                        };

                                        return _condChecker(_conds);
                                    }
                                }

                                function _condChecker(cond) {
                                    if (!$$obj(cond)) {
                                        debugInfo(['条件检查器参数无效', '>' + cond]);
                                        return false;
                                    }

                                    let _name = cond.name || '条件检查';
                                    debugInfo('开始' + (cond.name || '') + '条件检查');

                                    let _t = cond.time || 1;
                                    _t *= _t < 100 ? 60e3 : 1;

                                    devicex.keepOn(_t + 5 * 60e3);

                                    let _res = _checker();

                                    devicex.cancelOn();

                                    return _res;

                                    // tool function(s) //

                                    function _checker() {
                                        while (_t > 0) {
                                            if (_meetCond(cond.success, 'success')) {
                                                debugInfo(_name + '成功');
                                                return true;
                                            }
                                            if (_meetCond(cond.fail, 'fail')) {
                                                return debugInfo(_name + '失败', 3);
                                            }
                                            if (!_meetCond(cond.wait, 'wait')) {
                                                _t -= 500;
                                            }
                                            sleep(500);
                                        }

                                        debugInfo('确定性条件检查已超时');
                                        if (!cond.timeout_review) {
                                            return debugInfo(_name + '失败', 3);
                                        }

                                        debugInfo('开始检查超时复检条件');
                                        if (_meetCond(cond.timeout_review, 'timeout_review')) {
                                            debugInfo(_name + '成功');
                                            return true;
                                        }
                                        debugInfo(['超时复检失败', _name + '失败'], 3);

                                        // tool function(s) //

                                        function _meetCond(cond_arr, type) {
                                            return (cond_arr || []).some((cond_o) => {
                                                let _o = cond_o || {};
                                                if ($$func(_o.cond) && _o.cond()) {
                                                    let _types = {
                                                        'success': '成功',
                                                        'fail': '失败',
                                                        'wait': '持续等待',
                                                        'timeout_review': '超时复检成功',
                                                    };
                                                    debugInfo('满足' + _types[type] + '条件');
                                                    _o.remark && debugInfo('>' + _o.remark);
                                                    if (type === 'wait') {
                                                        while (_o.cond()) {
                                                            sleep(300);
                                                        }
                                                    }
                                                    if ($$func(_o.feedback)) {
                                                        debugInfo('检测到反馈方法');
                                                        _o.feedback.call(_o);
                                                    }
                                                    return true;
                                                }
                                            });
                                        }
                                    }
                                }

                                function _clearFlag() {
                                    debugInfo('清除账户登出标记');
                                    delete $$flag.acc_logged_out;
                                    return true;
                                }
                            }
                        },
                        logBack() {
                            let _sto_key = 'log_back_in_user';
                            if ($$flag.init_logged_in_main) {
                                debugInfo(['无需回切账户', '>初始登录账户已是主账户']);
                                return _clearSto();
                            }

                            if (!$$cfg.account_log_back_in_switch) {
                                debugInfo(['无需回切账户', '>旧账户回切功能未开启']);
                                return _clearSto();
                            }

                            let _init_usr = this.init_logged_in_usr;
                            if (!_init_usr) {
                                debugInfo(['无法回切账户', '>未获取初始登录账户信息']);
                                return _clearSto();
                            }

                            let _init_data = {name: _init_usr, times: 0};
                            let _sto_data = $$sto.af.get(_sto_key, _init_data);
                            if (_sto_data.name !== _init_usr) {
                                _sto_data = _init_data;
                            }

                            let _k = 'account_log_back_in_max_continuous_times';
                            if (_sto_data.times >= $$cfg[_k]) {
                                debugInfo(['禁止回切账户', '>此旧账户回切次数已达上限']);
                                debugInfo('>上限值: ' + $$cfg[_k]);
                                return _clearSto();
                            }

                            debugInfo('开始旧账户回切操作');
                            debugInfo('>当前连续回切次数: ' + ++_sto_data.times);

                            if (!$$acc.login(_init_usr)) {
                                debugInfo('旧账户回切失败', 3);
                                return _clearSto();
                            }
                            debugInfo('旧账户回切成功');

                            $$sto.af.put(_sto_key, _sto_data);
                            debugInfo('已更新回切账户存储信息');

                            // tool function(s) //

                            function _clearSto() {
                                if ($$sto.af.contains(_sto_key)) {
                                    $$sto.af.remove(_sto_key);
                                    debugInfo('已清理回切账户存储信息');
                                }
                            }
                        },
                    };

                    return this;
                },
                setMain() {
                    $$acc.main = {
                        _avatar: {
                            _path: $$app.local_pics_path + 'main_user_mini_avatar_clip.png',
                            _isTotalGreen(img) {
                                let _img = imagesx.compress(img, 2);
                                let _pts = imagesx.findAllPointsForColor(_img, '#30bf6c', {
                                    threshold: 50,
                                });
                                let _res = _pts.length > _img.height * _img.width * 0.98;
                                _img.recycle();
                                _img = null;
                                return _res;
                            },
                            isValid(path) {
                                if ($$flag.acc_logged_out) {
                                    return debugInfo(['跳过主账户头像检查', '>检测到账户登出状态']);
                                }

                                // cleaner for legacy bug (caused by v1.9.23)
                                !function () {
                                    let _lpp = $$app.local_pics_path;
                                    let _idx = this._path.indexOf(_lpp) + _lpp.length;
                                    files.remove(files.path('./false' + this._path.slice(_idx)));
                                }.call(this);

                                timeRecorder('avt_chk');

                                let _img = images.read(path || this._path);
                                let _res;
                                if (_img) {
                                    _res = _check.call(this, _img);
                                    _img.recycle();
                                    _img = null;
                                }

                                $$app.avatar_checked_time = timeRecorder('avt_chk', 'L', 'auto');

                                if (_res) {
                                    debugInfo(['当前账户符合主账户身份', '>本地主账户头像匹配成功']);
                                    return $$flag.init_logged_in_main = true;
                                }
                                debugInfo(['主账户身份检查未通过', '>本地主账户头像不匹配']);

                                // tool function(s) //

                                function _check(img) {
                                    if (!imagesx.isImageWrapper(img)) {
                                        return false;
                                    }
                                    let _avt = this.getAvtClip();
                                    if (!imagesx.isImageWrapper(_avt)) {
                                        return false;
                                    }
                                    let _w = w => $$num(cX(26), '<=', w, '<=', _avt.getWidth());
                                    let _h = h => $$num(cX(26), '<=', h, '<=', _avt.getHeight());
                                    let _g = img => this.checkGreen(img);
                                    if (_w(img.getWidth()) && _h(img.getHeight()) && _g(img)) {
                                        let _res = imagesx.findImage(_avt, img, {
                                            level: 1,
                                            compress_level: 2,
                                        });
                                        if (_res) {
                                            this._avt_clip_cached = _avt;
                                            return true;
                                        }
                                    }
                                    return false;
                                }
                            },
                            /** @returns {boolean|ImageWrapper$} */
                            getAvtClip() {
                                let _b = null;
                                waitForAction(() => _b = _getAvtPos(), 8e3, 100);

                                if (!_b || !Object.size(_b)) {
                                    messageAction('无法获取当前头像样本', 3);
                                    messageAction('森林主页头像控件定位失败', 3, 1);
                                    return false;
                                }

                                let [l, t, w, h] = [_b.left, _b.top, _b.width(), _b.height()];
                                if (w < 3 || h < 3) {
                                    messageAction('无法继续匹配当前头像样本', 3, 0, 0, 'dash_up');
                                    messageAction('森林主页头像控件数据无效', 3, 0, 1, 'dash');
                                    return false;
                                }

                                let _avt_clip;
                                let _chk = this.checkGreen.bind(this);
                                waitForAction(() => _chk(_avt_clip = _getAvtClip()), 2e3);

                                return _avt_clip;

                                // tool function(s) //

                                function _getAvtPos() {
                                    let _bnd = null;
                                    void [
                                        '我的大树养成记录',
                                        [idMatches(/.*us.r.+e.+gy/), 'p2c0'],
                                        ['种树', {className: 'Button'}, 'p1c0'],
                                        [idMatches(/.*home.*panel/), 'c0>0>0'],
                                    ].some((kw) => {
                                        if ((_bnd = $$sel.pickup(kw, 'bounds'))) {
                                            debugInfo('森林主页头像控件定位成功');
                                            return true;
                                        }
                                    });
                                    return _bnd;
                                }

                                function _getAvtClip() {
                                    // chop: here means chopped
                                    let _w_chop = w / Math.SQRT2;
                                    let _h_chop = h / Math.SQRT2;

                                    // c: here means clip
                                    let _x_c = l + (w - _w_chop) / 2 + 1;
                                    let _y_c = t + (h - _h_chop) / 2 + 1;
                                    let _w_c = _w_chop - 2;
                                    let _h_c = _h_chop - 2;

                                    // A. get the biggest rectangle area inside the circle (or ellipse)
                                    // B. one pixel from each side of the area was removed
                                    return imagesx.clip(imagesx.capt(), _x_c, _y_c, _w_c, _h_c);
                                }
                            },
                            save(path) {
                                let _avt_clip = this._avt_clip_cached || this.getAvtClip();
                                if (_avt_clip) {
                                    images.save(_avt_clip, path || this._path);
                                    _avt_clip.recycle();
                                    _avt_clip = null;
                                    if (this._avt_clip_cached) {
                                        this._avt_clip_cached.recycle();
                                        this._avt_clip_cached = null;
                                    }
                                    return true;
                                }
                            },
                            checkGreen(clip) {
                                return !this._isTotalGreen(clip);
                            },
                        },
                        _avail() {
                            if (!$$acc.switch) {
                                return debugInfo('账户功能未开启');
                            }
                            if (!this.name_raw) {
                                return debugInfo('主账户用户名未设置');
                            }
                            return true;
                        },
                        name_raw: $$cfg.main_account_info.account_name,
                        code_raw: $$cfg.main_account_info.account_code,
                        isMain(name_str) {
                            return $$acc.isMatchAbbr(name_str, $$acc.decode(this.name_raw));
                        },
                        login(par) {
                            if (this._avail()) {
                                if (this._avatar.isValid()) {
                                    return true;
                                }
                                if (_loginMain()) {
                                    $$app.page.af.launch();
                                    this._avatar.save();
                                    return true;
                                }
                                messageAction('强制停止脚本', 4, 0, 0, -1);
                                messageAction('主账户登录失败', 8, 4, 1, 1);
                            }

                            // tool function(s) //

                            function _loginMain() {
                                return $$acc.login(Object.assign({
                                    name_raw: $$acc.main.name_raw,
                                    code_raw: $$acc.main.code_raw,
                                }, par || {}));
                            }
                        },
                    };

                    return this;
                },
            };
        }
    },
    queue() {
        let _my_e = enginesx.my_engine;
        let _my_e_id = enginesx.my_engine_id;
        let _excl_tag = 'exclusive_task';
        let _ts_tag = 'launch_timestamp';
        _my_e.setTag(_excl_tag, 'af');
        _my_e.setTag(_ts_tag, $$app.ts);

        let _b = bombSetter();
        _b.trigger() && _b.explode();

        let _q = $$app.queue = queueSetter();
        _q.trigger() && _q.monitor() && _q.queue();

        return $$init;

        // tool function(s) //

        function bombSetter() {
            return {
                trigger() {
                    let _max = 20;
                    while (_max--) {
                        try {
                            return engines.all().filter((e) => {
                                let _gap = () => $$app.ts - e.getTag(_ts_tag);
                                return e.getTag(_excl_tag) === 'af'
                                    && _my_e_id > e.id
                                    && _gap() < $$cfg.min_bomb_interval_global;
                            }).length;
                        } catch (e) {
                            // Wrapped java.util.ConcurrentModificationException
                            // exception happens with a tiny possibility
                            $$sleep(30, 80);
                        }
                    }
                },
                explode() {
                    messageAction('脚本因安全限制被强制终止', 3, 0, 0, -1);
                    messageAction('连续运行间隔时长过小', 3, 0, 1);
                    messageAction('触发脚本炸弹预防阈值', 3, 0, 1, 1);
                    exit();
                },
            };
        }

        function queueSetter() {
            return {
                get excl_tasks_all() {
                    while (1) {
                        try {
                            return engines.all().filter(e => e.getTag(_excl_tag));
                        } catch (e) {
                            // Wrapped java.util.ConcurrentModificationException
                            // exception happens with a small possibility
                            $$sleep(20, 50);
                        }
                    }
                },
                get excl_tasks_ahead() {
                    while (1) {
                        try {
                            return engines.all().filter((e) => (
                                e.getTag(_excl_tag) && e.id < _my_e_id
                            ));
                        } catch (e) {
                            // Wrapped java.util.ConcurrentModificationException
                            // exception happens with a small possibility
                            $$sleep(20, 50);
                        }
                    }
                },
                get excl_tasks_ahead_len() {
                    return this.excl_tasks_ahead.length;
                },
                get excl_tasks_all_len() {
                    return this.excl_tasks_all.length;
                },
                trigger() {
                    return this.excl_tasks_ahead_len;
                },
                monitor() {
                    debugInfo('设置广播监听器');

                    events.broadcast.on('init_scr_on_state_change', (v) => {
                        debugInfo('接收到初始屏幕开关状态广播');
                        if (!$$app.queue.excl_tasks_ahead_len) {
                            debugInfo('根据广播消息修改状态参数');
                            $$app.init_scr_on_from_broadcast = v;
                        } else {
                            debugInfo(['放弃广播消息', '>当前任务正在排队中']);
                        }
                    });

                    return this;
                },
                queue() {
                    timeRecorder('sc_q'); // script queue
                    timeRecorder('sc_q_total');

                    let _init_que_len = this.excl_tasks_ahead_len;
                    let _que_len = _init_que_len;
                    let _sto_max_que_t = $$cfg.max_queue_time_global;
                    debugInfo('排他性任务排队中: ' + _que_len + '项');

                    let _init_max_que_t = _sto_max_que_t * _que_len;
                    let _max_que_t = _init_max_que_t;
                    debugInfo('已设置最大排队时间: ' + _max_que_t + '分钟');

                    while ((_que_len = this.excl_tasks_ahead_len)) {
                        if (_que_len !== _init_que_len) {
                            debugInfo('排他性任务队列发生变更', 'up');
                            let _amt = _init_que_len + '->' + _que_len;
                            debugInfo('任务数量: ' + _amt + '项');
                            _init_que_len = _que_len;
                            _max_que_t = _sto_max_que_t * _que_len;
                            let _t = _init_max_que_t + '->' + _max_que_t;
                            debugInfo('最大排队: ' + _t + '分钟');
                            _init_max_que_t = _max_que_t;
                            timeRecorder('sc_q'); // refresh
                        }
                        if (timeRecorder('sc_q', 'L', 60e3) >= _max_que_t) {
                            this.excl_tasks_ahead.forEach(e => e.forceStop());
                            debugInfo('强制停止队前所有排他性任务');
                            debugInfo('>已达最大排队等待时间');
                        }
                        $$sleep(1e3, '±500');
                    }

                    let _et = timeRecorder('sc_q_total', 'L', 'auto');
                    debugInfo('任务排队用时: ' + _et, 'Up');
                },
            };
        }
    },
    delay() {
        let _fg = fgAppBlistSetter();
        _fg.trigger() ? _fg.autoDelay() : _fg.clear();

        return $$init;

        // tool function(s) //

        function fgAppBlistSetter() {
            return {
                trigger() {
                    return _screenOn() && _inBlist();

                    // tool function(s) //

                    function _screenOn() {
                        if (devicex.is_init_screen_on) {
                            return true;
                        }
                        debugInfo(['跳过前置应用黑名单检测', '>屏幕未亮起']);
                    }

                    function _inBlist() {
                        let _i_pkg = $$app.init_fg_pkg;
                        let _passed = '前置应用黑名单检测通过';
                        return ($$cfg.foreground_app_blacklist || []).some((o) => {
                            let [_name, _pkg] = o.app_combined_name.split('\n');
                            if (_i_pkg === _pkg) {
                                return $$app.fg_black_app = _name;
                            }
                        }) || debugInfo(_i_pkg ? [_passed + ':', _i_pkg] : _passed);
                    }
                },
                autoDelay() {
                    messageAction('前置应用位于黑名单中:', 1, 0, 0, -1);
                    messageAction($$app.fg_black_app);

                    let _delay = delayInfoSetter();
                    let _ctr = _delay.continuous_times;
                    let _time = _delay.delay_time;
                    let _sum = _delay.delay_time_sum;
                    if ($$1(_ctr)) {
                        messageAction('本次任务自动推迟运行');
                    } else {
                        messageAction('本次任务自动推迟: ' + _time + '分钟');
                        messageAction('当前连续推迟次数: ' + _ctr);
                        messageAction('当前连续推迟总计: ' + _sum + '分钟');
                    }

                    $$sto.af.put('fg_blist_ctr', _ctr);
                    $$app.setPostponedTask(_time, {is_async: true, is_toast: false}); // `exit()` included
                    sleep(9e3); // in case task isn't set successfully before `exit()`
                    exit(); // thoroughly prevent script from going on (main thread)

                    // tool function(s) //

                    function delayInfoSetter(minutes) {
                        let _mm = minutes || [1, 1, 2, 3, 5, 8, 10];
                        let _ctr = $$sto.af.get('fg_blist_ctr', 0);
                        let _max_mm = _mm[_mm.length - 1];
                        let _time = _mm[_ctr] || _max_mm;
                        let _sum = 0;
                        for (let i = 0; i < _ctr; i += 1) {
                            _sum += _mm[i] || _max_mm;
                        }
                        return {
                            continuous_times: _ctr + 1,
                            delay_time: _time,
                            delay_time_sum: _sum,
                        };
                    }
                },
                clear: () => $$sto.af.remove('fg_blist_ctr'),
            };
        }
    },
    monitor() {
        // instant monitors with trigger
        let _isu = insuranceMonSetter();
        _isu.trigger() && _isu.clean().deploy();

        // instant and private monitors
        let _ist = instantMonSetter();
        _ist.maxRun().volKeys().globEvt().logOut().newestVer();

        // monitors put on standby for $$app invoking
        $$app.monitor = standbyMonSetter();
        $$app.monitor.insurance = _isu;

        return $$init;

        // monitor function(s) //

        function insuranceMonSetter() {
            let _keys = {
                ins_tasks: 'insurance_tasks',
                ins_accu: 'insurance_tasks_continuous_times',
                ins_accu_max: 'timers_insurance_max_continuous_times',
                ins_itv: 'timers_insurance_interval',
            };

            return {
                _thread: {
                    _fx(this_arg) {
                        typeof this_arg === 'object' && setInterval(() => {
                            if (this_arg.task) {
                                this_arg.task.setMillis(this_arg._next_task_time);
                                timersx.updateTimedTask(this_arg.task);
                            }
                        }, 10e3);
                    },
                    start(this_arg) {
                        this._thd = threadsx.start(() => this._fx(this_arg));
                    },
                    interrupt() {
                        if (this._thd) {
                            this._thd.interrupt();
                        }
                    },
                },
                get id() {
                    if (this.task) {
                        return this.task.id || -1;
                    }
                },
                get _sto_accu() {
                    return Number($$sto.af_ins.get(_keys.ins_accu, 0));
                },
                set _sto_accu(v) {
                    $$sto.af_ins.put(_keys.ins_accu, Number(v));
                },
                get _sto_ids() {
                    return $$sto.af_ins.get(_keys.ins_tasks, [])
                        .filter(id => timersx.getTimedTask(id));
                },
                get _next_task_time() {
                    return $$app.ts + $$cfg[_keys.ins_itv] * 60e3;
                },
                trigger() {
                    if (!$$cfg.timers_switch) {
                        return debugInfo('定时循环功能未开启');
                    }
                    if (!$$cfg.timers_self_manage_switch) {
                        return debugInfo('定时任务自动管理未开启');
                    }
                    if (!$$cfg.timers_insurance_switch) {
                        return debugInfo('意外保险未开启');
                    }
                    if ($$app.engines_exec_argv.no_insurance_flag) {
                        return debugInfo('检测到"无需保险"引擎参数');
                    }
                    let _max = $$cfg[_keys.ins_accu_max];
                    if (this._sto_accu < _max) {
                        return true;
                    }
                    debugInfo('本次会话不再设置保险定时任务');
                    debugInfo('>任务已达最大连续次数限制: ' + _max);
                    this.clean().reset();
                },
                /** @param {TimedTaskOptExt} [task_options] */
                clean(task_options) {
                    let _ids = this._sto_ids;
                    if (_ids.length) {
                        _ids.forEach(id => timersx.removeTimedTask(id, task_options));
                        debugInfo(['已移除意外保险定时任务:', '任务ID: ' + (
                            _ids.length > 1 ? '[ ' + _ids.join(', ') + ' ]' : _ids[0]
                        )]);
                    }
                    $$sto.af_ins.remove(_keys.ins_tasks);
                    return this;
                },
                reset() {
                    this._sto_accu = 0;
                    return this;
                },
                deploy() {
                    let _this = this;
                    timersx.addDisposableTask({
                        path: $$app.cwp,
                        date: _this._next_task_time,
                        is_async: true,
                        callback(task) {
                            _this.task = task;
                            _this.monitor();
                            let _ids = _this._sto_ids.concat([task.id]);
                            $$sto.af_ins.put(_keys.ins_tasks, _ids);
                            debugInfo('已设置意外保险定时任务');
                            debugInfo('任务ID: ' + task.id);
                        },
                    });
                    return this;
                },
                monitor() {
                    this._thread.start(this);
                    return this;
                },
                interrupt() {
                    this._thread.interrupt();
                    return this;
                },
                remove() {
                    this.id > 0 && timersx.removeTimedTask(this.id, {is_async: true});
                    return this;
                },
                increase() {
                    this._sto_accu += 1;
                },
            };
        }

        function instantMonSetter() {
            return {
                maxRun() {
                    let _max = Number($$cfg.max_running_time_global);

                    _max > 0 && threadsx.start(function () {
                        setTimeout(() => {
                            devicex.cancelOn({is_debug_info: false});
                            ui.post(() => messageAction('超时强制退出', 8, 4, 0, '2_n'));
                        }, _max * 60e3 + 3e3);
                    });

                    return this;
                },
                volKeys() {
                    debugInfo('设置音量键监听器');

                    threadsx.start(function () {
                        let _keyMsg = (e) => {
                            let _code = e.getKeyCode();
                            return android.view.KeyEvent.keyCodeToString(_code) +
                                ' ' + _code.toString().surround('()');
                        };
                        events.observeKey();
                        events.setKeyInterceptionEnabled('volume_down', true);
                        events.onceKeyUp('volume_down', function (e) {
                            messageAction('强制停止当前脚本', 3, 1, 0, -1);
                            messageAction('触发按键: 音量减/VOL-', 3, 0, 1);
                            messageAction(_keyMsg(e), 3, 0, 1, 1);
                            $$app.monitor.insurance.reset();
                            threads.shutDownAll();
                            engines.myEngine().forceStop();
                        });
                        events.setKeyInterceptionEnabled('volume_up', true);
                        events.onceKeyUp('volume_up', function (e) {
                            messageAction('强制停止所有脚本', 4, 0, 0, -1);
                            messageAction('触发按键: 音量加/VOL+', 4, 0, 1);
                            messageAction(_keyMsg(e), 4, 0, 1, 1);
                            $$app.monitor.insurance.reset();
                            threads.shutDownAll();
                            engines.stopAllAndToast();
                        });
                    });

                    return this;
                },
                /** @type {Object.<string,GlobEventMonitorOptions>|Object} */
                _glob_e_preset_options: {
                    phone: {
                        _getStoState() {
                            let _self = {
                                state_key: 'phone_call_state_idle_value',
                                get cur_state() {
                                    return $$cfg[this.state_key];
                                },
                                set cur_state(val) {
                                    let _dat = {};
                                    let _key = this.state_key;
                                    $$cfg[_key] = _dat[_key] = val;
                                    $$sto.af_cfg.put('config', _dat);
                                },
                            };
                            if (!$$und(_self.cur_state)) {
                                return _self.cur_state;
                            }
                            // won't write into storage
                            let _cur_state = devicex.getCallState();

                            let _sto = {
                                _key: 'phone_call_states',
                                get states() {
                                    return $$sto.af.get(this._key, []);
                                },
                                set states(arr) {
                                    $$sto.af.put(this._key, this.states.concat(arr));
                                },
                                get filled_up() {
                                    let _states = this.states;
                                    let _len = _states.length;
                                    if (_len >= 5) {
                                        let _tmp = [];
                                        for (let i = 0; i < _len; i += 1) {
                                            let n = _states[i];
                                            if (_tmp[n]) {
                                                if (_tmp[n] >= 4) {
                                                    _cur_state = n;
                                                    return true;
                                                }
                                                _tmp[n] += 1;
                                            } else {
                                                _tmp[n] = 1;
                                            }
                                        }
                                    }
                                    return false;
                                },
                                fillIn() {
                                    if ($$und(_cur_state)) {
                                        _cur_state = devicex.getCallState();
                                    }
                                    this.states = _cur_state;
                                    debugInfo('已存储通话状态数据');
                                    debugInfo('当前共计数据: ' + this.states.length + '组');
                                    return _cur_state;
                                },
                                reap() {
                                    debugInfo('通话状态数据可信');
                                    debugInfo('将当前数据应用于配置文件');
                                    debugInfo('数据值: ' + _cur_state);
                                    $$sto.af.remove(this._key);
                                    // write into storage and $$cfg
                                    return _self.cur_state = _cur_state;
                                },
                            };

                            return _sto.filled_up ? _sto.reap() : _sto.fillIn();
                        },
                        switching: 'phone_call_state_monitor_switch',
                        trigger() {
                            return devicex.getCallState() !== this._getStoState();
                        },
                        onRelease() {
                            debugInfo('前置"支付宝"应用');
                            app.launchPackage($$app.alipay_pkg);
                        },
                    },
                    screen: {
                        trigger() {
                            return $$flag.dev_unlocked
                                && !$$flag.glob_e_scr_paused
                                && !devicex.isScreenOn();
                        },
                        onTrigger() {
                            if ($$flag.glob_e_scr_privilege) {
                                messageAction('允许脚本提前退出', 3, 1, 0, -1);
                                messageAction('标识激活且屏幕关闭', 3, 0, 1, 1);
                                exit();
                            }
                        },
                        onRelease() {
                            $$flag.glob_e_trig_counter++;
                            devicex.isLocked() && devicex.unlock();
                            $$flag.glob_e_trig_counter--;
                        },
                    },
                    alarm: {
                        _thrd: 10e3,
                        _inner_pkg: /alipay|autojs/i,
                        _outer_pkg: /clock|alarm/i,
                        _isInnerPkg() {
                            $$a11y.service.refreshServiceInfo();
                            return this._inner_pkg.test(currentPackage());
                        },
                        _isOuterPkg() {
                            $$a11y.service.refreshServiceInfo();
                            return this._outer_pkg.test(currentPackage());
                        },
                        _saveInnerPkg() {
                            this._inner_pkg = currentPackage();
                        },
                        _saveInnerPkgIFN() {
                            this._isInnerPkg() || this._saveInnerPkg();
                        },
                        _waitForOuterPkg(tt) {
                            return waitForAction$(this._isOuterPkg.bind(this), tt, 320);
                        },
                        _waitForInnerPkg(tt) {
                            return waitForAction$(this._isInnerPkg.bind(this), tt, 320);
                        },
                        _msgAboutToTrigger() {
                            if (files.exists('./modules/mod-alarm-countdown.js')) {
                                return require('./modules/mod-alarm-countdown').show({
                                    is_async: true, title: '闹钟即将触发',
                                });
                            }
                            let _delay = 2;
                            setTimeout(() => {
                                let _t = Math.ceil(devicex.getNextAlarmClockTriggerGap() / 1e3);
                                $$toast('闹钟即将在 ' + (_t - _delay) + ' 秒内触发', 'L', 'F');
                            }, _delay * 1e3);
                        },
                        _msgTriggered() {
                            $$toast('支付宝界面前置时\n脚本将自动继续', 'L', 'F');
                        },
                        trigger() {
                            return devicex.isNextAlarmClockTriggered(this._thrd);
                        },
                        onTrigger() {
                            this._saveInnerPkgIFN();
                            this._msgAboutToTrigger();
                            if (!this._waitForOuterPkg(this._thrd + 20e3)) {
                                messageAction('等待闹钟应用前置超时', 8, 4, 0, 2);
                            }
                            this._msgTriggered();
                            if (!this._waitForInnerPkg(this._limit)) {
                                messageAction('等待闹钟闹钟事件解除超时', 8, 4, 0, 2);
                            }
                        },
                        onRelease() {
                            $$toast('闹钟事件已解除', 'S', 'F');
                        },
                    },
                },
                globEvt() {
                    $$flag.glob_e_trig_counter = 0;
                    let _preset_opt = this._glob_e_preset_options;

                    new Monitor('通话状态', '2 hr', _preset_opt.phone).start();
                    new Monitor('屏幕关闭', '2 min', _preset_opt.screen).start();
                    new Monitor('闹钟间隔', '4 min', _preset_opt.alarm).start();

                    return this;

                    // constructor(s) //

                    /**
                     * @typedef {Object} GlobEventMonitorOptions
                     * @property {boolean|string} [switching] - monitor may be disabled by $$cfg
                     * @property {function():boolean} trigger
                     * @property {function} [onTrigger]
                     * @property {function} onRelease
                     */
                    /**
                     * @param {string} [desc] - will show in console as the monitor name
                     * @param {string|number} [limit=Infinity]
                     * @param {GlobEventMonitorOptions} options
                     * @constructor
                     */
                    function Monitor(desc, limit, options) {
                        let _limit = _handleLimitParam(limit);
                        Object.assign(options, {_limit: _limit});

                        let _desc = desc.surround('"');
                        let _sw = _handleSwitch(options.switching);

                        /** @returns {boolean} */
                        this.valid = function () {
                            let _e_name = _desc + '事件监测';
                            debugInfo(_sw ? _e_name + '已开启' : _e_name + '未开启');
                            return _sw;
                        };
                        /** @returns {com.stardust.autojs.core.looper.TimerThread} */
                        this.monitor = function () {
                            let _o = {
                                _onTriggerMsg() {
                                    timeRecorder('glob_e' + _desc);

                                    let _ms = ['触发' + _desc + '事件', _getCtdMsg()];

                                    showSplitLine$('', 'dash');
                                    _ms.forEach(s => messageAction(s, 1));
                                    showSplitLine$('', 'dash');

                                    $$toast(_ms.join('\n'), 'L', 'F');

                                    // tool function(s) //

                                    function _getCtdMsg() {
                                        // to keep _limit unchanged
                                        let _lmt = _limit;
                                        let _pref = '等待事件解除';
                                        let _tpl = (unit) => {
                                            let _suffix = +_lmt.toFixed(2) + unit;
                                            return _pref + ' (最多' + _suffix + ')';
                                        };
                                        if (!isFinite(_lmt)) {
                                            return _pref;
                                        }
                                        if (_lmt < 1e3) {
                                            return _tpl('毫秒');
                                        }
                                        if ((_lmt /= 1e3) < 60) {
                                            return _tpl('秒');
                                        }
                                        if ((_lmt /= 60) < 60) {
                                            return _tpl('分钟');
                                        }
                                        if ((_lmt /= 60) < 24) {
                                            return _tpl('小时');
                                        }
                                        return _lmt /= 24 && _tpl('天');
                                    }
                                },
                                _onReleaseMsg() {
                                    messageAction('解除' + _desc + '事件', 1, 0, 0, 'up_dash');
                                    let _et = timeRecorder('glob_e' + _desc, 'L', 'auto');
                                    messageAction('解除用时: ' + _et, 1, 0, 1, 'dash');
                                },
                                onTrigger() {
                                    $$flag.glob_e_trig_counter++;
                                    this._onTriggerMsg();
                                    $$func(options.onTrigger) && options.onTrigger();
                                },
                                keepWaiting() {
                                    while (options.trigger()) {
                                        if (timeRecorder('glob_e' + _desc, 'L') >= _limit) {
                                            messageAction('强制停止脚本', 4, 1, 0, -1);
                                            messageAction(_desc + '事件解除超时', 8, 4, 1, 1);
                                        }
                                        sleep(240);
                                    }
                                },
                                onRelease() {
                                    $$func(options.onRelease) && options.onRelease();
                                    $$flag.glob_e_trig_counter--;
                                    this._onReleaseMsg();
                                },
                            };
                            return threadsx.start(function () {
                                while (1) {
                                    if (options.trigger()) {
                                        _o.onTrigger();
                                        _o.keepWaiting();
                                        _o.onRelease();
                                    } else {
                                        sleep(200);
                                    }
                                }
                            });
                        };
                        /** @returns {boolean|com.stardust.autojs.core.looper.TimerThread} */
                        this.start = function () {
                            return this.valid() && this.monitor();
                        };

                        // tool function(s) //

                        function _handleLimitParam(lmt) {
                            if (!$$str(lmt)) {
                                lmt = +lmt;
                                if (lmt < 1e3) {
                                    lmt *= 1e3; // take as seconds
                                }
                                if (!lmt || lmt <= 0) {
                                    lmt = Infinity; // endless monitoring
                                }
                                return lmt;
                            }
                            if (lmt.match(/h((ou)?rs?)?/)) {
                                return lmt.match(/\d+/)[0] * 3.6e6;
                            }
                            if (lmt.match(/m(in(utes?))?/)) {
                                return lmt.match(/\d+/)[0] * 60e3;
                            }
                            if (lmt.match(/s(ec(conds?))?/)) {
                                return lmt.match(/\d+/)[0] * 1e3;
                            }
                            if (lmt.match(/m(illi)?s(ec(conds?))?/)) {
                                return lmt.match(/\d+/)[0] * 1;
                            }
                            return Infinity;
                        }

                        function _handleSwitch(sw) {
                            return $$bool(sw) ? sw : $$str(sw) ? $$cfg[sw] : true;
                        }
                    }
                },
                logOut() {
                    threadsx.start(function () {
                        debugInfo('已开启账户登出监测线程');

                        delete $$flag.acc_logged_out;
                        while (1) {
                            if ($$sel.getAndCache('acc_logged_out')) {
                                break;
                            }
                            if ($$acc.isInLoginPg()) {
                                break;
                            }
                            sleep(500);
                        }
                        $$flag.acc_logged_out = true;

                        messageAction('检测到账户登出状态', 1, 0, 0, -1);
                        if ($$sel.cache.load('acc_logged_out')) {
                            messageAction('账户在其他地方登录');
                        } else {
                            messageAction('需要登录账户');
                        }
                        messageAction('尝试自动登录主账户', 1, 0, 0, 1);

                        if (!$$acc.main.login({direct: true})) {
                            messageAction('脚本无法继续', 4, 0, 0, -1);
                            messageAction('无法登录主账户', 8, 4, 1, 1);
                        }
                    });

                    return this;
                },
                newestVer() {
                    appx.getProjectNewestReleaseCared({
                        min_version_name: 'v2.0.1',
                    }, (release) => {
                        if (release) {
                            $$app.newest_release = release;
                            $$app.newest_release_ver_name = release.version_name;
                        }
                    });

                    return this;
                },
            };
        }

        function standbyMonSetter() {
            return {
                mask_layer: new Monitor('遮罩层', function () {
                    let _ = maskLayerSetter();

                    while (_.trigger()) {
                        _.enforce();
                    }
                    _.dismiss();

                    // tool function(s) //

                    function maskLayerSetter() {
                        /**
                         * @type {{
                         *     trig: BaseSelectorParam|function():SelectorPickupResult,
                         *     desc: string,
                         * }[]}
                         */
                        let _samples = [{
                            trig: '关闭蒙层',
                            desc: '蒙层遮罩',
                        }, {
                            trig: ['关闭', {bi$: [0, halfW, W, H]}],
                            desc: '关闭按钮遮罩',
                        }, {
                            trig: idMatches(/.*treedialog.close/),
                            desc: '树对话框遮罩',
                        }, {
                            trig: idMatches(/.*J_strollGuide/),
                            desc: '逛一逛向导遮罩', // new button name: "找能量"
                        }].map((o) => {
                            if (!$$func(o.trig)) {
                                let _trig = o.trig;
                                o.trig = () => $$sel.pickup(_trig);
                            }
                            return o;
                        });
                        return {
                            _cond() {
                                return _samples.some((o) => {
                                    let _w = o.trig();
                                    if (_w) {
                                        this._smp = Object.assign({widget: _w}, o);
                                        return true;
                                    }
                                });
                            },
                            trigger() {
                                delete this._smp;
                                return waitForAction(this._cond.bind(this), 8e3);
                            },
                            enforce() {
                                let _smp = this._smp;

                                debugInfo('检测到' + _smp.desc);
                                timeRecorder('_mask_layer');
                                $$flag.mask_layer_monitoring = true;

                                let _cA1 = () => {
                                    if ($$sel.pickup(_smp.widget, 'clickable')) {
                                        return clickAction(_smp.widget, 'w');
                                    }
                                };
                                let _cA2 = () => clickAction(_smp.widget, 'press', {pt$: 80});
                                let _cA = () => _cA1() || _cA2();
                                let _cB1 = () => waitForAction(() => !_smp.trig(), 1.2e3, 80);
                                let _cB2 = () => !waitForAction(_smp.trig, 320, 80);
                                let _cB = () => _cB1() && _cB2();
                                if (_cA() && _cB()) {
                                    let _et = timeRecorder('_mask_layer', 'L', 'auto');
                                    debugInfo(['关闭' + _smp.desc + '成功', '遮罩关闭用时: ' + _et]);
                                } else {
                                    debugInfo('关闭' + _smp.desc + '单次失败', 3);
                                }
                            },
                            dismiss: () => {
                                debugInfo('遮罩层监测线程结束');
                                delete $$flag.mask_layer_monitoring;
                            },
                        };
                    }
                }),
                reload_btn: new Monitor('"重新加载"按钮', function () {
                    let _sel = () => $$sel.get('reload_frst_page');
                    let _click = () => clickAction(_sel(), 'w');

                    while (1) {
                        sleep(3e3);
                        _click() && sleep(5e3);
                    }
                }),
                af_home_in_page: new Monitor('森林主页页面', function () {
                    while (1) {
                        sleep(360);
                        $$flag.af_home_in_page = $$app.page.af.isInPage();
                    }
                }),
                rl_in_page: new Monitor('排行榜页面', function () {
                    while (1) {
                        $$sel.cache.refresh('rl_title'); // including `save()
                        $$flag.rl_in_page = $$sel.cache.load('rl_title', 'bounds');
                        sleep(120);
                    }
                }),
                rl_bottom: new Monitor('排行榜底部', function () {
                    let _list_w = null, _rl_end_w = null;

                    while (!$$flag.rl_bottom_rch) {
                        $$impeded('排行榜底部监测线程');
                        try {
                            if ($$app.page.rl.isInPage() && _locate()) {
                                $$link(_text).$(_height).$(_signal);
                                break;
                            }
                        } catch (e) {
                            // eg: TypeError: Cannot call method "childCount" of null
                        }
                        sleep(480);
                    }

                    // tool function(s) //

                    function _locate() {
                        debugInfo('开始定位排行榜可滚动控件');

                        let _sel = () => _list_w = $$sel.pickup({
                            scrollable: true,
                            filter(w) {
                                let bnd = w.bounds();
                                return bnd.top < cYx(0.2) && bnd.width() > cX(0.9);
                            },
                        });

                        while (1) {
                            if (_sel()) {
                                debugInfo('已定位排行榜可滚动控件');
                                return true;
                            }
                            sleep(120);
                        }
                    }

                    function _text() {
                        _rl_end_w = null;
                        debugInfo('开始监测列表底部控件描述文本');

                        while (1) {
                            sleep(120);
                            let _child_cnt;
                            let _child_w = _list_w;
                            while ((_child_cnt = _child_w.childCount())) {
                                let _child_w_tmp = _child_w.child(_child_cnt - 1);
                                if (_child_w_tmp === null) {
                                    break;
                                }
                                _child_w = _child_w_tmp;
                                _child_w_tmp = null;
                            }
                            _rl_end_w = _child_w;
                            if ($$sel.pickup(_rl_end_w, 'txt').match(/没有更多/)) {
                                debugInfo('列表底部控件描述文本匹配');
                                break;
                            }
                            _list_w.refresh();
                        }
                    }

                    function _height() {
                        debugInfo('开始监测列表底部控件屏幕高度');

                        while (1) {
                            sleep(120);
                            if (_rl_end_w.bounds().height() >= cX(0.04)) {
                                _rl_end_w.recycle();
                                debugInfo('列表底部控件高度满足条件');
                                break;
                            }
                            _rl_end_w.refresh();
                        }
                    }

                    function _signal() {
                        debugInfo('发送排行榜停检信号');
                        $$flag.rl_bottom_rch = true;
                    }
                }),
                tree_rainbow: new Monitor('彩虹对话框', function () {
                    let _sltr = idMatches(/.*J.rainbow.close.*/);
                    while (1) {
                        let _w = _sltr.findOnce();
                        if (_w && _w.click()) {
                            debugInfo('关闭主页彩虹对话框');
                        }
                        sleep(240);
                    }
                }),
                unregistered: new Monitor('未注册检测', function () {
                    while (1) {
                        if ($$sel.pickup(/.*\u300a.*用户须知.*\u300b,*/)) {
                            messageAction('脚本无法继续', 4, 0, 0, -1);
                            messageAction('用户未注册蚂蚁森林', 8, 4, 1, 1);
                        }
                        sleep(240);
                    }
                }),
                pattern_lock: new Monitor('支付宝手势锁', function () {
                    while (1) {
                        if ($$sel.pickup(/.+\/(AlipayPattern|patternCheck)/)) {
                            messageAction('脚本无法继续', 4, 0, 0, -1);
                            messageAction('检测到支付宝手势锁', 8, 4, 1, 1);
                        }
                        sleep(240);
                    }
                }),
                launch_confirm: new Monitor('允许打开', function (tt) {
                    let _tt = tt === undefined ? 4.2e3 : tt || Infinity;
                    let _w = null;
                    if (waitForAction(() => _w = $$sel.pickup('打开'), _tt, 300)) {
                        clickAction(_w, 'w');
                    }
                }),
                collect_confirm: new Monitor('立即收取', function () {
                    while (1) {
                        let _w = $$sel.pickup('立即收取');
                        _w && clickAction(_w, 'w');
                        sleep(300);
                    }
                }),
                permission_allow: new Monitor('允许权限', function (tt) {
                    // occasionally, especially when Alipay was storage-cleaned or reinstalled
                    // a permission dialog (like location permission request)
                    // will stop current script from carrying out

                    let _tt = tt === undefined ? 2.4e3 : tt || Infinity;
                    let _w = null;
                    let _sel_btn_cfm = () => _w = $$sel.pickup(idMatches(/.*btn_confirm/));
                    let _sel_allow = () => _w = $$sel.pickup(/[Aa][Ll]{2}[Oo][Ww]|允许/);
                    let _sel = () => _sel_btn_cfm() || _sel_allow();
                    if (waitForAction(_sel, _tt, 300)) {
                        clickAction(_w, 'w');
                    }
                }),
                expand_feed: new Monitor('展开动态列表', function (tt) {
                    let _tt = tt === undefined ? 9e3 : tt || Infinity;
                    let _w = null;
                    let _sel = () => _w = $$sel.pickup(/.*点击.*展开.*(动态|列表)/);
                    if (waitForAction(_sel, _tt, 240)) {
                        do clickAction(_w, 'w');
                        while (!waitForAction(() => !_sel(), 1e3, 200));
                    }
                }),
            };

            // constructor(s) //

            function Monitor(name, thr_f) {
                /** @type {com.stardust.autojs.core.looper.TimerThread} */
                let _thd = $$app['_threads_' + name];
                this.start = function () {
                    if (this.disabled) {
                        return;
                    }
                    if (_thd && _thd.isAlive()) {
                        return _thd;
                    }
                    debugInfo('开启' + name + '监测线程');
                    let _args = [].slice.call(arguments);
                    return _thd = threadsx.start(() => thr_f.apply(global, _args));
                };
                this.interrupt = function () {
                    if (_thd && !this.disabled) {
                        debugInfo('结束' + name + '监测线程');
                        return _thd.interrupt();
                    }
                };
                this.restart = function () {
                    this.interrupt();
                    this.start();
                };
                this.isAlive = () => _thd && _thd.isAlive();
                this.join = t => _thd && _thd.join(t);
                this.disable = function () {
                    this.interrupt();
                    this.disabled = true;
                };
            }
        }
    },
    unlock() {
        let _is_scr_on = devicex.is_init_screen_on;
        let _is_unlked = devicex.isUnlocked();
        let _err = (m) => {
            messageAction('脚本无法继续', 4, 0, 0, -1);
            messageAction(m, 8, 4, 1, 1);
        };

        if (!$$cfg.auto_unlock_switch) {
            _is_scr_on || _err('屏幕关闭且自动解锁功能未开启');
            _is_unlked || _err('设备上锁且自动解锁功能未开启');
        }

        _is_unlked && _is_scr_on ? debugInfo('无需解锁') : devicex.unlock();
        $$flag.dev_unlocked = true;

        return $$init;
    },
    prompt() {
        let _pre_run = preRunSetter();
        _pre_run.trigger() && _pre_run.prompt();

        return $$init;

        // tool function(s) //

        function preRunSetter() {
            return {
                trigger() {
                    if (!$$cfg.prompt_before_running_switch) {
                        return debugInfo('"运行前提示"未开启');
                    }
                    if (!$$cfg.message_showing_switch) {
                        return debugInfo('"消息提示"未开启');
                    }
                    if ($$app.engines_exec_argv.instant_run_flag) {
                        return debugInfo(['跳过"运行前提示"', '>检测到"立即运行"引擎参数']);
                    }
                    if ($$cfg.prompt_before_running_auto_skip) {
                        if (!devicex.is_init_screen_on) {
                            return debugInfo(['跳过"运行前提示"', '>屏幕未亮起']);
                        }
                        if (!devicex.is_init_unlocked) {
                            return debugInfo(['跳过"运行前提示"', '>设备未锁定']);
                        }
                    }
                    return true;
                },
                prompt() {
                    dialogsx.buildCountdown(['运行提示',
                        '\n即将在 %timeout% 秒内运行' + $$app.task_name + '任务\n',
                        ['推迟运行', 'warn'], ['放弃任务', 'caution'],
                        ['立即开始', 'attraction'], 1,
                    ], {
                        timeout: $$cfg.prompt_before_running_countdown_seconds,
                        timeout_button: 'positive',
                        onNeutral(d) {
                            let _cfg = {
                                _key: 'prompt_before_running_postponed_minutes',
                                /** @returns {number[]} */
                                get sto_min_map() {
                                    return $$cfg[this._key + '_choices'];
                                },
                                /** @returns {number} */
                                get sto_min() {
                                    return $$cfg[this._key];
                                },
                                /** @param {number} v */
                                set sto_min(v) {
                                    let _new = {};
                                    _new[this._key] = v;
                                    $$sto.af_cfg.put('config', _new);
                                    Object.assign($$cfg, _new);
                                },
                                /** @returns {number} */
                                get user_min() {
                                    return $$cfg[this._key + '_user'];
                                },
                                /** @param {number} v */
                                set user_min(v) {
                                    let _new = {};
                                    _new[this._key + '_user'] = v;
                                    $$sto.af_cfg.put('config', _new);
                                    Object.assign($$cfg, _new);
                                },
                            };
                            if (_cfg.sto_min > 0) {
                                d.dismiss();
                                return $$app.monitor.insurance.interrupt().clean({
                                    is_async: true,
                                    callback: () => $$app.setPostponedTask(_cfg.sto_min),
                                });
                            }
                            let _minutes = _cfg.sto_min_map; // [1, 2, 5, 10, ...]
                            let _suffix = ' min';
                            dialogsx
                                .builds(['设置任务推迟时间', '',
                                    0, 'B', ['K', 'warn'],
                                    1, '记住设置且不再提示'], {
                                    items: _minutes.map(x => x + _suffix),
                                    itemsSelectMode: 'single',
                                    itemsSelectedIndex: _minutes.indexOf(_cfg.user_min),
                                })
                                .on('negative', (ds) => {
                                    ds.dismiss();
                                })
                                .on('positive', (ds) => {
                                    dialogsx.dismiss(ds, d);
                                    _cfg.user_min = _minutes[ds.getSelectedIndex()];
                                    if (ds.isPromptCheckBoxChecked()) {
                                        _cfg.sto_min = _cfg.user_min;
                                    }
                                    $$app.monitor.insurance.interrupt().clean({
                                        is_async: true,
                                        callback: () => $$app.setPostponedTask(_cfg.user_min),
                                    });
                                })
                                .show();
                        },
                        onNegative(d) {
                            let _quitNow = () => {
                                d.dismiss();
                                $$app.monitor.insurance.interrupt().remove();
                                // language=JS
                                messageAction('`放弃${$$app.task_name}任务`'.ts, 1, 1, 0, 2);
                                exit();
                            };

                            if (!$$cfg.prompt_before_running_quit_confirm) {
                                return _quitNow();
                            }
                            dialogsx.builds((function $iiFe() {
                                // language=JS
                                let _z = '`当前未设置任何${$$app.task_name}定时任务\n\n`'.ts;
                                let _q = '确认要放弃本次任务吗';
                                let [_title, _cnt] = timersx.queryTimedTasks({path: $$app.cwp})
                                    .filter(task => task.id !== $$app.monitor.insurance.id).length
                                    ? [['提示', 'default'], [_q, 'default']]
                                    : [['注意', 'caution'], [_z + _q, 'warn']];
                                return [_title, _cnt, 0, 'B', ['确认放弃任务', 'caution'], 1, 1];
                            })()).on('negative', (ds) => {
                                dialogsx.dismiss(ds);
                            }).on('positive', (ds) => {
                                dialogsx.dismiss(ds);
                                $$sto.af_cfg.put('config', {
                                    prompt_before_running_quit_confirm: !ds.isPromptCheckBoxChecked(),
                                });
                                _quitNow();
                            }).show();
                        },
                        onPositive(d) {
                            d.dismiss();
                            $$app.monitor.insurance.increase();
                        },
                        onPause: {
                            content: [/.*(".+".*任务).*/, '请选择$1运行选项'],
                        },
                        onTimeout() {
                            debugInfo(['运行提示计时器超时', '任务自动继续']);
                            return 'positive';
                        },
                    }).act().block({
                        timeout: 2, // minutes
                        onTimeout(d) {
                            d.dismiss();
                            messageAction('强制结束脚本', 4, 0, 0, -1);
                            messageAction('等待运行提示对话框操作超时', 8, 4, 0, 1);
                        },
                    });
                },
            };
        }
    },
    command() {
        let _ = cmdSetter();
        _.trigger() && _.exec();

        return $$init;

        // tool function(s) //

        function cmdSetter() {
            let _cmd = $$app.engines_exec_argv.cmd;
            /**
             * @typedef {
             *     'launch_rank_list'|'get_rank_list_names'|'get_current_acc_name'
             * } AntForestLauncherCommand
             */
            let _commands = {
                launch_rank_list() {
                    $$app.page.rl.launch({is_show_greeting: false});
                    _quit('app');
                },
                get_rank_list_names() {
                    _launch() && _collect();
                    _quit();

                    // tool function(s) //

                    function _launch() {
                        timeRecorder('get_rl_data');
                        return $$app.page.rl.launch({is_show_greeting: false});
                    }

                    function _collect() {
                        $$app.task_name = '好友列表数据采集'.surround('"');
                        messageAction('正在采集好友列表数据', 1, 1, 0, 2);

                        $$af.rl.scroll.toBottom({itv: 0});

                        let _ls_data = _getListData();
                        $$sto.af.remove('friends_list_data'); // discarded data
                        $$sto.af_flist.put('friends_list_data', _ls_data);

                        let _et = timeRecorder('get_rl_data', 'L', 'auto');
                        let _sum = _ls_data.list_length + ' 项';
                        messageAction('采集完毕', 1, 1, 0, -1);
                        messageAction('用时 ' + _et, 1, 0, 1);
                        messageAction('总计 ' + _sum, 1, 0, 1, 1);

                        // tool function(s) //

                        function _getListData() {
                            let _fri = $$af._collector.fri;
                            let _data = [];
                            $$sel.get('energy_amt', 'wc').slice(1).forEach((w, i) => {
                                let _nick = $$sel.pickup([w, _fri.getRlNickCompass(w)], 'txt');
                                let _rank = i < 3 ? i + 1 : $$sel.pickup([w, _fri.getRlRankNum(w)], 'txt');
                                _data.push({rank_num: _rank.toString(), nickname: _nick});
                            });

                            let _max_len = _data[_data.length - 1].rank_num.length;
                            let _pad = new Array(_max_len).join('0');
                            _data.map(o => o.rank_num = (_pad + o.rank_num).slice(-_max_len));

                            return {
                                timestamp: $$app.ts,
                                list_data: _data,
                                list_length: _data.length,
                            };
                        }
                    }
                },
                get_current_acc_name() {
                    timeRecorder('cur_acc_nm');

                    let _name = _byPipeline() || '';
                    messageAction('采集完毕');

                    let _sto_key = 'collected_current_account_name';
                    $$sto.af.remove(_sto_key);
                    $$sto.af.put(_sto_key, _name);

                    let _et = timeRecorder('cur_acc_nm', 'L', 'auto');
                    messageAction('用时 ' + _et, 1, 0, 1);

                    _quit();

                    // tool function(s) //

                    function _byPipeline() {
                        let _name = '';
                        let _thd_get_name = threadsx.start(_thdGetName);
                        let _thd_mon_logout = threadsx.start(_thdMonLogout);

                        waitForAction(() => _name || $$flag.acc_logged_out, 12e3);

                        _thd_get_name.interrupt();
                        _thd_mon_logout.interrupt();

                        if (_name) {
                            return _name;
                        }

                        if ($$flag.acc_logged_out) {
                            messageAction('账户已登出', 3, 1, 0, '2_dash');
                            delete $$flag.acc_logged_out;
                        }

                        // thread function(s) //

                        function _thdGetName() {
                            $$app.task_name = '采集当前账户名'.surround('"');
                            $$app.page.alipay.home();

                            messageAction('正在采集当前账户名', 1, 0, 0, -1);

                            clickActionsPipeline([
                                [['我的', 'p1']],
                                [idMatches(/.*userinfo_view/)],
                                [['个人主页', 'p4']],
                                ['支付宝账户', null]], {
                                name: '支付宝个人主页',
                                default_strategy: 'widget',
                            });

                            let _txt = '';
                            let _sel = () => $$sel.pickup(['支付宝账户', 's>1'], 'txt');
                            waitForAction(() => _txt = _sel(), 2e3);

                            return _name = _txt ? $$acc.encode(_txt) : '';
                        }

                        function _thdMonLogout() {
                            delete $$flag.acc_logged_out;
                            while (!$$acc.isInLoginPg() && !$$sel.get('acc_logged_out')) {
                                sleep(500);
                            }
                            $$flag.acc_logged_out = true;
                        }
                    }
                },
            };

            return {
                trigger() {
                    if (_cmd) {
                        if (_cmd in _commands) {
                            return true;
                        }
                        messageAction('脚本无法继续', 4, 0, 0, -1);
                        messageAction('未知的传递指令参数:', 4, 1, 1);
                        messageAction(_cmd, 8, 0, 1, 1);
                    }
                },
                exec() {
                    debugInfo(['执行传递指令:', _cmd]);
                    _commands[_cmd]();
                    sleep(4e3);
                },
            };

            // tool function(s) //

            /** @param {...('alipay'|'app')} [aim] */
            function _quit(aim) {
                let _aim = Array.from(arguments, s => s.toLowerCase());
                _aim = _aim.length ? _aim : ['alipay', 'app'];
                _aim.includes('alipay') && $$app.page.alipay.close();
                _aim.includes('app') && ui.post(exit);
            }
        }
    },
};

let $$af = {
    _launcher: {
        greet() {
            // language=JS
            messageAction('`开始${$$app.task_name}任务`'.ts, 1, 1, 0, 2);

            return this;
        },
        assign() {
            Object.assign($$af, {
                emount_t_own: 0, // t: total
                emount_c_own: 0, // c: collected
                emount_c_fri: 0,
                cleaner: {
                    imgWrapper() {
                        imagesx.recycleGlobal();
                    },
                    eballs() {
                        $$af.home_balls_info = {};
                    },
                },
                stroll: {
                    max_cnt_cycle: $$cfg.max_continuous_not_targeted_stroll_cycle,
                    ignored: {
                        samples: {},
                        add(sample) {
                            return sample in this.samples ?
                                (this.samples[sample] += 1) :
                                (this.samples[sample] = 1);
                        },
                        reset() {
                            this.samples = {};
                        },
                        getMaxCount() {
                            return Math.maxi(Object.values(this.samples));
                        },
                    },
                    locate(cache_fg) {
                        if (this.pt && cache_fg) {
                            return this.pt;
                        }
                        return this.pt = _byColorMatch() || _byRelativeWidget();

                        // tool function(s) //

                        function _byColorMatch() {
                            //        xA  x0   x1   x2
                            //        --  --   --   --
                            // yA:        O1   O2   O3
                            // y0:    O4  XX        O5
                            // y1:        O6   O7   O8
                            // y2:        W1   W2   W3

                            let _xA = cX(-26), _x0 = 0, _x1 = cX(29), _x2 = cX(58);
                            let _yA = cYx(-24), _y0 = 0, _y1 = cYx(24), _y2 = cYx(34);
                            let _main = colorsx.toInt($$cfg.stroll_btn_locate_main_color);

                            return images.findMultiColors(imagesx.capt(), _main, [
                                [_x0, _yA, _main], // O1
                                [_x1, _yA, _main], // O2
                                [_x2, _yA, _main], // O3
                                [_xA, _y0, _main], // O4
                                [_x2, _y0, _main], // O5
                                [_x0, _y1, _main], // O6
                                [_x1, _y1, _main], // O7
                                [_x2, _y1, _main], // O8
                                [_x0, _y2, -1], // W1
                                [_x1, _y2, -1], // W2
                                [_x2, _y2, -1], // W3
                            ], {threshold: $$cfg.stroll_btn_match_threshold});
                        }

                        function _byRelativeWidget() {
                            let _b_ctr = {}; // bottom counter
                            $$sel.filter(function (w) {
                                let _bnd = w.bounds();
                                return _bnd.bottom < uH
                                    && _bnd.width() > cX(0.98)
                                    && _bnd.height() > cYx(0.12);
                            }).find().forEach(function (w) {
                                let _bnd = w.bounds();
                                let _b = _bnd.bottom;
                                _b in _b_ctr ? ++_b_ctr[_b] : (_b_ctr[_b] = 1);
                            });

                            let _bottoms = Object.keys(_b_ctr)
                                .map(b => [b, _b_ctr[b]])
                                .sort((a, b) => a[1] === b[1] ? 0 : a[1] < b[1] ? 1 : -1)[0];

                            if (_bottoms && _bottoms.length) {
                                return [W - cX(50), _bottoms[0] - cYx(50)];
                            }
                        }
                    },
                    click() {
                        if (this.pt || this.locate()) {
                            return clickAction(this.pt, 'p', {pt$: 64, bt$: 500});
                        }
                    },
                    isSlake() {
                        return this.isInSlakePage() || this.isMaxCntCycleReached();
                    },
                    isInSlakePage() {
                        let _sltr = [/.*返回.*森林.*/, {clickable: true}];
                        return $$sel.pickup(_sltr, 'exists', {refresh: true});
                    },
                    isMaxCntCycleReached() {
                        return this.ignored.getMaxCount() > this.max_cnt_cycle;
                    },
                    isDisabled() {
                        return this._is_disabled === true;
                    },
                    disable() {
                        this._is_disabled = true;
                    },
                    trigger() {
                        return $$cfg.get_targets_by_stroll_btn && !this.isDisabled();
                    },
                    reset() {
                        this.ignored.reset();
                    },
                },
                /** @type {AfHoughBallsResult|Object} */
                home_balls_info: {},
                /**
                 * @typedef {{
                 *     is_cache?: boolean,
                 *     is_fixed?: boolean,
                 *     is_debug_info?: boolean,
                 * }} EnergyBallsInfoOptions
                 */
                /**
                 * @param {EnergyBallsType|'all'} [type]
                 * @param {EnergyBallsInfoOptions} [options]
                 * @returns {EnergyBallsInfo[]}
                 */
                eballs(type, options) {
                    let _opt = options || {};
                    if (!(_opt.is_cache && Object.size(this.home_balls_info) > 0)) {
                        this.home_balls_info = imagesx.findAFBallsByHough({
                            is_debug_info: _opt.is_debug_info,
                        });
                    }
                    return !type || type === 'all'
                        ? this.home_balls_info.expand()
                        : this.home_balls_info[type] || [];
                },
            });

            return this;
        },
        home() {
            $$app.monitor.unregistered.start();
            $$app.monitor.pattern_lock.start();

            $$app.page.af.launch();

            $$app.monitor.unregistered.disable();
            $$app.monitor.pattern_lock.disable();

            return this;
        },
        ready() {
            $$link(_capt).$(_language).$(_mainAcc);

            return this;

            // tool function(s) //

            function _capt() {
                // CAUTION:
                // imagesx.capt() contains imagesx.permit()
                // however, which is not recommended to be used
                // within Java Thread at the first time,
                // as capture permission will be forcibly interrupted
                // with this thread killed in a short time (about 300ms)
                imagesx.permit();
            }

            function _language() {
                let _tt = '';
                let _sel = () => _tt = $$sel.get('af_title', 'txt');

                const _chs = '简体中文';

                if (waitForAction(_sel, 10e3, 100)) {
                    if (_tt.match(/蚂蚁森林/)) {
                        debugInfo('当前支付宝语言: ' + _chs);
                    } else {
                        debugInfo('当前支付宝语言: 英语');
                        _changeLangToChs();
                        if ($$app.page.af.launch()) {
                            messageAction('切换支付宝语言: ' + _chs, 1, 0, 0, 1);
                        } else {
                            messageAction('语言切换失败', 8, 4, 0, 1);
                        }
                    }
                    debugInfo('语言检查完毕');
                } else {
                    messageAction('语言检测已跳过', 3);
                    messageAction('语言检测超时', 3, 0, 1, 1);
                }

                // tool function(s) //

                function _changeLangToChs() {
                    if (_getReady()) {
                        toast('切换支付宝语言: ' + _chs);

                        $$app.monitor.permission_allow.start();

                        return clickActionsPipeline([
                            [['Me', 'p1']],
                            [['Settings', {boundsInside: [cX(0.8), 0, W, cYx(0.2)]}]],
                            [['General', 'p4']],
                            [['Language', 'p4']],
                            [[_chs, 'p4'], () => (
                                $$sel.pickup([_chs, 'p3'], 'children').length > 1
                            )],
                            ['Save'],
                        ], {name: _chs + '语言切换', default_strategy: 'widget'});
                    }

                    // tool function(s) //

                    function _getReady() {
                        let _max_close = 12;
                        while (!$$app.page.close() && _max_close--) {
                            sleep(500);
                        }

                        let _sltr = className('TextView').idContains('tab_description');
                        if (!waitForAction(_sltr, 3e3)) {
                            let _max = 5;

                            do appx.restart($$app.alipay_pkg);
                            while (_max-- || !waitForAction(_sltr, 15e3));

                            if (_max < 0) {
                                messageAction('Language switched failed', 4, 1);
                                messageAction('Homepage failed to get ready', 4, 0, 1);
                                return false;
                            }
                        }
                        return true;
                    }
                }
            }

            function _mainAcc() {
                $$acc.main.login();
            }
        },
    },
    _collector: {
        own: {
            _getEmount(buf) {
                let _amt;
                let _max = buf ? 10 : 1;
                let _body = [/\d+g/, {bi$: [cX(0.6), 0, W, cYx(0.24)]}];
                while (1) {
                    _amt = $$sel.pickup(_body, 'txt').match(/\d+/);
                    _amt = $$arr(_amt) ? Number(_amt[0]) : _amt;
                    if ($$num(_amt) || !--_max) {
                        break;
                    }
                    sleep(200);
                }
                return _max < 0 ? -1 : _amt;
            },
            trigger() {
                if ($$cfg.self_collect_switch) {
                    $$af.own = this;
                    return true;
                }
                debugInfo(['跳过自己能量检查', '>自收功能未开启']);
            },
            init() {
                debugInfo('开始检查自己能量');

                $$af.emount_t_own = this._getEmount('buf');
                debugInfo('初始能量: ' + $$af.emount_t_own + 'g');

                if ($$app.avatar_checked_time) {
                    debugInfo('主账户检测耗时: ' + $$app.avatar_checked_time);
                    delete $$app.avatar_checked_time;
                }

                $$af.min_ctd.own.reset();
                $$af.thrd_mon_own = $$cfg.homepage_monitor_threshold;
                $$af.thrd_bg_mon_own = $$cfg.homepage_bg_monitor_threshold;

                return this;
            },
            collect() {
                let _own = this;

                _detect() && _check();
                _result();

                return this;

                // tool function(s) //

                function _detect() {
                    let _eballs = $$af.eballs();
                    let _len = _eballs.length;
                    if (_len) {
                        let _comp = _eballs.filter(o => o.computed).length;
                        let _suff = _comp ? ' (含' + _comp + '个计算球)' : '';
                        debugInfo('找到主页能量球: ' + _len + '个' + _suff);
                        return true;
                    }
                    debugInfo('未发现主页能量球');
                }

                function _check() {
                    $$link(_init).$(_ripeBalls).$(_countdown).$(_waterBalls).$(_coda);

                    // tool function(s) //

                    function _init() {
                        $$app.monitor.tree_rainbow.start();
                    }

                    function _ripeBalls() {
                        _collectRipeBalls({is_cache: true});
                    }

                    function _countdown() {
                        if (_isSwitchOn()) {
                            while (_ctdTrigger()) {
                                _nonStopCheck();
                            }
                        }

                        // tool function(s) //

                        function _isSwitchOn() {
                            let _cA = $$cfg.homepage_background_monitor_switch;
                            let _cB1 = $$cfg.timers_switch;
                            let _cB2a = $$cfg.homepage_monitor_switch;
                            let _cB2b1 = $$cfg.timers_self_manage_switch;
                            let _cB2b2 = $$cfg.timers_countdown_check_own_switch;
                            let _cB2b = _cB2b1 && _cB2b2;
                            let _cB2 = _cB2a || _cB2b;
                            let _cB = _cB1 && _cB2;

                            return _cA || _cB;
                        }

                        function _ctdTrigger() {
                            debugInfo('开始检测自己能量球最小倒计时');

                            $$af.min_ctd.own.reset();
                            let _nor_balls = $$af.eballs('naught', {is_cache: true});
                            let _len = _nor_balls.length;
                            if (!_len) {
                                return debugInfo('未发现未成熟的能量球');
                            }
                            debugInfo('找到自己未成熟能量球: ' + _len + '个');

                            let _t_spot = timeRecorder('ctd_own');
                            // timestamp until next ripe
                            let _min_own = Math.mini(_getOwnRipeTs());

                            if (!$$num(_min_own) || _min_own <= 0) {
                                return debugInfo('自己能量最小倒计时数据无效', 3);
                            }
                            if (!isFinite(_min_own)) {
                                return debugInfo('自己能量倒计时数据为空');
                            }

                            $$af.min_ctd.own.value = _min_own;

                            let _t = timeRecorder('ctd_own', 'L', 60e3, [2], '', _min_own);
                            debugInfo('自己能量最小倒计时: ' + _t + '分钟');
                            debugInfo('时间: ' + $$cvt.date(_min_own));

                            let _cA = $$cfg.homepage_monitor_switch;
                            let _cB = _t <= $$af.thrd_mon_own;
                            if (_cA && _cB) {
                                debugInfo('触发成熟能量球监测条件');
                                return true;
                            }
                            debugInfo('自己能量球最小倒计时检测完毕');

                            // tool function(s) //

                            function _getOwnRipeTs() {
                                timeRecorder('ctd_data');

                                let _alive = thd => thd && thd.isAlive();
                                let _kill = thd => thd && thd.interrupt();

                                let _ctd_data = [];
                                let _thd_ocr = threadsx.start(_thdOcr);
                                let _thd_toast = threadsx.start(_thdToast);

                                _thd_toast.join(1.5e3);

                                if (_alive(_thd_toast)) {
                                    _kill(_thd_toast);
                                    debugInfo('Toast监控线程获取数据超时');
                                    debugInfo('强制停止Toast监控线程');
                                }

                                let _tt = 9e3;
                                _thd_ocr.join(Math.max(_tt - timeRecorder('ctd_data', 'L'), 0));

                                if (_alive(_thd_ocr)) {
                                    _kill(_thd_ocr);
                                    messageAction('获取自己能量倒计时超时', 3, 1);
                                    _ctd_data.length
                                        ? messageAction('最小倒计时数据可能不准确', 3, 0, 0, 1)
                                        : messageAction('最小倒计时数据获取失败', 3, 0, 0, 1);
                                }

                                return _ctd_data.map((str) => {
                                    let _mch = (str || '').toString().match(/\d+:\d+/);
                                    if (!_mch) {
                                        messageAction('无效字串:', 3);
                                        messageAction(str, 3);
                                        return Infinity;
                                    }

                                    let _t_str = _mch[0];
                                    let [_hh, _mm] = _t_str.split(':').map(x => +x);
                                    let _m = _hh * 60 + _mm;

                                    debugInfo('[ ' + _t_str + ' ] -> ' + _m + ' min');

                                    return _t_spot + _m * 60e3;
                                }).filter(isFinite);

                                // thread function(s) //

                                function _thdOcr() {
                                    debugInfo('已开启倒计时数据OCR识别线程');

                                    let _capt = imagesx.capt();

                                    let [_cl, _ct, _cr, _cb] = $$cfg.eballs_recognition_region
                                        .map((v, i) => i % 2 ? cYx(v, true) : cX(v, true));
                                    let _clip = images.clip(_capt, _cl, _ct, _cr - _cl, _cb - _ct);

                                    let _stitched = (function $iiFe() {
                                        let _getClip = (o) => images.clip(_capt,
                                            o.left, o.top, o.width(), o.height());
                                        let _img = _getClip(_nor_balls[0]);
                                        _nor_balls.slice(1).forEach((o) => {
                                            _img = imagesx.concat(_img, _getClip(o), 'BOTTOM', true);
                                        });
                                        return _img;
                                    })();

                                    let _raw_data = imagesx.baiduOcr(_stitched, {
                                        fetch_times: 3,
                                        fetch_interval: 500,
                                        no_toast_msg_flag: true,
                                        capt_img: _clip,
                                    });

                                    imagesx.reclaim(_clip, _stitched);

                                    debugInfo('OCR识别线程已获取数据');
                                    debugInfo('原始数据:');
                                    // nested data should be applied (not called)
                                    debugInfo(util.format.apply(util, _raw_data));

                                    let _rex_t = /(\d{2})\D(\d{2})/;
                                    let _proc_data = _raw_data
                                        .map((data) => {
                                            // eg: [['11:29'], ['11.25', '07|03', '3'], ['']]
                                            // --> [['11:29'], ['11.25', '07|03'], []]
                                            return data.filter(s => s.match(_rex_t));
                                        })
                                        .filter((data) => {
                                            // eg: [['11:29'], ['11.25', '07|03'], []]
                                            // --> [['11:29'], ['11.25', '07|03']]
                                            return data.length > 0;
                                        })
                                        .map((data) => {
                                            let _map = s => s.replace(_rex_t, '$1:$2');
                                            let _sort = (a, b) => a === b ? 0 : a > b ? 1 : -1;
                                            // eg: [['11:29'], ['11.25', '07|03']]
                                            // --> [['11:29'], ['11:25', '07:03']] // map
                                            // --> [['11:29'], ['07:03', '11:25']] // sort
                                            // --> ['11:29', '07:03'] // index(0)
                                            return data.map(_map).sort(_sort)[0];
                                        });

                                    debugInfo('加工数据:');
                                    // flat data should be called (not applied)
                                    debugInfo(util.format.call(util, _proc_data));

                                    if (!_proc_data.length) {
                                        return debugInfo('OCR识别线程未能获取有效数据');
                                    }
                                    debugInfo('OCR识别线程已获取有效数据');

                                    if (_ctd_data.length) {
                                        return debugInfo(['数据未被采纳', '>倒计时数据非空']);
                                    }
                                    debugInfo('OCR识别线程数据已采纳');

                                    return _ctd_data = _proc_data;
                                }

                                function _thdToast() {
                                    debugInfo('已开启倒计时数据Toast监控线程');

                                    let _ctd = _nor_balls.map((o) => {
                                        clickAction(o, 'p', {pt$: $$cfg.forest_balls_click_duration});
                                        return observeToastMessage($$app.alipay_pkg, /才能收取/, 240);
                                    }).flat(Infinity);

                                    if (_ctd.length) {
                                        debugInfo('Toast监控线程已获取有效数据');
                                        if (_alive(_thd_ocr)) {
                                            _kill(_thd_ocr);
                                            debugInfo('强制停止OCR识别线程');
                                        }
                                        return _ctd_data = _ctd;
                                    }
                                    debugInfo('Toast监控线程未能获取有效数据');
                                }
                            }
                        }

                        function _nonStopCheck() {
                            let _debug_page_state_flip = 1;
                            let _thrd = $$af.thrd_mon_own;
                            let _tt = _thrd * 60e3 + 3e3;
                            let _old_em = $$af.emount_c_own;

                            let _msg_start = '开始监测自己能量';
                            $$toast(_msg_start, 'Long');
                            debugInfo(_msg_start);
                            timeRecorder('monitor_own');

                            $$app.monitor.af_home_in_page.start();
                            devicex.keepOn(_tt);
                            while (timeRecorder('monitor_own', 'L') < _tt) {
                                _debugPageState();
                                if ($$flag.af_home_in_page) {
                                    // ripe balls recognition will be performed
                                    // in some fixed area(s) without new captures
                                    let _options = {
                                        is_fixed: true, is_debug_info: false,
                                    };
                                    if (_getAndCollectRipeBalls(_options)) {
                                        $$flag.monitor_home_ripe_captured = true;
                                        break;
                                    }
                                }
                                sleep(180);
                            }
                            if (!$$flag.monitor_home_ripe_captured) {
                                if (!$$flag.af_home_in_page) {
                                    messageAction$('主页能量球未点击且页面不满足', 3, 3, 0, '2_dash');
                                } else {
                                    messageAction$('等待主页能量球成熟超时', 3, 0, 0, 'up_dash');
                                    messageAction$('尝试点击全部主页能量球', 3, 3, 0, 'dash');
                                    let _nor_balls = $$af.eballs('naught', {is_cache: true});
                                    _collectRipeBalls(_nor_balls, {is_debug_info: false});
                                }
                            }

                            devicex.cancelOn();
                            $$app.monitor.af_home_in_page.interrupt();

                            delete $$flag.af_home_in_page;
                            delete $$flag.monitor_home_ripe_captured;
                            $$af.cleaner.eballs(); // clear cache

                            let _msg_fin = '自己能量监测完毕';
                            $$toast(_msg_fin, 'Long');
                            debugInfo(_msg_fin);
                            debugInfo('本次监测收取结果: ' + ($$af.emount_c_own - _old_em) + 'g');
                            debugInfo('监测用时: ' + timeRecorder('monitor_own', 'L', 'auto'));

                            // speculated helpful for _thdToast() within which
                            // toast message didn't show up after clickAction()
                            sleep(1.8e3);

                            // tool function(s) //

                            function _debugPageState() {
                                let _fg = +$$flag.af_home_in_page;
                                if (_debug_page_state_flip !== _fg) {
                                    _debug_page_state_flip = _fg;
                                    timeRecorder('monitor_own', 'L') > 1e3 && debugInfo(_fg
                                        ? ['当前页面满足森林主页条件', '继续监测自己能量']
                                        : ['当前页面不满足森林主页条件', '暂停监测自己能量']);
                                }
                            }
                        }
                    }

                    function _waterBalls() {
                        if (!$$cfg.homepage_wball_switch) {
                            return debugInfo('浇水回赠球检测未开启');
                        }
                        debugInfo('开始检测浇水回赠能量球');
                        let _wb_cache = $$af.eballs('water', {is_cache: true});
                        let _ctr = 0;
                        let _lmt = {
                            trigger() {
                                $$und(this.counter) && this.reset();
                                return --this.counter < 0;
                            },
                            reset() {
                                this.counter = $$cfg.homepage_wball_check_limit;
                            },
                            shrink() {
                                this.counter = 1;
                            },
                        };
                        if (_wb_cache.length) {
                            debugInfo('发现浇水回赠能量球');
                            $$app.monitor.collect_confirm.start();
                            _wb_cache.forEach(_fetch);
                            _sustain();
                            $$app.monitor.collect_confirm.interrupt();
                        }
                        if (_ctr > 0) {
                            debugInfo('收取浇水回赠能量球: ' + _ctr + '个');
                        } else {
                            debugInfo('未发现浇水回赠能量球');
                        }
                        debugInfo('浇水回赠能量球检测完毕');

                        // tool function(s) //

                        function _sustain() {
                            let _is_continue = false;
                            let _is_detected = false;
                            let _getWballsByCachedPos = () => {
                                let _capt = imagesx.capt();
                                return _wb_cache.filter(o => imagesx.isWaterBall(o, _capt));
                            };
                            let _sleep = (itv) => {
                                let _et = timeRecorder('get_and_fetch_wballs', 'L');
                                sleep(Math.max(itv - _et, 0));
                            };

                            do {
                                if (_lmt.trigger()) {
                                    messageAction('中断主页浇水回赠能量球检测', 3, 0, 0, -1);
                                    messageAction('已达最大检查次数限制', 3, 0, 1, 1);
                                    break;
                                }
                                timeRecorder('get_and_fetch_wballs');

                                let _max = 2;
                                while (_max--) {
                                    let _wballs = _getWballsByCachedPos();
                                    if (_wballs.length) {
                                        _is_continue = true;
                                        _is_detected |= true;
                                        _wballs.forEach(_fetch);
                                        _sleep(300);
                                        break;
                                    }
                                    _is_continue = false;
                                    if (!_is_detected) {
                                        break;
                                    }
                                    _max && sleep(480);
                                }
                            } while (_is_continue);
                        }

                        function _fetch(o) {
                            timeRecorder('fetch_wballs');
                            clickAction(o, 'p', {pt$: $$cfg.forest_balls_click_duration});
                            if (_stableEmount()) {
                                _ctr += 1;
                            } else {
                                _lmt.shrink();
                                debugInfo(['浇水回赠能量球点击超时', '可能是能量球误匹配']);
                            }
                            let _et = timeRecorder('fetch_wballs', 'L');
                            sleep(Math.max(300 - _et, 0));
                        }
                    }

                    function _coda() {
                        $$app.monitor.tree_rainbow.interrupt();
                    }

                    /**
                     * @param {EnergyBallsInfo[]|EnergyBallsInfoOptions} [balls]
                     * @param {EnergyBallsInfoOptions} [options]
                     */
                    function _collectRipeBalls(balls, options) {
                        if ($$obj(balls)) {
                            return _collectRipeBalls(null, balls);
                        }
                        let _balls = balls || _getRipeBallsData(options);
                        if (!_balls.length) {
                            return;
                        }
                        let _opt = options || {};
                        let _noRipeBalls = () => {
                            return !_getRipeBallsData({is_debug_info: false}).length;
                        };

                        let debugInfo$ = (m, lv) => debugInfo(m, lv, _opt.is_debug_info);

                        let _itv = $$cfg.forest_balls_click_interval;
                        let _du = $$cfg.forest_balls_click_duration;
                        let _max = 4;
                        do {
                            debugInfo$('点击自己成熟能量球: ' + _balls.length + '个');
                            _balls.forEach(o => clickAction(o, 'p', {pt$: _du, bt$: _itv}));
                            if (!_stableEmount()) {
                                debugInfo$('自己能量的增量数据无效');
                                break; // timed out or mismatched
                            }
                            if (waitForAction(_noRipeBalls, 1.2e3)) {
                                debugInfo$('未发现新的成熟能量球');
                                break; // all ripe balls picked
                            }
                            debugInfo$('发现新的成熟能量球');
                        } while (--_max);
                        _max || debugInfo('本次成熟球收取出现异常', 3);
                    }

                    /**
                     * @param {EnergyBallsInfoOptions} [options]
                     * @returns {EnergyBallsInfo[]}
                     */
                    function _getRipeBallsData(options) {
                        let _o = options || {};
                        /**
                         * @param {EnergyBallsInfoOptions} [o]
                         * @returns {EnergyBallsInfoOptions}
                         */
                        let _wrapOpt = o => Object.assign({
                            is_debug_info: _o.is_debug_info,
                        }, o);
                        let _ = {
                            cache: () => $$af.eballs('ripe', _wrapOpt({is_cache: true})),
                            refresh: () => $$af.eballs('ripe', _wrapOpt({is_cache: false})),
                            fixed() {
                                let _cache = $$af.eballs('all', _wrapOpt({is_cache: true}));
                                if (!_cache.length) {
                                    this.refresh();
                                    _cache = this.cache();
                                }
                                let _res = [];
                                if (_cache.length) {
                                    let _capt = imagesx.capt();
                                    _cache.forEach(o => imagesx.isRipeBall(o, _capt, _res));
                                }
                                return _res;
                            },
                        };
                        return _o.is_cache ? _.cache() : _o.is_fixed ? _.fixed() : _.refresh();
                    }

                    /**
                     * @param {EnergyBallsInfoOptions} [options]
                     * @returns {boolean}
                     */
                    function _getAndCollectRipeBalls(options) {
                        let _balls = _getRipeBallsData(options);
                        if (_balls.length) {
                            _collectRipeBalls(_balls, options);
                            return true;
                        }
                        return false;
                    }

                    function _stableEmount() {
                        let _t = $$af.emount_t_own;
                        let _getEm = buf => _own._getEmount(buf);
                        let _i = stabilizer(_getEm, _t) - _t;
                        if (_i <= 0 || isNaN(_i)) {
                            $$af.emount_t_own = _getEm('buffer');
                            $$af.emount_c_own += $$af.emount_t_own - _t;
                        } else {
                            $$af.emount_t_own += _i;
                            $$af.emount_c_own += _i;
                        }
                        return !isNaN(_i) && _i > 0;
                    }
                }

                function _result() {
                    let _em = $$af.emount_c_own;
                    if (_em < 0 || !isFinite(_em)) {
                        debugInfo('收取值异常: ' + _em, 3);
                    } else if (!_em) {
                        debugInfo('无能量球可收取');
                    } else {
                        debugInfo('共计收取: ' + _em + 'g');
                        $$db.insert$(['%SELF%', $$app.ts_sec, _em]);
                    }
                    debugInfo('自己能量检查完毕');
                }
            },
            awake() {
                let _ctd_ts = $$af.min_ctd.own.value;
                let _cA = _ctd_ts && isFinite(_ctd_ts);
                let _cB = _ctd_ts - $$app.ts <= $$af.thrd_bg_mon_own * 60e3 + 9e3;
                if (_cA && _cB) {
                    messageAction$('开始主页能量球返检监控', 1, 1, 0, 1);
                    $$app.page.af.launch();
                    this.init().collect();
                    return true;
                }
            },
        },
        fri: {
            _rl_compass: {
                nick: {
                    presets: [
                        'pc2>0', // since Jul 16, 2021 (around)
                        'pc1>0', // since Jul 16, 2021 (around)
                        'p2c2>0>0', // legacy
                    ],
                    condition(w, c) {
                        return w && !$$sel.pickup([w, c], 'txt').match(/^\s*$/);
                    },
                },
                rank: {
                    presets: [
                        'pc0', // since Jul 16, 2021 (around)
                        'p2c0>0', // legacy
                    ],
                    condition(w, c) {
                        let _s = w && $$sel.pickup([w, c], 'txt');
                        return _s && _s.match(/^\s*\d+\s*$/);
                    },
                },
            },
            _getRlCompass(w, key) {
                let {presets, condition} = this._rl_compass[key];
                for (let c of presets) {
                    if (condition(w, c)) {
                        return c;
                    }
                }
                return presets[0];
            },
            _getSamples(cache_fg) {
                if (cache_fg && this.rl_samples) {
                    return this.rl_samples;
                }

                let _wc = $$sel.pickup(new RegExp('\\d+\u2019'), 'wc');
                debugInfo('捕获好友能量倒计时数据: ' + _wc.length + '项');

                return _parseWidgets.call(this);

                // tool function(s) //

                function _parseWidgets() {
                    let _smp = {};
                    _wc.forEach((w) => {
                        let _mm = Number($$sel.pickup(w, 'txt').match(/\d+/)[0]);
                        if (_mm) {
                            let _c = this.getRlNickCompass(w);
                            let _nick = $$sel.pickup([w, _c], 'txt', {default: '?_nick'});
                            _smp[_nick] = {
                                ts: $$app.ts + _mm * 60e3,
                                minute: _mm,
                            };
                        }
                    });

                    let _z = Object.size(_smp);
                    _z > 0 && debugInfo('解析好友有效倒计时数据: ' + _z + '项');

                    return this.rl_samples = _smp;
                }
            },
            _chkMinCtd(cache_fg) {
                let _smp = this._getSamples(cache_fg);

                if (Object.size(_smp) > 0) {
                    let _min_mm = Infinity;
                    let _min_ctd = Infinity;

                    Object.values(_smp).forEach((o) => {
                        if ($$num($$app.ts, '<', o.ts, '<', _min_ctd)) {
                            _min_ctd = o.ts;
                            _min_mm = o.minute;
                        }
                    });

                    if (_min_mm > 0) {
                        $$af.min_ctd.fri.value = _min_ctd;
                        debugInfo('好友能量最小倒计时: ' + _min_mm + '分钟');
                        debugInfo('时间数据: ' + $$cvt.date(_min_ctd));
                        debugInfo('好友能量最小倒计时检测完毕');
                        return _min_mm <= $$cfg.rank_list_review_threshold;
                    }
                    debugInfo('好友倒计时数据无效: ' + _min_mm, 3);
                }
            },
            _strollReady() {
                return $$af.stroll.trigger() && $$af.stroll.locate();
            },
            _rankListReady() {
                $$app.page.closeAllRelated();
                $$app.page.rl.reclaimAll();
                if ($$app.page.rl.launch()) {
                    $$app.monitor.rl_in_page.start();
                    $$app.monitor.rl_bottom.start();
                    return true;
                }
            },
            thd_info_collect: {
                start() {
                    let _fri = $$af._collector.fri;
                    this.isAlive() && this.interrupt();
                    this._thd = threadsx.start(function () {
                        debugInfo('已开启好友森林信息采集线程');

                        $$app.page.fri.pool.clear();
                        _fri.eballs.reset();

                        let _eballs_o = imagesx.findAFBallsByHough({
                            pool: $$app.page.fri.pool,
                        });

                        Object.keys(_eballs_o)
                            .filter(k => k !== 'duration')
                            .forEach(k => _fri.eballs[k] = _eballs_o[k]);

                        _eballs_o.duration.showDebugInfo();
                    });
                },
                interrupt() {
                    this._thd && this._thd.interrupt();
                },
                isAlive() {
                    return this._thd && this._thd.isAlive();
                },
                join(t) {
                    typeof t === 'number' ? this._thd.join(t) : this._thd.join();
                },
            },
            /** @type {FriTar[]} */
            targets: [],
            eballs: {
                /** @type {EnergyBallsInfo[]} */
                ripe: [],
                /** @type {EnergyBallsInfo[]} */
                naught: [],
                /** @type {EnergyBallsInfo[]} */
                water: [],
                get length() {
                    return this.ripe.length + this.naught.length;
                },
                reset() {
                    this.ripe.splice(0);
                    this.naught.splice(0);
                    this.water.splice(0);
                },
            },
            trigger() {
                return $$cfg.friend_collect_switch;
            },
            init() {
                debugInfo($$flag.rl_review ? '开始复查好友能量' : '开始检查好友能量');

                delete $$flag.rl_bottom_rch;
                delete $$flag.rl_review;

                $$af.min_ctd.fri.reset();
                $$app.blist.init();

                this._strollReady() || this._rankListReady();

                return this;
            },
            collect() {
                let _fri = this;
                let _own = this.parent.own;
                let _rl = $$app.page.rl;

                let _lmt = _limitationSetter();

                while (1) {
                    if (_awake()) {
                        return _reboot();
                    }
                    if (_scan()) {
                        void _gather();
                    }
                    if (_quit()) {
                        break;
                    }
                    if (_roll()) {
                        void _swipe();
                    }
                }

                _review() ? _reboot() : _fin();

                // tool function(s) //

                function _awake() {
                    return _own.awake();
                }

                function _review() {
                    return _fri.review();
                }

                function _reboot() {
                    return _fri.reboot();
                }

                function _scan() {
                    return _scanStrollBtn() || _scanRankList();

                    // tool function(s) //

                    function _scanStrollBtn() {
                        if ($$af.stroll.trigger()) {
                            if (!$$af.stroll.locate('cache')) {
                                $$af.stroll.disable();
                                Object.assign(_lmt, {
                                    trigger: () => true,
                                    message: () => {
                                        messageAction('定位逛一逛按钮失败', 3, 1, 0, 'up_dash');
                                        messageAction('逛一逛方案已被禁用', 3, 0, 0, 'dash');
                                    },
                                });
                            }
                            return true;
                        }
                    }

                    function _scanRankList() {
                        let _color_pick = $$cfg.friend_collect_icon_color;

                        let _prop = {
                            pick: {
                                act_desc: '收取',
                                color: _color_pick,
                                col_thrd: $$cfg.friend_collect_icon_threshold,
                                mult_col: (function $iiFe() {
                                    let _mult = [
                                        [cX(38), cYx(35), _color_pick],
                                        [cX(23), cYx(26), -1],
                                    ];

                                    // from E6683
                                    for (let i = 16; i <= 24; i += (4 / 3)) {
                                        _mult.push([cX(i), cY(i - 6, -1), -1]);
                                    }

                                    // from E6683
                                    for (let i = 16; i <= 24; i += (8 / 3)) {
                                        _mult.push([cX(i), cY(i / 2 + 16, -1), -1]);
                                    }

                                    return _mult;
                                })(),
                                /** @typedef {{icon_y: number, item_y: number, act_desc: string}[]} FriTar */
                                /** @returns {FriTar} */
                                getTar() {
                                    if (_fri.trigger()) {
                                        return _chkByImgTpl.call(this);
                                    }
                                    if (!$$flag.dys_pick) {
                                        debugInfo(['不再采集收取目标样本', '>收取功能未开启']);
                                        $$flag.dys_pick = true;
                                    }
                                    return [];
                                },
                            },
                        };

                        timeRecorder('rl_scan');

                        _fri.targets = [_getTar('pick')];

                        return Math.sum(_fri.targets.map(x => x.length));

                        // tool function(s) //

                        /** @returns {FriTar} */
                        function _chkByImgTpl() {
                            let _capt = $$app.page.rl.capt_img;
                            let _x = cX(0.896);
                            let _y = cYx(0.09);
                            let _w = _capt.getWidth() - _x;
                            let _h = Math.min(_capt.getHeight(), uH) - _y;
                            let _clip = images.clip(_capt, _x, _y, _w, _h);
                            let _res = imagesx.matchTemplate(_clip, 'ic_fetch', {
                                max_results: 15,
                                compress_level: 2,
                                not_null: true,
                                local_cache_access: true,
                            });
                            imagesx.reclaim(_capt, _clip);

                            return _res.points.reverse().map((pt) => ({
                                icon_y: pt.y + _y,
                                item_y: pt.y + _y + cYx(12),
                                act_desc: String(this.act_desc),
                            })).filter(o => o.item_y < uH);
                        }

                        /**
                         * @param {'pick'} ident
                         * @returns {FriTar}
                         */
                        function _getTar(ident) {
                            return _prop[ident].getTar().sort((a, b) => (
                                a.icon_y < b.icon_y ? 1 : -1
                            ));
                        }
                    }
                }

                function _gather() {
                    $$af.stroll.trigger() ? _byStroll() : _byRankList();

                    // tool function(s) //

                    function _title() {
                        let _title = '';
                        let _ctr = 0;
                        waitForAction(() => {
                            _ctr++ % 25 || $$a11y.service.refreshServiceInfo();
                            return _title = $$sel.get('fri_tt', 'txt') || '';
                        }, 18e3, 80);
                        $$af.nick = _title.replace(/的蚂蚁森林$/, '');
                    }

                    function _intro() {
                        debugInfo('__split_line__');
                        if ($$af.nick) {
                            $$app.fri_drop_by.ic($$af.nick);
                            messageAction$($$af.nick, 't');
                        } else {
                            messageAction('标题采集好友昵称超时', 3, 1);
                        }
                        debugInfo('__split_line__');
                    }

                    function _collect() {
                        do {
                            if (!_inBlist() && _ready()) {
                                _monitor();
                                !_cover() && _harvest();
                            }
                        } while (_reentry());

                        // main function(s) //

                        function _inBlist() {
                            if ($$app.blist.get($$af.nick)) {
                                $$app.fri_drop_by.dc($$af.nick);
                                return true;
                            }
                        }

                        function _ready() {
                            _fri.thd_info_collect.interrupt();
                            return $$app.page.fri.getReady();
                        }

                        function _monitor() {
                            $$app.monitor.expand_feed.start();
                            _fri.thd_info_collect.start();
                        }

                        function _cover() {
                            let _is_covered = false;
                            let _cover = $$app.page.fri.cover;
                            _cover.ready();
                            _cover.detect() && _handle();

                            return _is_covered;

                            // tool function(s) //

                            function _handle() {
                                debugInfo('颜色识别检测到保护罩');
                                _is_covered = true;

                                debugInfo('终止好友森林信息采集线程');
                                _fri.thd_info_collect.interrupt();

                                let _w_lst = null;
                                if (!waitForAction(() => _w_lst = $$sel.get('list'), 3e3, 80)) {
                                    return messageAction('未能通过列表获取能量罩信息', 3, 1, 1);
                                }

                                let _w_cvr = null;
                                let _thd_auto_expand = threadsx.start(_autoExpand);

                                _getTs() && _addBlist();

                                return true;

                                // tool function(s) //

                                function _autoExpand() {
                                    debugInfo('已开启动态列表自动展开线程');

                                    let _ctr = 0;
                                    let _w = null;
                                    if (!waitForAction(() => _w = $$sel.pickup(/.*加载更多\s*/), 3e3)) {
                                        return debugInfo('定位"加载更多"按钮超时', 3);
                                    }
                                    debugInfo('成功定位' + $$sel.pickup(_w, 'txt').surround('"') + '按钮');

                                    while (_ctr++ < 50) {
                                        waitForAndClickAction(_w, 3e3, 120, {click_strategy: 'w'});
                                        sleep(_ctr < 12 ? 200 : 900);
                                    }
                                }

                                function _getTs() {
                                    debugInfo('开始采集能量罩使用时间');

                                    let _getFeedLegends = () => (
                                        $$sel.pickup({className: 'ListView'}, 'children', {default: []})
                                    ).filter((w) => {
                                        return !isNullish(w)
                                            && w.childCount() === 0
                                            && w.indexInParent() < w.parent().childCount() - 1;
                                    }).slice(0, 3);

                                    let _max = 8;
                                    let _selCover = () => $$sel.get('cover_used');
                                    while (_max--) {
                                        for (let w of _getFeedLegends()) {
                                            let _txt = $$sel.pickup(w, 'txt');
                                            // more than 2 days; like: '03-22'
                                            let _gt2 = _txt.match(/\d{2}.\d{2}/);
                                            if (waitForAction(_selCover, 1e3, 80) || _gt2) {
                                                debugInfo('能量罩信息已定位');
                                                return _w_cvr = _selCover();
                                            }
                                        }
                                    }
                                    debugInfo('能量罩使用时间采集失败', 3);
                                }

                                function _addBlist() {
                                    _thd_auto_expand.interrupt();
                                    debugInfo('中断态列表自动展开线程');

                                    /* /今天|昨天/ or like: '05-23' */
                                    let _date_str = _getDateStr();
                                    debugInfo('捕获动态列表日期字串: ' + _date_str);

                                    /* like: '03:19' */
                                    let _time_str = $$sel.pickup([_w_cvr, 'p2c-1'], 'txt');
                                    debugInfo('捕获动态列表时间字串: ' + _time_str);

                                    $$app.blist.add($$af.nick, _ts(), $$app.blist.reason.cover);

                                    // tool function(s) //

                                    /** Returns timestamp when protect cover is invalid */
                                    function _ts() {
                                        let _offsetHr = _getOffsetHr();
                                        let _real_h = new Date().getHours() + _offsetHr;
                                        let _new_d = new Date().setHours(_real_h);
                                        _date_str = new Date(_new_d).toDateString();

                                        return new Date(_date_str + ' ' + _time_str).getTime();

                                        // tool function(s) //

                                        function _getOffsetHr() {
                                            if (_date_str.match(/昨天/)) {
                                                return (-24) + 24;
                                            }
                                            if (_date_str.match(/今天/)) {
                                                return (0) + 24;
                                            }
                                            let _d_str_mch = _date_str.match(/\d{2}.\d{2}/);
                                            if (!_d_str_mch) {
                                                debugInfo('动态列表日期字串解析失败', 3);
                                                debugInfo('日期字串: ' + _date_str, 3);
                                                debugInfo('使用默认延时时常: 24小时', 3);
                                                return +24;
                                            }
                                            let _d_str = _d_str_mch[0];
                                            // like: _MM -> 12, _dd -> 31 (Dec 31)
                                            let [_MM, _dd] = _d_str.split(/\D/).map(x => Number(x));
                                            _MM -= 1;
                                            let _now = new Date(); // like: Jan 1, 2011
                                            let _n_yy = _now.getFullYear();
                                            let _n_MM = _now.getMonth();
                                            let _n_dd = _now.getDate();
                                            let _n_d_str = _now.toDateString();
                                            let _yy = _n_yy; // like: 2011
                                            if (_MM > _n_MM || _MM === _n_MM && _dd > _n_dd) {
                                                _yy -= 1; // like: 2010
                                            }
                                            let _gap = new Date(_n_d_str) - new Date(_yy, _MM, _dd);
                                            return _gap / 3.6e6 + 24;
                                        }
                                    }

                                    function _getDateStr() {
                                        let _txt_cvr = $$sel.pickup(_w_cvr, 'txt');
                                        let _date_str = '';
                                        void _w_lst.children().some((child) => {
                                            if (child !== null /* mystical */) {
                                                if (child.childCount()) {
                                                    return (
                                                        $$sel.pickup([child, 'c1>1'], 'txt') ||
                                                        $$sel.pickup([child, 'c0>1'], 'txt')
                                                    ) === _txt_cvr;
                                                }
                                                _date_str = $$sel.pickup(child, 'txt');
                                            }
                                        });
                                        return _date_str;
                                    }
                                }
                            }
                        }

                        function _harvest() {
                            _fri.thd_info_collect.join();
                            $$link(_pick).$(_db);

                            // tool function(s) //

                            function _pick() {
                                if (_fri.trigger()) {
                                    let _eballs = _fri.eballs.ripe;
                                    if (_eballs.length) {
                                        _clickAndCount('pick', _eballs);
                                    } else {
                                        debugInfo('没有可收取的能量球');
                                    }
                                }
                            }

                            function _db() {
                                let _pick = _harvest['cnt_pick'] || 0;
                                if (_pick) {
                                    let _name = $$af.nick || '%NULL%';
                                    let _ts = $$app.ts_sec;
                                    $$db.insert$([_name, _ts, _pick]);
                                }
                            }

                            /**
                             * @param {'pick'} act
                             * @param {EnergyBallsInfo[]} data
                             */
                            function _clickAndCount(act, data) {
                                let _prop = {
                                    pick: {
                                        src_pref: '收取',
                                        act_desc: '收取',
                                        ball_desc: '成熟能量球',
                                        pk_kw: '你收取TA',
                                        accu_key: 'emount_c_fri',
                                    },
                                };

                                let _cfg = _prop[act];
                                let _ctr = threadsx.atomic(0);
                                let _res = threadsx.atomic(-1);

                                let _strategies = {
                                    pk: {
                                        desc: 'PK面板',
                                        condition: () => $$sel.pickup(_cfg.pk_kw),
                                        getSum(agent) {
                                            return agent.stab - agent.init;
                                        },
                                        getEmount() {
                                            let _max = 10;
                                            while (_max--) {
                                                let _s = $$sel.pickup([_cfg.pk_kw, 's>1'], 'txt');
                                                if (_s.match(/\d+\s?(kg|t)/)) {
                                                    debugInfo('放弃低精度参照值');
                                                    return NaN;
                                                }
                                                let _mch = _s.match(/\d+/);
                                                if (_mch) {
                                                    return +_mch[0];
                                                }
                                            }
                                            return NaN;
                                        },
                                    },
                                    feed: {
                                        desc: '动态列表',
                                        text: {
                                            NO_BENCHMARK: '__NO_BENCHMARK__',
                                            TODAY: '今天',
                                        },
                                        condition: () => $$sel.get('list'),
                                        getListWidget() {
                                            let _w_list = null;
                                            let _sel_lst = () => _w_list = $$sel.get('list');
                                            if (!waitForAction(_sel_lst, 1.2e3, 100)) {
                                                return this.w_list = null;
                                            }
                                            return this.w_list = _w_list;
                                        },
                                        getSum(agent) {
                                            let _nickname;
                                            let _sum = 0;
                                            let _max = Math.min(agent.stab - agent.init, data.length);
                                            for (let i = 1; i <= _max; i += 1) {
                                                let _summary = this.getItemSummary('c' + i);
                                                _sum += _parseSummary(_summary).amount;
                                            }
                                            return _sum;

                                            // tool function(s) //

                                            function _parseSummary(s) {
                                                let _amount = 0;
                                                s.split('\ufeff').some((item, idx, arr) => {
                                                    let _mch = _matchFetchedGrams(item);
                                                    if (_mch && idx > 0) {
                                                        let _nick = arr[idx - 1];
                                                        _nickname = _nickname || _nick;
                                                        if (_nickname === _nick) {
                                                            return _amount = Number(_mch[0]);
                                                        }
                                                    }
                                                });
                                                return {amount: _amount};
                                            }

                                            function _matchFetchedGrams(s) {
                                                return s.slice(s.lastIndexOf('收取')).match(/\d+(?=g)/);
                                            }
                                        },
                                        /** @returns {number} - amount of items added to the feed */
                                        getEmount() {
                                            let _w_list = this.getListWidget();
                                            if (_w_list) {
                                                let _txt = (w, c) => $$sel.pickup([w, c], 'txt');
                                                if (this.benchmark === undefined) {
                                                    this.benchmark = (function $iiFe() {
                                                        let _txt = (w, c) => $$sel.pickup([w, c], 'txt');
                                                        if (_txt(_w_list, 'c0') !== this.text.TODAY) {
                                                            return this.text.NO_BENCHMARK;
                                                        }
                                                        return this.getItemSummary('c1');
                                                    }).call(this);
                                                    return 0;
                                                }
                                                if (this.benchmark === this.text.NO_BENCHMARK) {
                                                    if (_txt(_w_list, 'c0') !== this.text.TODAY) {
                                                        return NaN;
                                                    }
                                                    let _ctr = 0;
                                                    _w_list.children().slice(1).every((w) => {
                                                        return (_ctr += 1) && w.childCount() > 0;
                                                    });
                                                    return _ctr - 1;
                                                }
                                                for (let i = 1, l = _w_list.childCount(); i < l; i += 1) {
                                                    if (this.getItemSummary('c' + i) === this.benchmark) {
                                                        return i - 1;
                                                    }
                                                }
                                            }
                                            return NaN;
                                        },
                                        getItemSummary(compass) {
                                            let _w_list = this.w_list || this.getListWidget();
                                            return (function _getText(w) {
                                                return w.childCount()
                                                    ? w.children().map(_getText).join('\ufeff')
                                                    : $$sel.pickup(w, 'txt');
                                            })($$sel.pickup([_w_list, compass]));
                                        },
                                    },
                                };
                                let _thds = {
                                    fx: _strategies,
                                    pool: [],
                                    startAll() {
                                        Object.values(this.fx).forEach((fxo) => {
                                            this.pool.push({
                                                name: _cfg.src_pref + fxo.desc,
                                                f: threadsx.start(_thdMaker(fxo)),
                                            });
                                        });
                                    },
                                    killAll() {
                                        this.pool.forEach((o) => {
                                            if (o.f.isAlive()) {
                                                debugInfo('中断' + o.name + '数据统计线程');
                                                o.f.interrupt();
                                            }
                                        });
                                    },
                                    isAllDead() {
                                        return this.pool.every(o => !o.f.isAlive());
                                    },
                                    ready(agent) {
                                        let _name = agent.src_name;
                                        let _init = agent.getEmount();
                                        debugInfo('初始' + _name + '数据: ' + _init);

                                        _ctr.incrementAndGet();

                                        if (isNaN(_init)) {
                                            return debugInfo('初始' + _name + '数据无效');
                                        }
                                        agent.init_emount = _init;

                                        return true;
                                    },
                                    stable(agent) {
                                        let _name = agent.src_name;
                                        let _init = agent.init_emount;

                                        debugInfo('等待' + _name + '数据稳定');
                                        let _stab = stabilizer(agent.getEmount.bind(agent), _init);

                                        if (!isNaN(_stab)) {
                                            agent.stable_emount = _stab;
                                            debugInfo(_name + '数据已稳定: ' + _stab);
                                            return true;
                                        }
                                        debugInfo(_name + '稳定数据无效');
                                    },
                                };

                                _thds.startAll();

                                _ready() && $$link(_click).$(_stat);

                                // tool function(s) //

                                function _ready() {
                                    let _max = 60;
                                    while (1) {
                                        if (_ctr.get()) {
                                            return true;
                                        }
                                        if (!_max-- || _thds.isAllDead()) {
                                            return messageAction('数据统计初始化失败', 3);
                                        }
                                        sleep(50);
                                    }
                                }

                                function _click() {
                                    let _desc = _cfg.ball_desc;
                                    let _du = $$cfg.forest_balls_click_duration;

                                    debugInfo('点击' + _desc + ': ' + data.length + '个');

                                    data.forEach((o) => {
                                        clickAction(o, 'p', {pt$: _du});
                                        sleep($$cfg.forest_balls_click_interval);
                                    });

                                    $$flag.avail_clicked = true;
                                    $$flag.avail_clicked_pick = act === 'pick';
                                    $$app.fri_drop_by.dc($$af.nick);
                                }

                                function _stat() {
                                    waitForAction(() => ~_res.get(), 2.4e3, 80);

                                    let _sum = _res.get();
                                    let _act = _cfg.act_desc;
                                    let _accu = _cfg.accu_key;

                                    _thds.killAll();

                                    if (~_sum) {
                                        $$af[_accu] += _accu ? _sum : 0;
                                        _harvest['cnt_' + act] = _sum;
                                        let _dbl = $$flag.dblclick_checked ? ' (双击卡)' : '';
                                        messageAction$(_act + ': ' + _sum + 'g' + _dbl, +!!_sum, 0, 1);
                                    } else {
                                        messageAction$(_act + ': 统计数据无效', 0, 0, 1);
                                    }
                                }

                                function _thdMaker(fxo) {
                                    let _maker = {
                                        init: NaN,
                                        stab: NaN,
                                        agent: {
                                            src_name: _cfg.src_pref + fxo.desc,
                                            init_emount: NaN,
                                            stable_emount: NaN,
                                            getEmount: fxo.getEmount.bind(fxo),
                                        },
                                        ready() {
                                            let _agt = this.agent;
                                            if (waitForAction(fxo.condition, 3e3, 50)) {
                                                if (_thds.ready(_agt)) {
                                                    this.init = _agt.init_emount;
                                                    return true;
                                                }
                                            } else {
                                                debugInfo(_agt.src_name + '控件准备超时', 3);
                                            }
                                        },
                                        stable() {
                                            if (_thds.stable(this.agent)) {
                                                this.stab = this.agent.stable_emount;
                                                return true;
                                            }
                                        },
                                        stat() {
                                            let _n = fxo.getSum(this);
                                            _res.compareAndSet(-1, _n);
                                            debugInfo(this.agent.src_name + '统计结果: ' + _n);
                                        },
                                        fx() {
                                            this.ready() && this.stable() && this.stat();
                                        },
                                    };
                                    return _maker.fx.bind(_maker);
                                }
                            }
                        }

                        function _reentry() {
                            let _ln = '__split_line__';
                            if ($$flag.avail_clicked_pick && _dblclickCardExists()) {
                                if (!$$flag.dblclick_checked) {
                                    debugInfo([_ln, '开始双击卡复查', _ln]);
                                    return $$flag.dblclick_checked = true;
                                }
                            }

                            // tool function(s) //

                            function _dblclickCardExists() {
                                if ($$app.dblclick_card_expired_ts - $$app.ts > 0) {
                                    return _showInfo() || true;
                                }
                                let _t_rex = /\D*[0-5]\d:\d{2}\s*/;
                                let _wc = $$sel.pickup(_t_rex, 'wc').filter((w) => {
                                    let _x = cX(50), _y = cYx(70), _d = 0.2;
                                    let _b = w.bounds(), _h = _b.height(), _w = _b.width();
                                    return $$num(_x * (1 - _d), '<', _w, '<', _x * (1 + _d))
                                        && $$num(_y * (1 - _d), '<', _h, '<', _y * (1 + _d));
                                });
                                if (_wc.length > 0) {
                                    $$app.dblclick_card_expired_ts = _getExpiredTs(_wc);
                                    return _showInfo() || true;
                                }

                                // tool function(s) //

                                function _getExpiredTs(wc) {
                                    wc.length > 1
                                        ? debugInfo('匹配到多个双击卡控件', 3)
                                        : debugInfo('匹配到双击卡控件');
                                    let [_mm, _ss] = $$sel.pickup(wc[0], 'txt').match(_t_rex)[0]
                                        .split(':').map(s => Number(s.match(/\d+/)[0]));
                                    return $$app.ts + _mm * 60e3 + _ss * 1e3;
                                }

                                function _showInfo() {
                                    let _gap = $$app.dblclick_card_expired_ts - $$app.ts;
                                    let _ctd_str = $$cvt.date(_gap, 'mm:ss');
                                    debugInfo('双击卡生效中 (剩余' + _ctd_str + ')');
                                }
                            }
                        }
                    }

                    function _coda() {
                        if (!$$flag.avail_clicked) {
                            messageAction$('无能量球可操作', 0, 0, 1);
                        }
                        if ($$af.stroll.trigger()) {
                            if ($$flag.avail_clicked) {
                                debugInfo('逛一逛忽略样本集已重置');
                                _lmt.reset();
                            } else {
                                debugInfo('逛一逛忽略样本集已增员');
                                $$af.stroll.ignored.add($$af.nick);
                            }
                        }
                        showSplitLine$();

                        delete $$af.nick;
                        delete $$flag.dblclick_checked;
                        delete $$flag.avail_clicked;
                        delete $$flag.avail_clicked_pick;
                        $$app.monitor.expand_feed.interrupt(); // just in case
                        $$app.page.fri.pool.reclaimAll();
                    }

                    function _byStroll() {
                        let _enter = () => {
                            debugInfo('点击逛一逛按钮');
                            $$af.stroll.click();
                        };
                        let _ready = () => {
                            let _thd_title = threadsx.start(_title);
                            let _is_slake = false;
                            let _thd_slake = threadsx.start(function () {
                                return waitForAction(() => {
                                    return _is_slake = $$af.stroll.isInSlakePage();
                                }, 18e3, 80);
                            });
                            waitForAction(() => {
                                return !_thd_title.isAlive() || !_thd_slake.isAlive();
                            });
                            if (_is_slake) {
                                debugInfo('终止逛一逛采集流程');
                                debugInfo('>检测到逛一逛结束页面');
                                return '__break__';
                            }
                        };
                        $$link(_enter).$(_ready).$(_intro).$(_collect).$(_coda);
                    }

                    function _byRankList() {
                        _lmt.reset();
                        _fri.targets.forEach(_act);
                        _fri.targets.splice(0);

                        // tool function(s) //

                        function _act(items) {
                            let _item = null;
                            let _next = () => _item = items.pop();
                            let _back = () => {
                                $$app.page.rl.backTo();
                            };
                            let _enter = () => {
                                debugInfo('点击' + _item.act_desc + '目标');
                                clickAction([halfW, _item.item_y], 'p', {pt$: 64, bt$: 500});
                            };

                            while (_next()) {
                                $$link(_enter).$(_title).$(_intro).$(_collect).$(_back).$(_coda);
                            }
                        }
                    }
                }

                function _quit() {
                    if ($$flag.rl_bottom_rch) {
                        debugInfo('检测到排行榜停检信号');
                        $$app.page.rl.reclaimAll();
                        return true;
                    }
                    if (_lmt.trigger()) {
                        _lmt.message();
                        return true;
                    }
                }

                function _fin() {
                    let _swA = $$cfg.timers_switch;
                    let _swB = $$cfg.timers_self_manage_switch;
                    let _swC = $$cfg.timers_countdown_check_friends_switch;

                    if (!(_swA && _swB && _swC)) {
                        $$af.min_ctd.fri.reset();
                    } else if (!isFinite($$af.min_ctd.fri.value)) {
                        if ($$af.stroll.trigger()) {
                            $$toast('正在准备获取排行榜倒计时数据...', 'Long');
                            $$app.page.rl.launch({is_show_greeting: false});
                            $$af.rl.scroll.toBottom({itv: 0});
                            $$toast.dismiss();
                        }
                        _fri._chkMinCtd('cache');
                    }

                    _awake() ? _reboot() : debugInfo('好友能量检查完毕');
                }

                function _roll() {
                    return !$$af.stroll.trigger();
                }

                function _swipe() {
                    $$link(_swipeUp).$(_chkCaptDiff).$(_chkInvtBtn);

                    // tool function(s) //

                    function _swipeUp() {
                        $$impeded('排行榜滑动流程');

                        $$af.rl.isInScrollMode()
                            ? $$af.rl.scroll.scroll({bt$: true})
                            : $$af.rl.swipe.swipe({bt$: true});
                    }

                    function _chkCaptDiff() {
                        if (_diffTrig() || _forcChk()) {
                            _chkRlUnexp();
                        }

                        // tool function(s) //

                        function _diffTrig() {
                            let _pool = _rl.pool;
                            let _ctr = $$flag.rl_capt_pool_ctr || 0;
                            let _ctrTrig = () => _ctr && !(_ctr % 4);

                            _pool.add().filter().trim(2);

                            return !_diffLmtRch() && _ctrTrig();

                            // tool function(s) //

                            function _diffLmtRch() {
                                if ($$flag.rl_bottom_rch || _pool.isDiff()) {
                                    delete $$flag.rl_capt_pool_ctr;
                                    return;
                                }
                                let _max = $$cfg.rank_list_capt_pool_diff_check_threshold;
                                debugInfo('排行榜截图样本池差异检测:');
                                debugInfo('检测未通过: (' + ++_ctr + '/' + _max + ')');
                                if (_ctr >= _max) {
                                    debugInfo('发送排行榜停检信号');
                                    debugInfo('>已达截图样本池差异检测阈值');
                                    delete $$flag.rl_capt_pool_ctr;
                                    return $$flag.rl_bottom_rch = true;
                                }
                                $$flag.rl_capt_pool_ctr = _ctr;
                            }
                        }

                        function _forcChk() {
                            if ($$flag.rl_forc_chk) {
                                delete $$flag.rl_forc_chk;
                                return true;
                            }
                        }

                        function _chkRlUnexp() {
                            $$link(_chkLoading).$(_chkBottom).$(_chkDozing);

                            // tool function(s) //

                            function _chkLoading() {
                                let _sel = () => $$sel.pickup(/正在加载.*/);

                                if (_sel()) {
                                    let _max = 2;
                                    debugInfo('检测到"正在加载"按钮');
                                    debugInfo('等待按钮消失 (最多' + _max + '分钟)');

                                    if (waitForAction(() => !_sel(), _max * 60e3)) {
                                        delete $$flag.rl_bottom_rch;
                                        debugInfo('排行榜停检信号撤销');
                                        debugInfo('>"正在加载"按钮已消失');
                                    } else {
                                        debugInfo('等待"正在加载"按钮消失超时', 3);
                                    }
                                }
                            }

                            function _chkBottom() {
                                let _widget = $$sel.get('rl_end_idt');
                                if (_widget) {
                                    let _h = _widget.bounds().height();
                                    if (_h > 3) {
                                        if (_rl.btm_h === _h) {
                                            debugInfo('发送排行榜停检信号');
                                            debugInfo('>已匹配列表底部控件');
                                            $$flag.rl_bottom_rch = true;
                                        } else {
                                            _rl.btm_h = _h;
                                            $$flag.rl_forc_chk = true;
                                        }
                                    }
                                }
                            }

                            function _chkDozing() {
                                if (waitForAction(/.*打瞌睡.*/, 2, 360)) {
                                    let _w = $$sel.pickup('再试一次');
                                    waitForAndClickAction(_w, 12e3, 600, {click_strategy: 'w'});
                                    delete $$flag.rl_bottom_rch;
                                    debugInfo(['排行榜停检信号撤销', '>检测到"服务器打瞌睡"页面']);
                                }
                            }
                        }
                    }

                    function _chkInvtBtn() {
                        let _color = '#30bf6c';
                        let _paths = _rl.invt_colors || _invtColors();
                        let _mch = images.findMultiColors(_rl.capt_img, _color, _paths, {
                            region: [cX(0.71), cY(0.62), cX(0.28), cY(0.37)],
                            threshold: 10,
                        });
                        if (_mch) {
                            debugInfo(['列表底部条件满足', '>区域内匹配邀请按钮颜色成功']);
                            $$flag.rl_bottom_rch = true;
                        }

                        // tool function(s) //

                        function _invtColors() {
                            //        x0            x1            x2
                            //        --            --            --
                            // y0:    XX            G1
                            // y1:    G2                          G3
                            // y2:                  G4
                            // y3:    G5                          G6
                            // y4:                  W1            W2

                            let _c_green = _color, _c_white = '#ffffff';
                            let _dx = cX(45), _dy = cYx(9);
                            let _x0 = 0, _y0 = 0;
                            let _x1 = _dx, _x2 = _dx * 2;
                            let _y1 = _dy * 2, _y2 = _dy * 3;
                            let _y3 = _dy * 4, _y4 = _dy * 6;

                            return _rl.invt_colors = [
                                [_x1, _y0, _c_green], // G1
                                [_x0, _y1, _c_green], // G2
                                [_x2, _y1, _c_green], // G3
                                [_x1, _y2, _c_green], // G4
                                [_x0, _y3, _c_green], // G5
                                [_x2, _y3, _c_green], // G6
                                [_x1, _y4, _c_white], // W1
                                [_x2, _y4, _c_white], // W2
                            ];
                        }
                    }
                }

                function _limitationSetter() {
                    return $$af.stroll.trigger() ? {
                        reset() {
                            $$af.stroll.reset();
                        },
                        trigger() {
                            return $$af.stroll.isSlake();
                        },
                        message() {
                            if ($$af.stroll.isMaxCntCycleReached()) {
                                debugInfo('逛一逛无操作循环次数已达上限', 3);
                            }
                        },
                    } : {
                        reset() {
                            this.counter = $$cfg.rank_list_max_not_targeted_times;
                        },
                        trigger() {
                            $$und(this.counter) && this.reset();
                            return --this.counter < 0;
                        },
                        message() {
                            debugInfo('无目标滑动次数已达上限', 3);
                        },
                    };
                }
            },
            review() {
                let _m_quit = '放弃排行榜样本复查:';

                if ($$af.stroll.trigger()) {
                    return;
                }
                if (!$$cfg.timers_switch) {
                    return debugInfo([_m_quit, '定时循环功能未开启']);
                }
                if (!$$cfg.rank_list_review_switch) {
                    return debugInfo([_m_quit, '排行榜样本复查功能未开启']);
                }
                if ($$flag.rl_review_stop) {
                    return debugInfo([_m_quit, '检测到复查停止信号']);
                }

                let _trig = (s) => {
                    debugInfo(['触发排行榜样本复查条件:', s], 'both');
                    return $$flag.rl_review = true;
                };

                if ($$cfg.rank_list_review_difference_switch) {
                    let _smp = this.rl_samples;
                    let _old_keys = _smp && Object.keys(_smp);
                    let _new_keys = Object.keys(this._getSamples());
                    if (!equalObjects(_old_keys, _new_keys)) {
                        return _trig('列表状态差异');
                    }
                }
                if ($$cfg.rank_list_review_samples_clicked_switch) {
                    if ($$flag.avail_clicked) {
                        return _trig('样本点击记录');
                    }
                }
                if ($$cfg.rank_list_review_threshold_switch) {
                    if (this._chkMinCtd($$cfg.rank_list_review_difference_switch)) {
                        return _trig('最小倒计时阈值');
                    }
                }
            },
            reboot() {
                this.init().collect();
            },
            getRlNickCompass(w) {
                return this._getRlCompass(w, 'nick');
            },
            getRlRankNum(w) {
                return this._getRlCompass(w, 'rank');
            },
        },
    },
    _timers_setter: {
        trigger() {
            if (!$$cfg.timers_switch) {
                return debugInfo('定时循环功能未开启');
            }
            if (!$$cfg.timers_self_manage_switch) {
                return debugInfo('定时任务自动管理未开启');
            }
            return true;
        },
        autoTask() {
            let _ahd_own = $$cfg.timers_countdown_check_own_timed_task_ahead;
            let _ahd_fri = $$cfg.timers_countdown_check_friends_timed_task_ahead;
            let _min_own = $$af.min_ctd.own.value - _ahd_own * 60e3;
            let _min_fri = $$af.min_ctd.fri.value - _ahd_fri * 60e3;
            let _nxt_min_ctd = Math.min(_min_own, _min_fri);
            let _nxt_unintrp = _nxtUnintrp() || Infinity;

            let _type = _nxt_min_ctd > _nxt_unintrp
                ? {name: 'uninterrupted', desc: '延时接力'}
                : {name: 'min_countdown', desc: '最小倒计时'};
            let _next_ts = $$app.next_auto_task_ts = Math.min(_nxt_min_ctd, _nxt_unintrp);

            if (isFinite(_next_ts)) {
                _chkAutoTaskSect();
                _setStoAutoTask();
            } else {
                debugInfo('无定时任务可设置');
            }

            // tool function(s) //

            function _nxtUnintrp() {
                return _trigger() && _getNxt();

                // tool function(s) //

                function _trigger() {
                    if (!$$cfg.timers_uninterrupted_check_switch) {
                        return debugInfo('延时接力机制未开启');
                    }
                    // eg: [{section: ['06:30', '00:00'], interval: 60}]
                    let _sto_sxn = $$cfg.timers_uninterrupted_check_sections;
                    if (!_sto_sxn || !_sto_sxn.length) {
                        return debugInfo('无延时接力区间数据');
                    }
                    return _nxtUnintrp.sto_sxn = _sto_sxn;
                }

                function _getNxt() {
                    let _now = $$app.now;
                    let _rec_ts = _now.getTime();
                    let _d_ms = 24 * 3.6e6;
                    let _d_str = _now.toDateString() + ' ';

                    debugInfo('开始计算最小延时接力时间数据');

                    let _res = _nxtUnintrp.sto_sxn.map((sxn) => {
                        let _sxn = sxn.section;
                        if (_sxn && _sxn.length) {
                            let _min_ts = Date.parse(_d_str + _sxn[0]);
                            let _max_ts = Date.parse(_d_str + _sxn[1]);
                            while (_max_ts <= _min_ts) {
                                _max_ts += _d_ms;
                            }
                            let _delay = sxn.interval * 60e3;
                            let _next_ts = _rec_ts + _delay;
                            if (_rec_ts < _min_ts) {
                                _next_ts = Math.max(_next_ts, _min_ts);
                            }
                            if (_next_ts > _max_ts) {
                                if (_rec_ts > _max_ts) {
                                    _next_ts = _min_ts + _d_ms;
                                } else {
                                    _next_ts = _max_ts;
                                }
                            }
                            return _next_ts;
                        }
                    }).filter(x => !!x).sort()[0];

                    debugInfo('时间数据: ' + $$cvt.date(_res));

                    return _res;
                }
            }

            function _chkAutoTaskSect() {
                return _trigger() && _modifyNxt();

                // tool function(s) //

                function _trigger() {
                    let _sxn = $$cfg.timers_auto_task_sections;
                    if (_sxn && _sxn.length) {
                        return _chkAutoTaskSect.sto_sxn = _sxn;
                    }
                    debugInfo('未设置自动定时任务有效时段');
                }

                function _modifyNxt() {
                    let _inf = [];
                    let _d_ms = 24 * 3.6e6;
                    // language=JS
                    let _d_str = '`${$$app.now.toDateString()} `'.ts;
                    let _today_min = Date.parse(_d_str);
                    let _today_max = _today_min + _d_ms;
                    let _sto_sxn = _chkAutoTaskSect.sto_sxn;

                    debugInfo('开始分析自动定时任务有效时段');

                    for (let i = 0, l = _sto_sxn.length; i < l; i += 1) {
                        let _tss = []; // [[ts1, ts2], [ts3, ts4]]
                        let _sxn = _sto_sxn[i];
                        if (_sxn && _sxn.length) {
                            let _sxn_l = Date.parse(_d_str + _sxn[0]);
                            let _sxn_r = Date.parse(_d_str + _sxn[1]);
                            if (_sxn_r <= _sxn_l) {
                                _tss.push([_today_min, _sxn_r]);
                                _tss.push([_sxn_l, _today_max]);
                            } else {
                                _tss.push([_sxn_l, _sxn_r]);
                            }
                            if (_tss.some(a => $$num(a[0], '<=', _next_ts, '<=', a[1]))) {
                                debugInfo(['匹配到有效时段:', _getSxnStr(_sxn)]);
                                return;
                            }
                            _sxn_l = _sxn_l > _next_ts ? _sxn_l : _sxn_l + _d_ms;
                            _inf.push({left_ts: _sxn_l, sxn: _sxn});
                        }
                    }

                    debugInfo('时间数据不在有效时段范围内');

                    let {sxn: _sxn, left_ts: _ts} = _inf.sort((a, b) => {
                        let _a = a.left_ts, _b = b.left_ts;
                        return _a === _b ? 0 : _a > _b ? 1 : -1;
                    })[0];

                    _next_ts = $$app.next_auto_task_ts = _ts;
                    $$app.next_avail_sxn_str = _getSxnStr(_sxn);

                    // tool function(s) //

                    function _getSxnStr(sxn) {
                        let [_l, _r] = sxn;
                        _r += _r <= _l ? ' (+1)' : '';
                        return '[ ' + _l + ' - ' + _r + ' ]';
                    }
                }
            }

            function _setStoAutoTask() {
                timeRecorder('set_auto_task');

                let _sxn_str = $$app.next_avail_sxn_str;
                if (_sxn_str) {
                    _type.desc += ' (顺延)';
                    _type.name += '_restrained';
                }

                $$app.thd_set_auto_task = threadsx.start(function () {
                    let _task = _update() || _add();
                    let _nxt_str = $$cvt.date(_next_ts);

                    messageAction$('任务ID: ' + _task.id, 1, 0, 1);
                    messageAction$('下次运行: ' + _nxt_str, 1, 0, 1);
                    _sxn_str && messageAction$('受制区间: ' + _sxn_str, 1, 0, 1);
                    messageAction$('任务类型: ' + _type.desc, 1, 0, 1, 1);

                    if ($$flag.show_energy_result && $$cfg.auto_task_show_on_e_result) {
                        threadsx.start(function () {
                            if (waitForAction(() => $$flag.floaty_result_all_set, 12e3, 120)) {
                                $$app.layout.next_auto_task.deploy();
                            }
                        });
                    }
                });

                // tool function(s) //

                function _update() {
                    let _sto_nxt = $$app.getStoAutoTask();
                    let _sto_id = _sto_nxt.task_id;
                    if (_sto_id) {
                        let _sto_task = timersx.getTimedTask(_sto_id);
                        if (_sto_task) {
                            return _updateTask(_sto_task);
                        }
                    }

                    // tool function(s) //

                    function _updateTask(task) {
                        debugInfo('开始更新自动定时任务');
                        task.setMillis(_next_ts);
                        return $$app.setStoAutoTask({
                            task: timersx.updateTimedTask(task),
                            next_ts: _next_ts,
                            next_type: _type.name,
                        }, () => {
                            debugInfo('__split_line__');
                            _sxn_str
                                ? messageAction$('已更新并顺延自动定时任务')
                                : messageAction$('已更新自动定时任务');
                        });
                    }
                }

                function _add() {
                    return $$app.setStoAutoTask({
                        task: timersx.addDisposableTask({
                            path: $$app.cwp, date: _next_ts,
                        }),
                        next_ts: _next_ts,
                        next_type: _type.name,
                    }, () => {
                        debugInfo('__split_line__');
                        _sxn_str
                            ? messageAction$('已添加并顺延自动定时任务')
                            : messageAction$('已添加自动定时任务');
                    });
                }
            }
        },
    },
    _epilogue_setter: {
        logBackIFN: () => $$acc.logBack(),
        showResult() {
            return new Promise((reso) => {
                let _e_own = $$af.emount_c_own;
                let _e_fri = $$af.emount_c_fri;
                if ($$flag.show_energy_result) {
                    debugInfo('开始展示统计结果');
                    debugInfo('自己能量收取值: ' + _e_own);
                    debugInfo('好友能量收取值: ' + _e_fri);
                    debugInfo('__split_line__');
                    _e_own >= 0 && _e_fri >= 0
                        ? _showMsg(_eStr(_e_fri, _e_own))
                        : _showMsg('数据统计失败');
                }
                return reso();

                // tool function(s) //

                function _eStr(fri, own) {
                    let _str = [];
                    own && _str.push('Energy from yourself: ' + own + 'g');
                    fri && _str.push('Energy from friends: ' + fri + 'g');
                    return _str.join('\n') || 'A fruitless attempt';
                }

                function _showMsg(msg) {
                    let _m_arr = msg.split('\n');
                    let _isLast = i => i === _m_arr.length - 1;
                    _m_arr.forEach((m, i) => {
                        messageAction(m, 1, 0, 0, +_isLast(i));
                    });
                    if (msg.match(/失败/)) {
                        _e_own = -1;
                    }
                    $$flag.show_floaty_result ? _floatyResult() : _toastResult();

                    // tool function(s) //

                    function _floatyResult() {
                        debugInfo('开始绘制Floaty');

                        $$app.layout.fullscreen_cover.setOnClickListener(function () {
                            if ($$flag.cover_user_touched) {
                                _msg('终止结果展示', '>检测到屏幕触碰');

                                debugInfo('发送Floaty结束等待信号');
                                $$flag.floaty_result_fin = true;

                                $$app.layout.closeAll();
                            } else {
                                debugInfo(['模拟一次"深度返回"操作', '>检测到非用户点击行为']);
                                keycode(4, {double: true});
                            }
                        });
                        $$app.layout.fullscreen_cover.setOnTouchListener(function (view, e) {
                            if (!$$flag.cover_user_touched) {
                                let _act = e.getAction();
                                if (_act === android.view.MotionEvent.ACTION_DOWN) {
                                    $$flag.cover_user_touched = e.getY() > cYx(0.12);
                                }
                                if (_act === android.view.MotionEvent.ACTION_MOVE) {
                                    $$flag.cover_user_touched = true;
                                }
                                if (_act === android.view.MotionEvent.ACTION_UP) {
                                    let _diff = e.getEventTime() - e.getDownTime();
                                    $$flag.cover_user_touched = _diff > 200;
                                }
                            }
                            // touch event will be given to the 'cover' view
                            // instead of being consumed
                            return false;
                        });

                        $$flag.floaty_result_all_set = true;

                        $$app.layout.eballs_pick_result.deploy({
                            own: _e_own, fri: _e_fri,
                            countdown: $$cfg.floaty_result_countdown_sec,
                        });

                        if ($$cfg.update_auto_check_switch && $$cfg.update_show_on_e_result) {
                            $$app.layout.update_avail.deploy();
                        }

                        // tool function(s) //

                        function _msg() {
                            let _args = [].slice.call(arguments);
                            let _toast_msg = _args.map(s => s.replace(/^>*/, '')).join('\n');
                            $$toast(_toast_msg, 'L', 'F');
                            debugInfo('__split_line__');
                            debugInfo(_args);
                            debugInfo('__split_line__');
                        }
                    }

                    function _toastResult() {
                        let _line = '-'.repeat(32);

                        if ($$cfg.auto_task_show_on_e_result) {
                            let _ts = $$app.next_auto_task_ts;
                            if (_ts) {
                                msg = ['Next auto task:', $$cvt.date(_ts), _line, msg].join('\n');
                            }
                        }
                        if ($$cfg.update_auto_check_switch && $$cfg.update_show_on_e_result) {
                            let _ver = $$app.newest_release_ver_name;
                            if (_ver && appx.isNewerVersion(_ver, $$app.project_ver_name)) {
                                msg += '\n' + [_line, 'Update available:', _ver].join('\n');
                            }
                        }
                        $$toast(msg, 'Long');
                        debugInfo('统计结果展示完毕');
                    }
                }
            });
        },
        readyExit() {
            return Promise.resolve()
                .then(_cleanerReady)
                .then(_floatyReady)
                .then(_autoTaskReady)
                .catch(this.err);

            // tool function(s) //

            function _cleanerReady() {
                $$af.cleaner.imgWrapper();
                $$app.blist.save();
                $$app.monitor.insurance.interrupt().clean().reset();
                $$app.page.closeIntelligently();
                $$app.page.autojs.spring_board.remove();
                $$flag.glob_e_scr_privilege = true;
            }

            function _floatyReady() {
                return $$flag.show_floaty_result && new Promise((reso) => {
                    debugInfo('监测Floaty结束等待信号');
                    timeRecorder('floaty_result_waiting');
                    setIntervalBySetTimeout(function () {
                        let _ctd = $$cfg.floaty_result_countdown_sec;
                        let _max = (_ctd + 5) * 1e3;
                        if (timeRecorder('floaty_result_waiting', 'L') > _max) {
                            $$flag.floaty_result_fin = true;
                            debugInfo('放弃等待Floaty消息结束信号', 3);
                            debugInfo('>等待结束信号超时', 3);
                        }
                    }, 200, function () {
                        if ($$flag.floaty_result_fin) {
                            debugInfo('检测到Floaty结束等待信号');
                            $$app.layout.closeAll('without_cover');
                            reso(_updateDialogAsync());
                            return true;
                        }
                    });
                });

                // tool function(s) //

                function _updateDialogAsync() {
                    return $$flag.update_dialog_uphold && new Promise((resolve) => {
                        debugInfo('等待更新对话框结束信号');
                        timeRecorder('update_dialog_uphold');
                        let _fin = (msg) => {
                            debugInfo(msg);
                            clearInterval(_itv);
                            resolve(true);
                        };
                        let _tt = () => ($$flag.update_dialog_deploying ? 5 : 1) * 60e3;
                        let _itv = setInterval(() => {
                            if (!$$flag.update_dialog_uphold) {
                                _fin('检测到更新对话框结束信号');
                            }
                            if (timeRecorder('update_dialog_uphold', 'L') > _tt()) {
                                _fin('放弃等待更新对话框结束信号');
                            }
                        }, 200);
                    });
                }
            }

            function _autoTaskReady() {
                return new Promise((reso) => {
                    let _thd = $$app.thd_set_auto_task;
                    let _cond = function () {
                        if (!_thd || !_thd.isAlive()) {
                            return reso() || true;
                        }
                    };
                    if (!_cond()) {
                        debugInfo('等待定时任务设置完成');
                        setIntervalBySetTimeout(function () {
                            let _max = 10e3;
                            if (timeRecorder('set_auto_task', 'L') > _max) {
                                messageAction('放弃等待定时任务设置完成', 4);
                                messageAction('等待超时', 4, 0, 1);
                                _thd.interrupt();
                                reso();
                            }
                        }, 200, _cond);
                    }
                });
            }
        },
        scrOffIFN() {
            if ($$bool($$app.init_scr_on_from_broadcast)) {
                $$app.init_scr_on = $$app.init_scr_on_from_broadcast;
            }

            if ($$app.queue.excl_tasks_all_len > 1) {
                return debugInfo(['跳过关闭屏幕', '>当前存在排他性排队任务']);
            }

            if ($$app.init_scr_on) {
                return debugInfo('无需关闭屏幕');
            }

            if ($$flag.cover_user_touched) {
                return debugInfo(['跳过关闭屏幕', '>检测到屏幕触碰']);
            }

            $$flag.glob_e_scr_paused = true;

            devicex.screenOff({
                key_code: {
                    is_disabled: !($$app.has_root && $$app.root_fxs.screen_off),
                },
                provider: {
                    hint() {
                        if ($$flag.floaty_result_all_set) {
                            $$app.layout.screen_turning_off.deploy();
                        }
                    },
                    listener(brake) {
                        events.on('key_down', function (kc) {
                            $$flag.floaty_result_all_set && $$app.layout.closeAll();
                            brake('终止屏幕关闭', '>检测到按键行为', '>键值: ' + kc);
                        });

                        if ($$flag.floaty_result_all_set) {
                            $$app.layout.fullscreen_cover.setOnClickListener(function () {
                                if ($$flag.cover_user_touched) {
                                    brake('终止屏幕关闭', '>检测到屏幕触碰');
                                    $$app.layout.closeAll();
                                }
                            });
                        }
                    },
                },
            });
        },
        exitNow: () => $$app.exit(),
        err(e) {
            if (!e.message.match(/InterruptedException/)) {
                messageAction(e.message, 4, 1, 0, -1);
                messageAction(e.stack, 4, 0, 0, 1);
            }
            this.exitNow();
        },
    },
    rl: {
        scroll: {
            get itv() {
                return $$cfg.rank_list_scroll_interval.clamp(100, 2.4e3);
            },
            /**
             * @param {Object} [options]
             * @param {boolean} [options.is_debug_info=undefined]
             * @param {number} [options.itv=this.itv] - interval
             * @param {number|boolean} [options.buffer_time=0]
             * @param {number|boolean} [options.bt$=0] - alias for buffer_time
             * @param {function():boolean} [options.loop]
             */
            scroll(options) {
                let _opt = options || {};
                let debugInfo$ = (m, lv) => debugInfo(m, lv, _opt.is_debug_info);

                let _itv = _opt.itv === undefined ? this.itv : _opt.itv;
                let _1st = 1;

                do {
                    $$impeded('排行榜控件滚动流程');
                    _1st ? _1st &= 0 : sleep(_itv);
                    let _ls = scrollable(true).findOnce();
                    _ls ? _ls.scrollDown() : debugInfo$('scrollable(): null', 3);
                } while (_opt.loop && _opt.loop());

                let _bt = _opt.buffer_time || _opt.bt$ || 0;
                $$sleep(_bt === true || _bt === -1 ? _itv : _bt);
            },
            toBottom(options) {
                let _this = this;
                let _opt = options || {};
                let _thd = threadsx.start(function () {
                    _this.scroll(Object.assign({loop: () => !$$flag.rl_bottom_rch}, _opt));
                });
                $$app.monitor.rl_bottom.start().join(_opt.timeout || 150e3);
                _thd.interrupt();
            },
        },
        swipe: {
            get du() {
                return $$cfg.rank_list_swipe_time.clamp(100, 2.4e3);
            },
            get itv() {
                return $$cfg.rank_list_swipe_interval.clamp(100, 2.4e3);
            },
            get dist() {
                let _dist = $$cfg.rank_list_swipe_distance;
                if (_dist < 1) {
                    _dist = Math.trunc(_dist * H);
                }
                return _dist;
            },
            get top() {
                let _top = Math.trunc((uH - this.dist) / 2);
                return _top > 0 ? _top : this.autoAdjust();
            },
            get bottom() {
                return uH - this.top;
            },
            /**
             * @param {Object} [options]
             * @param {boolean} [options.no_click_outside=false]
             * @param {boolean} [options.is_debug_info=undefined]
             * @param {number} [options.x1=halfW]
             * @param {number} [options.y1=this.bottom]
             * @param {number} [options.x2=halfW]
             * @param {number} [options.y2=this.top]
             * @param {number} [options.du=this.du] - duration
             * @param {number} [options.itv=this.itv] - interval
             * @param {number|boolean} [options.buffer_time=0]
             * @param {number|boolean} [options.bt$=0] - alias for buffer_time
             * @param {function():boolean} [options.loop]
             */
            swipe(options) {
                let _opt = options || {};
                let debugInfo$ = (m, lv) => debugInfo(m, lv, _opt.is_debug_info);

                let _ = (v, d) => v === undefined ? d : v;
                let _x1 = _(_opt.x1, halfW);
                let _y1 = _(_opt.y1, this.bottom);
                let _x2 = _(_opt.x2, halfW);
                let _y2 = _(_opt.y2, this.top);
                let _du = _(_opt.du, this.du);
                let _itv = _(_opt.itv, this.itv);

                let _1st = 1;

                do {
                    _1st ? _1st &= 0 : sleep(_itv);
                    if (!swipe(_x1, _y1, _x2, _y2, _du)) {
                        debugInfo$('swipe(): false', 3);
                    } else if (!_opt.no_click_outside) {
                        // just to prevent screen from turning off
                        // maybe this is not a good idea
                        click(1e5, 1e5);
                    }
                } while (_opt.loop && _opt.loop());

                let _bt = _opt.buffer_time || _opt.bt$ || 0;
                $$sleep(_bt === true || _bt === -1 ? _itv : _bt);
            },
            autoAdjust() {
                let _dist0 = Math.trunc(uH * 0.95);
                let _top0 = Math.trunc((uH - _dist0) / 2);
                let _af_cfg = $$sto.af_cfg.get('config', {});
                let _data = {rank_list_swipe_distance: _dist0};
                let _combined = Object.assign({}, _af_cfg, _data);

                messageAction$('滑动区域超限', 3);

                messageAction$('自动修正滑动距离参数:', 3);
                messageAction$('swipe_top: ' + _top0, 3);

                $$sto.af_cfg.put('config', _combined);
                $$cfg.rank_list_swipe_distance = _dist0;
                messageAction$('自动修正配置文件数据:', 3);
                messageAction$('rank_list_swipe_distance: ' + _dist0, 3);

                return _top0;
            },
            toBottom(options) {
                let _this = this;
                let _opt = options || {};
                let _thd = threadsx.start(function () {
                    _this.swipe(Object.assign({loop: () => !$$flag.rl_bottom_rch}, _opt));
                });
                $$app.monitor.rl_bottom.start().join(_opt.timeout || 150e3);
                _thd.interrupt();
            },
        },
        isInScrollMode() {
            return $$cfg.rank_list_scan_strategy === 'scroll';
        },
        isInSwipeMode() {
            return $$cfg.rank_list_scan_strategy === 'swipe';
        },
    },
    launch() {
        this._launcher.greet().assign().home().ready();
        return $$af;
    },
    collect() {
        let {own, fri} = this._collector;
        own.trigger() && own.init().collect();
        fri.trigger() && fri.init().collect();
        return $$af;
    },
    timers() {
        let t = this._timers_setter;
        t.trigger() && t.autoTask();
        return $$af;
    },
    epilogue() {
        let _ = this._epilogue_setter;
        _.logBackIFN();
        Promise.all([_.showResult(), _.readyExit()])
            .then(_.scrOffIFN)
            .then(_.exitNow)
            .catch(_.err);
    },
    $bind() {
        let _c = this._collector;
        _c.parent = this;
        _c.own.parent = _c.fri.parent = _c;

        this.min_ctd = {
            own: new _$MinCtdFactory(),
            fri: new _$MinCtdFactory(),
        };

        // optional but recommended
        delete this.$bind;

        return this;

        // constructor(s) //

        function _$MinCtdFactory() {
            return {
                reset() {
                    this.value = Infinity;
                },
                get value() {
                    this._value === undefined && this.reset();
                    return this._value;
                },
                set value(val) {
                    this._value = val;
                },
            };
        }
    },
};

// entrance //
$$init.check().global().queue().delay().monitor().unlock().prompt().command();

$$af.$bind().launch().collect().timers().epilogue();