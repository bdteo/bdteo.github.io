---
lang: "bg"
translationOf: "type-0-refactoring-step-before-step-one"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "16a0b76cc24c4b04"
title: "Type 0 рефакторинг: направи кода разбираем, преди да променяш поведение"
date: "2025-12-13T12:00:00.000Z"
description: "Type 0 рефакторингът е запазващата поведението стъпка преди истинска промяна в кода: направи разхвърляния код разбираем, тестваем и удобен за review без театрално почистване."
tags: ["рефакторинг", "софтуерно инженерство", "debugging", "поддръжка"]
featuredImage: "./images/featured.webp"
imageCaption: "Mise en place. Работата преди работата."
audioUrl: "/audio/articles/type-0-refactoring-step-before-step-one/bg/5egO01tkUjEzu7xSSE8M-69888b67808a.m4a"
audioDuration: "24:15"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/type-0-refactoring-step-before-step-one.bg.md"
---

Има един вид рефакторинг, който екипите правят постоянно, обикновено под напрежение, обикновено без да го назовават.

Отваряш файла, в който живее bug-ът. Методът е прекалено дълъг. Имената са уморени. Разклоненията са натрупани като стари столове в мазе. Усещаш физически, че да направиш поисканата промяна в тази форма на код е лоша идея.

Но още не си готов да го препроектираш.

Не се опитваш да въведеш нова абстракция.

Не се опитваш да докажеш, че си clean-code човекът в стаята.

Опитваш се да направиш текущото поведение достатъчно разбираемо, за да може следващата промяна да се направи безопасно.

Наричам това **Type 0 рефакторинг**.

Или, по-малко запомнящо се, но по-точно:

> Type 0 рефакторингът е запазващото поведението почистване, което правиш преди да променяш поведение, така че кодът да стане четим, тестваем и удобен за review.

Това е стъпката преди стъпка едно.

Не истинският ремонт. Разчистването на работната маса. Етикетирането на кабелите. Действието, с което правиш нещото разбираемо, преди да пъхнеш ръце вътре.

## Защо Type 0 заслужава име

