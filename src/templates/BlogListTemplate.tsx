import React, { FC } from "react"
import { graphql } from "gatsby"

import Layout from "../components/Layout/index"
import Seo from "../components/Seo"
import BlogList from '../components/BlogList'

interface Props {
  data: any
  location: Location
  pageContext: Record<string, any>
}

const BlogListTemplate: FC<Props> = ({ data, pageContext}) => {
  const posts = data.allMarkdownRemark.nodes.filter((post: any) => post.frontmatter.ns === pageContext.ns)
  return (
    <Layout>
      <Seo title="All posts" />
      {/* <Bio /> */}
      <BlogList posts={posts} />
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
          description
        }
      }
    }
  }
`
