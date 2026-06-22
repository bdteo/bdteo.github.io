[reflective] Refactorización tipo cero: haz que el código sea comprensible antes de cambiar comportamiento.

Hay un tipo de refactorización que los equipos hacen todo el tiempo, normalmente bajo presión, normalmente sin darle nombre.

Abres el archivo donde vive el bug. El método es demasiado largo. Los nombres están cansados. Las ramas se apilan como sillas viejas en un sótano. Puedes sentir físicamente que hacer el cambio pedido dentro de esta forma de código es una mala idea.

Pero no estás listo para rediseñarlo. No estás intentando introducir una nueva abstracción. No estás intentando demostrar que eres la persona clean-code de la sala.

[calm] Estás intentando hacer que el comportamiento actual sea lo bastante comprensible como para que el siguiente cambio pueda hacerse con seguridad.

A eso lo llamo refactorización tipo cero.

O, de forma menos memorable pero más precisa: la refactorización tipo cero es la limpieza que preserva el comportamiento y que haces antes de cambiar comportamiento, para que el código se vuelva legible, testeable y revisable.

Es el paso antes del paso uno.

No la remodelación real. Despejar la mesa de trabajo. Etiquetar los cables. El acto de volver legible la cosa antes de meter las manos dentro.

[deliberate] Por qué el tipo cero merece un nombre.

Martin Fowler define la refactorización como cambiar la estructura interna del código sin cambiar su comportamiento externo. Esa precisión importa. Si el comportamiento cambia, el trabajo aún puede ser valioso, pero no es refactorización en el sentido estricto.

El tipo cero es más estrecho que eso.

La refactorización normal puede mejorar el diseño. El tipo cero quizá no. La refactorización normal puede mover responsabilidades entre clases. El tipo cero no debería. La refactorización normal puede crear mejores límites de dominio. El tipo cero se detiene antes: hace que el código existente diga lo que ya hace.

Eso suena modesto hasta que estás mirando un método de novecientas líneas durante un hotfix y tu cerebro empieza a hacer buffering.

[matter-of-fact] El problema inmediato en el código feo muchas veces no es la arquitectura. Es la comprensibilidad. No puedes cambiar con seguridad lo que no puedes sostener en la cabeza.

El trabajo de Sonar sobre Cognitive Complexity es útil aquí porque separa "¿cuántos caminos existen?" de "¿qué tan difícil es esto de seguir para un humano?" El tipo cero apunta a la segunda pregunta. Reduce la cantidad de estado, ramificación, ambigüedad de nombres y ruido visual que quien revisa tiene que simular mentalmente.

Eso no es cosmético. Es reducción de riesgo.

[reflective] El nombre salió de un hotfix.

El bug no era intelectualmente profundo. El método que lo rodeaba sí. Era el tipo de método donde cada variable local parecía inocente hasta que te dabas cuenta de que cargaba significado desde tres pantallas atrás. Cada condicional era soportable por separado, pero la combinación hacía que la ruta de ejecución se sintiera inestable.

No necesitaba un diseño hermoso. Necesitaba depurabilidad.

Necesitaba menos ramas por pantalla. Necesitaba nombres que describieran intención de negocio en vez de mecánica temporal. Necesitaba partes más pequeñas por las que pudiera avanzar paso a paso. Y necesitaba una forma de revisar la limpieza sin revisar también el bug fix.

Un LLM sugirió varios tipos razonables de refactorización. Extraer este servicio. Introducir aquel patrón. Dividir responsabilidades. Todas buenas ideas. Todas demasiado para ese momento.

Preguntó si debía empezar con el tipo uno.

[emphasized] Dije: no, empieza con el tipo cero.

Es decir: antes de mejorar el diseño, haz que el código actual sea legible sin cambiar lo que hace.

Esa distinción salvó el trabajo. El método se volvió navegable. El bug se volvió visible. El arreglo se mantuvo pequeño.

[deliberate] Una definición de trabajo.

La refactorización tipo cero es una pasada acotada, que preserva el comportamiento, y que hace que el código sea más fácil de entender antes de un cambio funcional.

Tiene cuatro movimientos permitidos.

