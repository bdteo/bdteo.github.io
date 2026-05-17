---
lang: "fr"
translationOf: "the-queue-that-never-stopped"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "97eab6a570d4f717"
title: "La file qui ne s'est jamais arrêtée"
date: "2026-02-07"
description: "La mémoire Redis continuait de grimper. Horizon affichait du vert. Vingt-neuf classes d'emails réessayaient indéfiniment et personne ne l'avait remarqué."
featuredImage: "./images/featured.jpg"
imageCaption: "Une goutte d'eau tombe d'un robinet au-dessus d'un évier."
---

Les emails échouaient. Cette partie était attendue — des identifiants SMTP cassés pendant une migration. Ce qui ne l'était pas : ils n'arrêtaient jamais d'échouer.

---

Tableau de bord Horizon : vert. Workers : en bonne santé. Redis : en lente croissance. Aucune alerte, aucune erreur dans les logs. Juste une accumulation silencieuse de jobs qui continuaient d'essayer, encore et encore et encore.

Je ne l'ai remarqué que parce que la mémoire Redis n'est pas redescendue après la correction de la configuration SMTP. Quelque chose était encore là-dedans, à mâcher des retries. Des milliers.

---

Je pensais que la file s'en chargerait. C'est le contrat : un job échoue, réessaie quelques fois, atterrit dans `failed_jobs`. On passe à autre chose.

Sauf si le job est un Mailable.

Quand vous envoyez un Mailable dans une file, Laravel l'enveloppe dans un job. Le `maxTries` de ce job vient de la propriété `$tries` du Mailable. Si vous ne la définissez pas — et pourquoi le feriez-vous, la documentation la mentionne à peine — elle est sérialisée comme `null`.

`null` ne veut pas dire « utiliser la valeur par défaut du supervisor ». `null` veut dire « sans limite ». Horizon voit `null` et pense : ce job veut réessayer pour toujours. Alors il le fait.

---

Il s'avère que c'est un bug connu. <a href="https://github.com/laravel/horizon/issues/1346" target="_blank" rel="noopener noreferrer">Laravel Horizon issue #1346</a>. Le flag `--tries` du supervisor est ignoré quand le payload sérialisé du job contient `maxTries: null`. La déclaration propre au job gagne, et sa déclaration dit : ne jamais s'arrêter.

Vingt-neuf classes Mailable. Chacune sans propriété `$tries` explicite. Chacune potentiellement immortelle.

---

Le correctif est presque insultant de simplicité :

```php
class WelcomeEmail extends Mailable implements ShouldQueue
{
    public int $tries = 2;
    public int $maxExceptions = 2;
}
```

Deux propriétés. Vingt-neuf fichiers. C'est tout.

Une tentative initiale, un retry, puis `failed_jobs`. Comme je pensais que cela avait toujours fonctionné.

---

Je le teste comme on testerait un piège à souris. Casser la configuration SMTP exprès. Envoyer un email. Regarder Horizon. Deux tentatives. Failed job. Terminé. Pas de fantômes dans la file.

Puis je corrige les vingt-huit autres.

---

Trois leçons, condensées :

1. **`null` n'est pas « default ».** Dans les payloads sérialisés des jobs, `maxTries: null` veut dire illimité. Votre configuration supervisor est une suggestion, pas une règle.
2. **Les tableaux de bord verts mentent.** Horizon montrait des workers en bonne santé, qui traitaient joyeusement des jobs qui ne finiraient jamais.
3. **Les defaults des frameworks ne sont pas toujours sains.** Laravel ne définit pas `$tries` sur les Mailables. Vous devez le faire. La documentation ne vous préviendra pas avant que vous ayez déjà un incendie.

Les bugs les plus effrayants sont ceux qui ressemblent à un fonctionnement normal. Celui-ci y ressemblait — pendant des semaines.
