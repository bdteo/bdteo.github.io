[conversational tone] Aide-mémoire pratique pour Stable Diffusion avec SDXL, SD 3.5 et Flux. Couvre les samplers, le CFG, la résolution, les prompts négatifs, le choix du modèle et le choix de l'interface. Mis à jour en mars 2026.

Mis à jour en mars 2026. La version originale de cet aide-mémoire a été écrite pour SD 1.5 en mai 2023. Presque tout a changé depuis -- nouvelles architectures (SDXL, SD 3.5, Flux), nouvelles interfaces (ComfyUI), nouveau matériel (RTX 5090) et renversement complet de la philosophie des prompts négatifs. Voici la version actuelle.

Ceci est ma référence de travail pour les paramètres de Stable Diffusion. Pas un tutoriel -- seulement les réglages que je vais chercher quand quelque chose ne marche pas ou quand je veux pousser la qualité.

[matter-of-fact] Quel modèle utiliser

C'est maintenant la première décision, et elle compte plus que n'importe quel ajustement de paramètre.

| Modèle | Idéal pour | Résolution | Notes | |-------|----------|-----------|-------| | Flux 2 | Photoréalisme, respect du prompt | 1024x1024+ | Meilleur modèle open-weight pour le photoréalisme en 2026. Intégré à Adobe Photoshop | | SDXL | Usage général | 1024x1024 | Énorme écosystème de fine-tunes. Juggernaut XL, Realistic Vision, DreamShaper | | SD 3.5 Large | Qualité maximale (le fleuron de Stability) | 1024x1024 | Architecture MMDiT. SD 3.0 a été déprécié en avril 2025 | | SDXL Lightning | Vitesse | 1024x1024 | Génération en 2 à 8 étapes. Meilleure qualité que Turbo à haute résolution | | SD 1.5 | Workflows hérités | 512x512 | Immense bibliothèque de fine-tunes, mais en voie d'abandon. SD 2.0/2.1 officiellement dépréciés |

Si vous repartez de zéro: Flux 2 pour le photoréalisme, SDXL pour tout le reste. SD 3.5 est bon, mais son écosystème est plus petit.

[deliberate] Quelle interface utiliser

| Interface | Idéale pour | |----|----------| | ComfyUI | Utilisateurs avancés. Basée sur des nœuds, meilleure gestion de la VRAM, 15 % plus rapide, meilleur support de Flux. Standard industriel pour le travail sérieux depuis 2025 | | Automatic1111 | Débutants. Interface plus simple, immense bibliothèque d'extensions. Fonctionne encore très bien pour SDXL | | Fooocus | Génération en un clic. Configuration minimale. Bien pour des résultats rapides |

