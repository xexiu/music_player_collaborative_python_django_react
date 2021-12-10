const path = require('path');
const Webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    stats: 'errors-only',
    bail: true,
    output: {
        path: path.resolve(__dirname, '../static/dist'),
        filename: '../dist/js/bundle.[name].[chunkhash:8].js',
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            parallel: true
        })]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new Webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new MiniCssExtractPlugin({ filename: '../dist/css/styles.[contenthash].css' }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static', //para que lo haga sólo al momento de hacer el build
            openAnalyzer: true, //para que nos muestre el resultado inmediatamente
        })
    ],
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: '@linaria/webpack-loader'
                    }
                ]
            }
        ],
    },
});
