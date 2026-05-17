---
lang: "fr"
translationOf: "the-city-that-wasnt-there"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "4881a4f8a93312f8"
title: "La ville qui n'était pas là"
date: "2026-02-08"
description: "J'ai interrogé l'API pour la deuxième plus grande entrée et j'ai obtenu zéro résultat. Pas une erreur — simplement rien. Ce que j'ai trouvé en commençant à creuser a changé toute l'architecture."
featuredImage: "./images/featured.jpg"
imageCaption: "Un vieux meuble d'archives en bois, avec une fiche vide au centre, pris dans une lumière poussiéreuse."
---

J'ai construit quelque chose qui tire des données d'une source, les nettoie, les présente mieux que l'original. Travail standard.

Puis j'ai interrogé la deuxième plus grande entrée du système. Tout le reste renvoyait des centaines de résultats. Celle-ci : zéro. Pas cassée. Simplement vide.

J'ai supposé que j'avais raté quelque chose. Vérifié mon code trois fois. Testé l'endpoint directement. L'entrée existe dans leur interface. Elle est juste... creuse.

C'est là que j'ai commencé à creuser.

---

La source avait l'air exhaustive. Large couverture, interface polie, API propre. Mais la participation volontaire signifie des trous qu'on ne voit pas depuis la documentation.

Trois concurrents avaient des données pour les mêmes entités. Des dossiers complets. Donc l'information existe quelque part.

Il ne manquait pas un endpoint. C'est l'endpoint qui manquait de réalité.

---

J'ai posé une question que personne n'avait pensé à poser : où vivaient ces données avant Internet ?

La réponse : dans des périodiques imprimés. Des archives. Des formats analogiques en circulation depuis les années 1800. Publiés trois fois par semaine. Pas de données structurées, seulement des documents sur un site web.

Alors j'en télécharge un. Prose institutionnelle dense, avis enfouis dans des services secondaires. Les données sont là.

Mes concurrents font cela manuellement depuis trente ans.

J'écris un scraper en un après-midi. En partie par curiosité, en partie par dépit.

---

Le parsing de documents, c'est là que les choses deviennent vraiment douloureuses.

Un seul mot se fait couper par un trait d'union conditionnel — Unicode U+00AD, invisible à l'œil, fatal pour chaque regex. Tu fixes l'écran en pensant que ton motif est faux. Il ne l'est pas. Un caractère fantôme se cache dans le texte. Le `\w` de JavaScript ne correspond pas aux caractères non-ASCII, donc des mots ordinaires deviennent impossibles à faire matcher. Les nombres contiennent des espaces fantômes venus du renderer : "20. 000" au lieu de "20.000."

Chaque bug prend plus de temps à trouver qu'à corriger. C'est toujours le ratio avec l'extraction de texte — 90% travail de détective, 10% code.

---

Dix enregistrements se matérialisent hors du bruit. Dates, identifiants, lieux — tout est là où cela doit être. Je le lance deux fois pour être sûr de ne pas halluciner. Même résultat. Cela marche vraiment.

---

Le parsing te montre ce qui est là. Je commence à chercher ce qui ne l'est pas. Les IDs sont séquentiels. Je les énumère.

53% sont morts. Le système purge les entrées terminées — pas d'archive, pas d'historique. Certains enregistrements existent, mais n'ont aucun document justificatif. La réponse : venez nous voir sur place. En 2026.

La source n'est pas une base de données. C'est une fenêtre — et quelqu'un continue de la fermer.

---

La première source de données a donné sa forme à l'architecture. La deuxième a cassé chaque hypothèse.

Il me fallait une deuxième architecture. Ce qui est une façon polie de dire que la première n'était pas vraiment une architecture — seulement une solution qui fonctionnait et qui se trouvait convenir à un cas. La source bizarre révèle la vérité : tu as construit pour les données que tu avais, pas pour celles que tu vas rencontrer.

Cette fois, j'en construis une vraie. Registry pattern, interfaces partagées, contrats de base qui permettent à chaque implémentation de rester fidèle à elle-même.

L'architecture est meilleure parce que j'ai attendu. Si je l'avais construite le premier jour, j'aurais conçu pour la seule source que je connaissais. La deuxième — l'étrange — m'a forcé à trouver ce qui compte vraiment.

On ne peut pas concevoir pour l'inconnu. Mais on peut refactoriser quand il arrive.

---

L'architecture m'a appris comment construire. Le marché m'a appris pour quoi construire.

J'entre sur un marché avec un acteur établi depuis trente ans. Leur technologie a l'air de dater de 2005. Leur avantage défensif n'est pas la technologie — c'est la confiance, la reconnaissance de marque, des décennies de données accumulées.

Le concurrent moderne s'est lancé il y a trois ans avec de l'IA et une interface élégante. Il a cassé les prix face à l'acteur historique. Trois ans plus tard, l'acteur historique domine toujours. Il s'avère que moins cher ne signifie pas automatiquement mieux positionné.

L'ancrage compte : le premier prix devient le point de référence. Facile à baisser plus tard, presque impossible à relever. L'abonnement n'est pas le produit — c'est la porte vers ce qu'il y a derrière.

Je fixe un prix élevé. Je peux toujours redescendre.

---

Quatre leçons, condensées :

1. **Faire autorité ne veut pas dire être complet.** La source primaire manquait tout un segment. Les données existaient — simplement pas là où quelqu'un les attendait.
2. **La deuxième source révèle ton architecture.** Tu n'apprends la vérité sur ton design que lorsqu'une chose refuse la forme que tu as construite.
3. **Les données ne sont pas permanentes.** Si tu en as besoin, sauvegarde-les. La source ne le fera pas.
4. **Fixe ton prix pour ce que tu es en train de devenir, pas pour ce que tu es.** L'abonnement est une porte. Construis ce qu'il y a derrière.

Le travail intéressant vit dans les interstices. Moi aussi.
