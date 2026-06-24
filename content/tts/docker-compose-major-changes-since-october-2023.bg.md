[conversational tone] Docker Compose се промени драстично -- v1 е мъртъв, полето version го няма, watch mode е готов за продукционна употреба, а има и критичен CVE, за който трябва да знаеш. Обновено през март 2026.

TL;DR: Docker Compose v1 (docker-compose) беше напълно премахнат през април 2025. Полето version в твоя YAML е мъртво. Ключът x-develop вече е просто develop. Watch mode е готов за продукционна употреба с initial_sync. Има критичен path traversal CVE (CVE-2025-62725), ако използваш include с OCI artifacts -- обнови до v2.40.2+. И да, Compose скочи от v2 на v5. Подробностите са по-долу.

Първоначално публикувано през ноември 2024. Обновено през март 2026 с Compose v5, CVE-2025-62725, премахването на v1 и нови възможности в спецификацията.

[reflective] Ако използваш Docker Compose от известно време, вероятно си забелязал как неща се чупят или се променят под краката ти. Последните две години бяха най-агресивната еволюция, през която Compose някога е минавал -- и не всичко беше очевидно.

Използвам Compose всеки ден. Повечето ми development setups вървят върху него. Когато нещата се променят, забелязвам. Ето какво реално има значение.

[matter-of-fact] Какво се счупи

[deliberate] docker-compose е мъртъв

Не deprecated. Не в maintenance mode. Мъртъв. Самостоятелният docker-compose binary (Python-базираният v1) беше премахнат от GitHub Actions runners и официалните Docker images през април 2025. Ако твоите CI/CD pipelines все още сочат към docker-compose с тире, те вече са счупени или съвсем скоро ще бъдат.

Go-базираният docker compose (v2, сега v5) е реалната имплементация от 2022 насам. v1 CLI беше на животоподдържаща система заради съвместимост. Тази система беше изключена.

[calm] Полето version го няма

[calm] Спри да слагаш version: "3.8" най-горе в Compose файловете си. Не прави нищо. Игнорира се още от v2 и вече е официално deprecated. Модерните Compose файлове започват със services:.

Ако видиш version: в tutorial, този tutorial е остарял.

[reflective] Други deprecations

links -- използвай Docker networks. Links са legacy още от пускането на Compose v2. container_name -- остави Docker да управлява имената. Hardcoded имена чупят scaling-а и причиняват конфликти. Кратък volume syntax за complex mounts -- използвай long-form syntax с type, source, target.

[matter-of-fact] Какво е ново и реално полезно

[deliberate] Watch Mode (вече готов за продукционна употреба)

Това е най-голямото quality-of-life подобрение от години. Секцията develop (преди x-develop -- махни x- prefix-а, вече не е experimental) ти позволява да дефинираш file watch правила, които автоматично sync-ват или rebuild-ват при промяна на файлове:

[deliberate] Има три налични actions (от v2.32.0 насам): sync -- копира променените файлове в container-а без rebuild restart -- рестартира service-а, когато файловете се променят rebuild -- стартира пълен rebuild

Към септември 2025 има и initial_sync -- той sync-ва всички файлове веднага щом стартираш docker compose watch, така че не чакаш първата промяна да задейства synchronization. Това беше болезнена точка дълго време.

Край на ръчните rebuild-и по време на development. Това наистина промени workflow-а ми.

[calm] Include с OCI Artifacts

Директивата include вече може да дърпа Compose fragments от OCI registries:

Има и experimental поддръжка за Git repositories. Това е полезно за споделяне на общи service definitions между проекти -- database configs, monitoring stacks и т.н.

Но първо прочети security секцията по-долу. Има CVE.

[reflective] GPU Support

GPU passthrough стана по-чист. Вече има по-кратък gpus: syntax (v2.30.0+) заедно с verbose подхода през deploy.resources.reservations.devices. AMD GPU support беше официално интегриран през 2025 -- вече не е само NVIDIA.

[matter-of-fact] Models Element

Compose spec вече включва models element за дефиниране на AI/ML models като OCI artifacts. Можеш да пакетираш LLMs и inference runtimes директно в Compose setup-а си. Нишово, но интересно, ако правиш local AI work.

[deliberate] По-добри зависимости

Условията на depends_on станаха по-гъвкави:

Опциите restart: true и required: false са истински полезни за устойчиви local development setups.

[calm] Какво трябва да знаеш

[reflective] CVE-2025-62725: Include Path Traversal

Ако използваш директивата include с OCI artifacts, обнови до v2.40.2 или по-нова версия веднага. Path traversal vulnerability позволява на attacker да избяга от cache directory по време на artifact resolution. Дори невинно изглеждащо docker compose ps може да го trigger-не, ако твоят Compose file include-ва malicious OCI reference.

Docker patch-на това с validatePathInBase() check, но трябва да си на fixed version.

[matter-of-fact] Compose v5

Docker скочи от v2 на v5 (прескачайки 3 и 4, за да избегне объркване със старите file format versions). Функционално v5 е същият като късните v2 releases, но включва официален Go SDK за programmatic access -- което значи, че можеш да embed-неш Compose functionality директно в Go applications, без да shell-ваш към CLI.

Провери версията си:

[deliberate] Bake е default build tool

Docker Bake (през BuildKit) вече е default за docker compose build. Той се справя с multi-target builds, cross-platform compilation и advanced caching strategies по-добре от legacy builder-а. Ако още не си поглеждал docker-bake.hcl файлове, струва си да ги разбереш -- особено за сложни multi-service builds.

[calm] Healthcheck подобрения

Полето start_interval ти позволява да зададеш по-бърз check interval по време на startup grace period:

Това означава, че dependent services стартират по-бързо, без да компрометираш production health check intervals.

[reflective] Migration Checklist

Ако не си обновявал Compose setup-а си от известно време:

[deliberate] Премахни version: от всички Compose files. Замени docker-compose с docker compose във всички scripts и CI configs. Преименувай x-develop на develop в watch configurations. Обнови до v2.40.2+, ако използваш include (CVE-2025-62725). Замени links с Docker networks, ако някак все още ги използваш. Тествай CI-то си -- GitHub Actions обновиха runners до Compose v2.40.3 през февруари 2026.
