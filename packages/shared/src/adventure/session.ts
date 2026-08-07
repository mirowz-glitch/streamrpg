import type { CharacterBuild } from "../characterbuild/characterBuild.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import type { FinalStats } from "../characterbuild/types.js";
import type { Inventory } from "../inventory/inventory.js";
import type { Equipment } from "../equipment/equipment.js";
import type { Combatant } from "../combat/types.js";
import { combatSnapshotToFinalStats } from "../combat/combatSnapshot.js";
import { getMapDefinition } from "../worldmap/mapRegistry.js";
import type { RareMapInstance } from "../raremap/types.js";
import type { CorruptedMap } from "../mapcorruption/types.js";
import type { AdventureConfiguration } from "../atlas/types.js";
import type { AdventureCharacter, AdventureSession, AdventureSessionResult } from "./types.js";

const DEFAULT_CRITICAL_MULTIPLIER = 1.5;

// Sprint 22 — Living Combat Phase I, Fase 4/5/6: os dois lugares deste
// arquivo que precisam de FinalStats (aqui e toAdventureCombatant())
// preferem `character.realCombatSnapshot` quando presente — o MESMO
// Combat Snapshot que Character API/Boss consultam — e caem no cálculo
// antigo (Equipment-class/kit de sessão) só quando ausente. "Nunca
// dois cálculos de combate": esta é a ÚNICA função que decide qual dos
// dois usar, nunca duplicada nos dois call sites.
function resolveFinalStats(character: AdventureCharacter): FinalStats {
  return character.realCombatSnapshot
    ? combatSnapshotToFinalStats(character.realCombatSnapshot)
    : calculateFinalStats(character.characterBuild, character.equipment);
}

// Requisito 1 — monta o "Character" do diagrama de arquitetura a
// partir dos 3 sistemas já existentes (Character Build/Inventory/
// Equipment), sem duplicar nenhum dado deles. `currentLife` começa em
// `maximumLife` (personagem recém-montado, cheio de vida).
export function createAdventureCharacter(
  characterBuild: CharacterBuild,
  inventory: Inventory,
  equipment: Equipment,
  criticalMultiplier: number = DEFAULT_CRITICAL_MULTIPLIER,
  realCombatSnapshot?: AdventureCharacter["realCombatSnapshot"],
): AdventureCharacter {
  const finalStats = realCombatSnapshot ? combatSnapshotToFinalStats(realCombatSnapshot) : calculateFinalStats(characterBuild, equipment);
  return {
    characterBuild,
    inventory,
    equipment,
    criticalMultiplier,
    currentLife: finalStats.maximumLife,
    realCombatSnapshot,
  };
}

