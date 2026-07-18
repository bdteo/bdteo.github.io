[matter-of-fact] 本文包含代码示例。音频版省略代码，只保留讲解。

TL;DR: 如果你在 BlueZ 5.66+ 上用自定义 C++/sd-bus 配对 agent 时遇到 org.bluez.Error.AuthenticationFailed，问题很可能出在内部 agent 注册上。把外部 Python agent（simple-agent.py）作为独立进程运行，并实现 D-Bus 属性轮询，不要只依赖 PropertiesChanged 信号。细节和代码在下面。

[matter-of-fact] 我盯着 org.bluez.Error.AuthenticationFailed 看了两天，才弄明白到底发生了什么。

配对 agent 已经注册。D-Bus 调用看起来是对的。busctl 确认所有东西都在位——而 BlueZ 只是继续说不。这发生在 D2Explorer 的开发过程中——一个在 Linux 上与 Huawei Watch D2 配对的工具——而这个配对错误把一切都挡住了。

[reflective] 下面是真正发生的事，以及我们最后是怎么修好的。

计划：一个内部 C++ 配对 Agent

[conversational tone] 想法很干净，也很自洽。一个单独的 C++ 应用，使用 sd-bus（C/C++ 的 D-Bus 绑定）处理整个配对流程：

第一，连接到系统 D-Bus。

第二，找到 Bluetooth 适配器（org.bluez.Adapter1）。

[matter-of-fact] 第三，实现一个暴露 org.bluez.Agent1 接口的 C++ 类。

第四，通过 RegisterAgent 和 RequestDefaultAgent 在 org.bluez.AgentManager1 上注册 agent。我们一开始使用 DisplayYesNo 能力，后来简化为 NoInputNoOutput。

第五，发现目标设备（org.bluez.Device1）。

第六，在设备的 D-Bus 接口上调用 Pair()。

[deliberate] 第七，内部 agent 自动处理回调（RequestConfirmation、RequestAuthorization）——不需要用户交互。

第八，信任设备，建立 GATT 连接，完成。

一个二进制文件，没有外部依赖。这就是计划。

[matter-of-fact] 墙：org.bluez.Error.AuthenticationFailed

一切都工作到第 6 步。找到了适配器，注册了 agent（D-Bus 也确认了），发现了设备。但我们通过 sdbuscall_method 调用 Device1.Pair() 的那一刻——立刻失败。

我们什么都试过了。不同的 agent 能力。检查 sd-bus vtable 设置。验证 agent 方法实现会及时返回成功。用 busctl 和 gdbus 监控 D-Bus 流量——注册调用看起来都是正确的。Pair() 调用就是一直失败。

死路。

突破：外部 Python Agent

为了隔离问题，我们把内部 C++ agent 从方程里拿掉。我们先把 BlueZ 标准的 simple-agent.py 作为独立进程运行起来，然后再启动我们的 C++ 应用（此时它已经去掉了自己的 agent 注册）。

[resigned tone] 稳定。每次都稳定。AuthenticationFailed 错误完全消失了。

这证明问题不在 Pair() 本身，也不在设备或 BlueZ 的配对能力。问题具体出在我们的 C++ 应用如何使用 sd-bus 注册并作为配对 agent 交互。完全相同的逻辑操作——注册一个 NoInputNoOutput agent 并调用 Pair()——在 agent 作为独立 Python 进程运行时工作得很好。

[deliberate] 这条路通了。

为什么内部 Agent 会失败？

我第一次撞上这个问题时，手里只有一些假设。从那以后，我找到了实际的文档证据，说明这是一个更广泛的问题——不只是我们的代码。

BlueZ 5.70+ 回归

[matter-of-fact] BlueZ GitHub Issue #605 记录了一些案例：设备在 BlueZ 5.50 上可以正常配对，但在较新版本上会以 auth failed with status 0x05 失败。HCI 日志显示 Status: PIN or Key Missing (0x06)，即使已存储 link keys。解决办法？运行旧的 bluez-simple-agent.py 脚本。听起来熟悉吗？

Agent 可用性是根因

Bleak Issue #1434 让这一点更清楚：只有在 bluetoothctl 或 GNOME Bluetooth 正在运行时，配对才会成功，因为这些应用注册了必要的认证 agent。没有一个活跃且真正能工作的 agent，BlueZ 内部会返回 No agent available for request type 2——表面上则变成 AuthenticationFailed。

