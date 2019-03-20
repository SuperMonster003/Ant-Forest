/**
 @description module for unlocking your phone
 @borrows {@link https://github.com/e1399579/autojs}
 */

auto();

function Unlock() {
    let PWMAP = require("./MODULE_PWMAP.js"),
        encrypt = new PWMAP().pwmapEncrypt,
        decrypt = new PWMAP().pwmapDecrypt;

    let config = {
        "E6683": {
            password: restoredPasswordArr(["EwVNKFgo", "pDtkGQdZ", "VNEPXvxQ", "rhxNUBYx"]),
        },
        "G8441": {
            password: decrypt(["WrpobXNj", "oRjIXlzr", "wPpySqLG", "UjYdTkLI", "dtUrRLrP"], "no_clip"),
        },
    };

    let is_screen_on = device.isScreenOn(),
        dev_model = device.model,
        password = config[dev_model].password,
        pattern_size = config[dev_model].pattern_size || 3,
        max_try_times = config[dev_model].max_try_times || 8;

    this.is_screen_on = is_screen_on;

    this.unlock = function () {
        while (!device.isScreenOn()) {
            device.wakeUp();
            sleep(500);
        }
        let Robot = require("./Robot_e1399579.js"),
            Secure = require("./Secure_e1399579.js");
        (new Secure(new Robot(max_try_times), max_try_times)).openLock(password, pattern_size);
    };

    function restoredPasswordArr(arr) {
        let result = [],
            map = JSON.parse(files.read("../.local/PWMAP.txt"));
        arr.forEach(value => result.push(map[value]));
        return result;
    }
}

module.exports = Unlock;