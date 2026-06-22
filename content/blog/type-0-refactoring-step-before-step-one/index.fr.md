---
lang: "fr"
translationOf: "type-0-refactoring-step-before-step-one"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "16a0b76cc24c4b04"
title: "Refactoring de type 0 : rendre le code compréhensible avant de changer le comportement"
date: "2025-12-13T12:00:00.000Z"
description: "Le refactoring de type 0 est l'étape qui préserve le comportement avant un vrai changement de code : rendre du code brouillon compréhensible, testable et reviewable sans théâtre du nettoyage."
tags: ["refactoring", "ingénierie logicielle", "debugging", "maintenabilité"]
featuredImage: "./images/featured.webp"
imageCaption: "Mise en place. Le travail avant le travail."
audioUrl: "/audio/articles/type-0-refactoring-step-before-step-one/fr/hqfrgApggtO1785R4Fsn-c0834a3561f8.m4a"
audioDuration: "18:00"
audioVoice: "Theodore (ElevenLabs French serene)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/type-0-refactoring-step-before-step-one.fr.md"
---

Il existe une forme de refactoring que les équipes font tout le temps, généralement sous pression, généralement sans lui donner de nom.

Vous ouvrez le fichier où vit le bug. La méthode est trop longue. Les noms sont fatigués. Les branches s'empilent comme de vieilles chaises dans une cave. Vous sentez physiquement que faire le changement demandé dans cette forme de code est une mauvaise idée.

Mais vous n'êtes pas prêt à le redessiner.

Vous n'essayez pas d'introduire une nouvelle abstraction.

Vous n'essayez pas de prouver que vous êtes la personne clean-code dans la pièce.

Vous essayez de rendre le comportement actuel assez compréhensible pour que le prochain changement puisse être fait en sécurité.

J'appelle cela le **refactoring de type 0**.

Ou, moins mémorablement mais plus précisément :

> Le refactoring de type 0 est le nettoyage qui préserve le comportement avant de changer le comportement, afin que le code devienne lisible, testable et reviewable.

C'est l'étape avant l'étape un.

Pas la vraie rénovation. Le dégagement de l'établi. L'étiquetage des câbles. Le geste qui rend la chose lisible avant d'y mettre les mains.

## Pourquoi le type 0 mérite un nom

