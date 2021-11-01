/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let {isNullish} = require('./mod-global');
let {filesx} = require('./ext-files');

let File = java.io.File;
let CRC32 = java.util.zip.CRC32;
let Base64 = android.util.Base64;
let Cipher = javax.crypto.Cipher;
let SecretKeySpec = javax.crypto.spec.SecretKeySpec;
let KeyFactory = java.security.KeyFactory;
let MessageDigest = java.security.MessageDigest;
let KeyPairGenerator = java.security.KeyPairGenerator;
let X509EncodedKeySpec = java.security.spec.X509EncodedKeySpec;
let PKCS8EncodedKeySpec = java.security.spec.PKCS8EncodedKeySpec;
let CipherOutputStream = javax.crypto.CipherOutputStream;
let FileInputStream = java.io.FileInputStream;
let FileOutputStream = java.io.FileOutputStream;
let ByteArrayOutputStream = java.io.ByteArrayOutputStream;

let Key = function Key$IiFe() {
    /**
     * @alias CryptoKey
     * @param {string|java.io.File|number[]} input
     * @param {Object} [options]
     * @param {'public'|'private'} options.keyPair
     * @param {'file'|'base64'|'hex'} [options.input]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @constructor
     */
    let Key = function (input, options) {
        let _opt = options || {};

        this.keyPair = _opt.keyPair;
        delete _opt.keyPair;

        let bos = new java.io.ByteArrayOutputStream();
        exp._input(input, _opt, (bytes, start, length) => {
            bos.write(bytes, start, length);
        });
        this.data = bos.toByteArray();
    };

    /**
     * @param {Cryptox.CipherTransformationAlgorithm} algorithm - the name of the transformation, e.g., AES/CBC/PKCS5Padding.
     * @return {javax.crypto.spec.SecretKeySpec | java.security.PublicKey | java.security.PrivateKey}
     */
    Key.prototype.toKeySpec = function (algorithm) {
        let _algo = String(algorithm).replace(/^(.+?)(?=\/).*$/, '$1');
        if (_algo === 'RSA') {
            if (this.keyPair === 'public') {
                return KeyFactory.getInstance(_algo).generatePublic(new X509EncodedKeySpec(this.data));
            }
            if (this.keyPair === 'private') {
                return KeyFactory.getInstance(_algo).generatePrivate(new PKCS8EncodedKeySpec(this.data));
            }
            throw Error('Property keyPair must be either public or private');
        }
        return new SecretKeySpec(this.data, _algo);
    };
    /**
     * @return {string}
     */
    Key.prototype.toString = function () {
        let data = Base64.encodeToString(this.data, Base64.NO_WRAP);
        if (this.keyPair) {
            return 'Key[' + this.keyPair + ']{data=\'' + data + '\'}';
        }
        return 'Key{data=\'' + data + '\'}';
    };

    return Key;
}();

let KeyPair = function KeyPair$IiFe() {
    // noinspection UnnecessaryLocalVariableJS
    /**
     * @alias CryptoKeyPair
     * @param {number[]} publicKey
     * @param {number[]} privateKey
     * @param {Object} [options]
     * @param {'file'|'base64'|'hex'} [options.input]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @constructor
     */
    let KeyPair = function (publicKey, privateKey, options) {
        let _opt = options || {};
        this.publicKey = new Key(publicKey, Object.assign(_opt, {keyPair: 'public'}));
        this.privateKey = new Key(privateKey, Object.assign(_opt, {keyPair: 'private'}));
    };

    return KeyPair;
}();

