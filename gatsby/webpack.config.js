const { resolve } = require('path')

module.exports = ({ getConfig, actions, stage, loaders }) => {
  const webpackConfig = getConfig()
  if (webpackConfig.mode === 'production') {
    actions.setWebpackConfig({
      devtool: false,
      resolve: {
        alias: {
          '@': resolve(__dirname, '../')
        }
      }
    })
  }
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /bad-module/,
            use: loaders.null()
          }
        ]
      }
    })
  }
}
