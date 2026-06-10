# Blog Translation Workflow

This is the source of truth for bdteo.com article translations. Translation skills and implementation agents should link here instead of duplicating the contract.

## Languages and Files

- English remains canonical at `content/blog/<slug>/index.md`.
- Translations live beside the source:
  - Bulgarian: `content/blog/<slug>/index.bg.md`
  - French: `content/blog/<slug>/index.fr.md`
  - Spanish: `content/blog/<slug>/index.es.md`
  - German: `content/blog/<slug>/index.de.md`
  - Simplified Chinese: `content/blog/<slug>/index.zh-Hans.md`
- Routes are generated from the file name:
  - English: `/<slug>/`
  - Bulgarian: `/bg/<slug>/`
  - French: `/fr/<slug>/`
  - Spanish: `/es/<slug>/`
  - German: `/de/<slug>/`
  - Simplified Chinese: `/zh/<slug>/`

## Translation Frontmatter

Every translated article must include:

```yaml
lang: "bg"
translationOf: "<slug>"
translationUpdatedAt: "YYYY-MM-DD"
translationSourceHash: "<hash from pnpm i18n:check -- --hash <slug>>"
title: "Translated title"
date: "<same value as English source>"
description: "Translated description"
featuredImage: "<same value as English source>"
imageCaption: "Translated image caption"
```

For Simplified Chinese, use `lang: "zh-Hans"` in frontmatter. The public route prefix is `/zh/`, while SEO metadata uses `hreflang="zh-Hans"`.

Do not add `audioUrl`, `audioDuration`, `audioVoice`, `audioGeneratedAt`, or `audioTextSource` to translated pages until translated audio is deliberately produced. Once localized audio is produced, include all five fields together. For Bulgarian, the generator reads `content/tts/<slug>.bg.md`, writes audio under `/audio/articles/<slug>/bg/`, and updates `index.bg.md`.

The article UI may fall back to the English source audio when a translated page has no localized audio yet; keep that fallback in code, not in translated frontmatter.

## Translation Rules

- Preserve Boris's voice: direct, precise, quiet, slightly wry when the original is wry.
- Translate prose, titles, descriptions, captions, alt text, and surrounding explanatory text.
- Preserve Markdown structure, headings, blockquotes, tables, code blocks, shell commands, URLs, and technical identifiers.
- Do not localize code, package names, class names, commands, env vars, URLs, or quoted API strings.
- Keep internal links valid. If a translated target exists, point to the language-prefixed route; otherwise keep the English URL.
- Keep images co-located with the English source and reuse the same relative `featuredImage` path.
- For Simplified Chinese, translate into natural mainland-facing Simplified Chinese. Prefer idiomatic restructuring over English word order when needed, but keep Boris's quiet directness and dry edges intact.
- For Spanish, write neutral, internationally readable Spanish (no region-specific slang, no voseo). Keep Boris's directness and reflective cadence; do not inflate short English sentences into ornate Spanish.

## Review and Validation

Before handing back a translation:

1. Run `pnpm i18n:check`.
2. Confirm the language page route and the English route both build.
3. Confirm the translated page has its own canonical URL and alternates, not a canonical link to English.
4. Confirm translated pages either have no audio frontmatter or have a complete localized audio set (`audioUrl`, `audioDuration`, `audioVoice`, `audioGeneratedAt`, `audioTextSource`). If the English fallback player appears, its label must make the audio language clear.
5. Stop for Boris's review. Do not commit, push, deploy, or generate audio from a translation skill.
