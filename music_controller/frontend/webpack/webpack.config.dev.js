const webpack = require('webpack');
const { merge } = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const common = require('./webpack.common.js');
const PORT = 9091;

module.exports = merge(common, {
    target: 'web',
    mode: 'development',
    devtool: 'inline-cheap-source-map',
    output: {
        publicPath: `http://localhost:${PORT}/`,
    },
    optimization: {
        minimize: false
    },
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
                        loader: '@linaria/webpack-loader',
                        options: {
                            cacheDirectory: 'static/.linaria_cache',
                            sourceMap: true
                        }
                    },
                ]
            }
        ]
    },
    plugins: [
        new ESLintPlugin({
            extensions: ['ts', 'tsx', 'js'],
            emitWarning: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new MiniCssExtractPlugin({ filename: '../css/styles.css' }),
    ],
    devServer: {
        historyApiFallback: true,
        port: PORT,
        static: {
            directory: path.resolve(__dirname, '../static'),
        },
        client: {
            logging: 'none',
            overlay: true,
            progress: true
        },
        hot: 'only',
        devMiddleware: {
            writeToDisk: true
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    }
})
