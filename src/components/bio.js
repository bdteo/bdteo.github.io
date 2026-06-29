// src/components/bio.js

import * as React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Icon from "./Icon"
import { DEFAULT_LANGUAGE, getChrome } from "../../i18n.config"

const Bio = ({ lang = DEFAULT_LANGUAGE }) => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            github
            email
          }
        }
      }
    }
  `)

  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social
  const chrome = getChrome(lang)
  const summary =
    lang === DEFAULT_LANGUAGE ? author?.summary : chrome.bioSummary

  return (
    <div className="bio" itemScope itemType="http://schema.org/Person">
      <div className="bio-portrait">
        <StaticImage
          className="bio-avatar"
          src="../images/profile-pic.png"
          width={360}
          height={360}
          quality={95}
          alt={author?.name || "Profile picture"}
          itemProp="image"
        />
      </div>
      {author?.name && (
        <>
          <div className="bio-heading">
            <p className="bio-kicker">{chrome.bioKicker}</p>
            <h2 className="bio-name" itemProp="name">
              {chrome.bioName}
            </h2>
          </div>
          <p className="bio-intro bio-summary" itemProp="description">
            {summary}
          </p>
          <meta itemProp="url" content="https://bdteo.com" />
        </>
      )}
      <div className="bio-social">
        {social?.github && (
          <a
            href={`https://github.com/${social.github}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            itemProp="sameAs"
          >
            <Icon name="github" />
          </a>
        )}
        {social?.email && (
          <a
            href={`mailto:${social.email}`}
            aria-label="Email"
            itemProp="email"
          >
            <Icon name="email" />
          </a>
        )}
      </div>
    </div>
  )
}

export default Bio