[reflective] 关键认识是：仅仅注册一个 agent 不够。agent 还需要以 bluetoothd 认为有效的方式响应 BlueZ 的回调。而 sd-bus 在同一个发起配对的进程里处理这件事时，有某些细节并不能满足较新版 BlueZ 的要求。

甚至可能不是 BlueZ

[emphasized] Red Hat Bug #1905671 显示，有些 AuthenticationFailed 错误与内核有关，而不是 BlueZ。Kernel 5.9 存在配对问题，而 5.8.18 和 5.10+ 没有。维护者的评论值得引用：“Bluetooth is complex, it could be firmware, kernel, bluez, controller, end device or a combination of them all.”

Agent Capability 不匹配

[reflective] BlueZ Issue #650 记录了另一个角度：某些设备（尤其是 iOS）在与 NoInputNoOutput agent 配对时会失败，因为它们会把 Secure Connections 降级到 Legacy pairing，导致后续属性访问出现 Insufficient Authentication (0x05) 错误。这是 Security Manager Protocol（SMP）协商问题，不是 agent 注册问题——但它会产生同样的错误消息。

[matter-of-fact] 我们这个案例中最可能的罪魁

[deliberate] 结合这些证据，内部 sd-bus agent 失败最可能的解释是：

第一，时序——我们事件循环中的 sd-bus 注册或方法处理，没有在 bluetoothd 期望的精确窗口内响应。

第二，sd-bus 与 python-dbus 的细微差异——这些库与 D-Bus 守护进程交互或处理对象生命周期的方式不同。

第三，BlueZ 5.66+ 中更严格的要求——agent 交互的内部序列发生了变化，而 sd-bus 在与发起配对的应用同进程使用时无法满足。

第二堵墙：D-Bus 信号不可靠

[conversational tone] 越过 AuthenticationFailed 是一大步，但事情还没结束。有了外部 agent，Pair() 成功了——但我们无法可靠地检测它什么时候完成。

我们依赖 D-Bus 的 PropertiesChanged 信号（通过 sd-bus）来知道 Paired、Trusted、Connected 和 ServicesResolved 什么时候变成 true。有时信号会来。有时来得很晚。有时根本不来。

所以我们实现了主动轮询——当信号不出现时，直接查询属性值作为兜底。

[matter-of-fact] 每一个状态转换方法（isPaired()、isTrusted()、isConnected()、areServicesResolved()）都遵循同一个模式：先检查缓存的原子布尔值（如果 signal handler 工作，它会更新这个值），然后退回到一次直接的 D-Bus Get 属性调用。

不优雅。但必要。

这条路也通了。

[slows down] 完整修复

下面是整理后的方案。如果你在 Linux 上使用 BlueZ 5.66+ 构建自动 Bluetooth 配对，并且撞上了 AuthenticationFailed：

[deliberate] 第 1 步：拿到 simple-agent.py

从 BlueZ source tree 获取它。

第 2 步：运行外部 agent

[resigned tone] 让它在一个单独终端里保持运行（或者作为后台服务运行）。

[emphasized] 第 3 步：从你的应用中移除内部 agent

从你的 C++ 应用里移除所有 RegisterAgent / RequestDefaultAgent 调用。让外部 Python agent 处理认证回调。

[matter-of-fact] 第 4 步：添加 D-Bus 属性轮询

不要只依赖 PropertiesChanged 信号。对于每个关键属性（Paired、Trusted、Connected、ServicesResolved），实现上面展示的缓存后轮询模式。从主循环里周期性轮询。

第 5 步：验证

第一，确认外部 agent 正在运行（sudo python simple-agent.py NoInputNoOutput）。

第二，运行你的应用。Pair() 应该会成功。

[conversational tone] 第三，观察轮询日志——你应该能看到用于状态转换的 D-Bus 属性查询。

第四，如果 Pair() 仍然失败，检查你的 BlueZ 版本（bluetoothd --version）和 kernel 版本——问题可能更深。

[reflective] 代价是什么

我不会假装这是一个干净的方案。它不是：

[matter-of-fact] 第一，外部依赖——你的应用现在需要另一个 Python 进程保持运行。

[deliberate] 第二，更多复杂度——主循环里有轮询逻辑，还叠在 signal handlers 之上。

第三，更不自包含——单个二进制文件的梦想没了。

[conversational tone] 但它能工作。可靠地工作。而当你已经盯着 AuthenticationFailed 看了两天，“它能工作”就是最重要的事。
