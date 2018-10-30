module.exports = function() {
  const { VueLoaderPlugin } = require("vue-loader")
  return {
    mode: "development",
    entry: ["./src/index.js"],
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: "vue-loader"
        }
      ]
    },
    plugins: [new VueLoaderPlugin()]
  }
}
