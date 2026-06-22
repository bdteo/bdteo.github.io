[reflective] Type Zero Refactoring: make code understandable before changing behavior.

There is a kind of refactoring teams do all the time, usually under pressure, usually without naming it.

You open the file where the bug lives. The method is too long. The names are tired. The branches are stacked like old chairs in a basement. You can feel, physically, that making the requested change inside this shape of code is a bad idea.

But you are not ready to redesign it. You are not trying to introduce a new abstraction. You are not trying to prove you are the clean-code person in the room.

[gently] You are trying to make the current behavior understandable enough that the next change can be made safely.

I call that Type Zero refactoring.

Or, less memorably but more precisely: Type Zero refactoring is the behavior-preserving cleanup you do before changing behavior, so the code becomes readable, testable, and reviewable.

It is the step before step one.

Not the real remodel. The clearing of the workbench. The labeling of the cables. The act of making the thing legible before you put your hands inside it.

[deliberate] Why Type Zero deserves a name.

Martin Fowler defines refactoring as changing the internal structure of code without changing its external behavior. That precision matters. If behavior changes, it may still be valuable work, but it is not refactoring in the strict sense.

Type Zero is narrower than that.

Normal refactoring might improve design. Type Zero might not. Normal refactoring might move responsibilities between classes. Type Zero should not. Normal refactoring might create better domain boundaries. Type Zero stops earlier: it makes the existing code say what it already does.

That sounds modest until you are staring at a nine hundred line method during a hotfix and your brain has started buffering.

[matter-of-fact] The immediate problem in ugly code is often not architecture. It is understandability. You cannot safely change what you cannot hold in your head.

Sonar's work on Cognitive Complexity is useful here because it separates "how many paths exist?" from "how hard is this for a human to follow?" Type Zero is aimed at the second question. It reduces the amount of state, branching, naming ambiguity, and visual noise a reviewer has to simulate mentally.

That is not cosmetic. That is risk reduction.

[reflective] The name came out of a hotfix.

The bug was not intellectually deep. The surrounding method was. It was the kind of method where every local variable looked innocent until you realized it was carrying meaning from three screens ago. Every conditional was survivable in isolation, but the combination made the execution path feel unstable.

I did not need a beautiful design. I needed debuggability.

I needed fewer branches per screen. I needed names that described business intent instead of temporary mechanics. I needed smaller chunks I could step through. And I needed a way to review the cleanup without also reviewing the bug fix.

An LLM suggested several reasonable types of refactoring. Extract this service. Introduce that pattern. Split responsibilities. All fine ideas. All too much for the moment.

It asked if it should start with Type One.

[emphasized] I said: no, start with Type Zero.

Meaning: before we improve the design, make the current code readable without changing what it does.

That distinction saved the work. The method became navigable. The bug became visible. The fix stayed small.

[deliberate] A working definition.

Type Zero refactoring is a constrained, behavior-preserving pass that makes code easier to understand before a functional change.

It has four allowed moves.

First, extract meaningful pieces into named methods or local variables. Second, rename things so the code uses human language instead of archaeology. Third, remove noise that is provably unused. Fourth, add or tighten characterization tests around the behavior you are about to preserve.

And it has three hard boundaries: no new product behavior, no architecture moves, and no "while I am here" improvements that change the review question.

If the pull request changes what users, callers, jobs, API responses, database writes, emitted events, or error paths observe, it is no longer Type Zero. That may still be the right work, but it needs to be named honestly.

[conversational tone] Here is a small before-and-after example. It is intentionally ordinary. Most useful refactoring is ordinary.

Imagine a function that decides whether an account can start a trial. In the original version, one function checks five things inline. It returns false if the account is missing or deleted. It returns false if the account has a trial blocked flag. It returns false if there is an active subscription. It returns false if the account has paid before or already has an active trial. It returns false if the plan is free or hidden. Otherwise, it returns true.

This is not terrible code. That is important. Type Zero is not only for disasters.

