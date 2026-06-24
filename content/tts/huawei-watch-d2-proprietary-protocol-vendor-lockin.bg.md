[conversational tone] Дълбоко гмуркане в proprietary BLE pairing протокола на Huawei Watch D2 -- нестандартен 11-стъпков handshake с HMAC-SHA256 и custom encryption. Как заключва потребителите, и как community-то отвръща.

TL;DR: Huawei Watch D2 не използва стандартно BLE pairing. Вместо това изисква 11-стъпков proprietary handshake с custom GATT characteristics, HMAC-SHA256 key derivation от QR code и application-level encryption. Това е vendor lock-in по дизайн -- принуждава те да влезеш в Huawei Health app-а. Добрата новина: community-то вече го reverse-engineer-на. Gadgetbridge вече поддържа Watch D2, а open-source имплементации като huawei-lpv2 съществуват. EU DMA също започва да натиска в обратната посока.

Очаквах стандартно Bluetooth pairing. Connect, bond, exchange data -- обичайното. Вместо това получих proprietary cryptographic handshake, който отне седмици reverse-engineering.

[calm] Това се случи, докато строях D2Explorer -- моят проект за свързване на Huawei Watch D2 към Linux и macOS без Huawei Health app-а. След като оправих проблемите с BlueZ pairing agent-а и минах към cross-platform библиотеката SimpleBLE, мислех, че трудната част е приключила. Трудната част още не беше започнала.

[matter-of-fact] Какво би очаквал: стандартно BLE Pairing

Ето как Bluetooth LE pairing би трябвало да работи:

Сканираш за устройството по advertised name (например "HUAWEI WATCH D2-CA0"). Свързваш се с peripheral.connect(). OS-ът управлява pairing/bonding -- PIN prompt, Just Works, каквото изисква security level-ът. След bonding-а работиш със standard или custom GATT services.

OS-ът управлява security-то. Твоето приложение се фокусира върху data. Просто.

[deliberate] Какво всъщност става: 11-стъпков Proprietary Handshake

Това, което Watch D2 всъщност изисква, е съвсем различно. Базовата BLE връзка е само вратата. Зад нея има custom application-level authentication protocol, който Huawei е построил върху standard BLE -- това, което community-то нарича Huawei Link Protocol v2.

[deliberate] Standard BLE pairing mechanisms се заобикалят изцяло. За да се authenticate-неш и да получиш достъп до каквито и да било смислени данни, трябва да минеш през тази sequence върху custom GATT characteristics:

Connect -- установяваш basic BLE link. Enable Notifications -- веднага се subscribe-ваш за notifications върху characteristic 0000fe02-.... Това е timing-critical -- изпуснеш ли прозореца, часовникът те drop-ва. GetLinkParams -- веднага изпращаш custom command (Service ID 0x0001, Command ID 0x0001) към write characteristic 0000fe01-.... Receive Server Nonce -- чакаш notification, който съдържа random challenge-а на часовника. Derive Secret Key -- генерираш client nonce. Комбинираш server nonce, client nonce и numeric value от QR code-а на часовника. Пускаш HMAC-SHA256 (с bytes от QR code value-то като key), за да derive-неш shared secretKey_. AuthRequest -- изпращаш client nonce и HMAC digest (с derived secretKey_) обратно към часовника (Service 0x0001, Command 0x0002). Verify Server Token -- получаваш authentication token-а на часовника. Проверяваш го със secretKey_ и обменените nonces. SetTime -- изпращаш current time и timezone offset, encrypted със secretKey_ (Service 0x0002, Command 0x0003). QrToken -- изпращаш QR code value-то обратно, encrypted със secretKey_ (Service 0x0001, Command 0x0004). AuthResult -- изпращаш final confirmation, encrypted със secretKey_ (Service 0x0001, Command 0x0005). Done -- едва сега connection-ът е authenticated.

Custom TLV message formats. CRC checks. Service and command IDs. Application-level encryption. Timing, чувствителен до милисекунди. Всичко това се случва над BLE stack-а, невидимо за standard Bluetooth tools.

QR code-ът на екрана на часовника е shared secret-ът. Без него не можеш да derive-неш key-а. Без key-а не можеш да се authenticate-неш. Без authentication часовникът не ти дава нищо.

[calm] Защо Huawei прави това

Huawei може да го рамкира като enhanced security. Практическият ефект е vendor lock-in.

Висока бариера за влизане -- протоколът е undocumented. Reimplementation изисква reverse-engineering на Huawei Health app-а (13 000+ classes, 64 000+ methods ) или анализ на BLE traffic. Това активно обезкуражава third-party apps. Няма interoperability -- standard fitness apps не могат да се свържат. Часовникът завършва handshake-а си само със software, който знае proprietary steps -- основно собствения Huawei Health app. Контрол върху ecosystem-а -- потребителите са принудени да използват Huawei Health и cloud services на Huawei. Смяната на устройства или платформи по-късно означава да изгубиш историята на health data-та си. По-малък избор за потребителя -- искаш да използваш open-source app? Искаш повече privacy control върху health data-та си? Лош късмет -- освен ако някой първо не reverse-engineer-не протокола.

