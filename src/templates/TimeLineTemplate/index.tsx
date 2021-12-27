import { graphql, Link } from 'gatsby'
import React, { FC } from 'react'
import { Timeline } from 'antd'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { toUpperCase } from '../../utils/strings'
import Layout from '../../components/Layout'
import Seo from '../../components/Seo'
import Bio from '../../components/Bio'
import './index.css'

const TimeLineTemplate: FC<any> = ({ data, pageContext }) => {
  const title = pageContext.ns
  const posts = data.allMdx.nodes || []
  const timelineItems = posts.map((post: any) => {
    const { date, title, description } = post.frontmatter
    const slug = post.fields.slug
    const raw = post.rawBody.replace(/---[\s\S]*---/, '').trim()
    const isLangText = raw.length > 1000
    return (
      <Timeline.Item className="timeline-item" color="gray" key={post.id}>
        <Link to={slug} >
          <div className="text-2xl">{title}</div>
          <div className="my-1 italic text-gray-500">{date}</div>
        </Link>
        <div className="mt-2">
          { isLangText ? description : <MDXRenderer>{post.body}</MDXRenderer> }
        </div>
      </Timeline.Item>
    )
  })
  return (
    <Layout>
      <Seo title={toUpperCase(title)}></Seo>
      <Bio title={title}/>
      <section className="prose m-auto mb-8">
        <Timeline>
          {timelineItems}
        </Timeline>
      </section>
    </Layout>
  )
}

export default TimeLineTemplate

export const timeLineQuery = graphql`
query TimeLine($ns: String!) {
  allMdx(
    sort: {fields: frontmatter___date, order: DESC}
    filter: {frontmatter: {ns: {eq: $ns}, undone: {eq: false}}}
  ) {
    nodes {
      id
      body
      rawBody
      fields {
        slug
      }
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        ns
        title
        undone
        groupName
        group
        description
      }
    }
  }
}
`