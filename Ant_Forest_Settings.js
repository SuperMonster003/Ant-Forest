"ui";

let {
    sess_cfg, sto_cfg, sess_par,
    $sto, $defs, $view, $save, $tool,
    threads, android, files, dialogs, toast, events,
    engines, activity, java, ui, exit, auto, timers,
} = global;

sess_cfg = sto_cfg = sess_par = {};
$sto = $defs = $view = $save = $tool = {};

// codes here should be updated manually when appending
// or removing views, and so should $defs
let $cfg = {
    pages_tree: {
        self_collect_page: {
            homepage_monitor_page: null,
            homepage_background_monitor_page: null,
        },
        friend_collect_page: {
            rank_list_samples_collect_page: {
                rank_list_review_page: null
            },
        },
        help_collect_page: {
            six_balls_review_page: null,
            rank_list_samples_collect_page: null,
        },
        auto_unlock_page: null,
        message_showing_page: null,
        timers_page: {
            homepage_monitor_page: null,
            rank_list_review_page: null,
            timers_self_manage_page: {
                timers_uninterrupted_check_sections_page: null,
            },
            timers_control_panel_page: null,
        },
        account_page: {
            account_log_back_in_page: null,
        },
        blacklist_page: {
            cover_blacklist_page: null,
            collect_blacklist_page: null,
            foreground_app_blacklist_page: null,
        },
        script_security_page: {
            kill_when_done_page: null,
            phone_call_state_monitor_page: null,
        },
        local_project_backup_restore_page: {
            restore_projects_from_local_page: null,
            restore_projects_from_server_page: null,
        },
    },
    list_heads: {
        project_backup_info: [
            {version_name: "项目版本", width: 0.5},
            {
                timestamp: "项目备份时间", sort: -1, stringTransform: {
                    forward: data => $tool.getTimeStrFromTimestamp(data, "time_str"),
                    backward: t => $tool.restoreFromTimestamp(t),
                }
            },
        ],
        server_releases_info: [
            {tag_name: "项目标签", width: 0.5},
            {created_at: "创建时间 (UTC时间)", sort: -1},
        ],
        blacklist_by_user: [
            {name: "支付宝好友昵称", width: 0.58},
            {
                timestamp: "黑名单自动解除", sort: 1, stringTransform: {
                    forward: data => $tool.getTimeStrFromTimestamp(data, "time_str_remove"),
                    backward: t => $tool.restoreFromTimestamp(t),
                }
            },
        ],
        blacklist_protect_cover: [
            {name: "支付宝好友昵称", width: 0.58},
            {
                timestamp: "黑名单自动解除", sort: 1, stringTransform: {
                    forward: data => $tool.getTimeStrFromTimestamp(data, "time_str_remove"),
                    backward: t => $tool.restoreFromTimestamp(t),
                }
            },
        ],
        foreground_app_blacklist: [
            {app_combined_name: "应用名称 (含包名)", width: 0.85, sort: 1},
            {
                available: "有效", gravity: "center", stringTransform: {
                    forward: function () {
                        let {app_combined_name} = this;
                        let pkg_name = app_combined_name.split("\n")[1];
                        return app.getAppName(pkg_name) ? "\u2713" : "\u2717";
                    },
                    backward: "__keep__",
                }
            }
        ],
        timers_uninterrupted_check_sections: [
            {
                section: "时间区间", width: 0.58, sort: 1, stringTransform: {
                    forward: arr => $tool.timeSectionToStr(arr),
                    backward: str => $tool.timeStrToSection(str),
                }
            },
            {interval: "间隔 (分)"},
        ],
        timed_tasks: [
            {
                type: "任务类型", width: 0.47, stringTransform: {
                    // []: daily; number[]: weekly; 0: disposable
                    forward: arr => $tool.getTimedTaskTypeStr(arr),
                    backward: str => $tool.restoreFromTimedTaskTypeStr(str),
                },
            },
            {
                next_run_time: "下次运行", sort: 1, stringTransform: {
                    forward: data => $tool.getTimeStrFromTimestamp(data, "time_str_full"),
                    backward: t => $tool.restoreFromTimestamp(t),
                },
            }
        ],
    },
};

