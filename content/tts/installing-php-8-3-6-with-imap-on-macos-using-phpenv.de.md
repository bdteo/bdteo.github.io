[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

Wichtig (Update 2024-11): PHP 8.4 hat ext-imap aus dem Core ausgelagert. Die Extension ist zu PECL gewandert und praktisch deprecated -- die zugrunde liegende C-Bibliothek (libc-client) wurde seit 2018 nicht mehr aktualisiert. Wenn du ein neues Projekt startest oder auf PHP 8.4+ bist, spring zu Brauchst du ext-imap wirklich? für moderne Alternativen. Wenn du auf PHP 8.3 oder älter bist und die native Extension brauchst, funktioniert diese Anleitung weiterhin.

[matter-of-fact] Der Quick Fix.

Wenn du nur die Befehle willst und dir das Warum egal ist -- hier ist alles in der richtigen Reihenfolge. Homebrew und phpenv müssen bereits installiert sein.

[deliberate] Wenn imap in der Ausgabe auftaucht, bist du fertig. Wenn nicht, lies weiter.

Brauchst du ext-imap wirklich?

Ernst gemeinte Frage. Bevor du dich mit C-Bibliotheken und Compiler-Flags herumschlagst, überleg kurz, ob du die native IMAP-Extension wirklich brauchst.

PHP 8.4 hat ext-imap aus dem Core entfernt. Sie ist zu PECL gewandert, und die zugrunde liegende C-Bibliothek (libc-client / UW-IMAP) hat seit 2018 kein Update gesehen. Sie hat Thread-Safety-Probleme, fehlenden XAUTH-Support und POP-Bugs. Sie kommt nicht zurück.

Die moderne Alternative ist Webklex/php-imap -- eine reine PHP-Implementierung von IMAP:

Das war's. Keine brew-Abhängigkeiten, keine Compiler-Flags, keine Jagd nach Header-Dateien. Es funktioniert mit PHP 8.0.2+ (einschließlich 8.4 und 8.5), unterstützt IMAP IDLE und OAuth und hat über 5 Millionen Installationen auf Packagist. Es gibt auch eine Laravel-Integration, falls das dein Stack ist.

[conversational tone] Verwende ext-imap nur, wenn du eine Legacy-Codebasis auf PHP 8.3 oder älter wartest, die bereits von imap_*-Funktionen abhängt, und du noch nicht migrieren kannst.

Was jeder Schritt macht.

Wenn der Quick Fix funktioniert hat, kannst du hier aufhören. Wenn nicht -- oder wenn du verstehen willst, was passiert -- hier ist die Aufschlüsselung.

Die Brew-Abhängigkeiten.

macOS bringt einige davon mit, aber phpenv braucht die Homebrew-Versionen mit ordentlichen Headern und pkg-config-Dateien. Entscheidend ist imap-uw -- das ist die UW-IMAP-Bibliothek, die libc-client bereitstellt.

PHP_BUILD_CONFIGURE_OPTS.

phpenv verwendet unter der Haube php-build, das./configure auf dem PHP-Quellcode ausführt. Die Variable PHP_BUILD_CONFIGURE_OPTS reicht Flags direkt an configure weiter. Jedes --with-*-Flag sagt PHP, wo es eine bestimmte Bibliothek findet.

[matter-of-fact] Die wichtigsten für IMAP:

--with-imap=$(brew --prefix imap-uw) -- zeigt auf die IMAP-Bibliothek.

--with-imap-ssl=$(brew --prefix openssl@3) -- aktiviert IMAP über SSL.

--with-kerberos=$(brew --prefix krb5) -- für IMAP-Authentifizierung erforderlich.

Der CPPFLAGS-Fix.

Selbst mit den configure-Flags findet der C-Präprozessor manchmal die Header-Dateien nicht. Das passiert, weil macOS Homebrew-Header nicht in den Standard-Suchpfad legt. Die zwei Header, die am häufigsten scheitern:

openssl/ssl.h -- von OpenSSL.

[slows down] imap/imap.h -- von imap-uw.

Der PATH-Fix.

Wenn php -v nach der Installation die falsche Version zeigt, sind phpenvs Shims nicht in deinem PATH (oder etwas anderes überdeckt sie). Füg das zu ~/.zshrc hinzu:

Dann source ~/.zshrc ausführen und es erneut versuchen.

Der utf8_mime2text-Fehler.

Wenn du das hier siehst:

Deine imap-uw-Bibliothek ist veraltet oder kaputt. Beheb es mit:

[reflective] Danach die Installation erneut ausführen.

Die Zukunft von PHP + IMAP.

Die Zeichen stehen eindeutig. ext-imap ist deprecated, die zugrunde liegende C-Bibliothek ist verlassen, und PHP 8.4 hat sie bereits aus dem Core entfernt. Wenn du das liest, weil du IMAP in einem PHP-Projekt brauchst, fang an, deine Migration zu webklex/php-imap zu planen. Die native Extension lebt auf geborgter Zeit.

Für diejenigen unter uns, die Legacy-Codebasen warten -- diese Anleitung wird für PHP 8.3 und älter weiter funktionieren. Aber starte keine neuen Projekte mit ext-imap. Es gibt keinen Grund, mit der Kompilierung von C-Bibliotheken zu kämpfen, wenn eine reine PHP-Lösung existiert.
