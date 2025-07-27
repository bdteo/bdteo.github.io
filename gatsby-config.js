// File: gatsby-config.js

/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

module.exports = {
  pathPrefix: "",
  assetPrefix: "https://bdteo.com",
  siteMetadata: {
    title: `Boris's Blog`,
    author: {
      name: `Boris D. Teoharov`,
      summary: `Senior Software Developer at ShareRig with expertise in web development, AI/ML, DevOps, and low-level programming. Passionate about exploring theoretical computer science, mathematics, and the creative applications of AI.`,
    },
    description: `A blog exploring the intersections of software development, theoretical computer science, and creative applications of AI.`,
    siteUrl: `https://bdteo.com`,
    social: {
      github: `bdteo`,
      email: `boristeoharov@gmail.com`,
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
                'c++': 'cpp',
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
                  slug
                }
                frontmatter {
                  date
                }
              }
            }
          }
        `,
        resolvePages: ({ allSitePage: { nodes: allPages }, allMarkdownRemark: { nodes: allPosts } }) => {
          // Create a map of post slugs to their dates
          const postsByPath = allPosts.reduce((acc, post) => {
            if (post.fields && post.fields.slug) {
              acc[post.fields.slug] = {
                date: post.frontmatter.date,
              };
            }
            return acc;
          }, {});
          
          // Add date info to pages
          return allPages.map(page => {
            // Find matching post data if it exists
            const postData = Object.keys(postsByPath).find(slug => 
              page.path.endsWith(slug)
            );
            
            // For blog posts, use their date and higher priority
            if (postData) {
              return { 
                ...page, 
                lastmod: postsByPath[postData].date,
                priority: 0.9,
                changefreq: 'monthly'
              };
            }
            
            // For other pages, use defaults
            return { 
              ...page,
              priority: page.path === '/' ? 1.0 : 0.7,
              changefreq: page.path === '/' ? 'daily' : 'weekly'
            };
          });
        },
        serialize: ({ path, lastmod, changefreq, priority }) => {
          const sitemapItem = {
            url: path,
            changefreq: changefreq || 'weekly',
            priority: priority || 0.7,
          };
          
          if (lastmod) {
            sitemapItem.lastmod = lastmod;
          }
          
          return sitemapItem;
        },
      },
    },
    // Bing verification is now handled directly in the SEO component with a meta tag
  ],
}
