/**
 * Sprint 22 — Living Combat Phase I, Fase 2/3. O Combat Resolver e o
 * Combat Snapshot pedidos pelo brief: "Character API, Adventure, Idle,
 * Boss, Dungeon, Future PvP — todos utilizarão exatamente o mesmo
 * cálculo." `CombatSnapshotDTO` é o vocabulário de 7 stats + Power
 * Score + Item Score + Derived Stats pedido pelo brief — uma tradução
 * de nomes de `FinalStats` (characterbuild/), nunca um valor
 * recalculado por fora.
 */
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { combineFinalStats } from "../characterbuild/finalStats.js";
import type { FinalStats } from "../characterbuild/types.js";
import { calculateCharacterStatsFromEquippedItems } from "../equipment/realEquipmentStats.js";
import type { ActiveGemEffect } from "../socket/gemEffectResolver.js";
import type { ActiveGemBehavior } from "../socket/gemBehaviorResolver.js";
import type { GemBehaviorKind } from "../socket/gemBehavior.js";
import { EXAMPLE_GEM_DEFINITION_REGISTRY, resolveGemDisplayName } from "../socket/gemRegistry.js";
import type { EquippedItem } from "../types.js";

export interface CombatSnapshotDerivedStats {
  accuracy: number;
  movementSpeed: number;
  lifeLeech: number;
  resistances: { physical: number; fire: number; cold: number; lightning: number };
}

