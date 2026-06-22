Représentations discrètes en RL : pourquoi les ingénieurs devraient s'en soucier

[conversational tone] Un système d'IA ne voit jamais "le monde". Il voit la représentation que nous lui donnons.

Cela ressemble à un détail de recherche, jusqu'au jour où cela vous rattrape en production. Votre agent reçoit une capture d'écran de navigateur, mais la policy n'agit pas directement sur les pixels. Votre LLM reçoit du texte, mais le modèle ne lit pas les mots comme vous les lisez. Votre robot enregistre des valeurs continues de capteurs, mais son planner a besoin de quelque chose d'assez stable pour comparer, mémoriser, prédire et s'améliorer.

La question d'ingénierie est directe : laissez-vous le modèle vivre dans une soupe continue de décimales, ou forcez-vous certaines parties de son monde à entrer dans un ensemble fini de symboles, de buckets, de tokens, de catégories ou de codebook entries ?

Voilà la forme pratique de la question des représentations discrètes.

Le sujet a d'abord attiré mon attention grâce au travail d'Edan Meyer sur l'apprentissage par renforcement, en particulier l'article Harnessing Discrete Representations for Continual Reinforcement Learning, publié ensuite dans le Reinforcement Learning Journal. L'article est technique, mais la leçon est merveilleusement utilisable : parfois, un modèle apprend plus vite, s'adapte mieux et construit un meilleur world model lorsqu'il doit décrire ses observations avec un petit vocabulaire d'états possibles.

Cette idée n'est pas enfermée dans la RL. Elle rime avec la tokenization des LLM, la vector quantization des modèles génératifs, les learned codebooks de la compression, et la manière dont les agent systems ont de plus en plus besoin d'un état interne compact plutôt que d'un contexte brut sans fin.

Pour un ingénieur en activité, le point est celui-ci : la représentation n'est pas seulement une étape de preprocessing. C'est l'endroit où vous décidez quels types d'erreurs votre système a le droit de faire.

[matter-of-fact] Une représentation continue dit : cette chose est un point dans un espace lisse.

Une représentation discrète dit : cette chose appartient à un ou plusieurs choix nommés dans un ensemble fini.

Aucune n'est automatiquement meilleure. Un vecteur continu est expressif. Il peut porter des gradients, des nuances, des interpolations et des détails fins. C'est pour cela que les embeddings sont si utiles. Mais les espaces continus peuvent aussi être pâteux. De minuscules changements numériques peuvent vouloir dire quelque chose, ou rien du tout. Des vecteurs qui se ressemblent peuvent cacher des situations causales différentes. Un modèle en aval doit apprendre non seulement ce qui compte, mais aussi où se trouvent les frontières.

Une représentation discrète trace des frontières.

Elle transforme la question "quel vecteur réel exact vient ensuite ?" en quelque chose de plus proche de "quel état, token ou code vient ensuite ?" Cela change le problème d'apprentissage. La prédiction peut devenir une classification plutôt qu'une régression. La mémoire peut devenir suffisamment symbolique pour être réutilisée. La compression devient explicite. Un planner peut raisonner sur un ensemble plus petit de possibilités.

C'est pourquoi un modèle de langage ne travaille pas sur des essais Unicode bruts comme un flux indifférencié. Il travaille sur des token IDs. C'est pourquoi SentencePiece et les tokenizers de style byte-pair comptent. C'est pourquoi VQ-VAE était intéressant : il montrait que des learned discrete codes pouvaient former un bottleneck puissant pour les images, l'audio et la parole. Et c'est pourquoi la RL avec world models revient sans cesse aux categorical latents et aux codebooks.

Le modèle n'apprend pas seulement une tâche. Il apprend un vocabulaire pour la tâche.

[deliberate] Imaginez un agent qui apprend à jouer à un jeu simple à partir d'observations d'écran.

Un état latent continu pourrait encoder l'écran sous forme d'une liste de décimales : zéro virgule treize, moins zéro virgule soixante-douze, un virgule quatre-vingt-quatre, zéro virgule zéro quatre, et ainsi de suite.

