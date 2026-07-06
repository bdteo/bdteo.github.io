import * as React from "react"
import { Link, graphql, withPrefix } from "gatsby"
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
  const totalPosts = data.totalPosts.totalCount
  const {
    lang,
    alternatePaths = {},
    activeLanguages = [],
    archivePath,
    isArchive = false,
  } = pageContext || {}
  const chrome = getChrome(lang)

  // Infinite scroll as progressive enhancement: the server renders only the
  // capped post list (small DOM, fast audit), then the remaining posts are
  // appended from the archive page's prebuilt page-data.json once the reader
  // scrolls near the bottom. No JS / fetch failure falls back to the archive
  // link below.
  const [extraPosts, setExtraPosts] = React.useState([])
  const [autoLoadFailed, setAutoLoadFailed] = React.useState(false)
  const sentinelRef = React.useRef(null)
  const hiddenPostCount = Math.max(totalPosts - posts.length, 0)
  const shouldAutoLoad =
    !isArchive && hiddenPostCount > 0 && Boolean(archivePath)

  React.useEffect(() => {
    if (!shouldAutoLoad) return
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === "undefined") return

    let cancelled = false
    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        observer.disconnect()
        const dataPath = withPrefix(
          `/page-data${archivePath.replace(/\/+$/, "")}/page-data.json`,
        )
        fetch(dataPath)
          .then(res =>
            res.ok ? res.json() : Promise.reject(new Error(`${res.status}`)),
          )
          .then(json => {
            if (cancelled) return
            const nodes = json?.result?.data?.allMarkdownRemark?.nodes || []
            const seen = new Set(posts.map(post => post.fields.localizedPath))
            const fresh = nodes.filter(
              node => !seen.has(node.fields.localizedPath),
            )
            if (fresh.length === 0) {
              setAutoLoadFailed(true)
              return
            }
            setExtraPosts(fresh)
          })
          .catch(() => {
            if (!cancelled) setAutoLoadFailed(true)
          })
      },
      { rootMargin: "800px 0px" },
    )
    observer.observe(sentinel)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [shouldAutoLoad, archivePath, posts])

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

  const renderCard = (post, index, animate = false, batchIndex = 0) => {
    const title = post.frontmatter.title || post.fields.slug
    const featuredImage = getImage(post.frontmatter.featuredImage)
    const slug = post.fields.localizedPath
    const displayDate = formatDisplayDate(post.frontmatter.dateRaw, lang)
    const isPriorityImage = index === 0

    return (
      <ScrollReveal key={slug} animate={animate} index={batchIndex}>
        <Link to={slug} className="blog-card-link">
          <article
            className="blog-card"
            itemScope
            itemType="http://schema.org/Article"
          >
            <div className="blog-card-header">
              {featuredImage && (
                <div className="blog-card-image">
                  <GatsbyImage
                    image={featuredImage}
                    alt={title}
                    loading={isPriorityImage ? "eager" : "lazy"}
                    fetchPriority={isPriorityImage ? "high" : "auto"}
                  />
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
        <h2 className="section-title">
          {isArchive ? chrome.allPosts : chrome.recentPosts}
        </h2>
        <div className="grid-container auto-grid">
          {recentPosts.map((post, i) => renderCard(post, i))}
        </div>
      </div>

      {/* More Posts */}
      {(morePosts.length > 0 || extraPosts.length > 0) && (
        <div className="section">
          <h2 className="section-title">{chrome.morePosts}</h2>
          <div className="grid-container auto-grid">
            {morePosts.map((post, i) =>
              renderCard(post, i + RECENT_POSTS_COUNT),
            )}
            {extraPosts.map((post, i) =>
              renderCard(
                post,
                i + RECENT_POSTS_COUNT + morePosts.length,
                true,
                i,
              ),
            )}
          </div>
        </div>
      )}

      {shouldAutoLoad && (
        <>
          <div
            ref={sentinelRef}
            className="infinite-scroll-sentinel"
            aria-hidden="true"
          />
          {(extraPosts.length === 0 || autoLoadFailed) && (
            <div className="archive-link">
              <Link to={archivePath} className="custom-button secondary">
                {chrome.viewAllPosts}
              </Link>
            </div>
          )}
        </>
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
  query BlogIndexQuery($lang: String!, $postLimit: Int!) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { fields: { lang: { eq: $lang } } }
      limit: $postLimit
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
              gatsbyImageData(
                width: 420
                height: 280
                layout: CONSTRAINED
                placeholder: DOMINANT_COLOR
                formats: [AUTO, WEBP, AVIF]
                quality: 58
                outputPixelDensities: [0.5, 1]
              )
            }
          }
        }
      }
    }
    totalPosts: allMarkdownRemark(filter: { fields: { lang: { eq: $lang } } }) {
      totalCount
    }
  }
`
