---
lang: "de"
translationOf: "understanding-class-namespace-changes-shopware-6-5-developers-guide"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "597ff88f362dc003"
title: "Entwicklerleitfaden: Klassen- und Namespace-Updates in Shopware 6.5/6.6"
date: "2024-11-30"
description: "Anpassung an Shopware 6.5/6.6: wichtige Klassen-/Namespace-Änderungen, Symfony 6, Stock API, Bootstrap 5, CSRF-Fixes und das Offcanvas-Cart-Update auf data-off-canvas-cart."
featuredImage: "./images/featured.jpg"
imageCaption: "Eine Hand bindet ein frisches, leeres Stoffetikett an ein Vorratsglas. Das alte Etikett liegt daneben."
---

Shopware 6.5 und 6.6 haben mehrere wichtige Änderungen an Klassen, Namespaces, Data-Attributen und Sicherheitsmechanismen eingeführt, die Entwickler kennen müssen, wenn sie ihre Shopware-Projekte aktualisieren oder warten. Dieser Artikel gibt einen knappen, aber umfassenden Überblick über diese Änderungen, zusammen mit Beobachtungen zu ihren Auswirkungen und dazu, wie du deinen Code entsprechend anpasst.

## Einführung

Wenn Shopware sich weiterentwickelt, bringen Updates oft Verbesserungen, Optimierungen und neue Funktionen. Sie können aber auch Änderungen einführen, die bestehende Codebasen betreffen. Diese Änderungen zu verstehen, ist entscheidend, um einen reibungslosen Übergang sicherzustellen und die neuen Möglichkeiten sinnvoll zu nutzen.

Dieser Artikel konzentriert sich auf die folgenden Kernbereiche:

- Elasticsearch-Namespace-Migration
- Aktualisierungen beim Media-Path-Handling
- Methodenänderungen in `AvailableCombinationLoader`
- Symfony-Framework-Upgrade auf Version 6
- Aktualisierungen beim Stock-Handling
- Storefront-Bootstrap-Upgrade
- Änderungen am Data-Attribut des Offcanvas Cart
- Änderungen beim CSRF-Schutz
- Erweiterungen am Rule Builder

Schauen wir uns jede dieser Änderungen im Detail an.

## 1. Elasticsearch-Namespace-Migration

### Überblick der Änderung

- **Vorheriger Namespace:** `ONGR\ElasticsearchDSL`
- **Neuer Namespace:** `OpenSearchDSL`

### Auswirkung

Alle Klassen und Methoden, die mit Elasticsearch interagieren, müssen ihre Namespaces aktualisieren, um die Migration von `ONGR\ElasticsearchDSL` zu `OpenSearchDSL` abzubilden.

### Erforderliche Aktion

Aktualisiere Import-Statements und Referenzen in deinem Code, sodass sie den neuen Namespace verwenden.

### Beispiel

```php
// Before
use ONGR\ElasticsearchDSL\Query\MatchQuery;

$query = new MatchQuery('field', 'value');

// After
use OpenSearchDSL\Query\MatchQuery;

$query = new MatchQuery('field', 'value');
```

### Beobachtungen

Diese Änderung passt zur breiteren Verschiebung der Branche hin zu OpenSearch, einem communitygetriebenen Fork von Elasticsearch. Die Aktualisierung auf den neuen Namespace stellt Kompatibilität mit laufender Entwicklung und Unterstützung sicher.

## 2. Media-Path-Handling

### Überblick der Änderung

Media-Pfade werden nun direkt in der Datenbank gespeichert, statt dynamisch generiert zu werden.

### Auswirkung

Klassen und Services, die bisher auf dynamische Pfadgenerierung angewiesen waren, müssen Media-Pfade nun aus der Datenbank abrufen.

### Erforderliche Aktion

Passe deinen Code so an, dass er die Methode `getPath()` der `MediaEntity` verwendet.

### Beispiel

```php
// Before (dynamic path generation)
$mediaPath = $mediaService->getPath($mediaId);

// After (database-stored path)
$mediaPath = $mediaEntity->getPath();
```

### Beobachtungen

Media-Pfade in der Datenbank zu speichern verbessert die Performance, weil weniger Rechenaufwand entsteht. Außerdem sorgt es für mehr Konsistenz und Zuverlässigkeit im Umgang mit Medien.

## 3. Methoden-Update in `AvailableCombinationLoader`

### Überblick der Änderung

Die Methode `load()` in `AbstractAvailableCombinationLoader` wurde durch `loadCombinations()` ersetzt.

### Auswirkung

Alle eigenen Klassen, die `AbstractAvailableCombinationLoader` erweitern, müssen die neue Methode `loadCombinations()` statt der alten Methode `load()` implementieren.

