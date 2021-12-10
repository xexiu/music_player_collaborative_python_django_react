const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const APP_PATH = path.resolve(__dirname, '../src');

module.exports = {
    entry: {
        app: APP_PATH,
    },
    output: {
        path: path.resolve(__dirname, '../static/js'),
        filename: 'bundle.[name].js'
    },
    optimization: {
        minimize: false,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(
                            /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                        )[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace('@', '')}`;
                    }
                },
            }
        },
    },
    plugins: [
        new CleanWebpackPlugin({ dangerouslyAllowCleanPatternsOutsideProject: true, dry: false }),
        new HtmlWebpackPlugin({
            template:'!!ejs-webpack-loader!/templates/custom-insertion/index.ejs',
            filename: path.resolve(__dirname, '../templates/frontend-base.html'),
            inject: false,
            minify: false,
            hash: false
        }),
        new BundleTracker({ filename: 'webpack-stats.json' })
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            '~': path.resolve(__dirname, '../src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto',
            },
            {
                test: /\.s?css$/i,
                use: [
                    'css-hot-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        'postcss-preset-env'
                                    ]
                                ]
                            }
                        },
                    }
                ],
            },
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },
            },
        ],
    },
};
