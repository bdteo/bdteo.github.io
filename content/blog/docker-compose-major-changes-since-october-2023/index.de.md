---
lang: "de"
translationOf: "docker-compose-major-changes-since-october-2023"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "1e96a25eca95e021"
title: "Die Entwicklung von Docker Compose: Was sich geändert hat und warum es wichtig ist"
date: "2024-11-20T00:00:00.000Z"
slug: "docker-compose-major-changes-since-october-2023"
description: "Docker Compose hat sich drastisch verändert -- v1 ist tot, das version-Feld ist weg, der Watch-Modus ist produktionsreif, und es gibt eine kritische CVE, die du kennen solltest. Aktualisiert im März 2026."
featuredImage: "./images/featured.jpg"
tags: ["Docker", "Docker Compose", "DevOps", "Container", "Entwicklungsumgebung"]
imageCaption: "Eine Reihe kleiner hölzerner Versandkisten auf einem Hafenkai im ersten Morgenlicht."
---

> **TL;DR:** Docker Compose v1 (`docker-compose`) wurde im April 2025 vollständig entfernt. Das Feld `version` in deinem YAML ist tot. Der Schlüssel `x-develop` heißt jetzt einfach `develop`. Der Watch-Modus ist mit `initial_sync` produktionsreif. Es gibt eine kritische Path-Traversal-CVE (CVE-2025-62725), wenn du `include` mit OCI-Artefakten nutzt -- aktualisiere auf v2.40.2 oder neuer. Und ja, Compose ist von v2 auf v5 gesprungen. Details unten.

> *Ursprünglich im November 2024 veröffentlicht. Aktualisiert im März 2026 mit Compose v5, CVE-2025-62725, der Entfernung von v1 und neuen Spec-Funktionen.*

Wenn du Docker Compose schon eine Weile nutzt, hast du wahrscheinlich bemerkt, dass Dinge unter deinen Füßen brechen oder sich verändern. Die letzten zwei Jahre waren die aggressivste Entwicklung, die Compose je durchlaufen hat -- und nicht alles davon war offensichtlich.

Ich benutze Compose täglich. Die meisten meiner [Entwicklungs-Setups](/laravel-sail-vs-laradock-choosing-right-docker-solution/) laufen darauf. Wenn sich Dinge ändern, merke ich das. Hier ist, was wirklich zählt.

## Was kaputtging

### docker-compose ist tot

Nicht deprecated. Nicht im Wartungsmodus. **Tot.** Das eigenständige `docker-compose`-Binary (die Python-basierte v1) wurde im April 2025 aus GitHub-Actions-Runnern und offiziellen Docker-Images entfernt <small><a href="#ref1">[1]</a></small>. Wenn deine CI/CD-Pipelines noch `docker-compose` mit Bindestrich referenzieren, sind sie kaputt oder kurz davor.

```bash
# This no longer works
docker-compose up -d

# This is the only way now
docker compose up -d
```

Das Go-basierte `docker compose` (v2, inzwischen v5) ist seit 2022 die eigentliche Implementierung. Die v1-CLI hing aus Kompatibilitätsgründen an der Lebenserhaltung. Diese Lebenserhaltung ist beendet.

### Das version-Feld ist weg

Hör auf, `version: "3.8"` an den Anfang deiner Compose-Dateien zu setzen. Es tut nichts. Es wird seit v2 ignoriert und ist jetzt offiziell deprecated. Moderne Compose-Dateien beginnen mit `services:`.

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

Wenn du `version:` in einem Tutorial siehst, ist dieses Tutorial veraltet.

### Weitere Deprecations

- **`links`** -- nutze Docker-Netzwerke. Links sind seit dem Start von Compose v2 Legacy.
- **`container_name`** -- lass Docker die Namen verwalten. Fest codierte Namen brechen Skalierung und verursachen Konflikte.
- **Kurze Volume-Syntax für komplexe Mounts** -- nutze die Langform mit `type`, `source`, `target`.

## Was neu und tatsächlich nützlich ist

### Watch-Modus (jetzt produktionsreif)

Das ist die größte Verbesserung der Lebensqualität seit Jahren. Der Abschnitt `develop` (früher `x-develop` -- lass das Präfix `x-` weg, es ist nicht mehr experimentell) ermöglicht dir, Regeln zur Dateiüberwachung zu definieren, die automatisch synchronisieren oder neu bauen, wenn sich Dateien ändern:

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

Drei Aktionen sind verfügbar (seit v2.32.0):
- **`sync`** -- kopiert geänderte Dateien in den Container, ohne neu zu bauen
- **`restart`** -- startet den Service neu, wenn sich Dateien ändern
- **`rebuild`** -- löst einen vollständigen Rebuild aus

Seit September 2025 gibt es außerdem **`initial_sync`** -- es synchronisiert alle Dateien sofort, wenn du `docker compose watch` startest, sodass du nicht auf die erste Änderung warten musst, um die Synchronisierung auszulösen. Das war lange ein Schmerzpunkt.

```bash
docker compose watch
```

Keine manuellen Rebuilds mehr während der Entwicklung. Das hat meinen Workflow wirklich verändert.

### Include mit OCI-Artefakten

Die Direktive `include` kann jetzt Compose-Fragmente aus OCI-Registries ziehen:

```yaml
include:
  - oci://docker.io/username/my-compose-fragment:latest
```

Es gibt außerdem experimentelle Unterstützung für Git-Repositorys. Das ist nützlich, um gemeinsame Service-Definitionen über Projekte hinweg zu teilen -- Datenbankkonfigurationen, Monitoring-Stacks usw.

**Aber lies zuerst den Sicherheitsabschnitt unten.** Es gibt eine CVE.

