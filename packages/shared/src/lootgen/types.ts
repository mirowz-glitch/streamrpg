import type { ItemGenGeneratedItem } from "../itemgen/types.js";

// Loot Generator Phase I — tipos isolados de propósito, prefixados
// `Loot*` pra nunca colidir com nada de itemgen/ ou do resto de
// packages/shared. Consome o Item Generator (itemgen/generator.ts) só
// através de `generateItem()` — nunca monta um ItemGenGeneratedItem à
// mão.

// Requisito 3 ("Quantidade de itens... 0, 1, 2, 3... Não utilizar
// ifs"): distribuição ponderada de quantidade, sorteada com o mesmo
// pickWeighted() já usado pelo Item Generator — nenhum if/switch decide
// "quantos itens", só a tabela.
export interface LootQuantityOption {
  quantity: number;
  weight: number;
}

// Requisito 5 ("Currency... Ainda não implementar economia. Somente
// tipos."): só o tipo existe nesta fase. `LootResult.currencies` fica
// sempre `[]` no Phase I — nenhuma Loot Table rola currency ainda.
export type LootCurrencyType = "gold" | "craft_material" | "fragment" | "boss_material" | "rune";

export interface LootCurrencyDrop {
  type: LootCurrencyType;
  amount: number;
}

// Loot Table — uma por entidade (Wolf/Goblin/Skeleton/Bandit/Chest/
// Boss). Requisito 1: id/peso/nível mínimo/nível máximo/chance de
// drop/baseItems permitidos/multiplicador de raridade/multiplicador de
// quantidade/seed offset — tudo em dados, nada hardcoded no gerador
// (lootgen/generator.ts nunca lê o `id` pra decidir comportamento).
//
// - `minLevel`/`maxLevel`: limites do Item Level calculado (requisito
//   2) — o Item Level nunca sai desse intervalo, mesmo com a variação
//   aleatória.
// - `itemLevelVariance`: tamanho da variação aleatória em torno do
//   nível do monstro (ex.: monstro nível 20 + variance 2 = Item Level
//   entre 18 e 22, sempre dentro de [minLevel, maxLevel]).
// - `dropChance`: requisito 4, "chance de dropar item" — completamente
//   separada da raridade/base item/mods (cada uma tem seu próprio sorteio
//   independente em lootgen/generator.ts).
// - `allowedBaseItems`/`baseItemWeights`: requisito 4, "chance do Base
//   Item" — quais ItemGenBaseItem.id podem sair desta tabela e com que
//   peso relativo; peso ausente pra um id cai para 1 (default).
// - `rarityMultiplier`: requisito 4, "chance da raridade" — multiplica
//   o peso de Magic/Rare/Unique na Rarity Roll do Item Generator (via
//   `GenerateItemOptions.rarityWeightMultipliers`, itemgen/generator.ts);
//   Common nunca é multiplicada (é o "sem sorte" de referência).
// - `quantityOptions`/`quantityMultiplier`: requisito 3 — distribuição
//   ponderada de quantidade, escalada pelo multiplicador da tabela.
// - `seedOffset`: requisito 6 — somado à seed recebida antes de criar o
//   PRNG desta tabela, pra tabelas diferentes nunca produzirem streams
//   correlacionados mesmo reutilizando a mesma seed "crua".
// - `weight`: reservado pra quando um Loot Source puder escolher entre
//   VÁRIAS Loot Tables (ex.: Rare Encounters, fase futura); nesta Phase
//   I cada `sourceId` sempre resolve exatamente 1 tabela, então este
//   campo ainda não é lido por lootgen/generator.ts.
export interface LootTable {
  id: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
  itemLevelVariance: number;
  dropChance: number;
  allowedBaseItems: string[];
  baseItemWeights: Partial<Record<string, number>>;
  rarityMultiplier: number;
  quantityMultiplier: number;
  quantityOptions: LootQuantityOption[];
  seedOffset: number;
}

// Resultado do Loot Generator (requisito 7) — sem qualquer dependência
// de interface (nenhum campo de exibição/UI, só dados).
export interface LootResult {
  generatedItems: ItemGenGeneratedItem[];
  currencies: LootCurrencyDrop[];
  totalPower: number;
  totalValue: number;
  seed: number;
}
