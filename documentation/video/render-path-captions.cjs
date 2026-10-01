// Render subtitle typography using the desktop's bundled Canvas runtime.
const fs = require("node:fs")
const path = require("node:path")
const { createCanvas } = require(
  process.env.BDTEO_CANVAS_MODULE ||
    "/Users/boris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas",
)

const edit = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
const output = process.argv[3]
const canvas = createCanvas(1920, 160)
const context = canvas.getContext("2d")
const files = []
const blank = path.join(output, "blank.png")
fs.writeFileSync(blank, canvas.toBuffer("image/png"))

let cursor = 0
for (const [index, cue] of edit.subtitleCues.entries()) {
  if (cue.start < cursor) throw new Error("Overlapping subtitle cues")
  if (cue.start > cursor)
    files.push({ file: blank, duration: cue.start - cursor })
  context.clearRect(0, 0, 1920, 160)
  context.font = '46px "Avenir Next"'
  context.textAlign = "center"
  context.lineJoin = "round"
  context.lineWidth = 6
  context.strokeStyle = "#191c21"
  context.fillStyle = "#f1f0e9"
  context.shadowColor = "rgba(0,0,0,0.65)"
  context.shadowBlur = 3
  context.shadowOffsetY = 2
  const lines = []
  let line = ""
  for (const word of cue.text.split(" ")) {
    const next = line ? `${line} ${word}` : word
    if (context.measureText(next).width > 1620 && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  if (lines.length > 2) throw new Error("Subtitle exceeds two lines")
  lines.forEach((text, row) => {
    const baseline = 100 - (lines.length - 1 - row) * 58
    context.strokeText(text, 960, baseline)
    context.fillText(text, 960, baseline)
  })
  const file = path.join(output, `caption-${index}.png`)
  fs.writeFileSync(file, canvas.toBuffer("image/png"))
  files.push({ file, duration: cue.end - cue.start })
  cursor = cue.end
}
if (cursor < edit.duration)
  files.push({ file: blank, duration: edit.duration - cursor })
fs.writeFileSync(
  path.join(output, "captions.ffconcat"),
  "ffconcat version 1.0\n" +
    files
      .map(item => `file '${item.file}'\nduration ${item.duration.toFixed(6)}`)
      .join("\n") +
    `\nfile '${blank}'\n`,
)
