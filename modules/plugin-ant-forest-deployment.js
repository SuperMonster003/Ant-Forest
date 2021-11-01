require('./mod-global.js');
let {project} = require('./mod-project');
let {threadsx} = require('./ext-threads');
let {dialogsx} = require('./ext-dialogs');

/** @type {Plugin$Exportation} */
let _export = {
    dialog: _getDiagWelcome(),
    view: null,
    run() {
        this.dialog.show();
    },
    config() {
        dialogsx.alerts('CUI (Configuration User Interface) for current plugin hasn\'t been accomplished');
    },
    getView() {
        return this.view;
    },
    getDialog() {
        return this.dialog;
    },
};

typeof module === 'object' ? module.exports = _export : _export.run();

// tool function(s) //

function _getDiagWelcome() {
    return dialogsx
        .builds(['项目部署',
            '欢迎使用蚂蚁森林项目部署工具\n此工具用于 v2.0.0 以上版本的项目部署',
            ['了解项目', 'hint'], ['退出', 'caution'], ['开始部署', 'attraction'], 1])
        .on('neutral', _showDiagAboutProj)
        .on('negative', (d) => {
            d.dismiss();
            exit();
        })
        .on('positive', (d) => {
            d.dismiss();
            project.getReleases({
                min_version_name: 'v2.0.1',
                show_progress_dialog: true,
            }, _projReleaseCbk);
        });
}

function _showDiagAboutProj() {
    dialogsx.builds(['关于项目',
        '- 功能简介 -' + '\n' + [
            '自动收取好友能量', '自动收取/监测自己能量', '收取结果统计/展示',
            '控制台消息提示', '自动解锁屏幕', '定时任务与循环监测', '多任务自动排队',
            '脚本运行安全', '事件监测与处理', '黑名单机制', '项目管理', '账户功能',
            '统计功能', '图形化配置工具',
        ].map(s => '·\x20' + s).join('\n') + '\n\n' +
        '- 项目作者 -' + '\n' + '· SuperMonster003' + '\n\n' +
        '- 项目链接 -' + '\n' + '· https://github.com/SuperMonster003/Ant-Forest',
        0, 0, '返回', 1,
    ], {
        linkify: 'WEB_URLS',
    }).on('positive', d => d.dismiss()).show();
}

function _projReleaseCbk(releases) {
    if (!releases.length) {
        return exit();
    }
    let _newest = releases[0];
    let _newest_ver_n = _newest.version_name;
    dialogsx
        .builds([
            '选择项目版本', '选择希望部署的项目版本',
            ['版本历史', 'hint'], ['X', 'warn'], '下一步', 1,
        ], {
            items: ['最新版本 (' + _newest_ver_n + ')', '其他版本'],
            itemsSelectMode: 'single',
            itemsSelectedIndex: 0,
        })
        .on('neutral', () => {
            project.getChangelog(_newest_ver_n.match(/v(\d+)/)[1], {
                is_show_dialog: true,
            });
        })
        .on('negative', (d) => {
            dialogsx.builds([
                '提示', '项目部署尚未完成\n确定要退出吗',
                0, 'B', ['确定退出', 'caution'], 1,
            ]).on('negative', (ds) => {
                ds.dismiss();
            }).on('positive', (ds) => {
                dialogsx.dismiss([ds, d]);
                exit();
            }).show();
        })
        .on('positive', (d) => {
            d.dismiss();
            d.getSelectedIndex() === 0
                ? threadsx.start(() => _deployVersion(_newest))
                : dialogsx.builds([
                    '选择其他项目版本', '', 0, '上一步', '下一步', 1,
                ], {
                    items: releases.slice(1).map(o => o.version_name),
                    itemsSelectMode: 'single',
                    itemsSelectedIndex: 0,
                }).on('negative', (ds) => {
                    ds.dismiss();
                    d.show();
                }).on('positive', (ds) => {
                    ds.dismiss();
                    let _idx = ds.getSelectedIndex() + 1;
                    threadsx.start(() => _deployVersion(releases[_idx]));
                }).show();
        })
        .show();
}

function _deployVersion(version) {
    project.deploy(version, {
        onSuccess(o, d) {
            let _tar = o.target_path;
            d.removeAllListeners('positive');
            d.setActionButton('positive', '下一步');
            dialogsx.appendContentText(d, '\n\n' + '项目部署路径:\n' +
                files.path(_tar).replace(files.getSdcardPath(), '/内部存储'));
            d.on('positive', (d) => {
                d.dismiss();
                if (engines.myEngine().source.toString().match(/^Ant.Forest.+er/)) {
                    _showHintForLegacy();
                } else {
                    _showStatement();
                }

                // tool function(s) //

                function _showHintForLegacy() {
                    dialogs.build({
                        title: '新项目使用提示',
                        content: '可能需要在Auto.js程序主页下拉刷新才能看到新项目\n' +
                            '新项目默认是以"Ant-Forest-003"命名的蓝色目录 进入目录可运行新项目\n' +
                            '对于当前目录下的旧项目文件 若无保留需要 可全部移除\n' +
                            '移除时需谨慎 避免误删可能存在的项目以外的重要文件',
                        positive: '下一步',
                        autoDismiss: false,
                        canceledOnTouchOutside: false,
                    }).on('positive', (d) => {
                        d.dismiss();
                        _showStatement();
                    }).show();
                }

                function _showStatement() {
                    let _runNow = function () {
                        dialogsx.clearPool();
                        let _pkg = context.getPackageName();
                        let _startActivity = (override_class_name_prefix) => {
                            let _cls_n_pref = override_class_name_prefix || _pkg;
                            app.startActivity({
                                packageName: _pkg,
                                className: _cls_n_pref + '.external.open.RunIntentActivity',
                                data: 'file://' + _tar + '/ant-forest-launcher.js',
                            });
                        };
                        try {
                            _startActivity('org.autojs.autojs');
                        } catch (e) {
                            _startActivity(_pkg);
                        }
                    };

                    let _finish = function () {
                        dialogsx.clearPool();
                        exit();
                    };

                    dialogsx
                        .builds(['项目使用声明', ['代码完全公开', '杜绝恶意代码', '项目永久免费', '欢迎提议反馈', '',
                            '如需获知项目启动方式', '可点击"了解更多"按钮'].map(s => s && '·\x20' + s).join('\n'),
                            ['T', 'hint'], 0, ['完成部署', 'finish'], 1])
                        .on('neutral', () => dialogsx
                            .builds(['项目启动方式', '以下方式可用于启动项目:' + '\n' + [
                                'ant-forest-launcher运行按钮',
                                '目录顶部的项目运行按钮 (如有)',
                                '创建并使用桌面快捷方式'].map(s => s && '·\x20' + s).join('\n'),
                                ['立即运行项目', 'attraction'], ['B', 'default_aj_4'], ['完成部署', 'finish'], 1])
                            .on('neutral', _runNow)
                            .on('negative', ds => ds.dismiss())
                            .on('positive', _finish)
                            .show())
                        .on('positive', _finish)
                        .show();
                }
            });
        },
    }, {on_interrupt_btn_text: 'X', success_title: '项目部署完成'});
}