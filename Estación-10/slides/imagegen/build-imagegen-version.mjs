import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const assetDir = join(root, "assets");
const slideDir = join(root, "slides");

for (const dir of [assetDir, slideDir]) mkdirSync(dir, { recursive: true });

const slides = [
  {
    id: "01",
    kind: "cover",
    eyebrow: "ESTACIÓN 10",
    title: "Ciberseguridad",
    subtitle: "De POC funcional a pentesting asistido con Shannon",
    visual: `
      <div class="cover-map">
        <div class="ring ring-prod"><span>producción</span></div>
        <div class="ring ring-stage"><span>staging</span></div>
        <div class="ring ring-poc"><span>POC</span></div>
        <div class="pulse p1">exposición</div>
        <div class="pulse p2">valor</div>
        <div class="pulse p3">aceleración IA</div>
      </div>
      <p class="closing-line">Producción sube exposición y valor del objetivo; IA acelera el ritmo de cambio.</p>`
  },
  {
    id: "02",
    kind: "content",
    eyebrow: "MAPA DE LA SESIÓN",
    title: "Hoy aterrizamos seguridad en una demo ejecutable",
    visual: `
      <div class="act-map">
        ${act("01", "Riesgo", "Por qué producción cambia la presión.")}
        ${act("02", "Superficies", "Checklist, backlog y reporte.")}
        ${act("03", "OWASP", "Lenguaje común para decidir qué mirar.")}
        ${act("04", "Shannon", "Ejecución contra local o staging aislado.")}
      </div>
      <p class="keypoint">La clase termina con evidencia: hallazgos, PoCs, fixes o tareas verificables.</p>`
  },
  {
    id: "03",
    kind: "diagram",
    eyebrow: "DE POC A PRODUCCIÓN",
    title: "La presión cambia cuando el sistema sale al mundo",
    visual: `
      <div class="timeline pressure">
        ${stage("POC funcional", "Funciona para demostrar valor.", "low")}
        ${stage("Exposición real", "Usuarios, edge, datos y terceros.", "mid")}
        ${stage("Controles mínimos", "Auth, logs, límites, recovery.", "mid")}
        ${stage("Producción endurecida", "Riesgo convertido en trabajo verificable.", "high")}
      </div>
      <p class="keypoint">El objetivo no es más seguridad; es reducir rutas de impacto irreversible.</p>`
  },
  {
    id: "04",
    kind: "content",
    eyebrow: "ÍNDICE OPERATIVO",
    title: "Las superficies ordenan la conversación",
    visual: `
      <div class="hub-grid">
        <div class="hub">superficies<br><span>de riesgo</span></div>
        ${chip("Checklist", "Qué puede fallar.", "primary")}
        ${chip("Backlog", "Qué necesita owner, fix y validación.", "")}
        ${chip("Reporte", "Dónde queda evidencia y riesgo residual.", "")}
        ${chip("Scope de demo", "Qué tocará Shannon y qué queda fuera.", "primary")}
      </div>`
  },
  {
    id: "05",
    kind: "diagram",
    eyebrow: "PRIORIZACIÓN",
    title: "Empieza por impacto irreversible y amplificación por IA",
    visual: `
      <div class="matrix">
        <div class="axis y">impacto irreversible</div>
        <div class="axis x">amplificación por IA</div>
        ${cell("Exfiltración", "Datos salen del control del equipo.", "hot")}
        ${cell("RCE", "Código ejecutado fuera del diseño.", "hot")}
        ${cell("Privilegios", "Permisos escalan o se heredan mal.", "warm")}
        ${cell("Destrucción", "Pérdida de datos o continuidad.", "hot")}
        ${cell("Agencia", "El sistema actúa con herramientas.", "agent")}
        ${cell("Contexto", "Memoria y prompts amplifican el fallo.", "agent")}
      </div>
      <p class="keypoint">La prioridad sube cuando una falla puede actuar, escalar o persistir.</p>`
  },
  {
    id: "06",
    kind: "content",
    eyebrow: "TAXONOMÍAS",
    title: "OWASP ayuda a nombrar el riesgo y diseñar pruebas",
    visual: `
      <div class="taxonomy">
        ${column("Web", ["app", "API", "auth", "config", "logging", "supply chain"])}
        ${column("LLM", ["instrucciones", "datos", "output handling", "agency", "consumo"])}
        ${column("Agentic", ["herramientas", "identidad", "memoria", "contexto", "canales"])}
      </div>
      <p class="keypoint">Cada hallazgo debe quedar ligado a una categoría y a una verificación.</p>`
  },
  {
    id: "07",
    kind: "diagram",
    eyebrow: "WEB · LLM · AGENTIC",
    title: "Tres capas, un mismo lenguaje de riesgo",
    visual: `
      <div class="layer-stack">
        ${layer("Aplicación y API", "controles base, auth, datos, errores")}
        ${layer("Sistema LLM", "prompts, contexto, output handling")}
        ${layer("Agentes y herramientas", "identidad, permisos, side effects", "demo")}
      </div>
      <p class="keypoint">Las categorías cambian; la disciplina es la misma: evidencia, fix, verificación.</p>`
  },
  {
    id: "08",
    kind: "content",
    eyebrow: "HARDENING",
    title: "Los controles definen qué puede hacer el agente",
    visual: `
      <div class="control-loop">
        ${control("Prevención", "Reducir rutas de abuso antes de exponer el sistema.")}
        ${control("Detección", "Logs y alertas para saber qué pasó.")}
        ${control("Respuesta", "Triage, contención y recuperación.")}
        ${control("Guardrails", "Permisos mínimos, credenciales separadas y aprobación para side effects altos.", "demo")}
      </div>`
  },
  {
    id: "09",
    kind: "diagram",
    eyebrow: "CONTROLES",
    title: "De POC a producción: prevenir, detectar, recuperar, limitar",
    visual: `
      <div class="lanes">
        ${lane("Prevenir", "Auth como política, input validation, hardening runtime, supply chain.")}
        ${lane("Detectar", "Logs útiles, trazabilidad, alertas accionables.")}
        ${lane("Recuperar", "IR básico, continuidad, evidencias y ejercicios.")}
        ${lane("Limitar agencia", "Tool allowlists, scopes mínimos, sandbox y aprobación humana.", "demo")}
      </div>`
  },
  {
    id: "10",
    kind: "diagram",
    eyebrow: "IA APLICADA A SEGURIDAD",
    title: "La automatización acelera el ciclo, no reemplaza el criterio",
    visual: `
      <div class="pipeline">
        ${node("Código", "repo")}
        ${node("Superficie", "mapa")}
        ${node("Prueba", "Shannon", "demo")}
        ${node("Evidencia", "PoC")}
        ${node("Backlog", "owner + fix")}
      </div>
      <p class="keypoint">Los agentes aceleran análisis y repetición; el equipo decide severidad y cierre.</p>`
  },
  {
    id: "11",
    kind: "demo",
    eyebrow: "DEMO",
    title: "Shannon prueba explotabilidad con conocimiento del código",
    visual: `
      <div class="shannon-flow">
        <div class="input-pair">${pill("repo fuente")} ${pill("URL app viva")}</div>
        <div class="engine">Shannon<br><span>white-box + explotación dinámica</span></div>
        <div class="output-pair">${pill("PoC reproducible")} ${pill("hallazgo accionable")}</div>
      </div>
      <p class="keypoint demo-point">Es activo: solo local o staging aislado.</p>`
  },
  {
    id: "12",
    kind: "demo",
    eyebrow: "SHANNON HARDENING SPRINT",
    title: "Del repo a un hallazgo accionable",
    visual: `
      <pre class="terminal">npx @keygraph/shannon setup
npx @keygraph/shannon start -u http://localhost:3000 -r /path/to/repo</pre>
      <div class="runbook">
        ${step("01", "Target aislado")}
        ${step("02", "Scope explícito", "demo")}
        ${step("03", "PoC e impacto")}
        ${step("04", "Fix verificable")}
      </div>`
  },
  {
    id: "13",
    kind: "content",
    eyebrow: "DECISIÓN TÉCNICA",
    title: "Un hallazgo sirve cuando cambia el backlog",
    visual: `
      <div class="questions">
        ${question("¿Hay PoC funcional?")}
        ${question("Qué activo o permiso queda comprometido?")}
        ${question("Qué categoría OWASP describe el fallo?")}
        ${question("Qué test o comando comprueba el fix?")}
        ${question("Qué guardrail habría limitado el daño?")}
      </div>
      <p class="keypoint">Decisión humana: severidad, owner, fix, verificación y cierre.</p>`
  },
  {
    id: "14",
    kind: "task",
    eyebrow: "TAREA",
    title: "Reporte de seguridad del producto",
    visual: `
      <div class="report">
        ${check("Top 5 riesgos: impacto, evidencia y prioridad.")}
        ${check("Mapa de superficies: qué se revisó y qué queda fuera.")}
        ${check("Hallazgos: severidad, PoC, fix y verificación.")}
        ${check("Controles: prevención, detección, respuesta y guardrails agenciales.")}
        ${check("Roadmap: quick wins, mediano plazo y cambios estructurales.")}
      </div>
      <p class="closing-box">Seguridad madura cuando el riesgo termina en evidencia y trabajo verificable.</p>`
  }
];

