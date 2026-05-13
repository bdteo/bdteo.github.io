#!/usr/bin/env node

const childProcess = require("node:child_process")
const crypto = require("node:crypto")
const fs = require("node:fs/promises")
const fsSync = require("node:fs")
const os = require("node:os")
const path = require("node:path")

const rootDir = path.resolve(__dirname, "..")
const defaultKokoroUrl = "http://127.0.0.1:8880"
const maxChunkLength = 900
const synthRetryDelays = [1500, 4000, 9000, 15000]

const args = process.argv.slice(2)
const slug = args.find(arg => !arg.startsWith("--"))
const force = args.includes("--force")

const readOption = (name, fallback) => {
  const prefix = `--${name}=`
  const match = args.find(arg => arg.startsWith(prefix))

  return match ? match.slice(prefix.length) : fallback
}

const kokoroUrl = readOption(
  "kokoro-url",
  process.env.KOKORO_URL || defaultKokoroUrl,
).replace(/\/$/, "")
const voice = readOption("voice", process.env.KOKORO_VOICE || "am_santa")
const speed = Number(readOption("speed", process.env.KOKORO_SPEED || "1"))
const publicBaseUrl = (process.env.BLOG_AUDIO_PUBLIC_BASE_URL || "").replace(
  /\/$/,
  "",
)
const rcloneTarget = (process.env.BLOG_AUDIO_RCLONE_TARGET || "").replace(
  /\/$/,
  "",
)

const fail = message => {
  console.error(`article:audio: ${message}`)
  process.exit(1)
}

if (!slug) {
  fail("usage: pnpm article:audio <slug> [--force] [--voice=am_santa]")
}

if (!Number.isFinite(speed) || speed <= 0) {
  fail("--speed must be a positive number")
}

const articlePath = path.join(rootDir, "content", "blog", slug, "index.md")
const spokenPath = path.join(rootDir, "content", "tts", `${slug}.md`)
const audioDir = path.join(rootDir, "static", "audio", "articles", slug)

const run = (command, commandArgs, options = {}) =>
  new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, commandArgs, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    })
    let stdout = ""
    let stderr = ""

    child.stdout.on("data", chunk => {
      stdout += chunk
    })
    child.stderr.on("data", chunk => {
      stderr += chunk
    })
    child.on("error", reject)
    child.on("close", code => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(
          new Error(
            `${command} ${commandArgs.join(" ")} failed with ${code}\n${stderr}`,
          ),
        )
      }
    })
  })

const stripFrontmatter = content => {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)

  return match ? content.slice(match[0].length) : content
}

