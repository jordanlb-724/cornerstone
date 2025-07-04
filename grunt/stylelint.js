module.exports = {
    options: {
        configFile: '.stylelintrc',
        failOnError: true,
        fix: false,
        formatter: 'string',
        ignoreDisables: false,
        outputFile: '',
        reportNeedlessDisables: false,
        syntax: '',
    },
    src: [
        'assets/scss/**/*.scss',
        '!assets/scss/vendor/**/*.scss',
        '!assets/scss/invoice.scss',
        '!assets/scss/maintenance.scss',
    ],
};
