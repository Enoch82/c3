# specs-modulo-1-inventario-bordados.md

## 📑 Especificaciones de Módulo: Inventario de Bordados
**Estado:** Listo para desarrollo  
**Componente Core:** Agente Local + Base de Datos en Nube (Multi-tenant)

### 1. Descripción General
Este módulo es el encargado de digitalizar, centralizar e indexar el catálogo histórico de diseños de la empresa (soportando volúmenes masivos de hasta 70,000 archivos o más). Funciona mediante un **Agente Local** (software ligero instalado en el sistema operativo del cliente) que procesa los archivos propietarios `.emb` en segundo plano, extrae su metadata técnica y genera una previsualización visual para ser consumida de forma ágil desde la plataforma web (SaaS).

---

### 2. Flujo de Trabajo y Arquitectura del Módulo
[Servidor/PC Local]                                  [Stitchflow Cloud SaaS]
└── Carpeta con .emb                                 └── Base de Datos Vectorial / Relacional
└── 1. Agente Local lee binario ──(Metadata)─────>  ├── Indexación de características
└── 2. Genera Miniatura (PNG)  ──(Imagen)───────>  └── Galería Visual + Buscador Multi-filtro
1. **Extracción (Background Process):** El agente local escanea el directorio raíz configurado por el usuario.
2. **Procesamiento de Archivo:** Por cada archivo `.emb`, el agente lee el encabezado binario para descifrar las propiedades técnicas sin necesidad de abrir el software de diseño (ej. Wilcom).
3. **Renderizado de Miniatura:** El agente genera una imagen rasterizada de alta compresión (PNG o JPG optimizado) del diseño.
4. **Sincronización:** La metadata y la imagen se suben a la nube a través de una API segura, asociándolas al ID de la cuenta del cliente (Tenant).

---

### 3. Requerimientos Funcionales (User Stories)

#### 3.1 Modelo de Datos del Bordado (Metadata Obligatoria)
El sistema debe extraer, almacenar e indexar los siguientes campos por cada bordado:
*   **Nombre del archivo:** Nombre original en el disco (ej: `uniforme_colegio_final.emb`).
*   **Ubicación del archivo (Ruta local):** Ruta absoluta en la máquina de origen (ej: `C:/Bordados/2026/Clientes/`).
*   **Dimensiones:** Ancho ($X$) y Alto ($Y$) del diseño expresados en milímetros (mm).
*   **Cantidad de puntadas:** Número total de penetraciones de aguja requeridas para completar el diseño.
*   **Cantidad de colores:** Número de bloques de color e hilos diferentes que componen el diseño.
*   **Fecha de creación/modificación:** Marca de tiempo del archivo en el sistema de archivos local.
*   **Imagen de previsualización:** Archivo gráfico optimizado para despliegue web rápido.

#### 3.2 Buscador Avanzado y Sistema de Filtros
El usuario en la plataforma web debe poder encontrar un diseño en menos de 5 segundos utilizando:
*   **Búsqueda predictiva:** Por nombre del archivo o coincidencia parcial.
*   **Filtros por rangos técnicos:**
    *   Rango de puntadas (ej: "Bordados entre 5,000 y 15,000 puntadas").
    *   Rango de dimensiones (ej: "Diseños de menos de 10 cm de ancho").
    *   Rango de colores (ej: "Diseños de exactamente 3 colores").
*   **Filtro cronológico:** Por fecha de creación o indexación.

#### 3.3 Sistema Dinámico de Etiquetas (Tags)
*   El software debe permitir al usuario crear etiquetas personalizadas (ej: `#Gorras`, `#Dotación`, `#Escolares`, `#Espaldas`) directamente desde la interfaz web.
*   Un bordado puede tener múltiples etiquetas asignadas.
*   El buscador debe permitir filtrar diseños cruzando una o varias etiquetas simultáneamente para acelerar la localización en catálogos masivos.

---

### 4. Requerimientos Técnicos y Consideraciones de Rendimiento
*   **Optimización de Almacenamiento en Nube:** Dado que se pueden procesar hasta 70,000 archivos por cliente, las imágenes de previsualización deben ser comprimidas localmente antes de subirse (resolución máxima recomendada: 400x400px en formato WebP o PNG optimizado) para minimizar costos de almacenamiento en la nube S3/Blob Storage y acelerar la carga de la galería.
*   **Procesamiento Asíncrono (Queueing):** La primera indexación masiva del cliente debe realizarse por lotes (batches) controlados para no saturar el canal de internet del taller ni los recursos del servidor SaaS.