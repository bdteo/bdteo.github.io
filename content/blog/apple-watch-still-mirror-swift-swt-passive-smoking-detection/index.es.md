---
lang: "es"
translationOf: "apple-watch-still-mirror-swift-swt-passive-smoking-detection"
translationUpdatedAt: "2026-06-10"
translationSourceHash: "0342ad4740de75ec"
title: "Detección de tabaquismo con Apple Watch: construir Still Mirror (Swift, SWT)"
date: "2025-05-13"
slug: "apple-watch-still-mirror-swift-swt-passive-smoking-detection"
author: "Boris D. Teoharov"
description: "Mi recorrido construyendo 'Still Mirror', una app para Apple Watch que detecta de forma pasiva el consumo de tabaco o vapeo usando HealthKit, Swift, Xcode y la Transformada Wavelet Estacionaria (SWT)."
tags: ["Apple Watch", "HealthKit", "Swift", "Xcode", "Transformada Wavelet Estacionaria", "SWT", "IA", "Procesamiento de señales", "Wearables", "Tecnología de salud", "Monitoreo pasivo", "Desarrollo iOS"]
featuredImage: "./images/featured-still-mirror.jpg"
imageCaption: "Arte conceptual: un Apple Watch mostrando sutiles patrones de ondas fisiológicas que se transforman en una discreta notificación de evento, sobre un fondo de redes neuronales y gráficos de wavelets."
---

La idea de comprender de verdad nuestros hábitos, sobre todo los que realizamos casi de forma inconsciente, siempre me ha fascinado. ¿Y si nuestros wearables pudieran ofrecer un espejo suave, sin juicios, de esos patrones? Esta pregunta dio origen al proyecto "Still Mirror": un intento de detectar de forma pasiva los episodios de tabaquismo o vapeo a partir de los ricos datos fisiológicos de un Apple Watch, sin requerir ninguna entrada manual del usuario. No se trata de construir otra app para dejar de fumar, sino de una herramienta para la conciencia pura y sin adornos.

## El reto: un susurro en una sinfonía de ruido

El reto central es inmenso: ¿cómo distinguir la sutil firma fisiológica de un episodio de tabaquismo o vapeo entre la infinidad de otras actividades cotidianas y respuestas corporales? El estrés, una caminata enérgica, un ruido sobresaltante o incluso una taza de café pueden provocar cambios transitorios en la frecuencia cardíaca (FC) y en la variabilidad de la frecuencia cardíaca (VFC). La señal que buscamos suele ser un susurro en una sinfonía de ruido fisiológico.

Pero para aislar de verdad estos episodios fugaces, necesitaba una técnica de procesamiento de señales más sofisticada.

<figure>
  <img src="./images/apple-watch-swift-xcode.jpg" alt="Estación de trabajo de un desarrollador con Xcode mostrando código Swift para una app de Apple Watch, con gráficos de datos de HealthKit al fondo.">
  <figcaption>Fig 1. – El ecosistema de desarrollo de Apple: Xcode, Swift y HealthKit son centrales para dar vida a 'Still Mirror' en el Apple Watch.</figcaption>
</figure>

## Elegir las herramientas: ecosistema Apple y Swift

Para un proyecto orientado al Apple Watch, la elección del ecosistema es clara:
*   **Xcode y Swift:** el entorno de desarrollo nativo para las plataformas de Apple. Embarcarme en esto significó adentrarme más en Swift, un lenguaje que me parece elegante y potente, y aprender a navegar los entresijos de Xcode.
*   **HealthKit:** el framework de Apple es la puerta de entrada a los flujos de datos esenciales: frecuencia cardíaca, VFC (SDNN/RMSSD), SpO2 (especialmente relevante para distinguir combustión y vapeo) y niveles de actividad. El diseño centrado en la privacidad de HealthKit es fundamental para una app que maneja datos tan sensibles.
*   **Limitaciones de watchOS:** desarrollar para el reloj significa equilibrar constantemente la funcionalidad con las restricciones de recursos: la duración de la batería y las capacidades de procesamiento en segundo plano siempre están en primer plano.

