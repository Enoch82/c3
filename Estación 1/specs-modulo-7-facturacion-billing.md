# specs-modulo-7-facturacion-billing.md

## 📑 Especificaciones de Módulo: Facturación, Cobro y Suscripciones (Billing)
**Estado:** Core definido / Canales TBD  
**Componente Core:** Pasarela de Pagos (SaaS Billing Engine) + Sistema de Control de Ciclo de Vida de Suscripción + Módulo de Bloqueo de Infraestructura Operativa (Kill-Switch)

### 1. Descripción General
Este módulo es el motor financiero del SaaS que automatiza el recaudo recurrente de la suscripción mensual de **$200 USD** (tarifa plana estándar para el continente). Su objetivo principal es asegurar la continuidad de los ingresos del software, gestionar los estados de pago de cada taller y ejecutar acciones automatizadas de suspensión inmediata del servicio en caso de incumplimiento comercial.

---

### 2. Matriz de Control de Suscripción y Flujo de Bloqueo
[ Fecha de Corte / Cobro Recurrente ]
│
┌────────┴────────┐
▼                 ▼
(Pago Exitoso)    (Pago Fallido / Rebotado)
│                 │
[ Mantener Activo ]    ▼
[ Ejecución de Bloqueo Inmediato ]
├── Web: Modo "Solo Lectura / Pantalla de Pago"
└── Local: Deshabilitar funciones del Agente local


---

### 3. Requerimientos Funcionales (User Stories)

#### 3.1 Procesamiento de Suscripciones e Integración (TBD)
* **Pasarela de Pagos (Por definir):** El sistema contará con una arquitectura desacoplada lista para integrar una pasarela internacional de cobro recurrente (Stripe, Kushki o Mercado Pago) para procesar tarjetas de crédito y métodos de pago locales en todo el continente.
* **Cobro de Add-ons / Personalizaciones (Por definir):** La lógica de negocio permitirá modificar la estructura de cobro mensual base para añadir cargos extra (recurrentes o de pago único) asociados a las solicitudes específicas de personalización que requiera cada taller.

#### 3.2 Política de Control de Impagos y Kill-Switch Inmediato
Para proteger el costo de cómputo, inferencia de IA y el uso de servidores, el sistema implementará una política estricta sin días de gracia:
* **Bloqueo Inmediato:** Si en la fecha de corte el cobro automático de los $200 USD falla o es rechazado por el banco del cliente, el sistema cambiará el estado del Tenant a `Suspended` de forma automatizada.
* **Deshabilitación Completa de Funciones:** * **En la Plataforma Web:** Se restringirá el acceso a todos los módulos operativos (Inventarios, Máquinas, Creación de OT). La interfaz redirigirá al usuario a una pantalla única de bloqueo informando el fallo de pago y habilitando el botón de actualización de tarjeta.
    * **En el Agente Local (Piso de Taller):** El servidor en la nube enviará un comando de suspensión al instalable local. El agente local **deshabilitará de inmediato todas sus funciones básicas**: detendrá el escaneo de archivos `.emb`, suspenderá la transmisión de diseños a la red de máquinas y congelará la telemetría, deteniendo la automatización logística del taller hasta que el pago sea regularizado.

---

### 4. Requerimientos Técnicos
* **Webhooks de Pago:** El sistema escuchará en tiempo real las notificaciones asíncronas (Webhooks) de la pasarela de pagos para activar o desactivar instantáneamente el bloqueo del taller.
* **Resiliencia del Agente Local:** El agente local validará el estado de la suscripción contra la API de Stitchflow cada vez que intente realizar una acción (ej. enviar un archivo a una máquina). Si no hay conexión a internet o la API responde con un código de suspensión, el agente bloqueará localmente la interfaz del operario.