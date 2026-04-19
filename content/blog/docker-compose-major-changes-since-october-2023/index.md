---
title: "Docker Compose Evolution: What Changed and Why It Matters"
date: "2024-11-20T00:00:00.000Z"
slug: "docker-compose-major-changes-since-october-2023"
description: "Docker Compose has changed drastically -- v1 is dead, the version field is gone, watch mode is production-ready, and there's a critical CVE you should know about. Updated March 2026."
featuredImage: "./images/featured.jpg"
tags: ["Docker", "Docker Compose", "DevOps", "Containers", "Development Environment"]
imageCaption: "A row of small wooden shipping crates on a harbor dock at first light."
---

> **TL;DR:** Docker Compose v1 (`docker-compose`) was fully removed in April 2025. The `version` field in your YAML is dead. The `x-develop` key is now just `develop`. Watch mode is production-ready with `initial_sync`. There's a critical path traversal CVE (CVE-2025-62725) if you use `include` with OCI artifacts -- update to v2.40.2+. And yes, Compose jumped from v2 to v5. Details below.

> *Originally published November 2024. Updated March 2026 with Compose v5, CVE-2025-62725, v1 removal, and new spec features.*

If you've been using Docker Compose for a while, you've probably noticed things breaking or changing under you. The last two years have been the most aggressive evolution Compose has ever gone through -- and not all of it was obvious.

I use Compose daily. Most of my [development setups](/laravel-sail-vs-laradock-choosing-right-docker-solution/) run on it. When things change, I notice. Here's what actually matters.

## What Broke

### docker-compose Is Dead

Not deprecated. Not in maintenance mode. **Dead.** The standalone `docker-compose` binary (the Python-based v1) was removed from GitHub Actions runners and official Docker images in April 2025 <small><a href="#ref1">[1]</a></small>. If your CI/CD pipelines still reference `docker-compose` with a hyphen, they're broken or about to be.

```bash
# This no longer works
docker-compose up -d

# This is the only way now
docker compose up -d
```

The Go-based `docker compose` (v2, now v5) has been the real implementation since 2022. The v1 CLI was on life support for compatibility. That life support ended.

### The version Field Is Gone

Stop putting `version: "3.8"` at the top of your Compose files. It does nothing. It's been ignored since v2 and is now officially deprecated. Modern Compose files start with `services:`.

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

If you see `version:` in a tutorial, that tutorial is outdated.

### Other Deprecations

- **`links`** -- use Docker networks. Links have been legacy since Compose v2 launched.
- **`container_name`** -- let Docker manage names. Hardcoded names break scaling and cause conflicts.
- **Short volume syntax for complex mounts** -- use the long-form syntax with `type`, `source`, `target`.

## What's New and Actually Useful

### Watch Mode (Now Production-Ready)

