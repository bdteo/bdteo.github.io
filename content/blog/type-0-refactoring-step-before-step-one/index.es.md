---
lang: "es"
translationOf: "type-0-refactoring-step-before-step-one"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "16a0b76cc24c4b04"
title: "Refactorización Tipo 0: haz que el código sea comprensible antes de cambiar comportamiento"
date: "2025-12-13T12:00:00.000Z"
description: "La refactorización Tipo 0 es el paso que preserva el comportamiento antes de un cambio real de código: hacer que el código desordenado sea comprensible, testeable y revisable sin teatro de limpieza."
tags: ["refactorización", "ingeniería de software", "debugging", "mantenibilidad"]
featuredImage: "./images/featured.webp"
imageCaption: "Mise en place. El trabajo antes del trabajo."
audioUrl: "/audio/articles/type-0-refactoring-step-before-step-one/es/Qh9qDWKx9XUbnKbERblA-8c084f011c33.m4a"
audioDuration: "17:53"
audioVoice: "Gerard (ElevenLabs LatAm Spanish neutral)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/type-0-refactoring-step-before-step-one.es.md"
---

Hay un tipo de refactorización que los equipos hacen todo el tiempo, normalmente bajo presión, normalmente sin darle nombre.

Abres el archivo donde vive el bug. El método es demasiado largo. Los nombres están cansados. Las ramas se apilan como sillas viejas en un sótano. Puedes sentir físicamente que hacer el cambio pedido dentro de esta forma de código es una mala idea.

Pero no estás listo para rediseñarlo.

No estás intentando introducir una nueva abstracción.

No estás intentando demostrar que eres la persona clean-code de la sala.

Estás intentando hacer que el comportamiento actual sea lo bastante comprensible como para que el siguiente cambio pueda hacerse con seguridad.

A eso lo llamo **refactorización Tipo 0**.

O, de forma menos memorable pero más precisa:

> La refactorización Tipo 0 es la limpieza que preserva el comportamiento y que haces antes de cambiar comportamiento, para que el código se vuelva legible, testeable y revisable.

Es el paso antes del paso uno.

No la remodelación real. Despejar la mesa de trabajo. Etiquetar los cables. El acto de volver legible la cosa antes de meter las manos dentro.

## Por qué el Tipo 0 merece un nombre