### Erforderliche Aktion

Benenne deine Methodenimplementierungen um oder refaktorisiere sie, damit sie zum neuen Methodennamen und zur neuen Signatur passen.

### Beispiel

```php
// Before
$combinations = $combinationLoader->load($productId);

// After
$combinations = $combinationLoader->loadCombinations($productId);
```

### Beobachtungen

Diese Änderung erhöht die Klarheit, weil der Methodenname beschreibender ist. Sie kann außerdem zusätzliche Parameter oder Rückgabetypen betreffen, daher ist es wichtig, die Methodensignatur zu prüfen.

## 4. Symfony-Framework-Upgrade auf Version 6

### Überblick der Änderung

Shopware hat seine Symfony-Komponenten auf Version 6 aktualisiert.

### Auswirkung

Das Upgrade führt einige Breaking Changes ein, bedingt durch entfernte veraltete Funktionen und Änderungen an Methodensignaturen. Eigener Code, der auf älteren Symfony-Funktionen basiert, kann brechen oder Warnungen erzeugen.

### Erforderliche Aktion

Prüfe deinen Code auf veraltete Symfony-Funktionen und aktualisiere ihn so, dass er mit Symfony 6 kompatibel ist.

### Beobachtungen

Mit der aktuellen Symfony-Version Schritt zu halten sorgt für bessere Performance, Sicherheit und Zugriff auf neue Funktionen. Gleichzeitig verlangt es sorgfältige Codeprüfung und Tests, um Kompatibilität sicherzustellen.

## 5. Aktualisierungen beim Stock-Handling

### Überblick der Änderung

Eine neue Stock API wurde eingeführt, verfügbar hinter dem Feature-Flag `STOCK_HANDLING`.

### Auswirkung

Klassen und Services rund um Bestandsverwaltung müssen sich möglicherweise an die neue API-Struktur anpassen, besonders wenn sie direkt mit Bestandsdaten arbeiten.

### Erforderliche Aktion

Verwende die neuen Methoden zur Bestandsverarbeitung, die die API bereitstellt, und stelle sicher, dass bestandsbezogene Logik zur aktualisierten Struktur passt.

### Beispiel

```php
// Before
$stock = $productEntity->getStock();

// After
$stock = $stockService->getStock($productId);
```

### Beobachtungen

Die neue Stock API bietet eine robustere und flexiblere Möglichkeit, Bestand zu verwalten, und kann Anpassungen sowie Integrationen mit externen Systemen vereinfachen.

## 6. Storefront-Bootstrap-Upgrade

### Überblick der Änderung

Die Storefront wurde von Bootstrap 4 auf Bootstrap 5 aktualisiert, und jQuery wurde als Abhängigkeit entfernt.

### Auswirkung

Eigener JavaScript-Code und Templates, die auf jQuery oder Bootstrap-4-Komponenten angewiesen sind, müssen refaktorisiert werden, damit sie zu Bootstrap 5 passen und bei Bedarf natives JavaScript verwenden.

### Erforderliche Aktion

- Ersetze jQuery-Nutzung durch natives JavaScript oder Bootstrap-5-Utilities.
- Aktualisiere Bootstrap-Klassen und Komponenten, damit sie zur Benennung und Struktur von Bootstrap 5 passen.

### Beobachtungen

Bootstrap 5 bringt bessere Performance, weniger Abhängigkeiten und modernisierte Komponenten. Die Aktualisierung kann zeitaufwendig sein, bietet aber langfristige Vorteile für Wartbarkeit und Nutzererlebnis.

## 7. Änderungen am Offcanvas-Cart-Data-Attribut (Shopware 6.6)

### Überblick der Änderung

In Shopware 6.6 gab es eine subtile, aber wichtige Änderung am Data-Attribut, das die Offcanvas-Cart-Funktion auslöst.

- **Vorheriges Data-Attribut:** `data-offcanvas-cart`
- **Neues Data-Attribut:** `data-off-canvas-cart`

### Auswirkung

Eigene Templates oder Themes, die das Attribut `data-offcanvas-cart` ohne Bindestriche verwenden, können feststellen, dass der Offcanvas Cart nicht mehr wie erwartet funktioniert, weil der JavaScript-Listener in Shopware 6.6 nach der Variante mit Bindestrichen sucht.

### Erforderliche Aktion

Aktualisiere das Attribut `data-offcanvas-cart` in deinen Templates zu `data-off-canvas-cart`.

### Beispiel

