---
lang: "es"
translationOf: "bluez-pairing-python-agent-workaround-authentication-failed"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "0364f15f40f64a8e"
title: "Solución de emparejamiento en BlueZ: agente Python externo y sondeo de D-Bus"
date: "2025-04-08"
description: "Resuelve los errores de emparejamiento 'AuthenticationFailed' de BlueZ en 5.66+. Por qué fallan los agentes internos en C++/sd-bus, cómo lo arregla un agente Python externo y por qué necesitas sondear D-Bus."
tags: ["BlueZ", "DBus", "PairingAgent", "Python", "C++", "sd-bus", "AuthenticationFailed", "LinuxBluetooth", "Workaround", "BluetoothPairing", "EmbeddedLinux"]
featuredImage: "./images/featured.jpg"
imageCaption: "Navegando por las complejidades de las interacciones del agente de emparejamiento D-Bus de BlueZ en Linux."
audioUrl: "/audio/articles/bluez-pairing-python-agent-workaround-authentication-failed/es/Qh9qDWKx9XUbnKbERblA-f9e6333a5195.m4a"
audioDuration: "11:17"
audioVoice: "Gerard (ElevenLabs LatAm Spanish neutral)"
audioGeneratedAt: "2026-06-24"
audioTextSource: "content/tts/bluez-pairing-python-agent-workaround-authentication-failed.es.md"
---

> **TL;DR:** Si recibes `org.bluez.Error.AuthenticationFailed` con un agente de emparejamiento personalizado en C++/sd-bus sobre BlueZ 5.66+, lo más probable es que el problema sea el registro de tu agente interno. Ejecuta un agente Python externo (`simple-agent.py`) como un proceso aparte, e implementa el sondeo de propiedades de D-Bus en lugar de depender de las señales `PropertiesChanged`. Los detalles y el código están más abajo.

Pasé dos días mirando fijamente `org.bluez.Error.AuthenticationFailed` antes de averiguar qué estaba pasando.

