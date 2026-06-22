---
lang: "es"
translationOf: "what-is-good-code-coverage-real-world-guide"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "6cc0abbf0fbddc3b"
title: "¿Qué es una buena cobertura de código? Una guía basada en riesgo"
date: "2025-07-15"
description: "Una guía práctica y basada en riesgo sobre cobertura de código: qué probar primero, qué ignorar, cuándo usar branch coverage y mutation testing, y por qué los porcentajes mienten."
tags: ["code-coverage", "testing", "typescript", "php", "best-practices", "quality-assurance"]
featuredImage: "./images/featured.jpg"
imageCaption: "Una buena cobertura es un mapa de riesgo, no un número de trofeo."
audioUrl: "/audio/articles/what-is-good-code-coverage-real-world-guide/es/Qh9qDWKx9XUbnKbERblA-478bbe118375.m4a"
audioDuration: "19:10"
audioVoice: "Gerard (ElevenLabs LatAm Spanish neutral)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/what-is-good-code-coverage-real-world-guide.es.md"
---

# ¿Qué es una buena cobertura de código? Una guía basada en riesgo

Una buena cobertura de código no es 80 %. No es 90 %. No es el brillo sagrado de un dashboard que dice 100 %.

Una buena cobertura de código significa esto:

> Las partes del sistema que más dolerían si se rompieran están cubiertas por pruebas que realmente fallarían cuando esas partes están mal.

Ese es todo el truco. El porcentaje es útil, pero solo después de saber qué tipo de código estás mirando, con qué frecuencia cambia, a quién le duele un bug y si tus pruebas hacen assertions reales o solo pasean por el código con una linterna.

Sigo mirando el número. Me gustan los números. Son buenos para volver visible una ansiedad vaga. Pero ya no pregunto “¿82 % es bueno?” de forma aislada. Hago una pregunta mejor:

> ¿Qué riesgo sigue sin cubrirse, y estamos cómodos enviando ese riesgo?

Esa pregunta funciona para ingenieros que escriben pruebas, leads que fijan barras de calidad y reviewers que intentan decidir si un PR es seguro para merge.

## La respuesta corta

Si necesitas una regla inicial, usa esta:

| Área de código | Buen objetivo de cobertura | Por qué |
| --- | ---: | --- |
| Core domain rules, dinero, permissions, seguridad, rutas de pérdida de datos | 90-100 % de line y branch coverage significativa | Un bug pequeño puede volverse caro, vergonzoso o irreversible. |
| Public libraries, SDKs, reusable packages | 90 %+ más edge cases y compatibility tests | Tus usuarios no pueden inspeccionar tu intención. La API es el producto. |
| Código normal de una aplicación SaaS | 70-85 % overall, más alto en módulos riesgosos | La mayoría de los equipos obtiene mucho valor aquí sin convertir las pruebas en teatro. |
| Legacy systems por debajo de 50 % | No persigas primero el número global | Cubre el código cambiado y los flows peligrosos antes de intentar “arreglar” el dashboard. |
| Generated code, framework glue, debug logging, trivial wrappers | A menudo excluidos o ligeramente smoke-tested | La cobertura aquí puede ser ruidosa y costosa sin reducir mucho riesgo. |

Estos no son números religiosos. Son defaults que esperaría que un equipo discutiera.

