[conversational tone] Arregla el passthrough de Bluetooth para el emulador de Android en Macs M1. La guía detalla la configuración funcional con Bumble usando Netsim, endpoints explícitos y AVDs con API 32.

Si eres desarrollador y trabajas con Bluetooth en un Mac M1/M2/M3 e intentas que la radio Bluetooth de tu máquina anfitriona funcione dentro del emulador de Android, probablemente hayas sentido algo de dolor. Lo que parece que debería ser sencillo a menudo se convierte en una frustrante madriguera de conexiones fallidas, errores crípticos y callejones sin salida en la documentación. Hace poco pasé exactamente por esta batalla y, tras chocar contra varios muros, por fin encontré una combinación usando el stack de Bluetooth en Python Bumble que realmente funciona.

Esto no es otra guía teórica más; es el relato paso a paso de lo que falló y, más importante aún, de lo que funcionó para conectar el Bluetooth de mi Mac Pro M1 (a través de un dongle USB externo en mi caso, aunque el principio podría aplicarse a las radios internas) con un emulador de Android 12L (API 32).

[matter-of-fact] El objetivo: Bluetooth real en el emulador

El objetivo era sencillo: que el emulador de Android usara el controlador Bluetooth físico de mi Mac en lugar de su propio controlador virtual y limitado. Esto es crucial para probar apps que interactúan con dispositivos Bluetooth del mundo real.

[deliberate] La herramienta: aquí entra Bumble

Bumble es un potente stack de Bluetooth en Python. Su herramienta clave para esta tarea es bumble-hci-bridge, que puede conectarse a una HCI (Host Controller Interface) física por un lado y exponerla mediante varios transportes (como TCP o gRPC) por el otro.

[calm] Intento n.º 1: el método del socket QEMU (el primer intento lógico)

Basándome en conocimientos generales de QEMU y en algunas guías más antiguas, el primer enfoque consistía en usar flags del emulador para conectar directamente un puerto serie virtual (respaldado por un socket TCP) con el puente HCI.

Iniciar el puente (modo servidor TCP): Conectamos Bumble al dongle físico (que, sorprendentemente, funcionó mejor con usb:0 que con su VID:PID específico usb:0b05:17cb en mi máquina, ¡cosas del M1!) y lo pusimos a la escucha en un puerto TCP.

[calm] Lanzar el emulador con flags de QEMU: Modificamos el script de lanzamiento del emulador (apuntando inicialmente a la API 34) para añadir flags -qemu que dirigían un puerto serie virtual (virtserialport) a un dispositivo de carácter (chardev) respaldado por un socket TCP que se conectaba al puente.

¿El resultado? Éxito parcial, fracaso final: Usando lsof, podíamos ver que el proceso QEMU del emulador sí establecía una conexión TCP con el puente Bumble. Sin embargo, el stack de Bluetooth de Android dentro del emulador nunca llegó a enviar ningún comando HCI por ella. Activar y desactivar el Bluetooth en los ajustes de Android no hacía nada. Los logs del puente permanecían en silencio tras la conexión inicial. Callejón sin salida.

[reflective] Intento n.º 2: el puente Netsim por defecto (siguiendo la documentación de Bumble)

La documentación de Bumble menciona la posibilidad de hacer de puente con la interfaz gRPC "Netsim" del emulador. Netsim (y su núcleo, Root Canal) es el sistema de controlador Bluetooth virtual más reciente del emulador.

Iniciar el puente (modo controlador Netsim): Configuramos el puente para que actuara como controlador Netsim, a la escucha en el puerto gRPC por defecto (8554), y conectándose al dongle físico.

Lanzar el emulador (backend por defecto): Revertimos el script de lanzamiento (todavía probando con la API 34) para eliminar los flags -qemu y añadimos -packet-streamer-endpoint default para asegurarnos de que intentara usar el backend Netsim.

¿El resultado? Sin conexión: Esta vez el emulador se lanzó, pero el puente Bumble no mostró señales de ninguna conexión gRPC entrante desde el emulador. Revisar los logs del emulador no reveló errores de conexión evidentes, pero el Bluetooth seguía inutilizable. Otro callejón sin salida.

[matter-of-fact] Intento n.º 3: bajar de versión de API + endpoint Netsim explícito (¡el ganador!)

