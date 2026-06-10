[reflective] Hay un tipo de ironía que parece escrita.

Un despliegue en producción tenía que ser aburrido. Ese es el sueño. La lista avanza, la etiqueta aterriza, la migración corre, el panel se mantiene en calma, y nadie aprende un nuevo comportamiento de la base de datos a las cuatro de la tarde.

Este tenía otros planes.

[matter-of-fact] La aplicación dejó de responder con una frase pequeña y brutal:

no healthy upstream.

Nada poético. Nada dramático. Apenas lo justo para que la habitación se hiciera más estrecha.

Pausamos el despliegue y seguimos la espera. Una migración quería cambiar la forma de una tabla. Algo más estaba parado en el umbral.

Al principio busqué la causa dramática. El código nuevo. La migración en sí. El camino que da miedo.

No era ninguno de esos.

[calm] Era un trabajo en segundo plano de lo más normal, disparado por una acción de usuario de lo más normal, manteniendo una transacción de base de datos más ancha de lo necesario. La mayoría de los días eso es apenas una descortesía. El día del despliegue, se volvió arquitectura.

La conexión parecía inactiva. Dormida, técnicamente. No estaba ejecutando ninguna consulta. No estaba ocupada. Solo estaba ahí, sosteniendo todavía un pequeño derecho sobre una tabla que la migración necesitaba.

[slows down] Dormida, pero con la mano en el pomo.

Entonces llegó el chiste.

La acción de usuario que inició el trabajo involucraba una página llamada Cómo se rompen las cosas.

[pause] Por supuesto que sí.

[deadpan] Un despliegue se rompió por culpa de Cómo se rompen las cosas.

Más tarde, cuando el incidente volvió a estar sano, conté las palabras de un borrador anterior de esta historia. Tenía mil ciento noventa y nueve palabras. Busqué el número, sobre todo como broma, y la internet me dijo que el once noventa y nueve significa "el fin de un gran ciclo vital y el comienzo de un nuevo camino."

La banda sonora, naturalmente, era Lorn, Anvil.

[pause] Ridículo.

También exacto.

[reflective] Esa fue toda la lección. Una forma vieja del código había llegado al final de su vida útil. El arreglo no era místico: encoger la transacción, endurecer el camino del despliegue, actualizar el runbook.

Pero aun así.

El software pasa la mayor parte de su vida fingiendo ser lógico, y entonces la realidad presenta un informe de error con un título mejor que el tuyo.

[deliberate] La lección es simple:

Los caminos ordinarios merecen sospecha.

Paranoia no. Sospecha.

El código que la gente usa todos los días es donde se acumulan los compromisos. Se vuelve familiar, y la familiaridad es un sedante.

[slows down] A veces la producción te enseña con fuego.

A veces te enseña con un número, un nombre y un remate.
