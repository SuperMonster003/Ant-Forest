let ColorStateList = android.content.res.ColorStateList;

let exp = {
    /**
     * @param {Color$} color
     * @param {boolean|number|'auto'|'none'|'keep'} [alpha=8]
     * @return {string}
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
     * @param {Color$} color
     * @return {number}
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
            throw Error(e + '\n' + e.stack);
        }
        if (typeof _c !== 'number') {
            throw TypeError('Unknown type of color for colorsx.toInt()');
        }
        return _c;
    },
    /**
     * @param {string} rgba_hex
     * @example
     * colorsx.hrgba('#rrggbbaa') -> colorsx.toInt('#aarrggbb')
     * @return {number}
     */
    hrgba(rgba_hex) {
        if (typeof rgba_hex !== 'string') {
            throw Error('Param rgba_hex must be a string type');
        }
        if (rgba_hex[0] !== '#') {
            throw Error('Param rgba_hex must started with hash symbol');
        }

        rgba_hex = rgba_hex.trim().toUpperCase();

        if (rgba_hex.length === 7) {
            rgba_hex += 'FF';
        }
        if (rgba_hex.length !== 9) {
            throw Error('Length of param rgba_hex must be 7 or 9');
        }
        return this.toInt('#' + rgba_hex.slice(-2) + rgba_hex.slice(1, -2));
    },
    /**
     * @param {Color$} color
     * @return {android.content.res.ColorStateList}
     */
    toColorStateList(color) {
        return ColorStateList.valueOf(this.toInt(color));
    },
};

module.exports = {colorsx: exp};