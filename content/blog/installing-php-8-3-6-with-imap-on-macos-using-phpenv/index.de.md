---
lang: "de"
translationOf: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "4c02d668769b502f"
title: "PHP 8.3.6 + IMAP auf macOS mit phpenv: Installationsanleitung"
date: "2024-09-01"
description: "PHP 8.3 mit IMAP auf macOS mit phpenv installieren. Behandelt brew-Abhängigkeiten, PHP_BUILD_CONFIGURE_OPTS und Troubleshooting. Aktualisiert: ext-imap ist in PHP 8.4+ deprecated -- moderne Alternativen inklusive."
featuredImage: "./images/featured.jpg"
imageCaption: "Ein Telefon auf weißem Marmor. Ein blass-türkiser Benachrichtigungshalo, ein gefalteter Brief, ein Füllfederhalter."
audioUrl: "/audio/articles/installing-php-8-3-6-with-imap-on-macos-using-phpenv/de/LTo9oDjTW1FdEgMfiXWQ-bc9733dcb35c.m4a"
audioDuration: "7:14"
audioVoice: "David (ElevenLabs German slow and charming)"
audioGeneratedAt: "2026-07-19"
audioTextSource: "content/tts/installing-php-8-3-6-with-imap-on-macos-using-phpenv.de.md"
---

