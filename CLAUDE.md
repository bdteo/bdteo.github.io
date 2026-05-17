# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- Development: `pnpm dev`
- Build: `pnpm build`
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
4. **If you trigger two deploys close together**, cancel the older one with `gh run cancel <id> -R bdteo/bdteo.github.io` *quickly* — `gh run cancel` is rejected once status is `completed`, and the workflow build step is fast. The race is harmless only when each intermediate `origin/main` snapshot is internally consistent (frontmatter and the file it points to ship together).

## Article Audio / TTS Workflows

Default engine is ElevenLabs (voice `alistair`, model `eleven_v3`); Kokoro `santa` is the free local fallback. Voice presets live in `scripts/voice-presets.js`.

**Reference docs (single source of truth — do not duplicate this content):**

- `documentation/article-audio.md` — user-facing workflow (commands, options, env vars, sampler)
- `documentation/elevenlabs-prompting.md` — Eleven v3 audio-tag catalog, voice-settings recipe per content type (essay vs poem), punctuation cues, anti-patterns, and v3 quirks (notably: `previous_text`/`next_text` stitching is rejected on v3)

**Two skills, invocable via slash command:**

- **`/bdteo-tts-prepare <slug>`** — reads `content/blog/<slug>/index.md` and (if present) `content/tts/<slug>.md`; produces a v3-tagged `content/tts/<slug>.md`. Preserves Boris's prose; layers tags using the catalog. Essays ≈ 1 tag per 2 paragraphs; poems get one opening tag per stanza. Stops for review — does NOT generate audio, does NOT commit.
- **`/bdteo-publish-audio <slug>`** — ensures TTS is current (delegates to the prep skill), runs `pnpm article:audio <slug> --force`, plays via `afplay`, iterates on feedback, then commits + pushes + triggers deploy following the Deploy & Publish Ordering rules above.

The generator (`scripts/generate-article-audio.js`) chunks ElevenLabs requests at 2,500 chars with concurrency 3 (Creator-tier cap), auto-sends `voice_settings`, packages `.m4a`, and updates frontmatter (`audioUrl`, `audioDuration`, `audioVoice`, `audioGeneratedAt`, `audioTextSource`).

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
