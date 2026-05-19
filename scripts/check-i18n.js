#!/usr/bin/env node

const crypto = require("node:crypto")
const fs = require("node:fs")
const path = require("node:path")

const matter = require("gray-matter")

const {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  buildLocalizedPath,
  getLanguageCodes,
} = require("../i18n.config")

const rootDir = path.resolve(__dirname, "..")
const blogDir = path.join(rootDir, "content", "blog")
const articleFilePattern = /^index(?:\.([a-z]{2}(?:-[A-Za-z0-9]+)?))?\.md$/
const audioFields = [
  "audioUrl",
  "audioDuration",
  "audioVoice",
  "audioGeneratedAt",
  "audioTextSource",
]
const requiredTranslationFields = [
  "lang",
  "translationOf",
  "translationUpdatedAt",
  "translationSourceHash",
  "title",
  "description",
  "date",
  "featuredImage",
  "imageCaption",
]
const sourceHashFrontmatterFields = [
  "date",
  "description",
  "featuredImage",
  "imageCaption",
  "jsonld",
  "slug",
  "tags",
  "title",
]

const readArticle = filePath => matter(fs.readFileSync(filePath, "utf8"))

const stable = value => {
  if (Array.isArray(value)) {
    return value.map(stable)
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = stable(value[key])
        return result
      }, {})
  }

  return value
}

const sourceHash = article => {
  const frontmatter = sourceHashFrontmatterFields.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(article.data, key)) {
      result[key] = article.data[key]
    }
    return result
  }, {})

  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        frontmatter: stable(frontmatter),
        content: article.content.trim(),
      }),
    )
    .digest("hex")
    .slice(0, 16)
}

const listArticleFiles = () =>
  fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry => {
      const sourceSlug = entry.name
      const articleDir = path.join(blogDir, sourceSlug)

      return fs
        .readdirSync(articleDir)
        .filter(fileName => articleFilePattern.test(fileName))
        .map(fileName => {
          const lang = fileName.match(articleFilePattern)[1] || DEFAULT_LANGUAGE

          return {
            sourceSlug,
            lang,
            fileName,
            filePath: path.join(articleDir, fileName),
            route: buildLocalizedPath(sourceSlug, lang),
          }
        })
    })

const findArticles = () => {
  const files = listArticleFiles()
  return files.map(file => ({
    ...file,
    article: readArticle(file.filePath),
  }))
}

const imageExists = (sourceSlug, imagePath) => {
  if (!imagePath || imagePath.startsWith("/")) {
    return false
  }

  return fs.existsSync(path.resolve(blogDir, sourceSlug, imagePath))
}

