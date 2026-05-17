---
lang: "fr"
translationOf: "what-is-good-code-coverage-real-world-guide"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "0490cb5e588445c4"
title: "Qu’est-ce qu’une « bonne » couverture de code ? Un guide de terrain"
date: "2025-07-15"
description: "Déconstruire le mythe des 100 % : j’explique les objectifs de couverture éprouvés pour TypeScript et PHP, le ROI des tests, et les astuces d’outillage que j’utilise au quotidien."
tags: ["code-coverage", "testing", "typescript", "php", "best-practices", "quality-assurance"]
featuredImage: "./images/featured.jpg"
imageCaption: "80 % de couverture ≠ 80 % de qualité — voilà pourquoi"
---

# Qu’est-ce qu’une « bonne » couverture de code ? Mon guide de terrain pour arrêter les bugs sans gaspiller le temps d’ingénierie

Chaque fois que je lance `npm run coverage` ou `phpunit --coverage`, la même question revient :

> _« Bon… 74 %. Est-ce que c’est assez ? »_

La blogosphère du développement logiciel hurle « 100 % ou rien ! ». Pendant ce temps, <a href="https://launchdarkly.com/blog/code-coverage-what-it-is-and-why-it-matters/" target="_blank">launchdarkly.com</a> me rappelle poliment que 100 % exécuté ≠ 100 % testé.  
J’ai passé des semaines à courir après la métrique brillante, et encore plus de semaines à déboguer _d’autres_ problèmes. Voici le juste milieu éprouvé sur le terrain auquel je suis arrivé.

---

## Pourquoi 100 % de couverture est un mirage

En théorie, 100 % d’exécution des lignes signifie « aucun bug caché ». En pratique :

* Rendements décroissants : passer de 90 % à 95 % double souvent votre suite de tests pour une réduction du risque à un chiffre.  
* Fausse confiance : un test qui appelle une fonction sans aucune assertion **compte quand même** comme couvert.  
* Réalité business : chaque test en plus, c’est du temps **non** consacré aux fonctionnalités demandées par vos clients.

Les gens de l’aérospatiale peuvent viser 100 % — c’est une question de vie ou de mort. Pour le reste d’entre nous, **~80 % est la ligne du 80/20**. C’est là que la plupart des projets se regroupent après calcul du ROI. <a href="https://www.testdevlab.com/blog/why-is-high-test-coverage-important" target="_blank">testdevlab.com</a> parle d’une plage de 70 à 90 % pour exactement cette raison.

---

## Le tableau pratique que j’utilise

| Couverture | Ma traduction | Action |
|---------|------------------|--------|
| 100 % | « Nous sommes une bibliothèque qui fait voler des fusées » | Accepter le labeur. |
| 90 % + | « Une bibliothèque dont dépend beaucoup d’argent » | Module hautement prioritaire seulement. |
| 80 % | Livrer, surveiller, puis itérer. |
| 60–70 % | Barrière de merge — faire échouer la PR si le nouveau code vous fait passer en dessous. |
| < 50 % | Week-end de dette technique — pivoter d’abord vers les chemins critiques. |

J’ai volé ces chiffres au <a href="https://www.atlassian.com/continuous-delivery/software-testing/code-coverage" target="_blank">guide interne d’Atlassian</a> : 60 % « acceptable », 75 % « louable », 90 % « exemplaire ». Ça marche dans toutes les rétros.

---

## Comment j’atteins 80 % sans pleurer (playbook TypeScript)

1. Jest + Istanbul dès le départ  
2. **Barrière de couverture en CI**  
   dans `jest.config.js`, j’ajoute :  
   ```js
   coverageThreshold: {
     global: 80,
     '**/src/core/**': 90
   }
   ```  
3. Viser les chemins chauds côté utilisateur, pas le logger boilerplate Redux.

---

## Comment j’atteins 80 % dans Laravel (playbook PHP)

1. Installer PCOV pour la vitesse en dev, Xdebug pour les données de branches en CI.  
2. PHPUnit + ces valeurs par défaut dans `phpunit.xml` :  
   ```xml
   <filter>
     <whitelist processUncoveredFiles="true">
       <directory suffix=".php">./src</directory>
     </whitelist>
   </filter>
   ```  
3. Score de mutation > nombre de lignes avec <a href="https://infection.github.io/" target="_blank">Infection</a> — c’est comme ça que je repère les lignes « couvertes mais pas vraiment testées ».

---

## 4 règles avec lesquelles mon équipe vit

1. **Nouveau code = tests.** Couverture du diff ≥ 90 % avant merge.  
2. **Refactoriser d’abord, tester ensuite.** Le code intestable est déjà une dette.  
3. **Faire échouer le build, pas les humains.** Baisser la barrière de 5 % chaque année plutôt que de casser les équipes avec des tableaux de bord rouges.  
4. **Mesurer les bugs en production** — si la couverture est à 85 % mais que les incidents montent, **la couverture** n’est pas la coupable ; **les assertions** le sont.

---

## TL;DR (pour les dirigeants et les recruteurs aussi)

Ne me demandez pas un « chiffre magique ». Demandez :  
> Quelles parties du produit ne peuvent pas casser ?

Couvrez **celles-là** à 90 %. Donnez au reste des tests smoke sains. Utilisez la couverture de code comme un **projecteur**, pas comme une ligne d’arrivée, et faites confiance aux bugs que vous **attrapez**, pas aux chiffres dont vous vous **vantez**.

Que le tableau de bord de couverture soit vert — vos clients ne le verront jamais, mais leur barre d’erreur restera vide.  

*— Fin du coup de gueule, retour à l’éditeur.*
