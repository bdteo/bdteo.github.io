[conversational tone] Какво е добро покритие на кода? Наръчник, основан на риска.

Доброто покритие на кода не е осемдесет процента. Не е деветдесет процента. Не е святото сияние на dashboard, който казва сто процента.

Доброто покритие на кода означава това: частите от системата, които биха болели най-много, ако се счупят, са покрити от тестове, които наистина биха се провалили, когато тези части са грешни.

Това е целият трик. Процентът е полезен, но чак след като знаеш какъв код гледаш, колко често се променя, кого ще боли от бъг и дали тестовете ти правят реални assertions, или просто се разхождат през кода с фенер.

[reflective] Все още гледам числото. Харесвам числа. Те са добри в това да правят смътната тревога видима. Но вече не питам "осемдесет и два процента добре ли е?" изолирано. Питам по-добър въпрос: какъв риск все още е непокрит и удобно ли ни е да го пуснем така?

Този въпрос работи за инженери, които пишат тестове, за leads, които задават quality bar, и за reviewers, които решават дали един P R е безопасен за merge.

[matter-of-fact] Краткият отговор е този.

За core domain rules, пари, permissions, security и пътища към загуба на данни, целта е деветдесет до сто процента смислено line и branch coverage. Малък бъг там може да стане скъп, срамен или необратим.

За public libraries, S D K пакети и reusable packages, целта е деветдесет процента или повече, плюс edge cases и compatibility tests. Потребителите ти не могат да инспектират намерението ти. A P I-то е продуктът.

За нормален SaaS application code, седемдесет до осемдесет и пет процента overall може да е здравословно, с по-високо покритие върху рискови modules. Повечето екипи получават силна стойност тук, без да превръщат тестовете в театър.

За legacy systems под петдесет процента, не гони първо global number. Покрий променения код и опасните flows, преди да се опитваш да поправиш dashboard-а.

А за generated code, framework glue, debug logging и trivial wrappers, изключване или леко smoke testing често е напълно наред. Покритието там може да е шумно и скъпо, без да намалява много риск.

Това не са религиозни числа. Това са defaults, за които бих очаквал екип да спори.

Насоките на Google за тестване казват, че няма универсално идеално число, и поставят покритието в контекста на business impact, change frequency, expected lifetime, complexity и domain risk. Martin Fowler прави същата по-дълбока точка от друг ъгъл: покритието помага да намериш нетестуван код, но е лошо standalone твърдение за качеството на тестовете.

[deliberate] Това съвпада с моя опит. Ниското покритие е smoke alarm. Високото покритие не е гаранция.

Покритието е най-добро в показването на отсъствие.

То може да ти каже, че даден файл никога не се упражнява от автоматизирани тестове. Че даден error branch никога не е минавал в C I. Че ново payment rule е merged без тест да го докосне. Че refactor е изтрил behavior, което нито един тест не е забелязал. Че repository има цели квартали, където бъговете могат да живеят без наем.

Това вече е ценно. Статията на Google за code coverage в Google установява, че покритието е най-actionable, когато се показва на ниво changesets и code review. Харесвам тази рамка: покритието принадлежи близо до diff-а, където човек може да попита: "има ли значение този непокрит ред?"

Покритието е по-малко полезно като executive health score. Мениджър, който вижда осемдесет и осем процента, не може да разбере дали липсващите дванадесет процента са неизползван debug output, или refund path-ът, който решава дали клиентите ще си получат парите обратно.

[matter-of-fact] Покрит ред не е непременно тествано behavior.

Покритието не може да докаже, че assertions са смислени. Не може да докаже, че test data прилича на production. Не може да докаже, че unhappy path е проверен, не просто изпълнен. Не може да докаже, че U I е използваем, query-то е достатъчно бързо, feature flag е конфигуриран правилно, concurrent case работи, mocks са честни или кодът е достатъчно прост за поддръжка.

Можеш да получиш сто процента line coverage с тестове, които викат функции и почти нищо не assert-ват. Можеш също да получиш високо покритие от end-to-end tests, които случайно минават през много код, докато почти не проверяват важните решения.

