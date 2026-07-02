Markdown
# specs-modulo-5-gestion-clientes-ordenes.md

## 📑 Especificaciones de Módulo: Gestión de Clientes y Órdenes de Trabajo (OT)
**Estado:** Listo para desarrollo  
**Componente Core:** CRM de Clientes + Generador de Órdenes de Trabajo + Calculador de Costos/Márgenes + Portal Público de Rastreo (Tracker)

### 1. Descripción General
Este módulo gestiona la relación comercial del taller con sus clientes y actúa como el puente que transforma un acuerdo comercial en una instrucción de producción ejecutable. Permite calcular la rentabilidad de cada lote antes de costurar y ofrece una interfaz pública animada para que el cliente final consulte el estado de su pedido en tiempo real mediante un ID único o notificaciones de WhatsApp.

---

### 2. Flujo de Ciclo de Vida de una Orden de Trabajo (OT)

[Acuerdo Comercial] ──> [Generar OT] ──> [Cálculo Costo/Ganancia]
│
├──> ¿Diseño Nuevo? ──> Mandar a digitalizar (.emb)
└──> ¿Diseño Existente? ──> Vincular desde Catálogo
│
▼
[Flujo de Estados en Piso]
(Espera ──> Trabajando ──> Empacando ──> Listo)
│
▼
[Portal de Rastreo del Cliente]


1. **Creación:** El administrador o dueño del taller llega a un acuerdo con el cliente y crea la OT en el sistema.
2. **Definición del Diseño:** En la OT se especifica si se debe mandar a crear/digitalizar un archivo `.emb` nuevo (generando un costo de diseño) o si se vincula un archivo ya existente del inventario (Módulo 1).
3. **Especificación de Carga:** Se digita el precio acordado por pieza y la cantidad total de bordados requeridos.

---

### 3. Requerimientos Funcionales (User Stories)

#### 3.1 Motor Financiero de la Orden de Trabajo (Costos vs. Ganancia)
* **Cálculo de Costo de Insumos:** Al ligar el diseño (que ya tiene el número de puntadas del Módulo 1) y la cantidad de piezas, el sistema cruzará la fórmula de consumo promedio de hilos/telas (Módulo 2) para estimar el costo monetario de los materiales a gastar.
* **Cálculo de Margen Neto:** El sistema restará el costo estimado de insumos (más el costo de digitalización si el `.emb` es nuevo) del precio total acordado con el cliente, mostrando en tiempo real al dueño del taller la **Ganancia Neta Proyectada** de la orden. Esta información es privada y confidencial (está oculta para operarios y clientes).

#### 3.2 Ficha de Clientes y Trazabilidad por OT
* El cliente tendrá un perfil básico en el sistema (Nombre, Teléfono, Identificación).
* Los bordados **no** pertenecen directamente al cliente en la base de datos; la relación se establece estrictamente a través del histórico de Órdenes de Trabajo. El nombre del cliente puede ser usado automáticamente por el sistema como una *etiqueta* (Tag) en la orden para búsquedas rápidas.

#### 3.3 Tracker Público y Notificaciones Out-of-App (Experiencia del Cliente)
* **ID Único de Rastreo:** Cada OT generará un código único alfanumérico no secuencial para el cliente (ej. `STF-9824X`).
* **Vista Animada de Estado:** El cliente podrá acceder a una URL pública de Stitchflow (sin necesidad de iniciar sesión con usuario y contraseña) donde verá una interfaz gráfica animada que indica la fase exacta del pedido:
    * ⏳ **En Espera:** Orden recibida y programada en cola.
    * 🪡 **Trabajando:** El diseño está montado en las máquinas y costurándose.
    * 📦 **Empacando:** Proceso de control de calidad, limpieza de hilos y empaque.
    * ✅ **Listo para Entregar:** Pedido completado listo para retiro o despacho.
* **Consentimiento de Notificaciones (WhatsApp):** Si el cliente autoriza explícitamente el envío de mensajes durante la creación de la OT, el sistema disparará un WhatsApp automatizado cuando el estado cambie a **"Listo para Entregar"**, adjuntando su ID y el resumen de retiro.