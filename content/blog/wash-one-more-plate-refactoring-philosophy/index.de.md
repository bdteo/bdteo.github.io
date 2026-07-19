---
lang: "de"
translationOf: "wash-one-more-plate-refactoring-philosophy"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "187813737c4f3f45"
title: "Wasch einen Teller mehr: Eine einfache Regel fuer eine dauerhaft saubere Codebase"
date: "2025-07-24"
description: "Eine praktische Philosophie fuer Softwareentwicklung, inspiriert von der Boy Scout Rule: Hinterlasse den Code immer sauberer, als du ihn vorgefunden hast - wasch einen Teller mehr. Warum Micro-Refactoring zaehlt und wie du es anwendest, ohne die Lieferung zu entgleisen."
featuredImage: "./images/featured.jpg"
imageCaption: "Saubere Teller auf einem Kuechentisch, mit einem noch nassen Teller im Vordergrund."
audioUrl: "/audio/articles/wash-one-more-plate-refactoring-philosophy/de/LTo9oDjTW1FdEgMfiXWQ-3f46918ddccb.m4a"
audioDuration: "10:38"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/wash-one-more-plate-refactoring-philosophy.de.md"
---

> **TL;DR**: Behandle jede Aenderung an deiner Codebase wie das Kochen einer Mahlzeit. Du wirst ein paar Teller schmutzig machen. Wenn du fertig bist, wasch nicht nur die Teller, die du benutzt hast - wasch *einen mehr*. Mit der Zeit summiert sich dieser winzige Ueberschuss an Sorgfalt zu einer Kueche (Codebase), die sauber bleibt, statt ins Chaos abzugleiten.

---

## Die Metapher: Kochen, Teller und Code

Stell dir eine Profikueche vor. Jedes gekochte Gericht macht ein paar Teller schmutzig - selbst in der ordentlichsten Brigade. Stell dir nun vor, dass jeder Koch nach seinem Gericht *genau* die Teller waescht, die er schmutzig gemacht hat. Die Kueche wird knapp an der Grenze akzeptabler Sauberkeit bleiben, aber die Entropie kriecht hinein: hier ein bisschen Restschmutz, dort ein fleckiges Schneidebrett. Irgendwann summiert sich das Durcheinander.

Dreh die Regel jetzt um: Nach dem Kochen waescht jeder Chef **einen Teller mehr, als er schmutzig gemacht hat**. Langsam wird die Kueche sauberer als vorher - nicht nur erhalten, sondern verbessert. Dasselbe gilt fuer Software: Jede Aufgabe, die du uebernimmst, sollte der Codebase mindestens einen winzigen Ueberschuss an Sauberkeit geben - einen weiteren Test, einen klareren Namen, eine aufgeteilte Funktion, eine tote Dependency weniger. Diese "+1 Teller"-Gewohnheit ist der Weg, wie eine Codebase *gesund bleibt*.

Ich nenne das **die Wasch-einen-Teller-mehr-Regel**.

## Echos aus dem Handwerk: Du bist in guter Gesellschaft

Das ist keine einsame Philosophie. Vordenker der Softwarewelt predigen seit Jahrzehnten aehnliche Ideen:

