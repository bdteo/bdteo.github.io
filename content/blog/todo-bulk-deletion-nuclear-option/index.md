---
title: "The Nuclear Option for Bulk Deletes: TRUNCATE + Reinsert (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "When you need to delete ~80%+ of a MySQL table, stop using DELETE. Copy the rows you want to keep, TRUNCATE, then reinsert—often 10–100× faster."
tags: ["mysql", "innodb", "databases", "performance", "operations", "laravel"]
featuredImage: "./images/featured.webp"
imageCaption: "A protected island of rows remains, while everything else is cleanly cleared—TRUNCATE + reinsert as the blunt, fast rewrite."
---

You need to delete millions of rows from a MySQL table.

You reach for:

```sql
DELETE FROM big_table WHERE some_condition;
```

And then you watch the progress bar age in real time.

You try to be responsible and chunk it:

```sql
DELETE FROM big_table WHERE some_condition LIMIT 10000;
-- repeat until done
```

Better. Still slow. Still noisy. Still expensive.

If you’re deleting **most** of the table (rule of thumb: **~80%+**), there’s a different move that’s brutally effective:

> Don’t delete what you don’t want. **Keep what you want, and nuke the rest.**

I call it the **nuclear option**: **TRUNCATE + reinsert**.

---

## Why `DELETE` stays slow (even when chunked)

InnoDB doesn’t “remove” rows. It does work.

Lots of work:

- **Row-by-row operations**: locate, lock, mark as deleted.
- **Index maintenance**: every deletion touches every secondary index.
- **Undo/redo logging**: the engine must preserve the ability to roll back and recover.
- **Buffer pool churn**: you’re constantly dirtying pages, evicting useful ones.
- **Replication impact**: large delete streams are a great way to generate replica lag.

Back-of-the-napkin reality check:

- 27M rows at ~6,000 rows/sec ≈ **75 minutes**.

That’s not a bug. That’s the cost model you chose.

---

## The nuclear option: TRUNCATE + reinsert

This technique flips the cost model.

Instead of paying per deleted row, you pay per **kept** row.

Algorithm:

```text
1) Copy the rows you want to keep into a temporary table
2) TRUNCATE the original table (fast)
3) Insert the preserved rows back into the original table
4) Drop the temp table
```

And yes: it’s called “nuclear” for a reason. It is intentionally blunt.

---

## Why it’s fast

The wins are mechanical:

| Operation | Rough cost | Why |
|---|---:|---|
| `TRUNCATE` | ~O(1) | drops and recreates the table (metadata-level) |
| `CREATE TABLE … AS SELECT` | O(k) | sequential scan + bulk write for kept rows |
| `INSERT … SELECT` | O(k) | bulk insert; no “delete tax” |

No per-row delete overhead. No index updates for the removed rows (because they’re gone in one shot).

---

## When to use it (and when not to)

### Use it when

- You’re deleting **most** of the table (again: **~80%+** is the line where this starts to shine).
- You can define the “rows to keep” cleanly.
- You can afford brief unavailability / maintenance window.
- The table is not actively referenced by foreign keys from other tables (or you can manage constraints safely).
- You have **enough disk** for the temp table.

### Don’t use it when

- You need **zero downtime**.
- The table is heavily referenced by foreign keys you can’t touch.
- You *must* fire DELETE triggers.
- You’re only deleting a minority of rows (chunked delete can be the simpler win).

---

## A practical decision rule

If you want one sentence you can say in a review:

> If the delete would remove most of the table, stop deleting. Preserve and rebuild.

Or, if you prefer ASCII:

```text
How much are you deleting?

< 50%     -> chunked DELETE (and index-aware filters)
50–80%    -> measure both approaches
> 80%     -> TRUNCATE + reinsert (if constraints allow)
```

---

## Implementation (SQL)

Here’s the minimal shape:

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

Two notes that matter in production:

- `TRUNCATE` is DDL in MySQL. It **implicitly commits** and you can’t roll it back like a normal transaction.
- You want a maintenance window and a backup. This is not a “try it live and see”.

---

## Implementation (Laravel/PHP)

This is the version I actually use when I need it:

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

Pinch of rubber-duck energy: read the function again and ask your future-self —

> “Am I *sure* this table can be emptied for a moment?”

If the answer isn’t an unambiguous yes, this is not the tool.

---

## Gotchas you must account for

### Auto-increment resets

`TRUNCATE` resets `AUTO_INCREMENT`. If you need to preserve it:

```sql
SELECT MAX(id) FROM big_table;
ALTER TABLE big_table AUTO_INCREMENT = <max_id + 1>;
```

### Foreign keys

If other tables reference this one, `TRUNCATE` may be forbidden or unsafe. Don’t “just disable checks” and hope.

### Triggers

`TRUNCATE` does **not** fire DELETE triggers. If you need trigger side effects, you’re back to `DELETE`.

### Disk space

You need room for the preserved dataset (temp table). Check first:

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

### Replication / binlog

This is DDL + bulk insert. It can still cause replica lag. Do it intentionally, monitor lag, and don’t pretend it’s free.

---

## If you need (near) zero downtime

This post is about the fast hammer.

If you need a scalpel, use the tools built for it:

- `pt-archiver` (Percona Toolkit) for batched deletes with replica-friendly pacing
- partitioning strategies (drop partitions instead of rows)
- shadow-table approaches + controlled swap (more complex, more moving parts)

---

## Closing thought

This isn’t a clever trick. It’s choosing which work you pay for.

When you’re deleting almost everything, paying per deleted row is just self-inflicted pain. Preserve what matters. Rebuild. Move on.


