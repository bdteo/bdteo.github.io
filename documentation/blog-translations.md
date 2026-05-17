# Blog Translation Workflow

This is the source of truth for bdteo.com article translations. Translation skills and implementation agents should link here instead of duplicating the contract.

## Languages and Files

- English remains canonical at `content/blog/<slug>/index.md`.
- Translations live beside the source:
  - Bulgarian: `content/blog/<slug>/index.bg.md`
  - French: `content/blog/<slug>/index.fr.md`
  - German: `content/blog/<slug>/index.de.md`
- Routes are generated from the file name:
  - English: `/<slug>/`
  - Bulgarian: `/bg/<slug>/`
  - French: `/fr/<slug>/`
  - German: `/de/<slug>/`

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

Do not add `audioUrl`, `audioDuration`, `audioVoice`, `audioGeneratedAt`, or `audioTextSource` to translated pages until translated audio is deliberately produced. English audio must not appear on translated pages.

## Translation Rules

- Preserve Boris's voice: direct, precise, quiet, slightly wry when the original is wry.
- Translate prose, titles, descriptions, captions, alt text, and surrounding explanatory text.
- Preserve Markdown structure, headings, blockquotes, tables, code blocks, shell commands, URLs, and technical identifiers.
- Do not localize code, package names, class names, commands, env vars, URLs, or quoted API strings.
- Keep internal links valid. If a translated target exists, point to the language-prefixed route; otherwise keep the English URL.
- Keep images co-located with the English source and reuse the same relative `featuredImage` path.

## Review and Validation

Before handing back a translation:

1. Run `pnpm i18n:check`.
2. Confirm the language page route and the English route both build.
3. Confirm the translated page has its own canonical URL and alternates, not a canonical link to English.
4. Confirm no translated page renders the English audio player unless that language has its own audio metadata.
5. Stop for Boris's review. Do not commit, push, deploy, or generate audio from a translation skill.
