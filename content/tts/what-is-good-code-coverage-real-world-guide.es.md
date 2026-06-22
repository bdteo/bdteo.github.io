[conversational tone] ¿Qué es una buena cobertura de código? Una guía basada en riesgo.

Una buena cobertura de código no es ochenta por ciento. No es noventa por ciento. No es el brillo sagrado de un dashboard que dice cien por ciento.

Una buena cobertura de código significa esto: las partes del sistema que más dolerían si se rompieran están cubiertas por pruebas que realmente fallarían cuando esas partes están mal.

Ese es todo el truco. El porcentaje es útil, pero solo después de saber qué tipo de código estás mirando, con qué frecuencia cambia, a quién le duele un bug y si tus pruebas hacen assertions reales o solo pasean por el código con una linterna.

[reflective] Sigo mirando el número. Me gustan los números. Son buenos para volver visible una ansiedad vaga. Pero ya no pregunto: "¿ochenta y dos por ciento es bueno?" de forma aislada. Hago una pregunta mejor: ¿qué riesgo sigue sin cubrirse, y estamos cómodos enviando ese riesgo?

Esa pregunta funciona para ingenieros que escriben pruebas, leads que fijan barras de calidad y reviewers que intentan decidir si un P R es seguro para merge.

[matter-of-fact] La respuesta corta es esta.

Para core domain rules, dinero, permissions, seguridad y rutas de pérdida de datos, apunta a noventa a cien por ciento de line y branch coverage significativa. Un bug pequeño puede volverse caro, vergonzoso o irreversible.

Para public libraries, paquetes S D K y reusable packages, apunta a noventa por ciento o más, más edge cases y compatibility tests. Tus usuarios no pueden inspeccionar tu intención. La A P I es el producto.

Para código normal de una aplicación SaaS, setenta a ochenta y cinco por ciento overall puede ser saludable, con cobertura más alta en módulos riesgosos. La mayoría de los equipos obtiene mucho valor aquí sin convertir las pruebas en teatro.

Para legacy systems por debajo de cincuenta por ciento, no persigas primero el número global. Cubre el código cambiado y los flows peligrosos antes de intentar arreglar el dashboard.

Y para generated code, framework glue, debug logging y trivial wrappers, excluirlos o cubrirlos con smoke testing ligero suele estar bien. La cobertura aquí puede ser ruidosa y costosa sin reducir mucho riesgo.

Estos no son números religiosos. Son defaults que esperaría que un equipo discutiera.

La guía de testing de Google dice que no existe un número ideal universal, y enmarca la cobertura alrededor de business impact, change frequency, expected lifetime, complexity y domain risk. Martin Fowler plantea el mismo punto más profundo desde otro ángulo: la cobertura ayuda a encontrar código sin pruebas, pero es una mala declaración independiente sobre la calidad de las pruebas.

[deliberate] Eso coincide con mi experiencia. Una cobertura baja es una alarma de humo. Una cobertura alta no es una garantía.

La cobertura es mejor mostrando ausencia.

Puede decirte que este archivo nunca lo ejercitan pruebas automatizadas. Que esta error branch nunca se ha ejecutado en C I. Que esta nueva payment rule se merged sin que ninguna prueba la tocara. Que este refactor eliminó behavior que ninguna prueba notó. Que este repository tiene barrios enteros donde los bugs pueden vivir sin pagar renta.

Eso ya es valioso. El artículo de Google sobre code coverage en Google encontró que la cobertura es más actionable cuando se muestra a nivel de changesets y code review. Me gusta ese encuadre: la cobertura pertenece cerca del diff, donde una persona puede preguntar: "¿importa esta línea sin cubrir?"

La cobertura es menos útil como executive health score. Un manager que ve ochenta y ocho por ciento no puede saber si el doce por ciento faltante es debug output sin uso o el refund path que decide si los clientes recuperan su dinero.

[matter-of-fact] Una línea cubierta no es necesariamente un behavior probado.

La cobertura no puede demostrar que las assertions sean significativas. No puede demostrar que los test data se parezcan a producción. No puede demostrar que el unhappy path se compruebe, no solo se ejecute. No puede demostrar que la U I sea usable, que la query sea lo bastante rápida, que el feature flag esté configurado correctamente, que el concurrent case funcione, que los mocks sean honestos o que el código sea suficientemente simple para mantenerlo.

