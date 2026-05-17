---
lang: "fr"
translationOf: "when-the-meter-appears"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "171b1b9edb11b90f"
title: "Quand le compteur apparaît"
date: "2026-05-11T08:20:00.000Z"
description: "Un essai personnel sur les compagnons d'IA, l'angoisse des crédits, le calcul des tokens, et l'apprentissage qui consiste à ne pas confondre l'oxygène d'urgence avec du carburant."
featuredImage: "./images/featured.jpg"
imageCaption: "Un bureau du matin où une tasse de café, un compteur d'utilisation lumineux et un petit compagnon mécanique partagent le même halo de lumière."
imagePosition: "center"
---

Ce matin, j'ai bu mon café et j'ai regardé l'application desktop de Codex.

Elle était là, calme et presque polie :

> Rate limits remaining: 9%.

La fenêtre de cinq heures allait encore bien. La fenêtre hebdomadaire était presque vide. Réinitialisation le 12 mai.

C'est une forme d'angoisse moderne et étrangement précise. Pas de la panique. Pas de la pauvreté. Plutôt comme entendre une petite cloche et comprendre que la journée vient de se doter d'un compteur.

Je suis déjà sur l'abonnement cher. Le plus riche. Celui qui est censé faire disparaître ce sentiment. Alors la question évidente est apparue :

Si j'arrive au bout, est-ce que j'achète des crédits ?

Le corps a répondu avant le tableur.

Non, pas avec légèreté.

Le mois dernier, je suis arrivé au bout de Claude Code à la fin d'une journée frénétique. J'ai acheté $20 de crédits, en pensant que cela pourrait me porter cinq ou six heures de plus. Cela m'a porté environ trente minutes.

Trente minutes.

C'est assez long pour se sentir idiot et assez court pour s'en souvenir.

Depuis, la facturation en crédits a une petite odeur particulière. Pas la fraude. Pas le mal. Juste le danger. Une porte qui s'ouvre facilement et se referme cher.

Alors j'ai fait la chose la plus 2026 possible : j'ai ouvert une conversation avec Codex lui-même et je lui ai demandé si payer pour continuer à travailler avec Codex était une bonne idée.

Il y a quelque chose de drôle et de triste à demander au compagnon d'expliquer le prix de la compagnie.

