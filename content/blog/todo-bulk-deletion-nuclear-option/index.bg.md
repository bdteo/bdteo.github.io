---
lang: "bg"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "5f58e97245018bc8"
title: "Ядрената опция за масови изтривания: TRUNCATE + повторно вмъкване (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "Когато трябва да изтриеш ~80%+ от MySQL таблица, спри да използваш DELETE. Копирай редовете, които искаш да запазиш, направи TRUNCATE, после ги вмъкни обратно — често 10-100 пъти по-бързо."
featuredImage: "./images/featured.webp"
imageCaption: "Две ръце вдигат малък сноп запазени стръкчета билки над кошница с окастрени стъбла — да запазиш важното преди голямото разчистване."
---

Трябва да изтриеш милиони редове от MySQL таблица.

Посягаш към:

```sql
DELETE FROM big_table WHERE some_condition;
```

И после гледаш как progress bar-ът остарява в реално време.

Опитваш да бъдеш отговорен и го разбиваш на парчета:

```sql
DELETE FROM big_table WHERE some_condition LIMIT 10000;
-- repeat until done
```

По-добре. Все още бавно. Все още шумно. Все още скъпо.

Ако изтриваш **по-голямата част** от таблицата (практическо правило: **~80%+**), има друг ход, груб и безмилостно ефективен:

> Не изтривай това, което не искаш. **Запази това, което искаш, и занули останалото.**

Наричам го **ядрената опция**: **TRUNCATE + повторно вмъкване**.

---

## Защо `DELETE` остава бавен (дори на парчета)

InnoDB не „маха“ редове. Той върши работа.

Много работа:

- **Операции ред по ред**: намира, заключва, маркира като изтрито.
- **Поддръжка на индекси**: всяко изтриване докосва всеки вторичен индекс.
- **Undo/redo logging**: engine-ът трябва да запази способността да върне назад и да се възстанови.
- **Въртене на buffer pool-а**: постоянно правиш страници dirty и изхвърляш полезни.
- **Влияние върху replication**: големите delete потоци са прекрасен начин да си произведеш replica lag.

Реалистична сметка на салфетка:

- 27M реда при ~6,000 реда/сек ≈ **75 минути**.

Това не е бъг. Това е моделът на разхода, който си избрал.

---

## Ядрената опция: TRUNCATE + повторно вмъкване

Тази техника обръща модела на разхода.

Вместо да плащаш за всеки изтрит ред, плащаш за всеки **запазен** ред.

Алгоритъм:

```text
1) Копирай редовете, които искаш да запазиш, във временна таблица
2) TRUNCATE на оригиналната таблица (бързо)
3) Вмъкни запазените редове обратно в оригиналната таблица
4) Изтрий временната таблица
```

И да: нарича се „ядрена“ с причина. Умишлено е тъпа сила.

---

## Защо е бързо

Печалбите са механични:

| Операция | Приблизителна цена | Защо |
|---|---:|---|
| `TRUNCATE` | ~O(1) | изтрива и пресъздава таблицата (на metadata ниво) |
| `CREATE TABLE … AS SELECT` | O(k) | sequential scan + bulk write за запазените редове |
| `INSERT … SELECT` | O(k) | bulk insert; без „delete tax“ |

Няма overhead от изтриване ред по ред. Няма обновяване на индекси за премахнатите редове (защото те изчезват наведнъж).

---

## Кога да го използваш (и кога не)

### Използвай го, когато

- Изтриваш **по-голямата част** от таблицата (пак: **~80%+** е границата, където това започва да блести).
- Можеш чисто да дефинираш „редовете за запазване“.
- Можеш да си позволиш кратка недостъпност / maintenance window.
- Таблицата не е активно реферирана от foreign keys от други таблици (или можеш безопасно да управляваш constraints).
- Имаш **достатъчно диск** за временната таблица.

### Не го използвай, когато

- Трябва ти **нулев downtime**.
- Таблицата е силно реферирана от foreign keys, които не можеш да пипнеш.
- *Трябва* да задействаш DELETE triggers.
- Изтриваш само малка част от редовете (chunked delete може да е по-простата победа).

---

## Практическо правило за решение

Ако искаш едно изречение, което можеш да кажеш на review:

> Ако delete-ът ще махне по-голямата част от таблицата, спри да триеш. Запази и изгради наново.

Или, ако предпочиташ ASCII:

```text
Колко изтриваш?

< 50%     -> chunked DELETE (и филтри, съобразени с индексите)
50–80%    -> измери и двата подхода
> 80%     -> TRUNCATE + reinsert (ако constraints позволяват)
```

---

## Имплементация (SQL)

Ето минималната форма:

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

Две бележки, които имат значение в production:

- `TRUNCATE` е DDL в MySQL. Той **implicit commit-ва** и не можеш да го върнеш назад като нормална transaction.
- Искаш maintenance window и backup. Това не е „пусни го live и да видим“.

---

## Имплементация (Laravel/PHP)

Това е версията, която реално използвам, когато ми потрябва:

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

Щипка rubber-duck енергия: прочети функцията пак и попитай бъдещото си аз —

> „Сигурен ли съм, че тази таблица може да бъде празна за момент?“

Ако отговорът не е недвусмислено да, това не е инструментът.

---

## Капани, с които трябва да се съобразиш

### Auto-increment се reset-ва

`TRUNCATE` reset-ва `AUTO_INCREMENT`. Ако трябва да го запазиш:

```sql
SELECT MAX(id) FROM big_table;
ALTER TABLE big_table AUTO_INCREMENT = <max_id + 1>;
```

### Foreign keys

Ако други таблици реферират тази, `TRUNCATE` може да е забранен или unsafe. Не „просто спирай checks“ и не се надявай.

### Triggers

`TRUNCATE` **не** задейства DELETE triggers. Ако ти трябват side effects от trigger-и, връщаш се към `DELETE`.

### Дисково пространство

Трябва ти място за запазения dataset (временната таблица). Провери първо:

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

### Replication / binlog

Това е DDL + bulk insert. Пак може да причини replica lag. Прави го умишлено, monitor-вай lag-а и не се преструвай, че е безплатно.

---

## Ако ти трябва (почти) нулев downtime

Този текст е за бързия чук.

Ако ти трябва скалпел, използвай инструментите, създадени за това:

- `pt-archiver` (Percona Toolkit) за batched deletes с pacing, щадящ репликите
- partitioning стратегии (drop partitions вместо редове)
- shadow-table подходи + контролиран swap (по-сложно, повече движещи се части)

---

## Финална мисъл

Това не е хитър трик. Това е избор за коя работа плащаш.
