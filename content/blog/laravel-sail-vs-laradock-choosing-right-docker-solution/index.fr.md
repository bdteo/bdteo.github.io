---
lang: "fr"
translationOf: "laravel-sail-vs-laradock-choosing-right-docker-solution"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "a3219664c049cc89"
title: "Laravel Sail vs Laradock : comparaison pour développeurs PHP avec Docker"
date: "2024-08-08T12:00:00.000Z"
description: "Comparaison honnête de Laravel Sail, Laradock, Herd et FrankenPHP pour le développement PHP en 2026. Quelle configuration Docker choisir -- et quand éviter Docker entièrement."
tags: ["Laravel", "Docker", "PHP", "Laravel Sail", "Laradock", "Laravel Herd", "FrankenPHP", "Development Environment", "Docker Compose"]
featuredImage: "./images/featured.jpg"
imageCaption: "Deux souris d'ordinateur sans fil modernes côte à côte sur du marbre blanc. Il faut en choisir une."
---

> **TL;DR :** Pour la plupart des développeurs Laravel en 2026 : utilisez **Laravel Herd** si vous voulez zéro friction (natif, sans Docker, installé en quelques secondes). Utilisez **Sail** si votre équipe a besoin d'environnements identiques ou si vous dépendez de services comme Redis/Meilisearch. Utilisez **Laradock** si vous travaillez avec plusieurs frameworks PHP. Utilisez une configuration **Docker Compose personnalisée** si vous avez dépassé les abstractions. Et si la performance est absolument centrale, regardez **FrankenPHP + Octane**.

> *Publié initialement en août 2024. Mis à jour en mars 2026 avec Laravel 12/Herd/FrankenPHP et l'état actuel de l'écosystème.*

La question était autrefois : « Sail ou Laradock ? » Ce cadrage est trop étroit maintenant. La vraie question est : **comment devrais-je configurer mon environnement de développement Laravel en 2026 ?** Il y a plus d'options que jamais, et le meilleur choix dépend de ce dont vous avez réellement besoin.

J'ai utilisé la plupart de ces outils. Aujourd'hui, j'utilise une configuration Docker Compose personnalisée parce que je veux garder un contrôle complet sur mes conteneurs, sans abstractions qui cachent ce qui se passe. Mais c'est ma préférence, pas une recommandation universelle. Voyons ce que chaque option vous apporte.

## Les concurrents

### Laravel Herd

