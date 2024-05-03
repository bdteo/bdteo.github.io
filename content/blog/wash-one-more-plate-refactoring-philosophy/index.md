---
slug: wash-one-more-plate-refactoring-philosophy
title: "Wash One More Plate: A Simple Rule for a Perpetually Clean Codebase"
description: "A practical software development philosophy inspired by the Boy Scout Rule: always leave the code cleaner than you found it—wash one more plate. Learn why micro‑refactoring matters and how to apply it without derailing delivery."
meta_description: "A practical software development philosophy inspired by the Boy Scout Rule: always leave the code cleaner than you found it—wash one more plate. Learn why micro‑refactoring matters and how to apply it without derailing delivery."
keywords: ["Boy Scout Rule", "technical debt", "refactoring", "clean code", "software entropy", "broken windows theory", "Ward Cunningham", "Robert C. Martin", "Martin Fowler", "Kent Beck", "software craftsmanship"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: 9 min
date: "2025-07-24"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Wash One More Plate: A Simple Rule for a Perpetually Clean Codebase",
    "description": "A practical software development philosophy inspired by the Boy Scout Rule: always leave the code cleaner than you found it—wash one more plate.",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2025-07-24",
    "image": "https://bdteo.com/images/wash-one-more-plate.jpg",
    "keywords": "Boy Scout Rule, technical debt, refactoring, clean code, software entropy",
    "publisher": {
      "@type": "Organization",
      "name": "Boris's Blog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bdteo.com/static/images/logo.png"
      }
    }
  }
featuredImage: "./images/featured.jpg"
---

> **TL;DR**: Treat every change to your codebase like cooking a meal. You will dirty some plates. When you’re done, wash not just the plates you used—wash *one more*. Over time, that tiny surplus of care compounds into a kitchen (codebase) that stays clean rather than decays into chaos.

---

## The Metaphor: Cooking, Plates, and Code

Picture a professional kitchen. Every dish cooked dirties a few plates—even in the tidiest brigade. Now imagine that after finishing their dish, each cook washes *exactly* the plates they dirtied. The kitchen will hover on the edge of acceptable cleanliness, but entropy will creep in: a bit of leftover grime here, a stained cutting board there. Eventually, the mess compounds.

Now flip the rule: after cooking, each chef washes **one more plate than they dirtied**. Slowly, the kitchen becomes cleaner than before—not just maintained, but improved. The same applies to software: every task you pick up should add at least a tiny surplus of cleanliness to the codebase—one more test, a clearer name, one function split, a dead dependency removed. That “+1 plate” habit is how a codebase *stays* healthy.

I call this **the Wash One More Plate Rule**.

## Echoes from the Craft: You’re in Good Company

This isn’t a lonely philosophy. Thought leaders across software have preached similar ideas for decades:

*   **“Always leave the campground cleaner than you found it.”** That’s the classic [Boy Scout Rule](https://deviq.com/principles/boy-scout-rule/) popularized in software by Robert C. Martin. It’s the same spirit: improve a little, every time.
*   **Technical debt as a metaphor** (Ward Cunningham): debt accrues interest—ignore it and the "kitchen" costs more to use tomorrow. Paying some of it down as you go keeps you solvent.
*   **Refactoring as small, continuous steps** (Martin Fowler): tiny changes that preserve behavior but improve design. Small steps mean low risk and steady momentum.
*   **“Make it work, make it right, make it fast”** (Kent Beck): correctness first, then cleanliness, then performance. Washing that extra plate lives in the "make it right" phase—before you prematurely optimize.
*   **Broken windows theory applied to code** (Andrew Hunt & David Thomas): visible mess invites more mess. Fixing a “window” before it spreads protects the neighborhood (the codebase).

These ideas reinforce one another. They’re all saying: *don’t pass mess forward; take a moment to make it better.*

## Why the Extra Plate Matters (Even When You’re Busy)

### 1. **Entropy is Real**

Left unattended, code does not stay neutral. Naming drifts, patterns fragment, abstractions rot. Entropy is a force; the only counter-force is constant, incremental tidying. Your +1 plate is micro-entropy reversal.

### 2. **Debt Compounds Faster Than You Think**

The cost of change grows with every “we’ll fix it later.” Later rarely comes. Interest payments manifest as slowed feature work, brittle deployments, and test suites that nobody trusts. Washing an extra plate *today* lowers the interest rate tomorrow.

### 3. **The Social Signal**

When teammates see you clean up after yourself (and then some), the norm shifts. It becomes credible—and expected—to leave code better than you found it. Culture follows behavior.

### 4. **Momentum, Not Perfectionism**

This is not an excuse for yak shaving. You’re not rebuilding the kitchen mid-service. You’re flicking the sponge over one more dish—small, safe, and fast. That’s key to keeping delivery on track.

## How to Practice the Wash-One-More-Plate Rule

Here’s how to embed the habit without derailing scope or deadlines.

### 1. Adopt “Micro-Refactoring” as a Definition of Done

*   Rename a confusing variable.
*   Extract a small function to reduce cyclomatic complexity.
*   Delete dead code or unused imports.
*   Add a missing test for a bug you just fixed.
*   Update documentation or a README section that scared you for a minute.

The criterion: **If it takes more than a few minutes, it’s not a plate—it’s the whole dishwasher. Defer it.** Capture it as a ticket.

### 2. Use Pull Requests as a Cleaning Trigger

Every PR can leave the campsite cleaner:

*   Require a “What did you clean?” checkbox or short note.
*   Encourage reviewers to *request* small tidy-ups alongside their review.
*   Celebrate PRs that include that extra polish (shout-outs in standup go a long way).

### 3. Automate the Easy Plates

*   Pre-commit hooks for formatting and linting.
*   Static analysis to flag complex methods or long parameter lists.
*   Dependency checkers for outdated libraries.

Let automated brooms sweep trivial messes so humans can focus on logic and design.

### 4. Embed It in Team Norms

*   Add the rule to your team’s working agreement or engineering handbook.
*   Track micro-refactor wins in retros if you want measurable proof.
*   Pair or mob program occasionally to spread the habit (and the courage).

### 5. Know When **Not** to Wash

Sometimes the kitchen’s on fire: production is down, or a demo is hours away. In emergencies, smash the stack of dirty plates if you must. But circle back after the crisis. The rule isn’t dogma; it’s discipline.

## The Boundary: One Plate, Not the Sink

Scope creep masquerades as craftsmanship. Your job is to stop at “one more plate.” If that small refactor reveals a deeper smell, write it down and move on. Parking-lot the deeper fix:

*   Create a ticket labeled `refactor:` or `techdebt:`.
*   Link it to the relevant code, tests, or module.
*   Add a short note on why it matters.

You’ve done your duty: you spotted the mess, washed a plate, and left instructions for the rest.

## Example: Turning a Messy Function Into One You Can Test

Before:

```php
function processOrder($order) {
    if(!$order->id) throw new Exception('No ID');
    $tax = 0;
    if ($order->country === 'BG') {
        $tax = $order->total * 0.20;
    } else if ($order->country === 'DE') {
        $tax = $order->total * 0.19;
    }
    // Lots more branching...
    // Sends email, writes to DB, calls payment gateway…
}
```

Plate washed:

```php
/**
 * Calculate VAT for an order based on country.
 * Pure function: given (total, country) -> VAT amount.
 */
function vatFor(string $country, float $total): float {
    return match($country) {
        'BG' => $total * 0.20,
        'DE' => $total * 0.19,
        default => 0.0,
    };
}
```

Now your main function calls `vatFor()` instead of inlining logic. You added a micro-test for `vatFor()`. That’s one extra plate—simple, contained, helpful.

## Final Thoughts

One more plate is tiny. That’s the point. You don’t need heroic refactors to keep a codebase healthy; you need a culture of small, consistent care. Make it a habit, bake it into your process, and in a year you’ll wonder why your kitchen *isn’t* a disaster—because you never let it become one.

---

**Call to Action**: Next time you touch a file, ask yourself: *"Which extra plate can I wash before I commit this change?"* Then do it. Repeat. Change culture, one spotless plate at a time.

### Sources & Further Reading

*   **Robert C. Martin (“Uncle Bob”) – Boy Scout Rule:** “[The Boy Scout Rule](https://97-things-every-x-should-know.gitbooks.io/97-things-every-programmer-should-know/content/en/thing_08/)” from *97 Things Every Programmer Should Know*.
*   **Ward Cunningham – Technical Debt Metaphor:** Cunningham’s original explanation of [Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html) on Martin Fowler’s site.
*   **Martin Fowler – Continuous Micro-Refactoring:** Fowler’s book, [*Refactoring: Improving the Design of Existing Code*](https://martinfowler.com/books/refactoring.html).
*   **Kent Beck – “Make it work, make it right, make it fast”:** An explanation of the mantra by [Ron Jeffries](https://ronjeffries.com/articles/-x024/biot/-bv40/3/).
*   **Andrew Hunt & David Thomas – Broken Windows in Software:** The concept is detailed in their book, [*The Pragmatic Programmer*](https://en.wikipedia.org/wiki/The_Pragmatic_Programmer).
*   **Software Entropy & Maintenance:** A good read on the topic is “[Entropy in Software and the Broken Window Theory](https://chroniclesofapragmaticprogrammer.substack.com/p/entropy-in-software-and-the-broken-window).”
