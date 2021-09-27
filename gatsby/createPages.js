const { resolve } = require("path")
// const _ = require('lodash')

module.exports = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  // 404
  createPage({
    path: '/404',
    component: resolve('./src/templates/NotFoundTemplate.tsx')
  })
  // blog
  createPage({
    path: '/blog',
    component: resolve('./src/templates/BlogListTemplate.tsx'),
    context: {
      ns: 'blog'
    }
  })
  // algorithm
  createPage({
    path: '/algorithm',
    // component: resolve('./src/templates/GridListTemplate.tsx'),
    component: resolve('./src/templates/BlogListTemplate.tsx'),
    context: {
      ns: 'algorithm'
    }
  })
  // notes
  createPage({
    path: '/notes',
    component: resolve('./src/templates/TimeLineTemplate/index.tsx'),
    context: {
      ns: 'notes'
    }
  })
  // essay
  createPage({
    path: '/essay',
    component: resolve('./src/templates/BlogListTemplate.tsx'),
    context: {
      ns: 'essay'
    }
  })

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      allMdx(
        sort: { fields: [frontmatter___date], order: ASC }
        limit: 1000
      ) {
        nodes {
          id
          frontmatter {
            ns,
            group
            groupName
          }
          slug
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
  const posts = result.data.allMdx.nodes
  const indexPages = posts.filter(post => post.frontmatter.ns === 'index')
  if (indexPages.length) {
    createPage({
      path: `/`,
      component: resolve("./src/templates/IndexTemplate.tsx"),
      context: {
        id: indexPages[0].id,
      }
    })
  }
}
