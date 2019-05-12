/**
 * @description launcher
 */

try {
    auto.waitFor();
} catch (e) {
    auto();
}

// just set the tool name here in an easy way ^_^
let config = {
    tool_name: "Ant_Forest",
};

exec();

// tool function(s) //

function exec() {

    let tool_name = config.tool_name;
    tool_name.match(/\.js$/) || (tool_name += ".js");
    tool_name.match(/^!/) || (tool_name = "!" + tool_name);
    let path_prefix = "";

    try {
        path_prefix = files.cwd() + "/Tools/";
    } catch (e) {
        showErrors({
            reason: "此版本不支持cwd()方法",
        });
    }

    files.exists(path_prefix + tool_name) ||
    files.exists(path_prefix + tool_name.slice(1)) ||
    ~alert("启动器无法继续运行\n-> 无法定位文件:\n-> \"" + path_prefix + tool_name + "\"") && exit();

    try {
        engines.execScriptFile(path_prefix + tool_name, {
            path: path_prefix,
        });
    } catch (e) {
        showErrors({
            reason: "此版本Engines模块功能异常",
        });
    }

    // tool function(s) //

    function showErrors(msg_params) {
        let main = msg_params["main"] || "启动器无法继续运行";
        console.error(main);
        let reason = msg_params.reason;
        if (typeof reason === "object") {
            reason.forEach(r => console.error("-> " + r));
            reason = reason.join("\n-> ");
        } else console.error("-> " + reason);
        reason = "-> " + reason;
        let addition = msg_params["addition"] || "建议更换版本\n也可尝试手动运行脚本文件: \n\"./Tools/" + tool_name + "\"";
        alert(main + "\n" + reason + "\n\n" + addition);
        exit();
    }
}