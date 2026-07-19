[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

[conversational tone] Was ist gute Code Coverage? Ein risikobasierter Leitfaden.

Gute Code Coverage ist nicht 80 Prozent. Sie ist nicht 90 Prozent. Sie ist nicht der heilige Schein eines Dashboards, das 100 Prozent anzeigt.

Gute Code Coverage bedeutet dies:

Die Teile des Systems, deren Bruch am meisten wehtun würde, sind durch Tests abgedeckt, die wirklich fehlschlagen würden, wenn diese Teile falsch sind.

Das ist der ganze Trick. Die Prozentzahl ist nützlich, aber erst nachdem man weiß, welche Art Code man betrachtet, wie oft er sich ändert, wen ein Bug trifft und ob die Tests echte Assertions machen oder nur mit einer Laterne durch den Code spazieren.

Ich schaue immer noch auf die Zahl. Ich mag Zahlen. Sie machen vage Angst sichtbar. Aber ich frage nicht mehr isoliert: "Sind 82 Prozent gut?" Ich stelle eine bessere Frage:

Welches Risiko ist noch nicht abgedeckt, und fühlen wir uns wohl dabei, dieses Risiko zu shippen?

[reflective] Diese Frage funktioniert für Engineers, die Tests schreiben, für Leads, die Qualitätsgrenzen setzen, und für Reviewer, die entscheiden müssen, ob ein PR sicher gemerged werden kann.

Die kurze Antwort.

Wenn du eine Startregel brauchst, nimm diese:

Codebereich, Gute Coverage-Zielmarke, Warum.

[matter-of-fact] Core domain rules, Geld, permissions, security, Pfade zu Datenverlust; 90-100 Prozent aussagekräftige line und branch coverage; Ein kleiner Bug kann teuer, peinlich oder irreversibel werden.

Public libraries, SDKs, reusable packages; 90 Prozent oder mehr plus edge cases und compatibility tests; Deine Nutzer können deine Absicht nicht inspizieren. Die API ist das Produkt.

Normaler SaaS application code; 70-85 Prozent overall, höher bei riskanten modules; Die meisten Teams bekommen hier starken Nutzen, ohne Tests in Theater zu verwandeln.

Legacy systems unter 50 Prozent; Nicht zuerst der globalen Zahl hinterherlaufen; Decke geänderten Code und gefährliche flows ab, bevor du versuchst, das Dashboard zu "reparieren".

Generated code, framework glue, debug logging, trivial wrappers; Oft ausgeschlossen oder leicht smoke-tested; Coverage hier kann laut und teuer sein, ohne viel Risiko zu senken.

Das sind keine religiösen Zahlen. Das sind Defaults, über die ein Team meiner Meinung nach streiten sollte.

Googles Testing Guidance sagt, dass es keine universelle Idealzahl gibt, und rahmt Coverage über business impact, change frequency, expected lifetime, complexity und domain risk. Martin Fowler macht denselben tieferen Punkt aus einem anderen Winkel: Coverage hilft, ungetesteten Code zu finden, ist aber eine schlechte eigenständige Aussage über Testqualität.

Das passt zu meiner Erfahrung. Niedrige Coverage ist ein Rauchmelder. Hohe Coverage ist keine Garantie.

Was Coverage dir sagen kann.

Coverage ist am besten darin, Abwesenheit zu zeigen.

Sie kann dir sagen:

Diese Datei wird von automatisierten Tests nie ausgeführt.

Dieser error branch ist in CI nie gelaufen.

Diese neue payment rule wurde gemerged, ohne dass ein Test sie berührt hat.

Dieser refactor hat behavior gelöscht, das kein Test bemerkt hat.

[deliberate] Dieses repository hat ganze Stadtviertel, in denen Bugs mietfrei wohnen können.

Das ist bereits wertvoll. Googles Paper zu code coverage at Google fand Coverage am actionable, wenn sie auf Ebene von changesets und code review gezeigt wird. Ich mag dieses Framing: Coverage gehört nah an den Diff, wo ein Mensch fragen kann: "Ist diese ungetestete Zeile relevant?"

Als executive health score ist Coverage weniger nützlich. Ein Manager, der "88 Prozent" sieht, kann nicht erkennen, ob die fehlenden 12 Prozent ungenutzter debug output sind oder der refund path, der entscheidet, ob Kunden ihr Geld zurückbekommen.

Was Coverage nicht beweisen kann.

Eine abgedeckte Zeile ist nicht zwingend getestetes behavior.

Coverage kann nicht beweisen, dass:

die assertions aussagekräftig sind.

die test data der Produktion ähneln.

der unhappy path geprüft und nicht nur ausgeführt wird.

[matter-of-fact] die UI nutzbar ist.

die query schnell genug ist.

der feature flag korrekt konfiguriert ist.

der concurrent case funktioniert.

die mocks ehrlich sind.

der Code einfach genug zu warten ist.

Man kann 100 Prozent line coverage mit Tests erreichen, die Funktionen aufrufen und fast nichts assert-en. Man kann auch hohe Coverage aus end-to-end tests bekommen, die nebenbei durch viel Code laufen und die wichtigen Entscheidungen kaum prüfen.

[conversational tone] Darum sollte ein coverage gate nie das einzige quality gate sein. Kombiniere es mit review, production incidents, property oder fuzz tests, wo sie passen, contract tests um integrations herum und mutation testing für Code, bei dem correctness wirklich zählt.

Die Entscheidungsregel, die ich in Reviews nutze.

Wenn ich einen PR reviewe, frage ich nicht nach Tests, weil "wir coverage brauchen". Ich frage danach, weil sich behavior geändert hat und ich Belege will, dass dieses behavior geschützt ist.

Meine checklist ist kurz:

Was kann schiefgehen? Benenne den failure mode, bevor du den Test schreibst.

Wer bezahlt dafür? User, support team, finance, security, data integrity, future developer?

Wie oft wird sich dieser Code ändern? Häufig angefasster Code verdient mehr Tests, weil er öfter kaputtgehen wird.

Kann ein Test den failure günstig fangen? Wenn ja, schreib ihn. Wenn nein, denke über monitoring, manual QA, static analysis oder ein einfacheres Design nach.

Würde der Test bei dem Bug fehlschlagen, den wir fürchten? Wenn nicht, ist es wahrscheinlich coverage cosplay.

Der letzte Punkt ist der wichtigste. Ein Test, der nicht fehlschlägt, wenn der Code falsch ist, ist kein safety net. Er ist Bühnendekoration.

Was man zuerst testen sollte.

Wenn ein Projekt schwache Coverage hat und alle über das Ziel streiten, hört für einen Nachmittag auf zu streiten und schreibt Tests in dieser Reihenfolge.

1. Geld, permissions und irreversible Aktionen.

[deliberate] Payments, refunds, billing periods, subscription state, authorization, destructive deletion, email sends, data imports, migrations und alles, was kundeneigene Daten verändert.

Für eine SaaS app hätte ich lieber 95 Prozent coverage auf subscription transitions und 55 Prozent overall als 80 Prozent overall mit einer fast nackten billing state machine.

2. Business rules, die Leute mit "except when" erklären.

Das sind großartige Tests, weil die Seltsamkeit schon in der Sprache steckt.

"A trial can be extended once, except when the account has already paid, unless it was migrated from the legacy plan."

Dieser Satz will Tests. Mehrere.

3. Parsers, serializers, mappers und importers.

Coverage zahlt sich überall schön aus, wo Datenform zählt. CSV imports, webhook payloads, date parsing, currency conversion, address normalization, search indexing, Open Graph extraction, alles davon.

Diese Tests sind oft günstig, stabil und voller edge cases. Man bekommt guten Schutz, ohne einen browser, einen queue worker und den halben Mond zu brauchen.

4. Code mit branching logic.

Line coverage versteckt verpasste Entscheidungen. Branch coverage ist besser für conditionals, weil sie fragt, ob beide Seiten einer Entscheidung gelaufen sind. Die branch coverage docs von coverage.py zeigen die klassische Falle: statement coverage kann eine Funktion als covered markieren, obwohl ein if nie in beide Richtungen ausgewertet wurde.

In PHP dokumentiert PHPUnit line, branch und path coverage separat, wobei branch coverage prüft, ob control structures sowohl true als auch false ausgewertet haben. Der Haken sind die Tooling-Kosten: PCOV ist schnell für line coverage, während Xdebug für branch und path coverage gebraucht wird. Nutze das schwerere Signal dort, wo die Logik es verdient.

5. Bugs, die bereits passiert sind.

Jeder production bug ist eine kostenlose Testidee. Nicht immer ein unit test, aber mindestens irgendwo ein regression test.

Wenn ein Bug entkommt, mag ich diese kleine Postmortem-Frage:

Welcher Test wäre fehlgeschlagen, wenn wir ihn gestern geschrieben hätten?

Wenn die Antwort einfach ist, schreib diesen Test, bevor du weitermachst.

Was man ignorieren, ausschließen oder depriorisieren sollte.

[matter-of-fact] Code zu ignorieren ist kein Betrug, wenn sich das Team einig ist, warum er ignoriert wird.

Gute Kandidaten:

generated code.

framework bootstrap files.

one-line configuration wrappers.

debug-only logging.

defensive branches, die im aktuellen runtime nicht passieren können.

Code, der besser gelöscht als getestet wird.

integration glue, der bereits durch einen higher-level smoke test abgedeckt ist.

Schlechte Kandidaten:

"too hard to test" business logic.

alter Code, den alle Angst haben anzufassen.

payment, auth, import oder permission paths.

branches, die nur deshalb unmöglich wirken, weil niemand production data geprüft hat.

Code hinter einem feature flag, der aber schon für customers reachable ist.

[conversational tone] Meine Regel: Wenn wir etwas aus Coverage ausschließen, sollte der Grund langweilig und im Review verteidigbar sein. "Generated by OpenAPI" ist langweilig. "Wir hatten keine Lust, checkout zu testen" ist es nicht.

Beispiele nach Anwendungstyp.

CRUD SaaS.

Die meisten CRUD apps brauchen keine heroische Coverage auf jedem controller branch. Sie brauchen starke Coverage auf permissions, validation, state transitions, background jobs, billing, imports, exports und allem, was customer data corrupt-en kann.

Eine gesunde Form könnte so aussehen:

hohe unit coverage auf domain services und policies.

integration tests für wichtige API endpoints.

[matter-of-fact] ein paar end-to-end smoke tests für signup, checkout, core workflow und cancellation.

coverage gates auf changed code, keine plötzliche Forderung, dass die ganze legacy app auf 90 Prozent springt.

Frontend Product.

Bei frontend work kann line coverage schnell albern werden, wenn man jedes rendering detail jagt. Mir sind user-visible states wichtiger:

loading, empty, error, success.

disabled und permission-gated actions.

optimistic updates und rollback.

forms mit validation und server errors.

accessibility-critical behavior wie focus, labels und keyboard paths.

Der exakte Farbton einer dekorativen border braucht keinen unit test. Der "delete account" confirmation flow schon.

Public Library Or SDK.

Leg die Latte höher. Deine edge cases sind der production outage von jemand anderem.

Teste die documented API, nicht nur die internals. Nimm compatibility cases, invalid input, error messages, serialization, version boundaries und examples aus dem README auf. Wenn ein user es paste-n kann, sollte es wahrscheinlich getestet sein.

Data Pipeline Or Import System.

Coverage sollte zu fixtures und invariants tendieren:

malformed rows.

missing fields.

duplicate IDs.

timezone edges.

[emphasized] retry und idempotency behavior.

partial failure handling.

"this must never decrease" totals.

Hier kann 75 Prozent line coverage mit hervorragenden fixtures besser sein als 95 Prozent coverage, die nur den happy path testet.

Infrastructure And DevOps Code.

Für Terraform, deployment scripts, queue workers und one-off operational tools ist die beste Coverage vielleicht keine unit percentage. Sie kann dry-run mode, shellcheck/static checks, staged rollout, idempotency tests und sehr klares logging sein.

Trotzdem: Wenn ein Script berechnet, welche database rows gelöscht werden, teste diese Berechnung, als würde sie dir Geld schulden.

Nutze Diff Coverage vor Global Coverage.

Global coverage verbessert sich langsam und lässt sich leicht gamen. Diff coverage ist der Ort, an dem Teams tatsächlich besser werden.

Für neuen und geänderten Code mag ich eine strengere Regel:

Changed risky code sollte ungefähr 90 Prozent oder mehr covered sein.

Changed trivial code kann niedriger liegen, wenn der reviewer erklären kann, warum.

Overall project coverage sollte nicht ohne expliziten Grund fallen.

Legacy files sollten jedes Mal ein bisschen sauberer werden, wenn man sie anfasst.

Das ist die praktische Version der boy-scout rule: Verlange nicht von einem Team, fünf Jahre fehlender Tests zu reparieren, bevor es eine kleine Verbesserung merged, aber lass diese kleine Verbesserung das Loch nicht tiefer machen.

Jest unterstützt thresholds globally, by glob, directory oder file, einschließlich separater thresholds für branches, functions, lines und statements. Ein TypeScript project könnte mit so etwas starten:

[deliberate] Die genauen Zahlen zählen weniger als die Form: Das riskante directory hat eine höhere Latte als der Rest der app.

Für ein PHP project will ich lokal meist schnelle line coverage und tiefere branch/path coverage nur dort, wo sie sich lohnt. Die aktuellen Coverage-Docs von PHPUnit sagen ausdrücklich, dass branch und path coverage Xdebug benötigen, während PCOV line coverage unterstützt. Das ist ein trade-off, kein moralisches Versagen. Fast feedback gewinnt während normaler Entwicklung; tiefere Coverage gehört in CI oder targeted checks, wenn die Logik gnarly ist.

Branch Coverage ist eine bessere Frage, keine perfekte.

Line coverage fragt:

Ist diese Zeile gelaufen?

Branch coverage fragt:

Ist jede Entscheidung in beide Richtungen gelaufen?

Diese zweite Frage ist normalerweise näher an dem, was wir mit "getestet" meinen. Aber branch coverage kann trotzdem laut werden. Einige branches sind defensive. Einige sind artifacts of transpilation. Einige sind technically possible, aber irrelevant. Einige sind teuer durch einen Test zu zwingen, für sehr wenig Wert.

Also ja, nutze branch coverage für decision-heavy code. Ersetze nur nicht ein stumpfes Idol durch ein anderes.

[conversational tone] Mutation Testing: Der Reality Check.

Mutation testing verändert deinen Code auf kleine Arten und prüft, ob deine Tests fehlschlagen. Zum Beispiel kann es ist besser als in >=, true in false oder + in — ändern.

Wenn die Tests trotzdem durchlaufen, hat der mutant überlebt. Das ist eine nützliche Beleidigung von der Maschine.

Das fängt die klassische Coverage-Lüge: "Die Zeile lief, aber niemand hat das behavior asserted." Die PHP-Dokumentation von Infection zeigt genau diese Lücke mit getrennten mutation score und covered-code mutation score metrics. In JavaScript spielt Stryker eine ähnliche Rolle. In JVM land ist PIT der bekannte Name.

Ich würde mutation testing nicht am ersten Tag überall laufen lassen. Es kann langsam und laut sein. Ich würde es ausführen auf:

billing rules.

permission checks.

validators.

calculators.

parsers.

Code, der hohe coverage hat, aber weiterhin bugs produziert.

[matter-of-fact] libraries, bei denen API behavior das Produkt ist.

Mutation testing ist kein Ersatz für Coverage. Es ist die Frage, die man stellt, nachdem Coverage sagt: "Ja, die Tests haben das berührt." Das mutation tool fragt: "cool, but did they care?"

Eine praktische Coverage Policy zum Stehlen.

Wenn ich das heute für ein Team aufsetzen würde, würde ich die policy so schreiben:

Coverage wird auf dem Diff reviewed. Uncovered changed lines müssen entweder getestet oder erklärt werden.

Risky modules bekommen explizite thresholds. Billing, permissions, data integrity und core domain logic haben höhere Latten.

Global coverage darf nicht still fallen. Kleine Rückgänge brauchen einen Grund; große Rückgänge blockieren den Merge.

Generated und framework code können excluded werden. Die exclusion muss offensichtlich und dokumentiert sein.

Branch coverage ist für decision-heavy code erforderlich. Besonders state machines und wichtige conditionals.

Mutation testing ist targeted. Nutze es dort, wo hohe coverage trotzdem kein Vertrauen schafft.

Escaped bugs werden regression tests. Nicht immer sofort, nicht immer auf derselben layer, aber bewusst.

Diese policy ist strenger als "80 Prozent or else" und freundlicher als "100 Prozent or shame." Wichtiger ist: Sie gibt Reviewern eine Entscheidungsregel.

Die Reviewer-Version.

Wenn ich einen PR reviewe, würde ich lieber diesen comment hinterlassen:

This changes the refund eligibility rule, but the uncovered branch is the trial_was_extended case. Can we add a regression test for that state?

Als diesen:

Coverage is 78.3 Prozent. Please improve.

[conversational tone] Der erste comment handelt von Risiko. Der zweite vom Wetter.

Die Lead-Version.

Wenn du ein Team leitest, weaponize Coverage nicht. Menschen optimieren auf das, was du aufs scoreboard setzt. Wenn das scoreboard sagt "hit 85 Prozent," bekommst du vielleicht shallow tests, die 85 Prozent treffen.

Nutze Coverage, um bessere Gespräche zu beginnen:

Warum ist diese hot file uncovered?

Warum sammeln sich production bugs in modules mit "good" coverage?

Assert-en unsere Tests outcomes oder nur snapshots?

Verstecken integration tests missing unit coverage?

Zwingen slow tests Leute dazu, die suite nicht laufen zu lassen?

Ist dieser Code hard to test, weil das design muddy ist?

Das versteckte Geschenk von Coverage ist nicht die Prozentzahl. Es ist die Art, wie uncovered code auf design, ownership und risk zeigt.

Also, was ist gute Code Coverage?

Gute Code Coverage ist genug Coverage, damit ein wichtiger Fehler wahrscheinlich in CI weh tut, bevor er einem user weh tut.

[deliberate] Für ein typisches product team bedeutet das oft:

70-85 Prozent overall coverage.

90 Prozent oder mehr auf critical business logic.

branch coverage auf important decisions.

diff coverage für changed code.

mutation testing, wo correctness zählt.

intentional exclusions für Code, der die Zeremonie nicht verdient.

Aber die echte Antwort ist weiterhin risikobasiert:

Decke den Code ab, der dich verletzen kann. Decke den Code ab, den du oft änderst. Decke das behavior ab, das du versprochen hast. Ignoriere die Zahl erst, nachdem du verstanden hast, wovor sie dich warnen will.

Das Dashboard kann green sein und trotzdem lügen. Die nützliche Arbeit besteht darin, es dem Produkt schwerer zu machen, deine Nutzer anzulügen.
