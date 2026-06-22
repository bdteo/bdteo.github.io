Representaciones discretas en RL: por qué deberían importarles a los ingenieros

[conversational tone] Un sistema de IA nunca ve "el mundo". Ve la representación que le damos.

Eso suena a detalle de investigación hasta que te muerde en producción. Tu agente recibe una captura de pantalla del navegador, pero la policy no actúa directamente sobre píxeles. Tu LLM recibe texto, pero el modelo no lee palabras como las lees tú. Tu robot registra valores continuos de sensores, pero su planner necesita algo lo bastante estable como para comparar, recordar, predecir y mejorar.

La pregunta de ingeniería es directa: ¿dejas que el modelo viva en una sopa continua de decimales, o fuerzas partes de su mundo a entrar en un conjunto finito de símbolos, buckets, tokens, categorías o codebook entries?

Esa es la forma práctica de la pregunta sobre las representaciones discretas.

El tema me llamó la atención originalmente por el trabajo de Edan Meyer sobre aprendizaje por refuerzo, especialmente el artículo Harnessing Discrete Representations for Continual Reinforcement Learning, publicado más tarde en el Reinforcement Learning Journal. El artículo es técnico, pero la lección es maravillosamente usable: a veces un modelo aprende más rápido, se adapta mejor y construye un mejor world model cuando tiene que describir observaciones usando un vocabulario pequeño de estados posibles.

Esa idea no está atrapada dentro de la RL. Rima con la tokenization en los LLM, la vector quantization en modelos generativos, los learned codebooks en compresión y la forma en que los agent systems necesitan cada vez más un estado interno compacto en lugar de un contexto bruto interminable.

Para un ingeniero en activo, el punto es este: la representación no es solo un paso de preprocessing. Es donde decides qué tipo de errores puede permitirse tu sistema.

[matter-of-fact] Una representación continua dice: esta cosa es un punto en un espacio suave.

Una representación discreta dice: esta cosa pertenece a una o más opciones nombradas de un conjunto finito.

Ninguna es automáticamente mejor. Un vector continuo es expresivo. Puede llevar gradients, matices, interpolaciones y detalles finos. Por eso los embeddings son tan útiles. Pero los espacios continuos también pueden ser blandos. Cambios numéricos diminutos pueden significar algo, o no. Vectores que parecen similares pueden esconder situaciones causales distintas. Un modelo aguas abajo tiene que aprender no solo qué importa, sino también dónde están los límites.

Una representación discreta dibuja límites.

Convierte la pregunta de "¿qué vector exacto con valores reales viene después?" en algo más parecido a "¿qué estado, token o code viene después?" Eso cambia el problema de aprendizaje. La predicción puede convertirse en classification en vez de regression. La memoria puede volverse lo bastante symbolic como para reutilizarse. La compresión se vuelve explícita. Un planner puede razonar sobre un conjunto más pequeño de posibilidades.

Por eso un modelo de lenguaje no opera sobre ensayos Unicode en bruto como un flujo indiferenciado. Opera sobre token IDs. Por eso importan SentencePiece y los tokenizers de estilo byte-pair. Por eso VQ-VAE fue interesante: mostró que los learned discrete codes pueden ser un bottleneck potente para imágenes, audio y habla. Y por eso la RL con world models vuelve una y otra vez a los categorical latents y los codebooks.

El modelo no solo está aprendiendo una tarea. Está aprendiendo un vocabulario para la tarea.

[deliberate] Imagina un agente que aprende a jugar un juego sencillo a partir de observaciones de pantalla.

Un estado latente continuo podría codificar la pantalla como una lista de decimales: cero punto trece, menos cero punto setenta y dos, uno punto ochenta y cuatro, cero punto cero cuatro, y así sucesivamente.

Ese vector puede representar mucho. Pero si el agente intenta aprender transitions, el modelo debe predecir cómo cambian todos esos valores floating-point después de una acción. Es fácil desperdiciar capacidad en detalles que no importan: un píxel que parpadea, un frame de animación apenas distinto, un cambio de color, un poco de ruido visual.

Un estado latente discreto podría codificar la misma situación así: room tres, enemy state alert, key status missing, health bucket low.

O, en un sistema aprendido, podría ser menos legible para humanos: code dieciocho, code cuatro, otra vez code cuatro, code setenta y uno.

Los codes aprendidos quizá no tengan nombres bonitos, pero la restricción es útil. El agente no puede inventar infinitos estados internos sutilmente distintos. Tiene que reutilizar un vocabulario finito. Si el vocabulario es bueno, el modelo obtiene un agarre más limpio sobre la dinámica: cuando estoy en este tipo de situación y tomo ese tipo de acción, estos son los tipos de situaciones siguientes más probables.

Eso es compresión, pero no solo para reducir el tamaño de archivo. Es compresión para aprender.

[reflective] Meyer, Adam White y Marlos Machado estudiaron las representaciones discretas en RL a través de world-model learning, RL model-free y continual RL. El resultado que más me importa no es "discrete beats continuous" como eslogan. Eso sería demasiado pulcro, y la realidad rara vez es tan educada.

