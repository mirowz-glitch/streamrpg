import { advanceExpeditionTick } from "../expeditions/expeditionController.js";
import { getExpeditionDefinition } from "../expeditions/expeditionDefinitions.js";
import type { AdvanceAdventureOptions } from "../adventure/adventureLoop.js";
import type { AdventureSession, AdventureTickResult } from "../adventure/types.js";
import type { AdventureTimeline, FloatingNumberEvent, PresentationEvent } from "../presentation/types.js";
import type { RecoveryResult } from "../recovery/types.js";
import type { ObjectiveProgressSnapshot } from "../objectives/types.js";
import { getFactionDefinition, getFactionForRegion, getRankForReputation } from "./factionDefinitions.js";
import { deriveFactionReputation } from "./factionProgress.js";

export interface AdvanceFactionTickResult {
  tickResult: AdventureTickResult;
  events: PresentationEvent[];
  floatingNumbers: FloatingNumberEvent[];
  recovery: RecoveryResult;
  objective: ObjectiveProgressSnapshot;
}

// Requisito 3 — Reputação: "toda reputação varia por eventos
// existentes... nenhum evento novo de combate." Cada gatilho abaixo só
// observa um Presentation Event já publicado por uma camada protegida
// (Expedition Controller/Presentation Layer, ambos intocados) — valores
// ilustrativos, calibrados empiricamente via o Simulador antes da
// entrega (ver scripts/runBalanceSimulation.ts).
const ELITE_DEFEATED_FACTION_ID = "guardioes-da-floresta";
const ELITE_DEFEATED_REPUTATION = 4;
const MINIBOSS_DEFEATED_FACTION_ID = "legiao-sombria";
const MINIBOSS_DEFEATED_REPUTATION = 10;
const DISCOVERY_MADE_FACTION_ID = "culto-das-ruinas";
const DISCOVERY_MADE_REPUTATION = 8;
const MERCHANT_FOUND_FACTION_ID = "mercadores-livres";
const MERCHANT_FOUND_REPUTATION = 5;
// "completar expedição": regra ESTRUTURAL (sempre a facção dona do
// bioma inicial da Expedição concluída, via
// getExpeditionDefinition(...).startBiome -> getFactionForRegion), não
// um valor fixo por facção.
const EXPEDITION_COMPLETED_REPUTATION = 15;

// Requisito 6 — ReputationChanged sempre dispara; ReputationRankUp só
// dispara quando o rank de DEPOIS é diferente do de ANTES (mesma
// técnica de comparação antes/depois já usada por
// expeditionController.ts pra detectar checkpoints cruzados).
function applyReputationChange(
  timeline: AdventureTimeline,
  events: PresentationEvent[],
  factionId: string,
  amount: number,
  reason: string,
  tickIndex: number,
  timestamp: number,
  xpBonusGranted = 0,
  goldBonusGranted = 0,
): void {
  const definition = getFactionDefinition(factionId);
  if (!definition) return;

  const before = deriveFactionReputation(factionId, timeline);
  const after = before + amount;

  const changedEvent: PresentationEvent = {
    kind: "ReputationChanged",
    factionId: definition.id,
    factionName: definition.name,
    delta: amount,
    newReputation: after,
    reason,
    xpBonusGranted,
    goldBonusGranted,
    tickIndex,
    timestamp,
  };
  events.push(changedEvent);
  timeline.events.push(changedEvent);

  const rankBefore = getRankForReputation(definition, before);
  const rankAfter = getRankForReputation(definition, after);
  if (rankAfter.id !== rankBefore.id) {
    const rankUpEvent: PresentationEvent = {
      kind: "ReputationRankUp",
      factionId: definition.id,
      factionName: definition.name,
      rankId: rankAfter.id,
      rankName: rankAfter.name,
      xpBonusPercent: rankAfter.reward.xpBonusPercent ?? 0,
      goldBonusPercent: rankAfter.reward.goldBonusPercent ?? 0,
      tickIndex,
      timestamp,
    };
    events.push(rankUpEvent);
    timeline.events.push(rankUpEvent);
  }
}

