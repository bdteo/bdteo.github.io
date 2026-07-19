---
lang: "de"
translationOf: "stable-difussion-cheat-sheet"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "0893ec72dec7f4ad"
title: "Stable-Diffusion-Spickzettel: Fehlersuche & Optimierung"
date: "2023-05-04T23:30:00.000Z"
description: "Praktischer Stable-Diffusion-Spickzettel für SDXL, SD 3.5 und Flux. Behandelt Sampler, CFG, Auflösung, Negative Prompts, Modellauswahl und UI-Wahl. Aktualisiert im März 2026."
featuredImage: "./images/featured.jpg"
imageCaption: "Ein abgegriffener elfenbeinfarbener Stapel Karteikarten auf Leinen, zusammengehalten von einem bernsteinfarbenen Gummiband."
audioUrl: "/audio/articles/stable-difussion-cheat-sheet/de/LTo9oDjTW1FdEgMfiXWQ-4a6c59b1a587.m4a"
audioDuration: "12:12"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/stable-difussion-cheat-sheet.de.md"
---

> **Aktualisiert im März 2026.** Die ursprüngliche Version dieses Spickzettels wurde im Mai 2023 für SD 1.5 geschrieben. Seitdem hat sich fast alles verändert -- neue Architekturen (SDXL, SD 3.5, Flux), neue UIs (ComfyUI), neue Hardware (RTX 5090) und eine komplette Kehrtwende bei der Philosophie zu Negative Prompts. Das hier ist die aktuelle Version.

Das ist meine Arbeitsreferenz für Stable-Diffusion-Parameter. Kein Tutorial -- nur die Einstellungen, zu denen ich greife, wenn etwas nicht funktioniert oder wenn ich die Qualität weiter treiben will.

## Welches Modell du verwenden solltest

Das ist inzwischen die erste Entscheidung, und sie ist wichtiger als jede Parameter-Feinjustierung.

| Modell | Am besten für | Auflösung | Hinweise |
|--------|---------------|-----------|----------|
| **Flux 2** | Fotorealismus, Prompt-Treue | 1024x1024+ | Bestes Open-Weight-Modell für Fotorealismus im Jahr 2026. In Adobe Photoshop integriert <small><a href="#ref1">[1]</a></small> |
| **SDXL** | Allgemeine Nutzung | 1024x1024 | Riesiges Ökosystem an Fine-Tunes. Juggernaut XL, Realistic Vision, DreamShaper |
| **SD 3.5 Large** | Höchste Qualität (Stabilitys Flaggschiff) | 1024x1024 | MMDiT-Architektur. SD 3.0 wurde im April 2025 eingestellt <small><a href="#ref2">[2]</a></small> |
| **SDXL Lightning** | Geschwindigkeit | 1024x1024 | Generierung in 2-8 Schritten. Bessere Qualität als Turbo bei höherer Auflösung <small><a href="#ref3">[3]</a></small> |
| **SD 1.5** | Legacy-Workflows | 512x512 | Riesige Fine-Tune-Bibliothek, wird aber zunehmend abgelöst. SD 2.0/2.1 offiziell eingestellt |

Wenn du frisch anfängst: **Flux 2 für Fotorealismus, SDXL für alles andere.** SD 3.5 ist gut, aber das Ökosystem ist kleiner.

## Welche UI du verwenden solltest

| UI | Am besten für |
|----|---------------|
| **ComfyUI** | Power-User. Node-basiert, besseres VRAM-Management, 15% schneller, beste Flux-Unterstützung. Seit 2025 der Branchenstandard für ernsthafte Arbeit <small><a href="#ref4">[4]</a></small> |
| **Automatic1111** | Einsteiger. Einfachere Oberfläche, riesige Erweiterungsbibliothek. Funktioniert für SDXL weiterhin ordentlich |
| **Fooocus** | Ein-Klick-Generierung. Minimale Konfiguration. Gut für schnelle Ergebnisse |

