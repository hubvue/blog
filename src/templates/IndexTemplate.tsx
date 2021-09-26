import React, { FC } from "react"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"

import Seo from "../components/Seo"
import Layout from "../components/Layout"

interface Data {
  mdx: {
    id: string
    body: string
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
  const body = data.mdx.body
  return (
    <Layout>
      <Seo title="Blog" />
      <div className="prose m-auto mb-8">
        <MDXRenderer>{body}</MDXRenderer>
      </div>
    </Layout>
  )
}

export default Index

export const query = graphql`
  query BlogIndex($id: String!) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
        ns
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
