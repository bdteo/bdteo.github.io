---
lang: "de"
translationOf: "huawei-watch-d2-proprietary-protocol-vendor-lockin"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "5f8c1e1999d0201a"
title: "Huawei Watch D2 BLE-Pairing: Protokoll- und Vendor-Lock-in-Fall"
date: "2025-04-11"
slug: "huawei-watch-d2-proprietary-protocol-vendor-lockin"
author: "Boris Teoharov"
description: "Ein Deep Dive in das proprietäre BLE-Pairing-Protokoll der Huawei Watch D2 - ein nicht standardisierter 11-Schritte-Handshake mit HMAC-SHA256 und eigener Verschlüsselung. Wie er Nutzer einsperrt, und wie die Community sich wehrt."
featuredImage: "./images/featured.jpg"
tags: ["Huawei", "WatchD2", "BluetoothLE", "BLE", "Pairing", "Authentication", "ReverseEngineering", "VendorLockIn", "ProprietaryProtocol", "D2Explorer", "SimpleBLE", "Crypto", "Gadgetbridge", "EU-DMA"]
imageCaption: "Ein ruhiger Kanarienvogel sitzt in einem kunstvollen Messingkäfig, von einem Fenster im Gegenlicht beleuchtet."
audioUrl: "/audio/articles/huawei-watch-d2-proprietary-protocol-vendor-lockin/de/LTo9oDjTW1FdEgMfiXWQ-0506d6f600e4.m4a"
audioDuration: "16:41"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/huawei-watch-d2-proprietary-protocol-vendor-lockin.de.md"
---

> **TL;DR:** Die Huawei Watch D2 nutzt kein Standard-BLE-Pairing. Stattdessen verlangt sie einen proprietären 11-Schritte-Handshake mit eigenen GATT-Characteristics, HMAC-SHA256-Schlüsselableitung aus einem QR-Code und Verschlüsselung auf Anwendungsebene. Das ist Vendor Lock-in per Design - es zwingt dich in Huaweis Health-App. Die gute Nachricht: Die Community hat es reverse-engineered. Gadgetbridge unterstützt die Watch D2 inzwischen, und Open-Source-Implementierungen wie `huawei-lpv2` existieren. Auch der EU DMA beginnt, dagegenzuhalten.

Ich hatte Standard-Bluetooth-Pairing erwartet. Verbinden, bonden, Daten austauschen - das Übliche. Was ich stattdessen bekam, war ein proprietärer kryptografischer Handshake, dessen Reverse Engineering Wochen dauerte.

Das passierte beim Bau von D2Explorer - meinem Projekt, um die Huawei Watch D2 ohne Huaweis Health-App mit Linux und macOS zu verbinden. Nachdem ich [BlueZs Pairing-Agent-Probleme gelöst](/bluez-pairing-python-agent-workaround-authentication-failed/) und auf die plattformübergreifende SimpleBLE-Bibliothek migriert hatte, dachte ich, der schwierige Teil sei vorbei. Der schwierige Teil hatte noch nicht angefangen.

## Was man erwarten würde: Standard-BLE-Pairing

So soll Bluetooth-LE-Pairing *eigentlich* funktionieren:

1. Nach dem Gerät über seinen beworbenen Namen scannen (z. B. "HUAWEI WATCH D2-CA0").
2. Mit `peripheral.connect()` verbinden.
3. Das Betriebssystem erledigt Pairing/Bonding - PIN-Abfrage, Just Works, was auch immer die Sicherheitsstufe verlangt.
4. Sobald das Gerät gebondet ist, mit Standard- oder eigenen GATT-Services interagieren.

Das Betriebssystem verwaltet die Sicherheit. Deine Anwendung konzentriert sich auf Daten. Einfach.

## Was tatsächlich passiert: Ein proprietärer 11-Schritte-Handshake

Was die Watch D2 tatsächlich verlangt, ist etwas völlig anderes. Die grundlegende BLE-Verbindung ist nur die Tür. Dahinter liegt ein eigenes Authentifizierungsprotokoll auf Anwendungsebene, das Huawei auf Standard-BLE gebaut hat - was die Community **Huawei Link Protocol v2** nennt <small><a href="#ref1">[1]</a></small>.

