[matter-of-fact] 本文包含代码示例。音频版省略代码，只保留讲解。

[conversational tone] 如果你是在 M1/M2/M3 Mac 上做蓝牙相关开发，又想让 Android Emulator 使用宿主机的蓝牙无线电，大概已经吃过一点苦头。看起来应该很直接的事情，常常会变成一个让人恼火的洞：连接失败、错误信息晦涩、文档走到死路。我最近正好打完这场仗，撞了几堵墙之后，终于找到了一套使用 Bumble Python 蓝牙栈的组合，它真的能工作。

[reflective] 这不是又一篇理论指南；这是一次逐步记录：哪些方案失败了，更重要的是，哪套方案成功把我的 M1 Mac Pro 蓝牙（我这里通过外接 USB dongle，不过原理可能也适用于内置无线电）桥接到了 Android 12L（API 32）模拟器里。

[matter-of-fact] 目标：模拟器里的真实蓝牙

[matter-of-fact] 目标很简单：让 Android Emulator 使用我 Mac 的物理蓝牙控制器，而不是它自己有限的虚拟控制器。测试那些会和真实蓝牙设备交互的 App 时，这一点很关键。

工具：Bumble 上场

[deliberate] Bumble 是一个强大的 Python 蓝牙栈。完成这件事的核心工具是 bumble-hci-bridge，它可以一边连接物理 HCI（Host Controller Interface），另一边通过各种传输方式（比如 TCP 或 gRPC）暴露出来。

尝试 #1：QEMU Socket 方法（合乎逻辑的第一步）

[matter-of-fact] 基于一般的 QEMU 知识和一些较老的指南，第一种思路是用 emulator flags，把一个虚拟串口（底层由 TCP socket 支撑）直接连接到 HCI bridge。

[deliberate] 第一，启动 Bridge（TCP Server 模式）： 我们把 Bumble 连到物理 dongle（在我的机器上，令人意外的是 usb:0 比它具体的 VID:PID usb:0b05:17cb 更好用，M1 的小脾气！），然后让它监听一个 TCP 端口。

第二，带 QEMU Flags 启动模拟器： 我们修改了模拟器启动脚本（最初目标是 API 34），加入 -qemu flags，把一个虚拟串口（virtserialport）指向一个字符设备（chardev），而这个字符设备由连接到 bridge 的 TCP socket 支撑。

[resigned tone] 第三，结果？部分成功，最终失败： 通过 lsof，我们可以看到 emulator 的 QEMU 进程确实和 Bumble bridge 建立了 TCP 连接！然而，模拟器内部的 Android 蓝牙栈从未真正通过它发送任何 HCI 命令。在 Android 设置里切换蓝牙没有任何效果。初始连接之后，bridge 日志一直安静。死路。

尝试 #2：默认 Netsim Bridge（按 Bumble 文档来）

[flatly] Bumble 文档提到了桥接到模拟器的 “Netsim” gRPC 接口。Netsim（以及它的核心 Root Canal）是模拟器较新的虚拟蓝牙控制器系统。

[matter-of-fact] 第一，启动 Bridge（Netsim Controller 模式）： 我们把 bridge 配成 Netsim controller，让它监听默认 gRPC 端口（8554），并连接到物理 dongle。

第二，启动模拟器（默认后端）： 我们把启动脚本恢复回去（仍在尝试 API 34），移除 -qemu flags，并加入 -packet-streamer-endpoint default，确保它尝试使用 Netsim 后端。

[resigned tone] 第三，结果？没有连接： 这次模拟器启动了，但 Bumble bridge 完全没有显示来自模拟器的 gRPC 连接。检查模拟器日志也没有明显的连接错误，但蓝牙仍然不可用。又一条死路。

[flatly] 尝试 #3：降级 API + 显式 Netsim 端点（赢家！）

[emphasized] Fig1. - 一片超现实景观里，失败的网线垂在 Apple 与 Android 岩体之间；一座标着 Bumble 的绳桥成功连接两端，让发光的数据包跨过裂隙。