Затова coverage gate никога не трябва да бъде единственият quality gate. Комбинирай го с review, production incidents, property или fuzz tests там, където пасват, contract tests около integrations и mutation testing върху код, при който correctness наистина има значение.

[conversational tone] Когато review-вам P R, не искам тестове, защото "ни трябва coverage." Искам ги, защото някакво behavior се е променило и искам доказателство, че behavior-ът е защитен.

Моят checklist е кратък.

Първо: какво може да се обърка? Назови failure mode-а, преди да пишеш теста.

Второ: кой плаща за това? User, support team, finance, security, data integrity или future developer?

Трето: колко често ще се променя този код? Често пипаният код заслужава повече тестове, защото ще бъде счупван по-често.

Четвърто: може ли тест евтино да хване failure-а? Ако да, напиши го. Ако не, помисли за monitoring, manual Q A, static analysis или опростяване на дизайна.

Пето: ще се провали ли тестът при бъга, от който се страхуваме? Ако не, вероятно е coverage cosplay.

[deliberate] Последното е най-важното. Тест, който не се проваля, когато кодът е грешен, не е safety net. Той е сценична декорация.

Ако проектът има слабо покритие и всички спорят за target-а, спрете спора за един следобед и пишете тестове в този ред.

Първо, пари, permissions и необратими действия. Payments, refunds, billing periods, subscription state, authorization, destructive deletion, email sends, data imports, migrations и всичко, което променя данни, притежавани от клиенти.

За SaaS app бих предпочел деветдесет и пет процента coverage върху subscription transitions и петдесет и пет процента overall, отколкото осемдесет процента overall с почти гола billing state machine.

Второ, business rules, които хората обясняват с "except when." Това са чудесни тестове, защото странността вече е в езика.

Например: "A trial can be extended once, except when the account has already paid, unless it was migrated from the legacy plan."

Това изречение иска тестове. Няколко.

Трето, parsers, serializers, mappers и importers.

Покритието се отплаща красиво навсякъде, където формата на данните има значение: C S V imports, webhook payloads, date parsing, currency conversion, address normalization, search indexing, Open Graph extraction, всичко това.

Тези тестове често са евтини, стабилни и пълни с edge cases. Получаваш добра защита, без да ти трябва browser, queue worker и половината луна.

[matter-of-fact] Четвърто, код с branching logic.

Line coverage скрива пропуснатите решения. Branch coverage е по-добро за conditionals, защото пита дали и двете страни на решението са минали.

Документацията за branch coverage на coverage точка P Y показва класическия капан: statement coverage може да маркира функция като covered, дори когато един if никога не е оценен и в двете посоки.

В P H P, PHPUnit документира line, branch и path coverage отделно, като branch coverage проверява дали control structures са оценени и като true, и като false. Уловката е цената на tooling-а: P C O V е бърз за line coverage, докато Xdebug е нужен за branch и path coverage. Използвай по-тежкия сигнал там, където логиката го заслужава.

Пето, бъгове, които вече са се случили.

Всеки production bug е безплатна идея за тест. Не винаги unit test, но поне regression test някъде.

Когато бъг избяга, харесвам този малък postmortem въпрос: какъв тест щеше да се провали, ако го бяхме написали вчера?

Ако отговорът е прост, напиши този тест, преди да продължиш.

[conversational tone] Игнорирането на код не е cheating, когато екипът е съгласен защо се игнорира.

Добри кандидати са generated code, framework bootstrap files, one-line configuration wrappers, debug-only logging, defensive branches, които не могат да се случат в текущия runtime, код, който е по-добре да бъде изтрит, отколкото тестван, и integration glue, вече покрит от higher-level smoke test.

Лоши кандидати са "too hard to test" business logic, стар код, който всички се страхуват да пипат, payment, auth, import или permission paths, branches, които изглеждат impossible само защото никой не е проверил production data, и код зад feature flag, но вече reachable от customers.

