[conversational tone] Adáptate a Shopware 6.5/6.6: cambios clave de clases/namespaces, Symfony 6, Stock API, Bootstrap 5, correcciones de CSRF y la actualización data-off-canvas-cart del Offcanvas Cart.

Shopware 6.5 y 6.6 introdujeron varios cambios significativos en clases, namespaces, atributos de datos y mecanismos de seguridad que los desarrolladores deben tener en cuenta al actualizar o mantener sus proyectos Shopware. Este artículo ofrece una visión general concisa pero completa de estos cambios, junto con observaciones sobre su impacto y sobre cómo adaptar tu código en consecuencia.

[matter-of-fact] Introducción

[reflective] A medida que Shopware evoluciona, las actualizaciones suelen traer mejoras, optimizaciones y nuevas funciones. Sin embargo, también pueden introducir cambios que afecten a bases de código existentes. Entender estos cambios es fundamental para garantizar una transición fluida y aprovechar las nuevas capacidades de forma eficaz.

Este artículo se centra en las siguientes áreas clave:

Migración de namespace de Elasticsearch Actualizaciones en la gestión de rutas de medios Cambios de métodos en AvailableCombinationLoader Actualización del framework Symfony a la versión 6 Actualizaciones en la gestión de stock Actualización de Bootstrap en el Storefront Cambios en el atributo de datos del Offcanvas Cart Cambios en la protección CSRF Mejoras en el Rule Builder

Veamos cada uno de estos cambios en detalle.

[deliberate] 1. Migración de namespace de Elasticsearch

[calm] Resumen del cambio

Namespace anterior: ONGR\ElasticsearchDSL Nuevo namespace: OpenSearchDSL

[reflective] Impacto

Todas las clases y métodos que interactúan con Elasticsearch deben actualizar sus namespaces para reflejar la migración de ONGR\ElasticsearchDSL a OpenSearchDSL.

[matter-of-fact] Acción requerida

Actualiza las sentencias de importación y las referencias en tu código para usar el nuevo namespace.

[deliberate] Ejemplo

[calm] Observaciones

Este cambio se alinea con el giro más amplio de la industria hacia OpenSearch, un fork de Elasticsearch impulsado por la comunidad. Actualizar al nuevo namespace garantiza la compatibilidad con los desarrollos y el soporte en curso.

[reflective] 2. Gestión de rutas de medios

[matter-of-fact] Resumen del cambio

Las rutas de medios ahora se almacenan directamente en la base de datos en lugar de generarse de forma dinámica.

[deliberate] Impacto

Las clases y servicios que antes dependían de la generación dinámica de rutas deben acceder a las rutas de medios desde la base de datos.

[calm] Acción requerida

Ajusta tu código para usar el método getPath() de la MediaEntity.

[reflective] Ejemplo

[matter-of-fact] Observaciones

Almacenar las rutas de medios en la base de datos mejora el rendimiento al reducir la sobrecarga de cálculo. También aporta más consistencia y fiabilidad en la gestión de medios.

[deliberate] 3. Cambio de método en AvailableCombinationLoader

[calm] Resumen del cambio

El método load() en AbstractAvailableCombinationLoader se ha reemplazado por loadCombinations().

[reflective] Impacto

[reflective] Cualquier clase personalizada que extienda AbstractAvailableCombinationLoader debe implementar el nuevo método loadCombinations() en lugar del antiguo método load().

[matter-of-fact] Acción requerida

Renombra o refactoriza las implementaciones de tus métodos para alinearlas con el nuevo nombre y la nueva firma del método.

[deliberate] Ejemplo

[calm] Observaciones

Este cambio mejora la claridad al ofrecer un nombre de método más descriptivo. También puede implicar parámetros o tipos de retorno adicionales, por lo que es esencial revisar la firma del método.

[reflective] 4. Actualización del framework Symfony a la versión 6

[matter-of-fact] Resumen del cambio

Shopware ha actualizado sus componentes de Symfony a la versión 6.

[deliberate] Impacto

La actualización introduce algunos cambios incompatibles debido a funciones obsoletas y a modificaciones en las firmas de los métodos. El código personalizado que dependa de funciones antiguas de Symfony puede romperse o generar advertencias.

[calm] Acción requerida

Revisa tu código en busca de funciones obsoletas de Symfony y actualízalas para que sean compatibles con Symfony 6.

[reflective] Observaciones

[deliberate] Mantenerse al día con la última versión de Symfony garantiza mejor rendimiento, mayor seguridad y acceso a nuevas funciones. Sin embargo, exige una revisión y unas pruebas de código cuidadosas para asegurar la compatibilidad.

[matter-of-fact] 5. Actualizaciones en la gestión de stock

[deliberate] Resumen del cambio

Se ha introducido una nueva Stock API, disponible tras el feature flag STOCK_HANDLING.

