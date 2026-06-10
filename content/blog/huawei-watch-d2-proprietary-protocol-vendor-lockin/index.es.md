---
lang: "es"
translationOf: "huawei-watch-d2-proprietary-protocol-vendor-lockin"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "5f8c1e1999d0201a"
title: "Emparejamiento BLE del Huawei Watch D2: protocolo y caso de bloqueo de proveedor"
date: "2025-04-11"
description: "Análisis a fondo del protocolo propietario de emparejamiento BLE del Huawei Watch D2: un handshake no estándar de 11 pasos con HMAC-SHA256 y cifrado a medida. Cómo encierra a los usuarios y cómo la comunidad responde."
featuredImage: "./images/featured.jpg"
tags: ["Huawei", "WatchD2", "BluetoothLE", "BLE", "Emparejamiento", "Autenticacion", "IngenieriaInversa", "BloqueoDeProveedor", "ProtocoloPropietario", "D2Explorer", "SimpleBLE", "Crypto", "Gadgetbridge", "EU-DMA"]
imageCaption: "Un canario tranquilo posado en una jaula de latón ornamentada, a contraluz de una ventana."
---

> **Resumen:** El Huawei Watch D2 no usa el emparejamiento BLE estándar. En su lugar, exige un handshake propietario de 11 pasos que implica características GATT a medida, derivación de clave HMAC-SHA256 a partir de un código QR y cifrado a nivel de aplicación. Esto es bloqueo de proveedor por diseño: te obliga a usar la app Health de Huawei. La buena noticia: la comunidad lo ha sometido a ingeniería inversa. Gadgetbridge ya da soporte al Watch D2, y existen implementaciones de código abierto como `huawei-lpv2`. La DMA de la UE también empieza a presionar en sentido contrario.

Esperaba un emparejamiento Bluetooth estándar. Conectar, vincular, intercambiar datos: lo de siempre. Lo que me encontré en cambio fue un handshake criptográfico propietario que me costó semanas de ingeniería inversa.

Esto ocurrió mientras construía D2Explorer, mi proyecto para conectar el Huawei Watch D2 a Linux y macOS sin la app Health de Huawei. Después de [resolver los problemas del agente de emparejamiento de BlueZ](../bluez-pairing-python-agent-workaround-authentication-failed/) y migrar a la biblioteca multiplataforma SimpleBLE, pensé que la parte difícil había quedado atrás. La parte difícil aún no había empezado.

## Lo que esperarías: emparejamiento BLE estándar

Así es como se *supone* que funciona el emparejamiento de Bluetooth LE:

1. Escanea el dispositivo por el nombre que anuncia (p. ej., "HUAWEI WATCH D2-CA0").
2. Conéctate con `peripheral.connect()`.
3. El sistema operativo gestiona el emparejamiento/vinculación: una petición de PIN, Just Works, lo que exija el nivel de seguridad.
4. Una vez vinculado, interactúa con servicios GATT estándar o a medida.

El sistema operativo gestiona la seguridad. Tu aplicación se centra en los datos. Sencillo.

## Lo que ocurre en realidad: un handshake propietario de 11 pasos

Lo que el Watch D2 realmente exige es algo completamente distinto. La conexión BLE básica es solo la puerta. Detrás hay un protocolo de autenticación a nivel de aplicación que Huawei construyó sobre el BLE estándar: lo que la comunidad llama **Huawei Link Protocol v2** <small><a href="#ref1">[1]</a></small>.

Los mecanismos estándar de emparejamiento BLE quedan completamente al margen. Para autenticarte y acceder a cualquier dato con sentido, tienes que recorrer esta secuencia sobre características GATT a medida:

