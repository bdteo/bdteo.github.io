[matter-of-fact] L'option nucléaire pour les suppressions massives : truncate et réinsertion dans MySQL et InnoDB.

Vous devez supprimer des millions de lignes d'une table MySQL.

Le premier réflexe honnête est simple : faire un delete dans la grosse table, là où la ligne est plus ancienne que votre cutoff.

Puis la requête tourne assez longtemps pour que vous deveniez une autre personne.

Alors vous faites la chose responsable. Vous supprimez dix mille lignes à la fois. Vous triez par id. Vous répétez jusqu'à la fin. Vous ajoutez une pause. Vous surveillez les réplicas. Vous espérez que l'histoire des verrous reste ennuyeuse.

C'est souvent la bonne réponse.

[flatly] Mais si vous supprimez la majeure partie de la table, une suppression ligne par ligne n'a rien de noble. Elle est simplement coûteuse.

Il existe un autre geste : ne supprimez pas ce que vous ne voulez pas. Préservez ce que vous voulez, reconstruisez la table, et passez à la suite.

C'est l'option nucléaire : copier les lignes à garder, faire truncate sur la table, puis réinsérer ces lignes.

Elle est rapide parce qu'elle change l'unité de travail. Vous cessez de payer pour chaque ligne supprimée et vous commencez à payer pour chaque ligne préservée.

[deliberate] Elle est aussi dangereuse, parce que truncate n'est pas un delete poli. Dans MySQL, il a une saveur D D L. Il commit implicitement. Il réinitialise auto increment. Il ignore les triggers on delete. Il a de vraies conséquences sur les clés étrangères et la réplication.

C'est exactement pour cela qu'il mérite un vrai runbook, pas un extrait malin collé en production à deux heures du matin.

Voici la forme de décision.

Un delete simple convient quand vous supprimez une petite tranche indexée. Il est généralement possible en ligne, et il peut être transactionnel si la transaction reste raisonnable. Mais sur de grands volumes, chaque index affecté, chaque undo log, chaque redo log et chaque entrée binlog doit être payé.

Un delete par lots convient quand vous avez besoin d'un rythme compatible avec un système vivant et que vous pouvez tolérer une tâche plus longue. Chaque lot peut commit indépendamment. Vous pouvez mettre en pause et reprendre. Mais c'est toujours du ligne par ligne, et cela peut toujours créer du retard de réplication.

La suppression ou le truncate de partition convient quand les lignes correspondent proprement à des partitions entières. C'est la version adulte du nettoyage de rétention. Le piège est que la limite de partition doit correspondre à la règle. Les limites ne pardonnent pas l'optimisme.

L'échange de table est utile quand vous pouvez construire une table de remplacement et la renommer atomiquement à la place de l'ancienne. La fenêtre d'échange est courte, mais la phase de copie demande toujours un plan pour les écritures, les triggers, les grants, les clés étrangères et les hypothèses applicatives.

Et truncate plus réinsertion convient quand vous supprimez presque tout et que vous pouvez suspendre les écritures. La table est vide entre le truncate et le restore, et l'histoire de rollback n'est pas amicale.

[reflective] Ma règle pratique est celle-ci : si vous supprimez moins de cinquante pour cent, commencez par un delete indexé ou un delete par lots. Entre cinquante et quatre-vingts pour cent, mesurez le delete par lots contre les approches de rebuild. Au-dessus de quatre-vingts pour cent, considérez sérieusement preserve-and-rebuild.

Le pourcentage n'est pas magique. Supprimer trente pour cent d'une table aux index horribles peut encore faire mal. Supprimer quatre-vingt-dix pour cent d'une petite table ne mérite peut-être pas de cérémonie.

La vraie question est : quel côté des données est le plus petit et le plus sûr à manipuler ?

Pourquoi un delete massif fait-il mal dans InnoDB ?

Parce qu'InnoDB ne regarde pas votre clause where avec un soupir rêveur avant d'enlever une plage d'octets du disque.