[matter-of-fact] И ето го важното: това не е уникално за Huawei. Research проектът WatchWitch документира как всички големи vendors -- Apple, Samsung, Xiaomi -- използват proprietary BLE protocols, за да налагат ecosystem lock-in. Apple Watch е "incredibly tightly coupled with Apple's iPhone and iCloud ecosystem, using proprietary protocols that are unavailable to third parties." Това е системен проблем в индустрията.

Но имплементацията на Huawei е особено агресивна. BLE позволява custom services, разбира се. Но да замениш фундаменталния authentication mechanism с proprietary gatekeeper е съвсем друга игра.

[reflective] Security иронията

Очевидната защита е "правим го за security." Нека погледнем това.

BlueDoor vulnerability research от Tsinghua University тества 16 BLE devices, включително Honor Band 3 (същият Huawei ecosystem), и постига silent pairing without user authorization при повечето от тях. Proprietary protocol-ът не го предотвратява.

Междувременно самият протокол е reverse-engineer-ван многократно -- от Gadgetbridge community-то, от проекта huawei-lpv2, от researchers, които представят на Easterhegg 2019, и от мен за D2Explorer. Security through obscurity с expiration date.

HMAC-SHA256 key derivation-ът от QR code-а всъщност е прилична криптография. Но не това е смисълът. Можеш да постигнеш същите security properties със standard BLE Secure Connections и out-of-band pairing method (като NFC или QR code) -- без междувременно да заключваш всяко third-party application отвън.

[matter-of-fact] Community-то отвръща

Community-то не е приело това тихо.

[deliberate] Gadgetbridge

Gadgetbridge -- open-source Android app-ът за wearable devices -- вече поддържа Huawei Watch D2. Можеш да pair-неш часовника си без Huawei Health app-а. Това изискваше сериозен reverse-engineering effort (виж PR #2462 ), и има ограничения -- ECG functionality е disabled, когато часовникът е paired с Gadgetbridge -- но работи.

Authentication implementation-ът в Gadgetbridge поддържа auth version 3, като изчислява bonding key-а от pairing message-а (service 0x01, command 0x0e) и го използва за decryption. За authentication key negotiation е нужен 17-digit Huawei account ID.

[calm] huawei-lpv2

Проектът huawei-lpv2 предоставя pure Python implementation на Huawei Link Protocol v2. Поддържан е, има multiple forks и служи като reference за всеки, който строи Huawei wearable integrations извън official ecosystem-а.

[reflective] D2Explorer

Моят собствен D2Explorer проект тръгна по различен път -- C++ implementation със SimpleBLE, която работи на Linux и macOS. Работата включваше:

Implementing TLV serialization/deserialization (HuaweiProtocol). Building precise message constructors (ProtocolMessageBuilder). Getting the cryptographic steps right -- nonce generation, HMAC-SHA256, XOR encryption (CryptoOperations, CryptoUtils). Managing strict state transitions and timing (HuaweiPairingProtocol, ProtocolStateManager). Debugging failures caused by millisecond-level timing mismatches and subtle crypto errors.

D2Explorer съществува защото протоколът на Huawei го направи необходим. Това е workaround-ът, който се изисква за basic functionality извън walled garden-а.

[matter-of-fact] AsteroidOS

AsteroidOS 2.0 стартира през февруари 2026 като major update на open-source Linux-based smartwatch OS. Вече поддържа ~30 devices, включително Huawei Watch и Huawei Watch 2, с features като always-on display и Tilt-to-Wake. Пълна open-source алтернатива на firmware-а на Huawei.

[deliberate] Регулаторната вълна

[deliberate] EU не просто наблюдава. Digital Markets Act (DMA) започва да принуждава промяна.

През декември 2025 Apple пусна iOS 26.3 с AirPods-like pairing за third-party devices -- включително Huawei smartwatches -- конкретно за да се съобрази с DMA requirements. Background syncing между Huawei watches и iPhones вече работи в Европа.

DMA задължава gatekeepers да предоставят interoperability за connected devices. Това директно се прицелва в вида proprietary BLE lock-in, който Huawei (и Apple, и всички останали) практикуват. Full rollout на тези interoperability features се очаква през 2026.

Това е значимо. За първи път има регулаторен натиск да се стандартизира нещо, което vendors умишлено държат proprietary. Technical community-то може да reverse-engineer-ва протоколи един по един, но regulation може да промени incentive structure-а за цялата индустрия.

[calm] Какво означава това

Pairing protocol-ът на Huawei Watch D2 е case study за това как custom protocols върху standard transports могат да налагат vendor lock-in. Слоевете proprietary cryptography, custom message formats и timing-sensitive handshakes съществуват не защото standard BLE не може да се справи с authentication -- може -- а защото proprietary protocols държат потребителите вътре в ecosystem-а.

Картината обаче се променя. Gadgetbridge ти дава алтернатива още сега. EU DMA налага interoperability на регулаторно ниво. А open-source проекти като huawei-lpv2, D2Explorer и AsteroidOS доказват, че community-то ще reverse-engineer-не това, което vendors се опитват да заключат.

[matter-of-fact] Строенето на D2Explorer беше по-малко за Bluetooth и повече за cryptographic detective work. То подчертава нещо, което не би трябвало да има нужда от подчертаване: трябва да можеш да достъпваш собствените си health data със software по свой избор.