Моето правило: ако изключим нещо от coverage, причината трябва да е скучна и защитима в review. "Generated by Open A P I" е скучно. "Не ни се тестваше checkout" не е.

[matter-of-fact] Примерите помагат.

Повечето CRUD SaaS apps нямат нужда от героично coverage върху всеки controller branch. Имат нужда от силно coverage върху permissions, validation, state transitions, background jobs, billing, imports, exports и всичко, което може да corrupt-не customer data.

Здравословната форма може да е високо unit coverage върху domain services и policies, integration tests за важни A P I endpoints, няколко end-to-end smoke tests за signup, checkout, core workflow и cancellation, и coverage gates върху changed code, не внезапно изискване целият legacy app да скочи до деветдесет процента.

При frontend work line coverage бързо може да стане смешно, ако гониш всеки rendering detail. Мен ме интересуват повече user-visible states: loading, empty, error, success; disabled и permission-gated actions; optimistic updates и rollback; forms с validation и server errors; accessibility-critical behavior като focus, labels и keyboard paths.

Точният нюанс на декоративна border линия не се нуждае от unit test. "Delete account" confirmation flow се нуждае.

За public library или S D K вдигни летвата. Твоите edge cases са нечий друг production outage.

Тествай documented A P I, не само internals. Включи compatibility cases, invalid input, error messages, serialization, version boundaries и examples, копирани от README. Ако user може да го paste-не, вероятно трябва да бъде тествано.

При data pipeline или import system, coverage трябва да клони към fixtures и invariants: malformed rows, missing fields, duplicate I D values, timezone edges, retry и idempotency behavior, partial failure handling и totals от типа "this must never decrease."

Тук седемдесет и пет процента line coverage с отлични fixtures може да победи деветдесет и пет процента coverage, което тества само happy path.

За Terraform, deployment scripts, queue workers и еднократни operational tools най-доброто coverage може да не е unit процент. Може да е dry-run mode, shellcheck, static checks, staged rollout, idempotency tests и много ясно logging.

[emphasized] И все пак, ако script изчислява кои database rows да изтрие, тествай това изчисление, сякаш ти дължи пари.

Global coverage се подобрява бавно и лесно се game-ва. Diff coverage е мястото, където екипите реално стават по-добри.

За нов и променен код харесвам по-строго правило.

Changed risky code трябва да е около деветдесет процента или повече covered. Changed trivial code може да е по-ниско, ако reviewer-ът може да обясни защо. Overall project coverage не трябва да пада без explicit reason. Legacy files трябва да стават малко по-чисти всеки път, когато ги пипнеш.

Това е практичната версия на boy-scout rule: не изисквай от екип да поправи пет години липсващи тестове, преди да merge-не малко подобрение, но не позволявай малкото подобрение да направи дупката по-дълбока.

Jest поддържа thresholds globally, by glob, directory или file, включително отделни thresholds за branches, functions, lines и statements.

TypeScript project може да включи coverage, да сложи global thresholds около седемдесет за branches, седемдесет и пет за functions и осемдесет за lines и statements, после да сложи billing directory на деветдесет навсякъде.

Точните числа имат по-малко значение от формата: рисковата directory има по-висока летва от останалата част от app-а.

За P H P project обикновено искам бързо line coverage локално и по-дълбоко branch или path coverage само там, където си заслужава. Актуалните PHPUnit coverage docs са ясни, че branch и path coverage изискват Xdebug, докато P C O V поддържа line coverage. Това е trade-off, не морален провал.

[deliberate] Fast feedback печели по време на нормална разработка. По-дълбокото coverage принадлежи в C I или в targeted checks, когато логиката е gnarly.

Line coverage пита: мина ли този ред?

Branch coverage пита: мина ли всяко решение и в двете посоки?

Вторият въпрос обикновено е по-близо до това, което имаме предвид под "тествано." Но branch coverage все още може да стане шумно. Някои branches са defensive. Някои са artifacts of transpilation. Някои са technically possible, но irrelevant. Някои са скъпи за насилване през тест за много малка стойност.