[Martin Fowler définit le refactoring](https://refactoring.com/) comme une modification de la structure interne du code sans changement de son comportement externe. Cette précision compte. Si le comportement change, le travail peut toujours être utile, mais ce n'est pas du refactoring au sens strict.

Le type 0 est plus étroit que cela.

Un refactoring normal peut améliorer le design. Le type 0 peut ne pas le faire.

Un refactoring normal peut déplacer des responsabilités entre classes. Le type 0 ne devrait pas.

Un refactoring normal peut créer de meilleures frontières de domaine. Le type 0 s'arrête plus tôt : il fait dire au code existant ce qu'il fait déjà.

Cela paraît modeste jusqu'au moment où vous fixez une méthode de 900 lignes pendant un hotfix et que votre cerveau commence à mettre en mémoire tampon.

Le problème immédiat dans du code laid n'est souvent pas l'architecture. C'est la **compréhensibilité**. Vous ne pouvez pas changer en sécurité ce que vous ne pouvez pas tenir dans votre tête.

Le travail de Sonar sur la [complexité cognitive](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) est utile ici parce qu'il sépare « combien de chemins existent ? » de « à quel point est-ce difficile à suivre pour un humain ? ». Le type 0 vise la seconde question. Il réduit la quantité d'état, de branchements, d'ambiguïté de noms et de bruit visuel qu'un reviewer doit simuler mentalement.

Ce n'est pas cosmétique. C'est de la réduction de risque.

## Le moment où le concept a pris

Le nom est né d'un hotfix.

Le bug n'était pas intellectuellement profond. La méthode autour de lui l'était. C'était le genre de méthode où chaque variable locale avait l'air innocente jusqu'à ce que vous réalisiez qu'elle portait un sens venu de trois écrans plus haut. Chaque condition était supportable isolément, mais leur combinaison rendait le chemin d'exécution instable.

Je n'avais pas besoin d'un beau design.

J'avais besoin de debuggabilité :

- moins de branches par écran
- des noms qui décrivent l'intention métier plutôt que la mécanique temporaire
- des morceaux plus petits que je pouvais parcourir au debugger
- une manière de reviewer le nettoyage sans reviewer en même temps le bug fix

Un LLM a suggéré plusieurs « types » raisonnables de refactoring. Extraire ce service. Introduire ce pattern. Séparer les responsabilités. Toutes de bonnes idées. Toutes trop lourdes pour ce moment-là.

Il a demandé s'il devait commencer par le type 1.

J'ai dit : non, commence par le type 0.

Autrement dit : avant d'améliorer le design, rends le code actuel lisible sans changer ce qu'il fait.

Cette distinction a sauvé le travail. La méthode est devenue navigable. Le bug est devenu visible. Le correctif est resté petit.

## Une définition de travail

**Le refactoring de type 0 est une passe contrainte, qui préserve le comportement, et qui rend le code plus facile à comprendre avant un changement fonctionnel.**

Il a quatre mouvements autorisés :

1. Extraire des parties significatives dans des méthodes ou des variables locales nommées.
2. Renommer les choses pour que le code utilise un langage humain au lieu de l'archéologie.
3. Retirer le bruit dont l'inutilité est prouvée.
4. Ajouter ou resserrer des tests de caractérisation autour du comportement que vous allez préserver.

Et il a trois frontières strictes :

- pas de nouveau comportement produit
- pas de mouvement architectural
- pas d'améliorations « tant qu'on y est » qui changent la question de review

Si la PR change ce qu'observent les utilisateurs, les callers, les jobs, les réponses API, les écritures en base, les événements émis ou les chemins d'erreur, ce n'est plus du type 0. Cela peut toujours être le bon travail, mais il faut le nommer honnêtement.

## Avant et après : la forme du type 0

Voici un petit exemple. Il est volontairement ordinaire. Le refactoring le plus utile est souvent ordinaire.

Avant :

```ts
export function canStartTrial(account: Account | null, plan: Plan) {
  if (!account || account.deletedAt) {
    return false;
  }

  if (account.flags.includes("trial_blocked")) {
    return false;
  }

  if (account.subscription && account.subscription.status !== "canceled") {
    return false;
  }

  if (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  ) {
    return false;
  }

  if (plan.priceCents === 0 || plan.hidden) {
    return false;
  }

  return true;
}
```

Ce code n'est pas terrible. C'est important. Le type 0 n'est pas réservé aux catastrophes.

Mais imaginez devoir changer l'éligibilité à l'essai. Quelle règle changez-vous ? Laquelle relève d'une politique manuelle ? Laquelle correspond à l'historique de facturation ? Laquelle relève de l'éligibilité du plan ? Un reviewer doit déduire tout cela de la mécanique.

Après une passe de type 0 :

```ts
export function canStartTrial(account: Account | null, plan: Plan) {
  if (isMissingOrDeleted(account)) return false;
  if (isManuallyBlockedFromTrial(account)) return false;
  if (hasActiveSubscription(account)) return false;
  if (hasPaidBeforeOrActiveTrial(account)) return false;
  if (isIneligibleTrialPlan(plan)) return false;

  return true;
}

function isMissingOrDeleted(account: Account | null) {
  return !account || Boolean(account.deletedAt);
}

function isManuallyBlockedFromTrial(account: Account) {
  return account.flags.includes("trial_blocked");
}

function hasActiveSubscription(account: Account) {
  return Boolean(account.subscription && account.subscription.status !== "canceled");
}

function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}

function isIneligibleTrialPlan(plan: Plan) {
  return plan.priceCents === 0 || plan.hidden;
}
```

Ce n'est pas un nouveau design. Cela n'introduit pas un objet policy. Cela ne décide pas si l'éligibilité à l'essai appartient à un autre module. Cela ne rend pas les règles plus élégantes.

Cela fait une seule chose : donner des noms au comportement existant.

Maintenant, la prochaine PR peut dire : « Change `hasPaidBeforeOrActiveTrial` pour traiter différemment les abonnements payants expirés », et le reviewer n'est plus en train de fouiller dans des conditions anonymes.

C'est le type 0 en train de faire son travail.

## La partie dangereuse : même « juste une extraction » peut changer le comportement

Le type 0 paraît sûr parce qu'il est petit. Il est plus sûr, pas magiquement sûr.

L'extraction peut changer le comportement si vous êtes négligent avec :

- l'ordre d'évaluation
- le short-circuiting
- la portée des variables
- la mutation
- le moment où les exceptions sont déclenchées
- les appels répétés au temps, à l'aléatoire, aux IO, aux caches ou aux requêtes de base de données
- les références qui pointaient auparavant vers le même objet

C'est là que le type 0 demande de la discipline.

Ne réécrivez pas une condition parce que la version réécrite est « équivalente ». L'équivalence est l'endroit où les bugs mettent une petite moustache et passent devant la sécurité.

Préférez ceci :

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}
```

À ceci :

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  const paidBefore = account.invoices.some((invoice) => invoice.status === "paid");
  const activeTrial = account.trials.some((trial) => trial.endsAt > new Date());

  return paidBefore || activeTrial;
}
```

