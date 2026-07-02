# Product Vision Board — Hardcore AI Cohorte 3

## PRODUCTO

**Nombre del producto:**
Stitchflow

**Descripción en una línea (qué hace y para quién):**
Un software inteligente de gestión de producción e inventario para empresas de bordado industrial que procesa catálogos masivos de diseños para automatizar el cálculo de insumos y la programación de máquinas.

---

## 1. PROBLEMA

Define el problema que resuelves. Debe ser un dolor real, específico, y que persista incluso cuando los modelos de AI evolucionen.

**Problema que resuelvo:**
Las empresas de bordado sufren de tres dolores críticos interconectados que frenan su capacidad de producción y destruyen su margen operativo:
1. **Falta de visibilidad del catálogo histórico:** Tienen miles de diseños antiguos (ej. 70,000 archivos `.emb`) dispersos en carpetas locales, lo que hace imposible buscar, reutilizar o cotizar rápidamente un diseño existente sin abrir los archivos uno por uno.
2. **Quiebres de stock e incertidumbre de insumos:** Al recibir un pedido, el jefe de producción calcula "al ojo" el consumo de hilos, entretelas y agujas. No hay un cruce real entre las puntadas/colores del archivo de diseño y el inventario en bodega, causando paradas de máquina a mitad de un lote por falta de material.
3. **Cuello de botella en la programación (Scheduling):** La asignación de órdenes a las máquinas de bordar se hace de forma empírica. No se optimiza el orden de los trabajos considerando el número de cabezales, cambios de color o tiempos de preparación, lo que resulta en máquinas ociosas y retrasos en las entregas.

**¿Este problema sobrevive a las próximas 2-3 generaciones de modelos foundation (GPT-5, Claude 5)?**
`[X]` Sí, porque es un problema de WORKFLOW/INTEGRACIÓN, no de OUTPUT
`[ ]` No estoy seguro — necesito investigar más
`[ ]` No — mi problema es de generación/resumen que se commoditiza

**Durability Score (1-5):** 5  
*(Aunque la IA evolucione, el problema real es la extracción técnica de los metadatos de los archivos binarios `.emb`, la lectura del inventario físico en la bodega del cliente y el algoritmo logístico para secuenciar los trabajos en sus máquinas en tiempo real).*

---

## 2. SEGMENTO TARGET

**¿Para quién es este producto?**
Inicialmente para pequeños talleres y fábricas de confección, publicidad y maquila de bordado industrial que cuentan con un catálogo masivo de diseños digitalizados y operan con múltiples máquinas multicabezal, con visión de escalar a nivel nacional y continental.

**¿Quién controla el veto de confianza?**
El **Jefe de Producción / Supervisor del Taller**. Si el sistema le exige rellenar demasiados datos manuales o si el algoritmo sugiere una asignación de máquinas que no es realista para los operarios en el piso, el jefe de producción dejará de usar el software y volverá al tablero físico o al Excel, matando la adopción.

---

## 3. MOAT PRIMARIO

Solo puedes elegir UNO como primario. Es tu ventaja defensible principal.

**Moat primario:**
`[ ]` Data Moat — Generamos data única que competidores no pueden comprar ni copiar
`[X]` Distribution Moat — Estamos embebidos en un canal/workflow difícil de replicar
`[ ]` Trust Moat — Ofrecemos reliability/safety/compliance que otros no pueden igualar

**¿Qué data, distribución o trust única poseemos o podemos construir?**
Nos apalancamos en un **Distribution Moat**. Al instalar un **agente local** en la máquina del cliente que se conecta directamente a sus carpetas de diseño, indexamos y estructuramos un catálogo histórico masivo (como los 70,000 archivos `.emb`) que ningún software en la nube puede leer fácilmente debido al peso y al formato binario propietario. Una vez que Stitchflow absorbe el inventario de diseños, automatiza la lectura de insumos mediante procesamiento de facturas y controla la asignación de sus máquinas, el software se vuelve el sistema operativo del taller. Sacar a Stitchflow de la operación para usar un competidor implicaría perder toda la automatización del flujo de trabajo y la metadata ya estructurada.

---

## 4. ARENA COMPETITIVA

**¿En qué arena compites?**
`[ ]` Pioneer (AI-Native) — Estoy creando un mercado nuevo que no podría existir sin AI
`[X]` Disruptor (AI-Disrupted) — Estoy reimaginando un workflow existente haciéndolo 10x mejor
`[ ]` Enhancer (AI-Enhanced) — Estoy usando AI para fortalecer un producto/proceso existente

**¿Cómo sobrevives o complementas a los gigantes (Google, Microsoft, OpenAI)?**
Los ERPs tradicionales o los softwares de inventario genéricos requieren que un humano digite manualmente cada insumo, cada hilo y cada campo de un pedido, lo cual fracasa en el caótico día a día de una empresa de confección. OpenAI provee modelos de visión generales, pero no entiende la lógica de producción de un taller de bordado (ej: cómo cruzar los colores de un hilo con las marcas locales disponibles en el mercado). Sobrevivimos porque empaquetamos la IA en un flujo vertical ultra-específico para la industria textil, resolviendo el problema de punta a punta: desde el archivo de diseño hasta la máquina física.

---

## 5. UX PARADIGM

**¿Cómo interactúa el usuario con tu producto?**
`[ ]` Assistant — El usuario está en control, AI sugiere (ej: Copilot)
`[X]` Agent — AI ejecuta tareas autónomamente dentro de límites (ej: AI SDR)
`[ ]` Autonomous — AI corre sin supervisión humana (ej: fraud detection)
`[ ]` Embedded Intelligence — AI mejora el producto de forma invisible (ej: recomendaciones)

