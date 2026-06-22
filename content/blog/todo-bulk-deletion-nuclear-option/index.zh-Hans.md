---
lang: "zh-Hans"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "ab64e631f1cf34f9"
title: "批量删除的核选项：TRUNCATE + 重新插入（MySQL/InnoDB）"
date: "2025-12-13T13:00:00.000Z"
description: "一份面向 MySQL/InnoDB 大规模删除的实用决策指南：DELETE、分批 DELETE、删除分区、表交换，或 TRUNCATE + 重新插入。"
tags: ["mysql", "innodb", "数据库", "性能", "运维", "laravel"]
featuredImage: "./images/featured.webp"
imageCaption: "两只手把一小束保留下来的香草枝举在一篮修剪过的茎秆上方——在清扫之前，先留住重要的东西。"
---

你需要从一张 MySQL 表里删除数百万行。

第一个诚实的本能是这样：

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01';
```

然后这条查询跑得足够久，久到你变成另一个人。

于是你做负责任的事：

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01'
ORDER BY id
LIMIT 10000;
```

重复直到结束。加一个 sleep。盯着副本。希望锁的故事继续无聊。

这通常是正确答案。但如果你要删除的是表里的**大部分**数据，逐行删除并不高尚。它只是昂贵。

还有另一种做法：

> 不要删除你不想要的东西。保留你想要的，重建这张表，然后继续。

这就是核选项：**复制要保留的行，执行 `TRUNCATE`，再重新插入**。

它快，是因为它改变了工作的单位。你不再为每一行被删除的数据付费，而是为每一行被保留的数据付费。

它也危险，因为 `TRUNCATE` 不是一个礼貌的 `DELETE`。在 MySQL 里，它带着 DDL 的味道，会隐式提交，会重置 `AUTO_INCREMENT`，会跳过 `ON DELETE` triggers，而且对 foreign keys 和 replication 有真实后果。正因为如此，它需要一份正经 runbook，而不是凌晨两点粘进 production 的聪明 snippet。

## 决策矩阵

只有当问题的形状真的需要钝器时，才使用钝器。

| 方法 | 最适合的情况 | 可用性 | Rollback 故事 | 主要坑点 |
|---|---|---|---|---|
| 普通 `DELETE` | 你删除的是一个小的、已索引的切片 | 通常在线，但 locks 仍然可能伤人 | 如果放在合理事务里，就是 transactional | 对巨大集合很慢；会触碰 indexes；生成 undo/redo/binlog 工作 |
| 分批 `DELETE` | 你需要适合 live system 的节奏，并且能接受更长的任务 | 如果 batch 小且有索引，可以在线 | 每个 batch 可以独立 commit | 仍然是逐行；可能制造 replica lag；需要 pause/resume bookkeeping |
| Partition drop/truncate | 行可以干净地映射到整个 partitions | 短暂 DDL 窗口 | 不是 row-level rollback | 只有在 partitioning 为此设计时才有效；partition 边界不宽容 |
| Table swap | 你可以构建一张替代表，并原子 rename | 短暂 swap 窗口，但 copy 阶段需要控制 writes | 保留旧表直到验证完成 | Schema、triggers、grants、foreign keys，以及 copy 期间的 writes 都需要计划 |
| `TRUNCATE` + 重新插入 | 你要删除几乎全部数据，并且可以暂停 writes | Maintenance window；truncate 和 restore 之间表是空的 | 不适合 rollback | Foreign keys、implicit commits、triggers、auto-increment、binlogs 和 verification |

我的个人经验线：

```text
删除 < 50%   -> 从 indexed DELETE 或 batched DELETE 开始
删除 50-80%  -> 测量 batched DELETE 和 rebuild approaches
删除 > 80%   -> 强烈考虑 preserve-and-rebuild
```

百分比不是魔法。从一张索引糟糕的表里删除 30%，仍然可能很痛。从一张小表里删除 90%，也未必值得大动干戈。真正的问题是：**数据的哪一侧更小，也更安全可操作？**

## 为什么大规模 `DELETE` 会伤到 InnoDB

InnoDB 不会看着你的 `WHERE` clause，带着怀旧的叹息，从磁盘上移除一段字节。

它必须做数据库工作：

- 通过 index 找到行，或者扫描太多东西。
- 沿着被扫描的 index ranges 锁住 records，有时还会锁 gaps。
- 维护每一个受影响的 secondary index。
- 写 undo，让 delete 可以 rollback。
- 写 redo，让 crash recovery 能工作。
- 写 binary logs，让 replication 和 recovery 有历史可用。
- 留下 purge 工作，等 transactions 释放旧 versions 之后由 InnoDB 清理。

[MySQL 的 InnoDB locking 文档](https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html)值得配着咖啡和一点点不安来读：`DELETE` 锁的是它扫描到的 index records，不只是你脑中的模型以为匹配到的那些行。

