[conversational tone] Installer PHP 8.3 avec IMAP sur macOS en utilisant phpenv. Couvre les dépendances brew, PHP_BUILD_CONFIGURE_OPTS et le dépannage. Mise à jour: ext-imap est déprécié dans PHP 8.4+ -- alternatives modernes incluses.

Important (mise à jour 2024-11): PHP 8.4 a retiré ext-imap du cœur. L'extension a été déplacée vers PECL et elle est, dans les faits, dépréciée -- la bibliothèque C sous-jacente (libc-client) n'a pas été mise à jour depuis 2018. Si vous démarrez un nouveau projet ou si vous êtes sur PHP 8.4+, allez directement à Avez-vous vraiment besoin de ext-imap? pour des alternatives modernes. Si vous êtes sur PHP 8.3 ou une version antérieure et que vous avez besoin de l'extension native, ce guide fonctionne toujours.

[matter-of-fact] La correction rapide

[matter-of-fact] Si vous voulez simplement les commandes, sans vous soucier du pourquoi -- voici tout, dans l'ordre. Vous devez déjà avoir installé Homebrew et phpenv.

Si imap apparaît dans la sortie, c'est terminé. Sinon, continuez.

[deliberate] Avez-vous vraiment besoin de ext-imap?

Question sérieuse. Avant de vous battre avec des bibliothèques C et des flags de compilation, demandez-vous si vous avez vraiment besoin de l'extension IMAP native.

PHP 8.4 a retiré ext-imap du cœur. Elle a été déplacée vers PECL, et la bibliothèque C sous-jacente (libc-client / UW-IMAP) n'a pas reçu de mise à jour depuis 2018. Elle a des problèmes de thread-safety, pas de support XAUTH, et des bugs POP. Elle ne reviendra pas.

L'alternative moderne est Webklex/php-imap -- une implémentation IMAP en pur PHP:

C'est tout. Pas de dépendances brew, pas de flags de compilation, pas de chasse aux fichiers d'en-tête. Elle fonctionne sur PHP 8.0.2+ (y compris 8.4 et 8.5), prend en charge IMAP IDLE et OAuth, et compte plus de 5 millions d'installations sur Packagist. Il existe aussi une intégration Laravel si c'est votre stack.

[reflective] N'utilisez ext-imap que si vous maintenez une base de code legacy sur PHP 8.3 ou une version antérieure, qui dépend déjà des fonctions imap_, et que vous ne pouvez pas encore migrer.

[calm] Ce que fait chaque étape

Si la correction rapide a fonctionné, vous pouvez arrêter de lire. Si elle n'a pas fonctionné -- ou si vous voulez comprendre ce qui se passe -- voici le détail.

[reflective] Les dépendances Brew

macOS fournit certaines d'entre elles, mais phpenv a besoin des versions Homebrew, avec les bons headers et fichiers pkg-config. La dépendance critique est imap-uw -- c'est la bibliothèque UW-IMAP qui fournit libc-client.

[matter-of-fact] PHP_BUILD_CONFIGURE_OPTS

phpenv utilise php-build sous le capot, qui lance./configure sur les sources de PHP. La variable PHP_BUILD_CONFIGURE_OPTS passe des flags directement à configure. Chaque flag --with- indique à PHP où trouver une bibliothèque précise.

[calm] Les plus importants pour IMAP:

--with-imap=$(brew --prefix imap-uw) -- pointe vers la bibliothèque IMAP --with-imap-ssl=$(brew --prefix openssl@3) -- active IMAP via SSL --with-kerberos=$(brew --prefix krb5) -- requis pour l'authentification IMAP

[deliberate] La correction CPPFLAGS

Même avec les flags configure, le préprocesseur C n'arrive parfois pas à trouver les fichiers d'en-tête. Cela arrive parce que macOS ne met pas les headers Homebrew dans le chemin de recherche par défaut. Les deux headers qui échouent le plus souvent:

openssl/ssl.h -- depuis OpenSSL imap/imap.h -- depuis imap-uw

[calm] La correction PATH

Si php -v affiche la mauvaise version après l'installation, les shims de phpenv ne sont pas dans votre PATH (ou autre chose les masque). Ajoutez ceci à ~/.zshrc:

[deliberate] Puis lancez source ~/.zshrc et réessayez.

[reflective] L'erreur utf8_mime2text

Si vous voyez ceci:

Votre bibliothèque imap-uw est obsolète ou cassée. Corrigez-la avec:

Puis relancez l'installation.

[matter-of-fact] L'avenir de PHP + IMAP

Tout est déjà annoncé. ext-imap est dépréciée, la bibliothèque C sous-jacente est abandonnée, et PHP 8.4 l'a déjà retirée du cœur. Si vous lisez ceci parce que vous avez besoin d'IMAP dans un projet PHP, commencez à planifier votre migration vers webklex/php-imap. L'extension native vit sur du temps emprunté.

[matter-of-fact] Pour celles et ceux d'entre nous qui maintiennent des bases de code legacy -- ce guide continuera à fonctionner pour PHP 8.3 et les versions antérieures. Mais ne démarrez pas de nouveaux projets avec ext-imap. Il n'y a aucune raison de se battre avec la compilation d'une bibliothèque C quand une solution en pur PHP existe.
