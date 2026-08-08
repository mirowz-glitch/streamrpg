import { createSeededRandom, pickWeighted, pickWeightedMany } from "../itemgen/rng.js";
import { listMapModifiers } from "../mapmods/mapModifierRegistry.js";
import type { MapModifierId } from "../mapmods/types.js";
import type { RareMapInstance, RareMapTier } from "../raremap/types.js";
import type { CorruptedMap, CorruptionModifier, CorruptionOutcome, CorruptionResult } from "./types.js";

// Fase 4 — "Infraestrutura. Sem balanceamento definitivo." Pesos
// arbitrários (mesmo espírito de RARITY_ROLL_OPTIONS em
// raremap/generator.ts) — só pra que `generateCorruptedMap()` sem
// nenhum parâmetro extra produza uma amostra plausível dos 6
// resultados, nunca uma distribuição final.
const OUTCOME_ROLL_OPTIONS: { outcome: CorruptionOutcome; weight: number }[] = [
  { outcome: "nothing", weight: 20 },
  { outcome: "add-one-modifier", weight: 30 },
  { outcome: "add-two-modifiers", weight: 20 },
  { outcome: "replace-one-add-two", weight: 15 },
  { outcome: "increase-tier", weight: 10 },
  { outcome: "brick", weight: 5 },
];

const MAX_TIER: RareMapTier = 3;

function eligibleModPool(tier: RareMapTier, exclude: readonly MapModifierId[]): { id: MapModifierId; weight: number }[] {
  return listMapModifiers()
    .filter((mod) => mod.enabled && mod.tier <= tier && !exclude.includes(mod.id))
    .map((mod) => ({ id: mod.id, weight: mod.weight }));
}

// Fase 4 — os 6 resultados possíveis, cada um mutando `mods`/`tier` de
// uma forma DIFERENTE, nunca combinados na mesma rolagem (o brief lista
// os 6 como mutuamente exclusivos, "Resultado 1"..."Resultado 6").
// "Nunca altera Map/Region/Enemy Pool/World Region/Loot Tables/Monster
// Signature" (Decisões Oficiais) — por isso esta função só devolve
// `mods`/`tier`, nunca toca em `mapId`/`rarity`.
function applyOutcome(
  rng: ReturnType<typeof createSeededRandom>,
  outcome: CorruptionOutcome,
  currentMods: readonly MapModifierId[],
  currentTier: RareMapTier,
): { mods: MapModifierId[]; tier: RareMapTier; addedMods: CorruptionModifier[]; removedMods: CorruptionModifier[]; tierIncreased: boolean } {
  switch (outcome) {
    case "nothing":
      // Resultado 1 — "Nada acontece. Mapa apenas vira Corrompido."
      return { mods: [...currentMods], tier: currentTier, addedMods: [], removedMods: [], tierIncreased: false };

    case "add-one-modifier": {
      // Resultado 2 — "+1 Modifier."
      const pool = eligibleModPool(currentTier, currentMods);
      const added = pickWeightedMany(rng, pool, 1).map((m) => m.id);
      return { mods: [...currentMods, ...added], tier: currentTier, addedMods: added, removedMods: [], tierIncreased: false };
    }

    case "add-two-modifiers": {
      // Resultado 3 — "+2 Modifiers."
      const pool = eligibleModPool(currentTier, currentMods);
      const added = pickWeightedMany(rng, pool, 2).map((m) => m.id);
      return { mods: [...currentMods, ...added], tier: currentTier, addedMods: added, removedMods: [], tierIncreased: false };
    }

    case "replace-one-add-two": {
      // Resultado 4 — "Remove um Modifier. Adiciona dois novos."
      const remaining = [...currentMods];
      let removed: CorruptionModifier[] = [];
      if (remaining.length > 0) {
        const removeIndex = Math.floor(rng() * remaining.length);
        removed = remaining.splice(removeIndex, 1);
      }
      const pool = eligibleModPool(currentTier, remaining);
      const added = pickWeightedMany(rng, pool, 2).map((m) => m.id);
      return { mods: [...remaining, ...added], tier: currentTier, addedMods: added, removedMods: removed, tierIncreased: false };
    }

    case "increase-tier": {
      // Resultado 5 — "Aumenta Tier."
      const tier = Math.min(MAX_TIER, currentTier + 1) as RareMapTier;
      return { mods: [...currentMods], tier, addedMods: [], removedMods: [], tierIncreased: tier !== currentTier };
    }

    case "brick": {
      // Resultado 6 — "Brick. Mapa fica extremamente difícil." Nenhum
      // número definitivo no brief — interpretação desta Sprint: o
      // Mapa passa a carregar TODOS os Map Modifiers reais elegíveis no
      // Tier máximo (hoje, os 8 do Registro inteiro, já que todo Mod
      // real é Tier 1 — mapmods/mapModifierRegistry.ts), substituindo
      // qualquer lista anterior. Reaproveita o mesmo pipeline
      // multiplicativo da Sprint 33 (`applyMapModifiers()`) — nenhuma
      // fórmula nova, só o pior caso de composição já possível.
      const allEligible = eligibleModPool(MAX_TIER, []).map((m) => m.id);
      return {
        mods: allEligible,
        tier: MAX_TIER,
        addedMods: allEligible.filter((id) => !currentMods.includes(id)),
        removedMods: currentMods.filter((id) => !allEligible.includes(id)),
        tierIncreased: MAX_TIER !== currentTier,
      };
    }
  }
}

