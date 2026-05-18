---
lang: "zh-Hans"
translationOf: "understanding-class-namespace-changes-shopware-6-5-developers-guide"
translationUpdatedAt: "2026-05-18"
translationSourceHash: "597ff88f362dc003"
title: "开发者指南：Shopware 6.5/6.6 的类与命名空间更新"
date: "2024-11-30"
description: "适配 Shopware 6.5/6.6：关键类与命名空间变更、Symfony 6、Stock API、Bootstrap 5、CSRF 修复，以及 Offcanvas Cart 的 data-off-canvas-cart 更新。"
featuredImage: "./images/featured.jpg"
imageCaption: "一只手把新的空白布标签系在储物罐上。旧标签放在旁边。"
tags: ["Shopware 6.5", "Shopware 6.6", "类变更", "命名空间变更", "开发者指南", "Shopware 更新", "代码迁移", "PHP 开发", "Symfony 6", "媒体路径处理", "Elasticsearch 迁移", "Bootstrap 5", "Stock API", "Data Attributes", "Offcanvas Cart", "CSRF Protection", "SameSite Cookies", "电商平台", "软件升级", "编程最佳实践", "自定义插件", "代码重构", "软件兼容性", "Shopware 教程"]
---

Shopware 6.5 和 6.6 对类、命名空间、data attribute 以及安全机制引入了几项重要变更。开发者在升级或维护 Shopware 项目时需要了解这些变化。本文会用简洁但完整的方式梳理这些变更，并说明它们的影响，以及你的代码该如何相应调整。

## 引言

随着 Shopware 演进，更新通常会带来改进、优化和新功能。不过，它们也可能引入会影响现有代码库的变化。理解这些变化，是顺利过渡并真正用好新能力的关键。

本文聚焦以下几个重点领域：

- Elasticsearch 命名空间迁移
- 媒体路径处理更新
- `AvailableCombinationLoader` 中的方法变更
- Symfony 框架升级到版本 6
- 库存处理更新
- Storefront Bootstrap 升级
- Offcanvas Cart data attribute 变更
- CSRF 保护变更
- Rule Builder 增强

我们逐项看。

## 1. Elasticsearch 命名空间迁移

### 变更概览

- **旧命名空间：** `ONGR\ElasticsearchDSL`
- **新命名空间：** `OpenSearchDSL`

### 影响

所有与 Elasticsearch 交互的类和方法，都需要更新命名空间，以反映从 `ONGR\ElasticsearchDSL` 到 `OpenSearchDSL` 的迁移。

### 需要采取的动作

更新代码中的 import 语句和引用，改用新的命名空间。

### 示例

```php
// Before
use ONGR\ElasticsearchDSL\Query\MatchQuery;

$query = new MatchQuery('field', 'value');

// After
use OpenSearchDSL\Query\MatchQuery;

$query = new MatchQuery('field', 'value');
```

### 观察

这个变更符合行业更广泛地转向 OpenSearch 的趋势。OpenSearch 是 Elasticsearch 的社区驱动分支。更新到新的命名空间，可以确保你的代码继续兼容后续发展与支持。

## 2. 媒体路径处理

### 变更概览

媒体路径现在会直接存储在数据库中，而不是动态生成。

### 影响

以前依赖动态路径生成的类和服务，现在需要从数据库中读取媒体路径。

### 需要采取的动作

调整代码，使用 `MediaEntity` 的 `getPath()` 方法。

### 示例

```php
// Before (dynamic path generation)
$mediaPath = $mediaService->getPath($mediaId);

// After (database-stored path)
$mediaPath = $mediaEntity->getPath();
```

### 观察

把媒体路径存入数据库可以减少计算开销，从而提升性能。它也让媒体处理更一致、更可靠。

## 3. `AvailableCombinationLoader` 中的方法更新

### 变更概览

`AbstractAvailableCombinationLoader` 中的 `load()` 方法已被 `loadCombinations()` 取代。

### 影响

任何继承 `AbstractAvailableCombinationLoader` 的自定义类，都必须实现新的 `loadCombinations()` 方法，而不是旧的 `load()` 方法。

### 需要采取的动作

重命名或重构你的方法实现，使其与新的方法名和签名保持一致。

### 示例

```php
// Before
$combinations = $combinationLoader->load($productId);

// After
$combinations = $combinationLoader->loadCombinations($productId);
```

### 观察

