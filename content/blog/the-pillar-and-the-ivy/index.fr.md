---
lang: "fr"
translationOf: "the-pillar-and-the-ivy"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "84df7a480a376b56"
title: "Le pilier et le lierre"
date: "2026-04-26T12:00:00.000Z"
description: "Une petite image pour l'outsider de l'informatique. Le manuel ne ment pas. Il lui manque simplement le lierre."
featuredImage: "./images/featured.jpg"
imageCaption: "Un vieux poteau de portail en pierre des champs dans la brume de l'aube. Le lierre grimpe. Le poteau s'en fiche."
imagePosition: "center"
---

Les mathématiques discrètes sont pleines de petites choses qui ont l'air évidentes. C'est là le piège.

Vous êtes assis en amphi. Le professeur dessine quelque chose au tableau. *Un invariant est une propriété P qui reste vraie à chaque point de contrôle d'une opération.* Vous le notez, vous haussez les épaules, vous allez prendre un café. Et puis dix ans plus tard, vous déboguez un système distribué à 2 h du matin... et ce n'est qu'à ce moment-là que le mot commence à vouloir dire quelque chose pour vous.

Ceci est pour la version de vous qui est encore en amphi.

## Un pilier dans un champ

Imaginez un vieux pilier de pierre, seul au milieu d'un champ. Rien autour. Rien qui lui arrive.

C'est ce que vous donne la définition du manuel. Juste le pilier.

## Le professeur a oublié le lierre

Mon professeur était excellent, au passage. Le manuel ne ment pas. L'image est simplement incomplète.

Alors faites maintenant pousser du lierre sur le pilier. Des vrilles qui tirent sur la pierre. Des oiseaux qui nichent. Un touriste avec un marqueur. Un petit tremblement de terre. Une tempête. Deux cents ans de météo.

Le pilier est toujours là. De son point de vue, rien ne s'est passé.

*Ça*, c'est l'invariant.

Relisez maintenant la phrase du manuel — *une propriété P qui reste vraie à chaque point de contrôle d'une opération*. Le pilier est la propriété. Le lierre est l'opération. Le point de contrôle, c'est le moment où vous passez devant et regardez. *Reste vraie*, c'est juste une façon longue de dire *le pilier se fiche du lierre*.

## Où vous allez continuer à le rencontrer

Une fois que vous avez le pilier, vous commencez à le voir partout.

Un invariant de boucle. Le corps de votre boucle est le lierre. Votre invariant est le pilier. Le corps peut le briser un instant, comme une vrille qui tire sur la pierre. Au point de contrôle suivant, le pilier est revenu là où il était.

Une transaction de base de données. Entre BEGIN et COMMIT, les données peuvent faire de la gymnastique. ROLLBACK est le jardinier qui arrive et arrache le lierre. Le pilier — votre état cohérent — tient encore debout.

ACID. Clés étrangères. Systèmes de types. Retentatives distribuées. Tous des piliers. Tous debout dans leur propre lierre.

## Un pilier qu'on peut serrer dans ses bras

Un petit bonus, puisque vous lisez encore.

Il existe un concept frère appelé **idempotence**. Une opération idempotente est quelque chose que vous pouvez faire plusieurs fois, avec le même résultat que si vous ne l'aviez fait qu'une seule fois. Appeler ROLLBACK dix fois revient au même que l'appeler une fois. Mettre un interrupteur sur "on" dix fois revient au même que le mettre une fois.

Si l'invariance est *le pilier qui ne change pas pendant que le lierre part dans tous les sens*, alors l'idempotence est *le pilier que vous pouvez serrer dans vos bras autant de fois que vous voulez, et qui ne s'en formalise pas*.

Mettez les deux ensemble et vous obtenez l'étalon-or des systèmes tolérants aux pannes. Le réseau tombe ? Réessayez. Le serveur plante ? Réessayez. Vous finirez dans un état valide, et vous pouvez continuer à réessayer sans rien casser.

Un pilier qui survit au lierre *et* qui survit au fait d'être serré dans les bras mille fois. La plupart des infrastructures modernes sont discrètement construites là-dessus.

## Une petite fin

C'est l'image que j'aurais aimé que quelqu'un dessine pour moi il y a dix ans.

Ce n'est pas grand-chose. Une image. Mais parfois, une seule image fait la différence entre un concept qui vit dans vos os et un concept qui vit dans une note de bas de page.

Si vous êtes étudiant, ou ingénieur junior, ou simplement quelqu'un qui hoche discrètement la tête devant le mot "invariant" depuis quelque temps... ceci est pour vous.

Le pilier se fiche du lierre. C'est toute l'histoire.

D'un outsider à un autre.
