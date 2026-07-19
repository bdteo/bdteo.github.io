# ElevenLabs v3 Prompting Reference

Authoritative knowledge for producing high-quality narration via ElevenLabs `eleven_v3` (model id used by the article-audio generator). Treat this as the single source of truth — both Claude skills (`bdteo-tts-prepare`, `bdteo-publish-audio`) and Codex (`AGENTS.md`) point here instead of duplicating the catalog.

## Audio Tag Catalog

Square-bracket, case-insensitive, no closing tag. v3 does **not** support SSML `<break/>`.

- **Pauses / timing:** `[pause]`, `[short pause]`, `[long pause]`, `[continues after a beat]`, `[continues softly]`, `[slows down]`, `[drawn out]`, `[rushed]`, `[deliberate]`
- **Breath / body:** `[breathes]`, `[inhales]`, `[exhales]`, `[sighs]`, `[gasps]`, `[clears throat]`
- **Volume / intimacy:** `[whispers]`, `[quietly]`, `[softly]`, `[loudly]`, `[shouts]`
- **Emotion:** `[sad]`, `[sorrowful]`, `[wistfully]`, `[longingly]`, `[gently]`, `[tenderly]`, `[hesitantly]`, `[resigned tone]`, `[reflective]`, `[awe]`, `[flatly]`, `[deadpan]`, `[calm]`, `[tired]`
- **POV / style:** `[dramatic tone]`, `[matter-of-fact]`, `[conversational tone]`, `[inner monologue]`, `[stress on next word]`, `[emphasized]`

Place tags at the **start** of the span they should colour. Tags at end-of-sentence are largely ignored.

## Voice Settings

The generator sends `voice_settings` automatically. Defaults: `stability=0.5`, `similarity_boost=0.75`, `style=0.4`, `use_speaker_boost=true`. Override per-run via `--stability=` / `--style=` flags or `ELEVENLABS_STABILITY` / `ELEVENLABS_STYLE` / `ELEVENLABS_SIMILARITY_BOOST` env vars.

Stability mapping:

- **Creative ≈ 0.0–0.35** — most expressive, audio tags fire strongly, occasional hallucinations. Use for poetry and emotionally-loaded short pieces.
- **Natural ≈ 0.5** (default) — balanced; tags work, voice stays consistent. Use for essays.
- **Robust ≈ 0.7+** — high consistency, tags effectively ignored. Avoid when you want v3's tag system to do work.

Suggested per content type:

| Content                   | stability | style | Rationale                                                 |
| ------------------------- | --------- | ----- | --------------------------------------------------------- |
| Essay (reflective, long)  | 0.5       | 0.4   | Consistency over expressiveness across multi-chunk reads. |
| Poem (slow, vulnerable)   | 0.35      | 0.45  | Tags need to land hard; minor instability OK.             |
| Spoken-aloud announcement | 0.6       | 0.3   | Keep it boring on purpose.                                |

## Punctuation Cues

- `.` — full pause, falling intonation.
- `,` — brief breath, intonation lift.
- `…` (or `...`) — hesitation, trailing-off. Softer than `.`.
- `—` (em dash) — strong break. **Prefer over `-`** for caesura; `-` alone is unreliable.
- `;` — shorter pause than `.`.
- Blank line — stanza/section break: clear pause + intonation reset. Best stanza separator.
- CAPS — emphasis. `!!!` amplifies but can destabilize; prefer `!` plus a tag like `[emphasized]`.
- Markdown asterisks / italics — ignored by v3.

## Tagging Philosophy by Content Type

**Essays.** Light touch. Aim for ~1 emotional tag per major beat (~1 per 2 paragraphs). Let punctuation and natural Alistair prosody do most of the work. Reserve tags for genuine inflection points (a confession, a punchline, a thesis line).

