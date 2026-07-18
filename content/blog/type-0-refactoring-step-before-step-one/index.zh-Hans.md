---
lang: "zh-Hans"
translationOf: "type-0-refactoring-step-before-step-one"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "16a0b76cc24c4b04"
title: "Type 0 重构：先让代码可理解，再改变行为"
date: "2025-12-13T12:00:00.000Z"
description: "Type 0 重构是真正改动代码之前保持行为不变的那一步：把混乱代码变得可理解、可测试、可评审，而不是做清理表演。"
tags: ["重构", "软件工程", "调试", "可维护性"]
featuredImage: "./images/featured.webp"
imageCaption: "Mise en place。工作之前的工作。"
audioUrl: "/audio/articles/type-0-refactoring-step-before-step-one/zh-Hans/EttSxNTvxX50EUdRPQQl-140375c838cb.m4a"
audioDuration: "20:55"
audioVoice: "Jordan Li (ElevenLabs Mandarin grounded)"
audioGeneratedAt: "2026-07-18"
audioTextSource: "content/tts/type-0-refactoring-step-before-step-one.zh-Hans.md"
---

有一种重构，团队一直在做，通常是在压力之下，通常也不会给它命名。

你打开 bug 所在的文件。方法太长。名字已经疲惫。分支像地下室里的旧椅子一样堆在一起。你可以很身体化地感觉到：在这种代码形状里做被要求的改动，不是个好主意。

但你还没有准备好重新设计它。

你不是在尝试引入新的抽象。

你不是在试图证明自己是房间里的 clean-code 那个人。

你只是想让当前行为变得足够可理解，让下一个改动可以安全地做。

我把这叫作 **Type 0 重构**。

或者，用没那么好记但更精确的话说：

> Type 0 重构，是你在改变行为之前做的、保持行为不变的清理，让代码变得可读、可测试、可评审。

它是第一步之前的那一步。

不是正式翻修。是清空工作台。是给线缆贴标签。是在把手伸进去之前，先让那个东西变得可读。

## 为什么 Type 0 值得有一个名字

