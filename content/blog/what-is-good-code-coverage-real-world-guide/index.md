---
title: "What Is Good Code Coverage? A Risk-Based Guide"
date: "2025-07-15"
description: "A practical, risk-based guide to code coverage: what to test first, what to ignore, when to use branch and mutation testing, and why percentages lie."
tags: ["code-coverage", "testing", "typescript", "php", "best-practices", "quality-assurance"]
featuredImage: "./images/featured.jpg"
imageCaption: "Good coverage is a risk map, not a trophy number."
audioUrl: "/audio/articles/what-is-good-code-coverage-real-world-guide/UzI1NsMEV3ni5JRkRSls-858b78bef4d1.m4a"
audioDuration: "20:00"
audioVoice: "Alistair (ElevenLabs cultured British)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/what-is-good-code-coverage-real-world-guide.md"
---

# What Is Good Code Coverage? A Risk-Based Guide

Good code coverage is not 80%. It is not 90%. It is not the holy glow of a dashboard that says 100%.

Good code coverage means this:

> The parts of the system that would hurt most if they broke are covered by tests that would actually fail when those parts are wrong.

That is the whole trick. The percentage is useful, but only after you know what kind of code you are looking at, how often it changes, who gets hurt by a bug, and whether your tests make real assertions or merely stroll through the code with a lantern.

I still look at the number. I like numbers. They are good at making vague anxiety visible. But I do not ask "is 82% good?" in isolation anymore. I ask a better question:

> What risk is still uncovered, and are we comfortable shipping that risk?

That question works for engineers writing tests, leads setting quality bars, and reviewers trying to decide whether a PR is safe to merge.

## The Short Answer

If you need a starting rule, use this:

| Code area | Good coverage target | Why |
| --- | ---: | --- |
| Core domain rules, money, permissions, security, data loss paths | 90-100% meaningful line and branch coverage | A small bug can become expensive, embarrassing, or irreversible. |
| Public libraries, SDKs, reusable packages | 90%+ plus edge cases and compatibility tests | Your users cannot inspect your intent. The API is the product. |
| Normal SaaS application code | 70-85% overall, higher on risky modules | Most teams get strong value here without turning tests into theater. |
| Legacy systems below 50% | Do not chase the global number first | Cover changed code and dangerous flows before trying to "fix" the dashboard. |
| Generated code, framework glue, debug logging, trivial wrappers | Often excluded or lightly smoke-tested | Coverage here can be noisy and expensive without reducing much risk. |

These are not religious numbers. They are defaults I would expect a team to argue with.

