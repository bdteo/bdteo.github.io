---
lang: "de"
translationOf: "m1-mac-android-emulator-bluetooth-passthrough-bumble"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "9b0bdbf16352f96c"
title: "Android-Emulator-Bluetooth auf dem M1-Mac mit Bumble und API 32 reparieren"
date: "2025-04-14"
description: "Bluetooth-Passthrough für den Android Emulator auf M1-Macs reparieren. Diese Anleitung beschreibt das erfolgreiche Bumble-Setup mit Netsim, expliziten Endpunkten und API-32-AVDs."
tags: ["Android Emulator", "Bluetooth", "BLE", "HCI", "Bumble", "macOS", "M1", "Apple Silicon", "Docker", "QEMU", "Netsim", "Passthrough", "Troubleshooting", "API 32"]
featuredImage: "./images/featured.jpg"
imageCaption: "Zwei moderne Smartphones liegen mit der Vorderseite nach unten auf Marmor. Ein schwacher cyanfarbener Halo zieht sich durch den Abstand zwischen ihnen."
audioUrl: "/audio/articles/m1-mac-android-emulator-bluetooth-passthrough-bumble/de/LTo9oDjTW1FdEgMfiXWQ-bdc0b94cfb41.m4a"
audioDuration: "12:03"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/m1-mac-android-emulator-bluetooth-passthrough-bumble.de.md"
---

Wenn du als Entwickler auf einem M1/M2/M3-Mac mit Bluetooth arbeitest und versuchst, die Bluetooth-Funkeinheit deines Host-Rechners im Android Emulator nutzbar zu machen, hast du vermutlich schon etwas gelitten. Was eigentlich unkompliziert wirken *sollte*, wird oft zu einem frustrierenden Kaninchenbau aus fehlgeschlagenen Verbindungen, kryptischen Fehlern und Dokumentations-Sackgassen. Ich bin genau durch diesen Kampf gegangen, und nach mehreren Mauern habe ich endlich eine Kombination mit dem Python-Bluetooth-Stack **Bumble** gefunden, die *tatsächlich funktioniert*.

Das ist nicht noch eine theoretische Anleitung; es ist der Schritt-für-Schritt-Bericht darüber, was gescheitert ist und, wichtiger, was *funktioniert* hat, um das Bluetooth meines M1 Mac Pro (in meinem Fall über einen externen USB-Dongle, auch wenn das Prinzip vielleicht auch für interne Funkmodule gilt) mit einem Android-12L-Emulator (API 32) zu verbinden.

## Das Ziel: Echtes Bluetooth im Emulator

Das Ziel war simpel: Der Android Emulator sollte den physischen Bluetooth-Controller meines Macs verwenden, statt seines eigenen eingeschränkten virtuellen Controllers. Das ist entscheidend, wenn man Apps testet, die mit echten Bluetooth-Geräten interagieren.

## Das Werkzeug: Bumble betritt die Bühne

