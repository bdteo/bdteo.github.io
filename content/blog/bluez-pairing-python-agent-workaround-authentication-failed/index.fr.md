---
lang: "fr"
translationOf: "bluez-pairing-python-agent-workaround-authentication-failed"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "0364f15f40f64a8e"
title: "Correctif d'appairage BlueZ : agent Python externe et polling D-Bus"
date: "2025-04-08"
description: "Résoudre les erreurs BlueZ « AuthenticationFailed » sur 5.66+. Pourquoi les agents C++ sd-bus internes échouent, comment un agent Python externe corrige le problème, et pourquoi il faut faire du polling D-Bus."
featuredImage: "./images/featured.jpg"
imageCaption: "Naviguer dans les complexités des interactions avec les agents d'appairage D-Bus de BlueZ sous Linux."
---

> **TL;DR :** Si vous obtenez `org.bluez.Error.AuthenticationFailed` avec un agent d'appairage C++/sd-bus personnalisé sur BlueZ 5.66+, le problème vient probablement de l'enregistrement de votre agent interne. Lancez un agent Python externe (`simple-agent.py`) comme processus séparé, et implémentez un polling des propriétés D-Bus au lieu de vous fier aux signaux `PropertiesChanged`. Détails et code ci-dessous.

J'ai passé deux jours à fixer `org.bluez.Error.AuthenticationFailed` avant de comprendre ce qui se passait.

