---
lang: "fr"
translationOf: "wash-one-more-plate-refactoring-philosophy"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "187813737c4f3f45"
title: "Lavez une assiette de plus : une règle simple pour une base de code toujours propre"
date: "2025-07-24"
description: "Une philosophie pratique du développement logiciel inspirée de la Boy Scout Rule : laissez toujours le code plus propre que vous ne l'avez trouvé - lavez une assiette de plus. Pourquoi le micro-refactoring compte, et comment l'appliquer sans faire dérailler la livraison."
featuredImage: "./images/featured.jpg"
imageCaption: "Des assiettes propres posées sur une table de cuisine, avec une assiette encore perlée d'eau au premier plan."
audioUrl: "/audio/articles/wash-one-more-plate-refactoring-philosophy/fr/hqfrgApggtO1785R4Fsn-fdd0a6aec020.m4a"
audioDuration: "9:02"
audioVoice: "Theodore (ElevenLabs French serene)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/wash-one-more-plate-refactoring-philosophy.fr.md"
---

> **TL;DR** : Traitez chaque changement dans votre base de code comme la préparation d'un repas. Vous allez salir quelques assiettes. Quand vous avez terminé, ne lavez pas seulement celles que vous avez utilisées : lavez-en *une de plus*. Avec le temps, ce petit surplus d'attention s'accumule en une cuisine (base de code) qui reste propre au lieu de glisser vers le chaos.

---

## La métaphore : cuisine, assiettes et code

Imaginez une cuisine professionnelle. Chaque plat préparé salit quelques assiettes, même dans la brigade la plus ordonnée. Maintenant, imaginez qu'après avoir fini leur plat, chaque cuisinier lave *exactement* les assiettes qu'il a salies. La cuisine restera à la limite d'une propreté acceptable, mais l'entropie s'installera : un peu de crasse oubliée ici, une planche à découper tachée là. À la fin, le désordre s'accumule.

Inversez maintenant la règle : après avoir cuisiné, chaque chef lave **une assiette de plus que celles qu'il a salies**. Lentement, la cuisine devient plus propre qu'avant - pas seulement entretenue, mais améliorée. Il en va de même pour le logiciel : chaque tâche que vous prenez devrait ajouter au moins un minuscule surplus de propreté à la base de code - un test de plus, un nom plus clair, une fonction extraite, une dépendance morte supprimée. Cette habitude du "+1 assiette" est la manière dont une base de code *reste* saine.

J'appelle cela **la règle Lavez une assiette de plus**.

## Échos du métier : vous êtes en bonne compagnie

Ce n'est pas une philosophie solitaire. Depuis des décennies, des figures du logiciel défendent des idées proches :

*   **"Laissez toujours le camp plus propre que vous ne l'avez trouvé."** C'est la classique [Boy Scout Rule](https://deviq.com/principles/boy-scout-rule/), popularisée dans le logiciel par Robert C. Martin. Même esprit : améliorer un peu, à chaque fois.
*   **La dette technique comme métaphore** (Ward Cunningham) : la dette accumule des intérêts. Ignorez-la, et la "cuisine" coûtera plus cher à utiliser demain. En rembourser une partie au fil de l'eau vous garde solvable.
*   **Le refactoring comme petites étapes continues** (Martin Fowler) : de minuscules changements qui préservent le comportement mais améliorent la conception. Les petits pas signifient peu de risque et un élan régulier.
*   **"Make it work, make it right, make it fast"** (Kent Beck) : d'abord la correction, puis la propreté, puis la performance. Laver cette assiette en plus vit dans la phase "make it right" - avant d'optimiser trop tôt.
*   **La théorie des vitres brisées appliquée au code** (Andrew Hunt et David Thomas) : le désordre visible invite davantage de désordre. Réparer une "vitre" avant que cela ne se propage protège le voisinage (la base de code).

Ces idées se renforcent mutuellement. Elles disent toutes la même chose : *ne transmettez pas le désordre ; prenez un moment pour améliorer l'état des choses.*

## Pourquoi l'assiette en plus compte (même quand vous êtes occupé)

### 1. **L'entropie est réelle**

Laissé sans attention, le code ne reste pas neutre. Les noms dérivent, les patterns se fragmentent, les abstractions pourrissent. L'entropie est une force ; la seule contre-force est un rangement constant et incrémental. Votre +1 assiette est un renversement de micro-entropie.

### 2. **La dette compose plus vite que vous ne le pensez**

Le coût du changement augmente à chaque "on corrigera ça plus tard". Plus tard arrive rarement. Les intérêts se manifestent sous forme de fonctionnalités ralenties, de déploiements fragiles et de suites de tests auxquelles plus personne ne fait confiance. Laver une assiette en plus *aujourd'hui* abaisse le taux d'intérêt de demain.

### 3. **Le signal social**

Quand vos coéquipiers vous voient nettoyer derrière vous (et même un peu plus), la norme se déplace. Il devient crédible - et attendu - de laisser le code meilleur qu'on ne l'a trouvé. La culture suit le comportement.

### 4. **De l'élan, pas du perfectionnisme**

Ce n'est pas une excuse pour faire du yak shaving. Vous ne reconstruisez pas la cuisine en plein service. Vous passez l'éponge sur une assiette de plus - petit, sûr, rapide. C'est la clé pour garder la livraison sur les rails.

## Comment pratiquer la règle Lavez-une-assiette-de-plus

Voici comment ancrer l'habitude sans faire dérailler le périmètre ni les délais.

