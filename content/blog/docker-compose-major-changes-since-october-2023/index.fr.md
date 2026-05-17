---
lang: "fr"
translationOf: "docker-compose-major-changes-since-october-2023"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "1e96a25eca95e021"
title: "Évolution de Docker Compose : ce qui a changé et pourquoi c’est important"
date: "2024-11-20T00:00:00.000Z"
description: "Docker Compose a changé en profondeur : v1 est mort, le champ version a disparu, le mode watch est prêt pour la production, et il existe une CVE critique à connaître. Mis à jour en mars 2026."
featuredImage: "./images/featured.jpg"
tags: ["Docker", "Docker Compose", "DevOps", "Conteneurs", "Environnement de développement"]
imageCaption: "Une rangée de petites caisses d’expédition en bois sur un quai de port aux premières lueurs du jour."
---

> **TL;DR :** Docker Compose v1 (`docker-compose`) a été entièrement supprimé en avril 2025. Le champ `version` dans votre YAML est mort. La clé `x-develop` est maintenant simplement `develop`. Le mode watch est prêt pour la production avec `initial_sync`. Il existe une CVE critique de traversée de chemins (CVE-2025-62725) si vous utilisez `include` avec des artefacts OCI : mettez à jour vers v2.40.2 ou plus récent. Et oui, Compose est passé de v2 à v5. Les détails ci-dessous.

> *Publié initialement en novembre 2024. Mis à jour en mars 2026 avec Compose v5, CVE-2025-62725, la suppression de v1, et les nouvelles fonctionnalités de la spécification.*

Si vous utilisez Docker Compose depuis un moment, vous avez probablement remarqué que des choses cassaient ou changeaient sous vos pieds. Les deux dernières années ont été l’évolution la plus agressive que Compose ait jamais connue -- et tout n’était pas évident.

J’utilise Compose tous les jours. La plupart de mes [environnements de développement](/laravel-sail-vs-laradock-choosing-right-docker-solution/) tournent dessus. Quand les choses changent, je le remarque. Voici ce qui compte vraiment.

## Ce qui a cassé

### docker-compose est mort

Pas déprécié. Pas en mode maintenance. **Mort.** Le binaire autonome `docker-compose` (la v1 basée sur Python) a été supprimé des runners GitHub Actions et des images Docker officielles en avril 2025 <small><a href="#ref1">[1]</a></small>. Si vos pipelines CI/CD référencent encore `docker-compose` avec un trait d’union, ils sont cassés ou sur le point de l’être.

```bash
# This no longer works
docker-compose up -d

# This is the only way now
docker compose up -d
```

Le `docker compose` basé sur Go (v2, maintenant v5) est la vraie implémentation depuis 2022. La CLI v1 était sous assistance respiratoire pour compatibilité. Cette assistance est terminée.

### Le champ version a disparu

Arrêtez de mettre `version: "3.8"` en haut de vos fichiers Compose. Cela ne fait rien. Il est ignoré depuis v2 et il est maintenant officiellement déprécié. Les fichiers Compose modernes commencent par `services:`.

```yaml
# Stop doing this
version: "3.8"
services:
  web:
    image: nginx

# Just do this
services:
  web:
    image: nginx
```

Si vous voyez `version:` dans un tutoriel, ce tutoriel est obsolète.

### Autres dépréciations

- **`links`** -- utilisez les réseaux Docker. Les links sont legacy depuis le lancement de Compose v2.
- **`container_name`** -- laissez Docker gérer les noms. Les noms codés en dur cassent le scaling et provoquent des conflits.
- **Syntaxe courte des volumes pour les montages complexes** -- utilisez la syntaxe longue avec `type`, `source`, `target`.

## Ce qui est nouveau et réellement utile

### Mode watch (maintenant prêt pour la production)

C’est la plus grosse amélioration de confort depuis des années. La section `develop` (anciennement `x-develop` -- retirez le préfixe `x-`, ce n’est plus expérimental) permet de définir des règles de surveillance de fichiers qui synchronisent ou reconstruisent automatiquement quand les fichiers changent :

```yaml
services:
  web:
    build: .
    develop:
      watch:
        - path: ./src
          action: sync
          target: /app/src
        - path: ./package.json
          action: rebuild
```

Trois actions disponibles (depuis v2.32.0) :
- **`sync`** -- copie les fichiers modifiés dans le conteneur sans reconstruire
- **`restart`** -- redémarre le service quand les fichiers changent
- **`rebuild`** -- déclenche une reconstruction complète

Depuis septembre 2025, il existe aussi **`initial_sync`** : cela synchronise tous les fichiers immédiatement au démarrage de `docker compose watch`, pour que vous n’ayez pas à attendre le premier changement avant de déclencher la synchronisation. Cela a été un point de friction pendant longtemps.

```bash
docker compose watch
```

Plus besoin de reconstructions manuelles pendant le développement. Cela a vraiment changé mon workflow.

### Include avec des artefacts OCI

La directive `include` peut maintenant récupérer des fragments Compose depuis des registres OCI :

```yaml
include:
  - oci://docker.io/username/my-compose-fragment:latest
```

Il existe aussi une prise en charge expérimentale des dépôts Git. C’est utile pour partager des définitions de services communes entre projets -- configurations de bases de données, stacks de monitoring, etc.

**Mais lisez d’abord la section sécurité ci-dessous.** Il y a une CVE.

### Prise en charge des GPU

