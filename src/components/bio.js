// src/components/bio.js

import * as React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faGithub, faLinkedin, faTwitter, faEnvelope);

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
            github
            email
          }
        }
      }
    }
  `);

  const author = data.site.siteMetadata?.author;
  const social = data.site.siteMetadata?.social;

  return (
    <div className="bio">
      <div className="bio-image">
        <StaticImage
          className="bio-avatar"
          layout="fixed"
          formats={["auto", "webp", "avif"]}
          src="../images/profile-pic.png"
          width={150}
          height={150}
          quality={95}
          alt="Profile picture"
        />
      </div>
      <div className="bio-content">
        {author?.name && (
          <>
            <h2 className="bio-name">{author.name}</h2>
            <p className="bio-summary">{author.summary}</p>
          </>
        )}
        <div className="bio-social">
          {social?.github && (
            <a
              href={`https://github.com/${social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          )}
          {social?.email && (
            <a href={`mailto:${social.email}`} aria-label="Email">
              <FontAwesomeIcon icon={faEnvelope} />
            </a>
          )}
          {/* Add more social links as needed */}
        </div>
      </div>
    </div>
  );
};

export default Bio;
