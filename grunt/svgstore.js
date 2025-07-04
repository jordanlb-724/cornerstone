module.exports = {
    default: {
        files: {
            './assets/img/icon-sprite.svg': ['./assets/icons/**/*.svg'],
        },
    },

    options: {
        cleanup: false,
        includeTitleElement: false,
        prefix: 'icon-',
    },
};
