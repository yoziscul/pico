const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                console: true,
                process: true,
            }
        },
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single', { 'avoidEscape': true }],
            semi: ['error', 'always'],
        },
    },
];

