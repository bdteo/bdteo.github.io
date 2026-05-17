---
lang: "bg"
translationOf: "huawei-watch-d2-proprietary-protocol-vendor-lockin"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "5f8c1e1999d0201a"
title: "Huawei Watch D2 BLE Pairing: случай за протокол и vendor lock-in"
date: "2025-04-11"
slug: "huawei-watch-d2-proprietary-protocol-vendor-lockin"
author: "Boris Teoharov"
description: "Дълбоко гмуркане в proprietary BLE pairing протокола на Huawei Watch D2 -- нестандартен 11-стъпков handshake с HMAC-SHA256 и custom encryption. Как заключва потребителите, и как community-то отвръща."
featuredImage: "./images/featured.jpg"
tags: ["Huawei", "WatchD2", "BluetoothLE", "BLE", "Pairing", "Authentication", "ReverseEngineering", "VendorLockIn", "ProprietaryProtocol", "D2Explorer", "SimpleBLE", "Crypto", "Gadgetbridge", "EU-DMA"]
imageCaption: "Спокойно канарче, кацнало в орнаментирана месингова клетка, осветено отзад от прозорец."
---

> **TL;DR:** Huawei Watch D2 не използва стандартно BLE pairing. Вместо това изисква 11-стъпков proprietary handshake с custom GATT characteristics, HMAC-SHA256 key derivation от QR code и application-level encryption. Това е vendor lock-in по дизайн -- принуждава те да влезеш в Huawei Health app-а. Добрата новина: community-то вече го reverse-engineer-на. Gadgetbridge вече поддържа Watch D2, а open-source имплементации като `huawei-lpv2` съществуват. EU DMA също започва да натиска в обратната посока.

Очаквах стандартно Bluetooth pairing. Connect, bond, exchange data -- обичайното. Вместо това получих proprietary cryptographic handshake, който отне седмици reverse-engineering.

Това се случи, докато строях D2Explorer -- моят проект за свързване на Huawei Watch D2 към Linux и macOS без Huawei Health app-а. След като [оправих проблемите с BlueZ pairing agent-а](../bluez-pairing-python-agent-workaround-authentication-failed/) и минах към cross-platform библиотеката SimpleBLE, мислех, че трудната част е приключила. Трудната част още не беше започнала.

## Какво би очаквал: стандартно BLE Pairing

Ето как Bluetooth LE pairing *би трябвало* да работи:

1. Сканираш за устройството по advertised name (например "HUAWEI WATCH D2-CA0").
2. Свързваш се с `peripheral.connect()`.
3. OS-ът управлява pairing/bonding -- PIN prompt, Just Works, каквото изисква security level-ът.
4. След bonding-а работиш със standard или custom GATT services.

OS-ът управлява security-то. Твоето приложение се фокусира върху data. Просто.

## Какво всъщност става: 11-стъпков Proprietary Handshake

Това, което Watch D2 всъщност изисква, е съвсем различно. Базовата BLE връзка е само вратата. Зад нея има custom application-level authentication protocol, който Huawei е построил върху standard BLE -- това, което community-то нарича **Huawei Link Protocol v2** <small><a href="#ref1">[1]</a></small>.

Standard BLE pairing mechanisms се заобикалят изцяло. За да се authenticate-неш и да получиш достъп до каквито и да било смислени данни, трябва да минеш през тази sequence върху custom GATT characteristics:

