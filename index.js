const plugin = require('tailwindcss/plugin');

const pSBC = (p, c0, c1, l) => {
    let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
    if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
    if (!this.pSBCr) this.pSBCr = (d) => {
        let n = d.length, x = {};
        if (n > 9) {
            [r, g, b, a] = d = d.split(","), n = d.length;
            if (n < 3 || n > 4) return null;
            x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1;
        } else {
            if (n == 8 || n == 6 || n < 4) return null;
            if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
            d = i(d.slice(1), 16);
            if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
            else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1;
        } return x;
    };
    h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = this.pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
    if (!f || !t) return null;
    if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
    else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
};

module.exports = plugin.withOptions(function (options) {
    const intensityMap = new Map([
        [50, .95],
        [100, .9],
        [200, .75],
        [300, .6],
        [400, .3],
        [600, -0.3],
        [700, -0.6],
        [800, -0.75],
        [900, -0.9],
    ]);

    const ALL_LEVELS = [50, 100, 200, 300, 400, 600, 700, 800, 900];

    const prefix = options.prefix == null ? '' : `${options.prefix}-`;
    const levels = options.levels == null ? ALL_LEVELS : options.levels.filter(level => ALL_LEVELS.includes(level));

    return function ({ theme, e, addUtilities }) {
        const colors = theme('shades', {});

        function forEachShade(cb) {
            const exclude = ['inherit', 'current', 'transparent', 'black', 'white'];

            return Object.entries(colors).reduce((acc, [name, value]) => {
                if (!exclude.includes(name) && typeof value === 'string') {
                    acc[name] = cb(value);
                }
                return acc;
            }, {});
        };

        function forEachLevel(shade, cb) {
            return levels.reduce((acc, level) => {
                acc[level] = cb(shade, intensityMap.get(level));
                return acc;
            }, { 500: shade });
        };

        const utilities = {
            bg: (value) => ({
                'background-color': value
            }),
            text: (value) => ({
                'color': value
            }),
            border: (value) => ({
                'border-color': value
            }),
            'border-t': (value) => ({
                '--tw-border-opacity': 1,
                'border-top-color': value
            }),
            'border-r': (value) => ({
                '--tw-border-opacity': 1,
                'border-right-color': value
            }),
            'border-b': (value) => ({
                '--tw-border-opacity': 1,
                'border-bottom-color': value
            }),
            'border-l': (value) => ({
                '--tw-border-opacity': 1,
                'border-left-color': value
            }),
            outline: (value) => ({
                'outline-color': value
            }),
            ring: (value) => ({
                '--tw-ring-opacity': 1,
                '--tw-ring-color': value
            }),
            'ring-offset': (value) => ({
                '--tw-ring-offset-color': value
            }),
            'shadow': (value) => ({
                '--tw-shadow-color': value,
                '--tw-shadow': 'var(--tw-shadow-colored)'
            }),
            accent: (value) => ({
                'accent-color': value
            }),
            caret: (value) => ({
                'caret-color': value
            }),
            fill: (value) => ({
                'fill': value
            }),
            stroke: (value) => ({
                'stroke': value
            }),
        };

        const shades = forEachShade(shade => {
            return forEachLevel(shade, (val, intensity) => {
                return pSBC(intensity, val);
            });
        });

        const acc = [];
        Object.entries(shades).forEach(([name, shades]) => {
            Object.entries(utilities).forEach(([utility, fn]) => {
                acc.push([`.${e(`${prefix}${utility}-${name}`)}`, fn(shades[500])]);
            });
            return Object.entries(shades).forEach(([level, val]) => {
                Object.entries(utilities).forEach(([utility, fn]) => {
                    acc.push([`.${e(`${prefix}${utility}-${name}-${level}`)}`, fn(val)]);
                });
            });
        });

        addUtilities(Object.fromEntries(acc));
    };
});