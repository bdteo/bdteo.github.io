---
lang: "fr"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "ab64e631f1cf34f9"
title: "L'option nucléaire pour les suppressions massives : TRUNCATE + réinsertion (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "Un guide pratique de décision MySQL/InnoDB pour les suppressions massives : DELETE, DELETE par lots, suppression de partition, échange de table, ou TRUNCATE + réinsertion."
tags: ["mysql", "innodb", "bases de données", "performance", "opérations", "laravel"]
featuredImage: "./images/featured.webp"
imageCaption: "Deux mains soulèvent un petit bouquet de brins d'herbes préservés au-dessus d'un panier de tiges coupées — garder ce qui compte avant le grand balayage."
audioUrl: "/audio/articles/todo-bulk-deletion-nuclear-option/fr/hqfrgApggtO1785R4Fsn-5e80f9753f63.m4a"
audioDuration: "17:24"
audioVoice: "Theodore (ElevenLabs French serene)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/todo-bulk-deletion-nuclear-option.fr.md"
---

Vous devez supprimer des millions de lignes d'une table MySQL.

Le premier réflexe honnête est celui-ci :

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01';
```

Puis la requête tourne assez longtemps pour que vous deveniez une autre personne.

Alors vous faites la chose responsable :

```sql
DELETE FROM big_table
WHERE created_at < '2025-01-01'
ORDER BY id
LIMIT 10000;
```

Répéter jusqu'à la fin. Ajouter une pause. Surveiller les réplicas. Espérer que l'histoire des verrous reste ennuyeuse.

C'est souvent la bonne réponse. Mais si vous supprimez **la majeure partie** de la table, une suppression ligne par ligne n'a rien de noble. Elle est simplement coûteuse.

Il existe un autre geste :

> Ne supprimez pas ce que vous ne voulez pas. Préservez ce que vous voulez, reconstruisez la table, et passez à la suite.

C'est l'option nucléaire : **copier les lignes à garder, faire `TRUNCATE`, puis réinsérer**.

Elle est rapide parce qu'elle change l'unité de travail. Vous cessez de payer pour chaque ligne supprimée et vous commencez à payer pour chaque ligne préservée.

Elle est aussi dangereuse, parce que `TRUNCATE` n'est pas un `DELETE` poli. Dans MySQL, il a une saveur DDL, il commit implicitement, il réinitialise `AUTO_INCREMENT`, il ignore les triggers `ON DELETE`, et il a de vraies conséquences sur les clés étrangères et la réplication. C'est exactement pour cela qu'il mérite un vrai runbook, pas un extrait malin collé en production à 2 h du matin.

## La matrice de décision

Utilisez l'outil brutal uniquement quand la forme du problème demande vraiment un outil brutal.

| Approche | Meilleur cas | Disponibilité | Histoire de rollback | Principaux pièges |
|---|---|---|---|---|
| `DELETE` simple | Vous supprimez une petite tranche indexée | Généralement en ligne, mais les verrous peuvent encore faire mal | Transactionnel si gardé dans une transaction raisonnable | Lent pour les grands volumes ; touche les index ; génère du travail undo/redo/binlog |
| `DELETE` par lots | Vous avez besoin d'un rythme compatible avec un système vivant et vous tolérez une tâche plus longue | En ligne si les lots sont petits et indexés | Chaque lot peut commit indépendamment | Toujours ligne par ligne ; peut créer du retard de réplication ; demande une comptabilité pause/reprise |
| Suppression/truncate de partition | Les lignes correspondent proprement à des partitions entières | Courte fenêtre DDL | Pas de rollback ligne par ligne | Ne marche que si le partitionnement a été conçu pour cela ; les limites de partition ne pardonnent pas |
| Échange de table | Vous pouvez construire une table de remplacement et la renommer atomiquement | Courte fenêtre d'échange, mais la phase de copie demande un contrôle des écritures | Garder l'ancienne table jusqu'à vérification | Schéma, triggers, grants, clés étrangères et écritures pendant la copie exigent un plan |
| `TRUNCATE` + réinsertion | Vous supprimez presque tout et pouvez suspendre les écritures | Fenêtre de maintenance ; la table est vide entre truncate et restore | Peu compatible avec un rollback | Clés étrangères, commits implicites, triggers, auto-increment, binlogs et vérification |

Ma règle pratique personnelle :

```text
Suppression < 50 %   -> commencer par un DELETE indexé ou un DELETE par lots
Suppression 50-80 %  -> mesurer DELETE par lots contre les approches de rebuild
Suppression > 80 %   -> considérer sérieusement preserve-and-rebuild
```

Le pourcentage n'est pas magique. Supprimer 30 % d'une table aux index horribles peut encore être douloureux. Supprimer 90 % d'une petite table ne mérite peut-être pas de cérémonie. La vraie question est : **quel côté des données est le plus petit et le plus sûr à manipuler ?**

## Pourquoi un `DELETE` massif fait mal dans InnoDB

InnoDB ne regarde pas votre clause `WHERE` avec un soupir rêveur avant d'enlever une plage d'octets du disque.

Il doit faire du travail de base de données :

- Trouver les lignes via un index, ou scanner beaucoup trop.
- Verrouiller des records, et parfois des gaps, le long des plages d'index scannées.
- Maintenir chaque index secondaire affecté.
- Écrire de l'undo pour que la suppression puisse être rollback.
- Écrire du redo pour que la récupération après crash fonctionne.
- Écrire les binary logs pour que la réplication et la récupération aient un historique.
- Laisser du travail de purge qu'InnoDB nettoiera après que les transactions auront relâché les anciennes versions.

La [documentation MySQL sur les verrous InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html) vaut la peine d'être lue avec un café et un petit sentiment d'effroi : `DELETE` verrouille les records d'index qu'il scanne, pas seulement les lignes que votre modèle mental croit avoir trouvées.

Les suppressions par lots réduisent le rayon d'explosion en rendant chaque transaction plus petite :

```sql
DELETE FROM big_table
WHERE created_at < @cutoff
ORDER BY id
LIMIT 10000;
```

C'est utile. Cela donne aux réplicas le temps de respirer. Cela permet de s'arrêter. Cela évite que l'undo devienne une seule transaction énorme.

Mais cela ne change pas le modèle de coût de base. Vous supprimez toujours ligne par ligne.

## Pourquoi `TRUNCATE` change le modèle de coût

`TRUNCATE TABLE` est rapide parce que MySQL le traite davantage comme un drop et une recréation de la table que comme la suppression de chaque ligne. La [documentation MySQL de `TRUNCATE TABLE`](https://dev.mysql.com/doc/refman/8.4/en/truncate-table.html) souligne les différences importantes : il contourne le chemin DML normal de suppression, provoque un commit implicite, ne peut pas être annulé comme une instruction DML normale, et ne déclenche pas les triggers `ON DELETE`.

Donc au lieu de ceci :

```text
supprimer 80 millions de lignes
garder 20 millions de lignes
```

Vous faites ceci :

```text
copier 20 millions de lignes
vider rapidement la table
réinsérer 20 millions de lignes
```

C'est toute l'astuce. Les détails d'implémentation sont l'endroit où les mines sont enterrées.

## Ne commencez pas par SQL. Commencez par l'ensemble à garder.

La version la plus sûre de cette opération se formule autour des lignes qui survivent.

Pas :

```text
Supprimer tout ce qui est plus ancien que X.
```

Mais :

```text
Après cette opération, la table contient exactement les lignes correspondant à Y.
```

Ce cadrage compte, parce que les lignes préservées deviennent votre point d'ancrage de récupération.

Figez les valeurs volatiles avant de mesurer quoi que ce soit :

```sql
SET @cutoff := TIMESTAMP('2025-01-01 00:00:00');
```

Puis comptez les deux côtés :

```sql
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN created_at >= @cutoff THEN 1 ELSE 0 END) AS keep_rows,
  SUM(CASE WHEN created_at <  @cutoff THEN 1 ELSE 0 END) AS delete_rows