La afirmación útil es más estrecha y más interesante.

Cuando el modelo tiene capacidad limitada, las representaciones discretas pueden ayudarle a modelar más del mundo útil. En sus experimentos, los agentes que usaban estas representaciones aprendían mejores policies con menos datos, y en entornos continuos se adaptaban más rápido después de los cambios.

Ese es exactamente el escenario que debería importarles a los ingenieros. Casi siempre estamos limitados por capacidad en algún punto. Tal vez el modelo es pequeño. Tal vez hay pocos datos. Tal vez el entorno cambia. Tal vez los presupuestos de latencia obligan a usar componentes más pequeños. Tal vez la ventana de contexto de un agente está llena de historia irrelevante. Tal vez el mundo es demasiado grande para modelarlo con honestidad, así que el sistema necesita una abstracción con pérdida que pueda seguir reparando.

El artículo también contiene una advertencia útil: quizá el beneficio no venga de la discreción como propiedad mágica. Los autores apuntan a la sparsity y la binarity como posibles contribuyentes. En otras palabras, las opciones finitas ayudan en parte porque imponen estructura. Hacen que la representación sea más limpia, más selectiva y más fácil de usar para el learner aguas abajo.

Esa distinción importa. La lección no es cuantizar todo porque suena inteligente. La lección es preguntarte si tu representación está forzando el tipo correcto de simplificación.

[matter-of-fact] Las representaciones discretas solían sonar como una preocupación de nicho en RL. Ahora parecen centrales para la mitad de los sistemas que estamos construyendo.

Los LLM son el ejemplo obvio. Un modelo ve token IDs, no prosa. El tokenizer decide qué piezas de texto se convierten en unidades atómicas. Esa elección afecta el coste, la longitud de contexto, el comportamiento multilingüe, casos límite extraños y a veces el comportamiento de razonamiento. El GPT-2 paper es antiguo según los estándares de hoy, pero ya planteaba el punto práctico: el language modeling se hace sobre secuencias de símbolos. Los sistemas modernos son mucho más grandes, pero el bottleneck simbólico sigue ahí.

Los agent systems tienen el mismo problema en una forma más desordenada. Un agente puede guardar transcripciones brutas para siempre, pero eso suele ser una memoria terrible. Los agentes útiles necesitan estado destilado: tareas abiertas, restricciones conocidas, resultados de herramientas, plan actual, riesgos sin resolver, preferencias del usuario, hechos del entorno. Eso es una representación más o menos discreta de un caos continuo mucho mayor. Dice: estos son los pocos estados que vale la pena llevar hacia adelante.

Los world models hacen la conexión aún más explícita. Un world model intenta aprender un simulador interno compacto: si tomo esta acción desde este estado, ¿qué pasa después? DreamerV3 es un hito moderno aquí, al mostrar lo potente que puede ser aprender comportamiento imaginando trayectorias futuras dentro de un modelo aprendido. Trabajos más recientes sobre discrete codebook world models for continuous control siguen explorando cómo los discrete codebooks pueden ayudar incluso cuando el problema de control externo es continuo.

La compresión es el cuarto hermano silencioso. Cuando comprimes, eliges qué diferencias ignorar. Un codebook es un contrato: muchas entradas brutas se mapean al mismo código interno porque, para el propósito en cuestión, están lo bastante cerca. Eso también es lo que hacen las buenas abstracciones en software. Colapsan variación irrelevante para que el resto del sistema pueda razonar.

El patrón está en todas partes. En un LLM, los bytes y caracteres de texto se convierten en tokens, que dan al modelo unidades de secuencia previsibles y un vocabulario acotado. En un agente de RL, los píxeles o flujos de sensores pueden convertirse en estado latente categórico, lo que hace más limpias las transitions y más fácil el planning. En un world model, el historial del entorno puede convertirse en learned codes, dando al sistema un simulador interno más pequeño con menos detalle irrelevante. En la memoria de un agente, las transcripciones completas y los logs de herramientas pueden convertirse en resúmenes de tarea y estado, dando al modelo contexto duradero sin ahogarlo. En compresión, las imágenes, el audio y el video se convierten en codebook entries, preservando estructura útil mientras descartan ruido.

Por eso el tema reaparece con nombres distintos. Tokenization, quantization, bucketing, classification, learned codebooks, symbolic state, sparse binary features: no son idénticos, pero todos hacen la misma pregunta de ingeniería.

¿Cuáles son las unidades de pensamiento?

[deliberate] Las representaciones discretas son potentes porque tiran información.

Por eso también son peligrosas.

Un mal tokenizer mutila un idioma. Un mal esquema de bucketing borra la señal que necesitabas. Un mal learned codebook mapea dos estados significativamente distintos al mismo code y enseña a la policy la lección equivocada. Una memoria de agente discreta puede volverse confiadamente con pérdida, conservando un resumen limpio mientras suelta el único detalle incómodo que importaba.

Las representaciones continuas fallan de otra forma. A menudo conservan demasiado. Permiten que el modelo lleve información sutil hacia adelante, pero el learner aguas abajo tiene que descubrir qué dimensiones importan. Pueden ser flexibles, pero resbaladizas.

