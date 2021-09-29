import React, { FC } from "react"
import { Link } from "gatsby"

interface Post {
  id: string
  frontmatter: {
    title?: string
    ns?: string
    label?: string
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
    let { title: frontmatterTitle, date, label } = post.frontmatter
    const title = frontmatterTitle || slug
    return (
      <Link className="item block font-normal mb-6 mt-2 no-underline" to={slug} key={post.id}>
        <li>
          <div className="title text-lg">
            {title}
            {label ? <sup className="text-xs border border-current rounded px-1 ml-0.5">{label}</sup> : "" }
          </div>
          <div className="time opacity-50 text-sm -mt-1">{date}</div>
        </li>        
      </Link>
    )
  })
  return (
    <div className="prose m-auto">
      <ul>
        {postsElement}
      </ul>
    </div>
  )
}

export default BlogList
