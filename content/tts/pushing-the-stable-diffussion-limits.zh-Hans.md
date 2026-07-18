[matter-of-fact] 本文包含代码示例。音频版省略代码，只保留讲解。

2026 年 3 月更新。 这篇文章最初写于 2023 年 5 月，当时 SD 1.5 的 512x512 是标准，RTX 3090 是顶级硬件。现在一切都变了。Flux 2、SDXL fine-tunes、SD 3.5、ControlNet 和 RTX 5090 已经完全重新定义了可能性。这就是当前状态。

[conversational tone] AI 生成图像和真实照片之间的差距几乎已经闭合。2023 年，“照片真实感”的意思是“眯起眼看几乎能信”。到了 2026 年，最好的模型生成的图像已经真的很难和专业摄影区分开。

[matter-of-fact] 下面是怎么做到。

当前照片真实感版图

[reflective] 你选择的模型，比你调整的任何设置都更重要。现在的情况是这样：

Flux 2 -- 新王

Flux 2 来自 Black Forest Labs（2025 年 11 月发布），可以说是 2026 年最好的 open-weight 照片真实感模型。它生成的图像有自然光照、准确的皮肤纹理和连贯构图，足以和专业摄影相提并论。Adobe 在 2025 年 9 月把 Flux（Kontext Pro）集成进 Photoshop，这已经说明了行业信心在哪里。

Flux 还拥有非常出色的自然语言理解能力。你可以用普通英语描述想要什么，不再需要 SD 1.5 那种关键词浓汤。

SDXL Fine-Tunes -- 干活的主力

[awe] 对于基于 SDXL 的照片真实感，目前的领先者是：

Juggernaut XL v9/v10 -- 电影感、摄影风输出的默认选择。在摄影师和电影制作者中最受欢迎。

Realistic Vision -- 专门针对逼真纹理、光照和面部准确性 fine-tuned。

EpicRealism -- 细节和自然光照都非常强。

[matter-of-fact] 这些模型有庞大的社区支持、丰富的 LoRA 库和可预期的行为。如果 Flux 感觉还太新，或者你的工作流建立在 SDXL 上，它们都是很好的选择。

SD 3.5 Large

Stability AI 的旗舰模型使用新的 Multimodal Diffusion Transformer（MMDiT）架构，和 SDXL 是根本不同的路线。它技术上很厉害，但生态更小。SD 3.0 已在 2025 年 4 月 deprecated，所以确保你用的是 3.5。

GPU 现实检查

硬件要求已经明显抬高。

GPU，VRAM，照片真实感能力。

RTX 3060 12GB，12GB，只适合 SD 1.5 照片真实感。SDXL 会很紧。

[matter-of-fact] RTX 4070 Ti，12GB，1024x1024 的 SDXL。通过优化可以跑 Flux。

RTX 4090，24GB，甜点位。可以舒服处理 1024x1024+ 的 SDXL、Flux、SD 3.5。

RTX 5090，32GB，全都能跑，包括 4K 生成和 batch workflows。32GB GDDR7，512-bit bus。

8GB cards，8GB，借助 ComfyUI 的 VRAM 管理勉强可用。不舒服。

[awe] 2023 年那个“RTX 3080 上跑 512x512”的甜点位已经是古代史。1024x1024 现在是标准分辨率，而你至少需要 16GB VRAM，才能不被持续的小挫败折磨。24GB 开始舒服。

[reflective] 专门针对照片真实感来说，更多 VRAM 意味着你可以同时运行更大的模型、更高分辨率和 ControlNet，而不用 offload 到 CPU。

照片真实感设置

Sampler

DPM++ 2M Karras，25-30 steps。这是 SDXL 照片真实感已经沉淀下来的共识，速度和质量的比例最好。如果你想在低 step 数下要稍微更多细节，切到 DPM++ SDE Karras。

[deliberate] 对于 Flux：使用默认 sampler，20-30 steps。

CFG

对于 SDXL 照片真实感：7-9。这能给出强 prompt adherence，同时避免 10 以上常见的过饱和、过度烹煮感。

[deliberate] 对于 SD 3.5：从更低开始（3-5），因为 guidance 机制不同。

对于 Flux：遵循模型自己的建议，但通常比 SDXL 更低。

Resolution

[deliberate] 在模型原生分辨率生成（SDXL/SD 3.5/Flux 为 1024x1024），然后再为更高分辨率做 upscale。不要试图直接生成 2048x2048，你会得到 artifacts、重复元素和构图问题。

Upscaling 选择：A1111 里的 hi-res fix，或者 ComfyUI 里的专用 upscaling nodes（4x-UltraSharp、ESRGAN）。

Prompting for Photorealism

[matter-of-fact] 和 2023 年相比最大的变化是：自然地写，不要写关键词。

SD 1.5 需要这样的 prompts。

SDXL 和 Flux 能理解。

关键词浓汤在 SDXL 上仍然能用，但自然语言会产生更连贯的结果。尤其是 Flux，非常擅长描述性、对话式 prompts。

Negative prompts： 保持最小。先从没有开始，然后加入具体修正。cartoon, illustration, painting 通常就足够让画面保持照片真实感。完整的 negative prompt 思路转变可以看 cheat sheet。

ControlNet 改变一切

[matter-of-fact] 如果你认真追求照片真实感构图，ControlNet 是不可商量的。它让你通过下面这些方式控制图像结构：

Depth maps -- 保持空间关系和透视。

Canny edge detection -- 保留轮廓和形状。

OpenPose -- 控制人体姿势和身体比例。

Surface normals -- 让光照和表面发生真实交互。

ControlNet 模型现在已经可用于 SDXL、Flux 和 SD 3.5。Multi-ControlNet（叠加多个控制）能给你 prompt engineering 单独做不到的精确构图控制。

工作流是：拿一张参考照片，提取 depth map 或 pose，把它作为 ControlNet input，然后生成同构图的照片真实感图像。

速度 vs. 质量

如果你需要快速迭代（概念工作、prompt 测试），用 SDXL Lightning。它能用 2-8 steps 生成质量不错的 1024px 图像。在更高分辨率上，它比 SDXL Turbo 质量更好。

[matter-of-fact] 最终输出时，切回完整 SDXL 或 Flux，25-30 steps。差异看得出来。

实用工作流

下面是 2026 年照片真实感输出真正有效的流程：

第一，选择模型 -- 最佳照片真实感用 Flux 2，SDXL 生态用 Juggernaut XL。

[deliberate] 第二，写自然语言 prompt，描述你看到的画面。

第三，以 1024x1024 生成，DPM++ 2M Karras，CFG 7-9，25-30 steps。

第四，使用 ControlNet，如果你需要特定构图（depth 或 pose）。

第五，迭代 prompt -- 生成 4-8 张，选最好的。

第六，Upscale 胜出的那张到目标分辨率。

第七，Inpaint 任何问题区域（手、眼睛、小细节）。

[matter-of-fact] 无论你在 ComfyUI 还是 A1111 里，这都是同一套工作流。工具不同，pipeline 不变。
