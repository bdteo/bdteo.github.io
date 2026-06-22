[matter-of-fact] La opción nuclear para borrados masivos: truncate y reinserción en MySQL e InnoDB.

Necesitas borrar millones de filas de una tabla MySQL.

El primer impulso honesto es simple: hacer un delete en la tabla grande donde la fila sea anterior a tu cutoff.

Entonces la consulta tarda lo suficiente como para que te conviertas en otra persona.

Así que haces lo responsable. Borras diez mil filas a la vez. Ordenas por id. Repites hasta terminar. Añades una pausa. Vigilas las réplicas. Esperas que la historia de los bloqueos siga siendo aburrida.

Esa suele ser la respuesta correcta.

[flatly] Pero si estás borrando la mayor parte de la tabla, un borrado fila por fila no es noble. Solo es caro.

Hay otro movimiento: no borres lo que no quieres. Conserva lo que quieres, reconstruye la tabla y sigue adelante.

Esa es la opción nuclear: copiar las filas que vas a conservar, hacer truncate de la tabla y luego reinsertar esas filas.

Es rápida porque cambia la unidad de trabajo. Dejas de pagar por cada fila borrada y empiezas a pagar por cada fila conservada.

[deliberate] También es peligrosa porque truncate no es un delete educado. En MySQL tiene sabor a D D L. Hace commit implícito. Reinicia auto increment. Omite los triggers on delete. Y tiene consecuencias reales para claves foráneas y replicación.

Precisamente por eso merece un runbook serio, no un snippet ingenioso pegado en producción a las dos de la mañana.

Esta es la forma de decisión.

Un delete simple encaja cuando borras una porción pequeña e indexada. Normalmente puede ejecutarse online, y puede ser transaccional si la transacción se mantiene sensata. Pero en volúmenes enormes se paga cada índice afectado, cada undo log, cada redo log y cada entrada de binlog.

Un delete por lotes encaja cuando necesitas ritmo para un sistema vivo y puedes tolerar una tarea más larga. Cada lote puede hacer commit de forma independiente. Puedes pausar y reanudar. Pero sigue siendo fila por fila, y aún puede crear retraso en réplicas.

El drop o truncate de partición encaja cuando las filas caen limpiamente dentro de particiones completas. Es la versión adulta de la limpieza por retención. La trampa es que el límite de la partición tiene que coincidir con la regla. Los límites no perdonan el optimismo.

El intercambio de tabla es útil cuando puedes construir una tabla de reemplazo y renombrarla atómicamente en su sitio. La ventana de intercambio es corta, pero la fase de copia todavía necesita un plan para escrituras, triggers, grants, claves foráneas y supuestos de la aplicación.

Y truncate más reinserción encaja cuando borras casi todo y puedes pausar escrituras. La tabla está vacía entre el truncate y el restore, y la historia de rollback no es amable.

[reflective] Mi regla práctica es esta: si borras menos del cincuenta por ciento, empieza con delete indexado o delete por lotes. Si borras entre cincuenta y ochenta por ciento, mide delete por lotes frente a enfoques de rebuild. Si borras más del ochenta por ciento, considera seriamente preserve-and-rebuild.

El porcentaje no es magia. Borrar el treinta por ciento de una tabla con índices horribles todavía puede doler. Borrar el noventa por ciento de una tabla pequeña quizá no merezca ceremonia.

La pregunta real es: ¿qué lado de los datos es más pequeño y más seguro de operar?

¿Por qué duele un delete masivo en InnoDB?

Porque InnoDB no mira tu cláusula where, suspira con nostalgia y elimina un rango de bytes del disco.

Tiene que encontrar filas mediante un índice o escanear demasiado. Tiene que bloquear registros, y a veces gaps, a lo largo de los rangos de índice escaneados. Tiene que mantener cada índice secundario afectado. Escribe undo para que el delete pueda revertirse. Escribe redo para que funcione la recuperación ante fallos. Escribe binary logs para que la replicación y la recuperación tengan historia. Y deja trabajo de purge para que InnoDB lo limpie cuando las versiones antiguas ya no sean visibles.

[matter-of-fact] El detalle incómodo es que delete bloquea los registros de índice que escanea, no solo las filas que tu modelo mental cree que coincidieron.

Los deletes por lotes reducen el radio de explosión haciendo que cada transacción sea más pequeña. Borra un número limitado de filas anteriores al cutoff, ordenadas por id, y repite. Eso da tiempo a las réplicas para respirar. Te permite parar. Evita que el undo se convierta en una transacción enorme.

Pero no cambia el modelo básico de coste. Sigues borrando fila por fila.

Truncate cambia ese modelo porque MySQL trata truncate table más como soltar y recrear la tabla que como borrar cada fila. Evita el camino normal de borrado D M L, provoca un commit implícito, no puede revertirse como una sentencia D M L normal y no dispara triggers on delete.

Así que en vez de borrar ochenta millones de filas y conservar veinte millones, copias veinte millones de filas, vacías la tabla rápidamente y vuelves a insertar veinte millones de filas.

