import { getBaseItem } from "./baseItems.js";
import { getRarityDefinition, ITEM_GEN_RARITIES } from "./rarities.js";
import { ITEM_GEN_PREFIXES } from "./prefixes.js";
import { ITEM_GEN_SUFFIXES } from "./suffixes.js";
import { calculatePowerScore } from "./powerScore.js";
import { createSeededRandom, pickWeighted, randomInt, type ItemGenRandom } from "./rng.js";
import { getDefaultAffixSelectionStrategy, type AffixSelectionStrategy, type ModRollState } from "./selectionStrategy.js";
import type {
  ItemGenBaseItem,
  ItemGenGeneratedItem,
  ItemGenModDefinition,
  ItemGenRarityId,
  ItemGenRolledMod,
} from "./types.js";

// Phase II (Affix System) — `requiredTags` substitui o antigo
// `allowedSlots`: o mod só é elegível se o Base Item tiver TODAS as
// tags exigidas (ver baseItems.ts/prefixes.ts/suffixes.ts).
function isModEligibleForBase(mod: ItemGenModDefinition, base: ItemGenBaseItem): boolean {
  return mod.requiredTags.every((tag) => base.tags.includes(tag));
}

// Affix Selection Redesign — Prototype Phase I: a escolha de QUAIS mods
// entram (antes `rollDistinctMods`) e QUAL tier cada um rola (antes o
// `pickWeighted` direto abaixo) agora vive atrás de `AffixSelectionStrategy`
// (selectionStrategy.ts) — generator.ts só chama a estratégia ativa,
// nunca sabe qual é. `CurrentAffixSelectionStrategy` (o default
// permanente) reproduz exatamente a mesma lógica/ordem de chamadas de
// `rng()` que existia aqui antes desta Sprint — zero mudança de
// comportamento para qualquer chamador que não passe `options.strategy`.

// Passos 5+6 do pipeline (Tier Roll + Value Roll) para um mod já
// escolhido: filtra os tiers desbloqueados pelo Item Level e delega à
// estratégia ativa a escolha ENTRE os elegíveis, então rola o valor
// dentro da faixa do tier sorteado. Retorna null quando o Item Level é
// baixo demais para desbloquear qualquer tier deste mod — esse mod
// simplesmente não entra no item final.
function rollMod(rng: ItemGenRandom, mod: ItemGenModDefinition, itemLevel: number, strategy: AffixSelectionStrategy): ItemGenRolledMod | null {
  const eligibleTiers = mod.tiers.filter((tier) => tier.minItemLevel <= itemLevel);
  if (eligibleTiers.length === 0) return null;

  const tier = strategy.pickTier(rng, eligibleTiers, itemLevel);
  const value = randomInt(rng, tier.min, tier.max);

  return {
    modId: mod.id,
    type: mod.type,
    group: mod.group,
    name: mod.name,
    statLabel: mod.statLabel,
    tags: mod.tags,
    tier: tier.tier,
    value,
  };
}

// Loot Generator Phase I (packages/shared/src/lootgen) precisa enviesar
// a Rarity Roll a partir de fora (o "multiplicador de raridade" de cada
// Loot Table) sem duplicar a lógica de sorteio de raridade que já existe
// aqui — `rarityWeightMultipliers`.
//
// Monster Loot Identity Phase I (packages/shared/src/lootidentity)
// acrescentou `modTagWeightMultipliers`: a Affix Affinity de um Monster
// Archetype (ex.: Beast favorece tags "life"/"physical"/"attack_speed")
// precisa enviesar QUAIS mods saem mais, sem duplicar a lógica de
// rolagem de mods que já existe aqui — ver weights.ts.
//
// Ambos os campos são opcionais, com default `{}` — nenhuma chamada
// existente de generateItem(baseItemId, itemLevel, seed) muda de
// comportamento.
export interface GenerateItemOptions {
  rarityWeightMultipliers?: Partial<Record<ItemGenRarityId, number>>;
  modTagWeightMultipliers?: Partial<Record<string, number>>;
  // Affix Selection Redesign — Prototype Phase I: override POR CHAMADA,
  // usado só pela camada de comparação experimental (nunca por
  // lootgen/adventure/dungeon, que continuam chamando generateItem()
  // sem este campo e por isso sempre recebem o default global — ver
  // getDefaultAffixSelectionStrategy() em selectionStrategy.ts). Ausente
  // = usa o default global (CurrentAffixSelectionStrategy, a menos que
  // um experimento de campanha completa o tenha trocado via
  // setDefaultAffixSelectionStrategy()).
  strategy?: AffixSelectionStrategy;
}

