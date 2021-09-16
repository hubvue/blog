import React, { FC }from "react"
import { MDXProvider } from "@mdx-js/react"

import CodeBlock from "../CodeBlock"

const component = {
    pre: CodeBlock
}

const CodeRoot: FC<any> = ({ element }) => {
    return <MDXProvider components={component}>{element}</MDXProvider>
}

export default CodeRoot