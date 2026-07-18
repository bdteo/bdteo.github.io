太长不读： Huawei Watch D2 没有使用标准 BLE 配对。它要求的是一套 11 步专有握手，里面有自定义 GATT characteristic、从二维码派生 HMAC-SHA256 密钥，以及应用层加密。这是有意设计的厂商锁定，它把你推入华为的 Health 应用。好消息是：社区已经把它逆向出来了。Gadgetbridge 现在支持 Watch D2，也已经有 huawei-lpv2 这样的开源实现。欧盟 DMA 也开始反推这种做法。

[matter-of-fact] 我原本期待的是标准蓝牙配对。连接，绑定，交换数据，正常流程。结果我遇到的是一套专有的密码学握手，花了几周才逆向明白。

[flatly] 这发生在我做 D2Explorer 的时候。D2Explorer 是我用来在 Linux 和 macOS 上连接 Huawei Watch D2、绕开华为 Health 应用的项目。在解决 BlueZ 配对代理的问题并迁移到跨平台的 SimpleBLE 库之后，我以为最难的部分已经结束。最难的部分还没开始。

[conversational tone] 你本来会期待什么：标准 BLE 配对

[resigned tone] Bluetooth LE 配对本来应该是这样工作的：

[deliberate] 第一，按广播名称扫描设备（比如 "HUAWEI WATCH D2-CA0"）。

[matter-of-fact] 第二，用 peripheral.connect() 连接。

第三，操作系统处理配对/绑定：PIN 提示、Just Works，或者安全级别要求的任何方式。

第四，绑定完成后，和标准或自定义 GATT 服务交互。

安全由操作系统管理。你的应用专注于数据。简单。

实际发生了什么：一个 11 步专有握手

Watch D2 实际要求的东西完全不同。基础 BLE 连接只是门。门后面是华为叠在标准 BLE 之上的一套自定义应用层认证协议，也就是社区所说的 Huawei Link Protocol v2。

[deliberate] 标准 BLE 配对机制被完全绕开了。要认证并访问任何有意义的数据，你需要通过自定义 GATT characteristic 走完这一串流程：

第一，Connect -- 建立基础 BLE 链路。

第二，Enable Notifications -- 立刻订阅 characteristic 0000fe02-... 上的通知。这个步骤对时序非常敏感，错过窗口，手表就会断开。

第三，GetLinkParams -- 立刻向写入 characteristic 0000fe01-... 发送自定义命令（Service ID 0x0001，Command ID 0x0001）。

第四，Receive Server Nonce -- 等待包含手表随机 challenge 的通知。

第五，Derive Secret Key -- 生成 client nonce。把 server nonce、client nonce 和手表二维码里的数值组合起来。运行 HMAC-SHA256（使用二维码数值的字节作为密钥），派生共享的 secretKey_。

第六，AuthRequest -- 把 client nonce 和 HMAC digest（使用派生出的 secretKey_）发回手表（Service 0x0001，Command 0x0002）。

第七，Verify Server Token -- 接收手表的认证 token。用 secretKey_ 和已交换的 nonce 验证它。

第八，SetTime -- 发送当前时间和时区偏移，并用 secretKey_ 加密（Service 0x0002，Command 0x0003）。

[deliberate] 第九，QrToken -- 把二维码数值发回去，并用 secretKey_ 加密（Service 0x0001，Command 0x0004）。

第十，AuthResult -- 发送最终确认，并用 secretKey_ 加密（Service 0x0001，Command 0x0005）。

[reflective] 第十一，Done -- 到这里，连接才算完成认证。

自定义 TLV 消息格式。CRC 校验。Service 和 command ID。应用层加密。以毫秒为单位敏感的时序。这一切都发生在 BLE 栈之上，标准蓝牙工具根本看不见。

[flatly] 手表屏幕上的二维码就是共享秘密。没有它，你派生不出密钥。没有密钥，你无法认证。没有认证，手表什么都不会给你。

华为为什么这么做

[resigned tone] 华为也许会把它描述成增强安全。实际效果是厂商锁定。

[conversational tone] 极高的进入门槛 -- 协议没有文档。重新实现它需要逆向华为 Health 应用（13,000+ 个类，64,000+ 个方法 ），或者分析 BLE 流量。这会主动劝退第三方应用。

没有互操作性 -- 标准健身应用无法连接。手表只会和知道这些专有步骤的软件完成握手，主要就是华为自己的 Health 应用。

[flatly] 生态控制 -- 用户被迫进入 Huawei Health 及其云服务。以后想换设备或平台，就意味着失去自己的健康数据历史。

减少用户选择 -- 想用开源应用？想对自己的健康数据隐私有更多控制？运气不好。除非有人先把协议逆向出来。

[deadpan] 问题在这里：这并不是华为独有的事。WatchWitch 研究项目 记录了所有主要厂商，包括 Apple、Samsung、Xiaomi，如何用专有 BLE 协议强制生态锁定。Apple Watch 被描述为 "incredibly tightly coupled with Apple's iPhone and iCloud ecosystem, using proprietary protocols that are unavailable to third parties." 这是一个行业层面的系统问题。

