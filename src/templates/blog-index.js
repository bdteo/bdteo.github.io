import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import ScrollReveal from "../components/scroll-reveal"
import { formatDisplayDate, getChrome } from "../../i18n.config"

const RECENT_POSTS_COUNT = 3

const BlogIndex = ({ data, location, pageContext }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const { lang, alternatePaths = {}, activeLanguages = [] } = pageContext || {}
  const chrome = getChrome(lang)

  if (posts.length === 0) {
    return (
      <Layout
        location={location}
        title={siteTitle}
        lang={lang}
        alternatePaths={alternatePaths}
        activeLanguages={activeLanguages}
      >
        <div className="section">
          <Bio lang={lang} />
        </div>
        <hr className="section-divider" />
        <p>{chrome.noPosts}</p>
      </Layout>
    )
  }

  const recentPosts = posts.slice(0, RECENT_POSTS_COUNT)
  const morePosts = posts.slice(RECENT_POSTS_COUNT)

  const renderCard = (post, index) => {
    const title = post.frontmatter.title || post.fields.slug
    const featuredImage = getImage(post.frontmatter.featuredImage)
    const slug = post.fields.localizedPath
    const displayDate = formatDisplayDate(post.frontmatter.dateRaw, lang)

    return (
      <ScrollReveal key={slug} index={index}>
        <Link to={slug} className="blog-card-link">
          <article
            className="blog-card"
            itemScope
            itemType="http://schema.org/Article"
          >
            <div className="blog-card-header">
              {featuredImage && (
                <div className="blog-card-image">
                  <GatsbyImage image={featuredImage} alt={title} />
                </div>
              )}
              <span className="blog-card-date">{displayDate}</span>
              <div className="blog-card-overlay">
                <h3 className="blog-card-title" itemProp="headline">
                  {title}
                </h3>
                <p
                  className="blog-card-excerpt"
                  dangerouslySetInnerHTML={{
                    __html: post.frontmatter.description,
                  }}
                  itemProp="description"
                />
              </div>
            </div>
          </article>
        </Link>
      </ScrollReveal>
    )
  }

  return (
    <Layout
      location={location}
      title={siteTitle}
      lang={lang}
      alternatePaths={alternatePaths}
      activeLanguages={activeLanguages}
    >
      {/* Recent Posts */}
      <div className="section">
        <h2 className="section-title">{chrome.recentPosts}</h2>
        <div className="grid-container auto-grid">
          {recentPosts.map((post, i) => renderCard(post, i))}
        </div>
      </div>

      {/* More Posts */}
      {morePosts.length > 0 && (
        <div className="section">
          <h2 className="section-title">{chrome.morePosts}</h2>
          <div className="grid-container auto-grid">
            {morePosts.map((post, i) => renderCard(post, i))}
          </div>
        </div>
      )}

      <hr className="section-divider" />

      {/* About Section */}
      <div className="section">
        <Bio lang={lang} />
      </div>
    </Layout>
  )
}

export default BlogIndex

export const Head = ({ pageContext }) => {
  const { lang, alternatePaths, xDefaultPath } = pageContext || {}

  return (
    <Seo
      lang={lang}
      canonicalPath={alternatePaths?.[lang]}
      alternatePaths={alternatePaths}
      xDefaultPath={xDefaultPath}
      keywords={[
        "software development",
        "programming",
        "web development",
        "artificial intelligence",
        "machine learning",
        "theoretical computer science",
        "blog",
      ]}
    />
  )
}

export const pageQuery = graphql`
  query BlogIndexQuery($lang: String!) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { fields: { lang: { eq: $lang } } }
    ) {
      nodes {
        fields {
          localizedPath
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          dateRaw: date
          title
          description
          imagePosition
          featuredImage {
            childImageSharp {
              gatsbyImageData(width: 600, height: 400, layout: CONSTRAINED)
            }
          }
        }
      }
    }
  }
`