But imagine you need to change trial eligibility. Which rule are you changing? Which one is manual policy? Which one is billing history? Which one is plan eligibility? A reviewer has to infer all of that from mechanics.

After a Type Zero pass, the top-level function still checks the same things, in the same order, but each condition has a name. Is the account missing or deleted? Is it manually blocked from trial? Does it have an active subscription? Has it paid before or does it have an active trial? Is the plan ineligible for trial?

[matter-of-fact] This is not a new design. It does not introduce a policy object. It does not decide whether trial eligibility belongs in another module. It does not make the rules more elegant.

It does one thing: it gives the existing behavior names.

Now the next pull request can say, "Change the paid-before-or-active-trial rule so expired paid subscriptions are treated differently," and the reviewer is no longer spelunking through anonymous conditionals.

That is Type Zero doing its job.

[deliberate] The dangerous part is that even "just extraction" can change behavior.

Type Zero sounds safe because it is small. It is safer, not safe by magic.

Extraction can change behavior if you are careless about evaluation order, short-circuiting, variable scope, mutation, exception timing, repeated calls to time, random values, input and output, caches, database queries, or references that used to point to the same object.

This is where Type Zero needs discipline.

Do not rewrite a condition because the rewritten version is "equivalent." Equivalence is where bugs wear a little mustache and walk past security.

In the trial example, keep the paid-invoice check and the active-trial check in one short-circuiting expression if that is what the old code did. Do not eagerly compute a paid-before variable and an active-trial variable just because it looks nicer. The second version touches the trials collection and calls the clock even when the invoice check already proved the answer.

Maybe that does not matter. Maybe it does. Type Zero does not ask the reviewer to guess.

When in doubt, extract first, beautify later, and keep each step boring enough that a tired human can verify it.

[reflective] The safety net is characterization before confidence.

If the code is already well tested, good. Run the focused tests before and after the Type Zero pass.

If it is not, resist the urge to say, "This is only cleanup."

That sentence has launched a thousand regressions.

Michael Feathers' Working Effectively with Legacy Code is still the book I think of here. In practice, the useful move is often a small characterization test: capture what the code currently does for the path you are about to touch.

Not what it should do. What it does.

For example, if blocked accounts currently cannot start a trial, write a focused test that builds a blocked account and confirms the trial check returns false.

That test may be philosophically unsatisfying. It may encode behavior you intend to change five minutes from now.

Fine. Delete it or update it in the behavior-changing pull request.

For the Type Zero pull request, its job is humble: prove that the cleanup did not smuggle in the real change.

[matter-of-fact] Reach for Type Zero when the next change is blocked by understandability.

Use it when you keep rereading the same method and losing the thread. Use it when a file has one main method that mixes validation, branching, input and output, formatting, and persistence. Use it when a one-line bug fix requires explaining six unrelated facts. Use it when reviewers argue about style because the intent is not visible. Use it when the code is correct enough to run the business, but too muddy to change confidently. Use it when you need to add tests, but the current shape gives you nowhere clean to observe behavior.

Avoid Type Zero when the functional change is already obvious and safe. Avoid it when you cannot explain exactly which behavior must remain unchanged. Avoid it when the cleanup requires touching many callers across the system. Avoid it when the team is trying to sneak a redesign through a cleanup label. And avoid it when there is no near-term change that benefits from the clarity.

That last one matters. Cleanup without a customer often turns into taste. Type Zero has a customer: the next change.

[deliberate] Here is the decision rule I use.

If I cannot write the behavior-changing diff in a way that a reviewer can understand quickly, I probably need Type Zero first.

Not always. But often enough.

You can also phrase it as three questions.

What behavior am I about to change? What current behavior must stay exactly the same? What small readability pass would make both answers obvious in the diff?

If the third question has a small answer, do Type Zero.

If it has a huge answer, you may be looking at real refactoring, not Type Zero. Split the work, make a plan, and stop pretending it is harmless.

[conversational tone] Type Zero works best when it is reviewable as its own thing.

