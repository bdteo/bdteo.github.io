---
lang: "de"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "5f58e97245018bc8"
title: "Die nukleare Option für Bulk-Löschungen: TRUNCATE + Wiedereinfügen (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "Wenn du ~80%+ einer MySQL-Tabelle löschen musst, hör auf, DELETE zu benutzen. Kopiere die Zeilen, die du behalten willst, TRUNCATE, dann wieder einfügen - oft 10-100x schneller."
featuredImage: "./images/featured.webp"
imageCaption: "Zwei Hände heben ein kleines Bündel bewahrter Kräuterzweige über einen Korb mit abgeschnittenen Stielen - behalten, worauf es ankommt, bevor der große Schwung kommt."
---

Du musst Millionen von Zeilen aus einer MySQL-Tabelle löschen.

Du greifst zu:

```sql
DELETE FROM big_table WHERE some_condition;
```

Und dann siehst du zu, wie der Fortschrittsbalken in Echtzeit altert.

Du versuchst, verantwortungsvoll zu sein, und machst es in Chunks:

```sql
DELETE FROM big_table WHERE some_condition LIMIT 10000;
-- repeat until done
```

Besser. Immer noch langsam. Immer noch laut. Immer noch teuer.

Wenn du den **Großteil** der Tabelle löschst (Faustregel: **~80%+**), gibt es einen anderen Zug, der brutal effektiv ist:

> Lösche nicht, was du nicht willst. **Behalte, was du willst, und spreng den Rest weg.**

Ich nenne es die **nukleare Option**: **TRUNCATE + Wiedereinfügen**.

---

## Warum `DELETE` langsam bleibt (auch in Chunks)

InnoDB "entfernt" Zeilen nicht einfach. Es arbeitet.

Viel Arbeit:

- **Operationen Zeile für Zeile**: finden, sperren, als gelöscht markieren.
- **Indexpflege**: jede Löschung berührt jeden sekundären Index.
- **Undo-/Redo-Logging**: die Engine muss Rollback und Recovery weiterhin ermöglichen.
- **Buffer-Pool-Churn**: du machst ständig Pages dirty und verdrängst nützliche.
- **Replikationsauswirkung**: große Delete-Streams sind eine hervorragende Methode, Replica-Lag zu erzeugen.

Realitätscheck auf der Rückseite eines Umschlags:

- 27 Mio. Zeilen bei ~6.000 Zeilen/Sek. ≈ **75 Minuten**.

Das ist kein Bug. Das ist das Kostenmodell, das du gewählt hast.

---

## Die nukleare Option: TRUNCATE + Wiedereinfügen

Diese Technik dreht das Kostenmodell um.

Statt pro gelöschter Zeile zu zahlen, zahlst du pro **behaltener** Zeile.

Algorithmus:

```text
1) Copy the rows you want to keep into a temporary table
2) TRUNCATE the original table (fast)
3) Insert the preserved rows back into the original table
4) Drop the temp table
```

Und ja: Sie heißt aus gutem Grund "nuklear". Sie ist absichtlich stumpf.

---

## Warum es schnell ist

Die Gewinne sind mechanisch:

| Operation | Grobe Kosten | Warum |
|---|---:|---|
| `TRUNCATE` | ~O(1) | löscht und erstellt die Tabelle neu (auf Metadatenebene) |
| `CREATE TABLE … AS SELECT` | O(k) | sequentieller Scan + Bulk-Write für behaltene Zeilen |
| `INSERT … SELECT` | O(k) | Bulk-Insert; keine "Delete-Steuer" |

Kein Delete-Overhead pro Zeile. Keine Indexupdates für die entfernten Zeilen (weil sie in einem Zug weg sind).

---

## Wann du es verwenden solltest (und wann nicht)

### Verwende es, wenn

- Du den **Großteil** der Tabelle löschst (noch einmal: **~80%+** ist die Linie, ab der das hier anfängt zu glänzen).
- Du die "Zeilen, die bleiben sollen" sauber definieren kannst.
- Du kurze Nichtverfügbarkeit / ein Wartungsfenster verkraften kannst.
- Die Tabelle nicht aktiv von Foreign Keys anderer Tabellen referenziert wird (oder du Constraints sicher handhaben kannst).
- Du **genug Speicherplatz** für die temporäre Tabelle hast.

### Verwende es nicht, wenn

- Du **Zero Downtime** brauchst.
- Die Tabelle stark von Foreign Keys referenziert wird, die du nicht anfassen kannst.
- Du DELETE-Trigger *zwingend* auslösen musst.
- Du nur eine Minderheit der Zeilen löschst (Chunked Delete kann der einfachere Gewinn sein).

---

## Eine praktische Entscheidungsregel

Wenn du einen Satz willst, den du in einem Review sagen kannst:

> Wenn das Delete den Großteil der Tabelle entfernen würde, hör auf zu löschen. Bewahren und neu aufbauen.

Oder, wenn du ASCII bevorzugst:

```text
How much are you deleting?

< 50%     -> chunked DELETE (and index-aware filters)
50–80%    -> measure both approaches
> 80%     -> TRUNCATE + reinsert (if constraints allow)
```

---

## Implementierung (SQL)

Hier ist die Minimalform:

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

Zwei Hinweise, die in Produktion wichtig sind:

- `TRUNCATE` ist DDL in MySQL. Es **committet implizit**, und du kannst es nicht wie eine normale Transaktion zurückrollen.
- Du willst ein Wartungsfenster und ein Backup. Das ist kein "probieren wir live und schauen mal".

---

## Implementierung (Laravel/PHP)

Das ist die Version, die ich tatsächlich verwende, wenn ich sie brauche:

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

Eine Prise Rubber-Duck-Energie: Lies die Funktion noch einmal und frag dein Zukunfts-Ich -

> "Bin ich *sicher*, dass diese Tabelle für einen Moment geleert werden darf?"

Wenn die Antwort kein eindeutiges Ja ist, ist das nicht das richtige Werkzeug.

---

## Fallstricke, die du einplanen musst

### Auto-increment resets

`TRUNCATE` setzt `AUTO_INCREMENT` zurück. Wenn du es erhalten musst:

```sql
SELECT MAX(id) FROM big_table;
ALTER TABLE big_table AUTO_INCREMENT = <max_id + 1>;
```

### Foreign Keys

Wenn andere Tabellen diese hier referenzieren, kann `TRUNCATE` verboten oder unsicher sein. Nicht einfach "Checks deaktivieren" und hoffen.

### Trigger

`TRUNCATE` löst **keine** DELETE-Trigger aus. Wenn du Trigger-Nebenwirkungen brauchst, bist du wieder bei `DELETE`.

### Speicherplatz

Du brauchst Platz für den erhaltenen Datensatz (temporäre Tabelle). Erst prüfen:

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

### Replikation / binlog

Das ist DDL + Bulk-Insert. Es kann trotzdem Replica-Lag verursachen. Mach es absichtlich, monitore den Lag, und tu nicht so, als wäre es gratis.

---

## Wenn du (nahezu) Zero Downtime brauchst

Dieser Post handelt vom schnellen Hammer.

Wenn du ein Skalpell brauchst, nimm die Werkzeuge, die dafür gebaut wurden:

- `pt-archiver` (Percona Toolkit) für Batch-Deletes mit replica-freundlichem Pacing
- Partitionierungsstrategien (Partitionen statt Zeilen droppen)
- Shadow-Table-Ansatz + kontrollierter Swap (komplexer, mehr bewegliche Teile)

---

## Schlussgedanke

Das ist kein cleverer Trick. Es ist die Entscheidung, für welche Arbeit du bezahlst.
