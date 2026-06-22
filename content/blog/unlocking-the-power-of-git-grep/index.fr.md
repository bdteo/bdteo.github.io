---
lang: "fr"
translationOf: "unlocking-the-power-of-git-grep"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "203041318333bf65"
title: "Recettes git grep : chercher dans le code suivi sans fouiller tout le système de fichiers"
date: "2024-11-13"
description: "Une fiche pratique git grep pour chercher dans les fichiers suivis, les branches, les tags, les changements staged et les anciens commits, avec les pièges de .gitignore et le moment où utiliser plutôt ripgrep."
tags: ["git", "git grep", "ripgrep", "recherche de code", "outils développeur", "développement logiciel", "outils en ligne de commande"]
featuredImage: "./images/featured.jpg"
imageCaption: "Un tiroir de catalogue de bibliothèque entrouvert. Une fiche dépasse légèrement - le passage que vous cherchiez."
audioUrl: "/audio/articles/unlocking-the-power-of-git-grep/fr/hqfrgApggtO1785R4Fsn-e91c1167ebfd.m4a"
audioDuration: "13:36"
audioVoice: "Theodore (ElevenLabs French serene)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/unlocking-the-power-of-git-grep.fr.md"
---

La plupart des conseils sur la recherche dans le code commencent par la vitesse. La vitesse compte, mais la vraie raison pour laquelle j’utilise `git grep` est plus simple :

**Il cherche dans le code que Git connaît, pas dans tout le système de fichiers.**

Cela signifie que votre recherche ne part pas se promener dans `node_modules`, `.cache`, `dist`, les rapports de coverage, les dumps locaux, les captures d’écran ou n’importe quel objet temporaire créé pendant un étrange après-midi de debugging. Par défaut, `git grep` part des chemins suivis dans votre working tree Git. Cette seule contrainte rend les résultats plus calmes.

Ce n’est pas un argument contre `rg` / ripgrep. J’utilise `rg` constamment. Mais les deux outils répondent à des questions différentes :

- `git grep` : « Où est ceci dans le code suivi, ou dans une autre branch, tag ou commit ? »
- `rg` : « Où est ceci sur le disque, en respectant mes ignore rules ? »

Une fois cette distinction en place, `git grep` cesse d’être une vieille commande dont vous savez vaguement qu’elle existe et devient une petite habitude très précise.

## Le modèle mental

La forme utile de la commande est :

```bash
git grep [options] <pattern> [<tree-ish>...] [-- <pathspec>...]
```

En clair :

- `<pattern>` est ce que vous cherchez.
- `<tree-ish>` est optionnel : une branch, un tag, un commit ou un autre Git tree à chercher.
- `<pathspec>` est optionnel : les fichiers ou dossiers auxquels limiter la recherche.
- `--` sépare les revisions des paths quand il y a le moindre risque d’ambiguïté.

Par défaut, `git grep` cherche dans les fichiers suivis de votre working tree. Ce n’est pas un index magique de contenu. Il ne lit pas tous les fichiers sous le répertoire courant. Il demande à Git quels chemins appartiennent au projet, puis il cherche dans ces chemins.

C’est pour cela qu’il paraît net.

## Recettes

### 1. Chercher dans le code suivi et afficher les numéros de ligne

```bash
git grep -n "initializeSettings"
```

C’est la version de tous les jours. `-n` affiche les numéros de ligne, ce qui rend la sortie utile dans un terminal, un commentaire de PR ou une note de handoff rapide.

Si vous voulez toujours les numéros de ligne, Git propose une config pour cela :

```bash
git config --global grep.lineNumber true
```

J’ai quand même tendance à taper `-n`, parce que c’est visible et portable dans les snippets.

### 2. Chercher une chaîne littérale, pas une regex

```bash
git grep -n -F "useEffect(" -- "*.js" "*.jsx" "*.ts" "*.tsx"
```

Utilisez `-F` quand le pattern est une chaîne fixe. Les parenthèses, points, crochets et autres caractères qui ressemblent à de la regex sont traités comme du texte ordinaire.

Deux petites habitudes comptent ici :

- Placez les file globs après `--`.
- Mettez les globs entre guillemets pour que votre shell ne les développe pas avant que Git les voie.

C’est la version que je veux quand je connais l’appel de fonction exact, la clé de config, le nom de classe ou le message d’erreur.

