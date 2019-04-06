"ui";

let DEFAULT = {
    help_collect_switch: true,
    non_break_check_time_area: [],
    help_collect_intensity: 16,
};

let WIDTH = device.width;
let HEIGHT = device.height;
let storage = storage = require("./Modules/MODULE_STORAGE").create("af_cfg");
let storage_config = storage.get("config", {});
if (!obj_equal(storage_config, DEFAULT)) {
    storage_config = Object.assign({}, DEFAULT, storage_config);
    storage.put("config", storage_config);
} // to fill storage data
let session_config = Object.assign({}, storage_config);
let saveSession = () => null;
let needSave = () => !obj_equal(session_config, storage_config);
let dynamic_views = [];
let updateAllValues = () => dynamic_views.forEach(view => view.updateOpr(view));
let session_params = {
    //~ no need to set values here
    //~ as all params will be set/modified automatically
    "save_btn_tint_color": null,
    "save_btn_text_color": null,
};
let def = undefined;
let defs = {
    "item_area_width": ~~(WIDTH * 0.78) + "px",
    "sub_head_color": "#03a6ef",
    "title_bg_color": "#03a6ef",
    "save_btn_on_color": "#ffffff",
    "save_btn_off_color": "#bbcccc",
};
let pages = [];


function LayoutSubHead(title, params) {
    params = params || {};
    this.title = title;
    this.sub_head_color = params.sub_head_color;
    if (params.updateOpr) {
        Object.defineProperties(this, {
            updateOpr: {
                get: () => view => params.updateOpr(view),
            },
        });
    }
}

function LayoutSwitch(title, params) {
    this.title = title;
    this.config_conj = params.config_conj;
    this.hint = params.hint;
    Object.defineProperties(this, {
        listener: {
            get: function () {
                return params.listeners;
            },
        },
    });
    if (params.updateOpr) {
        Object.defineProperties(this, {
            updateOpr: {
                get: () => view => params.updateOpr(view),
            },
        });
    }
}

function LayoutOptionMenu(title, params) {
    this.title = title;
    this.config_conj = params.config_conj;
    this.hint = params.hint;
    this.next_page = params.next_page;
    if (params.updateOpr) {
        Object.defineProperties(this, {
            updateOpr: {
                get: () => view => params.updateOpr(view),
            },
        });
    }
}

function LayoutButton(title, params) {
    this.title = title;
    this.hint = params.hint;
    this.new_window = params.new_window;
    if (params.updateOpr) {
        Object.defineProperties(this, {
            updateOpr: {
                get: () => view => params.updateOpr(view),
            },
        });
    }
}

initUI();

let homepage = setHomePage("Ant_Forest");
let help_collect_page = setPage("帮收功能");
let non_break_check_page = setPage("监测自己能量");

