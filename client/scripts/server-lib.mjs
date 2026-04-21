import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

async function resolveRequestPath(rootDir, requestPath) {
  const sanitizedPath = decodeURIComponent(requestPath.split("?")[0] || "/");
  const rawTarget = sanitizedPath === "/" ? "/index.html" : sanitizedPath;
  const absolutePath = path.resolve(rootDir, `.${rawTarget}`);

  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }

  try {
    const stats = await fs.stat(absolutePath);

    if (stats.isDirectory()) {
      return path.join(absolutePath, "index.html");
    }

    return absolutePath;
  } catch {
    if (!path.extname(absolutePath)) {
      return path.join(rootDir, "index.html");
    }

    return absolutePath;
  }
}

export function startStaticServer({
  rootDir,
  host = "127.0.0.1",
  port = 5173,
  logPrefix = "[server]"
}) {
  const server = http.createServer(async (request, response) => {
    const filePath = await resolveRequestPath(rootDir, request.url || "/");

    if (!filePath) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    try {
      const file = await fs.readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();

      response.writeHead(200, {
        "Cache-Control": "no-cache",
        "Content-Type":
          MIME_TYPES[extension] || "application/octet-stream"
      });
      response.end(file);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found");
    }
  });

  return new Promise((resolve, reject) => {
    const tryListen = (currentPort, attemptsLeft) => {
      const handleError = (error) => {
        server.removeListener("listening", handleListening);

        if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
          tryListen(currentPort + 1, attemptsLeft - 1);
          return;
        }

        reject(error);
      };

      const handleListening = () => {
        server.removeListener("error", handleError);
        const url = `http://${host}:${currentPort}`;
        console.log(`${logPrefix} sirviendo ${rootDir}`);
        console.log(`${logPrefix} abre ${url}`);
        resolve({ server, url });
      };

      server.once("error", handleError);
      server.once("listening", handleListening);
      server.listen(currentPort, host);
    };

    tryListen(port, 10);
  });
}
