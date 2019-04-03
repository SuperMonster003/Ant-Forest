// visibility="{{config['is_cycle'] ? 'visible' : 'gone'}}"
// <horizontal w="*" h="1sp" bg="#cccccc" margin="10 0"></horizontal> // 分割线
// 删除日志保留功能 在自己的本地配置里保存一个路径 如果有这个路径 就设置 默认关闭


"ui";

let WIDTH = device.width;
let HEIGHT = device.height;
let w = ~~(WIDTH * 0.78) + "px"; // item text width

let storage = storage = require("./Modules/MODULE_STORAGE").create("af_cfg");
let storage_config = storage.get("config");
let session_config = storage_config;

function obj_equal(obj_a, obj_b) {
    let keys_a = Object.keys(obj_a),
        keys_a_len = keys_a.length,
        keys_b = Object.keys(obj_b),
        keys_b_len = keys_b.length;
    if (keys_a_len !== keys_b_len) return false;
    for (let i = 0; i < keys_a_len; i += 1) {
        let key_a = keys_a[i],
            value_a = obj_a[key_a];
        if (!(key_a in obj_b)) return false;
        if (value_a !== obj_b[key_a]) return false;
    }
    return true;
}

let config = {
    account_switch: false, // if you are multi-account user, you may specify a "main account" to switch
    help_switch: true, // set "false value" if you do not wanna give a hand; leave it "true value" if you like "surprise"
    show_console_log_details: true, // whether to show message details of each friend in console
    floaty_msg_switch: true, // important will show in floaty way with "true value" or toast way with "false value"
    non_break_check: ["07:28:00", "07:28:47"], // period for non-stop checking your own energy balls; leave [] if you don't need
    auto_js_log_record_path: "../Log/AutoJsLog.txt", // up to 512KB per file; leave "false value" if not needed
    list_swipe_interval: 300, // unit: millisecond; set this value bigger if errors like "CvException" occurred
    color_green: "#1da06d", // color for collect icon with a hand pattern
    color_orange: "#f99137", // color for help icon with a heart pattern
    color_threshold_rank_list_icons: 10, // 0 <= x <= 66 is recommended; the smaller, the stricter; max limit tested on Sony G8441
    color_threshold_help_collect_balls: 60, // 30 ~< x <= 83 is recommended; the smaller, the stricter; max limit tested on Sony G8441
    help_collect_intensity: 16, // 10 <= x <= 20 is recommended; more samples for image matching, at the cost of time however
    max_running_time: 5, // 1 <= x <= 30; running timeout each time; unit: minute; leave "false value" if you dislike limitation
    launch_notice: 5,
};

let hint = {
    help_switch: {
        "title": "帮收功能",
        "0": "已关闭: 不帮收能量",
        "1": "已开启: 帮收能量",
    },
    non_break_check: {
        "title": "监测自己能量",
        "0": "已关闭: 不监测自己可收取的能量",
        "1": "当前已设置时间区间: 2",
    },
    account_switch: {
        "title": "账户功能",
        "0": "已关闭: 忽略支付宝账户直接操作蚂蚁森林",
        "1": "当前主账户: wu***hotmail.com",
    },
    launch_notice: {
        "title": "运行提示",
        "0": "已关闭: 无提示直接运行脚本",
        "1": "5秒",
    },
};

let assignment = {};

