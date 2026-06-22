[reflective] Refactoring de type zéro : rendre le code compréhensible avant de changer le comportement.

Il existe une forme de refactoring que les équipes font tout le temps, généralement sous pression, généralement sans lui donner de nom.

Vous ouvrez le fichier où vit le bug. La méthode est trop longue. Les noms sont fatigués. Les branches s'empilent comme de vieilles chaises dans une cave. Vous sentez physiquement que faire le changement demandé dans cette forme de code est une mauvaise idée.

Mais vous n'êtes pas prêt à le redessiner. Vous n'essayez pas d'introduire une nouvelle abstraction. Vous n'essayez pas de prouver que vous êtes la personne clean-code dans la pièce.

[calm] Vous essayez de rendre le comportement actuel assez compréhensible pour que le prochain changement puisse être fait en sécurité.

J'appelle cela le refactoring de type zéro.

Ou, moins mémorablement mais plus précisément : le refactoring de type zéro est le nettoyage qui préserve le comportement avant de changer le comportement, afin que le code devienne lisible, testable et reviewable.

C'est l'étape avant l'étape un.

Pas la vraie rénovation. Le dégagement de l'établi. L'étiquetage des câbles. Le geste qui rend la chose lisible avant d'y mettre les mains.

[deliberate] Pourquoi le type zéro mérite un nom.

Martin Fowler définit le refactoring comme une modification de la structure interne du code sans changement de son comportement externe. Cette précision compte. Si le comportement change, le travail peut toujours être utile, mais ce n'est pas du refactoring au sens strict.

Le type zéro est plus étroit que cela.

Un refactoring normal peut améliorer le design. Le type zéro peut ne pas le faire. Un refactoring normal peut déplacer des responsabilités entre classes. Le type zéro ne devrait pas. Un refactoring normal peut créer de meilleures frontières de domaine. Le type zéro s'arrête plus tôt : il fait dire au code existant ce qu'il fait déjà.

Cela paraît modeste jusqu'au moment où vous fixez une méthode de neuf cents lignes pendant un hotfix et que votre cerveau commence à mettre en mémoire tampon.

[matter-of-fact] Le problème immédiat dans du code laid n'est souvent pas l'architecture. C'est la compréhensibilité. Vous ne pouvez pas changer en sécurité ce que vous ne pouvez pas tenir dans votre tête.

Le travail de Sonar sur la complexité cognitive est utile ici parce qu'il sépare "combien de chemins existent ?" de "à quel point est-ce difficile à suivre pour un humain ?" Le type zéro vise la seconde question. Il réduit la quantité d'état, de branchements, d'ambiguïté de noms et de bruit visuel qu'une personne en review doit simuler mentalement.

Ce n'est pas cosmétique. C'est de la réduction de risque.

[reflective] Le nom est né d'un hotfix.

Le bug n'était pas intellectuellement profond. La méthode autour de lui l'était. C'était le genre de méthode où chaque variable locale avait l'air innocente jusqu'à ce que vous réalisiez qu'elle portait un sens venu de trois écrans plus haut. Chaque condition était supportable isolément, mais leur combinaison rendait le chemin d'exécution instable.

Je n'avais pas besoin d'un beau design. J'avais besoin de debuggabilité.

J'avais besoin de moins de branches par écran. J'avais besoin de noms qui décrivent l'intention métier plutôt que la mécanique temporaire. J'avais besoin de morceaux plus petits que je pouvais parcourir au debugger. Et j'avais besoin d'une manière de reviewer le nettoyage sans reviewer en même temps le bug fix.

Un LLM a suggéré plusieurs types raisonnables de refactoring. Extraire ce service. Introduire ce pattern. Séparer les responsabilités. Toutes de bonnes idées. Toutes trop lourdes pour ce moment-là.

Il a demandé s'il devait commencer par le type un.

[emphasized] J'ai dit : non, commence par le type zéro.

Autrement dit : avant d'améliorer le design, rends le code actuel lisible sans changer ce qu'il fait.

Cette distinction a sauvé le travail. La méthode est devenue navigable. Le bug est devenu visible. Le correctif est resté petit.

[deliberate] Une définition de travail.

Le refactoring de type zéro est une passe contrainte, qui préserve le comportement, et qui rend le code plus facile à comprendre avant un changement fonctionnel.

Il a quatre mouvements autorisés.

