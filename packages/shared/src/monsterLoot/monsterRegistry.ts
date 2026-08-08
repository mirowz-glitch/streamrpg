import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import { getArchetype } from "../lootidentity/archetypes.js";
import { getFamilyForTemplate } from "../enemyFaction/enemyFamilies.js";
import { getFactionSphereAffinity, getFactionGemAffinity, getFactionMaterialAffinity } from "../enemyFaction/factionAffinity.js";
import type { MonsterLootSignature } from "./types.js";

// Fase 3 — Monster Registry: "Todos os Enemy Templates reais recebem
// identidade. Nenhum template pode ficar sem registro." Uma
// `MonsterLootSignature` por `EnemyTemplate.id` real (22/22, ver teste
// de integridade em monsterLoot.test.ts).
//
// Fase 4 — Loot Signature: `preferredBases`/`preferredAffixes` SEMPRE
// começam como o `lootBias` REAL do `MonsterArchetype` do template
// (`lootidentity/archetypes.ts`, já usado de verdade pelo pipeline de
// drop — nunca um número novo). `preferredMaterials`/`preferredSpheres`/
// `preferredGems` sempre começam como a afinidade REAL já derivada por
// Facção na Sprint 26 (`enemyFaction/factionAffinity.ts`). Os 5
// exemplos literais do brief (Lobo/Esqueleto/Cultista/Aranha/Cavaleiro
// Negro) SOBRESCREVEM esse baseline com a assinatura descrita
// textualmente — a única parte autoral desta Sprint, documentada
// entrada por entrada abaixo. Nenhuma Base/Esfera/Gema/Material
// inventados: "garras"/"presas" (sem Base Item real) mapeiam pra
// `dagger`, mesma técnica já usada em `lootidentity/archetypes.ts`
// ("Claws -> Dagger"); "escudos" (sem Base Item real, nenhum "shield"
// existe em `itemgen/baseItems.ts`) mapeia pra `chest`/`helmet`
// (armadura defensiva real); "venenos" (Aranha) e "histórico"
// (Cavaleiro Negro) não têm nenhum Base Item/Esfera/Gema/Material real
// correspondente — omitidos por honestidade, nunca inventados
// (mesma disciplina de `archetypes.ts`: "Chaos"/"Mana" omitidos por
// não existirem como tag real). "Histórico" (Cavaleiro Negro) é lido,
// em vez disso, como justificativa pra `preferredLegendaryChance`
// elevado — nunca uma alteração em Legacy (`itemization/history.ts`),
// explicitamente protegido nesta Sprint.
//
// `preferredLegendaryChance`: 1 (neutro) pra todo monstro comum;
// elevado (1.5) só pros 4 templates com `futureFlags.isBoss: true`
// (sinal REAL já existente em `enemy/templates.ts` — nunca um novo
// campo "é chefe" inventado) — "boss"/"frost-king"/"corrupted-bishop"/
// "ancient-dragon".
//
// `preferredCurrency`: sempre o próprio `enemyTemplateId` — resolve
// pra um `MonsterEconomicProfile.id` (Fase 5, monsterEconomicProfile.ts),
// mesmo padrão de referência-por-id 1:1 já usado por
// `WorldRegion.dropProfile`/`EnemyFaction.economyProfile`.
function buildSignature(templateId: string, overrides: Partial<MonsterLootSignature> = {}): MonsterLootSignature {
  const template = ENEMY_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error(`Monster Loot Identity: Enemy Template desconhecido "${templateId}"`);

  const family = getFamilyForTemplate(templateId);
  if (!family) throw new Error(`Monster Loot Identity: "${templateId}" sem Enemy Family (Sprint 26)`);

  const archetype = getArchetype(template.archetype);
  if (!archetype) throw new Error(`Monster Loot Identity: Archetype desconhecido "${template.archetype}"`);

  return {
    id: templateId,
    enemyTemplateId: templateId,
    familyId: family.id,
    factionId: family.factionId,
    preferredBases: archetype.lootBias.baseItemAffinity,
    preferredAffixes: archetype.lootBias.affixAffinity,
    preferredMaterials: getFactionMaterialAffinity(family.factionId),
    preferredSpheres: getFactionSphereAffinity(family.factionId),
    preferredGems: getFactionGemAffinity(family.factionId),
    preferredLegendaryChance: template.futureFlags.isBoss ? 1.5 : 1,
    preferredCurrency: templateId,
    enabled: true,
    ...overrides,
  };
}

// Família Lobo ("Bases leves, garras, presas, gemas verdes"): garras/
// presas -> dagger (mesmo mapeamento de archetypes.ts); leves ->
// boots/belt (já reais no archetype "beast"); gemas verdes -> categoria
// "life" (fauna/natureza — a mesma afinidade real já herdada de
// Floresta na Sprint 25/26).
const WOLF_FAMILY_OVERRIDE: Partial<MonsterLootSignature> = {
  preferredBases: { dagger: 1.6, boots: 1.5, belt: 1.4 },
  preferredGems: { life: 1.5 },
};

