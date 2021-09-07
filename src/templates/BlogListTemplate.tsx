import React, { FC } from "react"
import { graphql } from "gatsby"

import Bio from "../components/Bio"
import Layout, { Location } from "../components/Layout"
import Seo from "../components/Seo"
import BlogList from '../components/BlogList'

interface Props {
  data: any
  location: Location
  pageContext: Record<string, any>
}

const BlogListIndex: FC<Props> = ({ data, location, pageContext}) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes.filter((post: any) => post.frontmatter.namespace === pageContext.ns)
  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="All posts" />
      <Bio />
      <BlogList posts={posts} />
    </Layout>
  )
}

export default BlogListIndex

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
          namespace
          description
        }
      }
    }
  }
`
