---
lang: "fr"
translationOf: "apple-watch-still-mirror-swift-swt-passive-smoking-detection"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "0342ad4740de75ec"
title: "Détection du tabagisme avec l’Apple Watch : construire Still Mirror (Swift, SWT)"
date: "2025-05-13"
description: "Mon parcours pour construire « Still Mirror », une app Apple Watch de détection passive du tabagisme et du vapotage avec HealthKit, Swift, Xcode et la transformée en ondelettes stationnaire (SWT)."
tags: ["Apple Watch", "HealthKit", "Swift", "Xcode", "Transformée en ondelettes stationnaire", "SWT", "IA", "Traitement du signal", "Objets connectés", "Technologies de santé", "Surveillance passive", "Développement iOS"]
featuredImage: "./images/featured-still-mirror.jpg"
imageCaption: "Art conceptuel : une Apple Watch affichant de subtils motifs d’ondes physiologiques qui se transforment en notification discrète, sur fond de réseaux neuronaux et de graphes d’ondelettes."
---

L’idée de vraiment comprendre nos habitudes, surtout celles que nous accomplissons presque inconsciemment, m’a toujours fasciné. Et si nos objets connectés pouvaient offrir un miroir doux, sans jugement, à ces schémas ? Cette question a déclenché le projet « Still Mirror » : une tentative de détecter passivement les épisodes de tabagisme ou de vapotage à partir des riches données physiologiques d’une Apple Watch, sans demander de saisie manuelle à l’utilisateur. Il ne s’agit pas de construire une énième app de sevrage, mais plutôt un outil de pure conscience, sans filtre.

## Le défi : un murmure dans une symphonie de bruit

Le défi central est immense : comment distinguer la signature physiologique subtile d’un épisode de tabagisme/vapotage parmi la myriade d’autres activités quotidiennes et réponses corporelles ? Le stress, une marche rapide, un bruit soudain, ou même une tasse de café peuvent tous provoquer des changements transitoires de la fréquence cardiaque (FC) et de la variabilité de la fréquence cardiaque (VFC). Le signal que nous cherchons ressemble souvent à un murmure dans une symphonie de bruit physiologique.

Mais pour vraiment isoler ces événements fugitifs, il me fallait une technique de traitement du signal plus sophistiquée.

<figure>
  <img src="./images/apple-watch-swift-xcode.jpg" alt="Poste de développeur avec Xcode affichant du code Swift pour une app Apple Watch, avec des graphiques de données HealthKit en arrière-plan.">
  <figcaption>Fig 1. – L’écosystème de développement Apple : Xcode, Swift et HealthKit sont essentiels pour donner vie à « Still Mirror » sur l’Apple Watch.</figcaption>
</figure>

## Choisir la boîte à outils : écosystème Apple et Swift

Pour un projet destiné à l’Apple Watch, le choix de l’écosystème est clair :
*   **Xcode et Swift :** l’environnement de développement natif pour les plateformes Apple. M’y engager signifiait plonger plus profondément dans Swift, un langage que je trouve élégant et puissant, et naviguer dans les subtilités de Xcode.
*   **HealthKit :** le framework d’Apple est la porte d’entrée vers les flux de données essentiels : fréquence cardiaque, VFC (SDNN/RMSSD), SpO2 (particulièrement pertinent pour combustion vs vapotage) et niveaux d’activité. La conception de HealthKit centrée sur la confidentialité est primordiale pour une app qui manipule des données aussi sensibles.
*   **Limites de watchOS :** développer pour la montre signifie équilibrer en permanence les fonctionnalités avec les contraintes de ressources : autonomie de batterie et capacités de traitement en arrière-plan restent toujours au premier plan.

## Le cœur algorithmique : transformée en ondelettes stationnaire (SWT)

L’analyse traditionnelle des séries temporelles peine souvent avec les signaux non stationnaires, c’est-à-dire les signaux dont les propriétés statistiques (comme la moyenne et la variance) changent dans le temps. Les données physiologiques sont notoirement non stationnaires. C’est là que la **transformée en ondelettes stationnaire (SWT)** entre en jeu.

Contrairement à la transformée en ondelettes discrète (DWT) standard, qui est variante par translation (ce qui signifie qu’un petit décalage du signal d’entrée peut modifier fortement les coefficients d’ondelettes), la SWT est invariante par translation. Cela la rend plus robuste pour analyser des signaux où le moment exact des événements est crucial, mais peut varier légèrement.

**Pourquoi la SWT pour ce problème ?**

1.  **Localisation temps-fréquence :** la SWT peut décomposer un signal en différentes bandes de fréquences tout en préservant l’information temporelle. Cela signifie que nous pouvons chercher des caractéristiques fréquentielles précises (par exemple, des bouffées soudaines d’activité haute fréquence dans la FC, ou des changements spécifiques dans les bandes de fréquence de la VFC) qui apparaissent à des moments précis.
2.  **Débruitage :** les signaux physiologiques sont bruités. La SWT peut aider à séparer le signal « vrai » sous-jacent du bruit aléatoire en analysant les coefficients d’ondelettes à différentes échelles.
3.  **Détection d’événements transitoires :** elle est particulièrement efficace pour identifier les changements abrupts, les pics ou les événements transitoires dans un signal, exactement ce que l’on pourrait attendre de la réponse physiologique aiguë à la nicotine.

<figure>
  <img src="./images/stationary-wavelet-transform-visualization.jpg" alt="Visualisation abstraite d’un signal physiologique décomposé par transformée en ondelettes stationnaire en plusieurs bandes de fréquences.">
  <figcaption>Fig 2. – Visualiser la transformée en ondelettes stationnaire qui décompose un signal en ses composantes fréquentielles au fil du temps, pour aider à la détection de motifs.</figcaption>
