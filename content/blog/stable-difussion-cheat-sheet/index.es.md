---
title: "Chuleta de Stable Diffusion: solución de problemas y optimización"
date: "2023-05-04T23:30:00.000Z"
slug: "stable-difussion-cheat-sheet"
description: "Chuleta práctica de Stable Diffusion para SDXL, SD 3.5 y Flux. Cubre samplers, CFG, resolución, prompts negativos, elección de modelo y de interfaz. Actualizada en marzo de 2026."
featuredImage: "./images/featured.jpg"
tags: ["Stable Diffusion", "IA", "Generación de imágenes", "SDXL", "Flux", "ComfyUI", "Aprendizaje automático"]
imageCaption: "Una pila marfil de fichas con las esquinas dobladas sobre lino, sujetas con una goma elástica ámbar."
lang: "es"
translationOf: "stable-difussion-cheat-sheet"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "0893ec72dec7f4ad"
audioUrl: "/audio/articles/stable-difussion-cheat-sheet/es/Qh9qDWKx9XUbnKbERblA-8c5dec7a5435.m4a"
audioDuration: "9:55"
audioVoice: "Gerard (ElevenLabs LatAm Spanish neutral)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/stable-difussion-cheat-sheet.es.md"
---

> **Actualizada en marzo de 2026.** La versión original de esta chuleta se escribió para SD 1.5 en mayo de 2023. Casi todo ha cambiado desde entonces: arquitecturas nuevas (SDXL, SD 3.5, Flux), interfaces nuevas (ComfyUI), hardware nuevo (RTX 5090) y un giro completo en la filosofía de los prompts negativos. Esta es la versión actual.

Esta es mi referencia de trabajo para los parámetros de Stable Diffusion. No es un tutorial: solo los ajustes a los que recurro cuando las cosas no funcionan o cuando quiero forzar la calidad.

## Qué modelo usar

Esta es la primera decisión ahora, y pesa más que cualquier retoque de parámetros.

| Modelo | Mejor para | Resolución | Notas |
|-------|----------|-----------|-------|
| **Flux 2** | Fotorrealismo, fidelidad al prompt | 1024x1024+ | El mejor modelo de pesos abiertos para fotorrealismo en 2026. Integrado en Adobe Photoshop <small><a href="#ref1">[1]</a></small> |
| **SDXL** | Uso general | 1024x1024 | Ecosistema enorme de fine-tunes. Juggernaut XL, Realistic Vision, DreamShaper |
| **SD 3.5 Large** | Máxima calidad (el buque insignia de Stability) | 1024x1024 | Arquitectura MMDiT. SD 3.0 quedó obsoleto en abril de 2025 <small><a href="#ref2">[2]</a></small> |
| **SDXL Lightning** | Velocidad | 1024x1024 | Generación en 2-8 pasos. Mejor calidad que Turbo a mayor resolución <small><a href="#ref3">[3]</a></small> |
| **SD 1.5** | Flujos heredados | 512x512 | Biblioteca enorme de fine-tunes, pero en retirada. SD 2.0/2.1 oficialmente obsoletos |

Si empiezas desde cero: **Flux 2 para fotorrealismo, SDXL para todo lo demás.** SD 3.5 es bueno, pero su ecosistema es más pequeño.

## Qué interfaz usar

| Interfaz | Mejor para |
|----|----------|
| **ComfyUI** | Usuarios avanzados. Basada en nodos, mejor gestión de VRAM, un 15% más rápida, el mejor soporte para Flux. Estándar de la industria para el trabajo serio desde 2025 <small><a href="#ref4">[4]</a></small> |
| **Automatic1111** | Principiantes. Interfaz más sencilla, biblioteca enorme de extensiones. Sigue funcionando bien para SDXL |
| **Fooocus** | Generación con un solo clic. Configuración mínima. Buena para resultados rápidos |

Yo uso ComfyUI. La curva de aprendizaje es más pronunciada (cuenta con 10-20 horas para sentirte cómodo), pero solo por la gestión de VRAM ya vale la pena: ejecuta SDXL en 8 GB donde A1111 se cuelga.

## Samplers

El debate sobre los samplers está prácticamente zanjado.

**Opciones de referencia:**
- **DPM++ 2M Karras**: la mejor relación entre velocidad y calidad. Es mi opción por defecto para casi todo.
- **DPM++ SDE Karras**: algo mejor con pocos pasos. Bueno cuando iteras rápido.
- **Euler a**: sigue siendo fiable. Más variedad en los resultados, bueno para explorar.

**Cuándo cambiar:**
- ¿Falta de diversidad en los resultados? Prueba DPM++ SDE o Euler a.
- ¿Artefactos o sobresaturación? Prueba DPM++ 2M Karras o Euler a secas.
- ¿Necesitas velocidad por encima de todo? Euler a o DPM++ 2M (sin Karras).
- ¿Quieres calidad máxima? DPM++ 3M SDE Karras o UniPC.

**Número de pasos:** 20-30 pasos para la mayoría de los samplers. Los modelos Lightning solo necesitan 2-8.

## CFG (Classifier Free Guidance)

Con qué rigor sigue el modelo tu prompt frente a su propia interpretación.

| Rango | Efecto |
|-------|--------|
| 1-4 | Muy creativo, interpretación libre. A menudo incoherente |
| **5-7** | Buen equilibrio para la mayoría del trabajo |
| **7-10** | Fuerte fidelidad al prompt. El punto dulce para el fotorrealismo con SDXL |
| 10-15 | Riesgo de artefactos y colores recocidos |
| 15+ | Casi siempre demasiado. Artefactos garantizados |

