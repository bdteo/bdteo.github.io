[conversational tone] Plongée dans le protocole d'appairage BLE propriétaire de la Huawei Watch D2: une poignée de main non standard en 11 étapes avec HMAC-SHA256 et chiffrement sur mesure. Comment il enferme les utilisateurs, et comment la communauté riposte.

TL;DR: La Huawei Watch D2 n'utilise pas l'appairage BLE standard. Elle exige à la place une poignée de main propriétaire en 11 étapes, avec caractéristiques GATT sur mesure, dérivation de clé HMAC-SHA256 depuis un code QR, et chiffrement au niveau applicatif. C'est du verrouillage fournisseur par conception: cela vous force à passer par l'app Health de Huawei. La bonne nouvelle: la communauté l'a rétro-ingénierée. Gadgetbridge prend maintenant en charge la Watch D2, et des implémentations open source comme huawei-lpv2 existent. Le DMA européen commence lui aussi à pousser en sens inverse.

Je m'attendais à un appairage Bluetooth standard. Connexion, association, échange de données: l'ordinaire. À la place, j'ai trouvé une poignée de main cryptographique propriétaire qui a demandé des semaines de rétro-ingénierie.

[calm] C'est arrivé pendant la construction de D2Explorer, mon projet pour connecter la Huawei Watch D2 à Linux et macOS sans l'app Health de Huawei. Après avoir démêlé les problèmes d'agent d'appairage de BlueZ et migré vers la bibliothèque multiplateforme SimpleBLE, je pensais que le plus dur était derrière moi. Le plus dur n'avait pas commencé.

[matter-of-fact] Ce à quoi on s'attend: l'appairage BLE standard

Voici comment l'appairage Bluetooth LE est censé fonctionner:

Scanner l'appareil par son nom annoncé (par exemple, "HUAWEI WATCH D2-CA0"). Se connecter avec peripheral.connect(). Le système d'exploitation gère l'appairage/l'association: demande de PIN, Just Works, ou ce que le niveau de sécurité exige. Une fois l'association établie, interagir avec les services GATT standard ou personnalisés.

Le système gère la sécurité. Votre application se concentre sur les données. Simple.

[deliberate] Ce qui se passe vraiment: une poignée de main propriétaire en 11 étapes

Ce que la Watch D2 exige réellement est tout autre. La connexion BLE de base n'est que la porte. Derrière elle se trouve un protocole d'authentification applicatif sur mesure que Huawei a construit par-dessus le BLE standard: ce que la communauté appelle Huawei Link Protocol v2.

[deliberate] Les mécanismes d'appairage BLE standard sont complètement contournés. Pour vous authentifier et accéder à la moindre donnée utile, vous devez parcourir cette séquence via des caractéristiques GATT personnalisées:

Connect -- établir le lien BLE de base. Enable Notifications -- s'abonner immédiatement aux notifications sur la caractéristique 0000fe02-.... Le timing est critique: ratez la fenêtre et la montre vous déconnecte. GetLinkParams -- envoyer immédiatement une commande personnalisée (Service ID 0x0001, Command ID 0x0001) à la caractéristique d'écriture 0000fe01-.... Receive Server Nonce -- attendre une notification contenant le défi aléatoire de la montre. Derive Secret Key -- générer un nonce client. Combiner le nonce serveur, le nonce client, et la valeur numérique du code QR affiché par la montre. Exécuter HMAC-SHA256 (en utilisant les octets de la valeur du code QR comme clé) pour dériver une secretKey_ partagée. AuthRequest -- renvoyer à la montre le nonce client et un digest HMAC (en utilisant la secretKey_ dérivée) (Service 0x0001, Command 0x0002). Verify Server Token -- recevoir le jeton d'authentification de la montre. Le vérifier avec la secretKey_ et les nonces échangés. SetTime -- envoyer l'heure actuelle et le décalage de fuseau horaire, chiffrés avec la secretKey_ (Service 0x0002, Command 0x0003). QrToken -- renvoyer la valeur du code QR, chiffrée avec la secretKey_ (Service 0x0001, Command 0x0004). AuthResult -- envoyer une confirmation finale, chiffrée avec la secretKey_ (Service 0x0001, Command 0x0005). Done -- c'est seulement maintenant que la connexion est authentifiée.

