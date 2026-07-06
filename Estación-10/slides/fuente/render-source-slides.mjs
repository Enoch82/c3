import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleRoot = process.env.NODE_PATH?.split(":").find(Boolean);
const require = createRequire(moduleRoot ? join(moduleRoot, "require.js") : import.meta.url);
const { chromium } = require("playwright");

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "source-renders");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });

for (let i = 1; i <= 14; i += 1) {
  const id = String(i).padStart(2, "0");
  const url = pathToFileURL(resolve(root, "slides", `slide-${id}.html`)).href;
  await page.goto(url, { waitUntil: "networkidle" });
  const slide = page.locator(".slide");
  await slide.screenshot({ path: join(outDir, `slide-${id}.png`) });
}

await browser.close();
console.log(`Rendered source screenshots to ${outDir}`);
