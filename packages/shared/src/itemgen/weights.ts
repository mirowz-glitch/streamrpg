import type { ItemGenBaseItem, ItemGenModDefinition, ItemGenRarityId } from "./types.js";

// Item Generator Phase II — combina os sinais de peso pedidos na
// Sprint pra uma rolagem específica (mod + Base Item + raridade já
// sorteada):
//
// 1. peso base (`mod.weight`).
// 2. peso por Base Item (`mod.baseItemWeights[base.id]`) — OVERRIDE
//    absoluto quando presente (ex.: Machado Physical Damage peso 120,
//    Spell Damage peso 0); ausente = usa o peso base.
// 3. peso por raridade (`mod.rarityWeights[rarity]`) — MULTIPLICADOR
//    sobre o peso já resolvido acima; ausente = 1 (neutro).
//
// Monster Loot Identity Phase I acrescentou um 4º sinal, OPCIONAL e só
// vindo de fora (nenhum mod declara isso nos próprios dados):
//
// 4. `modTagWeightMultipliers` (Affix Affinity de um Monster Archetype,
//    packages/shared/src/lootidentity/) — pra cada tag do PRÓPRIO mod
//    (`mod.tags`, ex.: Cruel tem ["damage","physical"]) que aparecer
//    neste mapa, multiplica o peso já resolvido acima. Um mod com
//    várias tags que casam acumula (produto de todos os multiplicadores
//    que baterem); tag ausente do mapa = 1 (neutro). Ausente por
//    completo = comportamento idêntico ao Phase II, sem nenhuma
//    mudança.
//
// Um resultado <= 0 significa "nunca sorteia este mod nesta combinação"
// — o gerador filtra esses casos antes mesmo de chamar pickWeighted
// (ver generator.ts), então "peso 0" é uma exclusão real, não só uma
// chance minúscula.
export function getEffectiveModWeight(
  mod: ItemGenModDefinition,
  base: ItemGenBaseItem,
  rarity: ItemGenRarityId,
  modTagWeightMultipliers?: Partial<Record<string, number>>,
): number {
  const resolvedBaseWeight = mod.baseItemWeights?.[base.id] ?? mod.weight;
  const rarityMultiplier = mod.rarityWeights?.[rarity] ?? 1;
  const tagMultiplier = modTagWeightMultipliers
    ? mod.tags.reduce((product, tag) => product * (modTagWeightMultipliers[tag] ?? 1), 1)
    : 1;
  return resolvedBaseWeight * rarityMultiplier * tagMultiplier;
}
