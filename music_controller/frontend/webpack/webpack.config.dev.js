const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const common = require('./webpack.common.js');
const PORT = 9091;

module.exports = merge(common, {
    target: 'web',
    mode: 'development',
    devtool: 'inline-cheap-source-map',
    output: {
        publicPath: `http://localhost:${PORT}/`,
        chunkFilename: 'bundle.[name].chunk.js',
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
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false
        })
    ],
    devServer: {
        historyApiFallback: true,
        port: PORT,
        static: {
            directory: path.resolve(__dirname, '../static'),
        },
        client: {
            logging: 'info', // Set 'none' to disable logs on developer console
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
