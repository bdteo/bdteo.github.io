Die Idee, unsere Gewohnheiten wirklich zu verstehen, besonders jene, die wir fast unbewusst ausführen, hat mich schon immer fasziniert. Was wäre, wenn unsere Wearables uns einen sanften, nicht wertenden Spiegel für diese Muster anbieten könnten? Aus dieser Frage entstand das Projekt "Still Mirror": ein Versuch, Rauch- oder Vaping-Ereignisse passiv anhand der reichhaltigen physiologischen Daten einer Apple Watch zu erkennen, ohne manuelle Eingaben durch den Nutzer zu verlangen. Es geht nicht darum, noch eine weitere Entwöhnungs-App zu bauen, sondern um ein Werkzeug für reine, unverfälschte Wahrnehmung.

[reflective] Die Herausforderung: Ein Flüstern in einer Symphonie aus Rauschen.

Die zentrale Herausforderung ist enorm: Wie unterscheidet man die subtile physiologische Signatur eines Rauch-/Vaping-Ereignisses von den unzähligen anderen Alltagsaktivitäten und körperlichen Reaktionen? Stress, ein zügiger Spaziergang, ein erschreckendes Geräusch oder sogar eine Tasse Kaffee können vorübergehende Veränderungen der Herzfrequenz (HR) und der Herzfrequenzvariabilität (HRV) auslösen. Das Signal, nach dem wir suchen, ist oft ein Flüstern in einer Symphonie physiologischen Rauschens.

Aber um diese flüchtigen Ereignisse wirklich zu isolieren, brauchte ich eine ausgefeiltere Technik zur Signalverarbeitung.

Wahl des Werkzeugkastens: Apple-Ökosystem und Swift.

[matter-of-fact] Für ein Projekt, das auf die Apple Watch zielt, ist die Ökosystemwahl klar:

Xcode und Swift: Die native Entwicklungsumgebung für Apple-Plattformen. Sich darauf einzulassen bedeutete, tiefer in Swift einzutauchen, eine Sprache, die ich elegant und mächtig finde, und sich durch die Feinheiten von Xcode zu bewegen.

[slows down] HealthKit: Apples Framework ist das Tor zu den wesentlichen Datenströmen: Herzfrequenz, HRV (SDNN/RMSSD), SpO2 (besonders relevant für Verbrennung vs. Vaping) und Aktivitätsniveau. Das datenschutzorientierte Design von HealthKit ist entscheidend für eine App, die mit so sensiblen Daten umgeht.

watchOS-Einschränkungen: Für die Watch zu entwickeln bedeutet, Funktionalität ständig gegen Ressourcenbeschränkungen abzuwägen – Akkulaufzeit und Hintergrundverarbeitung sind immer präsent.

[conversational tone] Das algorithmische Herz: Stationary Wavelet Transform (SWT).

Klassische Zeitreihenanalyse hat oft Schwierigkeiten mit nicht-stationären Signalen – Signalen, deren statistische Eigenschaften (wie Mittelwert und Varianz) sich über die Zeit verändern. Physiologische Daten sind notorisch nicht-stationär. Genau hier kommt die Stationary Wavelet Transform (SWT) ins Spiel.

Anders als die übliche Discrete Wavelet Transform (DWT), die verschiebungsvariant ist (das heißt, eine kleine Verschiebung im Eingangssignal kann die Wavelet-Koeffizienten dramatisch verändern), ist SWT verschiebungsinvariant. Das macht sie robuster für die Analyse von Signalen, bei denen der exakte Zeitpunkt von Ereignissen entscheidend ist, aber leicht variieren kann.

[deliberate] Warum SWT für dieses Problem?

Zeit-Frequenz-Lokalisierung: SWT kann ein Signal in verschiedene Frequenzbänder zerlegen und dabei zeitliche Information bewahren. Das heißt, wir können nach bestimmten Frequenzmerkmalen suchen (z. B. plötzliche Ausbrüche hochfrequenter Aktivität in der HR oder bestimmte Veränderungen in HRV-Frequenzbändern), die zu präzisen Momenten auftreten.

Entrauschen: Physiologische Signale sind verrauscht. SWT kann helfen, das zugrunde liegende "wahre" Signal vom Zufallsrauschen zu trennen, indem Wavelet-Koeffizienten auf verschiedenen Skalen analysiert werden.

Erkennung transienter Ereignisse: Sie ist besonders gut darin, abrupte Änderungen, Spitzen oder kurzlebige Ereignisse in einem Signal zu identifizieren, also genau das, was wir von der akuten physiologischen Reaktion auf Nikotinzufuhr erwarten könnten.

[matter-of-fact] Im Kern wirkt SWT wie ein ausgefeilter Satz von Filtern, der uns erlaubt, Muster in HR-, HRV- und potenziell SpO2-Daten zu "sehen", die durch Rauschen oder langfristige Trends verdeckt sein könnten. Wir können nach charakteristischen "Formen" oder Energieänderungen in bestimmten Wavelet-Unterbändern suchen, die dem physiologischen Ruck entsprechen.

Die Entwicklungsreise: Von Daten zur Erkennung.

Datenerfassung (HealthKit): Zuverlässiges Abrufen von HealthKit-Daten im Hintergrund einrichten, Nutzerberechtigungen respektieren und Datenaktualisierungen effizient verarbeiten.

Signalvorverarbeitung: Die eingehenden HR-, HRV- und SpO2-Daten bereinigen. Dazu gehört der Umgang mit fehlenden Datenpunkten und vielleicht eine erste Filterung, bevor SWT angewendet wird.

