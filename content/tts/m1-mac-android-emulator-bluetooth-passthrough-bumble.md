Fix Android Emulator Bluetooth on an M1 Mac using Bumble and API 32

[conversational tone] If you are a developer working with Bluetooth on an M1, M2, or M3 Mac, and you are trying to get your host machine's Bluetooth radio working inside the Android Emulator, you have probably felt some pain.

What seems like it should be straightforward often turns into a frustrating rabbit hole of failed connections, cryptic errors, and documentation dead ends.

[reflective] I recently went through this exact battle. After hitting multiple walls, I finally found a combination using the Bumble Python Bluetooth stack that actually works.

This is not just another theoretical guide.

[matter-of-fact] This is the blow-by-blow account of what failed and, more importantly, what succeeded in bridging my M1 Mac Pro's Bluetooth, through an external USB dongle in my case, to an Android 12L emulator on API 32.

The goal: real Bluetooth in the emulator

[matter-of-fact] The objective was simple: make the Android Emulator use my Mac's physical Bluetooth controller instead of its own limited virtual one.

This is crucial for testing apps that interact with real-world Bluetooth devices.

The tool: enter Bumble

Bumble is a powerful Python Bluetooth stack.

[deliberate] Its key tool for this task is the HCI bridge. The bridge can connect to a physical Host Controller Interface on one side and expose it through transports like TCP or gRPC on the other.

Attempt one: the QEMU socket method

The logical first try was based on general QEMU knowledge and older guides.

[matter-of-fact] The idea was to use emulator flags to connect a virtual serial port, backed by a TCP socket, directly to the HCI bridge.

First, I started Bumble in TCP server mode.

[deliberate] On my machine, connecting to the dongle by USB index, usb zero, worked better than using its exact vendor and product ID. M1 quirks.

Bumble connected to the USB dongle and started listening on a TCP port.

Then I launched the emulator with QEMU flags.

Those flags added a virtual serial device and a character device backed by a TCP socket connected to the Bumble bridge.

[resigned tone] The result was partial success and ultimate failure.

Using lsof, I could see that the emulator's QEMU process did establish a TCP connection to the Bumble bridge.

But the Android Bluetooth stack inside the emulator never actually sent any HCI commands over it.

Toggling Bluetooth in Android settings did nothing.

The bridge logs remained silent after the initial connection.

[flatly] Dead end.

Attempt two: the default Netsim bridge

[matter-of-fact] Bumble's documentation mentions bridging to the emulator's Netsim gRPC interface.

Netsim, and its core Root Canal, is the emulator's newer virtual Bluetooth controller system.

So the second attempt was to configure Bumble as a Netsim controller, listening on the default gRPC port, and connecting to the physical dongle.

Then I launched the emulator without the QEMU socket flags and asked it to use the default packet streamer endpoint.

[resigned tone] The result: no connection.

The emulator launched, but the Bumble bridge showed no incoming gRPC connection.

The emulator logs did not reveal obvious connection errors, but Bluetooth remained unusable.

[flatly] Another dead end.

Attempt three: API downgrade plus explicit Netsim endpoint

[emphasized] This was the winner.

Web searches showed general instability with Bluetooth on API 33 and API 34 emulators.

They also hinted at problems with how the emulator discovers or connects to the Netsim backend, especially when an external tool tries to intercept it.

[deliberate] The key seemed to be explicitly telling the emulator where the Netsim gRPC server was, and trying an older API level.

I started Bumble again in Netsim controller mode, listening on port 8554, and connected it to the physical dongle using usb zero.

Then I created an API 32 Android 12L virtual device with Google Play Services.

[matter-of-fact] The launch script targeted that AVD and, crucially, changed the packet streamer endpoint from default to the exact bridge address: localhost on port 8554.

[emphasized] This time, it worked.

The Bumble bridge started showing gRPC connection logs from the emulator shortly after launch.

Once the emulator booted, toggling Bluetooth on in Android Settings produced a flood of HCI commands: reset, read version, set event mask, and so on.

Scanning for devices inside the emulator successfully used the Mac's physical Bluetooth radio through the ASUS dongle.

The winning recipe

[matter-of-fact] Here is the exact procedure that worked on my M1 Mac Pro with an external ASUS USB-BT500 dongle.

First, install Bumble with Python.

If needed, install libusb with Homebrew.

Second, optionally disable macOS native USB Bluetooth handling.

[deliberate] This is the nvram setting that tells macOS not to grab the external Bluetooth controller automatically. Run it once, then reboot.

Third, start the Bumble Netsim bridge and keep it running.

The important shape is: Bumble HCI bridge, android-netsim controller mode, port 8554, and usb zero as the physical adapter.

Verify that Bumble prints connected twice: once for the USB adapter and once for the Netsim side.

Fourth, prepare the emulator launch script.

It should target an API 32 AVD, named something like gplay 32 arm.

It should create the AVD if it does not exist.

[deliberate] And it must launch the emulator with the packet streamer endpoint set explicitly to localhost colon 8554.

Fifth, run the launch script in a second terminal while Bumble keeps running in the first.

Sixth, verify the result.

Once the emulator boots, check the Bumble bridge terminal for gRPC and HCI traffic.

Go to Android Settings, open Bluetooth, and toggle it on.

Then try scanning or pairing.

The successful launch script, in plain English

[matter-of-fact] The working script does a few things.

It targets Android API 32, uses the Google Play Store system image for Apple Silicon, and names the AVD gplay 32 arm.

It finds your Android SDK, checks that sdkmanager, avdmanager, emulator, and adb are available, and stops any already-running emulator.

It accepts SDK licenses, installs platform tools, the emulator, and the API 32 Google Play system image.

It creates the AVD if it is missing.

Then it launches the emulator with snapshots disabled, GPU auto, writable system enabled, and the packet streamer endpoint explicitly set to localhost on port 8554.

After launch, it waits for the emulator to appear in adb, waits for Android to finish booting, and prints the useful follow-up commands: shell access, APK install, emulator stop, and process kill.

[slows down] The key detail is not the scaffolding around it.

[emphasized] The key detail is the explicit packet streamer endpoint pointing at the Bumble Netsim bridge.

Key takeaways for M1 Mac, Android Emulator, and Bumble

[deliberate] API level matters.

Newer is not always better for emulator compatibility, especially with complex features like Bluetooth bridging.

API 32 was more stable for this than API 34 in my tests.

[deliberate] Explicit endpoints matter.

Do not rely on the default packet streamer endpoint when using an external bridge like Bumble in Netsim controller mode.

Point the emulator directly to the host and port where your bridge is listening.

[matter-of-fact] Netsim bridge beats QEMU socket here.

The android-netsim bridge mode seems more likely to work with modern emulators than the lower-level QEMU character-device socket method, even though the socket method can establish a TCP link.

[deliberate] usb zero versus vendor and product ID matters too.

On macOS with Apple Silicon, identifying USB devices can be quirky.

If the exact vendor and product ID fails unexpectedly, try the USB index, assuming it points to the intended adapter.

[reflective] Persistence pays off.

This took several attempts, combining documentation, web searches, and iterative testing.

Do not give up too easily.

[gently] Hopefully this specific working configuration saves other developers hours of frustration.

Happy coding, and happy bridging.
