import React, { FC } from "react"
import { navigate } from "gatsby"
import Layout from "../components/Layout/index"
import Seo from "../components/Seo"
import Comment from '../components/Comment'
import { formatDate } from "../utils/date"

const PostTemplate: FC<any> = ({ children, pageContext: { frontmatter } }) => {
  const { title, description, date } = frontmatter
  const goBack = () => {
    navigate(-1)
  }
  return (
    <Layout>
      <Seo title={title} description={description} />
      <article className="prose m-auto mb-8">
        <header>
          <h1 itemProp="headline">{title}</h1>
          <p className="opacity-50 !-mt-2">{formatDate(date)}</p>
        </header>
        {children}
      </article>
      <footer className="prose m-auto mb-8">
        <a className="font-mono no-underline opacity-50 hover:opacity-75 cursor-pointer" onClick={goBack}>cd ..</a>
      </footer>
      <Comment />
    </Layout>
  )
}

export default PostTemplate
