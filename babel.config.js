const options = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      'babel-plugin-root-import',
      { rootPathSuffix: './src/', rootPathPrefix: '~/' },
    ],
    ['@babel/transform-runtime'],
  ],
};

if (process.env.NODE_ENV === 'production') {
  options.presets = [...options.presets, ['minify']];
}

module.exports = options;