homepage.add("sub_head", new LayoutSubHead("基本功能"));
homepage.add("options", new LayoutOptionMenu("帮收功能", {
    "config_conj": "help_collect_switch",
    "hint": {
        "0": "已关闭",
        "1": "已开启",
    },
    "next_page": help_collect_page,
    "updateOpr": function (view) {
        view._hint.text(this.hint[+!!session_config[this.config_conj]]);
    },
}));
homepage.add("options", new LayoutOptionMenu("监测自己能量", {
    "config_conj": "non_break_check_time_area",
    "hint": {
        "0": "已关闭",
        "1": "已开启",
    },
    "next_page": non_break_check_page,
    "updateOpr": function (view) {
        let value = session_config[this.config_conj];
        let on_off = +!!(typeof value === "object" ? value.length : value);
        view._hint.text(this.hint[on_off]);
    },
}));
homepage.add("sub_head", new LayoutSubHead("重置"));
homepage.add("button", new LayoutButton("还原设置", {
    hint: "还原部分或全部设置",
    new_window: () => {
        let diag = dialogs.build({
            // content: "可选择还原任何修改过的设置\n也可以一键还原全部设置\n\n注意: 此操作无法撤销",
            // neutral: "放弃",
            // negative: "选择还原",
            // positive: "全部还原",
            title: "还原设置",
            content: "此操作无法撤销",
            negative: "放弃",
            positive: "还原",
            canceledOnTouchOutside: false,
            autoDismiss: false,
        });
        //diag.on("neutral", () => diag.cancel());
        diag.on("negative", () => diag.cancel());
        diag.on("positive", () => {
            let diag_sub = dialogs.build({
                title: "全部还原",
                content: "确定要还原全部设置吗",
                negative: "放弃",
                positive: "确定",
                autoDismiss: false,
                canceledOnTouchOutside: false,
            });
            diag_sub.on("positive", () => {
                // reset();
                updateAllValues();
                let diag_sub_sub = dialogs.build({
                    title: "还原完毕",
                    positive: "确定",
                });
                diag_sub_sub.on("positive", () => {
                    diag_sub_sub.cancel();
                    diag_sub.cancel();
                    diag.cancel();
                });
                diag_sub_sub.show();
            });
            diag_sub.on("negative", () => diag_sub.cancel());
            diag_sub.show();
        });
        diag.show();
    },
}));
help_collect_page.add("switch", new LayoutSwitch("总开关", {
    config_conj: "help_collect_switch",
    listeners: {
        "switch": {
            "check": function (state) {
                //ui["_hint"].setText(this.hint[+state]);
                saveSession(this.config_conj, !!state);
            },
        },
    },
}));
//add(setItem("item", "检测密度", "16"));
//add(setItem("item", "颜色色值", "#f99137")); // 在文字后面跟一个颜色指示方块
//add(setItem("item", "颜色检测阈值", "60"));
help_collect_page.add("button", new LayoutButton("检测密度", {
    config_conj: "help_collect_intensity",
    hint: "hint",
    new_window: () => {
        let diag = dialogs.build({
            title: "帮收功能检测密度",
            content: "推荐值: 10 <= x <= 20",
            neutral: "恢复默认值",
            negative: "返回",
            positive: "修改",

        });
        //diag.show();
    },
    updateOpr: function (view) {
        view._hint.text(session_config[this.config_conj].toString());
    },
}));
non_break_check_page.add("switch", new LayoutSwitch("总开关", {
    config_conj: "non_break_check_time_area",
    listeners: {
        "switch": {
            "check": function (state) {
                saveSession(this.config_conj, !!state);
            },
        },
    },
    updateOpr: function (view) {
        let value = session_config[this.config_conj];
        let on_off = !!(typeof value === "object" ? value.length : value);
        view.switch.setChecked(on_off);
    },
}));

ui.emitter.on("back_pressed", e => {
    let len = pages.length,
        need_save = needSave();
    if (len === 1 && !need_save) return; // "back" function
    e.consumed = true; // make default "back" dysfunctional
    len === 1 && need_save ? showDialog() : pageJump("back");

    // tool function(s) //

    function showDialog() {
        let diag = dialogs.build({
            "title": "设置未保存",
            "content": "确定要退出吗",
            //"items": ["1. 查看本次更改的设置", "2. 撤销本次更改的设置", "3. 还原部分或全部设置"],
            "neutral": "返回",
            "negative": "强制退出",
            "positive": "保存并退出",
            "autoDismiss": false,
            "canceledOnTouchOutside": false,
        });
        diag.on("neutral", () => diag.cancel());
        diag.on("negative", () => ui.finish());
        diag.on("positive", () => {
            storage.put("config", session_config);
            ui.finish();
        });

        // let ori_content = diag.getContentView().getText().toString();
        // diag.setContent(ori_content + "\n\n您还可以:");

        diag.show();
    }
});

updateAllValues();

// tool function(s) //

function initUI(status_bar_color) {
    ui.layout(
        <vertical id="main">
            <text/>
        </vertical>
    );
    ui.statusBarColor(status_bar_color || "#03a6ef");
}

function setHomePage(home_title) {
    let homepage = setPage(home_title, def, setSaveBtn);
    saveSession = _saveSession;
    ui.main.getParent().addView(homepage);
    pages[0] = homepage;
    return homepage;

    // tool function(s) //

    function setSaveBtn(new_view) {
        let save_btn = getLayoutSaveBtn("OFF");
        new_view._title_text.setWidth(~~(552 * WIDTH / 720));
        new_view._title_bg.addView(save_btn);
    }

    function _saveSession(key, value) {
        if (key !== undefined) session_config[key] = value;
        let need_save_flag = needSave();
        reDrawSaveBtn(need_save_flag ? "ON" : "OFF");
        updateAllValues();
    }

    function reDrawSaveBtn(switch_state) {
        let parent = homepage.icon_save_img.getParent();
        parent.removeAllViews();
        parent.addView(getLayoutSaveBtn(switch_state));
    }

    function getLayoutSaveBtn(switch_state) {
        let view,
            on_view = saveBtnView(defs.save_btn_on_color, "#ffffff"),
            off_view = saveBtnView(defs.save_btn_off_color, "#bbcccc");

        view = switch_state === "ON" ? on_view : off_view;

        view.icon_save_text.on("click", () => {
            if (!needSave()) return toast("不用保存"); ////TEST////
            storage.put("config", session_config);
            storage_config = Object.assign({}, session_config);
            reDrawSaveBtn("OFF");
            toast("已保存");
        });

        return view;

        // tool function(s) //

        function saveBtnView(icon_tint_color, save_text_color) {
            session_params.save_btn_tint_color = icon_tint_color;
            session_params.save_btn_text_color = save_text_color;
            return ui.inflate(
                <vertical margin="13 0">
                    <img id="icon_save_img" src="@drawable/ic_save_black_48dp" width="31" bg="?selectableItemBackgroundBorderless" tint="{{session_params.save_btn_tint_color}}"/>
                    <text id="icon_save_text" text="SAVE" gravity="center" textSize="10" textColor="{{session_params.save_btn_text_color}}" textStyle="bold" marginTop="-35" h="40" gravity="bottom|center"/>
                </vertical>
            );
        }
    }
}

