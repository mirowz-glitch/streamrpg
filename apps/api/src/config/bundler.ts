import { createReadStream, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import * as esbuild from "esbuild";

const WEB_ROOT = resolve(process.cwd(), "apps/web");
const WEB_SRC = resolve(WEB_ROOT, "src/main.tsx");
const WEB_DIST = resolve(WEB_ROOT, "dist");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

let buildDone = false;

export async function buildWebOnce(): Promise<void> {
  if (buildDone) return;
  console.log("DEBUG cwd:", process.cwd());
  console.log("DEBUG WEB_SRC:", WEB_SRC);
  console.log("DEBUG WEB_DIST:", WEB_DIST);
  await esbuild.build({
    entryPoints: [WEB_SRC],
    bundle: true,
    outfile: resolve(WEB_DIST, "main.js"),
    format: "esm",
    jsx: "automatic",
    loader: { ".tsx": "tsx", ".ts": "ts" },
    sourcemap: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
    },
  });
  buildDone = true;
  console.log("Web bundle built successfully");
  console.log("DEBUG main.js exists after build:", existsSync(resolve(WEB_DIST, "main.js")));
}

function isSpaRoute(url: string): boolean {
  return (
    url === "/" ||
    url.startsWith("/app") ||
    url.startsWith("/login") ||
    url.startsWith("/overlay") ||
    url.startsWith("/auth")
  );
}

export async function handleStatic(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const url = req.url?.split("?")[0] ?? "/";

  if (url === "/styles.css") {
    const cssPath = resolve(WEB_ROOT, "styles.css");
    if (existsSync(cssPath)) {
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      createReadStream(cssPath).pipe(res);
      return true;
    }
  }

  if (url === "/main.js" || url.endsWith(".js.map")) {
    const filePath = url === "/main.js" ? resolve(WEB_DIST, "main.js") : resolve(WEB_DIST, url.slice(1));
    console.log("DEBUG requesting main.js, filePath:", filePath, "exists:", existsSync(filePath));
    if (existsSync(filePath)) {
      const ext = filePath.slice(filePath.lastIndexOf("."));
      res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
      createReadStream(filePath).pipe(res);
      return true;
    }
  }

  if (isSpaRoute(url)) {
    const htmlPath = resolve(WEB_ROOT, "index.html");
    if (existsSync(htmlPath)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      createReadStream(htmlPath).pipe(res);
      return true;
    }
  }

  return false;
}
