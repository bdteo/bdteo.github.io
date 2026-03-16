---
title: "BlueZ Pairing Fix: External Python Agent & D-Bus Polling"
date: "2025-04-08"
slug: "bluez-pairing-python-agent-workaround-authentication-failed"
author: "Boris Teoharov"
description: "Solve BlueZ pairing 'AuthenticationFailed' errors on 5.66+. Why internal C++ sd-bus agents fail, how an external Python agent fixes it, and why you need D-Bus polling."
tags: ["BlueZ", "DBus", "PairingAgent", "Python", "C++", "sd-bus", "AuthenticationFailed", "LinuxBluetooth", "Workaround", "BluetoothPairing", "EmbeddedLinux"]
featuredImage: "./images/featured.jpg"
imageCaption: "Navigating the complexities of BlueZ D-Bus pairing agent interactions on Linux."
---

> **TL;DR:** If you're getting `org.bluez.Error.AuthenticationFailed` with a custom C++/sd-bus pairing agent on BlueZ 5.66+, your internal agent registration is likely the problem. Run an external Python agent (`simple-agent.py`) as a separate process, and implement D-Bus property polling instead of relying on `PropertiesChanged` signals. Details and code below.

I spent two days staring at `org.bluez.Error.AuthenticationFailed` before I figured out what was going on.

