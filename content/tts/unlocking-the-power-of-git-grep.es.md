Recetas de git grep: busca código rastreado sin buscar en todo el sistema de archivos

[conversational tone] La mayoría de los consejos sobre búsqueda de código empiezan por la velocidad. La velocidad importa, pero la verdadera razón por la que recurro a git grep es más simple:

Busca en el código que Git conoce, no en todo el sistema de archivos.

Eso significa que tu búsqueda no se pasea por node underscore modules, dot cache, dist, informes de coverage, dumps locales, screenshots ni cualquier cosa temporal que hayas creado durante una tarde rara de debugging. Por defecto, git grep empieza desde las rutas rastreadas en tu working tree de Git. Esa única restricción vuelve los resultados más tranquilos.

Esto no es un argumento contra rg, o ripgrep. Uso rg constantemente. Pero las dos herramientas responden preguntas distintas.

Git grep pregunta: ¿dónde está esto en el código rastreado, o en otra branch, tag o commit?

Ripgrep pregunta: ¿dónde está esto en el disco, respetando mis ignore rules?

Cuando esa distinción encaja, git grep deja de ser un comando viejo que sabes vagamente que existe y se convierte en un pequeño hábito muy afilado.

[matter-of-fact] El modelo mental es pequeño. La forma útil es: git grep, luego las opciones, luego el pattern, luego valores tree-ish opcionales, luego un doble guion y pathspecs opcionales.

El pattern es lo que estás buscando.

Un tree-ish es opcional: una branch, tag, commit u otro Git tree donde buscar.

Un pathspec es opcional: los archivos o directorios a los que limitar la búsqueda.

El doble guion separa revisions de paths cuando hay cualquier posibilidad de ambigüedad.

Por defecto, git grep busca en los archivos rastreados de tu working tree. No es un índice mágico de contenido. No lee cada archivo bajo el directorio actual. Le pregunta a Git qué rutas pertenecen al proyecto y luego busca en esas rutas.

Por eso se siente ordenado.

[deliberate] Primera receta: busca código rastreado y muestra números de línea.

Ejecuta git grep guion n initializeSettings.

El flag guion n imprime números de línea. Eso vuelve la salida útil en una terminal, un comentario de pull request o una nota rápida de handoff. Git puede configurarse para mostrar números de línea por defecto, pero aun así tiendo a escribir guion n, porque es visible y portable en snippets.

Segunda receta: busca una cadena literal, no una expresión regular.

Usa guion F mayúscula cuando el pattern sea una cadena fija. Por ejemplo, para buscar useEffect, paréntesis de apertura, dentro de archivos JavaScript y TypeScript, combina git grep guion n, guion F mayúscula, el texto literal, luego un doble guion y los file globs entre comillas.

El hábito importante es este: pon los file globs después del doble guion, y ponlos entre comillas para que tu shell no los expanda antes de que Git los vea.

Esta es la versión que quiero cuando conozco el function call exacto, la config key, el class name o el error message.

Tercera receta: busca sin distinguir mayúsculas, como palabra entera, con columnas.

Ejecuta git grep guion n, guion i, guion w, doble guion column, customer.

Guion i ignora mayúsculas y minúsculas. Guion w pide coincidencias de palabra entera. Doble guion column imprime el número de columna de la primera coincidencia en la línea. Esto viene bien cuando el término es lo bastante común como para que la salida cruda se vuelva ruidosa.

Cuarta receta: busca un pattern que empieza con un guion.

Ejecuta git grep guion n, guion e, doble guion force.

Sin guion e, Git puede leer el pattern como otra opción de línea de comandos. Guion e dice: lo siguiente es un search pattern. Es uno de esos flags diminutos que no necesitas a menudo, pero cuando lo necesitas, de verdad lo necesitas.

También puedes pasar más de un guion e. Buscar oldBillingFlow y legacyCheckout así significa que cualquiera de los dos patterns puede coincidir.