La seconde version paraît plus jolie, mais elle ne préserve plus le comportement de short-circuit. Si `account.invoices` prouvait déjà la réponse, l'ancien code ne touchait jamais `account.trials` ni `new Date()`. Peut-être que cela n'a pas d'importance. Peut-être que si. Le type 0 ne demande pas au reviewer de deviner.

En cas de doute, extrayez d'abord, embellissez plus tard, et gardez chaque étape assez ennuyeuse pour qu'un humain fatigué puisse la vérifier.

## Le filet de sécurité : caractériser avant d'être confiant

Si le code est déjà bien testé, très bien. Lancez les tests ciblés avant et après la passe de type 0.

S'il ne l'est pas, résistez à l'envie de dire : « Ce n'est que du cleanup. »

Cette phrase a lancé mille régressions.

_Working Effectively with Legacy Code_ de Michael Feathers reste le livre auquel je pense ici ; [l'aperçu d'O'Reilly](https://www.oreilly.com/library/view/working-effectively-with/0131177052/) le cadre autour de la modification de systèmes legacy sans tout réécrire. En pratique, le mouvement utile est souvent un petit test de caractérisation : capturer ce que le code fait actuellement pour le chemin que vous allez toucher.

Pas ce qu'il devrait faire.

Ce qu'il fait.

Exemple :

```ts
it("preserves the current trial eligibility rules for blocked accounts", () => {
  const account = accountFactory({
    flags: ["trial_blocked"],
    subscription: null,
    invoices: [],
    trials: [],
  });

  expect(canStartTrial(account, paidPlan)).toBe(false);
});
```

Ce test peut être philosophiquement insatisfaisant. Il peut encoder un comportement que vous avez l'intention de changer dans cinq minutes.

Très bien. Supprimez-le ou mettez-le à jour dans la PR qui change le comportement.

Pour la PR de type 0, son travail est humble : prouver que le cleanup n'a pas fait entrer en douce le vrai changement.

## Quand recourir au type 0

Utilisez le type 0 quand le prochain changement est bloqué par la compréhensibilité.

Bons signaux :

- vous relisez sans cesse la même méthode et perdez le fil
- le fichier a une méthode « principale » qui mélange validation, branching, IO, formatting et persistence
- un bug fix d'une ligne demande d'expliquer six faits sans rapport
- les reviewers se disputent sur le style parce que l'intention n'est pas visible
- le code est assez correct pour faire tourner le business, mais trop boueux pour être changé avec confiance
- vous devez ajouter des tests, mais la forme actuelle ne vous donne aucun endroit propre pour observer le comportement

Évitez le type 0 quand :

- le changement fonctionnel est déjà évident et sûr
- vous ne pouvez pas expliquer exactement quel comportement doit rester inchangé
- le cleanup exige de toucher beaucoup de callers dans le système
- l'équipe essaie de faire passer un redesign sous une étiquette de « cleanup »
- aucun changement proche ne bénéficie de cette clarté

Ce dernier point compte. Le cleanup sans client se transforme souvent en affaire de goût. Le type 0 a un client : le prochain changement.

## Une règle de décision pour le type 0

Voici la règle que j'utilise :

> Si je ne peux pas écrire le diff qui change le comportement d'une manière qu'un reviewer comprenne vite, j'ai probablement besoin d'un type 0 d'abord.

Pas toujours. Mais assez souvent.

Vous pouvez aussi le formuler en trois questions :

1. Quel comportement suis-je sur le point de changer ?
2. Quel comportement actuel doit rester exactement identique ?
3. Quelle petite passe de lisibilité rendrait les deux réponses évidentes dans le diff ?

Si la troisième question a une petite réponse, faites le type 0.

Si elle a une énorme réponse, vous regardez peut-être un vrai refactoring, pas du type 0. Découpez le travail, faites un plan, et arrêtez de prétendre que c'est inoffensif.

## Comment structurer la PR

Le type 0 fonctionne mieux quand il peut être reviewé comme sa propre chose.

Si le cleanup est minuscule, mettez-le dans le premier commit de la PR fonctionnelle :

1. `Type 0: name existing trial eligibility checks`
2. `Fix expired subscription trial eligibility`

Si le cleanup est assez large pour rendre le diff de comportement difficile à voir, ouvrez une PR séparée.

Utilisez un langage de PR ennuyeux :

```md
This PR is Type 0 only.

Intent:
- make the existing trial eligibility path readable before changing the rules
- preserve current behavior

Changed:
- extracted the top-level eligibility checks into named predicates
- renamed temporary variables to match existing domain terms
- removed one unused private helper

Validation:
- existing eligibility tests pass
- added characterization coverage for blocked, paid-before, and active-trial accounts

Out of scope:
- changing trial eligibility rules
- moving this logic into a policy/service object
```

Cela donne aux reviewers le bon travail.

Ils ne reviewent pas si la logique produit est meilleure. Ils reviewent si le code fait toujours la même chose plus lisiblement.

Les bons commentaires de review pour le type 0 ressemblent à ceci :

- « Cette extraction change le moment où `new Date()` est évalué. Peut-on garder l'ancien comportement de short-circuit ? »
- « Le nouveau nom dit `active subscription`, mais le prédicat traite aussi `past_due` comme actif. Peut-on faire correspondre le nom au comportement réel ? »
- « Ce helper supprimé semble inutilisé dans ce package, mais est-il référencé par reflection/config ? »
- « Peut-on ajouter un test de caractérisation pour le chemin que ce cleanup expose ? »

Les commentaires moins utiles ressemblent à ceci :

- « Peut-on transformer cela en strategy ? »
- « Tout ce module devrait être event-driven. »
- « Tant que vous y êtes, pouvez-vous corriger ce cas limite bizarre de billing ? »

Ce sont peut-être de bonnes idées. Ce ne sont pas des reviews de type 0.

## En quoi le type 0 diffère du théâtre du cleanup

Le théâtre du cleanup est un travail qui a l'air vertueux dans un diff mais qui ne réduit pas le risque pour le prochain changement.

Il a généralement l'une de ces odeurs :

- du churn de formatting large dans des fichiers que personne ne va toucher
- des renommages fondés sur le goût personnel plutôt que sur la clarté domaine
- déplacer du code dans de nouvelles abstractions avant que quelqu'un puisse énoncer le comportement actuel
- supprimer du code « unused » sans prouver que le runtime ne peut pas l'atteindre
- mélanger cleanup et changement de comportement, si bien que les reviewers ne savent plus quelle ligne a fait quoi
- une description de PR qui dit « misc cleanup »

Le type 0 est différent parce qu'il rend des comptes.

Il dit :

- voici le comportement que nous préservons
- voici le chemin que nous rendons compréhensible
- voici le prochain changement que cela rend possible
- voici comment nous avons vérifié que le cleanup n'a pas changé le comportement

C'est la différence entre ranger et faire de l'ingénierie.

## Type 0 et legacy seams

Parfois, le type 0 révèle que le prochain mouvement sûr est une seam.

La note de Fowler sur les [legacy seams](https://martinfowler.com/bliki/LegacySeam.html) est utile parce qu'elle décrit des endroits où l'on peut rediriger, observer ou tester le comportement sans modifier la source au point du comportement. Dans un système legacy, une seam peut faire la différence entre « nous pouvons tester ceci » et « nous espérons très professionnellement ».

Mais créer une seam peut franchir la frontière du type 0.

Extraire une méthode pour donner un nom au flux actuel :

```ts
const shippingCost = await calculateShipping(order);
```

vers :

```ts
const shippingCost = await calculateShippingForOrder(order);
```

Cela peut être du type 0 si le comportement reste le même.

Changer la signature de la fonction pour que les tests puissent injecter un faux shipping provider :

```ts
const shippingCost = await calculateShippingForOrder(order, shippingProvider);
```

C'est peut-être le bon mouvement, mais ce n'est plus seulement rendre le code existant compréhensible. Cela change la surface de collaboration. Traitez-le comme un refactoring qui casse une dépendance, et reviewez-le avec ce niveau d'attention.

Le type 0 peut pointer vers la seam. Il n'a pas à créer toute l'architecture de test dans la même PR.

## Une checklist pratique de type 0

Avant d'ouvrir la PR :

- [ ] Je peux nommer le travail qui change le comportement et que ce cleanup prépare.
- [ ] La PR ne change pas intentionnellement le comportement visible par l'utilisateur ou par le caller.
- [ ] Les méthodes extraites préservent l'ordre d'évaluation et le comportement de short-circuit.
- [ ] Les noms décrivent ce que le code fait réellement, pas ce que j'aimerais qu'il fasse.
- [ ] Le code supprimé est prouvé inutilisé dans le runtime pertinent, pas seulement impopulaire.
- [ ] J'ai lancé les tests ciblés ou rejoué le scénario qui compte.
- [ ] Si les tests manquaient, j'ai ajouté une couverture de caractérisation pour le chemin touché.
- [ ] La description de PR dit aux reviewers que c'est du type 0 et ce qui est hors scope.

Pendant la review :

- [ ] Demander « est-ce que cela préserve le comportement ? » avant « est-ce que je préfère ce design ? »
- [ ] Pousser les changements de comportement dans un commit ou une PR de suivi.
- [ ] Garder les idées d'architecture comme notes, sauf si elles sont nécessaires à la sécurité.
- [ ] Se méfier de l'équivalence trop clever.

Après le merge :

- [ ] Faire le vrai changement pendant que le modèle mental est frais.
- [ ] Supprimer ou mettre à jour les tests de caractérisation seulement quand le comportement change intentionnellement.
- [ ] Ne pas laisser le type 0 devenir un parking pour cleanup éternel.

## La promesse

Le refactoring de type 0 est une petite promesse :

> Je rends ce code plus facile à changer sans changer ce qu'il fait.

Cette promesse est utile précisément parce qu'elle est limitée.

Elle donne au développeur la permission d'améliorer la surface de travail sans lancer un débat d'architecture. Elle donne au reviewer un standard clair. Elle donne à la prochaine PR une chance réelle de parler du changement produit lui-même.

Parfois, la chose la plus courageuse à faire dans une codebase désordonnée n'est pas de la redessiner.

Parfois, c'est d'abord de faire dire la vérité au désordre actuel.