### 3. Chercher sans tenir compte de la casse, comme mot entier, avec colonnes

```bash
git grep -n -i -w --column "customer"
```

`-i` ignore la casse. `-w` demande des correspondances sur des mots entiers. `--column` affiche le numéro de colonne de la première correspondance sur la ligne.

C’est agréable quand le terme est assez courant pour rendre la sortie brute bruyante. C’est aussi utile lorsque vous envoyez les résultats vers des integrations d’éditeur ou des quickfix lists.

### 4. Chercher un pattern qui commence par un tiret

```bash
git grep -n -e "--force"
```

Sans `-e`, Git peut lire le pattern comme une autre option de ligne de commande. `-e` dit : « la prochaine chose est un search pattern. » C’est un de ces petits flags dont on n’a pas souvent besoin, mais quand on en a besoin, on en a vraiment besoin.

Vous pouvez aussi passer plusieurs `-e` :

```bash
git grep -n -e "oldBillingFlow" -e "legacyCheckout"
```

Cela cherche l’un ou l’autre pattern.

### 5. Utiliser une regex quand la structure compte

```bash
git grep -n -E "def[[:space:]]+[[:alnum:]_]+\\(" -- "*.py"
```

`-E` active les expressions régulières étendues. Cet exemple cherche des définitions de fonctions Python sans prétendre être un parser.

Pour les questions structurelles plus larges, utilisez les outils du langage. `git grep` est excellent pour trouver des candidats ; ce n’est pas un moteur AST, et cette honnêteté fait partie de ce que j’aime chez lui.

### 6. Limiter la recherche à un path

```bash
git grep -n "FeatureFlag" -- src components
```

Les pathspecs après `--` gardent la recherche focalisée. C’est souvent plus rapide mentalement, pas seulement en calcul. Vous dites à la commande quel genre de réponse vous intéresse.

Vous pouvez aussi exclure des paths :

```bash
git grep -n "logger" -- src ":(exclude)src/generated" ":(exclude)*.snap"
```

Les pathspecs Git sont puissants et un peu étranges. La règle pratique importante est que les filtres de path se placent après `--`, et que les pathspecs d’exclusion comme `:(exclude)...` sont gérés par Git, pas par le shell.

### 7. Lister seulement les fichiers correspondants

```bash
git grep -l "useOldCheckout"
```

`-l` affiche les noms de fichiers au lieu des lignes correspondantes. Utilisez-le quand l’étape suivante est « ouvrir les fichiers » ou « mesurer le blast radius », pas « lire chaque match ».

L’inverse existe aussi :

```bash
git grep -L "use client" -- "src/**/*.tsx"
```

`-L` liste les fichiers suivis qui **ne** contiennent **pas** le pattern. Cela peut être étonnamment pratique pendant des migrations de framework.

### 8. Compter les correspondances par fichier

```bash
git grep -c "TODO"
```

`-c` donne une carte de chaleur rapide. Ce n’est pas une métrique de qualité de code ; s’il vous plaît, n’en faites pas une. Mais c’est utile pour repérer les fichiers où un terme est concentré avant de commencer à éditer.

### 9. Chercher la version staged au lieu du working tree

```bash
git grep -n --cached "newConfigKey"
```

Par défaut, `git grep` cherche dans les chemins suivis du working tree. `--cached` cherche dans les blobs de l’index - la version staged.

C’est utile dans les pre-commit checks, les scripts de review ou chaque fois que vous voulez demander : « Qu’ai-je exactement staged ? » plutôt que « Qu’y a-t-il actuellement sur le disque ? »

### 10. Chercher dans les fichiers untracked, en gardant les ignore rules en tête

```bash
git grep -n --untracked "draftFlag"
```

`--untracked` ajoute les fichiers untracked à la recherche. Dans ce mode, les ignore rules standard de Git sont respectées, donc les fichiers ignorés restent hors du résultat.

Si vous voulez vraiment les fichiers ignorés aussi :

```bash
git grep -n --untracked --no-exclude-standard "draftFlag"
```

C’est un geste délibéré. Je l’utilise quand je soupçonne un fichier generated, une fixture locale ou un artifact ignoré de contenir ce que je traque.

### 11. Chercher une autre branch, un tag ou un ancien commit sans checkout

