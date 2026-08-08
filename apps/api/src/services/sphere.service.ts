import { randomInt as secureRandomInt } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import {
  EquipmentLockError,
  applySphere,
  validateSphere,
  appendItemHistoryEvent,
  rerollAffixValues,
  removeRandomAffix,
  addRandomAffix,
  increaseQuality,
  createSeededRandom,
  calculatePowerScore,
  getBaseItem,
  getSphereDefinition,
  isBaseEligibleForUncertainty,
  resolveUncertaintyOutcome,
  EXAMPLE_BASE_TRANSFORMATION_POOL,
  EXAMPLE_BASE_TRANSFORMATIONS,
  EXAMPLE_MYTHIC_REGISTRY,
  findMythicDefinitionByRevealedName,
  normalizeItemRarity,
  type ItemAffix,
  type ItemCraftState,
  type ItemHistory,
  type ItemHistoryEventType,
  type ItemQuality,
  type InventoryItem,
  type SphereTypeId,
  type SphereSource,
  type TransformationOutcome,
} from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { equipmentLock } from "./equipmentLock.service.js";
import { listInventory } from "./drop.service.js";
import { pushActivityFeedEntry } from "./activityFeed.service.js";
import { pushNotification } from "./notifications.service.js";
import { SQLiteChronicleRepository } from "../infrastructure/SQLiteChronicleRepository.js";
import { recordMythicDiscoveryIfFirst } from "./mythicDiscovery.service.js";

/**
 * Sprint 12 — Crafting Phase I (Sphere System). Orquestrador único de
 * um uso de Esfera contra um item, para as 5 Esferas. Fluxo: valida
 * posse (`character_spheres`) → valida `craft_state` (`validateSphere`,
 * itemization/spheres.ts) → aplica o efeito PURO certo
 * (`crafting/sphereCrafting.ts` para as 4 novas, `applySphere()` para a
 * Maldição) → recalcula Power Score quando afixos mudaram → consome 1
 * unidade da Esfera + persiste + anexa evento de História, tudo dentro
 * de UMA transação SQL (mesmo padrão de Blacksmith/Merchant/Salvage,
 * ADR-0001).
 *
 * "Crafting nunca pode ser determinístico" — a entropia de cada uso vem
 * de `secureRandomInt()` (node:crypto, só nesta fronteira de API),
 * nunca do seed do próprio item (esse continua reservado para geração/
 * replay, itemgen/rng.ts, D1).
 */
export type ApplySphereFailureReason =
  | "item-not-found"
  | "item-sealed"
  | "item-locked"
  | "sphere-not-owned"
  | "no-affix-to-reroll"
  | "no-affix-to-remove"
  | "no-eligible-affix"
  // Sprint 16 — Economy Foundation: "Nem toda Base pode utilizar a
  // Esfera da Incerteza" — item cujo `base_item_id` não está no
  // BaseItemChancePool (transformation/). Checado ANTES de consumir a
  // Esfera, mesmo padrão das demais falhas de elegibilidade acima.
  | "not-eligible";

export interface ApplySphereSuccess {
  success: true;
  sphereId: SphereTypeId;
  detail: string;
  item: InventoryItem;
}

export type ApplySphereResult = ApplySphereSuccess | { success: false; reason: ApplySphereFailureReason };

function generateCraftSeed(): number {
  return secureRandomInt(0, 2_147_483_647);
}

interface ItemForCraft {
  item_id: number;
  craft_state: ItemCraftState;
  affixes: string;
  quality: string;
  item_level: number | null;
  base_item_id: string | null;
  history: string | null;
  power_score: number | null;
  rarity: string;
  name: string;
}

/** Uncertainty precisa de um número real em [0, 1) — mesma fronteira de entropia real que `generateCraftSeed()` já usa (node:crypto, nunca dentro de packages/shared). */
function generateUncertaintyRoll(): number {
  return secureRandomInt(0, 1_000_000) / 1_000_000;
}

/**
 * Sprint 17 — Esfera da Incerteza 2.0, Fase 7: mapeamento 1:1 de
 * `TransformationOutcome` (transformation/types.ts) pro evento de
 * História que ele grava. `upgrade` reaproveita o MESMO tipo "upgraded"
 * que o Blacksmith já usa (ambos significam "o item melhorou" — o
 * `detail` da String diferencia a origem, nunca um tipo de evento
 * paralelo).
 */
const HISTORY_EVENT_FOR_OUTCOME: Record<TransformationOutcome, ItemHistoryEventType> = {
  upgrade: "upgraded",
  downgrade: "downgraded",
  mutation: "transformation",
  reveal: "revealed",
  mythic_reveal: "mythic_revealed",
};

