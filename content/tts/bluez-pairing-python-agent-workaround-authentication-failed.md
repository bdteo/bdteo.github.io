# BlueZ Pairing Fix: External Python Agent and D-Bus Polling

[matter-of-fact] Short version: if you are getting org dot bluez dot Error dot AuthenticationFailed with a custom C++ pairing agent on BlueZ 5.66 or newer, your internal agent registration may be the problem.

The workaround that actually worked for me was to run BlueZ's external Python agent, simple-agent.py, as a separate process, and to add D-Bus property polling instead of relying only on PropertiesChanged signals.

[reflective] I spent two days staring at AuthenticationFailed before I figured out what was going on.

The pairing agent was registered. The D-Bus calls looked correct. busctl confirmed everything was in place. BlueZ still kept saying no.

[conversational tone] This happened while I was working on D2Explorer, a tool for pairing with the Huawei Watch D2 on Linux. The pairing error blocked everything.

Here is what happened, and how we fixed it.

## The Plan

[matter-of-fact] The original plan was clean and self-contained.

One C++ application would handle the entire pairing process using sd-bus, the C and C++ D-Bus bindings.

The app would connect to the system D-Bus, find the Bluetooth adapter, implement a C++ class exposing the org dot bluez dot Agent1 interface, and register that agent with org dot bluez dot AgentManager1.

We started with DisplayYesNo capability, then simplified to NoInputNoOutput.

After that, the app would discover the target device, call the Device1 Pair method on its D-Bus interface, let the internal agent handle callbacks like RequestConfirmation and RequestAuthorization, trust the device, establish a GATT connection, and be done.

[deliberate] One binary. No extra process. No external dependency.

That was the plan.

## The Wall

[matter-of-fact] Everything worked up to the actual pairing call.

The adapter was found. The agent was registered. D-Bus confirmed it. The device was discovered.

But the moment we called the Device1 Pair method through sd-bus, it failed immediately with AuthenticationFailed.

The log boiled down to this: the app called Device1 dot Pair through D-Bus, and BlueZ returned org dot bluez dot Error dot AuthenticationFailed.

We tried different agent capabilities. We checked the sd-bus vtable setup. We verified that the agent methods returned success promptly. We used busctl and gdbus to watch the traffic.

The registration calls looked correct. The Pair method still failed.

[resigned tone] Dead end.

## The Breakthrough

[deliberate] To isolate the problem, we removed the internal C++ agent from the equation.

We ran BlueZ's standard simple-agent.py as a separate process before launching our C++ app. The Python agent used NoInputNoOutput. Our C++ app no longer registered its own pairing agent.

In one terminal, we ran sudo python simple-agent.py NoInputNoOutput.

In another terminal, we ran the C++ pairing app with the target MAC address and QR value.

[matter-of-fact] The result was immediate: the same Device1 Pair call succeeded.

Consistently. Every time.

The AuthenticationFailed error vanished.

[reflective] That proved the problem was not the Pair call itself. It was not the device. It was not BlueZ's ability to pair. It was specifically about how our C++ application, using sd-bus, registered and interacted as a pairing agent.

The same logical operation worked perfectly when the agent ran as a separate Python process.

[emphasized] This worked.

## Why the Internal Agent Failed

[reflective] At first, I only had hypotheses. Later, I found evidence that this is part of a broader class of BlueZ pairing problems, not just our code.

BlueZ issue reports around version 5.70 and newer describe devices that pair fine on older BlueZ versions but fail on newer ones with authentication errors. In some cases, HCI logs show missing PIN or key status even when link keys exist. The workaround people mention is familiar: run the legacy bluez-simple-agent.py script.

[matter-of-fact] Bleak discussions make the agent problem even clearer. Pairing only works when something like bluetoothctl or GNOME Bluetooth is running, because those tools register a working authentication agent. Without an active, properly functioning agent, BlueZ may internally report that no agent is available for the request type, which surfaces as AuthenticationFailed.

[deliberate] The key insight is this: registering an agent is not enough. The agent must respond to BlueZ's callbacks in a way bluetoothd accepts.

Something about our sd-bus agent, running inside the same process that initiated pairing, did not satisfy newer BlueZ behavior.

There are also related complications.

Some AuthenticationFailed errors are kernel-related, not purely BlueZ-related. Kernel versions have had pairing regressions before.

Some failures come from agent capability mismatch. For example, certain devices can fail when pairing with NoInputNoOutput because secure connections get downgraded to legacy pairing. That produces a similar error message, even though the root cause is different.

[conversational tone] For our case, the likely culprits were timing, subtle differences between sd-bus and python-dbus, and stricter BlueZ behavior in 5.66 and newer.

The event loop may not have responded in the exact window bluetoothd expected. Object lifetimes or D-Bus method handling may have differed between sd-bus and python-dbus. Or newer BlueZ may simply be less forgiving when the agent lives in the same application that starts pairing.

## The Second Wall

[matter-of-fact] Getting past AuthenticationFailed was a big win, but it was not the end.

With the external agent in place, Pair succeeded. But we still could not reliably detect when pairing finished.

We had been relying on D-Bus PropertiesChanged signals through sd-bus to know when Paired, Trusted, Connected, and ServicesResolved became true.

[slows down] Sometimes the signals arrived. Sometimes they arrived late. Sometimes they did not arrive at all.

So we added active polling.

[deliberate] The pattern is simple. First, check the cached value that the signal handler updates. If that cache says the device is paired, return true. If the signal never fired, query D-Bus directly for the Paired property. If the polled value is true, update the cache and continue.

Each state transition follows the same pattern: is paired, is trusted, is connected, and are services resolved.

Check the cached atomic boolean first. Then fall back to a direct D-Bus Get property call.

[resigned tone] It is not elegant. It is necessary.

[emphasized] This worked too.

## The Complete Fix

[matter-of-fact] If you are building automated Bluetooth pairing on Linux with BlueZ 5.66 or newer and hitting AuthenticationFailed, this is the recipe I would use.

First, get simple-agent.py from the BlueZ source tree.

Second, run the external agent. The command is sudo python simple-agent.py NoInputNoOutput. Keep it running in a separate terminal, or run it as a background service.

Third, remove internal agent registration from your C++ application. Strip out RegisterAgent and RequestDefaultAgent calls. Let the external Python agent handle authentication callbacks.

Fourth, add D-Bus property polling. Do not rely only on PropertiesChanged signals. For each critical property, Paired, Trusted, Connected, and ServicesResolved, use the cache-then-poll pattern. Poll periodically from your main loop.

Fifth, verify the behavior. Confirm the external agent is running. Run your app. Pair should succeed. Watch your polling logs and make sure D-Bus property queries are happening for the state transitions.

[conversational tone] If Pair still fails, check your BlueZ version and kernel version. The issue may be deeper than the pairing agent.

## What This Costs

[reflective] I will not pretend this is a clean solution.

It is not.

[matter-of-fact] Your app now depends on a separate Python process. Your main loop gets more complex because polling logic sits next to signal handlers. And the dream of one self-contained binary is gone.

[deliberate] But it works. Reliably.

And after two days staring at AuthenticationFailed, "it works" is what matters.

[conversational tone] The original writeup links to the BlueZ issue tracker, Bleak's pairing discussion, a Red Hat kernel bug, the BlueZ agent API docs, the simple-agent.py source, and a few related Bluetooth pairing references. Those were the breadcrumbs that helped turn this from guesswork into a practical workaround.
