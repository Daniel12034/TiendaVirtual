import path from "node:path";
import { fileURLToPath } from "node:url";
import { startStaticServer } from "./server-lib.mjs";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");
const port = Number(process.env.PORT || 4173);

async function main() {
  await startStaticServer({
    rootDir: projectRoot,
    port,
    logPrefix: "[start]"
  });
}

main().catch((error) => {
  console.error("[start] No se pudo iniciar el servidor:", error);
  process.exit(1);
});
