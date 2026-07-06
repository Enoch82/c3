## **Brief de lección (Día 10): Seguridad.** **De POC a “production-hardened”**

### 

### **Propósito de la sesión**

Elevar la madurez y mejorar la postura de seguridad para llevar una aplicación desde un prototipo funcional (POC) a un sistema endurecido para producción, con controles técnicos y operativos, automatización en el SDLC, y un enfoque explícito para riesgos de IA y aplicaciones agenciales.

### 

### **Resultados de aprendizaje**

Al finalizar, el participante puede:

* Explicar por qué “seguridad” escala con la exposición, la automatización y la dependencia de terceros, y cómo eso cambia al pasar de POC a producción.  
* Usar un mapa de superficies de riesgo para inventariar, priorizar y convertir riesgos en acciones verificables.  
* Interpretar y aplicar taxonomías OWASP relevantes: Top 10 Web 2025, Top 10 LLM 2025, Top 10 Agentic 2026\.  
* Diseñar un plan mínimo de hardening con controles de prevención, detección y respuesta (incluyendo BCP/DRP).  
* Dirigir arneses agenciales a ejecutar hardening de forma segura (guardrails, permisos, verificación, reportes) sin convertirlos en un riesgo adicional.

---

## **Apertura: escala e importancia (5 min)**

**Visual clave:** Check Point ThreatMap para mostrar actividad global en tiempo real y anclar el mensaje de “esto ocurre todo el tiempo”.

**Idea fuerza:** cuando un sistema pasa a producción, su “superficie atacable” y el “valor del objetivo” crecen; por tanto, el costo esperado del riesgo sube incluso si el código no cambió.

---

## **Mapa de superficies de riesgo (10 min)**

Usar este mapa como índice operativo (para checklist, backlog y reporte).

1. **Infraestructura y plataforma**  
   Nube, red, OS, contenedores, runtime.  
2. **Edge y exposición**  
   DNS, CDN, WAF, reverse proxy, API gateway.  
3. **Servicios y aplicación**  
   Código, configuración, APIs, feature flags.  
4. **Identidad y acceso**  
   Humanos, servicios, agentes, llaves, IAM, RBAC.  
5. **Datos**  
   DBs, objetos, colas, logs, RAG, retención.  
6. **Sistema de IA**  
   Modelo e inferencia, prompts, contexto, agentes y herramientas, evals y guardrails.  
7. **SDLC y supply chain**  
   Dependencias, CI/CD, IaC, imágenes, firmas.  
8. **Observabilidad y respuesta**  
   Auditoría, detección, IR.

**Heurística de priorización para pasar de POC a producción:** empezar por lo que permite “impacto irreversible” (exfiltración, ejecución remota, escalamiento de privilegios, destrucción de datos), y por lo que se amplifica con IA (agencia, herramientas, contexto y supply chain).

---

## **Frameworks y taxonomías (30 a 35 min)**

### **1\) OWASP Top 10 Web Application Security Risks 2025 (10 min)**

Como mapa base para aplicaciones y APIs:

* A01:2025 Broken Access Control  
* A02:2025 Security Misconfiguration  
* A03:2025 Software Supply Chain Failures  
* A04:2025 Cryptographic Failures  
* A05:2025 Injection  
* A06:2025 Insecure Design  
* A07:2025 Authentication Failures  
* A08:2025 Software or Data Integrity Failures  
* A09:2025 Security Logging and Alerting Failures  
* A10:2025 Mishandling of Exceptional Conditions

### **2\) OWASP Top 10 for LLM Applications 2025 (10 min)**

Taxonomía específica de riesgos en apps con LLM:

* LLM01:2025 Prompt Injection  
* LLM02:2025 Sensitive Information Disclosure  
* LLM03:2025 Supply Chain  
* LLM04:2025 Data and Model Poisoning  
* LLM05:2025 Improper Output Handling  
* LLM06:2025 Excessive Agency  
* LLM07:2025 System Prompt Leakage  
* LLM08:2025 Vector and Embedding Weaknesses  
* LLM09:2025 Misinformation  
* LLM10:2025 Unbounded Consumption

