/**
 * Enhanced SEO component with canonical URLs and comprehensive meta tags
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { useLocation } from "@reach/router"

const toAbsoluteUrl = (value, siteUrl) => {
  if (!value) {
    return undefined
  }

  try {
    return new URL(value, siteUrl).href
  } catch {
    return value
  }
}

const getAudioEncodingFormat = audioUrl => {
  const cleanUrl = audioUrl?.split(/[?#]/)[0].toLowerCase()

  if (cleanUrl?.endsWith(".m4a")) {
    return "audio/mp4"
  }

  if (cleanUrl?.endsWith(".mp3")) {
    return "audio/mpeg"
  }

  if (cleanUrl?.endsWith(".wav")) {
    return "audio/wav"
  }

  if (cleanUrl?.endsWith(".ogg") || cleanUrl?.endsWith(".oga")) {
    return "audio/ogg"
  }

  if (cleanUrl?.endsWith(".flac")) {
    return "audio/flac"
  }

  if (cleanUrl?.endsWith(".aac")) {
    return "audio/aac"
  }

  return undefined
}

const formatIsoDuration = duration => {
  if (!duration) {
    return undefined
  }

  const value = String(duration).trim()

  if (/^P(?:\d+D)?T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?$/i.test(value)) {
    return value
  }

  const parts = value.split(":")

  if (parts.length < 2 || parts.length > 3) {
    return undefined
  }

  const seconds = parts.reduce((total, part) => {
    if (!/^\d+$/.test(part)) {
      return NaN
    }

    return total * 60 + Number(part)
  }, 0)

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return undefined
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  const hourPart = hours ? `${hours}H` : ""
  const minutePart = minutes ? `${minutes}M` : ""
  const secondPart = remainingSeconds ? `${remainingSeconds}S` : ""

  return `PT${hourPart}${minutePart}${secondPart || "0S"}`
}

const schemaTypeMatches = (value, expectedTypes) => {
  const schemaTypes = Array.isArray(value?.["@type"])
    ? value["@type"]
    : [value?.["@type"]]

  return schemaTypes.some(schemaType => expectedTypes.includes(schemaType))
}

const mergeAudioIntoSchema = (schema, audioObject) => {
  if (!audioObject || !schema || typeof schema !== "object") {
    return schema
  }

  const articleTypes = ["Article", "BlogPosting"]

  if (Array.isArray(schema)) {
    return schema.map(entry => mergeAudioIntoSchema(entry, audioObject))
  }

  if (Array.isArray(schema["@graph"])) {
    let mergedAnyGraphEntry = false
    const graph = schema["@graph"].map(entry => {
      if (schemaTypeMatches(entry, articleTypes)) {
        mergedAnyGraphEntry = true
        return mergeAudioIntoSchema(entry, audioObject)
      }

      return entry
    })

    return mergedAnyGraphEntry ? { ...schema, "@graph": graph } : schema
  }

  if (!schemaTypeMatches(schema, articleTypes)) {
    return schema
  }

  const existingAudio =
    schema.audio &&
    typeof schema.audio === "object" &&
    !Array.isArray(schema.audio)
      ? schema.audio
      : {}

  return {
    ...schema,
    audio: {
      ...audioObject,
      ...existingAudio,
    },
  }
}

const parseJsonSchema = schema => {
  if (typeof schema !== "string") {
    return schema
  }

  try {
    const parsedSchema = JSON.parse(schema)

    return parsedSchema && typeof parsedSchema === "object"
      ? parsedSchema
      : schema
  } catch {
    return schema
  }
}

const serializeJsonLd = schema =>
  typeof schema === "string"
    ? schema
    : JSON.stringify(schema).replace(/</g, "\\u003c")

const Seo = ({
  description,
  title,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  article = false,
  keywords = [],
  datePublished,
  dateModified,
  schema,
  audio,
  children,
}) => {
  const { pathname } = useLocation()

  const { site } = useStaticQuery(graphql`
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
  `)

  const {
    title: defaultTitle,
    description: defaultDescription,
    siteUrl,
    social,
    author,
  } = site.siteMetadata

  const DEFAULT_OG_IMAGE = "/og/cover.jpg"
  const DEFAULT_OG_IMAGE_WIDTH = 1920
  const DEFAULT_OG_IMAGE_HEIGHT = 1280
  const DEFAULT_OG_IMAGE_ALT =
    "An old wooden door, slightly open. Dawn light spilling onto the threshold."

  const metaDescription = description || defaultDescription
  const metaTitle = title ? `${title}` : defaultTitle
  const metaImage = image
    ? `${siteUrl}${image}`
    : `${siteUrl}${DEFAULT_OG_IMAGE}`
  const finalImageWidth = image ? imageWidth : DEFAULT_OG_IMAGE_WIDTH
  const finalImageHeight = image ? imageHeight : DEFAULT_OG_IMAGE_HEIGHT
  const imageMimeType = metaImage.toLowerCase().endsWith(".webp")
    ? "image/webp"
    : "image/jpeg"
  const url = `${siteUrl}${pathname}`
  const metaKeywords =
    keywords.length > 0
      ? keywords.join(", ")
      : "programming, software development, web development, AI, machine learning"
  const metaImageAlt = imageAlt || (image ? metaTitle : DEFAULT_OG_IMAGE_ALT)
  const audioContentUrl = toAbsoluteUrl(audio?.url, siteUrl)
  const audioEncodingFormat = getAudioEncodingFormat(audioContentUrl)
  const audioDuration = formatIsoDuration(audio?.duration)
  const audioObject = audioContentUrl
    ? {
        "@type": "AudioObject",
        name: `${title} narration`,
        contentUrl: audioContentUrl,
        ...(audioEncodingFormat && { encodingFormat: audioEncodingFormat }),
        ...(audioDuration && { duration: audioDuration }),
        description: audio?.voice
          ? `Audio narration of "${title}", generated with ${audio.voice}.`
          : `Audio narration of "${title}".`,
        ...(audio?.generatedAt && { dateCreated: audio.generatedAt }),
      }
    : undefined
  const defaultArticleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: metaDescription,
    author: {
      "@type": "Person",
      name: author.name,
    },
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    publisher: {
      "@type": "Organization",
      name: defaultTitle,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(metaImage && {
      image: {
        "@type": "ImageObject",
        url: metaImage,
      },
    }),
  }
  const structuredData = mergeAudioIntoSchema(
    parseJsonSchema(schema) || defaultArticleSchema,
    audioObject,
  )

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
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:secure_url" content={metaImage} />
      <meta property="og:image:type" content={imageMimeType} />
      <meta property="og:image:alt" content={metaImageAlt} />
      {finalImageWidth && (
        <meta property="og:image:width" content={String(finalImageWidth)} />
      )}
      {finalImageHeight && (
        <meta property="og:image:height" content={String(finalImageHeight)} />
      )}
      {article && datePublished && (
        <meta property="article:published_time" content={datePublished} />
      )}
      {article && dateModified && (
        <meta property="article:modified_time" content={dateModified} />
      )}
      {article && (
        <meta property="article:author" content={`${siteUrl}/about/`} />
      )}
      {article && audioContentUrl && (
        <meta property="og:audio" content={audioContentUrl} />
      )}
      {article && audioContentUrl && (
        <meta property="og:audio:secure_url" content={audioContentUrl} />
      )}
      {article && audioEncodingFormat && (
        <meta property="og:audio:type" content={audioEncodingFormat} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {social?.twitter && <meta name="twitter:site" content={social.twitter} />}
      {social?.twitter && (
        <meta name="twitter:creator" content={social.twitter} />
      )}
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:image:alt" content={metaImageAlt} />

      {/* Bing Verification */}
      <meta name="msvalidate.01" content="DE9AA37DB58BF3C5CD561AE0B187709C" />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta
        name="googlebot"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta
        name="bingbot"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <html lang="en" />
      {/* Structured Data for Articles */}
      {article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(structuredData),
          }}
        />
      )}

      {/* Additional tags provided by the component user */}
      {children}
    </>
  )
}

export default Seo
