[conversational tone] Instala PHP 8.3 con IMAP en macOS usando phpenv. Cubre dependencias de brew, PHP_BUILD_CONFIGURE_OPTS y resolución de problemas. Actualización: ext-imap está obsoleta en PHP 8.4+ -- se incluyen alternativas modernas.

Importante (actualización 2024-11): PHP 8.4 separó ext-imap del núcleo. La extensión pasó a PECL y está prácticamente obsoleta -- la biblioteca de C subyacente (libc-client) no se actualiza desde 2018. Si estás empezando un proyecto nuevo o usas PHP 8.4+, salta a ¿Realmente necesitas ext-imap? para ver alternativas modernas. Si usas PHP 8.3 o anterior y necesitas la extensión nativa, esta guía sigue funcionando.

[matter-of-fact] La solución rápida

[matter-of-fact] Si solo quieres los comandos y el porqué te da igual -- aquí está todo en orden. Necesitas tener Homebrew y phpenv ya instalados.

Si imap aparece en la salida, ya está. Si no, sigue leyendo.

[deliberate] ¿Realmente necesitas ext-imap?

Va en serio. Antes de pelearte con bibliotecas de C y banderas del compilador, plantéate si de verdad necesitas la extensión nativa de IMAP.

PHP 8.4 eliminó ext-imap del núcleo. Pasó a PECL, y la biblioteca de C subyacente (libc-client / UW-IMAP) no recibe una actualización desde 2018. Tiene problemas de seguridad en hilos, le falta soporte para XAUTH y tiene errores con POP. No va a volver.

La alternativa moderna es Webklex/php-imap -- una implementación de IMAP en PHP puro:

Eso es todo. Sin dependencias de brew, sin banderas del compilador, sin búsquedas de archivos de cabecera. Funciona en PHP 8.0.2+ (incluidos 8.4 y 8.5), admite IMAP IDLE y OAuth, y tiene más de 5 millones de instalaciones en Packagist. También hay una integración con Laravel si ese es tu stack.

[reflective] Usa ext-imap solo si mantienes un código heredado en PHP 8.3 o anterior que ya depende de las funciones imap_ y todavía no puedes migrar.

[calm] Qué hace cada paso

Si la solución rápida funcionó, puedes dejar de leer. Si no -- o si quieres entender qué está pasando -- aquí tienes el desglose.

[reflective] Las dependencias de brew

macOS incluye algunas de estas, pero phpenv necesita las versiones de Homebrew con las cabeceras y los archivos de pkg-config adecuados. La crítica es imap-uw -- esa es la biblioteca UW-IMAP que proporciona libc-client.

[matter-of-fact] PHP_BUILD_CONFIGURE_OPTS

phpenv usa php-build por debajo, que ejecuta./configure sobre el código fuente de PHP. La variable PHP_BUILD_CONFIGURE_OPTS pasa las banderas directamente a configure. Cada bandera --with- le indica a PHP dónde encontrar una biblioteca concreta.

[calm] Las más importantes para IMAP:

--with-imap=$(brew --prefix imap-uw) -- apunta a la biblioteca de IMAP --with-imap-ssl=$(brew --prefix openssl@3) -- habilita IMAP sobre SSL --with-kerberos=$(brew --prefix krb5) -- necesaria para la autenticación de IMAP

[deliberate] El arreglo de CPPFLAGS

Incluso con las banderas de configure, a veces el preprocesador de C no encuentra los archivos de cabecera. Esto pasa porque macOS no coloca las cabeceras de Homebrew en la ruta de búsqueda por defecto. Las dos cabeceras que fallan con más frecuencia:

openssl/ssl.h -- de OpenSSL imap/imap.h -- de imap-uw

[calm] El arreglo de PATH

Si php -v muestra la versión equivocada después de instalar, los shims de phpenv no están en tu PATH (o algo más los está tapando). Añade esto a ~/.zshrc:

[deliberate] Luego ejecuta source ~/.zshrc e inténtalo de nuevo.

[reflective] El error utf8_mime2text

Si ves esto:

Tu biblioteca imap-uw está desactualizada o estropeada. Arréglalo con:

Luego vuelve a ejecutar la instalación.

[matter-of-fact] El futuro de PHP + IMAP

El final está cantado. ext-imap está obsoleta, la biblioteca de C subyacente está abandonada y PHP 8.4 ya la quitó del núcleo. Si estás leyendo esto porque necesitas IMAP en un proyecto de PHP, empieza a planear tu migración a webklex/php-imap. La extensión nativa tiene los días contados.

[matter-of-fact] Para quienes mantenemos código heredado -- esta guía seguirá funcionando para PHP 8.3 y anteriores. Pero no empieces proyectos nuevos sobre ext-imap. No hay razón para pelearse con la compilación de bibliotecas de C cuando existe una solución en PHP puro.