**¿Por qué este paradigma para tu caso de uso?**
El paradigma es de **Agente** porque buscamos que *"el sistema trabaje para el usuario"*. En lugar de obligar al administrador a ingresar manualmente los hilos, agujas o telas que compró, el usuario simplemente toma una **foto de la factura o de la orden de compra**; la IA actúa como un agente que extrae los elementos, calcula las cantidades y el usuario solo tiene que **validar y dar un clic** para actualizar el inventario. Lo mismo ocurre con el agente local: escanea el disco, procesa los `.emb`, extrae las puntadas y colores, y pre-configura el inventario de diseños de forma autónoma.

---

## 6. AI DECISION TRIANGLE

No puedes maximizar las tres. Elige la prioridad de tu producto.

**Optimizo primariamente para:**
`[ ]` Cost — Lo más barato posible (ideal para tareas de alto volumen)
`[X]` Capability — Lo más inteligente/preciso (ideal para decisiones de alto riesgo)
`[ ]` Speed — Lo más rápido posible (ideal para experiencias en tiempo real)

**Trade-offs que acepto:**
Optimizamos para **Capability**. La extracción de datos desde imágenes de facturas (OCR avanzado + LLM) y la asignación inteligente de órdenes de bordado a las máquinas requiere una alta precisión para evitar descuadres en el inventario físico o paradas de producción por cálculos erróneos. Aceptamos que el procesamiento de una factura o la indexación inicial de los miles de archivos `.emb` tome un par de minutos (sacrificando velocidad en tiempo real) y que requiera modelos con capacidades de visión avanzadas (lo que eleva ligeramente el costo por token), ya que la prioridad absoluta es que el inventario sea exacto y confiable.

---

## 7. MODELO ECONÓMICO

**Modelo de pricing:**
`[X]` Hybrid Tiered (tiers con límites crecientes)

**¿El pricing escala si tienes 10x usuarios?**
`[X]` Sí   `[ ]` No   `[ ]` Necesita ajuste

**Estrategia Go-To-Market y Pricing:**
* **Fase Co-creación (Año 1):** Estrategia de co-desarrollo con **5 Partners Estratégicos** iniciales que pagan una mensualidad de **$200 USD** para financiar la inversión del desarrollo y validar el producto en talleres reales. A partir del año 2, estos *partners* reciben un descuento vitalicio por su apoyo inicial.
* **Fase SaaS Escalable:** Apertura masiva manteniendo el cobro de **$200 USD/mes** como tarifa plana para clientes estándar (nacional y continental).
* **Monetización Add-On:** Se cobrarán extras moderados por solicitudes de personalización específicas según requiera cada negocio, permitiendo aumentar el *LTV (Lifetime Value)* sin canibalizar el núcleo del SaaS.

**Costo estimado por usuario/mes:** $25.00 USD *(Inferencia de Visión/LLM para procesamiento de facturas + almacenamiento vectorial del agente local + infraestructura en la nube).*
**Revenue por usuario/mes:** $200.00 USD
**Gross margin proyectado:** ~87.5%

---

## 8. MÉTRICAS DE ÉXITO

**Métricas de usuario:**
1. **Machine Downtime Reduction:** Porcentaje de reducción del tiempo de máquinas paradas por falta de hilos o insumos en stock.
2. **Setup Time Optimization:** Tiempo promedio ahorrado por el jefe de producción al buscar un diseño indexado en lugar de buscarlo manualmente en carpetas locales.

**Métricas específicas de AI:**
1. **Invoice Line-Item Extraction Accuracy:** Porcentaje de acierto en la extracción automatizada de cantidades, tipos de hilos y códigos de productos a partir de fotos de facturas físicas.
2. **Metadata Extraction Success Rate:** Porcentaje de archivos `.emb` procesados correctamente por el agente local sin corromper o perder datos de puntadas/colores.

---

## 9. RIESGOS CRÍTICOS

**1. ¿Qué pasa si el problema desaparece en 12 meses por commoditización?**
Bajo riesgo. Aunque las APIs de visión e IA se vuelvan totalmente gratuitas, ningún gigante tecnológico va a construir la lógica vertical de nicho para la industria del bordado (entender formatos propietarios como `.emb` o coordinar la secuenciación de hilos en máquinas multicabezal locales). Nuestra ventaja es la especificidad del workflow, no la IA general.

**2. ¿Puede un competidor replicar tu producto con la misma API en menos de 6 semanas?**
Un clon visual en la nube sí, pero construir el **agente local** que escanee discos duros de manera segura, lea eficientemente miles de archivos binarios pesados de Wilcom y los cruce con un algoritmo lógico de inventario textil requiere meses de desarrollo e ingeniería especializada.

**3. Si tienes éxito a escala, ¿cuál es la primera forma en que se rompe la confianza?**
Si el agente de IA comete un error de alucinación leyendo una factura (ej. confundir un hilo de poliéster con uno de rayón, o leer 10 unidades en vez de 100) y el sistema le asegura al jefe de producción que hay insumos suficientes para un pedido urgente. Si el taller monta la orden y la máquina se para a mitad de la noche por falta de material real, la confianza en Stitchflow se rompe de inmediato. *Mitigación:* Obligar a un paso visual de validación rápida por parte del usuario antes de asentar cualquier factura en el inventario real.

---

*Hardcore AI by 30X — Cohorte 3 — Junio–Julio 2026*