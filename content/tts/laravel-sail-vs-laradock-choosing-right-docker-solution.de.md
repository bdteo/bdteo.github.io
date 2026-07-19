TL;DR: Für die meisten Laravel-Entwickler im Jahr 2026: Verwende Laravel Herd, wenn du null Reibung willst (nativ, kein Docker, in Sekunden eingerichtet). Verwende Sail, wenn dein Team identische Umgebungen braucht oder du von Diensten wie Redis/Meilisearch abhängst. Verwende Laradock, wenn du mit mehreren PHP-Frameworks arbeitest. Verwende ein eigenes Docker-Compose-Setup, wenn du aus den Abstraktionen herausgewachsen bist. Und wenn Performance alles ist, schau dir FrankenPHP + Octane an.

[conversational tone] Ursprünglich im August 2024 veröffentlicht. Im März 2026 mit Laravel 12/Herd/FrankenPHP und dem aktuellen Stand des Ökosystems aktualisiert.

Früher lautete die Frage: "Sail oder Laradock?" Dieser Rahmen ist inzwischen zu eng. Die eigentliche Frage ist: Wie sollte ich meine Laravel-Entwicklungsumgebung im Jahr 2026 aufsetzen? Es gibt mehr Optionen als je zuvor, und die beste Wahl hängt davon ab, was du tatsächlich brauchst.

Ich habe die meisten davon benutzt. Aktuell nutze ich ein eigenes Docker-Compose-Setup, weil ich volle Kontrolle über meine Container will, ohne dass Abstraktionen verbergen, was passiert. Aber das ist meine Vorliebe, keine universelle Empfehlung. Gehen wir durch, was dir jede Option gibt.

Die Kandidaten.

Laravel Herd.

Herd ist die neueste Option und für viele Entwickler die richtige. Es ist eine native Anwendung (macOS und Windows — noch kein Linux), die dir PHP, Nginx, Node.js und Dnsmasq ohne Docker gibt. Die Pro-Version ergänzt MySQL, PostgreSQL, Redis und Debugging-Tools.

Das Killer-Feature: PHP-Versionen in Sekunden wechseln (7.4 bis 8.4), automatisches *.test-Domain-Routing und kein Docker-Overhead. Wenn du eine normale Laravel-App baust und keine exotischen Dienste brauchst, bringt Herd dich in unter einer Minute zum Coden.

[matter-of-fact] Laravel Sail.

Sail ist Laravels offizielle Docker-basierte Entwicklungsumgebung. Es legt eine sail-CLI über Docker Compose, die die üblichen Befehle abstrahiert (sail up, sail artisan, sail php).

Seit Laravel 12 wird Sail standardmäßig mit PHP 8.5 ausgeliefert, nutzt compose.yaml (den modernen Dateinamen, nicht docker-compose.yml) und bringt Swoole für Octane direkt mit. Außerdem unterstützt es Devcontainer-Generierung über --devcontainer für die Integration mit VS Code/GitHub Codespaces.

Standarddienste: PHP, MySQL, Redis, Meilisearch, Mailpit und Selenium.

Laradock.

Laradock ist das Schweizer Taschenmesser. Es ist eine Open-Source-Docker-Umgebung, die jedes PHP-Projekt unterstützt — nicht nur Laravel. Sie bietet 70+ vorkonfigurierte Dienste und kann für den Produktionseinsatz konfiguriert werden.

Stand Dezember 2025 wird sie weiterhin aktiv gepflegt (aktuelle PHP-FPM- und Workspace-Image-Updates). Der Preis dafür ist Komplexität: Das Setup dauert länger, die Konfiguration erfordert das Bearbeiten mehrerer Dateien, und du brauchst echtes Docker-Wissen.

FrankenPHP + Octane.

FrankenPHP ist ein moderner PHP-Anwendungsserver auf Basis von Caddy. Zusammen mit Laravel Octane erreicht er 4-6 ms Framework-Boot-Zeit pro Request — ein Entwickler berichtete, dass die Latenz durch den Wechsel in den Worker Mode von 7 Sekunden auf 66 ms fiel.

Laravel Cloud nutzt FrankenPHP in seiner Octane-Runtime in Produktion. Das neueste Release (v1.11.2, Februar 2026) brachte durch Go 1.26 30 Prozent schnelleres CGO und 40 Prozent schnellere Garbage Collection.

Das ist keine Entwicklungsumgebung im traditionellen Sinn — es ist eine produktionsreife PHP-Runtime, die du auch in der Entwicklung nutzen kannst. Sail enthält eine Integration, um Octane mit FrankenPHP oder Swoole auszuführen.

Wann du was nutzen solltest.

Hier ist meine ehrliche Einschätzung, basierend darauf, diese Werkzeuge tatsächlich benutzt zu haben:

Nutze Herd, wenn du allein oder in einem kleinen Team arbeitest, normale Laravel-Apps baust und null Zeit auf Infrastruktur verwenden willst. Es ist der schnellste Weg von "ich habe eine Idee" zu "ich schreibe Code". Die Einschränkung ist, dass es nur für macOS/Windows verfügbar ist und die kostenlose Version keine Datenbanken enthält.