Le passthrough GPU est devenu plus propre. Il existe maintenant une syntaxe plus courte `gpus:` (v2.30.0+) en plus de l’approche verbeuse `deploy.resources.reservations.devices`. La prise en charge des GPU AMD a été officiellement intégrée en 2025 -- ce n’est plus seulement NVIDIA.

### Élément models

La spécification Compose inclut maintenant un élément `models` pour définir des modèles IA/ML comme artefacts OCI. Vous pouvez empaqueter des LLMs et des runtimes d’inférence directement dans votre configuration Compose. C’est de niche, mais intéressant si vous faites du travail IA en local.

### Dépendances améliorées

Les conditions de `depends_on` sont devenues plus flexibles :

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy
        restart: true      # restart web if db restarts
        required: false     # web can start even if db isn't ready
```

Les options `restart: true` et `required: false` sont vraiment utiles pour des environnements de développement locaux plus résilients.

## Ce que vous devez savoir

### CVE-2025-62725 : traversée de chemins avec include

Si vous utilisez la directive `include` avec des artefacts OCI, **mettez à jour vers v2.40.2 ou plus récent immédiatement** <small><a href="#ref2">[2]</a></small>. Une vulnérabilité de traversée de chemins permet à un attaquant de sortir du répertoire de cache pendant la résolution de l’artefact. Même un `docker compose ps` apparemment inoffensif peut la déclencher si votre fichier Compose inclut une référence OCI malveillante.

Docker a corrigé cela avec une vérification `validatePathInBase()`, mais vous devez être sur la version corrigée.

### Compose v5

Docker est passé de v2 à v5 (en sautant 3 et 4 pour éviter la confusion avec les anciennes versions du format de fichier) <small><a href="#ref3">[3]</a></small>. Fonctionnellement, v5 est identique aux dernières versions v2, mais elle inclut un **SDK Go** officiel pour l’accès programmatique -- ce qui signifie que vous pouvez intégrer des fonctionnalités Compose directement dans des applications Go sans appeler la CLI via le shell.

Vérifiez votre version :

```bash
docker compose version
# Docker Compose version v5.1.0
```

### Bake est l’outil de build par défaut

Docker Bake (via BuildKit) est maintenant l’outil par défaut pour `docker compose build`. Il gère mieux que le builder legacy les builds multi-cibles, la compilation multi-plateforme, et les stratégies avancées de cache. Si vous n’avez pas encore regardé les fichiers `docker-bake.hcl`, cela vaut la peine de comprendre le sujet -- surtout pour les builds multi-services complexes.

### Améliorations des healthchecks

Le champ `start_interval` permet de définir un intervalle de vérification plus rapide pendant la période de grâce au démarrage :

```yaml
services:
  db:
    healthcheck:
      test: ["CMD", "pg_isready"]
      start_period: 30s
      start_interval: 2s    # check every 2s during startup
      interval: 30s         # then every 30s after
      retries: 3
```

Cela signifie que vos services dépendants démarrent plus vite sans compromettre les intervalles de healthcheck en production.

## Checklist de migration

Si vous n’avez pas mis à jour votre setup Compose depuis un moment :

1. **Supprimez `version:`** de tous les fichiers Compose.
2. **Remplacez `docker-compose`** par `docker compose` dans tous les scripts et configurations CI.
3. **Renommez `x-develop`** en `develop` dans les configurations watch.
4. **Mettez à jour vers v2.40.2+** si vous utilisez `include` (CVE-2025-62725).
5. **Remplacez `links`** par des réseaux Docker si vous les utilisez encore, d’une manière ou d’une autre.
6. **Testez votre CI** -- GitHub Actions a mis à jour ses runners vers Compose v2.40.3 en février 2026 <small><a href="#ref4">[4]</a></small>.

---

### Références

<a id="ref1"></a>1. [Docker Compose v1 removed from runner images (April 2025)](https://github.com/actions/runner-images/issues/9557) -- *Annonce GitHub Actions de la suppression de v1.*<br>
<a id="ref2"></a>2. [CVE-2025-62725: From "docker compose ps" to System Compromise](https://www.imperva.com/blog/cve-2025-62725-from-docker-compose-ps-to-system-compromise/) -- *Analyse détaillée d’Imperva sur la vulnérabilité de traversée de chemins avec include.*<br>
<a id="ref3"></a>3. [Docker Compose Releases](https://github.com/docker/compose/releases) -- *Historique officiel des releases, y compris v5.*<br>
<a id="ref4"></a>4. [Docker and Docker Compose version upgrades on hosted runners](https://github.blog/changelog/2026-01-30-docker-and-docker-compose-version-upgrades-on-hosted-runners/) -- *Mise à jour des runners GitHub en février 2026.*<br>
<a id="ref5"></a>5. [Compose Specification](https://docs.docker.com/compose/compose-file/) -- *Référence officielle des fichiers Compose.*<br>
<a id="ref6"></a>6. [Use Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) -- *Documentation Docker du mode watch.*<br>
<a id="ref7"></a>7. [Enable GPU Support in Docker Compose](https://docs.docker.com/compose/how-tos/gpu-support/) -- *Documentation du passthrough GPU, y compris la prise en charge AMD.*<br>
<a id="ref8"></a>8. [Docker Compose Include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) -- *Directive include avec prise en charge OCI et Git.*

---

### Articles liés

- [Laravel Sail vs Laradock: Choosing the Right Docker Solution](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- comparaison d’environnements de développement PHP basés sur Docker.
