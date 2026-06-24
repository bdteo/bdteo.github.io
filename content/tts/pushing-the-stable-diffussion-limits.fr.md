[conversational tone] Obtenez des images IA photoréalistes avec Stable Diffusion, SDXL et Flux en 2026. Couvre les meilleurs modèles, les exigences GPU (RTX 4090/5090), ControlNet et les techniques de prompt.

Mis à jour en mars 2026. Cet article a été écrit à l'origine en mai 2023, quand SD 1.5 en 512x512 était la norme et que la RTX 3090 représentait le sommet du matériel. Tout a changé. Flux 2, les fine-tunes SDXL, SD 3.5, ControlNet et la RTX 5090 ont complètement redéfini ce qui est possible. Voici l'état actuel des choses.

L'écart entre les images générées par IA et les vraies photographies s'est presque refermé. En 2023, « photoréaliste » voulait dire « presque convaincant si l'on plisse les yeux ». En 2026, les meilleurs modèles produisent des images qu'il est réellement difficile de distinguer d'une photographie professionnelle.

[matter-of-fact] Voici comment y arriver.

[matter-of-fact] Le paysage actuel du photoréalisme

Le modèle que vous choisissez compte plus que n'importe quel réglage que vous ajustez. Voici où nous en sommes:

[deliberate] Flux 2 -- Le nouveau roi

Flux 2, de Black Forest Labs (sorti en novembre 2025), est probablement le meilleur modèle open-weight pour le photoréalisme en 2026. Il produit des images avec une lumière naturelle, des textures de peau précises et une composition cohérente qui rivalise avec la photographie professionnelle. Adobe a intégré Flux (Kontext Pro) dans Photoshop en septembre 2025 -- cela dit assez où se situe la confiance de l'industrie.

Flux possède aussi une excellente compréhension du langage naturel. Vous pouvez décrire ce que vous voulez en anglais courant, sans la soupe de mots-clés qu'exigeait SD 1.5.

[calm] Fine-tunes SDXL -- Les chevaux de trait

[reflective] Pour le photoréalisme basé sur SDXL, voici les leaders actuels:

Juggernaut XL v9/v10 -- le choix évident pour un rendu cinématographique et photographique. Le plus populaire chez les photographes et les cinéastes. Realistic Vision -- fine-tuné spécifiquement pour les textures réalistes, l'éclairage et la précision des visages. EpicRealism -- détail fin exceptionnel et lumière naturelle.

Ces modèles disposent d'un énorme soutien communautaire, de bibliothèques LoRA très riches et d'un comportement prévisible. Si Flux vous semble trop récent ou si votre workflow repose sur SDXL, ce sont d'excellents choix.

[reflective] SD 3.5 Large

Le modèle phare de Stability AI utilise la nouvelle architecture Multimodal Diffusion Transformer (MMDiT) -- une approche fondamentalement différente de SDXL. Il est techniquement impressionnant, mais son écosystème est plus petit. SD 3.0 a été déprécié en avril 2025, donc assurez-vous d'être sur 3.5.

[matter-of-fact] Retour à la réalité côté GPU

Les exigences matérielles ont fortement augmenté.

[calm] | GPU | VRAM | Capacité photoréaliste | |-----|------|------------------------| | RTX 3060 12GB | 12GB | Photoréalisme SD 1.5 seulement. SDXL est serré | | RTX 4070 Ti | 12GB | SDXL en 1024x1024. Flux est possible avec des optimisations | | RTX 4090 | 24GB | Le bon équilibre. Gère confortablement SDXL, Flux et SD 3.5 en 1024x1024+ | | RTX 5090 | 32GB | Tout, y compris la génération 4K et les workflows en lot. 32GB GDDR7, bus 512 bits | | Cartes 8GB | 8GB | Minimum viable avec la gestion VRAM de ComfyUI. Pas confortable |

Le bon compromis de 2023, « 512x512 sur une RTX 3080 », appartient à l'histoire ancienne. 1024x1024 est maintenant la résolution standard, et il faut au moins 16GB de VRAM pour travailler sans frustration permanente. À 24GB, les choses deviennent confortables.

