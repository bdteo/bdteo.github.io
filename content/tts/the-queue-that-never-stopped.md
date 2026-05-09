---
title: "The Queue That Never Stopped"
source: "content/blog/the-queue-that-never-stopped/index.md"
voice: "am_santa"
---

Emails were failing. That part was expected. The SMTP credentials were broken during a migration.

What was not expected was that the emails never stopped failing.

Horizon looked calm. The workers were healthy. The dashboard was green. Redis, however, kept growing slowly in the background.

There were no dramatic errors in the logs. No obvious red screen. Just thousands of failed mail jobs quietly trying again, and again, and again.

I only noticed because Redis memory did not come back down after the SMTP configuration was fixed. Something was still alive in there, chewing through retries.

At first, I assumed the queue would handle it. That is supposed to be the deal. A job fails, retries a few times, lands in the failed jobs table, and everyone moves on.

Unless the job is a Laravel Mailable.

When Laravel queues a Mailable, it wraps it in a job. That job gets its max tries value from the Mailable itself. If the Mailable does not define a tries property, that value becomes null.

And in this case, null did not mean, use the supervisor default.

Null meant, no limit.

Horizon saw a serialized job payload with max tries set to null, and interpreted that as permission to retry forever. The supervisor configuration did not win. The job payload did.

That is the nasty little twist. A green dashboard can still be happily processing work that will never truly finish.

The bug was already known in Laravel Horizon. The fix, at least, was almost insultingly small.

Every queued Mailable needed to explicitly define its retry behavior. In this case, two tries, and two maximum exceptions.

One initial attempt. One retry. Then the job fails for real and lands where it belongs.

There were twenty-nine Mailable classes. All of them were missing that tiny declaration. All of them could become immortal under the wrong failure condition.

I tested the fix like a trap. Break the SMTP configuration on purpose. Dispatch one email. Watch Horizon. First attempt. One retry. Failed job. Done.

No quiet accumulation. No Redis leak pretending to be normal queue work.

The lessons are simple.

First, null is not always default. In serialized queue payloads, null can mean unlimited.

Second, dashboards can lie by telling the truth too narrowly. The workers were healthy. They were just doing the wrong thing forever.

Third, framework defaults are not always the defaults you think you are using. If a queued Mailable matters, give it an explicit retry policy.

The scariest bugs are the ones that look like normal operation.

This one did. For weeks.
