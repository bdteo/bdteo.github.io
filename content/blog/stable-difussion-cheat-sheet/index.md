---
title: "Stable Diffusion Cheat Sheet: Troubleshooting and Optimization"
date: "2023-05-04T23:30:00.000Z"
description: "A comprehensive guide to optimizing Stable Diffusion settings for high-quality, efficient image generation."
---

This cheat sheet provides a detailed overview of key parameters and techniques for troubleshooting and optimizing Stable Diffusion, a powerful image generation model. By understanding and adjusting settings such as clip skip, CFG, preprocessing resolution, input image cropping, and samplers, users can achieve the desired balance between generation speed, image quality, and prompt adherence.

## Clip Skip
- Higher values (e.g., 2-3): Faster generation, lower quality, less prompt adherence
- Lower values (e.g., 1): Slower generation, higher quality, better prompt adherence
- Troubleshooting:
- High clip skip + high resolution = blurry, low-quality results
- Low clip skip + low resolution = overworked, inconsistent results
- Optimization:
- Adjust clip skip based on desired balance between speed and quality
- Decrease clip skip when increasing preprocessing resolution

## CFG (Classifier Free Guidance)
- Higher values (e.g., 10-15): Stronger prompt adherence, potential artifacts
- Lower values (e.g., 5-7): More creative interpretation, less prompt adherence
- Troubleshooting:
- High CFG + low steps = artifacts, overemphasis on prompt
- Low CFG + high steps = slow generation, lack of prompt adherence
- Optimization:
- Adjust CFG based on desired balance between prompt adherence and creativity
- Decrease CFG if hitting step count limits to manage computational demands

## Preprocessing Resolution
- Higher resolution: More detail, slower processing, requires lower clip skip
- Lower resolution: Less detail, faster processing, allows higher clip skip
- Troubleshooting:
- High resolution + high clip skip = artifacts, mutations
- Low resolution + low clip skip = overprocessed, inconsistent results
- Optimization:
- Match preprocessing resolution to target image resolution
- Adjust clip skip accordingly to maintain quality and efficiency

## Input Image Cropping
- Tighter cropping: Enhances focus on main subject, reduces processing steps
- Looser cropping: Maintains context and composition, requires more processing
- Troubleshooting:
- Over-cropping = loss of context, unnatural appearance
- Under-cropping = wasted processing on irrelevant areas
- Optimization:
- Crop tightly around main subject while preserving essential context
- Test different cropping levels to find the optimal balance

## Samplers
- Euler a: Non-ancestral Euler method, faster but less accurate
- Euler: Ancestral Euler method, balanced speed and quality
- DPM++ 2M Karras: Efficient sampler with Karras noise schedule, good for general use
- DPM++ SDE Karras: Stochastic differential equation (SDE) sampler with Karras noise schedule
- ...

Troubleshooting:
- Lack of diversity = try DPM++ SDE or UniPC samplers
- Oversaturation or artifacts = try Euler or DPM++ 2M Karras samplers
- Slow generation = try Euler a or DPM++ 2M samplers

Optimization:
- Use Euler a or DPM++ 2M for fast iterations and drafts
- Use DPM++ 2M Karras or DPM++ SDE for balanced speed and quality
- Use DPM++ 3M SDE or UniPC for high-quality, diverse results
- Experiment with different noise schedules (e.g., Karras, exponential) to fine-tune results

## General Optimization Tips
- Experiment with different settings to find the best combination for your use case
- Keep detailed records of settings and results for future reference
- Seek feedback from others to validate improvements and gain new insights
- Balance generation speed and image quality based on your priorities
- Use preprocessing and postprocessing techniques to enhance input and output images
- Stay updated with the latest techniques and advancements in the field
- Share your findings and contribute to the community for mutual learning and growth
