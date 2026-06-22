git grep рецепти: търсене в проследения код, без да претърсваш цялата файлова система

[conversational tone] Повечето съвети за търсене в код започват със скоростта. Скоростта има значение, но истинската причина да посягам към git grep е по-проста:

Той търси в кода, за който Git знае, не в цялата файлова система.

Това означава, че търсенето ти не се разхожда из node underscore modules, dot cache, dist, coverage reports, локални dumps, screenshots или каквото и да е временно нещо, което си създал в странен следобед на debugging. По подразбиране git grep започва от проследените пътища в твоя Git working tree. Само това ограничение прави резултатите по-спокойни.

Това не е аргумент против rg, или ripgrep. Използвам rg постоянно. Но двата инструмента отговарят на различни въпроси.

Git grep пита: къде е това в проследения код, или в друг branch, tag, или commit?

Ripgrep пита: къде е това на диска, според моите ignore rules?

Когато тази разлика щракне, git grep спира да бъде стара команда, за която смътно знаеш, че съществува, и става много остър малък навик.

[matter-of-fact] Менталният модел е малък. Полезната форма е: git grep, после options, после pattern-ът, после незадължителни tree-ish стойности, после double dash и незадължителни pathspecs.

Pattern-ът е това, което търсиш.

Tree-ish е по избор: branch, tag, commit или друго Git tree, в което да търсиш.

Pathspec е по избор: файловете или директориите, до които да ограничиш търсенето.

Double dash отделя revisions от paths, когато има шанс за двусмислие.

По подразбиране git grep търси в проследените файлове в working tree-то ти. Не е магически content index. Не чете всеки файл под текущата директория. Пита Git кои пътища принадлежат на проекта и после търси в тях.

Затова се усеща подредено.

[deliberate] Първа рецепта: търси в проследения код и показвай номера на редове.

Пусни git grep минус n initializeSettings.

Флагът минус n отпечатва номера на редове. Това прави output-а полезен в terminal, PR comment или бърза handoff бележка. Git може да се настрои да показва номера на редове по подразбиране, но аз пак обикновено пиша минус n, защото е видимо и преносимо в snippets.

Втора рецепта: търси буквален string, не regular expression.

Използвай минус главно F, когато pattern-ът е фиксиран string. Например, ако търсиш useEffect, отваряща скоба, в JavaScript и TypeScript файлове, комбинираш git grep минус n, минус главно F, буквалния текст, после double dash и quote-нати file globs.

Важният навик е този: слагай file globs след double dash и ги quote-вай, за да не ги expand-не shell-ът, преди Git да ги види.

Това е версията, която искам, когато знам точния function call, config key, class name или error message.

Трета рецепта: търси case-insensitively, като whole word, с columns.

Пусни git grep минус n, минус i, минус w, double dash column, customer.

Минус i игнорира главни и малки букви. Минус w търси whole-word matches. Double dash column отпечатва номера на колоната на първото съвпадение в реда. Това е приятно, когато терминът е достатъчно често срещан, че суровият output става шумен.

Четвърта рецепта: търси pattern, който започва с dash.

Пусни git grep минус n, минус e, double dash force.

Без минус e, Git може да прочете pattern-а като още една command-line option. Минус e казва: следващото нещо е search pattern. Това е един от онези дребни flags, които не ти трябват често, но когато ти потрябват, наистина ти трябват.

Можеш да подадеш и повече от един минус e. Така търсене за oldBillingFlow и legacyCheckout намира който и да е от двата pattern-а.

[matter-of-fact] Пета рецепта: използвай regular expression, когато структурата има значение.

Минус главно E включва extended regular expressions. Практичен пример е pattern, който означава: def, после whitespace, после име на функция, после отваряща скоба.

За по-големи структурни въпроси използвай езиковите инструменти. Git grep е отличен за намиране на кандидати. Не е abstract syntax tree engine, и тази честност е част от причината да го харесвам.

Шеста рецепта: ограничи търсенето до path.

Пусни git grep минус n FeatureFlag, double dash, src, components.

Pathspec-овете след double dash държат търсенето фокусирано. Това често е по-бързо умствено, не само computationally. Казваш на командата какъв вид отговор те интересува.

Можеш също да изключваш paths с Git exclude pathspec. Важното практическо правило е, че path filters стоят след double dash, а exclusion pathspecs се обработват от Git, не от shell-а.

Седма рецепта: покажи само файловете със съвпадения.

Използвай минус l, когато следващата стъпка е отвори файловете, или прецени blast radius, не прочети всяко съвпадение.

Обратната версия е минус главно L. Тя изброява проследените файлове, които не съдържат pattern-а. Това може да е изненадващо удобно по време на framework migrations.

Осма рецепта: преброй съвпаденията по файл.

Използвай минус c за бърза heat map. Не е code-quality metric; моля те, не го превръщай в такава. Но е полезно, за да видиш в кои файлове един термин е концентриран, преди да започнеш да редактираш.

[deliberate] Девета рецепта: търси staged версията вместо working tree-то.

Пусни git grep минус n, double dash cached, newConfigKey.

По подразбиране git grep търси проследените paths в working tree-то. Double dash cached търси blobs в index-а: staged версията.

Това е полезно в pre-commit checks, review scripts или всеки момент, в който искаш да попиташ: какво точно съм staged-нал, вместо какво е на диска в момента?

