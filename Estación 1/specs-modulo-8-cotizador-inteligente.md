Markdown
# specs-modulo-8-cotizador-inteligente.md

## 📑 Especificaciones de Módulo: Cotizador Inteligente Textil
**Estado:** Fase 1: Reglas Vectoriales / Fase 2: Modelo Predictivo IA (Data-Driven)  
**Componente Core:** Parser de Archivos Vectoriales (Curvas) + Motor de Estimación Heurística + Pipeline de Recolección de Datos para Entrenamiento de Red Neuronal

### 1. Descripción General
Este módulo optimiza y automatiza el proceso de preventa y cotización del taller. En su fase inicial, asiste al administrador estructurando la estimación basada en archivos en curvas entregados por el cliente. En su segunda fase (SaaS robusto), utiliza un modelo de Visión por Computadora entrenado con el histórico del propio taller para generar cotizaciones precisas y automáticas a partir de una simple imagen comercial (PNG/JPG).

---

### 2. Evolución del Módulo: De Curvas a Visión IA

[ FASE 1: Lanzamiento / MVP ]
Cliente entrega archivo en curvas ──> Parser extrae trazos ──> Entrada manual de puntadas "a ojo" ──> Cotización rápida

[ FASE 2: SaaS Maduro (Evolución IA) ]
Cliente entrega JPG/PNG ──> Modelo de Visión IA Stitchflow ──> Predicción automática de puntadas ──> Costeo instantáneo


---

### 3. Requerimientos Funcionales (User Stories)

#### 3.1 Fase 1: Cotizador Asistido por Vectores (Curvas) y Entrada Empírica
* **Carga de Archivos en Curvas:** El sistema permitirá al administrador arrastrar archivos vectoriales (ej. PDF vectorial, EPS o SVG) entregados por las agencias o clientes.
* **Extracción Básica:** El software renderizará el vector y extraerá metadatos limpios (dimensiones físicas del diseño en mm y número de trazados/colores identificados).
* **Entrada de Puntadas Estimadas:** Dado que en el proceso inicial no se cuenta con el archivo binario de bordado (`.emb`), el administrador ingresará el número de puntadas estimadas "a ojo" basadas en su experiencia. El sistema aplicará la matriz de costos de insumos (Módulo 2) para arrojar el precio sugerido al instante.

#### 3.2 Fase 2: El Pipeline de Datos y el Modelo Predictivo IA
Para lograr que el sistema calcule el costo con solo una imagen en el futuro, el software implementará un **sistema silencioso de recolección de datos (Data Harvesting)** desde el día uno:
* **Emparejamiento de Datos (Dataset Building):** Cada vez que una Orden de Trabajo (Módulo 5) se complete con éxito, el sistema guardará en un repositorio de entrenamiento tres elementos vinculados:
    1. La imagen visual del logotipo (PNG/JPG de previsualización del Módulo 1).
    2. Las dimensiones reales ($X$, $Y$ en mm).
    3. El conteo real y exacto de puntadas y colores que arrojó el archivo binario `.emb` procesado por el agente local.
* **Activación del Cotizador por Imagen:** Cuando el volumen de datos del SaaS sea lo suficientemente robusto a nivel continental, se activará el modelo predictivo. El usuario solo subirá una foto del logo, digitará el tamaño deseado y la IA comparará el patrón visual contra el histórico para predecir: *"Este tipo de logo, a este tamaño, requiere aproximadamente 12,500 puntadas"*, generando el costo total de forma automática y sin intervención humana.

---

### 4. Requerimientos Técnicos
* **Estructura del Dataset:** Las imágenes almacenadas para el entrenamiento futuro deben guardarse junto con etiquetas JSON estructuradas que contengan: `puntadas_reales`, `area_mm2`, `densidad_promedio` y `conteo_colores`.
* **Seguridad de Propiedad Intelectual:** Las imágenes del catálogo de un taller utilizadas para entrenar el modelo global de IA del SaaS deben ser anonimizadas (eliminando nombres de clientes o marcas sensibles) para cumplir con el aislamiento del Módulo 6.