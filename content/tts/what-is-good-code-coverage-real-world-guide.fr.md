[conversational tone] Qu’est-ce qu’une bonne couverture de code ? Un guide fondé sur le risque.

Une bonne couverture de code, ce n’est pas quatre-vingts pour cent. Ce n’est pas quatre-vingt-dix pour cent. Ce n’est pas l’auréole sacrée d’un dashboard qui affiche cent pour cent.

Une bonne couverture de code veut dire ceci : les parties du système qui feraient le plus mal si elles cassaient sont couvertes par des tests qui échoueraient réellement si ces parties étaient fausses.

Voilà toute l’astuce. Le pourcentage est utile, mais seulement après avoir compris quel type de code on regarde, à quelle fréquence il change, qui souffre en cas de bug, et si les tests font de vraies assertions ou se promènent simplement dans le code avec une lanterne.

[reflective] Je regarde encore le chiffre. J’aime les chiffres. Ils savent rendre visible une anxiété floue. Mais je ne demande plus : "est-ce que quatre-vingt-deux pour cent est bon ?" en isolation. Je pose une meilleure question : quel risque reste découvert, et sommes-nous à l’aise avec l’idée de livrer ce risque ?

Cette question fonctionne pour les ingénieurs qui écrivent des tests, les leads qui fixent des barres de qualité, et les reviewers qui essaient de décider si une P R peut être mergée sans trembler.

[matter-of-fact] La réponse courte est celle-ci.

Pour les core domain rules, l’argent, les permissions, la sécurité et les chemins de perte de données, visez quatre-vingt-dix à cent pour cent de line et branch coverage significatives. Un petit bug peut devenir coûteux, embarrassant ou irréversible.

Pour les public libraries, les S D K et les reusable packages, visez quatre-vingt-dix pour cent ou plus, avec des edge cases et des compatibility tests. Vos utilisateurs ne peuvent pas inspecter votre intention. L’A P I est le produit.

Pour le code applicatif SaaS normal, soixante-dix à quatre-vingt-cinq pour cent overall peut être sain, avec une couverture plus haute sur les modules risqués. La plupart des équipes obtiennent ici une forte valeur sans transformer les tests en théâtre.

Pour les legacy systems sous cinquante pour cent, ne courez pas après le chiffre global d’abord. Couvrez le code modifié et les flows dangereux avant d’essayer de réparer le dashboard.

Et pour le generated code, le framework glue, le debug logging et les trivial wrappers, une exclusion ou un léger smoke testing est souvent très bien. La couverture ici peut être bruyante et coûteuse sans réduire beaucoup le risque.

Ce ne sont pas des chiffres religieux. Ce sont des valeurs par défaut que je m’attendrais à voir une équipe contester.

Les recommandations de test de Google disent qu’il n’existe pas de chiffre idéal universel, et replacent la couverture autour du business impact, de la change frequency, de l’expected lifetime, de la complexity et du domain risk. Martin Fowler formule le même point plus profond sous un autre angle : la couverture aide à trouver du code non testé, mais c’est une mauvaise déclaration autonome sur la qualité des tests.

[deliberate] C’est aussi mon expérience. Une faible couverture est une alarme incendie. Une forte couverture n’est pas une garantie.

La couverture excelle à montrer l’absence.

Elle peut vous dire qu’un fichier n’est jamais exercé par des tests automatisés. Qu’une error branch n’a jamais tourné en C I. Qu’une nouvelle payment rule a été mergée sans qu’un test la touche. Qu’un refactor a supprimé un behavior qu’aucun test n’a remarqué. Qu’un repository contient des quartiers entiers où les bugs peuvent vivre sans payer de loyer.

C’est déjà précieux. L’article de Google sur la code coverage chez Google a trouvé que la couverture était la plus actionable quand elle apparaissait au niveau des changesets et de la code review. J’aime ce cadrage : la couverture doit rester près du diff, là où un humain peut demander : "cette ligne découverte compte-t-elle ?"

La couverture est moins utile comme score de santé pour dirigeants. Un manager qui voit quatre-vingt-huit pour cent ne peut pas savoir si les douze pour cent manquants sont du debug output inutilisé ou le refund path qui décide si les clients récupèrent leur argent.

[matter-of-fact] Une ligne couverte n’est pas forcément un comportement testé.

La couverture ne peut pas prouver que les assertions sont significatives. Elle ne peut pas prouver que les test data ressemblent à la production. Elle ne peut pas prouver que l’unhappy path est vérifié, et pas seulement exécuté. Elle ne peut pas prouver que l’U I est utilisable, que la query est assez rapide, que le feature flag est configuré correctement, que le concurrent case fonctionne, que les mocks sont honnêtes, ou que le code est assez simple à maintenir.

