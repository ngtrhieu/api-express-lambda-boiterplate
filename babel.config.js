module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      'babel-plugin-root-import',
      { rootPathSuffix: './src/', rootPathPrefix: '~/' },
    ],
    ['@babel/transform-runtime'],
  ],
};
