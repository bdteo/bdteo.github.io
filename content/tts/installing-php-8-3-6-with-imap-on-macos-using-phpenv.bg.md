[conversational tone] Инсталирай PHP 8.3 с IMAP на macOS чрез phpenv. Покрива brew dependencies, PHP_BUILD_CONFIGURE_OPTS и troubleshooting. Обновено: ext-imap е deprecated в PHP 8.4+ -- включени са модерни алтернативи.

Важно (обновление от 2024-11): PHP 8.4 извади ext-imap от core-а. Extension-ът се премести в PECL и на практика е deprecated -- underlying C library-то (libc-client) не е обновявано от 2018 насам. Ако започваш нов проект или си на PHP 8.4+, прескочи до Наистина ли ти трябва ext-imap? за модерни алтернативи. Ако си на PHP 8.3 или по-ранна версия и ти трябва native extension-ът, това ръководство още работи.

[matter-of-fact] Бързата поправка

[matter-of-fact] Ако просто искаш командите и не те интересува защо -- ето всичко подред. Трябва вече да имаш инсталирани Homebrew и phpenv.

Ако imap се появи в output-а, готов си. Ако не -- чети нататък.

[deliberate] Наистина ли ти трябва ext-imap?

Сериозен въпрос. Преди да се бориш с C libraries и compiler flags, помисли дали наистина ти трябва native IMAP extension-ът.

PHP 8.4 махна ext-imap от core-а. Той се премести в PECL, а underlying C library-то (libc-client / UW-IMAP) не е получавало update от 2018. Има thread-safety проблеми, липсващ XAUTH support и POP bugs. Няма да се върне.

Модерната алтернатива е Webklex/php-imap -- pure PHP IMAP implementation:

Това е. Няма brew dependencies, няма compiler flags, няма ловене на header файлове. Работи на PHP 8.0.2+ (включително 8.4 и 8.5), поддържа IMAP IDLE и OAuth, и има над 5 милиона инсталации в Packagist. Има и Laravel integration, ако това е твоят stack.

[reflective] Използвай ext-imap само ако поддържаш legacy codebase на PHP 8.3 или по-ранна версия, който вече зависи от imap_ функции, и още не можеш да мигрираш.

[calm] Какво прави всяка стъпка

Ако бързата поправка сработи, можеш да спреш да четеш. Ако не сработи -- или ако искаш да разбереш какво се случва -- ето разбивката.

[reflective] Brew dependencies

macOS идва с част от тези библиотеки, но phpenv има нужда от Homebrew версиите с правилните headers и pkg-config файлове. Критичната е imap-uw -- това е UW-IMAP library-то, което предоставя libc-client.

[matter-of-fact] PHP_BUILD_CONFIGURE_OPTS

phpenv използва php-build отдолу, който пуска./configure върху PHP source-а. Променливата PHP_BUILD_CONFIGURE_OPTS подава flags директно към configure. Всеки --with- flag казва на PHP къде да намери конкретна library.

[calm] Най-важните за IMAP:

--with-imap=$(brew --prefix imap-uw) -- сочи към IMAP library-то --with-imap-ssl=$(brew --prefix openssl@3) -- включва IMAP over SSL --with-kerberos=$(brew --prefix krb5) -- изисква се за IMAP authentication

[deliberate] CPPFLAGS поправката

Дори с configure flags, C preprocessor-ът понякога не може да намери header файловете. Това се случва, защото macOS не поставя Homebrew headers в default search path-а. Двата header-а, които най-често се провалят:

openssl/ssl.h -- от OpenSSL imap/imap.h -- от imap-uw

[calm] PATH поправката

Ако php -v показва грешната версия след инсталацията, phpenv shims не са в твоя PATH (или нещо друго ги shadow-ва). Добави това в ~/.zshrc:

[deliberate] После пусни source ~/.zshrc и пробвай отново.

[reflective] Грешката utf8_mime2text

Ако видиш това:

Твоята imap-uw library е остаряла или счупена. Оправи я с:

После пусни инсталацията пак.

[matter-of-fact] Бъдещето на PHP + IMAP

Писаното е на стената. ext-imap е deprecated, underlying C library-то е abandon-нато, а PHP 8.4 вече го извади от core-а. Ако четеш това, защото ти трябва IMAP в PHP проект, започни да планираш миграцията си към webklex/php-imap. Native extension-ът живее на заемно време.

[matter-of-fact] За тези от нас, които поддържат legacy codebases -- това ръководство ще продължи да работи за PHP 8.3 и по-ранни версии. Но не започвай нови проекти върху ext-imap. Няма причина да се бориш с компилация на C library, когато съществува pure PHP решение.
