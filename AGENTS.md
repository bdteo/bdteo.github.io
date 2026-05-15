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

## Article Audio / TTS Flow

- Article audio is opt-in per post. A post shows the player only when its frontmatter has the audio fields wired by the generator.
- Keep the normal article in `content/blog/<slug>/index.md` and the listenable/TTS-friendly script in `content/tts/<slug>.md`.
- Generate narration locally with Kokoro running at `http://127.0.0.1:8880`:
  `make article-audio slug=<slug>`.
- Pass generator options through `args`, for example:
  `make article-audio slug=<slug> args="--force --voice=am_santa --speed=0.95"`.
- The generator writes `.m4a` files under `static/audio/articles/<slug>/` and updates frontmatter fields: `audioUrl`, `audioDuration`, `audioVoice`, `audioGeneratedAt`, and `audioTextSource`.
- If object storage is configured, use the documented `BLOG_AUDIO_RCLONE_TARGET` and `BLOG_AUDIO_PUBLIC_BASE_URL` environment variables; otherwise keep `audioUrl` local under `/audio/articles/...`.
- Do not send raw article markdown directly to TTS unless Boris explicitly asks; prepare or update the TTS-friendly version first.
- For Kokoro, do not mirror visual poem/prose line breaks in `content/tts/*.md`: group connected sentences into spoken paragraphs/stanzas and use blank lines only for real movement breaks, because newlines/short chunks can cause cadence resets.
- See `documentation/article-audio.md` for the full workflow.

## Giscus Comments

- Component: `src/components/GiscusComments.js` (used in `src/templates/blog-post.js`)
- Custom theme CSS: `static/css/giscus/dark-theme.css` and `static/css/giscus/light-theme.css`
- In development, Giscus uses built-in themes (`dark`/`light`) because the iframe can't load localhost CSS (Chrome CORS)
- In production, Giscus loads the custom CSS files via absolute URL from the site
- Theme switching uses MutationObserver watching body/html class changes
- Repo: `bdteo/bdteo.com` on GitHub Discussions
