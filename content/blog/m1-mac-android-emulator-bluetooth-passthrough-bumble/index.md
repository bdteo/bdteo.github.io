---
title: "M1 Mac + Android Emulator Bluetooth Nightmare? Bumble & API 32 Saved My Sanity!"
date: "2025-04-14" # Adjust date as needed
slug: "m1-mac-android-emulator-bluetooth-passthrough-bumble"
author: "Boris Teoharov" # Or your preferred author name
description: "Struggling to get Bluetooth working between your M1 Mac and the Android Emulator? Tried everything? This developer's journey reveals the specific Bumble setup and emulator flags that finally worked!"
tags: ["Android Emulator", "Bluetooth", "BLE", "HCI", "Bumble", "macOS", "M1", "Apple Silicon", "Docker", "QEMU", "Netsim", "Passthrough", "Troubleshooting", "API 32"]
featuredImage: "./images/featured.jpg" # Replace with a relevant image path
imageCaption: "Visualizing the complex bridge needed to connect M1 Mac Bluetooth to the Android Emulator."
---

If you're a developer working with Bluetooth on an M1/M2/M3 Mac and trying to get your host machine's Bluetooth radio working inside the Android Emulator, you've probably felt some pain. What seems like it *should* be straightforward often turns into a frustrating rabbit hole of failed connections, cryptic errors, and documentation dead ends. I recently went through this exact battle, and after hitting multiple walls, I finally found a combination using the **Bumble** Python Bluetooth stack that *actually works*.

This isn't just another theoretical guide; this is the blow-by-blow account of what failed and, more importantly, what *succeeded* in bridging my M1 Mac Pro's Bluetooth (via an external USB dongle in my case, but the principle might apply to internal radios) to an Android 12L (API 32) emulator.

## The Goal: Real Bluetooth in the Emulator

The objective was simple: make the Android Emulator use my Mac's physical Bluetooth controller instead of its own limited virtual one. This is crucial for testing apps that interact with real-world Bluetooth devices.

## The Tool: Enter Bumble

