---
lang: "es"
translationOf: "unlocking-the-power-of-git-grep"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "203041318333bf65"
title: "Recetas de git grep: busca código rastreado sin buscar en todo el sistema de archivos"
date: "2024-11-13"
description: "Una hoja práctica de git grep para buscar en archivos rastreados, ramas, etiquetas, cambios staged y commits antiguos, con trampas de .gitignore y cuándo usar ripgrep en su lugar."
tags: ["git", "git grep", "ripgrep", "búsqueda de código", "herramientas para desarrolladores", "desarrollo de software", "herramientas de línea de comandos"]
featuredImage: "./images/featured.jpg"
imageCaption: "Un cajón del fichero de una biblioteca abierto. Una ficha sobresale un poco: el pasaje que buscabas."
audioUrl: "/audio/articles/unlocking-the-power-of-git-grep/es/Qh9qDWKx9XUbnKbERblA-d3c67dd694f9.m4a"
audioDuration: "14:03"
audioVoice: "Gerard (ElevenLabs LatAm Spanish neutral)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/unlocking-the-power-of-git-grep.es.md"
---

La mayoría de los consejos sobre búsqueda de código empiezan por la velocidad. La velocidad importa, pero la verdadera razón por la que recurro a `git grep` es más simple:

**Busca en el código que Git conoce, no en todo el sistema de archivos.**

Eso significa que tu búsqueda no se pasea por `node_modules`, `.cache`, `dist`, informes de coverage, dumps locales, screenshots ni cualquier cosa temporal que hayas creado durante una tarde rara de debugging. Por defecto, `git grep` empieza desde las rutas rastreadas en tu working tree de Git. Esa única restricción vuelve los resultados más tranquilos.

Esto no es un argumento contra `rg` / ripgrep. Uso `rg` constantemente. Pero las dos herramientas responden preguntas distintas:

- `git grep`: "¿Dónde está esto en el código rastreado, o en otra branch, tag o commit?"
- `rg`: "¿Dónde está esto en el disco, respetando mis ignore rules?"

Cuando esa distinción encaja, `git grep` deja de ser un comando viejo que sabes vagamente que existe y se convierte en un pequeño hábito muy afilado.

## El modelo mental

La forma útil del comando es:

```bash
git grep [options] <pattern> [<tree-ish>...] [-- <pathspec>...]
```

En lenguaje simple:

- `<pattern>` es lo que estás buscando.
- `<tree-ish>` es opcional: una branch, tag, commit u otro Git tree donde buscar.
- `<pathspec>` es opcional: los archivos o directorios a los que limitar la búsqueda.
- `--` separa revisions de paths cuando hay cualquier posibilidad de ambigüedad.

Por defecto, `git grep` busca en los archivos rastreados de tu working tree. No es un índice mágico de contenido. No lee cada archivo bajo el directorio actual. Le pregunta a Git qué rutas pertenecen al proyecto y luego busca en esas rutas.

Por eso se siente ordenado.

## Recetas

### 1. Busca código rastreado y muestra números de línea

```bash
git grep -n "initializeSettings"
```

Esta es la versión cotidiana. `-n` imprime números de línea, lo que vuelve la salida útil en una terminal, un comentario de PR o una nota rápida de handoff.

Si siempre quieres números de línea, Git tiene una config para eso:

```bash
git config --global grep.lineNumber true
```

Aun así tiendo a escribir `-n`, porque es visible y portable en snippets.

### 2. Busca una cadena literal, no una regex

```bash
git grep -n -F "useEffect(" -- "*.js" "*.jsx" "*.ts" "*.tsx"
```

Usa `-F` cuando el pattern sea una cadena fija. Paréntesis, puntos, corchetes y otros caracteres con pinta de regex se tratan como texto normal.

Aquí importan dos hábitos pequeños:

- Pon los file globs después de `--`.
- Pon los globs entre comillas para que tu shell no los expanda antes de que Git los vea.

Esta es la versión que quiero cuando conozco el function call exacto, la config key, el class name o el error message.

### 3. Busca sin distinguir mayúsculas, como palabra entera, con columnas

```bash
git grep -n -i -w --column "customer"
```

`-i` ignora mayúsculas y minúsculas. `-w` pide coincidencias de palabra entera. `--column` imprime el número de columna de la primera coincidencia en la línea.

