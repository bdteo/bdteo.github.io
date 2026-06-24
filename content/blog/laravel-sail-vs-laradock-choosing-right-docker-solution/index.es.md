---
lang: "es"
translationOf: "laravel-sail-vs-laradock-choosing-right-docker-solution"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "a3219664c049cc89"
title: "Laravel Sail vs Laradock: comparación para devs PHP con Docker"
date: "2024-08-08T12:00:00.000Z"
slug: "laravel-sail-vs-laradock-choosing-right-docker-solution"
description: "Comparación honesta de Laravel Sail, Laradock, Herd y FrankenPHP para el desarrollo en PHP en 2026. Qué configuración de Docker elegir, y cuándo prescindir de Docker por completo."
featuredImage: "./images/featured.jpg"
tags: ["Laravel", "Docker", "PHP", "Laravel Sail", "Laradock", "Laravel Herd", "FrankenPHP", "Entorno de desarrollo", "Docker Compose"]
imageCaption: "Dos ratones de ordenador inalámbricos modernos uno al lado del otro sobre mármol blanco. Elige uno."
audioUrl: "/audio/articles/laravel-sail-vs-laradock-choosing-right-docker-solution/es/Qh9qDWKx9XUbnKbERblA-295211f872a1.m4a"
audioDuration: "9:59"
audioVoice: "Gerard (ElevenLabs LatAm Spanish neutral)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/laravel-sail-vs-laradock-choosing-right-docker-solution.es.md"
---

> **TL;DR:** Para la mayoría de los desarrolladores de Laravel en 2026: usa **Laravel Herd** si quieres cero fricción (nativo, sin Docker, configurado en segundos). Usa **Sail** si tu equipo necesita entornos idénticos o si dependes de servicios como Redis/Meilisearch. Usa **Laradock** si trabajas con varios frameworks de PHP. Usa una configuración de **Docker Compose a medida** si ya te quedaron pequeñas las abstracciones. Y si el rendimiento lo es todo, mira **FrankenPHP + Octane**.

> *Publicado originalmente en agosto de 2024. Actualizado en marzo de 2026 con Laravel 12/Herd/FrankenPHP y el estado actual del ecosistema.*

La pregunta solía ser "¿Sail o Laradock?". Ese planteamiento se queda corto ahora. La verdadera pregunta es: **¿cómo debería configurar mi entorno de desarrollo de Laravel en 2026?** Hay más opciones que nunca, y la mejor elección depende de lo que realmente necesites.

He usado la mayoría de ellas. Actualmente trabajo con una configuración de Docker Compose a medida porque quiero control total sobre mis contenedores, sin abstracciones que escondan lo que pasa. Pero esa es mi preferencia, no una recomendación universal. Déjame repasar lo que te ofrece cada opción.

## Los contendientes

### Laravel Herd

