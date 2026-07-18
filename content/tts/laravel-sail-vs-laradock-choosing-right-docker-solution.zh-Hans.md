TL;DR： 对 2026 年的大多数 Laravel 开发者来说：如果你想要零摩擦（原生、无 Docker、几秒配置好），用 Laravel Herd。如果你的团队需要完全一致的环境，或者依赖 Redis/Meilisearch 这类服务，用 Sail。如果你跨多个 PHP 框架工作，用 Laradock。如果你已经长出了这些抽象的边界，用一套 自定义 Docker Compose。如果性能就是一切，看看 FrankenPHP + Octane。

[conversational tone] 最初发布于 2024 年 8 月。2026 年 3 月更新，加入 Laravel 12/Herd/FrankenPHP 以及当前生态状态。

过去的问题是“Sail 还是 Laradock？”现在这个问法太窄了。真正的问题是：2026 年，我该怎样搭建 Laravel 开发环境？ 选择比以往更多，而最好的选择取决于你真正需要什么。

这些工具我大多都用过。我现在跑的是自定义 Docker Compose，因为我想完整控制自己的容器，不想让抽象层把正在发生的事情藏起来。但这是我的偏好，不是普遍建议。下面把每个选项能给你的东西讲清楚。

候选者

Laravel Herd

Herd 是最新的选择，对很多开发者来说也是正确的选择。它是原生应用（macOS 和 Windows，还没有 Linux），不用 Docker 就能给你 PHP、Nginx、Node.js 和 Dnsmasq。Pro 版还加入 MySQL、PostgreSQL、Redis 和调试工具。

杀手级特性是：几秒内切换 PHP 版本（7.4 到 8.4）、自动路由 *.test 域名，而且没有 Docker 开销。如果你在做一套标准 Laravel 应用，又不需要什么奇怪服务，Herd 能让你一分钟内开始写代码。

[matter-of-fact] Laravel Sail

Sail 是 Laravel 官方的 Docker 开发环境。它用一个 sail CLI 包住 Docker Compose，抽象掉常用命令（sail up、sail artisan、sail php）。

截至 Laravel 12，Sail 默认带 PHP 8.5，使用 compose.yaml（现代文件名，不是 docker-compose.yml），并且开箱包含给 Octane 用的 Swoole。它也支持通过 --devcontainer 生成 devcontainer，方便和 VS Code/GitHub Codespaces 集成。

默认服务：PHP、MySQL、Redis、Meilisearch、Mailpit 和 Selenium。

Laradock

Laradock 是瑞士军刀。它是一套开源 Docker 环境，支持任何 PHP 项目，不只支持 Laravel。它提供 70 多个预配置服务，也可以配置成生产用途。

截至 2025 年 12 月它仍在活跃维护（近期有 PHP-FPM 和 workspace 镜像更新）。代价是复杂度：搭建要更久，配置要改多个文件，而且你需要真正懂 Docker。

FrankenPHP + Octane

FrankenPHP 是构建在 Caddy 之上的现代 PHP 应用服务器。结合 Laravel Octane，它可以把每次请求的框架启动时间压到 4-6ms；有开发者报告说，切到 Worker Mode 后延迟从 7 秒降到了 66ms。

Laravel Cloud 在生产环境的 Octane runtime 里使用 FrankenPHP。最新版本（v1.11.2，2026 年 2 月）借助 Go 1.26 带来了快 30% 的 CGO 和快 40% 的垃圾回收。

这不是传统意义上的开发环境，它是生产级 PHP runtime，只是你也可以在开发中使用。Sail 内置了用 FrankenPHP 或 Swoole 运行 Octane 的集成。

什么时候用什么

下面是我的诚实看法，基于真实用过这些工具之后的判断：

如果你是个人或小团队，做的是标准 Laravel 应用，而且不想在基础设施上花时间，用 Herd。 这是从“我有个想法”到“我正在写代码”的最快路径。限制是它只支持 macOS/Windows，而且免费版不包含数据库。

