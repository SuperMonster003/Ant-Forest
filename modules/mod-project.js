let {
    $$cvt, isNullish,
} = require('./mod-global');
let {appx} = require('./ext-app');
let {httpx} = require('./ext-http');
let {filesx} = require('./ext-files');
let {threadsx} = require('./ext-threads');
let {dialogsx} = require('./ext-dialogs');
let {storagesx} = require('./ext-storages');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let File = java.io.File;

let _ = {
    step: {
        download: '下载数据包',
        decompress: '解压缩',
        backup: '备份本地项目',
        files_check: '检查文件',
        files_update: '项目文件替换',
        files_ready: '项目文件就绪',
        finish_deploy: '清理并完成部署',
        finish_restore: '清理并完成项目恢复',
    },
    structure: [
        {name: '/assets'},
        {name: '/modules', necessary: true},
        {name: '/tools'},
        {name: 'ant-forest-launcher.js', necessary: true},
        {name: 'ant-forest-settings.js'},
        {name: '.gitignore'},
        {name: 'jsconfig.json'},
        {name: 'project.json', necessary: true},
        {name: 'LICENSE'},
        {name: 'README.md'},
    ],
    get ignore_list() {
        return this._ignore_list = this._ignore_list
            || storagesx.af.get('update_ignore_list')
            || storagesx['@default'].af.update_ignore_list;
    },
};