但华为的实现尤其激进。BLE 当然允许自定义服务。可用一个专有守门人取代根本性的认证机制，就是另一回事了。

[flatly] 安全上的讽刺

最显然的辩护是：“我们这么做是为了安全。”那就看一看。

[deadpan] 清华大学的 BlueDoor 漏洞研究 测试了 16 个 BLE 设备，包括 Honor Band 3（同一个华为生态），并在其中大多数设备上实现了无需用户授权的静默配对。专有协议没有阻止这件事。

[matter-of-fact] 与此同时，这套协议本身已经被逆向过多次：Gadgetbridge 社区逆向过，huawei-lpv2 项目逆向过，在 Easterhegg 2019 演讲的研究者逆向过，我也为 D2Explorer 逆向过。靠遮掩获得的安全，是带有效期的。

[conversational tone] 从二维码派生 HMAC-SHA256 密钥，本身其实是不错的密码学。但重点不在这里。你完全可以用标准 BLE Secure Connections 加带外配对方式（比如 NFC 或二维码）获得同样的安全属性，而且不需要在过程中把所有第三方应用挡在门外。

社区的反击

社区没有安静接受。

[deliberate] Gadgetbridge

Gadgetbridge 是面向可穿戴设备的开源 Android 应用，现在已经支持 Huawei Watch D2。你可以不通过华为 Health 应用来配对手表。它花了相当多的逆向工程努力（见 PR #2462 ），也有一些限制，比如用 Gadgetbridge 配对时 ECG 功能会被禁用，但它确实可用。

Gadgetbridge 里的认证实现处理 auth version 3，从配对消息（service 0x01，command 0x0e）计算 bonding key，并用它进行解密。认证密钥协商需要一个 17 位的华为账号 ID。

huawei-lpv2

[reflective] huawei-lpv2 项目提供了 Huawei Link Protocol v2 的纯 Python 实现。它仍在维护，有多个 fork，也给所有想在官方生态之外做华为可穿戴集成的人提供了参考。

D2Explorer

我自己的 D2Explorer 走了另一条路：用 SimpleBLE 做一个能在 Linux 和 macOS 上工作的 C++ 实现。这项工作包括：

[resigned tone] 实现 TLV 序列化/反序列化（HuaweiProtocol）。

构建精确的消息构造器（ProtocolMessageBuilder）。

把密码学步骤做对：nonce 生成、HMAC-SHA256、XOR 加密（CryptoOperations、CryptoUtils）。

管理严格的状态转换和时序（HuaweiPairingProtocol、ProtocolStateManager）。

[deliberate] 调试由毫秒级时序不匹配和细微加密错误引起的失败。

D2Explorer 之所以存在，正是因为华为的协议让它变得必要。它是在围墙花园之外获得基本功能所需要的绕行方案。

AsteroidOS

AsteroidOS 2.0 于 2026 年 2 月发布，是这个基于 Linux 的开源智能手表 OS 的一次重大更新。它现在支持约 30 款设备，包括 Huawei Watch 和 Huawei Watch 2，并带有常亮显示、抬腕唤醒等功能。这是一个完整的、开源的华为固件替代方案。

[emphasized] 监管潮水

[reflective] 欧盟不只是旁观。Digital Markets Act（DMA）正在开始迫使事情改变。

2025 年 12 月，Apple 发布了 iOS 26.3，为第三方设备，包括华为智能手表，加入类似 AirPods 的配对体验，明确是为了遵守 DMA 要求。华为手表和 iPhone 之间的后台同步已经在欧洲可用。

[matter-of-fact] DMA 要求守门人向互联设备提供互操作性。这正面瞄准了华为、Apple 以及其他所有厂商一直在实践的这种专有 BLE 锁定。这些互操作功能预计会在 2026 年全年继续铺开。

[flatly] 这很重要。第一次，监管压力开始要求标准化那些厂商刻意保持专有的东西。技术社区可以一个协议一个协议地逆向，但监管可以改变整个行业的激励结构。

[conversational tone] 这意味着什么

Huawei Watch D2 的配对协议，是一个很好的案例：标准传输之上的自定义协议，如何被用来强制厂商锁定。那些专有密码学、自定义消息格式和对时序敏感的握手之所以存在，并不是因为标准 BLE 处理不了认证。它能处理。它们存在，是因为专有协议能把用户留在生态里。

[reflective] 不过局面正在变化。Gadgetbridge 现在就给了你替代方案。欧盟 DMA 在监管层面推动互操作性。huawei-lpv2、D2Explorer 和 AsteroidOS 这样的开源项目也证明了：厂商想锁住的东西，社区会去逆向。

[deliberate] 做 D2Explorer，与其说是在做蓝牙，不如说是在做密码学侦探工作。它凸显了一件本不该反复强调的事：你应该能用自己选择的软件访问自己的健康数据。