**Poems.** Heavier. One opening emotion / delivery tag per stanza. Use explicit `[pause]` / `[short pause]` only when punctuation can't carry the rest you want. Use `[long pause]` for lone-ellipsis lines and stanza-level silences.

Always preserve Boris's authorial voice. Tags layer onto his prose; do not reword.

## Anti-Patterns

- **Bracket-only lines** (`[pause]` alone on its own paragraph) — the model may speak the bracket name. If you need a long silence, use `[long pause]` inline at the start of a real line of text.
- **More than 2 tags on one sentence** — degrades fidelity.
- **Conflicting tags** (`[calm][angry]`) — undefined behaviour, usually bad.
- **Tag at end of sentence** — has little effect. Tags belong at the start of the span.
- **Spamming `[pause]` on short lines** — causes speed-ups, hallucinated breaths, and timing glitches.
- **Long all-caps blocks** — shouting artifacts.
- **Kokoro-era artifacts** — `<!-- tts:paragraph-pauses=0.65 -->` HTML comment is now ignored; remove when modernizing. Compound punctuation like `…, ` was a Kokoro pacing hack; clean to single `…` or single `,` for v3.

## v3-Specific Quirks

- **No chunk stitching.** `eleven_v3` rejects `previous_text` and `next_text` with HTTP 400 `unsupported_model`. The generator gates stitching off when `model_id` is v3. Multi-chunk essays may have a faint emotional "reset" between chunks; this is currently unavoidable on v3.
- **Single-request char cap is ~5,000.** Generator chunks ElevenLabs requests at 2,500 chars to stay safely under.
- **Default model in the generator is `eleven_v3`.** To opt back to v2 (with stitching), pass `--model=eleven_multilingual_v2`.

## Voice Presets

Source of truth: `scripts/voice-presets.js`. Default voice is `alistair`. Available:

| Preset                      | Engine     | Use for                                                          |
| --------------------------- | ---------- | ---------------------------------------------------------------- |
| `alistair` (default)        | ElevenLabs | Cultured older British. Poetry and reflective essays.            |
| `george`                    | ElevenLabs | Stock mature British, weighty.                                   |
| `ak`                        | ElevenLabs | Posh older British, smoking-jacket gravitas.                     |
| `bartholomew`               | ElevenLabs | Warm wise audiobook narrator.                                    |
| `gravel-midnight`           | ElevenLabs | Raspy character voice for edged poems.                           |
| `bill` / `brian` / `daniel` | ElevenLabs | Stock ElevenLabs narrators.                                      |
| `carmelo-bg`                | ElevenLabs | Bulgarian default chosen by Boris.                               |
| `theodore-fr`               | ElevenLabs | French default chosen by Boris; serene grounded male narration.  |
| `gerard-es`                 | ElevenLabs | Spanish default chosen by Boris; deep neutral LatAm narrator.    |
| `david-de`                  | ElevenLabs | German default chosen by Boris; wise, slow, charming male voice. |
| `jordan-li-zh`              | ElevenLabs | Chinese default chosen by Boris; natural grounded Mandarin.      |
| `santa`                     | Kokoro     | Local `am_santa` fallback, free.                                 |

Sample before committing:

```bash
pnpm voice:sample alistair,george,ak --text="A representative line."
pnpm voice:sample theodore-fr --lang=fr --text="Bonjour."
pnpm voice:sample gerard-es --lang=es --text="Buenos días."
pnpm voice:sample david-de --lang=de --text="Manche Technologien sehen aus wie Magie."
pnpm voice:sample jordan-li-zh --lang=zh-Hans --text="有些技术看起来像魔法。"
pnpm voice:sample --list
```

## Sources

Original research (May 2026, distilled here): ElevenLabs prompting docs (`elevenlabs.io/docs/best-practices/prompting/eleven-v3`), the v3 audio-tags blog, the v3 character-direction post, and community write-ups. The 400 `unsupported_model` for stitching on v3 was discovered empirically — see `scripts/generate-article-audio.js`.
