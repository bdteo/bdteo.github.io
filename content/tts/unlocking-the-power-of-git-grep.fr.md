Recettes git grep : chercher dans le code suivi sans fouiller tout le système de fichiers

[conversational tone] La plupart des conseils sur la recherche dans le code commencent par la vitesse. La vitesse compte, mais la vraie raison pour laquelle j'utilise git grep est plus simple :

Il cherche dans le code que Git connaît, pas dans tout le système de fichiers.

Cela signifie que votre recherche ne part pas se promener dans node underscore modules, dot cache, dist, les rapports de coverage, les dumps locaux, les captures d'écran ou n'importe quel objet temporaire créé pendant un étrange après-midi de debugging. Par défaut, git grep part des chemins suivis dans votre working tree Git. Cette seule contrainte rend les résultats plus calmes.

Ce n'est pas un argument contre rg, ou ripgrep. J'utilise rg constamment. Mais les deux outils répondent à des questions différentes.

Git grep demande : où est ceci dans le code suivi, ou dans une autre branch, tag ou commit ?

Ripgrep demande : où est ceci sur le disque, en respectant mes ignore rules ?

Une fois cette distinction en place, git grep cesse d'être une vieille commande dont vous savez vaguement qu'elle existe et devient une petite habitude très précise.

[matter-of-fact] Le modèle mental est petit. La forme utile est : git grep, puis les options, puis le pattern, puis les valeurs tree-ish optionnelles, puis un double tiret et les pathspecs optionnels.

Le pattern est ce que vous cherchez.

Un tree-ish est optionnel : une branch, un tag, un commit ou un autre Git tree à chercher.

Un pathspec est optionnel : les fichiers ou dossiers auxquels limiter la recherche.

Le double tiret sépare les revisions des paths quand il y a le moindre risque d'ambiguïté.

Par défaut, git grep cherche dans les fichiers suivis de votre working tree. Ce n'est pas un index magique de contenu. Il ne lit pas tous les fichiers sous le répertoire courant. Il demande à Git quels chemins appartiennent au projet, puis il cherche dans ces chemins.

C'est pour cela qu'il paraît net.

[deliberate] Première recette : chercher dans le code suivi et afficher les numéros de ligne.

Lancez git grep tiret n initializeSettings.

Le flag tiret n affiche les numéros de ligne. Cela rend la sortie utile dans un terminal, un commentaire de pull request ou une note de handoff rapide. Git peut être configuré pour afficher les numéros de ligne par défaut, mais j'ai quand même tendance à taper tiret n, parce que c'est visible et portable dans les snippets.

Deuxième recette : chercher une chaîne littérale, pas une expression régulière.

Utilisez tiret F majuscule quand le pattern est une chaîne fixe. Par exemple, pour chercher useEffect, parenthèse ouvrante, dans des fichiers JavaScript et TypeScript, combinez git grep tiret n, tiret F majuscule, le texte littéral, puis un double tiret et les file globs entre guillemets.

L'habitude importante est celle-ci : placez les file globs après le double tiret, et mettez-les entre guillemets pour que votre shell ne les développe pas avant que Git les voie.

C'est la version que je veux quand je connais l'appel de fonction exact, la clé de config, le nom de classe ou le message d'erreur.

Troisième recette : chercher sans tenir compte de la casse, comme mot entier, avec colonnes.

Lancez git grep tiret n, tiret i, tiret w, double tiret column, customer.

Tiret i ignore la casse. Tiret w demande des correspondances sur des mots entiers. Double tiret column affiche le numéro de colonne de la première correspondance sur la ligne. C'est agréable quand le terme est assez courant pour rendre la sortie brute bruyante.

Quatrième recette : chercher un pattern qui commence par un tiret.

Lancez git grep tiret n, tiret e, double tiret force.

Sans tiret e, Git peut lire le pattern comme une autre option de ligne de commande. Tiret e dit : la prochaine chose est un search pattern. C'est un de ces petits flags dont on n'a pas souvent besoin, mais quand on en a besoin, on en a vraiment besoin.

Vous pouvez aussi passer plusieurs tiret e. Chercher oldBillingFlow et legacyCheckout comme cela signifie que l'un ou l'autre pattern peut matcher.

[matter-of-fact] Cinquième recette : utiliser une expression régulière quand la structure compte.

