---
slug: the-model-that-wasnt-there
lang: "es"
translationOf: "the-model-that-wasnt-there"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "302e3501ec007351"
title: "El modelo que no estaba ahí"
description: "Google encabezaba todos los benchmarks. Vídeos de YouTube, conferencias, seminarios. El mejor modelo de generación de imágenes del mundo. Entonces intenté usarlo."
meta_description: "Cómo la generación de imágenes de Gemini de Google encabeza todas las clasificaciones pero está limitada de forma rígida a 2 peticiones por minuto, y qué te dice eso sobre la economía de la generación autorregresiva de imágenes."
keywords: ["gemini", "google", "generación de imágenes", "vertex ai", "límite de peticiones", "economía de la ia", "autorregresivo", "producción", "api"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: 4 min
date: "2026-03-14"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "The Model That Wasn't There",
    "description": "How Google's Gemini image generation tops every leaderboard but is hard-capped at 2 requests per minute - and what that tells you about the economics of autoregressive image generation.",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2026-03-14",
    "image": "https://bdteo.com/images/the-model-that-wasnt-there.jpg",
    "keywords": "gemini, google, image generation, vertex ai, rate limiting, ai economics, autoregressive",
    "publisher": {
      "@type": "Organization",
      "name": "Boris's Blog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bdteo.com/static/images/logo.png"
      }
    }
  }
featuredImage: "./images/featured.jpg"
imageCaption: "Un pedestal iluminado tras una cuerda roja: la promesa está expuesta, pero no hecha para tocarse."
---

Estábamos generando imágenes de anuncios con Gemini 3 Pro. Clasificado en el puesto #4 del leaderboard de Artificial Analysis. La calidad era genuinamente impresionante: mejor adherencia al prompt, mejor tipografía, mejor resultado creativo que cualquier otra cosa que hubiéramos probado. Google estaba en todas partes con él. Vídeos de YouTube. Conferencias. Seminarios. Entradas de blog. "El mejor modelo de generación de imágenes del mundo."

Les creí. Las imágenes eran buenas.

---

Entonces un usuario reportó que clonar un anuncio tardaba cuatro minutos. Lo comprobé. La generación en sí terminaba en menos de treinta segundos. ¿Y los otros tres minutos y medio? El trabajo se reintentaba contra un muro.

429. Resource Exhausted.

---

Google había limitado de forma rígida la generación de imágenes de Gemini a dos peticiones por minuto. Por proyecto. A nivel global.

Dos. No doscientas. No veinte. Dos.

El día anterior habíamos generado 900 imágenes sin ningún problema. Algo cambió de su lado. Sin aviso, sin correo, sin entrada en el changelog. Solo un nuevo techo lo bastante bajo como para alcanzarlo con dos usuarios haciendo clic al mismo tiempo.

---

Nuestro equipo de DevOps presentó una solicitud de aumento de cuota. Treinta RPM. Razonable para un SaaS en producción. La respuesta de Google:

> "This gemini model is not available for quota increase."

Nos sugirieron cambiar a Imagen 4. Lo busqué.

Imagen 4 Ultra: puesto #10. Imagen 4 Standard: #42. Imagen 4 Fast: #60.

Nosotros estábamos en el #4. La sugerencia de Google era un descenso de entre seis y cincuenta y seis puestos en su propio leaderboard.

---

Probé todo lo que se me ocurrió.

Cambiar a Gemini 3.1 Flash: puesto #2, la mitad del coste, mejor que lo que teníamos. Desplegado en staging. Luego comprobé la cuota. El mismo límite de 2 RPM. No es por modelo. Es por proyecto, por familia de modelo base. Todos los modelos de imagen de Gemini comparten el mismo cubo.

Distribución multirregión: la cuota es por región, así que repartir las peticiones entre cinco regiones nos daría diez RPM. Salvo que los modelos de imagen de Gemini 3.x solo funcionan en el endpoint global. No hay endpoints regionales. Los 2 RPM del endpoint global son el único cubo que existe.

Varios proyectos de GCP: cada uno tiene sus propios 2 RPM. Técnicamente funciona. Arquitectónicamente, esto es lo que parece la desesperación.

---

Empecé a investigar qué estaban experimentando otros desarrolladores. La misma historia en todas partes. Límite no documentado de 2 RPM. Mensajes en foros sin respuesta de Google. Aumentos de cuota aprobados que seguían devolviendo 429 en cada llamada. ¿Nuestros 30 000 dólares mensuales de gasto en GCP? No ayudan. Los niveles estándar de PayGo excluyen explícitamente a los modelos de generación de imágenes de los beneficios de rendimiento.

Google no va a subir este límite.

---

Y entonces la pregunta interesante: ¿por qué no?

Gemini genera imágenes a través del mismo transformer autorregresivo que maneja el texto. No es un modelo de difusión. Es el LLM completo, razonando píxel a píxel a lo largo de una imagen. Cada imagen quema el mismo cómputo que decenas de llamadas a la API de texto.

A 0,067 dólares por imagen, Google casi con seguridad pierde dinero en cada generación. El límite de 2 RPM no es una cuota que se olvidaron de ajustar. Es un estrangulamiento calculado porque la economía no cuadra.

Imagen 4 usa difusión latente clásica: órdenes de magnitud más barata de ejecutar. Por eso obtiene entre 30 y 150 RPM y Google empuja a todo el mundo hacia ella. El modelo caro se lleva el marketing. El modelo barato se lleva el rendimiento.

---

Piensa en lo que esto significa. Google construyó un modelo que encabezó todos los benchmarks. Lo promocionó en cada conferencia, cada keynote de YouTube, cada blog de desarrolladores. "Estado del arte. El mejor del mundo." Los desarrolladores lo integran en producción. Los usuarios dependen de él. Y entonces: dos peticiones por minuto, sin aumento disponible, usa mejor nuestro modelo peor.

La API existe. El endpoint funciona. La demo es deslumbrante.

Pero en realidad no puedes usarlo.

---

Cambiamos a `gemini-2.5-flash-image`. El modelo más viejo. El aburrido. Ese del que nadie hace vídeos de YouTube.

Tiene 40 RPM. Funciona.

---

Cuatro lecciones, condensadas:

1. **El marketing no es un producto.** Encabezar un leaderboard no significa que puedas servir tráfico de producción. Los benchmarks miden calidad. Los límites de peticiones miden compromiso.
2. **La generación autorregresiva de imágenes no escala.** Cuando generar una imagen cuesta lo mismo que cien consultas de texto, ningún modelo de negocio sobrevive a límites de peticiones generosos. La economía es la señal.
3. **Preview significa preview.** Google puede cambiar límites, descontinuar modelos o redirigirte a alternativas inferiores sin previo aviso. Si tu sistema de producción depende de un modelo en preview, tu sistema de producción depende del calendario de marketing de otro.
4. **El modelo aburrido funciona.** El de 40 RPM y sin charlas en conferencias servirá a tus usuarios mientras el modelo de clase mundial se queda tras un cordón de terciopelo generando dos imágenes por minuto.

El vendor lock-in más aterrador es el que empieza con una demo a la que no puedes resistirte.
