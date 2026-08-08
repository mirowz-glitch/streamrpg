import type { SphereTypeId } from "../itemization/spheres.js";
import type { GemCategory } from "../socket/gemDefinition.js";

// Loot Tables Phase I (Sprint 28) — requisito arquitetural: "Monster ->
// Loot Table -> Generator" — o gerador procedural continua existindo,
// mas passa a receber LIMITES. Pipeline completo do brief: "Mundo ->
// Região -> Bioma -> Facção -> Família -> Monster Loot Signature ->
// Monster Loot Table -> Item Generator -> Item Procedural."
//
// ACHADO CENTRAL DA AUDITORIA (Fase 1) — por que este módulo é novo e
// nunca funde com nada existente, mesmo parecendo o mais próximo de uma
// duplicação real de todas as Sprints desta série:
//
// `lootgen/types.ts` JÁ EXPORTA um `LootTable` real (`{id, weight,
// itemLevelVariance, dropChance, allowedBaseItems, baseItemWeights,
// rarityMultiplier, quantityMultiplier, quantityOptions, seedOffset}`),
// JÁ usado de verdade por `generateLoot()` (`lootgen/generator.ts`) —
// `allowedBaseItems` já É um allow-list real e já wired, um por
// `monsterId` (`lootgen/lootTables.ts`, Sprint 13). Este `LootTable`
// real NUNCA é tocado nem estendido aqui — ele já resolve "quais Bases
// este monstro pode dropar" para o pipeline de produção.
//
// `MonsterLootTable` (este módulo) é uma camada DIFERENTE, ainda
// inerte: um allow/block-list explícito, mais amplo (cobre também
// Esferas/Gemas/Materiais/Afixos, que `LootTable` real não cobre) e
// ainda não consultado por `generateLoot()`/`generateMonsterLoot()`.
// Ela é candidata a, numa Sprint futura de integração real, GATEAR o
// `LootTable.allowedBaseItems` real em vez de substituí-lo — nunca uma
// segunda fonte de verdade em produção hoje. Nomeado `MonsterLootTable`
// (nunca `LootTable`, que já existe) por exigência literal do brief,
// sem colisão de símbolo (confirmado por busca antes de implementar).
//
// `allowedBases`/`blockedBases` são sempre uma PARTIÇÃO COMPLETA do
// catálogo real de 14 Base Items (`itemgen/baseItems.ts`) — derivada de
// `MonsterLootSignature.preferredBases` (Sprint 27, já real): toda Base
// com peso próprio vira "allowed", toda Base sem peso vira "blocked".
// Mesma lógica pra Esferas (6, `itemization/spheres.ts`), Gemas (12
// categorias, `socket/gemDefinition.ts`) e Materiais (9,
// `worldregion/materialTypes.ts`). `allowedAffixes`/`blockedAffixes`
// usam o mesmo princípio sobre o universo real de tags de mod
// (`itemgen/prefixes.ts`/`suffixes.ts`) — nenhum id novo inventado em
// nenhuma das 5 dimensões.
export interface MonsterLootTable {
  id: string;
  monsterId: string;
  allowedBases: string[];
  blockedBases: string[];
  allowedAffixes: string[];
  blockedAffixes: string[];
  allowedSpheres: SphereTypeId[];
  blockedSpheres: SphereTypeId[];
  allowedGems: GemCategory[];
  blockedGems: GemCategory[];
  allowedMaterials: string[];
  blockedMaterials: string[];
  specialDrops: SpecialDrop[];
  enabled: boolean;
}

// Fase 4 — Special Drops: "Permitir registrar drops exclusivos. Nada
// funcional ainda. Só infraestrutura." Nenhum sistema real (Item
// Generator/Loot Generator/Transformation/Mythic) lê isto — um
// `SpecialDrop` nunca é um `ItemGenGeneratedItem` real, só uma
// declaração de nome/descrição, propositalmente mais simples que
// `MythicDefinition` (Sprint 18) pra nunca competir com ele.
export interface SpecialDrop {
  id: string;
  name: string;
  description: string;
}
