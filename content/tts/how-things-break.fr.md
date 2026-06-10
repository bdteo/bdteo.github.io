[reflective] Il existe une sorte d'ironie qui donne l'impression d'avoir été écrite.

Une mise en production était censée être ennuyeuse. C'est le rêve. La checklist avance, le tag atterrit, la migration s'exécute, le tableau de bord reste calme, et personne n'apprend un nouveau comportement de base de données à seize heures.

Celle-ci avait d'autres plans.

[matter-of-fact] L'application a cessé de répondre avec une petite phrase brutale :

no healthy upstream.

Pas poétique. Pas dramatique. Juste assez pour rendre la pièce plus étroite.

Nous avons suspendu la release et remonté la piste de l'attente. Une migration voulait changer la forme d'une table. Quelque chose d'autre se tenait dans l'embrasure.

Au début, j'ai cherché la cause dramatique. Le nouveau code. La migration elle-même. Le chemin qui fait peur.

Ce n'était rien de tout cela.

[calm] C'était un job d'arrière-plan ordinaire, déclenché par une action utilisateur ordinaire, qui maintenait une transaction de base de données ouverte sur un périmètre plus large que nécessaire. La plupart des jours, ce n'est qu'une impolitesse. Le jour d'une release, c'est devenu de l'architecture.

La connexion semblait inactive. Endormie, techniquement. Elle n'exécutait pas de requête. Elle n'était pas occupée. Elle était simplement là, tenant encore une petite emprise sur une table dont la migration avait besoin.

[slows down] Endormie, mais la main sur la poignée.

Puis la blague est arrivée.

L'action utilisateur qui avait lancé le job impliquait une page appelée How Things Break.

[pause] Bien sûr.

[deadpan] Une release a cassé à cause de How Things Break.

Plus tard, une fois l'incident résorbé, j'ai compté les mots d'un brouillon précédent de cette histoire. Il en avait mille cent quatre-vingt-dix-neuf. J'ai cherché le nombre, surtout pour rire, et internet m'a dit que onze cent quatre-vingt-dix-neuf signifie « la fin d'un grand cycle de vie et le début d'un nouveau chemin ».

La bande-son, naturellement, était Lorn, Anvil.

[pause] Ridicule.

Et juste.

[reflective] C'était toute la leçon. Une ancienne forme du codebase avait atteint la fin de sa vie utile. Le correctif n'était pas mystique : réduire la transaction, durcir le chemin de release, mettre à jour le runbook.

Mais quand même.

Le logiciel passe la majeure partie de sa vie à prétendre être logique, puis la réalité dépose un rapport de bug avec un meilleur titre que le vôtre.

[deliberate] La leçon est simple :

Les chemins ordinaires méritent la suspicion.

Pas de paranoïa. De la suspicion.

Le code que les gens utilisent tous les jours est l'endroit où les compromis s'accumulent. Il devient familier, et la familiarité est un sédatif.

[slows down] Parfois, la production vous apprend par le feu.

Parfois, elle vous apprend avec un nombre, un nom et une chute.
