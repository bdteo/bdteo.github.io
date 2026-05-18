---
lang: "zh-Hans"
translationOf: "docker-compose-major-changes-since-october-2023"
translationUpdatedAt: "2026-05-18"
translationSourceHash: "1e96a25eca95e021"
title: "Docker Compose 的演进：变了什么，为什么重要"
date: "2024-11-20T00:00:00.000Z"
slug: "docker-compose-major-changes-since-october-2023"
description: "Docker Compose 已经发生了巨大变化 -- v1 已死，version 字段没了，watch 模式已可用于生产，还有一个你应该知道的关键 CVE。2026 年 3 月更新。"
featuredImage: "./images/featured.jpg"
tags: ["Docker", "Docker Compose", "DevOps", "容器", "开发环境"]
imageCaption: "破晓时分，港口码头上一排小木质货箱。"
---

> **TL;DR:** Docker Compose v1（`docker-compose`）已在 2025 年 4 月被完全移除。你的 YAML 里的 `version` 字段已经死了。`x-develop` 键现在就是 `develop`。watch 模式已经带着 `initial_sync` 达到生产可用。有一个关键的路径遍历 CVE（CVE-2025-62725），如果你把 `include` 和 OCI artifact 一起用，就该升级到 v2.40.2+。是的，Compose 从 v2 跳到了 v5。细节在下面。

> *最初发布于 2024 年 11 月。2026 年 3 月更新，加入 Compose v5、CVE-2025-62725、v1 移除，以及新的 spec 功能。*

如果你用 Docker Compose 已经有一段时间，可能已经注意到脚下的东西在坏掉，或者悄悄变了。过去两年是 Compose 历史上变化最激进的两年，而且并不是所有变化都显而易见。

我每天都用 Compose。我的大多数[开发环境](/zh/laravel-sail-vs-laradock-choosing-right-docker-solution/)都跑在它上面。东西一变，我会注意到。下面是实际重要的部分。

## 坏掉了什么

### docker-compose 已死

不是 deprecated。不是维护模式。**死了。** 独立的 `docker-compose` 二进制文件，也就是基于 Python 的 v1，已经在 2025 年 4 月从 GitHub Actions runner 和官方 Docker 镜像中移除 <small><a href="#ref1">[1]</a></small>。如果你的 CI/CD pipeline 里还在引用带连字符的 `docker-compose`，它们已经坏了，或者马上就会坏。

```bash
# This no longer works
docker-compose up -d

# This is the only way now
docker compose up -d
```

基于 Go 的 `docker compose`（v2，现在是 v5）自 2022 年以来就是真正的实现。v1 CLI 只是为了兼容性挂着维生系统。现在维生系统停了。

### version 字段没了

别再把 `version: "3.8"` 放在 Compose 文件顶部了。它什么也不做。自 v2 起它就被忽略，现在也正式 deprecated。现代 Compose 文件从 `services:` 开始。

```yaml
# Stop doing this
version: "3.8"
services:
  web:
    image: nginx

# Just do this
services:
  web:
    image: nginx
```

如果你在教程里看到 `version:`，那篇教程已经过时。

### 其他弃用项

- **`links`** -- 使用 Docker networks。Links 从 Compose v2 发布起就已经是 legacy。
- **`container_name`** -- 让 Docker 管理名称。硬编码名称会破坏扩缩容，并造成冲突。
- **复杂挂载的短 volume 语法** -- 使用带 `type`、`source`、`target` 的长格式语法。

## 新的、而且真正有用的东西

### Watch 模式（现在生产可用）

这是多年来最大的生活质量改进。`develop` 区段（之前是 `x-develop` -- 去掉 `x-` 前缀，它已经不再是实验性的）让你定义文件 watch 规则，在文件变化时自动同步或重建：

```yaml
services:
  web:
    build: .
    develop:
      watch:
        - path: ./src
          action: sync
          target: /app/src
        - path: ./package.json
          action: rebuild
```

有三种可用 action（自 v2.32.0 起）：
- **`sync`** -- 不重建，直接把变更文件复制进容器
- **`restart`** -- 文件变化时重启服务
- **`rebuild`** -- 触发完整重建

截至 2025 年 9 月，还多了 **`initial_sync`**。它会在你启动 `docker compose watch` 时立刻同步所有文件，所以你不必等第一次文件变化才触发同步。这曾经是很长一段时间里的痛点。

```bash
docker compose watch
```

开发时不再需要手动 rebuild。这真的改变了我的工作流。

### 通过 OCI Artifacts 使用 Include

`include` 指令现在可以从 OCI registry 拉取 Compose 片段：

```yaml
include:
  - oci://docker.io/username/my-compose-fragment:latest
```

还提供了实验性的 Git repository 支持。这很适合在多个项目之间共享通用服务定义，比如数据库配置、监控栈等等。

**但先读下面的安全部分。** 这里有一个 CVE。

### GPU 支持

