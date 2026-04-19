---
title: "Laravel Sail vs Laradock: Comparison for PHP Docker Devs"
date: "2024-08-08T12:00:00.000Z"
slug: "laravel-sail-vs-laradock-choosing-right-docker-solution"
description: "Honest comparison of Laravel Sail, Laradock, Herd, and FrankenPHP for PHP development in 2026. Which Docker setup to choose -- and when to skip Docker entirely."
featuredImage: "./images/featured.jpg"
tags: ["Laravel", "Docker", "PHP", "Laravel Sail", "Laradock", "Laravel Herd", "FrankenPHP", "Development Environment", "Docker Compose"]
imageCaption: "Two modern wireless computer mice side by side on white marble. Pick one."
---

> **TL;DR:** For most Laravel developers in 2026: use **Laravel Herd** if you want zero friction (native, no Docker, seconds to set up). Use **Sail** if your team needs identical environments or you depend on services like Redis/Meilisearch. Use **Laradock** if you work across multiple PHP frameworks. Use a **custom Docker Compose** setup if you've outgrown the abstractions. And if performance is everything, look at **FrankenPHP + Octane**.

> *Originally published August 2024. Updated March 2026 with Laravel 12/Herd/FrankenPHP and current ecosystem state.*

The question used to be "Sail or Laradock?" That framing is too narrow now. The real question is: **how should I set up my Laravel dev environment in 2026?** There are more options than ever, and the best choice depends on what you actually need.

I've used most of these. I currently run a custom Docker Compose setup because I want full control over my containers without abstractions hiding what's happening. But that's my preference, not a universal recommendation. Let me walk through what each option gives you.

## The Contenders

### Laravel Herd