Esto viene bien cuando el término es lo bastante común como para que la salida cruda se vuelva ruidosa. También es útil cuando alimentas resultados a editor integrations o quickfix lists.

### 4. Busca un pattern que empieza con un guion

```bash
git grep -n -e "--force"
```

Sin `-e`, Git puede leer el pattern como otra opción de línea de comandos. `-e` dice: "lo siguiente es un search pattern." Es uno de esos flags diminutos que no necesitas a menudo, pero cuando lo necesitas, de verdad lo necesitas.

También puedes pasar más de un `-e`:

```bash
git grep -n -e "oldBillingFlow" -e "legacyCheckout"
```

Eso busca cualquiera de los dos patterns.

### 5. Usa una regex cuando la estructura importa

```bash
git grep -n -E "def[[:space:]]+[[:alnum:]_]+\\(" -- "*.py"
```

`-E` habilita expresiones regulares extendidas. Este ejemplo busca definiciones de funciones de Python sin fingir que es un parser.

Para preguntas estructurales más grandes, usa las herramientas del lenguaje. `git grep` es excelente para encontrar candidatos; no es un motor AST, y esa honestidad es parte de por qué me gusta.

### 6. Limita la búsqueda a un path

```bash
git grep -n "FeatureFlag" -- src components
```

Los pathspecs después de `--` mantienen la búsqueda enfocada. A menudo eso es más rápido mentalmente, no solo en términos computacionales. Le estás diciendo al comando qué tipo de respuesta te importa.

También puedes excluir paths:

```bash
git grep -n "logger" -- src ":(exclude)src/generated" ":(exclude)*.snap"
```

Los pathspecs de Git son potentes y un poco raros. La regla práctica importante es que los filtros de path van después de `--`, y los pathspecs de exclusión como `:(exclude)...` los maneja Git, no el shell.

### 7. Lista solo los archivos con coincidencias

```bash
git grep -l "useOldCheckout"
```

`-l` imprime nombres de archivo en vez de líneas coincidentes. Úsalo cuando el siguiente paso sea "abrir los archivos" o "contar el blast radius", no "leer cada match."

También existe el inverso:

```bash
git grep -L "use client" -- "src/**/*.tsx"
```

`-L` lista archivos rastreados que **no** contienen el pattern. Puede ser sorprendentemente útil durante migraciones de framework.

### 8. Cuenta coincidencias por archivo

```bash
git grep -c "TODO"
```

`-c` te da un mapa de calor rápido. No es una métrica de calidad de código; por favor no la conviertas en una. Pero sirve para detectar los archivos donde un término está concentrado antes de empezar a editar.

### 9. Busca la versión staged en vez del working tree

```bash
git grep -n --cached "newConfigKey"
```

Por defecto, `git grep` busca rutas rastreadas en el working tree. `--cached` busca los blobs en el índice: la versión staged.

Eso es útil en pre-commit checks, review scripts o cualquier momento en que quieras preguntar: "¿Qué tengo exactamente staged?" en vez de "¿Qué está ahora mismo en el disco?"

### 10. Busca archivos untracked, teniendo en cuenta las ignore rules

```bash
git grep -n --untracked "draftFlag"
```

`--untracked` añade archivos untracked a la búsqueda. En este modo se respetan las ignore rules estándar de Git, así que los archivos ignored siguen quedando fuera del resultado.

Si de verdad quieres también los archivos ignored:

```bash
git grep -n --untracked --no-exclude-standard "draftFlag"
```

Eso es un movimiento deliberado. Lo uso cuando sospecho que un generated file, una fixture local o un artifact ignored contiene lo que estoy persiguiendo.

### 11. Busca en otra branch, tag o commit antiguo sin checkout

```bash
git grep -n "validateUser" main
git grep -n "validateUser" v2.3.0
git grep -n "validateUser" HEAD~20 -- src
```

Esta es la killer feature.

Sin checkout. Sin stash. Sin desvío a otro worktree. Puedes hacerle una pregunta directa a una branch, tag o commit antiguo y quedarte exactamente donde estás.

Cuando un bug report dice "esto funcionaba en el último release", suelo empezar aquí.

### 12. Busca en cada commit solo cuando lo dices en serio

