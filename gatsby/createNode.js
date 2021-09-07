const { createFilePath } = require(`gatsby-source-filesystem`)

module.exports = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  console.log('node'. node)
  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}