# Apple Watch Smoking Detection: Building Still Mirror

[reflective] The idea of truly understanding our habits, especially the ones we perform almost unconsciously, has always fascinated me.

What if our wearables could offer a gentle, non-judgmental mirror to those patterns?

That question sparked Still Mirror: an attempt to passively detect smoking or vaping events using the physiological data from an Apple Watch, without asking the user to log anything manually.

This is not about building another cessation app. It is about pure awareness. A quiet reflection of what happened, when it happened, and how the body responded.

## The Challenge

[matter-of-fact] The core challenge is immense.

How do you distinguish the subtle physiological signature of smoking or vaping from all the other things that happen in a normal day?

Stress can change your heart rate. A brisk walk can change it. A startling noise, a cup of coffee, a bad email, or a sudden interruption can all leave traces in heart rate and heart rate variability.

[slows down] The signal I am looking for is a whisper inside a symphony of physiological noise.

To isolate those fleeting events, I needed something more sophisticated than basic time-series analysis. I needed a technique that could see changes across time and frequency, without losing the exact moment where something unusual happened.

## Choosing the Toolkit

[conversational tone] For a project targeting the Apple Watch, the ecosystem choice is clear.

First, Xcode and Swift. They are the native development environment and language for Apple platforms. Building Still Mirror meant going deeper into Swift, which I find elegant and powerful, while also wrestling with the ordinary complexity of Xcode.

Second, HealthKit. HealthKit is the gateway to the data streams this project depends on: heart rate, heart rate variability, SpO2, and activity levels. The privacy model matters here. An app that handles this kind of personal health data has to be permission-based, careful, and transparent.

Third, the watch itself. Developing for watchOS always means balancing ambition against constraints. Battery life matters. Background processing matters. You cannot pretend the Apple Watch is just a smaller phone. It is a much tighter environment.

## The Algorithmic Heart

[deliberate] The algorithmic heart of this idea is the Stationary Wavelet Transform, or SWT.

Traditional time-series analysis often struggles with non-stationary signals. In plain language, that means signals whose behavior changes over time. Physiological data is exactly like that. Heart rate and heart rate variability do not sit still. Their average, variance, and short-term patterns move constantly.

This is where SWT becomes useful.

The standard Discrete Wavelet Transform can be sensitive to small shifts in the input signal. A tiny movement in timing can dramatically change the coefficients it produces. SWT, on the other hand, is shift-invariant. That makes it more robust when the exact timing of an event matters, but the event itself can move around slightly.

For this problem, SWT gives us three important advantages.

[matter-of-fact] First, time-frequency localization. It can decompose a signal into different frequency bands while preserving timing information. That means we can look for sudden bursts of high-frequency activity in heart rate, or specific changes in heart rate variability bands, at precise moments.

Second, denoising. Physiological signals are messy. SWT can help separate the underlying signal from random noise by looking at coefficients at different scales.

Third, transient event detection. It is especially good at identifying abrupt changes, spikes, and short-lived events. That is exactly the kind of response we might expect from the acute physiological impact of nicotine intake.

In essence, SWT acts like a sophisticated set of filters. It lets us see patterns in heart rate, heart rate variability, and potentially SpO2 data that might otherwise be hidden under noise or long-term trends.

Instead of staring at raw numbers, we can look for characteristic shapes or energy changes in specific wavelet sub-bands. Those changes may correspond to the small physiological jolt I am trying to detect.

## From Data to Detection

[conversational tone] The development journey starts with data collection.

HealthKit has to fetch data reliably in the background, respect user permissions, and handle updates efficiently. That sounds simple until you are dealing with the practical details of Apple platform lifecycles and watchOS constraints.

Then comes signal preprocessing.

The incoming heart rate, heart rate variability, and SpO2 data has to be cleaned. Missing data points need to be handled. Some initial filtering may be needed before SWT is applied.

After that, SWT is applied to segments of the physiological time series. This involves choosing a mother wavelet, such as Daubechies or Symlet, and choosing the right decomposition level.

The real experimentation begins with feature extraction from the wavelet coefficients.

Instead of looking directly at raw heart rate or heart rate variability values, we analyze the coefficients produced by SWT. Useful features might include energy in specific detail coefficient bands near a suspected event, statistical properties like variance and kurtosis, and relationships between signals, such as the cross-correlation between heart rate and heart rate variability coefficients.

The detection logic can start as a rule-based system.

For example, it might look for a significant energy spike in a heart rate detail band, coinciding with a sharp change in a heart rate variability band, during a period of low physical activity.

Eventually, that could evolve into a machine learning model trained on these extracted features.

Confidence scoring is crucial. A passive detection system should not pretend to be certain when the data is ambiguous. Each detected event needs a confidence score that reflects the strength and clarity of the physiological signature.

Finally, all of this has to run on the Apple Watch. That means processing data in batches, triggering analysis intelligently, and constantly optimizing for battery life.

An iOS companion app would show the timeline of detected events, provide insights, and manage settings. WatchConnectivity would handle sync between the watch and the phone.

## The Mirror Philosophy

[deliberate] It is important to say this clearly: Still Mirror is an awareness tool, not a medical device and not a cessation program.

Privacy comes first. Ideally, the sensitive algorithmic work happens on-device. HealthKit access is strictly permission-based.

The app must avoid judgment. Its interface should be neutral. It should reflect patterns without shaming the user, prescribing behavior, or pretending to know what the user should do next.

Accuracy and transparency matter. False positives and false negatives are inevitable with a problem this complex. Users need to understand the limitations, and confidence scores need to be visible and honest.

The goal is empowerment. Still Mirror should give people data about their own bodies and habits, so they can make their own decisions.

## Learning Swift and the Apple Way

[conversational tone] For developers coming from other backgrounds, like my PHP and Laravel roots, diving into Swift, SwiftUI, Xcode, and watchOS is a real learning curve.

Apple frameworks have their own philosophy. App lifecycles, background tasks, HealthKit queries, and WatchConnectivity all come with specific patterns and Apple ways of doing things.

That can be frustrating, but also rewarding. Swift is powerful, the documentation is rich, and the developer community is strong.

## The Potential of a Silent Observer

[reflective] Still Mirror is still an exploration. It is a challenging attempt to push the boundaries of what passive sensing on a consumer wearable can do.

The Stationary Wavelet Transform offers a promising path for dissecting complex physiological signals and uncovering subtle patterns that are easy to miss.

The journey is not just coding in Swift or wrestling with Xcode. It also means learning signal processing theory, understanding human physiology, and thinking carefully about the ethics of passive detection.

Whether Still Mirror becomes a widely used app or remains an intricate technical exploration, the process itself sits at a fascinating intersection: AI, health, signal processing, and personal technology.

[slows down] It is about trying to build a quiet reflective surface. A still mirror for greater self-awareness.
