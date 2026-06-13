const { cpSync, existsSync, mkdirSync, rmSync } = require("node:fs");
const path = require("node:path");

exports.default = async function afterPack(context) {
  const projectRoot = context.packager.projectDir;
  const appOutDir = context.appOutDir;
  const standaloneDir = path.join(projectRoot, ".next", "standalone");
  const resourcesNextDir = path.join(appOutDir, "resources", "next");
  const sourceNodeModules = path.join(standaloneDir, "node_modules");
  const targetNodeModules = path.join(resourcesNextDir, "node_modules");

  if (!existsSync(sourceNodeModules)) {
    throw new Error(`Missing standalone node_modules: ${sourceNodeModules}`);
  }

  mkdirSync(resourcesNextDir, { recursive: true });
  rmSync(targetNodeModules, { recursive: true, force: true });
  cpSync(sourceNodeModules, targetNodeModules, { recursive: true });
};
