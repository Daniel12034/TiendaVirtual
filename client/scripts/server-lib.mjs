import http from "node:http";
import https from "node:https";
import { promises as fs } from "node:fs";
import path from "node:path";
import { URL } from "node:url";

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

function getApiProxyTarget() {
  return process.env.API_PROXY_TARGET || "http://127.0.0.1:1337";
}

function proxyApiRequest(request, response) {
  const targetBase = new URL(getApiProxyTarget());
  const requestUrl = new URL(request.url || "/", targetBase);
  const proxyTransport = requestUrl.protocol === "https:" ? https : http;
  const headers = { ...request.headers };

  delete headers.host;
  delete headers.connection;

  const proxyRequest = proxyTransport.request(
    requestUrl,
    {
      method: request.method,
      headers
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 502, {
        ...proxyResponse.headers
      });
      proxyResponse.pipe(response);
    }
  );

  proxyRequest.on("error", (error) => {
    console.error("[server] Error proxying API request:", error);
    if (!response.headersSent) {
      response.writeHead(502, {
        "Content-Type": "text/plain; charset=utf-8"
      });
    }
    response.end("Bad Gateway");
  });

  request.pipe(proxyRequest);
}

export function startStaticServer({
  rootDir,
  host = "127.0.0.1",
  port = 5173,
  logPrefix = "[server]"
}) {
  const server = http.createServer(async (request, response) => {
    const requestPath = request.url || "/";

    if (requestPath.startsWith("/api/")) {
      proxyApiRequest(request, response);
      return;
    }

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