[Herd](https://herd.laravel.com/) est l'option la plus récente et, pour beaucoup de développeurs, la bonne. C'est une application native (macOS et Windows -- pas encore Linux) qui vous donne PHP, Nginx, Node.js et Dnsmasq sans Docker. La version Pro ajoute MySQL, PostgreSQL, Redis et des outils de débogage.

La fonctionnalité décisive : changer de version PHP en quelques secondes (de 7.4 à 8.4), router automatiquement les domaines `*.test`, et n'avoir aucun surcoût Docker. Si vous construisez une application Laravel standard et que vous n'avez pas besoin de services exotiques, Herd vous fait écrire du code en moins d'une minute.

### Laravel Sail

[Sail](https://laravel.com/docs/12.x/sail) est l'environnement de développement officiel de Laravel basé sur Docker. Il enveloppe Docker Compose avec une CLI `sail` qui abstrait les commandes courantes (`sail up`, `sail artisan`, `sail php`).

Depuis Laravel 12, Sail arrive avec PHP 8.5 par défaut, utilise `compose.yaml` (le nom de fichier moderne, pas `docker-compose.yml`) et inclut Swoole pour Octane prêt à l'emploi. Il prend aussi en charge la génération de devcontainer via `--devcontainer` pour l'intégration VS Code/GitHub Codespaces.

Services par défaut : PHP, MySQL, Redis, Meilisearch, Mailpit et Selenium.

### Laradock

[Laradock](https://laradock.io/) est le couteau suisse. C'est un environnement Docker open source qui prend en charge n'importe quel projet PHP -- pas seulement Laravel. Il propose plus de 70 services préconfigurés et peut être configuré pour la production.

Il est toujours activement maintenu en décembre 2025 (mises à jour récentes des images PHP-FPM et workspace). Le compromis, c'est la complexité : l'installation prend plus de temps, la configuration implique de modifier plusieurs fichiers, et il faut une vraie connaissance de Docker.

### FrankenPHP + Octane

[FrankenPHP](https://frankenphp.dev/) est un serveur d'applications PHP moderne construit sur Caddy. Combiné à Laravel Octane, il atteint un temps de démarrage du framework de 4 à 6 ms par requête -- un développeur a rapporté une latence passée de 7 secondes à 66 ms en basculant vers le Worker Mode <small><a href="#ref1">[1]</a></small>.

Laravel Cloud utilise FrankenPHP dans son runtime Octane en production <small><a href="#ref2">[2]</a></small>. La dernière version (v1.11.2, février 2026) a apporté un CGO 30 % plus rapide et un ramasse-miettes 40 % plus rapide grâce à Go 1.26.

Ce n'est pas un environnement de développement au sens traditionnel -- c'est un runtime PHP de niveau production que vous pouvez aussi utiliser en développement. Sail inclut une intégration pour exécuter Octane avec FrankenPHP ou Swoole.

## Quand utiliser quoi

Voici mon avis honnête, basé sur l'utilisation réelle de ces outils :

**Utilisez Herd si** vous êtes seul ou dans une petite équipe, que vous construisez des applications Laravel standard, et que vous voulez passer zéro temps sur l'infrastructure. C'est le chemin le plus rapide entre « j'ai une idée » et « j'écris du code ». La limite, c'est qu'il n'existe que pour macOS/Windows et que la version gratuite n'inclut pas les bases de données.

**Utilisez Sail si** votre équipe a besoin de parité d'environnement, que vous dépendez de versions précises de services (Redis 7, MySQL 8, PostgreSQL 15), ou que vous travaillez dans une chaîne CI/CD qui a besoin de Docker. La commande `sail:publish` de Sail vous permet de personnaliser la configuration Docker quand vous dépassez les valeurs par défaut.

**Utilisez Laradock si** vous travaillez avec plusieurs frameworks PHP (Symfony, Shopware, PHP vanilla), que vous avez besoin de services exotiques (Aerospike, RethinkDB, Manticore), ou que vous voulez un seul environnement Docker pour plusieurs projets. La courbe d'apprentissage est plus raide, mais la flexibilité est inégalée.

**Utilisez une configuration Docker Compose personnalisée si** vous avez dépassé Sail et Laradock et que vous voulez un contrôle complet. C'est ce que je fais. Je maintiens mon propre `compose.yaml` avec exactement les services dont j'ai besoin, sans couche d'abstraction, et avec des alias Docker Compose pour garder les commandes courtes. Cela demande plus de travail au départ, mais il n'y a pas de magie -- tout est explicite.

**Utilisez FrankenPHP + Octane si** vous construisez une API à haute performance ou si votre application est sensible à la latence. L'écart de performance n'est pas marginal -- c'est un ordre de grandeur. Cela vaut la peine de l'explorer, même si vous utilisez un autre outil pour le développement général.

## Les détails qui comptent

### Temps d'installation

| Outil | Temps avant la première requête |
|------|----------------------|
| Herd | Moins d'une minute |
| Sail | 5-10 minutes (téléchargement des images) |
| Compose personnalisé | 30-60 minutes (configuration initiale) |
| Laradock | 1-2 heures (configuration complète) |

### Personnalisation

Sail est volontairement limité. Vous obtenez les services dont Laravel a besoin, et pas beaucoup plus. Vous *pouvez* personnaliser en lançant `sail:publish` et en modifiant les Dockerfiles, mais à ce stade vous maintenez une configuration Docker personnalisée avec les abstractions de Sail par-dessus -- le pire des deux mondes.

Laradock vous donne tout, mais exige que vous compreniez ce que vous activez. Activer un service signifie modifier `.env` et peut-être `docker-compose.yml`, et certains services ont leurs propres répertoires de configuration.

Compose personnalisé vous donne exactement ce que vous écrivez. Rien de plus, rien de moins.

### Prêt pour la production

Sail n'est explicitement pas destiné à la production. Laradock peut être configuré pour la production, mais vous devez savoir ce que vous faites en matière de durcissement de sécurité, de limites de ressources et de réseau correct. FrankenPHP est prêt pour la production par conception -- il est construit pour ça.

### Support multi-projets

Sail : un projet par environnement. Vous pouvez lancer plusieurs instances Sail, mais elles vont se battre pour les ports.

Laradock : conçu pour les configurations multi-projets. Un environnement, plusieurs projets, services partagés.

Compose personnalisé : ce que vous décidez d'architecturer. Je garde des fichiers compose séparés par projet, avec des définitions de réseau partagées.

## Ce que j'utilise vraiment

Docker Compose personnalisé. J'ai des alias pour tout -- `dcu` pour `docker compose up -d`, `dce` pour exec, `dcefpm` pour l'accès shell PHP-FPM, et une fonction `sail` qui découvre automatiquement la racine du projet. La configuration est dans mes [notes d'évolution Docker Compose](/fr/docker-compose-major-changes-since-october-2023/).

J'ai commencé avec Laradock il y a des années, je suis passé à Sail à son lancement, puis j'ai fini par me poser sur une configuration personnalisée parce que je voulais comprendre exactement ce qui tournait et pourquoi. Chaque abstraction cache des décisions. Parfois c'est très bien. Parfois ces décisions cachées causent des problèmes difficiles à déboguer parce qu'on ne peut pas les voir.

Cela dit, si je démarrais aujourd'hui un nouveau projet Laravel avec une équipe qui ne se soucie pas des entrailles de Docker, j'utiliserais Sail. Et si j'accompagnais quelqu'un qui débute avec Laravel, je lui dirais d'installer Herd et de commencer à écrire du code immédiatement.

## Autres options à mentionner

- **[DDEV](https://ddev.com/)** -- basé sur Docker, bon support Laravel, feuille de route 2026 active avec intégration Gitpod prévue. À évaluer si vous l'utilisez déjà pour d'autres projets CMS (WordPress, Drupal).
- **[Lando](https://lando.dev/)** -- une autre couche d'abstraction Docker avec un plugin Laravel (v1.10.0, janvier 2026). Philosophie similaire à Sail, mais agnostique côté framework.
- **Valet** -- le prédécesseur de Herd. Il fonctionne toujours, mais Herd l'a supplanté pour la plupart des usages.

---

### Références

<a id="ref1"></a>1. [Configurer et accélérer Laravel avec FrankenPHP Worker Mode](https://medium.com/@danarcahyaa/setup-and-boost-your-laravel-app-with-frankenphp-worker-mode-c0228f44f71b) -- *Comparaison de performance en conditions réelles : latence de 7 s à 66 ms.*<br>
<a id="ref2"></a>2. [Comment Laravel Cloud utilise FrankenPHP en production](https://devconf.net/talk/florian-beer-how-laravel-cloud-uses-frankenphp-in-production) -- *Conférence DevConf sur le runtime Octane de Laravel Cloud.*<br>
<a id="ref3"></a>3. [Documentation Laravel 12.x Sail](https://laravel.com/docs/12.x/sail) -- *Documentation officielle de Sail avec les changements PHP 8.5 et compose.yaml.*<br>
<a id="ref4"></a>4. [Laravel Herd](https://herd.laravel.com/) -- *Site officiel de l'environnement de développement Laravel natif.*<br>
<a id="ref5"></a>5. [Publication de FrankenPHP v1.11.2](https://laravel-news.com/frankenphp-v1112-released-with-30-faster-cgo-40-faster-gc-and-security-patches) -- *Version de février 2026 avec améliorations de performance et correctifs de sécurité.*<br>
<a id="ref6"></a>6. [Laradock sur GitHub](https://github.com/laradock/laradock) -- *Toujours maintenu, mises à jour de décembre 2025.*<br>
<a id="ref7"></a>7. [L'état actuel du développement Laravel local](https://aschmelyun.com/blog/the-current-state-of-local-laravel-development/) -- *Vue d'ensemble de l'écosystème par Andrew Schmelyun.*

---

### Articles liés

- [Évolution de Docker Compose : ce qui a changé et pourquoi c'est important](/fr/docker-compose-major-changes-since-october-2023/) -- les changements Docker Compose qui affectent tous ces outils.
- [PHP 8.5 : tour d'horizon des nouvelles fonctionnalités](/fr/php-8-5-new-features-pipe-operator-guide/) -- ce qui arrive dans la version de PHP que Laravel 12 utilise par défaut.
- [PHP 8.3.6 + IMAP sur macOS avec phpenv](/installing-php-8-3-6-with-imap-on-macos-using-phpenv/) -- quand vous avez besoin d'une configuration PHP spécifique en dehors de Docker.
