// visibility="{{config['is_cycle'] ? 'visible' : 'gone'}}"
// <horizontal w="*" h="1sp" bg="#cccccc" margin="10 0"></horizontal> // 分割线
// 删除日志保留功能 在自己的本地配置里保存一个路径 如果有这个路径 就设置 默认关闭
// 恢复默认设置


"ui";

let WIDTH = device.width;
let HEIGHT = device.height;
let w = ~~(WIDTH * 0.78) + "px"; // item text width

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

ui.layout(
    <vertical id="main">
        <linear bg="#03a6ef" w="*">
            <text id="title" text="Ant_Forest" textColor="#ffffff" textSize="19" textStyle="bold" margin="16 16 186 16"/>

            <vertical margin="13 0 13">
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
                    <horizontal w="*" padding="6" margin="0 5">
                        <vertical>
                            <text text="帮收功能检测密度" textColor="#111111" textSize="16"/>
                            <text text="16" textColor="#888888" textSize="13sp"/>
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
let views = {
    test_view: ui.inflate(<vertical><linear bg="#03a6ef">
            <text id="title" text="Ant_Forest" textColor="#ffffff" textSize="19" textStyle="bold" margin="16"/>
        </linear>
        </vertical>
    ),
};
let sub_view = views["test_view"];

ui.menu_help_switch.on("click", () => {

    parent.addView(sub_view);
    sub_view.addView(ui.inflate(<ScrollView>
        <vertical>
            <text text="123" />
        </vertical>
    </ScrollView>))

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
            parent.removeView(sub_view);
        }
        clearInterval(scroll_interval);
    }, duration + 200); // 200: a safe interval just in case
}