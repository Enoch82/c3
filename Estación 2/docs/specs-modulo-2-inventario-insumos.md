# specs-modulo-2-inventario-insumos.md

## 📑 Especificaciones de Módulo: Inventario de Insumos (Hilos y Materiales)
**Estado:** Listo para desarrollo  
**Componente Core:** Módulo de Visión IA (OCR Avanzado) + Base de Datos de Stock + Servicio de Notificaciones (WhatsApp/SMS)

### 1. Descripción General
Este módulo gestiona el almacenamiento, control y reabastecimiento de los materiales físicos del taller (hilos, telas, entretelas, agujas, etc.). Su propuesta de valor principal es la automatización de la carga de stock mediante inteligencia artificial (lectura de facturas u órdenes de compra por foto) y la estimación inteligente del consumo basado en las puntadas de los diseños.

---

### 2. Flujo de Carga de Insumos con IA
[Foto de Factura/Orden] ──> [Visión IA / LLM]
│
├──> Extrae líneas de texto e insumos
│
└──> [Validación del Usuario]
├── Coincide ──> Suma a Stock Existente
└── Nuevo    ──> Alerta "Crear Insumo en DB"

1. **Captura:** El usuario toma una foto de la factura desde la interfaz web o móvil del SaaS.
2. **Procesamiento de IA:** Un modelo de visión extrae los campos clave (Proveedor, Ítem, Cantidad, Precio).
3. **Conciliación Inteligente:**
    *   Si el nombre del insumo de la factura coincide o se parece a uno existente, el sistema sugiere asociarlo.
    *   Si el insumo es completamente nuevo, el sistema **alerta al usuario** indicando que el elemento no existe en el sistema y le despliega un botón para **crearlo directamente en la base de datos** con los datos pre-rellenados por la IA.

---

### 3. Requerimientos Funcionales (User Stories)

#### 3.1 Gestión de Hilos Abiertos y Control de Unidades
*   El sistema debe soportar el registro de insumos en unidades comerciales (ej. Conos/Bobinas de hilo).
*   **Soporte para Hilos Abiertos:** Al iniciar el uso del software, el sistema debe permitir al usuario registrar hilos que ya han sido empezados, ingresando un porcentaje estimado de carga (ej: "Cono de Hilo Azul - 50% restante") para calibrar el inventario inicial sin obligarlo a pesar o medir con precisión milimétrica.

#### 3.2 Algoritmo de Consumo Promedio (Fórmula de Puntadas)
*   Para estimar si el stock es suficiente antes de montar una orden, el sistema aplicará una **fórmula de consumo promedio industrial estándar**:
    $$\text{Consumo de Hilo (metros)} = \left( \frac{\text{Puntadas Totales} \times \text{Longitud de Puntada Promedio (4mm)}}{1000} \right) \times \text{Factor de Desperdicio (1.3)}$$
    *(Nota: El factor de desperdicio 1.3 incluye el hilo de la bobina inferior/carretel y las colas de corte).*
*   A medida que el sistema registre órdenes ejecutadas reales y compras, el algoritmo se refinará de manera adaptativa.

#### 3.3 Semáforo de Alertas y Sistema de Notificaciones Out-of-App
El inventario contará con un monitoreo visual y activo de existencias:
*   🟢 **Verde:** Stock óptimo para cubrir la producción planeada de la semana.
*   🟡 **Amarillo:** Stock bajo. El material alcanza para los diseños en cola, pero está cerca del límite mínimo de seguridad.
*   🔴 **Rojo:** Crítico. El stock actual no cubre las puntadas o colores de las órdenes planeadas para el día de hoy.
*   **Notificaciones Automatizadas:** Al cambiar un insumo crítico a estado **Rojo/Crítico**, el sistema disparará un servicio asíncrono para enviar una alerta push automatizada directamente al **WhatsApp o vía SMS** del administrador del taller para evitar paradas de máquina involuntarias.

---

### 4. Requerimientos Técnicos
*   **Prompt Engineering para Facturas:** El módulo de IA debe ser instruido estrictamente mediante *JSON Mode* para estructurar los datos extraídos de la factura antes de mostrárselos al usuario.
*   **Integración de Mensajería:** Uso de la API oficial de WhatsApp Business (o proveedores intermedios como Twilio) para el envío de plantillas de alerta de quiebre de stock.