# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Build & Development Commands

- Development: `pnpm dev`
- Build: `pnpm build`
- Format: `pnpm format`
- Serve: `pnpm serve`
- Clean: `pnpm clean`
- Generate article audio: `make article-audio slug=<article-slug>` (wrapper around `pnpm article:audio <slug>`)
- Deploy to VPS via GitHub Actions: `make gh-deploy` (pushes to `origin` AND manually triggers `workflow_dispatch` deploy). Pushing alone does NOT auto-deploy.
- Direct VPS deploy (run on server): `make deploy` (zero-downtime worktree-based deploy)

## Git Remote

- `origin`: GitHub (`bdteo/bdteo.github.io`) — sole remote. Deploy workflow is `workflow_dispatch` only (not triggered by push).

## Deploy & Publish Ordering

The deploy workflow checks out `origin/main` at trigger time. Order matters when shipping multi-step work:

1. **Generate build artifacts first** (audio files, images, etc.) — never trigger a deploy expecting an artifact you haven't committed yet.
2. **Commit + push BEFORE triggering deploy.** Uncommitted local work is invisible to the workflow; the artifact must already be on `origin/main`.
3. **One deploy per coherent state.** If iteration is mid-flight, hold the deploy. Don't fire one for "what's already pushed" when related work is still uncommitted — you'll end up with two deploys, both consuming the build queue, racing for whatever lands on `origin/main` last.
4. **If you trigger two deploys close together**, cancel the older one with `gh run cancel <id> -R bdteo/bdteo.github.io` *quickly* — `gh run cancel` is rejected once status is `completed`, and the workflow build step is fast. The race is harmless only when each intermediate `origin/main` snapshot is internally consistent (frontmatter and the file it points to ship together).

## Code Style Guidelines

