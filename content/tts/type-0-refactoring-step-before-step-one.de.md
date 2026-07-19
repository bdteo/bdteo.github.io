[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

[reflective] Es gibt eine Art von Refactoring, die Teams ständig machen, meist unter Druck, meist ohne sie zu benennen.

Du öffnest die Datei, in der der Bug lebt. Die Methode ist zu lang. Die Namen sind müde. Die Verzweigungen stapeln sich wie alte Stühle in einem Keller. Du spürst körperlich, dass es eine schlechte Idee ist, die angeforderte Änderung in dieser Codeform vorzunehmen.

Aber du bist noch nicht bereit, sie neu zu entwerfen.

Du versuchst nicht, eine neue Abstraktion einzuführen.

Du versuchst nicht zu beweisen, dass du die Clean-Code-Person im Raum bist.

Du versuchst, das aktuelle Verhalten so verständlich zu machen, dass die nächste Änderung sicher vorgenommen werden kann.

Ich nenne das Type-0-Refactoring.

[gently] Oder, weniger einprägsam, aber präziser:

Type-0-Refactoring ist die verhaltenserhaltende Aufräumarbeit, die du vor einer Verhaltensänderung machst, damit der Code lesbar, testbar und reviewbar wird.

Es ist der Schritt vor Schritt eins.

Nicht der eigentliche Umbau. Das Freiräumen der Werkbank. Das Beschriften der Kabel. Der Akt, die Sache lesbar zu machen, bevor du die Hände hineinsteckst.

Warum Type 0 einen Namen verdient.

Martin Fowler definiert Refactoring als Änderung der internen Struktur von Code ohne Änderung seines externen Verhaltens. Diese Präzision ist wichtig. Wenn sich Verhalten ändert, kann es immer noch wertvolle Arbeit sein, aber im strengen Sinn ist es kein Refactoring.

Type 0 ist enger als das.

Normales Refactoring kann das Design verbessern. Type 0 muss das nicht.

Normales Refactoring kann Verantwortlichkeiten zwischen Klassen verschieben. Type 0 sollte das nicht.

[deliberate] Normales Refactoring kann bessere Domain Boundaries schaffen. Type 0 hört früher auf: Es bringt den bestehenden Code dazu zu sagen, was er bereits tut.

Das klingt bescheiden, bis du während eines Hotfixes auf eine 900-Zeilen-Methode starrst und dein Gehirn anfängt zu puffern.

Das unmittelbare Problem in hässlichem Code ist oft nicht Architektur. Es ist Verständlichkeit. Du kannst nicht sicher ändern, was du nicht im Kopf halten kannst.

Sonars Arbeit zu Cognitive Complexity ist hier nützlich, weil sie „wie viele Pfade existieren?“ von „wie schwer ist das für einen Menschen zu verfolgen?“ trennt. Type 0 zielt auf die zweite Frage. Es reduziert die Menge an Zustand, Verzweigungen, Namensambiguität und visuellem Lärm, die ein Reviewer mental simulieren muss.

Das ist keine Kosmetik. Das ist Risikoreduktion.

Der Moment, in dem das Konzept geklickt hat.

Der Name entstand aus einem Hotfix.

Der Bug war intellektuell nicht tief. Die umgebende Methode war es. Es war die Art Methode, in der jede lokale Variable harmlos wirkt, bis du bemerkst, dass sie Bedeutung von drei Bildschirmen zuvor trägt. Jede Bedingung war isoliert überlebbar, aber die Kombination ließ den Ausführungspfad instabil wirken.

Ich brauchte kein schönes Design.

[matter-of-fact] Ich brauchte Debuggbarkeit:

weniger Verzweigungen pro Bildschirm.

Namen, die geschäftliche Absicht beschreiben statt temporäre Mechanik.

kleinere Stücke, durch die ich schrittweise gehen konnte.

eine Möglichkeit, das Cleanup zu reviewen, ohne gleichzeitig den Bugfix zu reviewen.

Ein LLM schlug mehrere vernünftige „Typen“ von Refactoring vor. Diesen Service extrahieren. Jenes Pattern einführen. Verantwortlichkeiten trennen. Alles gute Ideen. Alles zu viel für den Moment.

[reflective] Es fragte, ob es mit Type 1 anfangen sollte.

Ich sagte: nein, fang mit Type 0 an.

Gemeint war: Bevor wir das Design verbessern, mach den aktuellen Code lesbar, ohne zu ändern, was er tut.

Diese Unterscheidung rettete die Arbeit. Die Methode wurde navigierbar. Der Bug wurde sichtbar. Der Fix blieb klein.

Eine Arbeitsdefinition.

Type-0-Refactoring ist ein begrenzter, verhaltenserhaltender Durchgang, der Code vor einer funktionalen Änderung leichter verständlich macht.

Es hat vier erlaubte Bewegungen:

Bedeutungsvolle Teile in benannte Methoden oder lokale Variablen extrahieren.

Dinge so umbenennen, dass der Code menschliche Sprache statt Archäologie verwendet.

Lärm entfernen, der nachweislich unbenutzt ist.

Charakterisierungstests rund um das Verhalten hinzufügen oder schärfen, das du erhalten willst.

[emphasized] Und es hat drei harte Grenzen:

kein neues Produktverhalten.

keine Architekturbewegungen.

keine „wenn ich schon hier bin“-Verbesserungen, die die Review-Frage verändern.

Wenn der PR verändert, was Benutzer, Caller, Jobs, API Responses, Datenbankschreibvorgänge, emittierte Events oder Fehlerpfade beobachten, ist er nicht mehr Type 0. Das kann immer noch die richtige Arbeit sein, muss aber ehrlich benannt werden.

[deliberate] Vorher und nachher: die Form von Type 0.

Hier ist ein kleines Beispiel. Es ist absichtlich gewöhnlich. Das meiste nützliche Refactoring ist gewöhnlich.

Vorher:

Das ist kein schrecklicher Code. Das ist wichtig. Type 0 ist nicht nur für Katastrophen da.

Aber stell dir vor, du musst die Trial Eligibility ändern. Welche Regel änderst du? Welche ist manuelle Policy? Welche ist Billing History? Welche ist Plan Eligibility? Ein Reviewer muss all das aus der Mechanik ableiten.

Nach einem Type-0-Durchgang:

Das ist kein neues Design. Es führt kein Policy Object ein. Es entscheidet nicht, ob Trial Eligibility in ein anderes Modul gehört. Es macht die Regeln nicht eleganter.

Es tut eine Sache: Es gibt dem bestehenden Verhalten Namen.

Jetzt kann der nächste PR sagen: „Ändere hasPaidBeforeOrActiveTrial, sodass abgelaufene paid subscriptions anders behandelt werden“, und der Reviewer muss nicht mehr durch anonyme Conditionals spelunken.

Das ist Type 0 bei der Arbeit.

Der gefährliche Teil: Selbst „nur Extraction“ kann Verhalten ändern.

[conversational tone] Type 0 klingt sicher, weil es klein ist. Es ist sicherer, nicht magisch sicher.

Extraction kann Verhalten ändern, wenn du unachtsam bist bei:

Auswertungsreihenfolge.

Short-Circuiting.

Variablenscope.

Mutation.

Exception Timing.

wiederholten Aufrufen von Zeit, Random, IO, Caches oder Datenbankabfragen.

Referenzen, die vorher auf dasselbe Objekt zeigten.

[matter-of-fact] Hier braucht Type 0 Disziplin.

Schreibe eine Bedingung nicht um, nur weil die umgeschriebene Version „äquivalent“ ist. Äquivalenz ist der Ort, an dem Bugs sich einen kleinen Schnurrbart ankleben und an der Security vorbeilaufen.

Bevorzuge das:

Stattdessen nicht das:

Die zweite Version sieht schöner aus, erhält aber das Short-Circuit-Verhalten nicht mehr. Wenn account.invoices die Antwort bereits beweist, hat der alte Code weder account.trials noch new Date() berührt. Vielleicht ist das egal. Vielleicht nicht. Type 0 lässt den Reviewer nicht raten.

Im Zweifel: erst extrahieren, später verschönern, und jeden Schritt langweilig genug halten, dass ein müder Mensch ihn prüfen kann.

Das Sicherheitsnetz: Charakterisierung vor Vertrauen.

[deliberate] Wenn der Code bereits gut getestet ist, gut. Führe die fokussierten Tests vor und nach dem Type-0-Durchgang aus.

Wenn nicht, widerstehe dem Impuls zu sagen: „Das ist nur Cleanup.“.

Dieser Satz hat tausend Regressionen gestartet.

Michael Feathers' Working Effectively with Legacy Code ist immer noch das Buch, an das ich hier denke; der O'Reilly-Überblick rahmt es um die Änderung von Legacy-Systemen, ohne alles neu zu schreiben. In der Praxis ist der nützliche Zug oft ein kleiner Charakterisierungstest: Erfasse, was der Code aktuell für den Pfad tut, den du gleich anfassen wirst.

Nicht, was er tun sollte.

Was er tut.

Beispiel:

Dieser Test mag philosophisch unbefriedigend sein. Er kann Verhalten kodieren, das du in fünf Minuten ändern willst.

Gut. Lösche oder aktualisiere ihn im verhaltensändernden PR.

Für den Type-0-PR ist seine Aufgabe bescheiden: beweisen, dass das Cleanup die eigentliche Änderung nicht eingeschmuggelt hat.

Wann du zu Type 0 greifen solltest.

Nutze Type 0, wenn die nächste Änderung durch mangelnde Verständlichkeit blockiert ist.

Gute Signale:

du liest dieselbe Methode immer wieder und verlierst den Faden.

die Datei hat eine „main“-Methode, die Validation, Branching, IO, Formatting und Persistence mischt.

ein einzeiliger Bugfix erfordert die Erklärung von sechs unabhängigen Fakten.

[reflective] Reviewer streiten weiter über Stil, weil die Absicht nicht sichtbar ist.

der Code ist korrekt genug, um das Business zu tragen, aber zu schlammig, um ihn mit Vertrauen zu ändern.

du musst Tests hinzufügen, aber die aktuelle Form bietet dir keinen sauberen Punkt, um Verhalten zu beobachten.

Vermeide Type 0, wenn:

die funktionale Änderung bereits offensichtlich und sicher ist.

du nicht genau erklären kannst, welches Verhalten unverändert bleiben muss.

das Cleanup viele Caller im System berühren müsste.

das Team versucht, ein Redesign durch ein „Cleanup“-Label zu schmuggeln.

es keine nahe Änderung gibt, die von der Klarheit profitiert.

Der letzte Punkt ist wichtig. Cleanup ohne Kunden wird oft zu Geschmack. Type 0 hat einen Kunden: die nächste Änderung.

Eine Entscheidungsregel für Type 0.

Das ist die Regel, die ich benutze:

Wenn ich den verhaltensändernden Diff nicht so schreiben kann, dass ein Reviewer ihn schnell versteht, brauche ich wahrscheinlich zuerst Type 0.

Nicht immer. Aber oft genug.

Du kannst es auch als drei Fragen formulieren:

Welches Verhalten werde ich gleich ändern?

Welches aktuelle Verhalten muss exakt gleich bleiben?

Welcher kleine Lesbarkeitsdurchgang würde beide Antworten im Diff offensichtlich machen?

[matter-of-fact] Wenn Frage drei eine kleine Antwort hat, mach Type 0.

Wenn sie eine riesige Antwort hat, schaust du vielleicht auf echtes Refactoring, nicht auf Type 0. Teile die Arbeit auf, mache einen Plan und hör auf so zu tun, als wäre es harmlos.

Wie du den PR strukturierst.

Type 0 funktioniert am besten, wenn es als eigene Sache reviewbar ist.

Wenn das Cleanup winzig ist, lege es in den ersten Commit des funktionalen PRs:

Type 0: name existing trial eligibility checks.

Fix expired subscription trial eligibility.

[deliberate] Wenn das Cleanup groß genug ist, dass der Verhaltensdiff schwer zu sehen wird, öffne einen separaten PR.

Benutze langweilige PR-Sprache:

Das gibt Reviewern die richtige Aufgabe.

Sie reviewen nicht, ob die Produktlogik besser ist. Sie reviewen, ob der Code immer noch dasselbe tut, nur lesbarer.

Gute Review-Kommentare für Type 0 klingen so:

„Diese Extraction ändert, wann new Date() ausgewertet wird. Können wir das alte Short-Circuit-Verhalten erhalten?“.

„Der neue Name sagt active subscription, aber das Prädikat behandelt past_due ebenfalls als aktiv. Kann der Name dem tatsächlichen Verhalten entsprechen?“.

„Dieser gelöschte Helper wirkt in diesem Package unbenutzt, aber wird er durch reflection/config referenziert?“.

„Können wir einen Charakterisierungstest für den Pfad hinzufügen, den dieses Cleanup freilegt?“.

Weniger nützliche Kommentare klingen so:

„Können wir daraus eine strategy machen?“.

„Dieses ganze Modul sollte event-driven sein.“.

„Wenn du schon hier bist, kannst du den seltsamen Billing Edge Case fixen?“.

[conversational tone] Das können gute Ideen sein. Sie sind kein Type-0-Review.

Worin sich Type 0 von Aufräumtheater unterscheidet.

Aufräumtheater ist Arbeit, die im Diff tugendhaft aussieht, aber das Risiko für die nächste Änderung nicht senkt.

Es hat meist einen dieser Gerüche:

breiter Formatting Churn in Dateien, die niemand gleich anfassen wird.

Umbenennungen nach persönlichem Geschmack statt nach fachlicher Klarheit.

Code in neue Abstraktionen verschieben, bevor jemand das aktuelle Verhalten benennen kann.

„unbenutzten“ Code löschen, ohne zu beweisen, dass der Runtime ihn nicht erreichen kann.

Cleanup mit einer Verhaltensänderung mischen, sodass Reviewer nicht sagen können, welche Zeile was getan hat.

eine PR-Beschreibung, die „misc cleanup“ sagt.

Type 0 ist anders, weil es rechenschaftspflichtig ist.

Es sagt:

hier ist das Verhalten, das wir erhalten.

hier ist der Pfad, den wir verständlich machen.

hier ist die nächste Änderung, die das ermöglicht.

hier ist, wie wir geprüft haben, dass das Cleanup kein Verhalten geändert hat.

[matter-of-fact] Das ist der Unterschied zwischen Aufräumen und Engineering.

Type 0 und legacy seams.

Manchmal zeigt Type 0, dass der nächste sichere Schritt eine Seam ist.

Fowlers Notiz zu legacy seams ist nützlich, weil sie Stellen beschreibt, an denen wir Verhalten umleiten, beobachten oder testen können, ohne die Source genau am Verhaltenspunkt zu bearbeiten. In einem Legacy-System kann eine Seam der Unterschied sein zwischen „wir können das testen“ und „wir hoffen sehr professionell“.

Aber eine Seam zu schaffen kann die Type-0-Grenze überschreiten.

Eine Methode extrahieren, damit der aktuelle Flow benannt wird:

zu:

Das kann Type 0 sein, wenn das Verhalten gleich bleibt.

Die Funktionssignatur ändern, damit Tests einen Fake Shipping Provider injizieren können:

[reflective] Das kann der richtige Zug sein, aber es ist nicht mehr nur, den bestehenden Code verständlich zu machen. Es verändert die Kollaborationsoberfläche. Behandle es als dependency-breaking Refactoring und reviewe es mit diesem Maß an Sorgfalt.

Type 0 kann auf die Seam zeigen. Es muss nicht die ganze Testing Architecture im selben PR erschaffen.

Eine praktische Type-0-Checklist.

Bevor du den PR öffnest:

Ich kann die verhaltensändernde Arbeit benennen, auf die dieses Cleanup vorbereitet.

Der PR ändert absichtlich kein user-visible oder caller-visible Verhalten.

Extrahierte Methoden erhalten Auswertungsreihenfolge und Short-Circuit-Verhalten.

Namen beschreiben, was der Code tatsächlich tut, nicht was ich mir wünsche, dass er tut.

Gelöschter Code ist im relevanten Runtime nachweislich unbenutzt, nicht nur unbeliebt.

Ich habe fokussierte Tests ausgeführt oder das relevante Szenario erneut abgespielt.

Wenn Tests fehlten, habe ich Charakterisierungs-Coverage für den berührten Pfad hinzugefügt.

[deliberate] Die PR-Beschreibung sagt Reviewern, dass dies Type 0 ist und was out of scope bleibt.

Während des Reviews:

Frage „erhält das Verhalten?“ vor „bevorzuge ich dieses Design?“.

Schiebe Verhaltensänderungen in einen Follow-up-Commit oder PR.

Behalte Architekturideen als Notizen, außer sie sind für Sicherheit erforderlich.

Sei misstrauisch gegenüber cleverer Äquivalenz.

Nach dem Merge:

[reflective] Mach die echte Änderung, solange das mentale Modell frisch ist.

Lösche oder aktualisiere Charakterisierungstests nur, wenn sich Verhalten absichtlich ändert.

Lass Type 0 nicht zu einem Parkplatz für ewiges Cleanup werden.

Das Versprechen.

Type-0-Refactoring ist ein kleines Versprechen:

Ich mache diesen Code leichter änderbar, ohne zu ändern, was er tut.

Dieses Versprechen ist gerade deshalb nützlich, weil es begrenzt ist.

Es gibt dem Entwickler die Erlaubnis, die Arbeitsfläche zu verbessern, ohne eine Architekturdebatte zu beginnen. Es gibt dem Reviewer einen klaren Standard. Es gibt dem nächsten PR eine faire Chance, von der eigentlichen Produktänderung zu handeln.

Manchmal ist das Mutigste, was du in einer chaotischen Codebase tun kannst, nicht, sie neu zu designen.

[gently] Manchmal ist es, zuerst dafür zu sorgen, dass das aktuelle Chaos die Wahrheit sagt.
