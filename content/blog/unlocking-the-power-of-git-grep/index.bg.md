---
lang: "bg"
translationOf: "unlocking-the-power-of-git-grep"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "203041318333bf65"
title: "git grep рецепти: търсене в проследения код, без да претърсваш цялата файлова система"
date: "2024-11-13"
description: "Практична git grep шпаргалка за търсене в проследени файлове, branches, tags, staged промени и стари commits, с .gitignore особености и кога вместо това да използваш ripgrep."
tags: ["git", "git grep", "ripgrep", "търсене в код", "инструменти за разработчици", "софтуерна разработка", "инструменти за команден ред"]
featuredImage: "./images/featured.jpg"
imageCaption: "Отворено чекмедже от библиотечен картотечен шкаф. Една карта стърчи леко напред - пасажът, който търсеше."
audioUrl: "/audio/articles/unlocking-the-power-of-git-grep/bg/5egO01tkUjEzu7xSSE8M-60935e2faceb.m4a"
audioDuration: "16:21"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/unlocking-the-power-of-git-grep.bg.md"
---

Повечето съвети за търсене в код започват със скоростта. Скоростта има значение, но истинската причина да посягам към `git grep` е по-проста:

**Той търси в кода, за който Git знае, не в цялата файлова система.**

Това означава, че търсенето ти не се разхожда из `node_modules`, `.cache`, `dist`, coverage reports, локални dumps, screenshots или каквото и да е временно нещо, което си създал в странен следобед на debugging. По подразбиране `git grep` започва от проследените пътища в твоя Git working tree. Само това ограничение прави резултатите по-спокойни.

Това не е аргумент против `rg` / ripgrep. Използвам `rg` постоянно. Но двата инструмента отговарят на различни въпроси:

- `git grep`: "Къде е това в проследения код, или в друг branch, tag, или commit?"
- `rg`: "Къде е това на диска, според моите ignore rules?"

Когато тази разлика щракне, `git grep` спира да бъде стара команда, за която смътно знаеш, че съществува, и става много остър малък навик.

## Менталният модел

Полезната форма на командата е:

```bash
git grep [options] <pattern> [<tree-ish>...] [-- <pathspec>...]
```

На прост език:

- `<pattern>` е това, което търсиш.
- `<tree-ish>` е по избор: branch, tag, commit или друго Git tree, в което да търсиш.
- `<pathspec>` е по избор: файловете или директориите, до които да ограничиш търсенето.
- `--` отделя revisions от paths, когато има шанс за двусмислие.

По подразбиране `git grep` търси в проследените файлове в working tree-то ти. Не е магически content index. Не чете всеки файл под текущата директория. Пита Git кои пътища принадлежат на проекта и после търси в тях.

Затова се усеща подредено.

## Рецепти

### 1. Търси в проследения код и показвай номера на редове

```bash
git grep -n "initializeSettings"
```

Това е ежедневната версия. `-n` отпечатва номера на редове, което прави output-а полезен в terminal, PR comment или бърза handoff бележка.

Ако винаги искаш номера на редове, Git поддържа config за това:

```bash
git config --global grep.lineNumber true
```

Аз пак обикновено пиша `-n`, защото е видимо и преносимо в snippets.

### 2. Търси буквален string, не regex

```bash
git grep -n -F "useEffect(" -- "*.js" "*.jsx" "*.ts" "*.tsx"
```

Използвай `-F`, когато pattern-ът е фиксиран string. Скоби, точки, квадратни скоби и други regex-подобни символи се третират като обикновен текст.

Тук две малки навици имат значение:

- Слагай file globs след `--`.
- Quote-вай globs, за да не ги expand-не shell-ът, преди Git да ги види.

Това е версията, която искам, когато знам точния function call, config key, class name или error message.

### 3. Търси case-insensitively, като whole word, с columns

```bash
git grep -n -i -w --column "customer"
```

`-i` игнорира главни и малки букви. `-w` търси whole-word matches. `--column` отпечатва номера на колоната на първото съвпадение в реда.

Това е приятно, когато терминът е достатъчно често срещан, че суровият output става шумен. Полезно е и когато подаваш резултатите към editor integrations или quickfix lists.

### 4. Търси pattern, който започва с dash

```bash
git grep -n -e "--force"
```

Без `-e`, Git може да прочете pattern-а като още една command-line option. `-e` казва "следващото нещо е search pattern." Това е един от онези дребни flags, които не ти трябват често, но когато ти потрябват, наистина ти трябват.

Можеш да подадеш и повече от един `-e`:

```bash
git grep -n -e "oldBillingFlow" -e "legacyCheckout"
```

Това търси който и да е от двата pattern-а.

### 5. Използвай regex, когато структурата има значение

```bash
git grep -n -E "def[[:space:]]+[[:alnum:]_]+\\(" -- "*.py"
```

`-E` включва extended regular expressions. Този пример търси Python function definitions, без да се преструва на parser.

За по-големи структурни въпроси използвай езиковите инструменти. `git grep` е отличен за намиране на кандидати; не е AST engine, и тази честност е част от причината да го харесвам.

### 6. Ограничи търсенето до path

```bash
git grep -n "FeatureFlag" -- src components
```

Pathspec-овете след `--` държат търсенето фокусирано. Това често е по-бързо умствено, не само computationally. Казваш на командата какъв вид отговор те интересува.

Можеш също да изключваш paths:

```bash
git grep -n "logger" -- src ":(exclude)src/generated" ":(exclude)*.snap"
```