const normalizeForSpeech = content =>
  stripFrontmatter(content)
    .replace(/\r\n/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

const readSpeechOptions = content => {
  const pauseMatch = content.match(
    /<!--\s*tts:paragraph-pauses(?:=(\d+(?:\.\d+)?))?\s*-->/i,
  )
  const paragraphPauseSeconds = pauseMatch
    ? Number(pauseMatch[1] || "0.55")
    : 0

  return {
    paragraphPauseSeconds: Number.isFinite(paragraphPauseSeconds)
      ? paragraphPauseSeconds
      : 0.55,
  }
}

const splitLongParagraph = paragraph => {
  const sentences = paragraph.match(/[^.!?]+[.!?]+["')\]]*|.+$/g) || [paragraph]
  const chunks = []
  let current = ""

  sentences.forEach(sentence => {
    const trimmed = sentence.trim()

    if (!trimmed) {
      return
    }

    if (`${current} ${trimmed}`.trim().length <= maxChunkLength) {
      current = `${current} ${trimmed}`.trim()
      return
    }

    if (current) {
      chunks.push(current)
      current = ""
    }

    if (trimmed.length <= maxChunkLength) {
      current = trimmed
      return
    }

    for (let index = 0; index < trimmed.length; index += maxChunkLength) {
      chunks.push(trimmed.slice(index, index + maxChunkLength))
    }
  })

  if (current) {
    chunks.push(current)
  }

  return chunks
}

const splitForSpeech = (text, options = {}) => {
  if (options.preserveParagraphs) {
    return text
      .split(/\n{2,}/)
      .map(paragraph => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .flatMap(paragraph =>
        paragraph.length > maxChunkLength
          ? splitLongParagraph(paragraph)
          : [paragraph],
      )
  }

  const chunks = []
  let current = ""

  text.split(/\n{2,}/).forEach(paragraph => {
    const cleanParagraph = paragraph.replace(/\s+/g, " ").trim()

    if (!cleanParagraph) {
      return
    }

    if (cleanParagraph.length > maxChunkLength) {
      if (current) {
        chunks.push(current)
        current = ""
      }
      chunks.push(...splitLongParagraph(cleanParagraph))
      return
    }

    if (`${current}\n\n${cleanParagraph}`.trim().length <= maxChunkLength) {
      current = `${current}\n\n${cleanParagraph}`.trim()
      return
    }

    if (current) {
      chunks.push(current)
    }
    current = cleanParagraph
  })

  if (current) {
    chunks.push(current)
  }

  return chunks
}

const wait = milliseconds =>
  new Promise(resolve => {
    setTimeout(resolve, milliseconds)
  })

const synthesizeChunk = async (text, outputPath, index, total) => {
  for (let attempt = 0; attempt <= synthRetryDelays.length; attempt += 1) {
    process.stdout.write(
      `Synthesizing chunk ${index}/${total}${attempt ? ` retry ${attempt}` : ""}...\n`,
    )

    try {
      const response = await fetch(`${kokoroUrl}/v1/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "kokoro",
          voice,
          speed,
          response_format: "wav",
          input: text,
        }),
      })

      if (!response.ok) {
        const body = await response.text()

        if (response.status < 500 || attempt === synthRetryDelays.length) {
          throw new Error(`Kokoro returned ${response.status}: ${body}`)
        }

        await wait(synthRetryDelays[attempt])
        continue
      }

      const audio = Buffer.from(await response.arrayBuffer())
      await fs.writeFile(outputPath, audio)
      return
    } catch (error) {
      if (attempt === synthRetryDelays.length) {
        throw error
      }

      await wait(synthRetryDelays[attempt])
    }
  }
}

const yamlQuote = value => JSON.stringify(String(value))

const upsertScalar = (frontmatter, key, value) => {
  const line = `${key}: ${yamlQuote(value)}`
  const pattern = new RegExp(`^${key}:.*$`, "m")

  if (pattern.test(frontmatter)) {
    return frontmatter.replace(pattern, line)
  }

  return `${frontmatter.trimEnd()}\n${line}`
}

const updateArticleFrontmatter = async fields => {
  const content = await fs.readFile(articlePath, "utf8")
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)

  if (!match) {
    fail(`${articlePath} does not have frontmatter`)
  }

  let frontmatter = match[1]

  Object.entries(fields).forEach(([key, value]) => {
    frontmatter = upsertScalar(frontmatter, key, value)
  })

  const next = `---\n${frontmatter}\n---\n${content.slice(match[0].length)}`
  await fs.writeFile(articlePath, next)
}

const formatDuration = seconds => {
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remainder = String(total % 60).padStart(2, "0")

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`
    : `${minutes}:${remainder}`
}

const ensureKokoroIsHealthy = async () => {
  for (let attempt = 0; attempt <= synthRetryDelays.length; attempt += 1) {
    try {
      const response = await fetch(`${kokoroUrl}/health`)

      if (response.ok) {
        return
      }

      if (attempt === synthRetryDelays.length) {
        throw new Error(`Kokoro health returned ${response.status}`)
      }
    } catch (error) {
      if (attempt === synthRetryDelays.length) {
        throw error
      }
    }

    await wait(synthRetryDelays[attempt])
  }
}

const main = async () => {
  if (!fsSync.existsSync(articlePath)) {
    fail(`article not found: ${articlePath}`)
  }

  if (!fsSync.existsSync(spokenPath)) {
    fail(`spoken source not found: ${spokenPath}`)
  }

  const rawSpokenText = await fs.readFile(spokenPath, "utf8")
  const speechOptions = readSpeechOptions(rawSpokenText)
  const spokenText = normalizeForSpeech(rawSpokenText)

  if (!spokenText) {
    fail(`${spokenPath} is empty after frontmatter`)
  }

  const hash = crypto
    .createHash("sha256")
    .update(
      `${voice}\0${speed}\0${speechOptions.paragraphPauseSeconds}\0${spokenText}`,
    )
    .digest("hex")
    .slice(0, 12)
  const fileName = `${voice}-${hash}.m4a`
  const remoteKey = `audio/articles/${slug}/${fileName}`
  const outputPath = path.join(audioDir, fileName)
  const publicUrl = publicBaseUrl
    ? `${publicBaseUrl}/${remoteKey}`
    : `/${remoteKey}`

  await fs.mkdir(audioDir, { recursive: true })

  if (!force && fsSync.existsSync(outputPath)) {
    process.stdout.write(`Audio exists: ${outputPath}\n`)
  } else {
    await ensureKokoroIsHealthy()

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "article-audio-"))
    const chunks = splitForSpeech(spokenText, {
      preserveParagraphs: speechOptions.paragraphPauseSeconds > 0,
    })
    const chunkFiles = chunks.map((_, index) =>
      path.join(tempDir, `chunk-${String(index + 1).padStart(3, "0")}.wav`),
    )

    for (let index = 0; index < chunks.length; index += 1) {
      await synthesizeChunk(
        chunks[index],
        chunkFiles[index],
        index + 1,
        chunks.length,
      )
    }

    let pauseFile = null
    if (speechOptions.paragraphPauseSeconds > 0 && chunkFiles.length > 1) {
      pauseFile = path.join(tempDir, "paragraph-pause.wav")
      await run("ffmpeg", [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=24000:cl=mono",
        "-t",
        String(speechOptions.paragraphPauseSeconds),
        pauseFile,
      ])
    }

    const concatFile = path.join(tempDir, "concat.txt")
    const mergedWav = path.join(tempDir, "merged.wav")
    const concatFiles = pauseFile
      ? chunkFiles.flatMap((file, index) =>
          index === chunkFiles.length - 1 ? [file] : [file, pauseFile],
        )
      : chunkFiles
    const concatList = concatFiles
      .map(file => `file '${file.replace(/'/g, "'\\''")}'`)
      .join("\n")

    await fs.writeFile(concatFile, concatList)
    await run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatFile,
      "-ac",
      "1",
      "-ar",
      "24000",
      mergedWav,
    ])
    await run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      mergedWav,
      "-c:a",
      "aac",
      "-b:a",
      "96k",
      "-movflags",
      "+faststart",
      outputPath,
    ])
    await fs.rm(tempDir, { force: true, recursive: true })
  }

  if (rcloneTarget) {
    await run(
      "rclone",
      ["copyto", outputPath, `${rcloneTarget}/${remoteKey}`],
      {
        stdio: ["ignore", "inherit", "inherit"],
      },
    )
  }

  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    outputPath,
  ])
  const duration = formatDuration(Number(stdout.trim()))

  await updateArticleFrontmatter({
    audioUrl: publicUrl,
    audioDuration: duration,
    audioVoice: `Santa (Kokoro ${voice})`,
    audioGeneratedAt: new Date().toISOString().slice(0, 10),
    audioTextSource: `content/tts/${slug}.md`,
  })

  process.stdout.write(`Audio ready: ${outputPath}\n`)
  process.stdout.write(`Article frontmatter updated: ${articlePath}\n`)
  process.stdout.write(`URL: ${publicUrl}\n`)
}

main().catch(error => fail(error.message))
