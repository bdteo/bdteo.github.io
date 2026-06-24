[conversational tone] Consigue imágenes con IA fotorrealistas usando Stable Diffusion, SDXL y Flux en 2026. Cubre los mejores modelos, los requisitos de GPU (RTX 4090/5090), ControlNet y técnicas de prompting.

Actualizado en marzo de 2026. Este artículo se escribió originalmente en mayo de 2023, cuando SD 1.5 a 512x512 era el estándar y la RTX 3090 era el hardware tope de gama. Todo ha cambiado. Flux 2, los fine-tunes de SDXL, SD 3.5, ControlNet y la RTX 5090 han redefinido por completo lo que es posible. Este es el estado actual.

La distancia entre las imágenes generadas por IA y las fotografías reales casi ha desaparecido. En 2023, "fotorrealista" significaba "casi convincente si entornas los ojos". En 2026, los mejores modelos producen imágenes que cuesta de verdad distinguir de la fotografía profesional.

[matter-of-fact] Así es como se llega ahí.

[matter-of-fact] El panorama actual del fotorrealismo

El modelo que elijas importa más que cualquier ajuste que retoques. Así están las cosas:

[deliberate] Flux 2: el nuevo rey

Flux 2 de Black Forest Labs (lanzado en noviembre de 2025) es, posiblemente, el mejor modelo de pesos abiertos para fotorrealismo en 2026. Produce imágenes con iluminación natural, texturas de piel precisas y una composición coherente que rivaliza con la fotografía profesional. Adobe integró Flux (Kontext Pro) en Photoshop en septiembre de 2025: eso te dice dónde está puesta la confianza de la industria.

Flux también tiene una comprensión del lenguaje natural excepcional. Puedes describir lo que quieres en lenguaje llano, sin la sopa de palabras clave que exigía SD 1.5.

[calm] Los fine-tunes de SDXL: los caballos de batalla

[reflective] Para el fotorrealismo basado en SDXL, estos son los líderes actuales:

Juggernaut XL v9/v10: la opción de referencia para resultados cinematográficos y fotográficos. El más popular entre fotógrafos y cineastas. Realistic Vision: ajustado específicamente para texturas, iluminación y precisión facial verosímiles. EpicRealism: detalle fino excepcional e iluminación natural.

Estos modelos cuentan con un enorme respaldo de la comunidad, amplias bibliotecas de LoRA y un comportamiento predecible. Si Flux te parece demasiado nuevo o tu flujo de trabajo está montado sobre SDXL, son una opción excelente.

[reflective] SD 3.5 Large

El buque insignia de Stability AI usa la nueva arquitectura Multimodal Diffusion Transformer (MMDiT), un enfoque fundamentalmente distinto al de SDXL. Es técnicamente impresionante, pero su ecosistema es más pequeño. SD 3.0 quedó obsoleto en abril de 2025, así que asegúrate de estar en 3.5.

[matter-of-fact] Examen de realidad sobre la GPU

Los requisitos de hardware se han disparado considerablemente.

[calm] | GPU | VRAM | Capacidad de fotorrealismo | |-----|------|------------------------| | RTX 3060 12GB | 12GB | Solo fotorrealismo con SD 1.5. SDXL va justo | | RTX 4070 Ti | 12GB | SDXL a 1024x1024. Flux es posible con optimizaciones | | RTX 4090 | 24GB | El punto óptimo. Maneja SDXL, Flux y SD 3.5 con holgura a 1024x1024+ | | RTX 5090 | 32GB | Todo, incluida la generación en 4K y los flujos por lotes. 32GB GDDR7, bus de 512 bits | | Tarjetas de 8GB | 8GB | Lo mínimo viable con la gestión de VRAM de ComfyUI. No es cómodo |

El punto óptimo de 2023, "512x512 en una RTX 3080", es historia antigua. 1024x1024 es ahora la resolución estándar, y conviene tener al menos 16GB de VRAM para trabajar sin frustración constante. A partir de 24GB es donde la cosa se vuelve cómoda.

