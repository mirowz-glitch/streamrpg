import type { MythicOrigin } from "@streamrpg/shared";
import { deriveMythicOrigin, EXAMPLE_MYTHIC_REGISTRY, type ItemHistoryEvent } from "@streamrpg/shared";
import { getDb } from "../config/database.js";

/**
 * Sprint 18 — Mythic Foundation, Fase 5. Persistência real de
 * `mythic_discoveries` (schema.ts) — camada fina, nenhuma regra de
 * negócio aqui além do que o schema já garante (PRIMARY KEY em
 * `mythic_id` = no máximo um registro por Mítico, para sempre).
 * "Nenhum servidor múltiplo ainda" — `server` é um placeholder
 * constante até uma Sprint futura de multi-servidor precisar dele.
 */
const SERVER_ID = "default";

interface CitizenKingdomRow {
  kingdom_id: string;
}

function getCharacterKingdomId(characterId: string): string | null {
  const row = getDb()
    .prepare(`SELECT kingdom_id FROM citizens WHERE character_id = ? AND status = 'active'`)
    .get(characterId) as CitizenKingdomRow | undefined;
  return row?.kingdom_id ?? null;
}

export interface MythicDiscoveryOutcome {
  mythicId: string;
  isFirstDiscovery: boolean;
}

/**
 * Registra (idempotente, first-write-wins via PRIMARY KEY) que
 * `characterId` revelou `mythicId` agora. Chamada SÓ quando
 * `sphere.service.ts` resolve um outcome `mythic_reveal` — nunca por
 * nenhum outro caminho (Loot/Boss/Dungeon/NPC/Craft NUNCA produzem um
 * Mítico, Fase 1/9). `INSERT OR IGNORE` é a MESMA garantia que
 * `mythic/discovery.ts` (packages/shared) já modela pura: a segunda
 * chamada pro mesmo `mythicId` nunca sobrescreve a primeira.
 */
export function recordMythicDiscoveryIfFirst(mythicId: string, characterId: string, atIso: string): MythicDiscoveryOutcome {
  const kingdomId = getCharacterKingdomId(characterId);
  const db = getDb();
  const result = db
    .prepare(`INSERT OR IGNORE INTO mythic_discoveries (mythic_id, first_character_id, first_kingdom_id, first_at, server) VALUES (?, ?, ?, ?, ?)`)
    .run(mythicId, characterId, kingdomId, atIso, SERVER_ID);
  return { mythicId, isFirstDiscovery: result.changes > 0 };
}

interface MythicDiscoveryRow {
  mythic_id: string;
  first_character_id: string;
  first_kingdom_id: string | null;
  first_at: string;
  server: string;
}

/**
 * Deriva a `MythicOrigin` de um item (Fase 6/10 — o que a UI/API
 * expõe como "Origem"). Lê SOMENTE o registro de Discovery
 * correspondente ao Mítico já identificado no History do item (nunca
 * a tabela inteira) — mesma disciplina de "nunca uma query maior do
 * que o necessário" já usada pelo resto do projeto.
 */
export function deriveItemMythicOrigin(events: readonly ItemHistoryEvent[]): MythicOrigin {
  const revealEvent = events.find((evt) => evt.event === "mythic_revealed");
  if (!revealEvent) return { isMythic: false, mythicId: null, displayName: null, isFirstDiscovery: false };

  // Reaproveita a derivação PURA (mythic/mythicLegacy.ts) — só precisa
  // dar a ela um snapshot do registry (aqui, sempre 1 linha: a do
  // Mítico já identificado pelo History, nunca a tabela inteira).
  const discoveryRegistry: Record<string, { mythicId: string; firstCharacterId: string; firstKingdomId: string | null; firstAt: string; server: string }> = {};
  const definitionCandidate = Object.values(EXAMPLE_MYTHIC_REGISTRY).find((def) => def.displayName === revealEvent.detail);
  if (definitionCandidate) {
    const discoveryRow = getDb()
      .prepare(`SELECT mythic_id, first_character_id, first_kingdom_id, first_at, server FROM mythic_discoveries WHERE mythic_id = ?`)
      .get(definitionCandidate.id) as MythicDiscoveryRow | undefined;
    if (discoveryRow) {
      discoveryRegistry[discoveryRow.mythic_id] = {
        mythicId: discoveryRow.mythic_id,
        firstCharacterId: discoveryRow.first_character_id,
        firstKingdomId: discoveryRow.first_kingdom_id,
        firstAt: discoveryRow.first_at,
        server: discoveryRow.server,
      };
    }
  }

  return deriveMythicOrigin(events, EXAMPLE_MYTHIC_REGISTRY, discoveryRegistry);
}
