import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Breadcrumb from "../components/breadcrumb"
import ArticleAudioPlayer from "../components/ArticleAudioPlayer"
import Layout from "../components/layout"
import Seo from "../components/seo"
import GiscusComments from "../components/GiscusComments"

const BlogPostTemplate = ({
  data: { previous, next, site, markdownRemark: post },
  location,
}) => {
  const siteTitle = site.siteMetadata?.title || `Title`
  const featuredImage = getImage(post.frontmatter.featuredImage)
  const hasArticleAudio = Boolean(post.frontmatter.audioUrl)

  return (
    <Layout location={location} title={siteTitle}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <Breadcrumb title={post.frontmatter.title} />
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p className="blog-post__date">{post.frontmatter.date}</p>
          {post.frontmatter.description && (
            <p className="blog-post__dek">{post.frontmatter.description}</p>
          )}
        </header>
        {featuredImage ? (
          <div
            className={`blog-post__media${
              hasArticleAudio ? " blog-post__media--with-audio" : ""
            }`}
          >
            <figure className="featured-image">
              <div className="blog-post__media-frame">
                <GatsbyImage
                  image={featuredImage}
                  alt={post.frontmatter.title}
                />
                <ArticleAudioPlayer
                  title={post.frontmatter.title}
                  src={post.frontmatter.audioUrl}
                  duration={post.frontmatter.audioDuration}
                />
              </div>
              {post.frontmatter.imageCaption && (
                <figcaption>{post.frontmatter.imageCaption}</figcaption>
              )}
            </figure>
          </div>
        ) : (
          <ArticleAudioPlayer
            title={post.frontmatter.title}
            src={post.frontmatter.audioUrl}
            duration={post.frontmatter.audioDuration}
          />
        )}
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
      </article>
      <hr />
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
      <GiscusComments />
      <footer className="blog-post-bio">
        <Bio />
      </footer>
    </Layout>
  )
}

export const Head = ({ data: { markdownRemark: post, site } }) => {
  // Extract the featured image path for SEO.
  // Use a JPG derivative for maximum compatibility with link previews (Slack/Discord/etc).
  const ogImage = post.frontmatter.featuredImage?.childImageSharp?.resize?.src
  const ogImageWidth =
    post.frontmatter.featuredImage?.childImageSharp?.resize?.width
  const ogImageHeight =
    post.frontmatter.featuredImage?.childImageSharp?.resize?.height

  // Extract frontmatter fields
  const {
    title,
    description,
    date,
    dateRaw,
    tags,
    jsonld,
    audioUrl,
    audioDuration,
    audioVoice,
    audioGeneratedAt,
  } = post.frontmatter

  // Format dates in ISO format for structured data
  const datePublished = new Date(dateRaw || date).toISOString()

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
      audio={{
        url: audioUrl,
        duration: audioDuration,
        voice: audioVoice,
        generatedAt: audioGeneratedAt,
      }}
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
        dateRaw: date
        description
        imageCaption
        tags
        jsonld
        audioUrl
        audioDuration
        audioVoice
        audioGeneratedAt
        audioTextSource
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
