# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- Development: `pnpm dev`
- Build: `pnpm build` (safe isolated build; does not touch the active dev server's `.cache`/`public`)
- In-place build: `pnpm build:inplace` (destructive current-tree build for deploy worktrees only)
- Format: `pnpm format`
- Serve: `pnpm serve`
- Clean: `pnpm clean`
- Deploy to VPS via GitHub Actions: `make gh-deploy` (pushes to `origin` AND manually triggers `workflow_dispatch` deploy). Pushing alone does NOT auto-deploy.
- Direct VPS deploy (run on server): `make deploy` (zero-downtime worktree-based deploy)

## Git Remote

- `origin`: GitHub (`bdteo/bdteo.github.io`) — sole remote. Deploy workflow is `workflow_dispatch` only (not triggered by push).

## Deploy & Publish Ordering

The deploy workflow checks out `origin/main` at trigger time. Order matters when shipping multi-step work:

1. **Generate build artifacts first** (audio files, images, etc.) — never trigger a deploy expecting an artifact you haven't committed yet.
2. **Commit + push BEFORE triggering deploy.** Uncommitted local work is invisible to the workflow; the artifact must already be on `origin/main`.
3. **One deploy per coherent state.** If iteration is mid-flight, hold the deploy. Don't fire one for "what's already pushed" when related work is still uncommitted — you'll end up with two deploys, both consuming the build queue, racing for whatever lands on `origin/main` last.
4. **If you trigger two deploys close together**, cancel the older one with `gh run cancel <id> -R bdteo/bdteo.github.io` _quickly_ — `gh run cancel` is rejected once status is `completed`, and the workflow build step is fast. The race is harmless only when each intermediate `origin/main` snapshot is internally consistent (frontmatter and the file it points to ship together).

## Article Audio / TTS Workflows

Default engine is ElevenLabs (voice `alistair`, model `eleven_v3`); Kokoro `santa` is the free local fallback. Voice presets live in `scripts/voice-presets.js`.

**Reference docs (single source of truth — do not duplicate this content):**

- `documentation/article-audio.md` — user-facing workflow (commands, options, env vars, sampler)
- `documentation/elevenlabs-prompting.md` — Eleven v3 audio-tag catalog, voice-settings recipe per content type (essay vs poem), punctuation cues, anti-patterns, and v3 quirks (notably: `previous_text`/`next_text` stitching is rejected on v3)
- `documentation/bulgarian-article-audio-voices.md` — Bulgarian voice shortlist and the selected Carmelo default

**Audio and routing skills, invocable via slash command where mirrored:**

- **`/bdteo-tts-prepare <slug>`** — reads `content/blog/<slug>/index.md` and (if present) `content/tts/<slug>.md`; produces a v3-tagged `content/tts/<slug>.md`. Preserves Boris's prose; layers tags using the catalog. Essays ≈ 1 tag per 2 paragraphs; poems get one opening tag per stanza. Stops for review — does NOT generate audio, does NOT commit.
- **`/bdteo-publish-audio <slug>`** — ensures English TTS is current, runs `pnpm article:audio <slug> --force`, surfaces the generated file/blog URL for Boris to audition in the site UI, iterates on feedback, then commits + pushes + triggers deploy when asked.
- **`/bdteo-publish-audio-bg <slug>`** — prepares/generates Bulgarian localized audio from `content/tts/<slug>.bg.md`, updates `index.bg.md`, writes under `static/audio/articles/<slug>/bg/`, and defaults to `carmelo-bg`.
- **`/bdteo-skill-help`** — read-only router for choosing the right bdteo skill from the current article/session context.

Do not autoplay full generated article audio. Use `afplay` only for short isolated pronunciation probes when Boris explicitly asks. Bulgarian TTS scripts may use phonetic transliteration for spoken software terms while the article prose keeps normal domain terms, for example `production` -> `пръдъкшън` in `content/tts/<slug>.bg.md` only.

The generator (`scripts/generate-article-audio.js`) chunks ElevenLabs requests at 2,500 chars with concurrency 3 (conservative default; the empirical API cap is 5 concurrent requests as of May 2026), auto-sends `voice_settings`, packages `.m4a`, and updates frontmatter (`audioUrl`, `audioDuration`, `audioVoice`, `audioGeneratedAt`, `audioTextSource`).

### Parallel-Agent Cap

When spawning background agents that each run their own audio generation, **the total in-flight ElevenLabs request count across all agents must not exceed the API concurrency cap (currently 5)**. With per-agent `--concurrency=1`, that means **at most 5 parallel agents**. Spawning more causes the slowest chunks to exhaust the generator's 4 retries and fail with `concurrent_limit_exceeded`, leaving the TTS file modernized but no audio produced — requiring a serial retry afterward. The chosen tactic: spawn ≤5 in parallel, or accept that one or two will need serial regeneration.

### Cost & Pacing — Don't Guess

Do NOT quote ElevenLabs tier allowances or char-to-credit ratios from memory. Empirical observations (May 2026):

- Boris's tier allowance is currently **160,408 credits/month** (not the 121k Creator headline I had cached) — tier may change.
- `eleven_v3` bills at roughly **0.60 credits per character**, not the 1-to-1 ratio implied by older v2 pricing docs.

If you need to estimate cost before a big batch, **ask Boris for the dashboard snapshot** (or skip the projection entirely and just run). Volunteering wrong projections either over-warns (causing unnecessary pauses) or under-warns (causing real budget surprises). Both are worse than no projection.

## Multilingual Blog Workflow

- English URLs stay canonical and unchanged. Translations live beside each source article as `index.bg.md`, `index.fr.md`, `index.de.md`, or `index.zh-Hans.md`, with routes under `/bg/`, `/fr/`, `/de/`, and `/zh/`.
- `documentation/blog-translations.md` is the source of truth for translation frontmatter, source hashes, tone rules, SEO checks, and localized audio frontmatter.
- Validate translation work with `pnpm i18n:check`. Use `pnpm i18n:check -- --hash <slug>` when updating a translation's `translationSourceHash`.
- Personal translation skills live in `/Users/boris/.agents/skills/`: `bdteo-translate-all`, `bdteo-translate-bg`, `bdteo-translate-fr`, `bdteo-translate-de`, and `bdteo-translate-zh-hans`. They stop for review and must not commit, push, deploy, or generate audio. They should preserve existing complete localized audio fields, but must not create new audio frontmatter.
- SEO is part of done: verify canonical URLs, `hreflang` alternates, `x-default`, `<html lang>`, Open Graph locale, sitemap links, and `inLanguage` structured data before shipping multilingual changes.

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

## Giscus Comments

- Component: `src/components/GiscusComments.js` (used in `src/templates/blog-post.js`)
- Custom theme CSS: `static/css/giscus/dark-theme.css` and `static/css/giscus/light-theme.css`
- In development, Giscus uses built-in themes (`dark`/`light`) because the iframe can't load localhost CSS (Chrome CORS)
- In production, Giscus loads the custom CSS files via absolute URL from the site
- Theme switching uses MutationObserver watching body/html class changes
- Repo: `bdteo/bdteo.com` on GitHub Discussions
