---
lang: "de"
translationOf: "type-0-refactoring-step-before-step-one"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "701d1621c1262282"
title: "Type-0-Refactoring: Der Schritt vor Schritt eins"
date: "2025-12-13T12:00:00.000Z"
description: "Type-0-Refactoring ist eine begrenzte, verhaltenserhaltende Aufräumarbeit, die chaotischen Code lesbar und sicher bearbeitbar macht, bevor du ein echtes Refactoring versuchst oder einen Hotfix auslieferst."
featuredImage: "./images/featured.webp"
imageCaption: "Mise en place. Die Arbeit vor der Arbeit."
---

Es gibt eine Kategorie von Refactoring, die Teams ständig machen, von der sie sofort profitieren und die fast nie einen Namen bekommt.

Es ist die Arbeit, die du direkt erledigst, bevor du die unheimliche Datei anfasst. Der Feature-Wunsch zwingt dich in das chaotische Modul. Der Incident landet, und der Bug versteckt sich irgendwo in einer Methode, die wirkt, als hätte sie ihr eigenes Wettersystem.

Du entwirfst das System nicht neu. Du führst keine neue Abstraktion ein. Du "verbesserst" nichts auf besonders clevere Weise.

Du machst den Code nur lesbar genug, damit du arbeiten kannst.

Ich habe angefangen, das **Type-0-Refactoring** zu nennen.

**Type-0-Refactoring** ist eine vorbereitende, **verhaltenserhaltende Aufräumarbeit**, die Code leichter nachvollziehbar macht, **bevor** du Architektur-Refactorings, Performance-Arbeit oder Feature-Arbeit angehst.

Es ist der Schritt "erst den Boden trocken bekommen, bevor du die Küche umbaust". Die meisten Teams machen ihn bereits informell. Ihn zu benennen, macht daraus ein gemeinsames Werkzeug.

---

## Der eigentliche Grund für Type 0: Menschen haben ein begrenztes Arbeitsgedächtnis

Hier ist die stumpfe Wahrheit hinter der Idee:

**Mein Gehirn (und deins) ist nicht dafür gebaut, unter Zeitdruck verlässlich eine 2000-Zeilen-Methode zu debuggen.**

Das ist kein persönlicher Makel. So funktioniert Kognition einfach.

Debugging verlangt, dass du gleichzeitig im Kopf behältst:

- den aktuellen Ausführungspfad
- den relevanten Zustand
- was jede Variable tatsächlich bedeutet
- die Menge der möglichen Verzweigungen
- die Folgen von "wenn das passiert, dann..."

In kleinem Code ist das beherrschbar.

In großem Code mit hoher zyklomatischer Komplexität wird daraus probabilistisches Raten. Du kannst immer noch Glück haben, aber es ist teuer und riskant, besonders während eines Hotfixes.

Type 0 ist eine praktische Antwort: So **kaufst du dir schnell Klarheit**, ohne die Kosten und Risiken eines "echten Refactorings" zu übernehmen.

---

## Warum es "Type 0" heißt

Der Name kam nicht aus einer großen Theorie. Er kam aus einem Moment mit hohem Druck.

Ich arbeitete an einem Hotfix. Der Bug war in einer Methode vergraben, die praktisch ihr eigenes kleines Universum war: **ungefähr 2000 Zeilen**.

Der Bug war konzeptionell nicht schwer. Die Methode war es.

Jedes "was passiert, wenn..." verzweigte sich in zehn weitere Fragen, und diese Verzweigung war nicht die nützliche Art. Es war zufällige Komplexität: Lärm, Wiederholung, unklare Benennung und eine Struktur, die nicht zu dem mentalen Modell passte, das man zum Debuggen braucht.

Was ich brauchte, war keine Perfektion. Ich brauchte **Debuggbarkeit**:

- weniger Verzweigungen pro Bildschirm
- klarere "Schritte" mit Namen
- weniger Lärm
- weniger Zeit damit, erneut zu parsen, was ich gerade gelesen hatte

