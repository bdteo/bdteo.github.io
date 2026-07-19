[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

[conversational tone] Wenn du als Entwickler auf einem M1/M2/M3-Mac mit Bluetooth arbeitest und versuchst, die Bluetooth-Funkeinheit deines Host-Rechners im Android Emulator nutzbar zu machen, hast du vermutlich schon etwas gelitten. Was eigentlich unkompliziert wirken sollte, wird oft zu einem frustrierenden Kaninchenbau aus fehlgeschlagenen Verbindungen, kryptischen Fehlern und Dokumentations-Sackgassen. Ich bin genau durch diesen Kampf gegangen, und nach mehreren Mauern habe ich endlich eine Kombination mit dem Python-Bluetooth-Stack Bumble gefunden, die tatsächlich funktioniert.

[reflective] Das ist nicht noch eine theoretische Anleitung; es ist der Schritt-für-Schritt-Bericht darüber, was gescheitert ist und, wichtiger, was funktioniert hat, um das Bluetooth meines M1 Mac Pro (in meinem Fall über einen externen USB-Dongle, auch wenn das Prinzip vielleicht auch für interne Funkmodule gilt) mit einem Android-12L-Emulator (API 32) zu verbinden.

[matter-of-fact] Das Ziel: Echtes Bluetooth im Emulator.

[matter-of-fact] Das Ziel war simpel: Der Android Emulator sollte den physischen Bluetooth-Controller meines Macs verwenden, statt seines eigenen eingeschränkten virtuellen Controllers. Das ist entscheidend, wenn man Apps testet, die mit echten Bluetooth-Geräten interagieren.

Das Werkzeug: Bumble betritt die Bühne.

[deliberate] Bumble ist ein mächtiger Python-Bluetooth-Stack. Das zentrale Werkzeug für diese Aufgabe ist bumble-hci-bridge, das sich auf der einen Seite mit einem physischen HCI (Host Controller Interface) verbinden und es auf der anderen Seite über verschiedene Transportschichten (wie TCP oder gRPC) bereitstellen kann.

Versuch #1: Die QEMU-Socket-Methode (der logische erste Versuch).

[matter-of-fact] Ausgehend von allgemeinem QEMU-Wissen und ein paar älteren Anleitungen bestand der erste Ansatz darin, Emulator-Flags zu verwenden, um einen virtuellen seriellen Port (hinterlegt durch einen TCP-Socket) direkt mit der HCI-Bridge zu verbinden.

[deliberate] Bridge starten (TCP-Server-Modus): Wir verbanden Bumble mit dem physischen Dongle (der auf meiner Maschine überraschenderweise mit usb:0 besser funktionierte als mit seiner konkreten VID:PID usb:0b05:17cb — M1-Eigenheiten!) und ließen es auf einem TCP-Port lauschen.

Emulator mit QEMU-Flags starten: Wir passten das Emulator-Startskript an (anfangs mit Ziel API 34), um -qemu-Flags hinzuzufügen, die einen virtuellen seriellen Port (virtserialport) auf ein Zeichengerät (chardev) leiteten, das von einem TCP-Socket zur Bridge hinterlegt war.

[resigned tone] Das Ergebnis? Teilerfolg, am Ende Fehlschlag: Mit lsof konnten wir sehen, dass der QEMU-Prozess des Emulators tatsächlich eine TCP-Verbindung zur Bumble-Bridge aufbaute. Allerdings schickte der Android-Bluetooth-Stack im Inneren des Emulators nie echte HCI-Kommandos darüber. Bluetooth in den Android-Einstellungen umzuschalten bewirkte nichts. Die Bridge-Logs blieben nach der initialen Verbindung stumm. Sackgasse.

Versuch #2: Die Standard-Netsim-Bridge (nach Bumble-Dokumentation).

[flatly] Die Bumble-Dokumentation erwähnt eine Bridge zur "Netsim"-gRPC-Schnittstelle des Emulators. Netsim (und sein Kern, Root Canal) ist das neuere virtuelle Bluetooth-Controller-System des Emulators.

[matter-of-fact] Bridge starten (Netsim-Controller-Modus): Wir konfigurierten die Bridge so, dass sie als Netsim-Controller arbeitet, auf dem standardmäßigen gRPC-Port (8554) lauscht und sich mit dem physischen Dongle verbindet.

Emulator starten (Standard-Backend): Wir setzten das Startskript zurück (immer noch mit API 34), entfernten die -qemu-Flags und fügten -packet-streamer-endpoint default hinzu, damit er sicher das Netsim-Backend zu verwenden versucht.

[resigned tone] Das Ergebnis? Keine Verbindung: Diesmal startete der Emulator, aber die Bumble-Bridge zeigte keinerlei Anzeichen einer eingehenden gRPC-Verbindung vom Emulator. Die Emulator-Logs zeigten keine offensichtlichen Verbindungsfehler, aber Bluetooth blieb unbrauchbar. Noch eine Sackgasse.

[flatly] Versuch #3: API-Downgrade + expliziter Netsim-Endpunkt (der Gewinner!).

[emphasized] Websuchen zeigten allgemeine Berichte über Instabilität bei Bluetooth auf API-33/34-Emulatoren und mögliche Probleme damit, wie der Emulator das Netsim-Backend entdeckt oder sich damit verbindet, besonders wenn ein externes Werkzeug versucht, es abzufangen. Der Schlüssel schien zu sein, dem Emulator explizit zu sagen, wo der Netsim-gRPC-Server liegt, und eine ältere API-Version zu versuchen.

Bridge starten (Netsim-Controller-Modus, expliziter Port, usb:0): Wie in Versuch #2, mit der Sicherstellung, dass sie auf einem bekannten Port (8554) lauscht und sich über den Index (usb:0), der zuverlässig funktionierte, mit dem physischen Dongle verbindet.

[deliberate] Emulator anpassen und starten (API 32, expliziter Endpunkt): Wir erstellten ein API-32-AVD (Android 12L) mit Google Play Services (gplay_32_arm). Wir passten das Startskript an, damit es dieses AVD verwendet, und, entscheidend, änderten das Flag -packet-streamer-endpoint von default zur exakten Adresse unserer Bridge.

[matter-of-fact] Das Ergebnis? Erfolg! Diesmal funktionierte es!

[emphasized] Das bumble-hci-bridge-Terminal begann kurz nach dem Start, gRPC-Verbindungslogs vom Emulator anzuzeigen.

[matter-of-fact] Sobald der Emulator gebootet war, führte das Einschalten von Bluetooth in den Android-Einstellungen zu einer Flut von HCI-Kommandos (Reset, Read Version, Set Event Mask usw.) im Bridge-Terminal.

Die Suche nach Geräten innerhalb des Emulators nutzte erfolgreich die physische Bluetooth-Funkeinheit des Macs über den ASUS-Dongle!

[deliberate] Das funktionierende Rezept: Schritt für Schritt.

Hier ist das genaue Vorgehen, das auf meinem M1 Mac Pro mit einem externen ASUS-USB-BT500-Dongle funktioniert hat:

Bumble installieren:

(Optional, aber empfohlen) Natives macOS-USB-Bluetooth-Handling deaktivieren: Einmal ausführen und neu starten.

[deliberate] Bumble-Netsim-Bridge starten: Öffne ein Terminal und führe aus (laufen lassen):

(Prüfen, dass zweimal >>> connected angezeigt wird.).

Emulator-Startskript vorbereiten: Speichere das unten angegebene vollständige Skript als launch_gapps_avd_api32.sh (oder ähnlich). Achte darauf, dass es ein API-32-AVD verwendet (es erstellt eines namens gplay_32_arm, falls es nicht existiert) und explizit -packet-streamer-endpoint localhost:8554 nutzt. Mach es ausführbar (chmod +x launch_gapps_avd_api32.sh).

[matter-of-fact] Startskript ausführen: Öffne ein neues Terminal und führe das Skript aus:

Verifizieren: Sobald der Emulator gebootet ist:

Prüfe das bumble-hci-bridge-Terminal auf gRPC- und HCI-Traffic.

[slows down] Gehe zu Android Settings -> Bluetooth und schalte es ein.

[emphasized] Versuche zu scannen oder zu koppeln.

[deliberate] Das erfolgreiche Startskript (API 32, expliziter Netsim-Endpunkt).

[deliberate] Zentrale Erkenntnisse für M1-Mac + Emulator + Bumble.

API-Level zählt: Neuer ist für Emulator-Kompatibilität nicht immer besser, besonders bei komplexen Funktionen wie Bluetooth-Bridging. API 32 wirkte in meinen Tests dafür stabiler als API 34.

[matter-of-fact] Explizite Endpunkte: Verlass dich nicht auf -packet-streamer-endpoint default, wenn du eine externe Bridge wie Bumbles Netsim-Controller-Modus verwendest. Zeige dem Emulator explizit auf localhost:, wo deine Bridge lauscht.

[deliberate] Netsim-Bridge ist besser als QEMU-Socket: Der android-netsim-Bridge-Modus scheint mit modernen Emulatoren eher zu funktionieren als die niedrigere -qemu -chardev socket-Methode, auch wenn die Socket-Methode eine TCP-Verbindung herstellen kann.

[reflective] usb:0 vs. VID:PID: Auf macOS/M1 kann die Identifikation von USB-Geräten eigenwillig sein. Wenn die exakte VID:PID unerwartet scheitert, versuche den Index usb:0 (vorausgesetzt, es ist das primäre/beabsichtigte Gerät).

Hartnäckigkeit zahlt sich aus: Das brauchte mehrere Versuche und die Kombination aus Dokumentation, Websuchen und iterativem Testen. Gib nicht zu schnell auf!

[gently] Ich hoffe, dass diese konkrete, funktionierende Konfiguration anderen Entwicklern Stunden an Frust erspart. Viel Spaß beim Coden (und Bridgen)!
