[conversational tone] Resuelve los errores de emparejamiento 'AuthenticationFailed' de BlueZ en 5.66+. Por qué fallan los agentes internos en C++/sd-bus, cómo lo arregla un agente Python externo y por qué necesitas sondear D-Bus.

TL;DR: Si recibes org.bluez.Error.AuthenticationFailed con un agente de emparejamiento personalizado en C++/sd-bus sobre BlueZ 5.66+, lo más probable es que el problema sea el registro de tu agente interno. Ejecuta un agente Python externo (simple-agent.py) como un proceso aparte, e implementa el sondeo de propiedades de D-Bus en lugar de depender de las señales PropertiesChanged. Los detalles y el código están más abajo.

Pasé dos días mirando fijamente org.bluez.Error.AuthenticationFailed antes de averiguar qué estaba pasando.

[matter-of-fact] El agente de emparejamiento estaba registrado. Las llamadas de D-Bus parecían correctas. busctl confirmaba que todo estaba en su sitio -- y BlueZ seguía diciendo que no. Esto fue durante el trabajo en D2Explorer -- una herramienta para emparejar el Huawei Watch D2 en Linux -- y el error de emparejamiento lo bloqueaba todo.

Esto es lo que realmente ocurría y cómo lo arreglamos.

[matter-of-fact] El plan: un agente de emparejamiento interno en C++

La idea era limpia y autocontenida. Una única aplicación en C++ que gestiona todo el proceso de emparejamiento usando sd-bus (los enlaces de D-Bus para C/C++):

Conectarse al D-Bus del sistema. Encontrar el adaptador Bluetooth (org.bluez.Adapter1). Implementar una clase C++ que exponga la interfaz org.bluez.Agent1. Registrar el agente con org.bluez.AgentManager1 mediante RegisterAgent y RequestDefaultAgent. Empezamos con la capacidad DisplayYesNo, que luego simplificamos a NoInputNoOutput. Descubrir el dispositivo objetivo (org.bluez.Device1). Llamar a Pair() en la interfaz D-Bus del dispositivo. El agente interno gestiona las retrollamadas (RequestConfirmation, RequestAuthorization) automáticamente -- sin necesidad de interacción del usuario. Confiar en el dispositivo, establecer una conexión GATT, listo.

Un solo binario, sin dependencias externas. Ese era el plan.

[deliberate] El muro: org.bluez.Error.AuthenticationFailed

[reflective] Todo funcionaba hasta el paso 6. Adaptador encontrado, agente registrado (D-Bus lo confirmaba), dispositivo descubierto. Pero en el momento en que llamábamos a Device1.Pair() mediante sd_bus_call_method -- fallo instantáneo:

Lo intentamos todo. Distintas capacidades de agente. Revisamos la configuración del vtable de sd-bus. Verificamos que las implementaciones de los métodos del agente devolvieran éxito sin demora. Usamos busctl y gdbus para monitorizar el tráfico de D-Bus -- las llamadas de registro parecían correctas. La llamada a Pair() simplemente seguía fallando.

Callejón sin salida.

[calm] El avance: un agente Python externo

Para aislar el problema, sacamos al agente interno en C++ de la ecuación. Ejecutamos el simple-agent.py estándar de BlueZ como un proceso aparte antes de lanzar nuestra aplicación C++ (ahora despojada de su propio registro de agente):

El resultado:

Consistente. Cada vez. El error AuthenticationFailed desapareció por completo.

[calm] Esto demostraba que el problema no estaba en Pair() en sí, ni en el dispositivo ni en la capacidad de emparejamiento de BlueZ. Tenía que ver específicamente con cómo nuestra aplicación C++, usando sd-bus, registraba e interactuaba como agente de emparejamiento. La misma operación lógica exacta -- registrar un agente NoInputNoOutput y llamar a Pair() -- funcionaba a la perfección cuando el agente corría como un proceso Python aparte.

Esto funcionó.

[reflective] ¿Por qué falló el agente interno?

Cuando me topé con esto por primera vez, solo tenía hipótesis. Desde entonces he encontrado evidencia documentada real de que se trata de un problema más amplio -- no solo de nuestro código.

[matter-of-fact] Regresión en BlueZ 5.70+

BlueZ GitHub Issue #605 documenta casos en los que los dispositivos se emparejan bien en BlueZ 5.50 pero fallan en versiones más nuevas con auth failed with status 0x05. Los registros HCI muestran Status: PIN or Key Missing (0x06) a pesar de las claves de enlace almacenadas. ¿La solución alternativa? Ejecutar el antiguo script bluez-simple-agent.py. ¿Te suena?

[deliberate] La disponibilidad del agente es la causa raíz

[deliberate] Bleak Issue #1434 lo deja aún más claro: el emparejamiento solo funciona cuando bluetoothctl o GNOME Bluetooth están en ejecución, porque esas aplicaciones registran el agente de autenticación necesario. Sin un agente activo y que funcione correctamente, BlueZ devuelve internamente No agent available for request type 2 -- que aflora como AuthenticationFailed.