- Formatting: Use Prettier with default config
- React components: Functional components with hooks
- CSS: SCSS modules with BEM naming convention (bt--component--element)
- Image handling: Use Gatsby Image components for optimization
- Imports: Group imports (React, Gatsby, components, styles)
- Error handling: Use conditional rendering for missing data
- File structure: Follow Gatsby conventions for pages, components, and templates
- GraphQL queries: Co-locate with components using page/static queries
- Theme handling: Dark/light modes via ThemeContext (src/context/ThemeContext.js), body class toggles (`dark-mode`/`light-mode`)
- Theme variables: Defined in `src/styles/_dark-mode.scss` and `src/styles/_light-mode.scss` as CSS custom properties
- Design language: Apple-inspired — pure black (#000) dark mode, pure white (#FFF) light mode, purple accent palette

## Article Audio / TTS Workflows

Default engine is **ElevenLabs** (voice `alistair`, model `eleven_v3`); Kokoro `santa` is the free local fallback. Voice presets live in `scripts/voice-presets.js`. Article audio is opt-in per post — the player renders only when frontmatter has the audio fields wired by the generator.

**Reference docs (single source of truth — do not duplicate this content):**

- `documentation/article-audio.md` — user-facing workflow (commands, options, env vars, sampler)
- `documentation/elevenlabs-prompting.md` — Eleven v3 audio-tag catalog, voice-settings recipe per content type (essay vs poem), punctuation cues, anti-patterns, and v3 quirks (notably: `previous_text`/`next_text` stitching is rejected on v3)

**Two workflows.** Claude has these as slash commands (`/bdteo-tts-prepare`, `/bdteo-publish-audio`); Codex follows the same procedure linearly.

### Prepare the TTS script (`bdteo-tts-prepare`)

For brand-new articles AND for modernizing Kokoro-era scripts. Given a slug:

1. Read `content/blog/<slug>/index.md` (canonical source) and `content/tts/<slug>.md` if it exists.
2. Pick the rewrite scope:
   - **No TTS file** → draft from the article: strip markdown (headings, code blocks, links), spell out symbols (`$20` → "twenty dollars"), convert lists to flowing sentences, then layer tags.
   - **Kokoro-era TTS** → preserve the prose; layer v3 tags; strip the `<!-- tts:paragraph-pauses=... -->` comment and Kokoro pacing hacks (compound `…, `, stranded `-` → `—`).
   - **Already v3** → touch only what's broken or weak.
3. Apply tags per `documentation/elevenlabs-prompting.md`. Essays ≈ 1 tag per 2 paragraphs; poems get one opening tag per stanza. Preserve Boris's authorial voice.
4. Stop for Boris's review. Do **not** generate audio. Do **not** commit. Do **not** push.

### Publish audio (`bdteo-publish-audio`)

Once the TTS script is approved:

1. `source ~/.ButtercupZsh/.Rc/env.zsh` to load `ELEVENLABS_API_KEY`.
2. `pnpm article:audio <slug> --force` (or `make article-audio slug=<slug> args="--force"`). Override for poems: `ELEVENLABS_STABILITY=0.35 ELEVENLABS_STYLE=0.45 pnpm article:audio <slug> --force`.
3. `afplay static/audio/articles/<slug>/<new>.m4a`.
4. Iterate with Boris if needed (each run produces a new hashed `.m4a`; keep takes around until he picks one).
5. Once Boris approves, **two commits**: (a) generator changes if any, (b) the audio publication — `git rm` any tracked old `am_santa-*.m4a`, `rm` superseded local takes, `git add` the new audio + updated frontmatter + TTS script, commit, push.
6. Trigger deploy: `gh workflow run deploy.yml -R bdteo/bdteo.github.io`. Follow the **Deploy & Publish Ordering** rules above (commit + push BEFORE triggering; one deploy per coherent state; cancel duplicates quickly).

### Cost & Pacing — Don't Guess

Do NOT quote ElevenLabs tier allowances or char-to-credit ratios from memory. Empirical observations (May 2026):

- Boris's tier allowance is currently **160,408 credits/month** (not the 121k Creator headline) — tier may change.
- `eleven_v3` bills at roughly **0.60 credits per character**, not the 1-to-1 ratio implied by older v2 pricing docs.

If you need to estimate cost before a big batch, **ask Boris for the dashboard snapshot** (or skip the projection entirely and just run). Volunteering wrong projections either over-warns (causing unnecessary pauses) or under-warns (causing real budget surprises). Both are worse than no projection.

### Generator notes

- `scripts/generate-article-audio.js` chunks ElevenLabs requests at 2,500 chars with concurrency 3 (conservative default; the empirical API cap is 5 concurrent requests as of May 2026), auto-sends `voice_settings`, packages `.m4a` via `ffmpeg`, and updates frontmatter (`audioUrl`, `audioDuration`, `audioVoice`, `audioGeneratedAt`, `audioTextSource`).
- **Parallel-agent cap.** When spawning background agents that each run their own audio generation, total in-flight ElevenLabs requests across all agents must not exceed the API cap (5). With per-agent `--concurrency=1`, that means **at most 5 parallel agents**. Spawning more causes the slowest chunks to exhaust the generator's 4 retries and fail with `concurrent_limit_exceeded`, leaving the TTS file modernized but no audio produced — requiring a serial retry afterward.
- For Kokoro, do not mirror visual poem/prose line breaks in `content/tts/*.md` — group sentences into stanzas and use blank lines only for real movement breaks; newlines/short chunks cause cadence resets.
- If object storage is configured, use `BLOG_AUDIO_RCLONE_TARGET` and `BLOG_AUDIO_PUBLIC_BASE_URL`; otherwise `audioUrl` stays local under `/audio/articles/...`.
- Sample voices before committing: `pnpm voice:sample alistair,george,ak --text="..."` or `pnpm voice:sample --list`.

## Giscus Comments

- Component: `src/components/GiscusComments.js` (used in `src/templates/blog-post.js`)
- Custom theme CSS: `static/css/giscus/dark-theme.css` and `static/css/giscus/light-theme.css`
- In development, Giscus uses built-in themes (`dark`/`light`) because the iframe can't load localhost CSS (Chrome CORS)
- In production, Giscus loads the custom CSS files via absolute URL from the site
- Theme switching uses MutationObserver watching body/html class changes
- Repo: `bdteo/bdteo.com` on GitHub Discussions
