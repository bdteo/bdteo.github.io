import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Pagination from "../components/pagination"

const BlogIndex = ({ data, location, pageContext }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const { currentPage, numPages, hasNextPage, hasPreviousPage } = pageContext

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <div className="section">
          <Bio />
        </div>
        <hr className="my-8" />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  // For the first page, show featured posts and recent posts
  if (currentPage === 1) {
    const featuredPosts = posts.slice(0, 3)
    const recentPosts = posts.slice(3)

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
            <h2 className="section-title">More Posts</h2>
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
            
            {numPages > 1 && (
              <Pagination
                currentPage={currentPage}
                numPages={numPages}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
              />
            )}
          </div>
        )}

        {/* About Section */}
        <div className="section">
          <Bio />
        </div>
      </Layout>
    )
  }

  // For other pages, show all posts with pagination
  return (
    <Layout location={location} title={siteTitle}>
      <div className="section">
        <h2 className="section-title">All Posts - Page {currentPage}</h2>
        <div className="grid-container auto-grid">
          {posts.map(post => {
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
        
        <Pagination
          currentPage={currentPage}
          numPages={numPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </div>
    </Layout>
  )
}

export default BlogIndex

export const Head = ({ pageContext }) => {
  const { currentPage } = pageContext
  const title = currentPage === 1 ? "All posts" : `All posts - Page ${currentPage}`
  
  return (
    <Seo 
      title={title}
      keywords={[
        "software development", 
        "programming", 
        "web development", 
        "artificial intelligence", 
        "machine learning",
        "theoretical computer science",
        "blog"
      ]}
    />
  )
}

export const pageQuery = graphql`
  query BlogIndexQuery($skip: Int!, $limit: Int!) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      limit: $limit
      skip: $skip
    ) {
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