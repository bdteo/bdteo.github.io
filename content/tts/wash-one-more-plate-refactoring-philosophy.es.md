[conversational tone] Una filosofía práctica de desarrollo de software inspirada en la Regla del Boy Scout: deja siempre el código más limpio de como lo encontraste; lava un plato más. Descubre por qué importa la microrrefactorización y cómo aplicarla sin descarrilar las entregas.

TL;DR: Trata cada cambio en tu base de código como si cocinaras una comida. Ensuciarás algunos platos. Cuando termines, no laves solo los platos que usaste: lava uno más. Con el tiempo, ese pequeño excedente de cuidado se acumula hasta formar una cocina (base de código) que se mantiene limpia en lugar de degradarse hacia el caos.

[matter-of-fact] La metáfora: cocinar, platos y código

[matter-of-fact] Imagina una cocina profesional. Cada plato que se prepara ensucia unos cuantos platos, incluso en la brigada más ordenada. Ahora imagina que, al terminar su plato, cada cocinero lava exactamente los platos que ensució. La cocina se mantendrá al borde de una limpieza aceptable, pero la entropía se irá colando: un poco de mugre olvidada aquí, una tabla de cortar manchada allá. Tarde o temprano, el desorden se acumula.

Ahora invierte la regla: después de cocinar, cada chef lava un plato más de los que ensució. Poco a poco, la cocina queda más limpia que antes; no solo mantenida, sino mejorada. Lo mismo aplica al software: cada tarea que asumes debería sumar al menos un mínimo excedente de limpieza a la base de código: una prueba más, un nombre más claro, una función dividida, una dependencia muerta eliminada. Ese hábito del "+1 plato" es lo que mantiene sana una base de código.

A esto lo llamo la Regla de Lavar un Plato Más.

[deliberate] Ecos del oficio: estás en buena compañía

Esta no es una filosofía solitaria. Referentes de todo el mundo del software han predicado ideas similares durante décadas:

"Deja siempre el campamento más limpio de como lo encontraste." Esa es la clásica Regla del Boy Scout que Robert C. Martin popularizó en el software. Es el mismo espíritu: mejorar un poco, cada vez. La deuda técnica como metáfora (Ward Cunningham): la deuda genera intereses; ignórala y mañana la "cocina" costará más de usar. Ir pagando una parte sobre la marcha te mantiene solvente. La refactorización como pasos pequeños y continuos (Martin Fowler): cambios diminutos que preservan el comportamiento pero mejoran el diseño. Pasos pequeños significan bajo riesgo e impulso constante. "Hazlo funcionar, hazlo bien, hazlo rápido" (Kent Beck): primero la corrección, luego la limpieza, luego el rendimiento. Lavar ese plato extra vive en la fase de "hazlo bien", antes de optimizar de forma prematura. La teoría de las ventanas rotas aplicada al código (Andrew Hunt y David Thomas): el desorden visible invita a más desorden. Arreglar una "ventana" antes de que se propague protege al vecindario (la base de código).

Estas ideas se refuerzan unas a otras. Todas dicen lo mismo: no pases el desorden hacia adelante; tómate un momento para mejorarlo.

[calm] Por qué importa el plato extra (incluso cuando estás ocupado)

[reflective] 1. La entropía es real

Si lo dejas a su suerte, el código no se mantiene neutro. Los nombres se desvían, los patrones se fragmentan, las abstracciones se pudren. La entropía es una fuerza; la única contrafuerza es el orden constante e incremental. Tu +1 plato es una reversión de la microentropía.

[matter-of-fact] 2. La deuda se acumula más rápido de lo que crees

El costo del cambio crece con cada "ya lo arreglaremos luego". Ese luego casi nunca llega. Los pagos de intereses se manifiestan como trabajo de funcionalidades ralentizado, despliegues frágiles y suites de pruebas en las que nadie confía. Lavar un plato extra hoy reduce la tasa de interés de mañana.

[deliberate] 3. La señal social

Cuando tus compañeros ven que limpias lo tuyo (y algo más), la norma cambia. Se vuelve creíble (y esperado) dejar el código mejor de como lo encontraste. La cultura sigue al comportamiento.

[calm] 4. Impulso, no perfeccionismo

Esto no es una excusa para el yak shaving. No estás reconstruyendo la cocina en plena hora punta. Solo le pasas la esponja a un plato más: algo pequeño, seguro y rápido. Eso es clave para mantener las entregas en marcha.

