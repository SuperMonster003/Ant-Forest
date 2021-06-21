global.appx = typeof global.appx === 'object' ? global.appx : {};

let ext = {
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
     * @returns {boolean}
     */
    isAutoJsPro() {
        return (this.isAutoJsPro = () => !!this.getAutoJsPkgName().match(/pro/))();
    },
    /**
     * @example
     * console.log(appx.getAutoJsName()); // like: 'Auto.js'
     * @returns {string}
     */
    getAutoJsName() {
        return 'Auto.js' + (this.isAutoJsPro() ? ' Pro' : '');
    },
    /**
     * @example
     * console.log(appx.getAutoJsPkg()); // like: 'org.autojs.autojs'
     * @returns {string}
     */
    getAutoJsPkgName() {
        return context.getPackageName();
    },
    /**
     * @example
     * console.log(appx.getAutoJsVer()); // like: '4.1.1 Alpha2'
     * @returns {string}
     */
    getAutoJsVerName() {
        try {
            let _aj_pkg = this.getAutoJsPkgName();
            let _pkg_mgr = context.getPackageManager();
            let _pkgs = _pkg_mgr.getInstalledPackages(0).toArray();
            for (let i in _pkgs) {
                if (_pkgs.hasOwnProperty(i)) {
                    let _pkg = _pkgs[i];
                    if (_pkg.packageName === _aj_pkg) {
                        return (this.getAutoJsVerName = () => _pkg.versionName)();
                    }
                }
            }
        } catch (e) {
            console.warn(e);
        }
        return '';
    },
    /**
     * @param {string} source
     * @example
     * let _pkg = 'com.eg.android.AlipayGphone';
     * let _app = 'Alipay';
     * console.log(appx.getAppPkgName(_app)); // "com.eg.android.AlipayGphone"
     * console.log(appx.getAppName(_pkg)); // "Alipay"
     * console.log(appx.getAppPkgName(_pkg)); // "com.eg.android.AlipayGphone"
     * console.log(appx.getAppName(_app)); // "Alipay"
     * @returns {string|null}
     */
    getAppName(source) {
        if (source) {
            if (source.match(/.+\..+\./)) {
                return app.getAppName(source);
            }
            if (app.getPackageName(source)) {
                return source;
            }
        }
        return null;
    },
    /**
     * @param {string} source
     * @example
     * let _pkg = 'com.eg.android.AlipayGphone';
     * let _app = 'Alipay';
     * console.log(appx.getAppPkgName(_app)); // "com.eg.android.AlipayGphone"
     * console.log(appx.getAppName(_pkg)); // "Alipay"
     * console.log(appx.getAppPkgName(_pkg)); // "com.eg.android.AlipayGphone"
     * console.log(appx.getAppName(_app)); // "Alipay"
     * @returns {string|null}
     */
    getAppPkgName(source) {
        if (source) {
            if (!source.match(/.+\..+\./)) {
                return app.getPackageName(source);
            }
            if (app.getAppName(source)) {
                return source;
            }
        }
        return null;
    },
    /**
     * Returns the version name of an app with app name or package name
     * @param {'current'|string} source - app name or app package name
     * @returns {string|null}
     */
    getAppVerName(source) {
        let _src = source === 'current' ? currentPackage() : source;
        let _pkg_name = this.getAppPkgName(_src);
        if (_pkg_name) {
            try {
                /** @type {android.content.pm.PackageInfo[]} */
                let _i_pkgs = context.getPackageManager().getInstalledPackages(0).toArray();
                _i_pkgs.some((i_pkg) => {
                    if (i_pkg.packageName === _pkg_name) {
                        return i_pkg.versionName;
                    }
                });
            } catch (e) {
                // nothing to do here
            }
        }
        return null;
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
        let _sep = java.io.File.separator;
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
        console.warn('Both ' + _json_name + ' and ' + _main_name + ' are not exist');
        return _res;
    },
    /**
     * @returns {string}
     */
    getProjectLocalPath(is_with_creation) {
        let _cwd = files.cwd();
        if (this.isProjectLike(_cwd)) {
            return _cwd;
        }
        _cwd = new java.io.File(_cwd).getParent();
        if (this.isProjectLike(_cwd)) {
            return _cwd;
        }
        let _aj_wd = filesx.getScriptDirPath();
        let _sep = java.io.File.separator;
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
     * @returns {string}
     */
    getProjectLocalVerName() {
        return this.getProjectLocal().version_name;
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
                        return info.desc + ': ' + _v;
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
    /**
     * @param {Object} [options]
     * @param {string} [options.min_version_name='v0.0.0']
     * @param {boolean} [options.no_extend=false]
     * @param {boolean} [options.show_progress_dialog=false]
     * @param {function(item:GithubReleasesResponseExtendedListItem|void)} [callback]
     * @returns {GithubReleasesResponseExtendedListItem|void}
     */
    getProjectNewestReleaseCared(options, callback) {
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
            // noinspection JSValidateTypes
            return _this.getProjectReleases(Object.assign(options || {}, {
                max_items: 100, per_page: 100,
            })).filter(o => _this.isVersionCared(o))[0];
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
                    let _url = new java.net.URL(url);
                    let _cxn = _url.openConnection();
                    _cxn.setRequestMethod('GET');
                    _cxn.setConnectTimeout(15e3);
                    _cxn.setReadTimeout(15e3);
                    _cxn.connect();

                    let _code = _cxn.getResponseCode();
                    if (_code !== java.net.HttpURLConnection.HTTP_OK) {
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
                    let _br = new java.io.BufferedReader(new java.io.InputStreamReader(_is));
                    let _sb = new java.lang.StringBuilder();
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
     * Returns if a version is ignored in the given list
     * @param {string|{version_name:string}} ver
     * @param {string[]} [list]
     * @returns {boolean}
     */
    isVersionIgnored(ver, list) {
        let _ls = list || global.$$cfg && (
            $$cfg.update_ignore_list || $$cfg.ses && $$cfg.ses.update_ignore_list
        );
        if (!_ls) {
            throw Error('No available list for appx.isVersionIgnored()');
        }
        if (typeof ver === 'string') {
            return _ls.includes(ver);
        }
        return _ls.includes(ver.version_name);
    },
    /**
     * Returns if a version is not ignored in the given list
     * @param {string|{version_name:string}} ver
     * @param {string[]} [list]
     * @returns {boolean}
     */
    isVersionCared(ver, list) {
        let _ls = list || global.$$cfg && (
            $$cfg.update_ignore_list || $$cfg.ses && $$cfg.ses.update_ignore_list
        );
        if (!_ls) {
            throw Error('No available list for appx.isVersionCared()');
        }
        return !this.isVersionIgnored(ver, _ls);
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

        let _files = files.listDir(_path = new java.io.File(_path).getAbsolutePath());

        return this._project_structure.filter(o => o.necessary).map((o) => (
            o.name[0] === '/' ? {name: o.name.slice(1), is_dir: true} : {name: o.name}
        )).every((o) => {
            if (~_files.indexOf(o.name)) {
                let _cA = o.is_dir;
                let _cB = files.isDir(_path + java.io.File.separator + o.name);
                return _cA && _cB || !_cA && !_cB;
            }
        });
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
        let _bak_path = require('./mod-default-config').settings.local_backup_path;
        // like: '/sdcard/.local/bak/ant-forest/v2.0.4.zip'
        let _full_path = _bak_path + java.io.File.separator + _file_full_name;

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
                                _path += java.io.File.separator + files.listDir(_path)[0];
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
        let _sep = java.io.File.separator;
        let _cbk = callback || {};
        let _opt = options || {};

        let _now_ts = Date.now();
        let _local_ver_name = _appx.getProjectLocalVerName();
        let _local_ver_hex = _appx.getVerHex(_local_ver_name);

        let _def_bak_path = require('./mod-default-config').settings.local_backup_path;
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
                _cwd = new java.io.File(_cwd).getParent();
                if (_appx.isProjectLike(_cwd)) {
                    return _cwd;
                }
                let _aj_wd = filesx.getScriptDirPath();
                let _sep = java.io.File.separator;
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
     * @async
     * @param {*} [source] - local zip path or url
     * @param {Object} [callback]
     * @param {function():*} [callback.onStart]
     * @param {function():*} [callback.onRestoreStart]
     * @param {function(value:{target_path:string}=):*} [callback.onSuccess]
     * @param {function(value:{target_path:string}=):*} [callback.onRestoreSuccess]
     * @param {function(value:*=):*} [callback.onFailure]
     * @param {function(value:*=):*} [callback.onRestoreFailure]
     * @returns {boolean|BuildProgressExtendedJsDialog}
     */
    restoreProject(source, callback) {
        let _appx = this;
        let _steps = this._project_step;

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
                            throw Error('Source file of appx.restoreProject() doesn\'t exist');
                        }
                        if (!filesx.isValidZip(_src)) {
                            throw Error('Source file of appx.restoreProject() is corrupted');
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

                        let _file_name = source.slice(source.lastIndexOf('/') + 1);
                        let _bak_path = require('./mod-default-config').settings.local_backup_path;
                        let _full_path = _bak_path + java.io.File.separator + _file_name + '.zip';

                        httpx.okhttp3Request(source, _full_path, {
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
                        }, {is_async: true});
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
                            if (!_appx.isProjectLike(_path)) {
                                _path += java.io.File.separator + files.listDir(_path)[0];
                            }
                            if (!_appx.isProjectLike(_path)) {
                                reject('Cannot locate project path in unzipped files');
                            }
                            resolve(Object.assign(v, {
                                unzipped_files_path: r.unzipped_path,
                                unzipped_proj_path: _path,
                            }));
                        },
                        onFailure: e => reject(e),
                    }, {to_archive_name_folder: true, is_delete_source: false});
                }),
            }, {
                desc: _steps.files_update,
                action: (v, d) => new Promise((resolve, reject) => {
                    let _tar = _appx.getProjectLocalPath(true);
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
     * @param {number|string} ver
     * @param {string|null} [prefix='v']
     * @example
     * console.log(appx.parseVerHex('02000404')); // 'v2.0.4 Alpha4'
     * console.log(appx.parseVerHex('0d780e83')); // 'v13.120.14 Beta3'
     * console.log(appx.parseVerHex('0a0200ff')); // 'v10.2.0'
     * console.log(appx.parseVerHex(167903487)); // 'v10.2.0'
     * @returns {string}
     */
    parseVerHex(ver, prefix) {
        if (typeof ver === 'number') {
            ver = ('0'.repeat(7) + ver.toString(16)).slice(-8);
        }
        if (!ver) {
            throw Error('A "version" must be defined for appx.parseVerHex()');
        }
        let _max_alpha = 0x80;
        return ver.replace(/^0x/, '').replace(/(..)(..)(..)(..)/g, ($0, $1, $2, $3, $4) => {
            let _$a = [$1, $2, $3].map(s => Number('0x' + s)).join('.');
            let _$4 = Number('0x' + $4);
            let _$b = '';
            if (_$4 <= _max_alpha) {
                _$b = ' Alpha' + (_$4 === 1 ? '' : _$4);
            } else if (_$4 < 0xff) {
                _$4 -= _max_alpha;
                _$b = ' Beta' + (_$4 === 1 ? '' : _$4);
            }
            return (prefix === null ? '' : prefix || 'v') + _$a + _$b;
        });
    },
    /**
     * @param {string} ver
     * @example
     * console.log(appx.parseVerName('2.0.4')); // "v2.0.4"
     * console.log(appx.parseVerName('v2.0.4')); // "v2.0.4"
     * console.log(appx.parseVerName('v2.0.4a7')); // "v2.0.4 Alpha7"
     * console.log(appx.parseVerName('v2.0.4 a7')); // "v2.0.4 Alpha7"
     * console.log(appx.parseVerName('v2.0.4 alpha7')); // "v2.0.4 Alpha7"
     * console.log(appx.parseVerName('2.0.4 alpha 7')); // "v2.0.4 Alpha7"
     * @returns {string}
     */
    parseVerName(ver) {
        let _rex = /^v?\d+\.\d+\.\d+\s*(a(lpha)?|b(eta)?)?\s*\d*$/i;
        return ver.match(_rex) ? this.parseVerHex(this.getVerHex(ver)) : '';
    },
    /**
     * Returns if 1st version is newer than 2nd version
     * @example Source code summary (zh-CN: 源代码摘要)
     * return verWeight(a) > verWeight(b);
     * @example
     * console.log(appx.isNewerVersion('v2.0.4, 'v2.0.1')); // true
     * console.log(appx.isNewerVersion('v2.0.4 Alpha7', 'v2.0.4')); // false
     * console.log(appx.isNewerVersion('v2.0.4 Beta2', 'v2.0.4 Alpha3')); // true
     * @param {string|{version_name:string}} a
     * @param {string|{version_name:string}} b
     * @returns {boolean}
     */
    isNewerVersion(a, b) {
        return this.getVerHex(a) > this.getVerHex(b);
    },
    /**
     * Check if device is running compatible (relatively) Auto.js version and android sdk version
     */
    checkSdkAndAJVer() {
        let _this = this;

        _chkSdk();
        _chkVer();

        // tool function(s) //

        function _chkSdk() {
            if (device.sdkInt < 24) {
                messageAction('脚本无法继续', 4, 0, 0, 'up');
                messageAction('安卓系统版本低于7.0', 8, 1, 1, 1);
            }
        }

        function _chkVer() {
            let _aj_ver = _this.getAutoJsVerName();
            let _bugs_map = {
                failed: '版本信息获取失败',
                ab_cwd: 'cwd()方法功能异常',
                ab_engines_setArguments: 'engines.setArguments()功能异常',
                ab_find_forEach: 'UiSelector.find().forEach()方法功能异常',
                ab_floaty: 'Floaty模块异常',
                ab_floaty_rawWindow: 'floaty.rawWindow()功能异常',
                ab_relative_path: '相对路径功能异常',
                ab_setGlobalLogConfig: 'console.setGlobalLogConfig()功能异常',
                ab_SimpActAuto: 'SimpleActionAutomator模块异常',
                ab_inflate: 'ui.inflate()方法功能异常',
                ab_uiSelector: 'UiSelector模块功能异常',
                ab_ui_layout: 'UI页面布局异常',
                crash_autojs: '脚本运行后导致Auto.js崩溃',
                crash_ui_call_ui: 'ui脚本调用ui脚本会崩溃',
                crash_ui_settings: '图形配置页面崩溃',
                dislocation_floaty: 'Floaty模块绘制存在错位现象',
                dialogs_event: 'Dialogs模块事件失效',
                dialogs_not_responded: '无法响应对话框点击事件',
                forcibly_update: '强制更新',
                na_login: '无法登陆Auto.js账户',
                press_block: 'press()方法时间过短时可能出现阻塞现象',
                un_cwd: '不支持cwd()方法及相对路径',
                un_engines: '不支持Engines模块',
                un_execArgv: '不支持Engines模块的execArgv对象',
                un_inflate: '不支持ui.inflate()方法',
                un_relative_path: '不支持相对路径',
                un_runtime: '不支持runtime参数',
                un_view_bind: '不支持view对象绑定自定义方法',
                not_full_function: '此版本未包含所需全部功能',
                alipay_a11y_blocked: '支付宝无障碍功能被屏蔽',
            };

            let _bug_chk_res = _chkBugs(_aj_ver);
            if (_bug_chk_res === 0) {
                return debugInfo('Bug版本检查: 正常');
            }
            if (_bug_chk_res === '') {
                return debugInfo('Bug版本检查: 未知');
            }
            let _bug_chk_content = _bug_chk_res.map((code) => {
                return '\n' + (_bugs_map[code] || '/* 无效的Bug描述 */');
            });

            debugInfo('Bug版本检查: 确诊');

            let _alert_msg = '此项目无法正常运行\n' + '请更换 Auto.js 版本\n\n' +
                '软件版本:' + '\n' + (_aj_ver || '/* 版本检测失败 */') + '\n\n' +
                '异常详情:' + _bug_chk_content.join('') + '\n\n' +
                '在项目简介中查看支持版本\n' + '或直接尝试 v4.1.1 Alpha2';

            _this.getVerHex(_aj_ver) >= _this.getVerHex(7) ? _dialog() : _alert();

            // tool function(s) //

            /**
             * @param {string} ver
             * @returns {string[]|number|string} -- strings[]: bug codes; 0: normal; '': unrecorded
             */
            function _chkBugs(ver) {
                // version ∈ 4.1.1
                // version <= Pro 8.3.16-0
                // version === Pro 7.0.0-(4|6) || version === Pro 7.0.2-4
                // version === Pro 7.0.3-7 || version === Pro 7.0.4-1
                if (ver.match(/^(4\.1\.1.+)$/) ||
                    ver.match(/^Pro 8\.([0-2]\.\d{1,2}-\d|3\.(\d|1[0-6])-0)$/) ||
                    ver.match(/^Pro 7\.0\.(0-[46]|2-4|3-7|4-1)$/)
                ) {
                    return 0; // known normal
                }

                // version > Pro 8.3.16
                if (ver.match(/^Pro ([89]|\d{2})\./)) {
                    $$a11y.bridge.resetWindowFilter();
                    return 0;
                }

                // 4.1.0 Alpha3 <= version <= 4.1.0 Alpha4
                if (ver.match(/^4\.1\.0 Alpha[34]$/)) {
                    return ['ab_SimpActAuto', 'dialogs_not_responded'];
                }

                // version === 4.1.0 Alpha(2|5)?
                if (ver.match(/^4\.1\.0 Alpha[25]$/)) {
                    return ['dialogs_not_responded'];
                }

                // 4.0.x versions
                if (ver.match(/^4\.0\./)) {
                    return ['dialogs_not_responded', 'not_full_function'];
                }

                // version === Pro 7.0.0-(1|2)
                if (ver.match(/^Pro 7\.0\.0-[12]$/)) {
                    return ['ab_relative_path'];
                }

                // version === Pro 7.0.0-7 || version === Pro 7.0.1-0 || version === Pro 7.0.2-(0|3)
                if (ver.match(/^Pro 7\.0\.((0-7)|(1-0)|(2-[03]))$/)) {
                    return ['crash_autojs'];
                }

                // version >= 4.0.2 Alpha7 || version === 4.0.3 Alpha([1-5]|7)?
                if (ver.match(/^((4\.0\.2 Alpha([7-9]|\d{2}))|(4\.0\.3 Alpha([1-5]|7)?))$/)) {
                    return ['dislocation_floaty', 'ab_inflate', 'not_full_function'];
                }

                // version >= 3.1.1 Alpha5 || version -> 4.0.0/4.0.1 || version <= 4.0.2 Alpha6
                if (ver.match(/^((3\.1\.1 Alpha[5-9])|(4\.0\.[01].+)|(4\.0\.2 Alpha[1-6]?))$/)) {
                    return ['un_execArgv', 'ab_inflate', 'not_full_function'];
                }

                // 3.1.1 Alpha3 <= version <= 3.1.1 Alpha4:
                if (ver.match(/^3\.1\.1 Alpha[34]$/)) {
                    return ['ab_inflate', 'un_engines', 'not_full_function'];
                }

                // version >= 3.1.0 Alpha6 || version <= 3.1.1 Alpha2
                if (ver.match(/^((3\.1\.0 (Alpha[6-9]|Beta))|(3\.1\.1 Alpha[1-2]?))$/)) {
                    return ['un_inflate', 'un_engines', 'not_full_function'];
                }

                // version >= 3.0.0 Alpha42 || version ∈ 3.0.0 Beta[s] || version <= 3.1.0 Alpha5
                if (ver.match(/^((3\.0\.0 ((Alpha(4[2-9]|[5-9]\d))|(Beta\d?)))|(3\.1\.0 Alpha[1-5]?))$/)) {
                    return ['un_inflate', 'un_runtime', 'un_engines', 'not_full_function'];
                }

                // 3.0.0 Alpha37 <= version <= 3.0.0 Alpha41
                if (ver.match(/^3\.0\.0 Alpha(3[7-9]|4[0-1])$/)) {
                    return ['ab_cwd', 'un_relative_path', 'un_inflate', 'un_runtime', 'un_engines', 'not_full_function'];
                }

                // 3.0.0 Alpha21 <= version <= 3.0.0 Alpha36
                if (ver.match(/^3\.0\.0 Alpha(2[1-9]|3[0-6])$/)) {
                    return ['un_cwd', 'un_inflate', 'un_runtime', 'un_engines', 'not_full_function'];
                }

                // version <= 3.0.0 Alpha20
                if (ver.match(/^3\.0\.0 Alpha([1-9]|1\d|20)?$/)) {
                    return ['un_cwd', 'un_inflate', 'un_runtime', 'un_engines', 'crash_ui_settings', 'not_full_function'];
                }

                switch (ver) {
                    case '4.0.3 Alpha6':
                        return ['ab_floaty', 'ab_inflate', 'not_full_function'];
                    case '4.0.4 Alpha':
                        return ['dislocation_floaty', 'un_view_bind', 'not_full_function'];
                    case '4.0.4 Alpha3':
                        return ['dislocation_floaty', 'ab_ui_layout', 'not_full_function'];
                    case '4.0.4 Alpha4':
                        return ['ab_find_forEach', 'not_full_function'];
                    case '4.0.4 Alpha12':
                        return ['un_execArgv', 'not_full_function'];
                    case '4.0.5 Alpha':
                        return ['ab_uiSelector', 'not_full_function'];
                    case 'Pro 7.0.0-0':
                        return ['na_login'];
                    case 'Pro 7.0.0-3':
                        return ['crash_ui_call_ui'];
                    case 'Pro 7.0.0-5':
                        return ['forcibly_update'];
                    case 'Pro 7.0.3-1':
                        return ['dialogs_event'];
                    case 'Pro 7.0.3-4':
                        return ['ab_setGlobalLogConfig'];
                    case 'Pro 7.0.3-5':
                        return ['ab_floaty_rawWindow'];
                    case 'Pro 7.0.3-6':
                        return ['ab_engines_setArguments', 'press_block'];
                    case 'Pro 7.0.4-0':
                        return ['crash_ui_settings'];
                    default:
                        return ''; // unrecorded version
                }
            }

            function _dialog() {
                // noinspection HtmlUnknownTarget,HtmlRequiredAltAttribute
                let _view = ui.inflate(
                    <vertical gravity="center">
                        <img id="img" src="@drawable/ic_warning_black_48dp"
                             height="70" margin="0 26 0 18" gravity="center"
                             bg="?selectableItemBackgroundBorderless"/>
                        <vertical>
                            <text id="text" gravity="center" color="#ddf3e5f5"
                                  padding="5 0 5 20" size="19"/>
                        </vertical>
                        <horizontal w="auto">
                            <button id="btn" type="button" layout_weight="1"
                                    text="EXIT" backgroundTint="#ddad1457"
                                    textColor="#ddffffff" marginBottom="9"/>
                        </horizontal>
                    </vertical>);
                let _diag = dialogs.build({
                    customView: _view,
                    autoDismiss: false,
                    canceledOnTouchOutside: false,
                }).show();

                let _is_continued = false;

                ui.run(() => {
                    _diag.setOnKeyListener({
                        onKey(diag, key_code) {
                            if (key_code === android.view.KeyEvent.KEYCODE_BACK) {
                                _exitNow();
                                return true;
                            }
                            return false;
                        },
                    });

                    _view['btn'].on('click', _exitNow);
                    _view['btn'].on('long_click', (e) => {
                        e.consumed = _is_continued = true;
                        if (typeof activity !== 'undefined') {
                            return _exitNow();
                        }
                        _diag.dismiss();
                        let _msg = '仍然尝试运行项目';
                        toast(_msg);
                        console.error(_msg);
                    });
                    _view['text'].setText(_alert_msg);
                    _setTint(_view['img'], '#ff9100');

                    let _win = _diag.getWindow();
                    _win.setBackgroundDrawableResource(android.R.color.transparent);
                    _win.setWindowAnimations(android.R.style.Animation_InputMethod);
                    _win.setDimAmount(0.85);

                });

                if (typeof activity !== 'undefined') {
                    return setTimeout(() => exit(), 1e3);
                }

                let _start = Date.now();
                while (!_is_continued) {
                    sleep(200);
                    if (Date.now() - _start > 120e3) {
                        let _msg = '等待用户操作超时';
                        console.error(_msg);
                        return _exitNow(_msg);
                    }
                }

                // tool function(s) //

                function _setTint(view, color) {
                    if (typeof color === 'number') {
                        color = colors.toString(color);
                    }
                    view.setColorFilter(com.stardust.autojs.core.ui.inflater
                        .util.Colors.parse(view, color));
                }

                function _exitNow(msg) {
                    _diag.dismiss();
                    typeof msg === 'string' && toast(msg);
                    exit();
                }
            }

            function _alert() {
                alert('\n' + _alert_msg);
                exit();
            }
        }
    },
    /**
     * Make sure a11y is on service and try turning it on when necessary
     */
    checkAccessibility() {
        let _appx = this;
        let _getDash = () => '- '.repeat(17).trim();

        _checkSvc();
        _checkFunc();

        // tool function(s) //

        function _checkSvc() {
            if ($$a11y.state()) {
                return;
            }

            let _perm = 'android.permission.WRITE_SECURE_SETTINGS';
            let _pkg_n_perm = context.packageName + ' ' + _perm;

            let $_cfg = storagesx.create('af_cfg').get('config', {});
            if ($_cfg.auto_enable_a11y_svc === 'OFF') {
                return;
            }

            if (typeof activity !== 'undefined') {
                if ($$a11y.enable(true)) {
                    toast('已自动开启无障碍服务\n请重新运行一次配置工具');
                }
                return ui.finish();
            }

            _tryEnableAndRestart();
            if (_appx.hasRoot()) {
                shell('pm grant ' + _pkg_n_perm, true);
                _tryEnableAndRestart();
            }
            _failedHint();

            if (typeof auto.waitFor !== 'function') {
                try {
                    auto();
                } catch (e) {
                    // consume errors msg caused by auto()
                }
                exit();
            }

            let _thd = threads.start(function () {
                // script will continue running rather than stop
                // when accessibility service enabled by user
                auto.waitFor();
            });
            _thd.join(60e3);

            if (_thd.isAlive()) {
                showSplitLine();
                messageAction('等待用户开启无障碍服务超时', 4, 1);
                showSplitLine();
                exit();
            }

            // tool function(s) {

            function _failedHint() {
                let _shell_sc = 'adb shell pm grant ' + _pkg_n_perm;

                showSplitLine();
                messageAction('自动开启无障碍服务失败', 4);

                if (!_appx.hasSecure()) {
                    showSplitLine();
                    messageAction('Auto.js缺少以下权限:', 4);
                    messageAction('WRITE_SECURE_SETTINGS', 4);
                    showSplitLine();
                    messageAction('可尝试使用ADB工具连接手机', 3);
                    messageAction('并执行以下Shell指令(无换行):\n' +
                        '\n' + _shell_sc + '\n', 3);
                    messageAction('Shell指令已复制到剪切板', 3);
                    messageAction('重启设备后授权不会失效', 3);

                    setClip(_shell_sc);
                }
            }

            function _tryEnableAndRestart() {
                if ($$a11y.enable(true)) {
                    showSplitLine();
                    messageAction('已自动开启无障碍服务');
                    messageAction('尝试一次项目重启操作');
                    showSplitLine();
                    enginesx.restart({
                        debug_info_flag: true,
                        instant_run_flag: false,
                        max_restart_e_times: 1,
                    });
                    sleep(5e3);
                    exit();
                }
            }
        }

        function _checkFunc() {
            if (typeof activity === 'undefined') {
                let _max = 24;
                while (!press(1e8, 0, 1) && _max--) {
                    sleep(50);
                }
                if (_max < 0) {
                    showSplitLine();
                    void ('脚本无法继续|无障碍服务状态异常|或基于服务的方法无法使用|'
                        + _getDash() + '|可尝试以下解决方案:|' + _getDash()
                        + '|a. 卸载并重新安装"Auto.js"|b. 安装后重启设备'
                        + '|c. 运行"Auto.js"并拉出侧边栏|d. 开启无障碍服务'
                        + '|e. 再次尝试运行本项目').split('|').forEach(s => messageAction(s, 4));
                    showSplitLine();
                    toast('无障碍服务方法无法使用');
                    exit();
                }
            }
        }

    },
    /**
     * @param {string[]} modules
     * @param {Object} [options]
     * @param {boolean} [options.is_load=false]
     */
    checkModules(modules, options) {
        let _opt = options || {};
        let _line = () => '-'.repeat(33);
        let _dash = () => ' -'.repeat(17).slice(1);

        modules.filter((mod) => {
            let _path = './' + mod + '.js';
            try {
                let _mod = require(_path);
                if (_opt.is_load && typeof _mod.load === 'function') {
                    _mod.load.call(_mod);
                }
            } catch (e) {
                console.log(_line());
                console.warn(_path);
                console.log(_dash());
                console.warn(e.message);
                console.warn(e.stack);
                return true;
            }
        }).some((mod, idx, arr) => {
            let _str = '';
            _str += '脚本无法继续|以下模块缺失或加载失败:';
            _str += _dash().surround('|');
            arr.forEach(n => _str += '-> ' + n.surround('"'));
            _str += _dash().surround('|');
            _str += '请检查或重新放置模块';
            console.log(_line());
            _str.split('|').forEach(s => console.error(s));
            console.log(_line());
            toast('模块缺失或加载失败');
            exit();
        });
    },
    /**
     * Make sure that Alipay is installed on device
     */
    checkAlipayPackage() {
        let _pkg = 'com.eg.android.AlipayGphone';
        let _pkg_mgr = context.getPackageManager();
        let _app_name, _app_info;
        try {
            _app_info = _pkg_mgr.getApplicationInfo(_pkg, 0);
            _app_name = _pkg_mgr.getApplicationLabel(_app_info);
        } catch (e) {
            showSplitLine();
            console.warn(e.message);
            console.warn(e.stack);
        }
        if (!_app_name) {
            let _msg = '此设备可能未安装"支付宝"应用';
            toast(_msg);
            showSplitLine();
            console.error('脚本无法继续');
            console.error(_msg);
            showSplitLine();
            exit();
        }
        global._$_alipay_pkg = _pkg;
    },
    /**
     * Make sure System.SCREEN_OFF_TIMEOUT greater than min_timeout.
     * Abnormal value might be auto-corrected to default_timeout determined by is_auto_correction.
     * @param {Object} [options]
     * @property {number} [min_timeout=15000]
     * @property {number} [default_timeout=120000]
     * @property {boolean} [is_auto_correction=true]
     */
    checkScreenOffTimeout(options) {
        // checker for legacy bug (before v1.9.24 Beta)
        // which may cause a tiny value for `System.SCREEN_OFF_TIMEOUT`

        let System = android.provider.Settings.System;

        let _scr_off_tt = System.SCREEN_OFF_TIMEOUT;
        let _ctx_reso = context.getContentResolver();

        let _opt = options || {};

        let _scr_off_tt_val = System.getInt(_ctx_reso, _scr_off_tt, 0);
        let _min_timeout = _opt.min_timeout || 15 * 1e3; // 15 seconds
        let _def_timeout = _opt.default_timeout || 2 * 60e3; // 2 minutes
        let _def_mm = Number((_def_timeout / 60e3).toFixed(2));
        if (_scr_off_tt_val < _min_timeout) {
            if (_opt.is_auto_correction !== undefined && !_opt.is_auto_correction) {
                throw Error('Abnormal screen off timeout: ' + _scr_off_tt_val);
            }
            showSplitLine('', 'dash');
            messageAction('修正异常的设备屏幕超时参数');
            messageAction('修正值: ' + _def_timeout + ' (' + _def_mm + '分钟)');
            try {
                System.putInt(_ctx_reso, _scr_off_tt, _def_timeout);
            } catch (e) {
                console.error('修正失败');
                console.error(e.message);
            }
            showSplitLine('', 'dash');
        }
    },
    /**
     * Check if an activity intent is available to start
     * @param {IntentExtension} o
     * @returns {boolean}
     */
    checkActivity(o) {
        let _pkg_mgr = context.getPackageManager();
        let _query_res = _pkg_mgr.queryIntentActivities(this.intent(o), 0);
        return _query_res && _query_res.toArray().length !== 0;
    },
    /**
     * @param {IntentExtension} o
     * @returns {android.content.ComponentName}
     */
    resolveActivity(o) {
        return this.intent(o).resolveActivity(context.getPackageManager());
    },
    /**
     * A duplicate from Auto.js 4.1.1 Alpha2
     * because which of Auto.js Pro 7.0.0-4 may behave unexpectedly
     * @see app.intent
     * @param {string|android.content.Intent|IntentExtensionWithRoot} o
     * @example
     * appx.startActivity({
     *     url: {
     *         src: 'alipays://platformapi/startapp',
     *         query: {
     *             saId: 20000067,
     *             url: 'https://60000002.h5app.alipay.com/www/home.html',
     *             __webview_options__: {
     *                 transparentTitle: 'auto',
     *                 backgroundColor: '-1',
     *                 appClearTop: true,
     *                 startMultApp: true,
     *                 enableCubeView: false,
     *                 enableScrollBar: false,
     *             },
     *         },
     *     },
     *     packageName: 'com.eg.android.AlipayGphone',
     * });
     * @returns {void}
     */
    startActivity(o) {
        let _flag = android.content.Intent.FLAG_ACTIVITY_NEW_TASK;
        if (o instanceof android.content.Intent) {
            context.startActivity(new android.content.Intent(o).addFlags(_flag));
        } else if (typeof o === 'object') {
            if (o.root) {
                shell('am start ' + app.intentToShell(o), true);
            } else {
                context.startActivity(this.intent(o).addFlags(_flag));
            }
        } else if (typeof o === 'string') {
            let _cls = runtime.getProperty('class.' + o);
            if (!_cls) {
                throw new Error('Class ' + o + ' not found');
            }
            let _intent = new android.content.Intent(context, _cls).addFlags(_flag);
            context.startActivity(_intent);
        } else {
            throw Error('Unknown param for appx.startActivity()');
        }
    },
    /**
     * Substitution of app.intent()
     * @param {IntentExtension} o
     * @returns {android.content.Intent}
     */
    intent(o) {
        let _i = new android.content.Intent();

        if (o.url) {
            o.data = parseIntentUrl(o);
        }

        if (o.packageName) {
            if (o.className) {
                _i.setClassName(o.packageName, o.className);
            } else {
                // the Intent can only match the components
                // in the given application package with setPackage().
                // Otherwise, if there's more than one app that can handle the intent,
                // the system presents the user with a dialog to pick which app to use
                _i.setPackage(o.packageName);
            }
        }
        if (o.extras) {
            Object.keys(o.extras).forEach((key) => {
                _i.putExtra(key, (o.extras)[key]);
            });
        }
        if (o.category) {
            if (Array.isArray(o.category)) {
                for (let i = 0; o < o.category.length; i++) {
                    _i.addCategory((o.category)[i]);
                }
            } else {
                _i.addCategory(o.category);
            }
        }
        if (o.action) {
            if (!~o.action.indexOf('.')) {
                _i.setAction('android.intent.action.' + o.action);
            } else {
                _i.setAction(o.action);
            }
        }
        if (o.flags) {
            let flags = 0;
            if (flags instanceof Array) {
                for (let j = 0; j < flags.length; j++) {
                    flags |= parseIntentFlag(flags[j]);
                }
            } else {
                flags = parseIntentFlag(flags);
            }
            _i.setFlags(flags);
        }
        if (o.type) {
            if (o.data) {
                _i.setDataAndType(app.parseUri(o.data), o.type);
            } else {
                _i.setType(o.type);
            }
        } else if (o.data) {
            _i.setData(android.net.Uri.parse(o.data));
        }

        return _i;

        // tool function(s) //

        function parseIntentFlag(flag) {
            if (typeof flag === 'string') {
                return (android.content.Intent)['FLAG_' + flag.toUpperCase()];
            }
            return flag;
        }

        function parseIntentUrl(o) {
            let _url = o.url;
            if (typeof _url === 'object') {
                _url = _parseUrl(_url);
            }
            return _url;

            // tool function(s) //

            /**
             * @param {IntentUrl} o
             * @returns {string}
             */
            function _parseUrl(o) {
                let {src, query, exclude} = o;
                if (!src || !query) {
                    return src;
                }
                let _sep = src.match(/\?/) ? '&' : '?';
                return src + _sep + (function _parse(query) {
                    let _exclude = exclude || [];
                    if (!Array.isArray(_exclude)) {
                        _exclude = [_exclude];
                    }
                    return Object.keys(query).map((key) => {
                        let _val = query[key];
                        if (typeof _val === 'object') {
                            _val = '&' + _parse(_val);
                        }
                        if (!~_exclude.indexOf(key)) {
                            _val = encodeURI(_val);
                        }
                        return key + '=' + _val;
                    }).join('&');
                })(query);
            }
        }
    },
    /**
     * @typedef {Object} Appx$Launch$Options
     * @property {string} [package_name]
     * @property {string} [app_name]
     * @property {string} [task_name]
     * @property {function():*} [condition_launch]
     * @property {function():*} [condition_ready]
     * @property {function():*} [disturbance]
     * @property {boolean} [debug_info_flag]
     * @property {boolean} [is_show_greeting=true]
     * @property {boolean} [no_message_flag]
     * @property {number} [global_retry_times=2]
     * @property {number} [launch_retry_times=3]
     * @property {number} [ready_retry_times=5]
     * @property {number} [screen_orientation] - portrait: 0, landscape: 1
     */
    /**
     * Launch some app with package name or intent and wait for conditions ready if specified
     * @param {IntentCommonWithRoot|string|function|android.content.Intent} trigger
     * @param {Appx$Launch$Options} [options]
     * @example
     * appx.launch('com.eg.android.AlipayGphone');
     * appx.launch('com.eg.android.AlipayGphone', {
     *    task_name: '\u652F\u4ED8\u5B9D\u6D4B\u8BD5',
     *    // is_show_greeting: true,
     *    // no_message_flag: false,
     *    debug_info_flag: true,
     * });
     * appx.launch({
     *     action: 'VIEW',
     *     data: 'alipays://platformapi/startapp?appId=60000002&appClearTop=false&startMultApp=YES',
     * }, {
     *     package_name: 'com.eg.android.AlipayGphone',
     *     task_name: '\u8682\u8681\u68EE\u6797',
     *     debug_info_flag: true,
     *     condition_launch: () => currentPackage().match(/AlipayGphone/),
     *     condition_ready: () => descMatches(/../).find().size() > 6,
     *     launch_retry_times: 4,
     *     screen_orientation: 0,
     * });
     * @returns {boolean}
     */
    launch(trigger, options) {
        let _opt = options || {};
        _opt.no_impeded || typeof $$impeded === 'function' && $$impeded(this.launch.name);

        let _trig = trigger || 0;
        if (!~['object', 'string', 'function'].indexOf(typeof _trig)) {
            messageAction('应用启动目标参数无效', 8, 1, 0, 1);
        }

        let _pkg_name = '';
        let _app_name = '';
        let _task_name = _opt.task_name || '';
        let _1st_launch = true;

        _setAppName();

        _pkg_name = _pkg_name || _opt.package_name;
        _app_name = _app_name || _opt.app_name;

        let _name = (_task_name || _app_name).replace(/^["']+|["']+$/g, '');

        debugInfo('启动目标名称: ' + _name);
        debugInfo('启动参数类型: ' + typeof _trig);

        let _cond_ready = _opt.condition_ready;
        let _cond_launch = _opt.condition_launch;
        let _dist = _opt.disturbance;
        let _thd_dist;
        let _max_retry = _opt.global_retry_times || 2;
        let _max_retry_b = _max_retry;
        let _is_show_greeting = _opt.is_show_greeting;

        if (typeof _is_show_greeting === 'undefined') {
            _is_show_greeting = true;
        }

        if (!_cond_launch) {
            _cond_launch = () => currentPackage() === _pkg_name;
        }

        if (_dist) {
            debugInfo('已开启干扰排除线程');
            _thd_dist = threadsx.start(function () {
                while (1) {
                    sleep(1.2e3);
                    _dist();
                }
            });
        }

        while (_max_retry--) {
            let _max_lch = _opt.launch_retry_times || 3;
            let _max_lch_b = _max_lch;

            if (!_opt.no_message_flag) {
                let _msg = _task_name
                    ? '重新开始' + _task_name.surround('"') + '任务'
                    : '重新启动' + _app_name.surround('"') + '应用';
                if (!_1st_launch) {
                    messageAction(_msg, null, 1);
                } else if (_is_show_greeting) {
                    messageAction(_msg.replace(/重新/g, ''), 1, 1, 0, 'both');
                }
            }

            while (_max_lch--) {
                if (typeof _trig === 'object') {
                    debugInfo('加载intent参数启动应用');
                    this.startActivity(_trig);
                } else if (typeof _trig === 'string') {
                    debugInfo('加载应用包名参数启动应用');
                    if (!app.launchPackage(_pkg_name)) {
                        debugInfo('加载应用名称参数启动应用');
                        app.launchApp(_app_name);
                    }
                } else {
                    debugInfo('使用触发器方法启动应用');
                    _trig();
                }

                _waitForScrOrReady();

                let _succ = waitForAction(_cond_launch, 5e3, 800);
                debugInfo('应用启动' + (
                    _succ ? '成功' : '超时 (' + (_max_lch_b - _max_lch) + '/' + _max_lch_b + ')'
                ));
                if (_succ) {
                    break;
                }
                debugInfo('>' + currentPackage());
            }

            if (_max_lch < 0) {
                messageAction('打开' + _app_name.surround('"') + '失败', 8, 1, 0, 1);
            }

            if (typeof _cond_ready === 'undefined') {
                debugInfo('未设置启动完成条件参数');
                break;
            }

            _1st_launch = false;
            debugInfo('开始监测启动完成条件');

            let _max_ready = _opt.ready_retry_times || 3;
            let _max_ready_b = _max_ready;

            while (!waitForAction(_cond_ready, 8e3) && _max_ready--) {
                let _ctr = (_max_ready_b - _max_ready + '/' + _max_ready_b).surround('()');
                if (typeof _trig === 'object') {
                    debugInfo('重新启动Activity ' + _ctr);
                    this.startActivity(_trig);
                } else {
                    debugInfo('重新启动应用 ' + _ctr);
                    app.launchPackage(_trig);
                }
            }

            if (_max_ready >= 0) {
                debugInfo('启动完成条件监测完毕');
                break;
            }

            debugInfo('尝试关闭' + _app_name.surround('"') + '应用:');
            debugInfo((_max_retry_b - _max_retry + '/' + _max_retry_b).surround('()'));
            this.kill(_pkg_name);
        }

        if (_thd_dist) {
            _thd_dist.interrupt();
            debugInfo('干扰排除线程结束');
            _thd_dist = null;
        }

        if (_max_retry < 0) {
            messageAction(_name.surround('"') + '初始状态准备失败', 8, 1, 0, 1);
        }
        debugInfo(_name.surround('"') + '初始状态准备完毕');

        return true;

        // tool function(s) //

        function _setAppName() {
            if (typeof _trig === 'string') {
                _app_name = !_trig.match(/.+\..+\./) && app.getPackageName(_trig) && _trig;
                _pkg_name = app.getAppName(_trig) && _trig.toString();
            } else {
                _app_name = _opt.app_name;
                _pkg_name = _opt.package_name;
                if (!_pkg_name && typeof _trig === 'object') {
                    _pkg_name = _trig.packageName || _trig.data && _trig.data.match(/^alipays/i) && 'com.eg.android.AlipayGphone';
                }
            }
            _app_name = _app_name || _pkg_name && app.getAppName(_pkg_name);
            _pkg_name = _pkg_name || _app_name && app.getPackageName(_app_name);
            if (!_app_name && !_pkg_name) {
                messageAction('未找到应用', 4, 1);
                messageAction(_trig, 8, 0, 1, 1);
            }
        }

        function _waitForScrOrReady() {
            let _isHoriz = () => {
                let _disp = devicex.getDisplay();
                return _disp.WIDTH > _disp.HEIGHT;
            };
            let _isVert = () => {
                let _disp = devicex.getDisplay();
                return _disp.WIDTH < _disp.HEIGHT;
            };
            let _scr_o_par = _opt.screen_orientation;
            if (_scr_o_par === 1 && _isVert()) {
                debugInfo('需等待屏幕方向为横屏');
                if (waitForAction(_isHoriz, 8e3, 80)) {
                    debugInfo('屏幕方向已就绪');
                    sleep(500);
                } else {
                    messageAction('等待屏幕方向变化超时', 4);
                }
            } else if (_scr_o_par === 0 && _isHoriz()) {
                debugInfo('需等待屏幕方向为竖屏');
                if (waitForAction(_isVert, 8e3, 80)) {
                    debugInfo('屏幕方向已就绪');
                    sleep(500);
                } else {
                    messageAction('等待屏幕方向变化超时', 4);
                }
            }
        }
    },
    /**
     * @typedef {Object} Appx$Kill$Options
     * @property {boolean} [shell_acceptable=true]
     * @property {number} [shell_max_wait_time=10e3]
     * @property {boolean} [keycode_back_acceptable=true]
     * @property {boolean} [keycode_back_twice=false]
     * @property {function():boolean} [condition_success]
     * @property {boolean} [debug_info_flag=false]
     */
    /**
     * Close or minimize a certain app
     * @param {string} [source]
     * @param {Appx$Kill$Options} [options]
     * @example
     * appx.kill('Alipay');
     * appx.kill('com.eg.android.AlipayGphone', {
     *    shell_acceptable: false,
     *    debug_info_flag: true,
     * });
     * @returns {boolean}
     */
    kill(source, options) {
        let _opt = options || {};
        _opt.no_impeded || typeof $$impeded === 'function' && $$impeded(this.kill.name);

        let _src = source || '';
        if (!_src) {
            _src = currentPackage();
            messageAction('自动使用currentPackage()返回值', 3);
            messageAction('appx.kill()未指定name参数', 3, 0, 1);
            messageAction('注意: 此返回值可能不准确', 3, 0, 1);
        }
        let _app_name = this.getAppName(_src);
        let _pkg_name = this.getAppPkgName(_src);
        if (!_app_name || !_pkg_name) {
            messageAction('解析应用名称及包名失败', 8, 1, 0, 1);
        }

        let _shell_acceptable = (
            _opt.shell_acceptable === undefined ? true : _opt.shell_acceptable
        );
        let _keycode_back_acceptable = (
            _opt.keycode_back_acceptable === undefined ? true : _opt.keycode_back_acceptable
        );
        let _keycode_back_twice = _opt.keycode_back_twice || false;
        let _cond_success = _opt.condition_success || (() => {
            let _cond = () => currentPackage() === _pkg_name;
            return waitForAction(() => !_cond(), 12e3) && !waitForAction(_cond, 3, 150);
        });

        let _shell_result = false;
        let _shell_start_ts = Date.now();
        let _shell_max_wait_time = _opt.shell_max_wait_time || 10e3;
        if (_shell_acceptable) {
            try {
                _shell_result = !shell('am force-stop ' + _pkg_name, true).code;
            } catch (e) {
                debugInfo('shell()方法强制关闭' + _app_name.surround('"') + '失败');
            }
        } else {
            debugInfo('参数不接受shell()方法');
        }

        if (!_shell_result) {
            if (_keycode_back_acceptable) {
                return _tryMinimizeApp();
            }
            debugInfo('参数不接受模拟返回方法');
            messageAction('关闭' + _app_name.surround('"') + '失败', 4, 1);
            return messageAction('无可用的应用关闭方式', 4, 0, 1);
        }

        let _et = Date.now() - _shell_start_ts;
        if (waitForAction(_cond_success, _shell_max_wait_time)) {
            debugInfo('shell()方法强制关闭' + _app_name.surround('"') + '成功');
            debugInfo('>关闭用时: ' + _et + '毫秒');
            return true;
        }
        messageAction('关闭' + _app_name.surround('"') + '失败', 4, 1);
        debugInfo('>关闭用时: ' + _et + '毫秒');
        return messageAction('关闭时间已达最大超时', 4, 0, 1);

        // tool function(s) //

        function _tryMinimizeApp() {
            debugInfo('尝试最小化当前应用');

            let _sltr_avail_btns = [
                idMatches(/.*nav.back|.*back.button/),
                descMatches(/关闭|返回/),
                textMatches(/关闭|返回/),
            ];

            let _max_try_times_minimize = 20;
            let _max_try_times_minimize_bak = _max_try_times_minimize;
            let _back = () => {
                back();
                back();
                if (_keycode_back_twice) {
                    sleep(200);
                    back();
                }
            };

            while (_max_try_times_minimize--) {
                let _clicked_flag = false;
                for (let i = 0, l = _sltr_avail_btns.length; i < l; i += 1) {
                    let _sltr_avail_btn = _sltr_avail_btns[i];
                    if (_sltr_avail_btn.exists()) {
                        _clicked_flag = true;
                        clickAction(_sltr_avail_btn);
                        sleep(300);
                        break;
                    }
                }
                if (_clicked_flag) {
                    continue;
                }
                _back();
                if (waitForAction(_cond_success, 2e3)) {
                    break;
                }
            }
            if (_max_try_times_minimize < 0) {
                debugInfo('最小化应用尝试已达: ' + _max_try_times_minimize_bak + '次');
                debugInfo('重新仅模拟返回键尝试最小化');
                _max_try_times_minimize = 8;
                while (_max_try_times_minimize--) {
                    _back();
                    if (waitForAction(_cond_success, 2e3)) {
                        break;
                    }
                }
                if (_max_try_times_minimize < 0) {
                    return messageAction('最小化当前应用失败', 4, 1);
                }
            }
            debugInfo('最小化应用成功');
            return true;
        }
    },
    /**
     * Kill or minimize an app and launch it with options
     * @param {string} [source]
     * @param {{
     *     kill?: Appx$Kill$Options,
     *     launch?: Appx$Launch$Options,
     * }} [options]
     * @returns {boolean}
     */
    restart(source, options) {
        let _src = source || currentPackage();
        let _opt = options || {};
        return this.kill(_src, _opt.kill) && this.launch(_src, _opt.launch);
    },
    /**
     * Returns if Auto.js has attained root access by running a shell command
     * @returns {boolean}
     */
    hasRoot() {
        try {
            // 1. com.stardust.autojs.core.util.ProcessShell
            //    .execCommand('date', true).code === 0;
            //    code above doesn't work on Auto.js Pro
            // 2. some devices may stop the script without
            //    any info or hint in a sudden way without
            //    this try/catch code block
            return shell('date', true).code === 0;
        } catch (e) {
            return false;
        }
    },
    /**
     * Returns if Auto.js has WRITE_SECURE_SETTINGS permission
     * @returns {boolean}
     */
    hasSecure() {
        let _perm = 'android.permission.WRITE_SECURE_SETTINGS';
        let _chk_perm = context.checkCallingOrSelfPermission(_perm);
        let _perm_granted = android.content.pm.PackageManager.PERMISSION_GRANTED;
        return _chk_perm === _perm_granted;
    },
    /**
     * Checks if the specified app can modify system settings.
     * @return {boolean}
     * @see https://developer.android.com/reference/android/provider/Settings.System#canWrite(android.content.Context)
     */
    canWriteSystem() {
        return android.provider.Settings.System.canWrite(context);
    },
    /**
     * Easy-to-use encapsulation for android.content.pm.PackageManager.getInstalledApplications
     * @param {{
     *     include?: string|string[],
     *     exclude?: string|string[],
     *     is_enabled?: boolean,
     *     is_system?: boolean,
     *     force_refresh?: boolean,
     * }} [options]
     * @example
     * log(appx.getInstalledApplications().length);
     * log(appx.getInstalledApplications({is_system: true}).length);
     * log(appx.getInstalledApplications({is_system: false}).length);
     * log(appx.getInstalledApplications({
     *     is_enabled: true,
     *     include: [
     *         'com.eg.android.AlipayGphone', 'com.tencent.mm',
     *         'com.android.chrome', 'com.android.vending',
     *         'com.coolapk.market', 'com.sonyericsson.android.camera',
     *         'org.autojs.autojs', 'org.autojs.autojspro',
     *     ],
     * }).getAppNames());
     * log(appx.getInstalledApplications({
     *     is_system: true,
     *     exclude: [
     *         'Alipay', 'WeChat', 'Chrome', 'Google Play Store',
     *         'CoolApk', 'Camera', 'Auto.js',
     *     ],
     * }).getPkgNames());
     * log(appx.getInstalledApplications({include: 'Alipay'}).getPkgNames());
     * @returns {{
     *     app_name: string,
     *     pkg_name: string,
     *     is_enabled: boolean,
     *     is_system: boolean,
     * }[] & {
     *     getAppNames: function(): string[],
     *     getPkgNames: function(): string[],
     *     getJointStrArr: function(string?, boolean?): string[],
     * }}
     */
    getInstalledApplications(options) {
        let _opt = options || {};
        let _include = (o) => {
            let _included_smp = _opt.include || [];
            if (typeof _included_smp === 'string') {
                _included_smp = [_included_smp];
            }
            let _excluded_smp = _opt.exclude || [];
            if (typeof _excluded_smp === 'string') {
                _excluded_smp = [_excluded_smp];
            }
            return (
                _include = _included_smp.length
                    ? o => (~_included_smp.indexOf(o.pkg_name)
                        || ~_included_smp.indexOf(o.app_name))
                        && !~_excluded_smp.indexOf(o.pkg_name)
                        && !~_excluded_smp.indexOf(o.app_name)
                    : o => !~_excluded_smp.indexOf(o.pkg_name)
                        && !~_excluded_smp.indexOf(o.app_name)
            )(o);
        };
        let _getState = k => typeof _opt[k] === 'function' ? _opt[k]() : _opt[k];

        let _pkg_mgr = context.getPackageManager();
        let _items = _pkg_mgr.getInstalledApplications(0).toArray().map((o) => ({
            app_name: o.loadLabel(_pkg_mgr),
            pkg_name: o.packageName,
            is_enabled: o.enabled,
            is_system: this.isSystemApp(o),
        })).filter(_include);

        let _is_system = _getState('is_system');
        if (typeof _is_system === 'boolean') {
            _items = _items.filter(o => o.is_system === _is_system);
        }

        let _is_enabled = _getState('is_enabled');
        if (typeof _is_enabled === 'boolean') {
            _items = _items.filter(o => o.is_enabled === _is_enabled);
        }

        // noinspection JSUnusedGlobalSymbols
        return Object.assign(_items, {
            getAppNames() {
                return this.map(o => o.app_name);
            },
            getPkgNames() {
                return this.map(o => o.pkg_name);
            },
            getJointStrArr(separator, is_reverse) {
                return this.map(o => is_reverse
                    ? o.pkg_name + (separator || '\n') + o.app_name
                    : o.app_name + (separator || '\n') + o.pkg_name).sort();
            },
        });
    },
    /**
     * Create a android launcher shortcut with Auto.js dialogs
     * @param {string} file
     * @example
     * appx.createShortcut('./Ant-Forest-003/ant-forest-launcher.js');
     * @returns {void}
     * @see org.autojs.autojs.ui.shortcut.ShortcutCreateActivity
     */
    createShortcut(file) {
        if (!file) {
            throw Error('File is required for appx.createShortcut()');
        }

        let _file = files.path(file);

        if (!files.isFile(_file)) {
            throw Error('File argument must be a file');
        }
        if (!files.exists(_file)) {
            throw Error('File is not existed');
        }

        let _cls = new org.autojs.autojs.ui.shortcut.ShortcutCreateActivity().getClass();
        let _ef = org.autojs.autojs.ui.shortcut.ShortcutCreateActivity.EXTRA_FILE;
        let _sf = new org.autojs.autojs.model.script.ScriptFile(_file);
        let _intent = new android.content.Intent(context, _cls).putExtra(_ef, _sf);
        this.startActivity(_intent);
    },
    /**
     * @param {android.content.pm.ApplicationInfo} source
     * @returns {boolean}
     */
    isSystemApp(source) {
        if (!(source instanceof android.content.pm.ApplicationInfo)) {
            throw Error('Source must be the instance of ApplicationInfo');
        }
        if (typeof source.isSystemApp === 'function') {
            return source.isSystemApp();
        }
        return (source.flags & android.content.pm.ApplicationInfo.FLAG_SYSTEM) !== 0;
    },
};

ext.checkModules([
    'mod-monster-func', 'ext-dialogs', 'ext-storages',
    'ext-device', 'ext-http', 'ext-a11y', 'ext-files',
    'ext-global', 'ext-engines', 'ext-threads',
], {is_load: true});

module.exports = ext;
module.exports.load = () => global.appx = ext;