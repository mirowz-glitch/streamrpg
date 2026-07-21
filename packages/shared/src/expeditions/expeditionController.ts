import { advanceAdventureWithObjectives } from "../objectives/objectiveLayer.js";
import type { AdvanceAdventureOptions } from "../adventure/adventureLoop.js";
import type { AdventureSession, AdventureTickResult } from "../adventure/types.js";
import type { AdventureTimeline, FloatingNumberEvent, PresentationEvent } from "../presentation/types.js";
import type { RecoveryResult } from "../recovery/types.js";
import { RECOVERY_CONFIG } from "../recovery/config.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import type { ObjectiveProgressSnapshot } from "../objectives/types.js";
import { getExpeditionDefinition, selectExpeditionDefinitionId } from "./expeditionDefinitions.js";
import { deriveExpeditionProgress } from "./expeditionProgress.js";

export interface AdvanceExpeditionTickResult {
  tickResult: AdventureTickResult;
  events: PresentationEvent[];
  floatingNumbers: FloatingNumberEvent[];
  recovery: RecoveryResult;
  objective: ObjectiveProgressSnapshot;
}

// Requisito 3 — "conceder pequena recuperação... A recuperação deve
// reutilizar a Recovery Layer já existente. Sem alterar Recovery
// Layer." `RECOVERY_CONFIG` (recovery/config.ts) é a MESMA constante
// pública, já calibrada por simulação numa Sprint anterior, que a
// própria Recovery Layer usa pra curar depois de um encontro — este
// multiplicador só a escala pra cima, pra um bônus de marco (maior que
// a cura por encontro comum), sem inventar uma segunda fórmula.
const CHECKPOINT_RECOVERY_MULTIPLIER = 5;