[Bumble](https://github.com/google/bumble) is a powerful Python Bluetooth stack. Its key tool for this task is `bumble-hci-bridge`, which can connect to a physical HCI (Host Controller Interface) on one side and expose it via various transports (like TCP or gRPC) on the other.

## Attempt #1: The QEMU Socket Method (The Logical First Try)

Based on general QEMU knowledge and some older guides, the first approach involved using emulator flags to directly connect a virtual serial port (backed by a TCP socket) to the HCI bridge.

1.  **Start the Bridge (TCP Server Mode):** We connected Bumble to the physical dongle (which surprisingly worked better with `usb:0` than its specific VID:PID `usb:0b05:17cb` on my machine – M1 quirks!) and made it listen on a TCP port.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge usb:0 tcp-server:0.0.0.0:6789
    # Output showed '>>> connected' twice - success connecting to USB and starting TCP server.
    ```

2.  **Launch Emulator with QEMU Flags:** We modified the emulator launch script (targeting API 34 initially) to add `-qemu` flags directing a virtual serial port (`virtserialport`) to a character device (`chardev`) backed by a TCP socket connecting to the bridge.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -qemu \
        -device virtio-serial-device \
        -device virtserialport,chardev=bt,name=bt \
        -chardev socket,id=bt,host=localhost,port=6789 \
        ...
    ```

3.  **The Result? Partial Success, Ultimate Failure:** Using `lsof`, we could see the emulator's QEMU process *did* establish a TCP connection to the Bumble bridge! However, the Android Bluetooth stack *inside* the emulator never actually sent any HCI commands over it. Toggling Bluetooth in Android settings did nothing. The bridge logs remained silent after the initial connection. **Dead end.**

## Attempt #2: The Default Netsim Bridge (Following Bumble Docs)

Bumble's documentation mentions bridging to the emulator's "Netsim" gRPC interface. Netsim (and its core, Root Canal) is the emulator's newer virtual Bluetooth controller system.

1.  **Start the Bridge (Netsim Controller Mode):** We configured the bridge to act as a Netsim controller, listening on the default gRPC port (8554), and connecting to the physical dongle.
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    # Output showed '>>> connected' twice - success connecting to USB and starting Netsim gRPC server.
    ```

2.  **Launch Emulator (Default Backend):** We reverted the launch script (still trying API 34) to remove the `-qemu` flags and added `-packet-streamer-endpoint default` to ensure it tried to use the Netsim backend.
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -packet-streamer-endpoint default \
        ...
    ```

3.  **The Result? No Connection:** This time, the emulator launched, but the Bumble bridge showed no signs of an incoming gRPC connection from the emulator. Checking the emulator logs didn't reveal obvious connection errors, but Bluetooth remained unusable. **Another dead end.**

## Attempt #3: API Downgrade + Explicit Netsim Endpoint (The Winner!)

<figure>
  <img src="featured-2.jpg" alt="Symbolic bridge between Apple and Android platforms">
  <figcaption>
    Fig1. – A surreal landscape where failed network cables dangle between Apple and Android rock formations, while a single Bumble-branded rope bridge successfully connects the two, allowing glowing data packets to cross the divide.
  </figcaption>
</figure>


Web searches revealed general instability reports with Bluetooth on API 33/34 emulators and potential issues with how the emulator discovers or connects to the Netsim backend, especially when an external tool tries to intercept it. The key seemed to be **explicitly telling the emulator where the Netsim gRPC server was** and **trying an older API level**.

1.  **Start the Bridge (Netsim Controller Mode, Explicit Port, `usb:0`):** Same as Attempt #2, ensuring it listens on a known port (`8554`) and connects to the physical dongle using the index (`usb:0`) that worked reliably.
    ```bash
    # In Terminal 1: (Keep this running!)
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```

2.  **Modify and Launch Emulator (API 32, Explicit Endpoint):** We created an **API 32 (Android 12L)** AVD with Google Play Services (`gplay_32_arm`). We modified the launch script to target this AVD and, crucially, changed the `-packet-streamer-endpoint` flag from `default` to the *exact* address of our bridge.
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

3.  **The Result? Success!** This time, it worked!
    *   The `bumble-hci-bridge` terminal started showing gRPC connection logs from the emulator shortly after launch.
    *   Once the emulator booted, toggling Bluetooth ON in Android Settings resulted in a flood of HCI commands (Reset, Read Version, Set Event Mask, etc.) appearing in the bridge terminal.
    *   Scanning for devices within the emulator successfully used the Mac's physical Bluetooth radio via the ASUS dongle!

## The Winning Recipe: Step-by-Step

Here's the exact procedure that worked on my M1 Mac Pro with an external ASUS USB-BT500 dongle:

1.  **Install Bumble:**
    ```bash
    python3 -m pip install bumble
    # Potentially install libusb if needed: brew install libusb
    ```

2.  **(Optional but Recommended) Disable macOS Native USB BT Handling:** Run *once* and **reboot**.
    ```bash
    sudo nvram bluetoothHostControllerSwitchBehavior="never"
    ```

3.  **Start the Bumble Netsim Bridge:** Open a terminal and run (keep it running):
    ```bash
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```
    *(Verify it shows `>>> connected` twice).*

4.  **Prepare the Emulator Launch Script:** Save the *full script* provided below as `launch_gapps_avd_api32.sh` (or similar). Make sure it targets an **API 32** AVD (it will create one named `gplay_32_arm` if it doesn't exist) and explicitly uses `-packet-streamer-endpoint localhost:8554`. Make it executable (`chmod +x launch_gapps_avd_api32.sh`).

5.  **Run the Launch Script:** Open a *new* terminal and execute the script:
    ```bash
    ./launch_gapps_avd_api32.sh
    ```

6.  **Verify:** Once the emulator boots:
    *   Check the `bumble-hci-bridge` terminal for gRPC and HCI traffic.
    *   Go to Android Settings -> Bluetooth and toggle it ON.
    *   Try scanning or pairing.

## The Successful Launch Script (API 32, Explicit Netsim Endpoint)

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

## Key Takeaways for M1 Mac + Emulator + Bumble

*   **API Level Matters:** Newer isn't always better for emulator compatibility, especially with complex features like Bluetooth bridging. API 32 seemed more stable for this than API 34 in my tests.
*   **Explicit Endpoints:** Don't rely on `-packet-streamer-endpoint default` when using an external bridge like Bumble's Netsim controller mode. Explicitly point the emulator to `localhost:<port>` where your bridge is listening.
*   **Netsim Bridge > QEMU Socket:** The `android-netsim` bridge mode seems more likely to work with modern emulators than the lower-level `-qemu -chardev socket` method, even though the socket method *can* establish a TCP link.
*   **`usb:0` vs VID:PID:** On macOS/M1, identifying USB devices can be quirky. If specifying the exact VID:PID fails unexpectedly, try using the index `usb:0` (assuming it's the primary/intended device).
*   **Persistence Pays Off:** This took several attempts, combining insights from documentation, web searches, and iterative testing. Don't give up easily!

Hopefully, sharing this specific, working configuration saves other developers hours of frustration. Happy coding (and bridging)!

