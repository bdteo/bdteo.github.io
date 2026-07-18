# Simplified Chinese Article Audio Voices

Audition notes for Simplified Chinese article-audio work.

## Default Choice

Use **Jordan Li - Calm, Natural and Grounded** for the Simplified Chinese TTS skill.

- ElevenLabs voice ID: `EttSxNTvxX50EUdRPQQl`
- Library category: `professional`
- Language/accent: Mandarin Chinese, standard
- Boris verdict, 2026-07-18: **Best of nine; selected after two finalist replays.**
- Selection notes: natural, grounded, and easy to listen to; preferred over voices that sounded phone-like, dry, loud, or lower quality.

Preset name: `jordan-li-zh`.

```bash
pnpm article:audio <slug> --lang=zh-Hans --voice=jordan-li-zh --force
```

## Shortlist

| Voice                                   | Voice ID               | Verdict   | Notes                                                  |
| --------------------------------------- | ---------------------- | --------- | ------------------------------------------------------ |
| Jordan Li - Calm, Natural and Grounded  | `EttSxNTvxX50EUdRPQQl` | Default   | Best of nine; selected after two finalist replays.     |
| Siqi Liu - Calm, Warm and Gentle        | `W8lBaQb9YIoddhxfQNLP` | Runner-up | Good; warm and gentle.                                 |
| James Gao - Calm, Friendly and Warm     | `4VZIsMPtgggwNg7OXbPY` | Runner-up | Good, with very good sound quality.                    |
| Guan Tang Bao - Deep, Tender and Mature | `MQkiCZS3mnl44caDtxkJ` | Candidate | Natural and good; kept through the first finalist cut. |
| Jason Chen - Deep, Magnetic and Calm    | `DowyQ68vDpgFYdWVGjc3` | Good      | Good voice, but a little too dry for the default.      |
| Evan Zhao - Warm, Calm and Trustworthy  | `MI36FIkp9wRP7cpWKPTl` | Good      | Good voice, but a little too dry for the default.      |

## Rejected / Not Preferred

| Voice                             | Voice ID               | Verdict                       |
| --------------------------------- | ---------------------- | ----------------------------- |
| Yun - Calm Mature Mandarin        | `t0rw9qQF814RSPRK0vm2` | Sounds like it is on a phone. |
| Adrian - Smooth Magnetic Baritone | `i2gDhHnLj4CvKBpf3gPR` | Not high enough quality.      |
| Anson - Clear Young Baritone      | `xh2OInDk4GEYuYRtHx4M` | Good, but too dry and loud.   |

## Sampling Notes

- Use `language_code: "zh"` with `eleven_v3` when comparing Simplified Chinese voices.
- Audition line used on 2026-07-18: "有些技术看起来像魔法，只是因为我们还没看见背后的选择。真正重要的，不是生成更多内容，而是知道什么值得保留，什么应该放下。"
- Target mood: calm, natural, grounded male narration in standard Mandarin.
- Avoid phone-like recordings, dry or over-loud delivery, and theatrical narration.