1.  **Connect** -- establece el enlace BLE básico.
2.  **Enable Notifications** -- suscríbete *inmediatamente* a las notificaciones de la característica `0000fe02-...`. Es crítico en cuanto a tiempos: si pierdes la ventana, el reloj te desconecta.
3.  **GetLinkParams** -- envía *inmediatamente* un comando a medida (Service ID `0x0001`, Command ID `0x0001`) a la característica de escritura `0000fe01-...`.
4.  **Receive Server Nonce** -- espera una notificación que contenga el desafío aleatorio del reloj.
5.  **Derive Secret Key** -- genera un nonce de cliente. Combina el nonce del servidor, el nonce del cliente y el **valor numérico del código QR del reloj**. Ejecuta HMAC-SHA256 (usando como clave los bytes del valor del código QR) para derivar una `secretKey_` compartida.
6.  **AuthRequest** -- envía de vuelta al reloj el nonce de cliente y un digest HMAC (usando la `secretKey_` derivada) (Service `0x0001`, Command `0x0002`).
7.  **Verify Server Token** -- recibe el token de autenticación del reloj. Verifícalo usando la `secretKey_` y los nonces intercambiados.
8.  **SetTime** -- envía la hora actual y el desfase de zona horaria, *cifrados* con la `secretKey_` (Service `0x0002`, Command `0x0003`).
9.  **QrToken** -- devuelve el valor del código QR, *cifrado* con la `secretKey_` (Service `0x0001`, Command `0x0004`).
10. **AuthResult** -- envía una confirmación final, *cifrada* con la `secretKey_` (Service `0x0001`, Command `0x0005`).
11. **Done** -- solo ahora la conexión queda autenticada.

Formatos de mensaje TLV a medida. Comprobaciones CRC. IDs de servicio y de comando. Cifrado a nivel de aplicación. Tiempos sensibles al milisegundo. Todo esto ocurre *por encima* de la pila BLE, invisible para las herramientas Bluetooth estándar.

El código QR en la pantalla del reloj es el secreto compartido. Sin él, no puedes derivar la clave. Sin la clave, no puedes autenticarte. Sin autenticarte, el reloj no te da nada.

## Por qué Huawei hace esto

Huawei podría presentarlo como seguridad reforzada. El efecto práctico es **bloqueo de proveedor**.

*   **Alta barrera de entrada** -- el protocolo no está documentado. Reimplementarlo exige hacer ingeniería inversa de la app Huawei Health (más de 13 000 clases, más de 64 000 métodos <small><a href="#ref2">[2]</a></small>) o analizar el tráfico BLE. Esto desincentiva activamente las apps de terceros.
*   **Sin interoperabilidad** -- las apps de fitness estándar no pueden conectarse. El reloj solo completa su handshake con software que conozca los pasos propietarios, sobre todo la propia app Health de Huawei.
*   **Control del ecosistema** -- se obliga a los usuarios a usar Huawei Health y sus servicios en la nube. Cambiar de dispositivo o de plataforma más adelante implica perder el historial de tus datos de salud.
*   **Menor capacidad de elección** -- ¿quieres usar una app de código abierto? ¿Quieres más control sobre la privacidad de tus datos de salud? Mala suerte, salvo que alguien haga primero ingeniería inversa del protocolo.

Y aquí está la cuestión: **esto no es exclusivo de Huawei**. El proyecto de investigación WatchWitch <small><a href="#ref3">[3]</a></small> documenta cómo todos los grandes fabricantes -- Apple, Samsung, Xiaomi -- usan protocolos BLE propietarios para imponer el bloqueo de ecosistema. El Apple Watch está "increíblemente acoplado al ecosistema del iPhone y de iCloud de Apple, usando protocolos propietarios no disponibles para terceros". Es un problema sistémico de la industria.

Pero la implementación de Huawei es especialmente agresiva. BLE *permite* servicios a medida, claro. Pero sustituir el mecanismo de autenticación fundamental por un guardián propietario es un juego completamente distinto.

## La ironía de la seguridad

La defensa obvia es "lo hacemos por seguridad". Examinémosla.

La investigación sobre la vulnerabilidad BlueDoor, de la Universidad de Tsinghua <small><a href="#ref4">[4]</a></small>, probó 16 dispositivos BLE, incluida la Honor Band 3 (mismo ecosistema Huawei), y logró **emparejamiento silencioso sin autorización del usuario** en la mayoría de ellos. El protocolo propietario no lo impidió.

Mientras tanto, el propio protocolo ha sido sometido a ingeniería inversa varias veces: por la comunidad de Gadgetbridge, por el proyecto `huawei-lpv2`, por los investigadores que presentaron en Easterhegg 2019 <small><a href="#ref2">[2]</a></small> y por mí para D2Explorer. Seguridad por oscuridad con fecha de caducidad.

La derivación de clave HMAC-SHA256 a partir del código QR es, de hecho, criptografía decente. Pero no es esa la cuestión. Podrías conseguir las mismas propiedades de seguridad usando BLE Secure Connections estándar con un método de emparejamiento fuera de banda (como NFC o un código QR), sin dejar fuera de juego a todas las aplicaciones de terceros en el proceso.

## La comunidad responde

La comunidad no ha aceptado esto en silencio.

### Gadgetbridge

