/**
 *  Unlock module has been integrated into './modules/ext-device.js'
 */

throw Error('\n' +
    'Do not require this module any longer\n' +
    'zh-CN: 请勿引用当前模块\n' +
    'Use devicex.unlock() instead\n' +
    'zh-CN: 使用 devicex.unlock() 替代\n'
);

// Here are samples for unlocking the device.

// /* sample a: */
// require('./modules/ext-device').unlock();
//
// /* sample b: */
// require('./modules/ext-device').unlock(true); // with debug info
//
// /* sample c: */
// require('./modules/ext-device').load();
// devicex.unlock();