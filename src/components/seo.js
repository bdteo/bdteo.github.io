/**
 * Enhanced SEO component with canonical URLs and comprehensive meta tags
 * 
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { useLocation } from "@reach/router"

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
    <>
      <title>{metaTitle}</title>
      <meta name="title" content={metaTitle} />
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <meta name="author" content={author.name} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content={defaultTitle} />
      {metaImage && <meta property="og:image" content={metaImage} />}
      {article && datePublished && (
        <meta property="article:published_time" content={datePublished} />
      )}
      {article && dateModified && (
        <meta property="article:modified_time" content={dateModified} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content={metaImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:creator" content={social?.github || ""} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}
      
      {/* Bing Verification */}
      <meta name="msvalidate.01" content="DE9AA37DB58BF3C5CD561AE0B187709C" />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <html lang="en" />
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
    </>
  )
}

export default Seo
