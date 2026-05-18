---
lang: "zh-Hans"
translationOf: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
translationUpdatedAt: "2026-05-18"
translationSourceHash: "4c02d668769b502f"
title: "在 macOS 上用 phpenv 安装带 IMAP 的 PHP 8.3.6：安装指南"
date: "2024-09-01"
slug: "installing-php-8-3-6-with-imap-on-macos-using-phpenv"
author: "Boris Teoharov"
description: "在 macOS 上用 phpenv 安装带 IMAP 的 PHP 8.3。覆盖 brew 依赖、PHP_BUILD_CONFIGURE_OPTS 和故障排查。更新：PHP 8.4+ 中 ext-imap 已弃用，文中也包含现代替代方案。"
tags: ["PHP", "macOS", "IMAP", "phpenv", "Development Environment", "PECL", "Deprecated"]
featuredImage: "./images/featured.jpg"
imageCaption: "白色大理石上的一部手机。浅青色的通知光晕，一封折起的信，一支钢笔。"
---

> **重要提示（2024-11 更新）：** PHP 8.4 已经把 **ext-imap** 从核心中拆出。这个扩展移到了 PECL，并且事实上已经弃用：底层 C 库（libc-client）自 2018 年以来就没有更新。如果你正在启动新项目，或者使用 PHP 8.4+，请直接跳到[你真的需要 ext-imap 吗？](#你真的需要-ext-imap-吗)看现代替代方案。如果你在 PHP 8.3 或更早版本上，并且确实需要原生扩展，这份指南仍然可用。

## 快速修复

如果你只想要命令，不关心为什么，下面就是完整顺序。你需要已经安装好 Homebrew 和 phpenv。

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

如果输出里出现 `imap`，就结束了。如果没有，继续往下读。

## 你真的需要 ext-imap 吗？

认真问一句。在和 C 库、编译器 flag 较劲之前，先想想你是否真的需要原生 IMAP 扩展。

**PHP 8.4 已经从核心中移除了 ext-imap。** 它转到了 PECL，而底层 C 库（`libc-client` / UW-IMAP）自 2018 年以来就没有更新。它有线程安全问题，缺少 XAUTH 支持，还有 POP bug。它不会回来了。

现代替代方案是 [**Webklex/php-imap**](https://github.com/Webklex/php-imap)，一个纯 PHP 的 IMAP 实现：

```bash
composer require webklex/php-imap
```

就这样。没有 brew 依赖，没有编译器 flag，没有到处找头文件。它可以在 PHP 8.0.2+ 上工作（包括 8.4 和 8.5），支持 IMAP IDLE 和 OAuth，在 Packagist 上有超过 500 万次安装。如果你的技术栈是 Laravel，也有一个 [Laravel 集成](https://github.com/Webklex/laravel-imap)。

**只有在这种情况下才使用 ext-imap：** 你正在维护一个 PHP 8.3 或更早版本上的遗留代码库，它已经依赖 `imap_*` 函数，而且暂时还不能迁移。

## 每一步在做什么

如果快速修复已经奏效，可以不用再读。如果没有，或者你想理解发生了什么，下面是拆解。

### Brew 依赖

```bash
brew install tidy-html5 openssl@3 zlib bzip2 libedit readline \
  gettext libiconv libsodium krb5 imap-uw curl
```

macOS 自带其中一部分，但 phpenv 需要 Homebrew 版本，因为它们带有正确的 header 和 pkg-config 文件。最关键的是 `imap-uw`，它就是提供 `libc-client` 的 UW-IMAP 库。

### PHP_BUILD_CONFIGURE_OPTS

phpenv 底层使用 php-build，而 php-build 会在 PHP 源码上运行 `./configure`。`PHP_BUILD_CONFIGURE_OPTS` 变量把 flag 直接传给 configure。每一个 `--with-*` flag 都告诉 PHP 去哪里找某个特定库。

对 IMAP 最重要的是：

- `--with-imap=$(brew --prefix imap-uw)` -- 指向 IMAP 库
- `--with-imap-ssl=$(brew --prefix openssl@3)` -- 启用基于 SSL 的 IMAP
- `--with-kerberos=$(brew --prefix krb5)` -- IMAP 认证所需

### CPPFLAGS 修复

```bash
export CPPFLAGS="-I$(brew --prefix openssl@3)/include -I$(brew --prefix imap-uw)/include $CPPFLAGS"
```

即便 configure flag 已经设置好，C 预处理器有时还是找不到头文件。这是因为 macOS 不会把 Homebrew 的 header 放进默认搜索路径。最常出问题的两个 header 是：

- `openssl/ssl.h` -- 来自 OpenSSL
- `imap/imap.h` -- 来自 imap-uw

### PATH 修复

如果安装之后 `php -v` 显示的版本不对，说明 phpenv 的 shims 没有在你的 PATH 里，或者被别的东西遮住了。把下面这段加到 `~/.zshrc`：

```bash
export PHPENV_ROOT="$HOME/.phpenv"
if [ -d "${PHPENV_ROOT}" ]; then
  export PATH="${PHPENV_ROOT}/shims:${PHPENV_ROOT}/bin:$PATH"
  eval "$(phpenv init -)"
fi
```

然后运行 `source ~/.zshrc`，再试一次。

### utf8_mime2text 错误

如果你看到这个：

```
configure: error: utf8_mime2text() has new signature, but U8T_CANONICAL is missing.
This should not happen.
```

说明你的 `imap-uw` 库太旧或已经坏了。这样修：

```bash
brew upgrade imap-uw
```

然后重新运行安装。

## PHP + IMAP 的未来

墙上的字已经写出来了。ext-imap 已弃用，底层 C 库已被放弃，PHP 8.4 已经把它从核心中移除。如果你读到这里，是因为某个 PHP 项目需要 IMAP，那就开始规划迁移到 `webklex/php-imap`。原生扩展是在借来的时间上运行。

对于我们这些维护遗留代码库的人，这份指南会继续适用于 PHP 8.3 及更早版本。但不要在新项目里开始使用 ext-imap。既然有纯 PHP 方案，就没必要再和 C 库编译较劲。

---

### 参考资料

1. [PHP 8.4: IMAP Extension Unbundled](https://php.watch/versions/8.4/imap-unbundled) -- *PHP.Watch 关于 ext-imap 移除的文档。*
2. [Webklex/php-imap on GitHub](https://github.com/Webklex/php-imap) -- *纯 PHP IMAP 实现（Packagist 安装量 500 万+）。*
3. [PHP Manual: IMAP Extension](https://www.php.net/manual/en/book.imap.php) -- *带有弃用说明的官方文档。*
4. [shivammathur/extensions: IMAP for PHP 8.3+](https://github.com/shivammathur/homebrew-extensions) -- *包含 IMAP 等 PHP 扩展的 Homebrew tap。*

---

### 相关文章

- [PHP 8.5: A Tour of the Incoming Features](/zh/php-8-5-new-features-pipe-operator-guide/) -- PHP 接下来会有什么变化。
- [Dev Guide: Shopware 6.5/6.6 Class & Namespace Updates](/zh/understanding-class-namespace-changes-shopware-6-5-developers-guide/) -- 给 Shopware 开发者的另一份 PHP 迁移指南。
- [Laravel Sail vs Laradock](/zh/laravel-sail-vs-laradock-choosing-right-docker-solution/) -- 为 PHP 开发选择合适的 Docker 设置。
