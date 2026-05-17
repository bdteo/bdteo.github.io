---
lang: "de"
translationOf: "bluez-pairing-python-agent-workaround-authentication-failed"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "0364f15f40f64a8e"
title: "BlueZ-Pairing-Fix: Externer Python-Agent & D-Bus-Polling"
date: "2025-04-08"
description: "BlueZ-Pairing-Fehler 'AuthenticationFailed' unter 5.66+ beheben. Warum interne C++-sd-bus-Agents scheitern, wie ein externer Python-Agent das Problem löst und warum du D-Bus-Polling brauchst."
featuredImage: "./images/featured.jpg"
imageCaption: "Navigation durch die komplexen Interaktionen von BlueZ-D-Bus-Pairing-Agents unter Linux."
---

> **TL;DR:** Wenn du mit einem eigenen C++/sd-bus-Pairing-Agent unter BlueZ 5.66+ `org.bluez.Error.AuthenticationFailed` bekommst, ist wahrscheinlich deine interne Agent-Registrierung das Problem. Starte einen externen Python-Agent (`simple-agent.py`) als separaten Prozess und implementiere D-Bus-Property-Polling, statt dich auf `PropertiesChanged`-Signale zu verlassen. Details und Code unten.

Ich habe zwei Tage lang auf `org.bluez.Error.AuthenticationFailed` gestarrt, bevor ich verstanden habe, was eigentlich los war.