Standard-BLE-Pairing-Mechanismen werden vollständig umgangen. Um dich zu authentifizieren und auf irgendeine sinnvolle Art Daten zu bekommen, musst du diese Sequenz über eigene GATT-Characteristics abarbeiten:

1.  **Connect** - die grundlegende BLE-Verbindung herstellen.
2.  **Enable Notifications** - *sofort* Notifications auf Characteristic `0000fe02-...` abonnieren. Das ist timingkritisch - verpasst du das Fenster, trennt die Uhr die Verbindung.
3.  **GetLinkParams** - *sofort* einen eigenen Command (Service ID `0x0001`, Command ID `0x0001`) an die Write-Characteristic `0000fe01-...` senden.
4.  **Receive Server Nonce** - auf eine Notification mit der zufälligen Challenge der Uhr warten.
5.  **Derive Secret Key** - eine Client-Nonce erzeugen. Server-Nonce, Client-Nonce und den **numerischen Wert aus dem QR-Code der Uhr** kombinieren. HMAC-SHA256 ausführen (mit den Bytes des QR-Code-Werts als Schlüssel), um einen gemeinsamen `secretKey_` abzuleiten.
6.  **AuthRequest** - Client-Nonce und HMAC-Digest (mit dem abgeleiteten `secretKey_`) zurück an die Uhr senden (Service `0x0001`, Command `0x0002`).
7.  **Verify Server Token** - den Authentifizierungstoken der Uhr empfangen. Ihn mit dem `secretKey_` und den ausgetauschten Nonces verifizieren.
8.  **SetTime** - aktuelle Zeit und Zeitzonen-Offset senden, mit dem `secretKey_` *verschlüsselt* (Service `0x0002`, Command `0x0003`).
9.  **QrToken** - den QR-Code-Wert zurücksenden, mit dem `secretKey_` *verschlüsselt* (Service `0x0001`, Command `0x0004`).
10. **AuthResult** - eine finale Bestätigung senden, mit dem `secretKey_` *verschlüsselt* (Service `0x0001`, Command `0x0005`).
11. **Done** - erst jetzt ist die Verbindung authentifiziert.

Eigene TLV-Nachrichtenformate. CRC-Prüfungen. Service- und Command-IDs. Verschlüsselung auf Anwendungsebene. Millisekundengenaues Timing. All das passiert *oberhalb* des BLE-Stacks, unsichtbar für normale Bluetooth-Tools.

Der QR-Code auf dem Bildschirm der Uhr ist das gemeinsame Geheimnis. Ohne ihn kannst du den Schlüssel nicht ableiten. Ohne den Schlüssel kannst du dich nicht authentifizieren. Ohne Authentifizierung gibt dir die Uhr nichts.

## Warum Huawei das tut

Huawei könnte das als erhöhte Sicherheit darstellen. Der praktische Effekt ist **Vendor Lock-in**.

*   **Hohe Einstiegshürde** - das Protokoll ist undokumentiert. Eine Neuimplementierung verlangt Reverse Engineering der Huawei-Health-App (13.000+ Klassen, 64.000+ Methoden <small><a href="#ref2">[2]</a></small>) oder die Analyse von BLE-Traffic. Das schreckt Drittanbieter-Apps aktiv ab.
*   **Keine Interoperabilität** - normale Fitness-Apps können sich nicht verbinden. Die Uhr schließt ihren Handshake nur mit Software ab, die die proprietären Schritte kennt - primär Huaweis eigene Health-App.
*   **Kontrolle über das Ökosystem** - Nutzer werden in Huawei Health und seine Cloud-Dienste gezwungen. Später das Gerät oder die Plattform zu wechseln bedeutet, die eigene Gesundheitsdatenhistorie zu verlieren.
*   **Weniger Nutzerwahl** - du willst eine Open-Source-App nutzen? Mehr Kontrolle über die Privatsphäre deiner Gesundheitsdaten? Pech gehabt - es sei denn, jemand reverse-engineered zuerst das Protokoll.

