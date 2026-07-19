[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

TL;DR: Wenn du mit einem eigenen C plus plus/sd-bus-Pairing-Agent unter BlueZ 5.66+ org.bluez.Error.AuthenticationFailed bekommst, ist wahrscheinlich deine interne Agent-Registrierung das Problem. Starte einen externen Python-Agent (simple-agent.py) als separaten Prozess und implementiere D-Bus-Property-Polling, statt dich auf PropertiesChanged-Signale zu verlassen. Details und Code unten.

[matter-of-fact] Ich habe zwei Tage lang auf org.bluez.Error.AuthenticationFailed gestarrt, bevor ich verstanden habe, was eigentlich los war.

Der Pairing-Agent war registriert. Die D-Bus-Aufrufe sahen korrekt aus. busctl bestätigte, dass alles an Ort und Stelle war -- und BlueZ sagte einfach weiter nein. Das passierte während der Arbeit an D2Explorer -- einem Tool zum Pairing mit der Huawei Watch D2 unter Linux -- und der Pairing-Fehler blockierte alles.

[reflective] Das ist wirklich passiert, und so haben wir es behoben.

Der Plan: ein interner C plus plus-Pairing-Agent.

[conversational tone] Die Idee war sauber und in sich geschlossen. Eine einzige C plus plus-Anwendung, die den gesamten Pairing-Prozess mit sd-bus übernimmt (den C/C plus plus-D-Bus-Bindings):

Mit dem System-D-Bus verbinden.

Den Bluetooth-Adapter finden (org.bluez.Adapter1).

[matter-of-fact] Eine C plus plus-Klasse implementieren, die das Interface org.bluez.Agent1 bereitstellt.

Den Agent bei org.bluez.AgentManager1 über RegisterAgent und RequestDefaultAgent registrieren. Wir begannen mit der Capability DisplayYesNo, später vereinfachten wir auf NoInputNoOutput.

Das Zielgerät entdecken (org.bluez.Device1).

Pair() auf dem D-Bus-Interface des Geräts aufrufen.

[deliberate] Der interne Agent behandelt Callbacks (RequestConfirmation, RequestAuthorization) automatisch -- keine Benutzerinteraktion nötig.

Das Gerät als vertrauenswürdig markieren, eine GATT-Verbindung aufbauen, fertig.

Ein Binary, keine externen Abhängigkeiten. Das war der Plan.

[matter-of-fact] Die Wand: org.bluez.Error.AuthenticationFailed.

Bis Schritt 6 funktionierte alles. Adapter gefunden, Agent registriert (D-Bus bestätigte es), Gerät entdeckt. Aber in dem Moment, in dem wir Device1.Pair() über sd_bus_call_method aufriefen -- sofortiger Fehlschlag:

Wir haben alles versucht. Verschiedene Agent-Capabilities. Die sd-bus-vtable-Konfiguration geprüft. Verifiziert, dass die Agent-Methodenimplementierungen schnell erfolgreich zurückgaben. Mit busctl und gdbus den D-Bus-Traffic beobachtet -- die Registrierungsaufrufe sahen korrekt aus. Der Pair()-Aufruf scheiterte einfach weiter.

Sackgasse.

Der Durchbruch: ein externer Python-Agent.

Um das Problem zu isolieren, nahmen wir den internen C plus plus-Agent aus der Gleichung. Wir starteten BlueZs Standard-simple-agent.py als separaten Prozess bevor wir unsere C plus plus-App starteten (jetzt ohne eigene Agent-Registrierung):

[resigned tone] Das Ergebnis:

Konstant. Jedes Mal. Der Fehler AuthenticationFailed verschwand komplett.

[deliberate] Das bewies, dass das Problem nicht bei Pair() selbst lag, und auch nicht beim Gerät oder bei BlueZs Pairing-Fähigkeit. Es lag konkret daran, wie unsere C plus plus-Anwendung mit sd-bus sich als Pairing-Agent registrierte und interagierte. Die exakt gleiche logische Operation -- einen NoInputNoOutput-Agent registrieren und Pair() aufrufen -- funktionierte perfekt, wenn der Agent als separater Python-Prozess lief.

Das funktionierte.

Warum ist der interne Agent gescheitert?

Als ich zuerst darauf stieß, hatte ich nur Hypothesen. Seitdem habe ich echte dokumentierte Hinweise gefunden, dass das ein breiteres Problem ist -- nicht nur unser Code.

[matter-of-fact] BlueZ-5.70+-Regression.

BlueZ GitHub Issue #605 dokumentiert Fälle, in denen Geräte unter BlueZ 5.50 problemlos pairen, auf neueren Versionen aber mit auth failed with status 0x05 scheitern. HCI-Logs zeigen Status: PIN or Key Missing (0x06) trotz gespeicherter Link Keys. Der Workaround? Das alte bluez-simple-agent.py-Skript ausführen. Kommt dir bekannt vor?

Agent-Verfügbarkeit ist die eigentliche Ursache.

[reflective] Bleak Issue #1434 macht es noch klarer: Pairing funktioniert nur, wenn bluetoothctl oder GNOME Bluetooth läuft, weil diese Anwendungen den nötigen Authentication-Agent registrieren. Ohne einen aktiven, korrekt funktionierenden Agent gibt BlueZ intern No agent available for request type 2 zurück -- was nach außen als AuthenticationFailed erscheint.

Die zentrale Erkenntnis: Es reicht nicht, einen Agent zu registrieren. Der Agent muss auf BlueZs Callbacks auf eine Weise antworten, die bluetoothd als gültig betrachtet. Und irgendetwas daran, wie sd-bus das innerhalb desselben Prozesses handhabt, der das Pairing startet, reicht neueren BlueZ-Versionen nicht.

[emphasized] Vielleicht ist es nicht einmal BlueZ.

Red Hat Bug #1905671 zeigte, dass manche AuthenticationFailed-Fehler kernelbezogen sind, nicht BlueZ-bezogen. Kernel 5.9 hatte Pairing-Probleme, die 5.8.18 und 5.10+ nicht hatten. Der Kommentar des Maintainers ist zitierenswert: "Bluetooth is complex, it could be firmware, kernel, bluez, controller, end device or a combination of them all."

Agent-Capability-Mismatch.

[reflective] BlueZ Issue #650 dokumentiert noch einen anderen Winkel: Bestimmte Geräte (besonders iOS) scheitern beim Pairing mit NoInputNoOutput-Agents, weil sie Secure Connections auf Legacy Pairing herabstufen, was bei späterem Attribute-Zugriff Insufficient Authentication (0x05)-Fehler verursacht. Das ist ein Security-Manager-Protocol-(SMP)-Negotiation-Problem, kein Problem der Agent-Registrierung -- aber es erzeugt dieselbe Fehlermeldung.

[matter-of-fact] Die wahrscheinlichsten Ursachen in unserem Fall.

[deliberate] Angesichts der Hinweise sind das die wahrscheinlichsten Erklärungen für den internen sd-bus-Agent-Fehlschlag:

Timing -- die sd-bus-Registrierung oder Methodenbehandlung innerhalb unserer Event Loop antwortete nicht genau in dem Zeitfenster, das bluetoothd erwartete.

Feinheiten von sd-bus vs. python-dbus -- Unterschiede darin, wie diese Libraries mit dem D-Bus-Daemon interagieren oder Object Lifetimes behandeln.

Strengere Anforderungen in BlueZ 5.66+ -- geänderte interne Sequenzen für Agent-Interaktion, die sd-bus, wenn es in derselben Anwendung verwendet wird, die das Pairing startet, nicht erfüllt.

Die zweite Wand: D-Bus-Signale sind unzuverlässig.

[conversational tone] AuthenticationFailed zu überwinden war ein großer Gewinn, aber es war nicht das Ende. Mit dem externen Agent an Ort und Stelle war Pair() erfolgreich -- aber wir konnten nicht zuverlässig erkennen, wann es fertig war.

Wir verließen uns auf D-Bus-PropertiesChanged-Signale (über sd-bus), um zu wissen, wann Paired, Trusted, Connected und ServicesResolved auf true wechselten. Manchmal kamen die Signale an. Manchmal kamen sie spät. Manchmal kamen sie gar nicht.

Also implementierten wir aktives Polling -- einen Fallback, der Property-Werte direkt abfragt, wenn Signale nicht auftauchen:

[matter-of-fact] Jede State-Transition-Methode (isPaired(), isTrusted(), isConnected(), areServicesResolved()) folgt demselben Muster: zuerst den gecachten atomic boolean prüfen (vom Signal-Handler aktualisiert, wenn er funktioniert), dann auf einen direkten D-Bus-Get-Property-Aufruf zurückfallen.

Nicht elegant. Aber nötig.

Das funktionierte.

[slows down] Der komplette Fix.

Hier ist das konsolidierte Rezept. Wenn du automatisiertes Bluetooth-Pairing unter Linux mit BlueZ 5.66+ baust und auf AuthenticationFailed läufst:

[deliberate] Schritt 1: simple-agent.py holen.

Hol es aus dem BlueZ source tree.

Schritt 2: den externen Agent starten.

[resigned tone] Lass das in einem separaten Terminal laufen (oder als Background Service).

[emphasized] Schritt 3: den internen Agent aus deiner App entfernen.

Entferne alle RegisterAgent- / RequestDefaultAgent-Aufrufe aus deiner C plus plus-Anwendung. Lass den externen Python-Agent die Authentication-Callbacks behandeln.

[matter-of-fact] Schritt 4: D-Bus-Property-Polling hinzufügen.

Verlass dich nicht nur auf PropertiesChanged-Signale. Implementiere für jede kritische Property (Paired, Trusted, Connected, ServicesResolved) das oben gezeigte Cache-then-poll-Muster. Polle periodisch aus deiner Main Loop.

Schritt 5: verifizieren.

Bestätige, dass der externe Agent läuft (sudo python simple-agent.py NoInputNoOutput).

Starte deine App. Pair() sollte erfolgreich sein.

[conversational tone] Beobachte die Polling-Logs -- du solltest D-Bus-Property-Abfragen für State Transitions sehen.

Wenn Pair() immer noch scheitert, prüfe deine BlueZ-Version (bluetoothd --version) und Kernel-Version -- das Problem könnte tiefer liegen.

[reflective] Was dich das kostet.

Ich werde nicht so tun, als wäre das eine saubere Lösung. Ist es nicht:

[matter-of-fact] Externe Abhängigkeit -- deine App braucht jetzt einen separaten laufenden Python-Prozess.

[deliberate] Mehr Komplexität -- Polling-Logik in der Main Loop, zusätzlich zu Signal-Handlern.

Weniger in sich geschlossen -- der Traum vom einzelnen Binary ist dahin.

[conversational tone] Aber es funktioniert. Zuverlässig. Und wenn du zwei Tage lang auf AuthenticationFailed gestarrt hast, ist "es funktioniert" das, was zählt.
