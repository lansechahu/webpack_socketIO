const pkg = require('./package.json');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './src/js/index.js',
    output: {
        path: __dirname + "/dist",
        filename: 'js/main.min.js',
    },
    devtool: "inline-source-map",
    devServer:{
        contentBase:'./dist',
        disableHostCheck: true,
        inline: true,
        port: 8080
    },
    plugins: [
        new CleanWebpackPlugin(['dist/js','dist/index.html']),
        new HtmlWebpackPlugin(
            {
                template: "./index.html",
                chunksSortMode: "none"
            }
        )
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
}