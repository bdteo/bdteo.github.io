---
lang: "zh-Hans"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-05-18"
translationSourceHash: "5f58e97245018bc8"
title: "批量删除的核选项：TRUNCATE + 重新插入（MySQL/InnoDB）"
date: "2025-12-13T13:00:00.000Z"
description: "当你需要删除一张 MySQL 表中约 80% 以上的数据时，别再用 DELETE。复制要保留的行，TRUNCATE，再插回去——通常快 10 到 100 倍。"
featuredImage: "./images/featured.webp"
imageCaption: "两只手把一小束保留下来的香草枝举在一篮修剪过的茎秆上方——在清扫之前，先留住重要的东西。"
---

你需要从一张 MySQL 表里删除数百万行。

你伸手去拿：

```sql
DELETE FROM big_table WHERE some_condition;
```

然后你看着进度条在现实时间里变老。

你试着负责任一点，分块删：

```sql
DELETE FROM big_table WHERE some_condition LIMIT 10000;
-- repeat until done
```

好一点。还是慢。还是吵。还是贵。

如果你要删除的是表里的**大部分**数据（经验线：**约 80% 以上**），还有一种做法，粗暴但有效：

> 不要删除你不想要的东西。**保留你想要的，把剩下的炸掉。**

我把它叫作**核选项**：**TRUNCATE + 重新插入**。

---

## 为什么 `DELETE` 还是慢（即使分块）

InnoDB 并不是“移除”行。它是在干活。

很多活：

- **逐行操作**：定位、加锁、标记为已删除。
- **索引维护**：每一次删除都会触碰每一个二级索引。
- **Undo/redo 日志**：引擎必须保留回滚和恢复的能力。
- **Buffer pool 翻腾**：你不断把页面弄脏，驱逐有用的页面。
- **复制影响**：大规模删除流是制造 replica lag 的好方法。

餐巾纸背面的现实检查：

- 2700 万行，约 6000 行/秒 ≈ **75 分钟**。

这不是 bug。这是你选择的成本模型。

---

## 核选项：TRUNCATE + 重新插入

这个技巧会把成本模型翻过来。

你不再为每一行被删除的数据付费，而是为每一行**被保留**的数据付费。

算法：

```text
1) Copy the rows you want to keep into a temporary table
2) TRUNCATE the original table (fast)
3) Insert the preserved rows back into the original table
4) Drop the temp table
```

是的：它被叫作“核”是有原因的。它刻意钝重。

---

## 为什么它快

收益是机械性的：

| Operation | Rough cost | Why |
|---|---:|---|
| `TRUNCATE` | ~O(1) | drops and recreates the table (metadata-level) |
| `CREATE TABLE … AS SELECT` | O(k) | sequential scan + bulk write for kept rows |
| `INSERT … SELECT` | O(k) | bulk insert; no “delete tax” |

没有逐行删除开销。被移除的行也没有索引更新（因为它们一次性没了）。

---

## 什么时候用它（以及什么时候别用）

### 适合用在

- 你要删除表里的**大部分**数据（还是那条线：**约 80% 以上**，这时它开始发光）。
- 你能清楚定义“要保留的行”。
- 你可以接受短暂不可用 / 维护窗口。
- 这张表没有被其他表的外键活跃引用（或者你能安全地管理约束）。
- 你有**足够的磁盘空间**放临时表。

### 不要用在

- 你需要**零停机**。
- 这张表被你不能碰的外键大量引用。
- 你*必须*触发 DELETE triggers。
- 你只删除少数行（分块 delete 可能是更简单的胜利）。

---

## 一个实用的决策规则

如果你想在评审里用一句话说清楚：

> 如果这次删除会移除表里的大部分数据，就停止删除。保留并重建。

或者，如果你更喜欢 ASCII：

```text
How much are you deleting?

< 50%     -> chunked DELETE (and index-aware filters)
50–80%    -> measure both approaches
> 80%     -> TRUNCATE + reinsert (if constraints allow)
```

---

## 实现（SQL）

最小形状是这样：

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

生产里有两点很重要：

- 在 MySQL 里，`TRUNCATE` 是 DDL。它会**隐式提交**，不能像普通事务那样回滚。
- 你需要维护窗口和备份。这不是“上线试试看”的东西。

---

## 实现（Laravel/PHP）

这是我在需要时实际会用的版本：

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

一点橡皮鸭能量：再读一遍这个函数，问问未来的自己：

> “我*确定*这张表可以短暂清空一下吗？”

如果答案不是毫不含糊的“是”，这就不是你的工具。

---

## 你必须考虑的坑

### 自增值会重置

`TRUNCATE` 会重置 `AUTO_INCREMENT`。如果你需要保留它：

```sql
SELECT MAX(id) FROM big_table;
ALTER TABLE big_table AUTO_INCREMENT = <max_id + 1>;
```

### 外键

如果其他表引用这张表，`TRUNCATE` 可能会被禁止，或者不安全。不要“先把 checks 关了”然后祈祷。

### 触发器

`TRUNCATE` **不会**触发 DELETE triggers。如果你需要触发器的副作用，那你又回到了 `DELETE`。

### 磁盘空间

你需要给被保留的数据集（临时表）留出空间。先检查：

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

### 复制 / binlog

这是 DDL + 批量插入。它仍然可能造成 replica lag。要有意识地做，监控 lag，不要假装它免费。

---

## 如果你需要（接近）零停机

这篇文章讲的是一把很快的锤子。

如果你需要手术刀，用那些本来就是为此而造的工具：

- `pt-archiver`（Percona Toolkit），用于带有复制友好节奏的分批删除
- 分区策略（删分区，而不是删行）
- shadow-table 方案 + 受控 swap（更复杂，活动部件更多）

---

## 结尾想法

这不是什么聪明小技巧。它是在选择你要为哪种工作付费。