这个变更用一个更具描述性的名称提升了清晰度。它也可能伴随额外参数或返回类型变化，所以检查方法签名很必要。

## 4. Symfony 框架升级到版本 6

### 变更概览

Shopware 已将 Symfony 组件升级到版本 6。

### 影响

由于废弃功能被移除、方法签名发生变化，这次升级会带来一些破坏性变更。依赖旧 Symfony 特性的自定义代码可能会报错，或者产生警告。

### 需要采取的动作

检查代码中是否使用了任何已废弃的 Symfony 功能，并更新到与 Symfony 6 兼容的写法。

### 观察

跟上最新 Symfony 版本，可以获得更好的性能、安全性和新功能。不过，它也要求你认真审查和测试代码，确保兼容性。

## 5. 库存处理更新

### 变更概览

Shopware 引入了新的 Stock API，可通过 `STOCK_HANDLING` feature flag 启用。

### 影响

与库存管理相关的类和服务可能需要适配新的 API 结构，尤其是那些直接与库存数据交互的代码。

### 需要采取的动作

使用新 API 提供的库存处理方法，并确保所有库存相关逻辑与更新后的结构一致。

### 示例

```php
// Before
$stock = $productEntity->getStock();

// After
$stock = $stockService->getStock($productId);
```

### 观察

新的 Stock API 提供了更稳健、更灵活的库存管理方式，有可能简化自定义开发以及与外部系统的集成。

## 6. Storefront Bootstrap 升级

### 变更概览

Storefront 已从 Bootstrap 4 升级到 Bootstrap 5，并移除了对 jQuery 的依赖。

### 影响

依赖 jQuery 或 Bootstrap 4 组件的自定义 JavaScript 代码和模板，需要重构为符合 Bootstrap 5 的写法，并在必要时改用原生 JavaScript。

### 需要采取的动作

- 用原生 JavaScript 或 Bootstrap 5 工具替换 jQuery 用法。
- 更新 Bootstrap class 和组件，使其匹配 Bootstrap 5 的命名与结构。

### 观察

Bootstrap 5 带来了性能改进、更少依赖，以及现代化组件。升级可能耗时，但从长期看，对可维护性和用户体验都有好处。

## 7. Offcanvas Cart Data Attribute 变更（Shopware 6.6）

### 变更概览

在 Shopware 6.6 中，用于触发 offcanvas cart 功能的 data attribute 出现了一个细微但重要的变更。

- **旧 Data Attribute：** `data-offcanvas-cart`
- **新 Data Attribute：** `data-off-canvas-cart`

### 影响

如果自定义模板或主题仍使用不带连字符的 `data-offcanvas-cart` attribute，offcanvas cart 可能不再按预期工作，因为 Shopware 6.6 中的 JavaScript listener 会查找带连字符的版本。

### 需要采取的动作

把模板中的 `data-offcanvas-cart` attribute 更新为 `data-off-canvas-cart`。

### 示例

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

### 观察

这个变更在官方 Shopware 6.6 release notes 中记录得并不充分，但它对 offcanvas cart 的正常工作很关键。负责初始化购物车功能的 JavaScript 依赖 `data-off-canvas-cart` attribute，任何偏差都可能让购物车无法工作。

### 额外说明

- **一致性很关键：** 确保所有使用 offcanvas cart attribute 的地方都已更新。
- **彻底测试：** 修改后测试购物车功能，确认它能按预期工作。
- **留意类似变更：** 其他 data attribute 或 event listener 可能也有类似更新；相应检查你的自定义模板。

## 8. CSRF 保护变更

### 变更概览

Shopware 6.5 及之后的版本移除了模板中的显式 CSRF token 处理，转而使用 SameSite cookie 策略进行 CSRF 保护。

### 影响

以前通过 `sw_csrf` 函数包含 CSRF token 的模板和表单会遇到错误，因为这个函数已经不存在。

### 需要采取的动作

- **移除 CSRF Token 函数：** 从模板中删除 `{{ sw_csrf('route_name') }}` 的用法。
- **依赖 SameSite Cookies：** 信任内置的 SameSite cookie 策略进行 CSRF 保护；表单不再需要显式 token。
- **调整表单属性：** 确保表单和 AJAX 请求配置正确，能与新的 CSRF 保护机制协同工作。

### 示例

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

### 观察

