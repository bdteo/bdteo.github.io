---
lang: "zh-Hans"
translationOf: "how-things-break"
translationUpdatedAt: "2026-06-03"
translationSourceHash: "10ab5b22e8e281e7"
title: "事情是怎么坏掉的"
date: "2026-06-03"
description: "一个很小的生产发布故事，关于巧合、后台工作，以及现实给自己的 bug report 起名时那种荒唐的优雅。"
featuredImage: "./images/featured.jpg"
imageCaption: "一个黄铜门把手被一把小小悬挂的钥匙勾住，门下有冷光在等待。"
tags:
  - 软件
  - 事故
  - 工程
  - 故事
---

有一种讽刺，像是被写出来的。

生产发布本该无聊。这就是梦想。清单一项项过去，tag 打上了，迁移跑完了，仪表盘保持安静，没有人在下午四点学到一种新的数据库行为。

这一次另有安排。

应用停止回应，只留下一个短小、残忍的句子：

> no healthy upstream

不诗意。不戏剧化。只是刚好足以让房间变窄。

我们暂停发布，顺着等待往下追。一次迁移想改变一张表的形状。另一个东西站在门口。

一开始，我去找那个戏剧化的原因。新代码。迁移本身。那条吓人的路径。

都不是。

它只是一个普通的后台 job，由一个普通的用户操作触发，却把一个数据库事务撑得比需要的更宽。大多数日子里，这只是有点没礼貌。到了发布日，它就成了架构。

那条连接看起来是 idle。技术上说，是 sleeping。它没有跑 query。它不忙。它只是待在那里，仍然在迁移需要的那张表上攥着一点小小的占用。

睡着了，但手还搭在门把手上。

然后笑话来了。

启动那个 job 的用户操作，牵涉到一个叫 **How Things Break** 的页面。

当然会是它。

一次发布，因为 **How Things Break** 而坏掉了。

后来，故障恢复、系统重新健康之后，我数了一版更早的草稿。它有 1,199 个词。我查了这个数字，大多只是当作玩笑，然后互联网告诉我，1199 意味着 **“一个重大生命循环的结束，以及一条新路径的开始。”**

配乐，自然是 _Lorn - Anvil_。

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/I_ihVaAIWhY"
  title="Lorn - Anvil"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen
></iframe>

荒唐。

也准确。

教训就这么多。代码库里一种旧形状，走到了有用生命的尽头。修复并不神秘：缩小事务，强化发布路径，更新 runbook。

但仍然。

软件的大半辈子都在假装自己是逻辑的。然后现实递交了一份 bug report，标题比你起得更好。

教训很简单：

日常路径值得怀疑。

不是偏执。是怀疑。

人们每天使用的代码，正是妥协累积的地方。它变得熟悉，而熟悉是一种镇静剂。

有时候，生产环境用火来教你。

有时候，它用一个数字、一个名字，和一个包袱来教你。