如果你的团队需要环境一致性，依赖特定服务版本（Redis 7、MySQL 8、PostgreSQL 15），或者你的 CI/CD 流水线需要 Docker，用 Sail。 Sail 的 sail:publish 命令允许你在默认配置不够用时定制 Docker 设置。

[deliberate] 如果你跨多个 PHP 框架工作（Symfony、Shopware、原生 PHP），需要比较冷门的服务（Aerospike、RethinkDB、Manticore），或者想要一套 Docker 环境服务多个项目，用 Laradock。 学习曲线更陡，但灵活性无可比拟。

如果 Sail 和 Laradock 都满足不了你，而且你想要完全控制，用自定义 Docker Compose。 我自己就是这么做的。我维护自己的 compose.yaml，里面只有我需要的服务，没有抽象层，再配一些 Docker Compose 别名让命令短一点。前期工作更多，但没有魔法，一切都写在明处。

如果你在做高性能 API，或者应用对延迟敏感，用 FrankenPHP + Octane。 性能差距不是边角料级别，而是一个数量级。即便你平时用别的工具做通用开发，也值得研究一下。

[deliberate] 真正重要的细节

搭建时间

工具，到第一次请求的时间。

Herd，1 分钟以内。

Sail，5-10 分钟（拉镜像）。

[matter-of-fact] Custom Compose，30-60 分钟（初次搭建）。

Laradock，1-2 小时（完整配置）。

定制能力

[deliberate] Sail 是有意限制的。你得到的是 Laravel 需要的服务，没有太多别的东西。你可以运行 sail:publish 再编辑 Dockerfile 来定制，但到那一步，你其实是在维护一套自定义 Docker 设置，上面还叠着 Sail 的抽象。这是两边都不讨好的形状。

Laradock 给你一切，但要求你理解自己启用了什么。打开一个服务意味着编辑 .env，可能还要改 docker-compose.yml，有些服务还有自己的配置目录。

Custom Compose 给你的东西正好等于你写下来的东西。不多，也不少。

生产就绪度

Sail 明确不是给生产用的。Laradock 可以配置成生产可用，但你需要知道自己在安全加固、资源限制和正确网络配置上做什么。FrankenPHP 从设计上就是生产就绪的，它就是为这个而生。

[deliberate] 多项目支持

Sail：一个环境对应一个项目。你可以同时跑多个 Sail 实例，但它们会争端口。

Laradock：为多项目设置而设计。一套环境，多个项目，共享服务。

Custom Compose：取决于你怎么设计。我通常每个项目单独一份 compose 文件，同时定义共享网络。

我实际在用什么

[reflective] Custom Docker Compose。我给所有东西都配了别名：dcu 表示 docker compose up -d，dce 用来 exec，dcefpm 进 PHP-FPM shell，还有一个会自动发现项目根目录的 sail 函数。这套东西在我的 Docker Compose 演进笔记 里。

我很多年前从 Laradock 开始，Sail 发布后切到 Sail，最后落在自定义配置上，因为我想明确知道到底在跑什么，以及为什么这样跑。每一层抽象都会隐藏决定。有时候这没问题。有时候这些被隐藏的决定会造成很难调试的问题，因为你根本看不见它们。

话虽如此，如果我今天带一个不关心 Docker 内部细节的团队新开 Laravel 项目，我会用 Sail。如果我在指导刚接触 Laravel 的人，我会让他们装 Herd，然后立刻开始写代码。

其他值得一提的选择

[matter-of-fact] DDEV -- 基于 Docker，Laravel 支持不错，2026 路线图活跃，并计划集成 Gitpod。如果你也在其他 CMS 项目（WordPress、Drupal）里用它，值得评估。

Lando -- 另一套 Docker 抽象层，带 Laravel 插件（v1.10.0，2026 年 1 月）。理念类似 Sail，但不绑定具体框架。

Valet -- Herd 的前身。仍然可用，但对大多数场景来说 Herd 已经取代它。
