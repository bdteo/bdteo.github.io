---
lang: "fr"
translationOf: "todo-bulk-deletion-nuclear-option"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "5f58e97245018bc8"
title: "L'option nucléaire pour les suppressions massives : TRUNCATE + réinsertion (MySQL/InnoDB)"
date: "2025-12-13T13:00:00.000Z"
description: "Quand vous devez supprimer environ 80 % ou plus d'une table MySQL, arrêtez d'utiliser DELETE. Copiez les lignes que vous voulez garder, TRUNCATE, puis réinsérez-les — souvent 10 à 100 fois plus vite."
featuredImage: "./images/featured.webp"
imageCaption: "Deux mains soulèvent un petit bouquet de brins d'herbes préservés au-dessus d'un panier de tiges coupées — garder ce qui compte avant le grand balayage."
---

Vous devez supprimer des millions de lignes d'une table MySQL.

Vous attrapez :

```sql
DELETE FROM big_table WHERE some_condition;
```

Et puis vous regardez la barre de progression vieillir en temps réel.

Vous essayez d'être responsable et de le faire par lots :

```sql
DELETE FROM big_table WHERE some_condition LIMIT 10000;
-- repeat until done
```

Mieux. Toujours lent. Toujours bruyant. Toujours coûteux.

Si vous supprimez **la majeure partie** de la table (règle pratique : **environ 80 % ou plus**), il existe un autre geste, brutalement efficace :

> Ne supprimez pas ce que vous ne voulez pas. **Gardez ce que vous voulez, et atomisez le reste.**

Je l'appelle l'**option nucléaire** : **TRUNCATE + réinsertion**.

---

## Pourquoi `DELETE` reste lent (même par lots)

InnoDB ne « retire » pas les lignes. Il travaille.

Beaucoup de travail :

- **Opérations ligne par ligne** : trouver, verrouiller, marquer comme supprimé.
- **Maintenance des index** : chaque suppression touche chaque index secondaire.
- **Journalisation undo/redo** : le moteur doit préserver la possibilité de rollback et de récupération.
- **Remous dans le buffer pool** : vous salissez sans cesse des pages, vous en expulsez d'utiles.
- **Impact sur la réplication** : de gros flux de suppressions sont une excellente façon de créer du retard sur les réplicas.

Petit calcul au dos d'une enveloppe :

- 27 M de lignes à environ 6 000 lignes/s ≈ **75 minutes**.

Ce n'est pas un bug. C'est le modèle de coût que vous avez choisi.

---

## L'option nucléaire : TRUNCATE + réinsertion

Cette technique renverse le modèle de coût.

Au lieu de payer par ligne supprimée, vous payez par ligne **conservée**.

Algorithme :

```text
1) Copy the rows you want to keep into a temporary table
2) TRUNCATE the original table (fast)
3) Insert the preserved rows back into the original table
4) Drop the temp table
```

Et oui : on l'appelle « nucléaire » pour une raison. C'est volontairement brutal.

---

## Pourquoi c'est rapide

Les gains sont mécaniques :

| Opération | Coût approximatif | Pourquoi |
|---|---:|---|
| `TRUNCATE` | ~O(1) | supprime et recrée la table (au niveau des métadonnées) |
| `CREATE TABLE … AS SELECT` | O(k) | scan séquentiel + écriture en masse des lignes conservées |
| `INSERT … SELECT` | O(k) | insertion en masse ; pas de « taxe de suppression » |

Pas de coût de suppression ligne par ligne. Pas de mises à jour d'index pour les lignes retirées (puisqu'elles disparaissent d'un seul coup).

---

## Quand l'utiliser (et quand ne pas l'utiliser)

### Utilisez-la quand

- Vous supprimez **la majeure partie** de la table (encore une fois : **environ 80 % ou plus**, c'est la zone où cette approche commence à briller).
- Vous pouvez définir proprement les « lignes à garder ».
- Vous pouvez vous permettre une brève indisponibilité / fenêtre de maintenance.
- La table n'est pas activement référencée par des clés étrangères depuis d'autres tables (ou vous pouvez gérer les contraintes en sécurité).
- Vous avez **assez d'espace disque** pour la table temporaire.

### Ne l'utilisez pas quand

- Vous avez besoin de **zéro downtime**.
- La table est fortement référencée par des clés étrangères que vous ne pouvez pas toucher.
- Vous *devez* déclencher les triggers DELETE.
- Vous ne supprimez qu'une minorité de lignes (la suppression par lots peut être le gain le plus simple).

---

## Une règle de décision pratique

Si vous voulez une phrase à dire en revue :

> Si la suppression retirerait la majeure partie de la table, arrêtez de supprimer. Préservez et reconstruisez.

Ou, si vous préférez l'ASCII :

```text
How much are you deleting?

< 50%     -> chunked DELETE (and index-aware filters)
50–80%    -> measure both approaches
> 80%     -> TRUNCATE + reinsert (if constraints allow)
```

---

## Implémentation (SQL)

Voici la forme minimale :

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

Deux notes importantes en production :

- `TRUNCATE` est du DDL en MySQL. Il **commit implicitement** et vous ne pouvez pas le rollback comme une transaction normale.
- Il vous faut une fenêtre de maintenance et une sauvegarde. Ce n'est pas un « essayons en live pour voir ».

---

## Implémentation (Laravel/PHP)

Voici la version que j'utilise réellement quand j'en ai besoin :

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

Petite énergie de canard en plastique : relisez la fonction et demandez à votre vous futur —

> « Suis-je *certain* que cette table peut être vide pendant un instant ? »

Si la réponse n'est pas un oui sans ambiguïté, ce n'est pas le bon outil.

---

## Les pièges à prévoir absolument

### Réinitialisation de l'auto-increment

`TRUNCATE` réinitialise `AUTO_INCREMENT`. Si vous devez le préserver :

```sql
SELECT MAX(id) FROM big_table;
ALTER TABLE big_table AUTO_INCREMENT = <max_id + 1>;
```

### Clés étrangères

Si d'autres tables référencent celle-ci, `TRUNCATE` peut être interdit ou dangereux. Ne vous contentez pas de « désactiver les checks » en espérant que tout ira bien.

### Triggers

`TRUNCATE` ne déclenche **pas** les triggers DELETE. Si vous avez besoin de leurs effets de bord, vous revenez à `DELETE`.

### Espace disque

Vous avez besoin de place pour le jeu de données conservé (la table temporaire). Vérifiez d'abord :

```sql
SELECT
  ROUND(data_length / 1024 / 1024 / 1024, 2) AS data_gb,
  ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'big_table';
```

### Réplication / binlog

C'est du DDL + une insertion en masse. Cela peut quand même créer du retard sur les réplicas. Faites-le intentionnellement, surveillez le retard, et ne faites pas semblant que c'est gratuit.

---

## Si vous avez besoin d'un downtime (presque) nul

Cet article parle du marteau rapide.

Si vous avez besoin d'un scalpel, utilisez les outils faits pour cela :

- `pt-archiver` (Percona Toolkit) pour des suppressions par lots avec un rythme respectueux des réplicas
- stratégies de partitionnement (supprimer des partitions plutôt que des lignes)
- approches par table fantôme + échange contrôlé (plus complexe, plus de pièces mobiles)

---

## Dernière pensée

Ce n'est pas une astuce maligne. C'est choisir quel travail vous payez.
