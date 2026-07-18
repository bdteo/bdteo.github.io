---
lang: "zh-Hans"
translationOf: "discrete-representations-reinforcement-learning-insights"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "39a2433f0fef1cb8"
title: "RL 中的离散表示：为什么工程师应该关心"
date: "2024-07-15"
slug: "discrete-representations-reinforcement-learning-insights"
author: "Boris D. Teoharov"
description: "一份关于强化学习中离散表示的实用指南：tokens、codebooks 和分类潜变量如何帮助 AI 智能体学习、压缩并适应变化。"
tags: ["人工智能", "强化学习", "离散表示", "World Models", "AI 智能体"]
featuredImage: "./images/featured.jpg"
imageCaption: "深色布面上一组普通卡片呈扇形展开。一只手从这个有限集合中抽起一张。"
audioUrl: "/audio/articles/discrete-representations-reinforcement-learning-insights/zh-Hans/EttSxNTvxX50EUdRPQQl-4bb0ea1fa4e1.m4a"
audioDuration: "21:24"
audioVoice: "Jordan Li (ElevenLabs Mandarin grounded)"
audioGeneratedAt: "2026-07-18"
audioTextSource: "content/tts/discrete-representations-reinforcement-learning-insights.zh-Hans.md"
---

AI 系统从来不会看见“世界”。它看见的是我们给它的表示。

这听起来像研究细节，直到它在 production 里咬你一口。你的智能体拿到一张浏览器截图，但 policy 并不直接对像素行动。你的 LLM 收到文本，但模型读词的方式并不像你。你的机器人记录连续的传感器数值，但它的 planner 需要某种足够稳定的东西，用来比较、记忆、预测和改进。

工程问题很直白：

你是让模型生活在一锅连续的小数汤里，还是强迫它把世界的一部分放进一个有限集合：symbols、buckets、tokens、categories 或 codebook entries？

这就是离散表示问题在实践中的形状。