## El corazón algorítmico: la Transformada Wavelet Estacionaria (SWT)

El análisis tradicional de series temporales suele tener dificultades con las señales no estacionarias, es decir, señales cuyas propiedades estadísticas (como la media y la varianza) cambian con el tiempo. Los datos fisiológicos son notoriamente no estacionarios. Aquí es donde entra en juego la **Transformada Wavelet Estacionaria (SWT)**.

A diferencia de la Transformada Wavelet Discreta (DWT) estándar, que es variante ante desplazamientos (es decir, un pequeño desplazamiento en la señal de entrada puede alterar drásticamente los coeficientes wavelet), la SWT es invariante ante desplazamientos. Esto la hace más robusta para analizar señales en las que el momento exacto de los eventos es crucial pero puede variar ligeramente.

**¿Por qué SWT para este problema?**

1.  **Localización tiempo-frecuencia:** la SWT puede descomponer una señal en distintas bandas de frecuencia conservando la información temporal. Esto significa que podemos buscar características de frecuencia específicas (por ejemplo, ráfagas repentinas de actividad de alta frecuencia en la FC, o cambios concretos en las bandas de frecuencia de la VFC) que ocurren en momentos precisos.
2.  **Eliminación de ruido:** las señales fisiológicas son ruidosas. La SWT ayuda a separar la señal "verdadera" subyacente del ruido aleatorio analizando los coeficientes wavelet a distintas escalas.
3.  **Detección de eventos transitorios:** es especialmente buena para identificar cambios abruptos, picos o eventos transitorios en una señal, que es exactamente lo que cabría esperar de la respuesta fisiológica aguda a la entrada de nicotina.

<figure>
  <img src="./images/stationary-wavelet-transform-visualization.jpg" alt="Visualización abstracta de una señal fisiológica descompuesta por la Transformada Wavelet Estacionaria en múltiples bandas de frecuencia.">
  <figcaption>Fig 2. – Visualización de la Transformada Wavelet Estacionaria descomponiendo una señal en sus componentes de frecuencia a lo largo del tiempo, lo que facilita la detección de patrones.</figcaption>
</figure>

En esencia, la SWT actúa como un sofisticado conjunto de filtros que nos permite "ver" patrones en los datos de FC, VFC y, potencialmente, SpO2 que podrían quedar ocultos por el ruido o por tendencias de largo plazo. Podemos buscar "formas" características o cambios de energía en subbandas wavelet específicas que se corresponden con la sacudida fisiológica.

## El recorrido del desarrollo: de los datos a la detección

1.  **Recolección de datos (HealthKit):** configurar una recuperación fiable de datos en segundo plano desde HealthKit, respetando los permisos del usuario y gestionando las actualizaciones de datos de forma eficiente.
2.  **Preprocesamiento de la señal:** limpiar los datos entrantes de FC, VFC y SpO2. Esto incluye manejar los puntos de datos faltantes y quizás algún filtrado inicial antes de aplicar la SWT.
3.  **Aplicación de la SWT:** aplicar la Transformada Wavelet Estacionaria a segmentos de la serie temporal fisiológica. Esto implica elegir una wavelet madre adecuada (por ejemplo, Daubechies, Symlet) y un nivel de descomposición.
4.  **Extracción de características a partir de los coeficientes wavelet:** aquí es donde sucede la magia (y mucha experimentación). En lugar de mirar directamente los valores brutos de FC/VFC, analizamos los coeficientes de la SWT. Las características relevantes podrían incluir:
    *   La energía en bandas de coeficientes de detalle específicas alrededor del momento de un evento sospechoso.
    *   Propiedades estadísticas (varianza, curtosis) de los coeficientes.
    *   La correlación cruzada entre los coeficientes wavelet de distintas señales fisiológicas (por ejemplo, FC y VFC).
