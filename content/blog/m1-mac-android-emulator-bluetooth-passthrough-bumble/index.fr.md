---
lang: "fr"
translationOf: "m1-mac-android-emulator-bluetooth-passthrough-bumble"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "9b0bdbf16352f96c"
title: "Corriger le Bluetooth de l'émulateur Android sur Mac M1 avec Bumble et l'API 32"
date: "2025-04-14"
description: "Corriger le passthrough Bluetooth de l'émulateur Android sur Mac M1. Ce guide détaille la configuration Bumble qui a fonctionné, avec Netsim, points d'accès explicites, et AVD API 32."
tags: ["Android Emulator", "Bluetooth", "BLE", "HCI", "Bumble", "macOS", "M1", "Apple Silicon", "Docker", "QEMU", "Netsim", "Passthrough", "Troubleshooting", "API 32"]
featuredImage: "./images/featured.jpg"
imageCaption: "Deux téléphones modernes posés face contre marbre. Un léger halo cyan traverse l'espace entre eux."
---

Si vous développez avec Bluetooth sur un Mac M1/M2/M3 et que vous essayez de faire fonctionner la radio Bluetooth de votre machine hôte dans l'émulateur Android, vous avez probablement déjà souffert un peu. Ce qui semble *devoir* être simple se transforme souvent en tunnel frustrant de connexions ratées, d'erreurs cryptiques et de documentation qui s'arrête juste avant l'endroit utile. Je viens de traverser exactement cette bataille, et après plusieurs murs, j'ai fini par trouver une combinaison avec la pile Bluetooth Python **Bumble** qui *fonctionne vraiment*.