- **错误解决：** 移除 `sw_csrf` 函数可以解决 "Unknown 'sw_csrf' function" 错误。
- **安全性保持：** SameSite cookie 策略不需要额外 token，仍能继续防护 CSRF 攻击。
- **模板更简洁：** 不再需要 CSRF token 后，表单会更干净，也稍微简单一些。

### 额外说明

- **测试至关重要：** 完成这些改动后，彻底测试表单提交，确保它们正确工作。
- **理解新机制：** 熟悉 SameSite cookie 策略的运行方式，以维持应用安全。
- **更新文档：** 确保内部文档反映这个变更，避免以后再次混淆。

## 9. 处理 Offcanvas Cart 问题

### 场景概览

在更新模板并移除 `sw_csrf` 函数后，开发者仍可能遇到这样的问题：点击 "Add to Cart" 按钮会打开 offcanvas cart，但购物车看起来是空的。

### 根因

offcanvas cart 可能因为表单提交中缺少或错误的参数而没有显示已添加商品，尤其是缺少 `redirectTo` input field。

### 需要采取的动作

- **添加 `redirectTo` 参数：** 在 add-to-cart 表单中加入一个名为 `redirectTo`、值为 `frontend.cart.offcanvas` 的隐藏 input field。
- **确保 Data Attribute 正确：** 确认所有必要的 data attribute 都存在，并且命名正确。

### 示例

```twig
<form action="{{ path('frontend.checkout.line-item.add') }}" method="post">
    <input type="hidden" name="redirectTo" value="frontend.cart.offcanvas"/>
    <input type="hidden" name="lineItems[{{ product.id }}][id]" value="{{ product.id }}">
    <!-- Other form fields -->
    <button type="submit">Add to Cart</button>
</form>
```

### 观察

- **功能恢复：** 添加 `redirectTo` 参数会告诉 Shopware 在加入商品后加载 offcanvas cart，从而确保购物车正确显示。
- **细节的重要性：** 缺少一个 input field 这样的小遗漏，也可能造成明显的功能问题。这再次说明，仔细 code review 很重要。

### 额外说明

- **Data Attribute 的一致性：** 再次确认 `data-product-id` 这类 data attribute 设置正确。
- **检查 JavaScript 依赖：** 确保与购物车相关的 JavaScript plugin 或组件已正确加载和初始化。
- **清缓存：** 修改后清理 Shopware 缓存和浏览器缓存，避免旧文件造成问题。

## 10. Rule Builder 增强

### 变更概览

Rule Builder API 已扩展，支持更复杂的条件逻辑。

### 影响

自定义规则和条件可能需要调整，以符合增强后的 Rule Builder 提供的新接口或方法。

### 需要采取的动作

查看 Rule Builder 文档，并更新自定义规则实现以确保兼容性。

### 观察

增强后的规则能力可以在 Shopware 内实现更精确的定位和自定义。用好这些新功能，能提升系统的适配性，并给最终用户带来更个性化的体验。

## 结论

Shopware 6.5 和 6.6 对类、命名空间、data attribute 和安全机制引入了几项重要变更。开发者必须处理这些变化，才能维持兼容性，并利用新功能。更新代码库需要仔细审查和测试，但也提供了改善性能、安全性和功能的机会。

## 建议

- **提前规划：** 升级前，阅读官方 Shopware release notes 和 upgrade guide，获得完整信息。
- **彻底测试：** 在 staging 环境中实施变更，并进行充分测试，以发现并修复问题。
- **善用文档：** 利用 Shopware 文档和社区论坛，获取具体变更的指导。
- **保持关注：** 跟进未来更新，提前预判后续变化并做好准备。

## 额外观察

- **关注细节：** data attribute 中的连字符、函数移除这类小变化，都可能造成重大影响。始终认真审查模板更新。
- **社区支持：** Shopware 社区活跃且协作性强。与其他开发者交流，往往能得到常见问题的洞见和解决方案。
- **最佳实践：** 采用更新后的最佳实践，比如用原生 JavaScript 替代 jQuery、依赖现代安全策略，会带来更清晰、更高效的代码。
- **监控废弃项：** 留意 deprecation notice，并为未来的移除提前准备，可以减少升级时的中断。

---

通过理解并处理 Shopware 6.5 和 6.6 中关于类、命名空间、data attribute 与安全机制的变化，开发者可以顺利过渡，并继续构建稳健、面向未来的电商解决方案。
