import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const builderBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "electron-builder.cmd" : "electron-builder");
const cacheDir = path.join(root, ".electron-builder-cache");

const child = spawn(builderBin, process.argv.slice(2), {
  cwd: root,
  env: {
    ...process.env,
    ELECTRON_CACHE: path.join(cacheDir, "electron"),
    ELECTRON_BUILDER_CACHE: path.join(cacheDir, "builder")
  },
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
