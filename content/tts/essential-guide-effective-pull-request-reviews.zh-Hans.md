[conversational tone] 作为一个经常写代码、也经常 review 代码的人，我逐渐明白，pull request（PR）review 不只是查 bug。它关乎共同所有权、知识传递，以及一起写出更好的代码。下面是一份简洁、实用的指南，让 PR 更有价值，也少一点痛苦。

1. 好 review 的目标

关注改进，而不是完美。

完美代码并不现实。目标是更好的代码。如果一个 PR 改进了可读性、可维护性或正确性，即使还有些小的风格调整，也可以 approve。用 “Nit:” 标记可选建议。

[deliberate] 共享所有权与 mentoring。

把 PR 当作共同的代码。留下有教育意义的反馈（“Nit: you could use X here…”），指导初级开发者，也保持愿意向他们学习的开放态度。

2. Review 前的准备

作者：Self-review：运行测试、linter 和 formatter。在 PR 描述中提供上下文，并给复杂逻辑加注释。

Reviewer：先读描述。先理解“为什么”，再深入代码。

[gently] 3. 让 PR 保持小而聚焦

数据显示，超过约 400 LOC 和约 60 分钟后，review 质量会明显下降。 准则：

[matter-of-fact] 每个 PR 保持在 200–400 LOC 以下。

每次 review 控制在 60 分钟以内。

对于大功能，使用 stacked PR（DB → API → UI）。

4. 用心分配 Reviewer

一个主要 reviewer，最好具备相关领域知识。

[matter-of-fact] 最多两个 reviewer，避免责任扩散。

轮换 reviewer，用于交叉培训，也让 bus-factor 更健康。

5. PR 里要检查什么

使用这份心智清单：

第一，正确性：它是否满足需求并处理边界情况？

[deliberate] 第二，设计：结构是否良好，是否符合惯用写法？

第三，可读性：命名清晰，逻辑简单，风格一致。

第四，安全性：验证输入，清理输出，避免泄漏。

[matter-of-fact] 第五，性能：留意重循环和 N+1 查询。

第六，测试：覆盖核心场景、边界场景和错误场景。

第七，合规：文档、CI、license、格式化是否到位。

这能帮助我们更早捕捉更多问题，尤其是可维护性问题。

[deliberate] 6. 利用自动化

让工具处理琐碎工作：

Linters（ESLint、RuboCop、SonarQube）。

Formatters（Prettier、Black）。

带测试、覆盖率和安全检查的 CI pipelines。

[conversational tone] 这样人类 reviewer 才能把注意力放在逻辑、架构和细微判断上。

7. 提供建设性、友善的反馈

保持尊重。评点代码和建议，不评点人。

表扬做得好的地方。

[gently] 可执行：解释为什么，并建议怎么做。

给非阻塞项加上 “Nit:” 或 “Optional:” 前缀。

让讨论保持客观（“we” > “you”）。避免个人批评。

如果来回讨论卡住了，建议同步聊一下。

8. 衡量流程，而不是衡量人

值得跟踪趋势的关键指标（不要用来评价个人）：

[deliberate] Turnaround time（PR 打开 → merge）。

Inspection rate（< 300–500 LOC/hr 较佳）。

Defect density（每 LOC 的问题数）。

[emphasized] Review coverage（跨组件覆盖情况）。

Follow-up commit count。

[matter-of-fact] 用这些洞见改进工作流，比如强调更小的 PR、改进文档，或者围绕棘手模块做教育。但永远不要把这些指标绑定到绩效评估上。

9. 针对不同语言的注意事项

不同范式需要不同侧重点：

PHP/JavaScript/TS：异步处理、XSS、SOLID 原则。

Python：资源管理（with）、PEP 8、默认参数陷阱。

Haskell/Scala functional：类型签名、纯度、不可变性、macro 检查。

C/C++：内存安全、指针、RAII。

Java：Null-safety、干净的并发、SOLID。

Lisp：Macro 文档、动态类型、惯用模式。

根据你的技术栈调整清单。遇到不熟悉的语言，就让专家参与。

[reflective] 最后的想法

做得好的 PR review 不只是质量关卡。它们是学习、协作和工程卓越的发动机。把尊重的文化、聪明的工具、数据驱动的流程和用心的反馈结合起来，code review 就会变成有价值的讨论，而不是杂务。

祝 review 顺利！

[conversational tone] 欢迎留言，或者直接联系我。如果你想继续深入，或想分享自己的 review 技巧。
