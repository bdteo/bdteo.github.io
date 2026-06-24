---
lang: "bg"
translationOf: "stable-difussion-cheat-sheet"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "0893ec72dec7f4ad"
title: "Stable Diffusion cheat sheet: troubleshooting и оптимизация"
date: "2023-05-04T23:30:00.000Z"
description: "Практичен Stable Diffusion cheat sheet за SDXL, SD 3.5 и Flux. Обхваща samplers, CFG, резолюция, negative prompts, избор на модел и UI. Обновено март 2026."
featuredImage: "./images/featured.jpg"
tags: ["Stable Diffusion", "AI", "Image Generation", "SDXL", "Flux", "ComfyUI", "Machine Learning"]
imageCaption: "Купчина протрити картончета в цвят слонова кост върху лен, пристегнати с кехлибарен ластик."
audioUrl: "/audio/articles/stable-difussion-cheat-sheet/bg/5egO01tkUjEzu7xSSE8M-bb03435a26ac.m4a"
audioDuration: "13:31"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/stable-difussion-cheat-sheet.bg.md"
---

> **Обновено март 2026.** Оригиналната версия на този cheat sheet беше написана за SD 1.5 през май 2023. Оттогава почти всичко се промени -- нови архитектури (SDXL, SD 3.5, Flux), нови UI-та (ComfyUI), нов хардуер (RTX 5090) и пълен обрат във философията за negative prompts. Това е актуалната версия.

Това е работният ми справочник за параметрите в Stable Diffusion. Не tutorial -- просто настройките, към които посягам, когато нещо не работи или когато искам да избутам качеството нагоре.

## Кой модел да използваш

Това вече е първото решение и има по-голямо значение от всяко пипане на параметри.

| Модел | Най-добър за | Резолюция | Бележки |
|-------|--------------|-----------|---------|
| **Flux 2** | Фотореализъм, следване на prompt-а | 1024x1024+ | Най-добрият open-weight модел за фотореализъм през 2026. Интегриран в Adobe Photoshop <small><a href="#ref1">[1]</a></small> |
| **SDXL** | Обща употреба | 1024x1024 | Огромна екосистема от fine-tune-и. Juggernaut XL, Realistic Vision, DreamShaper |
| **SD 3.5 Large** | Топ качество (flagship моделът на Stability) | 1024x1024 | MMDiT архитектура. SD 3.0 беше deprecated през април 2025 <small><a href="#ref2">[2]</a></small> |
| **SDXL Lightning** | Скорост | 1024x1024 | Генериране в 2-8 стъпки. По-добро качество от Turbo при по-висока резолюция <small><a href="#ref3">[3]</a></small> |
| **SD 1.5** | Legacy workflows | 512x512 | Огромна библиотека от fine-tune-и, но постепенно излиза от употреба. SD 2.0/2.1 са официално deprecated |

Ако започваш начисто: **Flux 2 за фотореализъм, SDXL за всичко останало.** SD 3.5 е добър, но екосистемата е по-малка.

## Кой UI да използваш

| UI | Най-добър за |
|----|--------------|
| **ComfyUI** | Power users. Node-based, по-добро управление на VRAM, 15% по-бърз, най-добра поддръжка за Flux. Индустриален стандарт за сериозна работа към 2025 <small><a href="#ref4">[4]</a></small> |
| **Automatic1111** | Начинаещи. По-прост интерфейс, огромна библиотека от extensions. Все още работи добре за SDXL |
| **Fooocus** | Генериране с един клик. Минимална конфигурация. Добър за бързи резултати |

Аз използвам ComfyUI. Learning curve-ът е по-стръмен (очаквай 10-20 часа, докато ти стане удобно), но само управлението на VRAM си струва -- пуска SDXL на 8GB там, където A1111 се срива.

## Samplers

Спорът за samplers е общо взето приключил.

**Go-to избори:**
- **DPM++ 2M Karras** -- най-доброто съотношение скорост-към-качество. Това ми е default-ът за почти всичко.
- **DPM++ SDE Karras** -- малко по-добър при нисък брой стъпки. Добър, когато итерираш бързо.
- **Euler a** -- все още надежден. Повече разнообразие в outputs, добър за exploration.

**Кога да смениш:**
- Липса на разнообразие в outputs? Пробвай DPM++ SDE или Euler a.
- Artifacts или oversaturation? Пробвай DPM++ 2M Karras или plain Euler.
- Трябва ти скорост преди всичко? Euler a или DPM++ 2M (non-Karras).
- Искаш максимално качество? DPM++ 3M SDE Karras или UniPC.

**Брой стъпки:** 20-30 стъпки за повечето samplers. Lightning моделите имат нужда само от 2-8.

## CFG (Classifier Free Guidance)

Колко стриктно моделът следва prompt-а ти спрямо собствената си интерпретация.

| Диапазон | Ефект |
|----------|-------|
| 1-4 | Много творчески, свободна интерпретация. Често incoherent |
| **5-7** | Добър баланс за повечето работа |
| **7-10** | Силно следване на prompt-а. Sweet spot за SDXL фотореализъм |
| 10-15 | Риск от artifacts и преготвени цветове |
| 15+ | Почти винаги прекалено. Artifacts гарантирани |

**Бележка:** SD 3.5 използва различен guidance механизъм. Концепцията за CFG все още важи, но скалата се държи различно -- започни по-ниско (3-5) и настройвай оттам.

