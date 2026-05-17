[matter-of-fact] Wash One More Plate: A Simple Rule for a Perpetually Clean Codebase

The short version is this.

Treat every change to your codebase like cooking a meal.

You will dirty some plates.

[deliberate] When you are done, wash not just the plates you used. Wash one more.

Over time, that tiny surplus of care compounds into a kitchen, or a codebase, that stays clean instead of decaying into chaos.

The metaphor: cooking, plates, and code.

[reflective] Picture a professional kitchen. Every dish cooked dirties a few plates, even in the tidiest brigade.

Now imagine that after finishing their dish, each cook washes exactly the plates they dirtied. The kitchen will hover on the edge of acceptable cleanliness, but entropy will creep in. A bit of leftover grime here. A stained cutting board there. Eventually, the mess compounds.

Now flip the rule.

After cooking, each chef washes one more plate than they dirtied.

[gently] Slowly, the kitchen becomes cleaner than before. Not just maintained, but improved.

The same applies to software. Every task you pick up should add at least a tiny surplus of cleanliness to the codebase.

One more test. A clearer name. One function split. A dead dependency removed.

[emphasized] That plus-one plate habit is how a codebase stays healthy.

I call this the Wash One More Plate Rule.

Echoes from the craft.

[conversational tone] This is not a lonely philosophy. Thought leaders across software have preached similar ideas for decades.

The classic Boy Scout Rule says to always leave the campground cleaner than you found it. Robert C. Martin helped popularize that idea in software. It is the same spirit: improve a little, every time.

Ward Cunningham's technical debt metaphor says debt accrues interest. Ignore it, and the kitchen costs more to use tomorrow. Paying some of it down as you go keeps you solvent.

[matter-of-fact] Martin Fowler talks about refactoring as small, continuous steps: changes that preserve behavior but improve design. Small steps mean low risk and steady momentum.

Kent Beck's mantra is: make it work, make it right, make it fast. Correctness first, then cleanliness, then performance. Washing that extra plate lives in the make it right phase, before you prematurely optimize.

Andrew Hunt and David Thomas applied broken windows theory to code. Visible mess invites more mess. Fixing a window before it spreads protects the neighborhood, or in this case, the codebase.

All of these ideas reinforce one another.

[reflective] They are all saying: do not pass mess forward. Take a moment to make it better.

Why the extra plate matters, even when you are busy.

First, entropy is real.

[deliberate] Left unattended, code does not stay neutral. Naming drifts. Patterns fragment. Abstractions rot.

Entropy is a force. The only counter-force is constant, incremental tidying.

Your plus-one plate is micro-entropy reversal.

Second, debt compounds faster than you think.

The cost of change grows with every, we will fix it later.

[flatly] Later rarely comes.

Interest payments show up as slowed feature work, brittle deployments, and test suites that nobody trusts.

[emphasized] Washing an extra plate today lowers the interest rate tomorrow.

Third, there is a social signal.

When teammates see you clean up after yourself, and then some, the norm shifts.

It becomes credible, and expected, to leave code better than you found it.

[matter-of-fact] Culture follows behavior.

Fourth, this is about momentum, not perfectionism.

[conversational tone] This is not an excuse for yak shaving. You are not rebuilding the kitchen during service.

You are flicking the sponge over one more dish. Small, safe, and fast.

That is the key to keeping delivery on track.

How to practice the Wash One More Plate Rule.

[deliberate] Start by adopting micro-refactoring as part of your definition of done.

Rename a confusing variable.

Extract a small function to reduce cyclomatic complexity.

Delete dead code or unused imports.

Add a missing test for a bug you just fixed.

Update a documentation or README section that scared you for a minute.

The criterion is simple.

[stress on next word] If it takes more than a few minutes, it is not a plate. It is the whole dishwasher.

Defer it. Capture it as a ticket.

Use pull requests as a cleaning trigger.

Every pull request can leave the campsite cleaner.

[matter-of-fact] Add a short note about what you cleaned. Encourage reviewers to request small tidy-ups alongside their review. Celebrate pull requests that include that extra polish. Shout-outs in standup go a long way.

Automate the easy plates.

Use pre-commit hooks for formatting and linting. Use static analysis to flag complex methods or long parameter lists. Use dependency checkers for outdated libraries.

[gently] Let automated brooms sweep trivial messes so humans can focus on logic and design.

Embed it in team norms.

Add the rule to your team's working agreement or engineering handbook. Track micro-refactor wins in retros if you want measurable proof. Pair or mob program occasionally to spread the habit, and the courage.

[deliberate] Know when not to wash.

Sometimes the kitchen is on fire. Production is down, or a demo is hours away.

In emergencies, smash the stack of dirty plates if you must. But circle back after the crisis.

[emphasized] The rule is not dogma. It is discipline.

The boundary: one plate, not the sink.

[matter-of-fact] Scope creep masquerades as craftsmanship.

Your job is to stop at one more plate.

If that small refactor reveals a deeper smell, write it down and move on.

Parking-lot the deeper fix. Create a refactor or tech debt ticket. Link it to the relevant code, tests, or module. Add a short note on why it matters.

[reflective] You have done your duty. You spotted the mess, washed a plate, and left instructions for the rest.

An example: turning a messy function into one you can test.

[conversational tone] Imagine an order processing function that does everything in one place.

It checks whether the order has an ID. It calculates VAT differently for Bulgaria and Germany. It has lots more branching. It sends email, writes to the database, and calls the payment gateway.

[deadpan] That function is not just doing work. It is hiding work.

One plate you can wash is to extract the VAT calculation into a small pure function.

The function takes a country and a total, and returns the VAT amount. Bulgaria gets twenty percent. Germany gets nineteen percent. Everything else gets zero.

Now the main process order function calls that VAT helper instead of inlining the tax logic.

You can add a micro-test for the helper.

[matter-of-fact] That is one extra plate: simple, contained, and helpful.

Final thoughts.

[reflective] One more plate is tiny.

That is the point.

You do not need heroic refactors to keep a codebase healthy. You need a culture of small, consistent care.

Make it a habit. Bake it into your process.

[gently] In a year, you may wonder why your kitchen is not a disaster.

Because you never let it become one.

[deliberate] Next time you touch a file, ask yourself: which extra plate can I wash before I commit this change?

Then do it.

Repeat.

[emphasized] Change culture, one spotless plate at a time.

[matter-of-fact] Further reading lives in the same family of ideas: the Boy Scout Rule, Ward Cunningham on technical debt, Martin Fowler on refactoring, Kent Beck on make it work, make it right, make it fast, and The Pragmatic Programmer on broken windows in software.
