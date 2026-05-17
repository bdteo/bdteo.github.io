---
lang: "fr"
translationOf: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "4c02d668769b502f"
title: "PHP 8.3.6 + IMAP sur macOS avec phpenv : guide d'installation"
date: "2024-09-01"
description: "Installer PHP 8.3 avec IMAP sur macOS en utilisant phpenv. Couvre les dépendances brew, PHP_BUILD_CONFIGURE_OPTS et le dépannage. Mise à jour : ext-imap est déprécié dans PHP 8.4+ -- alternatives modernes incluses."
featuredImage: "./images/featured.jpg"
imageCaption: "Un téléphone sur du marbre blanc. Un halo de notification cyan pâle, une lettre pliée, un stylo-plume."
---

> **Important (mise à jour 2024-11) :** PHP 8.4 a **retiré ext-imap** du cœur. L'extension a été déplacée vers PECL et elle est, dans les faits, dépréciée -- la bibliothèque C sous-jacente (libc-client) n'a pas été mise à jour depuis 2018. Si vous démarrez un nouveau projet ou si vous êtes sur PHP 8.4+, allez directement à [Avez-vous vraiment besoin de ext-imap ?](#avez-vous-vraiment-besoin-de-ext-imap) pour des alternatives modernes. Si vous êtes sur PHP 8.3 ou une version antérieure et que vous avez besoin de l'extension native, ce guide fonctionne toujours.

## La correction rapide

Si vous voulez simplement les commandes, sans vous soucier du pourquoi -- voici tout, dans l'ordre. Vous devez déjà avoir installé Homebrew et phpenv.

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

Si `imap` apparaît dans la sortie, c'est terminé. Sinon, continuez.

## Avez-vous vraiment besoin de ext-imap ?

Question sérieuse. Avant de vous battre avec des bibliothèques C et des flags de compilation, demandez-vous si vous avez vraiment besoin de l'extension IMAP native.

**PHP 8.4 a retiré ext-imap du cœur.** Elle a été déplacée vers PECL, et la bibliothèque C sous-jacente (`libc-client` / UW-IMAP) n'a pas reçu de mise à jour depuis 2018. Elle a des problèmes de thread-safety, pas de support XAUTH, et des bugs POP. Elle ne reviendra pas.

L'alternative moderne est [**Webklex/php-imap**](https://github.com/Webklex/php-imap) -- une implémentation IMAP en pur PHP :

```bash
composer require webklex/php-imap
```

C'est tout. Pas de dépendances brew, pas de flags de compilation, pas de chasse aux fichiers d'en-tête. Elle fonctionne sur PHP 8.0.2+ (y compris 8.4 et 8.5), prend en charge IMAP IDLE et OAuth, et compte plus de 5 millions d'installations sur Packagist. Il existe aussi une [intégration Laravel](https://github.com/Webklex/laravel-imap) si c'est votre stack.

**N'utilisez ext-imap que si** vous maintenez une base de code legacy sur PHP 8.3 ou une version antérieure, qui dépend déjà des fonctions `imap_*`, et que vous ne pouvez pas encore migrer.

## Ce que fait chaque étape

Si la correction rapide a fonctionné, vous pouvez arrêter de lire. Si elle n'a pas fonctionné -- ou si vous voulez comprendre ce qui se passe -- voici le détail.

### Les dépendances Brew

```bash
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline \
  gettext libiconv libsodium krb5 imap-uw curl
```

macOS fournit certaines d'entre elles, mais phpenv a besoin des versions Homebrew, avec les bons headers et fichiers pkg-config. La dépendance critique est `imap-uw` -- c'est la bibliothèque UW-IMAP qui fournit `libc-client`.

### PHP_BUILD_CONFIGURE_OPTS

phpenv utilise php-build sous le capot, qui lance `./configure` sur les sources de PHP. La variable `PHP_BUILD_CONFIGURE_OPTS` passe des flags directement à configure. Chaque flag `--with-*` indique à PHP où trouver une bibliothèque précise.

Les plus importants pour IMAP :

- `--with-imap=$(brew --prefix imap-uw)` -- pointe vers la bibliothèque IMAP
- `--with-imap-ssl=$(brew --prefix openssl@3)` -- active IMAP via SSL
- `--with-kerberos=$(brew --prefix krb5)` -- requis pour l'authentification IMAP

### La correction CPPFLAGS

```bash
export CPPFLAGS="-I$(brew --prefix openssl@3)/include -I$(brew --prefix imap-uw)/include $CPPFLAGS"
```

Même avec les flags configure, le préprocesseur C n'arrive parfois pas à trouver les fichiers d'en-tête. Cela arrive parce que macOS ne met pas les headers Homebrew dans le chemin de recherche par défaut. Les deux headers qui échouent le plus souvent :

- `openssl/ssl.h` -- depuis OpenSSL
- `imap/imap.h` -- depuis imap-uw

### La correction PATH

Si `php -v` affiche la mauvaise version après l'installation, les shims de phpenv ne sont pas dans votre PATH (ou autre chose les masque). Ajoutez ceci à `~/.zshrc` :

```bash
export PHPENV_ROOT="$HOME/.phpenv"
if [ -d "${PHPENV_ROOT}" ]; then
  export PATH="${PHPENV_ROOT}/shims:${PHPENV_ROOT}/bin:$PATH"
  eval "$(phpenv init -)"
fi
```

Puis lancez `source ~/.zshrc` et réessayez.

### L'erreur utf8_mime2text

Si vous voyez ceci :

```
configure: error: utf8_mime2text() has new signature, but U8T_CANONICAL is missing.
This should not happen.
```

Votre bibliothèque `imap-uw` est obsolète ou cassée. Corrigez-la avec :

```bash
brew upgrade imap-uw
```

Puis relancez l'installation.

## L'avenir de PHP + IMAP

Tout est déjà annoncé. ext-imap est dépréciée, la bibliothèque C sous-jacente est abandonnée, et PHP 8.4 l'a déjà retirée du cœur. Si vous lisez ceci parce que vous avez besoin d'IMAP dans un projet PHP, commencez à planifier votre migration vers `webklex/php-imap`. L'extension native vit sur du temps emprunté.

Pour celles et ceux d'entre nous qui maintiennent des bases de code legacy -- ce guide continuera à fonctionner pour PHP 8.3 et les versions antérieures. Mais ne démarrez pas de nouveaux projets avec ext-imap. Il n'y a aucune raison de se battre avec la compilation d'une bibliothèque C quand une solution en pur PHP existe.

---

### Références

1. [PHP 8.4: IMAP Extension Unbundled](https://php.watch/versions/8.4/imap-unbundled) -- *Documentation PHP.Watch sur le retrait de ext-imap.*
2. [Webklex/php-imap on GitHub](https://github.com/Webklex/php-imap) -- *Implémentation IMAP en pur PHP (5M+ installations Packagist).*
3. [PHP Manual: IMAP Extension](https://www.php.net/manual/en/book.imap.php) -- *Documentation officielle avec avis de dépréciation.*
4. [shivammathur/extensions: IMAP for PHP 8.3+](https://github.com/shivammathur/homebrew-extensions) -- *Tap Homebrew pour les extensions PHP, dont IMAP.*

---

### Articles connexes

- [PHP 8.5 : tour des fonctionnalités à venir](/fr/php-8-5-new-features-pipe-operator-guide/) -- ce qui arrive ensuite dans PHP.
- [Guide dev : changements de classes et namespaces Shopware 6.5/6.6](/fr/understanding-class-namespace-changes-shopware-6-5-developers-guide/) -- un autre guide de migration PHP pour les développeurs Shopware.
- [Laravel Sail vs Laradock](/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- choisir la bonne configuration Docker pour le développement PHP.