**Lectura práctica para ingeniería:** estos riesgos suelen colapsar en 4 controles estructurales:

* Separación estricta entre instrucciones y datos (y etiquetado de contenido no confiable).  
* Validación y “gating” determinístico de outputs antes de ejecutar acciones.  
* Privilegios mínimos y “least agency” para herramientas y side effects.  
* Presupuestos y límites (tokens, costo, rate, tiempo) para evitar consumo no acotado. 

### **3\) OWASP Top 10 for Agentic Applications 2026 (10 min)**

Para sistemas con agentes que planifican y actúan con herramientas:

* ASI01 Agent Goal Hijack  
* ASI02 Tool Misuse and Exploitation  
* ASI03 Identity and Privilege Abuse  
* ASI04 Agentic Supply Chain Vulnerabilities  
* ASI05 Unexpected Code Execution (RCE)  
* ASI06 Memory & Context Poisoning  
* ASI07 Insecure Inter-Agent Communication  
* ASI08 Cascading Failures  
* ASI09 Human-Agent Trust Exploitation  
* ASI10 Rogue Agents

**Traducción inmediata a hardening del arnés:**  
En aplicaciones agenciales, el “perímetro” real se mueve hacia: permisos de herramientas, identidad de agentes, canales inter-agente, y memoria/contexto persistente.

### **4\) Modelos de defensa para pensar como atacante y como defensor (5 min)**

* **Cyber Kill Chain (CKC)**: modelo de 7 pasos para romper un ataque en etapas (reconnaissance → weaponization → delivery → exploitation → installation → command & control → actions on objectives).  
* **MITRE ATT\&CK**: base de conocimiento de tácticas y técnicas observadas en el mundo real, útil para detección, simulación y lenguaje común.  
* **Zero Trust (NIST SP 800-207)**: paradigma que mueve defensas del perímetro a recursos, identidad y verificación continua, reduciendo movimiento lateral.

---

## **Controles: de POC a producción (25 a 30 min)**

### **A. Prevención (qué endurecer primero)**

**Infra y plataforma**

* Baselines de hardening del runtime: imágenes mínimas, usuarios no root, capabilities mínimas, aislamiento, parches y actualización.  
* IaC con defaults seguros y revisión automatizada.

**Edge y exposición**

* TLS bien configurado, headers, rate limiting, WAF donde aplique, y logs de borde.  
* Política de CORS y endpoints públicos explícitos.

**Servicios y aplicación**

* Autorización como política (A01) y no como condicionales dispersos.  
* Validación de input, encoding, protección contra inyecciones (A05).  
* Manejo explícito de excepciones y fallos (A10) para evitar leaks, bypasses y estados inconsistentes.

**Identidad y acceso**

* MFA, rotación, separación de roles, cuentas de servicio con permisos mínimos.  
* Para agentes: identidad separada por agente y por herramienta, scopes mínimos y expiración corta.

**Datos**

* Clasificación simple (PII, secretos, internos, públicos), retención, cifrado en tránsito y reposo, y auditoría de acceso.  
* Para RAG: higiene de fuentes y límites de acceso.

**Sistema de IA**

* “Least agency”, tool allowlists, sandboxes para ejecución, output handling determinístico (LLM05), y políticas contra prompt injection (LLM01).

**Supply chain**

* Gestión de dependencias (SCA), bloqueo por políticas, SBOM, firma y verificación cuando aplique.  
* Controles para “agentic supply chain”: prompts, skills, plugins, MCP servers, tool adapters.

### **B. Detección y respuesta (cuando algo falla)**

* Logs útiles (con trazabilidad de identidad, request id, decisiones de autorización, uso de herramientas, cambios de configuración).  
* Alertas accionables con severidad y runbooks.  
* IR básico: triage, contención, erradicación, recuperación, postmortem.

