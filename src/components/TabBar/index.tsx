import React, { FC } from 'react'
import { Link } from "gatsby"

interface Post {
  frontmatter: {
    ns?: string
  }
}
interface Props {
  posts: Post[]
}

const NS_NAMES: Record<string, string> = {
  blog: '博客',
  algorithm: '算法题解',
  'book-notes': '读书笔记',
  essay: '随笔'
}

const TabBar: FC<Props> = ({ posts }) => {
  const nss =  [...new Set(posts.map(post => post.frontmatter.ns || 'blog'))]
  const nssElement = nss.map(ns => 
    <li key={ns}>
      <Link to={ns} itemProp="url">
        <span itemProp="headline">{NS_NAMES[ns]}</span>
      </Link>
    </li>
  )
  return <ol>{nssElement}</ol>
}

export default TabBar