[Bumble](https://github.com/google/bumble) ist ein mächtiger Python-Bluetooth-Stack. Das zentrale Werkzeug für diese Aufgabe ist `bumble-hci-bridge`, das sich auf der einen Seite mit einem physischen HCI (Host Controller Interface) verbinden und es auf der anderen Seite über verschiedene Transportschichten (wie TCP oder gRPC) bereitstellen kann.

## Versuch #1: Die QEMU-Socket-Methode (der logische erste Versuch)

Ausgehend von allgemeinem QEMU-Wissen und ein paar älteren Anleitungen bestand der erste Ansatz darin, Emulator-Flags zu verwenden, um einen virtuellen seriellen Port (hinterlegt durch einen TCP-Socket) direkt mit der HCI-Bridge zu verbinden.

1.  **Bridge starten (TCP-Server-Modus):** Wir verbanden Bumble mit dem physischen Dongle (der auf meiner Maschine überraschenderweise mit `usb:0` besser funktionierte als mit seiner konkreten VID:PID `usb:0b05:17cb` - M1-Eigenheiten!) und ließen es auf einem TCP-Port lauschen.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge usb:0 tcp-server:0.0.0.0:6789
    # Output showed '>>> connected' twice - success connecting to USB and starting TCP server.
    ```

2.  **Emulator mit QEMU-Flags starten:** Wir passten das Emulator-Startskript an (anfangs mit Ziel API 34), um `-qemu`-Flags hinzuzufügen, die einen virtuellen seriellen Port (`virtserialport`) auf ein Zeichengerät (`chardev`) leiteten, das von einem TCP-Socket zur Bridge hinterlegt war.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -qemu \
        -device virtio-serial-device \
        -device virtserialport,chardev=bt,name=bt \
        -chardev socket,id=bt,host=localhost,port=6789 \
        ...
    ```

3.  **Das Ergebnis? Teilerfolg, am Ende Fehlschlag:** Mit `lsof` konnten wir sehen, dass der QEMU-Prozess des Emulators *tatsächlich* eine TCP-Verbindung zur Bumble-Bridge aufbaute. Allerdings schickte der Android-Bluetooth-Stack *im Inneren* des Emulators nie echte HCI-Kommandos darüber. Bluetooth in den Android-Einstellungen umzuschalten bewirkte nichts. Die Bridge-Logs blieben nach der initialen Verbindung stumm. **Sackgasse.**

## Versuch #2: Die Standard-Netsim-Bridge (nach Bumble-Dokumentation)

Die Bumble-Dokumentation erwähnt eine Bridge zur "Netsim"-gRPC-Schnittstelle des Emulators. Netsim (und sein Kern, Root Canal) ist das neuere virtuelle Bluetooth-Controller-System des Emulators.

1.  **Bridge starten (Netsim-Controller-Modus):** Wir konfigurierten die Bridge so, dass sie als Netsim-Controller arbeitet, auf dem standardmäßigen gRPC-Port (8554) lauscht und sich mit dem physischen Dongle verbindet.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    # Output showed '>>> connected' twice - success connecting to USB and starting Netsim gRPC server.
    ```

2.  **Emulator starten (Standard-Backend):** Wir setzten das Startskript zurück (immer noch mit API 34), entfernten die `-qemu`-Flags und fügten `-packet-streamer-endpoint default` hinzu, damit er sicher das Netsim-Backend zu verwenden versucht.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -packet-streamer-endpoint default \
        ...
    ```

3.  **Das Ergebnis? Keine Verbindung:** Diesmal startete der Emulator, aber die Bumble-Bridge zeigte keinerlei Anzeichen einer eingehenden gRPC-Verbindung vom Emulator. Die Emulator-Logs zeigten keine offensichtlichen Verbindungsfehler, aber Bluetooth blieb unbrauchbar. **Noch eine Sackgasse.**

## Versuch #3: API-Downgrade + expliziter Netsim-Endpunkt (der Gewinner!)

<figure>
  <img src="featured-2.jpg" alt="Symbolische Brücke zwischen Apple- und Android-Plattformen">
  <figcaption>
    Fig1. - Eine surreale Landschaft, in der gescheiterte Netzwerkkabel zwischen Apple- und Android-Felsformationen hängen, während eine einzelne Bumble-markierte Seilbrücke die beiden erfolgreich verbindet und leuchtende Datenpakete hinüberlaufen lässt.
  </figcaption>
</figure>


Websuchen zeigten allgemeine Berichte über Instabilität bei Bluetooth auf API-33/34-Emulatoren und mögliche Probleme damit, wie der Emulator das Netsim-Backend entdeckt oder sich damit verbindet, besonders wenn ein externes Werkzeug versucht, es abzufangen. Der Schlüssel schien zu sein, dem Emulator **explizit zu sagen, wo der Netsim-gRPC-Server liegt**, und **eine ältere API-Version zu versuchen**.

1.  **Bridge starten (Netsim-Controller-Modus, expliziter Port, `usb:0`):** Wie in Versuch #2, mit der Sicherstellung, dass sie auf einem bekannten Port (`8554`) lauscht und sich über den Index (`usb:0`), der zuverlässig funktionierte, mit dem physischen Dongle verbindet.
    ```bash
    # In Terminal 1: (Keep this running!)
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```

2.  **Emulator anpassen und starten (API 32, expliziter Endpunkt):** Wir erstellten ein **API-32-AVD (Android 12L)** mit Google Play Services (`gplay_32_arm`). Wir passten das Startskript an, damit es dieses AVD verwendet, und, entscheidend, änderten das Flag `-packet-streamer-endpoint` von `default` zur *exakten* Adresse unserer Bridge.
    ```bash
    # Snippet from the *successful* launch script (see full script below):
    API_LEVEL="32"
    AVD_NAME="gplay_${API_LEVEL}_arm"
    SYSTEM_IMAGE_PKG="system-images;android-${API_LEVEL};${IMAGE_TAG};${ARCH}"
    BUMBLE_NETSIM_GRPC_PORT="8554"
    ...
    emulator -avd "$AVD_NAME" ... \
        -packet-streamer-endpoint "localhost:$BUMBLE_NETSIM_GRPC_PORT" \
        ...
    ```

3.  **Das Ergebnis? Erfolg!** Diesmal funktionierte es!
    *   Das `bumble-hci-bridge`-Terminal begann kurz nach dem Start, gRPC-Verbindungslogs vom Emulator anzuzeigen.
    *   Sobald der Emulator gebootet war, führte das Einschalten von Bluetooth in den Android-Einstellungen zu einer Flut von HCI-Kommandos (Reset, Read Version, Set Event Mask usw.) im Bridge-Terminal.
    *   Die Suche nach Geräten innerhalb des Emulators nutzte erfolgreich die physische Bluetooth-Funkeinheit des Macs über den ASUS-Dongle!

## Das funktionierende Rezept: Schritt für Schritt

Hier ist das genaue Vorgehen, das auf meinem M1 Mac Pro mit einem externen ASUS-USB-BT500-Dongle funktioniert hat:

1.  **Bumble installieren:**
    ```bash
    python3 -m pip install bumble
    # Potentially install libusb if needed: brew install libusb
    ```

2.  **(Optional, aber empfohlen) Natives macOS-USB-Bluetooth-Handling deaktivieren:** Einmal ausführen und **neu starten**.
    ```bash
    sudo nvram bluetoothHostControllerSwitchBehavior="never"
    ```

3.  **Bumble-Netsim-Bridge starten:** Öffne ein Terminal und führe aus (laufen lassen):
    ```bash
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```
    *(Prüfen, dass zweimal `>>> connected` angezeigt wird.)*

4.  **Emulator-Startskript vorbereiten:** Speichere das unten angegebene *vollständige Skript* als `launch_gapps_avd_api32.sh` (oder ähnlich). Achte darauf, dass es ein **API-32**-AVD verwendet (es erstellt eines namens `gplay_32_arm`, falls es nicht existiert) und explizit `-packet-streamer-endpoint localhost:8554` nutzt. Mach es ausführbar (`chmod +x launch_gapps_avd_api32.sh`).

5.  **Startskript ausführen:** Öffne ein *neues* Terminal und führe das Skript aus:
    ```bash
    ./launch_gapps_avd_api32.sh
    ```

6.  **Verifizieren:** Sobald der Emulator gebootet ist:
    *   Prüfe das `bumble-hci-bridge`-Terminal auf gRPC- und HCI-Traffic.
    *   Gehe zu Android Settings -> Bluetooth und schalte es ein.
    *   Versuche zu scannen oder zu koppeln.

## Das erfolgreiche Startskript (API 32, expliziter Netsim-Endpunkt)

```bash
#!/bin/bash

# Script to setup and launch a Google Play Android emulator (API 32) on macOS M1/ARM64
# Uses explicit Netsim endpoint for Bumble bridge compatibility.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
API_LEVEL="32" # Target Android API Level (Android 12L)
AVD_NAME="gplay_${API_LEVEL}_arm" # Name for the Android Virtual Device
IMAGE_TAG="google_apis_playstore" # Image type with Google Play Store
ARCH="arm64-v8a" # Architecture for Apple Silicon
SYSTEM_IMAGE_PKG="system-images;android-${API_LEVEL};${IMAGE_TAG};${ARCH}"
DEVICE_DEF="pixel_6a" # A common modern Pixel device definition
BUMBLE_NETSIM_GRPC_PORT="8554" # Port where bumble-hci-bridge Netsim controller is listening

# --- Find Android SDK ---
ANDROID_SDK_ROOT="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"

if [ ! -d "$ANDROID_SDK_ROOT" ]; then
    echo "❌ Error: Android SDK not found at '$ANDROID_SDK_ROOT'" >&2
    echo "   Please install Android Studio or set ANDROID_HOME/ANDROID_SDK_ROOT." >&2
    exit 1
fi
echo "▶️ Using Android SDK at: $ANDROID_SDK_ROOT"

# --- Define Tool Paths ---
CMDLINE_TOOLS_BIN="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"
PLATFORM_TOOLS_DIR="$ANDROID_SDK_ROOT/platform-tools"
EMULATOR_DIR="$ANDROID_SDK_ROOT/emulator"

SDKMANAGER="$CMDLINE_TOOLS_BIN/sdkmanager"
AVDMANAGER="$CMDLINE_TOOLS_BIN/avdmanager"
EMULATOR="$EMULATOR_DIR/emulator"
ADB="$PLATFORM_TOOLS_DIR/adb"

# --- Check Essential Tools ---
if ! command -v sdkmanager &> /dev/null; then echo "❌ Error: sdkmanager not found. Check SDK Command-line Tools installation and PATH." >&2; exit 1; fi
if ! command -v avdmanager &> /dev/null; then echo "❌ Error: avdmanager not found. Check SDK Command-line Tools installation and PATH." >&2; exit 1; fi
if ! command -v emulator &> /dev/null; then echo "❌ Error: emulator not found. Check Android Emulator installation and PATH." >&2; exit 1; fi
if ! command -v adb &> /dev/null; then echo "❌ Error: adb not found. Check SDK Platform-Tools installation and PATH." >&2; exit 1; fi
echo "✅ Basic SDK tools found in PATH."

# --- Stop Currently Running Emulators ---
echo "▶️ Stopping any currently running emulators..."
RUNNING_EMULATORS=$(adb devices | grep 'emulator-' | cut -f1)
if [ -n "$RUNNING_EMULATORS" ]; then
    for emu_id in $RUNNING_EMULATORS; do
        echo "   Stopping $emu_id..."
        adb -s "$emu_id" emu kill || echo "   (Failed to kill $emu_id, may already be stopped)"
        sleep 1 # Small delay
    done
    # Give ADB server time to recognize disconnection
    sleep 3
    echo "   Emulators stopped."
else
    echo "   No emulators appear to be running according to 'adb devices'."
fi
echo "✅ Emulator check/stop finished."


# --- Install/Update Required SDK Packages ---
echo "▶️ Ensuring required SDK packages are installed..."
# Accept licenses non-interactively
yes | sdkmanager --licenses > /dev/null || echo "   (Ignoring potential license script errors)"

# Install platform-tools, emulator
sdkmanager "platform-tools" "emulator"

# Install the Google Play system image for API 32
echo "▶️ Attempting to install/update Google Play system image: $SYSTEM_IMAGE_PKG"
if ! sdkmanager "$SYSTEM_IMAGE_PKG"; then
    echo "❌ Error: Failed to install required system image '$SYSTEM_IMAGE_PKG'." >&2
    echo "   Please check available images using: sdkmanager --list | grep 'system-images;android-${API_LEVEL};.*${ARCH}'" >&2
    exit 1
fi
echo "✅ System image package '$SYSTEM_IMAGE_PKG' present."

# --- Check if AVD Exists, Create ONLY if Missing ---
echo "▶️ Ensuring AVD '$AVD_NAME' exists..."
if ! avdmanager list avd --compact | grep -q "^${AVD_NAME}$"; then
    echo "   AVD '$AVD_NAME' not found. Creating..."
    # Using 'echo no' usually prevents hardware profile creation prompts. Pipe empty string for potential licenses.
    echo "" | avdmanager create avd --force --name "$AVD_NAME" --package "$SYSTEM_IMAGE_PKG" --device "$DEVICE_DEF" --sdcard 512M || {
         echo "❌ Error: Failed to create AVD '$AVD_NAME'." >&2
         echo "   Maybe the device definition '$DEVICE_DEF' is invalid for this image?" >&2
         echo "   Check available devices: avdmanager list device" >&2
         exit 1
    }
    echo "✅ AVD '$AVD_NAME' created."
else
    echo "✅ AVD '$AVD_NAME' already exists. Will reuse."
fi


# --- Launch Emulator ---
echo "▶️ Launching existing/new emulator: '$AVD_NAME' (pointing to Bumble Netsim bridge on localhost:$BUMBLE_NETSIM_GRPC_PORT)..."
EMULATOR_LOG="emulator-$AVD_NAME.log" # Log file name updated for API 32 AVD
# Google Play images often need a writable system partition
# Explicitly point packet streamer to localhost:8554 where bridge is listening
nohup emulator -avd "$AVD_NAME" -no-snapshot-load -gpu auto -show-kernel -writable-system \
    -packet-streamer-endpoint "localhost:$BUMBLE_NETSIM_GRPC_PORT" \
    > "$EMULATOR_LOG" 2>&1 &
EMULATOR_PID=$!
echo "   Emulator starting in background (PID: $EMULATOR_PID). Log: $EMULATOR_LOG"
echo -n "   Waiting for emulator to appear in ADB..."

# Wait for the emulator device to show up in adb
WAIT_ADB_TIMEOUT=90 # Increase timeout slightly for GPlay images
SECONDS=0
EMULATOR_ID="" # Reset variable
while [ $SECONDS -lt $WAIT_ADB_TIMEOUT ]; do
    # Find the *new* emulator ID
    CURRENT_EMU_ID=$(adb devices | grep 'emulator-' | head -n 1 | cut -f1)
    if [ -n "$CURRENT_EMU_ID" ]; then
        EMULATOR_ID="$CURRENT_EMU_ID"
        echo " Found ($EMULATOR_ID)!"
        break
    fi
    sleep 2
    SECONDS=$((SECONDS + 2))
    echo -n "."
done

if [ -z "$EMULATOR_ID" ]; then
    echo ""
    echo "❌ Error: Emulator did not appear in ADB within $WAIT_ADB_TIMEOUT seconds." >&2
    echo "   Check logs: $EMULATOR_LOG" >&2
    # Try to kill the process if it's still lingering
    kill $EMULATOR_PID 2>/dev/null || echo "   (Emulator process $EMULATOR_PID may have already exited)"
    exit 1
fi


# --- Wait for Boot Completion ---
echo -n "▶️ Waiting for Android system to fully boot (Google Play images can take longer)..."
BOOT_TIMEOUT=240 # Increase timeout significantly for GPlay images
SECONDS=0
while [ $SECONDS -lt $BOOT_TIMEOUT ]; do
    # Check if device is online first
    DEVICE_STATE=$(adb -s "$EMULATOR_ID" get-state 2>/dev/null)
    if [ "$DEVICE_STATE" != "device" ]; then
       echo -n "s($DEVICE_STATE)" # State not ready
       sleep 5
       SECONDS=$((SECONDS + 5))
       continue
    fi

    # Check boot completed property
    BOOT_COMPLETED=$(adb -s "$EMULATOR_ID" shell getprop sys.boot_completed 2>/dev/null | tr -d '
')
    if [ "$BOOT_COMPLETED" = "1" ]; then
        # Double check package manager is ready too for GPlay images
        PM_READY=$(adb -s "$EMULATOR_ID" shell pm get-install-location 2>/dev/null)
        if [[ "$PM_READY" == *"0"* || "$PM_READY" == *"1"* || "$PM_READY" == *"2"* ]]; then # Check if pm command gives valid output
            echo " Booted!"
            break
        else
            echo -n "p(pm not ready)" # Package Manager not ready
        fi
    else
         echo -n "b(booting)" # Boot not completed
    fi
    sleep 5
    SECONDS=$((SECONDS + 5))
done

if [ $SECONDS -ge $BOOT_TIMEOUT ]; then
    echo ""
    echo "❌ Error: Android system did not fully boot within $BOOT_TIMEOUT seconds." >&2
    echo "   Emulator might be stuck. Check logs ($EMULATOR_LOG) or try launching manually." >&2
    # Don't exit here, user might want to interact with stuck emulator
fi


# --- Final Instructions ---
echo "---"
echo "✅ Google Play Emulator '$AVD_NAME' (API $API_LEVEL) ($EMULATOR_ID) should be running."
echo "   Bluetooth should be using the Netsim backend at localhost:$BUMBLE_NETSIM_GRPC_PORT (intercepted by Bumble)."
echo "   Connect shell:   adb -s $EMULATOR_ID shell"
echo "   Install APK:     adb -s $EMULATOR_ID install /path/to/your.apk"
echo "   Stop emulator:   adb -s $EMULATOR_ID emu kill"
if [ -n "$EMULATOR_PID" ]; then # Only show PID if we launched it
    echo "   Kill Process:    kill $EMULATOR_PID"
fi
echo "   NOTE: Google Play Services may need updates inside the emulator."
echo "---"

exit 0
```

## Zentrale Erkenntnisse für M1-Mac + Emulator + Bumble

*   **API-Level zählt:** Neuer ist für Emulator-Kompatibilität nicht immer besser, besonders bei komplexen Funktionen wie Bluetooth-Bridging. API 32 wirkte in meinen Tests dafür stabiler als API 34.
*   **Explizite Endpunkte:** Verlass dich nicht auf `-packet-streamer-endpoint default`, wenn du eine externe Bridge wie Bumbles Netsim-Controller-Modus verwendest. Zeige dem Emulator explizit auf `localhost:<port>`, wo deine Bridge lauscht.
*   **Netsim-Bridge > QEMU-Socket:** Der `android-netsim`-Bridge-Modus scheint mit modernen Emulatoren eher zu funktionieren als die niedrigere `-qemu -chardev socket`-Methode, auch wenn die Socket-Methode *eine* TCP-Verbindung herstellen kann.
*   **`usb:0` vs. VID:PID:** Auf macOS/M1 kann die Identifikation von USB-Geräten eigenwillig sein. Wenn die exakte VID:PID unerwartet scheitert, versuche den Index `usb:0` (vorausgesetzt, es ist das primäre/beabsichtigte Gerät).
*   **Hartnäckigkeit zahlt sich aus:** Das brauchte mehrere Versuche und die Kombination aus Dokumentation, Websuchen und iterativem Testen. Gib nicht zu schnell auf!

Ich hoffe, dass diese konkrete, funktionierende Konfiguration anderen Entwicklern Stunden an Frust erspart. Viel Spaß beim Coden (und Bridgen)!
