[conversational tone] Adaptez-vous à Shopware 6.5/6.6: changements de classes et namespaces, Symfony 6, Stock API, Bootstrap 5, correctifs CSRF et data-off-canvas-cart.

Shopware 6.5 et 6.6 ont introduit plusieurs changements importants dans les classes, les namespaces, les attributs data et les mécanismes de sécurité dont les développeurs doivent tenir compte lorsqu’ils mettent à jour ou maintiennent leurs projets Shopware. Cet article propose un aperçu concis mais complet de ces changements, avec quelques observations sur leur impact et sur la manière d’adapter votre code.

[matter-of-fact] Introduction

[reflective] À mesure que Shopware évolue, les mises à jour apportent souvent des améliorations, des optimisations et de nouvelles fonctionnalités. Elles peuvent toutefois aussi introduire des changements qui affectent les bases de code existantes. Comprendre ces changements est essentiel pour assurer une transition fluide et exploiter efficacement les nouvelles capacités.

Cet article se concentre sur les points suivants:

Migration du namespace Elasticsearch Mises à jour de la gestion des chemins média Changements de méthode dans AvailableCombinationLoader Mise à niveau du framework Symfony vers la version 6 Mises à jour de la gestion du stock Mise à niveau de Bootstrap dans le Storefront Changements d’attribut data pour l’Offcanvas Cart Changements de protection CSRF Améliorations du Rule Builder

Entrons dans le détail de chacun de ces changements.

[deliberate] 1. Migration du namespace Elasticsearch

[calm] Aperçu du changement

Namespace précédent: ONGR\ElasticsearchDSL Nouveau namespace: OpenSearchDSL

[reflective] Impact

Toutes les classes et méthodes qui interagissent avec Elasticsearch doivent mettre à jour leurs namespaces afin de refléter la migration de ONGR\ElasticsearchDSL vers OpenSearchDSL.

[matter-of-fact] Action requise

Mettez à jour les instructions d’import et les références dans votre code pour utiliser le nouveau namespace.

[deliberate] Exemple

[calm] Observations

Ce changement s’aligne sur le mouvement plus large de l’industrie vers OpenSearch, un fork communautaire d’Elasticsearch. Passer au nouveau namespace garantit la compatibilité avec les développements et le support à venir.

[reflective] 2. Gestion des chemins média

[matter-of-fact] Aperçu du changement

Les chemins média sont désormais stockés directement en base de données au lieu d’être générés dynamiquement.

[deliberate] Impact

Les classes et services qui s’appuyaient auparavant sur la génération dynamique des chemins doivent lire les chemins média depuis la base de données.

[calm] Action requise

Adaptez votre code pour utiliser la méthode getPath() de MediaEntity.

[reflective] Exemple

[matter-of-fact] Observations

Stocker les chemins média en base de données améliore les performances en réduisant le coût de calcul. Cela apporte aussi plus de cohérence et de fiabilité dans la gestion des médias.

[deliberate] 3. Mise à jour de méthode dans AvailableCombinationLoader

[calm] Aperçu du changement

La méthode load() dans AbstractAvailableCombinationLoader a été remplacée par loadCombinations().

[reflective] Impact

[reflective] Toute classe personnalisée qui étend AbstractAvailableCombinationLoader doit implémenter la nouvelle méthode loadCombinations() au lieu de l’ancienne méthode load().

[matter-of-fact] Action requise

Renommez ou refactorez vos implémentations de méthode pour les aligner sur le nouveau nom et la nouvelle signature.

[deliberate] Exemple

[calm] Observations

Ce changement renforce la clarté avec un nom de méthode plus descriptif. Il peut aussi impliquer des paramètres ou des types de retour supplémentaires; il est donc essentiel de relire la signature de la méthode.

[reflective] 4. Mise à niveau du framework Symfony vers la version 6

[matter-of-fact] Aperçu du changement

Shopware a mis à niveau ses composants Symfony vers la version 6.

[deliberate] Impact

Cette mise à niveau introduit quelques breaking changes liés à des fonctionnalités dépréciées et à des changements de signatures de méthodes. Le code personnalisé qui dépend d’anciennes fonctionnalités Symfony peut casser ou produire des avertissements.

[calm] Action requise

Relisez votre code pour identifier les fonctionnalités Symfony dépréciées et mettez-les à jour afin qu’elles soient compatibles avec Symfony 6.

[reflective] Observations

[deliberate] Rester à jour avec la dernière version de Symfony apporte de meilleures performances, une meilleure sécurité et l’accès à de nouvelles fonctionnalités. Cela demande toutefois une revue attentive du code et des tests pour garantir la compatibilité.

[matter-of-fact] 5. Mises à jour de la gestion du stock

[deliberate] Aperçu du changement

Une nouvelle Stock API a été introduite, disponible derrière le feature flag STOCK_HANDLING.

[calm] Impact

