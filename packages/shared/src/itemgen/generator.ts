import { getBaseItem } from "./baseItems.js";
import { getRarityDefinition, ITEM_GEN_RARITIES } from "./rarities.js";
import { ITEM_GEN_PREFIXES } from "./prefixes.js";
import { ITEM_GEN_SUFFIXES } from "./suffixes.js";
import { calculatePowerScore } from "./powerScore.js";
import { getEffectiveModWeight } from "./weights.js";
import { createSeededRandom, pickWeighted, randomInt, type ItemGenRandom } from "./rng.js";
import { getAffixEnvelope, rollContinuousAffixValue, identityTierForValue } from "./continuousScaling.js";
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

// Continuous Affix Scaling Phase I — substitui o "Affix Selection
// Strategy" (selectionStrategy.ts, Sprint "Affix Selection Redesign —
// Prototype Phase I") e a filtragem de elegibilidade por
// `minItemLevel` que existia aqui: 4 Sprints de investigação (Threshold
// Rescaling, Tier Weight Rebalance, Threshold+Weight Interaction,
// Selection Strategy) demonstraram que nenhum ajuste de PARÂMETRO do
// sistema de tiers-com-degraus resolve a estagnação de Dead Loot/
// progressão (ver reports/item-generation-*.md) — a linha de
// parametrização foi oficialmente encerrada. Esta Sprint substitui o
// MECANISMO: `continuousScaling.ts` computa o valor de cada afixo como
// função contínua do Item Level, e os tiers deixam de gatear
// elegibilidade ou ser sorteados por peso (Fase 6 — só rotulam
// qualidade/identidade do valor já rolado). `selectionStrategy.ts` não
// é mais importado por este arquivo (não há mais um "tier a escolher");
// mod SELECTION (`rollDistinctMods` abaixo) continua EXATAMENTE como
// antes — nunca foi a variável experimental de nenhuma das Sprints
// anteriores.
interface ModRollState {
  committedGroups: Set<string>;
  blockedGroups: Set<string>;
}

function isModCompatibleWithState(mod: ItemGenModDefinition, state: ModRollState): boolean {
  if (state.committedGroups.has(mod.group)) return false;
  if (state.blockedGroups.has(mod.group)) return false;
  // Bloqueio bidirecional: se o mod candidato exclui o grupo de algo já
  // escolhido, também não pode entrar — não é preciso declarar
  // `excludesGroups` dos dois lados.
  if (mod.excludesGroups.some((group) => state.committedGroups.has(group))) return false;
  return true;
}

function commitMod(mod: ItemGenModDefinition, state: ModRollState): void {
  state.committedGroups.add(mod.group);
  for (const group of mod.excludesGroups) state.blockedGroups.add(group);
}

// Sorteia até `count` mods distintos e compatíveis entre si (grupo
// único + sem exclusão), usando o peso EFETIVO (base x Base Item x
// raridade — weights.ts) em vez do peso bruto do mod. Passo 4 do
// pipeline (Mod Selection) — inalterado por esta Sprint.
function rollDistinctMods(
  rng: ItemGenRandom,
  eligiblePool: readonly ItemGenModDefinition[],
  count: number,
  base: ItemGenBaseItem,
  rarity: ItemGenRarityId,
  state: ModRollState,
  modTagWeightMultipliers: Partial<Record<string, number>> | undefined,
): ItemGenModDefinition[] {
  const picked: ItemGenModDefinition[] = [];
  while (picked.length < count) {
    const candidates = eligiblePool
      .filter((mod) => isModCompatibleWithState(mod, state))
      .map((mod) => ({ mod, weight: getEffectiveModWeight(mod, base, rarity, modTagWeightMultipliers) }))
      .filter((candidate) => candidate.weight > 0);
    if (candidates.length === 0) break;

    const choice = pickWeighted(rng, candidates).mod;
    picked.push(choice);
    commitMod(choice, state);
  }
  return picked;
}

// Passos 5+6 do pipeline (Tier Roll + Value Roll), agora contínuos: o
// valor é `rollContinuousAffixValue()` sobre o envelope do GROUP do mod
// (não do mod individual — ver continuousScaling.ts pra a razão), e o
// `tier` retornado é só o rótulo de qualidade mais próximo dentre os
// PRÓPRIOS tiers do mod (identidade, nunca controla o valor). Nunca
// retorna null — todo mod agora produz um valor em qualquer Item Level
// (o antigo "Item Level baixo demais, mod nem entra no item" deixou de
// existir junto com a elegibilidade por limiar).
function rollMod(rng: ItemGenRandom, mod: ItemGenModDefinition, itemLevel: number): ItemGenRolledMod {
  const envelope = getAffixEnvelope(mod.group);
  const value = rollContinuousAffixValue(rng, envelope, itemLevel);
  const tier = identityTierForValue(mod.tiers, value);

  return {
    modId: mod.id,
    type: mod.type,
    group: mod.group,
    name: mod.name,
    statLabel: mod.statLabel,
    tags: mod.tags,
    tier,
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

  const rolledPrefixes = rollDistinctMods(rng, eligiblePrefixes, prefixCount, base, rarityDef.id, state, options.modTagWeightMultipliers).map((mod) =>
    rollMod(rng, mod, itemLevel),
  );

  const rolledSuffixes = rollDistinctMods(rng, eligibleSuffixes, suffixCount, base, rarityDef.id, state, options.modTagWeightMultipliers).map((mod) =>
    rollMod(rng, mod, itemLevel),
  );

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
