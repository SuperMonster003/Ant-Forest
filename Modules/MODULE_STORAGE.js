module.exports = (function () {
    let storages = {};

    storages.create = function (name) {
        return new Storage(name);
    };

    storages.remove = function (name) {
        this.create(name).clear();
    };

    return storages;

    // constructor //

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
            return !!(key in JSON.parse(read));
        }

        function put(key, value) {
            if (typeof value === "undefined") throw new TypeError("\"put\" value can't be undefined");
            let read = readFile();
            let obj = read && JSON.parse(read) || {};
            let new_obj = {};
            new_obj[key] = value;
            Object.assign(obj, new_obj);
            files.write(file, JSON.stringify(obj));
            opened.close();
        }

        function get(key, value) {
            let read = readFile();
            if (!read) return value;
            let obj = JSON.parse(read);
            return key in obj ? obj[key] : value;
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
    }
})();

/**
 * @description set values into or get values from files in "/sdcard/.local" folder
 * @author {@link https://github.com/SuperMonster003}
 */