La idea clave: no basta con registrar un agente. El agente tiene que responder a las retrollamadas de BlueZ de una forma que bluetoothd considere válida. Y algo en la manera en que sd-bus gestiona esto dentro del mismo proceso que inicia el emparejamiento no satisface a las versiones más nuevas de BlueZ.

[calm] Puede que ni siquiera sea BlueZ

Red Hat Bug #1905671 reveló que algunos errores AuthenticationFailed están relacionados con el kernel, no con BlueZ. El kernel 5.9 tenía problemas de emparejamiento que el 5.8.18 y el 5.10+ no tenían. El comentario del mantenedor merece ser citado: "Bluetooth es complejo, podría ser el firmware, el kernel, bluez, el controlador, el dispositivo final o una combinación de todos ellos."

[reflective] Desajuste de capacidad del agente

BlueZ Issue #650 documenta otra perspectiva: ciertos dispositivos (especialmente iOS) fallan al emparejarse con agentes NoInputNoOutput porque rebajan Secure Connections a emparejamiento Legacy, provocando errores Insufficient Authentication (0x05) en accesos posteriores a atributos. Esto es un problema de negociación del Security Manager Protocol (SMP), no un problema de registro del agente -- pero produce el mismo mensaje de error.

[matter-of-fact] Los culpables probables en nuestro caso

[matter-of-fact] Dada la evidencia, las explicaciones más probables para el fallo del agente interno de sd-bus:

Sincronización -- el registro de sd-bus o la gestión de métodos dentro de nuestro bucle de eventos no respondía en la ventana exacta que bluetoothd esperaba. Sutilezas de sd-bus frente a python-dbus -- diferencias en cómo estas bibliotecas interactúan con el demonio de D-Bus o gestionan el ciclo de vida de los objetos. Requisitos más estrictos en BlueZ 5.66+ -- secuencias internas modificadas para la interacción con el agente que sd-bus, cuando se usa dentro de la misma aplicación que inicia el emparejamiento, no satisface.

[deliberate] El segundo muro: las señales de D-Bus no son fiables

Superar AuthenticationFailed fue una gran victoria, pero no fue el final. Con el agente externo en su sitio, Pair() tenía éxito -- pero no podíamos detectar de forma fiable cuándo terminaba.

Dependíamos de las señales PropertiesChanged de D-Bus (a través de sd-bus) para saber cuándo Paired, Trusted, Connected y ServicesResolved pasaban a true. A veces las señales llegaban. A veces llegaban tarde. A veces no llegaban en absoluto.

Así que implementamos un sondeo activo -- una alternativa que consulta los valores de las propiedades directamente cuando las señales no aparecen:

Cada método de transición de estado (isPaired(), isTrusted(), isConnected(), areServicesResolved()) sigue el mismo patrón: comprobar primero el booleano atómico cacheado (actualizado por el manejador de señales si funciona), y luego recurrir a una llamada directa de propiedad Get de D-Bus.

[reflective] Nada elegante. Pero necesario.

Esto funcionó.

[calm] La solución completa

Aquí está la receta consolidada. Si estás construyendo un emparejamiento Bluetooth automatizado en Linux con BlueZ 5.66+ y te topas con AuthenticationFailed:

[reflective] Paso 1: Consigue simple-agent.py

Tómalo del árbol de fuentes de BlueZ.

[matter-of-fact] Paso 2: Ejecuta el agente externo

[calm] Mantén esto en ejecución en una terminal aparte (o como un servicio en segundo plano).

[deliberate] Paso 3: Quita el agente interno de tu aplicación

Elimina todas las llamadas RegisterAgent / RequestDefaultAgent de tu aplicación C++. Deja que el agente Python externo gestione las retrollamadas de autenticación.

[calm] Paso 4: Añade el sondeo de propiedades de D-Bus

No dependas únicamente de las señales PropertiesChanged. Para cada propiedad crítica (Paired, Trusted, Connected, ServicesResolved), implementa el patrón cachear-y-luego-sondear mostrado arriba. Sondea periódicamente desde tu bucle principal.

[reflective] Paso 5: Verifica

Confirma que el agente externo está en ejecución (sudo python simple-agent.py NoInputNoOutput). Ejecuta tu aplicación. Pair() debería tener éxito. Observa los registros de sondeo -- deberías ver consultas de propiedades de D-Bus para las transiciones de estado. Si Pair() sigue fallando, revisa tu versión de BlueZ (bluetoothd --version) y la versión del kernel -- el problema podría ser más profundo.

[matter-of-fact] Lo que esto te cuesta

No voy a fingir que esto es una solución limpia. No lo es:

Dependencia externa -- tu aplicación ahora necesita un proceso Python aparte en ejecución. Más complejidad -- lógica de sondeo en el bucle principal, además de los manejadores de señales. Menos autocontenido -- el sueño de un único binario se esfumó.

Pero funciona. De forma fiable. Y cuando llevas dos días mirando fijamente AuthenticationFailed, "funciona" es lo que importa.
