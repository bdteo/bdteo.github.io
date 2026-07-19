TL;DR: Die Huawei Watch D2 nutzt kein Standard-BLE-Pairing. Stattdessen verlangt sie einen proprietären 11-Schritte-Handshake mit eigenen GATT-Characteristics, HMAC-SHA256-Schlüsselableitung aus einem QR-Code und Verschlüsselung auf Anwendungsebene. Das ist Vendor Lock-in per Design — es zwingt dich in Huaweis Health-App. Die gute Nachricht: Die Community hat es reverse-engineered. Gadgetbridge unterstützt die Watch D2 inzwischen, und Open-Source-Implementierungen wie huawei-lpv2 existieren. Auch der EU DMA beginnt, dagegenzuhalten.

[matter-of-fact] Ich hatte Standard-Bluetooth-Pairing erwartet. Verbinden, bonden, Daten austauschen — das Übliche. Was ich stattdessen bekam, war ein proprietärer kryptografischer Handshake, dessen Reverse Engineering Wochen dauerte.

[flatly] Das passierte beim Bau von D2Explorer — meinem Projekt, um die Huawei Watch D2 ohne Huaweis Health-App mit Linux und macOS zu verbinden. Nachdem ich BlueZs Pairing-Agent-Probleme gelöst und auf die plattformübergreifende SimpleBLE-Bibliothek migriert hatte, dachte ich, der schwierige Teil sei vorbei. Der schwierige Teil hatte noch nicht angefangen.

[conversational tone] Was man erwarten würde: Standard-BLE-Pairing.

[resigned tone] So soll Bluetooth-LE-Pairing eigentlich funktionieren:

[deliberate] Nach dem Gerät über seinen beworbenen Namen scannen (z. B. "HUAWEI WATCH D2-CA0").

[matter-of-fact] Mit peripheral.connect() verbinden.

Das Betriebssystem erledigt Pairing/Bonding — PIN-Abfrage, Just Works, was auch immer die Sicherheitsstufe verlangt.

Sobald das Gerät gebondet ist, mit Standard- oder eigenen GATT-Services interagieren.

Das Betriebssystem verwaltet die Sicherheit. Deine Anwendung konzentriert sich auf Daten. Einfach.

Was tatsächlich passiert: Ein proprietärer 11-Schritte-Handshake.

Was die Watch D2 tatsächlich verlangt, ist etwas völlig anderes. Die grundlegende BLE-Verbindung ist nur die Tür. Dahinter liegt ein eigenes Authentifizierungsprotokoll auf Anwendungsebene, das Huawei auf Standard-BLE gebaut hat — was die Community Huawei Link Protocol v2 nennt.

[deliberate] Standard-BLE-Pairing-Mechanismen werden vollständig umgangen. Um dich zu authentifizieren und auf irgendeine sinnvolle Art Daten zu bekommen, musst du diese Sequenz über eigene GATT-Characteristics abarbeiten:

Connect — die grundlegende BLE-Verbindung herstellen.

Enable Notifications — sofort Notifications auf Characteristic 0000fe02-... abonnieren. Das ist timingkritisch — verpasst du das Fenster, trennt die Uhr die Verbindung.

GetLinkParams — sofort einen eigenen Command (Service ID 0x0001, Command ID 0x0001) an die Write-Characteristic 0000fe01-... senden.

Receive Server Nonce — auf eine Notification mit der zufälligen Challenge der Uhr warten.

Derive Secret Key — eine Client-Nonce erzeugen. Server-Nonce, Client-Nonce und den numerischen Wert aus dem QR-Code der Uhr kombinieren. HMAC-SHA256 ausführen (mit den Bytes des QR-Code-Werts als Schlüssel), um einen gemeinsamen secretKey_ abzuleiten.

AuthRequest — Client-Nonce und HMAC-Digest (mit dem abgeleiteten secretKey_) zurück an die Uhr senden (Service 0x0001, Command 0x0002).

Verify Server Token — den Authentifizierungstoken der Uhr empfangen. Ihn mit dem secretKey_ und den ausgetauschten Nonces verifizieren.

SetTime — aktuelle Zeit und Zeitzonen-Offset senden, mit dem secretKey_ verschlüsselt (Service 0x0002, Command 0x0003).

[deliberate] QrToken — den QR-Code-Wert zurücksenden, mit dem secretKey_ verschlüsselt (Service 0x0001, Command 0x0004).

AuthResult — eine finale Bestätigung senden, mit dem secretKey_ verschlüsselt (Service 0x0001, Command 0x0005).

[reflective] Done — erst jetzt ist die Verbindung authentifiziert.

