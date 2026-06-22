---
lang: "es"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "ab64e631f1cf34f9"
title: "La opción nuclear para borrados masivos: TRUNCATE + reinserción (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "Una guía práctica de decisión para borrados masivos en MySQL/InnoDB: DELETE, DELETE por lotes, drop de partición, intercambio de tabla o TRUNCATE + reinserción."
tags: ["mysql", "innodb", "bases de datos", "rendimiento", "operaciones", "laravel"]
featuredImage: "./images/featured.webp"
imageCaption: "Dos manos levantando un pequeño manojo de ramitas de hierba conservadas por encima de una cesta de tallos podados — guardar lo que importa antes de la barrida."
audioUrl: "/audio/articles/todo-bulk-deletion-nuclear-option/es/Qh9qDWKx9XUbnKbERblA-d2107297c28b.m4a"
audioDuration: "16:45"
audioVoice: "Gerard (ElevenLabs LatAm Spanish neutral)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/todo-bulk-deletion-nuclear-option.es.md"
---

Necesitas borrar millones de filas de una tabla MySQL.

El primer impulso honesto es este:

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01';
```

Entonces la consulta tarda lo suficiente como para que te conviertas en otra persona.

Así que haces lo responsable:

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01'
ORDER BY id
LIMIT 10000;
```

Repetir hasta terminar. Añadir una pausa. Vigilar las réplicas. Esperar que la historia de los bloqueos siga siendo aburrida.

Esa suele ser la respuesta correcta. Pero si estás borrando **la mayor parte** de la tabla, un borrado fila por fila no es noble. Solo es caro.

Hay otro movimiento:

> No borres lo que no quieres. Conserva lo que quieres, reconstruye la tabla y sigue adelante.

Esa es la opción nuclear: **copiar las filas que vas a conservar, hacer `TRUNCATE` y luego reinsertarlas**.

Es rápida porque cambia la unidad de trabajo. Dejas de pagar por cada fila borrada y empiezas a pagar por cada fila conservada.

También es peligrosa porque `TRUNCATE` no es un `DELETE` educado. En MySQL tiene sabor a DDL, hace commit implícito, reinicia `AUTO_INCREMENT`, omite los triggers `ON DELETE` y tiene consecuencias reales para claves foráneas y replicación. Precisamente por eso merece un runbook serio, no un snippet ingenioso pegado en producción a las 2 de la mañana.

## La matriz de decisión

Usa la herramienta contundente solo cuando la forma del problema realmente pide una herramienta contundente.

| Enfoque | Mejor cuando | Disponibilidad | Historia de rollback | Principales trampas |
|---|---|---|---|---|
| `DELETE` simple | Estás borrando una porción pequeña e indexada | Normalmente online, pero los locks aún pueden doler | Transaccional si se mantiene dentro de una transacción sensata | Lento para conjuntos enormes; toca índices; genera trabajo de undo/redo/binlog |
| `DELETE` por lotes | Necesitas ritmo para un sistema vivo y puedes tolerar una tarea más larga | Online si los lotes son pequeños e indexados | Cada lote puede hacer commit de forma independiente | Sigue siendo fila por fila; puede crear retraso en réplicas; requiere bookkeeping para pausar/reanudar |
| Drop/truncate de partición | Las filas encajan limpiamente en particiones completas | Breve ventana DDL | No hay rollback a nivel de fila | Solo funciona si el particionado fue diseñado para esto; los límites de partición no perdonan |
| Intercambio de tabla | Puedes construir una tabla de reemplazo y renombrar atómicamente | Ventana corta de intercambio, pero la fase de copia necesita control de escrituras | Mantén la tabla antigua hasta verificar | Esquema, triggers, grants, claves foráneas y escrituras durante la copia necesitan un plan |
| `TRUNCATE` + reinserción | Estás borrando casi todo y puedes pausar escrituras | Ventana de mantenimiento; la tabla está vacía entre truncate y restore | Poco amigable con rollback | Claves foráneas, commits implícitos, triggers, auto-increment, binlogs y verificación |

Mi regla práctica personal:

```text
Borrar < 50%   -> empieza con DELETE indexado o DELETE por lotes
Borrar 50-80%  -> mide DELETE por lotes frente a enfoques de rebuild
Borrar > 80%   -> considera seriamente preserve-and-rebuild
```

El porcentaje no es magia. Borrar el 30% de una tabla con índices horribles aún puede doler. Borrar el 90% de una tabla pequeña quizá no merece ceremonia. La pregunta real es: **¿qué lado de los datos es más pequeño y más seguro de operar?**