Así que la elección práctica no es "¿discreto o continuo?" Es: ¿dónde necesito smoothness? ¿Dónde necesito categorías estables? ¿Dónde el ruido se está haciendo pasar por información? ¿Dónde está desperdiciando capacidad el modelo en variación irrelevante? ¿Dónde haría un vocabulario finito que la predicción, el planning o el debugging fueran más fáciles?

Si no puedes responder esas preguntas, la discreción puede convertirse en decoración. Si puedes responderlas, se convierte en una herramienta de diseño.

[matter-of-fact] Este es el marco de decisión que yo usaría de verdad.

Usa una representación discreta cuando el sistema necesite reconocer repetidamente el mismo tipo de situación bajo variaciones superficiales ruidosas. Game states, UI states, workflow statuses, failure classes, customer intents, document chunks, tool outcomes y environment modes encajan todos en este patrón.

Usa una representación discreta cuando el siguiente modelo esté mejor planteado como classification que como regression. Predecir "¿qué modo viene después?" puede ser más fácil y robusto que predecir un estado floating-point exacto, especialmente cuando el futuro es multimodal.

Usa una representación discreta cuando necesites una memoria duradera. Los agentes no necesitan recordar cada token de cada observación. Necesitan un estado compacto que sobreviva lo suficiente como para guiar la siguiente acción.

Ten cuidado con las representaciones discretas cuando el límite es arbitrario. Si dos estados están separados solo porque tu implementación necesitaba un bucket, el modelo puede heredar esa falsa distinción. El mismo problema aparece todo el tiempo en dashboards de analítica: un umbral de métrica se convierte en un campo de distorsión de la realidad.

Ten todavía más cuidado cuando el caso raro importa. La compresión discreta es excelente conservando la estructura común. Puede ser brutal con las excepciones. En sistemas de safety, fraud, medical, legal, financial o security, el tiny detail puede ser el punto entero.

[reflective] Hay un olor que ahora noto más a menudo: el modelo técnicamente ve todo, pero no puede usar lo que ve.

Lo ves cuando un agente tiene una massive context window pero aun así pierde el hilo. Lo ves cuando una policy tiene observaciones high-dimensional pero no puede adaptarse tras un pequeño cambio de entorno. Lo ves cuando un classifier recibe embeddings más ricos pero falla en variantes out-of-distribution simples. Lo ves cuando un world model predice una papilla plausible en lugar de próximos estados útiles.

En esos momentos, añadir capacidad podría ayudar. Más datos podrían ayudar. Un modelo más grande podría ayudar.

Pero a veces la pieza que falta es un mejor bottleneck.

El sistema necesita verse obligado a decir: esto va con aquello, esta diferencia no importa, este estado ya ocurrió antes, esta acción cambió la categoría, esta es la parte que vale la pena recordar.

Ese es el valor real de las representaciones discretas. Hacen posible la reutilización.

[calm] Me gusta el trabajo de Meyer porque no trata la representación como un adorno filosófico. Pone la elección bajo presión experimental. ¿Qué tan bien aprende el world model? ¿Cuántos datos necesita la policy? ¿Qué pasa cuando el entorno cambia? ¿Sobrevive la ventaja cuando pasamos de una configuración limpia al continual learning?

Esas son las preguntas correctas.

También me gusta que la respuesta no sea caricaturescamente simple. El artículo no demuestra que todos los discrete latents sean buenos. Sugiere que las representaciones discretas útiles hacen varias cosas a la vez: reducen demandas de capacidad, estructuran la predicción, fomentan la sparsity y dan al learner agarres más limpios para adaptarse.

Eso también suena cierto en la ingeniería ordinaria.

Los buenos sistemas no son realidad bruta hasta el fondo. Tienen interfaces elegidas con cuidado. Tienen enums. Tienen states. Tienen event types. Tienen schemas. Tienen IDs. Tienen summaries. Tienen nombres útiles y con pérdida para situaciones recurrentes.

Los sistemas de machine learning necesitan la misma disciplina. La diferencia es que algunas interfaces se aprenden en lugar de escribirse a mano.

[reflective] Las representaciones discretas importan porque la inteligencia no consiste solo en tener un modelo potente. También consiste en darle al modelo unidades útiles con las que pensar.

Para RL, eso puede significar world models que aprenden transitions más útiles con menos capacidad, y agentes que se adaptan más rápido cuando el mundo cambia. Para los LLM, aparece en la tokenization y la gestión de contexto. Para los agentes, aparece en la memoria, el estado de planning y los rastros de tool-use. Para la compresión y los modelos generativos, aparece en codebooks que preservan la estructura que vale la pena conservar.

La lección práctica es simple.

Cuando un sistema tenga dificultades, no preguntes solo si el modelo es lo bastante grande. Pregunta si su representación es lo bastante amable.

¿Colapsa el ruido? ¿Preserva las distinciones que importan? ¿Hace que la siguiente predicción sea más fácil? ¿Le da al agente un vocabulario reutilizable para el mundo?

Si la respuesta es sí, la discreción no es una limitación. Es un asa.