export function getSphereQuantity(characterId: string, sphereId: SphereTypeId): number {
  const row = getDb()
    .prepare(`SELECT quantity FROM character_spheres WHERE character_id = ? AND sphere_id = ?`)
    .get(characterId, sphereId) as { quantity: number } | undefined;
  return row?.quantity ?? 0;
}

export interface SphereInventoryRow {
  sphereId: SphereTypeId;
  quantity: number;
}

export function getSphereInventory(characterId: string): SphereInventoryRow[] {
  const rows = getDb()
    .prepare(`SELECT sphere_id as sphereId, quantity FROM character_spheres WHERE character_id = ? AND quantity > 0`)
    .all(characterId) as Record<string, unknown>[];
  return rows.map((row) => ({ sphereId: row.sphereId as SphereTypeId, quantity: row.quantity as number }));
}

/**
 * QA-only — nunca chamada por nenhuma rota HTTP real. "Esferas não
 * podem ser compradas... nenhum drop definitivo, nenhuma loja" nesta
 * Sprint — a distribuição real é Sprint futura. A ÚNICA forma de um
 * personagem ganhar Esferas hoje é `scripts/qaGrantSpheres.ts`, que
 * chama esta função diretamente (nunca via HTTP).
 */
export function grantSphereForTesting(characterId: string, sphereId: SphereTypeId, amount: number): void {
  getDb()
    .prepare(
      `INSERT INTO character_spheres (character_id, sphere_id, quantity) VALUES (?, ?, ?)
       ON CONFLICT(character_id, sphere_id) DO UPDATE SET quantity = quantity + excluded.quantity`,
    )
    .run(characterId, sphereId, amount);
}

function consumeSphereInTransaction(db: DatabaseSync, characterId: string, sphereId: SphereTypeId): boolean {
  const row = db
    .prepare(`SELECT quantity FROM character_spheres WHERE character_id = ? AND sphere_id = ?`)
    .get(characterId, sphereId) as { quantity: number } | undefined;
  if (!row || row.quantity <= 0) return false;
  db.prepare(`UPDATE character_spheres SET quantity = quantity - 1 WHERE character_id = ? AND sphere_id = ?`).run(characterId, sphereId);
  return true;
}