## Por qué un `DELETE` masivo duele en InnoDB

InnoDB no mira tu cláusula `WHERE`, suspira con nostalgia y elimina un rango de bytes del disco.

Tiene que hacer trabajo de base de datos:

- Encontrar filas mediante un índice o escanear demasiado.
- Bloquear registros, y a veces gaps, a lo largo de los rangos de índice escaneados.
- Mantener cada índice secundario afectado.
- Escribir undo para que el delete pueda revertirse.
- Escribir redo para que funcione la recuperación ante fallos.
- Escribir binary logs para que la replicación y la recuperación tengan historia.
- Dejar trabajo de purge para que InnoDB lo limpie después de que las transacciones liberen versiones antiguas.

La [documentación de MySQL sobre locks de InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html) merece leerse con un café y una pequeña sensación de inquietud: `DELETE` bloquea los registros de índice que escanea, no solo las filas que tu modelo mental cree que coincidieron.

Los borrados por lotes reducen el radio de explosión haciendo que cada transacción sea más pequeña:

```sql
DELETE FROM big_table
WHERE created_at < @cutoff
ORDER BY id
LIMIT 10000;
```

Eso es útil. Da tiempo a las réplicas para respirar. Te permite parar. Evita que el undo se convierta en una transacción enorme.

Pero no cambia el modelo básico de coste. Sigues borrando fila por fila.

## Por qué `TRUNCATE` cambia el modelo de coste