Las búsquedas en la web revelaron informes generales de inestabilidad del Bluetooth en los emuladores con API 33/34 y posibles problemas con la forma en que el emulador descubre o se conecta al backend Netsim, sobre todo cuando una herramienta externa intenta interceptarlo. La clave parecía estar en indicar explícitamente al emulador dónde se encontraba el servidor gRPC de Netsim y en probar con un nivel de API más antiguo.

Iniciar el puente (modo controlador Netsim, puerto explícito, usb:0): Igual que en el intento n.º 2, asegurándonos de que escuchara en un puerto conocido (8554) y de que se conectara al dongle físico usando el índice (usb:0) que funcionaba de forma fiable.

Modificar y lanzar el emulador (API 32, endpoint explícito): Creamos un AVD de API 32 (Android 12L) con los Servicios de Google Play (gplay_32_arm). Modificamos el script de lanzamiento para apuntar a este AVD y, lo más importante, cambiamos el flag -packet-streamer-endpoint de default a la dirección exacta de nuestro puente.

¿El resultado? ¡Éxito! ¡Esta vez funcionó! La terminal de bumble-hci-bridge empezó a mostrar logs de conexión gRPC del emulador poco después del lanzamiento. Una vez que el emulador arrancó, activar el Bluetooth en los Ajustes de Android produjo una avalancha de comandos HCI (Reset, Read Version, Set Event Mask, etc.) que aparecían en la terminal del puente. ¡El escaneo de dispositivos dentro del emulador usó correctamente la radio Bluetooth física del Mac a través del dongle ASUS!

[deliberate] La receta ganadora: paso a paso

Este es el procedimiento exacto que funcionó en mi Mac Pro M1 con un dongle USB externo ASUS USB-BT500:

[matter-of-fact] Instala Bumble:

(Opcional pero recomendado) Desactiva la gestión nativa de USB BT de macOS: Ejecútalo una vez y reinicia.

Inicia el puente Netsim de Bumble: Abre una terminal y ejecuta (déjala corriendo):

(Verifica que muestre >>> connected dos veces).

Prepara el script de lanzamiento del emulador: Guarda el script completo que aparece a continuación como launch_gapps_avd_api32.sh (o similar). Asegúrate de que apunte a un AVD de API 32 (creará uno llamado gplay_32_arm si no existe) y de que use explícitamente -packet-streamer-endpoint localhost:8554. Hazlo ejecutable (chmod +x launch_gapps_avd_api32.sh).

Ejecuta el script de lanzamiento: Abre una nueva terminal y ejecuta el script:

Verifica: Una vez que el emulador arranque: Revisa la terminal de bumble-hci-bridge en busca de tráfico gRPC y HCI. Ve a Ajustes de Android -> Bluetooth y actívalo. Prueba a escanear o a emparejar.

[calm] El script de lanzamiento exitoso (API 32, endpoint Netsim explícito)

[reflective] Conclusiones clave para Mac M1 + emulador + Bumble

El nivel de API importa: Lo más nuevo no siempre es mejor para la compatibilidad con el emulador, sobre todo con funciones complejas como el puente de Bluetooth. En mis pruebas, la API 32 resultó más estable para esto que la API 34. Endpoints explícitos: No confíes en -packet-streamer-endpoint default cuando uses un puente externo como el modo controlador Netsim de Bumble. Apunta el emulador explícitamente a localhost:, donde está a la escucha tu puente. Puente Netsim > socket QEMU: El modo de puente android-netsim parece tener más probabilidades de funcionar con los emuladores modernos que el método de más bajo nivel -qemu -chardev socket, aunque el método del socket sí puede establecer un enlace TCP. usb:0 frente a VID:PID: En macOS/M1, identificar dispositivos USB puede ser caprichoso. Si especificar el VID:PID exacto falla de forma inesperada, prueba a usar el índice usb:0 (suponiendo que sea el dispositivo principal/deseado). La perseverancia da frutos: Esto llevó varios intentos, combinando ideas de la documentación, búsquedas en la web y pruebas iterativas. ¡No te rindas a la primera!

Espero que compartir esta configuración concreta y funcional ahorre a otros desarrolladores horas de frustración. ¡Feliz programación (y feliz puente)!
