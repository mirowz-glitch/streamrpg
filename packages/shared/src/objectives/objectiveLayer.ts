import { advanceAdventureWithRecovery } from "../recovery/recoveryLayer.js";
import { checkRegionUnlock } from "../worldencounter/regionProgression.js";
import type { AdvanceAdventureOptions } from "../adventure/adventureLoop.js";
import type { AdventureSession, AdventureTickResult } from "../adventure/types.js";
import type { AdventureTimeline, FloatingNumberEvent, PresentationEvent } from "../presentation/types.js";
import type { RecoveryResult } from "../recovery/types.js";
import { deriveObjectiveProgress } from "./objectiveProgress.js";
import type { ObjectiveProgressSnapshot } from "./types.js";

export interface AdvanceAdventureWithObjectivesResult {
  tickResult: AdventureTickResult;
  events: PresentationEvent[];
  floatingNumbers: FloatingNumberEvent[];
  recovery: RecoveryResult;
  objective: ObjectiveProgressSnapshot;
}

// Requisito 11 — Arquitetura obrigatória: Adventure -> Objective System
// -> Progression -> Presentation -> HUD. Na prática, Progression já
// vive DENTRO da Presentation Layer (presentationLayer.ts, Sprint
// anterior) e a Recovery Layer já envolve a Presentation Layer (Sprint
// anterior) — esta função envolve advanceAdventureWithRecovery(), que
// já envolve as duas, então o Objective System observa TUDO que
// aconteceu no tick (combate, XP, cura) sem duplicar nenhuma lógica e
// sem alterar uma linha de nenhuma das camadas de baixo.
//
// "O Objective System apenas observa a aventura. Nunca controla a
// aventura" (requisito, arquitetura): esta função nunca modifica
// `tickResult`/`events`/`floatingNumbers`/`recovery` que já vieram
// prontos — só ACRESCENTA (a concessão de XP bônus via
// characterBuild.addExperience(), o evento ObjectiveCompleted, e a
// seleção do próximo objetivo), o mesmo padrão aditivo já usado por
// LevelUp/RecoveryApplied.
export function advanceAdventureWithObjectives(
  session: AdventureSession,
  timeline: AdventureTimeline,
  options: AdvanceAdventureOptions = {},
): AdvanceAdventureWithObjectivesResult {
  const timestamp = options.currentTime ?? Date.now();
  const { tickResult, events, floatingNumbers, recovery } = advanceAdventureWithRecovery(session, timeline, options);

  let objective = deriveObjectiveProgress(session, timeline);

  // Requisito 3 — Progressão Automática: "quando um objetivo termina:
  // entregar recompensa, registrar evento, selecionar automaticamente
  // o próximo — sem intervenção da UI." Tudo acontece na MESMA tick em
  // que o progresso bateu o alvo.
  if (objective.complete) {
    const xpBonus = objective.objective.reward.xpBonus ?? 0;
    if (xpBonus > 0) {
      // Requisito 7 — "sem alterar a curva existente": reaproveita
      // Character Build.addExperience() tal qual, o mesmo método usado
      // pela Progression Layer pra XP de abate — nenhuma fórmula nova.
      session.character.characterBuild.addExperience(xpBonus);
    }

    const tickIndex = timeline.nextTickIndex - 1;
    const completedEvent: PresentationEvent = {
      kind: "ObjectiveCompleted",
      objectiveId: objective.objective.id,
      objectiveName: objective.objective.name,
      xpBonus,
      tickIndex,
      timestamp,
    };
    events.push(completedEvent);
    timeline.events.push(completedEvent);

    // Rederiva imediatamente: o próximo objetivo já aparece na mesma
    // tick que concluiu o anterior, sem esperar um novo Adventure Tick.
    objective = deriveObjectiveProgress(session, timeline);
  }

  // Biomes, Regions & World Progression Phase I — requisito 4:
  // "Progressão Automática... quando a faixa de nível for atingida,
  // desbloquear automaticamente o próximo bioma. Sem NPC. Sem mapa."
  // Mesma extensão do wrapper já existente (nenhum wrapper/manager
  // novo — "O Objective System apenas observa a aventura" continua
  // valendo: só decide SE/QUANDO trocar de região, nunca recalcula
  // combate/encontro). Só checado quando não há encontro em andamento
  // (encontro concluído ou personagem ainda explorando) — nunca troca a
  // região no meio de uma luta.
  if (tickResult.characterAlive && !session.currentEncounter) {
    const unlockCheck = checkRegionUnlock(session.currentRegion, session.character.characterBuild.level, timeline.unlockedRegionIds);
    if (unlockCheck.unlocked && unlockCheck.newRegionId) {
      const previousRegionId = session.currentRegion;
      timeline.unlockedRegionIds.push(unlockCheck.newRegionId);
      session.currentRegion = unlockCheck.newRegionId;

      const tickIndex = timeline.nextTickIndex - 1;
      const unlockedEvent: PresentationEvent = {
        kind: "RegionUnlocked",
        previousRegionId,
        newRegionId: unlockCheck.newRegionId,
        tickIndex,
        timestamp,
      };
      const enteredEvent: PresentationEvent = {
        kind: "RegionEntered",
        regionId: unlockCheck.newRegionId,
        tickIndex,
        timestamp,
      };
      events.push(unlockedEvent, enteredEvent);
      timeline.events.push(unlockedEvent, enteredEvent);

      // Requisito 5 — Objetivos Regionais: a troca de região pode
      // mudar quais objetivos são elegíveis — rederiva pra refletir
      // isso imediatamente, mesma tick.
      objective = deriveObjectiveProgress(session, timeline);
    }
  }

  return { tickResult, events, floatingNumbers, recovery, objective };
}
