import type { ItemGenRarityDefinition, ItemGenRarityId } from "./types.js";

// Item Generator Phase I — requisito 2: tabela de Raridades. Tudo em
// dados (min/max prefixos, min/max sufixos, cor, peso de drop) — o
// generator.ts nunca lê o nome da raridade pra decidir nada, só esses
// campos.
//
// Simplificação assumida nesta Phase I: Magic garante sempre pelo menos
// 1 prefixo (min=1) pra nunca sortear um item "Magic" sem nenhum mod —
// Unique aqui ainda usa o mesmo pipeline procedural (prefixo/sufixo),
// só com faixas mais densas; itens Unique com pool de mods fixos
// próprios (como no Path of Exile) ficam para uma fase futura de
// craft/conteúdo especial (requisito 10), não fazem parte desta Sprint.
export const ITEM_GEN_RARITIES: ItemGenRarityDefinition[] = [
  {
    id: "common",
    label: "Common",
    color: "#9aa0a6",
    minPrefixes: 0,
    maxPrefixes: 0,
    minSuffixes: 0,
    maxSuffixes: 0,
    dropWeight: 60,
  },
  {
    id: "magic",
    label: "Magic",
    color: "#4285f4",
    minPrefixes: 1,
    maxPrefixes: 1,
    minSuffixes: 0,
    maxSuffixes: 1,
    dropWeight: 28,
  },
  {
    id: "rare",
    label: "Rare",
    color: "#fbbc04",
    minPrefixes: 1,
    maxPrefixes: 3,
    minSuffixes: 1,
    maxSuffixes: 3,
    dropWeight: 11,
  },
  {
    id: "unique",
    label: "Unique",
    color: "#ff8c1a",
    minPrefixes: 2,
    maxPrefixes: 3,
    minSuffixes: 2,
    maxSuffixes: 3,
    dropWeight: 1,
  },
];

export function getRarityDefinition(id: ItemGenRarityId): ItemGenRarityDefinition {
  const found = ITEM_GEN_RARITIES.find((rarity) => rarity.id === id);
  if (!found) throw new Error(`Item Generator: raridade desconhecida "${id}"`);
  return found;
}
