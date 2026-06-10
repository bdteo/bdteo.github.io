---
lang: "es"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "5f58e97245018bc8"
title: "La opción nuclear para borrados masivos: TRUNCATE + reinsertar (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "Cuando necesitas borrar el ~80%+ de una tabla MySQL, deja de usar DELETE. Copia las filas que quieres conservar, haz TRUNCATE y luego reinserta: a menudo 10–100× más rápido."
tags: ["mysql", "innodb", "bases de datos", "rendimiento", "operaciones", "laravel"]
featuredImage: "./images/featured.webp"
imageCaption: "Dos manos levantando un pequeño manojo de ramitas de hierba conservadas por encima de una cesta de tallos podados — guardar lo que importa antes de la barrida."
---

Necesitas borrar millones de filas de una tabla MySQL.

Recurres a:

```sql
DELETE FROM big_table WHERE some_condition;
```

Y entonces ves envejecer la barra de progreso en tiempo real.

Intentas ser responsable y dividirlo en lotes:

```sql
DELETE FROM big_table WHERE some_condition LIMIT 10000;
-- repeat until done
```

Mejor. Sigue siendo lento. Sigue siendo ruidoso. Sigue siendo caro.

Si estás borrando **la mayor parte** de la tabla (regla general: **~80%+**), hay otra jugada que es brutalmente eficaz:

> No borres lo que no quieres. **Conserva lo que quieres y arrasa con el resto.**

Yo la llamo la **opción nuclear**: **TRUNCATE + reinsertar**.

---

## Por qué `DELETE` sigue siendo lento (incluso por lotes)

InnoDB no “elimina” filas. Hace trabajo.

Mucho trabajo:

- **Operaciones fila por fila**: localizar, bloquear, marcar como borrada.
- **Mantenimiento de índices**: cada borrado toca todos los índices secundarios.
- **Registro undo/redo**: el motor debe preservar la capacidad de revertir y recuperar.
- **Rotación del buffer pool**: estás ensuciando páginas constantemente, expulsando las útiles.
- **Impacto en la replicación**: los flujos de borrado grandes son una excelente forma de generar retraso en las réplicas.

Cálculo rápido en una servilleta:

- 27M de filas a ~6.000 filas/seg ≈ **75 minutos**.

Eso no es un bug. Es el modelo de coste que elegiste.

---

## La opción nuclear: TRUNCATE + reinsertar

Esta técnica invierte el modelo de coste.

En vez de pagar por cada fila borrada, pagas por cada fila **conservada**.

Algoritmo:

```text
1) Copy the rows you want to keep into a temporary table
2) TRUNCATE the original table (fast)
3) Insert the preserved rows back into the original table
4) Drop the temp table
```

Y sí: se llama “nuclear” por algo. Es deliberadamente contundente.

---

## Por qué es rápida

Las ganancias son mecánicas:

| Operación | Coste aproximado | Por qué |
|---|---:|---|
| `TRUNCATE` | ~O(1) | descarta y recrea la tabla (a nivel de metadatos) |
| `CREATE TABLE … AS SELECT` | O(k) | escaneo secuencial + escritura masiva de las filas conservadas |
| `INSERT … SELECT` | O(k) | inserción masiva; sin “impuesto de borrado” |

Sin sobrecarga de borrado por fila. Sin actualizaciones de índices para las filas eliminadas (porque desaparecen de un solo golpe).

---

## Cuándo usarla (y cuándo no)

### Úsala cuando

- Estás borrando **la mayor parte** de la tabla (de nuevo: **~80%+** es la línea donde esto empieza a brillar).
- Puedes definir limpiamente las “filas que hay que conservar”.
- Puedes permitirte una breve indisponibilidad / ventana de mantenimiento.
- La tabla no está referenciada activamente por claves foráneas desde otras tablas (o puedes gestionar las restricciones de forma segura).
- Tienes **suficiente disco** para la tabla temporal.

### No la uses cuando

- Necesitas **cero downtime**.
- La tabla está muy referenciada por claves foráneas que no puedes tocar.
- *Debes* disparar triggers de DELETE.
- Solo estás borrando una minoría de filas (el borrado por lotes puede ser la solución más sencilla).

---

