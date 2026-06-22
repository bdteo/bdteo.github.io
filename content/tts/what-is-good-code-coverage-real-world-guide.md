[conversational tone] What Is Good Code Coverage? A Risk-Based Guide.

Good code coverage is not eighty percent. It is not ninety percent. It is not the holy glow of a dashboard that says one hundred percent.

Good code coverage means this: the parts of the system that would hurt most if they broke are covered by tests that would actually fail when those parts are wrong.

That is the whole trick. The percentage is useful, but only after you know what kind of code you are looking at, how often it changes, who gets hurt by a bug, and whether your tests make real assertions or merely stroll through the code with a lantern.

[reflective] I still look at the number. I like numbers. They are good at making vague anxiety visible. But I do not ask, "is eighty-two percent good?" in isolation anymore. I ask a better question: what risk is still uncovered, and are we comfortable shipping that risk?

That question works for engineers writing tests, leads setting quality bars, and reviewers trying to decide whether a pull request is safe to merge.

[matter-of-fact] The short answer is this.

For core domain rules, money, permissions, security, and data loss paths, aim for ninety to one hundred percent meaningful line and branch coverage. A small bug there can become expensive, embarrassing, or irreversible.

For public libraries, S D K packages, and reusable packages, aim for ninety percent or more, plus edge cases and compatibility tests. Your users cannot inspect your intent. The A P I is the product.

For normal SaaS application code, seventy to eighty-five percent overall can be healthy, with higher coverage on risky modules. Most teams get strong value there without turning tests into theater.

For legacy systems below fifty percent, do not chase the global number first. Cover changed code and dangerous flows before trying to fix the dashboard.

And for generated code, framework glue, debug logging, and trivial wrappers, exclusion or light smoke testing is often fine. Coverage there can be noisy and expensive without reducing much risk.

These are not religious numbers. They are defaults I would expect a team to argue with.

Google's testing guidance says there is no universal ideal number, and frames coverage around business impact, change frequency, expected lifetime, complexity, and domain risk. Martin Fowler makes the same deeper point from another angle: coverage helps you find untested code, but it is a poor standalone statement about test quality.

[deliberate] That matches my experience. Low coverage is a smoke alarm. High coverage is not a guarantee.

Coverage is best at showing absence.

It can tell you that a file is never exercised by automated tests. That an error branch has never run in C I. That a new payment rule was merged without a test touching it. That a refactor deleted behavior no test noticed. That a repository has entire neighborhoods where bugs can live rent-free.

That is already valuable. The Google paper on code coverage at Google found coverage most actionable when shown at the level of changesets and code review. I like that framing: coverage belongs close to the diff, where a human can ask, "does this uncovered line matter?"

Coverage is less useful as an executive health score. A manager seeing eighty-eight percent cannot tell whether the missing twelve percent is unused debug output or the refund path that decides whether customers get their money back.

[matter-of-fact] A covered line is not necessarily a tested behavior.

Coverage cannot prove that the assertions are meaningful. It cannot prove the test data resembles production. It cannot prove the unhappy path is checked, not merely executed. It cannot prove the U I is usable, the query is fast enough, the feature flag is configured correctly, the concurrent case works, the mocks are honest, or the code is simple enough to maintain.

You can get one hundred percent line coverage with tests that call functions and assert almost nothing. You can also get high coverage from end-to-end tests that incidentally walk through a lot of code while barely checking the important decisions.

That is why a coverage gate should never be the only quality gate. Pair it with review, production incidents, property or fuzz tests where they fit, contract tests around integrations, and mutation testing on code where correctness really matters.

[conversational tone] When I review a pull request, I do not ask for tests because "we need coverage." I ask because some behavior changed and I want evidence that the behavior is protected.

My checklist is short.

First: what can go wrong? Name the failure mode before writing the test.

Second: who pays for it? The user, the support team, finance, security, data integrity, or a future developer?

Third: how often will this code change? Frequently touched code deserves more tests because it will be broken more often.

Fourth: can a test catch the failure cheaply? If yes, write it. If no, consider monitoring, manual Q A, static analysis, or simplifying the design.

Fifth: would the test fail for the bug we fear? If not, it is probably coverage cosplay.

[deliberate] That last one is the most important. A test that does not fail when the code is wrong is not a safety net. It is stage decoration.

If a project has weak coverage and everyone is arguing about the target, stop arguing for one afternoon and write tests in this order.

