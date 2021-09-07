import React, { FC } from "react"
import { graphql } from "gatsby"

import Bio from "../components/Bio"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import BlogList from '../components/BlogList'
import TabBar from '../components/TabBar'

const BlogIndex: FC<any> = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  return (
    <>
    <TabBar posts={posts} />
    <Layout location={location} title={siteTitle}>
      <Seo title="All posts" />
      <Bio />
      <BlogList posts={posts} />
    </Layout>
    </>
  )
}

export default BlogIndex

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