[Martin Fowler define la refactorización](https://refactoring.com/) como cambiar la estructura interna del código sin cambiar su comportamiento externo. Esa precisión importa. Si el comportamiento cambia, el trabajo aún puede ser valioso, pero no es refactorización en el sentido estricto.

El Tipo 0 es más estrecho que eso.

La refactorización normal puede mejorar el diseño. El Tipo 0 quizá no.

La refactorización normal puede mover responsabilidades entre clases. El Tipo 0 no debería.

La refactorización normal puede crear mejores límites de dominio. El Tipo 0 se detiene antes: hace que el código existente diga lo que ya hace.

Eso suena modesto hasta que estás mirando un método de 900 líneas durante un hotfix y tu cerebro empieza a hacer buffering.

El problema inmediato en el código feo muchas veces no es la arquitectura. Es la **comprensibilidad**. No puedes cambiar con seguridad lo que no puedes sostener en la cabeza.

El trabajo de Sonar sobre [Cognitive Complexity](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) es útil aquí porque separa “¿cuántos caminos existen?” de “¿qué tan difícil es esto de seguir para un humano?”. El Tipo 0 apunta a la segunda pregunta. Reduce la cantidad de estado, ramificación, ambigüedad de nombres y ruido visual que un reviewer tiene que simular mentalmente.

Eso no es cosmético. Es reducción de riesgo.

## El momento en que el concepto encajó

El nombre salió de un hotfix.

El bug no era intelectualmente profundo. El método que lo rodeaba sí. Era el tipo de método donde cada variable local parecía inocente hasta que te dabas cuenta de que cargaba significado desde tres pantallas atrás. Cada condicional era soportable por separado, pero la combinación hacía que la ruta de ejecución se sintiera inestable.

No necesitaba un diseño hermoso.

Necesitaba depurabilidad:

- menos ramas por pantalla
- nombres que describieran intención de negocio en vez de mecánica temporal
- partes más pequeñas por las que pudiera avanzar paso a paso
- una forma de revisar la limpieza sin revisar también el bug fix

Un LLM sugirió varios “tipos” razonables de refactorización. Extraer este servicio. Introducir aquel patrón. Dividir responsabilidades. Todas buenas ideas. Todas demasiado para ese momento.

Preguntó si debía empezar con el Tipo 1.

Dije: no, empieza con el Tipo 0.

Es decir: antes de mejorar el diseño, haz que el código actual sea legible sin cambiar lo que hace.

Esa distinción salvó el trabajo. El método se volvió navegable. El bug se volvió visible. El arreglo se mantuvo pequeño.

## Una definición de trabajo

**La refactorización Tipo 0 es una pasada acotada, que preserva el comportamiento, y que hace que el código sea más fácil de entender antes de un cambio funcional.**

Tiene cuatro movimientos permitidos:

1. Extraer piezas significativas a métodos o variables locales con nombre.
2. Renombrar cosas para que el código use lenguaje humano en vez de arqueología.
3. Quitar ruido que esté demostrablemente sin uso.
4. Agregar o reforzar characterization tests alrededor del comportamiento que estás por preservar.

Y tiene tres límites estrictos:

- nada de nuevo comportamiento de producto
- nada de movimientos de arquitectura
- nada de mejoras de “ya que estoy aquí” que cambien la pregunta de revisión

Si el PR cambia lo que observan usuarios, callers, jobs, respuestas de API, escrituras en base de datos, eventos emitidos o rutas de error, ya no es Tipo 0. Puede seguir siendo el trabajo correcto, pero hay que nombrarlo con honestidad.

## Antes y después: la forma del Tipo 0

Aquí hay un ejemplo pequeño. Es intencionalmente común. La mayoría de la refactorización útil es común.

Antes:

```ts
export function canStartTrial(account: Account | null, plan: Plan) {
  if (!account || account.deletedAt) {
    return false;
  }

  if (account.flags.includes("trial_blocked")) {
    return false;
  }

  if (account.subscription && account.subscription.status !== "canceled") {
    return false;
  }

  if (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  ) {
    return false;
  }

  if (plan.priceCents === 0 || plan.hidden) {
    return false;
  }

  return true;
}
```

Este código no es terrible. Eso es importante. El Tipo 0 no es solo para desastres.

Pero imagina que necesitas cambiar la elegibilidad de un trial. ¿Qué regla estás cambiando? ¿Cuál es política manual? ¿Cuál es historial de facturación? ¿Cuál es elegibilidad del plan? Un reviewer tiene que inferir todo eso desde la mecánica.

Después de una pasada Tipo 0:

```ts
export function canStartTrial(account: Account | null, plan: Plan) {
  if (isMissingOrDeleted(account)) return false;
  if (isManuallyBlockedFromTrial(account)) return false;
  if (hasActiveSubscription(account)) return false;
  if (hasPaidBeforeOrActiveTrial(account)) return false;
  if (isIneligibleTrialPlan(plan)) return false;

  return true;
}

function isMissingOrDeleted(account: Account | null) {
  return !account || Boolean(account.deletedAt);
}

function isManuallyBlockedFromTrial(account: Account) {
  return account.flags.includes("trial_blocked");
}

function hasActiveSubscription(account: Account) {
  return Boolean(account.subscription && account.subscription.status !== "canceled");
}

function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}

function isIneligibleTrialPlan(plan: Plan) {
  return plan.priceCents === 0 || plan.hidden;
}
```

Esto no es un diseño nuevo. No introduce un policy object. No decide si la elegibilidad de trial pertenece a otro módulo. No vuelve las reglas más elegantes.

Hace una sola cosa: le da nombres al comportamiento existente.

Ahora el siguiente PR puede decir: “Cambia `hasPaidBeforeOrActiveTrial` para que las suscripciones pagadas expiradas se traten de otra manera”, y el reviewer ya no está explorando condicionales anónimos.

Ese es el Tipo 0 haciendo su trabajo.

## La parte peligrosa: incluso “solo extracción” puede cambiar comportamiento

El Tipo 0 suena seguro porque es pequeño. Es más seguro, no seguro por magia.

La extracción puede cambiar comportamiento si eres descuidado con:

- orden de evaluación
- short-circuiting
- alcance de variables
- mutación
- momento de las excepciones
- llamadas repetidas a tiempo, aleatoriedad, IO, cachés o consultas de base de datos
- referencias que antes apuntaban al mismo objeto

Aquí es donde el Tipo 0 necesita disciplina.

No reescribas una condición porque la versión reescrita sea “equivalente”. La equivalencia es donde los bugs se ponen un bigote pequeño y pasan frente a seguridad.

Prefiere esto:

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}
```

En lugar de esto:

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  const paidBefore = account.invoices.some((invoice) => invoice.status === "paid");
  const activeTrial = account.trials.some((trial) => trial.endsAt > new Date());

  return paidBefore || activeTrial;
}
```

La segunda versión se ve mejor, pero ya no preserva el comportamiento de short-circuit. Si `account.invoices` ya demuestra la respuesta, el código anterior nunca tocaba `account.trials` ni `new Date()`. Quizá eso no importe. Quizá sí. El Tipo 0 no le pide al reviewer que adivine.

Cuando tengas duda, extrae primero, embellece después y mantén cada paso lo bastante aburrido como para que un humano cansado pueda verificarlo.

