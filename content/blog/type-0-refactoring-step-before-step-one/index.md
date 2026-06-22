---
title: "Type 0 Refactoring: Make Code Understandable Before Changing Behavior"
date: "2025-12-13T12:00:00.000Z"
description: "Type 0 refactoring is the behavior-preserving step before a real code change: make messy code understandable, testable, and reviewable without cleanup theater."
tags: ["refactoring", "software engineering", "debugging", "maintainability"]
featuredImage: "./images/featured.webp"
imageCaption: "Mise en place. The work before the work."
audioUrl: "/audio/articles/type-0-refactoring-step-before-step-one/UzI1NsMEV3ni5JRkRSls-eb6ba9add4a4.m4a"
audioDuration: "18:36"
audioVoice: "Alistair (ElevenLabs cultured British)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/type-0-refactoring-step-before-step-one.md"
---

There is a kind of refactoring teams do all the time, usually under pressure, usually without naming it.

You open the file where the bug lives. The method is too long. The names are tired. The branches are stacked like old chairs in a basement. You can feel, physically, that making the requested change inside this shape of code is a bad idea.

But you are not ready to redesign it.

You are not trying to introduce a new abstraction.

You are not trying to prove you are the clean-code person in the room.

You are trying to make the current behavior understandable enough that the next change can be made safely.

I call that **Type 0 refactoring**.

Or, less memorably but more precisely:

> Type 0 refactoring is the behavior-preserving cleanup you do before changing behavior, so the code becomes readable, testable, and reviewable.

It is the step before step one.

Not the real remodel. The clearing of the workbench. The labeling of the cables. The act of making the thing legible before you put your hands inside it.

## Why Type 0 deserves a name

[Martin Fowler defines refactoring](https://refactoring.com/) as changing the internal structure of code without changing its external behavior. That precision matters. If behavior changes, it may still be valuable work, but it is not refactoring in the strict sense.

Type 0 is narrower than that.

Normal refactoring might improve design. Type 0 might not.

Normal refactoring might move responsibilities between classes. Type 0 should not.

Normal refactoring might create better domain boundaries. Type 0 stops earlier: it makes the existing code say what it already does.

That sounds modest until you are staring at a 900-line method during a hotfix and your brain has started buffering.

The immediate problem in ugly code is often not architecture. It is **understandability**. You cannot safely change what you cannot hold in your head.

Sonar's [Cognitive Complexity](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) work is useful here because it separates "how many paths exist?" from "how hard is this for a human to follow?" Type 0 is aimed at the second question. It reduces the amount of state, branching, naming ambiguity, and visual noise a reviewer has to simulate mentally.

That is not cosmetic. That is risk reduction.

## The moment that made the concept click

The name came out of a hotfix.

The bug was not intellectually deep. The surrounding method was. It was the kind of method where every local variable looked innocent until you realized it was carrying meaning from three screens ago. Every conditional was survivable in isolation, but the combination made the execution path feel unstable.

I did not need a beautiful design.

I needed debuggability:

- fewer branches per screen
- names that described business intent instead of temporary mechanics
- smaller chunks I could step through
- a way to review the cleanup without also reviewing the bug fix

An LLM suggested several reasonable "types" of refactoring. Extract this service. Introduce that pattern. Split responsibilities. All fine ideas. All too much for the moment.

It asked if it should start with Type 1.

I said: no, start with Type 0.

Meaning: before we improve the design, make the current code readable without changing what it does.

That distinction saved the work. The method became navigable. The bug became visible. The fix stayed small.

## A working definition

**Type 0 refactoring is a constrained, behavior-preserving pass that makes code easier to understand before a functional change.**

It has four allowed moves:

1. Extract meaningful pieces into named methods or local variables.
2. Rename things so the code uses human language instead of archaeology.
3. Remove noise that is provably unused.
4. Add or tighten characterization tests around the behavior you are about to preserve.

And it has three hard boundaries:

- no new product behavior
- no architecture moves
- no "while I am here" improvements that change the review question

If the PR changes what users, callers, jobs, API responses, database writes, emitted events, or error paths observe, it is no longer Type 0. That may still be the right work, but it needs to be named honestly.

## Before and after: the shape of Type 0

Here is a small example. It is intentionally ordinary. Most useful refactoring is ordinary.

Before:

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

This is not terrible code. That is important. Type 0 is not only for disasters.

But imagine you need to change trial eligibility. Which rule are you changing? Which one is manual policy? Which one is billing history? Which one is plan eligibility? A reviewer has to infer all of that from mechanics.

After a Type 0 pass:

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

This is not a new design. It does not introduce a policy object. It does not decide whether trial eligibility belongs in another module. It does not make the rules more elegant.

It does one thing: it gives the existing behavior names.

Now the next PR can say, "Change `hasPaidBeforeOrActiveTrial` so expired paid subscriptions are treated differently," and the reviewer is no longer spelunking through anonymous conditionals.

That is Type 0 doing its job.

## The dangerous part: even "just extraction" can change behavior

Type 0 sounds safe because it is small. It is safer, not safe by magic.

Extraction can change behavior if you are careless about:

- evaluation order
- short-circuiting
- variable scope
- mutation
- exception timing
- repeated calls to time, random, IO, caches, or database queries
- references that used to point to the same object

This is where Type 0 needs discipline.

Do not rewrite a condition because the rewritten version is "equivalent." Equivalence is where bugs wear a little mustache and walk past security.

Prefer this:

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}
```

Over this:

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  const paidBefore = account.invoices.some((invoice) => invoice.status === "paid");
  const activeTrial = account.trials.some((trial) => trial.endsAt > new Date());

  return paidBefore || activeTrial;
}
```

