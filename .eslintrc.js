module.exports = {
  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },

  env: {
    node: true,
    es6: true,
  },

  plugins: ['prettier'],

  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:prettier/recommended',
    'airbnb-base',
    'prettier',
  ],

  rules: {
    'arrow-parens': [1, 'as-needed'],
    'arrow-body-style': 1,
    'no-unused-expressions': [
      2,
      { allowShortCircuit: true, allowTernary: true },
    ],
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
  },

  settings: {
    'import/resolver': {
      'babel-plugin-root-import': {
        rootPathPrefix: '~/',
        rootPathSuffix: 'src/',
      },
    },
  },

  ignorePatterns: ['node_modules', 'dist'],
};
