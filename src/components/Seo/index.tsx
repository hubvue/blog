import React, { FC } from "react"
import { Helmet } from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

interface Meta {
  name?: string
  property?: string
  content?: string
}
interface Props {
  description?: string
  lang?: string
  title: string
  meta?: Meta[]
}

interface SeoQuery {
  site: {
    siteMetadata: {
      title?: string
      description?: string,
      social?: {
        github: string
      }
    }
  }
}

const Seo: FC<Props> = ({ description, lang, meta, title }) => {
  const { site } = useStaticQuery<SeoQuery>(graphql`
  query {
    site {
      siteMetadata {
        title
        description
        social {
          github
        }
      }
    }
  }`)

  const metaDescription = description || site.siteMetadata.description
  const defaultTitle = site.siteMetadata?.title
  let defaultMeta: Meta[] = [
    { name: `description`, content: metaDescription },
    { property: `og:title`, content: title },
    { property: `og:description`, content: metaDescription },
    { property: `og:type`, content: `website` },
    { name: `github:creator`, content: site.siteMetadata?.social?.github || `` },
    { name: `github:card`, content: `summary` },
    { name: `github:title`, content: title },
    { name: `github:description`, content: metaDescription },
  ]
  if (meta) {
    defaultMeta = defaultMeta.concat(meta)
  }
  return (
    <Helmet
      title={title}
      titleTemplate={defaultTitle ? `%s | ${defaultTitle}` : undefined}
      meta={defaultMeta}
    />
  )
}

export default Seo
