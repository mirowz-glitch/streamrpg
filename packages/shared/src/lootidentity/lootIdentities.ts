import type { MonsterLootIdentity } from "./types.js";

// Monster Loot Identity Phase I — um registro por CRIATURA de verdade
// (monsterId = mesmo id usado em lootgen/lootTables.ts). Cada uma
// referencia um Archetype (archetypes.ts) e opcionalmente refina o
// bias dele.
//
// "Chest" (baú do tesouro, treasure_chest) não é uma criatura — não
// recebe Loot Identity nesta fase, continua funcionando exatamente
// como no Loot Generator Phase I (chamar generateLoot("treasure_chest",
// ...) direto, sem passar por generateMonsterLoot()).
//
// Adicionar um novo monstro = criar seu Archetype (se ainda não
// existir) + inserir um novo registro nesta lista. Nenhuma outra parte
// desta camada (resolve.ts/generator.ts) precisa mudar.
export const MONSTER_LOOT_IDENTITIES: MonsterLootIdentity[] = [
  {
    monsterId: "wolf",
    archetypeId: "beast",
    // Exemplo literal da Sprint: "Wolf: Rare x0.5, Unique x0".
    lootBiasOverride: { rarityBias: { rare: 0.5, unique: 0 } },
  },
  {
    monsterId: "goblin",
    archetypeId: "humanoid",
  },
  {
    monsterId: "skeleton",
    archetypeId: "undead",
  },
  // Biomes, Regions & World Progression Phase I — requisito 2/3:
  // arquétipos já existentes reaproveitados (nenhum arquétipo novo
  // criado) — Beast pra Javali/Aranha/Hiena (mesmo de Wolf), Construct
  // pro Stone Construct.
  {
    monsterId: "boar",
    archetypeId: "beast",
  },
  {
    monsterId: "spider",
    archetypeId: "beast",
  },
  {
    monsterId: "hyena",
    archetypeId: "beast",
  },
  {
    monsterId: "stone-construct",
    archetypeId: "construct",
  },
  {
    monsterId: "bandit",
    archetypeId: "bandit",
  },
  {
    monsterId: "bandit_captain",
    archetypeId: "bandit",
    // Exemplo literal da Sprint: "Bandit Captain: Rare x2, Unique x0.2".
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.2 } },
  },
  {
    monsterId: "boss",
    archetypeId: "boss",
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2/4: um
  // registro por Mini-Boss, mesmo padrão de "Bandit Captain" (arquétipo
  // reaproveitado + sorte de raridade própria acima do arquétipo).
  // Elite (não listado aqui de propósito) não tem Loot Identity
  // própria — reaproveita a do Enemy Template normal sorteado (ver
  // enemy/lootIntegration.ts, que aplica o bônus por cima na hora).
  {
    monsterId: "wolf-alpha",
    archetypeId: "beast",
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.3 } },
  },
  {
    monsterId: "swamp-witch",
    archetypeId: "mage",
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.3 } },
  },
  {
    monsterId: "ancient-construct",
    archetypeId: "construct",
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.3 } },
  },
  {
    monsterId: "forgotten-guardian",
    archetypeId: "undead",
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.3 } },
  },
  {
    monsterId: "dark-knight",
    archetypeId: "humanoid",
    lootBiasOverride: { rarityBias: { rare: 2.5, unique: 0.5 } },
  },
];

export function getLootIdentity(monsterId: string): MonsterLootIdentity | undefined {
  return MONSTER_LOOT_IDENTITIES.find((identity) => identity.monsterId === monsterId);
}
