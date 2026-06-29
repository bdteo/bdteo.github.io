// File: gatsby-config.js

const fs = require("fs")
const path = require("path")

const {
  DEFAULT_LANGUAGE,
  buildIndexPath,
  getChrome,
  getLanguage,
  getLanguageCodes,
} = require("./i18n.config")

const assetPrefix = process.env.BLOG_ASSET_PREFIX ?? "https://bdteo.com"

const getPublishedLanguageCodes = () => {
  const blogDir = path.join(__dirname, "content", "blog")
  const published = new Set([DEFAULT_LANGUAGE])

  if (!fs.existsSync(blogDir)) {
    return [DEFAULT_LANGUAGE]
  }

  fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .forEach(entry => {
      const articleDir = path.join(blogDir, entry.name)
      fs.readdirSync(articleDir).forEach(fileName => {
        const match = fileName.match(
          /^index\.([a-z]{2}(?:-[A-Za-z0-9]+)?)\.md$/,
        )
        if (match && getLanguageCodes().includes(match[1])) {
          published.add(match[1])
        }
      })
    })

  return getLanguageCodes().filter(code => published.has(code))
}

const createFeedConfig = lang => {
  const language = getLanguage(lang)
  const chrome = getChrome(lang)
  const output =
    lang === DEFAULT_LANGUAGE ? "/rss.xml" : `${buildIndexPath(lang)}rss.xml`
  const siteUrl = "https://bdteo.com"
  const languageHome = `${siteUrl}${buildIndexPath(lang)}`

  return {
    serialize: ({ query: { site, allMarkdownRemark } }) =>
      allMarkdownRemark.nodes.map(node => ({
        ...node.frontmatter,
        description: node.excerpt,
        date: node.frontmatter.date,
        url: site.siteMetadata.siteUrl + node.fields.localizedPath,
        guid: site.siteMetadata.siteUrl + node.fields.localizedPath,
        custom_elements: [{ "content:encoded": node.html }],
      })),
    query: `
      {
        allMarkdownRemark(
          sort: {frontmatter: {date: DESC}}
          filter: {fields: {lang: {eq: "${lang}"}}}
        ) {
          nodes {
            excerpt
            html
            fields {
              localizedPath
            }
            frontmatter {
              title
              date
            }
          }
        }
      }
    `,
    output,
    description: chrome.siteDescription,
    site_url: languageHome,
    feed_url: `${siteUrl}${output}`,
    title:
      lang === DEFAULT_LANGUAGE
        ? "Boris D. Teoharov's Blog RSS Feed"
        : `${chrome.navHome} - Boris D. Teoharov (${language.label})`,
  }
}

/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

module.exports = {
  pathPrefix: "",
  assetPrefix,
  siteMetadata: {
    title: `Boris D. Teoharov`,
    author: {
      name: `Boris D. Teoharov`,
      summary: `I am not a writer. I am not a philosopher. I am just a backend engineer from Bulgaria, sitting between Laravel queues and hundred-million-row indexes for a living. The rest of the time I read medicine I have no business reading, French novels I half-understand, and whatever else my small rubber head wants to chew on. Two rescued strays keep me honest.`,
    },
    description: `Quiet essays on engineering, language, and what shows up at the edge of every honest inquiry. Written slowly, from Sofia.`,
    siteUrl: `https://bdteo.com`,
    social: {
      github: `bdteo`,
      email: `boristeoharov@gmail.com`,
      twitter: `@boris_teo`,
    },
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              aliases: {
                "c++": "cpp",
              },
            },
          },
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: getPublishedLanguageCodes().map(createFeedConfig),
      },
    },
    // Remove service worker to prevent caching issues with new content
    `gatsby-plugin-remove-serviceworker`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage {
              nodes {
                path
              }
            }
            allMarkdownRemark {
              nodes {
                fields {
                  lang
                  localizedPath
                  sourceSlug
                }
                frontmatter {
                  date
                }
              }
            }
          }
        `,
        resolvePages: ({
          site,
          allSitePage: { nodes: allPages },
          allMarkdownRemark: { nodes: allPosts },
        }) => {
          const siteUrl = site.siteMetadata.siteUrl.replace(/\/$/, "")
          const activeLanguages = getPublishedLanguageCodes()
          const indexLinks = activeLanguages.map(lang => ({
            lang: getLanguage(lang).hreflang,
            url: `${siteUrl}${buildIndexPath(lang)}`,
          }))
          indexLinks.push({
            lang: "x-default",
            url: `${siteUrl}${buildIndexPath(DEFAULT_LANGUAGE)}`,
          })

          // Create a map of localized post paths to their dates and alternates.
          const postsBySourceSlug = allPosts.reduce((acc, post) => {
            const sourceSlug = post.fields.sourceSlug
            acc[sourceSlug] = acc[sourceSlug] || []
            acc[sourceSlug].push(post)
            return acc
          }, {})
          const postsByPath = allPosts.reduce((acc, post) => {
            if (post.fields && post.fields.localizedPath) {
              const sourceGroup = postsBySourceSlug[post.fields.sourceSlug] || [
                post,
              ]
              const links = sourceGroup.map(alternate => ({
                lang: getLanguage(alternate.fields.lang).hreflang,
                url: `${siteUrl}${alternate.fields.localizedPath}`,
              }))
              const englishAlternate = sourceGroup.find(
                alternate => alternate.fields.lang === DEFAULT_LANGUAGE,
              )

              if (englishAlternate) {
                links.push({
                  lang: "x-default",
                  url: `${siteUrl}${englishAlternate.fields.localizedPath}`,
                })
              }

              acc[post.fields.localizedPath] = {
                date: post.frontmatter.date,
                links,
              }
            }
            return acc
          }, {})

          // Add date info to pages
          return allPages.map(page => {
            // Find matching post data if it exists
            const postData = postsByPath[page.path]

            // For blog posts, use their date and higher priority
            if (postData) {
              return {
                ...page,
                lastmod: postData.date,
                links: postData.links,
                priority: 0.9,
                changefreq: "monthly",
              }
            }

            if (
              activeLanguages.some(lang => page.path === buildIndexPath(lang))
            ) {
              return {
                ...page,
                links: indexLinks,
                priority: page.path === "/" ? 1.0 : 0.7,
                changefreq: page.path === "/" ? "daily" : "weekly",
              }
            }

            // For other pages, use defaults
            return {
              ...page,
              priority: page.path === "/" ? 1.0 : 0.7,
              changefreq: page.path === "/" ? "daily" : "weekly",
            }
          })
        },
        serialize: ({ path, lastmod, changefreq, priority, links }) => {
          const sitemapItem = {
            url: path,
            changefreq: changefreq || "weekly",
            priority: priority || 0.7,
          }

          if (links?.length) {
            sitemapItem.links = links
          }

          if (lastmod) {
            sitemapItem.lastmod = lastmod
          }

          return sitemapItem
        },
      },
    },
    // Bing verification is now handled directly in the SEO component with a meta tag
  ],
}