ui.layout(
    <vertical id="main">
        <linear bg="#03a6ef" w="*">
            <text id="title" text="Ant_Forest" textColor="#ffffff" textSize="19" textStyle="bold" margin="16 16 186 16"/>

            <vertical margin="13 0">
                <grid id="icon_save">
                    <img src="@drawable/{{this}}" width="31" bg="?selectableItemBackgroundBorderless" tint="#bbcccc"/>
                </grid>
                <text text="SAVE" gravity="center" textSize="10" textColor="#bbcccc" textStyle="bold" marginTop="-10"/>
            </vertical>

        </linear>


        <ScrollView>
            <vertical>
                <vertical>
                    <text text="基本设置" textColor="#03a6ef" textSize="14" margin="16 16 0 0"/>
                </vertical>
                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <horizontal w="*" padding="6" margin="0 0 0 5">
                        <vertical id="menu_help_switch">
                            <text id="title_help_switch" textColor="#111111" textSize="16" w="{{w}}"/>
                            <text id="hint_help_switch" textColor="#888888" textSize="13sp"/>
                        </vertical>
                        <Switch id="sw_help_switch" layout_gravity="right|center"/>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text id="title_non_break_check" textColor="#111111" textSize="16" w="{{w}}"/>
                            <text id="hint_non_break_check" textColor="#888888" textSize="13sp"/>
                        </vertical>
                        <Switch id="sw_non_break_check" layout_gravity="right|center"/>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="锁屏自动解锁配置" textColor="#111111" textSize="16"/>
                            <text text="已设置: 点击可更改配置" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="定时任务管理" textColor="#111111" textSize="16"/>
                            <text text="当前定时任务数量: 1" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="黑名单管理" textColor="#111111" textSize="16"/>
                            <text text="能量罩黑名单成员: 0  自定义黑名单成员: 0" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                </vertical>

                <vertical>
                    <text text="高级设置" textColor="#03a6ef" textSize="14" margin="16 0 0 6"/>
                </vertical>

                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <horizontal w="*" padding="6" margin="0 0 0 5">
                        <vertical>
                            <text id="title_account_switch" textColor="#111111" textSize="16" w="{{w}}"/>
                            <text id="hint_account_switch" textColor="#888888" textSize="13sp"/>
                        </vertical>
                        <Switch id="sw_account_switch" layout_gravity="right|center" checked="true"/>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 0 0 5">
                        <vertical>
                            <text text="语言" textColor="#111111" textSize="16" w="{{w}}"/>
                            <text text="支付宝: 简体中文  设置界面: 简体中文" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 0 0 5">
                        <vertical>
                            <text id="title_launch_notice" textColor="#111111" textSize="16" w="{{w}}"/>
                            <text id="hint_launch_notice" textColor="#888888" textSize="13sp"/>
                        </vertical>
                        <Switch id="sw_launch_notice" layout_gravity="right|center" checked="false"/>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="控制台消息日志" textColor="#111111" textSize="16" w="{{w}}"/>
                            <text text="详细" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="收取结果展示" textColor="#111111" textSize="16"/>
                            <text text="floaty" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="取样颜色设置" textColor="#111111" textSize="16"/>
                            <text text="色值/阈值" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="列表滑动间隔" textColor="#111111" textSize="16"/>
                            <text text="300" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="脚本最大运行时间" textColor="#111111" textSize="16"/>
                            <text text="0" textColor="#888888" textSize="13sp"/>
                        </vertical>
                    </horizontal>
                </vertical>


                <vertical>
                    <text text="重置" textColor="#03a6ef" textSize="14" margin="16 0 0 6"/>
                </vertical>

                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <horizontal w="*" padding="6" margin="0 0 0 5">
                        <vertical>
                            <text text="恢复默认设置" textColor="#111111" textSize="16"/>
                        </vertical>
                    </horizontal>
                </vertical>


                <vertical>
                    <text text="其他" textColor="#03a6ef" textSize="14" margin="16 0 0 6"/>
                </vertical>

                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="关于软件及脚本作者" textColor="#111111" textSize="16" w="{{w}}"/>
                            <text text="v1.3.7" textColor="#888888" textSize="13sp"/>
                            //SuperMonster003 检查更新 源码 邮箱等 参考autojs的关于
                        </vertical>
                    </horizontal>
                </vertical>


            </vertical>
        </ScrollView>
    </vertical>
);

ui.statusBarColor("#03a6ef");
ui.icon_save.setDataSource(["ic_save_black_48dp"]);

initSwitch(["help_switch", "non_break_check", "account_switch", "launch_notice"]);

function initSwitch(sw_id) {
    let sw = typeof sw_id === "string" ? [sw_id] : sw_id;
    sw.forEach(sw_id => {
        ui["sw_" + sw_id].on("check", checked => {
            ui["hint_" + sw_id].setText(hint[sw_id][+checked]);
        });
        ui["sw_" + sw_id].setChecked(!!config[sw_id]);
        ui["title_" + sw_id].setText(hint[sw_id]["title"])
    });
}


let modified_flag = false,
    sub_page_flag = false;

let main_view = ui.main;
let parent = main_view.getParent();


//ui.layout(<vertical id="main"><text/></vertical>);

function setPage(title, title_bg_color) {
    title_bg_color = title_bg_color || "#03a6ef"; // sky blue
    let new_view = ui.inflate(<vertical></vertical>);
    new_view.addView(ui.inflate(<linear id="_title_bg">
        <text id="_title_text" textColor="#ffffff" textSize="19" textStyle="bold" margin="16"/>
    </linear>));
    new_view._title_text.text(title);
    let title_bg = typeof title_bg_color === "string" ? colors.parseColor(title_bg_color) : title_bg_color;
    new_view._title_bg.setBackgroundColor(title_bg);
    new_view.addView(ui.inflate(<ScrollView>
        <vertical id="scroll_view"></vertical>
    </ScrollView>));
    new_view.scroll_view.addView(ui.inflate(<frame>
        <frame margin="0 0 0 8"></frame>
    </frame>));
    return new_view;
}

