---
lang: "de"
translationOf: "laravel-sail-vs-laradock-choosing-right-docker-solution"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "a3219664c049cc89"
title: "Laravel Sail vs. Laradock: Vergleich für PHP-Docker-Devs"
date: "2024-08-08T12:00:00.000Z"
description: "Ein ehrlicher Vergleich von Laravel Sail, Laradock, Herd und FrankenPHP für PHP-Entwicklung im Jahr 2026. Welches Docker-Setup du wählen solltest - und wann du Docker ganz überspringst."
featuredImage: "./images/featured.jpg"
imageCaption: "Zwei moderne kabellose Computermäuse nebeneinander auf weißem Marmor. Such dir eine aus."
audioUrl: "/audio/articles/laravel-sail-vs-laradock-choosing-right-docker-solution/de/LTo9oDjTW1FdEgMfiXWQ-414367b77418.m4a"
audioDuration: "12:06"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/laravel-sail-vs-laradock-choosing-right-docker-solution.de.md"
---

> **TL;DR:** Für die meisten Laravel-Entwickler im Jahr 2026: Verwende **Laravel Herd**, wenn du null Reibung willst (nativ, kein Docker, in Sekunden eingerichtet). Verwende **Sail**, wenn dein Team identische Umgebungen braucht oder du von Diensten wie Redis/Meilisearch abhängst. Verwende **Laradock**, wenn du mit mehreren PHP-Frameworks arbeitest. Verwende ein **eigenes Docker-Compose**-Setup, wenn du aus den Abstraktionen herausgewachsen bist. Und wenn Performance alles ist, schau dir **FrankenPHP + Octane** an.

> *Ursprünglich im August 2024 veröffentlicht. Im März 2026 mit Laravel 12/Herd/FrankenPHP und dem aktuellen Stand des Ökosystems aktualisiert.*

Früher lautete die Frage: "Sail oder Laradock?" Dieser Rahmen ist inzwischen zu eng. Die eigentliche Frage ist: **Wie sollte ich meine Laravel-Entwicklungsumgebung im Jahr 2026 aufsetzen?** Es gibt mehr Optionen als je zuvor, und die beste Wahl hängt davon ab, was du tatsächlich brauchst.

Ich habe die meisten davon benutzt. Aktuell nutze ich ein eigenes Docker-Compose-Setup, weil ich volle Kontrolle über meine Container will, ohne dass Abstraktionen verbergen, was passiert. Aber das ist meine Vorliebe, keine universelle Empfehlung. Gehen wir durch, was dir jede Option gibt.

## Die Kandidaten

### Laravel Herd

