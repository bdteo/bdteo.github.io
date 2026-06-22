---
title: "Discrete Representations in RL: Why Engineers Should Care"
date: "2024-07-15"
slug: "discrete-representations-reinforcement-learning-insights"
author: "Boris D. Teoharov"
description: "A practical guide to discrete representations in reinforcement learning: how tokens, codebooks, and categorical latents help AI agents learn, compress, and adapt."
tags: ["Artificial Intelligence", "Reinforcement Learning", "Discrete Representations", "World Models", "AI Agents"]
featuredImage: "./images/featured.jpg"
imageCaption: "A fanned arc of plain cards on dark cloth. A hand lifts one from the finite set."
audioUrl: "/audio/articles/discrete-representations-reinforcement-learning-insights/UzI1NsMEV3ni5JRkRSls-08283c41d5e9.m4a"
audioDuration: "17:27"
audioVoice: "Alistair (ElevenLabs cultured British)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/discrete-representations-reinforcement-learning-insights.md"
---

An AI system never sees "the world." It sees the representation we give it.

That sounds like a research detail until it bites you in production. Your agent gets a browser screenshot, but the policy does not act on pixels directly. Your LLM receives text, but the model does not read words the way you do. Your robot records continuous sensor values, but its planner needs something stable enough to compare, remember, predict, and improve.

The engineering question is blunt:

Do you let the model live in a continuous soup of decimals, or do you force parts of its world into a finite set of symbols, buckets, tokens, categories, or codebook entries?

That is the practical shape of the discrete representation question.

The topic originally caught my attention through Edan Meyer's work on reinforcement learning, especially the paper [Harnessing Discrete Representations for Continual Reinforcement Learning](https://arxiv.org/abs/2312.01203), later published in the [Reinforcement Learning Journal](https://rlj.cs.umass.edu/2024/papers/Paper84.html). The paper is technical, but the lesson is wonderfully usable: sometimes a model learns faster, adapts better, and builds a better world model when it has to describe observations using a small vocabulary of possible states.

That idea is not trapped inside RL. It rhymes with tokenization in LLMs, vector quantization in generative models, learned codebooks in compression, and the way agent systems increasingly need compact internal state instead of endless raw context.

For a working engineer, the point is this: representation is not just a preprocessing step. It is where you decide what kind of mistakes your system is allowed to make.

## The Plain-English Version

A continuous representation says: "This thing is a point in a smooth space."

A discrete representation says: "This thing belongs to one or more named choices from a finite set."

Neither is automatically better. A continuous vector is expressive. It can carry gradients, shades, interpolations, and fine detail. That is why embeddings are so useful. But continuous spaces can also be mushy. Tiny numeric changes may or may not mean anything. Similar-looking vectors can hide different causal situations. A downstream model has to learn not only what matters, but also where the boundaries are.

A discrete representation draws boundaries.

It turns the question from "what exact real-valued vector comes next?" into something closer to "which state, token, or code comes next?" That changes the learning problem. Prediction can become classification instead of regression. Memory can become symbolic enough to reuse. Compression becomes explicit. A planner can reason over a smaller set of possibilities.

