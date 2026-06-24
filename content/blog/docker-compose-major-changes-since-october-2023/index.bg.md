---
lang: "bg"
translationOf: "docker-compose-major-changes-since-october-2023"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "1e96a25eca95e021"
title: "Еволюцията на Docker Compose: какво се промени и защо има значение"
date: "2024-11-20T00:00:00.000Z"
slug: "docker-compose-major-changes-since-october-2023"
description: "Docker Compose се промени драстично -- v1 е мъртъв, полето version го няма, watch mode е готов за продукционна употреба, а има и критичен CVE, за който трябва да знаеш. Обновено през март 2026."
featuredImage: "./images/featured.jpg"
tags: ["Docker", "Docker Compose", "DevOps", "Containers", "Development Environment"]
imageCaption: "Ред малки дървени транспортни каси върху пристанищен док в първата светлина на деня."
audioUrl: "/audio/articles/docker-compose-major-changes-since-october-2023/bg/5egO01tkUjEzu7xSSE8M-8d138f4f6abd.m4a"
audioDuration: "10:10"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/docker-compose-major-changes-since-october-2023.bg.md"
---

> **TL;DR:** Docker Compose v1 (`docker-compose`) беше напълно премахнат през април 2025. Полето `version` в твоя YAML е мъртво. Ключът `x-develop` вече е просто `develop`. Watch mode е готов за продукционна употреба с `initial_sync`. Има критичен path traversal CVE (CVE-2025-62725), ако използваш `include` с OCI artifacts -- обнови до v2.40.2+. И да, Compose скочи от v2 на v5. Подробностите са по-долу.

> *Първоначално публикувано през ноември 2024. Обновено през март 2026 с Compose v5, CVE-2025-62725, премахването на v1 и нови възможности в спецификацията.*

Ако използваш Docker Compose от известно време, вероятно си забелязал как неща се чупят или се променят под краката ти. Последните две години бяха най-агресивната еволюция, през която Compose някога е минавал -- и не всичко беше очевидно.

Използвам Compose всеки ден. Повечето ми [development setups](/laravel-sail-vs-laradock-choosing-right-docker-solution/) вървят върху него. Когато нещата се променят, забелязвам. Ето какво реално има значение.

## Какво се счупи

### docker-compose е мъртъв

Не deprecated. Не в maintenance mode. **Мъртъв.** Самостоятелният `docker-compose` binary (Python-базираният v1) беше премахнат от GitHub Actions runners и официалните Docker images през април 2025 <small><a href="#ref1">[1]</a></small>. Ако твоите CI/CD pipelines все още сочат към `docker-compose` с тире, те вече са счупени или съвсем скоро ще бъдат.

```bash
# This no longer works
docker-compose up -d

# This is the only way now
docker compose up -d
```

Go-базираният `docker compose` (v2, сега v5) е реалната имплементация от 2022 насам. v1 CLI беше на животоподдържаща система заради съвместимост. Тази система беше изключена.

### Полето version го няма

Спри да слагаш `version: "3.8"` най-горе в Compose файловете си. Не прави нищо. Игнорира се още от v2 и вече е официално deprecated. Модерните Compose файлове започват със `services:`.

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

Ако видиш `version:` в tutorial, този tutorial е остарял.

### Други deprecations

- **`links`** -- използвай Docker networks. Links са legacy още от пускането на Compose v2.
- **`container_name`** -- остави Docker да управлява имената. Hardcoded имена чупят scaling-а и причиняват конфликти.
- **Кратък volume syntax за complex mounts** -- използвай long-form syntax с `type`, `source`, `target`.

## Какво е ново и реално полезно

### Watch Mode (вече готов за продукционна употреба)

Това е най-голямото quality-of-life подобрение от години. Секцията `develop` (преди `x-develop` -- махни `x-` prefix-а, вече не е experimental) ти позволява да дефинираш file watch правила, които автоматично sync-ват или rebuild-ват при промяна на файлове:

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

Има три налични actions (от v2.32.0 насам):
- **`sync`** -- копира променените файлове в container-а без rebuild
- **`restart`** -- рестартира service-а, когато файловете се променят
- **`rebuild`** -- стартира пълен rebuild

Към септември 2025 има и **`initial_sync`** -- той sync-ва всички файлове веднага щом стартираш `docker compose watch`, така че не чакаш първата промяна да задейства synchronization. Това беше болезнена точка дълго време.

```bash
docker compose watch
```

Край на ръчните rebuild-и по време на development. Това наистина промени workflow-а ми.

### Include с OCI Artifacts

Директивата `include` вече може да дърпа Compose fragments от OCI registries:

```yaml
include:
  - oci://docker.io/username/my-compose-fragment:latest
```

