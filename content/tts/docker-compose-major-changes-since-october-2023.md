# Docker Compose Evolution: What Changed and Why It Matters

[conversational tone] Short version: Docker Compose has changed a lot.

The old docker-compose command with a hyphen is gone. The version field in Compose YAML is dead. The old x-develop key is now just develop. Watch mode is production-ready and supports initial sync. There is a critical path traversal CVE if you use include with OCI artifacts. And yes, Compose jumped from v2 to v5.

This article was originally published in November 2024 and updated in March 2026 with Compose v5, CVE-2025-62725, v1 removal, and newer spec features.

If you have been using Docker Compose for a while, you have probably noticed things breaking or changing underneath you.

The last two years have been the most aggressive evolution Compose has ever gone through, and not all of it was obvious.

I use Compose daily. Most of my development setups run on it. When Compose changes, I notice.

Here is what actually matters.

## What Broke

[matter-of-fact] First: docker-compose is dead.

Not deprecated. Not in maintenance mode. Dead.

The standalone docker-compose binary, the old Python-based version one, was removed from GitHub Actions runners and official Docker images in April 2025.

If your CI or deployment scripts still call docker-compose with a hyphen, they are broken or about to be.

The old command was docker-compose up dash d. The modern command is docker compose up dash d.

That space matters.

The Go-based docker compose implementation has been the real implementation since 2022. The old v1 command stayed alive for compatibility. That compatibility period is over.

Second: the version field is gone.

[deliberate] Stop putting version colon three point eight at the top of your Compose files.

It does nothing. It has been ignored since Compose v2 and is now officially deprecated. Modern Compose files start with services.

If a tutorial still tells you to include a version field, the tutorial is outdated.

There are other old patterns you should remove too.

Do not use links. Use Docker networks.

Avoid container_name unless you have a very specific reason. Hardcoded container names break scaling and create conflicts.

And if you are doing complex volume mounts, prefer the long-form syntax with type, source, and target instead of relying on terse shorthand.

## What Is New and Actually Useful

[matter-of-fact] The biggest quality-of-life improvement is watch mode.

The develop section, formerly x-develop, lets you define file watch rules that automatically sync files, restart services, or rebuild containers when files change.

For example, you can tell Compose to sync changes from your local source directory into a container, and rebuild only when package metadata changes.

There are three main actions.

Sync copies changed files into the container without rebuilding.

Restart restarts the service when files change.

Rebuild triggers a full rebuild.

As of September 2025, there is also initial_sync. This syncs files immediately when you start docker compose watch, so you do not have to wait for the first file change to trigger synchronization.

That was a real pain point for a long time.

The command is docker compose watch.

No more manual rebuilds during development. This genuinely changed my workflow.

## Include with OCI Artifacts

[deliberate] The include directive can now pull Compose fragments from OCI registries.

That means you can share common service definitions across projects: database configs, monitoring stacks, repeated infrastructure pieces, and so on.

There is also experimental support for Git repositories.

This is useful, but read the security section before you adopt it. There is a CVE attached to this area.

## GPU Support

GPU passthrough also got cleaner.

There is now a shorter gpus syntax alongside the older, more verbose deploy resources approach.

AMD GPU support was officially integrated in 2025 too, so this is no longer only about NVIDIA.

## Models

The Compose spec now includes a models element for defining AI and machine learning models as OCI artifacts.

You can package large language models and inference runtimes directly into a Compose setup.

That is niche, but interesting if you are doing local AI work.

## Better Dependencies

depends_on has gotten more flexible.

You can still express that one service depends on another service being healthy. But now you can also say that a dependent service should restart when the dependency restarts, or that the dependency is not strictly required.

The restart true and required false options are genuinely useful for resilient local development setups.

## What You Should Know

[deliberate] The big security issue is CVE-2025-62725.

If you use include with OCI artifacts, update to Docker Compose v2.40.2 or later immediately.

The vulnerability is a path traversal issue during artifact resolution. In practical terms, a malicious OCI reference can escape the cache directory. Even a harmless-looking command like docker compose ps can trigger it if your Compose file includes the malicious reference.

Docker patched this with a path validation check, but you need to be on a fixed version.

## Compose v5

[matter-of-fact] Docker jumped from v2 to v5.

It skipped 3 and 4 to avoid confusion with the old Compose file format versions.

Functionally, v5 is similar to late v2 releases, but it includes an official Go SDK for programmatic access. That means Go applications can embed Compose functionality directly instead of shelling out to the CLI.

To check your version, run docker compose version.

## Bake Is the Default Build Tool

[conversational tone] Docker Bake, through BuildKit, is now the default for docker compose build.

It handles multi-target builds, cross-platform compilation, and advanced caching better than the legacy builder.

If you have not looked at docker-bake.hcl files yet, they are worth understanding, especially for complex multi-service builds.

## Healthcheck Improvements

[slows down] Healthchecks also improved.

The start_interval field lets you use a faster check interval during the startup grace period.

For example, a database service can check every two seconds during startup, then fall back to checking every thirty seconds after the start period ends.

That means dependent services can start faster without weakening normal health check intervals.

## Migration Checklist

[matter-of-fact] If you have not updated your Compose setup in a while, here is what I would do.

Remove version fields from all Compose files.

Replace docker-compose with docker compose in all scripts and CI configs.

Rename x-develop to develop in watch configurations.

Update to v2.40.2 or later if you use include, because of CVE-2025-62725.

Replace links with Docker networks if you somehow still use links.

And test your CI. GitHub Actions runners moved to newer Compose versions, so old assumptions can break quickly.

## Final Thought

[reflective] Compose is still Compose. The core idea is the same: describe services, wire them together, and run a local or simple multi-container environment without making the setup miserable.

But the tooling around that idea has changed sharply.

If your Compose knowledge froze around the old docker-compose command and versioned YAML files, it is time to refresh it.