## Una regla práctica de decisión

Si quieres una frase que puedas decir en una revisión:

> Si el borrado eliminaría la mayor parte de la tabla, deja de borrar. Preserva y reconstruye.

O, si prefieres ASCII:

```text
How much are you deleting?

< 50%     -> chunked DELETE (and index-aware filters)
50–80%    -> measure both approaches
> 80%     -> TRUNCATE + reinsert (if constraints allow)
```

---

## Implementación (SQL)

Esta es la forma mínima:

```sql
-- 1) Preserve the rows you want to keep
CREATE TABLE temp_preserved AS
SELECT * FROM big_table
WHERE preserve_condition;

-- 2) Nuke the table
TRUNCATE TABLE big_table;

-- 3) Restore preserved rows
INSERT INTO big_table
SELECT * FROM temp_preserved;

-- 4) Cleanup
DROP TABLE temp_preserved;
```

Dos notas que importan en producción:

- `TRUNCATE` es DDL en MySQL. **Hace commit implícito** y no puedes revertirlo como una transacción normal.
- Quieres una ventana de mantenimiento y un backup. Esto no es un “pruébalo en vivo a ver qué pasa”.

---

## Implementación (Laravel/PHP)

Esta es la versión que realmente uso cuando la necesito:

```php
protected function deleteViaTruncateAndReinsert(
    string $connection,
    string $tableName,
    string $preserveCondition
): int {
    $tempTable = "temp_preserved_{$tableName}_" . time();

    // You're about to do DDL. Be explicit that you're taking control.
    DB::connection($connection)->statement("SET FOREIGN_KEY_CHECKS=0");

    try {
        DB::connection($connection)->statement("
            CREATE TABLE {$tempTable} AS
            SELECT * FROM {$tableName}
            WHERE {$preserveCondition}
        ");

        $preserved = DB::connection($connection)->table($tempTable)->count();

        DB::connection($connection)->statement("TRUNCATE TABLE {$tableName}");

        DB::connection($connection)->statement("
            INSERT INTO {$tableName}
            SELECT * FROM {$tempTable}
        ");

        DB::connection($connection)->statement("DROP TABLE {$tempTable}");
    } finally {
        DB::connection($connection)->statement("SET FOREIGN_KEY_CHECKS=1");
    }

    return $preserved;
}
```

Una pizca de energía de pato de goma: relee la función y pregúntale a tu yo futuro —

> “¿Estoy *seguro* de que esta tabla puede quedar vacía por un momento?”

Si la respuesta no es un sí inequívoco, esta no es la herramienta.

---

## Trampas que debes tener en cuenta

### Reinicio del auto-incremento

`TRUNCATE` reinicia `AUTO_INCREMENT`. Si necesitas preservarlo:

```sql
SELECT MAX(id) FROM big_table;
ALTER TABLE big_table AUTO_INCREMENT = <max_id + 1>;
```

### Claves foráneas

Si otras tablas referencian a esta, `TRUNCATE` puede estar prohibido o ser inseguro. No “desactives los checks sin más” y reces.

### Triggers

`TRUNCATE` **no** dispara triggers de DELETE. Si necesitas los efectos secundarios de un trigger, vuelves a `DELETE`.

### Espacio en disco

Necesitas sitio para el conjunto de datos conservado (la tabla temporal). Compruébalo primero:

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

### Replicación / binlog

Esto es DDL + inserción masiva. Aun así puede causar retraso en las réplicas. Hazlo de forma intencionada, monitoriza el retraso y no finjas que es gratis.

---

## Si necesitas (casi) cero downtime

Este post trata sobre el martillo rápido.

Si necesitas un bisturí, usa las herramientas hechas para ello:

- `pt-archiver` (Percona Toolkit) para borrados por lotes con un ritmo amigable con las réplicas
- estrategias de particionado (descartar particiones en vez de filas)
- enfoques de tabla sombra + intercambio controlado (más complejos, más piezas en movimiento)

---

## Reflexión final

Esto no es un truco ingenioso. Es elegir qué trabajo pagas.

Cuando estás borrando casi todo, pagar por cada fila borrada es solo dolor autoinfligido. Preserva lo que importa. Reconstruye. Sigue adelante.