/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 5. Um Comportamento ativo,
 * já enriquecido com o nome da Gema e a descrição do Efeito irmão
 * (quando existe) — tudo que a UI (Fase 10: "Gema → Efeito →
 * Comportamento") precisa numa única linha, sem recalcular nada.
 */
export interface ActiveBehaviorSummary {
  socketId: string;
  gemType: string;
  gemDisplayName: string;
  effectDescription: string | null;
  behaviorId: string;
  behaviorKind: GemBehaviorKind;
  magnitude: number;
  behaviorDescription: string;
}

/** Fase 3 — campos mínimos pedidos pelo brief, nomes do brief (não os de FinalStats). */
export interface CombatSnapshotDTO {
  attack: number;
  defense: number;
  life: number;
  mana: number;
  critical: number;
  attackSpeed: number;
  magic: number;
  powerScore: number;
  itemScore: number;
  derivedStats: CombatSnapshotDerivedStats;
  // Sprint 23 — Sockets & Gems Phase II, Fase 5: "Nunca persistir.
  // Sempre derivado" — recalculado a cada `buildCombatSnapshot()`,
  // exatamente como todo o resto do Snapshot.
  activeBehaviors: ActiveBehaviorSummary[];
}

/**
 * Mapeamento FinalStats (vocabulário interno, characterbuild/) ->
 * CombatSnapshotDTO (vocabulário do brief desta Sprint): attack<-
 * physicalDamage, defense<-armor, life<-maximumLife, mana<-maximumMana,
 * critical<-criticalChance, attackSpeed<-attackSpeed (mesmo nome),
 * magic<-spellDamage, powerScore<-powerScore (mesmo nome). `itemScore`
 * não existe em FinalStats (é a soma de `power_score` dos itens
 * equipados, um conceito de "itens" — não de "atributos" — por isso
 * recebido à parte, nunca inventado dentro de FinalStats).
 */
export function finalStatsToCombatSnapshot(finalStats: FinalStats, itemScore: number, activeBehaviors: ActiveBehaviorSummary[] = []): CombatSnapshotDTO {
  return {
    attack: finalStats.physicalDamage,
    defense: finalStats.armor,
    life: finalStats.maximumLife,
    mana: finalStats.maximumMana,
    critical: finalStats.criticalChance,
    attackSpeed: finalStats.attackSpeed,
    magic: finalStats.spellDamage,
    powerScore: finalStats.powerScore,
    itemScore,
    activeBehaviors,
    derivedStats: {
      accuracy: finalStats.accuracy,
      movementSpeed: finalStats.movementSpeed,
      lifeLeech: finalStats.lifeLeech,
      resistances: { ...finalStats.resistances },
    },
  };
}

/**
 * Fase 4/5/6 — inverso exato de `finalStatsToCombatSnapshot`, pro lado
 * cliente (Adventure/Idle/Dungeon, adventure/session.ts): quando um
 * `CombatSnapshotDTO` real já veio de `/api/character`, ele precisa
 * virar `FinalStats` de novo pra alimentar o MESMO `Combatant`/
 * `resolveCombat()` que o Combat Engine sempre usou — nunca um segundo
 * vocabulário de combate no cliente. `itemScore` não tem volta (não
 * existe em FinalStats — é um conceito de "itens", não de "atributos",
 * ver `finalStatsToCombatSnapshot`), descartado aqui de propósito.
 */
export function combatSnapshotToFinalStats(snapshot: CombatSnapshotDTO): FinalStats {
  return {
    maximumLife: snapshot.life,
    maximumMana: snapshot.mana,
    physicalDamage: snapshot.attack,
    spellDamage: snapshot.magic,
    criticalChance: snapshot.critical,
    accuracy: snapshot.derivedStats.accuracy,
    attackSpeed: snapshot.attackSpeed,
    movementSpeed: snapshot.derivedStats.movementSpeed,
    armor: snapshot.defense,
    lifeLeech: snapshot.derivedStats.lifeLeech,
    resistances: { ...snapshot.derivedStats.resistances },
    powerScore: snapshot.powerScore,
  };
}

// A ÚNICA classe usada pra Base Attributes de personagens reais hoje —
// mesmo valor de `DEMO_CLASS_ID` já hardcoded em
// apps/web/src/hooks/useAdventureSession.ts (não existe seleção de
// classe real ainda, ver Fase 1 da auditoria). Reusar a mesma string
// aqui é o que garante "nunca dois cálculos de atributos": o servidor
// (Character API/Boss) e o cliente (Adventure/Idle/Dungeon) derivam
// Base/Derived Attributes do MESMO `CharacterBuild("warrior", xp)`.
export const COMBAT_SNAPSHOT_CLASS_ID = "warrior";

/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 5: junta cada Comportamento
 * ativo com o nome da Gema (`resolveGemDisplayName`) e a descrição do
 * Efeito irmão socketado na MESMA Gema/Socket (quando existe) — tudo
 * que a UI (Fase 10) precisa numa única linha, resolvido uma vez só
 * aqui, nunca recalculado por quem consome o Snapshot.
 */
function buildActiveBehaviorSummaries(activeGemBehaviors: readonly ActiveGemBehavior[], activeGemEffects: readonly ActiveGemEffect[]): ActiveBehaviorSummary[] {
  return activeGemBehaviors.map((active) => {
    const matchingEffect = activeGemEffects.find((effect) => effect.socketId === active.socketId && effect.gemType === active.gemType);
    return {
      socketId: active.socketId,
      gemType: active.gemType,
      gemDisplayName: resolveGemDisplayName(EXAMPLE_GEM_DEFINITION_REGISTRY, active.gemType),
      effectDescription: matchingEffect?.effect.description ?? null,
      behaviorId: active.behavior.id,
      behaviorKind: active.behavior.kind,
      magnitude: active.behavior.magnitude,
      behaviorDescription: active.behavior.description,
    };
  });
}

/**
 * Fase 2 — Combat Resolver: o único ponto do jogo que monta um
 * `CombatSnapshotDTO` completo a partir de dados reais de personagem
 * (xp total + itens equipados + efeitos/comportamentos de Gema já
 * resolvidos). "Nunca persistir. Sempre derivado" — nenhum campo aqui
 * é lido de uma coluna própria, tudo recalculado a cada chamada.
 */
export function buildCombatSnapshot(
  characterId: string,
  totalXp: number,
  equippedItems: readonly EquippedItem[],
  activeGemEffects: readonly ActiveGemEffect[],
  activeGemBehaviors: readonly ActiveGemBehavior[] = [],
): CombatSnapshotDTO {
  const derived = new CharacterBuild(characterId, COMBAT_SNAPSHOT_CLASS_ID, totalXp).getDerivedAttributes();
  const equipmentStats = calculateCharacterStatsFromEquippedItems(equippedItems, activeGemEffects);
  const finalStats = combineFinalStats(derived, equipmentStats);
  const itemScore = equippedItems.reduce((sum, item) => sum + (item.power_score ?? 0), 0);
  const activeBehaviors = buildActiveBehaviorSummaries(activeGemBehaviors, activeGemEffects);
  return finalStatsToCombatSnapshot(finalStats, itemScore, activeBehaviors);
}
