global.filesx = typeof global.filesx === 'object' ? global.filesx : {};

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

let ext = {
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
     * Run a javascript file via activity by current running Auto.js
     * @param file_name {'launcher$'|'settings$'|string} - file name with or without path or file extension name
     * @param {
     *     Object.<string,any>&{cmd?:AntForestLauncherCommand}
     * } [e_args] arguments params for engines - js file will run by startActivity without this param
     * @example
     * filesx.run('file');
     * filesx.run('../folder/time.js');
     * filesx.run('ant-forest-launcher', {cmd: 'get_current_account_name'});
     */
    run(file_name, e_args) {
        if (file_name.match(/^(launcher|settings)\$$/)) {
            file_name = 'ant-forest-' + file_name.slice(0, -1) + '.js';
        }
        let _path = files.path(file_name.match(/\.js$/) ? file_name : (file_name + '.js'));
        let _pkg = context.getPackageName();
        if (e_args) {
            return engines.execScriptFile(_path, {arguments: e_args});
        }
        try {
            return _startActivity('org.autojs.autojs');
        } catch (e) {
            return _startActivity(_pkg);
        }

        // tool function(s) //

        function _startActivity(override_class_name_prefix) {
            let _class_name_prefix = override_class_name_prefix || _pkg;
            return app.startActivity({
                packageName: _pkg,
                className: _class_name_prefix + '.external.open.RunIntentActivity',
                data: 'file://' + _path,
            });
        }
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
        let _filesx = this;
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
                _filesx.removeWithDirs(_i_path, {is_async: true});
            }

            return true;
        } catch (e) {
            return _err('解压失败:\n' + e);
        }
    },
    /**
     * @param {string} path
     * @returns {boolean}
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
        threads.start(_act);

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
     * @param {string} path
     * @returns {boolean}
     */
    isScriptDirPath(path) {
        return new File(files.path(path)).getAbsolutePath() === this.getScriptDirPath();
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
            return _opt.is_async ? threads.start(_parseLv1Depth) : _parseLv1Depth();
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
     * @param {string|java.io.File} file
     * @returns {boolean}
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
        threads.start(_act);

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
     * @returns {string}
     */
    read(path) {
        let _file = files.open(path, 'r');
        let _text = _file.read();
        _file.close();
        return _text;
    },
    /**
     * @param {string} path
     * @param {string} text
     */
    write(path, text) {
        let _file = files.open(path, 'w');
        _file.write(text);
        _file.close();
    },
};

module.exports = ext;
module.exports.load = () => global.filesx = ext;