Vous pouvez obtenir cent pour cent de line coverage avec des tests qui appellent des fonctions et n’assertent presque rien. Vous pouvez aussi obtenir une forte couverture avec des end-to-end tests qui traversent beaucoup de code par accident tout en vérifiant à peine les décisions importantes.

C’est pour cela qu’un coverage gate ne devrait jamais être le seul quality gate. Associez-le à la review, aux production incidents, aux property ou fuzz tests quand ils conviennent, aux contract tests autour des integrations, et au mutation testing sur le code où la correctness compte vraiment.

[conversational tone] Quand je review une P R, je ne demande pas des tests parce que "nous avons besoin de coverage." Je les demande parce qu’un behavior a changé et que je veux une preuve que ce behavior est protégé.

Ma checklist est courte.

Premièrement : qu’est-ce qui peut mal tourner ? Nommez le failure mode avant d’écrire le test.

Deuxièmement : qui paie l’addition ? User, support team, finance, security, data integrity, future developer ?

Troisièmement : à quelle fréquence ce code changera-t-il ? Le code souvent touché mérite plus de tests, parce qu’il sera cassé plus souvent.

Quatrièmement : un test peut-il attraper l’échec à bas coût ? Si oui, écrivez-le. Sinon, envisagez monitoring, manual Q A, static analysis, ou une simplification du design.

Cinquièmement : le test échouerait-il pour le bug que nous craignons ? Sinon, c’est probablement du coverage cosplay.

[deliberate] Le dernier point est le plus important. Un test qui n’échoue pas quand le code est faux n’est pas un safety net. C’est un décor de scène.

Si un projet a une faible couverture et que tout le monde débat de la cible, arrêtez le débat pendant un après-midi et écrivez les tests dans cet ordre.

D’abord, l’argent, les permissions et les actions irréversibles. Payments, refunds, billing periods, subscription state, authorization, destructive deletion, email sends, data imports, migrations, et tout ce qui modifie des données appartenant aux clients.

Pour une app SaaS, je préfère quatre-vingt-quinze pour cent de coverage sur les subscription transitions et cinquante-cinq pour cent overall plutôt que quatre-vingts pour cent overall avec une billing state machine presque nue.

Ensuite, les business rules que les gens expliquent avec "except when." Ce sont d’excellents tests, parce que l’étrangeté est déjà dans la langue.

Par exemple : "A trial can be extended once, except when the account has already paid, unless it was migrated from the legacy plan."

Cette phrase veut des tests. Plusieurs.

Troisième zone : parsers, serializers, mappers et importers.

La couverture rapporte très bien partout où la forme des données compte : C S V imports, webhook payloads, date parsing, currency conversion, address normalization, search indexing, Open Graph extraction, tout cela.

Ces tests sont souvent peu coûteux, stables, et pleins d’edge cases. Vous obtenez une bonne protection sans avoir besoin d’un browser, d’un queue worker et de la moitié de la lune.

[matter-of-fact] Quatrième zone : le code avec branching logic.

La line coverage cache les décisions manquées. La branch coverage est meilleure pour les conditionals parce qu’elle demande si les deux côtés d’une décision ont tourné.

La documentation de coverage point P Y sur la branch coverage montre le piège classique : la statement coverage peut marquer une fonction comme couverte même quand un if n’a jamais été évalué dans les deux sens.

En P H P, PHPUnit documente séparément la line, branch et path coverage, la branch coverage vérifiant si les control structures ont été évaluées à la fois en true et en false. Le piège est le coût de l’outillage : P C O V est rapide pour la line coverage, tandis que Xdebug est nécessaire pour la branch et path coverage. Utilisez le signal plus lourd là où la logique le mérite.

Cinquième zone : les bugs déjà arrivés.

Chaque production bug est une idée de test gratuite. Pas toujours un unit test, mais au moins un regression test quelque part.

Quand un bug s’échappe, j’aime cette petite question de postmortem : quel test aurait échoué si nous l’avions écrit hier ?

Si la réponse est simple, écrivez ce test avant de passer à autre chose.

[conversational tone] Ignorer du code n’est pas tricher quand l’équipe est d’accord sur la raison.

Les bons candidats incluent generated code, framework bootstrap files, one-line configuration wrappers, debug-only logging, defensive branches impossibles dans le runtime actuel, code qu’il vaut mieux supprimer que tester, et integration glue déjà couvert par un higher-level smoke test.

