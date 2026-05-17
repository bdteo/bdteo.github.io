---
lang: "de"
translationOf: "the-queue-that-never-stopped"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "97eab6a570d4f717"
title: "Die Queue, die nie aufhörte"
date: "2026-02-07"
description: "Der Redis-Speicher kletterte weiter. Horizon zeigte grün. Neunundzwanzig E-Mail-Klassen liefen in Endlos-Retries, und niemand bemerkte es."
featuredImage: "./images/featured.jpg"
imageCaption: "Ein Wassertropfen fällt aus einem Wasserhahn über einem Waschbecken."
---

E-Mails schlugen fehl. Dieser Teil war erwartet — kaputte SMTP-Zugangsdaten während einer Migration. Unerwartet war etwas anderes: Sie hörten nie auf fehlzuschlagen.

---

Horizon-Dashboard: grün. Worker: gesund. Redis: wuchs langsam. Keine Alerts, keine Fehler in den Logs. Nur eine stille Ansammlung von Jobs, die es weiter und weiter und weiter versuchten.

Ich bemerkte es nur, weil der Redis-Speicher nach dem Fix der SMTP-Konfiguration nicht wieder herunterkam. Irgendetwas war noch darin und kaute sich durch Retries. Tausende davon.

---

Ich nahm an, die Queue würde damit umgehen. Das ist der Deal: Ein Job schlägt fehl, versucht es ein paarmal erneut, landet in `failed_jobs`. Man macht weiter.

Außer der Job ist ein Mailable.

Wenn man ein Mailable in eine Queue dispatcht, wickelt Laravel es in einen Job ein. Das `maxTries` dieses Jobs kommt aus der `$tries`-Property des Mailables. Wenn man sie nicht setzt — und warum sollte man, die Doku erwähnt sie kaum — wird sie als `null` serialisiert.

`null` bedeutet nicht: "nimm den Supervisor-Default." `null` bedeutet: "kein Limit." Horizon sieht `null` und denkt: Dieser Job will für immer retryen. Also tut er es.

---

Wie sich herausstellt, ist es ein bekannter Bug. <a href="https://github.com/laravel/horizon/issues/1346" target="_blank" rel="noopener noreferrer">Laravel Horizon issue #1346</a>. Das `--tries`-Flag des Supervisors wird ignoriert, wenn der serialisierte Job-Payload `maxTries: null` trägt. Die eigene Deklaration des Jobs gewinnt, und seine Deklaration sagt: niemals aufhören.

Neunundzwanzig Mailable-Klassen. Jede einzelne ohne explizite `$tries`-Property. Jede einzelne potenziell unsterblich.

---

Der Fix ist in seiner Einfachheit fast beleidigend:

```php
class WelcomeEmail extends Mailable implements ShouldQueue
{
    public int $tries = 2;
    public int $maxExceptions = 2;
}
```

Zwei Properties. Neunundzwanzig Dateien. Das ist alles.

Ein erster Versuch, ein Retry, dann `failed_jobs`. So, wie ich dachte, dass es immer funktioniert.

---

Ich teste es so, wie man eine Mausefalle testen würde. Die SMTP-Konfiguration absichtlich kaputt machen. Eine E-Mail dispatchen. Horizon beobachten. Zwei Versuche. Failed job. Fertig. Keine Geister in der Queue.

Dann fixe ich die anderen achtundzwanzig.

---

Drei Lektionen, verdichtet:

1. **`null` ist nicht "default".** In serialisierten Job-Payloads bedeutet `maxTries: null` unbegrenzt. Deine Supervisor-Konfiguration ist ein Vorschlag, keine Regel.
2. **Grüne Dashboards lügen.** Horizon zeigte gesunde Worker, die fröhlich Jobs verarbeiteten, die niemals fertig werden würden.
3. **Framework-Defaults sind nicht immer vernünftig.** Laravel setzt `$tries` bei Mailables nicht. Du musst das tun. Die Doku wird dich nicht warnen, bis du schon ein Feuer hast.

Die unheimlichsten Bugs sind die, die wie normaler Betrieb aussehen. Dieser hier tat das — wochenlang.
