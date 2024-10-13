// webpack.config.js
const { VueLoaderPlugin } = require("vue-loader") // vue-loader: Loads and compiles Vue single-file components
const HtmlWebpackPlugin = require("html-webpack-plugin") // html-webpack-plugin: Automatically generates an HTML file that includes all the bundles.

// path - utility for working with file and directory paths.
const path = require("path")

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
	],
	resolve: {
		alias: {
			vue: "vue/dist/vue.esm-bundler.js",
		},
		extensions: [".js", ".vue"],
	},
}