Der Pairing-Agent war registriert. Die D-Bus-Aufrufe sahen korrekt aus. `busctl` bestätigte, dass alles an Ort und Stelle war -- und BlueZ sagte einfach weiter nein. Das passierte während der Arbeit an [D2Explorer](../huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- einem Tool zum Pairing mit der Huawei Watch D2 unter Linux -- und der Pairing-Fehler blockierte alles.

Das ist wirklich passiert, und so haben wir es behoben.

## Der Plan: ein interner C++-Pairing-Agent

Die Idee war sauber und in sich geschlossen. Eine einzige C++-Anwendung, die den gesamten Pairing-Prozess mit `sd-bus` übernimmt (den C/C++-D-Bus-Bindings):

1.  Mit dem System-D-Bus verbinden.
2.  Den Bluetooth-Adapter finden (`org.bluez.Adapter1`).
3.  Eine C++-Klasse implementieren, die das Interface `org.bluez.Agent1` bereitstellt.
4.  Den Agent bei `org.bluez.AgentManager1` über `RegisterAgent` und `RequestDefaultAgent` registrieren. Wir begannen mit der Capability `DisplayYesNo`, später vereinfachten wir auf `NoInputNoOutput`.
5.  Das Zielgerät entdecken (`org.bluez.Device1`).
6.  `Pair()` auf dem D-Bus-Interface des Geräts aufrufen.
7.  Der interne Agent behandelt Callbacks (`RequestConfirmation`, `RequestAuthorization`) automatisch -- keine Benutzerinteraktion nötig.
8.  Das Gerät als vertrauenswürdig markieren, eine GATT-Verbindung aufbauen, fertig.

Ein Binary, keine externen Abhängigkeiten. Das war der Plan.

## Die Wand: `org.bluez.Error.AuthenticationFailed`

Bis Schritt 6 funktionierte alles. Adapter gefunden, Agent registriert (D-Bus bestätigte es), Gerät entdeckt. Aber in dem Moment, in dem wir `Device1.Pair()` über `sd_bus_call_method` aufriefen -- sofortiger Fehlschlag:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method threw exception: Failed to call method 'Pair':
    Input/output error - D-Bus error: org.bluez.Error.AuthenticationFailed (Authentication Failed)
```

Wir haben alles versucht. Verschiedene Agent-Capabilities. Die `sd-bus`-vtable-Konfiguration geprüft. Verifiziert, dass die Agent-Methodenimplementierungen schnell erfolgreich zurückgaben. Mit `busctl` und `gdbus` den D-Bus-Traffic beobachtet -- die Registrierungsaufrufe sahen korrekt aus. Der `Pair()`-Aufruf scheiterte einfach weiter.

**Sackgasse.**

## Der Durchbruch: ein externer Python-Agent

Um das Problem zu isolieren, nahmen wir den internen C++-Agent aus der Gleichung. Wir starteten BlueZs Standard-`simple-agent.py` als separaten Prozess *bevor* wir unsere C++-App starteten (jetzt ohne eigene Agent-Registrierung):

```bash
# Terminal 1: Run the external agent
sudo python simple-agent.py NoInputNoOutput

# Terminal 2: Run our C++ app (no internal agent)
sudo ./build/huawei_pair_app <MAC> <QR_VALUE>
```

Das Ergebnis:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method succeeded  <--- SUCCESS!
```

Konstant. Jedes Mal. Der Fehler `AuthenticationFailed` verschwand komplett.

Das bewies, dass das Problem nicht bei `Pair()` selbst lag, und auch nicht beim Gerät oder bei BlueZs Pairing-Fähigkeit. Es lag konkret daran, wie unsere C++-Anwendung mit `sd-bus` sich als Pairing-Agent registrierte und interagierte. Die exakt gleiche logische Operation -- einen `NoInputNoOutput`-Agent registrieren und `Pair()` aufrufen -- funktionierte perfekt, wenn der Agent als separater Python-Prozess lief.

**Das funktionierte.**

## Warum ist der interne Agent gescheitert?

Als ich zuerst darauf stieß, hatte ich nur Hypothesen. Seitdem habe ich echte dokumentierte Hinweise gefunden, dass das ein breiteres Problem ist -- nicht nur unser Code.

### BlueZ-5.70+-Regression

[BlueZ GitHub Issue #605](https://github.com/bluez/bluez/issues/605) dokumentiert Fälle, in denen Geräte unter BlueZ 5.50 problemlos pairen, auf neueren Versionen aber mit `auth failed with status 0x05` scheitern. HCI-Logs zeigen `Status: PIN or Key Missing (0x06)` trotz gespeicherter Link Keys. Der Workaround? Das alte `bluez-simple-agent.py`-Skript ausführen. Kommt dir bekannt vor?

### Agent-Verfügbarkeit ist die eigentliche Ursache

[Bleak Issue #1434](https://github.com/hbldh/bleak/issues/1434) macht es noch klarer: Pairing funktioniert nur, wenn `bluetoothctl` oder GNOME Bluetooth läuft, weil diese Anwendungen den nötigen Authentication-Agent registrieren. Ohne einen aktiven, *korrekt funktionierenden* Agent gibt BlueZ intern `No agent available for request type 2` zurück -- was nach außen als `AuthenticationFailed` erscheint.

Die zentrale Erkenntnis: Es reicht nicht, einen Agent zu *registrieren*. Der Agent muss auf BlueZs Callbacks auf eine Weise antworten, die `bluetoothd` als gültig betrachtet. Und irgendetwas daran, wie `sd-bus` das innerhalb desselben Prozesses handhabt, der das Pairing startet, reicht neueren BlueZ-Versionen nicht.

### Vielleicht ist es nicht einmal BlueZ

[Red Hat Bug #1905671](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) zeigte, dass manche `AuthenticationFailed`-Fehler kernelbezogen sind, nicht BlueZ-bezogen. Kernel 5.9 hatte Pairing-Probleme, die 5.8.18 und 5.10+ nicht hatten. Der Kommentar des Maintainers ist zitierenswert: *"Bluetooth is complex, it could be firmware, kernel, bluez, controller, end device or a combination of them all."*

### Agent-Capability-Mismatch

[BlueZ Issue #650](https://github.com/bluez/bluez/issues/650) dokumentiert noch einen anderen Winkel: Bestimmte Geräte (besonders iOS) scheitern beim Pairing mit `NoInputNoOutput`-Agents, weil sie Secure Connections auf Legacy Pairing herabstufen, was bei späterem Attribute-Zugriff `Insufficient Authentication (0x05)`-Fehler verursacht. Das ist ein Security-Manager-Protocol-(SMP)-Negotiation-Problem, kein Problem der Agent-Registrierung -- aber es erzeugt dieselbe Fehlermeldung.

### Die wahrscheinlichsten Ursachen in unserem Fall

Angesichts der Hinweise sind das die wahrscheinlichsten Erklärungen für den internen `sd-bus`-Agent-Fehlschlag:

1.  **Timing** -- die `sd-bus`-Registrierung oder Methodenbehandlung innerhalb unserer Event Loop antwortete nicht genau in dem Zeitfenster, das `bluetoothd` erwartete.
2.  **Feinheiten von `sd-bus` vs. `python-dbus`** -- Unterschiede darin, wie diese Libraries mit dem D-Bus-Daemon interagieren oder Object Lifetimes behandeln.
3.  **Strengere Anforderungen in BlueZ 5.66+** -- geänderte interne Sequenzen für Agent-Interaktion, die `sd-bus`, wenn es in derselben Anwendung verwendet wird, die das Pairing startet, nicht erfüllt.

## Die zweite Wand: D-Bus-Signale sind unzuverlässig

`AuthenticationFailed` zu überwinden war ein großer Gewinn, aber es war nicht das Ende. Mit dem externen Agent an Ort und Stelle war `Pair()` erfolgreich -- aber wir konnten nicht zuverlässig *erkennen*, wann es fertig war.

Wir verließen uns auf D-Bus-`PropertiesChanged`-Signale (über `sd-bus`), um zu wissen, wann `Paired`, `Trusted`, `Connected` und `ServicesResolved` auf `true` wechselten. Manchmal kamen die Signale an. Manchmal kamen sie spät. Manchmal kamen sie gar nicht.

Also implementierten wir **aktives Polling** -- einen Fallback, der Property-Werte direkt abfragt, wenn Signale nicht auftauchen:

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

Jede State-Transition-Methode (`isPaired()`, `isTrusted()`, `isConnected()`, `areServicesResolved()`) folgt demselben Muster: zuerst den gecachten atomic boolean prüfen (vom Signal-Handler aktualisiert, wenn er funktioniert), dann auf einen direkten D-Bus-`Get`-Property-Aufruf zurückfallen.

Nicht elegant. Aber nötig.

**Das funktionierte.**

## Der komplette Fix

Hier ist das konsolidierte Rezept. Wenn du automatisiertes Bluetooth-Pairing unter Linux mit BlueZ 5.66+ baust und auf `AuthenticationFailed` läufst:

### Schritt 1: simple-agent.py holen

Hol es aus dem [BlueZ source tree](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent).

### Schritt 2: den externen Agent starten

```bash
sudo python simple-agent.py NoInputNoOutput
```

Lass das in einem separaten Terminal laufen (oder als Background Service).

### Schritt 3: den internen Agent aus deiner App entfernen

Entferne alle `RegisterAgent`- / `RequestDefaultAgent`-Aufrufe aus deiner C++-Anwendung. Lass den externen Python-Agent die Authentication-Callbacks behandeln.

### Schritt 4: D-Bus-Property-Polling hinzufügen

Verlass dich nicht nur auf `PropertiesChanged`-Signale. Implementiere für jede kritische Property (`Paired`, `Trusted`, `Connected`, `ServicesResolved`) das oben gezeigte Cache-then-poll-Muster. Polle periodisch aus deiner Main Loop.

### Schritt 5: verifizieren

1.  Bestätige, dass der externe Agent läuft (`sudo python simple-agent.py NoInputNoOutput`).
2.  Starte deine App. `Pair()` sollte erfolgreich sein.
3.  Beobachte die Polling-Logs -- du solltest D-Bus-Property-Abfragen für State Transitions sehen.
4.  Wenn `Pair()` immer noch scheitert, prüfe deine BlueZ-Version (`bluetoothd --version`) und Kernel-Version -- das Problem könnte tiefer liegen.

## Was dich das kostet

Ich werde nicht so tun, als wäre das eine saubere Lösung. Ist es nicht:

1.  **Externe Abhängigkeit** -- deine App braucht jetzt einen separaten laufenden Python-Prozess.
2.  **Mehr Komplexität** -- Polling-Logik in der Main Loop, zusätzlich zu Signal-Handlern.
3.  **Weniger in sich geschlossen** -- der Traum vom einzelnen Binary ist dahin.

Aber es funktioniert. Zuverlässig. Und wenn du zwei Tage lang auf `AuthenticationFailed` gestarrt hast, ist "es funktioniert" das, was zählt.

---

### Referenzen

<a id="ref1"></a>1. [BlueZ GitHub Issue #55: Device characteristics and pairing timing](https://github.com/bluez/bluez/issues/55) -- *Intermittent pairing failures related to agent timing.*<br>
<a id="ref2"></a>2. [Bluetooth Auto Pairing with NoInputNoOutput Agent Issues](https://forums.raspberrypi.com/viewtopic.php?t=324225) -- *Forum discussion about headless pairing challenges.*<br>
<a id="ref3"></a>3. [BlueZ Source: test/simple-agent](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent) -- *The standard Python agent.*<br>
<a id="ref4"></a>4. [BlueZ GitHub Issue #605: Pairing regression in 5.70+](https://github.com/bluez/bluez/issues/605) -- *Documented failures with newer BlueZ versions.*<br>
<a id="ref5"></a>5. [Bleak Issue #1434: Pairing requires active agent](https://github.com/hbldh/bleak/issues/1434) -- *Evidence that agent availability is the root cause.*<br>
<a id="ref6"></a>6. [Red Hat Bug #1905671: Kernel-related pairing failures](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) -- *Not always BlueZ -- sometimes it's the kernel.*<br>
<a id="ref7"></a>7. [BlueZ GitHub Issue #650: Agent capability mismatch](https://github.com/bluez/bluez/issues/650) -- *SMP negotiation failures with NoInputNoOutput.*<br>
<a id="ref8"></a>8. [BlueZ Agent API Documentation](https://bluez.readthedocs.io/en/latest/agent-api/) -- *Official agent interface reference.*<br>
<a id="ref9"></a>9. [Kynetics: Pairing Agents in the BlueZ Stack](https://technotes.kynetics.com/2018/pairing_agents_bluez/) -- *Technical deep dive into agent registration.*

---

### Ähnliche Beiträge

- [Huawei Watch D2 BLE Pairing: Protocol & Vendor Lock-In](/huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- das Projekt, das diese Untersuchung ausgelöst hat. Die Watch D2 verlangt zusätzlich zum Standard-BLE-Pairing einen proprietären Handshake auf Anwendungsebene; genau deshalb musste automatisiertes Pairing überhaupt funktionieren.
- [Fix Android Emulator Bluetooth on M1 Mac using Bumble & API 32](/m1-mac-android-emulator-bluetooth-passthrough-bumble/) -- ein weiterer Bluetooth-Integrationskampf, diesmal beim Durchreichen des physischen Funkmoduls eines Macs in den Android Emulator.
