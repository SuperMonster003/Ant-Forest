"ui";

importClass(android.widget.LinearLayout);
importClass(android.view.ViewGroup);

let WIDTH = device.width;
let HEIGHT = device.height;
let storage = storage = require("./Modules/MODULE_STORAGE").create("af_cfg");
let storage_config = storage.get("config", {});
let session_config = Object.assign({}, storage_config);
let def = undefined;
let defs = {
    "item_area_width": ~~(WIDTH * 0.78) + "px",
    "sub_head_color": "#03a6ef",
    "title_bg_color": "#03a6ef",
    "save_btn_on_color": "#ffffff",
    "save_btn_off_color": "#bbcccc",
};
let assignment = {
    session_params: {
        "tint_c": null,
        "text_c": null,
    },
    "basic_settings": {
        "title": "基本功能",
        "sub_head_color": def,
    },
    "help_collect": {
        "title": "帮收功能",
        "config_conj": "help_collect_switch",
        "hint": {
            "0": "已关闭",
            "1": "已开启",
        },
        get listener() {
            return {
                "switch": {
                    "check": state => {
                        this.view["_hint"].setText(this.hint[+state]);
                        saveSession(this.config_conj, !!state);
                        log("session_config:\n" + session_config); ////TEST////
                    },
                },
            };
        },
    },
};

function obj_equal(obj_a, obj_b) {
    if (!obj_a || !obj_b) return false;
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
    help_collect: true, // set "false value" if you do not wanna give a hand; leave it "true value" if you like "surprise"
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

let modified_flag = false,
    sub_page_flag = false;

function setSaveBtn(new_view) {
    let save_btn = getLayoutSaveBtn("OFF");
    new_view._title_text.setWidth(~~(552 * WIDTH / 720));
    new_view._title_bg.addView(save_btn);
}

function setPage(title, title_bg_color, additions) {
    title_bg_color = title_bg_color || defs["title_bg_color"];
    let new_view = ui.inflate(<vertical></vertical>);
    new_view.addView(ui.inflate(
        <linear id="_title_bg">
            <text id="_title_text" textColor="#ffffff" textSize="19" textStyle="bold" margin="16"/>
        </linear>
    ));
    new_view._title_text.text(title);
    let title_bg = typeof title_bg_color === "string" ? colors.parseColor(title_bg_color) : title_bg_color;
    new_view._title_bg.setBackgroundColor(title_bg);

    if (additions) typeof additions === "function" ? additions(new_view) : additions.forEach(f => f(new_view));

    new_view.addView(ui.inflate(<ScrollView>
        <vertical id="scroll_view"></vertical>
    </ScrollView>));
    new_view.scroll_view.addView(ui.inflate(<frame>
        <frame margin="0 0 0 8"></frame>
    </frame>));
    return new_view;
}


ui.layout(
    <vertical id="main">
        <text/>
    </vertical>
);
ui.statusBarColor("#03a6ef");

let homepage = setPage("Ant_Forest", def, setSaveBtn);
homepage.add = (type, item_id) => homepage.scroll_view.addView(setItem(type, item_id));
homepage.add("sub_head", "basic_settings");
homepage.add("switch", "help_collect");
ui.main.getParent().addView(homepage);

function setItem(type, item_id) {

    let item = assignment[item_id];
    item.item_id = item_id;

    if (type === "sub_head") return setSubHead(item);


    let new_view = ui.inflate(
        <horizontal id="_item_area" padding="16 8" gravity="left|center">
            <vertical id="_content" w="{{defs.item_area_width}}" h="40" gravity="left|center">
                <text id="_title" textColor="#111111" textSize="16"/>
            </vertical>
        </horizontal>);

    let title = item["title"];
    new_view._title.text(title);

    let hint = item["hint"];
    if (hint) {
        let hint_view = ui.inflate(<text id="_hint" textColor="#888888" textSize="13sp"/>);
        hint_view._hint.text(hint[+!!session_config[item.config_conj]]);
        new_view._content.addView(hint_view);
    }

    let switch_type = type === "switch";
    if (switch_type) {
        let sw_view = ui.inflate(<Switch id="switch"/>);
        new_view._item_area.addView(sw_view);
        item.view = new_view;
        sw_view["switch"].setChecked(!!session_config[item.config_conj]);


        let listener_ids = item["listener"];
        Object.keys(listener_ids).forEach(id => {
            let listeners = listener_ids[id];
            Object.keys(listeners).forEach(listener => {
                new_view[id].on(listener, listeners[listener]);
            });
        });

    }

    return new_view;

    // tool function(s) //

    function setSubHead(item) {
        let title = item["title"],
            sub_head_color = item["sub_head_color"] || defs["sub_head_color"];

        let new_view = ui.inflate(
            <vertical>
                <text id="_text" textSize="14" margin="16 8"/>
            </vertical>
        );
        new_view._text.text(title);
        let title_color = typeof sub_head_color === "string" ? colors.parseColor(sub_head_color) : sub_head_color;
        new_view._text.setTextColor(title_color);

        return new_view;
    }
}


//let page_help_collect = setPage("帮收功能");
//add = view => page_help_collect.scroll_view.addView(view);
//add(setItem("sub_head", "基本设置"));
//add(setItem("switch", "总开关"));
//add(setItem("sub_head", "高级设置"));
//add(setItem("item", "检测密度", "16"));
//add(setItem("item", "颜色色值", "#f99137")); // 在文字后面跟一个颜色指示方块
//add(setItem("item", "颜色检测阈值", "60"));


//let sub_view = page_help_collect;


//ui.menu_help_collect.on("click", () => {
//    parent.addView(sub_view);
//    smoothScrollMenu([main_view, sub_view], "full_left");
//    sub_page_flag = true;
//});


ui.emitter.on("back_pressed", e => {
    return;


    e.consumed = sub_page_flag || modified_flag;
    if (modified_flag && !sub_page_flag) toast("You need to save before exit");
    else {
        smoothScrollMenu([main_view, sub_view], "full_right");
        sub_page_flag = false;
    }
});


function smoothScrollMenu(views, shifting, duration) {

    // views expects not more than 2 params
    if (Object.prototype.toString.call(views).slice(8, -1) !== "Array") views = [views];

    let main_view = views[0],
        sub_view = views[1];

    duration = duration || 180;

    if (shifting === "full_left") {
        shifting = [WIDTH, 0];
        sub_view && sub_view.scrollBy(-WIDTH, 0);
    } else if (shifting === "full_right") {
        shifting = [-WIDTH, 0];
    }

    let dx = shifting[0],
        dy = shifting[1];

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
        if (shifting[0] === -WIDTH && sub_view) {
            sub_view.scrollBy(WIDTH, 0);
            let child_count = parent.getChildCount();
            while (child_count > 1) parent.removeView(parent.getChildAt(--child_count));
        }
        clearInterval(scroll_interval);
    }, duration + 200); // 200: a safe interval just in case
}

