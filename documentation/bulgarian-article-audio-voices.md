# Bulgarian Article Audio Voices

Audition notes for future Bulgarian article-audio work.

## Default Choice

Use **Carmelo - Mature, Mysterious and Clear** for the Bulgarian TTS skill.

- ElevenLabs voice ID: `5egO01tkUjEzu7xSSE8M`
- Library category: `high_quality`
- Source language/accent: Spanish, peninsular
- Bulgarian verified sample: yes
- Boris verdict, 2026-05-19: **Very good**

Preset name: `carmelo-bg`.

```bash
pnpm article:audio <slug> --lang=bg --voice=carmelo-bg --force
```

## Shortlist

| Voice                                    | Voice ID               | Verdict        | Notes                                                    |
| ---------------------------------------- | ---------------------- | -------------- | -------------------------------------------------------- |
| Carmelo - Mature, Mysterious and Clear   | `5egO01tkUjEzu7xSSE8M` | Default        | Very good; selected for Bulgarian skill.                 |
| Burt Reynolds - Deep, Smooth and clear   | `4YYIPFl9wE5c4L2eu2Gb` | Keep           | Good; likely better for heavier or more cinematic reads. |
| Thomas - Loud and Neutral                | `ruSJRhA64v8HAqiqKXVw` | Keep           | Good; possible alternate for more forceful narration.    |
| Peter K - Warm, Round, and Smooth        | `406EiNlYvqFqcz3vsnOm` | Candidate      | Native Bulgarian voice; keep as fallback candidate.      |
| Jerry B. - Authoritative Explainer Voice | `oHB9Xhox1bqMl1Tvkmel` | Soft candidate | Okayish; keep only if the piece needs an explainer tone. |

## Rejected / Not Preferred

| Voice                                 | Voice ID               | Verdict                                    |
| ------------------------------------- | ---------------------- | ------------------------------------------ |
| Yordan                                | `vZifugoCmJjNgn0bBdKH` | Lame.                                      |
| Kosta                                 | `gdk0ZsvfAOobfbTtnx6p` | Bad quality.                               |
| Georgi - Tender, Rich, and Reassuring | `31jwlwrRwpOA5yGuVAby` | Good quality, but lame voice.              |
| Xavian - Deep, Steady and Reassuring  | `dn9HtxgDwCH96MVX9iAO` | Lame.                                      |
| Christian - Warm and Captivating      | `NBqeXKdZHweef6y0B67V` | Lame.                                      |
| Adam - Velvety and Conversational     | `uYFJyGaibp4N2VwYQshk` | Lame.                                      |
| Arcadias                              | `Obuyk6KKzg9olSLPaCbl` | Okayish, but not worthy.                   |
| Emilio - Warm, Solid and Convincing   | `ZCh4e9eZSUf41K4cmCEL` | Lame.                                      |
| Cabalen Jeffrey - Inviting and Warm   | `uaUCJwO6D7PkgkB8ZcAr` | Lame.                                      |
| Raju - Warm and Professional          | `eyVoIoi3vo6sJoHOKgAc` | Okayish, but not worthy.                   |
| Tony - Witty, Upbeat and Engaging     | `lRf3yb6jZby4fn3q3Q7M` | Funny, but not for Boris's blog narration. |
| Oliver - Smooth and Engaging          | `daJ4gHLkIVFskWuoLuDX` | Depressive.                                |
| Gaurav - Warm Documentary Storyteller | `3LeCGabFP6aWC1JfuN45` | Lame.                                      |
| Antonio Farina - Expressive and Warm  | `uScy1bXtKz8vPzfdFsFw` | Good voice, not good quality.              |
| Ramaa - Motivational and Confident    | `ZhJ5LanYnCmLKQUXvsV7` | Funny, but not for Boris's blog narration. |
| Yash M - Warm, Friendly and Engaging  | `cy8APH2iOLWD2g1zeaZn` | Lame.                                      |
| Aaditya - Calm and Conversational     | `DQuoFsZ3oda1diTerwpq` | Okayish.                                   |

## Sampling Notes

- Native Bulgarian male professional pool found via ElevenLabs was small: Yordan, Kosta, Peter K, and Georgi.
- The strongest candidates came from high-quality multilingual voices with Bulgarian verified samples.
- Some ElevenLabs preview URLs return WAV data under an `.mp3` filename; if `afplay` fails with `AudioFileOpen failed ('dta?')`, save or rename the file as `.wav` and retry.
