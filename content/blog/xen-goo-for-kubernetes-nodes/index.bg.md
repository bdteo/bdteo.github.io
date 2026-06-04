---
lang: "bg"
translationOf: "xen-goo-for-kubernetes-nodes"
translationUpdatedAt: "2026-06-04"
translationSourceHash: "3e73efc9d038ec41"
title: "Xen слуз за Kubernetes нодове"
date: "2026-06-04"
description: "Много малка Kubernetes метафора за разработчици, които чуват „tainted nodes“ и веднага си представят предупреждения за замърсяване от Half-Life."
featuredImage: "./images/featured.jpg"
imageCaption: "Маркиран жетон стои в отделение на зелено осветена табла сред немаркирани дискове."
tags:
  - kubernetes
  - devops
  - софтуер
  - метафора
audioUrl: "/audio/articles/xen-goo-for-kubernetes-nodes/bg/5egO01tkUjEzu7xSSE8M-b95a010d9314.m4a"
audioDuration: "2:35"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-04"
audioTextSource: "content/tts/xen-goo-for-kubernetes-nodes.bg.md"
---

В Kubernetes tainted node звучи като нещо от Half-Life.

Почти можеш да чуеш съобщението на Black Mesa:

> Внимание. Засечено е Xen замърсяване.

Но идеята е по-малко мистична от името. Един **taint** е маркировка върху нод, която казва: не всеки pod има право да бъде тук.

Представи си клъстерен нод, покрит с радиоактивна извънземна слуз. Нормалните pod-ове не трябва да бъдат поставяни там. Нямат правилната защита. Но специален pod може да носи еквивалента на HEV костюм: **toleration**.

Taint-ът казва:

> Това място е опасно, специално или запазено.

Toleration-ът казва:

> Знам. Мога да се справя.

Това е връзката. Taint-ът не дърпа pod-а навътре. Не е магнит. По-скоро е предупредителен етикет, отблъскващо поле или маркер за Xen замърсяване. Kubernetes поглежда pod-а и пита: този workload толерира ли това условие?

Ако да, може да бъде разположен там.

Ако не, стои далеч.

Тази разлика има значение. Ако искаш „сложи този pod върху нодове като тези“, обикновено мислиш за labels, selectors или affinity. Taints и tolerations първо са за изключване. Те пазят нодовете от обикновени workloads, освен ако тези workloads не заявят изрично, че могат да влязат.

Затова когато някой каже „the nodes are tainted“, аз чувам:

> Black Mesa е маркирала тези машини като опасни, специални или запазени. Само pod-ове с правилния модул за устойчивост могат да влизат.

Което някак е едновременно много Kubernetes и много Half-Life.