## La red de seguridad: caracterización antes de confianza

Si el código ya está bien testeado, bien. Ejecuta las pruebas enfocadas antes y después de la pasada Tipo 0.

Si no lo está, resiste la tentación de decir: “Esto es solo cleanup”.

Esa frase ha lanzado mil regresiones.

_Working Effectively with Legacy Code_, de Michael Feathers, sigue siendo el libro en el que pienso aquí; la [descripción de O'Reilly](https://www.oreilly.com/library/view/working-effectively-with/0131177052/) lo enmarca alrededor de cambiar sistemas legacy sin reescribir todo. En la práctica, el movimiento útil suele ser un pequeño characterization test: capturar lo que el código hace actualmente para la ruta que estás a punto de tocar.

No lo que debería hacer.

Lo que hace.

Ejemplo:

```ts
it("preserves the current trial eligibility rules for blocked accounts", () => {
  const account = accountFactory({
    flags: ["trial_blocked"],
    subscription: null,
    invoices: [],
    trials: [],
  });

  expect(canStartTrial(account, paidPlan)).toBe(false);
});
```

Ese test puede ser filosóficamente insatisfactorio. Puede codificar comportamiento que planeas cambiar dentro de cinco minutos.

Bien. Bórralo o actualízalo en el PR que cambia el comportamiento.

Para el PR Tipo 0, su trabajo es humilde: demostrar que la limpieza no coló el cambio real.

## Cuándo recurrir al Tipo 0

Usa Tipo 0 cuando el siguiente cambio esté bloqueado por comprensibilidad.

Buenas señales:

- sigues releyendo el mismo método y perdiendo el hilo
- el archivo tiene un método “principal” que mezcla validación, branching, IO, formatting y persistence
- un bug fix de una línea requiere explicar seis hechos no relacionados
- los reviewers siguen discutiendo sobre estilo porque la intención no es visible
- el código es lo bastante correcto para operar el negocio, pero demasiado turbio para cambiarlo con confianza
- necesitas agregar tests, pero la forma actual no te da un lugar limpio para observar comportamiento

Evita Tipo 0 cuando:

- el cambio funcional ya es obvio y seguro
- no puedes explicar exactamente qué comportamiento debe permanecer sin cambios
- la limpieza requiere tocar muchos callers por todo el sistema
- el equipo está intentando colar un rediseño bajo la etiqueta “cleanup”
- no hay un cambio cercano que se beneficie de la claridad

Ese último punto importa. La limpieza sin cliente suele convertirse en gusto. El Tipo 0 tiene un cliente: el siguiente cambio.

## Una regla de decisión para Tipo 0

Esta es la regla que uso:

> Si no puedo escribir el diff que cambia comportamiento de una forma que un reviewer entienda rápido, probablemente necesito Tipo 0 primero.

No siempre. Pero con suficiente frecuencia.

También puedes formularlo como tres preguntas:

1. ¿Qué comportamiento estoy por cambiar?
2. ¿Qué comportamiento actual debe permanecer exactamente igual?
3. ¿Qué pequeña pasada de legibilidad haría que ambas respuestas fueran obvias en el diff?

Si la tercera pregunta tiene una respuesta pequeña, haz Tipo 0.

Si tiene una respuesta enorme, quizá estás mirando una refactorización real, no Tipo 0. Divide el trabajo, haz un plan y deja de fingir que es inofensivo.

## Cómo estructurar el PR

El Tipo 0 funciona mejor cuando se puede revisar como algo propio.

Si la limpieza es diminuta, ponla en el primer commit del PR funcional:

1. `Type 0: name existing trial eligibility checks`
2. `Fix expired subscription trial eligibility`

Si la limpieza es lo bastante grande como para hacer difícil ver el diff de comportamiento, abre un PR separado.

Usa lenguaje de PR aburrido:

```md
This PR is Type 0 only.

Intent:
- make the existing trial eligibility path readable before changing the rules
- preserve current behavior

Changed:
- extracted the top-level eligibility checks into named predicates
- renamed temporary variables to match existing domain terms
- removed one unused private helper

Validation:
- existing eligibility tests pass
- added characterization coverage for blocked, paid-before, and active-trial accounts

Out of scope:
- changing trial eligibility rules
- moving this logic into a policy/service object
```

Esto les da a los reviewers el trabajo correcto.

No están revisando si la lógica de producto es mejor. Están revisando si el código todavía hace lo mismo de forma más legible.

Los buenos comentarios de review para Tipo 0 suenan así:

- “Esta extracción cambia cuándo se evalúa `new Date()`. ¿Podemos mantener el comportamiento antiguo de short-circuit?”
- “El nuevo nombre dice `active subscription`, pero el predicado también trata `past_due` como activo. ¿Puede el nombre reflejar el comportamiento real?”
- “Este helper eliminado parece sin uso en este package, pero ¿está referenciado por reflection/config?”
- “¿Podemos agregar un characterization test para la ruta que expone esta limpieza?”

Los comentarios menos útiles suenan así:

- “¿Podemos convertir esto en una strategy?”
- “Todo este módulo debería ser event-driven.”
- “Ya que estás aquí, ¿puedes arreglar ese edge case raro de billing?”

Puede que sean buenas ideas. No son review de Tipo 0.

## En qué se diferencia el Tipo 0 del teatro de limpieza

El teatro de limpieza es trabajo que parece virtuoso en un diff pero no reduce el riesgo para el siguiente cambio.

Normalmente tiene alguno de estos olores:

- churn amplio de formatting en archivos que nadie está por tocar
- renombres basados en gusto personal en vez de claridad de dominio
- mover código a nuevas abstracciones antes de que alguien pueda enunciar el comportamiento actual
- borrar código “unused” sin probar que el runtime no puede alcanzarlo
- mezclar cleanup con un cambio de comportamiento para que los reviewers no puedan decir qué línea hizo qué
- una descripción de PR que dice “misc cleanup”

El Tipo 0 es diferente porque rinde cuentas.

Dice:

- este es el comportamiento que estamos preservando
- esta es la ruta que estamos haciendo comprensible
- este es el siguiente cambio que esto habilita
- así verificamos que la limpieza no cambió comportamiento

Esa es la diferencia entre ordenar e ingeniería.

## Tipo 0 y legacy seams

A veces el Tipo 0 revela que el siguiente movimiento seguro es una seam.

La nota de Fowler sobre [legacy seams](https://martinfowler.com/bliki/LegacySeam.html) es útil porque describe lugares donde podemos redirigir, observar o testear comportamiento sin editar la fuente en el punto del comportamiento. En un sistema legacy, una seam puede ser la diferencia entre “podemos testear esto” y “estamos esperando con mucha profesionalidad”.

Pero crear una seam puede cruzar el límite del Tipo 0.

Extraer un método para que el flujo actual tenga nombre:

```ts
const shippingCost = await calculateShipping(order);
```

a:

```ts
const shippingCost = await calculateShippingForOrder(order);
```

Eso puede ser Tipo 0 si el comportamiento se mantiene igual.

Cambiar la firma de la función para que los tests puedan inyectar un fake shipping provider:

```ts
const shippingCost = await calculateShippingForOrder(order, shippingProvider);
```

Puede ser el movimiento correcto, pero ya no es solo hacer comprensible el código existente. Cambia la superficie de colaboración. Trátalo como una refactorización que rompe una dependencia y revísalo con ese nivel de cuidado.

El Tipo 0 puede señalar la seam. No tiene que crear toda la arquitectura de testing en el mismo PR.

## Una checklist práctica de Tipo 0

Antes de abrir el PR:

- [ ] Puedo nombrar el trabajo que cambia comportamiento y para el que esta limpieza prepara.
- [ ] El PR no cambia intencionalmente comportamiento visible para usuarios o callers.
- [ ] Los métodos extraídos preservan el orden de evaluación y el comportamiento de short-circuit.
- [ ] Los nombres describen lo que el código realmente hace, no lo que quisiera que hiciera.
- [ ] El código eliminado está probado como unused en el runtime relevante, no simplemente impopular.
- [ ] Ejecuté tests enfocados o reproduje el escenario que importa.
- [ ] Si faltaban tests, agregué cobertura de caracterización para la ruta tocada.
- [ ] La descripción del PR les dice a los reviewers que esto es Tipo 0 y qué queda fuera de alcance.

Durante la review:

- [ ] Preguntar “¿esto preserva comportamiento?” antes de “¿prefiero este diseño?”
- [ ] Mover los cambios de comportamiento a un commit o PR de seguimiento.
- [ ] Mantener las ideas de arquitectura como notas salvo que sean necesarias para la seguridad.
- [ ] Sospechar de la equivalencia clever.

Después del merge:

- [ ] Hacer el cambio real mientras el modelo mental está fresco.
- [ ] Borrar o actualizar characterization tests solo cuando el comportamiento cambie intencionalmente.
- [ ] No dejar que el Tipo 0 se convierta en un estacionamiento para cleanup eterno.

## La promesa

La refactorización Tipo 0 es una pequeña promesa:

> Estoy haciendo que este código sea más fácil de cambiar sin cambiar lo que hace.

Esa promesa es útil precisamente porque es limitada.

Le da al developer permiso para mejorar la superficie de trabajo sin iniciar un debate de arquitectura. Le da al reviewer un estándar claro. Le da al siguiente PR una oportunidad real de tratar sobre el cambio de producto.

A veces, lo más valiente que puedes hacer en una codebase desordenada no es rediseñarla.

A veces es hacer que el desorden actual diga la verdad primero.