[Martin Fowler 将重构定义为](https://refactoring.com/)在不改变外部行为的前提下改变代码的内部结构。这种精确很重要。如果行为变了，那仍然可能是有价值的工作，但严格来说它不是重构。

Type 0 比这更窄。

普通重构可能改善设计。Type 0 可能不会。

普通重构可能在类之间移动职责。Type 0 不应该。

普通重构可能创造更好的领域边界。Type 0 更早停下：它让现有代码说出自己已经在做什么。

这听起来很谦逊，直到你在 hotfix 中盯着一个 900 行方法，脑子开始缓冲。

丑代码里的直接问题往往不是架构。是**可理解性**。你无法安全改变一个你无法放进脑子里的东西。

Sonar 关于 [Cognitive Complexity](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) 的工作在这里很有用，因为它把“存在多少路径？”和“人类跟起来有多难？”分开了。Type 0 瞄准的是第二个问题。它减少 reviewer 必须在脑中模拟的状态、分支、命名歧义和视觉噪音。

这不是化妆。这是降低风险。

## 这个概念真正点亮的时刻

这个名字来自一次 hotfix。

bug 本身并不深奥。围绕它的方法才深。那种方法里，每个局部变量看起来都很无辜，直到你意识到它携带的是三屏之前的意义。每个条件单独看都能活下来，但组合起来会让执行路径显得不稳定。

我不需要漂亮的设计。

我需要可调试性：

- 每屏更少的分支
- 用来描述业务意图，而不是临时机制的名字
- 我可以逐步跟进去的更小块
- 一种能 review 清理、但不用同时 review bug fix 的方式

一个 LLM 建议了几种合理的重构“类型”。抽出这个 service。引入那个 pattern。拆分职责。都是好主意。对当时来说都太多了。

它问是否应该从 Type 1 开始。

我说：不，从 Type 0 开始。

意思是：在改善设计之前，先让当前代码变得可读，同时不改变它做的事。

这个区分救了那次工作。方法变得可以导航。bug 变得可见。fix 保持得很小。

## 一个工作定义

**Type 0 重构是一轮受约束、保持行为不变的整理，它在功能改动之前让代码更容易理解。**

它有四个允许的动作：

1. 把有意义的部分提取成有名字的方法或局部变量。
2. 重新命名，让代码使用人的语言，而不是考古学。
3. 移除能够证明未被使用的噪音。
4. 围绕你即将保持的行为，添加或收紧 characterization tests。

它也有三条硬边界：

- 不引入新的产品行为
- 不做架构移动
- 不做会改变 review 问题的“既然来了”式改进

如果 PR 改变了用户、callers、jobs、API responses、database writes、emitted events 或 error paths 能观察到的东西，它就不再是 Type 0。那仍然可能是正确的工作，但需要诚实命名。

## 前后对比：Type 0 的形状

这里是一个小例子。它故意很普通。大多数有用的重构都很普通。

之前：

```ts
export function canStartTrial(account: Account | null, plan: Plan) {
  if (!account || account.deletedAt) {
    return false;
  }

  if (account.flags.includes("trial_blocked")) {
    return false;
  }

  if (account.subscription && account.subscription.status !== "canceled") {
    return false;
  }

  if (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  ) {
    return false;
  }

  if (plan.priceCents === 0 || plan.hidden) {
    return false;
  }

  return true;
}
```

这段代码并不糟糕。这一点很重要。Type 0 不只是给灾难现场用的。

但想象一下你需要改变 trial eligibility。你在改哪条规则？哪一条是人工策略？哪一条是 billing history？哪一条是 plan eligibility？Reviewer 必须从机制里推断出这些。

经过一轮 Type 0 之后：

```ts
export function canStartTrial(account: Account | null, plan: Plan) {
  if (isMissingOrDeleted(account)) return false;
  if (isManuallyBlockedFromTrial(account)) return false;
  if (hasActiveSubscription(account)) return false;
  if (hasPaidBeforeOrActiveTrial(account)) return false;
  if (isIneligibleTrialPlan(plan)) return false;

  return true;
}

function isMissingOrDeleted(account: Account | null) {
  return !account || Boolean(account.deletedAt);
}

function isManuallyBlockedFromTrial(account: Account) {
  return account.flags.includes("trial_blocked");
}

function hasActiveSubscription(account: Account) {
  return Boolean(account.subscription && account.subscription.status !== "canceled");
}

function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}

function isIneligibleTrialPlan(plan: Plan) {
  return plan.priceCents === 0 || plan.hidden;
}
```

这不是新设计。它没有引入 policy object。它没有决定 trial eligibility 是否应该属于另一个 module。它也没有让规则更优雅。

它只做一件事：给现有行为命名。

现在下一个 PR 可以说：“改变 `hasPaidBeforeOrActiveTrial`，让过期的 paid subscriptions 被不同处理”，reviewer 就不再需要在匿名条件里钻来钻去。

这就是 Type 0 在发挥作用。

## 危险的部分：即使“只是提取”也可能改变行为

Type 0 听起来安全，因为它很小。它更安全，但不是魔法般安全。

如果你不小心，提取可能在这些地方改变行为：

- 求值顺序
- short-circuiting
- 变量作用域
- mutation
- exception timing
- 对 time、random、IO、caches 或 database queries 的重复调用
- 原本指向同一个 object 的 references

这里 Type 0 需要纪律。

不要因为重写后的条件“等价”就重写它。等价性就是 bugs 贴上小胡子、从安保面前走过去的地方。

优先这样：

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  return (
    account.invoices.some((invoice) => invoice.status === "paid") ||
    account.trials.some((trial) => trial.endsAt > new Date())
  );
}
```

而不是这样：

```ts
function hasPaidBeforeOrActiveTrial(account: Account) {
  const paidBefore = account.invoices.some((invoice) => invoice.status === "paid");
  const activeTrial = account.trials.some((trial) => trial.endsAt > new Date());

  return paidBefore || activeTrial;
}
```

第二个版本看起来更好，但它不再保持 short-circuit 行为。如果 `account.invoices` 已经证明了答案，旧代码从未碰过 `account.trials` 或 `new Date()`。也许这不重要。也许重要。Type 0 不让 reviewer 去猜。

拿不准时，先提取，之后再美化，并且让每一步都无聊到一个疲惫的人也能验证。

## 安全网：先刻画，再相信

如果代码已经测试得很好，那很好。Type 0 之前和之后都跑聚焦测试。

如果没有，忍住别说：“这只是 cleanup。”

这句话放出过一千个回归。

Michael Feathers 的 _Working Effectively with Legacy Code_ 仍然是我在这里会想到的书；[O'Reilly 的概览](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)把它放在“修改 legacy systems 而不是重写一切”的框架里。实践中，有用的动作常常是一个小的 characterization test：捕捉代码当前对你即将触碰的路径实际做了什么。

不是它应该做什么。

是它现在做什么。

例子：

```ts
it("preserves the current trial eligibility rules for blocked accounts", () => {
  const account = accountFactory({
    flags: ["trial_blocked"],
    subscription: null,
    invoices: [],
    trials: [],
  });

  expect(canStartTrial(account, paidPlan)).toBe(false);
});
```

这个测试在哲学上可能不令人满意。它可能编码了你五分钟后就打算改变的行为。

没关系。在改变行为的 PR 里删除或更新它。

对 Type 0 PR 来说，它的工作很朴素：证明这次清理没有偷偷夹带真正的改动。

## 什么时候使用 Type 0

当下一个改动被可理解性挡住时，使用 Type 0。

好的信号：

- 你反复重读同一个方法，却总是丢掉线索
- 文件有一个“main”方法，混合了 validation、branching、IO、formatting 和 persistence
- 一个一行 bug fix 需要解释六个无关事实
- reviewers 一直在争论 style，因为意图不可见
- 代码足够正确，能让业务跑起来，但太浑浊，无法有信心地修改
- 你需要添加 tests，但当前形状没有给你干净的位置来观察行为

避免使用 Type 0 的情况：

- 功能改动已经明显且安全
- 你无法精确说明哪些行为必须保持不变
- cleanup 需要触碰系统中很多 callers
- 团队试图把 redesign 偷塞进“cleanup”标签里
- 没有近期改动会受益于这份清晰度

最后一点很重要。没有 customer 的 cleanup 常常会变成品味。Type 0 有 customer：下一个改动。

## 一条 Type 0 决策规则

我使用的规则是：

> 如果我无法把 behavior-changing diff 写到 reviewer 能快速理解，我大概需要先做 Type 0。

不总是。但足够经常。

你也可以把它表述成三个问题：

1. 我即将改变什么行为？
2. 哪个当前行为必须完全保持不变？
3. 哪个小的可读性整理，会让这两个答案在 diff 里显而易见？

如果第三个问题有一个小答案，就做 Type 0。

如果它有一个巨大答案，你看到的可能是真正的重构，而不是 Type 0。拆分工作，制定计划，别再假装它无害。

## 如何组织 PR

Type 0 在作为独立事物可 review 时效果最好。

如果 cleanup 很小，把它放进功能 PR 的第一个 commit：

1. `Type 0: name existing trial eligibility checks`
2. `Fix expired subscription trial eligibility`

如果 cleanup 大到让行为 diff 难以看清，就开一个单独的 PR。

使用无聊的 PR 语言：

```md
This PR is Type 0 only.

