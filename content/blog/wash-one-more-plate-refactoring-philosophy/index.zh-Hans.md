---
lang: "zh-Hans"
translationOf: "wash-one-more-plate-refactoring-philosophy"
translationUpdatedAt: "2026-05-18"
translationSourceHash: "187813737c4f3f45"
title: "多洗一个盘子：让代码库长期保持干净的一条简单规则"
date: "2025-07-24"
description: "一种受童子军规则启发的实用软件开发哲学：永远让代码比你接手时更干净——多洗一个盘子。理解为什么微重构重要，以及如何在不拖偏交付的前提下应用它。"
meta_description: "一种受童子军规则启发的实用软件开发哲学：永远让代码比你接手时更干净——多洗一个盘子。理解为什么微重构重要，以及如何在不拖偏交付的前提下应用它。"
keywords: ["童子军规则", "技术债", "重构", "整洁代码", "软件熵", "破窗理论", "Ward Cunningham", "Robert C. Martin", "Martin Fowler", "Kent Beck", "软件匠艺"]
author: Bobby (Boris Deyanov Teoharov)
reading_time: "9 分钟"
jsonld: |
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "多洗一个盘子：让代码库长期保持干净的一条简单规则",
    "description": "一种受童子军规则启发的实用软件开发哲学：永远让代码比你接手时更干净——多洗一个盘子。",
    "author": [
      {
        "@type": "Person",
        "name": "Boris Deyanov Teoharov"
      }
    ],
    "datePublished": "2025-07-24",
    "image": "https://bdteo.com/images/wash-one-more-plate.jpg",
    "keywords": "童子军规则, 技术债, 重构, 整洁代码, 软件熵",
    "publisher": {
      "@type": "Organization",
      "name": "Boris's Blog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bdteo.com/static/images/logo.png"
      }
    }
  }
featuredImage: "./images/featured.jpg"
imageCaption: "厨房桌上一叠干净的盘子，前景里还有一个刚洗完、仍带水珠的盘子。"
---

> **TL;DR**：把你对代码库做的每一次修改，都当成做一顿饭。你会弄脏几个盘子。结束时，不要只洗掉你用过的那些——再多洗*一个*。时间久了，这一点点多出来的照料，会复利成一个保持干净、而不是滑向混乱的厨房（代码库）。

---

## 这个隐喻：做饭、盘子和代码

想象一间专业厨房。每做一道菜都会弄脏几个盘子，哪怕是最整洁的后厨团队也一样。现在想象，每个厨师做完自己的菜后，都*刚好*洗掉自己弄脏的盘子。厨房会悬在可接受的清洁边缘，但熵会慢慢爬进来：这里一点残留污垢，那里一块沾了渍的砧板。最后，混乱会复合增长。

现在把规则反过来：做完饭后，每位主厨都比自己弄脏的盘子**多洗一个**。慢慢地，厨房会比之前更干净，不只是被维持住，而是被改善。软件也是一样：你接手的每个任务，都应该给代码库至少增加一点点额外的整洁——多一个测试、更清楚的名字、拆开一个函数、移除一个死依赖。这个 "+1 plate" 的习惯，就是代码库*保持*健康的方式。

我把它叫做**多洗一个盘子规则**。

## 手艺里的回声：你并不孤单

这不是一种孤零零的哲学。几十年来，软件行业的思想领袖一直在讲类似的东西：

