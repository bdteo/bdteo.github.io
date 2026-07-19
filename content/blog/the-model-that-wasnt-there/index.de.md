---
lang: "de"
translationOf: "the-model-that-wasnt-there"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "302e3501ec007351"
title: "Das Modell, das nicht da war"
date: "2026-03-14"
description: "Google stand an der Spitze jedes Benchmarks. YouTube-Videos, Konferenzen, Seminare. Das beste Modell zur Bildgenerierung der Welt. Dann habe ich versucht, es zu benutzen."
featuredImage: "./images/featured.jpg"
imageCaption: "Ein beleuchtetes Podest hinter einem roten Absperrseil: Das Versprechen ist ausgestellt, aber nicht zum Anfassen gedacht."
audioUrl: "/audio/articles/the-model-that-wasnt-there/de/LTo9oDjTW1FdEgMfiXWQ-a6a5c8664a7d.m4a"
audioDuration: "7:35"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/the-model-that-wasnt-there.de.md"
---

Wir generierten Anzeigenbilder mit Gemini 3 Pro. Platz #4 im Artificial-Analysis-Leaderboard. Die Qualität war wirklich beeindruckend - bessere Prompt-Treue, bessere Typografie, besserer kreativer Output als alles andere, was wir ausprobiert hatten. Google war damit überall. YouTube-Videos. Konferenzen. Seminare. Blogposts. "Das beste Modell zur Bildgenerierung der Welt."

Ich glaubte ihnen. Die Bilder waren gut.

---

Dann meldete ein Nutzer, dass das Klonen einer Anzeige vier Minuten dauerte. Ich sah nach. Die Generierung selbst war in unter dreißig Sekunden fertig. Die anderen dreieinhalb Minuten? Der Job versuchte es immer wieder gegen eine Wand.

429. Resource Exhausted.

---

Google hatte für die Gemini-Bildgenerierung ein hartes Limit gesetzt: zwei Anfragen pro Minute. Pro Projekt. Global.

Zwei. Nicht zweihundert. Nicht zwanzig. Zwei.

Am Tag davor hatten wir 900 Bilder ohne Problem generiert. Auf ihrer Seite hatte sich etwas geändert. Keine Mitteilung, keine E-Mail, kein Changelog-Eintrag. Nur eine neue Decke, niedrig genug, dass zwei Nutzer, die gleichzeitig klicken, sie erreichen.

---

Unser DevOps reichte einen Antrag auf Quota-Erhöhung ein. Dreißig RPM. Vernünftig für ein Production-SaaS. Die Antwort von Google:

> "This gemini model is not available for quota increase."

Sie schlugen vor, auf Imagen 4 zu wechseln. Ich sah es nach.

Imagen 4 Ultra - Platz #10. Imagen 4 Standard - #42. Imagen 4 Fast - #60.

Wir waren auf #4. Googles Vorschlag war ein Downgrade um irgendwo zwischen sechs und sechsundfünfzig Plätze auf ihrem eigenen Leaderboard.

---

Ich probierte alles aus, was mir einfiel.

Wechsel zu Gemini 3.1 Flash - Platz #2, halb so teuer, besser als das, was wir hatten. Auf Staging deployed. Dann prüfte ich die Quota. Dasselbe Limit von 2 RPM. Es ist nicht pro Modell. Es ist pro Projekt, pro Base-Model-Family. Jedes Gemini-Bildmodell teilt sich denselben Bucket.

Multi-Region-Verteilung - die Quota gilt pro Region, also würden Anfragen über fünf Regionen verteilt zehn RPM ergeben. Nur funktionieren Gemini-3.x-Bildmodelle ausschließlich über den globalen Endpoint. Es gibt keine regionalen Endpoints. Die 2 RPM auf dem globalen Endpoint sind der einzige Bucket, der existiert.

Mehrere GCP-Projekte - jedes bekommt seine eigenen 2 RPM. Technisch funktioniert das. Architektonisch sieht so Verzweiflung aus.

---

Ich begann zu recherchieren, was andere Entwickler erlebten. Überall dieselbe Geschichte. Undokumentiertes 2-RPM-Limit. Forenposts ohne Antwort von Google. Genehmigte Quota-Erhöhungen, die trotzdem bei jedem Aufruf 429 zurückgaben. Unsere monatlichen $30K GCP-Ausgaben? Helfen nicht. Die Standard-PayGo-Tiers schließen Bildgenerierungsmodelle ausdrücklich von Throughput-Vorteilen aus.

Google wird dieses Limit nicht erhöhen.

---

Und dann die interessante Frage: Warum nicht?

Gemini generiert Bilder mit demselben autoregressiven Transformer, der Text verarbeitet. Es ist kein Diffusionsmodell. Es ist das volle LLM, das sich Pixel für Pixel durch ein Bild hindurchdenkt. Jedes Bild verbrennt so viel Compute wie Dutzende Text-API-Aufrufe.

Bei $0.067 pro Bild verliert Google mit ziemlicher Sicherheit Geld bei jeder Generierung. Das 2-RPM-Limit ist keine Quota, die sie vergessen haben anzupassen. Es ist eine berechnete Drosselung, weil die Ökonomie nicht funktioniert.

Imagen 4 nutzt klassische latente Diffusion - um Größenordnungen billiger im Betrieb. Deshalb bekommt es 30-150 RPM, und deshalb drängt Google alle dorthin. Das teure Modell bekommt das Marketing. Das billige Modell bekommt den Durchsatz.

---

Denk darüber nach, was das bedeutet. Google hat ein Modell gebaut, das jeden Benchmark anführte. Sie haben es auf jeder Konferenz vermarktet, in jeder YouTube-Keynote, in jedem Entwicklerblog. "State of the art. Das beste der Welt." Entwickler integrieren es in Production. Nutzer verlassen sich darauf. Dann: zwei Anfragen pro Minute, keine Erhöhung verfügbar, verwendet stattdessen unser schlechteres Modell.

Die API existiert. Der Endpoint funktioniert. Die Demo ist atemberaubend.

Aber du kannst es nicht wirklich benutzen.

---

Wir wechselten zu `gemini-2.5-flash-image`. Dem älteren Modell. Dem langweiligen. Dem, über das niemand YouTube-Videos macht.

Es hat 40 RPM. Es funktioniert.

---

Vier Lektionen, verdichtet:

1. **Marketing ist kein Produkt.** Ein Leaderboard anzuführen heißt nicht, dass du Production-Traffic bedienen kannst. Benchmarks messen Qualität. Rate Limits messen Commitment.
2. **Autoregressive Bildgenerierung skaliert nicht.** Wenn ein Bild so viel kostet wie hundert Textabfragen, überlebt kein Geschäftsmodell großzügige Rate Limits. Die Ökonomie ist das Signal.
3. **Preview bedeutet Preview.** Google kann Limits ändern, Modelle abschalten oder dich ohne Vorwarnung zu schlechteren Alternativen umleiten. Wenn dein Production-System von einem Preview-Modell abhängt, hängt dein Production-System am Marketingkalender eines anderen.
4. **Das langweilige Modell funktioniert.** Das mit 40 RPM und ohne Konferenzvorträge wird deine Nutzer bedienen, während das Weltklasse-Modell hinter einer Samtkordel sitzt und zwei Bilder pro Minute generiert.

Der unheimlichste Vendor-Lock-in ist der, der mit einer Demo beginnt, der du nicht widerstehen kannst.
