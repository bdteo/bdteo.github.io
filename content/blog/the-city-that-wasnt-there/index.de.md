---
slug: the-city-that-wasnt-there
lang: "de"
translationOf: "the-city-that-wasnt-there"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "4881a4f8a93312f8"
title: "Die Stadt, die nicht da war"
description: "Ich fragte die API nach dem zweitgrößten Eintrag ab und bekam null Ergebnisse. Kein Fehler - einfach nichts. Was ich beim Graben fand, veränderte die gesamte Architektur."
meta_description: "Die Reise eines Entwicklers durch fehlende Daten, Dokumentenparsing, Unicode-Fallen und die Architekturlektionen, die entstehen, wenn deine zweite Datenquelle jede Annahme zerlegt."
keywords: ["Web Scraping", "Datenplattform", "Dokumentenparsing", "Reverse Engineering", "Softwarearchitektur", "SOLID-Prinzipien", "Preisstrategie", "Startup", "Textextraktion", "Unicode"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: 4 min
date: "2026-02-08"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Die Stadt, die nicht da war",
    "description": "Die Reise eines Entwicklers durch fehlende Daten, Dokumentenparsing, Unicode-Fallen und die Architekturlektionen, die entstehen, wenn deine zweite Datenquelle jede Annahme zerlegt.",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2026-02-08",
    "image": "https://bdteo.com/images/the-city-that-wasnt-there.jpg",
    "keywords": "Web Scraping, Datenplattform, Dokumentenparsing, Softwarearchitektur, Startup, Textextraktion",
    "publisher": {
      "@type": "Organization",
      "name": "Boris's Blog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bdteo.com/static/images/logo.png"
      }
    }
  }
featuredImage: "./images/featured.jpg"
imageCaption: "Ein alter Archivschrank aus Holz mit einer leeren Karte in der Mitte, eingefangen in staubigem Licht."
audioUrl: "/audio/articles/the-city-that-wasnt-there/de/LTo9oDjTW1FdEgMfiXWQ-24a8e1ceee99.m4a"
audioDuration: "7:13"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/the-city-that-wasnt-there.de.md"
---

Ich baute ein Ding, das Daten aus einer Quelle zieht, sie säubert und besser darstellt als das Original. Standardarbeit.

Dann fragte ich den zweitgrößten Eintrag im System ab. Alles andere lieferte Hunderte Ergebnisse. Dieser eine: null. Nicht kaputt. Einfach leer.

Ich nahm an, ich hätte es verbockt. Prüfte meinen Code dreimal. Testete den Endpoint direkt. Der Eintrag existiert in ihrer Oberfläche. Er ist nur ... hohl.

Da fing ich an zu graben.

---

Die Quelle wirkte umfassend. Breiter Umfang, polierte Oberfläche, saubere API. Aber freiwillige Teilnahme bedeutet Lücken, die man in der Dokumentation nicht sieht.

Drei Wettbewerber hatten Daten für dieselben Entitäten. Vollständige Datensätze. Die Information existiert also irgendwo.

Dir fehlte kein Endpoint. Dem Endpoint fehlte die Wirklichkeit.

---

Ich stellte eine Frage, die niemand zu stellen schien: Wo lebten diese Daten vor dem Internet?

Die Antwort: gedruckte Periodika. Archive. Analoge Formate, die seit dem 19. Jahrhundert laufen. Dreimal pro Woche veröffentlicht. Keine strukturierten Daten, nur Dokumente auf einer Website.

Also lade ich eins herunter. Dichte institutionelle Prosa, Bekanntmachungen vergraben über mehrere Unterstellen hinweg. Die Daten sind da.

Meine Wettbewerber machen das seit dreißig Jahren manuell.

Ich schreibe an einem Nachmittag einen Scraper. Teils Neugier, teils Trotz.

---

Beim Dokumentenparsing wird es richtig schmerzhaft.

