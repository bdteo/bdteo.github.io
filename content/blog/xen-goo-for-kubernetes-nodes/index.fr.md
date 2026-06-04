---
lang: "fr"
translationOf: "xen-goo-for-kubernetes-nodes"
translationUpdatedAt: "2026-06-04"
translationSourceHash: "3e73efc9d038ec41"
title: "De la glu Xen pour les nœuds Kubernetes"
date: "2026-06-04"
description: "Une toute petite métaphore Kubernetes pour les développeurs qui entendent « tainted nodes » et imaginent aussitôt des alertes de contamination à la Half-Life."
featuredImage: "./images/featured.jpg"
imageCaption: "Un jeton marqué repose dans le compartiment d'un plateau éclairé en vert, parmi des disques non marqués."
tags:
  - kubernetes
  - devops
  - software
  - metaphor
---

Dans Kubernetes, un nœud avec une taint sonne comme quelque chose sorti de Half-Life.

On entend presque l'annonce de Black Mesa :

> Attention. Contamination Xen détectée.

Mais l'idée est moins mystique que son nom. Une **taint** est une marque posée sur un nœud qui dit : tous les pods n'ont pas le droit d'être ici.

Imaginez un nœud de cluster couvert de glu extraterrestre radioactive. Les pods normaux ne devraient pas y être placés. Ils n'ont pas la protection nécessaire. Mais un pod spécial peut porter l'équivalent d'une combinaison HEV : une **toleration**.

La taint dit :

> Cet endroit est dangereux, spécial, ou réservé.

La toleration dit :

> Je sais. Je peux le gérer.

C'est la relation. La taint n'attire pas le pod vers elle. Ce n'est pas un aimant. C'est plutôt une étiquette d'avertissement, un champ répulsif, ou un marqueur de contamination Xen. Kubernetes regarde le pod et demande : est-ce que cette charge de travail tolère cette condition ?

Si oui, elle peut être planifiée là.

Si non, elle reste à distance.

Cette distinction compte. Si vous voulez dire « place ce pod sur des nœuds comme ceux-ci », vous pensez en général aux labels, aux selectors, ou à l'affinity. Les taints et tolerations parlent d'abord d'exclusion. Elles protègent les nœuds des charges de travail ordinaires, sauf si ces charges de travail choisissent explicitement d'entrer.

Donc quand quelqu'un dit « les nœuds sont tainted », j'entends :

> Black Mesa a marqué ces machines comme dangereuses, spéciales, ou réservées. Seuls les pods avec le bon module de résistance peuvent entrer.

Ce qui est, d'une certaine manière, très Kubernetes et très Half-Life.
