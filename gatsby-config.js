// File: gatsby-config.js

/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

module.exports = {
  pathPrefix: "",
  assetPrefix: "https://bdteo.github.io",
  siteMetadata: {
    title: `Boris's Blog`,
    author: {
      name: `Boris D. Teoharov`,
      summary: `Senior Software Developer at ShareRig with expertise in web development, AI/ML, DevOps, and low-level programming. Passionate about exploring theoretical computer science, mathematics, and the creative applications of AI.`,
    },
    description: `A blog exploring the intersections of software development, theoretical computer science, and creative applications of AI.`,
    siteUrl: `https://bdteo.github.io`,
    social: {
      github: `bdteo`,
      email: `boristeoharov@gmail.com`,
    },
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sass`,
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
          `gatsby-remark-prismjs`,
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
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) =>
              allMarkdownRemark.nodes.map(node => ({
                ...node.frontmatter,
                description: node.excerpt,
                date: node.frontmatter.date,
                url: site.siteMetadata.siteUrl + node.fields.slug,
                guid: site.siteMetadata.siteUrl + node.fields.slug,
                custom_elements: [{ "content:encoded": node.html }],
              })),
            query: `
              {
                allMarkdownRemark(sort: {frontmatter: {date: DESC}}) {
                  nodes {
                    excerpt
                    html
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      date
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Boris D. Teoharov's Blog RSS Feed",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Boris D. Teoharov's Blog`,
        short_name: `BDTBlog`,
        start_url: `/`,
        background_color: `#1a1a1a`,
        theme_color: `#1a1a1a`,
        display: `minimal-ui`,
        icon: 'src/images/bd-icon@4x.png',
      },
    },
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        displayName: process.env.NODE_ENV !== 'production',
      },
    },
    {
      resolve: `gatsby-plugin-dark-mode`,
      options: {
        classNameDark: 'dark-mode',
        classNameLight: 'light-mode',
        storageKey: 'darkMode',
        minify: true,
        defaultClassName: 'dark-mode',
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [
          'G-7MSGWE21G5',
        ],
        gtagConfig: {
          optimize_id: "OPT_CONTAINER_ID",
          anonymize_ip: true,
          cookie_expires: 0,
        },
        pluginConfig: {
          head: true,
          respectDNT: true,
          delayOnRouteUpdate: 0,
        },
      },
    },
    // Re-enable gatsby-plugin-offline to manage the service worker
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        workboxConfig: {
          globPatterns: ['**/*'],
          // Use a unique cache name to force updates
          cacheId: 'gatsby-blog-v1',
          skipWaiting: true,
          clientsClaim: true,
        },
      },
    },
    // Remove the plugin below if you decide to use gatsby-plugin-offline
    // `gatsby-plugin-remove-serviceworker`,
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
          }
        `,
        resolvePages: ({ allSitePage: { nodes: allPages } }) => {
          return allPages.map(page => {
            return { ...page };
          });
        },
        serialize: ({ path }) => {
          return {
            url: path,
            changefreq: `daily`,
            priority: 0.7,
          };
        },
      },
    },
    {
      resolve: `gatsby-plugin-verify-bing`,
      options: {
        xmlFileName: 'BingSiteAuth.xml',
        content: 'DE9AA37DB58BF3C5CD561AE0B187709C',
      },
    },
  ],
}
