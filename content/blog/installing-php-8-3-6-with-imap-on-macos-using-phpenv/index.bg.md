---
lang: "bg"
translationOf: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "4c02d668769b502f"
title: "PHP 8.3.6 + IMAP на macOS с phpenv: ръководство за инсталация"
date: "2024-09-01"
description: "Инсталирай PHP 8.3 с IMAP на macOS чрез phpenv. Покрива brew dependencies, PHP_BUILD_CONFIGURE_OPTS и troubleshooting. Обновено: ext-imap е deprecated в PHP 8.4+ -- включени са модерни алтернативи."
featuredImage: "./images/featured.jpg"
imageCaption: "Телефон върху бял мрамор. Бледо цианов notification ореол, сгънато писмо, писалка."
audioUrl: "/audio/articles/installing-php-8-3-6-with-imap-on-macos-using-phpenv/bg/5egO01tkUjEzu7xSSE8M-51eb7341c6a0.m4a"
audioDuration: "5:57"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/installing-php-8-3-6-with-imap-on-macos-using-phpenv.bg.md"
---

> **Важно (обновление от 2024-11):** PHP 8.4 **извади ext-imap** от core-а. Extension-ът се премести в PECL и на практика е deprecated -- underlying C library-то (`libc-client`) не е обновявано от 2018 насам. Ако започваш нов проект или си на PHP 8.4+, прескочи до [Наистина ли ти трябва ext-imap?](#наистина-ли-ти-трябва-ext-imap) за модерни алтернативи. Ако си на PHP 8.3 или по-ранна версия и ти трябва native extension-ът, това ръководство още работи.

## Бързата поправка

Ако просто искаш командите и не те интересува защо -- ето всичко подред. Трябва вече да имаш инсталирани Homebrew и phpenv.

```bash
# 1. Install all required libraries
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline \
  gettext libiconv libsodium krb5 imap-uw curl

# 2. Set build configuration (add to ~/.zshrc or run before install)
export PHP_BUILD_CONFIGURE_OPTS="--with-openssl=$(brew --prefix openssl@3) \
  --with-zlib=$(brew --prefix zlib) \
  --with-bz2=$(brew --prefix bzip2) \
  --with-curl \
  --with-libedit \
  --with-readline=$(brew --prefix readline) \
  --with-gettext=$(brew --prefix gettext) \
  --with-iconv=$(brew --prefix libiconv) \
  --with-sodium=$(brew --prefix libsodium) \
  --with-kerberos=$(brew --prefix krb5) \
  --with-imap=$(brew --prefix imap-uw) \
  --with-imap-ssl=$(brew --prefix openssl@3) \
  --with-tidy=$(brew --prefix tidy-html5) \
  --enable-mbstring \
  --enable-intl"

# 3. Help the compiler find headers
export CPPFLAGS="-I$(brew --prefix openssl@3)/include -I$(brew --prefix imap-uw)/include $CPPFLAGS"

# 4. Build and install
phpenv install 8.3.6
phpenv global 8.3.6

# 5. Verify
php -v
php -m | grep imap
```

Ако `imap` се появи в output-а, готов си. Ако не -- чети нататък.

## Наистина ли ти трябва ext-imap?

Сериозен въпрос. Преди да се бориш с C libraries и compiler flags, помисли дали наистина ти трябва native IMAP extension-ът.

**PHP 8.4 махна ext-imap от core-а.** Той се премести в PECL, а underlying C library-то (`libc-client` / UW-IMAP) не е получавало update от 2018. Има thread-safety проблеми, липсващ XAUTH support и POP bugs. Няма да се върне.

Модерната алтернатива е [**Webklex/php-imap**](https://github.com/Webklex/php-imap) -- pure PHP IMAP implementation:

```bash
composer require webklex/php-imap
```

Това е. Няма brew dependencies, няма compiler flags, няма ловене на header файлове. Работи на PHP 8.0.2+ (включително 8.4 и 8.5), поддържа IMAP IDLE и OAuth, и има над 5 милиона инсталации в Packagist. Има и [Laravel integration](https://github.com/Webklex/laravel-imap), ако това е твоят stack.

**Използвай ext-imap само ако** поддържаш legacy codebase на PHP 8.3 или по-ранна версия, който вече зависи от `imap_*` функции, и още не можеш да мигрираш.

## Какво прави всяка стъпка

Ако бързата поправка сработи, можеш да спреш да четеш. Ако не сработи -- или ако искаш да разбереш какво се случва -- ето разбивката.

### Brew dependencies

```bash
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline \
  gettext libiconv libsodium krb5 imap-uw curl
```

macOS идва с част от тези библиотеки, но phpenv има нужда от Homebrew версиите с правилните headers и pkg-config файлове. Критичната е `imap-uw` -- това е UW-IMAP library-то, което предоставя `libc-client`.

### PHP_BUILD_CONFIGURE_OPTS

phpenv използва php-build отдолу, който пуска `./configure` върху PHP source-а. Променливата `PHP_BUILD_CONFIGURE_OPTS` подава flags директно към configure. Всеки `--with-*` flag казва на PHP къде да намери конкретна library.

Най-важните за IMAP:

- `--with-imap=$(brew --prefix imap-uw)` -- сочи към IMAP library-то
- `--with-imap-ssl=$(brew --prefix openssl@3)` -- включва IMAP over SSL
- `--with-kerberos=$(brew --prefix krb5)` -- изисква се за IMAP authentication

### CPPFLAGS поправката

```bash
export CPPFLAGS="-I$(brew --prefix openssl@3)/include -I$(brew --prefix imap-uw)/include $CPPFLAGS"
```

Дори с configure flags, C preprocessor-ът понякога не може да намери header файловете. Това се случва, защото macOS не поставя Homebrew headers в default search path-а. Двата header-а, които най-често се провалят:

- `openssl/ssl.h` -- от OpenSSL
- `imap/imap.h` -- от imap-uw

### PATH поправката

Ако `php -v` показва грешната версия след инсталацията, phpenv shims не са в твоя PATH (или нещо друго ги shadow-ва). Добави това в `~/.zshrc`:

```bash
export PHPENV_ROOT="$HOME/.phpenv"
if [ -d "${PHPENV_ROOT}" ]; then
  export PATH="${PHPENV_ROOT}/shims:${PHPENV_ROOT}/bin:$PATH"
  eval "$(phpenv init -)"
fi
```

После пусни `source ~/.zshrc` и пробвай отново.

### Грешката utf8_mime2text

Ако видиш това:

```
configure: error: utf8_mime2text() has new signature, but U8T_CANONICAL is missing.
This should not happen.
```

Твоята `imap-uw` library е остаряла или счупена. Оправи я с:

```bash
brew upgrade imap-uw
```

После пусни инсталацията пак.

## Бъдещето на PHP + IMAP

Писаното е на стената. ext-imap е deprecated, underlying C library-то е abandon-нато, а PHP 8.4 вече го извади от core-а. Ако четеш това, защото ти трябва IMAP в PHP проект, започни да планираш миграцията си към `webklex/php-imap`. Native extension-ът живее на заемно време.

За тези от нас, които поддържат legacy codebases -- това ръководство ще продължи да работи за PHP 8.3 и по-ранни версии. Но не започвай нови проекти върху ext-imap. Няма причина да се бориш с компилация на C library, когато съществува pure PHP решение.

---

### Източници

1. [PHP 8.4: IMAP Extension Unbundled](https://php.watch/versions/8.4/imap-unbundled) -- *PHP.Watch документация за премахването на ext-imap.*
2. [Webklex/php-imap в GitHub](https://github.com/Webklex/php-imap) -- *Pure PHP IMAP implementation (5M+ Packagist installs).*
3. [PHP Manual: IMAP Extension](https://www.php.net/manual/en/book.imap.php) -- *Официална документация с deprecation notices.*
4. [shivammathur/extensions: IMAP for PHP 8.3+](https://github.com/shivammathur/homebrew-extensions) -- *Homebrew tap за PHP extensions, включително IMAP.*

---

### Още по темата

- [PHP 8.5: обиколка на идващите функции](/php-8-5-new-features-pipe-operator-guide/) -- какво предстои в PHP.
- [Dev Guide: Shopware 6.5/6.6 class и namespace updates](/understanding-class-namespace-changes-shopware-6-5-developers-guide/) -- още едно PHP migration guide за Shopware developers.
- [Laravel Sail vs Laradock](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- избор на правилния Docker setup за PHP development.