[Martin Fowler дефинира рефакторинга](https://refactoring.com/) като промяна на вътрешната структура на кода без промяна на външното му поведение. Тази точност има значение. Ако поведението се променя, работата пак може да е ценна, но не е рефакторинг в строгия смисъл.

Type 0 е по-тесен от това.

Обикновеният рефакторинг може да подобри дизайна. Type 0 може и да не го направи.

Обикновеният рефакторинг може да премести отговорности между класове. Type 0 не трябва.

Обикновеният рефакторинг може да създаде по-добри domain boundaries. Type 0 спира по-рано: той кара съществуващия код да каже какво вече прави.

Това звучи скромно, докато не гледаш 900-редов метод по време на hotfix и мозъкът ти не е започнал да буферира.

Непосредственият проблем в грозния код често не е архитектурата. Той е **разбираемостта**. Не можеш безопасно да променяш нещо, което не можеш да задържиш в главата си.

Работата на Sonar върху [Cognitive Complexity](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) е полезна тук, защото отделя „колко пътища съществуват?“ от „колко трудно е това за човек да го проследи?“. Type 0 е насочен към втория въпрос. Той намалява количеството състояние, разклонения, неясни имена и визуален шум, които reviewer-ът трябва да симулира наум.

Това не е козметика. Това е намаляване на риска.

## Моментът, в който идеята щракна

Името се роди от hotfix.

Bug-ът не беше интелектуално дълбок. Методът около него беше. Беше от онзи тип методи, в които всяка локална променлива изглежда невинна, докато не осъзнаеш, че носи значение от преди три екрана. Всеки conditional беше преживяем сам по себе си, но комбинацията караше execution path-а да изглежда нестабилен.

Не ми трябваше красив дизайн.

Трябваше ми debuggability:

- по-малко разклонения на екран
- имена, които описват бизнес намерение, а не временна механика
- по-малки парчета, през които мога да мина със step-through
- начин да review-на почистването, без едновременно с това да review-вам bug fix-а

Един LLM предложи няколко разумни „типа“ рефакторинг. Извади този service. Въведи онзи pattern. Раздели отговорностите. Все добри идеи. Все твърде много за момента.

Попита дали да започне с Type 1.

Казах: не, започни с Type 0.

Тоест: преди да подобряваме дизайна, направи текущия код четим, без да променяш какво прави.

Това разграничение спаси работата. Методът стана навигируем. Bug-ът стана видим. Fix-ът остана малък.

## Работна дефиниция

**Type 0 рефакторингът е ограничен, запазващ поведението pass, който прави кода по-лесен за разбиране преди функционална промяна.**

Той има четири позволени движения:

1. Извади смислени части в именувани методи или локални променливи.
2. Преименувай нещата така, че кодът да използва човешки език вместо археология.
3. Премахни шум, който е доказуемо неизползван.
4. Добави или стегни characterization tests около поведението, което предстои да запазиш.

И има три твърди граници:

- без ново продуктово поведение
- без архитектурни движения
- без „докато съм тук“ подобрения, които променят review въпроса

Ако PR-ът променя това, което потребители, callers, jobs, API responses, database writes, emitted events или error paths наблюдават, той вече не е Type 0. Това пак може да е правилната работа, но трябва да бъде назована честно.

## Преди и след: формата на Type 0

Ето малък пример. Умишлено е обикновен. Повечето полезен рефакторинг е обикновен.

Преди:

```ts
export function canStartTrial(account: Account | null, plan: Plan) {
  if (!account || account.deletedAt) {
    return false;
  }

  if (account.flags.includes("trial_blocked")) {
    return false;
  }

  if (account.subscription && account.subscription.status !== "canceled") {
    return false;
  }

  if (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  ) {
    return false;
  }

  if (plan.priceCents === 0 || plan.hidden) {
    return false;
  }

  return true;
}
```

Това не е ужасен код. Това е важно. Type 0 не е само за катастрофи.

Но си представи, че трябва да промениш trial eligibility. Кое правило променяш? Кое е ръчна политика? Кое е billing history? Кое е plan eligibility? Reviewer-ът трябва да изведе всичко това от механиката.

След Type 0 pass:

```ts
export function canStartTrial(account: Account | null, plan: Plan) {
  if (isMissingOrDeleted(account)) return false;
  if (isManuallyBlockedFromTrial(account)) return false;
  if (hasActiveSubscription(account)) return false;
  if (hasPaidBeforeOrActiveTrial(account)) return false;
  if (isIneligibleTrialPlan(plan)) return false;

  return true;
}

function isMissingOrDeleted(account: Account | null) {
  return !account || Boolean(account.deletedAt);
}

function isManuallyBlockedFromTrial(account: Account) {
  return account.flags.includes("trial_blocked");
}

function hasActiveSubscription(account: Account) {
  return Boolean(account.subscription && account.subscription.status !== "canceled");
}

function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}

function isIneligibleTrialPlan(plan: Plan) {
  return plan.priceCents === 0 || plan.hidden;
}
```

Това не е нов дизайн. Не въвежда policy object. Не решава дали trial eligibility трябва да живее в друг module. Не прави правилата по-елегантни.

Прави едно нещо: дава имена на съществуващото поведение.

Сега следващият PR може да каже: „Промени `hasPaidBeforeOrActiveTrial`, така че изтеклите paid subscriptions да се третират различно“, и reviewer-ът вече не копае из анонимни conditionals.

Това е Type 0, когато си върши работата.

## Опасната част: дори „само extraction“ може да промени поведение

Type 0 звучи безопасно, защото е малък. Той е по-безопасен, не магически безопасен.

Extraction може да промени поведение, ако си невнимателен с:

- evaluation order
- short-circuiting
- variable scope
- mutation
- exception timing
- repeated calls към time, random, IO, caches или database queries
- references, които преди са сочили към същия object

Тук Type 0 има нужда от дисциплина.

Не пренаписвай condition само защото пренаписаната версия е „еквивалентна“. Еквивалентността е мястото, където bugs слагат малки мустаци и минават покрай охраната.

Предпочитай това:

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}
```

Пред това:

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  const paidBefore = account.invoices.some((invoice) => invoice.status === "paid");
  const activeTrial = account.trials.some((trial) => trial.endsAt > new Date());

  return paidBefore || activeTrial;
}
```

Втората версия изглежда по-хубава, но вече не запазва short-circuit поведението. Ако `account.invoices` вече доказва отговора, старият код никога не е докосвал `account.trials` или `new Date()`. Може би това няма значение. Може би има. Type 0 не кара reviewer-а да гадае.

Когато се колебаеш, първо extract-ни, после разкрасявай, и дръж всяка стъпка достатъчно скучна, за да може уморен човек да я провери.