Primero, extraer piezas significativas a métodos o variables locales con nombre. Segundo, renombrar cosas para que el código use lenguaje humano en vez de arqueología. Tercero, quitar ruido que esté demostrablemente sin uso. Cuarto, agregar o reforzar characterization tests alrededor del comportamiento que estás por preservar.

Y tiene tres límites estrictos: nada de nuevo comportamiento de producto, nada de movimientos de arquitectura, y nada de mejoras de "ya que estoy aquí" que cambien la pregunta de revisión.

Si el pull request cambia lo que observan usuarios, callers, jobs, respuestas de API, escrituras en base de datos, eventos emitidos o rutas de error, ya no es tipo cero. Puede seguir siendo el trabajo correcto, pero hay que nombrarlo con honestidad.

[conversational tone] Aquí hay un ejemplo pequeño de antes y después. Es intencionalmente común. La mayoría de la refactorización útil es común.

Imagina una función que decide si una cuenta puede iniciar un trial. En la versión original, una sola función verifica cinco cosas inline. Devuelve false si la cuenta falta o fue eliminada. Devuelve false si la cuenta tiene un flag trial blocked. Devuelve false si hay una suscripción activa. Devuelve false si la cuenta ya pagó antes o ya tiene un trial activo. Devuelve false si el plan es gratuito o está oculto. Si no, devuelve true.

Este código no es terrible. Eso es importante. El tipo cero no es solo para desastres.

Pero imagina que necesitas cambiar la elegibilidad de un trial. ¿Qué regla estás cambiando? ¿Cuál es política manual? ¿Cuál es historial de facturación? ¿Cuál es elegibilidad del plan? Quien revisa tiene que inferir todo eso desde la mecánica.

Después de una pasada tipo cero, la función de alto nivel todavía verifica las mismas cosas, en el mismo orden, pero cada condición tiene un nombre. ¿La cuenta falta o está eliminada? ¿Está bloqueada manualmente para trial? ¿Tiene una suscripción activa? ¿Pagó antes o tiene un trial activo? ¿El plan no es elegible para trial?

[matter-of-fact] Esto no es un diseño nuevo. No introduce un policy object. No decide si la elegibilidad de trial pertenece a otro módulo. No vuelve las reglas más elegantes.

Hace una sola cosa: le da nombres al comportamiento existente.

Ahora el siguiente pull request puede decir: "Cambia la regla paid-before-or-active-trial para que las suscripciones pagadas expiradas se traten de otra manera", y quien revisa ya no está explorando condicionales anónimos.

Ese es el tipo cero haciendo su trabajo.

[deliberate] La parte peligrosa es que incluso "solo extracción" puede cambiar comportamiento.

El tipo cero suena seguro porque es pequeño. Es más seguro, no seguro por magia.

La extracción puede cambiar comportamiento si eres descuidado con el orden de evaluación, el short-circuiting, el alcance de variables, la mutación, el momento de las excepciones, las llamadas repetidas a tiempo, valores aleatorios, entrada y salida, cachés, consultas de base de datos, o referencias que antes apuntaban al mismo objeto.

Aquí es donde el tipo cero necesita disciplina.

No reescribas una condición porque la versión reescrita sea "equivalente". La equivalencia es donde los bugs se ponen un bigote pequeño y pasan frente a seguridad.

En el ejemplo del trial, mantén la verificación de factura pagada y la verificación de trial activo en una sola expresión con short-circuit si eso hacía el código anterior. No calcules por adelantado una variable paid-before y una variable active-trial solo porque se ve mejor. La segunda versión toca la colección de trials y llama al reloj incluso cuando la verificación de facturas ya demostró la respuesta.

Quizá eso no importe. Quizá sí. El tipo cero no le pide a quien revisa que adivine.

Cuando tengas duda, extrae primero, embellece después y mantén cada paso lo bastante aburrido como para que un humano cansado pueda verificarlo.

[reflective] La red de seguridad es caracterización antes de confianza.

Si el código ya está bien testeado, bien. Ejecuta las pruebas enfocadas antes y después de la pasada tipo cero.

Si no lo está, resiste la tentación de decir: "Esto es solo cleanup."

Esa frase ha lanzado mil regresiones.

Working Effectively with Legacy Code, de Michael Feathers, sigue siendo el libro en el que pienso aquí. En la práctica, el movimiento útil suele ser un pequeño characterization test: capturar lo que el código hace actualmente para la ruta que estás a punto de tocar.

