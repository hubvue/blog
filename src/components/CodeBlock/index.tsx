import React, { FC, ReactElement, ReactNode } from "react"
import Highlight, { defaultProps, Language } from "prism-react-renderer"

interface MDXRendererProps {
  className: string
  children: string
}
interface Props {
  children: ReactElement<MDXRendererProps>
}

const CodeBlock: FC<Props> = props => {
  let { className, children } = props.children.props as MDXRendererProps

  className = className || "language-text"
  const matches = className.match(/language-(?<lang>.*)/)
  const code = children.trim()
  const language = (
    matches && matches.groups && matches.groups.lang ? matches.groups.lang : ""
  ) as Language
  return (
    <div className="gatsby-highlight">
      <Highlight {...defaultProps} code={code} language={language}>
        {({ className, tokens, getTokenProps }) => {
          return (
            <pre className={className}>
              <code className={className}>
                {tokens.map((line, index) => {
                  return (
                    <section key={index}>
                      {line.map((token, key) => {
                        let { className, children } = getTokenProps({
                          token,
                          key,
                        })
                        const classNames = className.split(" ")
                        let cn = className
                        if (
                          classNames[1] === "class-name" &&
                          classNames.length > 2
                        ) {
                          cn = `${classNames[0]} ${classNames
                            .slice(2)
                            .join(" ")}`
                        }
                        return (
                          <span className={cn} key={key}>
                            {children}
                          </span>
                        )
                      })}
                    </section>
                  )
                })}
              </code>
            </pre>
          )
        }}
      </Highlight>
    </div>
  )
}

export default CodeBlock