[matter-of-fact] Quinta receta: usa una expresión regular cuando la estructura importa.

Guion E mayúscula habilita expresiones regulares extendidas. Un ejemplo práctico es buscar definiciones de funciones de Python con un pattern que significa: def, luego whitespace, luego un nombre de función, luego un paréntesis de apertura.

Para preguntas estructurales más grandes, usa las herramientas del lenguaje. Git grep es excelente para encontrar candidatos. No es un motor de árbol de sintaxis abstracta, y esa honestidad es parte de por qué me gusta.

Sexta receta: limita la búsqueda a un path.

Ejecuta git grep guion n FeatureFlag, doble guion, src, components.

Los pathspecs después del doble guion mantienen la búsqueda enfocada. A menudo eso es más rápido mentalmente, no solo en términos computacionales. Le estás diciendo al comando qué tipo de respuesta te importa.

También puedes excluir paths con el pathspec de exclusión de Git. La regla práctica importante es que los filtros de path van después del doble guion, y los pathspecs de exclusión los maneja Git, no el shell.

Séptima receta: lista solo los archivos con coincidencias.

Usa guion l cuando el siguiente paso sea abrir los archivos, o medir el blast radius, no leer cada match.

El inverso es guion L mayúscula. Lista los archivos rastreados que no contienen el pattern. Puede ser sorprendentemente útil durante migraciones de framework.

Octava receta: cuenta coincidencias por archivo.

Usa guion c para un mapa de calor rápido. No es una métrica de calidad de código; por favor no la conviertas en una. Pero sirve para detectar los archivos donde un término está concentrado antes de empezar a editar.

[deliberate] Novena receta: busca la versión staged en vez del working tree.

Ejecuta git grep guion n, doble guion cached, newConfigKey.

Por defecto, git grep busca rutas rastreadas en el working tree. Doble guion cached busca los blobs en el índice: la versión staged.

Eso es útil en pre-commit checks, review scripts o cualquier momento en que quieras preguntar: qué tengo exactamente staged, en vez de qué está ahora mismo en el disco.

Décima receta: busca archivos untracked, teniendo en cuenta las ignore rules.

Ejecuta git grep guion n, doble guion untracked, draftFlag.

Doble guion untracked añade archivos untracked a la búsqueda. En este modo se respetan las ignore rules estándar de Git, así que los archivos ignored siguen quedando fuera del resultado.

Si de verdad quieres también los archivos ignored, añade doble guion no exclude standard. Eso es un movimiento deliberado. Lo uso cuando sospecho que un generated file, una fixture local o un artifact ignored contiene lo que estoy persiguiendo.

Undécima receta: busca en otra branch, tag o commit antiguo sin checkout.

Ejecuta git grep guion n validateUser main.

O ejecútalo contra la versión dos punto tres punto cero.

O ejecútalo contra H E A D tilde veinte, limitado a src.

Esta es la killer feature.

Sin checkout. Sin stash. Sin desvío a otro worktree. Puedes hacerle una pregunta directa a una branch, tag o commit antiguo y quedarte exactamente donde estás.

Cuando un bug report dice, esto funcionaba en el último release, suelo empezar aquí.

Duodécima receta: busca en cada commit solo cuando lo dices en serio.

La forma aproximada es: git rev-list doble guion all, por pipe hacia xargs guion n cincuenta, luego git grep guion n validateUser.

Esto busca en los commit trees de toda la historia por tandas. En un repository serio puede ser ruidoso, repetitivo y caro, porque el mismo contenido de archivo puede aparecer en muchos commits.

La mayoría de las veces, si tu pregunta real es cuándo apareció o desapareció esta cadena, git log es el mejor compañero.

Usa git log guion S mayúscula cuando te importan los cambios en el número de occurrences de una cadena.

Usa git log guion G mayúscula, con guion p, cuando te importan los diffs cuyas líneas añadidas o eliminadas coinciden con una expresión regular.

Pregunta distinta, herramienta distinta.

