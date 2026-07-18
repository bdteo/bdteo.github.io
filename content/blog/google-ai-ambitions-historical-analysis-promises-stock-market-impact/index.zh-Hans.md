---
lang: "zh-Hans"
translationOf: "google-ai-ambitions-historical-analysis-promises-stock-market-impact"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "4fcc46a4e0bdfcc1"
title: "2026 年的 Google AI：历史、Gemini、Search 与市场影响"
date: "2024-05-11T12:00:00.000Z"
description: "一份面向 2026 的 Google AI 模式指南：研究突破、Gemini、Search、TPU、Cloud、失败案例，以及谨慎的股市视角。"
featuredImage: "./images/featured.jpg"
imageCaption: "橡木桌上的一本打开的笔记本。一条细淡的手绘折线图，一支钢笔，一杯茶——被写下来的耐心。"
audioUrl: "/audio/articles/google-ai-ambitions-historical-analysis-promises-stock-market-impact/zh-Hans/EttSxNTvxX50EUdRPQQl-f0f80effab24.m4a"
audioDuration: "25:56"
audioVoice: "Jordan Li (ElevenLabs Mandarin grounded)"
audioGeneratedAt: "2026-07-18"
audioTextSource: "content/tts/google-ai-ambitions-historical-analysis-promises-stock-market-impact.zh-Hans.md"
---

我以前以为有趣的问题是：Google 对 AI 的承诺有没有推动股价？

这仍然是一个真实的问题，但太小了。到了 2026 年，更好的问题是：Google 真正的 AI 模式是什么，其中哪些部分会复利？

Google 的 AI 历史不是一条干净的英雄曲线。不是“Google 发明了一切，所以它会赢”。也不是“Google 错过了 ChatGPT，所以它完了”。这两种说法都很懒。更有用的版本更混乱，也更实际：Google 往往很早创造或吸收重要研究，慢慢把它们接入基础设施，把它们藏进巨大的产品里；当界面变得公开、对话化时，它会踉跄；然后当工作从 demo 变成系统时，它又会恢复。

这个模式对构建者重要，因为它展示了研究如何变成产品重力。它对投资者重要，因为 Alphabet 的价值不是对某一次模型发布的全民公投。它对任何想理解 AI 的人也重要，因为 Google 是少数能同时看见四层结构的公司之一：前沿研究、消费者分发、自研计算，以及一个既被 AI 威胁又被 AI 强化的广告业务。

这是面向 2026 的版本。

## 简短版本

Google 在 AI 上的优势不是一个聊天机器人。它是一个循环：

1. 研究创造技术和模型。
2. 基础设施让这些模型便宜到足以在荒唐的规模上运行。
3. 产品把模型暴露给数十亿用户。
4. 使用数据、enterprise 需求和市场压力，为下一轮基础设施周期提供资金。

这个循环很强。它也很脆弱。如果 Search 回答得太多、给 web 送出的流量太少，出版商会生气。如果 Gemini 在一个敏感的 image prompt 上出错，这个错误会变成公开的信任故事。如果 AI 答案太贵，利润率叙事会变差。如果模型落后，整套 full-stack 叙事就会开始听起来像是在用电子表格解释产品差距。

所以正确的姿态既不是膜拜，也不是轻蔑。Google AI 是一台复利机器，只是它的失败模式非常公开。

## 一份简明时间线

