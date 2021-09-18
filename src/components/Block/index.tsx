import React, { FC, ReactElement } from "react"
import { Language } from "prism-react-renderer"
import SlidevBlock from "./SlidevBlock"
import CodeBlock from "./CodeBlock"

interface MDXRendererProps {
  className: string
  children: string
}
interface Props {
  children: ReactElement<MDXRendererProps>
}

type Block = "slidev"

const Block: FC<Props> = props => {
  console.log('props',props)
  let { className, children } = props.children.props as MDXRendererProps
  className = className || "language-text"
  const matches = className.match(/language-(?<lang>.*)/)
  const code = children.trim()
  const language = (
    matches && matches.groups && matches.groups.lang ? matches.groups.lang : ""
  ) as Language | Block

  if (language === "slidev") {
    return <SlidevBlock code={code}/>
  }
  return <CodeBlock code={code} language={language} />
}

export default Block
