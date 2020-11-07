const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const autoprefixer = require("autoprefixer");
const htmlPlugin = new HtmlWebPackPlugin({
  template: "./client/index.html",
  filename: "./index.html",
});

module.exports = {
  mode: "development",
  entry: "./client/index.js",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    publicPath: "",
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: () => [autoprefixer()],
            },
          },
        ],
      },

      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    htmlPlugin,
    new webpack.DefinePlugin({
      "process.env.ENV": JSON.stringify(
        "DEVELOPMENT"
      ),
    }),
  ],
};