分批删除通过缩小每个 transaction 来降低 blast radius：

```sql
DELETE FROM big_table
WHERE created_at < @cutoff
ORDER BY id
LIMIT 10000;
```

这很有用。它给副本时间呼吸。它让你可以停下。它避免 undo 变成一个巨大的 transaction。

但它没有改变基本的 cost model。你仍然在逐行删除。

## 为什么 `TRUNCATE` 改变了 cost model

`TRUNCATE TABLE` 很快，因为 MySQL 对待它更像是 drop 并重新创建表，而不是删除每一行。[MySQL 的 `TRUNCATE TABLE` 文档](https://dev.mysql.com/doc/refman/8.4/en/truncate-table.html)点出了关键差异：它绕过普通 DML delete path，会造成隐式提交，不能像普通 DML statement 那样回滚，也不会触发 `ON DELETE` triggers。

所以不是这样：

```text
删除 8000 万行
保留 2000 万行
```

而是这样：

```text
复制 2000 万行
快速清空表
再插回 2000 万行
```

这就是整个技巧。实现细节才是真正埋雷的地方。

## 不要从 SQL 开始。从 keep set 开始。

这个操作最安全的版本，是围绕那些会活下来的行来表述。

不是：

```text
删除所有早于 X 的东西。
```

而是：

```text
这个操作之后，表里只包含完全匹配 Y 的行。
```

这个框架很重要，因为被保留的行会成为你的 recovery anchor。

在测量任何东西之前，先冻结 volatile values：

```sql
SET @cutoff := TIMESTAMP('2025-01-01 00:00:00');
```

然后数两边：

```sql
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN created_at >= @cutoff THEN 1 ELSE 0 END) AS keep_rows,
  SUM(CASE WHEN created_at <  @cutoff THEN 1 ELSE 0 END) AS delete_rows
FROM big_table;
```

检查 MySQL 能否找到这些行，而不是一脚踩空：

```sql
EXPLAIN
SELECT id
FROM big_table
WHERE created_at >= @cutoff
ORDER BY id;
```

如果这个 plan 是对一张仍在接收 writes 的表做 full table scan，停下来，好好设计 maintenance window。核选项不能替代你理解这张表是如何被访问的。

## 在碰 production 之前我想要的 preflight 检查

如果这是凌晨两点要做的事，checklist 不是官僚主义。它是你避免和终端讨价还价的方法。

### 1. 确认 foreign-key 关系

找出引用你想清空的那张表的 child tables：

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

如果其他表里的行引用了 `big_table`，不要随手 `SET FOREIGN_KEY_CHECKS=0` 然后祈祷。MySQL 允许你为某些 maintenance operations 关闭 checks，但当 checks 重新启用时，它**不会**扫描已有行来证明它们是一致的。这对受控 reload 很有用。作为一句含糊的“应该没事”，它很可怕。

对于被引用的 parent table，带有 `ON DELETE CASCADE` 的普通 `DELETE` 可能在语义上是必要的。`TRUNCATE` 不会替你运行那些 cascades。

### 2. 检查 triggers

```sql
SELECT
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE EVENT_OBJECT_SCHEMA = DATABASE()
  AND EVENT_OBJECT_TABLE = 'big_table';
```

如果这张表有 `DELETE` triggers 会写 audit rows、清 caches、更新 rollups，或者通知其他 systems，`TRUNCATE` 会绕过它们。这要么正是你想要的，要么正是你制造一个非常安静的 incident 的方式。

### 3. 检查 disk space

你需要在某个地方为被保留的行留出空间。

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb,
  ROUND((data_length + index_length) / 1024 / 1024 / 1024, 2) AS total_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

如果你要保留一张 500GB 表的 20%，临时 copy 不是想象出来的。它是一个真实 object，会争用真实的 disk 和 I/O。

### 4. 检查 binary logs 和 replicas

`TRUNCATE` 会作为 statement 写入 replication log。重新插入仍然是一次大写入。这可能比记录数百万次 row delete 好得多，但不是免费的。

操作之前，要知道：

- 当前 replica lag，
- replicas 能否承受 rebuild，
- delayed replicas 是否是你的 rollback 故事的一部分，
- backup 加 binary logs 能否把你带回变更前一分钟。

[MySQL 关于 `TRUNCATE` 的 replication note](https://dev.mysql.com/doc/refman/8.4/en/replication-features-truncate.html)很短，但操作含义很大：这不只是本地表手术。

### 5. 有一条你真正测试过的 restore path

"我们有 backups" 不是 restore plan。

至少要知道你会恢复哪一个 backup，在哪里恢复，以及如果结果错了，如何只抽出这张表。对于严肃的 production table，我想要的是最近的 physical backup 加测试过的 restore path，或者一次有意做出的 logical export，导出我即将保留的行。

MySQL 自己的 [backup 文档](https://dev.mysql.com/doc/refman/8.4/en/backup-methods.html)强调 full backups 加 binary logs 用于 point-in-time recovery。这在这里重要，因为坏的 bulk delete 是逻辑错误，不是磁盘故障。

## 实用的 `TRUNCATE` + 重新插入 runbook

假设这张表可以安全地短暂清空：

- 操作运行时没有 child tables 依赖这些行，
- writes 已暂停，或者应用处于 maintenance mode，
- keep condition 已冻结，
- backups 是真实可用的，
- replicas 已经被考虑过。

使用 explicit columns。我知道 `SELECT *` 看起来很干净。它也是 generated columns、invisible columns、column order drift 和未来 migrations 让你的夜晚更有意思的方式。

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

在做任何 irreversible 的事情之前，先数被保留的 copy：

```sql
SELECT COUNT(*) AS keep_rows
FROM big_table_keep_20251213;
```

然后是没有轻松回头路的点：

```sql
TRUNCATE TABLE big_table;
```

恢复被保留的行：

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

刷新 optimizer statistics：

```sql
ANALYZE TABLE big_table;
```

cleanup 之前先验证：

```sql
SELECT COUNT(*) AS final_rows
FROM big_table;

SELECT MIN(created_at) AS oldest_remaining_row
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

只有在应用恢复、counts 匹配，并且你看过真正依赖这张表的 product behavior 之后，才删除被保留的 copy：

```sql
DROP TABLE big_table_keep_20251213;
```

那张被保留的表在操作期间不是杂物。它是绳索。

## 当空表窗口不可接受时的 table-swap 变体

MySQL 自己的 `DELETE` 文档为巨大的 InnoDB deletes 建议了一种相关策略：把想要的行复制进一张同结构表，原子 rename 这些表，然后 drop 旧表。

形状是：

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

rename 本身是原子的：其他 sessions 不会看到一对半改名的表。但不要把这和 "zero downtime" 混为一谈。

如果旧表在 `big_table_new` 被填充期间接收 writes，那些 writes 不会被神奇地复制过去。你需要 write pause、delta-capture plan，或者一个刻意更复杂的 online migration。

另外：`CREATE TABLE ... LIKE` 会复制 column attributes 和 indexes，但它不会让周围每一个 object 和 dependency 都变安全。检查 triggers、foreign keys、grants、partitioning、generated columns 和 application assumptions。表名也许能在 swap 后活下来；操作上下文未必能。

## Partitioning：如果你提前计划过，这是最好的版本

如果行和 partitions 对齐，drop 或 truncate 一个 partition 通常是最干净的答案。

```sql
ALTER TABLE events DROP PARTITION p2024_01;
```

或者：

```sql
ALTER TABLE events TRUNCATE PARTITION p2024_01;
```

这是 bulk deletion 的成年版本：设计这张表，让旧数据从门出去，而不是从碎纸机出去。

问题很明显，但仍然疼：partition boundary 必须匹配 retention rule。如果你的 cleanup condition 是 "delete every completed task for customers on the old billing plan except the ones with unresolved exports," partitioning 救不了你。

还有一个 MySQL 特有的褶皱：user-defined partitioned InnoDB tables 和 foreign keys 有限制。不要向自己承诺在一个法律上无法按你需要方式 partition 的 schema 上做 partition drops。

## 坑点，直说

### `TRUNCATE` 会隐式提交

这是大的那个。`TRUNCATE`、`CREATE TABLE`、`ALTER TABLE`、`DROP TABLE` 和 `RENAME TABLE` 都生活在 MySQL 的 implicit-commit 世界里。把 runbook 包在 `START TRANSACTION` 里，并不会让它安全可逆。

如果你的计划依赖于“如果看起来不对，我们就 rollback”，那你还没有计划。

### Foreign keys 不是一个 checkbox

如果这张表是 parent，其他地方的 child rows 可能依赖它。如果这张表是 child，重新插入的顺序很重要。如果你禁用 `foreign_key_checks`，MySQL 在你重新启用 checks 时不会验证旧行。

安全版本很无聊：理解 dependency graph，要么让这项技术远离它，要么把相关表纳入 maintenance plan。

### `ON DELETE` triggers 不会触发

这可能是 performance benefit。它也可能绕过 audit trails 和 denormalized counters。

如果 trigger 的 side effect 很重要，使用 `DELETE`，或者在 runbook 里显式重建这个 side effect。

### `AUTO_INCREMENT` 会重置

`TRUNCATE` 会重置 counter。如果你重新插入 explicit IDs，MySQL 通常会在看到这些 IDs 时推进下一个值，但我仍然会验证。

```sql
SELECT MAX(id) AS max_id
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

如果下一个 `AUTO_INCREMENT` 值不对，明确地修正它：

```sql
ALTER TABLE big_table AUTO_INCREMENT = 123456789;
```

不要猜数字。从恢复后的数据里读出来。

### `CREATE TABLE ... SELECT` 和 `CREATE TABLE ... LIKE` 不一样

这很重要。

`CREATE TABLE keep AS SELECT ...` 方便，也可能很快，但 MySQL 不会自动为这张新表创建 indexes，而且有些 attributes 不会像人们以为的那样被保留。

对于 operational runbook，我更喜欢：

```sql
CREATE TABLE keep_table LIKE source_table;
INSERT INTO keep_table (explicit, column, list)
SELECT explicit, column, list
FROM source_table
WHERE keep_condition;
```

这个 copy 可能更久，因为 keep table 上存在 indexes。如果另一个选择是在 restore 时才发现 scratch table 的形状和 source 不一样，我很愿意付出这部分成本。

### Truncate 之后 constraints 仍然重要

这些行来自同一张表，所以它们应该满足同样的 primary keys、unique keys、checks 和 non-null constraints。"应该"不是 verification strategy。

如果你的 preserved set 是通过 joins、deduping、transformations 或 code 生成的，而不是直接从原表 `SELECT` 得到的，请在 truncate 之前验证它：

```sql
SELECT id, COUNT(*) AS duplicates
FROM big_table_keep_20251213
GROUP BY id
HAVING COUNT(*) > 1
LIMIT 10;
```

### Replicas 仍然可能 lag

相比巨大的逐行 delete，这个方法可以减少工作量，但 replicas 仍然需要应用 truncate 和 bulk insert。盯着它们。

如果 delayed replica 是你的 safety net，在操作之前把这句话说出来。如果所有 replicas 都必须接近 real time，就 throttle restore，或者选择另一种方法。

### 应用不能在 copy 窗口中写入

这是安静的坑。

如果你在 02:00:00 复制 keep rows，而应用在 02:00:05 插入新的有效行，那些行不在 keep table 里。后续的 `TRUNCATE` 会移除它们。

Maintenance mode 不只是用户体验。它是 data correctness。

## 一个 Laravel 形状的提醒

如果你从 Laravel 运行这个，重要的不是 facade。重要的是边界。

不要把它藏进一个 generic helper，让它接受任意 table names 和 raw `WHERE` strings。Identifiers 应该是 code constants。Keep condition 应该来自 reviewed code，而不是 user input。并且 `DB::transaction()` 不会让 MySQL 里的 DDL 变得 rollback-safe。

我信任的 skeleton 更像一个 command，而不是一个 reusable library function：

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

那个 confirmation step 不是表演。它是让你抓住“等等，keep_rows 是 11，不是 1100 万”的暂停。

## 一个凌晨两点的小 checklist

之前：

- 我知道确切的 keep condition。
- 我冻结了所有基于时间的 cutoff。
- 我数过 total、keep 和 delete rows。
- 我检查过 foreign keys 和 triggers。
- 我检查过 preserved copy 的 disk space。
- 我知道 backup 和 restore path。
- 我检查过 replica lag 和 binlog implications。
- 我暂停了 writes，或者有真正的 delta-capture plan。

期间：

- 我创建 keep table。
- 我数它。
- 我把 count 和 preflight 数字比较。
- 我只在数字合理之后运行 irreversible step。
- 我用 explicit columns 重新插入。
- 我 analyze 并 verify。

之后：

- Final row count 匹配 keep count。
- Boundary rows 看起来正确。
- Application behavior 被检查过，而不只是 SQL output。
- Replicas 已经 caught up，或者正在有意 catching up。
- Keep table 保留到我不再需要那根绳索。

## 我什么时候不会用它

我不会在这些情况下使用 `TRUNCATE` + 重新插入：

- 表有重要的 `DELETE` triggers，
- foreign-key cascades 才是正确的 business behavior，
- writes 不能暂停，
- keep condition 很模糊，
- delete 小到 batched `DELETE` 就足够，
- 表已经按 retention boundary partitioned，
- 如果 runbook 错了，组织无法 restore 这张表。

最后这一条就是测试。如果 restore 这张表会变成混乱，就不要选择一种 failure mode 是“restore 这张表”的操作。

## 结尾

核选项并不因为 `TRUNCATE` 快而聪明。每个人都知道 `TRUNCATE` 快。

有用的想法是决定你想让数据库做哪一种工作。

如果你要删除几乎所有东西，让 InnoDB 小心翼翼地删除几乎所有东西，可能是一种错误的温柔。保留重要的东西。围绕它重建。像疲惫的未来自己会睁着一只眼睛读这些输出一样验证。