[deadpan] Ese es todo el truco. Los detalles de implementación son donde están enterradas las minas.

La versión más segura empieza con el conjunto que vas a conservar.

No: borrar todo lo anterior a X.

Sino: después de esta operación, la tabla contiene exactamente las filas que coinciden con Y.

Ese encuadre importa porque las filas conservadas se convierten en tu ancla de recuperación.

Congela los valores volátiles antes de medir nada. Si el cutoff es primero de enero, fíjalo una sola vez y reutiliza ese valor exacto. Luego cuenta filas totales, filas a conservar y filas a borrar en la misma consulta de preflight.

Después, revisa la ruta de acceso. Haz explain de la consulta que encuentra las filas a conservar. Si MySQL necesita hacer un full table scan sobre una tabla que todavía recibe escrituras, detente y diseña bien la ventana de mantenimiento. La opción nuclear no sustituye saber cómo se accede a la tabla.

[deliberate] Antes de tocar producción, quiero cinco verificaciones.

Primero, confirmar las relaciones de claves foráneas. Encuentra las tablas hijas que referencian la tabla que quieres vaciar. Si otras tablas la referencian, no desactives alegremente foreign key checks esperando lo mejor. MySQL no valida las filas existentes cuando vuelves a activar los checks. Eso es útil para recargas controladas. Como gesto vago de confianza, da miedo.

Segundo, revisar triggers. Si los delete triggers escriben filas de auditoría, limpian cachés, actualizan rollups o notifican a otros sistemas, truncate los evita. Eso es exactamente lo que quieres, o exactamente cómo creas un incidente muy silencioso.

Tercero, revisar espacio en disco. Necesitas sitio para las filas conservadas en alguna parte. Si conservas el veinte por ciento de una tabla de quinientos gigabytes, la copia temporal es un objeto real compitiendo por disco e I O reales.

Cuarto, revisar binary logs y réplicas. Truncate se registra para replicación como una sentencia, y la reinserción sigue siendo una escritura grande. Puede ser mucho mejor que registrar millones de deletes por fila, pero no es gratis.

Quinto, tener una ruta de restore que hayas probado de verdad. "Tenemos backups" no es un plan de restore. Ten claro qué backup restaurarías, dónde lo restaurarías y cómo extraerías solo esta tabla si el resultado es incorrecto.

Este es el runbook práctico.

Asume que la tabla puede estar vacía brevemente de forma segura: ninguna tabla hija depende de esas filas mientras corre la operación, las escrituras están pausadas o la aplicación está en modo mantenimiento, la condición de conservación está congelada, los backups son reales y las réplicas se han considerado.

Usa columnas explícitas. Sé que select star parece limpio. También es así como las columnas generadas, las columnas invisibles, el cambio de orden de columnas y las migraciones futuras hacen que tu noche sea más interesante.

Crea una tabla keep con la misma estructura que la tabla fuente. Usa create table like, no create table as select. Inserta las filas que quieres conservar en esa tabla keep, nombrando cada columna de forma explícita y usando el cutoff congelado.

Luego cuenta la copia conservada antes de hacer algo irreversible.

Después llega el punto sin vuelta casual: truncate de la tabla original.

Restaura las filas conservadas en la tabla original con una lista explícita de columnas. Refresca las estadísticas del optimizador. Luego verifica el row count final, la fila más antigua que queda y el estado de la tabla antes de limpiar.

[reflective] Elimina la copia conservada solo después de que la aplicación esté de vuelta, los conteos coincidan y hayas mirado el comportamiento real del producto que depende de esta tabla.

Esa tabla conservada no es desorden durante la operación. Es la cuerda.

También hay una variante con intercambio de tabla cuando la ventana de tabla vacía es inaceptable.

La forma es parecida: crear una tabla nueva como la antigua, insertar las filas que quieres en la tabla nueva, y luego renombrar atómicamente la tabla antigua hacia un lado y la nueva en su lugar.

El rename en sí es atómico. Otras sesiones no ven un par a medio renombrar. Pero no confundas eso con cero downtime.

Si la tabla antigua recibe escrituras mientras la nueva se llena, esas escrituras no se copian mágicamente. Necesitas una pausa de escritura, un plan de captura de delta o una migración online deliberadamente más compleja.

Además, create table like copia atributos de columnas e índices, pero no vuelve seguro cada objeto alrededor. Verifica triggers, claves foráneas, grants, particionado, columnas generadas y supuestos de la aplicación. El nombre de la tabla puede sobrevivir al intercambio. El contexto operativo quizá no.

Si las filas se alinean con particiones, el particionado suele ser la respuesta más limpia. Suelta la partición antigua, o trunca la partición antigua, y sigue adelante.

[matter-of-fact] Esa es la versión adulta del borrado masivo: diseñar la tabla para que los datos antiguos salgan por una puerta en vez de por una trituradora.

