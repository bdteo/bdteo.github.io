"""Place original narration excerpts on the short film's audio timeline."""

import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EDIT = json.loads((ROOT / "documentation/video/the-path-draws-itself-edit.json").read_text())
RATE = 48000
SAMPLE_BYTES = 2
audio = bytearray(round(EDIT["duration"] * RATE) * SAMPLE_BYTES)
previous_end = 0

with tempfile.TemporaryDirectory(prefix="bdteo-path-audio-") as temporary:
    for index, quote in enumerate(EDIT["narration"]):
        start = max(0, quote["start"] - 0.06)
        duration = quote["end"] + 0.14 - start
        offset = round((quote["timelineStart"] - 0.06) * RATE) * SAMPLE_BYTES
        clip = Path(temporary) / f"quote-{index}.wav"
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-threads", "2",
            "-ss", f"{start:.3f}", "-i", str(ROOT / EDIT["narrationSource"]),
            "-t", f"{duration:.3f}", "-af",
            f"afade=t=in:st=0:d=0.008,afade=t=out:st={duration - 0.018:.3f}:d=0.018",
            "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le", str(clip),
        ], check=True)
        with wave.open(str(clip), "rb") as reader:
            if (reader.getframerate(), reader.getnchannels(), reader.getsampwidth()) != (RATE, 1, SAMPLE_BYTES):
                raise ValueError("Unexpected PCM format")
            data = reader.readframes(reader.getnframes())
        if offset < previous_end or offset + len(data) > len(audio):
            raise ValueError("Narration excerpts overlap or exceed the timeline")
        audio[offset:offset + len(data)] = data
        previous_end = offset + len(data)

output = Path(sys.argv[1])
with wave.open(str(output), "wb") as writer:
    writer.setnchannels(1)
    writer.setsampwidth(SAMPLE_BYTES)
    writer.setframerate(RATE)
    writer.writeframes(audio)
print(json.dumps({"path": str(output), "duration": len(audio) / SAMPLE_BYTES / RATE}))
