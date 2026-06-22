---
lang: "de"
translationOf: "unlocking-the-power-of-git-grep"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "203041318333bf65"
title: "git grep Rezepte: getrackten Code durchsuchen, ohne das ganze Dateisystem zu durchsuchen"
date: "2024-11-13"
description: "Ein praktischer git grep Spickzettel für die Suche in getrackten Dateien, Branches, Tags, staged Änderungen und alten Commits, mit .gitignore-Fallen und wann stattdessen ripgrep passt."
tags: ["git", "git grep", "ripgrep", "Codesuche", "Entwicklerwerkzeuge", "Softwareentwicklung", "Kommandozeilenwerkzeuge"]
featuredImage: "./images/featured.jpg"
imageCaption: "Eine geöffnete Schublade eines Bibliothekskatalogs. Eine Karte steht ein wenig hervor - die Passage, nach der du gesucht hast."
---

Die meisten Ratschläge zur Codesuche beginnen mit Geschwindigkeit. Geschwindigkeit zählt, aber der eigentliche Grund, warum ich zu `git grep` greife, ist einfacher:

**Es durchsucht den Code, von dem Git weiß, nicht das ganze Dateisystem.**

Das bedeutet, deine Suche wandert nicht in `node_modules`, `.cache`, `dist`, Coverage-Reports, lokale Dumps, Screenshots oder irgendein temporäres Ding, das du während eines merkwürdigen Debugging-Nachmittags erstellt hast. Standardmäßig beginnt `git grep` bei den getrackten Pfaden in deinem Git working tree. Allein diese Einschränkung macht die Ergebnisse ruhiger.

Das ist kein Argument gegen `rg` / ripgrep. Ich benutze `rg` ständig. Aber die beiden Werkzeuge beantworten verschiedene Fragen:

- `git grep`: "Wo ist das im getrackten Code, oder in einem anderen Branch, Tag oder Commit?"
- `rg`: "Wo ist das auf der Platte, unter Beachtung meiner Ignore-Regeln?"

Wenn diese Unterscheidung einmal klickt, hört `git grep` auf, ein alter Befehl zu sein, von dem man vage weiß, dass er existiert, und wird zu einer sehr scharfen kleinen Gewohnheit.

## Das mentale Modell

Die nützliche Form des Befehls lautet:

```bash
git grep [options] <pattern> [<tree-ish>...] [-- <pathspec>...]
```

In normaler Sprache:

- `<pattern>` ist das, wonach du suchst.
- `<tree-ish>` ist optional: ein Branch, Tag, Commit oder ein anderer Git tree, den du durchsuchen willst.
- `<pathspec>` ist optional: die Dateien oder Verzeichnisse, auf die du die Suche begrenzen willst.
- `--` trennt revisions von paths, wenn es irgendeine Möglichkeit von Mehrdeutigkeit gibt.

Standardmäßig durchsucht `git grep` getrackte Dateien in deinem working tree. Es ist kein magischer Content-Index. Es liest nicht jede Datei unter dem aktuellen Verzeichnis. Es fragt Git, welche Pfade zum Projekt gehören, und durchsucht dann diese Pfade.

Deshalb fühlt es sich aufgeräumt an.

## Rezepte

### 1. Getrackten Code durchsuchen und Zeilennummern anzeigen

```bash
git grep -n "initializeSettings"
```

Das ist die Alltagsversion. `-n` gibt Zeilennummern aus, wodurch die Ausgabe in einem Terminal, einem PR-Kommentar oder einer schnellen Handoff-Notiz nützlich wird.

Wenn du immer Zeilennummern möchtest, unterstützt Git dafür eine config:

```bash
git config --global grep.lineNumber true
```

Ich tippe trotzdem meist `-n`, weil es in snippets sichtbar und portabel ist.

### 2. Einen literalen String suchen, keine Regex

```bash
git grep -n -F "useEffect(" -- "*.js" "*.jsx" "*.ts" "*.tsx"
```

Verwende `-F`, wenn das pattern ein fester String ist. Klammern, Punkte, eckige Klammern und andere regex-artige Zeichen werden als gewöhnlicher Text behandelt.

Zwei kleine Gewohnheiten sind hier wichtig:

- Setze file globs hinter `--`.
- Quote die globs, damit deine Shell sie nicht expandiert, bevor Git sie sieht.

Das ist die Version, die ich möchte, wenn ich den exakten function call, config key, class name oder error message kenne.

### 3. Case-insensitive, als ganzes Wort, mit Spalten suchen

```bash
git grep -n -i -w --column "customer"
```

`-i` ignoriert Groß-/Kleinschreibung. `-w` fragt nach whole-word matches. `--column` gibt die Spaltennummer des ersten Treffers in der Zeile aus.