Intent:
- make the existing trial eligibility path readable before changing the rules
- preserve current behavior

Changed:
- extracted the top-level eligibility checks into named predicates
- renamed temporary variables to match existing domain terms
- removed one unused private helper

Validation:
- existing eligibility tests pass
- added characterization coverage for blocked, paid-before, and active-trial accounts

Out of scope:
- changing trial eligibility rules
- moving this logic into a policy/service object
```

这给 reviewers 一个正确的工作。

他们不是在 review 产品逻辑是否更好。他们是在 review 代码是否仍然做同一件事，只是更清晰了。

好的 Type 0 review comments 听起来像这样：

- “这个 extraction 改变了 `new Date()` 的求值时间。我们能保持旧的 short-circuit 行为吗？”
- “新名字说 `active subscription`，但这个 predicate 也把 `past_due` 当成 active。名字能和真实行为一致吗？”
- “这个删除的 helper 在这个 package 里看起来 unused，但它会不会被 reflection/config 引用？”
- “我们能给这次 cleanup 暴露出的路径加一个 characterization test 吗？”

不太有用的 comments 听起来像这样：

- “我们能把它变成 strategy 吗？”
- “整个 module 都应该是 event-driven。”
- “既然你在这里，能不能修一下那个奇怪的 billing edge case？”

这些可能是好主意。但它们不是 Type 0 review。

## Type 0 和清理表演有什么不同

清理表演，是那种在 diff 里看起来很正派、却没有降低下一次改动风险的工作。

它通常有这些味道之一：

- 在没人即将触碰的文件里做大范围 formatting churn
- 基于个人品味而不是 domain clarity 的重命名
- 在任何人能说清当前行为之前，就把代码移进新 abstractions
- 删除“unused” code，却没有证明 runtime 无法抵达它
- 把 cleanup 和 behavior change 混在一起，让 reviewers 分不清哪一行做了什么
- PR description 写着“misc cleanup”

Type 0 不同，因为它需要负责。

它说：

- 这是我们正在保持的行为
- 这是我们正在变得可理解的路径
- 这是它让下一个改动成为可能的地方
- 这是我们如何检查 cleanup 没有改变行为

这就是整理和工程之间的区别。

## Type 0 和 legacy seams

有时 Type 0 会揭示，下一个安全动作是一个 seam。

Fowler 关于 [legacy seams](https://martinfowler.com/bliki/LegacySeam.html) 的笔记很有用，因为它描述了一些地方：我们可以在那里重定向、观察或测试行为，而不用在行为发生点编辑 source。在 legacy system 中，一个 seam 可能就是“我们可以测试这个”和“我们非常专业地希望它没事”之间的区别。

但创建 seam 可能会跨过 Type 0 边界。

提取一个方法，让当前 flow 有名字：

```ts
const shippingCost = await calculateShipping(order);
```

到：

```ts
const shippingCost = await calculateShippingForOrder(order);
```

如果行为保持不变，这可以是 Type 0。

改变 function signature，让 tests 可以注入 fake shipping provider：

```ts
const shippingCost = await calculateShippingForOrder(order, shippingProvider);
```

这可能是正确动作，但它不再只是让现有代码可理解。它改变了协作表面。把它当作 dependency-breaking refactoring，并用相应的谨慎程度 review。

Type 0 可以指向 seam。它不必在同一个 PR 里创建整套 testing architecture。

## 一份实用的 Type 0 checklist

打开 PR 之前：

- [ ] 我能说出这次 cleanup 为哪项 behavior-changing 工作做准备。
- [ ] 这个 PR 不会有意改变 user-visible 或 caller-visible 行为。
- [ ] 提取出来的方法保持 evaluation order 和 short-circuit behavior。
- [ ] 名字描述代码实际做的事，而不是我希望它做的事。
- [ ] 删除的代码已被证明在相关 runtime 中 unused，而不只是没人喜欢。
- [ ] 我跑了 focused tests，或者 replay 了重要场景。
- [ ] 如果 tests 缺失，我为 touched path 添加了 characterization coverage。
- [ ] PR description 告诉 reviewers 这是 Type 0，以及什么是 out of scope。

Review 期间：

- [ ] 先问“这是否保持行为？”再问“我是否更喜欢这个设计？”
- [ ] 把 behavior changes 推到 follow-up commit 或 PR。
- [ ] 保留 architecture ideas 作为 notes，除非它们对 safety 是必需的。
- [ ] 对 clever equivalence 保持怀疑。

Merge 之后：

- [ ] 在 mental model 还新鲜的时候做真正的改动。
- [ ] 只有当行为有意改变时，才删除或更新 characterization tests。
- [ ] 不要让 Type 0 变成永恒 cleanup 的停车场。

## 这个承诺

Type 0 重构是一个小承诺：

> 我正在让这段代码更容易改变，同时不改变它做的事。

这个承诺之所以有用，正是因为它有限。

它允许 developer 改善工作表面，而不用开启架构辩论。它给 reviewer 一个清晰标准。它给下一个 PR 一个真正围绕产品改动展开的机会。

有时候，在混乱代码库里你能做的最勇敢的事，不是重新设计它。

有时候，是先让当前的混乱说出真相。
