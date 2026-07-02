# specs-modulo-3-gestion-maquinas.md

## 📑 Especificaciones de Módulo: Gestión de Máquinas
**Estado:** Listo para desarrollo  
**Componente Core:** Panel de Configuración de Hardware + Registro de Telemetría/Uso + Bitácora de Mantenimiento Preventivo

### 1. Descripción General
Este módulo permite digitalizar la capacidad instalada del taller (inicialmente enfocado en las 3 máquinas base del cliente, con capacidad de escalabilidad SaaS). Su objetivo es modelar las restricciones técnicas reales de cada máquina (cabezales, hilos, tambores compatibles y especialidades) y llevar un control estricto de su desgaste, uso y mantenimiento.

---

### 2. Estructura de Datos de una Máquina (Ficha Técnica)

Cada máquina registrada en el sistema contará con los siguientes parámetros obligatorios de configuración:

*   **Identificador de Máquina:** Nombre o ID interno (ej. *Máquina Bordadora 01*).
*   **Capacidad de Cabezales:** Cantidad de cabezas de bordado que operan en simultáneo.
*   **Capacidad de Hilos:** Número de agujas/colores simultáneos que soporta cada cabezal (ej. 9, 12, 15 agujas).
*   **Compatibilidad de Bordado Especial:** Flags booleanos independientes para identificar si la máquina soporta:
    *   Bordado de Gorras (Prendas armadas/Tambor tubular).
    *   Bordados especiales (Lentejuelas, cordón, etc.).
*   **Matriz de Tambores Soportados:** Listado de bastidores/tambores compatibles con la máquina, registrando su dimensión máxima de área de bordado en Ancho ($X$) y Alto ($Y$) expresada en milímetros (mm).

---

### 3. Requerimientos Funcionales (User Stories)

#### 3.1 Módulo de Control de Estados y Disponibilidad
*   El sistema debe permitir cambiar el estado operativo de la máquina en tiempo real:
    *   🟢 **Activa:** Disponible para producción.
    *   🟡 **En Configuración / Cambio de Hilos:** Detenida temporalmente en piso.
    *   🔴 **En Mantenimiento / Averiada:** Excluida automáticamente por el sistema para la asignación de nuevas órdenes de producción.

#### 3.2 Registro de Uso y Telemetría de Desgaste
*   El software contará con un contador acumulativo de **Unidades de Uso** basado en la cantidad de puntadas ejecutadas.
*   Cada vez que una orden de producción se finalice en una máquina específica, el sistema sumará el número de puntadas del diseño al contador histórico de la máquina (ej: *"La Máquina 01 ha ejecutado 4,500,000 puntadas este mes"*).

#### 3.3 Bitácora y Alertas de Mantenimiento
*   **Registro de Historial:** Pantalla para documentar mantenimientos realizados (Fecha, técnico, descripción del trabajo, repuestos cambiados).
*   **Mantenimiento Preventivo Automático:** El usuario podrá configurar alertas basadas en el uso de la máquina (ej: *Disparar alerta de lubricación/revisión cada 5,000,000 de puntadas*). Al alcanzar el límite, el sistema enviará una notificación interna y una alerta vía WhatsApp/SMS al administrador indicando que la máquina requiere atención.

---

### 4. Restricciones de Integración con Producción (Lógica de Negocio)
*   Al momento de planificar una orden de producción, el sistema **cruzaré automáticamente** los datos del bordado (Módulo 1) con la ficha técnica de la máquina (Módulo 3). 
*   *Regla de Validación:* Si un diseño requiere un tambor de $300 \times 300\text{ mm}$ o es una Gorra, el sistema bloqueará la asignación a cualquier máquina que no tenga activos dichos soportes o dimensiones en su configuración.