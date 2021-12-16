import React, { FC } from "react"
import { Icon } from '@iconify/react'

import Layout from "../../components/Layout/index"
import Seo from "../../components/Seo"
import Bio from '../../components/Bio'
import { toUpperCase } from "../../utils/strings"
import './index.css'

interface Tool {
  path: string
  name: string
  icon: string
  desc: string
}

interface Props {
  location: Location
  pageContext: Record<string, any>
}

const tools: Tool[] = [
  {
    path: 'https://keverjs.github.io/kever-docs/',
    name: 'Kever.js',
    icon: 'gg:components',
    desc: 'A lightweight inversion of control nodejs framework based on TypeScript'
  },
  {
    path: 'https://blog.cckim.cn/tools/json2type',
    name: 'json2type',
    icon: 'fluent:scan-type-20-filled',
    desc: 'convert JSON of a specific format to a type structure'
  },
  {
    path: 'https://github.com/hubvue/vue-exposure',
    name: 'vue-exposure',
    icon: 'uil:vuejs',
    desc: 'Based on the InterfaceObserver API, a callback is performed when a bound element appears in the viewport.'
  }
]

const ToolsTemplate: FC<Props> = ({ pageContext }) => {
  let title = pageContext.ns
  const toolsElement = tools.map(tool => {
    return <a className="item relative flex items-center" href={tool.path} key={tool.name} target="_blank">
      <Icon className="text-5xl pr-3 flex-none" icon={tool.icon} />
      <div className="flex-auto">
        <div className="text-xl">{tool.name}</div>
        <div className="desc text-sm opacity-50 font-normal pt-1">{tool.desc}</div>
      </div>
    </a>
  })
  return (
    <Layout>
      <Seo title={toUpperCase(title)} />
      <Bio title={title} subTitle="Projects And Tools"/>
      <div className="prose  m-auto mb-8">
        <div className="project-grid py-2 mx-1 gap-2">
          {toolsElement}
        </div>
      </div>
    </Layout>
  )
}

export default ToolsTemplate