1.  **Connect** -- установяваш basic BLE link.
2.  **Enable Notifications** -- *веднага* се subscribe-ваш за notifications върху characteristic `0000fe02-...`. Това е timing-critical -- изпуснеш ли прозореца, часовникът те drop-ва.
3.  **GetLinkParams** -- *веднага* изпращаш custom command (Service ID `0x0001`, Command ID `0x0001`) към write characteristic `0000fe01-...`.
4.  **Receive Server Nonce** -- чакаш notification, който съдържа random challenge-а на часовника.
5.  **Derive Secret Key** -- генерираш client nonce. Комбинираш server nonce, client nonce и **numeric value от QR code-а на часовника**. Пускаш HMAC-SHA256 (с bytes от QR code value-то като key), за да derive-неш shared `secretKey_`.
6.  **AuthRequest** -- изпращаш client nonce и HMAC digest (с derived `secretKey_`) обратно към часовника (Service `0x0001`, Command `0x0002`).
7.  **Verify Server Token** -- получаваш authentication token-а на часовника. Проверяваш го със `secretKey_` и обменените nonces.
8.  **SetTime** -- изпращаш current time и timezone offset, *encrypted* със `secretKey_` (Service `0x0002`, Command `0x0003`).
9.  **QrToken** -- изпращаш QR code value-то обратно, *encrypted* със `secretKey_` (Service `0x0001`, Command `0x0004`).
10. **AuthResult** -- изпращаш final confirmation, *encrypted* със `secretKey_` (Service `0x0001`, Command `0x0005`).
11. **Done** -- едва сега connection-ът е authenticated.

Custom TLV message formats. CRC checks. Service and command IDs. Application-level encryption. Timing, чувствителен до милисекунди. Всичко това се случва *над* BLE stack-а, невидимо за standard Bluetooth tools.

QR code-ът на екрана на часовника е shared secret-ът. Без него не можеш да derive-неш key-а. Без key-а не можеш да се authenticate-неш. Без authentication часовникът не ти дава нищо.

## Защо Huawei прави това

Huawei може да го рамкира като enhanced security. Практическият ефект е **vendor lock-in**.

*   **Висока бариера за влизане** -- протоколът е undocumented. Reimplementation изисква reverse-engineering на Huawei Health app-а (13 000+ classes, 64 000+ methods <small><a href="#ref2">[2]</a></small>) или анализ на BLE traffic. Това активно обезкуражава third-party apps.
*   **Няма interoperability** -- standard fitness apps не могат да се свържат. Часовникът завършва handshake-а си само със software, който знае proprietary steps -- основно собствения Huawei Health app.
*   **Контрол върху ecosystem-а** -- потребителите са принудени да използват Huawei Health и cloud services на Huawei. Смяната на устройства или платформи по-късно означава да изгубиш историята на health data-та си.
*   **По-малък избор за потребителя** -- искаш да използваш open-source app? Искаш повече privacy control върху health data-та си? Лош късмет -- освен ако някой първо не reverse-engineer-не протокола.

И ето го важното: **това не е уникално за Huawei**. Research проектът WatchWitch <small><a href="#ref3">[3]</a></small> документира как всички големи vendors -- Apple, Samsung, Xiaomi -- използват proprietary BLE protocols, за да налагат ecosystem lock-in. Apple Watch е "incredibly tightly coupled with Apple's iPhone and iCloud ecosystem, using proprietary protocols that are unavailable to third parties." Това е системен проблем в индустрията.

Но имплементацията на Huawei е особено агресивна. BLE *позволява* custom services, разбира се. Но да замениш фундаменталния authentication mechanism с proprietary gatekeeper е съвсем друга игра.

## Security иронията

Очевидната защита е "правим го за security." Нека погледнем това.

BlueDoor vulnerability research от Tsinghua University <small><a href="#ref4">[4]</a></small> тества 16 BLE devices, включително Honor Band 3 (същият Huawei ecosystem), и постига **silent pairing without user authorization** при повечето от тях. Proprietary protocol-ът не го предотвратява.

Междувременно самият протокол е reverse-engineer-ван многократно -- от Gadgetbridge community-то, от проекта `huawei-lpv2`, от researchers, които представят на Easterhegg 2019 <small><a href="#ref2">[2]</a></small>, и от мен за D2Explorer. Security through obscurity с expiration date.

HMAC-SHA256 key derivation-ът от QR code-а всъщност е прилична криптография. Но не това е смисълът. Можеш да постигнеш същите security properties със standard BLE Secure Connections и out-of-band pairing method (като NFC или QR code) -- без междувременно да заключваш всяко third-party application отвън.

## Community-то отвръща