function setPage(title, title_bg_color, additions) {
    title_bg_color = title_bg_color || defs["title_bg_color"];
    let new_view = ui.inflate(<vertical></vertical>);
    new_view.addView(ui.inflate(
        <linear id="_title_bg">
            <vertical id="back_btn_area" margin="8 6 -10 -10" visibility="gone">
                <img src="@drawable/ic_chevron_left_black_48dp" width="31" bg="?selectableItemBackgroundBorderless" tint="#ffffff"/>
                <text id="back_btn_text" text=" " gravity="center" textSize="10" textStyle="bold" marginTop="-45" h="45" gravity="bottom|center"/>
            </vertical>
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

    new_view.add = (type, item_params) => {
        let sub_view = setItem(type, item_params);
        new_view.scroll_view.addView(sub_view);
        if (sub_view.updateOpr) dynamic_views.push(sub_view);
    };
    return new_view;

    // tool function(s) //

    function setItem(type, item_params) {

        if (type === "sub_head") return setSubHead(item_params);

        let new_view = ui.inflate(
            <horizontal id="_item_area" padding="16 8" gravity="left|center">
                <vertical id="_content" w="{{defs.item_area_width}}" h="40" gravity="left|center">
                    <text id="_title" textColor="#111111" textSize="16"/>
                </vertical>
            </horizontal>);

        let title = item_params["title"];
        new_view._title.text(title);

        let hint = item_params["hint"];
        if (hint) {
            let hint_view = ui.inflate(<text id="_hint" textColor="#888888" textSize="13sp"/>);
            typeof hint === "string" && hint_view._hint.text(hint);
            new_view._content.addView(hint_view);
        }

        if (type === "switch") {
            let sw_view = ui.inflate(<Switch id="switch"/>);
            new_view._item_area.addView(sw_view);
            item_params.view = new_view;
            sw_view["switch"].setChecked(!!session_config[item_params.config_conj]);

            let listener_ids = item_params["listener"];
            Object.keys(listener_ids).forEach(id => {
                let listeners = listener_ids[id];
                Object.keys(listeners).forEach(listener => {
                    new_view[id].on(listener, listeners[listener].bind(item_params));
                });
            });
        } else if (type === "options") {
            let opt_view = ui.inflate(
                <vertical>
                    <img margin="19 0" src="@drawable/ic_chevron_right_black_48dp" width="31" bg="?selectableItemBackgroundBorderless" tint="#999999"/>
                </vertical>
            );
            new_view._item_area.addView(opt_view);
            item_params.view = new_view;
            new_view._item_area.on("click", () => pageJump("next", item_params.next_page));
        } else if (type === "button") {
            new_view._item_area.on("click", () => item_params.new_window());
        }

        if (item_params.updateOpr) new_view.updateOpr = item_params.updateOpr.bind(new_view);

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
}

function pageJump(direction, next_page) {
    if (direction.match(/back|previous|last/)) {
        smoothScrollMenu("full_right");
        return pages.pop();
    }
    pages.push(next_page);
    smoothScrollMenu("full_left");
}

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

function smoothScrollMenu(shifting, duration) {

    if (pages.length < 2) return;

    let len = pages.length;

    let main_view = pages[len - 2],
        sub_view = pages[len - 1];

    let parent = ui.main.getParent();

    duration = duration || 180;

    if (shifting === "full_left") {
        shifting = [WIDTH, 0];
        parent.addView(sub_view);
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
            parent.removeView(parent.getChildAt(--child_count));
        }
        clearInterval(scroll_interval);
    }, duration + 200); // 200: a safe interval just in case
}