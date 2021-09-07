import React, { FC } from "react"
import { Link } from "gatsby"
import { rhythm } from '../../common/style/typography'

interface Post {
  frontmatter: {
    title?: string
    date: string
    description: string
  }
  fields: {
    slug: string
  }
  excerpt: string
}
interface Props {
  posts: Post[]
}

const BlogList: FC<Props> = ({ posts }) => {
  const postsElement = posts.map(post => {
    const slug = post.fields.slug
    let { title: frontmatterTitle, description, date } = post.frontmatter
    const title = frontmatterTitle || slug
    return (
      <li key={slug}>
        {/* itemType="http://schema.org/Article" */}
        <article className="post-list-item" itemScope >
          <header>
            <h3>
              <Link to={slug} itemProp="url">
                <span itemProp="headline">{title}</span>
              </Link>
            </h3>
            <small>{date}</small>
          </header>
          <section>
            <p dangerouslySetInnerHTML={{ __html: description || post.excerpt }} itemProp="description" />
          </section>
        </article>
      </li>
    )
  })
  return (
    <ol style={{ listStyle: 'none' }}>
      {postsElement}
    </ol>
  )
}

export default BlogList
