---
title: "The Nuclear Option for Bulk Deletes: TRUNCATE + Reinsert (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "A practical MySQL/InnoDB decision guide for massive deletes: DELETE, batched DELETE, partition drop, table swap, or TRUNCATE + reinsert."
tags: ["mysql", "innodb", "databases", "performance", "operations", "laravel"]
featuredImage: "./images/featured.webp"
imageCaption: "Two hands lifting a small bundle of preserved herb sprigs above a basket of trimmed stems — keeping what matters before the sweep."
audioUrl: "/audio/articles/todo-bulk-deletion-nuclear-option/UzI1NsMEV3ni5JRkRSls-0c27e611cd31.m4a"
audioDuration: "17:06"
audioVoice: "Alistair (ElevenLabs cultured British)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/todo-bulk-deletion-nuclear-option.md"
---

You need to delete millions of rows from a MySQL table.

The honest first instinct is this:

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01';
```

Then the query runs long enough for you to become a different person.

So you do the responsible thing:

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01'
ORDER BY id
LIMIT 10000;
```

Repeat until done. Add a sleep. Watch replicas. Hope the lock story stays boring.

That is often the right answer. But if you are deleting **most** of the table, a row-by-row delete is not noble. It is just expensive.

There is a different move:

> Do not delete what you do not want. Preserve what you do want, rebuild the table, and move on.

That is the nuclear option: **copy the rows to keep, `TRUNCATE`, then reinsert**.

It is fast because it changes the unit of work. You stop paying for every deleted row and start paying for every preserved row.

It is also dangerous because `TRUNCATE` is not a polite `DELETE`. In MySQL it is DDL-flavored, it commits implicitly, it resets `AUTO_INCREMENT`, it skips `ON DELETE` triggers, and it has real foreign-key and replication consequences. This is exactly why it deserves a proper runbook, not a clever snippet pasted into production at 2am.

## The decision matrix

Use the blunt tool only when the shape of the problem actually wants a blunt tool.

| Approach | Best when | Availability | Rollback story | Main gotchas |
|---|---|---|---|---|
| Plain `DELETE` | You are deleting a small, indexed slice | Usually online, but locks can still hurt | Transactional if kept inside a sane transaction | Slow for huge sets; touches indexes; generates undo/redo/binlog work |
| Batched `DELETE` | You need live-system pacing and can tolerate a longer job | Online if batches are small and indexed | Each batch can commit independently | Still row-by-row; can create replica lag; requires pause/resume bookkeeping |
| Partition drop/truncate | Rows map cleanly to whole partitions | Brief DDL window | Not a row-level rollback | Only works if partitioning was designed for this; partition boundaries are unforgiving |
| Table swap | You can build a replacement table and atomically rename | Short swap window, but copy phase needs write control | Keep old table until verified | Schema, triggers, grants, foreign keys, and writes during copy need a plan |
| `TRUNCATE` + reinsert | You are deleting almost everything and can pause writes | Maintenance window; table is empty between truncate and restore | Not rollback-friendly | Foreign keys, implicit commits, triggers, auto-increment, binlogs, and verification |

My personal rule of thumb:

```text
Deleting < 50%   -> start with indexed DELETE or batched DELETE
Deleting 50-80%  -> measure batched DELETE vs rebuild approaches
Deleting > 80%   -> strongly consider preserve-and-rebuild
```

The percentage is not magic. A 30% delete from a table with horrible indexes may still be painful. A 90% delete from a small table may not deserve ceremony. The real question is: **which side of the data is smaller and safer to operate on?**

## Why massive `DELETE` hurts InnoDB

InnoDB does not look at your `WHERE` clause, sigh wistfully, and remove a range of bytes from disk.

It has to do database work:

- Find rows through an index or scan too much.
- Lock records, and sometimes gaps, along the scanned index ranges.
- Maintain every affected secondary index.
- Write undo so the delete can roll back.
- Write redo so crash recovery works.
- Write binary logs so replication and recovery have a history.
- Leave purge work behind for InnoDB to clean up after transactions release old versions.

