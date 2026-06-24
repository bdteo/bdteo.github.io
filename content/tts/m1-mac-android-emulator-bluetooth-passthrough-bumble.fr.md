[conversational tone] Corriger le passthrough Bluetooth de l'émulateur Android sur Mac M1. Ce guide détaille la configuration Bumble qui a fonctionné, avec Netsim, points d'accès explicites, et AVD API 32.

Si vous développez avec Bluetooth sur un Mac M1/M2/M3 et que vous essayez de faire fonctionner la radio Bluetooth de votre machine hôte dans l'émulateur Android, vous avez probablement déjà souffert un peu. Ce qui semble devoir être simple se transforme souvent en tunnel frustrant de connexions ratées, d'erreurs cryptiques et de documentation qui s'arrête juste avant l'endroit utile. Je viens de traverser exactement cette bataille, et après plusieurs murs, j'ai fini par trouver une combinaison avec la pile Bluetooth Python Bumble qui fonctionne vraiment.

Ce n'est pas encore un guide théorique de plus; c'est le récit pas à pas de ce qui a échoué et, surtout, de ce qui a réussi pour relier le Bluetooth de mon Mac Pro M1 (via un dongle USB externe dans mon cas, même si le principe pourrait s'appliquer aux radios internes) à un émulateur Android 12L (API 32).

[matter-of-fact] L'objectif: du vrai Bluetooth dans l'émulateur

L'objectif était simple: faire utiliser à l'émulateur Android le contrôleur Bluetooth physique de mon Mac au lieu de son contrôleur virtuel limité. C'est crucial pour tester des applications qui interagissent avec de vrais appareils Bluetooth.

[deliberate] L'outil: entre en scène Bumble

Bumble est une puissante pile Bluetooth en Python. Son outil clé pour cette tâche est bumble-hci-bridge, qui peut se connecter à une interface HCI physique (Host Controller Interface) d'un côté et l'exposer via différents transports (comme TCP ou gRPC) de l'autre.

[calm] Tentative n°1: la méthode socket QEMU (le premier essai logique)

À partir de connaissances générales sur QEMU et de quelques anciens guides, la première approche consistait à utiliser des flags de l'émulateur pour connecter directement un port série virtuel (adossé à une socket TCP) au bridge HCI.

Démarrer le bridge (mode serveur TCP): Nous avons connecté Bumble au dongle physique (qui, étonnamment, fonctionnait mieux avec usb:0 qu'avec son VID:PID spécifique usb:0b05:17cb sur ma machine — les bizarreries du M1!) et l'avons fait écouter sur un port TCP.

[calm] Lancer l'émulateur avec des flags QEMU: Nous avons modifié le script de lancement de l'émulateur (en ciblant d'abord l'API 34) pour ajouter des flags -qemu qui dirigeaient un port série virtuel (virtserialport) vers un périphérique de caractères (chardev) adossé à une socket TCP connectée au bridge.

Le résultat? Succès partiel, échec final: Avec lsof, nous pouvions voir que le processus QEMU de l'émulateur établissait bien une connexion TCP vers le bridge Bumble. Pourtant, la pile Bluetooth Android à l'intérieur de l'émulateur n'envoyait jamais réellement de commandes HCI dessus. Activer ou désactiver le Bluetooth dans les réglages Android ne faisait rien. Les logs du bridge restaient silencieux après la connexion initiale. Impasse.

[reflective] Tentative n°2: le bridge Netsim par défaut (en suivant la documentation Bumble)

La documentation de Bumble mentionne un bridge vers l'interface gRPC « Netsim » de l'émulateur. Netsim (et son cœur, Root Canal) est le système plus récent de contrôleur Bluetooth virtuel de l'émulateur.

Démarrer le bridge (mode contrôleur Netsim): Nous avons configuré le bridge pour agir comme un contrôleur Netsim, écouter sur le port gRPC par défaut (8554), et se connecter au dongle physique.

Lancer l'émulateur (backend par défaut): Nous avons remis le script de lancement en arrière (toujours avec l'API 34) pour retirer les flags -qemu et ajouter -packet-streamer-endpoint default, afin de nous assurer qu'il tente d'utiliser le backend Netsim.

Le résultat? Aucune connexion: Cette fois, l'émulateur démarrait, mais le bridge Bumble ne montrait aucun signe d'une connexion gRPC entrante depuis l'émulateur. Les logs de l'émulateur ne révélaient pas d'erreur de connexion évidente, mais le Bluetooth restait inutilisable. Encore une impasse.

[matter-of-fact] Tentative n°3: rétrograder l'API + endpoint Netsim explicite (la bonne!)

Des recherches web ont révélé des signalements d'instabilité générale avec le Bluetooth sur les émulateurs API 33/34 et de possibles problèmes dans la manière dont l'émulateur découvre ou se connecte au backend Netsim, surtout quand un outil externe tente de l'intercepter. La clé semblait être de dire explicitement à l'émulateur où se trouvait le serveur gRPC Netsim et d'essayer un niveau d'API plus ancien.

Démarrer le bridge (mode contrôleur Netsim, port explicite, usb:0): Comme dans la tentative n°2, en veillant à ce qu'il écoute sur un port connu (8554) et se connecte au dongle physique avec l'index (usb:0) qui fonctionnait de manière fiable.

Modifier et lancer l'émulateur (API 32, endpoint explicite): Nous avons créé un AVD API 32 (Android 12L) avec Google Play Services (gplay_32_arm). Nous avons modifié le script de lancement pour cibler cet AVD et, point crucial, remplacé le flag -packet-streamer-endpoint de default par l'adresse exacte de notre bridge.

Le résultat? Réussite! Cette fois, ça a marché! Le terminal bumble-hci-bridge a commencé à afficher des logs de connexion gRPC depuis l'émulateur peu après le lancement. Une fois l'émulateur démarré, activer le Bluetooth dans les réglages Android a provoqué une avalanche de commandes HCI (Reset, Read Version, Set Event Mask, etc.) dans le terminal du bridge. La recherche d'appareils depuis l'émulateur utilisait bien la radio Bluetooth physique du Mac via le dongle ASUS.

[deliberate] La recette gagnante: pas à pas

Voici la procédure exacte qui a fonctionné sur mon Mac Pro M1 avec un dongle externe ASUS USB-BT500:

[matter-of-fact] Installer Bumble:

(Optionnel mais recommandé) Désactiver la prise en charge USB BT native de macOS: À exécuter une seule fois, puis redémarrer.

Démarrer le bridge Bumble Netsim: Ouvrez un terminal et lancez (gardez-le ouvert):

(Vérifiez qu'il affiche >>> connected deux fois.)

Préparer le script de lancement de l'émulateur: Enregistrez le script complet fourni ci-dessous sous le nom launch_gapps_avd_api32.sh (ou similaire). Assurez-vous qu'il cible un AVD API 32 (il en créera un nommé gplay_32_arm s'il n'existe pas) et qu'il utilise explicitement -packet-streamer-endpoint localhost:8554. Rendez-le exécutable (chmod +x launch_gapps_avd_api32.sh).

Lancer le script: Ouvrez un nouveau terminal et exécutez le script:

Vérifier: Une fois l'émulateur démarré: Consultez le terminal bumble-hci-bridge pour voir le trafic gRPC et HCI. Allez dans Android Settings -> Bluetooth et activez-le. Essayez de scanner ou d'appairer un appareil.

[calm] Le script de lancement qui a réussi (API 32, endpoint Netsim explicite)

[reflective] Points clés pour Mac M1 + émulateur + Bumble

Le niveau d'API compte: Plus récent ne veut pas toujours dire meilleur pour la compatibilité de l'émulateur, surtout avec des fonctions complexes comme le bridge Bluetooth. L'API 32 semblait plus stable pour cela que l'API 34 dans mes tests. Endpoints explicites: Ne comptez pas sur -packet-streamer-endpoint default quand vous utilisez un bridge externe comme le mode contrôleur Netsim de Bumble. Pointez explicitement l'émulateur vers localhost:, là où votre bridge écoute. Bridge Netsim > socket QEMU: Le mode bridge android-netsim semble plus susceptible de fonctionner avec les émulateurs modernes que la méthode plus bas niveau -qemu -chardev socket, même si la méthode socket peut établir un lien TCP. usb:0 vs VID:PID: Sur macOS/M1, l'identification des périphériques USB peut être capricieuse. Si spécifier le VID:PID exact échoue sans raison apparente, essayez d'utiliser l'index usb:0 (en supposant que ce soit le périphérique principal/prévu). La persévérance paie: Il a fallu plusieurs tentatives, en combinant des indices venus de la documentation, de recherches web et de tests itératifs. Ne lâchez pas trop vite!

J'espère que ce partage de configuration précise et fonctionnelle fera gagner des heures de frustration à d'autres développeurs. Bon code (et bon bridging)!