Nutze Sail, wenn dein Team Umgebungsgleichheit braucht, du von bestimmten Dienstversionen abhängst (Redis 7, MySQL 8, PostgreSQL 15), oder du in einer CI/CD-Pipeline arbeitest, die Docker benötigt. Mit Sails sail:publish-Befehl kannst du das Docker-Setup anpassen, wenn du aus den Defaults herauswächst.

[deliberate] Nutze Laradock, wenn du über mehrere PHP-Frameworks hinweg arbeitest (Symfony, Shopware, Vanilla PHP), exotische Dienste brauchst (Aerospike, RethinkDB, Manticore), oder eine Docker-Umgebung für mehrere Projekte willst. Die Lernkurve ist steiler, aber die Flexibilität ist unerreicht.

Nutze ein eigenes Docker-Compose-Setup, wenn du sowohl aus Sail als auch aus Laradock herausgewachsen bist und volle Kontrolle willst. Das ist, was ich mache. Ich pflege mein eigenes compose.yaml mit exakt den Diensten, die ich brauche, ohne Abstraktionsschicht, und mit Docker-Compose-Aliases, damit die Befehle kurz bleiben. Es braucht am Anfang mehr Arbeit, aber es gibt keine Magie — alles ist explizit.

Nutze FrankenPHP + Octane, wenn du eine High-Performance-API baust oder deine Anwendung latenzsensibel ist. Der Performance-Unterschied ist nicht marginal — es ist eine Größenordnung. Einen Blick wert, selbst wenn du für die allgemeine Entwicklung ein anderes Werkzeug nutzt.

[deliberate] Die Details, die zählen.

Setup-Zeit.

Tool, Zeit bis zum ersten Request.

Herd; Unter 1 Minute.

Sail; 5-10 Minuten (Image-Pulls).

[matter-of-fact] Custom Compose; 30-60 Minuten (initiales Setup).

Laradock; 1-2 Stunden (vollständige Konfiguration).

Anpassbarkeit.

[deliberate] Sail ist absichtlich begrenzt. Du bekommst die Dienste, die Laravel braucht, und nicht viel mehr. Du kannst anpassen, indem du sail:publish ausführst und die Dockerfiles bearbeitest, aber an diesem Punkt pflegst du ein eigenes Docker-Setup mit Sails Abstraktionen obendrauf — das Schlechteste aus beiden Welten.

Laradock gibt dir alles, verlangt aber, dass du verstehst, was du aktivierst. Einen Dienst einzuschalten bedeutet,.env und möglicherweise docker-compose.yml zu bearbeiten, und manche Dienste haben eigene Konfigurationsverzeichnisse.

Custom Compose gibt dir genau das, was du schreibst. Nicht mehr, nicht weniger.

Produktionsreife.

Sail ist ausdrücklich nicht für Produktion gedacht. Laradock kann für Produktion konfiguriert werden, aber du musst wissen, was du bei Security Hardening, Resource Limits und sauberem Networking tust. FrankenPHP ist von Grund auf produktionsreif — dafür ist es gebaut.

[deliberate] Multi-Projekt-Unterstützung.

Sail: ein Projekt pro Umgebung. Du kannst mehrere Sail-Instanzen laufen lassen, aber sie werden sich um Ports streiten.

Laradock: für Multi-Projekt-Setups entworfen. Eine Umgebung, mehrere Projekte, geteilte Dienste.

Custom Compose: was immer du architektierst. Ich halte separate Compose-Dateien pro Projekt mit gemeinsamen Netzwerkdefinitionen.

Was ich tatsächlich nutze.

[reflective] Custom Docker Compose. Ich habe Aliases für alles — dcu für docker compose up -d, dce für exec, dcefpm für PHP-FPM-Shell-Zugriff und eine sail-Funktion, die automatisch den Projekt-Root findet. Das Setup steht in meinen Notizen zur Docker-Compose-Entwicklung.

Ich habe vor Jahren mit Laradock angefangen, bin zu Sail gewechselt, als es erschien, und bin irgendwann bei einem eigenen Setup gelandet, weil ich genau verstehen wollte, was läuft und warum. Jede Abstraktion versteckt Entscheidungen. Manchmal ist das in Ordnung. Manchmal verursachen diese versteckten Entscheidungen Probleme, die schwer zu debuggen sind, weil du sie nicht sehen kannst.

Wenn ich heute allerdings ein neues Laravel-Projekt mit einem Team starten würde, dem Docker-Interna egal sind, würde ich Sail nehmen. Und wenn ich jemanden neu in Laravel begleiten würde, würde ich sagen: Installier Herd und fang sofort an, Code zu schreiben.

Andere Optionen, die erwähnenswert sind.

[matter-of-fact] DDEV — Docker-basiert, gute Laravel-Unterstützung, aktive Roadmap für 2026 mit geplanter Gitpod-Integration. Einen Blick wert, wenn du es für andere CMS-Projekte nutzt (WordPress, Drupal).

Lando — eine weitere Docker-Abstraktionsschicht mit Laravel-Plugin (v1.10.0, Januar 2026). Ähnliche Philosophie wie Sail, aber framework-agnostisch.

Valet — der Vorgänger von Herd. Funktioniert immer noch, aber Herd hat es für die meisten Anwendungsfälle abgelöst.
