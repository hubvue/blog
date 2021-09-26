import React, { FC } from "react"
import { Link, graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import Layout from "../components/Layout/index"
import Seo from "../components/Seo"

const PostTemplate: FC<any> = ({ data }) => {
  console.log(22222)
  const post = data.mdx
  const { previous, next } = data
  const { title, description, date, ns } = post.frontmatter
  let previousTitle = ''
  let previousLink = ''
  let nextTitle = ''
  let nextLink = ''
  if (previous && previous.frontmatter.ns === ns && !previous.frontmatter.undone) {
    previousTitle = previous.frontmatter.title
    previousLink = previous.fields.slug
  }
  if (next && next.frontmatter.ns === ns && !next.frontmatter.undone) {
    nextTitle = next.frontmatter.title
    nextLink = next.fields.slug
  }
  return (
    <Layout>
      <Seo title={title} description={description || post.excerpt} />
      <article className="prose m-auto mb-8">
        <header>
          <h1 itemProp="headline">{title}</h1>
          <p className="opacity-50 !-mt-2">{date}</p>
        </header>
        <MDXRenderer>{post.body}</MDXRenderer>
      </article>
      <nav className="prose m-auto mb-8">
        <ul className="flex flex-wrap justify-between">
          <div>
            <li className="list-none">
              {nextTitle && (
                <Link className="item" to={nextLink} rel="next">
                  ← {nextTitle}
                </Link>
              )}
            </li>
          </div>
          <div>
            <li className="list-none">
              {previousTitle && (
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
    mdx(id: { eq: $id }) {
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
        ns
        undone
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
        ns
        undone
      }
    }
  }
`
