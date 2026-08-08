/**
 * Sprint 10 — Item History (Fase 6). Mesmo princípio de "nunca apagar"
 * já usado por `HouseHistoryEvent`/`houses.history` (housing-phase1) e
 * por `HouseSale`/`house_sales` (real-estate) — log append-only, nunca
 * editado ou removido, porque o histórico É o valor de um item ao
 * longo do tempo (filosofia obrigatória desta Sprint: "todo item deve
 * nascer, viver, ser usado, trocar de dono... e talvez ser vendido anos
 * depois").
 *
 * Nenhuma tabela nova criada aqui — só o formato que uma futura
 * `items.history` (coluna JSON, mesmo padrão de `houses.history`)
 * precisaria satisfazer.
 */
import type { ItemLegacy } from "./types.js";

export type ItemHistoryEventType =
  | "created"
  | "owner_changed"
  | "boss_defeated_with"
  | "player_killed_with"
  | "kingdom_visited"
  | "war_won"
  | "sphere_applied"
  | "sealed"
  | "upgraded"
  // Sprint 14 — Legendary Items + Legacy System: a Sprint 11 documentou
  // "sold"/"salvaged" como impossíveis porque `removeItem()`
  // (drop.service.ts) apaga a linha de `character_items`. Achado desta
  // Sprint: `removeItem()` NUNCA apagou a linha de `items` (o catálogo
  // procedural — cada item da Aventura já é uma linha única, ver o
  // comentário de `removeItem()`) — só a linha de posse. O histórico
  // sempre sobreviveu à venda/desmontagem, só ninguém tinha gravado o
  // evento antes de chamar `removeItem()`. `merchant.service.ts`/
  // `salvage.service.ts` agora gravam este evento ANTES da remoção,
  // dentro da mesma transação.
  | "sold"
  | "salvaged"
  // Sprint 16 — Economy Foundation (Esfera da Incerteza): "uncertainty_used"
  // sempre acompanha um segundo evento descrevendo o resultado.
  | "uncertainty_used"
  // Sprint 17 — Esfera da Incerteza 2.0: "failed_reveal" foi REMOVIDO
  // oficialmente (decisão da Sprint: "a Esfera nunca falha" — não existe
  // mais 'nada aconteceu'). Todo uso agora produz exatamente um destes
  // 5, mapeado 1:1 de `TransformationOutcome` (transformation/types.ts):
  // upgrade->"upgraded" (reaproveita o mesmo tipo do Blacksmith — ambos
  // significam "o item melhorou"), downgrade->"downgraded",
  // mutation->"transformation", reveal->"revealed",
  // mythic_reveal->"mythic_revealed".
  | "revealed"
  | "downgraded"
  | "transformation"
  | "mythic_revealed";

export interface ItemHistoryEvent {
  event: ItemHistoryEventType;
  characterId: string | null;
  detail: string | null;
  /** ISO timestamp. */
  at: string;
}

/**
 * Log completo — cresce para sempre, nunca é truncado/limpo (mesma
 * disciplina de Housing/Real Estate). `playersKilledWith` é PvP —
 * sempre 0 até Kingdom Wars (roadmap item 12) existir; o campo já está
 * aqui pra não precisar de outra migração quando aquela Sprint chegar.
 */
export interface ItemHistory {
  createdBy: string;
  firstOwnerCharacterId: string;
  currentOwnerCharacterId: string;
  ownerCount: number;
  bossesDefeatedWith: number;
  playersKilledWith: number;
  /** Kingdom ids, deduplicado. */
  kingdomsVisited: string[];
  warsWon: number;
  events: ItemHistoryEvent[];
}

/**
 * Deriva o resumo compacto (`ItemLegacy`) a partir do log completo —
 * pura, sem I/O, mesmo princípio de todo derivador já usado no
 * projeto (ex.: `deriveWorldPresence`, `deriveHudState`). Não chamada
 * por nenhum código real ainda.
 */
export function deriveItemLegacyFromHistory(history: ItemHistory, createdAtIso: string, nowIso: string): ItemLegacy {
  const ageMs = new Date(nowIso).getTime() - new Date(createdAtIso).getTime();

  let soldCount = 0;
  let salvagedCount = 0;
  let sphereEventsCount = 0;
  let highestSalePrice: number | null = null;
  for (const evt of history.events) {
    if (evt.event === "sold") {
      soldCount += 1;
      const price = evt.detail !== null ? Number(evt.detail) : NaN;
      if (!Number.isNaN(price) && (highestSalePrice === null || price > highestSalePrice)) {
        highestSalePrice = price;
      }
    } else if (evt.event === "salvaged") {
      salvagedCount += 1;
    } else if (evt.event === "sphere_applied" || evt.event === "sealed" || evt.event === "uncertainty_used") {
      // Sprint 16 — a Esfera da Incerteza É uma Esfera (mesmo
      // vocabulário de posse/consumo, itemization/spheres.ts) — conta
      // pra "quantas Esferas este item já recebeu" junto das demais,
      // nunca um contador paralelo.
      sphereEventsCount += 1;
    }
  }

  return {
    ownerCount: history.ownerCount,
    bossesWitnessed: history.bossesDefeatedWith,
    kingdomsVisited: history.kingdomsVisited.length,
    ageInDays: Math.max(0, Math.floor(ageMs / 86_400_000)),
    soldCount,
    salvagedCount,
    highestSalePrice,
    sphereEventsCount,
    firstOwnerCharacterId: history.firstOwnerCharacterId,
    currentOwnerCharacterId: history.currentOwnerCharacterId,
  };
}

/** Cria um Item History novo — o primeiro evento é sempre "created". */
export function createItemHistory(createdBy: string, firstOwnerCharacterId: string, nowIso: string): ItemHistory {
  return {
    createdBy,
    firstOwnerCharacterId,
    currentOwnerCharacterId: firstOwnerCharacterId,
    ownerCount: 1,
    bossesDefeatedWith: 0,
    playersKilledWith: 0,
    kingdomsVisited: [],
    warsWon: 0,
    events: [{ event: "created", characterId: firstOwnerCharacterId, detail: null, at: nowIso }],
  };
}

/**
 * Anexa um evento — nunca edita/remove os já existentes (mesmo
 * princípio append-only de `houses.history`). Pura, devolve um objeto
 * novo (nunca muta `history` recebido) — quem persiste decide quando
 * escrever o resultado de volta no banco.
 */
/**
 * Sprint 14 — Legendary Items + Legacy System, Fase 6: `kingdomsVisited`
 * (o array deduplicado, distinto do log de eventos) só ganha uma
 * entrada NOVA — e só ENTÃO um evento "kingdom_visited" é anexado — se
 * este Reino ainda não estava na lista. Evita um evento novo a cada
 * tick pro mesmo Reino (o item "visita" um Reino uma vez, não a cada
 * ação); pura, mesmo princípio de nunca mutar o `history` recebido.
 */
export function recordKingdomVisit(history: ItemHistory, kingdomId: string, characterId: string, atIso: string): ItemHistory {
  if (history.kingdomsVisited.includes(kingdomId)) return history;
  return {
    ...history,
    kingdomsVisited: [...history.kingdomsVisited, kingdomId],
    events: [...history.events, { event: "kingdom_visited", characterId, detail: kingdomId, at: atIso }],
  };
}

export function appendItemHistoryEvent(
  history: ItemHistory,
  event: ItemHistoryEventType,
  characterId: string | null,
  detail: string | null,
  atIso: string,
): ItemHistory {
  return { ...history, events: [...history.events, { event, characterId, detail, at: atIso }] };
}