// Família Esqueleto ("espadas, escudos, armaduras") — deliberadamente
// DIVERGE do baseline "undead" (staff/wand/ring, tema de conjurador) —
// um Esqueleto guerreiro é um monstro distinto do Bispo/Acólito
// Corrompido (mesmo archetype "undead", tema de clero corrompido,
// mantidos no baseline do archetype). "Escudos" (sem Base Item real)
// -> chest/helmet (armadura defensiva real).
const SKELETON_FAMILY_OVERRIDE: Partial<MonsterLootSignature> = {
  preferredBases: { sword: 1.5, chest: 1.5, helmet: 1.4 },
};

// Família Culto Corrompido ("amuletos, anéis, esferas") — refina o
// baseline "mage" (staff/wand/amulet): adiciona `ring` (ausente do
// archetype), remove staff/wand (o Cultista aqui é definido pelos
// acessórios rituais, não pela arma). `preferredSpheres` já herda
// Fortuna->Ruínas da Facção Cultistas (Sprint 25/26) — reforçado, não
// duplicado.
const CULTIST_FAMILY_OVERRIDE: Partial<MonsterLootSignature> = {
  preferredBases: { amulet: 1.6, ring: 1.5 },
};

// Família Aranha ("materiais, venenos, gemas") — "venenos" sem Base
// Item/Gema real correspondente, omitido (nunca inventado).
// `preferredMaterials` já herda os materiais de Floresta (Sprint 25)
// via Facção Bestas — mantido, só destacado aqui pra registrar a
// leitura textual do brief.
const SPIDER_OVERRIDE: Partial<MonsterLootSignature> = {};

// Família Cavaleiro Negro ("armaduras, espadas, histórico") — mesmo
// mapeamento de escudo/armadura da Família Esqueleto; "histórico" lido
// como justificativa de `preferredLegendaryChance` elevado (nunca uma
// alteração em Legacy).
const DARK_KNIGHT_FAMILY_OVERRIDE: Partial<MonsterLootSignature> = {
  preferredBases: { sword: 1.5, chest: 1.5, helmet: 1.4 },
  preferredLegendaryChance: 1.6,
};

export const MONSTER_LOOT_SIGNATURES: readonly MonsterLootSignature[] = [
  buildSignature("wolf", WOLF_FAMILY_OVERRIDE),
  buildSignature("wolf-alpha", WOLF_FAMILY_OVERRIDE),
  buildSignature("frost-wolf", WOLF_FAMILY_OVERRIDE),
  buildSignature("boar"),
  buildSignature("spider", SPIDER_OVERRIDE),
  buildSignature("hyena"),
  buildSignature("goblin"),
  buildSignature("skeleton", SKELETON_FAMILY_OVERRIDE),
  buildSignature("forgotten-guardian", SKELETON_FAMILY_OVERRIDE),
  buildSignature("bandit"),
  buildSignature("bandit_captain"),
  buildSignature("stone-construct"),
  buildSignature("ancient-construct"),
  buildSignature("ice-golem"),
  buildSignature("frost-king"),
  buildSignature("dark-knight", DARK_KNIGHT_FAMILY_OVERRIDE),
  buildSignature("boss", DARK_KNIGHT_FAMILY_OVERRIDE),
  buildSignature("swamp-witch", CULTIST_FAMILY_OVERRIDE),
  buildSignature("corrupted-acolyte", CULTIST_FAMILY_OVERRIDE),
  buildSignature("corrupted-bishop", CULTIST_FAMILY_OVERRIDE),
  buildSignature("fire-cultist", CULTIST_FAMILY_OVERRIDE),
  buildSignature("ancient-dragon"),
] as const;

export function getMonsterLootSignature(enemyTemplateId: string): MonsterLootSignature | undefined {
  return MONSTER_LOOT_SIGNATURES.find((signature) => signature.enemyTemplateId === enemyTemplateId);
}

export function listMonsterLootSignatures(): readonly MonsterLootSignature[] {
  return MONSTER_LOOT_SIGNATURES;
}

// Fase 3 — "Nenhum Enemy Template pode ficar sem registro": dado que
// falta, nunca lógica que falta (mesmo princípio de
// enemyFamilies.ts#listUnfamiliedTemplateIds). Vazio hoje: os 22
// templates reais estão todos cobertos.
export function listUnregisteredTemplateIds(): string[] {
  const registered = new Set(MONSTER_LOOT_SIGNATURES.map((s) => s.enemyTemplateId));
  return ENEMY_TEMPLATES.map((template) => template.id).filter((id) => !registered.has(id));
}