Il doit trouver les lignes via un index, ou scanner beaucoup trop. Il doit verrouiller des records, et parfois des gaps, le long des plages d'index scannées. Il doit maintenir chaque index secondaire affecté. Il écrit de l'undo pour que le delete puisse être rollback. Il écrit du redo pour que la récupération après crash fonctionne. Il écrit les binary logs pour que la réplication et la récupération aient un historique. Et il laisse du travail de purge qu'InnoDB nettoiera quand les anciennes versions ne seront plus visibles.

[matter-of-fact] Le détail inconfortable est que delete verrouille les records d'index qu'il scanne, pas seulement les lignes que votre modèle mental croit avoir trouvées.

Les deletes par lots réduisent le rayon d'explosion en rendant chaque transaction plus petite. Supprimer un nombre limité de lignes avant le cutoff, triées par id, puis répéter. Cela donne aux réplicas le temps de respirer. Cela permet de s'arrêter. Cela évite que l'undo devienne une seule transaction énorme.

Mais cela ne change pas le modèle de coût de base. Vous supprimez toujours ligne par ligne.

Truncate change ce modèle parce que MySQL traite truncate table davantage comme un drop et une recréation de la table que comme la suppression de chaque ligne. Il contourne le chemin normal de suppression D M L, provoque un commit implicite, ne peut pas être annulé comme une instruction D M L normale, et ne déclenche pas les triggers on delete.

Donc au lieu de supprimer quatre-vingts millions de lignes et d'en garder vingt millions, vous copiez vingt millions de lignes, vous videz rapidement la table, puis vous réinsérez vingt millions de lignes.

[deadpan] C'est toute l'astuce. Les détails d'implémentation sont l'endroit où les mines sont enterrées.

La version la plus sûre commence par l'ensemble à garder.

Pas : supprimer tout ce qui est plus ancien que X.

Mais : après cette opération, la table contient exactement les lignes correspondant à Y.

Ce cadrage compte, parce que les lignes préservées deviennent votre point d'ancrage de récupération.

Figez les valeurs volatiles avant de mesurer quoi que ce soit. Si le cutoff est le premier janvier, fixez-le une seule fois et réutilisez cette valeur exacte. Ensuite, comptez les lignes totales, les lignes à garder, et les lignes à supprimer dans la même requête de preflight.

Après cela, vérifiez le chemin d'accès. Faites un explain de la requête qui trouve les lignes à garder. Si MySQL doit faire un full table scan sur une table qui reçoit encore des écritures, arrêtez-vous et concevez correctement la fenêtre de maintenance. L'option nucléaire ne remplace pas la compréhension de la façon dont la table est accédée.

[deliberate] Avant de toucher la production, je veux cinq vérifications.

Premièrement, confirmer les relations de clés étrangères. Trouvez les tables enfants qui référencent la table que vous voulez vider. Si d'autres tables la référencent, ne désactivez pas négligemment les foreign key checks en espérant que tout ira bien. MySQL ne valide pas les lignes existantes quand les checks sont réactivés. C'est utile pour des rechargements contrôlés. Comme geste vague, c'est terrifiant.

Deuxièmement, vérifier les triggers. Si des delete triggers écrivent des lignes d'audit, vident des caches, mettent à jour des agrégats ou notifient d'autres systèmes, truncate les contourne. C'est soit exactement ce que vous voulez, soit exactement la façon de créer un incident très silencieux.

Troisièmement, vérifier l'espace disque. Il faut de la place quelque part pour les lignes préservées. Si vous gardez vingt pour cent d'une table de cinq cents gigaoctets, la copie temporaire est un objet réel en concurrence pour du disque et de l'I O réels.

Quatrièmement, vérifier les binary logs et les réplicas. Truncate est journalisé pour la réplication comme une instruction, et la réinsertion reste une grosse écriture. Cela peut être bien meilleur que de journaliser des millions de suppressions ligne par ligne, mais ce n'est pas gratuit.

Cinquièmement, avoir un chemin de restore que vous avez réellement testé. "Nous avons des backups" n'est pas un plan de restauration. Sachez quel backup vous restaureriez, où vous le restaureriez, et comment vous extrairiez seulement cette table si le résultat est mauvais.

Voici le runbook pratique.

