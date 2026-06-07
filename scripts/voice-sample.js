#!/usr/bin/env node

const childProcess = require("node:child_process")
const fs = require("node:fs/promises")
const fsSync = require("node:fs")
const os = require("node:os")
const path = require("node:path")

const { listPresets, resolveVoice } = require("./voice-presets")

const DEFAULT_TEXT =
  "Illuminate me. Wake me slowly. Anger does not touch me. Noble in the blood. Time is stuck. Yet you know me better than myself, even in a quiet room."

const args = process.argv.slice(2)
const positional = args.filter(arg => !arg.startsWith("--"))

const readOption = name => {
  const prefix = `--${name}=`
  const match = args.find(arg => arg.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}

const wantsList = args.includes("--list")
const noPlay = args.includes("--no-play")
const text = readOption("text") || DEFAULT_TEXT
const outDir = readOption("out") || path.join(os.tmpdir(), "voice-samples")
const lang = readOption("lang") || process.env.BLOG_AUDIO_LANG || null
const elevenLabsLanguageCode = lang
  ? {
      "zh-Hans": "zh",
    }[lang] || lang
  : null
const model = readOption("model") || process.env.ELEVENLABS_MODEL || "eleven_v3"

const fail = message => {
  console.error(`voice:sample: ${message}`)
  process.exit(1)
}

const printList = () => {
  console.log("Available voice presets:\n")
  listPresets().forEach(preset => {
    const engineTag = preset.engine === "elevenlabs" ? "11L" : "kkr"
    console.log(
      `  [${engineTag}] ${preset.name.padEnd(18)} — ${preset.description}`,
    )
  })
  console.log("\nUsage:")
  console.log("  pnpm voice:sample alistair,george,ak")
  console.log('  pnpm voice:sample alistair --text="custom line here"')
  console.log('  pnpm voice:sample theodore-fr --lang=fr --text="Bonjour."')
  console.log("  pnpm voice:sample --list")
}

if (wantsList || positional.length === 0) {
  printList()
  process.exit(wantsList ? 0 : positional.length === 0 ? 0 : 1)
}

const names = positional[0]
  .split(",")
  .map(n => n.trim())
  .filter(Boolean)
const resolved = names.map(n => {
  const v = resolveVoice(n)
  if (!v) fail(`unknown voice: ${n} (run with --list to see presets)`)
  return { name: n, ...v }
})

const generateElevenLabs = async voice => {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    fail("ELEVENLABS_API_KEY not set in env")
  }

  const outFile = path.join(outDir, `${voice.name}.mp3`)
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: model,
        ...(elevenLabsLanguageCode
          ? { language_code: elevenLabsLanguageCode }
          : {}),
      }),
    },
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `ElevenLabs ${voice.name}: ${response.status} ${body.slice(0, 300)}`,
    )
  }

  await fs.writeFile(outFile, Buffer.from(await response.arrayBuffer()))
  return outFile
}

const generateKokoro = async voice => {
  const url = (process.env.KOKORO_URL || "http://127.0.0.1:8880").replace(
    /\/$/,
    "",
  )
  const outFile = path.join(outDir, `${voice.name}.mp3`)
  const response = await fetch(`${url}/v1/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "kokoro",
      voice: voice.kokoroVoice,
      response_format: "mp3",
      input: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Kokoro ${voice.name}: ${response.status}`)
  }

  await fs.writeFile(outFile, Buffer.from(await response.arrayBuffer()))
  return outFile
}

const play = file =>
  new Promise(resolve => {
    if (process.platform !== "darwin") {
      console.log(`(skip play — not macOS) saved: ${file}`)
      resolve()
      return
    }
    const child = childProcess.spawn("afplay", [file], { stdio: "inherit" })
    child.on("close", () => resolve())
    child.on("error", () => resolve())
  })

const main = async () => {
  await fs.mkdir(outDir, { recursive: true })

  // ElevenLabs Creator tier caps concurrency at 3.
  const concurrency = 3
  const queue = resolved.map(v => ({ voice: v }))
  const inFlight = []

  const launch = task =>
    Promise.resolve()
      .then(() =>
        task.voice.engine === "elevenlabs"
          ? generateElevenLabs(task.voice)
          : generateKokoro(task.voice),
      )
      .then(file => {
        task.file = file
        console.log(`✓ ${task.voice.name} → ${file}`)
      })
      .catch(err => {
        task.error = err
        console.error(`✗ ${task.voice.name}: ${err.message}`)
      })

  for (const task of queue) {
    while (inFlight.filter(p => !p.done).length >= concurrency) {
      await Promise.race(inFlight.filter(p => !p.done).map(p => p.promise))
    }
    const tracker = { done: false }
    tracker.promise = launch(task).finally(() => {
      tracker.done = true
    })
    inFlight.push(tracker)
  }
  await Promise.all(inFlight.map(p => p.promise))

  if (noPlay) {
    return
  }

  for (const task of queue) {
    if (task.error || !task.file) continue
    console.log(`▶ ${task.voice.name} — ${task.voice.label}`)
    if (process.platform === "darwin" && fsSync.existsSync("/usr/bin/say")) {
      childProcess.spawnSync(
        "say",
        ["-v", "Alex", task.voice.name.replace(/-/g, " ")],
        { stdio: "ignore" },
      )
    }
    await play(task.file)
  }
}

main().catch(error => fail(error.message))
