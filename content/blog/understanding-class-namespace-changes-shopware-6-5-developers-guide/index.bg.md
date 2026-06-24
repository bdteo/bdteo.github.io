---
lang: "bg"
translationOf: "understanding-class-namespace-changes-shopware-6-5-developers-guide"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "597ff88f362dc003"
title: "Dev Guide: промени в класове и namespace-и в Shopware 6.5/6.6"
date: "2024-11-30"
description: "Адаптация към Shopware 6.5/6.6: ключови промени в класове и namespace-и, Symfony 6, Stock API, Bootstrap 5, CSRF поправки и data-off-canvas-cart за Offcanvas Cart."
featuredImage: "./images/featured.jpg"
imageCaption: "Ръка връзва нов празен платнен етикет върху буркан в килер. Старият етикет лежи до него."
tags: ["Shopware 6.5", "Shopware 6.6", "Промени в класове", "Промени в namespace-и", "Developer's guide", "Shopware updates", "Code migration", "PHP development", "Symfony 6", "Media path handling", "Elasticsearch migration", "Bootstrap 5", "Stock API", "Data Attributes", "Offcanvas Cart", "CSRF Protection", "SameSite Cookies", "E-commerce platform", "Software upgrade", "Programming best practices", "Custom plugins", "Code refactoring", "Software compatibility", "Shopware tutorials"]
audioUrl: "/audio/articles/understanding-class-namespace-changes-shopware-6-5-developers-guide/bg/5egO01tkUjEzu7xSSE8M-b4c8b431f144.m4a"
audioDuration: "17:30"
audioVoice: "Carmelo (ElevenLabs Bulgarian)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/understanding-class-namespace-changes-shopware-6-5-developers-guide.bg.md"
---

Shopware 6.5 и 6.6 въведоха няколко съществени промени в класове, namespace-и, data attributes и механизми за сигурност, с които разработчиците трябва да са наясно, когато обновяват или поддържат своите Shopware проекти. Тази статия дава стегнат, но достатъчно пълен преглед на тези промени, заедно с наблюдения за влиянието им и за това как да адаптираш кода си.

## Въведение

Докато Shopware се развива, обновленията често носят подобрения, оптимизации и нови възможности. Но понякога въвеждат и промени, които могат да засегнат съществуващи codebase-и. Разбирането им е решаващо за плавен преход и за смислено използване на новите възможности.

Тази статия се фокусира върху следните ключови области:

- Миграция на Elasticsearch namespace-а
- Промени при обработката на media paths
- Промени в методите на `AvailableCombinationLoader`
- Ъпгрейд на Symfony framework-а до версия 6
- Промени при stock handling
- Ъпгрейд на Storefront към Bootstrap
- Промени в data attribute-а за Offcanvas Cart
- Промени в CSRF защитата
- Подобрения в Rule Builder

Нека разгледаме всяка от тези промени по-подробно.

## 1. Миграция на Elasticsearch namespace-а

### Преглед на промяната

- **Предишен namespace:** `ONGR\ElasticsearchDSL`
- **Нов namespace:** `OpenSearchDSL`

### Влияние

Всички класове и методи, които взаимодействат с Elasticsearch, трябва да обновят namespace-ите си, за да отразят миграцията от `ONGR\ElasticsearchDSL` към `OpenSearchDSL`.

### Необходимо действие

Обнови import statements и reference-и в кода си, така че да използват новия namespace.

### Пример

```php
// Before
use ONGR\ElasticsearchDSL\Query\MatchQuery;

$query = new MatchQuery('field', 'value');

// After
use OpenSearchDSL\Query\MatchQuery;

$query = new MatchQuery('field', 'value');
```

### Наблюдения

Тази промяна е в синхрон с по-широкото индустриално движение към OpenSearch, community-driven fork на Elasticsearch. Обновяването към новия namespace гарантира съвместимост с бъдещото развитие и поддръжка.

## 2. Media Path Handling

### Преглед на промяната

Media paths вече се съхраняват директно в базата данни, вместо да се генерират динамично.

### Влияние

Класове и услуги, които преди са разчитали на динамично генериране на пътища, трябва да четат media paths от базата данни.

### Необходимо действие

Адаптирай кода си така, че да използва метода `getPath()` от `MediaEntity`.

### Пример

```php
// Before (dynamic path generation)
$mediaPath = $mediaService->getPath($mediaId);

// After (database-stored path)
$mediaPath = $mediaEntity->getPath();
```

### Наблюдения

Съхраняването на media paths в базата данни подобрява производителността, като намалява изчислителния overhead. Освен това дава повече консистентност и надеждност при работа с media.

## 3. Промяна в метод на `AvailableCombinationLoader`

### Преглед на промяната

Методът `load()` в `AbstractAvailableCombinationLoader` е заменен с `loadCombinations()`.

### Влияние

Всички custom класове, които extend-ват `AbstractAvailableCombinationLoader`, трябва да имплементират новия метод `loadCombinations()` вместо стария `load()`.

### Необходимо действие

