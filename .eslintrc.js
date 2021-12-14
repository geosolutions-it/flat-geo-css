module.exports = {
    env: {
        browser: true,
        es6: true,
        jest: true
    },
    extends: 'eslint:recommended',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
        sourceType: 'module',
        allowImportExportEverywhere: true
    },
    rules: {}
};
