import React, { FC } from "react"
import { graphql } from "gatsby"

import Seo from "../components/Seo"
import TabBar from '../components/TabBar'

const BlogIndex: FC<any> = ({ data, location }) => {
  const posts = data.allMarkdownRemark.nodes

  return (
    <>
    <TabBar posts={posts} />
    <Seo title="blog"/>
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
