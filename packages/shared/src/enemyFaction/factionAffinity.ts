import { getEnemyTemplate } from "../enemy/templates.js";
import { getArchetype } from "../lootidentity/archetypes.js";
import type { SphereTypeId } from "../itemization/spheres.js";
import type { GemCategory } from "../socket/gemDefinition.js";
import { getSphereAffinitiesForBiome } from "../worldregion/sphereAffinity.js";
import { getGemAffinitiesForBiome } from "../worldregion/gemAffinity.js";
import { getMaterialTypesForBiome } from "../worldregion/materialTypes.js";
import { getEnemyFaction } from "./factionRegistry.js";
import { listFamiliesForFaction } from "./enemyFamilies.js";

// Fase 6 — Faction Affinity: "Bases. Esferas. Gemas. Materiais. Tudo
// pode possuir afinidade por facção. Ainda não influencia o drop."
//
// Diferente de `worldregion/baseAffinity.ts`/`sphereAffinity.ts`
// (Sprint 25, dados AUTORAIS ancorados nos 4 exemplos literais do
// brief daquela Sprint), esta Fase não recebeu nenhum exemplo literal
// de afinidade — só o requisito de que o campo exista. Em vez de
// inventar pesos sem lastro, toda função aqui é uma DERIVAÇÃO pura de
// dado que já existe:
//
// - Base Affinity: união do `lootBias.baseItemAffinity` real do
//   Archetype (`lootidentity/archetypes.ts`, JÁ usado de verdade pelo
//   pipeline de drop) de cada Enemy Template pertencente às Famílias da
//   facção — nunca um número novo.
// - Sphere/Gem/Material Affinity: união das tabelas por bioma da
//   Sprint 25 (`worldregion/sphereAffinity.ts`/`gemAffinity.ts`/
//   `materialTypes.ts`) sobre `EnemyFaction.preferredBiomes` — a
//   Facção "herda" a afinidade dos biomas onde ela de fato vive.
//
// Nenhuma destas funções é chamada por generator.ts/lootgen/
// lootidentity/spheredrop — só por testes, exatamente como
// `worldregion/dropProfile.ts` já fazia na Sprint anterior.

function templateArchetypeIds(templateIds: readonly string[]): string[] {
  const archetypeIds = new Set<string>();
  for (const templateId of templateIds) {
    const template = getEnemyTemplate(templateId);
    if (template) archetypeIds.add(template.archetype);
  }
  return [...archetypeIds];
}

export function getFactionBaseAffinity(factionId: string): Record<string, number> {
  const families = listFamiliesForFaction(factionId);
  const templateIds = families.flatMap((family) => family.templateIds);
  const archetypeIds = templateArchetypeIds(templateIds);

  const result: Record<string, number> = {};
  for (const archetypeId of archetypeIds) {
    const archetype = getArchetype(archetypeId);
    if (!archetype) continue;
    for (const [baseItemId, weight] of Object.entries(archetype.lootBias.baseItemAffinity)) {
      if (weight === undefined) continue;
      result[baseItemId] = Math.max(result[baseItemId] ?? 0, weight);
    }
  }
  return result;
}

export function getFactionSphereAffinity(factionId: string): Partial<Record<SphereTypeId, number>> {
  const faction = getEnemyFaction(factionId);
  if (!faction) return {};

  const result: Partial<Record<SphereTypeId, number>> = {};
  for (const biome of faction.preferredBiomes) {
    for (const [sphereId, weight] of Object.entries(getSphereAffinitiesForBiome(biome))) {
      if (weight === undefined) continue;
      const key = sphereId as SphereTypeId;
      result[key] = Math.max(result[key] ?? 0, weight);
    }
  }
  return result;
}

export function getFactionGemAffinity(factionId: string): Partial<Record<GemCategory, number>> {
  const faction = getEnemyFaction(factionId);
  if (!faction) return {};

  const result: Partial<Record<GemCategory, number>> = {};
  for (const biome of faction.preferredBiomes) {
    for (const [category, weight] of Object.entries(getGemAffinitiesForBiome(biome))) {
      if (weight === undefined) continue;
      const key = category as GemCategory;
      result[key] = Math.max(result[key] ?? 0, weight);
    }
  }
  return result;
}

export function getFactionMaterialAffinity(factionId: string): string[] {
  const faction = getEnemyFaction(factionId);
  if (!faction) return [];

  const materialIds = new Set<string>();
  for (const biome of faction.preferredBiomes) {
    for (const material of getMaterialTypesForBiome(biome)) {
      materialIds.add(material.id);
    }
  }
  return [...materialIds];
}
