// src/components/bio.js

import * as React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons/faEnvelope"
import { library } from "@fortawesome/fontawesome-svg-core"

import { DEFAULT_LANGUAGE, getChrome } from "../../i18n.config"

library.add(faGithub, faLinkedin, faTwitter, faEnvelope)

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
      <StaticImage
        className="bio-avatar"
        src="../images/profile-pic.png"
        width={150}
        height={150}
        quality={95}
        alt={author?.name || "Profile picture"}
        itemProp="image"
      />
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
            <FontAwesomeIcon icon={faGithub} />
          </a>
        )}
        {social?.email && (
          <a
            href={`mailto:${social.email}`}
            aria-label="Email"
            itemProp="email"
          >
            <FontAwesomeIcon icon={faEnvelope} />
          </a>
        )}
      </div>
    </div>
  )
}

export default Bio