Les mauvais candidats incluent business logic "too hard to test", vieux code que tout le monde a peur de toucher, payment, auth, import ou permission paths, branches qui semblent impossibles seulement parce que personne n’a vérifié les production data, et code derrière un feature flag mais déjà reachable par les customers.

Ma règle : si nous excluons quelque chose de la couverture, la raison doit être ennuyeuse et défendable en review. "Generated by Open A P I" est ennuyeux. "Nous n’avions pas envie de tester checkout" ne l’est pas.

[matter-of-fact] Les exemples aident.

La plupart des CRUD apps n’ont pas besoin d’une couverture héroïque sur chaque controller branch. Elles ont besoin d’une forte couverture sur permissions, validation, state transitions, background jobs, billing, imports, exports, et tout ce qui peut corrompre des customer data.

Une forme saine pourrait être une forte unit coverage sur les domain services et policies, des integration tests pour les A P I endpoints importants, quelques end-to-end smoke tests pour signup, checkout, core workflow et cancellation, et des coverage gates sur le changed code, pas une demande soudaine de faire passer toute la legacy app à quatre-vingt-dix pour cent.

Pour le frontend work, la line coverage peut vite devenir absurde si vous poursuivez chaque rendering detail. Je me soucie davantage des user-visible states : loading, empty, error, success ; disabled et permission-gated actions ; optimistic updates et rollback ; forms avec validation et server errors ; accessibility-critical behavior comme focus, labels et keyboard paths.

La nuance exacte d’une bordure décorative n’a pas besoin d’un unit test. Le confirmation flow "delete account", lui, en a besoin.

Pour une public library ou un S D K, montez la barre. Vos edge cases sont la production outage de quelqu’un d’autre.

Testez l’A P I documentée, pas seulement les internals. Incluez compatibility cases, invalid input, error messages, serialization, version boundaries, et les examples copiés du README. Si un user peut le coller, cela devrait probablement être testé.

Pour une data pipeline ou un import system, la couverture devrait pencher vers fixtures et invariants : malformed rows, missing fields, duplicate I D values, timezone edges, retry et idempotency behavior, partial failure handling, et totals du type "this must never decrease."

Ici, soixante-quinze pour cent de line coverage avec d’excellentes fixtures peut battre quatre-vingt-quinze pour cent de coverage qui ne teste que le happy path.

Pour Terraform, deployment scripts, queue workers et one-off operational tools, la meilleure couverture n’est peut-être pas un pourcentage d’unit tests. Ce peut être un dry-run mode, shellcheck, static checks, staged rollout, idempotency tests et un logging très clair.

[emphasized] Mais si un script calcule quelles database rows supprimer, testez ce calcul comme s’il vous devait de l’argent.

La global coverage s’améliore lentement et se game facilement. La diff coverage est l’endroit où les équipes progressent réellement.

Pour le code nouveau ou modifié, j’aime une règle plus stricte.

Le changed risky code devrait être couvert autour de quatre-vingt-dix pour cent ou plus. Le changed trivial code peut être plus bas si le reviewer peut expliquer pourquoi. L’overall project coverage ne devrait pas baisser sans raison explicite. Les legacy files devraient devenir un peu plus propres chaque fois qu’on les touche.

C’est la version pratique de la boy-scout rule : ne demandez pas à une équipe de corriger cinq ans de tests manquants avant de merger une petite amélioration, mais ne laissez pas cette petite amélioration creuser le trou.

Jest prend en charge les thresholds globally, by glob, directory ou file, y compris des thresholds séparés pour branches, functions, lines et statements.

Un projet TypeScript pourrait activer la couverture, fixer des thresholds globaux autour de soixante-dix pour branches, soixante-quinze pour functions, et quatre-vingts pour lines et statements, puis fixer le directory billing à quatre-vingt-dix partout.

Les chiffres exacts comptent moins que la forme : le directory risqué a une barre plus haute que le reste de l’app.

Pour un projet P H P, je veux généralement une line coverage rapide localement et une branch ou path coverage plus profonde seulement là où elle mérite son coût. La documentation actuelle de PHPUnit sur la couverture dit explicitement que la branch et path coverage nécessitent Xdebug, tandis que P C O V prend en charge la line coverage. C’est un trade-off, pas une faute morale.

[deliberate] Le fast feedback gagne pendant le développement normal. Une couverture plus profonde appartient à la C I ou à des targeted checks quand la logique est gnarly.

La line coverage demande : cette ligne a-t-elle tourné ?

La branch coverage demande : chaque décision est-elle passée dans les deux sens ?

La deuxième question est généralement plus proche de ce que nous voulons dire par "testé." Mais la branch coverage peut quand même devenir bruyante. Certaines branches sont defensive. Certaines sont des artifacts of transpilation. Certaines sont technically possible mais irrelevant. Certaines coûtent cher à forcer dans un test pour très peu de valeur.

