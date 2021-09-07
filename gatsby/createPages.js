const { resolve } = require('path')
// const _ = require('lodash')

module.exports = async ({ graphql, actions, reporter}) => {
  const { createPage } = actions
  // 404
  createPage({
    path: '/404',
    component: resolve('./src/templates/NotFoundTemplate.tsx')
  })

  // Get all markdown blog posts sorted by date
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: ASC }
          limit: 1000
        ) {
          nodes {
            id
            fields {
              slug
            }
          }
        }
      }
    `
  )
  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }
  const posts = result.data.allMarkdownRemark.nodes
  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: resolve('./src/templates/PostTemplate.tsx'),
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })
  }
}