Das ist angenehm, wenn der Begriff so häufig ist, dass rohe Ausgabe laut wird. Es ist auch nützlich, wenn du Ergebnisse an editor integrations oder quickfix lists weitergibst.

### 4. Nach einem pattern suchen, das mit einem Dash beginnt

```bash
git grep -n -e "--force"
```

Ohne `-e` könnte Git das pattern als weitere Kommandozeilenoption lesen. `-e` sagt: "Das nächste Ding ist ein search pattern." Es ist eines dieser winzigen Flags, die man nicht oft braucht, aber wenn man es braucht, braucht man es wirklich.

Du kannst auch mehr als ein `-e` übergeben:

```bash
git grep -n -e "oldBillingFlow" -e "legacyCheckout"
```

Das sucht nach einem der beiden patterns.

### 5. Eine Regex verwenden, wenn Struktur zählt

```bash
git grep -n -E "def[[:space:]]+[[:alnum:]_]+\\(" -- "*.py"
```

`-E` aktiviert extended regular expressions. Dieses Beispiel sucht Python-Funktionsdefinitionen, ohne so zu tun, als wäre es ein Parser.

Für größere strukturelle Fragen solltest du die Sprachwerkzeuge benutzen. `git grep` ist hervorragend darin, Kandidaten zu finden; es ist kein AST engine, und diese Ehrlichkeit ist ein Teil davon, warum ich es mag.

### 6. Die Suche auf einen path begrenzen

```bash
git grep -n "FeatureFlag" -- src components
```

Die pathspecs nach `--` halten die Suche fokussiert. Das ist oft mental schneller, nicht nur rechnerisch. Du sagst dem Befehl, welche Art Antwort dir wichtig ist.

Du kannst auch paths ausschließen:

```bash
git grep -n "logger" -- src ":(exclude)src/generated" ":(exclude)*.snap"
```

Git pathspecs sind mächtig und ein wenig seltsam. Die wichtige praktische Regel ist, dass path filters hinter `--` stehen und exclusion pathspecs wie `:(exclude)...` von Git verarbeitet werden, nicht von der Shell.

### 7. Nur passende Dateien auflisten

```bash
git grep -l "useOldCheckout"
```

`-l` gibt Dateinamen statt passender Zeilen aus. Verwende es, wenn der nächste Schritt "Dateien öffnen" oder "blast radius zählen" lautet, nicht "jeden match lesen".

Das Gegenteil gibt es auch:

```bash
git grep -L "use client" -- "src/**/*.tsx"
```

`-L` listet getrackte Dateien auf, die das pattern **nicht** enthalten. Das kann während Framework-Migrationen überraschend praktisch sein.

### 8. Treffer pro Datei zählen

```bash
git grep -c "TODO"
```

`-c` gibt dir eine schnelle Heatmap. Es ist keine Codequalitätsmetrik; bitte mach keine daraus. Aber es ist nützlich, um die Dateien zu erkennen, in denen ein Begriff konzentriert ist, bevor du mit dem Editieren beginnst.

### 9. Die staged Version statt des working tree durchsuchen

```bash
git grep -n --cached "newConfigKey"
```

Standardmäßig durchsucht `git grep` getrackte Pfade im working tree. `--cached` durchsucht die blobs im Index - die staged Version.

Das ist nützlich in pre-commit checks, review scripts oder jedem Moment, in dem du fragen willst: "Was genau habe ich staged?", statt "Was liegt gerade auf der Platte?"

### 10. Untracked files durchsuchen, mit Ignore-Regeln im Hinterkopf

```bash
git grep -n --untracked "draftFlag"
```

`--untracked` fügt untracked files zur Suche hinzu. In diesem Modus werden die Standard-Ignore-Regeln von Git beachtet, also bleiben ignored files weiterhin aus dem Ergebnis heraus.

Wenn du wirklich auch ignored files willst:

```bash
git grep -n --untracked --no-exclude-standard "draftFlag"
```

Das ist ein bewusster Schritt. Ich benutze ihn, wenn ich vermute, dass eine generated file, lokale fixture oder ein ignored artifact das enthält, wonach ich jage.

### 11. Einen anderen Branch, Tag oder alten Commit ohne checkout durchsuchen

```bash
git grep -n "validateUser" main
git grep -n "validateUser" v2.3.0
git grep -n "validateUser" HEAD~20 -- src
```

Das ist die killer feature.

Kein checkout. Kein stash. Kein Worktree-Umweg. Du kannst einem Branch, Tag oder alten Commit eine direkte Frage stellen und genau dort bleiben, wo du bist.

Wenn ein bug report sagt: "Das hat im letzten Release funktioniert", fange ich meist hier an.

