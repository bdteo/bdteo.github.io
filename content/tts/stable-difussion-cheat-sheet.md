Stable Diffusion Cheat Sheet: Troubleshooting and Optimization.

Updated March twenty twenty six.

[matter-of-fact] The original version of this cheat sheet was written for Stable Diffusion one point five in May twenty twenty three. Almost everything has changed since then. New architectures, like SDXL, SD three point five, and Flux. New interfaces, especially ComfyUI. New hardware, like the RTX fifty ninety. And a complete reversal on negative prompt philosophy.

[conversational tone] This is my working reference for Stable Diffusion parameters. Not a tutorial. Just the settings I reach for when things are not working, or when I want to push quality.

Which Model to Use

This is the first decision now, and it matters more than any parameter tweak.

Flux 2 is the choice for photorealism and prompt adherence at ten twenty four square and above. As of twenty twenty six, it is the best open-weight model for photorealism, and it is integrated into Adobe Photoshop.

SDXL is the general-purpose choice at ten twenty four square. It has the massive ecosystem: Juggernaut XL, Realistic Vision, DreamShaper, and all the fine-tunes people actually use.

SD three point five Large is Stability's flagship quality model. It uses the MMDiT architecture, and it replaces the older SD three point zero line, which was deprecated in April twenty twenty five.

SDXL Lightning is for speed. It gives you two to eight step generation at ten twenty four square, with better quality than Turbo at higher resolutions.

SD one point five is now mostly for legacy workflows. It still has a huge fine-tune library, but the old five twelve square world is being phased out. SD two point zero and two point one are officially deprecated.

[deliberate] If you are starting fresh: Flux 2 for photorealism, SDXL for everything else. SD three point five is good, but the ecosystem is smaller.

Which UI to Use

ComfyUI is for power users. It is node-based, has better VRAM management, runs about fifteen percent faster, and has the best Flux support. By twenty twenty five, it became the industry standard for serious work.

Automatic1111 is still the beginner-friendly option. The interface is simpler, the extension library is huge, and it still works fine for SDXL.

Fooocus is for one-click generation. Minimal configuration. Good for quick results.

[conversational tone] I use ComfyUI. The learning curve is steeper, and you should expect ten to twenty hours before it feels comfortable. But the VRAM management alone is worth it. It can run SDXL on eight gigabytes of VRAM where Automatic1111 crashes.

Samplers

The sampler debate is mostly settled.

[matter-of-fact] My default for almost everything is DPM plus plus two M Karras. It has the best speed-to-quality ratio.

DPM plus plus SDE Karras is slightly better at low step counts, so it is useful when you are iterating fast.

Euler A is still reliable. It gives more variety in the outputs, which makes it good for exploration.

If your outputs lack diversity, try DPM plus plus SDE or Euler A.

If you are seeing artifacts or oversaturated colors, try DPM plus plus two M Karras, or plain Euler.

If you need speed above all, use Euler A, or DPM plus plus two M without Karras.

If you want maximum quality, try DPM plus plus three M SDE Karras, or UniPC.

[deliberate] For step counts, use twenty to thirty steps for most samplers. Lightning models only need two to eight.

CFG: Classifier Free Guidance

CFG is how strictly the model follows your prompt instead of its own interpretation.

[slows down] One to four is very creative and loose, but often incoherent.

Five to seven is a good balance for most work.

Seven to ten gives strong prompt adherence. That is the sweet spot for SDXL photorealism.

Ten to fifteen starts risking artifacts and overcooked colors.

Above fifteen is almost always too much. Artifacts are basically guaranteed.

[matter-of-fact] One note: SD three point five uses a different guidance mechanism. The CFG idea still applies, but the scale behaves differently. Start lower, around three to five, and adjust from there.

Resolution

The days of five twelve square are over.

SD one point five was built around five twelve square. In practice, it lives between five twelve square and seven sixty eight square.

SDXL is native at ten twenty four square. Standard sizes are ten twenty four by ten twenty four, ten twenty four by seven sixty eight, and seven sixty eight by ten twenty four.

SD three point five is native at ten twenty four square and can go above that.

Flux is also native at ten twenty four square and above. Four K is possible on high-end GPUs.

[deliberate] Going above the native resolution risks artifacts and composition problems. Use hi-res fix or upscaling instead of generating directly at twenty forty eight square.

Clip Skip

Clip skip matters less than it used to.

For SD one point five, clip skip one or two still matters a lot. Anime models often use clip skip two. For photorealism, keep it at one.

For SDXL, clip skip is mostly ignored. SDXL uses dual text encoders, CLIP and OpenCLIP, and the architecture handles it differently.

For SD three point five and Flux, clip skip is not applicable in the same way. These models use transformer-based text encoding.

If you are on SDXL or newer, do not worry about clip skip.

Negative Prompts

[emphasized] The philosophy has flipped.

In twenty twenty three, the advice was to use long negative prompt lists. In twenty twenty six, the consensus is: start with nothing, and add only what you need to fix.

There are reasons for the change.

[matter-of-fact] SDXL and Flux understand natural language much better than SD one point five. Long negative prompts can restrict creativity and produce worse results. Terms like bad anatomy are too vague to be useful. Ugly does not work because Stable Diffusion was not trained on neatly labeled ugly images. And some models perform demonstrably worse with long negatives.

The current approach is simple.

Generate without any negative prompt first.

If you see a specific problem, like extra fingers or a blurry background, add a targeted negative for that problem.

Use emphasis weighting when it helps. For example, blurry at one point three instead of just blurry.

[deliberate] Keep the negative prompt short. Five to ten terms maximum.

GPU Quick Reference

An RTX thirty sixty with twelve gigabytes is enough for SD one point five and basic SDXL.

An RTX forty seventy Ti with twelve gigabytes handles SDXL and some Flux.

An RTX forty ninety with twenty four gigabytes handles everything. It is the workhorse.

An RTX fifty ninety with thirty two gigabytes handles everything, including four K and batch generation.

Eight gigabyte cards are the minimum viable option. ComfyUI helps a lot with VRAM management.

[matter-of-fact] The twenty four gigabyte mark is where SDXL and Flux start to feel comfortable without constant VRAM juggling.

Troubleshooting Quick Fixes

If the output is blurry, increase the step count and check that your resolution matches the model's native resolution.

If you get extra fingers or limbs, add specific negatives like extra fingers and extra limbs, or use ControlNet.

If colors are oversaturated, lower CFG and switch to DPM plus plus two M Karras.

If the composition is wrong, use ControlNet with depth, canny, or pose guidance instead of fighting the prompt.

If generation is slow, use a Lightning model, reduce the step count, or switch to ComfyUI for better VRAM behavior.

If you are out of VRAM, switch to ComfyUI, reduce batch size, and use F P sixteen.

[deliberate] That is the cheat sheet. Model choice first. UI second. Parameters after that.
