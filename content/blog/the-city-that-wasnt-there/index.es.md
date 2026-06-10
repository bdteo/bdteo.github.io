---
slug: the-city-that-wasnt-there
lang: "es"
translationOf: "the-city-that-wasnt-there"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "4881a4f8a93312f8"
title: "La ciudad que no estaba allí"
description: "Consulté la API por la segunda entrada más grande y obtuve cero resultados. No un error: simplemente nada. Lo que encontré cuando empecé a escarbar cambió toda la arquitectura."
meta_description: "El recorrido de un desarrollador a través de datos ausentes, análisis de documentos, trampas de Unicode y las lecciones de arquitectura que surgen cuando tu segunda fuente de datos rompe todas las suposiciones."
keywords: ["web scraping", "plataforma de datos", "análisis de documentos", "ingeniería inversa", "arquitectura de software", "principios SOLID", "estrategia de precios", "startup", "extracción de texto", "Unicode"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: 4 min
date: "2026-02-08"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "The City That Wasn't There",
    "description": "A developer's journey through missing data, document parsing, Unicode traps, and the architecture lessons that emerge when your second data source breaks every assumption.",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2026-02-08",
    "image": "https://bdteo.com/images/the-city-that-wasnt-there.jpg",
    "keywords": "web scraping, data platform, document parsing, software architecture, startup, text extraction",
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
imageCaption: "Un viejo archivador de madera, con una ficha vacía en el centro, bajo una luz polvorienta."
---

Construí algo que extrae datos de una fuente, los limpia y los muestra mejor que el original. Trabajo de rutina.

Entonces consulté la segunda entrada más grande del sistema. Todo lo demás devolvía cientos de resultados. Esta: cero. No estaba rota. Simplemente vacía.

Supuse que la había fastidiado yo. Revisé mi código tres veces. Probé el endpoint directamente. La entrada existe en su interfaz. Solo que está... hueca.

Ahí fue cuando empecé a escarbar.

---

La fuente parecía exhaustiva. Alcance amplio, interfaz pulida, API limpia. Pero la participación voluntaria deja agujeros que no se ven desde la documentación.

Tres competidores tenían datos para las mismas entidades. Registros completos. Así que la información existe en algún lugar.

No te faltaba un endpoint. Al endpoint le faltaba la realidad.

---

Hice una pregunta que nadie había pensado en hacer: ¿dónde vivían estos datos antes de internet?

La respuesta: publicaciones periódicas impresas. Archivos. Formatos analógicos que funcionan desde el siglo XIX. Publicados tres veces por semana. Sin datos estructurados, solo documentos en una página web.

Así que descargo uno. Prosa institucional densa, avisos enterrados a lo largo de subdelegaciones. Los datos están ahí.

Mis competidores llevan treinta años haciendo esto a mano.

Yo escribo un scraper en una tarde. En parte por curiosidad, en parte por despecho.

---

El análisis de los documentos es donde la cosa se pone verdaderamente dolorosa.

Una sola palabra queda partida por un guion suave —Unicode U+00AD, invisible a la vista, fatal para toda expresión regular—. Te quedas mirando la pantalla pensando que tu patrón está mal. No lo está. Hay un carácter fantasma escondido en el texto. El `\w` de JavaScript no coincide con caracteres no ASCII, así que palabras corrientes se vuelven coincidencias imposibles. Los números contienen espacios fantasma del renderizador: "20. 000" en lugar de "20.000".

Cada bug tarda más en encontrarse que en arreglarse. Esa es siempre la proporción con la extracción de texto: 90% trabajo de detective, 10% código.

---

Diez registros se materializan del ruido. Fechas, identificadores, ubicaciones: todo donde debería estar. Lo ejecuto dos veces para asegurarme de que no estoy alucinando. El mismo resultado. De verdad funciona.

---

El análisis te muestra lo que está. Empiezo a buscar lo que no está. Los IDs son secuenciales. Los enumero.

El 53% están muertos. El sistema purga las entradas terminadas: sin archivo, sin historial. Algunos registros existen pero no tienen ningún documento de respaldo. La respuesta: visítenos en persona. En 2026.

La fuente no es una base de datos. Es una ventana, y alguien la sigue cerrando.

---

La primera fuente de datos dio forma a la arquitectura. La segunda rompió todas las suposiciones.

Necesitaba una segunda arquitectura. Lo cual es una forma educada de decir que la primera no era realmente una arquitectura: solo una solución que funcionaba y que daba la casualidad de que encajaba en un caso. La fuente rara revela la verdad: construiste para los datos que tenías, no para los datos que ibas a encontrar.

Esta vez construyo una en condiciones. Patrón de registro, interfaces compartidas, contratos base que dejan que cada implementación se mantenga fiel a sí misma.

La arquitectura es mejor porque esperé. Si la hubiera construido el primer día, la habría diseñado para la única fuente que conocía. La segunda —la rara— me obligó a encontrar lo que de verdad importa.

No puedes diseñar para lo desconocido. Pero puedes refactorizar cuando llega.

---

La arquitectura me enseñó cómo construir. El mercado me enseñó para qué construir.

Entro en un mercado con un actor establecido que lleva treinta años funcionando. Su tecnología parece de 2005. Su foso no es la tecnología: es la confianza, el reconocimiento de marca, décadas de datos acumulados.

El competidor moderno se lanzó hace tres años con IA y una interfaz elegante. Abarató los precios del establecido. Tres años después, el establecido sigue dominando. Resulta que más barato no significa automáticamente mejor posicionado.

El anclaje importa: el primer precio se convierte en el punto de referencia. Fácil de bajar después, casi imposible de subir. La suscripción no es el producto: es la puerta a lo que hay detrás.

Pongo un precio alto. Siempre puedo bajarlo.

---

Cuatro lecciones, condensadas:

1. **Autorizado no significa completo.** A la fuente principal le faltaba un segmento entero. Los datos existían, solo que no donde nadie los esperaba.
2. **La segunda fuente revela tu arquitectura.** Solo aprendes la verdad sobre tu diseño cuando algo se niega a la forma que construiste.
3. **Los datos no son permanentes.** Si los necesitas, guárdalos. La fuente no lo hará.
4. **Pon precio según lo que vas a llegar a ser, no según lo que eres.** La suscripción es una puerta. Construye lo que hay detrás.

El trabajo interesante vive en los huecos. Ahí es donde vivo yo también.
