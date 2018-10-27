module.exports = function(api) {
  api.cache(true)
  return {
    presets: [
      [
        "@babel/preset-env", {
          targets: {
            node: "current"
          },
          modules: "cjs"
        }
      ]
    ],
    plugins: [
      "@babel/plugin-syntax-import-meta",
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-transform-flow-comments",
      "dynamic-import-node"
    ]
  }
}