function setItem(type, title, hint, sub_head_color) {

    if (type === "sub_head") return setSubHead(title, sub_head_color);

    let switch_type = type === "switch";
    let new_view = ui.inflate(
        <horizontal id="_item_area" padding="16 8" gravity="left|center">
            <vertical id="_content" w="{{w}}" h="40" gravity="left|center">
                <text id="_title" textColor="#111111" textSize="16"/>
            </vertical>
        </horizontal>);
    new_view._title.text(title);

    if (hint) {
        let hint_view = ui.inflate(<text id="_hint" textColor="#888888" textSize="13sp"/>);
        hint_view._hint.text(hint);
        new_view._content.addView(hint_view);
    }

    if (switch_type) {
        new_view._item_area.addView(ui.inflate(<Switch/>));
    }

    return new_view;

    // tool function(s) //

    function setSubHead(title, sub_head_color) {
        sub_head_color = sub_head_color || "#03a6ef";
        let new_view = ui.inflate(<vertical>
            <text id="_text" textSize="14" margin="16 8"/>
        </vertical>);
        new_view._text.text(title);
        let title_color = typeof sub_head_color === "string" ? colors.parseColor(sub_head_color) : sub_head_color;
        new_view._text.setTextColor(title_color);
        return new_view;
    }
}


let page_help_collect = setPage("帮收功能");
let add = view => page_help_collect.scroll_view.addView(view);
//add(setItem("sub_head", "基本设置"));
add(setItem("switch", "总开关"));
add(setItem("sub_head", "高级设置"));
add(setItem("item", "检测密度", "16"));
add(setItem("item", "颜色色值", "#f99137")); // 在文字后面跟一个颜色指示方块
add(setItem("item", "颜色检测阈值", "60"));

// 开关
// 默认状态 读取存储
// 监测状态 ON/OFF on("click")... 写入存储


let sub_view = page_help_collect;


ui.menu_help_switch.on("click", () => {

    parent.addView(sub_view);

    smoothScrollMenu([main_view, sub_view], "full_left");
    sub_page_flag = true;
});


ui.emitter.on("back_pressed", e => {
    e.consumed = sub_page_flag || modified_flag;
    if (modified_flag && !sub_page_flag) toast("You need to save before exit");
    else {
        smoothScrollMenu([main_view, sub_view], "full_right");
        sub_page_flag = false;
    }
});


function smoothScrollMenu(views, shiftings, duration) {

    // views expects not more than 2 params
    if (Object.prototype.toString.call(views).slice(8, -1) !== "Array") views = [views];

    let main_view = views[0],
        sub_view = views[1];

    duration = duration || 180;

    if (shiftings === "full_left") {
        shiftings = [WIDTH, 0];
        sub_view && sub_view.scrollBy(-WIDTH, 0);
    } else if (shiftings === "full_right") {
        shiftings = [-WIDTH, 0];
    }

    let dx = shiftings[0],
        dy = shiftings[1];

    let each_move_time = 10;

    let neg_x = dx < 0,
        neg_y = dy < 0;

    let abs = num => num < 0 && -num || num;
    dx = abs(dx);
    dy = abs(dy);

    let ptx = dx && Math.ceil(each_move_time * dx / duration) || 0,
        pty = dy && Math.ceil(each_move_time * dy / duration) || 0;

    let scroll_interval = setInterval(function () {
        if (!dx && !dy) return;
        let move_x = ptx && (dx > ptx ? ptx : (ptx - (dx % ptx))),
            move_y = pty && (dy > pty ? pty : (pty - (dy % pty)));
        let scroll_x = neg_x && -move_x || move_x,
            scroll_y = neg_y && -move_y || move_y;
        sub_view && sub_view.scrollBy(scroll_x, scroll_y);
        main_view.scrollBy(scroll_x, scroll_y);
        dx -= ptx;
        dy -= pty;
    }, each_move_time);
    setTimeout(() => {
        if (shiftings[0] === -WIDTH && sub_view) {
            sub_view.scrollBy(WIDTH, 0);
            let child_count = parent.getChildCount();
            while (child_count > 1) parent.removeView(parent.getChildAt(--child_count));
        }
        clearInterval(scroll_interval);
    }, duration + 200); // 200: a safe interval just in case
}