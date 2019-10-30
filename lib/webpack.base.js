
const autoprefixer = require('autoprefixer');
const glob = require('glob');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');  // 打包完成之后曝出一些信息的插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const projectRoot = process.cwd();                                              // 冒烟测试的时候需要替换地址，改成当前template下的地址

const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js'));    // * 表示匹配src下面的所有内容

  Object.keys(entryFiles)
    .map((index) => {
      const entryFile = entryFiles[index];
      // '/Users/cpselvis/my-project/src/index/index.js'

      const match = entryFile.match(/src\/(.*)\/index\.js/);                  // src/search/index.js
      const pageName = match && match[1];

      entry[pageName] = entryFile;
      return htmlWebpackPlugins.push(
        new HtmlWebpackPlugin({
          inlineSource: '.css$',
          template: path.join(projectRoot, `./src/${pageName}/index.html`),   // html模板所在位置
          filename: `${pageName}.html`,                                       // 打包出来的文件名称
          chunks: ['vendors', pageName],                                      // 生成的html使用哪些chunk
          inject: true,                                                       // 自动注入打包好的css，js到当前html文件中,只要设置一个div id='root'
          minify: {
            html5: true,
            collapseWhitespace: true,
            preserveLineBreaks: false,
            minifyCSS: true,
            minifyJS: true,
            removeComments: false,
          },
        })
      );
    });

  return {
    entry,
    htmlWebpackPlugins,
  };
};

const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
  entry: entry,
  output: {
    path: path.join(projectRoot, 'dist'),
    filename: '[name]_[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
      },
      {
        test: /.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75,
              remPrecision: 8,
            },
          }
        ],
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'px2rem-loader',                              // 自适应屏幕分辨率
            options: {
              remUnit: 75,                                        // 1rem == 75px
              remPrecision: 8,                                    // px转换成rem后的小数点
            },
          },
          {
            loader: 'postcss-loader',                             // npm i postcss-loader autoprefixer -D 为了解决不同浏览器前缀问题，不兼容的时候自动补全，-webkit这样
            options: {
              plugins: () => [
                autoprefixer({                                    // 引入autoprefixer执行，另外传入一个参数
                  browsers: ['last 2 version', '>1%', 'ios 7'],   // 最近的两个版本，用户数大于百分之1，ios7
                }),
              ],
            },
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          } 
        ],
      },
      {
        test: /.(png|jpg|gif|jpeg|svg)$/,                         // 背景图片打包  url-loader底层也是file-loader 只不过能做小图片的处理跟base64的转换
        use: [
          {
            loader: 'file-loader',
            options: {                                            // 可以加个参数limit: 8192 小于8k的图片自动转成base64格式，并且不会存在实体图片,并且打包进js
              name: '[name]_[hash:8].[ext]',                      // 设置图片打包的hash值
            },
          },
        ],
      },
      {
        test: /.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8][ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    // 省略后缀
    extensions: ['.js', '.jsx', '.json'],
    // 别名
    alias: {
      '@dep': path.join(projectRoot, 'src/deploy'),
      '@con': path.join(projectRoot, 'src/container'),
      '@actions': path.join(projectRoot, 'src/redux/actions'),
      '@reducers': path.join(projectRoot, 'src/redux/reducers'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css',       // 设置css的hash值
    }),
    new CleanWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin(),              // 打包编译完成之后
    function errorPlugin() {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          process.exit(1);
        }
      });
    },
  ].concat(htmlWebpackPlugins),
  stats: 'errors-only',
};
