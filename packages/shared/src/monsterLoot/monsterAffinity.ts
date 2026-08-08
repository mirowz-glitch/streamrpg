import type { SphereTypeId } from "../itemization/spheres.js";
import type { GemCategory } from "../socket/gemDefinition.js";
import { BASE_IDENTITY_REGISTRY, getBaseIdentity } from "../baseIdentity/index.js";
import { getMonsterLootSignature } from "./monsterRegistry.js";

// Fase 6 — Monster Affinity: "Criar afinidade entre: Monster -> Base
// Identity -> Sphere -> Gem -> Material. Tudo infraestrutura. Nenhum
// efeito real." Camada fina de ACESSO sobre `MonsterLootSignature`
// (Fase 2/3/4) — nunca uma segunda fonte de dado: toda função aqui só
// lê o registro já construído em `monsterRegistry.ts`. A ligação
// "Monster -> Base Identity" é validada (não reimplementada): toda
// chave de `preferredBases` já é, por construção, um id de
// `BASE_IDENTITY_REGISTRY` real (Sprint 19) — ver teste de integridade.
export function getMonsterBaseAffinity(enemyTemplateId: string): Partial<Record<string, number>> {
  return getMonsterLootSignature(enemyTemplateId)?.preferredBases ?? {};
}

export function getMonsterSphereAffinity(enemyTemplateId: string): Partial<Record<SphereTypeId, number>> {
  return getMonsterLootSignature(enemyTemplateId)?.preferredSpheres ?? {};
}

export function getMonsterGemAffinity(enemyTemplateId: string): Partial<Record<GemCategory, number>> {
  return getMonsterLootSignature(enemyTemplateId)?.preferredGems ?? {};
}

export function getMonsterMaterialAffinity(enemyTemplateId: string): string[] {
  return getMonsterLootSignature(enemyTemplateId)?.preferredMaterials ?? [];
}

export function getMonsterLegendaryChance(enemyTemplateId: string): number {
  return getMonsterLootSignature(enemyTemplateId)?.preferredLegendaryChance ?? 1;
}

// "Monster -> Base Identity": confirma que toda entrada de
// `preferredBases` de todo monstro registrado é um Base Item com
// `BaseIdentity` real (Sprint 19) — nunca inventa uma Base nova.
export function getBaseIdentityAffinityForMonster(enemyTemplateId: string) {
  const affinity = getMonsterBaseAffinity(enemyTemplateId);
  const result: Record<string, { weight: number; tier: number; potential: string }> = {};
  for (const [baseItemId, weight] of Object.entries(affinity)) {
    if (weight === undefined) continue;
    const identity = getBaseIdentity(BASE_IDENTITY_REGISTRY, baseItemId);
    if (!identity) continue;
    result[baseItemId] = { weight, tier: identity.tier, potential: identity.potential };
  }
  return result;
}
