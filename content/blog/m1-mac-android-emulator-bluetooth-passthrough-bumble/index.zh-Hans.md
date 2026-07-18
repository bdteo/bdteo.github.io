---
lang: "zh-Hans"
translationOf: "m1-mac-android-emulator-bluetooth-passthrough-bumble"
translationUpdatedAt: "2026-05-18"
translationSourceHash: "9b0bdbf16352f96c"
title: "用 Bumble 和 API 32 修好 M1 Mac 上的 Android Emulator 蓝牙"
date: "2025-04-14"
description: "修复 M1 Mac 上 Android Emulator 的蓝牙透传。本指南记录了用 Netsim、显式端点和 API 32 AVD 成功跑通 Bumble 的设置。"
featuredImage: "./images/featured.jpg"
tags: ["Android Emulator", "Bluetooth", "BLE", "HCI", "Bumble", "macOS", "M1", "Apple Silicon", "Docker", "QEMU", "Netsim", "Passthrough", "Troubleshooting", "API 32"]
imageCaption: "两台现代手机屏幕朝下放在大理石上。一道很淡的青色光晕横跨它们之间的缝隙。"
audioUrl: "/audio/articles/m1-mac-android-emulator-bluetooth-passthrough-bumble/zh-Hans/EttSxNTvxX50EUdRPQQl-198849f36ba8.m4a"
audioDuration: "10:59"
audioVoice: "Jordan Li (ElevenLabs Mandarin grounded)"
audioGeneratedAt: "2026-07-18"
audioTextSource: "content/tts/m1-mac-android-emulator-bluetooth-passthrough-bumble.zh-Hans.md"
---

如果你是在 M1/M2/M3 Mac 上做蓝牙相关开发，又想让 Android Emulator 使用宿主机的蓝牙无线电，大概已经吃过一点苦头。看起来*应该*很直接的事情，常常会变成一个让人恼火的洞：连接失败、错误信息晦涩、文档走到死路。我最近正好打完这场仗，撞了几堵墙之后，终于找到了一套使用 **Bumble** Python 蓝牙栈的组合，它*真的能工作*。

这不是又一篇理论指南；这是一次逐步记录：哪些方案失败了，更重要的是，哪套方案*成功*把我的 M1 Mac Pro 蓝牙（我这里通过外接 USB dongle，不过原理可能也适用于内置无线电）桥接到了 Android 12L（API 32）模拟器里。

## 目标：模拟器里的真实蓝牙

目标很简单：让 Android Emulator 使用我 Mac 的物理蓝牙控制器，而不是它自己有限的虚拟控制器。测试那些会和真实蓝牙设备交互的 App 时，这一点很关键。

## 工具：Bumble 上场