First, money, permissions, and irreversible actions. Payments, refunds, billing periods, subscription state, authorization, destructive deletion, email sends, data imports, migrations, and anything that mutates customer-owned data.

For a SaaS app, I would rather have ninety-five percent coverage on subscription transitions and fifty-five percent overall than eighty percent overall with the billing state machine mostly naked.

Second, business rules that people explain with "except when." These are great tests because the weirdness is already in the language.

For example: "A trial can be extended once, except when the account has already paid, unless it was migrated from the legacy plan."

That sentence wants tests. Several of them.

Third, parsers, serializers, mappers, and importers.

Coverage pays off beautifully anywhere data shape matters: C S V imports, webhook payloads, date parsing, currency conversion, address normalization, search indexing, Open Graph extraction, all of it.

These tests are often cheap, stable, and full of edge cases. You get good protection without needing a browser, a queue worker, and half the moon.

[matter-of-fact] Fourth, code with branching logic.

Line coverage hides missed decisions. Branch coverage is better for conditionals because it asks whether both sides of a decision ran.

The coverage dot P Y branch coverage docs show the classic trap: statement coverage can mark a function as covered even when an if statement was never evaluated both ways.

In P H P, PHPUnit documents line, branch, and path coverage separately, with branch coverage checking whether control structures evaluated both true and false. The catch is tooling cost: P C O V is fast for line coverage, while Xdebug is needed for branch and path coverage. Use the heavier signal where the logic deserves it.

Fifth, bugs that already happened.

Every production bug is a free test idea. Not always a unit test, but at least a regression test somewhere.

When a bug escapes, I like this tiny postmortem question: what test would have failed if we had written it yesterday?

If the answer is simple, write that test before moving on.

[conversational tone] Ignoring code is not cheating when the team agrees why it is ignored.

Good candidates include generated code, framework bootstrap files, one-line configuration wrappers, debug-only logging, defensive branches that cannot happen in the current runtime, code that is better deleted than tested, and integration glue already covered by a higher-level smoke test.

Bad candidates include "too hard to test" business logic, old code everyone is afraid to touch, payment, auth, import, or permission paths, branches that look impossible only because nobody has checked production data, and code hidden behind a feature flag but already reachable by customers.

My rule: if we exclude something from coverage, the reason should be boring and defensible in review. "Generated by Open A P I" is boring. "We did not feel like testing checkout" is not.

[matter-of-fact] Examples help.

Most CRUD SaaS apps do not need heroic coverage on every controller branch. They do need strong coverage on permissions, validation, state transitions, background jobs, billing, imports, exports, and anything that can corrupt customer data.

A healthy shape might be high unit coverage on domain services and policies, integration tests for important A P I endpoints, a few end-to-end smoke tests for signup, checkout, core workflow, and cancellation, and coverage gates on changed code, not a sudden demand that the whole legacy app jumps to ninety percent.

For frontend work, line coverage can become silly quickly if you chase every rendering detail. I care more about user-visible states: loading, empty, error, success; disabled and permission-gated actions; optimistic updates and rollback; forms with validation and server errors; and accessibility-critical behavior like focus, labels, and keyboard paths.

The exact shade of a decorative border does not need a unit test. The "delete account" confirmation flow does.

For a public library or S D K, raise the bar. Your edge cases are someone else's production outage.

Test the documented A P I, not just the internals. Include compatibility cases, invalid input, error messages, serialization, version boundaries, and examples copied from the README. If a user can paste it, it should probably be tested.

For a data pipeline or import system, coverage should lean toward fixtures and invariants: malformed rows, missing fields, duplicate I D values, timezone edges, retry and idempotency behavior, partial failure handling, and totals where "this must never decrease."

Here, seventy-five percent line coverage with excellent fixtures can beat ninety-five percent coverage that only tests the happy path.

For Terraform, deployment scripts, queue workers, and one-off operational tools, the best coverage may not be a unit percentage. It may be dry-run mode, shellcheck, static checks, staged rollout, idempotency tests, and very clear logging.

[emphasized] Still, if a script calculates which database rows to delete, test that calculation like it owes you money.

Global coverage is slow to improve and easy to game. Diff coverage is where teams actually get better.

For new and changed code, I like a stricter rule.

Changed risky code should be around ninety percent or more covered. Changed trivial code can be lower if the reviewer can explain why. Overall project coverage should not fall without an explicit reason. Legacy files should get a little cleaner whenever touched.