Donc oui, utilisez la branch coverage pour le decision-heavy code. Ne remplacez simplement pas une idole grossière par une autre.

[conversational tone] Le mutation testing modifie votre code par petites touches et vérifie si vos tests échouent.

Par exemple, il peut changer greater than en greater than or equal, true en false, ou plus en minus.

Si les tests passent encore, le mutant a survécu. C’est une insulte utile de la machine.

Cela attrape le mensonge classique de la couverture : "la ligne a tourné, mais personne n’a asserted le behavior." La documentation P H P d’Infection montre exactement ce type d’écart avec des metrics séparées de mutation score et de covered-code mutation score. En JavaScript, Stryker joue un rôle similaire. Dans le monde J V M, PIT est le nom familier.

Je ne lancerais pas le mutation testing partout au premier jour. Il peut être lent et bruyant. Je le lancerais sur billing rules, permission checks, validators, calculators, parsers, code qui a une forte coverage mais continue à produire des bugs, et libraries où l’A P I behavior est le produit.

Le mutation testing ne remplace pas la couverture. C’est la question que vous posez après que la couverture a dit : "oui, les tests ont touché ceci." Le mutation tool demande : "cool, but did they care?"

[matter-of-fact] Si je mettais cela en place pour une équipe aujourd’hui, j’écrirais la policy comme ceci.

La coverage est revue sur le diff. Les uncovered changed lines doivent être soit testées, soit expliquées.

Les risky modules reçoivent des thresholds explicites. Billing, permissions, data integrity et core domain logic ont des barres plus hautes.

La global coverage ne peut pas baisser silencieusement. Les petites baisses demandent une raison ; les grandes baisses bloquent le merge.

Le generated et framework code peut être excluded. L’exclusion doit être évidente et documentée.

La branch coverage est requise pour le decision-heavy code, surtout les state machines et les conditionals importants.

Le mutation testing est targeted. Utilisez-le là où une forte coverage n’inspire toujours pas confiance.

Les escaped bugs deviennent des regression tests. Pas toujours immédiatement, pas toujours au même layer, mais délibérément.

Cette policy est plus stricte que "quatre-vingts pour cent or else" et plus douce que "cent pour cent or shame." Plus important encore, elle donne une règle de décision aux reviewers.

[conversational tone] En review de P R, je préfère laisser ce comment : "This changes the refund eligibility rule, but the uncovered branch is the trial was extended case. Can we add a regression test for that state?"

Plutôt que ceci : "Coverage is seventy-eight point three percent. Please improve."

Le premier comment parle de risque. Le second parle de météo.

Si vous lead une équipe, ne weaponizez pas la couverture. Les gens optimiseront ce que vous mettez au scoreboard. Si le scoreboard dit "hit quatre-vingt-cinq pour cent", vous risquez d’obtenir des shallow tests qui atteignent quatre-vingt-cinq pour cent.

Utilisez la couverture pour lancer de meilleures conversations.

Pourquoi ce hot file est-il uncovered ? Pourquoi les production bugs se concentrent-ils dans des modules avec une "good" coverage ? Nos tests assertent-ils des outcomes ou seulement des snapshots ? Les integration tests cachent-ils une missing unit coverage ? Les slow tests poussent-ils les gens à éviter de lancer la suite ? Ce code est-il hard to test parce que le design est muddy ?

Le cadeau caché de la couverture n’est pas le pourcentage. C’est la manière dont le code découvert pointe vers le design, l’ownership et le risque.

[deliberate] Alors, qu’est-ce qu’une bonne couverture de code ?

Une bonne couverture de code est une couverture suffisante pour qu’une erreur importante ait de fortes chances de faire mal en C I avant de faire mal à un user.

Pour une product team typique, cela veut souvent dire soixante-dix à quatre-vingt-cinq pour cent d’overall coverage ; quatre-vingt-dix pour cent ou plus sur la critical business logic ; branch coverage sur les important decisions ; diff coverage pour le changed code ; mutation testing là où la correctness compte ; et intentional exclusions pour le code qui ne mérite pas la cérémonie.

Mais la vraie réponse reste fondée sur le risque.

Couvrez le code qui peut vous blesser. Couvrez le code que vous changez souvent. Couvrez le behavior que vous avez promis. Ignorez le chiffre seulement après avoir compris ce qu’il essaie de vous signaler.

Le dashboard peut être green et mentir quand même. Le travail utile consiste à rendre plus difficile pour le produit de mentir à vos utilisateurs.
