---
title: "PHP 8.3.6 + IMAP on macOS using phpenv: Install Guide"
date: "2024-09-01"
slug: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
author: "Boris Teoharov"
description: "Install PHP 8.3 with IMAP on macOS using phpenv. Covers brew deps, PHP_BUILD_CONFIGURE_OPTS, and troubleshooting. Updated: ext-imap is deprecated in PHP 8.4+ -- modern alternatives included."
tags: ["PHP", "macOS", "IMAP", "phpenv", "Development Environment", "PECL", "Deprecated"]
featuredImage: "./images/featured.jpg"
imageCaption: "A phone on white marble. A pale cyan notification halo, a folded letter, a fountain pen."
---

> **Important (2024-11 update):** PHP 8.4 **unbundled ext-imap** from core. The extension moved to PECL and is effectively deprecated -- the underlying C library (libc-client) hasn't been updated since 2018. If you're starting a new project or on PHP 8.4+, skip to [Do You Actually Need ext-imap?](#do-you-actually-need-ext-imap) for modern alternatives. If you're on PHP 8.3 or earlier and need the native extension, this guide still works.

## The Quick Fix

If you just want the commands and don't care about the why -- here's everything in order. You need Homebrew and phpenv already installed.

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

If `imap` shows up in the output, you're done. If not, read on.

## Do You Actually Need ext-imap?

Serious question. Before fighting with C libraries and compiler flags, consider whether you actually need the native IMAP extension.

**PHP 8.4 removed ext-imap from core.** It moved to PECL, and the underlying C library (`libc-client` / UW-IMAP) hasn't seen an update since 2018. It has thread-safety issues, missing XAUTH support, and POP bugs. It's not coming back.

The modern alternative is [**Webklex/php-imap**](https://github.com/Webklex/php-imap) -- a pure PHP IMAP implementation:

```bash
composer require webklex/php-imap
```

That's it. No brew dependencies, no compiler flags, no header file hunts. It works on PHP 8.0.2+ (including 8.4 and 8.5), supports IMAP IDLE and OAuth, and has over 5 million installs on Packagist. There's also a [Laravel integration](https://github.com/Webklex/laravel-imap) if that's your stack.

**Use ext-imap only if** you're maintaining a legacy codebase on PHP 8.3 or earlier that already depends on `imap_*` functions and you can't migrate yet.

## What Each Step Does

If the quick fix worked, you can stop reading. If it didn't -- or if you want to understand what's happening -- here's the breakdown.

### The Brew Dependencies

```bash
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline \
  gettext libiconv libsodium krb5 imap-uw curl
```

macOS ships with some of these, but phpenv needs the Homebrew versions with proper headers and pkg-config files. The critical one is `imap-uw` -- that's the UW-IMAP library that provides `libc-client`.

### PHP_BUILD_CONFIGURE_OPTS

phpenv uses php-build under the hood, which runs `./configure` on the PHP source. The `PHP_BUILD_CONFIGURE_OPTS` variable passes flags directly to configure. Each `--with-*` flag tells PHP where to find a specific library.

The most important ones for IMAP:

- `--with-imap=$(brew --prefix imap-uw)` -- points to the IMAP library
- `--with-imap-ssl=$(brew --prefix openssl@3)` -- enables IMAP over SSL
- `--with-kerberos=$(brew --prefix krb5)` -- required for IMAP authentication

### The CPPFLAGS Fix

```bash
export CPPFLAGS="-I$(brew --prefix openssl@3)/include -I$(brew --prefix imap-uw)/include $CPPFLAGS"
```

Even with the configure flags, the C preprocessor sometimes can't find header files. This happens because macOS doesn't put Homebrew headers in the default search path. The two headers that fail most often:

- `openssl/ssl.h` -- from OpenSSL
- `imap/imap.h` -- from imap-uw

### The PATH Fix

If `php -v` shows the wrong version after installing, phpenv's shims aren't in your PATH (or something else is shadowing them). Add this to `~/.zshrc`:

```bash
export PHPENV_ROOT="$HOME/.phpenv"
if [ -d "${PHPENV_ROOT}" ]; then
  export PATH="${PHPENV_ROOT}/shims:${PHPENV_ROOT}/bin:$PATH"
  eval "$(phpenv init -)"
fi
```

Then `source ~/.zshrc` and try again.

### The utf8_mime2text Error

If you see this:

```
configure: error: utf8_mime2text() has new signature, but U8T_CANONICAL is missing.
This should not happen.
```

Your `imap-uw` library is out of date or broken. Fix it with:

```bash
brew upgrade imap-uw
```

Then re-run the install.

## The Future of PHP + IMAP

The writing is on the wall. ext-imap is deprecated, the underlying C library is abandoned, and PHP 8.4 already removed it from core. If you're reading this because you need IMAP in a PHP project, start planning your migration to `webklex/php-imap`. The native extension is on borrowed time.

For those of us maintaining legacy codebases -- this guide will keep working for PHP 8.3 and earlier. But don't start new projects on ext-imap. There's no reason to fight with C library compilation when a pure PHP solution exists.

---

### References

1. [PHP 8.4: IMAP Extension Unbundled](https://php.watch/versions/8.4/imap-unbundled) -- *PHP.Watch documentation on the ext-imap removal.*
2. [Webklex/php-imap on GitHub](https://github.com/Webklex/php-imap) -- *Pure PHP IMAP implementation (5M+ Packagist installs).*
3. [PHP Manual: IMAP Extension](https://www.php.net/manual/en/book.imap.php) -- *Official documentation with deprecation notices.*
4. [shivammathur/extensions: IMAP for PHP 8.3+](https://github.com/shivammathur/homebrew-extensions) -- *Homebrew tap for PHP extensions including IMAP.*

---

### Related Posts

- [PHP 8.5: A Tour of the Incoming Features](/php-8-5-new-features-pipe-operator-guide/) -- what's coming next in PHP.
- [Dev Guide: Shopware 6.5/6.6 Class & Namespace Updates](/understanding-class-namespace-changes-shopware-6-5-developers-guide/) -- another PHP migration guide for Shopware developers.
- [Laravel Sail vs Laradock](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- choosing the right Docker setup for PHP development.