This is the biggest quality-of-life improvement in years. The `develop` section (formerly `x-develop` -- drop the `x-` prefix, it's no longer experimental) lets you define file watch rules that automatically sync or rebuild when files change:

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

Three actions available (since v2.32.0):
- **`sync`** -- copies changed files into the container without rebuilding
- **`restart`** -- restarts the service when files change
- **`rebuild`** -- triggers a full rebuild

As of September 2025, there's also **`initial_sync`** -- it syncs all files immediately when you start `docker compose watch`, so you don't have to wait for the first change to trigger synchronization. This was a pain point for a long time.

```bash
docker compose watch
```

No more manual rebuilds during development. This genuinely changed my workflow.

### Include with OCI Artifacts

The `include` directive can now pull Compose fragments from OCI registries:

```yaml
include:
  - oci://docker.io/username/my-compose-fragment:latest
```

There's also experimental Git repository support. This is useful for sharing common service definitions across projects -- database configs, monitoring stacks, etc.

**But read the security section below first.** There's a CVE.

### GPU Support

GPU passthrough got cleaner. There's now a shorter `gpus:` syntax (v2.30.0+) alongside the verbose `deploy.resources.reservations.devices` approach. AMD GPU support was officially integrated in 2025 -- not just NVIDIA anymore.

### Models Element

The Compose spec now includes a `models` element for defining AI/ML models as OCI artifacts. You can package LLMs and inference runtimes directly in your Compose setup. Niche, but interesting if you're doing local AI work.

### Better Dependencies

The `depends_on` conditions have gotten more flexible:

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy
        restart: true      # restart web if db restarts
        required: false     # web can start even if db isn't ready
```

The `restart: true` and `required: false` options are genuinely useful for resilient local development setups.

## What You Should Know

### CVE-2025-62725: Include Path Traversal

If you use the `include` directive with OCI artifacts, **update to v2.40.2 or later immediately** <small><a href="#ref2">[2]</a></small>. A path traversal vulnerability allows an attacker to escape the cache directory during artifact resolution. Even a benign-looking `docker compose ps` can trigger it if your Compose file includes a malicious OCI reference.

Docker patched this with a `validatePathInBase()` check, but you need to be on the fixed version.

### Compose v5

Docker jumped from v2 to v5 (skipping 3 and 4 to avoid confusion with the old file format versions) <small><a href="#ref3">[3]</a></small>. Functionally, v5 is the same as late v2 releases, but it includes an official **Go SDK** for programmatic access -- meaning you can embed Compose functionality directly in Go applications without shelling out to the CLI.

Check your version:

```bash
docker compose version
# Docker Compose version v5.1.0
```

### Bake Is the Default Build Tool

Docker Bake (via BuildKit) is now the default for `docker compose build`. It handles multi-target builds, cross-platform compilation, and advanced caching strategies better than the legacy builder. If you haven't looked at `docker-bake.hcl` files yet, it's worth understanding -- especially for complex multi-service builds.

### Healthcheck Improvements

The `start_interval` field lets you set a faster check interval during the startup grace period:

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

This means your dependent services start faster without compromising production health check intervals.

## Migration Checklist

If you haven't updated your Compose setup in a while:

1. **Remove `version:`** from all Compose files.
2. **Replace `docker-compose`** with `docker compose` in all scripts and CI configs.
3. **Rename `x-develop`** to `develop`** in watch configurations.
4. **Update to v2.40.2+** if you use `include` (CVE-2025-62725).
5. **Replace `links`** with Docker networks if you somehow still use them.
6. **Test your CI** -- GitHub Actions updated runners to Compose v2.40.3 in February 2026 <small><a href="#ref4">[4]</a></small>.

---

### References

<a id="ref1"></a>1. [Docker Compose v1 removed from runner images (April 2025)](https://github.com/actions/runner-images/issues/9557) -- *GitHub Actions announcement of v1 removal.*<br>
<a id="ref2"></a>2. [CVE-2025-62725: From "docker compose ps" to System Compromise](https://www.imperva.com/blog/cve-2025-62725-from-docker-compose-ps-to-system-compromise/) -- *Imperva's detailed writeup of the include path traversal vulnerability.*<br>
<a id="ref3"></a>3. [Docker Compose Releases](https://github.com/docker/compose/releases) -- *Official release history including v5.*<br>
<a id="ref4"></a>4. [Docker and Docker Compose version upgrades on hosted runners](https://github.blog/changelog/2026-01-30-docker-and-docker-compose-version-upgrades-on-hosted-runners/) -- *GitHub's February 2026 runner update.*<br>
<a id="ref5"></a>5. [Compose Specification](https://docs.docker.com/compose/compose-file/) -- *Official Compose file reference.*<br>
<a id="ref6"></a>6. [Use Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) -- *Docker's watch mode documentation.*<br>
<a id="ref7"></a>7. [Enable GPU Support in Docker Compose](https://docs.docker.com/compose/how-tos/gpu-support/) -- *GPU passthrough docs including AMD support.*<br>
<a id="ref8"></a>8. [Docker Compose Include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) -- *Include directive with OCI and Git support.*

---

### Related Posts

- [Laravel Sail vs Laradock: Choosing the Right Docker Solution](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- comparing Docker-based PHP development environments.
