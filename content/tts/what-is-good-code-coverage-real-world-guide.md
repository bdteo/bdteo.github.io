[conversational tone] What Is Good Code Coverage? My Real-World Guide to Stopping Bugs Without Wasting Engineering Time

Every time I run npm run coverage or phpunit coverage, the same question pops up.

[reflective] Okay. Seventy-four percent. Is that enough?

The software dev blogosphere shouts: one hundred percent or nothing.

[matter-of-fact] Meanwhile, LaunchDarkly politely reminds me that one hundred percent executed does not mean one hundred percent tested.

I have spent weeks chasing the shiny metric, and more weeks debugging other issues.

[deliberate] This is the field-tested middle ground I have settled on.

Why one hundred percent coverage is a mirage.

In theory, one hundred percent line execution means no hidden bugs.

[matter-of-fact] In practice, there are three problems.

First: diminishing returns. Going from ninety percent to ninety-five percent can double your test suite for a single-digit risk reduction.

Second: false confidence. A test that calls a function without an assertion still counts as covered.

Third: business reality. Every extra test is time not spent on features your customers asked for.

The aerospace people can aim for one hundred percent. It is life or death.

[deliberate] For the rest of us, around eighty percent is the eighty-twenty line. That is where most projects cluster after return-on-investment calculations.

TestDevLab calls the useful range seventy to ninety percent for this exact reason.

The practical table I use.

If coverage is one hundred percent, my translation is: we are a library that flies rockets. Accept the grind.

If coverage is above ninety percent, my translation is: this is a library that lots of money depends on. Make that a high-priority module target, not a blanket rule for every corner of the product.

If coverage is around eighty percent, my translation is: ship it, monitor it, and iterate.

If coverage is sixty to seventy percent, use it as a merge gate. Fail the pull request if new code dips you under the agreed line.

If coverage is below fifty percent, that is a weekend of tech debt. Pivot to the critical paths first.

[matter-of-fact] I stole the shape of these numbers from Atlassian's internal guide: sixty percent acceptable, seventy-five percent commendable, ninety percent exemplary.

It works in every retro.

How I hit eighty percent without crying: the TypeScript playbook.

First, use Jest with Istanbul out of the box.

Second, put a coverage gate in continuous integration.

In Jest config, I usually set the global threshold to eighty percent, then raise important core paths to ninety percent.

Third, target user hot paths, not the Redux boilerplate logger.

[emphasized] Coverage is not a trophy. It is a flashlight. Point it where bugs hurt.

How I hit eighty percent in Laravel: the PHP playbook.

First, install PCOV for speed during development, and use Xdebug for branch data in continuous integration.

Second, use PHPUnit with a filter that includes your source directory, so uncovered files count.

Third, care more about mutation score than line count. Infection is the tool I use to catch lines that are covered but not really tested.

[deliberate] That distinction matters. A line can be executed and still be meaningless if no assertion would fail when the behavior breaks.

Four rules my team lives by.

Rule one: new code equals tests.

Diff coverage should be at least ninety percent before merge.

Rule two: refactor first, test second.

Untestable code is already debt.

Rule three: fail the build, not the humans.

Lower the gate by five percent every year rather than breaking teams with red dashboards.

Rule four: measure bugs in production.

[matter-of-fact] If coverage is eighty-five percent but incidents spike, coverage is not the culprit. Assertions are.

The short version, for executives and recruiters too.

Do not ask me for a magic number.

[stress on next word] Ask which parts of the product cannot break.

Cover those to ninety percent.

Give the rest healthy smoke tests.

[deliberate] Use code coverage as a spotlight, not a finish line.

Trust the bugs you catch, not the numbers you boast.

Let the coverage dashboard be green. Your customers will never see it, but their error bar will stay empty.

[conversational tone] End of rant. Back to the editor.
