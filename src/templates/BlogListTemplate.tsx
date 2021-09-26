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
  let title = pageContext.ns
  let posts = data.allMdx.nodes
  if (pageContext.group) {
    posts = posts.filter((post: any) => post.frontmatter.group === pageContext.group )
    title = pageContext.groupName
  }
  return (
    <Layout>
      <Seo title={toUpperCase(title)} />
      <Bio title={title}/>
      <BlogList posts={posts} />
    </Layout>
  )
}

export default BlogListTemplate

export const pageQuery = graphql`
  query ($ns: String!) {
    allMdx(
      sort: {fields: frontmatter___date, order: DESC}
      filter: {frontmatter: {ns: {eq: $ns}, undone: {eq: false}}}
    ) {
      nodes {
        id
        excerpt
        slug
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          group
          groupName
          ns
          undone
        }
        fields {
          slug
        }
      }
    }
  }
`
