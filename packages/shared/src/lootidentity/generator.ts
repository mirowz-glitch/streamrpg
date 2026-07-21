import { generateLoot } from "../lootgen/generator.js";
import type { LootResult } from "../lootgen/types.js";
import type { ItemGenRarityId } from "../itemgen/types.js";
import { resolveLootBias } from "./resolve.js";

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/4: extensão
// aditiva (ausente = comportamento idêntico a antes). `dropChanceOverride`
// garante um drop (Elite/Mini-Boss "loot especial") sem alterar
// `LootTable.dropChance` de nenhum monstro comum; `rarityMultiplierBonus`
// combina com o Rarity Bias do Monster Archetype já existente (ambos
// multiplicam o mesmo peso, "apenas pesos").
export interface GenerateMonsterLootOverrides {
  dropChanceOverride?: number;
  rarityMultiplierBonus?: number;
  minimumQuantity?: number;
}

// Pipeline completo do Monster Loot Identity Phase I:
//
//   Monster (monsterId + monsterLevel) -> Loot Identity -> Loot Table
//   -> Loot Generator -> Item Generator -> Generated Item
//
// O Loot Generator (generateLoot(), lootgen/generator.ts) continua
// sendo o único responsável por gerar os itens — esta função nunca
// chama generateItem() diretamente, só resolve o bias do monstro e
// repassa pro Loot Generator através de GenerateLootOptions (já
// existente, sem nenhuma alteração no Item Generator além do parâmetro
// aditivo `modTagWeightMultipliers`, aprovado nesta Sprint).
//
// Determinístico: mesmo monsterId + mesmo monsterLevel + mesma seed =
// mesmo LootResult (resolveLootBias() é pura, sem RNG — todo o
// determinismo já vem de generateLoot()).
export function generateMonsterLoot(
  monsterId: string,
  monsterLevel: number,
  seed: number,
  overrides: GenerateMonsterLootOverrides = {},
): LootResult {
  const bias = resolveLootBias(monsterId);

  // requisito ausente de `bias.rarityBias` cai pra 1 (neutro) — o mesmo
  // default que generateLoot() já aplica (ver generator.ts), então o
  // bônus do Elite se aplica mesmo em monstros cujo Archetype não tem
  // nenhum Rarity Bias próprio (ex.: "beast").
  const rarityWeightMultipliers: Partial<Record<ItemGenRarityId, number>> | undefined = overrides.rarityMultiplierBonus
    ? {
        magic: (bias.rarityBias.magic ?? 1) * overrides.rarityMultiplierBonus,
        rare: (bias.rarityBias.rare ?? 1) * overrides.rarityMultiplierBonus,
        unique: (bias.rarityBias.unique ?? 1) * overrides.rarityMultiplierBonus,
      }
    : bias.rarityBias;

  return generateLoot(monsterId, monsterLevel, seed, {
    baseItemWeightOverrides: bias.baseItemAffinity,
    rarityWeightMultipliers,
    modTagWeightMultipliers: bias.affixAffinity,
    dropChanceOverride: overrides.dropChanceOverride,
    minimumQuantity: overrides.minimumQuantity,
  });
}
