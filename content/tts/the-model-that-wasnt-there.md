The Model That Wasn't There.

We were generating ad images with Gemini 3 Pro. Ranked number four on the Artificial Analysis leaderboard.

The quality was genuinely impressive: better prompt adherence, better typography, better creative output than anything else we had tried.

Google was everywhere with it. YouTube videos. Conferences. Seminars. Blog posts.

[reflective] The best image generation model in the world.

[matter-of-fact] I believed them. The images were good.

Then a user reported that cloning an ad took four minutes.

I checked.

The generation itself finished in under thirty seconds.

The other three and a half minutes?

[flatly] The job was retrying against a wall.

Four twenty nine. Resource exhausted.

Google had hard-capped Gemini image generation at two requests per minute.

Per project. Globally.

[deliberate] Two.

Not two hundred. Not twenty. Two.

We had generated nine hundred images the day before without a problem. Something changed on their end.

No notice. No email. No changelog entry.

Just a new ceiling low enough to hit with two users clicking at the same time.

Our DevOps submitted a quota increase request. Thirty requests per minute. Reasonable for a production SaaS.

The response from Google was: this Gemini model is not available for quota increase.

They suggested we switch to Imagen 4.

I looked it up.

[deadpan] Imagen 4 Ultra was ranked number ten. Imagen 4 Standard was number forty-two. Imagen 4 Fast was number sixty.

We were on number four.

Google's suggestion was a downgrade of somewhere between six and fifty-six places on their own leaderboard.

I tried everything I could think of.

First, switch to Gemini 3.1 Flash. It was ranked number two, half the cost, and better than what we had. I deployed it to staging. Then I checked the quota.

Same two requests per minute cap.

It was not per model. It was per project, per base-model family. Every Gemini image model shared the same bucket.

Next idea: multi-region distribution.

The quota is per region, so spreading requests across five regions would give us ten requests per minute.

Except Gemini 3.x image models only work on the global endpoint. There are no regional endpoints. The two request per minute global bucket is the only bucket that exists.

Then: multiple GCP projects.

Each project gets its own two requests per minute. Technically, this works.

[resigned tone] Architecturally, this is what desperation looks like.

I started researching what other developers were experiencing.

Same story everywhere.

Undocumented two request per minute limit. Forum posts with no Google response. Approved quota increases that still returned four twenty nine on every call.

Our thirty thousand dollars a month of GCP spend did not help. Standard pay-as-you-go tiers explicitly exclude image generation models from throughput benefits.

Google is not going to raise this limit.

[reflective] And then the interesting question: why not?

Gemini generates images through the same autoregressive transformer that handles text. It is not a diffusion model. It is the full LLM, reasoning its way pixel by pixel through an image.

Every image burns the same compute as dozens of text API calls.

At six point seven cents per image, Google is almost certainly losing money on every generation. The two request per minute cap is not a quota they forgot to adjust. It is a calculated throttle because the economics do not work.

Imagen 4 uses classic latent diffusion, which is orders of magnitude cheaper to run. That is why Imagen gets thirty to one hundred fifty requests per minute, and why Google is pushing everyone toward it.

[matter-of-fact] The expensive model gets the marketing.

The cheap model gets the throughput.

Think about what this means.

Google built a model that topped every benchmark. They marketed it at every conference, every YouTube keynote, every developer blog. State of the art. Best in the world.

Developers integrate it into production. Users depend on it.

Then: two requests per minute. No increase available. Use our worse model instead.

The API exists. The endpoint works. The demo is stunning.

[flatly] But you cannot actually use it.

We switched to Gemini 2.5 Flash Image.

The older model. The boring one. The one nobody makes YouTube videos about.

It has forty requests per minute.

[deadpan] It works.

[deliberate] Four lessons, condensed.

First: marketing is not a product. Topping a leaderboard does not mean you can serve production traffic. Benchmarks measure quality. Rate limits measure commitment.

Second: autoregressive image generation does not scale. When one image costs as much as a hundred text queries, no business model survives generous rate limits. The economics are the tell.

Third: preview means preview. Google can change limits, kill models, or redirect you to inferior alternatives with no notice. If your production system depends on a preview model, your production system depends on someone else's marketing schedule.

Fourth: the boring model works. The one with forty requests per minute and no conference talks will serve your users while the world-class model sits behind a velvet rope generating two images a minute.

[reflective] The scariest vendor lock-in is the one that starts with a demo you cannot resist.
