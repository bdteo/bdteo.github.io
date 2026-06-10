---
lang: "es"
translationOf: "m1-mac-android-emulator-bluetooth-passthrough-bumble"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "9b0bdbf16352f96c"
title: "Arreglar el Bluetooth del emulador de Android en un Mac M1 con Bumble y API 32"
date: "2025-04-14" # Adjust date as needed
slug: "m1-mac-android-emulator-bluetooth-passthrough-bumble"
author: "Boris Teoharov" # Or your preferred author name
description: "Arregla el passthrough de Bluetooth para el emulador de Android en Macs M1. La guía detalla la configuración funcional con Bumble usando Netsim, endpoints explícitos y AVDs con API 32."
tags: ["Emulador de Android", "Bluetooth", "BLE", "HCI", "Bumble", "macOS", "M1", "Apple Silicon", "Docker", "QEMU", "Netsim", "Passthrough", "Resolución de problemas", "API 32"]
featuredImage: "./images/featured.jpg" # Replace with a relevant image path
imageCaption: "Dos teléfonos modernos boca abajo sobre mármol. Un tenue halo cian cruza el hueco entre ambos."
---

Si eres desarrollador y trabajas con Bluetooth en un Mac M1/M2/M3 e intentas que la radio Bluetooth de tu máquina anfitriona funcione dentro del emulador de Android, probablemente hayas sentido algo de dolor. Lo que parece que *debería* ser sencillo a menudo se convierte en una frustrante madriguera de conexiones fallidas, errores crípticos y callejones sin salida en la documentación. Hace poco pasé exactamente por esta batalla y, tras chocar contra varios muros, por fin encontré una combinación usando el stack de Bluetooth en Python **Bumble** que *realmente funciona*.

Esto no es otra guía teórica más; es el relato paso a paso de lo que falló y, más importante aún, de lo que *funcionó* para conectar el Bluetooth de mi Mac Pro M1 (a través de un dongle USB externo en mi caso, aunque el principio podría aplicarse a las radios internas) con un emulador de Android 12L (API 32).

## El objetivo: Bluetooth real en el emulador

El objetivo era sencillo: que el emulador de Android usara el controlador Bluetooth físico de mi Mac en lugar de su propio controlador virtual y limitado. Esto es crucial para probar apps que interactúan con dispositivos Bluetooth del mundo real.

## La herramienta: aquí entra Bumble

