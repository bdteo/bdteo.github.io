[conversational tone] Docker Compose a changé en profondeur: v1 est mort, le champ version a disparu, le mode watch est prêt pour la production, et il existe une CVE critique à connaître. Mis à jour en mars 2026.

TL;DR: Docker Compose v1 (docker-compose) a été entièrement supprimé en avril 2025. Le champ version dans votre YAML est mort. La clé x-develop est maintenant simplement develop. Le mode watch est prêt pour la production avec initial_sync. Il existe une CVE critique de traversée de chemins (CVE-2025-62725) si vous utilisez include avec des artefacts OCI: mettez à jour vers v2.40.2 ou plus récent. Et oui, Compose est passé de v2 à v5. Les détails ci-dessous.

Publié initialement en novembre 2024. Mis à jour en mars 2026 avec Compose v5, CVE-2025-62725, la suppression de v1, et les nouvelles fonctionnalités de la spécification.

[reflective] Si vous utilisez Docker Compose depuis un moment, vous avez probablement remarqué que des choses cassaient ou changeaient sous vos pieds. Les deux dernières années ont été l’évolution la plus agressive que Compose ait jamais connue -- et tout n’était pas évident.

J’utilise Compose tous les jours. La plupart de mes environnements de développement tournent dessus. Quand les choses changent, je le remarque. Voici ce qui compte vraiment.

[matter-of-fact] Ce qui a cassé

[deliberate] docker-compose est mort

Pas déprécié. Pas en mode maintenance. Mort. Le binaire autonome docker-compose (la v1 basée sur Python) a été supprimé des runners GitHub Actions et des images Docker officielles en avril 2025. Si vos pipelines CI/CD référencent encore docker-compose avec un trait d’union, ils sont cassés ou sur le point de l’être.

Le docker compose basé sur Go (v2, maintenant v5) est la vraie implémentation depuis 2022. La CLI v1 était sous assistance respiratoire pour compatibilité. Cette assistance est terminée.

[calm] Le champ version a disparu

[calm] Arrêtez de mettre version: "3.8" en haut de vos fichiers Compose. Cela ne fait rien. Il est ignoré depuis v2 et il est maintenant officiellement déprécié. Les fichiers Compose modernes commencent par services:.

Si vous voyez version: dans un tutoriel, ce tutoriel est obsolète.

[reflective] Autres dépréciations

links -- utilisez les réseaux Docker. Les links sont legacy depuis le lancement de Compose v2. container_name -- laissez Docker gérer les noms. Les noms codés en dur cassent le scaling et provoquent des conflits. Syntaxe courte des volumes pour les montages complexes -- utilisez la syntaxe longue avec type, source, target.

[matter-of-fact] Ce qui est nouveau et réellement utile

[deliberate] Mode watch (maintenant prêt pour la production)

C’est la plus grosse amélioration de confort depuis des années. La section develop (anciennement x-develop -- retirez le préfixe x-, ce n’est plus expérimental) permet de définir des règles de surveillance de fichiers qui synchronisent ou reconstruisent automatiquement quand les fichiers changent:

[deliberate] Trois actions disponibles (depuis v2.32.0): sync -- copie les fichiers modifiés dans le conteneur sans reconstruire restart -- redémarre le service quand les fichiers changent rebuild -- déclenche une reconstruction complète

Depuis septembre 2025, il existe aussi initial_sync: cela synchronise tous les fichiers immédiatement au démarrage de docker compose watch, pour que vous n’ayez pas à attendre le premier changement avant de déclencher la synchronisation. Cela a été un point de friction pendant longtemps.

Plus besoin de reconstructions manuelles pendant le développement. Cela a vraiment changé mon workflow.

[calm] Include avec des artefacts OCI

La directive include peut maintenant récupérer des fragments Compose depuis des registres OCI:

Il existe aussi une prise en charge expérimentale des dépôts Git. C’est utile pour partager des définitions de services communes entre projets -- configurations de bases de données, stacks de monitoring, etc.

Mais lisez d’abord la section sécurité ci-dessous. Il y a une CVE.

[reflective] Prise en charge des GPU

Le passthrough GPU est devenu plus propre. Il existe maintenant une syntaxe plus courte gpus: (v2.30.0+) en plus de l’approche verbeuse deploy.resources.reservations.devices. La prise en charge des GPU AMD a été officiellement intégrée en 2025 -- ce n’est plus seulement NVIDIA.

[matter-of-fact] Élément models

La spécification Compose inclut maintenant un élément models pour définir des modèles IA/ML comme artefacts OCI. Vous pouvez empaqueter des LLMs et des runtimes d’inférence directement dans votre configuration Compose. C’est de niche, mais intéressant si vous faites du travail IA en local.

[deliberate] Dépendances améliorées

Les conditions de depends_on sont devenues plus flexibles:

Les options restart: true et required: false sont vraiment utiles pour des environnements de développement locaux plus résilients.

[calm] Ce que vous devez savoir

[reflective] CVE-2025-62725: traversée de chemins avec include

Si vous utilisez la directive include avec des artefacts OCI, mettez à jour vers v2.40.2 ou plus récent immédiatement. Une vulnérabilité de traversée de chemins permet à un attaquant de sortir du répertoire de cache pendant la résolution de l’artefact. Même un docker compose ps apparemment inoffensif peut la déclencher si votre fichier Compose inclut une référence OCI malveillante.

Docker a corrigé cela avec une vérification validatePathInBase(), mais vous devez être sur la version corrigée.

[matter-of-fact] Compose v5

Docker est passé de v2 à v5 (en sautant 3 et 4 pour éviter la confusion avec les anciennes versions du format de fichier). Fonctionnellement, v5 est identique aux dernières versions v2, mais elle inclut un SDK Go officiel pour l’accès programmatique -- ce qui signifie que vous pouvez intégrer des fonctionnalités Compose directement dans des applications Go sans appeler la CLI via le shell.

Vérifiez votre version:

[deliberate] Bake est l’outil de build par défaut

Docker Bake (via BuildKit) est maintenant l’outil par défaut pour docker compose build. Il gère mieux que le builder legacy les builds multi-cibles, la compilation multi-plateforme, et les stratégies avancées de cache. Si vous n’avez pas encore regardé les fichiers docker-bake.hcl, cela vaut la peine de comprendre le sujet -- surtout pour les builds multi-services complexes.

[calm] Améliorations des healthchecks

Le champ start_interval permet de définir un intervalle de vérification plus rapide pendant la période de grâce au démarrage:

Cela signifie que vos services dépendants démarrent plus vite sans compromettre les intervalles de healthcheck en production.

[reflective] Checklist de migration

Si vous n’avez pas mis à jour votre setup Compose depuis un moment:

[deliberate] Supprimez version: de tous les fichiers Compose. Remplacez docker-compose par docker compose dans tous les scripts et configurations CI. Renommez x-develop en develop dans les configurations watch. Mettez à jour vers v2.40.2+ si vous utilisez include (CVE-2025-62725). Remplacez links par des réseaux Docker si vous les utilisez encore, d’une manière ou d’une autre. Testez votre CI -- GitHub Actions a mis à jour ses runners vers Compose v2.40.3 en février 2026.