FROM big_table;
```

Vérifiez que MySQL peut trouver ces lignes sans tomber d'une falaise :

```sql
EXPLAIN
SELECT id
FROM big_table
WHERE created_at >= @cutoff
ORDER BY id;
```

Si ce plan est un full table scan sur une table qui reçoit encore des écritures, arrêtez-vous et concevez correctement la fenêtre de maintenance. L'option nucléaire ne remplace pas la compréhension de la façon dont la table est accédée.

## Les vérifications préalables que je veux avant de toucher la production

Si cela se passe à 2 h du matin, la checklist n'est pas de la bureaucratie. C'est ce qui évite de négocier avec un terminal.

### 1. Confirmer les relations de clés étrangères

Trouvez les tables enfants qui référencent la table que vous voulez vider :

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

Si des lignes dans d'autres tables référencent `big_table`, ne faites pas négligemment `SET FOREIGN_KEY_CHECKS=0` en espérant que tout ira bien. MySQL permet de désactiver les checks pour certaines opérations de maintenance, mais lorsqu'ils sont réactivés, il ne scanne **pas** les lignes existantes pour prouver qu'elles sont cohérentes. C'est utile pour des rechargements contrôlés. Comme geste vague de confiance, c'est terrifiant.

Pour une table parent référencée, un `DELETE` simple avec `ON DELETE CASCADE` peut être sémantiquement nécessaire. `TRUNCATE` ne lancera pas ces cascades pour vous.

### 2. Vérifier les triggers

```sql
SELECT
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE EVENT_OBJECT_SCHEMA = DATABASE()
  AND EVENT_OBJECT_TABLE = 'big_table';
