const CopyPlugin = require('copy-webpack-plugin');
const path = require('path')

module.exports = {
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        {           
          from: path.resolve(__dirname, "assets/images"),
          to: path.resolve(__dirname, "dist/application/actions/adobe_microservice/upload-to-aem-temp/assets/images"),
          noErrorOnMissing: false }
      ]
    })
  ],
  module: {
    rules: [
      {
        // includes, excludes are in tsconfig.json
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  output: {
    filename: 'bundle.js'
  }
}