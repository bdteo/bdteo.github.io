"""Mix the ElevenLabs ambient score under the approved short-film narration."""

import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "static/video/articles/i-have-a-job/the-path-draws-itself"
ORIGINAL = ASSETS / "the-path-draws-itself-en.mp4"
RAW_MUSIC = ASSETS / "the-path-draws-itself-ambient-raw.mp3"
SCORE = ASSETS / "the-path-draws-itself-ambient.m4a"
FILM = ASSETS / "the-path-draws-itself-en-ambient.mp4"


def run(arguments):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "warning", "-y", *arguments], check=True)


with tempfile.TemporaryDirectory(prefix="bdteo-path-score-") as temporary:
    scratch = Path(temporary)
    narration = scratch / "narration.wav"
    music = scratch / "music.wav"
    music_bed = Path("/tmp/bdteo-path-film-20261001/music-bed.wav")
    music_bed.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        sys.executable, str(ROOT / "documentation/video/prepare-path-narration.py"), str(narration),
    ], check=True)

    # Preserve the generated score's dynamics; a modest lift serves solo listening.
    run([
        "-threads", "2", "-i", str(RAW_MUSIC), "-af",
        "highpass=f=35,lowpass=f=9000,volume=1.258925,"
        "afade=t=in:st=0:d=0.6,afade=t=out:st=61.6:d=2.4,"
        "apad=whole_dur=64,atrim=duration=64,asetpts=N/SR/TB",
        "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(music),
    ])
    run([
        "-threads", "2", "-i", str(music), "-c:a", "aac", "-b:a", "192k",
        "-ar", "48000", "-movflags", "+faststart", "-t", "64", str(SCORE),
    ])

    filters = (
        "[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
        "asplit=2[voice][key];"
        "[2:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
        "volume=0.45[score];"
        "[score][key]sidechaincompress=threshold=0.08:ratio=2.5:attack=25:release=500:"
        "knee=4:makeup=1:link=maximum:detection=rms,asplit=2[bed][mixbed];"
        "[voice][mixbed]amix=inputs=2:duration=first:normalize=0:dropout_transition=0,"
        "alimiter=limit=0.891251:attack=5:release=60:level=false:latency=true[mix]"
    )
    run([
        "-filter_complex_threads", "2", "-threads", "2", "-i", str(ORIGINAL),
        "-i", str(narration), "-i", str(music), "-filter_complex", filters,
        "-map", "0:v:0", "-map", "[mix]", "-c:v", "copy", "-c:a", "aac",
        "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", "64", str(FILM),
        "-map", "[bed]", "-c:a", "pcm_s16le", "-ar", "48000", "-t", "64", str(music_bed),
    ])
    settings = {
        "musicSource": str(RAW_MUSIC.relative_to(ROOT)),
        "originalFilm": str(ORIGINAL.relative_to(ROOT)),
        "score": str(SCORE.relative_to(ROOT)),
        "film": str(FILM.relative_to(ROOT)),
        "duration": 64,
        "musicPreparation": {"gainDb": 2, "highpassHz": 35, "lowpassHz": 9000, "fadeInSeconds": 0.6, "fadeOutStart": 61.6, "fadeOutSeconds": 2.4},
        "mix": {"musicGain": 0.45, "duckingThreshold": 0.08, "duckingRatio": 2.5, "attackMs": 25, "releaseMs": 500, "limiterCeilingDb": -1},
        "narration": "Original approved recording, prepared again from the same excerpt timestamps; no new TTS.",
        "video": "Copied without re-encoding.",
        "filmSha256": hashlib.sha256(FILM.read_bytes()).hexdigest(),
        "scoreSha256": hashlib.sha256(SCORE.read_bytes()).hexdigest(),
    }
    (ROOT / "documentation/video/the-path-draws-itself-music-mix.json").write_text(json.dumps(settings, indent=2) + "\n")
    print(json.dumps({"film": str(FILM), "score": str(SCORE), "seconds": 64}))
