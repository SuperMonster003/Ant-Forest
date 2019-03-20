auto();

// just set the tool name here in an easy way ^_^
let config = {
    tool_name: "Ant_Forest",
};

exec();

// tool function(s) //

function exec() {
    let tool_name = config.tool_name;
    tool_name.match(/\.js$/) || (tool_name += ".js");

    let path_prefix = files.cwd() + "/Tools/";

    files.exists(path_prefix + tool_name) ||
    (tool_name = "!" + tool_name) && files.exists(path_prefix + tool_name) ||
    ~alert("File does't exists: \n" + path_prefix + tool_name.slice(1)) && exit();

    engines.execScriptFile(path_prefix + tool_name, {
        path: path_prefix,
    });
}