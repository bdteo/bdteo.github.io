Stable Diffusion photorealism: settings and GPU limits

[conversational tone] This article was updated in March 2026.

It was originally written in May 2023, when Stable Diffusion 1.5 at 512 by 512 was the standard and the RTX 3090 was peak hardware.

[matter-of-fact] Everything has changed.

Flux 2, SDXL fine-tunes, SD 3.5, ControlNet, and the RTX 5090 have completely redefined what is possible.

This is the current state.

The gap between AI-generated images and real photographs has nearly closed.

[reflective] In 2023, photorealistic meant almost convincing if you squint.

In 2026, the best models produce images that are genuinely difficult to distinguish from professional photography.

Here is how to get there.

The current photorealism landscape

The model you choose matters more than any setting you tweak.

Here is where things stand.

Flux 2: the new king

[awe] Flux 2 by Black Forest Labs, released in November 2025, is arguably the best open-weight model for photorealism in 2026.

It produces images with natural lighting, accurate skin textures, and coherent composition that rivals professional photography.

Adobe integrated Flux, through Kontext Pro, into Photoshop in September 2025. That tells you where the industry's confidence is.

Flux also has exceptional natural-language understanding.

You can describe what you want in plain English, without the keyword soup that Stable Diffusion 1.5 required.

SDXL fine-tunes: the workhorses

[matter-of-fact] For SDXL-based photorealism, the current leaders are Juggernaut XL, Realistic Vision, and EpicRealism.

Juggernaut XL, especially versions 9 and 10, is the go-to for cinematic, photographic output. It is popular among photographers and filmmakers.

Realistic Vision is fine-tuned specifically for lifelike textures, lighting, and facial accuracy.

EpicRealism is excellent for fine detail and natural lighting.

These models have massive community support, extensive LoRA libraries, and predictable behavior.

If Flux feels too new, or your workflow is already built on SDXL, these are excellent.

SD 3.5 Large

Stability AI's flagship uses the new Multimodal Diffusion Transformer architecture.

That is a fundamentally different approach from SDXL.

It is technically impressive, but the ecosystem is smaller.

SD 3.0 was deprecated in April 2025, so make sure you are on 3.5.

GPU reality check

[matter-of-fact] The hardware requirements have escalated significantly.

An RTX 3060 with 12 gigabytes of VRAM is fine for Stable Diffusion 1.5 photorealism, but SDXL is tight.

An RTX 4070 Ti with 12 gigabytes can handle SDXL at 1024 by 1024, and Flux is possible with optimizations.

The RTX 4090, with 24 gigabytes, is the sweet spot.

It handles SDXL, Flux, and SD 3.5 comfortably at 1024 by 1024 and above.

[awe] The RTX 5090, with 32 gigabytes of GDDR7 and a 512-bit bus, handles everything, including 4K generation and batch workflows.

Eight-gigabyte cards are minimum viable with ComfyUI's VRAM management, but they are not comfortable.

[reflective] The 2023 sweet spot of 512 by 512 on an RTX 3080 is ancient history.

1024 by 1024 is now the standard resolution, and you want at least 16 gigabytes of VRAM to work without constant frustration.

Twenty-four gigabytes is where it gets comfortable.

For photorealism specifically, more VRAM means you can run larger models, higher resolutions, and ControlNet at the same time without offloading to CPU.

Settings for photorealism

Sampler

[deliberate] For SDXL photorealism, use DPM++ 2M Karras at 25 to 30 steps.

That is the settled consensus: the best speed-to-quality ratio.

If you want slightly more detail at low step counts, switch to DPM++ SDE Karras.

For Flux, use the default sampler at 20 to 30 steps.

CFG

[deliberate] For SDXL photorealism, use CFG 7 to 9.

That gives strong prompt adherence without the oversaturated, overcooked look that happens above 10.

For SD 3.5, start lower, around 3 to 5, because the guidance mechanism works differently.

For Flux, follow the model-specific recommendations, but generally use a lower value than SDXL.

Resolution

[deliberate] Generate at the model's native resolution, usually 1024 by 1024 for SDXL, SD 3.5, and Flux.

Then upscale for higher resolution.

Do not try to generate directly at 2048 by 2048. You will get artifacts, duplicated elements, and composition issues.

For upscaling, use hi-res fix in Automatic 1111 or dedicated upscaling nodes in ComfyUI, like 4x-UltraSharp or ESRGAN.

Prompting for photorealism

[matter-of-fact] The biggest shift from 2023 is this: write naturally, not in keywords.

Stable Diffusion 1.5 needed prompts like: portrait of a woman, photorealistic, 8K, ultra detailed, sharp focus, professional photography, Fujifilm X-T4, 85 millimeter, F 1.4.

SDXL and Flux understand a more natural prompt, like: a portrait of a woman in soft afternoon light, photographed with a shallow depth of field. She is looking slightly off camera with a natural expression.

The keyword soup approach still works on SDXL, but natural language produces more coherent results.

Flux in particular excels with descriptive, conversational prompts.

For negative prompts, keep them minimal.

Start with none, then add specific fixes.

Cartoon, illustration, and painting are usually enough to keep things photorealistic.

ControlNet changes everything

[matter-of-fact] If you are serious about photorealistic composition, ControlNet is non-negotiable.

It lets you control the structure of your image through depth maps, Canny edge detection, OpenPose, and surface normals.

Depth maps preserve spatial relationships and perspective.

Canny edge detection preserves outlines and shapes.

OpenPose controls human pose and body proportions.

Surface normals help with realistic lighting interaction across surfaces.

ControlNet models are now available for SDXL, Flux, and SD 3.5.

Multi-ControlNet, where you stack multiple controls, gives you precise composition control that prompt engineering alone cannot achieve.

The workflow is simple.

Take a reference photo.

Extract a depth map or pose.

Use it as ControlNet input.

Generate a photorealistic image with the same composition.

Speed versus quality

[matter-of-fact] If you need fast iterations for concept work or prompt testing, use SDXL Lightning.

It generates quality 1024-pixel images in two to eight steps.

That is better quality than SDXL Turbo at higher resolutions.

For final output, switch back to full SDXL or Flux with 25 to 30 steps.

The difference is noticeable.

The practical workflow

Here is what actually works for photorealistic output in 2026.

[deliberate] First, choose your model: Flux 2 for best photorealism, or Juggernaut XL for the SDXL ecosystem.

Second, write a natural-language prompt describing what you see.

Third, generate at 1024 by 1024. For SDXL, use DPM++ 2M Karras, CFG 7 to 9, and 25 to 30 steps.

Fourth, use ControlNet if you need a specific composition, especially depth or pose.

Fifth, iterate on the prompt. Generate four to eight images, then pick the best.

Sixth, upscale the winner to your target resolution.

Seventh, inpaint any problem areas, especially hands, eyes, and small details.

This is the same workflow whether you are in ComfyUI or Automatic 1111.

The tools differ.

[matter-of-fact] The pipeline does not.
