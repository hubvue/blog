import React, { FC }from "react"
import { MDXProvider } from "@mdx-js/react"

import CodeBlock from "../Block"
import SlidevBlock from '../Block/SlidevBlock'

const component = {
    pre: CodeBlock,
    slidev: SlidevBlock
}

const CodeRoot: FC<any> = ({ element }) => {
    return <MDXProvider components={component}>{element}</MDXProvider>
}

export default CodeRoot