Ce vecteur peut représenter beaucoup de choses. Mais si l'agent essaie d'apprendre les transitions, le modèle doit prédire comment toutes ces valeurs floating-point changent après une action. Il est facile de gaspiller de la capacité sur des détails sans importance : un pixel qui clignote, une frame d'animation légèrement différente, un changement de couleur, un peu de bruit visuel.

Un état latent discret pourrait plutôt encoder la même situation ainsi : room trois, enemy state alert, key status missing, health bucket low.

Ou, dans un système appris, sous une forme moins lisible pour l'humain : code dix-huit, code quatre, encore code quatre, code soixante et onze.

Les codes appris n'ont peut-être pas de jolis noms, mais la contrainte est utile. L'agent ne peut pas inventer une infinité d'états internes subtilement différents. Il doit réutiliser un vocabulaire fini. Si ce vocabulaire est bon, le modèle obtient une prise plus nette sur la dynamique : quand je suis dans ce type de situation et que je prends ce type d'action, voici les types de situations qui ont des chances de suivre.

C'est de la compression, mais pas simplement pour réduire la taille d'un fichier. C'est de la compression pour apprendre.

[reflective] Meyer, Adam White et Marlos Machado ont étudié les représentations discrètes en RL à travers le world-model learning, la RL model-free et la continual RL. Le résultat qui compte le plus pour moi n'est pas le slogan "discrete beats continuous". Ce serait trop propre, et la réalité est rarement aussi polie.

L'idée utile est plus étroite et plus intéressante.

Lorsque le modèle a une capacité limitée, les représentations discrètes peuvent l'aider à modéliser davantage du monde utile. Dans leurs expériences, les agents utilisant ces représentations apprenaient de meilleures policies avec moins de données, et dans des contextes continus ils s'adaptaient plus vite après des changements.

C'est exactement le contexte qui devrait intéresser les ingénieurs. Nous sommes presque toujours limités en capacité quelque part. Peut-être que le modèle est petit. Peut-être que les données sont maigres. Peut-être que l'environnement change. Peut-être que les budgets de latence imposent des composants plus petits. Peut-être que la fenêtre de contexte d'un agent est remplie d'historique sans importance. Peut-être que le monde est trop vaste pour être modélisé honnêtement, et que le système a besoin d'une abstraction avec perte qu'il peut réparer au fil du temps.

L'article contient aussi un avertissement utile : le bénéfice ne vient peut-être pas de la discrétude comme propriété magique. Les auteurs pointent plutôt vers la sparsity et la binarity comme contributeurs probables. Autrement dit, les choix finis aident en partie parce qu'ils imposent une structure. Ils rendent la représentation plus propre, plus sélective et plus facile à utiliser pour l'apprenant en aval.

Cette distinction compte. La leçon n'est pas de tout quantifier parce que cela sonne intelligent. La leçon est de demander si votre représentation force le bon type de simplification.

[matter-of-fact] Les représentations discrètes sonnaient autrefois comme une préoccupation de niche en RL. Maintenant elles semblent centrales pour la moitié des systèmes que nous construisons.

Les LLM sont l'exemple évident. Un modèle voit des token IDs, pas de la prose. Le tokenizer décide quels morceaux de texte deviennent des unités atomiques. Ce choix affecte le coût, la longueur de contexte, le comportement multilingue, les cas limites étranges et parfois le raisonnement. Le GPT-2 paper est ancien selon les standards actuels, mais il posait déjà le point pratique : le language modeling porte sur des séquences de symboles. Les systèmes modernes sont beaucoup plus grands, mais le bottleneck symbolique est toujours là.

Les agent systems ont le même problème sous une forme plus désordonnée. Un agent peut conserver des transcriptions brutes pour toujours, mais c'est généralement une très mauvaise mémoire. Les agents utiles ont besoin d'un état distillé : tâches ouvertes, contraintes connues, résultats d'outils, plan courant, risques non résolus, préférences utilisateur, faits d'environnement. C'est une représentation un peu discrète d'un désordre continu beaucoup plus vaste. Elle dit : voici les quelques états qui valent la peine d'être emportés.

