import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const promptDir = join(root, "prompts");
const renderDir = join(root, "renders");

mkdirSync(promptDir, { recursive: true });
mkdirSync(renderDir, { recursive: true });

const globalStyle = `Style direction: match the original Nano Banana infographics in referencias/infographics. Dense pedagogical cybersecurity infographic, not a presentation card UI. Use one dominant visual structure that fills 65-80% of the canvas: journey map, operating map, matrix, layered system, swimlane, funnel, threat map, or report board. Dark teal/black technical board, electric lime for priority and action, cyan for surfaces/system boundaries, orange for demo/risk/action, red only for negative impact. Use connected zones, arrows, grouped regions, small legends, labels, callouts, mini diagrams, and compact explanatory text. The result should teach by its spatial organization.`;
const hardAvoid = `Avoid: isolated card grid, four/five identical cards, big empty black areas, generic hacker background, decorative icons as the main content, stock photos, wallpaper, text floating over a background, purple gradients, glassmorphism, extra slogans, unreadable microtext, random padlocks.`;

const slides = [
  {
    id: "01",
    title: "Ciberseguridad",
    text: [
      "ESTACIÓN 10",
      "Ciberseguridad",
      "De POC funcional a pentesting asistido con Shannon",
      "Producción sube exposición y valor del objetivo; IA acelera el ritmo de cambio.",
      "POC", "staging", "producción", "exposición", "valor", "aceleración por IA"
    ],
    structure: "A maturity pressure map: concentric attack/exposure rings around POC, staging, and production. Show exposición and valor increasing as the environment moves toward production. Show aceleración por IA as an independent cross-cutting force outside the environment rings, affecting all stages rather than increasing from POC to production. Make it feel like an operating-room security map, not a title slide."
  },
  {
    id: "02",
    title: "Hoy aterrizamos seguridad en una demo ejecutable",
    text: [
      "MAPA DE LA SESIÓN",
      "Hoy aterrizamos seguridad en una demo ejecutable",
      "1 Riesgo: por qué producción cambia la presión",
      "2 Superficies: checklist, backlog y reporte",
      "3 OWASP: lenguaje común para decidir qué mirar",
      "4 Shannon: local o staging aislado",
      "La clase termina con evidencia: hallazgos, PoCs, fixes o tareas verificables."
    ],
    structure: "A four-act operating route from context/risk pressure to demo evidence. Use a connected route, small legend, left context column, central path, and right evidence output zone."
  },
  {
    id: "03",
    title: "La presión cambia cuando el sistema sale al mundo",
    original: "slide-2.png",
    text: [
      "DE POC A PRODUCCIÓN",
      "La presión cambia cuando el sistema sale al mundo",
      "POC funcional", "Exposición real", "Controles mínimos", "Producción endurecida",
      "El objetivo no es más seguridad; es reducir rutas de impacto irreversible."
    ],
    structure: "A resilience journey curve inspired by the original slide-2 infographic: POC launch point, risk evaluation, controls layer, production-hardened destination, with arrows and maturity phases."
  },
  {
    id: "04",
    title: "Las superficies ordenan la conversación",
    original: "slide-4.png",
    text: [
      "ÍNDICE OPERATIVO",
      "Las superficies ordenan la conversación",
      "Checklist: qué puede fallar",
      "Backlog: qué necesita owner, fix y validación",
      "Reporte: dónde queda evidencia y riesgo residual",
      "Scope de demo: qué tocará Shannon y qué queda fuera"
    ],
    structure: "A surface-risk map like original slide-4: central title band, eight compact surface zones, and a bottom band showing checklist -> backlog -> reporte -> scope. Do not make four cards."
  },
  {
    id: "05",
    title: "Empieza por impacto irreversible y amplificación por IA",
    original: "slide-4.png",
    text: [
      "PRIORIZACIÓN",
      "Empieza por impacto irreversible y amplificación por IA",
      "Impacto irreversible: exfiltración, RCE, privilegios, destrucción",
      "Amplificación por IA: agencia, herramientas, contexto, supply chain",
      "La prioridad sube cuando una falla puede actuar, escalar o persistir."
    ],
    structure: "A two-axis priority heatmap with clustered threats, not six boxes. Use an orange/red impact axis and lime AI amplification axis, with a clear 'empezar aquí' zone."
  },
  {
    id: "06",
    title: "OWASP ayuda a nombrar el riesgo y diseñar pruebas",
    original: "slide-5.png",
    text: [
      "TAXONOMÍAS",
      "OWASP ayuda a nombrar el riesgo y diseñar pruebas",
      "Web: app, API, auth, config, logging, supply chain",
      "LLM: instrucciones, datos, output handling, agency, consumo",
      "Agentic: herramientas, identidad, memoria, contexto, canales",
      "Cada hallazgo debe quedar ligado a una categoría y a una verificación."
    ],
    structure: "A taxonomy comparison board inspired by original slide-5, with three neutral vertical systems (Web, LLM, Agentic) and three color-coded horizontal rows. Strict color rule: Categorías row is lime/green, Pruebas row is cyan/blue, Verificación row is amber/orange. The legend must use exactly those same three row colors. Do not color Web, LLM, and Agentic columns differently; keep column frames neutral so color only means category/prueba/verificación. Add cross-links to the bottom rule: categoría -> prueba -> verificación."
  },
  {
    id: "07",
    title: "Tres capas, un mismo lenguaje de riesgo",
    original: "slide-5.png",
    text: [
      "WEB · LLM · AGENTIC",
      "Tres capas, un mismo lenguaje de riesgo",
      "Aplicación y API: controles base, auth, datos, errores",
      "Sistema LLM: prompts, contexto, output handling",
      "Agentes y herramientas: identidad, permisos, side effects",
      "Las categorías cambian; la disciplina es la misma: evidencia, fix, verificación."
    ],
    structure: "A layered architecture stack, with Web as foundation, LLM as reasoning/context layer, Agentic as tools/action layer. Show vertical dependency and risk propagation arrows."
  },
  {
    id: "08",
    title: "Los controles definen qué puede hacer el agente",
    original: "slide-6.png",
    text: [
      "HARDENING",
      "Los controles definen qué puede hacer el agente",
      "Prevención: reducir rutas de abuso antes de exponer el sistema",
      "Detección: logs y alertas para saber qué pasó",
      "Respuesta: triage, contención y recuperación",
      "Guardrails: permisos mínimos, credenciales separadas y aprobación para side effects altos"
    ],
    structure: "A control loop around an agent/tool execution core: prevention gates before action, detection sensors during action, response/recovery after action, guardrails enclosing the loop."
  },
  {
    id: "09",
    title: "De POC a producción: prevenir, detectar, recuperar, limitar",
    original: "slide-6.png",
    text: [
      "CONTROLES",
      "De POC a producción: prevenir, detectar, recuperar, limitar",
      "Prevenir: auth como política, input validation, hardening runtime, supply chain",
      "Detectar: logs útiles, trazabilidad, alertas accionables",
      "Recuperar: IR básico, continuidad, evidencias y ejercicios",
      "Limitar agencia: tool allowlists, scopes mínimos, sandbox y aprobación humana"
    ],
    structure: "A production hardening systems map inspired by original slide-6: left-to-right operational swimlane with prevention, detection/response, continuity, and agent limits connected to the production boundary."
  },
  {
    id: "10",
    title: "La automatización acelera el ciclo, no reemplaza el criterio",
    original: "slide-7.png",
    text: [
      "IA APLICADA A SEGURIDAD",
      "La automatización acelera el ciclo, no reemplaza el criterio",
      "Código", "Superficie", "Prueba", "Evidencia", "Backlog",
      "Los agentes aceleran análisis y repetición; el equipo decide severidad y cierre."
    ],
    structure: "A security automation flywheel inspired by original slide-7, not a straight card pipeline. Show code feeding surface mapping, testing, evidence, backlog, and returning as fixes."
  },
  {
    id: "11",
    title: "Shannon prueba explotabilidad con conocimiento del código",
    original: "slide-7.png",
    text: [
      "DEMO",
      "Shannon prueba explotabilidad con conocimiento del código",
      "repo fuente", "URL app viva", "Shannon", "white-box + explotación dinámica",
      "PoC reproducible", "hallazgo accionable",
      "Es activo: solo local o staging aislado."
    ],
    structure: "A white-box pentesting schematic: repo and running app enter Shannon as an active testing engine, then split into PoC and actionable finding, with a visible safety boundary around local/staging."
  },
  {
    id: "12",
    title: "Del repo a un hallazgo accionable",
    original: "slide-7.png",
    text: [
      "SHANNON HARDENING SPRINT",
      "Del repo a un hallazgo accionable",
      "npx @keygraph/shannon setup",
      "npx @keygraph/shannon start -u http://localhost:3000 -r /path/to/repo",
      "1 Target aislado", "2 Scope explícito", "3 PoC e impacto", "4 Fix verificable"
    ],
    structure: "A runbook infographic: command console as input, then a four-step sprint track with safety checkpoints and evidence output. Make the command readable but keep the diagram dominant."
  },
  {
    id: "13",
    title: "Un hallazgo sirve cuando cambia el backlog",
    text: [
      "DECISIÓN TÉCNICA",
      "Un hallazgo sirve cuando cambia el backlog",
      "¿Hay PoC funcional?",
      "¿Qué activo o permiso queda comprometido?",
      "¿Qué categoría OWASP describe el fallo?",
      "¿Qué test o comando comprueba el fix?",
      "¿Qué guardrail habría limitado el daño?",
      "Decisión humana: severidad, owner, fix, verificación y cierre."
    ],
    structure: "A triage decision tree flowing from PoC to impact to OWASP category to fix verification to guardrail. Use branching paths and a final backlog ticket output, not question cards."
  },
  {
    id: "14",
    title: "Reporte de seguridad del producto",
    text: [
      "TAREA",
      "Reporte de seguridad del producto",
      "Top 5 riesgos: impacto, evidencia y prioridad",
      "Mapa de superficies: qué se revisó y qué queda fuera",
      "Hallazgos: severidad, PoC, fix y verificación",
      "Controles: prevención, detección, respuesta y guardrails agenciales",
      "Roadmap: quick wins, mediano plazo y cambios estructurales",
      "Seguridad madura cuando el riesgo termina en evidencia y trabajo verificable."
    ],
    structure: "A final deliverable board: a report dossier assembled from five artifacts, with evidence flowing into roadmap. Use folders, evidence lanes, severity badges, and final 'verificable' outcome."
  }
];

