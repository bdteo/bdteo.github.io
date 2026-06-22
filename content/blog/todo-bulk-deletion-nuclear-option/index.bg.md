---
lang: "bg"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "ab64e631f1cf34f9"
title: "Ядрената опция за масови изтривания: TRUNCATE + повторно вмъкване (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "Практично ръководство за решения при масови изтривания в MySQL/InnoDB: DELETE, пакетен DELETE, drop на partition, table swap или TRUNCATE + повторно вмъкване."
tags: ["mysql", "innodb", "бази данни", "производителност", "операции", "laravel"]
featuredImage: "./images/featured.webp"
imageCaption: "Две ръце вдигат малък сноп запазени стръкчета билки над кошница с окастрени стъбла — да запазиш важното преди голямото разчистване."
audioUrl: "/audio/articles/todo-bulk-deletion-nuclear-option/bg/5egO01tkUjEzu7xSSE8M-d78f2e7c17bb.m4a"
audioDuration: "22:00"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/todo-bulk-deletion-nuclear-option.bg.md"
---

Трябва да изтриеш милиони редове от MySQL таблица.

Първият честен импулс е този:

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01';
```

После заявката върви достатъчно дълго, за да се превърнеш в друг човек.

Затова правиш отговорното нещо:

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01'
ORDER BY id
LIMIT 10000;
```

Повтаряш, докато приключи. Добавяш пауза. Гледаш репликите. Надяваш се историята със заключванията да остане скучна.

Това често е правилният отговор. Но ако изтриваш **по-голямата част** от таблицата, изтриването ред по ред не е благородно. Просто е скъпо.

Има друг ход:

> Не изтривай това, което не искаш. Запази това, което искаш, възстанови таблицата, и продължи.

Това е ядрената опция: **копирай редовете за запазване, направи `TRUNCATE`, после ги вмъкни обратно**.

Тя е бърза, защото сменя единицата работа. Спираш да плащаш за всеки изтрит ред и започваш да плащаш за всеки запазен ред.

Също така е опасна, защото `TRUNCATE` не е учтив `DELETE`. В MySQL има DDL характер, прави имплицитен commit, нулира `AUTO_INCREMENT`, не задейства `ON DELETE` triggers и има реални последици за foreign keys и replication. Точно затова заслужава истински runbook, не умно фрагментче, залепено в production в 2 сутринта.

## Матрицата за решение

Използвай грубия инструмент само когато формата на проблема наистина иска груб инструмент.

| Подход | Най-добър когато | Достъпност | История за rollback | Основни капани |
|---|---|---|---|---|
| Обикновен `DELETE` | Изтриваш малък, индексиран отрязък | Обикновено онлайн, но locks пак могат да болят | Transactional, ако е в разумна транзакция | Бавен за огромни множества; докосва indexes; генерира undo/redo/binlog работа |
| Пакетен `DELETE` | Трябва ти темпо за жива система и можеш да понесеш по-дълга задача | Онлайн, ако batch-овете са малки и индексирани | Всеки batch може да се commit-ва самостоятелно | Все още е ред по ред; може да създаде replica lag; изисква водене на състояние за pause/resume |
| Partition drop/truncate | Редовете пасват чисто на цели partitions | Кратък DDL прозорец | Няма row-level rollback | Работи само ако partitioning-ът е проектиран за това; границите на partitions не прощават |
| Table swap | Можеш да построиш replacement table и атомарно да я преименуваш | Кратък swap прозорец, но copy фазата иска контрол върху writes | Дръж старата таблица, докато не провериш | Schema, triggers, grants, foreign keys и writes по време на copy искат план |
| `TRUNCATE` + повторно вмъкване | Изтриваш почти всичко и можеш да спреш writes | Maintenance window; таблицата е празна между truncate и restore | Не е rollback-friendly | Foreign keys, implicit commits, triggers, auto-increment, binlogs и verification |

Моето практическо правило:

