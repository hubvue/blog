import React, { FC } from "react"
import { graphql } from "gatsby"

import Seo from "../components/Seo"
import TabBar from '../components/TabBar'
import { useSwitchTheme } from "../hooks/useSwitchTheme"

const BlogIndex: FC<any> = ({ data, location }) => {
  const posts = data.allMarkdownRemark.nodes
  const { theme, switchTheme } = useSwitchTheme()
  const switchHandler = () => {
    switchTheme()
  }
  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 dark:text-white">
      <button onClick={switchHandler}>switch</button>
      <TabBar posts={posts} />
      <Seo title="Blog"/>
    </div>
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
