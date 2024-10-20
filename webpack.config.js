const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

module.exports = {
	entry: "./src/main.js",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	mode: "development",
	devServer: {
		static: [
			{
				directory: path.join(__dirname, "dist"), // Serve the bundled output
			},
			{
				directory: path.join(__dirname, "public"), // Serve static assets from public/
				publicPath: "/", // Ensure it's served from the root path
			},
		],
		hot: true,
		historyApiFallback: true, // Handle client-side routing
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
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/vue-echarts"),
          path.resolve(__dirname, "node_modules/echarts"),
        ],
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ["vue-style-loader", "css-loader"],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i, // Add this rule for fonts
				type: "asset/resource",
				generator: {
					filename: "fonts/[name][ext]", // Output path for font files
				},
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