export function applySphereToItem(characterId: string, characterItemId: number, sphereId: SphereTypeId): ApplySphereResult {
  try {
    return equipmentLock.withLock(characterItemId, "sphere:apply", () => {
      const db = getDb();

      if (getSphereQuantity(characterId, sphereId) < 1) {
        return { success: false, reason: "sphere-not-owned" };
      }

      const row = db
        .prepare(
          `SELECT ci.item_id, i.craft_state, i.affixes, i.quality, i.item_level, i.base_item_id, i.history, i.power_score, i.rarity, i.name
           FROM character_items ci JOIN items i ON i.id = ci.item_id
           WHERE ci.id = ? AND ci.character_id = ?`,
        )
        .get(characterItemId, characterId) as ItemForCraft | undefined;

      if (!row) return { success: false, reason: "item-not-found" };

      const validation = validateSphere(row.craft_state, sphereId);
      if (!validation.ok) return { success: false, reason: "item-sealed" };

      const affixes = JSON.parse(row.affixes) as ItemAffix[];
      const quality = JSON.parse(row.quality) as ItemQuality;
      const itemLevel = row.item_level ?? 1;
      const rng = createSeededRandom(generateCraftSeed());

      let newAffixes = affixes;
      let newQuality = quality;
      let newCraftState: ItemCraftState = row.craft_state;
      let newName = row.name;
      let newRarity = normalizeItemRarity(row.rarity);
      let detail: string;
      // Sprint 16/17 — só a Esfera da Incerteza produz MAIS de um evento
      // de História num único uso: `uncertainty_used` sempre + um
      // segundo evento descrevendo o TransformationOutcome real (Sprint
      // 17: "a Esfera nunca falha" — este segundo evento SEMPRE existe
      // pra "uncertainty", nunca é omitido). As outras 5 Esferas
      // continuam com exatamente 1 evento (`extraHistoryEvent` fica
      // `null` pra elas).
      let extraHistoryEvent: { type: ItemHistoryEventType; detail: string } | null = null;

      switch (sphereId) {
        case "fortune": {
          if (affixes.length === 0) return { success: false, reason: "no-affix-to-reroll" };
          newAffixes = rerollAffixValues(affixes, itemLevel, rng);
          detail = `Fortuna: ${affixes.length} valor(es) rerolado(s)`;
          break;
        }
        case "purification": {
          const result = removeRandomAffix(affixes, rng);
          if (!result.removed) return { success: false, reason: "no-affix-to-remove" };
          newAffixes = result.affixes;
          detail = `Purificação: removeu ${result.removed.name}`;
          break;
        }
        case "ascension": {
          if (!row.base_item_id) return { success: false, reason: "no-eligible-affix" };
          const result = addRandomAffix(row.base_item_id, affixes, itemLevel, rng);
          if (!result.added) return { success: false, reason: "no-eligible-affix" };
          newAffixes = result.affixes;
          detail = `Ascensão: adicionou ${result.added.name}`;
          break;
        }
        case "lapidation": {
          newQuality = increaseQuality(quality, rng);
          detail = `Lapidação: Qualidade ${quality.value} -> ${newQuality.value}`;
          break;
        }
        case "curse": {
          const applied = applySphere(row.craft_state, "curse");
          if (!applied.success || !applied.newCraftState) return { success: false, reason: "item-sealed" };
          newCraftState = applied.newCraftState;
          detail = "Maldição: item selado permanentemente";
          break;
        }
        case "uncertainty": {
          // "Nem toda Base pode utilizar a Esfera da Incerteza" —
          // checado ANTES de consumir, mesmo padrão de
          // no-affix-to-reroll/no-eligible-affix acima. Esta é a ÚNICA
          // forma de rejeição possível — uma vez elegível, o uso NUNCA
          // falha (Sprint 17, decisão oficial).
          if (!row.base_item_id || !isBaseEligibleForUncertainty(row.base_item_id, EXAMPLE_BASE_TRANSFORMATION_POOL)) {
            return { success: false, reason: "not-eligible" };
          }
          const result = resolveUncertaintyOutcome(
            row.base_item_id,
            newRarity,
            itemLevel,
            EXAMPLE_BASE_TRANSFORMATION_POOL,
            EXAMPLE_BASE_TRANSFORMATIONS,
            generateUncertaintyRoll(),
          );
          // "O Item SEMPRE muda. Nunca permanece igual" — nome/raridade
          // são sobrescritos incondicionalmente, mesmo pra um
          // "downgrade" (nunca fica igual ao original).
          newName = result.revealedName;
          newRarity = result.revealedRarity;
          extraHistoryEvent = { type: HISTORY_EVENT_FOR_OUTCOME[result.outcome], detail: result.detail };
          detail = `Incerteza (${result.outcome}): ${result.detail}`;
          break;
        }
        default: {
          const exhaustive: never = sphereId;
          throw new Error(`Esfera desconhecida: ${exhaustive}`);
        }
      }

      // Fortuna/Purificação/Ascensão mudam afixos -> Power Score precisa
      // ser recalculado (mesma função que o Item Generator usa,
      // `calculatePowerScore` — "nunca criar regras paralelas").
      // Maldição/Lapidação nunca tocam afixos, Power Score fica igual.
      let newPowerScore = row.power_score;
      if (sphereId === "fortune" || sphereId === "purification" || sphereId === "ascension") {
        const base = row.base_item_id ? getBaseItem(row.base_item_id) : undefined;
        if (base) {
          const prefixes = newAffixes.filter((affix) => affix.type === "prefix");
          const suffixes = newAffixes.filter((affix) => affix.type === "suffix");
          newPowerScore = calculatePowerScore(base, [...prefixes, ...suffixes]);
        }
      }

      // Hoisted pra fora do `if (row.history)` abaixo — Sprint 18 (Mythic
      // Foundation) precisa do MESMO timestamp pro evento de História
      // `mythic_revealed` E pro registro em `mythic_discoveries`
      // (recordMythicDiscoveryIfFirst, depois do COMMIT); `deriveMythicOrigin`
      // (packages/shared) identifica "este item foi o primeiro?" comparando
      // exatamente esses dois valores.
      const nowIso = new Date().toISOString();

      db.exec("BEGIN");
      try {
        const consumed = consumeSphereInTransaction(db, characterId, sphereId);
        if (!consumed) {
          db.exec("ROLLBACK");
          return { success: false, reason: "sphere-not-owned" };
        }

        // Fase 8 — toda Esfera usada registra Tipo/Jogador/Data/Resultado,
        // append-only (mesmo princípio de sempre). Item do catálogo fixo
        // pré-Sprint 11 sem `history` (row.history === null) não ganha
        // histórico retroativo.
        let historyJson = row.history;
        if (row.history) {
          const eventType = sphereId === "curse" ? "sealed" : sphereId === "uncertainty" ? "uncertainty_used" : "sphere_applied";
          let history = appendItemHistoryEvent(JSON.parse(row.history) as ItemHistory, eventType, characterId, detail, nowIso);
          // Sprint 16 — Esfera da Incerteza: segundo evento append-only
          // (`revealed`/`failed_reveal`) na MESMA transação, mesma
          // disciplina de nunca editar/remover eventos já existentes.
          if (extraHistoryEvent) {
            history = appendItemHistoryEvent(history, extraHistoryEvent.type, characterId, extraHistoryEvent.detail, nowIso);
          }
          historyJson = JSON.stringify(history);
        }

        db.prepare(`UPDATE items SET name = ?, rarity = ?, affixes = ?, quality = ?, craft_state = ?, power_score = ?, history = ? WHERE id = ?`).run(
          newName,
          newRarity,
          JSON.stringify(newAffixes),
          JSON.stringify(newQuality),
          newCraftState,
          newPowerScore,
          historyJson,
          row.item_id,
        );

        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }

      // Sprint 18 — Mythic Foundation, Fase 5: SÓ quando o outcome real
      // foi `mythic_reveal` (nunca por nenhum outro caminho — Loot/
      // Boss/Dungeon/NPC/Craft continuam incapazes disso, Fase 1/9).
      // Fora da transação de cima de propósito — `mythic_discoveries`
      // é uma tabela GLOBAL (não pertence a este item), sua própria
      // garantia de "nunca sobrescrever" vem do PRIMARY KEY em
      // `mythic_id` (INSERT OR IGNORE), não desta transação.
      if (extraHistoryEvent?.type === "mythic_revealed" && extraHistoryEvent.detail) {
        const definition = findMythicDefinitionByRevealedName(EXAMPLE_MYTHIC_REGISTRY, extraHistoryEvent.detail);
        if (definition) {
          recordMythicDiscoveryIfFirst(definition.id, characterId, nowIso);
        }
      }

      const item = listInventory(characterId).find((i) => i.id === characterItemId);
      if (!item) throw new Error("Item desapareceu do inventário depois de aplicar a Esfera");

      return { success: true, sphereId, detail, item };
    });
  } catch (error) {
    if (error instanceof EquipmentLockError) {
      return { success: false, reason: "item-locked" };
    }
    throw error;
  }
}