*   **"Always leave the campground cleaner than you found it."** Das ist die klassische [Boy Scout Rule](https://deviq.com/principles/boy-scout-rule/), die Robert C. Martin in der Softwarewelt populaer gemacht hat. Derselbe Geist: jedes Mal ein bisschen verbessern.
*   **Technical Debt als Metapher** (Ward Cunningham): Schulden sammeln Zinsen - ignorier sie, und die "Kueche" kostet morgen mehr in der Benutzung. Wenn du unterwegs etwas davon abtraegst, bleibst du zahlungsfaehig.
*   **Refactoring als kleine, kontinuierliche Schritte** (Martin Fowler): winzige Aenderungen, die Verhalten erhalten, aber Design verbessern. Kleine Schritte bedeuten geringes Risiko und stetigen Schwung.
*   **"Make it work, make it right, make it fast"** (Kent Beck): zuerst Korrektheit, dann Sauberkeit, dann Performance. Den zusaetzlichen Teller zu waschen gehoert in die "make it right"-Phase - bevor du vorschnell optimierst.
*   **Broken-Windows-Theorie auf Code angewandt** (Andrew Hunt & David Thomas): sichtbares Chaos laedt zu mehr Chaos ein. Ein "Fenster" zu reparieren, bevor es sich ausbreitet, schuetzt die Nachbarschaft (die Codebase).

Diese Ideen verstaerken einander. Sie sagen alle: *Gib das Durcheinander nicht weiter; nimm dir einen Moment, um es besser zu machen.*

## Warum der zusaetzliche Teller zaehlt (auch wenn du beschaeftigt bist)

### 1. **Entropie ist real**

Sich selbst ueberlassen bleibt Code nicht neutral. Namen driften, Patterns zerfallen, Abstraktionen verrotten. Entropie ist eine Kraft; die einzige Gegenkraft ist konstantes, inkrementelles Aufraeumen. Dein +1 Teller ist Micro-Entropieumkehr.

### 2. **Schulden verzinsen sich schneller, als du denkst**

Die Kosten von Aenderungen wachsen mit jedem "das fixen wir spaeter". Spaeter kommt selten. Die Zinszahlungen zeigen sich als langsamere Feature-Arbeit, fragile Deployments und Testsuites, denen niemand vertraut. Einen zusaetzlichen Teller *heute* zu waschen, senkt morgen den Zinssatz.

### 3. **Das soziale Signal**

Wenn Teamkollegen sehen, dass du hinter dir aufraeumst (und noch ein bisschen mehr), verschiebt sich die Norm. Es wird glaubwuerdig - und erwartet -, Code besser zu hinterlassen, als man ihn vorgefunden hat. Kultur folgt Verhalten.

### 4. **Schwung, nicht Perfektionismus**

Das ist keine Ausrede fuer Yak Shaving. Du baust die Kueche nicht mitten im Service neu. Du faehrst mit dem Schwamm ueber noch einen Teller - klein, sicher und schnell. Genau das haelt Lieferung auf Kurs.

## Wie man die Wasch-einen-Teller-mehr-Regel praktiziert

So verankerst du die Gewohnheit, ohne Scope oder Deadlines zu sprengen.

### 1. Mach "Micro-Refactoring" zu einem Teil von Definition of Done

*   Benenne eine verwirrende Variable um.
*   Extrahiere eine kleine Funktion, um zyklomatische Komplexitaet zu reduzieren.
*   Loesche toten Code oder ungenutzte Imports.
*   Fuege einen fehlenden Test fuer einen Bug hinzu, den du gerade gefixt hast.
*   Aktualisiere Dokumentation oder einen README-Abschnitt, der dich kurz erschreckt hat.

Das Kriterium: **Wenn es mehr als ein paar Minuten dauert, ist es kein Teller - es ist die ganze Spuelmaschine. Verschieb es.** Halte es als Ticket fest.

### 2. Nutze Pull Requests als Reinigungsausloeser

Jeder PR kann den Zeltplatz sauberer hinterlassen:

*   Verlange eine "Was hast du gereinigt?"-Checkbox oder eine kurze Notiz.
*   Ermutige Reviewer, neben ihrem Review kleine Aufraeumarbeiten zu *erbitten*.
*   Feiere PRs, die diesen Extra-Schliff enthalten (Shout-outs im Standup wirken erstaunlich gut).

### 3. Automatisiere die einfachen Teller

*   Pre-commit Hooks fuer Formatierung und Linting.
*   Statische Analyse, die komplexe Methoden oder lange Parameterlisten markiert.
*   Dependency Checker fuer veraltete Libraries.

Lass automatisierte Besen den trivialen Schmutz wegfegen, damit Menschen sich auf Logik und Design konzentrieren koennen.

### 4. Verankere es in Teamnormen

*   Nimm die Regel in euer Working Agreement oder Engineering Handbook auf.
*   Tracke Micro-Refactor-Erfolge in Retros, wenn du messbare Belege willst.
*   Programmiert gelegentlich im Pair oder Mob, um die Gewohnheit (und den Mut) zu verbreiten.

### 5. Wisse, wann du **nicht** waschen solltest

Manchmal brennt die Kueche: Production ist down, oder eine Demo ist nur noch Stunden entfernt. In Notfaellen zerschlag den Stapel schmutziger Teller, wenn es sein muss. Aber komm nach der Krise darauf zurueck. Die Regel ist kein Dogma; sie ist Disziplin.

## Die Grenze: Ein Teller, nicht das ganze Spuelbecken

Scope Creep tarnt sich gern als Handwerkskunst. Deine Aufgabe ist, bei "einem weiteren Teller" aufzuhören. Wenn dieses kleine Refactoring einen tieferen Geruch freilegt, schreib ihn auf und geh weiter. Parke den tieferen Fix:

*   Erstelle ein Ticket mit dem Label `refactor:` oder `techdebt:`.
*   Verlinke es mit dem relevanten Code, den Tests oder dem Modul.
*   Fuege eine kurze Notiz hinzu, warum es wichtig ist.

Du hast deine Pflicht getan: Du hast das Durcheinander gesehen, einen Teller gewaschen und Anweisungen fuer den Rest hinterlassen.

## Beispiel: Aus einer chaotischen Funktion eine testbare machen

Vorher:

```php
function processOrder($order) {
    if(!$order->id) throw new Exception('No ID');
    $tax = 0;
    if ($order->country === 'BG') {
        $tax = $order->total * 0.20;
    } else if ($order->country === 'DE') {
        $tax = $order->total * 0.19;
    }
    // Lots more branching...
    // Sends email, writes to DB, calls payment gateway…
}
```

Gewaschener Teller:

```php
/**
 * Calculate VAT for an order based on country.
 * Pure function: given (total, country) -> VAT amount.
 */
function vatFor(string $country, float $total): float {
    return match($country) {
        'BG' => $total * 0.20,
        'DE' => $total * 0.19,
        default => 0.0,
    };
}
```

Jetzt ruft deine Hauptfunktion `vatFor()` auf, statt die Logik inline zu halten. Du hast einen Micro-Test fuer `vatFor()` hinzugefuegt. Das ist ein zusaetzlicher Teller - einfach, begrenzt, hilfreich.

## Schlussgedanken

Ein Teller mehr ist winzig. Genau darum geht es. Du brauchst keine heroischen Refactorings, um eine Codebase gesund zu halten; du brauchst eine Kultur kleiner, stetiger Sorgfalt. Mach es zur Gewohnheit, back es in euren Prozess ein, und in einem Jahr wirst du dich fragen, warum deine Kueche *keine* Katastrophe ist - weil du nie zugelassen hast, dass sie eine wird.

---

**Call to Action**: Wenn du das naechste Mal eine Datei beruehrst, frag dich: *"Welchen zusaetzlichen Teller kann ich waschen, bevor ich diese Aenderung committe?"* Dann tu es. Wiederholen. Kultur veraendern, ein makelloser Teller nach dem anderen.

### Quellen & Weiterfuehrende Lektuere

*   **Robert C. Martin ("Uncle Bob") - Boy Scout Rule:** "[The Boy Scout Rule](https://97-things-every-x-should-know.gitbooks.io/97-things-every-programmer-should-know/content/en/thing_08/)" aus *97 Things Every Programmer Should Know*.
*   **Ward Cunningham - Technical Debt Metaphor:** Cunninghams urspruengliche Erklaerung von [Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html) auf Martin Fowlers Website.
*   **Martin Fowler - Continuous Micro-Refactoring:** Fowlers Buch [*Refactoring: Improving the Design of Existing Code*](https://martinfowler.com/books/refactoring.html).
*   **Kent Beck - "Make it work, make it right, make it fast":** Eine Erklaerung des Mantras von [Ron Jeffries](https://ronjeffries.com/articles/-x024/biot/-bv40/3/).
*   **Andrew Hunt & David Thomas - Broken Windows in Software:** Das Konzept wird in ihrem Buch [*The Pragmatic Programmer*](https://en.wikipedia.org/wiki/The_Pragmatic_Programmer) beschrieben.
*   **Software Entropy & Maintenance:** Eine gute Lektuere zum Thema ist "[Entropy in Software and the Broken Window Theory](https://chroniclesofapragmaticprogrammer.substack.com/p/entropy-in-software-and-the-broken-window)."
