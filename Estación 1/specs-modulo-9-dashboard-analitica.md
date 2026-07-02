# specs-modulo-9-dashboard-analitica.md

## 📑 Especificaciones de Módulo: Dashboard de Analítica y Rendimiento Comercial
**Estado:** Listo para desarrollo  
**Componente Core:** Panel de Business Intelligence (BI) + Gráficos de Producción + Motor de Analítica Predictiva y Estrategia Comercial (Estacionalidad)

### 1. Descripción General
Este módulo consolida toda la Big Data generada por el taller (órdenes, puntadas, tiempos e insumos) y la transforma en métricas visuales clave para el dueño del negocio. Su objetivo es doble: ofrecer un control operativo total sobre el estado del taller en diferentes ventanas de tiempo y actuar como un consultor estratégico que sugiere promociones en temporadas bajas y evalúa la viabilidad financiera de los trabajos.

---

### 2. Secciones del Tablero de Control (KPIs Core)

El administrador podrá filtrar todo el panel en rangos de tiempo paramétricos: **Semana actual, Mes actual, Año en curso o Rango personalizado**.

#### 2.1 Embudo y Desglose de Órdenes de Trabajo (OT)
* **Contador Macroeconómico:** Cantidad total de OTs recibidas en el periodo seleccionado.
* **Desglose de Flujo de Piso:** Tarjetas de estado que muestran de forma dinámica cuántas órdenes pasaron o se encuentran en:
    * ⏳ **Pendientes / En Espera**
    * 🪡 **Trabajando / En Máquina**
    * ✅ **Terminadas / Listas para Entregar**

#### 2.2 Telemetría de Producción Física
* **Volumen de Costura:** Contador total de **Puntadas Ejecutadas** acumuladas en el taller.
* **Volumen de Entrega:** Cantidad neta de **Bordados / Prendas Físicas** finalizadas con éxito.
* **Métrica de Tiempo Real:** Cantidad total de **Horas de Bordado Efectivas** consumidas por las máquinas (calculadas de forma exacta gracias a la telemetría del Módulo 4).

---

### 3. Requerimientos Funcionales Avanzados (Estrategia e Inteligencia de Negocio)

#### 3.1 Gráfica de Eficiencia de Producción (Capacidad vs. Realidad)
* El sistema desplegará un gráfico de líneas comparativo. Una línea mostrará la **Capacidad Máxima Teórica** del taller (basada en las horas laborables configuradas en el calendario y el número de cabezales del Módulo 3) frente a las **Horas Reales de Bordado**. Esto le permite al dueño ver visualmente si sus máquinas están ociosas o sobreexplotadas.

#### 3.2 Motor de Viabilidad Financiera de Órdenes ("¿Vale la pena?")
* **Score de Rentabilidad:** Cuando el administrador esté evaluando un trabajo complejo, el sistema analizará el histórico de la orden y le arrojará una alerta predictiva: *"Atención: Este bordado tiene alta densidad de puntadas y exige 12 cambios de color. El tiempo estimado de preparación en máquina reducirá tu ganancia neta un 18%. Se sugiere aumentar el precio por pieza un 10% para que sea viable"*.

#### 3.3 Detector de Estacionalidad y Sugeridor de Promociones
* **Análisis de Tendencia Histórica:** Al recopilar datos a lo largo de los meses, el software identificará caídas cíclicas de demanda (ej. temporadas bajas de confección post-escolar o mitades de año).
* **Alertas Estratégicas Activas:** Al detectar el inicio de una ventana históricamente baja, el Dashboard desplegará un banner inteligente de recomendación: 
  > 💡 **Sugerencia Stitchflow:** "Se detecta una proyección de caída del 35% en el volumen de puntadas para las próximas 3 semanas. Te sugerimos lanzar una promoción automatizada por WhatsApp a tus 20 clientes más frecuentes ofreciendo un 15% de descuento en parches o bordados de alta rotación para mantener las máquinas activas."

---

### 4. Requerimientos Técnicos
* **Agregaciones Eficientes:** Debido al volumen masivo de datos (un solo taller puede generar millones de puntadas a la semana), las métricas del dashboard no se calcularán en tiempo real directamente sobre las tablas crudas de la base de datos. Se utilizarán tablas agregadas o vistas materializadas (Materialized Views) que se refresquen asíncronamente (ej. cada hora) para garantizar que el panel cargue en menos de 2 segundos.
* **Librería de Gráficos:** Uso de librerías web ligeras y responsivas (ej. Chart.js o Recharts) optimizadas para visualización móvil y de escritorio.