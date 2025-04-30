---
title: "BlueZ Pairing Fix: External Python Agent & D-Bus Polling"
date: "2025-04-08"
slug: "bluez-pairing-python-agent-workaround-authentication-failed"
author: "Boris Teoharov"
description: "Solve BlueZ pairing 'AuthenticationFailed' errors. Details why internal C++ agents fail & how an external Python agent + D-Bus polling provides a workaround."
tags:
  - "BlueZ"
  - "DBus"
  - "PairingAgent"
  - "Python"
  - "C++"
  - "sd-bus"
  - "AuthenticationFailed"
  - "LinuxBluetooth"
  - "Workaround"
  - "BluetoothPairing"
  - "EmbeddedLinux"
featuredImage: "./images/featured.jpg"
imageCaption: "Navigating the complexities of BlueZ D-Bus pairing agent interactions on Linux."
---

As developers, we often embark on projects with a clear plan, only to hit unexpected roadblocks thrown up by the intricacies of the systems we interact with. Recently, while working on the D2Explorer project – a tool to pair with a specific Bluetooth LE device (the Huawei Watch D2) on Linux – we encountered a particularly stubborn issue involving BlueZ, the Linux Bluetooth stack. This post details our journey through debugging a persistent `AuthenticationFailed` error and the workarounds we ultimately implemented.

## The Initial Plan: An Internal C++ Pairing Agent

Our goal was to create a self-contained C++ application capable of handling the entire pairing process. This naturally included implementing a BlueZ Pairing Agent directly within our application using the `sd-bus` library, which provides C/C++ bindings for D-Bus.

The plan seemed straightforward:

1.  Connect to the system D-Bus.
2.  Find the Bluetooth adapter (`org.bluez.Adapter1`).
3.  Implement a C++ class exposing the `org.bluez.Agent1` interface.
4.  Register this agent with BlueZ's `org.bluez.AgentManager1` using `RegisterAgent` and `RequestDefaultAgent`. We initially targeted the `DisplayYesNo` capability, later simplifying to `NoInputNoOutput`.
5.  Discover the target device (`org.bluez.Device1`).
6.  Call the `Pair()` method on the device's D-Bus interface.
7.  Our internal agent would automatically handle any callbacks from BlueZ (like `RequestConfirmation` or `RequestAuthorization`) to allow pairing without user interaction.
8.  Proceed with trusting the device and establishing a GATT connection.

This approach, using `sd-bus` for both method calls and agent implementation, aimed for a clean, integrated solution.

## The Roadblock: `org.bluez.Error.AuthenticationFailed`

Everything seemed to work up until step 6. We could find the adapter, register our agent ( seemingly successfully, according to D-Bus), discover the device, but the moment we called the `Device1.Pair()` method via `sd_bus_call_method`, BlueZ would almost immediately return an error: `org.bluez.Error.AuthenticationFailed`.

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method threw exception: Failed to call method 'Pair': Input/output error - D-Bus error: org.bluez.Error.AuthenticationFailed (Authentication Failed)
```

This was perplexing. Our agent *was* registered. We tried different agent capabilities (`DisplayYesNo`, `NoInputNoOutput`). We meticulously checked the `sd-bus` vtable setup and the agent method implementations, ensuring they returned success promptly as required for automated pairing. We used `busctl` and `gdbus` to monitor D-Bus traffic, confirming our agent registration calls seemed correct, yet the `Pair()` call consistently failed with `AuthenticationFailed`.

Further investigation and searching online revealed potential complexities and changes in how newer BlueZ versions (specifically reports around 5.66, 5.72 and later) handle agent interactions and pairing initiation, though concrete documentation on exact internal changes was scarce <small><a href="#ref1">[1]</a></small>, <small><a href="#ref2">[2]</a></small>.

## The Breakthrough: Testing with an External Python Agent

To isolate the problem, we decided to take our internal C++ agent out of the equation temporarily. We used a standard BlueZ example Python script, `simple-agent.py` (or a slightly modified version), run as a separate process, to register an agent with `NoInputNoOutput` capability *before* running our C++ application (which now *only* performed discovery and method calls, without registering its own agent).

```bash
# Terminal 1: Run the external agent
sudo python simple-agent.py NoInputNoOutput

# Terminal 2: Run our C++ app (modified to *not* register its own agent)
sudo ./build/huawei_pair_app <MAC> <QR_VALUE>
```

The result was immediate and illuminating:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method succeeded  <--- SUCCESS!
```

The `Device1.Pair()` call now succeeded consistently! The `AuthenticationFailed` error vanished completely when using the external Python agent. This strongly indicated that the issue wasn't with the `Pair()` call itself, nor with the fundamental pairing capability of the device or BlueZ, but specifically with how our C++ application, using `sd-bus`, was registering and interacting as a pairing agent with these newer BlueZ versions.

## Why Did the Internal C++ Agent Fail? (Hypotheses)

While we don't have a definitive root cause from BlueZ internals, several hypotheses emerged:

