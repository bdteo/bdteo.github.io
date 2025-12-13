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
      <div className="bio-content">
        {author?.name && (
          <>
            <h2 className="bio-name" itemProp="name">Hey, I'm Boris</h2>
            <p className="bio-intro">
              I write about software development, AI experiments, and the occasional deep dive into 
              computer science topics that catch my interest.
            </p>
            <p className="bio-summary" itemProp="description">{author.summary}</p>
            {/* Hidden schema.org properties */}
            <meta itemProp="jobTitle" content="Senior Software Developer" />
            <meta itemProp="worksFor" content="GetHookd AI LLC" />
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
    </div>
  );
};

export default Bio;
