import React, { FC } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/Bio"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import "../common/fonts/fonts-post.css"

const PostTemplate: FC<any> = ({ data, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data
  const { title, description, date, ns } = post.frontmatter
  const previousTitle = previous && previous.frontmatter.title
  const previousLink = previous && `/${ns}${previous.fields.slug}`
  const nextTitle = next && next.frontmatter.title
  const nextLink = next && `/${ns}${next.fields.slug}`
  return (
    <Layout location={location} title={siteTitle}>
      <Seo
        title={title}
        description={description || post.excerpt}
      />
      <article className="blog-post" itemScope>
        <header>
          <h1 itemProp="headline">{title}</h1>
          <p>{date}</p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        <hr />
        <footer>
          <Bio />
        </footer>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link
                to={previousLink}
                rel="prev"
              >
                ← {previousTitle}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link
                to={nextLink}
                rel="next"
              >
                {nextTitle} →
              </Link>
            )}
          </li>
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