```

Si la table a des triggers `DELETE` qui écrivent des lignes d'audit, vident des caches, mettent à jour des agrégats ou notifient d'autres systèmes, `TRUNCATE` les contourne. C'est soit exactement ce que vous voulez, soit exactement la façon de créer un incident très silencieux.

### 3. Vérifier l'espace disque

Il vous faut de la place quelque part pour les lignes préservées.

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb,
  ROUND((data_length + index_length) / 1024 / 1024 / 1024, 2) AS total_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

Si vous gardez 20 % d'une table de 500 Go, la copie temporaire n'est pas imaginaire. C'est un objet réel en concurrence pour du disque et de l'I/O réels.

### 4. Vérifier les binary logs et les réplicas

`TRUNCATE` est journalisé pour la réplication comme une instruction. La réinsertion reste une grosse écriture. Cela peut être bien meilleur que de journaliser des millions de suppressions de lignes, mais ce n'est pas gratuit.

Avant l'opération, sachez :

- le retard de réplication actuel,
- si les réplicas peuvent tolérer le rebuild,
- si des réplicas retardés font partie de votre histoire de rollback,
- si votre backup plus les binary logs peuvent vous ramener à la minute précédant le changement.

La [note MySQL sur la réplication de `TRUNCATE`](https://dev.mysql.com/doc/refman/8.4/en/replication-features-truncate.html) est courte, mais son implication opérationnelle est large : ce n'est pas seulement une chirurgie locale de table.

### 5. Avoir un chemin de restauration que vous avez réellement testé

"Nous avons des backups" n'est pas un plan de restauration.

Au minimum, sachez quel backup vous restaureriez, où vous le restaureriez, et comment vous extrairiez seulement cette table si le résultat est mauvais. Pour une table de production sérieuse, je veux soit un backup physique récent avec un chemin de restauration testé, soit un export logique délibéré des lignes que je suis sur le point de préserver.

La propre [documentation MySQL sur les backups](https://dev.mysql.com/doc/refman/8.4/en/backup-methods.html) insiste sur les backups complets plus les binary logs pour la récupération point-in-time. Cela compte ici parce qu'une mauvaise suppression massive est une erreur logique, pas une panne de disque.

## Le runbook pratique `TRUNCATE` + réinsertion

Supposons que cette table puisse être brièvement vidée sans danger :

- aucune table enfant ne dépend des lignes pendant l'opération,
- les écritures sont suspendues ou l'application est en mode maintenance,
- la condition de garde est figée,
- les backups sont réels,
- les réplicas ont été pris en compte.

Utilisez des colonnes explicites. Je sais que `SELECT *` a l'air propre. C'est aussi comme cela que les colonnes générées, les colonnes invisibles, la dérive d'ordre des colonnes et les migrations futures rendent votre nuit plus intéressante.

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

Comptez la copie préservée avant de faire quoi que ce soit d'irréversible :

```sql
SELECT COUNT(*) AS keep_rows
FROM big_table_keep_20251213;
```

Puis vient le point de non-retour tranquille :

```sql
TRUNCATE TABLE big_table;
```

Restaurez les lignes préservées :

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

Rafraîchissez les statistiques de l'optimiseur :

```sql
ANALYZE TABLE big_table;
```

Vérifiez avant le nettoyage :

```sql
SELECT COUNT(*) AS final_rows
FROM big_table;

SELECT MIN(created_at) AS oldest_remaining_row
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Ne supprimez la copie préservée qu'après le retour de l'application, la correspondance des comptes, et une vraie vérification du comportement produit qui dépend de cette table :

```sql
DROP TABLE big_table_keep_20251213;
```

Cette table préservée n'est pas du désordre pendant l'opération. C'est la corde.

## Une variante par échange de table quand la fenêtre de table vide est inacceptable