La trampa es obvia y aun así dolorosa. El límite de la partición debe coincidir con la regla de retención. Si la condición de limpieza es: borrar cada tarea completada para clientes del plan de facturación antiguo, excepto las que tienen exportaciones sin resolver, el particionado no te rescatará.

Ahora las trampas, sin adornos.

Truncate hace commit implícito. Create table, alter table, drop table y rename table viven en el mismo mundo de commits implícitos. Envolver el runbook en start transaction no lo vuelve reversiblemente seguro. Si tu plan depende de "haremos rollback si se ve mal", no tienes un plan.

Las claves foráneas no son una casilla. Si la tabla es padre, filas hijas en otra parte pueden depender de ella. Si la tabla es hija, el orden de reinserción importa. Si desactivas foreign key checks, MySQL no validará las filas antiguas cuando vuelvas a activarlos.

Los triggers on delete no se disparan. Eso puede ser una ventaja de rendimiento. También puede saltarse auditorías y contadores desnormalizados.

Auto increment se reinicia. Si reinsertas ids explícitos, MySQL a menudo avanza el siguiente valor al ver esos ids, pero aun así lo verifico. Lee el id máximo. Revisa el estado de la tabla. Si el siguiente valor de auto increment es incorrecto, arréglalo deliberadamente. No adivines el número.

Create table as select no es lo mismo que create table like. Lo primero es cómodo, pero no crea automáticamente índices para la tabla nueva, y algunos atributos no se preservan como la gente supone. Para un runbook operativo, prefiero create table like y luego insert con columnas explícitas.

Las restricciones siguen importando después del truncate. Si el conjunto conservado se produce mediante joins, deduplicación, transformaciones o código, valídalo antes del truncate. "Debería estar bien" no es una estrategia de verificación.

Las réplicas todavía pueden retrasarse. Este método puede reducir el trabajo frente a un enorme delete fila por fila, pero las réplicas aún deben aplicar el truncate y la inserción masiva. Vigílalas.

[emphasized] Y la aplicación no debe escribir durante la ventana de copia.

Si copias las filas a conservar a las dos en punto y la aplicación inserta nuevas filas válidas cinco segundos después, esas filas no están en la tabla keep. Un truncate posterior las elimina.

El modo mantenimiento no es solo experiencia de usuario. Es corrección de datos.

Una cautela con forma de Laravel: lo importante no es la facade. Es el límite.

No escondas esto dentro de un helper genérico que acepte nombres de tablas arbitrarios y cadenas where crudas. Los identificadores deben ser constantes de código. La condición de conservación debe venir de código revisado, no de input de usuario. Y las transacciones de base de datos no hacen que el D D L sea rollback-safe en MySQL.

El esqueleto en el que confío se parece más a un command que a una función reutilizable de biblioteca. Crear la tabla keep. Insertar las filas conservadas con un cutoff vinculado. Contar las keep rows. Registrar ese número. Compararlo con el conteo de preflight. Exigir una confirmación explícita del operador. Luego truncate y restore.

[deadpan] Ese paso de confirmación no es teatro. Es la pausa donde detectas: espera, keep rows es once, no once millones.

Esta es la pequeña checklist de las dos de la mañana.

Antes: conocer la condición exacta de conservación. Congelar cualquier cutoff basado en tiempo. Contar filas totales, filas a conservar y filas a borrar. Revisar claves foráneas y triggers. Revisar espacio en disco. Conocer la ruta de backup y restore. Revisar replica lag e implicaciones binlog. Pausar escrituras o tener un plan real de captura de delta.

Durante: crear la tabla keep. Contarla. Comparar el conteo con el número de preflight. Ejecutar el paso irreversible solo después de que los números tengan sentido. Reinsertar con columnas explícitas. Analizar y verificar.

Después: el row count final coincide con el keep count. Las filas de frontera se ven correctas. El comportamiento de la aplicación está verificado, no solo la salida SQL. Las réplicas están al día, o poniéndose al día intencionalmente. La tabla keep se queda hasta que ya no necesitas la cuerda.

No usaría truncate más reinserción si la tabla tiene delete triggers importantes, si las cascadas de claves foráneas son el comportamiento de negocio correcto, si las escrituras no pueden pausarse, si la condición de conservación es difusa, si el borrado es lo bastante pequeño para un delete por lotes, si la tabla ya está particionada en el límite de retención, o si la organización no puede restaurar la tabla cuando el runbook está mal.

Ese último punto es la prueba. Si restaurar la tabla sería caos, no elijas una operación cuyo modo de fallo es: restaurar la tabla.

[reflective] La opción nuclear no es inteligente porque truncate sea rápido. Todo el mundo sabe que truncate es rápido.

La idea útil es decidir qué trabajo quieres que haga la base de datos.

Si estás borrando casi todo, hacer que InnoDB borre cuidadosamente casi todo puede ser la amabilidad equivocada. Conserva lo que importa. Reconstruye alrededor de eso. Verifica como si una versión futura y cansada de ti fuera a leer la salida con un solo ojo abierto.
