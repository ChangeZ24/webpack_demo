const path = require('path');

module.exports = {
  mode: 'production',
  context: path.resolve(__dirname, '.'),
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, './lib'),
    library: 'webpackSay',
    libraryExport: 'default',
    libraryTarget: 'var',
  },
};