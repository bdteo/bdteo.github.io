---
lang: "bg"
translationOf: "m1-mac-android-emulator-bluetooth-passthrough-bumble"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "9b0bdbf16352f96c"
title: "Поправяне на Bluetooth в Android Emulator на M1 Mac с Bumble и API 32"
date: "2025-04-14"
slug: "m1-mac-android-emulator-bluetooth-passthrough-bumble"
author: "Boris Teoharov"
description: "Поправете Bluetooth passthrough за Android Emulator на M1 Mac. Ръководството описва работещата настройка с Bumble, Netsim, изрични endpoints и API 32 AVD."
tags: ["Android Emulator", "Bluetooth", "BLE", "HCI", "Bumble", "macOS", "M1", "Apple Silicon", "Docker", "QEMU", "Netsim", "Passthrough", "Troubleshooting", "API 32"]
featuredImage: "./images/featured.jpg"
imageCaption: "Два модерни телефона лежат с екрана надолу върху мрамор. Блед цианов ореол пресича пролуката между тях."
audioUrl: "/audio/articles/m1-mac-android-emulator-bluetooth-passthrough-bumble/bg/5egO01tkUjEzu7xSSE8M-9c80b35993b7.m4a"
audioDuration: "11:18"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/m1-mac-android-emulator-bluetooth-passthrough-bumble.bg.md"
---

Ако разработвате с Bluetooth на M1/M2/M3 Mac и се опитвате да накарате Bluetooth радиото на хост машината да работи вътре в Android Emulator, вероятно вече сте усетили болката. Нещо, което изглежда сякаш *трябва* да е право напред, често се превръща в дразнеща дупка от неуспешни връзки, криптични грешки и документационни задънени улици. Наскоро минах през точно тази битка и след няколко стени най-сетне намерих комбинация с Python Bluetooth стека **Bumble**, която *наистина работи*.

Това не е поредното теоретично ръководство; това е разказ стъпка по стъпка за това какво се провали и, по-важното, какво *успя* при свързването на Bluetooth-а на моя M1 Mac Pro (в моя случай през външен USB dongle, но принципът може да важи и за вътрешни радиа) към Android 12L (API 32) emulator.

## Целта: истински Bluetooth в емулатора

Целта беше проста: Android Emulator да използва физическия Bluetooth controller на моя Mac вместо собствения си ограничен виртуален controller. Това е решаващо за тестване на приложения, които взаимодействат с реални Bluetooth устройства.

## Инструментът: Bumble влиза в кадър

