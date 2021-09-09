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
    <li className="no-underline" key={ns}>
      <Link style={{ color: 'inherit', textDecoration: 'inherit'}} to={ns}>
        <span className="no-underline">{NS_NAMES[ns]}</span>
      </Link>
    </li>
  )
  return (
    <div className="flex justify-between">
      Title
      <ol className="flex flex-none">{nssElement}</ol>
    </div>
  )
}

export default TabBar