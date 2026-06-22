---
lang: "de"
translationOf: "discrete-representations-reinforcement-learning-insights"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "39a2433f0fef1cb8"
title: "Diskrete Repräsentationen in RL: Warum Ingenieure sich dafür interessieren sollten"
date: "2024-07-15"
slug: "discrete-representations-reinforcement-learning-insights"
author: "Boris D. Teoharov"
description: "Ein praktischer Leitfaden zu diskreten Repräsentationen im Reinforcement Learning: Wie Tokens, Codebooks und kategoriale Latents KI-Agenten beim Lernen, Komprimieren und Anpassen helfen."
tags: ["Künstliche Intelligenz", "Reinforcement Learning", "Diskrete Repräsentationen", "World Models", "KI-Agenten"]
featuredImage: "./images/featured.jpg"
imageCaption: "Ein aufgefächerter Bogen schlichter Karten auf dunklem Stoff. Eine Hand hebt eine aus der endlichen Menge."
---

Ein KI-System sieht nie "die Welt". Es sieht die Repräsentation, die wir ihm geben.

Das klingt wie ein Forschungsdetail, bis es dich in production erwischt. Dein Agent bekommt einen Browser-Screenshot, aber die policy handelt nicht direkt auf Pixeln. Dein LLM erhält Text, aber das Modell liest Wörter nicht so, wie du sie liest. Dein Roboter zeichnet kontinuierliche Sensorwerte auf, aber sein planner braucht etwas, das stabil genug ist, um zu vergleichen, zu erinnern, vorherzusagen und besser zu werden.

Die technische Frage ist unverblümt:

Lässt du das Modell in einer kontinuierlichen Suppe aus Dezimalzahlen leben, oder zwingst du Teile seiner Welt in eine endliche Menge aus Symbolen, Buckets, Tokens, Kategorien oder codebook entries?

Das ist die praktische Form der Frage nach diskreten Repräsentationen.

