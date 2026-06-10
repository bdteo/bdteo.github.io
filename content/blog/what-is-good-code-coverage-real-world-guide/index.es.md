---
lang: "es"
translationOf: "what-is-good-code-coverage-real-world-guide"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "0490cb5e588445c4"
title: "¿Qué es una “buena” cobertura de código? Una guía del mundo real"
date: "2025-07-15"
description: "Desmontando el mito del 100 %: desgloso objetivos de cobertura comprobados para TypeScript y PHP, muestro el ROI de las pruebas y comparto trucos de herramientas que uso a diario."
tags: ["code-coverage", "testing", "typescript", "php", "best-practices", "quality-assurance"]
featuredImage: "./images/featured.jpg"
imageCaption: "80 % de cobertura ≠ 80 % de calidad — aquí está el porqué"
---

# ¿Qué es una “buena” cobertura de código? Mi guía del mundo real para frenar los bugs sin desperdiciar tiempo de ingeniería

Cada vez que ejecuto `npm run coverage` o `phpunit --coverage`, surge la misma pregunta:

> _“Vale… 74 %. ¿Es suficiente?”_

La blogósfera del desarrollo de software grita “¡100 % o nada!”. Mientras tanto, <a href="https://launchdarkly.com/blog/code-coverage-what-it-is-and-why-it-matters/" target="_blank">launchdarkly.com</a> me recuerda con educación que 100 % ejecutado ≠ 100 % probado.  
He pasado semanas persiguiendo la métrica reluciente y más semanas depurando _otros_ problemas. Este es el punto medio, probado en el campo, en el que me he quedado.

---

## Por qué el 100 % de cobertura es un espejismo

En teoría, el 100 % de líneas ejecutadas significa “no hay bugs ocultos”. En la práctica:

* Rendimientos decrecientes: pasar de 90 % a 95 % a menudo duplica tu suite de pruebas para reducir el riesgo en un solo dígito.  
* Falsa confianza: una prueba que llama a una función sin una aserción **igual cuenta** como cubierta.  
* Realidad del negocio: cada prueba extra es tiempo que **no** se dedica a las funciones que tus clientes pidieron.

Los de la industria aeroespacial pueden aspirar al 100 %: es cuestión de vida o muerte. Para el resto de nosotros, **~80 % es la línea del 80/20**. Ahí es donde se agrupan la mayoría de los proyectos tras hacer los cálculos de ROI. <a href="https://www.testdevlab.com/blog/why-is-high-test-coverage-important" target="_blank">testdevlab.com</a> sitúa el rango entre 70 y 90 % por esta misma razón.

---

## La tabla práctica que uso

| Cobertura | Mi traducción | Acción |
|---------|------------------|--------|
| 100 % | “Somos una librería que pilota cohetes” | Acepta la rutina pesada. |
| 90 % + | “Una librería de la que depende mucho dinero” | Solo el módulo de alta prioridad. |
| 80 % | Lánzalo, monitorea y luego itera. |
| 60–70 % | Barrera en el merge: rechaza el PR si el código nuevo te baja de ahí. |
| < 50 % | Un fin de semana de deuda técnica: prioriza primero las rutas críticas. |

Robé estos números de la <a href="https://www.atlassian.com/continuous-delivery/software-testing/code-coverage" target="_blank">guía interna de Atlassian</a>: 60 % “aceptable”, 75 % “encomiable”, 90 % “ejemplar”. Funciona en cada retro.

---

## Cómo llego al 80 % sin llorar (manual de TypeScript)

1. Jest + Istanbul tal como vienen  
2. **Barrera de cobertura en CI**  
   en `jest.config.js` añado:  
   ```js
   coverageThreshold: {
     global: 80,
     '**/src/core/**': 90
   }
   ```  
3. Apunta a las rutas calientes del usuario, no al logger del boilerplate de Redux.

---

## Cómo llego al 80 % en Laravel (manual de PHP)

1. Instala PCOV para velocidad en desarrollo, Xdebug para datos de ramas en CI.  
2. PHPUnit + estos ajustes por defecto en `phpunit.xml`:  
   ```xml
   <filter>
     <whitelist processUncoveredFiles="true">
       <directory suffix=".php">./src</directory>
     </whitelist>
   </filter>
   ```  
3. Puntuación de mutación por encima del conteo de líneas vía <a href="https://infection.github.io/" target="_blank">Infection</a>: así detecto las líneas “cubiertas pero no realmente probadas”.

---

## 4 reglas que mi equipo respeta

1. **Código nuevo = pruebas.** Cobertura del diff ≥ 90 % antes del merge.  
2. **Refactoriza primero, prueba después.** El código que no se puede probar ya es deuda.  
3. **Rompe el build, no a las personas.** Baja la barrera un 5 % cada año en lugar de quebrar equipos con tableros en rojo.  
4. **Mide los bugs en producción**: si la cobertura es del 85 % pero los incidentes se disparan, el culpable no es la **cobertura**, son las **aserciones**.

---

## TL;DR (también para directivos y reclutadores)

No me pidas un “número mágico”. Pregunta:  
> ¿Qué partes del producto no pueden romperse?

Cubre **esas** al 90 %. Dale al resto pruebas de humo decentes. Usa la cobertura de código como un **foco**, no como una línea de meta, y confía en los bugs que **atrapas**, no en los números de los que **presumes**.

Deja que el tablero de cobertura esté verde: tus clientes nunca lo verán, pero su margen de error se mantendrá vacío.  

*— Fin del desahogo, vuelta al editor.*
