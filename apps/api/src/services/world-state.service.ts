/**
 * World State — Sprint World Simulation (MVP)
 *
 * Camada de apresentação pura: nenhuma regra de jogo vive aqui, nenhum
 * dado é inventado. Duas fontes:
 *
 * 1. Estado ao vivo (tick atual, sessionManager.getActiveCount()) — lido
 *    diretamente de componentes já existentes da Engine, sem duplicar
 *    lógica.
 * 2. Agregados do banco (total de aventureiros, Bosses derrotados, itens
 *    encontrados, Gold em circulação) — somente leitura, `SELECT`/`COUNT`/
 *    `SUM` sobre tabelas que já existem, nenhuma nova.
 *
 * A Timeline (Parte 2) é o único estado "novo": um buffer em memória,
 * populado por um subscriber que só observa eventos que já existem no
 * EventBus (mesmo padrão do DebugEventSubscriber — read-only, remoção
 * seria inócua). Como é só em memória, a Timeline começa vazia a cada
 * reinício do servidor — mostra "o que aconteceu desde que o mundo
 * ligou", não um histórico completo (não existe uma tabela de log de
 * eventos genérica; inventar uma seria além do escopo desta Sprint).
 */
import { getRegionName, KINGDOM_ROLE_CATALOG } from "@streamrpg/shared";
import type {
  CategoryEncounterSummary,
  EncounterStats,
  KingdomEncounterEvent,
  KingdomState,
  KingdomStats,
  RegionEncounterSummary,
  TimelineEvent,
  WorldPanel,
} from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  BossActivatedEvent,
  BossDefeatedEvent,
  BossEscapedEvent,
  BossSpawnedEvent,
  DropGrantedEvent,
  EncounterCategory,
  ExpeditionCompletedEvent,
  ExpeditionEncounterEvent,
  IdentityFrameUnlockedEvent,
  IdentityTitleUnlockedEvent,
  KingdomRoleChangedEvent,
  LevelUpEvent,
  SessionStartedEvent,
  WorldTickEvent,
} from "../engine/types.js";
import { getDb } from "../config/database.js";
import { sessionManager } from "../engine/SessionManager.js";
import { countActiveExpeditions } from "./expedition-status.service.js";
import { pushKingdomAchievement } from "./kingdom-prestige.service.js";

const MAX_TIMELINE = 20;
const MAX_ENCOUNTER_HISTORY = 15;

// Categorias que valem a pena aparecer na Timeline principal — as
// demais (natureza, clima, descanso, comércio, descoberta) só entram no
// histórico de encontros do Reino (Etapa 9), nunca na Timeline geral,
// para não apagar Boss/level up/drop com narrativa de fundo (Etapa 6:
// "mostrar somente encontros relevantes").
const TIMELINE_WORTHY_CATEGORIES = new Set<EncounterCategory>(["combate", "misterio", "ruinas"]);

let timeline: TimelineEvent[] = [];
let timelineSeq = 0;
let currentTick = 0;
let currentTickTimestamp = 0;

let encounterHistory: KingdomEncounterEvent[] = [];
let encounterSeq = 0;
const categoryCounts = new Map<EncounterCategory, { icon: string; count: number }>();
const regionEncounterCounts = new Map<string, number>();

function resolveDisplayName(characterId: string): string {
  const row = getDb()
    .prepare("SELECT display_name FROM characters WHERE id = ?")
    .get(characterId) as { display_name: string } | undefined;
  return row?.display_name ?? "Um aventureiro";
}

function pushEvent(text: string, timestamp: number): void {
  timelineSeq += 1;
  timeline.push({ id: `world-evt-${timelineSeq}`, text, timestamp });
  if (timeline.length > MAX_TIMELINE) {
    timeline = timeline.slice(-MAX_TIMELINE);
  }
}

export class WorldEventSubscriber {
  private lastSessionKeys = new Set<string>();