Para el fotorrealismo en concreto, más VRAM significa que puedes ejecutar modelos más grandes, resoluciones más altas y ControlNet al mismo tiempo sin descargar trabajo a la CPU.

[deliberate] Ajustes para fotorrealismo

[calm] Sampler

DPM++ 2M Karras con 25-30 pasos. Este es el consenso asentado para el fotorrealismo con SDXL: la mejor relación entre velocidad y calidad. Si quieres algo más de detalle con pocos pasos, cambia a DPM++ SDE Karras.

Para Flux: usa el sampler por defecto con 20-30 pasos.

[reflective] CFG

Para fotorrealismo con SDXL: 7-9. Esto da una fuerte adherencia al prompt sin el aspecto sobresaturado y recocido que aparece por encima de 10.

Para SD 3.5: empieza más bajo (3-5); el mecanismo de guía funciona de otra manera.

Para Flux: sigue las recomendaciones específicas del modelo, pero por lo general más bajas que en SDXL.

[matter-of-fact] Resolución

Genera a la resolución nativa del modelo (1024x1024 para SDXL/SD 3.5/Flux) y luego haz upscaling para una resolución mayor. No intentes generar directamente a 2048x2048: obtendrás artefactos, elementos duplicados y problemas de composición.

Opciones de upscaling: hi-res fix en A1111, o nodos de upscaling dedicados en ComfyUI (4x-UltraSharp, ESRGAN).

[deliberate] Prompting para fotorrealismo

El mayor cambio desde 2023: escribe con naturalidad, no con palabras clave.

SD 1.5 necesitaba prompts como:

SDXL y Flux entienden:

El enfoque de la sopa de palabras clave todavía funciona en SDXL, pero el lenguaje natural produce resultados más coherentes. Flux, en particular, brilla con prompts descriptivos y conversacionales.

Prompts negativos: mantenlos al mínimo. Empieza sin ninguno y luego añade correcciones concretas. "cartoon, illustration, painting" suele bastar para mantener las cosas fotorrealistas. Consulta la chuleta para el cambio completo de filosofía sobre los prompts negativos.

[calm] ControlNet lo cambia todo

[reflective] Si te tomas en serio la composición fotorrealista, ControlNet es innegociable. Te permite controlar la estructura de tu imagen mediante:

Mapas de profundidad: mantienen las relaciones espaciales y la perspectiva Detección de bordes Canny: preserva contornos y formas OpenPose: controla la pose humana y las proporciones del cuerpo Normales de superficie: interacción realista de la luz con las superficies

Ahora hay modelos de ControlNet disponibles para SDXL, Flux y SD 3.5. Multi-ControlNet (apilar varios controles) te da un control de composición preciso que la ingeniería de prompts por sí sola no puede lograr.

El flujo de trabajo: toma una foto de referencia, extrae un mapa de profundidad o una pose, úsalo como entrada de ControlNet y genera una imagen fotorrealista con la misma composición.

[reflective] Velocidad frente a calidad

Si necesitas iteraciones rápidas (trabajo de concepto, pruebas de prompts), usa SDXL Lightning: genera imágenes de calidad de 1024px en 2-8 pasos. Mejor calidad que SDXL Turbo a resoluciones más altas.

Para el resultado final, vuelve a SDXL completo o a Flux con 25-30 pasos. La diferencia se nota.

[matter-of-fact] El flujo de trabajo práctico

Esto es lo que de verdad funciona para un resultado fotorrealista en 2026:

Elige tu modelo: Flux 2 para el mejor fotorrealismo, Juggernaut XL para el ecosistema SDXL Escribe un prompt en lenguaje natural que describa lo que ves Genera a 1024x1024, DPM++ 2M Karras, CFG 7-9, 25-30 pasos Usa ControlNet si necesitas una composición concreta (profundidad o pose) Itera sobre el prompt: genera 4-8 imágenes y elige la mejor Haz upscaling de la ganadora hasta tu resolución objetivo Repinta (inpaint) cualquier zona problemática (manos, ojos, pequeños detalles)

Es el mismo flujo de trabajo, ya estés en ComfyUI o en A1111. Las herramientas difieren; el pipeline, no.