Преименувай или refactor-ни имплементациите на метода, за да съответстват на новото име и сигнатура.

### Пример

```php
// Before
$combinations = $combinationLoader->load($productId);

// After
$combinations = $combinationLoader->loadCombinations($productId);
```

### Наблюдения

Тази промяна подобрява яснотата, защото името на метода е по-описателно. Възможно е да има и допълнителни параметри или return types, така че прегледът на сигнатурата е задължителен.

## 4. Ъпгрейд на Symfony Framework до версия 6

### Преглед на промяната

Shopware е обновил Symfony компонентите си до версия 6.

### Влияние

Ъпгрейдът въвежда някои breaking changes заради deprecated възможности и промени в method signatures. Custom код, който разчита на по-стари Symfony възможности, може да се счупи или да започне да дава warnings.

### Необходимо действие

Прегледай кода си за deprecated Symfony възможности и ги обнови така, че да са съвместими със Symfony 6.

### Наблюдения

Поддържането на актуална Symfony версия носи по-добра производителност, сигурност и достъп до нови възможности. Но изисква внимателен code review и тестване, за да се гарантира съвместимост.

## 5. Промени при Stock Handling

### Преглед на промяната

Въведен е нов Stock API, достъпен зад feature flag-а `STOCK_HANDLING`.

### Влияние

Класове и услуги, свързани с управлението на наличности, може да трябва да се адаптират към новата API структура, особено ако взаимодействат директно със stock data.

### Необходимо действие

Използвай новите stock handling методи, предоставени от API-то, и се увери, че всяка stock-related логика отговаря на обновената структура.

### Пример

```php
// Before
$stock = $productEntity->getStock();

// After
$stock = $stockService->getStock($productId);
```

### Наблюдения

Новият Stock API дава по-устойчив и гъвкав начин за управление на наличности, което потенциално опростява customizations и интеграции с външни системи.

## 6. Ъпгрейд на Storefront към Bootstrap

### Преглед на промяната

Storefront е обновен от Bootstrap 4 към Bootstrap 5, а jQuery е премахнат като dependency.

### Влияние

Custom JavaScript код и templates, които разчитат на jQuery или Bootstrap 4 компоненти, трябва да бъдат refactor-нати, за да съответстват на Bootstrap 5 и да използват native JavaScript, където е необходимо.

### Необходимо действие

- Замени употребата на jQuery с native JavaScript или Bootstrap 5 utilities.
- Обнови Bootstrap класове и компоненти, за да съответстват на naming-а и структурата в Bootstrap 5.

### Наблюдения

Bootstrap 5 носи подобрения в производителността, по-малко dependencies и модернизирани компоненти. Обновяването може да отнеме време, но дава дългосрочни ползи за поддръжката и user experience-а.

## 7. Промени в data attribute-а за Offcanvas Cart (Shopware 6.6)

### Преглед на промяната

В Shopware 6.6 има фина, но важна промяна в data attribute-а, използван за trigger-ване на offcanvas cart функционалността.

- **Предишен data attribute:** `data-offcanvas-cart`
- **Нов data attribute:** `data-off-canvas-cart`

### Влияние

Custom templates или themes, които използват attribute-а `data-offcanvas-cart` без тирета, може да установят, че offcanvas cart вече не работи както се очаква, защото JavaScript listener-ът в Shopware 6.6 търси версията с тирета.

### Необходимо действие

Обнови attribute-а `data-offcanvas-cart` в templates към `data-off-canvas-cart`.

### Пример

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

### Наблюдения

Тази промяна не е добре документирана в официалните release notes на Shopware 6.6, но е критична за правилното функциониране на offcanvas cart. JavaScript-ът, отговорен за инициализирането на cart функционалността, разчита на attribute-а `data-off-canvas-cart`, и всяко отклонение може да попречи на cart-а да работи.

### Допълнителни бележки

- **Консистентността е ключова:** Увери се, че всички места, където се използва offcanvas cart attribute-ът, са обновени.
- **Тествай старателно:** След промяната тествай cart функционалността, за да потвърдиш, че работи както се очаква.
- **Провери за подобни промени:** Други data attributes или event listeners може да са минали през сходни промени; прегледай custom templates съответно.

## 8. Промени в CSRF защитата

### Преглед на промяната

Shopware 6.5 и по-новите версии премахват explicit CSRF token handling в templates, преминавайки към SameSite cookie стратегия за CSRF защита.

### Влияние

Templates и forms, които преди са включвали CSRF tokens чрез функцията `sw_csrf`, ще срещнат грешки, защото тази функция вече не съществува.

### Необходимо действие

- **Премахни CSRF Token Functions:** Премахни употребата на `{{ sw_csrf('route_name') }}` от templates.
- **Разчитай на SameSite Cookies:** Довери се на вградената SameSite cookie стратегия за CSRF защита, която не изисква explicit tokens във forms.
- **Адаптирай form attributes:** Увери се, че forms и AJAX requests са конфигурирани правилно, за да работят с новия механизъм за CSRF защита.

### Пример

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

### Наблюдения

