---
slug: the-queue-that-never-stopped
lang: "es"
translationOf: "the-queue-that-never-stopped"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "97eab6a570d4f717"
title: "La cola que nunca paró"
description: "La memoria de Redis seguía subiendo. Horizon se veía en verde. Veintinueve clases de email reintentaban para siempre y nadie se dio cuenta."
meta_description: "Cómo un bug conocido de Laravel Horizon hace que los Mailables en cola reintenten de forma infinita cuando maxTries es null, y por qué tu cola podría estar devorando en silencio la memoria de tu Redis."
keywords: ["laravel", "horizon", "queue", "redis", "mailable", "infinite retry", "bug", "php"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: 3 min
date: "2026-02-07"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "The Queue That Never Stopped",
    "description": "How a known Laravel Horizon bug causes queued Mailables to retry infinitely when maxTries is null, and why your queue might be silently eating your Redis memory.",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2026-02-07",
    "image": "https://bdteo.com/images/the-queue-that-never-stopped.jpg",
    "keywords": "laravel, horizon, queue, redis, mailable, infinite retry, bug, php",
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
imageCaption: "Una gota de agua cae de un grifo sobre un fregadero."
---

Los emails estaban fallando. Esa parte era esperada: credenciales SMTP rotas durante una migración. Lo que no era esperado: nunca dejaron de fallar.

---

Dashboard de Horizon: en verde. Workers: sanos. Redis: creciendo despacio. Sin alertas, sin errores en los logs. Solo una acumulación silenciosa de jobs que seguían intentándolo, una y otra y otra vez.

Solo me di cuenta porque la memoria de Redis no volvió a bajar después de arreglar la configuración de SMTP. Algo seguía ahí dentro, masticando reintentos. Miles de ellos.

---

Di por hecho que la cola se encargaría. Ese es el trato: un job falla, reintenta unas cuantas veces, aterriza en `failed_jobs`. Sigues adelante.

A menos que el job sea un Mailable.

Cuando despachas un Mailable a una cola, Laravel lo envuelve en un job. El `maxTries` de ese job viene de la propiedad `$tries` del Mailable. Si no la defines —y por qué lo harías, la documentación apenas la menciona—, se serializa como `null`.

Null no significa "usa el valor por defecto del supervisor". Null significa "sin límite". Horizon ve null y piensa: este job quiere reintentar para siempre. Así que lo hace.

---

Resulta que es un bug conocido. <a href="https://github.com/laravel/horizon/issues/1346" target="_blank" rel="noopener noreferrer">Laravel Horizon issue #1346</a>. El flag `--tries` del supervisor se ignora cuando el payload serializado del job lleva `maxTries: null`. La propia declaración del job gana, y su declaración dice: nunca pares.

Veintinueve clases Mailable. Cada una sin una propiedad `$tries` explícita. Cada una potencialmente inmortal.

---

El arreglo es casi insultante en su simplicidad:

```php
class WelcomeEmail extends Mailable implements ShouldQueue
{
    public int $tries = 2;
    public int $maxExceptions = 2;
}
```

Dos propiedades. Veintinueve archivos. Eso es todo.

Un intento inicial, un reintento, y luego `failed_jobs`. Tal como siempre supuse que funcionaba.

---

Lo pruebo como probarías una ratonera. Rompo la configuración de SMTP a propósito. Despacho un email. Observo Horizon. Dos intentos. Job fallido. Listo. Sin fantasmas en la cola.

Después arreglo los otros veintiocho.

---

Tres lecciones, condensadas:

1. **Null no es "por defecto".** En los payloads serializados de un job, un maxTries en null significa ilimitado. La configuración de tu supervisor es una sugerencia, no una regla.
2. **Los dashboards en verde mienten.** Horizon mostraba workers sanos procesando alegremente jobs que nunca terminarían.
3. **Los valores por defecto de un framework no siempre son sensatos.** Laravel no establece `$tries` en los Mailables. Tienes que hacerlo tú. La documentación no te avisará hasta que ya tengas un incendio.

Los bugs que más asustan son los que parecen una operación normal. Este lo parecía, durante semanas.
