import React, {FC, useEffect, useState} from 'react'
import { useSwitchTheme } from "../../hooks/useSwitchTheme"

const commentNodeId = 'comment'

const Comment: FC = () => {
  const [theme] = useSwitchTheme()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.async = true
    script.setAttribute('repo', 'hubvue/blog')
    script.setAttribute('issue-term', 'pathname')
    script.setAttribute('label', 'comment:speech_balloon:')
    script.setAttribute('theme', theme === 'dark' ? 'github-dark' : 'github-light')
    script.setAttribute('crossorigin', 'anonymous')

    const scriptParentNode = document.getElementById(commentNodeId)
    if (scriptParentNode) {
      scriptParentNode.appendChild(script)
    }

    return () => {
      if (scriptParentNode && scriptParentNode.firstChild) {
        scriptParentNode.removeChild(scriptParentNode.firstChild)
      }
    }
  }, [theme])

  return <div id={commentNodeId}></div>
}

export default Comment