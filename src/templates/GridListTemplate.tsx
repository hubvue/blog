import React, { FC } from "react"
import { graphql } from "gatsby"

import Layout from "../components/Layout/index"
import Seo from "../components/Seo"
import GridList from '../components/GridList'
import Bio from '../components/Bio'
import { uniqueWithProp } from "../utils/arrays"

interface Props {
  data: any
  pageContext: Record<string, any>
}

const BlogListTemplate: FC<Props> = ({ data, pageContext}) => {
  let posts = data.allMarkdownRemark.nodes
                .filter((post: any) => {
                  return post.frontmatter.ns === pageContext.ns && !post.frontmatter.undone
                })
                .map((post: any) => post.frontmatter)
  posts = uniqueWithProp(posts, 'group')
  let prefix = `/${pageContext.ns}`

  return (
    <Layout>
      <Seo title="All posts" />
      <Bio title={pageContext.ns}/>
      <GridList groupList={posts} prefix={prefix}/>
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
    allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
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
          undone
        }
      }
    }
  }
`
