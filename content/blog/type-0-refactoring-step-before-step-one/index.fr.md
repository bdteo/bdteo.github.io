---
lang: "fr"
translationOf: "type-0-refactoring-step-before-step-one"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "701d1621c1262282"
title: "Refactoring de type 0 : l'étape avant la première étape"
date: "2025-12-13T12:00:00.000Z"
description: "Le refactoring de type 0 est un nettoyage contraint, qui préserve le comportement, pour rendre du code désordonné lisible et assez sûr pour y travailler avant de tenter un vrai refactoring ou de livrer un hotfix."
tags: ["refactoring", "ingénierie logicielle", "debugging", "maintenabilité"]
featuredImage: "./images/featured.webp"
imageCaption: "Mise en place. Le travail avant le travail."
---

Il existe une catégorie de refactoring que les équipes font constamment, dont elles profitent immédiatement, et qu'elles ne nomment presque jamais.

C'est le travail que l'on fait juste avant de toucher au fichier qui fait peur. La demande de fonctionnalité vous force à entrer dans le module en bazar. L'incident arrive, et le bug se cache quelque part dans une méthode qui semble avoir son propre système météorologique.

Vous ne redessinez pas le système. Vous n'introduisez pas une nouvelle abstraction. Vous n'"améliorez" rien de façon maligne.

Vous rendez simplement le code assez lisible pour pouvoir travailler.

J'ai commencé à appeler cela le **refactoring de type 0**.

Le **refactoring de type 0** est un nettoyage préparatoire, qui **préserve le comportement**, et qui rend le code plus facile à raisonner **avant** de faire des refactorings architecturaux, du travail de performance, ou du travail fonctionnel.

C'est l'étape "sécher le sol avant de refaire la cuisine". La plupart des équipes le font déjà informellement. Lui donner un nom en fait un outil partagé.

---

## La vraie raison d'être du type 0 : les humains ont un budget de mémoire de travail

Voici la vérité brutale derrière l'idée :

**Mon cerveau (et le vôtre) n'est pas construit pour debugger de façon fiable une méthode de 2000 lignes sous pression.**

Ce n'est pas un défaut personnel. C'est simplement ainsi que fonctionne la cognition.

Debugger vous demande de garder en tête, en même temps :

- le chemin d'exécution courant
- l'état pertinent
- ce que chaque variable veut vraiment dire
- l'ensemble des branches possibles
- les consequences de "si ceci arrive, alors..."

Dans du petit code, c'est gérable.

Dans du gros code avec une forte complexité cyclomatique, cela devient de la supposition probabiliste. Vous pouvez encore avoir de la chance, mais c'est coûteux et risqué, surtout pendant un hotfix.

Le type 0 est une réponse pratique : c'est la façon dont vous **achetez rapidement de la clarté** sans prendre le coût et le risque d'un "vrai refactoring".

---

## Pourquoi l'appeler "type 0"

Le nom ne vient pas d'une grande théorie. Il vient d'un moment de forte pression.

Je travaillais sur un hotfix. Le bug était enfoui dans une méthode qui était, en pratique, son propre petit univers : **environ 2000 lignes**.

Le bug n'était pas conceptuellement difficile. La méthode, oui.

Chaque "que se passe-t-il si..." se ramifiait en dix questions de plus, et ces ramifications n'étaient pas du genre utile. C'était de la complexité incidente : bruit, répétition, noms peu clairs, et une structure qui ne correspondait pas au modèle mental nécessaire pour debugger.

Ce dont j'avais besoin n'était pas la perfection. J'avais besoin de **debuggabilité** :

- moins de branches par écran
- des "étapes" plus claires, avec des noms
- moins de bruit
- moins de temps passé à reparser ce que je venais de lire

Mais la pression du temps ne permettait pas un refactoring plus large ni une "refonte idiomatique". Le faire correctement aurait pris une demi-journée (ou plus), tests manuels inclus. Dans une fenêtre de hotfix, ce n'est pas de la discipline ; c'est un pari.

J'ai donc demandé à un LLM de suggérer des opportunités de refactoring pour la classe et cette méthode, sans lui dire pourquoi.

Il est revenu avec une liste de quatre "types" de refactoring. Tous raisonnables. Tous applicables. Tous trop coûteux pour ce moment-là.

Puis il a posé la question polie :

> "Should I start with Type 1?"

C'est là que j'ai répondu :

> "No. Let's start with Type 0."

Et j'ai défini le type 0 sur-le-champ : un ensemble contraint et mécanique de changements qui réduisent la complexité et augmentent la lisibilité **sans changer le comportement ni l'architecture**.

La méthode est devenue navigable. Mon cerveau pouvait de nouveau suivre l'exécution. J'ai trouvé le bug, je l'ai corrigé, et j'ai livré sans dégâts collatéraux.

