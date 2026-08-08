import { generateItem } from "../itemgen/generator.js";
import { createSeededRandom, pickWeighted, randomInt, type ItemGenRandom } from "../itemgen/rng.js";
import type { ItemGenGeneratedItem, ItemGenRarityId } from "../itemgen/types.js";
import { getLootTable } from "./lootTables.js";
import type { LootResult, LootTable } from "./types.js";

// Valoração ilustrativa, não calibrada (mesma convenção de
// CRITICAL_HIT_CHANCE/itemgen pesos) — só existe pra `totalValue` já
// ser um número real desde já; balanceamento de economia é decisão
// futura (requisito 5: "ainda não implementar economia").
const RARITY_VALUE_MULTIPLIER: Record<ItemGenRarityId, number> = {
  common: 1,
  magic: 2,
  rare: 4,
  unique: 10,
};

const MINIMUM_ITEM_LEVEL = 1;

// Loot Table Normalization Phase I — `itemLevelAnchor` (Region-Anchored
// Item Level, regions.ts) já é a única fonte de progressão pra Item
// Level; `table.minLevel`/`maxLevel` foram removidos (verificado: eram
// 100% duplicados de `EnemyTemplate.levelRange`, nunca um dado próprio
// da Loot Table — ver LootTable.itemLevelOffset em types.ts). Requisito
// 2 do Loot Generator original ("nível do monstro + variação") agora é
// "anchor de região + offset opcional da tabela + variação" — o único
// limite que resta é o piso absoluto (nunca abaixo de 1); não há mais
// teto próprio da tabela, porque o anchor de região já é, por
// construção, o único teto (regions.ts: HIGHEST_AFFIX_TIER_THRESHOLD).
function rollItemLevel(rng: ItemGenRandom, itemLevelAnchor: number, table: LootTable): number {
  const raw = itemLevelAnchor + (table.itemLevelOffset ?? 0) + randomInt(rng, -table.itemLevelVariance, table.itemLevelVariance);
  return Math.max(MINIMUM_ITEM_LEVEL, raw);
}

// Requisito 4 — "chance do Base Item": sorteio ponderado e independente
// de qual Base Item sai, só entre os `allowedBaseItems` desta tabela;
// peso ausente pra um id cai para 1 (default), sem nenhum if/switch por
// id. `baseItemWeightOverrides` (Monster Loot Identity — Base Item
// Affinity) multiplica esse peso por fora; ausente = 1 (neutro).
//
// Loot Integration Phase I (Sprint 29) — `restrictedBaseItemIds`
// (Monster Loot Table, Fase 2) INTERSECTA (nunca substitui)
// `table.allowedBaseItems` — a Loot Table real desta função continua
// sendo a única fonte de verdade sobre o universo de Bases desta fonte;
// Monster Loot Table só pode ESTREITAR esse universo, nunca alargá-lo.
// Fallback de segurança (Fase 8, "nenhuma Loot Table fica vazia"): se a
// interseção for vazia (Monster Loot Table e Loot Table real nunca
// tiveram nenhuma auditoria cruzada até esta Sprint), volta pro
// universo original da tabela — nenhum monstro pode ficar sem loot por
// causa de uma restrição mais nova.
function rollBaseItemId(
  rng: ItemGenRandom,
  table: LootTable,
  baseItemWeightOverrides: Partial<Record<string, number>> | undefined,
  restrictedBaseItemIds: readonly string[] | undefined,
): string {
  const intersected = restrictedBaseItemIds ? table.allowedBaseItems.filter((id) => restrictedBaseItemIds.includes(id)) : table.allowedBaseItems;
  const pool = intersected.length > 0 ? intersected : table.allowedBaseItems;
  const candidates = pool.map((id) => ({
    id,
    weight: (table.baseItemWeights[id] ?? 1) * (baseItemWeightOverrides?.[id] ?? 1),
  }));
  return pickWeighted(rng, candidates).id;
}

function estimateItemValue(item: ItemGenGeneratedItem): number {
  return item.powerScore * RARITY_VALUE_MULTIPLIER[item.rarity];
}

// Monster Loot Identity Phase I (packages/shared/src/lootidentity)
// precisa enviesar 3 sinais do Loot Generator a partir de fora (Base
// Item Affinity, Affix Affinity, Rarity Bias de um Monster Archetype),
// sem duplicar nenhuma lógica de sorteio que já existe aqui. Todos os
// campos são opcionais, com default `{}` — nenhuma chamada existente de
// generateLoot(sourceId, itemLevelAnchor, seed) muda de comportamento.
// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/4:
// `dropChanceOverride` também é aditivo/opcional (ausente = usa
// `table.dropChance` normalmente, nenhuma chamada existente muda de
// comportamento) — garante um drop pra Elite/Mini-Boss ("loot
// especial") sem alterar `LootTable.dropChance` de nenhum monstro
// comum.
export interface GenerateLootOptions {
  baseItemWeightOverrides?: Partial<Record<string, number>>;
  rarityWeightMultipliers?: Partial<Record<ItemGenRarityId, number>>;
  modTagWeightMultipliers?: Partial<Record<string, number>>;
  dropChanceOverride?: number;
  minimumQuantity?: number;
  // Loot Integration Phase I (Sprint 29) — Monster Loot Table
  // (monsterLootTable/), opcional, ausente = comportamento idêntico a
  // antes desta Sprint. Ver `rollBaseItemId()`.
  allowedBaseItemIds?: readonly string[];
  // Sprint 33 — Map Modifiers Phase II, Fase 4: multiplicador puro POR
  // CIMA de `table.quantityMultiplier` — o eixo que faltava pra
  // `loot-quantity-up` existir de verdade ("Somente modificar pesos",
  // nunca ignorar a Loot Table: a quantidade base ainda vem 100% da
  // tabela, isto só escala o resultado já calculado). Ausente/1 =
  // comportamento idêntico a antes desta Sprint.
  quantityMultiplierBonus?: number;
}

