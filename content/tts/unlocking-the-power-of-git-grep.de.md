[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

Die meisten Ratschläge zur Codesuche beginnen mit Geschwindigkeit. Geschwindigkeit zählt, aber der eigentliche Grund, warum ich zu git grep greife, ist einfacher:

[conversational tone] Es durchsucht den Code, von dem Git weiß, nicht das ganze Dateisystem.

Das bedeutet, deine Suche wandert nicht in node modules, Cache-Verzeichnis, dist, Coverage-Reports, lokale Dumps, Screenshots oder irgendein temporäres Ding, das du während eines merkwürdigen Debugging-Nachmittags erstellt hast. Standardmäßig beginnt git grep bei den getrackten Pfaden in deinem Git working tree. Allein diese Einschränkung macht die Ergebnisse ruhiger.

Das ist kein Argument gegen rg / ripgrep. Ich benutze rg ständig. Aber die beiden Werkzeuge beantworten verschiedene Fragen:

git grep: "Wo ist das im getrackten Code, oder in einem anderen Branch, Tag oder Commit?"

rg: "Wo ist das auf der Platte, unter Beachtung meiner Ignore-Regeln?"

Wenn diese Unterscheidung einmal klickt, hört git grep auf, ein alter Befehl zu sein, von dem man vage weiß, dass er existiert, und wird zu einer sehr scharfen kleinen Gewohnheit.

[matter-of-fact] Das mentale Modell.

Die nützliche Form des Befehls lautet:

In normaler Sprache:

`` ist das, wonach du suchst.

`` ist optional: ein Branch, Tag, Commit oder ein anderer Git tree, den du durchsuchen willst.

[deliberate] `` ist optional: die Dateien oder Verzeichnisse, auf die du die Suche begrenzen willst.

-- trennt revisions von paths, wenn es irgendeine Möglichkeit von Mehrdeutigkeit gibt.

Standardmäßig durchsucht git grep getrackte Dateien in deinem working tree. Es ist kein magischer Content-Index. Es liest nicht jede Datei unter dem aktuellen Verzeichnis. Es fragt Git, welche Pfade zum Projekt gehören, und durchsucht dann diese Pfade.

Deshalb fühlt es sich aufgeräumt an.

Rezepte.

1. Getrackten Code durchsuchen und Zeilennummern anzeigen.

Das ist die Alltagsversion. -n gibt Zeilennummern aus, wodurch die Ausgabe in einem Terminal, einem PR-Kommentar oder einer schnellen Handoff-Notiz nützlich wird.

Wenn du immer Zeilennummern möchtest, unterstützt Git dafür eine config:

Ich tippe trotzdem meist -n, weil es in snippets sichtbar und portabel ist.

2. Einen literalen String suchen, keine Regex.

Verwende -F, wenn das pattern ein fester String ist. Klammern, Punkte, eckige Klammern und andere regex-artige Zeichen werden als gewöhnlicher Text behandelt.

Zwei kleine Gewohnheiten sind hier wichtig:

[matter-of-fact] Setze file globs hinter --.

Quote die globs, damit deine Shell sie nicht expandiert, bevor Git sie sieht.

Das ist die Version, die ich möchte, wenn ich den exakten function call, config key, class name oder error message kenne.

3. Case-insensitive, als ganzes Wort, mit Spalten suchen.

-i ignoriert Groß-/Kleinschreibung. -w fragt nach whole-word matches. --column gibt die Spaltennummer des ersten Treffers in der Zeile aus.

Das ist angenehm, wenn der Begriff so häufig ist, dass rohe Ausgabe laut wird. Es ist auch nützlich, wenn du Ergebnisse an editor integrations oder quickfix lists weitergibst.

4. Nach einem pattern suchen, das mit einem Dash beginnt.

Ohne -e könnte Git das pattern als weitere Kommandozeilenoption lesen. -e sagt: "Das nächste Ding ist ein search pattern." Es ist eines dieser winzigen Flags, die man nicht oft braucht, aber wenn man es braucht, braucht man es wirklich.

Du kannst auch mehr als ein -e übergeben:

Das sucht nach einem der beiden patterns.

[deliberate] 5. Eine Regex verwenden, wenn Struktur zählt.

-E aktiviert extended regular expressions. Dieses Beispiel sucht Python-Funktionsdefinitionen, ohne so zu tun, als wäre es ein Parser.

Für größere strukturelle Fragen solltest du die Sprachwerkzeuge benutzen. git grep ist hervorragend darin, Kandidaten zu finden; es ist kein AST engine, und diese Ehrlichkeit ist ein Teil davon, warum ich es mag.

6. Die Suche auf einen path begrenzen.

Die pathspecs nach -- halten die Suche fokussiert. Das ist oft mental schneller, nicht nur rechnerisch. Du sagst dem Befehl, welche Art Antwort dir wichtig ist.

Du kannst auch paths ausschließen:

Git pathspecs sind mächtig und ein wenig seltsam. Die wichtige praktische Regel ist, dass path filters hinter -- stehen und exclusion pathspecs wie:(exclude)... von Git verarbeitet werden, nicht von der Shell.

7. Nur passende Dateien auflisten.

-l gibt Dateinamen statt passender Zeilen aus. Verwende es, wenn der nächste Schritt "Dateien öffnen" oder "blast radius zählen" lautet, nicht "jeden match lesen".

Das Gegenteil gibt es auch:

-L listet getrackte Dateien auf, die das pattern nicht enthalten. Das kann während Framework-Migrationen überraschend praktisch sein.

8. Treffer pro Datei zählen.

-c gibt dir eine schnelle Heatmap. Es ist keine Codequalitätsmetrik; bitte mach keine daraus. Aber es ist nützlich, um die Dateien zu erkennen, in denen ein Begriff konzentriert ist, bevor du mit dem Editieren beginnst.

9. Die staged Version statt des working tree durchsuchen.

Standardmäßig durchsucht git grep getrackte Pfade im working tree. --cached durchsucht die blobs im Index — die staged Version.

Das ist nützlich in pre-commit checks, review scripts oder jedem Moment, in dem du fragen willst: "Was genau habe ich staged?", statt "Was liegt gerade auf der Platte?"

10. Untracked files durchsuchen, mit Ignore-Regeln im Hinterkopf.

--untracked fügt untracked files zur Suche hinzu. In diesem Modus werden die Standard-Ignore-Regeln von Git beachtet, also bleiben ignored files weiterhin aus dem Ergebnis heraus.

[calm] Wenn du wirklich auch ignored files willst:

Das ist ein bewusster Schritt. Ich benutze ihn, wenn ich vermute, dass eine generated file, lokale fixture oder ein ignored artifact das enthält, wonach ich jage.

11. Einen anderen Branch, Tag oder alten Commit ohne checkout durchsuchen.

Das ist die killer feature.

Kein checkout. Kein stash. Kein Worktree-Umweg. Du kannst einem Branch, Tag oder alten Commit eine direkte Frage stellen und genau dort bleiben, wo du bist.

Wenn ein bug report sagt: "Das hat im letzten Release funktioniert", fange ich meist hier an.

12. Jeden Commit nur durchsuchen, wenn du es wirklich meinst.

Das durchsucht commit trees über die ganze History hinweg in Batches. Auf einem ernsthaften Repository kann das laut, repetitiv und teuer sein, weil derselbe file content in vielen Commits auftauchen kann.

Meistens ist git log der bessere companion, wenn deine eigentliche Frage lautet: "Wann ist dieser String aufgetaucht oder verschwunden?"

-S ist für Änderungen in der Anzahl der occurrences eines Strings. -G ist für diffs, deren hinzugefügte oder entfernte Zeilen eine Regex matchen. Andere Frage, anderes Werkzeug.

[conversational tone] Die gitignore-Datei-Falle.

Der Satz "git grep respects gitignore-Datei" ist nah genug dran, um verführerisch zu sein, und falsch genug, um dich zu beißen.

Standardmäßig durchsucht git grep getrackte Dateien. Eine gitignore-Datei-Datei dient dazu, untracked files untracked zu halten. Dateien, die bereits von Git getrackt werden, werden nicht unsichtbar, nur weil eine spätere Ignore-Regel auf sie passt.

Die genaue Version lautet also:

Standardmäßig durchsucht git grep tracked paths im working tree.

Ignored-but-untracked files werden nicht durchsucht, weil untracked files nicht durchsucht werden.

Ignored-but-tracked files werden durchsucht, weil sie tracked sind.

--untracked fügt untracked files hinzu und beachtet weiterhin standard ignore rules.

[matter-of-fact] --untracked --no-exclude-standard schließt auch ignored files ein.

--no-index verwandelt git grep in eine Dateisystemsuche vom aktuellen Verzeichnis aus, sogar außerhalb eines Repos.

--no-index --exclude-standard sorgt dafür, dass diese Dateisystemsuche die standard ignore rules von Git beachtet.

Der Randfall zählt in alten repositories. Eine Datei kann zuerst committed und später ignoriert worden sein. Wenn du einen String suchst und git grep ihn in einer angeblich ignored file findet, ist Git nicht verwirrt. Die Datei ist tracked.

Wann rg das bessere Werkzeug ist.

Verwende ripgrep, wenn du Dateisystem-semantics willst.

rg läuft durch den directory tree. Standardmäßig respektiert es gitignore-Datei,.ignore,.rgignore, globale Ignore-Dateien, hidden-file rules und binary-file skipping. Es ist sehr schnell, sehr ausgereift und normalerweise das, was ich will, wenn ich das working directory so durchsuchen möchte, wie es auf der Platte existiert.

Der trade-off ist, dass rg nicht weiß, wie es v2.3.0 oder HEAD~20 durchsuchen soll, außer du checkst diesen tree irgendwo aus. Git history ist nicht seine Welt.

Meine Faustregel lautet also:

Verwende git grep für tracked code und Git objects: branches, tags, commits, staged content.

[reflective] Verwende rg für das live filesystem: untracked files, non-Git directories, ignored-file experiments und breite project search.

Es gibt keinen Preis dafür, nur eines zu wählen. Nimm beide in die Hand.

Kompakter Spickzettel.

Die langweilige Kraft von git grep ist, dass es mit dem Projekt beginnt, wie Git es versteht. Genau das willst du öfter, als du denkst: nicht jede Datei auf der Platte, nicht jedes build artifact, nicht jedes lokale Experiment — nur den Code, der zum repository gehört, plus jede ältere Version dieses Codes, die du benennen kannst.
