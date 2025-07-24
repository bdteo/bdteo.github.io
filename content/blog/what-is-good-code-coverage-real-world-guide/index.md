---
title: "What Is “Good” Code Coverage? A Real-World Guide"
date: "2025-07-15"
description: "Debunking the 100 % myth: I break down proven coverage targets for TypeScript and PHP, show the ROI of testing, and share tooling tricks I use daily."
tags: ["code-coverage", "testing", "typescript", "php", "best-practices", "quality-assurance"]
featuredImage: "./images/featured.jpg"
imageCaption: "80 % coverage ≠ 80 % quality — here’s why"
---

# What Is “Good” Code Coverage? My Real-World Guide to Stopping Bugs Without Wasting Engineering Time

Every time I run `npm run coverage` or `phpunit --coverage`, the same question pops up:

> _“Okay… 74 %. Is that enough?”_

The software dev blogosphere shouts “100 % or nothing!” Meanwhile, <a href="https://launchdarkly.com/blog/code-coverage-what-it-is-and-why-it-matters/" target="_blank">launchdarkly.com</a> politely reminds me that 100 % executed ≠ 100 % tested.  
I’ve spent weeks chasing the shiny metric and more weeks debugging _other_ issues. This is the field-tested middle ground I’ve settled on.

---

## Why 100 % Coverage Is a Mirage

In theory, 100 % line execution means “no hidden bugs.” In practice:

* Diminishing returns: 90 %→95 % often doubles your test suite for single-digit risk reduction.  
* False confidence: a test that calls a function without an assertion **still counts** as covered.  
* Business reality: every extra test is time **not** spent on features your customers asked for.

The aerospace guys can aim for 100 %—it’s life or death. For the rest of us, **~80 % is the 80/20 line**. That’s where most projects cluster after ROI calculations. <a href="https://www.testdevlab.com/blog/why-is-high-test-coverage-important" target="_blank">testdevlab.com</a> calls the range 70–90 % for this exact reason.

---

## The Practical Table I Use

| Coverage | My Translation | Action |
|---------|------------------|--------|
| 100 % | “We’re a library that flies rockets” | Accept the grind. |
| 90 % + | “Library that lots of money depends on” | High-priority module only. |
| 80 % | Ship it, monitor, then iterate. |
| 60–70 % | Merge gate—fail the PR if new code dips you under. |
| < 50 % | Weekend of tech debt—pivot to critical paths first. |

I stole these numbers from <a href="https://www.atlassian.com/continuous-delivery/software-testing/code-coverage" target="_blank">Atlassian’s internal guide</a>: 60 % “acceptable,” 75 % “commendable,” 90 % “exemplary.” Works in every retro.

---

## How I Hit 80 % Without Crying (TypeScript playbook)

1. Jest + Istanbul out of the box  
2. **Coverage gate in CI**  
   in `jest.config.js` I add:  
   ```js
   coverageThreshold: {
     global: 80,
     '**/src/core/**': 90
   }
   ```  
3. Target the user hot paths, not the Redux boilerplate logger.

---

## How I Hit 80 % in Laravel (PHP playbook)

1. Install PCOV for speed on dev, Xdebug for branch data in CI.  
2. PHPUnit + these defaults in `phpunit.xml`:  
   ```xml
   <filter>
     <whitelist processUncoveredFiles="true">
       <directory suffix=".php">./src</directory>
     </whitelist>
   </filter>
   ```  
3. Mutation score > line count via <a href="https://infection.github.io/" target="_blank">Infection</a>—that’s how I spot “covered but not really tested” lines.

---

## 4 Rules My Team Lives By

1. **New code = tests.** Diff coverage ≥ 90 % before merge.  
2. **Refactor first, test second.** Untestable code is already debt.  
3. **Fail the build, not the humans.** Lower gate by 5 % every year rather than breaking teams with red dashboards.  
4. **Measure bugs in production**—if coverage is 85 % but incidents spike, **coverage** isn’t the culprit; **assertions** are.

---

## TL;DR (for execs and recruiters too)

Don’t ask me for a “magic number.” Ask:  
> Which parts of the product can’t break?

Cover **those** to 90 %. Give the rest healthy smoke tests. Use code coverage as a **spotlight**, not a finish line, and trust the bugs you **catch**, not the numbers you **boast**.

Let the coverage dashboard be green—your customers will never see it, but their error bar will stay empty.  

*— End of rant, back to the editor.*