Les classes et services liés à la gestion du stock peuvent devoir s’adapter à la nouvelle structure de l’API, surtout s’ils interagissent directement avec les données de stock.

[reflective] Action requise

[matter-of-fact] Utilisez les nouvelles méthodes de gestion du stock fournies par l’API et assurez-vous que toute logique liée au stock s’aligne sur la structure mise à jour.

[matter-of-fact] Exemple

[deliberate] Observations

La nouvelle Stock API fournit une manière plus robuste et plus flexible de gérer le stock, ce qui peut simplifier les personnalisations et les intégrations avec des systèmes externes.

[calm] 6. Mise à niveau de Bootstrap dans le Storefront

[reflective] Aperçu du changement

Le Storefront est passé de Bootstrap 4 à Bootstrap 5, et jQuery a été retiré comme dépendance.

[matter-of-fact] Impact

Le code JavaScript personnalisé et les templates qui s’appuient sur jQuery ou sur des composants Bootstrap 4 doivent être refactorés pour s’aligner sur Bootstrap 5 et utiliser du JavaScript natif lorsque c’est nécessaire.

[deliberate] Action requise

Remplacez l’usage de jQuery par du JavaScript natif ou par les utilitaires Bootstrap 5. Mettez à jour les classes et composants Bootstrap pour correspondre au nommage et à la structure de Bootstrap 5.

[calm] Observations

Bootstrap 5 apporte de meilleures performances, moins de dépendances et des composants modernisés. La mise à jour peut prendre du temps, mais elle offre des bénéfices durables en maintenabilité et en expérience utilisateur.

[reflective] 7. Changements d’attribut data pour l’Offcanvas Cart (Shopware 6.6)

[matter-of-fact] Aperçu du changement

Dans Shopware 6.6, un changement discret mais important a été introduit dans l’attribut data utilisé pour déclencher la fonctionnalité d’offcanvas cart.

Attribut data précédent: data-offcanvas-cart Nouvel attribut data: data-off-canvas-cart

[deliberate] Impact

Les templates ou thèmes personnalisés qui utilisent l’attribut data-offcanvas-cart sans traits d’union peuvent constater que l’offcanvas cart ne fonctionne plus comme prévu, car le listener JavaScript de Shopware 6.6 cherche la version avec traits d’union.

[calm] Action requise

Mettez à jour l’attribut data-offcanvas-cart dans vos templates vers data-off-canvas-cart.

[reflective] Exemple

[matter-of-fact] Observations

Ce changement est mal documenté dans les notes de version officielles de Shopware 6.6, mais il est crucial pour le bon fonctionnement de l’offcanvas cart. Le JavaScript chargé d’initialiser la fonctionnalité du panier s’appuie sur l’attribut data-off-canvas-cart, et tout écart peut empêcher le panier de fonctionner.

[deliberate] Notes supplémentaires

La cohérence est essentielle: assurez-vous que toutes les occurrences de l’attribut offcanvas cart sont mises à jour. Testez soigneusement: après le changement, testez la fonctionnalité du panier pour confirmer qu’elle se comporte comme attendu. Cherchez les changements similaires: d’autres attributs data ou listeners d’événements ont peut-être subi des mises à jour comparables; relisez vos templates personnalisés en conséquence.

[calm] 8. Changements de protection CSRF

[reflective] Aperçu du changement

[matter-of-fact] Shopware 6.5 et les versions ultérieures ont supprimé la gestion explicite des tokens CSRF dans les templates, au profit d’une stratégie de cookies SameSite pour la protection CSRF.

[matter-of-fact] Impact

Les templates et formulaires qui incluaient auparavant des tokens CSRF avec la fonction sw_csrf rencontreront des erreurs, car cette fonction n’existe plus.

[deliberate] Action requise

Supprimez les fonctions de token CSRF: éliminez l’usage de {{ sw_csrf('route_name') }} dans vos templates. Appuyez-vous sur les cookies SameSite: faites confiance à la stratégie SameSite intégrée pour la protection CSRF, qui ne requiert pas de tokens explicites dans les formulaires. Ajustez les attributs de formulaire: assurez-vous que les formulaires et les requêtes AJAX sont correctement configurés pour fonctionner avec le nouveau mécanisme de protection CSRF.

[calm] Exemple

[reflective] Observations

[reflective] Résolution de l’erreur: supprimer la fonction sw_csrf résout l’erreur "Unknown 'sw_csrf' function". Maintien de la sécurité: la stratégie de cookies SameSite continue de protéger contre les attaques CSRF sans tokens supplémentaires. Templates simplifiés: les formulaires deviennent plus propres et légèrement plus simples sans tokens CSRF.

[matter-of-fact] Notes supplémentaires