[Bumble](https://github.com/google/bumble) es un potente stack de Bluetooth en Python. Su herramienta clave para esta tarea es `bumble-hci-bridge`, que puede conectarse a una HCI (Host Controller Interface) física por un lado y exponerla mediante varios transportes (como TCP o gRPC) por el otro.

## Intento n.º 1: el método del socket QEMU (el primer intento lógico)

Basándome en conocimientos generales de QEMU y en algunas guías más antiguas, el primer enfoque consistía en usar flags del emulador para conectar directamente un puerto serie virtual (respaldado por un socket TCP) con el puente HCI.

1.  **Iniciar el puente (modo servidor TCP):** Conectamos Bumble al dongle físico (que, sorprendentemente, funcionó mejor con `usb:0` que con su VID:PID específico `usb:0b05:17cb` en mi máquina, ¡cosas del M1!) y lo pusimos a la escucha en un puerto TCP.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge usb:0 tcp-server:0.0.0.0:6789
    # Output showed '>>> connected' twice - success connecting to USB and starting TCP server.
    ```

2.  **Lanzar el emulador con flags de QEMU:** Modificamos el script de lanzamiento del emulador (apuntando inicialmente a la API 34) para añadir flags `-qemu` que dirigían un puerto serie virtual (`virtserialport`) a un dispositivo de carácter (`chardev`) respaldado por un socket TCP que se conectaba al puente.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -qemu \
        -device virtio-serial-device \
        -device virtserialport,chardev=bt,name=bt \
        -chardev socket,id=bt,host=localhost,port=6789 \
        ...
    ```

3.  **¿El resultado? Éxito parcial, fracaso final:** Usando `lsof`, podíamos ver que el proceso QEMU del emulador *sí* establecía una conexión TCP con el puente Bumble. Sin embargo, el stack de Bluetooth de Android *dentro* del emulador nunca llegó a enviar ningún comando HCI por ella. Activar y desactivar el Bluetooth en los ajustes de Android no hacía nada. Los logs del puente permanecían en silencio tras la conexión inicial. **Callejón sin salida.**

## Intento n.º 2: el puente Netsim por defecto (siguiendo la documentación de Bumble)

La documentación de Bumble menciona la posibilidad de hacer de puente con la interfaz gRPC "Netsim" del emulador. Netsim (y su núcleo, Root Canal) es el sistema de controlador Bluetooth virtual más reciente del emulador.

1.  **Iniciar el puente (modo controlador Netsim):** Configuramos el puente para que actuara como controlador Netsim, a la escucha en el puerto gRPC por defecto (8554), y conectándose al dongle físico.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    # Output showed '>>> connected' twice - success connecting to USB and starting Netsim gRPC server.
    ```

2.  **Lanzar el emulador (backend por defecto):** Revertimos el script de lanzamiento (todavía probando con la API 34) para eliminar los flags `-qemu` y añadimos `-packet-streamer-endpoint default` para asegurarnos de que intentara usar el backend Netsim.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -packet-streamer-endpoint default \
        ...
    ```

3.  **¿El resultado? Sin conexión:** Esta vez el emulador se lanzó, pero el puente Bumble no mostró señales de ninguna conexión gRPC entrante desde el emulador. Revisar los logs del emulador no reveló errores de conexión evidentes, pero el Bluetooth seguía inutilizable. **Otro callejón sin salida.**

## Intento n.º 3: bajar de versión de API + endpoint Netsim explícito (¡el ganador!)

<figure>
  <img src="featured-2.jpg" alt="Symbolic bridge between Apple and Android platforms">
  <figcaption>
    Fig1. – A surreal landscape where failed network cables dangle between Apple and Android rock formations, while a single Bumble-branded rope bridge successfully connects the two, allowing glowing data packets to cross the divide.
  </figcaption>
</figure>


Las búsquedas en la web revelaron informes generales de inestabilidad del Bluetooth en los emuladores con API 33/34 y posibles problemas con la forma en que el emulador descubre o se conecta al backend Netsim, sobre todo cuando una herramienta externa intenta interceptarlo. La clave parecía estar en **indicar explícitamente al emulador dónde se encontraba el servidor gRPC de Netsim** y en **probar con un nivel de API más antiguo**.

1.  **Iniciar el puente (modo controlador Netsim, puerto explícito, `usb:0`):** Igual que en el intento n.º 2, asegurándonos de que escuchara en un puerto conocido (`8554`) y de que se conectara al dongle físico usando el índice (`usb:0`) que funcionaba de forma fiable.
    ```bash
    # In Terminal 1: (Keep this running!)
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```

2.  **Modificar y lanzar el emulador (API 32, endpoint explícito):** Creamos un AVD de **API 32 (Android 12L)** con los Servicios de Google Play (`gplay_32_arm`). Modificamos el script de lanzamiento para apuntar a este AVD y, lo más importante, cambiamos el flag `-packet-streamer-endpoint` de `default` a la dirección *exacta* de nuestro puente.
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

3.  **¿El resultado? ¡Éxito!** ¡Esta vez funcionó!
    *   La terminal de `bumble-hci-bridge` empezó a mostrar logs de conexión gRPC del emulador poco después del lanzamiento.
    *   Una vez que el emulador arrancó, activar el Bluetooth en los Ajustes de Android produjo una avalancha de comandos HCI (Reset, Read Version, Set Event Mask, etc.) que aparecían en la terminal del puente.
    *   ¡El escaneo de dispositivos dentro del emulador usó correctamente la radio Bluetooth física del Mac a través del dongle ASUS!

## La receta ganadora: paso a paso

Este es el procedimiento exacto que funcionó en mi Mac Pro M1 con un dongle USB externo ASUS USB-BT500:

1.  **Instala Bumble:**
    ```bash
    python3 -m pip install bumble
    # Potentially install libusb if needed: brew install libusb
    ```

2.  **(Opcional pero recomendado) Desactiva la gestión nativa de USB BT de macOS:** Ejecútalo *una vez* y **reinicia**.
    ```bash
    sudo nvram bluetoothHostControllerSwitchBehavior="never"
    ```

3.  **Inicia el puente Netsim de Bumble:** Abre una terminal y ejecuta (déjala corriendo):
    ```bash
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```
    *(Verifica que muestre `>>> connected` dos veces).*

4.  **Prepara el script de lanzamiento del emulador:** Guarda el *script completo* que aparece a continuación como `launch_gapps_avd_api32.sh` (o similar). Asegúrate de que apunte a un AVD de **API 32** (creará uno llamado `gplay_32_arm` si no existe) y de que use explícitamente `-packet-streamer-endpoint localhost:8554`. Hazlo ejecutable (`chmod +x launch_gapps_avd_api32.sh`).

5.  **Ejecuta el script de lanzamiento:** Abre una *nueva* terminal y ejecuta el script:
    ```bash
    ./launch_gapps_avd_api32.sh
    ```

6.  **Verifica:** Una vez que el emulador arranque:
    *   Revisa la terminal de `bumble-hci-bridge` en busca de tráfico gRPC y HCI.
    *   Ve a Ajustes de Android -> Bluetooth y actívalo.
    *   Prueba a escanear o a emparejar.

## El script de lanzamiento exitoso (API 32, endpoint Netsim explícito)

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

## Conclusiones clave para Mac M1 + emulador + Bumble

*   **El nivel de API importa:** Lo más nuevo no siempre es mejor para la compatibilidad con el emulador, sobre todo con funciones complejas como el puente de Bluetooth. En mis pruebas, la API 32 resultó más estable para esto que la API 34.
*   **Endpoints explícitos:** No confíes en `-packet-streamer-endpoint default` cuando uses un puente externo como el modo controlador Netsim de Bumble. Apunta el emulador explícitamente a `localhost:<port>`, donde está a la escucha tu puente.
*   **Puente Netsim > socket QEMU:** El modo de puente `android-netsim` parece tener más probabilidades de funcionar con los emuladores modernos que el método de más bajo nivel `-qemu -chardev socket`, aunque el método del socket *sí* puede establecer un enlace TCP.
*   **`usb:0` frente a VID:PID:** En macOS/M1, identificar dispositivos USB puede ser caprichoso. Si especificar el VID:PID exacto falla de forma inesperada, prueba a usar el índice `usb:0` (suponiendo que sea el dispositivo principal/deseado).
*   **La perseverancia da frutos:** Esto llevó varios intentos, combinando ideas de la documentación, búsquedas en la web y pruebas iterativas. ¡No te rindas a la primera!

Espero que compartir esta configuración concreta y funcional ahorre a otros desarrolladores horas de frustración. ¡Feliz programación (y feliz puente)!