Tiret E majuscule active les expressions régulières étendues. Un exemple pratique consiste à chercher des définitions de fonctions Python avec un pattern qui signifie : def, puis whitespace, puis un nom de fonction, puis une parenthèse ouvrante.

Pour les questions structurelles plus larges, utilisez les outils du langage. Git grep est excellent pour trouver des candidats. Ce n'est pas un moteur d'arbre syntaxique abstrait, et cette honnêteté fait partie de ce que j'aime chez lui.

Sixième recette : limiter la recherche à un path.

Lancez git grep tiret n FeatureFlag, double tiret, src, components.

Les pathspecs après le double tiret gardent la recherche focalisée. C'est souvent plus rapide mentalement, pas seulement en calcul. Vous dites à la commande quel genre de réponse vous intéresse.

Vous pouvez aussi exclure des paths avec le pathspec d'exclusion de Git. La règle pratique importante est que les filtres de path se placent après le double tiret, et que les pathspecs d'exclusion sont gérés par Git, pas par le shell.

Septième recette : lister seulement les fichiers correspondants.

Utilisez tiret l quand l'étape suivante est ouvrir les fichiers, ou mesurer le blast radius, pas lire chaque match.

L'inverse est tiret L majuscule. Il liste les fichiers suivis qui ne contiennent pas le pattern. Cela peut être étonnamment pratique pendant des migrations de framework.

Huitième recette : compter les correspondances par fichier.

Utilisez tiret c pour une carte de chaleur rapide. Ce n'est pas une métrique de qualité de code ; s'il vous plaît, n'en faites pas une. Mais c'est utile pour repérer les fichiers où un terme est concentré avant de commencer à éditer.

[deliberate] Neuvième recette : chercher la version staged au lieu du working tree.

Lancez git grep tiret n, double tiret cached, newConfigKey.

Par défaut, git grep cherche dans les chemins suivis du working tree. Double tiret cached cherche dans les blobs de l'index : la version staged.

C'est utile dans les pre-commit checks, les scripts de review ou chaque fois que vous voulez demander : qu'ai-je exactement staged, plutôt que : qu'y a-t-il actuellement sur le disque ?

Dixième recette : chercher dans les fichiers untracked, en gardant les ignore rules en tête.

Lancez git grep tiret n, double tiret untracked, draftFlag.

Double tiret untracked ajoute les fichiers untracked à la recherche. Dans ce mode, les ignore rules standard de Git sont respectées, donc les fichiers ignored restent hors du résultat.

Si vous voulez vraiment les fichiers ignored aussi, ajoutez double tiret no exclude standard. C'est un geste délibéré. Je l'utilise quand je soupçonne un fichier generated, une fixture locale ou un artifact ignoré de contenir ce que je traque.

Onzième recette : chercher une autre branch, un tag ou un ancien commit sans checkout.

Lancez git grep tiret n validateUser main.

Ou lancez-le contre la version deux point trois point zéro.

Ou lancez-le contre H E A D tilde vingt, limité à src.

C'est la killer feature.

Pas de checkout. Pas de stash. Pas de détour par un worktree. Vous pouvez poser une question directe à une branch, un tag ou un ancien commit et rester exactement là où vous êtes.

Quand un bug report dit, cela marchait dans le dernier release, je commence généralement ici.

Douzième recette : chercher dans chaque commit seulement quand vous le pensez vraiment.

La forme approximative est : git rev-list double tiret all, envoyé par pipe vers xargs tiret n cinquante, puis git grep tiret n validateUser.

Cela cherche dans les commit trees de toute l'histoire, par lots. Sur un repository sérieux, cela peut être bruyant, répétitif et coûteux, parce qu'un même contenu de fichier peut apparaître dans beaucoup de commits.

La plupart du temps, si votre vraie question est : quand cette chaîne est-elle apparue ou disparue, git log est le meilleur compagnon.

Utilisez git log tiret S majuscule quand vous vous intéressez aux changements du nombre d'occurrences d'une chaîne.

Utilisez git log tiret G majuscule, avec tiret p, quand vous vous intéressez aux diffs dont les lignes ajoutées ou supprimées matchent une expression régulière.

Question différente, outil différent.

[calm] Maintenant, le piège dot gitignore.