[Bumble](https://github.com/google/bumble) 是一个强大的 Python 蓝牙栈。完成这件事的核心工具是 `bumble-hci-bridge`，它可以一边连接物理 HCI（Host Controller Interface），另一边通过各种传输方式（比如 TCP 或 gRPC）暴露出来。

## 尝试 #1：QEMU Socket 方法（合乎逻辑的第一步）

基于一般的 QEMU 知识和一些较老的指南，第一种思路是用 emulator flags，把一个虚拟串口（底层由 TCP socket 支撑）直接连接到 HCI bridge。

1.  **启动 Bridge（TCP Server 模式）：** 我们把 Bumble 连到物理 dongle（在我的机器上，令人意外的是 `usb:0` 比它具体的 VID:PID `usb:0b05:17cb` 更好用，M1 的小脾气！），然后让它监听一个 TCP 端口。
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge usb:0 tcp-server:0.0.0.0:6789
    # Output showed '>>> connected' twice - success connecting to USB and starting TCP server.
    ```

2.  **带 QEMU Flags 启动模拟器：** 我们修改了模拟器启动脚本（最初目标是 API 34），加入 `-qemu` flags，把一个虚拟串口（`virtserialport`）指向一个字符设备（`chardev`），而这个字符设备由连接到 bridge 的 TCP socket 支撑。
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -qemu \
        -device virtio-serial-device \
        -device virtserialport,chardev=bt,name=bt \
        -chardev socket,id=bt,host=localhost,port=6789 \
        ...
    ```

3.  **结果？部分成功，最终失败：** 通过 `lsof`，我们可以看到 emulator 的 QEMU 进程*确实*和 Bumble bridge 建立了 TCP 连接！然而，模拟器*内部*的 Android 蓝牙栈从未真正通过它发送任何 HCI 命令。在 Android 设置里切换蓝牙没有任何效果。初始连接之后，bridge 日志一直安静。**死路。**

## 尝试 #2：默认 Netsim Bridge（按 Bumble 文档来）

Bumble 文档提到了桥接到模拟器的 “Netsim” gRPC 接口。Netsim（以及它的核心 Root Canal）是模拟器较新的虚拟蓝牙控制器系统。

1.  **启动 Bridge（Netsim Controller 模式）：** 我们把 bridge 配成 Netsim controller，让它监听默认 gRPC 端口（8554），并连接到物理 dongle。
    ```bash
    # In Terminal 1:
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    # Output showed '>>> connected' twice - success connecting to USB and starting Netsim gRPC server.
    ```

2.  **启动模拟器（默认后端）：** 我们把启动脚本恢复回去（仍在尝试 API 34），移除 `-qemu` flags，并加入 `-packet-streamer-endpoint default`，确保它尝试使用 Netsim 后端。
    ```bash
    # Snippet from launch script:
    emulator -avd <avd_name> ... \
        -packet-streamer-endpoint default \
        ...
    ```

3.  **结果？没有连接：** 这次模拟器启动了，但 Bumble bridge 完全没有显示来自模拟器的 gRPC 连接。检查模拟器日志也没有明显的连接错误，但蓝牙仍然不可用。**又一条死路。**

## 尝试 #3：降级 API + 显式 Netsim 端点（赢家！）

<figure>
  <img src="featured-2.jpg" alt="Apple 和 Android 平台之间的象征性桥梁">
  <figcaption>
    Fig1. - 一片超现实景观里，失败的网线垂在 Apple 与 Android 岩体之间；一座标着 Bumble 的绳桥成功连接两端，让发光的数据包跨过裂隙。
  </figcaption>
</figure>


网上搜索显示，API 33/34 模拟器上的蓝牙有不少不稳定报告；模拟器发现或连接 Netsim 后端的方式也可能有问题，尤其是有外部工具试图拦截它时。关键似乎是：**显式告诉模拟器 Netsim gRPC server 在哪里**，并且**尝试更老的 API 级别**。

1.  **启动 Bridge（Netsim Controller 模式，显式端口，`usb:0`）：** 和尝试 #2 一样，确保它监听已知端口（`8554`），并用之前稳定工作的索引（`usb:0`）连接物理 dongle。
    ```bash
    # In Terminal 1: (Keep this running!)
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```

2.  **修改并启动模拟器（API 32，显式端点）：** 我们创建了一个带 Google Play Services 的 **API 32（Android 12L）** AVD（`gplay_32_arm`）。我们修改启动脚本，让它指向这个 AVD；更关键的是，把 `-packet-streamer-endpoint` flag 从 `default` 改成 bridge 的*确切*地址。
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

3.  **结果？成功！** 这次它工作了。
    *   `bumble-hci-bridge` 终端在模拟器启动后不久开始显示来自模拟器的 gRPC 连接日志。
    *   模拟器启动完成后，在 Android Settings 里打开 Bluetooth，bridge 终端里立刻涌出一串 HCI 命令（Reset、Read Version、Set Event Mask 等）。
    *   在模拟器内扫描设备时，确实通过 ASUS dongle 使用了 Mac 的物理蓝牙无线电。

## 成功配方：一步一步来

下面是我的 M1 Mac Pro 搭配外接 ASUS USB-BT500 dongle 时实际成功的步骤：

1.  **安装 Bumble：**
    ```bash
    python3 -m pip install bumble
    # Potentially install libusb if needed: brew install libusb
    ```

2.  **（可选但推荐）禁用 macOS 原生 USB BT 处理：** 运行*一次*，然后**重启**。
    ```bash
    sudo nvram bluetoothHostControllerSwitchBehavior="never"
    ```

3.  **启动 Bumble Netsim Bridge：** 打开一个终端运行（保持它运行）：
    ```bash
    sudo python3 -m bumble.apps.hci_bridge android-netsim:_:8554,mode=controller usb:0
    ```
    *（确认它显示两次 `>>> connected`。）*

4.  **准备模拟器启动脚本：** 把下面提供的*完整脚本*保存为 `launch_gapps_avd_api32.sh`（或类似名字）。确认它指向 **API 32** AVD（如果不存在，会创建名为 `gplay_32_arm` 的 AVD），并且显式使用 `-packet-streamer-endpoint localhost:8554`。给它执行权限（`chmod +x launch_gapps_avd_api32.sh`）。

5.  **运行启动脚本：** 打开一个*新*终端执行脚本：
    ```bash
    ./launch_gapps_avd_api32.sh
    ```

6.  **验证：** 模拟器启动后：
    *   查看 `bumble-hci-bridge` 终端是否有 gRPC 和 HCI 流量。
    *   进入 Android Settings -> Bluetooth，把它打开。
    *   尝试扫描或配对。

## 成功的启动脚本（API 32，显式 Netsim 端点）

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

## M1 Mac + Emulator + Bumble 的关键结论

*   **API 级别很重要：** 对模拟器兼容性来说，更新不总是更好，尤其是蓝牙桥接这种复杂功能。在我的测试里，API 32 比 API 34 更稳定。
*   **显式端点：** 使用 Bumble 的 Netsim controller mode 这类外部 bridge 时，不要依赖 `-packet-streamer-endpoint default`。直接把模拟器指向 bridge 正在监听的 `localhost:<port>`。
*   **Netsim Bridge > QEMU Socket：** `android-netsim` bridge mode 比更底层的 `-qemu -chardev socket` 方法更可能和现代模拟器正常配合，哪怕 socket 方法*确实*能建立 TCP 连接。
*   **`usb:0` vs VID:PID：** 在 macOS/M1 上，USB 设备识别可能有点古怪。如果指定精确 VID:PID 意外失败，试试用索引 `usb:0`（假设它就是主要/目标设备）。
*   **坚持有回报：** 这件事试了好几轮，结合了文档、网页搜索和反复测试。别太早放弃。

希望这套具体可工作的配置能帮其他开发者省下几个小时的挫败。祝编码（和桥接）顺利。