Und genau das ist der Punkt: **Das ist nicht einzigartig für Huawei**. Das Forschungsprojekt WatchWitch <small><a href="#ref3">[3]</a></small> dokumentiert, wie alle großen Anbieter - Apple, Samsung, Xiaomi - proprietäre BLE-Protokolle nutzen, um Ökosystem-Lock-in durchzusetzen. Die Apple Watch ist "incredibly tightly coupled with Apple's iPhone and iCloud ecosystem, using proprietary protocols that are unavailable to third parties." Es ist ein systemisches Branchenproblem.

Aber Huaweis Implementierung ist besonders aggressiv. BLE *erlaubt* eigene Services, klar. Aber den grundlegenden Authentifizierungsmechanismus durch einen proprietären Gatekeeper zu ersetzen, ist ein ganz anderes Spiel.

## Die Sicherheitsironie

Die naheliegende Verteidigung lautet: "Wir tun das aus Sicherheitsgründen." Schauen wir uns das an.

Die BlueDoor-Schwachstellenforschung der Tsinghua University <small><a href="#ref4">[4]</a></small> testete 16 BLE-Geräte, darunter das Honor Band 3 (dasselbe Huawei-Ökosystem), und erreichte bei den meisten davon **stilles Pairing ohne Nutzerautorisierung**. Das proprietäre Protokoll hat das nicht verhindert.

Gleichzeitig wurde das Protokoll selbst mehrfach reverse-engineered - von der Gadgetbridge-Community, vom Projekt `huawei-lpv2`, von den Forschern, die auf der Easterhegg 2019 präsentierten <small><a href="#ref2">[2]</a></small>, und von mir für D2Explorer. Security through obscurity mit Ablaufdatum.

Die HMAC-SHA256-Schlüsselableitung aus dem QR-Code ist tatsächlich ordentliche Kryptografie. Aber darum geht es nicht. Du könntest dieselben Sicherheitseigenschaften mit Standard-BLE Secure Connections und einer Out-of-Band-Pairing-Methode erreichen (wie NFC oder QR-Code) - ohne dabei jede Drittanbieter-Anwendung auszusperren.

## Die Community schlägt zurück

Die Community hat das nicht still hingenommen.

### Gadgetbridge

