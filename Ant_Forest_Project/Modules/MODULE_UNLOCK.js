/**
 @description module for unlocking your phone
 @author e1399579 (lead author)
 @author SuperMonster003 (corresponding author)
 */

function Unlock() {
    let PWMAP = require("./MODULE_PWMAP.js"),
        storage_unlock = require("./MODULE_STORAGE.js").create("unlock"),
        decrypt = new PWMAP().pwmapDecrypt;

    let storage_unlock_config = storage_unlock.get("config", {});
    let password = decrypt(storage_unlock_config.unlock_code) || "",
        max_try_times = storage_unlock_config.unlock_max_try_times, // could be undefined
        pattern_size = storage_unlock_config.unlock_pattern_size; // could be undefined

    this.is_screen_on = device.isScreenOn();

    this.unlock = function () {

        let safe_max_wakeup_times = 60; // 30 sec
        while (!device.isScreenOn() && safe_max_wakeup_times--) ~device.wakeUp() && sleep(500);
        if (safe_max_wakeup_times < 0) ~console.error("屏幕亮起失败") && exit();

        let Robot = require("./Robot_e1399579.js"),
            Secure = require("./Secure_e1399579.js");
        new Secure(new Robot(max_try_times), max_try_times).openLock(password, pattern_size);
    };
}

module.exports = Unlock;