## Резолюция

Дните на 512x512 свършиха.

| Модел | Нативна резолюция | Практичен диапазон |
|-------|-------------------|--------------------|
| SD 1.5 | 512x512 | 512x512 до 768x768 |
| **SDXL** | 1024x1024 | 1024x1024 (стандарт), 1024x768, 768x1024 |
| **SD 3.5** | 1024x1024 | 1024x1024+ |
| **Flux** | 1024x1024 | 1024x1024+, 4K е възможно на high-end GPU-та |

Да минеш над нативната резолюция носи риск от artifacts и проблеми с композицията. Използвай hi-res fix или upscaling, вместо да генерираш директно на 2048x2048.

## Clip Skip

По-малко релевантен е, отколкото беше.

- **SD 1.5:** Clip skip 1-2 има голямо значение. Anime моделите често използват clip skip 2.
- **SDXL:** Използва dual text encoders (CLIP + OpenCLIP). Clip skip до голяма степен се игнорира -- архитектурата го обработва различно.
- **SD 3.5 / Flux:** Не е приложимо по същия начин. Тези модели използват transformer-based text encoding.

Ако си на SDXL или по-ново: не се тревожи за clip skip. Ако си на SD 1.5: дръж го на 1 за фотореализъм, 2 за anime.

## Negative Prompts

**Философията се обърна.** През 2023 съветът беше да използваш дълги списъци с negative prompts. През 2026 консенсусът е: **започни с нищо и добавяй само това, което ти трябва за поправка.**

Защо промяната:
- SDXL и Flux разбират естествен език много по-добре от SD 1.5
- Дългите negative prompts всъщност могат да *ограничат креативността* и да влошат резултатите
- "bad anatomy" е твърде неясно, за да е полезно. "ugly" не работи, защото SD не е трениран върху изображения, етикетирани като "ugly"
- Някои модели се представят демонстративно по-зле с дълги negatives <small><a href="#ref5">[5]</a></small>

**Актуалният подход:**
1. Първо генерирай без никакъв negative prompt.
2. Ако видиш конкретен проблем (extra fingers, blurry background), добави targeted negative за него.
3. Използвай emphasis weighting: `(blurry:1.3)` вместо само `blurry`.
4. Дръж го кратко -- максимум 5-10 термина.

## GPU бърз справочник

| GPU | VRAM | Добър за |
|-----|------|----------|
| RTX 3060 12GB | 12GB | SD 1.5, basic SDXL |
| RTX 4070 Ti | 12GB | SDXL, малко Flux |
| **RTX 4090** | 24GB | Всичко. Работната машина |
| **RTX 5090** | 32GB | Всичко, включително 4K и batch generation |
| 8GB карти | 8GB | Минимално жизнеспособно. ComfyUI помага с VRAM management |

Границата от 24GB е мястото, където нещата стават удобни за SDXL и Flux без постоянно жонглиране с VRAM.

## Troubleshooting бързи поправки

| Проблем | Пробвай |
|---------|---------|
| Blurry output | Увеличи steps. Провери дали резолюцията съвпада с native res на модела |
| Extra fingers/limbs | Добави `extra fingers, extra limbs` към negative prompt. Или използвай ControlNet |
| Oversaturated colors | Намали CFG. Смени на DPM++ 2M Karras |
| Композицията е грешна | Използвай ControlNet (depth, canny, pose), вместо да се бориш с prompt-а |
| Generation is slow | Използвай Lightning model, намали steps, използвай ComfyUI за по-добър VRAM |
| Out of VRAM | Смени на ComfyUI, намали batch size, използвай fp16 |

---

### Източници

<a id="ref1"></a>1. [Flux 2 and NVIDIA RTX AI Integration](https://blogs.nvidia.com/blog/rtx-ai-garage-flux-2-comfyui/) -- *Покритието на NVIDIA за Flux 2 с ComfyUI.*<br>
<a id="ref2"></a>2. [Stability AI Release Notes](https://platform.stability.ai/docs/release-notes) -- *SD 3.0 deprecation и release-ът на 3.5.*<br>
<a id="ref3"></a>3. [SDXL-Lightning by ByteDance](https://huggingface.co/ByteDance/SDXL-Lightning) -- *Генериране в 2-8 стъпки на 1024px.*<br>
<a id="ref4"></a>4. [ComfyUI vs Automatic1111 2026 Comparison](https://wiki.shakker.ai/en/comfyui-vs-automatic1111) -- *Сравнение на performance и възможности.*<br>
<a id="ref5"></a>5. [How to Use Negative Prompts Effectively](https://stable-diffusion-art.com/how-to-use-negative-prompts/) -- *Обновен guide за минималистичната философия на negative prompts.*<br>
<a id="ref6"></a>6. [Understanding Stable Diffusion Samplers](https://civitai.com/articles/7484/understanding-stable-diffusion-samplers-beyond-image-comparisons) -- *Сравнение и избор на samplers.*<br>
<a id="ref7"></a>7. [Best Stable Diffusion Models for 2026](https://www.cubix.co/blog/best-model-for-stable-diffusion/) -- *Актуалният пейзаж на моделите.*

---

### Свързани публикации

- [Stable Diffusion фотореализъм: guide за настройки и GPU лимити](/pushing-the-stable-diffussion-limits/) -- дълбоко гмуркане в постигането на фотореалистични резултати с актуалните модели.
