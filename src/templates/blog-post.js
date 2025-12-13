import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import GiscusComments from "../components/GiscusComments"

const BlogPostTemplate = ({
                            data: { previous, next, site, markdownRemark: post },
                            location,
                          }) => {
  const siteTitle = site.siteMetadata?.title || `Title`
  const featuredImage = getImage(post.frontmatter.featuredImage)

  return (
    <Layout location={location} title={siteTitle}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p>{post.frontmatter.date}</p>
        </header>
        {featuredImage && (
          <figure className="featured-image">
            <GatsbyImage image={featuredImage} alt={post.frontmatter.title} />
            {post.frontmatter.imageCaption && (
              <figcaption>{post.frontmatter.imageCaption}</figcaption>
            )}
          </figure>
        )}
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        <hr />
        <footer>
          <Bio />
        </footer>
      </article>
      <GiscusComments />
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                <span>{previous.frontmatter.title}</span>
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                <span>{next.frontmatter.title}</span>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export const Head = ({ data: { markdownRemark: post, site } }) => {
  // Extract the featured image path for SEO.
  // Use a JPG derivative for maximum compatibility with link previews (Slack/Discord/etc).
  const ogImage = post.frontmatter.featuredImage?.childImageSharp?.resize?.src
  const ogImageWidth = post.frontmatter.featuredImage?.childImageSharp?.resize?.width
  const ogImageHeight = post.frontmatter.featuredImage?.childImageSharp?.resize?.height
  
  // Extract frontmatter fields
  const { title, description, date, tags, jsonld } = post.frontmatter
  
  // Format dates in ISO format for structured data
  const datePublished = new Date(date).toISOString()
  
  return (
    <Seo
      title={title}
      description={description || post.excerpt}
      image={ogImage}
      imageAlt={title}
      imageWidth={ogImageWidth}
      imageHeight={ogImageHeight}
      article={true}
      keywords={tags || []}
      datePublished={datePublished}
      dateModified={datePublished} // Use the same date if no modified date available
      schema={jsonld}
    />
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        imageCaption
        tags
        jsonld
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 800, layout: FULL_WIDTH)
            resize(width: 1200, toFormat: JPG, quality: 82) {
              src
              width
              height
            }
          }
        }
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