Das Thema fiel mir zuerst durch Edan Meyers Arbeit zu Reinforcement Learning auf, besonders durch das Paper [Harnessing Discrete Representations for Continual Reinforcement Learning](https://arxiv.org/abs/2312.01203), das später im [Reinforcement Learning Journal](https://rlj.cs.umass.edu/2024/papers/Paper84.html) erschien. Das Paper ist technisch, aber die Lehre ist wunderbar brauchbar: Manchmal lernt ein Modell schneller, passt sich besser an und baut ein besseres world model, wenn es Beobachtungen mit einem kleinen Vokabular möglicher Zustände beschreiben muss.

Diese Idee ist nicht in RL eingeschlossen. Sie reimt sich auf tokenization in LLMs, vector quantization in generativen Modellen, learned codebooks in der Kompression und darauf, dass agent systems zunehmend kompakten internen Zustand brauchen statt endlosem rohem Kontext.

Für einen arbeitenden Ingenieur ist der Punkt dieser: Repräsentation ist nicht nur ein preprocessing step. Dort entscheidest du, welche Art von Fehlern dein System machen darf.

## Die einfache Version

Eine kontinuierliche Repräsentation sagt: "Dieses Ding ist ein Punkt in einem glatten Raum."

Eine diskrete Repräsentation sagt: "Dieses Ding gehört zu einer oder mehreren benannten Optionen aus einer endlichen Menge."

Keines von beiden ist automatisch besser. Ein kontinuierlicher Vektor ist ausdrucksstark. Er kann gradients, Schattierungen, Interpolationen und feine Details tragen. Deshalb sind embeddings so nützlich. Aber kontinuierliche Räume können auch matschig sein. Winzige numerische Änderungen können etwas bedeuten oder auch nicht. Ähnlich aussehende Vektoren können unterschiedliche kausale Situationen verbergen. Ein nachgelagertes Modell muss nicht nur lernen, was wichtig ist, sondern auch, wo die Grenzen liegen.

Eine diskrete Repräsentation zieht Grenzen.

Sie macht aus der Frage "welcher genaue reellwertige Vektor kommt als Nächstes?" etwas Näheres an "welcher Zustand, token oder code kommt als Nächstes?" Das verändert das Lernproblem. Vorhersage kann classification statt regression werden. Erinnerung kann symbolisch genug werden, um wiederverwendbar zu sein. Kompression wird explizit. Ein planner kann über eine kleinere Menge von Möglichkeiten nachdenken.

Deshalb arbeitet ein Sprachmodell nicht auf rohen Unicode-Essays als undifferenziertem Strom. Es arbeitet auf token IDs. Deshalb sind [SentencePiece](https://arxiv.org/abs/1808.06226) und byte-pair-artige tokenizers wichtig. Deshalb war [VQ-VAE](https://arxiv.org/abs/1711.00937) interessant: Es zeigte, dass learned discrete codes ein mächtiger bottleneck für Bilder, Audio und Sprache sein können. Und deshalb kreist world-model RL immer wieder um categorical latents und codebooks.

Das Modell lernt nicht nur eine Aufgabe. Es lernt ein Vokabular für die Aufgabe.

## Ein konkretes Beispiel

Stell dir einen Agenten vor, der lernt, ein einfaches Spiel aus Bildschirmbeobachtungen zu spielen.

Ein kontinuierlicher latenter Zustand könnte den Bildschirm als Vektor wie diesen codieren:

```text
[0.13, -0.72, 1.84, 0.04, ...]
```

Dieser Vektor kann viel darstellen. Aber wenn der Agent transitions lernen will, muss das Modell vorhersagen, wie sich all diese floating-point-Werte nach einer Aktion verändern. Es ist leicht, Kapazität für Details zu verschwenden, die keine Rolle spielen: ein flackernder Pixel, ein leicht anderes animation frame, eine Farbverschiebung, ein wenig visuelles Rauschen.

Ein diskreter latenter Zustand könnte dieselbe Situation stattdessen so codieren:

```text
room=3, enemy_state=alert, key_status=missing, health_bucket=low
```

Oder, in einem gelernten System, weniger menschenlesbar:

```text
[code_18, code_4, code_4, code_71]
```

Die gelernten codes haben vielleicht keine hübschen Namen, aber die Einschränkung ist nützlich. Der Agent kann nicht unendlich viele subtil verschiedene interne Zustände erfinden. Er muss ein endliches Vokabular wiederverwenden. Wenn dieses Vokabular gut ist, bekommt das Modell einen saubereren Griff an die Dynamik: Wenn ich in dieser Art von Situation bin und diese Art von Aktion ausführe, sind dies die wahrscheinlichen nächsten Arten von Situationen.

Das ist Kompression, aber nicht bloß für Dateigröße. Es ist Kompression fürs Lernen.

## Was Edan Meyers Paper hinzufügt

Meyer, Adam White und Marlos Machado untersuchten diskrete Repräsentationen in RL über world-model learning, model-free RL und continual RL hinweg. Das Ergebnis, das mir am wichtigsten ist, lautet nicht als Slogan "discrete beats continuous". Das wäre zu ordentlich, und die Realität ist selten so höflich.

Die nützliche Aussage ist enger und interessanter:

Wenn das Modell begrenzte Kapazität hat, können diskrete Repräsentationen ihm helfen, mehr von der nützlichen Welt zu modellieren. In ihren Experimenten lernten Agenten mit diesen Repräsentationen bessere policies mit weniger Daten, und in continual settings passten sie sich nach Veränderungen schneller an.

Genau darum sollten sich Ingenieure kümmern. Wir sind fast immer irgendwo kapazitätsbegrenzt. Vielleicht ist das Modell klein. Vielleicht sind die Daten dünn. Vielleicht verändert sich die Umgebung. Vielleicht erzwingen Latenzbudgets kleinere Komponenten. Vielleicht ist das Kontextfenster eines Agenten voller irrelevanter Historie. Vielleicht ist die Welt zu groß, um sie ehrlich zu modellieren, also braucht das System eine verlustbehaftete Abstraktion, die es laufend reparieren kann.

Das Paper enthält auch eine nützliche Warnung: Der Vorteil muss nicht aus Diskretheit als magischer Eigenschaft kommen. Die Autoren deuten auf sparsity und binarity als wahrscheinliche Mitwirkende. Anders gesagt: "endliche Auswahlmöglichkeiten" helfen zum Teil, weil sie Struktur auferlegen. Sie machen die Repräsentation sauberer, selektiver und für den nachgelagerten learner leichter nutzbar.

Diese Unterscheidung ist wichtig. Die Lehre lautet nicht, alles zu quantisieren, weil es klug klingt. Die Lehre lautet, zu fragen, ob deine Repräsentation die richtige Art von Vereinfachung erzwingt.

## Warum sich das wieder modern anfühlt

Diskrete Repräsentationen klangen früher wie ein Nischenthema in RL. Heute wirken sie zentral für die Hälfte der Systeme, die wir bauen.

LLMs sind das offensichtliche Beispiel. Ein Modell sieht token IDs, keine Prosa. Der tokenizer entscheidet, welche Textstücke zu atomaren Einheiten werden. Diese Wahl beeinflusst Kosten, Kontextlänge, mehrsprachiges Verhalten, seltsame edge cases und manchmal Reasoning-Verhalten. Das [GPT-2 paper](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) ist nach heutigen Maßstäben alt, aber es machte den praktischen Punkt bereits: language modeling geschieht über Sequenzen von Symbolen. Moderne Systeme sind viel größer, aber der symbolische bottleneck ist noch da.

Agent systems haben dasselbe Problem in unordentlicherer Form. Ein Agent kann rohe Transkripte für immer behalten, aber das ist meist ein furchtbares Gedächtnis. Nützliche Agenten brauchen destillierten Zustand: offene Aufgaben, bekannte Einschränkungen, tool results, aktuellen Plan, ungelöste Risiken, Nutzerpräferenzen, Umgebungsfakten. Das ist eine diskrete-artige Repräsentation eines viel größeren kontinuierlichen Durcheinanders. Sie sagt: Dies sind die wenigen Zustände, die es lohnt mitzunehmen.

World models machen die Verbindung noch expliziter. Ein world model versucht, einen kompakten internen Simulator zu lernen: Wenn ich diese action aus diesem state ausführe, was passiert als Nächstes? [DreamerV3](https://arxiv.org/abs/2301.04104) ist hier ein moderner Orientierungspunkt und zeigt, wie mächtig es sein kann, Verhalten durch das Vorstellen zukünftiger trajectories in einem gelernten Modell zu lernen. Neuere Arbeiten wie [Discrete Codebook World Models for Continuous Control](https://arxiv.org/html/2503.00653v1) untersuchen weiter, wie discrete codebooks helfen können, selbst wenn das externe control problem kontinuierlich ist.

Kompression ist das stille vierte Geschwister. Wenn du komprimierst, wählst du, welche Unterschiede du ignorierst. Ein codebook ist ein Vertrag: Viele rohe Eingaben werden demselben internen Code zugeordnet, weil sie für den aktuellen Zweck nah genug beieinander liegen. Genau das tun auch gute Abstraktionen in Software. Sie klappen irrelevante Variation zusammen, damit der Rest des Systems denken kann.

Das Muster ist überall:

| System | Rohes Ding | Diskreter-artiger Bottleneck | Warum es hilft |
| --- | --- | --- | --- |
| LLM | Textbytes und Zeichen | Tokens | Vorhersagbare Sequenzeinheiten, begrenztes Vokabular, günstigeres Modeling |
| RL-Agent | Pixel oder Sensorströme | Kategorialer latenter Zustand | Sauberere transitions, einfacheres planning, bessere adaptation |
| World model | Umgebungshistorie | Learned codes | Kleinerer interner Simulator, weniger irrelevantes Detail |
| Agentengedächtnis | Vollständiges Transkript und Tool-Logs | Task-/State-Zusammenfassungen | Dauerhafter Kontext, ohne das Modell zu ertränken |
| Kompressionsmodell | Bilder, Audio, Video | Codebook entries | Nützliche Struktur bewahren und Rauschen verwerfen |

Deshalb taucht das Thema unter verschiedenen Namen immer wieder auf. Tokenization, quantization, bucketing, classification, learned codebooks, symbolic state, sparse binary features: Sie sind nicht identisch, aber sie stellen alle dieselbe technische Frage.

Was sind die Einheiten des Denkens?

## Der Trade-off

Diskrete Repräsentationen sind mächtig, weil sie Informationen wegwerfen.

Genau deshalb sind sie auch gefährlich.

Ein schlechter tokenizer verstümmelt eine Sprache. Ein schlechtes bucketing scheme löscht das Signal, das du gebraucht hättest. Ein schlechtes learned codebook bildet zwei sinnvoll unterschiedliche states auf denselben code ab und bringt der policy die falsche Lektion bei. Ein diskretes Agentengedächtnis kann selbstbewusst verlustbehaftet werden: Es bewahrt eine saubere summary und lässt genau das unbequeme detail fallen, das wichtig war.

Kontinuierliche Repräsentationen scheitern anders. Sie bewahren oft zu viel. Sie erlauben dem Modell, subtile Informationen weiterzutragen, aber der nachgelagerte learner muss herausfinden, welche Dimensionen wichtig sind. Sie können flexibel sein, aber rutschig.

Die praktische Wahl ist also nicht "diskret oder kontinuierlich?" Sie lautet:

- Wo brauche ich smoothness?
- Wo brauche ich stabile Kategorien?
- Wo gibt sich Rauschen als Information aus?
- Wo verschwendet das Modell Kapazität auf irrelevante Variation?
- Wo würde ein endliches Vokabular prediction, planning oder debugging leichter machen?

Wenn du diese Fragen nicht beantworten kannst, kann Diskretheit zur Dekoration werden. Wenn du sie beantworten kannst, wird sie zum Designwerkzeug.

## Ein Arbeitsrahmen

Das ist der Entscheidungsrahmen, den ich tatsächlich verwenden würde.

Nutze eine diskrete Repräsentation, wenn das System wiederholt dieselbe Art von Situation unter verrauschter Oberflächenvariation erkennen muss. Game states, UI states, workflow statuses, failure classes, customer intents, document chunks, tool outcomes und environment modes passen alle in dieses Muster.

Nutze eine diskrete Repräsentation, wenn das nächste Modell besser als classification denn als regression formuliert ist. "Welcher mode kommt als Nächstes?" vorherzusagen kann leichter und robuster sein, als einen exakten floating-point state vorherzusagen, besonders wenn die Zukunft multimodal ist.

Nutze eine diskrete Repräsentation, wenn du dauerhaftes Gedächtnis brauchst. Agenten müssen sich nicht an jeden token jeder Beobachtung erinnern. Sie brauchen einen kompakten Zustand, der lange genug überlebt, um die nächste Aktion zu leiten.

Sei vorsichtig mit diskreten Repräsentationen, wenn die Grenze willkürlich ist. Wenn zwei states nur getrennt sind, weil deine Implementierung einen bucket brauchte, kann das Modell diese falsche Unterscheidung erben. Dasselbe Problem sieht man ständig in Analytics-Dashboards: Ein Metrik-Schwellenwert wird zum Realitätsverzerrungsfeld.

Sei besonders vorsichtig, wenn der seltene Fall wichtig ist. Diskrete Kompression ist großartig darin, die gemeinsame Struktur zu bewahren. Sie kann brutal zu Ausnahmen sein. In safety-, fraud-, medical-, legal-, financial- oder security-Systemen kann das "tiny detail" der eigentliche Punkt sein.

## Der technische Geruch

Es gibt einen Geruch, den ich inzwischen öfter bemerke:

Das Modell sieht technisch alles, kann aber nicht nutzen, was es sieht.

Man sieht es, wenn ein Agent ein massive context window hat und trotzdem den Faden verliert. Man sieht es, wenn eine policy hochdimensionale Beobachtungen hat, sich aber nach einer kleinen environment change nicht anpassen kann. Man sieht es, wenn ein classifier reichere embeddings bekommt, aber an einfachen out-of-distribution variants scheitert. Man sieht es, wenn ein world model plausibel aussehenden Matsch statt nützlicher nächster Zustände vorhersagt.

In solchen Momenten kann mehr Kapazität helfen. Mehr Daten können helfen. Ein größeres Modell kann helfen.

Aber manchmal ist das fehlende Stück ein besserer bottleneck.

Das System muss gezwungen werden zu sagen: Dies gehört zu jenem, dieser Unterschied spielt keine Rolle, dieser Zustand ist schon einmal passiert, diese Aktion hat die Kategorie verändert, das ist der Teil, den man sich merken sollte.

Das ist der eigentliche Wert diskreter Repräsentationen. Sie machen Wiederverwendung möglich.

## Was ich an dieser Forschungslinie mag

Ich mag Meyers Arbeit, weil sie Repräsentation nicht als philosophische Garnitur behandelt. Sie setzt die Wahl experimentellem Druck aus. Wie gut lernt das world model? Wie viele Daten braucht die policy? Was passiert, wenn sich die Umgebung verändert? Überlebt der Vorteil, wenn wir von einem sauberen setup ins continual learning wechseln?

Das sind die richtigen Fragen.

Ich mag auch, dass die Antwort nicht karikaturhaft einfach ist. Das Paper beweist nicht, dass alle discrete latents gut sind. Es legt nahe, dass nützliche diskrete Repräsentationen mehrere Dinge zugleich tun: Sie senken capacity demands, strukturieren prediction, fördern sparsity und geben dem learner sauberere Griffe für adaptation.

Das fühlt sich auch in gewöhnlicher Technik wahr an.

Gute Systeme sind nicht rohe Realität bis ganz nach unten. Sie haben sorgfältig gewählte interfaces. Sie haben enums. Sie haben states. Sie haben event types. Sie haben schemas. Sie haben IDs. Sie haben summaries. Sie haben verlustbehaftete, nützliche Namen für wiederkehrende Situationen.

Machine-learning-Systeme brauchen dieselbe Disziplin. Der Unterschied ist, dass manche dieser Interfaces gelernt statt handgeschrieben sind.

## Die Essenz

Diskrete Repräsentationen sind wichtig, weil Intelligenz nicht nur bedeutet, ein mächtiges Modell zu haben. Es bedeutet auch, dem Modell nützliche Einheiten zum Denken zu geben.

Für RL kann das world models bedeuten, die mit weniger Kapazität nützlichere transitions lernen, und Agenten, die sich schneller anpassen, wenn sich die Welt verändert. Für LLMs zeigt es sich in tokenization und Kontextmanagement. Für Agenten zeigt es sich in memory, planning state und tool-use traces. Für Kompression und generative Modelle zeigt es sich in codebooks, die die Struktur bewahren, die es zu behalten lohnt.

Die praktische Lehre ist einfach:

Wenn ein System kämpft, frage nicht nur, ob das Modell groß genug ist. Frage, ob seine Repräsentation freundlich genug ist.

Klappt sie Rauschen zusammen? Bewahrt sie die Unterscheidungen, die zählen? Macht sie die nächste prediction leichter? Gibt sie dem Agenten ein wiederverwendbares Vokabular für die Welt?

Wenn ja, ist Diskretheit keine Einschränkung. Sie ist ein Griff.