Puedes conseguir cien por ciento de line coverage con pruebas que llaman funciones y casi no assert nada. También puedes conseguir cobertura alta con end-to-end tests que recorren mucho código de manera incidental mientras apenas comprueban las decisiones importantes.

Por eso un coverage gate nunca debería ser el único quality gate. Combínalo con review, production incidents, property o fuzz tests donde encajen, contract tests alrededor de integrations y mutation testing en código donde correctness realmente importa.

[conversational tone] Cuando reviso un P R, no pido pruebas porque "necesitamos coverage." Las pido porque algún behavior cambió y quiero evidencia de que ese behavior está protegido.

Mi checklist es corta.

Primero: ¿qué puede salir mal? Nombra el failure mode antes de escribir la prueba.

Segundo: ¿quién paga por eso? User, support team, finance, security, data integrity, future developer?

Tercero: ¿con qué frecuencia cambiará este código? El código que se toca con frecuencia merece más pruebas porque se romperá más a menudo.

Cuarto: ¿puede una prueba atrapar el failure de forma barata? Si sí, escríbela. Si no, considera monitoring, manual Q A, static analysis o simplificar el diseño.

Quinto: ¿fallaría la prueba por el bug que tememos? Si no, probablemente es coverage cosplay.

[deliberate] Ese último punto es el más importante. Una prueba que no falla cuando el código está mal no es una safety net. Es decoración de escenario.

Si un proyecto tiene cobertura débil y todos discuten sobre el target, deja la discusión por una tarde y escribe pruebas en este orden.

Primero, dinero, permissions y acciones irreversibles. Payments, refunds, billing periods, subscription state, authorization, destructive deletion, email sends, data imports, migrations y cualquier cosa que mute datos propiedad de clientes.

Para una app SaaS, prefiero tener noventa y cinco por ciento de coverage en subscription transitions y cincuenta y cinco por ciento overall que ochenta por ciento overall con la billing state machine casi desnuda.

Segundo, business rules que la gente explica con "except when." Estas son pruebas excelentes porque la rareza ya está en el lenguaje.

Por ejemplo: "A trial can be extended once, except when the account has already paid, unless it was migrated from the legacy plan."

Esa frase quiere pruebas. Varias.

Tercero, parsers, serializers, mappers e importers.

La cobertura rinde de maravilla en cualquier lugar donde importa la forma de los datos: C S V imports, webhook payloads, date parsing, currency conversion, address normalization, search indexing, Open Graph extraction, todo eso.

Estas pruebas suelen ser baratas, estables y llenas de edge cases. Obtienes buena protección sin necesitar un browser, un queue worker y media luna.

[matter-of-fact] Cuarto, código con branching logic.

La line coverage oculta decisiones omitidas. La branch coverage es mejor para conditionals porque pregunta si ambos lados de una decisión se ejecutaron.

La documentación de coverage punto P Y sobre branch coverage muestra la trampa clásica: la statement coverage puede marcar una función como covered incluso cuando un if nunca se evaluó en ambos sentidos.

En P H P, PHPUnit documenta line, branch y path coverage por separado, con branch coverage comprobando si las control structures evaluaron tanto true como false. El detalle es el costo del tooling: P C O V es rápido para line coverage, mientras que Xdebug se necesita para branch y path coverage. Usa la señal más pesada donde la lógica la merezca.

Quinto, bugs que ya ocurrieron.

Cada production bug es una idea de prueba gratis. No siempre un unit test, pero al menos un regression test en algún lugar.

Cuando un bug se escapa, me gusta esta pequeña pregunta de postmortem: ¿qué prueba habría fallado si la hubiéramos escrito ayer?

Si la respuesta es simple, escribe esa prueba antes de seguir.

[conversational tone] Ignorar código no es hacer trampa cuando el equipo está de acuerdo en por qué se ignora.

Buenos candidatos incluyen generated code, framework bootstrap files, one-line configuration wrappers, debug-only logging, defensive branches que no pueden ocurrir en el runtime actual, código que es mejor borrar que probar, e integration glue ya cubierto por un higher-level smoke test.

