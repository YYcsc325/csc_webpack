
const merge = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./webpack.base');

const devConfig = {
  mode: 'development',
  output: {
    filename: '[name].js'                                   // 在development模式下开启hash值会编译出错，自己单独设置覆盖base
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),               // 开发模式下使用,生产环境不用,搭配webpack-dev-server使用开启热更新
  ],
  devServer: {
    contentBase: './dist',                                  // 找指定文件下进行编译
    hot: true,                                              // 开启热更新
    // open: true,                                             // 默认编译完打开浏览器
    stats: 'errors-only',                                   // 状态编译报错会提示，否则没有编译信息,后续可能使用 friendly-errors-webpack-plugin
    overlay: true,                                          // 浏览器页面上显示错误
    port: 8004,                                             // webpack-dev-server --port 8004
  },
  devtool: 'cheap-source-map',
};

module.exports = merge(baseConfig, devConfig);