```html
<!-- Before -->
<div class="header-cart" data-offcanvas-cart="true">
    <!-- Cart content -->
</div>

<!-- After -->
<div class="header-cart" data-off-canvas-cart="true">
    <!-- Cart content -->
</div>
```

### Beobachtungen

Diese Änderung ist in den offiziellen Shopware-6.6-Release-Notes nicht gut dokumentiert, ist aber entscheidend dafür, dass der Offcanvas Cart korrekt funktioniert. Das JavaScript, das die Cart-Funktionalität initialisiert, verlässt sich auf das Attribut `data-off-canvas-cart`, und jede Abweichung kann verhindern, dass der Cart funktioniert.

### Zusätzliche Hinweise

- **Konsistenz ist entscheidend:** Stelle sicher, dass alle Stellen aktualisiert werden, an denen das Offcanvas-Cart-Attribut verwendet wird.
- **Gründlich testen:** Teste nach der Änderung die Cart-Funktionalität, um zu bestätigen, dass sie wie erwartet funktioniert.
- **Auf ähnliche Änderungen prüfen:** Andere Data-Attribute oder Event-Listener können ähnliche Updates erhalten haben; prüfe deine eigenen Templates entsprechend.

## 8. Änderungen beim CSRF-Schutz

### Überblick der Änderung

Shopware 6.5 und spätere Versionen haben das explizite CSRF-Token-Handling in Templates entfernt und sind zu einer SameSite-Cookie-Strategie für den CSRF-Schutz übergegangen.

### Auswirkung

Templates und Formulare, die bisher CSRF-Tokens mit der Funktion `sw_csrf` eingebunden haben, erzeugen Fehler, weil diese Funktion nicht mehr existiert.

### Erforderliche Aktion

- **CSRF-Token-Funktionen entfernen:** Entferne die Nutzung von `{{ sw_csrf('route_name') }}` aus deinen Templates.
- **Auf SameSite-Cookies vertrauen:** Verlasse dich auf die eingebaute SameSite-Cookie-Strategie für CSRF-Schutz, die keine expliziten Tokens in Formularen erfordert.
- **Formularattribute anpassen:** Stelle sicher, dass Formulare und AJAX-Requests korrekt konfiguriert sind, damit sie mit dem neuen CSRF-Schutzmechanismus funktionieren.

### Beispiel

```twig
<!-- Before -->
<form action="{{ path('frontend.checkout.line-item.add') }}" method="post">
    {{ sw_csrf('frontend.checkout.line-item.add') }}
    <!-- Form fields -->
    <button type="submit">Add to Cart</button>
</form>

<!-- After -->
<form action="{{ path('frontend.checkout.line-item.add') }}" method="post">
    <!-- Form fields -->
    <button type="submit">Add to Cart</button>
</form>
```

### Beobachtungen

- **Fehlerbehebung:** Das Entfernen der Funktion `sw_csrf` behebt den Fehler "Unknown 'sw_csrf' function".
- **Sicherheit bleibt erhalten:** Die SameSite-Cookie-Strategie schützt weiterhin vor CSRF-Angriffen, ohne zusätzliche Tokens.
- **Vereinfachte Templates:** Formulare werden sauberer und etwas einfacher, weil keine CSRF-Tokens mehr nötig sind.

### Zusätzliche Hinweise

- **Testen ist entscheidend:** Teste Formularübermittlungen nach diesen Änderungen gründlich, um sicherzustellen, dass sie korrekt funktionieren.
- **Den neuen Mechanismus verstehen:** Mach dich damit vertraut, wie die SameSite-Cookie-Strategie funktioniert, um eine sichere Anwendung zu erhalten.
- **Dokumentation aktualisieren:** Stelle sicher, dass interne Dokumentation diese Änderung widerspiegelt, damit sie später keine Verwirrung erzeugt.

## 9. Umgang mit Problemen beim Offcanvas Cart

### Überblick des Szenarios

Nach dem Aktualisieren von Templates und dem Entfernen der Funktion `sw_csrf` können Entwickler weiterhin Probleme sehen, bei denen ein Klick auf den Button "Add to Cart" den Offcanvas Cart öffnet, dieser aber leer erscheint.

### Ursache

Der Offcanvas Cart zeigt die hinzugefügten Artikel möglicherweise nicht an, weil Parameter in der Formularübermittlung fehlen oder falsch sind, konkret das fehlende Input-Feld `redirectTo`.

### Erforderliche Aktion

- **Den Parameter `redirectTo` hinzufügen:** Füge deinen Add-to-Cart-Formularen ein verstecktes Input-Feld mit dem Namen `redirectTo` und dem Wert `frontend.cart.offcanvas` hinzu.
- **Korrekte Data-Attribute sicherstellen:** Prüfe, dass alle nötigen Data-Attribute vorhanden und korrekt benannt sind.

