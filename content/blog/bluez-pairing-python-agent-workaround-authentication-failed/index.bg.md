---
lang: "bg"
translationOf: "bluez-pairing-python-agent-workaround-authentication-failed"
translationUpdatedAt: "2026-05-17"
translationSourceHash: "0364f15f40f64a8e"
title: "Поправка за BlueZ сдвояване: външен Python agent и D-Bus polling"
date: "2025-04-08"
description: "Решение за BlueZ грешки 'AuthenticationFailed' при сдвояване на 5.66+. Защо вътрешните C++ sd-bus agents се провалят, как външен Python agent го поправя и защо ти трябва D-Bus polling."
featuredImage: "./images/featured.jpg"
imageCaption: "Навигиране в сложните взаимодействия между BlueZ D-Bus pairing agents под Linux."
---

> **TL;DR:** Ако получаваш `org.bluez.Error.AuthenticationFailed` със собствен C++/sd-bus pairing agent на BlueZ 5.66+, проблемът най-вероятно е във вътрешната регистрация на agent-а. Пусни външен Python agent (`simple-agent.py`) като отделен процес и имплементирай D-Bus property polling, вместо да разчиташ на `PropertiesChanged` сигнали. Подробностите и кодът са по-долу.

Прекарах два дни, втренчен в `org.bluez.Error.AuthenticationFailed`, преди да разбера какво всъщност става.