Malos candidatos incluyen business logic "too hard to test", código viejo que todos tienen miedo de tocar, payment, auth, import o permission paths, branches que parecen imposibles solo porque nadie revisó production data, y código oculto detrás de un feature flag pero ya reachable por customers.

Mi regla: si excluimos algo de coverage, la razón debe ser aburrida y defendible en review. "Generated by Open A P I" es aburrido. "No teníamos ganas de probar checkout" no lo es.

[matter-of-fact] Los ejemplos ayudan.

La mayoría de las CRUD apps no necesitan cobertura heroica en cada controller branch. Sí necesitan cobertura fuerte en permissions, validation, state transitions, background jobs, billing, imports, exports y cualquier cosa que pueda corromper customer data.

Una forma saludable podría ser alta unit coverage en domain services y policies, integration tests para A P I endpoints importantes, algunos end-to-end smoke tests para signup, checkout, core workflow y cancellation, y coverage gates sobre changed code, no una exigencia repentina de que toda la legacy app salte a noventa por ciento.

En frontend work, la line coverage puede volverse absurda rápido si persigues cada rendering detail. Me importan más los user-visible states: loading, empty, error, success; disabled y permission-gated actions; optimistic updates y rollback; forms con validation y server errors; accessibility-critical behavior como focus, labels y keyboard paths.

El tono exacto de un borde decorativo no necesita un unit test. El confirmation flow de "delete account" sí.

Para una public library o S D K, sube el listón. Tus edge cases son el production outage de otra persona.

Prueba la A P I documentada, no solo los internals. Incluye compatibility cases, invalid input, error messages, serialization, version boundaries y examples copiados del README. Si un user puede pegarlo, probablemente debería probarse.

Para una data pipeline o import system, la cobertura debería inclinarse hacia fixtures e invariants: malformed rows, missing fields, duplicate I D values, timezone edges, retry e idempotency behavior, partial failure handling y totales del tipo "this must never decrease."

Aquí, setenta y cinco por ciento de line coverage con fixtures excelentes puede ganar a noventa y cinco por ciento de coverage que solo prueba el happy path.

Para Terraform, deployment scripts, queue workers y one-off operational tools, la mejor cobertura puede no ser un porcentaje unitario. Puede ser dry-run mode, shellcheck, static checks, staged rollout, idempotency tests y logging muy claro.

[emphasized] Aun así, si un script calcula qué database rows borrar, prueba ese cálculo como si te debiera dinero.

La global coverage mejora lentamente y es fácil de game. La diff coverage es donde los equipos realmente mejoran.

Para código nuevo y cambiado, me gusta una regla más estricta.

El changed risky code debería estar alrededor de noventa por ciento o más covered. El changed trivial code puede estar más bajo si el reviewer puede explicar por qué. La overall project coverage no debería caer sin una razón explícita. Los legacy files deberían quedar un poco más limpios cada vez que se tocan.

Esta es la versión práctica de la boy-scout rule: no exijas que un equipo arregle cinco años de pruebas faltantes antes de mergear una mejora pequeña, pero no dejes que esa mejora pequeña haga el hueco más profundo.

Jest soporta thresholds globally, by glob, directory o file, incluidos thresholds separados para branches, functions, lines y statements.

Un proyecto TypeScript podría activar coverage, fijar thresholds globales alrededor de setenta para branches, setenta y cinco para functions, y ochenta para lines y statements, y luego fijar el directory de billing en noventa para todo.

Los números exactos importan menos que la forma: el directory riesgoso tiene una barra más alta que el resto de la app.

Para un proyecto P H P, normalmente quiero line coverage rápida en local y branch o path coverage más profunda solo donde valga la pena. La documentación actual de coverage de PHPUnit es explícita: branch y path coverage requieren Xdebug, mientras que P C O V soporta line coverage. Eso es un trade-off, no una falla moral.

[deliberate] El fast feedback gana durante el desarrollo normal. La cobertura más profunda pertenece en C I o en targeted checks cuando la lógica es gnarly.

La line coverage pregunta: ¿se ejecutó esta línea?

La branch coverage pregunta: ¿cada decisión fue en ambos sentidos?

Esa segunda pregunta suele estar más cerca de lo que queremos decir con "probado." Pero la branch coverage todavía puede volverse ruidosa. Algunas branches son defensive. Algunas son artifacts of transpilation. Algunas son technically possible pero irrelevant. Algunas son caras de forzar a través de una prueba para muy poco valor.