[Bumble](https://github.com/google/bumble) е мощен Python Bluetooth stack. Ключовият му инструмент за тази задача е `bumble-hci-bridge`, който може от едната страна да се свърже с физически HCI (Host Controller Interface), а от другата да го изложи през различни transports (като TCP или gRPC).

## Опит #1: QEMU socket методът (логичният първи опит)

На база общи познания за QEMU и някои по-стари ръководства първият подход беше да използвам emulator flags, за да свържа директно виртуален serial port (подпрян от TCP socket) към HCI bridge.

1.  **Стартиране на bridge-а (TCP server mode):** Свързахме Bumble към физическия dongle (който изненадващо работеше по-добре с `usb:0`, отколкото с конкретния му VID:PID `usb:0b05:17cb` на моята машина - M1 особености!) и го накарахме да слуша на TCP port.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge usb:0 tcp-server:0.0.0.0:6789
    # Output showed '>>> connected' twice - success connecting to USB and starting TCP server.
    ```

2.  **Стартиране на емулатора с QEMU flags:** Променихме emulator launch script-а (първоначално за API 34), за да добавим `-qemu` flags, които насочват virtual serial port (`virtserialport`) към character device (`chardev`), подпряно от TCP socket, свързващ се към bridge-а.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -qemu \
        -device virtio-serial-device \
        -device virtserialport,chardev=bt,name=bt \
        -chardev socket,id=bt,host=localhost,port=6789 \
        ...
    ```

3.  **Резултатът? Частичен успех, окончателен провал:** С `lsof` виждахме, че QEMU процесът на емулатора *наистина* установи TCP връзка към Bumble bridge-а! Android Bluetooth stack-ът *вътре* в емулатора обаче така и не изпрати HCI commands през нея. Включването и изключването на Bluetooth в Android settings не правеше нищо. Bridge logs останаха тихи след първоначалната връзка. **Задънена улица.**

## Опит #2: Default Netsim bridge (следвайки Bumble docs)

Документацията на Bumble споменава bridging към "Netsim" gRPC interface-а на емулатора. Netsim (и неговото ядро Root Canal) е по-новата система на емулатора за virtual Bluetooth controller.

1.  **Стартиране на bridge-а (Netsim controller mode):** Настроихме bridge-а да действа като Netsim controller, да слуша на default gRPC port (8554) и да се свърже с физическия dongle.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    # Output showed '>>> connected' twice - success connecting to USB and starting Netsim gRPC server.
    ```

2.  **Стартиране на емулатора (default backend):** Върнахме launch script-а (все още опитвайки с API 34), махнахме `-qemu` flags и добавихме `-packet-streamer-endpoint default`, за да сме сигурни, че се опитва да използва Netsim backend-а.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -packet-streamer-endpoint default \
        ...
    ```

3.  **Резултатът? Няма връзка:** Този път емулаторът тръгна, но Bumble bridge-ът не показа никакви признаци за входяща gRPC връзка от емулатора. Прегледът на emulator logs не разкри очевидни connection errors, но Bluetooth остана неизползваем. **Още една задънена улица.**

## Опит #3: API downgrade + explicit Netsim endpoint (победителят!)

<figure>
  <img src="featured-2.jpg" alt="Символичен мост между платформите Apple и Android">
  <figcaption>
    Fig1. - Сюрреалистичен пейзаж, в който провалени network cables висят между Apple и Android скални формации, докато един-единствен мост от въжета с Bumble branding успешно свързва двете страни и позволява на светещи data packets да прекосят пропастта.
  </figcaption>
</figure>


Web searches разкриха общи reports за нестабилност с Bluetooth на API 33/34 емулатори и потенциални проблеми с това как емулаторът открива или се свързва с Netsim backend-а, особено когато външен инструмент се опитва да го прихване. Ключът изглежда беше **изрично да кажем на емулатора къде е Netsim gRPC server-ът** и **да пробваме по-стар API level**.

1.  **Стартиране на bridge-а (Netsim controller mode, explicit port, `usb:0`):** Същото като в Опит #2, като се уверим, че слуша на известен port (`8554`) и се свързва с физическия dongle чрез index-а (`usb:0`), който работеше надеждно.
    ```bash
    # In Terminal 1: (Keep this running!)
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```

2.  **Промяна и стартиране на емулатора (API 32, explicit endpoint):** Създадохме **API 32 (Android 12L)** AVD с Google Play Services (`gplay_32_arm`). Променихме launch script-а да target-ва този AVD и, решаващо, сменихме `-packet-streamer-endpoint` flag-а от `default` към *точния* address на нашия bridge.
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

3.  **Резултатът? Успех!** Този път проработи!
    *   Терминалът с `bumble-hci-bridge` започна да показва gRPC connection logs от емулатора малко след launch-а.
    *   След като емулаторът boot-на, включването на Bluetooth ON в Android Settings доведе до поток от HCI commands (Reset, Read Version, Set Event Mask и т.н.) в bridge terminal-а.
    *   Scanning за устройства вътре в емулатора успешно използва физическото Bluetooth radio на Mac през ASUS dongle-а!

## Печелившата рецепта: стъпка по стъпка

Ето точната процедура, която проработи на моя M1 Mac Pro с външен ASUS USB-BT500 dongle:

1.  **Инсталирайте Bumble:**
    ```bash
    python3 -m pip install bumble
    # Potentially install libusb if needed: brew install libusb
    ```

2.  **(По желание, но препоръчително) Изключете native USB BT handling-а на macOS:** Пуснете *веднъж* и **reboot**.
    ```bash
    sudo nvram bluetoothHostControllerSwitchBehavior="never"
    ```

3.  **Стартирайте Bumble Netsim bridge-а:** Отворете terminal и пуснете (оставете го да работи):
    ```bash
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```
    *(Проверете, че показва `>>> connected` два пъти).*

4.  **Подгответе emulator launch script-а:** Запазете *пълния script*, даден по-долу, като `launch_gapps_avd_api32.sh` (или подобно). Уверете се, че target-ва **API 32** AVD (ще създаде такъв с име `gplay_32_arm`, ако не съществува) и изрично използва `-packet-streamer-endpoint localhost:8554`. Направете го executable (`chmod +x launch_gapps_avd_api32.sh`).

5.  **Пуснете launch script-а:** Отворете *нов* terminal и изпълнете script-а:
    ```bash
    ./launch_gapps_avd_api32.sh
    ```

6.  **Проверете:** След като емулаторът boot-не:
    *   Проверете `bumble-hci-bridge` terminal-а за gRPC и HCI traffic.
    *   Отидете в Android Settings -> Bluetooth и го включете ON.
    *   Пробвайте scanning или pairing.

## Успешният launch script (API 32, explicit Netsim endpoint)

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

## Ключови изводи за M1 Mac + Emulator + Bumble

*   **API level има значение:** По-новото не винаги е по-добро за emulator compatibility, особено при сложни features като Bluetooth bridging. API 32 изглеждаше по-стабилен за това от API 34 в моите тестове.
*   **Explicit endpoints:** Не разчитайте на `-packet-streamer-endpoint default`, когато използвате външен bridge като Netsim controller mode-а на Bumble. Насочете емулатора изрично към `localhost:<port>`, където bridge-ът слуша.
*   **Netsim bridge > QEMU socket:** `android-netsim` bridge mode изглежда по-вероятно да работи с modern emulators от по-нисконивовия `-qemu -chardev socket` метод, въпреки че socket методът *може* да установи TCP link.
*   **`usb:0` срещу VID:PID:** На macOS/M1 идентифицирането на USB devices може да е странно. Ако посочването на точния VID:PID се провали неочаквано, пробвайте да използвате index-а `usb:0` (ако приемем, че това е primary/intended device-ът).
*   **Упоритостта се отплаща:** Това отне няколко опита, комбинирайки insights от документация, web searches и iterative testing. Не се отказвайте твърде лесно!

Надявам се споделянето на тази конкретна, работеща конфигурация да спести на други разработчици часове раздразнение. Happy coding (and bridging)!
