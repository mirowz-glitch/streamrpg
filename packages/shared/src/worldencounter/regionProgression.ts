import { getEncounterTable } from "./encounterTables.js";
import { getNextBiome } from "./biomes.js";

export interface RegionUnlockCheck {
  unlocked: boolean;
  newRegionId: string | null;
}

// Biomes, Regions & World Progression Phase I — requisito 4: "quando a
// faixa de nível for atingida, desbloquear automaticamente o próximo
// bioma." Função pura, sem efeito colateral — só decide SE deveria
// desbloquear; quem aplica a mutação (session.currentRegion) e emite os
// eventos é o Objective System (objectives/objectiveLayer.ts, já
// existente — nenhum wrapper novo).
//
// Condição = nível do personagem já >= o nível MÍNIMO da Encounter
// Table do PRÓXIMO bioma na sequência (BIOME_PROGRESSION, biomes.ts) —
// nenhum número novo inventado, reaproveita a faixa de nível que já
// existe pra aquela região. "unlockedRegionIds" evita desbloquear a
// mesma região duas vezes (ex.: se o personagem sobe de nível de novo
// dentro da mesma região já desbloqueada).
export function checkRegionUnlock(
  currentRegionId: string,
  characterLevel: number,
  unlockedRegionIds: readonly string[],
): RegionUnlockCheck {
  const nextBiome = getNextBiome(currentRegionId);
  if (!nextBiome) return { unlocked: false, newRegionId: null };
  if (unlockedRegionIds.includes(nextBiome.regionId)) return { unlocked: false, newRegionId: null };

  const nextTable = getEncounterTable(nextBiome.regionId);
  if (!nextTable) return { unlocked: false, newRegionId: null };

  if (characterLevel >= nextTable.levelRange.min) {
    return { unlocked: true, newRegionId: nextBiome.regionId };
  }
  return { unlocked: false, newRegionId: null };
}
