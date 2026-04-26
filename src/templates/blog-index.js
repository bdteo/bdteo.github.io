import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import ScrollReveal from "../components/scroll-reveal"

const RECENT_POSTS_COUNT = 3

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <div className="section">
          <Bio />
        </div>
        <hr className="section-divider" />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  const recentPosts = posts.slice(0, RECENT_POSTS_COUNT)
  const morePosts = posts.slice(RECENT_POSTS_COUNT)

  const renderCard = (post, index) => {
    const title = post.frontmatter.title || post.fields.slug
    const featuredImage = getImage(post.frontmatter.featuredImage)
    const slug = post.fields.slug
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
              <span className="blog-card-date">{post.frontmatter.date}</span>
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
    <Layout location={location} title={siteTitle}>
      {/* Recent Posts */}
      <div className="section">
        <h2 className="section-title">Recent Posts</h2>
        <div className="grid-container auto-grid">
          {recentPosts.map((post, i) => renderCard(post, i))}
        </div>
      </div>

      {/* More Posts */}
      {morePosts.length > 0 && (
        <div className="section">
          <h2 className="section-title">More Posts</h2>
          <div className="grid-container auto-grid">
            {morePosts.map((post, i) => renderCard(post, i))}
          </div>
        </div>
      )}

      <hr className="section-divider" />

      {/* About Section */}
      <div className="section">
        <Bio />
      </div>
    </Layout>
  )
}

export default BlogIndex

export const Head = () => {
  return (
    <Seo
      title="All posts"
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
  query BlogIndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
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