GPU passthrough 变得更干净了。现在除了冗长的 `deploy.resources.reservations.devices` 写法，也有更短的 `gpus:` 语法（v2.30.0+）。AMD GPU 支持也在 2025 年正式集成，不再只是 NVIDIA。

### Models 元素

Compose spec 现在包含一个 `models` 元素，用来把 AI/ML 模型定义为 OCI artifacts。你可以把 LLM 和推理 runtime 直接打包进 Compose 设置里。很小众，但如果你在做本地 AI 工作，它挺有意思。

### 更好的依赖关系

`depends_on` 条件变得更灵活了：

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy
        restart: true      # restart web if db restarts
        required: false     # web can start even if db isn't ready
```

`restart: true` 和 `required: false` 对更有韧性的本地开发环境来说，是真的有用。

## 你应该知道的事

### CVE-2025-62725：Include 路径遍历

如果你把 `include` 指令和 OCI artifacts 一起使用，**立刻升级到 v2.40.2 或更高版本** <small><a href="#ref2">[2]</a></small>。一个路径遍历漏洞允许攻击者在 artifact 解析期间逃出缓存目录。即使是看起来无害的 `docker compose ps`，如果你的 Compose 文件 include 了恶意 OCI 引用，也可能触发它。

Docker 用 `validatePathInBase()` 检查修补了这个问题，但你得运行在已修复版本上。

### Compose v5

Docker 从 v2 跳到了 v5（跳过 3 和 4，是为了避免和旧的文件格式版本混淆）<small><a href="#ref3">[3]</a></small>。功能上，v5 和后期 v2 版本差不多，但它包含了一个官方 **Go SDK**，可用于程序化访问。这意味着你可以把 Compose 功能直接嵌入 Go 应用里，而不用 shell out 到 CLI。

检查你的版本：

```bash
docker compose version
# Docker Compose version v5.1.0
```

### Bake 是默认构建工具

Docker Bake（通过 BuildKit）现在是 `docker compose build` 的默认工具。它比 legacy builder 更擅长处理多目标构建、跨平台编译和高级缓存策略。如果你还没看过 `docker-bake.hcl` 文件，值得了解一下，尤其是在复杂的多服务构建里。

### Healthcheck 改进

`start_interval` 字段允许你在启动宽限期内设置更快的检查间隔：

```yaml
services:
  db:
    healthcheck:
      test: ["CMD", "pg_isready"]
      start_period: 30s
      start_interval: 2s    # check every 2s during startup
      interval: 30s         # then every 30s after
      retries: 3
```

这意味着你的依赖服务可以更快启动，同时不牺牲生产环境 health check 的间隔。

## 迁移清单

如果你已经有一阵子没更新 Compose 设置了：

1. 从所有 Compose 文件中**移除 `version:`**。
2. 在所有脚本和 CI 配置中，把 **`docker-compose` 替换为 `docker compose`**。
3. 在 watch 配置中，把 **`x-develop` 改名为 `develop`**。
4. 如果你使用 `include`，**升级到 v2.40.2+**（CVE-2025-62725）。
5. 如果你不知怎么还在用 `links`，就把它们**替换为 Docker networks**。
6. **测试你的 CI** -- GitHub Actions 已在 2026 年 2 月把 runner 更新到 Compose v2.40.3 <small><a href="#ref4">[4]</a></small>。

---

### 参考资料

<a id="ref1"></a>1. [Docker Compose v1 removed from runner images (April 2025)](https://github.com/actions/runner-images/issues/9557) -- *GitHub Actions 关于移除 v1 的公告。*<br>
<a id="ref2"></a>2. [CVE-2025-62725: From "docker compose ps" to System Compromise](https://www.imperva.com/blog/cve-2025-62725-from-docker-compose-ps-to-system-compromise/) -- *Imperva 对 include 路径遍历漏洞的详细分析。*<br>
<a id="ref3"></a>3. [Docker Compose Releases](https://github.com/docker/compose/releases) -- *包含 v5 在内的官方发布历史。*<br>
<a id="ref4"></a>4. [Docker and Docker Compose version upgrades on hosted runners](https://github.blog/changelog/2026-01-30-docker-and-docker-compose-version-upgrades-on-hosted-runners/) -- *GitHub 2026 年 2 月 runner 更新。*<br>
<a id="ref5"></a>5. [Compose Specification](https://docs.docker.com/compose/compose-file/) -- *官方 Compose 文件参考。*<br>
<a id="ref6"></a>6. [Use Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) -- *Docker 的 watch 模式文档。*<br>
<a id="ref7"></a>7. [Enable GPU Support in Docker Compose](https://docs.docker.com/compose/how-tos/gpu-support/) -- *包含 AMD 支持在内的 GPU passthrough 文档。*<br>
<a id="ref8"></a>8. [Docker Compose Include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) -- *带 OCI 和 Git 支持的 include 指令。*

---

### 相关文章

- [Laravel Sail vs Laradock: Choosing the Right Docker Solution](/zh/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- 比较基于 Docker 的 PHP 开发环境。