Eigene TLV-Nachrichtenformate. CRC-Prüfungen. Service- und Command-IDs. Verschlüsselung auf Anwendungsebene. Millisekundengenaues Timing. All das passiert oberhalb des BLE-Stacks, unsichtbar für normale Bluetooth-Tools.

[flatly] Der QR-Code auf dem Bildschirm der Uhr ist das gemeinsame Geheimnis. Ohne ihn kannst du den Schlüssel nicht ableiten. Ohne den Schlüssel kannst du dich nicht authentifizieren. Ohne Authentifizierung gibt dir die Uhr nichts.

Warum Huawei das tut.

[resigned tone] Huawei könnte das als erhöhte Sicherheit darstellen. Der praktische Effekt ist Vendor Lock-in.

[conversational tone] Hohe Einstiegshürde — das Protokoll ist undokumentiert. Eine Neuimplementierung verlangt Reverse Engineering der Huawei-Health-App (13.000+ Klassen, 64.000+ Methoden ) oder die Analyse von BLE-Traffic. Das schreckt Drittanbieter-Apps aktiv ab.

Keine Interoperabilität — normale Fitness-Apps können sich nicht verbinden. Die Uhr schließt ihren Handshake nur mit Software ab, die die proprietären Schritte kennt — primär Huaweis eigene Health-App.

[flatly] Kontrolle über das Ökosystem — Nutzer werden in Huawei Health und seine Cloud-Dienste gezwungen. Später das Gerät oder die Plattform zu wechseln bedeutet, die eigene Gesundheitsdatenhistorie zu verlieren.

Weniger Nutzerwahl — du willst eine Open-Source-App nutzen? Mehr Kontrolle über die Privatsphäre deiner Gesundheitsdaten? Pech gehabt — es sei denn, jemand reverse-engineered zuerst das Protokoll.

[deadpan] Und genau das ist der Punkt: Das ist nicht einzigartig für Huawei. Das Forschungsprojekt WatchWitch dokumentiert, wie alle großen Anbieter — Apple, Samsung, Xiaomi — proprietäre BLE-Protokolle nutzen, um Ökosystem-Lock-in durchzusetzen. Die Apple Watch ist "incredibly tightly coupled with Apple's iPhone and iCloud ecosystem, using proprietary protocols that are unavailable to third parties." Es ist ein systemisches Branchenproblem.

Aber Huaweis Implementierung ist besonders aggressiv. BLE erlaubt eigene Services, klar. Aber den grundlegenden Authentifizierungsmechanismus durch einen proprietären Gatekeeper zu ersetzen, ist ein ganz anderes Spiel.

[flatly] Die Sicherheitsironie.

Die naheliegende Verteidigung lautet: "Wir tun das aus Sicherheitsgründen." Schauen wir uns das an.

[deadpan] Die BlueDoor-Schwachstellenforschung der Tsinghua University testete 16 BLE-Geräte, darunter das Honor Band 3 (dasselbe Huawei-Ökosystem), und erreichte bei den meisten davon stilles Pairing ohne Nutzerautorisierung. Das proprietäre Protokoll hat das nicht verhindert.

[matter-of-fact] Gleichzeitig wurde das Protokoll selbst mehrfach reverse-engineered — von der Gadgetbridge-Community, vom Projekt huawei-lpv2, von den Forschern, die auf der Easterhegg 2019 präsentierten, und von mir für D2Explorer. Security through obscurity mit Ablaufdatum.

[conversational tone] Die HMAC-SHA256-Schlüsselableitung aus dem QR-Code ist tatsächlich ordentliche Kryptografie. Aber darum geht es nicht. Du könntest dieselben Sicherheitseigenschaften mit Standard-BLE Secure Connections und einer Out-of-Band-Pairing-Methode erreichen (wie NFC oder QR-Code) — ohne dabei jede Drittanbieter-Anwendung auszusperren.

Die Community schlägt zurück.

Die Community hat das nicht still hingenommen.

[deliberate] Gadgetbridge.