Formats de messages TLV personnalisés. Contrôles CRC. IDs de service et de commande. Chiffrement applicatif. Timing sensible à la milliseconde. Tout cela se passe au-dessus de la pile BLE, invisible pour les outils Bluetooth standard.

Le code QR sur l'écran de la montre est le secret partagé. Sans lui, vous ne pouvez pas dériver la clé. Sans la clé, vous ne pouvez pas vous authentifier. Sans authentification, la montre ne vous donne rien.

[calm] Pourquoi Huawei fait cela

Huawei pourrait présenter cela comme une sécurité renforcée. L'effet pratique est le verrouillage fournisseur.

Barrière d'entrée élevée -- le protocole n'est pas documenté. Le réimplémenter demande de rétro-ingénierer l'app Huawei Health (plus de 13 000 classes, plus de 64 000 méthodes ) ou d'analyser le trafic BLE. Cela décourage activement les applications tierces. Aucune interopérabilité -- les applications de fitness standard ne peuvent pas se connecter. La montre ne termine sa poignée de main qu'avec un logiciel qui connaît les étapes propriétaires, principalement l'app Health de Huawei. Contrôle de l'écosystème -- les utilisateurs sont forcés d'entrer dans Huawei Health et ses services cloud. Changer d'appareil ou de plateforme plus tard signifie perdre l'historique de vos données de santé. Choix utilisateur réduit -- vous voulez utiliser une app open source? Vous voulez plus de contrôle sur la confidentialité de vos données de santé? Dommage, à moins que quelqu'un ne rétro-ingénie d'abord le protocole.

[matter-of-fact] Et voici le point important: ce n'est pas propre à Huawei. Le projet de recherche WatchWitch documente comment tous les grands fournisseurs, Apple, Samsung, Xiaomi, utilisent des protocoles BLE propriétaires pour imposer le verrouillage d'écosystème. L'Apple Watch est "incredibly tightly coupled with Apple's iPhone and iCloud ecosystem, using proprietary protocols that are unavailable to third parties." C'est un problème systémique de l'industrie.

Mais l'implémentation de Huawei est particulièrement agressive. BLE permet des services personnalisés, bien sûr. Mais remplacer le mécanisme d'authentification fondamental par un gardien propriétaire, c'est un autre jeu.

[reflective] L'ironie de la sécurité

La défense évidente est: "nous faisons cela pour la sécurité." Examinons-la.

La recherche BlueDoor de l'université Tsinghua a testé 16 appareils BLE, dont le Honor Band 3 (même écosystème Huawei), et a réussi un appairage silencieux sans autorisation utilisateur sur la plupart d'entre eux. Le protocole propriétaire ne l'a pas empêché.

Pendant ce temps, le protocole lui-même a été rétro-ingénieré plusieurs fois: par la communauté Gadgetbridge, par le projet huawei-lpv2, par les chercheurs qui ont présenté leurs travaux à Easterhegg 2019, et par moi pour D2Explorer. De la sécurité par l'obscurité, avec une date d'expiration.

La dérivation de clé HMAC-SHA256 depuis le code QR est en fait une cryptographie correcte. Mais ce n'est pas le sujet. On pourrait obtenir les mêmes propriétés de sécurité avec BLE Secure Connections standard et une méthode d'appairage hors bande (comme NFC ou un code QR), sans exclure toutes les applications tierces au passage.

[matter-of-fact] La communauté riposte

La communauté n'a pas accepté cela en silence.

[deliberate] Gadgetbridge

