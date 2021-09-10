import React, { FC } from "react"
import { graphql } from 'gatsby'

import Seo from "../components/Seo"
import Layout from '../components/Layout'

interface Data {
  markdownRemark: {
    id: string
    html: string
    frontmatter: {
      title: string
      ns: string
      date: string
      description: string
    }
  }
}

interface Props {
  data: Data
}

const Index: FC<Props> = ({ data }) => {
  const html = data.markdownRemark.html
  const frontmatter = data.markdownRemark.frontmatter
  return (
    <Layout>
      <Seo title="Blog"/>
      <div className="prose m-auto mb-8" dangerouslySetInnerHTML={{ __html: html }}></div>
    </Layout>
  )
}

export default Index


export const pageQuery = graphql`
  query BlogIndex(
    $id: String!
  ) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      frontmatter {
        title
        ns
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
