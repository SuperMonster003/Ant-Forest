/**
 * @description module for global tool functions
 * @author SuperMonster003
 */

// constructor //

function GlobalFunc() {
    /**
     * @param {string} [extra_str=""] string you wanna append after the split line
     * @param {string} [style] "dash" for a dash line
     * console.log({a 32-bit hyphen split line});
     **/
    showSplitLine = function (extra_str, style) {
        extra_str = extra_str || "";
        let split_line = "";
        if (style === "dash") {
            for (let i = 0; i < 16; i += 1) split_line += "- ";
            split_line += "-";
        } else {
            for (let i = 0; i < 32; i += 1) split_line += "-";
        }
        log(split_line + extra_str);
        return true;
    };
    messageAction = function (msg, msg_level, if_needs_toast, if_needs_arrow, if_needs_split_line) {
        if (if_needs_toast) toast(msg);
        let split_line_style = "";
        if (typeof if_needs_split_line === "string") {
            if (if_needs_split_line.match(/dash/)) split_line_style = "dash";
            if (if_needs_split_line.match(/^both(_n)?|up/)) {
                showSplitLine("", split_line_style);
                if (if_needs_split_line.match(/both_n/)) if_needs_split_line = "\n";
                else if (if_needs_split_line.match(/both/)) if_needs_split_line = 1;
                else if (if_needs_split_line.match(/up/)) if_needs_split_line = 0;
            }
        }
        if (if_needs_arrow) {
            if (if_needs_arrow > 10) messageAction("\"if_needs_arrow\"参数不可大于10", 8, 1, 0, 1);
            msg = "> " + msg;
            for (let i = 0; i < if_needs_arrow; i += 1) msg = "-" + msg;
        }
        let exit_flag = false;
        switch (msg_level) {
            case 0:
            case "verbose":
            case "v":
                msg_level = 0;
                console.verbose(msg);
                break;
            case 1:
            case "log":
            case "l":
                msg_level = 1;
                console.log(msg);
                break;
            case 2:
            case "i":
            case "info":
                msg_level = 2;
                console.info(msg);
                break;
            case 3:
            case "warn":
            case "w":
                msg_level = 3;
                console.warn(msg);
                break;
            case 4:
            case "error":
            case "e":
                msg_level = 4;
                console.error(msg);
                break;
            case 8:
            case "x":
                msg_level = 4;
                console.error(msg);
                exit_flag = true;
                break;
            case 9:
            case "h":
                msg_level = 4;
                console.error(msg);
                keycode(3);
                exit_flag = true;
                break; // useless, just for inspection
            case "t":
            case "title":
                msg_level = 1;
                console.log("[ " + msg + " ]");
                break;
        }
        if (if_needs_split_line) showSplitLine(typeof if_needs_split_line === "string" ? (if_needs_split_line === "dash" ? "" : if_needs_split_line) : "", split_line_style);
        exit_flag && exit();
        if (typeof current_app !== "undefined") current_app.msg_level = current_app.msg_level ? Math.max(current_app.msg_level, msg_level) : msg_level;
        return !(msg_level in {3: 1, 4: 1});
    };
    keycode = function (keycode_name) {
        let keyEvent = keycode_name => shell("input keyevent " + keycode_name, true).code && KeyCode(keycode_name);
        switch (keycode_name.toString()) {
            case "KEYCODE_HOME":
            case "3":
            case "home":
                return ~home();
            case "KEYCODE_BACK":
            case "4":
            case "back":
                return ~back();
            case "KEYCODE_APP_SWITCH":
            case "187":
            case "recents":
            case "recent":
            case "recent_apps":
                return ~recents();
            case "powerDialog":
            case "power_dialog":
            case "powerMenu":
            case "power_menu":
                return ~powerDialog();
            case "notifications":
            case "notification":
                return ~notifications();
            case "quickSettings":
            case "quickSetting":
            case "quick_settings":
            case "quick_setting":
                return ~quickSettings();
            case "splitScreen":
            case "split_screen":
                return splitScreen();
            default:
                return keyEvent(keycode_name);
        }
    };
}

// export module //

module.exports = GlobalFunc;