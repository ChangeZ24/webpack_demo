const path = require('path');

module.exports = {
  mode: 'development', // 测试环境
  context: path.resolve(__dirname, './src'), // context 上下文指向 src 目录
  entry: () => new Promise((resolve) => resolve('./index.js')), // 利用方法返回一个异步的入口
  output: {
    path: path.resolve(__dirname, './lib'), // 修改输出路径为 “sy_webpack-config/lib”
    publicPath: './lib/', // 配置公共路径
    filename: '[name].js', // 配置入口最后生成输出文件名称
    chunkFilename: '[name].[chunkhash:8].js', // 让它的组成为名称.8 位内容的 hash 值.js
  },
  module: {
    noParse: /(library)/, // 过滤掉 library 模块
    rules: [
      {
        test: /.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              config: {
                path: path.resolve(__dirname, './postcss.config.js'),
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [new (require('vue-loader').VueLoaderPlugin)()],
};