No lo que debería hacer. Lo que hace.

Por ejemplo, si las cuentas bloqueadas actualmente no pueden iniciar un trial, escribe un test enfocado que construya una cuenta bloqueada y confirme que la verificación de trial devuelve false.

Ese test puede ser filosóficamente insatisfactorio. Puede codificar comportamiento que planeas cambiar dentro de cinco minutos.

Bien. Bórralo o actualízalo en el pull request que cambia el comportamiento.

Para el pull request tipo cero, su trabajo es humilde: demostrar que la limpieza no coló el cambio real.

[matter-of-fact] Usa tipo cero cuando el siguiente cambio esté bloqueado por comprensibilidad.

Úsalo cuando sigues releyendo el mismo método y perdiendo el hilo. Úsalo cuando el archivo tiene un método principal que mezcla validación, branching, entrada y salida, formatting y persistence. Úsalo cuando un bug fix de una línea requiere explicar seis hechos no relacionados. Úsalo cuando los reviewers siguen discutiendo sobre estilo porque la intención no es visible. Úsalo cuando el código es lo bastante correcto para operar el negocio, pero demasiado turbio para cambiarlo con confianza. Úsalo cuando necesitas agregar tests, pero la forma actual no te da un lugar limpio para observar comportamiento.

Evita tipo cero cuando el cambio funcional ya es obvio y seguro. Evítalo cuando no puedes explicar exactamente qué comportamiento debe permanecer sin cambios. Evítalo cuando la limpieza requiere tocar muchos callers por todo el sistema. Evítalo cuando el equipo está intentando colar un rediseño bajo la etiqueta cleanup. Y evítalo cuando no hay un cambio cercano que se beneficie de la claridad.

Ese último punto importa. La limpieza sin cliente suele convertirse en gusto. El tipo cero tiene un cliente: el siguiente cambio.

[deliberate] Esta es la regla que uso.

Si no puedo escribir el diff que cambia comportamiento de una forma que quien revisa entienda rápido, probablemente necesito tipo cero primero.

No siempre. Pero con suficiente frecuencia.

También puedes formularlo como tres preguntas.

¿Qué comportamiento estoy por cambiar? ¿Qué comportamiento actual debe permanecer exactamente igual? ¿Qué pequeña pasada de legibilidad haría que ambas respuestas fueran obvias en el diff?

Si la tercera pregunta tiene una respuesta pequeña, haz tipo cero.

Si tiene una respuesta enorme, quizá estás mirando una refactorización real, no tipo cero. Divide el trabajo, haz un plan y deja de fingir que es inofensivo.

[conversational tone] El tipo cero funciona mejor cuando se puede revisar como algo propio.

Si la limpieza es diminuta, ponla en el primer commit del pull request funcional. Por ejemplo: primero, "Type Zero: name existing trial eligibility checks." Segundo, "Fix expired subscription trial eligibility."

Si la limpieza es lo bastante grande como para hacer difícil ver el diff de comportamiento, abre un pull request separado.

Usa lenguaje de pull request aburrido. Di que el pull request es solo tipo cero. Di que la intención es hacer legible la ruta existente antes de cambiar las reglas, preservando el comportamiento actual. Di qué cambió: se extrajeron las verificaciones de elegibilidad de alto nivel, las variables temporales se renombraron para coincidir con términos de dominio, y se eliminó un helper privado sin uso. Di cómo se validó: las pruebas existentes pasan, y se agregó cobertura de caracterización para cuentas bloqueadas, cuentas que ya pagaron, y cuentas con trial activo. Di qué queda fuera de alcance: cambiar las reglas de trial o mover la lógica a un policy object.

Esto les da a los reviewers el trabajo correcto.

No están revisando si la lógica de producto es mejor. Están revisando si el código todavía hace lo mismo de forma más legible.

Los buenos comentarios de review para tipo cero suenan así: esta extracción cambia cuándo se llama al reloj; ¿podemos mantener el comportamiento antiguo de short-circuit? El nuevo nombre dice active subscription, pero el predicado también trata past-due como activo; ¿puede el nombre reflejar el comportamiento real? Este helper eliminado parece sin uso en este package, pero ¿está referenciado por reflection o config? ¿Podemos agregar un characterization test para la ruta que expone esta limpieza?

