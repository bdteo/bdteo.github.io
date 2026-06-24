[conversational tone] Поправете Bluetooth passthrough за Android Emulator на M1 Mac. Ръководството описва работещата настройка с Bumble, Netsim, изрични endpoints и API 32 AVD.

Ако разработвате с Bluetooth на M1/M2/M3 Mac и се опитвате да накарате Bluetooth радиото на хост машината да работи вътре в Android Emulator, вероятно вече сте усетили болката. Нещо, което изглежда сякаш трябва да е право напред, често се превръща в дразнеща дупка от неуспешни връзки, криптични грешки и документационни задънени улици. Наскоро минах през точно тази битка и след няколко стени най-сетне намерих комбинация с Python Bluetooth стека Bumble, която наистина работи.

Това не е поредното теоретично ръководство; това е разказ стъпка по стъпка за това какво се провали и, по-важното, какво успя при свързването на Bluetooth-а на моя M1 Mac Pro (в моя случай през външен USB dongle, но принципът може да важи и за вътрешни радиа) към Android 12L (API 32) emulator.

[matter-of-fact] Целта: истински Bluetooth в емулатора

Целта беше проста: Android Emulator да използва физическия Bluetooth controller на моя Mac вместо собствения си ограничен виртуален controller. Това е решаващо за тестване на приложения, които взаимодействат с реални Bluetooth устройства.

[deliberate] Инструментът: Bumble влиза в кадър

Bumble е мощен Python Bluetooth stack. Ключовият му инструмент за тази задача е bumble-hci-bridge, който може от едната страна да се свърже с физически HCI (Host Controller Interface), а от другата да го изложи през различни transports (като TCP или gRPC).

[calm] Опит #1: QEMU socket методът (логичният първи опит)

На база общи познания за QEMU и някои по-стари ръководства първият подход беше да използвам emulator flags, за да свържа директно виртуален serial port (подпрян от TCP socket) към HCI bridge.

Стартиране на bridge-а (TCP server mode): Свързахме Bumble към физическия dongle (който изненадващо работеше по-добре с usb:0, отколкото с конкретния му VID:PID usb:0b05:17cb на моята машина - M1 особености!) и го накарахме да слуша на TCP port.

[calm] Стартиране на емулатора с QEMU flags: Променихме emulator launch script-а (първоначално за API 34), за да добавим -qemu flags, които насочват virtual serial port (virtserialport) към character device (chardev), подпряно от TCP socket, свързващ се към bridge-а.

Резултатът? Частичен успех, окончателен провал: С lsof виждахме, че QEMU процесът на емулатора наистина установи TCP връзка към Bumble bridge-а! Android Bluetooth stack-ът вътре в емулатора обаче така и не изпрати HCI commands през нея. Включването и изключването на Bluetooth в Android settings не правеше нищо. Bridge logs останаха тихи след първоначалната връзка. Задънена улица.

[reflective] Опит #2: Default Netsim bridge (следвайки Bumble docs)

Документацията на Bumble споменава bridging към "Netsim" gRPC interface-а на емулатора. Netsim (и неговото ядро Root Canal) е по-новата система на емулатора за virtual Bluetooth controller.

Стартиране на bridge-а (Netsim controller mode): Настроихме bridge-а да действа като Netsim controller, да слуша на default gRPC port (8554) и да се свърже с физическия dongle.

Стартиране на емулатора (default backend): Върнахме launch script-а (все още опитвайки с API 34), махнахме -qemu flags и добавихме -packet-streamer-endpoint default, за да сме сигурни, че се опитва да използва Netsim backend-а.

Резултатът? Няма връзка: Този път емулаторът тръгна, но Bumble bridge-ът не показа никакви признаци за входяща gRPC връзка от емулатора. Прегледът на emulator logs не разкри очевидни connection errors, но Bluetooth остана неизползваем. Още една задънена улица.