```text
Изтриваш < 50%   -> започни с indexed DELETE или batched DELETE
Изтриваш 50-80%  -> измери batched DELETE срещу rebuild подходи
Изтриваш > 80%   -> сериозно помисли за preserve-and-rebuild
```

Процентът не е магия. 30% delete от таблица с ужасни indexes пак може да е болезнен. 90% delete от малка таблица може да не заслужава церемония. Истинският въпрос е: **коя страна на данните е по-малка и по-безопасна за работа?**

## Защо масовият `DELETE` боли в InnoDB

InnoDB не поглежда твоя `WHERE` clause, не въздиша мечтателно и не маха range от байтове от диска.

Той трябва да върши database работа:

- Да намира редове през index или да сканира прекалено много.
- Да заключва records, а понякога и gaps, по сканираните index ranges.
- Да поддържа всеки засегнат secondary index.
- Да пише undo, за да може delete-ът да се върне назад.
- Да пише redo, за да работи crash recovery.
- Да пише binary logs, за да има история за replication и recovery.
- Да оставя purge работа, която InnoDB да чисти, след като transactions пуснат старите versions.

[Документацията на MySQL за InnoDB locks](https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html) си струва да се прочете с кафе и малко чувство за ужас: `DELETE` заключва index records, които сканира, не само редовете, за които мисловният ти модел вярва, че са съвпаднали.

Пакетните deletes намаляват blast radius, като правят всяка transaction по-малка:

```sql
DELETE FROM big_table
WHERE created_at < @cutoff
ORDER BY id
LIMIT 10000;
```

Това е полезно. Дава време на репликите да дишат. Позволява ти да спреш. Не позволява undo да стане една огромна transaction.

Но не сменя основния cost model. Все още изтриваш ред по ред.

## Защо `TRUNCATE` сменя cost model-а