// Único ponto que de fato consome o RNG — `generateCorruptedMap()` e
// `rollCorruptionOutcome()` só formatam este mesmo resultado em dois
// formatos de saída diferentes (CorruptedMap/CorruptionResult), nunca
// duas implementações que possam divergir uma da outra pra a MESMA
// seed.
function resolveCorruption(rareMap: RareMapInstance, seed: number) {
  const rng = createSeededRandom(seed);
  const outcome = pickWeighted(rng, OUTCOME_ROLL_OPTIONS).outcome;
  const applied = applyOutcome(rng, outcome, rareMap.mods, rareMap.tier);
  return { outcome, ...applied };
}

// Fase 3 — "generateCorruptedMap(). Recebe RareMapInstance. Retorna
// CorruptedMap. Nunca inicia Adventure. Nunca altera sessão."
// Determinístico (mesma `rareMap` + mesma `seed` = mesmo
// `CorruptedMap`, sempre) — mesmo padrão de todo Generator real do
// projeto. `seed` é SEMPRE um parâmetro novo, independente de
// `rareMap.seed` (a rolagem de Corrupção é um evento novo, nunca uma
// continuação determinística da rolagem original do Rare Map — dois
// jogadores corrompendo a MESMA instância de Rare Map, se isso um dia
// existisse, precisam poder ter resultados de Corrupção diferentes).
export function generateCorruptedMap(rareMap: RareMapInstance, seed: number): CorruptedMap {
  const resolved = resolveCorruption(rareMap, seed);
  return {
    mapId: rareMap.mapId,
    rarity: rareMap.rarity,
    tier: resolved.tier,
    mods: resolved.mods,
    corrupted: true,
    corruptionOutcome: resolved.outcome,
    sourceInstanceId: rareMap.instanceId,
    instanceId: `corrupted-${rareMap.mapId}-${seed}`,
    seed,
  };
}

// Fase 2 — exposto separadamente pra teste/observabilidade (ver
// CorruptionResult em types.ts) — chama `resolveCorruption()`, a MESMA
// função que `generateCorruptedMap()` usa, nunca uma segunda
// implementação da rolagem.
export function rollCorruptionOutcome(rareMap: RareMapInstance, seed: number): CorruptionResult {
  const resolved = resolveCorruption(rareMap, seed);
  return { outcome: resolved.outcome, addedMods: resolved.addedMods, removedMods: resolved.removedMods, tierIncreased: resolved.tierIncreased };
}
