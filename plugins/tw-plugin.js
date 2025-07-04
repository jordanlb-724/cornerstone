const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');
const theme = require('./tailwind.theme');

const { spacing, borderRadius } = defaultTheme;

const thumbBaseStyles = {
    '-moz-appearance': 'none',
    '-webkit-appearance': 'none',
    'appearance': 'none',
    'background': '#1B1B1B',
    'border': 0,
    'border-radius': borderRadius.full,
    'cursor': 'pointer',
    'height': spacing[4],
    'width': spacing[4],
};

const disabledThumbStyles = {
    background: '#757575',
};

const rangeThumbStyles = {
    background: '#141414',
};

module.exports = plugin(
    ({ addBase }) => {
        addBase({
            [['input[type="range"]::-webkit-slider-thumb']]: thumbBaseStyles,
            [['input[type="range"]:disabled::-webkit-slider-thumb']]: disabledThumbStyles,
            [['input[type="range"]:disabled:focus::-webkit-slider-thumb']]: disabledThumbStyles,
            [['input[type="range"]:disabled:active::-webkit-slider-thumb']]: disabledThumbStyles,
            [['input[type="range"]::-moz-range-thumb']]: thumbBaseStyles,
            [['input[type="range"]:disabled::-moz-range-thumb']]: disabledThumbStyles,
            [['input[type="range"]::-moz-range-progress']]: rangeThumbStyles,
            [['input[type="range"]::-ms-fill-lower']]: rangeThumbStyles,
            [['input[type="range"]:focus']]: {
                outline: 'none',
            },
            [['input[type="range"]:focus::-webkit-slider-thumb']]: rangeThumbStyles,
            [['input[type="range"]:active::-webkit-slider-thumb']]: {
                background: '#0F0F0F',
            },
        });
    },
    {
        theme,
    },
);