let exp = {
    version: {
        /**
         * Returns if a version is ignored in the given list
         * @param {string|{version_name:string}} ver
         * @param {string[]} [list]
         * @return {boolean}
         */
        isIgnored(ver, list) {
            let _ls = list || _.ignore_list;
            if (!_ls) {
                throw Error('No available list for project.version.isIgnored()');
            }
            return typeof ver === 'string' ? _ls.includes(ver) : _ls.includes(ver.version_name);
        },
        /**
         * Returns if a version is not ignored in the given list
         * @param {string|{version_name:string}} ver
         * @param {string[]} [list]
         * @return {boolean}
         */
        isCared(ver, list) {
            let _ls = list || _.ignore_list;
            if (!_ls) {
                throw Error('No available list for project.version.isCared()');
            }
            return !this.isIgnored(ver, _ls);
        },
    },
    /**
     * @param {...string[]} [children]
     * @return {string}
     * @see filesx.\.local
     */
    '.local'(children) {
        return filesx['.local'].apply(filesx, arguments);
    },
    /**
     * @example
     * console.log(project.getLocal().version_name); // like: 'v2.0.2 Alpha2'
     * @return {{
     *     version_name: string,
     *     version_code: number,
     *     main: {name: string, path: string},
     *     path: string,
     * }}
     */
    getLocal() {
        let _ver_name = '';
        let _ver_code = -1;
        let _path = this.getLocalPath();
        if (!_path) {
            throw Error('Cannot locate project path for project.getLocal()');
        }
        let _json_name = 'project.json';
        let _json_path = files.join(_path, _json_name);
        let _main_name = 'ant-forest-launcher.js';
        let _main_path = files.join(_path, _main_name);
        let _res = {
            version_name: _ver_name,
            version_code: _ver_code,
            main: {name: _main_name, path: _main_path},
            path: _path,
        };
        if (files.exists(_json_path)) {
            try {
                let _o = JSON.parse(filesx.read(_json_path, '{}'));
                return Object.assign(_res, {
                    version_name: 'v' + _o.versionName,
                    version_code: Number(_o.versionCode),
                    main: {name: _o.main, path: files.join(_path, _o.main)},
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
        console.warn('Both\x20' + _json_name + '\x20and\x20' + _main_name + '\x20do not exist');
        return _res;
    },
    /**
     * @param {boolean} [is_with_creation=false]
     * @return {string}
     */
    getLocalPath(is_with_creation) {
        return _.local_path || (_.local_path = (() => {
            let _cwd = files.cwd();
            if (this.isAlike(_cwd)) {
                return _cwd;
            }
            _cwd = new File(_cwd).getParent();
            if (this.isAlike(_cwd)) {
                return _cwd;
            }
            let _proj_def_n = 'Ant-Forest-003';
            let _root_proj_path = files.join(filesx.getScriptDirPath(), _proj_def_n);
            if (files.isDir(_root_proj_path)) {
                return _root_proj_path;
            }
            if (is_with_creation) {
                files.createWithDirs(_root_proj_path + filesx.sep);
                return _root_proj_path;
            }
            return String();
        })());
    },
    /**
     * @return {string}
     */
    getLocalVerName() {
        return this.getLocal().version_name;
    },
    /**
     * @param {...string[]} [children]
     * @example
     * // like: '/storage/emulated/0/Scripts/Ant-Forest-003/assets'
     * console.log(project.getAssetPath());
     * // like: '/storage/emulated/0/Scripts/Ant-Forest-003/assets/images'
     * console.log(project.getAssetPath('images'));
     * @return {string}
     */
    getAssetPath(children) {
        return files.join.apply(files, [this.getLocalPath(), 'assets'].concat([].slice.call(arguments)));
    },
    /**
     * @param {Object} [options]
     * @param {number} [options.max_items=Infinity]
     * @param {number} [options.per_page=30]
     * @param {string} [options.min_version_name='v0.0.0']
     * @param {boolean} [options.no_extend=false]
     * @param {boolean} [options.show_progress_dialog=false]
     * @param {function(items:GitHub.Releases.List|GitHub.Releases.ExtendedList)} [callback]
     * @return {GitHub.Releases.List|GitHub.Releases.ExtendedList}
     */
    getReleases(options, callback) {
        if (typeof callback !== 'function') {
            return _getReleases();
        }
        threadsx.start(() => callback(_getReleases()));

        // tool function(s) //

        function _getReleases() {
            /** @type {GitHub.Releases.List} */
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
                    keycode_back: 'disabled',
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
             * @param {GitHub.Releases.ExtendedListItem} o
             * @return {GitHub.Releases.ExtendedListItem}
             */
            function _extend(o) {
                o.version_name = o.tag_name;

                o.brief_info_str = [
                    {key: 'name', desc: '标题'},
                    {key: 'tag_name', desc: '标签'},
                    {
                        key: 'published_at', desc: '发布',
                        cvt: typeof $$cvt !== 'undefined' && $$cvt.date,
                    },
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
                        return info.desc + ':\x20' + _v;
                    }
                }).filter(s => !!s).join('\n\n');

                return o;
            }
        }
    },
    /**
     * @param {Object} [options]
     * @param {string} [options.min_version_name='v0.0.0']
     * @param {boolean} [options.no_extend=false]
     * @param {boolean} [options.show_progress_dialog=false]
     * @param {function(item:GitHub.Releases.ExtendedListItem|void)} [callback]
     * @return {GitHub.Releases.ExtendedListItem|void}
     */
    getNewestRelease(options, callback) {
        /**
         * @return {GitHub.Releases.ExtendedListItem}
         */
        let _getRelease = () => this.getReleases(Object.assign(options || {}, {
            max_items: 1, per_page: 1,
        }))[0];
        if (typeof callback !== 'function') {
            return _getRelease();
        }
        threadsx.start(() => callback(_getRelease()));
    },
    /**
     * @param {Object} [options]
     * @param {string} [options.min_version_name='v0.0.0']
     * @param {boolean} [options.no_extend=false]
     * @param {boolean} [options.show_progress_dialog=false]
     * @param {string[]} [options.ignore_list]
     * @param {function(item:GitHub.Releases.ExtendedListItem|void)} [callback]
     * @return {GitHub.Releases.ExtendedListItem|void}
     */
    getNewestReleaseCared(options, callback) {
        let _opt = options || {};
        // noinspection JSValidateTypes
        /**
         * @return {GitHub.Releases.ExtendedListItem}
         */
        let _getRelease = () => this.getReleases(Object.assign(_opt, {
            max_items: 100, per_page: 100,
        })).filter(o => this.version.isCared(o, _opt.ignore_list))[0];
        if (typeof callback !== 'function') {
            return _getRelease();
        }
        threadsx.start(() => callback(_getRelease()));
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
     * @return {{ver:string,log:string}[]|string|void}
     */
    getChangelog(ver, options, callback) {
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
            .builds(['历史更新', '处理中...', [_neu_act, 'hint'], '\xa0', 'B', 1])
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
                        '\x20' + $.split(/\[]/).join(',').replace(/\d+/g, '#$&')
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
                let _url = 'https://cdn.jsdelivr.net/gh/SuperMonster003/Ant-Forest@master' +
                    '/assets/docs/CHANGELOG-' + _ver_num + '.md';
                while (_max--) {
                    try {
                        return httpx.okhttp3Request(_url, {
                            onDownloadFailure(e) {
                                _max || _onFailure('请求失败: ' + e);
                            },
                        }, {is_async: false});
                    } catch (e) {
                        _onFailure(e.message);
                    }
                }
            }
        }

        function _showEarlier() {
            dialogsx
                .builds(['选择一个历史版本记录', '', 0, 0, 'B', 1], {
                    items: (function $iiFe() {
                        let _items = [];
                        for (let i = 1; i < _ver_num; i += 1) {
                            _items.push('v' + i + '.x');
                        }
                        return _items;
                    })(),
                })
                .on('positive', dialogsx.dismiss)
                .on('item_select', (idx) => {
                    exp.getChangelog(idx + 1, {
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
     * @return {boolean}
     */
    isAlike(dir, is_throw_allowed) {
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

        return _.structure
            .filter(o => o.necessary)
            .map((o) => o.name[0] === filesx.sep
                ? {name: o.name.slice(1), is_dir: true}
                : {name: o.name})
            .every((o) => {
                if (_files.indexOf(o.name) > -1) {
                    let _cA = o.is_dir;
                    let _cB = files.isDir(files.join(_path, o.name));
                    return _cA && _cB || !_cA && !_cB;
                }
            });
    },
    /**
     * @async
     * @param {
     *     GitHub.Releases.ListItem|
     *     GitHub.Releases.ExtendedListItem|
     *     string|'newest'|'newest_cared'|'latest'|'latest_cared'
     * } version
     * @param {Object} [callback]
     * @param {function():*} [callback.onStart]
     * @param {function():*} [callback.onDeployStart]
     * @param {function(value:{target_path:string}=,d:Dialogsx.BuildFlow.Extension=):*} [callback.onSuccess]
     * @param {function(value:{target_path:string}=,d:Dialogsx.BuildFlow.Extension=):*} [callback.onDeploySuccess]
     * @param {function(value:*=,d:Dialogsx.BuildFlow.Extension=):*} [callback.onFailure]
     * @param {function(value:*=,d:Dialogsx.BuildFlow.Extension=):*} [callback.onDeployFailure]
     * @param {Object} [options]
     * @param {boolean} [options.is_hide_title_version]
     * @param {Dialogsx.Button.Text} [options.on_interrupt_btn_text='B']
     * @param {boolean} [options.local_project_path]
     * @param {string} [options.success_title]
     * @param {string[]} [options.ignore_list]
     * @example
     * project.deploy('latest');
     */
    deploy(version, callback, options) {
        let _opt = options || {};
        let _cbk = callback || {};
        let _onStart = _cbk.onDeployStart || _cbk.onStart || (r => r);
        let _onSuccess = _cbk.onDeploySuccess || _cbk.onSuccess || (r => r);
        let _onFailure = _cbk.onDeployFailure || _cbk.onFailure || console.error;

        let _getVersionByTag = (tag) => {
            if (tag.match(/^(newest|latest)$/)) {
                return this.getNewestRelease({show_progress_dialog: true});
            }
            if (tag.match(/^(newest|latest)_cared$/)) {
                return this.getNewestReleaseCared({
                    show_progress_dialog: true,
                    ignore_list: _opt.ignore_list,
                });
            }
            let _ver = null;
            this.getReleases({
                per_page: 100, show_progress_dialog: true,
            }).some(o => (_ver = o).version_name === tag);
            return _ver;
        };

        if (isNullish(version)) {
            throw Error('A version for project.deploy() must be defined');
        }
        if (typeof version === 'string') {
            version = _getVersionByTag(version);
            if (!version) {
                if (global._$_get_proj_releases_interrupted) {
                    delete global._$_get_proj_releases_interrupted;
                    return;
                } else {
                    throw Error('Cannot parse version tag for project.deploy()');
                }
            }
        }
        if (typeof version !== 'object') {
            throw Error('Cannot parse version for project.deploy()');
        }

        // maybe 'tar' will be supported some day
        let _file_ext = 'zip';
        // like: 'https://api.github.com/.../zipball/v2.0.4'
        let _url = version[_file_ext + 'ball_url'];
        // like: 'v2.0.4'
        let _file_name = _url.slice(_url.lastIndexOf(filesx.sep) + 1);
        // like: 'v2.0.4.zip'
        let _file_full_name = _file_name + '.' + _file_ext;
        // like: '/sdcard/.local/bak/ant-forest/v2.0.4.zip'
        let _full_path = files.join(filesx['.local']('bak', 'ant-forest', _file_full_name));

        let _cont_len = -1;
        let _tt_suff = _opt.is_hide_title_version ? '' : '\x20' + version.version_name;

        let _steps = _.step;
        let _diag_dn = dialogsx.buildFlow({
            title: '正在部署项目' + _tt_suff,
            success_title: _opt.success_title || '部署完成',
            on_interrupt_btn_text: _opt.on_interrupt_btn_text || 'B',
            show_min_max: true,
            onStart(v, d) {
                _onStart();
                dialogsx.setProgressColorTheme(d, 'download');
            },
            onSuccess(o, d) {
                _onSuccess(o, d);
            },
            onFailure(o, d) {
                _onFailure(o, d);
                d.setFailureData(o);
            },
            steps: [{
                desc: _steps.download,
                action: (v, d) => new Promise((resolve, reject) => {
                    httpx.okhttp3Request(_url, {
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
                    }, {is_async: true, path: _full_path});
                }),
            }, {
                desc: _steps.decompress,
                action: (v, d) => new Promise((resolve, reject) => {
                    filesx.unzip(v.downloaded_path, null, {
                        onUnzipProgress: o => d.setProgressData(o),
                        onUnzipSuccess(r) {
                            let _path = r.unzipped_path;
                            if (!exp.isAlike(_path)) {
                                _path = files.join(_path, files.listDir(_path)[0]);
                            }
                            if (!exp.isAlike(_path)) {
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
                    if (!this.getLocalPath() || !this.getLocalVerName()) {
                        d.setStepDesc(3, '  [ 跳过 ]', true);
                        return resolve(v);
                    }
                    this.backup({
                        onBackupProgress: o => d.setProgressData(o),
                        onBackupSuccess: r => resolve(Object.assign(v, {backup: r})),
                        onBackupFailure: e => reject(e),
                    }, {remark: '版本升级前的自动备份', is_save_storage: true});
                }),
            }, {
                desc: _steps.files_update,
                action: (v, d) => new Promise((resolve, reject) => {
                    let _tar = this.getLocalPath(true);
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

        httpx.getContentLength(_url, function (value) {
            _diag_dn.setStepDesc(1, '  [ ' + $$cvt.bytes(_cont_len = value, 'B', {
                fixed: 1, space: true,
            }) + ' ]', true);
        }, {timeout: 15e3, concurrence: 15});
    },
    /**
     * @param {Object} [callback]
     * @param {function():*} [callback.onStart]
     * @param {function():*} [callback.onBackupStart]
     * @param {function(data:{processed:number,total:number},diag:JsDialog$):*} [callback.onProgress]
     * @param {function(data:{processed:number,total:number},diag:JsDialog$):*} [callback.onBackupProgress]
     * @param {Appx.Project.Backup.OnSuccess} [callback.onSuccess]
     * @param {Appx.Project.Backup.OnSuccess} [callback.onBackupSuccess]
     * @param {function(value:*=):*} [callback.onFailure]
     * @param {function(value:*=):*} [callback.onBackupFailure]
     * @param {Object} [options]
     * @param {'cwd'|'current'|string} [options.source_path='cwd']
     * @param {boolean} [options.is_show_dialog=false]
     * @param {boolean} [options.is_save_storage=false]
     * @param {string} [options.remark='手动备份']
     * @return {boolean|Dialogsx.BuildProgress.Extension}
     */
    backup(callback, options) {
        let _cbk = callback || {};
        let _opt = options || {};

        let _now_ts = Date.now();
        let _local_ver_name = this.getLocalVerName();
        let _local_ver_hex = appx.version.getHex(_local_ver_name);

        let _def_bak_path = filesx['.local']('bak', 'ant-forest');
        let _bak_file_name = $$cvt.date(_now_ts, 'yyMMddhhmmss') + '-' + _local_ver_hex + '.zip';
        let _bak_dest_path = files.join(_def_bak_path, _bak_file_name);

        let _locateProject = () => {
            let _cwd = _opt.source_path;
            if (!_cwd || _cwd === 'cwd' || _cwd === 'current') {
                _cwd = files.cwd();
            }
            if (!files.isDir(_cwd)) {
                throw Error('source_path for project.backup must be a directory');
            }
            if (this.isAlike(_cwd)) {
                return _cwd;
            }
            _cwd = new File(_cwd).getParent();
            if (this.isAlike(_cwd)) {
                return _cwd;
            }
            let _aj_wd = filesx.getScriptDirPath();
            let _proj_def_n = 'Ant-Forest-003';
            _cwd = files.join(_aj_wd, _proj_def_n);
            if (this.isAlike(_cwd)) {
                return _cwd;
            }
            throw Error('Unable to locate Ant-Forest project folder');
        };

        let _handleSourcePath = () => {
            let _tmp_path = files.join(_def_bak_path, '.' + _now_ts) + filesx.sep;
            files.createWithDirs(_tmp_path);

            let _proj_path = _locateProject();
            filesx.copy(_proj_path, _tmp_path, {
                is_unbundled: true,
                filter: name => _.structure
                    .map(o => o.name.replace(/^\//, '')).includes(name),
            });

            return _tmp_path;
        };

        let _backup = (internal_dialog_callback) => {
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
                        let _af_bak = storagesx.af_bak;
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
        };

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
    },
    /**
     * @async
     * @param {*} [source] - local zip path or url
     * @param {Object} [callback]
     * @param {function():*} [callback.onStart]
     * @param {function():*} [callback.onRestoreStart]
     * @param {function(value:{target_path:string}=):*} [callback.onSuccess]
     * @param {function(value:{target_path:string}=):*} [callback.onRestoreSuccess]
     * @param {function(value:*=):*} [callback.onFailure]
     * @param {function(value:*=):*} [callback.onRestoreFailure]
     * @return {boolean|Dialogsx.BuildProgress.Extension}
     */
    restore(source, callback) {
        let _steps = _.step;
        let _cbk = callback || {};
        let _onStart = _cbk.onRestoreStart || _cbk.onStart || (r => r);

        let _preset = {
            local: {
                title: '正在从本地恢复',
                success_title: '本地恢复完成',
                '1st_step': {
                    desc: _steps.files_check,
                    action: () => {
                        let _src = files.path(source);
                        if (!files.exists(_src)) {
                            throw Error('Source file of project.restore() doesn\'t exist');
                        }
                        if (!filesx.isValidZip(_src)) {
                            throw Error('Source file of project.restore() is corrupted');
                        }
                        return {zip_src_file: _src};
                    },
                },
            },
            server: {
                title: '正在从服务器恢复',
                success_title: '服务器恢复完成',
                '1st_step': {
                    desc: _steps.download,
                    action: (v, d) => new Promise((resolve, reject) => {
                        let _cont_len = -1;
                        httpx.getContentLength(source, function (value) {
                            d.setStepDesc(1, '  [ ' + $$cvt.bytes(_cont_len = value, 'B', {
                                fixed: 1, space: true,
                            }) + ' ]', true);
                        }, {timeout: 15e3, concurrence: 15});

                        let _file_name = source.slice(source.lastIndexOf(filesx.sep) + 1);
                        let _bak_path = filesx['.local']('bak', 'ant-forest');
                        let _full_path = files.join(_bak_path, _file_name + '.zip');

                        httpx.okhttp3Request(source, {
                            onStart() {
                                let _l = _cont_len / 1024;
                                let _p = _l < 0 ? '' : '0KB/' + _l.toFixed(1) + 'KB';
                                dialogsx.setProgressNumberFormat(d, _p);
                            },
                            onDownloadProgress(o) {
                                let _p = o.processed / 1024;
                                o.total = Math.max(o.total, _cont_len);
                                let _t = o.total / 1024;
                                dialogsx.setProgressNumberFormat(d, '%.1fKB/%.1fKB', [_p, _t]);
                                d.setProgressData(o);
                            },
                            onDownloadSuccess(r) {
                                resolve({zip_src_file: r.downloaded_path});
                                dialogsx.clearProgressNumberFormat(d);
                            },
                            onDownloadFailure(e) {
                                reject(e);
                            },
                        }, {is_async: true, path: _full_path});
                    }),
                },
            },
        };
        /** @type {'local'|'server'} */
        let _mode = 'local';
        if (!files.exists(source)) {
            _mode = 'server';
            if (!source.match(/^https?:\/\//)) {
                // noinspection HttpUrlsUsage
                source = 'http://' + source;
            }
        }
        let _cfg = _preset[_mode];

        dialogsx.buildFlow({
            title: _cfg.title,
            success_title: _cfg.success_title,
            show_min_max: true,
            onStart(v, d) {
                _onStart();
                dialogsx.setProgressColorTheme(d, 'restore');
                dialogsx.clearProgressNumberFormat(d);
            },
            onSuccess: _cbk.onRestoreSuccess || _cbk.onSuccess,
            onFailure: _cbk.onRestoreFailure || _cbk.onFailure,
            steps: [_cfg['1st_step'], {
                desc: _steps.decompress,
                action: (v, d) => new Promise((resolve, reject) => {
                    filesx.unzip(v.zip_src_file, null, {
                        onProgress: o => d.setProgressData(o),
                        onSuccess(r) {
                            let _path = r.unzipped_path;
                            if (!exp.isAlike(_path)) {
                                _path = files.join(_path, files.listDir(_path)[0]);
                            }
                            if (exp.isAlike(_path)) {
                                resolve(Object.assign(v, {
                                    unzipped_files_path: r.unzipped_path,
                                    unzipped_proj_path: _path,
                                }));
                            } else {
                                reject('Cannot locate project path in unzipped files');
                            }
                        },
                        onFailure: e => reject(e),
                    }, {to_archive_name_folder: true, is_delete_source: false});
                }),
            }, {
                desc: _steps.files_update,
                action: (v, d) => new Promise((resolve, reject) => {
                    let _tar = this.getLocalPath(true);
                    filesx.copy(v.unzipped_proj_path, _tar, {is_unbundled: true}, {
                        onProgress: o => d.setProgressData(o),
                        onSuccess: () => resolve(Object.assign(v, {tar_proj_path: _tar})),
                        onFailure: e => reject(e),
                    });
                }),
            }, {
                desc: _steps.finish_restore,
                action: (v, d) => new Promise((resolve, reject) => {
                    filesx.deleteByList(v.unzipped_files_path, {is_async: true}, {
                        onStart: () => _mode === 'server' && files.remove(v.zip_src_file),
                        onProgress: o => d.setProgressData(o),
                        onSuccess: () => resolve({target_path: v.tar_proj_path}),
                        onFailure: e => reject(e),
                    });
                }),
            }],
        }).act();
    },
};

/**
 * @type {Mod.project}
 */
module.exports = {project: exp};