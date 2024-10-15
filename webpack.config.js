const { VueLoaderPlugin } = require("vue-loader"); // vue-loader: Loads and compiles Vue single-file components
const HtmlWebpackPlugin = require("html-webpack-plugin"); // html-webpack-plugin: Automatically generates an HTML file that includes all the bundles.
const webpack = require("webpack"); // Import Webpack to use DefinePlugin
const path = require("path"); // path - utility for working with file and directory paths.

module.exports = {
	entry: "./src/main.js",
	output: {
	  filename: "bundle.js",
	  path: path.resolve(__dirname, "dist"),
	},
	mode: "development",
	devServer: {
	  static: "./dist",
	  hot: true,
	  historyApiFallback: true, // Added this to handle client-side routing
	},
	module: {
	  rules: [
		{
		  test: /\.vue$/,
		  loader: "vue-loader",
		},
		{
		  test: /\.js$/,
		  loader: "babel-loader",
		  exclude: /node_modules/,
		},
		{
		  test: /\.css$/,
		  use: ["vue-style-loader", "css-loader"],
		},
	  ],
	},
	plugins: [
	  new VueLoaderPlugin(),
	  new HtmlWebpackPlugin({
		template: "./public/index.html",
	  }),
	  new webpack.DefinePlugin({
		__VUE_OPTIONS_API__: JSON.stringify(true),
		__VUE_PROD_DEVTOOLS__: JSON.stringify(false),
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
	  }),
	],
	resolve: {
	  alias: {
		vue: "vue/dist/vue.esm-bundler.js",
	  },
	  extensions: [".js", ".vue"],
	},
  };
  