</figure>

En substance, la SWT agit comme un ensemble sophistiqué de filtres, nous permettant de « voir » dans les données de FC, de VFC et potentiellement de SpO2 des motifs que le bruit ou les tendances de long terme pourraient masquer. Nous pouvons chercher des « formes » caractéristiques ou des changements d’énergie dans certaines sous-bandes d’ondelettes qui correspondent à la secousse physiologique.

## Le parcours de développement : des données à la détection

1.  **Collecte de données (HealthKit) :** mettre en place une récupération fiable des données HealthKit en arrière-plan, en respectant les autorisations de l’utilisateur et en gérant efficacement les mises à jour.
2.  **Prétraitement du signal :** nettoyer les données entrantes de FC, VFC et SpO2. Cela inclut la gestion des points de données manquants et peut-être un premier filtrage avant d’appliquer la SWT.
3.  **Application de la SWT :** appliquer la transformée en ondelettes stationnaire à des segments de séries temporelles physiologiques. Cela implique de choisir une ondelette mère appropriée (par exemple Daubechies, Symlet) et un niveau de décomposition.
4.  **Extraction de caractéristiques à partir des coefficients d’ondelettes :** c’est là que la magie (et beaucoup d’expérimentation) arrive. Au lieu de regarder directement les valeurs brutes de FC/VFC, nous analysons les coefficients SWT. Les caractéristiques pertinentes pourraient inclure :
    *   l’énergie dans certaines bandes de coefficients de détail autour du moment d’un événement suspecté ;
    *   les propriétés statistiques (variance, kurtosis) des coefficients ;
    *   la corrélation croisée entre les coefficients d’ondelettes de différents signaux physiologiques (par exemple FC et VFC).
5.  **Logique/modèle de détection :** au départ, il pourrait s’agir d’un système à règles cherchant des motifs précis dans les caractéristiques d’ondelettes extraites (par exemple : « un pic d’énergie significatif dans les coefficients de détail de la FC à l’échelle X, coïncidant avec une chute nette d’énergie dans les coefficients de détail de la VFC à l’échelle Y, pendant une période de faible activité physique »). À terme, cela pourrait évoluer vers un modèle d’apprentissage automatique entraîné sur ces caractéristiques.
6.  **Score de confiance :** comme décrit dans mon algorithme MVPS, générer un score de confiance pour chaque événement détecté est crucial, afin de refléter la force et la clarté de la signature.
7.  **Implémentation de l’app watchOS :** faire tourner l’algorithme de détection principal sur l’Apple Watch, en optimisant l’autonomie (par exemple, traitement des données par lots, déclenchement intelligent de l’analyse).
8.  **App compagnon iOS :** afficher la chronologie des événements détectés, fournir des aperçus et gérer les réglages. La synchronisation des données via WatchConnectivity est essentielle ici.

## Santé et considérations éthiques : la philosophie du « miroir »

Il est vital de répéter que « Still Mirror » est conçu comme un *outil de conscience*, pas comme un dispositif médical ni comme un programme de sevrage.
*   **Confidentialité d’abord :** tout le traitement, surtout le travail algorithmique sensible, devrait idéalement se faire sur l’appareil. L’accès aux données HealthKit est strictement fondé sur les autorisations.
*   **Aucun jugement :** l’interface de l’app et les aperçus qu’elle fournit doivent rester neutres, se contentant de refléter des schémas sans conseil prescriptif ni honte.
*   **Précision et transparence :** les utilisateurs doivent comprendre les limites de l’app. Les faux positifs et faux négatifs sont inévitables avec une détection passive aussi complexe. Il est important d’être transparent sur la confiance accordée aux détections.
*   **Autonomie de l’utilisateur :** le but est de fournir aux utilisateurs des données sur leur propre corps et leurs propres habitudes, afin de les aider à prendre leurs propres décisions éclairées.

## Apprendre Swift et naviguer dans l’écosystème Apple

Pour les développeurs venant surtout d’autres horizons (comme mes racines PHP/Laravel), plonger dans Swift, SwiftUI, Xcode et les contraintes spécifiques du développement watchOS représente une courbe d’apprentissage réelle. Les frameworks d’Apple portent une philosophie particulière. Gérer les cycles de vie d’app, les tâches en arrière-plan, les requêtes HealthKit et la communication entre appareils (WatchConnectivity) a ses propres motifs et ses propres « façons Apple » de faire les choses. Pourtant, la richesse de la documentation, la force de la communauté et la puissance de Swift rendent le voyage gratifiant.

## Conclusion : le potentiel d’un observateur silencieux

« Still Mirror » reste une exploration, une entreprise exigeante pour repousser les limites de ce que la captation passive sur un objet connecté grand public peut accomplir. La transformée en ondelettes stationnaire offre une piste prometteuse pour disséquer des signaux physiologiques complexes et révéler les signatures subtiles que nous cherchons.

Le parcours ne consiste pas seulement à coder en Swift et à se battre avec Xcode, mais aussi à descendre dans la théorie du traitement du signal, à comprendre la physiologie humaine et à considérer soigneusement les implications éthiques d’une telle technologie. Que « Still Mirror » devienne une app largement utilisée ou reste une exploration technique complexe, le processus lui-même témoigne de l’intersection fascinante entre IA, santé et technologie personnelle. Il s’agit d’essayer de construire cette surface calme et réfléchissante — un miroir immobile — pour une meilleure conscience de soi.

Que pensez-vous de l’usage d’un traitement avancé du signal comme la SWT pour détecter passivement des habitudes ? J’aimerais beaucoup lire vos réflexions dans les commentaires ci-dessous !