**Nota:** SD 3.5 usa un mecanismo de guía distinto. El concepto de CFG sigue aplicando, pero la escala se comporta de otra forma: empieza más bajo (3-5) y ajusta.

## Resolución

Los días del 512x512 quedaron atrás.

| Modelo | Resolución nativa | Rango práctico |
|-------|------------------|-----------------|
| SD 1.5 | 512x512 | 512x512 a 768x768 |
| **SDXL** | 1024x1024 | 1024x1024 (estándar), 1024x768, 768x1024 |
| **SD 3.5** | 1024x1024 | 1024x1024+ |
| **Flux** | 1024x1024 | 1024x1024+, 4K posible en GPU de gama alta |

Pasarse de la resolución nativa arriesga artefactos y problemas de composición. Usa hi-res fix o reescalado en lugar de generar directamente a 2048x2048.

## Clip Skip

Menos relevante de lo que solía ser.

- **SD 1.5:** Clip skip 1-2 importa mucho. Los modelos de anime suelen usar clip skip 2.
- **SDXL:** Usa codificadores de texto duales (CLIP + OpenCLIP). El clip skip se ignora en su mayor parte: la arquitectura lo gestiona de otra forma.
- **SD 3.5 / Flux:** No aplica del mismo modo. Estos modelos usan codificación de texto basada en transformers.

Si estás en SDXL o más moderno: no te preocupes por el clip skip. Si estás en SD 1.5: déjalo en 1 para fotorrealismo, 2 para anime.

## Prompts negativos

**La filosofía se ha invertido.** En 2023, el consejo era usar listas largas de prompts negativos. En 2026, el consenso es: **empieza sin nada y añade solo lo que necesites para corregir.**

Por qué el cambio:
- SDXL y Flux entienden el lenguaje natural mucho mejor que SD 1.5
- Los prompts negativos largos pueden, de hecho, *restringir la creatividad* y producir peores resultados
- "bad anatomy" es demasiado vago para ser útil. "ugly" no funciona porque SD no se entrenó con imágenes etiquetadas como "ugly"
- Algunos modelos rinden demostrablemente peor con negativos largos <small><a href="#ref5">[5]</a></small>

**Enfoque actual:**
1. Genera primero sin ningún prompt negativo.
2. Si ves un problema concreto (dedos de más, fondo borroso), añade un negativo dirigido a eso.
3. Usa ponderación de énfasis: `(blurry:1.3)` en lugar de solo `blurry`.
4. Mantenlo corto: 5-10 términos como máximo.

## Referencia rápida de GPU

| GPU | VRAM | Buena para |
|-----|------|----------|
| RTX 3060 12GB | 12GB | SD 1.5, SDXL básico |
| RTX 4070 Ti | 12GB | SDXL, algo de Flux |
| **RTX 4090** | 24GB | Todo. El caballo de batalla |
| **RTX 5090** | 32GB | Todo, incluyendo 4K y generación por lotes |
| Tarjetas de 8GB | 8GB | El mínimo viable. ComfyUI ayuda con la gestión de VRAM |

La marca de los 24 GB es donde las cosas se vuelven cómodas para SDXL y Flux sin malabarismos constantes con la VRAM.

## Soluciones rápidas de problemas

| Problema | Prueba |
|---------|-----|
| Salida borrosa | Aumenta los pasos. Comprueba que la resolución coincide con la nativa del modelo |
| Dedos/extremidades de más | Añade `extra fingers, extra limbs` al prompt negativo. O usa ControlNet |
| Colores sobresaturados | Baja el CFG. Cambia a DPM++ 2M Karras |
| La composición está mal | Usa ControlNet (depth, canny, pose) en lugar de pelear con el prompt |
| La generación es lenta | Usa un modelo Lightning, reduce los pasos, usa ComfyUI para mejor VRAM |
| Sin VRAM | Cambia a ComfyUI, reduce el tamaño de lote, usa fp16 |

---

### Referencias

<a id="ref1"></a>1. [Flux 2 and NVIDIA RTX AI Integration](https://blogs.nvidia.com/blog/rtx-ai-garage-flux-2-comfyui/) -- *Cobertura de NVIDIA sobre Flux 2 con ComfyUI.*<br>
<a id="ref2"></a>2. [Stability AI Release Notes](https://platform.stability.ai/docs/release-notes) -- *Obsolescencia de SD 3.0 y lanzamiento de 3.5.*<br>
<a id="ref3"></a>3. [SDXL-Lightning by ByteDance](https://huggingface.co/ByteDance/SDXL-Lightning) -- *Generación en 2-8 pasos a 1024px.*<br>
<a id="ref4"></a>4. [ComfyUI vs Automatic1111 2026 Comparison](https://wiki.shakker.ai/en/comfyui-vs-automatic1111) -- *Comparación de rendimiento y prestaciones.*<br>
<a id="ref5"></a>5. [How to Use Negative Prompts Effectively](https://stable-diffusion-art.com/how-to-use-negative-prompts/) -- *Guía actualizada sobre la filosofía de prompts negativos mínimos.*<br>
<a id="ref6"></a>6. [Understanding Stable Diffusion Samplers](https://civitai.com/articles/7484/understanding-stable-diffusion-samplers-beyond-image-comparisons) -- *Guía de comparación y selección de samplers.*<br>
<a id="ref7"></a>7. [Best Stable Diffusion Models for 2026](https://www.cubix.co/blog/best-model-for-stable-diffusion/) -- *El panorama actual de modelos.*

---

### Entradas relacionadas

- [Stable Diffusion Photorealism: Settings & GPU Limits Guide](/pushing-the-stable-diffussion-limits/) -- un análisis a fondo de cómo lograr resultados fotorrealistas con los modelos actuales.