### **C. Continuidad y resiliencia (BCP, BIA, DRP)**

* BIA para priorizar sistemas críticos y dependencias.  
* DRP con objetivos claros: RPO, RTO, WRT, MTD.  
* Inmutabilidad y aislamiento de logs y evidencia cuando aplique.  
* Ejercicios de recuperación y canales de comunicación alternos.

---

## **IA aplicada a seguridad (15 min)**

### **1\) “Security copilots” para hardening, sin crear nuevos riesgos**

Patrón recomendado: usar agentes para acelerar análisis y ejecución repetible, con guardrails que reduzcan blast radius.

**Guardrails mínimos del arnés:**

* *Allowlist* explícita de herramientas y comandos.  
* Separación de credenciales por entorno (dev, staging, prod) y por rol.  
* Aprobación humana para operaciones con side effects altos (borrar datos, rotar llaves, cambiar IAM, desplegar).  
* Logging estructurado del “agentic loop”: objetivo, plan, comandos, diffs, outputs, verificación.

### **2\) SAST con agentes, guiado por OWASP**

Flujo típico:

1. Generar checklist de categorías OWASP aplicables al repositorio (web, API, auth, crypto, supply chain).  
2. Ejecutar SAST (Semgrep o CodeQL) y secrets scanning.  
3. Triage agencial: agrupar hallazgos por riesgo, impacto, exploitabilidad.  
4. Proponer fixes con pruebas de regresión.  
5. Generar “Security Backlog” con criterios de aceptación y comandos de verificación.

### **3\) Pentesting asistido por IA (mención breve y responsable)**

**Shannon (KeygraphHQ)** es un pentester autónomo que busca vectores y ejecuta exploits reales para probar explotabilidad en apps web.

Uso pedagógico en esta clase: entender cómo cambia el juego cuando el atacante también automatiza exploración y explotación, y por qué eso hace valiosos los controles de autorización, segmentación, límites, y observabilidad.

---

## **Demo en clase: “Security hardening sprint” con Semgrep \+ Shannon \+ agente para threat model (25 a 35 min)**

### **Objetivo del demo**

Mostrar un flujo realista, rápido y repetible para pasar de “tengo un repo que funciona” a “tengo evidencia de postura de seguridad”: hallazgos accionables (SAST), validación ofensiva controlada (pentesting asistido), y threat model documentado como artefacto vivo.

### **Preparación (antes de la clase)**

* Elegir un repo “demo” que pueda fallar sin riesgo (ideal: un proyecto de muestra o un servicio interno no crítico).  
* Tener listo un entorno reproducible:  
  * Docker funcionando  
  * Acceso a internet para instalar herramientas  
  * Variables de entorno no sensibles  
* Definir una regla clara: no se corre nada contra producción. Solo local o staging aislado.

---

## **Entregable del día 10: Reporte de seguridad del producto**

Formato breve, orientado a ejecución, compatible con revisión por pares.

1. **Resumen ejecutivo**  
   Top 5 riesgos, impacto y prioridad.  
2. **Arquitectura y superficies**  
   Mapa de superficies (8 categorías) y activos críticos.  
4. **Controles implementados**  
   Prevención, detección, respuesta.  
   Controles de IA: prompt injection, output handling, agency, RAG, consumo.  
5. **Hallazgos**  
   Tabla: hallazgo, severidad, evidencia, fix, verificación.  
6. **Roadmap**  
   Quick wins (1 a 2 días), mediano plazo (1 a 2 semanas), estructural (más de 1 mes).

---

## **Mensajes finales para fijar la sesión**

* “Production-hardened” es una combinación de controles técnicos (prevención), observabilidad (detección) y capacidad operativa (respuesta y recuperación).  
* En sistemas con LLMs y agentes, el perímetro real incluye contexto, herramientas, memoria, identidad y supply chain de componentes agenciales.  
* La meta práctica de este día es convertir riesgos en tareas verificables y dejar evidencia, no solo intenciones.