J'utilise ComfyUI. La courbe d'apprentissage est plus raide (comptez 10 à 20 heures pour être à l'aise), mais la gestion de la VRAM vaut à elle seule l'effort -- il fait tourner SDXL sur 8 Go là où A1111 plante.

[calm] Samplers

Le débat sur les samplers est plus ou moins réglé.

Choix par défaut: DPM++ 2M Karras -- meilleur rapport vitesse/qualité. C'est mon choix par défaut pour presque tout. DPM++ SDE Karras -- légèrement meilleur avec peu d'étapes. Bon quand vous itérez vite. Euler a -- toujours fiable. Plus de variété dans les sorties, utile pour explorer.

Quand changer: Manque de diversité dans les sorties? Essayez DPM++ SDE ou Euler a. Artefacts ou sursaturation? Essayez DPM++ 2M Karras ou Euler simple. Besoin de vitesse avant tout? Euler a ou DPM++ 2M (non-Karras). Vous voulez la qualité maximale? DPM++ 3M SDE Karras ou UniPC.

Nombre d'étapes: 20 à 30 étapes pour la plupart des samplers. Les modèles Lightning n'en demandent que 2 à 8.

[reflective] CFG (Classifier Free Guidance)

À quel point le modèle suit strictement votre prompt plutôt que sa propre interprétation.

[calm] | Plage | Effet | |-------|--------| | 1-4 | Très créatif, interprétation lâche. Souvent incohérent | | 5-7 | Bon équilibre pour la plupart des travaux | | 7-10 | Forte adhérence au prompt. Zone idéale pour le photoréalisme avec SDXL | | 10-15 | Risque d'artefacts et de couleurs trop cuites | | 15+ | Presque toujours trop. Artefacts garantis |

Note: SD 3.5 utilise un mécanisme de guidance différent. Le concept de CFG s'applique encore, mais l'échelle se comporte autrement -- commencez plus bas (3-5) et ajustez.

[matter-of-fact] Résolution

L'époque du 512x512 est finie.

| Modèle | Résolution native | Plage pratique | |-------|------------------|-----------------| | SD 1.5 | 512x512 | 512x512 à 768x768 | | SDXL | 1024x1024 | 1024x1024 (standard), 1024x768, 768x1024 | | SD 3.5 | 1024x1024 | 1024x1024+ | | Flux | 1024x1024 | 1024x1024+, 4K possible sur GPU haut de gamme |

Dépasser la résolution native risque de produire des artefacts et des problèmes de composition. Utilisez plutôt hi-res fix ou l'upscaling au lieu de générer directement en 2048x2048.

[deliberate] Clip Skip

[deliberate] Moins pertinent qu'avant.

SD 1.5: Clip skip 1-2 compte beaucoup. Les modèles anime utilisent souvent clip skip 2. SDXL: Utilise deux encodeurs de texte (CLIP + OpenCLIP). Clip skip est largement ignoré -- l'architecture le gère différemment. SD 3.5 / Flux: Pas applicable de la même manière. Ces modèles utilisent un encodage de texte basé sur des transformers.

Si vous êtes sur SDXL ou plus récent: ne vous préoccupez pas de clip skip. Si vous êtes sur SD 1.5: gardez-le à 1 pour le photoréalisme, 2 pour l'anime.

[calm] Prompts négatifs

La philosophie s'est retournée. En 2023, le conseil était d'utiliser de longues listes de prompts négatifs. En 2026, le consensus est: commencez sans rien et n'ajoutez que ce dont vous avez besoin pour corriger.

Pourquoi ce changement: SDXL et Flux comprennent le langage naturel bien mieux que SD 1.5 Les longs prompts négatifs peuvent en fait restreindre la créativité et produire de moins bons résultats "bad anatomy" est trop vague pour être utile. "ugly" ne fonctionne pas parce que SD n'a pas été entraîné sur des images étiquetées "ugly" Certains modèles donnent des résultats nettement pires avec de longs négatifs

Approche actuelle: Générez d'abord sans aucun prompt négatif. Si vous voyez un problème précis (doigts en trop, arrière-plan flou), ajoutez un négatif ciblé pour celui-ci. Utilisez la pondération d'emphase: (blurry:1.3) au lieu de simplement blurry. Gardez-le court -- 5 à 10 termes au maximum.

[reflective] Référence rapide GPU

| GPU | VRAM | Bien pour | |-----|------|----------| | RTX 3060 12GB | 12GB | SD 1.5, SDXL de base | | RTX 4070 Ti | 12GB | SDXL, un peu de Flux | | RTX 4090 | 24GB | Tout. La machine de travail | | RTX 5090 | 32GB | Tout, y compris la 4K et la génération par lots | | Cartes 8GB | 8GB | Minimum viable. ComfyUI aide à gérer la VRAM |

Le seuil des 24 Go est celui où les choses deviennent confortables pour SDXL et Flux sans jongler constamment avec la VRAM.

[matter-of-fact] Correctifs rapides de dépannage

| Problème | À essayer | |---------|-----| | Sortie floue | Augmentez les étapes. Vérifiez que la résolution correspond à la résolution native du modèle | | Doigts/membres en trop | Ajoutez extra fingers, extra limbs au prompt négatif. Ou utilisez ControlNet | | Couleurs sursaturées | Baissez le CFG. Passez à DPM++ 2M Karras | | La composition est mauvaise | Utilisez ControlNet (depth, canny, pose) au lieu de vous battre avec le prompt | | La génération est lente | Utilisez un modèle Lightning, réduisez les étapes, utilisez ComfyUI pour une meilleure VRAM | | Manque de VRAM | Passez à ComfyUI, réduisez la taille du batch, utilisez fp16 |
