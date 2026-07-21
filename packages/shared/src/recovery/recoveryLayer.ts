import { advanceAdventureWithPresentation } from "../presentation/presentationLayer.js";
import type { AdvanceAdventureOptions } from "../adventure/adventureLoop.js";
import type { AdventureSession, AdventureTickResult } from "../adventure/types.js";
import type { AdventureTimeline, FloatingNumberEvent, PresentationEvent } from "../presentation/types.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import { RECOVERY_CONFIG } from "./config.js";
import type { RecoveryConfig, RecoveryResult, RecoveryStrategyType } from "./types.js";

export interface AdvanceAdventureWithRecoveryResult {
  tickResult: AdventureTickResult;
  events: PresentationEvent[];
  floatingNumbers: FloatingNumberEvent[];
  recovery: RecoveryResult;
}

// Requisito 2 — só "percent-of-max-life" tem lógica real nesta Sprint;
// os outros 3 são Future Hooks (ver types.ts) — nunca produzem cura
// ainda, preparados pro dia em que poções/fogueiras/habilidades
// existirem (requisito 10).
function resolveHealAmount(config: RecoveryConfig, maximumLife: number): number {
  const type: RecoveryStrategyType = config.type;
  switch (type) {
    case "percent-of-max-life":
      return maximumLife * (config.percentOfMaxLife ?? 0);
    case "fixed":
    case "level-based":
    case "rarity-based":
      return 0;
    default:
      return 0;
  }
}

// Requisito 1/3 — Recovery Layer: "observa o Adventure Tick, detecta
// fim de encontro, aplica cura, produz eventos de recuperação" — e
// "nunca conhece regras de combate". Esta função chama
// advanceAdventureWithPresentation() (Presentation Layer, intocada)
// exatamente como useAdventureSession.ts/o Simulador já chamavam antes
// desta Sprint, e só ACRESCENTA por cima: nunca recalcula dano, nunca
// muda o AdventureTickResult/PresentationEvents que a camada de baixo
// já produziu.
//
// "Após um encontro concluído com sucesso" — detectado pelo próprio
// PresentationEvent "EncounterFinished" que a Presentation Layer já
// emite (nenhuma nova leitura de AdventureSession/Adventure Loop). Como
// um tick do Adventure Loop sempre resolve um encontro inteiro por
// chamada (ver adventureLoop.ts), isso cobre exatamente os dois únicos
// desfechos possíveis de uma tick: encontro concluído com o personagem
// vivo (cura), ou o personagem morreu no meio (CharacterDied, sem
// EncounterFinished — nunca cura um morto).
export function advanceAdventureWithRecovery(
  session: AdventureSession,
  timeline: AdventureTimeline,
  options: AdvanceAdventureOptions = {},
  config: RecoveryConfig = RECOVERY_CONFIG,
): AdvanceAdventureWithRecoveryResult {
  const timestamp = options.currentTime ?? Date.now();
  const { tickResult, events, floatingNumbers } = advanceAdventureWithPresentation(session, timeline, options);

  const tickIndex = timeline.nextTickIndex - 1;
  const encounterFinished = events.some((event) => event.kind === "EncounterFinished");

  let recovery: RecoveryResult = {
    applied: false,
    reason: "encounter-finished",
    lifeBefore: session.character.currentLife,
    lifeHealed: 0,
    lifeAfter: session.character.currentLife,
    tickIndex,
  };

  if (encounterFinished && tickResult.characterAlive) {
    const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
    const healAmount = resolveHealAmount(config, finalStats.maximumLife);
    const lifeBefore = session.character.currentLife;
    const lifeAfter = Math.min(finalStats.maximumLife, lifeBefore + healAmount);
    const lifeHealed = lifeAfter - lifeBefore;

    if (lifeHealed > 0) {
      session.character.currentLife = lifeAfter;
      recovery = { applied: true, reason: "encounter-finished", lifeBefore, lifeHealed, lifeAfter, tickIndex };

      // Requisito 4 — evento próprio na Adventure Timeline (`events`
      // devolvido pra quem chamou ESTA tick, e `timeline.events`, o log
      // persistente que HUD/Event Feed já leem).
      const recoveryEvent: PresentationEvent = {
        kind: "RecoveryApplied",
        lifeBefore,
        lifeHealed,
        lifeAfter,
        reason: recovery.reason,
        tickIndex,
        timestamp,
      };
      events.push(recoveryEvent);
      timeline.events.push(recoveryEvent);

      // Requisito 5 — "número verde de cura": reaproveita o
      // FloatingNumberKind "heal" que já existe desde o Combat Feel &
      // Animation System (nunca produzido de verdade até agora — só a
      // Recovery Layer passa a gerar esse dado). O Animation Controller
      // e o CSS (`floating-number-heal`, `.hud-floating-number-heal`)
      // já sabem lidar com isso, intocados.
      floatingNumbers.push({ kind: "heal", value: lifeHealed, target: "character", tickIndex, timestamp });
    }
  }

  return { tickResult, events, floatingNumbers, recovery };
}