[Herd](https://herd.laravel.com/) is the newest option and, for many developers, the right one. It's a native application (macOS and Windows -- no Linux yet) that gives you PHP, Nginx, Node.js, and Dnsmasq without Docker. The Pro version adds MySQL, PostgreSQL, Redis, and debugging tools.

The killer feature: PHP version switching in seconds (7.4 through 8.4), automatic `*.test` domain routing, and zero Docker overhead. If you're building a standard Laravel app and don't need exotic services, Herd gets you coding in under a minute.

### Laravel Sail

[Sail](https://laravel.com/docs/12.x/sail) is Laravel's official Docker-based development environment. It wraps Docker Compose with a `sail` CLI that abstracts the common commands (`sail up`, `sail artisan`, `sail php`).

As of Laravel 12, Sail ships with PHP 8.5 by default, uses `compose.yaml` (the modern filename, not `docker-compose.yml`), and includes Swoole for Octane out of the box. It also supports devcontainer generation via `--devcontainer` for VS Code/GitHub Codespaces integration.

Default services: PHP, MySQL, Redis, Meilisearch, Mailpit, and Selenium.

### Laradock

[Laradock](https://laradock.io/) is the Swiss army knife. It's an open-source Docker environment that supports any PHP project -- not just Laravel. It offers 70+ pre-configured services and can be configured for production use.

Still actively maintained as of December 2025 (recent PHP-FPM and workspace image updates). The tradeoff is complexity: setup takes longer, configuration involves editing multiple files, and you need real Docker knowledge.

### FrankenPHP + Octane

[FrankenPHP](https://frankenphp.dev/) is a modern PHP application server built on Caddy. Combined with Laravel Octane, it achieves 4-6ms framework boot time per request -- a developer reported dropping latency from 7 seconds to 66ms by switching to Worker Mode <small><a href="#ref1">[1]</a></small>.

Laravel Cloud uses FrankenPHP in its Octane runtime in production <small><a href="#ref2">[2]</a></small>. The latest release (v1.11.2, February 2026) brought 30% faster CGO and 40% faster garbage collection from Go 1.26.

This isn't a dev environment in the traditional sense -- it's a production-grade PHP runtime that you can also use in development. Sail includes integration for running Octane with FrankenPHP or Swoole.

## When to Use What

Here's my honest take, based on actually using these tools:

**Use Herd if** you're solo or on a small team, building standard Laravel apps, and want to spend zero time on infrastructure. It's the fastest path from "I have an idea" to "I'm writing code." The limitation is that it's macOS/Windows only and the free version doesn't include databases.

**Use Sail if** your team needs environment parity, you depend on specific service versions (Redis 7, MySQL 8, PostgreSQL 15), or you work in a CI/CD pipeline that needs Docker. Sail's `sail:publish` command lets you customize the Docker setup when you outgrow the defaults.

**Use Laradock if** you work across multiple PHP frameworks (Symfony, Shopware, vanilla PHP), need exotic services (Aerospike, RethinkDB, Manticore), or want one Docker environment for multiple projects. The learning curve is steeper, but the flexibility is unmatched.

**Use a custom Docker Compose setup if** you've outgrown both Sail and Laradock and want full control. This is what I do. I maintain my own `compose.yaml` with exactly the services I need, no abstraction layer, and Docker Compose aliases to keep the commands short. It takes more work upfront but there's no magic -- everything is explicit.

**Use FrankenPHP + Octane if** you're building a high-performance API or your application is latency-sensitive. The performance difference is not marginal -- it's an order of magnitude. Worth exploring even if you use another tool for general development.

## The Details That Matter

### Setup Time

| Tool | Time to First Request |
|------|----------------------|
| Herd | Under 1 minute |
| Sail | 5-10 minutes (image pulls) |
| Custom Compose | 30-60 minutes (initial setup) |
| Laradock | 1-2 hours (full configuration) |

### Customization

Sail is intentionally limited. You get the services Laravel needs and not much more. You *can* customize by running `sail:publish` and editing the Dockerfiles, but at that point you're maintaining a custom Docker setup with Sail's abstractions on top -- worst of both worlds.

Laradock gives you everything but demands you understand what you're enabling. Turning on a service means editing `.env` and possibly `docker-compose.yml`, and some services have their own configuration directories.

Custom Compose gives you exactly what you write. Nothing more, nothing less.

### Production Readiness

Sail is explicitly not for production. Laradock can be configured for production, but you need to know what you're doing with security hardening, resource limits, and proper networking. FrankenPHP is production-ready by design -- it's built for it.

### Multi-Project Support

Sail: one project per environment. You can run multiple Sail instances, but they'll fight over ports.

Laradock: designed for multi-project setups. One environment, multiple projects, shared services.

Custom Compose: whatever you architect. I keep separate compose files per project with shared network definitions.

## What I Actually Use

Custom Docker Compose. I have aliases for everything -- `dcu` for `docker compose up -d`, `dce` for exec, `dcefpm` for PHP-FPM shell access, and a `sail` function that auto-discovers the project root. The setup is in my [Docker Compose evolution notes](/docker-compose-major-changes-since-october-2023/).

I started with Laradock years ago, moved to Sail when it launched, and eventually settled on a custom setup because I wanted to understand exactly what was running and why. Every abstraction hides decisions. Sometimes that's fine. Sometimes those hidden decisions cause problems that are hard to debug because you can't see them.

That said, if I were starting a new Laravel project today with a team that doesn't care about Docker internals, I'd use Sail. And if I were mentoring someone new to Laravel, I'd tell them to install Herd and start writing code immediately.

## Other Options Worth Mentioning

- **[DDEV](https://ddev.com/)** -- Docker-based, good Laravel support, active 2026 roadmap with Gitpod integration planned. Worth evaluating if you use it for other CMS projects (WordPress, Drupal).
- **[Lando](https://lando.dev/)** -- another Docker abstraction layer with a Laravel plugin (v1.10.0, January 2026). Similar philosophy to Sail but framework-agnostic.
- **Valet** -- the predecessor to Herd. Still works but Herd has superseded it for most use cases.

---

### References

<a id="ref1"></a>1. [Setup and Boost Laravel with FrankenPHP Worker Mode](https://medium.com/@danarcahyaa/setup-and-boost-your-laravel-app-with-frankenphp-worker-mode-c0228f44f71b) -- *Real-world performance comparison: 7s to 66ms latency.*<br>
<a id="ref2"></a>2. [How Laravel Cloud Uses FrankenPHP in Production](https://devconf.net/talk/florian-beer-how-laravel-cloud-uses-frankenphp-in-production) -- *DevConf talk on Laravel Cloud's Octane runtime.*<br>
<a id="ref3"></a>3. [Laravel 12.x Sail Documentation](https://laravel.com/docs/12.x/sail) -- *Official Sail docs with PHP 8.5 and compose.yaml changes.*<br>
<a id="ref4"></a>4. [Laravel Herd](https://herd.laravel.com/) -- *Official site for the native Laravel development environment.*<br>
<a id="ref5"></a>5. [FrankenPHP v1.11.2 Release](https://laravel-news.com/frankenphp-v1112-released-with-30-faster-cgo-40-faster-gc-and-security-patches) -- *February 2026 release with performance and security updates.*<br>
<a id="ref6"></a>6. [Laradock on GitHub](https://github.com/laradock/laradock) -- *Still maintained, Dec 2025 updates.*<br>
<a id="ref7"></a>7. [The Current State of Local Laravel Development](https://aschmelyun.com/blog/the-current-state-of-local-laravel-development/) -- *Andrew Schmelyun's ecosystem overview.*

---

### Related Posts

- [Docker Compose Evolution: What Changed and Why It Matters](/docker-compose-major-changes-since-october-2023/) -- the Docker Compose changes that affect all of these tools.
- [PHP 8.5: A Tour of the Incoming Features](/php-8-5-new-features-pipe-operator-guide/) -- what's coming in the PHP version that Laravel 12 defaults to.
- [PHP 8.3.6 + IMAP on macOS using phpenv](/installing-php-8-3-6-with-imap-on-macos-using-phpenv/) -- when you need a specific PHP setup outside of Docker.
