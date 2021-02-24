global.httpx = typeof global.httpx === 'object' ? global.httpx : {};

let ext = {
    /**
     * Substitution of java.net.URLConnection.getContentLengthLong() with concurrency
     * @async
     * @param {string} url
     * @param {function(value:number)} callback
     * @param {{}} [options]
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
     * @returns {void}
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
            let _thd = threads.start(function () {
                try {
                    let _cxn = new java.net.URL(url).openConnection();
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
            threads.start(function () {
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
        _opt.is_async === undefined || _opt.is_async ? threads.start(_request) : _request();

        // tool function(s) //

        function _request() {
            try {
                _onStart();

                let _builder = new okhttp3.Request.Builder();
                Object.keys(_opt.headers || {}).forEach((k) => {
                    _builder.addHeader(k, _opt.headers[k]);
                });
                let r = new OkHttpClient().newCall(_builder.url(url).get().build()).execute();

                _onResponse(r);

                let _buf_len = 4096;
                let _buf_bytes = java.lang.reflect.Array.newInstance(
                    java.lang.Byte.TYPE, _buf_len
                );
                let _read_bytes;
                let _processed = 0;

                let _code = r.code();
                if (_code !== 200) {
                    _onFailure(_code + ' ' + r.message());
                }
                _bs = r.body().byteStream();
                _bis = new java.io.BufferedInputStream(_bs);
                _fos = new java.io.FileOutputStream(new java.io.File(_path));
                _bos = new java.io.BufferedOutputStream(_fos);

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

module.exports = ext;
module.exports.load = () => global.httpx = ext;