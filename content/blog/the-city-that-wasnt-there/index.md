---
slug: the-city-that-wasnt-there
title: "The City That Wasn't There"
description: "I queried the API for the second-largest entry and got zero results. Not an error — just nothing. What I found when I started digging changed the entire architecture."
meta_description: "A developer's journey through missing data, document parsing, Unicode traps, and the architecture lessons that emerge when your second data source breaks every assumption."
keywords: ["web scraping", "data platform", "document parsing", "reverse engineering", "software architecture", "SOLID principles", "pricing strategy", "startup", "text extraction", "Unicode"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: 4 min
date: "2026-02-08"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "The City That Wasn't There",
    "description": "A developer's journey through missing data, document parsing, Unicode traps, and the architecture lessons that emerge when your second data source breaks every assumption.",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2026-02-08",
    "image": "https://bdteo.com/images/the-city-that-wasnt-there.jpg",
    "keywords": "web scraping, data platform, document parsing, software architecture, startup, text extraction",
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

I built a thing that pulls data from a source, cleans it up, shows it better than the original. Standard work.

Then I queried the second-largest entry in the system. Everything else returned hundreds of results. This one: zero. Not broken. Just empty.

I assumed I screwed up. Checked my code three times. Tested the endpoint directly. The entry exists in their interface. It's just... hollow.

That's when I started digging.

---

The source looked comprehensive. Broad scope, polished interface, clean API. But voluntary participation means holes you can't see from the documentation.

Three competitors had data for the same entities. Full records. So the information exists somewhere.

You weren't missing an endpoint. The endpoint was missing reality.

---

I asked a question nobody thought to ask: where did this data live before the internet?

The answer: printed periodicals. Archives. Analog formats running since the 1800s. Published three times a week. No structured data, just documents on a website.

So I download one. Dense institutional prose, notices buried across sub-offices. The data is there.

My competitors have been doing this manually for thirty years.

I write a scraper in an afternoon. Partly curiosity, partly spite.

---

The document parsing is where things get properly painful.

A single word gets split by a soft hyphen — Unicode U+00AD, invisible to the eye, fatal to every regex. You stare at the screen thinking your pattern is wrong. It's not. There's a ghost character hiding in the text. JavaScript's `\w` doesn't match non-ASCII characters, so ordinary words become impossible matches. Numbers contain phantom spaces from the renderer: "20. 000" instead of "20.000."

Each bug takes longer to find than to fix. That's always the ratio with text extraction — 90% detective work, 10% code.

---

Ten records materialize from the noise. Dates, identifiers, locations — all where they should be. I run it twice to make sure I'm not hallucinating. Same result. It actually works.

---

Parsing shows you what's there. I start looking for what isn't. IDs are sequential. I enumerate them.

53% are dead. The system purges finished entries — no archive, no history. Some records exist but have zero supporting documents. The answer: visit us in person. In 2026.

The source isn't a database. It's a window — and someone keeps closing it.

---

The first data source shaped the architecture. The second one broke every assumption.

I needed a second architecture. Which is a polite way of saying the first one wasn't really an architecture — just a working solution that happened to fit one case. The weird source reveals the truth: you built for the data you had, not the data you'll meet.

I build a proper one this time. Registry pattern, shared interfaces, base contracts that let each implementation stay true to itself.

The architecture is better because I waited. If I'd built it on day one, I would have designed for the only source I knew. The second one — the weird one — forced me to find what actually matters.

You can't design for the unknown. But you can refactor when it arrives.

---

The architecture taught me how to build. The market taught me what to build for.

I'm entering a market with an incumbent that's run for thirty years. Their tech looks like 2005. Their moat isn't technology — it's trust, brand recognition, decades of accumulated data.

The modern competitor launched three years ago with AI and sleek UI. Undercut the incumbent. Three years later, the incumbent still dominates. Turns out cheaper doesn't automatically mean better positioned.

Anchoring matters: the first price becomes the reference point. Easy to lower later, nearly impossible to raise. The subscription isn't the product — it's the gate to what's behind it.

I price high. I can always come down.

---

Four lessons, condensed:

1. **Authoritative doesn't mean complete.** The primary source was missing an entire segment. The data existed — just not where anyone expected.
2. **The second source reveals your architecture.** You only learn the truth about your design when something refuses the shape you built.
3. **Data isn't permanent.** If you need it, save it. The source won't.
4. **Price for what you're becoming, not what you are.** The subscription is a door. Build what's behind it.

The interesting work lives in the gaps. That's where I live too.