Les world models rendent le lien encore plus explicite. Un world model essaie d'apprendre un simulateur interne compact : si je prends cette action depuis cet état, que se passe-t-il ensuite ? DreamerV3 est un repère moderne ici, montrant la puissance de l'apprentissage de comportements par l'imagination de trajectoires futures dans un modèle appris. Des travaux plus récents sur les discrete codebook world models for continuous control continuent d'explorer comment les discrete codebooks peuvent aider même lorsque le problème de contrôle externe est continu.

La compression est le quatrième frère discret. Quand vous compressez, vous choisissez quelles différences ignorer. Un codebook est un contrat : de nombreuses entrées brutes correspondent au même code interne parce que, pour l'objectif présent, elles sont assez proches. C'est aussi ce que font les bonnes abstractions en logiciel. Elles effondrent la variation non pertinente pour que le reste du système puisse raisonner.

Le motif est partout. Dans un LLM, les octets et caractères de texte deviennent des tokens, ce qui donne au modèle des unités de séquence prévisibles et un vocabulaire borné. Dans un agent RL, les pixels ou les flux de capteurs peuvent devenir un état latent catégoriel, ce qui rend les transitions plus propres et la planification plus facile. Dans un world model, l'historique de l'environnement peut devenir des learned codes, donnant au système un simulateur interne plus petit avec moins de détail non pertinent. Dans la mémoire d'un agent, les transcriptions complètes et les logs d'outils peuvent devenir des résumés de tâche et d'état, donnant au modèle un contexte durable sans le noyer. Dans la compression, les images, l'audio et la vidéo deviennent des codebook entries, qui préservent la structure utile tout en rejetant le bruit.

C'est pourquoi le sujet réapparaît sous différents noms. Tokenization, quantization, bucketing, classification, learned codebooks, symbolic state, sparse binary features : ils ne sont pas identiques, mais ils posent tous la même question d'ingénierie.

Quelles sont les unités de pensée ?

[deliberate] Les représentations discrètes sont puissantes parce qu'elles jettent de l'information.

C'est aussi pour cela qu'elles sont dangereuses.

Un mauvais tokenizer mutile une langue. Un mauvais schéma de bucketing efface le signal dont vous aviez besoin. Un mauvais learned codebook mappe deux états réellement différents vers le même code et enseigne la mauvaise leçon à la policy. Une mémoire d'agent discrète peut devenir confiante dans sa perte, préservant un résumé net tout en supprimant le seul détail gênant qui comptait.

Les représentations continues échouent autrement. Elles conservent souvent trop. Elles permettent au modèle de transporter une information subtile, mais l'apprenant en aval doit découvrir quelles dimensions comptent. Elles peuvent être flexibles, mais glissantes.

Le choix pratique n'est donc pas "discret ou continu ?" C'est : où ai-je besoin de douceur ? Où ai-je besoin de catégories stables ? Où le bruit se fait-il passer pour de l'information ? Où le modèle gaspille-t-il sa capacité sur une variation non pertinente ? Où un vocabulaire fini rendrait-il la prédiction, la planification ou le debugging plus faciles ?

Si vous ne pouvez pas répondre à ces questions, la discrétude peut devenir une décoration. Si vous le pouvez, elle devient un outil de conception.

[matter-of-fact] Voici le cadre de décision que j'utiliserais vraiment.

Utilisez une représentation discrète lorsque le système doit reconnaître à répétition le même type de situation sous une variation de surface bruyante. Les game states, UI states, workflow statuses, failure classes, customer intents, document chunks, tool outcomes et environment modes entrent tous dans ce motif.

Utilisez une représentation discrète lorsque le modèle suivant est mieux formulé comme une classification que comme une régression. Prédire "quel mode vient ensuite ?" peut être plus simple et plus robuste que prédire un état floating-point exact, surtout lorsque le futur est multimodal.

Utilisez une représentation discrète lorsque vous avez besoin d'une mémoire durable. Les agents n'ont pas besoin de se souvenir de chaque token de chaque observation. Ils ont besoin d'un état compact qui survit assez longtemps pour guider l'action suivante.