[Herd](https://herd.laravel.com/) ist die neueste Option und für viele Entwickler die richtige. Es ist eine native Anwendung (macOS und Windows - noch kein Linux), die dir PHP, Nginx, Node.js und Dnsmasq ohne Docker gibt. Die Pro-Version ergänzt MySQL, PostgreSQL, Redis und Debugging-Tools.

Das Killer-Feature: PHP-Versionen in Sekunden wechseln (7.4 bis 8.4), automatisches `*.test`-Domain-Routing und kein Docker-Overhead. Wenn du eine normale Laravel-App baust und keine exotischen Dienste brauchst, bringt Herd dich in unter einer Minute zum Coden.

### Laravel Sail

[Sail](https://laravel.com/docs/12.x/sail) ist Laravels offizielle Docker-basierte Entwicklungsumgebung. Es legt eine `sail`-CLI über Docker Compose, die die üblichen Befehle abstrahiert (`sail up`, `sail artisan`, `sail php`).

Seit Laravel 12 wird Sail standardmäßig mit PHP 8.5 ausgeliefert, nutzt `compose.yaml` (den modernen Dateinamen, nicht `docker-compose.yml`) und bringt Swoole für Octane direkt mit. Außerdem unterstützt es Devcontainer-Generierung über `--devcontainer` für die Integration mit VS Code/GitHub Codespaces.

Standarddienste: PHP, MySQL, Redis, Meilisearch, Mailpit und Selenium.

### Laradock

[Laradock](https://laradock.io/) ist das Schweizer Taschenmesser. Es ist eine Open-Source-Docker-Umgebung, die jedes PHP-Projekt unterstützt - nicht nur Laravel. Sie bietet 70+ vorkonfigurierte Dienste und kann für den Produktionseinsatz konfiguriert werden.

Stand Dezember 2025 wird sie weiterhin aktiv gepflegt (aktuelle PHP-FPM- und Workspace-Image-Updates). Der Preis dafür ist Komplexität: Das Setup dauert länger, die Konfiguration erfordert das Bearbeiten mehrerer Dateien, und du brauchst echtes Docker-Wissen.

### FrankenPHP + Octane

[FrankenPHP](https://frankenphp.dev/) ist ein moderner PHP-Anwendungsserver auf Basis von Caddy. Zusammen mit Laravel Octane erreicht er 4-6 ms Framework-Boot-Zeit pro Request - ein Entwickler berichtete, dass die Latenz durch den Wechsel in den Worker Mode von 7 Sekunden auf 66 ms fiel <small><a href="#ref1">[1]</a></small>.

Laravel Cloud nutzt FrankenPHP in seiner Octane-Runtime in Produktion <small><a href="#ref2">[2]</a></small>. Das neueste Release (v1.11.2, Februar 2026) brachte durch Go 1.26 30% schnelleres CGO und 40% schnellere Garbage Collection.

Das ist keine Entwicklungsumgebung im traditionellen Sinn - es ist eine produktionsreife PHP-Runtime, die du auch in der Entwicklung nutzen kannst. Sail enthält eine Integration, um Octane mit FrankenPHP oder Swoole auszuführen.

## Wann du was nutzen solltest

Hier ist meine ehrliche Einschätzung, basierend darauf, diese Werkzeuge tatsächlich benutzt zu haben:

**Nutze Herd, wenn** du allein oder in einem kleinen Team arbeitest, normale Laravel-Apps baust und null Zeit auf Infrastruktur verwenden willst. Es ist der schnellste Weg von "ich habe eine Idee" zu "ich schreibe Code". Die Einschränkung ist, dass es nur für macOS/Windows verfügbar ist und die kostenlose Version keine Datenbanken enthält.

**Nutze Sail, wenn** dein Team Umgebungsgleichheit braucht, du von bestimmten Dienstversionen abhängst (Redis 7, MySQL 8, PostgreSQL 15), oder du in einer CI/CD-Pipeline arbeitest, die Docker benötigt. Mit Sails `sail:publish`-Befehl kannst du das Docker-Setup anpassen, wenn du aus den Defaults herauswächst.

**Nutze Laradock, wenn** du über mehrere PHP-Frameworks hinweg arbeitest (Symfony, Shopware, Vanilla PHP), exotische Dienste brauchst (Aerospike, RethinkDB, Manticore), oder eine Docker-Umgebung für mehrere Projekte willst. Die Lernkurve ist steiler, aber die Flexibilität ist unerreicht.

**Nutze ein eigenes Docker-Compose-Setup, wenn** du sowohl aus Sail als auch aus Laradock herausgewachsen bist und volle Kontrolle willst. Das ist, was ich mache. Ich pflege mein eigenes `compose.yaml` mit exakt den Diensten, die ich brauche, ohne Abstraktionsschicht, und mit Docker-Compose-Aliases, damit die Befehle kurz bleiben. Es braucht am Anfang mehr Arbeit, aber es gibt keine Magie - alles ist explizit.

**Nutze FrankenPHP + Octane, wenn** du eine High-Performance-API baust oder deine Anwendung latenzsensibel ist. Der Performance-Unterschied ist nicht marginal - es ist eine Größenordnung. Einen Blick wert, selbst wenn du für die allgemeine Entwicklung ein anderes Werkzeug nutzt.

## Die Details, die zählen

### Setup-Zeit

| Tool | Zeit bis zum ersten Request |
|------|-----------------------------|
| Herd | Unter 1 Minute |
| Sail | 5-10 Minuten (Image-Pulls) |
| Custom Compose | 30-60 Minuten (initiales Setup) |
| Laradock | 1-2 Stunden (vollständige Konfiguration) |

### Anpassbarkeit

Sail ist absichtlich begrenzt. Du bekommst die Dienste, die Laravel braucht, und nicht viel mehr. Du *kannst* anpassen, indem du `sail:publish` ausführst und die Dockerfiles bearbeitest, aber an diesem Punkt pflegst du ein eigenes Docker-Setup mit Sails Abstraktionen obendrauf - das Schlechteste aus beiden Welten.

Laradock gibt dir alles, verlangt aber, dass du verstehst, was du aktivierst. Einen Dienst einzuschalten bedeutet, `.env` und möglicherweise `docker-compose.yml` zu bearbeiten, und manche Dienste haben eigene Konfigurationsverzeichnisse.

Custom Compose gibt dir genau das, was du schreibst. Nicht mehr, nicht weniger.

### Produktionsreife

Sail ist ausdrücklich nicht für Produktion gedacht. Laradock kann für Produktion konfiguriert werden, aber du musst wissen, was du bei Security Hardening, Resource Limits und sauberem Networking tust. FrankenPHP ist von Grund auf produktionsreif - dafür ist es gebaut.

### Multi-Projekt-Unterstützung

Sail: ein Projekt pro Umgebung. Du kannst mehrere Sail-Instanzen laufen lassen, aber sie werden sich um Ports streiten.

Laradock: für Multi-Projekt-Setups entworfen. Eine Umgebung, mehrere Projekte, geteilte Dienste.

Custom Compose: was immer du architektierst. Ich halte separate Compose-Dateien pro Projekt mit gemeinsamen Netzwerkdefinitionen.

## Was ich tatsächlich nutze

Custom Docker Compose. Ich habe Aliases für alles - `dcu` für `docker compose up -d`, `dce` für exec, `dcefpm` für PHP-FPM-Shell-Zugriff und eine `sail`-Funktion, die automatisch den Projekt-Root findet. Das Setup steht in meinen [Notizen zur Docker-Compose-Entwicklung](/de/docker-compose-major-changes-since-october-2023/).

Ich habe vor Jahren mit Laradock angefangen, bin zu Sail gewechselt, als es erschien, und bin irgendwann bei einem eigenen Setup gelandet, weil ich genau verstehen wollte, was läuft und warum. Jede Abstraktion versteckt Entscheidungen. Manchmal ist das in Ordnung. Manchmal verursachen diese versteckten Entscheidungen Probleme, die schwer zu debuggen sind, weil du sie nicht sehen kannst.

Wenn ich heute allerdings ein neues Laravel-Projekt mit einem Team starten würde, dem Docker-Interna egal sind, würde ich Sail nehmen. Und wenn ich jemanden neu in Laravel begleiten würde, würde ich sagen: Installier Herd und fang sofort an, Code zu schreiben.

## Andere Optionen, die erwähnenswert sind

- **[DDEV](https://ddev.com/)** - Docker-basiert, gute Laravel-Unterstützung, aktive Roadmap für 2026 mit geplanter Gitpod-Integration. Einen Blick wert, wenn du es für andere CMS-Projekte nutzt (WordPress, Drupal).
- **[Lando](https://lando.dev/)** - eine weitere Docker-Abstraktionsschicht mit Laravel-Plugin (v1.10.0, Januar 2026). Ähnliche Philosophie wie Sail, aber framework-agnostisch.
- **Valet** - der Vorgänger von Herd. Funktioniert immer noch, aber Herd hat es für die meisten Anwendungsfälle abgelöst.

---

### Referenzen

<a id="ref1"></a>1. [Laravel mit FrankenPHP Worker Mode einrichten und beschleunigen](https://medium.com/@danarcahyaa/setup-and-boost-your-laravel-app-with-frankenphp-worker-mode-c0228f44f71b) - *Performance-Vergleich aus der Praxis: 7 s auf 66 ms Latenz.*<br>
<a id="ref2"></a>2. [Wie Laravel Cloud FrankenPHP in Produktion nutzt](https://devconf.net/talk/florian-beer-how-laravel-cloud-uses-frankenphp-in-production) - *DevConf-Talk über Laravel Clouds Octane-Runtime.*<br>
<a id="ref3"></a>3. [Laravel 12.x Sail-Dokumentation](https://laravel.com/docs/12.x/sail) - *Offizielle Sail-Dokumentation mit PHP 8.5 und compose.yaml-Änderungen.*<br>
<a id="ref4"></a>4. [Laravel Herd](https://herd.laravel.com/) - *Offizielle Website für die native Laravel-Entwicklungsumgebung.*<br>
<a id="ref5"></a>5. [FrankenPHP v1.11.2 Release](https://laravel-news.com/frankenphp-v1112-released-with-30-faster-cgo-40-faster-gc-and-security-patches) - *Release vom Februar 2026 mit Performance- und Sicherheitsupdates.*<br>
<a id="ref6"></a>6. [Laradock auf GitHub](https://github.com/laradock/laradock) - *Weiterhin gepflegt, Updates im Dezember 2025.*<br>
<a id="ref7"></a>7. [Der aktuelle Stand lokaler Laravel-Entwicklung](https://aschmelyun.com/blog/the-current-state-of-local-laravel-development/) - *Andrew Schmelyuns Überblick über das Ökosystem.*

---

### Ähnliche Beiträge

- [Docker-Compose-Entwicklung: Was sich geändert hat und warum es zählt](/de/docker-compose-major-changes-since-october-2023/) - die Docker-Compose-Änderungen, die all diese Werkzeuge betreffen.
- [PHP 8.5: Ein Rundgang durch die kommenden Features](/de/php-8-5-new-features-pipe-operator-guide/) - was in der PHP-Version kommt, die Laravel 12 standardmäßig nutzt.
- [PHP 8.3.6 + IMAP auf macOS mit phpenv](/installing-php-8-3-6-with-imap-on-macos-using-phpenv/) - wenn du ein bestimmtes PHP-Setup außerhalb von Docker brauchst.
