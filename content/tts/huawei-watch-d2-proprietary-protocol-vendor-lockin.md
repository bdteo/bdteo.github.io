Huawei Watch D2 BLE Pairing: Protocol and Vendor Lock-In Case

The Huawei Watch D2 does not use standard BLE pairing.

Instead, it requires an eleven-step proprietary handshake involving custom GATT characteristics, HMAC-SHA256 key derivation from a QR code, and application-level encryption.

This is vendor lock-in by design. It forces you into Huawei's Health app.

The good news is that the community has reverse-engineered it. Gadgetbridge now supports the Watch D2, and open-source implementations like huawei-lpv2 exist. The EU Digital Markets Act is also starting to push back.

I expected standard Bluetooth pairing. Connect, bond, exchange data. The usual.

What I got instead was a proprietary cryptographic handshake that took weeks to reverse-engineer.

This happened while building D2Explorer, my project to connect the Huawei Watch D2 to Linux and macOS without Huawei's Health app. After sorting out BlueZ pairing-agent issues and migrating to the cross-platform SimpleBLE library, I thought the hard part was over.

The hard part had not started.

What you would expect: standard BLE pairing

Here is how Bluetooth Low Energy pairing is supposed to work.

First, scan for the device by its advertised name, like Huawei Watch D2.

Then connect.

Then the operating system handles pairing and bonding: a PIN prompt, Just Works, or whatever the security level requires.

Once bonded, your app interacts with standard or custom GATT services.

The operating system manages security. Your application focuses on data.

Simple.

What actually happens: an eleven-step proprietary handshake

What the Watch D2 actually requires is entirely different.

The basic BLE connection is just the door. Behind it is a custom application-level authentication protocol that Huawei built on top of standard BLE. The community calls it Huawei Link Protocol version 2.

Standard BLE pairing mechanisms are bypassed entirely.

To authenticate and access any meaningful data, you need to navigate a sequence over custom GATT characteristics.

First, connect and establish the basic BLE link.

Then immediately enable notifications on the FE02 characteristic. This is timing-critical. Miss the window and the watch drops you.

Then immediately send a custom GetLinkParams command to the FE01 write characteristic.

Next, wait for a notification containing the watch's random challenge, the server nonce.

Then generate a client nonce. Combine the server nonce, the client nonce, and the numeric value from the watch's QR code. Run HMAC-SHA256 using the QR code value as the key to derive a shared secret key.

Then send an AuthRequest containing the client nonce and an HMAC digest back to the watch.

Then receive the watch's authentication token and verify it using the shared secret key and the exchanged nonces.

Then send the current time and timezone offset, encrypted with the shared key.

Then send the QR code value back, also encrypted.

Then send a final encrypted confirmation.

Only after all of that is the connection authenticated.

Custom TLV message formats. CRC checks. Service and command IDs. Application-level encryption. Millisecond-sensitive timing.

All of this happens above the BLE stack, invisible to standard Bluetooth tools.

The QR code on the watch screen is the shared secret. Without it, you cannot derive the key. Without the key, you cannot authenticate. Without authenticating, the watch gives you nothing.

Why Huawei does this

Huawei might frame this as enhanced security.

The practical effect is vendor lock-in.

The barrier to entry is high. The protocol is undocumented. Reimplementing it requires reverse-engineering the Huawei Health app, with more than thirteen thousand classes and more than sixty-four thousand methods, or analyzing BLE traffic. That actively discourages third-party apps.

There is no interoperability. Standard fitness apps cannot connect. The watch only completes its handshake with software that knows the proprietary steps, primarily Huawei's own Health app.

There is ecosystem control. Users are forced into Huawei Health and its cloud services. Switching devices or platforms later means losing health data history.

There is reduced user choice. Want to use an open-source app? Want more privacy control over your health data? Tough luck, unless someone reverse-engineers the protocol first.

And here is the thing: this is not unique to Huawei.

The WatchWitch research project documents how all major vendors, including Apple, Samsung, and Xiaomi, use proprietary BLE protocols to enforce ecosystem lock-in.

Apple Watch is incredibly tightly coupled with Apple's iPhone and iCloud ecosystem, using proprietary protocols that are unavailable to third parties.

