# Article Audio Workflow

Article audio is generated from a separate spoken script and then exposed
through optional article frontmatter. Default engine is ElevenLabs (voice
`alistair`); local Kokoro stays available as a free fallback.

## Local Flow

1. Write the normal article in `content/blog/<slug>/index.md`.
2. Write the listenable version in `content/tts/<slug>.md`.
3. Generate the audio:

   ```bash
   make article-audio slug=<slug>
   ```

The Make target wraps `pnpm article:audio <slug>`. It reads
`content/tts/<slug>.md`, calls the configured engine, writes an `.m4a` under
`static/audio/articles/<slug>/`, and updates the article frontmatter:

```yaml
audioUrl: "/audio/articles/<slug>/<voicetag>-<hash>.m4a"
audioDuration: "2:48"
audioVoice: "Alistair (ElevenLabs cultured British)"
audioGeneratedAt: "2026-05-17"
audioTextSource: "content/tts/<slug>.md"
```

For translated article audio, pass `--lang=<code>`. For example Bulgarian audio
reads `content/tts/<slug>.bg.md`, updates
`content/blog/<slug>/index.bg.md`, and writes the file under
`static/audio/articles/<slug>/bg/`:

```bash
make article-audio slug=<slug> args="--lang=bg --force"
```

`--lang=bg` defaults to the selected Bulgarian voice preset, `carmelo-bg`.

## Voice Presets

Voices are resolved through `scripts/voice-presets.js`. `--voice=<name>` accepts
either a preset name (auto-selects engine) or a raw Kokoro voice name / ElevenLabs
voice ID.

Bulgarian audition notes and the chosen Bulgarian default live in
`documentation/bulgarian-article-audio-voices.md`.

| Preset               | Engine     | Use it for                                        |
| -------------------- | ---------- | ------------------------------------------------- |
| `alistair` (default) | ElevenLabs | Older cultured British; poetry, reflective essays |
| `george`             | ElevenLabs | Stock mature British, weighty                     |
| `ak`                 | ElevenLabs | Posh older British, smoking-jacket gravitas       |
| `bartholomew`        | ElevenLabs | Warm wise audiobook narrator                      |
| `gravel-midnight`    | ElevenLabs | Raspy character voice for edged poems             |
| `bill`               | ElevenLabs | American documentary narrator                     |
| `brian`              | ElevenLabs | Deep American, trailer-voice                      |
| `daniel`             | ElevenLabs | Authoritative British anchor                      |
| `carmelo-bg`         | ElevenLabs | Bulgarian default, mature and clear               |
| `santa`              | Kokoro     | Local `am_santa` fallback, free                   |

Sample a preset (or several) without touching any article:

```bash
pnpm voice:sample alistair,george --text="A line to compare."
pnpm voice:sample --list
make voice-sample voices=alistair,george
```

Samples are saved to `$TMPDIR/voice-samples/` and played via `afplay` on macOS.

## Common Options

```bash
make article-audio slug=<slug> args="--force"
make article-audio slug=<slug> args="--voice=george"
make article-audio slug=<slug> args="--lang=bg --voice=carmelo-bg"
make article-audio slug=<slug> args="--voice=santa --speed=0.95"
make article-audio slug=<slug> args="--model=eleven_multilingual_v2"
```

Environment overrides: `BLOG_AUDIO_VOICE`, `ELEVENLABS_MODEL`,
`BLOG_AUDIO_LANG`, `ELEVENLABS_CONCURRENCY` (default 3, conservative for the
account cap), `KOKORO_URL`, `KOKORO_SPEED`.

## ElevenLabs Notes

- Default model: `eleven_v3` (GA Feb 2026). Supports audio tags like
  `[pause]`, `[short pause]`, `[long pause]`, `[breathes]`, `[sighs]`,
  `[whispers]`, `[slowly]`. Plain text without tags works too.
- Requires `ELEVENLABS_API_KEY` in env. Single-request body cap is ~5,000
  chars; the script auto-chunks at 2,500.
- Default concurrency is 3. When multiple agents generate audio in parallel,
  keep total in-flight ElevenLabs requests within the account cap; lower with
  `--concurrency=N` for each agent.
- Pause silence injection (`<!-- tts:paragraph-pauses=... -->`) is a
  Kokoro-only feature; ElevenLabs uses inline audio tags instead.

## Kokoro Notes

- Endpoint: `KOKORO_URL` (default `http://127.0.0.1:8880`).
- `--voice=<kokoro_name>` (e.g. `am_santa`, `af_heart`) routes via the
  Kokoro engine automatically; same as `--voice=santa` for `am_santa`.

## Object Storage Hook

When Hetzner Object Storage credentials are configured in `rclone`, the same
generator can upload after encoding:

```bash
BLOG_AUDIO_RCLONE_TARGET=hetzner:bdteo-com-article-audio \
BLOG_AUDIO_PUBLIC_BASE_URL=https://<public-object-storage-host> \
make article-audio slug=<slug>
```

`BLOG_AUDIO_PUBLIC_BASE_URL` controls the `audioUrl` written into frontmatter.
Without it, the workflow stays fully local and uses `/audio/articles/...`.
