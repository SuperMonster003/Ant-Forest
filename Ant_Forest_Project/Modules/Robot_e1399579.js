/**
 * 安卓5机器人
 * @constructor
 */
function LollipopRobot(max_retry_times) {
    this.max_retry_times = max_retry_times || 10;

    this.click = function (x, y) {
        return (shell("input tap " + x + " " + y, true).code === 0);
    };

    this.swipe = function (x1, y1, x2, y2, duration) {
        duration = duration || 1000;
        return (shell("input swipe " + x1 + " " + y1 + " " + x2 + " " + y2 + " " + duration, true).code === 0);
    };

    this.clickMulti = function (points) {
        points.forEach(function (point) {
            this.click(point[0], point[1]);
        }.bind(this));
    };
}

Array.prototype.chunk = function (size) {
    var list = [];
    while (this.length > 0) {
        list.push(this.splice(0, size));
    }
    return list;
};

/**
 * 安卓7机器人
 * @constructor
 */
function NougatRobot(max_retry_times) {
    this.max_retry_times = max_retry_times || 10;

    this.click = function (x, y) {
        return click(x, y);
    };

    this.swipe = function (x1, y1, x2, y2, duration) {
        duration = duration || 50;
        return swipe(x1, y1, x2, y2, duration);
    };

    this.clickMulti = function (points) {
        /* var list = [];
        var duration = 1;
        var max_point = 10; // 最多触摸点数
        points.forEach(function (point) {
            list.push([0, duration, point]);
        });

        // 同时点击多个点
        var chunks = list.chunk(max_point); // 太多点则分成多段
        chunks.forEach(function (chunk) {
            gestures.apply(null, chunk);
        }); */
        points.forEach(function (point) {
            this.click(point[0], point[1]);
        }.bind(this));
    };
}

/**
 * 机器人工厂
 * @param {int} max_retry_times 最大尝试次数
 * @author ridersam <e1399579@gmail.com>
 */
function Robot(max_retry_times) {
    this.robot = (device.sdkInt < 24) ? new LollipopRobot(max_retry_times) : new NougatRobot(max_retry_times);

    this.click = function (x, y) {
        return this.robot.click(x, y);
    };

    this.clickCenter = function (b) {
        var rect = b.bounds();
        return this.robot.click(rect.centerX(), rect.centerY());
    };

    this.swipe = function (x1, y1, x2, y2, duration) {
        this.robot.swipe(x1, y1, x2, y2, duration);
    };

    this.back = function () {
        Back();
    };

    this.kill = function (package_name) {
        shell("am force-stop " + package_name, true);
    };

    this.clickMultiCenter = function (collection) {
        var points = [];
        collection.forEach(function(o) {
            var rect = o.bounds();
            points.push([rect.centerX(), rect.centerY()]);
        });
        this.robot.clickMulti(points);
    };

    this.clickMulti = function (points) {
        this.robot.clickMulti(points);
    };
}

module.exports = Robot;