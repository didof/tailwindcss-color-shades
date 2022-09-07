const colorShades = require('./index');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/*.html"],
    theme: {
        shades: {
            ferrari: '#ff0000'
        }
    },
    plugins: [
        colorShades({
            prefix: null,
            levels: [100, 500, 700]
        })
    ],
};