The second version looks nicer, but it no longer preserves short-circuit behavior. If `account.invoices` already proves the answer, the old code never touched `account.trials` or `new Date()`. Maybe that does not matter. Maybe it does. Type 0 does not ask the reviewer to guess.

When in doubt, extract first, beautify later, and keep each step boring enough that a tired human can verify it.

## The safety net: characterization before confidence

If the code is already well tested, good. Run the focused tests before and after the Type 0 pass.

If it is not, resist the urge to say, "This is only cleanup."

That sentence has launched a thousand regressions.

Michael Feathers' _Working Effectively with Legacy Code_ is still the book I think of here; the [O'Reilly overview](https://www.oreilly.com/library/view/working-effectively-with/0131177052/) frames it around changing legacy systems without rewriting everything. In practice, the useful move is often a small characterization test: capture what the code currently does for the path you are about to touch.

Not what it should do.

What it does.

Example:

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

That test may be philosophically unsatisfying. It may encode behavior you intend to change five minutes from now.

Fine. Delete or update it in the behavior-changing PR.

For the Type 0 PR, its job is humble: prove that the cleanup did not smuggle in the real change.

## When to reach for Type 0

Use Type 0 when the next change is blocked by understandability.

Good signals:

- you keep rereading the same method and losing the thread
- the file has one "main" method that mixes validation, branching, IO, formatting, and persistence
- a one-line bug fix requires explaining six unrelated facts
- reviewers keep arguing about style because the intent is not visible
- the code is correct enough to run the business, but too muddy to change confidently
- you need to add tests, but the current shape gives you nowhere clean to observe behavior

Avoid Type 0 when:

- the functional change is already obvious and safe
- you cannot explain exactly which behavior must remain unchanged
- the cleanup requires touching many callers across the system
- the team is trying to sneak a redesign through a "cleanup" label
- there is no near-term change that benefits from the clarity

That last one matters. Cleanup without a customer often turns into taste. Type 0 has a customer: the next change.

## A Type 0 decision rule

Here is the rule I use:

> If I cannot write the behavior-changing diff in a way that a reviewer can understand quickly, I probably need Type 0 first.

Not always. But often enough.

You can also phrase it as three questions:

1. What behavior am I about to change?
2. What current behavior must stay exactly the same?
3. What small readability pass would make both answers obvious in the diff?

If question three has a small answer, do Type 0.

If it has a huge answer, you may be looking at real refactoring, not Type 0. Split the work, make a plan, and stop pretending it is harmless.

## How to structure the PR

Type 0 works best when it is reviewable as its own thing.

If the cleanup is tiny, put it in the first commit of the functional PR:

1. `Type 0: name existing trial eligibility checks`
2. `Fix expired subscription trial eligibility`

If the cleanup is large enough to make the behavior diff hard to see, open a separate PR.

Use boring PR language:

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

This gives reviewers the right job.

They are not reviewing whether the product logic is better. They are reviewing whether the code still does the same thing more legibly.

Good review comments for Type 0 sound like:

- "This extraction changes when `new Date()` is evaluated. Can we keep the old short-circuit behavior?"
- "The new name says `active subscription`, but the predicate treats `past_due` as active too. Can the name match the actual behavior?"
- "This deleted helper looks unused in this package, but is it referenced by reflection/config?"
- "Can we add one characterization test for the path this cleanup exposes?"

Less useful comments sound like:

- "Can we turn this into a strategy?"
- "This whole module should be event-driven."
- "While you are here, can you fix the weird billing edge case?"

Those may be good ideas. They are not Type 0 review.

## How Type 0 differs from cleanup theater

Cleanup theater is work that looks virtuous in a diff but does not lower risk for the next change.

It usually has one of these smells:

- broad formatting churn across files nobody is about to touch
- renames based on personal taste rather than domain clarity
- moving code into new abstractions before anyone can state the current behavior
- deleting "unused" code without proving the runtime cannot reach it
- mixing cleanup with a behavior change so reviewers cannot tell which line did what
- a PR description that says "misc cleanup"

Type 0 is different because it is accountable.

It says:

- here is the behavior we are preserving
- here is the path we are making understandable
- here is the next change this enables
- here is how we checked that cleanup did not change behavior

That is the difference between tidying and engineering.

## Type 0 and legacy seams

Sometimes Type 0 reveals that the next safe move is a seam.

Fowler's note on [legacy seams](https://martinfowler.com/bliki/LegacySeam.html) is useful because it describes places where we can redirect, observe, or test behavior without editing the source at the point of behavior. In a legacy system, a seam can be the difference between "we can test this" and "we are hoping very professionally."

But creating a seam can cross the Type 0 boundary.

Extracting a method so the current flow is named:

```ts
const shippingCost = await calculateShipping(order);
```

to:

```ts
const shippingCost = await calculateShippingForOrder(order);
```

That can be Type 0 if behavior stays the same.

Changing the function signature so tests can inject a fake shipping provider:

```ts
const shippingCost = await calculateShippingForOrder(order, shippingProvider);
```

That may be the right move, but it is no longer merely making the existing code understandable. It changes the collaboration surface. Treat it as dependency-breaking refactoring and review it with that level of care.

Type 0 can point to the seam. It does not have to create the whole testing architecture in the same PR.

## A practical Type 0 checklist

Before opening the PR:

- [ ] I can name the behavior-changing work this cleanup prepares for.
- [ ] The PR does not intentionally change user-visible or caller-visible behavior.
- [ ] Extracted methods preserve evaluation order and short-circuit behavior.
- [ ] Names describe what the code actually does, not what I wish it did.
- [ ] Deleted code is proven unused in the relevant runtime, not merely unpopular.
- [ ] I ran focused tests or replayed the scenario that matters.
- [ ] If tests were missing, I added characterization coverage for the touched path.
- [ ] The PR description tells reviewers this is Type 0 and what is out of scope.

During review:

- [ ] Ask "does this preserve behavior?" before "do I prefer this design?"
- [ ] Push behavior changes into a follow-up commit or PR.
- [ ] Keep architecture ideas as notes unless they are required for safety.
- [ ] Be suspicious of clever equivalence.

After merge:

- [ ] Make the real change while the mental model is fresh.
- [ ] Delete or update characterization tests only when the behavior intentionally changes.
- [ ] Do not let Type 0 become a parking lot for eternal cleanup.

## The promise

Type 0 refactoring is a small promise:

> I am making this code easier to change without changing what it does.

That promise is useful precisely because it is limited.

It gives the developer permission to improve the work surface without starting an architecture debate. It gives the reviewer a clear standard. It gives the next PR a fighting chance of being about the actual product change.

Sometimes the bravest thing you can do in a messy codebase is not to redesign it.

Sometimes it is to make the current mess tell the truth first.
