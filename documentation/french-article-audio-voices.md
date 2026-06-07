# French Article Audio Voices

Audition notes for future French article-audio work.

## Default Choice

Use **Theodore HQ - Serene and Grounded** for the French TTS skill.

- ElevenLabs voice ID: `hqfrgApggtO1785R4Fsn`
- Library category: `professional`
- Language/accent: French, standard
- Boris verdict, 2026-06-07: **Good**
- Selection notes: closest male match to Marishnou's serene mood; avoid whispery voices, echo-heavy cinematic voices, noisy voices, and phone-like voices.

Preset name: `theodore-fr`.

```bash
pnpm article:audio <slug> --lang=fr --voice=theodore-fr --force
```

## Shortlist

| Voice                              | Voice ID               | Verdict   | Notes                                                |
| ---------------------------------- | ---------------------- | --------- | ---------------------------------------------------- |
| Theodore HQ - Serene and Grounded  | `hqfrgApggtO1785R4Fsn` | Default   | Good; selected for French skill.                     |
| Jerome - French Narrator & Podcast | `TES2Z4FdTbwd5F5uHmLW` | Okay      | Usable fallback, but less close to the desired mood. |
| Vincent - Calm & clear narrative   | `eDaM8z1udmnynsRHDkUP` | Okay      | Usable fallback.                                     |
| Yann - Calm French narration voice | `243EYe3yd01qZNlIuged` | Okay      | Usable fallback.                                     |
| Teddy B - Storyteller              | `Y9pL3Tawpspxe35NUtif` | Too sharp | Good voice, but edge too sharp for Boris's default.  |
| Marishnou - Serene Romantic Night  | `3EkZsEff6fKDaatADyt6` | Best mood | Best tone, but female; not selected for Boris.       |

## Rejected / Not Preferred

| Voice                             | Voice ID               | Verdict                      |
| --------------------------------- | ---------------------- | ---------------------------- |
| Kevan - Cinematic Documentary     | `AYfOkr1hDQYbhigmRZ16` | Meh.                         |
| Florian French Male Narrator      | `FL0d5832ACnJkBaedeKX` | Strong echo.                 |
| Martin - Deep and Conversational  | `b0Ev8lcOOXx2o9ZcF46H` | Echoing.                     |
| Stella - French Narration Voice   | `ebRwkdEFVZIx2A6YucFh` | No.                          |
| Virginie Faup - Soft & Melodic    | `NzCI2wsmQgzQiufNpYi7` | No.                          |
| Victoria - Warm and calm          | `WeAAwKYcS06VmXw086yZ` | No.                          |
| Aurore                            | `ucMmKRQbfDEYyb2IIGax` | No.                          |
| Valentin - Warm and Relaxing      | `cQVn2FWawJsxa2z9X3l1` | Whispering; very irritating. |
| Steve - Soft and Calm             | `jfEwztGDkpbpy89xeku6` | No.                          |
| Alexandre - Meditation Guide      | `GDAorSE2AWWV70qiMZ9I` | Bad quality.                 |
| Gabriel - Calm and Soothing       | `cg8BLCnP9YxrsTgCaLbb` | Bad quality, noisy.          |
| Alexis - Calm & Narrative         | `PWMsXrscExaV05YVAl7P` | Bad quality; phone-like.     |
| Sam - Narrative, Controlled Young | `sFdj2KJkJptrv9nt0o2Q` | Bad quality.                 |
| Franck - Premium French Narrator  | `qNJqclOgbiButMcyYv6d` | No.                          |

## Sampling Notes

- Use the same French line and `language_code: "fr"` when comparing voices.
- Keep `style` lower for Theodore (`0.25`-`0.35`) to avoid theatrical or whispery delivery.
- Boris strongly dislikes whispering artifacts in French narration.
