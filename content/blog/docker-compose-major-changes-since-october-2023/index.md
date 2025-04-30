---
title: "Docker Compose Evolution: Major Changes Since Oct 2023"
date: "2024-11-20T00:00:00.000Z"
description: "Key Docker Compose updates since Oct 2023: New CLI ('docker compose'), 'version' deprecated, Compose Watch, new commands ('attach', 'stats') & YAML changes."
featuredImage: "./images/featured.jpg"
imageCaption: "An overview of Docker Compose's evolution and new features"
---

# Docker Compose Evolution: Major Changes Since October 2023

Since October 2023, Docker Compose has undergone significant evolution with important structural changes, new features, and improvements in developer experience. This comprehensive guide covers the major updates and changes that developers should be aware of.

---

## Breaking Changes and Deprecations

### Version Field Deprecation

The `version` field in `docker-compose.yaml` is now completely deprecated. Modern Docker Compose files should no longer include version specifications:

```yaml
# OLD (Deprecated)
version: "3.8"
services:
  web:
    image: nginx

# NEW (Recommended)
services:
  web:
    image: nginx
```

### Docker Compose Command Changes

The standalone `docker-compose` (with hyphen) command is now considered legacy and is in maintenance mode:

```bash
# OLD (Deprecated)
docker-compose up -d

# NEW (Recommended)
docker compose up -d
```

**Key Points:**

- `docker compose` is now integrated directly into the Docker CLI.
- The Python-based `docker-compose` tool is only receiving maintenance updates.
- New features are exclusively added to `docker compose`.
- Modern Docker Desktop installations default to `docker compose`.

### Additional Deprecations

Several legacy fields are now discouraged:

- **`links`**: Use Docker networks instead.
- **`container_name`**: Allow Docker to manage container names dynamically.
- **Legacy volume mount syntax**: Use the new long-form syntax.
- **Direct use of host ports without ranges**: Use port ranges when possible.

---

## Major YAML Structure Updates

### Enhanced Service Definitions

```yaml
#file: noinspection ComposeMissingKeys
services:
  myapp:
    build:
      args:
        - buildno=1
      ssh:
        - default=/path/to/key
      network: host
      platforms:
        - "linux/amd64"
        - "linux/arm64"

    healthcheck:
      start_period: 30s
      interval: 10s
      retries: 3
      start_interval: 5s
```

### Improved Dependencies and Conditions

```yaml
services:
  web:
    depends_on:
      db:
        condition: "service_healthy"
        restart: true
        required: false
```

### Modern Volume Mount Syntax

```yaml
services:
  app:
    volumes:
      - type: bind
        source: ./app
        target: /app
        bind:
          create_host_path: true
      - type: volume
        source: data
        target: /data
        volume:
          nocopy: true
```

---

## New Features and CLI Enhancements

### New Commands

1. **`docker compose attach`**: Attach to service containers for debugging.
2. **`docker compose stats`**: Live resource usage monitoring.
3. **`docker compose watch`**: Automatic service updates during development.
4. **`docker compose logs --index`**: Select logs from specific replicas.
5. **`docker compose exec --privileged`**: Run commands inside a container with elevated privileges.
6. **`docker compose cp`**: Copy files between the host and a service's container.

### Enhanced Build and Deploy Options

```bash
# Build with dependencies
docker compose build --with-dependencies

# Convert compose files
docker compose convert --no-path-resolution

# Enhanced profile management
docker compose --profile prod --profile dev up
docker compose --profile-inherit=false up

# Improved service operations
docker compose up --wait
docker compose up --quiet-pull
docker compose down --remove-orphans
```

---

## Docker Compose Watch

### File Watch Configuration

The new `x-develop` section in the Docker Compose file allows for more sophisticated control over file watching and service updates:

```yaml
services:
  web:
    build: .
    x-develop:
      watch:
        - path: ./src
          action: sync
          target: /app/src
        - path: ./package.json
          action: rebuild
```

### Watch Features

- **Automatic service updates** during development.
- **Configurable watch paths** and actions (e.g., sync, rebuild).
- **Synchronized file updates** without rebuilds.
- **Selective rebuild triggers**.
- Support for **multiple watch configurations** per service.

---

## Security and Resource Management

### Security Improvements

```yaml
services:
  web:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_ADMIN
```

### Security Updates

- **Critical patches** for remote code execution (RCE) vulnerabilities in Docker extensions.
- Enhanced **validation of extension descriptions** and publisher URLs.
- Improved **container isolation defaults**.
- Regular **security maintenance releases**.

### Resource Management

- Introduction of **Resource Saver mode** in Docker Desktop to reduce memory footprint when idle.
- Improved handling of **container lifecycle**.
- Better **network conflict detection**.
- Enhanced **build cache management** with layer optimization.
- More efficient handling of **build cache layers**.
- Optimized **cache invalidation strategies**.

---

## Docker Desktop Integration

### Compose Watch GA Release

- **Docker Desktop 4.24** introduced the Compose Watch GA release.
- Allows developers to **automatically update and preview running services** as they edit code without manually triggering builds.
- Significantly enhances the **"inner loop" of development** by reducing manual steps.

### Resource Optimization

- **Resource Saver mode** for reduced memory footprint.
- Better handling of **idle resources**.
- Improved **performance** during development.
- Optimized **build cache handling**.

---

## Migration Tips

1. **Remove** the `version` field from all compose files.
2. **Update CI/CD pipelines** to use `docker compose` instead of `docker-compose`.
3. **Review and update documentation** and scripts accordingly.
4. Verify the **Go-based implementation** with `docker compose version`.
5. **Test services** with new dependency handling.
6. Review **security configurations**.
7. Replace **deprecated fields** with modern alternatives.
8. Update **file watch configurations** to use `x-develop`.

---

## Best Practices

1. Use **Docker networks** instead of legacy linking (`links`).
2. Implement proper **healthchecks** for service dependencies.
3. Utilize **build cache optimization** features.
4. Configure appropriate **resource limits**.
5. Implement proper **security measures**.
6. Use modern **volume mount syntax**.
7. Leverage **file watch** for development efficiency.

---

## Looking Forward

Docker Compose follows a rolling release model, and new features are continuously being added. Stay updated with the latest advancements by regularly consulting the official Docker documentation and release notes.

---

## Related Resources

- [Docker Compose Release Notes](https://docs.docker.com/compose/release-notes/)
- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [Compose Specification](https://docs.docker.com/compose/compose-file/)
- [Docker Blog](https://www.docker.com/blog/)
- [Docker Security Updates](https://docs.docker.com/security/)
- [Docker Compose Watch Documentation](https://docs.docker.com/compose/compose-file/#x-develop)
