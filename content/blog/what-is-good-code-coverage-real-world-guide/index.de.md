---
lang: "de"
translationOf: "what-is-good-code-coverage-real-world-guide"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "0490cb5e588445c4"
title: "Was ist \"gute\" Code Coverage? Ein Leitfaden aus der Praxis"
date: "2025-07-15"
description: "Ich räume mit dem 100-%-Mythos auf: bewährte Coverage-Ziele für TypeScript und PHP, der ROI von Tests und Tooling-Tricks, die ich täglich nutze."
tags: ["code-coverage", "testing", "typescript", "php", "best-practices", "quality-assurance"]
featuredImage: "./images/featured.jpg"
imageCaption: "80 % Coverage ≠ 80 % Qualität — und zwar deshalb"
---

# Was ist "gute" Code Coverage? Mein Praxisleitfaden, um Bugs zu stoppen, ohne Engineering-Zeit zu verbrennen

Jedes Mal, wenn ich `npm run coverage` oder `phpunit --coverage` ausführe, taucht dieselbe Frage auf:

> _"Okay ... 74 %. Reicht das?"_

Die Softwareentwicklungs-Blogosphäre ruft "100 % oder gar nichts!" Währenddessen erinnert mich <a href="https://launchdarkly.com/blog/code-coverage-what-it-is-and-why-it-matters/" target="_blank">launchdarkly.com</a> höflich daran, dass 100 % ausgeführt nicht 100 % getestet bedeutet.  
Ich habe Wochen damit verbracht, dieser glänzenden Kennzahl hinterherzulaufen, und noch mehr Wochen damit, _andere_ Probleme zu debuggen. Das hier ist der praxiserprobte Mittelweg, bei dem ich gelandet bin.

---

## Warum 100 % Coverage eine Fata Morgana sind

In der Theorie bedeutet 100 % Zeilenausführung: "keine versteckten Bugs." In der Praxis:

* Abnehmender Grenznutzen: 90 %→95 % verdoppelt oft deine Testsuite, bringt aber nur eine einstellige Risikoreduktion.  
* Falsche Sicherheit: Ein Test, der eine Funktion ohne Assertion aufruft, **zählt trotzdem** als abgedeckt.  
* Business-Realität: Jeder zusätzliche Test ist Zeit, die **nicht** in Features fließt, nach denen deine Kunden gefragt haben.

Die Aerospace-Leute können 100 % anpeilen — dort geht es um Leben und Tod. Für den Rest von uns ist **~80 % die 80/20-Linie**. Dort landen die meisten Projekte nach ROI-Rechnungen. <a href="https://www.testdevlab.com/blog/why-is-high-test-coverage-important" target="_blank">testdevlab.com</a> nennt aus genau diesem Grund den Bereich 70–90 %.

---

## Die praktische Tabelle, die ich benutze

| Coverage | Meine Übersetzung | Handlung |
|---------|------------------|--------|
| 100 % | "Wir sind eine Library, die Raketen fliegt" | Den Aufwand akzeptieren. |
| 90 % + | "Library, von der viel Geld abhängt" | Nur für Module mit hoher Priorität. |
| 80 % | Shippen, beobachten, dann iterieren. |
| 60–70 % | Merge-Gate — PR fehlschlagen lassen, wenn neuer Code dich darunter zieht. |
| < 50 % | Wochenende mit Tech Debt — zuerst auf kritische Pfade umschwenken. |

Ich habe diese Zahlen aus <a href="https://www.atlassian.com/continuous-delivery/software-testing/code-coverage" target="_blank">Atlassians internem Leitfaden</a> geklaut: 60 % "acceptable", 75 % "commendable", 90 % "exemplary". Funktioniert in jeder Retro.

---

## Wie ich 80 % erreiche, ohne zu weinen (TypeScript-Playbook)

1. Jest + Istanbul direkt out of the box  
2. **Coverage-Gate in CI**  
   In `jest.config.js` füge ich hinzu:  
   ```js
   coverageThreshold: {
     global: 80,
     '**/src/core/**': 90
   }
   ```  
3. Ziel sind die heißen Nutzerpfade, nicht der Redux-Boilerplate-Logger.

---

## Wie ich 80 % in Laravel erreiche (PHP-Playbook)

1. PCOV für Geschwindigkeit in der Entwicklung installieren, Xdebug für Branch-Daten in CI.  
2. PHPUnit + diese Defaults in `phpunit.xml`:  
   ```xml
   <filter>
     <whitelist processUncoveredFiles="true">
       <directory suffix=".php">./src</directory>
     </whitelist>
   </filter>
   ```  
3. Mutation Score > Line Count mit <a href="https://infection.github.io/" target="_blank">Infection</a> — so finde ich Zeilen, die "abgedeckt, aber nicht wirklich getestet" sind.

---

## 4 Regeln, nach denen mein Team lebt

1. **Neuer Code = Tests.** Diff Coverage ≥ 90 % vor dem Merge.  
2. **Erst refactoren, dann testen.** Untestbarer Code ist bereits Debt.  
3. **Den Build fehlschlagen lassen, nicht die Menschen.** Das Gate jedes Jahr um 5 % senken, statt Teams mit roten Dashboards zu brechen.  
4. **Bugs in Produktion messen** — wenn Coverage 85 % beträgt, aber Incidents hochgehen, ist **Coverage** nicht der Schuldige; **Assertions** sind es.

---

## TL;DR (auch für Executives und Recruiter)

Frag mich nicht nach einer "magischen Zahl". Frag:  
> Welche Teile des Produkts dürfen nicht kaputtgehen?

Decke **diese** mit 90 % ab. Gib dem Rest gesunde Smoke Tests. Benutze Code Coverage als **Scheinwerfer**, nicht als Ziellinie, und vertraue den Bugs, die du **fängst**, nicht den Zahlen, mit denen du **prahlen** kannst.

Lass das Coverage-Dashboard grün sein — deine Kunden werden es nie sehen, aber ihre Fehlerleiste bleibt leer.  

*— Ende des Rants, zurück in den Editor.*