Ce n'est pas encore un guide théorique de plus ; c'est le récit pas à pas de ce qui a échoué et, surtout, de ce qui a *réussi* pour relier le Bluetooth de mon Mac Pro M1 (via un dongle USB externe dans mon cas, même si le principe pourrait s'appliquer aux radios internes) à un émulateur Android 12L (API 32).

## L'objectif : du vrai Bluetooth dans l'émulateur

L'objectif était simple : faire utiliser à l'émulateur Android le contrôleur Bluetooth physique de mon Mac au lieu de son contrôleur virtuel limité. C'est crucial pour tester des applications qui interagissent avec de vrais appareils Bluetooth.

## L'outil : entre en scène Bumble

[Bumble](https://github.com/google/bumble) est une puissante pile Bluetooth en Python. Son outil clé pour cette tâche est `bumble-hci-bridge`, qui peut se connecter à une interface HCI physique (Host Controller Interface) d'un côté et l'exposer via différents transports (comme TCP ou gRPC) de l'autre.

## Tentative n°1 : la méthode socket QEMU (le premier essai logique)

À partir de connaissances générales sur QEMU et de quelques anciens guides, la première approche consistait à utiliser des flags de l'émulateur pour connecter directement un port série virtuel (adossé à une socket TCP) au bridge HCI.

1.  **Démarrer le bridge (mode serveur TCP) :** Nous avons connecté Bumble au dongle physique (qui, étonnamment, fonctionnait mieux avec `usb:0` qu'avec son VID:PID spécifique `usb:0b05:17cb` sur ma machine — les bizarreries du M1 !) et l'avons fait écouter sur un port TCP.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge usb:0 tcp-server:0.0.0.0:6789
    # Output showed '>>> connected' twice - success connecting to USB and starting TCP server.
    ```

2.  **Lancer l'émulateur avec des flags QEMU :** Nous avons modifié le script de lancement de l'émulateur (en ciblant d'abord l'API 34) pour ajouter des flags `-qemu` qui dirigeaient un port série virtuel (`virtserialport`) vers un périphérique de caractères (`chardev`) adossé à une socket TCP connectée au bridge.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -qemu \
        -device virtio-serial-device \
        -device virtserialport,chardev=bt,name=bt \
        -chardev socket,id=bt,host=localhost,port=6789 \
        ...
    ```

3.  **Le résultat ? Succès partiel, échec final :** Avec `lsof`, nous pouvions voir que le processus QEMU de l'émulateur *établissait bien* une connexion TCP vers le bridge Bumble. Pourtant, la pile Bluetooth Android *à l'intérieur* de l'émulateur n'envoyait jamais réellement de commandes HCI dessus. Activer ou désactiver le Bluetooth dans les réglages Android ne faisait rien. Les logs du bridge restaient silencieux après la connexion initiale. **Impasse.**

## Tentative n°2 : le bridge Netsim par défaut (en suivant la documentation Bumble)

La documentation de Bumble mentionne un bridge vers l'interface gRPC « Netsim » de l'émulateur. Netsim (et son cœur, Root Canal) est le système plus récent de contrôleur Bluetooth virtuel de l'émulateur.

1.  **Démarrer le bridge (mode contrôleur Netsim) :** Nous avons configuré le bridge pour agir comme un contrôleur Netsim, écouter sur le port gRPC par défaut (8554), et se connecter au dongle physique.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    # Output showed '>>> connected' twice - success connecting to USB and starting Netsim gRPC server.
    ```

2.  **Lancer l'émulateur (backend par défaut) :** Nous avons remis le script de lancement en arrière (toujours avec l'API 34) pour retirer les flags `-qemu` et ajouter `-packet-streamer-endpoint default`, afin de nous assurer qu'il tente d'utiliser le backend Netsim.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -packet-streamer-endpoint default \
        ...
    ```

3.  **Le résultat ? Aucune connexion :** Cette fois, l'émulateur démarrait, mais le bridge Bumble ne montrait aucun signe d'une connexion gRPC entrante depuis l'émulateur. Les logs de l'émulateur ne révélaient pas d'erreur de connexion évidente, mais le Bluetooth restait inutilisable. **Encore une impasse.**

## Tentative n°3 : rétrograder l'API + endpoint Netsim explicite (la bonne !)

<figure>
  <img src="featured-2.jpg" alt="Pont symbolique entre les plateformes Apple et Android">
  <figcaption>
    Fig1. – Un paysage surréaliste où des câbles réseau ratés pendent entre des formations rocheuses Apple et Android, tandis qu'un seul pont de corde marqué Bumble relie les deux avec succès et laisse passer des paquets de données lumineux.
  </figcaption>
</figure>


Des recherches web ont révélé des signalements d'instabilité générale avec le Bluetooth sur les émulateurs API 33/34 et de possibles problèmes dans la manière dont l'émulateur découvre ou se connecte au backend Netsim, surtout quand un outil externe tente de l'intercepter. La clé semblait être de **dire explicitement à l'émulateur où se trouvait le serveur gRPC Netsim** et d'**essayer un niveau d'API plus ancien**.

1.  **Démarrer le bridge (mode contrôleur Netsim, port explicite, `usb:0`) :** Comme dans la tentative n°2, en veillant à ce qu'il écoute sur un port connu (`8554`) et se connecte au dongle physique avec l'index (`usb:0`) qui fonctionnait de manière fiable.
    ```bash
    # In Terminal 1: (Keep this running!)
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```

2.  **Modifier et lancer l'émulateur (API 32, endpoint explicite) :** Nous avons créé un AVD **API 32 (Android 12L)** avec Google Play Services (`gplay_32_arm`). Nous avons modifié le script de lancement pour cibler cet AVD et, point crucial, remplacé le flag `-packet-streamer-endpoint` de `default` par l'adresse *exacte* de notre bridge.
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

3.  **Le résultat ? Réussite !** Cette fois, ça a marché !
    *   Le terminal `bumble-hci-bridge` a commencé à afficher des logs de connexion gRPC depuis l'émulateur peu après le lancement.
    *   Une fois l'émulateur démarré, activer le Bluetooth dans les réglages Android a provoqué une avalanche de commandes HCI (Reset, Read Version, Set Event Mask, etc.) dans le terminal du bridge.
    *   La recherche d'appareils depuis l'émulateur utilisait bien la radio Bluetooth physique du Mac via le dongle ASUS.

## La recette gagnante : pas à pas

Voici la procédure exacte qui a fonctionné sur mon Mac Pro M1 avec un dongle externe ASUS USB-BT500 :

1.  **Installer Bumble :**
    ```bash
    python3 -m pip install bumble
    # Potentially install libusb if needed: brew install libusb
    ```

2.  **(Optionnel mais recommandé) Désactiver la prise en charge USB BT native de macOS :** À exécuter *une seule fois*, puis **redémarrer**.
    ```bash
    sudo nvram bluetoothHostControllerSwitchBehavior="never"
    ```

3.  **Démarrer le bridge Bumble Netsim :** Ouvrez un terminal et lancez (gardez-le ouvert) :
    ```bash
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```
    *(Vérifiez qu'il affiche `>>> connected` deux fois.)*

4.  **Préparer le script de lancement de l'émulateur :** Enregistrez le *script complet* fourni ci-dessous sous le nom `launch_gapps_avd_api32.sh` (ou similaire). Assurez-vous qu'il cible un AVD **API 32** (il en créera un nommé `gplay_32_arm` s'il n'existe pas) et qu'il utilise explicitement `-packet-streamer-endpoint localhost:8554`. Rendez-le exécutable (`chmod +x launch_gapps_avd_api32.sh`).

5.  **Lancer le script :** Ouvrez un *nouveau* terminal et exécutez le script :
    ```bash
    ./launch_gapps_avd_api32.sh
    ```

6.  **Vérifier :** Une fois l'émulateur démarré :
    *   Consultez le terminal `bumble-hci-bridge` pour voir le trafic gRPC et HCI.
    *   Allez dans Android Settings -> Bluetooth et activez-le.
    *   Essayez de scanner ou d'appairer un appareil.

## Le script de lancement qui a réussi (API 32, endpoint Netsim explicite)

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

## Points clés pour Mac M1 + émulateur + Bumble

*   **Le niveau d'API compte :** Plus récent ne veut pas toujours dire meilleur pour la compatibilité de l'émulateur, surtout avec des fonctions complexes comme le bridge Bluetooth. L'API 32 semblait plus stable pour cela que l'API 34 dans mes tests.
*   **Endpoints explicites :** Ne comptez pas sur `-packet-streamer-endpoint default` quand vous utilisez un bridge externe comme le mode contrôleur Netsim de Bumble. Pointez explicitement l'émulateur vers `localhost:<port>`, là où votre bridge écoute.
*   **Bridge Netsim > socket QEMU :** Le mode bridge `android-netsim` semble plus susceptible de fonctionner avec les émulateurs modernes que la méthode plus bas niveau `-qemu -chardev socket`, même si la méthode socket *peut* établir un lien TCP.
*   **`usb:0` vs VID:PID :** Sur macOS/M1, l'identification des périphériques USB peut être capricieuse. Si spécifier le VID:PID exact échoue sans raison apparente, essayez d'utiliser l'index `usb:0` (en supposant que ce soit le périphérique principal/prévu).
*   **La persévérance paie :** Il a fallu plusieurs tentatives, en combinant des indices venus de la documentation, de recherches web et de tests itératifs. Ne lâchez pas trop vite !

J'espère que ce partage de configuration précise et fonctionnelle fera gagner des heures de frustration à d'autres développeurs. Bon code (et bon bridging) !