Gadgetbridge, l'application Android open source pour objets connectés, prend maintenant en charge la Huawei Watch D2. Vous pouvez appairer votre montre sans l'app Health de Huawei. Il a fallu un effort considérable de rétro-ingénierie (voir la PR #2462 ), et il reste des limites: la fonctionnalité ECG est désactivée lorsque la montre est appairée avec Gadgetbridge. Mais cela fonctionne.

L'implémentation d'authentification dans Gadgetbridge gère la version d'auth 3, calcule la clé d'association depuis le message d'appairage (service 0x01, commande 0x0e) et l'utilise pour le déchiffrement. Un identifiant de compte Huawei à 17 chiffres est nécessaire pour la négociation de la clé d'authentification.

[calm] huawei-lpv2

Le projet huawei-lpv2 fournit une implémentation pure Python du Huawei Link Protocol v2. Il est maintenu, possède plusieurs forks, et sert de référence à quiconque construit des intégrations avec des wearables Huawei en dehors de l'écosystème officiel.

[reflective] D2Explorer

Mon propre projet D2Explorer a pris une autre voie: construire une implémentation C++ avec SimpleBLE qui fonctionne sous Linux et macOS. Le travail a impliqué:

Implémenter la sérialisation/désérialisation TLV (HuaweiProtocol). Construire des messages précis (ProtocolMessageBuilder). Réussir les étapes cryptographiques: génération de nonce, HMAC-SHA256, chiffrement XOR (CryptoOperations, CryptoUtils). Gérer des transitions d'état et un timing stricts (HuaweiPairingProtocol, ProtocolStateManager). Déboguer des échecs causés par des décalages de timing à l'échelle de la milliseconde et des erreurs crypto subtiles.

D2Explorer existe parce que le protocole de Huawei l'a rendu nécessaire. C'est le contournement requis pour une fonctionnalité de base hors du jardin clos.

[matter-of-fact] AsteroidOS

AsteroidOS 2.0 a été lancé en février 2026 comme mise à jour majeure de l'OS de smartwatch open source basé sur Linux. Il prend maintenant en charge environ 30 appareils, dont la Huawei Watch et la Huawei Watch 2, avec des fonctionnalités comme l'affichage always-on et Tilt-to-Wake. Une vraie alternative open source au firmware de Huawei.

[deliberate] La marée réglementaire

[deliberate] L'UE ne se contente pas de regarder. Le Digital Markets Act (DMA) commence à forcer le changement.

En décembre 2025, Apple a publié iOS 26.3 avec un appairage façon AirPods pour les appareils tiers, y compris les montres connectées Huawei, précisément pour se conformer aux exigences du DMA. La synchronisation en arrière-plan entre les montres Huawei et les iPhones est déjà opérationnelle en Europe.

Le DMA impose aux gatekeepers de fournir l'interopérabilité pour les appareils connectés. Cela cible directement le type de verrouillage BLE propriétaire que Huawei (et Apple, et tous les autres) pratiquent depuis des années. Le déploiement complet de ces fonctionnalités d'interopérabilité est attendu tout au long de 2026.

C'est important. Pour la première fois, une pression réglementaire pousse à standardiser ce que les fournisseurs ont délibérément gardé propriétaire. La communauté technique peut rétro-ingénierer les protocoles un par un, mais la régulation peut changer la structure d'incitation de toute l'industrie.

[calm] Ce que cela signifie

Le protocole d'appairage de la Huawei Watch D2 est une étude de cas sur la manière dont des protocoles personnalisés sur des transports standard peuvent imposer un verrouillage fournisseur. Les couches de cryptographie propriétaire, les formats de message sur mesure et les poignées de main sensibles au timing existent non pas parce que le BLE standard ne sait pas gérer l'authentification, il le sait, mais parce que les protocoles propriétaires gardent les utilisateurs à l'intérieur de l'écosystème.

Le tableau change pourtant. Gadgetbridge vous donne une alternative dès maintenant. Le DMA européen force l'interopérabilité au niveau réglementaire. Et les projets open source comme huawei-lpv2, D2Explorer et AsteroidOS prouvent que la communauté rétro-ingénierera ce que les fournisseurs essaient de verrouiller.

[matter-of-fact] Construire D2Explorer relevait moins du Bluetooth que de l'enquête cryptographique. Cela souligne quelque chose qui ne devrait pas avoir besoin d'être souligné: vous devriez pouvoir accéder à vos propres données de santé avec le logiciel de votre choix.