[La guía de testing de Google](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html) dice que no existe un número ideal universal, y enmarca la cobertura alrededor de business impact, change frequency, expected lifetime, complexity y domain risk. [Martin Fowler](https://martinfowler.com/bliki/TestCoverage.html) plantea el mismo punto más profundo desde otro ángulo: la cobertura ayuda a encontrar código sin pruebas, pero es una mala declaración independiente sobre la calidad de las pruebas.

Eso coincide con mi experiencia. Una cobertura baja es una alarma de humo. Una cobertura alta no es una garantía.

## Qué puede decirte la cobertura

La cobertura es mejor mostrando ausencia.

Puede decirte:

- Este archivo nunca lo ejercitan pruebas automatizadas.
- Esta error branch nunca se ha ejecutado en CI.
- Esta nueva payment rule se merged sin que ninguna prueba la tocara.
- Este refactor eliminó behavior que ninguna prueba notó.
- Este repository tiene barrios enteros donde los bugs pueden vivir sin pagar renta.

Eso ya es valioso. [El artículo de Google sobre code coverage en Google](https://research.google/pubs/code-coverage-at-google/) encontró que la cobertura es más actionable cuando se muestra a nivel de changesets y code review. Me gusta ese encuadre: la cobertura pertenece cerca del diff, donde una persona puede preguntar: “¿importa esta línea sin cubrir?”

La cobertura es menos útil como executive health score. Un manager que ve “88 %” no puede saber si el 12 % faltante es debug output sin uso o el refund path que decide si los clientes recuperan su dinero.

## Qué no puede demostrar la cobertura

Una línea cubierta no es necesariamente un behavior probado.

La cobertura no puede demostrar que:

- las assertions sean significativas;
- los test data se parezcan a producción;
- el unhappy path se compruebe, no solo se ejecute;
- la UI sea usable;
- la query sea lo bastante rápida;
- el feature flag esté configurado correctamente;
- el concurrent case funcione;
- los mocks sean honestos;
- el código sea suficientemente simple para mantenerlo.

Puedes conseguir 100 % de line coverage con pruebas que llaman funciones y casi no assert nada. También puedes conseguir cobertura alta con end-to-end tests que recorren mucho código de manera incidental mientras apenas comprueban las decisiones importantes.

Por eso un coverage gate nunca debería ser el único quality gate. Combínalo con review, production incidents, property o fuzz tests donde encajen, contract tests alrededor de integrations y mutation testing en código donde correctness realmente importa.

## La regla de decisión que uso en reviews

Cuando reviso un PR, no pido pruebas porque “necesitamos coverage”. Las pido porque algún behavior cambió y quiero evidencia de que ese behavior está protegido.

Mi checklist es corta:

1. **¿Qué puede salir mal?** Nombra el failure mode antes de escribir la prueba.
2. **¿Quién paga por eso?** User, support team, finance, security, data integrity, future developer?
3. **¿Con qué frecuencia cambiará este código?** El código que se toca con frecuencia merece más pruebas porque se romperá más a menudo.
4. **¿Puede una prueba atrapar el failure de forma barata?** Si sí, escríbela. Si no, considera monitoring, manual QA, static analysis o simplificar el diseño.
5. **¿Fallaría la prueba por el bug que tememos?** Si no, probablemente es coverage cosplay.

Ese último punto es el más importante. Una prueba que no falla cuando el código está mal no es una safety net. Es decoración de escenario.

## Qué probar primero

Si un proyecto tiene cobertura débil y todos discuten sobre el target, deja la discusión por una tarde y escribe pruebas en este orden.

### 1. Dinero, permissions y acciones irreversibles

Payments, refunds, billing periods, subscription state, authorization, destructive deletion, email sends, data imports, migrations y cualquier cosa que mute datos propiedad de clientes.

Para una app SaaS, prefiero tener 95 % de coverage en subscription transitions y 55 % overall que 80 % overall con la billing state machine casi desnuda.

### 2. Business rules que la gente explica con “except when”

Estas son pruebas excelentes porque la rareza ya está en el lenguaje.

"A trial can be extended once, except when the account has already paid, unless it was migrated from the legacy plan."

Esa frase quiere pruebas. Varias.

### 3. Parsers, serializers, mappers e importers

La cobertura rinde de maravilla en cualquier lugar donde importa la forma de los datos. CSV imports, webhook payloads, date parsing, currency conversion, address normalization, search indexing, Open Graph extraction, todo eso.

Estas pruebas suelen ser baratas, estables y llenas de edge cases. Obtienes buena protección sin necesitar un browser, un queue worker y media luna.

### 4. Código con branching logic

La line coverage oculta decisiones omitidas. La branch coverage es mejor para conditionals porque pregunta si ambos lados de una decisión se ejecutaron. [La documentación de coverage.py sobre branch coverage](https://coverage.readthedocs.io/en/latest/branch.html) muestra la trampa clásica: la statement coverage puede marcar una función como covered incluso cuando un `if` nunca se evaluó en ambos sentidos.

En PHP, [PHPUnit documenta line, branch y path coverage por separado](https://docs.phpunit.de/en/12.5/code-coverage.html), con branch coverage comprobando si las control structures evaluaron tanto `true` como `false`. El detalle es el costo del tooling: PCOV es rápido para line coverage, mientras que Xdebug se necesita para branch y path coverage. Usa la señal más pesada donde la lógica la merezca.

### 5. Bugs que ya ocurrieron

Cada production bug es una idea de prueba gratis. No siempre un unit test, pero al menos un regression test en algún lugar.

Cuando un bug se escapa, me gusta esta pequeña pregunta de postmortem:

> ¿Qué prueba habría fallado si la hubiéramos escrito ayer?

Si la respuesta es simple, escribe esa prueba antes de seguir.

## Qué ignorar, excluir o despriorizar

Ignorar código no es hacer trampa cuando el equipo está de acuerdo en por qué se ignora.

Buenos candidatos:

- generated code;
- framework bootstrap files;
- one-line configuration wrappers;
- debug-only logging;
- defensive branches que no pueden ocurrir en el runtime actual;
- código que es mejor borrar que probar;
- integration glue ya cubierto por un higher-level smoke test.

Malos candidatos:

- business logic “too hard to test”;
- código viejo que todos tienen miedo de tocar;
- payment, auth, import o permission paths;
- branches que parecen imposibles solo porque nadie revisó production data;
- código oculto detrás de un feature flag pero ya reachable por customers.

Mi regla: si excluimos algo de coverage, la razón debe ser aburrida y defendible en review. “Generated by OpenAPI” es aburrido. “No teníamos ganas de probar checkout” no lo es.

## Ejemplos por tipo de aplicación

### CRUD SaaS

La mayoría de las CRUD apps no necesitan cobertura heroica en cada controller branch. Sí necesitan cobertura fuerte en permissions, validation, state transitions, background jobs, billing, imports, exports y cualquier cosa que pueda corromper customer data.

Una forma saludable podría ser:

- alta unit coverage en domain services y policies;
- integration tests para API endpoints importantes;
- algunos end-to-end smoke tests para signup, checkout, core workflow y cancellation;
- coverage gates sobre changed code, no una exigencia repentina de que toda la legacy app salte a 90 %.

### Frontend Product

En frontend work, la line coverage puede volverse absurda rápido si persigues cada rendering detail. Me importan más los user-visible states:

- loading, empty, error, success;
- disabled y permission-gated actions;
- optimistic updates y rollback;
- forms con validation y server errors;
- accessibility-critical behavior como focus, labels y keyboard paths.

El tono exacto de un borde decorativo no necesita un unit test. El confirmation flow de “delete account” sí.

### Public Library Or SDK

Sube el listón. Tus edge cases son el production outage de otra persona.

Prueba la API documentada, no solo los internals. Incluye compatibility cases, invalid input, error messages, serialization, version boundaries y examples copiados del README. Si un user puede pegarlo, probablemente debería probarse.

### Data Pipeline Or Import System

La cobertura debería inclinarse hacia fixtures e invariants:

- malformed rows;
- missing fields;
- duplicate IDs;
- timezone edges;
- retry e idempotency behavior;
- partial failure handling;
- totales del tipo “this must never decrease”.

Aquí, 75 % de line coverage con fixtures excelentes puede ganar a 95 % de coverage que solo prueba el happy path.

### Infrastructure And DevOps Code

Para Terraform, deployment scripts, queue workers y one-off operational tools, la mejor cobertura puede no ser un porcentaje unitario. Puede ser dry-run mode, shellcheck/static checks, staged rollout, idempotency tests y logging muy claro.

Aun así, si un script calcula qué database rows borrar, prueba ese cálculo como si te debiera dinero.

## Usa diff coverage antes que global coverage

La global coverage mejora lentamente y es fácil de game. La diff coverage es donde los equipos realmente mejoran.

Para código nuevo y cambiado, me gusta una regla más estricta:

- El changed risky code debería estar alrededor de 90 %+ covered.
- El changed trivial code puede estar más bajo si el reviewer puede explicar por qué.
- La overall project coverage no debería caer sin una razón explícita.
- Los legacy files deberían quedar un poco más limpios cada vez que se tocan.

Esta es la versión práctica de la boy-scout rule: no exijas que un equipo arregle cinco años de pruebas faltantes antes de mergear una mejora pequeña, pero no dejes que esa mejora pequeña haga el hueco más profundo.

[Jest soporta thresholds](https://jestjs.io/docs/configuration#coveragethreshold-object) globally, by glob, directory o file, incluidos thresholds separados para branches, functions, lines y statements. Un proyecto TypeScript podría empezar con algo así:

```js
const { defineConfig } = require("jest");

module.exports = defineConfig({
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    "src/billing/**/*.ts": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
});
```

Los números exactos importan menos que la forma: el directory riesgoso tiene una barra más alta que el resto de la app.

Para un proyecto PHP, normalmente quiero line coverage rápida en local y branch/path coverage más profunda solo donde valga la pena. La documentación actual de coverage de PHPUnit es explícita: branch y path coverage requieren Xdebug, mientras que PCOV soporta line coverage. Eso es un trade-off, no una falla moral. El fast feedback gana durante el desarrollo normal; la cobertura más profunda pertenece en CI o en targeted checks cuando la lógica es gnarly.

## Branch Coverage es una mejor pregunta, no una perfecta

La line coverage pregunta:

> ¿Se ejecutó esta línea?

La branch coverage pregunta:

> ¿Cada decisión fue en ambos sentidos?

Esa segunda pregunta suele estar más cerca de lo que queremos decir con “probado”. Pero la branch coverage todavía puede volverse ruidosa. Algunas branches son defensive. Algunas son artifacts of transpilation. Algunas son technically possible pero irrelevant. Algunas son caras de forzar a través de una prueba para muy poco valor.

Así que sí, usa branch coverage para decision-heavy code. Solo no reemplaces un ídolo tosco por otro.

## Mutation Testing: el reality check

El mutation testing cambia tu código de formas pequeñas y comprueba si tus pruebas fallan. Por ejemplo, podría convertir `>` en `>=`, `true` en `false` o `+` en `-`.

Si las pruebas aún pasan, el mutant sobrevivió. Es un insulto útil de la máquina.

Esto atrapa la mentira clásica de coverage: “la línea se ejecutó, pero nadie asserted el behavior”. [La documentación PHP de Infection](https://infection.github.io/guide/) muestra exactamente este tipo de hueco con métricas separadas de mutation score y covered-code mutation score. En JavaScript, [Stryker](https://stryker-mutator.io/docs/) cumple un papel similar. En JVM land, [PIT](https://pitest.org/) es el nombre conocido.

No ejecutaría mutation testing en todas partes el primer día. Puede ser lento y ruidoso. Lo ejecutaría en:

- billing rules;
- permission checks;
- validators;
- calculators;
- parsers;
- código que tiene alta coverage pero sigue produciendo bugs;
- libraries donde API behavior es el producto.

El mutation testing no reemplaza a la coverage. Es la pregunta que haces después de que coverage dice: “sí, las pruebas tocaron esto”. El mutation tool pregunta: “cool, but did they care?”

## Una coverage policy práctica que puedes robar

Si estuviera configurando esto para un equipo hoy, escribiría la policy así:

1. **Coverage se revisa en el diff.** Las uncovered changed lines deben probarse o explicarse.
2. **Los risky modules reciben thresholds explícitos.** Billing, permissions, data integrity y core domain logic tienen barras más altas.
3. **La global coverage no puede caer en silencio.** Las bajadas pequeñas necesitan una razón; las bajadas grandes bloquean el merge.
4. **Generated y framework code pueden excluded.** La exclusión debe ser obvia y documentada.
5. **Branch coverage es obligatoria para decision-heavy code.** Especialmente state machines y conditionals importantes.
6. **Mutation testing es targeted.** Úsalo donde una alta coverage todavía no inspira confianza.
7. **Escaped bugs se convierten en regression tests.** No siempre de inmediato, no siempre en el mismo layer, pero deliberadamente.

Esa policy es más estricta que “80 % or else” y más amable que “100 % or shame”. Más importante todavía, les da a los reviewers una regla de decisión.

## La versión reviewer

Cuando reviso un PR, prefiero dejar este comment:

> This changes the refund eligibility rule, but the uncovered branch is the `trial_was_extended` case. Can we add a regression test for that state?

En lugar de esto:

> Coverage is 78.3%. Please improve.

El primer comment trata de riesgo. El segundo trata del clima.

## La versión lead

Si lideras un equipo, no weaponize la coverage. La gente optimizará para lo que pongas en el scoreboard. Si el scoreboard dice “hit 85 %”, quizá recibas shallow tests que llegan a 85 %.

Usa coverage para iniciar mejores conversaciones:

- ¿Por qué este hot file está uncovered?
- ¿Por qué los production bugs se agrupan en módulos con “good” coverage?
- ¿Nuestras pruebas asserted outcomes o solo snapshots?
- ¿Los integration tests ocultan missing unit coverage?
- ¿Las slow tests hacen que la gente evite ejecutar la suite?
- ¿Este código es hard to test porque el design es muddy?

El regalo oculto de coverage no es el porcentaje. Es la forma en que el uncovered code apunta a design, ownership y risk.

## Entonces, ¿qué es una buena cobertura de código?

Una buena cobertura de código es suficiente coverage para que un error importante probablemente duela en CI antes de dolerle a un user.

Para un product team típico, eso suele significar:

- 70-85 % de overall coverage;
- 90 %+ en critical business logic;
- branch coverage en important decisions;
- diff coverage para changed code;
- mutation testing donde correctness importa;
- intentional exclusions para código que no merece la ceremonia.

Pero la respuesta real sigue basada en riesgo:

> Cubre el código que puede hacerte daño. Cubre el código que cambias con frecuencia. Cubre el behavior que prometiste. Ignora el número solo después de entender qué intenta advertirte.

El dashboard puede estar green y aun así mentir. El trabajo útil es hacer más difícil que el producto les mienta a tus usuarios.