This is the practical version of the boy-scout rule: do not require a team to fix five years of missing tests before merging a small improvement, but do not let the small improvement make the hole deeper.

Jest supports thresholds globally, by glob, directory, or file, including separate thresholds for branches, functions, lines, and statements.

A TypeScript project might enable coverage, set global thresholds around seventy for branches, seventy-five for functions, and eighty for lines and statements, then set the billing directory to ninety across the board.

The exact numbers matter less than the shape: the risky directory has a higher bar than the rest of the app.

For a P H P project, I usually want fast line coverage locally and deeper branch or path coverage only where it earns its keep. PHPUnit's current coverage docs are explicit that branch and path coverage require Xdebug, while P C O V supports line coverage. That is a trade-off, not a moral failing.

[deliberate] Fast feedback wins during normal development. Deeper coverage belongs in C I or targeted checks when the logic is gnarly.

Line coverage asks: did this line run?

Branch coverage asks: did each decision go both ways?

That second question is usually closer to what we mean by "tested." But branch coverage can still become noisy. Some branches are defensive. Some are artifacts of transpilation. Some are technically possible but irrelevant. Some are expensive to force through a test for very little value.

So yes, use branch coverage for decision-heavy code. Just do not replace one blunt idol with another.

[conversational tone] Mutation testing changes your code in small ways and checks whether your tests fail.

For example, it might turn greater than into greater than or equal, true into false, or plus into minus.

If the tests still pass, the mutant survived. That is a useful insult from the machine.

This catches the classic coverage lie: "the line ran, but nobody asserted the behavior." Infection's P H P docs show exactly this kind of gap with separate mutation score and covered-code mutation score metrics. In JavaScript, Stryker plays a similar role. In J V M land, PIT is the familiar name.

I would not run mutation testing everywhere on day one. It can be slow and noisy. I would run it on billing rules, permission checks, validators, calculators, parsers, code that has high coverage but keeps producing bugs, and libraries where A P I behavior is the product.

Mutation testing is not a replacement for coverage. It is the question you ask after coverage says, "yes, the tests touched this." The mutation tool asks, "cool, but did they care?"

[matter-of-fact] If I were setting this up for a team today, I would write the policy like this.

Coverage is reviewed on the diff. Uncovered changed lines must be either tested or explained.

Risky modules get explicit thresholds. Billing, permissions, data integrity, and core domain logic have higher bars.

Global coverage cannot silently drop. Small decreases need a reason; large decreases block the merge.

Generated and framework code can be excluded. The exclusion must be obvious and documented.

Branch coverage is required for decision-heavy code, especially state machines and important conditionals.

Mutation testing is targeted. Use it where high coverage still does not inspire trust.

Escaped bugs become regression tests. Not always immediately, not always at the same layer, but deliberately.

That policy is stricter than "eighty percent or else" and kinder than "one hundred percent or shame." More importantly, it gives reviewers a decision rule.

[conversational tone] When reviewing a pull request, I would rather leave this comment: "This changes the refund eligibility rule, but the uncovered branch is the trial was extended case. Can we add a regression test for that state?"

Than this: "Coverage is seventy-eight point three percent. Please improve."

The first comment is about risk. The second is about weather.

If you lead a team, do not weaponize coverage. People will optimize for whatever you put on the scoreboard. If the scoreboard says "hit eighty-five percent," you may get shallow tests that hit eighty-five percent.

Use coverage to start better conversations.

Why is this hot file uncovered? Why do production bugs cluster in modules with "good" coverage? Are our tests asserting outcomes or just snapshots? Are integration tests hiding missing unit coverage? Are slow tests forcing people to avoid running the suite? Is this code hard to test because the design is muddy?

The hidden gift of coverage is not the percentage. It is the way uncovered code points at design, ownership, and risk.

[deliberate] So, what is good code coverage?

Good code coverage is enough coverage that an important mistake is likely to hurt in C I before it hurts a user.

For a typical product team, that often means seventy to eighty-five percent overall coverage; ninety percent or more on critical business logic; branch coverage on important decisions; diff coverage for changed code; mutation testing where correctness matters; and intentional exclusions for code that does not deserve the ceremony.

But the real answer is still risk-based.

Cover the code that can hurt you. Cover the code you change often. Cover the behavior you promised. Ignore the number only after you understand what it is trying to warn you about.

The dashboard can be green and still lie. The useful work is making it harder for the product to lie to your users.