Така че да, използвай branch coverage за decision-heavy code. Просто не заменяй един тъп идол с друг.

[conversational tone] Mutation testing променя кода ти по малки начини и проверява дали тестовете ще се провалят.

Например може да обърне greater than в greater than or equal, true във false или plus в minus.

Ако тестовете все още минават, mutant-ът е оцелял. Това е полезна обида от машината.

Това хваща класическата лъжа на coverage: "редът е минал, но никой не е assert-нал behavior-а." P H P документацията на Infection показва точно този gap с отделни mutation score и covered-code mutation score metrics. В JavaScript Stryker играе подобна роля. В J V M land PIT е познатото име.

Не бих пуснал mutation testing навсякъде от първия ден. Може да е бавно и шумно. Бих го пуснал върху billing rules, permission checks, validators, calculators, parsers, код, който има високо coverage, но продължава да произвежда bugs, и libraries, при които A P I behavior е продуктът.

Mutation testing не е заместител на coverage. То е въпросът, който задаваш, след като coverage каже: "да, тестовете докоснаха това." Mutation tool-ът пита: "cool, but did they care?"

[matter-of-fact] Ако настройвах това за екип днес, бих написал policy-то така.

Coverage се review-ва върху diff-а. Uncovered changed lines трябва или да бъдат тествани, или обяснени.

Risky modules получават explicit thresholds. Billing, permissions, data integrity и core domain logic имат по-високи летви.

Global coverage не може да пада тихо. Малки спадове искат причина; големи спадове блокират merge-а.

Generated и framework code може да бъде excluded. Exclusion-ът трябва да е очевиден и документиран.

Branch coverage е задължително за decision-heavy code, особено state machines и важни conditionals.

Mutation testing е targeted. Използвай го там, където високото coverage все още не вдъхва доверие.

Escaped bugs стават regression tests. Не винаги веднага, не винаги на същия layer, но deliberate.

Тази policy е по-строга от "осемдесет процента or else" и по-добра от "сто процента or shame." По-важното е, че дава на reviewers правило за решение.

[conversational tone] Когато review-вам P R, бих предпочел да оставя този comment: "This changes the refund eligibility rule, but the uncovered branch is the trial was extended case. Can we add a regression test for that state?"

Вместо това: "Coverage is seventy-eight point three percent. Please improve."

Първият comment е за риск. Вторият е за времето.

Ако водиш екип, не weaponize-вай coverage. Хората ще optimize-ват за каквото сложиш на scoreboard-а. Ако scoreboard-ът казва "hit осемдесет и пет процента," може да получиш shallow tests, които hit-ват осемдесет и пет процента.

Използвай coverage, за да започнеш по-добри разговори.

Защо този hot file е uncovered? Защо production bugs се струпват в modules с "good" coverage? Нашите tests assert-ват outcomes или само snapshots? Integration tests крият ли missing unit coverage? Slow tests карат ли хората да избягват да пускат suite-а? Този код hard to test ли е, защото design-ът е muddy?

Скритият подарък на coverage не е процентът. Той е начинът, по който uncovered code сочи към design, ownership и risk.

[deliberate] И така, какво е добро покритие на кода?

Доброто покритие на кода е достатъчно coverage, така че важна грешка вероятно да заболи в C I, преди да заболи user.

За типичен product team това често означава седемдесет до осемдесет и пет процента overall coverage; деветдесет процента или повече върху critical business logic; branch coverage върху important decisions; diff coverage за changed code; mutation testing там, където correctness има значение; и intentional exclusions за код, който не заслужава церемонията.

Но истинският отговор все още е основан на риска.

Покрий кода, който може да те нарани. Покрий кода, който променяш често. Покрий behavior-а, който си обещал. Игнорирай числото само след като разбереш за какво се опитва да те предупреди.

Dashboard-ът може да е green и пак да лъже. Полезната работа е да направим по-трудно продуктът да лъже потребителите ти.
