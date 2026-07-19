[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

TL;DR: Docker Compose v1 (docker-compose) wurde im April 2025 vollständig entfernt. Das Feld version in deinem YAML ist tot. Der Schlüssel x-develop heißt jetzt einfach develop. Der Watch-Modus ist mit initial_sync produktionsreif. Es gibt eine kritische Path-Traversal-CVE (CVE-2025-62725), wenn du include mit OCI-Artefakten nutzt -- aktualisiere auf v2.40.2 oder neuer. Und ja, Compose ist von v2 auf v5 gesprungen. Details unten.

[conversational tone] Ursprünglich im November 2024 veröffentlicht. Aktualisiert im März 2026 mit Compose v5, CVE-2025-62725, der Entfernung von v1 und neuen Spec-Funktionen.

Wenn du Docker Compose schon eine Weile nutzt, hast du wahrscheinlich bemerkt, dass Dinge unter deinen Füßen brechen oder sich verändern. Die letzten zwei Jahre waren die aggressivste Entwicklung, die Compose je durchlaufen hat -- und nicht alles davon war offensichtlich.

Ich benutze Compose täglich. Die meisten meiner Entwicklungs-Setups laufen darauf. Wenn sich Dinge ändern, merke ich das. Hier ist, was wirklich zählt.

Was kaputtging.

docker-compose ist tot.

[matter-of-fact] Nicht deprecated. Nicht im Wartungsmodus. Tot. Das eigenständige docker-compose-Binary (die Python-basierte v1) wurde im April 2025 aus GitHub-Actions-Runnern und offiziellen Docker-Images entfernt. Wenn deine CI/CD-Pipelines noch docker-compose mit Bindestrich referenzieren, sind sie kaputt oder kurz davor.

Das Go-basierte docker compose (v2, inzwischen v5) ist seit 2022 die eigentliche Implementierung. Die v1-CLI hing aus Kompatibilitätsgründen an der Lebenserhaltung. Diese Lebenserhaltung ist beendet.

Das version-Feld ist weg.

Hör auf, version: "3.8" an den Anfang deiner Compose-Dateien zu setzen. Es tut nichts. Es wird seit v2 ignoriert und ist jetzt offiziell deprecated. Moderne Compose-Dateien beginnen mit services:.

Wenn du version: in einem Tutorial siehst, ist dieses Tutorial veraltet.

[deliberate] Weitere Deprecations.

links -- nutze Docker-Netzwerke. Links sind seit dem Start von Compose v2 Legacy.

container_name -- lass Docker die Namen verwalten. Fest codierte Namen brechen Skalierung und verursachen Konflikte.

Kurze Volume-Syntax für komplexe Mounts -- nutze die Langform mit type, source, target.

Was neu und tatsächlich nützlich ist.

[matter-of-fact] Watch-Modus (jetzt produktionsreif).

Das ist die größte Verbesserung der Lebensqualität seit Jahren. Der Abschnitt develop (früher x-develop -- lass das Präfix x- weg, es ist nicht mehr experimentell) ermöglicht dir, Regeln zur Dateiüberwachung zu definieren, die automatisch synchronisieren oder neu bauen, wenn sich Dateien ändern:

Drei Aktionen sind verfügbar (seit v2.32.0):

sync -- kopiert geänderte Dateien in den Container, ohne neu zu bauen.

restart -- startet den Service neu, wenn sich Dateien ändern.

rebuild -- löst einen vollständigen Rebuild aus.

Seit September 2025 gibt es außerdem initial_sync -- es synchronisiert alle Dateien sofort, wenn du docker compose watch startest, sodass du nicht auf die erste Änderung warten musst, um die Synchronisierung auszulösen. Das war lange ein Schmerzpunkt.

Keine manuellen Rebuilds mehr während der Entwicklung. Das hat meinen Workflow wirklich verändert.

[deliberate] Include mit OCI-Artefakten.

Die Direktive include kann jetzt Compose-Fragmente aus OCI-Registries ziehen:

Es gibt außerdem experimentelle Unterstützung für Git-Repositorys. Das ist nützlich, um gemeinsame Service-Definitionen über Projekte hinweg zu teilen -- Datenbankkonfigurationen, Monitoring-Stacks usw.

Aber lies zuerst den Sicherheitsabschnitt unten. Es gibt eine CVE.

GPU-Unterstützung.

GPU-Passthrough ist sauberer geworden. Es gibt jetzt neben dem ausführlichen Ansatz über deploy.resources.reservations.devices eine kürzere gpus:-Syntax (v2.30.0+). AMD-GPU-Unterstützung wurde 2025 offiziell integriert -- nicht mehr nur NVIDIA.

Models-Element.

Die Compose-Spec enthält jetzt ein models-Element, um AI/ML-Modelle als OCI-Artefakte zu definieren. Du kannst LLMs und Inference-Runtimes direkt in deinem Compose-Setup paketieren. Nischig, aber interessant, wenn du lokal mit AI arbeitest.

Bessere Dependencies.

Die depends_on-Bedingungen sind flexibler geworden:

Die Optionen restart: true und required: false sind wirklich nützlich für robuste lokale Entwicklungs-Setups.

[deliberate] Was du wissen solltest.

CVE-2025-62725: Include Path Traversal.

Wenn du die Direktive include mit OCI-Artefakten nutzt, aktualisiere sofort auf v2.40.2 oder neuer. Eine Path-Traversal-Schwachstelle erlaubt es einem Angreifer, bei der Artefaktauflösung aus dem Cache-Verzeichnis auszubrechen. Sogar ein harmlos wirkendes docker compose ps kann sie auslösen, wenn deine Compose-Datei eine bösartige OCI-Referenz einbindet.

[matter-of-fact] Docker hat das mit einer validatePathInBase()-Prüfung gepatcht, aber du musst auf der gefixten Version sein.

Compose v5.

Docker ist von v2 auf v5 gesprungen (3 und 4 wurden übersprungen, um Verwirrung mit den alten Dateiformat-Versionen zu vermeiden). Funktional ist v5 dasselbe wie späte v2-Releases, aber es enthält ein offizielles Go SDK für programmatischen Zugriff -- du kannst Compose-Funktionalität also direkt in Go-Anwendungen einbetten, ohne zur CLI zu shellen.

Prüfe deine Version:

[conversational tone] Bake ist das Standard-Build-Tool.

Docker Bake (über BuildKit) ist jetzt der Standard für docker compose build. Es beherrscht Multi-Target-Builds, Cross-Platform-Kompilierung und fortgeschrittene Caching-Strategien besser als der Legacy-Builder. Wenn du dir docker-bake.hcl-Dateien noch nicht angesehen hast, lohnt es sich, sie zu verstehen -- besonders bei komplexen Multi-Service-Builds.

[slows down] Healthcheck-Verbesserungen.

Mit dem Feld start_interval kannst du während der Startup-Grace-Period ein schnelleres Prüfintervall setzen:

Das bedeutet, dass deine abhängigen Services schneller starten, ohne die Healthcheck-Intervalle in Produktion zu kompromittieren.

[matter-of-fact] Migrations-Checkliste.

Wenn du dein Compose-Setup länger nicht aktualisiert hast:

Entferne version: aus allen Compose-Dateien.

Ersetze docker-compose durch docker compose in allen Skripten und CI-Konfigurationen.

Benenne x-develop in Watch-Konfigurationen in develop um.

Aktualisiere auf v2.40.2+, wenn du include nutzt (CVE-2025-62725).

[reflective] Ersetze links durch Docker-Netzwerke, falls du sie irgendwie noch nutzt.

Teste deine CI -- GitHub Actions hat die Runner im Februar 2026 auf Compose v2.40.3 aktualisiert.
