import { randomBytes } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { getDb, nowUnix } from "../config/database.js";

export interface AuthContext {
  profileId: string | null;
  sessionId: string | null;
}

const SESSION_COOKIE = "streamrpg_session";

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers.cookie ?? "";
  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) continue;
    cookies[rawKey] = decodeURIComponent(rest.join("="));
  }
  return cookies;
}

export function setSessionCookie(sessionId: string, maxAgeSec = 60 * 60 * 24 * 30): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function createSession(profileId: string): string {
  const id = randomBytes(32).toString("hex");
  const expiresAt = nowUnix() + 30 * 24 * 60 * 60;
  getDb()
    .prepare("INSERT INTO sessions (id, profile_id, expires_at) VALUES (?, ?, ?)")
    .run(id, profileId, expiresAt);
  return id;
}

export function destroySession(sessionId: string): void {
  getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export async function resolveAuth(req: IncomingMessage): Promise<AuthContext> {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE] ?? null;
  if (!sessionId) {
    return { profileId: null, sessionId: null };
  }

  const row = getDb()
    .prepare(
      `SELECT profile_id, expires_at FROM sessions WHERE id = ?`,
    )
    .get(sessionId) as { profile_id: string; expires_at: number } | undefined;

  if (!row) {
    return { profileId: null, sessionId: null };
  }

  if (row.expires_at < nowUnix()) {
    destroySession(sessionId);
    return { profileId: null, sessionId: null };
  }

  return { profileId: row.profile_id, sessionId };
}

export function requireAuth(ctx: AuthContext): string {
  if (!ctx.profileId) {
    throw new AuthError("Unauthorized");
  }
  return ctx.profileId;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
