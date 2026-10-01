# The path that draws itself

First complete short-film version, created on 2026-10-01 for `i-have-a-job`.

An ivory stick figure draws an amber route through a charcoal forest. The line begins drawing itself; the figure follows, then notices its empty hands. It retrieves its pencil, draws a different route, and walks onto it. The forest remains uncertain at the end.

## Deliverable

- `static/video/articles/i-have-a-job/the-path-draws-itself/the-path-draws-itself-en.mp4`
- 64 seconds, 16:9, H.264/AAC, 1920×1080, 24 fps. Veo source footage is 1280×720, upscaled during the edit.
- English narration selected from the existing approved Alistair recording; no new TTS generation. This is a self-contained short film with excerpts, not a reading of the entire article.
- English captions are burned in. Separate SRT and VTT files are beside the MP4.
- Local preview: `http://127.0.0.1:18742/the-path-draws-itself/preview.html`. The preview server serves `static/video/articles/i-have-a-job` on port 18742. The player loads its MP4 through the running Gatsby/Caddy server at `http://bdteo.localhost` for HTTP byte-range support and reliable seeking; it does not autoplay the narration.
- Published preview: `https://bdteo.com/video/articles/i-have-a-job/the-path-draws-itself/preview.html`. Media and article links resolve on the same site; the local server keeps its Gatsby/Caddy playback path.

## Generation and edit

Four image keyframes were generated with the built-in image-generation tool. Seven scene takes were selected from nine eight-second Veo generations. Google Vertex AI used the previously authorized account `boris@melioraweb.com`, project `gethookd-prd-ltmj`, region `us-central1`, and model `veo-3.1-fast-generate-001` with silent output and `enhancePrompt: true`. No global gcloud settings changed.

The first version of the final two scenes introduced an amber tree after interpreting “branch” literally. Corrected takes explicitly request a line on the ground; scene six also uses the clean final keyframe as its last frame. Discarded takes remain as separate raw clips. A trim and crop in scene two exclude an unwanted tiny background figure. The selected footage still includes some generated variations in facial marks, pencil scale, and camera movement.

`the-path-draws-itself-prompts.json` records the image and video prompts. `the-path-draws-itself-edit.json` records the shot order, timings, source narration timestamps, and subtitle cues. `the-path-draws-itself-generations.json` records completed cloud operations and output hashes.

The narration alignment came from ElevenLabs forced alignment of the existing audio against its TTS script. Selected sentences retain their original spoken delivery; short fades soften each audio edit. The original export has no added music. A separate version with an ambient score is described in `the-path-draws-itself-music.md` and is now selected in the local preview.

To rebuild locally:

```sh
python3 documentation/video/render-the-path-draws-itself.py
```

The renderer uses FFmpeg and the Codex desktop's bundled Node/Canvas runtime to render subtitle typography, since this machine's FFmpeg build does not include the `ass`, `subtitles`, or `drawtext` filters. `BDTEO_NODE` and `BDTEO_CANVAS_MODULE` can override those runtime paths.

The film assets ship with the article through the blog deploy workflow. No YouTube upload is included. The article narration and previous desk loop remain available separately.

## Validation

`the-path-draws-itself-validation.json` records the final MP4 hash and checks. Both video and audio last exactly 64 seconds; the complete file decodes without FFmpeg errors. All eight narration excerpts contain audio. Chrome played the opening and sought to the final scene, reached the end without a media error, and reported zero dropped frames during that check. The preview fits a 410-pixel viewport, does not autoplay, and temporary browser processes were closed. Final scenes, subtitle typography, and the desktop preview were inspected visually.
