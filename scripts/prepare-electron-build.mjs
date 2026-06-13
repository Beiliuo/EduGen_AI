import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const standaloneDir = path.join(root, ".next", "standalone");
const staticSource = path.join(root, ".next", "static");
const staticTarget = path.join(standaloneDir, ".next", "static");
const publicSource = path.join(root, "public");
const publicTarget = path.join(standaloneDir, "public");

if (!existsSync(standaloneDir)) {
  throw new Error("缺少 .next/standalone。请先运行 next build，并确认 next.config.mjs 已启用 output: \"standalone\"。");
}

if (existsSync(staticSource)) {
  await rm(staticTarget, { recursive: true, force: true });
  await mkdir(path.dirname(staticTarget), { recursive: true });
  await cp(staticSource, staticTarget, { recursive: true });
}

if (existsSync(publicSource)) {
  await rm(publicTarget, { recursive: true, force: true });
  await cp(publicSource, publicTarget, { recursive: true });
}

console.log("Electron build resources prepared.");
