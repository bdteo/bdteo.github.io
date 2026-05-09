The City That Wasn't There.

I built a thing that pulls data from a source, cleans it up, and shows it better than the original. Standard work.

Then I queried the second-largest entry in the system. Everything else returned hundreds of results.

This one: zero.

Not broken. Just empty.

I assumed I screwed up. Checked my code three times. Tested the endpoint directly. The entry exists in their interface. It is just hollow.

That is when I started digging.

The source looked comprehensive. Broad scope, polished interface, clean API. But voluntary participation means holes you cannot see from the documentation.

Three competitors had data for the same entities. Full records. So the information exists somewhere.

You were not missing an endpoint. The endpoint was missing reality.

I asked a question nobody thought to ask: where did this data live before the internet?

The answer: printed periodicals. Archives. Analog formats running since the eighteen hundreds. Published three times a week. No structured data, just documents on a website.

So I downloaded one.

Dense institutional prose. Notices buried across sub-offices. The data is there.

My competitors have been doing this manually for thirty years.

I wrote a scraper in an afternoon. Partly curiosity, partly spite.

The document parsing is where things get properly painful.

A single word gets split by a soft hyphen. Unicode U plus zero zero A D. Invisible to the eye, fatal to every regular expression.

You stare at the screen thinking your pattern is wrong.

It is not.

There is a ghost character hiding in the text.

JavaScript's word-character matcher does not match non-ASCII characters, so ordinary words become impossible matches. Numbers contain phantom spaces from the renderer: twenty, space, zero zero zero, instead of twenty thousand.

Each bug takes longer to find than to fix. That is always the ratio with text extraction: ninety percent detective work, ten percent code.

Then ten records materialize from the noise.

Dates. Identifiers. Locations. All where they should be.

I run it twice to make sure I am not hallucinating.

Same result.

It actually works.

Parsing shows you what is there. Then I start looking for what is not.

IDs are sequential, so I enumerate them.

Fifty-three percent are dead. The system purges finished entries. No archive. No history.

Some records exist but have zero supporting documents. The answer is: visit us in person.

In twenty twenty six.

The source is not a database. It is a window, and someone keeps closing it.

The first data source shaped the architecture. The second one broke every assumption.

I needed a second architecture. Which is a polite way of saying the first one was not really an architecture. It was just a working solution that happened to fit one case.

The weird source reveals the truth: you built for the data you had, not the data you will meet.

I build a proper one this time. Registry pattern. Shared interfaces. Base contracts that let each implementation stay true to itself.

The architecture is better because I waited. If I had built it on day one, I would have designed for the only source I knew.

The second one, the weird one, forced me to find what actually matters.

You cannot design for the unknown. But you can refactor when it arrives.

The architecture taught me how to build. The market taught me what to build for.

I am entering a market with an incumbent that has run for thirty years. Their tech looks like two thousand five. Their moat is not technology. It is trust, brand recognition, and decades of accumulated data.

The modern competitor launched three years ago with AI and sleek UI. They undercut the incumbent.

Three years later, the incumbent still dominates.

Turns out cheaper does not automatically mean better positioned.

Anchoring matters. The first price becomes the reference point. Easy to lower later, nearly impossible to raise.

The subscription is not the product. It is the gate to what is behind it.

I price high. I can always come down.

Four lessons, condensed.

First: authoritative does not mean complete. The primary source was missing an entire segment. The data existed, just not where anyone expected.

Second: the second source reveals your architecture. You only learn the truth about your design when something refuses the shape you built.

Third: data is not permanent. If you need it, save it. The source will not.

Fourth: price for what you are becoming, not what you are. The subscription is a door. Build what is behind it.

The interesting work lives in the gaps.

That is where I live too.