El agente de emparejamiento estaba registrado. Las llamadas de D-Bus parecían correctas. `busctl` confirmaba que todo estaba en su sitio -- y BlueZ seguía diciendo que no. Esto fue durante el trabajo en [D2Explorer](../huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- una herramienta para emparejar el Huawei Watch D2 en Linux -- y el error de emparejamiento lo bloqueaba todo.

Esto es lo que realmente ocurría y cómo lo arreglamos.

## El plan: un agente de emparejamiento interno en C++

La idea era limpia y autocontenida. Una única aplicación en C++ que gestiona todo el proceso de emparejamiento usando `sd-bus` (los enlaces de D-Bus para C/C++):

1.  Conectarse al D-Bus del sistema.
2.  Encontrar el adaptador Bluetooth (`org.bluez.Adapter1`).
3.  Implementar una clase C++ que exponga la interfaz `org.bluez.Agent1`.
4.  Registrar el agente con `org.bluez.AgentManager1` mediante `RegisterAgent` y `RequestDefaultAgent`. Empezamos con la capacidad `DisplayYesNo`, que luego simplificamos a `NoInputNoOutput`.
5.  Descubrir el dispositivo objetivo (`org.bluez.Device1`).
6.  Llamar a `Pair()` en la interfaz D-Bus del dispositivo.
7.  El agente interno gestiona las retrollamadas (`RequestConfirmation`, `RequestAuthorization`) automáticamente -- sin necesidad de interacción del usuario.
8.  Confiar en el dispositivo, establecer una conexión GATT, listo.

Un solo binario, sin dependencias externas. Ese era el plan.

## El muro: `org.bluez.Error.AuthenticationFailed`

Todo funcionaba hasta el paso 6. Adaptador encontrado, agente registrado (D-Bus lo confirmaba), dispositivo descubierto. Pero en el momento en que llamábamos a `Device1.Pair()` mediante `sd_bus_call_method` -- fallo instantáneo:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method threw exception: Failed to call method 'Pair':
    Input/output error - D-Bus error: org.bluez.Error.AuthenticationFailed (Authentication Failed)
```

Lo intentamos todo. Distintas capacidades de agente. Revisamos la configuración del vtable de `sd-bus`. Verificamos que las implementaciones de los métodos del agente devolvieran éxito sin demora. Usamos `busctl` y `gdbus` para monitorizar el tráfico de D-Bus -- las llamadas de registro parecían correctas. La llamada a `Pair()` simplemente seguía fallando.

**Callejón sin salida.**

## El avance: un agente Python externo

Para aislar el problema, sacamos al agente interno en C++ de la ecuación. Ejecutamos el `simple-agent.py` estándar de BlueZ como un proceso aparte *antes* de lanzar nuestra aplicación C++ (ahora despojada de su propio registro de agente):

```bash
# Terminal 1: Run the external agent
sudo python simple-agent.py NoInputNoOutput

# Terminal 2: Run our C++ app (no internal agent)
sudo ./build/huawei_pair_app <MAC> <QR_VALUE>
```

El resultado:

```
[BluetoothDevice] Calling Device1.Pair() method via D-Bus
[BluetoothDevice] Device1.Pair() method succeeded  <--- SUCCESS!
```

Consistente. Cada vez. El error `AuthenticationFailed` desapareció por completo.

Esto demostraba que el problema no estaba en `Pair()` en sí, ni en el dispositivo ni en la capacidad de emparejamiento de BlueZ. Tenía que ver específicamente con cómo nuestra aplicación C++, usando `sd-bus`, registraba e interactuaba como agente de emparejamiento. La misma operación lógica exacta -- registrar un agente `NoInputNoOutput` y llamar a `Pair()` -- funcionaba a la perfección cuando el agente corría como un proceso Python aparte.

**Esto funcionó.**

## ¿Por qué falló el agente interno?

Cuando me topé con esto por primera vez, solo tenía hipótesis. Desde entonces he encontrado evidencia documentada real de que se trata de un problema más amplio -- no solo de nuestro código.

### Regresión en BlueZ 5.70+

[BlueZ GitHub Issue #605](https://github.com/bluez/bluez/issues/605) documenta casos en los que los dispositivos se emparejan bien en BlueZ 5.50 pero fallan en versiones más nuevas con `auth failed with status 0x05`. Los registros HCI muestran `Status: PIN or Key Missing (0x06)` a pesar de las claves de enlace almacenadas. ¿La solución alternativa? Ejecutar el antiguo script `bluez-simple-agent.py`. ¿Te suena?

### La disponibilidad del agente es la causa raíz

[Bleak Issue #1434](https://github.com/hbldh/bleak/issues/1434) lo deja aún más claro: el emparejamiento solo funciona cuando `bluetoothctl` o GNOME Bluetooth están en ejecución, porque esas aplicaciones registran el agente de autenticación necesario. Sin un agente activo y *que funcione correctamente*, BlueZ devuelve internamente `No agent available for request type 2` -- que aflora como `AuthenticationFailed`.

La idea clave: no basta con *registrar* un agente. El agente tiene que responder a las retrollamadas de BlueZ de una forma que `bluetoothd` considere válida. Y algo en la manera en que `sd-bus` gestiona esto dentro del mismo proceso que inicia el emparejamiento no satisface a las versiones más nuevas de BlueZ.

### Puede que ni siquiera sea BlueZ

[Red Hat Bug #1905671](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) reveló que algunos errores `AuthenticationFailed` están relacionados con el kernel, no con BlueZ. El kernel 5.9 tenía problemas de emparejamiento que el 5.8.18 y el 5.10+ no tenían. El comentario del mantenedor merece ser citado: *"Bluetooth es complejo, podría ser el firmware, el kernel, bluez, el controlador, el dispositivo final o una combinación de todos ellos."*

### Desajuste de capacidad del agente

[BlueZ Issue #650](https://github.com/bluez/bluez/issues/650) documenta otra perspectiva: ciertos dispositivos (especialmente iOS) fallan al emparejarse con agentes `NoInputNoOutput` porque rebajan Secure Connections a emparejamiento Legacy, provocando errores `Insufficient Authentication (0x05)` en accesos posteriores a atributos. Esto es un problema de negociación del Security Manager Protocol (SMP), no un problema de registro del agente -- pero produce el mismo mensaje de error.

### Los culpables probables en nuestro caso

Dada la evidencia, las explicaciones más probables para el fallo del agente interno de `sd-bus`:

1.  **Sincronización** -- el registro de `sd-bus` o la gestión de métodos dentro de nuestro bucle de eventos no respondía en la ventana exacta que `bluetoothd` esperaba.
2.  **Sutilezas de `sd-bus` frente a `python-dbus`** -- diferencias en cómo estas bibliotecas interactúan con el demonio de D-Bus o gestionan el ciclo de vida de los objetos.
3.  **Requisitos más estrictos en BlueZ 5.66+** -- secuencias internas modificadas para la interacción con el agente que `sd-bus`, cuando se usa dentro de la misma aplicación que inicia el emparejamiento, no satisface.

## El segundo muro: las señales de D-Bus no son fiables

Superar `AuthenticationFailed` fue una gran victoria, pero no fue el final. Con el agente externo en su sitio, `Pair()` tenía éxito -- pero no podíamos *detectar* de forma fiable cuándo terminaba.

Dependíamos de las señales `PropertiesChanged` de D-Bus (a través de `sd-bus`) para saber cuándo `Paired`, `Trusted`, `Connected` y `ServicesResolved` pasaban a `true`. A veces las señales llegaban. A veces llegaban tarde. A veces no llegaban en absoluto.

Así que implementamos un **sondeo activo** -- una alternativa que consulta los valores de las propiedades directamente cuando las señales no aparecen:

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

Cada método de transición de estado (`isPaired()`, `isTrusted()`, `isConnected()`, `areServicesResolved()`) sigue el mismo patrón: comprobar primero el booleano atómico cacheado (actualizado por el manejador de señales si funciona), y luego recurrir a una llamada directa de propiedad `Get` de D-Bus.

Nada elegante. Pero necesario.

**Esto funcionó.**

## La solución completa

Aquí está la receta consolidada. Si estás construyendo un emparejamiento Bluetooth automatizado en Linux con BlueZ 5.66+ y te topas con `AuthenticationFailed`:

### Paso 1: Consigue simple-agent.py

Tómalo del [árbol de fuentes de BlueZ](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent).

### Paso 2: Ejecuta el agente externo

```bash
sudo python simple-agent.py NoInputNoOutput
```

Mantén esto en ejecución en una terminal aparte (o como un servicio en segundo plano).

### Paso 3: Quita el agente interno de tu aplicación

Elimina todas las llamadas `RegisterAgent` / `RequestDefaultAgent` de tu aplicación C++. Deja que el agente Python externo gestione las retrollamadas de autenticación.

### Paso 4: Añade el sondeo de propiedades de D-Bus

No dependas únicamente de las señales `PropertiesChanged`. Para cada propiedad crítica (`Paired`, `Trusted`, `Connected`, `ServicesResolved`), implementa el patrón cachear-y-luego-sondear mostrado arriba. Sondea periódicamente desde tu bucle principal.

### Paso 5: Verifica

1.  Confirma que el agente externo está en ejecución (`sudo python simple-agent.py NoInputNoOutput`).
2.  Ejecuta tu aplicación. `Pair()` debería tener éxito.
3.  Observa los registros de sondeo -- deberías ver consultas de propiedades de D-Bus para las transiciones de estado.
4.  Si `Pair()` sigue fallando, revisa tu versión de BlueZ (`bluetoothd --version`) y la versión del kernel -- el problema podría ser más profundo.

## Lo que esto te cuesta

No voy a fingir que esto es una solución limpia. No lo es:

1.  **Dependencia externa** -- tu aplicación ahora necesita un proceso Python aparte en ejecución.
2.  **Más complejidad** -- lógica de sondeo en el bucle principal, además de los manejadores de señales.
3.  **Menos autocontenido** -- el sueño de un único binario se esfumó.

Pero funciona. De forma fiable. Y cuando llevas dos días mirando fijamente `AuthenticationFailed`, "funciona" es lo que importa.

---

### Referencias

<a id="ref1"></a>1. [BlueZ GitHub Issue #55: Device characteristics and pairing timing](https://github.com/bluez/bluez/issues/55) -- *Fallos intermitentes de emparejamiento relacionados con la sincronización del agente.*<br>
<a id="ref2"></a>2. [Bluetooth Auto Pairing with NoInputNoOutput Agent Issues](https://forums.raspberrypi.com/viewtopic.php?t=324225) -- *Debate en foro sobre los retos del emparejamiento sin interfaz.*<br>
<a id="ref3"></a>3. [BlueZ Source: test/simple-agent](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent) -- *El agente Python estándar.*<br>
<a id="ref4"></a>4. [BlueZ GitHub Issue #605: Pairing regression in 5.70+](https://github.com/bluez/bluez/issues/605) -- *Fallos documentados con versiones más nuevas de BlueZ.*<br>
<a id="ref5"></a>5. [Bleak Issue #1434: Pairing requires active agent](https://github.com/hbldh/bleak/issues/1434) -- *Evidencia de que la disponibilidad del agente es la causa raíz.*<br>
<a id="ref6"></a>6. [Red Hat Bug #1905671: Kernel-related pairing failures](https://bugzilla.redhat.com/show_bug.cgi?id=1905671) -- *No siempre es BlueZ -- a veces es el kernel.*<br>
<a id="ref7"></a>7. [BlueZ GitHub Issue #650: Agent capability mismatch](https://github.com/bluez/bluez/issues/650) -- *Fallos de negociación SMP con NoInputNoOutput.*<br>
<a id="ref8"></a>8. [BlueZ Agent API Documentation](https://bluez.readthedocs.io/en/latest/agent-api/) -- *Referencia oficial de la interfaz del agente.*<br>
<a id="ref9"></a>9. [Kynetics: Pairing Agents in the BlueZ Stack](https://technotes.kynetics.com/2018/pairing_agents_bluez/) -- *Análisis técnico en profundidad del registro de agentes.*

---

### Publicaciones relacionadas

- [Huawei Watch D2 BLE Pairing: Protocol & Vendor Lock-In](/huawei-watch-d2-proprietary-protocol-vendor-lockin/) -- el proyecto que motivó esta investigación. El Watch D2 requiere un handshake propietario a nivel de aplicación por encima del emparejamiento BLE estándar, razón por la cual necesitábamos que el emparejamiento automatizado funcionara en primer lugar.
- [Fix Android Emulator Bluetooth on M1 Mac using Bumble & API 32](/m1-mac-android-emulator-bluetooth-passthrough-bumble/) -- otra batalla de integración Bluetooth, esta vez puenteando la radio física de un Mac hacia el emulador de Android.