Los comentarios menos útiles suenan así: ¿podemos convertir esto en una strategy? Todo este módulo debería ser event-driven. ¿Ya que estás aquí, puedes arreglar ese edge case raro de billing?

Puede que sean buenas ideas. No son review de tipo cero.

[matter-of-fact] El teatro de limpieza es trabajo que parece virtuoso en un diff pero no reduce el riesgo para el siguiente cambio.

Normalmente tiene alguno de estos olores: churn amplio de formatting en archivos que nadie está por tocar pronto; renombres basados en gusto personal en vez de claridad de dominio; mover código a nuevas abstracciones antes de que alguien pueda enunciar el comportamiento actual; borrar código unused sin probar que el runtime no puede alcanzarlo; mezclar cleanup con un cambio de comportamiento para que los reviewers no puedan decir qué línea hizo qué; o una descripción de pull request que dice "misc cleanup."

El tipo cero es diferente porque rinde cuentas.

Dice: este es el comportamiento que estamos preservando. Esta es la ruta que estamos haciendo comprensible. Este es el siguiente cambio que esto habilita. Así verificamos que la limpieza no cambió comportamiento.

Esa es la diferencia entre ordenar e ingeniería.

[reflective] A veces el tipo cero revela que el siguiente movimiento seguro es una seam.

La nota de Fowler sobre legacy seams es útil porque describe lugares donde podemos redirigir, observar o testear comportamiento sin editar la fuente en el punto del comportamiento. En un sistema legacy, una seam puede ser la diferencia entre "podemos testear esto" y "estamos esperando con mucha profesionalidad."

Pero crear una seam puede cruzar el límite del tipo cero.

Renombrar una llamada de cálculo de envío para que el flujo actual tenga un nombre más claro puede ser tipo cero si el comportamiento se mantiene igual.

Cambiar la firma de esa función para que los tests puedan inyectar un fake shipping provider puede ser el movimiento correcto, pero ya no es solo hacer comprensible el código existente. Cambia la superficie de colaboración. Trátalo como una refactorización que rompe una dependencia y revísalo con ese nivel de cuidado.

El tipo cero puede señalar la seam. No tiene que crear toda la arquitectura de testing en el mismo pull request.

[deliberate] Antes de abrir un pull request tipo cero, pasa la checklist práctica en lenguaje simple.

¿Puedo nombrar el trabajo que cambia comportamiento y para el que esta limpieza prepara? ¿El pull request evita cambios intencionales visibles para usuarios o callers? ¿Los métodos extraídos preservan el orden de evaluación y el comportamiento de short-circuit? ¿Los nombres describen lo que el código realmente hace, no lo que quisiera que hiciera? ¿El código eliminado está probado como unused en el runtime relevante, no simplemente impopular? ¿Ejecuté tests enfocados o reproduje el escenario que importa? ¿Si faltaban tests, agregué cobertura de caracterización para la ruta tocada? ¿La descripción del pull request les dice a los reviewers que esto es tipo cero y qué queda fuera de alcance?

Durante la review, pregunta "¿esto preserva comportamiento?" antes de "¿prefiero este diseño?" Mueve los cambios de comportamiento a un commit o pull request de seguimiento. Mantén las ideas de arquitectura como notas salvo que sean necesarias para la seguridad. Sospecha de la equivalencia clever.

Después del merge, haz el cambio real mientras el modelo mental está fresco. Borra o actualiza characterization tests solo cuando el comportamiento cambie intencionalmente. No dejes que el tipo cero se convierta en un estacionamiento para cleanup eterno.

[reflective] La refactorización tipo cero es una pequeña promesa.

Estoy haciendo que este código sea más fácil de cambiar sin cambiar lo que hace.

Esa promesa es útil precisamente porque es limitada.

Le da al developer permiso para mejorar la superficie de trabajo sin iniciar un debate de arquitectura. Le da al reviewer un estándar claro. Le da al siguiente pull request una oportunidad real de tratar sobre el cambio de producto.

A veces, lo más valiente que puedes hacer en una codebase desordenada no es rediseñarla.

[calm] A veces es hacer que el desorden actual diga la verdad primero.
