# Ambient loop for “I Have a Job”

An empty programmer's desk faces a warm open doorway. A linen curtain slowly sways while the room, camera, screen and door stay still. The image connects the essay's opening scene with a small sense of possibility.

## Assets

- Still: `static/video/articles/i-have-a-job/empty-hands-still.png`
- Unmodified Veo take: `static/video/articles/i-have-a-job/empty-hands-veo-raw.mp4`
- Final loop: `static/video/articles/i-have-a-job/empty-hands-loop.mp4`
- Standalone preview: `static/video/articles/i-have-a-job/preview.html`
- Published preview: `https://bdteo.com/video/articles/i-have-a-job/preview.html`
- Full prompts: `documentation/cover-prompts/i-have-a-job-loop.prompt.txt`

## Generation and finishing

The still was generated with the built-in `image_gen` tool on 2026-10-01. The video was generated with Google Vertex AI, model `veo-3.1-fast-generate-001`, using this still as both the first and last frame. One successful take was generated: eight seconds, 1280 × 720, 24 fps, no audio. Prompt enhancement was enabled because the service requires it for this model.

The native experimental loop model was not used: its dedicated looping mode does not support an input image. Instead, the completed take was finished locally. Its final 0.75 seconds overlap its initial 0.75 seconds with a cosine-eased crossfade and rounded pixel values. The sequence starts at the end of the original head segment, so the final join continues the original forward motion. The final duration is 7.25 seconds (174 frames), encoded as H.264/yuv420p with MP4 fast-start and no audio track.

Frame inspection confirmed the intended composition and curtain movement. A downsampled grayscale check measured an average absolute pixel difference of 0.346 out of 255 across the loop boundary, compared with a median of 0.238 and maximum of 0.639 between consecutive frames within the clip. This is a useful consistency check, not a guarantee that every viewer will perceive a perfectly invisible join.

Chrome playback completed two loop boundaries without a media error. Reduced-motion preferences kept the preview paused. The temporary browser context was closed after verification.

Keep playback muted, use `loop` and `playsinline`, and respect reduced-motion preferences. The standalone preview includes those settings. Gatsby's development routing intercepts the standalone `.html` path; for local review, serve the asset directory separately, for example:

```sh
python3 -m http.server 18742 --bind 127.0.0.1 --directory static/video/articles/i-have-a-job
```

Open `http://127.0.0.1:18742/preview.html`. The MP4 itself is also available from Gatsby at `/video/articles/i-have-a-job/empty-hands-loop.mp4`. The essay's existing cover and text have not been changed.
