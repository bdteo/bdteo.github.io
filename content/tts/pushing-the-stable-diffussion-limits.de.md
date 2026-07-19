[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

Aktualisiert im März 2026. Dieser Artikel wurde ursprünglich im Mai 2023 geschrieben, als SD 1.5 mit 512x512 der Standard war und die RTX 3090 die Spitzenhardware. Alles hat sich verändert. Flux 2, SDXL-Fine-Tunes, SD 3.5, ControlNet und die RTX 5090 haben völlig neu definiert, was möglich ist. Das hier ist der aktuelle Stand.

[conversational tone] Die Lücke zwischen KI-generierten Bildern und echten Fotografien ist fast geschlossen. 2023 bedeutete "fotorealistisch": "fast überzeugend, wenn man die Augen zusammenkneift." 2026 erzeugen die besten Modelle Bilder, die tatsächlich schwer von professioneller Fotografie zu unterscheiden sind.

[matter-of-fact] So kommt man dorthin.

Die aktuelle Landschaft des Fotorealismus.

[reflective] Das Modell, das du auswählst, ist wichtiger als jede Einstellung, an der du drehst. So sieht der Stand aus:

Flux 2 -- Der neue König.

Flux 2 von Black Forest Labs (veröffentlicht im November 2025) ist 2026 wohl das beste Open-Weight-Modell für Fotorealismus. Es erzeugt Bilder mit natürlichem Licht, präzisen Hauttexturen und kohärenter Komposition, die mit professioneller Fotografie mithalten kann. Adobe hat Flux (Kontext Pro) im September 2025 in Photoshop integriert -- das sagt einiges darüber, wo das Vertrauen der Branche liegt.

Flux versteht außerdem natürliche Sprache außergewöhnlich gut. Du kannst in schlichtem Englisch beschreiben, was du willst, ohne die Keyword-Suppe, die SD 1.5 verlangt hat.

SDXL-Fine-Tunes -- Die Arbeitstiere.

[awe] Für SDXL-basierten Fotorealismus sind das die aktuellen Spitzenreiter:

Juggernaut XL v9/v10 -- die Standardwahl für cineastische, fotografische Ergebnisse. Besonders beliebt bei Fotografen und Filmemachern.

Realistic Vision -- speziell für lebensechte Texturen, Beleuchtung und Gesichtsgenauigkeit fine-getuned.

EpicRealism -- außergewöhnlich starke feine Details und natürliches Licht.

[matter-of-fact] Diese Modelle haben enorme Community-Unterstützung, umfangreiche LoRA-Bibliotheken und vorhersehbares Verhalten. Wenn Flux sich noch zu neu anfühlt oder dein Workflow auf SDXL aufgebaut ist, sind sie ausgezeichnete Optionen.

SD 3.5 Large.

Das Flaggschiff von Stability AI nutzt die neue Multimodal Diffusion Transformer (MMDiT)-Architektur -- ein grundlegend anderer Ansatz als SDXL. Es ist technisch beeindruckend, aber das Ökosystem ist kleiner. SD 3.0 wurde im April 2025 eingestellt, also stell sicher, dass du auf 3.5 bist.

GPU-Realitätscheck.

Die Hardware-Anforderungen sind deutlich gestiegen.

GPU, VRAM, Fotorealismus-Fähigkeit.

RTX 3060 12GB; 12GB; Nur SD 1.5-Fotorealismus. SDXL ist knapp.

[matter-of-fact] RTX 4070 Ti; 12GB; SDXL bei 1024x1024. Flux ist mit Optimierungen möglich.

RTX 4090; 24GB; Der Sweet Spot. Bewältigt SDXL, Flux und SD 3.5 komfortabel bei 1024x1024+.

RTX 5090; 32GB; Alles, inklusive 4K-Generierung und Batch-Workflows. 32GB GDDR7, 512-bit Bus.

8GB-Karten; 8GB; Mit ComfyUIs VRAM-Management minimal brauchbar. Nicht angenehm.

[awe] Der Sweet Spot von 2023, "512x512 auf einer RTX 3080", ist alte Geschichte. 1024x1024 ist jetzt die Standardauflösung, und du willst mindestens 16GB VRAM, um ohne ständige Frustration zu arbeiten. Bei 24GB wird es komfortabel.

[reflective] Speziell für Fotorealismus bedeutet mehr VRAM, dass du größere Modelle, höhere Auflösungen und ControlNet gleichzeitig ausführen kannst, ohne auf die CPU auszulagern.

Einstellungen für Fotorealismus.

Sampler.

DPM++ 2M Karras mit 25-30 Steps. Das ist der gefestigte Konsens für SDXL-Fotorealismus -- das beste Verhältnis von Geschwindigkeit zu Qualität. Wenn du bei niedrigen Step-Zahlen etwas mehr Detail möchtest, wechsle zu DPM++ SDE Karras.

[deliberate] Für Flux: nutze den Standard-Sampler mit 20-30 Steps.

CFG.

Für SDXL-Fotorealismus: 7-9. Das gibt starke Prompt-Treue ohne den übersättigten, überkochten Look, der oberhalb von 10 entsteht.

[deliberate] Für SD 3.5: niedriger anfangen (3-5) -- der Guidance-Mechanismus funktioniert anders.

Für Flux: modell-spezifischen Empfehlungen folgen, aber im Allgemeinen niedriger als bei SDXL.

Auflösung.

[deliberate] Generiere in der nativen Auflösung des Modells (1024x1024 für SDXL/SD 3.5/Flux), dann upscale für höhere Auflösung. Versuch nicht, direkt bei 2048x2048 zu generieren -- du bekommst Artefakte, duplizierte Elemente und Kompositionsprobleme.

Upscaling-Optionen: Hi-res fix in A1111 oder dedizierte Upscaling-Nodes in ComfyUI (4x-UltraSharp, ESRGAN).

Prompting für Fotorealismus.

[matter-of-fact] Die größte Verschiebung seit 2023: natürlich schreiben, nicht in Keywords.

SD 1.5 brauchte Prompts wie:

SDXL und Flux verstehen:

Der Keyword-Suppe-Ansatz funktioniert bei SDXL weiterhin, aber natürliche Sprache erzeugt kohärentere Ergebnisse. Besonders Flux glänzt bei beschreibenden, konversationellen Prompts.

Negative Prompts: Halte sie minimal. Fang ohne an und füge dann gezielte Korrekturen hinzu. "cartoon, illustration, painting" reicht meistens, um die Dinge fotorealistisch zu halten. Sieh dir das Cheat Sheet für den vollständigen Philosophiewechsel bei Negative Prompts an.

ControlNet verändert alles.

[matter-of-fact] Wenn du es mit fotorealistischer Komposition ernst meinst, ist ControlNet nicht verhandelbar. Es lässt dich die Struktur deines Bildes steuern über:

Depth maps -- räumliche Beziehungen und Perspektive erhalten.

Canny edge detection -- Umrisse und Formen bewahren.

OpenPose -- menschliche Posen und Körperproportionen steuern.

Surface normals -- realistische Lichtinteraktion mit Oberflächen.

ControlNet-Modelle sind inzwischen für SDXL, Flux und SD 3.5 verfügbar. Multi-ControlNet (das Stapeln mehrerer Controls) gibt dir präzise Kompositionskontrolle, die Prompt Engineering allein nicht erreichen kann.

Der Workflow: Nimm ein Referenzfoto, extrahiere eine Depth Map oder Pose, nutze sie als ControlNet-Input und generiere ein fotorealistisches Bild mit derselben Komposition.

Geschwindigkeit vs. Qualität.

Wenn du schnelle Iterationen brauchst (Konzeptarbeit, Prompt-Tests), nutze SDXL Lightning -- es erzeugt hochwertige 1024px-Bilder in 2-8 Steps. Bei höheren Auflösungen ist die Qualität besser als bei SDXL Turbo.

[matter-of-fact] Für das finale Ergebnis wechselst du zurück zu vollem SDXL oder Flux mit 25-30 Steps. Der Unterschied ist sichtbar.

Der praktische Workflow.

Das funktioniert 2026 tatsächlich für fotorealistische Ergebnisse:

Wähle dein Modell -- Flux 2 für den besten Fotorealismus, Juggernaut XL für das SDXL-Ökosystem.

[deliberate] Schreibe einen natürlichsprachlichen Prompt, der beschreibt, was du siehst.

Generiere bei 1024x1024, DPM++ 2M Karras, CFG 7-9, 25-30 Steps.

Nutze ControlNet, wenn du eine bestimmte Komposition brauchst (Depth oder Pose).

Iteriere am Prompt -- generiere 4-8 Bilder, wähle das beste.

Upscale den Gewinner auf deine Zielauflösung.

Inpainte problematische Bereiche (Hände, Augen, kleine Details).

[matter-of-fact] Das ist derselbe Workflow, egal ob du in ComfyUI oder A1111 bist. Die Werkzeuge unterscheiden sich, die Pipeline nicht.