[calm] Ahora, la trampa de dot gitignore.

La frase, git grep respeta dot gitignore, es lo bastante cercana a la verdad como para tentar, y lo bastante equivocada como para morderte.

Por defecto, git grep busca archivos rastreados. Un archivo dot gitignore trata de mantener los archivos untracked como untracked. Los archivos que Git ya rastrea no se vuelven invisibles solo porque una regla de ignore posterior coincida con ellos.

Así que la versión precisa es esta:

Por defecto, git grep busca tracked paths en el working tree.

Los archivos ignored-but-untracked no se buscan, porque los archivos untracked no se buscan.

Los archivos ignored-but-tracked sí se buscan, porque están tracked.

Doble guion untracked añade archivos untracked, sin dejar de respetar las standard ignore rules.

Doble guion untracked más doble guion no exclude standard incluye también archivos ignored.

Doble guion no index convierte git grep en una búsqueda de sistema de archivos desde el directorio actual, incluso fuera de un repository.

Doble guion no index más doble guion exclude standard hace que esa búsqueda de sistema de archivos respete las standard ignore rules de Git.

El caso límite importa en repositories antiguos. Un archivo puede haberse committed primero e ignored después. Si estás cazando una cadena y git grep la encuentra en un archivo supuestamente ignored, Git no está confundido. El archivo está tracked.

[conversational tone] Entonces, ¿cuándo es rg la mejor herramienta?

Usa ripgrep cuando quieras filesystem semantics.

Ejecuta rg validateUser para la búsqueda normal. Añade S mayúscula para smart case. Añade doble guion hidden cuando también quieras dotfiles. Añade doble guion no ignore cuando también quieras archivos ignored.

Ripgrep recorre el directory tree. Por defecto respeta dot gitignore, dot ignore, dot rgignore, archivos globales de ignore, reglas de archivos ocultos y salto de archivos binarios. Es muy rápido, muy pulido, y suele ser lo que quiero cuando busco en el working directory tal como existe en el disco.

El trade-off es que rg no sabe buscar en la versión dos punto tres punto cero o H E A D tilde veinte a menos que hagas checkout de ese tree en alguna parte. La historia de Git no es su mundo.

Así que mi regla general es simple.

Usa git grep para tracked code y Git objects: branches, tags, commits, staged content.

Usa rg para el live filesystem: archivos untracked, directorios non-Git, experimentos con ignored files y búsquedas amplias de proyecto.

No hay premio por elegir solo uno. Ten ambos en las manos.

[matter-of-fact] La versión compacta:

Usa git grep guion n para archivos tracked con números de línea.

Usa guion F mayúscula para cadenas literales.

Usa guion i, guion w y doble guion column cuando necesites coincidencias whole-word case-insensitive con columnas.

Usa guion e cuando el search pattern empieza con un guion.

Usa guion E mayúscula para una expresión regular extendida.

Usa guion l para nombres de archivos coincidentes, y guion L mayúscula para archivos que no contienen el término.

Usa guion c para conteos.

Usa doble guion cached para la versión staged.

Usa doble guion untracked cuando los archivos untracked importan.

Nombra una branch, tag o commit cuando quieras buscar en un Git tree antiguo sin checkout.

Y usa git log guion S mayúscula cuando la pregunta real no es dónde está esta cadena, sino cuándo cambió su número de occurrences.

[reflective] El poder aburrido de git grep es que empieza por el proyecto tal como Git lo entiende.

Eso es exactamente lo que quieres más a menudo de lo que crees: no cada archivo del disco, no cada build artifact, no cada experimento local. Solo el código que pertenece al repository, más cualquier versión antigua de ese código que puedas nombrar.

Usa git grep cuando la pregunta es: ¿dónde en este codebase, incluyendo su historia?

Usa ripgrep cuando la pregunta es: ¿dónde en el disco, respetando mis ignore rules?

La mayoría de los días querrás tener ambos al alcance de la mano.
