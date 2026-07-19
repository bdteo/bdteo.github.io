[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

[matter-of-fact] TL;DR: Behandle jede Aenderung an deiner Codebase wie das Kochen einer Mahlzeit. Du wirst ein paar Teller schmutzig machen. Wenn du fertig bist, wasch nicht nur die Teller, die du benutzt hast — wasch einen mehr. Mit der Zeit summiert sich dieser winzige Ueberschuss an Sorgfalt zu einer Kueche (Codebase), die sauber bleibt, statt ins Chaos abzugleiten.

Die Metapher: Kochen, Teller und Code.

Stell dir eine Profikueche vor. Jedes gekochte Gericht macht ein paar Teller schmutzig — selbst in der ordentlichsten Brigade. Stell dir nun vor, dass jeder Koch nach seinem Gericht genau die Teller waescht, die er schmutzig gemacht hat. Die Kueche wird knapp an der Grenze akzeptabler Sauberkeit bleiben, aber die Entropie kriecht hinein: hier ein bisschen Restschmutz, dort ein fleckiges Schneidebrett. Irgendwann summiert sich das Durcheinander.

[deliberate] Dreh die Regel jetzt um: Nach dem Kochen waescht jeder Chef einen Teller mehr, als er schmutzig gemacht hat. Langsam wird die Kueche sauberer als vorher — nicht nur erhalten, sondern verbessert. Dasselbe gilt fuer Software: Jede Aufgabe, die du uebernimmst, sollte der Codebase mindestens einen winzigen Ueberschuss an Sauberkeit geben — einen weiteren Test, einen klareren Namen, eine aufgeteilte Funktion, eine tote Dependency weniger. Diese "+1 Teller"-Gewohnheit ist der Weg, wie eine Codebase gesund bleibt.

[reflective] Ich nenne das die Wasch-einen-Teller-mehr-Regel.

Echos aus dem Handwerk: Du bist in guter Gesellschaft.

Das ist keine einsame Philosophie. Vordenker der Softwarewelt predigen seit Jahrzehnten aehnliche Ideen:

[gently] "Always leave the campground cleaner than you found it." Das ist die klassische Boy Scout Rule, die Robert C. Martin in der Softwarewelt populaer gemacht hat. Derselbe Geist: jedes Mal ein bisschen verbessern.

Technical Debt als Metapher (Ward Cunningham): Schulden sammeln Zinsen — ignorier sie, und die "Kueche" kostet morgen mehr in der Benutzung. Wenn du unterwegs etwas davon abtraegst, bleibst du zahlungsfaehig.

[emphasized] Refactoring als kleine, kontinuierliche Schritte (Martin Fowler): winzige Aenderungen, die Verhalten erhalten, aber Design verbessern. Kleine Schritte bedeuten geringes Risiko und stetigen Schwung.

"Make it work, make it right, make it fast" (Kent Beck): zuerst Korrektheit, dann Sauberkeit, dann Performance. Den zusaetzlichen Teller zu waschen gehoert in die "make it right"-Phase — bevor du vorschnell optimierst.

[conversational tone] Broken-Windows-Theorie auf Code angewandt (Andrew Hunt und David Thomas): sichtbares Chaos laedt zu mehr Chaos ein. Ein "Fenster" zu reparieren, bevor es sich ausbreitet, schuetzt die Nachbarschaft (die Codebase).

Diese Ideen verstaerken einander. Sie sagen alle: Gib das Durcheinander nicht weiter; nimm dir einen Moment, um es besser zu machen.

[matter-of-fact] Warum der zusaetzliche Teller zaehlt (auch wenn du beschaeftigt bist).

1. Entropie ist real.

[reflective] Sich selbst ueberlassen bleibt Code nicht neutral. Namen driften, Patterns zerfallen, Abstraktionen verrotten. Entropie ist eine Kraft; die einzige Gegenkraft ist konstantes, inkrementelles Aufraeumen. Dein +1 Teller ist Micro-Entropieumkehr.

2. Schulden verzinsen sich schneller, als du denkst.

[deliberate] Die Kosten von Aenderungen wachsen mit jedem "das fixen wir spaeter". Spaeter kommt selten. Die Zinszahlungen zeigen sich als langsamere Feature-Arbeit, fragile Deployments und Testsuites, denen niemand vertraut. Einen zusaetzlichen Teller heute zu waschen, senkt morgen den Zinssatz.

3. Das soziale Signal.

Wenn Teamkollegen sehen, dass du hinter dir aufraeumst (und noch ein bisschen mehr), verschiebt sich die Norm. Es wird glaubwuerdig — und erwartet -, Code besser zu hinterlassen, als man ihn vorgefunden hat. Kultur folgt Verhalten.

[flatly] 4. Schwung, nicht Perfektionismus.

Das ist keine Ausrede fuer Yak Shaving. Du baust die Kueche nicht mitten im Service neu. Du faehrst mit dem Schwamm ueber noch einen Teller — klein, sicher und schnell. Genau das haelt Lieferung auf Kurs.

[emphasized] Wie man die Wasch-einen-Teller-mehr-Regel praktiziert.

So verankerst du die Gewohnheit, ohne Scope oder Deadlines zu sprengen.

[matter-of-fact] 1. Mach "Micro-Refactoring" zu einem Teil von Definition of Done.

[conversational tone] Benenne eine verwirrende Variable um.

Extrahiere eine kleine Funktion, um zyklomatische Komplexitaet zu reduzieren.

Loesche toten Code oder ungenutzte Imports.

[deliberate] Fuege einen fehlenden Test fuer einen Bug hinzu, den du gerade gefixt hast.

Aktualisiere Dokumentation oder einen README-Abschnitt, der dich kurz erschreckt hat.

Das Kriterium: Wenn es mehr als ein paar Minuten dauert, ist es kein Teller — es ist die ganze Spuelmaschine. Verschieb es. Halte es als Ticket fest.

2. Nutze Pull Requests als Reinigungsausloeser.

Jeder PR kann den Zeltplatz sauberer hinterlassen:

Verlange eine "Was hast du gereinigt?"-Checkbox oder eine kurze Notiz.

[stress on next word] Ermutige Reviewer, neben ihrem Review kleine Aufraeumarbeiten zu erbitten.

Feiere PRs, die diesen Extra-Schliff enthalten (Shout-outs im Standup wirken erstaunlich gut).

[matter-of-fact] 3. Automatisiere die einfachen Teller.

Pre-commit Hooks fuer Formatierung und Linting.

[gently] Statische Analyse, die komplexe Methoden oder lange Parameterlisten markiert.

Dependency Checker fuer veraltete Libraries.

[deliberate] Lass automatisierte Besen den trivialen Schmutz wegfegen, damit Menschen sich auf Logik und Design konzentrieren koennen.

4. Verankere es in Teamnormen.

[emphasized] Nimm die Regel in euer Working Agreement oder Engineering Handbook auf.

[matter-of-fact] Tracke Micro-Refactor-Erfolge in Retros, wenn du messbare Belege willst.

Programmiert gelegentlich im Pair oder Mob, um die Gewohnheit (und den Mut) zu verbreiten.

5. Wisse, wann du nicht waschen solltest.

[reflective] Manchmal brennt die Kueche: Production ist down, oder eine Demo ist nur noch Stunden entfernt. In Notfaellen zerschlag den Stapel schmutziger Teller, wenn es sein muss. Aber komm nach der Krise darauf zurueck. Die Regel ist kein Dogma; sie ist Disziplin.

[conversational tone] Die Grenze: Ein Teller, nicht das ganze Spuelbecken.

[deadpan] Scope Creep tarnt sich gern als Handwerkskunst. Deine Aufgabe ist, bei "einem weiteren Teller" aufzuhören. Wenn dieses kleine Refactoring einen tieferen Geruch freilegt, schreib ihn auf und geh weiter. Parke den tieferen Fix:

Erstelle ein Ticket mit dem Label refactor: oder techdebt:.

Verlinke es mit dem relevanten Code, den Tests oder dem Modul.

[matter-of-fact] Fuege eine kurze Notiz hinzu, warum es wichtig ist.

Du hast deine Pflicht getan: Du hast das Durcheinander gesehen, einen Teller gewaschen und Anweisungen fuer den Rest hinterlassen.

[reflective] Beispiel: Aus einer chaotischen Funktion eine testbare machen.

Vorher:

[gently] Gewaschener Teller:

[deliberate] Jetzt ruft deine Hauptfunktion vatFor() auf, statt die Logik inline zu halten. Du hast einen Micro-Test fuer vatFor() hinzugefuegt. Das ist ein zusaetzlicher Teller — einfach, begrenzt, hilfreich.

Schlussgedanken.

[emphasized] Ein Teller mehr ist winzig. Genau darum geht es. Du brauchst keine heroischen Refactorings, um eine Codebase gesund zu halten; du brauchst eine Kultur kleiner, stetiger Sorgfalt. Mach es zur Gewohnheit, back es in euren Prozess ein, und in einem Jahr wirst du dich fragen, warum deine Kueche keine Katastrophe ist — weil du nie zugelassen hast, dass sie eine wird.

[matter-of-fact] Call to Action: Wenn du das naechste Mal eine Datei beruehrst, frag dich: "Welchen zusaetzlichen Teller kann ich waschen, bevor ich diese Aenderung committe?" Dann tu es. Wiederholen. Kultur veraendern, ein makelloser Teller nach dem anderen.