Supposons que la table puisse être brièvement vidée sans danger : aucune table enfant ne dépend de ces lignes pendant l'opération, les écritures sont suspendues ou l'application est en mode maintenance, la condition de garde est figée, les backups sont réels, et les réplicas ont été pris en compte.

Utilisez des colonnes explicites. Je sais que select star a l'air propre. C'est aussi comme cela que les colonnes générées, les colonnes invisibles, la dérive d'ordre des colonnes et les migrations futures rendent votre nuit plus intéressante.

Créez une table keep avec la même structure que la table source. Utilisez create table like, pas create table as select. Insérez les lignes que vous voulez préserver dans cette table keep, en nommant chaque colonne explicitement et en utilisant le cutoff figé.

Ensuite, comptez la copie préservée avant de faire quoi que ce soit d'irréversible.

Puis vient le point de non-retour tranquille : truncate sur la table originale.

Restaurez les lignes préservées dans la table originale avec une liste de colonnes explicite. Rafraîchissez les statistiques de l'optimiseur. Ensuite, vérifiez le row count final, la plus ancienne ligne restante, et le statut de la table avant le nettoyage.

[reflective] Ne supprimez la copie préservée qu'après le retour de l'application, la correspondance des comptes, et une vraie vérification du comportement produit qui dépend de cette table.

Cette table préservée n'est pas du désordre pendant l'opération. C'est la corde.

Il existe aussi une variante par échange de table quand la fenêtre de table vide est inacceptable.

La forme est similaire : créer une nouvelle table comme l'ancienne, insérer les lignes voulues dans la nouvelle table, puis renommer atomiquement l'ancienne table de côté et la nouvelle table à sa place.

Le rename lui-même est atomique. Les autres sessions ne voient pas une paire à moitié renommée. Mais ne confondez pas cela avec zéro downtime.

Si l'ancienne table reçoit des écritures pendant que la nouvelle table se remplit, ces écritures ne sont pas copiées par magie. Il faut une pause des écritures, un plan de capture de delta, ou une migration en ligne volontairement plus complexe.

De plus, create table like copie les attributs de colonnes et les index, mais cela ne rend pas chaque objet autour automatiquement sûr. Vérifiez les triggers, les clés étrangères, les grants, le partitionnement, les colonnes générées et les hypothèses applicatives. Le nom de la table peut survivre à l'échange. Le contexte opérationnel, peut-être pas.

Si les lignes s'alignent avec des partitions, le partitionnement est souvent la réponse la plus propre. Supprimer l'ancienne partition, ou tronquer l'ancienne partition, puis passer à la suite.

[matter-of-fact] C'est la version adulte de la suppression massive : concevoir la table pour que les anciennes données sortent par une porte plutôt que par un broyeur.

Le piège est évident et toujours douloureux. La limite de partition doit correspondre à la règle de rétention. Si la condition de nettoyage est : supprimer chaque tâche terminée pour les clients de l'ancien plan de facturation, sauf celles avec des exports non résolus, le partitionnement ne vous sauvera pas.

Maintenant, les pièges, franchement.

Truncate commit implicitement. Create table, alter table, drop table et rename table vivent dans le même monde de commits implicites. Envelopper le runbook dans start transaction ne le rend pas réversible en sécurité. Si votre plan dépend de "nous ferons rollback si ça semble faux", vous n'avez pas de plan.

Les clés étrangères ne sont pas une case à cocher. Si la table est parent, des lignes enfants ailleurs peuvent en dépendre. Si la table est enfant, l'ordre de réinsertion compte. Si vous désactivez les foreign key checks, MySQL ne validera pas les anciennes lignes quand vous les réactiverez.

Les triggers on delete ne se déclenchent pas. Cela peut être un bénéfice de performance. Cela peut aussi contourner des pistes d'audit et des compteurs dénormalisés.

Auto increment se réinitialise. Si vous réinsérez des ids explicites, MySQL avance souvent la prochaine valeur à mesure qu'il voit ces ids, mais je la vérifie quand même. Lisez l'id maximum. Vérifiez le statut de la table. Si la prochaine valeur auto increment est mauvaise, corrigez-la délibérément. Ne devinez pas le nombre.

