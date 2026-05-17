---
lang: "fr"
translationOf: "the-model-that-wasnt-there"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "302e3501ec007351"
title: "Le modèle qui n'était pas là"
date: "2026-03-14"
description: "Google dominait tous les benchmarks. Vidéos YouTube, conférences, séminaires. Le meilleur modèle de génération d'images au monde. Puis j'ai essayé de l'utiliser."
featuredImage: "./images/featured.jpg"
imageCaption: "Un piédestal éclairé derrière une corde rouge : la promesse est exposée, mais pas faite pour être touchée."
---

Nous générions des images publicitaires avec Gemini 3 Pro. Classé #4 dans le classement Artificial Analysis. La qualité était vraiment impressionnante - meilleure adhérence au prompt, meilleure typographie, meilleure production créative que tout ce que nous avions essayé. Google était partout avec lui. Vidéos YouTube. Conférences. Séminaires. Articles de blog. "Le meilleur modèle de génération d'images au monde."

Je les ai crus. Les images étaient bonnes.

---

Puis un utilisateur a signalé que cloner une publicité prenait quatre minutes. J'ai vérifié. La génération elle-même se terminait en moins de trente secondes. Les trois minutes et demie restantes ? Le job réessayait contre un mur.

429. Resource Exhausted.

---

Google avait imposé un plafond dur à la génération d'images Gemini : deux requêtes par minute. Par projet. Globalement.

Deux. Pas deux cents. Pas vingt. Deux.

Nous avions généré 900 images la veille sans problème. Quelque chose avait changé de leur côté. Aucun avis, aucun email, aucune entrée dans le changelog. Juste un nouveau plafond, assez bas pour être atteint par deux utilisateurs qui cliquent en même temps.

---

Notre DevOps a soumis une demande d'augmentation de quota. Trente RPM. Raisonnable pour un SaaS en production. La réponse de Google :

> "This gemini model is not available for quota increase."

Ils ont suggéré que nous passions à Imagen 4. Je l'ai vérifié.

Imagen 4 Ultra - classé #10. Imagen 4 Standard - #42. Imagen 4 Fast - #60.

Nous étions sur le #4. La suggestion de Google était une rétrogradation de quelque part entre six et cinquante-six places dans leur propre classement.

---

J'ai essayé tout ce qui m'est venu à l'esprit.

Passer à Gemini 3.1 Flash - classé #2, moitié moins cher, meilleur que ce que nous avions. Déployé en staging. Puis j'ai vérifié le quota. Même plafond de 2 RPM. Ce n'est pas par modèle. C'est par projet, par famille de modèle de base. Tous les modèles d'image Gemini partagent le même bucket.

Distribution multi-région - le quota est par région, donc répartir les requêtes sur cinq régions nous donnerait dix RPM. Sauf que les modèles d'image Gemini 3.x ne fonctionnent que sur l'endpoint global. Il n'y a pas d'endpoints régionaux. Les 2 RPM sur l'endpoint global sont le seul bucket qui existe.

Plusieurs projets GCP - chacun obtient ses propres 2 RPM. Techniquement, ça marche. Architecturalement, voilà à quoi ressemble le désespoir.

---

J'ai commencé à rechercher ce que vivaient les autres développeurs. La même histoire partout. Limite de 2 RPM non documentée. Posts de forum sans réponse de Google. Augmentations de quota approuvées qui renvoyaient quand même 429 à chaque appel. Nos $30K de dépense GCP mensuelle ? Ça n'aide pas. Les tiers PayGo standard excluent explicitement les modèles de génération d'images des bénéfices de throughput.

Google ne va pas augmenter cette limite.

---

Et ensuite la question intéressante : pourquoi pas ?

Gemini génère les images avec le même transformer autorégressif qui traite le texte. Ce n'est pas un modèle de diffusion. C'est le LLM complet, qui raisonne pixel par pixel à travers l'image. Chaque image brûle le même compute que des dizaines d'appels API texte.

À $0.067 par image, Google perd presque certainement de l'argent sur chaque génération. Le plafond de 2 RPM n'est pas un quota qu'ils ont oublié d'ajuster. C'est un étranglement calculé, parce que l'économie ne fonctionne pas.

Imagen 4 utilise une diffusion latente classique - moins chère de plusieurs ordres de grandeur à exécuter. C'est pour cela qu'il obtient 30-150 RPM et que Google pousse tout le monde vers lui. Le modèle cher reçoit le marketing. Le modèle bon marché reçoit le throughput.

---

Pensez à ce que cela signifie. Google a construit un modèle qui dominait tous les benchmarks. Ils l'ont commercialisé à chaque conférence, chaque keynote YouTube, chaque blog développeur. "État de l'art. Le meilleur au monde." Les développeurs l'intègrent en production. Les utilisateurs en dépendent. Puis : deux requêtes par minute, aucune augmentation disponible, utilisez plutôt notre moins bon modèle.

L'API existe. L'endpoint fonctionne. La démo est stupéfiante.

Mais vous ne pouvez pas vraiment l'utiliser.

---

Nous sommes passés à `gemini-2.5-flash-image`. L'ancien modèle. Le modèle ennuyeux. Celui dont personne ne fait de vidéos YouTube.

Il a 40 RPM. Il fonctionne.

---

Quatre leçons, condensées :

1. **Le marketing n'est pas un produit.** Dominer un classement ne veut pas dire que vous pouvez servir du trafic de production. Les benchmarks mesurent la qualité. Les limites de débit mesurent l'engagement.
2. **La génération d'images autorégressive ne scale pas.** Quand générer une image coûte autant que cent requêtes texte, aucun modèle économique ne survit à des limites de débit généreuses. L'économie est le signal.
3. **Preview veut dire preview.** Google peut changer les limites, tuer des modèles, ou vous rediriger vers des alternatives inférieures sans préavis. Si votre système de production dépend d'un modèle preview, votre système de production dépend du calendrier marketing de quelqu'un d'autre.
4. **Le modèle ennuyeux fonctionne.** Celui avec 40 RPM et aucune conférence servira vos utilisateurs pendant que le modèle de classe mondiale reste derrière une corde de velours à générer deux images par minute.

Le vendor lock-in le plus effrayant est celui qui commence par une démo à laquelle vous ne pouvez pas résister.
