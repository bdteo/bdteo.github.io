---
lang: "zh-Hans"
translationOf: "what-is-good-code-coverage-real-world-guide"
translationUpdatedAt: "2026-05-18"
translationSourceHash: "0490cb5e588445c4"
title: "什么才是“好的”代码覆盖率？一份现实世界指南"
date: "2025-07-15"
description: "拆掉 100 % 神话：我会梳理 TypeScript 和 PHP 中经过验证的覆盖率目标，解释测试的 ROI，并分享我日常使用的 tooling 技巧。"
tags: ["代码覆盖率", "测试", "TypeScript", "PHP", "最佳实践", "质量保证"]
featuredImage: "./images/featured.jpg"
imageCaption: "80 % 覆盖率 ≠ 80 % 质量——原因在这里"
---

# 什么才是“好的”代码覆盖率？我在现实世界里用来挡住 bug、又不浪费工程时间的指南

每次我运行 `npm run coverage` 或 `phpunit --coverage`，同一个问题都会冒出来：

> _“好吧……74 %。够了吗？”_

软件开发博客圈喊着 "100 % or nothing!" 与此同时，<a href="https://launchdarkly.com/blog/code-coverage-what-it-is-and-why-it-matters/" target="_blank">launchdarkly.com</a> 很礼貌地提醒我：100 % executed ≠ 100 % tested。
我花过几个星期追逐这个闪亮指标，也花过更多星期调试_别的_问题。下面是我最后落脚的、经过现场验证的中间地带。

---

## 为什么 100 % 覆盖率是一场海市蜃楼

理论上，100 % 行执行意味着"没有隐藏 bug"。实践中：

* 收益递减：从 90 %→95 % 常常会让测试套件翻倍，却只带来个位数的风险降低。
* 虚假的信心：一个没有 assertion、只是调用函数的测试，**仍然算**覆盖。
* 商业现实：每多写一个测试，就是一段**没有**用在客户要求功能上的时间。

航空航天那帮人可以瞄准 100 %，那是生死问题。对我们其他人来说，**~80 % 是 80/20 线**。大多数项目在算过 ROI 后都会聚在这里。<a href="https://www.testdevlab.com/blog/why-is-high-test-coverage-important" target="_blank">testdevlab.com</a> 出于同样的原因，把范围称为 70–90 %。

---

## 我使用的实用表格

| Coverage | 我的翻译 | Action |
|---------|------------------|--------|
| 100 % | “我们是一个会飞火箭的 library” | 接受折磨。 |
| 90 % + | “很多钱都依赖它的 library” | 只用于高优先级模块。 |
| 80 % | 发出去，监控，然后迭代。 |
| 60–70 % | Merge gate——如果新代码把你拉到线下，就让 PR 失败。 |
| < 50 % | 一个周末的技术债——先转向关键路径。 |

这些数字我从 <a href="https://www.atlassian.com/continuous-delivery/software-testing/code-coverage" target="_blank">Atlassian 的内部指南</a> 偷来的：60 % 是 "acceptable"，75 % 是 "commendable"，90 % 是 "exemplary"。每次 retro 都好用。

---

## 我如何不哭着打到 80 %（TypeScript playbook）

1. Jest + Istanbul 开箱即用
2. **CI 中的 coverage gate**
   在 `jest.config.js` 里我会加：
   ```js
   coverageThreshold: {
     global: 80,
     '**/src/core/**': 90
   }
   ```
3. 盯住用户热路径，不要盯 Redux boilerplate logger。

---

## 我如何在 Laravel 中打到 80 %（PHP playbook）

1. 开发环境安装 PCOV 提速度，CI 中用 Xdebug 拿 branch data。
2. PHPUnit + `phpunit.xml` 中这些默认项：
   ```xml
   <filter>
     <whitelist processUncoveredFiles="true">
       <directory suffix=".php">./src</directory>
     </whitelist>
   </filter>
   ```
3. Mutation score > line count，使用 <a href="https://infection.github.io/" target="_blank">Infection</a>。这就是我发现"覆盖了但其实没测到"的行的方法。

---

## 我团队奉行的 4 条规则

1. **新代码 = 测试。** 合并前 diff coverage ≥ 90 %。
2. **先重构，再测试。** 不可测试的代码已经是债。
3. **让 build 失败，不要让人失败。** 每年把 gate 降低 5 %，也比用一片红色 dashboard 压垮团队好。
4. **衡量生产环境里的 bug**——如果覆盖率是 85 %，但 incident 激增，罪魁祸首不是**覆盖率**，而是**断言**。

---

## TL;DR（给 execs 和 recruiters 也一样）

别问我要一个"神奇数字"。问这个：
> 产品的哪些部分不能坏？

把**那些**覆盖到 90 %。其他部分给健康的 smoke tests。把代码覆盖率当作一束**聚光灯**，不是终点线；相信你**抓到**的 bug，不要相信你**炫耀**的数字。

让 coverage dashboard 变绿吧。你的客户永远不会看见它，但他们的 error bar 会保持空白。

*—— 吐槽结束，回编辑器。*