5.  **Lógica/modelo de detección:** al principio, esto podría ser un sistema basado en reglas que busca patrones específicos en las características wavelet extraídas (por ejemplo, "un pico de energía significativo en los coeficientes de detalle de la FC a la escala X, coincidiendo con una caída brusca de energía en los coeficientes de detalle de la VFC a la escala Y, durante un periodo de baja actividad física"). Con el tiempo, esto podría evolucionar hacia un modelo de aprendizaje automático entrenado con estas características.
6.  **Puntuación de confianza:** como expuse en mi algoritmo MVPS, generar una puntuación de confianza para cada evento detectado es crucial, ya que refleja la fuerza y la claridad de la firma.
7.  **Implementación de la app de watchOS:** ejecutar el algoritmo central de detección en el Apple Watch, optimizando para la duración de la batería (por ejemplo, procesando los datos por lotes y activando el análisis de forma inteligente).
8.  **App complementaria de iOS:** para mostrar la línea de tiempo de los eventos detectados, ofrecer información y gestionar los ajustes. La sincronización de datos mediante WatchConnectivity es clave aquí.

## Consideraciones de salud y ética: la filosofía del "espejo"

Es vital reiterar que "Still Mirror" está concebido como una *herramienta de conciencia*, no como un dispositivo médico ni como un programa para dejar de fumar.
*   **La privacidad primero:** todo el procesamiento, en especial el trabajo sensible del algoritmo, debería ocurrir idealmente en el propio dispositivo. El acceso a los datos de HealthKit está estrictamente basado en permisos.
*   **Sin juicios:** la interfaz de la app y cualquier información que ofrezca deben ser neutrales, limitándose a reflejar patrones sin consejos prescriptivos ni reproches.
*   **Precisión y transparencia:** los usuarios necesitan entender las limitaciones de la app. Los falsos positivos y negativos son inevitables en una detección pasiva tan compleja. Ser transparente sobre la confianza de las detecciones es importante.
*   **Empoderamiento del usuario:** el objetivo es ofrecer a los usuarios datos sobre su propio cuerpo y sus hábitos, dándoles el poder de tomar sus propias decisiones informadas.

## Aprender Swift y navegar el ecosistema de Apple

Para quienes desarrollan principalmente desde otros entornos (como mis raíces en PHP/Laravel), adentrarse en Swift, SwiftUI, Xcode y las restricciones específicas del desarrollo en watchOS supone una curva de aprendizaje considerable. Hay una filosofía propia en los frameworks de Apple. Gestionar los ciclos de vida de la app, las tareas en segundo plano, las consultas a HealthKit y la comunicación entre dispositivos (WatchConnectivity) tiene cada uno sus patrones específicos y su "manera Apple" de hacer las cosas. Sin embargo, la rica documentación, la sólida comunidad y la potencia de Swift hacen que sea un recorrido gratificante.

## Conclusión: el potencial de un observador silencioso

"Still Mirror" sigue siendo una exploración, un empeño desafiante por ampliar los límites de lo que la detección pasiva en un wearable de consumo puede lograr. La Transformada Wavelet Estacionaria ofrece una vía prometedora para diseccionar señales fisiológicas complejas y descubrir las firmas sutiles que buscamos.

El recorrido implica no solo programar en Swift y lidiar con Xcode, sino también ahondar en la teoría del procesamiento de señales, comprender la fisiología humana y sopesar con cuidado las implicaciones éticas de una tecnología así. Que "Still Mirror" llegue a ser una app de uso extendido o se quede en una intrincada exploración técnica, el proceso en sí es un testimonio de la fascinante intersección entre la IA, la salud y la tecnología personal. Se trata de intentar construir esa superficie tranquila y reflexiva (un espejo en calma) para una mayor conciencia de uno mismo.

¿Qué opinas sobre usar procesamiento de señales avanzado como la SWT para la detección pasiva de hábitos? ¡Me encantaría conocer tus ideas en los comentarios!