Aber der Zeitdruck ließ kein größeres Refactoring oder ein "idiomatisches Redesign" zu. Das verantwortlich zu tun, wäre ein halber Tag (oder mehr) gewesen, inklusive manuellem Testen. In einem Hotfix-Fenster ist das keine Disziplin, sondern Zocken.

Also bat ich ein LLM, Refactoring-Möglichkeiten für die Klasse und diese Methode vorzuschlagen, ohne ihm zu sagen, warum.

Es kam mit einer Liste von vier "Typen" von Refactoring zurück. Alle sinnvoll. Alle anwendbar. Alle zu teuer für diesen Moment.

Dann stellte es die höfliche Frage:

> "Should I start with Type 1?"

Da antwortete ich:

> "No. Let's start with Type 0."

Und ich definierte Type 0 an Ort und Stelle: eine begrenzte, mechanische Menge von Änderungen, die Komplexität reduzieren und Lesbarkeit erhöhen, **ohne Verhalten oder Architektur zu verändern**.

Die Methode wurde navigierbar. Mein Gehirn konnte den Ausführungsfluss wieder verfolgen. Ich fand den Bug, behob ihn und lieferte aus, ohne Kollateralschäden.

Deshalb mag ich den Namen **Type 0**: Es ist das Refactoring, das du **vor** den "echten Refactoring"-Typen machst, besonders wenn du unter Druck stehst und einen sicheren Weg brauchst, schnell Klarheit zu schaffen.

---

## Das Problem, das Type 0 löst

Die meisten Refactoring-Ratschläge setzen voraus, dass du das Design bereits _sehen_ kannst.

In echten Codebasen:

- sind Methoden lang und haben mehrere Zwecke
- verbergen wiederholte Ausdrücke und zufällige Komplexität die Absicht
- sind Variablen kryptisch (`$e`, `$tmp`, `$res`)
- erzeugen toter Code und unbenutzte Imports mentalen Lärm
- ist die "Form" des Codes so chaotisch, dass selbst kleine Änderungen riskant wirken

Wenn du darauf "echtes Refactoring" versuchst (Grenzen, Patterns, Verantwortlichkeiten verschieben), stapelst du Unsicherheit auf Unsicherheit:

- du kannst nicht leicht erkennen, welches Verhalten du bewahrst
- du kannst den Blast Radius nicht vorhersagen
- Reviews entgleiten in subjektive Debatten
- Menschen bekommen Angst, Dinge anzufassen, und das Chaos verstärkt sich

**Type 0 senkt zuerst die kognitive Last.** Es schafft eine stabile Grundlage, auf der tiefere Arbeit sicher passieren kann.

---

## Greif zu Type 0, wenn...

Type 0 ist am wertvollsten, wenn:

- du schnell debuggen musst (Hotfixes, Incidents) und der Code zu groß/verzweigt ist, um sicher darüber nachzudenken
- du dich "in der Methode verloren" fühlst und denselben Abschnitt immer wieder liest, weil die Struktur deinem Arbeitsgedächtnis nicht hilft
- der Code korrekt, aber unlesbar ist, und du es dir nicht leisten kannst, "Logik aufzuräumen", sondern sie nur freilegen kannst
- du vor tieferer Arbeit Risiko reduzieren willst (du weißt, dass du später refactoren wirst, aber zuerst brauchst du eine klare Karte des aktuellen Verhaltens)
- du Stammeswissen in lesbare Struktur verwandeln willst, damit Debugging nicht von einer Person abhängt

Type 0 ist kein Luxus. In diesen Fällen ist es oft der schnellste Weg, wieder Kontrolle zu gewinnen.

---

## Eine Definition, die du in deinem Team benutzen kannst

**Type-0-Refactoring ist eine Menge von Mikro-Refactorings, die Lesbarkeit und Wartbarkeit verbessern, ohne Verhalten oder Architektur zu verändern.**