La propre documentation MySQL de `DELETE` suggère une stratégie voisine pour les énormes suppressions InnoDB : copier les lignes voulues dans une table de même structure, renommer atomiquement les tables, puis supprimer l'ancienne.

La forme est :

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

Le rename lui-même est atomique : les autres sessions ne voient pas une paire à moitié renommée. Mais ne confondez pas cela avec "zéro downtime".

Si l'ancienne table reçoit des écritures pendant que `big_table_new` est remplie, ces écritures ne sont pas copiées par magie. Il vous faut une pause des écritures, un plan de capture de delta, ou une migration en ligne volontairement plus complexe.

De plus : `CREATE TABLE ... LIKE` copie les attributs de colonnes et les index, mais cela ne rend pas chaque objet et dépendance autour de la table automatiquement sûrs. Vérifiez triggers, clés étrangères, grants, partitionnement, colonnes générées et hypothèses applicatives. Le nom de la table peut survivre à l'échange ; le contexte opérationnel, peut-être pas.

## Le partitionnement : la meilleure version si vous avez prévu le coup

Si les lignes s'alignent avec des partitions, supprimer ou tronquer une partition est souvent la réponse la plus propre.

```sql
ALTER TABLE events DROP PARTITION p2024_01;
```

ou :

```sql
ALTER TABLE events TRUNCATE PARTITION p2024_01;
```

C'est la version adulte de la suppression massive : concevoir la table pour que les anciennes données sortent par une porte plutôt que par un broyeur.

Le piège est évident et toujours douloureux : la limite de partition doit correspondre à la règle de rétention. Si votre condition de nettoyage est "delete every completed task for customers on the old billing plan except the ones with unresolved exports," le partitionnement ne vous sauvera pas.

Une autre aspérité spécifique à MySQL : les tables InnoDB partitionnées par l'utilisateur et les clés étrangères ont des restrictions. Ne vous promettez pas des drops de partitions sur un schéma qui ne peut pas légalement être partitionné comme vous en avez besoin.

## Les pièges, franchement

### `TRUNCATE` commit implicitement

C'est le gros point. `TRUNCATE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` et `RENAME TABLE` vivent tous dans le monde des commits implicites de MySQL. Envelopper le runbook dans `START TRANSACTION` ne le rend pas réversible en sécurité.

Si votre plan dépend de "nous ferons rollback si ça semble faux", vous n'avez pas de plan.

### Les clés étrangères ne sont pas une case à cocher

Si la table est parent, des lignes enfants ailleurs peuvent en dépendre. Si la table est enfant, l'ordre de réinsertion compte. Si vous désactivez `foreign_key_checks`, MySQL ne validera pas les anciennes lignes quand vous les réactiverez.

La version sûre est ennuyeuse : comprendre le graphe de dépendances et soit garder cette technique loin de lui, soit inclure les tables liées dans le plan de maintenance.

### Les triggers `ON DELETE` ne se déclenchent pas

Cela peut être un bénéfice de performance. Cela peut aussi contourner des pistes d'audit et des compteurs dénormalisés.

Si l'effet de bord du trigger compte, utilisez `DELETE` ou recréez explicitement cet effet dans le runbook.

### `AUTO_INCREMENT` se réinitialise

`TRUNCATE` réinitialise le compteur. Si vous réinsérez des IDs explicites, MySQL avance souvent la prochaine valeur à mesure qu'il les voit, mais je la vérifie quand même.

```sql
SELECT MAX(id) AS max_id
FROM big_table;

SHOW TABLE STATUS LIKE 'big_table'\G
```

Si la prochaine valeur `AUTO_INCREMENT` est mauvaise, corrigez-la délibérément :

```sql
ALTER TABLE big_table AUTO_INCREMENT = 123456789;
```

Ne devinez pas le nombre. Lisez-le depuis les données restaurées.

### `CREATE TABLE ... SELECT` n'est pas la même chose que `CREATE TABLE ... LIKE`

C'est important.

`CREATE TABLE keep AS SELECT ...` est pratique et peut être rapide, mais MySQL ne crée pas automatiquement les index pour cette nouvelle table, et certains attributs ne sont pas préservés comme les gens l'imaginent.

Pour un runbook opérationnel, je préfère :

```sql
CREATE TABLE keep_table LIKE source_table;
INSERT INTO keep_table (explicit, column, list)
SELECT explicit, column, list
FROM source_table
WHERE keep_condition;
```

La copie peut prendre plus longtemps parce que les index existent sur la table keep. Je paierai volontiers une partie de ce coût si l'alternative est de découvrir au moment du restore que la table scratch n'avait pas la forme de la source.