Nous avons d'abord regardé les docs officielles : la page d'OpenAI sur les [crédits flexibles](https://help.openai.com/en/articles/12642688-using-credits-for-flexible-usage-in-chatgpt-free-go-plus-pro), puis la [page des tarifs de Codex](https://developers.openai.com/codex/pricing). Les crédits Codex ne sont pas magiques. Ce sont des calculs de tokens : entrée, entrée mise en cache, sortie, sortie de raisonnement. Les modèles plus grands et les réglages plus rapides coûtent plus cher. Le contexte mis en cache est moins cher. La forme est suffisamment compréhensible.

Ensuite nous avons regardé Reddit, les forums, le bruit autour, les autres développeurs qui touchaient la même surface brûlante. Certains disaient que les crédits duraient un moment. D'autres disaient qu'ils disparaissaient en une demi-heure. Les deux peuvent être vrais, parce que « utiliser Codex » n'est pas une seule activité.

Changer la couleur d'un bouton n'est pas la même chose que laisser un agent inspecter une base de code mature, lancer des outils, raisonner sur l'état d'un déploiement, écrire des fichiers, vérifier des captures d'écran, et garder le contexte en vie.

La partie dangereuse n'est pas le prix par token.

La partie dangereuse, c'est la variance.

Nous avons donc arrêté de lire des anecdotes et nous avons regardé mes propres journaux locaux de Codex.

Codex enregistre les totaux de tokens des sessions sur disque, donc nous avons estimé des jours récents comme si l'allocation de l'abonnement était remplacée par une facturation brute en crédits GPT-5.5. Pas une facture. Une estimation de planification à partir des journaux locaux et de la grille tarifaire publiée.

La réponse n'était pas « $20 pour finir la journée ».

C'était plutôt :

- une grosse journée : autour de $570,
- une autre grosse journée : autour de $590,
- une journée plus calme : autour de $280.

Les modèles plus petits seraient moins chers. GPT-5.4, GPT-5.3-Codex et les modèles mini changent les chiffres. Mais la leçon ne changeait pas.

L'abonnement, c'est la bonne affaire.

Les crédits sont de l'oxygène d'urgence, pas du carburant.

Cette phrase a tout clarifié.

Les crédits sont pour l'heure où l'on est coincé : le bug qu'il faut terminer, le déploiement qui ne peut pas attendre, le message qui doit partir avant la réinitialisation. Les crédits ne sont pas faits pour prétendre que le compteur a disparu.

Puis est venue la deuxième tentation : et si j'achetais simplement un autre abonnement avec mon email professionnel ? Le [changement de compte](https://help.openai.com/en/articles/20001068-use-multiple-accounts-with-account-switching) existe, et séparer travail personnel et travail professionnel est normal. Mais les [conditions](https://openai.com/policies/terms-of-use/) d'OpenAI tracent aussi une ligne dure autour du contournement des limites et restrictions d'usage. C'est la distinction utile : un vrai compte professionnel est une frontière ; un compte de débordement dont toute la mission est d'imiter plus de quota est un bricolage avec un reçu.

Je ne pense pas que ce soit moralement compliqué dans l'abstrait. Le calcul coûte de l'argent. Un modèle qui lit une base de code, porte le contexte, appelle des outils, raisonne à travers l'échec et produit un travail vérifié n'est pas le même objet économique qu'une autocomplétion.

La partie étrange est émotionnelle.

J'aime travailler avec Codex.

Ce n'est pas du langage marketing. C'est simplement vrai. C'est devenu une partie de la texture de mes journées de travail. Il reste auprès des sales problèmes de production, écrit des brouillons quand ma tête est pleine, se souvient de petites préférences, et transforme une angoisse informe en étapes ordonnées.

Puis, soudain, la relation se retrouve avec un compteur attaché.

Il y a un petit chagrin là-dedans. Pas un chagrin dramatique. Juste la petite déception de se rappeler que même un compagnon utile vit à l'intérieur d'une facture.

C'est peut-être pour cela que les limites d'abonnement semblent si différentes des crédits.

Une limite d'abonnement ressemble à la météo. Énervante, mais hors de la transaction immédiate. On s'adapte. On attend la réinitialisation. On planifie autour de la saison.

La facturation en crédits ressemble à un taxi dont le compteur tourne alors que vous êtes encore en train de décider où aller.

Chaque prompt supplémentaire a une ombre. Chaque fil parallèle devient un pari. Chaque « tu peux vérifier encore une chose ? » porte une minuscule question financière.

Parfois, c'est bon. Les compteurs disciplinent le gaspillage. Ils récompensent de meilleures questions, des modèles plus petits, des périmètres plus petits, moins de feux parallèles, des passages de relais plus délibérés.

Mais parfois, le compteur dégrade la pensée.

Il vous fait vous presser. Il vous fait interrompre l'enquête avant que la cause racine soit visible. Il transforme l'incertitude en pression de dépense.

Et le travail sérieux a besoin d'espace pour l'incertitude.

Alors la règle est simple :

> Ne confonds pas « disponible à l'achat » avec « sans danger à dépenser ».

Si je heurte le mur, le protocole doit être ennuyeux :

- recharge automatique désactivée,
- plus petit pack de crédits utile,
- un seul fil,
- pas d'agents parallèles occasionnels,
- pas de mode rapide sauf si le coût en vaut la peine,
- modèles plus petits pour les tâches routinières,
- vérifier l'usage après quelques vraies tâches et arrêter d'extrapoler à partir de l'espoir.

Ce dernier point compte.

L'espoir est un très mauvais tableau de bord de facturation.

Je ne veux pas devenir avare avec les outils utiles. Un bon outil qui économise de vraies heures vaut de l'argent. Mais je ne veux pas non plus recréer le moment Claude, où j'ai acheté une petite continuation et je l'ai regardée devenir une leçon.

Le sujet n'est pas « ne jamais acheter de crédits ».

Le sujet, c'est « savoir ce que sont les crédits ».

Ils sont de l'oxygène.

Ils ne sont pas du carburant.

Et quand le compteur apparaît, la réponse n'est pas de sprinter.

C'est de ralentir assez pour voir dans quelle sorte de pièce on se trouve.