[Gadgetbridge](https://gadgetbridge.org/), la app de Android de código abierto para dispositivos ponibles, ya da soporte al Huawei Watch D2 <small><a href="#ref5">[5]</a></small>. Puedes emparejar tu reloj sin la app Health de Huawei. Costó un esfuerzo considerable de ingeniería inversa (ver PR #2462 <small><a href="#ref6">[6]</a></small>), y hay limitaciones -- la función de ECG queda desactivada al emparejar con Gadgetbridge <small><a href="#ref7">[7]</a></small> --, pero funciona.

La implementación de autenticación en Gadgetbridge maneja la versión 3 de auth, calculando la clave de vinculación a partir del mensaje de emparejamiento (service `0x01`, command `0x0e`) y usándola para el descifrado. Se requiere un ID de cuenta de Huawei de 17 dígitos para la negociación de la clave de autenticación.

### huawei-lpv2

El proyecto [`huawei-lpv2`](https://github.com/zyv/huawei-lpv2) ofrece una implementación en Python puro del Link Protocol v2 de Huawei <small><a href="#ref8">[8]</a></small>. Tiene mantenimiento, varios forks y sirve de referencia para cualquiera que construya integraciones con ponibles de Huawei fuera del ecosistema oficial.

### D2Explorer

Mi propio proyecto D2Explorer siguió otro camino: construir una implementación en C++ usando SimpleBLE que funciona en Linux y macOS. El trabajo incluyó:

*   Implementar la serialización/deserialización TLV (`HuaweiProtocol`).
*   Construir constructores de mensajes precisos (`ProtocolMessageBuilder`).
*   Acertar con los pasos criptográficos: generación de nonces, HMAC-SHA256, cifrado XOR (`CryptoOperations`, `CryptoUtils`).
*   Gestionar transiciones de estado y tiempos estrictos (`HuaweiPairingProtocol`, `ProtocolStateManager`).
*   Depurar fallos causados por desajustes de tiempos a nivel de milisegundo y errores criptográficos sutiles.

D2Explorer existe *porque* el protocolo de Huawei lo hizo necesario. Es el rodeo que hace falta para tener funcionalidad básica fuera del jardín amurallado.

### AsteroidOS

[AsteroidOS 2.0](https://asteroidos.org/) se lanzó en febrero de 2026 como una actualización mayor del sistema operativo de código abierto para smartwatches basado en Linux <small><a href="#ref9">[9]</a></small>. Ahora da soporte a unos 30 dispositivos, incluidos el Huawei Watch y el Huawei Watch 2, con funciones como pantalla siempre activa y Tilt-to-Wake. Una alternativa de código abierto completa al firmware de Huawei.

## La marea regulatoria

La UE no se limita a observar. La Ley de Mercados Digitales (DMA) empieza a forzar el cambio <small><a href="#ref10">[10]</a></small>.

En diciembre de 2025, Apple lanzó iOS 26.3 con un emparejamiento estilo AirPods para dispositivos de terceros -- incluidos los smartwatches de Huawei -- precisamente para cumplir con los requisitos de la DMA <small><a href="#ref11">[11]</a></small>. La sincronización en segundo plano entre relojes Huawei y iPhones ya está operativa en Europa.

La DMA obliga a los guardianes de acceso a ofrecer interoperabilidad para los dispositivos conectados. Esto apunta directamente al tipo de bloqueo BLE propietario que Huawei (y Apple, y todos los demás) viene practicando. Se espera el despliegue completo de estas funciones de interoperabilidad a lo largo de 2026.

Es algo significativo. Por primera vez hay presión regulatoria para estandarizar lo que los fabricantes han mantenido deliberadamente como propietario. La comunidad técnica puede aplicar ingeniería inversa a los protocolos uno a uno, pero la regulación puede cambiar la estructura de incentivos de toda la industria.

## Qué significa esto

El protocolo de emparejamiento del Huawei Watch D2 es un caso de estudio de cómo los protocolos a medida sobre transportes estándar pueden imponer el bloqueo de proveedor. Las capas de criptografía propietaria, los formatos de mensaje a medida y los handshakes sensibles al tiempo existen no porque el BLE estándar no pueda manejar la autenticación -- sí puede --, sino porque los protocolos propietarios mantienen a los usuarios dentro del ecosistema.

El panorama está cambiando, eso sí. Gadgetbridge te ofrece una alternativa ahora mismo. La DMA de la UE está forzando la interoperabilidad a nivel regulatorio. Y proyectos de código abierto como `huawei-lpv2`, D2Explorer y AsteroidOS demuestran que la comunidad hará ingeniería inversa de lo que los fabricantes intentan blindar.

Construir D2Explorer tuvo menos que ver con Bluetooth y más con trabajo detectivesco de criptografía. Subraya algo que no debería necesitar subrayado: deberías poder acceder a tus propios datos de salud con el software que elijas.

---

### Referencias

<a id="ref1"></a>1. [huawei-lpv2: Pure Python implementation of Huawei BLE Link Protocol v2](https://github.com/zyv/huawei-lpv2) -- *Implementación de referencia de código abierto del protocolo.*<br>
<a id="ref2"></a>2. [All Your Fitness Data Belongs to You: Reverse Engineering the Huawei Health Android App](https://media.ccc.de/v/eh19-186-all-your-fitness-data-belongs-to-you-reverse-engineering-the-huawei-health-android-app) -- *Charla de la conferencia Easterhegg 2019 que documenta el esfuerzo de ingeniería inversa. [Diapositivas (PDF)](https://www.sba-research.org/wp-content/uploads/2019/04/easterhegg19.pdf).*<br>
<a id="ref3"></a>3. [WatchWitch: Academic Research on Smartwatch Interoperability](https://arxiv.org/html/2507.07210v1) -- *Documenta cómo todos los grandes fabricantes usan protocolos propietarios para el bloqueo de ecosistema.*<br>
<a id="ref4"></a>4. [BlueDoor: Breaking the Secure Information Flow via BLE Vulnerability (Tsinghua University)](https://tns.thss.tsinghua.edu.cn/~jiliang/publications/MOBISYS2020_BlueDoor.pdf) -- *Encontró vulnerabilidades de emparejamiento silencioso en 16 dispositivos BLE, incluida la Honor Band 3.*<br>
<a id="ref5"></a>5. [Gadgetbridge: Huawei/Honor Device Support](https://gadgetbridge.org/basics/topics/huawei-honor/) -- *Página de soporte oficial para ponibles de Huawei y Honor.*<br>
<a id="ref6"></a>6. [Gadgetbridge PR #2462: Initial Huawei/Honor Support](https://codeberg.org/Freeyourgadget/Gadgetbridge/pulls/2462) -- *El pull request que añadió soporte para dispositivos Huawei a Gadgetbridge.*<br>
<a id="ref7"></a>7. [Gadgetbridge Issue #4918: ECG Disabled with Gadgetbridge](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/4918) -- *Limitación conocida al usar Gadgetbridge en lugar de Huawei Health.*<br>
<a id="ref8"></a>8. [Gadgetbridge: Huawei/Honor Pairing Guide](https://gadgetbridge.org/basics/pairing/huawei-honor-pairing/) -- *Instrucciones de emparejamiento paso a paso para dispositivos Huawei.*<br>
<a id="ref9"></a>9. [AsteroidOS 2.0 Release](https://www.cnx-software.com/2026/02/18/asteroidos-2-0-open-source-smartwatch-os-released-now-supports-around-30-devices/) -- *Sistema operativo de código abierto para smartwatches que ahora da soporte a unos 30 dispositivos, incluidos relojes Huawei.*<br>
<a id="ref10"></a>10. [EU Digital Markets Act: Interoperability Requirements](https://digital-markets-act.ec.europa.eu/questions-and-answers/interoperability_en) -- *Disposiciones de la DMA que obligan a la interoperabilidad de los dispositivos conectados.*<br>
<a id="ref11"></a>11. [iOS 26.3 DMA Features: Third-Party Smartwatch Pairing](https://www.macrumors.com/2025/12/22/ios-26-3-dma-airpods-pairing/) -- *Cumplimiento por parte de Apple de los mandatos de interoperabilidad de la UE para dispositivos ponibles.*

---

### Publicaciones relacionadas

- [BlueZ Pairing Fix: External Python Agent & D-Bus Polling](/bluez-pairing-python-agent-workaround-authentication-failed/) -- el precursor de esta investigación. Antes de poder abordar el protocolo propietario de Huawei, tuvimos que arreglar los errores `AuthenticationFailed` de BlueZ con el emparejamiento BLE estándar.
- [Fix Android Emulator Bluetooth on M1 Mac using Bumble & API 32](/m1-mac-android-emulator-bluetooth-passthrough-bumble/) -- otra batalla de integración BLE, esta vez para puentear la radio Bluetooth física de un Mac dentro del emulador de Android.