function act(num, label, text) {
  return `<div class="act"><strong>${num}</strong><span>${label}</span><p>${text}</p></div>`;
}

function stage(label, text, level) {
  return `<div class="stage ${level}"><strong>${label}</strong><span>${text}</span></div>`;
}

function chip(label, text, tone) {
  return `<div class="chip ${tone}"><strong>${label}</strong><span>${text}</span></div>`;
}

function cell(label, text, tone) {
  return `<div class="cell ${tone}"><strong>${label}</strong><span>${text}</span></div>`;
}

function column(label, items) {
  return `<div class="tax-col"><strong>${label}</strong>${items.map((item) => `<span>${item}</span>`).join("")}</div>`;
}

function layer(label, text, tone = "") {
  return `<div class="layer ${tone}"><strong>${label}</strong><span>${text}</span></div>`;
}

function control(label, text, tone = "") {
  return `<div class="control ${tone}"><strong>${label}</strong><span>${text}</span></div>`;
}

function lane(label, text, tone = "") {
  return `<div class="lane ${tone}"><strong>${label}</strong><span>${text}</span></div>`;
}

function node(label, text, tone = "") {
  return `<div class="node ${tone}"><strong>${label}</strong><span>${text}</span></div>`;
}

function pill(text) {
  return `<span class="pill">${text}</span>`;
}