let $init = {
    check: function () {
        checkModulesMap([
            "MODULE_DEFAULT_CONFIG",
            "MODULE_TREASURY_VAULT", "MODULE_PWMAP",
            "MODULE_MONSTER_FUNC", "MODULE_STORAGE",
            "EXT_DIALOGS", "EXT_TIMERS",
        ]);
        require("./Modules/MODULE_MONSTER_FUNC").checkSdkAndAJVer();

        return $init;

        // tool function(s) //

        function checkModulesMap(modules_map) {
            let wanted = [];
            for (let i = 0, len = modules_map.length; i < len; i += 1) {
                let module = modules_map[i];
                let path = "./Modules/" + module + ".js";
                let file_exists = files.exists(path.replace(/(\.js){2,}/, ".js"));
                if (!file_exists) wanted.push(module);
            }
            let wanted_len = wanted.length;
            if (wanted_len) {
                showSplitLineRaw();
                messageActionRaw("脚本无法继续", 4);
                messageActionRaw("以下模块缺失或路径错误\n", 4);
                for (let i = 0; i < wanted_len; i += 1) {
                    messageActionRaw("-> \"./Modules/" + wanted[i] + ".js\"" + (i === wanted_len - 1 ? "\n" : ""), 4);
                }
                messageActionRaw("请检查或重新放置模块", 4);
                showSplitLineRaw();
                exit();
            }

            // raw function(s) //

            function messageActionRaw(msg, msg_level, toast_flag) {
                let _msg = msg || " ";
                if (msg_level && msg_level.toString().match(/^t(itle)?$/)) {
                    return messageActionRaw("[ " + msg + " ]", 1, toast_flag);
                }
                let _msg_level = typeof +msg_level === "number" ? +msg_level : -1;
                toast_flag && toast(_msg);
                if (_msg_level === 0) return console.verbose(_msg) || true;
                if (_msg_level === 1) return console.log(_msg) || true;
                if (_msg_level === 2) return console.info(_msg) || true;
                if (_msg_level === 3) return console.warn(_msg) || false;
                if (_msg_level >= 4) {
                    console.error(_msg);
                    _msg_level >= 8 && exit();
                }
            }

            function showSplitLineRaw(extra_str, style) {
                let _extra_str = extra_str || "";
                let _split_line = "";
                if (style === "dash") {
                    for (let i = 0; i < 16; i += 1) _split_line += "- ";
                    _split_line += "-";
                } else {
                    for (let i = 0; i < 32; i += 1) _split_line += "-";
                }
                return ~console.log(_split_line + _extra_str);
            }
        }
    },
    global: function () {
        // script will not go on without a normal state of accessibility service
        // auto.waitFor() was abandoned here, as it may cause problems sometimes
        auto();

        // set up the device screen in a portrait orientation
        activity.setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

        // some variables are not necessary to be announced as global ones explicitly
        Object.assign(global, {
            dialogs_pool: [],
            dynamic_views: [],
            sub_page_views: [],
            pages_buffer_obj: {},
            view_pages: {},
            rolling_pages: [],
            getLastRollingPage: function () {
                let _rolling = this.rolling_pages;
                return _rolling[_rolling.length - 1] || {};
            },
            encrypt: new (require("./Modules/MODULE_PWMAP"))().pwmapEncrypt,
        });

        getDisplayParams({global_assign: true});

        require("./Modules/EXT_TIMERS").load();
        require("./Modules/EXT_DIALOGS").load();
        require("./Modules/EXT_THREADS").load();

        let _sto = require("./Modules/MODULE_STORAGE");
        Object.assign($sto, {
            af: _sto.create("af"),
            cfg: _sto.create("af_cfg"),
            unlock: _sto.create("unlock"),
            def: require("./Modules/MODULE_DEFAULT_CONFIG"),
        });

        $defs = Object.assign({}, $sto.def.settings, {
            item_area_width: cX($sto.def.settings.item_area_width) + "px",
            homepage_title: "蚂蚁森林",
            local_backup_path: files.cwd() + "/BAK/Ant_Forest/",
            dialog_contents: require("./Modules/MODULE_TREASURY_VAULT").dialog_contents || {},
        });

        $view = {
            initUI: function (status_bar_color) {
                ui.layout(
                    <vertical id="main">
                        <frame/>
                    </vertical>
                );
                ui.statusBarColor(status_bar_color || "#03a6ef");
            },
            addPage: (title, addFunc) => global.pages_buffer_obj[title[1]] = () => addFunc(title),
            pageJump: function (direction, next_page_name) {
                if (global["_$_page_scrolling"]) return;

                let _rolling = global.rolling_pages;
                if (next_page_name === getLastRollingPage().page_label_name) return;

                if (direction.match(/back|previous|last/)) {
                    smoothScrollView("full_right", null, _rolling);
                    _rolling.pop();
                } else {
                    _rolling.push(global.view_pages[next_page_name]);
                    smoothScrollView("full_left", null, _rolling);
                }
            },
            setHomePage: function (home_title, bg_color) {
                let _homepage = $view.setPage(home_title, (parent_view) => {
                    return $view.setButtons(parent_view, "homepage",
                        ["save", "SAVE", "OFF", (btn_view) => {
                            if ($save.check()) {
                                $save.config();
                                btn_view.switch_off();
                                toast("已保存");
                            }
                        }]
                    );
                }, {title_bg_color: bg_color});

                _homepage.ready = function () {
                    ui.main.getParent().addView(_homepage);
                    _homepage._back_btn_area.setVisibility(8);
                    global.rolling_pages[0] = _homepage; //// PENDING ////
                };

                return _homepage;
            },
            setPage: function (title, addition_func, options) {
                let {no_scroll_view, check_page_state, title_bg_color} = options || {};
                let [_title_name, _label_name] = classof(title, "Array") ? title : [title, ""];

                let page_view = ui.inflate(<vertical/>);

                page_view.addView(setTitleBarView());
                page_view.addView(setContentView());
                Object.assign(page_view, setAdditions());

                return page_view;

                // tool function(s) //

                function setTitleBarView() {
                    let _title_bar_view = ui.inflate(
                        <linear id="_title_bg" clickable="true">
                            <vertical id="_back_btn_area" marginRight="-22" layout_gravity="center">
                                <img src="@drawable/ic_chevron_left_black_48dp"
                                     bg="?selectableItemBackgroundBorderless"
                                     h="31" tint="#ffffff" layout_gravity="center"
                                />
                            </vertical>
                            <text id="_title_text" textColor="#ffffff" textSize="19" margin="16"/>
                            <linear id="_title_btn" gravity="right" w="*" marginRight="5"/>
                        </linear>
                    );

                    _title_bar_view._back_btn_area.on("click", () => $view.checkPageState() && $view.pageJump("back"));
                    _title_bar_view._title_text.setText(_title_name);
                    _title_bar_view._title_text.getPaint().setFakeBoldText(true);
                    _title_bar_view._title_bg.setBackgroundColor((() => {
                        let _color = title_bg_color || $defs.title_bg_color;
                        if (typeof _color === "string") _color = colors.parseColor(_color);
                        return _color;
                    })());

                    if (addition_func) typeof addition_func === "function"
                        ? addition_func(_title_bar_view)
                        : addition_func.forEach(f => f(_title_bar_view));

                    return page_view.title_bar_view = _title_bar_view;
                }

                function setContentView() {
                    let _content_view_frame = ui.inflate(no_scroll_view ? <vertical/> : <ScrollView/>);
                    let _content_view = ui.inflate(
                        <vertical>
                            <frame id="_page_content_margin_top" h="8"/>
                        </vertical>
                    );
                    page_view.hideContentMarginTop = () => {
                        _content_view._page_content_margin_top.setVisibility(8);
                    };
                    _content_view_frame.addView(page_view.content_view = _content_view);
                    return _content_view_frame;
                }

                function setAdditions() {
                    return {
                        add: addItemViewToPage,
                        ready: ready,
                        page_title_name: _title_name,
                        page_label_name: checkPageLabel(),
                        checkPageState: checkPageState,
                    };

                    function addItemViewToPage(view_type, view_options) {
                        if (view_type === "list") page_view.hideContentMarginTop();

                        let item_view = view_type.match(/^split_line/) && setSplitLine(view_options) ||
                            view_type === "subhead" && setSubHead(view_options) ||
                            view_type === "info" && setInfo(view_options) ||
                            view_type === "list" && setList(view_options) ||
                            view_type === "seekbar" && setSeekbar(view_options) ||
                            ui.inflate(
                                <horizontal id="_item_area" padding="16 8" gravity="left|center">
                                    <vertical id="_content" w="{{$defs.item_area_width}}" h="40" gravity="left|center">
                                        <text id="_title" textColor="#111111" textSize="16"/>
                                    </vertical>
                                </horizontal>
                            );

                        if (!view_options) {
                            page_view.content_view.addView(item_view);
                            return page_view;
                        }

                        let hint = view_options.hint;
                        if (hint) {
                            let hint_view = ui.inflate(
                                <horizontal>
                                    <text id="_hint" textColor="#888888" textSize="13sp"/>
                                    <text id="_hint_color_indicator" visibility="gone" textColor="#888888" textSize="13sp"/>
                                </horizontal>);
                            typeof hint === "string" && hint_view._hint.text(hint);
                            item_view._content.addView(hint_view);
                        }

                        if (view_options.view_tag) item_view.setTag(view_options.view_tag);

                        if (view_type === "radio") {
                            item_view._item_area.removeAllViews();
                            let radiogroup_view = ui.inflate(
                                <radiogroup id="_radiogroup" orientation="horizontal" padding="-6 0 0 0"/>
                            );
                            view_options.view = item_view;
                            let title = view_options.title;

                            title.forEach(val => {
                                let radio_view = ui.inflate(<radio padding="0 0 12 0"/>);
                                radio_view.setText(val);
                                Object.keys(view_options.listeners).forEach(listener => {
                                    radio_view.on(listener, view_options.listeners[listener].bind(view_options));
                                });
                                radiogroup_view._radiogroup.addView(radio_view);
                            });
                            item_view.addView(radiogroup_view);
                        }

                        let title = view_options.title;
                        if (typeof title === "string" && item_view._title) item_view._title.text(title);

                        if (view_type.match(/.*switch$/)) {
                            let sw_view;
                            if (view_type === "switch") {
                                sw_view = ui.inflate(<Switch id="_switch" checked="true"/>);
                                if (view_options.default_state === false) sw_view._switch.setChecked(false);
                            }
                            if (view_type === "checkbox_switch") {
                                sw_view = ui.inflate(
                                    <vertical padding="8 0 0 0">
                                        <checkbox id="_checkbox_switch" checked="true"/>
                                    </vertical>
                                );
                                if (view_options.default_state === false) sw_view._checkbox_switch.setChecked(false);
                            }
                            item_view._item_area.addView(sw_view);
                            view_options.view = item_view;

                            let listener_ids = view_options.listeners;
                            Object.keys(listener_ids).forEach(id => {
                                let listeners = listener_ids[id];
                                Object.keys(listeners).forEach((listener) => {
                                    let callback = listeners[listener].bind(view_options);
                                    if (id === "ui") ui.emitter.prependListener(listener, callback);
                                    else item_view[id].on(listener, callback);
                                });
                            });
                        } else if (view_type.match(/^page/)) {
                            let page_view = ui.inflate(
                                <vertical id="_chevron_btn">
                                    <img src="@drawable/ic_chevron_right_black_48dp"
                                         bg="?selectableItemBackgroundBorderless"
                                         tint="#999999" h="31" paddingLeft="10"
                                    />
                                </vertical>
                            );
                            item_view._item_area.addView(page_view);
                            view_options.view = item_view;
                            item_view.setClickListener = (listener) => {
                                if (!listener) listener = () => null;
                                item_view._item_area.removeAllListeners("click");
                                item_view._item_area.on("click", listener);
                            };
                            item_view.restoreClickListener = () => item_view.setClickListener(() => {
                                let next_page = view_options.next_page;
                                if (next_page && global.view_pages[next_page]) $view.pageJump("next", next_page);
                            });
                            item_view.setClickListener();
                            item_view._chevron_btn.setVisibility(8);
                            let sub_page_ready_interval = setInterval(function () {
                                if (sess_par["ready_signal_" + view_options.next_page]) {
                                    ui.post(() => {
                                        item_view.restoreClickListener();
                                        item_view._chevron_btn.setVisibility(0);
                                    });
                                    clearInterval(sub_page_ready_interval);
                                }
                            }, 100);
                        } else if (view_type === "button") {
                            let help_view = ui.inflate(
                                <vertical id="_info_icon" visibility="gone">
                                    <img src="@drawable/ic_info_outline_black_48dp" h="22" bg="?selectableItemBackgroundBorderless" tint="#888888"/>
                                </vertical>
                            );
                            item_view._item_area.addView(help_view);
                            view_options.view = item_view;
                            item_view._item_area.on("click", () => view_options.newWindow());
                            if (view_options.infoWindow) {
                                item_view._info_icon.setVisibility(0);
                                item_view._info_icon.on("click", () => view_options.infoWindow());
                            }
                        }

                        item_view.setNextPage = (page) => view_options.next_page = page;
                        item_view.getNextPage = () => view_options.next_page;

                        page_view.content_view.addView(item_view);

                        Object.keys(view_options).forEach((key) => {
                            if (key.match(/listeners/)) return;
                            let item_data = view_options[key];
                            if (typeof item_data !== "function") {
                                return item_view[key] = item_data;
                            }
                            if (key === "updateOpr") {
                                global.dynamic_views.push(item_view);
                                return (item_view.updateOpr = () => item_data.bind(view_options)(item_view))();
                            }
                            item_view[key] = item_data.bind(item_view);
                        });

                        return page_view;

                        // tool function(s) //

                        function setSplitLine(options) {
                            let line_color = options && options.split_line_color || $defs.split_line_color;

                            let new_view = ui.inflate(
                                <vertical>
                                    <horizontal id="_line" w="*" h="1sp" margin="16 8">
                                    </horizontal>
                                </vertical>
                            );
                            new_view.setTag(view_type);
                            line_color = typeof line_color === "string" ? colors.parseColor(line_color) : line_color;
                            new_view._line.setBackgroundColor(line_color);
                            new_view._line.setVisibility(view_type.match(/invisible/) ? 8 : 0);

                            return new_view;
                        }

                        function setSubHead(options) {
                            let title = options.title;
                            let subhead_color = options.subhead_color || $defs.subhead_color;

                            let new_view = ui.inflate(
                                <vertical>
                                    <text id="_text" textSize="14" margin="16 8"/>
                                </vertical>
                            );
                            new_view._text.text(title);
                            let title_color = typeof subhead_color === "string" ? colors.parseColor(subhead_color) : subhead_color;
                            new_view._text.setTextColor(title_color);

                            return new_view;
                        }

                        function setInfo(options) {
                            let title = options.title;
                            let subhead_color = options.subhead_color || $defs.subhead_color;
                            let info_color = options.info_color || $defs.info_color;
                            sess_par.info_color = info_color;

                            let new_view = ui.inflate(
                                <horizontal>
                                    <linear padding="15 10 0 0">
                                        <img src="@drawable/ic_info_outline_black_48dp" h="17" w="17" margin="0 1 4 0" tint="{{sess_par.info_color}}"/>
                                        <text id="_info_text" textSize="13"/>
                                    </linear>
                                </horizontal>
                            );
                            new_view._info_text.text(title);
                            let title_color = typeof info_color === "string" ? colors.parseColor(info_color) : subhead_color;
                            new_view._info_text.setTextColor(title_color);

                            return new_view;
                        }

                        function setList(options) {
                            let list_title_bg_color = options.list_title_bg_color || $defs.list_title_bg_color;
                            let list_head = options.list_head || [];
                            if (typeof list_head === "string") list_head = $cfg.list_heads[list_head];
                            list_head.forEach((o, idx) => {
                                let w = o.width;
                                if (!idx && !w) return sess_par.list_width_0 = cX(0.3) + "px";
                                sess_par["list_width_" + idx] = w ? cX(w) + "px" : -2;
                            });
                            sess_par.list_checkbox = options.list_checkbox;
                            let data_source_key_name = options.data_source_key_name || "unknown_key_name"; // just a key name
                            let getListItemName = num => list_head[num] && Object.keys(list_head[num])[0] || null;

                            // items are expected not more than 4
                            for (let i = 0; i < 4; i += 1) sess_par["list_item_name_" + i] = getListItemName(i);

                            let list_view = ui.inflate(
                                <vertical>
                                    <horizontal id="_list_title_bg">
                                        <horizontal h="50" w="{{sess_par['list_width_0']}}" margin="8 0 0 0">
                                            <checkbox id="_check_all" layout_gravity="left|center" clickable="false"/>
                                        </horizontal>
                                    </horizontal>
                                    <vertical>
                                        <list id="_list_data" fastScrollEnabled="true" focusable="true" scrollbars="none">
                                            <horizontal>
                                                <horizontal w="{{this.width_0}}">
                                                    <checkbox id="_checkbox" layout_gravity="left|center"
                                                              checked="{{this.checked}}" clickable="false"
                                                              h="50" margin="8 0 -16"
                                                    />
                                                    <text text="{{this.list_item_name_0}}" textSize="15"
                                                          h="50" margin="16 0 0" w="*"
                                                          gravity="left|center"
                                                    />
                                                </horizontal>
                                                <horizontal w="{{sess_par['list_width_1'] || 1}}" margin="8 0 0 0">
                                                    <text text="{{this.list_item_name_1}}"
                                                          visibility="{{sess_par['list_item_name_1'] ? 'visible' : 'gone'}}"
                                                          textSize="15" h="50"
                                                          gravity="left|center"
                                                    />
                                                </horizontal>
                                                <horizontal w="{{sess_par['list_width_2'] || 1}}">
                                                    <text text="{{this.list_item_name_2}}"
                                                          visibility="{{sess_par['list_item_name_2'] ? 'visible' : 'gone'}}"
                                                          textSize="15" h="50"
                                                          gravity="left|center"
                                                    />
                                                </horizontal>
                                                <horizontal w="{{sess_par['list_width_3'] || 1}}">
                                                    <text text="{{this.list_item_name_3}}"
                                                          visibility="{{sess_par['list_item_name_3'] ? 'visible' : 'gone'}}"
                                                          textSize="15" h="50"
                                                          gravity="left|center"
                                                    />
                                                </horizontal>
                                            </horizontal>
                                        </list>
                                    </vertical>
                                </vertical>
                            );

                            $view.updateDataSource(data_source_key_name, "init", options.custom_data_source);
                            list_view._check_all.setVisibility(android.view.View[options.list_checkbox.toUpperCase()]);
                            list_view._list_data.setDataSource(sess_par[data_source_key_name]);
                            list_view._list_title_bg.attr("bg", list_title_bg_color);
                            list_view.setTag("list_page_view");
                            list_head.forEach((title_obj, idx) => {
                                let data_key_name = Object.keys(title_obj)[0];
                                let list_title_view = idx ? ui.inflate(
                                    <text textSize="15"/>
                                ) : ui.inflate(
                                    <text textSize="15" padding="{{sess_par.list_checkbox === 'gone' ? 8 : 0}} 0 0 0"/>
                                );

                                list_title_view.setText(title_obj[data_key_name]);
                                list_title_view.on("click", () => {
                                    if (!sess_par[data_source_key_name][0]) return;
                                    sess_par["list_sort_flag_" + data_key_name] = sess_par["list_sort_flag_" + data_key_name]
                                        || (sess_par[data_source_key_name][0] < sess_par[data_source_key_name][1] ? 1 : -1);

                                    let session_data = sess_par[data_source_key_name];
                                    session_data = session_data.map((value, idx) => [idx, value]); // to attach indices
                                    session_data.sort((a, b) => {
                                        if (sess_par["list_sort_flag_" + data_key_name] > 0) {
                                            return a[1][a[1][data_key_name]] > b[1][b[1][data_key_name]];
                                        } else return a[1][a[1][data_key_name]] < b[1][b[1][data_key_name]];
                                    });
                                    let indices_table = {};
                                    session_data = session_data.map((value, idx) => {
                                        indices_table[value[0]] = idx;
                                        return value[1];
                                    });
                                    let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                                    sess_par[deleted_items_idx] = sess_par[deleted_items_idx] || {};
                                    let tmp_deleted_items_idx = {};
                                    Object.keys(sess_par[deleted_items_idx]).forEach(ori_idx_key => {
                                        tmp_deleted_items_idx[indices_table[ori_idx_key]] = sess_par[deleted_items_idx][ori_idx_key];
                                    });
                                    sess_par[deleted_items_idx] = deepCloneObject(tmp_deleted_items_idx);
                                    sess_par[data_source_key_name].splice(0);
                                    session_data.forEach(value => sess_par[data_source_key_name].push(value));
                                    sess_par["list_sort_flag_" + data_key_name] *= -1;
                                    // updateDataSource(data_source_key_name, "rewrite");
                                });

                                if (idx === 0) list_view["_check_all"].getParent().addView(list_title_view);
                                else list_view["_list_title_bg"].addView(list_title_view);

                                list_title_view.attr("gravity", "left|center");
                                list_title_view.attr("layout_gravity", "left|center");
                                list_title_view.attr("ellipsize", "end");
                                list_title_view.attr("lines", "1");
                                idx && list_title_view.attr("width", sess_par["list_width_" + idx]);
                            });

                            options.view = list_view;

                            let listener_ids = options.listeners || [];
                            Object.keys(listener_ids).forEach((id) => {
                                let listeners = listener_ids[id];
                                Object.keys(listeners).forEach((listener) => {
                                    let callback = listeners[listener].bind(options);
                                    if (id === "ui") ui.emitter.prependListener(listener, callback);
                                    else list_view[id].on(listener, callback);
                                });
                            });

                            return list_view;
                        }

                        function setSeekbar(options) {
                            let {title, unit, config_conj, nums} = options;
                            let [min, max, init] = nums;
                            if (isNaN(+min)) min = 0;
                            if (isNaN(+init)) {
                                let _init = sess_cfg[config_conj] || $sto.def.af[config_conj];
                                init = isNaN(+_init) ? min : _init;
                            }
                            if (isNaN(+max)) max = 100;

                            let new_view = ui.inflate(
                                <vertical>
                                    <horizontal margin="16 8">
                                        <text id="_text" gravity="left" layout_gravity="center"/>
                                        <seekbar id="_seekbar" w="*" style="@android:style/Widget.Material.SeekBar" layout_gravity="center"/>
                                    </horizontal>
                                </vertical>
                            );
                            new_view._seekbar.setMax(max - min);
                            new_view._seekbar.setProgress(init - min);

                            let update = (source) => new_view._text.setText((title ? title + ": " : "") + source.toString() + (unit ? " " + unit : ""));

                            update(init);
                            new_view._seekbar.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({
                                onProgressChanged: function (v, progress, fromUser) {
                                    let result = progress + min;
                                    update(result);
                                    $save.session(config_conj, result);
                                },
                            }));

                            return new_view;
                        }
                    }

                    function ready() {
                        if (_label_name) {
                            sess_par["ready_signal_" + _label_name] = true;
                        } else {
                            messageAction("页面标签不存在:", 3, 0, 0, "up");
                            messageAction(_title_name, 3, 0, 0, 1);
                        }
                        return page_view;
                    }

                    function checkPageState() {
                        if (typeof check_page_state === "boolean") return check_page_state;
                        if (typeof check_page_state === "function") return check_page_state(page_view);
                        return true;
                    }

                    function checkPageLabel() {
                        if (_label_name) {
                            global.view_pages[_label_name] = page_view;
                            page_view.setTag(_label_name);
                            return _label_name;
                        }
                    }
                }
            },
            setButtons: function (parent_view, data_source_key_name, button_params_arr) {
                let buttons_count = 0;
                for (let i = 2, len = arguments.length; i < len; i += 1) {
                    let arg = arguments[i];
                    if (typeof arg !== "object") continue; // just in case
                    parent_view._title_btn.addView(getButtonLayout.apply(null, arg));
                    buttons_count += 1;
                }

                // tool function(s) //

                function getButtonLayout(button_icon_file_name, button_text, switch_state, btn_click_listener, other_params) {
                    other_params = other_params || {};
                    sess_par.button_icon_file_name = button_icon_file_name.replace(/^(ic_)?(.*?)(_black_48dp)?$/, "ic_$2_black_48dp");
                    sess_par.button_text = button_text;
                    let btn_text = button_text.toLowerCase();
                    let btn_icon_id = "_icon_" + btn_text;
                    sess_par.btn_icon_id = btn_icon_id;
                    let btn_text_id = "_text_" + btn_text;
                    sess_par.btn_text_id = btn_text_id;
                    let def_on_color = $defs.btn_on_color;
                    let def_off_color = $defs.btn_off_color;
                    let view = buttonView();
                    let switch_on_color = [other_params.btn_on_icon_color || def_on_color, other_params.btn_on_text_color || def_on_color];
                    let switch_off_color = [other_params.btn_off_icon_color || def_off_color, other_params.btn_off_text_color || def_off_color];
                    view.switch_on = () => {
                        view[btn_icon_id].attr("tint", switch_on_color[0]);
                        view[btn_text_id].setTextColor(colors.parseColor(switch_on_color[1]));
                    };
                    view.switch_off = () => {
                        view[btn_icon_id].attr("tint", switch_off_color[0]);
                        view[btn_text_id].setTextColor(colors.parseColor(switch_off_color[1]));
                    };

                    switch_state === "OFF" ? view.switch_off() : view.switch_on();

                    view[btn_text_id].on("click", () => btn_click_listener && btn_click_listener(view));
                    sess_par[data_source_key_name + "_btn_" + btn_text] = view;

                    return view;

                    // tool function(s) //

                    function buttonView() {
                        return ui.inflate(
                            <vertical margin="13 0" id="btn" layout_gravity="right" gravity="right">
                                <img id="{{sess_par.btn_icon_id}}"
                                     src="@drawable/{{sess_par.button_icon_file_name}}"
                                     bg="?selectableItemBackgroundBorderless"
                                     h="31" margin="0 7 0 0" layout_gravity="center"
                                />
                                <text id="{{sess_par.btn_text_id}}"
                                      text="{{sess_par.button_text}}" textSize="10" textStyle="bold"
                                      w="50" h="40" marginTop="-26" gravity="bottom|center"
                                />
                            </vertical>
                        );
                    }
                }
            },
            setListPageButtons: function (parent_view, data_source_key_name) {
                let scenario = {
                    blacklist_by_user: sceBlacklistByUser,
                    foreground_app_blacklist: sceForeAppBlacklist,
                }[data_source_key_name]();
                return $view.setButtons.apply(
                    $view.setButtons,
                    [parent_view, data_source_key_name].concat(scenario)
                );

                // scenario function(s) //

                function sceBlacklistByUser() {
                    return [
                        ["restore", "RESTORE", "OFF", (btn_view) => {
                            let blacklist_backup = sto_cfg[data_source_key_name];
                            if (equalObjects(sess_cfg[data_source_key_name], blacklist_backup)) return;
                            let diag = dialogs.builds([
                                "恢复列表数据", "restore_original_list_data",
                                ["查看恢复列表", "hint_btn_bright_color"], "返回", "确定", 1,
                            ]);
                            diag.on("neutral", () => {
                                let diag_restore_list = dialogs.builds(["查看恢复列表", "", 0, 0, "返回", 1], {
                                    content: "共计 " + blacklist_backup.length + " 项",
                                    items: (function () {
                                        let split_line = "";
                                        for (let i = 0; i < 18; i += 1) split_line += "- ";
                                        let items = [split_line];
                                        blacklist_backup.forEach((o) => {
                                            items.push(
                                                "好友昵称: " + o.name,
                                                "解除时间: " + $tool.getTimeStrFromTimestamp(o.timestamp, "time_str_remove"),
                                                split_line
                                            );
                                        });
                                        return items.length > 1 ? items : ["列表为空"];
                                    })(),
                                });
                                diag_restore_list.on("positive", () => diag_restore_list.dismiss());
                                diag_restore_list.show();
                            });
                            diag.on("negative", () => diag.dismiss());
                            diag.on("positive", () => {
                                let list_page_view = $view.findViewByTag(parent_view, "list_page_view");
                                diag.dismiss();
                                $view.updateDataSource(data_source_key_name, "splice", 0);

                                let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                                let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                                sess_par[deleted_items_idx] = {};
                                sess_par[deleted_items_idx_count] = 0;
                                let remove_btn = parent_view._text_remove.getParent();
                                remove_btn.switch_off();
                                btn_view.switch_off();
                                blacklist_backup.forEach(value => $view.updateDataSource(data_source_key_name, "update", value));
                                list_page_view._check_all.setChecked(true);
                                list_page_view._check_all.setChecked(false);
                            });
                            diag.show();
                        }],
                        ["delete_forever", "REMOVE", "OFF", (btn_view) => {
                            let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                            let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                            if (!sess_par[deleted_items_idx_count]) return;

                            let thread_items_stable = threads.starts(function () {
                                let old_count = undefined;
                                while (sess_par[deleted_items_idx_count] !== old_count) {
                                    old_count = sess_par[deleted_items_idx_count];
                                    sleep(50);
                                }
                            });
                            thread_items_stable.join(800);

                            let deleted_items_idx_keys = Object.keys(sess_par[deleted_items_idx]);
                            deleted_items_idx_keys
                                .sort((a, b) => +a < +b ? 1 : -1)
                                .forEach((idx) => {
                                    if (sess_par[deleted_items_idx][idx]) {
                                        sess_par[data_source_key_name].splice(idx, 1);
                                    }
                                });
                            $view.updateDataSource(data_source_key_name, "rewrite");
                            sess_par[deleted_items_idx] = {};
                            sess_par[deleted_items_idx_count] = 0;

                            let list_page_view = $view.findViewByTag(parent_view, "list_page_view");
                            let restore_btn = parent_view._text_restore.getParent();
                            if (!equalObjects(sess_cfg[data_source_key_name], sto_cfg[data_source_key_name])) restore_btn.switch_on();
                            else restore_btn.switch_off();
                            list_page_view._check_all.setChecked(true);
                            list_page_view._check_all.setChecked(false);
                            btn_view.switch_off();
                        }],
                        ["add_circle", "NEW", "ON", (btn_view) => {
                            let tmp_selected_friends = [];
                            let blacklist_selected_friends = [];
                            let list_page_view = $view.findViewByTag(parent_view, "list_page_view");

                            sess_cfg[data_source_key_name].forEach(o => blacklist_selected_friends.push(o.name));

                            let diag = dialogs.builds([
                                "添加新数据", "从好友列表中选择并添加好友\n或检索选择好友",
                                ["从列表中选择", "hint_btn_bright_color"], ["检索选择", "hint_btn_bright_color"], "确认添加", 1,
                            ], {items: [" "]});
                            diag.on("neutral", () => {
                                let diag_add_from_list = dialogs.builds([
                                    "列表选择好友", "",
                                    ["刷新列表", "hint_btn_bright_color"], 0, "确认选择", 1,
                                ], {
                                    items: ["列表为空"],
                                    itemsSelectMode: "multi",
                                });
                                diag_add_from_list.on("neutral", () => {
                                    $tool.refreshFriendsListByLaunchingAlipay({
                                        dialog_prompt: true,
                                        onTrigger: function () {
                                            diag_add_from_list.dismiss();
                                            diag.dismiss();
                                        },
                                        onResume: function () {
                                            diag.show();
                                            threads.starts(function () {
                                                let neutral_btn_text = diag.getActionButton("neutral");
                                                if (neutral_btn_text) {
                                                    waitForAndClickAction(text(neutral_btn_text), 4000, 100, {
                                                        click_strategy: "widget",
                                                    });
                                                }
                                            });
                                        },
                                    });
                                });
                                diag_add_from_list.on("positive", () => {
                                    refreshDiag();
                                    diag_add_from_list.dismiss();
                                });
                                diag_add_from_list.on("multi_choice", (items, indices_damaged_, dialog) => {
                                    if (items.length === 1 && items[0] === "列表为空") return;
                                    if (items) items.forEach(name => tmp_selected_friends.push(name.split(". ")[1]));
                                });
                                diag_add_from_list.show();

                                refreshAddFromListDiag();

                                // tool function(s) //

                                function refreshAddFromListDiag() {
                                    let items = [];
                                    let friends_list = $sto.af.get("friends_list_data", {});
                                    if (friends_list.list_data) {
                                        friends_list.list_data.forEach(o => {
                                            let nickname = o.nickname;
                                            if (!~blacklist_selected_friends.indexOf(nickname) && !~tmp_selected_friends.indexOf(nickname)) {
                                                items.push(o.rank_num + ". " + nickname);
                                            }
                                        });
                                    }
                                    let items_len = items.length;
                                    items = items_len ? items : ["列表为空"];
                                    diag_add_from_list.setItems(items);
                                    let friends_list_timestamp = friends_list.timestamp;
                                    if (friends_list_timestamp === Infinity) friends_list_timestamp = -1;
                                    sess_par.last_friend_list_refresh_timestamp = friends_list_timestamp;
                                    diag_add_from_list.setContent(
                                        "上次刷新: " + $tool.getTimeStrFromTimestamp(friends_list_timestamp, "time_str") + "\n"
                                        + "当前可添加的好友总数: " + items_len
                                    );
                                }
                            });
                            diag.on("negative", () => {
                                diag.dismiss();
                                $view.setListItemsSearchAndSelectView((() => {
                                    let {list_data} = $sto.af.get("friends_list_data", {list_data: []});
                                    return list_data.map(o => o.nickname);
                                }), {
                                    empty_list_prompt: true,
                                    refresh_btn_listener: (data_source_updater, data_source_src) => {
                                        $tool.refreshFriendsListByLaunchingAlipay({
                                            dialog_prompt: true,
                                            onResume: function () {
                                                data_source_updater(data_source_src());
                                            },
                                        });
                                    },
                                    list_item_listener: (item, closeListPage) => {
                                        let excluded_data_arrays = [blacklist_selected_friends, tmp_selected_friends];

                                        for (let i = 0, len = excluded_data_arrays.length; i < len; i += 1) {
                                            if (~excluded_data_arrays[i].indexOf(item)) {
                                                return toast("此项已存在于黑名单列表或待添加列表中");
                                            }
                                        }
                                        closeListPage(item);
                                    },
                                    onFinish: (result) => {
                                        result && tmp_selected_friends.push(result);
                                        diag.show();
                                        refreshDiag();
                                    }
                                });
                            });
                            diag.on("positive", () => {
                                tmp_selected_friends.forEach(name => $view.updateDataSource(data_source_key_name, "update_unshift", {
                                    name: name,
                                    timestamp: Infinity,
                                }));
                                if (tmp_selected_friends.length) setTimeout(function () {
                                    parent_view.getParent()._list_data.smoothScrollBy(0, -Math.pow(10, 5));
                                }, 200);
                                let restore_btn = list_page_view.getParent()._text_restore.getParent();
                                equalObjects(
                                    sess_cfg[data_source_key_name],
                                    sto_cfg[data_source_key_name]
                                ) ? restore_btn.switch_off() : restore_btn.switch_on();
                                $save.session(data_source_key_name, sess_cfg[data_source_key_name]);
                                diag.dismiss();
                            });
                            diag.on("item_select", (idx, item, dialog) => {
                                let diag_items = diag.getItems().toArray();
                                if (diag_items.length === 1 && diag_items[0] === "\xa0") return;
                                let delete_confirm_diag = dialogs.builds(["确认移除此项吗", "", 0, "返回", "确认", 1]);
                                delete_confirm_diag.on("negative", () => delete_confirm_diag.dismiss());
                                delete_confirm_diag.on("positive", () => {
                                    tmp_selected_friends.splice(idx, 1);
                                    refreshDiag();
                                    delete_confirm_diag.dismiss();
                                });
                                delete_confirm_diag.show();
                            });
                            diag.show();

                            refreshDiag();

                            // tool function(s) //

                            function refreshDiag() {
                                let tmp_items_len = tmp_selected_friends.length;
                                let tmp_items = tmp_items_len ? tmp_selected_friends : ["\xa0"];
                                diag.setItems(tmp_items);
                                let content_info = tmp_items_len ? ("当前选择区好友总数: " + tmp_items_len) : "从好友列表中选择并添加好友\n或手动输入好友昵称";
                                diag.setContent(content_info);
                            }
                        }]
                    ];
                }

                function sceForeAppBlacklist() {
                    return [
                        ["restore", "RESTORE", "OFF", (btn_view) => {
                            let blacklist_backup = sto_cfg[data_source_key_name];
                            if (equalObjects(sess_cfg[data_source_key_name], blacklist_backup)) return;
                            let diag = dialogs.builds([
                                "恢复列表数据", "restore_original_list_data",
                                ["查看恢复列表", "hint_btn_bright_color"], "返回", "确定", 1,
                            ]);
                            diag.on("neutral", () => {
                                let diag_restore_list = dialogs.builds(["查看恢复列表", "", 0, 0, "返回", 1], {
                                    content: "共计 " + blacklist_backup.length + " 项",
                                    items: (function () {
                                        let items = [];
                                        blacklist_backup.forEach(o => items.push(o.app_combined_name));
                                        return items.length ? items : ["列表为空"];
                                    })(),
                                });
                                diag_restore_list.on("positive", () => diag_restore_list.dismiss());
                                diag_restore_list.show();
                            });
                            diag.on("negative", () => diag.dismiss());
                            diag.on("positive", () => {
                                let list_page_view = $view.findViewByTag(parent_view, "list_page_view");
                                diag.dismiss();
                                $view.updateDataSource(data_source_key_name, "splice", 0);

                                let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                                let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                                sess_par[deleted_items_idx] = {};
                                sess_par[deleted_items_idx_count] = 0;
                                let remove_btn = parent_view._text_remove.getParent();
                                remove_btn.switch_off();
                                btn_view.switch_off();
                                blacklist_backup.forEach(value => $view.updateDataSource(data_source_key_name, "update", value));
                                list_page_view._check_all.setChecked(true);
                                list_page_view._check_all.setChecked(false);
                            });
                            diag.show();
                        }],
                        ["delete_forever", "REMOVE", "OFF", (btn_view) => {
                            let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                            let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                            if (!sess_par[deleted_items_idx_count]) return;

                            let thread_items_stable = threads.starts(function () {
                                let old_count = undefined;
                                while (sess_par[deleted_items_idx_count] !== old_count) {
                                    old_count = sess_par[deleted_items_idx_count];
                                    sleep(50);
                                }
                            });
                            thread_items_stable.join(800);

                            let deleted_items_idx_keys = Object.keys(sess_par[deleted_items_idx]);
                            deleted_items_idx_keys
                                .sort((a, b) => +a < +b ? 1 : -1)
                                .forEach((idx) => {
                                    if (sess_par[deleted_items_idx][idx]) {
                                        sess_par[data_source_key_name].splice(idx, 1);
                                    }
                                });
                            $view.updateDataSource(data_source_key_name, "rewrite");
                            sess_par[deleted_items_idx] = {};
                            sess_par[deleted_items_idx_count] = 0;

                            let list_page_view = $view.findViewByTag(parent_view, "list_page_view");
                            let restore_btn = parent_view._text_restore.getParent();
                            let _sess = sess_cfg[data_source_key_name];
                            let _sto = sto_cfg[data_source_key_name];
                            equalObjects(_sess, _sto) ? restore_btn.switch_off() : restore_btn.switch_on();
                            list_page_view._check_all.setChecked(true);
                            list_page_view._check_all.setChecked(false);
                            btn_view.switch_off();
                        }],
                        ["add_circle", "NEW", "ON", (btn_view) => {
                            let tmp_selected_apps = [];
                            let blacklist_selected_apps = [];
                            let list_page_view = $view.findViewByTag(parent_view, "list_page_view");

                            let _sess = sess_cfg[data_source_key_name];
                            _sess.forEach(o => blacklist_selected_apps.push(o.app_combined_name));

                            let diag = dialogs.builds([
                                "添加新数据", "从应用列表中选择并添加应用\n或检索选择应用",
                                ["从列表中选择", "hint_btn_bright_color"], ["检索选择", "hint_btn_bright_color"], "确认添加", 1,
                            ], {items: ["\xa0"]});
                            diag.on("neutral", () => {
                                let diag_add_from_list = dialogs.builds([
                                    "列表选择应用", "",
                                    ["刷新列表", "hint_btn_bright_color"], ["显示系统应用", "hint_btn_dark_color"], "确认选择", 1,
                                ], {
                                    items: ["\xa0"],
                                    itemsSelectMode: "multi",
                                });
                                diag_add_from_list.on("neutral", () => refreshDiagList("force_refresh"));
                                diag_add_from_list.on("negative", () => {
                                    if (diag_add_from_list.getActionButton("negative") === "显示系统应用") {
                                        diag_add_from_list.setActionButton("negative", "隐藏系统应用");
                                    } else {
                                        diag_add_from_list.setActionButton("negative", "显示系统应用");
                                    }
                                    refreshDiagList();
                                });
                                diag_add_from_list.on("positive", () => {
                                    refreshDiag();
                                    diag_add_from_list.dismiss();
                                });
                                diag_add_from_list.on("multi_choice", (items, indices_damaged_, dialog) => {
                                    if (!items || items[0] === "\xa0") return;
                                    items.forEach(name => name === "... ..." || tmp_selected_apps.push(name));
                                });
                                diag_add_from_list.show();

                                refreshDiagList();

                                // tool function(s) //

                                function refreshDiagList(force_refresh_flag) {
                                    diag_add_from_list.setItems(Array(15).join("... ...,").split(",").slice(0, -1));
                                    diag_add_from_list.setContent("当前可添加的应用总数: ... ...");
                                    diag_add_from_list.setSelectedIndices([]);
                                    threads.start(function () {
                                        let items = $tool.getAllAppsJointStr(
                                            () => diag_add_from_list.getActionButton("negative") !== "显示系统应用",
                                            [blacklist_selected_apps, tmp_selected_apps],
                                            force_refresh_flag
                                        );
                                        let items_len = items.length;
                                        items = items_len ? items : ["列表为空"];
                                        ui.post(function () {
                                            diag_add_from_list.setSelectedIndices([]);
                                            diag_add_from_list.setItems(items);
                                            diag_add_from_list.setContent("当前可添加的应用总数: " + items_len);
                                        });
                                    });
                                }
                            });
                            diag.on("negative", () => {
                                diag.dismiss();
                                $view.setListItemsSearchAndSelectView($tool.getAllAppsJointStr, {
                                    refresh_btn_listener: (data_source_updater, data_source_src, view) => {
                                        view.list.setDataSource([]);
                                        data_source_updater(() => $tool.getAllAppsJointStr(true, [], "force_refresh"), "refresh_btn_alter");
                                    },
                                    list_item_listener: (item, closeListPage) => {
                                        let excluded_data_arrays = [blacklist_selected_apps, tmp_selected_apps];

                                        for (let i = 0, len = excluded_data_arrays.length; i < len; i += 1) {
                                            if (~excluded_data_arrays[i].indexOf(item)) {
                                                return toast("此项已存在于黑名单列表或待添加列表中");
                                            }
                                        }
                                        closeListPage(item);
                                    },
                                    onFinish: (result) => {
                                        result && tmp_selected_apps.push(result);
                                        diag.show();
                                        refreshDiag();
                                    }
                                });
                            });
                            diag.on("positive", () => {
                                tmp_selected_apps.forEach((name) => {
                                    $view.updateDataSource(
                                        data_source_key_name,
                                        "update_unshift",
                                        {app_combined_name: name}
                                    )
                                });
                                if (tmp_selected_apps.length) setTimeout(function () {
                                    parent_view.getParent()._list_data.smoothScrollBy(0, -Math.pow(10, 5));
                                }, 200);
                                let restore_btn = list_page_view.getParent()._text_restore.getParent();
                                let _sess = sess_cfg[data_source_key_name];
                                let _sto = sto_cfg[data_source_key_name];
                                equalObjects(_sess, _sto) ? restore_btn.switch_off() : restore_btn.switch_on();
                                $save.session(data_source_key_name, _sess);
                                diag.dismiss();
                            });
                            diag.on("item_select", (idx, item, dialog) => {
                                let diag_items = diag.getItems().toArray();
                                if (diag_items.length === 1 && diag_items[0] === "\xa0") return;
                                let delete_confirm_diag = dialogs.builds(["确认移除此项吗", "", 0, "返回", "确认", 1]);
                                delete_confirm_diag.on("negative", () => delete_confirm_diag.dismiss());
                                delete_confirm_diag.on("positive", () => {
                                    tmp_selected_apps.splice(idx, 1);
                                    refreshDiag();
                                    delete_confirm_diag.dismiss();
                                });
                                delete_confirm_diag.show();
                            });
                            diag.show();

                            refreshDiag();

                            // tool function(s) //

                            function refreshDiag() {
                                let tmp_items_len = tmp_selected_apps.length;
                                let tmp_items = tmp_items_len ? tmp_selected_apps : ["\xa0"];
                                diag.setItems(tmp_items);
                                let content_info = tmp_items_len ? ("当前选择区应用总数: " + tmp_items_len) : "从列表中选择并添加应用\n或检索选择并添加应用";
                                diag.setContent(content_info);
                            }
                        }]
                    ];
                }
            },
            setInfoInputView: function (params) {
                let info_input_view = null;
                let input_views_obj = {};
                let {InputType, SpannableString, style, Spanned, SpannedString} = android.text;

                params = params || {};
                if (typeof sess_par !== "undefined") {
                    sess_par.back_btn_consumed = true;
                    sess_par.back_btn_consumed_func = (
                        typeof params.back_btn_consumed === "function"
                            ? () => params.back_btn_consumed()
                            : () => info_input_view.back_btn.click()
                    );
                }

                initInfoInputView();
                addInputBoxes();
                addButtons();

                // tool function(s) //

                function initInfoInputView() {
                    info_input_view = ui.inflate(
                        <vertical focusable="true" focusableInTouchMode="true" bg="#ffffff" clickable="true">
                            <vertical h="*" gravity="center" id="info_input_view_main" clickable="true" focusableInTouchMode="true"/>
                        </vertical>
                    );

                    info_input_view.setTag("fullscreen_info_input");
                    ui.main.getParent().addView(info_input_view);
                }

                function addInputBoxes() {
                    params.input_views.forEach((o, idx) => {
                        let view = ui.inflate(
                            <vertical>
                                <card foreground="?selectableItemBackground"
                                      cardBackgroundColor="#546e7a"
                                      cardCornerRadius="2dp" cardElevation="3dp"
                                      w="*" h="50" margin="18 0 18 30"
                                >
                                    <input id="input_area" background="?null"
                                           textSize="17" textColor="#eeeeee"
                                           hint="未设置" textColorHint="#e3e3e3"
                                           gravity="center"
                                           selectAllOnFocus="true"
                                    />
                                    <vertical gravity="right|bottom">
                                        <text id="input_text" bg="#66000000"
                                              textColor="#ffffff" textSize="12sp"
                                              w="auto" h="auto"
                                              padding="6 2" gravity_layout="right"
                                              maxLines="1"
                                        />
                                    </vertical>
                                </card>
                            </vertical>
                        );
                        let {text, type, hint_text, init} = o;
                        let input_area_view = view.input_area;
                        let input_text_view = view.input_text;
                        let setViewHintText = hint_text => setEditTextHint(input_area_view, "-2", hint_text);

                        if (type === "password") {
                            input_area_view.setInputType(input_area_view.getInputType() | InputType.TYPE_TEXT_VARIATION_PASSWORD);
                            input_area_view.setOnKeyListener(
                                function onKey(view, keyCode, event) {
                                    let {KEYCODE_ENTER, ACTION_UP} = android.view.KeyEvent;
                                    let is_keycode_enter = keyCode === KEYCODE_ENTER;
                                    let is_action_up = event.getAction() === ACTION_UP;
                                    is_keycode_enter && is_action_up && info_input_view.confirm_btn.click();
                                    return is_keycode_enter;
                                }
                            );
                        } else {
                            input_area_view.setSingleLine(true);
                        }

                        if (type === "account") init = $tool.accountNameConverter(init, "decrypt");

                        input_text_view.setText(text);
                        init && input_area_view.setText(init);
                        setViewHintText(typeof hint_text === "function" ? hint_text() : hint_text);
                        view.input_area.setViewHintText = setViewHintText;
                        input_area_view.setOnFocusChangeListener(onFocusChangeListener);
                        info_input_view.info_input_view_main.addView(view);
                        input_views_obj[text] = view;

                        // tool function(s) //

                        function onFocusChangeListener(view, has_focus) {
                            has_focus ? view.setHint(null) : setViewHintText(typeof hint_text === "function" ? hint_text() : hint_text);
                        }

                        function setEditTextHint(edit_text_view, text_size, text_str) {
                            if (text_size.toString().match(/^[+-]\d+$/)) {
                                text_size = edit_text_view.getTextSize() / context.getResources().getDisplayMetrics().scaledDensity + +text_size;
                            }
                            let span_string = new SpannableString(text_str || edit_text_view.hint);
                            let abs_size_span = new style.AbsoluteSizeSpan(text_size, true);
                            span_string.setSpan(abs_size_span, 0, span_string.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                            edit_text_view.setHint(new SpannedString(span_string));
                        }
                    });
                    info_input_view.info_input_view_main.addView(ui.inflate(
                        <vertical>
                            <frame margin="0 15"/>
                        </vertical>
                    ));
                }

                function addButtons() {
                    let {buttons} = params;
                    let {additional} = buttons;

                    additional && addAdditionalButtons(additional);

                    let common_btn_view = ui.inflate(
                        <vertical>
                            <horizontal id="btn_group" w="auto" layout_gravity="center">
                                <button id="back_btn" text="返回" margin="20 0" backgroundTint="#eeeeee"/>
                                <button id="reserved_btn" text="预留按钮" margin="-10 0" backgroundTint="#bbdefb" visibility="gone"/>
                                <button id="confirm_btn" text="确定" margin="20 0" backgroundTint="#dcedc8"/>
                            </horizontal>
                        </vertical>
                    );

                    if (buttons.reserved_btn) {
                        let {text, onClickListener, hint_color} = buttons.reserved_btn;
                        let reserved_btn_view = common_btn_view.reserved_btn;
                        reserved_btn_view.setVisibility(0);
                        text && reserved_btn_view.setText(text);
                        onClickListener && reserved_btn_view.on("click", () => onClickListener(input_views_obj, closeInfoInputPage));
                        if (hint_color) reserved_btn_view.attr("backgroundTint", hint_color);
                    }

                    info_input_view.info_input_view_main.addView(common_btn_view);
                    info_input_view.back_btn.on("click", () => closeInfoInputPage());

                    if (buttons.confirm_btn) {
                        let {text, onClickListener} = buttons.confirm_btn;
                        let confirm_btn_view = common_btn_view.confirm_btn;
                        text && confirm_btn_view.setText(text);
                        onClickListener && confirm_btn_view.on("click", () => onClickListener(input_views_obj, closeInfoInputPage));
                    } else info_input_view.confirm_btn.on("click", closeInfoInputPage);

                    // tool function(s) //

                    function addAdditionalButtons(additional) {
                        let addi_buttons = classof(additional, "Array") ? additional.slice() : [additional];
                        let addi_btn_view = ui.inflate(
                            <vertical>
                                <horizontal id="addi_button_area" w="auto" layout_gravity="center"/>
                            </vertical>
                        );
                        addi_buttons.forEach((o, idx) => {
                            if (classof(o, "Array")) return addAdditionalButtons(o);
                            let btn_view = ui.inflate(<button margin="2 0 2 8" backgroundTint="#cfd8dc"/>);
                            let {text, hint_color, onClickListener} = o;
                            if (text) btn_view.setText(text);
                            if (hint_color) btn_view.attr("backgroundTint", hint_color);
                            if (onClickListener) btn_view.on("click", () => onClickListener(input_views_obj, closeInfoInputPage));
                            addi_btn_view.addi_button_area.addView(btn_view);
                        });
                        info_input_view.info_input_view_main.addView(addi_btn_view);
                    }
                }

                function closeInfoInputPage() {
                    if (typeof sess_par !== "undefined") {
                        delete sess_par.back_btn_consumed;
                        delete sess_par.back_btn_consumed_func;
                    }

                    let parent = ui.main.getParent();
                    let child_count = parent.getChildCount();
                    for (let i = 0; i < child_count; i += 1) {
                        let child_view = parent.getChildAt(i);
                        if (child_view.findViewWithTag("fullscreen_info_input")) parent.removeView(child_view);
                    }
                }
            },
            setTimePickerView: function (params) {
                let time_picker_view = null;
                let week_checkbox_states = Array(7).join(" ").split(" ").map(() => false);

                params = params || {};
                if (typeof sess_par !== "undefined") {
                    sess_par.back_btn_consumed = true;
                    sess_par.back_btn_consumed_func = (
                        typeof params.back_btn_consumed === "function"
                            ? () => params.back_btn_consumed()
                            : () => time_picker_view.back_btn.click()
                    );
                }

                let picker_views = params.picker_views;
                let date_or_time_indices = [];
                ["date", "time"].forEach((aim_type) => {
                    picker_views.forEach((o, idx) => aim_type === o.type && date_or_time_indices.push(idx));
                });
                let date_or_time_len = date_or_time_indices.length;

                initPickerView();
                addPickers();
                addTimeStr();
                addButtons();

                ui.main.getParent().addView(time_picker_view);

                // tool function(s) //

                function initPickerView() {
                    time_picker_view = ui.inflate(
                        <vertical bg="#ffffff" clickable="true" focusable="true">
                            <scroll>
                                <vertical id="time_picker_view_main" padding="16"/>
                            </scroll>
                        </vertical>
                    );

                    time_picker_view.setTag("fullscreen_time_picker");
                }

                function addPickers() {
                    picker_views.forEach(addPickerView);

                    let type1 = (picker_views[date_or_time_indices[0]] || {}).type;
                    let type2 = (picker_views[date_or_time_indices[1]] || {}).type;
                    time_picker_view.getPickerTimeInfo[0] = date_or_time_len === 2 && type1 !== type2 ? {
                        timestamp: () => {
                            let f = num => time_picker_view.getPickerTimeInfo[date_or_time_indices[num - 1] + 1];
                            if (type1 === "date") return +new Date(+f(1).yy(), +f(1).MM() - 1, +f(1).dd(), +f(2).hh(), +f(2).mm());
                            if (type2 === "date") return +new Date(+f(2).yy(), +f(2).MM() - 1, +f(2).dd(), +f(1).hh(), +f(1).mm());
                        }, // timestamp from one "date" AND one "time"
                    } : {};

                    // tool function(s) //

                    function addPickerView(o, idx) {
                        if (!o || !o.type) return;

                        let picker_view = ui.inflate(
                            <vertical id="picker_root">
                                <frame h="1" bg="#acacac" w="*"/>
                                <frame w="auto" layout_gravity="center" marginTop="15">
                                    <text id="picker_title" text="设置时间" textColor="#01579b" textSize="16sp"/>
                                </frame>
                            </vertical>
                        );

                        let text_node = picker_view.picker_title;
                        let {text, text_color, type, init} = o;
                        text && text_node.setText(text);
                        text_color && text_node.setTextColor(colors.parseColor(text_color));

                        if (type === "time") {
                            picker_view.picker_root.addView(ui.inflate(
                                <vertical>
                                    <timepicker h="160" id="picker" timePickerMode="spinner" marginTop="-10"/>
                                </vertical>
                            ));
                            picker_view.picker.setIs24HourView(true);
                            if (init) {
                                if (typeof init === "string") init = init.split(/\D+/);
                                if (typeof init === "number" && init.toString().match(/^\d{13}$/)) {
                                    let date = new Date(init);
                                    init = [date.getHours(), date.getMinutes()];
                                }
                                if (typeof init === "object") {
                                    typeof +init[0] === "number" && picker_view.picker.setHour(init[0]);
                                    typeof +init[1] === "number" && picker_view.picker.setMinute(init[1]);
                                }
                            }
                        } else if (type === "date") {
                            picker_view.picker_root.addView(ui.inflate(
                                <vertical>
                                    <datepicker h="160" id="picker" datePickerMode="spinner" marginTop="-10"/>
                                </vertical>
                            ));
                            let picker_node = picker_view.picker;
                            if (init) {
                                // init:
                                // 1. 1564483851219 - timestamp
                                // 2. [2018, 7, 8] - number[]
                                if (typeof init === "number" && init.toString().match(/^\d{13}$/)) {
                                    let date = new Date(init);
                                    init = [date.getFullYear(), date.getMonth(), date.getDate()];
                                }
                            } else {
                                let now = new Date();
                                init = [now.getFullYear(), now.getMonth(), now.getDate()];
                            }
                            let onDateChangedListener = new android.widget.DatePicker.OnDateChangedListener({onDateChanged: setTimeStr});
                            let init_params = init.concat(onDateChangedListener);
                            picker_node.init.apply(picker_node, init_params);
                        } else if (type === "week") {
                            let weeks_str = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                            let checkbox_views = ui.inflate(
                                <vertical id="checkboxes">
                                    <horizontal margin="0 15 0 5" layout_gravity="center" w="auto">
                                        <checkbox id="week_1" marginRight="13"/>
                                        <checkbox id="week_2"/>
                                    </horizontal>
                                    <horizontal margin="0 5" layout_gravity="center" w="auto">
                                        <checkbox id="week_3" marginRight="13"/>
                                        <checkbox id="week_4"/>
                                    </horizontal>
                                    <horizontal margin="0 5 0 15" layout_gravity="center" w="auto">
                                        <checkbox id="week_5" marginRight="13"/>
                                        <checkbox id="week_6" marginRight="13"/>
                                        <checkbox id="week_0"/>
                                    </horizontal>
                                </vertical>
                            );

                            for (let i = 0; i < 7; i += 1) {
                                checkbox_views["week_" + i].setText(weeks_str[i]);
                                checkbox_views["week_" + i].on("check", (checked, view) => {
                                    week_checkbox_states[weeks_str.indexOf(view.text)] = checked;
                                    threads.start(function () {
                                        let max_try_times = 20;
                                        let interval = setInterval(function () {
                                            if (!max_try_times--) return clearInterval(interval);
                                            try {
                                                ui.post(setTimeStr);
                                                clearInterval(interval);
                                            } catch (e) {
                                            }
                                        }, 100);
                                    });
                                });
                            }

                            picker_view.picker_root.addView(checkbox_views);

                            if (init) {
                                if (typeof init === "number") init = timedTaskTimeFlagConverter(init);
                                init.forEach(num => picker_view.checkboxes["week_" + num].setChecked(true));
                            }
                        }

                        time_picker_view.getPickerTimeInfo = time_picker_view.getPickerTimeInfo || {};
                        let picker_node = picker_view.picker;
                        if (type === "time") picker_node.setOnTimeChangedListener(setTimeStr);

                        let {yy, MM, dd, hh, mm} = {
                            yy: () => {
                                try {
                                    return picker_node.getYear();
                                } catch (e) {
                                    return new Date().getFullYear();
                                }
                            },
                            MM: () => padZero((() => {
                                try {
                                    return picker_node.getMonth();
                                } catch (e) {
                                    return new Date().getMonth();
                                }
                            })() + 1),
                            dd: () => padZero((() => {
                                try {
                                    return picker_node.getDayOfMonth();
                                } catch (e) {
                                    return new Date().getDate();
                                }
                            })()),
                            hh: () => {
                                try {
                                    return padZero(picker_node.getCurrentHour());
                                } catch (e) {
                                    return null;
                                }
                            },
                            mm: () => {
                                try {
                                    return padZero(picker_node.getCurrentMinute());
                                } catch (e) {
                                    return null;
                                }
                            },
                        };
                        let padZero = num => ("0" + num).slice(-2);
                        let parseDaysOfWeek = () => {
                            let result = [];
                            week_checkbox_states.forEach((bool, idx) => bool && result.push(idx));
                            return result;
                        };

                        time_picker_view.getPickerTimeInfo[idx + 1] = {
                            yy: yy,
                            MM: MM,
                            dd: dd,
                            hh: hh,
                            mm: mm,
                            default: () => {
                                if (type === "date") return yy() + "年" + MM() + "月" + dd() + "日";
                                if (type === "time") return hh() + ":" + mm();
                                if (type === "week") {
                                    let parsed = parseDaysOfWeek();
                                    if (!parsed.length) return "";
                                    return "  [ " + parsed.map(x => x === 0 ? 7 : x).sort().join(", ") + " ]";
                                }
                            },
                            timestamp: () => +new Date(yy(), MM(), dd(), hh(), mm()),
                            daysOfWeek: parseDaysOfWeek,
                        };

                        time_picker_view.time_picker_view_main.addView(picker_view);
                    }
                }

                function addTimeStr() {
                    time_picker_view.time_picker_view_main.addView(ui.inflate(
                        <vertical>
                            <frame h="1" bg="#acacac" w="*"/>
                            <frame w="auto" layout_gravity="center" margin="0 30 0 25">
                                <text id="time_str" text="" textColor="#bf360c" textSize="15sp" gravity="center"/>
                            </frame>
                        </vertical>
                    ));

                    setTimeStr();
                }

                function setTimeStr() {
                    let {picker_views} = params || [];
                    let {prefix, format, suffix, middle} = params.time_str || {};
                    let getTimeInfoFromPicker = num => time_picker_view.getPickerTimeInfo[num];

                    prefix = prefix && prefix.replace(/: ?/, "") + ": " || "";

                    if (typeof middle === "function") middle = middle(getTimeInfoFromPicker);
                    middle = middle || formatTimeStr();

                    if (typeof suffix === "function") suffix = suffix(getTimeInfoFromPicker);
                    suffix = suffix && suffix.replace(/^ */, " ") || "";

                    time_picker_view.time_str.setText(prefix + middle + suffix);

                    // tool function(s) //

                    function formatTimeStr() {
                        if (!format) {
                            let len = date_or_time_indices.length;
                            let str = getTimeInfoFromPicker(date_or_time_indices[0] + 1).default();
                            if (len === 2) {
                                str += (
                                    picker_views[date_or_time_indices[0]].type === picker_views[date_or_time_indices[1]].type ? " - " : " "
                                ) + getTimeInfoFromPicker(date_or_time_indices[1] + 1).default();
                            }
                            picker_views.forEach((o, idx) => {
                                if (o.type === "week") str += getTimeInfoFromPicker(idx + 1).default();
                            });
                            return str;
                        }
                        return format.replace(/(([yMdhm]{2})([12]))/g, ($0, $1, $2, $3) => getTimeInfoFromPicker($3)[$2]());
                    }
                }

                function addButtons() {
                    let getTimeInfoFromPicker = num => time_picker_view.getPickerTimeInfo[num];
                    let btn_view = ui.inflate(
                        <vertical>
                            <horizontal id="btn_group" w="auto" layout_gravity="center">
                                <button id="back_btn" text="返回" margin="20 0" backgroundTint="#eeeeee"/>
                                <button id="reserved_btn" text="预留按钮" margin="-10 0" backgroundTint="#fff9c4" visibility="gone"/>
                                <button id="confirm_btn" text="确认选择" margin="20 0" backgroundTint="#dcedc8"/>
                            </horizontal>
                        </vertical>
                    );
                    if ((params.buttons || {}).reserved_btn) {
                        let {text, onClickListener} = params.buttons.reserved_btn;
                        let reserved_btn_view = btn_view.reserved_btn;
                        reserved_btn_view.setVisibility(0);
                        text && reserved_btn_view.setText(text);
                        onClickListener && reserved_btn_view.on("click", () => onClickListener(getTimeInfoFromPicker, closeTimePickerPage));
                    }
                    time_picker_view.time_picker_view_main.addView(btn_view);

                    if ((params.buttons || {}).back_btn) {
                        let {text, onClickListener} = params.buttons.back_btn;
                        let confirm_btn_view = btn_view.back_btn;
                        text && confirm_btn_view.setText(text);
                        onClickListener && confirm_btn_view.on("click", () => onClickListener(getTimeInfoFromPicker, closeTimePickerPage));
                    } else time_picker_view.back_btn.on("click", () => closeTimePickerPage());

                    if ((params.buttons || {}).confirm_btn) {
                        let {text, onClickListener} = params.buttons.confirm_btn;
                        let confirm_btn_view = btn_view.confirm_btn;
                        text && confirm_btn_view.setText(text);
                        onClickListener && confirm_btn_view.on("click", () => onClickListener(getTimeInfoFromPicker, closeTimePickerPage));
                    } else time_picker_view.confirm_btn.on("click", () => closeTimePickerPage("picker_view"));
                }

                function closeTimePickerPage(return_value) {
                    if (typeof sess_par !== "undefined") {
                        delete sess_par.back_btn_consumed;
                        delete sess_par.back_btn_consumed_func;
                    }

                    let parent = ui.main.getParent();
                    let child_count = parent.getChildCount();
                    for (let i = 0; i < child_count; i += 1) {
                        let child_view = parent.getChildAt(i);
                        if (child_view.findViewWithTag("fullscreen_time_picker")) parent.removeView(child_view);
                    }

                    if (params.onFinish && typeof return_value !== "undefined") {
                        params.onFinish(return_value === "picker_view" ? time_picker_view.time_str.getText().toString() : return_value);
                    }
                }
            },
            setListItemsSearchAndSelectView: function (data_source_src, params) {
                params = params || {};
                let {empty_list_prompt, refresh_btn_listener, list_item_listener} = params;

                let search_view = null;

                if (typeof sess_par !== "undefined") {
                    sess_par.back_btn_consumed = true;
                    sess_par.back_btn_consumed_func = (
                        typeof params.back_btn_consumed === "function"
                            ? () => params.back_btn_consumed()
                            : () => search_view.back_btn.click()
                    );
                }

                search_view = ui.inflate(
                    <vertical focusable="true" focusableInTouchMode="true" bg="#ffffff" clickable="true">
                        <horizontal margin="16 8 0 4">
                            <input id="input" lines="1" layout_weight="1" hint="列表加载中..." textColor="black" textSize="15sp" marginTop="3"/>
                            <horizontal margin="0 0 8 0">
                                <button id="refresh_btn" text="刷新" style="Widget.AppCompat.Button.Borderless.Colored" w="55"/>
                                <button id="back_btn" text="返回" style="Widget.AppCompat.Button.Borderless.Colored" w="55"/>
                            </horizontal>
                        </horizontal>
                        <grid id="list" spanCount="1" margin="16 0" border="1">
                            <text text="{{this}}" padding="4 5" margin="2 5" bg="#eeeeeef8"/>
                        </grid>
                    </vertical>
                );

                search_view.setTag("fullscreen_list_items_search_and_select");

                let data_source_ori = [];
                search_view.list.setDataSource(data_source_ori);

                updateListData(data_source_src);

                search_view.input.setOnKeyListener(
                    function onKey(view, keyCode, event) {
                        return keyCode === android.view.KeyEvent.KEYCODE_ENTER; // disable ENTER_KEY
                    }
                );

                let thread_calc_and_set_input = null;
                search_view.input.addTextChangedListener(
                    new android.text.TextWatcher({afterTextChanged: afterTextChanged})
                );

                if (typeof refresh_btn_listener === "function") {
                    search_view.refresh_btn.on("click", () => {
                        refresh_btn_listener(updateListData, data_source_src, search_view);
                    });
                } else {
                    search_view.refresh_btn.setVisibility(8);
                }
                search_view.back_btn.on("click", () => {
                    $view.collapseSoftKeyboard(search_view.input);
                    closeListPage();
                });
                search_view.list.on("item_click", (item) => {
                    if (typeof list_item_listener === "function") {
                        list_item_listener(item, closeListPage);
                    }
                });

                ui.main.getParent().addView(search_view);

                // tool function(s) //

                function afterTextChanged(input_text) {
                    if (thread_calc_and_set_input && thread_calc_and_set_input.isAlive()) {
                        thread_calc_and_set_input.interrupt();
                    }
                    thread_calc_and_set_input = threads.start(function () {
                        let data_source = [];
                        if (input_text) {
                            data_source_ori.forEach((name) => {
                                name = name.toString();
                                input_text = input_text.toString();
                                if (input_text.slice(0, 8).toUpperCase() === "#REGEXP#") {
                                    try {
                                        if (name.match(new RegExp(input_text.slice(8)))) data_source.push(name);
                                    } catch (e) {
                                        // unterminated char may cause a SyntaxError when typing
                                    }
                                } else {
                                    let _name = name.toLowerCase();
                                    let _input = input_text.toLowerCase();
                                    if (~_name.indexOf(_input)) data_source.push(name);
                                }
                            })
                        }
                        ui.post(() => search_view.list.setDataSource(input_text ? data_source : data_source_ori));
                    });
                }

                function updateListData(data_source, refresh_btn_text_alter_flag) {
                    sess_par.list_refreshing_counter = sess_par.list_refreshing_counter || 0;
                    if (sess_par.list_refreshing_counter) return;
                    threads.start(function () {
                        refresh_btn_text_alter_flag && search_view.refresh_btn.setText("...");
                        sess_par.list_refreshing_counter += 1;
                        let _data_source = typeof data_source === "function" ? data_source() : data_source;
                        if (!_data_source.length && empty_list_prompt) {
                            empty_list_prompt = false;
                            dialogs.builds([
                                "空列表提示", "当前列表为空\n可能需要点击\"刷新\"按钮\n刷新后列表将自动更新",
                                0, 0, "确定", 1
                            ]).on("positive", diag => diag.dismiss()).show();
                        }
                        ui.post(() => {
                            search_view.list.setDataSource(data_source_ori = _data_source);
                            search_view.input.setHint(_data_source.length ? "在此键入并筛选列表内容" : "列表为空");
                            refresh_btn_text_alter_flag && search_view.refresh_btn.setText("刷新");
                            sess_par.list_refreshing_counter -= 1;
                        });
                    });
                }

                function closeListPage(result) {
                    if (typeof sess_par !== "undefined") {
                        delete sess_par.back_btn_consumed;
                        delete sess_par.back_btn_consumed_func;
                    }

                    let parent = ui.main.getParent();
                    let child_count = parent.getChildCount();
                    for (let i = 0; i < child_count; i += 1) {
                        let child_view = parent.getChildAt(i);
                        if (child_view.findViewWithTag("fullscreen_list_items_search_and_select")) parent.removeView(child_view);
                    }

                    let {onFinish} = params;
                    typeof onFinish === "function" && onFinish(result);
                }
            },
            setTimersUninterruptedCheckAreasPageButtons: function (parent_view, data_source_key_name) {
                return $view.setButtons(parent_view, data_source_key_name,
                    ["restore", "RESTORE", "OFF", (btn_view) => {
                        let list_data_backup = sto_cfg[data_source_key_name];
                        if (equalObjects(sess_cfg[data_source_key_name], list_data_backup)) return;
                        let diag = dialogs.builds([
                            "恢复列表数据", "restore_original_list_data",
                            ["查看恢复列表", "hint_btn_bright_color"], "返回", "确定", 1,
                        ]);
                        diag.on("neutral", () => {
                            let diag_restore_list = dialogs.builds(["查看恢复列表", "", 0, 0, "返回", 1], {
                                content: "共计 " + list_data_backup.length + " 项",
                                items: (function () {
                                    let split_line = "";
                                    for (let i = 0; i < 18; i += 1) split_line += "- ";
                                    let items = [split_line];
                                    list_data_backup.forEach(o => {
                                        items.push("区间: " + $tool.timeSectionToStr(o.section));
                                        items.push("间隔: " + o.interval + "分钟");
                                        items.push(split_line);
                                    });
                                    return items.length > 1 ? items : ["列表为空"];
                                })(),
                            });
                            diag_restore_list.on("positive", () => diag_restore_list.dismiss());
                            diag_restore_list.show();
                        });
                        diag.on("negative", () => diag.dismiss());
                        diag.on("positive", () => {
                            let list_page_view = $view.findViewByTag(parent_view, "list_page_view");
                            diag.dismiss();
                            $view.updateDataSource(data_source_key_name, "splice", 0);

                            let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                            let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                            sess_par[deleted_items_idx] = {};
                            sess_par[deleted_items_idx_count] = 0;
                            let remove_btn = parent_view._text_remove.getParent();
                            remove_btn.switch_off();
                            btn_view.switch_off();
                            list_data_backup.forEach(value => $view.updateDataSource(data_source_key_name, "update", value));
                            list_page_view._check_all.setChecked(true);
                            list_page_view._check_all.setChecked(false);
                        });
                        diag.show();
                    }],
                    ["delete_forever", "REMOVE", "OFF", (btn_view) => {
                        let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                        let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";

                        if (!sess_par[deleted_items_idx_count]) return;

                        let thread_items_stable = threads.starts(function () {
                            let old_count = undefined;
                            while (sess_par[deleted_items_idx_count] !== old_count) {
                                old_count = sess_par[deleted_items_idx_count];
                                sleep(50);
                            }
                        });
                        thread_items_stable.join(800);

                        let deleted_items_idx_keys = Object.keys(sess_par[deleted_items_idx]);
                        deleted_items_idx_keys.sort((a, b) => +a < +b ? 1 : -1).forEach(idx => sess_par[deleted_items_idx][idx] && sess_par[data_source_key_name].splice(idx, 1));
                        $view.updateDataSource(data_source_key_name, "rewrite");
                        sess_par[deleted_items_idx] = {};
                        sess_par[deleted_items_idx_count] = 0;

                        let list_page_view = $view.findViewByTag(parent_view, "list_page_view");
                        let restore_btn = parent_view._text_restore.getParent();
                        if (!equalObjects(sess_cfg[data_source_key_name], sto_cfg[data_source_key_name])) restore_btn.switch_on();
                        else restore_btn.switch_off();
                        list_page_view._check_all.setChecked(true);
                        list_page_view._check_all.setChecked(false);
                        btn_view.switch_off();
                    }],
                    ["add_circle", "NEW", "ON", (btn_view) => {
                        let diag_new_item = dialogs.builds([
                            "添加延时接力数据", "设置新的时间区间及间隔\n点击可编辑对应项数据",
                            0, "放弃添加", "确认添加", 1,
                        ], {items: ["\xa0"]});

                        refreshItems();

                        diag_new_item.on("positive", () => {
                            let sectionStringTransform = () => {
                                let arr = $cfg.list_heads[data_source_key_name];
                                for (let i = 0, len = arr.length; i < len; i += 1) {
                                    let o = arr[i];
                                    if ("section" in o) return o.stringTransform;
                                }
                            };
                            $view.updateDataSource(data_source_key_name, "update", {
                                section: sectionStringTransform().backward(diag_new_item.getItems().toArray()[0].split(": ")[1]),
                                interval: +diag_new_item.getItems().toArray()[1].split(": ")[1],
                            });
                            setTimeout(function () {
                                parent_view.getParent()._list_data.smoothScrollBy(0, -Math.pow(10, 5));
                            }, 200);
                            let restore_btn = sess_par[data_source_key_name + "_btn_restore"];
                            equalObjects(sess_cfg[data_source_key_name], sto_cfg[data_source_key_name]) ? restore_btn.switch_off() : restore_btn.switch_on();
                            $save.session(data_source_key_name, sess_cfg[data_source_key_name]);
                            diag_new_item.dismiss();
                        });
                        diag_new_item.on("negative", () => diag_new_item.dismiss());
                        diag_new_item.on("item_select", (idx, list_item, dialog) => {
                            let list_item_prefix = list_item.split(": ")[0];
                            let list_item_content = list_item.split(": ")[1];

                            if (list_item_prefix === "区间") {
                                diag_new_item.dismiss();
                                $view.setTimePickerView({
                                    picker_views: [
                                        {type: "time", text: "设置开始时间", init: $tool.timeStrToSection(list_item_content)[0]},
                                        {type: "time", text: "设置结束时间", init: $tool.timeStrToSection(list_item_content)[1]},
                                    ],
                                    time_str: {
                                        suffix: (getStrFunc) => {
                                            if (getStrFunc(2).default() <= getStrFunc(1).default()) return "(+1)";
                                        },
                                    },
                                    onFinish: (return_value) => {
                                        diag_new_item.show();
                                        return_value && refreshItems(list_item_prefix, return_value);
                                    },
                                });
                            }

                            if (list_item_prefix === "间隔") {
                                let diag = dialogs.builds(["修改" + list_item_prefix, "", 0, "返回", "确认修改", 1], {
                                    inputHint: "{x|1<=x<=600,x∈N}",
                                    inputPrefill: list_item_content.toString(),
                                });
                                diag.on("negative", () => diag.dismiss());
                                diag.on("positive", dialog => {
                                    let input = diag.getInputEditText().getText().toString();
                                    if (input === "") return dialog.dismiss();
                                    let value = +input;
                                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                                    if (value > 600 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                                    refreshItems(list_item_prefix, ~~value);
                                    diag.dismiss();
                                });
                                diag.show();
                            }
                        });
                        diag_new_item.show();

                        // tool function(s) //

                        function refreshItems(prefix, value) {
                            let value_obj = {};
                            let key_map = {
                                0: "区间",
                                1: "间隔",
                            };
                            if (!prefix && !value) {
                                value_obj = {};
                                value_obj[key_map[0]] = "06:30 - 00:00 (+1)";
                                value_obj[key_map[1]] = 60;
                            } else {
                                diag_new_item.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                            }
                            if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                            let items = [];
                            Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                            diag_new_item.setItems(items);
                        }
                    }]
                );
            },
            setTimersControlPanelPageButtons: function (parent_view, data_source_key_name, wizardFunc) {
                return $view.setButtons(parent_view, data_source_key_name,
                    ["add_circle", "NEW", "ON", (btn_view) => wizardFunc("add")]
                );
            },
            checkPageState: function () {
                let _last_rolling = getLastRollingPage();
                _last_rolling = _last_rolling || (() => true);
                return _last_rolling.checkPageState();
            },
            checkDependency: function (view, dependencies, params) {
                params = params || {};
                let deps = dependencies;
                let check_dependence_result = (() => {
                    if (typeof dependencies === "function") return dependencies();
                    if (!classof(deps, "Array")) deps = [deps];
                    for (let i = 0, len = deps.length; i < len; i += 1) {
                        if (sess_cfg[deps[i]]) return true;
                    }
                })();

                check_dependence_result ? setViewEnabled(view) : setViewDisabled(view, deps, params);

                // tool function(s) //

                function setViewDisabled(view, deps, params) {
                    let {title} = sess_par;
                    let hint_text = params.hint_text || "";
                    if (!hint_text && classof(deps, "Array")) {
                        deps.forEach(conj_text => hint_text += title[conj_text] + " ");
                        if (deps.length > 1) hint_text += "均";
                        hint_text = "不可用  [ " + hint_text + "未开启 ]";
                    }
                    view._hint.text(hint_text);
                    view._chevron_btn && view._chevron_btn.setVisibility(8);
                    view._title.setTextColor(colors.parseColor("#919191"));
                    view._hint.setTextColor(colors.parseColor("#b0b0b0"));
                    let next_page = view.getNextPage();
                    if (next_page) {
                        view.next_page_backup = next_page;
                        view.setNextPage(null);
                    }
                }

                function setViewEnabled(view) {
                    view._chevron_btn && view._chevron_btn.setVisibility(0);
                    view._title.setTextColor(colors.parseColor("#111111"));
                    view._hint.setTextColor(colors.parseColor("#888888"));
                    let {next_page_backup} = view;
                    next_page_backup && view.setNextPage(next_page_backup);
                }
            },
            collapseSoftKeyboard: function (view) {
                context.getSystemService(context.INPUT_METHOD_SERVICE).hideSoftInputFromWindow(view.getWindowToken(), 0);
            },
            commonItemBindCheckboxClickListener: function (checkbox_view, item_holder) {
                let {data_source_key_name} = this;
                let remove_btn_view = sess_par[data_source_key_name + "_btn_remove"];
                let item = item_holder.item;
                let aim_checked = !item.checked;
                item.checked = aim_checked;
                let idx = item_holder.position;
                let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                sess_par[deleted_items_idx] = sess_par[deleted_items_idx] || {};
                sess_par[deleted_items_idx_count] = sess_par[deleted_items_idx_count] || 0;
                sess_par[deleted_items_idx][idx] = aim_checked;
                aim_checked ? sess_par[deleted_items_idx_count]++ : sess_par[deleted_items_idx_count]--;
                sess_par[deleted_items_idx_count] ? remove_btn_view.switch_on() : remove_btn_view.switch_off();
                let _sess_len = sess_cfg[data_source_key_name].length;
                this.view._check_all.setChecked(sess_par[deleted_items_idx_count] === _sess_len);
            },
            findViewByTag: function (parent_view, tag_name, level) {
                parent_view = parent_view.getParent() || parent_view;
                level = level || 0;
                if (!tag_name) return;
                let len = parent_view.getChildCount();
                for (let i = 0; i < len; i += 1) {
                    let aim_view = parent_view.getChildAt(i);
                    if (aim_view.findViewWithTag(tag_name)) {
                        if (level-- > 0) return $view.findViewByTag(aim_view, tag_name, level);
                        return aim_view;
                    }
                }
                return parent_view;
            },
            flushPagesBuffer: function () {
                let {sub_page_views, pages_buffer_obj} = global;
                let {pages_tree} = $cfg;
                let _emit;
                let _pages_buffer = [];
                let _pages_buffered_name = {};
                traversePage(pages_buffer_obj, pages_tree); // `_pages_buffer` will be updated
                _pages_buffer.forEach(f => sub_page_views.push(f));

                (_emit = () => listener.emit("sub_page_views_add"))();

                let interval_add_sub_page = setInterval(function () {
                    let i = sess_par.sub_page_view_idx;
                    let j = sub_page_views.length;
                    i < j ? _emit() : clearInterval(interval_add_sub_page);
                }, 50);

                // tool function(s) //

                function traversePage(pages, tree) {
                    /*
                     * traverse the page views by BFS (Breadth-First-Search) algorithm
                     * and put all nodes into _pages_buffer[] in traversed order
                     */
                    let sub_trees = [];
                    let keys = Object.keys(tree);
                    for (let i = 0, len = keys.length; i < len; i += 1) {
                        let key = keys[i];
                        if (key in pages && !(key in _pages_buffered_name)) {
                            _pages_buffer.push(pages[key]);
                            _pages_buffered_name[key] = true;
                        }
                        let sub_tree = (tree[key]);
                        if (classof(sub_tree, "Object")) sub_trees.push(sub_tree);
                    }
                    if (sub_trees.length) sub_trees.forEach(sub_tree => traversePage(pages, sub_tree));
                }
            },
            updateDataSource: function (data_source_key_name, operation, data_params, quiet_flag, no_rewrite_flag) {
                let {list_heads} = $cfg;
                if (operation.match(/init/)) {
                    let ori_data_source = data_params // custom data source
                        || sess_cfg[data_source_key_name]
                        || sess_par[data_source_key_name];
                    ori_data_source = typeof ori_data_source === "function" ? ori_data_source() : ori_data_source;
                    for (let i = 0, len = list_heads[data_source_key_name].length; i < len; i += 1) {
                        let sort_prop = list_heads[data_source_key_name][i].sort;
                        if (sort_prop) {
                            let need_sorted_list_head_name = Object.keys(list_heads[data_source_key_name][i])[0];
                            ori_data_source.sort((a, b) => {
                                let _a = a[need_sorted_list_head_name];
                                let _b = b[need_sorted_list_head_name];
                                return (sort_prop > 0 ? _a > _b : _a < _b) ? 1 : -1;
                            });
                            break;
                        }
                    }
                    if (operation.match(/re/)) {
                        if (!sess_par[data_source_key_name]) sess_par[data_source_key_name] = [];
                        sess_par[data_source_key_name].splice(0);
                        return ori_data_source.map(magicData).forEach(value => sess_par[data_source_key_name].push(value));
                    }
                    return sess_par[data_source_key_name] = ori_data_source.map(magicData);
                }

                if (operation === "rewrite") return rewriteToSessionConfig();

                if (operation.match(/delete|splice/)) {
                    let _data_params = classof(data_params, "Array") ? data_params.slice() : [data_params];
                    if (_data_params.length > 2 && !_data_params[2].list_item_name_0) _data_params[2] = magicData(_data_params[2]);
                    Array.prototype.splice.apply(sess_par[data_source_key_name], _data_params);
                    return rewriteToSessionConfig();
                }

                if (operation.match(/update/)) {
                    if (data_params && !classof(data_params, "Array")) data_params = [data_params];
                    let arr_unshift_flag = operation.match(/unshift|beginning/);

                    if (!sess_par[data_source_key_name]) sess_par[data_source_key_name] = [];
                    data_params.map(magicData).forEach(value => {
                        // {name: 1, age: 2};
                        let arr = sess_par[data_source_key_name];
                        arr_unshift_flag ? arr.unshift(value) : arr.push(value);
                    });

                    return rewriteToSessionConfig();
                }

                // tool function(s) //

                function magicData(obj) {
                    let final_o = {};
                    list_heads[data_source_key_name].forEach((o, i) => {
                        let list_item_name = Object.keys(o).filter(key => typeof o[key] === "string")[0];
                        let list_item_value = obj[list_item_name];
                        final_o["list_item_name_" + i] = o.stringTransform
                            ? o.stringTransform.forward.bind(obj)(list_item_value)
                            : list_item_value;
                        final_o[list_item_name] = "list_item_name_" + i; // backup
                        final_o["width_" + i] = o.width ? cX(o.width) + "px" : -2;
                    });
                    Object.keys(obj).forEach(key => {
                        if (!(key in final_o)) final_o[key] = obj[key];
                    });
                    return final_o;
                }

                function rewriteToSessionConfig() {
                    if (no_rewrite_flag) return;

                    sess_cfg[data_source_key_name] = [];

                    let session_data = sess_par[data_source_key_name];
                    if (!session_data.length) return $save.session(data_source_key_name, [], quiet_flag);

                    let new_data = [];
                    session_data.forEach((obj) => {
                        let final_o = deepCloneObject(obj);
                        Object.keys(final_o).forEach((key) => {
                            if (final_o[key] in final_o) {
                                let useless_name = final_o[key];
                                final_o[key] = final_o[final_o[key]];
                                delete final_o[useless_name];
                            }
                            if (key.match(/^width_\d$/)) final_o[key] = undefined;
                        });

                        let list_head_objs = list_heads[data_source_key_name] || [];
                        list_head_objs.forEach((o) => {
                            if ("stringTransform" in o) {
                                let aim_key = Object.keys(o).filter((key => typeof o[key] === "string"))[0];
                                let {backward} = o.stringTransform;
                                if (backward === "__delete__") delete final_o[aim_key];
                                else if (typeof backward === "function") final_o[aim_key] = backward.bind(final_o)(final_o[aim_key]);
                            }
                        });

                        new_data.push(Object.assign({}, final_o)); // to remove undefined items
                    });
                    $save.session(data_source_key_name, new_data, quiet_flag);
                }
            },
            updateViewByLabel: function (view_label) {
                ui.post(() => global.dynamic_views
                    .filter(view => view.view_label === view_label)
                    .forEach(view => view.updateOpr(view))
                );
            },
            showOrHideBySwitch: function (view, state, hide_when_checked, nearest_end_view_tag_name) {
                hide_when_checked = !!hide_when_checked; // boolean
                state = !!state; // boolean

                let switch_state_key_name = view.config_conj + "_switch_states";
                if (!sess_par[switch_state_key_name]) sess_par[switch_state_key_name] = [];

                let myself = view.view;
                let parent = myself.getParent();
                let myself_index = parent.indexOfChild(myself);
                let child_count = parent.getChildCount();

                while (++myself_index < child_count) {
                    let child_view = parent.getChildAt(myself_index);
                    if (nearest_end_view_tag_name && child_view.findViewWithTag(nearest_end_view_tag_name)) break;
                    state === hide_when_checked ? hide(child_view) : reveal(child_view);
                }

                // tool function(s) //

                function hide(view) {
                    sess_par[switch_state_key_name].push(view.visibility);
                    view.setVisibility(8);
                }

                function reveal(view) {
                    if (!sess_par[switch_state_key_name].length) return;
                    view.setVisibility(sess_par[switch_state_key_name].shift());
                }
            },
            weakOrStrongBySwitch: function (view, state, view_index_padding) {
                if (!classof(view_index_padding, "Array")) {
                    view_index_padding = [view_index_padding || 1];
                }
                let myself = view.view;
                let parent = myself.getParent();
                let current_child_index = parent.indexOfChild(myself);
                view_index_padding.forEach(padding => {
                    let radio_group_view = parent.getChildAt(current_child_index + padding).getChildAt(0);
                    for (let i = 0, len = radio_group_view.getChildCount(); i < len; i += 1) {
                        let radio_view = radio_group_view.getChildAt(i);
                        radio_view.setClickable(state);
                        radio_view.setTextColor(colors.parseColor(state ? "#000000" : "#b0bec5"));
                    }
                });
            },
        };

        $save = {
            check: () => !equalObjects(sess_cfg, sto_cfg),
            session: (key, value, quiet_flag) => {
                if (key !== undefined) sess_cfg[key] = value;
                if (quiet_flag) return;
                listener.emit("update_all");
                // "SAVE" button in homepage may need some time to be effective
                threads.starts(function () {
                    let btn_save = null;
                    waitForAction(() => btn_save = sess_par["homepage_btn_save"], 10000, 80);
                    ui.post(() => $save.check() ? btn_save.switch_on() : btn_save.switch_off());
                });
            },
            config: () => {
                let sess_cfg_mixed = deepCloneObject(sess_cfg);
                writeUnlockStorage();
                writeBlacklist();
                writeProjectBackupInfo();
                $sto.cfg.put("config", sess_cfg_mixed); // only "cfg" reserved now (without unlock, blacklist, etc)
                sto_cfg = deepCloneObject(sess_cfg);
                return true;

                // tool function(s) //

                function writeUnlockStorage() {
                    let ori_config = deepCloneObject($sto.def.unlock);
                    let tmp_config = {};
                    for (let i in ori_config) {
                        if (ori_config.hasOwnProperty(i)) {
                            tmp_config[i] = sess_cfg[i];
                            delete sess_cfg_mixed[i];
                        }
                    }
                    $sto.unlock.put("config", Object.assign({}, $sto.unlock.get("config", {}), tmp_config));
                }

                function writeBlacklist() {
                    let blacklist = {};
                    let blacklist_by_user = sess_cfg_mixed.blacklist_by_user;
                    blacklist_by_user.forEach(o => {
                        blacklist[o.name] = {
                            reason: "by_user",
                            timestamp: o.timestamp,
                        }
                    });
                    let blacklist_protect_cover = sess_cfg_mixed.blacklist_protect_cover;
                    blacklist_protect_cover.forEach(o => {
                        let name = o.name;
                        blacklist[name] = blacklist[name] || {
                            reason: "protect_cover",
                            timestamp: o.timestamp,
                        }
                    });
                    $sto.af.put("blacklist", blacklist);
                    delete sess_cfg_mixed.blacklist_protect_cover;
                    delete sess_cfg_mixed.blacklist_by_user;
                }

                function writeProjectBackupInfo() {
                    $sto.af.put("project_backup_info", sess_cfg_mixed.project_backup_info);
                    delete sess_cfg_mixed.project_backup_info;
                }
            },
        };

        $tool = {
            getConverter: function (pickup) {
                let converters = {
                    bytes: (src, init_unit, override) => parser(
                        src, init_unit,
                        Object.assign(new _ConverterFactory(
                            [1024, 1000],
                            ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
                        ), override || {})),
                    time: (src, init_unit, override) => parser(
                        src, init_unit,
                        Object.assign(new _ConverterFactory(
                            60,
                            ["ms", 1000, "s", "m", "h", 24, "d"]
                        ), override || {})),
                };

                return pickup ? converters[pickup] : converters;

                // constructor //

                function _ConverterFactory(step, units) {
                    if (typeof step === "object" /* Array */) {
                        step.sort((a, b) => a > b ? -1 : 1);
                        this.step = step[0];
                        this.potential_step = step[1];
                    } else {
                        this.step = step;
                    }
                    this.units = units;
                }

                // tool function(s) //

                function parser(src, init_unit, params) {
                    src = parseInt(src);

                    let {step, potential_step, units, show_space} = params;

                    let unit_map = {};
                    unit_map[units[0]] = [1, 1];

                    let accumulated_step = 1;
                    let tmp_potential_value;

                    for (let i = 1, len = units.length; i < len; i += 1) {
                        tmp_potential_value = potential_step ? accumulated_step : 0;
                        let unit = units[i];

                        if (typeof unit === "number") {
                            tmp_potential_value = accumulated_step * (potential_step || unit);
                            accumulated_step *= unit;
                            unit = units[++i];
                        } else if (typeof unit === "object" /* Array */) {
                            let _steps = unit.sort((a, b) => a > b ? -1 : 1);
                            tmp_potential_value = accumulated_step * _steps[1];
                            accumulated_step *= _steps[0];
                            unit = units[++i];
                        } else {
                            tmp_potential_value = accumulated_step * (potential_step || step);
                            accumulated_step *= step;
                        }
                        unit_map[unit] = tmp_potential_value ? [accumulated_step, tmp_potential_value] : [accumulated_step, accumulated_step];
                    }

                    init_unit = init_unit || units[0];
                    if (~units.indexOf(init_unit)) {
                        src *= unit_map[init_unit][0];
                    }

                    let unit_keys = Object.keys(unit_map);
                    for (let i = unit_keys.length - 1; i >= 0; i -= 1) {
                        let unit_key = unit_keys[i];
                        let [unit_value, potential_value] = unit_map[unit_key];
                        if (src >= potential_value) {
                            return +(src / unit_value).toFixed(2) + (show_space ? " " : "") + unit_key;
                        }
                    }
                }
            },
            getLocalVerName: function (file) {
                try {
                    let _file = file || "./Ant_Forest_Launcher.js";
                    let _regexp = /version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/;
                    return "v" + files.read(_file).match(_regexp)[0].slice(8);
                } catch (e) {
                    return "v0.0.0";
                }
            },
            getTimeStrFromTimestamp: function (time_param, format_str) {
                let timestamp = +time_param;
                let time_str = "";
                let time_str_remove = "";
                let time = new Date();
                if (!timestamp) time_str = time_str_remove = "时间戳无效";
                if (timestamp === Infinity) time_str_remove = "永不";
                else if (timestamp <= time.getTime()) time_str_remove = "下次运行";
                let padZero = num => ("0" + num).slice(-2);
                if (!time_str) {
                    time.setTime(timestamp);
                    let yy = time.getFullYear();
                    let MM = padZero(time.getMonth() + 1);
                    let dd = padZero(time.getDate());
                    let hh = padZero(time.getHours());
                    let mm = padZero(time.getMinutes());
                    time_str = yy + "\/" + MM + "\/" + dd + " " + hh + ":" + mm;
                }

                return {
                    time_str: time_str,
                    time_str_full: time_str + ":" + padZero(time.getSeconds()),
                    time_str_remove: time_str_remove || time_str,
                    timestamp: timestamp,
                }[format_str || "time_str"];
            },
            getTimedTaskTypeStr: function (source) {
                if (classof(source, "Array")) {
                    if (source.length === 7) return "每日";
                    if (source.length) return "每周 [" + source.slice().map(x => x === 0 ? 7 : x).sort().join(",") + "]";
                }
                return source === 0 ? "一次性" : source;
            },
            getStepsDialog: function (title, steps, finished_str) {
                let initial_steps_str = "";
                steps.forEach((str, idx) => {
                    initial_steps_str += idx ? "\n" : "";
                    initial_steps_str += "\u3000\x20" + (idx + 1) + ".\x20" + str;
                });

                let dialog = dialogs.builds(
                    [title, initial_steps_str, 0, 0, "终止", 1],
                    {progress: {max: 100, showMinMax: false}}
                );

                let getStepsStrArrFromDiagContent = () => dialogs.getContentText(dialog).split("\n");

                dialog.__proto__ = dialog.__proto__ || {};
                Object.assign(dialog.__proto__, {
                    setProgressNum: function (num) {
                        let _num = parseInt(num);
                        if (!isNaN(_num) && _num > 0) {
                            threads.start(function () {
                                ui.post(() => dialog.setProgress(Math.min(100, _num)));
                            });
                        }
                    },
                    setStep: function (step_num) {
                        step_num = step_num || 1;
                        typeof step_num === "number" && step_num--;

                        let content = "";
                        if (step_num.toString().match(/^finish/)) {
                            getStepsStrArrFromDiagContent().forEach((str, idx) => {
                                content += (idx ? "\n" : "") + "\u2714" + str.slice(1);
                            });
                            content += "\n\n" + finished_str;
                            dialog.setProgressNum(100);
                            dialog.setActionButton("positive", "完成");
                        } else {
                            getStepsStrArrFromDiagContent().forEach((str, idx) => {
                                content += (idx ? "\n" : "") + (step_num === idx ? "\u25b6" : "\u3000") + str.slice(1);
                            });
                            dialog.setProgressNum(0);
                        }
                        dialog.setContent(content);
                    },
                    stepText: function (step_num, str, mode) {
                        mode = mode || "replace";
                        step_num = +step_num - 1;
                        if (isNaN(step_num)) return;

                        let diag_content = getStepsStrArrFromDiagContent();
                        for (let i = 0, len = diag_content.length; i < len; i += 1) {
                            if (i === step_num) {
                                diag_content[i] = (mode === "append" ? diag_content[i] : "") + str;
                                break;
                            }
                        }
                        dialog.setContent(diag_content.join("\n"));
                    }
                });

                return dialog;
            },
            getFetchedFile: function (backup_path, url, file_ext_name) {
                if (!url) return "";
                let fetched_file_name = "." + url.split("/").pop() + (file_ext_name || "");
                let fetched_file_path = backup_path + fetched_file_name;
                files.createWithDirs(fetched_file_path);
                return fetched_file_path;
            },
            getAllAppsJointStr: function (if_show_sys_app, excluded_data_arrays, force_refresh_flag) {
                let show_sys_app = typeof if_show_sys_app === "function" ? if_show_sys_app() : if_show_sys_app;
                if (show_sys_app !== false) show_sys_app = true;

                if (force_refresh_flag) {
                    delete sess_par.user_apps_joint_str_arr;
                    delete sess_par.all_apps_joint_str_arr;
                }

                excluded_data_arrays = excluded_data_arrays || [];
                let filterFunc = (str) => {
                    for (let i = 0, len = excluded_data_arrays.length; i < len; i += 1) {
                        if (~excluded_data_arrays[i].indexOf(str)) return false;
                    }
                    return true;
                };

                let {all_apps_joint_str_arr, user_apps_joint_str_arr} = sess_par;
                if (show_sys_app && all_apps_joint_str_arr) return all_apps_joint_str_arr.filter(filterFunc);
                if (!show_sys_app && user_apps_joint_str_arr) return user_apps_joint_str_arr.filter(filterFunc);

                let filtered_items = [];
                let all_items = [];
                let pkg_manager = context.getPackageManager();
                let pkg_list = pkg_manager.getInstalledPackages(0).toArray();
                if (pkg_list.length) {
                    pkg_list.forEach((o) => {
                        let pkg_info = pkg_manager.getPackageInfo(o.packageName, 0);
                        let pkg_name = o.packageName;
                        let {applicationInfo} = pkg_info;
                        let is_sys_app = (applicationInfo.flags & android.content.pm.ApplicationInfo.FLAG_SYSTEM) > 0;
                        let app_name = applicationInfo.loadLabel(pkg_manager).toString();
                        let joint_str = app_name + "\n" + pkg_name;
                        if (filterFunc(joint_str)) {
                            is_sys_app || filtered_items.push(joint_str);
                            all_items.push(joint_str);
                        }
                    });
                }
                sess_par.user_apps_joint_str_arr = filtered_items.sort();
                sess_par.all_apps_joint_str_arr = all_items.sort();

                return show_sys_app ? all_items : filtered_items;
            },
            backupProjectFiles: function (local_backup_path, version_name, dialog, auto_flag) {
                local_backup_path = local_backup_path || $defs.local_backup_path;
                version_name = version_name || $tool.getLocalVerName();
                let backup_src_map = {
                    Modules: "folder",
                    Tools: "folder",
                    Documents: "folder",
                    "Ant_Forest_Launcher.js": "file",
                    "Ant_Forest_Settings.js": "file",
                    "README.md": "file",
                };
                let now = new Date();
                let time_str = getTimeStr(now);
                let backup_dir = local_backup_path + "." + time_str + "/";
                for (let name in backup_src_map) {
                    if (backup_src_map.hasOwnProperty(name)) {
                        $tool.copyFolder(files.path("./") + name + (backup_src_map[name] === "folder" ? "/" : ""), backup_dir);
                    }
                }
                let zip_output_file_name = backup_dir.replace(/\/\.(.+?)\/$/, ($0, $1) => "/Ant_Forest_" + $1 + ".zip");
                if (!$tool.zip(backup_dir, zip_output_file_name, dialog)) return;
                let data_source_key_name = "project_backup_info";
                $view.updateDataSource(data_source_key_name, "update_unshift", {
                    file_name: files.getName(zip_output_file_name).replace(/\.zip$/, ""),
                    file_path: zip_output_file_name,
                    version_name: version_name,
                    timestamp: now.getTime(),
                    remark: auto_flag ? "自动备份" : (sess_par.project_backup_info_remark || "手动备份"),
                }, "quiet");
                $view.updateViewByLabel("restore_projects_from_local_page");

                let _sess = sess_cfg[data_source_key_name];
                let _sto = sto_cfg[data_source_key_name] = deepCloneObject(_sess);
                // write to storage right away
                $sto.af.put(data_source_key_name, deepCloneObject(_sto));

                delete sess_par.project_backup_info_remark;
                files.removeDir(backup_dir);
                if (!auto_flag) {
                    dialog.setContent("备份完成");
                    dialog.setActionButton("positive", "返回");
                }
                return true;

                // tool function(s) //

                function getTimeStr(time) {
                    let now = time || new Date();
                    let zeroPadding = num => ("0" + num).slice(-2);
                    return now.getFullYear() + zeroPadding(now.getMonth() + 1) + zeroPadding(now.getDate()) + "_" +
                        zeroPadding(now.getHours()) + zeroPadding(now.getMinutes()) + zeroPadding(now.getSeconds());
                }
            },
            restoreProjectFiles: function (source) {
                delete sess_par.sgn_intrpt_update;

                let mode = "local";
                if (source.toString().match(/^http/)) mode = "server";

                let conf = {
                    local: {
                        first_step_txt: "检查文件",
                        first_step_func: function () {
                            if (files.exists(source)) return remainingStepsForRestoring();
                            alertContent(diag_restoring, "恢复失败:\n文件不存在", "append");
                        },
                    },
                    server: {
                        first_step_txt: "下载项目数据包",
                        first_step_func: function () {
                            let fetched_file_path = $tool.getFetchedFile($defs.local_backup_path, source, ".zip");
                            $tool.okHttpRequest(source, fetched_file_path, {
                                onDownloadSuccess: () => {
                                    source = fetched_file_path;
                                    remainingStepsForRestoring();
                                },
                                onDownloading: diag_restoring.setProgressNum,
                                onDownloadFailed: operation => operation(),
                            }, {
                                dialog: diag_restoring,
                                dialogReceiver: $tool.appendHttpFileSizeToDialog,
                            });
                        },
                    }
                };

                let diag_restoring = $tool.getStepsDialog(
                    "恢复中",
                    [conf[mode].first_step_txt, "解压缩", "文件替换", "清理并完成项目恢复"],
                    "恢复完成"
                );
                diag_restoring.on("positive", () => {
                    sess_par.sgn_intrpt_update = true;
                    diag_restoring.dismiss();
                });
                diag_restoring.show();
                diag_restoring.setStep(1);
                conf[mode].first_step_func();

                // tool function(s) //

                function remainingStepsForRestoring() {
                    diag_restoring.setStep(2);
                    if (!$tool.unzip(source, "", false, diag_restoring)) return;
                    diag_restoring.setStep(3);
                    if (!$tool.copyFolder(sess_par.project_name_path, files.cwd() + "/", "inside")) return;
                    diag_restoring.setProgress(100);
                    diag_restoring.setStep(4);
                    files.removeDir(sess_par.project_name_path);
                    delete sess_par.project_name_path;
                    diag_restoring.setStep("finished");
                    $view.updateViewByLabel("about");
                }
            },
            restoreFromTimestamp: function (timestamp) {
                if (timestamp.match(/^\d{13}$/)) return +timestamp;
                if (timestamp === "永不") return Infinity;
                let time_nums = timestamp.split(/\D+/);
                return new Date(+time_nums[0], time_nums[1] - 1, +time_nums[2], +time_nums[3], +time_nums[4]).getTime();
            },
            restoreFromTimedTaskTypeStr: function (str) {
                if (str === "每日") return [0, 1, 2, 3, 4, 5, 6];
                if (str.match(/每周/)) return str.split(/\D/).filter(x => x !== "").map(x => +x === 7 ? 0 : +x).sort();
                return str === "一次性" ? 0 : str;
            },
            refreshFriendsListByLaunchingAlipay: function (params) {
                return dialogs.builds([
                    "提示", "此功能暂未完成新版蚂蚁森林控件的适配\n预计于 v1.9.10 Beta8 完成功能恢复",
                    0, 0, "返回", 1
                ]).on("positive", d => d.dismiss()).show();

                // let {dialog_prompt, onTrigger, onResume} = params || {};

                // if (dialog_prompt) {
                //     dialogs.builds([
                //         "刷新好友列表提示", "即将尝试打开\"支付宝\"\n自动获取最新的好友列表信息\n在此期间请勿操作设备",
                //         0, "放弃", "开始刷新", 1
                //     ]).on("negative", diag => {
                //         diag.dismiss();
                //     }).on("positive", diag => {
                //         diag.dismiss();
                //         refreshNow();
                //     }).show();
                // } else {
                //     refreshNow();
                // }

                // tool function(s) //

                function refreshNow() {
                    if (typeof onTrigger === "function") {
                        onTrigger();
                    }
                    engines.execScriptFile("./Ant_Forest_Launcher.js", {
                        arguments: {
                            cmd: "get_fri_list",
                            instant_run_flag: true,
                            no_insurance_flag: true,
                        },
                    });
                    threads.starts(function () {
                        waitForAndClickAction(text("打开"), 3500, 300, {click_strategy: "widget"});
                    });

                    if (typeof onResume === "function") {
                        ui.emitter.prependOnceListener("resume", onResume);
                    }

                    setTimeout(function () {
                        toast("即将打开\"支付宝\"刷新好友列表");
                    }, 500);
                }
            },
            handleNewVersion: function (parent_dialog, file_content, newest_version_name, only_show_history_flag) {
                let url_server = "https://github.com/SuperMonster003/Auto.js_Projects/archive/Ant_Forest.zip";
                let fetched_file_path = $tool.getFetchedFile($defs.local_backup_path, url_server);
                handleFileContent(file_content);

                let steps_arr = ["下载项目数据包", "解压缩", "备份本地项目", "文件替换", "清理并完成部署"];
                let diag_download = $tool.getStepsDialog("正在部署项目最新版本", steps_arr, "更新完成");

                if (only_show_history_flag) return showUpdateHistories();

                let diag_update_positive_btn_text = $sto.af.get("update_dialog_prompt_prompted") ? "立即更新" : "开始更新";
                let diag_update_details = dialogs.builds([
                    newest_version_name, "正在获取版本更新信息...",
                    0, "返回", [diag_update_positive_btn_text, "attraction_btn_color"], 1,
                ]);
                diag_update_details.on("neutral", showUpdateHistories);
                diag_update_details.on("negative", () => {
                    diag_update_details.dismiss();
                    parent_dialog.show();
                });
                diag_update_details.on("positive", () => {
                    diag_update_details.dismiss();
                    showUpdateDialogPrompt(diag_update_details);
                });
                diag_update_details.show();

                // steps function(s) //

                function downloadArchive() {
                    delete sess_par.sgn_intrpt_update;
                    parent_dialog && parent_dialog.dismiss();

                    diag_download.setStep(1);
                    diag_download.on("positive", () => {
                        sess_par.sgn_intrpt_update = true;
                        diag_download.dismiss();
                    });
                    diag_download.show();

                    $tool.okHttpRequest(url_server, fetched_file_path, {
                        onDownloadSuccess: unzipArchive,
                        onDownloading: diag_download.setProgressNum,
                        onDownloadFailed: operation => operation(),
                    }, {
                        dialog: diag_download,
                        dialogReceiver: $tool.appendHttpFileSizeToDialog,
                    });
                }

                function unzipArchive() {
                    diag_download.setStep(2);
                    let {local_backup_path} = $defs;
                    let src = local_backup_path + ".Ant_Forest.zip";
                    if (!$tool.unzip(src, local_backup_path, false, diag_download)) return;
                    diag_download.setStep(3);
                    return backupProject();
                }

                function backupProject() {
                    return $tool.backupProjectFiles($defs.local_backup_path, null, diag_download, "auto") && replaceWithNewFiles();
                }

                function replaceWithNewFiles() {
                    diag_download.setStep(4);
                    if (!$tool.copyFolder(sess_par.project_name_path, files.cwd() + "/", "inside")) return;
                    diag_download.setProgressNum(100);
                    return cleanAndFinish();
                }

                function cleanAndFinish() {
                    diag_download.setStep(5);
                    files.removeDir(sess_par.project_name_path);
                    delete sess_par.project_name_path;
                    files.remove(fetched_file_path);
                    diag_download.setStep("finished");
                    $view.updateViewByLabel("about");
                    return true;
                }

                // tool function(s) //

                function showUpdateDialogPrompt(parent_dialog) {
                    let steps_str = steps_arr.join(" -> ");
                    let update_prompt_no_prompt_flag = $sto.af.get("update_dialog_prompt_prompted", false);
                    if (update_prompt_no_prompt_flag) return downloadArchive();

                    let diag_update_prompt = dialogs.builds([
                        "更新提示", "1. 更新过程中 本地项目将会被备份 可用于更新撤回/用户自行恢复数据/自定义代码的复原等操作\n" +
                        "2. 整个更新过程将按照以下步骤执行: " + steps_str,
                        [0, "hint_btn_bright_color"], "返回", ["立即更新", "attraction_btn_color"], 1, 1,
                    ]);
                    diag_update_prompt.on("check", checked => update_prompt_no_prompt_flag = !!checked);
                    diag_update_prompt.on("negative", () => {
                        diag_update_prompt.dismiss();
                        parent_dialog.show();
                    });
                    diag_update_prompt.on("positive", () => {
                        if (update_prompt_no_prompt_flag) $sto.af.put("update_dialog_prompt_prompted", true);
                        diag_update_prompt.dismiss();
                        downloadArchive();
                    });
                    diag_update_prompt.show();
                }

                function handleFileContent(file_content) {
                    if (!file_content) return;
                    let updateDialogUpdateDetails = () => {
                        if (only_show_history_flag) return;
                        ui.post(() => {
                            diag_update_details.getContentView().setText(sess_par.update_info[newest_version_name]);
                            diag_update_details.setActionButton("neutral", "查看历史更新");
                        });
                    };
                    if (Object.keys(sess_par.update_info || {}).length) return updateDialogUpdateDetails();

                    threads.starts(function () {
                        let info = {};
                        let regexp_version_name = /# v\d+\.\d+\.\d+.*/g;
                        let regexp_remove_info = new RegExp(
                            /^(\s*\n\s*)+/.source // starts with multi blank lines
                            + "|" + /(# *){3,}/.source // over three hash symbols
                            + "|" + / +(?=\s+)/.source // ends with blank spaces in a single line
                            + "|" + /.*~~.*/.source // markdown strikethrough
                            + "|" + /.*`灵感`.*/.source // lines with inspiration label
                            + "|" + /\(http.+?\)/.source // URL content (not the whole line)
                            + "|" + /\[\/\/]:.+\(\n*.+?\n*\)/.source // markdown comments
                            , "g" // global flag
                        );
                        let version_names = file_content.match(regexp_version_name);
                        let version_infos = file_content.split(regexp_version_name);
                        version_names.forEach((name, idx) => {
                            info["v" + name.split("v")[1]] = version_infos[idx + 1]
                                .replace(/ ?_\[`(issue )?#(\d+)`]\(http.+?\)_ ?/g, "[$2]") // issues
                                .replace(regexp_remove_info, "")
                                .replace(/(\[(\d+)])+/g, $0 => " " + $0.split(/]\[/).join(",").replace(/\d+/g, $0 => "#" + $0))
                                .replace(/(\s*\n\s*){2,}/g, "\n");
                        });
                        sess_par.update_info = info;
                        updateDialogUpdateDetails();
                    });
                }

                function showUpdateHistories() {
                    let diag_update_histories = dialogs.builds(["历史更新", "正在处理中...", 0, 0, "返回", 1]);
                    diag_update_histories.on("positive", () => diag_update_histories.dismiss());
                    diag_update_histories.show();

                    threads.starts(function () {
                        let str = "";
                        let update_info_keys = null;
                        if (waitForAction(() => (update_info_keys = Object.keys(sess_par.update_info || {})).length, 5000)) {
                            update_info_keys.forEach((ver_name) => str += ver_name + "\n" + sess_par.update_info[ver_name] + "\n");
                        } else str = "获取历史更新信息失败..";
                        ui.post(() => diag_update_histories.getContentView().setText(str.slice(0, -2)));
                    });
                }
            },
            zip: function (input_path, output_path, dialog) {
                if (typeof global.sess_par === "undefined") global.sess_par = {};

                delete sess_par.sgn_intrpt_update;

                let {BufferedInputStream, File, FileInputStream, FileOutputStream} = java.io;
                let {CRC32, CheckedOutputStream, ZipEntry, ZipOutputStream} = java.util.zip;

                let [checked_output_stream, zip_output_stream] = [null, null];
                let [total_file_size, compressed_size] = [0, 0];

                let separator = File.separator;
                let separator_len = separator.length;

                try {
                    if (!files.exists(input_path = files.path(input_path))) throw "无效的压缩源";
                    let input_file = new File(input_path);
                    input_path = input_file.getAbsolutePath(); // "./BAK" or "./BAK/bak.txt" but not "./BAK/"
                    let input_path_len = input_path.length;

                    let output_path_bak = output_path || input_file.getName();
                    let output_file = new File(output_path || input_path);
                    output_path = output_file.getAbsolutePath();

                    if (!~output_path_bak.indexOf(separator)) {
                        output_path = input_path.slice(0, input_path.lastIndexOf(separator) + separator_len) + output_path_bak;
                    }
                    if (output_path.slice(0, input_path_len) === input_path) {
                        if (output_path[input_path_len] === separator) {
                            throw "压缩目标与压缩源路径冲突";
                        }
                    }
                    if (output_path.slice(-4) !== ".zip") {
                        output_path += ".zip";
                    }

                    output_file = new File(output_path); // refresh file as path may be modified

                    if (files.exists(output_path)) files.remove(output_path);
                    files.createWithDirs(output_path);

                    total_file_size = getPathTotalSize(input_path);

                    checked_output_stream = new CheckedOutputStream(new FileOutputStream(output_file), new CRC32());
                    zip_output_stream = new ZipOutputStream(checked_output_stream);

                    let source_path = input_path;
                    if (input_file.isFile()) {
                        let index = input_path.lastIndexOf(separator);
                        if (~index) source_path = input_path.substring(0, index);
                    }

                    compress(source_path, input_file, zip_output_stream);
                    zip_output_stream.flush();

                    dialog && dialog.setProgress(100);
                    return true;
                } catch (e) {
                    if (dialog) alertContent(dialog, "压缩失败:\n" + e, "append");
                    else throw e;
                } finally {
                    zip_output_stream && zip_output_stream.close();
                }

                // tool function(s) //

                function compress(source_path, input_file, zip_output_stream) {
                    if (input_file == null) return;

                    if (input_file.isFile()) {
                        let read_bytes;
                        let buffer_len = 1024;
                        let buffer_bytes = util.java.array("byte", buffer_len);

                        let sub_path = new File(source_path).getName() + separator + input_file.getAbsolutePath();
                        let index = sub_path.indexOf(source_path);
                        if (~index) sub_path = sub_path.substring(source_path.length + separator_len);

                        let entry = new ZipEntry(sub_path);
                        zip_output_stream.putNextEntry(entry);

                        let buffered_input_stream = new BufferedInputStream(new FileInputStream(input_file));
                        while (~(read_bytes = buffered_input_stream.read(buffer_bytes, 0, buffer_len))) {
                            zip_output_stream.write(buffer_bytes, 0, read_bytes);
                        }
                        buffered_input_stream.close();
                        zip_output_stream.closeEntry();

                        if (dialog) {
                            compressed_size += input_file.length();
                            dialog.setProgress(compressed_size / total_file_size * 100);
                        }
                    } else {
                        let input_file_list = input_file.listFiles();
                        for (let i = 0, len = input_file_list.length; i < len; i += 1) {
                            input_file_list[i].getAbsolutePath().indexOf(input_file.getAbsolutePath());
                            compress(source_path, input_file_list[i], zip_output_stream);
                        }
                    }
                }

                function getPathTotalSize(path) {
                    let size = 0;
                    handleFolder(path);
                    return size;

                    // tool function(s) //

                    function handleFolder(path) {
                        path = path.toString();
                        let abs_path_prefix = path + (path.match(/\/$/) ? "" : "/");
                        files.listDir(path).forEach((list_file_name) => {
                            let abs_path = abs_path_prefix + list_file_name;
                            files.isDir(abs_path) ? handleFolder(abs_path) : size += java.io.File(abs_path).length();
                        });
                    }
                }
            },
            unzip: function (input_path, output_path, include_zip_file_name, dialog) {
                if (typeof global.sess_par === "undefined") global.sess_par = {};

                delete sess_par.sgn_intrpt_update;

                let {BufferedInputStream, BufferedOutputStream, File, FileOutputStream} = java.io;
                let {ZipFile} = java.util.zip;
                let {StringUtils} = org.apache.commons.lang3;

                let [total_file_size, uncompressed_size] = [0, 0];

                let separator = File.separator;

                try {
                    input_path = files.path(input_path);
                    if (!files.exists(input_path)) {
                        input_path += ".zip";
                        if (!files.exists(input_path)) {
                            throw "解压缩源不存在";
                        }
                    }
                    let input_file = new File(input_path);
                    total_file_size += input_file.length();

                    output_path = output_path ? files.path(output_path) : input_path.slice(0, input_path.lastIndexOf(separator));

                    if (include_zip_file_name) {
                        let input_file_name = input_file.getName();
                        if (StringUtils.isNotEmpty(input_file_name)) {
                            input_file_name = input_file_name.substring(0, input_file_name.lastIndexOf("."));
                        }
                        output_path = output_path + separator + input_file_name;
                    }

                    files.createWithDirs(output_path + separator);

                    let [
                        entry_element, entry_file_path, entry_file,
                        buffered_input_stream, buffered_output_stream
                    ] = Array(5).join("|").split("|").map(() => null);

                    let read_bytes;
                    let buffer_len = 1024;
                    let buffer_bytes = util.java.array("byte", buffer_len);

                    let zip_input_file = new ZipFile(input_file);
                    let entries = zip_input_file.entries();

                    while (entries.hasMoreElements()) {
                        entry_element = entries.nextElement();
                        let entry_element_name = entry_element.getName();
                        if (!sess_par.project_name_path) {
                            let _idx = entry_element_name.indexOf(separator);
                            let _path = ~_idx ? entry_element_name.slice(0, _idx) : entry_element_name;
                            sess_par.project_name_path = output_path + separator + _path + separator;
                        }
                        files.createWithDirs(entry_file_path = files.path(output_path + separator + entry_element_name));
                        entry_file = new File(entry_file_path);
                        if (entry_file.isDirectory()) continue;

                        buffered_output_stream = new BufferedOutputStream(new FileOutputStream(entry_file));
                        buffered_input_stream = new BufferedInputStream(zip_input_file.getInputStream(entry_element));
                        while (~(read_bytes = buffered_input_stream.read(buffer_bytes, 0, buffer_len))) {
                            if (sess_par.sgn_intrpt_update) {
                                sess_par.sgn_intrpt_update = false;
                                throw "用户终止";
                            }
                            buffered_output_stream.write(buffer_bytes, 0, read_bytes);
                        }
                        buffered_output_stream.flush();
                        buffered_output_stream.close();

                        if (dialog) {
                            uncompressed_size += entry_file.length();
                            dialog.setProgressNum(uncompressed_size / total_file_size * 100);
                        }
                    }

                    return true;
                } catch (e) {
                    if (dialog) alertContent(dialog, "解压失败:\n" + e, "append");
                    else throw e;
                }
            },
            okHttpRequest: function (url, path, listener, params) {
                delete sess_par.sgn_intrpt_update;

                params = params || {};
                let {extra_headers, dialog, dialogReceiver} = params;

                let total_bytes = threads.atomic(params.total_bytes || -1);
                let availTotalBytes = () => {
                    let _value = total_bytes.get();
                    return _value && ~_value;
                };
                let checkContentLenAndSetDiagReceiver = (content_len) => {
                    if (content_len > 0 && total_bytes.compareAndSet(-1, content_len)) {
                        if (typeof dialogReceiver === "function") dialogReceiver(dialog, content_len);
                    }
                };

                let thread_get_total_bytes_bt_http = threads.start(function () {
                    if (typeof http !== "undefined") {
                        while (!availTotalBytes()) {
                            try {
                                checkContentLenAndSetDiagReceiver(
                                    // FIXME returns -1 from time to time [:face_with_head_bandage:]
                                    http.get(url).headers["Content-Length"]
                                );
                            } catch (e) {
                                sleep(200);
                            }
                        }
                    }
                });

                let thread_get_total_bytes_by_url_conn = threads.start(function () {
                    while (!availTotalBytes()) {
                        try {
                            let conn = new java.net.URL(url).openConnection();
                            conn.setRequestProperty("Accept-Encoding", "identity");

                            checkContentLenAndSetDiagReceiver(
                                // FIXME returns -1 from time to time [:face_with_head_bandage:]
                                conn.getContentLengthLong()
                            );
                            conn.disconnect();
                        } catch (e) {
                            sleep(200);
                        }
                    }
                });

                threads.start(function () {
                    let [len, input_stream, output_stream] = [];
                    let input_stream_len = 0;
                    // let buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 2048);
                    let buffer = util.java.array('byte', 2048);

                    let {Request, Callback} = Packages.okhttp3;
                    let client = new OkHttpClient();
                    let builder = new Request.Builder();
                    if (extra_headers) {
                        let keys = Object.keys(extra_headers);
                        for (let i = 0, len = keys.length; i < len; i += 1) {
                            let key = keys[i];
                            builder.addHeader(key, extra_headers[key]);
                        }
                    }
                    let request = builder.url(url).get().build();
                    let callback = new Callback({
                        onFailure: (call, err) => {
                            dialog.setActionButton("positive", "返回");
                            alertContent(dialog, "请求失败: \n" + err, "append");
                        },
                        onResponse: (call, res) => {
                            try {
                                let res_code = res.code();
                                if (res_code !== 200) throw res_code + " " + res.message();

                                input_stream = res.body().byteStream();
                                output_stream = new java.io.FileOutputStream(new java.io.File(path));
                                availTotalBytes() || checkContentLenAndSetDiagReceiver(
                                    // FIXME returns -1 from time to time [:face_with_head_bandage:]
                                    res.body().contentLength()
                                );

                                while (~(len = input_stream.read(buffer))) {
                                    if (sess_par.sgn_intrpt_update) {
                                        sess_par.sgn_intrpt_update = false;
                                        files.remove(path);
                                        input_stream.close();
                                        throw("用户终止");
                                    }
                                    output_stream.write(buffer, 0, len);
                                    input_stream_len += len;
                                    if (availTotalBytes()) {
                                        listener.onDownloading(input_stream_len / total_bytes * 100);
                                    }
                                }
                                output_stream.flush();
                                listener.onDownloadSuccess();
                            } catch (err) {
                                listener.onDownloadFailed(() => alertContent(dialog, err.toString().replace(/^Error: ?/, ""), "append"));
                            } finally {
                                try {
                                    thread_get_total_bytes_bt_http.interrupt();
                                    thread_get_total_bytes_by_url_conn.interrupt();
                                    if (input_stream !== null) input_stream.close();
                                } catch (err) {
                                    alertContent(dialog, "文件流处理失败:\n" + err, "append");
                                }
                            }
                        },
                    });
                    client.newCall(request).enqueue(callback);
                });
            },
            copyFolder: function (src, target, inside_flag) {
                files.create(target);
                if (files.isDir(src)) {
                    files.listDir(src).forEach((item) => {
                        let _src = src + item + (files.isDir(item) ? "/" : "");
                        let _target = target + (inside_flag ? "" : files.getName(src) + "/");
                        $tool.copyFolder(_src, _target);
                    });
                } else {
                    files.copy(src, target + files.getName(src));
                }
                return true;
            },
            accountNameConverter: function (str, opr_name) {
                if (!str) return "";
                let arr = str.toString().split("");
                arr.forEach((value, idx, arr) => {
                    arr[idx] = unescape(
                        "%u" + ("0000" + (
                            value.charCodeAt(0) + (996 + idx) * {encrypt: 1, decrypt: -1}[opr_name]
                        ).toString(16)).slice(-4)
                    );
                });
                return arr.join("");
            },
            appendHttpFileSizeToDialog: function (dialog, content_len) {
                let content_view = dialog.getContentView();
                let content_text = content_view.getText().toString();
                let to_match_str = "下载项目数据包";
                if (content_text.match(to_match_str)) {
                    let replaced_str = surroundWith(
                        $tool.getConverter("bytes")(content_len, "B", {show_space: true}), "  [ ", " ]"
                    );
                    content_view.setText(content_text.replace(to_match_str, to_match_str + replaced_str));
                }
            },
            timeSectionToStr: function (arr) {
                return arr.join(" - ") + (arr[1] <= arr[0] ? " (+1)" : "");
            },
            timeStrToSection: function (str) {
                return str.replace(/ \(\+1\)/g, "").split(" - ");
            },
        };

        return $init;
    },
    config: function (reset_flag) {
        let mixedWithDefault = (add_o) => {
            return Object.assign(
                {}, add_o,
                $sto.unlock.get("config", {}),
                isolatedBlacklist(),
                isolatedProjectBackups()
            );
        };
        if (!reset_flag) {
            let _refilled_sto_cfg = Object.assign(
                {}, $sto.def.af,
                $sto.cfg.get("config", {})
            );
            // to forcibly refill storage data
            $sto.cfg.put("config", _refilled_sto_cfg);
            sto_cfg = mixedWithDefault(_refilled_sto_cfg);
            sess_cfg = deepCloneObject(sto_cfg);
        } else {
            let _mixed = mixedWithDefault($sto.def.af);
            sess_cfg = deepCloneObject(_mixed);
            sto_cfg = deepCloneObject(_mixed);
            $sto.cfg.put("config", $sto.def.af);
            listener.emit("update_all");
        }

        return $init;

        // tool function(s) //

        function isolatedProjectBackups() {
            let sto_backups = $sto.af.get("project_backup_info", []);
            return {project_backup_info: sto_backups.filter((o) => o.file_path && files.exists(o.file_path))};
        }

        function isolatedBlacklist() {
            let blacklist = $sto.af.get("blacklist", {});
            let blacklist_protect_cover = [];
            let blacklist_by_user = [];
            for (let name in blacklist) {
                if (blacklist.hasOwnProperty(name)) {
                    let {timestamp, reason} = blacklist[name];
                    let info = {name: name, timestamp: timestamp};
                    if (reason === "protect_cover") blacklist_protect_cover.push(info);
                    if (reason === "by_user") blacklist_by_user.push(info);
                }
            }
            let result = {
                blacklist_protect_cover: blacklist_protect_cover,
                blacklist_by_user: blacklist_by_user,
            };
            Object.assign(sess_par, result);
            return result;
        }
    },
    listener: function () {
        // consume "back" keydown event and define a new one
        ui.emitter.on("back_pressed", (e) => {
            e.consumed = true; // make default "back" dysfunctional

            if (sess_par.back_btn_consumed) {
                let {back_btn_consumed_func} = sess_par;
                if (typeof back_btn_consumed_func === "function") {
                    back_btn_consumed_func();
                    delete sess_par.back_btn_consumed_func;
                }
                return;
            }

            if ($view.checkPageState()) {
                let _one_rolling = global.rolling_pages.length === 1;
                let _need_save = $save.check();
                return _one_rolling ? _need_save ? quitConfirm() : quitNow() : $view.pageJump("back");
            }

            // tool function(s) //

            function quitConfirm() {
                dialogs.builds([
                    "设置未保存", "确定要退出吗",
                    "返回", ["强制退出", "caution_btn_color"], ["保存并退出", "hint_btn_bright_color"], 1,
                ]).show()
                    .on("neutral", diag => diag.dismiss())
                    .on("negative", () => quitNow())
                    .on("positive", diag => $save.config() && quitNow(diag));
            }

            function quitNow(dialog) {
                if (dialog) dialog.dismiss();
                if ($sto.af.get("af_postponed")) {
                    toast("配置结束\n即将运行蚂蚁森林");
                    engines.execScriptFile("./Ant_Forest_Launcher.js", {
                        arguments: {
                            instant_run_flag: true,
                            no_insurance_flag: true,
                        },
                    });
                    $sto.af.remove("af_postponed");
                    $sto.af.put("config_prompted", true);
                }
                exit();
            }
        });

        // recycle some resource as far as possible
        // even if in vain with a strong possibility
        events.on("exit", () => {
            listener.removeAllListeners();
            threads.shutDownAll();
            global.dialogs_pool.forEach((diag) => {
                diag.dismiss();
                diag = null;
            }).splice(0);
            ui.setContentView(ui.inflate(<frame/>));
            ui.main.getParent().removeAllViews();
            ui.main.removeAllViews();
            ui.finish();
        });

        // customized listeners
        let _listener = events.emitter();
        _listener.addListener("sub_page_views_add", () => {
            let _idx = sess_par.sub_page_view_idx || 0;
            let {sub_page_views} = global;
            if (_idx < sub_page_views.length) {
                setTimeout(sub_page_views[_idx++], 10);
                sess_par.sub_page_view_idx = _idx;
            }
        });
        _listener.addListener("update_all", () => {
            global.dynamic_views.forEach(view => view.updateOpr(view));
        });

        Object.assign(global, {listener: _listener});

        return $init;
    }
};

// entrance //
$init.check();

let {
    alertTitle, deepCloneObject, smoothScrollView,
    alertContent, waitForAction, getDisplayParams,
    classof, messageAction, waitForAndClickAction,
    phoneCallingState, surroundWith, timeRecorder,
    timedTaskTimeFlagConverter,
    debugInfo, equalObjects,
} = require("./Modules/MODULE_MONSTER_FUNC");

$init.global().config().listener();

$view.initUI();

$view.setHomePage($defs.homepage_title)
    .add("subhead", new Layout("基本功能"))
    .add("page", new Layout("自收功能", "hint", {
        config_conj: "self_collect_switch",
        next_page: "self_collect_page",
        updateOpr: function (view) {
            view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("page", new Layout("收取功能", "hint", {
        config_conj: "friend_collect_switch",
        next_page: "friend_collect_page",
        updateOpr: function (view) {
            view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("page", new Layout("帮收功能", "hint", {
        config_conj: "help_collect_switch",
        next_page: "help_collect_page",
        updateOpr: function (view) {
            view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("subhead", new Layout("高级功能"))
    .add("page", new Layout("自动解锁", "hint", {
        config_conj: "auto_unlock_switch",
        next_page: "auto_unlock_page",
        updateOpr: function (view) {
            view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("page", new Layout("消息提示", "hint", {
        config_conj: "message_showing_switch",
        next_page: "message_showing_page",
        updateOpr: function (view) {
            view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("page", new Layout("定时循环", "hint", {
        config_conj: "timers_switch",
        next_page: "timers_page",
        updateOpr: function (view) {
            view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("page", new Layout("账户功能", "hint", {
        config_conj: "account_switch",
        next_page: "account_page",
        updateOpr: function (view) {
            view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
        },
    }))
    .add("page", new Layout("黑名单管理", {
        next_page: "blacklist_page",
    }))
    .add("page", new Layout("运行与安全", {
        next_page: "script_security_page",
    }))
    .add("subhead", new Layout("备份与还原"))
    .add("button", new Layout("还原初始设置", {
        newWindow: () => {
            let diag = dialogs.builds([
                "还原初始设置", "restore_all_settings",
                ["了解内部配置", "hint_btn_bright_color"], "放弃", ["全部还原", "warn_btn_color"], 1
            ]);
            diag.on("neutral", () => {
                let diag_keep_internals = dialogs.builds(["保留内部配置", "keep_internal_config", 0, 0, "关闭", 1]);
                diag_keep_internals.on("positive", () => diag_keep_internals.dismiss());
                diag_keep_internals.show();
            });
            diag.on("negative", () => diag.dismiss());
            diag.on("positive", () => {
                let diag_sub = dialogs.builds([
                    "全部还原", "确定要还原全部设置吗",
                    0, "放弃", ["全部还原", "caution_btn_color"], 1
                ]);
                diag_sub.on("positive", () => {
                    $init.config("reset");
                    let diag_sub_sub = dialogs.builds(["还原完毕", "", 0, 0, "确定"]);
                    diag_sub_sub.on("positive", () => {
                        diag_sub_sub.dismiss();
                        diag_sub.dismiss();
                        diag.dismiss();
                    });
                    diag_sub_sub.show();
                });
                diag_sub.on("negative", () => diag_sub.dismiss());
                diag_sub.show();
            });
            diag.show();
        },
    }))
    .add("page", new Layout("项目备份还原", {
        next_page: "local_project_backup_restore_page",
    }))
    .add("subhead", new Layout("关于"))
    .add("button", new Layout("关于脚本及开发者", {
        hint: "正在读取中...",
        view_label: "about",
        newWindow: function () {
            let local_version = this.view._hint.getText().toString();
            let newest_server_version_name = "";
            let server_md_file_content = "";
            let diag = dialogs.builds(["关于", "", [0, "attraction_btn_color"], "返回", "检查更新", 1], {
                content: "当前本地版本: " + local_version + "\n" + "服务器端版本: ",
                items: ["开发者: " + "SuperMonster003"],
            });
            let checking_update_flag = false;
            let only_show_history_flag = false;
            diag.on("negative", () => diag.dismiss());
            diag.on("neutral", () => {
                diag.getActionButton("neutral") === "查看当前更新" && diag.dismiss();
                $tool.handleNewVersion(diag, server_md_file_content, newest_server_version_name, only_show_history_flag);
            });
            diag.on("positive", () => {
                if (checking_update_flag) return;
                sess_par.update_info = {};
                diag.setActionButton("neutral", null);
                checkUpdate();
                // alertTitle(diag, "检查更新中 请稍候...", 1500);
            });
            diag.on("item_select", (idx, item, dialog) => {
                sess_par.back_btn_consumed = true;
                ui.main.getParent().addView(setAboutPageView());

                // tool function(s) //

                function setAboutPageView() {
                    diag.dismiss();

                    sess_par.current_avatar_recycle_name = "avatar";

                    let getImageFromBase64 = (name) => {
                        return images.fromBase64(require("./Modules/MODULE_TREASURY_VAULT").image_base64_data[name]);
                    };

                    let outlook_icon = getImageFromBase64("outlook_icon");
                    let qq_icon = getImageFromBase64("qq_icon");
                    let github_icon = getImageFromBase64("github_icon");
                    let alipay_donation_qr_code = getImageFromBase64("alipay_donation_qr_code");
                    let wechat_donation_qr_code = getImageFromBase64("wechat_donation_qr_code");
                    let detective_avatar = getImageFromBase64("detective_avatar");

                    let local_avatar_path = (() => {
                        let path = files.getSdcardPath() + "/.local/Pics/";
                        files.createWithDirs(path);
                        return path + "super_monster_003_avatar.png";
                    })();
                    let local_avatar = images.read(local_avatar_path);
                    let local_avatar_text = "";
                    let donation_text = "Thank you for your donation";

                    let additional_view = ui.inflate(
                        <vertical bg="#ffffff" clickable="true" focusable="true">
                            <horizontal padding="0 24 0 0" gravity="center">
                                <img id="_avatar" w="180" h="180" radius="20dp" scaleType="fitXY"/>
                            </horizontal>
                            <horizontal gravity="center">
                                <text id="_avatar_desc"/>
                            </horizontal>
                            <horizontal gravity="center" margin="0 25 0 0">
                                <img id="qq" w="50" h="50" scaleType="fitXY" margin="20"/>
                                <img id="github" w="50" h="50" scaleType="fitXY" margin="20"/>
                                <img id="outlook" w="50" h="50" scaleType="fitXY" margin="20"/>
                            </horizontal>
                            <horizontal gravity="center" margin="0 25 0 0">
                                <button id="close" text="CLOSE" textColor="#31080D" backgroundTint="#f48fb1"/>
                            </horizontal>
                        </vertical>
                    );

                    let thread_load_url_avatar = null;

                    additional_view.setTag("about_page");
                    additional_view.close.on("click", () => {
                        stop_loading_url_avatar_signal = true;
                        thread_load_url_avatar && thread_load_url_avatar.isAlive() && thread_load_url_avatar.interrupt();
                        closeAboutPage();
                    });
                    additional_view.close.on("long_click", (e, view) => {
                        e.consumed = true;

                        if (sess_par.avatar_recycle_opr_working_flag) return;
                        sess_par.avatar_recycle_opr_working_flag = true;

                        let recycle_opr = [
                            ["avatar", () => local_avatar || detective_avatar, () => local_avatar_text],
                            ["alipay", () => alipay_donation_qr_code, () => donation_text],
                            ["wechat", () => wechat_donation_qr_code, () => donation_text]
                        ];

                        setAnimation("vanish");

                        setTimeout(function () {
                            let next_recycle_opr = recycle_opr[getNextRecycleIdx()];
                            additional_view._avatar.setSource(next_recycle_opr[1]());
                            additional_view._avatar_desc.setText(next_recycle_opr[2]());
                            sess_par.current_avatar_recycle_name = next_recycle_opr[0];
                        }, 300);

                        setTimeout(function () {
                            setAnimation("show_up");
                        }, 500);

                        delete sess_par.avatar_recycle_opr_working_flag;

                        // tool function(s) //

                        function setAnimation(flag) {
                            flag = flag === "vanish";
                            let {ObjectAnimator, AnimatorSet} = android.animation;
                            let animationY = ObjectAnimator.ofFloat(
                                additional_view._avatar_desc, "translationY", -100 * (+!flag), -100 * (+flag)
                            );
                            let animationScaleX = ObjectAnimator.ofFloat(
                                additional_view._avatar, "scaleX", +flag, +!flag
                            );
                            let animationScaleY = ObjectAnimator.ofFloat(
                                additional_view._avatar, "scaleY", +flag, +!flag
                            );
                            let set = new AnimatorSet();
                            set.playTogether([animationY, animationScaleX, animationScaleY]);
                            set.setDuration(200);
                            set.start();
                        }

                        function getNextRecycleIdx() {
                            let opr_len = recycle_opr.length;
                            let idx = 0;
                            let current_name = sess_par.current_avatar_recycle_name;
                            for (let i = 0; i < opr_len; i += 1) {
                                if (current_name === recycle_opr[idx = i][0]) break;
                            }
                            return (idx + 1) % opr_len;
                        }
                    });

                    sess_par.back_btn_consumed_func = () => additional_view.close.click();

                    let old_status_bar_color = activity.getWindow().getStatusBarColor();
                    ui.statusBarColor(android.graphics.Color.TRANSPARENT);

                    // let {FLAG_FULLSCREEN} = android.view.WindowManager.LayoutParams;
                    // activity.getWindow().setFlags(FLAG_FULLSCREEN, FLAG_FULLSCREEN);

                    let avatar_text_obj = {
                        loading: "Online avatar image is loading...",
                        coffee: "Coffee, coffee, and coffee",
                        loading_failed: "Online avatar image loaded failed",
                    };
                    if (local_avatar) {
                        debugInfo("使用本地头像图片资源");
                        additional_view._avatar.setSource(local_avatar);
                        additional_view._avatar_desc.text(local_avatar_text = avatar_text_obj.coffee);
                    } else {
                        debugInfo("使用默认头像图片资源");
                        additional_view._avatar.setSource(detective_avatar);
                        additional_view._avatar_desc.text(local_avatar_text = avatar_text_obj.loading);
                    }

                    let stop_loading_url_avatar_signal = false;
                    thread_load_url_avatar = threads.starts(function () {
                        try {
                            waitForAction(() => additional_view && additional_view._avatar, 5000, 50);
                            let avatar_url_img = null;
                            let avatar_url = "https://avatars1.githubusercontent.com/u/30370009";
                            let max_retry_times_load_image = 3;
                            let current_retry_load_image = 0;
                            let maxTryTimesReached = () => current_retry_load_image > max_retry_times_load_image;
                            while (!maxTryTimesReached()) {
                                let try_info = " (" + current_retry_load_image + "\/" + max_retry_times_load_image + ")";
                                debugInfo(current_retry_load_image ? "重试获取网络头像图片资源" + try_info : "尝试获取网络头像图片资源");

                                if (waitForAction(() => avatar_url_img = images.load(avatar_url), 2)) break;

                                if (stop_loading_url_avatar_signal) return debugInfo("检测到网络头像图片获取停止信号");
                            }

                            if (maxTryTimesReached()) {
                                if (!local_avatar) {
                                    ui.post(() => additional_view._avatar_desc.text(local_avatar_text = avatar_text_obj.loading_failed));
                                }
                                return debugInfo("获取网络头像图片达最大次数");
                            }

                            debugInfo("网络头像图片资源获取成功");

                            if (local_avatar && images.findImage(local_avatar, avatar_url_img)) {
                                return debugInfo("本地头像图片无需替换");
                            } else {
                                images.save(avatar_url_img, local_avatar_path);
                                debugInfo(local_avatar ? "已替换本地头像图片资源" : "网络头像图片资源已保存到本地");
                                local_avatar = avatar_url_img;
                                local_avatar_text = avatar_text_obj.coffee;
                                ui.post(() => {
                                    if (additional_view._avatar_desc.getText().toString() === avatar_text_obj.loading) {
                                        additional_view._avatar_desc.text(local_avatar_text);
                                    }
                                    if (sess_par.current_avatar_recycle_name === "avatar") {
                                        additional_view._avatar.setSource(local_avatar);
                                    }
                                });
                            }
                        } catch (e) {

                        }
                    });

                    additional_view.qq.setSource(qq_icon);
                    additional_view.qq.on("click", () => {
                        app.startActivity({
                            action: "VIEW",
                            data: decodeURIComponent(
                                "mqqwpa%3A%2F%2Fim%2Fchat%3Fchat_type%3Dwpa%26uin%3D" + 0x36e63859.toString()
                            ),
                        });
                    });
                    additional_view.github.setSource(github_icon);
                    additional_view.github.on("click", () => app.openUrl("https://github.com/SuperMonster003"));
                    additional_view.outlook.setSource(outlook_icon);
                    additional_view.outlook.on("click", () => {
                        app.startActivity({
                            action: "VIEW",
                            data: decodeURIComponent(
                                "mailto%3A%2F%2Ftencent_" + 0x36e63859.toString() +
                                "%40outlook" + String.fromCharCode(0x2e) + "com"
                            ),
                        });
                    });

                    return additional_view;

                    // tool function(s) //

                    function closeAboutPage() {
                        delete sess_par.back_btn_consumed;
                        ui.statusBarColor(old_status_bar_color);
                        // activity.getWindow().clearFlags(FLAG_FULLSCREEN);
                        diag.show();

                        let parent = ui.main.getParent();
                        let child_count = parent.getChildCount();
                        for (let i = 0; i < child_count; i += 1) {
                            let child_view = parent.getChildAt(i);
                            if (child_view.findViewWithTag("about_page")) parent.removeView(child_view);
                        }
                    }
                }
            });
            diag.show();
            checkUpdate();

            // tool function(s) //

            function checkUpdate() {
                checking_update_flag = true;
                only_show_history_flag = false;
                let url_readme = "https://raw.githubusercontent.com/SuperMonster003/Auto.js_Projects/Ant_Forest/README.md";
                newest_server_version_name = "检查中...";
                let ori_content = dialogs.getContentText(diag).replace(/([^]+服务器端版本: ).*/, "$1");
                diag.setContent(ori_content + newest_server_version_name);
                threads.starts(function () {
                    try {
                        timeRecorder("check_update");
                        let regexp_version_name = /版本历史[^]+?v(\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/;
                        server_md_file_content = http.get(url_readme).body.string();
                        newest_server_version_name = "v" + server_md_file_content.match(regexp_version_name)[0].split("v")[1];
                    } catch (e) {
                        let _elapsed = timeRecorder("check_update", "load");
                        newest_server_version_name = _elapsed > 999 ? "检查超时" : "检查失败";
                    } finally {
                        diag.setContent(ori_content + newest_server_version_name);
                        if (newest_server_version_name.match(/^v/) && isNewVer(newest_server_version_name, local_version)) {
                            diag.setActionButton("neutral", "查看当前更新");
                        } else {
                            only_show_history_flag = true;
                            diag.setActionButton("neutral", "查看历史更新");
                        }
                        checking_update_flag = false;
                    }

                    // tool function(s) //

                    function isNewVer(ver_new, ver_old) {
                        return getVerWeight(ver_new) > getVerWeight(ver_old);

                        // tool function(s) //

                        function getVerWeight(ver) {
                            let str = ver.replace(/[v ]/g, "");
                            if (str.match(/[Aa]lpha$|[Bb]eta$/)) str += "1";
                            if (!str.match(/[Aa]lpha|[Bb]eta/)) str += "#9.9999";
                            str = str.replace(/[Aa]lpha/, "#1.").replace(/[Bb]eta/, "#2.");
                            let split_str = str.split("#");
                            let calc = (s) => {
                                let nums = s.split(".");
                                let sum = 0;
                                for (let i = 0, len = nums.length; i < len; i += 1) {
                                    sum += nums[i] * Math.pow(10, (16 - 4 * i));
                                }
                                return sum;
                            };
                            return calc(split_str[0]) + "." + calc(split_str[1]);
                        }
                    }
                });
            }
        },
        updateOpr: function (view) {
            view._hint.text($tool.getLocalVerName());
        },
    }))
    .ready()
;

$view.addPage(["自收功能", "self_collect_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "self_collect_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("主页能量球设置", {subhead_color: "#bf360c"}))
        .add("page", new Layout("循环监测", "hint", {
            config_conj: "homepage_monitor_switch",
            next_page: "homepage_monitor_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
                $view.checkDependency(view, "timers_switch");
            },
        }))
        .add("page", new Layout("返检监控", "hint", {
            config_conj: "homepage_background_monitor_switch",
            next_page: "homepage_background_monitor_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("button", new Layout("能量球点击间隔", "hint", {
            config_conj: "energy_balls_click_interval",
            newWindow: function () {
                let diag = dialogs.builds([
                    "能量球点击间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|10<=x<=150,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 150 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString() + " ms");
            },
        }))
        .add("button", new Layout("控件最大准备时间", "hint", {
            config_conj: "max_own_forest_balls_ready_time",
            newWindow: function () {
                let diag = dialogs.builds([
                    "主页能量球最大准备时间", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|200<=x<=2000,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let safe_value = 500;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 2000 || value < 200) return alertTitle(dialog, "输入值范围不合法");
                    if (value < safe_value) {
                        let diag_confirm = dialogs.builds([["请注意", "caution_btn_color"], "", 0, "放弃", ["确定", "warn_btn_color"], 1], {
                            content: "当前值: " + value + "安全值: " + safe_value + "\n\n" +
                                "当前设置值小于安全值\n设置过小的时间值可能会导致能量球识别遗漏的情况\n\n" +
                                "确定要保留当前设置值吗",
                        });
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            $save.session(this.config_conj, ~~value);
                            diag_confirm.dismiss();
                            diag.dismiss();
                        });
                        diag_confirm.show();
                    } else {
                        $save.session(this.config_conj, ~~value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString() + " ms");
            },
        }))
        .ready();
});
$view.addPage(["主页能量球循环监测", "homepage_monitor_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "homepage_monitor_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("监测阈值", "hint", {
            config_conj: "homepage_monitor_threshold",
            newWindow: function () {
                let diag = dialogs.builds([
                    "主页能量球循环监测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=3,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 3 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString() + " min");
            },
        }))
        .add("split_line")
        .add("info", new Layout("\"自收功能\"与\"定时循环\"共用此页面配置"))
        .ready();
});
$view.addPage(["主页能量球返检监控", "homepage_background_monitor_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "homepage_background_monitor_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("返检阈值", "hint", {
            config_conj: "homepage_background_monitor_threshold",
            newWindow: function () {
                dialogs.builds(["主页能量球返检阈值", this.config_conj, 0, "返回", 0]).show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString() + " min");
            },
        }))
        .ready();
});
$view.addPage(["收取功能", "friend_collect_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "friend_collect_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("能量球点击间隔", "hint", {
            config_conj: "energy_balls_click_interval",
            newWindow: function () {
                let diag = dialogs.builds([
                    "能量球点击间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|10<=x<=150,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 150 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString() + " ms");
            },
        }))
        .add("page", new Layout("排行榜样本采集", {
            next_page: "rank_list_samples_collect_page",
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("收取图标颜色色值", "hint", {
            config_conj: "friend_collect_icon_color",
            newWindow: function () {
                let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/;
                let _lim255 = regexp_num_0_to_255.source;
                let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
                let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
                let current_color = undefined;
                let diag = dialogs.builds([
                    "收取图标颜色色值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "rgb(RR,GG,BB) | #RRGGBB"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    if (diag.getInputEditText().getText().toString() !== "") {
                        if (!current_color) return alertTitle(dialog, "输入的颜色值无法识别");
                        $save.session(this.config_conj, "#" + colors.toString(current_color).toLowerCase().slice(3));
                    }
                    diag.dismiss();
                });
                diag.on("input_change", (dialog, input) => {
                    let color = "";
                    try {
                        if (input.match(regexp_hex_color)) {
                            color = colors.parseColor("#" + input.slice(-6));
                        } else if (input.match(regexp_rgb_color)) {
                            let nums = input.match(/\d+.+\d+.+\d+/)[0].split(/\D+/);
                            color = colors.rgb(+nums[0], +nums[1], +nums[2]);
                        }
                        dialog.getTitleView().setTextColor(color || -570425344);
                        dialog.getContentView().setTextColor(color || -1979711488);
                        dialog.getTitleView().setBackgroundColor(color ? -570425344 : -1);
                    } catch (e) {
                    }
                    current_color = color;
                });
                diag.show();
            },
            updateOpr: function (view) {
                let color_str = sess_cfg[this.config_conj].toString();
                view._hint.text(color_str);
                view._hint_color_indicator.text(" \u25D1");
                view._hint_color_indicator.setTextColor(colors.parseColor(color_str));
                view._hint_color_indicator.setVisibility(0);
            },
        }))
        .add("button", new Layout("收取图标颜色阈值", "hint", {
            config_conj: "friend_collect_icon_threshold",
            newWindow: function () {
                let diag = dialogs.builds([
                    "收取图标颜色检测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=66,x∈N*}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 66 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString());
            },
        }))
        .ready();
});
$view.addPage(["排行榜样本采集", "rank_list_samples_collect_page"], function () {
    $view.setPage(arguments[0])
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("滑动距离", "hint", {
            config_conj: "rank_list_swipe_distance",
            newWindow: function () {
                let avail_top = cY(0.4);
                let avail_bottom = cY(0.9);
                let collect_icon_height = cY(46, -1);
                let safe_value = (uH - staH - actH - collect_icon_height);
                let default_value = $sto.def.af[this.config_conj].toString();
                let getScaleStr = value => " [ " + ~~(value * 100 / H) / 100 + " ]";
                let diag = dialogs.builds([
                    "设置排行榜页面滑动距离", "",
                    ["使用安全值", "hint_btn_bright_color"], "返回", "确认修改", 1
                ], {
                    content: "参数示例:\n1260: 每次滑动 1260 像素\n0.6: 每次滑动 60% 屏幕距离\n\n" +
                        "有效值: " + avail_top + " [ " + (avail_top / H) + " ] " +
                        " -  " + avail_bottom + " [ " + (avail_bottom / H) + " ]\n" +
                        "默认值: " + cY(default_value) + " [ " + default_value + " ]\n" +
                        "安全值: " + safe_value + getScaleStr(safe_value),
                    inputHint: "{x|0.4(*HEIGHT)<=x<=0.9(*HEIGHT),x∈R}",
                });
                diag.on("neutral", () => diag.getInputEditText().setText(safe_value.toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") input = (sess_cfg[this.config_conj] || default_value).toString();
                    if (input.match(/^\d+%$/)) input = input.replace("%", "") / 100;
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 0 && value < 1) value *= H;
                    if (value > avail_bottom || value < avail_top) return alertTitle(dialog, "输入值范围不合法");
                    if (value > safe_value) {
                        let diag_confirm = dialogs.builds([
                            ["请注意", "caution_btn_color"], "",
                            ["什么是安全值", "hint_btn_bright_color"], "放弃", ["确定", "warn_btn_color"], 1,
                        ], {
                            content: "当前值: " + value + "\n安全值: " + safe_value + "\n\n" +
                                "当前设置值大于安全值\n滑动时可能出现遗漏采集目标的问题\n\n" +
                                "确定要保留当前设置值吗",
                        });
                        diag_confirm.on("neutral", () => {
                            dialogs.builds(["滑动距离安全值", "", 0, 0, "返回"], {
                                content: "安全值指排行榜滑动时可避免采集目标遗漏的理论最大值\n\n" +
                                    "计算方法:\n屏幕高度 [ " + H + " ]\n" +
                                    "减去 导航栏高度 [ " + navH + " ]\n" +
                                    "减去 状态栏高度 [ " + staH + " ]\n" +
                                    "减去 ActionBar默认高度 [ " + actH + " ]\n" +
                                    "减去 帮收图标缩放高度 [ " + collect_icon_height + " ]\n" +
                                    "得到 安全值 [ " + safe_value + " ]\n\n" +
                                    "* 括号中的数据均源自当前设备\n" +
                                    "* 安全值为理论值\n-- 不代表真实可操作的最佳值",
                            }).show();
                        });
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            $save.session(this.config_conj, ~~value);
                            diag_confirm.dismiss();
                            diag.dismiss();
                        });
                        diag_confirm.show();
                    } else {
                        $save.session(this.config_conj, ~~value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                let value = sess_cfg[this.config_conj] || $sto.def.af[this.config_conj];
                if (value < 1) value = cY(value);
                view._hint.text(value.toString() + " px  [ " + Math.round(value / H * 100) + "% H ]");
            },
        }))
        .add("button", new Layout("滑动时长", "hint", {
            config_conj: "rank_list_swipe_time",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置排行榜页面滑动时长", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|50<=x<=500,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 500 || value < 50) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("滑动间隔", "hint", {
            config_conj: "rank_list_swipe_interval",
            newWindow: function () {
                let diag_strategy_image = dialogs.builds([
                    "设置排行榜页面滑动间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|100<=x<=800,x∈N}"});
                let _def = $sto.def.af[this.config_conj].toString();
                diag_strategy_image.on("neutral", dialog => dialog.getInputEditText().setText(_def));
                diag_strategy_image.on("negative", () => diag_strategy_image.dismiss());
                diag_strategy_image.on("positive", dialog => {
                    let input = diag_strategy_image.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 800 || value < 100) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag_strategy_image.dismiss();
                });
                let diag_strategy_layout = dialogs.builds([
                    "设置排行榜页面滑动间隔", "采用\"布局分析\"策略时\n滑动间隔将由脚本自动获取动态最优值",
                    0, 0, "返回", 1,
                ]);
                diag_strategy_layout.on("positive", () => diag_strategy_layout.dismiss());
                sess_cfg.rank_list_samples_collect_strategy === "image"
                    ? diag_strategy_image.show()
                    : diag_strategy_layout.show();
            },
            updateOpr: function (view) {
                let hint_text = "自动设置";
                if (sess_cfg.rank_list_samples_collect_strategy === "image") {
                    let conj = this.config_conj;
                    let data = sess_cfg[conj] || $sto.def.af[conj];
                    hint_text = data.toString() + " ms";
                }
                view._hint.text(hint_text);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("page", new Layout("样本复查", "hint", {
            config_conj: "rank_list_review_switch",
            next_page: "rank_list_review_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
                $view.checkDependency(view, "timers_switch");
            },
        }))
        .add("button", new Layout("采集策略", "hint", {
            config_conj: "rank_list_samples_collect_strategy",
            map: {
                layout: "布局分析",
                image: "图像处理",
            },
            newWindow: function () {
                let map = this.map;
                let map_keys = Object.keys(map);
                let diag = dialogs.builds(["排行榜样本采集策略", "", ["了解详情", "hint_btn_bright_color"], "返回", "确认修改", 1], {
                    items: map_keys.slice().map(value => map[value]),
                    itemsSelectMode: "single",
                    itemsSelectedIndex: map_keys.indexOf((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString()),
                });
                diag.on("neutral", () => {
                    let diag_about = dialogs.builds(["关于采集策略", "about_rank_list_samples_collect_strategy", 0, 0, "关闭", 1]);
                    diag_about.on("positive", () => diag_about.dismiss());
                    diag_about.show();
                });
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", () => {
                    $save.session(this.config_conj, map_keys[diag.selectedIndex]);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(this.map[(sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString()]);
            },
        }))
        .add("button", new Layout("截图样本池差异检测阈值", "hint", {
            config_conj: "rank_list_capt_pool_diff_check_threshold",
            newWindow: function () {
                let diag = dialogs.builds([
                    "排行榜截图差异检测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|5<=x<=800,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 800 || value < 5) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString());
            },
        }))
        .add("button", new Layout("列表底部控件图片模板", "hint", {
            newWindow: function () {
                let template_path = sto_cfg.rank_list_bottom_template_path;
                let diag = dialogs.builds([
                    "排行榜底部控件图片模板", "",
                    ["null", "caution_btn_color"], "返回", ["null", "attraction_btn_color"], 1,
                ]);
                diag.on("neutral", () => {
                    let diag_confirm = dialogs.builds(["确认删除吗", "此操作无法撤销", 0, "放弃", ["确认", "caution_btn_color"], 1]);
                    diag_confirm.on("negative", () => diag_confirm.dismiss());
                    diag_confirm.on("positive", () => {
                        files.remove(template_path);
                        diag_confirm.dismiss();
                        this.updateOpr(this.view);
                        updateDialog();
                    });
                    diag_confirm.show();
                });
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", () => app.viewFile(template_path));
                diag.show();
                updateDialog();

                // tool function(s) //

                function updateDialog() {
                    let {dialog_contents} = $defs;
                    let [base, exists, not_exists] = [
                        dialog_contents.rank_list_bottom_template_hint_base,
                        dialog_contents.rank_list_bottom_template_hint_exists,
                        dialog_contents.rank_list_bottom_template_hint_not_exists
                    ];
                    if (files.exists(template_path)) {
                        diag.setContent(base + exists);
                        diag.setActionButton("neutral", "删除模板");
                        diag.setActionButton("positive", "查看模板");
                    } else {
                        diag.setContent(base + not_exists);
                        diag.setActionButton("neutral", "");
                        diag.setActionButton("positive", "");
                    }
                }
            },
            updateOpr: function (view) {
                let file_exists_flag = files.exists(sto_cfg.rank_list_bottom_template_path);
                view._hint.text(file_exists_flag ? "已生成" : "暂未生成");
            },
        }))
        .ready();
});
$view.addPage(["排行榜样本复查", "rank_list_review_page"], function () {
    $view.setPage(arguments[0], null, {
        check_page_state: (view) => {
            let samples = [
                "rank_list_review_threshold_switch",
                "rank_list_review_samples_clicked_switch",
                "rank_list_review_difference_switch"
            ];
            if (!sess_cfg.rank_list_review_switch) return true;
            let chk = tag_name => $view.findViewByTag(view, tag_name, 3)._checkbox_switch.checked;
            for (let i = 0, len = samples.length; i < len; i += 1) {
                if (chk(samples[i])) return true;
            }
            dialogs.builds(["提示", "样本复查条件需至少选择一个", 0, 0, "返回"]).show();
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "rank_list_review_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("复查条件", {subhead_color: $defs.subhead_highlight_color}))
        .add("checkbox_switch", new Layout("列表状态差异", {
            config_conj: "rank_list_review_difference_switch",
            view_tag: "rank_list_review_difference_switch",
            listeners: {
                _checkbox_switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._checkbox_switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("样本点击记录", {
            config_conj: "rank_list_review_samples_clicked_switch",
            view_tag: "rank_list_review_samples_clicked_switch",
            listeners: {
                _checkbox_switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._checkbox_switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("最小倒计时阈值", {
            config_conj: "rank_list_review_threshold_switch",
            view_tag: "rank_list_review_threshold_switch",
            listeners: {
                _checkbox_switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._checkbox_switch.setChecked(session_conf);
            },
        }))
        .add("seekbar", new Layout("阈值", {
            config_conj: "rank_list_review_threshold",
            nums: [1, 5],
            unit: "min",
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解更多", {
            newWindow: function () {
                let diag = dialogs.builds(["关于排行榜样本复查", "about_rank_list_review", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .add("split_line")
        .add("info", new Layout("\"收取\/帮收功能\"与\"定时循环\"共用此页面配置"))
        .ready();
});
$view.addPage(["帮收功能", "help_collect_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "help_collect_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("能量球点击间隔", "hint", {
            config_conj: "energy_balls_click_interval",
            newWindow: function () {
                let diag = dialogs.builds([
                    "能量球点击间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|10<=x<=150,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 150 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString() + " ms");
            },
        }))
        .add("button", new Layout("有效时段", "hint", {
            config_conj: "help_collect_section",
            newWindow: function () {
                let init_value = sess_cfg[this.config_conj];
                $view.setTimePickerView({
                    picker_views: [
                        {type: "time", text: "设置开始时间", init: init_value[0]},
                        {type: "time", text: "设置结束时间", init: init_value[1]},
                    ],
                    time_str: {
                        suffix: (getStrFunc) => {
                            if (getStrFunc(2).default() < getStrFunc(1).default()) return "(+1)";
                        },
                        middle: (getStrFunc) => {
                            if (getStrFunc(2).default() === getStrFunc(1).default()) return "全天";
                        },
                    },
                    buttons: {
                        reserved_btn: {
                            text: "设置 '全天'",
                            onClickListener: (getTimeInfoFromPicker, closeTimePickerPage) => {
                                closeTimePickerPage("全天");
                            },
                        },
                    },
                    onFinish: (return_value) => {
                        let section = return_value === "全天" ? [] : $tool.timeStrToSection(return_value);
                        if (section[0] === section[1]) section = $sto.def.af[this.config_conj];
                        $save.session(this.config_conj, section);
                    },
                });
            },
            updateOpr: function (view) {
                let session_value = sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]; // Array
                let hint_text = session_value[0] === session_value[1] ? "全天" : $tool.timeSectionToStr(session_value);
                view._hint.text(hint_text);
            },
        }))
        .add("page", new Layout("六球复查", "hint", {
            config_conj: "six_balls_review_switch",
            next_page: "six_balls_review_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("page", new Layout("排行榜样本采集", {
            next_page: "rank_list_samples_collect_page",
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("帮收图标颜色色值", "hint", {
            config_conj: "help_collect_icon_color",
            newWindow: function () {
                let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/;
                let _lim255 = regexp_num_0_to_255.source;
                let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
                let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
                let current_color = undefined;
                let diag = dialogs.builds([
                    "帮收图标颜色色值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "rgb(RR,GG,BB) | #RRGGBB"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    if (diag.getInputEditText().getText().toString() !== "") {
                        if (!current_color) return alertTitle(dialog, "输入的颜色值无法识别");
                        $save.session(this.config_conj, "#" + colors.toString(current_color).toLowerCase().slice(3));
                    }
                    diag.dismiss();
                });
                diag.on("input_change", (dialog, input) => {
                    let color = "";
                    try {
                        if (input.match(regexp_hex_color)) {
                            color = colors.parseColor("#" + input.slice(-6));
                        } else if (input.match(regexp_rgb_color)) {
                            let nums = input.match(/\d+.+\d+.+\d+/)[0].split(/\D+/);
                            color = colors.rgb(+nums[0], +nums[1], +nums[2]);
                        }
                        dialog.getTitleView().setTextColor(color || -570425344);
                        dialog.getContentView().setTextColor(color || -1979711488);
                        dialog.getTitleView().setBackgroundColor(color ? -570425344 : -1);
                    } catch (e) {
                    }
                    current_color = color;
                });
                diag.show();
            },
            updateOpr: function (view) {
                let color_str = sess_cfg[this.config_conj].toString();
                view._hint.text(color_str);
                view._hint_color_indicator.text(" \u25D1");
                view._hint_color_indicator.setTextColor(colors.parseColor(color_str));
                view._hint_color_indicator.setVisibility(0);
            },
        }))
        .add("button", new Layout("帮收图标颜色阈值", "hint", {
            config_conj: "help_collect_icon_threshold",
            newWindow: function () {
                let diag = dialogs.builds([
                    "帮收图标颜色检测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=66,x∈N*}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 66 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString());
            },
        }))
        .add("button", new Layout("帮收能量球颜色色值", "hint", {
            config_conj: "help_collect_balls_color",
            newWindow: function () {
                let regexp_num_0_to_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/;
                let _lim255 = regexp_num_0_to_255.source;
                let regexp_rgb_color = new RegExp("^(rgb)?[\\( ]?" + _lim255 + "[, ]+" + _lim255 + "[, ]+" + _lim255 + "\\)?$", "i");
                let regexp_hex_color = /^#?[A-F0-9]{6}$/i;
                let current_color = undefined;
                let diag = dialogs.builds([
                    "帮收能量球颜色色值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "rgb(RR,GG,BB) | #RRGGBB"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    if (diag.getInputEditText().getText().toString() !== "") {
                        if (!current_color) return alertTitle(dialog, "输入的颜色值无法识别");
                        $save.session(this.config_conj, "#" + colors.toString(current_color).toLowerCase().slice(3));
                    }
                    diag.dismiss();
                });
                diag.on("input_change", (dialog, input) => {
                    let color = "";
                    try {
                        if (input.match(regexp_hex_color)) {
                            color = colors.parseColor("#" + input.slice(-6));
                        } else if (input.match(regexp_rgb_color)) {
                            let nums = input.match(/\d+.+\d+.+\d+/)[0].split(/\D+/);
                            color = colors.rgb(+nums[0], +nums[1], +nums[2]);
                        }
                        dialog.getTitleView().setTextColor(color || -570425344);
                        dialog.getContentView().setTextColor(color || -1979711488);
                        dialog.getTitleView().setBackgroundColor(color ? -570425344 : -1);
                    } catch (e) {
                    }
                    current_color = color;
                });
                diag.show();
            },
            updateOpr: function (view) {
                let color_str = sess_cfg[this.config_conj].toString();
                view._hint.text(color_str);
                view._hint_color_indicator.text(" \u25D1");
                view._hint_color_indicator.setTextColor(colors.parseColor(color_str));
                view._hint_color_indicator.setVisibility(0);
            },
        }))
        .add("button", new Layout("帮收能量球颜色阈值", "hint", {
            config_conj: "help_collect_balls_threshold",
            newWindow: function () {
                let diag = dialogs.builds([
                    "帮收能量球颜色检测阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|28<=x<=83,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 83 || value < 28) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString());
            },
        }))
        .add("button", new Layout("帮收能量球样本采集密度", "hint", {
            config_conj: "help_collect_balls_intensity",
            newWindow: function () {
                let diag = dialogs.builds([
                    "帮收能量球样本采集密度", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|10<=x<=20,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 20 || value < 10) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj].toString());
            },
        }))
        .ready();
});
$view.addPage(["六球复查", "six_balls_review_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "six_balls_review_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("最大连续复查次数", "hint", {
            config_conj: "six_balls_review_max_continuous_times",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置最大连续复查次数", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=8,x∈N*}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 8 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString());
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解更多", {
            newWindow: function () {
                let diag = dialogs.builds(["关于六球复查", "about_six_balls_review", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$view.addPage(["自动解锁", "auto_unlock_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "auto_unlock_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("锁屏密码", "hint", {
            config_conj: "unlock_code",
            newWindow: function () {
                let diag = dialogs.builds(["设置锁屏解锁密码", this.config_conj, ["查看示例", "hint_btn_bright_color"], "返回", "确认", 1], {
                    inputHint: "密码将以密文形式存储在本地",
                });
                diag.on("neutral", () => {
                    let diag_demo = dialogs.builds(["锁屏密码示例", "unlock_code_demo", ["了解点阵简化", "hint_btn_bright_color"], 0, "关闭", 1]);
                    diag_demo.on("neutral", () => {
                        let diag_simp = dialogs.builds(["图案解锁密码简化", "about_pattern_simplification", 0, 0, "关闭", 1]);
                        diag_simp.on("positive", () => diag_simp.dismiss());
                        diag_simp.show();
                    });
                    diag_demo.on("positive", () => diag_demo.dismiss());
                    diag_demo.show();
                });
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", () => {
                    let {encrypt} = global;
                    let input = diag.getInputEditText().getText().toString();
                    if (input && input.length < 3) return alertTitle(diag, "密码长度不小于 3 位");
                    if (input && !$sto.af.get("unlock_code_safe_dialog_prompt_prompted")) {
                        let unlock_code_safe_dialog_prompt_prompted = false;
                        let diag_prompt = dialogs.builds([
                            "风险提示", "unlock_code_safe_confirm",
                            ["了解详情", "hint_btn_bright_color"], "放弃", ["继续", "caution_btn_color"], 1, 1
                        ]);
                        diag_prompt.on("check", checked => unlock_code_safe_dialog_prompt_prompted = !!checked);
                        diag_prompt.on("neutral", () => {
                            let diag_about = dialogs.builds([
                                "设备遗失对策", "about_lost_device_solution",
                                0, 0, "关闭", 1
                            ]).on("positive", diag => diag.dismiss()).show();
                            let content_view = diag_about.getContentView();
                            let content_text_ori = content_view.getText().toString();
                            content_view.setAutoLinkMask(android.text.util.Linkify.WEB_URLS);
                            content_view.setText(content_text_ori);
                        });
                        diag_prompt.on("negative", () => diag_prompt.dismiss());
                        diag_prompt.on("positive", () => {
                            if (unlock_code_safe_dialog_prompt_prompted) {
                                $sto.af.put("unlock_code_safe_dialog_prompt_prompted", true);
                            }
                            $save.session(this.config_conj, input ? encrypt(input) : "");
                            diag.dismiss();
                            diag_prompt.dismiss();
                        });
                        diag_prompt.show();
                    } else {
                        $save.session(this.config_conj, input ? encrypt(input) : "");
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已设置" : "空");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("最大尝试次数", "hint", {
            config_conj: "unlock_max_try_times",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置解锁最大尝试次数", "",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|5<=x<=50,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.unlock[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 50 || value < 5) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.unlock[this.config_conj]).toString());
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("提示层页面设置", {subhead_color: "#bf360c"}))
        .add("button", new Layout("上滑时长", "hint", {
            config_conj: "unlock_dismiss_layer_swipe_time",
            newWindow: function () {
                let diag = dialogs.builds([
                    "提示层页面上滑时长", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|110<=x<=1000,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.unlock[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 1000 || value < 110) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.unlock[this.config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("起点位置", "hint", {
            config_conj: "unlock_dismiss_layer_bottom",
            newWindow: function () {
                let diag = dialogs.builds([
                    "提示层页面起点位置", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0.5<=x<=0.95,x∈R+}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.unlock[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    input = +input;
                    if (isNaN(input)) return alertTitle(dialog, "输入值类型不合法");
                    let value = +(input.toFixed(2));
                    if (value > 0.95 || value < 0.5) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                let value = (sess_cfg[this.config_conj] || $sto.def.unlock[this.config_conj]) * 100;
                view._hint.text(value.toString() + "% H");
            },
        }))
        .add("button", new Layout("终点位置", "hint", {
            config_conj: "unlock_dismiss_layer_top",
            newWindow: function () {
                let diag = dialogs.builds([
                    "提示层页面终点位置", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0.05<=x<=0.3,x∈R+}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.unlock[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    input = +input;
                    if (isNaN(input)) return alertTitle(dialog, "输入值类型不合法");
                    let value = +(input.toFixed(2));
                    if (value > 0.3 || value < 0.05) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                let value = (sess_cfg[this.config_conj] || $sto.def.unlock[this.config_conj]) * 100;
                view._hint.text(value.toString() + "% H");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("图案解锁设置", {subhead_color: "#bf360c"}))
        .add("button", new Layout("滑动策略", "hint", {
            config_conj: "unlock_pattern_strategy",
            map: {
                segmental: "叠加路径", // gestures()
                solid: "连续路径", // gesture()
            },
            newWindow: function () {
                let map = this.map;
                let map_keys = Object.keys(map);
                let diag = dialogs.builds(["图案解锁滑动策略", "", ["了解详情", "hint_btn_bright_color"], "返回", "确认修改", 1], {
                    items: map_keys.slice().map(value => map[value]),
                    itemsSelectMode: "single",
                    itemsSelectedIndex: map_keys.indexOf((sess_cfg[this.config_conj] || $sto.def.unlock[this.config_conj]).toString()),
                });
                diag.on("neutral", () => {
                    let diag_about = dialogs.builds(["关于图案解锁滑动策略", "about_unlock_pattern_strategy", 0, 0, "关闭", 1]);
                    diag_about.on("positive", () => diag_about.dismiss());
                    diag_about.show();
                });
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", () => {
                    $save.session(this.config_conj, map_keys[diag.selectedIndex]);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(this.map[(sess_cfg[this.config_conj] || $sto.def.unlock[this.config_conj]).toString()]);
            },
        }))
        .add("button", new Layout("滑动时长", "hint", {
            config_conj: () => "unlock_pattern_swipe_time_"
                + (sess_cfg.unlock_pattern_strategy || $sto.def.unlock.unlock_pattern_strategy),
            newWindow: function () {
                let config_conj = this.config_conj();
                let diag = dialogs.builds([
                    "设置图案解锁滑动时长", config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|120<=x<=3000,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.unlock[config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 3000 || value < 120) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                let config_conj = this.config_conj();
                view._hint.text((sess_cfg[config_conj] || $sto.def.unlock[config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("点阵边长", "hint", {
            config_conj: "unlock_pattern_size",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置图案解锁边长", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|3<=x<=6,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.unlock[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 6 || value < 3) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.unlock[this.config_conj]).toString());
            },
        }))
        .ready();
});
$view.addPage(["消息提示", "message_showing_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "message_showing_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("switch", new Layout("控制台消息", {
            config_conj: "console_log_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("radio", new Layout(["详细", "简略"], {
            values: [true, false],
            config_conj: "console_log_details",
            listeners: {
                check: function (checked, view) {
                    checked && $save.session(this.config_conj, this.values[this.title.indexOf(view.text)]);
                },
            },
            updateOpr: function (view) {
                let session_conf = sess_cfg[this.config_conj];
                let child_idx = this.values.indexOf(session_conf);
                if (!~child_idx) return;
                let child_view = view._radiogroup.getChildAt(child_idx);
                !child_view.checked && child_view.setChecked(true);
            },
        }))
        .add("checkbox_switch", new Layout("开发者测试模式", {
            default_state: false,
            config_conj: "debug_info_switch",
            listeners: {
                _checkbox_switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.weakOrStrongBySwitch(this, !state, -1);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._checkbox_switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("switch", new Layout("运行前提示", {
            config_conj: "prompt_before_running_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("button", new Layout("对话框倒计时时长", "hint", {
            config_conj: "prompt_before_running_countdown_seconds",
            newWindow: function () {
                let diag = dialogs.builds([
                    "提示对话框倒计时时长", "倒计时结束前\n用户可自主点击按钮执行相应操作\n\n否则倒计时超时后脚本将自动执行",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|3<=x<=30,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 30 || value < 3) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString() + " s");
            },
        }))
        .add("button", new Layout("推迟运行间隔时长", "hint", {
            config_conj: "prompt_before_running_postponed_minutes",
            map: Object.assign({
                0: "每次都询问",
            }, (() => {
                let o = {};
                $sto.def.af.prompt_before_running_postponed_minutes_default_choices.forEach(num => o[num] = num + " min");
                return o;
            })()),
            newWindow: function () {
                let map = this.map;
                let map_keys = Object.keys(map);
                let diag = dialogs.builds([
                    "推迟运行间隔时长", "",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {
                    items: map_keys.slice().map(value => map[value]),
                    itemsSelectMode: "single",
                    itemsSelectedIndex: map_keys.indexOf((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString()),
                });
                diag.on("neutral", () => {
                    diag.setSelectedIndex($sto.def.af[this.config_conj]);
                });
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", () => {
                    $save.session(this.config_conj, +map_keys[diag.selectedIndex]);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text(this.map[(sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString()]);
            },
        }))
        .add("split_line")
        .add("switch", new Layout("运行结果展示", {
            config_conj: "result_showing_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("radio", new Layout(["Floaty", "Toast"], {
            values: [true, false],
            config_conj: "floaty_result_switch",
            listeners: {
                check: function (checked, view) {
                    let {text} = view;
                    checked && $save.session(this.config_conj, this.values[this.title.indexOf(text)]);
                    text === this.title[0] && $view.showOrHideBySwitch(this, checked, false, "split_line");
                },
            },
            updateOpr: function (view) {
                let session_conf = sess_cfg[this.config_conj];
                let child_idx = this.values.indexOf(session_conf);
                if (!~child_idx) return;
                let child_view = view._radiogroup.getChildAt(child_idx);
                !child_view.checked && child_view.setChecked(true);
            },
        }))
        .add("seekbar", new Layout("时长", {
            config_conj: "floaty_result_countdown",
            nums: [2, 10],
            unit: "s",
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow: function () {
                let diag = dialogs.builds(["关于消息提示配置", "about_message_showing_function", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$view.addPage(["定时循环", "timers_page"], function () {
    $view.setPage(arguments[0], null, {
        check_page_state: (view) => {
            // this is just a simple check
            let switches = [
                "homepage_monitor_switch",
                "rank_list_review_switch",
                "timers_self_manage_switch",
            ];
            for (let i = 0, len = switches.length; i < len; i += 1) {
                if (sess_cfg[switches[i]]) return true;
            }
            dialogs.builds(["提示", "定时循环子功能需至少选择一个", 0, 0, "返回"]).show();
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "timers_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("循环监测", {subhead_color: $defs.subhead_highlight_color}))
        .add("page", new Layout("主页能量球循环监测", "hint", {
            config_conj: "homepage_monitor_switch",
            next_page: "homepage_monitor_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
                $view.checkDependency(view, "self_collect_switch");
            },
        }))
        .add("page", new Layout("好友排行榜样本复查", "hint", {
            config_conj: "rank_list_review_switch",
            next_page: "rank_list_review_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
                $view.checkDependency(view, ["friend_collect_switch", "help_collect_switch"])
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("定时任务", {subhead_color: $defs.subhead_highlight_color}))
        .add("page", new Layout("定时任务自动管理", "hint", {
            config_conj: "timers_self_manage_switch",
            next_page: "timers_self_manage_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("page", new Layout("定时任务控制面板", {
            next_page: "timers_control_panel_page",
        }))
        .ready();
});
$view.addPage(["定时任务自动管理", "timers_self_manage_page"], function () {
    $view.setPage(arguments[0], null, {
        check_page_state: (view) => {
            return checkCurrentPageSwitches() && checkAutoUnlockSwitch();

            // tool function(s) //

            function checkCurrentPageSwitches() {
                let samples = [
                    "timers_countdown_check_own_switch",
                    "timers_countdown_check_friends_switch",
                    "timers_uninterrupted_check_switch",
                    "timers_insurance_switch",
                ];
                if (!sess_cfg.timers_self_manage_switch) return true;
                let chk = tag_name => $view.findViewByTag(view, tag_name, 3)._checkbox_switch.checked;
                for (let i = 0, len = samples.length; i < len; i += 1) {
                    if (chk(samples[i])) return true;
                }
                dialogs.builds(["提示", "自动管理机制需至少选择一个", 0, 0, "返回"]).show();
            }

            function checkAutoUnlockSwitch() {
                if (sess_cfg.auto_unlock_switch
                    || $sto.af.get("timers_prefer_auto_unlock_dialog_prompt_prompted")
                ) return true;
                let timers_prefer_auto_unlock_dialog_prompt_prompted = false;
                let diag = dialogs.builds([
                    ["请注意", "caution_btn_color"],
                    "timers_prefer_auto_unlock", 0, 0, " OK ", 1, 1
                ]);
                diag.on("check", checked => timers_prefer_auto_unlock_dialog_prompt_prompted = !!checked);
                diag.on("positive", () => {
                    if (timers_prefer_auto_unlock_dialog_prompt_prompted) {
                        $sto.af.put("timers_prefer_auto_unlock_dialog_prompt_prompted", true);
                    }
                    diag.dismiss();
                    $view.pageJump("back");
                });
                diag.show();
            }
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "timers_self_manage_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("自动管理机制", {subhead_color: $defs.subhead_highlight_color}))
        .add("checkbox_switch", new Layout("主页最小倒计时机制", {
            config_conj: "timers_countdown_check_own_switch",
            tag_name: "timers_countdown_check_own_switch",
            listeners: {
                _checkbox_switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._checkbox_switch.setChecked(session_conf);
            },
        }))
        .add("button", new Layout("定时任务提前运行", "hint", {
            config_conj: "timers_countdown_check_own_timed_task_ahead",
            newWindow: function () {
                let diag = dialogs.builds([
                    "定时任务提前运行", "timers_countdown_check_timed_task_ahead",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=3,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 3 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    if (value === 0) saveThisSession();
                    else if (!sess_cfg.homepage_monitor_switch) {
                        let diag_confirm = dialogs.builds([
                            ["请注意", "caution_btn_color"], "timers_ahead_prefer_monitor_own",
                            0, "放弃", ["确定", "warn_btn_color"], 1
                        ]);
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            saveThisSession();
                        });
                        diag_confirm.show();
                    } else if (sess_cfg.homepage_monitor_switch && value > sess_cfg.homepage_monitor_threshold) {
                        let diag_confirm = dialogs.builds([["请注意", "caution_btn_color"], "", 0, "放弃", ["确定", "warn_btn_color"], 1], {
                            content: "当前设置值: " + value + "\n" +
                                "主页能量球监测阈值: " + sess_cfg.homepage_monitor_threshold + "\n\n" +
                                "设置值大于主页能量球监测阈值\n\n" +
                                "此情况下提前运行脚本\n主页能量球最小倒计时可能未达到监测阈值\n因此可能无法监测收取\n\n" +
                                "确定要保留当前设置值吗",
                        });
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            saveThisSession();
                        });
                        diag_confirm.show();
                    } else saveThisSession();

                    // tool function(s) //

                    function saveThisSession() {
                        $save.session(config_conj, ~~value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                let session_value = +sess_cfg[this.config_conj];
                let value = isNaN(session_value) ? $sto.def.af[this.config_conj] : session_value;
                view._hint.text(value === 0 ? "已关闭" : (value.toString() + " min"));
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("排行榜最小倒计时机制", {
            config_conj: "timers_countdown_check_friends_switch",
            tag_name: "timers_countdown_check_friends_switch",
            listeners: {
                _checkbox_switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._checkbox_switch.setChecked(session_conf);
            },
        }))
        .add("button", new Layout("定时任务提前运行", "hint", {
            config_conj: "timers_countdown_check_friends_timed_task_ahead",
            newWindow: function () {
                let diag = dialogs.builds([
                    "定时任务提前运行", "timers_countdown_check_timed_task_ahead",
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=5,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 5 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    if (value === 0) saveThisSession();
                    else if (!sess_cfg.rank_list_review_switch || !sess_cfg.rank_list_review_threshold_switch) {
                        let diag_confirm = dialogs.builds([
                            ["请注意", "caution_btn_color"],
                            "timers_ahead_prefer_rank_list_threshold_review",
                            0, "放弃", ["确定", "warn_btn_color"], 1
                        ]);
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            saveThisSession();
                        });
                        diag_confirm.show();
                    } else if (sess_cfg.rank_list_review_switch
                        && sess_cfg.rank_list_review_threshold_switch
                        && value > sess_cfg.rank_list_review_threshold
                    ) {
                        let diag_confirm = dialogs.builds([["请注意", "caution_btn_color"], "", 0, "放弃", ["确定", "warn_btn_color"], 1], {
                            content: "当前设置值: " + value + "\n" +
                                "排行榜样本复查最小倒计时阈值: " + sess_cfg.rank_list_review_threshold + "\n\n" +
                                "设置值大于样本复查最小倒计时阈值\n\n" +
                                "此情况下提前运行脚本\n排行榜样本最小倒计时可能未达到监测阈值\n因此可能无法完成倒计时监测\n\n" +
                                "确定要保留当前设置值吗",
                        });
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            saveThisSession();
                        });
                        diag_confirm.show();
                    } else saveThisSession();

                    // tool function(s) //

                    function saveThisSession() {
                        $save.session(config_conj, ~~value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                let session_value = +sess_cfg[this.config_conj];
                let value = isNaN(session_value) ? $sto.def.af[this.config_conj] : session_value;
                view._hint.text(value === 0 ? "已关闭" : (value.toString() + " min"));
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("延时接力机制", {
            config_conj: "timers_uninterrupted_check_switch",
            view_tag: "timers_uninterrupted_check_switch",
            listeners: {
                _checkbox_switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._checkbox_switch.setChecked(session_conf);
            },
        }))
        .add("page", new Layout("管理时间区间", "hint", {
            config_conj: "timers_uninterrupted_check_sections",
            next_page: "timers_uninterrupted_check_sections_page",
            updateOpr: function (view) {
                let areas = sess_cfg[this.config_conj];
                let areas_len = areas ? areas.length : 0;
                view._hint.text(areas_len ? "包含区间: " + areas_len + " 组" : "未设置");
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("意外保险机制", {
            config_conj: "timers_insurance_switch",
            view_tag: "timers_insurance_switch",
            listeners: {
                _checkbox_switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._checkbox_switch.setChecked(session_conf);
            },
        }))
        .add("button", new Layout("保险任务运行间隔", "hint", {
            config_conj: "timers_insurance_interval",
            newWindow: function () {
                let diag = dialogs.builds([
                    "保险任务运行间隔", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=10,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 10 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString() + " min");
            },
        }))
        .add("button", new Layout("最大连续保险次数", "hint", {
            config_conj: "timers_insurance_max_continuous_times",
            newWindow: function () {
                let diag = dialogs.builds([
                    "最大连续保险次数", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=5,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 5 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString());
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow: function () {
                let diag = dialogs.builds(["关于定时任务自动管理机制", "about_timers_self_manage", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$view.addPage(["定时任务控制面板", "timers_control_panel_page"], function () {
    $view.setPage(arguments[0], (parent_view) => {
        $view.setTimersControlPanelPageButtons(parent_view, "timed_tasks", wizardFunc)
    }, {no_scroll_view: true})
        .add("list", new Layout("/*管理本项目定时任务*/", {
            list_head: "timed_tasks",
            data_source_key_name: "timed_tasks",
            custom_data_source: function () {
                let all_tasks = timers.queryTimedTasks({
                    path: files.cwd() + "/Ant_Forest_Launcher.js",
                });

                let data_source = [];

                all_tasks.forEach(task => data_source.push({
                    task: task,
                    type: preprocessDataSourceType(timedTaskTimeFlagConverter(task.getTimeFlag()), task.id),
                    next_run_time: task.getNextTime(),
                }));

                return data_source;

                // tool function(s) //

                function preprocessDataSourceType(arr, id) {
                    if (arr.length) return arr;
                    let type_info = {
                        min_countdown: "最小倒计时",
                        uninterrupted: "延时接力",
                        insurance: "意外保险",
                        postponed: "用户推迟",
                        postponed_auto: "自动推迟",
                    };

                    let sto_auto_task = $sto.af.get("next_auto_task");
                    if (sto_auto_task && id === sto_auto_task.task_id) return type_info[sto_auto_task.type];

                    let sto_ins_tasks = $sto.af.get("insurance_tasks", []);
                    if (sto_ins_tasks.length && ~sto_ins_tasks.indexOf(id)) return type_info.insurance;

                    return 0; // "一次性"
                }
            },
            list_checkbox: "gone",
            listeners: {
                _list_data: {
                    item_click: function (item, idx, item_view, list_view) {
                        let {task, list_item_name_0} = item;
                        let [type, next_run_time] = [list_item_name_0, task.getNextTime()];
                        let type_code = $tool.restoreFromTimedTaskTypeStr(type);
                        let task_id = task.id;

                        let {data_source_key_name, custom_data_source} = this;
                        let reInitDataSource = () => $view.updateDataSource(
                            data_source_key_name, "re_init",
                            custom_data_source.bind(this)()
                        );

                        let type_info = {
                            min_countdown: "最小倒计时",
                            uninterrupted: "延时接力",
                            insurance: "意外保险",
                            postponed: "用户推迟",
                            postponed_auto: "自动推迟",
                        };

                        let keys = Object.keys(type_info);
                        for (let i = 0, len = keys.length; i < len; i += 1) {
                            let key = keys[i];
                            if (type_info[key] === type_code) {
                                type_code = key;
                                break;
                            }
                        }

                        let diag = dialogs.builds([
                            "任务详情", showDiagContent(), ["删除任务", "caution_btn_color"], ["编辑任务", "warn_btn_color"], "关闭", 1
                        ]);
                        diag.on("neutral", () => {
                            let diag_confirm = dialogs.builds([
                                "删除提示", "确认要删除当前任务吗\n此操作将立即生效且无法撤销",
                                0, "放弃", ["删除", "caution_btn_color"], 1,
                            ]);
                            diag_confirm.on("negative", () => diag_confirm.dismiss());
                            diag_confirm.on("positive", () => {
                                if (type_code === "min_countdown") {
                                    dialogs.builds([
                                        ["小心", "#880e4f"], ["delete_min_countdown_task_warn", "#ad1457"],
                                        0, "放弃", ["确定", "caution_btn_color"], 1,
                                    ]).on("negative", (dialog) => {
                                        dialog.dismiss();
                                    }).on("positive", (dialog) => {
                                        dialog.dismiss();
                                        deleteNow();
                                    }).show();
                                } else deleteNow();

                                // tool function(s) //

                                function deleteNow() {
                                    diag.dismiss();
                                    diag_confirm.dismiss();
                                    timers.removeTimedTask(task_id);
                                    reInitDataSource();
                                }
                            });
                            diag_confirm.show();
                        });
                        diag.on("negative", () => {
                            if (type_code !== 0 && !classof(type_code, "Array")) {
                                return dialogs.builds([
                                    "无法编辑", "仅以下类型的任务可供编辑:\n\n1. 一次性任务\n2. 每日任务\n3. 每周任务\n\n自动管理的任务不提供编辑功能",
                                    0, 0, "返回", 1
                                ]).on("positive", dialog => dialog.dismiss()).show();
                            }
                            if (!timers.getTimedTask(task_id)) {
                                return dialogs.builds([
                                    "无法编辑", "该任务ID不存在\n可能是任务已自动完成或被删除",
                                    0, 0, "返回", 1
                                ]).on("positive", dialog => dialog.dismiss()).show();
                            }
                            diag.dismiss();
                            wizardFunc("modify", task, type_code, diag);
                        });
                        diag.on("positive", () => diag.dismiss());
                        diag.show();

                        // tool function(s) //

                        function showDiagContent() {
                            let is_weekly_type = type.match(/每周/);
                            return "任务ID: " + task_id + "\n\n" +
                                "任务类型: " + (is_weekly_type ? "每周" : type) + "任务" + "\n\n" +
                                (is_weekly_type ? "任务周期: " + type.match(/\d/g).join(", ") + "\n\n" : "") +
                                "下次运行: " + $tool.getTimeStrFromTimestamp(next_run_time, "time_str_full");
                        }
                    },
                    item_bind: function (item_view, item_holder) {
                        item_view._checkbox.setVisibility(8);
                    }
                },
                ui: {
                    resume: function () {
                        let {data_source_key_name, custom_data_source} = this;
                        $view.updateDataSource(
                            data_source_key_name, "re_init",
                            custom_data_source.bind(this)()
                        );
                    },
                }
            },
        }))
        .add("info", new Layout("此页全部操作将立即生效且无法撤销"))
        .ready();

    // tool function(s) //

    function wizardFunc(operation, task, type_code, diag_before_modifying) {
        let modify_mode = operation === "modify";

        let type_str = null;
        if (modify_mode) type_str = type_code === 0 ? "disposable" : (type_code.length < 7 ? "weekly" : "daily");

        let task_type_map = {
            disposable: "一次性任务",
            daily: "每日任务",
            weekly: "每周任务",
        };

        let diag_main = dialogs.builds([
            "选择定时任务类型", "",
            ["了解详情", "hint_btn_bright_color"], "放弃", "下一步", 1,
        ], {
            items: ["disposable", "daily", "weekly"].map(i => task_type_map[i]),
            itemsSelectMode: "single",
            itemsSelectedIndex: 0,
        });
        diag_main.on("neutral", () => {
            dialogs.builds(
                ["关于定时任务类型设置", "about_timed_task_type", 0, 0, "关闭", 1]
            ).on("positive", dialog => dialog.dismiss()).show();
        });
        diag_main.on("negative", () => diag_main.dismiss());
        // diag_main.on("positive", () => null); // taken over by "single_choice"
        diag_main.on("single_choice", (index, value, dialog) => {
            let keys = Object.keys(task_type_map);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                let key = keys[i];
                if (value === task_type_map[key]) {
                    diag_main.dismiss();
                    showTimePickView(key);
                    break;
                }
            }
        });

        modify_mode ? showTimePickView(type_str) : diag_main.show();

        // tool function(s) //

        function showTimePickView(type_str) {
            // type_str
            // modify_mode
            let view_title_text_prefix = (modify_mode ? "修改" : "设置") + task_type_map[type_str];
            $view.setTimePickerView({
                picker_views: [type_str === "disposable" ? {
                    type: "date",
                    text: view_title_text_prefix + "日期",
                    init: task ? task.getNextTime() : null
                } : {
                    type: "time",
                    text: view_title_text_prefix + "时间",
                    init: task ? task.getNextTime() : null
                }, type_str === "weekly" ? {
                    type: "week",
                    text: view_title_text_prefix + "星期",
                    init: task ? task.getTimeFlag() : null
                } : type_str === "daily" ? {} : {
                    type: "time",
                    text: view_title_text_prefix + "时间",
                    init: task ? task.getNextTime() : null
                }],
                time_str: {
                    prefix: "已选择",
                },
                buttons: {
                    back_btn: {
                        onClickListener: (getTimeInfoFromPicker, closeTimePickerPage) => {
                            diag_before_modifying && diag_before_modifying.show();
                            closeTimePickerPage();
                        },
                    },
                    confirm_btn: {
                        onClickListener: (getTimeInfoFromPicker, closeTimePickerPage) => {
                            if (type_str === "weekly") {
                                let days_of_week = getTimeInfoFromPicker(2).daysOfWeek();
                                if (!days_of_week.length) return alert("需至少选择一个星期");
                                closeTimePickerPage({days_of_week: days_of_week, timestamp: getTimeInfoFromPicker(1).timestamp()});
                            } else if (type_str === "disposable") {
                                let set_time = getTimeInfoFromPicker(0).timestamp();
                                if (set_time <= new Date().getTime()) return alert("设置时间需大于当前时间");
                                closeTimePickerPage(set_time);
                            } else if (type_str === "daily") {
                                closeTimePickerPage(getTimeInfoFromPicker(1).timestamp());
                            }
                        },
                    },
                },
                onFinish: (return_value) => {
                    let new_task = update() || add();

                    if (diag_before_modifying && 0) {
                        diag_before_modifying.show();
                        diag_before_modifying.setContent(
                            "任务ID: " + new_task.id + "\n\n" +
                            "任务类型: " + task_type_map[type_str] + "\n\n" + (
                                type_str === "weekly" ? "任务周期: " + $tool.getTimedTaskTypeStr(
                                    timedTaskTimeFlagConverter(new_task.getTimeFlag())
                                ).match(/\d/g).join(", ") + "\n\n" : ""
                            ) + "下次运行: " + $tool.getTimeStrFromTimestamp(return_value, "time_str_full")
                        );
                    }
                    ui.emitter.emit("resume"); // to fresh data list; maybe not a good way

                    // tool function(s) //

                    function trimTimestamp(time, string_flag) {
                        let d = new Date(time);
                        if (string_flag) return $tool.getTimeStrFromTimestamp(time).match(/\d+:\d+/)[0];
                        return time - +new Date(d.getFullYear(), d.getMonth(), d.getDate())
                    }

                    function update() {
                        let current_task = task && timers.getTimedTask(task.id);
                        if (!current_task) return;

                        if (type_str === "disposable") {
                            current_task.setMillis(return_value);
                        } else if (type_str === "daily") {
                            current_task.setMillis(trimTimestamp(return_value));
                        } else if (type_str === "weekly") {
                            current_task.setMillis(trimTimestamp(return_value.timestamp));
                            current_task.setTimeFlag(timedTaskTimeFlagConverter(return_value.days_of_week));
                        } else return;

                        timers.updateTimedTask(current_task);
                        return current_task;
                    }

                    function add() {
                        let path = files.cwd() + "/Ant_Forest_Launcher.js";
                        if (type_str === "disposable") timers.addDisposableTask({
                            path: path,
                            date: return_value,
                        });
                        else if (type_str === "daily") timers.addDailyTask({
                            path: path,
                            time: trimTimestamp(return_value, true),
                        });
                        else if (type_str === "weekly") timers.addWeeklyTask({
                            path: path,
                            time: trimTimestamp(return_value.timestamp, true),
                            daysOfWeek: return_value.days_of_week,
                        });
                    }
                },
            });
        }
    }
});
$view.addPage(["延时接力管理", "timers_uninterrupted_check_sections_page"], function () {
    $view.setPage(arguments[0], (parent_view) => {
        let data_source_key_name = "timers_uninterrupted_check_sections";
        $view.setTimersUninterruptedCheckAreasPageButtons(parent_view, data_source_key_name);
    }, {no_scroll_view: true})
        .add("list", new Layout("/*延时接力时间区间*/", {
            list_head: "timers_uninterrupted_check_sections",
            data_source_key_name: "timers_uninterrupted_check_sections",
            list_checkbox: "visible",
            listeners: {
                _list_data: {
                    item_long_click: function (e, item, idx, item_view, list_view) {
                        item_view._checkbox.checked && item_view._checkbox.click();
                        e.consumed = true;
                        let {data_source_key_name} = this;
                        let edit_item_diag = dialogs.builds(["编辑列表项", "点击需要编辑的项", 0, "返回", "确认", 1], {
                            items: ["\xa0"],
                        });

                        refreshItems();

                        edit_item_diag.on("positive", () => {
                            let sectionStringTransform = () => {
                                let arr = $cfg.list_heads[data_source_key_name];
                                for (let i = 0, len = arr.length; i < len; i += 1) {
                                    let o = arr[i];
                                    if ("section" in o) return o.stringTransform;
                                }
                            };
                            $view.updateDataSource(data_source_key_name, "splice", [idx, 1, {
                                section: sectionStringTransform().backward(edit_item_diag.getItems().toArray()[0].split(": ")[1]),
                                interval: +edit_item_diag.getItems().toArray()[1].split(": ")[1],
                            }]);
                            if (!equalObjects(sess_cfg[data_source_key_name], sto_cfg[data_source_key_name])) {
                                sess_par[data_source_key_name + "_btn_restore"].switch_on();
                            }
                            edit_item_diag.dismiss();
                        });
                        edit_item_diag.on("negative", () => edit_item_diag.dismiss());
                        edit_item_diag.on("item_select", (idx, list_item, dialog) => {
                            let list_item_prefix = list_item.split(": ")[0];
                            let list_item_content = list_item.split(": ")[1];

                            if (list_item_prefix === "区间") {
                                edit_item_diag.dismiss();
                                $view.setTimePickerView({
                                    picker_views: [
                                        {type: "time", text: "设置开始时间", init: $tool.timeStrToSection(list_item_content)[0]},
                                        {type: "time", text: "设置结束时间", init: $tool.timeStrToSection(list_item_content)[1]},
                                    ],
                                    time_str: {
                                        suffix: (getStrFunc) => {
                                            if (getStrFunc(2).default() <= getStrFunc(1).default()) return "(+1)";
                                        },
                                    },
                                    onFinish: (return_value) => {
                                        edit_item_diag.show();
                                        return_value && refreshItems(list_item_prefix, return_value);
                                    },
                                });
                            }

                            if (list_item_prefix === "间隔") {
                                let diag = dialogs.builds(["修改" + list_item_prefix, "", 0, "返回", "确认修改", 1], {
                                    inputHint: "{x|1<=x<=600,x∈N}",
                                    inputPrefill: list_item_content.toString(),
                                });
                                diag.on("negative", () => diag.dismiss());
                                diag.on("positive", dialog => {
                                    let input = diag.getInputEditText().getText().toString();
                                    if (input === "") return dialog.dismiss();
                                    let value = +input;
                                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                                    if (value > 600 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                                    refreshItems(list_item_prefix, ~~value);
                                    diag.dismiss();
                                });
                                diag.show();
                            }
                        });
                        edit_item_diag.show();

                        // tool function(s) //

                        function refreshItems(prefix, value) {
                            let value_obj = {};
                            let key_map = {
                                0: "区间",
                                1: "间隔",
                            };
                            if (!prefix && !value) {
                                value_obj = {};
                                value_obj[key_map[0]] = item[item.section];
                                value_obj[key_map[1]] = item[item.interval];
                            } else {
                                edit_item_diag.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                            }
                            if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                            let items = [];
                            Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                            edit_item_diag.setItems(items);
                        }
                    },
                    item_click: function (item, idx, item_view, list_view) {
                        item_view._checkbox.click();
                    },
                    item_bind: function (item_view, item_holder) {
                        item_view._checkbox.on("click", (checkbox_view) => {
                            return $view.commonItemBindCheckboxClickListener
                                .bind(this)(checkbox_view, item_holder);
                        });
                    },
                },
                _check_all: {
                    click: function (view) {
                        let {data_source_key_name} = this;
                        let aim_checked = view.checked;
                        let blacklist_len = sess_par[data_source_key_name].length;
                        if (!blacklist_len) return view.checked = !aim_checked;

                        sess_par[data_source_key_name].forEach((o, idx) => {
                            let o_new = deepCloneObject(o);
                            o_new.checked = aim_checked;
                            $view.updateDataSource(data_source_key_name, "splice", [idx, 1, o_new]);
                        });

                        let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                        let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                        sess_par[deleted_items_idx_count] = aim_checked ? blacklist_len : 0;
                        sess_par[deleted_items_idx] = sess_par[deleted_items_idx] || {};
                        for (let i = 0; i < blacklist_len; i += 1) {
                            sess_par[deleted_items_idx][i] = aim_checked;
                        }

                        let remove_btn = sess_par[data_source_key_name + "_btn_remove"];
                        aim_checked ? blacklist_len && remove_btn.switch_on() : remove_btn.switch_off();
                    },
                },
            },
        }))
        .add("info", new Layout("/*dynamic_info*/", {
            updateOpr: function (view) {
                let amount = sess_cfg.timers_uninterrupted_check_sections.length;
                view._info_text.setText(amount ? "时间区间的\"+1\"表示次日时间" : "点击添加按钮可添加区间");
            },
        }))
        .add("info", new Layout("长按列表项可编辑项目 点击标题可排序", {
            updateOpr: function (view) {
                let amount = sess_cfg.timers_uninterrupted_check_sections.length;
                view.setVisibility(amount ? 0 : 8);
            },
        }))
        .ready();
});
$view.addPage(["账户功能", "account_page"], function () {
    $view.setPage(arguments[0], null, {
        check_page_state: (view) => {
            let {main_account_info} = sess_cfg;
            if (!view._switch.checked) return true;
            if (classof(main_account_info, "Object") && Object.keys(main_account_info).length) return true;
            let diag_prompt = dialogs.builds(["提示", "当前未设置主账户信息\n继续返回将关闭账户功能", 0, "放弃返回", ["继续返回", "warn_btn_color"]]);
            diag_prompt.on("positive", () => {
                view._switch.setChecked(false);
                $view.pageJump("back");
            });
            diag_prompt.on("negative", () => diag_prompt.dismiss());
            diag_prompt.show();
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "account_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("主账户设置", {subhead_color: $defs.subhead_highlight_color}))
        .add("button", new Layout("主账户信息", "hint", {
            config_conj: "main_account_info",
            checkMainAccountInfo: function () {
                let main_account_info = sess_cfg[this.config_conj];
                return classof(main_account_info, "Object") && Object.keys(main_account_info).length;
            },
            newWindow: function () {
                $view.setInfoInputView({
                    input_views: [
                        {
                            type: "account", text: "账户", hint_text: "未设置", init: sess_cfg[this.config_conj].account_name
                        },
                        {
                            type: "password", text: "密码", hint_text: () => {
                                return sess_cfg[this.config_conj].account_code ? "已设置 (点击修改)" : "未设置";
                            }
                        },
                    ],
                    buttons: {
                        reserved_btn: {
                            text: "帮助",
                            onClickListener: () => {
                                let diag = dialogs.builds([
                                    "信息录入提示", "account_info_hint",
                                    ["了解密码存储", "hint_btn_bright_color"], 0, "关闭", 1
                                ]);
                                diag.on("neutral", () => dialogs.builds(["密码存储方式", "how_password_stores", 0, 0, "关闭"]).show());
                                diag.on("positive", () => diag.dismiss());
                                diag.show();
                            },
                            // hint_color: "#ffcdd2",
                        },
                        confirm_btn: {
                            onClickListener: (input_views_obj, closeInfoInputPage) => {
                                let account_view = input_views_obj["账户"];
                                let code_view = input_views_obj["密码"];
                                let account_name = account_view.input_area.getText().toString();
                                let account_code = code_view.input_area.getText().toString();

                                let final_data = Object.assign({}, sess_cfg[this.config_conj] || {});
                                if (account_name) {
                                    final_data.account_name = $tool.accountNameConverter(account_name, "encrypt");
                                    if (account_code) final_data.account_code = global.encrypt(account_code);
                                    $save.session(this.config_conj, final_data);
                                    closeInfoInputPage();
                                } else {
                                    if (final_data.account_code) {
                                        let diag_confirm = dialogs.builds([
                                            "提示", "未设置账户时\n已存在的密码数据将被销毁\n主账户信息恢复为\"未设置\"状态\n确定继续吗",
                                            0, "返回", "确定", 1
                                        ]);
                                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                                        diag_confirm.on("positive", () => {
                                            final_data = {};
                                            $save.session(this.config_conj, final_data);
                                            diag_confirm.dismiss();
                                            closeInfoInputPage();
                                        });
                                        diag_confirm.show();
                                    } else {
                                        $save.session(this.config_conj, final_data);
                                        closeInfoInputPage();
                                        final_data = {};
                                    }
                                }
                            },
                        },
                        additional: [
                            [{
                                text: "  信息销毁  ",
                                hint_color: "#ef9a9a",
                                onClickListener: (input_views_obj, closeInfoInputPage) => {
                                    let config_conj = "main_account_info";
                                    let checkMainAccountInfo = () => {
                                        let main_account_info = sess_cfg[config_conj];
                                        return classof(main_account_info, "Object") && Object.keys(main_account_info).length;
                                    };

                                    if (!checkMainAccountInfo()) return toast("无需销毁");

                                    let diag = dialogs.builds([
                                        "主账户信息销毁", "destroy_main_account_info",
                                        0, "返回", ["销毁", "warn_btn_color"]
                                    ]);
                                    diag.on("negative", () => diag.dismiss());
                                    diag.on("positive", () => {
                                        let diag_confirm = dialogs.builds([
                                            "确认销毁吗", "此操作本次会话无法撤销\n销毁后需在首页\"保存\"生效",
                                            0, "放弃", ["确认", "caution_btn_color"], 1
                                        ]);
                                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                                        diag_confirm.on("positive", () => {
                                            $save.session(config_conj, {});
                                            input_views_obj["账户"].input_area.setText("");
                                            let pw_input_area = input_views_obj["密码"].input_area;
                                            pw_input_area.setViewHintText("未设置");
                                            pw_input_area.setText("");
                                            toast("信息已销毁");
                                            diag_confirm.dismiss();
                                        });
                                        diag_confirm.show();
                                    });
                                    diag.show();
                                },
                            }],
                            [{
                                text: "从 [ 支付宝 ] 录入信息",
                                hint_color: "#c5cae9",
                                onClickListener: (input_views_obj, closeInfoInputPage) => {
                                    let diag = dialogs.builds([
                                        "从支付宝录入信息", "get_account_name_from_alipay",
                                        0, "返回", "开始获取", 1
                                    ]);
                                    diag.on("negative", () => diag.dismiss());
                                    diag.on("positive", () => {
                                        let storage_key_name = "collected_current_account_name";
                                        $sto.af.remove(storage_key_name);
                                        toast("即将打开\"支付宝\"采集当前账户名");
                                        diag.dismiss();
                                        engines.execScriptFile("./Ant_Forest_Launcher.js", {
                                            arguments: {
                                                cmd: "get_cur_acc_name",
                                                instant_run_flag: true,
                                                no_insurance_flag: true,
                                            },
                                        });
                                        threads.starts(function () {
                                            waitForAndClickAction(text("打开"), 3500, 300, {click_strategy: "widget"});
                                        });
                                        threads.starts(function () {
                                            waitForAction(() => currentPackage().match(/AlipayGphone/), 8000);
                                            ui.emitter.prependOnceListener("resume", () => {
                                                let collected_name = $sto.af.get(storage_key_name, "");
                                                $sto.af.remove(storage_key_name);
                                                collected_name ? debugInfo("存储模块中发现账户名") : debugInfo("存储模块中未发现账户名");
                                                if (!collected_name) return toast("未能成功采集到当前账户名");

                                                let {input_area} = input_views_obj["账户"];
                                                let _acc = $tool.accountNameConverter(collected_name, "decrypt");
                                                input_area.setText(_acc);

                                                threads.starts(function () {
                                                    let max_try_times_input = 3;
                                                    while (max_try_times_input--) {
                                                        if (waitForAction(() => {
                                                            return input_area.getText().toString() === _acc;
                                                        }, 1000)) break;
                                                        ui.post(() => input_area.setText(_acc));
                                                    }
                                                    if (max_try_times_input >= 0) {
                                                        toast("已自动填入账户名");
                                                    } else {
                                                        let diag = dialogs.builds([
                                                            "提示", "自动填入账户名失败\n账户名已复制到剪切板\n可手动粘贴至\"账户\"输入框内",
                                                            0, 0, "返回", 1
                                                        ]);
                                                        diag.on("negative", () => diag.dismiss());
                                                        diag.show();
                                                    }
                                                });
                                            });
                                        });
                                    });
                                    diag.show();
                                },
                            }, {
                                text: "从 [ 账户库 ] 录入信息",
                                hint_color: "#d1c4e9",
                                onClickListener: (input_views_obj, closeInfoInputPage) => {
                                    dialogs.builds(["从账户库录入信息", "此功能暂未完成开发", 0, 0, "返回"]).show();
                                },
                            }]
                        ],
                    },
                });

                if (!$sto.af.get("before_use_main_account_dialog_prompt_prompted")) {
                    let before_use_main_account_dialog_prompt_prompted = false;
                    let diag = dialogs.builds(["功能使用提示", "before_use_main_account", 0, 0, "继续使用", 1, 1]);
                    diag.on("check", checked => before_use_main_account_dialog_prompt_prompted = !!checked);
                    diag.on("positive", () => {
                        if (before_use_main_account_dialog_prompt_prompted) {
                            $sto.af.put("before_use_main_account_dialog_prompt_prompted", true);
                        }
                        diag.dismiss();
                    });
                    diag.show();
                }
            },
            updateOpr: function (view) {
                view._hint.text(this.checkMainAccountInfo() ? "已设置" : "未设置");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("page", new Layout("旧账户回切", "hint", {
            config_conj: "account_log_back_in_switch",
            next_page: "account_log_back_in_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow: function () {
                let diag = dialogs.builds(["关于账户功能", "about_account_function", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$view.addPage(["旧账户回切", "account_log_back_in_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "account_log_back_in_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("最大连续回切次数", "hint", {
            config_conj: "account_log_back_in_max_continuous_times",
            newWindow: function () {
                let diag = dialogs.builds([
                    "设置最大连续回切次数", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|0<=x<=10,x∈N*}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 10 || value < 0) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(this.config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                let session_value = +sess_cfg[this.config_conj];
                if (isNaN(session_value)) session_value = +$sto.def.af[this.config_conj];
                view._hint.text((session_value === 0 ? "无限制" : session_value).toString());
            },
        }))
        .ready();
});
$view.addPage(["黑名单管理", "blacklist_page"], function () {
    $view.setPage(arguments[0])
        .add("subhead", new Layout("蚂蚁森林名单簿", {subhead_color: $defs.subhead_highlight_color}))
        .add("page", new Layout("能量罩黑名单", "hint", {
            next_page: "cover_blacklist_page",
            updateOpr: function (view) {
                let amount = sess_cfg.blacklist_protect_cover.length;
                view._hint.text(amount ? "包含成员:  " + amount + " 人" : "空名单");
            },
        }))
        .add("page", new Layout("收取/帮收黑名单", "hint", {
            next_page: "collect_blacklist_page",
            updateOpr: function (view) {
                let amount = sess_cfg.blacklist_by_user.length;
                view._hint.text(amount ? "包含成员:  " + amount + " 人" : "空名单");
            },
        }))
        // .add("page", new Layout("返水黑名单", "hint", {
        //     next_page: "collect_blacklist_page",
        //     updateOpr: function (view) {
        //         let amount = sess_cfg.blacklist_by_user.length;
        //         view._hint.text(amount ? "包含成员:  " + amount + " 人" : "空名单");
        //     },
        // }))
        .add("split_line")
        .add("subhead", new Layout("应用程序名单簿", {subhead_color: $defs.subhead_highlight_color}))
        .add("page", new Layout("前置应用黑名单", "hint", {
            next_page: "foreground_app_blacklist_page",
            updateOpr: function (view) {
                let hint_text = "空名单";
                let {foreground_app_blacklist} = sess_cfg;
                foreground_app_blacklist = foreground_app_blacklist || [];
                let amount = foreground_app_blacklist.length;
                if (amount) {
                    hint_text = "包含应用:  " + amount + " 项";
                    let invalid_items_count = 0;
                    foreground_app_blacklist.forEach((o) => {
                        let {app_combined_name} = o;
                        if (app_combined_name) {
                            let pkg_name = app_combined_name.split("\n")[1];
                            if (!app.getAppName(pkg_name)) invalid_items_count += 1;
                        }
                    });
                    hint_text += invalid_items_count ? "  ( 含有 " + invalid_items_count + " 个无效项 )" : "";
                }
                view._hint.text(hint_text);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow: function () {
                let diag = dialogs.builds(["关于黑白名单管理", "about_blacklist", 0, 0, "关闭", 1]); //// PENDING ////
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$view.addPage(["能量罩黑名单", "cover_blacklist_page"], function () {
    $view.setPage(arguments[0], null, {no_scroll_view: true})
        .add("list", new Layout("/*能量罩黑名单成员*/", {
            list_head: "blacklist_protect_cover",
            data_source_key_name: "blacklist_protect_cover",
            list_checkbox: "gone",
            listeners: {
                _list_data: {
                    item_bind: function (item_view, item_holder) {
                        item_view._checkbox.setVisibility(8);
                    }
                },
            }
        }))
        .add("info", new Layout("能量罩黑名单由脚本自动管理"))
        .ready();
});
$view.addPage(["收取/帮收黑名单", "collect_blacklist_page"], function () {
    $view.setPage(arguments[0], (parent_view) => {
        $view.setListPageButtons(parent_view, "blacklist_by_user")
    }, {no_scroll_view: true})
        .add("list", new Layout("/*收取/帮收黑名单成员*/", {
            list_head: "blacklist_by_user",
            data_source_key_name: "blacklist_by_user",
            list_checkbox: "visible",
            listeners: {
                _list_data: {
                    item_long_click: function (e, item, idx, item_view, list_view) {
                        item_view._checkbox.checked && item_view._checkbox.click();
                        e.consumed = true;
                        let {data_source_key_name} = this;
                        let edit_item_diag = dialogs.builds(
                            ["编辑列表项", "点击需要编辑的项", 0, "返回", "确认", 1],
                            {items: ["\xa0"]}
                        );

                        refreshItems();

                        edit_item_diag.on("positive", () => {
                            let new_item = {};
                            new_item.name = edit_item_diag.getItems().toArray()[0].split(": ")[1];
                            let input = edit_item_diag.getItems().toArray()[1].split(": ")[1];
                            new_item.timestamp = $tool.restoreFromTimestamp(input);
                            $view.updateDataSource(data_source_key_name, "splice", [idx, 1, new_item]);
                            if (!equalObjects(sess_cfg[data_source_key_name], sto_cfg[data_source_key_name])) {
                                sess_par[data_source_key_name + "_btn_restore"].switch_on();
                            }
                            edit_item_diag.dismiss();
                        });
                        edit_item_diag.on("negative", () => edit_item_diag.dismiss());
                        edit_item_diag.on("item_select", (idx, list_item, dialog) => {
                            let list_item_prefix = list_item.split(": ")[0];
                            let list_item_content = list_item.split(": ")[1];

                            if (list_item_prefix === "好友昵称") {
                                dialogs.rawInput("修改" + list_item_prefix, list_item_content, input => {
                                    if (input) refreshItems(list_item_prefix, input);
                                });
                            }

                            if (list_item_prefix === "解除时间") {
                                edit_item_diag.dismiss();
                                let init_value = $tool.restoreFromTimestamp(list_item_content);
                                if (!isFinite(init_value)) init_value = null;
                                $view.setTimePickerView({
                                    picker_views: [
                                        {type: "date", text: "设置日期", init: init_value},
                                        {type: "time", text: "设置时间", init: init_value},
                                    ],
                                    time_str: {
                                        prefix: "已选择",
                                    },
                                    buttons: {
                                        reserved_btn: {
                                            text: "设置 '永不'",
                                            onClickListener: (getTimeInfoFromPicker, closeTimePickerPage) => {
                                                closeTimePickerPage(Infinity);
                                            },
                                        },
                                        confirm_btn: {
                                            onClickListener: (getTimeInfoFromPicker, closeTimePickerPage) => {
                                                let set_time = getTimeInfoFromPicker(0).timestamp();
                                                if (set_time <= new Date().getTime()) return alert("设置时间需大于当前时间");
                                                closeTimePickerPage(set_time);
                                            },
                                        },
                                    },
                                    onFinish: (return_value) => {
                                        edit_item_diag.show();
                                        refreshItems(list_item_prefix, $tool.getTimeStrFromTimestamp(return_value, "time_str_remove"));
                                    },
                                });
                            }
                        });
                        edit_item_diag.show();

                        // tool function(s) //

                        function refreshItems(prefix, value) {
                            let value_obj = {};
                            let key_map = {
                                0: "好友昵称",
                                1: "解除时间",
                            };
                            if (!prefix && !value) {
                                value_obj = {};
                                value_obj[key_map[0]] = item[item.name];
                                value_obj[key_map[1]] = item[item.timestamp];
                            } else {
                                edit_item_diag.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                            }
                            if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                            let items = [];
                            Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                            edit_item_diag.setItems(items);
                        }
                    },
                    item_click: function (item, idx, item_view, list_view) {
                        item_view._checkbox.click();
                    },
                    item_bind: function (item_view, item_holder) {
                        item_view._checkbox.on("click", (checkbox_view) => {
                            return $view.commonItemBindCheckboxClickListener
                                .bind(this)(checkbox_view, item_holder);
                        });
                    },
                },
                _check_all: {
                    click: function (view) {
                        let {data_source_key_name} = this;
                        let aim_checked = view.checked;
                        let blacklist_len = sess_par[data_source_key_name].length;
                        if (!blacklist_len) return view.checked = !aim_checked;

                        sess_par[data_source_key_name].forEach((o, idx) => {
                            let o_new = deepCloneObject(o);
                            o_new.checked = aim_checked;
                            $view.updateDataSource(data_source_key_name, "splice", [idx, 1, o_new]);
                        });

                        let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                        let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                        sess_par[deleted_items_idx_count] = aim_checked ? blacklist_len : 0;
                        sess_par[deleted_items_idx] = sess_par[deleted_items_idx] || {};
                        for (let i = 0; i < blacklist_len; i += 1) {
                            sess_par[deleted_items_idx][i] = aim_checked;
                        }

                        let remove_btn = sess_par[data_source_key_name + "_btn_remove"];
                        aim_checked ? blacklist_len && remove_btn.switch_on() : remove_btn.switch_off();
                    },
                },
            },
        }))
        .add("info", new Layout("/*dynamic_info*/", {
            updateOpr: function (view) {
                let amount = sess_cfg.blacklist_by_user.length;
                view._info_text.setText(amount ? "长按列表项可编辑项目" : "点击添加按钮可添加人员");
            },
        }))
        .add("info", new Layout("点击标题可排序", {
            updateOpr: function (view) {
                let amount = sess_cfg.blacklist_by_user.length;
                view.setVisibility(amount ? 0 : 8);
            },
        }))
        .ready();
});
$view.addPage(["前置应用黑名单", "foreground_app_blacklist_page"], function () {
    $view.setPage(arguments[0], (parent_view) => {
        $view.setListPageButtons(parent_view, "foreground_app_blacklist");
    }, {no_scroll_view: true})
        .add("list", new Layout("/*前置应用黑名单项目*/", {
            list_head: "foreground_app_blacklist",
            data_source_key_name: "foreground_app_blacklist",
            list_checkbox: "visible",
            listeners: {
                _list_data: {
                    item_click: function (item, idx, item_view, list_view) {
                        item_view._checkbox.click();
                    },
                    item_bind: function (item_view, item_holder) {
                        item_view._checkbox.on("click", (checkbox_view) => {
                            return $view.commonItemBindCheckboxClickListener
                                .bind(this)(checkbox_view, item_holder);
                        });
                    },
                },
                _check_all: {
                    click: function (view) {
                        let {data_source_key_name} = this;
                        let aim_checked = view.checked;
                        let blacklist_len = sess_par[data_source_key_name].length;
                        if (!blacklist_len) return view.checked = !aim_checked;

                        sess_par[data_source_key_name].forEach((o, idx) => {
                            let o_new = deepCloneObject(o);
                            o_new.checked = aim_checked;
                            $view.updateDataSource(data_source_key_name, "splice", [idx, 1, o_new]);
                        });

                        let deleted_items_idx = data_source_key_name + "_deleted_items_idx";
                        let deleted_items_idx_count = data_source_key_name + "_deleted_items_idx_count";
                        sess_par[deleted_items_idx_count] = aim_checked ? blacklist_len : 0;
                        sess_par[deleted_items_idx] = sess_par[deleted_items_idx] || {};
                        for (let i = 0; i < blacklist_len; i += 1) {
                            sess_par[deleted_items_idx][i] = aim_checked;
                        }

                        let remove_btn = sess_par[data_source_key_name + "_btn_remove"];
                        aim_checked ? blacklist_len && remove_btn.switch_on() : remove_btn.switch_off();
                    },
                },
            },
        }))
        .add("info", new Layout("/*dynamic_info*/", {
            updateOpr: function (view) {
                let amount = sess_cfg.foreground_app_blacklist.length;
                view._info_text.setText(amount ? "点击标题可排序" : "点击添加按钮可添加应用");
            },
        }))
        .add("info", new Layout("\"有效\"标签表示应用是否存在于设备中", {
            updateOpr: function (view) {
                let amount = sess_cfg.foreground_app_blacklist.length;
                view.setVisibility(amount ? 0 : 8);
            },
        }))
        .ready();
});
$view.addPage(["运行与安全", "script_security_page"], function () {
    $view.setPage(arguments[0])
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("单次运行最大时间", "hint", {
            config_conj: "max_running_time_global",
            newWindow: function () {
                let diag = dialogs.builds([
                    "脚本单次运行最大时间", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|5<=x<=90,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 90 || value < 5) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString() + " min");
            },
        }))
        .add("button", new Layout("排他性任务最大排队时间", "hint", {
            config_conj: "max_queue_time_global",
            newWindow: function () {
                let diag = dialogs.builds([
                    "排他性任务最大排队时间", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|1<=x<=120,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 120 || value < 1) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString() + " min");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("脚本炸弹预防阈值", "hint", {
            config_conj: "min_bomb_interval_global",
            newWindow: function () {
                let diag = dialogs.builds([
                    "脚本炸弹预防阈值", this.config_conj,
                    ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|100<=x<=800,x∈N}"});
                diag.on("neutral", () => diag.getInputEditText().setText($sto.def.af[this.config_conj].toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let config_conj = this.config_conj;
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    if (value > 800 || value < 100) return alertTitle(dialog, "输入值范围不合法");
                    $save.session(config_conj, ~~value);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                view._hint.text((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("支付宝应用启动跳板", "hint", {
            config_conj: "app_launch_springboard",
            map: {
                ON: "开启跳板",
                OFF: "关闭跳板",
            },
            newWindow: function () {
                let map = this.map;
                let map_keys = Object.keys(map);
                let diag = dialogs.builds(["支付宝应用启动跳板", "", ["了解详情", "hint_btn_bright_color"], "返回", "确认修改", 1], {
                    items: map_keys.slice().map(value => map[value]),
                    itemsSelectMode: "single",
                    itemsSelectedIndex: map_keys.indexOf((sess_cfg[this.config_conj] || $sto.def.af[this.config_conj]).toString()),
                });
                diag.on("neutral", () => {
                    let diag_about = dialogs.builds(["关于启动跳板", "about_app_launch_springboard", 0, 0, "关闭", 1]);
                    diag_about.on("positive", () => diag_about.dismiss());
                    diag_about.show();
                });
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", () => {
                    $save.session(this.config_conj, map_keys[diag.selectedIndex]);
                    diag.dismiss();
                });
                diag.show();
            },
            updateOpr: function (view) {
                let value = sess_cfg[this.config_conj] || $sto.def.af[this.config_conj];
                view._hint.text("已" + this.map[value.toString()].slice(0, 2));
            },
        }))
        .add("page", new Layout("支付宝应用及页面保留", "hint", {
            config_conj: "kill_when_done_switch",
            next_page: "kill_when_done_page",
            updateOpr: function (view) {
                view._hint.text(!sess_cfg[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("page", new Layout("通话状态监测", "hint", {
            config_conj: "phone_call_state_monitor_switch",
            next_page: "phone_call_state_monitor_page",
            updateOpr: function (view) {
                view._hint.text(sess_cfg[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .ready();
});
$view.addPage(["支付宝应用及页面保留", "kill_when_done_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "kill_when_done_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("支付宝应用保留", {subhead_color: $defs.subhead_highlight_color}))
        .add("radio", new Layout(["智能保留", "总是保留"], {
            values: [true, false],
            config_conj: "kill_when_done_intelligent",
            listeners: {
                check: function (checked, view) {
                    let {text} = view;
                    checked && $save.session(this.config_conj, this.values[this.title.indexOf(text)]);
                    text === this.title[0] && $view.showOrHideBySwitch(this, checked, false, "split_line");
                },
            },
            updateOpr: function (view) {
                let session_conf = sess_cfg[this.config_conj];
                let child_idx = this.values.indexOf(session_conf);
                if (!~child_idx) return;
                let child_view = view._radiogroup.getChildAt(child_idx);
                !child_view.checked && child_view.setChecked(true);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("蚂蚁森林页面保留", {subhead_color: $defs.subhead_highlight_color}))
        .add("radio", new Layout(["智能剔除", "全部保留"], {
            values: [false, true],
            config_conj: "kill_when_done_keep_af_pages",
            listeners: {
                check: function (checked, view) {
                    let {text} = view;
                    checked && $save.session(this.config_conj, this.values[this.title.indexOf(text)]);
                    text === this.title[0] && $view.showOrHideBySwitch(this, checked, false, "split_line");
                },
            },
            updateOpr: function (view) {
                let session_conf = sess_cfg[this.config_conj];
                let child_idx = this.values.indexOf(session_conf);
                if (!~child_idx) return;
                let child_view = view._radiogroup.getChildAt(child_idx);
                !child_view.checked && child_view.setChecked(true);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解更多", {
            newWindow: function () {
                let diag = dialogs.builds(["关于支付宝应用保留", "about_kill_when_done", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$view.addPage(["通话状态监测", "phone_call_state_monitor_page"], function () {
    $view.setPage(arguments[0])
        .add("switch", new Layout("总开关", {
            config_conj: "phone_call_state_monitor_switch",
            listeners: {
                _switch: {
                    check: function (state) {
                        $save.session(this.config_conj, !!state);
                        $view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr: function (view) {
                let session_conf = !!sess_cfg[this.config_conj];
                view._switch.setChecked(session_conf);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("空闲状态值", "hint", {
            config_conj: "phone_call_state_idle_value",
            newWindow: function () {
                let diag = dialogs.builds([
                    "通话空闲状态值", this.config_conj,
                    ["获取空闲值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                ], {inputHint: "{x|x∈N*}"});
                diag.on("neutral", () => diag.getInputEditText().setText(phoneCallingState().toString()));
                diag.on("negative", () => diag.dismiss());
                diag.on("positive", dialog => {
                    let input = diag.getInputEditText().getText().toString();
                    if (input === "") return dialog.dismiss();
                    let value = +input;
                    if (isNaN(value)) return alertTitle(dialog, "输入值类型不合法");
                    value = ~~value;
                    if (value !== phoneCallingState()) {
                        let diag_confirm = dialogs.builds([
                            ["小心", "#880e4f"], ["phone_call_state_idle_value_warn", "#ad1457"],
                            0, "放弃", ["确定", "caution_btn_color"], 1,
                        ]);
                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                        diag_confirm.on("positive", () => {
                            diag_confirm.dismiss();
                            $save.session(this.config_conj, value);
                            diag.dismiss();
                        });
                        diag_confirm.show();
                    } else {
                        $save.session(this.config_conj, value);
                        diag.dismiss();
                    }
                });
                diag.show();
            },
            updateOpr: function (view) {
                let value = $sto.def.af[this.config_conj];
                let storage_value = sess_cfg[this.config_conj];
                if (typeof storage_value !== "undefined") value = storage_value;
                view._hint.text(value === undefined ? "未配置" : value.toString());
            },
        }))
        .ready();
});
$view.addPage(["项目备份还原", "local_project_backup_restore_page"], function () {
    $view.setPage(arguments[0])
        .add("subhead", new Layout("备份", {subhead_color: $defs.subhead_highlight_color}))
        .add("button", new Layout("备份至本地", {
            newWindow: function () {
                let diag = dialogs.builds([
                    "备份项目至本地", "backup_to_local",
                    ["添加备注", "hint_btn_bright_color"], "放弃", "开始备份", 1
                ]);
                diag.on("negative", () => diag.dismiss());
                diag.on("neutral", () => {
                    diag.dismiss();
                    let diag_remark = dialogs.builds([
                        "为备份添加备注", ""
                        , 0, "放弃", "确定", 1
                    ], {inputHint: ""});
                    diag_remark.on("negative", () => {
                        diag_remark.dismiss();
                        diag.show();
                    });
                    diag_remark.on("positive", () => {
                        let _remark = diag_remark.getInputEditText().getText();
                        sess_par.project_backup_info_remark = _remark.toString();
                        diag_remark.dismiss();
                        diag.show();
                    });
                    diag_remark.show();
                });
                diag.on("positive", () => {
                    delete sess_par.sgn_intrpt_update;
                    diag.dismiss();
                    let diag_backup = dialogs.builds(["正在备份", "此过程可能需要一些时间", 0, 0, "终止", 1], {
                        progress: {
                            max: 100,
                            showMinMax: false,
                        },
                    });
                    diag_backup.on("positive", () => {
                        sess_par.sgn_intrpt_update = true;
                        diag_backup.dismiss();
                    });
                    diag_backup.show();
                    threads.starts(function () {
                        $tool.backupProjectFiles(null, null, diag_backup);
                    });
                });
                diag.show();
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("还原", {subhead_color: $defs.subhead_highlight_color}))
        .add("page", new Layout("从本地还原", "hint", {
            view_label: "restore_projects_from_local_page",
            next_page: "restore_projects_from_local_page",
            updateOpr: function (view) {
                let amount = sess_cfg.project_backup_info.length;
                view._hint.text(amount ? "共计备份:  " + amount + " 项" : "无备份");
            },
        }))
        .add("page", new Layout("从服务器还原", "hint", {
            next_page: null,
            view_label: "restore_projects_from_server_page",
            updateOpr: function (view) {
                let view_label = this.view_label;
                let clearClickListener = () => view.setClickListener(() => null);
                let restoreClickListener = () => {
                    sess_par.restore_projects_from_server_page_updated_flag = false;
                    view.setClickListener(() => $view.updateViewByLabel(view_label));
                };
                if (sess_par.restore_projects_from_server_page_updated_flag) return;
                view._chevron_btn.setVisibility(8);
                view._hint.text("正在从服务器获取数据...");
                clearClickListener();
                sess_par.restore_projects_from_server_page_updated_flag = true;
                threads.starts(function () {
                    let setViewText = text => ui.post(() => view._hint.text(text));
                    let max_try_times = 5;
                    while (max_try_times--) {
                        try {
                            let res = http.get("https://api.github.com/repos/SuperMonster003/Auto.js_Projects/releases");
                            sess_par.server_releases_info = res.body.json(); // array
                            let amount = sess_par.server_releases_info.length;
                            if (!amount) {
                                restoreClickListener();
                                return setViewText("无备份 (点击可重新检查)");
                            }
                            view.setNextPage("restore_projects_from_server_page");
                            ui.post(() => view._chevron_btn.setVisibility(0));
                            view.restoreClickListener();
                            setViewText("共计备份:  " + amount + " 项");

                            let {view_pages} = global;
                            if (waitForAction(() => view_pages[view_label], 5000)) {
                                return ui.post(() => {
                                    view_pages[view_label]
                                        .add("list", new Layout("/*服务器项目还原*/", {
                                            list_head: "server_releases_info",
                                            data_source_key_name: "server_releases_info",
                                            list_checkbox: "gone",
                                            listeners: {
                                                _list_data: {
                                                    item_click: function (item, idx, item_view, list_view) {
                                                        let release_details = [];
                                                        let single_session_data = sess_par.server_releases_info[idx] || {};
                                                        let map = {
                                                            name: "标题",
                                                            tag_name: "标签",
                                                            created_at: "创建",
                                                            body: "版本更新内容描述",
                                                        };
                                                        Object.keys(map).forEach(key => {
                                                            if (!(key in single_session_data)) return;
                                                            let label_name = map[key];
                                                            let value = single_session_data[key];
                                                            if (value.match(/^list_item_name_\d+$/)) value = single_session_data[value];
                                                            if (key === "body") value = "\n" + value;
                                                            value && release_details.push(label_name + ": " + value);
                                                        });
                                                        release_details = release_details.join("\n\n");
                                                        let diag = dialogs.builds([
                                                            "版本详情", release_details,
                                                            ["浏览器查看", "hint_btn_bright_color"], "返回",
                                                            ["还原此项目", "warn_btn_color"], 1,
                                                        ]);
                                                        diag.on("negative", () => diag.dismiss());
                                                        diag.on("neutral", () => {
                                                            diag.dismiss();
                                                            app.openUrl(single_session_data.html_url);
                                                        });
                                                        diag.on("positive", () => {
                                                            diag.dismiss();
                                                            let diag_confirm = dialogs.builds([
                                                                "还原项目", "restore_project_confirm",
                                                                0, "放弃", ["还原", "caution_btn_color"], 1,
                                                            ]);
                                                            if (single_session_data[single_session_data.tag_name].match(/^v1\.6\.25/)) {
                                                                diag_confirm.setContent(
                                                                    $defs.dialog_contents.v1_6_25_restore_confirm + "\n\n" +
                                                                    $defs.dialog_contents.restore_project_confirm
                                                                );
                                                                diag_confirm.getContentView().setTextColor(colors.parseColor("#ad1457"));
                                                                diag_confirm.getTitleView().setTextColor(colors.parseColor("#880e4f"));
                                                            }
                                                            diag_confirm.on("negative", () => {
                                                                diag_confirm.dismiss();
                                                                diag.show();
                                                            });
                                                            diag_confirm.on("positive", () => {
                                                                diag_confirm.dismiss();
                                                                $tool.restoreProjectFiles(single_session_data.zipball_url);
                                                            });
                                                            diag_confirm.show();
                                                        });
                                                        diag.show();
                                                    },
                                                    item_bind: function (item_view, item_holder) {
                                                        item_view._checkbox.setVisibility(8);
                                                    },
                                                },
                                            },
                                        }))
                                        .add("info", new Layout("点击列表项可查看并还原项目"))
                                    ;
                                });
                            }
                        } catch (e) {
                            sleep(200);
                        }
                    }
                    restoreClickListener();
                    return setViewText("服务器数据获取失败 (点击重试)");
                });
            },
        }))
        .ready();
});
$view.addPage(["从本地还原项目", "restore_projects_from_local_page"], function () {
    $view.setPage(arguments[0], null, {no_scroll_view: true})
        .add("list", new Layout("/*本地项目还原*/", {
            list_head: "project_backup_info",
            data_source_key_name: "project_backup_info",
            list_checkbox: "gone",
            get tool_box() {
                return {
                    deleteItem: (parent_dialog, idx) => {
                        parent_dialog && parent_dialog.dismiss();

                        let diag_delete_confirm = dialogs.builds([
                            "删除备份", "确定删除此备份吗\n此操作无法撤销",
                            0, "放弃", ["删除", "caution_btn_color"], 1,
                        ]);
                        diag_delete_confirm.on("negative", () => {
                            diag_delete_confirm.dismiss();
                            parent_dialog && parent_dialog.show();
                        });
                        diag_delete_confirm.on("positive", () => {
                            diag_delete_confirm.dismiss();

                            let {data_source_key_name} = this;
                            $view.updateDataSource(data_source_key_name, "splice", [idx, 1], "quiet");
                            $view.updateViewByLabel("restore_projects_from_local_page");

                            let _sess = sess_cfg[data_source_key_name];
                            let _sto = sto_cfg[data_source_key_name] = deepCloneObject(_sess);
                            // write to storage right away
                            $sto.af.put(data_source_key_name, deepCloneObject(_sto));
                        });
                        diag_delete_confirm.show();
                    }
                };
            },
            listeners: {
                _list_data: {
                    item_long_click: function (e, item, idx, item_view, list_view) {
                        e.consumed = true;
                        this.tool_box.deleteItem(null, idx);
                    },
                    item_click: function (item, idx, item_view, list_view) {
                        let {data_source_key_name, tool_box} = this;
                        let backup_details = [];
                        let single_session_data = sess_cfg[data_source_key_name][idx] || {};
                        let map = {
                            version_name: "版本",
                            timestamp: "时间",
                            file_path: "路径",
                            remark: "备注",
                        };
                        Object.keys(map).forEach(key => {
                            if (!(key in single_session_data)) return;
                            let label_name = map[key];
                            let value = single_session_data[key];
                            if (key === "timestamp") value = $tool.getTimeStrFromTimestamp(value, "time_str");
                            value && backup_details.push(label_name + ": " + value);
                        });
                        backup_details = backup_details.join("\n\n");
                        let diag = dialogs.builds([
                            "备份详情", backup_details,
                            ["删除此备份", "caution_btn_color"], "返回", ["还原此备份", "warn_btn_color"], 1,
                        ]);
                        diag.on("positive", () => {
                            diag.dismiss();
                            let diag_confirm = dialogs.builds([
                                "还原本地备份", "restore_from_local",
                                0, "放弃", ["还原", "caution_btn_color"], 1,
                            ]);
                            diag_confirm.on("negative", () => {
                                diag_confirm.dismiss();
                                diag.show();
                            });
                            diag_confirm.on("positive", () => {
                                diag_confirm.dismiss();
                                $tool.restoreProjectFiles(single_session_data.file_path);
                            });
                            diag_confirm.show();
                        });
                        diag.on("negative", () => diag.dismiss());
                        diag.on("neutral", () => tool_box.deleteItem(diag, idx));
                        diag.show();
                    },
                    item_bind: function (item_view, item_holder) {
                        item_view._checkbox.setVisibility(8);
                    },
                },
            },
        }))
        .add("info", new Layout("dynamic_info", {
            view_label: "restore_projects_from_local_page",
            updateOpr: function (view) {
                view._info_text.setText(sess_cfg.project_backup_info.length ? "点击列表项可还原项目或删除备份项目" : "暂无备份项目");
            },
        }))
        .add("info", new Layout("长按列表项可删除备份项目", {
            view_label: "restore_projects_from_local_page",
            updateOpr: function (view) {
                view.setVisibility(sess_cfg.project_backup_info.length ? 0 : 8);
            },
        }))
        .ready();
});
$view.addPage(["从服务器还原项目", "restore_projects_from_server_page"], function () {
    $view.setPage(arguments[0], null, {no_scroll_view: true})
        .ready();
});

$view.flushPagesBuffer();

// constructor //

function Layout(title, hint, params) {
    let _params = params || {};
    let _hint = "";
    if (classof(hint, "Object")) _params = hint;
    else _hint = hint === "hint" ? "加载中..." : hint;
    Object.assign(this, {hint: _hint, title: title}, _params);

    let _conj = _params.config_conj;
    if (_conj) {
        let _title_o = sess_par.title || {};
        _title_o[_conj] = _title_o[_conj] || title;
        sess_par.title = _title_o;
    }

    Object.defineProperties(this, (() => {
        let _properties = {
            newWindow: {get: () => _params.newWindow.bind(this)},
            infoWindow: {get: () => _params.infoWindow.bind(this)},
            listeners: {get: () => _params.listeners},
            updateOpr: {get: () => view => _params.updateOpr(view)},
            custom_data_source: {get: () => _params.custom_data_source},
        };
        Object.keys(_properties).forEach(key => _params[key] || delete _properties[key]);
        return _properties;
    })());
}