Premièrement, extraire des parties significatives dans des méthodes ou des variables locales nommées. Deuxièmement, renommer les choses pour que le code utilise un langage humain au lieu de l'archéologie. Troisièmement, retirer le bruit dont l'inutilité est prouvée. Quatrièmement, ajouter ou resserrer des tests de caractérisation autour du comportement que vous allez préserver.

Et il a trois frontières strictes : pas de nouveau comportement produit, pas de mouvement architectural, et pas d'améliorations "tant qu'on y est" qui changent la question de review.

Si la pull request change ce qu'observent les utilisateurs, les callers, les jobs, les réponses API, les écritures en base, les événements émis ou les chemins d'erreur, ce n'est plus du type zéro. Cela peut toujours être le bon travail, mais il faut le nommer honnêtement.

[conversational tone] Voici un petit exemple avant-après. Il est volontairement ordinaire. Le refactoring le plus utile est souvent ordinaire.

Imaginez une fonction qui décide si un compte peut démarrer un essai. Dans la version originale, une seule fonction vérifie cinq choses inline. Elle renvoie false si le compte manque ou est supprimé. Elle renvoie false si le compte a un flag trial blocked. Elle renvoie false s'il y a un abonnement actif. Elle renvoie false si le compte a déjà payé ou a déjà un essai actif. Elle renvoie false si le plan est gratuit ou caché. Sinon, elle renvoie true.

Ce code n'est pas terrible. C'est important. Le type zéro n'est pas réservé aux catastrophes.

Mais imaginez devoir changer l'éligibilité à l'essai. Quelle règle changez-vous ? Laquelle relève d'une politique manuelle ? Laquelle correspond à l'historique de facturation ? Laquelle relève de l'éligibilité du plan ? La personne en review doit déduire tout cela de la mécanique.

Après une passe de type zéro, la fonction de haut niveau vérifie toujours les mêmes choses, dans le même ordre, mais chaque condition porte un nom. Le compte manque-t-il ou est-il supprimé ? Est-il bloqué manuellement pour l'essai ? A-t-il un abonnement actif ? A-t-il déjà payé ou a-t-il un essai actif ? Le plan est-il inéligible à l'essai ?

[matter-of-fact] Ce n'est pas un nouveau design. Cela n'introduit pas un objet policy. Cela ne décide pas si l'éligibilité à l'essai appartient à un autre module. Cela ne rend pas les règles plus élégantes.

Cela fait une seule chose : donner des noms au comportement existant.

Maintenant, la prochaine pull request peut dire : "Change la règle paid-before-or-active-trial pour traiter différemment les abonnements payants expirés", et la personne en review n'est plus en train de fouiller dans des conditions anonymes.

C'est le type zéro en train de faire son travail.

[deliberate] La partie dangereuse, c'est que même "juste une extraction" peut changer le comportement.

Le type zéro paraît sûr parce qu'il est petit. Il est plus sûr, pas magiquement sûr.

L'extraction peut changer le comportement si vous êtes négligent avec l'ordre d'évaluation, le short-circuiting, la portée des variables, la mutation, le moment où les exceptions sont déclenchées, les appels répétés au temps, à l'aléatoire, aux entrées et sorties, aux caches, aux requêtes de base de données, ou aux références qui pointaient auparavant vers le même objet.

C'est là que le type zéro demande de la discipline.

Ne réécrivez pas une condition parce que la version réécrite est "équivalente". L'équivalence est l'endroit où les bugs mettent une petite moustache et passent devant la sécurité.

Dans l'exemple de l'essai, gardez la vérification de facture payée et la vérification d'essai actif dans une seule expression à court-circuit si c'est ce que faisait l'ancien code. Ne calculez pas à l'avance une variable paid-before et une variable active-trial juste parce que cela paraît plus joli. La seconde version touche la collection d'essais et appelle l'horloge même quand la vérification des factures prouvait déjà la réponse.

Peut-être que cela n'a pas d'importance. Peut-être que si. Le type zéro ne demande pas à la personne en review de deviner.

En cas de doute, extrayez d'abord, embellissez plus tard, et gardez chaque étape assez ennuyeuse pour qu'un humain fatigué puisse la vérifier.

[reflective] Le filet de sécurité, c'est caractériser avant d'être confiant.

Si le code est déjà bien testé, très bien. Lancez les tests ciblés avant et après la passe de type zéro.

S'il ne l'est pas, résistez à l'envie de dire : "Ce n'est que du cleanup."

Cette phrase a lancé mille régressions.

Working Effectively with Legacy Code, de Michael Feathers, reste le livre auquel je pense ici. En pratique, le mouvement utile est souvent un petit test de caractérisation : capturer ce que le code fait actuellement pour le chemin que vous allez toucher.