Ein einzelnes Wort wird durch ein weiches Trennzeichen gespalten - Unicode U+00AD, für das Auge unsichtbar, für jede Regex fatal. Du starrst auf den Bildschirm und denkst, dein Pattern sei falsch. Ist es nicht. Da versteckt sich ein Geisterzeichen im Text. JavaScripts `\w` matcht keine Nicht-ASCII-Zeichen, also werden gewöhnliche Wörter zu unmöglichen Treffern. Zahlen enthalten Phantom-Leerzeichen aus dem Renderer: "20. 000" statt "20.000."

Jeder Bug braucht länger zum Finden als zum Fixen. Das ist bei Textextraktion immer das Verhältnis: 90% Detektivarbeit, 10% Code.

---

Zehn Datensätze materialisieren sich aus dem Rauschen. Daten, Kennungen, Orte - alles dort, wo es sein soll. Ich lasse es zweimal laufen, um sicherzugehen, dass ich nicht halluziniere. Gleiches Ergebnis. Es funktioniert wirklich.

---

Parsing zeigt dir, was da ist. Ich beginne zu suchen, was nicht da ist. IDs sind fortlaufend. Ich zähle sie durch.

53% sind tot. Das System löscht abgeschlossene Einträge - kein Archiv, keine Historie. Manche Datensätze existieren, haben aber null begleitende Dokumente. Die Antwort: Besuchen Sie uns persönlich. Im Jahr 2026.

Die Quelle ist keine Datenbank. Sie ist ein Fenster - und jemand schließt es ständig.

---

Die erste Datenquelle formte die Architektur. Die zweite zerlegte jede Annahme.

Ich brauchte eine zweite Architektur. Das ist die höfliche Art zu sagen, dass die erste eigentlich gar keine Architektur war - nur eine funktionierende Lösung, die zufällig auf einen Fall passte. Die seltsame Quelle zeigt die Wahrheit: Du hast für die Daten gebaut, die du hattest, nicht für die Daten, denen du begegnen wirst.

Diesmal baue ich eine richtige. Registry Pattern, gemeinsame Interfaces, Basiskontrakte, die jede Implementierung sich selbst treu bleiben lassen.

Die Architektur ist besser, weil ich gewartet habe. Hätte ich sie am ersten Tag gebaut, hätte ich für die einzige Quelle entworfen, die ich kannte. Die zweite - die seltsame - zwang mich herauszufinden, worauf es wirklich ankommt.

Du kannst nicht für das Unbekannte entwerfen. Aber du kannst refactoren, wenn es ankommt.

---

Die Architektur lehrte mich, wie ich bauen soll. Der Markt lehrte mich, wofür.

Ich betrete einen Markt mit einem Platzhirsch, der seit dreißig Jahren läuft. Seine Technik sieht aus wie 2005. Sein Burggraben ist nicht Technologie - es sind Vertrauen, Markenbekanntheit, Jahrzehnte angesammelter Daten.

Der moderne Wettbewerber startete vor drei Jahren mit KI und glatter UI. Unterbot den Platzhirsch. Drei Jahre später dominiert der Platzhirsch immer noch. Wie sich herausstellt, bedeutet billiger nicht automatisch besser positioniert.

Anker zählen: Der erste Preis wird zum Referenzpunkt. Später leicht zu senken, nahezu unmöglich zu erhöhen. Das Abo ist nicht das Produkt - es ist das Tor zu dem, was dahinter liegt.

Ich setze den Preis hoch an. Runter kann ich immer.

---

Vier Lektionen, kondensiert:

1. **Autoritativ heißt nicht vollständig.** Der Primärquelle fehlte ein ganzes Segment. Die Daten existierten - nur nicht dort, wo sie irgendjemand erwartete.
2. **Die zweite Quelle offenbart deine Architektur.** Du lernst die Wahrheit ueber dein Design erst, wenn etwas die Form verweigert, die du gebaut hast.
3. **Daten sind nicht dauerhaft.** Wenn du sie brauchst, speichere sie. Die Quelle wird es nicht tun.
4. **Setze den Preis für das, was du wirst, nicht für das, was du bist.** Das Abo ist eine Tür. Baue, was dahinter liegt.

Die interessante Arbeit lebt in den Lücken. Ich auch.
