/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social
  const size = 96

  return (
    <div className="bio mt-4">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.png"
        width={size}
        height={size}
        quality={95}
        alt="Profile picture"
      />
        {author?.name && (
        <p>
          Written by <strong>{author.name}</strong>,
          {` `}
          {author?.summary || null}
          {` `}
          {/*<a href={`https://twitter.com/${social?.twitter || ``}`}>*/}
          {/*  You should follow them on Twitter*/}
          {/*</a>*/}
        </p>
      )}
    </div>
  )
}

export default Bio
