
const cssnano = require('cssnano');
const merge = require('webpack-merge');
// 提取公共模块,抽离放在公共地方,比如一些引入的库或者公共的函数，组件等等, 
// 暂时先不用，会跟package.json中的设置dependencies中的生产react跟react-dom模块冲突,这边设置了，那么package设置到devDependencies开发环境中去react,react-dom
// 这边说的package.json是引入这个包的项目package
// const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');    
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');  // 压缩css的插件
const baseConfig = require('./webpack.base');

const prodConfig = {
  mode: 'production',
  plugins: [
    new OptimizeCSSAssetsPlugin({                                               // 压缩css   js内置已经进行压缩了
      assetNameRegExp: /\.css$/g,
      cssProcessor: cssnano,
    }),
    // new HtmlWebpackExternalsPlugin({                                            // 如果使用这个脚本进行基础代码库的分离，那么html页面需要单独引入
    //   externals: [
    //     {
    //       module: 'react',
    //       entry: 'https://11.url.cn/now/lib/16.2.0/react.min.js',               // 可以这样直接引入网上的cdn文件，下载下来在引入本地的
    //       global: 'React',
    //     },
    //     {
    //       module: 'react-dom',
    //       entry: 'https://11.url.cn/now/lib/16.2.0/react-dom.min.js',
    //       global: 'ReactDOM',
    //     },
    //   ],
    // }),
  ],
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
      },
    },
  },
};

module.exports = merge(baseConfig, prodConfig);
