import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const imageGen = "/Users/magos/dev/TribuIA/Hardcore/.agents/skills/imagegen/scripts/image_gen.py";
const ids = process.argv.slice(2);
const slideIds = ids.length ? ids : Array.from({ length: 14 }, (_, i) => String(i + 1).padStart(2, "0"));
const concurrency = 3;

const originals = {
  "03": "slide-2.png",
  "04": "slide-4.png",
  "05": "slide-4.png",
  "06": "slide-5.png",
  "07": "slide-5.png",
  "08": "slide-6.png",
  "09": "slide-6.png",
  "10": "slide-7.png",
  "11": "slide-7.png",
  "12": "slide-7.png"
};

let active = 0;
let index = 0;
let failed = false;

function next() {
  while (active < concurrency && index < slideIds.length) {
    run(slideIds[index++]);
  }
  if (active === 0 && index >= slideIds.length) process.exit(failed ? 1 : 0);
}

function run(id) {
  active += 1;
  const out = join(root, "renders-v2", `slide-${id}.png`);
  const args = [
    "run", "--with", "openai", "--with", "pillow", "python", imageGen, "edit",
    "--model", "gpt-image-2",
    "--quality", "high",
    "--size", "1280x720",
    "--image", join(root, "source-renders", `slide-${id}.png`),
    "--image", join(root, "..", "assets", "infographics", "contact-sheet.png")
  ];

  if (originals[id]) {
    args.push("--image", join(root, "..", "assets", "infographics", originals[id]));
  }

  args.push(
    "--prompt-file", join(root, "prompts-v2", `slide-${id}.txt`),
    "--out", out,
    "--force"
  );

  if (!existsSync(join(root, "source-renders", `slide-${id}.png`))) {
    console.error(`missing source render for slide-${id}`);
    failed = true;
    active -= 1;
    next();
    return;
  }

  console.log(`rendering v2 slide-${id}`);
  const child = spawn("uv", args, { stdio: "inherit" });
  child.on("exit", (code) => {
    if (code !== 0) failed = true;
    active -= 1;
    next();
  });
}

next();