// Sprint 13 — Sphere Economy Phase I, Fase 8: só Esferas raras o
// bastante viram notícia — reusa `SphereType.rarity` (itemization/
// spheres.ts, Sprint 10) em vez de inventar uma segunda escala de
// raridade; hoje isso significa Ascensão ("rare") e Maldição
// ("very_rare"). "Nunca anunciar Esferas comuns" — Fortuna/
// Purificação/Lapidação nunca passam por aqui.
const ANNOUNCE_WORTHY_SPHERE_RARITIES = new Set(["rare", "very_rare"]);

/**
 * Sprint 13 — Sphere Economy Phase I, Fase 7/8. Único ponto de escrita
 * real em `character_spheres` a partir de um DROP (distinto de
 * `grantSphereForTesting()`, QA-only) — chamado por `POST /api/items/
 * sphere-drop` (Adventure/Dungeon/Boss, via `useAdventureSession.ts`
 * observando `SphereDropped`) e diretamente por
 * `apps/api/src/systems/BossRewardSystem.ts` (World Boss, já
 * server-side, sem round-trip HTTP).
 *
 * "Nunca diretamente no inventário de itens" — só incrementa
 * `character_spheres`, nunca toca `items`/`character_items`.
 */
export async function grantSphereDrop(characterId: string, sphereId: SphereTypeId, source: SphereSource, timestamp: number = Date.now()): Promise<void> {
  void source; // reservado para auditoria futura (ex.: estatística "de onde vêm as Esferas do servidor"), não lido hoje.

  getDb()
    .prepare(
      `INSERT INTO character_spheres (character_id, sphere_id, quantity) VALUES (?, ?, 1)
       ON CONFLICT(character_id, sphere_id) DO UPDATE SET quantity = quantity + 1`,
    )
    .run(characterId, sphereId);

  const definition = getSphereDefinition(sphereId);
  if (!ANNOUNCE_WORTHY_SPHERE_RARITIES.has(definition.rarity)) return;

  // Activity Feed é sempre anônimo neste projeto (ver routes/items.ts:
  // "Um item lendário foi encontrado: X" — nunca o nome do personagem
  // que encontrou); Notification é pessoal; History é a Crônica
  // permanente do personagem (mesmo padrão de RARE_DROP_TEMPLATES em
  // ChronicleSystem.ts, pra item raro — agora também pra Esfera rara).
  pushActivityFeedEntry("🔮", `Uma ${definition.name} foi encontrada.`, timestamp);
  pushNotification(characterId, "🔮", `Você encontrou uma ${definition.name}!`, timestamp);
  try {
    await new SQLiteChronicleRepository().insertAlways(
      characterId,
      "rare_sphere_drop",
      "🔮",
      "Uma Esfera Rara",
      `Encontrou ${definition.name}, algo que poucos aventureiros veem.`,
      timestamp,
    );
  } catch (err) {
    console.error(`[sphere.service] Erro ao gravar Crônica de Esfera rara para ${characterId}:`, err);
  }
}