Десета рецепта: търси untracked files, като имаш предвид ignore rules.

Пусни git grep минус n, double dash untracked, draftFlag.

Double dash untracked добавя untracked files към търсенето. В този режим стандартните ignore rules на Git се зачитат, така че ignored files пак остават извън резултата.

Ако наистина искаш и ignored files, добави double dash no exclude standard. Това е съзнателен ход. Използвам го, когато подозирам, че generated file, local fixture или ignored artifact съдържа нещото, което гоня.

Единадесета рецепта: търси в друг branch, tag или стар commit, без checkout.

Пусни git grep минус n validateUser main.

Или го пусни срещу версия две точка три точка нула.

Или го пусни срещу H E A D тилда двадесет, ограничено до src.

Това е killer feature-ът.

Без checkout. Без stash. Без worktree отбивка. Можеш да зададеш директен въпрос на branch, tag или стар commit и да останеш точно там, където си.

Когато bug report казва, това работеше в последния release, обикновено започвам оттук.

Дванадесета рецепта: търси във всеки commit само когато наистина го имаш предвид.

Грубата форма е: git rev-list double dash all, pipe към xargs минус n петдесет, после git grep минус n validateUser.

Това търси commit trees в цялата история на batches. Може да бъде шумно, повтарящо се и скъпо за сериозно repository, защото едно и също file content може да присъства в много commits.

През повечето време, ако истинският ти въпрос е кога този string се появи или изчезна, git log е по-добрият companion.

Използвай git log минус главно S, когато те интересуват промени в броя occurrences на даден string.

Използвай git log минус главно G, с минус p, когато те интересуват diffs, чиито added или removed lines match-ват regular expression.

Различен въпрос, различен инструмент.

[calm] Сега, dot gitignore особеността.

Изречението, git grep respects dot gitignore, е достатъчно близо до истината, за да е изкушаващо, и достатъчно грешно, за да те ухапе.

По подразбиране git grep търси проследени файлове. Dot gitignore файлът е за това untracked файловете да останат untracked. Файлове, които вече са tracked от Git, не стават невидими само защото по-късно ignore rule ги match-ва.

Затова точната версия е тази:

По подразбиране git grep търси tracked paths в working tree-то.

Ignored-but-untracked files не се търсят, защото untracked files не се търсят.

Ignored-but-tracked files се търсят, защото са tracked.

Double dash untracked добавя untracked files, като пак зачита standard ignore rules.

Double dash untracked плюс double dash no exclude standard включва и ignored files.

Double dash no index превръща git grep във filesystem search от текущата директория, дори извън repository.

Double dash no index плюс double dash exclude standard кара това filesystem search да зачита standard ignore rules на Git.

Edge case-ът има значение в стари repositories. Един файл може първо да е committed и чак по-късно ignored. Ако ловиш string и git grep го намери в уж ignored file, Git не е объркан. Файлът е tracked.

[conversational tone] Кога rg е по-добрият инструмент?

Използвай ripgrep, когато искаш filesystem semantics.

Пусни rg validateUser за нормалното търсене. Добави главно S за smart case. Добави double dash hidden, когато искаш и dotfiles. Добави double dash no ignore, когато искаш и ignored files.

Ripgrep обхожда directory tree-то. По подразбиране зачита dot gitignore, dot ignore, dot rgignore, global ignore files, hidden-file rules и binary-file skipping. Много е бърз, много полиран и обикновено е това, което искам, когато търся working directory-то такова, каквото е на диска.

Trade-off-ът е, че rg не знае как да търси във версия две точка три точка нула или H E A D тилда двадесет, освен ако не checkout-неш това tree някъде. Git history не е неговият свят.

Така че моето правило е просто.

Използвай git grep за tracked code и Git objects: branches, tags, commits, staged content.

Използвай rg за live filesystem: untracked files, non-Git directories, ignored-file experiments и широк project search.

Няма награда за това да избереш само едното. Дръж и двете в ръцете си.

[matter-of-fact] Компактната версия:

Използвай git grep минус n за tracked files с номера на редове.

Използвай минус главно F за буквални strings.

Използвай минус i, минус w и double dash column, когато ти трябват case-insensitive whole-word matches с columns.

Използвай минус e, когато search pattern-ът започва с dash.

Използвай минус главно E за extended regular expression.

Използвай минус l за file names със съвпадения, и минус главно L за файлове, които не съдържат термина.

Използвай минус c за counts.

Използвай double dash cached за staged версията.

Използвай double dash untracked, когато untracked files имат значение.

Назови branch, tag или commit, когато искаш да търсиш по-старо Git tree без checkout.

И използвай git log минус главно S, когато истинският въпрос не е къде е този string, а кога се е променил броят му.

[reflective] Скучната сила на git grep е, че започва от проекта така, както Git го разбира.

Точно това искаш по-често, отколкото си мислиш: не всеки файл на диска, не всеки build artifact, не всеки локален експеримент. Само кодът, който принадлежи на repository-то, плюс всяка по-стара версия на този код, която можеш да назовеш.

Използвай git grep, когато въпросът е: къде в този codebase, включително в историята му?

Използвай ripgrep, когато въпросът е: къде на диска, според моите ignore rules?

През повечето дни ще искаш и двете на една ръка разстояние.
