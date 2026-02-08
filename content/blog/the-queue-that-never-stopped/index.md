---
slug: the-queue-that-never-stopped
title: "The Queue That Never Stopped"
description: "Redis memory kept climbing. Horizon showed green. Twenty-nine email classes were retrying forever and nobody noticed."
meta_description: "How a known Laravel Horizon bug causes queued Mailables to retry infinitely when maxTries is null, and why your queue might be silently eating your Redis memory."
keywords: ["laravel", "horizon", "queue", "redis", "mailable", "infinite retry", "bug", "php"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: 3 min
date: "2026-02-07"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "The Queue That Never Stopped",
    "description": "How a known Laravel Horizon bug causes queued Mailables to retry infinitely when maxTries is null, and why your queue might be silently eating your Redis memory.",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2026-02-07",
    "image": "https://bdteo.com/images/the-queue-that-never-stopped.jpg",
    "keywords": "laravel, horizon, queue, redis, mailable, infinite retry, bug, php",
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

Emails were failing. That part was expected — broken SMTP credentials during a migration. What wasn't expected: they never stopped failing.

---

Horizon dashboard: green. Workers: healthy. Redis: slowly growing. No alerts, no errors in the logs. Just a quiet accumulation of jobs that kept trying and trying and trying.

I only noticed because Redis memory didn't come back down after fixing the SMTP config. Something was still in there, chewing through retries. Thousands of them.

---

I assumed the queue would handle it. That's the deal: a job fails, retries a few times, lands in `failed_jobs`. You move on.

Unless the job is a Mailable.

When you dispatch a Mailable to a queue, Laravel wraps it in a job. That job's `maxTries` comes from the Mailable's `$tries` property. If you don't set it — and why would you, the docs barely mention it — it serializes as `null`.

Null doesn't mean "use the supervisor default." Null means "no limit." Horizon sees null and thinks: this job wants to retry forever. So it does.

---

Turns out it's a known bug. <a href="https://github.com/laravel/horizon/issues/1346" target="_blank" rel="noopener noreferrer">Laravel Horizon issue #1346</a>. The supervisor's `--tries` flag gets ignored when the serialized job payload carries `maxTries: null`. The job's own declaration wins, and its declaration says: never stop.

Twenty-nine Mailable classes. Every single one without an explicit `$tries` property. Every single one potentially immortal.

---

The fix is almost insulting in its simplicity:

```php
class WelcomeEmail extends Mailable implements ShouldQueue
{
    public int $tries = 2;
    public int $maxExceptions = 2;
}
```

Two properties. Twenty-nine files. That's it.

One initial attempt, one retry, then `failed_jobs`. The way I assumed it always worked.

---

I test it the way you'd test a mousetrap. Break the SMTP config on purpose. Dispatch one email. Watch Horizon. Two attempts. Failed job. Done. No ghosts in the queue.

Then I fix the other twenty-eight.

---

Three lessons, condensed:

1. **Null is not "default."** In serialized job payloads, null maxTries means unlimited. Your supervisor config is a suggestion, not a rule.
2. **Green dashboards lie.** Horizon showed healthy workers happily processing jobs that would never finish.
3. **Framework defaults are not always sane.** Laravel doesn't set `$tries` on Mailables. You have to. The docs won't warn you until you already have a fire.

The scariest bugs are the ones that look like normal operation. This one did — for weeks.
