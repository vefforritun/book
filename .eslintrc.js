module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-restricted-syntax': 0,

    'no-console': [
      'error',
      { allow: ['warn', 'error', 'info', 'group', 'groupEnd', 'assert'] },
    ],

    camelcase: 0,

    'class-methods-use-this': 0,
  },
};
