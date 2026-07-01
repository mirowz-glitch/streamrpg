import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(): void {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  baseUrl: process.env.BASE_URL ?? process.env.TWITCH_REDIRECT_URI?.replace(/\/auth\/twitch\/callback$/, "") ?? "http://localhost:4000",
  twitchClientId: process.env.TWITCH_CLIENT_ID ?? "",
  twitchClientSecret: process.env.TWITCH_CLIENT_SECRET ?? "",
  twitchRedirectUri:
    process.env.TWITCH_REDIRECT_URI ?? "http://localhost:4000/auth/twitch/callback",
  sessionSecret: process.env.SESSION_SECRET ?? process.env.JWT_SECRET ?? "dev-secret-change-me-min-32-chars",
  dbPath: process.env.DB_PATH ?? "./data/streamrpg.db",
  /**
   * Feature flag da Milestone 8.
   * false (padrão): applyPing() continua sendo a única fonte de XP/level/minutos.
   * true: XPSystem passa a escrever XP real via CharacterRepository,
   * e applyPing() deixa de escrever xp/level/total_minutes.
   * Ainda não ativada em produção — infraestrutura pronta, não ligada.
   */
  useEngineXp: process.env.USE_ENGINE_XP === "true",
} as const;