This is why a language model does not operate on raw Unicode essays as an undifferentiated stream. It operates on token IDs. This is why [SentencePiece](https://arxiv.org/abs/1808.06226) and byte-pair-style tokenizers matter. This is why [VQ-VAE](https://arxiv.org/abs/1711.00937) was interesting: it showed that learned discrete codes can be a powerful bottleneck for images, audio, and speech. And this is why world-model RL keeps circling back to categorical latents and codebooks.

The model is not only learning a task. It is learning a vocabulary for the task.

## A Concrete Example

Imagine an agent learning to play a simple game from screen observations.

A continuous latent state might encode the screen as a vector like:

```text
[0.13, -0.72, 1.84, 0.04, ...]
```

That vector can represent a lot. But if the agent is trying to learn transitions, the model must predict how all those floating-point values change after an action. It is easy for capacity to be wasted on details that do not matter: a flickering pixel, a slightly different animation frame, a color shift, a bit of visual noise.

A discrete latent state might instead encode the same situation as:

```text
room=3, enemy_state=alert, key_status=missing, health_bucket=low
```

Or, in a learned system, it might be less human-readable:

```text
[code_18, code_4, code_4, code_71]
```

The learned codes may not have nice names, but the constraint is useful. The agent cannot invent infinitely many subtly different internal states. It has to reuse a finite vocabulary. If the vocabulary is good, the model gets a cleaner handle on the dynamics: when I am in this kind of situation and take that kind of action, these are the likely next kinds of situations.

That is compression, but not merely for file size. It is compression for learning.

## What Edan Meyer's Paper Adds

Meyer, Adam White, and Marlos Machado studied discrete representations in RL across world-model learning, model-free RL, and continual RL. The result that matters most to me is not "discrete beats continuous" as a slogan. That would be too neat, and reality is rarely that polite.

The useful claim is narrower and more interesting:

When the model has limited capacity, discrete representations can help it model more of the useful world. In their experiments, agents using these representations learned better policies with less data, and in continual settings they adapted faster after changes.

That is exactly the setting engineers should care about. We are almost always capacity-limited somewhere. Maybe the model is small. Maybe the data is thin. Maybe the environment changes. Maybe latency budgets force smaller components. Maybe an agent's context window is full of irrelevant history. Maybe the world is too large to model honestly, so the system needs a lossy abstraction it can keep repairing.

The paper also contains a useful warning: the benefit may not come from discreteness as a magical property. The authors point toward sparsity and binarity as likely contributors. In other words, "finite choices" help partly because they impose structure. They make the representation cleaner, more selective, and easier for the downstream learner to use.

That distinction matters. The lesson is not to quantize everything because it sounds clever. The lesson is to ask whether your representation is forcing the right kind of simplification.

## Why This Feels Modern Again

Discrete representations used to sound like a niche RL concern. Now they feel central to half the systems we are building.

LLMs are the obvious example. A model sees token IDs, not prose. The tokenizer decides which pieces of text become atomic units. That choice affects cost, context length, multilingual behavior, weird edge cases, and sometimes reasoning behavior. The [GPT-2 paper](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) is old by today's standards, but it already made the practical point: language modeling is over sequences of symbols. Modern systems are much bigger, but the symbolic bottleneck is still there.

Agent systems have the same issue in a messier form. An agent can keep raw transcripts forever, but that is usually a terrible memory. Useful agents need distilled state: open tasks, known constraints, tool results, current plan, unresolved risks, user preferences, environment facts. That is a discrete-ish representation of a much larger continuous mess. It says: these are the few states worth carrying forward.

World models make the connection even more explicit. A world model tries to learn a compact internal simulator: if I take this action from this state, what happens next? [DreamerV3](https://arxiv.org/abs/2301.04104) is one modern landmark here, showing how powerful it can be to learn behavior by imagining future trajectories inside a learned model. More recent work such as [Discrete Codebook World Models for Continuous Control](https://arxiv.org/html/2503.00653v1) continues to explore how discrete codebooks can help even when the external control problem is continuous.

Compression is the quiet fourth sibling. When you compress, you choose what differences to ignore. A codebook is a contract: many raw inputs map to the same internal code because, for the purpose at hand, they are close enough. That is also what good abstractions do in software. They collapse irrelevant variation so the rest of the system can reason.

The pattern is everywhere:

| System | Raw thing | Discrete-ish bottleneck | Why it helps |
| --- | --- | --- | --- |
| LLM | Text bytes and characters | Tokens | Predictable sequence units, bounded vocabulary, cheaper modeling |
| RL agent | Pixels or sensor streams | Categorical latent state | Cleaner transitions, easier planning, better adaptation |
| World model | Environment history | Learned codes | Smaller internal simulator, less irrelevant detail |
| Agent memory | Full transcript and tool logs | Task/state summaries | Durable context without drowning the model |
| Compression model | Images, audio, video | Codebook entries | Preserve useful structure while discarding noise |

This is why the topic keeps reappearing under different names. Tokenization, quantization, bucketing, classification, learned codebooks, symbolic state, sparse binary features: they are not identical, but they all ask the same engineering question.

What are the units of thought?

## The Trade-Off

Discrete representations are powerful because they throw information away.

That is also why they are dangerous.

A bad tokenizer mangles a language. A bad bucketing scheme erases the signal you needed. A bad learned codebook maps two meaningfully different states into the same code and teaches the policy the wrong lesson. A discrete agent memory can become confidently lossy, preserving a neat summary while dropping the one awkward detail that mattered.

Continuous representations fail differently. They often preserve too much. They let the model carry subtle information forward, but the downstream learner has to discover which dimensions matter. They can be flexible but slippery.

So the practical choice is not "discrete or continuous?" It is:

- Where do I need smoothness?
- Where do I need stable categories?
- Where is noise pretending to be information?
- Where is the model wasting capacity on irrelevant variation?
- Where would a finite vocabulary make prediction, planning, or debugging easier?

If you cannot answer those questions, discreteness may become decoration. If you can answer them, it becomes a design tool.

## A Working Framework

Here is the decision framework I would actually use.

Use a discrete representation when the system needs to repeatedly recognize the same kind of situation under noisy surface variation. Game states, UI states, workflow statuses, failure classes, customer intents, document chunks, tool outcomes, and environment modes all fit this pattern.

Use a discrete representation when the next model is better framed as classification than regression. Predicting "which mode comes next?" can be easier and more robust than predicting an exact floating-point state, especially when the future is multimodal.

Use a discrete representation when you need a durable memory. Agents do not need to remember every token of every observation. They need a compact state that survives long enough to guide the next action.

Be careful with discrete representations when the boundary is arbitrary. If two states are separated only because your implementation needed a bucket, the model may inherit that false distinction. The same problem appears in analytics dashboards all the time: a metric threshold becomes a reality-distortion field.

Be extra careful when the rare case matters. Discrete compression is great at preserving the common structure. It can be brutal to exceptions. In safety, fraud, medical, legal, financial, or security systems, the "tiny detail" may be the point.

## The Engineering Smell

There is a smell I now notice more often:

The model is technically seeing everything, but it cannot use what it sees.

You see this when an agent has a massive context window but still loses the plot. You see it when a policy has high-dimensional observations but cannot adapt after a small environment change. You see it when a classifier gets richer embeddings but fails on simple out-of-distribution variants. You see it when a world model predicts plausible-looking mush instead of useful next states.

In those moments, adding capacity might help. More data might help. A bigger model might help.

But sometimes the missing piece is a better bottleneck.

The system needs to be forced to say: this belongs with that, this difference does not matter, this state has happened before, this action changed the category, this is the part worth remembering.

That is the real value of discrete representations. They make reuse possible.

## What I Like About This Line of Research

I like Meyer's work because it does not treat representation as a philosophical garnish. It puts the choice under experimental pressure. How well does the world model learn? How much data does the policy need? What happens when the environment changes? Does the advantage survive when we move from a clean setup into continual learning?

Those are the right questions.

I also like that the answer is not cartoonishly simple. The paper does not prove that all discrete latents are good. It suggests that useful discrete representations are doing a few things at once: reducing capacity demands, structuring prediction, encouraging sparsity, and giving the learner cleaner handles for adaptation.

That feels true in ordinary engineering too.

Good systems are not raw reality all the way down. They have carefully chosen interfaces. They have enums. They have states. They have event types. They have schemas. They have IDs. They have summaries. They have lossy, useful names for recurring situations.

Machine learning systems need the same discipline. The difference is that some of the interfaces are learned instead of handwritten.

## The Takeaway

Discrete representations matter because intelligence is not only about having a powerful model. It is also about giving the model useful units to think with.

For RL, that can mean world models that learn more useful transitions with less capacity, and agents that adapt faster when the world changes. For LLMs, it shows up in tokenization and context management. For agents, it shows up in memory, planning state, and tool-use traces. For compression and generative models, it shows up in codebooks that preserve the structure worth keeping.

The practical lesson is simple:

When a system struggles, do not only ask whether the model is big enough. Ask whether its representation is kind enough.

Does it collapse the noise? Does it preserve the distinctions that matter? Does it make the next prediction easier? Does it give the agent a reusable vocabulary for the world?

If yes, discreteness is not a limitation. It is a handle.