// Requisito arquitetural — "A Expedição é apenas um orquestrador
// externo... Nunca altera regras de combate." Esta função chama
// advanceAdventureWithObjectives() (Objective System, protegido nesta
// Sprint — INTOCADO, só reutilizado) exatamente como
// useAdventureSession.ts/o Simulador já chamavam antes, e só ACRESCENTA
// por cima: nunca recalcula combate/XP/loot já concedidos por baixo,
// só observa a Timeline (já atualizada pela chamada real) e decide,
// com base NELA, se uma Expedição deve iniciar/avançar/concluir/falhar.
//
// "Toda informação deve ser derivada dos eventos já existentes. Nenhum
// contador paralelo": nenhuma variável de estado de expedição é
// guardada em lugar nenhum (nenhum Manager, nenhum Singleton) — a
// identidade da expedição ativa (se houver) é sempre re-derivada da
// própria Timeline via deriveExpeditionProgress(), antes e depois do
// tick real, pra comparar e detectar o que MUDOU nesta tick.
export function advanceExpeditionTick(
  session: AdventureSession,
  timeline: AdventureTimeline,
  options: AdvanceAdventureOptions = {},
): AdvanceExpeditionTickResult {
  const timestamp = options.currentTime ?? Date.now();

  const beforeExpedition = deriveExpeditionProgress(session, timeline);

  // --- A cadeia real, sem nenhuma alteração ---
  const { tickResult, events, floatingNumbers, recovery, objective } = advanceAdventureWithObjectives(session, timeline, options);
  const tickIndex = timeline.nextTickIndex - 1;

  // Requisito 1/2 — Auto-início: "sem intervenção da UI", mesmo
  // princípio de selectObjectiveId() (Objective System) — quando não
  // há expedição ativa, seleciona automaticamente uma nova pra região
  // atual (se existir alguma definição pra ela; "dado que falta, nunca
  // lógica que falta" — regiões sem Expedition Definition simplesmente
  // nunca iniciam uma).
  if (!beforeExpedition) {
    const seed = session.seed + tickIndex;
    const definitionId = selectExpeditionDefinitionId(seed, session.currentRegion);
    if (definitionId) {
      const definition = getExpeditionDefinition(definitionId)!;
      const startedEvent: PresentationEvent = {
        kind: "ExpeditionStarted",
        expeditionId: definition.id,
        name: definition.name,
        regionId: session.currentRegion,
        tickIndex,
        timestamp,
      };
      events.push(startedEvent);
      timeline.events.push(startedEvent);
    }
  }

  const afterExpedition = deriveExpeditionProgress(session, timeline);

  if (afterExpedition) {
    // Requisito 3 — Checkpoints: "ao atingir um checkpoint: registrar
    // progresso, salvar estatísticas, conceder pequena recuperação,
    // gerar evento." Comparado contra o "antes" (0 se a expedição
    // acabou de nascer nesta MESMA tick, via o auto-início acima).
    const beforeCheckpoints = beforeExpedition && beforeExpedition.expeditionId === afterExpedition.expeditionId ? beforeExpedition.checkpointsReached : 0;
    if (afterExpedition.checkpointsReached > beforeCheckpoints) {
      const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
      const lifeBefore = session.character.currentLife;
      const healAmount = finalStats.maximumLife * (RECOVERY_CONFIG.percentOfMaxLife ?? 0) * CHECKPOINT_RECOVERY_MULTIPLIER;
      const lifeAfter = Math.min(finalStats.maximumLife, lifeBefore + healAmount);
      const recoveryAmount = lifeAfter - lifeBefore;
      session.character.currentLife = lifeAfter;

      const checkpointEvent: PresentationEvent = {
        kind: "ExpeditionCheckpointReached",
        expeditionId: afterExpedition.expeditionId,
        checkpointIndex: afterExpedition.checkpointsReached,
        checkpointsTotal: afterExpedition.checkpointsTotal,
        recoveryAmount,
        tickIndex,
        timestamp,
      };
      events.push(checkpointEvent);
      timeline.events.push(checkpointEvent);

      if (recoveryAmount > 0) {
        floatingNumbers.push({ kind: "heal", value: recoveryAmount, target: "character", tickIndex, timestamp });
      }
    }

    // Requisito 5/6/12 — Conclusão: "reutilizar XP, Ouro, Loot já
    // existentes. Sem novo sistema econômico." XP via
    // characterBuild.addExperience() (Character Build, só chamado,
    // nunca alterado — mesmo método já usado por toda recompensa
    // externa desde a Sprint de Progression); ouro via
    // session.statistics.goldFound (mesmo campo já usado por Mini-Boss/
    // World Events).
    if (afterExpedition.complete) {
      const definition = getExpeditionDefinition(afterExpedition.expeditionId)!;
      const xpAmount = definition.reward.xpAmount ?? 0;
      const goldAmount = definition.reward.goldAmount ?? 0;
      if (xpAmount > 0) session.character.characterBuild.addExperience(xpAmount);
      if (goldAmount > 0) session.statistics.goldFound += goldAmount;

      const completedEvent: PresentationEvent = {
        kind: "ExpeditionCompleted",
        expeditionId: definition.id,
        name: definition.name,
        encountersCompleted: afterExpedition.encountersCompleted,
        elitesDefeated: afterExpedition.elitesDefeated,
        miniBossesDefeated: afterExpedition.miniBossesDefeated,
        worldEventsFound: afterExpedition.worldEventsFound,
        diedDuringExpedition: afterExpedition.diedDuringExpedition,
        xpAmount,
        goldAmount,
        tickIndex,
        timestamp,
      };
      events.push(completedEvent);
      timeline.events.push(completedEvent);
    } else if (!tickResult.characterAlive) {
      // Requisito 6 — ExpeditionFailed: a expedição termina sem
      // conclusão quando o personagem morre no meio dela — mesmo sinal
      // (`tickResult.characterAlive`) já usado por CharacterDied.
      const definition = getExpeditionDefinition(afterExpedition.expeditionId)!;
      const failedEvent: PresentationEvent = {
        kind: "ExpeditionFailed",
        expeditionId: definition.id,
        name: definition.name,
        encountersCompleted: afterExpedition.encountersCompleted,
        tickIndex,
        timestamp,
      };
      events.push(failedEvent);
      timeline.events.push(failedEvent);
    }
  }

  return { tickResult, events, floatingNumbers, recovery, objective };
}
