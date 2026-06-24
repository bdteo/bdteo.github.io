[conversational tone] Résoudre les erreurs BlueZ « AuthenticationFailed » sur 5.66+. Pourquoi les agents C++ sd-bus internes échouent, comment un agent Python externe corrige le problème, et pourquoi il faut faire du polling D-Bus.

TL;DR: Si vous obtenez org.bluez.Error.AuthenticationFailed avec un agent d'appairage C++/sd-bus personnalisé sur BlueZ 5.66+, le problème vient probablement de l'enregistrement de votre agent interne. Lancez un agent Python externe (simple-agent.py) comme processus séparé, et implémentez un polling des propriétés D-Bus au lieu de vous fier aux signaux PropertiesChanged. Détails et code ci-dessous.

J'ai passé deux jours à fixer org.bluez.Error.AuthenticationFailed avant de comprendre ce qui se passait.

[matter-of-fact] L'agent d'appairage était enregistré. Les appels D-Bus avaient l'air corrects. busctl confirmait que tout était en place -- et BlueZ continuait simplement à dire non. C'était pendant le travail sur D2Explorer -- un outil pour appairer la Huawei Watch D2 sous Linux -- et l'erreur d'appairage bloquait tout.

Voici ce qui s'est réellement passé, et comment nous l'avons corrigé.

[matter-of-fact] Le plan: un agent d'appairage C++ interne

L'idée était propre et autonome. Une seule application C++ qui gère tout le processus d'appairage avec sd-bus (les bindings D-Bus C/C++):

Se connecter au D-Bus système. Trouver l'adaptateur Bluetooth (org.bluez.Adapter1). Implémenter une classe C++ exposant l'interface org.bluez.Agent1. Enregistrer l'agent auprès de org.bluez.AgentManager1 via RegisterAgent et RequestDefaultAgent. Nous avons commencé avec la capacité DisplayYesNo, puis nous avons simplifié vers NoInputNoOutput. Découvrir l'appareil cible (org.bluez.Device1). Appeler Pair() sur l'interface D-Bus de l'appareil. L'agent interne gère automatiquement les callbacks (RequestConfirmation, RequestAuthorization) -- aucune interaction utilisateur nécessaire. Marquer l'appareil comme approuvé, établir une connexion GATT, terminé.

Un binaire, aucune dépendance externe. C'était le plan.

[deliberate] Le mur: org.bluez.Error.AuthenticationFailed

[reflective] Tout fonctionnait jusqu'à l'étape 6. Adaptateur trouvé, agent enregistré (D-Bus le confirmait), appareil découvert. Mais au moment où nous appelions Device1.Pair() via sd_bus_call_method -- échec instantané:

Nous avons tout essayé. Différentes capacités d'agent. Vérification de la configuration de la vtable sd-bus. Confirmation que les implémentations des méthodes de l'agent renvoyaient bien un succès rapidement. Utilisation de busctl et gdbus pour surveiller le trafic D-Bus -- les appels d'enregistrement semblaient corrects. L'appel Pair() continuait simplement à échouer.

Impasse.

[calm] La percée: un agent Python externe

