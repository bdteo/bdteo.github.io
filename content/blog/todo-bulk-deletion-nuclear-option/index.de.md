---
lang: "de"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "ab64e631f1cf34f9"
title: "Die nukleare Option für Massenlöschungen: TRUNCATE + Wiedereinfügen (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "Ein praktischer MySQL/InnoDB-Entscheidungsleitfaden für massive Löschungen: DELETE, batched DELETE, Partition-Drop, Table-Swap oder TRUNCATE + Wiedereinfügen."
tags: ["mysql", "innodb", "datenbanken", "performance", "betrieb", "laravel"]
featuredImage: "./images/featured.webp"
imageCaption: "Zwei Hände heben ein kleines Bündel bewahrter Kräuterzweige über einen Korb mit abgeschnittenen Stielen — behalten, worauf es ankommt, bevor der große Schwung kommt."
audioUrl: "/audio/articles/todo-bulk-deletion-nuclear-option/de/LTo9oDjTW1FdEgMfiXWQ-b641357f46ad.m4a"
audioDuration: "24:01"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/todo-bulk-deletion-nuclear-option.de.md"
---

Du musst Millionen von Zeilen aus einer MySQL-Tabelle löschen.

Der ehrliche erste Instinkt ist dieser:

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01';
```

Dann läuft die Query lange genug, dass du zu einem anderen Menschen wirst.

Also machst du das Verantwortungsvolle:

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01'
ORDER BY id
LIMIT 10000;
```

Wiederholen, bis es fertig ist. Einen Sleep einbauen. Replikas beobachten. Hoffen, dass die Lock-Geschichte langweilig bleibt.

Das ist oft die richtige Antwort. Aber wenn du **den Großteil** der Tabelle löschst, ist eine Löschung Zeile für Zeile nicht edel. Sie ist einfach teuer.

Es gibt einen anderen Zug:

> Lösche nicht, was du nicht willst. Bewahre, was du willst, baue die Tabelle neu auf, und mach weiter.

Das ist die nukleare Option: **die zu behaltenden Zeilen kopieren, `TRUNCATE`, dann wieder einfügen**.

Sie ist schnell, weil sie die Arbeitseinheit verändert. Du zahlst nicht mehr für jede gelöschte Zeile, sondern für jede bewahrte Zeile.

Sie ist auch gefährlich, weil `TRUNCATE` kein höfliches `DELETE` ist. In MySQL hat es DDL-Charakter, es committet implizit, setzt `AUTO_INCREMENT` zurück, überspringt `ON DELETE`-Triggers und hat echte Folgen für Foreign Keys und Replikation. Genau deshalb verdient es ein ordentliches Runbook, nicht ein cleveres Snippet, das um 2 Uhr morgens in Production geklebt wird.

## Die Entscheidungsmatrix

Nutze das stumpfe Werkzeug nur, wenn die Form des Problems wirklich ein stumpfes Werkzeug will.

| Ansatz | Am besten wenn | Verfügbarkeit | Rollback-Geschichte | Hauptfallen |
|---|---|---|---|---|
| Einfaches `DELETE` | Du löschst einen kleinen, indexierten Ausschnitt | Meist online, aber Locks können trotzdem wehtun | Transaktional, wenn es in einer vernünftigen Transaktion bleibt | Langsam für riesige Mengen; berührt Indexes; erzeugt undo/redo/binlog-Arbeit |
| Batched `DELETE` | Du brauchst Live-System-Pacing und kannst einen längeren Job tolerieren | Online, wenn Batches klein und indexiert sind | Jeder Batch kann unabhängig committen | Immer noch Zeile für Zeile; kann Replica-Lag erzeugen; braucht Pause/Resume-Bookkeeping |
| Partition drop/truncate | Zeilen passen sauber auf ganze Partitionen | Kurzes DDL-Fenster | Kein Rollback auf Zeilenebene | Funktioniert nur, wenn Partitioning dafür entworfen wurde; Partition-Grenzen verzeihen wenig |
| Table swap | Du kannst eine Ersatztabelle bauen und atomar umbenennen | Kurzes Swap-Fenster, aber die Copy-Phase braucht Schreibkontrolle | Alte Tabelle bis zur Verifikation behalten | Schema, Triggers, Grants, Foreign Keys und Writes während der Kopie brauchen einen Plan |
| `TRUNCATE` + Wiedereinfügen | Du löschst fast alles und kannst Writes pausieren | Maintenance window; die Tabelle ist zwischen truncate und restore leer | Nicht rollback-freundlich | Foreign Keys, implicit commits, triggers, auto-increment, binlogs und verification |