Así que sí, usa branch coverage para decision-heavy code. Solo no reemplaces un ídolo tosco por otro.

[conversational tone] El mutation testing cambia tu código de formas pequeñas y comprueba si tus pruebas fallan.

Por ejemplo, podría convertir greater than en greater than or equal, true en false o plus en minus.

Si las pruebas aún pasan, el mutant sobrevivió. Es un insulto útil de la máquina.

Esto atrapa la mentira clásica de coverage: "la línea se ejecutó, pero nadie asserted el behavior." La documentación P H P de Infection muestra exactamente este tipo de hueco con métricas separadas de mutation score y covered-code mutation score. En JavaScript, Stryker cumple un papel similar. En J V M land, PIT es el nombre conocido.

No ejecutaría mutation testing en todas partes el primer día. Puede ser lento y ruidoso. Lo ejecutaría en billing rules, permission checks, validators, calculators, parsers, código que tiene alta coverage pero sigue produciendo bugs, y libraries donde A P I behavior es el producto.

El mutation testing no reemplaza a la coverage. Es la pregunta que haces después de que coverage dice: "sí, las pruebas tocaron esto." El mutation tool pregunta: "cool, but did they care?"

[matter-of-fact] Si estuviera configurando esto para un equipo hoy, escribiría la policy así.

Coverage se revisa en el diff. Las uncovered changed lines deben probarse o explicarse.

Los risky modules reciben thresholds explícitos. Billing, permissions, data integrity y core domain logic tienen barras más altas.

La global coverage no puede caer en silencio. Las bajadas pequeñas necesitan una razón; las bajadas grandes bloquean el merge.

Generated y framework code pueden excluded. La exclusión debe ser obvia y documentada.

Branch coverage es obligatoria para decision-heavy code, especialmente state machines y conditionals importantes.

Mutation testing es targeted. Úsalo donde una alta coverage todavía no inspira confianza.

Escaped bugs se convierten en regression tests. No siempre de inmediato, no siempre en el mismo layer, pero deliberadamente.

Esa policy es más estricta que "ochenta por ciento or else" y más amable que "cien por ciento or shame." Más importante todavía, les da a los reviewers una regla de decisión.

[conversational tone] Cuando reviso un P R, prefiero dejar este comment: "This changes the refund eligibility rule, but the uncovered branch is the trial was extended case. Can we add a regression test for that state?"

En lugar de esto: "Coverage is seventy-eight point three percent. Please improve."

El primer comment trata de riesgo. El segundo trata del clima.

Si lideras un equipo, no weaponize la coverage. La gente optimizará para lo que pongas en el scoreboard. Si el scoreboard dice "hit ochenta y cinco por ciento", quizá recibas shallow tests que llegan a ochenta y cinco por ciento.

Usa coverage para iniciar mejores conversaciones.

¿Por qué este hot file está uncovered? ¿Por qué los production bugs se agrupan en módulos con "good" coverage? ¿Nuestras pruebas asserted outcomes o solo snapshots? ¿Los integration tests ocultan missing unit coverage? ¿Las slow tests hacen que la gente evite ejecutar la suite? ¿Este código es hard to test porque el design es muddy?

El regalo oculto de coverage no es el porcentaje. Es la forma en que el uncovered code apunta a design, ownership y risk.

[deliberate] Entonces, ¿qué es una buena cobertura de código?

Una buena cobertura de código es suficiente coverage para que un error importante probablemente duela en C I antes de dolerle a un user.

Para un product team típico, eso suele significar setenta a ochenta y cinco por ciento de overall coverage; noventa por ciento o más en critical business logic; branch coverage en important decisions; diff coverage para changed code; mutation testing donde correctness importa; e intentional exclusions para código que no merece la ceremonia.

Pero la respuesta real sigue basada en riesgo.

Cubre el código que puede hacerte daño. Cubre el código que cambias con frecuencia. Cubre el behavior que prometiste. Ignora el número solo después de entender qué intenta advertirte.

El dashboard puede estar green y aun así mentir. El trabajo útil es hacer más difícil que el producto les mienta a tus usuarios.