Soyez prudent avec les représentations discrètes lorsque la frontière est arbitraire. Si deux états sont séparés seulement parce que votre implémentation avait besoin d'un bucket, le modèle peut hériter de cette fausse distinction. Le même problème apparaît tout le temps dans les dashboards analytiques : un seuil de métrique devient un champ de distorsion de la réalité.

Soyez particulièrement prudent lorsque le cas rare compte. La compression discrète est excellente pour préserver la structure commune. Elle peut être brutale avec les exceptions. Dans les systèmes de safety, fraud, medical, legal, financial ou security, le tiny detail peut être tout le sujet.

[reflective] Il y a une odeur que je remarque plus souvent maintenant : le modèle voit techniquement tout, mais il ne peut pas utiliser ce qu'il voit.

On le voit quand un agent dispose d'une massive context window et perd quand même le fil. On le voit quand une policy reçoit des observations high-dimensional mais ne peut pas s'adapter après un petit changement d'environnement. On le voit quand un classifier reçoit des embeddings plus riches mais échoue sur de simples variantes out-of-distribution. On le voit quand un world model prédit une bouillie plausible plutôt que des états suivants utiles.

Dans ces moments-là, ajouter de la capacité peut aider. Plus de données peuvent aider. Un plus gros modèle peut aider.

Mais parfois, la pièce manquante est un meilleur bottleneck.

Le système doit être forcé de dire : ceci va avec cela, cette différence ne compte pas, cet état s'est déjà produit, cette action a changé la catégorie, voici la partie qui mérite d'être mémorisée.

C'est la vraie valeur des représentations discrètes. Elles rendent la réutilisation possible.

[calm] J'aime le travail de Meyer parce qu'il ne traite pas la représentation comme une garniture philosophique. Il met le choix sous pression expérimentale. À quel point le world model apprend-il bien ? De combien de données la policy a-t-elle besoin ? Que se passe-t-il quand l'environnement change ? L'avantage survit-il quand on passe d'une configuration propre au continual learning ?

Ce sont les bonnes questions.

J'aime aussi que la réponse ne soit pas caricaturalement simple. L'article ne prouve pas que tous les discrete latents sont bons. Il suggère que les représentations discrètes utiles font plusieurs choses à la fois : réduire les demandes de capacité, structurer la prédiction, encourager la sparsity et donner à l'apprenant des prises plus propres pour l'adaptation.

Cela sonne juste aussi dans l'ingénierie ordinaire.

Les bons systèmes ne sont pas de la réalité brute jusqu'au fond. Ils ont des interfaces soigneusement choisies. Ils ont des enums. Ils ont des states. Ils ont des event types. Ils ont des schemas. Ils ont des IDs. Ils ont des summaries. Ils ont des noms avec perte et utiles pour les situations récurrentes.

Les systèmes de machine learning ont besoin de la même discipline. La différence est que certaines interfaces sont apprises plutôt qu'écrites à la main.

[reflective] Les représentations discrètes comptent parce que l'intelligence ne consiste pas seulement à avoir un modèle puissant. Elle consiste aussi à donner au modèle des unités utiles pour penser.

Pour la RL, cela peut signifier des world models qui apprennent des transitions plus utiles avec moins de capacité, et des agents qui s'adaptent plus vite quand le monde change. Pour les LLM, cela apparaît dans la tokenization et la gestion du contexte. Pour les agents, cela apparaît dans la mémoire, l'état de planification et les traces d'utilisation d'outils. Pour la compression et les modèles génératifs, cela apparaît dans des codebooks qui préservent la structure qui vaut la peine d'être gardée.

La leçon pratique est simple.

Quand un système lutte, ne demandez pas seulement si le modèle est assez grand. Demandez si sa représentation est assez bienveillante.

Effondre-t-elle le bruit ? Préserve-t-elle les distinctions qui comptent ? Rend-elle la prochaine prédiction plus facile ? Donne-t-elle à l'agent un vocabulaire réutilisable pour le monde ?

Si oui, la discrétude n'est pas une limitation. C'est une prise.