If the cleanup is tiny, put it in the first commit of the functional pull request. For example: first, "Type Zero: name existing trial eligibility checks." Second, "Fix expired subscription trial eligibility."

If the cleanup is large enough to make the behavior diff hard to see, open a separate pull request.

Use boring pull request language. Say that the pull request is Type Zero only. Say the intent is to make the existing path readable before changing the rules, while preserving current behavior. Say what changed: extracted top-level eligibility checks, renamed temporary variables to match domain terms, removed one unused private helper. Say how it was validated: existing tests pass, and characterization coverage was added for blocked, paid-before, and active-trial accounts. Say what is out of scope: changing trial rules or moving the logic into a policy object.

This gives reviewers the right job.

They are not reviewing whether the product logic is better. They are reviewing whether the code still does the same thing more legibly.

Good review comments for Type Zero sound like this: this extraction changes when the clock is called; can we keep the old short-circuit behavior? The new name says active subscription, but the predicate treats past-due as active too; can the name match the actual behavior? This deleted helper looks unused in this package, but is it referenced by reflection or config? Can we add one characterization test for the path this cleanup exposes?

Less useful comments sound like this: can we turn this into a strategy? This whole module should be event-driven. While you are here, can you fix the weird billing edge case?

Those may be good ideas. They are not Type Zero review.

[matter-of-fact] Cleanup theater is work that looks virtuous in a diff but does not lower risk for the next change.

It usually has one of these smells: broad formatting churn across files nobody is about to touch; renames based on personal taste rather than domain clarity; moving code into new abstractions before anyone can state the current behavior; deleting unused code without proving the runtime cannot reach it; mixing cleanup with a behavior change so reviewers cannot tell which line did what; or a pull request description that says "misc cleanup."

Type Zero is different because it is accountable.

It says: here is the behavior we are preserving. Here is the path we are making understandable. Here is the next change this enables. Here is how we checked that cleanup did not change behavior.

That is the difference between tidying and engineering.

[reflective] Sometimes Type Zero reveals that the next safe move is a seam.

Fowler's note on legacy seams is useful because it describes places where we can redirect, observe, or test behavior without editing the source at the point of behavior. In a legacy system, a seam can be the difference between "we can test this" and "we are hoping very professionally."

But creating a seam can cross the Type Zero boundary.

Renaming a shipping calculation call so the current flow has a clearer name can be Type Zero if behavior stays the same.

Changing that function signature so tests can inject a fake shipping provider may be the right move, but it is no longer merely making the existing code understandable. It changes the collaboration surface. Treat it as dependency-breaking refactoring and review it with that level of care.

Type Zero can point to the seam. It does not have to create the whole testing architecture in the same pull request.

[deliberate] Before opening a Type Zero pull request, run the practical checklist in plain English.

Can I name the behavior-changing work this cleanup prepares for? Does the pull request avoid intentional user-visible or caller-visible behavior changes? Do extracted methods preserve evaluation order and short-circuit behavior? Do names describe what the code actually does, not what I wish it did? Is deleted code proven unused in the relevant runtime, not merely unpopular? Did I run focused tests or replay the scenario that matters? If tests were missing, did I add characterization coverage for the touched path? Does the pull request description tell reviewers this is Type Zero and what is out of scope?

During review, ask "does this preserve behavior?" before "do I prefer this design?" Push behavior changes into a follow-up commit or pull request. Keep architecture ideas as notes unless they are required for safety. Be suspicious of clever equivalence.

After merge, make the real change while the mental model is fresh. Delete or update characterization tests only when the behavior intentionally changes. Do not let Type Zero become a parking lot for eternal cleanup.

[reflective] Type Zero refactoring is a small promise.

I am making this code easier to change without changing what it does.

That promise is useful precisely because it is limited.

It gives the developer permission to improve the work surface without starting an architecture debate. It gives the reviewer a clear standard. It gives the next pull request a fighting chance of being about the actual product change.

Sometimes the bravest thing you can do in a messy codebase is not to redesign it.

[gently] Sometimes it is to make the current mess tell the truth first.