```bash
git rev-list --all | xargs -n 50 git grep -n "validateUser"
```

Esto busca en los commit trees de toda la historia por tandas. En un repository serio puede ser ruidoso, repetitivo y caro, porque el mismo contenido de archivo puede aparecer en muchos commits.

La mayoría de las veces, si tu pregunta real es "¿cuándo apareció o desapareció esta cadena?", `git log` es el mejor compañero:

```bash
git log -S "validateUser" --oneline -- src
git log -G "validate(User|Account)" -p -- src
```

`-S` sirve para cambios en el número de occurrences de una cadena. `-G` sirve para diffs cuyas líneas añadidas o eliminadas coinciden con una regex. Pregunta distinta, herramienta distinta.

## La trampa de `.gitignore`

La frase "`git grep` respeta `.gitignore`" es lo bastante cercana a la verdad como para tentar, y lo bastante equivocada como para morderte.

Por defecto, `git grep` busca archivos rastreados. Un archivo `.gitignore` trata de mantener los archivos untracked como untracked. Los archivos que Git ya rastrea no se vuelven invisibles solo porque una regla de ignore posterior coincida con ellos.

Así que la versión precisa es:

- Por defecto, `git grep` busca tracked paths en el working tree.
- Los archivos ignored-but-untracked no se buscan, porque los archivos untracked no se buscan.
- Los archivos ignored-but-tracked **sí** se buscan, porque están tracked.
- `--untracked` añade archivos untracked, sin dejar de respetar las standard ignore rules.
- `--untracked --no-exclude-standard` incluye también archivos ignored.
- `--no-index` convierte `git grep` en una búsqueda de sistema de archivos desde el directorio actual, incluso fuera de un repo.
- `--no-index --exclude-standard` hace que esa búsqueda de sistema de archivos respete las standard ignore rules de Git.

El caso límite importa en repositories antiguos. Un archivo puede haberse committed primero e ignored después. Si estás cazando una cadena y `git grep` la encuentra en un archivo supuestamente ignored, Git no está confundido. El archivo está tracked.

## Cuándo `rg` es la mejor herramienta

Usa ripgrep cuando quieras filesystem semantics.

```bash
rg "validateUser"
rg -S "validateUser"
rg --hidden "validateUser"
rg --no-ignore "validateUser"
```

`rg` recorre el directory tree. Por defecto respeta `.gitignore`, `.ignore`, `.rgignore`, archivos globales de ignore, reglas de archivos ocultos y salto de archivos binarios. Es muy rápido, muy pulido, y suele ser lo que quiero cuando busco en el working directory tal como existe en el disco.

El trade-off es que `rg` no sabe buscar en `v2.3.0` o `HEAD~20` a menos que hagas checkout de ese tree en alguna parte. La historia de Git no es su mundo.

Así que mi regla general es:

- Usa `git grep` para tracked code y Git objects: branches, tags, commits, staged content.
- Usa `rg` para el live filesystem: archivos untracked, directorios non-Git, experimentos con ignored files y búsquedas amplias de proyecto.

No hay premio por elegir solo uno. Ten ambos en las manos.

## Hoja compacta de referencia

```bash
git grep -n "term"                         # tracked files, with line numbers
git grep -n -F "literal(" -- "*.ts"        # fixed string in TypeScript files
git grep -n -i -w --column "term"          # case-insensitive whole-word search
git grep -n -e "--flag"                    # pattern begins with a dash
git grep -n -E "regex" -- src              # extended regex, limited to src
git grep -l "term"                         # matching file names only
git grep -L "term" -- "*.tsx"              # files that do not contain term
git grep -c "term"                         # match count per file
git grep -n --cached "term"                # staged/index version
git grep -n --untracked "term"             # tracked plus untracked, honoring ignores
git grep -n "term" v1.2.3 -- src           # search a tag without checkout
git log -S "term" --oneline -- src         # find commits that changed occurrence count
```

El poder aburrido de `git grep` es que empieza por el proyecto tal como Git lo entiende. Eso es exactamente lo que quieres más a menudo de lo que crees: no cada archivo del disco, no cada build artifact, no cada experimento local, solo el código que pertenece al repository, más cualquier versión antigua de ese código que puedas nombrar.
