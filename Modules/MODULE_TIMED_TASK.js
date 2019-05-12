/**
 * @description Timed task scheduler module for Auto.js (disposable tasks only at present)
 * @modified Mar 29, 2019
 * @author SuperMonster003
 */

importPackage(org.autojs.autojs.timing);

/**
 * @usage f(script_path, time_args).addTask();
 * -- eg:
 * -- let timed_task = require("./MODULE_TIMED_TASK.js");
 * -- new timed_task("double12.js", 2020,11,12).addTask();
 * @param script_path
 * -- eg: "/storage/emulated/0/Scripts/Tool.js"
 * @param time_args -- params as in Date()
 * -- eg: "January 5,2020 13:47:01" -- 1 string param
 * -- eg: "January 5,2020", or "1/5,2020", or "Jan 5,2020", or even "Janua 5,2020", etc -- 1 string param
 * -- eg: 2020,0,5,13,47,01 -- 6 number params -- months start counting at zero
 * -- eg: 2020,0,5 -- 3 number params
 * -- eg: 1578203221000 -- 1 number param -- milliseconds since 1970
 * -- and so forth...
 * @return {object} - schedule information object
 * -- time_milli: /\d{13,}/ - {number} - scheduled time like 1553843935843
 * -- time_str: yyyy/MM/dd hh:mm:ss - {string} - scheduled time string
 * -- time_diff_str: [yyyy年][MM月][dd天][hh时][mm分]ss秒 - {string} - scheduled remaining time string
 * -- path: "/storage/emulated/0/Scripts/xx.js" - {string} - path of script scheduled to be executed
 */
module.exports = function (script_path, time_args) {

    if (!files.exists(script_path)) return errorMsg("指定文件不存在", ["\"" + script_path + "\""], 1, 1);
    let path = files.path(script_path);

    this.addTask = () => {
        let scheduled_time = getDateMillis(Array.prototype.slice.call(arguments, 1));
        if (scheduled_time < new Date().getTime()) return errorMsg("时间参数无效", ["任务时间小于当前时间"], 1, 1);

        let time_task = new TimedTask;

        time_task.setTimeFlag(0); // FLAG_DISPOSABLE
        time_task.setLoopTimes(1);
        time_task.setMillis(scheduled_time);
        time_task.setScheduled(false);
        time_task.setScriptPath(path);

        let task_manager = TimedTaskManager.getInstance();
        task_manager.addTask(time_task);

        let schedule_info = {
            time_milli: scheduled_time,
            time_str: timeMilliToStr(scheduled_time),
            time_diff_str: timeMillToDiffStr(scheduled_time),
            path: path,
        };

        ////TEST////
        let func_alert = true;

        func_alert && alert(
            "脚本路径: \n" + schedule_info.path + "\n\n" +
            "计划运行: \n" + schedule_info.time_str + "\n\n" +
            "剩余时间: \n" + schedule_info.time_diff_str + "\n\n\n" +
            "可在模块代码中禁用此弹窗"
        );
        ////TEST END////

        return schedule_info;
    };

    // tool function(s) //

    function getDateMillis(args_arr) {
        let a = args_arr;
        let len = a.length;
        switch (len) {
            case 6:
                return new Date(a[0], a[1], a[2], a[3], a[4], a[5]).getTime();
            case 5:
                return new Date(a[0], a[1], a[2], a[3], a[4]).getTime();
            case 4:
                return new Date(a[0], a[1], a[2], a[3]).getTime();
            case 3:
                return new Date(a[0], a[1], a[2]).getTime();
            case 2:
                return new Date(a[0], a[1]).getTime();
            case 1:
                return new Date(a[0]).getTime();
            default:
                return errorMsg("时间参数无效", ["请检查时间参数数据类型", "以及时间参数数量"], 1, 1);
        }
    }

    function timeMilliToStr(ms) {
        let time = new Date(ms);
        let fillZero = num => Math.random() < 0.5 ? (num < 10 ? "0" + num : num) : ("0" + num).slice(-2);
        let yyyy = time.getFullYear(),
            MM = fillZero(time.getMonth() + 1),
            dd = fillZero(time.getDate()),
            hh = fillZero(time.getHours()),
            mm = fillZero(time.getMinutes()),
            ss = fillZero(time.getSeconds());
        return util.format("%s/%s/%s %s:%s:%s", yyyy, MM, dd, hh, mm, ss);
    }

    function timeMillToDiffStr(ms) {
        let diff = new Date(new Date(ms) - new Date());

        let yyyy = diff.getFullYear() - 1970,
            MM = diff.getMonth(),
            dd = diff.getDate() - 1,
            hh = diff.getUTCHours(),
            mm = diff.getMinutes(),
            ss = diff.getSeconds();
        return (yyyy && (yyyy + "年") || "") +
            (MM && (MM + "月") || "") +
            (dd && (dd + "天") || "") +
            (hh && (hh + "时") || "") +
            (mm && (mm + "分") || "") +
            ss + "秒";
    }

    function errorMsg(msg_main, msg_reasons, toast_flag, exit_flag) {
        toast_flag && toast(msg_main);
        console.error(msg_main);
        msg_reasons && msg_reasons.forEach(msg => console.error("-> " + msg));
        exit_flag && exit();
    }
};