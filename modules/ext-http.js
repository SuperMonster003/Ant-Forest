let {threadsx} = require('./ext-threads');

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let URL = java.net.URL;
let File = java.io.File;
let StringBuilder = java.lang.StringBuilder;
let BufferedReader = java.io.BufferedReader;
let FileOutputStream = java.io.FileOutputStream;
let InputStreamReader = java.io.InputStreamReader;
let BufferedInputStream = java.io.BufferedInputStream;
let BufferedOutputStream = java.io.BufferedOutputStream;
let JavaArray = java.lang.reflect.Array;
let Builder = okhttp3.Request.Builder;

let exp = {
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
        let _sum_bytes = threadsx.atomic(-1);

        let _executor = function (resolve) {
            let _thd = threadsx.start(function () {
                try {
                    let _cxn = new URL(url).openConnection();
                    _cxn.setRequestProperty('Accept-Encoding', 'identity');
                    _cxn.setConnectTimeout(_tt);
                    let _len = _cxn.getContentLengthLong();
                    _cxn.disconnect();
                    if (_len !== -1 && _sum_bytes.compareAndSet(-1, _len)) {
                        callback(_sum_bytes.get());
                    }
                } catch (e) {
                    // nothing to do here
                }
            });
            threadsx.start(function () {
                try {
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
                } catch (e) {
                    // nothing to do here
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
     * @param {Object} [callback]
     * @param {function():*} [callback.onStart]
     * @param {function(response:okhttp3.Response):*} [callback.onResponse]
     * @param {function(data:{processed:number,total:number}):*} [callback.onDownloadProgress]
     * @param {function(value:{downloaded_path:string}):*} [callback.onDownloadSuccess]
     * @param {function(value:*=):*} [callback.onDownloadFailure]
     * @param {Object} [options]
     * @param {string} [options.path]
     * @param {Object} [options.headers]
     * @param {boolean} [options.is_async=true]
     * @return {any}
     */
    okhttp3Request(url, callback, options) {
        let _cbk = callback || {};
        let _opt = options || {};
        let _path = _opt.path;
        let _onStart = _cbk.onStart || (r => r);
        let _onResponse = _cbk.onResponse || (r => r);
        let _onProgress = _cbk.onDownloadProgress || (r => r);
        let _onSuccess = _cbk.onDownloadSuccess || (r => r);
        let _onFailure = (e) => {
            if (typeof _cbk.onDownloadFailure === 'function') {
                _cbk.onDownloadFailure(e);
            } else {
                throw Error(e + '\n' + e.stack);
            }
        };
        if (!url) {
            return _onFailure('url for httpx.okhttp3Request() is required');
        }
        if (_opt.is_async !== undefined && !_opt.is_async) {
            return _request();
        }
        threadsx.start(_request);

        // tool function(s) //

        function _request() {
            try {
                let _result;

                _onStart();

                let _builder = new Builder();
                Object.keys(_opt.headers || {}).forEach((k) => {
                    _builder.addHeader(k, _opt.headers[k]);
                });
                let r = new OkHttpClient().newCall(_builder.url(url).get().build()).execute();

                _onResponse(r);

                let _buf_len = 4096;
                let _buf_bytes = JavaArray.newInstance(java.lang.Byte.TYPE, _buf_len);
                let _processed = 0;

                let _code = r.code();
                if (_code !== 200) {
                    _onFailure(_code + '\x20' + r.message());
                }
                let _is = r.body().byteStream();
                let _total = r.body().contentLength();

                if (typeof _path === 'string') {
                    let _read_bytes = -1;

                    let _bis = new BufferedInputStream(_is);
                    let _fos = new FileOutputStream(new File(files.path(_path)));
                    let _bos = new BufferedOutputStream(_fos);

                    while ((_read_bytes = _bis.read(_buf_bytes, 0, _buf_len)) !== -1) {
                        if (global._$_dialog_flow_interrupted) {
                            _clearAndCloseStreams([_bos, _fos, _bis, _is]);
                            _onFailure('用户终止');
                        }
                        _fos.write(_buf_bytes, 0, _read_bytes);
                        _processed += _read_bytes;
                        _onProgress({processed: _processed, total: _total});
                    }

                    _clearAndCloseStreams([_bos, _fos, _bis, _is]);
                    _onSuccess({downloaded_path: _result = _path});
                } else {
                    let _isr = new InputStreamReader(_is);
                    let _br = new BufferedReader(_isr);
                    let _sb = new StringBuilder();
                    let _line = null;

                    while ((_line = _br.readLine()) !== null) {
                        if (global._$_dialog_flow_interrupted) {
                            _clearAndCloseStreams([_br, _isr, _is]);
                            _onFailure('用户终止');
                        }
                        _sb.append(_line).append('\r\n');
                        _processed += _line.length;
                        _onProgress({processed: _processed, total: _total});
                    }

                    _clearAndCloseStreams([_br, _isr, _is]);
                    _onSuccess({downloaded_string: _result = _sb.toString()});
                }
                return _result;
            } catch (e) {
                _onFailure('请求失败:\n' + e);
            }
        }

        function _clearAndCloseStreams(streams) {
            streams.forEach((stream) => {
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

module.exports = {httpx: exp};