Pas ce qu'il devrait faire. Ce qu'il fait.

Par exemple, si les comptes bloqués ne peuvent actuellement pas démarrer un essai, écrivez un test ciblé qui construit un compte bloqué et confirme que la vérification d'essai renvoie false.

Ce test peut être philosophiquement insatisfaisant. Il peut encoder un comportement que vous avez l'intention de changer dans cinq minutes.

Très bien. Supprimez-le ou mettez-le à jour dans la pull request qui change le comportement.

Pour la pull request de type zéro, son travail est humble : prouver que le cleanup n'a pas fait entrer en douce le vrai changement.

[matter-of-fact] Utilisez le type zéro quand le prochain changement est bloqué par la compréhensibilité.

Utilisez-le quand vous relisez sans cesse la même méthode et perdez le fil. Utilisez-le quand le fichier a une méthode principale qui mélange validation, branching, entrées et sorties, formatting et persistence. Utilisez-le quand un bug fix d'une ligne demande d'expliquer six faits sans rapport. Utilisez-le quand les reviewers se disputent sur le style parce que l'intention n'est pas visible. Utilisez-le quand le code est assez correct pour faire tourner le business, mais trop boueux pour être changé avec confiance. Utilisez-le quand vous devez ajouter des tests, mais que la forme actuelle ne vous donne aucun endroit propre pour observer le comportement.

Évitez le type zéro quand le changement fonctionnel est déjà évident et sûr. Évitez-le quand vous ne pouvez pas expliquer exactement quel comportement doit rester inchangé. Évitez-le quand le cleanup exige de toucher beaucoup de callers dans le système. Évitez-le quand l'équipe essaie de faire passer un redesign sous une étiquette de cleanup. Et évitez-le quand aucun changement proche ne bénéficie de cette clarté.

Ce dernier point compte. Le cleanup sans client se transforme souvent en affaire de goût. Le type zéro a un client : le prochain changement.

[deliberate] Voici la règle que j'utilise.

Si je ne peux pas écrire le diff qui change le comportement d'une manière qu'une personne en review comprenne vite, j'ai probablement besoin d'un type zéro d'abord.

Pas toujours. Mais assez souvent.

Vous pouvez aussi le formuler en trois questions.

Quel comportement suis-je sur le point de changer ? Quel comportement actuel doit rester exactement identique ? Quelle petite passe de lisibilité rendrait les deux réponses évidentes dans le diff ?

Si la troisième question a une petite réponse, faites le type zéro.

Si elle a une énorme réponse, vous regardez peut-être un vrai refactoring, pas du type zéro. Découpez le travail, faites un plan, et arrêtez de prétendre que c'est inoffensif.

[conversational tone] Le type zéro fonctionne mieux quand il peut être reviewé comme sa propre chose.

Si le cleanup est minuscule, mettez-le dans le premier commit de la pull request fonctionnelle. Par exemple : d'abord, "Type Zero: name existing trial eligibility checks." Ensuite, "Fix expired subscription trial eligibility."

Si le cleanup est assez large pour rendre le diff de comportement difficile à voir, ouvrez une pull request séparée.

Utilisez un langage de pull request ennuyeux. Dites que la pull request est uniquement du type zéro. Dites que l'intention est de rendre le chemin existant lisible avant de changer les règles, tout en préservant le comportement actuel. Dites ce qui a changé : les vérifications d'éligibilité de haut niveau ont été extraites, les variables temporaires ont été renommées selon les termes du domaine, un helper privé inutilisé a été supprimé. Dites comment cela a été validé : les tests existants passent, et une couverture de caractérisation a été ajoutée pour les comptes bloqués, les comptes déjà payés, et les comptes avec essai actif. Dites ce qui est hors scope : changer les règles d'essai ou déplacer cette logique dans un objet policy.

Cela donne aux reviewers le bon travail.

Ils ne reviewent pas si la logique produit est meilleure. Ils reviewent si le code fait toujours la même chose plus lisiblement.

Les bons commentaires de review pour le type zéro ressemblent à ceci : cette extraction change le moment où l'horloge est appelée ; peut-on garder l'ancien comportement de short-circuit ? Le nouveau nom dit active subscription, mais le prédicat traite aussi past-due comme actif ; peut-on faire correspondre le nom au comportement réel ? Ce helper supprimé semble inutilisé dans ce package, mais est-il référencé par reflection ou config ? Peut-on ajouter un test de caractérisation pour le chemin que ce cleanup expose ?