Meine persönliche Faustregel:

```text
Löschen < 50%   -> mit indexed DELETE oder batched DELETE anfangen
Löschen 50-80%  -> batched DELETE gegen Rebuild-Ansätze messen
Löschen > 80%   -> preserve-and-rebuild ernsthaft erwägen
```

Der Prozentsatz ist keine Magie. Eine 30%-Löschung aus einer Tabelle mit furchtbaren Indexes kann trotzdem schmerzhaft sein. Eine 90%-Löschung aus einer kleinen Tabelle verdient vielleicht kein Ritual. Die eigentliche Frage ist: **Welche Seite der Daten ist kleiner und sicherer zu bearbeiten?**

## Warum massives `DELETE` InnoDB weh tut

InnoDB schaut nicht auf deine `WHERE`-Klausel, seufzt sehnsüchtig und entfernt einen Byte-Bereich von der Platte.

Es muss Datenbankarbeit leisten:

- Zeilen über einen Index finden oder viel zu viel scannen.
- Records, und manchmal gaps, entlang der gescannten Indexbereiche sperren.
- Jeden betroffenen Secondary Index pflegen.
- Undo schreiben, damit das Delete zurückgerollt werden kann.
- Redo schreiben, damit Crash Recovery funktioniert.
- Binary logs schreiben, damit Replikation und Recovery eine Historie haben.
- Purge-Arbeit hinterlassen, die InnoDB aufräumt, nachdem Transaktionen alte Versionen freigegeben haben.

Die [MySQL-Dokumentation zu InnoDB-Locks](https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html) lohnt sich mit Kaffee und einem kleinen Gefühl von Unbehagen: `DELETE` sperrt die Index-Records, die es scannt, nicht nur die Zeilen, die dein mentales Modell für Treffer hält.

Batched Deletes reduzieren den Blast Radius, indem sie jede Transaktion kleiner machen:

```sql
DELETE FROM big_table
WHERE created_at < @cutoff
ORDER BY id
LIMIT 10000;
```

Das ist nützlich. Es gibt Replikas Luft zum Atmen. Es lässt dich stoppen. Es verhindert, dass Undo zu einer einzigen riesigen Transaktion wird.

Aber es ändert das grundlegende Kostenmodell nicht. Du löschst immer noch Zeile für Zeile.

## Warum `TRUNCATE` das Kostenmodell ändert

