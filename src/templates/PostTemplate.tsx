import React, { FC } from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/Layout/index"
import Seo from "../components/Seo"

const PostTemplate: FC<any> = ({ data, location }) => {
  const post = data.markdownRemark
  const { previous, next } = data
  const { title, description, date, ns } = post.frontmatter
  const previousTitle = previous && previous.frontmatter.title
  const previousLink = previous && `/${ns}${previous.fields.slug}`
  const nextTitle = next && next.frontmatter.title
  const nextLink = next && `/${ns}${next.fields.slug}`
  return (
    <Layout>
      <Seo title={title} description={description || post.excerpt} />
      <article className="prose m-auto mb-8">
        <header>
          <h1 itemProp="headline">{title}</h1>
          <p className="opacity-50 !-mt-2">{date}</p>
        </header>
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <nav className="prose m-auto mb-8">
        <ul className="flex flex-wrap justify-between">
          <div>
            <li className="list-none">
              {next && (
                <Link className="item" to={nextLink} rel="next">
                  ← {nextTitle}
                </Link>
              )}
            </li>
          </div>
          <div>
            <li className="list-none">
              {previous && (
                <Link className="item" to={previousLink} rel="prev">
                  {previousTitle} →
                </Link>
              )}
            </li>
          </div>
        </ul>
      </nav>
    </Layout>
  )
}

export default PostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        ns
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
