2026 年 3 月更新。 这份速查表的最初版本写于 2023 年 5 月，当时面向的是 SD 1.5。此后几乎一切都变了：新的架构（SDXL、SD 3.5、Flux）、新的 UI（ComfyUI）、新的硬件（RTX 5090），以及关于负面提示词哲学的一次彻底反转。这是当前版本。

这是我工作时查 Stable Diffusion 参数用的参考。不是教程，只是当事情不对劲，或者我想把质量再推高一点时，会伸手去调的那些设置。

[matter-of-fact] 该用哪个模型

[conversational tone] 现在这是第一个决定，而且它比任何参数微调都更重要。

模型，最适合，分辨率，备注。

Flux 2，写实主义、提示词遵循度，1024x1024+，2026 年最好的开放权重写实模型。已集成进 Adobe Photoshop。

SDXL，通用场景，1024x1024，微调生态极大。Juggernaut XL、Realistic Vision、DreamShaper。

SD 3.5 Large，顶级质量（Stability 的旗舰），1024x1024，MMDiT 架构。SD 3.0 已于 2025 年 4 月废弃。

SDXL Lightning，速度，1024x1024，2-8 步生成。在更高分辨率下质量优于 Turbo。

SD 1.5，遗留工作流，512x512，微调库巨大，但正在被逐步淘汰。SD 2.0/2.1 已正式废弃。

如果你从零开始：写实主义用 Flux 2，其他都用 SDXL。 SD 3.5 很好，但生态更小。

该用哪个 UI

[deliberate] UI，最适合。

ComfyUI，进阶用户。基于节点，更好的显存管理，快 15%，对 Flux 支持最好。截至 2025 年，是严肃工作的行业标准。

Automatic1111，初学者。界面更简单，扩展库巨大。用于 SDXL 仍然没问题。

Fooocus，一键生成。配置最少。适合快速出结果。

我用 ComfyUI。学习曲线更陡一些（预期要 10-20 小时才能顺手），但光是显存管理就值了：A1111 会崩的 8GB 显存，它能跑 SDXL。

采样器

[conversational tone] 采样器之争基本已经定下来了。

常用选择：

DPM++ 2M Karras -- 速度和质量的最佳比例。这是我几乎所有事情的默认选项。

[matter-of-fact] DPM++ SDE Karras -- 在低步数时略好。适合快速迭代。

Euler a -- 依然可靠。输出变化更多，适合探索。

什么时候切换：

输出缺少多样性？试试 DPM++ SDE 或 Euler a。

有伪影或过饱和？试试 DPM++ 2M Karras 或普通 Euler。

速度压倒一切？Euler a 或 DPM++ 2M（非 Karras）。

想要最高质量？DPM++ 3M SDE Karras 或 UniPC。

步数： 大多数采样器用 20-30 步。Lightning 模型只需要 2-8 步。

[deliberate] CFG（Classifier Free Guidance）

模型有多严格地跟随你的提示词，而不是按自己的理解发挥。

范围，效果。

[slows down] 1-4，非常有创造性，理解很松。经常不连贯。

5-7，适合大多数工作的良好平衡。

7-10，提示词遵循度强。SDXL 写实主义的甜点区。

10-15，有伪影和颜色过度处理的风险。

15+，几乎总是太多。伪影基本保证出现。

[matter-of-fact] 注意： SD 3.5 使用不同的 guidance 机制。CFG 这个概念仍然适用，但尺度表现不同：从更低的值开始（3-5），再往上调。

分辨率

512x512 的时代结束了。

模型，原生分辨率，实用范围。

SD 1.5，512x512，512x512 到 768x768。

SDXL，1024x1024，1024x1024（标准）、1024x768、768x1024。

SD 3.5，1024x1024，1024x1024+。

Flux，1024x1024，1024x1024+，高端 GPU 可到 4K。

[deliberate] 超过原生分辨率会增加伪影和构图问题的风险。不要直接生成 2048x2048，用 hi-res fix 或放大。

Clip Skip

没有以前那么重要了。

SD 1.5： Clip skip 1-2 很重要。动漫模型经常用 clip skip 2。

SDXL： 使用双文本编码器（CLIP + OpenCLIP）。Clip skip 基本会被忽略，架构处理方式不同。

SD 3.5 / Flux： 不能以同样方式适用。这些模型使用基于 transformer 的文本编码。

如果你用的是 SDXL 或更新模型：不用担心 clip skip。如果你用的是 SD 1.5：写实主义保持 1，动漫用 2。

负面提示词

哲学已经反过来了。 2023 年的建议是使用很长的负面提示词列表。到 2026 年，共识是：先什么都不写，只在需要修复时添加具体内容。

[emphasized] 为什么会变：

SDXL 和 Flux 对自然语言的理解远好于 SD 1.5。

很长的负面提示词实际上可能会限制创造性，并产生更差的结果。

[matter-of-fact] "bad anatomy" 太模糊，没什么用。"ugly" 也不起作用，因为 SD 不是在带有 "ugly" 标签的图像上训练出来的。

有些模型在长负面提示词下表现明显更差。

当前做法：

第一，先不加任何负面提示词生成。

第二，如果看到具体问题（多余手指、背景模糊），再针对那个问题添加负面提示词。

第三，使用强调权重：写 (blurry:1.3)，而不是只写 blurry。

[deliberate] 第四，保持简短：最多 5-10 个词。

GPU 快速参考

GPU，显存，适合。

RTX 3060 12GB，12GB，SD 1.5、基础 SDXL。

RTX 4070 Ti，12GB，SDXL、部分 Flux。

RTX 4090，24GB，一切。主力干活卡。

RTX 5090，32GB，包括 4K 和批量生成在内的一切。

[matter-of-fact] 8GB 卡，8GB，最低可用。ComfyUI 有助于显存管理。

24GB 是一个分界线：SDXL 和 Flux 在这里开始舒服，不用一直和显存较劲。

故障排查速修

问题，试试。

输出模糊，增加步数。检查分辨率是否匹配模型原生分辨率。

多余手指/肢体，把 extra fingers, extra limbs 加进负面提示词。或者使用 ControlNet。

颜色过饱和，降低 CFG。切换到 DPM++ 2M Karras。

构图不对，使用 ControlNet（depth、canny、pose），不要和提示词硬拗。

生成太慢，使用 Lightning 模型，减少步数，用 ComfyUI 获得更好的显存表现。

[deliberate] 显存不足，切换到 ComfyUI，减少 batch size，使用 fp16。
