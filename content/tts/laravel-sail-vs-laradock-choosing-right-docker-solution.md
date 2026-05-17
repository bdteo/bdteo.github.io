Laravel Sail versus Laradock: choosing the right Docker solution for PHP development

[conversational tone] For most Laravel developers in 2026, use Laravel Herd if you want zero friction: native, no Docker, seconds to set up.

Use Sail if your team needs identical environments or you depend on services like Redis or Meilisearch.

Use Laradock if you work across multiple PHP frameworks.

Use a custom Docker Compose setup if you have outgrown the abstractions.

And if performance is everything, look at FrankenPHP plus Octane.

This article was originally published in August 2024 and updated in March 2026 with Laravel 12, Herd, FrankenPHP, and the current ecosystem state.

The question used to be: Sail or Laradock?

That framing is too narrow now.

The real question is: how should I set up my Laravel development environment in 2026?

There are more options than ever, and the best choice depends on what you actually need.

I have used most of these. I currently run a custom Docker Compose setup because I want full control over my containers without abstractions hiding what is happening.

But that is my preference, not a universal recommendation.

Let me walk through what each option gives you.

The contenders

Laravel Herd

[matter-of-fact] Herd is the newest option and, for many developers, the right one.

It is a native application for macOS and Windows. There is no Linux version yet.

It gives you PHP, Nginx, Node.js, and Dnsmasq without Docker. The Pro version adds MySQL, PostgreSQL, Redis, and debugging tools.

The killer feature is PHP version switching in seconds, automatic dot test domain routing, and zero Docker overhead.

If you are building a standard Laravel app and do not need exotic services, Herd gets you coding in under a minute.

Laravel Sail

Sail is Laravel's official Docker-based development environment.

It wraps Docker Compose with a sail command-line interface that abstracts the common commands: sail up, sail artisan, and sail php.

As of Laravel 12, Sail ships with PHP 8.5 by default, uses compose dot yaml as the modern Compose filename, and includes Swoole for Octane out of the box.

It also supports development-container generation for VS Code and GitHub Codespaces integration.

Default services include PHP, MySQL, Redis, Meilisearch, Mailpit, and Selenium.

Laradock

Laradock is the Swiss army knife.

It is an open-source Docker environment that supports any PHP project, not just Laravel.

It offers more than seventy preconfigured services and can be configured for production use.

It is still actively maintained as of December 2025, with recent PHP-FPM and workspace image updates.

The tradeoff is complexity.

Setup takes longer. Configuration involves editing multiple files. And you need real Docker knowledge.

FrankenPHP plus Octane

FrankenPHP is a modern PHP application server built on Caddy.

Combined with Laravel Octane, it achieves framework boot times in the single-digit milliseconds per request.

One developer reported dropping latency from seven seconds to sixty-six milliseconds by switching to Worker Mode.

Laravel Cloud uses FrankenPHP in its Octane runtime in production.

The February 2026 release, version 1.11.2, brought faster CGO and faster garbage collection from Go 1.26.

This is not a development environment in the traditional sense.

It is a production-grade PHP runtime that you can also use in development.

Sail includes integration for running Octane with FrankenPHP or Swoole.

When to use what

[deliberate] Here is my honest take, based on actually using these tools.

Use Herd if you are solo or on a small team, building standard Laravel apps, and want to spend zero time on infrastructure.

It is the fastest path from "I have an idea" to "I am writing code."

The limitation is that it is macOS and Windows only, and the free version does not include databases.

Use Sail if your team needs environment parity, you depend on specific service versions, or you work in a CI/CD pipeline that needs Docker.

Sail's publish command lets you customize the Docker setup when you outgrow the defaults.

[deliberate] Use Laradock if you work across multiple PHP frameworks, like Symfony, Shopware, or vanilla PHP; if you need exotic services like Aerospike, RethinkDB, or Manticore; or if you want one Docker environment for multiple projects.

The learning curve is steeper, but the flexibility is unmatched.

Use a custom Docker Compose setup if you have outgrown both Sail and Laradock and want full control.

This is what I do.

I maintain my own compose file with exactly the services I need, no abstraction layer, and Docker Compose aliases to keep commands short.

It takes more work upfront, but there is no magic. Everything is explicit.

Use FrankenPHP plus Octane if you are building a high-performance API or your application is latency-sensitive.

The performance difference is not marginal. It is an order of magnitude.

Worth exploring even if you use another tool for general development.

The details that matter

Setup time

[matter-of-fact] Herd gets you to the first request in under a minute.

Sail usually takes five to ten minutes, mostly because of image pulls.

A custom Compose setup can take thirty to sixty minutes for the initial setup.

Laradock can take one to two hours for full configuration.

Customization

[deliberate] Sail is intentionally limited.

You get the services Laravel needs and not much more.

You can customize it by publishing the Sail files and editing the Dockerfiles, but at that point you are maintaining a custom Docker setup with Sail's abstractions on top.

That can be the worst of both worlds.

Laradock gives you everything, but demands you understand what you are enabling.

Turning on a service means editing environment files and possibly the Compose file, and some services have their own configuration directories.

Custom Compose gives you exactly what you write.

Nothing more, nothing less.

Production readiness

[deliberate] Sail is explicitly not for production.

Laradock can be configured for production, but you need to know what you are doing with security hardening, resource limits, and proper networking.

FrankenPHP is production-ready by design. It is built for it.

Multi-project support

Sail is one project per environment.

You can run multiple Sail instances, but they will fight over ports.

Laradock is designed for multi-project setups: one environment, multiple projects, shared services.

Custom Compose is whatever you architect.

I keep separate compose files per project with shared network definitions.

What I actually use

[reflective] I use custom Docker Compose.

I have aliases for everything: dcu for docker compose up in detached mode, dce for exec, dcefpm for PHP-FPM shell access, and a sail function that auto-discovers the project root.

I started with Laradock years ago, moved to Sail when it launched, and eventually settled on a custom setup because I wanted to understand exactly what was running and why.

Every abstraction hides decisions.

Sometimes that is fine.

Sometimes those hidden decisions cause problems that are hard to debug because you cannot see them.

That said, if I were starting a new Laravel project today with a team that does not care about Docker internals, I would use Sail.

And if I were mentoring someone new to Laravel, I would tell them to install Herd and start writing code immediately.

Other options worth mentioning

[matter-of-fact] DDEV is Docker-based, has good Laravel support, and has an active 2026 roadmap with Gitpod integration planned.

It is worth evaluating if you also use it for CMS projects like WordPress or Drupal.

Lando is another Docker abstraction layer with a Laravel plugin. It has a similar philosophy to Sail, but is framework-agnostic.

Valet is the predecessor to Herd. It still works, but Herd has superseded it for most use cases.