Има и experimental поддръжка за Git repositories. Това е полезно за споделяне на общи service definitions между проекти -- database configs, monitoring stacks и т.н.

**Но първо прочети security секцията по-долу.** Има CVE.

### GPU Support

GPU passthrough стана по-чист. Вече има по-кратък `gpus:` syntax (v2.30.0+) заедно с verbose подхода през `deploy.resources.reservations.devices`. AMD GPU support беше официално интегриран през 2025 -- вече не е само NVIDIA.

### Models Element

Compose spec вече включва `models` element за дефиниране на AI/ML models като OCI artifacts. Можеш да пакетираш LLMs и inference runtimes директно в Compose setup-а си. Нишово, но интересно, ако правиш local AI work.

### По-добри зависимости

Условията на `depends_on` станаха по-гъвкави:

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy
        restart: true      # restart web if db restarts
        required: false     # web can start even if db isn't ready
```

Опциите `restart: true` и `required: false` са истински полезни за устойчиви local development setups.

## Какво трябва да знаеш

### CVE-2025-62725: Include Path Traversal

Ако използваш директивата `include` с OCI artifacts, **обнови до v2.40.2 или по-нова версия веднага** <small><a href="#ref2">[2]</a></small>. Path traversal vulnerability позволява на attacker да избяга от cache directory по време на artifact resolution. Дори невинно изглеждащо `docker compose ps` може да го trigger-не, ако твоят Compose file include-ва malicious OCI reference.

Docker patch-на това с `validatePathInBase()` check, но трябва да си на fixed version.

### Compose v5

Docker скочи от v2 на v5 (прескачайки 3 и 4, за да избегне объркване със старите file format versions) <small><a href="#ref3">[3]</a></small>. Функционално v5 е същият като късните v2 releases, но включва официален **Go SDK** за programmatic access -- което значи, че можеш да embed-неш Compose functionality директно в Go applications, без да shell-ваш към CLI.

Провери версията си:

```bash
docker compose version
# Docker Compose version v5.1.0
```

### Bake е default build tool

Docker Bake (през BuildKit) вече е default за `docker compose build`. Той се справя с multi-target builds, cross-platform compilation и advanced caching strategies по-добре от legacy builder-а. Ако още не си поглеждал `docker-bake.hcl` файлове, струва си да ги разбереш -- особено за сложни multi-service builds.

### Healthcheck подобрения

Полето `start_interval` ти позволява да зададеш по-бърз check interval по време на startup grace period:

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

Това означава, че dependent services стартират по-бързо, без да компрометираш production health check intervals.

## Migration Checklist

Ако не си обновявал Compose setup-а си от известно време:

1. **Премахни `version:`** от всички Compose files.
2. **Замени `docker-compose`** с `docker compose` във всички scripts и CI configs.
3. **Преименувай `x-develop`** на `develop`** в watch configurations.
4. **Обнови до v2.40.2+**, ако използваш `include` (CVE-2025-62725).
5. **Замени `links`** с Docker networks, ако някак все още ги използваш.
6. **Тествай CI-то си** -- GitHub Actions обновиха runners до Compose v2.40.3 през февруари 2026 <small><a href="#ref4">[4]</a></small>.

---

### References

<a id="ref1"></a>1. [Docker Compose v1 removed from runner images (April 2025)](https://github.com/actions/runner-images/issues/9557) -- *GitHub Actions announcement за премахването на v1.*<br>
<a id="ref2"></a>2. [CVE-2025-62725: From "docker compose ps" to System Compromise](https://www.imperva.com/blog/cve-2025-62725-from-docker-compose-ps-to-system-compromise/) -- *Подробният writeup на Imperva за include path traversal vulnerability.*<br>
<a id="ref3"></a>3. [Docker Compose Releases](https://github.com/docker/compose/releases) -- *Официална release история, включително v5.*<br>
<a id="ref4"></a>4. [Docker and Docker Compose version upgrades on hosted runners](https://github.blog/changelog/2026-01-30-docker-and-docker-compose-version-upgrades-on-hosted-runners/) -- *GitHub update-ът за runners през февруари 2026.*<br>
<a id="ref5"></a>5. [Compose Specification](https://docs.docker.com/compose/compose-file/) -- *Официална Compose file reference.*<br>
<a id="ref6"></a>6. [Use Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) -- *Документацията на Docker за watch mode.*<br>
<a id="ref7"></a>7. [Enable GPU Support in Docker Compose](https://docs.docker.com/compose/how-tos/gpu-support/) -- *GPU passthrough docs, включително AMD support.*<br>
<a id="ref8"></a>8. [Docker Compose Include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) -- *Include directive с OCI и Git support.*

---

### Related Posts

- [Laravel Sail vs Laradock: избор на правилното Docker решение](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- сравнение на Docker-базирани PHP development environments.