// Requisito arquitetural — "A Facção apenas observa eventos
// existentes. Nunca controla combate." Chama advanceExpeditionTick()
// (Expedition Controller, protegido nesta Sprint — INTOCADO, só
// reutilizado, já envolvendo Objective/Recovery/Presentation por baixo)
// exatamente como useAdventureSession.ts/o Simulador já chamavam antes,
// e só ACRESCENTA por cima: observa os eventos NOVOS desta tick e
// decide, com base neles, se alguma facção ganhou reputação/subiu de
// rank/concedeu bônus. Nenhuma regra de combate/encontro/progressão é
// movida pra cá.
export function advanceFactionTick(
  session: AdventureSession,
  timeline: AdventureTimeline,
  options: AdvanceAdventureOptions = {},
): AdvanceFactionTickResult {
  const timestamp = options.currentTime ?? Date.now();
  const { tickResult, events, floatingNumbers, recovery, objective } = advanceExpeditionTick(session, timeline, options);
  const tickIndex = timeline.nextTickIndex - 1;

  // Cópia da lista de eventos DESTA tick (advanceExpeditionTick já
  // devolve só os novos) — iterada uma vez só; novos ReputationChanged/
  // ReputationRankUp empurrados por applyReputationChange nunca viram
  // gatilho de si mesmos.
  const tickEvents = [...events];

  for (const event of tickEvents) {
    if (event.kind === "EliteDefeated") {
      applyReputationChange(timeline, events, ELITE_DEFEATED_FACTION_ID, ELITE_DEFEATED_REPUTATION, event.kind, tickIndex, timestamp);
    } else if (event.kind === "MiniBossDefeated") {
      applyReputationChange(timeline, events, MINIBOSS_DEFEATED_FACTION_ID, MINIBOSS_DEFEATED_REPUTATION, event.kind, tickIndex, timestamp);
    } else if (event.kind === "DiscoveryMade") {
      applyReputationChange(timeline, events, DISCOVERY_MADE_FACTION_ID, DISCOVERY_MADE_REPUTATION, event.kind, tickIndex, timestamp);
    } else if (event.kind === "MerchantFound") {
      applyReputationChange(timeline, events, MERCHANT_FOUND_FACTION_ID, MERCHANT_FOUND_REPUTATION, event.kind, tickIndex, timestamp);
    } else if (event.kind === "ExpeditionCompleted") {
      const expeditionDefinition = getExpeditionDefinition(event.expeditionId);
      const faction = expeditionDefinition ? getFactionForRegion(expeditionDefinition.startBiome) : undefined;
      if (faction) {
        // Requisito 4 — Bônus de XP/Ouro: usa o rank de ANTES desta
        // própria conclusão (reflete a confiança já conquistada até
        // aqui, não um rank que só nasceria neste exato instante),
        // reutilizando characterBuild.addExperience()/
        // statistics.goldFound — os MESMOS canais que a Expedição já
        // usa pra sua recompensa base (nenhum novo sistema econômico).
        const reputationBefore = deriveFactionReputation(faction.id, timeline);
        const rank = getRankForReputation(faction, reputationBefore);
        const xpBonus = Math.round((event.xpAmount * (rank.reward.xpBonusPercent ?? 0)) / 100);
        const goldBonus = Math.round((event.goldAmount * (rank.reward.goldBonusPercent ?? 0)) / 100);
        if (xpBonus > 0) session.character.characterBuild.addExperience(xpBonus);
        if (goldBonus > 0) session.statistics.goldFound += goldBonus;

        applyReputationChange(timeline, events, faction.id, EXPEDITION_COMPLETED_REPUTATION, event.kind, tickIndex, timestamp, xpBonus, goldBonus);
      }
    }
  }

  return { tickResult, events, floatingNumbers, recovery, objective };
}
