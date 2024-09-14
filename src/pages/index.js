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
        <hr />
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
      <hr />
      <ol style={{ listStyle: `none` }}
        data--bt--article--summary--list
        className={['bt--article--summary--list', 'm-0', 'p-0'].join(' ')}
      >
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug
          const featuredImage = getImage(post.frontmatter.featuredImage)
          const imagePosition = post.frontmatter.imagePosition || "center"

          return (
            <li key={post.fields.slug}
              data--bt--article--summary--wrapper
              className={'bt--article--summary--wrapper'}
            >
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                {featuredImage && (
                  <Link to={post.fields.slug}>
                    <div style={{ height: "420px", overflow: "hidden" }}
                      className={'bt--image--wrapper'}
                    >
                      <GatsbyImage
                        image={featuredImage}
                        alt={title}
                        style={{ height: "100%" }}
                        objectFit="cover"
                        objectPosition={imagePosition}
                      />
                    </div>
                  </Link>
                )}
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span itemProp="headline">{title}</span>
                    </Link>
                  </h2>
                  <small>{post.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          )
        })}
      </ol>
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
