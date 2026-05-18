/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const path = require(`path`)
const fs = require(`fs`)
const {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  buildIndexPath,
  buildLocalizedPath,
  getLanguageCodes,
} = require(`./i18n.config`)

// Define the template for blog post
const blogPost = path.resolve(`./src/templates/blog-post.js`)
const blogIndex = path.resolve(`./src/templates/blog-index.js`)

const articlePathPattern =
  /^(.+)\/index(?:\.([a-z]{2}(?:-[A-Za-z0-9]+)?))?\.md$/

const parseArticlePath = relativePath => {
  const match = relativePath.match(articlePathPattern)

  if (!match) {
    return null
  }

  const sourceSlug = match[1]
  const lang = match[2] || DEFAULT_LANGUAGE

  if (!LANGUAGES[lang]) {
    return null
  }

  return {
    lang,
    sourceSlug,
    localizedPath: buildLocalizedPath(sourceSlug, lang),
  }
}

const getAlternatePaths = posts =>
  posts.reduce((alternates, post) => {
    alternates[post.fields.lang] = post.fields.localizedPath
    return alternates
  }, {})

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }, limit: 1000) {
        nodes {
          id
          fields {
            lang
            sourceSlug
            localizedPath
          }
          frontmatter {
            date
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors,
    )
    return
  }

  const posts = result.data.allMarkdownRemark.nodes
  const postsByLanguage = getLanguageCodes().reduce((groups, lang) => {
    groups[lang] = posts.filter(post => post.fields.lang === lang)
    return groups
  }, {})
  const postsBySourceSlug = posts.reduce((groups, post) => {
    const sourceSlug = post.fields.sourceSlug
    groups[sourceSlug] = groups[sourceSlug] || []
    groups[sourceSlug].push(post)
    return groups
  }, {})
  const activeLanguages = getLanguageCodes().filter(
    lang => lang === DEFAULT_LANGUAGE || postsByLanguage[lang].length > 0,
  )
  const indexAlternatePaths = activeLanguages.reduce((alternates, lang) => {
    alternates[lang] = buildIndexPath(lang)
    return alternates
  }, {})

  // Create blog posts pages
  if (posts.length > 0) {
    getLanguageCodes().forEach(lang => {
      const languagePosts = postsByLanguage[lang]

      languagePosts.forEach((post, index) => {
        const previousPostId = index === 0 ? null : languagePosts[index - 1].id
        const nextPostId =
          index === languagePosts.length - 1
            ? null
            : languagePosts[index + 1].id
        const sourceGroup = postsBySourceSlug[post.fields.sourceSlug] || [post]
        const alternatePaths = getAlternatePaths(sourceGroup)

        createPage({
          path: post.fields.localizedPath,
          component: blogPost,
          context: {
            id: post.id,
            lang,
            sourceSlug: post.fields.sourceSlug,
            previousPostId,
            nextPostId,
            alternatePaths,
            xDefaultPath:
              alternatePaths[DEFAULT_LANGUAGE] || post.fields.localizedPath,
            activeLanguages,
          },
        })
      })
    })
  }

  // Create one index page per language that has public content.
  activeLanguages.forEach(lang => {
    createPage({
      path: buildIndexPath(lang),
      component: blogIndex,
      context: {
        lang,
        alternatePaths: indexAlternatePaths,
        xDefaultPath: buildIndexPath(DEFAULT_LANGUAGE),
        activeLanguages,
      },
    })
  })
}

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const fileNode = getNode(node.parent)
    const articlePath = parseArticlePath(fileNode.relativePath)

    if (!articlePath) {
      return
    }

    createNodeField({
      name: `slug`,
      node,
      value: articlePath.localizedPath,
    })
    createNodeField({
      name: `localizedPath`,
      node,
      value: articlePath.localizedPath,
    })
    createNodeField({
      name: `sourceSlug`,
      node,
      value: articlePath.sourceSlug,
    })
    createNodeField({
      name: `lang`,
      node,
      value: articlePath.lang,
    })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
/**
 * Ensure the "framework" webpack chunk is emitted in dev mode.
 * Gatsby's dev HTML template references /framework.js but the default
 * webpack splitChunks config doesn't always produce it, causing a 404.
 */
exports.onCreateWebpackConfig = ({ stage, actions }) => {
  if (stage === `develop`) {
    actions.setWebpackConfig({
      optimization: {
        splitChunks: {
          cacheGroups: {
            framework: {
              name: `framework`,
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              chunks: `all`,
              priority: 40,
              enforce: true,
            },
          },
        },
      },
    })
  }
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
      featuredImage: File @fileByRelativePath
      lang: String
      translationOf: String
      translationUpdatedAt: Date @dateformat
      translationSourceHash: String
      audioUrl: String
      audioDuration: String
      audioVoice: String
      audioGeneratedAt: Date @dateformat
      audioTextSource: String
    }

    type Fields {
      slug: String
      localizedPath: String
      sourceSlug: String
      lang: String
    }
  `)
}

// Fix sitemap-index.xml: gatsby-plugin-sitemap duplicates the domain
// when assetPrefix is set (e.g. bdteo.com/bdteo.com/sitemap-0.xml)
exports.onPostBuild = () => {
  const sitemapIndex = path.join(__dirname, "public", "sitemap-index.xml")
  if (fs.existsSync(sitemapIndex)) {
    let content = fs.readFileSync(sitemapIndex, "utf8")
    const fixed = content.replace(
      /https:\/\/bdteo\.com\/bdteo\.com\//g,
      "https://bdteo.com/",
    )
    if (fixed !== content) {
      fs.writeFileSync(sitemapIndex, fixed)
    }
  }
}