1.  **Timing Issues:** Perhaps the `sd-bus` registration or method handling within our single-threaded (or multi-threaded) C++ event loop wasn't responding in the exact timing window expected by `bluetoothd`.
2.  **`sd-bus` vs. `python-dbus` Subtleties:** There might be subtle differences in how `sd-bus` interacts with the D-Bus daemon or how it handles object lifetimes compared to the `python-dbus` library used by the example agent.
3.  **BlueZ Internal Changes:** BlueZ 5.72+ might have introduced stricter requirements or changed internal sequences for agent interaction that `sd-bus`, when used programmatically within the same application initiating the pairing, doesn't satisfy perfectly.
4.  **Potential `sd-bus` Bug/Limitation:** While less likely for such a core library, a specific bug related to registering object vtables and handling method calls in this context couldn't be entirely ruled out.

## The Next Workaround: D-Bus Property Polling

Overcoming the `AuthenticationFailed` error was a major step, but it wasn't the end of the story. While the `Pair()` call now worked with the external agent, we found that relying on D-Bus `PropertiesChanged` signals (via `sd-bus`) to know when the `Paired`, `Trusted`, `Connected`, and `ServicesResolved` properties actually became `true` was unreliable. Sometimes the signals arrived late, sometimes seemingly not at all.

To create a robust process, we had to implement another layer of workarounds: **active polling**.

In our main C++ application loop, we added logic to:

1.  Check the current state of our `ConnectionManager`.
2.  If in the `Pairing` state, periodically call `BluetoothDevice::isPaired()`.
3.  If in the `Trusting` state, periodically call `BluetoothDevice::isTrusted()`.
4.  If in the `ConnectingGatt` state, periodically call `BluetoothDevice::isConnected()` and then `BluetoothDevice::areServicesResolved()`.

Crucially, the `isPaired()`, `isTrusted()`, `isConnected()`, and `areServicesResolved()` methods were modified. They now first check a locally cached atomic boolean (updated by the D-Bus signal handler, if it works), but if the cached value is `false`, they **actively query the current property value directly from BlueZ via a D-Bus `Get` property call**.

```c++
// Simplified example for isPaired()
bool BluetoothDevice::isPaired() {
    bool cachedValue = mockPaired_.load(); // Check signal-updated cache
    if (cachedValue) return true;

    // If cache is false, poll D-Bus directly
    Logger::debug("[Polling] Polling Paired property via D-Bus...");
    bool polledValue = false;
    adapter_.getObjectProperty<bool>(devicePath_, "org.bluez.Device1", "Paired", polledValue); // Active D-Bus call
    if (polledValue) mockPaired_.store(true); // Update cache
    return polledValue;
}
```

This polling mechanism, while less elegant than pure signal-driven logic, proved necessary to reliably detect state changes when D-Bus signals were inconsistent. We also added similar polling for the GATT service/characteristic discovery phase.

## Code Implications

This journey led to several architectural changes:

1.  **External Dependency:** Our application now requires a separate pairing agent process (like the Python script) to be running.
2.  **Increased Complexity:** The C++ application needed additional polling logic in its main loop to handle state transitions reliably, adding complexity beyond the intended signal-driven approach.
3.  **Less Self-Contained:** The goal of a single, self-contained executable was compromised.

## Conclusion

Interfacing with complex system daemons like BlueZ via D-Bus can present unexpected challenges, especially across different versions. Our experience showed that while `sd-bus` is powerful, its interaction with BlueZ 5.72+ for *internal* agent registration during pairing initiation was problematic, leading to `AuthenticationFailed` errors.

Switching to a standard *external* Python agent resolved the immediate `Pair()` failure, highlighting that the issue lay in the agent interaction mechanism from our C++ app. Furthermore, the unreliability of `PropertiesChanged` signals necessitated implementing active D-Bus property polling for `Paired`, `Trusted`, `Connected`, and `ServicesResolved` states, as well as for GATT object discovery.

If you're facing similar `AuthenticationFailed` errors during automated Bluetooth pairing on Linux with recent BlueZ versions, consider:

1.  Testing with a standard external agent (like BlueZ's `simple-agent.py`) <small><a href="#ref3">[3]</a></small>.
2.  If the external agent works, investigate your internal agent registration or consider adopting the external agent + polling workaround.
3.  Be prepared to implement polling for critical property changes (`Paired`, `Trusted`, `Connected`, `ServicesResolved`) if D-Bus signals prove unreliable in your environment.

While the final solution isn't as clean as initially envisioned, it provides a robust path forward for automated Bluetooth pairing in the face of these system-level complexities.

---

### References

<a id="ref1"></a>1. [BlueZ GitHub Issue: Device characteristics and pairing timing issues](https://github.com/bluez/bluez/issues/55) - *Discussion about intermittent pairing failures that may be related to agent timing issues, similar to what we experienced.*<br>
<a id="ref2"></a>2. [Bluetooth Auto Pairing with NoInputNoOutput Agent Issues](https://forums.raspberrypi.com/viewtopic.php?t=324225) - *Forum discussion about challenges with headless Bluetooth pairing using NoInputNoOutput agent capability.*<br>
<a id="ref3"></a>3. [BlueZ Source Code: test/simple-agent](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent) - *The standard Python agent often used for testing.*

*(Disclaimer: Specific online references detailing this exact sd-bus vs. python-dbus agent behavior with BlueZ 5.72+ might be scarce. The conclusions here are based primarily on the empirical evidence gathered during the debugging process described in our conversation.)*