```bash
git grep -n "validateUser" main
git grep -n "validateUser" v2.3.0
git grep -n "validateUser" HEAD~20 -- src
```

C’est la killer feature.

Pas de checkout. Pas de stash. Pas de détour par un worktree. Vous pouvez poser une question directe à une branch, un tag ou un ancien commit et rester exactement là où vous êtes.

Quand un bug report dit « cela marchait dans le dernier release », je commence généralement ici.

### 12. Chercher dans chaque commit seulement quand vous le pensez vraiment

```bash
git rev-list --all | xargs -n 50 git grep -n "validateUser"
```

Cela cherche dans les commit trees de toute l’histoire, par lots. Sur un repository sérieux, cela peut être bruyant, répétitif et coûteux, parce qu’un même contenu de fichier peut apparaître dans beaucoup de commits.

La plupart du temps, si votre vraie question est « quand cette chaîne est-elle apparue ou disparue ? », `git log` est le meilleur compagnon :

```bash
git log -S "validateUser" --oneline -- src
git log -G "validate(User|Account)" -p -- src
```

`-S` sert aux changements du nombre d’occurrences d’une chaîne. `-G` sert aux diffs dont les lignes ajoutées ou supprimées matchent une regex. Question différente, outil différent.

## Le piège `.gitignore`

La phrase « `git grep` respecte `.gitignore` » est assez proche de la vérité pour être tentante, et assez fausse pour vous mordre.

Par défaut, `git grep` cherche dans les fichiers suivis. Un fichier `.gitignore` sert à garder des fichiers untracked comme untracked. Les fichiers déjà suivis par Git ne deviennent pas invisibles simplement parce qu’une règle d’ignore ultérieure les match.

Voici donc la version précise :

- Par défaut, `git grep` cherche dans les tracked paths du working tree.
- Les fichiers ignored-but-untracked ne sont pas cherchés, parce que les fichiers untracked ne sont pas cherchés.
- Les fichiers ignored-but-tracked **sont** cherchés, parce qu’ils sont tracked.
- `--untracked` ajoute les fichiers untracked tout en respectant les standard ignore rules.
- `--untracked --no-exclude-standard` inclut aussi les fichiers ignored.
- `--no-index` transforme `git grep` en recherche de système de fichiers depuis le répertoire courant, même hors d’un repo.
- `--no-index --exclude-standard` fait respecter les standard ignore rules de Git par cette recherche de système de fichiers.

Le cas limite compte dans les vieux repositories. Un fichier peut être committé d’abord puis ignoré plus tard. Si vous chassez une chaîne et que `git grep` la trouve dans un fichier supposément ignoré, Git n’est pas confus. Le fichier est tracked.

## Quand `rg` est le meilleur outil

Utilisez ripgrep quand vous voulez des semantics de système de fichiers.

```bash
rg "validateUser"
rg -S "validateUser"
rg --hidden "validateUser"
rg --no-ignore "validateUser"
```

`rg` parcourt l’arborescence de dossiers. Par défaut, il respecte `.gitignore`, `.ignore`, `.rgignore`, les fichiers globaux d’ignore, les règles de fichiers cachés et l’évitement des fichiers binaires. Il est très rapide, très poli, et c’est généralement ce que je veux quand je cherche dans le working directory tel qu’il existe sur le disque.

Le trade-off est que `rg` ne sait pas chercher dans `v2.3.0` ou `HEAD~20` à moins que vous ne fassiez checkout de cet arbre quelque part. L’historique Git n’est pas son monde.

Donc ma règle pratique est :

- Utilisez `git grep` pour le code tracked et les Git objects : branches, tags, commits, staged content.
- Utilisez `rg` pour le live filesystem : fichiers untracked, dossiers non-Git, expériences sur fichiers ignored et large project search.

Il n’y a pas de prix pour n’en choisir qu’un. Gardez les deux en main.

## Fiche compacte

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

La puissance ennuyeuse de `git grep`, c’est qu’il commence par le projet tel que Git le comprend. C’est exactement ce que vous voulez plus souvent que vous ne le pensez : pas chaque fichier sur le disque, pas chaque build artifact, pas chaque expérience locale - seulement le code qui appartient au repository, plus toute ancienne version de ce code que vous pouvez nommer.
