const webpack = require('webpack');
const PROD = JSON.parse(process.env.PROD_DEV || '0');
// http://stackoverflow.com/questions/25956937/how-to-build-minified-and-uncompressed-bundle-with-webpack

module.exports = {
    entry: "./entry.js",
    devtool: "#inline-source-map",
    output: {
        // devtoolLineToLine: true,
        sourceMapFilename: "admin.app.js.map",
        pathinfo: true,
        path: __dirname + "/app/assets/js",
        filename: PROD ? "admin.app.min.js" : "admin.app.js"
        // filename: "admin.bundle.js"
    },
    module: {
        loaders: [
            {
            test: /\.css$/,
            loader: "style!css"
            },
            {
                test: /\.js$/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015']
            }
          }
        ]
    },
    plugins: PROD ? [
        new webpack.optimize.UglifyJsPlugin({ minimize: true })
    ] : []
};