function setLayout(view, left, top, right, bottom) {
    let args_len = arguments.length;

    let layout_params = view.getLayoutParams(),
        ori_left_margin = layout_params.leftMargin,
        ori_top_margin = layout_params.topMargin,
        ori_right_margin = layout_params.rightMargin,
        ori_bottom_margin = layout_params.bottomMargin,
        ori_width = layout_params.width,
        ori_height = layout_params.height;

    let new_layout = new ViewGroup.MarginLayoutParams(layout_params);

    if (args_len === 3) {
        new_layout.setMargins(ori_left_margin, ori_top_margin, ori_right_margin, ori_bottom_margin);

        let reValue = (value, ori) => {
            if (value === "*") return ViewGroup.LayoutParams.MATCH_PARENT;
            if (value === "auto") return ViewGroup.LayoutParams.WRAP_CONTENT;
            if (value === "-") return ori;
            return value;
        };

        left = reValue(left, ori_width);
        top = reValue(top, ori_height);

        let new_layout_params = new LinearLayout.LayoutParams(new_layout);
        new_layout_params.width = left;
        new_layout_params.height = top;

        view.setLayoutParams(new_layout_params);
    } else if (args_len === 5) {
        let left_margin = typeof left === "undefined" ? ori_left_margin : left,
            top_margin = typeof top === "undefined" ? ori_top_margin : top,
            right_margin = typeof right === "undefined" ? ori_right_margin : right,
            bottom_margin = typeof bottom === "undefined" ? ori_bottom_margin : bottom;

        new_layout.setMargins(left_margin, top_margin, right_margin, bottom_margin);

        let new_layout_params = new LinearLayout.LayoutParams(new_layout);

        view.setLayoutParams(new_layout_params);
    }
}

function saveSession(key, value) {
    if (key !== undefined) session_config[key] = value;
    let changed_state = !obj_equal(session_config, storage_config);
    let last_changed_state = defs["last_changed_state"];

    if (changed_state === last_changed_state) return;

    if (changed_state) {
        log("save on");
        reDrawSaveBtn("ON");
        defs["last_changed_state"] = true;
    } else {
        log("save off");
        reDrawSaveBtn("OFF");
        defs["last_changed_state"] = false;
    }
}

function reDrawSaveBtn(switch_state) {
    let parent = homepage.icon_save_img.getParent();
    parent.removeAllViews();
    parent.addView(getLayoutSaveBtn(switch_state));
}

function getLayoutSaveBtn(switch_state) {
    function layoutSaveBtn(icon_tint_color, save_text_color) {
        assignment.session_params.tint_c = icon_tint_color;
        assignment.session_params.text_c = save_text_color;
        return ui.inflate(
            <vertical margin="13 0">
                <img id="icon_save_img" src="@drawable/ic_save_black_48dp" width="31" bg="?selectableItemBackgroundBorderless" tint="{{assignment.session_params.tint_c}}"/>
                <text id="icon_save_text" text="SAVE" gravity="center" textSize="10" textColor="{{assignment.session_params.text_c}}" textStyle="bold" marginTop="-35" h="40" gravity="bottom|center"/>
            </vertical>
        );
    }
    let on_view = layoutSaveBtn(defs.save_btn_on_color, "#ffffff");
    let off_view = layoutSaveBtn(defs.save_btn_off_color, "#bbcccc");

    let view = switch_state === "ON" ? on_view : off_view;

    view.icon_save_text.on("click", () => {
        if (obj_equal(session_config, storage_config)) return toast("不用保存");
        storage.put("config", session_config);
        storage_config = session_config;
        session_config = {};
        reDrawSaveBtn("OFF");
        defs["last_changed_state"] = false;
        toast("已保存");
    });

    return view;
}