[matter-of-fact] Опит #3: API downgrade + explicit Netsim endpoint (победителят!)

Web searches разкриха общи reports за нестабилност с Bluetooth на API 33/34 емулатори и потенциални проблеми с това как емулаторът открива или се свързва с Netsim backend-а, особено когато външен инструмент се опитва да го прихване. Ключът изглежда беше изрично да кажем на емулатора къде е Netsim gRPC server-ът и да пробваме по-стар API level.

Стартиране на bridge-а (Netsim controller mode, explicit port, usb:0): Същото като в Опит #2, като се уверим, че слуша на известен port (8554) и се свързва с физическия dongle чрез index-а (usb:0), който работеше надеждно.

Промяна и стартиране на емулатора (API 32, explicit endpoint): Създадохме API 32 (Android 12L) AVD с Google Play Services (gplay_32_arm). Променихме launch script-а да target-ва този AVD и, решаващо, сменихме -packet-streamer-endpoint flag-а от default към точния address на нашия bridge.

Резултатът? Успех! Този път проработи! Терминалът с bumble-hci-bridge започна да показва gRPC connection logs от емулатора малко след launch-а. След като емулаторът boot-на, включването на Bluetooth ON в Android Settings доведе до поток от HCI commands (Reset, Read Version, Set Event Mask и т.н.) в bridge terminal-а. Scanning за устройства вътре в емулатора успешно използва физическото Bluetooth radio на Mac през ASUS dongle-а!

[deliberate] Печелившата рецепта: стъпка по стъпка

Ето точната процедура, която проработи на моя M1 Mac Pro с външен ASUS USB-BT500 dongle:

[matter-of-fact] Инсталирайте Bumble:

(По желание, но препоръчително) Изключете native USB BT handling-а на macOS: Пуснете веднъж и reboot.

Стартирайте Bumble Netsim bridge-а: Отворете terminal и пуснете (оставете го да работи):

(Проверете, че показва >>> connected два пъти).

Подгответе emulator launch script-а: Запазете пълния script, даден по-долу, като launch_gapps_avd_api32.sh (или подобно). Уверете се, че target-ва API 32 AVD (ще създаде такъв с име gplay_32_arm, ако не съществува) и изрично използва -packet-streamer-endpoint localhost:8554. Направете го executable (chmod +x launch_gapps_avd_api32.sh).

Пуснете launch script-а: Отворете нов terminal и изпълнете script-а:

Проверете: След като емулаторът boot-не: Проверете bumble-hci-bridge terminal-а за gRPC и HCI traffic. Отидете в Android Settings -> Bluetooth и го включете ON. Пробвайте scanning или pairing.

[calm] Успешният launch script (API 32, explicit Netsim endpoint)

[reflective] Ключови изводи за M1 Mac + Emulator + Bumble

API level има значение: По-новото не винаги е по-добро за emulator compatibility, особено при сложни features като Bluetooth bridging. API 32 изглеждаше по-стабилен за това от API 34 в моите тестове. Explicit endpoints: Не разчитайте на -packet-streamer-endpoint default, когато използвате външен bridge като Netsim controller mode-а на Bumble. Насочете емулатора изрично към localhost:, където bridge-ът слуша. Netsim bridge > QEMU socket: android-netsim bridge mode изглежда по-вероятно да работи с modern emulators от по-нисконивовия -qemu -chardev socket метод, въпреки че socket методът може да установи TCP link. usb:0 срещу VID:PID: На macOS/M1 идентифицирането на USB devices може да е странно. Ако посочването на точния VID:PID се провали неочаквано, пробвайте да използвате index-а usb:0 (ако приемем, че това е primary/intended device-ът). Упоритостта се отплаща: Това отне няколко опита, комбинирайки insights от документация, web searches и iterative testing. Не се отказвайте твърде лесно!

Надявам се споделянето на тази конкретна, работеща конфигурация да спести на други разработчици часове раздразнение. Happy coding (and bridging)!