// Pipeline completo do Loot Generator (requisitos 1-7):
//
//   Loot Source (sourceId + itemLevelAnchor) -> Loot Table -> Drop Chance ->
//   Quantidade -> (Item Level -> Base Item -> generateItem()) x N ->
//   LootResult
//
// Toda geração de item passa OBRIGATORIAMENTE por generateItem() —
// nenhum item é montado à mão aqui.
//
// Region-Anchored Item Level (regions.ts) — `itemLevelAnchor` já foi
// `monsterLevel` (nível do monstro abatido); desde a Sprint "Region-
// Anchored Item Level" passou a ser getRegionItemLevelAnchor(regionId)
// pra todo chamador real (enemy/lootIntegration.ts, dungeonController.ts,
// presentationLayer.ts) — este arquivo nunca soube nem precisa saber
// disso, só recebe um `number`, exatamente como antes.
//
// Determinístico (requisito 6): mesmo sourceId + mesmo itemLevelAnchor +
// mesma seed = mesmo LootResult, sempre. `table.seedOffset` é somado à
// seed recebida antes de criar o PRNG desta tabela — puro dado
// constante, não quebra determinismo, só evita que tabelas diferentes
// produzam streams correlacionados ao reutilizar a mesma seed "crua".
//
// Requisito 4 (independência total): "chance de dropar item"
// (`dropChance`), "chance da raridade" (delegada ao Item Generator via
// `rarityWeightMultipliers`), "chance do Base Item" (`rollBaseItemId`)
// e "chance dos mods" (inteiramente dentro de generateItem(), Affix
// System do Phase II) são 4 sorteios completamente separados — nenhum
// depende do resultado dos outros.
//
// Data-driven (requisito 8): nenhuma etapa faz `if (sourceId === "...")`
// — tudo vem de LOOT_TABLES. Adicionar um monstro ou um baú novo é só
// inserir um registro em lootTables.ts.
export function generateLoot(
  sourceId: string,
  itemLevelAnchor: number,
  seed: number,
  options: GenerateLootOptions = {},
): LootResult {
  const table = getLootTable(sourceId);
  if (!table) {
    throw new Error(`Loot Generator: Loot Table desconhecida "${sourceId}"`);
  }

  const rng = createSeededRandom(seed + table.seedOffset);

  // Requisito 4 — "chance de dropar item": gate independente, primeiro
  // e único responsável por decidir se ALGUMA coisa acontece.
  const effectiveDropChance = options.dropChanceOverride ?? table.dropChance;
  const dropped = rng() < effectiveDropChance;
  if (!dropped) {
    return { generatedItems: [], currencies: [], totalPower: 0, totalValue: 0, seed };
  }

  // Requisito 3 — quantidade: distribuição ponderada (nenhum if/switch),
  // escalada pelo multiplicador da tabela.
  const quantityRoll = pickWeighted(rng, table.quantityOptions);
  const quantity = Math.max(
    options.minimumQuantity ?? 0,
    Math.round(quantityRoll.quantity * table.quantityMultiplier * (options.quantityMultiplierBonus ?? 1)),
  );

  // Requisito 4 — "chance da raridade": o multiplicador da Loot Table
  // vira um viés por raridade pro Item Generator (Common nunca é
  // multiplicada — é a "raridade de referência"), combinado com o
  // Rarity Bias do Monster Archetype (`options.rarityWeightMultipliers`,
  // Monster Loot Identity), quando presente.
  const rarityWeightMultipliers: Partial<Record<ItemGenRarityId, number>> = {
    magic: table.rarityMultiplier * (options.rarityWeightMultipliers?.magic ?? 1),
    rare: table.rarityMultiplier * (options.rarityWeightMultipliers?.rare ?? 1),
    unique: table.rarityMultiplier * (options.rarityWeightMultipliers?.unique ?? 1),
  };

  const generatedItems: ItemGenGeneratedItem[] = [];
  for (let i = 0; i < quantity; i++) {
    const itemLevel = rollItemLevel(rng, itemLevelAnchor, table);
    const baseItemId = rollBaseItemId(rng, table, options.baseItemWeightOverrides, options.allowedBaseItemIds);
    // Seed própria por item, derivada do MESMO stream determinístico —
    // generateItem() nunca reaproveita a seed da Loot Table diretamente,
    // então dois itens da mesma rolagem nunca saem idênticos por
    // coincidência de seed.
    const itemSeed = randomInt(rng, 0, 2_147_483_647);
    generatedItems.push(
      generateItem(baseItemId, itemLevel, itemSeed, {
        rarityWeightMultipliers,
        modTagWeightMultipliers: options.modTagWeightMultipliers,
      }),
    );
  }

  const totalPower = generatedItems.reduce((sum, item) => sum + item.powerScore, 0);
  const totalValue = generatedItems.reduce((sum, item) => sum + estimateItemValue(item), 0);

  return {
    generatedItems,
    // Requisito 5 — Currency: só o tipo existe nesta fase (types.ts);
    // nenhuma Loot Table rola currency ainda, então fica sempre vazio.
    currencies: [],
    totalPower,
    totalValue,
    seed,
  };
}
