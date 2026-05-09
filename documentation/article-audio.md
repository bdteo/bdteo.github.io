# Article Audio Workflow

Article audio is generated locally from a separate spoken script and then exposed
through optional article frontmatter.

## Local Flow

1. Write the normal article in `content/blog/<slug>/index.md`.
2. Write the listenable version in `content/tts/<slug>.md`.
3. Generate the audio:

   ```bash
   make article-audio slug=<slug>
   ```

The Make target wraps `pnpm article:audio <slug>`. It reads
`content/tts/<slug>.md`, calls local Kokoro at `http://127.0.0.1:8880`, uses
`am_santa` by default, writes an `.m4a` under
`static/audio/articles/<slug>/`, and updates the article frontmatter:

```yaml
audioUrl: "/audio/articles/<slug>/am_santa-<hash>.m4a"
audioDuration: "2:48"
audioVoice: "Santa (Kokoro am_santa)"
audioGeneratedAt: "2026-05-09"
audioTextSource: "content/tts/<slug>.md"
```

Useful options:

```bash
make article-audio slug=<slug> args="--force"
make article-audio slug=<slug> args="--voice=am_santa"
make article-audio slug=<slug> args="--speed=0.95"
KOKORO_URL=http://127.0.0.1:8880 make article-audio slug=<slug>
```

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