function step(num, text, tone = "") {
  return `<div class="run-step ${tone}"><strong>${num}</strong><span>${text}</span></div>`;
}

function question(text) {
  return `<div class="question"><span>?</span><strong>${text}</strong></div>`;
}

function check(text) {
  return `<div class="check"><span></span><strong>${text}</strong></div>`;
}

function html(strings, ...values) {
  return String.raw({ raw: strings }, ...values);
}

function section(slide) {
  return html`<section id="slide-${slide.id}" class="slide ${slide.kind}" aria-label="Slide ${slide.id} ${slide.title}">
  <div class="topbar" aria-hidden="true"></div>
  <header>
    <p class="eyebrow">${slide.eyebrow}</p>
    <h1>${slide.title}</h1>
    ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}
  </header>
  <div class="visual">${slide.visual}</div>
  <footer><span>Hardcore AI by 30X · Estación 10</span><span>${slide.id}</span></footer>
</section>`;
}

function page(slide) {
  return html`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Estación 10 - Slide ${slide.id}</title>
  <link rel="stylesheet" href="../assets/imagegen.css">
</head>
<body class="single">
${section(slide)}
</body>
</html>
`;
}

function deck() {
  return html`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Estación 10 - version imagegen HTML</title>
  <link rel="stylesheet" href="assets/imagegen.css">
</head>
<body>
<main class="deck">
${slides.map(section).join("\n")}
</main>
</body>
</html>
`;
}

