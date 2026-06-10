---
lang: "es"
translationOf: "docker-compose-major-changes-since-october-2023"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "1e96a25eca95e021"
title: "La evolución de Docker Compose: qué cambió y por qué importa"
date: "2024-11-20T00:00:00.000Z"
slug: "docker-compose-major-changes-since-october-2023"
description: "Docker Compose ha cambiado drásticamente: v1 está muerta, el campo version desapareció, el modo watch está listo para producción y hay un CVE crítico que deberías conocer. Actualizado en marzo de 2026."
featuredImage: "./images/featured.jpg"
tags: ["Docker", "Docker Compose", "DevOps", "Contenedores", "Entorno de desarrollo"]
imageCaption: "Una fila de pequeñas cajas de embalaje de madera en un muelle del puerto al amanecer."
---

> **Resumen:** Docker Compose v1 (`docker-compose`) se eliminó por completo en abril de 2025. El campo `version` de tu YAML está muerto. La clave `x-develop` ahora es simplemente `develop`. El modo watch está listo para producción con `initial_sync`. Hay un CVE crítico de path traversal (CVE-2025-62725) si usas `include` con artefactos OCI: actualiza a v2.40.2+. Y sí, Compose saltó de la v2 a la v5. Los detalles, abajo.

> *Publicado originalmente en noviembre de 2024. Actualizado en marzo de 2026 con Compose v5, CVE-2025-62725, la eliminación de la v1 y nuevas funciones de la especificación.*

Si llevas un tiempo usando Docker Compose, probablemente hayas notado cosas que se rompen o cambian bajo tus pies. Los últimos dos años han sido la evolución más agresiva que Compose ha atravesado nunca, y no todo fue evidente.

Uso Compose a diario. La mayoría de mis [entornos de desarrollo](/laravel-sail-vs-laradock-choosing-right-docker-solution/) corren sobre él. Cuando algo cambia, lo noto. Esto es lo que realmente importa.

## Lo que se rompió

### docker-compose está muerto

No está obsoleto. No está en modo de mantenimiento. **Está muerto.** El binario independiente `docker-compose` (la v1 basada en Python) se eliminó de los runners de GitHub Actions y de las imágenes oficiales de Docker en abril de 2025 <small><a href="#ref1">[1]</a></small>. Si tus pipelines de CI/CD todavía hacen referencia a `docker-compose` con guion, están rotos o a punto de estarlo.

```bash
# This no longer works
docker-compose up -d

# This is the only way now
docker compose up -d
```

El `docker compose` basado en Go (v2, ahora v5) ha sido la implementación real desde 2022. La CLI de la v1 estaba conectada a soporte vital por compatibilidad. Ese soporte vital terminó.

### El campo version desapareció

Deja de poner `version: "3.8"` al principio de tus archivos de Compose. No hace nada. Se ignora desde la v2 y ahora está oficialmente obsoleto. Los archivos de Compose modernos empiezan con `services:`.

```yaml
# Stop doing this
version: "3.8"
services:
  web:
    image: nginx

# Just do this
services:
  web:
    image: nginx
```

Si ves `version:` en un tutorial, ese tutorial está desactualizado.

### Otras obsolescencias

- **`links`**: usa redes de Docker. Los links son legado desde que se lanzó Compose v2.
- **`container_name`**: deja que Docker gestione los nombres. Los nombres fijados a mano rompen el escalado y provocan conflictos.
- **Sintaxis corta de volúmenes para montajes complejos**: usa la sintaxis larga con `type`, `source`, `target`.

## Lo nuevo y realmente útil

### Modo watch (ahora listo para producción)

Esta es la mayor mejora de calidad de vida en años. La sección `develop` (antes `x-develop`: quita el prefijo `x-`, ya no es experimental) te permite definir reglas de vigilancia de archivos que sincronizan o reconstruyen automáticamente cuando los archivos cambian:

```yaml
services:
  web:
    build: .
    develop:
      watch:
        - path: ./src
          action: sync
          target: /app/src
        - path: ./package.json
          action: rebuild
```

Hay tres acciones disponibles (desde la v2.32.0):
- **`sync`**: copia los archivos modificados dentro del contenedor sin reconstruir
- **`restart`**: reinicia el servicio cuando los archivos cambian
- **`rebuild`**: dispara una reconstrucción completa

Desde septiembre de 2025 también existe **`initial_sync`**: sincroniza todos los archivos de inmediato al iniciar `docker compose watch`, así no tienes que esperar al primer cambio para que se dispare la sincronización. Esto fue un punto de fricción durante mucho tiempo.

```bash
docker compose watch
```

Se acabaron las reconstrucciones manuales durante el desarrollo. Esto cambió mi flujo de trabajo de verdad.

### Include con artefactos OCI

La directiva `include` ahora puede traer fragmentos de Compose desde registros OCI:

```yaml
include:
  - oci://docker.io/username/my-compose-fragment:latest
```

También hay soporte experimental para repositorios Git. Esto resulta útil para compartir definiciones de servicios comunes entre proyectos: configuraciones de bases de datos, stacks de monitoreo, etc.

**Pero lee primero la sección de seguridad de abajo.** Hay un CVE.

### Soporte de GPU