*   **"Always leave the campground cleaner than you found it."** 这就是经典的 [Boy Scout Rule](https://deviq.com/principles/boy-scout-rule/)，由 Robert C. Martin 在软件领域推广。精神相同：每次都改好一点。
*   **技术债这个隐喻**（Ward Cunningham）：债会产生利息。忽视它，明天使用这间"厨房"的成本就会更高。边走边还掉一些，才能保持偿付能力。
*   **重构作为小而持续的步骤**（Martin Fowler）：微小的改动，保持行为不变，同时改善设计。小步意味着低风险和稳定动量。
*   **"Make it work, make it right, make it fast"**（Kent Beck）：先正确，再干净，再性能。多洗那个盘子发生在 "make it right" 阶段，也就是你过早优化之前。
*   **把破窗理论应用到代码**（Andrew Hunt & David Thomas）：可见的混乱会邀请更多混乱。在它扩散之前修好一扇"窗"，是在保护这个街区（代码库）。

这些想法互相强化。它们说的是同一句话：*不要把混乱传下去；花一点时间，让它好一点。*

## 为什么多洗一个盘子重要（即使你很忙）

### 1. **熵是真实存在的**

如果没人照看，代码不会保持中性。命名会漂移，模式会碎裂，抽象会腐烂。熵是一种力量；唯一的反作用力，是持续、增量的整理。你的 +1 plate，就是微型的熵逆转。

### 2. **债务复利得比你想的快**

每一句"以后再修"，都会提高变更成本。以后很少真的到来。利息会表现为变慢的功能开发、脆弱的部署，以及没人信任的测试套件。*今天*多洗一个盘子，会降低明天的利率。

### 3. **社会信号**

当队友看到你会收拾自己留下的东西（还多收拾一点），规范就会移动。让代码比接手时更好，会变得可信，也会变成期待。文化跟着行为走。

### 4. **动量，不是完美主义**

这不是 yak shaving 的借口。你不是在午餐高峰时重建整间厨房。你只是拿海绵再擦一个盘子，小、安全、快。关键就在这里：交付不会因此脱轨。

## 如何实践多洗一个盘子规则

下面是把这个习惯嵌进去的方法，不拖偏 scope，也不撞坏 deadline。

### 1. 把"微重构"纳入 Definition of Done

*   重命名一个令人困惑的变量。
*   提取一个小函数，降低圈复杂度。
*   删除死代码或未使用的 imports。
*   为你刚修好的 bug 补一个缺失测试。
*   更新一段让你刚才心里一紧的文档或 README。

判断标准是：**如果它需要超过几分钟，那就不是一个盘子，而是整台洗碗机。推迟它。** 把它记录成 ticket。

### 2. 用 Pull Requests 触发清洁

每个 PR 都可以让营地更干净：

*   要求一个"你清理了什么？"的 checkbox 或简短说明。
*   鼓励 reviewer 在 review 时*请求*一些小整理。
*   庆祝包含额外打磨的 PR（standup 里点名表扬，作用很不小）。

### 3. 自动化那些容易洗的盘子

*   用 pre-commit hooks 做格式化和 linting。
*   用静态分析标记复杂方法或过长参数列表。
*   用依赖检查工具找出过时库。

让自动扫帚清掉琐碎的脏东西，好让人专注在逻辑和设计上。

### 4. 把它嵌进团队规范

*   把这条规则写进团队 working agreement 或 engineering handbook。
*   如果你想要可衡量的证明，在 retro 里跟踪微重构 wins。
*   偶尔 pair 或 mob program，让这个习惯（以及勇气）传播开。

### 5. 知道什么时候**不要**洗

有时候厨房着火了：生产环境挂了，或者 demo 只剩几小时。紧急情况下，该砸那叠脏盘子就砸。但危机后要回头处理。这条规则不是教条，而是纪律。

## 边界：一个盘子，不是整个水槽

Scope creep 会伪装成 craftsmanship。你的工作是在"多洗一个盘子"那里停下来。如果这个小重构暴露出更深的味道，写下来，然后继续走。把更深的修复停到停车场：

*   创建一个带 `refactor:` 或 `techdebt:` 标签的 ticket。
*   链接到相关代码、测试或模块。
*   加一句为什么它重要。

你的职责已经完成：你看到了脏东西，洗了一个盘子，并给剩下的部分留下了说明。

## 示例：把一个混乱函数变成可测试的函数

之前：

```php
function processOrder($order) {
    if(!$order->id) throw new Exception('No ID');
    $tax = 0;
    if ($order->country === 'BG') {
        $tax = $order->total * 0.20;
    } else if ($order->country === 'DE') {
        $tax = $order->total * 0.19;
    }
    // Lots more branching...
    // Sends email, writes to DB, calls payment gateway…
}
```

洗掉的那个盘子：

```php
/**
 * Calculate VAT for an order based on country.
 * Pure function: given (total, country) -> VAT amount.
 */
function vatFor(string $country, float $total): float {
    return match($country) {
        'BG' => $total * 0.20,
        'DE' => $total * 0.19,
        default => 0.0,
    };
}
```

现在你的主函数调用 `vatFor()`，而不是把逻辑内联进去。你还给 `vatFor()` 加了一个微型测试。这就是一个额外的盘子：简单、收束、有用。

## 最后的想法

多洗一个盘子很小。这正是重点。让代码库保持健康，不需要英雄式重构；需要的是一种小而持续的照料文化。把它变成习惯，烤进流程里。一年后，你会奇怪为什么你的厨房*不是*灾难现场——因为你从没让它变成那样。

---

**行动建议**：下次你碰一个文件时，问自己：*"在提交这个变更前，我还能多洗哪一个盘子？"* 然后做掉。重复。一次一个干净盘子，改变文化。

### 来源与延伸阅读

*   **Robert C. Martin（"Uncle Bob"）— Boy Scout Rule：** *97 Things Every Programmer Should Know* 中的 "[The Boy Scout Rule](https://97-things-every-x-should-know.gitbooks.io/97-things-every-programmer-should-know/content/en/thing_08/)"。
*   **Ward Cunningham — Technical Debt Metaphor：** Cunningham 对 [Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html) 的原始解释，收录在 Martin Fowler 的网站上。
*   **Martin Fowler — Continuous Micro-Refactoring：** Fowler 的书 [*Refactoring: Improving the Design of Existing Code*](https://martinfowler.com/books/refactoring.html)。
*   **Kent Beck — "Make it work, make it right, make it fast"：** [Ron Jeffries](https://ronjeffries.com/articles/-x024/biot/-bv40/3/) 对这句箴言的解释。
*   **Andrew Hunt & David Thomas — Broken Windows in Software：** 这个概念详见他们的书 [*The Pragmatic Programmer*](https://en.wikipedia.org/wiki/The_Pragmatic_Programmer)。
*   **Software Entropy & Maintenance：** 这篇 "[Entropy in Software and the Broken Window Theory](https://chroniclesofapragmaticprogrammer.substack.com/p/entropy-in-software-and-the-broken-window)" 也值得一读。