  register(bus: EventBus): () => void {
    const unsubs = [
      bus.subscribe("world.tick", (event) => this.onTick(event as WorldTickEvent)),
      bus.subscribe("session.started", (event) => {
        const { characterId, timestamp } = event as SessionStartedEvent;
        pushEvent(`${resolveDisplayName(characterId)} entrou.`, timestamp);
      }),
      bus.subscribe("level.up", (event) => {
        const { characterId, newLevel, timestamp } = event as LevelUpEvent;
        pushEvent(`${resolveDisplayName(characterId)} alcançou o nível ${newLevel}!`, timestamp);
      }),
      bus.subscribe("drop.granted", (event) => {
        const { characterId, itemName, timestamp } = event as DropGrantedEvent;
        pushEvent(`${resolveDisplayName(characterId)} encontrou ${itemName}.`, timestamp);
      }),
      bus.subscribe("boss.spawned", (event) => {
        const { tier, timestamp } = event as BossSpawnedEvent;
        pushEvent(`Um Boss (Tier ${tier}) apareceu no Reino.`, timestamp);
      }),
      bus.subscribe("boss.activated", (event) => {
        const { timestamp } = event as BossActivatedEvent;
        pushEvent("O Boss entrou em combate!", timestamp);
      }),
      bus.subscribe("boss.defeated", (event) => {
        const { timestamp } = event as BossDefeatedEvent;
        pushEvent("O Boss foi derrotado!", timestamp);
      }),
      bus.subscribe("boss.escaped", (event) => {
        const { timestamp } = event as BossEscapedEvent;
        pushEvent("O Boss escapou...", timestamp);
      }),
      bus.subscribe("expedition.completed", (event) => {
        const { characterId, destinationRegionId, timestamp } = event as ExpeditionCompletedEvent;
        pushEvent(
          `${resolveDisplayName(characterId)} concluiu uma expedição em ${getRegionName(destinationRegionId)}.`,
          timestamp,
        );
      }),
      // Sprint Founder Identity & Prestige — todo Título/Moldura
      // desbloqueado é, por definição, um marco raro (Etapa 6: "quando
      // alguém conquista um título, adicionar na Timeline") — sempre
      // relevante, ao contrário dos Encounters mundanos, então entra
      // sempre, sem filtro de categoria.
      bus.subscribe("identity.title_unlocked", (event) => {
        const { characterId, titleName, timestamp } = event as IdentityTitleUnlockedEvent;
        pushEvent(`👑 ${resolveDisplayName(characterId)} tornou-se "${titleName}".`, timestamp);
      }),
      bus.subscribe("identity.frame_unlocked", (event) => {
        const { characterId, frameName, timestamp } = event as IdentityFrameUnlockedEvent;
        pushEvent(`🖼️ ${resolveDisplayName(characterId)} conquistou a ${frameName}.`, timestamp);
      }),
      // Sprint Kingdom Prestige System — toda troca de cargo é um marco
      // do Reino (Etapa 3/9), sempre relevante, mesmo critério "sem
      // filtro" já usado para Título/Moldura acima. Entra na Timeline
      // GLOBAL (mesmo texto para qualquer canal) e no histórico de
      // conquistas DESTE canal (Etapa 4, "Últimas conquistas" da página
      // do Reino) — dois lugares, mesmo evento, nenhuma duplicação de
      // lógica.
      bus.subscribe("kingdom.role_changed", (event) => {
        const { channelId, roleSlug, roleName, characterId, timestamp } = event as KingdomRoleChangedEvent;
        const icon = KINGDOM_ROLE_CATALOG.find((r) => r.slug === roleSlug)?.icon ?? "👑";
        const text = `${icon} ${resolveDisplayName(characterId)} tornou-se ${roleName}.`;
        pushEvent(text, timestamp);
        pushKingdomAchievement(channelId, text, timestamp);
      }),
      // Sprint Encounter System — todo Encounter alimenta o histórico do
      // Reino (Etapa 9) e os contadores de categoria/região; só as
      // categorias em TIMELINE_WORTHY_CATEGORIES (combate/mistério/
      // ruínas) entram também na Timeline principal, para não repetir a
      // mesma narrativa em dois lugares nem afogar Boss/level up/drop
      // com encontros mundanos (Etapa 6 — "não duplicar mensagens").
      bus.subscribe("expedition.encounter", (event) => {
        const { characterId, regionId, category, icon, text, timestamp } = event as ExpeditionEncounterEvent;
        encounterSeq += 1;
        encounterHistory.push({
          id: `encounter-${encounterSeq}`,
          region_name: getRegionName(regionId),
          encounter: { category, icon, text },
          timestamp,
        });
        if (encounterHistory.length > MAX_ENCOUNTER_HISTORY) {
          encounterHistory = encounterHistory.slice(-MAX_ENCOUNTER_HISTORY);
        }

        const categoryEntry = categoryCounts.get(category) ?? { icon, count: 0 };
        categoryEntry.count += 1;
        categoryCounts.set(category, categoryEntry);
        regionEncounterCounts.set(regionId, (regionEncounterCounts.get(regionId) ?? 0) + 1);

        if (TIMELINE_WORTHY_CATEGORIES.has(category)) {
          pushEvent(`${resolveDisplayName(characterId)}: ${icon} ${text}`, timestamp);
        }
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }

  private onTick(event: WorldTickEvent): void {
    currentTick = event.tickNumber;
    currentTickTimestamp = event.timestamp;

    // Mesmo diff de sessões do DebugEventSubscriber (comparar chaves
    // characterId:channelId entre ticks) — a única forma honesta de saber
    // "quem saiu" sem um evento session.ended dedicado, que não existe.
    const currentKeys = new Set(event.sessions.map((s) => `${s.characterId}:${s.channelId}`));
    for (const key of this.lastSessionKeys) {
      if (!currentKeys.has(key)) {
        const characterId = key.split(":")[0];
        pushEvent(`${resolveDisplayName(characterId)} saiu.`, event.timestamp);
      }
    }
    this.lastSessionKeys = currentKeys;
  }
}

export function getTimeline(): TimelineEvent[] {
  return timeline;
}

// Sprint Encounter System, Etapa 9 — leitura pura do histórico em
// memória (mesma limitação já aceita para a Timeline: reinicia com o
// servidor, não é um log persistente).
export function getEncounterStats(regionLimit = 5, categoryLimit = 8): EncounterStats {
  const mostActiveRegions: RegionEncounterSummary[] = Array.from(regionEncounterCounts.entries())
    .map(([regionId, count]) => ({ region_id: regionId, region_name: getRegionName(regionId), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, regionLimit);

  const mostCommonCategories: CategoryEncounterSummary[] = Array.from(categoryCounts.entries())
    .map(([category, { icon, count }]) => ({ category, icon, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, categoryLimit);

  return {
    recent: [...encounterHistory].reverse(),
    most_active_regions: mostActiveRegions,
    most_common_categories: mostCommonCategories,
  };
}

export function getWorldPanel(): WorldPanel {
  const db = getDb();
  const bossesActive = db
    .prepare(`SELECT COUNT(*) AS c FROM bosses WHERE status IN ('awaiting', 'active')`)
    .get() as { c: number };

  return {
    server_time: Date.now(),
    current_tick: currentTick,
    current_tick_timestamp: currentTickTimestamp,
    players_online: sessionManager.getActiveCount(),
    bosses_active_now: bossesActive.c,
    last_event: timeline.length > 0 ? timeline[timeline.length - 1] : null,
  };
}

// Sprint Expedition System — "Exploração" deixou de ser um placeholder
// (exploration_available: false) assim que ExpeditionSystem passou a
// existir de verdade.
export function getKingdomState(): KingdomState {
  const db = getDb();
  const bossesActive = db
    .prepare(`SELECT COUNT(*) AS c FROM bosses WHERE status IN ('awaiting', 'active')`)
    .get() as { c: number };
  const bossesDefeated = db
    .prepare(`SELECT COUNT(*) AS c FROM bosses WHERE status = 'defeated'`)
    .get() as { c: number };
  const gold = db.prepare(`SELECT COALESCE(SUM(gold), 0) AS total FROM characters`).get() as {
    total: number;
  };

  return {
    players_active: sessionManager.getActiveCount(),
    bosses_active_now: bossesActive.c,
    bosses_defeated_total: bossesDefeated.c,
    gold_in_circulation: gold.total,
    expeditions_active: countActiveExpeditions(),
  };
}

export function getKingdomStats(): KingdomStats {
  const db = getDb();
  const adventurers = db.prepare(`SELECT COUNT(*) AS c FROM characters`).get() as { c: number };
  const bossesDefeated = db
    .prepare(`SELECT COUNT(*) AS c FROM bosses WHERE status = 'defeated'`)
    .get() as { c: number };
  const items = db.prepare(`SELECT COUNT(*) AS c FROM character_items`).get() as { c: number };

  return {
    adventurers_total: adventurers.c,
    bosses_defeated_total: bossesDefeated.c,
    items_found_total: items.c,
  };
}

// Parte 3 — mensagens derivadas do estado real (players_online), nunca
// texto solto sem relação com o mundo. Limiares ilustrativos, mesma
// convenção de outros valores não calibrados do projeto (documentado,
// não escondido).
export function getIdleFlavor(playersOnline: number): string {
  if (playersOnline === 0) return "O Reino está tranquilo.";
  if (playersOnline <= 3) return "Poucos aventureiros ativos.";
  return "Exploradores continuam viajando pelo Reino.";
}