[Herd](https://herd.laravel.com/) es la opción más nueva y, para muchos desarrolladores, la acertada. Es una aplicación nativa (macOS y Windows, todavía no Linux) que te da PHP, Nginx, Node.js y Dnsmasq sin Docker. La versión Pro añade MySQL, PostgreSQL, Redis y herramientas de depuración.

Su gran baza: cambiar de versión de PHP en segundos (de la 7.4 a la 8.4), enrutamiento automático de dominios `*.test` y cero sobrecarga de Docker. Si estás construyendo una app Laravel estándar y no necesitas servicios exóticos, Herd te pone a programar en menos de un minuto.

### Laravel Sail

[Sail](https://laravel.com/docs/12.x/sail) es el entorno de desarrollo oficial de Laravel basado en Docker. Envuelve Docker Compose con una CLI `sail` que abstrae los comandos habituales (`sail up`, `sail artisan`, `sail php`).

A partir de Laravel 12, Sail viene con PHP 8.5 por defecto, usa `compose.yaml` (el nombre de archivo moderno, no `docker-compose.yml`) e incluye Swoole para Octane de fábrica. También permite generar devcontainers con `--devcontainer` para integrarse con VS Code/GitHub Codespaces.

Servicios por defecto: PHP, MySQL, Redis, Meilisearch, Mailpit y Selenium.

### Laradock

[Laradock](https://laradock.io/) es la navaja suiza. Es un entorno Docker de código abierto que admite cualquier proyecto PHP, no solo Laravel. Ofrece más de 70 servicios preconfigurados y puede configurarse para uso en producción.

Sigue activamente mantenido a diciembre de 2025 (actualizaciones recientes de las imágenes de PHP-FPM y workspace). La contrapartida es la complejidad: la configuración lleva más tiempo, implica editar varios archivos y necesitas conocimientos reales de Docker.

### FrankenPHP + Octane

[FrankenPHP](https://frankenphp.dev/) es un servidor de aplicaciones PHP moderno construido sobre Caddy. Combinado con Laravel Octane, logra un tiempo de arranque del framework de entre 4 y 6 ms por petición; un desarrollador informó de que pasó de 7 segundos a 66 ms de latencia al cambiar al modo Worker <small><a href="#ref1">[1]</a></small>.

Laravel Cloud usa FrankenPHP en su runtime de Octane en producción <small><a href="#ref2">[2]</a></small>. La última versión (v1.11.2, febrero de 2026) trajo un CGO un 30 % más rápido y una recolección de basura un 40 % más rápida gracias a Go 1.26.

Esto no es un entorno de desarrollo en el sentido tradicional: es un runtime de PHP de nivel de producción que también puedes usar en desarrollo. Sail incluye integración para ejecutar Octane con FrankenPHP o Swoole.

## Cuándo usar cada uno

Esta es mi opinión honesta, basada en haber usado de verdad estas herramientas:

**Usa Herd si** trabajas en solitario o en un equipo pequeño, construyes apps Laravel estándar y quieres dedicar cero tiempo a la infraestructura. Es el camino más rápido de "tengo una idea" a "estoy escribiendo código". La limitación es que solo funciona en macOS/Windows y la versión gratuita no incluye bases de datos.

**Usa Sail si** tu equipo necesita paridad de entornos, dependes de versiones concretas de servicios (Redis 7, MySQL 8, PostgreSQL 15) o trabajas en una pipeline de CI/CD que necesita Docker. El comando `sail:publish` de Sail te permite personalizar la configuración de Docker cuando se te quedan pequeños los valores por defecto.

**Usa Laradock si** trabajas con varios frameworks de PHP (Symfony, Shopware, PHP a secas), necesitas servicios exóticos (Aerospike, RethinkDB, Manticore) o quieres un único entorno Docker para varios proyectos. La curva de aprendizaje es más pronunciada, pero la flexibilidad no tiene rival.

**Usa una configuración de Docker Compose a medida si** se te han quedado pequeños tanto Sail como Laradock y quieres control total. Esto es lo que hago yo. Mantengo mi propio `compose.yaml` con exactamente los servicios que necesito, sin capa de abstracción, y alias de Docker Compose para que los comandos sean cortos. Cuesta más trabajo al principio, pero no hay magia: todo es explícito.

**Usa FrankenPHP + Octane si** estás construyendo una API de alto rendimiento o tu aplicación es sensible a la latencia. La diferencia de rendimiento no es marginal: es un orden de magnitud. Merece la pena explorarlo aunque uses otra herramienta para el desarrollo general.

## Los detalles que importan

### Tiempo de configuración

| Herramienta | Tiempo hasta la primera petición |
|------|----------------------|
| Herd | Menos de 1 minuto |
| Sail | 5-10 minutos (descarga de imágenes) |
| Compose a medida | 30-60 minutos (configuración inicial) |
| Laradock | 1-2 horas (configuración completa) |

### Personalización

Sail está limitado a propósito. Tienes los servicios que Laravel necesita y poco más. *Puedes* personalizarlo ejecutando `sail:publish` y editando los Dockerfiles, pero en ese punto estás manteniendo una configuración Docker a medida con las abstracciones de Sail encima: lo peor de ambos mundos.

Laradock te lo da todo, pero exige que entiendas lo que estás habilitando. Activar un servicio implica editar `.env` y posiblemente `docker-compose.yml`, y algunos servicios tienen sus propios directorios de configuración.

Compose a medida te da exactamente lo que escribes. Ni más, ni menos.

### Preparación para producción

Sail explícitamente no es para producción. Laradock puede configurarse para producción, pero tienes que saber lo que haces con el endurecimiento de seguridad, los límites de recursos y una red bien planteada. FrankenPHP está listo para producción por diseño: está hecho para eso.

### Soporte multiproyecto

Sail: un proyecto por entorno. Puedes ejecutar varias instancias de Sail, pero se pelearán por los puertos.

Laradock: diseñado para configuraciones multiproyecto. Un entorno, varios proyectos, servicios compartidos.

Compose a medida: lo que tú diseñes. Yo mantengo archivos compose separados por proyecto con definiciones de red compartidas.

## Lo que uso en realidad

Docker Compose a medida. Tengo alias para todo: `dcu` para `docker compose up -d`, `dce` para exec, `dcefpm` para acceder al shell de PHP-FPM, y una función `sail` que descubre automáticamente la raíz del proyecto. La configuración está en mis [notas sobre la evolución de Docker Compose](/docker-compose-major-changes-since-october-2023/).

Empecé con Laradock hace años, me pasé a Sail cuando salió y al final me quedé con una configuración a medida porque quería entender exactamente qué se estaba ejecutando y por qué. Toda abstracción esconde decisiones. A veces eso está bien. A veces esas decisiones ocultas causan problemas difíciles de depurar precisamente porque no puedes verlas.

Dicho esto, si empezara hoy un proyecto Laravel nuevo con un equipo al que no le importan las tripas de Docker, usaría Sail. Y si estuviera guiando a alguien que se inicia en Laravel, le diría que instalara Herd y empezara a escribir código de inmediato.

## Otras opciones que merece la pena mencionar

- **[DDEV](https://ddev.com/)** -- basado en Docker, con buen soporte para Laravel y una hoja de ruta activa para 2026 que prevé integración con Gitpod. Merece la pena evaluarlo si lo usas para otros proyectos de CMS (WordPress, Drupal).
- **[Lando](https://lando.dev/)** -- otra capa de abstracción sobre Docker con un plugin para Laravel (v1.10.0, enero de 2026). Filosofía parecida a la de Sail, pero agnóstica respecto al framework.
- **Valet** -- el predecesor de Herd. Sigue funcionando, pero Herd lo ha superado para la mayoría de los casos de uso.

---

### Referencias

<a id="ref1"></a>1. [Setup and Boost Laravel with FrankenPHP Worker Mode](https://medium.com/@danarcahyaa/setup-and-boost-your-laravel-app-with-frankenphp-worker-mode-c0228f44f71b) -- *Comparación de rendimiento en el mundo real: de 7 s a 66 ms de latencia.*<br>
<a id="ref2"></a>2. [How Laravel Cloud Uses FrankenPHP in Production](https://devconf.net/talk/florian-beer-how-laravel-cloud-uses-frankenphp-in-production) -- *Charla en DevConf sobre el runtime de Octane de Laravel Cloud.*<br>
<a id="ref3"></a>3. [Laravel 12.x Sail Documentation](https://laravel.com/docs/12.x/sail) -- *Documentación oficial de Sail con los cambios de PHP 8.5 y compose.yaml.*<br>
<a id="ref4"></a>4. [Laravel Herd](https://herd.laravel.com/) -- *Sitio oficial del entorno de desarrollo nativo de Laravel.*<br>
<a id="ref5"></a>5. [FrankenPHP v1.11.2 Release](https://laravel-news.com/frankenphp-v1112-released-with-30-faster-cgo-40-faster-gc-and-security-patches) -- *Versión de febrero de 2026 con mejoras de rendimiento y seguridad.*<br>
<a id="ref6"></a>6. [Laradock on GitHub](https://github.com/laradock/laradock) -- *Sigue mantenido, actualizaciones de diciembre de 2025.*<br>
<a id="ref7"></a>7. [The Current State of Local Laravel Development](https://aschmelyun.com/blog/the-current-state-of-local-laravel-development/) -- *Panorama del ecosistema por Andrew Schmelyun.*

---

### Artículos relacionados

- [Docker Compose Evolution: What Changed and Why It Matters](/docker-compose-major-changes-since-october-2023/) -- los cambios en Docker Compose que afectan a todas estas herramientas.
- [PHP 8.5: A Tour of the Incoming Features](/php-8-5-new-features-pipe-operator-guide/) -- lo que llega en la versión de PHP que Laravel 12 usa por defecto.
- [PHP 8.3.6 + IMAP on macOS using phpenv](/installing-php-8-3-6-with-imap-on-macos-using-phpenv/) -- cuando necesitas una configuración de PHP concreta fuera de Docker.
</content>
</invoke>