网上搜索显示，API 33/34 模拟器上的蓝牙有不少不稳定报告；模拟器发现或连接 Netsim 后端的方式也可能有问题，尤其是有外部工具试图拦截它时。关键似乎是：显式告诉模拟器 Netsim gRPC server 在哪里，并且尝试更老的 API 级别。

[deliberate] 第一，启动 Bridge（Netsim Controller 模式，显式端口，usb:0）： 和尝试 #2 一样，确保它监听已知端口（8554），并用之前稳定工作的索引（usb:0）连接物理 dongle。

[matter-of-fact] 第二，修改并启动模拟器（API 32，显式端点）： 我们创建了一个带 Google Play Services 的 API 32（Android 12L） AVD（gplay32arm）。我们修改启动脚本，让它指向这个 AVD；更关键的是，把 -packet-streamer-endpoint flag 从 default 改成 bridge 的确切地址。

[emphasized] 第三，结果？成功！ 这次它工作了。

bumble-hci-bridge 终端在模拟器启动后不久开始显示来自模拟器的 gRPC 连接日志。

[matter-of-fact] 模拟器启动完成后，在 Android Settings 里打开 Bluetooth，bridge 终端里立刻涌出一串 HCI 命令（Reset、Read Version、Set Event Mask 等）。

在模拟器内扫描设备时，确实通过 ASUS dongle 使用了 Mac 的物理蓝牙无线电。

[deliberate] 成功配方：一步一步来

下面是我的 M1 Mac Pro 搭配外接 ASUS USB-BT500 dongle 时实际成功的步骤：

第一，安装 Bumble。

第二，（可选但推荐）禁用 macOS 原生 USB BT 处理： 运行一次，然后重启。

[deliberate] 第三，启动 Bumble Netsim Bridge： 打开一个终端运行（保持它运行）。

（确认它显示两次 >>> connected。）

第四，准备模拟器启动脚本： 把下面提供的完整脚本保存为 launchgappsavdapi32.sh（或类似名字）。确认它指向 API 32 AVD（如果不存在，会创建名为 gplay32arm 的 AVD），并且显式使用 -packet-streamer-endpoint localhost:8554。给它执行权限（chmod +x launchgappsavdapi32.sh）。

[matter-of-fact] 第五，运行启动脚本： 打开一个新终端执行脚本。

第六，验证： 模拟器启动后：

查看 bumble-hci-bridge 终端是否有 gRPC 和 HCI 流量。

[slows down] 进入 Android Settings -> Bluetooth，把它打开。

[emphasized] 尝试扫描或配对。

[deliberate] 成功的启动脚本（API 32，显式 Netsim 端点）

[deliberate] M1 Mac + Emulator + Bumble 的关键结论

API 级别很重要： 对模拟器兼容性来说，更新不总是更好，尤其是蓝牙桥接这种复杂功能。在我的测试里，API 32 比 API 34 更稳定。

[matter-of-fact] 显式端点： 使用 Bumble 的 Netsim controller mode 这类外部 bridge 时，不要依赖 -packet-streamer-endpoint default。直接把模拟器指向 bridge 正在监听的 localhost:。

[deliberate] Netsim Bridge > QEMU Socket： android-netsim bridge mode 比更底层的 -qemu -chardev socket 方法更可能和现代模拟器正常配合，哪怕 socket 方法确实能建立 TCP 连接。

[reflective] usb:0 vs VID:PID： 在 macOS/M1 上，USB 设备识别可能有点古怪。如果指定精确 VID:PID 意外失败，试试用索引 usb:0（假设它就是主要/目标设备）。

坚持有回报： 这件事试了好几轮，结合了文档、网页搜索和反复测试。别太早放弃。

[gently] 希望这套具体可工作的配置能帮其他开发者省下几个小时的挫败。祝编码（和桥接）顺利。