`TRUNCATE TABLE` ist schnell, weil MySQL es eher wie ein Droppen und Neuerstellen der Tabelle behandelt als wie das Löschen jeder einzelnen Zeile. Die [MySQL-Dokumentation zu `TRUNCATE TABLE`](https://dev.mysql.com/doc/refman/8.4/en/truncate-table.html) nennt die wichtigen Unterschiede: Es umgeht den normalen DML-Delete-Pfad, verursacht einen impliziten Commit, kann nicht wie ein normales DML-Statement zurückgerollt werden und feuert keine `ON DELETE`-Triggers.

Also statt diesem:

```text
80 Millionen Zeilen löschen
20 Millionen Zeilen behalten
```

Machst du das:

```text
20 Millionen Zeilen kopieren
Tabelle schnell leeren
20 Millionen Zeilen wieder einfügen
```

Das ist der ganze Trick. In den Implementierungsdetails liegen die Minen.

## Beginne nicht mit SQL. Beginne mit dem Keep-Set.

Die sicherste Version dieser Operation wird über die Zeilen formuliert, die überleben.

Nicht:

```text
Alles löschen, was älter ist als X.
```

Sondern:

```text
Nach dieser Operation enthält die Tabelle genau die Zeilen, die Y entsprechen.
```

Dieser Rahmen ist wichtig, weil die bewahrten Zeilen dein Recovery-Anker werden.

Friere volatile Werte ein, bevor du irgendetwas misst:

```sql
SET @cutoff := TIMESTAMP('2025-01-01 00:00:00');
```

Dann zähle beide Seiten:

```sql
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN created_at >= @cutoff THEN 1 ELSE 0 END) AS keep_rows,
  SUM(CASE WHEN created_at <  @cutoff THEN 1 ELSE 0 END) AS delete_rows
FROM big_table;
```

Prüfe, dass MySQL diese Zeilen finden kann, ohne über eine Klippe zu fallen:

```sql
EXPLAIN
SELECT id
FROM big_table
WHERE created_at >= @cutoff
ORDER BY id;
```

Wenn dieser Plan ein full table scan über eine Tabelle ist, die noch Writes annimmt, halte an und entwirf das Maintenance window ordentlich. Die nukleare Option ist kein Ersatz dafür, zu wissen, wie auf die Tabelle zugegriffen wird.

## Preflight-Checks, die ich vor Production sehen will

Wenn das um 2 Uhr morgens passiert, ist die Checkliste keine Bürokratie. Sie ist der Weg, nicht mit einem Terminal zu verhandeln.

### 1. Foreign-Key-Beziehungen bestätigen

Finde Child Tables, die auf die Tabelle verweisen, die du leeren willst:

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

Wenn Zeilen in anderen Tabellen `big_table` referenzieren, setze nicht locker `SET FOREIGN_KEY_CHECKS=0` und hoffe. MySQL lässt dich Checks für manche Maintenance-Operationen deaktivieren, aber wenn Checks wieder aktiviert werden, scannt es bestehende Zeilen **nicht**, um ihre Konsistenz zu beweisen. Das ist nützlich für kontrollierte Reloads. Als Handbewegung ist es beängstigend.

Für eine referenzierte Parent Table kann ein einfaches `DELETE` mit `ON DELETE CASCADE` semantisch notwendig sein. `TRUNCATE` wird diese Cascades nicht für dich ausführen.

### 2. Triggers prüfen

```sql
SELECT
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE EVENT_OBJECT_SCHEMA = DATABASE()
  AND EVENT_OBJECT_TABLE = 'big_table';
```

Wenn die Tabelle `DELETE`-Triggers hat, die Audit-Zeilen schreiben, Caches löschen, Rollups aktualisieren oder andere Systeme benachrichtigen, umgeht `TRUNCATE` sie. Das ist entweder genau das, was du willst, oder genau so erzeugst du einen sehr stillen Incident.

### 3. Speicherplatz prüfen

Du brauchst irgendwo Platz für die bewahrten Zeilen.

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb,
  ROUND((data_length + index_length) / 1024 / 1024 / 1024, 2) AS total_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

Wenn du 20% einer 500GB-Tabelle behältst, ist die temporäre Kopie nicht imaginär. Sie ist ein echtes Objekt, das um echten Speicherplatz und echte I/O konkurriert.

### 4. Binary logs und Replikas prüfen

`TRUNCATE` wird für Replikation als Statement geloggt. Das Wiedereinfügen ist immer noch ein großer Write. Das kann viel besser sein, als Millionen von Row Deletes zu loggen, aber es ist nicht kostenlos.

Vor der Operation solltest du wissen:

- aktueller replica lag,
- ob Replikas den Rebuild tolerieren können,
- ob delayed replicas Teil deiner Rollback-Geschichte sind,
- ob dein Backup plus binary logs dich zur Minute vor der Änderung zurückbringen können.

Die [MySQL-Replikationsnotiz zu `TRUNCATE`](https://dev.mysql.com/doc/refman/8.4/en/replication-features-truncate.html) ist kurz, aber die operative Implikation ist groß: Das ist nicht nur lokale Tabellenchirurgie.

### 5. Einen Restore-Pfad haben, den du wirklich getestet hast

"Wir haben Backups" ist kein Restore-Plan.

Mindestens solltest du wissen, welches Backup du wiederherstellen würdest, wo du es wiederherstellen würdest und wie du nur diese Tabelle extrahieren würdest, falls das Ergebnis falsch ist. Für eine ernsthafte Production Table will ich entweder ein aktuelles physisches Backup mit getestetem Restore-Pfad oder einen bewusst erstellten logischen Export der Zeilen, die ich gleich bewahre.

MySQLs eigene [Backup-Dokumentation](https://dev.mysql.com/doc/refman/8.4/en/backup-methods.html) betont Full Backups plus binary logs für Point-in-Time-Recovery. Das ist hier wichtig, weil eine schlechte Bulk-Löschung ein logischer Fehler ist, kein Plattenausfall.

## Das praktische `TRUNCATE` + Wiedereinfügen-Runbook

Nimm an, dass diese Tabelle kurz sicher geleert werden kann:

- keine Child Tables hängen während der Operation von den Zeilen ab,
- Writes sind pausiert oder die Anwendung ist im Maintenance Mode,
- die Keep Condition ist eingefroren,
- Backups sind echt,
- Replikas wurden bedacht.

Nutze explizite Spalten. Ich weiß, `SELECT *` sieht sauber aus. Es ist auch der Weg, auf dem generated columns, invisible columns, driftende Spaltenreihenfolge und zukünftige Migrations deine Nacht interessanter machen.

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

Zähle die bewahrte Kopie, bevor du etwas Irreversibles tust:

```sql
SELECT COUNT(*) AS keep_rows
FROM big_table_keep_20251213;
```

Dann der Punkt ohne lockere Rückkehr:

```sql
TRUNCATE TABLE big_table;
```

Stelle die bewahrten Zeilen wieder her:

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

Aktualisiere Optimizer-Statistiken:

```sql
ANALYZE TABLE big_table;
```

Vor dem Cleanup prüfen:

```sql
SELECT COUNT(*) AS final_rows
FROM big_table;

SELECT MIN(created_at) AS oldest_remaining_row
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Lösche die bewahrte Kopie erst, nachdem die Anwendung zurück ist, die Counts passen und du das tatsächliche Produktverhalten angesehen hast, das von dieser Tabelle abhängt:

```sql
DROP TABLE big_table_keep_20251213;
```

Diese bewahrte Tabelle ist während der Operation kein Kram. Sie ist das Seil.

## Eine Table-Swap-Variante, wenn das Empty-Table-Fenster unakzeptabel ist

MySQLs eigene `DELETE`-Dokumentation schlägt eine verwandte Strategie für riesige InnoDB-Löschungen vor: die gewünschten Zeilen in eine Tabelle mit gleicher Struktur kopieren, die Tabellen atomar umbenennen, dann die alte droppen.

Die Form ist:

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

Das Rename selbst ist atomar: andere Sessions sehen kein halb umbenanntes Paar. Aber verwechsle das nicht mit "zero downtime."

Wenn die alte Tabelle Writes erhält, während `big_table_new` befüllt wird, werden diese Writes nicht magisch kopiert. Du brauchst eine Schreibpause, einen Delta-Capture-Plan oder eine bewusst komplexere Online-Migration.

Außerdem: `CREATE TABLE ... LIKE` kopiert Spaltenattribute und Indexes, aber es macht nicht jedes umgebende Objekt und jede Abhängigkeit sicher. Prüfe Triggers, Foreign Keys, Grants, Partitioning, Generated Columns und Application Assumptions. Der Tabellenname kann den Swap überleben; der operative Kontext vielleicht nicht.

## Partitioning: die beste Version, wenn du vorausgeplant hast

Wenn die Zeilen zu Partitionen passen, ist das Droppen oder Truncaten einer Partition oft die sauberste Antwort.

```sql
ALTER TABLE events DROP PARTITION p2024_01;
```

oder:

```sql
ALTER TABLE events TRUNCATE PARTITION p2024_01;
```

Das ist die erwachsene Version von Bulk Deletion: Entwirf die Tabelle so, dass alte Daten durch eine Tür gehen können statt durch einen Schredder.

Der Haken ist offensichtlich und trotzdem schmerzhaft: Die Partition-Grenze muss zur Retention Rule passen. Wenn deine Cleanup Condition "delete every completed task for customers on the old billing plan except the ones with unresolved exports" lautet, wird Partitioning dich nicht retten.

Noch eine MySQL-spezifische Falte: User-defined partitioned InnoDB tables und Foreign Keys haben Einschränkungen. Versprich dir keine Partition Drops auf einem Schema, das nicht legal so partitioniert werden kann, wie du es brauchst.

## Die Fallen, geradeheraus

### `TRUNCATE` committet implizit

Das ist der große Punkt. `TRUNCATE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` und `RENAME TABLE` leben alle in MySQLs Welt impliziter Commits. Das Runbook in `START TRANSACTION` zu wickeln, macht es nicht sicher reversibel.

Wenn dein Plan davon abhängt, "wir rollen zurück, wenn es falsch aussieht", hast du keinen Plan.

### Foreign Keys sind keine Checkbox

Wenn die Tabelle ein Parent ist, können Child Rows anderswo von ihr abhängen. Wenn die Tabelle ein Child ist, ist die Reihenfolge des Wiedereinfügens wichtig. Wenn du `foreign_key_checks` deaktivierst, validiert MySQL alte Zeilen nicht, wenn du die Checks wieder einschaltest.

Die sichere Version ist langweilig: den Dependency Graph verstehen und diese Technik entweder davon fernhalten oder die verwandten Tabellen in den Maintenance Plan aufnehmen.

### `ON DELETE`-Triggers feuern nicht

Das kann ein Performance-Vorteil sein. Es kann auch Audit Trails und denormalisierte Zähler umgehen.

Wenn der Trigger-Side-Effect wichtig ist, nutze `DELETE` oder bilde den Side Effect explizit im Runbook nach.

### `AUTO_INCREMENT` wird zurückgesetzt

`TRUNCATE` setzt den Counter zurück. Wenn du explizite IDs wieder einfügst, erhöht MySQL den nächsten Wert oft, während es diese IDs sieht, aber ich prüfe ihn trotzdem.

```sql
SELECT MAX(id) AS max_id
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Wenn der nächste `AUTO_INCREMENT`-Wert falsch ist, korrigiere ihn bewusst:

```sql
ALTER TABLE big_table AUTO_INCREMENT = 123456789;
```

Rate die Zahl nicht. Lies sie aus den wiederhergestellten Daten.

### `CREATE TABLE ... SELECT` ist nicht dasselbe wie `CREATE TABLE ... LIKE`

Das ist wichtig.

`CREATE TABLE keep AS SELECT ...` ist bequem und kann schnell sein, aber MySQL legt für diese neue Tabelle nicht automatisch Indexes an, und manche Attribute bleiben nicht so erhalten, wie Leute annehmen.

Für ein operatives Runbook bevorzuge ich:

```sql
CREATE TABLE keep_table LIKE source_table;
INSERT INTO keep_table (explicit, column, list)
SELECT explicit, column, list
FROM source_table
WHERE keep_condition;
```

Die Kopie kann länger dauern, weil Indexes auf der Keep Table existieren. Ich zahle diesen Teil der Kosten gern, wenn die Alternative ist, beim Restore zu entdecken, dass die Scratch Table nicht wie die Source geformt war.

### Constraints zählen auch nach dem Truncate

Die Zeilen kamen aus derselben Tabelle, also sollten sie dieselben Primary Keys, Unique Keys, Checks und Non-Null-Constraints erfüllen. "Sollten" ist keine Verifikationsstrategie.

Wenn dein bewahrtes Set durch Joins, Deduping, Transformationen oder Code entsteht statt durch ein direktes `SELECT` aus der Originaltabelle, validiere es vor dem Truncate:

```sql
SELECT id, COUNT(*) AS duplicates
FROM big_table_keep_20251213
GROUP BY id
HAVING COUNT(*) > 1
LIMIT 10;
```

### Replikas können trotzdem laggen

Diese Methode kann die Arbeit gegenüber einem riesigen Row-by-Row-Delete reduzieren, aber Replikas müssen den Truncate und den Bulk Insert trotzdem anwenden. Beobachte sie.

Wenn eine delayed replica dein Sicherheitsnetz ist, sag das vor der Operation laut. Wenn alle Replikas nahezu real time bleiben müssen, drossele den Restore oder wähle einen anderen Ansatz.

### Die Anwendung darf nicht durch das Copy-Fenster schreiben

Das ist die stille Fußfalle.

Wenn du Keep Rows um 02:00:00 kopierst und die Anwendung um 02:00:05 neue gültige Zeilen einfügt, sind diese Zeilen nicht in der Keep Table. Ein späteres `TRUNCATE` entfernt sie.

Maintenance Mode geht nicht nur um User Experience. Es geht um Datenkorrektheit.

## Eine Laravel-förmige Warnung

Wenn du das aus Laravel heraus ausführst, ist nicht die Facade wichtig. Wichtig ist die Grenze.

Verstecke das nicht in einem generischen Helper, der beliebige Tabellennamen und rohe `WHERE`-Strings akzeptiert. Identifiers sollten Code-Konstanten sein. Die Keep Condition sollte aus reviewed code kommen, nicht aus user input. Und `DB::transaction()` macht DDL in MySQL nicht rollback-safe.

Das Skelett, dem ich vertraue, sieht eher nach einem Command aus als nach einer wiederverwendbaren Library-Funktion:

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

Dieser Confirmation Step ist keine Theatralik. Es ist die Pause, in der du "warte, keep_rows ist 11, nicht 11 Millionen" erwischst.

## Eine kleine 2-Uhr-morgens-Checkliste

Vorher:

- Ich kenne die exakte Keep Condition.
- Ich habe jeden zeitbasierten Cutoff eingefroren.
- Ich habe total, keep und delete rows gezählt.
- Ich habe Foreign Keys und Triggers geprüft.
- Ich habe Speicherplatz für die bewahrte Kopie geprüft.
- Ich kenne den Backup- und Restore-Pfad.
- Ich habe replica lag und binlog implications geprüft.
- Ich habe Writes pausiert oder habe einen echten Delta-Capture-Plan.

Währenddessen:

- Ich erstelle die Keep Table.
- Ich zähle sie.
- Ich vergleiche den Count mit der Preflight-Zahl.
- Ich führe den irreversiblen Schritt erst aus, nachdem die Zahlen Sinn ergeben.
- Ich füge mit expliziten Spalten wieder ein.
- Ich analysiere und verifiziere.

Danach:

- Der final row count entspricht dem keep count.
- Boundary rows sehen richtig aus.
- Application behavior ist geprüft, nicht nur SQL output.
- Replikas sind aufgeholt oder holen absichtlich auf.
- Die Keep Table bleibt, bis ich das Seil nicht mehr brauche.

## Wann ich das nicht nutzen würde

Ich würde `TRUNCATE` + Wiedereinfügen nicht nutzen, wenn:

- die Tabelle wichtige `DELETE`-Triggers hat,
- Foreign-Key-Cascades das korrekte Business-Verhalten sind,
- Writes nicht pausiert werden können,
- die Keep Condition unscharf ist,
- die Löschung klein genug für batched `DELETE` ist,
- die Tabelle bereits auf der Retention Boundary partitioniert ist,
- die Organisation die Tabelle nicht wiederherstellen kann, wenn das Runbook falsch ist.

Der letzte Punkt ist der Test. Wenn das Wiederherstellen der Tabelle Chaos wäre, wähle keine Operation, deren Failure Mode "Tabelle wiederherstellen" lautet.

## Schlussgedanke

Die nukleare Option ist nicht clever, weil `TRUNCATE` schnell ist. Jeder weiß, dass `TRUNCATE` schnell ist.

Die nützliche Idee ist zu entscheiden, welche Arbeit die Datenbank leisten soll.

Wenn du fast alles löschst, kann es die falsche Freundlichkeit sein, InnoDB fast alles sorgfältig löschen zu lassen. Bewahre, worauf es ankommt. Baue darum herum neu auf. Verifiziere so, als würde eine müde zukünftige Version von dir die Ausgabe mit einem offenen Auge lesen.