### GPU-Unterstützung

GPU-Passthrough ist sauberer geworden. Es gibt jetzt neben dem ausführlichen Ansatz über `deploy.resources.reservations.devices` eine kürzere `gpus:`-Syntax (v2.30.0+). AMD-GPU-Unterstützung wurde 2025 offiziell integriert -- nicht mehr nur NVIDIA.

### Models-Element

Die Compose-Spec enthält jetzt ein `models`-Element, um AI/ML-Modelle als OCI-Artefakte zu definieren. Du kannst LLMs und Inference-Runtimes direkt in deinem Compose-Setup paketieren. Nischig, aber interessant, wenn du lokal mit AI arbeitest.

### Bessere Dependencies

Die `depends_on`-Bedingungen sind flexibler geworden:

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy
        restart: true      # restart web if db restarts
        required: false     # web can start even if db isn't ready
```

Die Optionen `restart: true` und `required: false` sind wirklich nützlich für robuste lokale Entwicklungs-Setups.

## Was du wissen solltest

### CVE-2025-62725: Include Path Traversal

Wenn du die Direktive `include` mit OCI-Artefakten nutzt, **aktualisiere sofort auf v2.40.2 oder neuer** <small><a href="#ref2">[2]</a></small>. Eine Path-Traversal-Schwachstelle erlaubt es einem Angreifer, bei der Artefaktauflösung aus dem Cache-Verzeichnis auszubrechen. Sogar ein harmlos wirkendes `docker compose ps` kann sie auslösen, wenn deine Compose-Datei eine bösartige OCI-Referenz einbindet.

Docker hat das mit einer `validatePathInBase()`-Prüfung gepatcht, aber du musst auf der gefixten Version sein.

### Compose v5

Docker ist von v2 auf v5 gesprungen (3 und 4 wurden übersprungen, um Verwirrung mit den alten Dateiformat-Versionen zu vermeiden) <small><a href="#ref3">[3]</a></small>. Funktional ist v5 dasselbe wie späte v2-Releases, aber es enthält ein offizielles **Go SDK** für programmatischen Zugriff -- du kannst Compose-Funktionalität also direkt in Go-Anwendungen einbetten, ohne zur CLI zu shellen.

Prüfe deine Version:

```bash
docker compose version
# Docker Compose version v5.1.0
```

### Bake ist das Standard-Build-Tool

Docker Bake (über BuildKit) ist jetzt der Standard für `docker compose build`. Es beherrscht Multi-Target-Builds, Cross-Platform-Kompilierung und fortgeschrittene Caching-Strategien besser als der Legacy-Builder. Wenn du dir `docker-bake.hcl`-Dateien noch nicht angesehen hast, lohnt es sich, sie zu verstehen -- besonders bei komplexen Multi-Service-Builds.

### Healthcheck-Verbesserungen

Mit dem Feld `start_interval` kannst du während der Startup-Grace-Period ein schnelleres Prüfintervall setzen:

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

Das bedeutet, dass deine abhängigen Services schneller starten, ohne die Healthcheck-Intervalle in Produktion zu kompromittieren.

## Migrations-Checkliste

Wenn du dein Compose-Setup länger nicht aktualisiert hast:

1. **Entferne `version:`** aus allen Compose-Dateien.
2. **Ersetze `docker-compose`** durch `docker compose` in allen Skripten und CI-Konfigurationen.
3. **Benenne `x-develop`** in Watch-Konfigurationen in `develop` um.
4. **Aktualisiere auf v2.40.2+**, wenn du `include` nutzt (CVE-2025-62725).
5. **Ersetze `links`** durch Docker-Netzwerke, falls du sie irgendwie noch nutzt.
6. **Teste deine CI** -- GitHub Actions hat die Runner im Februar 2026 auf Compose v2.40.3 aktualisiert <small><a href="#ref4">[4]</a></small>.

---

### Referenzen

<a id="ref1"></a>1. [Docker Compose v1 removed from runner images (April 2025)](https://github.com/actions/runner-images/issues/9557) -- *GitHub-Actions-Ankündigung zur Entfernung von v1.*<br>
<a id="ref2"></a>2. [CVE-2025-62725: From "docker compose ps" to System Compromise](https://www.imperva.com/blog/cve-2025-62725-from-docker-compose-ps-to-system-compromise/) -- *Impervas detaillierter Bericht zur Include-Path-Traversal-Schwachstelle.*<br>
<a id="ref3"></a>3. [Docker Compose Releases](https://github.com/docker/compose/releases) -- *Offizielle Release-Historie inklusive v5.*<br>
<a id="ref4"></a>4. [Docker and Docker Compose version upgrades on hosted runners](https://github.blog/changelog/2026-01-30-docker-and-docker-compose-version-upgrades-on-hosted-runners/) -- *GitHubs Runner-Update vom Februar 2026.*<br>
<a id="ref5"></a>5. [Compose Specification](https://docs.docker.com/compose/compose-file/) -- *Offizielle Compose-Dateireferenz.*<br>
<a id="ref6"></a>6. [Use Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) -- *Dockers Dokumentation zum Watch-Modus.*<br>
<a id="ref7"></a>7. [Enable GPU Support in Docker Compose](https://docs.docker.com/compose/how-tos/gpu-support/) -- *GPU-Passthrough-Dokumentation inklusive AMD-Unterstützung.*<br>
<a id="ref8"></a>8. [Docker Compose Include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) -- *Include-Direktive mit OCI- und Git-Unterstützung.*

---

### Verwandte Beiträge

- [Laravel Sail vs Laradock: Die richtige Docker-Lösung wählen](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- ein Vergleich Docker-basierter PHP-Entwicklungsumgebungen.
