[matter-of-fact] Dieser Artikel enthält Codebeispiele. In der Audiofassung lasse ich den Code aus und behalte die Erklärung bei.

[matter-of-fact] E-Mails schlugen fehl. Dieser Teil war erwartet — kaputte SMTP-Zugangsdaten während einer Migration. Unerwartet war etwas anderes: Sie hörten nie auf fehlzuschlagen.

Horizon-Dashboard: grün. Worker: gesund. Redis: wuchs langsam. Keine Alerts, keine Fehler in den Logs. Nur eine stille Ansammlung von Jobs, die es weiter und weiter und weiter versuchten.

[calm] Ich bemerkte es nur, weil der Redis-Speicher nach dem Fix der SMTP-Konfiguration nicht wieder herunterkam. Irgendetwas war noch darin und kaute sich durch Retries. Tausende davon.

[reflective] Ich nahm an, die Queue würde damit umgehen. Das ist der Deal: Ein Job schlägt fehl, versucht es ein paarmal erneut, landet in failed_jobs. Man macht weiter.

Außer der Job ist ein Mailable.

[deliberate] Wenn man ein Mailable in eine Queue dispatcht, wickelt Laravel es in einen Job ein. Das maxTries dieses Jobs kommt aus der tries-Property des Mailables. Wenn man sie nicht setzt — und warum sollte man, die Doku erwähnt sie kaum — wird sie als null serialisiert.

[matter-of-fact] null bedeutet nicht: "nimm den Supervisor-Default." null bedeutet: "kein Limit." Horizon sieht null und denkt: Dieser Job will für immer retryen. Also tut er es.

[stress on next word] Wie sich herausstellt, ist es ein bekannter Bug. Laravel Horizon issue #1346. Das --tries-Flag des Supervisors wird ignoriert, wenn der serialisierte Job-Payload maxTries: null trägt. Die eigene Deklaration des Jobs gewinnt, und seine Deklaration sagt: niemals aufhören.

Neunundzwanzig Mailable-Klassen. Jede einzelne ohne explizite tries-Property. Jede einzelne potenziell unsterblich.

[reflective] Der Fix ist in seiner Einfachheit fast beleidigend:

[deliberate] Zwei Properties. Neunundzwanzig Dateien. Das ist alles.

Ein erster Versuch, ein Retry, dann failed_jobs. So, wie ich dachte, dass es immer funktioniert.

[resigned tone] Ich teste es so, wie man eine Mausefalle testen würde. Die SMTP-Konfiguration absichtlich kaputt machen. Eine E-Mail dispatchen. Horizon beobachten. Zwei Versuche. Failed job. Fertig. Keine Geister in der Queue.

[calm] Dann fixe ich die anderen achtundzwanzig.

[reflective] Drei Lektionen, verdichtet:

null ist nicht "default". In serialisierten Job-Payloads bedeutet maxTries: null unbegrenzt. Deine Supervisor-Konfiguration ist ein Vorschlag, keine Regel.

Grüne Dashboards lügen. Horizon zeigte gesunde Worker, die fröhlich Jobs verarbeiteten, die niemals fertig werden würden.

[slows down] Framework-Defaults sind nicht immer vernünftig. Laravel setzt tries bei Mailables nicht. Du musst das tun. Die Doku wird dich nicht warnen, bis du schon ein Feuer hast.

[resigned tone] Die unheimlichsten Bugs sind die, die wie normaler Betrieb aussehen. Dieser hier tat das — wochenlang.
