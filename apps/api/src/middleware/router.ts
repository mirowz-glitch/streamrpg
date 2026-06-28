import type { IncomingMessage, ServerResponse } from "node:http";
import type { AuthContext } from "../middleware/auth.js";

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: AuthContext,
  params: Record<string, string>,
) => void | Promise<void>;

export interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export function route(method: string, path: string, handler: RouteHandler): Route {
  const paramNames: string[] = [];
  const patternStr = path.replace(/:([a-zA-Z_]+)/g, (_, name: string) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  return {
    method: method.toUpperCase(),
    pattern: new RegExp(`^${patternStr}$`),
    paramNames,
    handler,
  };
}

export function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function matchRoute(routes: Route[], method: string, pathname: string) {
  for (const r of routes) {
    if (r.method !== method.toUpperCase()) continue;
    const match = pathname.match(r.pattern);
    if (!match) continue;
    const params: Record<string, string> = {};
    r.paramNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });
    return { route: r, params };
  }
  return null;
}
