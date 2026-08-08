/**
 * Sprint 12 — Crafting Phase I. Os 4 efeitos reais de Esfera que ainda
 * não existiam (Curse já é real desde a Sprint 11, `itemization/
 * spheres.ts`). Todos puros — nenhum I/O, nenhuma leitura de banco.
 * Quem chama (`apps/api/src/services/sphere.service.ts`) fornece um
 * `ItemGenRandom` já semeado com entropia real (não determinística do
 * ponto de vista do jogador — "Crafting nunca pode ser determinístico",
 * diretriz explícita desta Sprint) e persiste o resultado.
 *
 * "Nunca criar regras paralelas. Usar Item Generator." — toda função
 * aqui reusa `itemgen/generator.ts` (`rollMod`/`findEligibleNewMods`/
 * `isModEligibleForBase`) e `itemgen/weights.ts`
 * (`getEffectiveModWeight`), nunca reimplementa elegibilidade/exclusão
 * de grupo/valor.
 */
import { ITEM_GEN_PREFIXES, ITEM_GEN_SUFFIXES, getBaseItem, getEffectiveModWeight, rollMod, findEligibleNewMods } from "../itemgen/index.js";
import { pickWeighted, randomInt, type ItemGenRandom } from "../itemgen/rng.js";
import type { ItemGenRolledMod } from "../itemgen/types.js";
import type { ItemQuality } from "../itemization/types.js";

const ALL_MOD_DEFINITIONS = [...ITEM_GEN_PREFIXES, ...ITEM_GEN_SUFFIXES];

// --- Esfera da Fortuna (Fase 3) ---
//
// "Nunca muda: prefixos, sufixos, tier, seed, history, potential,
// quality. Somente os rolls." — cada afixo mantém modId/type/group/
// name/statLabel/tags/tier intactos; só `.value` é substituído por um
// novo roll do MESMO mod, no MESMO itemLevel.
export function rerollAffixValues(affixes: readonly ItemGenRolledMod[], itemLevel: number, rng: ItemGenRandom): ItemGenRolledMod[] {
  return affixes.map((affix) => {
    const definition = ALL_MOD_DEFINITIONS.find((mod) => mod.id === affix.modId);
    if (!definition) return affix; // defensivo: mod não encontrado (dado legado/removido), nunca inventa um valor
    const rerolled = rollMod(rng, definition, itemLevel);
    return { ...affix, value: rerolled.value };
  });
}

// --- Esfera da Purificação (Fase 4) ---
//
// Remove exatamente 1 afixo sorteado ao acaso. "Nunca remove todos" —
// a função em si só remove UM por chamada (nunca uma passada de
// limpeza); se o item já não tem nenhum afixo, `removed` vem `null` e
// nada muda (nunca uma operação inválida silenciosa).
export interface RemoveAffixResult {
  affixes: ItemGenRolledMod[];
  removed: ItemGenRolledMod | null;
}

export function removeRandomAffix(affixes: readonly ItemGenRolledMod[], rng: ItemGenRandom): RemoveAffixResult {
  if (affixes.length === 0) {
    return { affixes: [...affixes], removed: null };
  }
  const index = randomInt(rng, 0, affixes.length - 1);
  const removed = affixes[index]!;
  const remaining = affixes.filter((_, i) => i !== index);
  return { affixes: remaining, removed };
}

// --- Esfera da Ascensão (Fase 5) ---
//
// Adiciona exatamente 1 afixo novo, elegível — `findEligibleNewMods()`
// (itemgen/generator.ts) já aplica a MESMA checagem de grupo/exclusão/
// tags que o pipeline de geração usa. Pesagem usa `getEffectiveModWeight`
// com a raridade `"rare"` do Item Generator como aproximação neutra:
// `items.rarity` (5 tiers, ItemRarity) não guarda mais a raridade
// original do Item Generator desde a normalização na persistência
// (Sprint 9/`rarityMapping.ts`) — "rare" é o ponto médio do vocabulário
// de 4 tiers, nunca favorece nem penaliza nenhum mod por engano de
// mapeamento.
const ASCENSION_WEIGHT_RARITY = "rare" as const;

export interface AddAffixResult {
  affixes: ItemGenRolledMod[];
  added: ItemGenRolledMod | null;
}

export function addRandomAffix(baseItemId: string, existingAffixes: readonly ItemGenRolledMod[], itemLevel: number, rng: ItemGenRandom): AddAffixResult {
  const base = getBaseItem(baseItemId);
  if (!base) return { affixes: [...existingAffixes], added: null };

  const eligible = findEligibleNewMods(baseItemId, existingAffixes);
  const weighted = eligible
    .map((mod) => ({ mod, weight: getEffectiveModWeight(mod, base, ASCENSION_WEIGHT_RARITY) }))
    .filter((candidate) => candidate.weight > 0);
  if (weighted.length === 0) {
    return { affixes: [...existingAffixes], added: null };
  }

  const chosen = pickWeighted(rng, weighted).mod;
  const rolled = rollMod(rng, chosen, itemLevel);
  return { affixes: [...existingAffixes, rolled], added: rolled };
}

// --- Esfera da Lapidação (Fase 6) ---
//
// Só incrementa `quality.value` (0-20, mesma faixa já documentada em
// itemization/types.ts) — nunca toca afixos/potential. O incremento em
// si é aleatório (1-3) pela mesma diretriz de "crafting nunca
// determinístico": mesmo repetindo a Esfera várias vezes, o ganho por
// uso não é previsível.
const LAPIDATION_MIN_GAIN = 1;
const LAPIDATION_MAX_GAIN = 3;
const QUALITY_MAX = 20;

export function increaseQuality(quality: ItemQuality, rng: ItemGenRandom): ItemQuality {
  const gain = randomInt(rng, LAPIDATION_MIN_GAIN, LAPIDATION_MAX_GAIN);
  const value = Math.min(QUALITY_MAX, quality.value + gain);
  return { ...quality, value };
}