Ich nutze ComfyUI. Die Lernkurve ist steiler (rechne mit 10-20 Stunden, bis es sich vertraut anfühlt), aber allein das VRAM-Management ist es wert -- es lässt SDXL auf 8 GB laufen, wo A1111 abstürzt.

## Sampler

Die Sampler-Debatte ist weitgehend entschieden.

**Meine Standardwahl:**
- **DPM++ 2M Karras** -- bestes Verhältnis aus Geschwindigkeit und Qualität. Das ist mein Default für fast alles.
- **DPM++ SDE Karras** -- bei niedrigen Schrittzahlen etwas besser. Gut, wenn du schnell iterierst.
- **Euler a** -- weiterhin zuverlässig. Mehr Varianz in den Ausgaben, gut zum Erkunden.

**Wann du wechseln solltest:**
- Zu wenig Vielfalt in den Ausgaben? Probier DPM++ SDE oder Euler a.
- Artefakte oder Übersättigung? Probier DPM++ 2M Karras oder plain Euler.
- Geschwindigkeit über alles? Euler a oder DPM++ 2M (non-Karras).
- Maximale Qualität? DPM++ 3M SDE Karras oder UniPC.

**Schrittzahlen:** 20-30 Schritte für die meisten Sampler. Lightning-Modelle brauchen nur 2-8.

## CFG (Classifier Free Guidance)

Wie strikt das Modell deinem Prompt folgt statt seiner eigenen Interpretation.

| Bereich | Wirkung |
|---------|---------|
| 1-4 | Sehr kreativ, lockere Interpretation. Oft inkohärent |
| **5-7** | Gute Balance für die meisten Arbeiten |
| **7-10** | Starke Prompt-Treue. Sweet Spot für SDXL-Fotorealismus |
| 10-15 | Risiko für Artefakte und überkochte Farben |
| 15+ | Fast immer zu viel. Artefakte garantiert |

**Hinweis:** SD 3.5 nutzt einen anderen Guidance-Mechanismus. Das CFG-Konzept gilt weiterhin, aber die Skala verhält sich anders -- fang niedriger an (3-5) und justiere dann nach.

## Auflösung

Die Zeiten von 512x512 sind vorbei.

| Modell | Native Auflösung | Praktischer Bereich |
|--------|------------------|---------------------|
| SD 1.5 | 512x512 | 512x512 bis 768x768 |
| **SDXL** | 1024x1024 | 1024x1024 (Standard), 1024x768, 768x1024 |
| **SD 3.5** | 1024x1024 | 1024x1024+ |
| **Flux** | 1024x1024 | 1024x1024+, 4K auf High-End-GPUs möglich |

Über die native Auflösung hinauszugehen riskiert Artefakte und Kompositionsprobleme. Nutze Hi-Res Fix oder Upscaling, statt direkt mit 2048x2048 zu generieren.

## Clip Skip

Weniger relevant als früher.

- **SD 1.5:** Clip skip 1-2 ist sehr wichtig. Anime-Modelle nutzen oft clip skip 2.
- **SDXL:** Nutzt zwei Text-Encoder (CLIP + OpenCLIP). Clip skip wird meistens ignoriert -- die Architektur geht anders damit um.
- **SD 3.5 / Flux:** Nicht auf dieselbe Weise anwendbar. Diese Modelle nutzen transformerbasiertes Text-Encoding.

Wenn du SDXL oder neuer nutzt: Mach dir um clip skip keine Sorgen. Wenn du SD 1.5 nutzt: Lass es für Fotorealismus bei 1, für Anime bei 2.

## Negative Prompts

**Die Philosophie hat sich umgedreht.** 2023 lautete der Rat, lange Negative-Prompt-Listen zu verwenden. 2026 ist der Konsens: **fang mit nichts an und füge nur hinzu, was du wirklich korrigieren musst.**

Warum die Änderung:
- SDXL und Flux verstehen natürliche Sprache deutlich besser als SD 1.5
- Lange Negative Prompts können Kreativität tatsächlich *einschränken* und schlechtere Ergebnisse erzeugen
- "bad anatomy" ist zu vage, um nützlich zu sein. "ugly" funktioniert nicht, weil SD nicht mit als "ugly" gelabelten Bildern trainiert wurde
- Manche Modelle schneiden mit langen Negatives nachweislich schlechter ab <small><a href="#ref5">[5]</a></small>

