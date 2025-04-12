import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

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
      <Bio />
      
      <div className="section">
        <h2 className="section-title">Latest Articles</h2>
        <div className="grid-container auto-grid">
          {posts.map(post => {
            const title = post.frontmatter.title || post.fields.slug
            const featuredImage = getImage(post.frontmatter.featuredImage)
            const slug = post.fields.slug
            return (
              <article key={slug} className="blog-card" itemScope itemType="http://schema.org/Article">
                {featuredImage && (
                  <Link to={slug} className="blog-card-image">
                    <GatsbyImage image={featuredImage} alt="" />
                  </Link>
                )}
                <div className="blog-card-content">
                  <h3 className="blog-card-title"><Link to={slug} itemProp="url"><span itemProp="headline">{title}</span></Link></h3>
                  <span className="blog-card-date">{post.frontmatter.date}</span>
                  <p className="blog-card-excerpt" dangerouslySetInnerHTML={{__html: post.frontmatter.description || post.excerpt}} itemProp="description" />
                  <div className="blog-card-footer">
                    <Link to={slug} className="custom-button primary">Read More</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

export default BlogIndex

export const Head = () => <Seo title="All posts" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
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
              gatsbyImageData(width: 600, height: 300, layout: CONSTRAINED)
            }
          }
        }
      }
    }
  }
`