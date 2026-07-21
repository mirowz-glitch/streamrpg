import type { CharacterBuild } from "../characterbuild/characterBuild.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import type { Inventory } from "../inventory/inventory.js";
import type { Equipment } from "../equipment/equipment.js";
import type { Combatant } from "../combat/types.js";
import type { AdventureCharacter, AdventureSession, AdventureSessionResult } from "./types.js";

const DEFAULT_CRITICAL_MULTIPLIER = 1.5;

// Requisito 1 — monta o "Character" do diagrama de arquitetura a
// partir dos 3 sistemas já existentes (Character Build/Inventory/
// Equipment), sem duplicar nenhum dado deles. `currentLife` começa em
// `maximumLife` (personagem recém-montado, cheio de vida).
export function createAdventureCharacter(
  characterBuild: CharacterBuild,
  inventory: Inventory,
  equipment: Equipment,
  criticalMultiplier: number = DEFAULT_CRITICAL_MULTIPLIER,
): AdventureCharacter {
  const finalStats = calculateFinalStats(characterBuild, equipment);
  return {
    characterBuild,
    inventory,
    equipment,
    criticalMultiplier,
    currentLife: finalStats.maximumLife,
  };
}

// Requisito 1 — cria uma AdventureSession nova, sem nenhum encontro em
// andamento ainda (o primeiro advanceAdventure() gera o primeiro).
export function createAdventureSession(
  sessionId: string,
  character: AdventureCharacter,
  regionId: string,
  seed: number,
  startTime: number = Date.now(),
): AdventureSession {
  return {
    sessionId,
    character,
    currentRegion: regionId,
    currentEncounter: null,
    statistics: {
      encountersCompleted: 0,
      enemiesKilled: 0,
      damageDealt: 0,
      damageTaken: 0,
      itemsFound: 0,
      itemsEquipped: 0,
      goldFound: 0,
      elapsedTime: 0,
    },
    seed,
    startTime,
    futureHooks: {},
  };
}

// Requisito 8 (integração) — monta o Combatant que o Combat Engine
// espera a partir do AdventureCharacter. `finalStats` é sempre
// recalculado na hora (mesmo princípio do Enemy System — nunca
// guardado à parte).
export function toAdventureCombatant(character: AdventureCharacter): Combatant {
  return {
    finalStats: calculateFinalStats(character.characterBuild, character.equipment),
    criticalMultiplier: character.criticalMultiplier,
    currentLife: character.currentLife,
  };
}

// Requisito 5 — Session Result: "nenhuma dependência de interface", só
// um resumo de dados, pronto pra qualquer camada (log, UI futura,
// testes) consumir sem precisar entender a AdventureSession inteira.
export function getSessionResult(session: AdventureSession): AdventureSessionResult {
  const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
  return {
    sessionId: session.sessionId,
    characterId: session.character.characterBuild.characterId,
    region: session.currentRegion,
    statistics: { ...session.statistics },
    finalLevel: session.character.characterBuild.level,
    currentLife: session.character.currentLife,
    maximumLife: finalStats.maximumLife,
    alive: session.character.currentLife > 0,
    seed: session.seed,
  };
}