Create table as select n'est pas la même chose que create table like. Le premier est pratique, mais il ne crée pas automatiquement les index pour la nouvelle table, et certains attributs ne sont pas préservés comme les gens l'imaginent. Pour un runbook opérationnel, je préfère create table like, puis insert avec des colonnes explicites.

Les contraintes comptent encore après le truncate. Si l'ensemble préservé est produit par des joins, du deduping, des transformations ou du code, validez-le avant le truncate. "Ça devrait aller" n'est pas une stratégie de vérification.

Les réplicas peuvent encore prendre du retard. Cette méthode peut réduire le travail par rapport à une énorme suppression ligne par ligne, mais les réplicas doivent toujours appliquer le truncate et l'insertion massive. Surveillez-les.

[emphasized] Et l'application ne doit pas écrire pendant la fenêtre de copie.

Si vous copiez les lignes à garder à deux heures, et que l'application insère de nouvelles lignes valides cinq secondes plus tard, ces lignes ne sont pas dans la table keep. Un truncate ultérieur les supprime.

Le mode maintenance ne concerne pas seulement l'expérience utilisateur. C'est de la correction des données.

Une mise en garde en forme de Laravel : l'important n'est pas la facade. C'est la frontière.

Ne cachez pas cela dans un helper générique qui accepte des noms de tables arbitraires et des chaînes where brutes. Les identifiants doivent être des constantes de code. La condition de garde doit venir de code relu, pas de l'input utilisateur. Et les transactions de base de données ne rendent pas le D D L rollback-safe dans MySQL.

Le squelette auquel je fais confiance ressemble davantage à une commande qu'à une fonction de bibliothèque réutilisable. Créer la table keep. Insérer les lignes préservées avec un cutoff lié. Compter les keep rows. Journaliser ce nombre. Le comparer au compte de preflight. Exiger une confirmation explicite de l'opérateur. Puis truncate et restore.

[deadpan] Cette étape de confirmation n'est pas du théâtre. C'est la pause où l'on attrape : attends, keep rows vaut onze, pas onze millions.

Voici la petite checklist de deux heures du matin.

Avant : connaître la condition exacte de garde. Figer tout cutoff basé sur le temps. Compter les lignes totales, les lignes à garder et les lignes à supprimer. Vérifier les clés étrangères et les triggers. Vérifier l'espace disque. Connaître le chemin de backup et de restore. Vérifier le replica lag et les implications binlog. Suspendre les écritures, ou avoir un vrai plan de capture de delta.

Pendant : créer la table keep. La compter. Comparer le compte au nombre de preflight. Lancer l'étape irréversible seulement après que les chiffres ont du sens. Réinsérer avec des colonnes explicites. Analyser et vérifier.

Après : le row count final correspond au keep count. Les lignes de frontière semblent correctes. Le comportement applicatif est vérifié, pas seulement la sortie SQL. Les réplicas sont rattrapés, ou rattrapent intentionnellement. La table keep reste jusqu'à ce que vous n'ayez plus besoin de la corde.

Je n'utiliserais pas truncate plus réinsertion si la table a des delete triggers importants, si les cascades de clés étrangères sont le bon comportement métier, si les écritures ne peuvent pas être suspendues, si la condition de garde est floue, si la suppression est assez petite pour un delete par lots, si la table est déjà partitionnée sur la limite de rétention, ou si l'organisation ne peut pas restaurer la table quand le runbook est faux.

Ce dernier point est le test. Si restaurer la table serait le chaos, ne choisissez pas une opération dont le mode d'échec est : restaurer la table.

[reflective] L'option nucléaire n'est pas maligne parce que truncate est rapide. Tout le monde sait que truncate est rapide.

L'idée utile est de décider quel travail vous voulez faire faire à la base de données.

Si vous supprimez presque tout, demander à InnoDB de supprimer soigneusement presque tout peut être la mauvaise gentillesse. Préservez ce qui compte. Reconstruisez autour. Vérifiez comme si une future version fatiguée de vous lisait la sortie avec un seul œil ouvert.
