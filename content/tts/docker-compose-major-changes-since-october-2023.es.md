[conversational tone] Docker Compose ha cambiado drásticamente: v1 está muerta, el campo version desapareció, el modo watch está listo para producción y hay un CVE crítico que deberías conocer. Actualizado en marzo de 2026.

Resumen: Docker Compose v1 (docker-compose) se eliminó por completo en abril de 2025. El campo version de tu YAML está muerto. La clave x-develop ahora es simplemente develop. El modo watch está listo para producción con initial_sync. Hay un CVE crítico de path traversal (CVE-2025-62725) si usas include con artefactos OCI: actualiza a v2.40.2+. Y sí, Compose saltó de la v2 a la v5. Los detalles, abajo.

Publicado originalmente en noviembre de 2024. Actualizado en marzo de 2026 con Compose v5, CVE-2025-62725, la eliminación de la v1 y nuevas funciones de la especificación.

[reflective] Si llevas un tiempo usando Docker Compose, probablemente hayas notado cosas que se rompen o cambian bajo tus pies. Los últimos dos años han sido la evolución más agresiva que Compose ha atravesado nunca, y no todo fue evidente.

Uso Compose a diario. La mayoría de mis entornos de desarrollo corren sobre él. Cuando algo cambia, lo noto. Esto es lo que realmente importa.

[matter-of-fact] Lo que se rompió

[deliberate] docker-compose está muerto

No está obsoleto. No está en modo de mantenimiento. Está muerto. El binario independiente docker-compose (la v1 basada en Python) se eliminó de los runners de GitHub Actions y de las imágenes oficiales de Docker en abril de 2025. Si tus pipelines de CI/CD todavía hacen referencia a docker-compose con guion, están rotos o a punto de estarlo.

El docker compose basado en Go (v2, ahora v5) ha sido la implementación real desde 2022. La CLI de la v1 estaba conectada a soporte vital por compatibilidad. Ese soporte vital terminó.

[calm] El campo version desapareció

[calm] Deja de poner version: "3.8" al principio de tus archivos de Compose. No hace nada. Se ignora desde la v2 y ahora está oficialmente obsoleto. Los archivos de Compose modernos empiezan con services:.

Si ves version: en un tutorial, ese tutorial está desactualizado.

[reflective] Otras obsolescencias

links: usa redes de Docker. Los links son legado desde que se lanzó Compose v2. container_name: deja que Docker gestione los nombres. Los nombres fijados a mano rompen el escalado y provocan conflictos. Sintaxis corta de volúmenes para montajes complejos: usa la sintaxis larga con type, source, target.

[matter-of-fact] Lo nuevo y realmente útil

[deliberate] Modo watch (ahora listo para producción)

Esta es la mayor mejora de calidad de vida en años. La sección develop (antes x-develop: quita el prefijo x-, ya no es experimental) te permite definir reglas de vigilancia de archivos que sincronizan o reconstruyen automáticamente cuando los archivos cambian:

[deliberate] Hay tres acciones disponibles (desde la v2.32.0): sync: copia los archivos modificados dentro del contenedor sin reconstruir restart: reinicia el servicio cuando los archivos cambian rebuild: dispara una reconstrucción completa

Desde septiembre de 2025 también existe initial_sync: sincroniza todos los archivos de inmediato al iniciar docker compose watch, así no tienes que esperar al primer cambio para que se dispare la sincronización. Esto fue un punto de fricción durante mucho tiempo.

Se acabaron las reconstrucciones manuales durante el desarrollo. Esto cambió mi flujo de trabajo de verdad.

[calm] Include con artefactos OCI

La directiva include ahora puede traer fragmentos de Compose desde registros OCI:

También hay soporte experimental para repositorios Git. Esto resulta útil para compartir definiciones de servicios comunes entre proyectos: configuraciones de bases de datos, stacks de monitoreo, etc.

Pero lee primero la sección de seguridad de abajo. Hay un CVE.

[reflective] Soporte de GPU

El passthrough de GPU quedó más limpio. Ahora hay una sintaxis más corta gpus: (v2.30.0+) junto al enfoque verboso deploy.resources.reservations.devices. El soporte para GPU de AMD se integró oficialmente en 2025: ya no es solo NVIDIA.

[matter-of-fact] Elemento models

La especificación de Compose ahora incluye un elemento models para definir modelos de IA/ML como artefactos OCI. Puedes empaquetar LLM y runtimes de inferencia directamente en tu configuración de Compose. Es de nicho, pero interesante si haces trabajo de IA local.

[deliberate] Mejores dependencias

Las condiciones de depends_on se han vuelto más flexibles:

Las opciones restart: true y required: false son realmente útiles para entornos de desarrollo local resilientes.

[calm] Lo que deberías saber

[reflective] CVE-2025-62725: path traversal en include

Si usas la directiva include con artefactos OCI, actualiza de inmediato a v2.40.2 o posterior. Una vulnerabilidad de path traversal permite que un atacante escape del directorio de caché durante la resolución del artefacto. Incluso un docker compose ps de aspecto inocente puede dispararla si tu archivo de Compose incluye una referencia OCI maliciosa.

Docker lo parcheó con una comprobación validatePathInBase(), pero necesitas estar en la versión corregida.

[matter-of-fact] Compose v5

Docker saltó de la v2 a la v5 (omitiendo la 3 y la 4 para evitar la confusión con las antiguas versiones del formato de archivo). Funcionalmente, la v5 es igual a las últimas versiones de la v2, pero incluye un SDK oficial de Go para acceso programático, lo que significa que puedes incrustar la funcionalidad de Compose directamente en aplicaciones de Go sin invocar la CLI.

Comprueba tu versión:

[deliberate] Bake es la herramienta de build por defecto

Docker Bake (vía BuildKit) es ahora la opción por defecto para docker compose build. Maneja builds multi-target, compilación multiplataforma y estrategias de caché avanzadas mejor que el builder heredado. Si todavía no le has echado un vistazo a los archivos docker-bake.hcl, vale la pena entenderlos, sobre todo para builds complejos con múltiples servicios.

[calm] Mejoras en healthcheck

El campo start_interval te permite establecer un intervalo de comprobación más rápido durante el periodo de gracia del arranque:

Esto significa que tus servicios dependientes arrancan más rápido sin comprometer los intervalos de health check en producción.

[reflective] Lista de comprobación para la migración

Si no has actualizado tu configuración de Compose en un tiempo:

[deliberate] Elimina version: de todos los archivos de Compose. Reemplaza docker-compose por docker compose en todos los scripts y configuraciones de CI. Renombra x-develop a develop en las configuraciones de watch. Actualiza a v2.40.2+ si usas include (CVE-2025-62725). Reemplaza links por redes de Docker si por algún motivo todavía los usas. Prueba tu CI: GitHub Actions actualizó los runners a Compose v2.40.3 en febrero de 2026.
