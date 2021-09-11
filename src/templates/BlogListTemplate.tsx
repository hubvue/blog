import React, { FC } from "react"
import { graphql } from "gatsby"

import Layout from "../components/Layout/index"
import Seo from "../components/Seo"
import BlogList from '../components/BlogList'
import Bio from '../components/Bio'
import { toUpperCase } from "../utils/strings"

interface Props {
  data: any
  location: Location
  pageContext: Record<string, any>
}

const BlogListTemplate: FC<Props> = ({ data, pageContext}) => {
  let posts = data.allMarkdownRemark.nodes.filter((post: any) => post.frontmatter.ns === pageContext.ns && !post.frontmatter.undone)
  let title = pageContext.ns
  let prefix = `/${pageContext.ns}`
  if (pageContext.group) {
    posts = data.allMarkdownRemark.nodes.filter((post: any) => post.frontmatter.group === pageContext.group )
    title = pageContext.groupName
    prefix += `/${pageContext.group}`
  }
  return (
    <Layout>
      <Seo title={toUpperCase(title)} />
      <Bio title={title}/>
      <BlogList posts={posts} prefix={prefix} />
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
          undone
        }
      }
    }
  }
`