C'est pourquoi j'aime le nom **type 0** : c'est le refactoring que vous faites **avant** les "vrais" types de refactoring, surtout quand vous êtes sous pression et que vous avez besoin d'une façon sûre de créer vite de la clarté.

---

## Le probleme que le type 0 resout

La plupart des conseils sur le refactoring supposent que vous pouvez déjà _voir_ le design.

Dans les bases de code réelles :

- les méthodes sont longues et multi-usages
- les expressions répétées et la complexité incidente cachent l'intention
- les variables sont cryptiques (`$e`, `$tmp`, `$res`)
- le code mort et les imports inutilisés créent du bruit mental
- la "forme" du code est si brouillonne que même de petits changements semblent risqués

Quand vous tentez un "vrai refactoring" par-dessus cela (frontières, patterns, déplacement de responsabilités), vous empilez l'incertitude sur l'incertitude :

- vous ne pouvez pas facilement dire quel comportement vous préservez
- vous ne pouvez pas prédire le rayon d'impact
- les revues dégénèrent en débats subjectifs
- les gens ont peur de toucher aux choses, et le désordre s'accumule

**Le type 0 est la façon de réduire d'abord la charge cognitive.** Il crée une base stable où un travail plus profond peut se faire en sécurité.

---

## Utilisez le type 0 quand...

Le type 0 est le plus précieux quand :

