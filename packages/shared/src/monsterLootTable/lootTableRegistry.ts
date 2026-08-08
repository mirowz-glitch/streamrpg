import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import { ITEM_GEN_BASE_ITEMS } from "../itemgen/baseItems.js";
import { ITEM_GEN_PREFIXES } from "../itemgen/prefixes.js";
import { ITEM_GEN_SUFFIXES } from "../itemgen/suffixes.js";
import { SPHERE_DEFINITIONS, type SphereTypeId } from "../itemization/spheres.js";
import type { GemCategory } from "../socket/gemDefinition.js";
import { MATERIAL_TYPES } from "../worldregion/materialTypes.js";
import { getMonsterBaseAffinity, getMonsterSphereAffinity, getMonsterGemAffinity, getMonsterMaterialAffinity } from "../monsterLoot/monsterAffinity.js";
import { getMonsterLootSignature } from "../monsterLoot/monsterRegistry.js";
import type { MonsterLootTable, SpecialDrop } from "./types.js";

// Fase 3 — Loot Table Registry: "Criar tabela para TODOS os Enemy
// Templates. Nenhum órfão." Uma `MonsterLootTable` por
// `EnemyTemplate.id` real (22/22, ver teste de integridade).
//
// Todo universo abaixo é o catálogo REAL — nunca uma lista inventada:
const ALL_BASE_IDS: readonly string[] = ITEM_GEN_BASE_ITEMS.map((base) => base.id);
const ALL_SPHERE_IDS: readonly SphereTypeId[] = SPHERE_DEFINITIONS.map((sphere) => sphere.id);
const ALL_MATERIAL_IDS: readonly string[] = MATERIAL_TYPES.map((material) => material.id);
// `GemCategory` (socket/gemDefinition.ts:29) é um union type — sem
// array exportado pra iterar em runtime. Os 12 valores abaixo são uma
// cópia literal do próprio tipo real, nunca uma lista inventada.
const ALL_GEM_CATEGORIES: readonly GemCategory[] = ["attack", "defense", "movement", "critical", "life", "mana", "magic", "fire", "ice", "lightning", "utility", "support"];
// Universo real de tags de mod — união de todas as `tags` declaradas em
// `ITEM_GEN_PREFIXES`/`ITEM_GEN_SUFFIXES` (itemgen/), nunca uma lista
// paralela mantida à mão.
const ALL_AFFIX_TAGS: readonly string[] = [...new Set([...ITEM_GEN_PREFIXES, ...ITEM_GEN_SUFFIXES].flatMap((mod) => mod.tags))];

function partition<T extends string>(universe: readonly T[], allowed: readonly T[]): { allowed: T[]; blocked: T[] } {
  const allowedSet = new Set(allowed);
  return { allowed: [...allowedSet], blocked: universe.filter((id) => !allowedSet.has(id)) };
}

// Fase 4 — Special Drops: os 3 exemplos literais do brief. "Cultista
// Supremo" não existe como Enemy Template real (nenhum monstro com esse
// nome em `enemy/templates.ts`) — substituído por `corrupted-bishop`
// (Bispo Corrompido, `futureFlags.isBoss: true`, o membro mais forte
// real da Família Culto Corrompido, ver `enemyFaction/enemyFamilies.ts`)
// — mesma técnica de substituição já usada em Sprints anteriores
// ("Cavernas Antigas" -> "Minas Abandonadas", Sprint World Progression).
const SPECIAL_DROPS_BY_TEMPLATE: Readonly<Record<string, SpecialDrop[]>> = {
  "wolf-alpha": [{ id: "pele-do-lobo-alfa", name: "Pele do Lobo Alfa", description: "Só o Lobo Alfa carrega esta pele — infraestrutura apenas, nenhum efeito real ainda." }],
  "dark-knight": [{ id: "espada-do-cavaleiro-negro", name: "Espada do Cavaleiro Negro", description: "Uma lâmina que só um Cavaleiro Negro carregaria — infraestrutura apenas, nenhum efeito real ainda." }],
  "corrupted-bishop": [{ id: "livro-proibido", name: "Livro Proibido", description: "O texto que o Bispo Corrompido nunca revela vivo — infraestrutura apenas, nenhum efeito real ainda." }],
};

function buildLootTable(templateId: string): MonsterLootTable {
  const bases = partition(ALL_BASE_IDS, Object.keys(getMonsterBaseAffinity(templateId)));
  const preferredAffixes = getMonsterLootSignature(templateId)?.preferredAffixes ?? {};
  const affixes = partition(ALL_AFFIX_TAGS, Object.keys(preferredAffixes));
  const spheres = partition(ALL_SPHERE_IDS, Object.keys(getMonsterSphereAffinity(templateId)) as SphereTypeId[]);
  const gems = partition(ALL_GEM_CATEGORIES, Object.keys(getMonsterGemAffinity(templateId)) as GemCategory[]);
  const materials = partition(ALL_MATERIAL_IDS, getMonsterMaterialAffinity(templateId));

  return {
    id: templateId,
    monsterId: templateId,
    allowedBases: bases.allowed,
    blockedBases: bases.blocked,
    allowedAffixes: affixes.allowed,
    blockedAffixes: affixes.blocked,
    allowedSpheres: spheres.allowed,
    blockedSpheres: spheres.blocked,
    allowedGems: gems.allowed,
    blockedGems: gems.blocked,
    allowedMaterials: materials.allowed,
    blockedMaterials: materials.blocked,
    specialDrops: SPECIAL_DROPS_BY_TEMPLATE[templateId] ?? [],
    enabled: true,
  };
}

export const MONSTER_LOOT_TABLES: readonly MonsterLootTable[] = ENEMY_TEMPLATES.map((template) => buildLootTable(template.id));

export function getMonsterLootTable(monsterId: string): MonsterLootTable | undefined {
  return MONSTER_LOOT_TABLES.find((table) => table.monsterId === monsterId);
}

export function listMonsterLootTables(): readonly MonsterLootTable[] {
  return MONSTER_LOOT_TABLES;
}

// Fase 3 — "Nenhuma criatura fica órfã": dado que falta, nunca lógica
// que falta.
export function listUnregisteredMonsterIds(): string[] {
  const registered = new Set(MONSTER_LOOT_TABLES.map((t) => t.monsterId));
  return ENEMY_TEMPLATES.map((template) => template.id).filter((id) => !registered.has(id));
}
