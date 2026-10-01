# Ambient score for The path that draws itself

Generated on 2026-10-01 at Boris's request using the [ElevenLabs Music API](https://elevenlabs.io/docs/api-reference/music/compose), model `music_v2_5`, with `force_instrumental: true` and a requested duration of 64,000 milliseconds. The brief asks for restrained analog pads, sparse felt piano, subtle low strings, an uncertain opening, and a modest warmer turn when the figure chooses its own route. No artist names or existing songs were supplied.

## Files

- Music version of the film: `static/video/articles/i-have-a-job/the-path-draws-itself/the-path-draws-itself-en-ambient.mp4`
- Standalone score: `static/video/articles/i-have-a-job/the-path-draws-itself/the-path-draws-itself-ambient.m4a`
- Original API output: `static/video/articles/i-have-a-job/the-path-draws-itself/the-path-draws-itself-ambient-raw.mp3`
- Local review: `http://127.0.0.1:18742/the-path-draws-itself/preview.html`
- Published preview: `https://bdteo.com/video/articles/i-have-a-job/the-path-draws-itself/preview.html`

The music MP4 and standalone M4A are exactly 64 seconds. The raw MP3 is 64.032 seconds including its codec padding. The original approved film remains separate and unchanged.

## Mix

The score's original dynamics are retained, with a modest 2 dB lift for standalone listening, mild low/high filtering, a 0.6-second entrance, and a 2.4-second fade to silence. The film uses that score at a lower level. A gentle compressor, driven by the narration, lowers the music further during speech; it releases over 500 ms. The narrator stays centered, with the ambient score in stereo. A limiter provides headroom without automatic makeup gain.

The narration was prepared from the same approved source recording and excerpt timestamps. No new voice generation occurred. The video stream is copied without re-encoding, preserving the picture and burned captions.

The exact generation request, song ID, response receipt, file hashes, and mix settings are recorded in `the-path-draws-itself-music-request.json`, `the-path-draws-itself-music-generation.json`, and `the-path-draws-itself-music-mix.json`. API authentication is read from the process environment; no key is stored in these artifacts.

To rebuild the mix without making another API request:

```sh
python3 documentation/video/mix-path-music.py
```

These files ship with the article through the blog deploy workflow. No YouTube upload is included.

## Validation

`the-path-draws-itself-music-validation.json` records the completed checks. Video and audio both last 64 seconds; the complete MP4 decodes without errors. The final mix measures -14.99 LUFS integrated and -3.53 dBTP true peak. The copied video stream matches the original, whose file hash also remains unchanged. Chrome played the opening, sought to the end, and completed playback without errors; the mobile viewport fits and autoplay stays disabled. The temporary browser context was closed.
