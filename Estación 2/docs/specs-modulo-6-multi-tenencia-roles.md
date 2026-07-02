Markdown
# specs-modulo-6-multi-tenencia-roles.md

## 📑 Especificaciones de Módulo: Multi-tenencia, Roles y Permisos
**Estado:** Listo para desarrollo  
**Componente Core:** Capa de Autenticación (Auth0 / Firebase Auth o Custom JWT) + Middleware de Aislamiento de Datos (Tenant Isolation) + Matriz de Control de Acceso Basado en Roles (RBAC)

### 1. Descripción General
Este módulo define la arquitectura de seguridad del SaaS. Garantiza que múltiples empresas de bordado (Tenants) puedan operar de forma segura y aislada en la misma base de datos en la nube sin riesgo de filtración de información. Asimismo, controla de manera granular las acciones que puede realizar cada miembro del equipo dentro del taller según su puesto de trabajo.

---

### 2. Arquitectura de Seguridad y Aislamiento (Multi-tenancy)

Para asegurar la confianza a nivel continental, el software implementará un aislamiento lógico estricto:

              [ API Gateway de Stitchflow ]
                            │
      ┌─────────────────────┴─────────────────────┐
      ▼                                           ▼
[ CLIENTE A / Tenant 1 ]                    [ CLIENTE B / Tenant 2 ]
├── Token API: tk_t1_abc...               ├── Token API: tk_t2_xyz...
├── Agente Local A (PC Taller A)            ├── Agente Local B (PC Taller B)
└── BD Filtrada (where tenant_id = 1)     └── BD Filtrada (where tenant_id = 2)


* **Identificador Único (`Tenant_ID`):** Cada tabla de la base de datos (Diseños, Insumos, Máquinas, OT, Clientes) incluirá de forma obligatoria la columna `tenant_id`. Todo query ejecutado desde la interfaz web o el agente local inyectará automáticamente un filtro para que el Taller A jamás pueda interactuar con los datos del Taller B.
* **Seguridad del Agente Local:** El ejecutable del Agente Local instalado en la computadora del taller requerirá un **Token de Seguridad API Único y Encriptado** durante su configuración inicial. Este token autenticará el tráfico de sincronización de los archivos `.emb` hacia la nube bajo el contenedor exclusivo de ese cliente.

---

### 3. Matriz de Control de Acceso Basado en Roles (RBAC)

El sistema contará con tres roles preconfigurados y optimizados para la operación de la industria textil:

#### 3.1 Rol: Administrador / Dueño del Taller
* **Alcance:** Control total del sistema (Lectura, Escritura, Edición, Eliminación).
* **Permisos Exclusivos:** Acceso al módulo financiero (Costos de insumos, precios acordados con clientes, cálculo de margen de ganancia neta). Gestión de suscripción del SaaS y configuración de facturación. Alta y baja de máquinas o personal.

#### 3.2 Rol: Supervisor / Jefe de Producción
* **Alcance:** Gestión operativa del piso de taller.
* **Permisos:** Visualizar y modificar el calendario/cronograma de máquinas (Scheduling). Crear y aprobar Órdenes de Trabajo (OT), asignar diseños a máquinas y gestionar el inventario de insumos (Carga de facturas con IA, control de stock y alertas).
* **Restricción Crítica:** Bloqueo absoluto de datos financieros confidenciales. No puede ver los márgenes de ganancia, las utilidades netas del negocio ni los costos de facturación del software.

#### 3.3 Rol: Operario de Máquina
* **Alcance:** Ejecución de costuras en el piso de producción.
* **Permisos:** Interfaz ultra-simplificada optimizada para tablets o pantallas industriales al lado de las 3 máquinas. Solo puede ver la cola de trabajos asignada a su máquina para el día, el nombre del diseño, el número de puntadas y el indicador de los colores/hilos a montar.
* **Restricciones:** No puede crear órdenes de trabajo, modificar inventarios, ver datos de clientes ni acceder a ninguna configuración global del software o del agente local.

---

### 4. Requerimientos Técnicos
* **Middleware de Tenant:** Implementación de políticas de seguridad a nivel de fila (Row-Level Security - RLS) en la base de datos (PostgreSQL recomendado) para asegurar el aislamiento por `tenant_id` de forma nativa.
* **Tokens de Agente:** Uso de hashing seguro (SHA-256) para almacenar los tokens de comunicación de los agentes locales, revocables inmediatamente desde el panel del Administrador en caso de pérdida o robo del equipo en el taller.