[Gadgetbridge](https://gadgetbridge.org/) - die Open-Source-Android-App für Wearables - unterstützt inzwischen die Huawei Watch D2 <small><a href="#ref5">[5]</a></small>. Du kannst deine Uhr ohne Huaweis Health-App pairen. Es brauchte erheblichen Reverse-Engineering-Aufwand (siehe PR #2462 <small><a href="#ref6">[6]</a></small>), und es gibt Einschränkungen - die EKG-Funktion ist deaktiviert, wenn die Uhr mit Gadgetbridge gekoppelt ist <small><a href="#ref7">[7]</a></small> - aber es funktioniert.

Die Authentifizierungsimplementierung in Gadgetbridge behandelt Auth-Version 3, berechnet den Bonding-Key aus der Pairing-Nachricht (Service `0x01`, Command `0x0e`) und nutzt ihn zur Entschlüsselung. Eine 17-stellige Huawei-Account-ID ist für die Aushandlung des Authentifizierungsschlüssels erforderlich.

### huawei-lpv2

Das Projekt [`huawei-lpv2`](https://github.com/zyv/huawei-lpv2) liefert eine reine Python-Implementierung von Huaweis Link Protocol v2 <small><a href="#ref8">[8]</a></small>. Es wird gepflegt, hat mehrere Forks und dient als Referenz für alle, die Integrationen für Huawei-Wearables außerhalb des offiziellen Ökosystems bauen.

### D2Explorer

Mein eigenes D2Explorer-Projekt ging einen anderen Weg - eine C++-Implementierung mit SimpleBLE, die unter Linux und macOS funktioniert. Die Arbeit umfasste:

*   TLV-Serialisierung/-Deserialisierung implementieren (`HuaweiProtocol`).
*   Präzise Message-Constructoren bauen (`ProtocolMessageBuilder`).
*   Die kryptografischen Schritte korrekt hinbekommen - Nonce-Erzeugung, HMAC-SHA256, XOR-Verschlüsselung (`CryptoOperations`, `CryptoUtils`).
*   Strikte Zustandsübergänge und Timing verwalten (`HuaweiPairingProtocol`, `ProtocolStateManager`).
*   Fehler debuggen, die durch Timing-Abweichungen im Millisekundenbereich und subtile Krypto-Fehler verursacht wurden.

D2Explorer existiert *weil* Huaweis Protokoll es nötig gemacht hat. Es ist der Workaround, der für grundlegende Funktionalität außerhalb des Walled Garden erforderlich ist.

### AsteroidOS

[AsteroidOS 2.0](https://asteroidos.org/) erschien im Februar 2026 als großes Update des Open-Source-Smartwatch-Betriebssystems auf Linux-Basis <small><a href="#ref9">[9]</a></small>. Es unterstützt nun etwa 30 Geräte, darunter die Huawei Watch und Huawei Watch 2, mit Funktionen wie Always-on-Display und Tilt-to-Wake. Eine vollständige Open-Source-Alternative zu Huaweis Firmware.

## Die regulatorische Flut

Die EU schaut nicht nur zu. Der Digital Markets Act (DMA) beginnt, Veränderung zu erzwingen <small><a href="#ref10">[10]</a></small>.

Im Dezember 2025 veröffentlichte Apple iOS 26.3 mit AirPods-ähnlichem Pairing für Drittanbieter-Geräte - darunter Huawei-Smartwatches - ausdrücklich, um die DMA-Anforderungen zu erfüllen <small><a href="#ref11">[11]</a></small>. Hintergrundsynchronisierung zwischen Huawei-Uhren und iPhones ist in Europa bereits in Betrieb.

Der DMA schreibt vor, dass Gatekeeper Interoperabilität für verbundene Geräte bereitstellen. Das zielt direkt auf genau die Art proprietären BLE-Lock-ins, die Huawei (und Apple, und alle anderen) praktiziert haben. Der vollständige Rollout dieser Interoperabilitätsfunktionen wird im Laufe des Jahres 2026 erwartet.

Das ist erheblich. Zum ersten Mal gibt es regulatorischen Druck, das zu standardisieren, was Anbieter absichtlich proprietär gehalten haben. Die technische Community kann Protokolle einzeln reverse-engineeren, aber Regulierung kann die Anreizstruktur für die ganze Branche verändern.

## Was das bedeutet

Das Pairing-Protokoll der Huawei Watch D2 ist eine Fallstudie dafür, wie eigene Protokolle über Standard-Transportschichten Vendor Lock-in erzwingen können. Die Schichten aus proprietärer Kryptografie, eigenen Nachrichtenformaten und timingempfindlichen Handshakes existieren nicht, weil Standard-BLE keine Authentifizierung könnte - das kann es -, sondern weil proprietäre Protokolle Nutzer im Ökosystem halten.

Das Bild verändert sich allerdings. Gadgetbridge gibt dir schon jetzt eine Alternative. Der EU DMA erzwingt Interoperabilität auf regulatorischer Ebene. Und Open-Source-Projekte wie `huawei-lpv2`, D2Explorer und AsteroidOS beweisen, dass die Community reverse-engineeren wird, was Anbieter einzuschließen versuchen.

D2Explorer zu bauen hatte weniger mit Bluetooth zu tun und mehr mit kryptografischer Detektivarbeit. Es unterstreicht etwas, das eigentlich nicht unterstrichen werden sollte: Du solltest mit der Software deiner Wahl auf deine eigenen Gesundheitsdaten zugreifen können.

---

### Referenzen

<a id="ref1"></a>1. [huawei-lpv2: Pure Python implementation of Huawei BLE Link Protocol v2](https://github.com/zyv/huawei-lpv2) - *Open-Source-Referenzimplementierung des Protokolls.*<br>
<a id="ref2"></a>2. [All Your Fitness Data Belongs to You: Reverse Engineering the Huawei Health Android App](https://media.ccc.de/v/eh19-186-all-your-fitness-data-belongs-to-you-reverse-engineering-the-huawei-health-android-app) - *Easterhegg-2019-Konferenzvortrag, der den Reverse-Engineering-Aufwand dokumentiert. [Folien (PDF)](https://www.sba-research.org/wp-content/uploads/2019/04/easterhegg19.pdf).*<br>
<a id="ref3"></a>3. [WatchWitch: Academic Research on Smartwatch Interoperability](https://arxiv.org/html/2507.07210v1) - *Dokumentiert, wie alle großen Anbieter proprietäre Protokolle für Ökosystem-Lock-in nutzen.*<br>
<a id="ref4"></a>4. [BlueDoor: Breaking the Secure Information Flow via BLE Vulnerability (Tsinghua University)](https://tns.thss.tsinghua.edu.cn/~jiliang/publications/MOBISYS2020_BlueDoor.pdf) - *Fand stille Pairing-Schwachstellen in 16 BLE-Geräten, darunter Honor Band 3.*<br>
<a id="ref5"></a>5. [Gadgetbridge: Huawei/Honor Device Support](https://gadgetbridge.org/basics/topics/huawei-honor/) - *Offizielle Support-Seite für Huawei- und Honor-Wearables.*<br>
<a id="ref6"></a>6. [Gadgetbridge PR #2462: Initial Huawei/Honor Support](https://codeberg.org/Freeyourgadget/Gadgetbridge/pulls/2462) - *Der Pull Request, der Huawei-Geräteunterstützung zu Gadgetbridge hinzufügte.*<br>
<a id="ref7"></a>7. [Gadgetbridge Issue #4918: ECG Disabled with Gadgetbridge](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/4918) - *Bekannte Einschränkung bei der Nutzung von Gadgetbridge statt Huawei Health.*<br>
<a id="ref8"></a>8. [Gadgetbridge: Huawei/Honor Pairing Guide](https://gadgetbridge.org/basics/pairing/huawei-honor-pairing/) - *Schritt-für-Schritt-Pairing-Anleitung für Huawei-Geräte.*<br>
<a id="ref9"></a>9. [AsteroidOS 2.0 Release](https://www.cnx-software.com/2026/02/18/asteroidos-2-0-open-source-smartwatch-os-released-now-supports-around-30-devices/) - *Open-Source-Smartwatch-Betriebssystem, das nun etwa 30 Geräte unterstützt, darunter Huawei-Uhren.*<br>
<a id="ref10"></a>10. [EU Digital Markets Act: Interoperability Requirements](https://digital-markets-act.ec.europa.eu/questions-and-answers/interoperability_en) - *DMA-Bestimmungen, die Interoperabilität für verbundene Geräte vorschreiben.*<br>
<a id="ref11"></a>11. [iOS 26.3 DMA Features: Third-Party Smartwatch Pairing](https://www.macrumors.com/2025/12/22/ios-26-3-dma-airpods-pairing/) - *Apples Umsetzung der EU-Interoperabilitätsvorgaben für Wearables.*

---

### Verwandte Beiträge

- [BlueZ Pairing Fix: External Python Agent & D-Bus Polling](/bluez-pairing-python-agent-workaround-authentication-failed/) - der Vorläufer dieser Untersuchung. Bevor wir Huaweis proprietäres Protokoll angehen konnten, mussten wir BlueZs `AuthenticationFailed`-Fehler beim Standard-BLE-Pairing beheben.
- [Fix Android Emulator Bluetooth on M1 Mac using Bumble & API 32](/m1-mac-android-emulator-bluetooth-passthrough-bumble/) - ein weiterer BLE-Integrationskampf, diesmal beim Durchreichen des physischen Bluetooth-Funks eines Macs in den Android Emulator.