## Safety net: characterization преди увереност

Ако кодът вече е добре тестван, чудесно. Пусни фокусираните tests преди и след Type 0 pass-а.

Ако не е, устой на желанието да кажеш: „Това е само cleanup.“

Това изречение е пуснало хиляда regressions.

Книгата на Michael Feathers _Working Effectively with Legacy Code_ още е книгата, за която мисля тук; [общият преглед на O'Reilly](https://www.oreilly.com/library/view/working-effectively-with/0131177052/) я рамкира около промяна на legacy systems без да пренаписваш всичко. На практика полезното движение често е малък characterization test: улови какво кодът прави сега за пътя, който предстои да докоснеш.

Не какво трябва да прави.

Какво прави.

Пример:

```ts
it("preserves the current trial eligibility rules for blocked accounts", () => {
  const account = accountFactory({
    flags: ["trial_blocked"],
    subscription: null,
    invoices: [],
    trials: [],
  });

  expect(canStartTrial(account, paidPlan)).toBe(false);
});
```

Този test може да е философски неудовлетворяващ. Може да encode-ва поведение, което възнамеряваш да промениш след пет минути.

Добре. Изтрий го или го обнови в behavior-changing PR-а.

За Type 0 PR-а работата му е скромна: да докаже, че cleanup-ът не е внесъл тайно истинската промяна.

## Кога да посягаш към Type 0

Използвай Type 0, когато следващата промяна е блокирана от разбираемост.

Добри сигнали:

- продължаваш да препрочиташ същия метод и губиш нишката
- файлът има един „main“ метод, който смесва validation, branching, IO, formatting и persistence
- едноредов bug fix изисква да обясниш шест несвързани факта
- reviewers спорят за style, защото намерението не е видимо
- кодът е достатъчно правилен, за да движи бизнеса, но твърде мътен, за да се променя уверено
- трябва да добавиш tests, но текущата форма не ти дава чисто място, от което да наблюдаваш поведението

Избягвай Type 0, когато:

- функционалната промяна вече е очевидна и безопасна
- не можеш да обясниш точно кое поведение трябва да остане непроменено
- cleanup-ът изисква да докоснеш много callers в системата
- екипът се опитва да промъкне redesign под етикет „cleanup“
- няма near-term промяна, която да печели от яснотата

Последното е важно. Cleanup без customer често се превръща във вкус. Type 0 има customer: следващата промяна.

## Type 0 decision rule

Ето правилото, което използвам:

> Ако не мога да напиша behavior-changing diff по начин, който reviewer може да разбере бързо, вероятно първо ми трябва Type 0.

Не винаги. Но достатъчно често.

Можеш да го формулираш и като три въпроса:

1. Какво поведение предстои да променя?
2. Кое текущо поведение трябва да остане точно същото?
3. Какъв малък readability pass би направил и двата отговора очевидни в diff-а?

Ако третият въпрос има малък отговор, направи Type 0.

Ако има огромен отговор, може би гледаш истински рефакторинг, не Type 0. Раздели работата, направи план и спри да се преструваш, че е безобидно.

## Как да структурираш PR-а

Type 0 работи най-добре, когато може да се review-не като отделно нещо.

Ако cleanup-ът е мъничък, сложи го в първия commit на функционалния PR:

1. `Type 0: name existing trial eligibility checks`
2. `Fix expired subscription trial eligibility`

Ако cleanup-ът е достатъчно голям, че прави behavior diff-а труден за виждане, отвори отделен PR.

Използвай скучен PR език:

```md
This PR is Type 0 only.

Intent:
- make the existing trial eligibility path readable before changing the rules
- preserve current behavior

Changed:
- extracted the top-level eligibility checks into named predicates
- renamed temporary variables to match existing domain terms
- removed one unused private helper

Validation:
- existing eligibility tests pass
- added characterization coverage for blocked, paid-before, and active-trial accounts

Out of scope:
- changing trial eligibility rules
- moving this logic into a policy/service object
```

Това дава на reviewers правилната работа.

Те не review-ват дали product logic е по-добра. Review-ват дали кодът още прави същото нещо по-разбираемо.

Добрите review comments за Type 0 звучат така:

- „Тази extraction променя кога се evaluation-ва `new Date()`. Можем ли да запазим старото short-circuit поведение?“
- „Новото име казва `active subscription`, но predicate-ът третира `past_due` като active също. Може ли името да съвпада с реалното поведение?“
- „Този изтрит helper изглежда unused в този package, но дали не се reference-ва през reflection/config?“
- „Можем ли да добавим един characterization test за пътя, който този cleanup exposes?“

По-малко полезните comments звучат така:

- „Можем ли да го превърнем в strategy?“
- „Целият module трябва да е event-driven.“
- „Докато си тук, можеш ли да оправиш странния billing edge case?“

Това може да са добри идеи. Не са Type 0 review.

## Как Type 0 се различава от cleanup theater

Cleanup theater е работа, която изглежда добродетелна в diff-а, но не намалява риска за следващата промяна.

Обикновено мирише по един от тези начини:

- широк formatting churn в файлове, които никой няма да докосва скоро
- преименувания според личен вкус, а не според domain clarity
- местене на код в нови abstractions, преди някой да може да назове текущото поведение
- изтриване на „unused“ code без доказателство, че runtime-ът не може да го достигне
- смесване на cleanup с behavior change, така че reviewers не могат да разберат кой ред какво е направил
- PR description, което казва „misc cleanup“

Type 0 е различен, защото е accountable.

Той казва:

- ето поведението, което запазваме
- ето пътя, който правим разбираем
- ето следващата промяна, която това позволява
- ето как проверихме, че cleanup-ът не е променил поведение

Това е разликата между подреждане и инженерство.

## Type 0 и legacy seams

Понякога Type 0 разкрива, че следващото безопасно движение е seam.

Бележката на Fowler за [legacy seams](https://martinfowler.com/bliki/LegacySeam.html) е полезна, защото описва места, където можем да redirect-ваме, observe-ваме или test-ваме поведение, без да редактираме source-а в точката на поведение. В legacy system един seam може да е разликата между „можем да test-ваме това“ и „надяваме се много професионално“.

Но създаването на seam може да прекрачи границата на Type 0.

Изваждане на метод, така че текущият flow да получи име:

```ts
const shippingCost = await calculateShipping(order);
```

към:

```ts
const shippingCost = await calculateShippingForOrder(order);
```

Това може да е Type 0, ако поведението остава същото.

Промяна на function signature, така че tests да могат да inject-нат fake shipping provider:

```ts
const shippingCost = await calculateShippingForOrder(order, shippingProvider);
```

Това може да е правилното движение, но вече не е просто да направиш съществуващия код разбираем. То променя collaboration surface-а. Третирай го като dependency-breaking refactoring и го review-вай с това ниво на внимание.

Type 0 може да посочи seam-а. Не е длъжен да създаде цялата testing architecture в същия PR.

## Практичен Type 0 checklist

Преди да отвориш PR-а:

- [ ] Мога да назова behavior-changing работата, за която този cleanup подготвя.
- [ ] PR-ът не променя умишлено user-visible или caller-visible поведение.
- [ ] Extracted methods запазват evaluation order и short-circuit behavior.
- [ ] Имената описват какво кодът реално прави, не какво ми се иска да прави.
- [ ] Deleted code е доказано unused в релевантния runtime, не просто непопулярен.
- [ ] Пуснах focused tests или replay-нах scenario-то, което има значение.
- [ ] Ако tests липсваха, добавих characterization coverage за touched path-а.
- [ ] PR description-ът казва на reviewers, че това е Type 0 и какво е out of scope.

По време на review:

- [ ] Питай „запазва ли това поведение?“ преди „предпочитам ли този дизайн?“
- [ ] Избутай behavior changes в follow-up commit или PR.
- [ ] Дръж architecture ideas като notes, освен ако не са нужни за safety.
- [ ] Бъди подозрителен към clever equivalence.

След merge:

- [ ] Направи истинската промяна, докато mental model-ът е свеж.
- [ ] Изтрий или обнови characterization tests само когато поведението умишлено се променя.
- [ ] Не позволявай Type 0 да се превърне в parking lot за вечен cleanup.

## Обещанието

Type 0 рефакторингът е малко обещание:

> Правя този код по-лесен за промяна, без да променям какво прави.

Това обещание е полезно точно защото е ограничено.

То дава на developer-а разрешение да подобри работната повърхност, без да започва architecture debate. Дава на reviewer-а ясен стандарт. Дава на следващия PR шанс да бъде за реалната продуктова промяна.

Понякога най-смелото, което можеш да направиш в разхвърлян codebase, не е да го redesign-неш.

Понякога е първо да накараш текущата бъркотия да каже истината.
