const path = require('path');
const { sourceMapsEnabled } = require('process');

module.exports = {
    target: 'node',
    optimization:{
        minimize: false, // <---- disables uglify.
    },
    mode: 'production',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.m?js/,
                type: "javascript/auto",
              },
              {
                test: /\.m?js/,
                resolve: {
                  fullySpecified: false,
                },
              },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