这个话题最早是通过 Edan Meyer 关于强化学习的工作吸引我的，尤其是论文 [Harnessing Discrete Representations for Continual Reinforcement Learning](https://arxiv.org/abs/2312.01203)，后来发表在 [Reinforcement Learning Journal](https://rlj.cs.umass.edu/2024/papers/Paper84.html)。论文很技术，但教训非常可用：有时候，当模型必须用一个小词表来描述可能的观察状态时，它会学得更快、适应得更好，也会建立更好的 world model。

这个想法并不困在 RL 里。它和 LLM 里的 tokenization、生成模型里的 vector quantization、压缩里的 learned codebooks，以及 agent systems 越来越需要紧凑内部状态而不是无穷原始 context 这件事，都押着同一个韵。

对实际做工程的人来说，重点是：representation 不只是 preprocessing 的一步。它是你决定系统可以犯哪种错误的地方。

## 白话版本

连续表示说：“这个东西是光滑空间里的一个点。”

离散表示说：“这个东西属于有限集合中的一个或多个具名选择。”

两者都不会自动更好。连续向量很有表达力。它可以携带 gradients、层次、插值和细微细节。这就是 embeddings 如此有用的原因。但连续空间也可能很糊。微小的数值变化可能有意义，也可能没有。看起来相似的向量可能藏着不同的因果情境。下游模型不仅要学习什么重要，还要学习边界在哪里。

离散表示会画出边界。

它把问题从“下一个精确的实值向量是什么？”变成更接近“下一个 state、token 或 code 是什么？”这会改变学习问题。预测可以从 regression 变成 classification。记忆可以变得足够 symbolic，因而能够复用。压缩变得明确。planner 可以在更小的一组可能性上推理。

这就是为什么语言模型不是把原始 Unicode 文章当成一条无差别的流来处理。它处理的是 token IDs。这就是为什么 [SentencePiece](https://arxiv.org/abs/1808.06226) 和 byte-pair-style tokenizers 重要。这也是为什么 [VQ-VAE](https://arxiv.org/abs/1711.00937) 有意思：它说明 learned discrete codes 可以成为图像、音频和语音的强大 bottleneck。也正因如此，world-model RL 总是一再回到 categorical latents 和 codebooks。

模型不只是在学习一项任务。它在为这项任务学习一套词汇。

## 一个具体例子

想象一个智能体正在通过屏幕观察学习玩一个简单游戏。

连续潜状态可能会把屏幕编码成这样的向量：

```text
[0.13, -0.72, 1.84, 0.04, ...]
```

这个向量能表示很多东西。但如果智能体想学习 transitions，模型就必须预测一次行动之后所有这些 floating-point 值会怎样变化。容量很容易浪费在无关细节上：闪烁的像素、稍微不同的一帧动画、颜色偏移、一点视觉噪声。

离散潜状态则可能把同一个情境编码成这样：

```text
room=3, enemy_state=alert, key_status=missing, health_bucket=low
```

或者，在一个 learned system 里，它也许不那么适合人读：

```text
[code_18, code_4, code_4, code_71]
```

学到的 codes 未必有好听的名字，但这个约束很有用。智能体不能发明无限多个只有细微差别的内部状态。它必须复用一个有限词表。如果这个词表足够好，模型就能更干净地抓住 dynamics：当我处在这种情境并采取那种行动时，接下来大概率会进入这些类型的情境。

这是压缩，但不只是为了文件大小。它是为了学习而压缩。

## Edan Meyer 的论文补充了什么

Meyer、Adam White 和 Marlos Machado 从 world-model learning、model-free RL 和 continual RL 三个角度研究了 RL 中的离散表示。对我来说，最重要的结果不是一句“discrete beats continuous”的口号。那太整齐了，而现实很少这么客气。

有用的主张更窄，也更有意思：

当模型容量有限时，离散表示可以帮助它建模更多有用的世界。在他们的实验中，使用这些表示的智能体用更少的数据学到了更好的 policies，并且在 continual settings 中，环境变化之后适应得更快。

这正是工程师应该关心的场景。我们几乎总是在某个地方被容量限制。也许模型很小。也许数据很薄。也许环境在变化。也许延迟预算迫使组件更小。也许智能体的 context window 里塞满了无关历史。也许世界太大，无法诚实地建模，所以系统需要一种可以不断修补的 lossy abstraction。

论文里还有一个有用的提醒：收益未必来自“离散性”这个神奇属性本身。作者指向 sparsity 和 binarity，认为它们可能也是贡献因素。换句话说，“有限选择”有帮助，部分原因是它们施加了结构。它们让 representation 更干净、更有选择性，也更容易被 downstream learner 使用。

这个区别很重要。教训不是因为量化听起来聪明，就把所有东西都 quantize。教训是要问：你的表示是否强迫了正确类型的简化。

## 为什么它又显得现代

离散表示过去听起来像是 RL 里的小众问题。现在，它们似乎位于我们正在构建的一半系统的中心。

LLM 是最明显的例子。模型看到的是 token IDs，不是 prose。Tokenizer 决定哪些文本片段会变成 atomic units。这个选择会影响成本、context length、多语言行为、奇怪的 edge cases，有时还会影响 reasoning behavior。[GPT-2 paper](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) 按今天的标准已经老了，但它已经提出了实用要点：language modeling 是在符号序列上做的。现代系统大得多，但 symbolic bottleneck 仍然在那里。

Agent systems 也有同样的问题，只是形式更乱。一个智能体可以永远保存 raw transcripts，但那通常是糟糕的记忆。有用的智能体需要 distilled state：open tasks、known constraints、tool results、current plan、unresolved risks、user preferences、environment facts。这是对一个更大的连续混乱体的 discrete-ish representation。它说：这些是少数值得带到下一步的 states。

World models 让这种联系更明确。World model 试图学习一个紧凑的内部模拟器：如果我从这个 state 采取这个 action，接下来会发生什么？[DreamerV3](https://arxiv.org/abs/2301.04104) 是这里的一个现代路标，它展示了在 learned model 内部想象 future trajectories 来学习 behavior 可以有多强。更新的工作，例如 [Discrete Codebook World Models for Continuous Control](https://arxiv.org/html/2503.00653v1)，还在继续探索 discrete codebooks 如何在外部控制问题是 continuous 的情况下仍然有帮助。

压缩是安静的第四个兄弟。压缩时，你选择忽略哪些差异。Codebook 是一种契约：许多 raw inputs 映射到同一个 internal code，因为对于当前目的来说，它们足够接近。这也是软件里的好 abstractions 所做的事。它们折叠掉 irrelevant variation，让系统的其他部分能够推理。

这个模式无处不在：

| 系统 | 原始输入 | 近似离散的 bottleneck | 为什么有帮助 |
| --- | --- | --- | --- |
| LLM | 文本字节和字符 | Tokens | 可预测的序列单元、有界词表、更便宜的 modeling |
| RL agent | 像素或传感器流 | Categorical latent state | 更干净的 transitions、更容易 planning、更好的 adaptation |
| World model | 环境历史 | Learned codes | 更小的 internal simulator、更少 irrelevant detail |
| Agent memory | 完整 transcript 和 tool logs | Task/state summaries | 持久 context，而不淹没模型 |
| Compression model | 图像、音频、视频 | Codebook entries | 保留有用结构，同时丢弃噪声 |

这就是为什么这个话题会以不同名字不断重现。Tokenization、quantization、bucketing、classification、learned codebooks、symbolic state、sparse binary features：它们并不相同，但都在问同一个工程问题。

思考的单位是什么？

## 取舍

离散表示强大，是因为它们丢掉信息。

这也是它们危险的原因。

糟糕的 tokenizer 会弄坏一种语言。糟糕的 bucketing scheme 会抹掉你需要的信号。糟糕的 learned codebook 会把两个有实质差异的 states 映射到同一个 code，并教给 policy 错误的课。离散的 agent memory 可能变成自信的有损记忆：保留一个整洁 summary，却丢掉那个真正重要的别扭细节。

连续表示以另一种方式失败。它们常常保留太多。它们允许模型把细微信息向前携带，但 downstream learner 必须发现哪些 dimensions 重要。它们可以很灵活，但也很滑。

所以实际选择不是“discrete or continuous?”而是：

- 我在哪里需要 smoothness？
- 我在哪里需要 stable categories？
- 哪里是 noise 在伪装成 information？
- 模型在哪里把 capacity 浪费在 irrelevant variation 上？
- 在哪里，一个 finite vocabulary 会让 prediction、planning 或 debugging 更容易？

如果你无法回答这些问题，discreteness 可能只是装饰。如果你能回答，它就会成为设计工具。

## 一个工作框架

这是我真的会使用的决策框架。

当系统需要在带噪声的表面变化下反复识别同一种情境时，使用离散表示。Game states、UI states、workflow statuses、failure classes、customer intents、document chunks、tool outcomes 和 environment modes 都符合这个模式。

当下一个模型更适合被表述为 classification 而不是 regression 时，使用离散表示。预测“下一个 mode 是什么？”可能比预测一个精确的 floating-point state 更容易、更稳健，尤其是在未来是 multimodal 的时候。

当你需要持久记忆时，使用离散表示。智能体不需要记住每次 observation 的每个 token。它们需要一个 compact state，能存活足够久来指导下一次行动。

当边界是任意的，要小心离散表示。如果两个 states 被分开只是因为你的实现需要一个 bucket，模型可能会继承这个虚假的 distinction。同样的问题在 analytics dashboards 里一直出现：一个指标阈值会变成 reality-distortion field。

当 rare case 很重要时，更要小心。离散压缩很擅长保留 common structure。它对 exceptions 可能很残酷。在 safety、fraud、medical、legal、financial 或 security systems 里，那个“tiny detail”可能就是重点。

## 工程味道

有一种味道，我现在更常注意到：

模型从技术上看见了一切，但无法使用它看见的东西。

当一个智能体拥有 massive context window 却仍然丢线索时，你会看到它。当一个 policy 拥有 high-dimensional observations，却无法在一个小小的 environment change 后适应时，你会看到它。当一个 classifier 获得了更丰富的 embeddings，却在简单的 out-of-distribution variants 上失败时，你会看到它。当一个 world model 预测的是看起来合理的一团糊，而不是有用的下一状态时，你会看到它。

在这些时刻，增加 capacity 也许有帮助。更多 data 也许有帮助。更大的 model 也许有帮助。

但有时缺的那块是更好的 bottleneck。

系统需要被迫说出：这个属于那个；这个差异不重要；这个状态以前出现过；这个动作改变了类别；这是值得记住的部分。

这才是离散表示的真正价值。它们让复用成为可能。

## 我喜欢这条研究线的地方

我喜欢 Meyer 的工作，因为它没有把 representation 当作哲学装饰。它把这个选择放到实验压力下。World model 学得有多好？Policy 需要多少 data？当 environment 变化时会发生什么？当我们从干净 setup 走进 continual learning，这个 advantage 还能保住吗？

这些才是正确的问题。

我也喜欢答案并不漫画式地简单。论文没有证明所有 discrete latents 都好。它提示，有用的离散表示同时做了几件事：降低 capacity demands，结构化 prediction，鼓励 sparsity，并给 learner 更干净的 adaptation handles。

这在普通工程里也听起来是真的。

好系统并不是一路到底都是 raw reality。它们有精心选择的 interfaces。它们有 enums。它们有 states。它们有 event types。它们有 schemas。它们有 IDs。它们有 summaries。它们为反复出现的情境提供有损但有用的名字。

Machine learning systems 也需要同样的 discipline。区别在于，其中一些 interfaces 是学出来的，而不是手写的。

## 要点

离散表示重要，是因为智能不只是拥有一个 powerful model。它还意味着给模型有用的思考单位。

对 RL 来说，这可能意味着 world models 用更少 capacity 学到更有用的 transitions，也意味着 agents 在世界变化时适应得更快。对 LLM 来说，它体现在 tokenization 和 context management。对 agents 来说，它体现在 memory、planning state 和 tool-use traces。对 compression 和 generative models 来说，它体现在 codebooks，它们保留值得保留的结构。

实践教训很简单：

当一个系统挣扎时，不要只问模型是否足够大。也要问它的 representation 是否足够友善。

它是否折叠了 noise？是否保留了重要的 distinctions？是否让下一次 prediction 更容易？是否给了智能体一套可复用的世界词汇？

如果是，discreteness 就不是限制。它是一个把手。
