"ui";

ui.layout(

    <vertical id="main">
        <button id="btn">BUTTON</button>
    </vertical>

);


let modified_flag = false,
    sub_page_flag = false;

let parent = ui.main.getParent();
let views = {
    test_view: ui.inflate(<vertical><text id="aaa" text="123" /></vertical>),
};
let new_view = views["test_view"];

ui.btn.on("click", () => {

    parent.addView(new_view);

    new_view.scrollBy(-720, 0);

    smoothScrollBy(ui.main, 720, 0, 180);
    smoothScrollBy(new_view, 720, 0, 180);

    sub_page_flag = true;
});

new_view.aaa.on("click", () => {
    new_view.aaa.setBackgroundColor(colors.parseColor("#ff3300"));
});

ui.emitter.on("back_pressed", e => {
    e.consumed = sub_page_flag || modified_flag;
    if (modified_flag && !sub_page_flag) toast("You need to save before exit");
    else {
        smoothScrollBy(ui.main, -720, 0, 180);
        smoothScrollBy(new_view, -720, 0, 180);
        sub_page_flag = false;
        new_view.scrollBy(720, 0);
        parent.removeView(new_view);
    }
});




function smoothScrollBy(view, dx, dy, duration) {
    let each_move_time = 10;

    let neg_x = dx < 0,
        neg_y = dy < 0;

    let abs = num => num < 0 && -num || num;
    dx = abs(dx);
    dy = abs(dy);

    let ptx = dx && Math.ceil(each_move_time * dx / duration) || 0,
        pty = dy && Math.ceil(each_move_time * dy / duration) || 0;

    let count_x = Math.ceil(dx / ptx),
        count_y = Math.ceil(dy / pty);

    let scroll_interval = setInterval(function () {
        if (!dx && !dy) return;
        let move_x = ptx && (dx > ptx ? ptx : (ptx - (dx % ptx))),
            move_y = pty && (dy > pty ? pty : (pty - (dy % pty)));
        view.scrollBy(neg_x && -move_x || move_x, neg_y && -move_y || move_y);
        dx -= ptx;
        dy -= pty;
    }, each_move_time);
    setTimeout(() => clearInterval(scroll_interval), duration + 200); // 200: a safe interval just in case
}