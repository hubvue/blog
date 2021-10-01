import React, { FC } from "react"
import Highlight, { defaultProps, Language } from "prism-react-renderer"

interface Props {
  code: string
  language: Language
}

const CodeBlock: FC<Props> = ({ code, language }) => {
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
                        let cn = className
                        cn = cn.replaceAll("module", "").trim()
                        cn = cn.replaceAll("control-flow", "").trim()
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