Les commentaires moins utiles ressemblent à ceci : peut-on transformer cela en strategy ? Tout ce module devrait être event-driven. Tant que vous y êtes, pouvez-vous corriger ce cas limite bizarre de billing ?

Ce sont peut-être de bonnes idées. Ce ne sont pas des reviews de type zéro.

[matter-of-fact] Le théâtre du cleanup est un travail qui a l'air vertueux dans un diff mais qui ne réduit pas le risque pour le prochain changement.

Il a généralement l'une de ces odeurs : du churn large de formatting dans des fichiers que personne ne va toucher bientôt ; des renommages fondés sur le goût personnel plutôt que sur la clarté domaine ; déplacer du code dans de nouvelles abstractions avant que quelqu'un puisse énoncer le comportement actuel ; supprimer du code unused sans prouver que le runtime ne peut pas l'atteindre ; mélanger cleanup et changement de comportement, si bien que les reviewers ne savent plus quelle ligne a fait quoi ; ou une description de pull request qui dit "misc cleanup."

Le type zéro est différent parce qu'il rend des comptes.

Il dit : voici le comportement que nous préservons. Voici le chemin que nous rendons compréhensible. Voici le prochain changement que cela rend possible. Voici comment nous avons vérifié que le cleanup n'a pas changé le comportement.

C'est la différence entre ranger et faire de l'ingénierie.

[reflective] Parfois, le type zéro révèle que le prochain mouvement sûr est une seam.

La note de Fowler sur les legacy seams est utile parce qu'elle décrit des endroits où l'on peut rediriger, observer ou tester le comportement sans modifier la source au point du comportement. Dans un système legacy, une seam peut faire la différence entre "nous pouvons tester ceci" et "nous espérons très professionnellement."

Mais créer une seam peut franchir la frontière du type zéro.

Renommer un appel de calcul d'expédition pour que le flux actuel ait un nom plus clair peut être du type zéro si le comportement reste le même.

Changer la signature de cette fonction pour que les tests puissent injecter un faux shipping provider est peut-être le bon mouvement, mais ce n'est plus seulement rendre le code existant compréhensible. Cela change la surface de collaboration. Traitez-le comme un refactoring qui casse une dépendance, et reviewez-le avec ce niveau d'attention.

Le type zéro peut pointer vers la seam. Il n'a pas à créer toute l'architecture de test dans la même pull request.

[deliberate] Avant d'ouvrir une pull request de type zéro, passez la checklist pratique en langage simple.

Puis-je nommer le travail qui change le comportement et que ce cleanup prépare ? La pull request évite-t-elle les changements intentionnels visibles par l'utilisateur ou par le caller ? Les méthodes extraites préservent-elles l'ordre d'évaluation et le comportement de short-circuit ? Les noms décrivent-ils ce que le code fait réellement, pas ce que j'aimerais qu'il fasse ? Le code supprimé est-il prouvé inutilisé dans le runtime pertinent, pas seulement impopulaire ? Ai-je lancé les tests ciblés ou rejoué le scénario qui compte ? Si les tests manquaient, ai-je ajouté une couverture de caractérisation pour le chemin touché ? La description de pull request dit-elle aux reviewers que c'est du type zéro et ce qui est hors scope ?

Pendant la review, demandez "est-ce que cela préserve le comportement ?" avant "est-ce que je préfère ce design ?" Poussez les changements de comportement dans un commit ou une pull request de suivi. Gardez les idées d'architecture comme notes, sauf si elles sont nécessaires à la sécurité. Méfiez-vous de l'équivalence trop clever.

Après le merge, faites le vrai changement pendant que le modèle mental est frais. Supprimez ou mettez à jour les tests de caractérisation seulement quand le comportement change intentionnellement. Ne laissez pas le type zéro devenir un parking pour cleanup éternel.

[reflective] Le refactoring de type zéro est une petite promesse.

Je rends ce code plus facile à changer sans changer ce qu'il fait.

Cette promesse est utile précisément parce qu'elle est limitée.

Elle donne au développeur la permission d'améliorer la surface de travail sans lancer un débat d'architecture. Elle donne au reviewer un standard clair. Elle donne à la prochaine pull request une chance réelle de parler du changement produit lui-même.

Parfois, la chose la plus courageuse à faire dans une codebase désordonnée n'est pas de la redessiner.

[calm] Parfois, c'est d'abord de faire dire la vérité au désordre actuel.
