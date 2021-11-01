module.exports = {
    pluginsx: {
        af: {
            get biodiversity() {
                return require('./plugin-ant-forest-biodiversity');
            },
            get deployment() {
                return require('./plugin-ant-forest-deployment');
            },
            get district_protect() {
                return require('./plugin-ant-forest-district-protect');
            },
            get energy_rain() {
                return require('./plugin-ant-forest-energy-rain');
            },
            get on_screen_off_launcher() {
                return require('./plugin-ant-forest-on-screen-off-launcher');
            },
        },
        alipay: {
            get account() {
                return require('./plugin-alipay-account');
            },
        },
        autojs: {
            get memory_info() {
                return require('./plugin-autojs-memory-info');
            },
        },
        device: {
            get next_alarm_clock() {
                return require('./plugin-device-next-alarm-clock');
            },
            get unlock() {
                return require('./plugin-device-unlock');
            },
        },
    },
};