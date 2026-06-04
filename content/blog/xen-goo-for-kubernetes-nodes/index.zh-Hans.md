---
lang: "zh-Hans"
translationOf: "xen-goo-for-kubernetes-nodes"
translationUpdatedAt: "2026-06-04"
translationSourceHash: "3e73efc9d038ec41"
title: "Kubernetes 节点上的 Xen 黏液"
date: "2026-06-04"
description: "一个很小的 Kubernetes 隐喻，写给那些一听见 “tainted nodes” 就立刻想到 Half-Life 污染警报的开发者。"
featuredImage: "./images/featured.jpg"
imageCaption: "一个带标记的 token 放在绿光照亮的托盘格里，周围是一枚枚未标记的圆片。"
tags:
  - kubernetes
  - devops
  - software
  - metaphor
---

在 Kubernetes 里，一个被 taint 的节点听起来像是 Half-Life 里的东西。

你几乎能听见 Black Mesa 的广播：

> 警告。检测到 Xen 污染。

但这个概念没有名字听起来那么玄。**taint** 是节点上的一个标记，意思是：不是每个 pod 都能来这里。

想象一个集群节点沾满了放射性的外星黏液。普通 pod 不应该被放在那里。它们没有合适的防护。但某个特殊 pod 可能带着等同于 HEV 防护服的东西：一个 **toleration**。

taint 说：

> 这里危险、特殊，或者被预留了。

toleration 说：

> 我知道。我能处理。

关系就是这样。taint 不会把 pod 拉进去。它不是磁铁。它更像警告标签、排斥场，或者 Xen 污染标记。Kubernetes 看着这个 pod，然后问：这个工作负载能容忍这个条件吗？

如果能，它可能会被调度到那里。

如果不能，它就会避开。

这个区别重要。如果你想表达“把这个 pod 放到这类节点上”，你通常想的是 labels、selectors 或 affinity。Taints 和 tolerations 首先关乎排除。它们保护节点不被普通工作负载使用，除非那些工作负载明确选择加入。

所以当有人说 “the nodes are tainted” 时，我听见的是：

> Black Mesa 已经把这些机器标记为不安全、特殊或预留。只有带着正确抗性模块的 pod 才能进入。

不知怎么，这既很 Kubernetes，也很 Half-Life。