Les tests sont essentiels: après ces changements, testez soigneusement les soumissions de formulaires pour vérifier qu’elles fonctionnent correctement. Comprenez le nouveau mécanisme: familiarisez-vous avec le fonctionnement de la stratégie SameSite pour conserver une application sécurisée. Mettez la documentation à jour: assurez-vous que toute documentation interne reflète ce changement afin d’éviter de futures confusions.

[deliberate] 9. Gérer les problèmes avec l’Offcanvas Cart

[calm] Aperçu du scénario

Après avoir mis à jour les templates et supprimé la fonction sw_csrf, les développeurs peuvent encore rencontrer des problèmes: cliquer sur le bouton "Add to Cart" ouvre l’offcanvas cart, mais celui-ci apparaît vide.

[reflective] Cause racine

[calm] L’offcanvas cart peut ne pas afficher les articles ajoutés à cause de paramètres manquants ou incorrects dans la soumission du formulaire, en particulier l’absence du champ d’entrée redirectTo.

[matter-of-fact] Action requise

Ajoutez le paramètre redirectTo: incluez dans vos formulaires d’ajout au panier un champ caché nommé redirectTo avec la valeur frontend.cart.offcanvas. Assurez-vous que les attributs data sont corrects: vérifiez que tous les attributs data nécessaires sont présents et correctement nommés.

[deliberate] Exemple

[calm] Observations

Restauration de la fonctionnalité: ajouter le paramètre redirectTo indique à Shopware de charger l’offcanvas cart lors de l’ajout d’un article, ce qui garantit que le panier s’affiche correctement. Attention au détail: de petites omissions, comme des champs d’entrée manquants, peuvent provoquer des problèmes fonctionnels importants; cela rappelle l’importance d’une revue de code attentive.

[reflective] Notes supplémentaires

[deliberate] Cohérence des attributs data: vérifiez deux fois que les attributs data comme data-product-id sont correctement définis. Relisez les dépendances JavaScript: assurez-vous que tous les plugins ou composants JavaScript liés au panier sont bien chargés et initialisés. Videz le cache: après les changements, videz le cache Shopware et celui de votre navigateur pour éviter que des fichiers obsolètes ne causent des problèmes.

[matter-of-fact] 10. Améliorations du Rule Builder

[deliberate] Aperçu du changement

L’API Rule Builder a été étendue pour prendre en charge une logique conditionnelle plus complexe.

[calm] Impact

Les règles et conditions personnalisées peuvent nécessiter des ajustements afin de s’aligner sur les nouvelles interfaces ou méthodes fournies par le Rule Builder amélioré.

[reflective] Action requise

[matter-of-fact] Relisez la documentation du Rule Builder et mettez à jour les implémentations de règles personnalisées pour garantir leur compatibilité.

[matter-of-fact] Observations

Des capacités de règles plus avancées permettent un ciblage et une personnalisation plus précis dans Shopware. Tirer parti de ces nouvelles fonctionnalités peut mener à une meilleure adaptabilité et à des expériences plus personnalisées pour les utilisateurs finaux.

[deliberate] Conclusion

Shopware 6.5 et 6.6 introduisent plusieurs changements importants dans les classes, les namespaces, les attributs data et les mécanismes de sécurité que les développeurs doivent prendre en compte pour maintenir la compatibilité et profiter des nouvelles fonctionnalités. Mettre à jour votre base de code exige une revue attentive et des tests, mais offre aussi l’occasion d’améliorer les performances, la sécurité et la fonctionnalité.

[calm] Recommandations

Planifiez en amont: avant la mise à jour, relisez les notes de version officielles et les guides de mise à niveau de Shopware pour obtenir une vue complète. Testez soigneusement: appliquez les changements dans un environnement de staging et effectuez des tests approfondis pour identifier et corriger les problèmes. Appuyez-vous sur la documentation: utilisez la documentation Shopware et les forums de la communauté pour trouver des indications sur les changements spécifiques. Restez informé: suivez les futures mises à jour afin d’anticiper les changements à venir et de vous y préparer.

[reflective] Observations supplémentaires

Attention au détail: de petits changements, comme des traits d’union dans les attributs data ou la suppression de fonctions, peuvent avoir un impact important. Relisez toujours les mises à jour de templates avec soin. Soutien de la communauté: la communauté Shopware est active et collaborative. Échanger avec d’autres développeurs peut apporter des idées et des solutions à des problèmes courants. Bonnes pratiques: adopter les bonnes pratiques mises à jour, comme l’usage de JavaScript natif à la place de jQuery et le recours à des stratégies de sécurité modernes, conduit à un code plus propre et plus efficace. Surveillance des dépréciations: suivre les avis de dépréciation et se préparer aux suppressions futures peut réduire les interruptions pendant les mises à niveau.

En comprenant et en traitant les changements de classes, de namespaces, d’attributs data et de sécurité dans Shopware 6.5 et 6.6, les développeurs peuvent assurer une transition fluide et continuer à construire des solutions e-commerce robustes et durables.