const css = html`:root {
  --primary: #C8E600;
  --on-primary: #1A1A1A;
  --background: #0A0A0A;
  --surface: #1A1A1A;
  --surface-raised: #262626;
  --separator: #2A2A2A;
  --text: #FFFFFF;
  --text-body: #E6E6E6;
  --text-muted: #A8A8A8;
  --text-faint: #606060;
  --keypoint-bg: #1F2A05;
  --negative: #FF4444;
  --demo: #FF8C00;
  --demo-bg: #3A1F00;
  --slide-w: 1280px;
  --slide-h: 720px;
  color-scheme: dark;
  font-family: Calibri, Aptos, Arial, sans-serif;
}
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; background: #050505; color: var(--text-body); font-family: Calibri, Aptos, Arial, sans-serif; }
body.single { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.deck { display: grid; justify-items: center; gap: 32px; padding: 32px; }
.slide {
  position: relative;
  width: var(--slide-w);
  height: var(--slide-h);
  overflow: hidden;
  padding: 42px 60px 54px;
  background: var(--background);
  border: 1px solid var(--separator);
  border-radius: 0;
  box-shadow: 0 22px 64px rgba(0,0,0,.42);
}
.slide::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: .35;
  pointer-events: none;
}
.topbar { position: absolute; top: 34px; left: 60px; width: 88px; height: 5px; background: var(--primary); }
header, .visual, footer { position: relative; z-index: 1; }
header { max-width: 1120px; }
.eyebrow { margin: 17px 0 16px; color: var(--primary); font-size: 15px; font-weight: 700; line-height: 1.15; letter-spacing: .06em; text-transform: uppercase; }
h1, p { margin: 0; letter-spacing: 0; }
h1 { color: var(--text); font-size: 42px; font-weight: 700; line-height: 1.12; text-wrap: balance; }
.cover h1 { max-width: 680px; font-size: 72px; line-height: .98; }
.subtitle { max-width: 720px; margin-top: 17px; color: var(--text-body); font-size: 24px; line-height: 1.3; }
.visual { margin-top: 28px; }
.cover .visual { position: absolute; inset: 142px 60px 72px; margin: 0; }
.cover header { position: absolute; left: 60px; top: 270px; width: 680px; }
.cover .topbar { top: 250px; }
footer { position: absolute; left: 60px; right: 60px; bottom: 26px; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,.1); padding-top: 10px; color: var(--text-faint); font-size: 12px; line-height: 1.2; }
.cover-map { position: absolute; right: 10px; top: 0; width: 520px; height: 420px; }
.ring { position: absolute; inset: 0; border: 2px solid rgba(200,230,0,.18); border-radius: 50%; display: grid; place-items: center; color: var(--text-muted); font-size: 15px; text-transform: uppercase; letter-spacing: .06em; }
.ring-stage { inset: 74px; border-color: rgba(200,230,0,.34); }
.ring-poc { inset: 156px; border-color: rgba(200,230,0,.68); color: var(--primary); font-weight: 700; }
.pulse { position: absolute; padding: 9px 11px; background: var(--surface); border: 1px solid rgba(200,230,0,.3); color: var(--text); border-radius: 4px; font-size: 18px; }
.p1 { right: 12px; top: 70px; } .p2 { left: 58px; top: 122px; } .p3 { right: 76px; bottom: 64px; }
.closing-line { position: absolute; left: 0; bottom: 0; max-width: 580px; padding: 16px 18px; background: var(--keypoint-bg); border: 1px solid rgba(200,230,0,.25); border-radius: 4px; color: var(--text); font-size: 21px; line-height: 1.28; }
.act-map { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.act, .stage, .chip, .cell, .tax-col, .layer, .control, .lane, .node, .run-step, .question, .check, .terminal, .engine, .closing-box {
  background: rgba(26,26,26,.94);
  border: 1px solid var(--separator);
  border-radius: 4px;
}
.act { min-height: 250px; padding: 20px 16px; display: grid; align-content: start; gap: 14px; }
.act strong, .run-step strong { color: var(--primary); font-size: 38px; line-height: .9; }
.act span { color: var(--text); font-size: 24px; font-weight: 700; }
.act p, .stage span, .chip span, .cell span, .layer span, .control span, .lane span, .node span { color: var(--text-body); font-size: 18px; line-height: 1.28; }
.keypoint { margin-top: 20px; padding: 16px 18px; background: var(--keypoint-bg); border: 1px solid rgba(200,230,0,.28); border-radius: 4px; color: var(--text); font-size: 20px; line-height: 1.3; }
.timeline { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; margin-top: 22px; border-top: 2px solid rgba(200,230,0,.45); }
.stage { position: relative; min-height: 244px; margin-top: 28px; padding: 18px; border-radius: 0; border-right: 0; }
.stage:last-child { border-right: 1px solid var(--separator); }
.stage::before { content: ""; position: absolute; top: -38px; left: 18px; width: 17px; height: 17px; background: var(--primary); border-radius: 50%; }
.stage strong, .chip strong, .cell strong, .tax-col strong, .layer strong, .control strong, .lane strong, .node strong, .question strong, .check strong { display: block; color: var(--text); font-size: 22px; line-height: 1.08; margin-bottom: 10px; }
.stage.high { background: var(--keypoint-bg); border-color: rgba(200,230,0,.32); }
.hub-grid { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 280px; min-height: 360px; align-content: center; }
.hub { position: absolute; left: 50%; top: 50%; width: 230px; height: 230px; transform: translate(-50%, -50%); border-radius: 50%; border: 2px solid rgba(200,230,0,.5); display: grid; place-items: center; text-align: center; color: var(--primary); font-size: 30px; font-weight: 700; line-height: 1.05; }
.hub span { color: var(--text-body); font-size: 19px; font-weight: 400; }
.chip { min-height: 122px; padding: 18px; }
.chip.primary, .cell.agent, .layer.demo, .control.demo, .lane.demo, .node.demo, .run-step.demo { background: var(--keypoint-bg); border-color: rgba(200,230,0,.32); }
.matrix { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; position: relative; padding: 42px 0 0 48px; }
.axis { position: absolute; color: var(--primary); font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.axis.y { left: 0; top: 120px; writing-mode: vertical-rl; transform: rotate(180deg); }
.axis.x { left: 48px; top: 10px; }
.cell { min-height: 122px; padding: 16px; }
.cell.hot { border-color: rgba(255,68,68,.38); }
.cell.warm { border-color: rgba(255,140,0,.42); }
.taxonomy { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.tax-col { min-height: 286px; padding: 20px; }
.tax-col strong { color: var(--primary); font-size: 26px; }
.tax-col span { display: block; padding: 9px 0; border-top: 1px solid var(--separator); color: var(--text-body); font-size: 20px; }
.layer-stack { display: grid; gap: 14px; margin-top: 14px; }
.layer { min-height: 92px; padding: 20px 24px; display: grid; grid-template-columns: 300px 1fr; align-items: center; }
.layer strong { margin: 0; color: var(--primary); }
.control-loop { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }
.control { min-height: 150px; padding: 20px; }
.lanes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.lane { min-height: 298px; padding: 20px; }
.pipeline, .runbook { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
.node { position: relative; min-height: 158px; padding: 18px; display: grid; align-content: center; text-align: center; }
.node + .node::before { content: ""; position: absolute; left: -14px; top: 50%; width: 14px; height: 2px; background: var(--primary); }
.shannon-flow { display: grid; grid-template-columns: 1fr 280px 1fr; gap: 18px; align-items: center; min-height: 272px; }
.input-pair, .output-pair { display: grid; gap: 14px; }
.pill { display: block; padding: 17px 18px; background: var(--surface); border: 1px solid var(--separator); border-radius: 4px; color: var(--text); font-size: 21px; }
.engine { min-height: 210px; display: grid; place-items: center; text-align: center; color: var(--primary); font-size: 34px; font-weight: 700; line-height: 1.08; border-color: rgba(255,140,0,.42); background: var(--demo-bg); }
.engine span { color: var(--text-body); font-size: 17px; font-weight: 400; max-width: 210px; }
.demo-point { background: var(--demo-bg); border-color: rgba(255,140,0,.42); }
.terminal { padding: 18px 20px; background: #050505; color: var(--text); font-family: SFMono-Regular, Consolas, Liberation Mono, monospace; font-size: 22px; line-height: 1.45; white-space: pre-wrap; }
.runbook { grid-template-columns: repeat(4, minmax(0,1fr)); margin-top: 16px; }
.run-step { min-height: 116px; padding: 18px; display: grid; align-content: center; }
.run-step span { color: var(--text); font-size: 21px; font-weight: 700; }
.questions { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
.question { min-height: 104px; display: grid; grid-template-columns: 48px 1fr; gap: 12px; align-items: center; padding: 16px; }
.question span { width: 38px; height: 38px; display: grid; place-items: center; background: var(--primary); color: var(--on-primary); border-radius: 4px; font-size: 24px; font-weight: 700; }
.report { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
.check { min-height: 84px; display: flex; align-items: flex-start; gap: 12px; padding: 16px; }
.check span { width: 15px; height: 15px; margin-top: 4px; border: 2px solid var(--primary); border-radius: 3px; flex: 0 0 auto; }
.check strong { font-size: 19px; font-weight: 400; line-height: 1.22; }
.closing-box { margin-top: 14px; padding: 18px 20px; color: var(--text); font-size: 24px; line-height: 1.24; background: var(--keypoint-bg); border-color: rgba(200,230,0,.28); }
.render-slide { width: var(--slide-w); height: var(--slide-h); background: var(--background); border: 1px solid var(--separator); box-shadow: 0 22px 64px rgba(0,0,0,.42); }
.render-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
@media print {
  @page { size: 13.333in 7.5in; margin: 0; }
  body { background: var(--background); }
  .deck { display: block; padding: 0; }
  .slide, .render-slide { width: 13.333in; height: 7.5in; margin: 0; border: 0; box-shadow: none; break-after: page; page-break-after: always; }
}`;

writeFileSync(join(assetDir, "imagegen.css"), css);
writeFileSync(join(root, "estacion10-imagegen-source-deck.html"), deck());
for (const slide of slides) {
  writeFileSync(join(slideDir, `slide-${slide.id}.html`), page(slide));
}

console.log(`Generated ${slides.length} imagegen slide HTML files in ${root}`);