### 12. Jeden Commit nur durchsuchen, wenn du es wirklich meinst

```bash
git rev-list --all | xargs -n 50 git grep -n "validateUser"
```

Das durchsucht commit trees über die ganze History hinweg in Batches. Auf einem ernsthaften Repository kann das laut, repetitiv und teuer sein, weil derselbe file content in vielen Commits auftauchen kann.

Meistens ist `git log` der bessere companion, wenn deine eigentliche Frage lautet: "Wann ist dieser String aufgetaucht oder verschwunden?"

```bash
git log -S "validateUser" --oneline -- src
git log -G "validate(User|Account)" -p -- src
```

`-S` ist für Änderungen in der Anzahl der occurrences eines Strings. `-G` ist für diffs, deren hinzugefügte oder entfernte Zeilen eine Regex matchen. Andere Frage, anderes Werkzeug.

## Die `.gitignore`-Falle

Der Satz "`git grep` respects `.gitignore`" ist nah genug dran, um verführerisch zu sein, und falsch genug, um dich zu beißen.

Standardmäßig durchsucht `git grep` getrackte Dateien. Eine `.gitignore`-Datei dient dazu, untracked files untracked zu halten. Dateien, die bereits von Git getrackt werden, werden nicht unsichtbar, nur weil eine spätere Ignore-Regel auf sie passt.

Die genaue Version lautet also:

- Standardmäßig durchsucht `git grep` tracked paths im working tree.
- Ignored-but-untracked files werden nicht durchsucht, weil untracked files nicht durchsucht werden.
- Ignored-but-tracked files **werden** durchsucht, weil sie tracked sind.
- `--untracked` fügt untracked files hinzu und beachtet weiterhin standard ignore rules.
- `--untracked --no-exclude-standard` schließt auch ignored files ein.
- `--no-index` verwandelt `git grep` in eine Dateisystemsuche vom aktuellen Verzeichnis aus, sogar außerhalb eines Repos.
- `--no-index --exclude-standard` sorgt dafür, dass diese Dateisystemsuche die standard ignore rules von Git beachtet.

Der Randfall zählt in alten repositories. Eine Datei kann zuerst committed und später ignoriert worden sein. Wenn du einen String suchst und `git grep` ihn in einer angeblich ignored file findet, ist Git nicht verwirrt. Die Datei ist tracked.

## Wann `rg` das bessere Werkzeug ist

Verwende ripgrep, wenn du Dateisystem-semantics willst.

```bash
rg "validateUser"
rg -S "validateUser"
rg --hidden "validateUser"
rg --no-ignore "validateUser"
```

`rg` läuft durch den directory tree. Standardmäßig respektiert es `.gitignore`, `.ignore`, `.rgignore`, globale Ignore-Dateien, hidden-file rules und binary-file skipping. Es ist sehr schnell, sehr ausgereift und normalerweise das, was ich will, wenn ich das working directory so durchsuchen möchte, wie es auf der Platte existiert.

Der trade-off ist, dass `rg` nicht weiß, wie es `v2.3.0` oder `HEAD~20` durchsuchen soll, außer du checkst diesen tree irgendwo aus. Git history ist nicht seine Welt.

Meine Faustregel lautet also:

- Verwende `git grep` für tracked code und Git objects: branches, tags, commits, staged content.
- Verwende `rg` für das live filesystem: untracked files, non-Git directories, ignored-file experiments und breite project search.

Es gibt keinen Preis dafür, nur eines zu wählen. Nimm beide in die Hand.

## Kompakter Spickzettel

```bash
git grep -n "term"                         # tracked files, with line numbers
git grep -n -F "literal(" -- "*.ts"        # fixed string in TypeScript files
git grep -n -i -w --column "term"          # case-insensitive whole-word search
git grep -n -e "--flag"                    # pattern begins with a dash
git grep -n -E "regex" -- src              # extended regex, limited to src
git grep -l "term"                         # matching file names only
git grep -L "term" -- "*.tsx"              # files that do not contain term
git grep -c "term"                         # match count per file
git grep -n --cached "term"                # staged/index version
git grep -n --untracked "term"             # tracked plus untracked, honoring ignores
git grep -n "term" v1.2.3 -- src           # search a tag without checkout
git log -S "term" --oneline -- src         # find commits that changed occurrence count
```

Die langweilige Kraft von `git grep` ist, dass es mit dem Projekt beginnt, wie Git es versteht. Genau das willst du öfter, als du denkst: nicht jede Datei auf der Platte, nicht jedes build artifact, nicht jedes lokale Experiment - nur den Code, der zum repository gehört, plus jede ältere Version dieses Codes, die du benennen kannst.
