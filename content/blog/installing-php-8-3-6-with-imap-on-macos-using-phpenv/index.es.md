---
lang: "es"
translationOf: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "4c02d668769b502f"
title: "PHP 8.3.6 + IMAP en macOS con phpenv: guía de instalación"
date: "2024-09-01"
slug: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
author: "Boris Teoharov"
description: "Instala PHP 8.3 con IMAP en macOS usando phpenv. Cubre dependencias de brew, PHP_BUILD_CONFIGURE_OPTS y resolución de problemas. Actualización: ext-imap está obsoleta en PHP 8.4+ -- se incluyen alternativas modernas."
tags: ["PHP", "macOS", "IMAP", "phpenv", "Entorno de desarrollo", "PECL", "Obsoleto"]
featuredImage: "./images/featured.jpg"
imageCaption: "Un teléfono sobre mármol blanco. Un halo de notificación cian pálido, una carta plegada, una pluma estilográfica."
audioUrl: "/audio/articles/installing-php-8-3-6-with-imap-on-macos-using-phpenv/es/Qh9qDWKx9XUbnKbERblA-6e32701be91e.m4a"
audioDuration: "5:38"
audioVoice: "Gerard (ElevenLabs LatAm Spanish neutral)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/installing-php-8-3-6-with-imap-on-macos-using-phpenv.es.md"
---

