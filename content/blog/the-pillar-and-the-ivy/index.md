---
title: "The Pillar and the Ivy"
date: "2026-04-26T12:00:00.000Z"
description: "A small picture for the computer science underdog. The textbook is not lying. It is just missing the ivy."
featuredImage: "./images/featured.jpg"
imageCaption: "A weathered fieldstone gatepost in dawn mist. The ivy climbs. The post does not care."
imagePosition: "center"
---

Discrete maths is full of small things that look obvious. That is the trap.

You sit in the lecture. The professor draws something on the board. *An invariant is a property P that holds at every checkpoint of an operation.* You write it down, you shrug, you go and have a coffee. And then ten years later you are debugging a distributed system at 2am... and only then the word starts to mean something to you.

This is for the version of you that is still in the lecture.

## A pillar in a field

Picture an old stone pillar standing alone in a field. Nothing around it. Nothing happening to it.

That is what the textbook definition gives you. Just the pillar.

## The professor forgot the ivy

My professor was great, by the way. The textbook is not lying. The picture is just incomplete.

So now grow ivy on the pillar. Vines pulling on the stone. Birds nesting. A tourist with a marker. A small earthquake. A storm. Two hundred years of weather.

The pillar is still there. From its perspective, nothing happened.

*That* is the invariant.

Now read the textbook line again — *a property P that holds at every checkpoint of an operation*. The pillar is the property. The ivy is the operation. The checkpoint is the moment you walk past and look. *Holds* is just a long way of saying *the pillar does not care about the ivy*.

## Where you will keep meeting it

Once you have the pillar, you start to see it everywhere.

A loop invariant. Your loop body is the ivy. Your invariant is the pillar. The body can break it for one moment, like a vine pulling on the stone. By the next checkpoint, the pillar is back where it was.

A database transaction. Between BEGIN and COMMIT, the data can do gymnastics. ROLLBACK is the gardener who comes and rips the ivy off. The pillar — your consistent state — is still standing.

ACID. Foreign keys. Type systems. Distributed retries. All pillars. All standing in their own ivy.

## A pillar you can hug

A small bonus, since you are still reading.

There is a sibling concept called **idempotency**. An idempotent operation is something you can do many times and the result is the same as doing it once. Calling ROLLBACK ten times is the same as calling it once. Setting a light switch to "on" ten times is the same as setting it once.

If invariance is *the pillar that does not change while the ivy goes wild*, then idempotency is *the pillar you can hug as many times as you want, and it does not mind*.

Put the two together and you have the gold standard for fault-tolerant systems. Network drops? Retry. Server crashes? Retry. You will end up in a valid state, and you can keep retrying without breaking anything.

A pillar that survives the ivy *and* survives being hugged a thousand times. Most modern infrastructure is quietly built on this.

## A small ending

That is the picture I wish someone had drawn for me ten years ago.

It is not much. One image. But sometimes one image is the difference between a concept that lives in your bones and a concept that lives in a footnote.

If you are a student, or a junior engineer, or just someone who has been quietly nodding at the word "invariant" for a while now... this is for you.

The pillar does not care about the ivy. That is the whole thing.

From one underdog to another.
