const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const APP_PATH = path.resolve(__dirname, 'src');
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = (env, argv) => {
  // `mode` is `'XX'` if you run webpack like so: `webpack watch --mode XX` (v5 syntax)
  const mode = argv.mode || 'development'; // dev mode by default
  const dev = process.env.NODE_ENV !== 'production';

  return  {
    entry: APP_PATH,
    mode: dev ? 'development' : 'production',
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, "./static/js"),
      filename: "bundle.[name].js",
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: [
            {
            loader: "babel-loader",
            },
            {
              loader: '@linaria/webpack-loader',
              options: {
                cacheDirectory: 'static/js/.linaria_cache',
                sourceMap: dev 
              }
            },
          ]
        },
        {
          test: /\.css$/,
          use: [
            'css-hot-loader',
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { sourceMap: dev },
            },
          ],
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: [{ loader: 'file-loader' }],
        }
      ],
    },
    optimization: {
      minimize: true,
    },
    plugins: [
      new HtmlWebpackPlugin({  // Also generate a test.html
        filename: 'index.html',
        template: 'src/index.html'
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      new MiniCssExtractPlugin({ filename: "../../static/css/styles.css" })
    ],
    devServer: {
      historyApiFallback: true
    },
  };
}