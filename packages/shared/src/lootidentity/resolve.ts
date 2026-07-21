import { getArchetype } from "./archetypes.js";
import { getLootIdentity } from "./lootIdentities.js";
import type { MonsterLootBias, ResolvedLootBias } from "./types.js";

// Multiplica dois mapas peso-por-chave (Archetype x override do
// monstro) — chave ausente de um dos dois lados = 1 (neutro), então o
// resultado nunca perde uma chave que só exista de um lado.
function multiplyBiasMaps(
  base: Partial<Record<string, number>>,
  override: Partial<Record<string, number>>,
): Partial<Record<string, number>> {
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  const result: Partial<Record<string, number>> = {};
  for (const key of keys) {
    result[key] = (base[key] ?? 1) * (override[key] ?? 1);
  }
  return result;
}

// Requisito 2/3/4 — resolve o bias EFETIVO de um monstro: o bias do seu
// Archetype, multiplicado (nunca substituído) pelo `lootBiasOverride`
// da própria Loot Identity, quando existir (ex.: "Bandit Captain" é
// "bandit" + uma sorte de raridade própria em cima da do arquétipo).
export function resolveLootBias(monsterId: string): ResolvedLootBias {
  const identity = getLootIdentity(monsterId);
  if (!identity) {
    throw new Error(`Monster Loot Identity: identidade desconhecida "${monsterId}"`);
  }

  const archetype = getArchetype(identity.archetypeId);
  if (!archetype) {
    throw new Error(`Monster Loot Identity: Archetype desconhecido "${identity.archetypeId}"`);
  }

  const override: Partial<MonsterLootBias> = identity.lootBiasOverride ?? {};

  return {
    baseItemAffinity: multiplyBiasMaps(archetype.lootBias.baseItemAffinity, override.baseItemAffinity ?? {}),
    affixAffinity: multiplyBiasMaps(archetype.lootBias.affixAffinity, override.affixAffinity ?? {}),
    rarityBias: multiplyBiasMaps(archetype.lootBias.rarityBias, override.rarityBias ?? {}) as ResolvedLootBias["rarityBias"],
  };
}
