---
slug: the-model-that-wasnt-there
title: "The Model That Wasn't There"
description: "Google topped every benchmark. YouTube videos, conferences, seminars. The best image generation model in the world. Then I tried to use it."
meta_description: "How Google's Gemini image generation tops every leaderboard but is hard-capped at 2 requests per minute - and what that tells you about the economics of autoregressive image generation."
keywords: ["gemini", "google", "image generation", "vertex ai", "rate limiting", "ai economics", "autoregressive", "production", "api"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: 4 min
date: "2026-03-14"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "The Model That Wasn't There",
    "description": "How Google's Gemini image generation tops every leaderboard but is hard-capped at 2 requests per minute - and what that tells you about the economics of autoregressive image generation.",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2026-03-14",
    "image": "https://bdteo.com/images/the-model-that-wasnt-there.jpg",
    "keywords": "gemini, google, image generation, vertex ai, rate limiting, ai economics, autoregressive",
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

We were generating ad images with Gemini 3 Pro. Ranked #4 on the Artificial Analysis leaderboard. The quality was genuinely impressive - better prompt adherence, better typography, better creative output than anything else we'd tried. Google was everywhere with it. YouTube videos. Conferences. Seminars. Blog posts. "The best image generation model in the world."

I believed them. The images were good.

---

Then a user reported that cloning an ad took four minutes. I checked. The generation itself finished in under thirty seconds. The other three and a half minutes? The job was retrying against a wall.

429. Resource Exhausted.

---

Google had hard-capped Gemini image generation at two requests per minute. Per project. Globally.

Two. Not two hundred. Not twenty. Two.

We'd generated 900 images the day before without a problem. Something changed on their end. No notice, no email, no changelog entry. Just a new ceiling that was low enough to hit with two users clicking at the same time.

---

Our DevOps submitted a quota increase request. Thirty RPM. Reasonable for a production SaaS. The response from Google:

> "This gemini model is not available for quota increase."

They suggested we switch to Imagen 4. I looked it up.

Imagen 4 Ultra - ranked #10. Imagen 4 Standard - #42. Imagen 4 Fast - #60.

We were on #4. Google's suggestion was a downgrade of somewhere between six and fifty-six places on their own leaderboard.

---

I tried everything I could think of.

Switch to Gemini 3.1 Flash - ranked #2, half the cost, better than what we had. Deployed to staging. Then I checked the quota. Same 2 RPM cap. It's not per-model. It's per-project, per-base-model-family. Every Gemini image model shares the same bucket.

Multi-region distribution - the quota is per-region, so spreading requests across five regions would give us ten RPM. Except Gemini 3.x image models only work on the global endpoint. There are no regional endpoints. The 2 RPM on the global endpoint is the only bucket that exists.

Multiple GCP projects - each gets its own 2 RPM. Technically works. Architecturally, this is what desperation looks like.

---

I started researching what other developers were experiencing. Same story everywhere. Undocumented 2 RPM limit. Forum posts with no Google response. Approved quota increases that still returned 429 on every call. Our $30K monthly GCP spend? Doesn't help. Standard PayGo tiers explicitly exclude image generation models from throughput benefits.

Google is not going to raise this limit.

---

And then the interesting question: why not?

Gemini generates images through the same autoregressive transformer that handles text. It's not a diffusion model. It's the full LLM, reasoning its way pixel by pixel through an image. Every image burns the same compute as dozens of text API calls.

At $0.067 per image, Google is almost certainly losing money on every generation. The 2 RPM cap isn't a quota they forgot to adjust. It's a calculated throttle because the economics don't work.

Imagen 4 uses classic latent diffusion - orders of magnitude cheaper to run. That's why it gets 30-150 RPM and Google is pushing everyone toward it. The expensive model gets the marketing. The cheap model gets the throughput.

---

Think about what this means. Google built a model that topped every benchmark. They marketed it at every conference, every YouTube keynote, every developer blog. "State of the art. Best in the world." Developers integrate it into production. Users depend on it. Then: two requests per minute, no increase available, use our worse model instead.

The API exists. The endpoint works. The demo is stunning.

But you can't actually use it.

---

We switched to `gemini-2.5-flash-image`. The older model. The boring one. The one nobody makes YouTube videos about.

It has 40 RPM. It works.

---

Four lessons, condensed:

1. **Marketing is not a product.** Topping a leaderboard doesn't mean you can serve production traffic. Benchmarks measure quality. Rate limits measure commitment.
2. **Autoregressive image generation doesn't scale.** When generating one image costs as much as a hundred text queries, no business model survives generous rate limits. The economics are the tell.
3. **Preview means preview.** Google can change limits, kill models, or redirect you to inferior alternatives with no notice. If your production system depends on a preview model, your production system depends on someone else's marketing schedule.
4. **The boring model works.** The one with 40 RPM and no conference talks will serve your users while the world-class model sits behind a velvet rope generating two images a minute.

The scariest vendor lock-in is the one that starts with a demo you can't resist.
