PHP 8.3.6 plus IMAP on macOS using phpenv

Important update from November 2024: PHP 8.4 unbundled ext-imap from core.

The extension moved to PECL, and it is effectively deprecated. The underlying C library, libc-client from UW-IMAP, has not been updated since 2018.

If you are starting a new project, or if you are on PHP 8.4 or newer, you should probably skip the native extension and use a modern alternative instead.

If you are on PHP 8.3 or earlier and need the native extension, this guide still works.

The quick fix

If you just want the commands and do not care about the why, here is the order.

You need Homebrew and phpenv already installed.

First, install the required libraries with Homebrew: tidy-html5, OpenSSL 3, zlib, bzip2, libedit, readline, gettext, libiconv, libsodium, krb5, imap-uw, and curl.

Second, set PHP_BUILD_CONFIGURE_OPTS before running the PHP build.

That variable needs to tell PHP where Homebrew installed OpenSSL, zlib, bzip2, readline, gettext, libiconv, libsodium, Kerberos, imap-uw, and tidy-html5.

For IMAP specifically, the important configure flags are with-imap pointing to the imap-uw prefix, with-imap-ssl pointing to OpenSSL 3, and with-kerberos pointing to krb5.

Third, set CPPFLAGS so the compiler can find the OpenSSL and imap-uw header directories.

Fourth, build and install PHP 8.3.6 with phpenv.

Fifth, set PHP 8.3.6 as the global version and verify it with php version output and the module list. If imap appears in the module list, you are done.

If it does not, read on.

Do you actually need ext-imap?

Serious question.

Before fighting with C libraries and compiler flags, consider whether you actually need the native IMAP extension.

PHP 8.4 removed ext-imap from core. It moved to PECL, and the underlying C library, libc-client, has thread-safety issues, missing XAUTH support, and POP bugs.

It is not coming back.

The modern alternative is Webklex php-imap, a pure PHP IMAP implementation.

Install it through Composer with the package name webklex slash php-imap.

That is it.

No Homebrew dependencies. No compiler flags. No header-file hunts.

It works on PHP 8.0.2 and newer, including PHP 8.4 and 8.5. It supports IMAP IDLE and OAuth, and it has millions of installs on Packagist.

There is also a Laravel integration if that is your stack.

Use ext-imap only if you are maintaining a legacy codebase on PHP 8.3 or earlier, it already depends on imap functions, and you cannot migrate yet.

What each step does

If the quick fix worked, you can stop here.

If it did not, or if you want to understand what is happening, here is the breakdown.

The Homebrew dependencies

macOS ships with some of the libraries PHP needs, but phpenv needs the Homebrew versions with proper headers and pkg-config files.

The critical dependency is imap-uw. That is the UW-IMAP library that provides libc-client.

The configure options

phpenv uses php-build under the hood, and php-build runs configure on the PHP source.

PHP_BUILD_CONFIGURE_OPTS passes flags directly to configure. Each with flag tells PHP where to find a specific library.

The most important IMAP flags are with-imap, with-imap-ssl, and with-kerberos.

with-imap points to the IMAP library.

with-imap-ssl enables IMAP over SSL.

with-kerberos is required for IMAP authentication.

The CPPFLAGS fix

Even with configure flags, the C preprocessor sometimes cannot find header files.

This happens because macOS does not put Homebrew headers in the default search path.

The two headers that fail most often are openssl slash ssl dot h from OpenSSL, and imap slash imap dot h from imap-uw.

CPPFLAGS lets you add those include directories explicitly.

The PATH fix

If php version output shows the wrong PHP version after installing, phpenv's shims are not in your PATH, or something else is shadowing them.

Add the phpenv root, shims, and bin directories to your shell startup file, then initialize phpenv from there.

After that, reload your shell and try again.

The utf8_mime2text error

If configure fails with an error saying utf8_mime2text has a new signature but U8T_CANONICAL is missing, your imap-uw library is out of date or broken.

Upgrade imap-uw with Homebrew, then rerun the PHP install.

The future of PHP and IMAP

The writing is on the wall.

ext-imap is deprecated. The underlying C library is abandoned. PHP 8.4 already removed it from core.

If you need IMAP in a PHP project today, start planning a migration to webklex php-imap.

The native extension is on borrowed time.

For those of us maintaining legacy codebases, this guide will keep working for PHP 8.3 and earlier.

But do not start new projects on ext-imap.

There is no reason to fight with C library compilation when a pure PHP solution exists.
