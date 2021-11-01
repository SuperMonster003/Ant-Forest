let {threadsx} = require('./ext-threads');
let {enginesx} = require('./ext-engines');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let File = java.io.File;
let FileInputStream = java.io.FileInputStream;
let FileOutputStream = java.io.FileOutputStream;
let BufferedInputStream = java.io.BufferedInputStream;
let BufferedOutputStream = java.io.BufferedOutputStream;
let CheckedOutputStream = java.util.zip.CheckedOutputStream;
let ZipOutputStream = java.util.zip.ZipOutputStream;
let ZipEntry = java.util.zip.ZipEntry;
let ZipFile = java.util.zip.ZipFile;
let CRC32 = java.util.zip.CRC32;
let Pref = org.autojs.autojs.Pref;

let _ = {
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
     * @return {boolean}
     */
    copy(path_from, path_to, callback) {
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
         * @return {boolean}
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
};

let exp = {
    sep: File.separator,
    json: {
        /**
         * @param {string} k
         * @param {number|*} v
         * @return {string|*}
         */
        replacer(k, v) {
            /** Zero Width No-Break Space */
            let _pad = '\ufeff';
            if (typeof v === 'number' && (isNaN(v) || !isFinite(v))) {
                return _pad + v.toString() + _pad;
            }
            return v;
        },
        /**
         * @param {string} k
         * @param {string|*} v
         * @return {number|*}
         */
        reviver(k, v) {
            let _pad = /^\ufeff(.+)\ufeff$/;
            if (typeof v === 'string' && v.match(_pad)) {
                return Number(v.replace(_pad, '$1'));
            }
            return v;
        },
    },
    /**
     * @param {...string[]} [children]
     * @example
     * // like: '/storage/emulated/0/.local'
     * console.log(filesx['.local']());
     * // like: '/storage/emulated/0/.local/images'
     * console.log(filesx['.local']('images'));
     * @return {string}
     */
    '.local'(children) {
        let _local = files.join(files.getSdcardPath(), '.local');
        files.isFile(_local) && files.remove(_local); // just in case

        let _res =  files.join.apply(files, [_local].concat([].slice.call(arguments)));
        files.createWithDirs(_res.slice(0, _res.lastIndexOf(this.sep) + 1));

        return _res;
    },
    /**
     * Run a javascript file via activity by current running Auto.js
     * @param file_name {'launcher$'|'settings$'|string} - file name with or without path or file extension name
     * @param {Object & {
     *     cmd?: AntForestLauncherCommand,
     *     monitor?: Threadsx.Monitor,
     * }} [e_args] - arguments params for engines (except 'monitor')
     * @example
     * filesx.run('file');
     * filesx.run('../folder/time.js');
     * filesx.run('ant-forest-launcher', {cmd: 'get_current_account_name'});
     * filesx.run('ant-forest-launcher', {cmd: 'get_current_account_name', monitor: 'ensure_open'});
     */
    run(file_name, e_args) {
        if (file_name.match(/^(launcher|settings)\$$/)) {
            file_name = 'ant-forest-' + file_name.slice(0, -1) + '.js';
        }
        let _path = files.path(file_name.match(/\.js$/) ? file_name : (file_name + '.js'));
        if (typeof e_args === 'object') {
            if (e_args.monitor) {
                threadsx.monitor(e_args.monitor);
                delete e_args.monitor;
            }
            return enginesx.execScriptFile(_path, {arguments: e_args});
        }
        return enginesx.execScriptFile(_path, null);
    },
    /**
     * Zip a file or a directory by java.io.FileOutputStream
     * @param {string} input_path
     * @param {?string} [output_path]
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
     * @return {boolean}
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
                this.removeWithDirs(_i_path, {is_async: true});
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
                let _parent = parent ? parent + exp.sep : '';
                let _file_name = _parent + file.getName();
                if (file.isFile()) {
                    let _read_bytes;
                    let _buf_len = 1024;
                    let _buf_bytes = util.java.array('byte', _buf_len);

                    _zos.putNextEntry(new ZipEntry(_file_name));
                    _fis = new FileInputStream(file);
                    _bis = new BufferedInputStream(_fis);

                    while ((_read_bytes = _bis.read(_buf_bytes, 0, _buf_len)) > -1) {
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
     * Unzip a zip file by java.io.FileOutputStream
     * @param {string} input_path
     * @param {?string} [output_path]
     * @param {Object} [callback]
     * @param {()=>any} [callback.onStart]
     * @param {()=>any} [callback.onUnzipStart]
     * @param {(data:{processed:number,total:number})=>any} [callback.onProgress]
     * @param {(data:{processed:number,total:number})=>any} [callback.onUnzipProgress]
     * @param {(value:{unzipped_path:string})=>any} [callback.onSuccess]
     * @param {(value:{unzipped_path:string})=>any} [callback.onUnzipSuccess]
     * @param {(value?:any)=>any} [callback.onFailure]
     * @param {(value?:any)=>any} [callback.onUnzipFailure]
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
     * @return {boolean}
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
        let _cbk = callback || {};
        let _err = (msg) => {
            let _failure = _cbk.onUnzipFailure || _cbk.onFailure;
            typeof _failure === 'function' ? _failure(msg) : toastLog(msg);
            return false;
        };

        let _start = _cbk.onUnzipStart || _cbk.onStart;
        if (typeof _start === 'function') {
            _start();
        }

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
            _o_path = _i_path.slice(0, _i_path.lastIndexOf(this.sep));
        }
        if (_opt.to_archive_name_folder) {
            _o_path = files.join(_o_path, _i_file_name_no_ext);
        }
        files.createWithDirs(_o_path + this.sep);

        try {
            let _processed_bytes = 0;
            let _buf_len = 1024;
            let _buf_bytes = util.java.array('byte', _buf_len);
            let _z_i_file = new ZipFile(_i_file);
            let _z_entries = _z_i_file.entries();

            while (_z_entries.hasMoreElements()) {
                /** @type { java.util.zip.ZipEntry} */
                let _entry = _z_entries.nextElement();
                let _entry_size = _entry.getCompressedSize();
                let _entry_name = _entry.getName();
                let _entry_path = files.join(_o_path, _entry_name);
                files.createWithDirs(_entry_path + (_entry.isDirectory() ? exp.sep : ''));

                let _entry_file = new File(_entry_path);
                if (_entry_file.isDirectory()) {
                    continue;
                }

                let _read_bytes = -1;

                _fos = new FileOutputStream(_entry_file);
                _bos = new BufferedOutputStream(_fos);
                _bis = new BufferedInputStream(_z_i_file.getInputStream(_entry));

                while ((_read_bytes = _bis.read(_buf_bytes, 0, _buf_len)) > -1) {
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
                this.removeWithDirs(_i_path, {is_async: true});
            }

            return true;
        } catch (e) {
            return _err('解压失败:\n' + e);
        }
    },
    /**
     * @param {string} path
     * @return {boolean}
     */
    isValidZip(path) {
        let _path = files.path(path);
        if (!_path || !files.exists(_path)) {
            return false;
        }
        /** @type {java.io.File} */
        let _file = new File(_path);
        if (files.getExtension(_file.getName()) !== 'zip') {
            return false;
        }
        /** @type {java.util.zip.ZipFile} */
        let _zip_file = null;
        try {
            _zip_file = new ZipFile(_file);
            return true;
        } catch (e) {
            return false;
        } finally {
            try {
                if (_zip_file !== null) {
                    _zip_file.close();
                    _zip_file = null;
                }
            } catch (e) {
                // nothing to do here
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
     * @return {boolean}
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

        let _src = new File(files.path(src)).getAbsolutePath();
        let _tar = new File(files.path(target)).getAbsolutePath();

        let _opt = options || {};
        let _is_unbundle = _opt.is_unbundled;

        let _act = () => {
            let _res = true;
            let _processed = 0;
            let _total = 1;

            let _copy = (src, target) => {
                let _tar = files.join(target, files.getName(src));
                if (files.isFile(src)) {
                    if (!_.copy(src, _tar)) {
                        _res = false;
                    }
                    _onProgress({processed: _processed += 1, total: _total});
                } else {
                    files.listDir(src).forEach((name) => {
                        _copy(files.join(src, name), _tar);
                    });
                }
            };

            typeof _onStart === 'function' && _onStart();

            if (files.isDir(_src)) {
                if (!_is_unbundle) {
                    _tar = files.join(_tar, files.getName(_src));
                }
                let _list = files.listDir(_src, function (name) {
                    return typeof _opt.filter !== 'function' || _opt.filter(name);
                });
                _total = _list.length;
                _list.forEach(name => _copy(files.join(_src, name), _tar));
            } else {
                _copy(_src, _tar);
            }

            _res && _onSuccess();
            _res || _onFailure('An error has occurred in files.copy()');

            return _res;
        };

        if (!_opt.is_async) {
            return _act();
        }
        threadsx.start(_act);
    },
    /**
     * Returns current Auto.js script dir path
     * @example
     * // like: '/storage/emulated/0/脚本' or '/storage/emulated/0/Scripts'
     * console.log(filesx.getScriptDirPath());
     * @return {string}
     */
    getScriptDirPath() {
        if (typeof Pref.getScriptDirPath === 'function') {
            return Pref.getScriptDirPath();
        }
        // for Auto.js Pro versions
        return com.stardust.autojs.core['pref']['Pref']['INSTANCE']['getScriptDirPath']();
    },
    /**
     * @param {string} path
     * @return {boolean}
     */
    isScriptDirPath(path) {
        return new File(files.path(path)).getAbsolutePath() === this.getScriptDirPath();
    },
    /**
     * Returns the files size in a directory or file
     * @param {string|java.io.File} path
     * @example
     * console.log(filesx.getDirSize('.')); // current working directory
     * @return {*}
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
     * @return {boolean|void}
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

        let _parseLv1Depth = () => {
            let _res = true;

            _onStart();

            if (files.isFile(path)) {
                _res = _remove(path);
            } else if (files.isDir(path)) {
                let _list = files.listDir(path);
                _total = _list.length;
                _list.forEach((file) => {
                    _res = _remove(files.join(path, file)) && _res;
                });
                files.remove(path);
            } else {
                throw Error('Cannot parse path for filesx.removeWithDirs()');
            }

            _res && _onSuccess();
            _res || _onFailure('An error has occurred in files.removeWithDirs()');

            return _res;
        };

        let _remove = (p) => {
            let _res = files.isDir(p)
                ? files.removeDir(p)
                : files.isFile(p) ? files.remove(p) : false;
            _onProgress({progress: _processed += 1, total: _total});
            return _res;
        };

        try {
            return _opt.is_async ? threadsx.start(_parseLv1Depth) : _parseLv1Depth();
        } catch (e) {
            _onFailure(e);
        }
    },
    /**
     * @param {string|java.io.File} file
     * @return {java.io.File[]}
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
     * @param {string|java.io.File} file
     * @return {boolean}
     */
    deleteRecursively(file) {
        if (typeof file === 'string') {
            file = new File(files.path(file));
        }
        if (file.isDirectory()) {
            let _files = file.listFiles();
            if (_files !== null) {
                if (!_files.every(f => this.deleteRecursively(f))) {
                    return false;
                }
            }
        }
        return file.delete();
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
     * @return {boolean}
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
     * @param {string} path
     * @param {any} [def]
     * @return {?string}
     */
    read(path, def) {
        let _read = null;
        if (files.exists(path)) {
            _read = files.read(path);
        }
        return _read || (def === undefined ? _read : def);
    },
    /**
     * @param {string} path
     * @param {any} [def]
     * @param {(key: string, value: any) => any} [reviver]
     * @return {any}
     */
    readJson(path, def, reviver) {
        let _def = def === undefined ? {} : def;
        try {
            return JSON.parse(this.read(path), reviver || this.json.reviver) || _def;
        } catch (e) {
            return _def;
        }
    },
    /**
     * @param {string} path
     * @param {string} text
     */
    write(path, text) {
        if (path && !files.exists(path)) {
            files.createWithDirs(path);
        }
        files.write(path, text);
    },
    /**
     * @param {string} path
     * @param {any} value
     * @param {(key: string, value: any) => any} [replacer]
     */
    writeJson(path, value, replacer) {
        this.write(path, JSON.stringify(value, replacer || this.json.replacer));
    },
};

module.exports = {filesx: exp};