`TRUNCATE TABLE` е бърз, защото MySQL го третира повече като drop и recreate на таблицата, отколкото като изтриване на всеки ред. [Документацията на MySQL за `TRUNCATE TABLE`](https://dev.mysql.com/doc/refman/8.4/en/truncate-table.html) изрежда важните разлики: заобикаля нормалния DML delete path, причинява имплицитен commit, не може да се rollback-не като нормален DML statement и не задейства `ON DELETE` triggers.

Затова вместо това:

```text
изтрий 80 милиона реда
запази 20 милиона реда
```

Правиш това:

```text
копирай 20 милиона реда
изпразни таблицата бързо
вмъкни обратно 20 милиона реда
```

Това е целият номер. Implementation details са мястото, където са заровени мините.

## Не започвай със SQL. Започни с keep set-а.

Най-безопасната версия на тази операция се формулира около редовете, които оцеляват.

Не:

```text
Изтрий всичко по-старо от X.
```

А:

```text
След тази операция таблицата съдържа точно редовете, които съвпадат с Y.
```

Тази рамка има значение, защото запазените редове стават твоята recovery anchor.

Замрази променливите стойности, преди да мериш каквото и да било:

```sql
SET @cutoff := TIMESTAMP('2025-01-01 00:00:00');
```

После преброй двете страни:

```sql
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN created_at >= @cutoff THEN 1 ELSE 0 END) AS keep_rows,
  SUM(CASE WHEN created_at <  @cutoff THEN 1 ELSE 0 END) AS delete_rows
FROM big_table;
```

Провери, че MySQL може да намери тези редове, без да падне от скала:

```sql
EXPLAIN
SELECT id
FROM big_table
WHERE created_at >= @cutoff
ORDER BY id;
```

Ако този plan е full table scan върху таблица, която още приема writes, спри и проектирайте maintenance window както трябва. Ядрената опция не е заместител на това да знаеш как се достъпва таблицата.

## Preflight проверките, които искам преди да пипам production

Ако това се случва в 2 сутринта, checklist-ът не е бюрокрация. Това е начинът да не се пазариш с терминала.

### 1. Потвърди foreign-key връзките

Намери child tables, които реферират таблицата, която искаш да изпразниш:

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

Ако редове в други таблици реферират `big_table`, не прави лекомислено `SET FOREIGN_KEY_CHECKS=0` с надежда. MySQL ти позволява да изключиш проверките за някои maintenance operations, но когато ги включиш пак, той **не** сканира съществуващите редове, за да докаже, че са консистентни. Това е полезно при контролирани reloads. Като действие на сляпо е ужасяващо.

За referenced parent table обикновен `DELETE` с `ON DELETE CASCADE` може да е семантично необходим. `TRUNCATE` няма да пусне тези cascades вместо теб.

### 2. Провери triggers

```sql
SELECT
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE EVENT_OBJECT_SCHEMA = DATABASE()
  AND EVENT_OBJECT_TABLE = 'big_table';
```

Ако таблицата има `DELETE` triggers, които пишат audit rows, чистят caches, обновяват rollups или уведомяват други systems, `TRUNCATE` ги заобикаля. Това е или точно каквото искаш, или точно как създаваш много тих incident.

### 3. Провери disk space

Трябва ти място за запазените редове някъде.

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb,
  ROUND((data_length + index_length) / 1024 / 1024 / 1024, 2) AS total_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

Ако запазваш 20% от 500GB таблица, временната copy не е въображаема. Това е реален object, който се състезава за реален disk и I/O.

### 4. Провери binary logs и replicas

`TRUNCATE` се log-ва за replication като statement. Повторното вмъкване все още е голям write. Това може да е много по-добре от logging на милиони row deletes, но не е безплатно.

Преди операцията знай:

- текущия replica lag,
- дали replicas могат да понесат rebuild-а,
- дали delayed replicas са част от rollback историята ти,
- дали backup плюс binary logs могат да те върнат до минутата преди промяната.

[Бележката на MySQL за replication при `TRUNCATE`](https://dev.mysql.com/doc/refman/8.4/en/replication-features-truncate.html) е кратка, но operational implication-ът е голям: това не е просто локална хирургия върху таблица.

### 5. Имай restore path, който наистина си тествал

"Имаме backups" не е restore plan.

Минимумът е да знаеш кой backup ще restore-неш, къде ще го restore-неш и как ще извлечеш само тази таблица, ако резултатът е грешен. За сериозна production table искам или скорошен physical backup с тестван restore path, или умишлен logical export на редовете, които ще запазя.

Собствената [документация на MySQL за backup](https://dev.mysql.com/doc/refman/8.4/en/backup-methods.html) подчертава full backups плюс binary logs за point-in-time recovery. Това има значение тук, защото лош bulk delete е logical mistake, не disk failure.

## Практическият runbook за `TRUNCATE` + повторно вмъкване

Да приемем, че таблицата може безопасно да бъде празна за кратко:

- няма child tables, които зависят от редовете по време на операцията,
- writes са спрени или application-ът е в maintenance mode,
- keep condition-ът е frozen,
- backups са реални,
- replicas са обмислени.

Използвай explicit columns. Знам, че `SELECT *` изглежда чисто. Това е и начинът generated columns, invisible columns, drift в column order и бъдещи migrations да направят нощта ти по-интересна.

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

Преброй запазената copy, преди да направиш нещо irreversible:

```sql
SELECT COUNT(*) AS keep_rows
FROM big_table_keep_20251213;
```

После идва точката, от която няма леко връщане:

```sql
TRUNCATE TABLE big_table;
```

Върни запазените редове:

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

Освежи optimizer statistics:

```sql
ANALYZE TABLE big_table;
```

Провери преди cleanup:

```sql
SELECT COUNT(*) AS final_rows
FROM big_table;

SELECT MIN(created_at) AS oldest_remaining_row
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Изтрий запазената copy едва след като application-ът е обратно, counts съвпадат и си погледнал реалното product behavior, което зависи от тази таблица:

```sql
DROP TABLE big_table_keep_20251213;
```

Тази запазена таблица не е clutter по време на операцията. Тя е въжето.

## Вариант с table swap, когато прозорецът с празна таблица е неприемлив

Собствената документация на MySQL за `DELETE` предлага сродна стратегия за огромни InnoDB deletes: копирай редовете, които искаш, в таблица със същата structure, атомарно преименувай таблиците, после drop-ни старата.

Формата е:

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

Самият rename е atomic: други sessions не виждат полу-преименувана двойка. Но не го бъркай с "zero downtime."

Ако старата таблица получава writes, докато `big_table_new` се попълва, тези writes не се копират магически. Трябва ти write pause, delta-capture plan или нарочно по-сложна online migration.

Също: `CREATE TABLE ... LIKE` копира column attributes и indexes, но не прави всеки околен object и dependency безопасен. Провери triggers, foreign keys, grants, partitioning, generated columns и application assumptions. Името на таблицата може да оцелее при swap-а; operational context-ът може да не оцелее.

## Partitioning: най-добрата версия, ако си планирал предварително

Ако редовете съвпадат с partitions, drop или truncate на partition често е най-чистият отговор.

```sql
ALTER TABLE events DROP PARTITION p2024_01;
```

или:

```sql
ALTER TABLE events TRUNCATE PARTITION p2024_01;
```

Това е порасналата версия на bulk deletion: проектирайте таблицата така, че старите данни да излизат през врата, не през шредер.

Уловката е очевидна и пак боли: partition boundary трябва да съвпада с retention rule. Ако cleanup condition-ът ти е "delete every completed task for customers on the old billing plan except the ones with unresolved exports," partitioning няма да те спаси.

Още една MySQL-специфична особеност: user-defined partitioned InnoDB tables и foreign keys имат restrictions. Не си обещавай partition drops върху schema, която законно не може да се partition-не както ти трябва.

## Капаните, директно

### `TRUNCATE` commit-ва имплицитно

Това е голямото. `TRUNCATE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` и `RENAME TABLE` всички живеят в implicit-commit света на MySQL. Да увиеш runbook-а в `START TRANSACTION` не го прави безопасно обратим.

Ако планът ти зависи от "ще rollback-нем, ако изглежда грешно," нямаш план.

### Foreign keys не са checkbox

Ако таблицата е parent, child rows другаде може да зависят от нея. Ако таблицата е child, редът на reinsert има значение. Ако изключиш `foreign_key_checks`, MySQL няма да валидира старите редове, когато ги включиш обратно.

Безопасната версия е скучна: разбери dependency graph-а и или дръж тази техника далеч от него, или включи related tables в maintenance plan-а.

### `ON DELETE` triggers не се задействат

Това може да е performance benefit. Може и да заобиколи audit trails и denormalized counters.

Ако side effect-ът от trigger-а има значение, използвай `DELETE` или изрично пресъздай side effect-а в runbook-а.

### `AUTO_INCREMENT` се нулира

`TRUNCATE` нулира counter-а. Ако reinsert-неш explicit IDs, MySQL често advance-ва next value, докато вижда тези IDs, но аз пак го проверявам.

```sql
SELECT MAX(id) AS max_id
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Ако следващата `AUTO_INCREMENT` стойност е грешна, поправи я умишлено:

```sql
ALTER TABLE big_table AUTO_INCREMENT = 123456789;
```

Не гадай числото. Прочети го от възстановените данни.

### `CREATE TABLE ... SELECT` не е същото като `CREATE TABLE ... LIKE`

Това има значение.

`CREATE TABLE keep AS SELECT ...` е удобно и може да е бързо, но MySQL не създава автоматично indexes за новата таблица и някои attributes не се preserve-ват така, както хората предполагат.

За operational runbook предпочитам:

```sql
CREATE TABLE keep_table LIKE source_table;
INSERT INTO keep_table (explicit, column, list)
SELECT explicit, column, list
FROM source_table
WHERE keep_condition;
```

Копирането може да отнеме повече време, защото indexes съществуват върху keep table. С удоволствие ще платя част от този cost, ако алтернативата е да открия при restore, че scratch table не е имала формата на source.

### Constraints все още имат значение след truncate

Редовете идват от същата таблица, така че би трябвало да удовлетворяват същите primary keys, unique keys, checks и non-null constraints. "Би трябвало" не е verification strategy.

Ако preserved set-ът ти се произвежда чрез joins, deduping, transformations или code, а не чрез директен `SELECT` от оригиналната таблица, валидирай го преди truncate:

```sql
SELECT id, COUNT(*) AS duplicates
FROM big_table_keep_20251213
GROUP BY id
HAVING COUNT(*) > 1
LIMIT 10;
```

### Replicas пак могат да изостанат

Този метод може да намали работата спрямо огромен row-by-row delete, но replicas пак трябва да приложат truncate и bulk insert. Гледай ги.

Ако delayed replica е safety net-ът ти, кажи го на глас преди операцията. Ако всички replicas трябва да останат почти real time, throttle-ни restore-а или избери друг подход.

### Application-ът не трябва да пише през copy прозореца

Това е тихият footgun.

Ако копираш keep rows в 02:00:00 и application-ът insert-не нови валидни редове в 02:00:05, тези редове не са в keep table. По-късен `TRUNCATE` ги маха.

Maintenance mode не е само за user experience. Той е data correctness.

## Предупреждение в Laravel контекст

Ако пускаш това от Laravel, важното не е facade-ът. Важна е границата.

Не крий това в generic helper, който приема arbitrary table names и raw `WHERE` strings. Identifiers трябва да са code constants. Keep condition-ът трябва да идва от reviewed code, не от user input. И `DB::transaction()` не прави DDL rollback-safe в MySQL.

Skeleton-ът, на който вярвам, прилича повече на command, отколкото на reusable library function:

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

Тази confirmation step не е театър. Това е паузата, в която хващаш "чакай, keep_rows е 11, не 11 милиона."

## Малък checklist за 2 сутринта

Преди:

- Знам точния keep condition.
- Замразих всякакъв time-based cutoff.
- Преброих total, keep и delete rows.
- Проверих foreign keys и triggers.
- Проверих disk space за preserved copy.
- Знам backup и restore path-а.
- Проверих replica lag и binlog implications.
- Спрях writes или имам истински delta-capture plan.

По време:

- Създавам keep table.
- Преброявам я.
- Сравнявам count-а с preflight числото.
- Пускам irreversible step-а само след като числата имат смисъл.
- Вмъквам обратно с explicit columns.
- Пускам analyze и проверявам.

След:

- Final row count съвпада с keep count.
- Boundary rows изглеждат правилно.
- Application behavior е проверено, не само SQL output.
- Replicas са caught up или умишлено catching up.
- Keep table остава, докато вече не ми трябва въжето.

## Кога не бих използвал това

Не бих използвал `TRUNCATE` + повторно вмъкване, ако:

- таблицата има важни `DELETE` triggers,
- foreign-key cascades са правилното business behavior,
- writes не могат да бъдат спрени,
- keep condition-ът е размит,
- delete-ът е достатъчно малък за batched `DELETE`,
- таблицата вече е partitioned по retention boundary,
- организацията не може да restore-не таблицата, ако runbook-ът е грешен.

Последното е тестът. Ако restore на таблицата би бил хаос, не избирай операция, чийто failure mode е "restore-ни таблицата."

## Финална мисъл

Ядрената опция не е хитра, защото `TRUNCATE` е бърз. Всички знаят, че `TRUNCATE` е бърз.

Полезната идея е да решиш каква работа искаш database-ът да свърши.

Ако изтриваш почти всичко, да караш InnoDB внимателно да изтрие почти всичко може да е погрешната добрина. Запази важното. Построй наново около него. Проверявай така, сякаш умореното ти бъдещо аз ще чете output-а с едно отворено око.