Community-то не е приело това тихо.

### Gadgetbridge

[Gadgetbridge](https://gadgetbridge.org/) -- open-source Android app-ът за wearable devices -- вече поддържа Huawei Watch D2 <small><a href="#ref5">[5]</a></small>. Можеш да pair-неш часовника си без Huawei Health app-а. Това изискваше сериозен reverse-engineering effort (виж PR #2462 <small><a href="#ref6">[6]</a></small>), и има ограничения -- ECG functionality е disabled, когато часовникът е paired с Gadgetbridge <small><a href="#ref7">[7]</a></small> -- но работи.

Authentication implementation-ът в Gadgetbridge поддържа auth version 3, като изчислява bonding key-а от pairing message-а (service `0x01`, command `0x0e`) и го използва за decryption. За authentication key negotiation е нужен 17-digit Huawei account ID.

### huawei-lpv2

Проектът [`huawei-lpv2`](https://github.com/zyv/huawei-lpv2) предоставя pure Python implementation на Huawei Link Protocol v2 <small><a href="#ref8">[8]</a></small>. Поддържан е, има multiple forks и служи като reference за всеки, който строи Huawei wearable integrations извън official ecosystem-а.

### D2Explorer

Моят собствен D2Explorer проект тръгна по различен път -- C++ implementation със SimpleBLE, която работи на Linux и macOS. Работата включваше:

*   Implementing TLV serialization/deserialization (`HuaweiProtocol`).
*   Building precise message constructors (`ProtocolMessageBuilder`).
*   Getting the cryptographic steps right -- nonce generation, HMAC-SHA256, XOR encryption (`CryptoOperations`, `CryptoUtils`).
*   Managing strict state transitions and timing (`HuaweiPairingProtocol`, `ProtocolStateManager`).
*   Debugging failures caused by millisecond-level timing mismatches and subtle crypto errors.

D2Explorer съществува *защото* протоколът на Huawei го направи необходим. Това е workaround-ът, който се изисква за basic functionality извън walled garden-а.

### AsteroidOS

[AsteroidOS 2.0](https://asteroidos.org/) стартира през февруари 2026 като major update на open-source Linux-based smartwatch OS <small><a href="#ref9">[9]</a></small>. Вече поддържа ~30 devices, включително Huawei Watch и Huawei Watch 2, с features като always-on display и Tilt-to-Wake. Пълна open-source алтернатива на firmware-а на Huawei.

## Регулаторната вълна

EU не просто наблюдава. Digital Markets Act (DMA) започва да принуждава промяна <small><a href="#ref10">[10]</a></small>.

През декември 2025 Apple пусна iOS 26.3 с AirPods-like pairing за third-party devices -- включително Huawei smartwatches -- конкретно за да се съобрази с DMA requirements <small><a href="#ref11">[11]</a></small>. Background syncing между Huawei watches и iPhones вече работи в Европа.

DMA задължава gatekeepers да предоставят interoperability за connected devices. Това директно се прицелва в вида proprietary BLE lock-in, който Huawei (и Apple, и всички останали) практикуват. Full rollout на тези interoperability features се очаква през 2026.

Това е значимо. За първи път има регулаторен натиск да се стандартизира нещо, което vendors умишлено държат proprietary. Technical community-то може да reverse-engineer-ва протоколи един по един, но regulation може да промени incentive structure-а за цялата индустрия.

## Какво означава това

Pairing protocol-ът на Huawei Watch D2 е case study за това как custom protocols върху standard transports могат да налагат vendor lock-in. Слоевете proprietary cryptography, custom message formats и timing-sensitive handshakes съществуват не защото standard BLE не може да се справи с authentication -- може -- а защото proprietary protocols държат потребителите вътре в ecosystem-а.

Картината обаче се променя. Gadgetbridge ти дава алтернатива още сега. EU DMA налага interoperability на регулаторно ниво. А open-source проекти като `huawei-lpv2`, D2Explorer и AsteroidOS доказват, че community-то ще reverse-engineer-не това, което vendors се опитват да заключат.

Строенето на D2Explorer беше по-малко за Bluetooth и повече за cryptographic detective work. То подчертава нещо, което не би трябвало да има нужда от подчертаване: трябва да можеш да достъпваш собствените си health data със software по свой избор.

---

### References

<a id="ref1"></a>1. [huawei-lpv2: Pure Python implementation of Huawei BLE Link Protocol v2](https://github.com/zyv/huawei-lpv2) -- *Open-source reference implementation на протокола.*<br>
<a id="ref2"></a>2. [All Your Fitness Data Belongs to You: Reverse Engineering the Huawei Health Android App](https://media.ccc.de/v/eh19-186-all-your-fitness-data-belongs-to-you-reverse-engineering-the-huawei-health-android-app) -- *Easterhegg 2019 conference talk, който документира reverse engineering effort-а. [Slides (PDF)](https://www.sba-research.org/wp-content/uploads/2019/04/easterhegg19.pdf).*<br>
<a id="ref3"></a>3. [WatchWitch: Academic Research on Smartwatch Interoperability](https://arxiv.org/html/2507.07210v1) -- *Документира как всички големи vendors използват proprietary protocols за ecosystem lock-in.*<br>
<a id="ref4"></a>4. [BlueDoor: Breaking the Secure Information Flow via BLE Vulnerability (Tsinghua University)](https://tns.thss.tsinghua.edu.cn/~jiliang/publications/MOBISYS2020_BlueDoor.pdf) -- *Открива silent pairing vulnerabilities в 16 BLE devices, включително Honor Band 3.*<br>
<a id="ref5"></a>5. [Gadgetbridge: Huawei/Honor Device Support](https://gadgetbridge.org/basics/topics/huawei-honor/) -- *Official support page за Huawei и Honor wearables.*<br>
<a id="ref6"></a>6. [Gadgetbridge PR #2462: Initial Huawei/Honor Support](https://codeberg.org/Freeyourgadget/Gadgetbridge/pulls/2462) -- *Pull request-ът, който добавя Huawei device support към Gadgetbridge.*<br>
<a id="ref7"></a>7. [Gadgetbridge Issue #4918: ECG Disabled with Gadgetbridge](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/4918) -- *Known limitation при използване на Gadgetbridge вместо Huawei Health.*<br>
<a id="ref8"></a>8. [Gadgetbridge: Huawei/Honor Pairing Guide](https://gadgetbridge.org/basics/pairing/huawei-honor-pairing/) -- *Step-by-step pairing instructions за Huawei devices.*<br>
<a id="ref9"></a>9. [AsteroidOS 2.0 Release](https://www.cnx-software.com/2026/02/18/asteroidos-2-0-open-source-smartwatch-os-released-now-supports-around-30-devices/) -- *Open-source smartwatch OS, която вече поддържа ~30 devices, включително Huawei watches.*<br>
<a id="ref10"></a>10. [EU Digital Markets Act: Interoperability Requirements](https://digital-markets-act.ec.europa.eu/questions-and-answers/interoperability_en) -- *DMA provisions, които задължават connected device interoperability.*<br>
<a id="ref11"></a>11. [iOS 26.3 DMA Features: Third-Party Smartwatch Pairing](https://www.macrumors.com/2025/12/22/ios-26-3-dma-airpods-pairing/) -- *Apple's compliance с EU interoperability mandates за wearable devices.*

---

### Related Posts

- [BlueZ Pairing Fix: External Python Agent & D-Bus Polling](/bluez-pairing-python-agent-workaround-authentication-failed/) -- предшественикът на това разследване. Преди да можехме да се заемем с proprietary protocol-а на Huawei, трябваше да оправим `AuthenticationFailed` errors на BlueZ със standard BLE pairing.
- [Fix Android Emulator Bluetooth on M1 Mac using Bumble & API 32](/m1-mac-android-emulator-bluetooth-passthrough-bumble/) -- още една BLE integration битка, този път bridge-вайки physical Bluetooth radio-то на Mac към Android Emulator.
