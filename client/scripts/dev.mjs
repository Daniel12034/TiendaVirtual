import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startStaticServer } from "./server-lib.mjs";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");
const tscEntrypoint = path.join(
  projectRoot,
  "node_modules",
  "typescript",
  "lib",
  "_tsc.js"
);
const port = Number(process.env.PORT || 5173);

function runInitialBuild() {
  const result = spawnSync(
    process.execPath,
    [tscEntrypoint, "-p", "tsconfig.json"],
    {
      cwd: projectRoot,
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function main() {
  runInitialBuild();

  const watcher = spawn(
    process.execPath,
    [tscEntrypoint, "-w", "-p", "tsconfig.json", "--preserveWatchOutput"],
    {
      cwd: projectRoot,
      stdio: "inherit"
    }
  );

  const { server } = await startStaticServer({
    rootDir: projectRoot,
    port,
    logPrefix: "[dev]"
  });

  console.log("[dev] TypeScript en watch mode. Presiona Ctrl+C para detener.");

  const shutdown = () => {
    watcher.kill("SIGINT");
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  watcher.on("exit", (code) => {
    if (code && code !== 0) {
      server.close(() => process.exit(code));
    }
  });
}

main().catch((error) => {
  console.error("[dev] No se pudo iniciar el entorno:", error);
  process.exit(1);
});
