import type { ItemGenRarityId } from "../itemgen/types.js";
import type { LootCurrencyType } from "../lootgen/types.js";

// Monster Loot Identity Phase I — tipos isolados de propósito,
// prefixados `Monster*`/`Loot*` pra nunca colidir com nada de itemgen/
// ou lootgen/. Esta camada não gera item nenhum sozinha — ela só
// resolve VIESES (multiplicadores) que o Loot Generator já sabe
// aplicar (generateLoot()'s GenerateLootOptions).

// Requisito 6 — Future Hooks: campos aceitos por tipagem, nunca lidos
// pela lógica de resolução desta fase (resolve.ts). Preparados pra
// Magic Find/Difficulty/Season Modifiers/World Events/Map
// Modifiers/Party Bonus, sem nenhuma lógica implementada ainda.
export interface LootModifierHooks {
  magicFind?: number;
  difficulty?: number;
  seasonModifier?: string;
  worldEvent?: string;
  mapModifier?: string;
  partyBonus?: number;
}

// Requisito 2/3/4 — o bias completo de um Archetype (ou de um override
// por monstro): afinidade por Base Item, afinidade por tag de mod
// (Affix Affinity) e viés de raridade. Tudo multiplicador, nunca um
// valor absoluto — "isso influencia apenas os pesos, nunca garante
// drops" (requisito 2).
export interface MonsterLootBias {
  baseItemAffinity: Partial<Record<string, number>>;
  affixAffinity: Partial<Record<string, number>>;
  rarityBias: Partial<Record<ItemGenRarityId, number>>;
}

// Monster Archetype — requisito 1: id/nome/tags/lootBias/
// currencyBias/futureCraftBias. Nenhuma lógica hardcoded lê o `id` do
// arquétipo pra decidir comportamento (resolve.ts só combina números).
export interface MonsterArchetype {
  id: string;
  name: string;
  tags: string[];
  lootBias: MonsterLootBias;
  // Requisito 5 — Currency Identity: só arquitetura ("ainda não
  // implementar moedas"), mesmo tratamento do Loot Generator Phase I
  // (LootResult.currencies sempre `[]`). Pesos aqui são ilustrativos,
  // relativos entre si, nunca consumidos por nenhuma rolagem real
  // ainda.
  currencyBias: Partial<Record<LootCurrencyType, number>>;
  // Placeholder pra uma futura Sprint de Craft — chaves livres
  // (nomes de material ainda não existem em nenhum sistema real),
  // nunca lido por resolve.ts.
  futureCraftBias: Partial<Record<string, number>>;
}

// Monster Loot Identity — um registro por CRIATURA de verdade (não por
// categoria). Referencia um Archetype e pode opcionalmente refinar
// (multiplicar em cima) o bias dele — ex.: "Bandit Captain" é do
// arquétipo "bandit", mas tem sorte de raridade própria, maior que a de
// um Bandit raso do mesmo arquétipo.
export interface MonsterLootIdentity {
  monsterId: string;
  archetypeId: string;
  lootBiasOverride?: Partial<MonsterLootBias>;
  currencyBiasOverride?: Partial<Record<LootCurrencyType, number>>;
  // Requisito 6 — mesmo princípio do Archetype: aceito por tipagem,
  // nunca lido pela lógica de resolução desta fase.
  futureHooks?: LootModifierHooks;
}

// Resultado de resolveLootBias() — o bias JÁ COMBINADO (Archetype x
// override do monstro), pronto pra virar GenerateLootOptions do Loot
// Generator.
export type ResolvedLootBias = MonsterLootBias;
