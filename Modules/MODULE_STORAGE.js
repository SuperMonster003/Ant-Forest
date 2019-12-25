module.exports = (function () {
    let storages = {};

    storages.create = function (name) {
        return new Storage(name);
    };

    storages.remove = function (name) {
        this.create(name).clear();
    };

    return storages;

    // constructor(s) //

    function Storage(name) {
        let storage_dir = files.getSdcardPath() + "/.local/";
        let file = createFile(storage_dir);
        let opened = files.open(file);
        let readFile = () => files.read(file);

        this.contains = contains;
        this.get = get;
        this.put = put;
        this.remove = remove;
        this.clear = clear;

        function createFile(dir) {
            let file = dir + name + ".nfe";
            files.createWithDirs(file);
            return file;
        }

        function contains(key) {
            let read = readFile();
            if (!read) return false;
            return key in JSON.parse(read);
        }

        function put(key, new_value, forcible_flag) {
            if (typeof new_value === "undefined") throw new TypeError("\"put\" value can't be undefined");
            let _read = readFile();
            let _old_data = {};
            let _tmp_data = {};

            try {
                _old_data = JSON.parse(_read, (k, v) => v === "Infinity" ? Infinity : v);
            } catch (e) {
                console.warn(e.message);
            }

            let _both_type_o = classof(new_value, "Object") && classof(_old_data[key], "Object");
            if (!forcible_flag && _both_type_o && Object.keys(new_value).length) {
                _tmp_data[key] = Object.assign(_old_data[key], new_value);
            } else {
                _tmp_data[key] = new_value;
            }
            Object.assign(_old_data, _tmp_data);
            files.write(file, JSON.stringify(_old_data, (k, v) => v === Infinity ? "Infinity" : v));
            opened.close();
        }

        function get(key, value) {
            let read = readFile();
            if (!read) return value;
            try {
                let obj = JSON.parse(read, (key, value) => value === "Infinity" ? Infinity : value) || {};
                return key in obj ? obj[key] : value;
            } catch (e) {
                console.warn(e.message);
                return value;
            }
        }

        function remove(key) {
            let read = readFile();
            if (!read) return;
            let obj = JSON.parse(read);
            if (!(key in obj)) return;
            delete obj[key];
            files.write(file, JSON.stringify(obj));
            opened.close();
        }

        function clear() {
            files.remove(file);
        }

        function classof(source, check_value) {
            let class_result = Object.prototype.toString.call(source).slice(8, -1);
            return check_value ? class_result.toUpperCase() === check_value.toUpperCase() : class_result;
        }
    }
})();

/**
 * @description set values into or get values from files in "/sdcard/.local" folder
 * @author {@link https://github.com/SuperMonster003}
 */