// Pipeline completo do Item Generator (requisitos 1-8 do Phase I + o
// Affix System do Phase II):
//
//   Base Item -> Item Level -> Rarity Roll -> Prefix Roll -> Suffix Roll
//   -> Tier Roll -> Value Roll -> Power Score -> Final Item
//
// Determinístico: a mesma combinação (baseItemId, itemLevel, seed,
// options) sempre produz exatamente o mesmo ItemGenGeneratedItem —
// nenhuma chamada a Math.random ou Date.now em nenhum passo.
//
// Data-driven: nenhuma etapa faz `if (rarity === "...")` ou
// `if (baseItemId === "...")` — tudo vem das tabelas
// (ITEM_GEN_RARITIES/ITEM_GEN_PREFIXES/ITEM_GEN_SUFFIXES/
// ITEM_GEN_BASE_ITEMS). Adicionar conteúdo novo é só inserir um
// registro na tabela certa (ver README de uso em index.ts).
export function generateItem(
  baseItemId: string,
  itemLevel: number,
  seed: number,
  options: GenerateItemOptions = {},
): ItemGenGeneratedItem {
  const base = getBaseItem(baseItemId);
  if (!base) {
    throw new Error(`Item Generator: Base Item desconhecido "${baseItemId}"`);
  }

  const rng = createSeededRandom(seed);
  const strategy = options.strategy ?? getDefaultAffixSelectionStrategy();

  // ITEM_GEN_RARITIES usa `dropWeight` (nome do requisito 2: "peso de
  // drop"), não `weight` (usado pelos mods em prefixes.ts/suffixes.ts)
  // — por isso o wrapper local antes de chamar pickWeighted, que só
  // entende `{ weight }`. `rarityWeightMultipliers` (Loot Generator)
  // multiplica esse peso antes do sorteio; ausente = 1 (neutro, mesmo
  // comportamento do Phase I/II).
  const rarityChoice = pickWeighted(
    rng,
    ITEM_GEN_RARITIES.map((rarity) => ({
      weight: rarity.dropWeight * (options.rarityWeightMultipliers?.[rarity.id] ?? 1),
      rarity,
    })),
  );
  const rarityDef = getRarityDefinition(rarityChoice.rarity.id);

  const eligiblePrefixes = ITEM_GEN_PREFIXES.filter((mod) => isModEligibleForBase(mod, base));
  const eligibleSuffixes = ITEM_GEN_SUFFIXES.filter((mod) => isModEligibleForBase(mod, base));

  const prefixCount = randomInt(rng, rarityDef.minPrefixes, rarityDef.maxPrefixes);
  const suffixCount = randomInt(rng, rarityDef.minSuffixes, rarityDef.maxSuffixes);

  // Um único estado, compartilhado entre as duas rolagens abaixo: é o
  // que faz o bloqueio de grupo/exclusão valer entre prefixo e sufixo,
  // não só dentro de cada lista.
  const state: ModRollState = { committedGroups: new Set(), blockedGroups: new Set() };

  const rolledPrefixes = strategy
    .pickMods(rng, eligiblePrefixes, prefixCount, base, rarityDef.id, state, options.modTagWeightMultipliers)
    .map((mod) => rollMod(rng, mod, itemLevel, strategy))
    .filter((mod): mod is ItemGenRolledMod => mod !== null);

  const rolledSuffixes = strategy
    .pickMods(rng, eligibleSuffixes, suffixCount, base, rarityDef.id, state, options.modTagWeightMultipliers)
    .map((mod) => rollMod(rng, mod, itemLevel, strategy))
    .filter((mod): mod is ItemGenRolledMod => mod !== null);

  const powerScore = calculatePowerScore(base, [...rolledPrefixes, ...rolledSuffixes]);

  return {
    seed,
    baseItemId: base.id,
    itemLevel,
    rarity: rarityDef.id,
    prefixes: rolledPrefixes,
    suffixes: rolledSuffixes,
    powerScore,
  };
}
