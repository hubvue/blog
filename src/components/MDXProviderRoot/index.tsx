import React, { FC }from "react"
import { MDXProvider } from "@mdx-js/react"

import Block from "../Block"

const component = {
    pre: Block
}

const CodeRoot: FC<any> = ({ element }) => {
    return <MDXProvider components={component}>{element}</MDXProvider>
}

export default CodeRoot