Git pathspecs са мощни и малко странни. Важното практическо правило е, че path filters стоят след `--`, а exclusion pathspecs като `:(exclude)...` се обработват от Git, не от shell-а.

### 7. Покажи само файловете със съвпадения

```bash
git grep -l "useOldCheckout"
```

`-l` отпечатва file names вместо matching lines. Използвай го, когато следващата стъпка е "отвори файловете" или "прецени blast radius", не "прочети всяко съвпадение."

Има и обратната версия:

```bash
git grep -L "use client" -- "src/**/*.tsx"
```

`-L` изброява проследените файлове, които **не** съдържат pattern-а. Това може да е изненадващо удобно по време на framework migrations.

### 8. Преброй съвпаденията по файл

```bash
git grep -c "TODO"
```

`-c` ти дава бърза heat map. Не е code-quality metric; моля те, не го превръщай в такава. Но е полезно, за да видиш в кои файлове един термин е концентриран, преди да започнеш да редактираш.

### 9. Търси staged версията вместо working tree-то

```bash
git grep -n --cached "newConfigKey"
```

По подразбиране `git grep` търси проследените paths в working tree-то. `--cached` търси blobs в index-а - staged версията.

Това е полезно в pre-commit checks, review scripts или всеки момент, в който искаш да попиташ "Какво точно съм staged-нал?", вместо "Какво е на диска в момента?"

### 10. Търси untracked files, като имаш предвид ignore rules

```bash
git grep -n --untracked "draftFlag"
```

`--untracked` добавя untracked files към търсенето. В този режим стандартните ignore rules на Git се зачитат, така че ignored files пак остават извън резултата.

Ако наистина искаш и ignored files:

```bash
git grep -n --untracked --no-exclude-standard "draftFlag"
```

Това е съзнателен ход. Използвам го, когато подозирам, че generated file, local fixture или ignored artifact съдържа нещото, което гоня.

### 11. Търси в друг branch, tag или стар commit, без checkout

```bash
git grep -n "validateUser" main
git grep -n "validateUser" v2.3.0
git grep -n "validateUser" HEAD~20 -- src
```

Това е killer feature-ът.

Без checkout. Без stash. Без worktree отбивка. Можеш да зададеш директен въпрос на branch, tag или стар commit и да останеш точно там, където си.

Когато bug report казва "това работеше в последния release", обикновено започвам оттук.

### 12. Търси във всеки commit само когато наистина го имаш предвид

```bash
git rev-list --all | xargs -n 50 git grep -n "validateUser"
```

Това търси commit trees в цялата история на batches. Може да бъде шумно, повтарящо се и скъпо за сериозно repository, защото едно и също file content може да присъства в много commits.

През повечето време, ако истинският ти въпрос е "кога този string се появи или изчезна?", `git log` е по-добрият companion:

```bash
git log -S "validateUser" --oneline -- src
git log -G "validate(User|Account)" -p -- src
```

`-S` е за промени в броя occurrences на даден string. `-G` е за diffs, чиито added или removed lines match-ват regex. Различен въпрос, различен инструмент.

## `.gitignore` особеността

Изречението "`git grep` respects `.gitignore`" е достатъчно близо до истината, за да е изкушаващо, и достатъчно грешно, за да те ухапе.

По подразбиране `git grep` търси проследени файлове. `.gitignore` файлът е за това untracked файловете да останат untracked. Файлове, които вече са tracked от Git, не стават невидими само защото по-късно ignore rule ги match-ва.

Затова точната версия е:

- По подразбиране `git grep` търси tracked paths в working tree-то.
- Ignored-but-untracked files не се търсят, защото untracked files не се търсят.
- Ignored-but-tracked files **се** търсят, защото са tracked.
- `--untracked` добавя untracked files, като пак зачита standard ignore rules.
- `--untracked --no-exclude-standard` включва и ignored files.
- `--no-index` превръща `git grep` във filesystem search от текущата директория, дори извън repo.
- `--no-index --exclude-standard` кара това filesystem search да зачита standard ignore rules на Git.

Edge case-ът има значение в стари repositories. Един файл може първо да е committed и чак по-късно ignored. Ако ловиш string и `git grep` го намери в уж ignored file, Git не е объркан. Файлът е tracked.

## Кога `rg` е по-добрият инструмент

Използвай ripgrep, когато искаш filesystem semantics.

```bash
rg "validateUser"
rg -S "validateUser"
rg --hidden "validateUser"
rg --no-ignore "validateUser"
```

`rg` обхожда directory tree-то. По подразбиране зачита `.gitignore`, `.ignore`, `.rgignore`, global ignore files, hidden-file rules и binary-file skipping. Много е бърз, много полиран и обикновено е това, което искам, когато търся working directory-то такова, каквото е на диска.

Trade-off-ът е, че `rg` не знае как да търси във `v2.3.0` или `HEAD~20`, освен ако не checkout-неш това tree някъде. Git history не е неговият свят.

Така че моето правило е:

- Използвай `git grep` за tracked code и Git objects: branches, tags, commits, staged content.
- Използвай `rg` за live filesystem: untracked files, non-Git directories, ignored-file experiments и широк project search.

Няма награда за това да избереш само едното. Дръж и двете в ръцете си.

## Компактна шпаргалка

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

Скучната сила на `git grep` е, че започва от проекта така, както Git го разбира. Точно това искаш по-често, отколкото си мислиш: не всеки файл на диска, не всеки build artifact, не всеки локален експеримент - само кодът, който принадлежи на repository-то, плюс всяка по-стара версия на този код, която можеш да назовеш.