Pairing agent-ът беше регистриран. D-Bus извикванията изглеждаха правилни. `busctl` потвърждаваше, че всичко е на мястото си -- а BlueZ просто продължаваше да казва не. Това беше по време на работата по [D2Explorer](../huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- инструмент за сдвояване с Huawei Watch D2 под Linux -- и грешката при сдвояване блокираше всичко.

Ето какво наистина се случи и как го оправихме.

## Планът: вътрешен C++ pairing agent

Идеята беше чиста и самодостатъчна. Едно C++ приложение, което управлява целия процес на сдвояване чрез `sd-bus` (C/C++ D-Bus bindings):

1.  Свържи се към system D-Bus.
2.  Намери Bluetooth адаптера (`org.bluez.Adapter1`).
3.  Имплементирай C++ клас, който предоставя интерфейса `org.bluez.Agent1`.
4.  Регистрирай agent-а в `org.bluez.AgentManager1` чрез `RegisterAgent` и `RequestDefaultAgent`. Започнахме с capability `DisplayYesNo`, после го опростихме до `NoInputNoOutput`.
5.  Открий целевото устройство (`org.bluez.Device1`).
6.  Извикай `Pair()` върху D-Bus интерфейса на устройството.
7.  Вътрешният agent обработва callbacks (`RequestConfirmation`, `RequestAuthorization`) автоматично -- без нужда от потребителско действие.
8.  Trust-ваш устройството, установяваш GATT connection, готово.

Един binary, без външни зависимости. Това беше планът.

## Стената: `org.bluez.Error.AuthenticationFailed`

Всичко работеше до стъпка 6. Адаптерът беше намерен, agent-ът регистриран (D-Bus го потвърждаваше), устройството открито. Но в момента, в който извикахме `Device1.Pair()` чрез `sd_bus_call_method` -- моментален провал:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method threw exception: Failed to call method 'Pair':
    Input/output error - D-Bus error: org.bluez.Error.AuthenticationFailed (Authentication Failed)
```

Опитахме всичко. Различни agent capabilities. Проверихме `sd-bus` vtable настройката. Уверихме се, че имплементациите на agent methods връщат успех бързо. Използвахме `busctl` и `gdbus`, за да наблюдаваме D-Bus traffic-а -- registration calls изглеждаха правилни. `Pair()` извикването просто продължаваше да се проваля.

**Задънена улица.**

## Пробивът: външен Python agent

За да изолираме проблема, извадихме вътрешния C++ agent от уравнението. Пуснахме стандартния `simple-agent.py` на BlueZ като отделен процес *преди* да стартираме нашето C++ приложение (вече без собствената му agent registration):

```bash
# Terminal 1: Run the external agent
sudo python simple-agent.py NoInputNoOutput

# Terminal 2: Run our C++ app (no internal agent)
sudo ./build/huawei_pair_app <MAC> <QR_VALUE>
```

Резултатът:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method succeeded  <--- SUCCESS!
```

Консистентно. Всеки път. Грешката `AuthenticationFailed` изчезна напълно.

Това доказа, че проблемът не беше в самия `Pair()`, нито в устройството, нито в pairing capability-то на BlueZ. Беше конкретно в начина, по който нашето C++ приложение, използвайки `sd-bus`, се регистрираше и взаимодействаше като pairing agent. Същата логическа операция -- регистриране на `NoInputNoOutput` agent и извикване на `Pair()` -- работеше перфектно, когато agent-ът вървеше като отделен Python процес.

**Това сработи.**

## Защо вътрешният agent се провали?

Когато за пръв път се сблъсках с това, имах само хипотези. Оттогава намерих реални документирани доказателства, че това е по-широк проблем -- не само нашият код.

### BlueZ 5.70+ regression

[BlueZ GitHub Issue #605](https://github.com/bluez/bluez/issues/605) документира случаи, в които устройства се сдвояват без проблем на BlueZ 5.50, но се провалят на по-нови версии с `auth failed with status 0x05`. HCI logs показват `Status: PIN or Key Missing (0x06)` въпреки запазени link keys. Workaround-ът? Стартиране на legacy `bluez-simple-agent.py` script. Звучи познато?

### Наличният agent е root cause-ът

[Bleak Issue #1434](https://github.com/hbldh/bleak/issues/1434) го прави още по-ясно: сдвояването работи само когато `bluetoothctl` или GNOME Bluetooth е стартиран, защото тези приложения регистрират нужния authentication agent. Без активен, *правилно функциониращ* agent, BlueZ вътрешно връща `No agent available for request type 2` -- което на повърхността излиза като `AuthenticationFailed`.

Ключовият извод: не е достатъчно просто да *регистрираш* agent. Agent-ът трябва да отговаря на callbacks от BlueZ по начин, който `bluetoothd` приема за валиден. И нещо в начина, по който `sd-bus` прави това в същия процес, който инициира сдвояването, не удовлетворява по-новите версии на BlueZ.

### Може дори да не е BlueZ

[Red Hat Bug #1905671](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) разкрива, че някои `AuthenticationFailed` грешки са kernel-related, а не BlueZ-related. Kernel 5.9 е имал проблеми със сдвояването, които 5.8.18 и 5.10+ не са имали. Коментарът на maintainer-а си струва да се цитира: *"Bluetooth is complex, it could be firmware, kernel, bluez, controller, end device or a combination of them all."*

### Agent capability mismatch

[BlueZ Issue #650](https://github.com/bluez/bluez/issues/650) документира още един ъгъл: някои устройства (особено iOS) се провалят при сдвояване с `NoInputNoOutput` agents, защото downgrade-ват Secure Connections към Legacy pairing, което води до `Insufficient Authentication (0x05)` грешки при последващ attribute access. Това е Security Manager Protocol (SMP) negotiation проблем, не agent registration проблем -- но произвежда същото error message.

### Най-вероятните виновници в нашия случай

Като се има предвид evidence-ът, най-вероятните обяснения за провала на вътрешния `sd-bus` agent са:

1.  **Timing** -- `sd-bus` registration или method handling в нашия event loop не отговаряше в точния прозорец, който `bluetoothd` очакваше.
2.  **Тънкости между `sd-bus` и `python-dbus`** -- разлики в начина, по който тези libraries взаимодействат с D-Bus daemon-а или управляват object lifetimes.
3.  **По-строги изисквания в BlueZ 5.66+** -- променени вътрешни sequences за agent interaction, които `sd-bus`, когато се използва в същото приложение, иницииращо сдвояването, не удовлетворява.

## Втората стена: D-Bus сигналите са ненадеждни

Да минем покрай `AuthenticationFailed` беше голяма победа, но не беше краят. С външния agent на място `Pair()` успяваше -- но не можехме надеждно да *засечем* кога е приключил.

Разчитахме на D-Bus `PropertiesChanged` сигнали (чрез `sd-bus`), за да разберем кога `Paired`, `Trusted`, `Connected` и `ServicesResolved` стават `true`. Понякога сигналите пристигаха. Понякога закъсняваха. Понякога изобщо не пристигаха.

Затова имплементирахме **active polling** -- fallback, който query-ва property values директно, когато сигналите не се появят:

```c++
bool BluetoothDevice::isPaired() {
    bool cachedValue = mockPaired_.load(); // Check signal-updated cache
    if (cachedValue) return true;

    // Signal didn't fire? Poll D-Bus directly.
    Logger::debug("[Polling] Polling Paired property via D-Bus...");
    bool polledValue = false;
    adapter_.getObjectProperty<bool>(
        devicePath_, "org.bluez.Device1", "Paired", polledValue
    );
    if (polledValue) mockPaired_.store(true); // Update cache
    return polledValue;
}
```

Всеки state transition method (`isPaired()`, `isTrusted()`, `isConnected()`, `areServicesResolved()`) следва същия pattern: първо проверява cached atomic boolean-а (обновен от signal handler-а, ако той сработи), после пада обратно към директен D-Bus `Get` property call.

Не е елегантно. Но е необходимо.

**Това сработи.**

## Пълната поправка

Ето консолидираната рецепта. Ако изграждаш automated Bluetooth pairing под Linux с BlueZ 5.66+ и удряш `AuthenticationFailed`:

### Стъпка 1: Вземи simple-agent.py

Вземи го от [BlueZ source tree](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent).

### Стъпка 2: Стартирай външния agent

```bash
sudo python simple-agent.py NoInputNoOutput
```

Дръж го стартиран в отделен terminal (или като background service).

### Стъпка 3: Извади вътрешния agent от приложението си

Премахни всички `RegisterAgent` / `RequestDefaultAgent` извиквания от C++ приложението си. Остави външния Python agent да обработва authentication callbacks.

### Стъпка 4: Добави D-Bus property polling

Не разчитай само на `PropertiesChanged` сигнали. За всяко критично property (`Paired`, `Trusted`, `Connected`, `ServicesResolved`) имплементирай cache-then-poll pattern-а, показан по-горе. Poll-вай периодично от main loop-а.

### Стъпка 5: Провери

1.  Потвърди, че външният agent е стартиран (`sudo python simple-agent.py NoInputNoOutput`).
2.  Стартирай приложението си. `Pair()` трябва да успее.
3.  Наблюдавай polling logs -- трябва да виждаш D-Bus property queries за state transitions.
4.  Ако `Pair()` все още се проваля, провери версията на BlueZ (`bluetoothd --version`) и kernel версията -- проблемът може да е по-дълбок.

## Какво ти струва това

Няма да се преструвам, че това е чисто решение. Не е:

1.  **External dependency** -- приложението ти вече има нужда от отделен Python процес, който да върви.
2.  **Повече complexity** -- polling logic в main loop-а, върху signal handlers.
3.  **По-малко self-contained** -- мечтата за един binary си отиде.

Но работи. Надеждно. А когато два дни си гледал `AuthenticationFailed`, "работи" е това, което има значение.

---

### Референции

<a id="ref1"></a>1. [BlueZ GitHub Issue #55: Device characteristics and pairing timing](https://github.com/bluez/bluez/issues/55) -- *Intermittent pairing failures related to agent timing.*<br>
<a id="ref2"></a>2. [Bluetooth Auto Pairing with NoInputNoOutput Agent Issues](https://forums.raspberrypi.com/viewtopic.php?t=324225) -- *Forum discussion about headless pairing challenges.*<br>
<a id="ref3"></a>3. [BlueZ Source: test/simple-agent](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent) -- *The standard Python agent.*<br>
<a id="ref4"></a>4. [BlueZ GitHub Issue #605: Pairing regression in 5.70+](https://github.com/bluez/bluez/issues/605) -- *Documented failures with newer BlueZ versions.*<br>
<a id="ref5"></a>5. [Bleak Issue #1434: Pairing requires active agent](https://github.com/hbldh/bleak/issues/1434) -- *Evidence that agent availability is the root cause.*<br>
<a id="ref6"></a>6. [Red Hat Bug #1905671: Kernel-related pairing failures](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) -- *Not always BlueZ -- sometimes it's the kernel.*<br>
<a id="ref7"></a>7. [BlueZ GitHub Issue #650: Agent capability mismatch](https://github.com/bluez/bluez/issues/650) -- *SMP negotiation failures with NoInputNoOutput.*<br>
<a id="ref8"></a>8. [BlueZ Agent API Documentation](https://bluez.readthedocs.io/en/latest/agent-api/) -- *Official agent interface reference.*<br>
<a id="ref9"></a>9. [Kynetics: Pairing Agents in the BlueZ Stack](https://technotes.kynetics.com/2018/pairing_agents_bluez/) -- *Technical deep dive into agent registration.*

---

### Свързани публикации

- [Huawei Watch D2 BLE Pairing: Protocol & Vendor Lock-In](/huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- проектът, който доведе до това разследване. Watch D2 изисква proprietary application-level handshake върху стандартния BLE pairing, затова automated pairing трябваше да заработи още от самото начало.
- [Fix Android Emulator Bluetooth on M1 Mac using Bumble & API 32](/m1-mac-android-emulator-bluetooth-passthrough-bumble/) -- още една Bluetooth integration битка, този път bridge-ване на физическото radio на Mac към Android Emulator.