- **2011-2015：公开 AI 品牌之前的内部规模。** Google 的 DistBelief 基础设施帮助内部训练大型神经网络。2015 年 11 月，Google 开源了 [TensorFlow](https://research.google/blog/tensorflow-googles-latest-machine-learning-system-open-sourced-for-everyone/)，把这套内部 machine learning stack 的一部分提供给更广泛的世界。
- **2016：AlphaGo 和“AI-first”。** DeepMind 的 AlphaGo 让 AI 不再那么像实验室奇观，而更像一种新的解题引擎。Google 也开始把自己称为 AI-first 公司，而不是 mobile-first 公司。
- **2017：Transformer。** Google 研究人员的论文 [Attention Is All You Need](https://arxiv.org/abs/1706.03762) 提出了 Transformer 架构。今天很多现代 generative AI 都建立在它之上。
- **2019：BERT 进入 Search。** Google 把 BERT 模型应用到 Search ranking 和 featured snippets 中，用 machine learning 更好地理解语言和查询意图。
- **2020-2024：科学成为证明点。** AlphaFold 表明，AI 能产生科学实用价值，而不只是漂亮 demo。到 2025 年，Google DeepMind 把 AlphaFold 描述为一个五年的科学影响故事，并且获得了诺贝尔奖层面的认可。
- **2023：Google DeepMind 成立。** Google 将 DeepMind 和 Brain 团队合并为 [Google DeepMind](https://blog.google/innovation-and-ai/technology/ai/april-ai-update/)，把更多模型工作放进一个聚焦的研究组织。
- **2023 年 12 月：Gemini 开始。** Google 推出 [Gemini 1.0](https://blog.google/innovation-and-ai/technology/ai/google-gemini-ai/)，作为 Google DeepMind 时代的第一个模型家族。
- **2024：AI 离开实验室，并在公众面前出错。** Gemini 图像生成因为不准确的人物图像被暂停，AI Overviews 则在 Search 中上线后产出了一轮奇怪、醒目的答案。这不只是公关噪音。它暴露了把概率系统放进可信表面里的难度。
- **2025：inference 成为基础设施战略。** Google 发布 Ironwood，也就是第七代 TPU，一颗为 inference 时代设计的芯片。
- **2026：agentic Gemini 时代。** 在 I/O 2026 上，Google 把下一章框定在 Gemini、Search agents、AI Mode、developer agents 和 full-stack AI 方法之上。截至 2026 年 6 月，这就是它仍在使用的战略框架。

这条时间线不是从发明到统治的直线。它是从发明到分发的线，中间有几个坑。

## 哪些判断经受住了时间

第一个经受住时间的东西，是那个无聊的判断：Google 的 AI 历史确实很深。

现在很流行把 AI 领导力简化成“这个月谁有最好的消费级聊天机器人”。这会错过当前时代里有多少东西是长期工作提前铺好的：TensorFlow、TPU、BERT、Transformers、AlphaGo、AlphaFold、seq2seq models，以及把 machine learning 放进数十亿用户产品里的习惯。Google 在 2023 年宣布 DeepMind 合并时，明确把其中很多东西列为 DeepMind 和 Brain 的共同遗产。

第二个经受住时间的是基础设施。

2024 年时，人们很容易谈论 AI，仿佛模型本身就是产品。到了 2026 年，计算层已经无法忽视。Google 发布 Ironwood TPU 时，描述的是从以 training 为中心的 AI 转向大规模 inference。Google Cloud 后来也把 Ironwood 放进一条长期 custom silicon 线中，这条线包括 TPU、YouTube video chips 和 Tensor mobile chips。

这很重要，因为 AI 的未来不只是“谁能训练最聪明的模型？”也是“谁付得起下一个十亿个问题的回答成本？”如果 Google 能降低智能的成本和 latency，Search、Gemini、Workspace、Android、YouTube、Cloud 和 agents 都会更有说服力。

第三个经受住时间的是分发。

Google 可以把 AI 放进 Search、Gmail、Docs、Maps、Android、Chrome、Pixel、YouTube、Photos 和 Cloud。这不保证产品品味好。它意味着，一旦一个功能能用，分发就不是难点。在 I/O 2026 上，Google 说 AI Overviews 的月活用户超过 25 亿，AI Mode 在第一年就超过 10 亿月活用户。即使考虑到 keynote 指标本身有自我宣传属性，规模仍然是重点。一个在 Google 规模上运行的平庸功能，可能比一个没有用户的漂亮 demo 教会你更多东西。

第四个经受住时间的是这个想法：Google AI 比 search ads 更大。

Waymo 不是 Gemini。AlphaFold 不是 Search。TPU 客户不是 YouTube 观众。但它们都在同一种 Alphabet 逻辑之下：耐心的技术赌注，可以显得奇怪很多年，直到它们要么变成产品基础设施，要么继续作为昂贵的 optionality 存在。2026 年 Q1，Alphabet 说 Waymo 每周完全自动驾驶出行次数超过 50 万次。这仍然不是核心业务。但它也不再是科学展上的道具。

## 哪些判断没有经受住时间

旧的 stock-first 框架没有经受住时间。

股价反应是真实的，但它们是嘈杂的温度计。2023 年 Bard demo 的错误据称帮助一天内抹去了约 1000 亿美元市值。那很尴尬，也有意义。但它同样没有决定 Google 的 AI 未来。公开 demo 可以比产品现实更快地推动市场情绪。

反过来也一样。一次强劲的 earnings print 并不能证明每个 AI 赌注都是好的。它证明的是，在那个时刻，投资者愿意相信这笔支出有走向回报的路径。这个区别很重要。

第二个没有经受住时间的是这个想法：Google 只要“ship 得更猛”就行。

Google 的问题从来不是缺模型。问题是 AI 的不确定性撞上了 Google 规模的信任。当 Gemini 图像生成产出不准确或冒犯性的人物图像时，Google 暂停了该功能，并解释说它的调优在某些上下文中过度修正了。当 AI Overviews 在 2024 年产出奇怪答案时，Google 解释说 Search AI 与 ranking systems 和 web results 绑定，但也承认，被误解的查询、薄弱的 source material 和论坛讽刺仍然可能破坏体验。

这些事件不是脚注。它们是产品课。Google 的 AI 不只是能力问题。它是在品牌压力、监管压力、出版商压力和用户信任压力下的能力问题。

第三个没有经受住时间的是这个假设：开放研究带来的好感会自动延续。

TensorFlow 是 2015 年一个巨大的 open-source 时刻。现代 Gemini 时代更混合：封闭的 frontier models、开放的 Gemma models、API 访问、Cloud 服务，以及被紧密管理的消费级表面。这在商业上也许合理。但它也意味着 Google 和构建者的关系，比 TensorFlow 时刻更交易化。开发者不只问“模型聪明吗？”他们会问平台是否稳定、便宜、可移植，并且无聊到足以用来构建东西。

## Google AI 的模式

这是我现在觉得最有用的心智模型：

**研究是种子。** Google 很擅长产出后来会变成基础的研究。Transformer 是显而易见的例子。AlphaFold 是更好的提醒：同一种研究文化也能在消费软件之外产生意义。

**基础设施是 moat 尝试。** TPUs、data centers、networking、cooling 和 software stacks 并不华丽，但它们决定 AI 能不能被有利润地提供。2026 年 Q1，Alphabet 在 property and equipment 上的购买额是 357 亿美元。这不只是“AI vibes”；这是硬资本流向 servers、network equipment 和 data centers。

**产品是试验场。** Search 是危险的那个，因为它印钱。Cloud 是最干净的商业故事，因为客户直接为 compute、models 和 enterprise AI tooling 付费。Android 和 Workspace 是分发层。Gemini 既是产品，也是围绕模型家族的品牌外壳。

**市场认知是压力表。** 投资者不会像研究人员那样评估 Google AI。他们问的是更小的一组问题：AI 会增加 Search 使用，还是蚕食 ad clicks？Cloud 会拿到份额吗？capex 会产生 revenue、margin 或 strategic control 吗？Google 会避开监管和声誉错误吗？

当你看到 Google 发布一个新模型，不要只问它是否打赢了 benchmark。要问它进入了循环的哪个位置。

它是否让 Search 更有用，同时不破坏 web 生态？它是否让 Cloud 更容易销售？它是否降低 cost per answer？它是否足够改善 Android 或 Workspace，让用户注意到？它是否让 developers 在 Google 上构建，而不是只是测试 demo 然后离开？

这就是模式。

## Gemini 是战略，不只是模型

Gemini 起初是一个模型家族，但到 2026 年，它更像 Google 的 AI operating label。

app 里有 Gemini。Search 里有 Gemini。Workspace 里有 Gemini。Cloud 里有 Gemini。Android 里有 Gemini。developer tools 里有 Gemini。Gemini 是 consumer subscriptions 的驱动器。Gemini 是 API traffic。Gemini 也是一个 agentic story。

这会让人困惑，因为“Gemini”承担了太多语义工作。它可以指 frontier model、app、API、assistant、branding layer 或 enterprise story。但这种蔓延本身也是战略。Google 想让 Gemini 成为那些过去看起来相互分离的表面之间的连接组织。

所以 I/O 2026 的语言很重要。Google 不是只在说“我们的模型更聪明”。它在说，AI 正从 assistance 走向 agents，从孤立 prompts 走向 workflows，从 chatbot novelty 走向人们已经使用的产品表面。

我对“agentic”这个词很谨慎，因为它正在变成新的“blockchain”：有时有意义，有时只是喷在 slides 上。但在 Google 这里，方向足够清楚。Search agents、AI Mode、Antigravity、Gemini API managed agents、Workspace context 和 Android tooling，都是把模型变成能采取行动的系统的尝试。

测试标准不是 keynote demo 看起来是否像活的。测试标准是用户是否愿意把无聊、重复、后果明确的工作交给 agent。

## 谨慎的股市视角

Alphabet 股票不是纯 AI 股票。它是广告、cloud、订阅、基础设施和 optionality 股票，里面放着一个巨大的 AI 问题。

这让市场角度比“AI 发布等于股价上涨”更微妙。

2023 年 2 月 Bard 的错误显示，当投资者认为 Google 正在把叙事输给 Microsoft 和 OpenAI 时，市场情绪可以多快地惩罚它。但 2026 年的 earnings story 展示了反向压力：如果 Search revenue 增长、Cloud 加速、Gemini subscriptions 上升、基础设施需求看起来真实，投资者就可能对沉重的 AI 支出更有耐心。

Alphabet 的 2026 年 Q1 数据有用，因为它们说明了市场为什么愿意听。该季度 revenue 为 1099 亿美元。Google Cloud revenue 略高于 200 亿美元，同比增长 63%，operating income 为 66 亿美元。Google 说 Cloud backlog 环比几乎翻倍，超过 4600 亿美元。Search and Other advertising 增长 19%。这些数字不能证明 Google 会赢得 AI，但会让 bear case 更难成立。

读懂股市角度最干净的方式是：

- **短期：** demos、错误、lawsuits、product launches 和 earnings 语言会推动情绪。
- **中期：** Search usage、AI ad formats、Gemini subscriptions、Cloud backlog、TPU demand 和 capex discipline 更重要。
- **长期：** 问题是 Google 能否把 AI 从 cost shock 转成一个保护 margin 的 product layer。

最后一点就是整场游戏。如果 AI 让每次搜索都更贵，同时减少出版商好感和 ad clicks，市场最终会在意。如果 AI 让 Search 更有用、Cloud 更差异化、Workspace 更粘、compute 更高效，市场会原谅很多东西。

<figure>
  <img src="google_stock_milestones.png" alt="Google 股票里程碑">
  <figcaption>
    Fig1. - 原文中的 Google 股票历史里程碑。有用的上下文，不是实时估值模型。
  </figcaption>
</figure>

<figure>
  <img src="tech_companies_ai_milestones.png" alt="科技公司的 AI 里程碑">
  <figcaption>Fig2. - 主要科技公司的 AI 里程碑。把里程碑图表当作叙事地图，而不是持久优势的证明。</figcaption>
</figure>

## 构建者应该从 Google AI 学到什么

构建者的教训不是“做 Google”。你的 side project 不会拥有 Search、YouTube、DeepMind、TPU、Cloud、Android 和 data-center budget。听起来很可爱，但不会。

有用的教训是顺序。

第一，研究不是产品。模型能力只有被放进一个用户已经有 intent 的 workflow 里，才会变得有价值。Search 强大，是因为用户带着 intent 来。Workspace 强大，是因为用户带着工作来。Cloud 强大，是因为客户带着预算和 deployment problem 来。

第二，evals 不够。Google 的公开失败通常不是“模型很笨”的失败。它们是 context failures、policy failures、retrieval failures、product-surface failures 和 expectation failures。如果你的 AI 功能触及信任、金钱、健康、身份、current events 或公共声誉，你的 eval suite 就需要包括模型周围的世界。

第三，成本是产品设计。一个答案 1 美元时很神奇、0.01 美元时还算可忍的功能，不是同一个功能。Google 对 TPU、latency 和 cost per response 的执着，不只是财务故事。它塑造了哪些产品体验是可能的。

第四，分发可以暂时隐藏弱点，但不能永远隐藏糟糕的实用性。Google 可以把 Gemini 放到数亿人面前。这给了它时间和 feedback。但用户仍然会注意到某个东西慢、错、烦，或者不值得改变习惯。

## 接下来我会看什么

我会看五件事。

**Search 行为。** AI Overviews 和 AI Mode 是 Google AI 故事的中心，因为 Search 是业务心脏。看人们是否搜索更多，commercial queries 是否仍然可变现，以及出版商是否继续供应 AI Overviews 依赖的 web。

**每个有用答案的成本。** 任何 AI earnings story 里安静的那句话都关于成本。如果 Google 在 model quality 改善的同时继续降低 inference cost，它的分发优势会更锋利。

**Cloud 转化。** Backlog 很有希望。Revenue 和 operating income 更好。Customer retention 和真实 AI workloads 更好。Google Cloud 是 AI 故事最直接可销售的地方。

**Agent reliability。** Agents 很容易 demo，很难让人信任。我不太关心一个 agent 是否在 keynote 里订了一家餐厅；我更关心它是否能处理 messy real-world constraints，而且不制造 cleanup work。

**Failure response。** Google 还会犯更多 AI 错误。每家公司都会。真正的信号是公司多快缩小 blast radius，解释问题，改进系统，并且抵抗住把问题说成只是 user misunderstanding 的诱惑。

## 有用的结论

Google 的 AI 故事不是 comeback story。它也不是 fall-from-grace story。它是一条长期复利故事，只是中间有一个非常别扭的公开阶段。

经受住时间的：研究深度、基础设施赌注、分发优势，以及 AI 最终会触及 Google 每一个主要表面的想法。

没有经受住时间的：把股价波动当作证明，把模型发布当作命运，以及低估把 generative AI 放进人们期望信任的产品里有多难。

实用的心智模型很简单：

当 research、infrastructure、product 和 monetization 相互强化时，Google 会赢。当其中一层跑得比其他层太快时，Google 会踉跄。

这就是为什么股市角度应该是次要的。股票只是墙上的影子。真正的物体是循环。

## 来源与延伸阅读

- [TensorFlow open-sourced by Google Research](https://research.google/blog/tensorflow-googles-latest-machine-learning-system-open-sourced-for-everyone/)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Google Search and BERT](https://blog.google/products-and-platforms/products/search/search-language-understanding-bert/)
- [Google DeepMind merger announcement](https://blog.google/innovation-and-ai/technology/ai/april-ai-update/)
- [Introducing Gemini 1.0](https://blog.google/innovation-and-ai/technology/ai/google-gemini-ai/)
- [AI Overviews launch in Search](https://blog.google/products-and-platforms/products/search/generative-ai-google-search-may-2024/)
- [Google's AI Overviews post-launch explanation](https://blog.google/products-and-platforms/products/search/ai-overviews-update-may-2024/)
- [Gemini image generation issue explanation](https://blog.google/products-and-platforms/products/gemini/gemini-image-generation-issue/)
- [I/O 2026: agentic Gemini era](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)
- [Google Search I/O 2026 updates](https://blog.google/products-and-platforms/products/search/search-io-2026/)
- [Google I/O 2026 developer keynote recap](https://developers.googleblog.com/all-the-news-from-the-google-io-2026-developer-keynote/)
- [Alphabet Q1 2026 CEO remarks](https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q1-2026/)
- [Alphabet Q1 2026 results filed with the SEC](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000043/googexhibit991q12026.htm)
- [Ironwood TPU announcement](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/ironwood-tpu-age-of-inference/)
- [Ironwood TPU general availability and AI Hypercomputer notes](https://cloud.google.com/blog/products/compute/ironwood-tpus-and-new-axion-based-vms-for-your-ai-workloads)
- [AlphaFold five-year impact note](https://deepmind.google/blog/alphafold-five-years-of-impact/)
- [AlphaGo at 10](https://deepmind.google/blog/10-years-of-alphago/)
- [Reuters note on the 2023 Bard market reaction](https://reutersbest.com/reuters-reveals-googles-ai-chatbot-flubs-answer-in-promotional-video-sending-alphabet-shares-down-9/)
