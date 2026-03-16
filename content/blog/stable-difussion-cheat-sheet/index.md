---
title: "Stable Diffusion Cheat Sheet: Troubleshooting & Optimization"
date: "2023-05-04T23:30:00.000Z"
slug: "stable-difussion-cheat-sheet"
description: "Practical Stable Diffusion cheat sheet for SDXL, SD 3.5, and Flux. Covers samplers, CFG, resolution, negative prompts, model selection, and UI choice. Updated March 2026."
featuredImage: "./images/featured.jpg"
tags: ["Stable Diffusion", "AI", "Image Generation", "SDXL", "Flux", "ComfyUI", "Machine Learning"]
imageCaption: "A hyper-realistic AI-generated image showcasing the capabilities of Stable Diffusion"
---

> **Updated March 2026.** The original version of this cheat sheet was written for SD 1.5 in May 2023. Almost everything has changed since then -- new architectures (SDXL, SD 3.5, Flux), new UIs (ComfyUI), new hardware (RTX 5090), and a complete reversal on negative prompt philosophy. This is the current version.

This is my working reference for Stable Diffusion parameters. Not a tutorial -- just the settings I reach for when things aren't working or when I want to push quality.

## Which Model to Use

This is the first decision now, and it matters more than any parameter tweak.

| Model | Best For | Resolution | Notes |
|-------|----------|-----------|-------|
| **Flux 2** | Photorealism, prompt adherence | 1024x1024+ | Best open-weight model for photorealism in 2026. Integrated into Adobe Photoshop <small><a href="#ref1">[1]</a></small> |
| **SDXL** | General use | 1024x1024 | Massive ecosystem of fine-tunes. Juggernaut XL, Realistic Vision, DreamShaper |
| **SD 3.5 Large** | Top quality (Stability's flagship) | 1024x1024 | MMDiT architecture. SD 3.0 was deprecated April 2025 <small><a href="#ref2">[2]</a></small> |
| **SDXL Lightning** | Speed | 1024x1024 | 2-8 step generation. Better quality than Turbo at higher resolution <small><a href="#ref3">[3]</a></small> |
| **SD 1.5** | Legacy workflows | 512x512 | Huge fine-tune library but being phased out. SD 2.0/2.1 officially deprecated |

If you're starting fresh: **Flux 2 for photorealism, SDXL for everything else.** SD 3.5 is good but the ecosystem is smaller.

## Which UI to Use

| UI | Best For |
|----|----------|
| **ComfyUI** | Power users. Node-based, better VRAM management, 15% faster, best Flux support. Industry standard for serious work as of 2025 <small><a href="#ref4">[4]</a></small> |
| **Automatic1111** | Beginners. Simpler interface, huge extension library. Still works fine for SDXL |
| **Fooocus** | One-click generation. Minimal configuration. Good for quick results |

I use ComfyUI. The learning curve is steeper (expect 10-20 hours to get comfortable), but the VRAM management alone is worth it -- it runs SDXL on 8GB where A1111 crashes.

## Samplers

The sampler debate is mostly settled.

**Go-to choices:**
- **DPM++ 2M Karras** -- best speed-to-quality ratio. This is my default for almost everything.
- **DPM++ SDE Karras** -- slightly better at low step counts. Good when you're iterating fast.
- **Euler a** -- still reliable. More variety in outputs, good for exploration.

**When to switch:**
- Lack of diversity in outputs? Try DPM++ SDE or Euler a.
- Artifacts or oversaturation? Try DPM++ 2M Karras or plain Euler.
- Need speed above all? Euler a or DPM++ 2M (non-Karras).
- Want maximum quality? DPM++ 3M SDE Karras or UniPC.

**Step counts:** 20-30 steps for most samplers. Lightning models need only 2-8.

## CFG (Classifier Free Guidance)

How strictly the model follows your prompt vs. its own interpretation.

| Range | Effect |
|-------|--------|
| 1-4 | Very creative, loose interpretation. Often incoherent |
| **5-7** | Good balance for most work |
| **7-10** | Strong prompt adherence. Sweet spot for SDXL photorealism |
| 10-15 | Risk of artifacts and overcooked colors |
| 15+ | Almost always too much. Artifacts guaranteed |

**Note:** SD 3.5 uses a different guidance mechanism. The CFG concept still applies but the scale behaves differently -- start lower (3-5) and adjust.

## Resolution

The days of 512x512 are over.

| Model | Native Resolution | Practical Range |
|-------|------------------|-----------------|
| SD 1.5 | 512x512 | 512x512 to 768x768 |
| **SDXL** | 1024x1024 | 1024x1024 (standard), 1024x768, 768x1024 |
| **SD 3.5** | 1024x1024 | 1024x1024+ |
| **Flux** | 1024x1024 | 1024x1024+, 4K possible on high-end GPUs |

Going above the native resolution risks artifacts and composition issues. Use hi-res fix or upscaling instead of generating at 2048x2048 directly.

## Clip Skip

Less relevant than it used to be.

- **SD 1.5:** Clip skip 1-2 matters a lot. Anime models often use clip skip 2.
- **SDXL:** Uses dual text encoders (CLIP + OpenCLIP). Clip skip is mostly ignored -- the architecture handles it differently.
- **SD 3.5 / Flux:** Not applicable in the same way. These models use transformer-based text encoding.

If you're on SDXL or newer: don't worry about clip skip. If you're on SD 1.5: keep it at 1 for photorealism, 2 for anime.

## Negative Prompts

**The philosophy has flipped.** In 2023, the advice was to use long negative prompt lists. In 2026, the consensus is: **start with nothing and add only what you need to fix.**

Why the change:
- SDXL and Flux understand natural language much better than SD 1.5
- Long negative prompts can actually *restrict creativity* and produce worse results
- "bad anatomy" is too vague to be useful. "ugly" doesn't work because SD wasn't trained on labeled "ugly" images
- Some models perform demonstrably worse with long negatives <small><a href="#ref5">[5]</a></small>

**Current approach:**
1. Generate without any negative prompt first.
2. If you see a specific problem (extra fingers, blurry background), add a targeted negative for that.
3. Use emphasis weighting: `(blurry:1.3)` instead of just `blurry`.
4. Keep it short -- 5-10 terms max.

## GPU Quick Reference

| GPU | VRAM | Good For |
|-----|------|----------|
| RTX 3060 12GB | 12GB | SD 1.5, basic SDXL |
| RTX 4070 Ti | 12GB | SDXL, some Flux |
| **RTX 4090** | 24GB | Everything. The workhorse |
| **RTX 5090** | 32GB | Everything including 4K and batch generation |
| 8GB cards | 8GB | Minimum viable. ComfyUI helps with VRAM management |

The 24GB mark is where things get comfortable for SDXL and Flux without constant VRAM juggling.

## Troubleshooting Quick Fixes

| Problem | Try |
|---------|-----|
| Blurry output | Increase steps. Check resolution matches model's native res |
| Extra fingers/limbs | Add `extra fingers, extra limbs` to negative prompt. Or use ControlNet |
| Oversaturated colors | Lower CFG. Switch to DPM++ 2M Karras |
| Composition is wrong | Use ControlNet (depth, canny, pose) instead of fighting the prompt |
| Generation is slow | Use Lightning model, reduce steps, use ComfyUI for better VRAM |
| Out of VRAM | Switch to ComfyUI, reduce batch size, use fp16 |

---

### References

<a id="ref1"></a>1. [Flux 2 and NVIDIA RTX AI Integration](https://blogs.nvidia.com/blog/rtx-ai-garage-flux-2-comfyui/) -- *NVIDIA's coverage of Flux 2 with ComfyUI.*<br>
<a id="ref2"></a>2. [Stability AI Release Notes](https://platform.stability.ai/docs/release-notes) -- *SD 3.0 deprecation and 3.5 release.*<br>
<a id="ref3"></a>3. [SDXL-Lightning by ByteDance](https://huggingface.co/ByteDance/SDXL-Lightning) -- *2-8 step generation at 1024px.*<br>
<a id="ref4"></a>4. [ComfyUI vs Automatic1111 2026 Comparison](https://wiki.shakker.ai/en/comfyui-vs-automatic1111) -- *Performance and feature comparison.*<br>
<a id="ref5"></a>5. [How to Use Negative Prompts Effectively](https://stable-diffusion-art.com/how-to-use-negative-prompts/) -- *Updated guide on minimal negative prompt philosophy.*<br>
<a id="ref6"></a>6. [Understanding Stable Diffusion Samplers](https://civitai.com/articles/7484/understanding-stable-diffusion-samplers-beyond-image-comparisons) -- *Sampler comparison and selection guide.*<br>
<a id="ref7"></a>7. [Best Stable Diffusion Models for 2026](https://www.cubix.co/blog/best-model-for-stable-diffusion/) -- *Current model landscape.*

---

### Related Posts

- [Stable Diffusion Photorealism: Settings & GPU Limits Guide](/pushing-the-stable-diffussion-limits/) -- deep dive into achieving photorealistic results with current models.