function prompt(slide) {
  return `Use case: infographic-diagram
Asset type: 16:9 Spanish cybersecurity training slide
Input images: Image 1 is content reference only. Image 2 is the global Nano Banana style reference contact sheet. If Image 3 is provided, it is the closest original slide-specific style reference.
Primary request: Redesign slide ${slide.id}, "${slide.title}", as a true dense infographic in the style of the original Nano Banana images. ${slide.structure}
${globalStyle}
Text to render verbatim, preserving Spanish accents: "${slide.text.join(" | ")}"
Constraints: Keep all text readable. Preserve the content meaning, but do not preserve the card-grid composition from Image 1. Use smaller title area and a larger visual system. Make relationships visible with arrows, lanes, brackets, axes, zones, or route lines. Use icons only as secondary labels.
${hardAvoid}`;
}

function deck() {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Estación 10 - deck renderizado</title>
  <link rel="stylesheet" href="assets/deck.css">
</head>
<body>
<main class="deck rendered">
${slides.map((slide) => `<section class="render-slide" aria-label="Slide ${slide.id}"><img src="renders/slide-${slide.id}.png" alt="Slide ${slide.id}: ${slide.title}"></section>`).join("\n")}
</main>
</body>
</html>
`;
}

writeFileSync(join(root, "estacion10-rendered-deck.html"), deck());
writeFileSync(join(root, "prompts.md"), `# Prompts de generación

Direction: closer to the original Nano Banana infographics. These prompts explicitly avoid card grids and ask for dense operational diagrams.

References:
- Global style: \`referencias/infographics/contact-sheet.png\`
- Slide-specific originals when applicable: \`referencias/infographics/slide-2.png\`, \`slide-4.png\`, \`slide-5.png\`, \`slide-6.png\`, \`slide-7.png\`

${slides.map((slide) => `## Slide ${slide.id}: ${slide.title}

- Prompt: \`prompts/slide-${slide.id}.txt\`
- Final render: \`renders/slide-${slide.id}.png\`
- Closest original reference: ${slide.original ? `\`referencias/infographics/${slide.original}\`` : "global contact sheet only"}
`).join("\n")}
`);

for (const slide of slides) {
  writeFileSync(join(promptDir, `slide-${slide.id}.txt`), prompt(slide));
}

console.log(`Wrote ${slides.length} prompts.`);