[Google's testing guidance](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html) says there is no universal ideal number, and frames coverage around business impact, change frequency, expected lifetime, complexity, and domain risk. [Martin Fowler](https://martinfowler.com/bliki/TestCoverage.html) makes the same deeper point from another angle: coverage helps you find untested code, but it is a poor standalone statement about test quality.

That matches my experience. Low coverage is a smoke alarm. High coverage is not a guarantee.

## What Coverage Can Tell You

Coverage is best at showing absence.

It can tell you:

- This file is never exercised by automated tests.
- This error branch has never run in CI.
- This new payment rule was merged without a test touching it.
- This refactor deleted behavior that no test noticed.
- This repository has entire neighborhoods where bugs can live rent-free.

That is already valuable. The [Google paper on code coverage at Google](https://research.google/pubs/code-coverage-at-google/) found coverage most actionable when shown at the level of changesets and code review. I like that framing: coverage belongs close to the diff, where a human can ask, "does this uncovered line matter?"

Coverage is less useful as an executive health score. A manager seeing "88%" cannot tell whether the missing 12% is unused debug output or the refund path that decides whether customers get their money back.

## What Coverage Cannot Prove

A covered line is not necessarily a tested behavior.

Coverage cannot prove:

- the assertions are meaningful;
- the test data resembles production;
- the unhappy path is checked, not merely executed;
- the UI is usable;
- the query is fast enough;
- the feature flag is configured correctly;
- the concurrent case works;
- the mocks are honest;
- the code is simple enough to maintain.

You can get 100% line coverage with tests that call functions and assert almost nothing. You can also get high coverage from end-to-end tests that incidentally walk through a lot of code while barely checking the important decisions.

That is why a coverage gate should never be the only quality gate. Pair it with review, production incidents, property or fuzz tests where they fit, contract tests around integrations, and mutation testing on code where correctness really matters.

## The Decision Rule I Use in Reviews

When I review a PR, I do not ask for tests because "we need coverage." I ask because some behavior changed and I want evidence that the behavior is protected.

My checklist is short:

1. **What can go wrong?** Name the failure mode before writing the test.
2. **Who pays for it?** User, support team, finance, security, data integrity, future developer?
3. **How often will this code change?** Frequently touched code deserves more tests because it will be broken more often.
4. **Can a test catch the failure cheaply?** If yes, write it. If no, consider monitoring, manual QA, static analysis, or simplifying the design.
5. **Would the test fail for the bug we fear?** If not, it is probably coverage cosplay.

That last one is the most important. A test that does not fail when the code is wrong is not a safety net. It is stage decoration.

## What To Test First

If a project has weak coverage and everyone is arguing about the target, stop arguing for one afternoon and write tests in this order.

### 1. Money, permissions, and irreversible actions

Payments, refunds, billing periods, subscription state, authorization, destructive deletion, email sends, data imports, migrations, and anything that mutates customer-owned data.

For a SaaS app, I would rather have 95% coverage on subscription transitions and 55% overall than 80% overall with the billing state machine mostly naked.

### 2. Business rules that people explain with "except when"

These are great tests because the weirdness is already in the language.

"A trial can be extended once, except when the account has already paid, unless it was migrated from the legacy plan."

That sentence wants tests. Several of them.

### 3. Parsers, serializers, mappers, and importers

Coverage pays off beautifully anywhere data shape matters. CSV imports, webhook payloads, date parsing, currency conversion, address normalization, search indexing, Open Graph extraction, all of it.

These tests are often cheap, stable, and full of edge cases. You get good protection without needing a browser, a queue worker, and half the moon.

### 4. Code with branching logic

Line coverage hides missed decisions. Branch coverage is better for conditionals because it asks whether both sides of a decision ran. The [coverage.py branch coverage docs](https://coverage.readthedocs.io/en/latest/branch.html) show the classic trap: statement coverage can mark a function as covered even when an `if` was never evaluated both ways.

In PHP, [PHPUnit documents line, branch, and path coverage separately](https://docs.phpunit.de/en/12.5/code-coverage.html), with branch coverage checking whether control structures evaluated both `true` and `false`. The catch is tooling cost: PCOV is fast for line coverage, while Xdebug is needed for branch and path coverage. Use the heavier signal where the logic deserves it.

### 5. Bugs that already happened

Every production bug is a free test idea. Not always a unit test, but at least a regression test somewhere.

When a bug escapes, I like this tiny postmortem question:

> What test would have failed if we had written it yesterday?

If the answer is simple, write that test before moving on.

## What To Ignore, Exclude, Or Deprioritize

Ignoring code is not cheating when the team agrees why it is ignored.

Good candidates:

- generated code;
- framework bootstrap files;
- one-line configuration wrappers;
- debug-only logging;
- defensive branches that cannot happen in the current runtime;
- code that is better deleted than tested;
- integration glue already covered by a higher-level smoke test.

Bad candidates:

- "too hard to test" business logic;
- old code everyone is afraid to touch;
- payment, auth, import, or permission paths;
- branches that look impossible only because nobody has checked production data;
- code hidden behind a feature flag but already reachable by customers.

My rule: if we exclude something from coverage, the reason should be boring and defensible in review. "Generated by OpenAPI" is boring. "We did not feel like testing checkout" is not.

## Examples By Application Type

### CRUD SaaS

Most CRUD apps do not need heroic coverage on every controller branch. They do need strong coverage on permissions, validation, state transitions, background jobs, billing, imports, exports, and anything that can corrupt customer data.

A healthy shape might be:

- high unit coverage on domain services and policies;
- integration tests for important API endpoints;
- a few end-to-end smoke tests for signup, checkout, core workflow, and cancellation;
- coverage gates on changed code, not a sudden demand that the whole legacy app jumps to 90%.

### Frontend Product

For frontend work, line coverage can become silly quickly if you chase every rendering detail. I care more about user-visible states:

- loading, empty, error, success;
- disabled and permission-gated actions;
- optimistic updates and rollback;
- forms with validation and server errors;
- accessibility-critical behavior like focus, labels, and keyboard paths.

The exact shade of a decorative border does not need a unit test. The "delete account" confirmation flow does.

### Public Library Or SDK

Raise the bar. Your edge cases are someone else's production outage.

Test the documented API, not just the internals. Include compatibility cases, invalid input, error messages, serialization, version boundaries, and examples copied from the README. If a user can paste it, it should probably be tested.

### Data Pipeline Or Import System

Coverage should lean toward fixtures and invariants:

- malformed rows;
- missing fields;
- duplicate IDs;
- timezone edges;
- retry and idempotency behavior;
- partial failure handling;
- "this must never decrease" totals.

Here, 75% line coverage with excellent fixtures can beat 95% coverage that only tests the happy path.

### Infrastructure And DevOps Code

For Terraform, deployment scripts, queue workers, and one-off operational tools, the best coverage may not be a unit percentage. It may be dry-run mode, shellcheck/static checks, staged rollout, idempotency tests, and very clear logging.

Still, if a script calculates which database rows to delete, test that calculation like it owes you money.

## Use Diff Coverage Before Global Coverage

Global coverage is slow to improve and easy to game. Diff coverage is where teams actually get better.

For new and changed code, I like a stricter rule:

- Changed risky code should be around 90%+ covered.
- Changed trivial code can be lower if the reviewer can explain why.
- Overall project coverage should not fall without an explicit reason.
- Legacy files should get a little cleaner whenever touched.

This is the practical version of the boy-scout rule: do not require a team to fix five years of missing tests before merging a small improvement, but do not let the small improvement make the hole deeper.

[Jest supports thresholds](https://jestjs.io/docs/configuration#coveragethreshold-object) globally, by glob, directory, or file, including separate thresholds for branches, functions, lines, and statements. A TypeScript project might start with something like this:

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

The exact numbers matter less than the shape: the risky directory has a higher bar than the rest of the app.

For a PHP project, I usually want fast line coverage locally and deeper branch/path coverage only where it earns its keep. PHPUnit's current coverage docs are explicit that branch and path coverage require Xdebug, while PCOV supports line coverage. That is a trade-off, not a moral failing. Fast feedback wins during normal development; deeper coverage belongs in CI or targeted checks when the logic is gnarly.

## Branch Coverage Is A Better Question, Not A Perfect One

Line coverage asks:

> Did this line run?

Branch coverage asks:

> Did each decision go both ways?

That second question is usually closer to what we mean by "tested." But branch coverage can still become noisy. Some branches are defensive. Some are artifacts of transpilation. Some are technically possible but irrelevant. Some are expensive to force through a test for very little value.

So yes, use branch coverage for decision-heavy code. Just do not replace one blunt idol with another.

## Mutation Testing: The Reality Check

Mutation testing changes your code in small ways and checks whether your tests fail. For example, it might turn `>` into `>=`, `true` into `false`, or `+` into `-`.

If the tests still pass, the mutant survived. That is a useful insult from the machine.

This catches the classic coverage lie: "the line ran, but nobody asserted the behavior." [Infection's PHP docs](https://infection.github.io/guide/) show exactly this kind of gap with separate mutation score and covered-code mutation score metrics. In JavaScript, [Stryker](https://stryker-mutator.io/docs/) plays a similar role. In JVM land, [PIT](https://pitest.org/) is the familiar name.

I would not run mutation testing everywhere on day one. It can be slow and noisy. I would run it on:

- billing rules;
- permission checks;
- validators;
- calculators;
- parsers;
- code that has high coverage but keeps producing bugs;
- libraries where API behavior is the product.

Mutation testing is not a replacement for coverage. It is the question you ask after coverage says, "yes, the tests touched this." The mutation tool asks, "cool, but did they care?"

## A Practical Coverage Policy You Can Steal

If I were setting this up for a team today, I would write the policy like this:

1. **Coverage is reviewed on the diff.** Uncovered changed lines must be either tested or explained.
2. **Risky modules get explicit thresholds.** Billing, permissions, data integrity, and core domain logic have higher bars.
3. **Global coverage cannot silently drop.** Small decreases need a reason; large decreases block the merge.
4. **Generated and framework code can be excluded.** The exclusion must be obvious and documented.
5. **Branch coverage is required for decision-heavy code.** Especially state machines and important conditionals.
6. **Mutation testing is targeted.** Use it where high coverage still does not inspire trust.
7. **Escaped bugs become regression tests.** Not always immediately, not always at the same layer, but deliberately.

That policy is stricter than "80% or else" and kinder than "100% or shame." More importantly, it gives reviewers a decision rule.

## The Reviewer Version

When reviewing a PR, I would rather leave this comment:

> This changes the refund eligibility rule, but the uncovered branch is the `trial_was_extended` case. Can we add a regression test for that state?

Than this:

> Coverage is 78.3%. Please improve.

The first comment is about risk. The second is about weather.

## The Lead Version

If you lead a team, do not weaponize coverage. People will optimize for whatever you put on the scoreboard. If the scoreboard says "hit 85%," you may get shallow tests that hit 85%.

Use coverage to start better conversations:

- Why is this hot file uncovered?
- Why do production bugs cluster in modules with "good" coverage?
- Are our tests asserting outcomes or just snapshots?
- Are integration tests hiding missing unit coverage?
- Are slow tests forcing people to avoid running the suite?
- Is this code hard to test because the design is muddy?

The hidden gift of coverage is not the percentage. It is the way uncovered code points at design, ownership, and risk.

## So, What Is Good Code Coverage?

Good code coverage is enough coverage that an important mistake is likely to hurt in CI before it hurts a user.

For a typical product team, that often means:

- 70-85% overall coverage;
- 90%+ on critical business logic;
- branch coverage on important decisions;
- diff coverage for changed code;
- mutation testing where correctness matters;
- intentional exclusions for code that does not deserve the ceremony.

But the real answer is still risk-based:

> Cover the code that can hurt you. Cover the code you change often. Cover the behavior you promised. Ignore the number only after you understand what it is trying to warn you about.

The dashboard can be green and still lie. The useful work is making it harder for the product to lie to your users.