[calm] Impacto

Las clases y servicios relacionados con la gestión de stock pueden necesitar adaptarse a la nueva estructura de la API, sobre todo si interactúan directamente con los datos de stock.

[reflective] Acción requerida

[matter-of-fact] Usa los nuevos métodos de gestión de stock que proporciona la API y asegúrate de que toda la lógica relacionada con el stock se ajuste a la estructura actualizada.

[matter-of-fact] Ejemplo

[deliberate] Observaciones

La nueva Stock API ofrece una forma más robusta y flexible de gestionar el stock, lo que puede simplificar las personalizaciones y las integraciones con sistemas externos.

[calm] 6. Actualización de Bootstrap en el Storefront

[reflective] Resumen del cambio

El Storefront se ha actualizado de Bootstrap 4 a Bootstrap 5, y se ha eliminado jQuery como dependencia.

[matter-of-fact] Impacto

El código JavaScript personalizado y las plantillas que dependen de jQuery o de componentes de Bootstrap 4 deben refactorizarse para alinearse con Bootstrap 5 y usar JavaScript nativo cuando sea necesario.

[deliberate] Acción requerida

Sustituye el uso de jQuery por JavaScript nativo o por utilidades de Bootstrap 5. Actualiza las clases y los componentes de Bootstrap para que coincidan con la nomenclatura y la estructura de Bootstrap 5.

[calm] Observaciones

Bootstrap 5 aporta mejoras de rendimiento, menos dependencias y componentes modernizados. Aunque actualizar puede llevar tiempo, ofrece beneficios a largo plazo en términos de mantenibilidad y experiencia de usuario.

[reflective] 7. Cambios en el atributo de datos del Offcanvas Cart (Shopware 6.6)

[matter-of-fact] Resumen del cambio

En Shopware 6.6 se ha producido un cambio sutil pero significativo en el atributo de datos que se usa para activar la funcionalidad del offcanvas cart.

Atributo de datos anterior: data-offcanvas-cart Nuevo atributo de datos: data-off-canvas-cart

[deliberate] Impacto

Las plantillas o temas personalizados que usan el atributo data-offcanvas-cart sin guiones pueden encontrarse con que el offcanvas cart ya no funciona como se espera, porque el listener de JavaScript en Shopware 6.6 busca la versión con guiones.

[calm] Acción requerida

Actualiza el atributo data-offcanvas-cart en tus plantillas a data-off-canvas-cart.

[reflective] Ejemplo

[matter-of-fact] Observaciones

Este cambio no está bien documentado en las notas de la versión oficial de Shopware 6.6, pero es crucial para el correcto funcionamiento del offcanvas cart. El JavaScript responsable de inicializar la funcionalidad del carrito depende del atributo data-off-canvas-cart, y cualquier desviación puede impedir que el carrito funcione.

[deliberate] Notas adicionales

La consistencia es clave: asegúrate de que todas las instancias en las que se usa el atributo del offcanvas cart estén actualizadas. Prueba a fondo: después de hacer el cambio, prueba la funcionalidad del carrito para confirmar que funciona como se espera. Busca cambios similares: otros atributos de datos o listeners de eventos pueden haber sufrido actualizaciones parecidas; revisa tus plantillas personalizadas en consecuencia.

[calm] 8. Cambios en la protección CSRF

[reflective] Resumen del cambio

[matter-of-fact] Shopware 6.5 y las versiones posteriores han eliminado la gestión explícita del token CSRF en las plantillas, pasando a una estrategia de cookies SameSite para la protección CSRF.

[matter-of-fact] Impacto

Las plantillas y los formularios que antes incluían tokens CSRF mediante la función sw_csrf encontrarán errores porque esta función ya no existe.

[deliberate] Acción requerida

Elimina las funciones de token CSRF: quita el uso de {{ sw_csrf('route_name') }} de tus plantillas. Confía en las cookies SameSite: apóyate en la estrategia integrada de cookies SameSite para la protección CSRF, que no requiere tokens explícitos en los formularios. Ajusta los atributos de los formularios: asegúrate de que los formularios y las peticiones AJAX estén configurados correctamente para funcionar con el nuevo mecanismo de protección CSRF.

[calm] Ejemplo

[reflective] Observaciones

[reflective] Resolución de errores: eliminar la función sw_csrf resuelve el error "Unknown 'sw_csrf' function". Mantenimiento de la seguridad: la estrategia de cookies SameSite sigue protegiendo frente a ataques CSRF sin tokens adicionales. Plantillas simplificadas: los formularios quedan más limpios y algo más simples al no necesitar tokens CSRF.

[matter-of-fact] Notas adicionales

