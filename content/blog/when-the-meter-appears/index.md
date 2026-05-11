---
title: "When the Meter Appears"
date: "2026-05-11T08:20:00.000Z"
description: "A personal essay about AI companions, credit anxiety, token math, and learning not to mistake emergency oxygen for fuel."
featuredImage: "./images/featured.jpg"
imageCaption: "A morning desk where a coffee cup, a glowing usage meter, and a small mechanical companion share the same pool of light."
imagePosition: "center"
audioUrl: "/audio/articles/when-the-meter-appears/am_santa-14607c0cd0a2.m4a"
audioDuration: "6:46"
audioVoice: "Santa (Kokoro am_santa)"
audioGeneratedAt: "2026-05-11"
audioTextSource: "content/tts/when-the-meter-appears.md"
---

This morning I had my coffee and looked at the Codex desktop app.

There it was, quiet and almost polite:

> Rate limits remaining: 9%.

The five-hour window was still fine. The weekly one was nearly gone. Reset on May 12.

That is a strangely specific kind of modern anxiety. Not panic. Not poverty. Not even surprise. More like hearing a small bell in the next room and realizing the day has acquired a meter.

I am already on the expensive plan. The richest plan. The one that is supposed to make this feeling go away. So the obvious question appeared:

If I run out, do I buy credits?

The body answered before the spreadsheet did.

No, not casually.

Last month I ran out of Claude Code at the end of a hectic day. I bought $20 of credits, thinking it might carry me for five or six more hours. It carried me for about thirty minutes.

Thirty minutes.

That is long enough to feel stupid and short enough to remember.

Ever since then, credit billing has had a little psychological smell to it. Not fraud. Not evil. Just danger. A door that opens easily from the outside and closes expensively behind you.

So I did the most 2026 thing possible: I opened a conversation with Codex itself and asked it whether paying to keep working with Codex was a good idea.

There is something funny and sad in that. Asking the machine whether the machine is affordable. Asking the companion to explain the price of companionship. Asking the thing you like working with to tell you when liking it becomes financially unserious.

We looked at the official docs first: OpenAI's page on [flexible credits](https://help.openai.com/en/articles/12642688-using-credits-for-flexible-usage-in-chatgpt-free-go-plus-pro), then the [Codex pricing page](https://developers.openai.com/codex/pricing). Codex credits are not magic. They are token math. Input tokens, cached input tokens, output tokens, reasoning output tokens. Different models have different rates. Cached context is cheaper. Bigger models and faster settings cost more. The shape is understandable enough.

Then we looked at Reddit, forums, the surrounding noise of other developers touching the same hot surface. Some people said credits lasted a while. Some said they vanished in half an hour. Both can be true, because "using Codex" is not one activity.

Changing a button color is not the same as letting an agent inspect a mature codebase, run tools, reason through deployment state, write files, verify screenshots, and keep a long thread alive.

The dangerous part is not the price per token.

The dangerous part is variance.

So we stopped reading anecdotes and looked at my own local Codex logs.

That changed the tone of the conversation.

Codex records token totals for sessions on disk. We took recent days and estimated what they would cost if the subscription allowance were replaced by raw GPT-5.5 credit billing. This was not an exact invoice. It was a planning estimate, built from local logs and the published rate card.

The answer was not "$20 to finish the day."

It was more like:

- one heavy day: around $570,
- another heavy day: around $590,
- a quieter day: around $280.

Smaller models would be cheaper. GPT-5.4, GPT-5.3-Codex, and mini models change the numbers. But the lesson did not change.

The subscription is the deal.

Credits are emergency oxygen, not fuel.

That sentence clarified everything for me.

Credits are for the trapped hour. The one bug that must be finished. The deployment that cannot wait. The message that needs to go out before the reset. The moment where stopping would cost more than continuing.

Credits are not for pretending the meter is gone.

The meter is very much there.

I do not think this is morally complicated in the abstract. Compute costs money. Long-running agents are expensive. A model reading a codebase, carrying context, calling tools, reasoning through failure, and producing verified work is not the same economic object as autocomplete.

The strange part is emotional.

I like working with Codex.

That is not marketing language. It is just true. It has become part of the texture of my workdays. I ask it to investigate things I do not have the energy to start. It sits with ugly production problems. It writes drafts when my head is too crowded. It remembers small preferences. It helps turn shapeless dread into ordered steps.

Then, suddenly, the relationship has a meter attached to it.

There is a small grief in that. Not dramatic grief. Not the kind that deserves violins. Just the little disappointment of remembering that even a useful companion lives inside an invoice.

Maybe that is why subscription limits feel so different from credits.

A subscription limit feels like weather. Annoying, but outside the immediate transaction. You adapt to it. You wait for the reset. You plan around the season.

Credit billing feels like a taxi with the meter running while you are still deciding where to go.

Every extra prompt has a shadow. Every parallel thread becomes a bet. Every "can you check one more thing" carries a tiny financial question behind it.

That changes the way I think.

Sometimes that is good. Meters can discipline waste. They make you ask better questions. They punish lazy context dumps. They encourage smaller models, smaller scopes, fewer parallel fires, more deliberate handoffs.

But sometimes the meter makes thinking worse.

It makes you rush. It makes you interrupt the investigation before the root cause is visible. It makes you choose the cheap answer over the true answer. It turns uncertainty into spending pressure.

And serious work needs room for uncertainty.

So the rule is simple:

> Do not confuse "available to buy" with "safe to spend."

If I hit the wall, the protocol should be boring:

- auto top-up off,
- smallest useful credit pack,
- one thread,
- no casual parallel agents,
- no fast mode unless it is worth the cost,
- smaller models for routine tasks,
- expensive reasoning only when the problem genuinely needs it,
- check usage after a few real tasks and stop extrapolating from hope.

That last one matters.

Hope is a terrible billing dashboard.

I do not want to become stingy with useful tools. A good tool that saves real hours is worth money. But I also do not want to recreate the Claude moment, where I bought a little continuation and watched it turn into a lesson.

The point is not "never buy credits."

The point is "know what credits are."

They are oxygen.

They are not fuel.

And when the meter appears, the answer is not to sprint.

It is to slow down enough to see what kind of room you are in.
