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
      {/* Recent Posts */}
      <div className="section">
        <h2 className="section-title">Recent Posts</h2>
        <div className="grid-container auto-grid">
          {featuredPosts.map(post => {
            const title = post.frontmatter.title || post.fields.slug
            const featuredImage = getImage(post.frontmatter.featuredImage)
            const slug = post.fields.slug
            return (
              <Link to={slug} key={slug} className="blog-card-link">
                <article className="blog-card" itemScope itemType="http://schema.org/Article">
                  <div className="blog-card-header">
                    {featuredImage && (
                      <div className="blog-card-image">
                        <GatsbyImage image={featuredImage} alt={title} />
                      </div>
                    )}
                    <span className="blog-card-date">{post.frontmatter.date}</span>
                    <div className="blog-card-overlay">
                      <h3 className="blog-card-title" itemProp="headline">{title}</h3>
                      <p className="blog-card-excerpt" dangerouslySetInnerHTML={{ __html: post.frontmatter.description }} itemProp="description" />
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      </div>

      {/* More Posts */}
      {recentPosts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">More Posts</h2>
            <Link to="/archive" className="section-link">View All</Link>
          </div>
          <div className="grid-container auto-grid">
            {recentPosts.map(post => {
              const title = post.frontmatter.title || post.fields.slug
              const featuredImage = getImage(post.frontmatter.featuredImage)
              const slug = post.fields.slug
              return (
                <Link to={slug} key={slug} className="blog-card-link">
                  <article className="blog-card" itemScope itemType="http://schema.org/Article">
                    <div className="blog-card-header">
                      {featuredImage && (
                        <div className="blog-card-image">
                          <GatsbyImage image={featuredImage} alt={title} />
                        </div>
                      )}
                      <span className="blog-card-date">{post.frontmatter.date}</span>
                      <div className="blog-card-overlay">
                        <h3 className="blog-card-title" itemProp="headline">{title}</h3>
                        <p className="blog-card-excerpt" dangerouslySetInnerHTML={{ __html: post.frontmatter.description }} itemProp="description" />
                      </div>
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