### Les contraintes comptent encore après le truncate

Les lignes viennent de la même table, donc elles devraient satisfaire les mêmes clés primaires, clés uniques, checks et contraintes non-null. "Devraient" n'est pas une stratégie de vérification.

Si votre ensemble préservé est produit par des joins, du deduping, des transformations ou du code plutôt que par un `SELECT` direct depuis la table originale, validez-le avant le truncate :

```sql
SELECT id, COUNT(*) AS duplicates
FROM big_table_keep_20251213
GROUP BY id
HAVING COUNT(*) > 1
LIMIT 10;
```

### Les réplicas peuvent encore prendre du retard

Cette méthode peut réduire le travail par rapport à une énorme suppression ligne par ligne, mais les réplicas doivent toujours appliquer le truncate et l'insertion massive. Surveillez-les.

Si un réplica retardé est votre filet de sécurité, dites-le explicitement avant l'opération. Si tous les réplicas doivent rester proches du temps réel, ralentissez le restore ou choisissez une autre approche.

### L'application ne doit pas écrire pendant la fenêtre de copie

C'est le piège silencieux.

Si vous copiez les lignes à garder à 02:00:00 et que l'application insère de nouvelles lignes valides à 02:00:05, ces lignes ne sont pas dans la table keep. Un `TRUNCATE` ultérieur les supprime.

Le mode maintenance ne concerne pas seulement l'expérience utilisateur. C'est de la correction des données.

## Une mise en garde en forme de Laravel

Si vous lancez cela depuis Laravel, l'important n'est pas la facade. C'est la frontière.

Ne cachez pas cela dans un helper générique qui accepte des noms de tables arbitraires et des chaînes `WHERE` brutes. Les identifiants doivent être des constantes de code. La condition de garde doit venir de code relu, pas de l'input utilisateur. Et `DB::transaction()` ne rend pas le DDL rollback-safe dans MySQL.

Le squelette auquel je fais confiance ressemble davantage à une commande qu'à une fonction de bibliothèque réutilisable :

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

Cette étape de confirmation n'est pas du théâtre. C'est la pause où l'on attrape "attends, keep_rows vaut 11, pas 11 millions."

## Une petite checklist de 2 h du matin

Avant :

- Je connais la condition exacte de garde.
- J'ai figé tout cutoff basé sur le temps.
- J'ai compté total, keep et delete rows.
- J'ai vérifié les clés étrangères et les triggers.
- J'ai vérifié l'espace disque pour la copie préservée.
- Je connais le chemin de backup et de restore.
- J'ai vérifié le replica lag et les implications binlog.
- J'ai suspendu les écritures ou j'ai un vrai plan de capture de delta.

Pendant :

- Je crée la table keep.
- Je la compte.
- Je compare le compte au nombre de preflight.
- Je lance l'étape irréversible seulement après que les chiffres ont du sens.
- Je réinsère avec des colonnes explicites.
- J'analyse et je vérifie.

Après :

- Le row count final correspond au keep count.
- Les lignes de frontière semblent correctes.
- Le comportement applicatif est vérifié, pas seulement la sortie SQL.
- Les réplicas sont rattrapés ou rattrapent intentionnellement.
- La table keep reste jusqu'à ce que je n'aie plus besoin de la corde.

## Quand je ne l'utiliserais pas

Je n'utiliserais pas `TRUNCATE` + réinsertion si :

- la table a des triggers `DELETE` importants,
- les cascades de clés étrangères sont le bon comportement métier,
- les écritures ne peuvent pas être suspendues,
- la condition de garde est floue,
- la suppression est assez petite pour un `DELETE` par lots,
- la table est déjà partitionnée sur la limite de rétention,
- l'organisation ne peut pas restaurer la table si le runbook est faux.

Ce dernier point est le test. Si restaurer la table serait le chaos, ne choisissez pas une opération dont le mode d'échec est "restaurer la table."

## Pensée finale

L'option nucléaire n'est pas maligne parce que `TRUNCATE` est rapide. Tout le monde sait que `TRUNCATE` est rapide.

L'idée utile est de décider quel travail vous voulez faire faire à la base de données.

Si vous supprimez presque tout, demander à InnoDB de supprimer soigneusement presque tout peut être la mauvaise gentillesse. Préservez ce qui compte. Reconstruisez autour. Vérifiez comme si une future version fatiguée de vous lisait la sortie avec un seul œil ouvert.
