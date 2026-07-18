[matter-of-fact] 本文包含代码示例。音频版省略代码，只保留讲解。

[matter-of-fact] 邮件在失败。这部分是预料之中的：迁移过程中 SMTP 凭据坏了。没预料到的是：它们从未停止失败。

Horizon 仪表盘：绿色。Worker：健康。Redis：慢慢变大。没有告警，日志里没有错误。只有一堆安静累积的任务，一次又一次又一次地重试。

[calm] 我是因为修好 SMTP 配置以后，Redis 内存没有降下来才注意到的。里面还有什么东西，正在咀嚼那些重试。成千上万次。

[reflective] 我以为队列会处理好这件事。规则不就是这样吗：一个 job 失败，重试几次，落进 failed_jobs。然后你继续往前走。

除非这个 job 是一个 Mailable。

[deliberate] 当你把一个 Mailable 分发到队列时，Laravel 会把它包进一个 job。这个 job 的 maxTries 来自 Mailable 的 $tries 属性。如果你没有设置它——你为什么会设置呢，文档几乎没提——它会被序列化成 null。

[matter-of-fact] null 不是“使用 supervisor 默认值”。null 是“没有限制”。Horizon 看到 null，就会想：这个 job 想永远重试。于是它就这么做。

[stress on next word] 结果这是个已知 bug。。当序列化后的 job payload 携带 maxTries: null 时，supervisor 的 --tries 标志会被忽略。job 自己的声明赢了，而它的声明说：永远不要停。

二十九个 Mailable 类。每一个都没有显式的 $tries 属性。每一个都可能不死。

[reflective] 修复简单到几乎有点冒犯。

[deliberate] 两个属性。二十九个文件。就这样。

一次初始尝试，一次重试，然后进 failed_jobs。就像我原本以为它一直会那样工作。

[resigned tone] 我测试它的方式像是在测试捕鼠夹。故意弄坏 SMTP 配置。分发一封邮件。看 Horizon。两次尝试。Failed job。结束。队列里没有幽灵。

[calm] 然后我修掉另外二十八个。

[reflective] 三条教训，压缩版：

第一，null 不是“默认值”。 在序列化的 job payload 里，maxTries: null 意味着无限。你的 supervisor 配置只是建议，不是规则。

第二，绿色仪表盘会撒谎。 Horizon 显示 worker 很健康，正高高兴兴地处理永远不会结束的 job。

[slows down] 第三，框架默认值不总是合理。 Laravel 不会在 Mailables 上设置 $tries。你必须自己设置。文档不会在火烧起来之前提醒你。

[resigned tone] 最吓人的 bug，是那些看起来像正常运行的 bug。这个就是——而且持续了好几个星期。
