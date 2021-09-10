import React, { FC } from "react"
import { Link } from "gatsby"

interface Post {
  frontmatter: {
    title?: string
    ns?: string
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
  prefix: string
}

const BlogList: FC<Props> = ({ posts, prefix }) => {
  const postsElement = posts.map(post => {
    const slug = post.fields.slug
    let { title: frontmatterTitle, description, date, ns: frontmatterNS } = post.frontmatter
    const ns = frontmatterNS || 'blog'
    const title = frontmatterTitle || slug
    const linkUrl = `${prefix}${slug}`
    return (
      <Link className="item block font-normal mb-6 mt-2 no-underline" to={linkUrl} key={slug}>
        <li>
          <div className="title text-lg">{title}</div>
          <div className="time opacity-50 text-sm -mt-1">{date}</div>
          {/* <p className="desc text-base" dangerouslySetInnerHTML={{ __html: description || post.excerpt }}></p> */}
        </li>        
      </Link>
    )
    // return (
    //   <li key={slug}>
    //     <article className="post-list-item" itemScope >
    //       <header>
    //         <h3>
    //           <Link to={linkUrl} itemProp="url">
    //             <span itemProp="headline">{title}</span>
    //           </Link>
    //         </h3>
    //         <small>{date}</small>
    //       </header>
    //       <section>
    //         <p dangerouslySetInnerHTML={{ __html: description || post.excerpt }} itemProp="description" />
    //       </section>
    //     </article>
    //   </li>
    // )
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
