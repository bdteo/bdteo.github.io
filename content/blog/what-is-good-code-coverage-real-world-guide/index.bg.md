---
lang: "bg"
translationOf: "what-is-good-code-coverage-real-world-guide"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "6cc0abbf0fbddc3b"
title: "Какво е добро покритие на кода? Наръчник, основан на риска"
date: "2025-07-15"
description: "Практичен, основан на риска наръчник за code coverage: какво да тестваме първо, какво да игнорираме, кога да използваме branch и mutation testing и защо процентите лъжат."
tags: ["code-coverage", "testing", "typescript", "php", "best-practices", "quality-assurance"]
featuredImage: "./images/featured.jpg"
imageCaption: "Доброто покритие е карта на риска, не трофеен процент."
audioUrl: "/audio/articles/what-is-good-code-coverage-real-world-guide/bg/5egO01tkUjEzu7xSSE8M-824eb8f8a094.m4a"
audioDuration: "24:56"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/what-is-good-code-coverage-real-world-guide.bg.md"
---

# Какво е добро покритие на кода? Наръчник, основан на риска

Доброто покритие на кода не е 80%. Не е 90%. Не е святото сияние на dashboard, който казва 100%.

Доброто покритие на кода означава това:

> Частите от системата, които биха болели най-много, ако се счупят, са покрити от тестове, които наистина биха се провалили, когато тези части са грешни.

Това е целият трик. Процентът е полезен, но чак след като знаеш какъв код гледаш, колко често се променя, кого ще боли от бъг и дали тестовете ти правят реални assertions, или просто се разхождат през кода с фенер.

Все още гледам числото. Харесвам числа. Те са добри в това да правят смътната тревога видима. Но вече не питам "82% добре ли е?" изолирано. Питам по-добър въпрос:

> Какъв риск все още е непокрит и удобно ли ни е да го пуснем така?

Този въпрос работи за инженери, които пишат тестове, за leads, които задават quality bar, и за reviewers, които решават дали един PR е безопасен за merge.

## Краткият отговор

Ако ти трябва начално правило, използвай това:

| Зона от кода | Добра цел за покритие | Защо |
| --- | ---: | --- |
| Core domain rules, пари, permissions, security, пътища към загуба на данни | 90-100% смислено line и branch coverage | Малък бъг може да стане скъп, срамен или необратим. |
| Public libraries, SDKs, reusable packages | 90%+ плюс edge cases и compatibility tests | Потребителите ти не могат да инспектират намерението ти. API-то е продуктът. |
| Нормален SaaS application code | 70-85% overall, по-високо при рискови modules | Повечето екипи получават силна стойност тук, без да превръщат тестовете в театър. |
| Legacy systems под 50% | Не гони първо global number | Покрий променения код и опасните flows, преди да се опитваш да "поправиш" dashboard-а. |
| Generated code, framework glue, debug logging, trivial wrappers | Често excluded или леко smoke-tested | Покритието тук може да е шумно и скъпо, без да намалява много риск. |

Това не са религиозни числа. Това са defaults, за които бих очаквал екип да спори.

