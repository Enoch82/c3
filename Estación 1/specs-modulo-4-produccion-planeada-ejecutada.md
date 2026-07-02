Markdown
# specs-modulo-4-produccion-planeada-ejecutada.md

## 📑 Especificaciones de Módulo: Producción Planeada y Ejecutada
**Estado:** En diseño de arquitectura (Lógica Heurística + IoT)  
**Componente Core:** Algoritmo de Scheduling Avanzado + Calendario de Operación + Capa de Integración de Red Industrial (IoT)

### 1. Descripción General
Este módulo es el motor central de Stitchflow. Se encarga de recibir las órdenes de los clientes, cruzarlas con el catálogo de bordados y el stock de insumos, y generar automáticamente la hoja de ruta óptima de producción para las máquinas del taller. Utiliza un algoritmo de priorización inteligente basado en reglas de negocio dinámicas (Clientes Premium) y un calendario laboral configurable.

---

### 2. Algoritmo de Priorización y Reglas de Planeación (Scheduling)

El sistema operará bajo una base de despacho **FIFO (First In, First Out)** por defecto, pero con la capacidad de recalcular y replantear la cola de producción automáticamente si ingresa un pedido de un **Cliente Premium**.

#### 2.1 Matriz de Pesos Heurísticos para Clientes Premium
La IA o el motor de reglas reordenará la cola analizando cuatro variables clave con pesos configurables:
*   **Frecuencia de pedidos (Peso A):** Qué tan seguido compra el cliente en el año.
*   **Volumen de la orden (Peso B):** Cantidad total de piezas o puntadas del pedido actual.
*   **Margen de Ganancia (Peso C):** Rentabilidad neta que deja el pedido para el taller.
*   **Historial de facturación acumulada (Peso D):** Valor histórico del cliente en el SaaS.

#### 2.2 Motor de Sugerencias y Calendario Laboral
*   **Calendario del Taller:** El administrador configurará los días laborables, turnos y horas productivas por jornada (ej. Lunes a Viernes de 6:00 AM a 2:00 PM y Sábados medio día).
*   **Sugerencia de Producción:** Con base en el calendario y la capacidad de las máquinas (Módulo 3), el sistema generará una propuesta de cronograma visual (vista de calendario/Gantt) dividida en **Día, Semana o Mes**, mostrando exactamente qué diseños deben montarse en cada cabezal para cumplir con los tiempos de entrega.

---

### 3. Ejecución en Taller e Integración Semiautomatizada (Visión IoT)

Para eliminar la fricción del operario y medir los tiempos muertos con precisión, el módulo implementará una estrategia de envío de archivos y telemetría de producción:

[ Stitchflow Cloud SaaS ]
│
(Envío de comando de red)
▼
[ Agente Local / Servidor de Red del Taller ]
│
(Protocolo de red / LAN hacia la pantalla de la máquina)
▼
[ Máquina Bordadora ] ──> Inicia lectura del archivo (.DST/.DSB)
│
(Periodo de ejecución = Tiempo de Bordado Real)
▼
[ Siguiente Envío de Archivo ] ──> Marca fin del bordado anterior


#### 3.1 Flujo Semiautomatizado de Envío de Software (Archivos de Diseño)
*   En lugar de usar memorias USB que ralentizan el taller, el sistema contará con un botón en la interfaz: **"Enviar Diseño a Máquina X"**.
*   A través del agente local conectado a la red interna (LAN/Wi-Fi) del taller, el software transmitirá el archivo convertido al formato de lectura de la máquina (ej: `.dst` o `.dsb`).

#### 3.2 Captura Automatizada de Tiempos y Preparación
*   **Métrica de Tiempo de Bordado:** El temporizador de la orden iniciará de forma automática en el software en el momento exacto en que el diseño es enviado y cargado con éxito en la memoria interna de la máquina.
*   **Cálculo de Tiempos Muertos:** El reloj se detendrá cuando la orden marque su fin o cuando se envíe el próximo archivo de diseño a esa misma máquina. La diferencia de tiempo entre el final de una costura y el inicio de la otra será calculada automáticamente por el sistema como **"Tiempo de Preparación/Montaje"** (cambio de hilos, acomodo de tambor, etc.), permitiendo medir la eficiencia real del operario sin que este deba digitar nada.

---

### 4. Requerimientos Técnicos preliminares
*   **Motor de Reglas:** Implementación de un algoritmo de optimización lineal o heurística ponderada para resolver el orden de la cola de producción.
*   **Capa IoT de Red:** El agente local debe mapear las direcciones IP fijas de las tarjetas de red de las máquinas bordadoras para habilitar la transferencia de archivos en red local a través de protocolos compatibles con paneles industriales (ej: emulación de directorios compartidos o FTP industrial).