- **Разрешаване на грешката:** Премахването на функцията `sw_csrf` разрешава грешката "Unknown 'sw_csrf' function".
- **Запазване на сигурността:** SameSite cookie стратегията продължава да предпазва от CSRF атаки без допълнителни tokens.
- **Опростени templates:** Forms стават по-чисти и малко по-прости без нуждата от CSRF tokens.

### Допълнителни бележки

- **Тестването е критично:** След тези промени тествай старателно form submissions, за да се увериш, че работят правилно.
- **Разбери новия механизъм:** Запознай се с начина, по който работи SameSite cookie стратегията, за да поддържаш сигурно приложение.
- **Обнови документацията:** Увери се, че всяка вътрешна документация отразява тази промяна, за да предотврати бъдещо объркване.

## 9. Работа с проблеми при Offcanvas Cart

### Преглед на сценария

След обновяване на templates и премахване на функцията `sw_csrf`, разработчиците може все още да срещат проблеми, при които натискането на бутона "Add to Cart" отваря offcanvas cart, но той изглежда празен.

### Root Cause

Offcanvas cart може да не показва добавените items заради липсващи или неправилни параметри във form submission-а, по-конкретно липсата на input field-а `redirectTo`.

### Необходимо действие

- **Добави параметъра `redirectTo`:** Включи hidden input field с име `redirectTo` и стойност `frontend.cart.offcanvas` във формите за add-to-cart.
- **Осигури правилни data attributes:** Провери дали всички нужни data attributes присъстват и са именувани правилно.

### Пример

```twig
<form action="{{ path('frontend.checkout.line-item.add') }}" method="post">
    <input type="hidden" name="redirectTo" value="frontend.cart.offcanvas"/>
    <input type="hidden" name="lineItems[{{ product.id }}][id]" value="{{ product.id }}">
    <!-- Other form fields -->
    <button type="submit">Add to Cart</button>
</form>
```

### Наблюдения

- **Възстановяване на функционалността:** Добавянето на параметъра `redirectTo` казва на Shopware да зареди offcanvas cart при добавяне на item, така че cart-ът да се показва правилно.
- **Внимание към детайла:** Малки пропуски като липсващи input fields могат да доведат до значителни функционални проблеми, което подчертава нуждата от внимателен code review.

### Допълнителни бележки

- **Консистентност в data attributes:** Провери още веднъж дали data attributes като `data-product-id` са зададени правилно.
- **Преглед на JavaScript dependencies:** Увери се, че всички JavaScript plugins или components, свързани с cart-а, са правилно заредени и инициализирани.
- **Изчисти cache-а:** След промените изчисти Shopware cache-а и browser cache-а, за да избегнеш проблеми от остарели файлове.

## 10. Подобрения в Rule Builder

### Преглед на промяната

Rule Builder API е разширено, за да поддържа по-сложна conditional logic.

### Влияние

Custom rules и conditions може да се нуждаят от корекции, за да съответстват на новите interfaces или methods, предоставени от подобрения Rule Builder.

### Необходимо действие

Прегледай документацията на Rule Builder и обнови custom rule implementations, за да гарантираш съвместимост.

### Наблюдения

Разширените rule capabilities позволяват по-прецизно targeting и customization в Shopware. Използването на тези нови възможности може да доведе до по-добра адаптивност и по-персонализирани преживявания за крайните потребители.

## Заключение

Shopware 6.5 и 6.6 въвеждат няколко важни промени в класове, namespace-и, data attributes и механизми за сигурност, които разработчиците трябва да адресират, за да запазят съвместимост и да се възползват от новите възможности. Обновяването на codebase-а изисква внимателен преглед и тестване, но отваря възможности за подобрение на производителността, сигурността и функционалността.

## Препоръки

- **Планирай предварително:** Преди обновяване прегледай официалните release notes и upgrade guides на Shopware за изчерпателна информация.
- **Тествай старателно:** Имплементирай промените в staging environment и направи обстойно тестване, за да откриеш и поправиш проблеми.
- **Използвай документацията:** Използвай документацията на Shopware и community forums за насоки по конкретни промени.
- **Остани информиран:** Следи бъдещите updates, за да предвиждаш предстоящи промени и да се подготвяш навреме.

## Допълнителни наблюдения

- **Внимание към детайла:** Малки промени, като тирета в data attributes или премахване на функции, могат да имат значително влияние. Винаги преглеждай template updates внимателно.
- **Community Support:** Shopware community-то е активно и collaborative. Взаимодействието с други разработчици може да даде insights и solutions за общи предизвикателства.
- **Best Practices:** Приемането на обновени best practices, като използване на native JavaScript вместо jQuery и разчитане на модерни security strategies, води до по-чист и по-ефективен код.
- **Monitoring Deprecations:** Следенето на deprecation notices и подготовката за бъдещи removals може да минимизира disruptions по време на upgrades.

---

Като разберат и адресират промените в класове, namespace-и, data attributes и сигурност в Shopware 6.5 и 6.6, разработчиците могат да осигурят плавен преход и да продължат да изграждат устойчиви, future-proof e-commerce решения.