Gadgetbridge — die Open-Source-Android-App für Wearables — unterstützt inzwischen die Huawei Watch D2. Du kannst deine Uhr ohne Huaweis Health-App pairen. Es brauchte erheblichen Reverse-Engineering-Aufwand (siehe PR #2462 ), und es gibt Einschränkungen — die EKG-Funktion ist deaktiviert, wenn die Uhr mit Gadgetbridge gekoppelt ist — aber es funktioniert.

Die Authentifizierungsimplementierung in Gadgetbridge behandelt Auth-Version 3, berechnet den Bonding-Key aus der Pairing-Nachricht (Service 0x01, Command 0x0e) und nutzt ihn zur Entschlüsselung. Eine 17-stellige Huawei-Account-ID ist für die Aushandlung des Authentifizierungsschlüssels erforderlich.

huawei-lpv2.

[reflective] Das Projekt huawei-lpv2 liefert eine reine Python-Implementierung von Huaweis Link Protocol v2. Es wird gepflegt, hat mehrere Forks und dient als Referenz für alle, die Integrationen für Huawei-Wearables außerhalb des offiziellen Ökosystems bauen.

D2Explorer.

Mein eigenes D2Explorer-Projekt ging einen anderen Weg — eine C plus plus-Implementierung mit SimpleBLE, die unter Linux und macOS funktioniert. Die Arbeit umfasste:

[resigned tone] TLV-Serialisierung/-Deserialisierung implementieren (HuaweiProtocol).

Präzise Message-Constructoren bauen (ProtocolMessageBuilder).

Die kryptografischen Schritte korrekt hinbekommen — Nonce-Erzeugung, HMAC-SHA256, XOR-Verschlüsselung (CryptoOperations, CryptoUtils).

Strikte Zustandsübergänge und Timing verwalten (HuaweiPairingProtocol, ProtocolStateManager).

[deliberate] Fehler debuggen, die durch Timing-Abweichungen im Millisekundenbereich und subtile Krypto-Fehler verursacht wurden.

D2Explorer existiert weil Huaweis Protokoll es nötig gemacht hat. Es ist der Workaround, der für grundlegende Funktionalität außerhalb des Walled Garden erforderlich ist.

AsteroidOS.

AsteroidOS 2.0 erschien im Februar 2026 als großes Update des Open-Source-Smartwatch-Betriebssystems auf Linux-Basis. Es unterstützt nun etwa 30 Geräte, darunter die Huawei Watch und Huawei Watch 2, mit Funktionen wie Always-on-Display und Tilt-to-Wake. Eine vollständige Open-Source-Alternative zu Huaweis Firmware.

[emphasized] Die regulatorische Flut.

[reflective] Die EU schaut nicht nur zu. Der Digital Markets Act (DMA) beginnt, Veränderung zu erzwingen.

Im Dezember 2025 veröffentlichte Apple iOS 26.3 mit AirPods-ähnlichem Pairing für Drittanbieter-Geräte — darunter Huawei-Smartwatches — ausdrücklich, um die DMA-Anforderungen zu erfüllen. Hintergrundsynchronisierung zwischen Huawei-Uhren und iPhones ist in Europa bereits in Betrieb.

[matter-of-fact] Der DMA schreibt vor, dass Gatekeeper Interoperabilität für verbundene Geräte bereitstellen. Das zielt direkt auf genau die Art proprietären BLE-Lock-ins, die Huawei (und Apple, und alle anderen) praktiziert haben. Der vollständige Rollout dieser Interoperabilitätsfunktionen wird im Laufe des Jahres 2026 erwartet.

[flatly] Das ist erheblich. Zum ersten Mal gibt es regulatorischen Druck, das zu standardisieren, was Anbieter absichtlich proprietär gehalten haben. Die technische Community kann Protokolle einzeln reverse-engineeren, aber Regulierung kann die Anreizstruktur für die ganze Branche verändern.

[conversational tone] Was das bedeutet.

Das Pairing-Protokoll der Huawei Watch D2 ist eine Fallstudie dafür, wie eigene Protokolle über Standard-Transportschichten Vendor Lock-in erzwingen können. Die Schichten aus proprietärer Kryptografie, eigenen Nachrichtenformaten und timingempfindlichen Handshakes existieren nicht, weil Standard-BLE keine Authentifizierung könnte — das kann es -, sondern weil proprietäre Protokolle Nutzer im Ökosystem halten.

[reflective] Das Bild verändert sich allerdings. Gadgetbridge gibt dir schon jetzt eine Alternative. Der EU DMA erzwingt Interoperabilität auf regulatorischer Ebene. Und Open-Source-Projekte wie huawei-lpv2, D2Explorer und AsteroidOS beweisen, dass die Community reverse-engineeren wird, was Anbieter einzuschließen versuchen.

[deliberate] D2Explorer zu bauen hatte weniger mit Bluetooth zu tun und mehr mit kryptografischer Detektivarbeit. Es unterstreicht etwas, das eigentlich nicht unterstrichen werden sollte: Du solltest mit der Software deiner Wahl auf deine eigenen Gesundheitsdaten zugreifen können.