It is a systemic industry problem.

But Huawei's implementation is particularly aggressive.

BLE allows custom services, sure. But replacing the fundamental authentication mechanism with a proprietary gatekeeper is a different game entirely.

The security irony

The obvious defense is: we do this for security.

Let's examine that.

The BlueDoor vulnerability research from Tsinghua University tested sixteen BLE devices, including the Honor Band 3 from the same Huawei ecosystem, and achieved silent pairing without user authorization on most of them.

The proprietary protocol did not prevent that.

Meanwhile, the protocol itself has been reverse-engineered multiple times: by the Gadgetbridge community, by the huawei-lpv2 project, by researchers who presented at Easterhegg in 2019, and by me for D2Explorer.

Security through obscurity has an expiration date.

The HMAC-SHA256 key derivation from the QR code is actually decent cryptography. But that is not the point.

You could achieve the same security properties using standard BLE Secure Connections with an out-of-band pairing method, like NFC or a QR code, without locking out every third-party application in the process.

The community fights back

The community has not accepted this quietly.

Gadgetbridge

Gadgetbridge, the open-source Android app for wearable devices, now supports the Huawei Watch D2.

You can pair your watch without Huawei's Health app. It took significant reverse-engineering effort, and there are limitations. For example, ECG functionality is disabled when paired with Gadgetbridge.

But it works.

The authentication implementation in Gadgetbridge handles auth version 3. It calculates the bonding key from the pairing message and uses it for decryption. A seventeen-digit Huawei account ID is required for the authentication key negotiation.

huawei-lpv2

The huawei-lpv2 project provides a pure Python implementation of Huawei Link Protocol version 2.

It is maintained, has multiple forks, and serves as a reference for anyone building Huawei wearable integrations outside the official ecosystem.

D2Explorer

My own D2Explorer project took a different path: building a C++ implementation using SimpleBLE that works on Linux and macOS.

The work involved implementing TLV serialization and deserialization.

It involved building precise message constructors.

It involved getting the cryptographic steps right: nonce generation, HMAC-SHA256, and XOR encryption.

It involved managing strict state transitions and timing.

And it involved debugging failures caused by millisecond-level timing mismatches and subtle crypto errors.

D2Explorer exists because Huawei's protocol made it necessary. It is the workaround required for basic functionality outside the walled garden.

AsteroidOS

AsteroidOS 2.0 launched in February 2026 as a major update to the open-source Linux-based smartwatch OS.

It now supports around thirty devices, including the Huawei Watch and Huawei Watch 2, with features like always-on display and Tilt-to-Wake.

That is a full open-source alternative to Huawei's firmware.

The regulatory tide

The European Union is not just watching.

The Digital Markets Act is starting to force change.

In December 2025, Apple released iOS 26.3 with AirPods-like pairing for third-party devices, including Huawei smartwatches, specifically to comply with Digital Markets Act requirements.

Background syncing between Huawei watches and iPhones is already operational in Europe.

The DMA mandates that gatekeepers provide interoperability for connected devices. This directly targets the kind of proprietary BLE lock-in that Huawei, Apple, and everyone else have been practicing.

Full rollout of these interoperability features is expected throughout 2026.

This is significant.

For the first time, there is regulatory pressure to standardize what vendors have deliberately kept proprietary.

The technical community can reverse-engineer protocols one by one, but regulation can change the incentive structure for the entire industry.

What this means

The Huawei Watch D2 pairing protocol is a case study in how custom protocols over standard transports can enforce vendor lock-in.

The layers of proprietary cryptography, custom message formats, and timing-sensitive handshakes exist not because standard BLE cannot handle authentication. It can.

They exist because proprietary protocols keep users inside the ecosystem.

The picture is changing, though.

Gadgetbridge gives you an alternative right now.

The EU Digital Markets Act is forcing interoperability at the regulatory level.

And open-source projects like huawei-lpv2, D2Explorer, and AsteroidOS prove that the community will reverse-engineer what vendors try to lock down.

Building D2Explorer was less about Bluetooth and more about cryptographic detective work.

It underscores something that should not need underscoring: you should be able to access your own health data with the software of your choice.