Pour le photoréalisme en particulier, plus de VRAM signifie que vous pouvez exécuter simultanément des modèles plus grands, des résolutions plus élevées et ControlNet sans délestage vers le CPU.

[deliberate] Réglages pour le photoréalisme

[calm] Sampler

DPM++ 2M Karras à 25-30 steps. C'est le consensus établi pour le photoréalisme SDXL -- le meilleur rapport vitesse/qualité. Si vous voulez un peu plus de détail avec peu de steps, passez à DPM++ SDE Karras.

Pour Flux: utilisez le sampler par défaut à 20-30 steps.

[reflective] CFG

Pour le photoréalisme SDXL: 7-9. Cela donne une forte adhérence au prompt sans l'aspect sursaturé et trop cuit qui apparaît au-dessus de 10.

Pour SD 3.5: commencez plus bas (3-5) -- le mécanisme de guidance fonctionne différemment.

Pour Flux: suivez les recommandations propres au modèle, mais en général plus bas que SDXL.

[matter-of-fact] Résolution

Générez à la résolution native du modèle (1024x1024 pour SDXL/SD 3.5/Flux), puis upscalez pour obtenir une résolution supérieure. N'essayez pas de générer directement en 2048x2048 -- vous obtiendrez des artefacts, des éléments dupliqués et des problèmes de composition.

Options d'upscaling: hi-res fix dans A1111, ou des nodes d'upscaling dédiés dans ComfyUI (4x-UltraSharp, ESRGAN).

[deliberate] Prompter pour le photoréalisme

Le grand changement depuis 2023: écrivez naturellement, pas en mots-clés.

SD 1.5 avait besoin de prompts comme:

SDXL et Flux comprennent:

L'approche en soupe de mots-clés fonctionne encore sur SDXL, mais le langage naturel produit des résultats plus cohérents. Flux, en particulier, excelle avec des prompts descriptifs et conversationnels.

Negative prompts: Gardez-les minimaux. Commencez sans rien, puis ajoutez des corrections précises. « cartoon, illustration, painting » suffit généralement à garder les choses photoréalistes. Voir la cheat sheet pour le changement complet de philosophie autour des negative prompts.

[calm] ControlNet change tout

[reflective] Si vous êtes sérieux au sujet de la composition photoréaliste, ControlNet est non négociable. Il vous permet de contrôler la structure de votre image avec:

Depth maps -- maintenir les relations spatiales et la perspective Canny edge detection -- préserver les contours et les formes OpenPose -- contrôler la pose humaine et les proportions du corps Surface normals -- interaction réaliste de la lumière avec les surfaces

Des modèles ControlNet sont maintenant disponibles pour SDXL, Flux et SD 3.5. Multi-ControlNet (empiler plusieurs contrôles) vous donne un contrôle précis de la composition que le prompt engineering seul ne peut pas atteindre.

Le workflow: prenez une photo de référence, extrayez une depth map ou une pose, utilisez-la comme entrée ControlNet, puis générez une image photoréaliste avec la même composition.

[reflective] Vitesse contre qualité

Si vous avez besoin d'itérations rapides (travail de concept, tests de prompts), utilisez SDXL Lightning -- il génère des images 1024px de qualité en 2-8 steps. La qualité est meilleure que SDXL Turbo aux résolutions plus élevées.

Pour le rendu final, revenez à SDXL complet ou à Flux avec 25-30 steps. La différence se voit.

[matter-of-fact] Le workflow pratique

Voici ce qui fonctionne réellement pour une sortie photoréaliste en 2026:

Choisissez votre modèle -- Flux 2 pour le meilleur photoréalisme, Juggernaut XL pour l'écosystème SDXL Écrivez un prompt en langage naturel qui décrit ce que vous voyez Générez en 1024x1024, DPM++ 2M Karras, CFG 7-9, 25-30 steps Utilisez ControlNet si vous avez besoin d'une composition précise (depth ou pose) Itérez sur le prompt -- générez 4-8 images, choisissez la meilleure Upscalez la gagnante vers votre résolution cible Inpaintez les zones problématiques (mains, yeux, petits détails)

C'est le même workflow, que vous soyez dans ComfyUI ou dans A1111. Les outils diffèrent, pas le pipeline.