let exp = {
    /**
     * For legacy compatibility only (functions except decrypt were abandoned)
     * @type {{decrypt: (string) => string|void}}
     */
    _pwmap: (() => {
        // code was compressed by uglifyjs v3.4.12 and stringified to avoid being formatted by IDE
        // language=JavaScript
        return new Function('return {_dec(e,l){let i=e.split(/, ?/).map(e=>e.replace(/^"([^]+)"$/g,"$1")),s=0,a="";for(var r="_.|._";;){for(let t=0;t<i.length;t+=1)if(s)t+=s,s=0;else{var f=l[i[t]],p=l[i[t+1]];if(void 0===f)return"";if("\"===f&&"u"===p){let r="";for(let e=0;e<4;e+=1)r+=l[i[t+e+2]];a+=String.fromCharCode(parseInt(r,16)),s=4}else a+=f}if(a.indexOf(r)<0)break;i=a.split(r),a=""}return a},decrypt(e){var r=files.getSdcardPath()+"/.local/PWMAP.txt";if(files.exists(r)&&"string"==typeof e&&e.length&&"["===e.slice(0,1)&&"]"===e.slice(-1))return this._dec(e.slice(1,-1),JSON.parse(files.read(r)||"{}"))}}')();
    })(),
    /**
     * @param {string|java.io.File|number[]} input
     * @param {Object} [options]
     * @param {?('file'|'base64'|'hex')} [options.input]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @param {Cryptox.OutputStreamWriteCallBack} callback
     */
    _input(input, options, callback) {
        let _opt = options || {};
        if (_opt.input === 'file') {
            let fis = new FileInputStream(input);
            let buffer = util.java.array('byte', 4096);
            let r;
            while ((r = fis.read(buffer)) > 0) {
                callback(buffer, 0, r);
            }
        } else {
            let _ipt = function $iiFe() {
                if (_opt.input === 'base64') {
                    return Base64.decode(input, Base64.NO_WRAP);
                }
                if (_opt.input === 'hex') {
                    return this._fromHex(input);
                }
                if (typeof input === 'string') {
                    // noinspection JSValidateTypes
                    return new java.lang.String(input).getBytes(_opt.encoding || 'utf-8');
                }
                return input;
            }.call(this);
            callback(_ipt, 0, _ipt.length);
        }
    },
    /**
     * @param {number[]} bytes
     * @param {Object} [options]
     * @param {'bytes'|'base64'|'hex'|'string'} [options.output=defFormat]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @param {'bytes'|'base64'|'hex'|'string'} [defFormat='hex']
     * @return {string|number[]}
     */
    _output(bytes, options, defFormat) {
        let format = options.output || defFormat;
        if (format === 'base64') {
            return Base64.encodeToString(bytes, Base64.NO_WRAP);
        }
        if (format === 'bytes') {
            return bytes;
        }
        let encoding = options.encoding || 'utf-8';
        if (format === 'string') {
            // noinspection JSValidateTypes
            return new java.lang.String(bytes, encoding).toString();
        }
        return this._toHex(bytes);
    },
    /**
     * @param {number[]} bytes
     * @return {string}
     */
    _toHex(bytes) {
        return bytes.map((byte) => {
            let hex = java.lang.Integer.toHexString(byte & 0xff);
            return hex.length % 2 ? '0' + hex : hex;
        }).join('').toUpperCase();
    },
    /**
     * @param {string} hex
     * @return {number[]}
     */
    _fromHex(hex) {
        let bytes = util.java.array('byte', hex.length / 2);
        String(hex).match(/\w{2}/g).forEach((s, i) => {
            let n = java.lang.Integer.valueOf(s, 16);
            if (typeof n === 'number') {
                /* Auto.js Pro versions */
                bytes[i] = new java.lang.Integer(n).byteValue();
            } else {
                /* Auto.js 4.x versions */
                bytes[i] = n.byteValue();
            }
        });
        return bytes;
    },
    /**
     * @param {string|java.io.File|number[]} data
     * @param {number} mode - the operation mode of this cipher (this is one of the following: ENCRYPT_MODE, DECRYPT_MODE, WRAP_MODE or UNWRAP_MODE)
     * @param {CryptoKey} key - the key
     * @param {Cryptox.CipherTransformationAlgorithm} algorithm - the name of the transformation, e.g., AES/CBC/PKCS5Padding.
     * @param {Object} [options]
     * @param {'file'|'base64'|'hex'} [options.input]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @param {'bytes'|'base64'|'hex'|'string'|'file'} [options.output]
     * @param {java.io.File} [options.dest] - output destination
     * @return {string|number[]|void}
     */
    _cipher(data, mode, key, algorithm, options) {
        let _opt = options || {};

        let cipher = Cipher.getInstance(algorithm);
        cipher.init(mode, key.toKeySpec(algorithm));

        let isFile = function $iiFe() {
            if (_opt.output === 'file') {
                delete _opt.output;
                return _opt.dest !== undefined;
            }
        }();

        let os = isFile
            ? new FileOutputStream(_opt.dest)
            : new ByteArrayOutputStream();
        let cos = new CipherOutputStream(os, cipher);

        let err = null;
        try {
            this._input(data, _opt, (bytes, start, length) => {
                cos.write(bytes, start, length);
            });
        } catch (e) {
            err = e;
        } finally {
            try {
                cos.close();
            } catch (e) {
                // nothing to do here
            }
        }
        if (!isFile && !err) {
            return this._output(os.toByteArray(), _opt, 'bytes');
        }
    },
    Key: Key,
    KeyPair: KeyPair,
    /**
     * @param {string|java.io.File|number[]} message
     * @param {Cryptox.MessageDigestAlgorithm} algorithm - the name of the algorithm requested.
     * @param {Object} [options]
     * @param {?('file'|'base64'|'hex')} [options.input]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @param {'bytes'|'base64'|'hex'|'string'} [options.output='hex']
     * @example
     * // String message summary
     * let msg = 'Auto.js';
     * // Output the hex value of the results of various message digest algorithms
     * log('string: ' + msg);
     * log('MD5: ', cryptox.digest(msg, 'MD5'));
     * log('SHA1: ', cryptox.digest(msg, 'SHA-1'));
     * log('SHA256: ', cryptox.digest(msg, 'SHA-256'));
     *
     * // Output the base64 value of the results of various message digest algorithms
     * log('MD5 [base64]: ', cryptox.digest(msg, 'MD5', {output: 'base64'}));
     * log('SHA1 [base64]: ', cryptox.digest(msg, 'SHA-1', {output: 'base64'}));
     * log('SHA256 [base64]: ', cryptox.digest(msg, 'SHA-256', {output: 'base64'}));
     *
     * // File message summary
     * let path = files.join(files.cwd(), '_test_for_message_digest.js');
     * // Write the content of the file, provide MD5 for subsequent calculations, etc
     * files.write(path, msg);
     * log('File: ', path);
     * log('MD5: ', cryptox.digest(path, 'MD5', {input: 'file'}));
     * log('SHA1: ', cryptox.digest(path, 'SHA-1', {input: 'file'}));
     * log('SHA256: ', cryptox.digest(path, 'SHA-256', {input: 'file'}));
     * log('CRC32: ', cryptox.digest(path, 'CRC32', {input: 'file'}));
     * files.remove(path);
     * @return {string|number[]}
     */
    digest(message, algorithm, options) {
        let _opt = options || {};

        let instance = algorithm === 'CRC32'
            ? new CRC32()
            : MessageDigest.getInstance(algorithm);

        this._input(message, _opt, (bytes, start, length) => {
            instance.update(bytes, start, length);
        });

        return algorithm === 'CRC32'
            ? instance.getValue().toString(16).toUpperCase()
            : this._output(instance.digest(), _opt, 'hex');

    },
    /**
     * @param {string|java.io.File} path
     * @param {Cryptox.MessageDigestAlgorithm} algorithm - the name of the algorithm requested.
     * @param {Object} [options]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @param {'bytes'|'base64'|'hex'|'string'} [options.output='hex']
     * @return {string|number[]}
     */
    digestFile(path, algorithm, options) {
        let _opt = Object.assign(options || {}, {input: 'file'});
        if (typeof path === 'string') {
            return this.digest(files.path(path), algorithm, _opt);
        }
        if (path instanceof File) {
            return this.digest(path, algorithm, _opt);
        }
        throw TypeError('Invalid type of path for cryptox.digestFile()');
    },
    /**
     * @param {string|java.io.File|number[]} data
     * @param {CryptoKey} key - the key
     * @param {Cryptox.CipherTransformationAlgorithm} algorithm - the name of the transformation, e.g., AES/CBC/PKCS5Padding.
     * @param {Object} [options]
     * @param {'file'|'base64'|'hex'} [options.input]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @param {'bytes'|'base64'|'hex'|'string'|'file'} [options.output]
     * @param {java.io.File} [options.dest] - output destination
     * @example
     * let msg = 'Unencrypted string';
     * log('plain text: ' + msg);
     * // The key, because AES and other algorithms require multiples of 16 bits, we use a 16-bit key here
     * let key = new cryptox.Key('password12345678');
     *
     * // AES encryption
     * let aes = cryptox.encrypt(msg, key, 'AES/ECB/PKCS5Padding');
     * log('AES encrypted binary data: ', aes);
     * log('AES decryption: ', cryptox.decrypt(aes, key, 'AES/ECB/PKCS5Padding', {output: 'string'}));
     *
     * // RSA encryption
     * // Generate RSA key
     * let kp = cryptox.generateKeyPair('RSA');
     * // Use private key to encrypt
     * let rsa = cryptox.encrypt(msg, kp.privateKey, 'RSA/ECB/PKCS1Padding');
     * log('Binary data after RSA private key encryption: ', rsa);
     * // Use public key to decrypt
     * log('RSA public key decryption: ', cryptox.decrypt(rsa, kp.publicKey, 'RSA/ECB/PKCS1Padding', {output: 'string'}));
     * @return {string|number[]|void}
     */
    encrypt(data, key, algorithm, options) {
        return this._cipher(data, Cipher.ENCRYPT_MODE, key, algorithm, options);
    },
    /**
     * @param {string|java.io.File|number[]} data
     * @param {CryptoKey} key - the key
     * @param {Cryptox.CipherTransformationAlgorithm} algorithm - the name of the transformation, e.g., AES/CBC/PKCS5Padding.
     * @param {Object} [options]
     * @param {'file'|'base64'|'hex'} [options.input]
     * @param {StandardCharsets} [options.encoding='utf-8']
     * @param {'bytes'|'base64'|'hex'|'string'|'file'} [options.output]
     * @param {java.io.File} [options.dest] - output destination
     * @example
     * let msg = 'Unencrypted string';
     * log('plain text: ' + msg);
     * // The key, because AES and other algorithms require multiples of 16 bits, we use a 16-bit key here
     * let key = new cryptox.Key('password12345678');
     *
     * // AES encryption
     * let aes = cryptox.encrypt(msg, key, 'AES/ECB/PKCS5Padding');
     * log('AES encrypted binary data: ', aes);
     * log('AES decryption: ', cryptox.decrypt(aes, key, 'AES/ECB/PKCS5Padding', {output: 'string'}));
     *
     * // RSA encryption
     * // Generate RSA key
     * let kp = cryptox.generateKeyPair('RSA');
     * // Use private key to encrypt
     * let rsa = cryptox.encrypt(msg, kp.privateKey, 'RSA/ECB/PKCS1Padding');
     * log('Binary data after RSA private key encryption: ', rsa);
     * // Use public key to decrypt
     * log('RSA public key decryption: ', cryptox.decrypt(rsa, kp.publicKey, 'RSA/ECB/PKCS1Padding', {output: 'string'}));
     * @return {string|number[]|void}
     */
    decrypt(data, key, algorithm, options) {
        return this._cipher(data, Cipher.DECRYPT_MODE, key, algorithm, options);
    },
    /**
     * @param {Cryptox.KeyPairGeneratorAlgorithm} algorithm - the standard string name of the algorithm (KeyPairGenerator).
     * @param {number} [length=256] - the key size. This is an algorithm-specific metric, such as modulus length, specified in number of bits.
     * @return {CryptoKeyPair}
     */
    generateKeyPair(algorithm, length) {
        let generator = KeyPairGenerator.getInstance(algorithm);
        generator.initialize(length || 256);
        let keyPair = generator.generateKeyPair();
        return new this.KeyPair(keyPair.getPublic().getEncoded(), keyPair.getPrivate().getEncoded());
    },
    /**
     * @param {number} [length=32]
     * @return {string}
     */
    generateRandomKeyInput(length) {
        let l = length || 32;
        if (l !== 32 && l !== 16) {
            throw Error('length must be either 16 or 32');
        }
        let s = '';
        for (let i = 0; i < 32; i += 1) {
            s += String.fromCharCode(Math.random() * 0x9fff);
        }
        return String(this.digest(s, 'MD5')).slice(-length);
    },
    /**
     * @param {string} k
     * @return {CryptoKey}
     */
    _getKey(k) {
        if (!k) {
            throw Error('Invalid key for cryptox._getKey()');
        }
        if (k.length % 16 === 0 && k.match(/^[a-f0-9]+$/i)) {
            return new this.Key(k);
        }
        let _path = filesx['.local']('key.nfex');
        files.exists(_path) || files.createWithDirs(_path);

        let _o = filesx.readJson(_path);
        if (_o[k]) {
            return new this.Key(_o[k]);
        }
        let _new_key = _o[k] = this.generateRandomKeyInput();
        filesx.writeJson(_path, _o);

        return new this.Key(_new_key);
    },
    /**
     * Simple encapsulation for crypto.encrypt()
     * @param {string} message
     * @param {string} key_input
     * @return {string}
     */
    enc(message, key_input) {
        return this.encrypt(message, this._getKey(key_input),
            'AES/ECB/PKCS5Padding', {output: 'hex'});
    },
    /**
     * Simple encapsulation for crypto.decrypt()
     * @param {string} data
     * @param {string} key_input
     * @return {string}
     */
    dec(data, key_input) {
        if (isNullish(data) || data === String()) {
            return data;
        }
        let _err = null;
        let _res = function $iiFe() {
            try {
                return this.decrypt(data, this._getKey(key_input),
                    'AES/ECB/PKCS5Padding', {output: 'string', input: 'hex'});
            } catch (e) {
                _err = e;
            }
        }.call(this);
        if (!isNullish(_res)) {
            return _res;
        }
        let _legacy = this._pwmap.decrypt(data);
        if (!isNullish(_legacy)) {
            return _legacy;
        }
        throw Error(_err !== null ? _err : 'Decrypted failed');
    },
};

module.exports = {cryptox: exp};