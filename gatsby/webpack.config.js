const { resolve } = require('path')

module.exports = ({ getConfig, actions }) => {
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
}