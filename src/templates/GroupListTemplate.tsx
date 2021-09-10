import React, { FC } from "react"
import { graphql } from "gatsby"

import Layout from "../components/Layout/index"
import Seo from "../components/Seo"
import GroupList from '../components/GroupList'
import Bio from '../components/Bio'
import { uniqueWithProp } from "../utils/arrays"

interface Props {
  data: any
  pageContext: Record<string, any>
}

const BlogListTemplate: FC<Props> = ({ data, pageContext}) => {
  let posts = data.allMarkdownRemark.nodes
                .filter((post: any) => post.frontmatter.ns === pageContext.ns)
                .map((post: any) => post.frontmatter)
  posts = uniqueWithProp(posts, 'group')
  // .reduce((pre, item) => {
  //   if (pre.length === 0 || (pre.length && pre[pre.length - 1].length === 2)) {
  //     pre.push([item])
  //   } else {
  //     pre[pre.length - 1].push(item)
  //   }
  //   return pre
  // }, [] as any[][])
  let prefix = `/${pageContext.ns}`

  return (
    <Layout>
      <Seo title="All posts" />
      <Bio title={pageContext.ns}/>
      <GroupList groupList={posts} prefix={prefix}/>
    </Layout>
  )
}

export default BlogListTemplate

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          ns
          group
          groupName
          description
        }
      }
    }
  }
`