The [MySQL InnoDB locking docs](https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html) are worth reading with a coffee and a small sense of dread: `DELETE` locks the index records it scans, not merely the rows your mental model thinks it matched.

Batched deletes reduce the blast radius by making each transaction smaller:

```sql
DELETE FROM big_table
WHERE created_at < @cutoff
ORDER BY id
LIMIT 10000;
```

That is useful. It gives replicas time to breathe. It lets you stop. It keeps undo from becoming one enormous transaction.

But it does not change the basic cost model. You are still deleting row by row.

## Why `TRUNCATE` changes the cost model

`TRUNCATE TABLE` is fast because MySQL treats it more like dropping and recreating the table than like deleting every row. The [MySQL `TRUNCATE TABLE` docs](https://dev.mysql.com/doc/refman/8.4/en/truncate-table.html) call out the important differences: it bypasses the normal DML delete path, causes an implicit commit, cannot be rolled back like a normal DML statement, and does not fire `ON DELETE` triggers.

So instead of this:

```text
delete 80 million rows
keep 20 million rows
```

You do this:

```text
copy 20 million rows
empty table quickly
insert 20 million rows back
```

That is the whole trick. The implementation details are where the bodies are buried.

## Do not start with SQL. Start with the keep set.

The safest version of this operation is phrased around the rows that survive.

Not:

```text
Delete everything older than X.
```

But:

```text
After this operation, the table contains exactly rows matching Y.
```

That framing matters because the preserved rows become your recovery anchor.

Freeze volatile values before you measure anything:

```sql
SET @cutoff := TIMESTAMP('2025-01-01 00:00:00');
```

Then count both sides:

```sql
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN created_at >= @cutoff THEN 1 ELSE 0 END) AS keep_rows,
  SUM(CASE WHEN created_at <  @cutoff THEN 1 ELSE 0 END) AS delete_rows
FROM big_table;
```

Check that MySQL can find those rows without falling off a cliff:

```sql
EXPLAIN
SELECT id
FROM big_table
WHERE created_at >= @cutoff
ORDER BY id;
```

If that plan is a full table scan over a table that is still taking writes, stop and design the maintenance window properly. The nuclear option is not a substitute for knowing how the table is accessed.

## Preflight checks I want before touching production

If this is happening at 2am, the checklist is not bureaucracy. It is how you avoid bargaining with a terminal.

### 1. Confirm foreign-key relationships

Find child tables that reference the table you want to empty:

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

If rows in other tables reference `big_table`, do not casually `SET FOREIGN_KEY_CHECKS=0` and hope. MySQL lets you disable checks for some maintenance operations, but when checks are re-enabled it does **not** scan existing rows and prove they are consistent. That is useful for controlled reloads. It is terrifying as a hand-wave.

For a referenced parent table, a plain `DELETE` with `ON DELETE CASCADE` might be semantically necessary. `TRUNCATE` will not run those cascades for you.

### 2. Check triggers

```sql
SELECT
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE EVENT_OBJECT_SCHEMA = DATABASE()
  AND EVENT_OBJECT_TABLE = 'big_table';
```

If the table has `DELETE` triggers that write audit rows, clear caches, update rollups, or notify other systems, `TRUNCATE` bypasses them. That is either exactly what you want or exactly how you create a very quiet incident.

### 3. Check disk space

You need room for the preserved rows somewhere.

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb,
  ROUND((data_length + index_length) / 1024 / 1024 / 1024, 2) AS total_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

If you are keeping 20% of a 500GB table, the temporary copy is not imaginary. It is a real object competing for real disk and I/O.

### 4. Check binary logs and replicas

`TRUNCATE` is logged for replication as a statement. The reinsert is still a large write. That can be much better than logging millions of row deletes, but it is not free.

Before the operation, know:

- current replica lag,
- whether replicas can tolerate the rebuild,
- whether delayed replicas are part of your rollback story,
- whether your backup plus binary logs can get you back to the minute before the change.

The [MySQL replication note for `TRUNCATE`](https://dev.mysql.com/doc/refman/8.4/en/replication-features-truncate.html) is short, but the operational implication is large: this is not just local table surgery.

### 5. Have a restore path you have actually tested

"We have backups" is not a restore plan.

At minimum, know which backup you would restore, where you would restore it, and how you would extract just this table if the result is wrong. For a serious production table, I want either a recent physical backup with a tested restore path or a deliberate logical export of the rows I am about to preserve.

MySQL's own [backup docs](https://dev.mysql.com/doc/refman/8.4/en/backup-methods.html) emphasize full backups plus binary logs for point-in-time recovery. That matters here because a bad bulk delete is a logical mistake, not a disk failure.

## The practical `TRUNCATE` + reinsert runbook

Assume this table is safe to empty briefly:

- no child tables depend on the rows while the operation runs,
- writes are paused or the application is in maintenance mode,
- the keep condition is frozen,
- backups are real,
- replicas have been considered.

Use explicit columns. I know `SELECT *` looks clean. It is also how generated columns, invisible columns, column order drift, and future migrations make your night more interesting.

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

Count the preserved copy before you do anything irreversible:

```sql
SELECT COUNT(*) AS keep_rows
FROM big_table_keep_20251213;
```

Then the point of no casual return:

```sql
TRUNCATE TABLE big_table;
```

Restore the preserved rows:

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

Refresh optimizer statistics:

```sql
ANALYZE TABLE big_table;
```

Verify before cleanup:

```sql
SELECT COUNT(*) AS final_rows
FROM big_table;

SELECT MIN(created_at) AS oldest_remaining_row
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Only drop the preserved copy after the application is back, the counts match, and you have looked at the actual product behavior that depends on this table:

```sql
DROP TABLE big_table_keep_20251213;
```

That preserved table is not clutter during the operation. It is the rope.

## A table-swap variant when the empty-table window is unacceptable

MySQL's own `DELETE` documentation suggests a related strategy for huge InnoDB deletes: copy the rows you want into a same-structure table, atomically rename the tables, then drop the old one.

The shape is:

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

The rename itself is atomic: other sessions do not see a half-renamed pair. But do not confuse that with "zero downtime."

If the old table receives writes while `big_table_new` is being populated, those writes are not magically copied. You need a write pause, a delta-capture plan, or a deliberately more complex online migration.

Also: `CREATE TABLE ... LIKE` copies column attributes and indexes, but it does not make every surrounding object and dependency safe. Verify triggers, foreign keys, grants, partitioning, generated columns, and application assumptions. The table name may survive the swap; the operational context may not.

## Partitioning: the best version if you planned ahead

If the rows line up with partitions, dropping or truncating a partition is often the cleanest answer.

```sql
ALTER TABLE events DROP PARTITION p2024_01;
```

or:

```sql
ALTER TABLE events TRUNCATE PARTITION p2024_01;
```

This is the grown-up version of bulk deletion: design the table so old data can leave through a door instead of through a shredder.

The catch is obvious and still painful: the partition boundary must match the retention rule. If your cleanup condition is "delete every completed task for customers on the old billing plan except the ones with unresolved exports," partitioning will not rescue you.

One more MySQL-specific wrinkle: user-defined partitioned InnoDB tables and foreign keys have restrictions. Do not promise yourself partition drops on a schema that cannot legally be partitioned the way you need.

## The gotchas, plainly

### `TRUNCATE` commits implicitly

This is the big one. `TRUNCATE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, and `RENAME TABLE` are all in MySQL's implicit-commit world. Wrapping the runbook in `START TRANSACTION` does not make it safely reversible.

If your plan depends on "we will roll back if it looks wrong," you do not have a plan.

### Foreign keys are not a checkbox

If the table is a parent, child rows elsewhere may depend on it. If the table is a child, reinsert order matters. If you disable `foreign_key_checks`, MySQL will not validate old rows when you turn checks back on.

The safe version is boring: understand the dependency graph and either keep this technique away from it or include the related tables in the maintenance plan.

### `ON DELETE` triggers do not fire

That can be a performance benefit. It can also bypass audit trails and denormalized counters.

If the trigger side effect matters, use `DELETE` or explicitly recreate the side effect in the runbook.

### `AUTO_INCREMENT` resets

`TRUNCATE` resets the counter. If you reinsert explicit IDs, MySQL often advances the next value as it sees those IDs, but I still verify it.

```sql
SELECT MAX(id) AS max_id
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

If the next `AUTO_INCREMENT` value is wrong, fix it deliberately:

```sql
ALTER TABLE big_table AUTO_INCREMENT = 123456789;
```

Do not guess the number. Read it from the restored data.

### `CREATE TABLE ... SELECT` is not the same as `CREATE TABLE ... LIKE`

This matters.

`CREATE TABLE keep AS SELECT ...` is convenient and can be fast, but MySQL does not automatically create indexes for that new table, and some attributes are not preserved the way people assume.

For an operational runbook, I prefer:

```sql
CREATE TABLE keep_table LIKE source_table;
INSERT INTO keep_table (explicit, column, list)
SELECT explicit, column, list
FROM source_table
WHERE keep_condition;
```

The copy may take longer because indexes exist on the keep table. I will happily pay some of that cost if the alternative is discovering at restore time that the scratch table was not shaped like the source.

### Constraints still matter after the truncate

The rows came from the same table, so they should satisfy the same primary keys, unique keys, checks, and non-null constraints. "Should" is not a verification strategy.

If your preserved set is produced by joins, deduping, transformations, or code rather than a direct `SELECT` from the original table, validate it before the truncate:

```sql
SELECT id, COUNT(*) AS duplicates
FROM big_table_keep_20251213
GROUP BY id
HAVING COUNT(*) > 1
LIMIT 10;
```

### Replicas can still lag

This method can reduce the work compared with an enormous row-by-row delete, but replicas still need to apply the truncate and the bulk insert. Watch them.

If a delayed replica is your safety net, say that out loud before the operation. If all replicas must stay near real time, throttle the restore or choose a different approach.

### The application must not write through the copy window

This is the quiet footgun.

If you copy keep rows at 02:00:00 and the application inserts new valid rows at 02:00:05, those rows are not in the keep table. A later `TRUNCATE` removes them.

Maintenance mode is not just about user experience. It is data correctness.

## A Laravel-shaped caution

If you run this from Laravel, the important thing is not the facade. It is the boundary.

Do not hide this inside a generic helper that accepts arbitrary table names and raw `WHERE` strings. Identifiers should be code constants. The keep condition should come from reviewed code, not user input. And `DB::transaction()` does not make DDL rollback-safe in MySQL.

The skeleton I trust looks more like a command than a reusable library function:

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

That confirmation step is not theatrics. It is the pause where you catch "wait, keep_rows is 11, not 11 million."

## A small 2am checklist

Before:

- I know the exact keep condition.
- I froze any time-based cutoff.
- I counted total, keep, and delete rows.
- I checked foreign keys and triggers.
- I checked disk space for the preserved copy.
- I know the backup and restore path.
- I checked replica lag and binlog implications.
- I paused writes or have a real delta-capture plan.

During:

- I create the keep table.
- I count it.
- I compare the count to the preflight number.
- I run the irreversible step only after the numbers make sense.
- I reinsert with explicit columns.
- I analyze and verify.

After:

- Final row count matches keep count.
- Boundary rows look right.
- Application behavior is checked, not merely SQL output.
- Replicas are caught up or intentionally catching up.
- The keep table stays until I no longer need the rope.

## When I would not use this

I would not use `TRUNCATE` + reinsert if:

- the table has important `DELETE` triggers,
- foreign-key cascades are the correct business behavior,
- writes cannot be paused,
- the keep condition is fuzzy,
- the delete is small enough for batched `DELETE`,
- the table is already partitioned on the retention boundary,
- the organization cannot restore the table if the runbook is wrong.

That last one is the test. If restoring the table would be chaos, do not choose an operation whose failure mode is "restore the table."

## Closing thought

The nuclear option is not clever because `TRUNCATE` is fast. Everyone knows `TRUNCATE` is fast.

The useful idea is deciding which work you want the database to do.

If you are deleting almost everything, making InnoDB carefully delete almost everything can be the wrong kindness. Preserve what matters. Rebuild around it. Verify like a tired future version of you will be reading the output with one eye open.
