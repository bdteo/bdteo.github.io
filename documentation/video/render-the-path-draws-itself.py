"""Render the approved short film from its Veo clips and existing narration."""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "static/video/articles/i-have-a-job/the-path-draws-itself"
EDIT = json.loads((ROOT / "documentation/video/the-path-draws-itself-edit.json").read_text())
OUTPUT = ASSETS / "the-path-draws-itself-en.mp4"


def run(arguments):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "warning", "-y", *arguments], check=True)


with tempfile.TemporaryDirectory(prefix="bdteo-path-render-") as temporary:
    scratch = Path(temporary)
    narration = scratch / "narration.wav"
    captions = scratch / "captions.mov"
    subprocess.run([
        sys.executable, str(ROOT / "documentation/video/prepare-path-narration.py"), str(narration),
    ], check=True)

    subprocess.run([
        os.environ.get("BDTEO_NODE", "/Users/boris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"),
        str(ROOT / "documentation/video/render-path-captions.cjs"),
        str(ROOT / "documentation/video/the-path-draws-itself-edit.json"), str(scratch),
    ], check=True)
    run([
        "-threads", "2", "-f", "concat", "-safe", "0", "-i", str(scratch / "captions.ffconcat"),
        "-r", "24", "-fps_mode", "cfr", "-c:v", "qtrle", "-pix_fmt", "argb",
        "-threads", "2", "-t", str(EDIT["duration"]), str(captions),
    ])

    inputs = []
    video_filters = []
    for index, shot in enumerate(EDIT["shots"]):
        inputs.extend(["-threads", "2", "-i", str(ASSETS / (shot["id"] + ".mp4"))])
        ratio = shot["duration"] / (shot["sourceEnd"] - shot["sourceStart"])
        crop = f",crop={shot['crop']}" if "crop" in shot else ""
        video_filters.append(
            f"[{index}:v]trim=start={shot['sourceStart']}:end={shot['sourceEnd']},"
            f"setpts={ratio:.9f}*(PTS-STARTPTS){crop},fps=24,"
            f"tpad=stop_mode=clone:stop_duration=0.25,trim=duration={shot['duration']},"
            f"scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v{index}]"
        )
    inputs.extend(["-threads", "2", "-i", str(captions), "-i", str(narration)])
    video_filters.append(
        "".join(f"[v{index}]" for index in range(len(EDIT["shots"])))
        + f"concat=n={len(EDIT['shots'])}:v=1:a=0,"
        + "fade=t=in:st=0:d=0.15,fade=t=out:st=62.7:d=1.3[picture]"
    )
    video_filters.append(f"[picture][{len(EDIT['shots'])}:v]overlay=x=0:y=920:format=auto:eof_action=pass[film]")
    run([
        "-filter_complex_threads", "2", *inputs,
        "-filter_complex", ";".join(video_filters), "-map", "[film]",
        "-map", f"{len(EDIT['shots']) + 1}:a", "-c:v", "libx264", "-threads", "3",
        "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
        "-movflags", "+faststart", "-t", str(EDIT["duration"]), str(OUTPUT),
    ])
    print(json.dumps({"path": str(OUTPUT), "bytes": OUTPUT.stat().st_size}))