> **Importante (actualización 2024-11):** PHP 8.4 **separó ext-imap** del núcleo. La extensión pasó a PECL y está prácticamente obsoleta -- la biblioteca de C subyacente (libc-client) no se actualiza desde 2018. Si estás empezando un proyecto nuevo o usas PHP 8.4+, salta a [¿Realmente necesitas ext-imap?](#do-you-actually-need-ext-imap) para ver alternativas modernas. Si usas PHP 8.3 o anterior y necesitas la extensión nativa, esta guía sigue funcionando.

## La solución rápida

Si solo quieres los comandos y el porqué te da igual -- aquí está todo en orden. Necesitas tener Homebrew y phpenv ya instalados.

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

Si `imap` aparece en la salida, ya está. Si no, sigue leyendo.

## ¿Realmente necesitas ext-imap?

Va en serio. Antes de pelearte con bibliotecas de C y banderas del compilador, plantéate si de verdad necesitas la extensión nativa de IMAP.

**PHP 8.4 eliminó ext-imap del núcleo.** Pasó a PECL, y la biblioteca de C subyacente (`libc-client` / UW-IMAP) no recibe una actualización desde 2018. Tiene problemas de seguridad en hilos, le falta soporte para XAUTH y tiene errores con POP. No va a volver.

La alternativa moderna es [**Webklex/php-imap**](https://github.com/Webklex/php-imap) -- una implementación de IMAP en PHP puro:

```bash
composer require webklex/php-imap
```

Eso es todo. Sin dependencias de brew, sin banderas del compilador, sin búsquedas de archivos de cabecera. Funciona en PHP 8.0.2+ (incluidos 8.4 y 8.5), admite IMAP IDLE y OAuth, y tiene más de 5 millones de instalaciones en Packagist. También hay una [integración con Laravel](https://github.com/Webklex/laravel-imap) si ese es tu stack.

**Usa ext-imap solo si** mantienes un código heredado en PHP 8.3 o anterior que ya depende de las funciones `imap_*` y todavía no puedes migrar.

## Qué hace cada paso

Si la solución rápida funcionó, puedes dejar de leer. Si no -- o si quieres entender qué está pasando -- aquí tienes el desglose.

### Las dependencias de brew

```bash
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline \
  gettext libiconv libsodium krb5 imap-uw curl
```

macOS incluye algunas de estas, pero phpenv necesita las versiones de Homebrew con las cabeceras y los archivos de pkg-config adecuados. La crítica es `imap-uw` -- esa es la biblioteca UW-IMAP que proporciona `libc-client`.

### PHP_BUILD_CONFIGURE_OPTS

phpenv usa php-build por debajo, que ejecuta `./configure` sobre el código fuente de PHP. La variable `PHP_BUILD_CONFIGURE_OPTS` pasa las banderas directamente a configure. Cada bandera `--with-*` le indica a PHP dónde encontrar una biblioteca concreta.

Las más importantes para IMAP:

- `--with-imap=$(brew --prefix imap-uw)` -- apunta a la biblioteca de IMAP
- `--with-imap-ssl=$(brew --prefix openssl@3)` -- habilita IMAP sobre SSL
- `--with-kerberos=$(brew --prefix krb5)` -- necesaria para la autenticación de IMAP

### El arreglo de CPPFLAGS

```bash
export CPPFLAGS="-I$(brew --prefix openssl@3)/include -I$(brew --prefix imap-uw)/include $CPPFLAGS"
```

Incluso con las banderas de configure, a veces el preprocesador de C no encuentra los archivos de cabecera. Esto pasa porque macOS no coloca las cabeceras de Homebrew en la ruta de búsqueda por defecto. Las dos cabeceras que fallan con más frecuencia:

- `openssl/ssl.h` -- de OpenSSL
- `imap/imap.h` -- de imap-uw

### El arreglo de PATH

Si `php -v` muestra la versión equivocada después de instalar, los shims de phpenv no están en tu PATH (o algo más los está tapando). Añade esto a `~/.zshrc`:

```bash
export PHPENV_ROOT="$HOME/.phpenv"
if [ -d "${PHPENV_ROOT}" ]; then
  export PATH="${PHPENV_ROOT}/shims:${PHPENV_ROOT}/bin:$PATH"
  eval "$(phpenv init -)"
fi
```

Luego ejecuta `source ~/.zshrc` e inténtalo de nuevo.

### El error utf8_mime2text

Si ves esto:

```
configure: error: utf8_mime2text() has new signature, but U8T_CANONICAL is missing.
This should not happen.
```

Tu biblioteca `imap-uw` está desactualizada o estropeada. Arréglalo con:

```bash
brew upgrade imap-uw
```

Luego vuelve a ejecutar la instalación.

## El futuro de PHP + IMAP

El final está cantado. ext-imap está obsoleta, la biblioteca de C subyacente está abandonada y PHP 8.4 ya la quitó del núcleo. Si estás leyendo esto porque necesitas IMAP en un proyecto de PHP, empieza a planear tu migración a `webklex/php-imap`. La extensión nativa tiene los días contados.

Para quienes mantenemos código heredado -- esta guía seguirá funcionando para PHP 8.3 y anteriores. Pero no empieces proyectos nuevos sobre ext-imap. No hay razón para pelearse con la compilación de bibliotecas de C cuando existe una solución en PHP puro.

---

### Referencias

1. [PHP 8.4: IMAP Extension Unbundled](https://php.watch/versions/8.4/imap-unbundled) -- *Documentación de PHP.Watch sobre la eliminación de ext-imap.*
2. [Webklex/php-imap en GitHub](https://github.com/Webklex/php-imap) -- *Implementación de IMAP en PHP puro (más de 5 millones de instalaciones en Packagist).*
3. [Manual de PHP: extensión IMAP](https://www.php.net/manual/en/book.imap.php) -- *Documentación oficial con avisos de obsolescencia.*
4. [shivammathur/extensions: IMAP para PHP 8.3+](https://github.com/shivammathur/homebrew-extensions) -- *Tap de Homebrew para extensiones de PHP, incluida IMAP.*

---

### Publicaciones relacionadas

- [PHP 8.5: un recorrido por las funciones que llegan](/php-8-5-new-features-pipe-operator-guide/) -- lo que viene a continuación en PHP.
- [Guía para desarrolladores: cambios de clases y namespaces en Shopware 6.5/6.6](/understanding-class-namespace-changes-shopware-6-5-developers-guide/) -- otra guía de migración de PHP para desarrolladores de Shopware.
- [Laravel Sail vs Laradock](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- cómo elegir la configuración de Docker adecuada para el desarrollo en PHP.