El passthrough de GPU quedó más limpio. Ahora hay una sintaxis más corta `gpus:` (v2.30.0+) junto al enfoque verboso `deploy.resources.reservations.devices`. El soporte para GPU de AMD se integró oficialmente en 2025: ya no es solo NVIDIA.

### Elemento models

La especificación de Compose ahora incluye un elemento `models` para definir modelos de IA/ML como artefactos OCI. Puedes empaquetar LLM y runtimes de inferencia directamente en tu configuración de Compose. Es de nicho, pero interesante si haces trabajo de IA local.

### Mejores dependencias

Las condiciones de `depends_on` se han vuelto más flexibles:

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy
        restart: true      # restart web if db restarts
        required: false     # web can start even if db isn't ready
```

Las opciones `restart: true` y `required: false` son realmente útiles para entornos de desarrollo local resilientes.

## Lo que deberías saber

### CVE-2025-62725: path traversal en include

Si usas la directiva `include` con artefactos OCI, **actualiza de inmediato a v2.40.2 o posterior** <small><a href="#ref2">[2]</a></small>. Una vulnerabilidad de path traversal permite que un atacante escape del directorio de caché durante la resolución del artefacto. Incluso un `docker compose ps` de aspecto inocente puede dispararla si tu archivo de Compose incluye una referencia OCI maliciosa.

Docker lo parcheó con una comprobación `validatePathInBase()`, pero necesitas estar en la versión corregida.

### Compose v5

Docker saltó de la v2 a la v5 (omitiendo la 3 y la 4 para evitar la confusión con las antiguas versiones del formato de archivo) <small><a href="#ref3">[3]</a></small>. Funcionalmente, la v5 es igual a las últimas versiones de la v2, pero incluye un **SDK oficial de Go** para acceso programático, lo que significa que puedes incrustar la funcionalidad de Compose directamente en aplicaciones de Go sin invocar la CLI.

Comprueba tu versión:

```bash
docker compose version
# Docker Compose version v5.1.0
```

### Bake es la herramienta de build por defecto

Docker Bake (vía BuildKit) es ahora la opción por defecto para `docker compose build`. Maneja builds multi-target, compilación multiplataforma y estrategias de caché avanzadas mejor que el builder heredado. Si todavía no le has echado un vistazo a los archivos `docker-bake.hcl`, vale la pena entenderlos, sobre todo para builds complejos con múltiples servicios.

### Mejoras en healthcheck

El campo `start_interval` te permite establecer un intervalo de comprobación más rápido durante el periodo de gracia del arranque:

```yaml
services:
  db:
    healthcheck:
      test: ["CMD", "pg_isready"]
      start_period: 30s
      start_interval: 2s    # check every 2s during startup
      interval: 30s         # then every 30s after
      retries: 3
```

Esto significa que tus servicios dependientes arrancan más rápido sin comprometer los intervalos de health check en producción.

## Lista de comprobación para la migración

Si no has actualizado tu configuración de Compose en un tiempo:

1. **Elimina `version:`** de todos los archivos de Compose.
2. **Reemplaza `docker-compose`** por `docker compose` en todos los scripts y configuraciones de CI.
3. **Renombra `x-develop`** a `develop`** en las configuraciones de watch.
4. **Actualiza a v2.40.2+** si usas `include` (CVE-2025-62725).
5. **Reemplaza `links`** por redes de Docker si por algún motivo todavía los usas.
6. **Prueba tu CI**: GitHub Actions actualizó los runners a Compose v2.40.3 en febrero de 2026 <small><a href="#ref4">[4]</a></small>.

---

### Referencias

<a id="ref1"></a>1. [Docker Compose v1 removed from runner images (April 2025)](https://github.com/actions/runner-images/issues/9557) -- *Anuncio de GitHub Actions sobre la eliminación de la v1.*<br>
<a id="ref2"></a>2. [CVE-2025-62725: From "docker compose ps" to System Compromise](https://www.imperva.com/blog/cve-2025-62725-from-docker-compose-ps-to-system-compromise/) -- *Análisis detallado de Imperva sobre la vulnerabilidad de path traversal en include.*<br>
<a id="ref3"></a>3. [Docker Compose Releases](https://github.com/docker/compose/releases) -- *Historial oficial de versiones, incluida la v5.*<br>
<a id="ref4"></a>4. [Docker and Docker Compose version upgrades on hosted runners](https://github.blog/changelog/2026-01-30-docker-and-docker-compose-version-upgrades-on-hosted-runners/) -- *Actualización de los runners de GitHub de febrero de 2026.*<br>
<a id="ref5"></a>5. [Compose Specification](https://docs.docker.com/compose/compose-file/) -- *Referencia oficial del archivo de Compose.*<br>
<a id="ref6"></a>6. [Use Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) -- *Documentación del modo watch de Docker.*<br>
<a id="ref7"></a>7. [Enable GPU Support in Docker Compose](https://docs.docker.com/compose/how-tos/gpu-support/) -- *Documentación del passthrough de GPU, incluido el soporte de AMD.*<br>
<a id="ref8"></a>8. [Docker Compose Include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) -- *Directiva include con soporte para OCI y Git.*

---

### Artículos relacionados

- [Laravel Sail vs Laradock: Choosing the Right Docker Solution](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- comparación de entornos de desarrollo PHP basados en Docker.
</parameter>
</invoke>
