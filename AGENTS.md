# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Build & Development Commands

- Package manager: use `pnpm` exclusively in this repo. Do not use `npm` or `yarn` for installs, scripts, or lockfile changes.
- Development: `pnpm dev`
- Pretty local URL: `http://bdteo.localhost/` via the shared host Caddy (`/opt/homebrew/etc/Caddyfile`) to Gatsby dev on `:8000`; keep `pnpm dev` running first.
- Build: `pnpm build` (safe isolated build; does not touch the active dev server's `.cache`/`public`)
- In-place build: `pnpm build:inplace` (destructive current-tree build for deploy worktrees only)
- Format: `pnpm format`
- Serve: `pnpm serve`
- Clean: `pnpm clean`
- Generate article audio: `make article-audio slug=<article-slug>` (wrapper around `pnpm article:audio <slug>`)
- Deploy to VPS via GitHub Actions: `make gh-deploy` (pushes to `origin` AND manually triggers `workflow_dispatch` deploy). Pushing alone does NOT auto-deploy.
- Direct VPS deploy (run on server): `make deploy` (zero-downtime worktree-based deploy)

## Git Remote

- `origin`: GitHub (`bdteo/bdteo.github.io`) — sole remote. Deploy workflow is `workflow_dispatch` only (not triggered by push).

## Google Analytics

- Active live blog property: `properties/439653136` (`Boris's Blog`), stream tag `G-7MSGWE21G5` in `gatsby-config.js` and on `https://bdteo.com`.
- `properties/487002741` (`Bdteo.com`) uses stream tag `G-6NG94PS9WD`; despite the matching name/default URL, it is not the tag currently shipped by the site.

## Deploy & Publish Ordering

The deploy workflow checks out `origin/main` at trigger time. Order matters when shipping multi-step work:

1. **Generate build artifacts first** (audio files, images, etc.) — never trigger a deploy expecting an artifact you haven't committed yet.
2. **Commit + push BEFORE triggering deploy.** Uncommitted local work is invisible to the workflow; the artifact must already be on `origin/main`.
3. **One deploy per coherent state.** If iteration is mid-flight, hold the deploy. Don't fire one for "what's already pushed" when related work is still uncommitted — you'll end up with two deploys, both consuming the build queue, racing for whatever lands on `origin/main` last.
4. **If you trigger two deploys close together**, cancel the older one with `gh run cancel <id> -R bdteo/bdteo.github.io` _quickly_ — `gh run cancel` is rejected once status is `completed`, and the workflow build step is fast. The race is harmless only when each intermediate `origin/main` snapshot is internally consistent (frontmatter and the file it points to ship together).

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
- `documentation/bulgarian-article-audio-voices.md` — Bulgarian voice shortlist and the selected Carmelo default
- `documentation/french-article-audio-voices.md` — French voice shortlist and the selected Theodore default
- `documentation/spanish-article-audio-voices.md` — Spanish voice shortlist and the selected Gerard default
- `documentation/german-article-audio-voices.md` — German shortlist, runner-ups, and the selected David default
- `documentation/chinese-article-audio-voices.md` — Simplified Chinese shortlist, runner-ups, and the selected Jordan Li default

**Core skills.** Claude has these as slash commands where mirrored; Codex uses the same shared skills from `/Users/boris/.agents/skills/`.

### Prepare TTS scripts (`bdteo-tts-prepare`, `bdteo-tts-prepare-all`)

Generic script preparation for English and localized narration. Given a slug and optional language:

1. Read `content/blog/<slug>/index[.<lang>].md` and `content/tts/<slug>[.<lang>].md` if it exists. Default `lang=en`; profiled localized languages are `bg`, `fr`, `es`, `de`, and `zh-Hans`.
2. Pick the rewrite scope:
   - **No TTS file** → draft from the article: strip markdown (headings, code blocks, links), spell out symbols (`$20` → "twenty dollars"), convert lists to flowing sentences, then layer tags.
   - **Kokoro-era TTS** → preserve the prose; layer v3 tags; strip the `<!-- tts:paragraph-pauses=... -->` comment and Kokoro pacing hacks (compound `…, `, stranded `-` → `—`).
   - **Already v3** → touch only what's broken or weak.
3. Apply tags per `documentation/elevenlabs-prompting.md`. Essays ≈ 1 tag per 2 paragraphs; poems get one opening tag per stanza. Preserve Boris's authorial voice and load the language voice/profile doc when `lang != en`.
4. Stop for Boris's review. Do **not** generate audio. Do **not** commit. Do **not** push.

Use `bdteo-tts-prepare-all` when Boris wants all profiled TTS scripts prepared together for one article. It writes only `content/tts/<slug>.md`, `.bg.md`, `.fr.md`, `.es.md`, `.de.md`, and `.zh-Hans.md` for languages whose article files exist, then stops for review.

### Publish audio (`bdteo-publish-audio`, `bdteo-audio-all`)

Generic publication for English and localized narration. Once the TTS script is approved:

1. `source ~/.ButtercupZsh/.Rc/env.zsh` to load `ELEVENLABS_API_KEY`.
2. Run `pnpm article:audio <slug> --force` for English or add `--lang=bg`, `--lang=fr`, `--lang=es`, `--lang=de`, or `--lang=zh-Hans` for a localized article. The default voice comes from `scripts/voice-presets.js`; override only when Boris chose a different voice.
3. Do not autoplay full generated article audio. Surface the generated file and blog URL so Boris can audition it in the site UI. Use `afplay` only for short isolated pronunciation probes when he explicitly asks.
4. Iterate with Boris if needed (each run produces a new hashed `.m4a`; keep takes around until he picks one).
5. Once Boris approves, commit the coherent audio publication: TTS script, localized article frontmatter, chosen `.m4a`, and generator/docs changes only if this run changed tooling.
6. Trigger deploy: `gh workflow run deploy.yml -R bdteo/bdteo.github.io`. Follow the **Deploy & Publish Ordering** rules above (commit + push BEFORE triggering; one deploy per coherent state; cancel duplicates quickly).

Use `bdteo-audio-all` when Boris wants all profiled English, Bulgarian, French, Spanish, German, and Simplified Chinese article audio generated and wired together. It serializes the per-language `pnpm article:audio` runs because each generator run already has internal ElevenLabs concurrency; it only skips the TTS review pause when Boris explicitly asks for the fast path/direct generation.

### Publish Bulgarian audio (`bdteo-publish-audio-bg`)

Bulgarian localized audio uses `content/tts/<slug>.bg.md`, updates `content/blog/<slug>/index.bg.md`, writes under `static/audio/articles/<slug>/bg/`, and defaults to the `carmelo-bg` voice preset. The direct generator form is:

```bash
pnpm article:audio <slug> --lang=bg --voice=carmelo-bg --force
```

Bulgarian TTS scripts may use phonetic transliteration for spoken software terms while the article prose keeps normal domain terms. Example: article `production` can become `пръдъкшън` in `content/tts/<slug>.bg.md`. Treat these as TTS pronunciation hints only; do not write them back into translated article Markdown. Keep the detailed pronunciation map in the BG audio skill/docs.

### Publish French audio (`bdteo-tts-prepare-fr`, `bdteo-publish-audio-fr`)

French localized audio uses `content/tts/<slug>.fr.md`, updates `content/blog/<slug>/index.fr.md`, writes under `static/audio/articles/<slug>/fr/`, and defaults to the `theodore-fr` voice preset. Prepare the script first and stop for Boris's review before generation. The direct generator form is:

```bash
pnpm article:audio <slug> --lang=fr --voice=theodore-fr --force
```

Theodore was selected on 2026-06-07 as the French default: serene, grounded male narration. Avoid whispering tags and echo-heavy cinematic voice alternatives; Boris rejected whispery French samples as irritating.

### Publish German audio (`bdteo-tts-prepare-de`, `bdteo-publish-audio-de`)

German localized audio uses `content/tts/<slug>.de.md`, updates `content/blog/<slug>/index.de.md`, writes under `static/audio/articles/<slug>/de/`, and defaults to the `david-de` voice preset. Prepare the script first and stop for Boris's review before generation. The direct generator form is:

```bash
pnpm article:audio <slug> --lang=de --voice=david-de --force
```

David was selected on 2026-07-19 as the German default: wise, slow, charming, warm, and grounded male narration. Hannes and Christian are the recorded runner-ups in `documentation/german-article-audio-voices.md`. Boris prefers a male German default; keep the delivery natural and direct rather than dry, over-loud, or theatrical.

### Publish Simplified Chinese audio (`bdteo-tts-prepare-zh-hans`, `bdteo-publish-audio-zh-hans`)

Simplified Chinese localized audio uses `content/tts/<slug>.zh-Hans.md`, updates `content/blog/<slug>/index.zh-Hans.md`, writes under `static/audio/articles/<slug>/zh-Hans/`, and defaults to the `jordan-li-zh` voice preset. The direct generator form is:

```bash
pnpm article:audio <slug> --lang=zh-Hans --voice=jordan-li-zh --force
```

Jordan Li was selected on 2026-07-18 as the Simplified Chinese default: calm, natural, and grounded standard Mandarin. Siqi Liu and James Gao are the recorded runner-ups in `documentation/chinese-article-audio-voices.md`. Keep narration mainland-facing, quiet, and direct; avoid phone-like recordings and dry, over-loud delivery.

### Cost & Pacing — Don't Guess

Do NOT quote ElevenLabs tier allowances or char-to-credit ratios from memory. Empirical observations (May 2026):

- Boris's tier allowance is currently **160,408 credits/month** (not the 121k Creator headline) — tier may change.
- `eleven_v3` bills at roughly **0.60 credits per character**, not the 1-to-1 ratio implied by older v2 pricing docs.

If you need to estimate cost before a big batch, **ask Boris for the dashboard snapshot** (or skip the projection entirely and just run). Volunteering wrong projections either over-warns (causing unnecessary pauses) or under-warns (causing real budget surprises). Both are worse than no projection.

### Generator notes

- `scripts/generate-article-audio.js` chunks ElevenLabs requests at 2,500 chars with concurrency 3 (conservative default; the empirical API cap is 5 concurrent requests as of May 2026), auto-sends `voice_settings`, packages `.m4a` via `ffmpeg`, and updates frontmatter (`audioUrl`, `audioDuration`, `audioVoice`, `audioGeneratedAt`, `audioTextSource`).
- **Skill structure.** `bdteo-tts-prepare` and `bdteo-publish-audio` are the source-of-truth generic one-language workflows. `bdteo-tts-prepare-all` and `bdteo-audio-all` orchestrate EN/BG/FR/ES/DE/ZH batches. The `bdteo-tts-prepare-<lang>` and `bdteo-publish-audio-<lang>` skills are thin language shortcuts. `bdteo-voice-audition` handles future voice selection and updates voice docs/presets only after Boris chooses a winner.
- **Parallel-agent cap.** When spawning background agents that each run their own audio generation, total in-flight ElevenLabs requests across all agents must not exceed the API cap (5). With per-agent `--concurrency=1`, that means **at most 5 parallel agents**. Spawning more causes the slowest chunks to exhaust the generator's 4 retries and fail with `concurrent_limit_exceeded`, leaving the TTS file modernized but no audio produced — requiring a serial retry afterward.
- For Kokoro, do not mirror visual poem/prose line breaks in `content/tts/*.md` — group sentences into stanzas and use blank lines only for real movement breaks; newlines/short chunks cause cadence resets.
- If object storage is configured, use `BLOG_AUDIO_RCLONE_TARGET` and `BLOG_AUDIO_PUBLIC_BASE_URL`; otherwise `audioUrl` stays local under `/audio/articles/...`.
- Sample voices before committing: `pnpm voice:sample alistair,george,ak --text="..."`, `pnpm voice:sample theodore-fr --lang=fr --text="Bonjour."`, `pnpm voice:sample david-de --lang=de --text="Manche Technologien sehen aus wie Magie."`, `pnpm voice:sample jordan-li-zh --lang=zh-Hans --text="有些技术看起来像魔法。"`, or `pnpm voice:sample --list`.

## Multilingual Blog Workflow

- English URLs stay canonical and unchanged. Translations live beside each source article as `index.bg.md`, `index.fr.md`, `index.de.md`, or `index.zh-Hans.md`, with routes under `/bg/`, `/fr/`, `/de/`, and `/zh/`.
- `documentation/blog-translations.md` is the source of truth for translation frontmatter, source hashes, tone rules, SEO checks, and localized audio frontmatter.
- Validate translation work with `pnpm i18n:check`. Use `pnpm i18n:check -- --hash <slug>` when updating a translation's `translationSourceHash`.
- Personal translation skills live in `/Users/boris/.agents/skills/`: `bdteo-translate-all`, `bdteo-translate-bg`, `bdteo-translate-fr`, `bdteo-translate-es`, `bdteo-translate-de`, and `bdteo-translate-zh-hans`. They stop for review and must not commit, push, deploy, or generate audio. They should preserve existing complete localized audio fields, but must not create new audio frontmatter.
- `bdteo-skill-help` is the read-only router for choosing the right bdteo skill from the current article/session context.
- SEO is part of done: verify canonical URLs, `hreflang` alternates, `x-default`, `<html lang>`, Open Graph locale, sitemap links, and `inLanguage` structured data before shipping multilingual changes.

## Giscus Comments

- Component: `src/components/GiscusComments.js` (used in `src/templates/blog-post.js`)
- Custom theme CSS: `static/css/giscus/dark-theme.css` and `static/css/giscus/light-theme.css`
- In development, Giscus uses built-in themes (`dark`/`light`) because the iframe can't load localhost CSS (Chrome CORS)
- In production, Giscus loads the custom CSS files via absolute URL from the site
- Theme switching uses MutationObserver watching body/html class changes
- Repo: `bdteo/bdteo.com` on GitHub Discussions