La phrase, git grep respecte dot gitignore, est assez proche de la vérité pour être tentante, et assez fausse pour vous mordre.

Par défaut, git grep cherche dans les fichiers suivis. Un fichier dot gitignore sert à garder des fichiers untracked comme untracked. Les fichiers déjà suivis par Git ne deviennent pas invisibles simplement parce qu'une règle d'ignore ultérieure les match.

Voici donc la version précise :

Par défaut, git grep cherche dans les tracked paths du working tree.

Les fichiers ignored-but-untracked ne sont pas cherchés, parce que les fichiers untracked ne sont pas cherchés.

Les fichiers ignored-but-tracked sont cherchés, parce qu'ils sont tracked.

Double tiret untracked ajoute les fichiers untracked tout en respectant les standard ignore rules.

Double tiret untracked plus double tiret no exclude standard inclut aussi les fichiers ignored.

Double tiret no index transforme git grep en recherche de système de fichiers depuis le répertoire courant, même hors d'un repository.

Double tiret no index plus double tiret exclude standard fait respecter les standard ignore rules de Git par cette recherche de système de fichiers.

Le cas limite compte dans les vieux repositories. Un fichier peut être committé d'abord puis ignoré plus tard. Si vous chassez une chaîne et que git grep la trouve dans un fichier supposément ignored, Git n'est pas confus. Le fichier est tracked.

[conversational tone] Alors, quand rg est-il le meilleur outil ?

Utilisez ripgrep quand vous voulez des semantics de système de fichiers.

Lancez rg validateUser pour la recherche normale. Ajoutez S majuscule pour smart case. Ajoutez double tiret hidden quand vous voulez aussi les dotfiles. Ajoutez double tiret no ignore quand vous voulez aussi les fichiers ignored.

Ripgrep parcourt l'arborescence de dossiers. Par défaut, il respecte dot gitignore, dot ignore, dot rgignore, les fichiers globaux d'ignore, les règles de fichiers cachés et l'évitement des fichiers binaires. Il est très rapide, très poli, et c'est généralement ce que je veux quand je cherche dans le working directory tel qu'il existe sur le disque.

Le trade-off est que rg ne sait pas chercher dans la version deux point trois point zéro ou H E A D tilde vingt à moins que vous ne fassiez checkout de cet arbre quelque part. L'historique Git n'est pas son monde.

Donc ma règle pratique est simple.

Utilisez git grep pour le code tracked et les Git objects : branches, tags, commits, staged content.

Utilisez rg pour le live filesystem : fichiers untracked, dossiers non-Git, expériences sur fichiers ignored et large project search.

Il n'y a pas de prix pour n'en choisir qu'un. Gardez les deux en main.

[matter-of-fact] La version compacte :

Utilisez git grep tiret n pour les fichiers tracked avec numéros de ligne.

Utilisez tiret F majuscule pour les chaînes littérales.

Utilisez tiret i, tiret w et double tiret column quand il vous faut des correspondances whole-word case-insensitive avec colonnes.

Utilisez tiret e quand le search pattern commence par un tiret.

Utilisez tiret E majuscule pour une expression régulière étendue.

Utilisez tiret l pour les noms de fichiers correspondants, et tiret L majuscule pour les fichiers qui ne contiennent pas le terme.

Utilisez tiret c pour les comptes.

Utilisez double tiret cached pour la version staged.

Utilisez double tiret untracked quand les fichiers untracked comptent.

Nommez une branch, un tag ou un commit quand vous voulez chercher dans un ancien Git tree sans checkout.

Et utilisez git log tiret S majuscule quand la vraie question n'est pas où est cette chaîne, mais quand son nombre d'occurrences a changé.

[reflective] La puissance ennuyeuse de git grep, c'est qu'il commence par le projet tel que Git le comprend.

C'est exactement ce que vous voulez plus souvent que vous ne le pensez : pas chaque fichier sur le disque, pas chaque build artifact, pas chaque expérience locale. Seulement le code qui appartient au repository, plus toute ancienne version de ce code que vous pouvez nommer.

Utilisez git grep quand la question est : où dans ce codebase, y compris dans son historique ?

Utilisez ripgrep quand la question est : où sur le disque, en respectant mes ignore rules ?

La plupart des jours, vous voudrez les deux à portée de main.