**Aktueller Ansatz:**
1. Generiere zuerst ohne jeden Negative Prompt.
2. Wenn du ein konkretes Problem siehst (zusätzliche Finger, unscharfer Hintergrund), füge dafür ein gezieltes Negative hinzu.
3. Nutze Emphasis Weighting: `(blurry:1.3)` statt nur `blurry`.
4. Halt es kurz -- maximal 5-10 Begriffe.

## GPU-Kurzreferenz

| GPU | VRAM | Gut für |
|-----|------|---------|
| RTX 3060 12GB | 12GB | SD 1.5, einfaches SDXL |
| RTX 4070 Ti | 12GB | SDXL, etwas Flux |
| **RTX 4090** | 24GB | Alles. Das Arbeitspferd |
| **RTX 5090** | 32GB | Alles, einschließlich 4K und Batch-Generierung |
| 8GB-Karten | 8GB | Minimal brauchbar. ComfyUI hilft beim VRAM-Management |

Ab 24 GB wird es für SDXL und Flux komfortabel, ohne ständig mit VRAM jonglieren zu müssen.

## Schnelle Troubleshooting-Fixes

| Problem | Versuch |
|---------|---------|
| Unscharfe Ausgabe | Schritte erhöhen. Prüfen, ob die Auflösung zur nativen Auflösung des Modells passt |
| Zusätzliche Finger/Gliedmaßen | `extra fingers, extra limbs` zum Negative Prompt hinzufügen. Oder ControlNet verwenden |
| Übersättigte Farben | CFG senken. Zu DPM++ 2M Karras wechseln |
| Komposition ist falsch | ControlNet (depth, canny, pose) nutzen, statt gegen den Prompt zu kämpfen |
| Generierung ist langsam | Lightning-Modell nutzen, Schritte reduzieren, ComfyUI für besseres VRAM verwenden |
| Kein VRAM mehr | Zu ComfyUI wechseln, Batch-Größe reduzieren, fp16 verwenden |

---

### Referenzen

<a id="ref1"></a>1. [Flux 2 and NVIDIA RTX AI Integration](https://blogs.nvidia.com/blog/rtx-ai-garage-flux-2-comfyui/) -- *NVIDIAs Berichterstattung zu Flux 2 mit ComfyUI.*<br>
<a id="ref2"></a>2. [Stability AI Release Notes](https://platform.stability.ai/docs/release-notes) -- *SD-3.0-Einstellung und 3.5-Release.*<br>
<a id="ref3"></a>3. [SDXL-Lightning by ByteDance](https://huggingface.co/ByteDance/SDXL-Lightning) -- *Generierung in 2-8 Schritten bei 1024 px.*<br>
<a id="ref4"></a>4. [ComfyUI vs Automatic1111 2026 Comparison](https://wiki.shakker.ai/en/comfyui-vs-automatic1111) -- *Performance- und Feature-Vergleich.*<br>
<a id="ref5"></a>5. [How to Use Negative Prompts Effectively](https://stable-diffusion-art.com/how-to-use-negative-prompts/) -- *Aktualisierter Leitfaden zur minimalistischen Negative-Prompt-Philosophie.*<br>
<a id="ref6"></a>6. [Understanding Stable Diffusion Samplers](https://civitai.com/articles/7484/understanding-stable-diffusion-samplers-beyond-image-comparisons) -- *Sampler-Vergleich und Auswahlhilfe.*<br>
<a id="ref7"></a>7. [Best Stable Diffusion Models for 2026](https://www.cubix.co/blog/best-model-for-stable-diffusion/) -- *Aktuelle Modelllandschaft.*

---

### Verwandte Beiträge

- [Stable Diffusion Photorealism: Settings & GPU Limits Guide](/pushing-the-stable-diffussion-limits/) -- tiefer Einstieg in fotorealistische Ergebnisse mit aktuellen Modellen.