[reflective] Cómo practicar la Regla de Lavar un Plato Más

Así puedes integrar el hábito sin descarrilar el alcance ni los plazos.

[matter-of-fact] 1. Adopta la "microrrefactorización" como Definición de Hecho

Renombra una variable confusa. Extrae una función pequeña para reducir la complejidad ciclomática. Elimina código muerto o importaciones sin usar. Añade la prueba que faltaba para un error que acabas de corregir. Actualiza la documentación o esa sección del README que te asustó por un momento.

El criterio: si toma más de unos minutos, no es un plato, es todo el lavavajillas. Déjalo para después. Anótalo como un ticket.

[deliberate] 2. Usa los Pull Requests como disparador de limpieza

Cada PR puede dejar el campamento más limpio:

Exige una casilla de "¿Qué limpiaste?" o una nota breve. Anima a los revisores a pedir pequeños arreglos junto con su revisión. Celebra los PR que incluyen ese pulido extra (un reconocimiento en el standup rinde mucho).

[calm] 3. Automatiza los platos fáciles

Hooks de pre-commit para formateo y linting. Análisis estático para señalar métodos complejos o listas de parámetros largas. Verificadores de dependencias para bibliotecas desactualizadas.

Deja que las escobas automáticas barran los desórdenes triviales para que las personas puedan concentrarse en la lógica y el diseño.

[reflective] 4. Intégralo en las normas del equipo

[matter-of-fact] Añade la regla al acuerdo de trabajo o al manual de ingeniería de tu equipo. Registra las victorias de microrrefactorización en las retros si quieres pruebas medibles. Programa de a pares o en grupo de vez en cuando para difundir el hábito (y el coraje).

[matter-of-fact] 5. Sabe cuándo no lavar

A veces la cocina está en llamas: producción está caída o falta unas horas para una demo. En las emergencias, rompe la pila de platos sucios si hace falta. Pero vuelve sobre tus pasos después de la crisis. La regla no es dogma; es disciplina.

[deliberate] El límite: un plato, no el fregadero

La expansión del alcance se disfraza de artesanía. Tu trabajo es detenerte en "un plato más". Si esa pequeña refactorización revela un olor más profundo, anótalo y sigue adelante. Aparca el arreglo más profundo en una lista de pendientes:

Crea un ticket etiquetado como refactor: o techdebt:. Vincúlalo al código, las pruebas o el módulo relevantes. Añade una nota breve sobre por qué importa.

Has cumplido con tu deber: detectaste el desorden, lavaste un plato y dejaste instrucciones para el resto.

[calm] Ejemplo: convertir una función desordenada en una que puedas probar

Antes:

Plato lavado:

Ahora tu función principal llama a vatFor() en lugar de incrustar la lógica. Añadiste una microprueba para vatFor(). Eso es un plato extra: simple, contenido, útil.

[reflective] Reflexiones finales

Un plato más es algo diminuto. Ese es el punto. No necesitas refactorizaciones heroicas para mantener sana una base de código; necesitas una cultura de cuidado pequeño y constante. Conviértelo en un hábito, intégralo en tu proceso y, en un año, te preguntarás por qué tu cocina no es un desastre: porque nunca dejaste que lo fuera.

Llamado a la acción: La próxima vez que toques un archivo, pregúntate: "¿Qué plato extra puedo lavar antes de hacer commit de este cambio?" Y hazlo. Repite. Cambia la cultura, un plato impecable a la vez.

[matter-of-fact] Fuentes y lecturas adicionales

Robert C. Martin ("Uncle Bob") – Regla del Boy Scout: "The Boy Scout Rule" de 97 Things Every Programmer Should Know. Ward Cunningham – Metáfora de la deuda técnica: La explicación original de Cunningham sobre la deuda técnica en el sitio de Martin Fowler. Martin Fowler – Microrrefactorización continua: El libro de Fowler, Refactoring: Improving the Design of Existing Code. Kent Beck – "Hazlo funcionar, hazlo bien, hazlo rápido": Una explicación del mantra por Ron Jeffries. Andrew Hunt y David Thomas – Ventanas rotas en el software: El concepto se detalla en su libro, The Pragmatic Programmer. Entropía y mantenimiento del software: Una buena lectura sobre el tema es "Entropy in Software and the Broken Window Theory".
