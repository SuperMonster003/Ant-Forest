/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let JavaArray = java.lang.reflect.Array;
let StringBuilder = java.lang.StringBuilder;
let KeyEvent = android.view.KeyEvent;
let Linkify = android.text.util.Linkify;
let ColorStateList = android.content.res.ColorStateList;
let DialogAction = com.afollestad.materialdialogs.DialogAction;
let Pref = org.autojs.autojs.Pref;
let File = java.io.File;
let FileInputStream = java.io.FileInputStream;
let FileOutputStream = java.io.FileOutputStream;
let InputStreamReader = java.io.InputStreamReader;
let BufferedReader = java.io.BufferedReader;
let BufferedInputStream = java.io.BufferedInputStream;
let BufferedOutputStream = java.io.BufferedOutputStream;
let CheckedOutputStream = java.util.zip.CheckedOutputStream;
let ZipOutputStream = java.util.zip.ZipOutputStream;
let ZipEntry = java.util.zip.ZipEntry;
let ZipFile = java.util.zip.ZipFile;
let CRC32 = java.util.zip.CRC32;
let URL = java.net.URL;
let Request = Packages.okhttp3.Request;
let HttpURLConnection = java.net.HttpURLConnection;

!function () {
    'use strict';

    let $$cvt = function () {
        /** @typedef {number|string} $$cvt$src */
        /** @typedef {string} $$cvt$init_unit */
        /**
         * @typedef {{
         *     step?: number, potential_step?: number,
         *     space?: string|boolean, fixed?: number,
         *     units?: (number|number[]|string)[], init_unit?: 'string',
         * }} $$cvt$options
         */
        /**
         * @param {$$cvt$src} src
         * @param {$$cvt$options} [options]
         * @example
         * console.log($_cvt(24, {
         *     units: ['entries', 12, 'dozens'], space: true,
         * })); // '2 dozens'
         * @returns {string}
         */
        let $_cvt = function (src, options) {
            let {
                step: _step, potential_step: _pot_step,
                units: _units_ori, init_unit: _init_unit,
                space: _space, fixed: _fixed,
            } = options || {};

            let _src = typeof src === 'string'
                ? Number(src.split(/,\s*/).join(''))
                : Number(src);

            let _units = [];
            _units_ori.forEach((o) => {
                if (typeof o === 'string' && o.match(/\w+\|\w+/)) {
                    o.split('|').reverse().forEach((u, i) => {
                        i ? _units.push(1, u) : _units.push(u);
                    });
                } else {
                    _units.push(o);
                }
            });

            let unit_map = {};
            unit_map[_units[0]] = [1, 1];

            let _accu_step = 1;
            let _tmp_pot_val;

            for (let i = 1, l = _units.length; i < l; i += 1) {
                _tmp_pot_val = _pot_step ? _accu_step : 0;
                let _unit = _units[i];

                if (typeof _unit === 'number') {
                    _tmp_pot_val = _accu_step * (_pot_step || _unit);
                    _accu_step *= _unit;
                    _unit = _units[++i];
                } else if (Array.isArray(_unit)) {
                    let _steps = _unit.sort((a, b) => a < b ? 1 : -1);
                    _tmp_pot_val = _accu_step * _steps[1];
                    _accu_step *= _steps[0];
                    _unit = _units[++i];
                } else {
                    _tmp_pot_val = _accu_step * (_pot_step || _step);
                    _accu_step *= _step;
                }
                _unit.split('|').forEach(u => unit_map[u] = _tmp_pot_val
                    ? [_accu_step, _tmp_pot_val] : [_accu_step, _accu_step]);
            }

            let _init_u = _init_unit || _units[0];
            if (~_units.indexOf(_init_u)) {
                _src *= unit_map[_init_u][0];
            }

            let _result = '';
            Object.keys(unit_map).reverse().some((u) => {
                let [_unit_val, _pot_val] = unit_map[u];
                if (_src >= _pot_val) {
                    let res = Number((_src / _unit_val).toFixed(12));
                    if (typeof _fixed === 'number') {
                        res = ~_fixed ? res.toFixed(_fixed) : res;
                    } else if (res * 1e3 >> 0 !== res * 1e3) {
                        res = res.toFixed(2);
                    }
                    let _space_str = _space ? _space === true ? ' ' : _space : '';
                    return _result = Number(res) + _space_str + u;
                }
            });
            return _result;
        };

        /**
         * Auto-conversion between different digital storage units (smaller to greater)
         * @param {$$cvt$src} src
         * @param {$$cvt$init_unit|'B'|'KB'|'MB'|'GB'|'TB'|'PB'|'EB'|'ZB'|'YB'} [init_unit='B']
         * @param {$$cvt$options} [options]
         * @example
         * console.log($_cvt.bytes(1024)); // '1KB'
         * console.log($_cvt.bytes(1024, 'B')); // '1KB'
         * console.log($_cvt.bytes(1024, 'MB')); // '1GB'
         * console.log($_cvt.bytes(1047285512)); // '998.77MB'
         * console.log($_cvt.bytes(1067285512)); // '0.99GB'
         * console.log($_cvt.bytes(1516171819)); // '1.41GB'
         * @returns {string}
         */
        $_cvt.bytes = function (src, init_unit, options) {
            return _parse(src, init_unit, options, {
                step: 1024, potential_step: 1000,
                units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            });
        };

        /**
         * @param {Date|string|number} [src=Date()]
         * @param {'d'|'dd'|'h'|'h:m'|'h:m:s'|'h:m:ss'|'h:mm'|'h:mm:s'|'h:mm:ss'|'hh'|'hh:m'|'hh:m:s'|'hh:m:ss'|'hh:mm'|'hh:mm:s'|'hh:mm:ss'|'M'|'m'|'M/d h:m'|'M/d h:m:s'|'M/d h:m:ss'|'M/d h:mm'|'M/d h:mm:s'|'M/d h:mm:ss'|'M/d hh:m'|'M/d hh:m:s'|'M/d hh:m:ss'|'M/d hh:mm'|'M/d hh:mm:s'|'M/d hh:mm:ss'|'M/d'|'M/dd h:m'|'M/dd h:m:s'|'M/dd h:m:ss'|'M/dd h:mm'|'M/dd h:mm:s'|'M/dd h:mm:ss'|'M/dd hh:m'|'M/dd hh:m:s'|'M/dd hh:m:ss'|'M/dd hh:mm'|'M/dd hh:mm:s'|'M/dd hh:mm:ss'|'M/dd'|'m:s'|'m:ss'|'MM'|'mm'|'MM/d h:m'|'MM/d h:m:s'|'MM/d h:m:ss'|'MM/d h:mm'|'MM/d h:mm:s'|'MM/d h:mm:ss'|'MM/d hh:m'|'MM/d hh:m:s'|'MM/d hh:m:ss'|'MM/d hh:mm'|'MM/d hh:mm:s'|'MM/d hh:mm:ss'|'MM/d'|'MM/dd h:m'|'MM/dd h:m:s'|'MM/dd h:m:ss'|'MM/dd h:mm'|'MM/dd h:mm:s'|'MM/dd h:mm:ss'|'MM/dd hh:m'|'MM/dd hh:m:s'|'MM/dd hh:m:ss'|'MM/dd hh:mm'|'MM/dd hh:mm:s'|'MM/dd hh:mm:ss'|'MM/dd'|'mm:s'|'mm:ss'|'s'|'ss'|'yy'|'yy/M'|'yy/M/d h:m'|'yy/M/d h:m:s'|'yy/M/d h:m:ss'|'yy/M/d h:mm'|'yy/M/d h:mm:s'|'yy/M/d h:mm:ss'|'yy/M/d hh:m'|'yy/M/d hh:m:s'|'yy/M/d hh:m:ss'|'yy/M/d hh:mm'|'yy/M/d hh:mm:s'|'yy/M/d hh:mm:ss'|'yy/M/d'|'yy/M/dd h:m'|'yy/M/dd h:m:s'|'yy/M/dd h:m:ss'|'yy/M/dd h:mm'|'yy/M/dd h:mm:s'|'yy/M/dd h:mm:ss'|'yy/M/dd hh:m'|'yy/M/dd hh:m:s'|'yy/M/dd hh:m:ss'|'yy/M/dd hh:mm'|'yy/M/dd hh:mm:s'|'yy/M/dd hh:mm:ss'|'yy/M/dd'|'yy/MM'|'yy/MM/d h:m'|'yy/MM/d h:m:s'|'yy/MM/d h:m:ss'|'yy/MM/d h:mm'|'yy/MM/d h:mm:s'|'yy/MM/d h:mm:ss'|'yy/MM/d hh:m'|'yy/MM/d hh:m:s'|'yy/MM/d hh:m:ss'|'yy/MM/d hh:mm'|'yy/MM/d hh:mm:s'|'yy/MM/d hh:mm:ss'|'yy/MM/d'|'yy/MM/dd h:m'|'yy/MM/dd h:m:s'|'yy/MM/dd h:m:ss'|'yy/MM/dd h:mm'|'yy/MM/dd h:mm:s'|'yy/MM/dd h:mm:ss'|'yy/MM/dd hh:m'|'yy/MM/dd hh:m:s'|'yy/MM/dd hh:m:ss'|'yy/MM/dd hh:mm'|'yy/MM/dd hh:mm:s'|'yy/MM/dd hh:mm:ss'|'yy/MM/dd'|'yyyy'|'yyyy/M'|'yyyy/M/d h:m'|'yyyy/M/d h:m:s'|'yyyy/M/d h:m:ss'|'yyyy/M/d h:mm'|'yyyy/M/d h:mm:s'|'yyyy/M/d h:mm:ss'|'yyyy/M/d hh:m'|'yyyy/M/d hh:m:s'|'yyyy/M/d hh:m:ss'|'yyyy/M/d hh:mm'|'yyyy/M/d hh:mm:s'|'yyyy/M/d hh:mm:ss'|'yyyy/M/d'|'yyyy/M/dd h:m'|'yyyy/M/dd h:m:s'|'yyyy/M/dd h:m:ss'|'yyyy/M/dd h:mm'|'yyyy/M/dd h:mm:s'|'yyyy/M/dd h:mm:ss'|'yyyy/M/dd hh:m'|'yyyy/M/dd hh:m:s'|'yyyy/M/dd hh:m:ss'|'yyyy/M/dd hh:mm'|'yyyy/M/dd hh:mm:s'|'yyyy/M/dd hh:mm:ss'|'yyyy/M/dd'|'yyyy/MM'|'yyyy/MM/d h:m'|'yyyy/MM/d h:m:s'|'yyyy/MM/d h:m:ss'|'yyyy/MM/d h:mm'|'yyyy/MM/d h:mm:s'|'yyyy/MM/d h:mm:ss'|'yyyy/MM/d hh:m'|'yyyy/MM/d hh:m:s'|'yyyy/MM/d hh:m:ss'|'yyyy/MM/d hh:mm'|'yyyy/MM/d hh:mm:s'|'yyyy/MM/d hh:mm:ss'|'yyyy/MM/d'|'yyyy/MM/dd h:m'|'yyyy/MM/dd h:m:s'|'yyyy/MM/dd h:m:ss'|'yyyy/MM/dd h:mm'|'yyyy/MM/dd h:mm:s'|'yyyy/MM/dd h:mm:ss'|'yyyy/MM/dd hh:m'|'yyyy/MM/dd hh:m:s'|'yyyy/MM/dd hh:m:ss'|'yyyy/MM/dd hh:mm'|'yyyy/MM/dd hh:mm:s'|'yyyy/MM/dd hh:mm:ss'|'yyyy/MM/dd'|string} [format='yyyy/MM/dd hh:mm:ss']
         */
        $_cvt.date = function (src, format) {
            let _pad = n => ('0' + n).slice(-2);
            let _date = _parseDate(src || new Date());
            let _yyyy = _date.getFullYear();
            let _yy = _yyyy.toString().slice(-2);
            let _M = _date.getMonth() + 1;
            let _MM = _pad(_M);
            let _d = _date.getDate();
            let _dd = _pad(_d);
            let _h = _date.getHours();
            let _hh = _pad(_h);
            let _m = _date.getMinutes();
            let _mm = _pad(_m);
            let _s = _date.getSeconds();
            let _ss = _pad(_s);

            let _units = {
                yyyy: _yyyy, yy: _yy,
                MM: _MM, M: _M,
                dd: _dd, d: _d,
                hh: _hh, h: _h,
                mm: _mm, m: _m,
                ss: _ss, s: _s,
            };

            return _parseFormat(format || 'yyyy/MM/dd hh:mm:ss');

            // tool function(s) //

            function _parseDate(t) {
                if (t instanceof Date) {
                    return t;
                }
                if (typeof t === 'number') {
                    return new Date(t);
                }
                if (typeof t === 'string') {
                    if (t.match(/^\d+$/)) {
                        if (t.length === 8) {
                            // take as date
                            // like '20110523' -> '2011/05/23 00:00:00'
                            t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                return i > 1 ? '/' + s : s;
                            }).join('');
                        } else if (t.length === 12) {
                            // take as short year and full time
                            // like '110523163208' -> '2011/05/23 16:32:08'
                            t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                return i === 0
                                    ? new Date().getFullYear().toString().slice(0, 2) + s
                                    : i < 3 ? '/' + s : i === 3 ? ' ' + s : i < 6 ? ':' + s : s;
                            }).join('');
                        } else if (t.length === 14) {
                            // take as full date and full time
                            // like '20110523163208' -> '2011/05/23 16:32:08'
                            t = t.replace(/\d{2}/g, '$&%').split('%').slice(0, -1).map((s, i) => {
                                return i > 1 && i < 4
                                    ? '/' + s : i === 4
                                        ? ' ' + s : i > 4 && i < 7
                                            ? ':' + s : s;
                            }).join('');
                        }
                    }
                    let _date = new Date(t);
                    if (_date.toString() === 'Invalid Date') {
                        throw Error('Invalid Date');
                    }
                    return _date;
                }
                return new Date();
            }

            function _parseFormat(str) {
                let _str = str.toString();
                let _res = '';

                while (_str.length) {
                    let _max = 4;
                    while (_max) {
                        let _unit = _str.slice(0, _max);
                        if (_unit in _units) {
                            _res += _units[_unit];
                            _str = _str.slice(_max);
                            break;
                        }
                        _max -= 1;
                    }
                    if (!_max) {
                        _res += _str[0];
                        _str = _str.slice(1);
                    }
                }

                return _res;
            }
        };

        return $_cvt;

        // tool function(s) //

        function _parse(src, init_unit, options, presets) {
            let _init = init_unit === undefined ? {} : {init_unit: init_unit};
            return $_cvt(src, Object.assign(_init, presets, options));
        }
    }();

    let appx = {
        _project_structure: [
            {name: '/documents'},
            {name: '/modules', necessary: true},
            {name: '/tools'},
            {name: 'ant-forest-launcher.js', necessary: true},
            {name: 'ant-forest-settings.js', necessary: true},
            {name: '.gitignore'},
            {name: 'jsconfig.json'},
            {name: 'project.json', necessary: true},
            {name: 'LICENSE'},
            {name: 'README.md'},
        ],
        _project_step: {
            download: '下载数据包',
            decompress: '解压缩',
            backup: '备份本地项目',
            files_check: '检查文件',
            files_update: '项目文件替换',
            files_ready: '项目文件就绪',
            finish_deploy: '清理并完成部署',
            finish_restore: '清理并完成项目恢复',
        },
        /**
         * @async
         * @param {
         *     GithubReleasesResponseListItem|
         *     GithubReleasesResponseExtendedListItem|
         *     string|'newest'|'newest_cared'|'latest'|'latest_cared'
         * } version
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function():*} [callback.onDeployStart]
         * @param {function(value:{target_path:string}=,d:BuildFlowExtendedJsDialog=):*} [callback.onSuccess]
         * @param {function(value:{target_path:string}=,d:BuildFlowExtendedJsDialog=):*} [callback.onDeploySuccess]
         * @param {function(value:*=,d:BuildFlowExtendedJsDialog=):*} [callback.onFailure]
         * @param {function(value:*=,d:BuildFlowExtendedJsDialog=):*} [callback.onDeployFailure]
         * @param {Object} [options]
         * @param {boolean} [options.is_hide_title_version]
         * @param {DialogsxButtonText} [options.on_interrupt_btn_text='B']
         * @param {boolean} [options.local_project_path]
         * @param {string} [options.success_title]
         * @example
         * appx.deployProject('latest');
         */
        deployProject(version, callback, options) {
            let _appx = this;
            let _opt = options || {};

            let _cbk = callback || {};
            let _onStart = _cbk.onDeployStart || _cbk.onStart || (r => r);
            let _onSuccess = _cbk.onDeploySuccess || _cbk.onSuccess || (r => r);
            let _onFailure = _cbk.onDeployFailure || _cbk.onFailure || console.error;

            if (version === undefined || version === null) {
                throw Error('A version for appx.deployProject() must be defined');
            }
            if (typeof version === 'string') {
                version = _getVersionByTag(version);
                if (!version) {
                    if (global._$_get_proj_releases_interrupted) {
                        delete global._$_get_proj_releases_interrupted;
                        return;
                    } else {
                        throw Error('Cannot parse version tag for appx.deployProject()');
                    }
                }
            }
            if (typeof version !== 'object') {
                throw Error('Cannot parse version for appx.deployProject()');
            }

            // maybe 'tar' will be supported some day
            let _file_ext = 'zip';
            // like: 'https://api.github.com/.../zipball/v2.0.4'
            let _url = version[_file_ext + 'ball_url'];
            // like: 'v2.0.4'
            let _file_name = _url.slice(_url.lastIndexOf('/') + 1);
            // like: 'v2.0.4.zip'
            let _file_full_name = _file_name + '.' + _file_ext;
            // like: '/sdcard/.local/bak/ant-forest'
            let _bak_path = (() => {
                let _sep = File.separator;
                let _path = files.getSdcardPath() + '/.local/bak/ant-forest';
                files.exists(_path) || files.createWithDirs(_path + _sep);
                return new File(_path).getAbsolutePath();
            })();
            // like: '/sdcard/.local/bak/ant-forest/v2.0.4.zip'
            let _full_path = _bak_path + File.separator + _file_full_name;

            let _cont_len = -1;
            httpx.getContentLength(_url, function (value) {
                _diag_dn.setStepDesc(1, '  [ ' + $$cvt.bytes(_cont_len = value, 'B', {
                    fixed: 1, space: true,
                }) + ' ]', true);
            }, {timeout: 15e3, concurrence: 15});

            let _tt_suff = _opt.is_hide_title_version ? '' : ' ' + version.version_name;
            let _steps = this._project_step;
            let _diag_dn = dialogsx.buildFlow({
                title: '正在部署项目' + _tt_suff,
                success_title: _opt.success_title || '部署完成',
                on_interrupt_btn_text: _opt.on_interrupt_btn_text || 'B',
                show_min_max: true,
                onStart: (v, d) => {
                    _onStart();
                    dialogsx.setProgressColorTheme(d, 'download');
                },
                onSuccess: (o, d) => _onSuccess(o, d),
                onFailure: (e, d) => {
                    _onFailure(e, d);
                    d.setFailureData(e);
                },
                steps: [{
                    desc: _steps.download,
                    action: (v, d) => new Promise((resolve, reject) => {
                        httpx.okhttp3Request(_url, _full_path, {
                            onStart() {
                                let _l = _cont_len / 1024;
                                let _p = _l < 0 ? '' : '0KB/' + _l.toFixed(1) + 'KB';
                                dialogsx.setProgressNumberFormat(d, _p);
                            },
                            onDownloadProgress(o) {
                                o.total = Math.max(o.total, _cont_len);
                                let _t = o.total / 1024;
                                let _p = o.processed / 1024;
                                dialogsx.setProgressNumberFormat(d, '%.1fKB/%.1fKB', [_p, _t]);
                                d.setProgressData(o);
                            },
                            onDownloadSuccess(r) {
                                resolve(r);
                                dialogsx.clearProgressNumberFormat(d);
                            },
                            onDownloadFailure(e) {
                                reject(e);
                            },
                        }, {is_async: true});
                    }),
                }, {
                    desc: _steps.decompress,
                    action: (v, d) => new Promise((resolve, reject) => {
                        filesx.unzip(v.downloaded_path, null, {
                            onUnzipProgress: o => d.setProgressData(o),
                            onUnzipSuccess(r) {
                                let _path = r.unzipped_path;
                                if (!_appx.isProjectLike(_path)) {
                                    _path += File.separator + files.listDir(_path)[0];
                                }
                                if (!_appx.isProjectLike(_path)) {
                                    reject('Cannot locate project path in unzipped files');
                                }
                                resolve(Object.assign(v, {
                                    unzipped_files_path: r.unzipped_path,
                                    unzipped_proj_path: _path,
                                }));
                            },
                            onUnzipFailure: e => reject(e),
                        }, {to_archive_name_folder: true, is_delete_source: true});
                    }),
                }, {
                    desc: _steps.backup,
                    action: (v, d) => new Promise((resolve, reject) => {
                        if (!_appx.getProjectLocalPath() || !_appx.getProjectLocalVerName()) {
                            d.setStepDesc(3, '  [ 跳过 ]', true);
                            return resolve(v);
                        }
                        _appx.backupProject({
                            onBackupProgress: o => d.setProgressData(o),
                            onBackupSuccess: r => resolve(Object.assign(v, {backup: r})),
                            onBackupFailure: e => reject(e),
                        }, {remark: '版本升级前的自动备份', is_save_storage: true});
                    }),
                }, {
                    desc: _steps.files_update,
                    action: (v, d) => new Promise((resolve, reject) => {
                        let _tar = _appx.getProjectLocalPath(true);
                        filesx.copy(v.unzipped_proj_path, _tar, {is_unbundled: true}, {
                            onCopyProgress: o => d.setProgressData(o),
                            onCopySuccess: () => resolve(Object.assign(v, {tar_proj_path: _tar})),
                            onCopyFailure: e => reject(e),
                        });
                    }),
                }, {
                    desc: _steps.finish_deploy,
                    action: (v, d) => new Promise((resolve, reject) => {
                        filesx.deleteByList(v.unzipped_files_path, {is_async: true}, {
                            onDeleteProgress: o => d.setProgressData(o),
                            onDeleteSuccess: () => resolve({target_path: v.tar_proj_path}),
                            onDeleteFailure: e => reject(e),
                        });
                    }),
                }],
            }).act();

            // tool function(s) //

            function _getVersionByTag(tag) {
                if (tag.match(/^(newest|latest)$/)) {
                    return _appx.getProjectNewestRelease({show_progress_dialog: true});
                }
                if (tag.match(/^(newest|latest)_cared$/)) {
                    return _appx.getProjectNewestReleaseCared({show_progress_dialog: true});
                }
                let _ver = null;
                _appx.getProjectReleases({
                    per_page: 100, show_progress_dialog: true,
                }).some(o => (_ver = o).version_name === tag);
                return _ver;
            }
        },
        /**
         * @example
         * console.log(appx.getProjectLocal().version_name); // like: 'v2.0.2 Alpha2'
         * @returns {{version_name: string, version_code: number, main: string, path: string}}
         */
        getProjectLocal() {
            let _ver_name = '';
            let _ver_code = -1;
            let _path = this.getProjectLocalPath();
            if (!_path) {
                throw Error('Cannot locate project path for appx.getProjectLocal()');
            }
            let _sep = File.separator;
            let _json_name = 'project.json';
            let _json_path = _path + _sep + _json_name;
            let _main_name = 'ant-forest-launcher.js';
            let _main_path = _path + _sep + _main_name;
            let _res = {
                version_name: _ver_name,
                version_code: _ver_code,
                main: _main_path,
                path: _path,
            };
            if (files.exists(_json_path)) {
                try {
                    let _o = JSON.parse(filesx.read(_json_path));
                    return Object.assign(_res, {
                        version_name: 'v' + _o.versionName,
                        version_code: Number(_o.versionCode),
                        main: _o.main,
                    });
                } catch (e) {
                    console.warn(e.message);
                    console.warn(e.stack);
                }
            }
            if (files.exists(_main_path)) {
                try {
                    return Object.assign(_res, {
                        version_name: 'v' + filesx.read(_main_path)
                            .match(/version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/)[0].slice(8),
                    });
                } catch (e) {
                    console.warn(e.message);
                    console.warn(e.stack);
                }
            }
            console.warn('Both ' + _json_name + ' and ' + _main_name + ' do not exist');
            return _res;
        },
        /**
         * @param {Object} [options]
         * @param {number} [options.max_items=Infinity]
         * @param {number} [options.per_page=30]
         * @param {string} [options.min_version_name='v0.0.0']
         * @param {boolean} [options.no_extend=false]
         * @param {boolean} [options.show_progress_dialog=false]
         * @param {function(items:GithubReleasesResponseList|GithubReleasesResponseExtendedList)} [callback]
         * @returns {GithubReleasesResponseList|GithubReleasesResponseExtendedList}
         */
        getProjectReleases(options, callback) {
            if (typeof callback !== 'function') {
                return _getReleases();
            }
            threadsx.start(function () {
                callback(_getReleases());
            });

            // tool function(s) //

            function _getReleases() {
                /** @type {GithubReleasesResponseList} */
                let _releases = [];
                let _opt = options || {};

                /** @type {JsDialog$} */
                let _p_diag = null;
                delete global._$_get_proj_releases_interrupted;
                if (_opt.show_progress_dialog) {
                    dialogsx.setProgressColorTheme(_p_diag = dialogsx.builds([
                        null, '正在获取版本信息...', 0, 0, 'I', 1,
                    ], {
                        progress: {max: -1, showMinMax: false, horizontal: true},
                        disable_back: true,
                    }).on('positive', (d) => {
                        d.dismiss();
                        global._$_get_proj_releases_interrupted = true;
                    }).show(), 'indeterminate');
                }

                let _max_items = _opt.max_items || Infinity;
                let _cur_page = 1;
                let _per_page = _opt.per_page || 30; // 100
                let _min_ver = _opt.min_version_name || 'v0.0.0'; // 'v2.0.1'
                let _max = 3;
                while (_max--) {
                    try {
                        let _items = http.get('https://api.github.com/repos/' +
                            'SuperMonster003/Ant-Forest/releases' +
                            '?per_page=' + _per_page + '&page=' + _cur_page++)
                            .body.json().filter(o => o.tag_name >= _min_ver);
                        if (global._$_get_proj_releases_interrupted) {
                            return [];
                        }
                        _releases = _releases.concat(_items);
                        if (_items.length < _per_page || _releases.length >= _max_items) {
                            break;
                        }
                    } catch (e) {
                        sleep(120 + Math.random() * 240);
                    }
                }
                if (_max < 0) {
                    if (_p_diag) {
                        _p_diag.dismiss();
                        dialogsx.builds([
                            '失败', '版本信息获取失败', 0, 0, 'X', 1,
                        ]).on('positive', d => d.dismiss()).show();
                    }
                    return [];
                }
                _releases.splice(_max_items);
                if (_p_diag) {
                    _p_diag.dismiss();
                    _p_diag = null;
                }
                return _opt.no_extend ? _releases : _releases.map(_extend);

                // tool function(s) //

                /**
                 * @param {GithubReleasesResponseListItem} o
                 * @returns {GithubReleasesResponseExtendedListItem}
                 */
                function _extend(o) {
                    o.version_name = o.tag_name;

                    o.brief_info_str = [
                        {key: 'name', desc: '标题'},
                        {key: 'tag_name', desc: '标签'},
                        {key: 'published_at', desc: '发布', cvt: $$cvt.date},
                        {key: 'body', desc: '内容描述'},
                    ].map((info) => {
                        let _k = info.key;
                        let _v = o[_k];
                        if (_v) {
                            if (_k === 'body') {
                                _v = '\n' + _v;
                            }
                            if (typeof info.cvt === 'function') {
                                _v = info.cvt.call(null, _v);
                            }
                            return info.desc + ': ' + _v;
                        }
                    }).filter(s => !!s).join('\n\n');

                    return o;
                }
            }
        },
        /**
         * @param {'1.x'|'2.x'|string|number} ver
         * @param {Object} [options]
         * @param {boolean} [options.is_show_dialog=false]
         * @param {boolean} [options.is_joint=false]
         * @param {boolean} [options.no_earlier=false]
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function(value:{ver:string,log:string}[]|string):*} [callback.onSuccess]
         * @param {function(value:*=):*} [callback.onFailure]
         * @returns {{ver:string,log:string}[]|string|void}
         */
        getProjectChangelog(ver, options, callback) {
            let _appx = this;
            let _ver_num = Math.trunc(Number(ver.toString().match(/\d+/)[0]));
            let _opt = options || {};

            let _cbk = callback || {};
            let _onStart = _cbk.onStart || (r => r);
            let _onSuccess = _cbk.onSuccess || (r => r);
            let _onFailure = _cbk.onFailure || console.error;

            /** @type {JsDialog$} */
            let _diag = null;

            if (!_opt.is_show_dialog) {
                return _getLog();
            }

            let _neu_act = null;
            let _neu_cbk = (r => r);
            if (!_opt.no_earlier && _ver_num > 1) {
                _neu_act = '更早期的历史';
                _neu_cbk = _showEarlier;
            }
            _diag = dialogsx
                .builds([
                    '历史更新', '处理中...', [_neu_act, 'hint'], '\xa0', 'B', 1,
                ])
                .on('neutral', _neu_cbk)
                .on('positive', dialogsx.dismiss)
                .show();

            threadsx.start(_getLog);

            // tool function(s) //

            function _getLog() {
                _onStart();

                let _cont = _getContentByBlob();
                if (!_cont) {
                    let _msg = '获取历史更新信息失败';
                    _diag ? _diag.setContent(_msg) : _onFailure(_msg);
                    return _opt.is_joint ? '' : [];
                }

                let _rex_ver_name = /# v\d+\.\d+\.\d+.*/g;
                let _rex_remove = new RegExp(
                    /^(\s*\n\s*)+/.source // starts with multi blank lines
                    + '|' + /(# *){3,}/.source // over three hash symbols
                    + '|' + / +(?=\s+)/.source // ends with blank spaces in a single line
                    + '|' + /.*~~.*/.source // markdown strikethrough
                    + '|' + /.*`灵感`.*/.source // lines with inspiration label
                    + '|' + /\(http.+?\)/.source // URL content (not the whole line)
                    + '|' + /\[\/\/]:.+\(\n*.+?\n*\)/.source // markdown comments
                    + '|' + /\s*<br>/.source // line breaks
                    , 'g');
                let _names = _cont.match(_rex_ver_name);
                let _infos = _cont.split(_rex_ver_name);
                let _res = _names.map((n, i) => ({
                    ver: 'v' + n.split('v')[1],
                    log: _infos[i + 1]
                        .replace(/ ?_\[`(issue |pr )?#(\d+)`](\(http.+?\))?_ ?/g, '[$2]')
                        .replace(_rex_remove, '')
                        .replace(/(\[\d+])+/g, ($) => (
                            ' ' + $.split(/\[]/).join(',').replace(/\d+/g, '#$&')
                        ))
                        .replace(/(\s*\n\s*){2,}/g, '\n'),
                }));

                _onSuccess(_res);

                if (!_diag && !_opt.is_joint) {
                    return _res;
                }
                let _res_str = _res.map(o => o.ver + '\n' + o.log).join('\n').slice(0, -1);
                if (_diag) {
                    _diag.setContent(_res_str);
                }
                if (_opt.is_joint) {
                    return _res_str;
                }

                // tool function(s) //

                function _getContentByBlob() {
                    let _max = 5;
                    while (_max--) {
                        try {
                            return _getRespByHttpCxn('https://github.com/SuperMonster003/' +
                                'Ant-Forest/blob/master/documents/CHANGELOG-' + _ver_num + '.md')
                                .match(/版本历史[^]+article/)[0]
                                .replace(/<path .+?\/path>/g, '')
                                .replace(/<a .+?(<code>((issue |pr )?#\d+)<\/code>)?<\/a>/g,
                                    ($0, $1, $2) => $2 ? '_[`' + $2 + '`]_' : '')
                                .replace(/<svg .+?\/svg>/g, '')
                                .replace(/<link>.+/g, '')
                                .replace(/<h1>/g, '# ')
                                .replace(/<h6>/g, '###### ')
                                .replace(/<\/?(li|ul|del|em|h\d)>/g, '')
                                .replace(/<code>/g, '* `')
                                .replace(/<\/code>/g, '`')
                                .replace(/\s*<\/articl.*/, '');
                        } catch (e) {
                            // android.os.NetworkOnMainThreadException
                        }
                    }
                    return null;

                    // tool function(s) //

                    function _getRespByHttpCxn(url) {
                        let _url = new URL(url);
                        let _cxn = _url.openConnection();
                        _cxn.setRequestMethod('GET');
                        _cxn.setConnectTimeout(15e3);
                        _cxn.setReadTimeout(15e3);
                        _cxn.connect();

                        let _code = _cxn.getResponseCode();
                        if (_code !== HttpURLConnection.HTTP_OK) {
                            if (!_max) {
                                _onFailure('请求失败: ' + _code);
                            }
                            try {
                                _cxn.disconnect();
                            } catch (e) {
                                // nothing to do here
                            }
                            return null;
                        }
                        let _is = _cxn.getInputStream();
                        let _br = new BufferedReader(new InputStreamReader(_is));
                        let _sb = new StringBuilder();
                        let _line = null;
                        let _readLine = () => _line = _br.readLine();
                        while (_readLine() !== null) {
                            _sb.append(_line).append('\r\n');
                        }
                        [_cxn, _br, _is].forEach((stream) => {
                            try {
                                stream.close();
                            } catch (e) {
                                // nothing to do here
                            }
                        });
                        return _sb.toString();
                    }
                }
            }

            function _showEarlier() {
                dialogsx
                    .builds(['选择一个历史版本记录', '', 0, 0, 'B', 1], {
                        items: (() => {
                            let _items = [];
                            for (let i = 1; i < _ver_num; i += 1) {
                                _items.push('v' + i + '.x');
                            }
                            return _items;
                        })(),
                    })
                    .on('positive', dialogsx.dismiss)
                    .on('item_select', (idx) => {
                        _appx.getProjectChangelog(idx + 1, {
                            is_show_dialog: true, no_earlier: true,
                        });
                    })
                    .show();
            }
        },
        /**
         * Returns if a directory is an Ant-Forest project with a considerable possibility
         * @param {string} dir
         * @param {boolean} [is_throw_allowed=false]
         * @returns {boolean}
         */
        isProjectLike(dir, is_throw_allowed) {
            let _path = files.path(dir);

            if (!files.exists(_path)) {
                if (is_throw_allowed) {
                    throw Error('Passed "dir" is not exist');
                }
                return false;
            }
            if (!files.isDir(_path)) {
                if (is_throw_allowed) {
                    throw Error('Passed "dir" is not a directory');
                }
                return false;
            }

            let _files = files.listDir(_path = new File(_path).getAbsolutePath());

            return this._project_structure.filter(o => o.necessary).map((o) => (
                o.name[0] === '/' ? {name: o.name.slice(1), is_dir: true} : {name: o.name}
            )).every((o) => {
                if (~_files.indexOf(o.name)) {
                    let _cA = o.is_dir;
                    let _cB = files.isDir(_path + File.separator + o.name);
                    return _cA && _cB || !_cA && !_cB;
                }
            });
        },
        /**
         * @returns {string}
         */
        getProjectLocalPath(is_with_creation) {
            let _cwd = files.cwd();
            if (this.isProjectLike(_cwd)) {
                return _cwd;
            }
            _cwd = new File(_cwd).getParent();
            if (this.isProjectLike(_cwd)) {
                return _cwd;
            }
            let _aj_wd = filesx.getScriptDirPath();
            let _sep = File.separator;
            let _proj_def_n = 'Ant-Forest-003';
            let _root_proj_path = _aj_wd + _sep + _proj_def_n;
            if (files.isDir(_root_proj_path)) {
                return _root_proj_path;
            }
            if (is_with_creation) {
                files.createWithDirs(_root_proj_path + _sep);
                return _root_proj_path;
            }
            return '';
        },
        /**
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function():*} [callback.onBackupStart]
         * @param {function(data:{processed:number,total:number},diag:JsDialog$):*} [callback.onProgress]
         * @param {function(data:{processed:number,total:number},diag:JsDialog$):*} [callback.onBackupProgress]
         * @param {function(value:Appx$BackupProject$OnSuccess$Result=):*} [callback.onSuccess]
         * @param {function(value:Appx$BackupProject$OnSuccess$Result=):*} [callback.onBackupSuccess]
         * @param {function(value:*=):*} [callback.onFailure]
         * @param {function(value:*=):*} [callback.onBackupFailure]
         * @param {Object} [options]
         * @param {'cwd'|'current'|string} [options.source_path='cwd']
         * @param {boolean} [options.is_show_dialog=false]
         * @param {boolean} [options.is_save_storage=false]
         * @param {string} [options.remark='手动备份']
         * @returns {boolean|BuildProgressExtendedJsDialog}
         */
        backupProject(callback, options) {
            let _appx = this;
            let _sep = File.separator;
            let _cbk = callback || {};
            let _opt = options || {};

            let _now_ts = Date.now();
            let _local_ver_name = _appx.getProjectLocalVerName();
            let _local_ver_hex = _appx.getVerHex(_local_ver_name);

            let _def_bak_path = (() => {
                let _sep = File.separator;
                let _path = files.getSdcardPath() + '/.local/bak/ant-forest';
                files.exists(_path) || files.createWithDirs(_path + _sep);
                return new File(_path).getAbsolutePath();
            })();
            let _bak_file_name = $$cvt.date(_now_ts, 'yyMMddhhmmss') + '-' + _local_ver_hex + '.zip';
            let _bak_dest_path = _def_bak_path + _sep + _bak_file_name;

            return !_opt.is_show_dialog ? _backup() : dialogsx.buildProgress({
                show_min_max: true,
                title: '正在备份',
                content: '此过程可能需要一些时间',
                success_title: '备份完成',
                onStart: (v, d) => dialogsx.setProgressColorTheme(d, 'backup'),
                action(value, d) {
                    return _backup({
                        onProgress(o) {
                            let _p = o.processed / 1024;
                            let _t = o.total / 1024;
                            dialogsx.setProgressNumberFormat(d, '%.1fKB/%.1fKB', [_p, _t]);
                            d.setProgressData(o);
                        },
                        onSuccess(o) {
                            dialogsx.setContentText(d, '' +
                                '版本: ' + o.version_name + '\n' +
                                '路径: ' + o.path + '\n' +
                                '备注: ' + o.remark);
                        },
                    });
                },
            }).act();

            // tool function(s) //

            function _backup(internal_dialog_callback) {
                let _d_cbk = internal_dialog_callback || {};

                return filesx.zip(_handleSourcePath(), _bak_dest_path, {
                    onZipStart() {
                        if (typeof _d_cbk.onStart === 'function') {
                            _d_cbk.onStart();
                        }
                        let _f = _cbk.onBackupStart || _cbk.onStart;
                        typeof _f === 'function' && _f.call(_cbk);
                    },
                    onZipProgress(o) {
                        if (typeof _d_cbk.onProgress === 'function') {
                            _d_cbk.onProgress(o);
                        }
                        let _f = _cbk.onBackupProgress || _cbk.onProgress;
                        typeof _f === 'function' && _f.call(_cbk, o);
                    },
                    onZipSuccess() {
                        /**
                         * @typedef {{
                         *     path: string,
                         *     timestamp: number,
                         *     version_name: string,
                         *     remark: string,
                         * }} Appx$BackupProject$OnSuccess$Result
                         */
                        let _data = {
                            path: _bak_dest_path,
                            timestamp: _now_ts,
                            version_name: _local_ver_name,
                            remark: _opt.remark || '手动备份',
                        };
                        if (typeof _d_cbk.onSuccess === 'function') {
                            _d_cbk.onSuccess(_data);
                        }
                        let _f = _cbk.onBackupSuccess || _cbk.onSuccess;
                        if (typeof _f === 'function') {
                            _f.call(_cbk, _data);
                        }
                        if (_opt.is_save_storage) {
                            let _af_bak = storagesx.create('af_bak');
                            let _sto_data = _af_bak.get('project', []);
                            _af_bak.put('project', _sto_data.concat(_data));
                        }
                    },
                    onZipFailure(e) {
                        if (typeof _d_cbk.onFailure === 'function') {
                            _d_cbk.onFailure(e);
                        }
                        let _f = _cbk.onBackupFailure || _cbk.onFailure;
                        typeof _f === 'function' && _f.call(_cbk, e);
                    },
                }, {is_exclude_root_folder: true, is_delete_source: true});
            }

            function _handleSourcePath() {
                let _tmp_path = _def_bak_path + _sep + '.' + _now_ts + _sep;
                files.createWithDirs(_tmp_path);

                let _proj_path = _locateProject();
                let _project_structure_names = _appx._project_structure.map(o => o.name.replace(/^\//, ''));
                filesx.copy(_proj_path, _tmp_path, {
                    is_unbundled: true,
                    filter: function (name) {
                        return !!~_project_structure_names.indexOf(name);
                    },
                });

                return _tmp_path;

                // tool function(s) //

                function _locateProject() {
                    let _cwd = _opt.source_path;
                    if (!_cwd || _cwd === 'cwd' || _cwd === 'current') {
                        _cwd = files.cwd();
                    }
                    if (!files.isDir(_cwd)) {
                        throw Error('source_path for appx.backupProject must be a directory');
                    }
                    if (_appx.isProjectLike(_cwd)) {
                        return _cwd;
                    }
                    _cwd = new File(_cwd).getParent();
                    if (_appx.isProjectLike(_cwd)) {
                        return _cwd;
                    }
                    let _aj_wd = filesx.getScriptDirPath();
                    let _sep = File.separator;
                    let _proj_def_n = 'Ant-Forest-003';
                    _cwd = _aj_wd + _sep + _proj_def_n;
                    if (_appx.isProjectLike(_cwd)) {
                        return _cwd;
                    }
                    throw Error('Unable to locate Ant-Forest project folder');
                }
            }
        },
        /**
         * @returns {string}
         */
        getProjectLocalVerName() {
            return this.getProjectLocal().version_name;
        },
        /**
         * @param {string|number|{version_name:string}} ver
         * @param {Object} [options]
         * @param {'number'|'string'|'string_with_prefix'} [options.type='string']
         * @example
         * console.log(appx.getVerHex('v2.0.4 Alpha4')); // '02000404'
         * console.log(appx.getVerHex('v13.120.14 Beta3')); // '0d780e83'
         * console.log(appx.getVerHex('v10.2.0')); // '0a0200ff'
         * console.log(appx.getVerHex('v10.2.0', {type: 'number'})); // 167903487
         * @returns {string|number}
         */
        getVerHex(ver, options) {
            if (typeof ver === 'object') {
                ver = ver.version_name;
            }
            if (!ver) {
                throw Error('A "version" must be defined for appx.getVerHex()');
            }
            let _opt = options || {};
            let _hexStr = s => ('00' + Number(s || 0).toString(16)).slice(-2);
            let _max_a = 0x80;
            let _max_b = 0xff - _max_a;
            let _rex = /^[a-z\s]*(\d+)(?:\.(\d+)(?:\.(\d+)(?:-\d+)?\s*(a(?:lpha)?|b(?:eta)?)?\s*(\d*))?)?$/i;
            let _str = ver.toString().trim().replace(_rex, ($0, $1, $2, $3, $4, $5) => {
                let _$a = [$1, $2, $3].map(s => _hexStr(s)).reduce((a, b) => a + b);
                let _$5 = $5 ? Number($5) : 1;
                let _$4 = 0xff;
                if ($4) {
                    if ($4.match(/a(lpha)?/i)) {
                        if (_$5 > _max_a) {
                            throw Error('Alpha version code cannot be greater than ' + _max_a);
                        }
                        _$4 = 0;
                    } else if ($4.match(/b(eta)?/i)) {
                        if (_$5 >= _max_b) {
                            throw Error('Alpha version code must be smaller than ' + _max_b);
                        }
                        _$4 = _max_a;
                    }
                }
                let _$b = _hexStr(Math.min(_$4 + _$5, 0xff));
                return _$a + _$b;
            });
            let _hex = '0x' + _str;
            return _opt.type === 'number' ? Number(_hex) : _opt.type === 'string_with_prefix' ? _hex : _str;
        },
        /**
         * @param {Object} [options]
         * @param {string} [options.min_version_name='v0.0.0']
         * @param {boolean} [options.no_extend=false]
         * @param {boolean} [options.show_progress_dialog=false]
         * @param {function(item:GithubReleasesResponseExtendedListItem|void)} [callback]
         * @returns {GithubReleasesResponseExtendedListItem|void}
         */
        getProjectNewestRelease(options, callback) {
            let _this = this;
            if (typeof callback !== 'function') {
                return _getRelease();
            }
            threadsx.start(function () {
                callback(_getRelease());
            });

            // tool function(s) //

            /**
             * @returns {GithubReleasesResponseListItem|GithubReleasesResponseExtendedListItem}
             */
            function _getRelease() {
                return _this.getProjectReleases(Object.assign(options || {}, {
                    max_items: 1, per_page: 1,
                }))[0];
            }
        },
    };
    let httpx = {
        /**
         * Substitution of java.net.URLConnection.getContentLengthLong() with concurrency
         * @async
         * @param {string} url
         * @param {function(value:number)} callback
         * @param {Object} [options]
         * @param {number} [options.timeout=10e3]
         * @param {number} [options.concurrence=12]
         * @example
         * httpx.getContentLength('https://api.github.com/repos/'
         *     + 'SuperMonster003/Ant-Forest/zipball/v2.0.1', {
         *     timeout: 20e3,
         *     concurrence: 20,
         * }, function (value) {
         *     console.log(value);
         * });
         */
        getContentLength(url, callback, options) {
            if (typeof url !== 'string') {
                throw Error('url for httpx.getContentLength() is required');
            }
            if (typeof callback !== 'function') {
                throw Error('callback for httpx.getContentLength() is required');
            }
            let _opt = options || {};

            let _tt = _opt.timeout || 10e3;
            let _ts_max = Date.now() + _tt;
            let _sum_bytes = threads.atomic(-1);

            let _executor = function (resolve) {
                let _thd = threadsx.start(function () {
                    try {
                        let _cxn = new URL(url).openConnection();
                        _cxn.setRequestProperty('Accept-Encoding', 'identity');
                        _cxn.setConnectTimeout(_tt);
                        let _len = _cxn.getContentLengthLong();
                        _cxn.disconnect();
                        if (~_len && _sum_bytes.compareAndSet(-1, _len)) {
                            callback(_sum_bytes.get());
                        }
                    } catch (e) {
                        // nothing to do here
                    }
                });
                threadsx.start(function () {
                    while (1) {
                        if (_sum_bytes.get() > 0) {
                            return _thd.interrupt();
                        }
                        if (Date.now() >= _ts_max) {
                            resolve(-1);
                            return _thd.interrupt();
                        }
                        sleep(120);
                    }
                });
            };

            let _max = _opt.concurrence || 12;
            for (let i = 0; i < _max; i += 1) {
                _executor();
            }
        },
        /**
         * @param {string} url
         * @param {string} path
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function(response:okhttp3.Response):*} [callback.onResponse]
         * @param {function(data:{processed:number,total:number}):*} [callback.onDownloadProgress]
         * @param {function(value:{downloaded_path:string}):*} [callback.onDownloadSuccess]
         * @param {function(value:*=):*} [callback.onDownloadFailure]
         * @param {Object} [options]
         * @param {Object} [options.headers]
         * @param {boolean} [options.is_async=true]
         */
        okhttp3Request(url, path, callback, options) {
            let _bs, _fos, _bis, _bos;
            let _path = files.path(path);
            let _cbk = callback || {};
            let _opt = options || {};
            let _onStart = _cbk.onStart || (r => r);
            let _onResponse = _cbk.onResponse || (r => r);
            let _onProgress = _cbk.onDownloadProgress || (r => r);
            let _onSuccess = _cbk.onDownloadSuccess || (r => r);
            let _onFailure = (e) => {
                if (typeof _cbk.onDownloadFailure === 'function') {
                    _cbk.onDownloadFailure(e);
                } else {
                    throw Error(e);
                }
            };
            if (!url) {
                return _onFailure('url for httpx.okhttp3Request() is required');
            }
            _opt.is_async === undefined || _opt.is_async ? threadsx.start(_request) : _request();

            // tool function(s) //

            function _request() {
                try {
                    _onStart();

                    let _builder = new Request.Builder();
                    Object.keys(_opt.headers || {}).forEach((k) => {
                        _builder.addHeader(k, _opt.headers[k]);
                    });
                    let r = new OkHttpClient().newCall(_builder.url(url).get().build()).execute();

                    _onResponse(r);

                    let _buf_len = 4096;
                    let _buf_bytes = JavaArray.newInstance(java.lang.Byte.TYPE, _buf_len);
                    let _read_bytes;
                    let _processed = 0;

                    let _code = r.code();
                    if (_code !== 200) {
                        _onFailure(_code + ' ' + r.message());
                    }
                    _bs = r.body().byteStream();
                    _bis = new BufferedInputStream(_bs);
                    _fos = new FileOutputStream(new File(_path));
                    _bos = new BufferedOutputStream(_fos);

                    let _total = r.body().contentLength();

                    while (~(_read_bytes = _bis.read(_buf_bytes, 0, _buf_len))) {
                        if (global._$_dialog_flow_interrupted) {
                            _clearAndCloseStreams();
                            _onFailure('用户终止');
                        }
                        _fos.write(_buf_bytes, 0, _read_bytes);
                        _processed += _read_bytes;
                        _onProgress({processed: _processed, total: _total});
                    }

                    _clearAndCloseStreams();
                    _onSuccess({downloaded_path: _path});
                } catch (e) {
                    _onFailure('请求失败:\n' + e);
                }
            }

            function _clearAndCloseStreams() {
                [_bos, _fos, _bis, _bs].forEach((stream) => {
                    try {
                        stream && stream.close();
                    } catch (e) {
                        // eg: JavaException: java.io.IOException: Stream closed
                    }
                });
                global._$_dialog_flow_interrupted = false;
            }
        },
    };
    let filesx = {
        /**
         * Substitution of files.copy() with callback
         * @param {string} path_from
         * @param {string} path_to
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function():*} [callback.onCopyStart]
         * @param {function(data:{processed:number,total:number}):*} [callback.onProgress]
         * @param {function(data:{processed:number,total:number}):*} [callback.onCopyProgress]
         * @param {function():*} [callback.onSuccess]
         * @param {function():*} [callback.onCopySuccess]
         * @param {function(value:*=):*} [callback.onFailure]
         * @param {function(value:*=):*} [callback.onCopyFailure]
         * @returns {boolean}
         * @private
         */
        _files$copy(path_from, path_to, callback) {
            let _path_from = files.path(path_from);
            let _path_to = files.path(path_to);
            let _cbk = callback || {};
            let _onStart = _cbk.onCopyStart || _cbk.onStart || (r => r);
            let _onProgress = _cbk.onCopyProgress || _cbk.onProgress || (r => r);
            let _onSuccess = _cbk.onCopySuccess || _cbk.onSuccess || (r => r);
            let _onFailure = _cbk.onCopyFailure || _cbk.onFailure || console.error;

            try {
                return _copyStream(new FileInputStream(_path_from), _path_to);
            } catch (e) {
                _onFailure(e);
                return false;
            }

            // tool function(s) //

            /**
             * @param {java.io.FileInputStream} is
             * @param {string} path
             * @returns {boolean}
             * @private
             */
            function _copyStream(is, path) {
                _onStart();

                files.createWithDirs(path);
                let _i_file = new File(path);
                try {
                    /** @type {java.io.FileOutputStream} */
                    let _fos = new FileOutputStream(_i_file);
                    _write(is, _fos, true);
                    return true;
                } catch (e) {
                    _onFailure(e);
                    return false;
                }

                // tool function(s) //

                /**
                 * @param {java.io.FileInputStream} is
                 * @param {java.io.FileOutputStream} os
                 * @param {boolean} close
                 * @private
                 */
                function _write(is, os, close) {
                    let _buffer = util.java.array('byte', 8192);
                    let _total = new File(_path_from).length();
                    let _processed = 0;
                    try {
                        while (is.available() > 0) {
                            let _num = is.read(_buffer);
                            if (_num > 0) {
                                os.write(_buffer, 0, _num);
                                _onProgress({
                                    processed: _processed += _num, total: _total,
                                });
                            }
                        }
                        if (close) {
                            is.close();
                            os.close();
                        }
                        _onSuccess();
                    } catch (e) {
                        _onFailure(e);
                    }
                }
            }
        },
        /**
         * Returns current Auto.js script dir path
         * @example
         * // like: '/storage/emulated/0/脚本' or '/storage/emulated/0/Scripts'
         * console.log(filesx.getScriptDirPath());
         * @returns {string}
         */
        getScriptDirPath() {
            if (typeof Pref.getScriptDirPath === 'function') {
                return Pref.getScriptDirPath();
            }
            // for Auto.js Pro versions
            return com.stardust.autojs.core['pref']['Pref']['INSTANCE']['getScriptDirPath']();
        },
        /**
         * Unzip a zip file by java.io.FileOutputStream
         * @param {string} input_path
         * @param {string|null} [output_path]
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function():*} [callback.onUnzipStart]
         * @param {function(data:{processed:number,total:number}):*} [callback.onProgress]
         * @param {function(data:{processed:number,total:number}):*} [callback.onUnzipProgress]
         * @param {function(value:{unzipped_path:string}):*} [callback.onSuccess]
         * @param {function(value:{unzipped_path:string}):*} [callback.onUnzipSuccess]
         * @param {function(value:*=):*} [callback.onFailure]
         * @param {function(value:*=):*} [callback.onUnzipFailure]
         * @param {Object} [options]
         * @param {boolean} [options.to_archive_name_folder=false]
         * @param {boolean} [options.is_delete_source=false]
         * @example
         * filesx.unzip('./test.zip', null, {
         *     onStart() {
         *         console.log('Unzipping...');
         *     },
         *     onProgress(o) {
         *         console.log((o.processed / o.total * 100).toFixed(2));
         *     },
         *     onSuccess(result) {
         *         console.log(result.unzipped_path);
         *     },
         *     onFailure(e) {
         *         console.error(e);
         *     },
         * }, {
         *     to_archive_name_folder: true,
         * });
         * @returns {boolean}
         */
        unzip(input_path, output_path, callback, options) {
            let _fos, _bos, _bis;
            let _clearAndCloseStreams = function () {
                global._$_dialog_flow_interrupted = false;
                [_bos, _fos, _bis].forEach((stream) => {
                    try {
                        stream && stream.close();
                    } catch (e) {
                        // eg: JavaException: java.io.IOException: Stream closed
                    }
                });
            };
            let _$filesx = this;
            let _cbk = callback || {};
            let _err = (msg) => {
                let _failure = _cbk.onUnzipFailure || _cbk.onFailure;
                if (typeof _failure === 'function') {
                    _failure(msg);
                } else {
                    toastLog(msg);
                }
                return false;
            };

            let _start = _cbk.onUnzipStart || _cbk.onStart;
            if (typeof _start === 'function') {
                _start();
            }

            let _sep = File.separator;
            let _opt = options || {};

            let _i_path = files.path(input_path);
            if (!files.exists(_i_path)) {
                _i_path += '.zip';
            }
            if (!files.exists(_i_path)) {
                throw Error('解压缩源不存在');
            }

            let _i_file = new File(_i_path);
            let _i_file_size = _i_file.length();
            let _i_file_name = _i_file.getName();
            let _i_file_name_no_ext = _i_file_name.slice(0, _i_file_name.lastIndexOf('.'));

            let _o_path = files.path(output_path);
            if (!_o_path || !files.exists(_o_path)) {
                _o_path = _i_path.slice(0, _i_path.lastIndexOf(_sep));
            }
            if (_opt.to_archive_name_folder) {
                _o_path += _sep + _i_file_name_no_ext;
            }
            files.createWithDirs(_o_path + _sep);

            try {
                let _processed_bytes = 0;
                let _buf_len = 1024;
                let _buf_bytes = util.java.array('byte', _buf_len);
                let _z_i_file = new ZipFile(_i_file);
                let _z_entries = _z_i_file.entries();

                while (_z_entries.hasMoreElements()) {
                    let _entry = _z_entries.nextElement();
                    let _entry_size = _entry.getCompressedSize();
                    let _entry_name = _entry.getName();
                    let _entry_path = files.path(_o_path + _sep + _entry_name);
                    files.createWithDirs(_entry_path);

                    let _entry_file = new File(_entry_path);
                    if (_entry_file.isDirectory()) {
                        continue;
                    }

                    let _read_bytes = -1;

                    _fos = new FileOutputStream(_entry_file);
                    _bos = new BufferedOutputStream(_fos);
                    _bis = new BufferedInputStream(_z_i_file.getInputStream(_entry));

                    while (~(_read_bytes = _bis.read(_buf_bytes, 0, _buf_len))) {
                        if (global._$_dialog_flow_interrupted) {
                            _clearAndCloseStreams();
                            return _err('用户终止');
                        }
                        _fos.write(_buf_bytes, 0, _read_bytes);
                    }

                    let _progress = _cbk.onUnzipProgress || _cbk.onProgress;
                    if (typeof _progress === 'function') {
                        _progress({
                            processed: _processed_bytes += _entry_size, total: _i_file_size,
                        });
                    }
                }

                _clearAndCloseStreams();

                let _success = _cbk.onUnzipSuccess || _cbk.onSuccess;
                if (typeof _success === 'function') {
                    _success({unzipped_path: _o_path});
                }

                if (_opt.is_delete_source) {
                    _$filesx.removeWithDirs(_i_path, {is_async: true});
                }

                return true;
            } catch (e) {
                return _err('解压失败:\n' + e);
            }
        },
        /**
         * @param {string} path
         * @param {Object} [options]
         * @param {boolean} [options.is_async=false]
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function():*} [callback.onRemoveStart]
         * @param {function(data:{processed:number,total:number}):*} [callback.onProgress]
         * @param {function(data:{processed:number,total:number}):*} [callback.onRemoveProgress]
         * @param {function():*} [callback.onSuccess]
         * @param {function():*} [callback.onRemoveSuccess]
         * @param {function(value:*=):*} [callback.onFailure]
         * @param {function(value:*=):*} [callback.onRemoveFailure]
         * @returns {boolean|void}
         */
        removeWithDirs(path, options, callback) {
            let _opt = options || {};
            let _cbk = callback || {};
            let _onStart = _cbk.onRemoveStart || _cbk.onStart || (r => r);
            let _onProgress = _cbk.onRemoveProgress || _cbk.onProgress || (r => r);
            let _onSuccess = _cbk.onRemoveSuccess || _cbk.onSuccess || (r => r);
            let _onFailure = _cbk.onRemoveFailure || _cbk.onFailure || console.error;

            let _processed = 0;
            let _total = 1;

            try {
                return _opt.is_async ? threadsx.start(_parseLv1Depth) : _parseLv1Depth();
            } catch (e) {
                _onFailure(e);
            }

            // tool function(s) //

            function _parseLv1Depth() {
                let _res = true;

                _onStart();

                if (files.isFile(path)) {
                    _res = _remove(path);
                } else if (files.isDir(path)) {
                    let _list = files.listDir(path);
                    let _sep = File.separator;
                    _total = _list.length;
                    _list.forEach((file) => {
                        _res = _remove(path + _sep + file) && _res;
                    });
                    files.remove(path);
                } else {
                    throw Error('Cannot parse path for filesx.removeWithDirs()');
                }

                _res && _onSuccess();
                _res || _onFailure('An error has occurred in files.removeWithDirs()');

                return _res;
            }

            function _remove(p) {
                let _res = files.isDir(p) ? files.removeDir(p) : files.isFile(p) ? files.remove(p) : false;
                _onProgress({progress: _processed += 1, total: _total});
                return _res;
            }
        },
        /**
         * @param {string|java.io.File} file
         * @param {Object} [options]
         * @param {boolean} [options.is_async=false]
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function():*} [callback.onDeleteStart]
         * @param {function(data:{processed:number,total:number}):*} [callback.onProgress]
         * @param {function(data:{processed:number,total:number}):*} [callback.onDeleteProgress]
         * @param {function():*} [callback.onSuccess]
         * @param {function():*} [callback.onDeleteSuccess]
         * @param {function(value:*=):*} [callback.onFailure]
         * @param {function(value:*=):*} [callback.onDeleteFailure]
         * @returns {boolean}
         */
        deleteByList(file, options, callback) {
            let _filesx = this;
            let _opt = options || {};

            let _cbk = callback || {};
            let _onStart = _cbk.onDeleteStart || _cbk.onStart || (r => r);
            let _onProgress = _cbk.onDeleteProgress || _cbk.onProgress || (r => r);
            let _onSuccess = _cbk.onDeleteSuccess || _cbk.onSuccess || (r => r);
            let _onFailure = _cbk.onDeleteFailure || _cbk.onFailure || console.error;

            if (_opt.is_async) {
                return _act();
            }
            threadsx.start(_act);

            // tool function(s) //

            function _act() {
                _onStart();

                let _res = true;

                let _files = _filesx.listAllFiles(file).reverse();
                let _processed = 0;
                let _total = _files.length;
                _files.forEach((file) => {
                    _res = file.delete() && _res;
                    _onProgress({processed: _processed += 1, total: _total});
                });

                _res && _onSuccess();
                _res || _onFailure('An error has occurred in files.deleteByList()');

                return _res;
            }
        },
        /**
         * @param {string|java.io.File} file
         * @returns {java.io.File[]}
         */
        listAllFiles(file) {
            let _res = [];

            if (typeof file === 'string') {
                file = new File(files.path(file));
            }

            (function _list(file) {
                if (file.isFile()) {
                    _res.push(file);
                } else if (file.isDirectory()) {
                    _res.push(file);
                    file.listFiles().forEach(_list);
                }
            })(file);

            return _res;
        },
        /**
         * Zip a file or a directory by java.io.FileOutputStream
         * @param {string} input_path
         * @param {string|null} [output_path]
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function():*} [callback.onZipStart]
         * @param {function(data:{processed:number,total:number}):*} [callback.onProgress]
         * @param {function(data:{processed:number,total:number}):*} [callback.onZipProgress]
         * @param {function(value:{zipped_path:string}):*} [callback.onSuccess]
         * @param {function(value:{zipped_path:string}):*} [callback.onZipSuccess]
         * @param {function(value:*=):*} [callback.onFailure]
         * @param {function(value:*=):*} [callback.onZipFailure]
         * @param {Object} [options]
         * @param {boolean} [options.is_exclude_root_folder=false]
         * @param {boolean} [options.is_delete_source=false]
         * @example
         * filesx.zip('./', './a.zip', {
         *     onStart() {
         *         console.log('Zipping...');
         *     },
         *     onProgress(o) {
         *         console.log((o.processed / o.total * 100).toFixed(2));
         *     },
         *     onSuccess(result) {
         *         console.log(result.zipped_path);
         *     },
         *     onFailure(e) {
         *         console.error(e);
         *     },
         * });
         * @returns {boolean}
         */
        zip(input_path, output_path, callback, options) {
            let _fis, _bis, _fos, _cos, _zos;
            let _clearAndCloseStreams = function () {
                global._$_dialog_flow_interrupted = false;
                [_zos, _cos, _fos, _bis, _fis].forEach((stream) => {
                    try {
                        stream && stream.close();
                    } catch (e) {
                        // eg: JavaException: java.io.IOException: Stream closed
                    }
                });
            };
            let _filesx = this;
            let _cbk = callback || {};
            let _opt = options || {};
            let _err = (msg) => {
                let _failure = _cbk.onZipFailure || _cbk.onFailure;
                if (typeof _failure === 'function') {
                    _failure(msg);
                } else {
                    toastLog(msg);
                }
                return false;
            };

            let _start = _cbk.onZipStart || _cbk.onStart;
            if (typeof _start === 'function') {
                _start();
            }

            let _i_path = files.path(input_path);
            if (!files.exists(_i_path)) {
                throw Error('无效的压缩源');
            }
            let _i_file = new File(_i_path);
            _i_path = _i_file.getAbsolutePath();

            let _o_path = output_path ? files.path(output_path) : _i_path + '.zip';
            let _o_file = new File(_o_path);
            _o_path = _o_file.getAbsolutePath();
            if (files.getExtension(_o_path) !== 'zip') {
                _o_file = new File(_o_path += '.zip');
            }
            if (files.exists(_o_path)) {
                files.remove(_o_path);
            }

            let _processed_bytes = 0;
            let _i_path_size = this.getDirSize(_i_path);

            try {
                _fos = new FileOutputStream(_o_file);
                _cos = new CheckedOutputStream(_fos, new CRC32());
                _zos = new ZipOutputStream(_cos);

                _zip(_i_file);

                _clearAndCloseStreams();

                let _success = _cbk.onZipSuccess || _cbk.onSuccess;
                if (typeof _success === 'function') {
                    _success({zipped_path: _o_path});
                }

                if (_opt.is_delete_source) {
                    _filesx.removeWithDirs(_i_path, {is_async: true});
                }

                return true;
            } catch (e) {
                return _err('压缩失败:\n' + e);
            }

            // tool function(s) //

            /** @param {java.io.File} file */
            function _zip(file) {
                return _opt.is_exclude_root_folder && file.isDirectory()
                    ? file.listFiles()
                        .filter(f => f.getAbsolutePath() !== _o_file.getAbsolutePath())
                        .forEach(f => _compressFile(f))
                    : _compressFile(file);

                // tool function(s) //

                function _compressFile(file, parent) {
                    let _parent = parent ? parent + File.separator : '';
                    let _file_name = _parent + file.getName();
                    if (file.isFile()) {
                        let _read_bytes;
                        let _buf_len = 1024;
                        let _buf_bytes = util.java.array('byte', _buf_len);

                        _zos.putNextEntry(new ZipEntry(_file_name));
                        _fis = new FileInputStream(file);
                        _bis = new BufferedInputStream(_fis);

                        while (~(_read_bytes = _bis.read(_buf_bytes, 0, _buf_len))) {
                            if (global._$_dialog_flow_interrupted) {
                                _clearAndCloseStreams();
                                return _err('用户终止');
                            }
                            _zos.write(_buf_bytes, 0, _read_bytes);
                        }
                        _zos.closeEntry();
                        _bis.close();
                        _fis.close();

                        let _progress = _cbk.onZipProgress || _cbk.onProgress;
                        if (typeof _progress === 'function') {
                            _progress({
                                processed: _processed_bytes += file.length(), total: _i_path_size,
                            });
                        }
                    } else {
                        file.listFiles()
                            .filter(f => f.getAbsolutePath() !== _o_file.getAbsolutePath())
                            .forEach(f => _compressFile(f, _file_name));
                    }
                }
            }
        },
        /**
         * Copy a file or folder to target path
         * @param {string} src - source file or folder
         * @param {string} target - target path (absolute or relative directory)
         * @param {Object} [options]
         * @param {boolean} [options.is_unbundled=false]
         * @param {boolean} [options.is_async=false]
         * @param {function(name:string):boolean} [options.filter]
         * @param {Object} [callback]
         * @param {function():*} [callback.onStart]
         * @param {function():*} [callback.onCopyStart]
         * @param {function(data:{processed:number,total:number}):*} [callback.onProgress]
         * @param {function(data:{processed:number,total:number}):*} [callback.onCopyProgress]
         * @param {function():*} [callback.onSuccess]
         * @param {function():*} [callback.onCopySuccess]
         * @param {function(value:*=):*} [callback.onFailure]
         * @param {function(value:*=):*} [callback.onCopyFailure]
         * @example About options.is_unbundled property
         * // whether unbundle all files from the master folder
         * // only available when src param is a folder
         * // -- -- -- --
         * // src: a folder named 'picture' with 3 files
         * // /pictures/1.png
         * // /pictures/2.png
         * // /pictures/3.png
         * let src = './pictures';
         *
         * let target = './backup/';
         *
         * // is_unbundled is falsy
         * // then you got './backup/pictures/1.png' and 2 more
         * filesx.copy(src, target);
         *
         * // is_unbundled is truthy
         * // then you got './backup/1.png' and 2 more
         * filesx.copy(src, target, {is_unbundled: true});
         * @example Different from files.copy
         * // source: './download/a.mp4'
         * // target: './video/a.mp4' -- same file name
         * // files.copy()
         * files.copy('./download/a.mp4', './video/a.mp4');
         * // filesx.copy()
         * filesx.copy('./download/a.mp4', './video');
         * @example
         * let _diag = dialogs.build({progress: {max: 100}}).show();
         * filesx.copy('./Video/Test.mp4', './Scripts', {}, {
         *     onProgress(o) {
         *         _diag.setProgress(o.processed / o.total * 100);
         *     },
         *     onSuccess() {
         *         setTimeout(() => _diag.dismiss(), 2e3);
         *     },
         * }) && toastLog('OK');
         * @returns {boolean}
         */
        copy(src, target, options, callback) {
            let _cbk = callback || {};
            let _onStart = _cbk.onCopyStart || _cbk.onStart || (r => r);
            let _onProgress = _cbk.onCopyProgress || _cbk.onProgress || (r => r);
            let _onSuccess = _cbk.onCopySuccess || _cbk.onSuccess || (r => r);
            let _onFailure = _cbk.onCopyFailure || _cbk.onFailure || console.error;

            if (!src || !target) {
                _onFailure('Source and target path must be both defined');
            }
            if (!files.isDir(target)) {
                _onFailure('Target path must be a directory');
            }

            let _filesx = this;
            let _sep = File.separator;

            let _src = new File(files.path(src)).getAbsolutePath();
            let _tar = new File(files.path(target)).getAbsolutePath();

            let _opt = options || {};
            let _is_unbundle = _opt.is_unbundled;
            let _filter = _opt.filter || function () {
                return true;
            };

            if (!_opt.is_async) {
                return _act();
            }
            threadsx.start(_act);

            // tool function(s) //

            function _act() {
                if (typeof _onStart === 'function') {
                    _onStart();
                }

                let _res = true;
                let _processed = 0;
                let _total = 1;

                if (files.isDir(_src)) {
                    if (!_is_unbundle) {
                        _tar += _sep + files.getName(_src);
                    }
                    let _list = files.listDir(_src, _filter);
                    _total = _list.length;
                    _list.forEach(name => _copy(_src + _sep + name, _tar));
                } else {
                    _copy(_src, _tar);
                }

                _res && _onSuccess();
                _res || _onFailure('An error has occurred in files.copy()');

                return _res;

                // tool function(s) //

                function _copy(src, target) {
                    let _tar = target + _sep + files.getName(src);
                    if (files.isFile(src)) {
                        if (!_filesx._files$copy(src, _tar)) {
                            _res = false;
                        }
                        _onProgress({processed: _processed += 1, total: _total});
                    } else {
                        files.listDir(src).forEach((name) => {
                            _copy(src + _sep + name, _tar);
                        });
                    }
                }
            }
        },
        /**
         * Returns the files size in a directory or file
         * @param {string|java.io.File} path
         * @example
         * console.log(filesx.getDirSize('.')); // current working directory
         * @returns {*}
         */
        getDirSize(path) {
            let _path = files.path(path);
            if (!files.exists(_path)) {
                throw Error('path of filesx.getDirSize() is not exist');
            }
            if (files.isFile(_path)) {
                return new File(_path).length();
            }
            return new File(_path).listFiles().reduce((sum, f) => {
                return sum + (f.isDirectory() ? this.getDirSize(f) : f.length());
            }, 0);
        },
        /**
         * @param {string} path
         * @returns {string}
         */
        read(path) {
            let _file = files.open(path, 'r');
            let _text = _file.read();
            _file.close();
            return _text;
        },
    };
    let colorsx = {
        /**
         * @param {ColorParam} color
         * @returns {number}
         */
        toInt(color) {
            let _c;
            try {
                _c = typeof color === 'string' ? colors.parseColor(color) : color;
            } catch (e) {
                console.error('Passed color: ' + color);
                throw Error(e);
            }
            if (typeof _c !== 'number') {
                throw TypeError('Unknown type of color for colorsx.toInt()');
            }
            return _c;
        },
    };
    let threadsx = {
        /**
         * Prevent script exiting error from showing up (for both
         * console and toast window) if threads were interrupted
         * @param {java.lang.Runnable|function} f
         * @param {boolean} [no_err_msg=false]
         * @returns {com.stardust.autojs.core.looper.TimerThread}
         */
        start(f, no_err_msg) {
            try {
                return threads.start(f);
            } catch (e) {
                let _regexp = /(Script)?InterruptedEx|script exiting/;
                if (!e.message.match(_regexp) && !no_err_msg) {
                    throw Error(e);
                }
            }
        },
    };
    let dialogsx = {
        _colors: {
            /**
             * @param {
             *     ColorParam|DialogsxColorTitle|DialogsxColorContent|
             *     DialogsxColorProgress|DialogsxColorButton
             * } color
             * @param {'title'|'content'|'progress'|'button'} type
             * @returns {string}
             */
            wrap(color, type) {
                if (type && this[type]) {
                    for (let k in this[type]) {
                        if (this[type].hasOwnProperty(k)) {
                            if (color === k) {
                                let _c = this[type][k];
                                return Array.isArray(_c) ? _c[0] : _c;
                            }
                        }
                    }
                }
                return color;
            },
            /** @typedef {'default'|'caution'|'alert'} DialogsxColorTitle */
            title: {
                default: '#212121', // Auto.js 4.1.1 Alpha2
                caution: '#880e4f',
                alert: ['#c51162', '#ffeffe'],
            },
            /** @typedef {'default'|'warn'|'alert'} DialogsxColorContent */
            content: {
                default: '#757575', // Auto.js 4.1.1 Alpha2
                warn: '#ad1457',
                alert: ['#283593', '#e1f5fe'],
            },
            /**
             * @typedef {
             *     'alert'|'files'|'backup'|'restore'|'indeterminate'|
             *     'finish'|'success'|'error'|'failure'
             * } DialogsxColorProgress
             */
            progress: {
                /* [progress_tint, progress_bg_tint, action_button ] */
                download: ['#ff6f00', '#ffecb3', '#c43e00'],
                files: ['#f9a825', '#fff59d', '#c17900'],
                backup: ['#455a64', '#eceff1', '#1c313a'],
                restore: ['#ab47bc', '#f3e5f5', '#790e8b'],
                indeterminate: ['#00897b', '#b2dfdb', '#005b4f'],
                finish: ['#00c853', '#dcedc8', '#009624'],
                success: ['#00c853', '#dcedc8', '#009624'],
                error: ['#1565c0', '#bbdefb', '#003c8f'],
                failure: ['#1565c0', '#bbdefb', '#003c8f'],
            },
            /**
             * @typedef {
             *     'default_aj_4'|'default'|'caution'|'warn'|'attraction'|'hint'|
             *     'reset'|'unavailable'|'finish'|'success'|'error'|'failure'
             * } DialogsxColorButton
             */
            button: {
                default_aj_4: '#01a9f3', // Auto.js 4.1.1 Alpha2
                default: '#03a9f4', // override
                caution: '#ff3d00',
                warn: '#f57c00',
                attraction: '#7b1fa2',
                hint: '#0da798',
                reset: '#a1887f',
                unavailable: '#bdbdbd',
                finish: '#009624',
                success: '#009624',
                error: '#003c8f',
                failure: '#003c8f',
            },
        },
        _text: {
            /**
             * @description F: finish
             * @description B: back
             * @description Q: quit
             * @description X: exit
             * @description I: interrupt
             * @description K: ok
             * @description S: sure
             * @description C: close
             * @description D: delete
             * @description N: continue
             * @description M: sure to modify
             * @description R: reset to default
             * @description T: show details
             * @typedef {'F'|'B'|'Q'|'X'|'I'|'K'|'S'|'C'|'D'|'N'|'M'|'R'|'T'} DialogsxButtonText
             */
            _btn: {
                F: '完成', B: '返回', Q: '放弃', X: '退出',
                I: '终止', K: '确定', S: '确认',
                C: '关闭', D: '删除', N: '继续',
                M: '确认修改', R: '使用默认值', T: '了解更多',
            },
            no_more_prompt: '不再提示',
            user_interrupted: '用户终止',
        },
        /**
         * Substitution of dialog.build()
         * @returns {JsDialog$}
         */
        build(props) {
            let _dialogsx = this;
            let builder = Object.create(runtime.dialogs.newBuilder());
            builder.thread = threads.currentThread();

            Object.keys(props).forEach(n => applyDialogProperty(builder, n, props[n]));

            applyOtherDialogProperties(builder, props);

            return ui.run(builder.buildDialog.bind(builder));

            // tool function(s) //

            function applyDialogProperty(builder, name, value) {
                let propertySetters = {
                    title: null,
                    titleColor: {adapter: colorsx.toInt},
                    buttonRippleColor: {adapter: colorsx.toInt},
                    icon: null,
                    content: null,
                    contentColor: {adapter: colorsx.toInt},
                    contentLineSpacing: null,
                    items: null,
                    itemsColor: {adapter: colorsx.toInt},
                    positive: {method: 'positiveText', adapter: _parseBtnText},
                    positiveColor: {adapter: colorsx.toInt},
                    neutral: {method: 'neutralText', adapter: _parseBtnText},
                    neutralColor: {adapter: colorsx.toInt},
                    negative: {method: 'negativeText', adapter: _parseBtnText},
                    negativeColor: {adapter: colorsx.toInt},
                    cancelable: null,
                    canceledOnTouchOutside: null,
                    autoDismiss: null,
                };

                if (propertySetters.hasOwnProperty(name)) {
                    let propertySetter = propertySetters[name] || {};
                    if (propertySetter.method === undefined) {
                        propertySetter.method = name;
                    }
                    if (propertySetter.adapter) {
                        value = propertySetter.adapter(value);
                    }
                    builder[propertySetter.method].call(builder, value);
                }
            }

            function applyOtherDialogProperties(builder, properties) {
                if (properties.inputHint !== undefined || properties.inputPrefill !== undefined) {
                    let _ih = wrapNonNullString(properties.inputHint);
                    let _ip = wrapNonNullString(properties.inputPrefill);
                    let _cbk = function (d, input) {
                        return builder.emit('input_change', builder.dialog, input.toString());
                    };
                    builder.input(_ih, _ip, _cbk).alwaysCallInputCallback();
                }
                if (properties.items !== undefined) {
                    let itemsSelectMode = properties.itemsSelectMode;
                    if (itemsSelectMode === undefined || itemsSelectMode === 'select') {
                        builder.itemsCallback(function (dialog, view, position, text) {
                            builder.emit('item_select', position, text.toString(), builder.dialog);
                        });
                    } else if (itemsSelectMode === 'single') {
                        builder.itemsCallbackSingleChoice(
                            properties.itemsSelectedIndex === undefined ? -1 : properties.itemsSelectedIndex,
                            function (d, view, which, text) {
                                builder.emit('single_choice', which, text.toString(), builder.dialog);
                                return true;
                            });
                    } else if (itemsSelectMode === 'multi') {
                        builder.itemsCallbackMultiChoice(
                            properties.itemsSelectedIndex === undefined ? null : properties.itemsSelectedIndex,
                            function (dialog, indices, texts) {
                                builder.emit('multi_choice',
                                    toJsArray(indices, (l, i) => parseInt(l[i])),
                                    toJsArray(texts, (l, i) => l[i].toString()),
                                    builder.dialog);
                                return true;
                            });
                    } else {
                        throw new Error('Unknown itemsSelectMode ' + itemsSelectMode);
                    }
                }
                if (properties.progress !== undefined) {
                    let progress = properties.progress;
                    builder.progress(progress.max === -1, progress.max, !!progress.showMinMax);
                    builder.progressIndeterminateStyle(!!progress.horizontal);
                }
                if (properties.checkBoxPrompt !== undefined || properties.checkBoxChecked !== undefined) {
                    builder.checkBoxPrompt(
                        wrapNonNullString(properties.checkBoxPrompt),
                        !!properties.checkBoxChecked,
                        function (view, checked) {
                            return builder.getDialog().emit('check', checked, builder.getDialog());
                        });
                }
                if (properties.customView !== undefined) {
                    let customView = properties.customView;
                    // noinspection JSTypeOfValues
                    if (typeof customView === 'xml' || typeof customView === 'string') {
                        customView = ui.run(() => ui.inflate(customView));
                    }
                    let wrapInScrollView = properties.wrapInScrollView;
                    builder.customView(customView, wrapInScrollView === undefined ? true : wrapInScrollView);
                }

                function wrapNonNullString(str) {
                    return str || '';
                }

                function toJsArray(object, adapter) {
                    let jsArray = [];
                    let len = object.length;
                    for (let i = 0; i < len; i++) {
                        jsArray.push(adapter(object, i));
                    }
                    return jsArray;
                }
            }

            function _parseBtnText(text) {
                return _dialogsx._text._btn[text] || text;
            }
        },
        /** @typedef {string|[string, DialogsxColorTitle]} Builds$title */
        /** @typedef {string|[string, DialogsxColorContent]} Builds$content */
        /** @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$neutral */
        /** @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$negative */
        /** @typedef {DialogsxButtonText|[DialogsxButtonText, DialogsxColorButton]|number} Builds$positive */
        /** @typedef {number|boolean} Builds$keep */
        /** @typedef {number|boolean|string} Builds$checkbox */
        /**
         * @param {
         *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive, Builds$keep, Builds$checkbox]|
         *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive, Builds$keep]|
         *     [Builds$title, Builds$content, Builds$neutral, Builds$negative, Builds$positive]|
         *     [Builds$title, Builds$content, Builds$neutral, Builds$negative]|
         *     [Builds$title, Builds$content, Builds$neutral]|
         *     [Builds$title, Builds$content]|
         *     [Builds$title]|string
         * } props
         * @param {DialogsBuildProperties | {
         *     disable_back?: boolean|Function,
         *     linkify?: Dialogsx$Linkify$Mask,
         * }} [ext]
         * @returns {JsDialog$}
         */
        builds(props, ext) {
            let [
                $tt, $cnt, $neu, $neg, $pos, $keep, $cbx,
            ] = typeof props === 'string' ? [props] : props;

            let _props = {
                autoDismiss: !$keep,
                canceledOnTouchOutside: !$keep,
                checkBoxPrompt: $cbx ? typeof $cbx === 'string'
                    ? $cbx : this._text.no_more_prompt : undefined,
            };

            void [
                ['title', $tt, this._colors.title],
                ['content', $cnt, this._colors.content],
                ['neutral', $neu, this._colors.button, this._text._btn],
                ['negative', $neg, this._colors.button, this._text._btn],
                ['positive', $pos, this._colors.button, this._text._btn],
            ].forEach(arr => _parseAndColorUp.apply(null, arr));

            let _ext = ext || {};
            let _diag = this.build(Object.assign(_props, _ext));

            if (_ext.linkify) {
                this.linkify(_diag);
            }
            if (_ext.disable_back) {
                this.disableBack(_diag, _ext.disable_back);
            }

            return _diag;

            // tool function(s) //

            function _parseAndColorUp(key, data, color_lib, text_lib) {
                let [_text, _color] = Array.isArray(data) ? data : [data];
                if (_text) {
                    _props[key] = text_lib && text_lib[_text] || _text;
                }
                _props[key + 'Color'] = color_lib[_color] || _color || color_lib.default;
            }
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         */
        getContentText(d) {
            return d ? d.getContentView().getText().toString() : null;
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {string} [str='']
         */
        appendContentText(d, str) {
            ui.run(() => {
                d && d.getContentView().setText(this.getContentText(d) + (str ? str.toString() : ''));
            });
        },
        /**
         * @param {'positive'|'negative'|'neutral'} action
         * @returns {com.afollestad.materialdialogs.DialogAction|null}
         */
        getDialogAction(action) {
            try {
                switch (action) {
                    case 'positive':
                        return DialogAction.POSITIVE;
                    case 'negative':
                        return DialogAction.NEGATIVE;
                    case 'neutral':
                        return DialogAction.NEUTRAL;
                }
            } catch (e) {
                // Java class "com.afollestad.materialdialogs.DialogAction"
                // has no public instance field or method named "%ACTION%"
                return null;
            }
            throw TypeError('unknown action of dialogsx.getDialogAction');
        },
        /**
         * @typedef {'ALL'|'EMAIL_ADDRESSES'|'MAP_ADDRESSES'|'PHONE_NUMBERS'|'WEB_URLS'} Dialogsx$Linkify$Mask
         */
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {Dialogsx$Linkify$Mask} [mask='ALL']
         */
        linkify(d, mask) {
            if (d) {
                let _cnt_vw = d.getContentView();
                ui.run(() => {
                    let _cnt_text = _cnt_vw.getText().toString();
                    _cnt_vw.setAutoLinkMask(Linkify[mask || 'ALL']);
                    _cnt_vw.setText(_cnt_text);
                });
            }
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {string} [str='']
         */
        setTitleText(d, str) {
            ui.run(() => {
                d && d.getTitleView().setText(str ? str.toString() : '');
            });
        },
        /**
         * Replace or append a message in dialogs content view
         * @param {JsDialog$|MaterialDialog$} d
         * @param msg {string} - message shown in content view
         * @param {boolean|'append'} [is_append=false]
         * - whether original content is reserved or not
         */
        alertContent(d, msg, is_append) {
            let _ori_view = d.getContentView();
            let _ori_text = _ori_view.getText().toString();
            let _is_append = is_append === 'append' || is_append === true;
            let [_c_text, _c_bg] = this._colors.content.alert.map(colorsx.toInt);

            ui.post(() => {
                _ori_view.setText((_is_append ? _ori_text + '\n\n' : '') + msg);
                _ori_view.setTextColor(_c_text);
                _ori_view.setBackgroundColor(_c_bg);
            });
        },
        /**
         * Build a dialog with flow steps
         * @param {Object} [config]
         * @param {string} [config.title]
         * @param {*} [config.initial_value]
         * @param {DialogsxButtonText} [config.on_interrupt_btn_text='B']
         * @param {boolean} [config.show_min_max]
         * @param {{
         *     desc: string,
         *     action: function(value:*,d:BuildFlowExtendedJsDialog),
         *     onSuccess?: function(value:*),
         *     onFailure?: function(reason:*),
         * }[]} config.steps
         * @param {string} [config.success_title]
         * @param {string} [config.success_content]
         * @param {function(value:*,d:BuildFlowExtendedJsDialog):*} [config.onStart]
         * @param {function(value:*,d:BuildFlowExtendedJsDialog):*} [config.onSuccess]
         * @param {function(err:*,d:BuildFlowExtendedJsDialog):*} [config.onFailure]
         * @example
         * dialogsx.buildFlow({
         *     title: '正在部署项目最新版本',
         *     success_content: '更新完成',
         *     steps: [{
         *         desc: '下载项目数据包',
         *         action: () => {
         *             return new Promise(resolve => {
         *                 resolve({num: 1});
         *             });
         *         },
         *     }, {
         *         desc: '解压缩',
         *         action: (res, d) => {
         *             let _n = 0;
         *             while(_n < 100) {
         *                 d.setProgress(++_n);
         *                 sleep(30);
         *             }
         *             res.num = _n;
         *             return res;
         *         },
         *     }, {
         *         desc: '备份本地项目',
         *         action: (res) => {
         *             sleep(200);
         *             res.num /= 25;
         *             return res;
         *         },
         *     }, {
         *         desc: '文件替换',
         *         action: (res) => {
         *             sleep(200);
         *             res.num = Math.max(res.num, 2);
         *             return res;
         *         },
         *     }, {
         *         desc: '清理并完成部署',
         *         action: (res) => {
         *             sleep(200);
         *             console.log(res.num); // 4
         *         },
         *     }],
         * }).act();
         * @returns {BuildFlowExtendedJsDialog}
         */
        buildFlow(config) {
            let _dialogsx = this;

            let _diag = Object.create(_dialogsx.builds([
                config.title || '', config.steps.map((step, i) => (
                    '\u3000 ' + ++i + '. ' + step.desc
                )).join('\n'), 0, 0, 'I', 1], {
                progress: {max: 100, showMinMax: !!config.show_min_max},
            }));

            /**
             * @typedef {{
             *     act:function():BuildFlowExtendedJsDialog,
             *     setStepDesc:function(step_num:number,desc:string,is_append:boolean=false):BuildFlowExtendedJsDialog,
             *     setProgressData:function({processed:number,total:number}):BuildFlowExtendedJsDialog,
             *     setFailureData:function(error:string|Error):BuildFlowExtendedJsDialog,
             * }} BuildFlowExtended
             */
            /** @typedef {JsDialog$ | BuildFlowExtended} BuildFlowExtendedJsDialog */
            let _diag_ext = {
                act() {
                    let _promise = new Promise((resolve) => {
                        _diag.on('positive', () => {
                            global._$_dialog_flow_interrupted = true;
                        });
                        if (typeof config.onStart === 'function') {
                            config.onStart(config.initial_value, _diag);
                        }
                        resolve(config.initial_value);
                    });

                    config.steps.forEach((step, idx) => {
                        _promise = _promise.then((value) => {
                            if (global._$_dialog_flow_interrupted) {
                                throw Error(_dialogsx._text.user_interrupted);
                            }
                            let _fin = (result) => {
                                _diag.setProgress(100);
                                _setStepsFinished(idx + 1);
                                step.onSuccess && step.onSuccess(value);
                                return result;
                            };
                            _diag.setProgress(0);
                            _setStepOnProgress(idx + 1);
                            let _result = step.action(value, _diag);
                            if (_result instanceof Promise) {
                                _result = _result.then(_fin);
                                return _result;
                            }
                            return _fin(_result);
                        }, step.onFailure);
                    });

                    _promise = _promise.then((res) => {
                        if (global._$_dialog_flow_interrupted) {
                            throw Error(_dialogsx._text.user_interrupted);
                        }
                        _dialogsx.setProgressColorTheme(_diag, 'finish');

                        _setStepsFinished('all');

                        _diag.removeAllListeners('positive');
                        _diag.setActionButton('positive', _dialogsx._text._btn.F);
                        _diag.on('positive', d => d.dismiss());

                        let _title = config.success_title;
                        _title && _dialogsx.setTitleText(_diag, _title);

                        let _cont = config.success_content;
                        _cont && _dialogsx.appendContentText(_diag, '\n\n' + _cont);

                        delete global._$_dialog_flow_interrupted;

                        if (typeof config.onSuccess === 'function') {
                            config.onSuccess(res, _diag);
                        }
                    });

                    _promise.catch((err) => {
                        _dialogsx.setProgressColorTheme(_diag, 'error');

                        _diag.removeAllListeners('positive');

                        let _btn_el = _dialogsx._text._btn[config.on_interrupt_btn_text || 'B'];
                        _diag.setActionButton('positive', _btn_el);

                        _diag.on('positive', d => d.dismiss());

                        _dialogsx.alertContent(_diag, err, 'append');

                        delete global._$_dialog_flow_interrupted;

                        if (typeof config.onFailure === 'function') {
                            config.onFailure(err, _diag);
                        }
                    });

                    _diag.isShowing() || _diag.show();

                    return _diag_mixed;
                },
                setStepDesc(step_num, desc, is_append) {
                    if (step_num < 1) {
                        throw Error('step_num is less than 1');
                    }
                    if (step_num >= config.steps.length) {
                        throw Error('step_num must be less than steps length');
                    }
                    let _step_num = step_num.toString();
                    let _view = _diag.getContentView();
                    let _content = _view.getText().toString();
                    let _aim_str = config.steps[_step_num - 1].desc;
                    if (_content.match(_aim_str)) {
                        let _text = (is_append ? _aim_str : '') + (desc || '');
                        _view.setText(_content.replace(_aim_str, _text));
                    }
                    return _diag_mixed;
                },
                setProgressData(data) {
                    if (typeof data === 'object') {
                        let _num = data.processed / data.total * 100 || 0;
                        _diag.setProgress(Math.min(Math.max(0, _num), 100));
                    }
                    return _diag_mixed;
                },
                setFailureData(error) {
                    _diag.setActionButton('positive', _dialogsx._text._btn.B);
                    _diag.removeAllListeners('positive');
                    _diag.on('positive', d => d.dismiss());
                    _dialogsx.alertContent(_diag, error, 'append');
                    return _diag_mixed;
                },
            };

            let _diag_mixed = Object.assign(_diag, _diag_ext);

            return _diag_mixed;

            // tool function(s) //

            function _setStepsFinished(ctr) {
                let _ctr = ctr === 'all' || !ctr ? Infinity : ctr;
                let _cont = _dialogsx.getContentText(_diag);
                let _rex = /^(. )(\d)(?=\.)/gm;
                _dialogsx.setContentText(_diag, _cont.replace(_rex, ($0, $1, $2) => (
                    ($2 <= _ctr ? '\u2714 ' : $1) + $2
                )));
            }

            function _setStepOnProgress(num) {
                let _num = num.toString();
                let _cont = _dialogsx.getContentText(_diag);
                let _rex = /^(. )(\d)(?=\.)/gm;
                _dialogsx.setContentText(_diag, _cont.replace(_rex, ($0, $1, $2) => (
                    ($2 === _num ? '\u25b6 ' : $1) + $2
                )));
            }
        },
        /**
         * Build a dialog with progress view
         * @param {Object} [config]
         * @param {string} [config.title]
         * @param {string} [config.content]
         * @param {string} [config.desc] - alias for config.content
         * @param {DialogsxButtonText} [config.on_interrupt_btn_text='B']
         * @param {boolean} [config.show_min_max]
         * @param {*} [config.initial_value]
         * @param {string} [config.success_title]
         * @param {string} [config.success_content]
         * @param {function(value:*,d:BuildProgressExtendedJsDialog):*} [config.onStart]
         * @param {function(value:*,d:BuildProgressExtendedJsDialog):*} config.action
         * @param {function(value:*,d:BuildProgressExtendedJsDialog):*} [config.onSuccess]
         * @param {function(err:*,d:BuildProgressExtendedJsDialog):*} [config.onFailure]
         * @example
         * dialogsx.buildProgress({
         *     title: '正在部署项目最新版本',
         *     success_content: '部署完成',
         *     content: '项目部署中...',
         *     action: (res, d) => {
         *         let _n = 0;
         *         while (_n < 100) {
         *             d.setProgress(++_n);
         *             sleep(20);
         *         }
         *     },
         * }).act();
         * @returns {BuildProgressExtendedJsDialog}
         */
        buildProgress(config) {
            let _dialogsx = this;
            let _diag = Object.create(_dialogsx.builds([
                config.title || '', config.content || config.desc || '', 0, 0, 'I', 1,
            ], {progress: {max: 100, showMinMax: !!config.show_min_max}}));

            /**
             * @typedef {{
             *     act:function():BuildProgressExtendedJsDialog,
             *     setStepDesc:function(desc:string,is_append:boolean=false):BuildProgressExtendedJsDialog,
             *     setProgressData:function({processed:number,total:number}):BuildProgressExtendedJsDialog,
             *     setFailureData:function(error:string|Error):BuildProgressExtendedJsDialog,
             * }} BuildProgressExtended
             */
            /** @typedef {JsDialog$ | BuildProgressExtended} BuildProgressExtendedJsDialog */
            let _diag_ext = {
                act() {
                    Promise.resolve(config.initial_value)
                        .then((value) => {
                            if (typeof config.onStart === 'function') {
                                config.onStart(config.initial_value, _diag);
                            }
                            return value;
                        })
                        .then((value) => {
                            _diag.on('positive', () => {
                                global._$_dialog_flow_interrupted = true;
                            });
                            if (global._$_dialog_flow_interrupted) {
                                throw Error(_dialogsx._text.user_interrupted);
                            }
                            return config.action(value, _diag);
                        })
                        .then((res) => {
                            if (global._$_dialog_flow_interrupted) {
                                throw Error(_dialogsx._text.user_interrupted);
                            }
                            _dialogsx.setProgressColorTheme(_diag, 'finish');

                            _diag.setProgress(100);
                            _diag.removeAllListeners('positive');
                            _diag.setActionButton('positive', _dialogsx._text._btn.F);
                            _diag.on('positive', d => d.dismiss());

                            let _title = config.success_title;
                            _title && _dialogsx.setTitleText(_diag, _title);

                            let _cont = config.success_content;
                            _cont && _dialogsx.appendContentText(_diag, '\n\n' + _cont);

                            delete global._$_dialog_flow_interrupted;

                            if (typeof config.onSuccess === 'function') {
                                config.onSuccess(res, _diag);
                            }
                        })
                        .catch((err) => {
                            _dialogsx.setProgressColorTheme(_diag, 'error');
                            _diag.removeAllListeners('positive');

                            let _btn_el = _dialogsx._text._btn[config.on_interrupt_btn_text || 'B'];
                            _diag.setActionButton('positive', _btn_el);

                            _diag.on('positive', d => d.dismiss());

                            _dialogsx.alertContent(_diag, err, 'append');

                            delete global._$_dialog_flow_interrupted;

                            if (typeof config.onFailure === 'function') {
                                config.onFailure(err, _diag);
                            }
                        });

                    _diag.isShowing() || _diag.show();

                    return _diag_mixed;
                },
                setStepDesc(desc, is_append) {
                    let _view = _diag.getContentView();
                    let _content = _view.getText().toString();
                    let _aim_str = config.content || '';
                    if (_content.match(_aim_str)) {
                        let _text = (is_append ? _aim_str : '') + (desc || '');
                        _view.setText(_content.replace(_aim_str, _text));
                    }
                    return _diag_mixed;
                },
                setProgressData(data) {
                    _diag.setProgress(data.processed / data.total * 100);
                    return _diag_mixed;
                },
                setFailureData(error) {
                    _diag.setActionButton('positive', _dialogsx._text._btn.B);
                    _diag.on('positive', d => d.dismiss());
                    _dialogsx.alertContent(_diag, error, 'append');
                    return _diag_mixed;
                },
            };

            let _diag_mixed = Object.assign(_diag, _diag_ext);

            return _diag_mixed;
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {ColorParam|ColorParam[]|DialogsxColorProgress} colors
         */
        setProgressColorTheme(d, colors) {
            let _colors = colors;
            if (!Array.isArray(_colors)) {
                if (typeof _colors === 'string') {
                    _colors = this._colors.progress[colors] || [_colors];
                } else if (typeof _colors === 'number') {
                    _colors = [_colors];
                } else {
                    throw Error('Unknown colors type for dialogsx.setProgressColorTheme()');
                }
            }
            let [_ftl, _btl, _abc] = _colors;
            _ftl && this.setProgressTintList(d, _ftl);
            _btl && this.setProgressBackgroundTintList(d, _btl);
            _abc && this.setActionButtonColor(d, 'positive', _abc);
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {'positive'|'negative'|'neutral'} action
         * @param {ColorParam|DialogsxColorButton} color
         */
        setActionButtonColor(d, action, color) {
            let _action = this.getDialogAction(action.toLowerCase());
            if (_action !== null) {
                let _c_int = colorsx.toInt(this._colors.wrap(color, 'button'));
                d.getActionButton(_action).setTextColor(_c_int);
            }
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {ColorParam|DialogsxColorProgress} color
         */
        setProgressTintList(d, color) {
            let _c_int = colorsx.toInt(this._colors.wrap(color, 'progress'));
            let _csl = ColorStateList.valueOf(_c_int);
            d.getProgressBar().setProgressTintList(_csl);
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {ColorParam} color
         */
        setProgressBackgroundTintList(d, color) {
            let _c_int = colorsx.toInt(color);
            let _csl = ColorStateList.valueOf(_c_int);
            d.getProgressBar().setProgressBackgroundTintList(_csl);
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         */
        clearProgressNumberFormat(d) {
            ui.run(() => d.setProgressNumberFormat(''));
        },
        /**
         * @param {...(JsDialog$|MaterialDialog$)} [d]
         */
        dismiss(d) {
            (Array.isArray(d) ? d : [].slice.call(arguments)).forEach((o) => {
                typeof o === 'object' && o.dismiss && o.dismiss();
            });
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {Function} [f]
         * @returns {JsDialog$|MaterialDialog$}
         */
        disableBack(d, f) {
            // to prevent dialog from being dismissed
            // by pressing 'back' button (usually by accident)
            d.setOnKeyListener({
                onKey(diag, key_code) {
                    typeof f === 'function' && f();
                    return key_code === KeyEvent.KEYCODE_BACK;
                },
            });
            return d;
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {string} [str='']
         */
        setContentText(d, str) {
            ui.run(() => {
                d && d.getContentView().setText(str ? str.toString() : '');
            });
        },
        /**
         * @param {JsDialog$|MaterialDialog$} d
         * @param {string} format
         * @param {*[]} [args]
         * @example
         * dialogsx.setProgressNumberFormat(diag, '%.1fKB/%.1fKB', [n, 100]);
         */
        setProgressNumberFormat(d, format, args) {
            ui.run(() => d.setProgressNumberFormat(java.lang.String.format(format, args)));
        },
    };
    let storagesx = {
        /**
         * @param {string} name
         * @returns {_Storage}
         */
        create(name) {
            return new _Storage(name);
        },
        /**
         * @param {string} name
         */
        remove(name) {
            this.create(name).clear();
        },
    };

    dialogsx.builds(['项目部署',
        '欢迎使用蚂蚁森林项目部署工具\n此工具用于 v2.0.0 以上版本的项目部署',
        ['了解项目', 'hint'], ['退出', 'caution'], ['开始部署', 'attraction'], 1,
    ]).on('neutral', () => {
        dialogsx.builds(['关于项目',
            '- 功能简介 -' + '\n' + [
                '自动收取好友能量', '自动收取/监测自己能量', '收取结果统计/展示',
                '控制台消息提示', '自动解锁屏幕', '定时任务与循环监测', '多任务自动排队',
                '脚本运行安全', '事件监测与处理', '黑名单机制', '项目管理', '账户功能',
                '统计功能', '图形化配置工具',
            ].map(s => '· ' + s).join('\n') + '\n\n' +
            '- 项目作者 -' + '\n' + '· SuperMonster003' + '\n\n' +
            '- 项目链接 -' + '\n' + '· https://github.com/SuperMonster003/Ant-Forest',
            0, 0, '返回', 1,
        ], {
            linkify: 'WEB_URLS',
        }).on('positive', ds => ds.dismiss()).show();
    }).on('negative', (d) => {
        d.dismiss();
        exit();
    }).on('positive', (d) => {
        d.dismiss();
        appx.getProjectReleases({
            min_version_name: 'v2.0.1',
            show_progress_dialog: true,
        }, function (releases) {
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
                    items: [
                        '最新版本 (' + _newest_ver_n + ')',
                        '其他版本',
                    ],
                    itemsSelectMode: 'single',
                    itemsSelectedIndex: 0,
                })
                .on('neutral', () => {
                    appx.getProjectChangelog(_newest_ver_n.match(/v(\d+)/)[1], {
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
                        ds.dismiss();
                        d.dismiss();
                        exit();
                    }).show();
                })
                .on('positive', (d) => {
                    d.dismiss();
                    d.getSelectedIndex() === 0
                        ? threadsx.start(function () {
                            _deployVersion(_newest);
                        })
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
                            threadsx.start(function () {
                                _deployVersion(releases[ds.getSelectedIndex() + 1]);
                            });
                        }).show();
                })
                .show();
        });
    }).show();

    // tool function(s) //

    function _deployVersion(version) {
        appx.deployProject(version, {
            onSuccess(o, d) {
                let _tar = o.target_path;
                let _root = filesx.getScriptDirPath();
                d.removeAllListeners('positive');
                d.setActionButton('positive', '下一步');
                dialogsx.appendContentText(d, '\n\n' + '项目部署路径:\n' +
                    '.' + _tar.slice(_root.length + _tar.search(_root)));
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
                        dialogsx
                            .builds(['项目使用声明', [
                                '代码完全公开', '杜绝恶意代码', '项目永久免费', '欢迎提议反馈',
                            ].map(s => '· ' + s).join('\n'),
                                0, 0, ['F', 'finish'], 1, '立即运行项目',
                            ])
                            .on('positive', (d) => {
                                d.dismiss();
                                if (d.isPromptCheckBoxChecked()) {
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
                                }
                                exit();
                            })
                            .show();
                    }
                });
            },
        }, {on_interrupt_btn_text: 'X', success_title: '项目部署完成'});
    }

    // updated: May 18, 2021
    /**
     * @param {string} name
     * @constructor
     */
    function _Storage(name) {
        let _dir = files.getSdcardPath() + '/.local/';
        let _full_path = _dir + name + '.nfe';
        files.createWithDirs(_full_path);
        let _readFile = () => {
            let _file = files.open(_full_path, 'r');
            let _content = _file.read();
            _file.close();
            return _content;
        };

        this.contains = _contains;
        this.get = _get;
        this.put = _put;
        this.remove = _remove;
        this.clear = _clear;

        // tool function(s) //

        function _replacer(k, v) {
            if (typeof v === 'number') {
                if (isNaN(v) || !isFinite(v)) {
                    /** Zero Width No-Break Space */
                    let _pad = '\ufeff';
                    return _pad + v.toString() + _pad;
                }
            }
            return v;
        }

        function _reviver(k, v) {
            if (typeof v === 'string') {
                let _rex = /^\ufeff(.+)\ufeff$/;
                if (v.match(_rex)) {
                    return +v.replace(_rex, '$1');
                }
            }
            return v;
        }

        function _contains(key) {
            return key in _jsonParseFile();
        }

        function _put(key, new_val, forc) {
            if (typeof new_val === 'undefined') {
                let _m = '"put" value can\'t be undefined';
                throw new TypeError(_m);
            }

            let _old = {};
            let _tmp = {};

            try {
                _old = _jsonParseFile(_reviver);
            } catch (e) {
                console.warn(e.message);
            }

            let _cA = Object.prototype.toString.call(new_val).slice(8, -1) === 'Object';
            let _cB = Object.prototype.toString.call(_old[key]).slice(8, -1) === 'Object';
            let _both_type_o = _cA && _cB;

            let _keyLen = () => Object.keys(new_val).length;

            if (!forc && _both_type_o && _keyLen()) {
                _tmp[key] = Object.assign(_old[key], new_val);
            } else {
                _tmp[key] = new_val;
            }

            let _file = files.open(_full_path, 'w');
            _file.write(JSON.stringify(Object.assign(_old, _tmp), _replacer));
            _file.close();
        }

        function _get(key, value) {
            let _o = _jsonParseFile(_reviver);
            if (_o && key in _o) {
                return _o[key];
            }
            return value;
        }

        function _remove(key) {
            let _o = _jsonParseFile();
            if (key in _o) {
                let _file = files.open(_full_path, 'w');
                _file.write(JSON.stringify(_o));
                _file.close();
                delete _o[key];
            }
        }

        function _clear() {
            files.remove(_full_path);
        }

        function _jsonParseFile(reviver) {
            let _str = _readFile();
            try {
                return _str ? JSON.parse(_str, reviver) : {};
            } catch (e) {
                console.warn('JSON.parse()解析配置文件异常');
            }
            try {
                return _tryRepairEscChar(_str, reviver);
            } catch (e) {
                console.warn('转义字符修复失败');
            }
            try {
                return _tryRepairMojibakeLines(_str, reviver);
            } catch (e) {
                console.warn('乱码行修复失败');
            }
            throw _failAndBackup();
        }

        function _tryRepairEscChar(str, reviver) {
            console.warn('尝试查找并修复异常的转义字符');

            let _rex = /[ntrfb\\'"0xu]/;
            let _str_new = '';

            for (let i in str) {
                let _i = +i;
                let _s = str[_i];
                if (_s === '\\') {
                    let _prev = str[_i - 1];
                    let _next = str[_i + 1];
                    if (_prev && _next) {
                        if (_prev !== '\\' && !_next.match(_rex)) {
                            _s += '\\';
                        }
                    }
                }
                _str_new += _s;
            }

            let _res = JSON.parse(_str_new, reviver);
            console.info('修复成功');

            let _file = files.open(_full_path, 'w');
            _file.write(_str_new);
            console.info('已重新写入修复后的数据');

            _file.close();
            return _res;
        }

        function _tryRepairMojibakeLines(str, reviver) {
            console.warn('尝试查找并修复异常的乱码行');

            let _split = str.split('\n');

            let _len = _split.length;
            while (_len-- > 1) {
                try {
                    let _a = _split.slice(0, _len - 1);
                    let _b = _split.slice(_len + 1);
                    let _str_new = _a.concat(_b).join('\n');
                    let _res = JSON.parse(_str_new, reviver);
                    console.info('修复成功');

                    let _file = files.open(_full_path, 'w');
                    _file.write(_str_new);
                    console.info('已重新写入修复后的数据');

                    _file.close();
                    return _res;
                } catch (e) {
                    // nothing to do here
                }
            }
            throw Error(_tryRepairMojibakeLines.name);
        }

        function _failAndBackup() {
            let _new_file_name = name + '.nfe.' + Date.now() + '.bak';

            files.rename(_full_path, _new_file_name);
            console.error('修复失败');
            console.warn('已将损坏的配置文件备份至');
            console.warn(_dir + _new_file_name);
            console.warn('以供手动排查配置文件中的问题');

            return Error('JSON.parse() failed in ext-storages');
        }
    }
}();