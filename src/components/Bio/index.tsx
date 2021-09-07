import React, { FC } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

interface BioData {
  site: {
    siteMetadata: {
      author?: {
        name: string
        summary: string
      }
      social?: {
        github: string
      }
    }
  }
}

const Bio: FC = () => {
  const data = useStaticQuery<BioData>(graphql`
  query BioQuery {
    site {
      siteMetadata {
        author {
          name
          summary
        }
        social {
          github
        }
      }
    }
  }
  `)
  // Set these values by editing "siteMetadata" in gatsby-config.js
  const { author, social } = data.site.siteMetadata
  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../../images/profile-pic.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      {author?.name && (
        <p>
        嗨！我是<strong>{author.name}</strong>
        ，是一位大前端爱好者。如果您感兴趣，可以访问我的
        {` `}
        <a href={`https://github.com/${social?.github}`}>GitHub</a>
      </p>
      )}
    </div>
  )
}

export default Bio
