import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const author = data.site.siteMetadata?.author
  const featuredPosts = posts.slice(0, 3)
  const recentPosts = posts.slice(3, 9)

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>

        <Bio />
        <hr className="my-8" />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      {/* Featured Articles */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Posts</h2>
        </div>
        <div className="featured-grid">
          {featuredPosts.map((post, index) => {
            const title = post.frontmatter.title || post.fields.slug
            const featuredImage = getImage(post.frontmatter.featuredImage)
            const slug = post.fields.slug
            return (
              <Link to={slug} key={slug} className={`featured-card ${index === 0 ? 'featured-card-large' : ''}`}>
                <article className="featured-article" itemScope itemType="http://schema.org/Article">
                  {featuredImage && (
                    <div className="featured-image">
                      <GatsbyImage image={featuredImage} alt={title} />
                      <div className="featured-overlay"></div>
                    </div>
                  )}
                  <div className="featured-content">
                    <span className="featured-date">{post.frontmatter.date}</span>
                    <h3 className="featured-title" itemProp="headline">{title}</h3>
                    <p className="featured-excerpt" dangerouslySetInnerHTML={{ __html: post.frontmatter.description }} itemProp="description" />
                    <div className="featured-read-more">
                      <span>Read Article</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8.5H2.75a.75.75 0 0 1 0-1.5h8.69L8.22 4.03a.75.75 0 0 1 0-1.06Z"/>
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Articles */}
      {recentPosts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">More Posts</h2>
            <Link to="/archive" className="section-link">View All</Link>
          </div>
          <div className="recent-grid">
            {recentPosts.map(post => {
              const title = post.frontmatter.title || post.fields.slug
              const featuredImage = getImage(post.frontmatter.featuredImage)
              const slug = post.fields.slug
              return (
                <Link to={slug} key={slug} className="recent-card">
                  <article className="recent-article" itemScope itemType="http://schema.org/Article">
                    {featuredImage && (
                      <div className="recent-image">
                        <GatsbyImage image={featuredImage} alt={title} />
                      </div>
                    )}
                    <div className="recent-content">
                      <span className="recent-date">{post.frontmatter.date}</span>
                      <h3 className="recent-title" itemProp="headline">{title}</h3>
                      <p className="recent-excerpt" dangerouslySetInnerHTML={{ __html: post.frontmatter.description }} itemProp="description" />
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* About Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Hey, I'm Boris</h2>
          <p className="section-subtitle">
            I write about software development, AI experiments, and the occasional deep dive into 
            computer science topics that catch my interest.
          </p>
        </div>
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
        "blog"
      ]}
    >
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Boris D. Teoharov's Blog",
          "url": "https://bdteo.com",
          "description": "A blog exploring the intersections of software development, theoretical computer science, and creative applications of AI.",
          "author": {
            "@type": "Person",
            "name": "Boris D. Teoharov"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://bdteo.com/?s={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Seo>
  )
}

export const pageQuery = graphql`
  {
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
