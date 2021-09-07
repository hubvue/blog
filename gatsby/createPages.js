const { resolve } = require("path")
// const _ = require('lodash')

module.exports = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  // 404
  createPage({
    path: "/404",
    component: resolve("./src/templates/NotFoundTemplate.tsx"),
  })

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: ASC }
        limit: 1000
      ) {
        nodes {
          id
          frontmatter {
            namespace
          }
          fields {
            slug
          }
        }
      }
    }
  `)
  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }
  const posts = result.data.allMarkdownRemark.nodes
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    const previousPostId = i === 0 ? null : posts[i - 1].id
    const nextPostId = i === posts.length - 1 ? null : posts[i + 1].id
    const namespace = post.frontmatter.namespace || "blog"
    createPage({
      path: `${namespace}${post.fields.slug}`,
      component: resolve("./src/templates/PostTemplate.tsx"),
      context: {
        id: post.id,
        previousPostId,
        nextPostId,
      },
    })
  }
}