[Насоките на Google за тестване](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html) казват, че няма универсално идеално число, и поставят покритието в контекста на business impact, change frequency, expected lifetime, complexity и domain risk. [Martin Fowler](https://martinfowler.com/bliki/TestCoverage.html) прави същата по-дълбока точка от друг ъгъл: покритието помага да намериш нетестуван код, но е лошо standalone твърдение за качеството на тестовете.

Това съвпада с моя опит. Ниското покритие е smoke alarm. Високото покритие не е гаранция.

## Какво може да ти каже покритието

Покритието е най-добро в показването на отсъствие.

То може да ти каже:

- Този файл никога не се упражнява от автоматизирани тестове.
- Този error branch никога не е минавал в CI.
- Това ново payment rule е merged без тест да го докосне.
- Този refactor е изтрил behavior, което нито един тест не е забелязал.
- Това repository има цели квартали, където бъговете могат да живеят без наем.

Това вече е ценно. [Статията на Google за code coverage в Google](https://research.google/pubs/code-coverage-at-google/) установява, че покритието е най-actionable, когато се показва на ниво changesets и code review. Харесвам тази рамка: покритието принадлежи близо до diff-а, където човек може да попита: "има ли значение този непокрит ред?"

Покритието е по-малко полезно като executive health score. Мениджър, който вижда "88%", не може да разбере дали липсващите 12% са неизползван debug output, или refund path-ът, който решава дали клиентите ще си получат парите обратно.

## Какво покритието не може да докаже

Покрит ред не е непременно тествано behavior.

Покритието не може да докаже, че:

- assertions са смислени;
- test data прилича на production;
- unhappy path е проверен, не просто изпълнен;
- UI е използваем;
- query-то е достатъчно бързо;
- feature flag е конфигуриран правилно;
- concurrent case работи;
- mocks са честни;
- кодът е достатъчно прост за поддръжка.

Можеш да получиш 100% line coverage с тестове, които викат функции и почти нищо не assert-ват. Можеш също да получиш високо покритие от end-to-end tests, които случайно минават през много код, докато почти не проверяват важните решения.

Затова coverage gate никога не трябва да бъде единственият quality gate. Комбинирай го с review, production incidents, property или fuzz tests там, където пасват, contract tests около integrations и mutation testing върху код, при който correctness наистина има значение.

## Правилото за решение, което използвам в reviews

Когато review-вам PR, не искам тестове, защото "ни трябва coverage." Искам ги, защото някакво behavior се е променило и искам доказателство, че behavior-ът е защитен.

Моят checklist е кратък:

1. **Какво може да се обърка?** Назови failure mode-а, преди да пишеш теста.
2. **Кой плаща за това?** User, support team, finance, security, data integrity, future developer?
3. **Колко често ще се променя този код?** Често пипаният код заслужава повече тестове, защото ще бъде счупван по-често.
4. **Може ли тест евтино да хване failure-а?** Ако да, напиши го. Ако не, помисли за monitoring, manual QA, static analysis или опростяване на дизайна.
5. **Ще се провали ли тестът при бъга, от който се страхуваме?** Ако не, вероятно е coverage cosplay.

Последното е най-важното. Тест, който не се проваля, когато кодът е грешен, не е safety net. Той е сценична декорация.

## Какво да тестваме първо

Ако проектът има слабо покритие и всички спорят за target-а, спрете спора за един следобед и пишете тестове в този ред.

### 1. Пари, permissions и необратими действия

Payments, refunds, billing periods, subscription state, authorization, destructive deletion, email sends, data imports, migrations и всичко, което променя данни, притежавани от клиенти.

За SaaS app бих предпочел 95% coverage върху subscription transitions и 55% overall, отколкото 80% overall с почти гола billing state machine.

### 2. Business rules, които хората обясняват с "except when"

Това са чудесни тестове, защото странността вече е в езика.

"A trial can be extended once, except when the account has already paid, unless it was migrated from the legacy plan."

Това изречение иска тестове. Няколко.

### 3. Parsers, serializers, mappers и importers

Покритието се отплаща красиво навсякъде, където формата на данните има значение. CSV imports, webhook payloads, date parsing, currency conversion, address normalization, search indexing, Open Graph extraction, всичко това.

Тези тестове често са евтини, стабилни и пълни с edge cases. Получаваш добра защита, без да ти трябва browser, queue worker и половината луна.

### 4. Код с branching logic

Line coverage скрива пропуснатите решения. Branch coverage е по-добро за conditionals, защото пита дали и двете страни на решението са минали. [Документацията за branch coverage на coverage.py](https://coverage.readthedocs.io/en/latest/branch.html) показва класическия капан: statement coverage може да маркира функция като covered, дори когато един `if` никога не е оценен и в двете посоки.

В PHP [PHPUnit документира line, branch и path coverage отделно](https://docs.phpunit.de/en/12.5/code-coverage.html), като branch coverage проверява дали control structures са оценени и като `true`, и като `false`. Уловката е цената на tooling-а: PCOV е бърз за line coverage, докато Xdebug е нужен за branch и path coverage. Използвай по-тежкия сигнал там, където логиката го заслужава.

### 5. Бъгове, които вече са се случили

Всеки production bug е безплатна идея за тест. Не винаги unit test, но поне regression test някъде.

Когато бъг избяга, харесвам този малък postmortem въпрос:

> Какъв тест щеше да се провали, ако го бяхме написали вчера?

Ако отговорът е прост, напиши този тест, преди да продължиш.

## Какво да игнорираме, изключим или deprioritize-нем

Игнорирането на код не е cheating, когато екипът е съгласен защо се игнорира.

Добри кандидати:

- generated code;
- framework bootstrap files;
- one-line configuration wrappers;
- debug-only logging;
- defensive branches, които не могат да се случат в текущия runtime;
- код, който е по-добре да бъде изтрит, отколкото тестван;
- integration glue, вече покрит от higher-level smoke test.

Лоши кандидати:

- "too hard to test" business logic;
- стар код, който всички се страхуват да пипат;
- payment, auth, import или permission paths;
- branches, които изглеждат impossible само защото никой не е проверил production data;
- код зад feature flag, но вече reachable от customers.

Моето правило: ако изключим нещо от coverage, причината трябва да е скучна и защитима в review. "Generated by OpenAPI" е скучно. "Не ни се тестваше checkout" не е.

## Примери по тип приложение

### CRUD SaaS

Повечето CRUD apps нямат нужда от героично coverage върху всеки controller branch. Имат нужда от силно coverage върху permissions, validation, state transitions, background jobs, billing, imports, exports и всичко, което може да corrupt-не customer data.

Здравословната форма може да е:

- високо unit coverage върху domain services и policies;
- integration tests за важни API endpoints;
- няколко end-to-end smoke tests за signup, checkout, core workflow и cancellation;
- coverage gates върху changed code, не внезапно изискване целият legacy app да скочи до 90%.

### Frontend Product

При frontend work line coverage бързо може да стане смешно, ако гониш всеки rendering detail. Мен ме интересуват повече user-visible states:

- loading, empty, error, success;
- disabled и permission-gated actions;
- optimistic updates и rollback;
- forms с validation и server errors;
- accessibility-critical behavior като focus, labels и keyboard paths.

Точният нюанс на декоративна border линия не се нуждае от unit test. "Delete account" confirmation flow се нуждае.

### Public Library Or SDK

Вдигни летвата. Твоите edge cases са нечий друг production outage.

Тествай documented API, не само internals. Включи compatibility cases, invalid input, error messages, serialization, version boundaries и examples, копирани от README. Ако user може да го paste-не, вероятно трябва да бъде тествано.

### Data Pipeline Or Import System

Coverage трябва да клони към fixtures и invariants:

- malformed rows;
- missing fields;
- duplicate IDs;
- timezone edges;
- retry и idempotency behavior;
- partial failure handling;
- totals от типа "this must never decrease".

Тук 75% line coverage с отлични fixtures може да победи 95% coverage, което тества само happy path.

### Infrastructure And DevOps Code

За Terraform, deployment scripts, queue workers и еднократни operational tools най-доброто coverage може да не е unit процент. Може да е dry-run mode, shellcheck/static checks, staged rollout, idempotency tests и много ясно logging.

И все пак, ако script изчислява кои database rows да изтрие, тествай това изчисление, сякаш ти дължи пари.

## Използвай diff coverage преди global coverage

Global coverage се подобрява бавно и лесно се game-ва. Diff coverage е мястото, където екипите реално стават по-добри.

За нов и променен код харесвам по-строго правило:

- Changed risky code трябва да е около 90%+ covered.
- Changed trivial code може да е по-ниско, ако reviewer-ът може да обясни защо.
- Overall project coverage не трябва да пада без explicit reason.
- Legacy files трябва да стават малко по-чисти всеки път, когато ги пипнеш.

Това е практичната версия на boy-scout rule: не изисквай от екип да поправи пет години липсващи тестове, преди да merge-не малко подобрение, но не позволявай малкото подобрение да направи дупката по-дълбока.

[Jest поддържа thresholds](https://jestjs.io/docs/configuration#coveragethreshold-object) globally, by glob, directory или file, включително отделни thresholds за branches, functions, lines и statements. TypeScript project може да започне с нещо такова:

```js
const { defineConfig } = require("jest");

module.exports = defineConfig({
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    "src/billing/**/*.ts": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
});
```

Точните числа имат по-малко значение от формата: рисковата directory има по-висока летва от останалата част от app-а.

За PHP project обикновено искам бързо line coverage локално и по-дълбоко branch/path coverage само там, където си заслужава. Актуалните PHPUnit coverage docs са ясни, че branch и path coverage изискват Xdebug, докато PCOV поддържа line coverage. Това е trade-off, не морален провал. Fast feedback печели по време на нормална разработка; по-дълбокото coverage принадлежи в CI или в targeted checks, когато логиката е gnarly.

## Branch Coverage е по-добър въпрос, не перфектен

Line coverage пита:

> Мина ли този ред?

Branch coverage пита:

> Мина ли всяко решение и в двете посоки?

Вторият въпрос обикновено е по-близо до това, което имаме предвид под "тествано." Но branch coverage все още може да стане шумно. Някои branches са defensive. Някои са artifacts of transpilation. Някои са technically possible, но irrelevant. Някои са скъпи за насилване през тест за много малка стойност.

Така че да, използвай branch coverage за decision-heavy code. Просто не заменяй един тъп идол с друг.

## Mutation Testing: Reality Check

Mutation testing променя кода ти по малки начини и проверява дали тестовете ще се провалят. Например може да обърне `>` в `>=`, `true` във `false` или `+` в `-`.

Ако тестовете все още минават, mutant-ът е оцелял. Това е полезна обида от машината.

Това хваща класическата лъжа на coverage: "редът е минал, но никой не е assert-нал behavior-а." [PHP документацията на Infection](https://infection.github.io/guide/) показва точно този gap с отделни mutation score и covered-code mutation score metrics. В JavaScript [Stryker](https://stryker-mutator.io/docs/) играе подобна роля. В JVM land [PIT](https://pitest.org/) е познатото име.

Не бих пуснал mutation testing навсякъде от първия ден. Може да е бавно и шумно. Бих го пуснал върху:

- billing rules;
- permission checks;
- validators;
- calculators;
- parsers;
- код, който има високо coverage, но продължава да произвежда bugs;
- libraries, при които API behavior е продуктът.

Mutation testing не е заместител на coverage. То е въпросът, който задаваш, след като coverage каже: "да, тестовете докоснаха това." Mutation tool-ът пита: "cool, but did they care?"

## Практична coverage policy, която можеш да откраднеш

Ако настройвах това за екип днес, бих написал policy-то така:

1. **Coverage се review-ва върху diff-а.** Uncovered changed lines трябва или да бъдат тествани, или обяснени.
2. **Risky modules получават explicit thresholds.** Billing, permissions, data integrity и core domain logic имат по-високи летви.
3. **Global coverage не може да пада тихо.** Малки спадове искат причина; големи спадове блокират merge-а.
4. **Generated и framework code може да бъде excluded.** Exclusion-ът трябва да е очевиден и документиран.
5. **Branch coverage е задължително за decision-heavy code.** Особено state machines и важни conditionals.
6. **Mutation testing е targeted.** Използвай го там, където високото coverage все още не вдъхва доверие.
7. **Escaped bugs стават regression tests.** Не винаги веднага, не винаги на същия layer, но deliberate.

Тази policy е по-строга от "80% or else" и по-добра от "100% or shame." По-важното е, че дава на reviewers правило за решение.

## Reviewer версията

Когато review-вам PR, бих предпочел да оставя този comment:

> This changes the refund eligibility rule, but the uncovered branch is the `trial_was_extended` case. Can we add a regression test for that state?

Вместо това:

> Coverage is 78.3%. Please improve.

Първият comment е за риск. Вторият е за времето.

## Lead версията

Ако водиш екип, не weaponize-вай coverage. Хората ще optimize-ват за каквото сложиш на scoreboard-а. Ако scoreboard-ът казва "hit 85%," може да получиш shallow tests, които hit-ват 85%.

Използвай coverage, за да започнеш по-добри разговори:

- Защо този hot file е uncovered?
- Защо production bugs се струпват в modules с "good" coverage?
- Нашите tests assert-ват outcomes или само snapshots?
- Integration tests крият ли missing unit coverage?
- Slow tests карат ли хората да избягват да пускат suite-а?
- Този код hard to test ли е, защото design-ът е muddy?

Скритият подарък на coverage не е процентът. Той е начинът, по който uncovered code сочи към design, ownership и risk.

## И така, какво е добро покритие на кода?

Доброто покритие на кода е достатъчно coverage, така че важна грешка вероятно да заболи в CI, преди да заболи user.

За типичен product team това често означава:

- 70-85% overall coverage;
- 90%+ върху critical business logic;
- branch coverage върху important decisions;
- diff coverage за changed code;
- mutation testing там, където correctness има значение;
- intentional exclusions за код, който не заслужава церемонията.

Но истинският отговор все още е основан на риска:

> Покрий кода, който може да те нарани. Покрий кода, който променяш често. Покрий behavior-а, който си обещал. Игнорирай числото само след като разбереш за какво се опитва да те предупреди.

Dashboard-ът може да е green и пак да лъже. Полезната работа е да направим по-трудно продуктът да лъже потребителите ти.