The pairing agent was registered. The D-Bus calls looked correct. `busctl` confirmed everything was in place -- and BlueZ just kept saying no. This was during work on [D2Explorer](../huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- a tool to pair with the Huawei Watch D2 on Linux -- and the pairing error was blocking everything.

Here's what actually happened and how we fixed it.

## The Plan: An Internal C++ Pairing Agent

The idea was clean and self-contained. A single C++ application that handles the entire pairing process using `sd-bus` (the C/C++ D-Bus bindings):

1.  Connect to the system D-Bus.
2.  Find the Bluetooth adapter (`org.bluez.Adapter1`).
3.  Implement a C++ class exposing the `org.bluez.Agent1` interface.
4.  Register the agent with `org.bluez.AgentManager1` via `RegisterAgent` and `RequestDefaultAgent`. We started with `DisplayYesNo` capability, later simplified to `NoInputNoOutput`.
5.  Discover the target device (`org.bluez.Device1`).
6.  Call `Pair()` on the device's D-Bus interface.
7.  The internal agent handles callbacks (`RequestConfirmation`, `RequestAuthorization`) automatically -- no user interaction needed.
8.  Trust the device, establish a GATT connection, done.

One binary, no external dependencies. That was the plan.

## The Wall: `org.bluez.Error.AuthenticationFailed`

Everything worked up to step 6. Adapter found, agent registered (D-Bus confirmed it), device discovered. But the moment we called `Device1.Pair()` via `sd_bus_call_method` -- instant failure:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method threw exception: Failed to call method 'Pair':
    Input/output error - D-Bus error: org.bluez.Error.AuthenticationFailed (Authentication Failed)
```

We tried everything. Different agent capabilities. Checked the `sd-bus` vtable setup. Verified the agent method implementations returned success promptly. Used `busctl` and `gdbus` to monitor D-Bus traffic -- the registration calls looked correct. The `Pair()` call just kept failing.

**Dead end.**

## The Breakthrough: An External Python Agent

To isolate the problem, we took the internal C++ agent out of the equation. We ran BlueZ's standard `simple-agent.py` as a separate process *before* launching our C++ app (now stripped of its own agent registration):

```bash
# Terminal 1: Run the external agent
sudo python simple-agent.py NoInputNoOutput

# Terminal 2: Run our C++ app (no internal agent)
sudo ./build/huawei_pair_app <MAC> <QR_VALUE>
```

The result:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method succeeded  <--- SUCCESS!
```

Consistent. Every time. The `AuthenticationFailed` error vanished completely.

This proved the problem wasn't with `Pair()` itself, and it wasn't with the device or BlueZ's pairing capability. It was specifically about how our C++ application, using `sd-bus`, was registering and interacting as a pairing agent. The exact same logical operation -- registering a `NoInputNoOutput` agent and calling `Pair()` -- worked perfectly when the agent ran as a separate Python process.

**This worked.**

## Why Did the Internal Agent Fail?

When I first hit this, I had only hypotheses. Since then, I've found actual documented evidence that this is a broader problem -- not just our code.

### BlueZ 5.70+ Regression

[BlueZ GitHub Issue #605](https://github.com/bluez/bluez/issues/605) documents cases where devices pair fine on BlueZ 5.50 but fail on newer versions with `auth failed with status 0x05`. HCI logs show `Status: PIN or Key Missing (0x06)` despite stored link keys. The workaround? Running the legacy `bluez-simple-agent.py` script. Sound familiar?

### Agent Availability Is the Root Cause

[Bleak Issue #1434](https://github.com/hbldh/bleak/issues/1434) makes it even clearer: pairing only works when `bluetoothctl` or GNOME Bluetooth is running, because those applications register the necessary authentication agent. Without an active, *properly functioning* agent, BlueZ returns `No agent available for request type 2` internally -- which surfaces as `AuthenticationFailed`.

The key insight: it's not enough to *register* an agent. The agent needs to respond to BlueZ's callbacks in a way that `bluetoothd` considers valid. And something about how `sd-bus` handles this within the same process that initiates pairing doesn't satisfy newer BlueZ versions.

### It Might Not Even Be BlueZ

[Red Hat Bug #1905671](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) revealed that some `AuthenticationFailed` errors are kernel-related, not BlueZ-related. Kernel 5.9 had pairing issues that 5.8.18 and 5.10+ didn't. The maintainer's comment is worth quoting: *"Bluetooth is complex, it could be firmware, kernel, bluez, controller, end device or a combination of them all."*

### Agent Capability Mismatch

[BlueZ Issue #650](https://github.com/bluez/bluez/issues/650) documents another angle: certain devices (especially iOS) fail when pairing with `NoInputNoOutput` agents because they downgrade Secure Connections to Legacy pairing, causing `Insufficient Authentication (0x05)` errors on subsequent attribute access. This is a Security Manager Protocol (SMP) negotiation issue, not an agent registration issue -- but it produces the same error message.

### The Likely Culprits for Our Case

Given the evidence, the most probable explanations for the internal `sd-bus` agent failure:

1.  **Timing** -- `sd-bus` registration or method handling within our event loop wasn't responding in the exact window `bluetoothd` expected.
2.  **`sd-bus` vs. `python-dbus` subtleties** -- differences in how these libraries interact with the D-Bus daemon or handle object lifetimes.
3.  **Stricter requirements in BlueZ 5.66+** -- changed internal sequences for agent interaction that `sd-bus`, when used within the same application initiating pairing, doesn't satisfy.

## The Second Wall: D-Bus Signals Are Unreliable

Getting past `AuthenticationFailed` was a big win, but it wasn't the end. With the external agent in place, `Pair()` succeeded -- but we couldn't reliably *detect* when it finished.

We were relying on D-Bus `PropertiesChanged` signals (via `sd-bus`) to know when `Paired`, `Trusted`, `Connected`, and `ServicesResolved` became `true`. Sometimes the signals arrived. Sometimes they arrived late. Sometimes they didn't arrive at all.

So we implemented **active polling** -- a fallback that queries property values directly when signals don't show up:

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

Each state transition method (`isPaired()`, `isTrusted()`, `isConnected()`, `areServicesResolved()`) follows the same pattern: check the cached atomic boolean first (updated by the signal handler if it works), then fall back to a direct D-Bus `Get` property call.

Not elegant. But necessary.

**This worked.**

## The Complete Fix

Here's the consolidated recipe. If you're building automated Bluetooth pairing on Linux with BlueZ 5.66+ and hitting `AuthenticationFailed`:

### Step 1: Get simple-agent.py

Grab it from the [BlueZ source tree](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent).

### Step 2: Run the external agent

```bash
sudo python simple-agent.py NoInputNoOutput
```

Keep this running in a separate terminal (or as a background service).

### Step 3: Strip the internal agent from your app

Remove all `RegisterAgent` / `RequestDefaultAgent` calls from your C++ application. Let the external Python agent handle authentication callbacks.

### Step 4: Add D-Bus property polling

Don't rely solely on `PropertiesChanged` signals. For each critical property (`Paired`, `Trusted`, `Connected`, `ServicesResolved`), implement the cache-then-poll pattern shown above. Poll periodically from your main loop.

### Step 5: Verify

1.  Confirm the external agent is running (`sudo python simple-agent.py NoInputNoOutput`).
2.  Run your app. `Pair()` should succeed.
3.  Watch the polling logs -- you should see D-Bus property queries for state transitions.
4.  If `Pair()` still fails, check your BlueZ version (`bluetoothd --version`) and kernel version -- the issue might be deeper.

## What This Costs You

I'm not going to pretend this is a clean solution. It's not:

1.  **External dependency** -- your app now needs a separate Python process running.
2.  **More complexity** -- polling logic in the main loop, on top of signal handlers.
3.  **Less self-contained** -- the dream of a single binary is gone.

But it works. Reliably. And when you've been staring at `AuthenticationFailed` for two days, "it works" is what matters.

---

### References

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

### Related Posts

- [Huawei Watch D2 BLE Pairing: Protocol & Vendor Lock-In](/huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- the project that prompted this investigation. The Watch D2 requires a proprietary application-level handshake on top of standard BLE pairing, which is why we needed automated pairing to work in the first place.
- [Fix Android Emulator Bluetooth on M1 Mac using Bumble & API 32](/m1-mac-android-emulator-bluetooth-passthrough-bumble/) -- another Bluetooth integration battle, this time bridging a Mac's physical radio into the Android Emulator.
