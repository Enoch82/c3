# Slides: Estación 10

> Storyboard compacto para una presentación HTML editable y PDF. Combina slides nuevos en HTML con infográficos exportados desde `estacion10-infographics.pdf`.

---

## 1. Cover

**Tipo:** cover  
**Eyebrow:** ESTACIÓN 10  
**Título:** Ciberseguridad  
**Subtítulo:** De POC funcional a pentesting asistido con Shannon  
**Nota:** Abrir con el cambio de presión: producción aumenta exposición, valor del objetivo y velocidad de cambio.

---

## 2. Clase en cuatro actos

**Tipo:** content  
**Eyebrow:** MAPA DE LA SESIÓN  
**Título:** Hoy aterrizamos seguridad en una demo ejecutable

1. Entender por qué producción cambia el riesgo.
2. Convertir superficies en checklist, backlog y reporte.
3. Usar OWASP y controles para decidir qué mirar.
4. Ejecutar Shannon contra un entorno local o staging aislado.

**Key point:** La clase termina con evidencia: hallazgos, PoCs, fixes o tareas verificables.

---

## 3. Infográfico: de POC a producción

**Tipo:** infographic  
**Imagen:** assets/infographics/slide-2.png  
**Nota:** Usar como mapa visual del viaje completo.

---

## 4. Cómo leer el mapa de riesgo

**Tipo:** content  
**Eyebrow:** ÍNDICE OPERATIVO  
**Título:** Las superficies ordenan la conversación

- Como checklist: qué puede fallar.
- Como backlog: qué necesita dueño, fix y validación.
- Como reporte: dónde queda evidencia y riesgo residual.
- Como scope de demo: qué tocará Shannon y qué queda fuera.

---

## 5. Infográfico: superficies y priorización

**Tipo:** infographic  
**Imagen:** assets/infographics/slide-4.png  
**Nota:** Enfatizar impacto irreversible y amplificación por IA.

---

## 6. OWASP como lenguaje común

**Tipo:** content  
**Eyebrow:** TAXONOMÍAS  
**Título:** OWASP ayuda a nombrar el riesgo y diseñar pruebas

- Web: aplicación, API, auth, configuración, logging y supply chain.
- LLM: instrucciones, datos, output handling, agency y consumo.
- Agentic: herramientas, identidad, memoria, contexto y canales entre agentes.
- En la demo, cada hallazgo debe quedar ligado a una categoría y a una verificación.

---

## 7. Infográfico: OWASP Web, LLM y Agentic

**Tipo:** infographic  
**Imagen:** assets/infographics/slide-5.png  
**Nota:** Leer de izquierda a derecha: app base, IA, agentes.

---

## 8. Controles antes de automatizar

**Tipo:** content  
**Eyebrow:** HARDENING  
**Título:** Los controles definen qué puede hacer el agente

- Prevención: reducir rutas de abuso antes de exponer el sistema.
- Detección: logs y alertas para saber qué pasó.
- Respuesta: triage, contención y recuperación.
- Guardrails: permisos mínimos, credenciales separadas y aprobación para side effects altos.

---

## 9. Infográfico: controles de POC a producción

**Tipo:** infographic  
**Imagen:** assets/infographics/slide-6.png  
**Nota:** Conectar prevención, detección, continuidad y agentes.

---

## 10. Infográfico: IA aplicada a seguridad

**Tipo:** infographic  
**Imagen:** assets/infographics/slide-7.png  
**Nota:** Shannon aparece aquí como ejemplo principal de pentesting asistido.

---

## 11. Shannon como demo principal

**Tipo:** content  
**Eyebrow:** DEMO  
**Título:** Shannon prueba explotabilidad con conocimiento del código

- Es white-box: necesita acceso al repo.
- Analiza código, mapea superficie y ejecuta exploits contra la app viva.
- Reporta hallazgos con PoC reproducible.
- Es activo: puede crear usuarios, cambiar datos o disparar side effects.
- En clase se ejecuta solo contra local o staging aislado.

---

## 12. Runbook de demo

**Tipo:** diagram  
**Eyebrow:** SHANNON HARDENING SPRINT  
**Título:** Del repo a un hallazgo accionable

```bash
npx @keygraph/shannon setup
npx @keygraph/shannon start -u http://localhost:3000 -r /path/to/repo
```

1. Preparar target, datos sintéticos y credenciales de prueba.
2. Correr Shannon con scope explícito.
3. Revisar PoC, impacto y ruta de explotación.
4. Crear fix o tarea con verificación.

---

## 13. Triage durante el demo

**Tipo:** content  
**Eyebrow:** DECISIÓN TÉCNICA  
**Título:** Un hallazgo sirve cuando cambia el backlog

- ¿Hay PoC funcional?
- ¿Qué activo o permiso queda comprometido?
- ¿Qué categoría OWASP describe el fallo?
- ¿Qué test o comando comprueba el fix?
- ¿Qué guardrail habría limitado el daño?

**Key point:** Shannon acelera la búsqueda; el equipo decide severidad, owner y cierre.

---

## 14. Entregable y cierre

**Tipo:** task  
**Eyebrow:** TAREA  
**Título:** Reporte de seguridad del producto

- Top 5 riesgos: impacto, evidencia y prioridad.
- Mapa de superficies: qué se revisó y qué queda fuera.
- Hallazgos: severidad, PoC, fix y verificación.
- Controles: prevención, detección, respuesta y guardrails agenciales.
- Roadmap: quick wins, mediano plazo y cambios estructurales.

**Cierre:** Seguridad madura cuando el riesgo termina en evidencia y trabajo verificable.