L'agent d'appairage était enregistré. Les appels D-Bus avaient l'air corrects. `busctl` confirmait que tout était en place -- et BlueZ continuait simplement à dire non. C'était pendant le travail sur [D2Explorer](../huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- un outil pour appairer la Huawei Watch D2 sous Linux -- et l'erreur d'appairage bloquait tout.

Voici ce qui s'est réellement passé, et comment nous l'avons corrigé.

## Le plan : un agent d'appairage C++ interne

L'idée était propre et autonome. Une seule application C++ qui gère tout le processus d'appairage avec `sd-bus` (les bindings D-Bus C/C++) :

1.  Se connecter au D-Bus système.
2.  Trouver l'adaptateur Bluetooth (`org.bluez.Adapter1`).
3.  Implémenter une classe C++ exposant l'interface `org.bluez.Agent1`.
4.  Enregistrer l'agent auprès de `org.bluez.AgentManager1` via `RegisterAgent` et `RequestDefaultAgent`. Nous avons commencé avec la capacité `DisplayYesNo`, puis nous avons simplifié vers `NoInputNoOutput`.
5.  Découvrir l'appareil cible (`org.bluez.Device1`).
6.  Appeler `Pair()` sur l'interface D-Bus de l'appareil.
7.  L'agent interne gère automatiquement les callbacks (`RequestConfirmation`, `RequestAuthorization`) -- aucune interaction utilisateur nécessaire.
8.  Marquer l'appareil comme approuvé, établir une connexion GATT, terminé.

Un binaire, aucune dépendance externe. C'était le plan.

## Le mur : `org.bluez.Error.AuthenticationFailed`

Tout fonctionnait jusqu'à l'étape 6. Adaptateur trouvé, agent enregistré (D-Bus le confirmait), appareil découvert. Mais au moment où nous appelions `Device1.Pair()` via `sd_bus_call_method` -- échec instantané :

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method threw exception: Failed to call method 'Pair':
    Input/output error - D-Bus error: org.bluez.Error.AuthenticationFailed (Authentication Failed)
```

Nous avons tout essayé. Différentes capacités d'agent. Vérification de la configuration de la vtable `sd-bus`. Confirmation que les implémentations des méthodes de l'agent renvoyaient bien un succès rapidement. Utilisation de `busctl` et `gdbus` pour surveiller le trafic D-Bus -- les appels d'enregistrement semblaient corrects. L'appel `Pair()` continuait simplement à échouer.

**Impasse.**

## La percée : un agent Python externe

Pour isoler le problème, nous avons retiré l'agent C++ interne de l'équation. Nous avons lancé le `simple-agent.py` standard de BlueZ comme processus séparé *avant* de lancer notre application C++ (désormais privée de son propre enregistrement d'agent) :

```bash
# Terminal 1: Run the external agent
sudo python simple-agent.py NoInputNoOutput

# Terminal 2: Run our C++ app (no internal agent)
sudo ./build/huawei_pair_app <MAC> <QR_VALUE>
```

Le résultat :

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method succeeded  <--- SUCCESS!
```

Régulier. À chaque fois. L'erreur `AuthenticationFailed` a complètement disparu.

Cela prouvait que le problème ne venait pas de `Pair()` lui-même, ni de l'appareil, ni de la capacité d'appairage de BlueZ. Il concernait précisément la manière dont notre application C++, via `sd-bus`, s'enregistrait et interagissait comme agent d'appairage. La même opération logique exacte -- enregistrer un agent `NoInputNoOutput` et appeler `Pair()` -- fonctionnait parfaitement quand l'agent tournait dans un processus Python séparé.

**Ça a marché.**

## Pourquoi l'agent interne échouait-il ?

Quand je suis tombé dessus, je n'avais que des hypothèses. Depuis, j'ai trouvé des preuves documentées montrant que c'est un problème plus large -- pas seulement notre code.

### Régression BlueZ 5.70+

[L'issue BlueZ GitHub #605](https://github.com/bluez/bluez/issues/605) documente des cas où des appareils s'appairent correctement sur BlueZ 5.50 mais échouent sur des versions plus récentes avec `auth failed with status 0x05`. Les journaux HCI montrent `Status: PIN or Key Missing (0x06)` malgré des clés de liaison stockées. Le contournement ? Lancer l'ancien script `bluez-simple-agent.py`. Ça vous rappelle quelque chose ?

### La disponibilité de l'agent est la cause racine

[L'issue Bleak #1434](https://github.com/hbldh/bleak/issues/1434) rend cela encore plus clair : l'appairage ne fonctionne que lorsque `bluetoothctl` ou GNOME Bluetooth tourne, parce que ces applications enregistrent l'agent d'authentification nécessaire. Sans agent actif et *fonctionnant correctement*, BlueZ renvoie en interne `No agent available for request type 2` -- ce qui remonte sous forme de `AuthenticationFailed`.

L'idée clé : il ne suffit pas d'*enregistrer* un agent. L'agent doit répondre aux callbacks de BlueZ d'une manière que `bluetoothd` considère valide. Et quelque chose dans la façon dont `sd-bus` gère cela au sein du même processus que celui qui initie l'appairage ne satisfait pas les versions récentes de BlueZ.

### Ce n'est peut-être même pas BlueZ

[Le bug Red Hat #1905671](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) a révélé que certaines erreurs `AuthenticationFailed` sont liées au noyau, pas à BlueZ. Le noyau 5.9 avait des problèmes d'appairage que 5.8.18 et 5.10+ n'avaient pas. Le commentaire du mainteneur vaut la peine d'être cité : *« Bluetooth is complex, it could be firmware, kernel, bluez, controller, end device or a combination of them all. »*

### Incompatibilité de capacité d'agent

[L'issue BlueZ #650](https://github.com/bluez/bluez/issues/650) documente un autre angle : certains appareils (notamment iOS) échouent lors d'un appairage avec des agents `NoInputNoOutput`, parce qu'ils rétrogradent Secure Connections vers l'appairage Legacy, provoquant ensuite des erreurs `Insufficient Authentication (0x05)` lors de l'accès aux attributs. C'est un problème de négociation Security Manager Protocol (SMP), pas un problème d'enregistrement d'agent -- mais il produit le même message d'erreur.

### Les coupables probables dans notre cas

Au vu des éléments, les explications les plus probables de l'échec de l'agent interne `sd-bus` sont :

1.  **Timing** -- l'enregistrement `sd-bus` ou la gestion des méthodes dans notre boucle d'événements ne répondait pas exactement dans la fenêtre attendue par `bluetoothd`.
2.  **Subtilités `sd-bus` vs `python-dbus`** -- différences dans la façon dont ces bibliothèques interagissent avec le démon D-Bus ou gèrent la durée de vie des objets.
3.  **Exigences plus strictes dans BlueZ 5.66+** -- séquences internes modifiées pour l'interaction avec l'agent, que `sd-bus`, utilisé dans la même application que celle qui initie l'appairage, ne satisfait pas.

## Le second mur : les signaux D-Bus ne sont pas fiables

Passer `AuthenticationFailed` était une grosse victoire, mais ce n'était pas la fin. Avec l'agent externe en place, `Pair()` réussissait -- mais nous ne pouvions pas *détecter* de façon fiable quand il se terminait.

Nous nous reposions sur les signaux D-Bus `PropertiesChanged` (via `sd-bus`) pour savoir quand `Paired`, `Trusted`, `Connected` et `ServicesResolved` devenaient `true`. Parfois les signaux arrivaient. Parfois ils arrivaient en retard. Parfois ils n'arrivaient pas du tout.

Nous avons donc implémenté un **polling actif** -- un fallback qui interroge directement les valeurs des propriétés lorsque les signaux ne se présentent pas :

```c++
bool BluetoothDevice::isPaired() {
    bool cachedValue = mockPaired_.load(); // Check signal-updated cache
    if (cachedValue) return true;

    // Signal didn't fire? Poll D-Bus directly.
    Logger::debug("[Polling] Polling Paired property via D-Bus...");
    bool polledValue = false;
    adapter_.getObjectProperty<bool>(
        devicePath_, "org.bluez.Device1", "Paired", polledValue
    );
    if (polledValue) mockPaired_.store(true); // Update cache
    return polledValue;
}
```

Chaque méthode de transition d'état (`isPaired()`, `isTrusted()`, `isConnected()`, `areServicesResolved()`) suit le même schéma : vérifier d'abord le booléen atomique en cache (mis à jour par le gestionnaire de signal s'il fonctionne), puis retomber sur un appel D-Bus direct `Get` pour la propriété.

Pas élégant. Mais nécessaire.

**Ça a marché.**

## Le correctif complet

Voici la recette consolidée. Si vous construisez un appairage Bluetooth automatisé sous Linux avec BlueZ 5.66+ et que vous tombez sur `AuthenticationFailed` :

### Étape 1 : récupérer simple-agent.py

Prenez-le dans l'[arbre source de BlueZ](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent).

### Étape 2 : lancer l'agent externe

```bash
sudo python simple-agent.py NoInputNoOutput
```

Gardez-le actif dans un terminal séparé (ou comme service en arrière-plan).

### Étape 3 : retirer l'agent interne de votre application

Supprimez tous les appels `RegisterAgent` / `RequestDefaultAgent` de votre application C++. Laissez l'agent Python externe gérer les callbacks d'authentification.

### Étape 4 : ajouter le polling des propriétés D-Bus

Ne vous fiez pas uniquement aux signaux `PropertiesChanged`. Pour chaque propriété critique (`Paired`, `Trusted`, `Connected`, `ServicesResolved`), implémentez le schéma cache-puis-polling montré ci-dessus. Interrogez périodiquement depuis votre boucle principale.

### Étape 5 : vérifier

1.  Confirmez que l'agent externe tourne (`sudo python simple-agent.py NoInputNoOutput`).
2.  Lancez votre application. `Pair()` devrait réussir.
3.  Surveillez les logs de polling -- vous devriez voir des requêtes de propriétés D-Bus pour les transitions d'état.
4.  Si `Pair()` échoue encore, vérifiez votre version de BlueZ (`bluetoothd --version`) et votre version de noyau -- le problème est peut-être plus profond.

## Ce que cela vous coûte

Je ne vais pas prétendre que c'est une solution propre. Ça ne l'est pas :

1.  **Dépendance externe** -- votre application a maintenant besoin d'un processus Python séparé en cours d'exécution.
2.  **Plus de complexité** -- logique de polling dans la boucle principale, en plus des gestionnaires de signaux.
3.  **Moins autonome** -- le rêve d'un seul binaire a disparu.

Mais ça marche. De façon fiable. Et quand vous avez fixé `AuthenticationFailed` pendant deux jours, « ça marche » est ce qui compte.

---

### Références

<a id="ref1"></a>1. [BlueZ GitHub Issue #55: Device characteristics and pairing timing](https://github.com/bluez/bluez/issues/55) -- *Échecs d'appairage intermittents liés au timing de l'agent.*<br>
<a id="ref2"></a>2. [Bluetooth Auto Pairing with NoInputNoOutput Agent Issues](https://forums.raspberrypi.com/viewtopic.php?t=324225) -- *Discussion de forum sur les défis de l'appairage headless.*<br>
<a id="ref3"></a>3. [BlueZ Source: test/simple-agent](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent) -- *L'agent Python standard.*<br>
<a id="ref4"></a>4. [BlueZ GitHub Issue #605: Pairing regression in 5.70+](https://github.com/bluez/bluez/issues/605) -- *Échecs documentés avec les versions récentes de BlueZ.*<br>
<a id="ref5"></a>5. [Bleak Issue #1434: Pairing requires active agent](https://github.com/hbldh/bleak/issues/1434) -- *Preuve que la disponibilité de l'agent est la cause racine.*<br>
<a id="ref6"></a>6. [Red Hat Bug #1905671: Kernel-related pairing failures](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) -- *Ce n'est pas toujours BlueZ -- parfois c'est le noyau.*<br>
<a id="ref7"></a>7. [BlueZ GitHub Issue #650: Agent capability mismatch](https://github.com/bluez/bluez/issues/650) -- *Échecs de négociation SMP avec NoInputNoOutput.*<br>
<a id="ref8"></a>8. [BlueZ Agent API Documentation](https://bluez.readthedocs.io/en/latest/agent-api/) -- *Référence officielle de l'interface agent.*<br>
<a id="ref9"></a>9. [Kynetics: Pairing Agents in the BlueZ Stack](https://technotes.kynetics.com/2018/pairing_agents_bluez/) -- *Analyse technique détaillée de l'enregistrement des agents.*

---

### Articles liés

- [Appairage BLE de la Huawei Watch D2 : protocole et verrouillage fournisseur](/huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- le projet qui a déclenché cette enquête. La Watch D2 exige une poignée de main propriétaire au niveau applicatif, par-dessus l'appairage BLE standard, ce qui explique pourquoi nous avions besoin que l'appairage automatisé fonctionne dès le départ.
- [Corriger le Bluetooth de l'émulateur Android sur Mac M1 avec Bumble et API 32](/m1-mac-android-emulator-bluetooth-passthrough-bumble/) -- une autre bataille d'intégration Bluetooth, cette fois pour faire passer la radio physique d'un Mac dans l'émulateur Android.