Es ist absichtlich begrenzt. Die Begrenzungen sind das Feature.

Type 0 besteht aus vier verpflichtenden Sub-Patterns:

1. **0a. Method extraction**
2. **0b. Conciseness**
3. **0c. Empathy (pure readability)**
4. **0d. Dead code removal**

Und es folgt drei harten Regeln:

- **Keine Verhaltensänderungen**
- **Keine Architektur-Änderungen**
- **Keine "cleveren" Verbesserungen jenseits der vier Patterns**

Wenn du diese Regeln verletzt, machst du nicht mehr Type 0. Du bist in eine andere Arbeitskategorie gewechselt, und die braucht andere Koordination, andere Review-Strenge und oft eine andere Teststrategie.

---

## Warum überhaupt benennen?

Weil Benennung verändert, wie Teams koordinieren.

- "Ich mache in diesem PR nur Type 0" sagt Reviewern, worauf sie achten sollen: Verhaltenserhaltung und Lesbarkeit, nicht Architektur-Debatten.
- "Wir brauchen Type 0, bevor wir das refactoren" ist ein ehrliches Eingeständnis, dass der Code noch nicht bereit für tiefere Änderung ist.
- "Lasst uns Type 0 als Schritt 0 machen" schafft ein kleines Ritual, das verhindert, dass du auf Chaos aufbaust.

---

## Die vier Sub-Patterns

### 0a. Method extraction (das Fundament)

**Ziel:** große Methoden in kleine, fokussierte Methoden zerlegen, damit ein Mensch die Absicht linear lesen kann.

Faustregeln:

- zerlege Methoden, die zu lang sind, um sie im Arbeitsgedächtnis zu halten
- jede extrahierte Methode sollte eine Sache tun und einen beschreibenden Namen haben
- extrahiere bedeutungsvolle Schritte, keine beliebigen Brocken von N Zeilen

Warum es funktioniert (besonders beim Debugging):

- kleinere Methoden schaffen Labels für den Ausführungspfad
- ein 2000-Zeilen-Scroll wird zu einer kurzen Orchestrierungsmethode, die du mental durchgehen kannst
- du kannst Breakpoints an semantische Grenzen setzen ("validate input", "build query", "apply filters"), statt zu suchen

### 0b. Conciseness (zufällige Komplexität reduzieren)

**Ziel:** visuellen Lärm entfernen, damit die Absicht hervorsticht.

Beispiele:

- wiederholte Ausdrücke in lokale Variablen extrahieren
- wiederholte Log-Kontexte / Schlüsselstrings / URL-Fragmente in Variablen extrahieren
- Sprachfeatures bevorzugen, die Absicht direkt kommunizieren
- übermäßig wortreiche Interpolation vereinfachen

Warum es funktioniert:

- es reduziert kognitive Last
- es macht Diffs kleiner und Änderungen sicherer
- es verhindert Copy/Paste-Drift

### 0c. Empathy (reine Lesbarkeit)

**Ziel:** für den nächsten Menschen schreiben, nicht für den Compiler.

Empathy bedeutet:

- beschreibende Variablennamen verwenden (`$e`, `$d`, `$tmp` vermeiden, außer sie sind wirklich offensichtlich)
- konsistente Terminologie in einem Modul beibehalten
- irreführende Namen umbenennen
- Code selbstdokumentierend machen

Lackmustest:

> Wenn jemand das um 2 Uhr nachts während eines Incidents liest, hilft es ihm, den Ausführungspfad im Kopf zu behalten?

### 0d. Dead code removal (Lügen entfernen)

**Ziel:** alles löschen, was vorgibt, wichtig zu sein, es aber nicht ist.

Beispiele:

- unbenutzte private Methoden
- unbenutzte Imports
- auskommentierte alte Ansätze
- deprecated Helpers, die niemand aufruft

Warum es funktioniert:

- weniger Code bedeutet weniger Dinge, die man missverstehen kann
- Suchergebnisse werden vertrauenswürdig

---

## Was Type 0 nicht ist

Type 0 ist nicht:

- Service-Grenzen verändern
- neue Abstraktionen oder Patterns einführen
- einen Workflow neu architektieren
- Libraries ersetzen
- Verantwortlichkeiten über Schichten hinweg neu ordnen
- Logik "fixen", von der du vermutest, dass sie falsch ist (außer du deklarierst explizit eine Verhaltensänderung und testest sie)

Wenn du dich sagen hörst:

- "Wenn ich schon hier bin, können wir auch..."
- "Das wäre schöner, wenn wir..."
- "Wir sollten das wahrscheinlich neu designen..."

dann verlässt du vielleicht Type 0. Das ist nicht an sich schlecht, aber es sollte absichtlich passieren.

---

## Das Kernversprechen: Verhaltenserhaltung (und wie du sie wahr hältst)

Type 0 funktioniert nur, wenn Teams dem Versprechen vertrauen.

Und ja, du hast recht, skeptisch zu sein: **Method extraction kann versehentlich Verhalten verändern** (early returns, Variablenscope, Auswertungsreihenfolge, Exception-Verhalten).

Deshalb braucht Type 0 Disziplin, die es ehrlich hält:

**Extrahiere unverändert, dann benenne um/räume auf.**

- Erster Durchlauf: Code in Methoden verschieben, ohne Logik zu verändern
- Zweiter Durchlauf: conciseness + empathy anwenden
- Dritter Durchlauf: toten Code entfernen

Praktische Leitplanken:

- ordne Bedingungsprüfungen nicht "für die Lesbarkeit" um
- ersetze Logik nicht durch "äquivalente" Logik, außer du bist außerhalb von Type 0
- sei vorsichtig mit Variablen, die vorher in gemeinsamem Scope lagen
- behandle "kleine" Unterschiede im Control Flow als echte Unterschiede

Und wenn du *irgendein* Sicherheitsnetz hast, selbst ein dünnes:

- führe einen fokussierten Test aus
- spiele das fehlschlagende Szenario erneut durch
- validiere den einen Pfad, den du berührst

Bei Type 0 geht es darum, schnell zu sein: **aber schnell durch Reduktion kognitiver Komplexität**, nicht schnell durch das Überspringen von Sicherheit.

---

## Type 0 als wiederholbares Team-Ritual

### 1) Entscheide den Scope (Timeboxing hilft)

Beispiele:

- "Type 0 the hot path before debugging."
- "Type 0 only the path touched by this bug fix."

### 2) Identifiziere die "Wirbelsäule" des Codes

Finde die Entry-Methode(n) und die Verzweigungspunkte. Verwandle diese Wirbelsäule durch Extraktion in eine lesbare Erzählung.

### 3) Wende die vier Sub-Patterns der Reihe nach an

Method extraction → conciseness → empathy → dead code removal.

### 4) Führe eine "Type-0-Checklist" in deinem PR

- [ ] Keine Verhaltensänderungen (Inputs/Outputs unverändert)
- [ ] Keine Architekturbewegungen
- [ ] Methoden extrahiert und als bedeutungsvolle Schritte benannt
- [ ] Wiederholte Ausdrücke extrahiert, wo es Klarheit verbessert
- [ ] Variablen umbenannt; Terminologie konsistent
- [ ] Toter Code und unbenutzte Imports entfernt

---

## Schlussgedanke

Type-0-Refactoring ist das einfachste Versprechen, das ein Entwickler geben kann:

> "Ich hinterlasse diesen Code leichter bearbeitbar, als ich ihn vorgefunden habe, ohne zu verändern, was er tut."

Manchmal ist das "nice to have".

Und manchmal ist es der einzige Weg, wie ein Mensch sich sicher schnell in einem hochkomplexen Chaos bewegen kann, besonders während eines Hotfixes.
