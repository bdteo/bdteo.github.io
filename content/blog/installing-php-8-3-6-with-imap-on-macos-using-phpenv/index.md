---
title: "PHP 8.3.6 + IMAP on macOS using phpenv: Install Guide"
date: "2024-09-01"
slug: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
author: "Boris Teoharov"
description: "Install PHP 8.3.6 with IMAP on macOS using phpenv. Guide covers brew deps, PHP_BUILD_CONFIGURE_OPTS, PATH fixes, and troubleshooting common build errors."
tags: ["PHP", "macOS", "IMAP", "phpenv", "Development Environment"]
featuredImage: "./images/featured.jpg"
imageCaption: "A developer's workspace showcasing PHP development on macOS"
---

# Installing PHP 8.3.6 with IMAP on macOS: A Real Developer's Journey

Hey there, fellow coders! I recently went through the somewhat painful process of getting PHP 8.3.6 up and running on my Mac, complete with IMAP support. I thought I'd share my experience in case any of you find yourselves in the same boat. Fair warning: it wasn't exactly a walk in the park, but we'll get through this together.

## What I Was Trying to Do

I needed to set up PHP 8.3.6 with IMAP support on my Mac. I decided to use phpenv because, well, juggling multiple PHP versions is just part of the job these days, right? 

## Starting Point

I already had phpenv installed on my Mac. If you don't, you might want to look that up first. Also, make sure you've got Homebrew - it's going to be your best friend for this process.

## The Command That Started It All

I began with what I thought would be a simple command:

```bash
phpenv install 8.3.6
```

Oh, how naive I was...

## The Problems I Ran Into (and How I Fixed Them)

### 1. Missing Libraries

First up, my system complained about missing libraries. The error looked something like this:

```
configure: error: Cannot find libtidy
```

The fix? Brew to the rescue:

```bash
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline gettext libiconv libsodium krb5 imap-uw curl
```

Yeah, that's a lot of stuff. But trust me, you'll need it all.

### 2. Configuration Warnings

Next, I got some warnings about configuration options:

```
configure: WARNING: unrecognized options: --disable-libxml
configure: WARNING: libedit directory ignored, rely on pkg-config
```

These weren't show-stoppers, but they bugged me. I ended up tweaking my build options (more on that later).

### 3. PHP Version Chaos

Even after I thought I'd installed 8.3.6, my system was stuck on an older version:

```
php -v
PHP 8.1.28 (cli) (built: Aug  9 2024 22:32:28) (NTS)
```

Turns out, my PATH was all messed up. Had to do some .zshrc magic to fix it.

### 4. Missing Headers

Then came the header file errors:

```
fatal error: 'openssl/ssl.h' file not found
fatal error: 'imap/imap.h' file not found
```

More path issues. The compiler couldn't find the files it needed.

### 5. IMAP Weirdness

The cherry on top was this beauty:

```
configure: error: utf8_mime2text() has new signature, but U8T_CANONICAL is missing. This should not happen.
```

Apparently, my IMAP library was having an identity crisis.

## How I Fixed Everything

### 1. The Great Library Install

First things first, I made sure I had all the libraries I needed:

```bash
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline gettext libiconv libsodium krb5 imap-uw curl
```

### 2. Configuration Tweaks

I added this to my .zshrc file to tell PHP where to find everything:

```bash
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
```

### 3. PATH Fix

To make sure phpenv was in charge, I updated my .zshrc:

```bash
export PHPENV_ROOT="$HOME/.phpenv"
if [ -d "${PHPENV_ROOT}" ]; then
  export PATH="${PHPENV_ROOT}/shims:${PHPENV_ROOT}/bin:$PATH"
  eval "$(phpenv init -)"
fi

# At the end of the file
if command -v phpenv >/dev/null 2>&1; then
  export PATH="$HOME/.phpenv/versions/$(phpenv version-name)/bin:$PATH"
fi
```

### 4. Header File Hunt

To help the compiler find those pesky header files:

```bash
export CPPFLAGS="-I$(brew --prefix openssl@3)/include -I$(brew --prefix imap-uw)/include $CPPFLAGS"
```

### 5. IMAP Update

Finally, I made sure my IMAP library was up to date:

```bash
brew upgrade imap-uw
```

## The Moment of Truth

After all that, I crossed my fingers and ran:

```bash
source ~/.zshrc
phpenv install 8.3.6
phpenv global 8.3.6
php -v
```

And... it worked! To make sure IMAP was there:

```bash
php -m | grep imap
```

Saw 'imap' in the output, and I nearly cried tears of joy.

## Wrapping Up

So there you have it. It was a bit of a wild ride, but we got there in the end. If you're trying this yourself, remember that your mileage may vary. Don't be afraid to dig into error messages and don't hesitate to ask for help if you get stuck.

Oh, and once you've got it all set up, don't forget to keep your PHP updated. Security and all that jazz.

Happy coding, folks! May your installations be less painful than mine.
