import React, { FC, ReactElement } from "react"
import { Language } from "prism-react-renderer"
import CodeBlock from "./CodeBlock"

interface MDXRendererProps {
  className: string
  children: string
  live?: boolean
}
interface Props {
  children: ReactElement<MDXRendererProps>
}


const Block: FC<Props> = props => {
  let { className, children } = props.children.props as MDXRendererProps
  className = className || "language-text"
  const matches = className.match(/language-(?<lang>.*)/)
  const code = children.trim()
  const language = (
    matches && matches.groups && matches.groups.lang ? matches.groups.lang : ""
  ) as Language

  return <CodeBlock code={code} language={language} />
}

export default Block