> **Wichtig (Update 2024-11):** PHP 8.4 hat **ext-imap aus dem Core ausgelagert**. Die Extension ist zu PECL gewandert und praktisch deprecated -- die zugrunde liegende C-Bibliothek (libc-client) wurde seit 2018 nicht mehr aktualisiert. Wenn du ein neues Projekt startest oder auf PHP 8.4+ bist, spring zu [Brauchst du ext-imap wirklich?](#brauchst-du-ext-imap-wirklich) für moderne Alternativen. Wenn du auf PHP 8.3 oder älter bist und die native Extension brauchst, funktioniert diese Anleitung weiterhin.

## Der Quick Fix

Wenn du nur die Befehle willst und dir das Warum egal ist -- hier ist alles in der richtigen Reihenfolge. Homebrew und phpenv müssen bereits installiert sein.

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

Wenn `imap` in der Ausgabe auftaucht, bist du fertig. Wenn nicht, lies weiter.

## Brauchst du ext-imap wirklich?

Ernst gemeinte Frage. Bevor du dich mit C-Bibliotheken und Compiler-Flags herumschlagst, überleg kurz, ob du die native IMAP-Extension wirklich brauchst.

**PHP 8.4 hat ext-imap aus dem Core entfernt.** Sie ist zu PECL gewandert, und die zugrunde liegende C-Bibliothek (`libc-client` / UW-IMAP) hat seit 2018 kein Update gesehen. Sie hat Thread-Safety-Probleme, fehlenden XAUTH-Support und POP-Bugs. Sie kommt nicht zurück.

Die moderne Alternative ist [**Webklex/php-imap**](https://github.com/Webklex/php-imap) -- eine reine PHP-Implementierung von IMAP:

```bash
composer require webklex/php-imap
```

Das war's. Keine brew-Abhängigkeiten, keine Compiler-Flags, keine Jagd nach Header-Dateien. Es funktioniert mit PHP 8.0.2+ (einschließlich 8.4 und 8.5), unterstützt IMAP IDLE und OAuth und hat über 5 Millionen Installationen auf Packagist. Es gibt auch eine [Laravel-Integration](https://github.com/Webklex/laravel-imap), falls das dein Stack ist.

**Verwende ext-imap nur, wenn** du eine Legacy-Codebasis auf PHP 8.3 oder älter wartest, die bereits von `imap_*`-Funktionen abhängt, und du noch nicht migrieren kannst.

## Was jeder Schritt macht

Wenn der Quick Fix funktioniert hat, kannst du hier aufhören. Wenn nicht -- oder wenn du verstehen willst, was passiert -- hier ist die Aufschlüsselung.

### Die Brew-Abhängigkeiten

```bash
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline \
  gettext libiconv libsodium krb5 imap-uw curl
```

macOS bringt einige davon mit, aber phpenv braucht die Homebrew-Versionen mit ordentlichen Headern und pkg-config-Dateien. Entscheidend ist `imap-uw` -- das ist die UW-IMAP-Bibliothek, die `libc-client` bereitstellt.

### PHP_BUILD_CONFIGURE_OPTS

phpenv verwendet unter der Haube php-build, das `./configure` auf dem PHP-Quellcode ausführt. Die Variable `PHP_BUILD_CONFIGURE_OPTS` reicht Flags direkt an configure weiter. Jedes `--with-*`-Flag sagt PHP, wo es eine bestimmte Bibliothek findet.

Die wichtigsten für IMAP:

- `--with-imap=$(brew --prefix imap-uw)` -- zeigt auf die IMAP-Bibliothek
- `--with-imap-ssl=$(brew --prefix openssl@3)` -- aktiviert IMAP über SSL
- `--with-kerberos=$(brew --prefix krb5)` -- für IMAP-Authentifizierung erforderlich

### Der CPPFLAGS-Fix

```bash
export CPPFLAGS="-I$(brew --prefix openssl@3)/include -I$(brew --prefix imap-uw)/include $CPPFLAGS"
```

Selbst mit den configure-Flags findet der C-Präprozessor manchmal die Header-Dateien nicht. Das passiert, weil macOS Homebrew-Header nicht in den Standard-Suchpfad legt. Die zwei Header, die am häufigsten scheitern:

- `openssl/ssl.h` -- von OpenSSL
- `imap/imap.h` -- von imap-uw

### Der PATH-Fix

Wenn `php -v` nach der Installation die falsche Version zeigt, sind phpenvs Shims nicht in deinem PATH (oder etwas anderes überdeckt sie). Füg das zu `~/.zshrc` hinzu:

```bash
export PHPENV_ROOT="$HOME/.phpenv"
if [ -d "${PHPENV_ROOT}" ]; then
  export PATH="${PHPENV_ROOT}/shims:${PHPENV_ROOT}/bin:$PATH"
  eval "$(phpenv init -)"
fi
```

Dann `source ~/.zshrc` ausführen und es erneut versuchen.

### Der utf8_mime2text-Fehler

Wenn du das hier siehst:

```
configure: error: utf8_mime2text() has new signature, but U8T_CANONICAL is missing.
This should not happen.
```

Deine `imap-uw`-Bibliothek ist veraltet oder kaputt. Beheb es mit:

```bash
brew upgrade imap-uw
```

Danach die Installation erneut ausführen.

## Die Zukunft von PHP + IMAP

Die Zeichen stehen eindeutig. ext-imap ist deprecated, die zugrunde liegende C-Bibliothek ist verlassen, und PHP 8.4 hat sie bereits aus dem Core entfernt. Wenn du das liest, weil du IMAP in einem PHP-Projekt brauchst, fang an, deine Migration zu `webklex/php-imap` zu planen. Die native Extension lebt auf geborgter Zeit.

Für diejenigen unter uns, die Legacy-Codebasen warten -- diese Anleitung wird für PHP 8.3 und älter weiter funktionieren. Aber starte keine neuen Projekte mit ext-imap. Es gibt keinen Grund, mit der Kompilierung von C-Bibliotheken zu kämpfen, wenn eine reine PHP-Lösung existiert.

---

### Referenzen

1. [PHP 8.4: IMAP Extension Unbundled](https://php.watch/versions/8.4/imap-unbundled) -- *PHP.Watch-Dokumentation zur Entfernung von ext-imap.*
2. [Webklex/php-imap auf GitHub](https://github.com/Webklex/php-imap) -- *Reine PHP-IMAP-Implementierung (5M+ Packagist-Installationen).*
3. [PHP Manual: IMAP Extension](https://www.php.net/manual/en/book.imap.php) -- *Offizielle Dokumentation mit Deprecation-Hinweisen.*
4. [shivammathur/extensions: IMAP for PHP 8.3+](https://github.com/shivammathur/homebrew-extensions) -- *Homebrew-Tap für PHP-Extensions einschließlich IMAP.*

---

### Verwandte Beiträge

- [PHP 8.5: A Tour of the Incoming Features](/php-8-5-new-features-pipe-operator-guide/) -- was als Nächstes in PHP kommt.
- [Dev Guide: Shopware 6.5/6.6 Class & Namespace Updates](/understanding-class-namespace-changes-shopware-6-5-developers-guide/) -- ein weiterer PHP-Migrationsguide für Shopware-Entwickler.
- [Laravel Sail vs Laradock](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- das richtige Docker-Setup für PHP-Entwicklung wählen.
