import type { LootTable } from "./types.js";

// Loot Generator Phase I — requisito 1: uma Loot Table por entidade.
// Valores ilustrativos, não calibrados (mesma convenção de
// CRITICAL_HIT_CHANCE em packages/shared/src/items.ts e dos pesos de
// mod em itemgen/prefixes.ts) — balanceamento real é decisão futura de
// economia, fora do escopo desta Sprint.
//
// Adicionar um novo monstro (ou um novo baú) = inserir um novo registro
// nesta lista. Nenhuma outra parte do Loot Generator
// (lootgen/generator.ts) precisa mudar.
// Gameplay Balance & First Playable Experience Phase I — requisito 5:
// "nos primeiros minutos o jogador encontre upgrades frequentes...
// evitar longos períodos sem recompensa." Antes, a chance efetiva de
// achar QUALQUER item por abate de Wolf/Goblin era dropChance x P(qtd>0)
// = 0.35x0.35=12.25% / 0.4x0.4=16% — quase 1 item a cada 7-8 abates.
// dropChance e a distribuição de quantidade dos dois monstros iniciais
// foram aumentados pra ~1 item a cada 3 abates (dropChance 0.6/0.65 x
// P(qtd>0) 0.6/0.65 ≈ 36%/42%), sem alterar `rarityMultiplier` (a
// distribuição de raridade em si — common predominante, magic
// ocasional — já estava adequada, ver itemgen/rarities.ts).
export const LOOT_TABLES: LootTable[] = [
  {
    // dropChance ligeiramente maior que a do Goblin: o pool de itens do
    // Wolf (dagger/boots/belt, sem arma "pesada" — coerente com um
    // bicho não carregar espada) tem upgrades de menor impacto que o do
    // Goblin (que inclui "sword"), então bosque-sussurrante media uma
    // taxa de morte mensuravelmente maior que pantano-podre na
    // simulação (68% vs 24% em 400 execuções) — compensado aqui com
    // mais frequência de drop, já que mudar QUAIS itens o Wolf largaria
    // extrapolaria "só dados de balanceamento" pra "redesenho de
    // identidade de loot" (fora do escopo desta Sprint).
    id: "wolf",
    weight: 100,
    minLevel: 1,
    maxLevel: 14,
    itemLevelVariance: 2,
    dropChance: 0.7,
    allowedBaseItems: ["dagger", "boots", "belt"],
    baseItemWeights: { dagger: 40, boots: 35, belt: 25 },
    rarityMultiplier: 1.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 },
    ],
    seedOffset: 1001,
  },
  {
    id: "goblin",
    weight: 100,
    minLevel: 1,
    maxLevel: 18,
    itemLevelVariance: 2,
    dropChance: 0.65,
    allowedBaseItems: ["dagger", "sword", "ring"],
    baseItemWeights: { dagger: 35, sword: 35, ring: 30 },
    rarityMultiplier: 1.1,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 35 },
      { quantity: 1, weight: 60 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1002,
  },
  // Biomes, Regions & World Progression Phase I — requisito 3: "Ruínas:
  // Cajados, Anéis" — staff/ring adicionados com peso alto, mace/
  // helmet/chest mantidos com peso menor (variedade, não substituição
  // completa). Nenhuma mudança no Loot Generator, só pesos/allowedBaseItems.
  {
    id: "skeleton",
    weight: 100,
    minLevel: 10,
    maxLevel: 30,
    itemLevelVariance: 3,
    dropChance: 0.45,
    allowedBaseItems: ["mace", "helmet", "chest", "staff", "ring"],
    baseItemWeights: { mace: 15, helmet: 15, chest: 15, staff: 30, ring: 25 },
    rarityMultiplier: 1.2,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 55 },
      { quantity: 1, weight: 40 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1003,
  },
  {
    id: "bandit",
    weight: 100,
    minLevel: 15,
    maxLevel: 40,
    itemLevelVariance: 3,
    dropChance: 0.5,
    allowedBaseItems: ["axe", "bow", "gloves", "amulet"],
    baseItemWeights: { axe: 30, bow: 30, gloves: 20, amulet: 20 },
    rarityMultiplier: 1.3,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 50 },
      { quantity: 1, weight: 42 },
      { quantity: 2, weight: 8 },
    ],
    seedOffset: 1004,
  },
  {
    // Monster Loot Identity Phase I — "Bandit Captain": um novo monstro
    // (versão elite do Bandit), adicionado só como um registro de dados
    // aqui, exatamente como o cabeçalho deste arquivo promete. Existe
    // principalmente pra dar um exemplo real e testável de "monstro com
    // Rarity Bias próprio, mais forte que o do arquétipo" (ver
    // lootidentity/lootIdentities.ts).
    id: "bandit_captain",
    weight: 100,
    minLevel: 20,
    maxLevel: 45,
    itemLevelVariance: 3,
    dropChance: 0.6,
    allowedBaseItems: ["sword", "axe", "bow", "gloves", "amulet"],
    baseItemWeights: { sword: 30, axe: 25, bow: 25, gloves: 10, amulet: 10 },
    rarityMultiplier: 1.6,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 50 },
      { quantity: 2, weight: 40 },
      { quantity: 3, weight: 10 },
    ],
    seedOffset: 1005,
  },
  {
    // Baú do tesouro — id "treasure_chest" (não "chest") pra nunca se
    // confundir com o Base Item "chest" (peitoral), que é um id
    // completamente diferente de um registro completamente diferente
    // (ITEM_GEN_BASE_ITEMS).
    id: "treasure_chest",
    weight: 100,
    minLevel: 1,
    maxLevel: 60,
    itemLevelVariance: 1,
    dropChance: 1.0,
    allowedBaseItems: [
      "sword", "axe", "bow", "dagger", "staff", "wand", "mace",
      "helmet", "chest", "gloves", "boots",
      "ring", "amulet", "belt",
    ],
    baseItemWeights: {
      sword: 10, axe: 10, bow: 10, dagger: 10, staff: 10, wand: 10, mace: 10,
      helmet: 10, chest: 10, gloves: 10, boots: 10,
      ring: 10, amulet: 10, belt: 10,
    },
    rarityMultiplier: 1.5,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 25 },
      { quantity: 3, weight: 5 },
    ],
    seedOffset: 2001,
  },
  // Biomes, Regions & World Progression Phase I — requisito 3:
  // "Fortaleza: Armaduras Pesadas" — helmet/chest/gloves/boots com peso
  // bem maior que armas/acessórios, mesma lista de allowedBaseItems de
  // antes (só os pesos mudaram).
  {
    id: "boss",
    weight: 100,
    minLevel: 20,
    maxLevel: 80,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: [
      "sword", "axe", "bow", "dagger", "staff", "wand", "mace",
      "helmet", "chest", "gloves", "boots",
      "ring", "amulet", "belt",
    ],
    baseItemWeights: {
      sword: 6, axe: 6, bow: 6, dagger: 6, staff: 6, wand: 6, mace: 6,
      helmet: 16, chest: 18, gloves: 14, boots: 14,
      ring: 6, amulet: 6, belt: 4,
    },
    rarityMultiplier: 3.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 2, weight: 20 },
      { quantity: 3, weight: 50 },
      { quantity: 4, weight: 30 },
    ],
    seedOffset: 3001,
  },
  // Requisito 3 — Loot Regional do Bosque Sussurrante: "Arcos, Couro" —
  // Javali/Aranha favorecem bow + peças de armadura (boots/gloves,
  // aproximação de "couro" — Item Generator não tem material como
  // atributo próprio, ver nota em lootidentity/archetypes.ts sobre a
  // mesma limitação).
  {
    id: "boar",
    weight: 100,
    minLevel: 1,
    maxLevel: 14,
    itemLevelVariance: 2,
    dropChance: 0.6,
    allowedBaseItems: ["bow", "boots", "belt"],
    baseItemWeights: { bow: 45, boots: 35, belt: 20 },
    rarityMultiplier: 1.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 },
    ],
    seedOffset: 1006,
  },
  {
    id: "spider",
    weight: 100,
    minLevel: 1,
    maxLevel: 14,
    itemLevelVariance: 2,
    dropChance: 0.6,
    allowedBaseItems: ["bow", "dagger", "gloves"],
    baseItemWeights: { bow: 35, dagger: 35, gloves: 30 },
    rarityMultiplier: 1.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 },
    ],
    seedOffset: 1007,
  },
  // Requisito 3 — Colinas Áridas continuam favorecendo ouro (tema de
  // saque humano, já refletido no rarityMultiplier do Bandit) — Hiena
  // segue o mesmo espírito de itens ágeis (dagger/bow) do bioma.
  {
    id: "hyena",
    weight: 100,
    minLevel: 15,
    maxLevel: 45,
    itemLevelVariance: 3,
    dropChance: 0.5,
    allowedBaseItems: ["dagger", "bow", "boots"],
    baseItemWeights: { dagger: 35, bow: 35, boots: 30 },
    rarityMultiplier: 1.2,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 50 },
      { quantity: 1, weight: 45 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1008,
  },
  // Requisito 3 — Minas Abandonadas: "material de craft de metal" (doc)
  // vira, em termos de equipamento, viés em armadura pesada (mesmo tema
  // de "constructo de pedra" — chest/helmet/gloves).
  {
    id: "stone-construct",
    weight: 100,
    minLevel: 12,
    maxLevel: 25,
    itemLevelVariance: 2,
    dropChance: 0.55,
    allowedBaseItems: ["chest", "helmet", "gloves"],
    baseItemWeights: { chest: 40, helmet: 35, gloves: 25 },
    rarityMultiplier: 1.25,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 45 },
      { quantity: 1, weight: 50 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1009,
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2/4: uma Loot
  // Table por Mini-Boss, mesma convenção do "boss"/"treasure_chest"
  // (dropChance 1.0, quantityOptions sempre >= 1 — "loot especial"
  // garantido) — rarityMultiplier acima de qualquer inimigo comum da
  // própria região, mas abaixo do Boss final (3.0).
  {
    id: "wolf-alpha",
    weight: 100,
    minLevel: 1,
    maxLevel: 14,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["dagger", "boots", "belt", "ring"],
    baseItemWeights: { dagger: 30, boots: 25, belt: 20, ring: 25 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4001,
  },
  {
    id: "swamp-witch",
    weight: 100,
    minLevel: 1,
    maxLevel: 18,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["staff", "wand", "amulet", "ring"],
    baseItemWeights: { staff: 30, wand: 25, amulet: 25, ring: 20 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4002,
  },
  {
    id: "ancient-construct",
    weight: 100,
    minLevel: 12,
    maxLevel: 25,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["chest", "helmet", "gloves", "boots"],
    baseItemWeights: { chest: 30, helmet: 25, gloves: 25, boots: 20 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4003,
  },
  {
    id: "forgotten-guardian",
    weight: 100,
    minLevel: 10,
    maxLevel: 30,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["mace", "staff", "ring", "chest"],
    baseItemWeights: { mace: 25, staff: 30, ring: 25, chest: 20 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4004,
  },
  {
    id: "dark-knight",
    weight: 100,
    minLevel: 20,
    maxLevel: 80,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["sword", "mace", "chest", "helmet"],
    baseItemWeights: { sword: 30, mace: 25, chest: 25, helmet: 20 },
    rarityMultiplier: 2.2,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 60 },
      { quantity: 2, weight: 40 },
    ],
    seedOffset: 4005,
  },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 5: "Loot Table exclusiva... reutiliza o Loot Generator existente."
  // Distinta da tabela "forgotten-guardian" acima (o loot NORMAL de
  // qualquer encontro com o Guardião Esquecido, dentro ou fora de uma
  // Dungeon) — esta é a recompensa ADICIONAL exclusiva de completar o
  // papel de "Chefe Final" de uma Dungeon (ver dungeon/
  // dungeonController.ts), somada por cima do drop normal do abate.
  // `rarityMultiplier` bem mais alto (4.0, o dobro de dark-knight) +
  // `rarityWeightMultipliers.unique` extra aplicado na chamada
  // (dungeonController.ts) — "item único" garantido, não só provável.
  {
    id: "final-boss-relic",
    weight: 100,
    minLevel: 20,
    maxLevel: 60,
    itemLevelVariance: 3,
    dropChance: 1.0,
    allowedBaseItems: ["sword", "mace", "staff", "amulet"],
    baseItemWeights: { sword: 30, mace: 25, staff: 25, amulet: 20 },
    rarityMultiplier: 4.0,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 5001,
  },
];

export function getLootTable(id: string): LootTable | undefined {
  return LOOT_TABLES.find((table) => table.id === id);
}