Pour isoler le problème, nous avons retiré l'agent C++ interne de l'équation. Nous avons lancé le simple-agent.py standard de BlueZ comme processus séparé avant de lancer notre application C++ (désormais privée de son propre enregistrement d'agent):

Le résultat:

Régulier. À chaque fois. L'erreur AuthenticationFailed a complètement disparu.

[calm] Cela prouvait que le problème ne venait pas de Pair() lui-même, ni de l'appareil, ni de la capacité d'appairage de BlueZ. Il concernait précisément la manière dont notre application C++, via sd-bus, s'enregistrait et interagissait comme agent d'appairage. La même opération logique exacte -- enregistrer un agent NoInputNoOutput et appeler Pair() -- fonctionnait parfaitement quand l'agent tournait dans un processus Python séparé.

Ça a marché.

[reflective] Pourquoi l'agent interne échouait-il?

Quand je suis tombé dessus, je n'avais que des hypothèses. Depuis, j'ai trouvé des preuves documentées montrant que c'est un problème plus large -- pas seulement notre code.

[matter-of-fact] Régression BlueZ 5.70+

L'issue BlueZ GitHub #605 documente des cas où des appareils s'appairent correctement sur BlueZ 5.50 mais échouent sur des versions plus récentes avec auth failed with status 0x05. Les journaux HCI montrent Status: PIN or Key Missing (0x06) malgré des clés de liaison stockées. Le contournement? Lancer l'ancien script bluez-simple-agent.py. Ça vous rappelle quelque chose?

[deliberate] La disponibilité de l'agent est la cause racine

[deliberate] L'issue Bleak #1434 rend cela encore plus clair: l'appairage ne fonctionne que lorsque bluetoothctl ou GNOME Bluetooth tourne, parce que ces applications enregistrent l'agent d'authentification nécessaire. Sans agent actif et fonctionnant correctement, BlueZ renvoie en interne No agent available for request type 2 -- ce qui remonte sous forme de AuthenticationFailed.

L'idée clé: il ne suffit pas d'enregistrer un agent. L'agent doit répondre aux callbacks de BlueZ d'une manière que bluetoothd considère valide. Et quelque chose dans la façon dont sd-bus gère cela au sein du même processus que celui qui initie l'appairage ne satisfait pas les versions récentes de BlueZ.

[calm] Ce n'est peut-être même pas BlueZ

Le bug Red Hat #1905671 a révélé que certaines erreurs AuthenticationFailed sont liées au noyau, pas à BlueZ. Le noyau 5.9 avait des problèmes d'appairage que 5.8.18 et 5.10+ n'avaient pas. Le commentaire du mainteneur vaut la peine d'être cité: « Bluetooth is complex, it could be firmware, kernel, bluez, controller, end device or a combination of them all. »

[reflective] Incompatibilité de capacité d'agent

L'issue BlueZ #650 documente un autre angle: certains appareils (notamment iOS) échouent lors d'un appairage avec des agents NoInputNoOutput, parce qu'ils rétrogradent Secure Connections vers l'appairage Legacy, provoquant ensuite des erreurs Insufficient Authentication (0x05) lors de l'accès aux attributs. C'est un problème de négociation Security Manager Protocol (SMP), pas un problème d'enregistrement d'agent -- mais il produit le même message d'erreur.

[matter-of-fact] Les coupables probables dans notre cas

[matter-of-fact] Au vu des éléments, les explications les plus probables de l'échec de l'agent interne sd-bus sont:

Timing -- l'enregistrement sd-bus ou la gestion des méthodes dans notre boucle d'événements ne répondait pas exactement dans la fenêtre attendue par bluetoothd. Subtilités sd-bus vs python-dbus -- différences dans la façon dont ces bibliothèques interagissent avec le démon D-Bus ou gèrent la durée de vie des objets. Exigences plus strictes dans BlueZ 5.66+ -- séquences internes modifiées pour l'interaction avec l'agent, que sd-bus, utilisé dans la même application que celle qui initie l'appairage, ne satisfait pas.

[deliberate] Le second mur: les signaux D-Bus ne sont pas fiables

Passer AuthenticationFailed était une grosse victoire, mais ce n'était pas la fin. Avec l'agent externe en place, Pair() réussissait -- mais nous ne pouvions pas détecter de façon fiable quand il se terminait.

Nous nous reposions sur les signaux D-Bus PropertiesChanged (via sd-bus) pour savoir quand Paired, Trusted, Connected et ServicesResolved devenaient true. Parfois les signaux arrivaient. Parfois ils arrivaient en retard. Parfois ils n'arrivaient pas du tout.

Nous avons donc implémenté un polling actif -- un fallback qui interroge directement les valeurs des propriétés lorsque les signaux ne se présentent pas:

Chaque méthode de transition d'état (isPaired(), isTrusted(), isConnected(), areServicesResolved()) suit le même schéma: vérifier d'abord le booléen atomique en cache (mis à jour par le gestionnaire de signal s'il fonctionne), puis retomber sur un appel D-Bus direct Get pour la propriété.

[reflective] Pas élégant. Mais nécessaire.

Ça a marché.

[calm] Le correctif complet

Voici la recette consolidée. Si vous construisez un appairage Bluetooth automatisé sous Linux avec BlueZ 5.66+ et que vous tombez sur AuthenticationFailed:

[reflective] Étape 1: récupérer simple-agent.py

Prenez-le dans l'arbre source de BlueZ.

[matter-of-fact] Étape 2: lancer l'agent externe

[calm] Gardez-le actif dans un terminal séparé (ou comme service en arrière-plan).

[deliberate] Étape 3: retirer l'agent interne de votre application

Supprimez tous les appels RegisterAgent / RequestDefaultAgent de votre application C++. Laissez l'agent Python externe gérer les callbacks d'authentification.

[calm] Étape 4: ajouter le polling des propriétés D-Bus

Ne vous fiez pas uniquement aux signaux PropertiesChanged. Pour chaque propriété critique (Paired, Trusted, Connected, ServicesResolved), implémentez le schéma cache-puis-polling montré ci-dessus. Interrogez périodiquement depuis votre boucle principale.

[reflective] Étape 5: vérifier

Confirmez que l'agent externe tourne (sudo python simple-agent.py NoInputNoOutput). Lancez votre application. Pair() devrait réussir. Surveillez les logs de polling -- vous devriez voir des requêtes de propriétés D-Bus pour les transitions d'état. Si Pair() échoue encore, vérifiez votre version de BlueZ (bluetoothd --version) et votre version de noyau -- le problème est peut-être plus profond.

[matter-of-fact] Ce que cela vous coûte

Je ne vais pas prétendre que c'est une solution propre. Ça ne l'est pas:

Dépendance externe -- votre application a maintenant besoin d'un processus Python séparé en cours d'exécution. Plus de complexité -- logique de polling dans la boucle principale, en plus des gestionnaires de signaux. Moins autonome -- le rêve d'un seul binaire a disparu.

Mais ça marche. De façon fiable. Et quand vous avez fixé AuthenticationFailed pendant deux jours, « ça marche » est ce qui compte.
