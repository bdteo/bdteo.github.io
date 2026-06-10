# Spanish Article Audio Voices

Audition notes for Spanish article-audio work.

## Default Choice

Use **GerardGF - Versatile Latam Spanish Neutral** for the Spanish TTS skill.

- ElevenLabs voice ID: `Qh9qDWKx9XUbnKbERblA`
- Library category: `professional`
- Language/accent: Spanish, neutral Latin American
- Boris verdict, 2026-06-10: **Very good; picked over Zenas Aquila in a head-to-head replay.**
- Selection notes: deep, calm, neutral-accent narrator in the Alistair/Carmelo/Theodore mood family; internationally readable Spanish without region-specific color. Avoid whispery, echo-heavy, or noisy voices.

Preset name: `gerard-es`.

```bash
pnpm article:audio <slug> --lang=es --voice=gerard-es --force
```

## Shortlist

| Voice                                      | Voice ID               | Verdict   | Notes                                                         |
| ------------------------------------------ | ---------------------- | --------- | ------------------------------------------------------------- |
| GerardGF - Versatile Latam Spanish Neutral | `Qh9qDWKx9XUbnKbERblA` | Default   | Very good; won the 1-vs-4 replay; selected for Spanish skill. |
| Zenas Aquila - Calm Documentary Narrator   | `0fizugdarib8ZOtvybTk` | Runner-up | Very good; deep baritone, initial favorite before the replay. |
| Jose Piñeiro - Professional male voice     | `Kk9Hc5sbNCTn7RlN9Gmy` | Very good | Peninsular; mature, warm, excellent diction. Strong fallback. |
| Lucas - Solemn and calm                    | `xcAUMhbpNX2WRGsuhjFy` | Good      | Argentine; deep, warm, reflective. Accent more region-marked. |
| Víctor Corrales                            | `Ypjv4S8CWJLMvXfBMUtN` | Good      | Peninsular, calm; a bit noisy.                                |

## Rejected / Not Preferred

| Voice | Voice ID               | Verdict                |
| ----- | ---------------------- | ---------------------- |
| Elias | `1F3ouHO5yDBGJSaGWeP4` | Low quality and noisy. |

## Sampling Notes

- Use the same Spanish line and `language_code: "es"` when comparing voices.
- Audition line used on 2026-06-10: "Hay una pregunta que vuelve cada noche, despacio, como un perro viejo que conoce el camino a casa. No exige respuestas. Solo pide que alguien la escuche hasta el final, sin apartar la mirada."
- Target mood: calm, grounded, mature male narration; neutral, internationally readable Spanish.
- Avoid whispery delivery, echo-heavy cinematic voices, and noisy or phone-like recordings.