### 1. Adoptez le "micro-refactoring" comme critère de terminé

*   Renommer une variable confuse.
*   Extraire une petite fonction pour réduire la complexité cyclomatique.
*   Supprimer du code mort ou des imports inutilisés.
*   Ajouter un test manquant pour un bug que vous venez de corriger.
*   Mettre à jour une documentation ou une section de README qui vous a fait peur une minute.

Le critère : **Si cela prend plus que quelques minutes, ce n'est pas une assiette - c'est tout le lave-vaisselle. Différez-le.** Capturez-le sous forme de ticket.

### 2. Utilisez les pull requests comme déclencheur de nettoyage

Chaque PR peut laisser le camp plus propre :

*   Exiger une case "Qu'avez-vous nettoyé ?" ou une courte note.
*   Encourager les reviewers à *demander* de petits rangements en parallèle de leur revue.
*   Célébrer les PR qui incluent ce polissage supplémentaire (les mentions en standup vont loin).

### 3. Automatisez les assiettes faciles

*   Hooks pre-commit pour le formatage et le linting.
*   Analyse statique pour signaler les méthodes complexes ou les longues listes de paramètres.
*   Vérificateurs de dépendances pour les bibliothèques obsolètes.

Laissez les balais automatisés retirer les désordres triviaux pour que les humains puissent se concentrer sur la logique et la conception.

### 4. Inscrivez-la dans les normes de l'équipe

*   Ajoutez la règle à l'accord de travail ou au manuel d'ingénierie de votre équipe.
*   Suivez les victoires de micro-refactoring en rétrospective si vous voulez une preuve mesurable.
*   Programmez parfois en pair ou en mob pour diffuser l'habitude (et le courage).

### 5. Sachez quand **ne pas** laver

Parfois, la cuisine est en feu : la production est tombée, ou une démo commence dans quelques heures. En urgence, cassez la pile d'assiettes sales s'il le faut. Mais revenez-y après la crise. La règle n'est pas un dogme ; c'est une discipline.

## La limite : une assiette, pas l'évier

Le scope creep se déguise souvent en artisanat. Votre travail est de vous arrêter à "une assiette de plus". Si ce petit refactoring révèle une odeur plus profonde, notez-la et avancez. Mettez la correction plus profonde au parking :

*   Créez un ticket libellé `refactor:` ou `techdebt:`.
*   Liez-le au code, aux tests ou au module concerné.
*   Ajoutez une courte note expliquant pourquoi cela compte.

Vous avez fait votre devoir : vous avez repéré le désordre, lavé une assiette et laissé des instructions pour la suite.

## Exemple : transformer une fonction confuse en fonction testable

Avant :

```php
function processOrder($order) {
    if(!$order->id) throw new Exception('No ID');
    $tax = 0;
    if ($order->country === 'BG') {
        $tax = $order->total * 0.20;
    } else if ($order->country === 'DE') {
        $tax = $order->total * 0.19;
    }
    // Lots more branching...
    // Sends email, writes to DB, calls payment gateway…
}
```

Assiette lavée :

```php
/**
 * Calculate VAT for an order based on country.
 * Pure function: given (total, country) -> VAT amount.
 */
function vatFor(string $country, float $total): float {
    return match($country) {
        'BG' => $total * 0.20,
        'DE' => $total * 0.19,
        default => 0.0,
    };
}
```

Maintenant, votre fonction principale appelle `vatFor()` au lieu d'inliner la logique. Vous avez ajouté un micro-test pour `vatFor()`. C'est une assiette de plus - simple, contenue, utile.

## Dernières pensées

Une assiette de plus, c'est minuscule. C'est justement le point. Vous n'avez pas besoin de refactorings héroïques pour garder une base de code saine ; vous avez besoin d'une culture de soin petit, constant. Faites-en une habitude, intégrez-la à votre processus, et dans un an vous vous demanderez pourquoi votre cuisine *n'est pas* un désastre - parce que vous ne l'avez jamais laissée le devenir.

---

**Appel à l'action** : La prochaine fois que vous touchez un fichier, demandez-vous : *"Quelle assiette supplémentaire puis-je laver avant de commit ce changement ?"* Puis faites-le. Répétez. Changez la culture, une assiette impeccable à la fois.

### Sources et lectures complémentaires

*   **Robert C. Martin ("Uncle Bob") - Boy Scout Rule :** "[The Boy Scout Rule](https://97-things-every-x-should-know.gitbooks.io/97-things-every-programmer-should-know/content/en/thing_08/)" dans *97 Things Every Programmer Should Know*.
*   **Ward Cunningham - métaphore de la dette technique :** l'explication originale de Cunningham sur la [Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html), sur le site de Martin Fowler.
*   **Martin Fowler - micro-refactoring continu :** le livre de Fowler, [*Refactoring: Improving the Design of Existing Code*](https://martinfowler.com/books/refactoring.html).
*   **Kent Beck - "Make it work, make it right, make it fast" :** une explication du mantra par [Ron Jeffries](https://ronjeffries.com/articles/-x024/biot/-bv40/3/).
*   **Andrew Hunt et David Thomas - Broken Windows in Software :** le concept est détaillé dans leur livre, [*The Pragmatic Programmer*](https://en.wikipedia.org/wiki/The_Pragmatic_Programmer).
*   **Entropie logicielle et maintenance :** une bonne lecture sur le sujet : "[Entropy in Software and the Broken Window Theory](https://chroniclesofapragmaticprogrammer.substack.com/p/entropy-in-software-and-the-broken-window)."
