global.colorsx = typeof global.colorsx === 'object' ? global.colorsx : {};

let ext = {
    /**
     * @param {ColorParam} color
     * @param {boolean|number|'auto'|'none'|'keep'} [alpha=8]
     * @returns {string}
     */
    toStr(color, alpha) {
        if (typeof color === 'string') {
            if (Number(color).toString() === color) {
                color = Number(color);
            }
        }
        let _c = typeof color === 'number' ? colors.toString(color) : color;
        if (typeof _c !== 'string') {
            throw TypeError('Unknown type of color for colorsx.toStr()');
        }
        let _A = colors.alpha(_c);
        let _R = colors.red(_c);
        let _G = colors.green(_c);
        let _B = colors.blue(_c);

        if (alpha === undefined || alpha === true || alpha === 'keep' || alpha === 8) {
            return _c;
        }
        if (alpha === false || alpha === 'none' || alpha === 6) {
            return '#' + colors.toString(colors.rgb(_R, _G, _B)).slice(-6);
        }
        if (alpha === 'auto') {
            return _A < 255 ? _c : colors.toString(colors.rgb(_R, _G, _B));
        }
        throw TypeError('Unknown type of alpha for colorsx.toStr()');
    },
    /**
     * @param {ColorParam} color
     * @returns {number}
     */
    toInt(color) {
        if (typeof color === 'string') {
            if (Number(color).toString() === color) {
                color = Number(color);
            }
        }
        let _c;
        try {
            _c = typeof color === 'string' ? colors.parseColor(color) : color;
        } catch (e) {
            console.error('Passed color: ' + color);
            throw Error(e);
        }
        if (typeof _c !== 'number') {
            throw TypeError('Unknown type of color for colorsx.toInt()');
        }
        return _c;
    },
};

module.exports = ext;
module.exports.load = () => global.colorsx = ext;