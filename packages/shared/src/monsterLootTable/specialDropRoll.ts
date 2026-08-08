import { createSeededRandom } from "../itemgen/rng.js";
import { getMonsterLootTable } from "./lootTableRegistry.js";
import type { SpecialDrop } from "./types.js";

// Fase 5 — Special Drops: "Permitir que MonsterLootTable.specialDrops
// entre na rolagem. Ainda extremamente raro. Nenhum item novo. Somente
// infraestrutura." Leitura literal: a ROLAGEM em si passa a ser real e
// determinística (mesmo stream de seed que o resto do loot), mas o
// resultado NUNCA vira um `ItemGenGeneratedItem` persistido — nenhuma
// chamada real (`enemy/lootIntegration.ts`/`adventureLoop.ts`) lê o
// retorno desta função ainda. "Nenhum item novo" é respeitado ao pé da
// letra: mesmo quando a rolagem "acerta", nada é criado, salvo ou
// concedido — só a possibilidade de identificar QUAL Special Drop
// teria sido sorteado, pra uma Sprint futura decidir o que fazer com
// isso.
//
// `SPECIAL_DROP_CHANCE` (1 em 100.000) usa a mesma ordem de grandeza já
// validada pra "extremamente raro" no jogo — o Item Mítico via Esfera
// da Incerteza (`transformation/resolver.test.ts`: 1/100.000, "Anel do
// Primeiro Rei") — nunca um número novo inventado sem lastro.
export const SPECIAL_DROP_CHANCE = 1 / 100_000;

export function rollSpecialDropForMonster(monsterId: string, seed: number): SpecialDrop | null {
  const table = getMonsterLootTable(monsterId);
  if (!table || !table.enabled || table.specialDrops.length === 0) return null;

  const rng = createSeededRandom(seed);
  if (rng() >= SPECIAL_DROP_CHANCE) return null;

  // Múltiplos Special Drops no mesmo monstro (nenhum caso real hoje,
  // todos os 3 exemplos da Sprint 28 têm exatamente 1) dividem a mesma
  // chance rara em partes iguais — nunca somam chances, nunca um
  // segundo sorteio.
  const index = Math.floor(rng() * table.specialDrops.length);
  return table.specialDrops[index] ?? null;
}
