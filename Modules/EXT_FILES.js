global.filesx = typeof global.filesx === "object" ? global.filesx : {};

let ext = {
    zip(input_path, output_path, dialog) {
        delete global["_$_dialog_streaming_intrp_sgn"];

        let {
            File,
            FileInputStream: FIS,
            FileOutputStream: FOS,
            BufferedInputStream: BIS,
        } = java.io;

        let {
            CRC32,
            ZipEntry: ZE,
            ZipOutputStream: ZOS,
            CheckedOutputStream: COS,
        } = java.util.zip;

        let _fos, _zos, _cos;
        let _t_file_sz = 0;
        let _compr_sz = 0;

        let _sep = File.separator;
        let _sep_len = _sep.length;

        let _i_path = files.path(input_path);
        let _o_path = output_path;

        try {
            if (!files.exists(_i_path)) {
                throw Error("无效的压缩源");
            }
            let _i_file = new File(_i_path);
            // "./BAK" or "./BAK/bak.txt" but not "./BAK/"
            _i_path = _i_file.getAbsolutePath();
            let _i_path_len = _i_path.length;

            let _o_path_bak = _o_path || _i_file.getName();
            let _o_file = new File(_o_path || _i_path);
            _o_path = _o_file.getAbsolutePath();

            if (!~_o_path_bak.indexOf(_sep)) {
                let _l = _i_path.lastIndexOf(_sep) + _sep_len;
                _o_path = _i_path.slice(0, _l) + _o_path_bak;
            }
            if (_o_path.slice(0, _i_path_len) === _i_path) {
                if (_o_path[_i_path_len] === _sep) {
                    throw Error("压缩目标与压缩源路径冲突");
                }
            }
            if (_o_path.slice(-4) !== ".zip") {
                _o_path += ".zip";
            }

            // refresh file as path may be modified
            _o_file = new File(_o_path);

            if (files.exists(_o_path)) {
                files.remove(_o_path);
            }
            files.createWithDirs(_o_path);

            _t_file_sz = _getPathTotalSize(_i_path);

            _fos = new FOS(_o_file);
            _cos = new COS(_fos, new CRC32());
            _zos = new ZOS(_cos);

            let _src_path = _i_path;
            if (_i_file.isFile()) {
                let _idx = _i_path.lastIndexOf(_sep);
                if (~_idx) {
                    _src_path = _i_path.substring(0, _idx);
                }
            }

            _compress(_src_path, _i_file, _zos);
            _zos.flush();

            dialog && dialog.setProgress(100);
            return true;
        } catch (e) {
            if (!dialog) {
                throw e;
            }
            alertContent(dialog, "压缩失败:\n" + e, "append");
        } finally {
            _zos && _zos.close();
            _cos && _cos.close();
            _fos && _fos.close();
        }

        // tool function(s) //

        function _compress(src_path, i_file, zos) {
            if (i_file == null) {
                return;
            }

            if (i_file.isFile()) {
                let _read_bytes;
                let _buf_len = 1024;
                let _buf_bytes = util.java.array("byte", _buf_len);

                let _sub_path = new File(src_path).getName() +
                    _sep + i_file.getAbsolutePath();
                let _idx = _sub_path.indexOf(src_path);
                if (~_idx) {
                    _sub_path = _sub_path.substring(src_path.length + _sep_len);
                }

                let _entry = new ZE(_sub_path);
                zos.putNextEntry(_entry);

                let _fis, _bis;
                try {
                    _fis = new FIS(i_file);
                    _bis = new BIS(_fis);
                    while (~(_read_bytes = _bis.read(_buf_bytes, 0, _buf_len))) {
                        zos.write(_buf_bytes, 0, _read_bytes);
                    }
                    if (dialog) {
                        _compr_sz += i_file.length();
                        dialog.setProgress(_compr_sz / _t_file_sz * 100);
                    }
                } catch (e) {
                    throw e;
                } finally {
                    _bis && _bis.close();
                    _fis && _fis.close();
                    zos.closeEntry();
                }
            } else {
                let _files = i_file.listFiles();
                for (let i = 0, l = _files.length; i < l; i += 1) {
                    _compress(src_path, _files[i], zos);
                }
            }
        }

        function _getPathTotalSize(path) {
            let _size = 0;
            _parseFolder(path);
            return _size;

            // tool function(s) //

            function _parseFolder(path) {
                let _path = path.toString();
                let _prefix = _path + (_path.match(/\/$/) ? "" : "/");
                files.listDir(_path).forEach((file_name) => {
                    let _abs_path = _prefix + file_name;
                    if (files.isDir(_abs_path)) {
                        _parseFolder(_abs_path);
                    } else {
                        _size += java.io.File(_abs_path).length();
                    }
                });
            }
        }
    },
    unzip(input_path, output_path, include_file, dialog) {
        delete global["_$_dialog_streaming_intrp_sgn"];

        let {
            File,
            FileOutputStream: FOS,
            BufferedInputStream: BIS,
            BufferedOutputStream: BOS,
        } = java.io;

        let ZF = java.util.zip.ZipFile;

        let _t_file_sz = 0;
        let _uncompr_sz = 0;
        let _sep = File.separator;

        let _i_path = files.path(input_path);
        let _o_path = output_path;

        try {
            if (!files.exists(_i_path)) {
                _i_path += ".zip";
                if (!files.exists(_i_path)) {
                    throw Error("解压缩源不存在");
                }
            }
            let _i_file = new File(_i_path);
            _t_file_sz += _i_file.length();

            if (_o_path) {
                _o_path = files.path(_o_path);
            } else {
                _o_path = _i_path.slice(0, _i_path.lastIndexOf(_sep));
            }

            if (include_file) {
                let _i_file_name = _i_file.getName();
                if (_i_file_name) {
                    _i_file_name = _i_file_name.slice(0, _i_file_name.lastIndexOf("."));
                }
                _o_path = _o_path + _sep + _i_file_name;
            }

            files.createWithDirs(_o_path + _sep);

            let _read_bytes;
            let _buf_len = 1024;
            let _buf_bytes = util.java.array("byte", _buf_len);
            let _zif = new ZF(_i_file); // zip input file
            let _ze = _zif.entries(); // zip entries

            while (_ze.hasMoreElements()) {
                let _entry = _ze.nextElement();
                let _entry_name = _entry.getName();
                if (!global["_$_project_backup_path"]) {
                    let _idx = _entry_name.indexOf(_sep);
                    let _path = ~_idx ? _entry_name.slice(0, _idx) : _entry_name;
                    global["_$_project_backup_path"] = _o_path + _sep + _path + _sep;
                }
                let _entry_path = files.path(_o_path + _sep + _entry_name);
                files.createWithDirs(_entry_path);
                let _entry_file = new File(_entry_path);
                if (_entry_file.isDirectory()) {
                    continue;
                }

                let _fos, _bos, _bis;

                try {
                    _fos = new FOS(_entry_file);
                    _bos = new BOS(_fos);
                    _bis = new BIS(_zif.getInputStream(_entry));
                    while (~(_read_bytes = _bis.read(_buf_bytes, 0, _buf_len))) {
                        if (global["_$_dialog_streaming_intrp_sgn"]) {
                            global["_$_dialog_streaming_intrp_sgn"] = false;
                            throw Error("用户终止");
                        }
                        _bos.write(_buf_bytes, 0, _read_bytes);
                    }
                    if (dialog) {
                        _uncompr_sz += _entry_file.length();
                        dialog.setProgressNum(_uncompr_sz / _t_file_sz * 100);
                    }
                } catch (e) {
                    throw e;
                } finally {
                    _bos.flush();
                    _bos.close();
                    _bis.close();
                    _fos.close();
                }
            }

            return true;
        } catch (e) {
            if (!dialog) {
                throw e;
            }
            alertContent(dialog, "解压失败:\n" + e, "append");
        }
    },
    /**
     * Copy a file or folder to target path
     * @param {string} src - source file or folder
     * @param {string} target - target path (absolute or relative)
     * @param {?boolean} [unbundle_flag=falsy] -
     * whether unbundle all files from the master folder
     * only available when src param is a folder
     * @example
     * // src: a folder named "picture" with 3 files
     * // /pictures/1.png
     * // /pictures/2.png
     * // /pictures/3.png
     * let src = "./pictures";
     *
     * let target = "./backup/";
     *
     * // unbundled_flag is falsy
     * // then you got "./backup/pictures/1.png" and 2 more
     * copyFolder(src, target);
     *
     * // unbundled_flag is truthy
     * // then you got "./backup/1.png" and 2 more
     * copyFolder(src, target, "unbundle");
     * @return {boolean}
     */
    copyFolder(src, target, unbundle_flag) {
        if (!src || !target) {
            return false;
        }
        let _src_name = files.getName(src);
        files.create(target);
        if (files.isDir(src)) {
            files.listDir(src).forEach((item) => {
                let _src = src + item + (files.isDir(item) ? "/" : "");
                let _target = target + (unbundle_flag ? "" : _src_name + "/");
                this.copyFolder(_src, _target);
            });
        } else {
            files.copy(src, target + _src_name);
        }
        return true;
    },
};

module.exports = ext;
module.exports.load = () => global.filesx = ext;