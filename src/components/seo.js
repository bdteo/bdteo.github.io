/**
 * Enhanced SEO component with canonical URLs and comprehensive meta tags
 * 
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { useLocation } from "@reach/router"
import { Helmet } from "react-helmet"

const Seo = ({ 
  description, 
  title, 
  image, 
  article = false, 
  keywords = [], 
  datePublished,
  dateModified,
  children 
}) => {
  const { pathname } = useLocation()
  
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            siteUrl
            social {
              twitter
              github
            }
            author {
              name
            }
          }
        }
      }
    `
  )

  const {
    title: defaultTitle,
    description: defaultDescription,
    siteUrl,
    social,
    author
  } = site.siteMetadata

  const metaDescription = description || defaultDescription
  const metaTitle = title ? `${title} | ${defaultTitle}` : defaultTitle
  const metaImage = image ? `${siteUrl}${image}` : null
  const url = `${siteUrl}${pathname}`
  const metaKeywords = keywords.length > 0 ? keywords.join(", ") : "programming, software development, web development, AI, machine learning"
  
  return (
    <Helmet
      htmlAttributes={{
        lang: 'en'
      }}
      title={metaTitle}
      titleTemplate={title ? `%s | ${defaultTitle}` : defaultTitle}
      meta={[
        // Primary Meta Tags
        { name: 'title', content: metaTitle },
        { name: 'description', content: metaDescription },
        { name: 'author', content: author.name },
        ...(metaKeywords ? [{ name: 'keywords', content: metaKeywords }] : []),
        
        // Open Graph / Facebook
        { property: 'og:type', content: article ? 'article' : 'website' },
        { property: 'og:url', content: url },
        { property: 'og:title', content: metaTitle },
        { property: 'og:description', content: metaDescription },
        { property: 'og:site_name', content: defaultTitle },
        ...(metaImage ? [{ property: 'og:image', content: metaImage }] : []),
        ...(article && datePublished ? [{ property: 'article:published_time', content: datePublished }] : []),
        ...(article && dateModified ? [{ property: 'article:modified_time', content: dateModified }] : []),
        
        // Twitter
        { name: 'twitter:card', content: metaImage ? 'summary_large_image' : 'summary' },
        { name: 'twitter:creator', content: social?.twitter || '' },
        { name: 'twitter:title', content: metaTitle },
        { name: 'twitter:description', content: metaDescription },
        ...(metaImage ? [{ name: 'twitter:image', content: metaImage }] : []),
        
        // Bing Verification
        { name: 'msvalidate.01', content: 'DE9AA37DB58BF3C5CD561AE0B187709C' },
        
        // Robots directives
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { name: 'bingbot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      ]}
      link={[
        { rel: 'canonical', href: url }
      ]}
    >
      {/* Structured Data for Articles */}
      {article && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": metaDescription,
            "author": {
              "@type": "Person",
              "name": author.name
            },
            "datePublished": datePublished,
            "dateModified": dateModified || datePublished,
            "publisher": {
              "@type": "Organization",
              "name": defaultTitle,
              "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/images/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": url
            },
            ...(metaImage && {
              "image": {
                "@type": "ImageObject",
                "url": metaImage
              }
            })
          })}
        </script>
      )}
      
      {/* Additional tags provided by the component user */}
      {children}
    </Helmet>
  )
}

export default Seo