Las pruebas son cruciales: después de hacer estos cambios, prueba a fondo el envío de formularios para asegurarte de que funcionan correctamente. Entiende el nuevo mecanismo: familiarízate con el funcionamiento de la estrategia de cookies SameSite para mantener una aplicación segura. Actualiza la documentación: asegúrate de que toda la documentación interna refleje este cambio para evitar confusiones futuras.

[deliberate] 9. Cómo resolver problemas con el Offcanvas Cart

[calm] Resumen del escenario

Después de actualizar las plantillas y eliminar la función sw_csrf, los desarrolladores aún pueden encontrarse con que, al hacer clic en el botón "Add to Cart", se abre el offcanvas cart, pero aparece vacío.

[reflective] Causa raíz

[calm] El offcanvas cart puede no mostrar los artículos añadidos debido a parámetros ausentes o incorrectos en el envío del formulario, concretamente la falta del campo de entrada redirectTo.

[matter-of-fact] Acción requerida

Añade el parámetro redirectTo: incluye un campo de entrada oculto llamado redirectTo con el valor frontend.cart.offcanvas en tus formularios de añadir al carrito. Asegura los atributos de datos correctos: verifica que todos los atributos de datos necesarios estén presentes y correctamente nombrados.

[deliberate] Ejemplo

[calm] Observaciones

Restauración de la funcionalidad: añadir el parámetro redirectTo le indica a Shopware que cargue el offcanvas cart al agregar un artículo, lo que garantiza que el carrito se muestre correctamente. Atención al detalle: pequeñas omisiones como la falta de campos de entrada pueden provocar problemas de funcionalidad importantes, lo que subraya la importancia de una revisión de código minuciosa.

[reflective] Notas adicionales

[deliberate] Consistencia en los atributos de datos: comprueba bien que los atributos de datos como data-product-id estén correctamente configurados. Revisa las dependencias de JavaScript: asegúrate de que cualquier plugin o componente de JavaScript relacionado con el carrito se cargue e inicialice correctamente. Limpia la caché: después de hacer cambios, limpia la caché de Shopware y la de tu navegador para evitar que archivos desactualizados causen problemas.

[matter-of-fact] 10. Mejoras en el Rule Builder

[deliberate] Resumen del cambio

La API del Rule Builder se ha ampliado para admitir lógica condicional más compleja.

[calm] Impacto

Las reglas y condiciones personalizadas pueden necesitar ajustes para alinearse con las nuevas interfaces o métodos que ofrece el Rule Builder mejorado.

[reflective] Acción requerida

[matter-of-fact] Revisa la documentación del Rule Builder y actualiza las implementaciones de reglas personalizadas para garantizar la compatibilidad.

[matter-of-fact] Observaciones

Las capacidades de reglas mejoradas permiten una segmentación y una personalización más precisas dentro de Shopware. Aprovechar estas nuevas funciones puede traducirse en una mayor adaptabilidad y en experiencias personalizadas para los usuarios finales.

[deliberate] Conclusión

Shopware 6.5 y 6.6 introducen varios cambios importantes en clases, namespaces, atributos de datos y mecanismos de seguridad que los desarrolladores deben abordar para mantener la compatibilidad y aprovechar las nuevas funciones. Actualizar tu base de código requiere una revisión y unas pruebas cuidadosas, pero ofrece oportunidades para mejorar el rendimiento, la seguridad y la funcionalidad.

[calm] Recomendaciones

Planifica con antelación: antes de actualizar, revisa las notas de versión oficiales de Shopware y las guías de actualización para obtener información completa. Prueba a fondo: implementa los cambios en un entorno de staging y realiza pruebas exhaustivas para identificar y corregir problemas. Apóyate en la documentación: utiliza la documentación de Shopware y los foros de la comunidad como guía sobre cambios concretos. Mantente informado: sigue de cerca las futuras actualizaciones para anticipar los próximos cambios y prepararte en consecuencia.

[reflective] Observaciones adicionales

Atención al detalle: pequeños cambios, como los guiones en los atributos de datos o la eliminación de funciones, pueden tener impactos significativos. Revisa siempre con cuidado las actualizaciones de plantillas. Apoyo de la comunidad: la comunidad de Shopware es activa y colaborativa. Interactuar con otros desarrolladores puede aportar ideas y soluciones a los desafíos habituales. Buenas prácticas: adoptar buenas prácticas actualizadas, como usar JavaScript nativo en lugar de jQuery y apoyarse en estrategias de seguridad modernas, conduce a un código más limpio y eficiente. Vigila las deprecaciones: prestar atención a los avisos de deprecación y prepararse para futuras eliminaciones puede minimizar las interrupciones durante las actualizaciones.

Al entender y abordar los cambios de clases, namespaces, atributos de datos y seguridad en Shopware 6.5 y 6.6, los desarrolladores pueden garantizar una transición fluida y seguir construyendo soluciones de comercio electrónico robustas y preparadas para el futuro.