const localStaticPath = publicPath => {
  const cleanPath = String(publicPath || "").split(/[?#]/)[0]

  if (!cleanPath.startsWith("/")) {
    return null
  }

  return path.join(rootDir, "static", cleanPath.replace(/^\/+/, ""))
}

const validateTranslatedAudio = ({
  data,
  filePath,
  lang,
  sourceSlug,
  errors,
}) => {
  const presentAudioFields = audioFields.filter(field => data[field])

  if (!presentAudioFields.length) {
    return
  }

  audioFields
    .filter(field => !data[field])
    .forEach(field => {
      errors.push(
        `${filePath}: translated audio frontmatter is incomplete; missing ${field}`,
      )
    })

  const expectedTextSource = `content/tts/${sourceSlug}.${lang}.md`
  if (data.audioTextSource && data.audioTextSource !== expectedTextSource) {
    errors.push(
      `${filePath}: audioTextSource must be "${expectedTextSource}" for localized audio`,
    )
  }

  if (
    data.audioTextSource &&
    !fs.existsSync(path.join(rootDir, data.audioTextSource))
  ) {
    errors.push(`${filePath}: audioTextSource file does not exist`)
  }

  const expectedAudioPath = `/audio/articles/${sourceSlug}/${lang}/`
  if (data.audioUrl && !String(data.audioUrl).includes(expectedAudioPath)) {
    errors.push(
      `${filePath}: audioUrl must point under ${expectedAudioPath} for localized audio`,
    )
  }

  const audioPath = localStaticPath(data.audioUrl)
  if (audioPath && !fs.existsSync(audioPath)) {
    errors.push(`${filePath}: audioUrl file does not exist at ${audioPath}`)
  }
}

const printHash = slug => {
  const sourceFile = path.join(blogDir, slug, "index.md")

  if (!fs.existsSync(sourceFile)) {
    console.error(`i18n:check: source article not found: ${slug}`)
    process.exit(1)
  }

  process.stdout.write(`${sourceHash(readArticle(sourceFile))}\n`)
}

const main = () => {
  const hashIndex = process.argv.indexOf("--hash")
  if (hashIndex !== -1) {
    printHash(process.argv[hashIndex + 1])
    return
  }

  const articles = findArticles()
  const errors = []
  const warnings = []
  const bySlug = new Map()
  const routes = new Map()
  const countsByLanguage = getLanguageCodes().reduce((counts, code) => {
    counts[code] = 0
    return counts
  }, {})

  articles.forEach(entry => {
    if (!LANGUAGES[entry.lang]) {
      errors.push(`${entry.filePath}: unsupported language "${entry.lang}"`)
      return
    }

    countsByLanguage[entry.lang] += 1
    bySlug.set(`${entry.sourceSlug}:${entry.lang}`, entry)

    if (routes.has(entry.route)) {
      errors.push(
        `${entry.filePath}: duplicate route ${entry.route} also produced by ${routes.get(entry.route)}`,
      )
    } else {
      routes.set(entry.route, entry.filePath)
    }
  })

  articles.forEach(entry => {
    const { article, lang, sourceSlug, filePath } = entry
    const isTranslation = lang !== DEFAULT_LANGUAGE
    const data = article.data

    if (!isTranslation) {
      if (data.lang && data.lang !== DEFAULT_LANGUAGE) {
        errors.push(`${filePath}: English source has lang="${data.lang}"`)
      }
      return
    }

    const source = bySlug.get(`${sourceSlug}:${DEFAULT_LANGUAGE}`)
    if (!source) {
      errors.push(`${filePath}: missing English source index.md`)
      return
    }

    requiredTranslationFields.forEach(field => {
      if (!data[field]) {
        errors.push(`${filePath}: missing required frontmatter "${field}"`)
      }
    })

    if (data.lang !== lang) {
      errors.push(`${filePath}: frontmatter lang must be "${lang}"`)
    }

    if (data.translationOf !== sourceSlug) {
      errors.push(
        `${filePath}: translationOf must be "${sourceSlug}", got "${data.translationOf}"`,
      )
    }

    if (String(data.date) !== String(source.article.data.date)) {
      errors.push(`${filePath}: date must match the English source date`)
    }

    if (data.featuredImage !== source.article.data.featuredImage) {
      errors.push(`${filePath}: featuredImage must match the English source`)
    }

    if (!imageExists(sourceSlug, data.featuredImage)) {
      errors.push(`${filePath}: featuredImage does not exist`)
    }

    validateTranslatedAudio({ data, filePath, lang, sourceSlug, errors })

    const expectedHash = sourceHash(source.article)
    if (data.translationSourceHash !== expectedHash) {
      errors.push(
        `${filePath}: stale translationSourceHash, expected ${expectedHash}`,
      )
    }
  })

  getLanguageCodes()
    .filter(code => code !== DEFAULT_LANGUAGE)
    .forEach(code => {
      if (countsByLanguage[code] === 0 && LANGUAGES[code].showWhenEmpty) {
        errors.push(
          `i18n.config.js: ${code} has no content and must be hidden when empty`,
        )
      }

      if (countsByLanguage[code] === 0) {
        warnings.push(
          `${code}: no translations yet, public controls stay hidden`,
        )
      }
    })

  if (warnings.length) {
    warnings.forEach(warning => process.stdout.write(`warn: ${warning}\n`))
  }

  if (errors.length) {
    errors.forEach(error => process.stderr.write(`error: ${error}\n`))
    process.exit(1)
  }

  process.stdout.write(
    `i18n:check ok (${articles.length} markdown files, ${routes.size} routes)\n`,
  )
}

main()
