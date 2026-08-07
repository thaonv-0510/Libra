const path    = require("path")
const webpack = require("webpack")
const { resolve } = require('path');

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = {
  mode: mode,
  devtool: "source-map",
  optimization: {
    moduleIds: 'deterministic',
  },
  entry: {
    application: "./app/javascript/src/App.tsx"
  },
  output: {
    filename: "[name].js",
    sourceMapFilename: "[name].js.map",
    path: path.resolve(__dirname, "app/assets/builds"),
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx|)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      '@src': resolve('app/javascript/src'),
      '@tests': resolve('app/javascript/tests'),
    }
  }
}