### Beispiel

```twig
<form action="{{ path('frontend.checkout.line-item.add') }}" method="post">
    <input type="hidden" name="redirectTo" value="frontend.cart.offcanvas"/>
    <input type="hidden" name="lineItems[{{ product.id }}][id]" value="{{ product.id }}">
    <!-- Other form fields -->
    <button type="submit">Add to Cart</button>
</form>
```

### Beobachtungen

- **Funktionalität wiederherstellen:** Das Hinzufügen des Parameters `redirectTo` teilt Shopware mit, dass der Offcanvas Cart nach dem Hinzufügen eines Artikels geladen werden soll, wodurch der Cart korrekt angezeigt wird.
- **Auf Details achten:** Kleine Auslassungen wie fehlende Input-Felder können zu erheblichen Funktionsproblemen führen und zeigen, wie wichtig sorgfältige Codeprüfung ist.

### Zusätzliche Hinweise

- **Konsistenz bei Data-Attributen:** Prüfe doppelt, ob Data-Attribute wie `data-product-id` korrekt gesetzt sind.
- **JavaScript-Abhängigkeiten prüfen:** Stelle sicher, dass alle JavaScript-Plugins oder Komponenten rund um den Cart korrekt geladen und initialisiert werden.
- **Cache leeren:** Leere nach Änderungen den Shopware-Cache und deinen Browser-Cache, damit veraltete Dateien keine Probleme verursachen.

## 10. Erweiterungen am Rule Builder

### Überblick der Änderung

Die Rule Builder API wurde erweitert, um komplexere bedingte Logik zu unterstützen.

### Auswirkung

Eigene Regeln und Bedingungen müssen möglicherweise angepasst werden, um zu den neuen Interfaces oder Methoden zu passen, die der erweiterte Rule Builder bereitstellt.

### Erforderliche Aktion

Prüfe die Rule-Builder-Dokumentation und aktualisiere eigene Regelimplementierungen, um Kompatibilität sicherzustellen.

### Beobachtungen

Erweiterte Regelmöglichkeiten erlauben präziseres Targeting und mehr Anpassung innerhalb von Shopware. Diese neuen Funktionen zu nutzen kann zu besserer Anpassungsfähigkeit und persönlicheren Erlebnissen für Endnutzer führen.

## Fazit

Shopware 6.5 und 6.6 führen mehrere wichtige Änderungen an Klassen, Namespaces, Data-Attributen und Sicherheitsmechanismen ein, die Entwickler berücksichtigen müssen, um Kompatibilität zu erhalten und neue Funktionen zu nutzen. Die Aktualisierung deiner Codebase verlangt sorgfältige Prüfung und Tests, bietet aber Chancen, Performance, Sicherheit und Funktionalität zu verbessern.

## Empfehlungen

- **Vorausplanen:** Prüfe vor dem Update die offiziellen Shopware-Release-Notes und Upgrade-Guides für umfassende Informationen.
- **Gründlich testen:** Implementiere Änderungen in einer Staging-Umgebung und teste ausführlich, um Probleme zu finden und zu beheben.
- **Dokumentation nutzen:** Nutze Shopware-Dokumentation und Community-Foren als Orientierung zu bestimmten Änderungen.
- **Informiert bleiben:** Verfolge künftige Updates, um kommende Änderungen früh zu erkennen und dich entsprechend vorzubereiten.

## Zusätzliche Beobachtungen

- **Auf Details achten:** Kleine Änderungen, etwa Bindestriche in Data-Attributen oder das Entfernen von Funktionen, können erhebliche Auswirkungen haben. Prüfe Template-Updates immer sorgfältig.
- **Community-Support:** Die Shopware-Community ist aktiv und kooperativ. Austausch mit anderen Entwicklern kann Einsichten und Lösungen für häufige Herausforderungen liefern.
- **Best Practices:** Aktualisierte Best Practices zu übernehmen, etwa natives JavaScript statt jQuery zu verwenden und auf moderne Sicherheitsstrategien zu setzen, führt zu saubererem und effizienterem Code.
- **Deprecations beobachten:** Auf Deprecation-Hinweise zu achten und sich auf künftige Entfernungen vorzubereiten kann Störungen während Upgrades minimieren.

---

Wenn Entwickler die Änderungen an Klassen, Namespaces, Data-Attributen und Sicherheit in Shopware 6.5 und 6.6 verstehen und angehen, können sie einen reibungslosen Übergang sicherstellen und weiterhin robuste, zukunftsfähige E-Commerce-Lösungen bauen.