- vous devez debugger vite (hotfixes, incidents) et le code est trop grand ou trop ramifié pour raisonner dessus en sécurité
- vous vous sentez "perdu dans la méthode" et relisez sans cesse la même section parce que la structure n'aide pas votre mémoire de travail
- le code est correct mais illisible, et vous ne pouvez pas vous permettre de "nettoyer la logique", seulement de l'exposer
- vous voulez réduire le risque avant un travail plus profond (vous savez que vous refactorerez plus tard, mais il vous faut d'abord une carte claire du comportement actuel)
- vous voulez transformer du savoir tribal en structure lisible, pour que le debugging ne dépende pas d'une seule personne

Le type 0 n'est pas un luxe. Dans ces cas-là, c'est souvent le moyen le plus rapide de reprendre le contrôle.

---

## Une définition que vous pouvez utiliser dans votre équipe

**Le refactoring de type 0 est un ensemble de micro-refactorings qui améliorent la lisibilité et la maintenabilité sans changer le comportement ni l'architecture.**

Il est volontairement contraint. Les contraintes sont la fonctionnalité.

Le type 0 se compose de quatre sous-patterns obligatoires :

1. **0a. Extraction de méthodes**
2. **0b. Concision**
3. **0c. Empathie (lisibilité pure)**
4. **0d. Suppression du code mort**

Et il suit trois règles strictes :

- **Aucun changement de comportement**
- **Aucun changement architectural**
- **Aucune amélioration "maligne" au-delà des quatre patterns**

Si vous enfreignez ces règles, vous ne faites plus du type 0 : vous êtes passé dans une autre catégorie de travail, qui exige une coordination différente, une rigueur de revue différente, et souvent une stratégie de test différente.

---

## Pourquoi le nommer ?

Parce que nommer change la façon dont les équipes se coordonnent.

- "Je ne fais que du type 0 dans cette PR" indique aux reviewers ce qu'ils doivent regarder : préservation du comportement et lisibilité, pas débats d'architecture.
- "Il nous faut du type 0 avant de refactorer ceci" est une admission honnête que le code n'est pas encore prêt pour un changement plus profond.
- "Faisons le type 0 comme étape 0" crée un petit rituel qui vous évite de construire par-dessus le chaos.

---

## Les quatre sous-patterns

### 0a. Extraction de méthodes (la fondation)

**Objectif :** découper les grandes méthodes en petites méthodes focalisées, pour qu'un humain puisse lire l'intention linéairement.

Règles pratiques :

- décomposer les méthodes trop longues pour tenir dans la mémoire de travail
- chaque méthode extraite doit faire une chose et porter un nom descriptif
- extraire des étapes significatives, pas des morceaux arbitraires de N lignes

Pourquoi cela fonctionne (surtout pour le debugging) :

- les méthodes plus petites créent des étiquettes pour le chemin d'exécution
- un défilement de 2000 lignes devient une courte méthode d'orchestration que l'on peut parcourir mentalement
- vous pouvez poser des breakpoints aux frontières sémantiques ("valider l'entrée", "construire la requête", "appliquer les filtres") au lieu de chasser à l'aveugle

### 0b. Concision (réduire la complexité incidente)

**Objectif :** retirer le bruit visuel pour que l'intention ressorte.

Exemples :

- extraire les expressions répétées dans des variables locales
- extraire les contextes de log / chaînes clés / fragments d'URL répétés dans des variables
- préférer les fonctionnalités du langage qui communiquent directement l'intention
- simplifier les interpolations trop verbeuses

Pourquoi cela fonctionne :

- cela réduit la charge cognitive
- cela rend les diffs plus petits et les changements plus sûrs
- cela évite la dérive par copier-coller

### 0c. Empathie (lisibilité pure)

**Objectif :** ecrire pour le prochain humain, pas pour le compilateur.

L'empathie signifie :

- utiliser des noms de variables descriptifs (éviter `$e`, `$d`, `$tmp` sauf si c'est vraiment évident)
- maintenir une terminologie cohérente dans un module
- renommer les noms trompeurs
- rendre le code auto-documente

Test decisif :

> Si quelqu'un lit ceci à 2 h du matin pendant un incident, est-ce que cela l'aidera à garder le chemin d'exécution en tête ?

### 0d. Suppression du code mort (retirer les mensonges)

**Objectif :** supprimer tout ce qui pretend compter mais ne compte pas.

Exemples :

- méthodes privées inutilisées
- imports inutilisés
- anciennes approches commentées
- helpers dépréciés que personne n'appelle

Pourquoi cela fonctionne :

- moins de code signifie moins de choses a mal comprendre
- les résultats de recherche deviennent fiables

---

## Ce que le type 0 n'est pas

Le type 0 n'est pas :

- changer les frontieres de services
- introduire de nouvelles abstractions ou de nouveaux patterns
- réarchitecturer un workflow
- remplacer des bibliothèques
- réordonner les responsabilités entre couches
- "corriger" une logique que vous soupçonnez fausse (sauf si vous déclarez explicitement un changement de comportement et que vous le testez)

Si vous vous entendez dire :

- "Tant que j'y suis, faisons aussi..."
- "Ce serait plus joli si..."
- "On devrait probablement refondre..."

Vous êtes peut-être en train de quitter le type 0. Ce n'est pas mauvais en soi, mais cela doit être intentionnel.

---

## La promesse centrale : préservation du comportement (et comment la garder vraie)

Le type 0 ne fonctionne que si les équipes font confiance à la promesse.

Et oui, vous avez raison de vous méfier : **l'extraction de méthodes peut accidentellement changer le comportement** (retours anticipés, portée des variables, ordre d'évaluation, comportement des exceptions).

Le type 0 a donc besoin d'une discipline qui le garde honnête :

**Extraire tel quel, puis renommer/nettoyer.**

- Premier passage : déplacer le code dans des méthodes sans changer la logique
- Deuxième passage : appliquer concision + empathie
- Troisième passage : retirer le code mort

Garde-fous pratiques :

- ne réordonnez pas les conditions "pour la lisibilité"
- ne remplacez pas la logique par une logique "équivalente" sauf si vous êtes hors du type 0
- faites attention aux variables qui étaient auparavant dans une portée partagée
- traitez les "petites" différences de flux de contrôle comme de vraies différences

Et si vous avez *le moindre* filet de sécurité, même mince :

- lancez un test ciblé
- rejouez le scénario qui échouait
- validez le seul chemin que vous touchez

Le type 0 consiste à aller vite, **mais vite en réduisant la complexité cognitive**, pas vite en sautant la sécurité.

---

## Le type 0 comme rituel d'équipe répétable

### 1) Décider le périmètre (un timebox aide)

Exemples :

- "Faire le type 0 du hot path avant de debugger."
- "Type 0 seulement sur le chemin touché par ce correctif."

### 2) Identifier la "colonne vertébrale" du code

Trouvez la ou les méthodes d'entrée et les points de branchement. Transformez cette colonne vertébrale en récit lisible par extraction.

### 3) Appliquer les quatre sous-patterns dans l'ordre

Extraction de méthodes → concision → empathie → suppression du code mort.

### 4) Garder une "checklist type 0" dans votre PR

- [ ] Aucun changement de comportement (entrées/sorties inchangées)
- [ ] Aucun mouvement architectural
- [ ] Méthodes extraites et nommées comme des étapes significatives
- [ ] Expressions répétées extraites quand cela améliore la clarté
- [ ] Variables renommées ; terminologie cohérente
- [ ] Code mort et imports inutilisés supprimés

---

## Pensée de clôture

Le refactoring de type 0 est la promesse la plus simple qu'un développeur puisse faire :

> "Je laisse ce code plus facile à travailler que je ne l'ai trouvé, sans changer ce qu'il fait."

Parfois, c'est "bon à avoir".

Et parfois, c'est la seule façon pour un humain d'avancer vite en sécurité dans un désordre très complexe, surtout pendant un hotfix.