// Requisito 1 — cria uma AdventureSession nova, sem nenhum encontro em
// andamento ainda (o primeiro advanceAdventure() gera o primeiro).
//
// Sprint 31 — Map Integration Phase I, Fase 2: `regionId` continua o
// único parâmetro real recebido (nenhuma assinatura pública muda) —
// `currentMapId` é sempre DERIVADO dele aqui, via `getMapDefinition()`
// (worldmap/mapRegistry.ts, Sprint 30). Como `Map.id === Map.regionId`
// pra toda região jogável real nesta Fase, o fallback `?? regionId`
// (quando `regionId` for uma região sem Mapa, ex.: um hub/teste
// isolado) preserva EXATAMENTE o mesmo valor que `currentRegion` já
// teria de qualquer forma — nunca uma sessão sem `currentMapId`
// resolvido.
// Sprint 34 — Rare Maps Phase I, Fase 5: "Adventure passa a aceitar
// RareMapInstance... Sem qualquer outro código. Reutilizar toda
// Sprint 33." `rareMap` é o único parâmetro novo (6º, opcional —
// nenhuma das 35 chamadas existentes de `createAdventureSession()`
// muda de comportamento) — quando presente, `activeMapModifiers`
// recebe `RareMap.mods` em vez de `[]`; NENHUM outro campo da sessão é
// tocado (`currentMapId`/`currentRegion` continuam vindo só de
// `regionId`, exatamente como antes — "Rare Maps... Nunca alteram
// World Region. Nunca alteram Enemy Pool. Apenas carregam Map Mods.").
// A partir daqui, todo o pipeline de efeito real já construído na
// Sprint 33 (dungeon/dungeonController.ts's `applyMapModifiers()`)
// passa a operar sobre Mods vindos de um Rare Map de verdade, sem
// nenhuma mudança de código além desta.
// Sprint 35 — Corrupted Maps Phase I, Fase 5: "Adventure aceita
// CorruptedMap... activeMapModifiers = Mods do mapa corrompido.
// Reutilizar toda Sprint 33." O mesmo 6º parâmetro que já aceitava
// `RareMapInstance` (Sprint 34) agora aceita `CorruptedMap` também —
// os dois tipos compartilham o mesmo campo real (`mods:
// MapModifierId[]`), e é só ele que este parâmetro sempre leu. Nenhum
// campo novo, nenhuma lógica nova — "Mapa Corrompido continua sendo
// uma instância" (Decisões Oficiais), tratado aqui exatamente como um
// Rare Map já era.
export function createAdventureSession(
  sessionId: string,
  character: AdventureCharacter,
  regionId: string,
  seed: number,
  startTime: number = Date.now(),
  rareMap?: RareMapInstance | CorruptedMap,
): AdventureSession {
  return {
    sessionId,
    character,
    currentMapId: getMapDefinition(regionId)?.id ?? regionId,
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
    // Sprint 32 — Map Modifiers Phase I, Fase 5 / Sprint 34 — Rare Maps
    // Phase I, Fase 5: `[]` continua o padrão (nenhum Rare Map
    // presente); `rareMap.mods` quando um Rare Map real foi passado.
    activeMapModifiers: rareMap?.mods ?? [],
  };
}

// Sprint 36 — Atlas Phase I, Fase 5: "Adventure passa a aceitar
// AdventureConfiguration internamente. Toda a lógica existente
// continua. A única diferença é: Adventure -> Map Device ->
// AdventureSession." "Nunca duplicar lógica" (Decisões Oficiais): esta
// função NUNCA reimplementa a montagem de sessão — ela só desempacota
// `AdventureConfiguration` (`mapId`/`rareMap`, atlas/types.ts, produzido
// por um Map Device real) nos mesmos parâmetros posicionais que
// `createAdventureSession()` já aceita desde sempre, e delega 100%.
// `createAdventureSession()` em si permanece byte-a-byte intocada —
// todas as suas ~40 chamadas existentes continuam válidas.
export function createAdventureSessionFromConfiguration(
  sessionId: string,
  character: AdventureCharacter,
  configuration: AdventureConfiguration,
  seed: number,
  startTime: number = Date.now(),
): AdventureSession {
  return createAdventureSession(sessionId, character, configuration.mapId, seed, startTime, configuration.rareMap);
}

// Requisito 8 (integração) — monta o Combatant que o Combat Engine
// espera a partir do AdventureCharacter. `finalStats` é sempre
// recalculado na hora (mesmo princípio do Enemy System — nunca
// guardado à parte).
export function toAdventureCombatant(character: AdventureCharacter): Combatant {
  return {
    finalStats: resolveFinalStats(character),
    criticalMultiplier: character.criticalMultiplier,
    currentLife: character.currentLife,
  };
}

// Requisito 5 — Session Result: "nenhuma dependência de interface", só
// um resumo de dados, pronto pra qualquer camada (log, UI futura,
// testes) consumir sem precisar entender a AdventureSession inteira.
export function getSessionResult(session: AdventureSession): AdventureSessionResult {
  const finalStats = resolveFinalStats(session.character);
  return {
    sessionId: session.sessionId,
    characterId: session.character.characterBuild.characterId,
    mapId: session.currentMapId,
    region: session.currentRegion,
    statistics: { ...session.statistics },
    finalLevel: session.character.characterBuild.level,
    currentLife: session.character.currentLife,
    maximumLife: finalStats.maximumLife,
    alive: session.character.currentLife > 0,
    seed: session.seed,
  };
}