[conversational tone] SWT-Anwendung: Die Stationary Wavelet Transform auf Segmente der physiologischen Zeitreihen anwenden. Dazu gehört die Wahl eines geeigneten Mother Wavelets (z. B. Daubechies, Symlet) und einer Zerlegungsebene.

Feature-Extraktion aus Wavelet-Koeffizienten: Hier passiert die Magie (und eine Menge Experimentieren). Statt direkt auf rohe HR-/HRV-Werte zu schauen, analysieren wir die SWT-Koeffizienten. Relevante Features könnten sein:

Energie in bestimmten Detailkoeffizienten-Bändern rund um den Zeitpunkt eines vermuteten Ereignisses.

Statistische Eigenschaften (Varianz, Kurtosis) der Koeffizienten.

Kreuzkorrelation zwischen Wavelet-Koeffizienten verschiedener physiologischer Signale (z. B. HR und HRV).

Erkennungslogik/-modell: Anfangs könnte das ein regelbasiertes System sein, das nach bestimmten Mustern in den extrahierten Wavelet-Features sucht (z. B. "ein signifikanter Energieanstieg in HR-Detailkoeffizienten auf Skala X, zeitgleich mit einem starken Energieabfall in HRV-Detailkoeffizienten auf Skala Y, während einer Phase geringer körperlicher Aktivität"). Später könnte sich daraus ein Machine-Learning-Modell entwickeln, das auf diesen Features trainiert wird.

Konfidenzbewertung: Wie in meinem MVPS-Algorithmus skizziert, ist es entscheidend, für jedes erkannte Ereignis einen Konfidenzwert zu erzeugen, der Stärke und Klarheit der Signatur widerspiegelt.

watchOS-App-Implementierung: Den Kernalgorithmus zur Erkennung auf der Apple Watch ausführen und dabei auf Akkulaufzeit optimieren (z. B. Daten in Batches verarbeiten, Analyse intelligent auslösen).

iOS-Companion-App: Zur Anzeige der Timeline erkannter Ereignisse, für Einblicke und zur Verwaltung von Einstellungen. Datensynchronisierung via WatchConnectivity ist hier zentral.

Gesundheit und Ethik: Die "Spiegel"-Philosophie.

[deliberate] Es ist wichtig, noch einmal zu betonen, dass "Still Mirror" als Awareness-Werkzeug gedacht ist, nicht als Medizinprodukt oder Entwöhnungsprogramm.

Privacy First: Die gesamte Verarbeitung, besonders die sensible Algorithmusarbeit, sollte idealerweise auf dem Gerät stattfinden. Der Zugriff auf HealthKit-Daten ist strikt berechtigungsbasiert.

Kein Urteil: Die Oberfläche der App und alle Einsichten, die sie liefert, müssen neutral bleiben und Muster lediglich widerspiegeln, ohne vorschreibende Ratschläge oder Beschämung.

Genauigkeit und Transparenz: Nutzer müssen die Grenzen der App verstehen. Falsch positive und falsch negative Ergebnisse sind bei einer so komplexen, passiven Erkennung unvermeidlich. Transparenz über die Konfidenz von Erkennungen ist wichtig.

[conversational tone] Selbstermächtigung des Nutzers: Ziel ist es, Nutzern Daten über ihren eigenen Körper und ihre Gewohnheiten zu geben, damit sie ihre eigenen informierten Entscheidungen treffen können.

Swift lernen und sich im Apple-Ökosystem zurechtfinden.

Für Entwickler, die vor allem aus anderen Welten kommen (wie meinen PHP-/Laravel-Wurzeln), ist der Einstieg in Swift, SwiftUI, Xcode und die spezifischen Einschränkungen der watchOS-Entwicklung eine deutliche Lernkurve. Apples Frameworks haben eine eigene Philosophie. App-Lebenszyklen, Hintergrundaufgaben, HealthKit-Queries und Kommunikation zwischen Geräten (WatchConnectivity) haben jeweils ihre eigenen Muster und "Apple-Wege", Dinge zu tun. Trotzdem machen die reichhaltige Dokumentation, die starke Community und die Kraft von Swift diese Reise lohnend.

[reflective] Fazit: Das Potenzial eines stillen Beobachters.

"Still Mirror" ist weiterhin eine Erkundung, ein anspruchsvolles Unterfangen, um die Grenzen dessen zu verschieben, was passives Sensing auf einem Consumer-Wearable leisten kann. Die Stationary Wavelet Transform bietet einen vielversprechenden Weg, komplexe physiologische Signale zu zerlegen und die subtilen Signaturen freizulegen, nach denen wir suchen.

Die Reise besteht nicht nur daraus, Swift-Code zu schreiben und mit Xcode zu ringen, sondern auch daraus, in Signalverarbeitungstheorie einzutauchen, menschliche Physiologie zu verstehen und die ethischen Folgen einer solchen Technologie sorgfältig abzuwägen. Ob "Still Mirror" einmal eine breit genutzte App wird oder eine filigrane technische Erkundung bleibt: Der Prozess selbst zeigt diese faszinierende Schnittstelle von KI, Gesundheit und persönlicher Technologie. Es geht darum, diese ruhige, reflektierende Oberfläche zu bauen – einen stillen Spiegel – für mehr Selbstwahrnehmung.

[slows down] Was denkst du über den Einsatz fortgeschrittener Signalverarbeitung wie SWT zur passiven Erkennung von Gewohnheiten? Ich würde deine Gedanken dazu gern unten in den Kommentaren lesen!
