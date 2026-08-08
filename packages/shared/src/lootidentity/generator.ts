import { generateLoot } from "../lootgen/generator.js";
import type { LootResult } from "../lootgen/types.js";
import type { ItemGenRarityId } from "../itemgen/types.js";
import { resolveLootBias } from "./resolve.js";
import { getMonsterLootTable } from "../monsterLootTable/lootTableRegistry.js";
import { getMonsterLootSignature } from "../monsterLoot/monsterRegistry.js";
import { getWorldRegion } from "../worldregion/worldRegions.js";
import { getBaseAffinitiesForBiome } from "../worldregion/baseAffinity.js";

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/4: extensão
// aditiva (ausente = comportamento idêntico a antes). `dropChanceOverride`
// garante um drop (Elite/Mini-Boss "loot especial") sem alterar
// `LootTable.dropChance` de nenhum monstro comum; `rarityMultiplierBonus`
// combina com o Rarity Bias do Monster Archetype já existente (ambos
// multiplicam o mesmo peso, "apenas pesos").
//
// Loot Integration Phase I (Sprint 29) — `regionId`: opcional, ausente =
// comportamento idêntico a antes desta Sprint (nenhuma influência de
// Região/Bioma). Quando presente, aplica um multiplicador LEVE (Fase 4,
// "apenas multiplicadores leves. Nada extremo") em cima do bias já
// existente — nunca o substitui.
// Sprint 33 — Map Modifiers Phase II, Fase 4: `quantityMultiplierBonus`
// segue o mesmo princípio de `rarityMultiplierBonus` acima — ausente/1 =
// comportamento idêntico a antes; presente, repassa direto pro Loot
// Generator (lootgen/generator.ts: `GenerateLootOptions.quantityMultiplierBonus`),
// que já multiplica por cima de `table.quantityMultiplier`. Nenhum
// cálculo próprio aqui.
export interface GenerateMonsterLootOverrides {
  dropChanceOverride?: number;
  rarityMultiplierBonus?: number;
  quantityMultiplierBonus?: number;
  minimumQuantity?: number;
  regionId?: string;
}

// Fase 3/4 — "Assinatura complementa, nunca domina" / "apenas
// multiplicadores leves": os dois blends abaixo usam o MESMO princípio
// matemático — o peso final nunca deixa de ser primariamente o do
// Archetype (`base`), só recebe uma fração pequena (`factor`) da
// diferença entre o peso extra e o neutro (1). Um id ausente do
// Archetype mas presente na assinatura/região entra com peso BASE
// neutro (1) antes do blend — nunca aparece "do nada" com peso alto;
// ele só passa a ser um candidato REAL se também sobreviver ao gate de
// `MonsterLootTable` (Fase 2, ver `resolveAllowedBaseItemIds()`).
const SIGNATURE_BLEND_FACTOR = 0.3;
const REGION_BLEND_FACTOR = 0.2;

function blendWeight(base: number, extra: number, factor: number): number {
  return base * (1 + factor * (extra - 1));
}

function blendWeightMaps(
  base: Partial<Record<string, number>>,
  extra: Partial<Record<string, number>> | undefined,
  factor: number,
): Partial<Record<string, number>> {
  if (!extra) return base;
  const keys = new Set([...Object.keys(base), ...Object.keys(extra)]);
  const result: Partial<Record<string, number>> = {};
  for (const key of keys) {
    result[key] = blendWeight(base[key] ?? 1, extra[key] ?? 1, factor);
  }
  return result;
}

// Fase 2 — Monster Loot Table: "Antes de gerar Base: consultar
// MonsterLootTable -> allowedBases/blockedBases -> somente então Item
// Generator." Devolve `undefined` (== "sem restrição adicional", mesmo
// universo de sempre) quando a tabela não existe ou está desabilitada
// — nunca bloqueia um monstro por ausência de dado (Fase 8, "nenhum
// monstro fica sem loot").
function resolveAllowedBaseItemIds(monsterId: string): readonly string[] | undefined {
  const table = getMonsterLootTable(monsterId);
  if (!table || !table.enabled) return undefined;
  return table.allowedBases;
}

// Pipeline completo do Monster Loot Identity Phase I:
//
//   Monster (monsterId) + Item Level Anchor -> Loot Identity -> Loot
//   Table -> Loot Generator -> Item Generator -> Generated Item
//
// O Loot Generator (generateLoot(), lootgen/generator.ts) continua
// sendo o único responsável por gerar os itens — esta função nunca
// chama generateItem() diretamente, só resolve o bias do monstro e
// repassa pro Loot Generator através de GenerateLootOptions (já
// existente, sem nenhuma alteração no Item Generator além do parâmetro
// aditivo `modTagWeightMultipliers`, aprovado nesta Sprint).
//
// Region-Anchored Item Level — `itemLevelAnchor` já foi `monsterLevel`;
// desde a Sprint "Region-Anchored Item Level" quem chama esta função
// (enemy/lootIntegration.ts) já resolve getRegionItemLevelAnchor(regionId)
// antes de chegar aqui — esta função não sabe nem precisa saber disso.
//
// Determinístico: mesmo monsterId + mesmo itemLevelAnchor + mesma seed =
// mesmo LootResult (resolveLootBias() é pura, sem RNG — todo o
// determinismo já vem de generateLoot()).
export function generateMonsterLoot(
  monsterId: string,
  itemLevelAnchor: number,
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

  // Fase 3 — Monster Loot Signature: influência leve sobre o peso de
  // Base/Affix já resolvido pelo Archetype — nunca o substitui (ver
  // `blendWeightMaps`, SIGNATURE_BLEND_FACTOR).
  const signature = getMonsterLootSignature(monsterId);
  let baseItemAffinity = blendWeightMaps(bias.baseItemAffinity, signature?.preferredBases, SIGNATURE_BLEND_FACTOR);
  const affixAffinity = blendWeightMaps(bias.affixAffinity, signature?.preferredAffixes, SIGNATURE_BLEND_FACTOR);

  // Fase 4 — World Region: multiplicador leve adicional sobre o peso de
  // Base, só quando `regionId` é passado (opcional — ausente preserva
  // 100% do comportamento de antes desta Sprint, inclusive pros 2 sites
  // de teste que chamam generateMonsterLoot() sem região nenhuma).
  if (overrides.regionId) {
    const region = getWorldRegion(overrides.regionId);
    if (region) {
      baseItemAffinity = blendWeightMaps(baseItemAffinity, getBaseAffinitiesForBiome(region.biome), REGION_BLEND_FACTOR);
    }
  }

  return generateLoot(monsterId, itemLevelAnchor, seed, {
    baseItemWeightOverrides: baseItemAffinity,
    rarityWeightMultipliers,
    modTagWeightMultipliers: affixAffinity,
    dropChanceOverride: overrides.dropChanceOverride,
    minimumQuantity: overrides.minimumQuantity,
    quantityMultiplierBonus: overrides.quantityMultiplierBonus,
    // Fase 2 — Monster Loot Table: restrição rígida (allow/block), com
    // fallback seguro já garantido dentro de generateLoot()/
    // rollBaseItemId() (Fase 8, "nenhuma Loot Table fica vazia").
    allowedBaseItemIds: resolveAllowedBaseItemIds(monsterId),
  });
}