`TRUNCATE TABLE` es rápido porque MySQL lo trata más como soltar y recrear la tabla que como borrar cada fila. La [documentación de MySQL sobre `TRUNCATE TABLE`](https://dev.mysql.com/doc/refman/8.4/en/truncate-table.html) señala las diferencias importantes: evita el camino normal de borrado DML, provoca un commit implícito, no puede revertirse como una sentencia DML normal y no dispara triggers `ON DELETE`.

Así que en vez de esto:

```text
borrar 80 millones de filas
conservar 20 millones de filas
```

Haces esto:

```text
copiar 20 millones de filas
vaciar la tabla rápidamente
insertar de nuevo 20 millones de filas
```

Ese es todo el truco. Los detalles de implementación son donde están enterradas las minas.

## No empieces con SQL. Empieza con el conjunto que vas a conservar.

La versión más segura de esta operación se formula alrededor de las filas que sobreviven.

No:

```text
Borrar todo lo anterior a X.
```

Sino:

```text
Después de esta operación, la tabla contiene exactamente las filas que coinciden con Y.
```

Ese encuadre importa porque las filas conservadas se convierten en tu ancla de recuperación.

Congela los valores volátiles antes de medir nada:

```sql
SET @cutoff := TIMESTAMP('2025-01-01 00:00:00');
```

Luego cuenta ambos lados:

```sql
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN created_at >= @cutoff THEN 1 ELSE 0 END) AS keep_rows,
  SUM(CASE WHEN created_at <  @cutoff THEN 1 ELSE 0 END) AS delete_rows
FROM big_table;
```

Comprueba que MySQL pueda encontrar esas filas sin caerse por un precipicio:

```sql
EXPLAIN
SELECT id
FROM big_table
WHERE created_at >= @cutoff
ORDER BY id;
```

Si ese plan es un full table scan sobre una tabla que todavía recibe escrituras, detente y diseña bien la ventana de mantenimiento. La opción nuclear no sustituye saber cómo se accede a la tabla.

## Las verificaciones previas que quiero antes de tocar producción

Si esto ocurre a las 2 de la mañana, la lista no es burocracia. Es cómo evitas negociar con una terminal.

### 1. Confirmar relaciones de claves foráneas

Encuentra las tablas hijas que referencian la tabla que quieres vaciar:

```sql
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME = 'big_table';
```

Si filas en otras tablas referencian `big_table`, no hagas alegremente `SET FOREIGN_KEY_CHECKS=0` y esperes lo mejor. MySQL permite desactivar checks para algunas operaciones de mantenimiento, pero cuando se reactivan **no** escanea las filas existentes para demostrar que son consistentes. Eso es útil para recargas controladas. Como gesto vago de confianza, da miedo.

Para una tabla padre referenciada, un `DELETE` simple con `ON DELETE CASCADE` puede ser semánticamente necesario. `TRUNCATE` no ejecutará esas cascadas por ti.

### 2. Revisar triggers

```sql
SELECT
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE EVENT_OBJECT_SCHEMA = DATABASE()
  AND EVENT_OBJECT_TABLE = 'big_table';
```

Si la tabla tiene triggers `DELETE` que escriben filas de auditoría, limpian cachés, actualizan rollups o notifican a otros sistemas, `TRUNCATE` los evita. Eso es exactamente lo que quieres, o exactamente cómo creas un incidente muy silencioso.

### 3. Revisar espacio en disco

Necesitas sitio para las filas conservadas en alguna parte.

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb,
  ROUND((data_length + index_length) / 1024 / 1024 / 1024, 2) AS total_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

Si estás conservando el 20% de una tabla de 500GB, la copia temporal no es imaginaria. Es un objeto real compitiendo por disco e I/O reales.

### 4. Revisar binary logs y réplicas

`TRUNCATE` se registra para replicación como una sentencia. La reinserción sigue siendo una escritura grande. Eso puede ser mucho mejor que registrar millones de borrados por fila, pero no es gratis.

Antes de la operación, ten claro:

- el retraso actual de las réplicas,
- si las réplicas pueden tolerar el rebuild,
- si las réplicas retrasadas forman parte de tu historia de rollback,
- si tu backup más los binary logs pueden devolverte al minuto antes del cambio.

La [nota de MySQL sobre replicación de `TRUNCATE`](https://dev.mysql.com/doc/refman/8.4/en/replication-features-truncate.html) es breve, pero la implicación operativa es grande: esto no es solo cirugía local de una tabla.

### 5. Tener una ruta de restore que hayas probado de verdad

"Tenemos backups" no es un plan de restore.

Como mínimo, sabe qué backup restaurarías, dónde lo restaurarías y cómo extraerías solo esta tabla si el resultado es incorrecto. Para una tabla seria de producción, quiero un backup físico reciente con una ruta de restore probada o una exportación lógica deliberada de las filas que estoy a punto de conservar.

La propia [documentación de MySQL sobre backups](https://dev.mysql.com/doc/refman/8.4/en/backup-methods.html) enfatiza backups completos más binary logs para recuperación point-in-time. Eso importa aquí porque un mal borrado masivo es un error lógico, no un fallo de disco.

## El runbook práctico de `TRUNCATE` + reinserción

Asume que esta tabla puede estar vacía brevemente de forma segura:

- ninguna tabla hija depende de las filas mientras corre la operación,
- las escrituras están pausadas o la aplicación está en modo mantenimiento,
- la condición de conservación está congelada,
- los backups son reales,
- las réplicas se han considerado.

Usa columnas explícitas. Sé que `SELECT *` parece limpio. También es así como las columnas generadas, las columnas invisibles, el cambio de orden de columnas y las migraciones futuras hacen que tu noche sea más interesante.

```sql
SET @cutoff := TIMESTAMP('2025-01-01 00:00:00');

CREATE TABLE big_table_keep_20251213 LIKE big_table;

INSERT INTO big_table_keep_20251213 (
  id,
  account_id,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  account_id,
  status,
  created_at,
  updated_at
FROM big_table
WHERE created_at >= @cutoff;
```

Cuenta la copia conservada antes de hacer algo irreversible:

```sql
SELECT COUNT(*) AS keep_rows
FROM big_table_keep_20251213;
```

Luego llega el punto sin vuelta casual:

```sql
TRUNCATE TABLE big_table;
```

Restaura las filas conservadas:

```sql
INSERT INTO big_table (
  id,
  account_id,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  account_id,
  status,
  created_at,
  updated_at
FROM big_table_keep_20251213;
```

Refresca las estadísticas del optimizador:

```sql
ANALYZE TABLE big_table;
```

Verifica antes de limpiar:

```sql
SELECT COUNT(*) AS final_rows
FROM big_table;

SELECT MIN(created_at) AS oldest_remaining_row
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Solo elimina la copia conservada después de que la aplicación esté de vuelta, los conteos coincidan y hayas mirado el comportamiento real del producto que depende de esta tabla:

```sql
DROP TABLE big_table_keep_20251213;
```

Esa tabla conservada no es desorden durante la operación. Es la cuerda.

## Una variante con intercambio de tabla cuando la ventana de tabla vacía es inaceptable

La propia documentación de MySQL sobre `DELETE` sugiere una estrategia relacionada para borrados enormes en InnoDB: copiar las filas que quieres a una tabla con la misma estructura, renombrar las tablas atómicamente y luego soltar la antigua.

La forma es:

```sql
CREATE TABLE big_table_new LIKE big_table;

INSERT INTO big_table_new (
  id,
  account_id,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  account_id,
  status,
  created_at,
  updated_at
FROM big_table
WHERE created_at >= @cutoff;

RENAME TABLE
  big_table TO big_table_old,
  big_table_new TO big_table;
```

El rename en sí es atómico: otras sesiones no ven un par a medio renombrar. Pero no confundas eso con "cero downtime."

Si la tabla antigua recibe escrituras mientras `big_table_new` se está llenando, esas escrituras no se copian mágicamente. Necesitas una pausa de escritura, un plan de captura de delta o una migración online deliberadamente más compleja.

Además: `CREATE TABLE ... LIKE` copia atributos de columnas e índices, pero no vuelve seguro cada objeto y dependencia alrededor. Verifica triggers, claves foráneas, grants, particionado, columnas generadas y supuestos de la aplicación. El nombre de la tabla puede sobrevivir al intercambio; el contexto operativo quizá no.

## Particionado: la mejor versión si lo planeaste antes

Si las filas se alinean con particiones, soltar o truncar una partición suele ser la respuesta más limpia.

```sql
ALTER TABLE events DROP PARTITION p2024_01;
```

o:

```sql
ALTER TABLE events TRUNCATE PARTITION p2024_01;
```

Esta es la versión adulta del borrado masivo: diseña la tabla para que los datos antiguos salgan por una puerta en vez de por una trituradora.

La trampa es obvia y aun así dolorosa: el límite de la partición debe coincidir con la regla de retención. Si tu condición de limpieza es "delete every completed task for customers on the old billing plan except the ones with unresolved exports," el particionado no te rescatará.

Un matiz más específico de MySQL: las tablas InnoDB particionadas por el usuario y las claves foráneas tienen restricciones. No te prometas drops de particiones en un esquema que legalmente no puede particionarse como necesitas.

## Las trampas, sin adornos

### `TRUNCATE` hace commit implícito

Esta es la grande. `TRUNCATE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` y `RENAME TABLE` viven todos en el mundo de commits implícitos de MySQL. Envolver el runbook en `START TRANSACTION` no lo vuelve reversiblemente seguro.

Si tu plan depende de "haremos rollback si se ve mal", no tienes un plan.

### Las claves foráneas no son una casilla

Si la tabla es padre, filas hijas en otra parte pueden depender de ella. Si la tabla es hija, el orden de reinserción importa. Si desactivas `foreign_key_checks`, MySQL no validará las filas antiguas cuando vuelvas a activarlas.

La versión segura es aburrida: entiende el grafo de dependencias y mantén esta técnica lejos de él o incluye las tablas relacionadas en el plan de mantenimiento.

### Los triggers `ON DELETE` no se disparan

Eso puede ser una ventaja de rendimiento. También puede saltarse auditorías y contadores desnormalizados.

Si el efecto secundario del trigger importa, usa `DELETE` o recréalo explícitamente en el runbook.

### `AUTO_INCREMENT` se reinicia

`TRUNCATE` reinicia el contador. Si reinsertas IDs explícitos, MySQL a menudo avanza el siguiente valor al ver esos IDs, pero aun así lo verifico.

```sql
SELECT MAX(id) AS max_id
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Si el siguiente valor de `AUTO_INCREMENT` es incorrecto, arréglalo deliberadamente:

```sql
ALTER TABLE big_table AUTO_INCREMENT = 123456789;
```

No adivines el número. Léelo de los datos restaurados.

### `CREATE TABLE ... SELECT` no es lo mismo que `CREATE TABLE ... LIKE`

Esto importa.

`CREATE TABLE keep AS SELECT ...` es cómodo y puede ser rápido, pero MySQL no crea automáticamente índices para esa tabla nueva, y algunos atributos no se preservan como la gente supone.

Para un runbook operativo, prefiero:

```sql
CREATE TABLE keep_table LIKE source_table;
INSERT INTO keep_table (explicit, column, list)
SELECT explicit, column, list
FROM source_table
WHERE keep_condition;
```

La copia puede tardar más porque los índices existen en la tabla keep. Pagaré con gusto parte de ese coste si la alternativa es descubrir durante el restore que la tabla scratch no tenía la forma de la fuente.

### Las restricciones siguen importando después del truncate

Las filas vienen de la misma tabla, así que deberían satisfacer las mismas claves primarias, claves únicas, checks y restricciones non-null. "Deberían" no es una estrategia de verificación.

Si tu conjunto conservado se produce mediante joins, deduplicación, transformaciones o código en vez de un `SELECT` directo desde la tabla original, valídalo antes del truncate:

```sql
SELECT id, COUNT(*) AS duplicates
FROM big_table_keep_20251213
GROUP BY id
HAVING COUNT(*) > 1
LIMIT 10;
```

### Las réplicas todavía pueden retrasarse

Este método puede reducir el trabajo comparado con un enorme borrado fila por fila, pero las réplicas aún deben aplicar el truncate y la inserción masiva. Vigílalas.

Si una réplica retrasada es tu red de seguridad, dilo en voz alta antes de la operación. Si todas las réplicas deben mantenerse cerca de tiempo real, limita el ritmo del restore o elige otro enfoque.

### La aplicación no debe escribir durante la ventana de copia

Esta es la trampa silenciosa.

Si copias las filas a conservar a las 02:00:00 y la aplicación inserta nuevas filas válidas a las 02:00:05, esas filas no están en la tabla keep. Un `TRUNCATE` posterior las elimina.

El modo mantenimiento no es solo experiencia de usuario. Es corrección de datos.

## Una cautela con forma de Laravel

Si ejecutas esto desde Laravel, lo importante no es la facade. Es el límite.

No lo escondas dentro de un helper genérico que acepte nombres de tablas arbitrarios y cadenas `WHERE` crudas. Los identificadores deben ser constantes de código. La condición de conservación debe venir de código revisado, no de input de usuario. Y `DB::transaction()` no hace que el DDL sea rollback-safe en MySQL.

El esqueleto en el que confío se parece más a un command que a una función reutilizable de biblioteca:

```php
DB::connection($connection)->statement('CREATE TABLE big_table_keep_20251213 LIKE big_table');

$preserveSql = <<<'SQL'
    INSERT INTO big_table_keep_20251213 (id, account_id, status, created_at, updated_at)
    SELECT id, account_id, status, created_at, updated_at
    FROM big_table
    WHERE created_at >= ?
SQL;

DB::connection($connection)->statement($preserveSql, [$cutoff]);

$keepRows = DB::connection($connection)
    ->table('big_table_keep_20251213')
    ->count();

// Log $keepRows, compare it to the preflight count, and require an explicit operator confirmation.

DB::connection($connection)->statement('TRUNCATE TABLE big_table');

$restoreSql = <<<'SQL'
    INSERT INTO big_table (id, account_id, status, created_at, updated_at)
    SELECT id, account_id, status, created_at, updated_at
    FROM big_table_keep_20251213
SQL;

DB::connection($connection)->statement($restoreSql);
```

Ese paso de confirmación no es teatro. Es la pausa donde detectas "espera, keep_rows es 11, no 11 millones."

## Una pequeña checklist de las 2 de la mañana

Antes:

- Conozco la condición exacta de conservación.
- Congelé cualquier cutoff basado en tiempo.
- Conté total, keep y delete rows.
- Revisé claves foráneas y triggers.
- Revisé espacio en disco para la copia conservada.
- Conozco la ruta de backup y restore.
- Revisé el replica lag y las implicaciones binlog.
- Pausé escrituras o tengo un plan real de captura de delta.

Durante:

- Creo la tabla keep.
- La cuento.
- Comparo el conteo con el número de preflight.
- Ejecuto el paso irreversible solo después de que los números tengan sentido.
- Reinserto con columnas explícitas.
- Analizo y verifico.

Después:

- El row count final coincide con el keep count.
- Las filas de frontera se ven correctas.
- El comportamiento de la aplicación está verificado, no solo la salida SQL.
- Las réplicas están al día o poniéndose al día intencionalmente.
- La tabla keep se queda hasta que ya no necesito la cuerda.

## Cuándo no usaría esto

No usaría `TRUNCATE` + reinserción si:

- la tabla tiene triggers `DELETE` importantes,
- las cascadas de claves foráneas son el comportamiento de negocio correcto,
- las escrituras no pueden pausarse,
- la condición de conservación es difusa,
- el borrado es lo bastante pequeño para un `DELETE` por lotes,
- la tabla ya está particionada en el límite de retención,
- la organización no puede restaurar la tabla si el runbook está mal.

Ese último punto es la prueba. Si restaurar la tabla sería caos, no elijas una operación cuyo modo de fallo es "restaurar la tabla."

## Cierre

La opción nuclear no es inteligente porque `TRUNCATE` sea rápido. Todo el mundo sabe que `TRUNCATE` es rápido.

La idea útil es decidir qué trabajo quieres que haga la base de datos.

Si estás borrando casi todo, hacer que InnoDB borre cuidadosamente casi todo puede ser la amabilidad equivocada. Conserva lo que importa. Reconstruye alrededor de eso. Verifica como si una versión futura y cansada de ti fuera a leer la salida con un solo ojo abierto.
