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
    component: resolve('./src/templates/GroupListTemplate.tsx'),
    context: {
      ns: 'algorithm'
    }
  })
  // book-notes
  createPage({
    path: '/book-notes',
    component: resolve('./src/templates/BlogListTemplate.tsx'),
    context: {
      ns: 'book-notes'
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
      allMarkdownRemark(
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
  const groupList = new Set()
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    const previousPostId = i === 0 ? null : posts[i - 1].id
    const nextPostId = i === posts.length - 1 ? null : posts[i + 1].id
    const ns = post.frontmatter.ns || "blog"
    const { group, groupName } = post.frontmatter
    if (ns === 'index') {
      createPage({
        path: `/`,
        component: resolve("./src/templates/IndexTemplate.tsx"),
        context: {
          id: post.id,
        }
      })
    } else {
      if (group && !groupList.has(`${ns}/${group}`)) {
        createPage({
          path: `${ns}/${group}`,
          component: resolve('./src/templates/BlogListTemplate.tsx'),
          context: {
            ns,
            group,
            groupName,
          }
        })
        groupList.add(`${ns}/${group}`)
      }
      createPage({
        path: `${ns}${group ? `/${group}` : ''}${post.fields.slug}`,
        component: resolve("./src/templates/PostTemplate.tsx"),
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    }
  }
}
